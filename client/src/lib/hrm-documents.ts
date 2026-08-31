// HMorix HRM Document Generator Suite
// 100% free — uses browser standard window.open() + window.print()
// No external or paid libraries required

export interface CompanyInfo {
  name: string
  address: string
  email: string
  phone: string
  website: string
  cin?: string
}

export const COMPANY: CompanyInfo = {
  name: "HMorix Technologies Pvt Ltd",
  address: "MG Polytechnic Road, Hathras, Uttar Pradesh – 204101",
  email: "hr@hmorix.com",
  phone: "+91 98765 43210",
  website: "https://hmorix.in",
  cin: "U72900UP2026PTC123456",
}

const BASE_STYLES = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-size: 12px;
    color: #1a1a1a;
    background: #ffffff;
    padding: 36px 40px;
    line-height: 1.7;
  }
  .doc-container {
    max-width: 780px;
    margin: 0 auto;
    background: #ffffff;
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 16px;
    border-bottom: 2.5px solid #08090A;
    margin-bottom: 22px;
  }
  .logo-block {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .logo-box {
    width: 44px;
    height: 44px;
    background: #08090A;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #C8FF00;
    font-weight: 900;
    font-size: 16px;
    letter-spacing: -1px;
  }
  .company-title {
    font-size: 16px;
    font-weight: 800;
    color: #08090A;
    letter-spacing: -0.02em;
  }
  .company-sub {
    font-size: 10px;
    color: #666666;
    margin-top: 2px;
  }
  .doc-badge {
    text-align: right;
  }
  .doc-title {
    font-size: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #08090A;
    background: #f4f4f5;
    padding: 6px 14px;
    border-radius: 6px;
    display: inline-block;
  }
  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    font-size: 11px;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 20px;
  }
  .meta-item strong {
    color: #08090A;
    display: inline-block;
    min-width: 120px;
  }
  .candidate-box {
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 1px dashed #e5e7eb;
  }
  .candidate-name {
    font-size: 14px;
    font-weight: 700;
    color: #08090A;
  }
  .candidate-info {
    font-size: 11px;
    color: #555555;
    margin-top: 2px;
  }
  p {
    margin-bottom: 12px;
    font-size: 11.5px;
    color: #2b2b2b;
    text-align: justify;
  }
  h3 {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #08090A;
    margin: 16px 0 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #f0f0f0;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0 16px;
    font-size: 11px;
  }
  thead th {
    background: #08090A;
    color: #C8FF00;
    font-size: 9.5px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 8px 12px;
    text-align: left;
  }
  tbody td {
    padding: 7px 12px;
    border-bottom: 1px solid #eeeeee;
    color: #333333;
  }
  tbody tr:last-child td {
    border-bottom: none;
  }
  .val-bold {
    font-weight: 700;
    color: #08090A;
  }
  .tot-row td {
    background: #f4f4f5;
    font-weight: 700;
    border-top: 2px solid #d4d4d8;
    color: #08090A;
  }
  .terms-box {
    background: #fafafa;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 12px 16px;
    margin: 14px 0;
    font-size: 10.5px;
    color: #4b5563;
  }
  .terms-box ul {
    padding-left: 18px;
  }
  .terms-box li {
    margin-bottom: 4px;
  }
  .sig-section {
    display: flex;
    justify-content: space-between;
    margin-top: 36px;
    padding-top: 10px;
  }
  .sig-block {
    width: 220px;
  }
  .sig-line {
    border-top: 1.5px solid #08090A;
    margin-bottom: 6px;
    width: 180px;
  }
  .sig-title {
    font-size: 10px;
    color: #666666;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .sig-name {
    font-size: 12px;
    font-weight: 700;
    color: #08090A;
    margin-top: 2px;
  }
  .sig-role {
    font-size: 10px;
    color: #666666;
  }
  .ack-box {
    margin-top: 26px;
    padding: 12px 16px;
    border: 1px dashed #cbd5e1;
    border-radius: 8px;
    background: #fdfdfd;
  }
  .ack-header {
    font-size: 11px;
    font-weight: 700;
    color: #08090A;
    margin-bottom: 6px;
    text-transform: uppercase;
  }
  .ack-sig-row {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }
  .net-box {
    text-align: center;
    background: #f9fafb;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    padding: 16px;
    margin: 16px 0;
  }
  .net-label {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #6b7280;
  }
  .net-amount {
    font-size: 26px;
    font-weight: 900;
    color: #08090A;
    margin: 4px 0;
  }
  .net-words {
    font-size: 10px;
    color: #9ca3af;
  }
  .footer {
    margin-top: 28px;
    padding-top: 10px;
    border-top: 1px solid #eeeeee;
    font-size: 9px;
    color: #9ca3af;
    text-align: center;
  }
  
  /* Digital Employee ID Badge Styles */
  .id-card-wrap {
    display: flex;
    justify-content: center;
    padding: 20px 0;
  }
  .id-card {
    width: 320px;
    border: 2px solid #08090A;
    border-radius: 14px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  }
  .id-top {
    background: #08090A;
    color: #ffffff;
    padding: 16px 14px;
    text-align: center;
  }
  .id-logo-text {
    font-size: 16px;
    font-weight: 900;
    color: #C8FF00;
    letter-spacing: 1px;
  }
  .id-corp-sub {
    font-size: 9px;
    color: #9ca3af;
    margin-top: 2px;
  }
  .id-body {
    padding: 18px 16px;
    text-align: center;
  }
  .id-avatar {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: #08090A;
    color: #C8FF00;
    font-weight: 800;
    font-size: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
    border: 3px solid #C8FF00;
  }
  .id-name {
    font-size: 15px;
    font-weight: 800;
    color: #08090A;
  }
  .id-role {
    font-size: 11px;
    font-weight: 600;
    color: #4b5563;
    margin-top: 2px;
  }
  .id-dept {
    font-size: 10px;
    color: #9ca3af;
  }
  .id-info-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin: 14px 0;
    padding: 10px 12px;
    background: #f9fafb;
    border-radius: 8px;
    text-align: left;
    font-size: 10px;
  }
  .id-info-item strong {
    display: block;
    color: #6b7280;
    font-size: 8.5px;
    text-transform: uppercase;
  }
  .id-barcode {
    font-family: monospace;
    font-size: 14px;
    font-weight: 900;
    letter-spacing: 4px;
    color: #08090A;
    margin: 10px 0 4px;
  }
  .id-bottom {
    background: #08090A;
    color: #9ca3af;
    font-size: 8.5px;
    padding: 8px 12px;
    text-align: center;
  }

  @media print {
    body { padding: 0; background: #ffffff; }
    .doc-container { max-width: 100%; }
    @page { margin: 12mm; size: A4; }
  }
`;

function renderHeader(docTitle: string): string {
  return `
    <div class="header">
      <div class="logo-block">
        <div class="logo-box">HM</div>
        <div>
          <div class="company-title">${COMPANY.name}</div>
          <div class="company-sub">${COMPANY.address}</div>
          <div class="company-sub">${COMPANY.email} &bull; ${COMPANY.phone} &bull; ${COMPANY.website}</div>
        </div>
      </div>
      <div class="doc-badge">
        <div class="doc-title">${docTitle}</div>
      </div>
    </div>
  `;
}

function renderSignatures(signer = "Harsh Sharma", title = "Chief Executive Officer"): string {
  return `
    <div class="sig-section">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-title">Authorized Signatory</div>
        <div class="sig-name">${signer}</div>
        <div class="sig-role">${title}, ${COMPANY.name}</div>
      </div>
      <div class="sig-block" style="text-align: right;">
        <div class="sig-line" style="margin-left: auto;"></div>
        <div class="sig-title">Company Seal / Stamp</div>
        <div class="sig-name">${COMPANY.name}</div>
        <div class="sig-role">Hathras, UP, India</div>
      </div>
    </div>
  `;
}

function renderFooter(): string {
  return `
    <div class="footer">
      Official Document &bull; ${COMPANY.name} &bull; CIN: ${COMPANY.cin} &bull; Verification: hr@hmorix.com &bull; ${COMPANY.website}
    </div>
  `;
}

export function openPrintWindow(htmlContent: string, windowTitle: string) {
  const printWindow = window.open("", "_blank", "width=850,height=950");
  if (!printWindow) {
    alert("Please allow pop-ups for this site to generate and print official HR documents.");
    return;
  }
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${windowTitle} - HMorix</title>
        <style>${BASE_STYLES}</style>
      </head>
      <body>
        <div class="doc-container">
          ${htmlContent}
          ${renderFooter()}
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 500);
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
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const refNo = `HM/OL/${new Date().getFullYear()}/${Date.now().toString().slice(-5)}`;
  const monthlyCtc = Math.round(data.ctc / 12);
  const basic = Math.round(monthlyCtc * 0.4);
  const hra = Math.round(monthlyCtc * 0.2);
  const special = Math.round(monthlyCtc * 0.3);
  const other = monthlyCtc - basic - hra - special;

  const html = `
    ${renderHeader("Offer of Employment")}
    
    <div class="candidate-box">
      <div class="candidate-name">${data.name}</div>
      <div class="candidate-info">${data.email || ""} ${data.phone ? " &bull; " + data.phone : ""} ${data.address ? " &bull; " + data.address : ""}</div>
    </div>

    <div class="meta-grid">
      <div class="meta-item"><strong>Reference No:</strong> ${refNo}</div>
      <div class="meta-item"><strong>Offer Date:</strong> ${today}</div>
      <div class="meta-item"><strong>Designation:</strong> ${data.role}</div>
      <div class="meta-item"><strong>Department:</strong> ${data.department}</div>
      <div class="meta-item"><strong>Work Location:</strong> ${data.location}</div>
      <div class="meta-item"><strong>Joining Date:</strong> ${data.joiningDate}</div>
    </div>

    <p>Dear <strong>${data.name}</strong>,</p>
    <p>We are pleased to extend this formal offer of employment for the position of <strong>${data.role}</strong> with <strong>${COMPANY.name}</strong>. Following our evaluation and interviews, we were thoroughly impressed with your credentials and believe you will make substantial contributions to our team.</p>
    
    <h3>Compensation & Benefits Structure</h3>
    <p>Your total Annual Cost to Company (CTC) will be <strong>₹${data.ctc.toLocaleString("en-IN")}</strong> (${monthlyCtc.toLocaleString("en-IN")}/- per month), structured as follows:</p>

    <table>
      <thead>
        <tr>
          <th>Salary Component</th>
          <th style="text-align: right;">Monthly (₹)</th>
          <th style="text-align: right;">Annual (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Basic Salary (40%)</td>
          <td style="text-align: right;" class="val-bold">₹${basic.toLocaleString("en-IN")}</td>
          <td style="text-align: right;" class="val-bold">₹${(basic * 12).toLocaleString("en-IN")}</td>
        </tr>
        <tr>
          <td>House Rent Allowance (HRA 20%)</td>
          <td style="text-align: right;">₹${hra.toLocaleString("en-IN")}</td>
          <td style="text-align: right;">₹${(hra * 12).toLocaleString("en-IN")}</td>
        </tr>
        <tr>
          <td>Special Allowance (30%)</td>
          <td style="text-align: right;">₹${special.toLocaleString("en-IN")}</td>
          <td style="text-align: right;">₹${(special * 12).toLocaleString("en-IN")}</td>
        </tr>
        <tr>
          <td>Other Allowances / Flexi Pay (10%)</td>
          <td style="text-align: right;">₹${other.toLocaleString("en-IN")}</td>
          <td style="text-align: right;">₹${(other * 12).toLocaleString("en-IN")}</td>
        </tr>
        <tr class="tot-row">
          <td>Total Gross Compensation (CTC)</td>
          <td style="text-align: right;">₹${monthlyCtc.toLocaleString("en-IN")}</td>
          <td style="text-align: right;">₹${data.ctc.toLocaleString("en-IN")}</td>
        </tr>
      </tbody>
    </table>

    <div class="terms-box">
      <h3>Key Terms of Offer</h3>
      <ul>
        <li><strong>Probationary Period:</strong> 90 calendar days from date of joining. Confirmation subject to review.</li>
        <li><strong>Notice Period:</strong> 30 days during probation; 60 days post-confirmation.</li>
        <li><strong>Validity:</strong> Valid for 7 calendar days from issue date.</li>
        <li><strong>Required Documents:</strong> Educational certificates, PAN, Aadhaar, Bank passbook copy.</li>
      </ul>
    </div>

    <p>Please sign and return the duplicate copy of this letter as acceptance of this offer.</p>

    ${renderSignatures()}

    <div class="ack-box">
      <div class="ack-header">Candidate Acceptance & Confirmation</div>
      <p>I, <strong>${data.name}</strong>, accept the terms and conditions outlined in this offer letter and confirm my joining on <strong>${data.joiningDate}</strong>.</p>
      <div class="ack-sig-row">
        <div>
          <div class="sig-line"></div>
          <div class="sig-title">Candidate Signature</div>
          <div class="sig-name">${data.name}</div>
        </div>
        <div style="text-align: right;">
          <div class="sig-line" style="margin-left: auto;"></div>
          <div class="sig-title">Date & Place</div>
        </div>
      </div>
    </div>
  `;

  openPrintWindow(html, `Offer Letter - ${data.name}`);
}

/* ==========================================================================
   2. JOINING & INDUCTION LETTER
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
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const refNo = `HM/JL/${data.employeeId}`;

  const html = `
    ${renderHeader("Joining & Induction Letter")}
    
    <div class="candidate-box">
      <div class="candidate-name">${data.name}</div>
      <div class="candidate-info">Employee ID: <strong>${data.employeeId}</strong> ${data.workEmail ? " &bull; " + data.workEmail : ""}</div>
    </div>

    <div class="meta-grid">
      <div class="meta-item"><strong>Reference:</strong> ${refNo}</div>
      <div class="meta-item"><strong>Issue Date:</strong> ${today}</div>
      <div class="meta-item"><strong>Designation:</strong> ${data.role}</div>
      <div class="meta-item"><strong>Department:</strong> ${data.department}</div>
      <div class="meta-item"><strong>Work Location:</strong> ${data.location}</div>
      <div class="meta-item"><strong>Joining Date:</strong> ${data.joiningDate}</div>
    </div>

    <p>Dear <strong>${data.name}</strong>,</p>
    <p>We warmly welcome you to <strong>${COMPANY.name}</strong>. We confirm that your onboarding formalities are complete and your employment commences on <strong>${data.joiningDate}</strong>.</p>
    <p>Your permanent Employee ID is <strong>${data.employeeId}</strong>. Please use this for all official communications, self-service portals, and payroll processing.</p>

    <div class="terms-box">
      <h3>Workplace Standards & Operating Policies</h3>
      <ul>
        <li><strong>Official Hours:</strong> Monday–Friday, 9:30 AM to 6:30 PM.</li>
        <li><strong>Self-Service Portal:</strong> Access attendance, leaves, payslips at <a href="${COMPANY.website}/employee/login">${COMPANY.website}/employee/login</a>.</li>
        <li><strong>Annual Leave Quota:</strong> 12 Casual Leaves, 10 Sick Leaves, 18 Earned Leaves per year.</li>
        <li><strong>Confidentiality:</strong> Complete adherence to client NDAs and corporate security policies.</li>
      </ul>
    </div>

    <p>Wishing you an enriching, successful career with us. Welcome aboard!</p>

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
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const refNo = `HM/APL/${data.employeeId}`;
  const monthlyCtc = Math.round(data.ctc / 12);

  const html = `
    ${renderHeader("Appointment Letter")}
    
    <div class="candidate-box">
      <div class="candidate-name">${data.name}</div>
      <div class="candidate-info">Employee Code: <strong>${data.employeeId}</strong></div>
    </div>

    <div class="meta-grid">
      <div class="meta-item"><strong>Reference:</strong> ${refNo}</div>
      <div class="meta-item"><strong>Date:</strong> ${today}</div>
      <div class="meta-item"><strong>Designation:</strong> ${data.role}</div>
      <div class="meta-item"><strong>Department:</strong> ${data.department}</div>
      <div class="meta-item"><strong>Effective Date:</strong> ${data.joiningDate}</div>
      <div class="meta-item"><strong>Annual Remuneration:</strong> ₹${data.ctc.toLocaleString("en-IN")}</div>
    </div>

    <p>Dear <strong>${data.name}</strong>,</p>
    <p>Consequent to your acceptance of our offer, the Management of <strong>${COMPANY.name}</strong> is pleased to appoint you as <strong>${data.role}</strong> in the <strong>${data.department}</strong> department, effective from <strong>${data.joiningDate}</strong>.</p>

    <div class="terms-box">
      <h3>Terms & Conditions of Employment</h3>
      <ul>
        <li><strong>Remuneration:</strong> Annual CTC of ₹${data.ctc.toLocaleString("en-IN")} (₹${monthlyCtc.toLocaleString("en-IN")}/- monthly gross), subject to statutory withholdings.</li>
        <li><strong>Probation:</strong> 90 days probation period with performance assessment.</li>
        <li><strong>Intellectual Property:</strong> All software, code, designs, and systems built during tenure belong solely to ${COMPANY.name}.</li>
        <li><strong>Notice Period:</strong> 30 days during probation; 60 days post-confirmation.</li>
      </ul>
    </div>

    <p>We trust that you will play a pivotal role in driving our company goals.</p>

    ${renderSignatures()}

    <div class="ack-box">
      <div class="ack-header">Acknowledgement & Acceptance</div>
      <p>I have read, understood, and agree to all terms and conditions of this Appointment Letter.</p>
      <div class="ack-sig-row">
        <div>
          <div class="sig-line"></div>
          <div class="sig-title">Employee Signature</div>
          <div class="sig-name">${data.name} (${data.employeeId})</div>
        </div>
        <div style="text-align: right;">
          <div class="sig-line" style="margin-left: auto;"></div>
          <div class="sig-title">Date</div>
        </div>
      </div>
    </div>
  `;

  openPrintWindow(html, `Appointment Letter - ${data.name}`);
}

/* ==========================================================================
   4. SALARY CERTIFICATE / SALARY VERIFICATION LETTER
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
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const refNo = `HM/SC/${data.employeeId}/${Date.now().toString().slice(-4)}`;

  const html = `
    ${renderHeader("Salary & Employment Verification Certificate")}
    
    <div class="meta-grid">
      <div class="meta-item"><strong>Certificate No:</strong> ${refNo}</div>
      <div class="meta-item"><strong>Date of Issue:</strong> ${today}</div>
    </div>

    <p style="text-align: center; font-size: 13px; font-weight: 700; margin: 18px 0; text-transform: uppercase; letter-spacing: 0.05em;">
      TO WHOMSOEVER IT MAY CONCERN
    </p>

    <p>This is to certify that <strong>${data.name}</strong> (Employee ID: <strong>${data.employeeId}</strong>) is currently employed on a full-time, permanent basis with <strong>${COMPANY.name}</strong> as <strong>${data.role}</strong> in the <strong>${data.department}</strong> department, since <strong>${data.joiningDate}</strong>.</p>
    
    <p>As per our corporate payroll records, the remuneration structure drawn by ${data.name} is as follows:</p>

    <div class="meta-grid" style="grid-template-columns: 1fr 1fr;">
      <div class="meta-item"><strong>Monthly Gross Salary:</strong> ₹${data.monthlyGross.toLocaleString("en-IN")}</div>
      <div class="meta-item"><strong>Annual Cost to Company (CTC):</strong> ₹${data.annualCtc.toLocaleString("en-IN")}</div>
      <div class="meta-item"><strong>Employment Status:</strong> Active & Confirmed</div>
      <div class="meta-item"><strong>Payment Mode:</strong> Direct Bank Account Credit</div>
    </div>

    <p>${data.purpose || "This certificate is issued upon the specific request of the employee for official verification purposes (such as bank loan processing, financial assessment, or visa application) without any liability on part of the company."}</p>
    
    <p>For any further employment or salary verification inquiries, please contact our Human Resources department at ${COMPANY.email} or ${COMPANY.phone}.</p>

    ${renderSignatures()}
  `;

  openPrintWindow(html, `Salary Certificate - ${data.name}`);
}

/* ==========================================================================
   5. FULL & FINAL (FnF) SETTLEMENT STATEMENT
   ========================================================================== */
export interface FnFStatementData {
  name: string
  employeeId: string
  role: string
  department: string
  joiningDate: string
  relievingDate: string
  monthlySalary: number
  leaveEncashmentDays: number
  leaveEncashmentAmount: number
  gratuityAmount: number
  pendingBonus: number
  noticePayAdjustment: number
  otherDeductions: number
  netPayable: number
  settlementDate?: string
}

export function printFnFStatement(data: FnFStatementData) {
  const today = data.settlementDate || new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const refNo = `HM/FnF/${data.employeeId}`;
  const totalEarnings = data.monthlySalary + data.leaveEncashmentAmount + data.gratuityAmount + data.pendingBonus;
  const totalDeductions = data.noticePayAdjustment + data.otherDeductions;
  const netAmount = totalEarnings - totalDeductions;

  const html = `
    ${renderHeader("Full & Final (FnF) Settlement Statement")}
    
    <div class="candidate-box">
      <div class="candidate-name">${data.name}</div>
      <div class="candidate-info">Employee Code: <strong>${data.employeeId}</strong> &bull; ${data.role} (${data.department})</div>
    </div>

    <div class="meta-grid">
      <div class="meta-item"><strong>Statement Ref:</strong> ${refNo}</div>
      <div class="meta-item"><strong>Settlement Date:</strong> ${today}</div>
      <div class="meta-item"><strong>Date of Joining:</strong> ${data.joiningDate}</div>
      <div class="meta-item"><strong>Last Working Day:</strong> ${data.relievingDate}</div>
    </div>

    <p>This statement summarizes the full, final, and complete financial settlement between <strong>${COMPANY.name}</strong> and <strong>${data.name}</strong> upon separation of employment.</p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
      <div>
        <h3>Earnings & Credits</h3>
        <table>
          <thead>
            <tr>
              <th>Component</th>
              <th style="text-align: right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Final Month Salary / Dues</td>
              <td style="text-align: right;" class="val-bold">₹${data.monthlySalary.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td>Leave Encashment (${data.leaveEncashmentDays} Days)</td>
              <td style="text-align: right;">₹${data.leaveEncashmentAmount.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td>Gratuity Settlement</td>
              <td style="text-align: right;">₹${data.gratuityAmount.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td>Pending Bonus / Incentives</td>
              <td style="text-align: right;">₹${data.pendingBonus.toLocaleString("en-IN")}</td>
            </tr>
            <tr class="tot-row">
              <td>Total Gross Credits (A)</td>
              <td style="text-align: right;">₹${totalEarnings.toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <h3>Deductions & Recoveries</h3>
        <table>
          <thead>
            <tr>
              <th>Component</th>
              <th style="text-align: right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Notice Period Shortfall Adjustment</td>
              <td style="text-align: right;">₹${data.noticePayAdjustment.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td>Asset / IT Deductions</td>
              <td style="text-align: right;">₹0</td>
            </tr>
            <tr>
              <td>Statutory TDS / Taxes Withheld</td>
              <td style="text-align: right;">₹${data.otherDeductions.toLocaleString("en-IN")}</td>
            </tr>
            <tr class="tot-row">
              <td>Total Deductions (B)</td>
              <td style="text-align: right; color: #dc2626;">₹${totalDeductions.toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="net-box">
      <div class="net-label">Net Full & Final Settlement Payout (A - B)</div>
      <div class="net-amount">₹${netAmount.toLocaleString("en-IN")}</div>
      <div class="net-words">Amount processed via direct bank wire transfer to registered account on ${today}</div>
    </div>

    <div class="terms-box">
      <h3>Exit Clearance Confirmation</h3>
      <ul>
        <li><strong>IT & Systems Clearance:</strong> Laptops, corporate emails, credentials, and access tokens revoked.</li>
        <li><strong>Finance Clearance:</strong> All travel advances, corporate cards, and departmental claims resolved.</li>
        <li><strong>HR Clearance:</strong> Handover completed and acknowledged by reporting manager.</li>
      </ul>
    </div>

    ${renderSignatures()}

    <div class="ack-box">
      <div class="ack-header">Employee Discharge & Settlement Acknowledgement</div>
      <p>I, <strong>${data.name}</strong>, hereby acknowledge receipt of the Full & Final settlement stated above and confirm that I have no further financial or legal claims against ${COMPANY.name}.</p>
      <div class="ack-sig-row">
        <div>
          <div class="sig-line"></div>
          <div class="sig-title">Employee Signature</div>
          <div class="sig-name">${data.name} (${data.employeeId})</div>
        </div>
        <div style="text-align: right;">
          <div class="sig-line" style="margin-left: auto;"></div>
          <div class="sig-title">Date</div>
        </div>
      </div>
    </div>
  `;

  openPrintWindow(html, `FnF Settlement - ${data.name}`);
}

/* ==========================================================================
   6. EXPERIENCE CERTIFICATE
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
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const refNo = `HM/EXP/${data.employeeId}`;

  const html = `
    ${renderHeader("Experience & Service Certificate")}
    
    <div class="meta-grid">
      <div class="meta-item"><strong>Certificate No:</strong> ${refNo}</div>
      <div class="meta-item"><strong>Date of Issue:</strong> ${today}</div>
    </div>

    <p style="text-align: center; font-size: 13px; font-weight: 700; margin: 18px 0; text-transform: uppercase; letter-spacing: 0.05em;">
      TO WHOMSOEVER IT MAY CONCERN
    </p>

    <p>This is to certify that <strong>${data.name}</strong> (Employee ID: <strong>${data.employeeId}</strong>) was employed with <strong>${COMPANY.name}</strong> from <strong>${data.joiningDate}</strong> to <strong>${data.relievingDate}</strong>.</p>
    <p>During their tenure with us, they held the position of <strong>${data.role}</strong> in the <strong>${data.department}</strong> department.</p>

    <div class="meta-grid">
      <div class="meta-item"><strong>Employee Name:</strong> ${data.name}</div>
      <div class="meta-item"><strong>Employee Code:</strong> ${data.employeeId}</div>
      <div class="meta-item"><strong>Last Designation:</strong> ${data.role}</div>
      <div class="meta-item"><strong>Department:</strong> ${data.department}</div>
      <div class="meta-item"><strong>Tenure Start:</strong> ${data.joiningDate}</div>
      <div class="meta-item"><strong>Tenure End:</strong> ${data.relievingDate}</div>
    </div>

    <p>${data.performance || "During their tenure, " + data.name + " exhibited high professional competence, integrity, and dedication to excellence. They made meaningful contributions to our technology and business deliverables."}</p>
    
    <p>We thank ${data.name} for their dedicated service and wish them the absolute best in all future professional endeavors.</p>

    ${renderSignatures()}
  `;

  openPrintWindow(html, `Experience Certificate - ${data.name}`);
}

/* ==========================================================================
   7. RELIEVING LETTER
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
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const refNo = `HM/RL/${data.employeeId}`;

  const html = `
    ${renderHeader("Formal Relieving Letter")}
    
    <div class="candidate-box">
      <div class="candidate-name">${data.name}</div>
      <div class="candidate-info">Employee Code: <strong>${data.employeeId}</strong></div>
    </div>

    <div class="meta-grid">
      <div class="meta-item"><strong>Reference:</strong> ${refNo}</div>
      <div class="meta-item"><strong>Date of Issue:</strong> ${today}</div>
      <div class="meta-item"><strong>Designation:</strong> ${data.role}</div>
      <div class="meta-item"><strong>Department:</strong> ${data.department}</div>
      <div class="meta-item"><strong>Date of Joining:</strong> ${data.joiningDate}</div>
      <div class="meta-item"><strong>Relieving Effective Date:</strong> ${data.relievingDate}</div>
    </div>

    <p>Dear <strong>${data.name}</strong>,</p>
    <p>With reference to your formal resignation, we confirm that your resignation has been accepted by the Management, and you are hereby formally relieved from all duties and employment with <strong>${COMPANY.name}</strong> effective from the close of business hours on <strong>${data.relievingDate}</strong>.</p>
    
    <p>We confirm that you have completed all exit formalities, handed over responsibilities, returned all company property, hardware, and access keys, and completed full departmental exit clearances.</p>

    <p>We appreciate your contributions during your association with HMorix and wish you success in your future career path.</p>

    ${renderSignatures()}
  `;

  openPrintWindow(html, `Relieving Letter - ${data.name}`);
}

/* ==========================================================================
   8. NO OBJECTION CERTIFICATE (NOC)
   ========================================================================== */
export interface NocLetterData {
  name: string
  employeeId: string
  role: string
  department: string
  joiningDate: string
  purpose?: string
}

export function printNocLetter(data: NocLetterData) {
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
  const refNo = `HM/NOC/${data.employeeId}/${Date.now().toString().slice(-4)}`;

  const html = `
    ${renderHeader("No Objection Certificate (NOC)")}
    
    <div class="meta-grid">
      <div class="meta-item"><strong>Reference:</strong> ${refNo}</div>
      <div class="meta-item"><strong>Date of Issue:</strong> ${today}</div>
    </div>

    <p style="text-align: center; font-size: 13px; font-weight: 700; margin: 18px 0; text-transform: uppercase; letter-spacing: 0.05em;">
      TO WHOMSOEVER IT MAY CONCERN
    </p>

    <p>This is to certify that <strong>${data.name}</strong> (Employee ID: <strong>${data.employeeId}</strong>) is a bona fide employee of <strong>${COMPANY.name}</strong>, working as <strong>${data.role}</strong> in the <strong>${data.department}</strong> department since <strong>${data.joiningDate}</strong>.</p>
    
    <p>This organization has <strong>NO OBJECTION</strong> whatsoever with respect to ${data.name} ${data.purpose || "applying for passport renewal, official international travel / visa processing, or pursuing external skill development / higher education programs"}.</p>
    
    <p>This certificate is issued without any financial liability on the part of ${COMPANY.name}.</p>

    ${renderSignatures()}
  `;

  openPrintWindow(html, `NOC - ${data.name}`);
}

/* ==========================================================================
   9. DIGITAL EMPLOYEE ID BADGE / CARD
   ========================================================================== */
export interface EmployeeIdCardData {
  name: string
  employeeId: string
  role: string
  department: string
  bloodGroup?: string
  emergencyPhone?: string
  joiningDate?: string
}

export function printEmployeeIdCard(data: EmployeeIdCardData) {
  const initials = data.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
  const html = `
    <div style="text-align: center; margin-bottom: 20px; font-weight: 800; font-size: 15px;">
      CORPORATE EMPLOYEE IDENTIFICATION BADGE
    </div>

    <div class="id-card-wrap">
      <div class="id-card">
        <div class="id-top">
          <div class="id-logo-text">HMORIX</div>
          <div class="id-corp-sub">${COMPANY.name}</div>
        </div>

        <div class="id-body">
          <div class="id-avatar">${initials}</div>
          <div class="id-name">${data.name}</div>
          <div class="id-role">${data.role}</div>
          <div class="id-dept">${data.department}</div>

          <div class="id-info-grid">
            <div class="id-info-item">
              <strong>Employee ID</strong>
              ${data.employeeId}
            </div>
            <div class="id-info-item">
              <strong>Blood Group</strong>
              ${data.bloodGroup || "O+ (Pos)"}
            </div>
            <div class="id-info-item">
              <strong>Emergency No</strong>
              ${data.emergencyPhone || COMPANY.phone}
            </div>
            <div class="id-info-item">
              <strong>Valid From</strong>
              ${data.joiningDate || "2026"}
            </div>
          </div>

          <div class="id-barcode">||| | | || ||| | |||</div>
          <div style="font-size: 8px; color: #9ca3af;">${data.employeeId} &bull; SECURE RFID ID</div>
        </div>

        <div class="id-bottom">
          Property of ${COMPANY.name} &bull; Return if found to ${COMPANY.email}
        </div>
      </div>
    </div>
  `;

  openPrintWindow(html, `ID Card - ${data.name}`);
}

/* ==========================================================================
   10. MONTHLY PAYSLIP
   ========================================================================== */
export interface PayslipData {
  name: string
  employeeId: string
  role: string
  department: string
  period: string
  baseSalary: number
  bonus: number
  deductions: number
  net: number
  email?: string
  location?: string
  pan?: string
  bankAccount?: string
}

export function printPayslip(data: PayslipData) {
  const [yr, mo] = data.period.split("-");
  const monthName = new Date(parseInt(yr, 10), parseInt(mo, 10) - 1, 1).toLocaleString("en-IN", { month: "long" });
  const periodLabel = `${monthName} ${yr}`;
  const payDate = `28 ${monthName} ${yr}`;

  const basic = data.baseSalary;
  const hra = Math.round(basic * 0.5);
  const special = Math.round(basic * 0.35);
  const gross = basic + hra + special + (data.bonus || 0);

  const pf = Math.round(basic * 0.12);
  const pt = 200;
  const tds = Math.max(0, data.deductions - pf - pt);
  const totalDeductions = pf + pt + tds;
  const netPay = gross - totalDeductions;

  const html = `
    ${renderHeader(`Salary Slip - ${periodLabel}`)}
    
    <div class="meta-grid" style="grid-template-columns: repeat(3, 1fr);">
      <div class="meta-item"><strong>Employee Name:</strong> ${data.name}</div>
      <div class="meta-item"><strong>Employee ID:</strong> ${data.employeeId}</div>
      <div class="meta-item"><strong>Designation:</strong> ${data.role}</div>
      <div class="meta-item"><strong>Department:</strong> ${data.department}</div>
      <div class="meta-item"><strong>Pay Period:</strong> ${periodLabel}</div>
      <div class="meta-item"><strong>Disbursement:</strong> ${payDate}</div>
      <div class="meta-item"><strong>Location:</strong> ${data.location || "Hathras, UP"}</div>
      <div class="meta-item"><strong>Email:</strong> ${data.email || "—"}</div>
      <div class="meta-item"><strong>Bank Account:</strong> ${data.bankAccount || "Verified on File"}</div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
      <div>
        <h3>Earnings (Credits)</h3>
        <table>
          <thead>
            <tr>
              <th>Component</th>
              <th style="text-align: right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Basic Salary</td>
              <td style="text-align: right;" class="val-bold">₹${basic.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td>House Rent Allowance (HRA)</td>
              <td style="text-align: right;">₹${hra.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td>Special Allowance</td>
              <td style="text-align: right;">₹${special.toLocaleString("en-IN")}</td>
            </tr>
            ${data.bonus > 0 ? `
            <tr>
              <td>Performance Bonus</td>
              <td style="text-align: right; color: #16a34a; font-weight: 700;">+₹${data.bonus.toLocaleString("en-IN")}</td>
            </tr>` : ""}
            <tr class="tot-row">
              <td>Total Gross Earnings</td>
              <td style="text-align: right;">₹${gross.toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <h3>Deductions (Debits)</h3>
        <table>
          <thead>
            <tr>
              <th>Component</th>
              <th style="text-align: right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Provident Fund (PF 12%)</td>
              <td style="text-align: right;">₹${pf.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td>Professional Tax (PT)</td>
              <td style="text-align: right;">₹${pt.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td>Tax Deducted at Source (TDS)</td>
              <td style="text-align: right;">₹${tds.toLocaleString("en-IN")}</td>
            </tr>
            <tr class="tot-row">
              <td>Total Deductions</td>
              <td style="text-align: right; color: #dc2626;">₹${totalDeductions.toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="net-box">
      <div class="net-label">Net Salary Disbursed</div>
      <div class="net-amount">₹${netPay.toLocaleString("en-IN")}</div>
      <div class="net-words">Credited to registered bank account on ${payDate}</div>
    </div>

    <p style="font-size: 9px; color: #888888; text-align: center; margin-top: 12px;">
      Digitally generated payslip &bull; No signature required &bull; Questions: hr@hmorix.com
    </p>
  `;

  openPrintWindow(html, `Payslip - ${data.name} - ${periodLabel}`);
}
