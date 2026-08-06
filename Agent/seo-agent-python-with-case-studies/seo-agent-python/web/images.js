async function api(path, opts) {
  const res = await fetch(path, opts);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || `${res.status} ${res.statusText}`);
  return body;
}

// ---------- tabs ----------
document.querySelectorAll(".tabs .tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tabs .tab-btn").forEach((b) => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
    if (btn.dataset.tab === "gallery") loadGallery();
  });
});

// ---------- mode switch ----------
const modeContentBtn = document.getElementById("modeContentBtn");
const modePromptBtn = document.getElementById("modePromptBtn");
modeContentBtn.addEventListener("click", () => {
  modeContentBtn.classList.add("active");
  modePromptBtn.classList.remove("active");
  document.getElementById("contentMode").style.display = "";
  document.getElementById("promptMode").style.display = "none";
});
modePromptBtn.addEventListener("click", () => {
  modePromptBtn.classList.add("active");
  modeContentBtn.classList.remove("active");
  document.getElementById("promptMode").style.display = "";
  document.getElementById("contentMode").style.display = "none";
});

// ---------- load content sources dropdown ----------
let SOURCES = [];
async function loadSources() {
  const select = document.getElementById("sourceSelect");
  try {
    SOURCES = await api("/api/imagegen/sources");
    if (!SOURCES.length) {
      select.innerHTML = `<option value="">No published content yet — use Custom prompt instead</option>`;
      return;
    }
    select.innerHTML = SOURCES.map((s, i) =>
      `<option value="${i}">[${s.type}] ${s.title || s.slug}</option>`
    ).join("");
  } catch (err) {
    select.innerHTML = `<option value="">Failed to load: ${err.message}</option>`;
  }
}
loadSources();

// ---------- generate ----------
document.getElementById("btnGenerate").addEventListener("click", async () => {
  const count = parseInt(document.getElementById("imgCount").value, 10) || 10;
  const usingPrompt = modePromptBtn.classList.contains("active");
  let payload;

  if (usingPrompt) {
    const customPrompt = document.getElementById("customPromptInput").value.trim();
    if (!customPrompt) { alert("Enter a prompt first."); return; }
    payload = {
      title: document.getElementById("customTitle").value.trim() || customPrompt.slice(0, 60),
      custom_prompt: customPrompt,
      source_type: "custom",
      count,
    };
  } else {
    const idx = document.getElementById("sourceSelect").value;
    if (idx === "") { alert("Pick a content item first."); return; }
    const src = SOURCES[parseInt(idx, 10)];
    payload = {
      title: src.title || src.slug,
      source_type: src.type,
      source_slug: src.slug,
      count,
    };
  }

  document.getElementById("progressArea").style.display = "";
  document.getElementById("progressFill").style.width = "5%";
  document.getElementById("progressStatus").textContent = "Submitting…";
  document.getElementById("progressLog").textContent = "";
  document.getElementById("resultArea").innerHTML = "";
  document.getElementById("progressArea").scrollIntoView({ behavior: "smooth", block: "start" });

  try {
    const { job_id } = await api("/api/imagegen/generate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    pollJob(job_id);
  } catch (err) {
    document.getElementById("progressStatus").textContent = `Failed to start: ${err.message}`;
  }
});

let pollTimer = null;
async function pollJob(jobId) {
  clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    let job;
    try {
      job = await api(`/api/jobs/${jobId}`);
    } catch (err) {
      return;
    }
    const log = (job.log || []).join("\n");
    document.getElementById("progressLog").textContent = log;
    document.getElementById("progressLog").scrollTop = document.getElementById("progressLog").scrollHeight;

    const doneMatches = [...log.matchAll(/(\d+)\/(\d+) OK/g), ...log.matchAll(/(\d+)\/(\d+) FAILED/g)];
    const last = doneMatches[doneMatches.length - 1];
    const pct = last ? Math.min(95, (parseInt(last[1], 10) / parseInt(last[2], 10)) * 85 + 10) : 8;
    document.getElementById("progressFill").style.width = `${pct}%`;
    document.getElementById("progressStatus").textContent = last ? `Generated ${last[1]}/${last[2]} images…` : `${job.status}…`;

    if (job.status === "done") {
      clearInterval(pollTimer);
      document.getElementById("progressFill").style.width = "100%";
      document.getElementById("progressStatus").textContent = "Done.";
      renderSet(job.result, document.getElementById("resultArea"));
    } else if (job.status === "error") {
      clearInterval(pollTimer);
      document.getElementById("progressStatus").textContent = `Error: ${job.error}`;
    }
  }, 2000);
}

function imageUrl(manifest, filename) {
  const folderName = manifest.folder.split("/").pop();
  return `/generated-image/${encodeURIComponent(folderName)}/${encodeURIComponent(filename)}`;
}

function renderSet(manifest, container) {
  const card = document.createElement("div");
  card.className = "set-card";

  const okCount = (manifest.images || []).filter((i) => i.ok).length;
  const grid = document.createElement("div");
  grid.className = "img-grid";
  (manifest.images || []).forEach((img) => {
    const tile = document.createElement("div");
    tile.className = "img-tile";
    if (img.ok) {
      const url = imageUrl(manifest, img.filename);
      tile.innerHTML = `
        <img src="${url}" alt="${img.prompt.replace(/"/g, '')}" loading="lazy" />
        <div class="img-actions"><a href="${url}" download><button>Download</button></a></div>
      `;
    } else {
      tile.innerHTML = `<div class="img-fail">Failed: ${img.error || "unknown error"}</div>`;
    }
    grid.appendChild(tile);
  });

  const captionsHtml = Object.entries(manifest.captions || {}).map(([platform, c]) => `
    <div class="caption-panel">
      <h4>${platform.charAt(0).toUpperCase() + platform.slice(1)} <button class="copy" onclick="copyCaption(this)" data-text="${encodeURIComponent((c.title ? c.title + '\\n\\n' : '') + (c.description || '') + (c.tags && c.tags.length ? '\\n\\n' + c.tags.map(t => '#' + t.replace(/^#/, '')).join(' ') : ''))}">📋 Copy</button></h4>
      ${c.title ? `<div><b>${c.title}</b></div>` : ""}
      <div>${c.description || ""}</div>
      ${c.tags && c.tags.length ? `<div class="tags">${c.tags.map(t => '#' + t.replace(/^#/, '')).join(" ")}</div>` : ""}
    </div>
  `).join("");

  card.innerHTML = `<div class="card-title">✅ Generated ${okCount}/${(manifest.images || []).length} images${manifest.title ? ` — ${manifest.title}` : ""}</div>`;
  card.appendChild(grid);
  const capWrap = document.createElement("div");
  capWrap.innerHTML = captionsHtml;
  card.appendChild(capWrap);
  container.appendChild(card);
}

function copyCaption(btn) {
  const text = decodeURIComponent(btn.dataset.text);
  navigator.clipboard.writeText(text).then(() => {
    const original = btn.textContent;
    btn.textContent = "✓ Copied";
    setTimeout(() => { btn.textContent = original; }, 1500);
  });
}

// ---------- gallery ----------
async function loadGallery() {
  const box = document.getElementById("gallerySets");
  box.innerHTML = `<div class="hint">Loading…</div>`;
  try {
    const sets = await api("/api/imagegen/sets");
    if (!sets.length) {
      box.innerHTML = `<div class="hint">No image sets generated yet.</div>`;
      return;
    }
    box.innerHTML = "";
    sets.forEach((manifest) => renderSet(manifest, box));
  } catch (err) {
    box.innerHTML = `<div class="hint">${err.message}</div>`;
  }
}
document.getElementById("btnRefreshGallery").addEventListener("click", loadGallery);

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
