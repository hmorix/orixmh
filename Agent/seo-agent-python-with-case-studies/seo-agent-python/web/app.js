const state = {
  suggestions: [],
  selected: new Set(),
  jobsTimer: null,
};

// ---------- utils ----------
async function api(path, opts) {
  const res = await fetch(path, opts);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `${res.status} ${res.statusText}`);
  }
  return res.json();
}
function el(tag, attrs = {}, children = []) {
  const e = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") e.className = v;
    else if (k === "html") e.innerHTML = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  });
  (Array.isArray(children) ? children : [children]).forEach((c) => {
    if (c == null) return;
    e.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return e;
}
function fmtTime(ms) {
  if (!ms) return "";
  return new Date(ms).toLocaleString();
}
function showModal(node) {
  const modal = document.getElementById("modal");
  const content = document.getElementById("modalContent");
  content.innerHTML = "";
  content.appendChild(node);
  modal.classList.remove("hidden");
}
document.getElementById("modalClose").addEventListener("click", () => {
  document.getElementById("modal").classList.add("hidden");
});
document.getElementById("modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") document.getElementById("modal").classList.add("hidden");
});

// ---------- tabs ----------
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
    if (btn.dataset.tab === "daily") loadDailyPlan();
    if (btn.dataset.tab === "pending") loadPending();
    if (btn.dataset.tab === "casestudies") loadCaseStudiesTab();
    if (btn.dataset.tab === "whitepapers") loadWhitepapersTab();
    if (btn.dataset.tab === "press") loadPressTab();
    if (btn.dataset.tab === "uploaded") loadUploaded();
    if (btn.dataset.tab === "pages") loadPages();
    if (btn.dataset.tab === "rankings") loadRankings();
    if (btn.dataset.tab === "suggestions") loadSuggestions();
  });
});

// ---------- config ----------
async function loadConfig() {
  try {
    const cfg = await api("/api/config");
    document.getElementById("configInfo").textContent =
      `${cfg.pool_size} parallel worker${cfg.pool_size !== 1 ? "s" : ""} · ` +
      `rank-check: ${cfg.google_cse_configured ? "on" : "off"}`;
  } catch (e) {
    document.getElementById("configInfo").textContent = "config unavailable";
  }
}

// ---------- suggestions ----------
async function loadSuggestions() {
  const data = await api("/api/suggestions");
  state.suggestions = data.suggestions || [];
  state.selected.clear();
  renderSuggestions(data);
}

function renderSuggestions(data) {
  const list = document.getElementById("suggestionsList");
  const meta = document.getElementById("suggestionsMeta");
  list.innerHTML = "";
  if (!state.suggestions.length) {
    meta.textContent = 'No ideas yet — click "Generate Ideas".';
  } else {
    meta.textContent = `${state.suggestions.length} idea(s)` +
      (data.used_ranking_data ? " · weighted by real ranking data" : "") +
      (data.based_on_published_count != null ? ` · checked against ${data.based_on_published_count} published post(s)` : "");
  }
  state.suggestions.forEach((s, i) => {
    const checkbox = el("input", { type: "checkbox", onchange: (e) => {
      if (e.target.checked) state.selected.add(i); else state.selected.delete(i);
      updateSelectedCount();
    }});
    const card = el("div", { class: "card" }, [
      el("div", { class: "checkbox-row" }, [
        checkbox,
        el("div", {}, [
          el("div", { class: "card-title" }, s.title || "(untitled)"),
          el("div", { class: "card-meta" }, [
            el("span", { class: "tag" }, s.contentType || "blog"),
            el("span", {}, `keyword: ${s.targetKeyword || "—"}`),
            el("span", {}, `intent: ${s.searchIntent || "—"}`),
            el("span", {}, `difficulty: ${s.estimatedDifficulty || "—"}`),
          ]),
          el("div", { class: "card-rationale" }, s.rationale || ""),
        ]),
      ]),
    ]);
    list.appendChild(card);
  });
  updateSelectedCount();
}

function updateSelectedCount() {
  document.getElementById("selectedCount").textContent = `${state.selected.size} selected`;
  document.getElementById("btnGenerateSelected").disabled = state.selected.size === 0;
}

document.getElementById("btnGenerateSuggestions").addEventListener("click", async (e) => {
  const btn = e.target;
  const count = parseInt(document.getElementById("suggestCount").value, 10) || 10;
  btn.disabled = true;
  btn.textContent = "Generating...";
  try {
    const { job_id } = await api("/api/suggestions/generate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count }),
    });
    await pollUntilDone(job_id);
    await loadSuggestions();
  } catch (err) {
    alert(`Failed: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = "Generate Ideas";
  }
});

document.getElementById("btnGenerateSelected").addEventListener("click", async () => {
  const ideas = [...state.selected].map((i) => state.suggestions[i]);
  if (!ideas.length) return;
  try {
    await api("/api/generate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ideas }),
    });
    document.querySelector('.tab-btn[data-tab="jobs"]').click();
  } catch (err) {
    alert(`Failed: ${err.message}`);
  }
});

async function pollUntilDone(jobId) {
  for (;;) {
    const job = await api(`/api/jobs/${jobId}`);
    if (job.status === "done" || job.status === "error") {
      if (job.status === "error") throw new Error(job.error || "job failed");
      return job;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
}

// ---------- jobs ----------
async function loadJobs() {
  const jobs = await api("/api/jobs");
  const list = document.getElementById("jobsList");
  list.innerHTML = "";
  if (!jobs.length) {
    list.appendChild(el("div", { class: "hint" }, "No jobs yet."));
    return;
  }
  jobs.forEach((j) => {
    const title = (j.meta && (j.meta.title || j.meta.count)) || j.type;
    const elapsed = j.started_at
      ? `${Math.round(((j.finished_at || Date.now() / 1000) - j.started_at))}s`
      : "";
    const card = el("div", { class: "job-card" }, [
      el("div", { class: "job-top" }, [
        el("div", {}, [
          el("strong", {}, `${j.type}: `),
          el("span", {}, String(title)),
        ]),
        el("span", { class: `status-pill status-${j.status}` }, j.status),
      ]),
      el("div", { class: "job-progress" }, [
        j.key_label ? `${j.key_label} · ` : "",
        j.current_model ? `${j.current_model} · ` : "",
        `${j.chars_received || 0} chars received`,
        elapsed ? ` · ${elapsed}` : "",
        j.error ? ` · error: ${j.error}` : "",
      ].join("")),
      el("div", { class: "job-log" }, (j.log || []).join("\n") || "…"),
    ]);
    list.appendChild(card);
  });
}

function startJobsPolling() {
  if (state.jobsTimer) clearInterval(state.jobsTimer);
  loadJobs();
  state.jobsTimer = setInterval(loadJobs, 2000);
}

// ---------- case studies (summary view; full studio at /case-studies) ----------
async function loadCaseStudiesTab() {
  const banner = document.getElementById("caseStudiesLastUpdated");
  const list = document.getElementById("caseStudiesList");
  banner.textContent = "Loading…";
  list.innerHTML = "";
  try {
    const data = await api("/api/case-studies/all");
    banner.textContent = data.last_updated_ms
      ? `Last case study created ${fmtTime(data.last_updated_ms)}`
      : "No case studies generated yet — use the Case Studies Studio to create one.";
    if (!data.items.length) {
      list.appendChild(el("div", { class: "hint" }, "No case studies yet."));
      return;
    }
    data.items.forEach((item) => {
      const card = el("div", { class: "card" }, [
        el("div", { class: "card-top" }, [
          el("div", {}, [
            el("div", { class: "card-title" }, item.title || item.slug || "(untitled)"),
            el("div", { class: "card-meta" }, [
              el("span", { class: "tag" }, item.state),
              item.is_demo ? el("span", { class: "tag" }, "demo") : "",
              item.client_name ? el("span", {}, item.client_name) : "",
              item.word_count ? el("span", {}, `${item.word_count} words`) : "",
              el("span", {}, fmtTime(item.timestamp_ms)),
            ]),
          ]),
        ]),
        el("div", { class: "card-actions" }, [
          item.view_url ? el("a", { href: item.view_url }, [el("button", {}, "View")]) : "",
          item.download_url ? el("a", { href: item.download_url }, [el("button", {}, "Download HTML")]) : "",
          item.state === "draft" ? el("button", { class: "btn-accent", onclick: () => approvePendingCaseStudy(item.file) }, "Approve & Publish") : "",
        ]),
      ]);
      list.appendChild(card);
    });
  } catch (err) {
    banner.textContent = "";
    list.innerHTML = "";
    list.appendChild(el("div", { class: "hint" }, `Failed to load: ${err.message}`));
  }
}

async function approvePendingCaseStudy(file) {
  try {
    await api(`/api/case-studies/pending/${encodeURIComponent(file)}/approve`, { method: "POST" });
    loadCaseStudiesTab();
  } catch (err) {
    alert(`Approve failed: ${err.message}`);
  }
}

document.getElementById("btnRefreshCaseStudies").addEventListener("click", loadCaseStudiesTab);

// ---------- white papers (summary view; full studio at /whitepapers) ----------
async function loadWhitepapersTab() {
  const banner = document.getElementById("whitepapersLastUpdated");
  const list = document.getElementById("whitepapersList");
  banner.textContent = "Loading…";
  list.innerHTML = "";
  try {
    const data = await api("/api/whitepapers/all");
    banner.textContent = data.last_updated_ms
      ? `Last white paper created ${fmtTime(data.last_updated_ms)}`
      : "No white papers generated yet — use the White Papers Studio to create one.";
    if (!data.items.length) {
      list.appendChild(el("div", { class: "hint" }, "No white papers yet."));
      return;
    }
    data.items.forEach((item) => {
      const card = el("div", { class: "card" }, [
        el("div", { class: "card-top" }, [
          el("div", {}, [
            el("div", { class: "card-title" }, item.title || item.slug || "(untitled)"),
            el("div", { class: "card-meta" }, [
              el("span", { class: "tag" }, item.state),
              item.is_research ? el("span", { class: "tag" }, "research") : "",
              item.pdf_generated ? el("span", { class: "tag" }, "PDF ready") : "",
              item.topic ? el("span", {}, item.topic) : "",
              item.word_count ? el("span", {}, `${item.word_count} words`) : "",
              el("span", {}, fmtTime(item.timestamp_ms)),
            ]),
          ]),
        ]),
        el("div", { class: "card-actions" }, [
          item.view_url ? el("a", { href: item.view_url }, [el("button", {}, "View")]) : "",
          item.pdf_url ? el("a", { href: item.pdf_url }, [el("button", {}, "Download PDF")]) : "",
          item.state === "draft" ? el("button", { class: "btn-accent", onclick: () => approvePendingWhitepaper(item.file) }, "Approve & Publish") : "",
        ]),
      ]);
      list.appendChild(card);
    });
  } catch (err) {
    banner.textContent = "";
    list.innerHTML = "";
    list.appendChild(el("div", { class: "hint" }, `Failed to load: ${err.message}`));
  }
}

async function approvePendingWhitepaper(file) {
  try {
    await api(`/api/whitepapers/pending/${encodeURIComponent(file)}/approve`, { method: "POST" });
    loadWhitepapersTab();
  } catch (err) {
    alert(`Approve failed: ${err.message}`);
  }
}

document.getElementById("btnRefreshWhitepapers").addEventListener("click", loadWhitepapersTab);

// ---------- press (summary view; full studio at /press) ----------
async function loadPressTab() {
  const banner = document.getElementById("pressLastUpdated");
  const list = document.getElementById("pressList");
  banner.textContent = "Loading…";
  list.innerHTML = "";
  try {
    const data = await api("/api/press/all");
    banner.textContent = data.last_updated_ms
      ? `Last press release created ${fmtTime(data.last_updated_ms)}`
      : "No press releases generated yet — use the Press Studio to create one.";
    if (!data.items.length) {
      list.appendChild(el("div", { class: "hint" }, "No press releases yet."));
      return;
    }
    data.items.forEach((item) => {
      const card = el("div", { class: "card" }, [
        el("div", { class: "card-top" }, [
          el("div", {}, [
            el("div", { class: "card-title" }, item.title || item.slug || "(untitled)"),
            el("div", { class: "card-meta" }, [
              el("span", { class: "tag" }, item.state),
              item.is_research ? el("span", { class: "tag" }, "commentary") : "",
              item.pdf_generated ? el("span", { class: "tag" }, "PDF ready") : "",
              item.topic ? el("span", {}, item.topic) : "",
              item.word_count ? el("span", {}, `${item.word_count} words`) : "",
              el("span", {}, fmtTime(item.timestamp_ms)),
            ]),
          ]),
        ]),
        el("div", { class: "card-actions" }, [
          item.view_url ? el("a", { href: item.view_url }, [el("button", {}, "View")]) : "",
          item.pdf_url ? el("a", { href: item.pdf_url }, [el("button", {}, "Download PDF")]) : "",
          item.state === "draft" ? el("button", { class: "btn-accent", onclick: () => approvePendingPress(item.file) }, "Approve & Publish") : "",
        ]),
      ]);
      list.appendChild(card);
    });
  } catch (err) {
    banner.textContent = "";
    list.innerHTML = "";
    list.appendChild(el("div", { class: "hint" }, `Failed to load: ${err.message}`));
  }
}

async function approvePendingPress(file) {
  try {
    await api(`/api/press/pending/${encodeURIComponent(file)}/approve`, { method: "POST" });
    loadPressTab();
  } catch (err) {
    alert(`Approve failed: ${err.message}`);
  }
}

document.getElementById("btnRefreshPress").addEventListener("click", loadPressTab);

// ---------- pending drafts ----------
async function loadPending() {
  const items = await api("/api/pending");
  const list = document.getElementById("pendingList");
  list.innerHTML = "";
  if (!items.length) {
    list.appendChild(el("div", { class: "hint" }, "No pending drafts."));
    return;
  }
  items.forEach((p) => {
    const card = el("div", { class: "card" }, [
      el("div", { class: "card-top" }, [
        el("div", {}, [
          el("div", { class: "card-title" }, p.title || p.file),
          el("div", { class: "card-meta" }, [
            el("span", { class: "tag" }, p.content_type || "blog"),
            el("span", {}, p.category || ""),
            el("span", {}, `${p.word_count} words`),
            el("span", {}, p.read_time || ""),
            el("span", {}, fmtTime(p.created_at_ms)),
          ]),
        ]),
      ]),
      el("div", { class: "card-actions" }, [
        el("button", { onclick: () => convertPending(p.file) }, "Convert to Page"),
        el("button", { onclick: () => uploadPending(p.file) }, "Upload to Supabase"),
        el("button", { class: "btn-accent", onclick: () => approvePending(p.file) }, "Approve & Publish"),
        el("button", { onclick: () => showLinksModal(p.file) }, "Links / Sources"),
        el("button", { onclick: () => showImagesModal(p.file) }, "Image Ideas"),
      ]),
    ]);
    list.appendChild(card);
  });
}

function triggerDownload(url) {
  const a = document.createElement("a");
  a.href = url;
  a.download = "";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function convertPending(file) {
  try {
    const res = await api(`/api/pending/${encodeURIComponent(file)}/convert`, { method: "POST" });
    window.open(res.url, "_blank");
    loadPages();
  } catch (err) {
    alert(`Failed: ${err.message}`);
  }
}

async function uploadPending(file) {
  try {
    const res = await api(`/api/pending/${encodeURIComponent(file)}/upload`, { method: "POST" });
    if (res.ok) {
      alert("Uploaded to Supabase.");
      loadPending();
    } else {
      alert("Upload failed — check the terminal running web_server.py for details.");
    }
  } catch (err) {
    alert(`Failed: ${err.message}`);
  }
}

async function showLinksModal(file) {
  const data = await api(`/api/pending/${encodeURIComponent(file)}/links`);
  const box = el("div", { class: "link-list" }, [
    el("h3", {}, "Internal links"),
    ...(data.internal_links.length
      ? data.internal_links.map((l) => el("div", {}, [el("a", { href: `/page/${l.slug}`, target: "_blank" }, l.text || l.title)]))
      : [el("div", { class: "hint" }, "None suggested.")]),
    el("h3", { style: "margin-top:1rem;" }, "External / source links"),
    ...(data.external_links.length
      ? data.external_links.map((l) => el("div", {}, [el("a", { href: l.url, target: "_blank" }, l.text || l.url)]))
      : [el("div", { class: "hint" }, "None suggested.")]),
  ]);
  showModal(box);
}

async function showImagesModal(id, kind = "pending") {
  const base = kind === "uploaded" ? "/api/uploaded/" : "/api/pending/";
  const sets = await api(`${base}${encodeURIComponent(id)}/images`);
  const box = el("div", { class: "img-links" }, sets.map((s) => el("div", { class: "set" }, [
    el("div", { class: "set-query" }, s.query),
    el("a", { href: s.google_images, target: "_blank" }, "Google Images"),
    el("a", { href: s.pinterest, target: "_blank" }, "Pinterest"),
    el("a", { href: s.unsplash, target: "_blank" }, "Unsplash"),
    el("a", { href: s.pexels, target: "_blank" }, "Pexels"),
  ])));
  showModal(el("div", {}, [el("h3", {}, "Image ideas — click through and download manually"), box]));
}

// ---------- uploaded blogs ----------
async function loadUploaded() {
  const hint = document.getElementById("uploadedHint");
  const list = document.getElementById("uploadedList");
  hint.textContent = "Loading…";
  list.innerHTML = "";
  let data;
  try {
    data = await api("/api/uploaded");
  } catch (err) {
    hint.textContent = `Failed to load: ${err.message}`;
    return;
  }
  hint.textContent = data.from_cache
    ? `Showing offline cache (Supabase unreachable: ${data.error || "unknown error"})`
    : `${data.posts.length} uploaded blog(s) — live from Supabase.`;
  if (!data.posts.length) {
    list.appendChild(el("div", { class: "hint" }, "No uploaded blogs yet."));
    return;
  }
  data.posts.forEach((p) => {
    const card = el("div", { class: "card" }, [
      el("div", { class: "card-top" }, [
        el("div", {}, [
          el("div", { class: "card-title" }, p.title || p.slug),
          el("div", { class: "card-meta" }, [
            el("span", { class: "tag" }, p.content_type || "blog"),
            el("span", {}, p.category || ""),
            el("span", {}, fmtTime(p.published_at ? new Date(p.published_at).getTime() : null)),
          ]),
        ]),
      ]),
      el("div", { class: "card-actions" }, [
        el("button", { onclick: () => convertUploaded(p.slug) }, "Convert to HTML"),
        el("button", { onclick: () => downloadUploaded(p.slug) }, "Download HTML"),
        el("button", { onclick: () => showImagesModal(p.slug, "uploaded") }, "Image Ideas"),
      ]),
    ]);
    list.appendChild(card);
  });
}

async function convertUploaded(slug) {
  try {
    const res = await api(`/api/uploaded/${encodeURIComponent(slug)}/convert`, { method: "POST" });
    window.open(res.url, "_blank");
    loadPages();
  } catch (err) {
    alert(`Failed: ${err.message}`);
  }
}

async function downloadUploaded(slug) {
  try {
    const res = await api(`/api/uploaded/${encodeURIComponent(slug)}/convert`, { method: "POST" });
    triggerDownload(res.download_url);
    loadPages();
  } catch (err) {
    alert(`Failed: ${err.message}`);
  }
}

document.getElementById("btnRefreshUploaded").addEventListener("click", loadUploaded);

// ---------- pages ----------
async function loadPages() {
  const items = await api("/api/pages");
  const list = document.getElementById("pagesList");
  list.innerHTML = "";
  if (!items.length) {
    list.appendChild(el("div", { class: "hint" }, "No rendered pages yet."));
    return;
  }
  items.forEach((p) => {
    const card = el("div", { class: "card" }, [
      el("div", { class: "card-top" }, [
        el("div", {}, [
          el("div", { class: "card-title" }, p.title || p.slug),
          el("div", { class: "card-meta" }, [
            el("span", { class: "tag" }, p.category || ""),
            el("span", {}, fmtTime(new Date(p.rendered_at).getTime())),
          ]),
        ]),
        el("button", { onclick: () => window.open(`/page/${p.slug}`, "_blank") }, "Open"),
        el("button", { onclick: () => triggerDownload(`/page/${p.slug}/download`) }, "Download"),
      ]),
    ]);
    list.appendChild(card);
  });
}

// ---------- rankings ----------
async function loadRankings() {
  const rankings = await api("/api/rankings");
  const hint = document.getElementById("rankingsHint");
  const table = document.getElementById("rankingsTable");
  hint.textContent = rankings.length
    ? `Last checked across ${rankings.length} keyword(s).`
    : 'No ranking data yet — click "Check Real Rankings" (requires GOOGLE_CSE_API_KEY/CX in .env).';
  table.innerHTML = "";
  if (rankings.length) {
    const rows = rankings.map((r) => {
      const posClass = !r.position ? "pos-bad" : r.position <= 10 ? "pos-good" : "pos-mid";
      return el("tr", {}, [
        el("td", {}, r.keyword),
        el("td", { class: posClass }, r.position ? `#${r.position}` : "not found"),
        el("td", {}, fmtTime(new Date(r.checked_at).getTime())),
      ]);
    });
    table.appendChild(el("table", {}, [
      el("thead", {}, el("tr", {}, [el("th", {}, "Keyword"), el("th", {}, "Position"), el("th", {}, "Checked")])),
      el("tbody", {}, rows),
    ]));
  }

  const suggestions = await api("/api/suggestions");
  const compBox = document.getElementById("competitorInfo");
  compBox.innerHTML = "";
  if (suggestions.competitor_context) {
    compBox.appendChild(el("pre", { style: "white-space:pre-wrap;font-family:monospace;font-size:0.75rem;color:rgba(245,240,232,0.6);" },
      JSON.stringify(suggestions.competitor_context, null, 2)));
  } else {
    compBox.appendChild(el("div", { class: "hint" }, 'Run "Generate Ideas" on the Topic Ideas tab — competitor research is gathered as part of that.'));
  }
}

document.getElementById("btnCheckRankings").addEventListener("click", async (e) => {
  const btn = e.target;
  btn.disabled = true;
  btn.textContent = "Checking...";
  try {
    const { job_id } = await api("/api/rankings/check", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: "{}",
    });
    await pollUntilDone(job_id);
    await loadRankings();
  } catch (err) {
    alert(`Failed: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = "Check Real Rankings";
  }
});

// ---------- theme ----------
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.getElementById("themeToggle").textContent = theme === "light" ? "☀️" : "🌙";
  localStorage.setItem("theme", theme);
}
document.getElementById("themeToggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  applyTheme(current === "dark" ? "light" : "dark");
});
applyTheme(localStorage.getItem("theme") || "dark");

// ---------- daily plan ----------
async function loadDailyPlan() {
  const hint = document.getElementById("dailyHint");
  const groups = document.getElementById("dailyGroups");
  const plan = await api("/api/daily-plan");
  groups.innerHTML = "";
  if (!plan || !plan.queued) {
    hint.textContent = 'No daily plan generated yet — click "Run Today\'s Batch Now", or wait for the '
      + "6 AM auto-run (only while the server keeps running).";
    return;
  }
  hint.textContent = `Generated ${fmtTime(new Date(plan.generated_at).getTime())} — `
    + `${plan.queued.brand.length} brand + ${plan.queued.product.length} product blog(s) auto-published, `
    + `${plan.queued.trending_needs_approval.length} trending blog(s) waiting for approval.`;

  const renderGroup = (title, ideas, badge) => {
    const box = el("div", { style: "margin-bottom:1.25rem;" }, [
      el("h3", { style: "font-size:0.9rem;margin-bottom:0.5rem;" }, title),
      el("div", { class: "cards" }, ideas.map((idea) => el("div", { class: "card" }, [
        el("div", { class: "card-title" }, idea.title),
        el("div", { class: "card-meta" }, [
          el("span", { class: "tag" }, idea.contentType || "blog"),
          el("span", {}, `keyword: ${idea.targetKeyword || "—"}`),
          badge ? el("span", { class: "tag" }, badge) : null,
        ]),
        el("div", { class: "card-rationale" }, idea.rationale || ""),
      ]))),
    ]);
    groups.appendChild(box);
  };
  renderGroup("Brand / Name Ranking (auto-published)", plan.queued.brand);
  renderGroup("Product / Service (auto-published)", plan.queued.product);
  renderGroup("Trending (needs your approval)", plan.queued.trending_needs_approval, "needs approval");

  if (plan.pool && plan.pool.length) {
    groups.appendChild(el("div", { style: "margin-top:1rem;" }, [
      el("h3", { style: "font-size:0.85rem;color:rgba(var(--cream),0.4);" }, `Full pool (${plan.pool.length} ideas today)`),
    ]));
  }
}

document.getElementById("btnRunDailyBatch").addEventListener("click", async (e) => {
  const btn = e.target;
  btn.disabled = true;
  btn.textContent = "Running...";
  try {
    const { job_id } = await api("/api/daily-plan/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    await pollUntilDone(job_id);
    await loadDailyPlan();
    document.querySelector('.tab-btn[data-tab="jobs"]').click();
  } catch (err) {
    alert(`Failed: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = "Run Today's Batch Now";
  }
});

async function approvePending(file) {
  if (!confirm("Publish this live to blog_posts now?")) return;
  try {
    await api(`/api/pending/${encodeURIComponent(file)}/approve`, { method: "POST" });
    alert("Published.");
    loadPending();
  } catch (err) {
    alert(`Failed: ${err.message}`);
  }
}

// ---------- init ----------
loadConfig();
loadDailyPlan();
loadSuggestions();
startJobsPolling();
