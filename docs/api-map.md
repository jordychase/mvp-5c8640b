# API Map · Screen → Hermes Endpoint

Every screen in the MVP, the endpoint(s) it would hit in production, and the TMT-built AI layer that sits on top. Auth is `Authorization: Bearer <token>` on every Hermes request.

## Hermes data model (quick refresher)

- **Company** → TMT, `purpose = LegalPlaintiff`
- **Project** → vertical/campaign (e.g. `tmt-proj-mva-2026`)
- **Patient** → one TMT case = one Hermes patient (the injured client)
- **Record Request** → one chase against one resolved Site (with med/billing/imaging booleans)
- **Site** → provider, with departments (medical / facility billing / physician billing / imaging / ER / anesthesiology)
- **Visit / Diagnosis / Procedure** → Hermes structured extraction from delivered records
- **Status flow** — `Pending → InfoConfirmed → SiteConfirmed → RequestSent → RequestConfirmed → Completed`. Failure branches: `AuthDenied`, `PaymentPending`, `FacilityRefusal`, `NoRecordFound`, `SiteClosed`.

---

## Screen → endpoint table

| Screen | Endpoint / Layer | Notes |
| ------ | ---------------- | ----- |
| **Login** | `POST /v0/auth` *(out of public spec)* | Bearer token returned, sent on every subsequent call. Roles: `customer_admin`, `customer_standard`, `customer_delivery`, `delivery`, `visits_only`. |
| **Dashboard · request KPIs** | `POST /v0/record-requests/browse` | Aggregate by `RequestStatus`. Multiple `where:` variants drive each tile. |
| **Dashboard · chart-grade KPIs** | TMT AI Layer (rollup) | Per-patient AI review aggregated to org level (avg grade, projected damages mid-band). |
| **Cases (list)** | `POST /v0/patients/browse` | `select` PatientFields, `where: { projectId }`, free-text via `search:`. |
| **Case detail** | `GET /v0/companies/{cid}/projects/{pid}/patients/{patid}` | Patient + nested authorization. |
| **Case detail · Record Requests tab** | `POST /v0/record-requests/browse` | `where: { patientId }`. |
| **Case detail · Chart Review tab** | TMT AI Layer (synthesis pipeline) | Inputs: Hermes `/visits/browse`, `/diagnoses/browse`, `/procedures/browse` + raw OCR'd deliverable text. Outputs: `grade`, `gradeNumeric`, `confidence`, `causation`, `treatmentChain`, `damages`, `preExisting`, `facts[]`, `gaps[]`, `recommendations[]`, `qa[]`. |
| **Case detail · Search Records tab** | TMT search index (built atop Hermes deliverables) | Pull deliverable PDFs via `GET .../deliverables/{filename}`, OCR + index page-level (Apache Tika → OpenSearch). Patient is tenant key. |
| **Case detail · Visits & Codes tab** | `POST /v0/visits/browse` `+ /v0/diagnoses/browse` `+ /v0/procedures/browse` `+ /v0/diagnosis-codes/browse` `+ /v0/procedure-codes/browse` | Hermes already structures encounter type, dates, ICD-10 dx, CPT procedures. Render as timeline + frequency tables. |
| **Case detail · Authorization tab** | `GET .../patients/{patid}/authorization` `+ POST /v0/auth-check/{filename}/retrigger` | Hermes auth-check returns `CheckStatus` (Passed / Failed / Warning) per dimension (signature, DOS, attestation, PHI match). |
| **Patient search-level toggle** | `PATCH .../patients/{patid}/search-level` | `SearchLevel = None \| SiteSonar \| PatientHistory`. PatientHistory finds all sites where the patient was ever seen (broadest). |
| **New case** | `POST /v0/companies/{cid}/projects/{pid}/patients` | Body = `PatientForm`. Required: firstName, lastName, dateOfBirth, sex. Plus DOS window, capacity, authType, ssn (mask in UI). |
| **Auth upload + check** | `PUT .../patients/{patid}/authorization` → `POST .../authorization/uploaded` | Multipart upload to presigned URL, then mark for approval. Auth-check runs automatically. |
| **New request · provider lookup** | `POST /v0/site-finder` | Body = `SiteResolutionInput` (name + addressLine1 required). Returns `{ jobId }`. Async. |
| **New request · poll site result** | `GET /v0/site-finder/jobs/{job_id}` | Status enum: `pending \| running \| completed \| failed`. |
| **New request · submit** | `POST .../patients/{patid}/record-requests` | Body = `RecordRequestForm`: `siteId` + `medicalRecord` / `billing` / `imaging` (≥1 true). |
| **Request detail** | `GET .../record-requests/{rid}` | Status timeline + RequestType array + DeliveryMethod history (`Fax`, `Email`, `Mail`, `RoiPortal`, `EhrPortal`, `RoiApi`, `EhrApi`, `SitePortal`). |
| **Per-request authorization** | `GET .../record-requests/{rid}/authorization` | Per-request auth-check (some sites require site-specific auth). |
| **Deliverables — list** | `GET .../record-requests/{rid}/deliverables` | Final delivered files. |
| **Deliverable — download** | `GET .../record-requests/{rid}/deliverables/{filename}` | Returns presigned S3 URL. |
| **Documents (working)** | `GET .../record-requests/{rid}/documents` | Working docs (cover sheets, follow-ups). Distinct from deliverables. |
| **Site detail** | `GET /v0/sites/{site_id}` | Site + departments (medical, facility billing, physician billing, imaging billing, ER, anesthesiology, imaging) — each can carry its own ROI/contact. |
| **Site research (AI)** | `POST /v0/sites/{site_id}/research` | AI background research (records contacts, fees, e-sig acceptance, request method). |
| **Sites browse** | `POST /v0/sites/browse` | Internal sites directory. |
| **Add note (request)** | `POST .../record-requests/{rid}/notes` | Team notes. PATCH/DELETE supported. |
| **Add note (case)** | `POST .../patients/{patid}/notes` | Team notes. |
| **Project files** | `PUT/GET .../projects/{pid}/{filename}` | Project-level docs (representation letter, request letter) — apply to every request. |
| **Patient queue (delivery role)** | `POST /v0/patients/queue` | Atomically claim next unowned patient — for back-office/delivery operators. |
| **Webhook ingest** | `POST /v0/webhooks` (consume only) | Stream status changes; wire to a worker → SSE for live dashboard. |
| **Sample chart page (rendered)** | TMT renderer (uses Hermes-extracted visit/dx/cpt + indexed text) | Reconstructs each chart page in-app — letterhead, PHI banner, body, ICD/CPT footer, Bates stamp, e-sig. |

---

## TMT AI Layer · ChartReview output contract

Lock this contract early — every dependent screen (Chart Review tab, dashboard chart-grade KPIs, per-request contribution panel) consumes this exact shape.

```json
{
  "patientId": "pat_1001",
  "lastRunAt": "2026-05-07T18:42:00Z",
  "grade": "A-",
  "gradeNumeric": 88,
  "confidence": 0.83,
  "summary": "...",
  "causation":      { "rating": "Strong | Moderate | Weak", "detail": "..." },
  "treatmentChain": { "rating": "Continuous | Sparse | Incomplete", "detail": "..." },
  "damages":        { "rating": "Catastrophic | Well-supported | Modest | Pending",
                      "low": 380000, "mid": 620000, "high": 940000, "detail": "..." },
  "preExisting":    { "rating": "Clean | Mild | Material", "detail": "..." },
  "facts":           [ "Documented LOC ~30 sec — ED note p.5", "..." ],
  "gaps":            [ "No neuropsych eval despite reported PCS", "..." ],
  "recommendations": [ "Order neuropsych battery", "..." ],
  "qa": [
    {
      "q": "Does this case have enough supporting facts to win?",
      "a": "...",
      "citations": [ { "page": 43, "visitId": "v_002" } ]
    }
  ]
}
```

---

## Recommended build sequence

### Phase 1 · Wire the portal
Replace fixtures with real Hermes calls. Auth, cases, requests, deliverables — read-side only.

- Auth (firm SSO via OIDC → bearer token)
- Cases list ← `/v0/patients/browse`
- Case detail ← `GET /v0/companies/.../patients/{patid}`
- Requests list/detail ← `/v0/record-requests/browse` + `GET .../record-requests/{rid}`
- Status pills + timeline from real `RequestStatus` history
- Deliverables download via presigned URL

### Phase 2 · Write paths + auth-check
Now we can create cases, upload auth, submit requests.

- `POST /v0/companies/.../patients` (`PatientForm`)
- `PUT .../authorization` → `POST .../authorization/uploaded`
- Auth-check polling + result rendering (4-dimension card grid)
- Site-finder flow: `POST /v0/site-finder` → `GET /v0/site-finder/jobs/{job_id}`
- `POST .../record-requests` with resolved `siteId` + booleans

### Phase 3 · Structured extraction + search
Light up Visits & Codes + Records Search.

- Visit timeline ← `/v0/visits/browse`
- ICD-10 + CPT tables ← `/v0/diagnoses/browse` + `/v0/procedures/browse`
- Build TMT search index: pull deliverables, OCR, page-index in OpenSearch
- Wire snippet hits with gold highlights + facet filters
- Set `patient.searchLevel` based on case type (`PATCH .../search-level`)

### Phase 4 · Agentic chart review
TMT-built layer. Triggered by Hermes webhook on `RequestStatus = Completed`.

- Webhook consumer worker (Hermes → SSE pipeline)
- ChartReview pipeline: prompt + structured extraction → `ChartReview` JSON
- Persist on a TMT-owned `chart_review` table, keyed by `patientId`, versioned
- Render Chart Review tab + dashboard chart-grade KPIs + per-request contribution
- RAG-backed Q&A with page citations

### Phase 5 · Scale + compliance
Multi-firm, audit, hardening.

- Audit log surface (PHI access)
- Role-based permissions (`customer_admin` / `customer_standard` / `visits_only`)
- Bulk import (CSV → `/v0/patients` batch creation)
- Reports: TAT histograms, grade distribution, AR aging on `PaymentPending`
- White-label per-firm — leverage Hermes `<sub>.himrecords.com` OR proxy via `records.themoneyteam.law`

---

## Architectural rule

Never store extracted clinical data twice. Hermes is the source of truth for visits/dx/procedures. The TMT search index and chart-review tables reference Hermes IDs (`visitId`, `patientId`, `siteId`) — they don't duplicate fields.
