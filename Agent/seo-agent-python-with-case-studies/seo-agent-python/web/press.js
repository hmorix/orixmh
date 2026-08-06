async function api(path, opts) {
  const res = await fetch(path, opts);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

function fmtTime(ms) {
  if (!ms) return "no press releases generated yet";
  return `last press release created ${new Date(ms).toLocaleString()}`;
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

// ---------- mode switch ----------
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

// ---------- upload mode ----------
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
    const targetWords = parsed.target_word_count || 600;
    preview.innerHTML = `<div class="hint">Loaded <b>${file.name}</b> — headline: <b>${parsed.headline || "(will be written)"}</b>. Starting generation automatically…</div>`;
    startGeneration(parsed, targetWords, false);
  };
  reader.readAsText(file);
}

// ---------- guided form ----------
const FIELD_DEFS = {
  formBasics: [
    ["headline", "Headline (optional — leave blank to have it written)", "text", ""],
    ["category", "Category", "text", "Company News"],
    ["dateline_city", "Dateline city", "text", "[City, State/Country]"],
  ],
  formFacts: [
    ["key_facts_raw", "Key Facts (one per line — the actual news)", "textarea", ""],
    ["source_urls_raw", "Source URLs (one per line, optional)", "textarea", ""],
  ],
  formQuote: [
    ["quote_text", "Quote text (exact, optional)", "textarea", ""],
    ["quote_attribution", "Quote attribution (name)", "text", ""],
    ["quote_role", "Quote attribution role/title", "text", ""],
  ],
  formContact: [
    ["media_contact_name", "Media contact name", "text", ""],
    ["media_contact_email", "Media contact email", "text", ""],
    ["media_contact_phone", "Media contact phone", "text", ""],
  ],
  formCta: [
    ["cover_image_url", "Cover image URL", "text", ""],
    ["cta_text", "CTA heading", "text", "Learn more about HMorix"],
    ["cta_url", "CTA link", "text", "/contact"],
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
      : `<input type="text" id="f_${key}" placeholder="${placeholder}" value="${type === 'text' && key === 'category' ? placeholder : ''}" />`}
  `;
  container.appendChild(group);
}

Object.entries(FIELD_DEFS).forEach(([containerId, fields]) => {
  const container = document.getElementById(containerId);
  fields.forEach((f) => fieldRow(container, f));
});
document.getElementById("f_cta_text").value = "Learn more about HMorix";
document.getElementById("f_cta_url").value = "/contact";
document.getElementById("f_category").value = "Company News";

document.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-polish]");
  if (!btn) return;
  const key = btn.dataset.polish;
  const el = document.getElementById(`f_${key}`);
  if (!el.value.trim()) return;
  btn.disabled = true;
  btn.textContent = "…";
  try {
    const res = await api("/api/press/assist/polish", {
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

function linesToArray(text) {
  return (text || "").split("\n").map((s) => s.trim()).filter(Boolean);
}

function collectFormInput() {
  const get = (key) => document.getElementById(`f_${key}`).value.trim();
  return {
    headline: get("headline"),
    category: get("category") || "Company News",
    dateline_city: get("dateline_city") || "[City, State/Country]",
    is_commentary: document.getElementById("isCommentary").checked,
    key_facts: linesToArray(get("key_facts_raw")),
    source_urls: linesToArray(get("source_urls_raw")),
    quote_text: get("quote_text"),
    quote_attribution: get("quote_attribution"),
    quote_role: get("quote_role"),
    media_contact_name: get("media_contact_name"),
    media_contact_email: get("media_contact_email"),
    media_contact_phone: get("media_contact_phone"),
    cover_image_url: get("cover_image_url"),
    cta_text: get("cta_text") || "Learn more about HMorix",
    cta_url: get("cta_url") || "/contact",
    reference_links: [],
  };
}

document.getElementById("btnGetQuestions").addEventListener("click", async () => {
  const box = document.getElementById("questionsBox");
  box.innerHTML = `<div class="hint">Checking…</div>`;
  try {
    const press_input = collectFormInput();
    const res = await api("/api/press/assist/questions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ press_input }),
    });
    if (!res.questions.length) {
      box.innerHTML = `<div class="hint">Nothing obviously missing — you're good to generate.</div>`;
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
  const press_input = collectFormInput();
  const targetWords = parseInt(document.getElementById("targetWords").value, 10) || 600;
  startGeneration(press_input, targetWords, false);
});

// ---------- shared: kick off + poll a generation job ----------
let pollTimer = null;
let _lastGenArgs = null;

async function startGeneration(press_input, target_word_count, review) {
  _lastGenArgs = [press_input, target_word_count, review];
  document.getElementById("progressArea").style.display = "";
  document.getElementById("progressFill").style.width = "5%";
  document.getElementById("progressStatus").textContent = "Submitting…";
  document.getElementById("progressLog").textContent = "";
  document.getElementById("progressResult").innerHTML = "";
  document.getElementById("progressArea").scrollIntoView({ behavior: "smooth", block: "start" });

  try {
    const { job_id } = await api("/api/press/generate", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ press_input, target_word_count, review }),
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
    document.getElementById("progressStatus").textContent = `${job.status}…`;
    document.getElementById("progressFill").style.width = job.status === "running" ? "50%" : "20%";

    if (job.status === "done") {
      clearInterval(pollTimer);
      document.getElementById("progressFill").style.width = "100%";
      document.getElementById("progressStatus").textContent = "Done.";
      const result = job.result || {};
      const slug = result.slug || result.canonical_url?.split("/").pop() || "";
      document.getElementById("progressResult").innerHTML = `
        <div class="card" style="margin-top:1rem;">
          <div class="card-title">✅ Press release generated${slug ? `: ${slug}` : ""}</div>
          <div class="card-actions">
            ${slug ? `<a href="/press/${slug}"><button>View page</button></a>` : ""}
            ${slug ? `<a href="/press/${slug}/pdf"><button>Download PDF</button></a>` : ""}
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
    const data = await api("/api/press/all");
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
  const list = document.getElementById("prList");
  list.innerHTML = `<div class="hint">Loading…</div>`;
  try {
    const data = await api("/api/press/all");
    document.getElementById("lastUpdatedText2").textContent = fmtTime(data.last_updated_ms);
    if (!data.items.length) {
      list.innerHTML = `<div class="hint">No press releases yet — create one from the Create tab.</div>`;
      return;
    }
    list.innerHTML = "";
    data.items.forEach((item) => {
      const el = document.createElement("div");
      el.className = "cs-list-item";
      const commentaryTag = item.is_research ? `<span class="tag">commentary</span>` : "";
      const pdfTag = item.pdf_generated ? `<span class="tag">PDF ready</span>` : "";
      el.innerHTML = `
        <div>
          <div class="card-title">${item.title || item.slug || "(untitled)"}</div>
          <div class="cs-meta">
            <span class="state-pill state-${item.state}">${item.state}</span>
            ${commentaryTag}
            ${pdfTag}
            ${item.topic ? `<span>${item.topic}</span>` : ""}
            ${item.word_count ? `<span>${item.word_count} words</span>` : ""}
            <span>${item.timestamp_ms ? new Date(item.timestamp_ms).toLocaleString() : ""}</span>
          </div>
        </div>
        <div class="cs-actions">
          ${item.view_url ? `<a href="${item.view_url}"><button>View</button></a>` : ""}
          ${item.pdf_url ? `<a href="${item.pdf_url}"><button>Download PDF</button></a>` : ""}
          <a href="/edit?type=press&state=${item.state}&id=${encodeURIComponent(item.state === "draft" ? item.file : item.slug)}"><button>✏️ Edit</button></a>
          ${item.state === "draft" ? `<a href="/"><button title="Approve from the Control Panel → Press tab">Approve in Control Panel</button></a>` : ""}
        </div>
      `;
      list.appendChild(el);
    });
  } catch (err) {
    list.innerHTML = `<div class="field-question-hint">${err.message}</div>`;
  }
}
document.getElementById("btnRefreshList").addEventListener("click", loadList);

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
