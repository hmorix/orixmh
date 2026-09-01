// HMorix HRM & Enterprise Document Generator Suite
// 100% free & native — zero paid libraries, zero external dependencies
// Uses native browser window.open() + window.print() + SVG vector seals

export interface CompanyInfo {
  name: string
  address: string
  email: string
  phone: string
  website: string
  cin: string
  pan?: string
  gstin?: string
}

export const COMPANY: CompanyInfo = {
  name: "HMorix Technologies Pvt Ltd",
  address: "MG Polytechnic Road, Hathras, Uttar Pradesh – 204101, India",
  email: "hr@hmorix.com",
  phone: "+91 98765 43210",
  website: "https://hmorix.in",
  cin: "U72900UP2026PTC123456",
  pan: "AABCH1234F",
  gstin: "09AABCH1234F1Z5"
}

// Convert numbers to English currency words
export function numberToWords(num: number): string {
  const a = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

  function inWords(n: number): string {
    if (n === 0) return ""
    if (n < 20) return a[n] + " "
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "") + " "
    if (n < 1000) return inWords(Math.floor(n / 100)) + "Hundred " + inWords(n % 100)
    if (n < 100000) return inWords(Math.floor(n / 1000)) + "Thousand " + inWords(n % 1000)
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + "Lakh " + inWords(n % 100000)
    return inWords(Math.floor(n / 10000000)) + "Crore " + inWords(n % 10000000)
  }

  const rounded = Math.round(Math.abs(num))
  if (rounded === 0) return "Zero Rupees Only"
  return (inWords(rounded).trim() + " Rupees Only")
}

const DOCUMENT_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 11.5px;
    color: #1e293b;
    background: #f1f5f9;
    padding: 0;
    line-height: 1.65;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Interactive Top Toolbar (Hidden on Print) */
  .print-toolbar {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: #090d16;
    color: #f8fafc;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 16px rgba(0,0,0,0.25);
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
  .tb-brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .tb-logo {
    width: 28px;
    height: 28px;
    background: #c8ff00;
    color: #090d16;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 12px;
  }
  .tb-title {
    font-size: 13px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.01em;
  }
  .tb-sub {
    font-size: 10px;
    color: #94a3b8;
  }
  .tb-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .tb-btn {
    padding: 7px 14px;
    border-radius: 6px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.15s ease;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .tb-btn-mode {
    background: rgba(255,255,255,0.08);
    color: #cbd5e1;
    border: 1px solid rgba(255,255,255,0.15);
  }
  .tb-btn-mode:hover {
    background: rgba(255,255,255,0.16);
    color: #ffffff;
  }
  .tb-btn-mode.active {
    background: #ffffff;
    color: #090d16;
    font-weight: 700;
    border-color: #ffffff;
  }
  .tb-btn-print {
    background: #c8ff00;
    color: #090d16;
    font-weight: 800;
  }
  .tb-btn-print:hover {
    background: #d4ff33;
    box-shadow: 0 0 12px rgba(200,255,0,0.4);
  }

  /* Document Sheet Container */
  .doc-sheet-wrapper {
    padding: 30px 16px;
    display: flex;
    justify-content: center;
  }
  .doc-sheet {
    width: 100%;
    max-width: 800px;
    background: #ffffff;
    padding: 44px 48px;
    border-radius: 4px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
    position: relative;
  }

  /* Header Section */
  .doc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 18px;
    border-bottom: 2.5px solid #0f172a;
    margin-bottom: 22px;
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .corp-badge {
    width: 48px;
    height: 48px;
    background: #0f172a;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #c8ff00;
    font-weight: 900;
    font-size: 18px;
    letter-spacing: -1px;
    flex-shrink: 0;
  }
  .corp-name {
    font-size: 17px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    line-height: 1.2;
  }
  .corp-meta {
    font-size: 9.5px;
    color: #64748b;
    margin-top: 3px;
    line-height: 1.4;
  }
  .header-right {
    text-align: right;
  }
  .doc-type-pill {
    display: inline-block;
    font-size: 13px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    background: #0f172a;
    color: #ffffff;
    padding: 6px 14px;
    border-radius: 4px;
  }
  .doc-reg-details {
    font-size: 9px;
    color: #94a3b8;
    margin-top: 5px;
    font-mono: monospace;
  }

  /* Reference & Date Ribbon */
  .ref-ribbon {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 8px 14px;
    border-radius: 6px;
    margin-bottom: 20px;
    font-size: 10.5px;
    color: #475569;
  }
  .ref-ribbon strong {
    color: #0f172a;
  }

  /* Recipient / Candidate / Client Block */
  .recipient-block {
    margin-bottom: 20px;
    padding: 12px 16px;
    background: #f8fafc;
    border-left: 3.5px solid #c8ff00;
    border-radius: 0 6px 6px 0;
  }
  .recipient-title {
    font-size: 9.5px;
    text-transform: uppercase;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.05em;
    margin-bottom: 2px;
  }
  .recipient-name {
    font-size: 15px;
    font-weight: 800;
    color: #0f172a;
  }
  .recipient-sub {
    font-size: 11px;
    color: #475569;
    margin-top: 2px;
  }

  /* Summary Details Grid */
  .details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px 16px;
    margin: 16px 0;
    font-size: 11px;
  }
  .dg-item {
    display: flex;
    justify-content: space-between;
    padding: 4px 0;
    border-bottom: 1px dashed #e2e8f0;
  }
  .dg-item:last-child, .dg-item:nth-last-child(2) {
    border-bottom: none;
  }
  .dg-label {
    color: #64748b;
  }
  .dg-value {
    font-weight: 700;
    color: #0f172a;
  }

  /* Typography */
  p {
    margin-bottom: 12px;
    font-size: 11.5px;
    color: #334155;
    text-align: justify;
    line-height: 1.7;
  }
  h3 {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #0f172a;
    margin: 18px 0 8px;
    padding-bottom: 4px;
    border-bottom: 1.5px solid #e2e8f0;
  }

  /* Financial & Itemized Tables */
  .table-wrap {
    margin: 14px 0 20px;
    overflow: hidden;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
  }
  thead tr {
    background: #0f172a;
  }
  th {
    color: #c8ff00;
    font-size: 9.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 8px 12px;
    text-align: left;
  }
  th.num, td.num {
    text-align: right;
  }
  td {
    padding: 7px 12px;
    border-bottom: 1px solid #f1f5f9;
    color: #334155;
  }
  tbody tr:nth-child(even) {
    background: #f8fafc;
  }
  tbody tr:last-child td {
    border-bottom: none;
  }
  .total-row td {
    background: #f1f5f9 !important;
    font-weight: 800;
    color: #0f172a;
    border-top: 2px solid #cbd5e1;
    font-size: 12px;
  }

  /* Net Highlight Callout */
  .net-callout {
    background: #f8fafc;
    border: 1.5px solid #0f172a;
    border-radius: 8px;
    padding: 16px;
    margin: 18px 0;
    text-align: center;
  }
  .net-callout-label {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #64748b;
  }
  .net-callout-val {
    font-size: 26px;
    font-weight: 900;
    color: #0f172a;
    margin: 4px 0;
    letter-spacing: -0.02em;
  }
  .net-callout-words {
    font-size: 10.5px;
    color: #475569;
    font-style: italic;
  }

  /* Terms Box */
  .terms-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px 16px;
    margin: 16px 0;
    font-size: 10.5px;
    color: #475569;
  }
  .terms-box ul {
    padding-left: 18px;
  }
  .terms-box li {
    margin-bottom: 4px;
  }

  /* Signatures & Corporate Seal */
  .sig-grid {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 36px;
    padding-top: 14px;
  }
  .sig-col {
    width: 220px;
  }
  .sig-bar {
    border-top: 1.5px solid #0f172a;
    width: 170px;
    margin-bottom: 6px;
  }
  .sig-caption {
    font-size: 9.5px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .sig-person {
    font-size: 13px;
    font-weight: 800;
    color: #0f172a;
    margin-top: 2px;
  }
  .sig-dept {
    font-size: 10px;
    color: #64748b;
  }

  /* Digital Verification Seal Badge */
  .digital-seal-box {
    text-align: center;
    border: 1.5px dashed #10b981;
    background: #ecfdf5;
    border-radius: 8px;
    padding: 8px 14px;
    display: inline-block;
  }
  .seal-text-top {
    font-size: 8.5px;
    font-weight: 800;
    color: #059669;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .seal-text-mid {
    font-size: 11px;
    font-weight: 900;
    color: #065f46;
  }
  .seal-text-bot {
    font-size: 8px;
    color: #047857;
  }

  /* Footer Section */
  .doc-footer {
    margin-top: 32px;
    padding-top: 12px;
    border-top: 1px solid #e2e8f0;
    font-size: 9px;
    color: #94a3b8;
    text-align: center;
    line-height: 1.5;
  }

  /* =========================================================================
     BLACK & WHITE (B&W MONOCHROME) MODE OVERRIDES
     Optimized for Laser Printers, Photocopy Clarity, & Low-Ink Printing
     ========================================================================= */
  .bw-mode {
    color: #000000 !important;
  }
  .bw-mode .doc-header {
    border-bottom: 2px solid #000000 !important;
  }
  .bw-mode .corp-badge {
    background: #ffffff !important;
    border: 2px solid #000000 !important;
    color: #000000 !important;
  }
  .bw-mode .corp-name,
  .bw-mode .recipient-name,
  .bw-mode h3,
  .bw-mode .net-callout-val,
  .bw-mode .sig-person {
    color: #000000 !important;
  }
  .bw-mode .doc-type-pill {
    background: #ffffff !important;
    border: 1.5px solid #000000 !important;
    color: #000000 !important;
  }
  .bw-mode .ref-ribbon,
  .bw-mode .details-grid,
  .bw-mode .recipient-block,
  .bw-mode .terms-box {
    background: #ffffff !important;
    border: 1px solid #000000 !important;
    color: #000000 !important;
  }
  .bw-mode .recipient-block {
    border-left: 4px solid #000000 !important;
  }
  .bw-mode .table-wrap {
    border: 1px solid #000000 !important;
  }
  .bw-mode thead tr {
    background: #ffffff !important;
    border-bottom: 2px solid #000000 !important;
  }
  .bw-mode th {
    color: #000000 !important;
    border-bottom: 2px solid #000000 !important;
  }
  .bw-mode tbody tr {
    background: #ffffff !important;
  }
  .bw-mode td {
    color: #000000 !important;
    border-bottom: 1px solid #cccccc !important;
  }
  .bw-mode .total-row td {
    background: #ffffff !important;
    color: #000000 !important;
    border-top: 2px solid #000000 !important;
    border-bottom: 2px solid #000000 !important;
  }
  .bw-mode .net-callout {
    background: #ffffff !important;
    border: 2px solid #000000 !important;
  }
  .bw-mode .digital-seal-box {
    background: #ffffff !important;
    border: 1.5px solid #000000 !important;
  }
  .bw-mode .seal-text-top,
  .bw-mode .seal-text-mid,
  .bw-mode .seal-text-bot {
    color: #000000 !important;
  }
  .bw-mode .sig-bar {
    border-top: 1.5px solid #000000 !important;
  }
  .bw-mode .doc-footer {
    border-top: 1px solid #000000 !important;
    color: #333333 !important;
  }

  /* =========================================================================
     DIGITAL ID BADGE SPECIFIC STYLING
     ========================================================================= */
  .badge-grid-container {
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
    padding: 10px 0;
  }
  .id-card-frame {
    width: 320px;
    min-height: 480px;
    background: #ffffff;
    border-radius: 16px;
    border: 2px solid #0f172a;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    display: flex;
    flex-col;
    flex-direction: column;
    justify-content: space-between;
  }
  .id-card-top {
    background: #0f172a;
    padding: 18px 16px;
    text-align: center;
  }
  .id-card-brand {
    font-size: 16px;
    font-weight: 900;
    color: #c8ff00;
    letter-spacing: 1px;
  }
  .id-card-tag {
    font-size: 9px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 2px;
  }
  .id-card-body {
    padding: 20px 18px;
    text-align: center;
    flex: 1;
  }
  .id-avatar-circle {
    width: 76px;
    height: 76px;
    border-radius: 50%;
    background: #0f172a;
    color: #c8ff00;
    font-weight: 900;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    border: 3px solid #c8ff00;
  }
  .id-card-name {
    font-size: 16px;
    font-weight: 800;
    color: #0f172a;
  }
  .id-card-role {
    font-size: 11.5px;
    font-weight: 700;
    color: #0284c7;
    margin-top: 2px;
  }
  .id-card-dept {
    font-size: 10px;
    color: #64748b;
  }
  .id-fields-table {
    margin-top: 14px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px 12px;
    text-align: left;
    font-size: 10px;
  }
  .id-fields-table .id-row {
    display: flex;
    justify-content: space-between;
    padding: 3px 0;
  }
  .id-fields-table .id-lbl {
    color: #64748b;
  }
  .id-fields-table .id-val {
    font-weight: 700;
    color: #0f172a;
  }
  .id-card-barcode {
    font-family: monospace;
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 5px;
    margin: 12px 0 4px;
    color: #0f172a;
  }
  .id-card-bot {
    background: #0f172a;
    color: #cbd5e1;
    padding: 8px 14px;
    text-align: center;
    font-size: 8.5px;
  }

  .bw-mode .id-card-frame {
    border-color: #000000 !important;
  }
  .bw-mode .id-card-top,
  .bw-mode .id-card-bot {
    background: #000000 !important;
    color: #ffffff !important;
  }
  .bw-mode .id-avatar-circle {
    background: #ffffff !important;
    color: #000000 !important;
    border-color: #000000 !important;
  }
  .bw-mode .id-card-role {
    color: #000000 !important;
  }

  /* Print Layout Media Query */
  @media print {
    body {
      background: #ffffff !important;
      padding: 0 !important;
    }
    .print-toolbar {
      display: none !important;
    }
    .doc-sheet-wrapper {
      padding: 0 !important;
    }
    .doc-sheet {
      box-shadow: none !important;
      padding: 0 !important;
      max-width: 100% !important;
    }
    @page {
      margin: 12mm 15mm;
      size: A4 portrait;
    }
  }
`;

function renderHeader(docTitle: string): string {
  return `
    <div class="doc-header">
      <div class="header-left">
        <div class="corp-badge">HM</div>
        <div>
          <div class="corp-name">${COMPANY.name}</div>
          <div class="corp-meta">${COMPANY.address}</div>
          <div class="corp-meta">${COMPANY.email} &bull; ${COMPANY.phone} &bull; ${COMPANY.website}</div>
        </div>
      </div>
      <div class="header-right">
        <div class="doc-type-pill">${docTitle}</div>
        <div class="doc-reg-details">CIN: ${COMPANY.cin} &bull; GSTIN: ${COMPANY.gstin}</div>
      </div>
    </div>
  `;
}

function renderSignatures(signer = "Harsh Sharma", title = "Chief Executive Officer"): string {
  return `
    <div class="sig-grid">
      <div class="sig-col">
        <div class="sig-bar"></div>
        <div class="sig-caption">Authorized Signatory</div>
        <div class="sig-person">${signer}</div>
        <div class="sig-dept">${title}, ${COMPANY.name}</div>
      </div>
      <div class="digital-seal-box">
        <div class="seal-text-top">&bull; DIGITALLY SIGNED &amp; VERIFIED &bull;</div>
        <div class="seal-text-mid">${COMPANY.name}</div>
        <div class="seal-text-bot">Official Corporate Seal &bull; CIN: ${COMPANY.cin}</div>
      </div>
    </div>
  `;
}

function renderFooter(): string {
  return `
    <div class="doc-footer">
      Official Corporate Record &bull; ${COMPANY.name} &bull; CIN: ${COMPANY.cin} &bull; Verification: hr@hmorix.com &bull; ${COMPANY.website}
    </div>
  `;
}

export function openPrintWindow(htmlContent: string, windowTitle: string) {
  const printWindow = window.open("", "_blank", "width=900,height=960");
  if (!printWindow) {
    alert("Please allow pop-ups for this site to generate and print official HR documents.");
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${windowTitle} - HMorix Document Studio</title>
        <style>${DOCUMENT_STYLES}</style>
      </head>
      <body>
        <!-- Top Interactive Controls (Hidden on Print) -->
        <div class="print-toolbar">
          <div class="tb-brand">
            <div class="tb-logo">HM</div>
            <div>
              <div class="tb-title">${windowTitle}</div>
              <div class="tb-sub">HMorix Enterprise Document Studio</div>
            </div>
          </div>
          <div class="tb-actions">
            <button class="tb-btn tb-btn-mode active" id="btn-colour" onclick="setDocMode('colour')">
              🎨 Full Colour
            </button>
            <button class="tb-btn tb-btn-mode" id="btn-bw" onclick="setDocMode('bw')">
              ⬛ Black &amp; White (B&amp;W)
            </button>
            <button class="tb-btn tb-btn-print" onclick="window.print()">
              🖨️ Print / Save PDF
            </button>
          </div>
        </div>

        <!-- Document Body -->
        <div class="doc-sheet-wrapper">
          <div class="doc-sheet" id="doc-root">
            ${htmlContent}
            ${renderFooter()}
          </div>
        </div>

        <script>
          function setDocMode(mode) {
            const root = document.getElementById("doc-root");
            const btnColour = document.getElementById("btn-colour");
            const btnBw = document.getElementById("btn-bw");
            if (mode === "bw") {
              root.classList.add("bw-mode");
              btnBw.classList.add("active");
              btnColour.classList.remove("active");
            } else {
              root.classList.remove("bw-mode");
              btnColour.classList.add("active");
              btnBw.classList.remove("active");
            }
          }
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
  }, 400);
}

/* ==========================================================================
   1. OFFER LETTER
   ========================================================================== */
export interface OfferLetterData {
  name: string
  email?: string
  phone?: string
  address?: string
  role: string
  department: string
  ctc: number
  joiningDate: string
  location: string
  reportingTo?: string
}

export function printOfferLetter(data: OfferLetterData) {
  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
  const m = Math.round(data.ctc / 12)
  const ref = `HM/OL/${Date.now().toString().slice(-6)}`
  const words = numberToWords(data.ctc)

  const html = `
    ${renderHeader("Job Offer Letter")}
    <div class="ref-ribbon">
      <span><strong>Ref:</strong> ${ref}</span>
      <span><strong>Issue Date:</strong> ${date}</span>
    </div>

    <div class="recipient-block">
      <div class="recipient-title">Offer Extended To</div>
      <div class="recipient-name">${data.name}</div>
      <div class="recipient-sub">
        ${data.email ? `<span>Email: ${data.email}</span> &bull; ` : ""}
        ${data.phone ? `<span>Phone: ${data.phone}</span> &bull; ` : ""}
        <span>Location: ${data.location}</span>
      </div>
    </div>

    <p>Dear <strong>${data.name}</strong>,</p>
    <p>
      We are delighted to extend this formal offer of employment for the position of <strong>${data.role}</strong>
      in the <strong>${data.department}</strong> department at <strong>${COMPANY.name}</strong>.
      Following our evaluation of your skills and background, we are confident you will make significant contributions to our technological and business goals.
    </p>

    <div class="details-grid">
      <div class="dg-item"><span class="dg-label">Designation:</span><span class="dg-value">${data.role}</span></div>
      <div class="dg-item"><span class="dg-label">Department:</span><span class="dg-value">${data.department}</span></div>
      <div class="dg-item"><span class="dg-label">Work Location:</span><span class="dg-value">${data.location}</span></div>
      <div class="dg-item"><span class="dg-label">Joining Date:</span><span class="dg-value">${data.joiningDate}</span></div>
      ${data.reportingTo ? `<div class="dg-item"><span class="dg-label">Reporting Manager:</span><span class="dg-value">${data.reportingTo}</span></div>` : ""}
      <div class="dg-item"><span class="dg-label">Annual CTC:</span><span class="dg-value">₹${data.ctc.toLocaleString("en-IN")}</span></div>
    </div>

    <h3>Compensation Structure (Annual CTC: ₹${data.ctc.toLocaleString("en-IN")})</h3>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Salary Component</th>
            <th class="num">Monthly (₹)</th>
            <th class="num">Annualized (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Basic Salary (40%)</td>
            <td class="num">₹${Math.round(m * 0.4).toLocaleString("en-IN")}</td>
            <td class="num">₹${Math.round(data.ctc * 0.4).toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td>House Rent Allowance - HRA (20%)</td>
            <td class="num">₹${Math.round(m * 0.2).toLocaleString("en-IN")}</td>
            <td class="num">₹${Math.round(data.ctc * 0.2).toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td>Special Allowance (30%)</td>
            <td class="num">₹${Math.round(m * 0.3).toLocaleString("en-IN")}</td>
            <td class="num">₹${Math.round(data.ctc * 0.3).toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td>Statutory & Flexi Benefits (10%)</td>
            <td class="num">₹${Math.round(m * 0.1).toLocaleString("en-IN")}</td>
            <td class="num">₹${Math.round(data.ctc * 0.1).toLocaleString("en-IN")}</td>
          </tr>
          <tr class="total-row">
            <td>Total Cost to Company (CTC)</td>
            <td class="num">₹${m.toLocaleString("en-IN")}</td>
            <td class="num">₹${data.ctc.toLocaleString("en-IN")}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="net-callout">
      <div class="net-callout-label">Total Compensation Value</div>
      <div class="net-callout-val">₹${data.ctc.toLocaleString("en-IN")} PA</div>
      <div class="net-callout-words">${words}</div>
    </div>

    <div class="terms-box">
      <h3>Key Terms &amp; Conditions</h3>
      <ul>
        <li><strong>Probation Period:</strong> 90 days from the effective date of joining. Confirmation is subject to satisfactory performance.</li>
        <li><strong>Notice Period:</strong> 30 days during probation; 60 days following confirmation.</li>
        <li><strong>Confidentiality:</strong> Complete confidentiality regarding proprietary systems, client information, and internal IP.</li>
        <li><strong>Validity:</strong> This offer is valid for 7 calendar days from the date of issuance.</li>
      </ul>
    </div>

    <p>Please sign and return the duplicate copy of this letter as confirmation of your acceptance.</p>

    ${renderSignatures()}
  `;

  openPrintWindow(html, `Offer Letter - ${data.name}`);
}

/* ==========================================================================
   2. JOINING LETTER
   ========================================================================== */
export interface JoiningLetterData {
  name: string
  employeeId: string
  role: string
  department: string
  joiningDate: string
  location: string
  reportingTo?: string
  workEmail?: string
}

export function printJoiningLetter(data: JoiningLetterData) {
  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
  const html = `
    ${renderHeader("Joining Confirmation Letter")}
    <div class="ref-ribbon">
      <span><strong>Ref:</strong> HM/JL/${data.employeeId}</span>
      <span><strong>Issue Date:</strong> ${date}</span>
    </div>

    <div class="recipient-block">
      <div class="recipient-title">Employee Information</div>
      <div class="recipient-name">${data.name}</div>
      <div class="recipient-sub">
        <span>Employee ID: <strong>${data.employeeId}</strong></span> &bull; 
        <span>Department: ${data.department}</span>
      </div>
    </div>

    <p>Dear <strong>${data.name}</strong>,</p>
    <p>
      We are delighted to confirm your joining with <strong>${COMPANY.name}</strong> effective <strong>${data.joiningDate}</strong>.
      We warmly welcome you to the team and look forward to a successful and productive journey together.
    </p>

    <div class="details-grid">
      <div class="dg-item"><span class="dg-label">Employee ID:</span><span class="dg-value">${data.employeeId}</span></div>
      <div class="dg-item"><span class="dg-label">Designation:</span><span class="dg-value">${data.role}</span></div>
      <div class="dg-item"><span class="dg-label">Department:</span><span class="dg-value">${data.department}</span></div>
      <div class="dg-item"><span class="dg-label">Joining Date:</span><span class="dg-value">${data.joiningDate}</span></div>
      <div class="dg-item"><span class="dg-label">Work Location:</span><span class="dg-value">${data.location}</span></div>
      ${data.workEmail ? `<div class="dg-item"><span class="dg-label">Work Email:</span><span class="dg-value">${data.workEmail}</span></div>` : ""}
    </div>

    <div class="terms-box">
      <h3>Workplace Standards &amp; Operations</h3>
      <ul>
        <li><strong>Standard Hours:</strong> Monday to Friday, 9:30 AM to 6:30 PM IST (Saturday &amp; Sunday Off).</li>
        <li><strong>Leave Entitlement:</strong> 12 Casual Leaves, 10 Sick Leaves, and 18 Earned Leaves per calendar year.</li>
        <li><strong>IT &amp; Assets:</strong> Company equipment and software licenses are allocated strictly for official duties.</li>
        <li><strong>Code of Conduct:</strong> Adhere to corporate integrity, non-disclosure agreements, and professionalism.</li>
      </ul>
    </div>

    <p>Wishing you an inspiring and rewarding career at HMorix.</p>

    ${renderSignatures()}
  `;

  openPrintWindow(html, `Joining Letter - ${data.name}`);
}

/* ==========================================================================
   3. APPOINTMENT LETTER
   ========================================================================== */
export interface AppointmentLetterData {
  name: string
  employeeId: string
  role: string
  department: string
  joiningDate: string
  location: string
  ctc: number
  reportingTo?: string
}

export function printAppointmentLetter(data: AppointmentLetterData) {
  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
  const m = Math.round(data.ctc / 12)
  const words = numberToWords(data.ctc)

  const html = `
    ${renderHeader("Employment Appointment Letter")}
    <div class="ref-ribbon">
      <span><strong>Ref:</strong> HM/APL/${data.employeeId}</span>
      <span><strong>Date:</strong> ${date}</span>
    </div>

    <div class="recipient-block">
      <div class="recipient-title">Appointee Details</div>
      <div class="recipient-name">${data.name}</div>
      <div class="recipient-sub">Employee ID: <strong>${data.employeeId}</strong> &bull; Designation: <strong>${data.role}</strong></div>
    </div>

    <p>Dear <strong>${data.name}</strong>,</p>
    <p>
      With reference to your application and subsequent technical evaluations, the management of <strong>${COMPANY.name}</strong>
      is pleased to appoint you as <strong>${data.role}</strong> in the <strong>${data.department}</strong> department, effective <strong>${data.joiningDate}</strong>.
    </p>

    <div class="details-grid">
      <div class="dg-item"><span class="dg-label">Employee ID:</span><span class="dg-value">${data.employeeId}</span></div>
      <div class="dg-item"><span class="dg-label">Designation:</span><span class="dg-value">${data.role}</span></div>
      <div class="dg-item"><span class="dg-label">Department:</span><span class="dg-value">${data.department}</span></div>
      <div class="dg-item"><span class="dg-label">Annual Gross CTC:</span><span class="dg-value">₹${data.ctc.toLocaleString("en-IN")}</span></div>
      <div class="dg-item"><span class="dg-label">Monthly Gross:</span><span class="dg-value">₹${m.toLocaleString("en-IN")}</span></div>
      <div class="dg-item"><span class="dg-label">Location:</span><span class="dg-value">${data.location}</span></div>
    </div>

    <div class="net-callout">
      <div class="net-callout-label">Agreed Annual Remuneration</div>
      <div class="net-callout-val">₹${data.ctc.toLocaleString("en-IN")} PA</div>
      <div class="net-callout-words">${words}</div>
    </div>

    <div class="terms-box">
      <h3>Terms of Appointment</h3>
      <ul>
        <li><strong>Probation &amp; Confirmation:</strong> You will be on probation for 90 days from the joining date. Confirmation is based on quarterly KPI milestones.</li>
        <li><strong>Notice Period:</strong> 30 days during probation; 60 days post confirmation.</li>
        <li><strong>IP &amp; Inventions:</strong> All software, codebases, designs, and workflows developed during employment are exclusive intellectual property of ${COMPANY.name}.</li>
        <li><strong>Statutory Compliances:</strong> Provident Fund, Professional Tax, and Income Tax deductions apply in accordance with Indian government regulations.</li>
      </ul>
    </div>

    ${renderSignatures()}
  `;

  openPrintWindow(html, `Appointment Letter - ${data.name}`);
}

/* ==========================================================================
   4. SALARY CERTIFICATE (Proof of Income / Embassy / Loan)
   ========================================================================== */
export interface SalaryCertData {
  name: string
  employeeId: string
  role: string
  department: string
  joiningDate: string
  monthlyGross: number
  annualCtc: number
  purpose?: string
}

export function printSalaryCertificate(data: SalaryCertData) {
  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
  const mWords = numberToWords(data.monthlyGross)
  const aWords = numberToWords(data.annualCtc)

  const html = `
    ${renderHeader("Salary & Employment Certificate")}
    <div class="ref-ribbon">
      <span><strong>Ref:</strong> HM/SC/${data.employeeId}</span>
      <span><strong>Date:</strong> ${date}</span>
    </div>

    <p style="font-weight:700;font-size:13px;color:#0f172a;text-align:center;margin:16px 0;">TO WHOMSOEVER IT MAY CONCERN</p>

    <p>
      This is to certify that <strong>${data.name}</strong> (Employee ID: <strong>${data.employeeId}</strong>)
      is a bonafide full-time employee of <strong>${COMPANY.name}</strong>, working as <strong>${data.role}</strong>
      in the <strong>${data.department}</strong> department since <strong>${data.joiningDate}</strong>.
    </p>

    <div class="details-grid">
      <div class="dg-item"><span class="dg-label">Employee Name:</span><span class="dg-value">${data.name}</span></div>
      <div class="dg-item"><span class="dg-label">Employee ID:</span><span class="dg-value">${data.employeeId}</span></div>
      <div class="dg-item"><span class="dg-label">Designation:</span><span class="dg-value">${data.role}</span></div>
      <div class="dg-item"><span class="dg-label">Date of Joining:</span><span class="dg-value">${data.joiningDate}</span></div>
      <div class="dg-item"><span class="dg-label">Employment Status:</span><span class="dg-value">Active / Confirmed</span></div>
      <div class="dg-item"><span class="dg-label">Monthly Gross Salary:</span><span class="dg-value">₹${data.monthlyGross.toLocaleString("en-IN")}</span></div>
      <div class="dg-item"><span class="dg-label">Annual Cost to Company:</span><span class="dg-value">₹${data.annualCtc.toLocaleString("en-IN")}</span></div>
    </div>

    <div class="net-callout">
      <div class="net-callout-label">Certified Monthly Gross Salary</div>
      <div class="net-callout-val">₹${data.monthlyGross.toLocaleString("en-IN")} / Month</div>
      <div class="net-callout-words">${mWords} (Annual CTC: ₹${data.annualCtc.toLocaleString("en-IN")} &bull; ${aWords})</div>
    </div>

    <p>
      This certificate is issued upon the request of the employee ${data.purpose ? `for the purpose of ${data.purpose}` : "for official verification and financial documentation"}
      without any financial liability or commitment on part of the company.
    </p>

    ${renderSignatures()}
  `;

  openPrintWindow(html, `Salary Certificate - ${data.name}`);
}

/* ==========================================================================
   5. MONTHLY PAYSLIP / PAYMENT SLIP
   ========================================================================== */
export interface PayslipData {
  name: string
  employeeId: string
  role: string
  department: string
  period: string // e.g. "2026-08" or "August 2026"
  baseSalary: number
  bonus: number
  deductions: number
  net: number
  email?: string
  location?: string
  bankName?: string
  accountNo?: string
  pan?: string
  uan?: string
  workedDays?: number
}

export function printPayslip(data: PayslipData) {
  let periodDisplay = data.period
  if (data.period.includes("-")) {
    const [yr, mo] = data.period.split("-")
    periodDisplay = new Date(+yr, +mo - 1).toLocaleString("en-IN", { month: "long", year: "numeric" })
  }

  const basic = data.baseSalary
  const hra = Math.round(basic * 0.5)
  const special = Math.round(basic * 0.35)
  const gross = basic + hra + special + (data.bonus || 0)

  const pf = Math.round(basic * 0.12)
  const pt = 200
  const tds = Math.max(0, data.deductions - pf - pt)
  const totalDeductions = pf + pt + tds
  const netPay = gross - totalDeductions
  const words = numberToWords(netPay)

  const html = `
    ${renderHeader(`Salary Slip - ${periodDisplay}`)}
    <div class="ref-ribbon">
      <span><strong>Payslip For:</strong> ${periodDisplay}</span>
      <span><strong>Pay Date:</strong> 28 ${periodDisplay}</span>
    </div>

    <div class="details-grid">
      <div class="dg-item"><span class="dg-label">Employee Name:</span><span class="dg-value">${data.name}</span></div>
      <div class="dg-item"><span class="dg-label">Employee ID:</span><span class="dg-value">${data.employeeId}</span></div>
      <div class="dg-item"><span class="dg-label">Designation:</span><span class="dg-value">${data.role}</span></div>
      <div class="dg-item"><span class="dg-label">Department:</span><span class="dg-value">${data.department}</span></div>
      <div class="dg-item"><span class="dg-label">Bank Name:</span><span class="dg-value">${data.bankName || "HDFC Bank Ltd"}</span></div>
      <div class="dg-item"><span class="dg-label">Bank A/C No:</span><span class="dg-value">${data.accountNo || "XXXX-XXXX-8921"}</span></div>
      <div class="dg-item"><span class="dg-label">PAN Number:</span><span class="dg-value">${data.pan || "XXXXX1234X"}</span></div>
      <div class="dg-item"><span class="dg-label">Days Payable:</span><span class="dg-value">${data.workedDays || "30 / 30 Days"}</span></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <!-- Earnings -->
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Earnings</th>
              <th class="num">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Basic Salary</td>
              <td class="num">₹${basic.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td>House Rent Allowance (HRA)</td>
              <td class="num">₹${hra.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td>Special Allowance</td>
              <td class="num">₹${special.toLocaleString("en-IN")}</td>
            </tr>
            ${data.bonus > 0 ? `
            <tr>
              <td>Performance Bonus</td>
              <td class="num">₹${data.bonus.toLocaleString("en-IN")}</td>
            </tr>` : ""}
            <tr class="total-row">
              <td>Gross Earnings</td>
              <td class="num">₹${gross.toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Deductions -->
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Deductions</th>
              <th class="num">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Provident Fund (PF 12%)</td>
              <td class="num">₹${pf.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td>Professional Tax (PT)</td>
              <td class="num">₹${pt.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td>TDS / Income Tax</td>
              <td class="num">₹${tds.toLocaleString("en-IN")}</td>
            </tr>
            <tr class="total-row">
              <td>Total Deductions</td>
              <td class="num">₹${totalDeductions.toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="net-callout">
      <div class="net-callout-label">Net Salary Transferred to Bank Account</div>
      <div class="net-callout-val">₹${netPay.toLocaleString("en-IN")}</div>
      <div class="net-callout-words">${words}</div>
    </div>

    <p style="font-size:9px;color:#64748b;text-align:center;margin-top:12px;">
      This is a digitally generated pay advice and does not require a physical signature. Direct all queries to hr@hmorix.com.
    </p>

    ${renderSignatures()}
  `;

  openPrintWindow(html, `Payslip - ${data.name} - ${periodDisplay}`);
}

/* ==========================================================================
   6. DIGITAL EMPLOYEE ID BADGE (Front & Back)
   ========================================================================== */
export interface EmployeeIdCardData {
  name: string
  employeeId: string
  role: string
  department: string
  joiningDate: string
  bloodGroup?: string
  emergencyPhone?: string
}

export function printEmployeeIdCard(data: EmployeeIdCardData) {
  const initials = data.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

  const html = `
    ${renderHeader("Digital Corporate ID Badge")}
    <p style="text-align:center;color:#64748b;font-size:11px;margin-bottom:16px;">
      Official identification card for ${COMPANY.name}. Fold or cut along edges for dual-sided lamination.
    </p>

    <div class="badge-grid-container">
      <!-- ID BADGE FRONT -->
      <div class="id-card-frame">
        <div class="id-card-top">
          <div class="id-card-brand">HMORIX</div>
          <div class="id-card-tag">Identity Credential &bull; Front</div>
        </div>

        <div class="id-card-body">
          <div class="id-avatar-circle">${initials}</div>
          <div class="id-card-name">${data.name}</div>
          <div class="id-card-role">${data.role}</div>
          <div class="id-card-dept">${data.department}</div>

          <div class="id-fields-table">
            <div class="id-row"><span class="id-lbl">Emp ID:</span><span class="id-val">${data.employeeId}</span></div>
            <div class="id-row"><span class="id-lbl">Blood Group:</span><span class="id-val">${data.bloodGroup || "O+"}</span></div>
            <div class="id-row"><span class="id-lbl">Valid From:</span><span class="id-val">${data.joiningDate}</span></div>
          </div>

          <div class="id-card-barcode">| |||| | ||||| ||| ||||</div>
        </div>

        <div class="id-card-bot">
          ${COMPANY.name} &bull; Hathras, UP
        </div>
      </div>

      <!-- ID BADGE BACK -->
      <div class="id-card-frame">
        <div class="id-card-top">
          <div class="id-card-brand">SECURITY &amp; RETURN</div>
          <div class="id-card-tag">Terms &bull; Emergency Contacts</div>
        </div>

        <div class="id-card-body" style="font-size:9.5px;color:#475569;text-align:left;">
          <div style="background:#0f172a;height:24px;border-radius:4px;margin-bottom:12px;"></div>
          
          <p style="font-size:9px;line-height:1.4;margin-bottom:8px;">
            1. This card is the property of ${COMPANY.name} and must be surrendered upon separation.
          </p>
          <p style="font-size:9px;line-height:1.4;margin-bottom:8px;">
            2. The holder must wear this badge visibly on company premises and client sites.
          </p>

          <div class="id-fields-table" style="margin-top:10px;">
            <div class="id-row"><span class="id-lbl">Emergency:</span><span class="id-val">${data.emergencyPhone || COMPANY.phone}</span></div>
            <div class="id-row"><span class="id-lbl">Corporate HR:</span><span class="id-val">${COMPANY.email}</span></div>
            <div class="id-row"><span class="id-lbl">Return To:</span><span class="id-val">${COMPANY.address}</span></div>
          </div>
        </div>

        <div class="id-card-bot">
          If found, please drop in any post box or contact hr@hmorix.com
        </div>
      </div>
    </div>
  `;

  openPrintWindow(html, `Employee ID Badge - ${data.name}`);
}

/* ==========================================================================
   7. EXPERIENCE CERTIFICATE
   ========================================================================== */
export interface ExperienceLetterData {
  name: string
  employeeId: string
  role: string
  department: string
  joiningDate: string
  relievingDate: string
  performance?: string
}

export function printExperienceLetter(data: ExperienceLetterData) {
  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
  const html = `
    ${renderHeader("Experience & Service Certificate")}
    <div class="ref-ribbon">
      <span><strong>Ref:</strong> HM/EXP/${data.employeeId}</span>
      <span><strong>Date:</strong> ${date}</span>
    </div>

    <p style="font-weight:700;font-size:13px;color:#0f172a;text-align:center;margin:16px 0;">TO WHOMSOEVER IT MAY CONCERN</p>

    <p>
      This is to certify that <strong>${data.name}</strong> (Employee ID: <strong>${data.employeeId}</strong>)
      was employed with <strong>${COMPANY.name}</strong> from <strong>${data.joiningDate}</strong> to <strong>${data.relievingDate}</strong>.
      During their tenure with us, they served as <strong>${data.role}</strong> in the <strong>${data.department}</strong> department.
    </p>

    <div class="details-grid">
      <div class="dg-item"><span class="dg-label">Employee Name:</span><span class="dg-value">${data.name}</span></div>
      <div class="dg-item"><span class="dg-label">Employee ID:</span><span class="dg-value">${data.employeeId}</span></div>
      <div class="dg-item"><span class="dg-label">Last Designation:</span><span class="dg-value">${data.role}</span></div>
      <div class="dg-item"><span class="dg-label">Department:</span><span class="dg-value">${data.department}</span></div>
      <div class="dg-item"><span class="dg-label">Date of Joining:</span><span class="dg-value">${data.joiningDate}</span></div>
      <div class="dg-item"><span class="dg-label">Last Working Day:</span><span class="dg-value">${data.relievingDate}</span></div>
    </div>

    <p>
      ${data.performance || `During their employment, ${data.name} demonstrated outstanding technical competence, strong problem-solving capabilities, and exemplary professional conduct. They were an integral contributor to multiple engineering initiatives.`}
    </p>

    <p>We thank ${data.name} for their dedicated service and wish them the very best in all their future endeavors.</p>

    ${renderSignatures()}
  `;

  openPrintWindow(html, `Experience Certificate - ${data.name}`);
}

/* ==========================================================================
   8. RELIEVING LETTER
   ========================================================================== */
export interface RelievingLetterData {
  name: string
  employeeId: string
  role: string
  department: string
  joiningDate: string
  relievingDate: string
  reason?: string
}

export function printRelievingLetter(data: RelievingLetterData) {
  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
  const html = `
    ${renderHeader("Official Relieving Letter")}
    <div class="ref-ribbon">
      <span><strong>Ref:</strong> HM/RL/${data.employeeId}</span>
      <span><strong>Date:</strong> ${date}</span>
    </div>

    <div class="recipient-block">
      <div class="recipient-title">Relieving Confirmation For</div>
      <div class="recipient-name">${data.name}</div>
      <div class="recipient-sub">Employee ID: <strong>${data.employeeId}</strong> &bull; ${data.role}</div>
    </div>

    <p>Dear <strong>${data.name}</strong>,</p>
    <p>
      With reference to your formal resignation letter, we hereby confirm that you have been officially relieved from your duties and responsibilities as <strong>${data.role}</strong> at <strong>${COMPANY.name}</strong> with effect from the close of business hours on <strong>${data.relievingDate}</strong>.
    </p>

    <div class="details-grid">
      <div class="dg-item"><span class="dg-label">Employee ID:</span><span class="dg-value">${data.employeeId}</span></div>
      <div class="dg-item"><span class="dg-label">Designation:</span><span class="dg-value">${data.role}</span></div>
      <div class="dg-item"><span class="dg-label">Department:</span><span class="dg-value">${data.department}</span></div>
      <div class="dg-item"><span class="dg-label">Joining Date:</span><span class="dg-value">${data.joiningDate}</span></div>
      <div class="dg-item"><span class="dg-label">Relieving Date:</span><span class="dg-value">${data.relievingDate}</span></div>
      <div class="dg-item"><span class="dg-label">Clearance Status:</span><span class="dg-value">All Assets &amp; Handover Complete</span></div>
    </div>

    <p>
      You have satisfactorily completed all handover protocols, returned all company-owned digital assets and security credentials, and completed full and final financial settlements.
    </p>

    <p>We appreciate your contributions to HMorix and wish you success in your future career milestones.</p>

    ${renderSignatures()}
  `;

  openPrintWindow(html, `Relieving Letter - ${data.name}`);
}

/* ==========================================================================
   9. FULL & FINAL (FnF) SETTLEMENT STATEMENT
   ========================================================================== */
export interface FnFData {
  name: string
  employeeId: string
  role: string
  department: string
  joiningDate: string
  relievingDate: string
  monthlySalary: number
  unpaidDays?: number
  leaveEncashDays?: number
  leaveEncashmentDays?: number
  leaveEncashmentAmount?: number
  gratuity?: number
  gratuityAmount?: number
  bonus?: number
  pendingBonus?: number
  deductions?: number
  noticePayAdjustment?: number
  noticeAdjustment?: number
  otherDeductions?: number
  netPayable?: number
}

export function printFnFStatement(data: FnFData) {
  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
  const perDay = Math.round(data.monthlySalary / 30)
  const unpaidDays = data.unpaidDays ?? 30
  const salaryPay = Math.round(perDay * unpaidDays)
  const leaveDays = data.leaveEncashmentDays ?? data.leaveEncashDays ?? 0
  const leavePay = data.leaveEncashmentAmount ?? Math.round(perDay * leaveDays)
  const gratuity = data.gratuityAmount ?? data.gratuity ?? 0
  const bonus = data.pendingBonus ?? data.bonus ?? 0
  const grossPayable = salaryPay + leavePay + gratuity + bonus
  const noticeAdj = data.noticePayAdjustment ?? data.noticeAdjustment ?? 0
  const otherDed = data.otherDeductions ?? 0
  const totalDeductions = data.deductions ?? (noticeAdj + otherDed)
  const netPayable = data.netPayable ?? (grossPayable - totalDeductions)
  const words = numberToWords(netPayable)

  const html = `
    ${renderHeader("Full & Final Settlement Statement")}
    <div class="ref-ribbon">
      <span><strong>Ref:</strong> HM/FNF/${data.employeeId}</span>
      <span><strong>Settlement Date:</strong> ${date}</span>
    </div>

    <div class="details-grid">
      <div class="dg-item"><span class="dg-label">Employee Name:</span><span class="dg-value">${data.name}</span></div>
      <div class="dg-item"><span class="dg-label">Employee ID:</span><span class="dg-value">${data.employeeId}</span></div>
      <div class="dg-item"><span class="dg-label">Designation:</span><span class="dg-value">${data.role}</span></div>
      <div class="dg-item"><span class="dg-label">Department:</span><span class="dg-value">${data.department}</span></div>
      <div class="dg-item"><span class="dg-label">Joining Date:</span><span class="dg-value">${data.joiningDate}</span></div>
      <div class="dg-item"><span class="dg-label">Relieving Date:</span><span class="dg-value">${data.relievingDate}</span></div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Settlement Component</th>
            <th>Units / Calculation</th>
            <th class="num">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Final Month Salary</td>
            <td>${unpaidDays} Days @ ₹${perDay}/day</td>
            <td class="num">₹${salaryPay.toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td>Leave Encashment</td>
            <td>${leaveDays} Accumulated Days</td>
            <td class="num">₹${leavePay.toLocaleString("en-IN")}</td>
          </tr>
          ${gratuity > 0 ? `
          <tr>
            <td>Gratuity Settlement</td>
            <td>Payment of Gratuity Act, 1972</td>
            <td class="num">₹${gratuity.toLocaleString("en-IN")}</td>
          </tr>` : ""}
          ${bonus > 0 ? `
          <tr>
            <td>Pending Incentive / Bonus</td>
            <td>Approved quarterly incentive</td>
            <td class="num">₹${bonus.toLocaleString("en-IN")}</td>
          </tr>` : ""}
          <tr style="font-weight:700;background:#f8fafc;">
            <td colspan="2">Gross Settlement Amount</td>
            <td class="num">₹${grossPayable.toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td>Statutory & Notice Deductions</td>
            <td>TDS / Asset deductions</td>
            <td class="num" style="color:#ef4444;">- ₹${totalDeductions.toLocaleString("en-IN")}</td>
          </tr>
          <tr class="total-row">
            <td colspan="2">Net Payout to Employee</td>
            <td class="num">₹${netPayable.toLocaleString("en-IN")}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="net-callout">
      <div class="net-callout-label">Net Final Settlement Payout</div>
      <div class="net-callout-val">₹${netPayable.toLocaleString("en-IN")}</div>
      <div class="net-callout-words">${words}</div>
    </div>

    <p style="font-size:10px;color:#64748b;">
      By accepting this settlement, both parties acknowledge that all financial claims, dues, and liabilities stand fully discharged.
    </p>

    ${renderSignatures()}
  `;

  openPrintWindow(html, `FnF Statement - ${data.name}`);
}

/* ==========================================================================
   10. NO OBJECTION CERTIFICATE (NOC)
   ========================================================================== */
export interface NocData {
  name: string
  employeeId: string
  role: string
  department?: string
  joiningDate?: string
  purpose?: string
}

export function printNocLetter(data: NocData) {
  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
  const html = `
    ${renderHeader("No Objection Certificate (NOC)")}
    <div class="ref-ribbon">
      <span><strong>Ref:</strong> HM/NOC/${data.employeeId}</span>
      <span><strong>Date:</strong> ${date}</span>
    </div>

    <p style="font-weight:700;font-size:13px;color:#0f172a;text-align:center;margin:16px 0;">TO WHOMSOEVER IT MAY CONCERN</p>

    <p>
      This is to certify that <strong>${COMPANY.name}</strong> has no objection whatsoever to <strong>${data.name}</strong> (Employee ID: <strong>${data.employeeId}</strong>), currently employed as <strong>${data.role}</strong> with us${data.department ? ` in the <strong>${data.department}</strong> department` : ""}, ${data.purpose ? `applying for ${data.purpose}` : "pursuing higher education / passport renewal / external professional engagements"}.
    </p>

    <p>
      This certificate is issued upon the specific request of the employee and does not impose any financial liability on ${COMPANY.name}.
    </p>

    ${renderSignatures()}
  `;

  openPrintWindow(html, `NOC - ${data.name}`);
}

/* ==========================================================================
   11. CLIENT PAYMENT RECEIPT SLIP
   ========================================================================== */
export interface PaymentReceiptData {
  receiptNo: string
  clientName: string
  clientEmail?: string
  clientCompany?: string
  projectName: string
  amount: number
  paymentDate: string
  paymentMethod: string
  transactionId?: string
}

export function printPaymentReceipt(data: PaymentReceiptData) {
  const words = numberToWords(data.amount)
  const html = `
    ${renderHeader("Official Payment Receipt")}
    <div class="ref-ribbon">
      <span><strong>Receipt No:</strong> ${data.receiptNo}</span>
      <span><strong>Payment Date:</strong> ${data.paymentDate}</span>
    </div>

    <div class="recipient-block">
      <div class="recipient-title">Received With Thanks From</div>
      <div class="recipient-name">${data.clientName}</div>
      <div class="recipient-sub">
        ${data.clientCompany ? `<span>Company: ${data.clientCompany}</span> &bull; ` : ""}
        ${data.clientEmail ? `<span>Email: ${data.clientEmail}</span>` : ""}
      </div>
    </div>

    <div class="details-grid">
      <div class="dg-item"><span class="dg-label">Receipt Number:</span><span class="dg-value">${data.receiptNo}</span></div>
      <div class="dg-item"><span class="dg-label">Project / Service:</span><span class="dg-value">${data.projectName}</span></div>
      <div class="dg-item"><span class="dg-label">Payment Method:</span><span class="dg-value">${data.paymentMethod}</span></div>
      <div class="dg-item"><span class="dg-label">Transaction Reference:</span><span class="dg-value">${data.transactionId || "TXN-" + Date.now().toString().slice(-8)}</span></div>
      <div class="dg-item"><span class="dg-label">Payment Status:</span><span class="dg-value" style="color:#059669;">CONFIRMED &amp; RECEIVED</span></div>
      <div class="dg-item"><span class="dg-label">Amount Paid:</span><span class="dg-value">₹${data.amount.toLocaleString("en-IN")}</span></div>
    </div>

    <div class="net-callout">
      <div class="net-callout-label">Total Payment Confirmed</div>
      <div class="net-callout-val">₹${data.amount.toLocaleString("en-IN")}</div>
      <div class="net-callout-words">${words}</div>
    </div>

    ${renderSignatures("Finance Department", "Head of Accounts")}
  `;

  openPrintWindow(html, `Payment Receipt - ${data.receiptNo}`);
}

/* ==========================================================================
   12. COMMERCIAL TAX INVOICE
   ========================================================================== */
export interface InvoiceData {
  invoiceNo: string
  clientName: string
  clientCompany?: string
  clientGstin?: string
  clientAddress?: string
  issueDate: string
  dueDate: string
  items: { description: string; qty: number; rate: number; amount: number }[]
  taxRate?: number // e.g. 18 for 18% GST
  notes?: string
}

export function printInvoice(data: InvoiceData) {
  const subtotal = data.items.reduce((acc, item) => acc + item.amount, 0)
  const taxRate = data.taxRate ?? 18
  const taxAmount = Math.round((subtotal * taxRate) / 100)
  const grandTotal = subtotal + taxAmount
  const words = numberToWords(grandTotal)

  const html = `
    ${renderHeader("Tax Invoice")}
    <div class="ref-ribbon">
      <span><strong>Invoice No:</strong> ${data.invoiceNo}</span>
      <span><strong>Date of Issue:</strong> ${data.issueDate}</span>
      <span><strong>Due Date:</strong> ${data.dueDate}</span>
    </div>

    <div class="recipient-block">
      <div class="recipient-title">Billed To (Client Details)</div>
      <div class="recipient-name">${data.clientCompany || data.clientName}</div>
      <div class="recipient-sub">
        <span>Contact: ${data.clientName}</span>
        ${data.clientGstin ? ` &bull; <span>GSTIN: ${data.clientGstin}</span>` : ""}
        ${data.clientAddress ? `<br><span>${data.clientAddress}</span>` : ""}
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Item &amp; Scope Description</th>
            <th class="num">Qty</th>
            <th class="num">Unit Price (₹)</th>
            <th class="num">Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${data.items.map((item, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><strong>${item.description}</strong></td>
              <td class="num">${item.qty}</td>
              <td class="num">₹${item.rate.toLocaleString("en-IN")}</td>
              <td class="num">₹${item.amount.toLocaleString("en-IN")}</td>
            </tr>
          `).join("")}
          <tr style="background:#f8fafc;font-weight:700;">
            <td colspan="4" class="num">Subtotal Amount</td>
            <td class="num">₹${subtotal.toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td colspan="4" class="num">Integrated Goods &amp; Services Tax (IGST ${taxRate}%)</td>
            <td class="num">₹${taxAmount.toLocaleString("en-IN")}</td>
          </tr>
          <tr class="total-row">
            <td colspan="4" class="num">Grand Total Payable</td>
            <td class="num">₹${grandTotal.toLocaleString("en-IN")}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="net-callout">
      <div class="net-callout-label">Total Invoice Value (INR)</div>
      <div class="net-callout-val">₹${grandTotal.toLocaleString("en-IN")}</div>
      <div class="net-callout-words">${words}</div>
    </div>

    <div class="details-grid">
      <div class="dg-item"><span class="dg-label">Beneficiary:</span><span class="dg-value">${COMPANY.name}</span></div>
      <div class="dg-item"><span class="dg-label">Bank Name:</span><span class="dg-value">HDFC Bank Ltd</span></div>
      <div class="dg-item"><span class="dg-label">Current A/C No:</span><span class="dg-value">50200084920194</span></div>
      <div class="dg-item"><span class="dg-label">IFSC Code:</span><span class="dg-value">HDFC0000240</span></div>
      <div class="dg-item"><span class="dg-label">UPI ID:</span><span class="dg-value">hmorix@hdfcbank</span></div>
    </div>

    ${renderSignatures("Finance & Accounts", "Authorized Signatory")}
  `;

  openPrintWindow(html, `Tax Invoice - ${data.invoiceNo}`);
}

/* ==========================================================================
   13. TEXT FILE DOWNLOAD UTILITY (Native Blob)
   ========================================================================== */
export function downloadTextDoc(content: string, filename: string, mimeType = "text/plain") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
