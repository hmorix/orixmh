async function api(path, opts) {
  const res = await fetch(path, opts);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

function fmtTime(ms) {
  if (!ms) return "—";
  return new Date(ms).toLocaleString();
}

function fmtNum(n) {
  return n === null || n === undefined ? "—" : String(n);
}

let pollTimer = null;

function renderStatCard(container, index, value, label, sub) {
  const cards = container.querySelectorAll(".stat-card");
  const card = cards[index];
  if (!card) return;
  card.querySelector(".value").textContent = value;
  card.querySelector(".label").textContent = label;
  let subEl = card.querySelector(".sub");
  if (sub) {
    if (!subEl) {
      subEl = document.createElement("div");
      subEl.className = "sub";
      card.appendChild(subEl);
    }
    subEl.textContent = sub;
  } else if (subEl) {
    subEl.remove();
  }
}

function statusDot(status) {
  return `<span class="status-dot ${status}"></span>`;
}

async function loadDashboard() {
  let stats;
  try {
    stats = await api("/api/dashboard/stats");
  } catch (err) {
    document.getElementById("supabaseWarning").innerHTML =
      `<div class="warn-banner">Couldn't load dashboard stats: ${err.message}</div>`;
    return;
  }

  document.getElementById("lastUpdated").textContent = `updated ${fmtTime(Date.parse(stats.generated_at))}`;

  // Supabase warning banner
  const warnEl = document.getElementById("supabaseWarning");
  if (!stats.supabase_configured) {
    warnEl.innerHTML = `<div class="warn-banner">Supabase isn't configured (.env) — showing local draft counts only. Case-study/blog "published" counts need SUPABASE_URL + SUPABASE_SERVICE_KEY set.</div>`;
  } else if (!stats.supabase_reachable) {
    warnEl.innerHTML = `<div class="warn-banner">Supabase configured but unreachable${stats.supabase_error ? `: ${stats.supabase_error}` : ""}. If you just rotated your keys, make sure the new SUPABASE_SERVICE_KEY is saved in .env.</div>`;
  } else {
    warnEl.innerHTML = "";
  }

  const statGrid = document.getElementById("statGrid");
  renderStatCard(statGrid, 0, fmtNum(stats.case_studies.total), "Total Case Studies");
  renderStatCard(statGrid, 1, fmtNum(stats.case_studies.published), "Published");
  renderStatCard(statGrid, 2, fmtNum(stats.case_studies.drafts_pending), "Drafts Pending");
  renderStatCard(
    statGrid, 3,
    `${statusDot(stats.pipeline.status)}${stats.pipeline.status}`,
    "Pipeline Status",
    stats.pipeline.active_jobs ? `${stats.pipeline.active_jobs} running` : (stats.pipeline.queued_jobs ? `${stats.pipeline.queued_jobs} queued` : null)
  );
  statGrid.querySelectorAll(".value")[3].innerHTML = `${statusDot(stats.pipeline.status)}${stats.pipeline.status}`;

  document.getElementById("csDemoCard").querySelector(".value").textContent = fmtNum(stats.case_studies.demo);
  document.getElementById("csRealCard").querySelector(".value").textContent = fmtNum(stats.case_studies.real);
  document.getElementById("blogPublishedCard").querySelector(".value").textContent = fmtNum(stats.blog.published);
  document.getElementById("blogDraftsCard").querySelector(".value").textContent = fmtNum(stats.blog.drafts_pending);

  document.getElementById("wpTotalCard").querySelector(".value").textContent = fmtNum(stats.whitepapers.total);
  document.getElementById("wpPublishedCard").querySelector(".value").textContent = fmtNum(stats.whitepapers.published);
  document.getElementById("wpDraftsCard").querySelector(".value").textContent = fmtNum(stats.whitepapers.drafts_pending);
  document.getElementById("wpPdfCard").querySelector(".value").textContent = fmtNum(stats.whitepapers.with_pdf);

  document.getElementById("prTotalCard").querySelector(".value").textContent = fmtNum(stats.press.total);
  document.getElementById("prPublishedCard").querySelector(".value").textContent = fmtNum(stats.press.published);
  document.getElementById("prDraftsCard").querySelector(".value").textContent = fmtNum(stats.press.drafts_pending);
  document.getElementById("prPdfCard").querySelector(".value").textContent = fmtNum(stats.press.with_pdf);

  const lastRunEl = document.getElementById("lastRunCard");
  lastRunEl.innerHTML = "";
  const lastRunCard = document.createElement("div");
  lastRunCard.className = "card";
  lastRunCard.innerHTML = stats.pipeline.last_run_at_ms
    ? `<div class="card-title">Last generation started</div><div class="card-meta">${fmtTime(stats.pipeline.last_run_at_ms)}</div>`
    : `<div class="card-title">No generation runs yet</div><div class="card-meta">Run the pipeline via the Control Panel or <code>python index.py --case-study &lt;input.json&gt;</code></div>`;
  lastRunEl.appendChild(lastRunCard);

  const jobsEl = document.getElementById("recentJobs");
  jobsEl.innerHTML = "";
  if (!stats.pipeline.recent_jobs.length) {
    jobsEl.innerHTML = `<div class="hint">No jobs run yet this session.</div>`;
  } else {
    stats.pipeline.recent_jobs.forEach((j) => {
      const card = document.createElement("div");
      card.className = "job-card";
      const title = (j.meta && (j.meta.title || j.meta.client_name)) || j.kind || "job";
      card.innerHTML = `
        <div class="job-top">
          <span>${title}</span>
          <span class="status-pill status-${j.status}">${j.status}</span>
        </div>
        <div class="job-progress">${j.kind} · started ${fmtTime(j.started_at_ms)}</div>
      `;
      jobsEl.appendChild(card);
    });
  }

  // Keep polling while something's actively running, otherwise slow down.
  const interval = stats.pipeline.status === "running" ? 4000 : 20000;
  clearTimeout(pollTimer);
  pollTimer = setTimeout(loadDashboard, interval);
}

document.getElementById("btnRefresh").addEventListener("click", loadDashboard);

// ---------- theme (same behavior as the main control panel) ----------
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  document.getElementById("themeToggle").textContent = theme === "light" ? "☀️" : "🌙";
  localStorage.setItem("theme", theme);
}
document.getElementById("themeToggle").addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  applyTheme(current === "light" ? "dark" : "light");
});
applyTheme(localStorage.getItem("theme") || "dark");

loadDashboard();
