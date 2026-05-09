/* fixtures.js — sample data shaped to Hermes Health API schemas.
   Replace with live API calls in dev. Field names mirror Hermes contracts so
   handoff is a swap, not a rewrite. */

window.TMT_FIXTURES = (() => {
  const COMPANY_ID = "tmt-co-001"; // The Money Team Law Firm (legal-plaintiff)
  const PROJECT_ID = "tmt-proj-mva-2026";
  const TODAY = new Date("2026-05-08");

  // RequestStatus enum from Hermes OpenAPI
  const STATUSES = {
    Pending:           { label: "Pending",            tone: "muted" },
    InfoConfirmed:     { label: "Info Confirmed",     tone: "live" },
    SiteConfirmed:     { label: "Site Confirmed",     tone: "live" },
    RequestSent:       { label: "Request Sent",       tone: "live" },
    RequestConfirmed:  { label: "Request Confirmed",  tone: "live" },
    MailOnly:          { label: "Mail Only",          tone: "warn" },
    AuthDenied:        { label: "Auth Denied",        tone: "alert" },
    WrongSiteName:     { label: "Wrong Site",         tone: "warn" },
    PaymentPending:    { label: "Payment Pending",    tone: "warn" },
    NeedSiteSpecificAuth: { label: "Need Site-Specific Auth", tone: "warn" },
    PatientNotFound:   { label: "Patient Not Found",  tone: "alert" },
    ServiceDatesNotFound: { label: "Service Dates Not Found", tone: "warn" },
    SiteClosed:        { label: "Site Closed",        tone: "alert" },
    Canceled:          { label: "Canceled",           tone: "muted" },
    DuplicateRequest:  { label: "Duplicate",          tone: "muted" },
    Resubmitted:       { label: "Resubmitted",        tone: "live" },
    Partial:           { label: "Partial",            tone: "ok" },
    Completed:         { label: "Completed",          tone: "done" },
    FacilityRefusal:   { label: "Facility Refused",   tone: "alert" },
    NoRecordFound:     { label: "No Records Found",   tone: "muted" },
  };

  // Site fixtures — what Hermes returns from /v0/sites/{site_id}
  const SITES = [
    { id: "site_001", name: "Banner Desert Medical Center", addressLine1: "1400 S Dobson Rd", city: "Mesa", state: "AZ", zip: "85202", primarySpecialty: "Hospital", recordsFax: "(480) 412-3050" },
    { id: "site_002", name: "Dignity Health St. Joseph's Hospital", addressLine1: "350 W Thomas Rd", city: "Phoenix", state: "AZ", zip: "85013", primarySpecialty: "Trauma Center", recordsFax: "(602) 406-3001" },
    { id: "site_003", name: "OrthoArizona — Mesa", addressLine1: "1432 S Dobson Rd Ste 102", city: "Mesa", state: "AZ", zip: "85202", primarySpecialty: "Orthopedics", recordsFax: "(480) 449-9220" },
    { id: "site_004", name: "Sunrise Imaging — Tempe", addressLine1: "2200 S Mill Ave", city: "Tempe", state: "AZ", zip: "85282", primarySpecialty: "Diagnostic Imaging", recordsFax: "(480) 967-1100" },
    { id: "site_005", name: "Banner Boswell Medical Center", addressLine1: "10401 W Thunderbird Blvd", city: "Sun City", state: "AZ", zip: "85351", primarySpecialty: "Hospital", recordsFax: "(623) 832-4000" },
  ];

  // Patient fixtures — shape mirrors PatientForm + read-back fields
  const PATIENTS = [
    {
      id: "pat_1001",
      firstName: "Marcus", lastName: "Reyna",
      dateOfBirth: "1989-04-12",
      sex: "male",
      mobile: "(602) 555-0184",
      email: "m.reyna@example.com",
      socialSecurityNumber: "***-**-3492",
      startDateOfService: "2025-11-04",
      endDateOfService: "2026-02-22",
      authorizationExpirationDate: "2027-02-22",
      authorizationType: "Hipaa",
      capacity: "SelfAuthorizing",
      authStatus: "Approved",
      matterType: "Motor Vehicle",
      attorney: "J. Vega",
      createdAt: "2026-01-14",
    },
    {
      id: "pat_1002",
      firstName: "Aniyah", lastName: "Brooks",
      dateOfBirth: "1976-08-30",
      sex: "female",
      mobile: "(480) 555-2210",
      email: "abrooks@example.com",
      socialSecurityNumber: "***-**-1187",
      startDateOfService: "2025-09-19",
      endDateOfService: "2026-04-30",
      authorizationExpirationDate: "2027-04-30",
      authorizationType: "Hipaa",
      capacity: "SelfAuthorizing",
      authStatus: "Approved",
      matterType: "Trucking",
      attorney: "T. Mayweather",
      createdAt: "2026-02-02",
    },
    {
      id: "pat_1003",
      firstName: "Eli", lastName: "Dempsey",
      dateOfBirth: "2014-06-02",
      sex: "male",
      mobile: null,
      email: null,
      socialSecurityNumber: null,
      startDateOfService: "2026-01-22",
      endDateOfService: "2026-04-12",
      authorizationExpirationDate: "2027-04-12",
      authorizationType: "Hipaa",
      capacity: "Minor",
      authStatus: "Approved",
      matterType: "Catastrophic Injury",
      attorney: "J. Vega",
      createdAt: "2026-03-10",
    },
    {
      id: "pat_1004",
      firstName: "Priya", lastName: "Nair",
      dateOfBirth: "1992-12-19",
      sex: "female",
      mobile: "(623) 555-7710",
      email: "priya.nair@example.com",
      socialSecurityNumber: "***-**-7720",
      startDateOfService: "2026-03-08",
      endDateOfService: null,
      authorizationExpirationDate: "2027-04-01",
      authorizationType: "Hipaa",
      capacity: "SelfAuthorizing",
      authStatus: "NeedsApproval",
      matterType: "Rideshare",
      attorney: "T. Mayweather",
      createdAt: "2026-04-01",
    },
    {
      id: "pat_1005",
      firstName: "Daniel", lastName: "Okafor",
      dateOfBirth: "1968-03-05",
      sex: "male",
      mobile: "(480) 555-3301",
      email: "dokafor@example.com",
      socialSecurityNumber: "***-**-4400",
      startDateOfService: "2025-07-10",
      endDateOfService: "2026-01-30",
      authorizationExpirationDate: "2027-01-30",
      authorizationType: "Hipaa",
      capacity: "SelfAuthorizing",
      authStatus: "Approved",
      matterType: "Premises",
      attorney: "L. Quinn",
      createdAt: "2025-12-20",
    },
  ];

  // Record requests — shape mirrors POST .../record-requests + RequestStatus
  // Each has medicalRecord/billing/imaging booleans, siteId, status timeline
  const REQUESTS = [
    {
      id: "rr_5001", patientId: "pat_1001", siteId: "site_001",
      medicalRecord: true, billing: true, imaging: false,
      status: "Completed",
      createdAt: "2026-02-01", updatedAt: "2026-03-04",
      pages: 312,
      timeline: [
        { ts: "2026-02-01", what: "Request Created",     status: "Pending",         by: "Sarah Chen" },
        { ts: "2026-02-02", what: "Patient Info Confirmed", status: "InfoConfirmed", by: "Hermes" },
        { ts: "2026-02-03", what: "Provider Verified",    status: "SiteConfirmed",   by: "Hermes" },
        { ts: "2026-02-05", what: "Submitted to Provider", status: "RequestSent",    by: "Hermes" },
        { ts: "2026-02-12", what: "Provider Acknowledged", status: "RequestConfirmed", by: "Hermes" },
        { ts: "2026-03-04", what: "Records Delivered (312 pages)", status: "Completed", by: "Hermes" },
      ],
    },
    {
      id: "rr_5002", patientId: "pat_1001", siteId: "site_003",
      medicalRecord: true, billing: false, imaging: false,
      status: "RequestSent",
      createdAt: "2026-02-18", updatedAt: "2026-04-22",
      timeline: [
        { ts: "2026-02-18", what: "Request Created",     status: "Pending",         by: "Sarah Chen" },
        { ts: "2026-02-19", what: "Patient Info Confirmed", status: "InfoConfirmed", by: "Hermes" },
        { ts: "2026-02-21", what: "Provider Verified",    status: "SiteConfirmed",   by: "Hermes" },
        { ts: "2026-02-23", what: "Submitted to Provider", status: "RequestSent",    by: "Hermes" },
        { ts: "2026-04-22", what: "Reminder sent — provider unresponsive", status: "RequestSent", by: "Hermes" },
      ],
    },
    {
      id: "rr_5003", patientId: "pat_1001", siteId: "site_004",
      medicalRecord: false, billing: false, imaging: true,
      status: "PaymentPending",
      createdAt: "2026-03-12", updatedAt: "2026-04-30",
      timeline: [
        { ts: "2026-03-12", what: "Request Created",     status: "Pending",         by: "Sarah Chen" },
        { ts: "2026-03-13", what: "Patient Info Confirmed", status: "InfoConfirmed", by: "Hermes" },
        { ts: "2026-03-14", what: "Provider Verified",    status: "SiteConfirmed",   by: "Hermes" },
        { ts: "2026-03-18", what: "Submitted to Provider", status: "RequestSent",    by: "Hermes" },
        { ts: "2026-04-30", what: "Provider invoice received — $94.50", status: "PaymentPending", by: "Hermes" },
      ],
    },
    {
      id: "rr_5004", patientId: "pat_1002", siteId: "site_002",
      medicalRecord: true, billing: true, imaging: true,
      status: "RequestConfirmed",
      createdAt: "2026-02-10", updatedAt: "2026-04-12",
      timeline: [
        { ts: "2026-02-10", what: "Request Created",     status: "Pending",         by: "Sarah Chen" },
        { ts: "2026-02-12", what: "Patient Info Confirmed", status: "InfoConfirmed", by: "Hermes" },
        { ts: "2026-02-14", what: "Provider Verified",    status: "SiteConfirmed",   by: "Hermes" },
        { ts: "2026-02-19", what: "Submitted to Provider", status: "RequestSent",    by: "Hermes" },
        { ts: "2026-04-12", what: "Provider Acknowledged", status: "RequestConfirmed", by: "Hermes" },
      ],
    },
    {
      id: "rr_5005", patientId: "pat_1002", siteId: "site_005",
      medicalRecord: true, billing: false, imaging: false,
      status: "AuthDenied",
      createdAt: "2026-03-04", updatedAt: "2026-03-21",
      timeline: [
        { ts: "2026-03-04", what: "Request Created",     status: "Pending",         by: "Sarah Chen" },
        { ts: "2026-03-06", what: "Patient Info Confirmed", status: "InfoConfirmed", by: "Hermes" },
        { ts: "2026-03-07", what: "Provider Verified",    status: "SiteConfirmed",   by: "Hermes" },
        { ts: "2026-03-12", what: "Submitted to Provider", status: "RequestSent",    by: "Hermes" },
        { ts: "2026-03-21", what: "Provider rejected authorization — needs site-specific form", status: "AuthDenied", by: "Hermes" },
      ],
    },
    {
      id: "rr_5006", patientId: "pat_1003", siteId: "site_001",
      medicalRecord: true, billing: true, imaging: true,
      status: "RequestSent",
      createdAt: "2026-04-01", updatedAt: "2026-04-19",
      timeline: [
        { ts: "2026-04-01", what: "Request Created",     status: "Pending",         by: "Sarah Chen" },
        { ts: "2026-04-02", what: "Patient Info Confirmed", status: "InfoConfirmed", by: "Hermes" },
        { ts: "2026-04-04", what: "Provider Verified",    status: "SiteConfirmed",   by: "Hermes" },
        { ts: "2026-04-19", what: "Submitted to Provider", status: "RequestSent",    by: "Hermes" },
      ],
    },
    {
      id: "rr_5007", patientId: "pat_1004", siteId: null,
      medicalRecord: true, billing: false, imaging: false,
      status: "Pending",
      createdAt: "2026-04-30", updatedAt: "2026-04-30",
      timeline: [
        { ts: "2026-04-30", what: "Request Created — awaiting auth approval", status: "Pending", by: "Sarah Chen" },
      ],
    },
    {
      id: "rr_5008", patientId: "pat_1005", siteId: "site_002",
      medicalRecord: true, billing: true, imaging: false,
      status: "Completed",
      createdAt: "2026-01-08", updatedAt: "2026-02-19",
      pages: 184,
      timeline: [
        { ts: "2026-01-08", what: "Request Created",     status: "Pending",         by: "Sarah Chen" },
        { ts: "2026-01-09", what: "Patient Info Confirmed", status: "InfoConfirmed", by: "Hermes" },
        { ts: "2026-01-11", what: "Provider Verified",    status: "SiteConfirmed",   by: "Hermes" },
        { ts: "2026-01-14", what: "Submitted to Provider", status: "RequestSent",    by: "Hermes" },
        { ts: "2026-02-19", what: "Records Delivered (184 pages)", status: "Completed", by: "Hermes" },
      ],
    },
    {
      id: "rr_5009", patientId: "pat_1005", siteId: "site_003",
      medicalRecord: true, billing: false, imaging: false,
      status: "Completed",
      createdAt: "2026-02-01", updatedAt: "2026-03-12",
      pages: 41,
      timeline: [
        { ts: "2026-02-01", what: "Request Created",     status: "Pending",         by: "Sarah Chen" },
        { ts: "2026-02-02", what: "Patient Info Confirmed", status: "InfoConfirmed", by: "Hermes" },
        { ts: "2026-02-04", what: "Provider Verified",    status: "SiteConfirmed",   by: "Hermes" },
        { ts: "2026-02-07", what: "Submitted to Provider", status: "RequestSent",    by: "Hermes" },
        { ts: "2026-03-12", what: "Records Delivered (41 pages)", status: "Completed", by: "Hermes" },
      ],
    },
  ];

  function tatDays(r) {
    if (r.status !== "Completed") return null;
    const created = new Date(r.createdAt);
    const updated = new Date(r.updatedAt);
    return Math.round((updated - created) / 86400000);
  }

  // -----------------------------------------------------------
  // Hermes-extracted Visits, Diagnoses, Procedures
  // (POST /v0/visits/browse, /v0/diagnoses/browse, /v0/procedures/browse)
  // -----------------------------------------------------------

  // Diagnosis code dictionary (Hermes /v0/diagnosis-codes/browse)
  const DX_CODES = {
    "S06.0X9A": { short: "Concussion w/ LOC, unsp duration",     long: "Concussion with loss of consciousness, unspecified duration, initial encounter", category: "TBI" },
    "S13.4XXA": { short: "Sprain of cervical spine",              long: "Sprain of ligaments of cervical spine, initial encounter",                       category: "Cervical" },
    "M54.2":    { short: "Cervicalgia",                           long: "Cervicalgia (neck pain)",                                                          category: "Cervical" },
    "M51.26":   { short: "Other interv disc displacement, lumbar",long: "Other intervertebral disc displacement, lumbar region",                          category: "Lumbar" },
    "S39.012A": { short: "Strain of muscle, lower back",          long: "Strain of muscle, fascia and tendon of lower back, initial encounter",            category: "Lumbar" },
    "G89.21":   { short: "Chronic post-traumatic pain",           long: "Chronic post-traumatic pain, not elsewhere classified",                            category: "Pain" },
    "F43.10":   { short: "PTSD, unspecified",                     long: "Post-traumatic stress disorder, unspecified",                                      category: "Psych" },
    "S22.42XA": { short: "Fx of two ribs, left",                  long: "Fracture of two ribs, left side, initial encounter for closed fracture",          category: "Fracture" },
    "M25.511":  { short: "Pain in right shoulder",                long: "Pain in right shoulder",                                                            category: "MSK" },
    "R51.9":    { short: "Headache, unspecified",                 long: "Headache, unspecified",                                                            category: "Neuro" },
    "Z87.820":  { short: "Personal hx of traumatic fracture",     long: "Personal history of traumatic fracture",                                            category: "History" },
    "S43.401A": { short: "Sprain of right shoulder",              long: "Unspecified sprain of right shoulder joint, initial encounter",                    category: "MSK" },
  };

  // CPT/HCPCS dictionary (Hermes /v0/procedure-codes/browse)
  const CPT_CODES = {
    "99284": "ED visit, high complexity",
    "70450": "CT head/brain w/o contrast",
    "72148": "MRI lumbar spine w/o contrast",
    "72141": "MRI cervical spine w/o contrast",
    "73221": "MRI right shoulder w/o contrast",
    "97110": "Therapeutic exercises (PT)",
    "97140": "Manual therapy (PT)",
    "20610": "Arthrocentesis, major joint injection",
    "99213": "Office visit, established, level 3",
    "99214": "Office visit, established, level 4",
    "27447": "Total knee arthroplasty",
    "62323": "Lumbar epidural steroid injection",
    "G0283": "Electrical stimulation, unattended",
  };

  // Visits — extracted by Hermes after records arrive
  // Shape mirrors VisitFields. encounterType + claimType drive UI.
  const VISITS = [
    // Marcus Reyna — pat_1001 — MVA case
    { id: "v_001", patientId: "pat_1001", siteId: "site_002", visitDate: "2025-11-04", encounterType: "Emergency",  chiefComplaint: "MVA, struck T-bone driver side; LOC ~30 sec",
      provider: "Dr. K. Patel, ED",     dxCodes: ["S06.0X9A","S22.42XA","M54.2"],         cptCodes: ["99284","70450"],        pageRefs: [4,5,6,7,8] },
    { id: "v_002", patientId: "pat_1001", siteId: "site_001", visitDate: "2025-11-12", encounterType: "Imaging",    chiefComplaint: "Cervical/lumbar MRI per ED referral",
      provider: "Banner Imaging",       dxCodes: ["M51.26","S13.4XXA"],                   cptCodes: ["72148","72141"],        pageRefs: [42,43,44] },
    { id: "v_003", patientId: "pat_1001", siteId: "site_003", visitDate: "2025-11-21", encounterType: "Office Visit",chiefComplaint: "Initial ortho consult — neck/back/shoulder pain",
      provider: "Dr. R. Singh, OrthoArizona", dxCodes: ["S43.401A","M54.2","M25.511"],   cptCodes: ["99214"],                pageRefs: [88,89] },
    { id: "v_004", patientId: "pat_1001", siteId: "site_003", visitDate: "2025-12-03", encounterType: "Office Visit",chiefComplaint: "Right shoulder injection",
      provider: "Dr. R. Singh",         dxCodes: ["M25.511","S43.401A"],                  cptCodes: ["20610","99213"],        pageRefs: [104,105] },
    { id: "v_005", patientId: "pat_1001", siteId: "site_003", visitDate: "2026-01-14", encounterType: "Office Visit",chiefComplaint: "PT, persistent neck pain + headache",
      provider: "Dr. R. Singh",         dxCodes: ["M54.2","R51.9","G89.21"],              cptCodes: ["99213","97110","97140"], pageRefs: [149,150,151] },
    { id: "v_006", patientId: "pat_1001", siteId: "site_003", visitDate: "2026-02-22", encounterType: "Office Visit",chiefComplaint: "Lumbar ESI, ongoing radicular sx",
      provider: "Dr. R. Singh",         dxCodes: ["M51.26","G89.21"],                     cptCodes: ["62323","99214"],        pageRefs: [218,219,220] },

    // Aniyah Brooks — pat_1002 — Trucking
    { id: "v_007", patientId: "pat_1002", siteId: "site_002", visitDate: "2025-09-19", encounterType: "Emergency",  chiefComplaint: "Tractor-trailer rear-end; LOC, hospitalized 2 days",
      provider: "Dr. M. Choi, Trauma",  dxCodes: ["S06.0X9A","S22.42XA"],                 cptCodes: ["99284","70450"],        pageRefs: [3,4,5] },
    { id: "v_008", patientId: "pat_1002", siteId: "site_001", visitDate: "2025-11-02", encounterType: "Imaging",    chiefComplaint: "Repeat brain MRI — persistent symptoms",
      provider: "Banner Imaging",       dxCodes: ["S06.0X9A"],                            cptCodes: ["70450"],                pageRefs: [40,41] },

    // Eli Dempsey — pat_1003 — Catastrophic, minor
    { id: "v_009", patientId: "pat_1003", siteId: "site_001", visitDate: "2026-01-22", encounterType: "Emergency",  chiefComplaint: "Pediatric pedestrian struck — multi-system trauma",
      provider: "Dr. L. Hammond, Peds Trauma", dxCodes: ["S06.0X9A","S22.42XA"],          cptCodes: ["99284","70450"],        pageRefs: [2,3,4,5] },

    // Daniel Okafor — pat_1005 — Premises (slip & fall)
    { id: "v_010", patientId: "pat_1005", siteId: "site_002", visitDate: "2025-07-10", encounterType: "Emergency",  chiefComplaint: "Fall on wet floor, knee/back pain",
      provider: "Dr. R. Singh",         dxCodes: ["S39.012A","M25.511"],                   cptCodes: ["99284"],                pageRefs: [1,2] },
    { id: "v_011", patientId: "pat_1005", siteId: "site_003", visitDate: "2025-08-22", encounterType: "Office Visit",chiefComplaint: "Knee MRI follow-up, conservative therapy",
      provider: "Dr. R. Singh",         dxCodes: ["M25.511","Z87.820"],                    cptCodes: ["99213","97110"],        pageRefs: [33,34] },
  ];

  // -----------------------------------------------------------
  // Searchable chart pages — OCR'd snippets for keyword search
  // (TMT layer: built atop Hermes deliverables PDFs)
  // -----------------------------------------------------------
  const CHART_PAGES = [
    // pat_1001 — Marcus Reyna
    { patientId: "pat_1001", page: 5,   docType: "ED Note",     site: "Banner Desert Medical Center", visitId: "v_001",
      text: "Patient is a 36 y/o male presenting after a high-speed T-bone collision approximately 90 minutes prior to arrival. Reports loss of consciousness ~30 seconds at scene per EMS. GCS 15 on arrival. Complains of severe left-sided chest pain, neck pain, and posterior headache. CT head negative for acute hemorrhage. Diagnosed with concussion, left-sided 5th and 6th rib fractures, and cervical strain." },
    { patientId: "pat_1001", page: 12,  docType: "ED Note",     site: "Banner Desert Medical Center", visitId: "v_001",
      text: "Discharge instructions: post-concussion precautions reviewed. Return for any worsening headache, vomiting, focal neuro deficit. Strongly advised to follow up with primary care within 72 hours. Disposition: home with family." },
    { patientId: "pat_1001", page: 43,  docType: "Imaging Report", site: "Banner Desert Medical Center", visitId: "v_002",
      text: "MRI LUMBAR SPINE W/O CONTRAST. Findings: L4-L5 broad-based disc protrusion measuring 4mm contacting the descending L5 nerve root. Mild central canal stenosis. L5-S1 minor disc bulge without nerve impingement. IMPRESSION: L4-L5 disc protrusion correlating with reported radicular symptoms." },
    { patientId: "pat_1001", page: 44,  docType: "Imaging Report", site: "Banner Desert Medical Center", visitId: "v_002",
      text: "MRI CERVICAL SPINE. Multilevel degenerative changes most pronounced at C5-C6. No acute fracture or cord compression. Findings consistent with reported mechanism of injury and clinical exam." },
    { patientId: "pat_1001", page: 89,  docType: "Ortho Note",  site: "OrthoArizona — Mesa", visitId: "v_003",
      text: "Patient referred from ED. Persistent neck pain rated 7/10, intermittent right shoulder pain, and lower back pain with radiation into the right buttock. ROM cervical limited in extension and right rotation. Positive Spurling's on right. Plan: targeted PT, NSAIDs, recheck in 4 weeks." },
    { patientId: "pat_1001", page: 105, docType: "Procedure Note", site: "OrthoArizona — Mesa", visitId: "v_004",
      text: "Right shoulder subacromial corticosteroid injection performed under sterile technique. 1mL of 1% lidocaine with 40mg triamcinolone. Patient tolerated well. Symptomatic improvement expected in 48–72 hours." },
    { patientId: "pat_1001", page: 150, docType: "PT Note",     site: "OrthoArizona — Mesa", visitId: "v_005",
      text: "Patient continues to report daily headaches and difficulty concentrating at work. Reports trouble sleeping due to neck pain. Mild improvement with manual therapy and therapeutic exercises. Recommends continued PT 2x/week, screening for post-concussion syndrome." },
    { patientId: "pat_1001", page: 219, docType: "Procedure Note", site: "OrthoArizona — Mesa", visitId: "v_006",
      text: "Lumbar epidural steroid injection at L4-L5 under fluoroscopic guidance. Contrast spread confirmed. Patient reported significant pain relief immediately post-procedure." },

    // pat_1002 — Aniyah Brooks
    { patientId: "pat_1002", page: 4,  docType: "Trauma Note", site: "Dignity Health St. Joseph's Hospital", visitId: "v_007",
      text: "Patient is a 49 y/o female restrained driver of a sedan rear-ended at high speed by a tractor-trailer. Reports loss of consciousness, retrograde amnesia for the event. GCS 14 on arrival. Multiple left-sided rib fractures noted on CT. Admitted for observation, neuro checks q2h." },
    { patientId: "pat_1002", page: 41, docType: "Imaging Report", site: "Banner Desert Medical Center", visitId: "v_008",
      text: "Repeat MRI brain — small hyperintense focus right frontal white matter, consistent with mild traumatic brain injury (DAI). Findings new compared to imaging at time of admission." },

    // pat_1003 — Eli Dempsey
    { patientId: "pat_1003", page: 3, docType: "Peds Trauma Note", site: "Banner Desert Medical Center", visitId: "v_009",
      text: "11 y/o male struck by vehicle at moderate speed while crossing in marked crosswalk. LOC unclear. Multiple lower extremity contusions, left rib fractures (5, 6), and concussion. Pediatric trauma protocol activated. Father (legal guardian) consented to authorization." },

    // pat_1005 — Daniel Okafor
    { patientId: "pat_1005", page: 1, docType: "ED Note", site: "Dignity Health St. Joseph's Hospital", visitId: "v_010",
      text: "57 y/o male slipped on unmarked wet floor at retail establishment. Landed on right side. Complains of low back pain, right knee pain, no LOC. Imaging: lumbar strain, no fracture. Home with PT referral." },
    { patientId: "pat_1005", page: 34, docType: "Ortho Note", site: "OrthoArizona — Mesa", visitId: "v_011",
      text: "Patient with history of remote left tibial fracture (2008). Right knee MRI today: mild medial meniscus tear, low-grade. Conservative management; PT 2x/week, anti-inflammatories." },
  ];

  // -----------------------------------------------------------
  // AI Chart Review — TMT-built layer atop Hermes structured data
  // Generated whenever a record-request completes; rolled up at case level.
  // -----------------------------------------------------------
  const AI_REVIEWS = {
    "pat_1001": {
      grade: "A-",
      gradeNumeric: 88,
      confidence: 0.83, // 0..1
      summary: "Strong, well-documented MVA with continuous treatment chain, objective imaging findings (L4-L5 disc protrusion, cervical degenerative changes), and a documented concussion. PT compliance is consistent. Damages are well-supported by repeat ortho visits and an L4-L5 ESI. One soft spot: no formal neuropsych eval despite documented post-concussion symptoms.",
      lastRunAt: "2026-05-07T18:42:00Z",
      causation:    { rating: "Strong",      detail: "Mechanism (T-bone, LOC) maps cleanly to documented injuries. Imaging at day 8 anchors the timeline." },
      treatmentChain: { rating: "Continuous", detail: "EMS → ED → imaging → ortho → PT → ESI. No gap > 21 days through 6+ months." },
      damages:      { rating: "Well-supported", low: 380000, mid: 620000, high: 940000, detail: "Objective findings + procedural intervention (ESI) + ongoing PT support a meaningful general-damages award." },
      preExisting:  { rating: "Clean",       detail: "No prior cervical/lumbar pathology in records reviewed." },
      facts: [
        "ED-documented LOC (~30 sec) within 90 min of crash — Banner Desert ED note, p.5",
        "MRI: L4-L5 disc protrusion contacting L5 nerve root — Imaging report, p.43",
        "Left 5th & 6th rib fractures on CT — initial ED, p.5",
        "Continuous PT compliance Nov 2025 → Feb 2026 — OrthoArizona records",
        "Lumbar ESI at L4-L5 with confirmed contrast spread — procedure note, p.219",
        "Treating provider documents work-related concentration difficulty — PT note, p.150",
      ],
      gaps: [
        "No neuropsych eval despite reported post-concussion symptoms (headaches, sleep, focus)",
        "Wage-loss documentation missing — request employer records",
        "Pre-injury baseline cervical/lumbar imaging not on file (could be useful)",
      ],
      recommendations: [
        "Order neuropsych battery — strengthens TBI claim materially",
        "Subpoena employer for attendance/accommodation records",
        "Confirm Sunrise Imaging follow-up films are pending (currently PaymentPending)",
      ],
      // Mocked Q&A — predefined questions revealed in the UI
      qa: [
        { q: "Does this case have enough supporting facts to win?",
          a: "Yes — the case carries the elements: documented mechanism, objective imaging, continuous treatment, and procedural intervention. The plaintiff's contemporaneous LOC and rib fractures rule out malingering. Causation is strong. The two material gaps (neuropsych eval, wage loss) are addressable pre-trial." },
        { q: "What's the projected damages range?",
          a: "Conservative: $380K. Likely: $620K. Aggressive (with neuropsych + wage loss): $940K. Confidence skews higher with venue (Maricopa Co. plaintiff-friendly on TBI) and the documented ESI." },
        { q: "What's the weakest piece of the file?",
          a: "Subjective neuro symptoms (headache, focus, sleep) are reported in PT notes (p.150) but not formally validated by neuropsych testing. Defense will move to discount these without the eval." },
        { q: "Any pre-existing condition risk?",
          a: "Records reviewed show clean spine baseline. Recommend pulling 5-year prior PCP records to lock the door." },
      ],
    },
    "pat_1002": {
      grade: "A",
      gradeNumeric: 92,
      confidence: 0.88,
      summary: "Catastrophic-tier trucking case. Hospital admission, objective TBI imaging (DAI on repeat MRI), and clear mechanism. Defense exposure is significant. Continue building the future-care expert package.",
      lastRunAt: "2026-05-06T22:14:00Z",
      causation:    { rating: "Strong",      detail: "Tractor-trailer rear-end with LOC — mechanism uncontested in police report on file." },
      treatmentChain: { rating: "Continuous", detail: "Trauma admit → repeat imaging → outpatient follow-up." },
      damages:      { rating: "Catastrophic", low: 1800000, mid: 3200000, high: 5500000, detail: "DAI on imaging, hospital admission, projected lifetime care; commercial-trucking policy stack opens upper bound." },
      preExisting:  { rating: "Clean",       detail: "No prior TBI in records to date." },
      facts: [
        "GCS 14 on arrival, retrograde amnesia documented — trauma note p.4",
        "DAI on repeat brain MRI — imaging report p.41",
        "Multiple left-sided rib fractures on CT",
        "Hospital observation 2 days",
      ],
      gaps: [
        "Vocational expert report not yet ordered",
        "Life-care plan needed for permanent cognitive sequelae",
      ],
      recommendations: [
        "Schedule independent neuropsych for objective sequelae documentation",
        "Engage life-care planner — case profile supports lifetime cost projection",
        "Request commercial driver's HOS logs via spoliation letter",
      ],
      qa: [
        { q: "Does this case have enough supporting facts to win?",
          a: "Yes, decisively. Liability is near-certain (commercial fleet). DAI imaging and admission anchor severity. The case is in expert-development phase, not facts-development phase." },
        { q: "What's the projected damages range?",
          a: "Catastrophic tier: $1.8M conservative, $3.2M likely, $5.5M aggressive. Commercial trucking policy limits typically support the upper range." },
      ],
    },
    "pat_1003": {
      grade: "B+",
      gradeNumeric: 80,
      confidence: 0.74,
      summary: "Pediatric pedestrian case. Strong sympathetic facts and clear liability. Records still incomplete — full PT and follow-up imaging requests outstanding.",
      lastRunAt: "2026-05-04T11:00:00Z",
      causation:    { rating: "Strong",      detail: "Crosswalk strike, marked crossing." },
      treatmentChain: { rating: "Incomplete", detail: "Initial trauma records arrived; outpatient continuity not yet on file." },
      damages:      { rating: "Pending",     low: 450000, mid: 850000, high: 1500000, detail: "Pediatric concussion + rib fractures; final award depends on durability of sequelae." },
      preExisting:  { rating: "Clean", detail: "Pediatric clean baseline." },
      facts: [
        "Pediatric trauma protocol activated — p.3",
        "Concussion with LOC unclear documented",
        "Left rib fractures (ribs 5, 6)",
        "Father consented to authorization (Minor capacity)",
      ],
      gaps: [
        "Outpatient peds follow-up records not yet received",
        "School records for academic/behavioral changes not yet requested",
        "Pediatric neuropsych baseline absent",
      ],
      recommendations: [
        "Order school records under FERPA waiver",
        "Schedule pediatric neuropsych — high-yield in juvenile TBI",
        "Re-image at 6-month mark to confirm resolution or persistence",
      ],
      qa: [
        { q: "Does this case have enough supporting facts to win?",
          a: "Probably yes on liability — the crosswalk strike is hard to defend. Damages are still developing; case strength rises sharply once outpatient follow-up and school-records sequelae are documented." },
      ],
    },
    "pat_1005": {
      grade: "C+",
      gradeNumeric: 67,
      confidence: 0.61,
      summary: "Premises slip-and-fall with documented soft-tissue injury and pre-existing remote tibial fracture. Liability theory (unmarked wet floor) is workable but defense will press contributory negligence. Damages are modest absent additional development.",
      lastRunAt: "2026-05-03T09:32:00Z",
      causation:    { rating: "Moderate",   detail: "Soft-tissue findings and meniscus tear — defense may argue degenerative." },
      treatmentChain: { rating: "Sparse",   detail: "Two visits and PT referral; conservative management throughout." },
      damages:      { rating: "Modest",     low: 38000, mid: 75000, high: 140000, detail: "Soft-tissue + low-grade meniscus; no surgical intervention." },
      preExisting:  { rating: "Material",   detail: "Documented remote left tibial fracture (2008); defense will use to muddy current right knee complaints." },
      facts: [
        "Slipped on unmarked wet floor — ED note p.1",
        "Right knee MRI: low-grade medial meniscus tear",
        "PT referral followed",
      ],
      gaps: [
        "No surveillance footage on file from incident",
        "No incident report from premises owner",
        "Meniscus tear graded low — defense may argue degenerative",
      ],
      recommendations: [
        "Subpoena store CCTV before retention period expires",
        "Depose premises maintenance lead re: wet-floor protocol",
        "Consider orthopedic IME to lock down injury causation",
      ],
      qa: [
        { q: "Does this case have enough supporting facts to win?",
          a: "It can win on liability if surveillance footage and the cleaning-protocol depo go our way. Damages are capped by injury severity and the pre-existing fracture history. Settlement is the likely path." },
      ],
    },
    "pat_1004": {
      grade: "—",
      gradeNumeric: 0,
      confidence: 0,
      summary: "Records have not yet been delivered. Initial chase outstanding. Review unlocks once first chart returns.",
      lastRunAt: null,
      facts: [], gaps: ["Authorization not yet approved","No records on file"],
      recommendations: ["Approve HIPAA authorization upload","Submit ED records request to Banner Desert"],
      qa: [],
    },
  };

  function fmtCents(n) {
    if (!n && n !== 0) return "—";
    return "$" + Math.round(n).toLocaleString();
  }

  return {
    COMPANY_ID, PROJECT_ID, TODAY,
    STATUSES, SITES, PATIENTS, REQUESTS,
    DX_CODES, CPT_CODES, VISITS, CHART_PAGES, AI_REVIEWS,
    fmtCents, tatDays,
    statusInfo(code) {
      return STATUSES[code] || { label: code, tone: "muted" };
    },
    requestsByPatient(pid) {
      return REQUESTS.filter(r => r.patientId === pid);
    },
    visitsByPatient(pid) {
      return VISITS.filter(v => v.patientId === pid).sort((a,b) => a.visitDate.localeCompare(b.visitDate));
    },
    chartPagesByPatient(pid) {
      return CHART_PAGES.filter(p => p.patientId === pid).sort((a,b) => a.page - b.page);
    },
    diagnosesForPatient(pid) {
      const visits = VISITS.filter(v => v.patientId === pid);
      const codeMap = new Map();
      for (const v of visits) {
        for (const c of v.dxCodes) {
          if (!codeMap.has(c)) codeMap.set(c, { code: c, ...DX_CODES[c], count: 0, firstSeen: v.visitDate, lastSeen: v.visitDate });
          const e = codeMap.get(c);
          e.count++;
          if (v.visitDate < e.firstSeen) e.firstSeen = v.visitDate;
          if (v.visitDate > e.lastSeen)  e.lastSeen  = v.visitDate;
        }
      }
      return [...codeMap.values()].sort((a,b) => b.count - a.count);
    },
    proceduresForPatient(pid) {
      const visits = VISITS.filter(v => v.patientId === pid);
      const codeMap = new Map();
      for (const v of visits) {
        for (const c of v.cptCodes) {
          if (!codeMap.has(c)) codeMap.set(c, { code: c, description: CPT_CODES[c] || c, count: 0, firstSeen: v.visitDate, lastSeen: v.visitDate });
          const e = codeMap.get(c);
          e.count++;
          if (v.visitDate < e.firstSeen) e.firstSeen = v.visitDate;
          if (v.visitDate > e.lastSeen)  e.lastSeen  = v.visitDate;
        }
      }
      return [...codeMap.values()].sort((a,b) => b.count - a.count);
    },
    searchPagesForPatient(pid, q) {
      if (!q || !q.trim()) return [];
      const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
      const pages = CHART_PAGES.filter(p => p.patientId === pid);
      const out = [];
      for (const p of pages) {
        const text = p.text.toLowerCase();
        const dxText = (VISITS.find(v => v.id === p.visitId)?.dxCodes || []).map(c => `${c} ${(DX_CODES[c]?.short||"")} ${(DX_CODES[c]?.long||"")}`).join(" ").toLowerCase();
        const haystack = text + " " + dxText + " " + p.docType.toLowerCase() + " " + p.site.toLowerCase();
        const hits = terms.filter(t => haystack.includes(t));
        if (hits.length === terms.length) out.push({ ...p, matchedTerms: hits });
      }
      return out;
    },
    aiReviewFor(pid) { return AI_REVIEWS[pid] || null; },
    siteById(id) { return SITES.find(s => s.id === id) || null; },
    patientById(id) { return PATIENTS.find(p => p.id === id) || null; },
    requestById(id) { return REQUESTS.find(r => r.id === id) || null; },
    dxCode(c) { return DX_CODES[c] || { short: c, long: c, category: "—" }; },
    cptCode(c) { return CPT_CODES[c] || c; },
  };
})();
