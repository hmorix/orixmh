// HMorix SEO Master — Interactive AI Chat Studio
(function () {
  const STORAGE_KEY = "hmorix_seo_chat_sessions_v1";
  let sessions = [];
  let currentSessionId = null;
  let activeContentType = "blog";
  let activeModel = "meta/llama-3.2-11b-vision-instruct";
  let thinkingEnabled = true;
  let isGenerating = false;

  const ICONS = {
    close: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    ai: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    thinking: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/><line x1="10" y1="22" x2="14" y2="22"/></svg>`,
    chevronDown: `<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
    question: `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    copy: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
    download: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    save: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
    check: `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    moon: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    sun: `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`
  };

  // DOM elements
  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const btnSend = document.getElementById("btnSend");
  const btnNewChat = document.getElementById("btnNewChat");
  const historyList = document.getElementById("historyList");
  const sidebar = document.getElementById("sidebar");
  const btnToggleSidebar = document.getElementById("btnToggleSidebar");
  const modelPillBtn = document.getElementById("modelPillBtn");
  const modelPillLabel = document.getElementById("modelPillLabel");
  const modelDropdown = document.getElementById("modelDropdown");
  const thinkingToggle = document.getElementById("thinkingToggle");
  const contentTypeGrid = document.getElementById("contentTypeGrid");
  const activeTypeBadge = document.getElementById("activeTypeBadge");
  const toast = document.getElementById("toast");
  const themeToggle = document.getElementById("themeToggle");

  // Load sessions from storage
  function loadSessions() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      sessions = raw ? JSON.parse(raw) : [];
    } catch {
      sessions = [];
    }
  }

  function saveSessions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch {}
  }

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2500);
  }

  function getCurrentSession() {
    return sessions.find(s => s.id === currentSessionId);
  }

  function createNewSession() {
    const id = "chat_" + Date.now();
    const newSession = {
      id,
      title: "New Conversation",
      contentType: activeContentType,
      model: activeModel,
      createdAt: Date.now(),
      messages: []
    };
    sessions.unshift(newSession);
    currentSessionId = id;
    saveSessions();
    renderHistory();
    renderMessages();
    chatInput.focus();
  }

  function renderHistory() {
    historyList.innerHTML = "";
    sessions.forEach(sess => {
      const item = document.createElement("div");
      item.className = "hist-item" + (sess.id === currentSessionId ? " active" : "");
      
      const titleSpan = document.createElement("span");
      titleSpan.className = "hist-title";
      titleSpan.textContent = sess.title || "Conversation";
      titleSpan.onclick = () => {
        currentSessionId = sess.id;
        activeContentType = sess.contentType || "blog";
        updateContentTypeUI();
        saveSessions();
        renderHistory();
        renderMessages();
      };

      const delBtn = document.createElement("button");
      delBtn.className = "hist-del";
      delBtn.innerHTML = ICONS.close;
      delBtn.title = "Delete conversation";
      delBtn.onclick = (e) => {
        e.stopPropagation();
        sessions = sessions.filter(s => s.id !== sess.id);
        if (currentSessionId === sess.id) {
          currentSessionId = sessions.length ? sessions[0].id : null;
        }
        saveSessions();
        renderHistory();
        renderMessages();
      };

      item.appendChild(titleSpan);
      item.appendChild(delBtn);
      historyList.appendChild(item);
    });
  }

  function updateContentTypeUI() {
    activeTypeBadge.textContent = activeContentType.toUpperCase();
    document.querySelectorAll(".ct-btn").forEach(b => {
      b.classList.toggle("active", b.getAttribute("data-type") === activeContentType);
    });
  }

  // Fast client-side markdown formatter
  function formatMarkdown(text) {
    if (!text) return "";
    let escaped = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Fenced code blocks
    escaped = escaped.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang}">${code}</code></pre>`;
    });

    // Inline code
    escaped = escaped.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Headers
    escaped = escaped.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    escaped = escaped.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    escaped = escaped.replace(/^# (.*$)/gim, "<h1>$1</h1>");

    // Bold & italic
    escaped = escaped.replace(/\*\*([^\*]+)\*\*/g, "<strong>$1</strong>");
    escaped = escaped.replace(/\*([^\*]+)\*/g, "<em>$1</em>");

    // Blockquote
    escaped = escaped.replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>");

    // Lists
    escaped = escaped.replace(/^\s*[-*]\s+(.*$)/gim, "<li>$1</li>");
    escaped = escaped.replace(/(<li>[\s\S]*?<\/li>)/gim, "<ul>$1</ul>");
    escaped = escaped.replace(/<\/ul>\s*<ul>/g, "");

    // Tables
    if (escaped.includes("|")) {
      const lines = escaped.split("\n");
      let inTable = false;
      let tableHtml = "";
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith("|") && line.endsWith("|")) {
          if (line.includes("---")) continue;
          if (!inTable) {
            inTable = true;
            tableHtml += "<table>";
          }
          const cells = line.slice(1, -1).split("|").map(c => c.trim());
          const tag = !tableHtml.includes("<tbody>") ? "th" : "td";
          tableHtml += "<tr>" + cells.map(c => `<${tag}>${c}</${tag}>`).join("") + "</tr>";
          if (tag === "th") tableHtml += "<tbody>";
        } else {
          if (inTable) {
            tableHtml += "</tbody></table>";
            inTable = false;
          }
        }
      }
      if (inTable) tableHtml += "</tbody></table>";
      if (tableHtml) {
        escaped = escaped.replace(/(\|.*?\|\n?)+/g, tableHtml);
      }
    }

    // Paragraphs & newlines
    escaped = escaped.replace(/\n{2,}/g, "</p><p>");
    escaped = "<p>" + escaped.replace(/\n/g, "<br/>") + "</p>";
    escaped = escaped.replace(/<p><\/p>/g, "");
    return escaped;
  }

  function renderMessages() {
    const sess = getCurrentSession();
    if (!sess || !sess.messages || sess.messages.length === 0) {
      chatMessages.innerHTML = `
        <div class="welcome-screen" id="welcomeScreen">
          <div class="welcome-logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          </div>
          <div class="welcome-title">HMorix <span>SEO Master</span></div>
          <div class="welcome-sub">
            Interactive AI content strategist. Discovers high-converting long-tail keywords, asks Claude-style clarifying questions, and drafts publication-ready blogs, case studies, whitepapers, and press releases for HMorix.
          </div>
          <div class="quick-prompts">
            <div class="qp-card" data-prompt="Write an SEO blog on AI-powered HRM software for Indian enterprises with target long-tail keywords.">
              <div class="qp-tag">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Blog Post · Long-tail
              </div>
              <div class="qp-text">AI HRM for Indian Enterprises with target keywords</div>
            </div>
            <div class="qp-card" data-prompt="Generate 20 high-intent long-tail keywords and competitor gap analysis for HMorix CRM in Delhi NCR, Agra, and Hathras.">
              <div class="qp-tag">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Keywords &amp; Audit
              </div>
              <div class="qp-text">Long-tail keywords for regional CRM market</div>
            </div>
            <div class="qp-card" data-prompt="Plan and write a comprehensive whitepaper on Digital Transformation for Manufacturing and Retail SMBs using HMorix ERP.">
              <div class="qp-tag">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Whitepaper
              </div>
              <div class="qp-text">Manufacturing Digital Transformation Framework</div>
            </div>
            <div class="qp-card" data-prompt="Draft an enterprise case study showing how HMorix automated attendance, payroll, and billing for a 350-employee hospitality client.">
              <div class="qp-tag">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                Case Study
              </div>
              <div class="qp-text">Hospitality client payroll &amp; billing automation</div>
            </div>
            <div class="qp-card" data-prompt="Write a press release announcing HMorix BillingFlow 2.0 with GST compliance and automated PDF generation.">
              <div class="qp-tag">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 11 18-5v12L3 14v-3z"/></svg>
                Press Release
              </div>
              <div class="qp-text">BillingFlow 2.0 Product Launch Announcement</div>
            </div>
            <div class="qp-card" data-prompt="Run an SEO content audit for hmorix.in and highlight our top 5 organic growth opportunities for Q3.">
              <div class="qp-tag">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                SEO Strategy
              </div>
              <div class="qp-text">Complete organic growth &amp; content audit for hmorix.in</div>
            </div>
          </div>
        </div>
      `;
      bindQuickPrompts();
      return;
    }

    chatMessages.innerHTML = "";
    sess.messages.forEach((msg, idx) => {
      appendMessageElement(msg, idx);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function appendMessageElement(msg, idx) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `msg ${msg.role}`;

    const avatar = document.createElement("div");
    avatar.className = "msg-avatar";
    if (msg.role === "user") {
      avatar.textContent = "U";
    } else {
      avatar.innerHTML = ICONS.ai;
    }

    const contentDiv = document.createElement("div");
    contentDiv.className = "msg-content";

    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";

    // If AI message has thinking steps
    if (msg.role === "ai" && msg.thinkingSteps && msg.thinkingSteps.length > 0) {
      const thinkingBox = document.createElement("div");
      thinkingBox.className = "thinking-box";
      
      const head = document.createElement("div");
      head.className = "thinking-head";
      head.innerHTML = `
        <span class="thinking-head-title">${ICONS.thinking} Chain-of-Thought (${msg.thinkingSteps.length} steps)</span>
        <span>${ICONS.chevronDown}</span>
      `;
      
      const body = document.createElement("div");
      body.className = "thinking-body" + (thinkingEnabled ? " open" : "");
      body.innerHTML = msg.thinkingSteps.map((step, sIdx) => `
        <div class="thinking-step">
          <span class="thinking-step-num">[Step ${sIdx + 1}]</span>
          <span>${step}</span>
        </div>
      `).join("");

      head.onclick = () => body.classList.toggle("open");
      thinkingBox.appendChild(head);
      thinkingBox.appendChild(body);
      bubble.appendChild(thinkingBox);
    }

    // Main text
    const textNode = document.createElement("div");
    textNode.innerHTML = formatMarkdown(msg.text);
    bubble.appendChild(textNode);

    // If AI message has clarifying questions
    if (msg.role === "ai" && msg.clarifyingQuestions && msg.clarifyingQuestions.length > 0) {
      const qCard = document.createElement("div");
      qCard.className = "questions-card";
      qCard.innerHTML = `<div class="questions-title">${ICONS.question} Clarifying Questions &amp; Direction:</div>`;
      
      msg.clarifyingQuestions.forEach(qObj => {
        const qWrap = document.createElement("div");
        qWrap.className = "question-item";
        qWrap.innerHTML = `<div>• <strong>${qObj.question}</strong></div>`;
        if (qObj.options && qObj.options.length) {
          const optWrap = document.createElement("div");
          optWrap.className = "question-options";
          qObj.options.forEach(opt => {
            const btn = document.createElement("button");
            btn.className = "q-opt-btn";
            btn.textContent = opt;
            btn.onclick = () => {
              chatInput.value = (chatInput.value ? chatInput.value + "\n" : "") + `Answer for "${qObj.question}": ${opt}`;
              chatInput.focus();
              btnSend.disabled = false;
            };
            optWrap.appendChild(btn);
          });
          qWrap.appendChild(optWrap);
        }
        qCard.appendChild(qWrap);
      });
      bubble.appendChild(qCard);
    }

    contentDiv.appendChild(bubble);

    // Actions for AI message
    if (msg.role === "ai") {
      const actions = document.createElement("div");
      actions.className = "msg-actions";

      const copyBtn = document.createElement("button");
      copyBtn.className = "msg-action-btn";
      copyBtn.innerHTML = `${ICONS.copy} Copy Text`;
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(msg.text);
        showToast("Copied to clipboard!");
      };

      const downloadBtn = document.createElement("button");
      downloadBtn.className = "msg-action-btn";
      downloadBtn.innerHTML = `${ICONS.download} Download .md`;
      downloadBtn.onclick = () => {
        const blob = new Blob([msg.text], { type: "text/markdown" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `hmorix-content-${Date.now()}.md`;
        a.click();
      };

      const saveDraftBtn = document.createElement("button");
      saveDraftBtn.className = "msg-action-btn save-draft";
      saveDraftBtn.innerHTML = `${ICONS.save} Save as Pending Draft`;
      saveDraftBtn.onclick = async () => {
        saveDraftBtn.disabled = true;
        saveDraftBtn.textContent = "Saving...";
        try {
          const res = await fetch("/api/chat/save-draft", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: activeContentType,
              text: msg.text,
              title: msg.extractedTitle || "Generated Content"
            })
          });
          const data = await res.json();
          if (data.ok) {
            showToast(`Saved to ${data.saved_to || "pending drafts"}!`);
            saveDraftBtn.innerHTML = `${ICONS.check} Saved in Pipeline`;
          } else {
            showToast("Save failed: " + (data.error || "unknown"));
            saveDraftBtn.disabled = false;
            saveDraftBtn.innerHTML = `${ICONS.save} Save as Pending Draft`;
          }
        } catch (err) {
          showToast("Error saving draft");
          saveDraftBtn.disabled = false;
          saveDraftBtn.innerHTML = `${ICONS.save} Save as Pending Draft`;
        }
      };

      actions.appendChild(copyBtn);
      actions.appendChild(downloadBtn);
      actions.appendChild(saveDraftBtn);
      contentDiv.appendChild(actions);
    }

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(contentDiv);
    chatMessages.appendChild(msgDiv);
  }

  function bindQuickPrompts() {
    document.querySelectorAll(".qp-card").forEach(card => {
      card.onclick = () => {
        const p = card.getAttribute("data-prompt");
        chatInput.value = p;
        btnSend.disabled = false;
        sendMessage();
      };
    });
  }

  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text || isGenerating) return;

    if (!currentSessionId) {
      createNewSession();
    }

    const sess = getCurrentSession();
    if (!sess) return;

    // Set conversation title on first message
    if (sess.messages.length === 0) {
      sess.title = text.slice(0, 36) + (text.length > 36 ? "..." : "");
      renderHistory();
    }

    // Add user message
    const userMsg = { role: "user", text, timestamp: Date.now() };
    sess.messages.push(userMsg);
    saveSessions();
    renderMessages();

    chatInput.value = "";
    chatInput.style.height = "auto";
    btnSend.disabled = true;
    isGenerating = true;

    // Show typing status card
    const typingMsg = document.createElement("div");
    typingMsg.className = "msg ai";
    typingMsg.id = "typingCardElement";
    typingMsg.innerHTML = `
      <div class="msg-avatar">${ICONS.ai}</div>
      <div class="msg-content">
        <div class="msg-bubble">
          <div class="typing-card">
            <div class="typing-dots">
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
              <div class="typing-dot"></div>
            </div>
            <div class="typing-status" id="typingStatusText">SEO Master analyzing search intent &amp; long-tails...</div>
          </div>
        </div>
      </div>
    `;
    chatMessages.appendChild(typingMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    const statusUpdates = [
      "Researching competitive keywords & search volume...",
      "Structuring semantic headings & LSI clusters...",
      "Integrating HMorix product USPs & case metrics...",
      "Synthesizing thought process & drafting content..."
    ];
    let sIdx = 0;
    const statusInterval = setInterval(() => {
      const sElem = document.getElementById("typingStatusText");
      if (sElem && sIdx < statusUpdates.length) {
        sElem.textContent = statusUpdates[sIdx++];
      }
    }, 1800);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sess.id,
          message: text,
          content_type: activeContentType,
          model: activeModel,
          thinking_enabled: thinkingEnabled,
          history: sess.messages.slice(0, -1)
        })
      });

      clearInterval(statusInterval);
      const typingEl = document.getElementById("typingCardElement");
      if (typingEl) typingEl.remove();

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const aiMsg = {
        role: "ai",
        text: data.reply || "No content generated.",
        thinkingSteps: data.thinking_steps || [],
        clarifyingQuestions: data.clarifying_questions || [],
        extractedTitle: data.title || "",
        timestamp: Date.now()
      };

      sess.messages.push(aiMsg);
      saveSessions();
      renderMessages();
    } catch (err) {
      clearInterval(statusInterval);
      const typingEl = document.getElementById("typingCardElement");
      if (typingEl) typingEl.remove();

      const errorMsg = {
        role: "ai",
        text: `**Generation Error:** ${err.message}\n\nPlease verify your NVIDIA NIM connection and try again.`,
        timestamp: Date.now()
      };
      sess.messages.push(errorMsg);
      saveSessions();
      renderMessages();
    } finally {
      isGenerating = false;
      btnSend.disabled = chatInput.value.trim().length === 0;
      chatInput.focus();
    }
  }

  // Event Listeners
  btnSend.onclick = sendMessage;

  chatInput.addEventListener("input", () => {
    btnSend.disabled = chatInput.value.trim().length === 0;
    chatInput.style.height = "auto";
    chatInput.style.height = Math.min(chatInput.scrollHeight, 180) + "px";
  });

  chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  btnNewChat.onclick = createNewSession;

  btnToggleSidebar.onclick = () => {
    sidebar.classList.toggle("collapsed");
    sidebar.classList.toggle("open");
  };

  // Content type buttons
  contentTypeGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".ct-btn");
    if (!btn) return;
    activeContentType = btn.getAttribute("data-type");
    updateContentTypeUI();
    const sess = getCurrentSession();
    if (sess) {
      sess.contentType = activeContentType;
      saveSessions();
    }
  });

  // Model dropdown
  modelPillBtn.onclick = (e) => {
    e.stopPropagation();
    modelDropdown.classList.toggle("open");
  };

  document.addEventListener("click", () => {
    modelDropdown.classList.remove("open");
  });

  modelDropdown.addEventListener("click", (e) => {
    const opt = e.target.closest(".model-opt");
    if (!opt) return;
    activeModel = opt.getAttribute("data-model");
    modelPillLabel.textContent = activeModel.split("/").pop().replace("-instruct", "");
    document.querySelectorAll(".model-opt").forEach(o => o.classList.remove("selected"));
    opt.classList.add("selected");
    modelDropdown.classList.remove("open");
    showToast(`Model set to ${modelPillLabel.textContent}`);
  });

  // Thinking toggle
  thinkingToggle.onclick = () => {
    thinkingEnabled = !thinkingEnabled;
    thinkingToggle.classList.toggle("active", thinkingEnabled);
    document.querySelectorAll(".thinking-body").forEach(b => {
      b.classList.toggle("open", thinkingEnabled);
    });
    showToast(`Thinking mode ${thinkingEnabled ? "enabled" : "collapsed"}`);
  };

  // Theme toggle
  if (themeToggle) {
    themeToggle.onclick = () => {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      document.documentElement.setAttribute("data-theme", isLight ? "dark" : "light");
      themeToggle.innerHTML = isLight ? ICONS.moon : ICONS.sun;
    };
  }

  // Initialize
  loadSessions();
  if (sessions.length === 0) {
    createNewSession();
  } else {
    currentSessionId = sessions[0].id;
    activeContentType = sessions[0].contentType || "blog";
    updateContentTypeUI();
    renderHistory();
    renderMessages();
  }
})();
