#!/usr/bin/env python3
"""Build a single-file HTML handoff deck with screenshots embedded as base64.
Output: handoff/TMT-Records-MVP-Handoff.html
"""
import base64, os, html, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent
SHOTS = ROOT / "screens"
OUT   = ROOT / "TMT-Records-MVP-Handoff.html"

def b64(name):
    p = SHOTS / name
    if not p.exists():
        print(f"!! missing {name}", file=sys.stderr); return ""
    return "data:image/png;base64," + base64.b64encode(p.read_bytes()).decode("ascii")

# -------- Section content --------
COVER = {
    "eyebrow": "DEV HANDOFF · v1",
    "title":   "TMT Records",
    "sub":     "Medical Record Chase · MVP",
    "tagline": "Built on Hermes Health. Wrapped in The Money Team brand. Layered with agentic chart review.",
    "meta":    "Prepared 2026-05-09 · Confidential · Internal handoff",
}

# Brand tokens
COLORS = [
    ("BLACK",       "#0A0A0A", "Surface · 95% of brand"),
    ("GRAPHITE",    "#1F1F1F", "Cards / panels"),
    ("GOLD",        "#D4AF37", "Primary CTA · KPI numerals · accents"),
    ("GOLD BRIGHT", "#F2C744", "Hover / current state"),
    ("BONE",        "#F7F5EF", "Body text on dark"),
    ("TRUST BLUE",  "#1B3A57", "Secondary accents only"),
    ("ALERT RED",   "#B22222", "RESERVED — AuthDenied / FacilityRefusal / Cancel only"),
]

FONTS = [
    ("BEBAS NEUE", "Display + KPI numerals (tabular)", "Bebas Neue, Impact, sans-serif"),
    ("NEWSREADER", "Headings, hero copy", "Newsreader, Georgia, serif"),
    ("INTER",      "Body, UI, labels", "Inter, -apple-system, sans-serif"),
]

VOICE_DO = [
    "Confident, direct, swagger without arrogance",
    "Plain-spoken — speaks to consumers, not lawyers",
    "Plaintiff-side first: \"We represent you\"",
    "Empathetic to the injured, never weak",
]
VOICE_DONT = [
    "Stuffy mahogany-and-gold-leaf law firm",
    "Hedging, qualifying, apologetic phrasing",
    "Panicky urgency: \"ACT NOW!\"",
    "\"Specialist\" or \"expert\" without certification",
]

# Slide-walkthrough structure: (image, title, caption, endpoints[], notes)
SCREENS = [
    {
        "img": "01-login.png",
        "title": "Login",
        "kicker": "1 / 17",
        "caption": "Splash with the firm's voice up-front. Left rail carries the championship promise; right rail is the staff sign-in with the HIPAA notice. Dark gold meets clean form.",
        "endpoints": [("POST", "/v0/auth (out of public spec)", "Returns bearer token. Stored client-side; sent as Authorization: Bearer <token> on every subsequent call.")],
        "highlights": ["TCPA-style consent panel for HIPAA & access policies", "Mocked-only in MVP — wire firm Google Workspace OIDC at build time"],
    },
    {
        "img": "02-dashboard.png",
        "title": "Dashboard",
        "kicker": "2 / 17",
        "caption": "Above-the-fold action and 8-tile scoreboard. Top row blends Hermes status counts with TMT AI rollups (avg chart grade, projected book of damages). Second row is operational throughput.",
        "endpoints": [
            ("POST", "/v0/record-requests/browse", "Aggregate counts by RequestStatus drive every operational tile."),
            ("LAYER", "TMT AI rollup",             "Grade + projected damages aggregate per-patient ChartReview output."),
        ],
        "highlights": [
            "Recent Activity feed surfaces Hermes status changes from /record-requests/browse",
            "Needs Attention rail: filtered to AuthDenied / PaymentPending / FacilityRefusal — the brand keeps red reserved here",
        ],
    },
    {
        "img": "03-cases-list.png",
        "title": "Cases (Patients)",
        "kicker": "3 / 17",
        "caption": "Every TMT case = one Hermes patient. Search, matter-type filter, request count, open-vs-closed pill, auth status. One click to drill in.",
        "endpoints": [("POST", "/v0/patients/browse", "select PatientFields · where projectId · search free-text · take/skip pagination.")],
        "highlights": ["Auth-status pill driven by AuthorizationStatus (NeedsApproval, Approved, Missing, ...)", "Matter type stored in TMT-side metadata, not Hermes"],
    },
    {
        "img": "04-case-detail.png",
        "title": "Case Detail",
        "kicker": "4 / 17",
        "caption": "Gold-edge case header with the full PHI panel. Six tabs orient the workflow: Record Requests → Chart Review → Search Records → Visits & Codes → Authorization → Notes.",
        "endpoints": [
            ("GET",   "/v0/companies/{cid}/projects/{pid}/patients/{patid}", "Patient + nested authorization."),
            ("POST",  "/v0/record-requests/browse",                          "where: { patientId } — first tab."),
        ],
        "highlights": ["Mask SSN in lists; reveal only behind confirm-click", "Each tab maps to a different Hermes endpoint family"],
    },
    {
        "img": "05-chart-review-grade.png",
        "title": "Chart Review · Agentic AI",
        "kicker": "5 / 17",
        "caption": "The flagship TMT-built capability. Letter grade, courtroom confidence, projected damages range, supporting facts (page-cited), gaps, recommended next steps, and an 'Ask the Chart' Q&A — all driven by an LLM pipeline that consumes Hermes structured data.",
        "endpoints": [
            ("LAYER", "TMT AI Layer · ChartReview pipeline", "Ingests Hermes /visits/browse + /diagnoses/browse + /procedures/browse + raw OCR'd deliverable text. Emits ChartReview JSON (see contract on slide 13)."),
            ("TRIGGER", "Hermes webhook RequestStatus=Completed", "Fires the pipeline on every new delivery; reruns roll-up at the case level."),
        ],
        "highlights": [
            "Grade letter + 0-100 numeric for fine-grain sorting/filtering on dashboard",
            "Confidence is a courtroom-outcome score, not an extraction-confidence score",
            "Damages range is internal work product — UI carries the disclaimer inline",
            "Q&A panel: predefined prompts cover ~80% of attorney questions; free-form input handles the rest",
        ],
    },
    {
        "img": "06-search-records.png",
        "title": "Search Records · Keyword + Snippet",
        "kicker": "6 / 17",
        "caption": "Full-text search across every delivered chart for this patient. Snippet hits with gold highlights, page references, doc-type chips, and visit linkage. Quick-filter pills for the common queries (concussion, MRI lumbar, ESI, DAI…).",
        "endpoints": [
            ("LAYER", "TMT search index (built on Hermes deliverables)",
             "Pull deliverable PDFs via GET .../deliverables/{filename}, OCR + index page-level (Apache Tika + OpenSearch). Patient is the tenant key."),
            ("FACETS","Hermes structured data",
             "Visits + ICD-10 codes from /visits/browse + /diagnoses/browse become facets — narrow by visit, dx, doc type, site, date."),
        ],
        "highlights": ["Match-term pills make hit-context obvious", "Mark element highlights on hits — stays accessible", "Each result links back to the original PDF page"],
    },
    {
        "img": "07-visits-codes.png",
        "title": "Visits & Codes · Extracted by Hermes",
        "kicker": "7 / 17",
        "caption": "Hermes' structured extraction surfaces here as a proper visit timeline plus frequency tables for ICD-10 (diagnoses) and CPT (procedures). Hover any code chip for the full description.",
        "endpoints": [
            ("POST","/v0/visits/browse",            "Returns VisitFields: encounterType, claimType, service dates, site, payor."),
            ("POST","/v0/diagnoses/browse",         "DiagnosisFields linked by visitId."),
            ("POST","/v0/procedures/browse",        "ProcedureFields with CPT + modifiers + units + providers."),
            ("POST","/v0/diagnosis-codes/browse",   "Code dictionary — short + long descriptions + category."),
            ("POST","/v0/procedure-codes/browse",   "CPT dictionary."),
        ],
        "highlights": ["Visit timeline is the canonical 'medical chronology' for the demand letter", "Frequency tables drive damages narrative (e.g., 6 PT visits = ongoing care)"],
    },
    {
        "img": "04b-auth-tab.png",
        "title": "Authorization · AI Auth-Check",
        "kicker": "8 / 17",
        "caption": "Hermes runs a structured analysis of the uploaded HIPAA authorization PDF: signature presence, DOS coverage, attestation type, PHI match. Failures block the chase before it goes out — saves provider relationships.",
        "endpoints": [
            ("GET",   ".../patients/{patid}/authorization", "Returns CheckStatus per dimension."),
            ("POST",  "/v0/auth-check/{filename}/retrigger","Re-run analysis after a fix-up."),
            ("PATCH", ".../patients/{patid}/search-level",  "SearchLevel = None | SiteSonar | PatientHistory."),
        ],
        "highlights": ["AttestationType enum: Witnessed / Notarized / Unattested", "Auth-check returns Passed/Failed/Warning per check — UI surfaces all four"],
    },
    {
        "img": "08-new-case.png",
        "title": "New Case",
        "kicker": "9 / 17",
        "caption": "The form is the brand: Bebas Neue labels, gold focus rings, TCPA-style consent rail at the bottom. Required fields match Hermes's PatientForm; capacity options expose the full PatientCapacity enum.",
        "endpoints": [
            ("POST", "/v0/companies/{cid}/projects/{pid}/patients", "Body = PatientForm. Required: firstName, lastName, dateOfBirth, sex."),
            ("PUT",  ".../patients/{patid}/authorization",          "Multipart upload (presigned). Then POST .../authorization/uploaded to mark for approval."),
        ],
        "highlights": ["PatientCapacity = SelfAuthorizing / Minor / Deceased / Comatose / CognitivelyImpaired / LegallyIncapacitated / PowerOfAttorney", "AuthorizationType = Hipaa | Hitech"],
    },
    {
        "img": "09-new-request.png",
        "title": "New Record Request · Site Finder",
        "kicker": "10 / 17",
        "caption": "Two-step: (1) resolve the provider via Hermes site-finder (geocoding + embedding search + AI matching), (2) toggle medicalRecord/billing/imaging. The resolved site_id is what gets persisted on the request.",
        "endpoints": [
            ("POST","/v0/site-finder",                      "Body = SiteResolutionInput (name + addressLine1 required). Returns jobId."),
            ("GET", "/v0/site-finder/jobs/{job_id}",        "Poll until status = completed. Resolved site has stable site_id + departments + ROI metadata."),
            ("POST",".../patients/{patid}/record-requests", "Body = RecordRequestForm. siteId + medicalRecord/billing/imaging (≥1 true)."),
            ("POST","/v0/sites/{site_id}/research",         "Trigger AI background research for unfamiliar sites."),
        ],
        "highlights": ["Site finder returns ROI, fax, e-sig acceptance, and per-department contacts", "Three booleans match Hermes' RequestType: MedicalRecord, Billing, Imaging"],
    },
    {
        "img": "10-request-completed.png",
        "title": "Request Detail · Completed + Chart Contribution",
        "kicker": "11 / 17",
        "caption": "Status timeline (every node solid gold = completed). Deliverables card with download + 'Search this chart' shortcut. And the killer addition: per-chart contribution panel showing how this delivery moves the case-level grade.",
        "endpoints": [
            ("GET",   ".../record-requests/{rid}",                 "Single request + status timeline + RequestType array + DeliveryMethod history."),
            ("GET",   ".../record-requests/{rid}/deliverables",    "Final delivered files list."),
            ("GET",   ".../record-requests/{rid}/deliverables/{filename}", "Presigned S3 URL for the PDF."),
            ("GET",   ".../record-requests/{rid}/authorization",   "Per-request auth-check (some sites require site-specific auth)."),
            ("LAYER", "TMT AI Layer · per-chart contribution",      "Filters case-level review by visits sourced from this site."),
        ],
        "highlights": ["DeliveryMethod enum: Fax, Email, Mail, RoiPortal, EhrPortal, RoiApi, EhrApi, SitePortal", "Chart-contribution shows top dx codes from this delivery"],
    },
    {
        "img": "11-request-inflight.png",
        "title": "Request Detail · In-Flight",
        "kicker": "12 / 17",
        "caption": "Same shell, different status. The current step glows; provider follow-ups (reminders, payment requests) appear as timeline entries. No chart-contribution yet — unlocks at status = Completed.",
        "endpoints": [("WEBHOOK", "Hermes → TMT worker → SSE", "Status changes stream in real-time; portal updates without polling.")],
        "highlights": [
            "RequestStatus enum has 20 values — see fixtures.js STATUSES for the full tone map",
            "Failure branches (AuthDenied, PaymentPending, SiteClosed, FacilityRefusal, NoRecordFound) drive the dashboard's Needs Attention rail",
        ],
    },
    {
        "img": "13-chart-imaging.png",
        "title": "Chart Page · Imaging Report",
        "kicker": "13 / 17",
        "caption": "Click any search hit or thumbnail and you land here — a faithfully-rendered facsimile of a real medical record page. Letterhead, PHI banner, MRN/account/DOS, dictated body, ICD/CPT footer, e-sig line, Bates stamp.",
        "endpoints": [
            ("GET", ".../record-requests/{rid}/deliverables/{filename}", "Pulls the source PDF page from Hermes."),
            ("LAYER", "TMT renderer", "Reconstructs the page in-app from indexed text + Hermes-extracted visit/dx/cpt — so attorneys can read, search, and quote directly without context-switching to a PDF viewer."),
        ],
        "highlights": [
            "Each page carries a Bates stamp generated as TMT-{patient_seq}-{page} — locked at index time so legal cites are stable",
            "ICD-10 + CPT footer is auto-populated from /v0/diagnoses/browse + /v0/procedures/browse for that visit",
            "PROTECTED HEALTH INFORMATION watermark in alert red — required by HIPAA in any visible-on-screen rendering",
            "Page navigation (← / →) walks the entire chart sequentially",
        ],
    },
    {
        "img": "14-chart-ed-note.png",
        "title": "Chart Page · ED Triage Note",
        "kicker": "14 / 17",
        "caption": "Different document type, same template. Body breaks into clinical sections (HPI, exam, disposition). The chief complaint banner is filled from Hermes' visit extraction — no manual transcription.",
        "endpoints": [],
        "highlights": [
            "ED notes are the most demand-letter-cited doc type — design optimizes for grab-and-quote",
            "Section heading varies by docType (HPI/Exam vs Findings/Impression vs SOAP) — controlled by sectionHeadingFor()",
        ],
    },
    {
        "img": "15-chart-procedure.png",
        "title": "Chart Page · Procedure Note (ESI)",
        "kicker": "15 / 17",
        "caption": "Procedure notes get a Procedure heading and the CPT codes go front-and-center in the footer. ESIs and surgical notes are damages anchors — these are the pages the demand-letter is built around.",
        "endpoints": [],
        "highlights": [
            "CPT 62323 (lumbar epidural steroid injection) is the procedural anchor — case grade rises materially when these appear",
            "Renderer treats procedure notes the same as office visits — only the section heading + footer codes vary",
        ],
    },
    {
        "img": "12-handoff.png",
        "title": "Dev Handoff (in-app)",
        "kicker": "16 / 17",
        "caption": "Living spec, in the app itself. Every screen mapped to its Hermes endpoint(s), TMT AI layer architecture, the ChartReview JSON output contract, and the brand-token reference card. Open this first on day 1.",
        "endpoints": [],
        "highlights": ["Always-current — devs hit /handoff to see the full screen→endpoint map", "Includes the ChartReview JSON contract — lock it before building"],
    },
]

# Build sequence
PHASES = [
    ("PHASE 1 · WIRE THE PORTAL",
     "Replace fixtures with real Hermes calls. Auth, cases, requests, deliverables — read-side only.",
     ["Auth (firm SSO via OIDC → bearer token)",
      "Cases list ← /v0/patients/browse",
      "Case detail ← GET /v0/companies/.../patients/{patid}",
      "Requests list/detail ← /v0/record-requests/browse + GET .../record-requests/{rid}",
      "Status pills + timeline from real RequestStatus history",
      "Deliverables download via presigned URL"]),
    ("PHASE 2 · WRITE PATHS + AUTH-CHECK",
     "Now we can create cases, upload auth, submit requests.",
     ["POST /v0/companies/.../patients (PatientForm)",
      "PUT .../authorization → POST .../authorization/uploaded",
      "Auth-check polling + result rendering (4-dimension card grid)",
      "Site-finder flow: POST /v0/site-finder → GET /v0/site-finder/jobs/{job_id}",
      "POST .../record-requests with resolved siteId + booleans"]),
    ("PHASE 3 · STRUCTURED EXTRACTION + SEARCH",
     "Light up Visits & Codes + Records Search.",
     ["Visit timeline ← /v0/visits/browse",
      "ICD-10 + CPT tables ← /v0/diagnoses/browse + /v0/procedures/browse",
      "Build TMT search index: pull deliverables, OCR, page-index in OpenSearch",
      "Wire snippet hits with gold highlights + facet filters",
      "Set patient.searchLevel based on case type (PATCH .../search-level)"]),
    ("PHASE 4 · AGENTIC CHART REVIEW",
     "TMT-built layer. Triggered by Hermes webhook on RequestStatus=Completed.",
     ["Webhook consumer worker (Hermes → SSE pipeline)",
      "ChartReview pipeline: prompt + structured extraction → ChartReview JSON",
      "Persist on a TMT-owned ChartReview table, keyed by patientId, versioned",
      "Render Chart Review tab + dashboard chart-grade KPIs + per-request contribution",
      "RAG-backed Q&A with page citations"]),
    ("PHASE 5 · SCALE + COMPLIANCE",
     "Multi-firm, audit, hardening.",
     ["Audit log surface (PHI access)",
      "Role-based permissions (customer_admin / customer_standard / visits_only)",
      "Bulk import (CSV → /v0/patients batch creation)",
      "Reports: TAT histograms, grade distribution, AR aging on PaymentPending",
      "White-label per-firm — leverage Hermes <sub>.himrecords.com OR proxy via records.themoneyteam.law"]),
]

# IN MVP / NOT IN MVP
IN_MVP = [
    "Brand-true UI: black + gold, Bebas Neue / Newsreader / Inter",
    "Login splash, dashboard, cases, case detail with 6 tabs",
    "Chart Review (AI grade, confidence, facts, gaps, damages, Q&A)",
    "Records Search with snippet hits + quick filters",
    "Visits & Codes with ICD-10 + CPT frequency tables",
    "Site finder + 3-type record request flow",
    "Status timeline (gold node = current step)",
    "Deliverables panel with chart-contribution analysis",
    "Dev Handoff page (in-app, living spec)",
    "Fixture data shaped to real Hermes schemas (PatientForm, RecordRequestForm, RequestStatus, etc.)",
]
NOT_IN_MVP = [
    "Real Hermes API calls (everything is fixture-driven)",
    "Real auth (mock login — wire OIDC at build)",
    "Document/PDF viewer (links to download for now)",
    "Live webhook → SSE pipeline",
    "Bulk import (CSV)",
    "Reports / billing exports",
    "Audit log UI for PHI access",
    "Role-based permission boundaries (customer_admin vs customer_standard)",
    "AI Q&A is mocked with predefined answers — wire RAG in Phase 4",
    "Search uses substring matching — replace with OpenSearch in Phase 3",
]

# ChartReview JSON contract (rendered as <pre>)
CHART_REVIEW_JSON = '''{
  "patientId": "pat_1001",
  "lastRunAt": "2026-05-07T18:42:00Z",
  "grade": "A-",                     // A+ … F
  "gradeNumeric": 88,                // 0..100, fine-grain sortable
  "confidence": 0.83,                // 0..1, courtroom outcome confidence
  "summary": "...",                  // 2–3 sentence narrative
  "causation":      { "rating": "Strong | Moderate | Weak", "detail": "..." },
  "treatmentChain": { "rating": "Continuous | Sparse | Incomplete", "detail": "..." },
  "damages":        { "rating": "Catastrophic | Well-supported | Modest | Pending",
                      "low": 380000, "mid": 620000, "high": 940000, "detail": "..." },
  "preExisting":    { "rating": "Clean | Mild | Material", "detail": "..." },
  "facts":           [ "Documented LOC ~30 sec — ED note p.5", ... ],
  "gaps":            [ "No neuropsych eval despite reported PCS", ... ],
  "recommendations": [ "Order neuropsych battery", ... ],
  "qa": [
    { "q": "Does this case have enough supporting facts to win?",
      "a": "...",
      "citations": [{ "page": 43, "visitId": "v_002" }] }
  ]
}'''

# -------- HTML render --------
def img_block(name, alt):
    src = b64(name)
    if not src: return ""
    return f'<figure><img src="{src}" alt="{html.escape(alt)}" loading="lazy" /></figure>'

def render_screen(s):
    eps = ""
    if s["endpoints"]:
        eps = '<div class="api-block"><h4>API · LAYER</h4>' + "".join(
            f'<div class="api-row"><span class="verb {v}">{v}</span><code>{html.escape(p)}</code><span class="api-note">{html.escape(n)}</span></div>'
            for (v, p, n) in s["endpoints"]
        ) + "</div>"
    highs = ""
    if s["highlights"]:
        highs = '<div class="highlights"><h4>NOTES</h4><ul>' + "".join(f"<li>{html.escape(h)}</li>" for h in s["highlights"]) + "</ul></div>"
    return f"""
    <section class="slide screen">
      <div class="screen-text">
        <div class="kicker">{html.escape(s['kicker'])}</div>
        <h2>{html.escape(s['title'])}</h2>
        <p class="caption">{html.escape(s['caption'])}</p>
        {eps}
        {highs}
      </div>
      <div class="screen-img">
        {img_block(s['img'], s['title'])}
      </div>
    </section>
    """

# Now assemble the full HTML
title = "TMT Records · MVP Handoff"
deck_css = """
<style>
  :root {
    --black:#0A0A0A; --graphite:#1F1F1F; --graphite-2:#141414;
    --line:#2a2a2a; --gold:#D4AF37; --gold-bright:#F2C744; --gold-deep:#A6841C;
    --bone:#F7F5EF; --stone:#6B6B6B; --stone-2:#B8B8B8; --trust:#1B3A57;
    --alert:#B22222; --white:#FFFFFF;
  }
  * { box-sizing:border-box; }
  html,body { margin:0; padding:0; }
  body {
    background: var(--black); color: var(--bone);
    font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 15px; line-height: 1.6;
  }
  a { color: var(--gold); text-decoration:none; }
  a:hover { color: var(--gold-bright); }
  /* Slide layout */
  .deck { max-width: 1280px; margin: 0 auto; padding: 64px 48px; }
  .slide { padding: 48px 0; border-bottom: 1px dashed var(--line); }
  .slide:last-child { border-bottom: 0; }
  h1, h2, h3, h4 { color: var(--white); }
  .display { font-family: "Bebas Neue", Impact, sans-serif; letter-spacing: 0.02em; }
  .serif { font-family: "Newsreader", Georgia, serif; }
  .kicker { font-family:"Bebas Neue", sans-serif; letter-spacing:0.18em; color: var(--gold); font-size: 13px; margin-bottom: 6px; }
  .eyebrow { font-family:"Bebas Neue", sans-serif; letter-spacing:0.18em; color: var(--gold); font-size: 13px; }
  /* Cover */
  .cover {
    min-height: 92vh;
    display: grid; grid-template-columns: 1fr; align-content: space-between;
    padding: 80px 0;
    background: radial-gradient(ellipse at top left, rgba(212,175,55,0.18) 0%, transparent 60%), var(--graphite-2);
    border-radius: 4px;
    padding: 64px;
    border: 1px solid var(--line); border-top: 2px solid var(--gold);
  }
  .cover h1 {
    font-family: "Bebas Neue", sans-serif;
    font-size: 144px; line-height: 0.92; color: var(--white);
    margin: 24px 0 0;
  }
  .cover h1 .gold { color: var(--gold); display: block; }
  .cover .sub { font-family:"Newsreader", serif; font-size: 28px; color: var(--gold-bright); margin-top: 14px; }
  .cover .tag { font-family:"Newsreader", serif; font-style: italic; color: var(--stone-2); font-size: 18px; margin-top: 24px; max-width: 70ch; }
  .cover .meta { color: var(--stone); font-size: 12px; margin-top: 64px; letter-spacing: 0.06em; }
  .cover .scoreline { display: flex; gap: 48px; margin-top: 48px; }
  .cover .scoreline .num { font-family:"Bebas Neue"; font-size:54px; line-height:1; color: var(--gold); }
  .cover .scoreline .lbl { font-family:"Bebas Neue"; font-size:11px; letter-spacing:0.18em; color: var(--stone-2); }
  /* Section H */
  .section-head { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; margin-bottom:24px;}
  .section-head h2 { font-family: "Newsreader", serif; font-size: 40px; margin:0; }
  .section-head h2 .num { color: var(--gold); font-family:"Bebas Neue", sans-serif; font-size:32px; letter-spacing:0.04em; margin-right:14px; }
  .section-head .sub { color: var(--stone-2); font-size: 14px; max-width: 60ch; }
  /* Color swatch grid */
  .swatches { display:grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .swatch { background: var(--graphite-2); border:1px solid var(--line); border-radius: 4px; padding: 14px; }
  .swatch .chip { height: 60px; border-radius: 4px; border:1px solid rgba(255,255,255,0.06); margin-bottom: 10px; }
  .swatch .name { font-family:"Bebas Neue"; letter-spacing:0.16em; color: var(--gold); font-size: 12px; }
  .swatch .hex { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--bone); font-size: 13px; }
  .swatch .note { color: var(--stone); font-size: 11px; margin-top: 4px; }
  /* Type specimens */
  .type-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .type-card { background: var(--graphite-2); border:1px solid var(--line); border-radius:4px; padding: 18px; }
  .type-card h3 { margin:0 0 8px; font-family:"Bebas Neue"; letter-spacing: 0.14em; color: var(--gold); font-size: 14px; }
  .type-card .specimen { font-size: 38px; line-height:1; color: var(--white); }
  .type-card .role { color: var(--stone-2); font-size: 12px; margin-top: 8px; }
  /* Voice */
  .voice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .voice-card { background: var(--graphite-2); border:1px solid var(--line); border-radius: 4px; padding: 18px; }
  .voice-card h3 { margin: 0 0 12px; font-family:"Bebas Neue"; letter-spacing: 0.14em; font-size: 14px; }
  .voice-card.do h3 { color: var(--gold-bright); }
  .voice-card.dont h3 { color: #ff8a80; }
  .voice-card ul { padding-left:18px; margin: 0; line-height: 1.7; }
  /* Per-screen layout */
  .screen { display:grid; grid-template-columns: 5fr 7fr; gap: 32px; align-items: flex-start; }
  .screen-text h2 { font-family:"Newsreader", serif; font-size: 30px; margin: 0 0 12px; line-height: 1.2; }
  .screen-text .caption { color: var(--stone-2); font-size: 14px; line-height: 1.7; }
  .screen-img figure { margin: 0; border:1px solid var(--line); border-top: 2px solid var(--gold); border-radius: 4px; overflow: hidden; background: var(--black); box-shadow: 0 12px 28px rgba(0,0,0,0.5); }
  .screen-img img { width: 100%; display: block; }
  .api-block { margin-top: 18px; padding: 14px 16px; background: var(--graphite-2); border: 1px solid var(--line); border-radius: 4px; }
  .api-block h4 { margin: 0 0 10px; font-family:"Bebas Neue"; letter-spacing: 0.16em; color: var(--gold); font-size: 12px; }
  .api-row { display: grid; grid-template-columns: 80px 1fr; gap: 10px; padding: 8px 0; border-bottom: 1px dashed var(--line); align-items:start; }
  .api-row:last-child { border-bottom: 0; }
  .api-row .verb { font-family:"Bebas Neue"; letter-spacing:0.12em; font-size: 11px; padding: 3px 8px; border-radius: 4px; text-align: center; }
  .api-row .verb.GET    { background: rgba(212,175,55,0.12); color: var(--gold); }
  .api-row .verb.POST   { background: rgba(212,175,55,0.20); color: var(--gold-bright); }
  .api-row .verb.PUT    { background: rgba(27,58,87,0.40);  color: #aac; }
  .api-row .verb.PATCH  { background: rgba(247,245,239,0.10); color: var(--bone); }
  .api-row .verb.DELETE { background: rgba(178,34,34,0.20); color: #ff8a80; }
  .api-row .verb.LAYER  { background: rgba(212,175,55,0.06); color: var(--gold); border:1px dashed var(--gold-deep); }
  .api-row .verb.WEBHOOK,
  .api-row .verb.TRIGGER,
  .api-row .verb.FACETS { background: rgba(170,170,200,0.08); color: #aac; border: 1px dashed #444; }
  .api-row code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; color: var(--bone); }
  .api-row .api-note { display: block; color: var(--stone-2); font-size: 12px; margin-top: 4px; grid-column: 2; }
  .highlights { margin-top: 14px; padding: 14px 16px; background: rgba(212,175,55,0.04); border-left: 2px solid var(--gold); border-radius: 0 4px 4px 0; }
  .highlights h4 { margin: 0 0 8px; font-family:"Bebas Neue"; letter-spacing: 0.16em; color: var(--gold); font-size: 12px; }
  .highlights ul { padding-left: 18px; margin: 0; }
  .highlights li { color: var(--bone); font-size: 13px; line-height: 1.6; padding: 3px 0; }
  /* Architecture diagram */
  .arch {
    background: var(--graphite-2); border:1px solid var(--line); border-top: 2px solid var(--gold);
    border-radius:4px; padding: 28px;
    display: grid; grid-template-columns: 1fr 60px 1fr 60px 1fr; gap: 12px; align-items: center;
  }
  .arch-box { background: var(--black); border:1px solid var(--line); border-radius: 4px; padding: 18px; min-height: 180px; }
  .arch-box.gold { border-color: var(--gold); }
  .arch-box h3 { margin: 0; font-family:"Bebas Neue"; letter-spacing:0.16em; color: var(--gold); font-size: 14px; }
  .arch-box .label { font-family:"Bebas Neue"; color: var(--stone-2); font-size: 11px; letter-spacing: 0.18em; }
  .arch-box ul { padding-left: 18px; margin: 8px 0 0; font-size: 12px; color: var(--stone-2); line-height: 1.7; }
  .arch-arrow { font-family:"Bebas Neue"; color: var(--gold); font-size: 32px; text-align: center; }
  /* Phases */
  .phase { background: var(--graphite-2); border:1px solid var(--line); border-radius: 4px; padding: 18px 22px; margin-bottom: 14px; }
  .phase h3 { margin: 0; font-family:"Bebas Neue"; letter-spacing:0.16em; color: var(--gold); font-size: 16px; }
  .phase .lead { color: var(--bone); font-size: 14px; margin: 8px 0 12px; }
  .phase ul { padding-left: 20px; margin: 0; }
  .phase li { color: var(--stone-2); font-size: 13px; line-height: 1.7; }
  /* In/Not lists */
  .in-out { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .in-out .card { background: var(--graphite-2); border:1px solid var(--line); border-radius: 4px; padding: 22px; }
  .in-out .card.in { border-top: 2px solid var(--gold); }
  .in-out .card.out { border-top: 2px solid #444; }
  .in-out h3 { margin: 0 0 14px; font-family:"Bebas Neue"; letter-spacing:0.16em; font-size: 14px; }
  .in-out .in h3 { color: var(--gold-bright); }
  .in-out .out h3 { color: var(--stone-2); }
  .in-out ul { padding-left: 0; margin: 0; list-style: none; }
  .in-out li { display: grid; grid-template-columns: 22px 1fr; gap: 8px; padding: 8px 0; border-bottom: 1px dashed var(--line); color: var(--bone); font-size: 13px; line-height: 1.6; }
  .in-out .in li::before { content: "✓"; font-family:"Bebas Neue"; color: var(--gold); font-size: 18px; }
  .in-out .out li::before { content: "—"; font-family:"Bebas Neue"; color: var(--stone); font-size: 18px; }
  /* Code block */
  pre.contract { background: var(--black); border:1px solid var(--line); border-radius: 4px; padding: 18px; overflow:auto; font-size: 12px; color: var(--bone); line-height: 1.6; }
  pre.contract .c { color: #888; }
  /* TOC nav */
  .toc {
    position: sticky; top: 0;
    background: rgba(10,10,10,0.95);
    border-bottom: 1px solid var(--line);
    padding: 12px 24px;
    z-index: 50;
    backdrop-filter: blur(8px);
  }
  .toc-inner { max-width:1280px; margin: 0 auto; display: flex; flex-wrap: wrap; gap: 4px 12px; align-items:center; }
  .toc .label { font-family:"Bebas Neue"; letter-spacing:0.18em; color: var(--gold); font-size: 11px; margin-right: 12px; }
  .toc a { font-size: 11px; padding: 4px 8px; color: var(--stone-2); border-radius: 4px; }
  .toc a:hover { background: rgba(212,175,55,0.08); color: var(--gold); }
  .footer-disclaimer { color: var(--stone); font-size: 11px; line-height: 1.7; padding: 24px 0 0; border-top: 1px solid var(--line); margin-top: 32px; }
  @media print {
    .toc { display: none; }
    .deck { padding: 0; }
    .slide { page-break-inside: avoid; }
    .screen { page-break-inside: avoid; }
  }
</style>
"""

# Build HTML
def build():
    parts = [f"""<!doctype html>
<html lang="en"><head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700&family=Newsreader:ital,wght@0,400;0,600;0,700;1,400&display=swap" rel="stylesheet">
{deck_css}
</head><body>
<nav class="toc"><div class="toc-inner">
  <span class="label">TMT RECORDS · MVP HANDOFF</span>
  <a href="#cover">Cover</a>
  <a href="#brand">Brand</a>
  <a href="#ia">IA</a>
  <a href="#arch">Architecture</a>
  <a href="#screens">Screens</a>
  <a href="#contract">JSON Contract</a>
  <a href="#mvp-scope">In / Out</a>
  <a href="#phases">Build Plan</a>
</div></nav>
<main class="deck">
"""]

    # Cover
    parts.append(f"""
  <section id="cover" class="slide cover">
    <div>
      <div class="eyebrow">{html.escape(COVER['eyebrow'])}</div>
      <h1>TMT <span class="gold">RECORDS.</span></h1>
      <div class="sub">{html.escape(COVER['sub'])}</div>
      <div class="tag">{html.escape(COVER['tagline'])}</div>
    </div>
    <div class="scoreline">
      <div><div class="num">13</div><div class="lbl">Screens</div></div>
      <div><div class="num">29</div><div class="lbl">Hermes Endpoints</div></div>
      <div><div class="num">3</div><div class="lbl">TMT AI Layer</div></div>
      <div><div class="num">5</div><div class="lbl">Build Phases</div></div>
    </div>
    <div class="meta">{html.escape(COVER['meta'])}</div>
  </section>
""")

    # Brand
    swatch_html = "".join(
        f'<div class="swatch"><div class="chip" style="background:{hexv}"></div><div class="name">{n}</div><div class="hex">{hexv}</div><div class="note">{note}</div></div>'
        for (n, hexv, note) in COLORS
    )
    type_html = "".join(
        f'<div class="type-card"><h3>{n}</h3><div class="specimen" style="font-family:{stack}">$1B+ Awarded</div><div class="role">{role}</div></div>'
        for (n, role, stack) in FONTS
    )
    voice_do_html = "".join(f"<li>{html.escape(v)}</li>" for v in VOICE_DO)
    voice_dont_html = "".join(f"<li>{html.escape(v)}</li>" for v in VOICE_DONT)

    parts.append(f"""
  <section id="brand" class="slide">
    <div class="section-head">
      <div><h2><span class="num">01</span> Brand foundation</h2></div>
      <div class="sub">95% Black + Gold. Red is reserved. Bebas Neue / Newsreader / Inter. Championship swagger meets plaintiff-side authority.</div>
    </div>
    <h3 class="kicker" style="color:var(--gold)">PALETTE</h3>
    <div class="swatches">{swatch_html}</div>
    <h3 class="kicker mt-24" style="color:var(--gold); margin-top:32px">TYPE</h3>
    <div class="type-grid">{type_html}</div>
    <h3 class="kicker" style="color:var(--gold); margin-top:32px">VOICE — championship-grade plain English</h3>
    <div class="voice-grid">
      <div class="voice-card do"><h3>✓ DO</h3><ul>{voice_do_html}</ul>
        <p class="serif" style="margin-top:14px; font-style:italic; color:var(--gold-bright)">"After a wreck, your job is to heal. Ours is to win."</p>
      </div>
      <div class="voice-card dont"><h3>✗ DON'T</h3><ul>{voice_dont_html}</ul>
        <p class="serif" style="margin-top:14px; font-style:italic; color:#ff8a80">"We may be able to help you pursue compensation for your injuries."</p>
      </div>
    </div>
  </section>
""")

    # IA
    parts.append("""
  <section id="ia" class="slide">
    <div class="section-head">
      <div><h2><span class="num">02</span> Information architecture</h2></div>
      <div class="sub">Hash-routed SPA. Six tabs on the case file are where the workflow lives.</div>
    </div>
    <pre class="contract" style="font-family:'Newsreader', serif; font-size:14px; line-height:1.8; color:var(--bone)">
Login                            #/login
Dashboard                        #/                          ← scoreboard, recent activity, needs-attention rail
Cases (= Hermes patients)        #/cases
  └ Case detail                  #/cases/:id
      ├ Record Requests          tab=0  ← chases against providers
      ├ Chart Review (AI)        tab=1  ← grade, confidence, facts/gaps, Q&A
      ├ Search Records           tab=2  ← keyword search across delivered charts
      ├ Visits & Codes           tab=3  ← extracted timeline, ICD-10, CPT
      ├ Authorization            tab=4  ← AI auth-check + search level
      └ Notes                    tab=5
  └ New case                     #/cases/new
  └ New record request           #/cases/:id/requests/new    ← site-finder + 3-type toggles
Requests (all, cross-case)       #/requests
  └ Request detail               #/requests/:id              ← timeline + deliverables + chart contribution
Dev Handoff (in-app spec)        #/handoff
    </pre>
  </section>
""")

    # Architecture diagram
    parts.append("""
  <section id="arch" class="slide">
    <div class="section-head">
      <div><h2><span class="num">03</span> Architecture · Hermes + TMT AI Layer</h2></div>
      <div class="sub">Hermes is the records engine. Hermes' structured extraction (visits / dx / cpt) feeds two TMT-built layers: page-level search and an agentic chart-review pipeline.</div>
    </div>
    <div class="arch">
      <div class="arch-box">
        <div class="label">SOURCE</div>
        <h3>HERMES HEALTH</h3>
        <ul>
          <li>Provider site finder</li>
          <li>Authorization upload + auth-check</li>
          <li>Record-request orchestration</li>
          <li>Status pipeline (20 states)</li>
          <li>Deliverable PDFs</li>
          <li><b style="color:var(--gold)">Structured extraction:</b> visits, dx (ICD-10), procedures (CPT)</li>
          <li>Webhooks on status change</li>
        </ul>
      </div>
      <div class="arch-arrow">→</div>
      <div class="arch-box gold">
        <div class="label">TMT — DATA LAYER</div>
        <h3>SEARCH INDEX</h3>
        <ul>
          <li>Pull each deliverable PDF</li>
          <li>OCR + page-level index (Tika → OpenSearch)</li>
          <li>Patient = tenant key</li>
          <li>Facets: visit, dx, doc type, site, date</li>
        </ul>
      </div>
      <div class="arch-arrow">→</div>
      <div class="arch-box gold">
        <div class="label">TMT — INTELLIGENCE</div>
        <h3>CHART REVIEW · AGENTIC</h3>
        <ul>
          <li>Triggered on RequestStatus = Completed (webhook)</li>
          <li>LLM pipeline ingests Hermes structured data + OCR'd text</li>
          <li>Emits ChartReview JSON (next slide)</li>
          <li>Stored on TMT-owned <code>chart_review</code> table, versioned</li>
          <li>Powers grade, confidence, facts/gaps, Q&A</li>
        </ul>
      </div>
    </div>
    <p class="caption" style="color:var(--stone-2); margin-top:20px; font-size:13px;">
      <b style="color:var(--gold)">Architectural rule:</b> never store extracted clinical data twice. Hermes is the source of truth for visits/dx/procedures.
      The TMT search index and chart-review tables reference Hermes IDs (visitId, patientId, siteId) — they don't duplicate fields.
    </p>
  </section>
""")

    # Screens walkthrough
    parts.append('<section id="screens" class="slide"><div class="section-head"><div><h2><span class="num">04</span> Screen-by-screen</h2></div><div class="sub">Each screen + its caption + the Hermes endpoint(s) and/or TMT layer it consumes.</div></div></section>')
    for s in SCREENS:
        parts.append(render_screen(s))

    # JSON contract
    parts.append(f"""
  <section id="contract" class="slide">
    <div class="section-head">
      <div><h2><span class="num">05</span> ChartReview JSON · output contract</h2></div>
      <div class="sub">Lock this contract early. Every dependent screen (Chart Review tab, dashboard chart-grade KPIs, per-request contribution panel) consumes this exact shape.</div>
    </div>
    <pre class="contract">{html.escape(CHART_REVIEW_JSON)}</pre>
  </section>
""")

    # In / Out of MVP
    in_html  = "".join(f"<li>{html.escape(x)}</li>" for x in IN_MVP)
    out_html = "".join(f"<li>{html.escape(x)}</li>" for x in NOT_IN_MVP)
    parts.append(f"""
  <section id="mvp-scope" class="slide">
    <div class="section-head">
      <div><h2><span class="num">06</span> Scope · what's in, what's not</h2></div>
      <div class="sub">The MVP is fixture-driven. Everything below the "in" line is real UI; everything below the "out" line is dev's to build next.</div>
    </div>
    <div class="in-out">
      <div class="card in"><h3>✓ IN MVP</h3><ul>{in_html}</ul></div>
      <div class="card out"><h3>— NOT IN MVP (build next)</h3><ul>{out_html}</ul></div>
    </div>
  </section>
""")

    # Phases
    phase_html = ""
    for (h, lead, items) in PHASES:
        phase_html += f'<div class="phase"><h3>{html.escape(h)}</h3><div class="lead">{html.escape(lead)}</div><ul>' + "".join(f"<li>{html.escape(it)}</li>" for it in items) + "</ul></div>"
    parts.append(f"""
  <section id="phases" class="slide">
    <div class="section-head">
      <div><h2><span class="num">07</span> Recommended build sequence</h2></div>
      <div class="sub">Five phases. Read-side first, then write-side, then extraction + search, then the AI layer, then scale + compliance.</div>
    </div>
    {phase_html}
  </section>
""")

    # Footer
    parts.append("""
  <section class="slide">
    <div class="section-head"><div><h2><span class="num">08</span> Files in this package</h2></div></div>
    <pre class="contract">tmt-records-portal/
├── index.html              ← shell + Google Fonts
├── styles.css              ← brand tokens + every component
├── fixtures.js             ← Hermes-shaped data + visits, dx, cpt, chart pages, AI reviews
├── app.js                  ← hash router + every view (vanilla JS, ~1200 lines)
├── README.md               ← run instructions + Hermes endpoint map
└── handoff/
    ├── TMT-Records-MVP-Handoff.html   ← THIS deck (single file, embedded screenshots)
    ├── build_deck.py       ← regenerates this deck from /screens
    └── screens/            ← PNGs from headless Chrome at 1440px wide

Run locally:  cd tmt-records-portal && python3 -m http.server 8080
Open:         http://localhost:8080
URL flags:    ?skipAuth=1   bypass login  ·  &tab=N   deep-link a case-detail tab  ·  &q=...   pre-fill search</pre>
    <div class="footer-disclaimer">
      Attorney Advertising. Past results do not guarantee future outcomes. Testimonials do not constitute a guarantee, warranty, or prediction regarding the outcome of your legal matter.
      Internal records platform for The Money Team Law Firm. Powered by Hermes Health API. Confidential — for development handoff only.
    </div>
  </section>
""")

    parts.append("</main></body></html>")

    OUT.write_text("\n".join(parts))
    print(f"Wrote {OUT} · {OUT.stat().st_size/1024:.1f} KB")

if __name__ == "__main__":
    build()
