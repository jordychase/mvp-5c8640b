/* TMT Records — single-file SPA. Hash router, vanilla JS.
   All data via window.TMT_FIXTURES. Built for handoff: each view function
   names the Hermes endpoint(s) it would hit in dev. */

const F = window.TMT_FIXTURES;

const state = {
  // skipAuth=1 lets headless screenshot tooling bypass the login splash
  authed: /[?&]skipAuth=1/.test(location.search),
  // simple in-memory mutations of fixture data
  patients: [...F.PATIENTS],
  requests: [...F.REQUESTS],
};

// ---------- Helpers ----------
const $  = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
const el = (tag, props={}, ...children) => {
  const e = document.createElement(tag);
  for (const [k,v] of Object.entries(props||{})) {
    if (k === "class") e.className = v;
    else if (k === "html") e.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") e.addEventListener(k.slice(2), v);
    else if (v === false || v == null) continue;
    else e.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    e.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return e;
};
const fmtDate = (s) => {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};
const ucase = (s) => (s || "").charAt(0).toUpperCase() + (s||"").slice(1);

const statusPill = (code) => {
  const info = F.statusInfo(code);
  return el("span", { class: `pill ${info.tone}` }, info.label);
};

const requestTypeChips = (r) => {
  const out = [];
  if (r.medicalRecord) out.push(el("span", { class: "chip gold" }, "Medical Record"));
  if (r.billing)       out.push(el("span", { class: "chip gold" }, "Billing"));
  if (r.imaging)       out.push(el("span", { class: "chip gold" }, "Imaging"));
  return el("div", { class: "chip-list" }, ...out);
};

// ---------- Router ----------
function navigate(hash) { location.hash = hash; }

const routes = [
  { path: /^#?\/?$/,                              view: viewDashboard },
  { path: /^#\/cases$/,                           view: viewCases },
  { path: /^#\/cases\/new$/,                      view: viewNewCase },
  { path: /^#\/cases\/([^/]+)$/,                  view: (m) => viewCaseDetail(m[1]) },
  { path: /^#\/cases\/([^/]+)\/requests\/new$/,   view: (m) => viewNewRequest(m[1]) },
  { path: /^#\/requests$/,                        view: viewAllRequests },
  { path: /^#\/requests\/([^/]+)$/,               view: (m) => viewRequestDetail(m[1]) },
  { path: /^#\/cases\/([^/]+)\/chart\/(\d+)$/,    view: (m) => viewChartPage(m[1], parseInt(m[2],10)) },
  { path: /^#\/handoff$/,                         view: viewHandoff },
];

function render() {
  const root = $("#app");
  if (!state.authed) {
    root.innerHTML = "";
    root.appendChild(viewLogin());
    return;
  }
  // Mount shell once
  if (!root.firstChild || !root.querySelector("#view")) {
    root.innerHTML = "";
    const shell = document.importNode($("#tpl-shell").content, true);
    root.appendChild(shell);
  }

  const h = location.hash || "#/";
  for (const r of routes) {
    const m = h.match(r.path);
    if (m) {
      const v = $("#view");
      v.innerHTML = "";
      const out = r.view(m);
      if (out) v.appendChild(out);
      // mark active nav
      $$(".topnav a").forEach(a => {
        const route = a.getAttribute("data-route");
        a.classList.toggle("active",
          (route === "/" && (h === "#/" || h === "")) ||
          (route !== "/" && h.startsWith("#" + route))
        );
      });
      return;
    }
  }
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);

// ---------- Views ----------

function viewLogin() {
  const wrap = el("div", { class: "login-screen" });

  const art = el("div", { class: "login-art" },
    el("div", {},
      el("div", { class: "eyebrow", style: "font-family:var(--display); letter-spacing:0.22em; color:var(--gold); font-size:13px;" }, "TMT RECORDS · INTERNAL"),
      el("div", { class: "promise", style: "margin-top:24px" },
        "WE WIN.",
        el("span", { class: "accent" }, "YOU GET PAID."),
      ),
      el("p", { class: "tagline" }, "After a wreck, your job is to heal. Ours is to win — and to chase every page of every record it takes to prove it."),
    ),
    el("div", { class: "scoreline" },
      el("div", {}, el("div", { class: "num" }, "$1B+"), el("div", { class: "lbl" }, "Awarded")),
      el("div", {}, el("div", { class: "num" }, "87K+"), el("div", { class: "lbl" }, "Cases")),
      el("div", {}, el("div", { class: "num" }, "200K+"), el("div", { class: "lbl" }, "Lives Touched")),
    ),
    el("div", { class: "closing" }, "Talk to us before you talk to them. The insurance company has a script. We have results."),
  );

  const form = el("div", { class: "login-form" },
    el("div", { class: "eyebrow" }, "STAFF SIGN-IN"),
    el("h2", {}, "The corner is open."),
    el("form", { class: "form", onsubmit: (e) => { e.preventDefault(); state.authed = true; navigate("#/"); render(); } },
      el("div", { class: "field" },
        el("label", {}, "WORK EMAIL ", el("span", { class: "req" }, "*")),
        el("input", { type: "email", required: "true", value: "sarah.chen@themoneyteam.law", placeholder: "you@themoneyteam.law" })
      ),
      el("div", { class: "field" },
        el("label", {}, "PASSWORD ", el("span", { class: "req" }, "*")),
        el("input", { type: "password", required: "true", value: "••••••••••" })
      ),
      el("div", { class: "row between" },
        el("label", { style: "font-size:12px;color:var(--stone-2);display:flex;align-items:center;gap:6px" },
          el("input", { type: "checkbox", checked: "true" }), "Remember this device for 30 days"),
        el("a", { href: "#" }, "Reset password"),
      ),
      el("button", { type: "submit", class: "btn btn-primary", style: "width:100%; justify-content:center; margin-top:8px" }, "ENTER THE PORTAL"),
      el("div", { class: "consent", style: "margin-top:20px" },
        "Authorized use only. This system contains protected health information. Access is logged and monitored. By signing in you agree to the firm's HIPAA, security, and acceptable use policies."),
    )
  );
  wrap.appendChild(art);
  wrap.appendChild(form);
  return wrap;
}

function viewDashboard() {
  const reqs = state.requests;
  const open = reqs.filter(r => !["Completed","Canceled","DuplicateRequest","NoRecordFound"].includes(r.status));
  const completedThisMonth = reqs.filter(r => r.status === "Completed" && new Date(r.updatedAt) >= new Date("2026-04-01"));
  const tats = reqs.map(F.tatDays).filter(x => typeof x === "number");
  const avgTat = tats.length ? Math.round(tats.reduce((a,b)=>a+b,0) / tats.length) : 0;

  // Chart-grade rollup (TMT AI layer)
  const reviews = state.patients.map(p => F.aiReviewFor(p.id)).filter(r => r && r.gradeNumeric > 0);
  const avgGrade = reviews.length ? Math.round(reviews.reduce((a,r)=>a+r.gradeNumeric,0) / reviews.length) : 0;
  const avgConf  = reviews.length ? Math.round(reviews.reduce((a,r)=>a+r.confidence,0) / reviews.length * 100) : 0;
  function gradeLetter(n) {
    if (n >= 93) return "A"; if (n >= 90) return "A-"; if (n >= 87) return "B+";
    if (n >= 83) return "B"; if (n >= 80) return "B-"; if (n >= 77) return "C+";
    if (n >= 73) return "C"; if (n >= 70) return "C-"; if (n >= 60) return "D"; return "F";
  }
  const totalDamages = reviews.reduce((a,r)=>a + (r.damages?.mid || 0), 0);

  const recent = [...reqs].sort((a,b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0,6);

  return el("div", {},
    el("div", { class: "page-head" },
      el("div", {},
        el("div", { class: "eyebrow" }, "DASHBOARD"),
        el("h1", {}, "Records, on the offensive."),
        el("p", { class: "sub" }, "Live status across every chase. Above-the-fold action on every screen — keep cases moving."),
      ),
      el("div", { class: "row" },
        el("button", { class: "btn btn-ghost", onclick: () => navigate("#/cases") }, "VIEW ALL CASES"),
        el("button", { class: "btn btn-primary", onclick: () => navigate("#/cases/new") }, "+ NEW CASE"),
      ),
    ),

    el("div", { class: "scoreboard" },
      kpi("ACTIVE CASES",       state.patients.length, "across all attorneys"),
      kpi("REQUESTS IN-FLIGHT", open.length,           "awaiting provider"),
      kpi("AVG CHART GRADE",    gradeLetter(avgGrade), `${avgGrade}/100 · ${avgConf}% confidence`),
      kpi("BOOK · LIKELY",      "$" + (Math.round(totalDamages/100000)/10).toFixed(1) + "M", "AI projected damages, mid-band", true),
    ),

    el("div", { class: "scoreboard mt-24", style: "margin-top:0" },
      kpi("COMPLETED · APR",    completedThisMonth.length, "delivered this month", true),
      kpi("AVG TURNAROUND",     avgTat, "days · completed requests", true),
      kpi("PAGES INDEXED",      F.CHART_PAGES.length.toLocaleString(), "OCR'd & searchable", true),
      kpi("VISITS EXTRACTED",   F.VISITS.length, "from delivered records", true),
    ),

    el("div", { class: "grid-2 mt-24" },
      // Recent activity
      el("div", { class: "card gold-edge" },
        el("h3", { class: "card-title" }, "RECENT ACTIVITY"),
        el("div", { class: "table-wrap" },
          el("table", { class: "data" },
            el("thead", {}, el("tr", {},
              el("th", {}, "Request"), el("th", {}, "Client"), el("th", {}, "Status"), el("th", {}, "Updated"))),
            el("tbody", {}, ...recent.map(r => {
              const p = F.patientById(r.patientId);
              return el("tr", { onclick: () => navigate("#/requests/" + r.id) },
                el("td", { class: "lead" }, "#" + r.id.replace("rr_","")),
                el("td", {}, p ? `${p.firstName} ${p.lastName}` : "—"),
                el("td", {}, statusPill(r.status)),
                el("td", { class: "muted" }, fmtDate(r.updatedAt)),
              );
            }))
          )
        )
      ),
      // Watchlist
      el("div", { class: "card" },
        el("h3", { class: "card-title" }, "NEEDS ATTENTION"),
        el("div", { class: "col" },
          ...reqs.filter(r => ["AuthDenied","PaymentPending","FacilityRefusal","NeedSiteSpecificAuth","WrongSiteName"].includes(r.status))
            .map(r => {
              const p = F.patientById(r.patientId);
              const s = F.siteById(r.siteId);
              return el("div", { class: "card", style: "padding:14px; cursor:pointer", onclick: () => navigate("#/requests/" + r.id) },
                el("div", { class: "row between" },
                  el("div", { style: "font-family:var(--serif); font-weight:600; color:var(--white)" }, p ? `${p.firstName} ${p.lastName}` : "—"),
                  statusPill(r.status)
                ),
                el("div", { class: "muted", style: "color:var(--stone-2); font-size:12px; margin-top:4px" },
                  s ? s.name : "Site not yet selected"),
              );
            }),
          reqs.filter(r => ["AuthDenied","PaymentPending","FacilityRefusal","NeedSiteSpecificAuth","WrongSiteName"].includes(r.status)).length === 0
            ? el("div", { class: "muted", style: "color:var(--stone)" }, "All clear. Keep punching.")
            : null
        )
      ),
    )
  );
}

function kpi(label, num, foot, alt=false) {
  return el("div", { class: "score" + (alt ? " alt" : "") },
    el("div", { class: "score-label" }, label),
    el("div", { class: "score-num" }, String(num)),
    el("div", { class: "score-foot" }, foot),
  );
}

function viewCases() {
  const search = el("input", { class: "search", placeholder: "Search clients, matters, attorneys…" });
  const filter = el("select", {},
    el("option", { value: "" }, "All matters"),
    ...["Motor Vehicle","Trucking","Catastrophic Injury","Rideshare","Premises","Family Law","Mass Torts"].map(t => el("option", { value: t }, t)),
  );

  const tbody = el("tbody", {});
  function refill() {
    const q = (search.value||"").toLowerCase();
    const ft = filter.value;
    tbody.innerHTML = "";
    state.patients
      .filter(p => !ft || p.matterType === ft)
      .filter(p => !q || `${p.firstName} ${p.lastName} ${p.matterType} ${p.attorney}`.toLowerCase().includes(q))
      .forEach(p => {
        const reqs = state.requests.filter(r => r.patientId === p.id);
        const open = reqs.filter(r => !["Completed","Canceled"].includes(r.status)).length;
        tbody.appendChild(
          el("tr", { onclick: () => navigate("#/cases/" + p.id) },
            el("td", { class: "lead" }, `${p.lastName}, ${p.firstName}`),
            el("td", { class: "muted" }, fmtDate(p.dateOfBirth)),
            el("td", {}, p.matterType || "—"),
            el("td", { class: "muted" }, p.attorney || "—"),
            el("td", {}, String(reqs.length)),
            el("td", {}, open > 0 ? el("span", { class: "pill live" }, `${open} open`) : el("span", { class: "pill done" }, "All closed")),
            el("td", {}, p.authStatus === "Approved"
              ? el("span", { class: "pill ok" }, "Auth ok")
              : el("span", { class: "pill warn" }, "Needs approval")),
            el("td", { class: "muted" }, fmtDate(p.createdAt)),
          )
        );
      });
    if (!tbody.children.length) {
      tbody.appendChild(el("tr", {}, el("td", { colspan: "8", class: "muted", style: "text-align:center; padding:32px" }, "No cases match your filters.")));
    }
  }
  search.addEventListener("input", refill);
  filter.addEventListener("change", refill);

  const view = el("div", {},
    el("div", { class: "page-head" },
      el("div", {},
        el("div", { class: "eyebrow" }, "CASES"),
        el("h1", {}, "Every client. Every record. Every page."),
      ),
      el("button", { class: "btn btn-primary", onclick: () => navigate("#/cases/new") }, "+ NEW CASE"),
    ),
    el("div", { class: "table-wrap" },
      el("div", { class: "toolbar" }, search, filter,
        el("button", { class: "btn btn-ghost btn-sm" }, "EXPORT")),
      el("table", { class: "data" },
        el("thead", {}, el("tr", {},
          el("th", {}, "Client"), el("th", {}, "DOB"), el("th", {}, "Matter"),
          el("th", {}, "Attorney"), el("th", {}, "Requests"),
          el("th", {}, "Open"), el("th", {}, "Auth"),
          el("th", {}, "Opened"))),
        tbody,
      )
    )
  );
  refill();
  return view;
}

function viewCaseDetail(pid) {
  const p = F.patientById(pid);
  if (!p) return el("div", {}, el("h1", {}, "Case not found"));
  const reqs = state.requests.filter(r => r.patientId === pid);

  const tabs = ["Record Requests", "Chart Review", "Search Records", "Visits & Codes", "Authorization", "Notes"];
  // ?tab=N for deep-linking (used by handoff screenshots)
  const _tabFromUrl = parseInt((location.search.match(/[?&]tab=(\d+)/) || [])[1] || "0", 10);
  let active = Math.max(0, Math.min(tabs.length - 1, _tabFromUrl));
  const tabContent = el("div", {});
  function paintTab() {
    tabContent.innerHTML = "";
    if (active === 0) {
      const tbody = el("tbody", {});
      reqs.forEach(r => {
        const s = F.siteById(r.siteId);
        const types = [r.medicalRecord && "Medical", r.billing && "Billing", r.imaging && "Imaging"].filter(Boolean).join(" · ");
        tbody.appendChild(
          el("tr", { onclick: () => navigate("#/requests/" + r.id) },
            el("td", { class: "lead" }, "#" + r.id.replace("rr_","")),
            el("td", {}, s ? s.name : el("span", { class: "muted" }, "Provider not selected")),
            el("td", {}, types || "—"),
            el("td", {}, statusPill(r.status)),
            el("td", { class: "muted" }, fmtDate(r.updatedAt)),
          )
        );
      });
      tabContent.appendChild(
        el("div", { class: "table-wrap" },
          el("table", { class: "data" },
            el("thead", {}, el("tr", {},
              el("th", {}, "Request"), el("th", {}, "Provider"), el("th", {}, "Type"),
              el("th", {}, "Status"), el("th", {}, "Last update"))),
            tbody.children.length ? tbody : el("tbody", {},
              el("tr", {}, el("td", { colspan: "5", class: "muted", style: "text-align:center; padding:32px" }, "No requests yet. Start a chase below.")))
          )
        )
      );
    } else if (active === 1) {
      tabContent.appendChild(renderChartReview(pid));
    } else if (active === 2) {
      tabContent.appendChild(renderSearchRecords(pid));
    } else if (active === 3) {
      tabContent.appendChild(renderVisitsAndCodes(pid));
    } else if (active === 4) {
      tabContent.appendChild(
        el("div", { class: "grid-3" },
          authCard("Authorization Type",  p.authorizationType || "—"),
          authCard("Capacity",            (p.capacity || "—").replace(/([A-Z])/g, " $1").trim()),
          authCard("Auth Status",         p.authStatus,
                   p.authStatus === "Approved" ? "ok" : "warn"),
          authCard("Start of Service",    fmtDate(p.startDateOfService)),
          authCard("End of Service",      fmtDate(p.endDateOfService)),
          authCard("Auth Expiration",     fmtDate(p.authorizationExpirationDate)),
          authCard("Search Level",        p.searchLevel || "PatientHistory"),
          authCard("Search Status",       p.searchStatus || "Completed", "ok"),
        )
      );
      tabContent.appendChild(
        el("div", { class: "card mt-24" },
          el("h3", { class: "card-title" }, "AUTHORIZATION DOCUMENT · AI AUTH-CHECK"),
          el("p", { style: "color:var(--stone-2)" }, "Hermes auth-check has analyzed the uploaded HIPAA authorization PDF and confirmed signature presence, patient identity match, date-of-service coverage, and absence of strikethroughs."),
          el("div", { class: "rating-grid mt-24" },
            ratingCard("SIGNATURE",  "Present",   "Validated against attestation block"),
            ratingCard("DOS WINDOW", "Covered",   "11/04/2025 → 02/22/2026"),
            ratingCard("ATTESTATION","Witnessed", "Per AttestationType enum"),
            ratingCard("PHI MATCH",  "Verified",  "Name + DOB match patient record"),
          ),
          el("div", { class: "row mt-24" },
            el("button", { class: "btn btn-ghost btn-sm" }, "VIEW PDF"),
            el("button", { class: "btn btn-ghost btn-sm" }, "RE-RUN AUTH-CHECK"),
            el("button", { class: "btn btn-ghost btn-sm" }, "REPLACE"),
          ),
        )
      );
    } else {
      tabContent.appendChild(
        el("div", { class: "card" },
          el("h3", { class: "card-title" }, "CASE NOTES"),
          el("p", { class: "muted", style: "color:var(--stone-2)" }, "No notes yet. Add the first one."),
          el("div", { class: "field" }, el("textarea", { rows: "4", placeholder: "Add a note for the team…" })),
          el("button", { class: "btn btn-primary btn-sm", style: "margin-top:10px" }, "POST NOTE"),
        )
      );
    }
  }

  // -------- Chart Review (AI) --------
  function renderChartReview(pid) {
    const r = F.aiReviewFor(pid);
    if (!r || r.gradeNumeric === 0) {
      return el("div", { class: "card" },
        el("h3", { class: "card-title" }, "CHART REVIEW · NOT YET AVAILABLE"),
        el("p", { style: "color:var(--stone-2)" }, "Chart review unlocks once the first record-request delivers and Hermes finishes structured extraction. Submit a request to get started."),
      );
    }
    const wrap = el("div", {});

    const conf = el("div", { class: "confidence" },
      el("div", { class: "score-label", style: "font-family:var(--display); letter-spacing:0.18em; color:var(--bone); font-size:11px" }, `COURTROOM CONFIDENCE · ${Math.round(r.confidence*100)}%`),
      el("div", { class: "confidence-bar" },
        el("div", { class: "confidence-fill", style: `width: ${Math.round(r.confidence*100)}%` })),
    );

    wrap.appendChild(
      el("div", { class: "review-hero" },
        el("div", { class: "grade-card" },
          el("div", { class: "grade-stamp" }, "CHART GRADE"),
          el("div", { class: "grade-letter" }, r.grade),
          el("div", { class: "grade-numeric" }, r.gradeNumeric + "/100"),
          conf,
        ),
        el("div", { class: "review-summary" },
          el("h3", {}, "Case strength assessment"),
          el("p", {}, r.summary),
          el("div", { class: "review-meta" },
            metaItem("CAUSATION",        r.causation?.rating || "—"),
            metaItem("TREATMENT CHAIN",  r.treatmentChain?.rating || "—"),
            metaItem("DAMAGES",          r.damages?.rating || "—"),
            metaItem("PRE-EXISTING RISK",r.preExisting?.rating || "—"),
            metaItem("LAST RUN",         r.lastRunAt ? fmtDate(r.lastRunAt.slice(0,10)) : "—"),
          ),
        )
      )
    );

    // Damages estimate
    if (r.damages && r.damages.low) {
      wrap.appendChild(
        el("div", { class: "card mt-24 gold-edge" },
          el("h3", { class: "card-title" }, "PROJECTED DAMAGES RANGE"),
          el("div", { class: "rating-grid" },
            el("div", { class: "rating-card" },
              el("div", { class: "lbl" }, "CONSERVATIVE"),
              el("div", { class: "val" }, F.fmtCents(r.damages.low)),
            ),
            el("div", { class: "rating-card" },
              el("div", { class: "lbl" }, "LIKELY"),
              el("div", { class: "val" }, F.fmtCents(r.damages.mid)),
            ),
            el("div", { class: "rating-card" },
              el("div", { class: "lbl" }, "AGGRESSIVE"),
              el("div", { class: "val" }, F.fmtCents(r.damages.high)),
            ),
            el("div", { class: "rating-card" },
              el("div", { class: "lbl" }, "RATING"),
              el("div", { class: "val" }, r.damages.rating),
            ),
          ),
          el("p", { style: "color:var(--stone-2); font-size:12px; margin-top:12px" }, r.damages.detail),
          el("div", { style: "color:var(--stone); font-size:11px; margin-top:8px; font-style:italic" },
            "Internal estimate, attorney work product. Not a guarantee. Past results do not guarantee future outcomes."),
        )
      );
    }

    // Facts vs Gaps
    wrap.appendChild(
      el("div", { class: "grid-2 mt-24" },
        el("div", { class: "card gold-edge" },
          el("h3", { class: "card-title" }, "SUPPORTING FACTS · DOCUMENTED"),
          el("ul", { class: "fact-list" }, ...(r.facts || []).map(f => el("li", {}, "", f))),
        ),
        el("div", { class: "card" },
          el("h3", { class: "card-title" }, "GAPS & RISK"),
          el("ul", { class: "gap-list" }, ...(r.gaps || []).map(g => el("li", {}, "", g))),
        ),
      )
    );

    // Recommendations
    if (r.recommendations && r.recommendations.length) {
      wrap.appendChild(
        el("div", { class: "card mt-24" },
          el("h3", { class: "card-title" }, "RECOMMENDED NEXT STEPS"),
          el("ul", { class: "recs-list" }, ...r.recommendations.map(rec => el("li", {}, rec))),
        )
      );
    }

    // Q&A
    const qaBlock = el("div", { class: "qa-block" });
    (r.qa || []).forEach(item => {
      const ans = el("div", { class: "qa-answer" }, item.a);
      const q = el("div", { class: "qa-question", onclick: () => ans.classList.toggle("open") }, item.q);
      qaBlock.appendChild(q);
      qaBlock.appendChild(ans);
    });
    qaBlock.appendChild(
      el("div", { class: "qa-input-row" },
        el("input", { placeholder: "Ask anything about this case file… e.g., 'Pull all imaging where disc protrusion is documented'" }),
        el("button", { class: "btn btn-primary btn-sm" }, "ASK"),
      )
    );
    wrap.appendChild(
      el("div", { class: "mt-24" },
        el("h3", { class: "card-title" }, "ASK THE CHART (AI)"),
        qaBlock,
      )
    );

    return wrap;
  }

  // -------- Search Records --------
  function renderSearchRecords(pid) {
    const wrap = el("div", {});
    const hits = el("div", {});
    const initialQ = decodeURIComponent((location.search.match(/[?&]q=([^&]*)/) || [])[1] || "");
    const input = el("input", { placeholder: "Search across charts… e.g., concussion, MRI lumbar, L4-L5, headache, ESI", value: initialQ });
    const summary = el("div", { style: "color:var(--stone-2); font-size:12px; margin-top:8px" });

    function runSearch(q) {
      hits.innerHTML = "";
      if (!q.trim()) { summary.textContent = "Search across all delivered records — clinical notes, imaging reports, procedure notes, ED triage, PT progress."; return; }
      const results = F.searchPagesForPatient(pid, q);
      summary.textContent = `${results.length} match${results.length===1?"":"es"} across ${F.chartPagesByPatient(pid).length} indexed pages`;
      const re = new RegExp(`(${q.trim().split(/\s+/).filter(Boolean).map(w => w.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")).join("|")})`, "ig");
      if (!results.length) {
        hits.appendChild(el("div", { class: "card", style: "color:var(--stone)" }, "No hits. Try a broader term, or use a quick filter above."));
        return;
      }
      for (const p of results) {
        const highlighted = (p.text || "").replace(re, '<mark>$1</mark>');
        hits.appendChild(
          el("div", { class: "snippet" },
            el("div", { class: "snippet-head" },
              el("span", { class: "doc" }, p.docType),
              el("span", { class: "page" }, "p. " + p.page + " · " + p.site),
              el("span", { class: "pill ok" }, "Visit: " + p.visitId),
              ...p.matchedTerms.map(t => el("span", { class: "pill done" }, "“" + t + "”")),
              el("a", { class: "btn btn-ghost btn-sm", href: `#/cases/${pid}/chart/${p.page}`, style: "margin-left:auto" }, "VIEW PAGE →"),
            ),
            el("div", { class: "snippet-text", html: highlighted }),
          )
        );
      }
    }

    input.addEventListener("input", e => runSearch(e.target.value));

    const quickRow = el("div", { class: "search-quick" });
    ["concussion","loss of consciousness","MRI lumbar","disc protrusion","epidural steroid","PT","headache","rib fracture","DAI"]
      .forEach(t => quickRow.appendChild(
        el("button", { type: "button", onclick: () => { input.value = t; runSearch(t); } }, t)
      ));

    wrap.appendChild(
      el("div", { class: "search-hero" },
        el("div", { class: "search-input-row" },
          input,
          el("button", { class: "btn btn-primary btn-sm" }, "SEARCH"),
        ),
        quickRow,
        summary,
      )
    );
    wrap.appendChild(hits);
    runSearch(initialQ);

    return wrap;
  }

  // -------- Visits & Codes --------
  function renderVisitsAndCodes(pid) {
    const visits = F.visitsByPatient(pid);
    const dx     = F.diagnosesForPatient(pid);
    const cpt    = F.proceduresForPatient(pid);

    const wrap = el("div", {});
    if (!visits.length) {
      wrap.appendChild(el("div", { class: "card" },
        el("h3", { class: "card-title" }, "NO EXTRACTED VISITS YET"),
        el("p", { style: "color:var(--stone-2)" }, "Hermes structured extraction populates after the first record-request delivers.")));
      return wrap;
    }

    wrap.appendChild(el("h3", { class: "card-title" }, "VISIT TIMELINE · EXTRACTED FROM CHARTS"));
    visits.forEach(v => {
      const s = F.siteById(v.siteId);
      wrap.appendChild(
        el("div", { class: "visit-row" },
          el("div", { class: "when" },
            v.visitDate.slice(5).replace("-","/"),
            el("small", {}, v.visitDate.slice(0,4))
          ),
          el("div", { class: "body" },
            el("div", { class: "ttl" }, v.encounterType + " · " + v.chiefComplaint),
            el("div", { class: "where" }, (s ? s.name : v.siteId) + " · " + (v.provider || "—")),
            el("div", { class: "codes" },
              ...v.dxCodes.map(c => el("span", { class: "code-chip dx", title: F.dxCode(c).long }, c + " — " + F.dxCode(c).short)),
              ...v.cptCodes.map(c => el("span", { class: "code-chip cpt", title: F.cptCode(c) }, c + " — " + F.cptCode(c))),
            ),
          ),
        )
      );
    });

    wrap.appendChild(el("div", { class: "grid-2 mt-24" },
      // ICD codes table
      el("div", { class: "card gold-edge" },
        el("h3", { class: "card-title" }, "DIAGNOSES · ICD-10 (Hermes /diagnoses/browse)"),
        el("table", { class: "data" },
          el("thead", {}, el("tr", {},
            el("th", {}, "Code"), el("th", {}, "Description"), el("th", {}, "Category"),
            el("th", {}, "Visits"), el("th", {}, "First → Last"))),
          el("tbody", {}, ...dx.map(d => el("tr", {},
            el("td", { class: "lead" }, d.code),
            el("td", {}, d.short || d.code),
            el("td", { class: "muted" }, d.category || "—"),
            el("td", {}, String(d.count)),
            el("td", { class: "muted" }, fmtDate(d.firstSeen) + " → " + fmtDate(d.lastSeen)),
          ))),
        )
      ),
      // CPT codes table
      el("div", { class: "card" },
        el("h3", { class: "card-title" }, "PROCEDURES · CPT (Hermes /procedures/browse)"),
        el("table", { class: "data" },
          el("thead", {}, el("tr", {},
            el("th", {}, "Code"), el("th", {}, "Description"),
            el("th", {}, "Visits"), el("th", {}, "First → Last"))),
          el("tbody", {}, ...cpt.map(d => el("tr", {},
            el("td", { class: "lead" }, d.code),
            el("td", {}, d.description),
            el("td", {}, String(d.count)),
            el("td", { class: "muted" }, fmtDate(d.firstSeen) + " → " + fmtDate(d.lastSeen)),
          ))),
        )
      ),
    ));

    return wrap;
  }

  const tabBar = el("div", { class: "tabs" });
  tabs.forEach((t, i) => {
    const b = el("button", { class: i === active ? "active" : "", onclick: () => { active = i; tabBar.querySelectorAll("button").forEach((x,j)=>x.classList.toggle("active", j===i)); paintTab(); } }, t.toUpperCase());
    tabBar.appendChild(b);
  });

  paintTab();

  return el("div", {},
    el("div", { class: "page-head" },
      el("div", {},
        el("div", { class: "eyebrow" }, "CASE FILE"),
        el("a", { href: "#/cases", style: "color:var(--stone-2); font-size:12px" }, "← Back to all cases"),
      ),
    ),

    el("div", { class: "case-head" },
      el("div", {},
        el("h2", { class: "name" }, `${p.firstName} ${p.lastName}`),
        el("div", { class: "row", style: "margin-top:6px; gap:10px" },
          el("span", { class: "pill live" }, p.matterType || "—"),
          el("span", { class: "pill ok" }, "Attorney: " + (p.attorney || "—")),
          p.authStatus === "Approved" ? el("span", { class: "pill ok" }, "Auth approved") : el("span", { class: "pill warn" }, "Auth needs approval"),
        ),
        el("div", { class: "meta" },
          metaItem("DOB",        fmtDate(p.dateOfBirth)),
          metaItem("SEX",        ucase(p.sex)),
          metaItem("MOBILE",     p.mobile || "—"),
          metaItem("EMAIL",      p.email || "—"),
          metaItem("DOS START",  fmtDate(p.startDateOfService)),
          metaItem("DOS END",    fmtDate(p.endDateOfService)),
          metaItem("AUTH EXP",   fmtDate(p.authorizationExpirationDate)),
          metaItem("SSN",        p.socialSecurityNumber || "—"),
        ),
      ),
      el("div", { class: "col" },
        el("button", { class: "btn btn-primary", onclick: () => navigate(`#/cases/${pid}/requests/new`) }, "+ NEW RECORD REQUEST"),
        el("button", { class: "btn btn-ghost btn-sm" }, "EDIT CLIENT"),
      ),
    ),

    tabBar,
    tabContent,
  );
}

function metaItem(lbl, val) {
  return el("div", {},
    el("span", { class: "lbl" }, lbl),
    el("span", { class: "val" }, val));
}
function ratingCard(lbl, val, detail, tone) {
  return el("div", { class: "rating-card " + (tone || "") },
    el("div", { class: "lbl" }, lbl),
    el("div", { class: "val" }, val),
    detail ? el("div", { class: "detail" }, detail) : null,
  );
}
function authCard(title, val, tone="live") {
  return el("div", { class: "card" },
    el("div", { class: "score-label", style: "font-family:var(--display); letter-spacing:0.16em; color:var(--stone-2); font-size:11px" }, title),
    el("div", { style: `font-family:var(--serif); font-size:20px; color:var(--white); margin-top:6px` }, val),
  );
}

function viewNewCase() {
  const data = {
    firstName: "", lastName: "", dateOfBirth: "", sex: "male",
    mobile: "", email: "", socialSecurityNumber: "",
    startDateOfService: "", endDateOfService: "",
    authorizationExpirationDate: "", authorizationType: "Hipaa",
    capacity: "SelfAuthorizing", matterType: "Motor Vehicle",
    attorney: "Sarah Chen",
  };

  function field(label, key, type="text", opts={}) {
    return el("div", { class: "field" },
      el("label", {}, label, opts.req ? el("span", { class: "req" }, " *") : null),
      el("input", { type, value: data[key] || "", oninput: (e) => data[key] = e.target.value, ...opts }),
      opts.hint ? el("div", { class: "hint" }, opts.hint) : null,
    );
  }
  function selectField(label, key, options, opts={}) {
    const sel = el("select", { onchange: (e) => data[key] = e.target.value },
      ...options.map(o => el("option", { value: o.value, selected: o.value === data[key] }, o.label))
    );
    return el("div", { class: "field" },
      el("label", {}, label, opts.req ? el("span", { class: "req" }, " *") : null),
      sel,
      opts.hint ? el("div", { class: "hint" }, opts.hint) : null,
    );
  }

  function submit(e) {
    e.preventDefault();
    if (!data.firstName || !data.lastName || !data.dateOfBirth) {
      alert("First name, last name, and DOB are required."); return;
    }
    const id = "pat_" + Math.floor(Math.random() * 100000);
    state.patients.push({ ...data, id, authStatus: "NeedsApproval", createdAt: new Date().toISOString().slice(0,10) });
    navigate("#/cases/" + id);
  }

  return el("div", {},
    el("div", { class: "page-head" },
      el("div", {},
        el("div", { class: "eyebrow" }, "NEW CASE"),
        el("h1", {}, "Open the file."),
        el("p", { class: "sub" }, "We'll generate the HIPAA authorization, run the auth-check, and start chasing records the moment a provider is selected."),
      ),
      el("a", { class: "btn btn-ghost", href: "#/cases" }, "CANCEL"),
    ),
    el("form", { class: "card", onsubmit: submit },
      el("h3", { class: "card-title" }, "CLIENT INFO"),
      el("div", { class: "form-row" },
        field("FIRST NAME", "firstName", "text", { req: true }),
        field("LAST NAME", "lastName", "text", { req: true }),
      ),
      el("div", { class: "form-row three" },
        field("DATE OF BIRTH", "dateOfBirth", "date", { req: true }),
        selectField("SEX", "sex", [
          { value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "unknown", label: "Unknown" }
        ], { req: true }),
        field("SSN (optional)", "socialSecurityNumber", "text", { hint: "Last 4 sufficient for most providers", placeholder: "***-**-1234" }),
      ),
      el("div", { class: "form-row" },
        field("MOBILE", "mobile", "tel"),
        field("EMAIL", "email", "email"),
      ),

      el("h3", { class: "card-title", style: "margin-top:8px" }, "MATTER & SERVICE DATES"),
      el("div", { class: "form-row" },
        selectField("MATTER TYPE", "matterType", [
          "Motor Vehicle","Trucking","Rideshare","Catastrophic Injury","Premises","Family Law","Mass Torts","Other"
        ].map(v => ({ value: v, label: v })), { req: true }),
        field("ASSIGNED ATTORNEY", "attorney"),
      ),
      el("div", { class: "form-row three" },
        field("DATE OF SERVICE — START", "startDateOfService", "date"),
        field("DATE OF SERVICE — END",   "endDateOfService", "date"),
        field("AUTH EXPIRATION",         "authorizationExpirationDate", "date", { hint: "Default 12 months from today" }),
      ),

      el("h3", { class: "card-title", style: "margin-top:8px" }, "AUTHORIZATION"),
      el("div", { class: "form-row" },
        selectField("AUTH TYPE", "authorizationType", [
          { value: "Hipaa", label: "HIPAA" }, { value: "Hitech", label: "HITECH" }
        ], { req: true }),
        selectField("CLIENT CAPACITY", "capacity", [
          { value: "SelfAuthorizing", label: "Self-Authorizing" },
          { value: "Minor", label: "Minor (parent/guardian signs)" },
          { value: "Deceased", label: "Deceased (estate signs)" },
          { value: "Comatose", label: "Comatose" },
          { value: "CognitivelyImpaired", label: "Cognitively Impaired" },
          { value: "LegallyIncapacitated", label: "Legally Incapacitated" },
          { value: "PowerOfAttorney", label: "Power of Attorney" },
        ], { req: true }),
      ),

      el("div", { class: "consent", style: "margin-top:8px" },
        "I confirm that the client has signed a TMT representation agreement and HIPAA-compliant authorization. The authorization PDF will be uploaded on the next screen and run through automated auth-check before any record request goes out."),

      el("div", { class: "row", style: "justify-content:flex-end; margin-top:16px; gap:10px" },
        el("a", { class: "btn btn-ghost", href: "#/cases" }, "CANCEL"),
        el("button", { type: "submit", class: "btn btn-primary" }, "OPEN CASE & UPLOAD AUTH"),
      ),
    ),
  );
}

function viewNewRequest(pid) {
  const p = F.patientById(pid);
  if (!p) return el("div", {}, el("h1", {}, "Case not found"));

  const draft = {
    siteId: null,
    medicalRecord: true, billing: true, imaging: false,
  };
  let searchTerm = "";
  let resultsHost = el("div", {});

  function runFinder() {
    resultsHost.innerHTML = "";
    const q = searchTerm.trim().toLowerCase();
    const list = !q ? F.SITES.slice(0,3) :
      F.SITES.filter(s => `${s.name} ${s.city} ${s.state}`.toLowerCase().includes(q));
    if (!list.length) {
      resultsHost.appendChild(el("div", { class: "muted", style: "padding:14px; color:var(--stone)" }, "No matches. Try a partial name, city, or address."));
      return;
    }
    list.forEach(s => {
      const card = el("div", { class: "site-result" + (draft.siteId === s.id ? " selected" : ""), onclick: () => { draft.siteId = s.id; runFinder(); } },
        el("div", {},
          el("div", { class: "nm" }, s.name),
          el("div", { class: "ad" }, `${s.addressLine1} · ${s.city}, ${s.state} ${s.zip}`),
          el("div", { class: "badges" },
            el("span", { class: "pill live" }, s.primarySpecialty),
            s.recordsFax ? el("span", { class: "pill done" }, "Fax: " + s.recordsFax) : null
          )
        ),
        el("div", {},
          draft.siteId === s.id
            ? el("span", { class: "pill ok" }, "✓ Selected")
            : el("button", { class: "btn btn-ghost btn-sm" }, "SELECT")
        ),
      );
      resultsHost.appendChild(card);
    });
  }

  function submit(e) {
    e.preventDefault();
    if (!draft.siteId) { alert("Pick a provider before submitting."); return; }
    if (!draft.medicalRecord && !draft.billing && !draft.imaging) {
      alert("Choose at least one record type."); return;
    }
    const today = new Date().toISOString().slice(0,10);
    const id = "rr_" + Math.floor(Math.random() * 90000);
    state.requests.push({
      id, patientId: pid, siteId: draft.siteId,
      medicalRecord: draft.medicalRecord, billing: draft.billing, imaging: draft.imaging,
      status: "Pending",
      createdAt: today, updatedAt: today,
      timeline: [{ ts: today, what: "Request Created — entering auth-check & site verification", status: "Pending", by: "Sarah Chen" }],
    });
    navigate("#/requests/" + id);
  }

  runFinder();

  return el("form", { onsubmit: submit },
    el("div", { class: "page-head" },
      el("div", {},
        el("div", { class: "eyebrow" }, "NEW RECORD REQUEST"),
        el("h1", {}, `Chase records for ${p.firstName} ${p.lastName}.`),
        el("p", { class: "sub" }, "Find the provider, pick what you need, and we take it from there. Auth-check runs automatically; status streams back as Hermes works it."),
      ),
      el("a", { class: "btn btn-ghost", href: "#/cases/" + pid }, "CANCEL"),
    ),

    el("div", { class: "card mb-16" },
      el("h3", { class: "card-title" }, "1. PROVIDER (SITE FINDER)"),
      el("div", { class: "row mb-16" },
        el("input", { class: "search", placeholder: "Hospital, clinic, imaging center…", style: "flex:1; padding:11px 12px; background:var(--black); border:1px solid var(--line); border-radius:4px; color:var(--bone)",
          oninput: (e) => { searchTerm = e.target.value; runFinder(); } }),
        el("button", { type: "button", class: "btn btn-ghost btn-sm" }, "SEARCH"),
      ),
      resultsHost,
      el("div", { class: "hint", style: "color:var(--stone); font-size:12px; margin-top:10px" },
        "Hermes site-finder geocodes, embedding-searches, and AI-matches the provider — including records fax, ROI portal, and any site-specific authorization requirement."),
    ),

    el("div", { class: "card mb-16" },
      el("h3", { class: "card-title" }, "2. WHAT TO REQUEST"),
      el("div", { class: "form-row three" },
        toggleField("MEDICAL RECORD", "medicalRecord", draft, "Charts, notes, labs, discharge summaries"),
        toggleField("BILLING",        "billing",       draft, "Itemized billing & UB-04"),
        toggleField("IMAGING",        "imaging",       draft, "DICOM + radiology reports"),
      ),
    ),

    el("div", { class: "consent" },
      "By submitting, I confirm the patient authorization on file covers the date range and information categories selected. Hermes will run an automated auth-check before any provider contact."),

    el("div", { class: "row", style: "justify-content:flex-end; margin-top:16px; gap:10px" },
      el("a", { class: "btn btn-ghost", href: "#/cases/" + pid }, "CANCEL"),
      el("button", { type: "submit", class: "btn btn-primary" }, "SUBMIT REQUEST"),
    )
  );
}

function toggleField(label, key, target, hint) {
  const inp = el("input", { type: "checkbox", checked: target[key] ? "true" : false, onchange: (e) => target[key] = e.target.checked, style: "width:auto" });
  return el("div", { class: "card", style: "padding:14px; cursor:pointer", onclick: (e) => { if (e.target.tagName !== "INPUT") { inp.checked = !inp.checked; target[key] = inp.checked; } } },
    el("div", { class: "row", style: "gap:10px" },
      inp,
      el("div", {},
        el("div", { style: "font-family:var(--display); letter-spacing:0.14em; color:var(--gold); font-size:13px" }, label),
        el("div", { class: "hint", style: "color:var(--stone-2); font-size:12px; margin-top:2px" }, hint),
      )
    )
  );
}

function viewAllRequests() {
  return el("div", {},
    el("div", { class: "page-head" },
      el("div", {},
        el("div", { class: "eyebrow" }, "REQUESTS"),
        el("h1", {}, "Every chase, every status."),
      ),
    ),
    el("div", { class: "table-wrap" },
      el("div", { class: "toolbar" },
        el("input", { class: "search", placeholder: "Filter by client, provider, status…" }),
        el("select", {}, ...["All statuses","Pending","RequestSent","RequestConfirmed","Completed","AuthDenied","PaymentPending"].map(s => el("option", {}, s))),
      ),
      el("table", { class: "data" },
        el("thead", {}, el("tr", {},
          el("th", {}, "Request"), el("th", {}, "Client"), el("th", {}, "Provider"),
          el("th", {}, "Type"), el("th", {}, "Status"), el("th", {}, "Updated"))),
        el("tbody", {}, ...state.requests.slice().sort((a,b)=> new Date(b.updatedAt) - new Date(a.updatedAt)).map(r => {
          const p = F.patientById(r.patientId);
          const s = F.siteById(r.siteId);
          const types = [r.medicalRecord && "M", r.billing && "B", r.imaging && "I"].filter(Boolean).join(" · ");
          return el("tr", { onclick: () => navigate("#/requests/" + r.id) },
            el("td", { class: "lead" }, "#" + r.id.replace("rr_","")),
            el("td", {}, p ? `${p.lastName}, ${p.firstName}` : "—"),
            el("td", {}, s ? s.name : el("span", { class: "muted" }, "—")),
            el("td", {}, types),
            el("td", {}, statusPill(r.status)),
            el("td", { class: "muted" }, fmtDate(r.updatedAt)),
          );
        }))
      )
    )
  );
}

function viewRequestDetail(rid) {
  const r = F.requestById(rid) || state.requests.find(x => x.id === rid);
  if (!r) return el("div", {}, el("h1", {}, "Request not found"));
  const p = F.patientById(r.patientId);
  const s = F.siteById(r.siteId);

  // Build status timeline
  const allStatuses = ["Pending","InfoConfirmed","SiteConfirmed","RequestSent","RequestConfirmed","Completed"];
  const idx = allStatuses.indexOf(r.status);

  const tl = el("div", { class: "timeline" });
  r.timeline.forEach((t, i) => {
    const last = i === r.timeline.length - 1;
    tl.appendChild(
      el("div", { class: "tl-item " + (last ? "current" : "done") },
        el("div", { class: "when" }, fmtDate(t.ts) + " · " + t.by),
        el("div", { class: "what" }, t.what),
        el("div", { class: "detail" }, F.statusInfo(t.status).label),
      )
    );
  });

  return el("div", {},
    el("div", { class: "page-head" },
      el("div", {},
        el("div", { class: "eyebrow" }, "RECORD REQUEST · #" + r.id.replace("rr_","")),
        el("a", { href: "#/cases/" + r.patientId, style: "color:var(--stone-2); font-size:12px" }, "← Back to case"),
      ),
      el("div", { class: "row" }, statusPill(r.status)),
    ),

    el("div", { class: "case-head" },
      el("div", {},
        el("h2", { class: "name" }, s ? s.name : "Provider not yet selected"),
        el("div", { class: "row", style: "margin-top:6px; gap:10px" },
          requestTypeChips(r),
        ),
        el("div", { class: "meta" },
          metaItem("CLIENT",     p ? `${p.firstName} ${p.lastName}` : "—"),
          metaItem("MATTER",     p ? p.matterType : "—"),
          metaItem("DOS START",  fmtDate(p ? p.startDateOfService : null)),
          metaItem("DOS END",    fmtDate(p ? p.endDateOfService   : null)),
          metaItem("CREATED",    fmtDate(r.createdAt)),
          metaItem("UPDATED",    fmtDate(r.updatedAt)),
          metaItem("PROV. FAX",  s ? (s.recordsFax || "—") : "—"),
          r.pages ? metaItem("PAGES", r.pages.toLocaleString()) : null,
        ),
      ),
      el("div", { class: "col" },
        r.status === "Completed"
          ? el("button", { class: "btn btn-primary" }, "DOWNLOAD RECORDS")
          : el("button", { class: "btn btn-ghost btn-sm" }, "RESEND TO PROVIDER"),
        el("button", { class: "btn btn-ghost btn-sm" }, "ADD NOTE"),
        el("button", { class: "btn btn-ghost btn-sm" }, "CANCEL REQUEST"),
      ),
    ),

    el("div", { class: "grid-2 mt-24" },
      el("div", { class: "card gold-edge" },
        el("h3", { class: "card-title" }, "STATUS TIMELINE"),
        tl,
      ),
      el("div", { class: "card" },
        el("h3", { class: "card-title" }, "DELIVERABLES"),
        r.status === "Completed"
          ? el("div", {},
              el("div", { class: "site-result" },
                el("div", {},
                  el("div", { class: "nm" }, "records-" + r.id + ".pdf"),
                  el("div", { class: "ad" }, `${r.pages || "—"} pages · OCR'd · Bates-stamped · indexed`),
                  el("div", { class: "badges" },
                    el("span", { class: "pill ok" }, "Delivered"),
                    el("span", { class: "pill done" }, fmtDate(r.updatedAt)),
                    el("span", { class: "pill live" }, "Searchable")
                  ),
                ),
                el("div", { class: "row" },
                  el("button", { class: "btn btn-ghost btn-sm", onclick: () => navigate(`#/cases/${r.patientId}`) }, "SEARCH"),
                  el("button", { class: "btn btn-primary btn-sm" }, "DOWNLOAD")
                )
              )
            )
          : el("p", { class: "muted", style: "color:var(--stone)" }, "No deliverables yet. Files appear here the moment the provider responds."),
      ),
    ),

    // This chart's contribution to the case (TMT AI layer)
    r.status === "Completed" && p ? renderChartContribution(p, r) : null,
  );
}

function renderChartContribution(p, r) {
  const review = F.aiReviewFor(p.id);
  if (!review || review.gradeNumeric === 0) return null;
  const visits = F.VISITS.filter(v => v.siteId === r.siteId && v.patientId === p.id);
  const dxSet = new Set(); visits.forEach(v => v.dxCodes.forEach(c => dxSet.add(c)));
  const dxList = [...dxSet].slice(0, 6);

  // Sample pages from this delivery — link to chart-page viewer
  const visitIds = new Set(visits.map(v => v.id));
  const sitePages = F.CHART_PAGES.filter(pg => pg.patientId === p.id && visitIds.has(pg.visitId));
  const thumbStrip = sitePages.length ? el("div", { class: "mt-24" },
    el("div", { class: "score-label", style: "font-family:var(--display); letter-spacing:0.16em; color:var(--stone-2); font-size:11px; margin-bottom:10px" },
      `SAMPLE PAGES FROM THIS DELIVERY · ${sitePages.length} indexed`),
    el("div", { class: "thumb-strip" },
      ...sitePages.map(pg => el("a", { class: "thumb", href: `#/cases/${p.id}/chart/${pg.page}` },
        el("div", { class: "ttl" }, pg.docType),
        el("div", { class: "body" }, pg.text.slice(0, 240)),
        el("div", { class: "pageno" }, "p." + pg.page),
      ))
    )
  ) : null;

  return el("div", { class: "card mt-24 gold-edge" },
    el("h3", { class: "card-title" }, "THIS CHART'S CONTRIBUTION TO CASE STRENGTH"),
    el("p", { style: "color:var(--stone-2); margin-top:0" },
      `Hermes extracted ${visits.length} visit${visits.length===1?"":"s"} and ${dxSet.size} unique diagnoses from this delivery. Below are the highest-value findings the AI flagged for use in the demand package.`),
    el("div", { class: "rating-grid" },
      ratingCard("CASE GRADE", review.grade, `${review.gradeNumeric}/100 (case-level rollup)`),
      ratingCard("CAUSATION CONTRIBUTION", review.causation?.rating || "—", "Mechanism + early imaging timestamps"),
      ratingCard("DAMAGES SUPPORT", review.damages?.rating || "—", F.fmtCents(review.damages?.mid)),
      ratingCard("CONFIDENCE", Math.round(review.confidence * 100) + "%", "Courtroom outcome confidence"),
    ),
    dxList.length ? el("div", { class: "mt-24" },
      el("div", { class: "score-label", style: "font-family:var(--display); letter-spacing:0.16em; color:var(--stone-2); font-size:11px; margin-bottom:6px" }, "DIAGNOSES IN THIS DELIVERY"),
      el("div", { class: "row", style: "flex-wrap:wrap; gap:6px" },
        ...dxList.map(c => el("span", { class: "code-chip dx", title: F.dxCode(c).long }, c + " — " + F.dxCode(c).short))
      )
    ) : null,
    thumbStrip,
  );
}

// -------- Sample Chart Page (rendered as a faux PDF page) --------
function viewChartPage(pid, pageNum) {
  const p = F.patientById(pid);
  const pages = F.chartPagesByPatient(pid);
  const idx = pages.findIndex(pg => pg.page === pageNum);
  if (idx < 0 || !p) return el("div", {}, el("h1", {}, "Chart page not found"));
  const page = pages[idx];
  const visit = F.VISITS.find(v => v.id === page.visitId);
  const site = F.SITES.find(s => s.name === page.site) || (visit ? F.siteById(visit.siteId) : null);
  const totalPages = Math.max(...pages.map(p => p.page)) + Math.floor(Math.random()*5+10);

  const prev = pages[idx - 1];
  const next = pages[idx + 1];

  // Bates stamp: TMT-<patient seq>-<page padded>
  const patSeq = String(parseInt((pid.match(/(\d+)/) || [0,0])[1], 10)).padStart(3,"0");
  const bates = `TMT-${patSeq}-${String(page.page).padStart(4,"0")}`;
  const mrn = "MRN-" + (pid.replace("pat_","")) + "-" + (site?.id || "x").replace("site_","s");
  const acct = "ACT-" + Math.floor(Math.random()*900000+100000);

  return el("div", {},
    el("div", { class: "page-head" },
      el("div", {},
        el("div", { class: "eyebrow" }, "CHART PAGE · " + page.docType.toUpperCase()),
        el("a", { href: "#/cases/" + pid + "?tab=2", style: "color:var(--stone-2); font-size:12px" }, "← Back to search records"),
      ),
      el("div", { class: "row" },
        prev ? el("a", { class: "btn btn-ghost btn-sm", href: `#/cases/${pid}/chart/${prev.page}` }, "← Page " + prev.page) : null,
        next ? el("a", { class: "btn btn-ghost btn-sm", href: `#/cases/${pid}/chart/${next.page}` }, "Page " + next.page + " →") : null,
        el("button", { class: "btn btn-primary btn-sm" }, "DOWNLOAD PAGE"),
      )
    ),

    el("div", { class: "chart-page-wrap" },
      el("div", { class: "chart-page" },
        // Letterhead
        el("div", { class: "chart-letterhead" },
          el("div", { class: "chart-logo" }, ((site?.name || "?").split(" ")[0][0] || "B") + ((site?.name || "?").split(" ")[1]?.[0] || "M")),
          el("div", {},
            el("div", { class: "name" }, site ? site.name : page.site),
            el("div", { class: "addr" },
              site ? `${site.addressLine1} · ${site.city}, ${site.state} ${site.zip}` : "",
              site?.recordsFax ? "  ·  Records Fax: " + site.recordsFax : "",
              site?.primarySpecialty ? "  ·  " + site.primarySpecialty : ""
            ),
          )
        ),

        // Patient banner
        el("div", { class: "patient-banner" },
          el("div", { class: "field" }, el("div", { class: "lbl" }, "Patient"),       el("div", { class: "val" }, `${p.lastName}, ${p.firstName}`)),
          el("div", { class: "field" }, el("div", { class: "lbl" }, "DOB"),           el("div", { class: "val" }, fmtDate(p.dateOfBirth))),
          el("div", { class: "field" }, el("div", { class: "lbl" }, "Sex"),           el("div", { class: "val" }, ucase(p.sex))),
          el("div", { class: "field" }, el("div", { class: "lbl" }, "MRN"),           el("div", { class: "val" }, mrn.toUpperCase())),
          el("div", { class: "field" }, el("div", { class: "lbl" }, "Account #"),     el("div", { class: "val" }, acct)),
          el("div", { class: "field" }, el("div", { class: "lbl" }, "DOS"),           el("div", { class: "val" }, fmtDate(visit?.visitDate || page.visitId))),
          el("div", { class: "field" }, el("div", { class: "lbl" }, "Provider"),      el("div", { class: "val" }, visit?.provider || "—")),
          el("div", { class: "field" }, el("div", { class: "lbl" }, "Encounter"),     el("div", { class: "val" }, visit?.encounterType || page.docType)),
        ),

        // Doc title
        el("div", {}, el("div", { class: "chart-doc-title" }, page.docType)),
        el("div", { class: "chart-meta" },
          el("div", {}, el("div", { class: "k" }, "Service Date"), el("div", { class: "v" }, fmtDate(visit?.visitDate || ""))),
          el("div", {}, el("div", { class: "k" }, "Encounter Type"), el("div", { class: "v" }, visit?.encounterType || "—")),
          el("div", {}, el("div", { class: "k" }, "Page Reference"),  el("div", { class: "v" }, "Page " + page.page + " of " + totalPages)),
        ),

        // Chief complaint section
        visit?.chiefComplaint ? el("div", { class: "chart-section" },
          el("h4", {}, "Chief Complaint / Reason for Visit"),
          el("p", {}, visit.chiefComplaint),
        ) : null,

        // Body — split into paragraphs for visual weight
        el("div", { class: "chart-section" },
          el("h4", {}, sectionHeadingFor(page.docType)),
          ...page.text.split(/(?<=\.)\s+(?=[A-Z])/).map(s => el("p", {}, s)),
        ),

        // Codes block
        visit?.dxCodes?.length ? el("div", { class: "chart-codes" },
          el("div", { class: "row" },
            el("span", { class: "lbl" }, "ICD-10:"),
            ...visit.dxCodes.map(c => el("code", {}, c + " " + (F.dxCode(c).short || ""))),
          ),
          visit.cptCodes?.length ? el("div", { class: "row", style: "margin-top:4px" },
            el("span", { class: "lbl" }, "CPT:"),
            ...visit.cptCodes.map(c => el("code", {}, c + " " + (F.cptCode(c) || ""))),
          ) : null,
        ) : null,

        // Signature
        el("div", { class: "chart-signature" },
          el("div", { style: "flex:1; max-width:60%" },
            el("div", { class: "sig-line" }),
            el("div", { class: "sig-meta", style: "margin-top:6px" }, (visit?.provider || "Attending Physician") + ", MD · NPI " + Math.floor(Math.random()*9000000000+1000000000))
          ),
          el("div", {},
            el("div", { class: "sig-meta" }, "Authenticated " + fmtDate(visit?.visitDate || "")),
            el("div", { class: "sig-meta" }, "Time-stamped 14:32 MST"),
          ),
        ),

        // Footer
        el("div", { class: "chart-footer" },
          el("div", { class: "bates" }, "BATES " + bates),
          el("div", {}, "Page " + page.page + " of " + totalPages + " · " + page.docType),
          el("div", {}, "TMT Records · Hermes Health"),
        ),
      )
    ),

    el("div", { class: "card mt-24" },
      el("h3", { class: "card-title" }, "ABOUT THIS PAGE"),
      el("p", { style: "color:var(--stone-2); font-size:13px" },
        "OCR'd, indexed, Bates-stamped, and tied to the Hermes-extracted visit ", el("code", {}, page.visitId), ". Searchable from the case-level Search Records tab. Diagnosis and procedure codes auto-extracted into ", el("code", {}, "/v0/diagnoses/browse"), " and ", el("code", {}, "/v0/procedures/browse"), "."),
    )
  );
}
function sectionHeadingFor(docType) {
  const m = docType.toLowerCase();
  if (m.includes("ed") || m.includes("trauma")) return "History of Present Illness · Examination";
  if (m.includes("imaging")) return "Findings · Impression";
  if (m.includes("ortho") || m.includes("pt"))  return "Subjective · Objective · Assessment · Plan";
  if (m.includes("procedure")) return "Procedure Note";
  return "Clinical Documentation";
}

function viewHandoff() {
  const rows = [
    ["Login",                          "POST /v0/auth (out of scope of public spec)", "Bearer token. Every subsequent call sends Authorization: Bearer <token>. Roles: customer_admin, customer_standard, customer_delivery, delivery, visits_only."],
    ["Dashboard · request KPIs",       "POST /v0/record-requests/browse", "Aggregate counts by RequestStatus. Multiple where: variants drive each tile."],
    ["Dashboard · chart-grade KPIs",   "TMT AI Layer (built on top)", "Rolls up per-patient AI review scores (grade, confidence, projected damages mid-band). Source data = visits + diagnoses + chart pages from Hermes."],
    ["Cases (list)",                   "POST /v0/patients/browse",  "select PatientFields, where projectId, free-text search via search:."],
    ["Case detail",                    "GET  /v0/companies/{cid}/projects/{pid}/patients/{patid}", "Returns patient + nested authorization."],
    ["Case detail · request requests tab", "POST /v0/record-requests/browse", "where: { patientId } — same browse contract."],
    ["Case detail · Chart Review tab", "TMT AI Layer (synthesis pipeline)", "Inputs: Hermes /visits/browse, /diagnoses/browse, /procedures/browse + raw deliverable PDFs (OCR'd). Outputs: grade letter, gradeNumeric (0-100), confidence, supporting facts, gaps, causation rating, damages range, recommendations, Q&A."],
    ["Case detail · Search Records tab", "TMT search index (built atop Hermes deliverables)", "Pull deliverable PDFs via GET .../deliverables/{filename}, OCR + index page-level (e.g. OpenSearch). Include visit + dx context as facets."],
    ["Case detail · Visits & Codes tab", "POST /v0/visits/browse + /v0/diagnoses/browse + /v0/procedures/browse + /v0/diagnosis-codes/browse + /v0/procedure-codes/browse", "Hermes already structured-extracts encounter type, dates, ICD-10 dx, CPT procedures. Render in timeline + frequency tables."],
    ["Case detail · Authorization tab", "GET .../patients/{patid}/authorization + POST /v0/auth-check/{filename}/retrigger", "Hermes auth-check returns CheckStatus (Passed/Failed/Warning) per dimension (signature, DOS, attestation, PHI match)."],
    ["Patient search-level toggle",    "PATCH .../patients/{patid}/search-level", "SearchLevel = None | SiteSonar | PatientHistory. PatientHistory finds all sites where the patient was ever seen (broadest)."],
    ["New case",                       "POST /v0/companies/{cid}/projects/{pid}/patients", "Body = PatientForm. Required: firstName, lastName, dateOfBirth, sex. Plus DOS window, capacity, authType, ssn (mask in UI)."],
    ["New case · upload auth",         "PUT .../patients/{patid}/authorization → POST .../authorization/uploaded", "Multipart upload to presigned URL, then mark-for-approval. Auth-check runs automatically."],
    ["New request · provider lookup",  "POST /v0/site-finder", "Body = SiteResolutionInput (name + addressLine1 required). Returns { jobId }. Async — poll the job."],
    ["New request · poll site",        "GET /v0/site-finder/jobs/{job_id}", "SiteFinderJobStatus = pending | running | completed | failed. Resolved site has stable site_id."],
    ["New request · submit",           "POST .../patients/{patid}/record-requests", "Body = RecordRequestForm: siteId + medicalRecord/billing/imaging (all three required booleans, ≥1 true)."],
    ["Request detail",                 "GET .../record-requests/{request_id}", "Status timeline + RequestType array + DeliveryMethod history (Fax/Email/Mail/RoiPortal/EhrPortal/RoiApi/EhrApi/SitePortal)."],
    ["Per-request authorization",      "GET .../record-requests/{request_id}/authorization", "Per-request auth-check (some sites require site-specific auth)."],
    ["Deliverables — list",            "GET .../record-requests/{rrid}/deliverables", "Final delivered files."],
    ["Deliverable — download",         "GET .../record-requests/{rrid}/deliverables/{filename}", "Returns presigned S3 URL for the PDF."],
    ["Documents (working)",            "GET .../record-requests/{rrid}/documents", "Working docs (cover sheets, follow-ups). Distinct from deliverables."],
    ["Site detail",                    "GET /v0/sites/{site_id}", "Returns site + departments (medical, facilityBilling, physicianBilling, imagingBilling, ER, anesthesiology, imaging) — each can have its own ROI/contact."],
    ["Site research (AI)",             "POST /v0/sites/{site_id}/research", "Triggers AI research for the site (records contacts, fees, e-sig acceptance, request method)."],
    ["Sites browse",                   "POST /v0/sites/browse", "Internal sites directory."],
    ["Add note (request)",             "POST .../record-requests/{rrid}/notes", "Team notes on the request. PATCH/DELETE supported."],
    ["Add note (case)",                "POST .../patients/{patid}/notes", "Team notes on the case."],
    ["Project files",                  "PUT/GET .../projects/{pid}/{filename}", "Project-level docs: representation letter, request letter — apply to every record-request."],
    ["Patient queue (delivery role)",  "POST /v0/patients/queue", "Atomically claim next unowned patient — for back-office/delivery operators."],
    ["Webhook ingest",                 "POST /v0/webhooks (consume only)", "Status changes stream from Hermes. Wire to a worker → SSE for live dashboard."],
  ];

  return el("div", {},
    el("div", { class: "page-head" },
      el("div", {},
        el("div", { class: "eyebrow" }, "DEV HANDOFF"),
        el("h1", {}, "MVP → production: the build sheet."),
        el("p", { class: "sub" }, "This MVP runs on fixtures. Each screen below maps to the Hermes Health API endpoint dev should wire next. Bearer auth across the board."),
      ),
    ),

    el("div", { class: "grid-2" },
      el("div", { class: "card" },
        el("h3", { class: "card-title" }, "HERMES API · COMPANY MODEL"),
        el("ul", { style: "color:var(--stone-2); font-size:13px; padding-left:18px; line-height:1.7" },
          el("li", {}, "TMT is a Hermes ", el("b", {}, "company"), " with ", el("code", {}, "purpose = LegalPlaintiff"), "."),
          el("li", {}, "Each TMT case = one Hermes ", el("b", {}, "patient"), " (the injured client)."),
          el("li", {}, "All cases live under a single ", el("b", {}, "project"), " (e.g. ", el("code", {}, "tmt-proj-mva-2026"), "). Multiple projects for vertical separation."),
          el("li", {}, "Each chase is a ", el("b", {}, "record-request"), " against a resolved ", el("b", {}, "site"), " (provider). RequestType: MedicalRecord, Billing (+sub-types), Imaging."),
          el("li", {}, "Hermes does the ", el("b", {}, "structured extraction"), ": ", el("code", {}, "visits"), ", ", el("code", {}, "diagnoses"), " (ICD-10), ", el("code", {}, "procedures"), " (CPT), ", el("code", {}, "auth-check"), " analysis."),
          el("li", {}, "Status flow: ", el("code", {}, "Pending → InfoConfirmed → SiteConfirmed → RequestSent → RequestConfirmed → Completed"), "; failure branches: ", el("code", {}, "AuthDenied, PaymentPending, FacilityRefusal, NoRecordFound"), "."),
        ),
      ),
      el("div", { class: "card gold-edge" },
        el("h3", { class: "card-title" }, "TMT AI LAYER · ARCHITECTURE"),
        el("p", { style: "color:var(--stone-2); font-size:13px; margin:0 0 10px" },
          "Three TMT-built capabilities sit ON TOP of Hermes' structured data — they are NOT Hermes endpoints. Architect dev around this distinction."),
        el("ul", { style: "color:var(--stone-2); font-size:13px; padding-left:18px; line-height:1.7" },
          el("li", {}, el("b", { style: "color:var(--gold)" }, "1. Records Search"),
            " — pull each completed deliverable PDF, OCR + index page-level. Stack: Apache Tika or PDF.js for text → OpenSearch with the patient as tenant key. Facets: visit, dx code, doc type, site, date."),
          el("li", {}, el("b", { style: "color:var(--gold)" }, "2. Chart Review (Agentic)"),
            " — pipeline triggered by Hermes ",
            el("code", {}, "RequestStatus = Completed"), " webhook. Inputs: Hermes structured visits + diagnoses + procedures + raw OCR'd text. Output JSON: ",
            el("code", {}, "{ grade, gradeNumeric, confidence, causation, treatmentChain, damages, preExisting, facts[], gaps[], recommendations[], qa[] }"), ". Store on a TMT-owned ",
            el("code", {}, "ChartReview"), " table keyed by patientId; rerun on every new delivery."),
          el("li", {}, el("b", { style: "color:var(--gold)" }, "3. Q&A interface"),
            " — RAG over the indexed records. LLM-backed; cite back to page numbers and visit IDs. Predefined prompts cover 80% of attorney questions; free-form input handles the rest."),
        ),
      ),
    ),

    el("div", { class: "card mt-24" },
      el("h3", { class: "card-title" }, "AGENTIC CHART REVIEW · OUTPUT CONTRACT"),
      el("p", { style: "color:var(--stone-2); font-size:13px" },
        "This is the JSON the Chart-Review pipeline emits. It's the source of truth for the Chart Review tab, dashboard chart-grade KPIs, and the per-request contribution panel. Lock this contract early — every screen consumes it."),
      el("pre", { style: "background:var(--black); border:1px solid var(--line); border-radius:4px; padding:14px; overflow:auto; font-size:11px; color:var(--bone); line-height:1.5" },
`{
  "patientId": "pat_1001",
  "lastRunAt": "2026-05-07T18:42:00Z",
  "grade": "A-",                     // letter, A+ … F
  "gradeNumeric": 88,                // 0..100
  "confidence": 0.83,                // 0..1, courtroom outcome confidence
  "summary": "...",                  // 2–3 sentence narrative
  "causation":     { "rating": "Strong | Moderate | Weak", "detail": "..." },
  "treatmentChain":{ "rating": "Continuous | Sparse | Incomplete", "detail": "..." },
  "damages":       { "rating": "Catastrophic | Well-supported | Modest | Pending",
                     "low": 380000, "mid": 620000, "high": 940000, "detail": "..." },
  "preExisting":   { "rating": "Clean | Mild | Material", "detail": "..." },
  "facts":           [ "Documented LOC ~30 sec — ED note p.5", ... ],
  "gaps":            [ "No neuropsych eval despite reported PCS", ... ],
  "recommendations": [ "Order neuropsych battery", ... ],
  "qa": [ { "q": "...", "a": "...", "citations": [{ "page": 43, "visitId": "v_002" }] } ]
}`),
    ),

    el("div", { class: "card mt-24" },
      el("h3", { class: "card-title" }, "SCREEN → API MAP"),
      ...rows.map(([screen, ep, notes]) => {
        const [verb, ...rest] = ep.split(" ");
        return el("div", { class: "api-row" },
          el("span", { class: "verb " + verb }, verb),
          el("div", {},
            el("div", { style: "font-family:var(--serif); color:var(--white); font-weight:600" }, screen),
            el("code", { class: "path" }, rest.join(" ")),
          ),
          el("div", { style: "color:var(--stone-2); font-size:12px" }, notes),
        );
      }),
    ),

    el("div", { class: "card mt-24 gold-edge" },
      el("h3", { class: "card-title" }, "BRAND TOKENS (keep these — they're the spine of the system)"),
      el("div", { class: "grid-3" },
        ...[
          ["BLACK","#0A0A0A","Surface · 95% of brand"],
          ["GOLD","#D4AF37","Primary CTA · accents · KPI numerals"],
          ["GOLD BRIGHT","#F2C744","Hover / current-state"],
          ["BONE","#F7F5EF","Body text on dark"],
          ["TRUST BLUE","#1B3A57","Secondary accents only"],
          ["ALERT RED","#B22222","Reserved for AuthDenied / FacilityRefusal / Cancel only"],
        ].map(([n,h,note]) =>
          el("div", { class: "card" },
            el("div", { style: "height:48px; background:" + h + "; border-radius:4px; margin-bottom:8px; border:1px solid var(--line)" }),
            el("div", { style: "font-family:var(--display); letter-spacing:0.14em; color:var(--gold); font-size:12px" }, n),
            el("div", { style: "font-family:ui-monospace,monospace; color:var(--bone); font-size:12px" }, h),
            el("div", { style: "color:var(--stone); font-size:11px; margin-top:4px" }, note),
          )
        )
      ),
    ),
  );
}
