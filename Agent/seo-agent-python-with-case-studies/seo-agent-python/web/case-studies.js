async function api(path, opts) {
  const res = await fetch(path, opts);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

function fmtTime(ms) {
  if (!ms) return "no case studies generated yet";
  const d = new Date(ms);
  return `last case study created ${d.toLocaleString()}`;
}

// ---------- tabs ----------
document.querySelectorAll(".tabs .tab-btn").forEach((btn) => {
  if (btn.dataset.tab) {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tabs .tab-btn[data-tab]").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
      if (btn.dataset.tab === "list") loadList();
    });
  }
});

// ---------- mode switch (upload vs guided form) ----------
const modeUploadBtn = document.getElementById("modeUploadBtn");
const modeFormBtn = document.getElementById("modeFormBtn");
modeUploadBtn.addEventListener("click", () => {
  modeUploadBtn.classList.add("active");
  modeFormBtn.classList.remove("active");
  document.getElementById("uploadMode").style.display = "";
  document.getElementById("formMode").style.display = "none";
});
modeFormBtn.addEventListener("click", () => {
  modeFormBtn.classList.add("active");
  modeUploadBtn.classList.remove("active");
  document.getElementById("formMode").style.display = "";
  document.getElementById("uploadMode").style.display = "none";
});

// ---------- upload mode: drop/pick a JSON file, run immediately ----------
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");

dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("drag-over"); });
dropzone.addEventListener("dragleave", () => dropzone.classList.remove("drag-over"));
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("drag-over");
  if (e.dataTransfer.files.length) handleUploadedFile(e.dataTransfer.files[0]);
});
fileInput.addEventListener("change", () => {
  if (fileInput.files.length) handleUploadedFile(fileInput.files[0]);
});

function handleUploadedFile(file) {
  const preview = document.getElementById("uploadPreview");
  preview.innerHTML = "";
  const reader = new FileReader();
  reader.onload = () => {
    let parsed;
    try {
      parsed = JSON.parse(reader.result);
    } catch (err) {
      preview.innerHTML = `<div class="field-question-hint">Couldn't parse "${file.name}" as JSON: ${err.message}</div>`;
      return;
    }
    delete parsed._instructions;
    const targetWords = parsed.target_word_count || 10000;
    preview.innerHTML = `<div class="hint">Loaded <b>${file.name}</b> — client: <b>${parsed.client_name || "(placeholder)"}</b>. Starting generation automatically…</div>`;
    startGeneration(parsed, targetWords, false);
  };
  reader.readAsText(file);
}

// ---------- guided form mode ----------
const FIELD_DEFS = {
  formBasics: [
    ["client_name", "Client Name", "text", "[Client Name]"],
    ["industry", "Industry", "text", "[Industry]"],
    ["company_size", "Company Size", "text", "[Company Size]"],
    ["location", "Location", "text", "[Location]"],
    ["service_used", "HMorix Service Used", "text", "[HMorix Service Used]"],
    ["timeline", "Project Timeline", "text", "[Project Timeline]"],
  ],
  formNarrative: [
    ["challenge", "The Challenge", "textarea", "[Describe the client's real problem here.]"],
    ["solution", "The Solution", "textarea", "[Describe what HMorix actually built/did here.]"],
  ],
  formTestimonial: [
    ["testimonial_quote", "Quote", "textarea", ""],
    ["testimonial_author", "Author name", "text", ""],
    ["testimonial_role", "Author role / company", "text", ""],
  ],
  formCta: [
    ["cta_text", "CTA heading", "text", "Ready to build something like this?"],
    ["cta_url", "CTA link (back link / contact page)", "text", "/contact"],
  ],
};

function fieldRow(container, [key, label, type, placeholder]) {
  const group = document.createElement("div");
  group.className = "field-group";
  const needsAssist = type === "textarea";
  group.innerHTML = `
    <label>${label}${needsAssist ? `<button type="button" class="field-suggest-btn" data-polish="${key}">✨ Polish</button>` : ""}</label>
    ${type === "textarea"
      ? `<textarea id="f_${key}" placeholder="${placeholder}"></textarea>`
      : `<input type="text" id="f_${key}" placeholder="${placeholder}" />`}
  `;
  container.appendChild(group);
}

Object.entries(FIELD_DEFS).forEach(([containerId, fields]) => {
  const container = document.getElementById(containerId);
  fields.forEach((f) => fieldRow(container, f));
});

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-polish]");
  if (!btn) return;
  const key = btn.dataset.polish;
  const el = document.getElementById(`f_${key}`);
  if (!el.value.trim()) return;
  btn.disabled = true;
  btn.textContent = "…";
  try {
    const res = await api("/api/case-studies/assist/polish", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field: key, text: el.value }),
    });
    if (res.polished) el.value = res.polished;
  } catch (err) {
    alert(`Polish failed: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = "✨ Polish";
  }
});

// results editor
function addResultRow(metric = "", value = "", isPlaceholder = true) {
  const row = document.createElement("div");
  row.className = "result-row";
  row.innerHTML = `
    <input type="text" class="result-metric" placeholder="Metric (e.g. Page load time)" value="${metric}" />
    <input type="text" class="result-value" placeholder="Value (leave blank if unknown)" value="${value}" />
    <button type="button" class="remove-result">✕</button>
  `;
  row.querySelector(".remove-result").addEventListener("click", () => row.remove());
  document.getElementById("resultsEditor").appendChild(row);
}
document.getElementById("addResultRow").addEventListener("click", () => addResultRow());
[1, 2, 3].forEach(() => addResultRow());

// gallery editor
const galleryEditor = document.getElementById("galleryEditor");
for (let i = 0; i < 4; i++) {
  const wrap = document.createElement("div");
  wrap.className = "field-group";
  wrap.innerHTML = `<label>Photo ${i + 1} URL</label><input type="text" class="gallery-url" placeholder="https://… (optional)" />`;
  galleryEditor.appendChild(wrap);
}

function collectFormInput() {
  const get = (key) => document.getElementById(`f_${key}`).value.trim();
  const case_input = { is_demo: true };
  Object.values(FIELD_DEFS).flat().forEach(([key, , , placeholder]) => {
    const val = get(key);
    case_input[key] = val || placeholder;
  });

  case_input.results = [...document.querySelectorAll(".result-row")].map((row) => {
    const metric = row.querySelector(".result-metric").value.trim() || "[Metric]";
    const rawValue = row.querySelector(".result-value").value.trim();
    return { metric, value: rawValue || "[Result Placeholder]", is_placeholder: !rawValue };
  }).filter((r) => r.metric || r.value);

  case_input.gallery_images = [...document.querySelectorAll(".gallery-url")].map((input, i) => ({
    url: input.value.trim(),
    alt: input.value.trim() ? `Gallery image ${i + 1}` : `[Gallery image ${i + 1} placeholder]`,
    caption: "[Caption Placeholder]",
  }));

  case_input.hero_image_url = document.getElementById("heroImageUrl").value.trim();
  case_input.is_demo = !case_input.testimonial_quote && case_input.client_name.startsWith("[") ? true : case_input.is_demo;

  return case_input;
}

document.getElementById("btnGetQuestions").addEventListener("click", async () => {
  const box = document.getElementById("questionsBox");
  box.innerHTML = `<div class="hint">Checking…</div>`;
  try {
    const case_input = collectFormInput();
    const res = await api("/api/case-studies/assist/questions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ case_input }),
    });
    if (!res.questions.length) {
      box.innerHTML = `<div class="hint">Everything's filled in — nothing outstanding.</div>`;
      return;
    }
    box.innerHTML = "";
    res.questions.forEach((q) => {
      const hint = document.createElement("div");
      hint.className = "field-question-hint";
      hint.style.marginTop = "0.5rem";
      hint.innerHTML = `<b>${q.label}:</b> ${q.question}`;
      box.appendChild(hint);
    });
  } catch (err) {
    box.innerHTML = `<div class="field-question-hint">${err.message}</div>`;
  }
});

document.getElementById("btnGenerate").addEventListener("click", () => {
  const case_input = collectFormInput();
  const targetWords = parseInt(document.getElementById("targetWords").value, 10) || 10000;
  startGeneration(case_input, targetWords, false);
});

// ---------- shared: kick off + poll a generation job ----------
let pollTimer = null;
let _lastGenArgs = null;

async function startGeneration(case_input, target_word_count, review) {
  _lastGenArgs = [case_input, target_word_count, review];
  document.getElementById("progressArea").style.display = "";
  document.getElementById("progressFill").style.width = "5%";
  document.getElementById("progressStatus").textContent = "Submitting…";
  document.getElementById("progressLog").textContent = "";
  document.getElementById("progressResult").innerHTML = "";
  document.getElementById("progressArea").scrollIntoView({ behavior: "smooth", block: "start" });

  try {
    const { job_id } = await api("/api/case-studies/generate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ case_input, target_word_count, review }),
    });
    pollJob(job_id);
  } catch (err) {
    document.getElementById("progressStatus").textContent = `Failed to start: ${err.message}`;
    showRetryButton();
  }
}

function showRetryButton() {
  document.getElementById("progressResult").innerHTML = `
    <div class="card" style="margin-top:1rem;">
      <button id="btnRetryGen" class="btn-accent">🔁 Retry with the same input</button>
    </div>`;
  document.getElementById("btnRetryGen")?.addEventListener("click", () => {
    if (_lastGenArgs) startGeneration(..._lastGenArgs);
  });
}

const TOTAL_SECTIONS = 12; // keep in sync with agent/case_study_writer.py SECTIONS

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

    const sectionMatches = [...log.matchAll(/section (\d+)\/(\d+)/g)];
    const lastMatch = sectionMatches[sectionMatches.length - 1];
    const pct = lastMatch ? Math.min(95, (parseInt(lastMatch[1], 10) / parseInt(lastMatch[2], 10)) * 90 + 5) : 10;
    document.getElementById("progressFill").style.width = `${pct}%`;
    document.getElementById("progressStatus").textContent = lastMatch
      ? `Writing section ${lastMatch[1]}/${lastMatch[2]}…`
      : `${job.status}…`;

    if (job.status === "done") {
      clearInterval(pollTimer);
      document.getElementById("progressFill").style.width = "100%";
      document.getElementById("progressStatus").textContent = "Done.";
      const result = job.result || {};
      const slug = result.slug || result.canonical_url?.split("/").pop() || "";
      document.getElementById("progressResult").innerHTML = `
        <div class="card" style="margin-top:1rem;">
          <div class="card-title">✅ Case study generated${slug ? `: ${slug}` : ""}</div>
          <div class="card-actions">
            ${slug ? `<a href="/case-study/${slug}"><button>View page</button></a>` : ""}
            ${slug ? `<a href="/case-study/${slug}/download"><button>Download HTML</button></a>` : ""}
            <button id="btnBackToList">Back to list</button>
          </div>
        </div>`;
      document.getElementById("btnBackToList")?.addEventListener("click", () => {
        document.querySelector('.tab-btn[data-tab="list"]').click();
      });
      loadLastUpdated();
    } else if (job.status === "error") {
      clearInterval(pollTimer);
      document.getElementById("progressStatus").textContent = `Error: ${job.error}`;
      showRetryButton();
    }
  }, 1500);
}

// ---------- last-updated banner ----------
async function loadLastUpdated() {
  try {
    const data = await api("/api/case-studies/all");
    const text = fmtTime(data.last_updated_ms);
    document.getElementById("lastUpdatedText").textContent = text;
    document.getElementById("lastUpdatedText2").textContent = text;
  } catch (err) {
    document.getElementById("lastUpdatedText").textContent = "Couldn't load.";
  }
}
loadLastUpdated();

// ---------- list tab ----------
async function loadList() {
  const list = document.getElementById("csList");
  list.innerHTML = `<div class="hint">Loading…</div>`;
  try {
    const data = await api("/api/case-studies/all");
    document.getElementById("lastUpdatedText2").textContent = fmtTime(data.last_updated_ms);
    if (!data.items.length) {
      list.innerHTML = `<div class="hint">No case studies yet — create one from the Create tab.</div>`;
      return;
    }
    list.innerHTML = "";
    data.items.forEach((item) => {
      const el = document.createElement("div");
      el.className = "cs-list-item";
      const demoTag = item.is_demo ? `<span class="tag">demo</span>` : "";
      el.innerHTML = `
        <div>
          <div class="card-title">${item.title || item.slug || "(untitled)"}</div>
          <div class="cs-meta">
            <span class="state-pill state-${item.state}">${item.state}</span>
            ${demoTag}
            ${item.client_name ? `<span>${item.client_name}</span>` : ""}
            ${item.word_count ? `<span>${item.word_count} words</span>` : ""}
            <span>${item.timestamp_ms ? new Date(item.timestamp_ms).toLocaleString() : ""}</span>
          </div>
        </div>
        <div class="cs-actions">
          ${item.view_url ? `<a href="${item.view_url}"><button>View</button></a>` : ""}
          ${item.download_url ? `<a href="${item.download_url}"><button>Download</button></a>` : ""}
          <a href="/edit?type=case-study&state=${item.state}&id=${encodeURIComponent(item.state === "draft" ? item.file : item.slug)}"><button>✏️ Edit</button></a>
          ${item.state === "draft" ? `<a href="/"><button title="Approve from the Control Panel → Pending tab">Approve in Control Panel</button></a>` : ""}
        </div>
      `;
      list.appendChild(el);
    });
  } catch (err) {
    list.innerHTML = `<div class="field-question-hint">${err.message}</div>`;
  }
}
document.getElementById("btnRefreshList").addEventListener("click", loadList);

// ---------- knowledge editor ----------
let currentKnowledgeFile = "company";

document.querySelectorAll('.tabs .tab-btn[data-kfile]').forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll('.tabs .tab-btn[data-kfile]').forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentKnowledgeFile = btn.dataset.kfile;
    loadKnowledge();
  });
});

async function loadKnowledge() {
  const status = document.getElementById("knowledgeStatus");
  status.textContent = "Loading…";
  try {
    const data = await api(`/api/knowledge/${currentKnowledgeFile}`);
    document.getElementById("knowledgeEditor").value = data.content;
    status.textContent = `knowledge/${currentKnowledgeFile}.md`;
  } catch (err) {
    status.textContent = `Failed to load: ${err.message}`;
  }
}

document.getElementById("btnSaveKnowledge").addEventListener("click", async () => {
  const status = document.getElementById("knowledgeStatus");
  status.textContent = "Saving…";
  try {
    const content = document.getElementById("knowledgeEditor").value;
    await api(`/api/knowledge/${currentKnowledgeFile}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    status.textContent = `Saved knowledge/${currentKnowledgeFile}.md — used in the next case study/blog you generate.`;
  } catch (err) {
    status.textContent = `Failed to save: ${err.message}`;
  }
});

loadKnowledge();

// ---------- theme (matches the rest of the app) ----------
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
