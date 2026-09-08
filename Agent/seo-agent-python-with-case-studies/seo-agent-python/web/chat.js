// HMorix SEO Master — Interactive ChatGPT-like Controller
(function () {
  const STORAGE_KEY = 'hmorix_seo_chat_sessions_v1';
  let sessions = [];
  let currentSessionId = null;
  let activeContentType = 'blog';
  let activeModel = 'meta/llama-4-maverick-17b-128e-instruct';
  let thinkingEnabled = true;
  let isGenerating = false;

  // DOM elements
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const btnSend = document.getElementById('btnSend');
  const btnNewChat = document.getElementById('btnNewChat');
  const historyList = document.getElementById('historyList');
  const sidebar = document.getElementById('sidebar');
  const btnToggleSidebar = document.getElementById('btnToggleSidebar');
  const modelPillBtn = document.getElementById('modelPillBtn');
  const modelPillLabel = document.getElementById('modelPillLabel');
  const modelDropdown = document.getElementById('modelDropdown');
  const thinkingToggle = document.getElementById('thinkingToggle');
  const contentTypeGrid = document.getElementById('contentTypeGrid');
  const activeTypeBadge = document.getElementById('activeTypeBadge');
  const toast = document.getElementById('toast');
  const themeToggle = document.getElementById('themeToggle');

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
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }

  function getCurrentSession() {
    return sessions.find(s => s.id === currentSessionId);
  }

  function createNewSession() {
    const id = 'chat_' + Date.now();
    const newSession = {
      id,
      title: 'New Conversation',
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
    historyList.innerHTML = '';
    sessions.forEach(sess => {
      const item = document.createElement('div');
      item.className = 'hist-item' + (sess.id === currentSessionId ? ' active' : '');
      
      const titleSpan = document.createElement('span');
      titleSpan.className = 'hist-title';
      titleSpan.textContent = sess.title || 'Conversation';
      titleSpan.onclick = () => {
        currentSessionId = sess.id;
        activeContentType = sess.contentType || 'blog';
        updateContentTypeUI();
        saveSessions();
        renderHistory();
        renderMessages();
      };

      const delBtn = document.createElement('button');
      delBtn.className = 'hist-del';
      delBtn.innerHTML = '×';
      delBtn.title = 'Delete chat';
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
    document.querySelectorAll('.ct-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-type') === activeContentType);
    });
  }

  // Simple, fast client-side markdown formatter
  function formatMarkdown(text) {
    if (!text) return '';
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Fenced code blocks
    escaped = escaped.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang}">${code}</code></pre>`;
    });

    // Inline code
    escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    escaped = escaped.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    escaped = escaped.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    escaped = escaped.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold & italic
    escaped = escaped.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    escaped = escaped.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Blockquote
    escaped = escaped.replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Lists
    escaped = escaped.replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>');
    escaped = escaped.replace(/(<li>[\s\S]*?<\/li>)/gim, '<ul>$1</ul>');
    escaped = escaped.replace(/<\/ul>\s*<ul>/g, '');

    // Tables
    if (escaped.includes('|')) {
      const lines = escaped.split('\n');
      let inTable = false;
      let tableHtml = '';
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('|') && line.endsWith('|')) {
          if (line.includes('---')) continue; // separator row
          if (!inTable) {
            inTable = true;
            tableHtml += '<table>';
          }
          const cells = line.slice(1, -1).split('|').map(c => c.trim());
          const tag = !tableHtml.includes('<tbody>') ? 'th' : 'td';
          tableHtml += '<tr>' + cells.map(c => `<${tag}>${c}</${tag}>`).join('') + '</tr>';
          if (tag === 'th') tableHtml += '<tbody>';
        } else {
          if (inTable) {
            tableHtml += '</tbody></table>';
            inTable = false;
          }
        }
      }
      if (inTable) tableHtml += '</tbody></table>';
      if (tableHtml) {
        // If formatted table exists, clean up lines
        escaped = escaped.replace(/(\|.*?\|\n?)+/g, tableHtml);
      }
    }

    // Paragraphs & newlines
    escaped = escaped.replace(/\n{2,}/g, '</p><p>');
    escaped = '<p>' + escaped.replace(/\n/g, '<br/>') + '</p>';
    escaped = escaped.replace(/<p><\/p>/g, '');
    return escaped;
  }

  function renderMessages() {
    const sess = getCurrentSession();
    if (!sess || !sess.messages || sess.messages.length === 0) {
      chatMessages.innerHTML = `
        <div class="welcome-screen" id="welcomeScreen">
          <div class="welcome-logo">⚡</div>
          <div class="welcome-title">HMorix <span>SEO Master</span></div>
          <div class="welcome-sub">
            Interactive AI content strategist. Discovers high-converting long-tail keywords, asks Claude-style clarifying questions, and drafts publication-ready blogs, case studies, whitepapers, and press releases for HMorix.
          </div>
          <div class="quick-prompts">
            <div class="qp-card" data-prompt="Write an SEO blog on AI-powered HRM software for Indian enterprises with target long-tail keywords.">
              <div class="qp-tag">Blog Post · Long-tail</div>
              <div class="qp-text">AI HRM for Indian Enterprises with target keywords</div>
            </div>
            <div class="qp-card" data-prompt="Generate 20 high-intent long-tail keywords and competitor gap analysis for HMorix CRM in Delhi NCR, Agra, and Hathras.">
              <div class="qp-tag">Keywords &amp; Audit</div>
              <div class="qp-text">Long-tail keywords for regional CRM market</div>
            </div>
            <div class="qp-card" data-prompt="Plan and write a comprehensive whitepaper on Digital Transformation for Manufacturing and Retail SMBs using HMorix ERP.">
              <div class="qp-tag">Whitepaper</div>
              <div class="qp-text">Manufacturing Digital Transformation Framework</div>
            </div>
            <div class="qp-card" data-prompt="Draft an enterprise case study showing how HMorix automated attendance, payroll, and billing for a 350-employee hospitality client.">
              <div class="qp-tag">Case Study</div>
              <div class="qp-text">Hospitality client payroll &amp; billing automation</div>
            </div>
            <div class="qp-card" data-prompt="Write a press release announcing HMorix BillingFlow 2.0 with GST compliance and automated PDF generation.">
              <div class="qp-tag">Press Release</div>
              <div class="qp-text">BillingFlow 2.0 Product Launch Announcement</div>
            </div>
            <div class="qp-card" data-prompt="Run an SEO content audit for hmorix.in and highlight our top 5 organic growth opportunities for Q3.">
              <div class="qp-tag">SEO Strategy</div>
              <div class="qp-text">Complete organic growth &amp; content audit for hmorix.in</div>
            </div>
          </div>
        </div>
      `;
      bindQuickPrompts();
      return;
    }

    chatMessages.innerHTML = '';
    sess.messages.forEach((msg, idx) => {
      appendMessageElement(msg, idx);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function appendMessageElement(msg, idx) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${msg.role}`;

    const avatar = document.createElement('div');
    avatar.className = 'msg-avatar';
    avatar.textContent = msg.role === 'user' ? 'U' : '⚡';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'msg-content';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';

    // If AI message has thinking steps
    if (msg.role === 'ai' && msg.thinkingSteps && msg.thinkingSteps.length > 0) {
      const thinkingBox = document.createElement('div');
      thinkingBox.className = 'thinking-box';
      
      const head = document.createElement('div');
      head.className = 'thinking-head';
      head.innerHTML = `<span>🧠 Chain-of-Thought (${msg.thinkingSteps.length} steps)</span> <span>▾</span>`;
      
      const body = document.createElement('div');
      body.className = 'thinking-body' + (thinkingEnabled ? ' open' : '');
      body.innerHTML = msg.thinkingSteps.map((step, sIdx) => `
        <div class="thinking-step">
          <span class="thinking-step-num">[Step ${sIdx + 1}]</span>
          <span>${step}</span>
        </div>
      `).join('');

      head.onclick = () => body.classList.toggle('open');
      thinkingBox.appendChild(head);
      thinkingBox.appendChild(body);
      bubble.appendChild(thinkingBox);
    }

    // Main text
    const textNode = document.createElement('div');
    textNode.innerHTML = formatMarkdown(msg.text);
    bubble.appendChild(textNode);

    // If AI message has clarifying questions
    if (msg.role === 'ai' && msg.clarifyingQuestions && msg.clarifyingQuestions.length > 0) {
      const qCard = document.createElement('div');
      qCard.className = 'questions-card';
      qCard.innerHTML = `<div class="questions-title"><span>❓</span> Clarifying Questions &amp; Direction:</div>`;
      
      msg.clarifyingQuestions.forEach(qObj => {
        const qWrap = document.createElement('div');
        qWrap.className = 'question-item';
        qWrap.innerHTML = `<div>• <strong>${qObj.question}</strong></div>`;
        if (qObj.options && qObj.options.length) {
          const optWrap = document.createElement('div');
          optWrap.className = 'question-options';
          qObj.options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'q-opt-btn';
            btn.textContent = opt;
            btn.onclick = () => {
              chatInput.value = (chatInput.value ? chatInput.value + '\n' : '') + `Answer for "${qObj.question}": ${opt}`;
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
    if (msg.role === 'ai') {
      const actions = document.createElement('div');
      actions.className = 'msg-actions';

      const copyBtn = document.createElement('button');
      copyBtn.className = 'msg-action-btn';
      copyBtn.innerHTML = '📋 Copy Text';
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(msg.text);
        showToast('Copied to clipboard!');
      };

      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'msg-action-btn';
      downloadBtn.innerHTML = '⬇ Download .md';
      downloadBtn.onclick = () => {
        const blob = new Blob([msg.text], { type: 'text/markdown' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `hmorix-content-${Date.now()}.md`;
        a.click();
      };

      const saveDraftBtn = document.createElement('button');
      saveDraftBtn.className = 'msg-action-btn save-draft';
      saveDraftBtn.innerHTML = '💾 Save as Pending Draft';
      saveDraftBtn.onclick = async () => {
        saveDraftBtn.disabled = true;
        saveDraftBtn.textContent = 'Saving...';
        try {
          const res = await fetch('/api/chat/save-draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: activeContentType,
              text: msg.text,
              title: msg.extractedTitle || 'Generated Content'
            })
          });
          const data = await res.json();
          if (data.ok) {
            showToast(`Saved to ${data.saved_to || 'pending drafts'}!`);
            saveDraftBtn.textContent = '✓ Saved in Pipeline';
          } else {
            showToast('Save failed: ' + (data.error || 'unknown'));
            saveDraftBtn.disabled = false;
            saveDraftBtn.textContent = '💾 Save as Pending Draft';
          }
        } catch (err) {
          showToast('Error saving draft');
          saveDraftBtn.disabled = false;
          saveDraftBtn.textContent = '💾 Save as Pending Draft';
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
    document.querySelectorAll('.qp-card').forEach(card => {
      card.onclick = () => {
        const p = card.getAttribute('data-prompt');
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
      sess.title = text.slice(0, 36) + (text.length > 36 ? '...' : '');
      renderHistory();
    }

    // Add user message
    const userMsg = { role: 'user', text, timestamp: Date.now() };
    sess.messages.push(userMsg);
    saveSessions();
    renderMessages();

    chatInput.value = '';
    chatInput.style.height = 'auto';
    btnSend.disabled = true;
    isGenerating = true;

    // Show typing status card
    const typingMsg = document.createElement('div');
    typingMsg.className = 'msg ai';
    typingMsg.id = 'typingCardElement';
    typingMsg.innerHTML = `
      <div class="msg-avatar">⚡</div>
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
      'Researching competitive keywords & search volume...',
      'Structuring semantic headings & LSI clusters...',
      'Integrating HMorix product USPs & case metrics...',
      'Synthesizing thought process & drafting content...'
    ];
    let sIdx = 0;
    const statusInterval = setInterval(() => {
      const sElem = document.getElementById('typingStatusText');
      if (sElem && sIdx < statusUpdates.length) {
        sElem.textContent = statusUpdates[sIdx++];
      }
    }, 1800);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sess.id,
          message: text,
          content_type: activeContentType,
          model: activeModel,
          thinking_enabled: thinkingEnabled,
          history: sess.messages.slice(0, -1) // send previous context
        })
      });

      clearInterval(statusInterval);
      const typingEl = document.getElementById('typingCardElement');
      if (typingEl) typingEl.remove();

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const aiMsg = {
        role: 'ai',
        text: data.reply || 'No content generated.',
        thinkingSteps: data.thinking_steps || [],
        clarifyingQuestions: data.clarifying_questions || [],
        extractedTitle: data.title || '',
        timestamp: Date.now()
      };

      sess.messages.push(aiMsg);
      saveSessions();
      renderMessages();
    } catch (err) {
      clearInterval(statusInterval);
      const typingEl = document.getElementById('typingCardElement');
      if (typingEl) typingEl.remove();

      const errorMsg = {
        role: 'ai',
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

  chatInput.addEventListener('input', () => {
    btnSend.disabled = chatInput.value.trim().length === 0;
    chatInput.style.height = 'auto';
    chatInput.style.height = Math.min(chatInput.scrollHeight, 180) + 'px';
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  btnNewChat.onclick = createNewSession;

  btnToggleSidebar.onclick = () => {
    sidebar.classList.toggle('collapsed');
    sidebar.classList.toggle('open');
  };

  // Content type buttons
  contentTypeGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('.ct-btn');
    if (!btn) return;
    activeContentType = btn.getAttribute('data-type');
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
    modelDropdown.classList.toggle('open');
  };

  document.addEventListener('click', () => {
    modelDropdown.classList.remove('open');
  });

  modelDropdown.addEventListener('click', (e) => {
    const opt = e.target.closest('.model-opt');
    if (!opt) return;
    activeModel = opt.getAttribute('data-model');
    modelPillLabel.textContent = activeModel.split('/').pop().replace('-instruct', '');
    document.querySelectorAll('.model-opt').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    modelDropdown.classList.remove('open');
    showToast(`Model set to ${modelPillLabel.textContent}`);
  });

  // Thinking toggle
  thinkingToggle.onclick = () => {
    thinkingEnabled = !thinkingEnabled;
    thinkingToggle.classList.toggle('active', thinkingEnabled);
    document.querySelectorAll('.thinking-body').forEach(b => {
      b.classList.toggle('open', thinkingEnabled);
    });
    showToast(`Thinking mode ${thinkingEnabled ? 'enabled' : 'collapsed'}`);
  };

  // Theme toggle
  if (themeToggle) {
    themeToggle.onclick = () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
      themeToggle.textContent = isLight ? '🌙' : '☀️';
    };
  }

  // Initialize
  loadSessions();
  if (sessions.length === 0) {
    createNewSession();
  } else {
    currentSessionId = sessions[0].id;
    activeContentType = sessions[0].contentType || 'blog';
    updateContentTypeUI();
    renderHistory();
    renderMessages();
  }
})();
