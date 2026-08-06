async function api(path, opts) {
  const res = await fetch(path, opts);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `${res.status} ${res.statusText}`);
  return body;
}

const params = new URLSearchParams(window.location.search);
const ctype = params.get("type");       // blog | case-study | whitepaper | press
const state = params.get("state");      // draft | published
const id = params.get("id");            // filename (draft) or slug (published)

const VIEW_URL_BUILDERS = {
  "blog": (slug) => `/page/${slug}`,
  "case-study": (slug) => `/case-study/${slug}`,
  "whitepaper": (slug) => `/whitepaper/${slug}`,
  "press": (slug) => `/press/${slug}`,
};
const TITLE_FIELDS = { "blog": "title", "case-study": "title", "whitepaper": "title", "press": "headline" };

const editor = document.getElementById("jsonEditor");
const statusEl = document.getElementById("statusMsg");
let currentRecord = null;

function setStatus(msg, kind) {
  statusEl.textContent = msg;
  statusEl.className = kind || "";
}

function fetchUrl() {
  if (!ctype || !state || !id) return null;
  return `/api/content/${encodeURIComponent(ctype)}/${state}/${encodeURIComponent(id)}`;
}

async function load() {
  if (!ctype || !state || !id) {
    document.getElementById("editTitle").textContent = "Missing parameters";
    setStatus("This page needs ?type=&state=&id= in the URL — open it from a list view's Edit button instead of directly.", "error");
    return;
  }
  document.getElementById("editMeta").textContent = `${ctype} · ${state} · ${id}`;
  try {
    currentRecord = await api(fetchUrl());
    const titleField = TITLE_FIELDS[ctype] || "title";
    document.getElementById("editTitle").textContent = currentRecord[titleField] || "(untitled)";
    editor.value = JSON.stringify(currentRecord, null, 2);

    if (state === "published") {
      document.getElementById("btnRetry").style.display = "";
      const slug = currentRecord.slug || id;
      const builder = VIEW_URL_BUILDERS[ctype];
      if (builder) {
        const link = document.getElementById("viewLink");
        link.href = builder(slug);
        link.style.display = "";
      }
    }
  } catch (err) {
    document.getElementById("editTitle").textContent = "Failed to load";
    setStatus(err.message, "error");
  }
}
load();

document.getElementById("btnSave").addEventListener("click", async () => {
  let parsed;
  try {
    parsed = JSON.parse(editor.value);
  } catch (err) {
    setStatus(`Invalid JSON: ${err.message}`, "error");
    return;
  }
  setStatus("Saving…");
  try {
    const url = `${fetchUrl()}/save`;
    const res = await api(url, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ record: parsed }),
    });
    setStatus("Saved.", "ok");
    if (res.regenerated) renderRegenResults(res.regenerated);
    currentRecord = parsed;
  } catch (err) {
    setStatus(`Save failed: ${err.message}`, "error");
  }
});

document.getElementById("btnRetry").addEventListener("click", async () => {
  setStatus("Regenerating…");
  try {
    const url = `/api/content/${encodeURIComponent(ctype)}/published/${encodeURIComponent(id)}/retry`;
    const res = await api(url, { method: "POST" });
    setStatus("Retry complete.", "ok");
    renderRegenResults(res.regenerated);
  } catch (err) {
    setStatus(`Retry failed: ${err.message}`, "error");
  }
});

document.getElementById("btnDelete").addEventListener("click", async () => {
  if (!confirm(`Delete this ${ctype} ${state === "draft" ? "draft" : "permanently"}? This can't be undone.`)) return;
  setStatus("Deleting…");
  try {
    const url = `${fetchUrl()}/delete`;
    await api(url, { method: "POST" });
    setStatus("Deleted. Redirecting…", "ok");
    setTimeout(() => { window.location.href = "/"; }, 1200);
  } catch (err) {
    setStatus(`Delete failed: ${err.message}`, "error");
  }
});

function renderRegenResults(steps) {
  const box = document.getElementById("regenResults");
  box.innerHTML = "<div class=\"form-section-title\">Regeneration results</div>";
  (steps || []).forEach((s) => {
    const row = document.createElement("div");
    row.className = "regen-row";
    row.innerHTML = s.ok
      ? `<span class="ok">✔</span> <span>${s.step}</span>`
      : `<span class="fail">✖</span> <span>${s.step}: ${s.error}</span>`;
    box.appendChild(row);
  });
}

// ---------- theme ----------
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
