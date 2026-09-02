// HMorix HRM & Enterprise Document Generator Suite
// 100% Free & Native — Zero external paid dependencies
// Compliant with Indian Corporate, Legal, and Labor Standards

export interface CompanyInfo {
  name: string
  legalName: string
  address: string
  registeredOffice: string
  email: string
  hrEmail: string
  phone: string
  website: string
  cin: string
  pan: string
  gstin: string
  tan: string
  iso: string
}

export const COMPANY: CompanyInfo = {
  name: "HMorix Technologies Pvt Ltd",
  legalName: "HMORIX TECHNOLOGIES PRIVATE LIMITED",
  address: "MG Polytechnic Road, Hathras, Uttar Pradesh – 204101, India",
  registeredOffice: "Regd Off: Plot 14, Tech Boulevard, Hathras, UP – 204101, India",
  email: "contact@hmorix.com",
  hrEmail: "hr@hmorix.com",
  phone: "+91 98765 43210",
  website: "https://hmorix.in",
  cin: "U72900UP2026PTC123456",
  pan: "AABCH1234F",
  gstin: "09AABCH1234F1Z5",
  tan: "KNP01234F",
  iso: "An ISO 9001:2015 & ISO/IEC 27001:2022 Certified Organization"
}

// Convert numbers to formal Indian Currency words
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
  if (rounded === 0) return "INR Zero Only"
  return ("INR " + inWords(rounded).trim() + " Only")
}

const DOCUMENT_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    font-size: 11.5px;
    color: #1e293b;
    background: #f1f5f9;
    padding: 0;
    line-height: 1.68;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Interactive Top Toolbar (Screen-Only) */
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
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
    border-bottom: 1px solid rgba(255,255,255,0.12);
  }
  .tb-brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .tb-logo {
    width: 32px;
    height: 32px;
    background: #c8ff00;
    color: #090d16;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 13px;
    letter-spacing: -0.5px;
  }
  .tb-title {
    font-size: 13px;
    font-weight: 800;
    color: #ffffff;
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
    border: 1px solid rgba(255,255,255,0.16);
  }
  .tb-btn-mode:hover {
    background: rgba(255,255,255,0.16);
    color: #ffffff;
  }
  .tb-btn-mode.active {
    background: #ffffff;
    color: #090d16;
    font-weight: 800;
    border-color: #ffffff;
  }
  .tb-btn-print {
    background: #c8ff00;
    color: #090d16;
    font-weight: 800;
  }
  .tb-btn-print:hover {
    background: #d4ff33;
    box-shadow: 0 0 14px rgba(200,255,0,0.45);
  }

  /* Document Sheet Container */
  .doc-sheet-wrapper {
    padding: 30px 16px;
    display: flex;
    justify-content: center;
  }
  .doc-sheet {
    width: 100%;
    max-width: 820px;
    background: #ffffff;
    padding: 48px 52px;
    border-radius: 4px;
    box-shadow: 0 4px 30px rgba(0,0,0,0.08);
    position: relative;
    border: 1px solid #e2e8f0;
  }

  /* Watermark Pattern */
  .doc-watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-35deg);
    font-size: 64px;
    font-weight: 900;
    color: rgba(15, 23, 42, 0.035);
    letter-spacing: 0.2em;
    pointer-events: none;
    user-select: none;
    text-transform: uppercase;
    white-space: nowrap;
    z-index: 1;
  }

  /* Header Section */
  .doc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 20px;
    border-bottom: 2.5px solid #0f172a;
    margin-bottom: 22px;
    position: relative;
    z-index: 2;
  }
  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .corp-logo-wrap {
    width: 52px;
    height: 52px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .corp-logo-wrap svg {
    width: 48px;
    height: 48px;
    display: block;
  }
  .corp-name {
    font-size: 18px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.02em;
    line-height: 1.2;
    text-transform: uppercase;
  }
  .corp-iso {
    font-size: 8.5px;
    color: #0284c7;
    font-weight: 700;
    margin-top: 1px;
    letter-spacing: 0.04em;
  }
  .corp-meta {
    font-size: 9.5px;
    color: #64748b;
    margin-top: 2px;
    line-height: 1.45;
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
    font-size: 8.5px;
    color: #64748b;
    margin-top: 6px;
    line-height: 1.5;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  /* Reference & Verification Ribbon */
  .ref-ribbon {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    padding: 8px 14px;
    border-radius: 6px;
    margin-bottom: 22px;
    font-size: 10.5px;
    color: #475569;
    position: relative;
    z-index: 2;
  }
  .ref-ribbon strong {
    color: #0f172a;
  }

  /* Recipient / Candidate / Client Address Block */
  .recipient-block {
    margin-bottom: 22px;
    padding: 12px 18px;
    background: #f8fafc;
    border-left: 3.5px solid #c8ff00;
    border-radius: 0 6px 6px 0;
    position: relative;
    z-index: 2;
  }
  .recipient-title {
    font-size: 9px;
    text-transform: uppercase;
    font-weight: 800;
    color: #64748b;
    letter-spacing: 0.06em;
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
    gap: 8px 20px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 14px 18px;
    margin: 18px 0;
    font-size: 11px;
    position: relative;
    z-index: 2;
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

  /* Formal Paragraphs & Headings */
  p {
    margin-bottom: 12px;
    font-size: 11.5px;
    color: #334155;
    text-align: justify;
    line-height: 1.7;
    position: relative;
    z-index: 2;
  }
  h3 {
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #0f172a;
    margin: 20px 0 8px;
    padding-bottom: 4px;
    border-bottom: 1.5px solid #e2e8f0;
    position: relative;
    z-index: 2;
  }

  /* Financial & Itemized Tables */
  .table-wrap {
    margin: 16px 0 22px;
    overflow: hidden;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    position: relative;
    z-index: 2;
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
    padding: 9px 12px;
    text-align: left;
  }
  th.num, td.num {
    text-align: right;
  }
  td {
    padding: 8px 12px;
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
    padding: 16px 20px;
    margin: 20px 0;
    text-align: center;
    position: relative;
    z-index: 2;
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

  /* Legal Clauses & Terms Container */
  .legal-clauses-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 14px 18px;
    margin: 18px 0;
    font-size: 10.5px;
    color: #475569;
    position: relative;
    z-index: 2;
  }
  .legal-clauses-box ol, .legal-clauses-box ul {
    padding-left: 18px;
  }
  .legal-clauses-box li {
    margin-bottom: 6px;
  }
  .legal-clauses-box li strong {
    color: #0f172a;
  }

  /* Signatures, Stamp & QR Verification */
  .sig-grid {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 36px;
    padding-top: 16px;
    position: relative;
    z-index: 2;
  }
  .sig-col {
    width: 230px;
  }
  .sig-bar {
    border-top: 1.5px solid #0f172a;
    width: 180px;
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

  /* Digital Verification Seal with QR block */
  .seal-qr-wrapper {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .qr-code-box {
    width: 52px;
    height: 52px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    padding: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .digital-seal-box {
    text-align: left;
    border: 1.5px dashed #10b981;
    background: #ecfdf5;
    border-radius: 8px;
    padding: 8px 14px;
    display: inline-block;
  }
  .seal-text-top {
    font-size: 8px;
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
    margin-top: 36px;
    padding-top: 14px;
    border-top: 1px solid #e2e8f0;
    font-size: 8.5px;
    color: #94a3b8;
    text-align: center;
    line-height: 1.55;
    position: relative;
    z-index: 2;
  }

  /* Candidate Acceptance Section */
  .ack-box {
    margin-top: 28px;
    padding: 14px 18px;
    border: 1px dashed #94a3b8;
    border-radius: 6px;
    background: #fdfdfd;
    position: relative;
    z-index: 2;
  }
  .ack-title {
    font-size: 11px;
    font-weight: 800;
    color: #0f172a;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .ack-sig-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-top: 24px;
  }

  /* =========================================================================
     BLACK & WHITE (B&W MONOCHROME) MODE OVERRIDES
     ========================================================================= */
  .bw-mode {
    color: #000000 !important;
  }
  .bw-mode .doc-header {
    border-bottom: 2px solid #000000 !important;
  }
  .bw-mode .corp-logo-wrap polygon,
  .bw-mode .hm-logo-crest polygon {
    fill: #ffffff !important;
    stroke: #000000 !important;
  }
  .bw-mode .corp-logo-wrap line,
  .bw-mode .corp-logo-wrap path,
  .bw-mode .hm-logo-crest line,
  .bw-mode .hm-logo-crest path {
    stroke: #000000 !important;
  }
  .bw-mode .corp-name,
  .bw-mode .recipient-name,
  .bw-mode h3,
  .bw-mode .net-callout-val,
  .bw-mode .sig-person,
  .bw-mode .ack-title {
    color: #000000 !important;
  }
  .bw-mode .corp-iso {
    color: #333333 !important;
  }
  .bw-mode .doc-type-pill {
    background: #ffffff !important;
    border: 1.5px solid #000000 !important;
    color: #000000 !important;
  }
  .bw-mode .ref-ribbon,
  .bw-mode .details-grid,
  .bw-mode .recipient-block,
  .bw-mode .legal-clauses-box,
  .bw-mode .ack-box {
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
     DIGITAL ID CARD BADGE STYLES (Front & Back)
     ========================================================================= */
  .badge-grid-container {
    display: flex;
    justify-content: center;
    gap: 28px;
    flex-wrap: wrap;
    padding: 10px 0;
    position: relative;
    z-index: 2;
  }
  .id-card-frame {
    width: 320px;
    min-height: 490px;
    background: #ffffff;
    border-radius: 16px;
    border: 2px solid #0f172a;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .id-card-top {
    background: #0f172a;
    padding: 16px;
    text-align: center;
  }
  .id-card-brand {
    font-size: 16px;
    font-weight: 900;
    color: #c8ff00;
    letter-spacing: 1.5px;
  }
  .id-card-tag {
    font-size: 8.5px;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.12em;
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
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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

  /* Print Media Query */
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
      border: none !important;
    }
    @page {
      margin: 12mm 15mm;
      size: A4 portrait;
    }
  }
`;

export const COMPANY_LOGO_MARK = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="46" height="46" fill="none" class="hm-logo-crest">
  <polygon points="24,3.06 42.14,13.53 42.14,34.47 24,44.94 5.86,34.47 5.86,13.53" fill="#0D0D0D" stroke="#C8FF00" stroke-width="1.8" stroke-linejoin="miter" stroke-miterlimit="4"/>
  <line x1="24" y1="3.06" x2="24" y2="17.7" stroke="#C8FF00" stroke-width="1.8" stroke-linecap="square"/>
  <line x1="24" y1="29.46" x2="24" y2="44.94" stroke="#C8FF00" stroke-width="1.8" stroke-linecap="square"/>
  <line x1="10.78" y1="23.72" x2="37.22" y2="23.72" stroke="#C8FF00" stroke-width="1.8" stroke-linecap="square"/>
  <path d="M 10.78 23.72 L 10.78 16.3 L 18.06 12.1 L 18.06 20.11 L 20.3 20.11 C 22.32 20.11 23.86 19.38 24 17.7" stroke="#C8FF00" stroke-width="1.8" stroke-linejoin="miter" stroke-linecap="square" fill="none"/>
  <path d="M 37.22 23.72 L 37.22 16.3 L 29.94 12.1 L 29.94 20.11 L 27.7 20.11 C 25.68 20.11 24.14 19.38 24 17.7" stroke="#C8FF00" stroke-width="1.8" stroke-linejoin="miter" stroke-linecap="square" fill="none"/>
  <path d="M 15.18 18.46 L 15.18 35.06 L 18.06 36.74 L 18.06 28.06 L 20.3 28.06 C 22.32 28.06 23.86 28.48 24 29.46" stroke="#C8FF00" stroke-width="1.8" stroke-linejoin="miter" stroke-linecap="square" fill="none"/>
  <path d="M 32.82 18.46 L 32.82 35.06 L 29.94 36.74 L 29.94 28.06 L 27.7 28.06 C 25.68 28.06 24.14 28.48 24 29.46" stroke="#C8FF00" stroke-width="1.8" stroke-linejoin="miter" stroke-linecap="square" fill="none"/>
</svg>
`;

function renderHeader(docTitle: string): string {
  return `
    <div class="doc-watermark">HMORIX OFFICIAL</div>
    <div class="doc-header">
      <div class="header-left">
        <div class="corp-logo-wrap">
          ${COMPANY_LOGO_MARK}
        </div>
        <div>
          <div class="corp-name">${COMPANY.legalName}</div>
          <div class="corp-iso">${COMPANY.iso}</div>
          <div class="corp-meta">${COMPANY.address}</div>
          <div class="corp-meta">${COMPANY.email} &bull; ${COMPANY.phone} &bull; ${COMPANY.website}</div>
        </div>
      </div>
      <div class="header-right">
        <div class="doc-type-pill">${docTitle}</div>
        <div class="doc-reg-details">
          CIN: ${COMPANY.cin}<br>
          PAN: ${COMPANY.pan} &bull; GSTIN: ${COMPANY.gstin}
        </div>
      </div>
    </div>
  `;
}

function renderSignatures(signer = "Harsh Sharma", title = "Chief Executive Officer"): string {
  const hash = `HM-SHA256:${Date.now().toString(16).toUpperCase()}-9E2A`
  return `
    <div class="sig-grid">
      <div class="sig-col">
        <div class="sig-bar"></div>
        <div class="sig-caption">For ${COMPANY.name}</div>
        <div class="sig-person">${signer}</div>
        <div class="sig-dept">${title}</div>
      </div>
      <div class="seal-qr-wrapper">
        <div class="qr-code-box">
          <svg viewBox="0 0 100 100" width="44" height="44">
            <rect width="100" height="100" fill="#ffffff" />
            <path d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M20,20 h10 v10 h-10 z" fill="#0f172a" />
            <path d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M70,20 h10 v10 h-10 z" fill="#0f172a" />
            <path d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M20,70 h10 v10 h-10 z" fill="#0f172a" />
            <rect x="50" y="20" width="5" height="15" fill="#0f172a" />
            <rect x="20" y="50" width="15" height="5" fill="#0f172a" />
            <rect x="50" y="50" width="15" height="15" fill="#0f172a" />
            <rect x="70" y="60" width="20" height="10" fill="#0f172a" />
            <rect x="60" y="80" width="15" height="10" fill="#0f172a" />
            <rect x="80" y="75" width="10" height="15" fill="#0f172a" />
          </svg>
        </div>
        <div class="digital-seal-box">
          <div class="seal-text-top">&bull; DIGITALLY SIGNED &amp; SECURE &bull;</div>
          <div class="seal-text-mid">${COMPANY.legalName}</div>
          <div class="seal-text-bot">Ref: ${hash} &bull; CIN: ${COMPANY.cin}</div>
        </div>
      </div>
    </div>
  `;
}

function renderFooter(): string {
  return `
    <div class="doc-footer">
      ${COMPANY.registeredOffice}<br>
      Confidential &amp; Proprietary &bull; Document Verification Desk: ${COMPANY.hrEmail} &bull; ${COMPANY.website}
    </div>
  `;
}

export function openPrintWindow(htmlContent: string, windowTitle: string) {
  const printWindow = window.open("", "_blank", "width=920,height=960");
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
        <title>${windowTitle} - ${COMPANY.name}</title>
        <style>${DOCUMENT_STYLES}</style>
      </head>
      <body>
        <div class="print-toolbar">
          <div class="tb-brand">
            <div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;">
              ${COMPANY_LOGO_MARK}
            </div>
            <div>
              <div class="tb-title">${windowTitle}</div>
              <div class="tb-sub">${COMPANY.legalName} &bull; Document Verification Studio</div>
            </div>
          </div>
          <div class="tb-actions">
            <button class="tb-btn tb-btn-mode active" id="btn-colour" onclick="setDocMode('colour')">
              🎨 Full Colour Mode
            </button>
            <button class="tb-btn tb-btn-mode" id="btn-bw" onclick="setDocMode('bw')">
              ⬛ Black &amp; White (B&amp;W Laser)
            </button>
            <button class="tb-btn tb-btn-print" onclick="window.print()">
              🖨️ Print / Save as PDF
            </button>
          </div>
        </div>

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
   1. FORMAL JOB OFFER LETTER
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
  const ref = `HMT/HRD/OL/2026/${Date.now().toString().slice(-4)}`
  const words = numberToWords(data.ctc)

  const html = `
    ${renderHeader("Offer of Employment")}
    <div class="ref-ribbon">
      <span><strong>Ref No:</strong> ${ref}</span>
      <span><strong>Issue Date:</strong> ${date}</span>
      <span><strong>Place of Issue:</strong> Hathras, Uttar Pradesh, India</span>
    </div>

    <div class="recipient-block">
      <div class="recipient-title">Offer Extended To</div>
      <div class="recipient-name">${data.name}</div>
      <div class="recipient-sub">
        ${data.email ? `<span>Email: ${data.email}</span> &bull; ` : ""}
        ${data.phone ? `<span>Contact: ${data.phone}</span> &bull; ` : ""}
        <span>Location: ${data.location}</span>
      </div>
    </div>

    <p>Dear <strong>${data.name}</strong>,</p>
    <p>
      On behalf of the Board of Directors and Management of <strong>${COMPANY.legalName}</strong>,
      we are pleased to offer you the position of <strong>${data.role}</strong> in the <strong>${data.department}</strong> department.
      Based on your qualifications, technical evaluations, and professional credentials, we believe you possess the skills and leadership to drive our engineering mission forward.
    </p>

    <div class="details-grid">
      <div class="dg-item"><span class="dg-label">1. Designation:</span><span class="dg-value">${data.role}</span></div>
      <div class="dg-item"><span class="dg-label">2. Functional Unit:</span><span class="dg-value">${data.department}</span></div>
      <div class="dg-item"><span class="dg-label">3. Base Work Location:</span><span class="dg-value">${data.location}</span></div>
      <div class="dg-item"><span class="dg-label">4. Effective Joining Date:</span><span class="dg-value">${data.joiningDate}</span></div>
      <div class="dg-item"><span class="dg-label">5. Reporting Manager:</span><span class="dg-value">${data.reportingTo || "Department Engineering Lead"}</span></div>
      <div class="dg-item"><span class="dg-label">6. Total Annual Remuneration (CTC):</span><span class="dg-value">₹${data.ctc.toLocaleString("en-IN")}</span></div>
    </div>

    <h3>Annexure A: Compensation &amp; Benefits Ledger</h3>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Salary Component</th>
            <th class="num">Monthly (₹)</th>
            <th class="num">Annual (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Basic Salary (40% of CTC)</td>
            <td class="num">₹${Math.round(m * 0.4).toLocaleString("en-IN")}</td>
            <td class="num">₹${Math.round(data.ctc * 0.4).toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td>House Rent Allowance - HRA (20% of CTC)</td>
            <td class="num">₹${Math.round(m * 0.2).toLocaleString("en-IN")}</td>
            <td class="num">₹${Math.round(data.ctc * 0.2).toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td>Special Allowance (30% of CTC)</td>
            <td class="num">₹${Math.round(m * 0.3).toLocaleString("en-IN")}</td>
            <td class="num">₹${Math.round(data.ctc * 0.3).toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td>Statutory &amp; Flexi Benefits (10% of CTC)</td>
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
      <div class="net-callout-label">Total Cost to Company (Gross CTC)</div>
      <div class="net-callout-val">₹${data.ctc.toLocaleString("en-IN")} PA</div>
      <div class="net-callout-words">${words}</div>
    </div>

    <div class="legal-clauses-box">
      <h3>Key Terms &amp; Conditions of Offer</h3>
      <ol>
        <li><strong>Probation Period:</strong> You will be on probation for a period of ninety (90) calendar days from the date of joining. Confirmation will be subject to satisfactory performance appraisals by the management.</li>
        <li><strong>Notice Period &amp; Separation:</strong> During probation, either party may terminate the employment by serving thirty (30) days notice or salary in lieu thereof. Post confirmation, the notice period shall be sixty (60) days.</li>
        <li><strong>Intellectual Property &amp; NDA:</strong> All software, patents, algorithms, trade secrets, workflows, and documentation created during your employment are the sole and exclusive intellectual property of ${COMPANY.name}.</li>
        <li><strong>Background Verification:</strong> This offer is conditional upon satisfactory verification of your educational qualifications, previous employment references, background checks, and identity proof.</li>
        <li><strong>Validity:</strong> This offer stands valid for acceptance within seven (7) business days from the date of issuance.</li>
      </ol>
    </div>

    <p>Please endorse your acceptance by signing the confirmation declaration below.</p>

    ${renderSignatures()}

    <div class="ack-box">
      <div class="ack-title">Candidate Acceptance Declaration</div>
      <p style="font-size:10px;margin-bottom:0;">
        I, <strong>${data.name}</strong>, hereby accept the offer of employment on the terms and conditions outlined above. I confirm my date of joining as <strong>${data.joiningDate}</strong>.
      </p>
      <div class="ack-sig-row">
        <div>
          <div class="sig-bar" style="width:140px;"></div>
          <div class="sig-caption">Signature of Candidate</div>
          <div class="sig-person" style="font-size:11px;">${data.name}</div>
        </div>
        <div style="text-align:right;">
          <div class="sig-bar" style="width:100px;margin-left:auto;"></div>
          <div class="sig-caption">Date &amp; Place</div>
        </div>
      </div>
    </div>
  `;

  openPrintWindow(html, `Offer Letter - ${data.name}`);
}

/* ==========================================================================
   2. FORMAL JOINING LETTER
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
  const ref = `HMT/HRD/JL/2026/${data.employeeId}`

  const html = `
    ${renderHeader("Joining Confirmation Letter")}
    <div class="ref-ribbon">
      <span><strong>Ref No:</strong> ${ref}</span>
      <span><strong>Issue Date:</strong> ${date}</span>
      <span><strong>Status:</strong> Active Onboarding</span>
    </div>

    <div class="recipient-block">
      <div class="recipient-title">Employee Identification</div>
      <div class="recipient-name">${data.name}</div>
      <div class="recipient-sub">
        <span>Employee Code: <strong>${data.employeeId}</strong></span> &bull; 
        <span>Department: <strong>${data.department}</strong></span>
      </div>
    </div>

    <p>Dear <strong>${data.name}</strong>,</p>
    <p>
      We are delighted to confirm that you have formally reported for duty and joined the workforce of <strong>${COMPANY.legalName}</strong>
      as <strong>${data.role}</strong> with effect from <strong>${data.joiningDate}</strong>.
    </p>

    <div class="details-grid">
      <div class="dg-item"><span class="dg-label">Employee ID:</span><span class="dg-value">${data.employeeId}</span></div>
      <div class="dg-item"><span class="dg-label">Designation:</span><span class="dg-value">${data.role}</span></div>
      <div class="dg-item"><span class="dg-label">Department:</span><span class="dg-value">${data.department}</span></div>
      <div class="dg-item"><span class="dg-label">Date of Joining:</span><span class="dg-value">${data.joiningDate}</span></div>
      <div class="dg-item"><span class="dg-label">Work Location:</span><span class="dg-value">${data.location}</span></div>
      <div class="dg-item"><span class="dg-label">Official Work Email:</span><span class="dg-value">${data.workEmail || "Allocated Post Induction"}</span></div>
    </div>

    <div class="legal-clauses-box">
      <h3>Corporate Policies &amp; Operational Directives</h3>
      <ul>
        <li><strong>Working Schedule:</strong> Official core business hours are Monday through Friday, 9:30 AM to 6:30 PM IST. Saturdays and Sundays are designated weekly off days.</li>
        <li><strong>Annual Leave Balance:</strong> You are entitled to 12 Casual Leaves (CL), 10 Medical/Sick Leaves (SL), and 18 Earned Leaves (EL) per calendar annum, computed on a pro-rata basis.</li>
        <li><strong>Asset Responsibility:</strong> All hardware, access cards, and credentials assigned to you remain the property of the company and must be handled with due care.</li>
        <li><strong>Compliance &amp; Governance:</strong> You are bound by the company Information Security Policy, Code of Ethical Business Conduct, and POSH guidelines.</li>
      </ul>
    </div>

    <p>We extend our warmest welcome to the HMorix family and look forward to your impactful contributions.</p>

    ${renderSignatures()}
  `;

  openPrintWindow(html, `Joining Letter - ${data.name}`);
}

/* ==========================================================================
   3. FORMAL APPOINTMENT LETTER
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
  const ref = `HMT/HRD/APL/2026/${data.employeeId}`

  const html = `
    ${renderHeader("Contract of Employment &amp; Appointment")}
    <div class="ref-ribbon">
      <span><strong>Ref No:</strong> ${ref}</span>
      <span><strong>Date of Execution:</strong> ${date}</span>
      <span><strong>Jurisdiction:</strong> Hathras / Allahabad, UP</span>
    </div>

    <div class="recipient-block">
      <div class="recipient-title">Appointee Details</div>
      <div class="recipient-name">${data.name}</div>
      <div class="recipient-sub">Employee ID: <strong>${data.employeeId}</strong> &bull; Designation: <strong>${data.role}</strong></div>
    </div>

    <p>Dear <strong>${data.name}</strong>,</p>
    <p>
      In pursuance of your application and subsequent acceptance of our offer, the Management of <strong>${COMPANY.legalName}</strong>
      is pleased to appoint you as <strong>${data.role}</strong> in our <strong>${data.department}</strong> department, effective <strong>${data.joiningDate}</strong>,
      on the terms and statutory covenants detailed herein.
    </p>

    <div class="details-grid">
      <div class="dg-item"><span class="dg-label">Employee Code:</span><span class="dg-value">${data.employeeId}</span></div>
      <div class="dg-item"><span class="dg-label">Designation:</span><span class="dg-value">${data.role}</span></div>
      <div class="dg-item"><span class="dg-label">Department:</span><span class="dg-value">${data.department}</span></div>
      <div class="dg-item"><span class="dg-label">Annual Cost to Company:</span><span class="dg-value">₹${data.ctc.toLocaleString("en-IN")}</span></div>
      <div class="dg-item"><span class="dg-label">Monthly Gross Remuneration:</span><span class="dg-value">₹${m.toLocaleString("en-IN")}</span></div>
      <div class="dg-item"><span class="dg-label">Place of Posting:</span><span class="dg-value">${data.location}</span></div>
    </div>

    <div class="net-callout">
      <div class="net-callout-label">Agreed Annual Gross Remuneration</div>
      <div class="net-callout-val">₹${data.ctc.toLocaleString("en-IN")} PA</div>
      <div class="net-callout-words">${words}</div>
    </div>

    <div class="legal-clauses-box">
      <h3>Statutory Terms &amp; Employment Covenants</h3>
      <ol>
        <li><strong>Duties &amp; Posting:</strong> You will perform all engineering, architectural, and operational tasks assigned by management. The company reserves the right to transfer or depute you to any office or client location across India.</li>
        <li><strong>Tax &amp; Statutory Withholding:</strong> All salary components are subject to statutory deductions including Provident Fund (EPF), Professional Tax (PT), and Income Tax (TDS Section 192).</li>
        <li><strong>Non-Compete &amp; Non-Solicitation:</strong> For a period of twelve (12) months following the cessation of your employment, you agree not to directly or indirectly solicit any clients, vendors, or employees of ${COMPANY.name}.</li>
        <li><strong>Governing Law &amp; Dispute Resolution:</strong> This contract is governed by the laws of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts in Uttar Pradesh.</li>
      </ol>
    </div>

    ${renderSignatures()}
  `;

  openPrintWindow(html, `Appointment Letter - ${data.name}`);
}

/* ==========================================================================
   4. SALARY & EMPLOYMENT CERTIFICATE
   ========================================================================== */
export interface SalaryCertData {
  name: string
  employeeId: string
  role: string
  department: string
  joiningDate: string
  monthlyGross?: number
  annualCtc?: number
  purpose?: string
}

export function printSalaryCertificate(data: SalaryCertData) {
  const date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })
  const gross = data.monthlyGross || Math.round((data.annualCtc || 600000) / 12)
  const ctc = data.annualCtc || (gross * 12)
  const mWords = numberToWords(gross)
  const aWords = numberToWords(ctc)
  const ref = `HMT/FIN/SC/2026/${data.employeeId}`

  const html = `
    ${renderHeader("Salary &amp; Employment Certificate")}
    <div class="ref-ribbon">
      <span><strong>Ref No:</strong> ${ref}</span>
      <span><strong>Date of Issue:</strong> ${date}</span>
      <span><strong>Verification:</strong> ${COMPANY.hrEmail}</span>
    </div>

    <p style="font-weight:800;font-size:13px;color:#0f172a;text-align:center;letter-spacing:0.05em;margin:18px 0;">TO WHOMSOEVER IT MAY CONCERN</p>

    <p>
      This is to certify that <strong>${data.name}</strong> (Employee ID: <strong>${data.employeeId}</strong>)
      is a bonafide, confirmed full-time employee of <strong>${COMPANY.legalName}</strong>,
      currently serving as <strong>${data.role}</strong> in the <strong>${data.department}</strong> department,
      having joined our services on <strong>${data.joiningDate}</strong>.
    </p>

    <div class="details-grid">
      <div class="dg-item"><span class="dg-label">Employee Full Name:</span><span class="dg-value">${data.name}</span></div>
      <div class="dg-item"><span class="dg-label">Employee Code:</span><span class="dg-value">${data.employeeId}</span></div>
      <div class="dg-item"><span class="dg-label">Designation:</span><span class="dg-value">${data.role}</span></div>
      <div class="dg-item"><span class="dg-label">Department:</span><span class="dg-value">${data.department}</span></div>
      <div class="dg-item"><span class="dg-label">Date of Commencement:</span><span class="dg-value">${data.joiningDate}</span></div>
      <div class="dg-item"><span class="dg-label">Employment Status:</span><span class="dg-value" style="color:#059669;">Active &amp; Confirmed</span></div>
      <div class="dg-item"><span class="dg-label">Monthly Gross Earnings:</span><span class="dg-value">₹${gross.toLocaleString("en-IN")}</span></div>
      <div class="dg-item"><span class="dg-label">Annual Cost to Company:</span><span class="dg-value">₹${ctc.toLocaleString("en-IN")}</span></div>
    </div>

    <div class="net-callout">
      <div class="net-callout-label">Certified Monthly Gross Compensation</div>
      <div class="net-callout-val">₹${gross.toLocaleString("en-IN")} / Month</div>
      <div class="net-callout-words">${mWords} (Annual CTC: ₹${ctc.toLocaleString("en-IN")} &bull; ${aWords})</div>
    </div>

    <p>
      This certificate is issued at the specific request of the employee ${data.purpose ? `for the purpose of <strong>${data.purpose}</strong>` : "for official verification, bank loan sanction, and financial documentation"}
      without any financial liability or commitment on part of ${COMPANY.name}.
    </p>

    ${renderSignatures("Authorized HR Signatory", "Head of Talent & Governance")}
  `;

  openPrintWindow(html, `Salary Certificate - ${data.name}`);
}

/* ==========================================================================
   5. MONTHLY PAYSLIP / PAY ADVICE
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
    ${renderHeader(`Salary Pay Advice - ${periodDisplay}`)}
    <div class="ref-ribbon">
      <span><strong>Pay Period:</strong> ${periodDisplay}</span>
      <span><strong>Disbursement Date:</strong> 28 ${periodDisplay}</span>
      <span><strong>Mode:</strong> Bank Direct Transfer (NEFT/RTGS)</span>
    </div>

    <div class="details-grid">
      <div class="dg-item"><span class="dg-label">Employee Name:</span><span class="dg-value">${data.name}</span></div>
      <div class="dg-item"><span class="dg-label">Employee ID:</span><span class="dg-value">${data.employeeId}</span></div>
      <div class="dg-item"><span class="dg-label">Designation:</span><span class="dg-value">${data.role}</span></div>
      <div class="dg-item"><span class="dg-label">Department:</span><span class="dg-value">${data.department}</span></div>
      <div class="dg-item"><span class="dg-label">Bank Name:</span><span class="dg-value">${data.bankName || "HDFC Bank Ltd"}</span></div>
      <div class="dg-item"><span class="dg-label">Bank Account No:</span><span class="dg-value">${data.accountNo || "XXXX-XXXX-8921"}</span></div>
      <div class="dg-item"><span class="dg-label">PAN Card:</span><span class="dg-value">${data.pan || "XXXXX1234X"}</span></div>
      <div class="dg-item"><span class="dg-label">Payable Days:</span><span class="dg-value">${data.workedDays || "30 / 30 Days (LOP: 0)"}</span></div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <!-- Earnings Column -->
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
              <td>Performance Incentive / Bonus</td>
              <td class="num">₹${data.bonus.toLocaleString("en-IN")}</td>
            </tr>` : ""}
            <tr class="total-row">
              <td>Total Gross Earnings</td>
              <td class="num">₹${gross.toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Deductions Column -->
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Statutory Deductions</th>
              <th class="num">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Provident Fund (EPF 12%)</td>
              <td class="num">₹${pf.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td>Professional Tax (PT)</td>
              <td class="num">₹${pt.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td>Tax Deducted at Source (TDS)</td>
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
      <div class="net-callout-label">Net Salary Disbursed into Bank Account</div>
      <div class="net-callout-val">₹${netPay.toLocaleString("en-IN")}</div>
      <div class="net-callout-words">${words}</div>
    </div>

    <p style="font-size:8.5px;color:#64748b;text-align:center;margin-top:12px;line-height:1.5;">
      This is a system-generated pay advice issued in compliance with the Payment of Wages Act, 1936 and Income Tax Rules, 1962. No physical signature is required. For salary queries, contact payroll@hmorix.com.
    </p>

    ${renderSignatures("Finance & Payroll Controller", "Chief Financial Officer")}
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
    ${renderHeader("Corporate ID Credential")}
    <p style="text-align:center;color:#64748b;font-size:11px;margin-bottom:20px;">
      Official Identity Badge &bull; Standard ISO 7810 ID-1 Specification &bull; Front &amp; Back Print Alignment
    </p>

    <div class="badge-grid-container">
      <!-- ID BADGE FRONT -->
      <div class="id-card-frame">
        <div class="id-card-top">
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:2px;">
            ${COMPANY_LOGO_MARK}
            <div class="id-card-brand">HMORIX</div>
          </div>
          <div class="id-card-tag">Identity Credential &bull; Front</div>
        </div>

        <div class="id-card-body">
          <div class="id-avatar-circle">${initials}</div>
          <div class="id-card-name">${data.name}</div>
          <div class="id-card-role">${data.role}</div>
          <div class="id-card-dept">${data.department}</div>

          <div class="id-fields-table">
            <div class="id-row"><span class="id-lbl">Emp Code:</span><span class="id-val">${data.employeeId}</span></div>
            <div class="id-row"><span class="id-lbl">Blood Group:</span><span class="id-val">${data.bloodGroup || "O+"}</span></div>
            <div class="id-row"><span class="id-lbl">Valid From:</span><span class="id-val">${data.joiningDate}</span></div>
          </div>

          <div class="id-card-barcode">| |||| | ||||| ||| ||||</div>
        </div>

        <div class="id-card-bot">
          ${COMPANY.legalName} &bull; Hathras, UP
        </div>
      </div>

      <!-- ID BADGE BACK -->
      <div class="id-card-frame">
        <div class="id-card-top">
          <div class="id-card-brand">SECURITY &amp; EMERGENCY</div>
          <div class="id-card-tag">Return &amp; Safety Instructions</div>
        </div>

        <div class="id-card-body" style="font-size:9.5px;color:#475569;text-align:left;">
          <div style="background:#0f172a;height:24px;border-radius:4px;margin-bottom:12px;"></div>
          
          <p style="font-size:9px;line-height:1.4;margin-bottom:8px;">
            1. This card is the property of ${COMPANY.name} and must be surrendered upon separation.
          </p>
          <p style="font-size:9px;line-height:1.4;margin-bottom:8px;">
            2. The holder must display this badge visibly while on corporate premises and client facilities.
          </p>

          <div class="id-fields-table" style="margin-top:10px;">
            <div class="id-row"><span class="id-lbl">Emergency SOS:</span><span class="id-val">${data.emergencyPhone || COMPANY.phone}</span></div>
            <div class="id-row"><span class="id-lbl">Corporate HR:</span><span class="id-val">${COMPANY.hrEmail}</span></div>
            <div class="id-row"><span class="id-lbl">Return Location:</span><span class="id-val">${COMPANY.address}</span></div>
          </div>
        </div>

        <div class="id-card-bot">
          If found, please post to the return location or contact hr@hmorix.com
        </div>
      </div>
    </div>
  `;

  openPrintWindow(html, `Employee ID Badge - ${data.name}`);
}

/* ==========================================================================
   7. FORMAL EXPERIENCE & SERVICE CERTIFICATE
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
  const ref = `HMT/HRD/EXP/2026/${data.employeeId}`

  const html = `
    ${renderHeader("Experience &amp; Service Certificate")}
    <div class="ref-ribbon">
      <span><strong>Ref No:</strong> ${ref}</span>
      <span><strong>Date of Issue:</strong> ${date}</span>
      <span><strong>Verification:</strong> ${COMPANY.hrEmail}</span>
    </div>

    <p style="font-weight:800;font-size:13px;color:#0f172a;text-align:center;letter-spacing:0.05em;margin:18px 0;">TO WHOMSOEVER IT MAY CONCERN</p>

    <p>
      This is to certify that <strong>${data.name}</strong> (Employee ID: <strong>${data.employeeId}</strong>)
      was employed with <strong>${COMPANY.legalName}</strong> from <strong>${data.joiningDate}</strong> to <strong>${data.relievingDate}</strong>.
      During their tenure with us, they served with distinction as <strong>${data.role}</strong> in the <strong>${data.department}</strong> department.
    </p>

    <div class="details-grid">
      <div class="dg-item"><span class="dg-label">Employee Name:</span><span class="dg-value">${data.name}</span></div>
      <div class="dg-item"><span class="dg-label">Employee Code:</span><span class="dg-value">${data.employeeId}</span></div>
      <div class="dg-item"><span class="dg-label">Final Designation:</span><span class="dg-value">${data.role}</span></div>
      <div class="dg-item"><span class="dg-label">Functional Unit:</span><span class="dg-value">${data.department}</span></div>
      <div class="dg-item"><span class="dg-label">Tenure Commencement:</span><span class="dg-value">${data.joiningDate}</span></div>
      <div class="dg-item"><span class="dg-label">Last Working Date:</span><span class="dg-value">${data.relievingDate}</span></div>
    </div>

    <p>
      ${data.performance || `During their tenure with HMorix, ${data.name} demonstrated exemplary technical expertise, professional integrity, and diligence in engineering execution. Their conduct was consistently outstanding, and they maintained excellent working relationships with peers and leadership.`}
    </p>

    <p>We thank ${data.name} for their dedicated service and wish them continued success in all their future professional pursuits.</p>

    ${renderSignatures("Authorized HR Signatory", "Head of Human Resources")}
  `;

  openPrintWindow(html, `Experience Certificate - ${data.name}`);
}

/* ==========================================================================
   8. FORMAL RELIEVING LETTER
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
  const ref = `HMT/HRD/RL/2026/${data.employeeId}`

  const html = `
    ${renderHeader("Official Relieving Letter")}
    <div class="ref-ribbon">
      <span><strong>Ref No:</strong> ${ref}</span>
      <span><strong>Issue Date:</strong> ${date}</span>
      <span><strong>Clearance Status:</strong> Full Exit Approved</span>
    </div>

    <div class="recipient-block">
      <div class="recipient-title">Relieving Notice For</div>
      <div class="recipient-name">${data.name}</div>
      <div class="recipient-sub">Employee ID: <strong>${data.employeeId}</strong> &bull; ${data.role}</div>
    </div>

    <p>Dear <strong>${data.name}</strong>,</p>
    <p>
      With reference to your formal resignation letter, we hereby confirm that you have been relieved from all your professional duties and responsibilities as <strong>${data.role}</strong> at <strong>${COMPANY.legalName}</strong> effective from the close of business hours on <strong>${data.relievingDate}</strong>.
    </p>

    <div class="details-grid">
      <div class="dg-item"><span class="dg-label">Employee ID:</span><span class="dg-value">${data.employeeId}</span></div>
      <div class="dg-item"><span class="dg-label">Designation:</span><span class="dg-value">${data.role}</span></div>
      <div class="dg-item"><span class="dg-label">Department:</span><span class="dg-value">${data.department}</span></div>
      <div class="dg-item"><span class="dg-label">Commencement Date:</span><span class="dg-value">${data.joiningDate}</span></div>
      <div class="dg-item"><span class="dg-label">Relieving Date:</span><span class="dg-value">${data.relievingDate}</span></div>
      <div class="dg-item"><span class="dg-label">Asset Handover:</span><span class="dg-value" style="color:#059669;">Verified &amp; Surrendered</span></div>
    </div>

    <p>
      You have successfully completed all handover protocols, surrendered all company property including digital hardware, ID badges, and software access credentials, and finalized all financial reconciliations.
    </p>

    <p>We appreciate your valuable contributions during your tenure with us and wish you the very best in your future career endeavors.</p>

    ${renderSignatures("Authorized HR Signatory", "Head of People Operations")}
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
  const ref = `HMT/FIN/FNF/2026/${data.employeeId}`

  const html = `
    ${renderHeader("Full &amp; Final Settlement Statement")}
    <div class="ref-ribbon">
      <span><strong>Ref No:</strong> ${ref}</span>
      <span><strong>Settlement Date:</strong> ${date}</span>
      <span><strong>Discharge Status:</strong> Final Dues Reconciled</span>
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
            <th>Computation Basis</th>
            <th class="num">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Final Month Salary Payable</td>
            <td>${unpaidDays} Working Days @ ₹${perDay}/day</td>
            <td class="num">₹${salaryPay.toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td>Accumulated Leave Encashment</td>
            <td>${leaveDays} Accumulated Earned Leaves</td>
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
            <td>Quarterly Incentive / Bonus</td>
            <td>Approved KPI Incentive</td>
            <td class="num">₹${bonus.toLocaleString("en-IN")}</td>
          </tr>` : ""}
          <tr style="font-weight:700;background:#f8fafc;">
            <td colspan="2">Total Gross Settlement Dues</td>
            <td class="num">₹${grossPayable.toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td>Statutory Deductions &amp; Notice Adjustments</td>
            <td>TDS / Asset Clearance Recovery</td>
            <td class="num" style="color:#ef4444;">- ₹${totalDeductions.toLocaleString("en-IN")}</td>
          </tr>
          <tr class="total-row">
            <td colspan="2">Net Final Disbursement to Employee</td>
            <td class="num">₹${netPayable.toLocaleString("en-IN")}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="net-callout">
      <div class="net-callout-label">Net Final Settlement Disbursement</div>
      <div class="net-callout-val">₹${netPayable.toLocaleString("en-IN")}</div>
      <div class="net-callout-words">${words}</div>
    </div>

    <p style="font-size:9.5px;color:#64748b;line-height:1.5;">
      <strong>Mutual Discharge &amp; No Dues Declaration:</strong> Upon receipt of the settlement amount, the employee and the company agree that all statutory, financial, and contractual obligations stand fully discharged with no surviving claims.
    </p>

    ${renderSignatures("Finance &amp; Accounts", "Chief Financial Officer")}
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
  const ref = `HMT/HRD/NOC/2026/${data.employeeId}`

  const html = `
    ${renderHeader("No Objection Certificate (NOC)")}
    <div class="ref-ribbon">
      <span><strong>Ref No:</strong> ${ref}</span>
      <span><strong>Date of Issue:</strong> ${date}</span>
      <span><strong>Verification Desk:</strong> ${COMPANY.hrEmail}</span>
    </div>

    <p style="font-weight:800;font-size:13px;color:#0f172a;text-align:center;letter-spacing:0.05em;margin:18px 0;">TO WHOMSOEVER IT MAY CONCERN</p>

    <p>
      This is to certify that <strong>${COMPANY.legalName}</strong> has no objection whatsoever to <strong>${data.name}</strong> (Employee ID: <strong>${data.employeeId}</strong>), currently employed as <strong>${data.role}</strong> with us${data.department ? ` in the <strong>${data.department}</strong> department` : ""}, ${data.purpose ? `applying for <strong>${data.purpose}</strong>` : "pursuing higher education / passport renewal / external professional engagements"}.
    </p>

    <p>
      This certificate is issued upon the specific request of the employee and does not impose any financial or legal liability on ${COMPANY.name}.
    </p>

    ${renderSignatures("Authorized HR Signatory", "Head of Human Resources")}
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
      <span><strong>Status:</strong> Cleared &amp; Confirmed</span>
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
      <div class="dg-item"><span class="dg-label">Project / Service Scope:</span><span class="dg-value">${data.projectName}</span></div>
      <div class="dg-item"><span class="dg-label">Payment Channel:</span><span class="dg-value">${data.paymentMethod}</span></div>
      <div class="dg-item"><span class="dg-label">Transaction Reference:</span><span class="dg-value">${data.transactionId || "TXN-" + Date.now().toString().slice(-8)}</span></div>
      <div class="dg-item"><span class="dg-label">Payment Status:</span><span class="dg-value" style="color:#059669;">CONFIRMED &amp; SETTLED</span></div>
      <div class="dg-item"><span class="dg-label">Total Amount Paid:</span><span class="dg-value">₹${data.amount.toLocaleString("en-IN")}</span></div>
    </div>

    <div class="net-callout">
      <div class="net-callout-label">Total Payment Value Received</div>
      <div class="net-callout-val">₹${data.amount.toLocaleString("en-IN")}</div>
      <div class="net-callout-words">${words}</div>
    </div>

    ${renderSignatures("Finance Department", "Head of Accounts &amp; Treasury")}
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
            <th>Deliverable / Service Description</th>
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
            <td colspan="4" class="num">Subtotal Taxable Amount</td>
            <td class="num">₹${subtotal.toLocaleString("en-IN")}</td>
          </tr>
          <tr>
            <td colspan="4" class="num">Integrated Goods &amp; Services Tax (IGST ${taxRate}%)</td>
            <td class="num">₹${taxAmount.toLocaleString("en-IN")}</td>
          </tr>
          <tr class="total-row">
            <td colspan="4" class="num">Grand Total Amount Payable</td>
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
      <div class="dg-item"><span class="dg-label">Beneficiary:</span><span class="dg-value">${COMPANY.legalName}</span></div>
      <div class="dg-item"><span class="dg-label">Bank Name:</span><span class="dg-value">HDFC Bank Ltd</span></div>
      <div class="dg-item"><span class="dg-label">Current A/C No:</span><span class="dg-value">50200084920194</span></div>
      <div class="dg-item"><span class="dg-label">IFSC Code:</span><span class="dg-value">HDFC0000240</span></div>
      <div class="dg-item"><span class="dg-label">UPI ID:</span><span class="dg-value">hmorix@hdfcbank</span></div>
    </div>

    ${renderSignatures("Finance &amp; Accounts", "Authorized Financial Signatory")}
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

/* ==========================================================================
   14. INTERNSHIP DOCUMENTS
   ========================================================================== */

export interface InternshipOfferData {
  name: string
  email?: string
  phone?: string
  college?: string
  course?: string
  year?: string
  role: string
  department: string
  startDate: string
  endDate: string
  stipend: number
  location: string
  reportingTo?: string
  internId: string
  mode?: string
}

export function printInternshipOfferLetter(data: InternshipOfferData) {
  const html = `
    ${renderHeader('Internship Offer Letter')}
    
    <div class="ref-ribbon">
      <strong>Ref:</strong> HMT/HR/INT/${new Date(data.startDate).getFullYear()}/${Date.now().toString().slice(-4)}
      <span style="float: right;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</span>
    </div>

    <div class="recipient-block">
      <strong>To,</strong><br>
      ${data.name}<br>
      ${data.college ? \`\${data.college}<br>\` : ''}
      ${data.course ? \`Course: \${data.course}<br>\` : ''}
      ${data.email ? \`Email: \${data.email}\` : ''}
    </div>

    <div class="highlight-box">
      <strong>Subject:</strong> Offer of Internship at HMORIX TECHNOLOGIES
    </div>

    <p>Dear <strong>${data.name}</strong>,</p>
    <p>Following our recent discussions and evaluation process, we are pleased to offer you an internship position at HMORIX TECHNOLOGIES. Your skills and academic background make you a strong addition to our team.</p>

    <div class="details-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: rgba(0,0,0,0.02); padding: 15px; border: 1px solid #ddd; margin-bottom: 20px;">
      <div><strong>Intern ID:</strong> ${data.internId}</div>
      <div><strong>Role/Designation:</strong> ${data.role}</div>
      <div><strong>Department:</strong> ${data.department}</div>
      <div><strong>Duration:</strong> ${new Date(data.startDate).toLocaleDateString('en-GB')} to ${new Date(data.endDate).toLocaleDateString('en-GB')}</div>
      <div><strong>Mode:</strong> ${data.mode || 'On-site'}</div>
      <div><strong>Location:</strong> ${data.location}</div>
      <div><strong>Reporting Manager:</strong> ${data.reportingTo || 'Department Head'}</div>
      <div><strong>Monthly Stipend:</strong> ₹${data.stipend}</div>
    </div>

    <h4>Stipend & Compensation</h4>
    <table class="data-table">
      <thead>
        <tr>
          <th>Component</th>
          <th style="text-align: right;">Amount per Month</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Monthly Stipend</td>
          <td style="text-align: right;">₹${data.stipend}</td>
        </tr>
        <tr>
          <td>Performance Bonus (target based)</td>
          <td style="text-align: right;">₹${Math.round(data.stipend * 0.1)}</td>
        </tr>
        <tr style="font-weight: bold; background: #f9f9f9;">
          <td>Total Maximum Potential</td>
          <td style="text-align: right;">₹${data.stipend + Math.round(data.stipend * 0.1)}</td>
        </tr>
      </tbody>
    </table>

    <h4>Terms & Conditions</h4>
    <ol>
      <li><strong>Nature of Engagement:</strong> This is a temporary internship and does not constitute permanent employment.</li>
      <li><strong>Confidentiality:</strong> You will have access to sensitive company information. You are required to maintain strict confidentiality and sign a Non-Disclosure Agreement (NDA).</li>
      <li><strong>Intellectual Property:</strong> Any intellectual property created during the internship will be the sole property of HMORIX TECHNOLOGIES.</li>
      <li><strong>Notice Period:</strong> Either party may terminate this internship with a 7-day notice period.</li>
      <li><strong>Completion Certificate:</strong> A certificate will be issued only upon successful completion of the entire tenure and clearance of all assignments.</li>
      <li><strong>Code of Conduct:</strong> You are expected to adhere to all professional and ethical standards of the company.</li>
    </ol>

    <p>Please review these terms and sign the duplicate copy of this letter as a token of your acceptance.</p>

    ${renderSignatures('Human Resources', 'Authorized Signatory')}
    
    <div style="border-top: 2px dashed #999; margin: 40px 0; padding-top: 20px;">
      <h4>Candidate Acceptance Declaration</h4>
      <p>I, <strong>${data.name}</strong>, acknowledge that I have read, understood, and accept the terms and conditions outlined in this internship offer letter.</p>
      <div style="margin-top: 40px; display: flex; justify-content: space-between;">
        <div style="border-top: 1px solid #000; width: 250px; text-align: center; padding-top: 5px;">Signature</div>
        <div style="border-top: 1px solid #000; width: 150px; text-align: center; padding-top: 5px;">Date</div>
      </div>
    </div>

    ${renderFooter()}
  `;
  openPrintWindow(html, \`Internship Offer - \${data.name}\`);
}

export interface InternshipCertData {
  name: string
  college?: string
  course?: string
  role: string
  department: string
  startDate: string
  endDate: string
  internId: string
  performance?: string
  skills?: string
  certificateNo: string
}

export function printInternshipCertificate(data: InternshipCertData) {
  const html = \`
    <style>
      @page { size: A4 landscape; margin: 15mm; }
      body {
        font-family: 'Inter', system-ui, sans-serif;
        color: #1a1a1a;
        margin: 0;
        padding: 0;
        text-align: center;
      }
      .cert-container {
        border: 15px solid #1a1a1a;
        padding: 40px;
        position: relative;
        height: calc(100vh - 110px);
        box-sizing: border-box;
        overflow: hidden;
      }
      .cert-inner {
        border: 2px solid #C8FF00;
        padding: 40px;
        height: 100%;
        box-sizing: border-box;
        position: relative;
        z-index: 2;
      }
      .watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) rotate(-30deg);
        font-size: 100px;
        color: rgba(200, 255, 0, 0.1);
        white-space: nowrap;
        font-weight: 900;
        z-index: 1;
        pointer-events: none;
      }
      .logo { margin-bottom: 30px; }
      .logo svg { height: 60px; }
      .title {
        font-size: 36px;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 4px;
        margin-bottom: 40px;
        color: #1a1a1a;
      }
      .body-text { font-size: 18px; line-height: 1.6; margin-bottom: 20px; }
      .name {
        font-size: 32px;
        font-weight: 700;
        margin: 20px 0;
        color: #1a1a1a;
        text-transform: uppercase;
      }
      .details { margin: 30px 0; font-size: 16px; }
      .details-grid {
        display: inline-grid;
        grid-template-columns: auto auto;
        gap: 15px 40px;
        text-align: left;
        margin: 0 auto;
        background: rgba(200, 255, 0, 0.05);
        padding: 20px 40px;
        border-radius: 8px;
        border: 1px solid rgba(200, 255, 0, 0.3);
      }
      .signatures {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        margin-top: 60px;
        padding: 0 40px;
      }
      .sig-block { text-align: center; }
      .sig-line {
        border-top: 2px solid #1a1a1a;
        width: 200px;
        margin-bottom: 10px;
      }
      .qr-block { width: 100px; }
      .meta {
        position: absolute;
        bottom: 20px;
        left: 40px;
        right: 40px;
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #666;
      }
    </style>
    <div class="cert-container">
      <div class="watermark">HMORIX CERTIFIED</div>
      <div class="cert-inner">
        <div class="logo">\${COMPANY_LOGO_MARK}</div>
        <div class="title">Certificate of Internship Completion</div>
        
        <div class="body-text">This is to certify that</div>
        <div class="name">\${data.name}</div>
        <div class="body-text">has successfully completed an internship programme at<br><strong>HMORIX TECHNOLOGIES PRIVATE LIMITED</strong></div>
        
        <div class="details">
          <div class="details-grid">
            <div><strong>Duration:</strong> \${new Date(data.startDate).toLocaleDateString('en-GB')} to \${new Date(data.endDate).toLocaleDateString('en-GB')}</div>
            <div><strong>Role:</strong> \${data.role}</div>
            <div><strong>Department:</strong> \${data.department}</div>
            <div><strong>Performance:</strong> \${data.performance || 'Satisfactory'}</div>
            \${data.skills ? \`<div style="grid-column: 1 / -1;"><strong>Skills Acquired:</strong> \${data.skills}</div>\` : ''}
          </div>
        </div>
        
        <div class="signatures">
          <div class="sig-block">
            <div class="sig-line"></div>
            <strong>Program Director</strong>
          </div>
          <div class="qr-block">
            <svg width="80" height="80" viewBox="0 0 100 100" style="background:#fff; padding:5px;">
              <path d="M10,10 h30 v30 h-30 z M15,15 h20 v20 h-20 z M60,10 h30 v30 h-30 z M65,15 h20 v20 h-20 z M10,60 h30 v30 h-30 z M15,65 h20 v20 h-20 z M50,50 h10 v10 h-10 z M70,50 h10 v20 h-10 z M60,70 h30 v10 h-30 z M80,80 h10 v10 h-10 z" fill="#000"/>
            </svg>
          </div>
          <div class="sig-block">
            <div class="sig-line"></div>
            <strong>Human Resources</strong>
          </div>
        </div>
        
        <div class="meta">
          <div>Certificate No: \${data.certificateNo}</div>
          <div>Intern ID: \${data.internId}</div>
        </div>
      </div>
    </div>
  \`;
  openPrintWindow(html, \`Internship Certificate - \${data.name}\`);
}

export interface PermanentOfferData {
  name: string
  email?: string
  phone?: string
  internId: string
  employeeId: string
  role: string
  department: string
  ctc: number
  joiningDate: string
  location: string
  reportingTo?: string
  probationMonths?: number
  prevInternDuration?: string
}

export function printPermanentOfferLetter(data: PermanentOfferData) {
  const basic = Math.round(data.ctc * 0.4);
  const hra = Math.round(data.ctc * 0.2);
  const special = Math.round(data.ctc * 0.3);
  const statutory = Math.round(data.ctc * 0.1);

  const html = \`
    \${renderHeader('Permanent Employment Offer Letter')}
    
    <div class="highlight-box" style="background: rgba(200,255,0,0.1); border-left-color: #C8FF00;">
      <strong>Transition from Internship to Permanent Employment</strong>
    </div>

    <div class="ref-ribbon">
      <strong>Ref:</strong> HMT/HR/OFR/\${new Date(data.joiningDate).getFullYear()}/\${Date.now().toString().slice(-4)}
      <span style="float: right;"><strong>Date:</strong> \${new Date().toLocaleDateString('en-GB')}</span>
    </div>

    <div class="recipient-block">
      <strong>To,</strong><br>
      \${data.name}<br>
      \${data.email ? \`Email: \${data.email}<br>\` : ''}
      Previous Intern ID: \${data.internId}
    </div>

    <p>Dear <strong>\${data.name}</strong>,</p>
    <p>Following the successful completion of your internship programme\${data.prevInternDuration ? \` (\${data.prevInternDuration})\` : ''} and a comprehensive performance evaluation, we are delighted to offer you a permanent position at HMORIX TECHNOLOGIES.</p>

    <div class="details-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: rgba(0,0,0,0.02); padding: 15px; border: 1px solid #ddd; margin-bottom: 20px;">
      <div><strong>Employee ID:</strong> \${data.employeeId}</div>
      <div><strong>Designation:</strong> \${data.role}</div>
      <div><strong>Department:</strong> \${data.department}</div>
      <div><strong>Joining Date:</strong> \${new Date(data.joiningDate).toLocaleDateString('en-GB')}</div>
      <div><strong>Location:</strong> \${data.location}</div>
      <div><strong>Reporting Manager:</strong> \${data.reportingTo || 'Department Head'}</div>
      <div><strong>Annual CTC:</strong> ₹\${data.ctc.toLocaleString()}</div>
    </div>

    <h4>Salary & Compensation Breakdown (Annual)</h4>
    <table class="data-table">
      <thead>
        <tr>
          <th>Component</th>
          <th style="text-align: right;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr><td>Basic Salary (40%)</td><td style="text-align: right;">₹\${basic.toLocaleString()}</td></tr>
        <tr><td>House Rent Allowance (20%)</td><td style="text-align: right;">₹\${hra.toLocaleString()}</td></tr>
        <tr><td>Special Allowance (30%)</td><td style="text-align: right;">₹\${special.toLocaleString()}</td></tr>
        <tr><td>Statutory Contributions (PF, ESI etc. 10%)</td><td style="text-align: right;">₹\${statutory.toLocaleString()}</td></tr>
        <tr style="font-weight: bold; background: #f9f9f9;">
          <td>Total Cost to Company (CTC)</td>
          <td style="text-align: right;">₹\${data.ctc.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>

    <h4>Benefits & Perks</h4>
    <ul>
      <li>Comprehensive Health Insurance for you and your dependents.</li>
      <li>Provident Fund (PF) and Employee State Insurance (ESI) as per statutory norms.</li>
      <li>Leave policy including 18 Earned Leaves and 12 Sick/Casual Leaves per year.</li>
      <li>Performance Bonus based on company and individual goal achievement.</li>
    </ul>

    <h4>Terms & Conditions</h4>
    <ol>
      <li><strong>Probation:</strong> You will be on probation for a period of \${data.probationMonths || 3} months from your joining date.</li>
      <li><strong>Notice Period:</strong> During probation, the notice period is 15 days. Post confirmation, it is 60 days.</li>
      <li><strong>Exclusivity:</strong> You are required to devote your full working time to the company and cannot engage in any other employment.</li>
      <li><strong>Confidentiality:</strong> You will continue to be bound by the Non-Disclosure Agreement (NDA) and Intellectual Property rights policy.</li>
      <li><strong>Code of Conduct:</strong> Adherence to the company's rules, regulations, and professional code of conduct is mandatory.</li>
      <li><strong>Background Verification:</strong> This offer is subject to successful background verification and submission of required documents.</li>
    </ol>

    <p>Please review these terms and sign the duplicate copy of this letter as a token of your acceptance.</p>

    \${renderSignatures('Human Resources', 'Authorized Signatory')}
    
    <div style="border-top: 2px dashed #999; margin: 40px 0; padding-top: 20px;">
      <h4>Candidate Acceptance Declaration</h4>
      <p>I, <strong>\${data.name}</strong>, acknowledge that I have read, understood, and accept the terms and conditions outlined in this permanent employment offer letter.</p>
      <div style="margin-top: 40px; display: flex; justify-content: space-between;">
        <div style="border-top: 1px solid #000; width: 250px; text-align: center; padding-top: 5px;">Signature</div>
        <div style="border-top: 1px solid #000; width: 150px; text-align: center; padding-top: 5px;">Date</div>
      </div>
    </div>

    \${renderFooter()}
  \`;
  openPrintWindow(html, \`Permanent Offer - \${data.name}\`);
}

export interface InternApprovalData {
  name: string
  email?: string
  college: string
  course: string
  internId: string
  role: string
  department: string
  startDate: string
  endDate: string
  supervisorName: string
  supervisorEmail: string
  projectTitle?: string
}

export function printInternApprovalLetter(data: InternApprovalData) {
  const html = \`
    \${renderHeader('Internship Approval & Onboarding Letter')}
    
    <div class="ref-ribbon">
      <strong>Ref:</strong> HMT/HR/ONB/\${new Date(data.startDate).getFullYear()}/\${Date.now().toString().slice(-4)}
      <span style="float: right;"><strong>Date:</strong> \${new Date().toLocaleDateString('en-GB')}</span>
    </div>

    <p>Dear <strong>\${data.name}</strong>,</p>
    <p>Welcome to HMORIX TECHNOLOGIES! We are pleased to formally approve your internship application and welcome you onboard. Your background check and document verification have been completed successfully.</p>

    <div class="highlight-box">
      <strong>Internship Details</strong><br>
      Role: \${data.role} | Department: \${data.department}<br>
      Duration: \${new Date(data.startDate).toLocaleDateString('en-GB')} to \${new Date(data.endDate).toLocaleDateString('en-GB')}<br>
      Intern ID: \${data.internId}
      \${data.projectTitle ? \`<br>Project: \${data.projectTitle}\` : ''}
    </div>

    <h4>Supervisor Information</h4>
    <p>Your primary point of contact and supervisor for this internship will be:</p>
    <ul>
      <li><strong>Name:</strong> \${data.supervisorName}</li>
      <li><strong>Email:</strong> \${data.supervisorEmail}</li>
    </ul>

    <h4>System Access & IT Setup</h4>
    <div style="background: #f5f5f5; padding: 15px; border-left: 4px solid #C8FF00; margin-bottom: 20px;">
      <p>On your first day, please reach out to the IT Helpdesk for:</p>
      <ul>
        <li>Company Email ID creation</li>
        <li>Access to internal project management tools (Jira, Confluence)</li>
        <li>Access to version control systems (GitHub/GitLab) if applicable</li>
        <li>ID Card issuance</li>
      </ul>
    </div>

    <h4>First-Day Checklist</h4>
    <p>Please bring the following original documents along with one set of photocopies for our records on your first day:</p>
    <ol>
      <li>Valid College ID Card</li>
      <li>Aadhar Card / Government ID proof</li>
      <li>NOC (No Objection Certificate) from your college/university</li>
      <li>2 Passport size photographs</li>
    </ol>

    <p>We look forward to a mutually beneficial association and wish you a fantastic learning experience at HMORIX.</p>

    \${renderSignatures('Human Resources', 'Authorized Signatory')}
    \${renderFooter()}
  \`;
  openPrintWindow(html, \`Intern Approval - \${data.name}\`);
}
