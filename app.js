const APP_VERSION = '2.1.0';
const versionBadge = document.getElementById('app-version');
if (versionBadge) {
  versionBadge.textContent = 'v' + APP_VERSION;
  versionBadge.title = 'CashflowHQ גרסה ' + APP_VERSION;
}

const SB_URL = 'https://zvrvlogqjzpnojfzbapu.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2cnZsb2dxanpwbm9qZnpiYXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMjk2MjgsImV4cCI6MjA5NzgwNTYyOH0.2I45YWLkTDLjndmyoNImkPLfqOxJV7TVsff2kAOZHpg';
// Edge Function לחיבור יומן גוגל פר-משתמש (מחליף את הסנכרון הקבוע הישן)
const GCAL_FN_URL = 'https://zvrvlogqjzpnojfzbapu.supabase.co/functions/v1/google-calendar-auth';
const ADVISOR_FN_URL = 'https://zvrvlogqjzpnojfzbapu.supabase.co/functions/v1/ai-advisor';
let gcalConnected = false;
const { createClient } = supabase;
const sb = createClient(SB_URL, SB_KEY);

// ── i18n: מילון תרגומים (עברית → אנגלית) ──
const I18N = {
  // Auth
  'ניהול תזרים': 'Cash Flow', 'שכר ועסק': 'Payroll & Business', 'בקליק אחד': 'In One Click',
  'הפתרון המקיף לעצמאים ועסקים קטנים לניהול הכנסות, הוצאות, עובדים ולקוחות — הכל במקום אחד.': 'The complete solution for freelancers and small businesses to manage income, expenses, employees and clients — all in one place.',
  'דשבורד תזרים בזמן אמת': 'Real-time cash flow dashboard',
  'ניהול עובדים ושכר': 'Employee & payroll management',
  'מעקב אירועים ולקוחות': 'Event & client tracking',
  'שיטת Profit First מובנית': 'Built-in Profit First method',
  'מאובטח ומוצפן — Supabase': 'Secure & encrypted — Supabase',
  'ברוכים הבאים חזרה': 'Welcome back', 'היכנסו לחשבון שלכם כדי להמשיך': 'Sign in to your account to continue',
  'פתחו חשבון חינם': 'Create a free account', '30 יום ניסיון — ללא כרטיס אשראי': '30-day trial — no credit card',
  'כניסה': 'Login', 'הרשמה חינם': 'Sign up free', 'כניסה לחשבון': 'Sign in', 'התחילו עכשיו': 'Get started',
  'אימייל': 'Email', 'סיסמה': 'Password', 'שכחתי סיסמה': 'Forgot password', 'אימות סיסמה': 'Confirm password',
  'לפחות 6 תווים': 'At least 6 characters', 'הכנס שוב את הסיסמה': 'Re-enter password',
  'מאובטח ומוצפן · ללא כרטיס אשראי · ניסיון חינם 30 יום': 'Secure & encrypted · No credit card · 30-day free trial',
  // Topbar / nav
  'חשבון מחובר': 'Connected account', 'בחירת מסלול': 'Choose plan', 'הגדרות ואפשרויות': 'Settings & options',
  'שינוי סיסמה': 'Change password', 'יציאה': 'Log out',
  'דשבורד': 'Dashboard', 'הכנסות/הוצאות': 'Income/Expenses', 'אירועים': 'Events', 'עובדים': 'Employees',
  'לקוחות': 'Clients', 'קבועות': 'Recurring', 'התראות': 'Alerts',
  // Dashboard
  'חודש:': 'Month:', '📤 ייצוא דוח': '📤 Export report', 'Excel (לעריכה)': 'Excel (editable)', 'PDF (להדפסה)': 'PDF (printable)',
  'יתרה נטו': 'Net balance', 'כמה נשאר בפועל': 'What\'s actually left',
  'צפי רווח': 'Projected profit', 'כולל מה שצפוי': 'Including projected',
  'הכנסות': 'Income', 'נכנס מלקוחות': 'Received from clients', 'שולם בפועל ▼': 'Actually paid ▼',
  'צפוי מלקוחות': 'Expected from clients', 'טרם שולם ▼': 'Not yet paid ▼',
  'הוצאות': 'Expenses', 'הוצאות עסק': 'Business expenses', 'סה"כ החודש ▼': 'Total this month ▼',
  'הוצאות לפי קטגוריה': 'Expenses by category',
  'יצא לעובדים': 'Paid to employees', 'שולם בפועל': 'Actually paid',
  'צפוי לעובדים': 'Expected to employees', 'טרם שולם': 'Not yet paid',
  'סטטוס עובדים החודש': 'Employee status this month', 'מס': 'Tax',
  'מס על נכנס': 'Tax on received', 'מס צפוי': 'Projected tax', '% מס': 'Tax %',
  // Events
  'אירועים החודש': 'Events this month', '☰ רשימה': '☰ List', '📅 יומן': '📅 Calendar',
  '🔄 רענן': '🔄 Refresh', '+ אירוע ידני': '+ Manual event', 'טוען אירועים...': 'Loading events...',
  'מחיר ללקוח': 'Client price', 'עלות עובדים': 'Employee cost', 'רווח': 'Profit',
  'לחץ על ✏️ להוספת פרטים': 'Click ✏️ to add details', '(ללא שם)': '(No name)', 'היום': 'Today',
  'אין אירועים החודש. הוסף אירוע ידני או רענן את היומן': 'No events this month. Add a manual event or refresh the calendar',
  // Employees / Clients
  'הוסף עובד': 'Add employee', 'שם העובד': 'Employee name', 'תפקיד': 'Role', 'טלפון': 'Phone',
  '+ הוסף עובד': '+ Add employee', 'הוסף לקוח': 'Add client', 'שם הלקוח': 'Client name',
  'ח.פ / ע.מ': 'Business ID', '+ הוסף לקוח': '+ Add client', '+ הוסף': '+ Add',
  'לא נוספו עובדים': 'No employees added', 'אין אירועים החודש': 'No events this month',
  '+ הוסף אירוע': '+ Add event', 'שם האירוע': 'Event name', 'סכום ₪': 'Amount ₪',
  'היסטוריית:': 'History:', 'סה"כ': 'Total', 'שולם': 'Paid', 'יתרה': 'Balance',
  'אין אירועים': 'No events', 'מאירוע': 'from event',
  // Recurring
  'הוצאות קבועות': 'Recurring expenses', 'תיאור': 'Description', 'קטגוריה': 'Category', 'סכום': 'Amount',
  'הוסף הוצאה קבועה': 'Add recurring expense', 'אין הוצאות קבועות': 'No recurring expenses',
  // Profit First
  'פעמיים בחודש — הכנסות שנצברו מחולקות לחשבונות': 'Twice a month — accrued income split into accounts',
  'הכנסה לחלוקה': 'Income to allocate', 'נכנס מלקוחות החודש': 'Received from clients this month',
  'צפי רווח החודש': 'Projected profit this month', '💡 נלקח אוטומטית מ"צפי רווח"': '💡 Taken automatically from "Projected profit"',
  '💡 נלקח אוטומטית מ"נכנס מלקוחות"': '💡 Taken automatically from "Received from clients"',
  'הקצאה לחשבונות': 'Allocation to accounts', '✏️ ערוך אחוזים': '✏️ Edit percentages',
  'ערוך אחוזים (סה"כ = 100%)': 'Edit percentages (total = 100%)', 'שמור': 'Save', '✕ סגור': '✕ Close',
  // Alerts / status
  'בוצע תשלום': 'Payment made', 'בוצע תשלום + חשבונית מס': 'Payment made + tax invoice',
  'יצאה דרישת תשלום': 'Payment requested', 'לא יצאה דרישת תשלום': 'No payment requested',
  'ממתין': 'Pending', 'באיחור': 'Overdue',
  // Month at a glance
  'החודש במבט אחד': 'Month at a glance', 'נכנס': 'Received', 'סה"כ צפוי': 'Total expected',
  'סה"כ הוצאות': 'Total expenses', 'אין הכנסות החודש': 'No income this month', 'אין הוצאות החודש': 'No expenses this month',
  'הכנסה ידנית': 'Manual income', 'שכר עובדים': 'Employee wages', 'שולם החודש': 'Paid this month', 'נשאר ביד': 'Left over',
  'סמן שולם': 'Mark paid',
  'הסתר אירוע': 'Hide event', 'אירועים מוסתרים': 'Hidden events', 'שחזר': 'Restore', 'אין אירועים מוסתרים': 'No hidden events',
  // Modals
  'הכנסה': 'Income', 'הוצאה': 'Expense', 'ביטול': 'Cancel', 'מחק': 'Delete', 'הוסף': 'Add', 'עדכן': 'Update',
  'איפוס סיסמה': 'Reset password',
  'הכניסו את כתובת האימייל שלכם ונשלח קישור לאיפוס הסיסמה.': 'Enter your email and we\'ll send a password reset link.',
  'שלח קישור': 'Send link', 'סיסמה חדשה': 'New password', 'הכניסו שוב': 'Re-enter',
  'הכניסו סיסמה חדשה (לפחות 6 תווים).': 'Enter a new password (at least 6 characters).',
  'עדכן סיסמה': 'Update password', 'סגור': 'Close', 'שמור הגדרות': 'Save settings',
  // Settings
  '⚙️ הגדרות ואפשרויות': '⚙️ Settings & options', '🌐 שפה': '🌐 Language', 'שפת הממשק': 'Interface language',
  'תרגום מלא של הממשק יתווסף בקרוב': '', '🧾 אחוז מס ברירת מחדל': '🧾 Default tax rate',
  'אחוז המס שיחושב על הכנסות': 'Tax rate applied to income', '🔔 התראות': '🔔 Alerts',
  'הצג התראות על חובות ותשלומים': 'Show alerts for debts and payments', '🏢 פרטי עסק': '🏢 Business details',
  'שם העסק': 'Business name', 'שם העסק שלך': 'Your business name', '📄 מדיניות': '📄 Policies',
  'מדיניות פרטיות (Privacy Policy)': 'Privacy Policy', 'מדיניות החזרים (Refund Policy)': 'Refund Policy',
  'תנאי שימוש (Terms of Service)': 'Terms of Service',
  // Upgrade
  'שדרג לפרו': 'Upgrade to Pro', 'ניהול עובדים, לקוחות ואירועים זמין בתוכנית פרו בסך ₪16 לחודש': 'Employee, client and event management is available in the Pro plan for ₪16/month',
  'שדרג עכשיו →': 'Upgrade now →',
  // Plan badges
  'בסיסי': 'Basic', 'פרו ⭐': 'Pro ⭐', 'פג תוקף': 'Expired',
  // Misc
  '-- בחר --': '-- Select --', '— ללא לקוח —': '— No client —', 'אין פריטים': 'No items',
  'טוען...': 'Loading...', 'לחץ ▼': 'Click ▼',
  // Settings additions
  'אדמין — בדיקת גרסאות': 'Admin — test plans', 'אדמין (מלא)': 'Admin (full)',
  'החלף בין מסלולים כדי לבדוק איך האפליקציה נראית. לא משפיע על המנוי האמיתי שלך.': 'Switch between plans to test how the app looks. Doesn\'t affect your real subscription.',
  'עברית': 'Hebrew', 'שפה': 'Language', 'מדיניות': 'Policies', 'פרטי עסק': 'Business details',
  'אחוז מס ברירת מחדל': 'Default tax rate',
  // Event/modal additions
  'אירוע ידני': 'Manual event', 'הערות': 'Notes', 'פירוט': 'Details', 'סיכום': 'Summary',
  'עובדים באירוע': 'Event workers', 'פרטי אירוע': 'Event details', 'מחיר ללקוח (₪)': 'Client price (₪)',
  'סטטוס תשלום לקוח': 'Client payment status', 'רענן': 'Refresh', 'יומן': 'Calendar', 'רשימה': 'List',
  'תאריך': 'Date', 'סוג': 'Type', 'שם': 'Name', 'לקוח': 'Client',
  // Employee modal
  'עריכת פרטי עובד': 'Edit employee', 'מנהל': 'Manager', 'קבלן': 'Contractor', 'שכיר': 'Employee',
  'שעתי': 'Hourly', 'רשומות החודש': 'Records this month', 'הוסף רשומה': 'Add record', 'סכום חודשי': 'Monthly amount',
  '♻️ אפס הוצאות החודש': '♻️ Reset this month\'s expenses',
  // Profit First
  'ערוך אחוזים': 'Edit percentages', 'סה"כ:': 'Total:', 'סה"כ: ₪0 / חודש': 'Total: ₪0 / month',
  'נלקח אוטומטית מ"נכנס מלקוחות"': 'Taken automatically from "Received from clients"',
  // Categories (display only — value stays Hebrew in DB)
  'שירותים': 'Services', 'שכירות': 'Rent', 'ציוד': 'Equipment', 'שיווק': 'Marketing', 'אחר': 'Other',
  'ביטוח': 'Insurance', 'תוכנות': 'Software', 'רכב': 'Vehicle',
  // Plan names (standalone)
  'ניסיון': 'Trial', 'בסיסי ': 'Basic ', 'פרו': 'Pro'
};
// מיפוי הפוך לסטטוסים (אנגלית → עברית) לשמירה ב-DB
const STATUS_HE = {}; Object.keys(I18N).forEach(he => { if (I18N[he]) STATUS_HE[I18N[he]] = he; });
function t(s) { if (currentLang === 'en' && I18N[s] !== undefined && I18N[s] !== '') return I18N[s]; return s; }

let currentUser = null;
let cachedTx = [], cachedEmps = [], cachedEmpEvents = [], cachedClients = [];
let cachedEventDetails = [], cachedEventWorkers = [], cachedRecurring = [];
let gcalEvents = [], allRenderedEvents = [];
let profitBreakdownData = null;
let eventViewMode = 'list';
let modalWorkers = [], currentEditDetailId = null, currentEventDate = null, isNewManualEvent = false;
let lastSalary = 0;
let currentEmpId = null;
let userPlan = 'trial'; // trial, basic, pro
let trialDaysLeft = 30;

const fmt = n => '\u20aa' + Math.round(n).toLocaleString('he-IL');
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const getMonth = () => $('yearSel').value + '-' + $('monthSel').value.padStart(2, '0');
// מחזיר את פרטי האירועים של החודש הנבחר (משותף לכמה פונקציות)
const getMonthDetails = (month) => {
  const m = month || getMonth();
  // התאריך הוא מקור האמת: אם קיים event_date — משייכים לפיו בלבד.
  // שדה month משמש רק כגיבוי לרשומות ישנות שאין להן תאריך.
  const matching = cachedEventDetails.filter(d =>
    d.event_date ? d.event_date.slice(0, 7) === m : d.month === m
  );
  // סנן כפילויות שנוצרו מבאג אזור-זמן: אותו שם + אותו מחיר + תאריכים סמוכים = אירוע אחד
  const seen = [];
  const unique = [];
  for (const d of matching) {
    const dup = seen.find(s =>
      s.event_title === d.event_title &&
      (s.price || 0) === (d.price || 0) &&
      s.client_id === d.client_id &&
      Math.abs(dateDiffDays(s.event_date, d.event_date)) <= 2
    );
    if (!dup) { seen.push(d); unique.push(d); }
  }
  return unique;
};
// מספר ימים בין שני תאריכים (מחזיר 999 אם אחד חסר, כדי שלא ייחשבו סמוכים)
function dateDiffDays(a, b) {
  if (!a || !b) return 999;
  const da = new Date(a.slice(0, 10)), db = new Date(b.slice(0, 10));
  if (isNaN(da) || isNaN(db)) return 999;
  return Math.round((da - db) / 86400000);
}

// ── EXPORT (Excel / PDF) ──
function toggleExportMenu(e) { if (e) e.stopPropagation(); $('export-menu').classList.toggle('open'); }
function closeExportMenu() { $('export-menu').classList.remove('open'); }
document.addEventListener('click', function(e) {
  const menu = $('export-menu');
  if (menu && menu.classList.contains('open') && !menu.parentElement.contains(e.target)) menu.classList.remove('open');
});

// אוסף את נתוני החודש הנוכחי למבנה מסודר לייצוא
function collectReportData() {
  const month = getMonth();
  const monthTx = cachedTx.filter(t => t.month === month);
  const txIncome = monthTx.filter(t => t.type === 'income');
  const expense = monthTx.filter(t => t.type === 'expense');
  const monthDetails = getMonthDetails();
  const monthDetailIds = monthDetails.map(d => d.id);
  // הכנסות מאירועים ששולמו (כמו בדשבורד) — נספרות כהכנסה
  const isPaid = s => s === 'בוצע תשלום' || s === 'בוצע תשלום + חשבונית מס';
  const paidEvents = monthDetails.filter(d => d.price > 0 && isPaid(d.status));
  // רשימת הכנסות מאוחדת: עסקאות income + אירועים ששולמו
  const income = [
    ...txIncome.map(t => ({ description: t.description, category: t.category || '', amount: t.amount })),
    ...paidEvents.map(d => {
      const c = cachedClients.find(cl => cl.id === d.client_id);
      return { description: d.event_title || 'אירוע', category: c ? c.name : 'אירוע', amount: d.price || 0 };
    })
  ];
  // תשלומי עובדים
  const empPays = cachedEmpEvents.filter(e => e.month === month || (e.date && e.date.slice(0,7) === month));
  const workerPays = cachedEventWorkers.filter(w => monthDetailIds.includes(w.event_detail_id));
  // סיכומים
  const totalIncome = income.reduce((s, t) => s + t.amount, 0);
  const totalExpense = expense.reduce((s, t) => s + t.amount, 0);
  const totalEmpPay = empPays.reduce((s, e) => s + e.amount, 0) + workerPays.reduce((s, w) => s + w.amount, 0);
  const net = totalIncome - totalExpense - totalEmpPay;
  return { month, income, expense, empPays, workerPays, totalIncome, totalExpense, totalEmpPay, net };
}

// שם עובד לפי id
function empName(id) { const e = cachedEmps.find(m => m.id === id); return e ? e.name : '—'; }

function exportExcel() {
  if (typeof XLSX === 'undefined') { alert('ספריית הייצוא עדיין נטענת, נסה שוב בעוד רגע'); return; }
  const d = collectReportData();
  const wb = XLSX.utils.book_new();

  // גיליון סיכום
  const summary = [
    ['דוח חודשי — ' + d.month],
    [],
    ['סה"כ הכנסות', d.totalIncome],
    ['סה"כ הוצאות', d.totalExpense],
    ['סה"כ שכר עובדים', d.totalEmpPay],
    ['יתרה נטו', d.net]
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(summary), 'סיכום');

  // גיליון הכנסות
  const incRows = [['תיאור', 'קטגוריה', 'סכום', 'סטטוס']];
  d.income.forEach(t => incRows.push([t.description || '', t.category || '', t.amount, t.status || '']));
  incRows.push(['סה"כ', '', d.totalIncome, '']);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(incRows), 'הכנסות');

  // גיליון הוצאות
  const expRows = [['תיאור', 'קטגוריה', 'סכום']];
  d.expense.forEach(t => expRows.push([t.description || '', t.category || '', t.amount]));
  expRows.push(['סה"כ', '', d.totalExpense]);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(expRows), 'הוצאות');

  // גיליון שכר עובדים
  const empRows = [['עובד', 'אירוע', 'סכום', 'סטטוס']];
  d.empPays.forEach(e => empRows.push([empName(e.employee_id), e.event_name || '', e.amount, e.status || '']));
  d.workerPays.forEach(w => { const det = cachedEventDetails.find(x => x.id === w.event_detail_id); empRows.push([empName(w.employee_id), det ? det.event_title : '', w.amount, w.status || '']); });
  empRows.push(['סה"כ', '', d.totalEmpPay, '']);
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(empRows), 'שכר עובדים');

  XLSX.writeFile(wb, 'CashFlow_' + d.month + '.xlsx');
}

// הופך טקסט עברי לסדר נכון עבור jsPDF (שמצייר משמאל לימין ללא bidi).
// עברית מתהפכת, ורצפי אנגלית/מספרים נשמרים בכיוונם.
function pdfRTL(s) {
  s = String(s == null ? '' : s);
  if (!s) return '';
  const rev = [...s].reverse();
  const out = [], buf = [];
  const isLat = ch => /[A-Za-z0-9.,\/@:%\-]/.test(ch);
  for (const ch of rev) {
    if (isLat(ch)) buf.push(ch);
    else { if (buf.length) { out.push(...buf.reverse()); buf.length = 0; } out.push(ch); }
  }
  if (buf.length) out.push(...buf.reverse());
  return out.join('');
}

// טוען את הפונט העברי המוטמע ל-jsPDF (normal + bold — autoTable מצייר כותרות/סיכום ב-bold)
let _hebFontLoaded = false;
function ensureHebFont(doc) {
  if (!window.CF_HEB_FONT) return false;
  try {
    doc.addFileToVFS('DejaVuHeb.ttf', window.CF_HEB_FONT);
    doc.addFont('DejaVuHeb.ttf', 'DejaVuHeb', 'normal');
    doc.addFont('DejaVuHeb.ttf', 'DejaVuHeb', 'bold');
    _hebFontLoaded = true;
    return true;
  } catch (e) { return false; }
}

function exportPDF() {
  if (typeof window.jspdf === 'undefined') { alert('ספריית הייצוא עדיין נטענת, נסה שוב בעוד רגע'); return; }
  const d = collectReportData();
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const hasHeb = ensureHebFont(doc);
  const F = hasHeb ? 'DejaVuHeb' : 'helvetica';
  // עוזר: טקסט לתא — הופך עברית אם הפונט נטען
  const R = s => hasHeb ? pdfRTL(s) : String(s == null ? '' : s);

  // כותרת (מיושרת לימין)
  doc.setFont(F);
  doc.setFontSize(18);
  const pageW = doc.internal.pageSize.getWidth();
  doc.text(R('דוח CashFlow — ' + d.month), pageW - 14, 20, { align: 'right' });

  // הגדרות משותפות לטבלאות: פונט עברי, יישור לימין, עם שורת סיכום אופציונלית
  const tableOpts = (head, body, fill, footRow) => {
    const opts = {
      head: [head.map(R)],
      body: body.map(row => row.map(R)),
      theme: 'grid',
      styles: { font: F, halign: 'right', fontSize: 10 },
      headStyles: { font: F, fillColor: fill, halign: 'right', textColor: [255,255,255] },
      columnStyles: { 0: { halign: 'right' } }
    };
    if (footRow) {
      opts.foot = [footRow.map(R)];
      opts.footStyles = { font: F, fillColor: [237,240,247], textColor: [20,20,30], halign: 'right', fontStyle: 'bold' };
    }
    return opts;
  };

  // טבלת סיכום
  doc.autoTable(Object.assign(tableOpts(
    ['סיכום', 'סכום (₪)'],
    [
      ['סה"כ הכנסות', fmtNum(d.totalIncome)],
      ['סה"כ הוצאות', fmtNum(d.totalExpense)],
      ['סה"כ שכר', fmtNum(d.totalEmpPay)],
      ['יתרה נטו', fmtNum(d.net)]
    ], [37, 99, 235]), { startY: 28 }));

  // הכנסות
  if (d.income.length) {
    doc.autoTable(Object.assign(tableOpts(
      ['הכנסות — תיאור', 'קטגוריה', 'סכום'],
      d.income.map(t => [t.description || '', t.category || '', fmtNum(t.amount)]),
      [13, 156, 110],
      ['סה"כ הכנסות', '', fmtNum(d.totalIncome)]), { startY: doc.lastAutoTable.finalY + 8 }));
  }
  // הוצאות
  if (d.expense.length) {
    doc.autoTable(Object.assign(tableOpts(
      ['הוצאות — תיאור', 'קטגוריה', 'סכום'],
      d.expense.map(t => [t.description || '', t.category || '', fmtNum(t.amount)]),
      [220, 38, 38],
      ['סה"כ הוצאות', '', fmtNum(d.totalExpense)]), { startY: doc.lastAutoTable.finalY + 8 }));
  }
  // שכר
  const payRows = [];
  d.empPays.forEach(e => payRows.push([empName(e.employee_id), e.event_name || '', fmtNum(e.amount)]));
  d.workerPays.forEach(w => { const det = cachedEventDetails.find(x => x.id === w.event_detail_id); payRows.push([empName(w.employee_id), det ? det.event_title : '', fmtNum(w.amount)]); });
  if (payRows.length) {
    doc.autoTable(Object.assign(tableOpts(
      ['שכר — עובד', 'אירוע', 'סכום'],
      payRows, [124, 58, 237],
      ['סה"כ שכר', '', fmtNum(d.totalEmpPay)]), { startY: doc.lastAutoTable.finalY + 8 }));
  }

  doc.save('CashFlow_' + d.month + '.pdf');
}

// עוזר: מספר עם פסיקים בלי סמל מטבע (ל-PDF)
function fmtNum(n) { return (n || 0).toLocaleString('en-US'); }

// ── BANK IMPORT ──
// מילון זיהוי קטגוריה לפי מילות מפתח בתיאור
const BANK_CATEGORIES = [
  { cat: 'שכירות', keys: ['שכירות', 'שכ"ד', 'שכ״ד', 'דירה', 'משרד'] },
  { cat: 'ביטוח', keys: ['ביטוח', 'הראל', 'כלל', 'מגדל', 'הפניקס', 'מנורה', 'איילון'] },
  { cat: 'רכב', keys: ['דלק', 'פז', 'סונול', 'דור אלון', 'ten', 'טן', 'חניון', 'חניה', 'כביש 6', 'רכב', 'פנגו', 'pango', 'cellopark', 'סלופארק'] },
  { cat: 'תוכנות', keys: ['google', 'microsoft', 'adobe', 'zoom', 'apple', 'aws', 'openai', 'תוכנה', 'מנוי', 'netflix', 'spotify'] },
  { cat: 'שיווק', keys: ['facebook', 'meta', 'instagram', 'tiktok', 'שיווק', 'פרסום', 'קמפיין', 'google ads'] },
  { cat: 'ציוד', keys: ['ציוד', 'מחשב', 'ksp', 'באג', 'ivory', 'אייבורי', 'ליין'] },
  { cat: 'אחר', keys: ['wolt', 'וולט', 'מסעדה', 'קפה', 'בית קפה', 'סופר', 'שופרסל', 'רמי לוי', 'דמי כרטיס', 'ביט', 'bit'] },
  { cat: 'שירותים', keys: ['רואה חשבון', 'עורך דין', 'ייעוץ', 'שירות'] }
];
// זיהוי חכם של קטגוריה לפי התיאור
function guessCategory(desc) {
  const d = (desc || '').toLowerCase();
  for (const c of BANK_CATEGORIES) {
    if (c.keys.some(k => d.includes(k.toLowerCase()))) return c.cat;
  }
  return 'אחר';
}

let bankParsedRows = [];

function handleBankFile(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const bytes = new Uint8Array(e.target.result);
      // בדוק אם זה HTML (בנק לאומי מייצא HTML בשם .xls)
      const head = new TextDecoder('utf-8').decode(bytes.slice(0, 500)).toLowerCase();
      if (head.includes('<html') || head.includes('<table') || head.includes('<!doctype')) {
        const fullText = new TextDecoder('utf-8').decode(bytes);
        parseLeumiHtml(fullText);
      } else {
        // Excel אמיתי
        if (typeof XLSX === 'undefined') { alert('ספריית הקריאה עדיין נטענת, נסה שוב בעוד רגע'); return; }
        const wb = XLSX.read(bytes, { type: 'array' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        parseBankRows(rows);
      }
    } catch (err) {
      alert('שגיאה בקריאת הקובץ: ' + err.message);
    }
    input.value = '';
  };
  reader.readAsArrayBuffer(file);
}

// קורא ייעודי לקובץ HTML של בנק לאומי (כרטיס אשראי / עו"ש)
function parseLeumiHtml(htmlText) {
  bankParsedRows = [];
  const doc = new DOMParser().parseFromString(htmlText, 'text/html');
  const trs = doc.querySelectorAll('tr');
  trs.forEach(tr => {
    const cells = Array.from(tr.querySelectorAll('td')).map(td => (td.textContent || '').replace(/\s+/g, ' ').trim());
    const nonEmpty = cells.filter(c => c);
    if (nonEmpty.length < 3) return;
    // שורת נתונים: התא הראשון הוא תאריך DD/MM/YY
    if (!/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(nonEmpty[0])) return;
    const date = nonEmpty[0];
    const desc = nonEmpty[1] || '';
    // מצא את הסכום — התא הבא שהוא מספר
    let amount = 0;
    for (let i = 2; i < nonEmpty.length; i++) {
      const num = parseFloat(nonEmpty[i].replace(/[^\d.-]/g, ''));
      if (!isNaN(num) && num > 0) { amount = num; break; }
    }
    if (!desc || amount <= 0) return;
    // כרטיס אשראי — הכל הוצאות
    bankParsedRows.push({
      include: true, date, desc, amount, type: 'expense',
      category: guessCategory(desc), mode: guessMode(desc)
    });
  });

  if (!bankParsedRows.length) {
    alert('לא זוהו עסקאות בקובץ. ייתכן שהפורמט שונה — צור קשר לתמיכה.');
    return;
  }
  renderBankPreview();
  $('bank-modal').style.display = 'flex';
}

// מזהה עמודות (תאריך/תיאור/חובה/זכות/סכום) ובונה רשומות
function parseBankRows(rows) {
  bankParsedRows = [];
  // מצא את שורת הכותרות (הראשונה עם כמה תאים לא-ריקים)
  let headerIdx = rows.findIndex(r => r.filter(c => String(c).trim()).length >= 3);
  if (headerIdx < 0) headerIdx = 0;
  const headers = rows[headerIdx].map(h => String(h).toLowerCase());
  // אתר עמודות לפי מילות מפתח נפוצות בבנקים ישראליים
  const findCol = (...keys) => headers.findIndex(h => keys.some(k => h.includes(k)));
  const descCol = findCol('תיאור', 'פרטים', 'פעולה', 'תנועה', 'ספק');
  const debitCol = findCol('חובה', 'חיוב');
  const creditCol = findCol('זכות', 'זיכוי');
  const amountCol = findCol('סכום', 'סך');
  const dateCol = findCol('תאריך', 'ערך');

  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || !r.filter(c => String(c).trim()).length) continue;
    const desc = descCol >= 0 ? String(r[descCol] || '').trim() : '';
    if (!desc) continue;
    let amount = 0, type = 'expense';
    // אם יש עמודות חובה/זכות נפרדות
    if (debitCol >= 0 || creditCol >= 0) {
      const debit = parseFloat(String(r[debitCol] || '0').replace(/[^\d.-]/g, '')) || 0;
      const credit = parseFloat(String(r[creditCol] || '0').replace(/[^\d.-]/g, '')) || 0;
      if (credit > 0) { amount = credit; type = 'income'; }
      else { amount = debit; type = 'expense'; }
    } else if (amountCol >= 0) {
      // עמודת סכום אחת — שלילי = הוצאה, חיובי = הכנסה
      const val = parseFloat(String(r[amountCol] || '0').replace(/[^\d.-]/g, '')) || 0;
      amount = Math.abs(val);
      type = val >= 0 ? 'income' : 'expense';
    }
    if (amount <= 0) continue;
    bankParsedRows.push({
      include: true,
      date: dateCol >= 0 ? String(r[dateCol] || '').trim() : '',
      desc, amount, type,
      category: type === 'expense' ? guessCategory(desc) : 'אחר',
      mode: guessMode(desc)
    });
  }

  if (!bankParsedRows.length) {
    alert('לא זוהו רשומות בקובץ. ודא שהקובץ מכיל עמודות של תיאור וסכום (או חובה/זכות).');
    return;
  }
  renderBankPreview();
  $('bank-modal').style.display = 'flex';
}

// זיהוי אוטומטי: האם ההוצאה שייכת לעסק או לבית (ניחוש לפי מילות מפתח)
const HOME_KEYWORDS = [
  // סופרים ומזון
  'סופר', 'שופרסל', 'רמי לוי', 'ויקטורי', 'טיב טעם', 'יינות ביתן', 'אושר עד', 'מגה', 'יוחננוף', 'am:pm', 'טסקו',
  'wolt', 'וולט', 'tenbis', 'תן ביס', '10bis', 'משלוח', 'מקדונלד', 'burger', 'דומינו', 'פיצה',
  // בית ושירותים
  'ארנונה', 'עיריי', 'חשמל', 'מי ', 'מים', 'גז ', 'בזק', 'hot', 'yes', 'פרטנר', 'סלקום', 'גולן טלקום', 'רמי לוי תקשורת',
  'משכנתא', 'שכר דירה', 'ועד בית',
  // בריאות
  'בית מרקחת', 'סופר פארם', 'ניו פארם', 'מכבי', 'כללית', 'מאוחדת', 'לאומית', 'קופת חולים', 'ביטוח בריאות', 'ביטוח לאומי',
  // ביגוד ופנאי
  'זארה', 'zara', 'קסטרו', 'castro', 'fox', 'h&m', 'רנואר', 'גולף', 'אמריקן איגל',
  'netflix', 'נטפליקס', 'spotify', 'ספוטיפיי', 'disney', 'סינמה', 'יס פלנט', 'רב חן',
  // חינוך וילדים (ללא "בית ספר"/"מתנ״ס" — אלה לקוחות של העסק)
  'גן ילדים', 'צהרון', 'חוג'
];
const BIZ_KEYWORDS = [
  // ציוד ומקצועי
  'ksp', 'באג', 'ivory', 'אייבורי', 'ליין', 'הגברה', 'תאורה', 'במה', 'מחסן', 'השכרת ציוד',
  // תוכנות ושירותים עסקיים
  'google', 'microsoft', 'adobe', 'zoom', 'aws', 'openai', 'canva', 'dropbox', 'slack', 'monday',
  'רואה חשבון', 'עורך דין', 'יועץ', 'ייעוץ',
  // שיווק
  'facebook', 'meta', 'instagram', 'tiktok', 'google ads', 'שיווק', 'פרסום', 'קמפיין',
  // חניה ונסיעות עבודה
  'פנגו', 'pango', 'cellopark', 'סלופארק', 'חניון', 'כביש 6',
  // עסקי
  'ביטוח עסק', 'מס הכנסה', 'ביטוח לאומי עצמאי'
];
function guessMode(desc) {
  const d = (desc || '').toLowerCase();
  const hitHome = HOME_KEYWORDS.some(k => d.includes(k.toLowerCase()));
  const hitBiz = BIZ_KEYWORDS.some(k => d.includes(k.toLowerCase()));
  if (hitBiz && !hitHome) return 'business';
  if (hitHome && !hitBiz) return 'home';
  // לא ברור (או שניהם) — ברירת מחדל: המצב שבו המשתמש נמצא כרגע
  return appMode;
}

function renderBankPreview() {
  const bizCats = ['שירותים', 'שכירות', 'ציוד', 'שיווק', 'ביטוח', 'תוכנות', 'רכב', 'אחר'];
  $('bank-preview').innerHTML =
    '<table style="width:100%;font-size:12.5px"><thead><tr>' +
    '<th style="width:30px"><input type="checkbox" checked onchange="toggleAllBank(this)"></th>' +
    '<th>תיאור</th><th>סכום</th><th>שיוך</th><th>סוג</th><th>קטגוריה</th></tr></thead><tbody>' +
    bankParsedRows.map((row, i) => {
      const cats = row.mode === 'home' ? HOME_CATEGORIES : bizCats;
      if (!cats.includes(row.category)) row.category = cats[cats.length - 1];
      return '<tr>' +
      '<td><input type="checkbox" ' + (row.include ? 'checked' : '') + ' onchange="bankParsedRows[' + i + '].include=this.checked"></td>' +
      '<td>' + esc(row.desc) + (row.date ? '<div style="font-size:10px;color:var(--muted)">' + esc(row.date) + '</div>' : '') + '</td>' +
      '<td style="font-weight:600;color:' + (row.type === 'income' ? 'var(--green)' : 'var(--red)') + '">' + fmt(row.amount) + '</td>' +
      '<td><select onchange="setBankRowMode(' + i + ',this.value)" style="font-size:12px;padding:3px">' +
        '<option value="business"' + (row.mode === 'business' ? ' selected' : '') + '>🏢 עסק</option>' +
        '<option value="home"' + (row.mode === 'home' ? ' selected' : '') + '>🏠 בית</option></select></td>' +
      '<td><select onchange="bankParsedRows[' + i + '].type=this.value" style="font-size:12px;padding:3px"><option value="income"' + (row.type === 'income' ? ' selected' : '') + '>הכנסה</option><option value="expense"' + (row.type === 'expense' ? ' selected' : '') + '>הוצאה</option></select></td>' +
      '<td><select onchange="bankParsedRows[' + i + '].category=this.value" style="font-size:12px;padding:3px">' + cats.map(c => '<option value="' + c + '"' + (row.category === c ? ' selected' : '') + '>' + c + '</option>').join('') + '</select></td>' +
      '</tr>';
    }).join('') + '</tbody></table>';
}

// שינוי שיוך שורה (עסק/בית) — מרנדר מחדש כדי להתאים את רשימת הקטגוריות
function setBankRowMode(i, mode) {
  bankParsedRows[i].mode = mode;
  const cats = mode === 'home' ? HOME_CATEGORIES : ['שירותים', 'שכירות', 'ציוד', 'שיווק', 'ביטוח', 'תוכנות', 'רכב', 'אחר'];
  if (!cats.includes(bankParsedRows[i].category)) {
    bankParsedRows[i].category = mode === 'home' ? guessCategory(bankParsedRows[i].desc) : 'אחר';
    if (!cats.includes(bankParsedRows[i].category)) bankParsedRows[i].category = 'אחר';
  }
  renderBankPreview();
}

function toggleAllBank(cb) {
  bankParsedRows.forEach(r => r.include = cb.checked);
  renderBankPreview();
}

function closeBankModal() { $('bank-modal').style.display = 'none'; bankParsedRows = []; }

async function importBankRows() {
  const toImport = bankParsedRows.filter(r => r.include);
  if (!toImport.length) { $('bank-msg').textContent = 'לא נבחרו רשומות'; $('bank-msg').className = 'msg err'; return; }
  const btn = $('bank-import-btn'); btn.disabled = true; btn.textContent = '⏳ מייבא...';
  const month = getMonth();
  const build = r => ({
    user_id: currentUser.id, month,
    description: r.desc, amount: r.amount, type: r.type,
    category: r.type === 'expense' ? r.category : 'אחר',
    account_id: defaultAccountFor(r.mode)
  });
  // פיצול לפי שיוך: עסק → transactions, בית → home_transactions
  const bizRecords = toImport.filter(r => r.mode !== 'home').map(build);
  const homeRecords = toImport.filter(r => r.mode === 'home').map(build);

  let err = null;
  if (bizRecords.length) {
    const res = await sb.from('transactions').insert(bizRecords);
    if (res.error) err = res.error;
  }
  if (!err && homeRecords.length) {
    const res = await sb.from('home_transactions').insert(homeRecords);
    if (res.error) err = res.error;
  }

  btn.disabled = false; btn.textContent = 'ייבא רשומות מסומנות';
  if (err) { $('bank-msg').textContent = 'שגיאה: ' + err.message; $('bank-msg').className = 'msg err'; return; }
  closeBankModal();
  await loadAll();
  const parts = [];
  if (bizRecords.length) parts.push(bizRecords.length + ' לעסק');
  if (homeRecords.length) parts.push(homeRecords.length + ' לבית');
  alert('✅ יובאו ' + toImport.length + ' רשומות (' + parts.join(', ') + ')');
}

const HEB_DAYS = ['\u05e8\u05d0\u05e9\u05d5\u05df','\u05e9\u05e0\u05d9','\u05e9\u05dc\u05d9\u05e9\u05d9','\u05e8\u05d1\u05d9\u05e2\u05d9','\u05d7\u05de\u05d9\u05e9\u05d9','\u05e9\u05d9\u05e9\u05d9','\u05e9\u05d1\u05ea'];
const HEB_MON = ['\u05d9\u05e0\u05d5\u05d0\u05e8','\u05e4\u05d1\u05e8\u05d5\u05d0\u05e8','\u05de\u05e8\u05e5','\u05d0\u05e4\u05e8\u05d9\u05dc','\u05de\u05d0\u05d9','\u05d9\u05d5\u05e0\u05d9','\u05d9\u05d5\u05dc\u05d9','\u05d0\u05d5\u05d2\u05d5\u05e1\u05d8','\u05e1\u05e4\u05d8\u05de\u05d1\u05e8','\u05d0\u05d5\u05e7\u05d8\u05d5\u05d1\u05e8','\u05e0\u05d5\u05d1\u05de\u05d1\u05e8','\u05d3\u05e6\u05de\u05d1\u05e8'];
const ENG_MON = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MON = i => currentLang === 'en' ? ENG_MON[i] : HEB_MON[i];
const ENG_DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

// ── AUTH ──
let authMode = 'login';

function toggleConfirm() {
  const inp = document.getElementById('auth-confirm');
  const btn = inp.nextElementSibling;
  if (!inp) return;
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '🙈'; }
  else { inp.type = 'password'; btn.textContent = '👁️'; }
}

function togglePass() {
  const inp = $('auth-password');
  const btn = $('eye-btn');
  if (inp.type === 'password') { inp.type = 'text'; btn.textContent = '\u05d4\u05e1\u05ea\u05e8'; }
  else { inp.type = 'password'; btn.textContent = '\u05d4\u05e6\u05d2'; }
}

function switchAuthTab(mode) {
  authMode = mode;
  $('confirm-password-field').style.display = mode === 'signup' ? 'block' : 'none';
  document.querySelectorAll('.auth-tab').forEach((t, i) => {
    t.classList.toggle('active', (mode === 'login' && i === 0) || (mode === 'signup' && i === 1));
  });
  if (mode === 'login') {
    $('auth-heading').textContent = 'ברוכים הבאים חזרה';
    $('auth-subheading').textContent = 'היכנסו לחשבון שלכם כדי להמשיך';
    $('auth-btn').textContent = 'כניסה לחשבון';
  } else {
    $('auth-heading').textContent = 'פתחו חשבון חינם';
    $('auth-subheading').textContent = '30 יום ניסיון — ללא כרטיס אשראי';
    $('auth-btn').textContent = 'התחילו עכשיו';
  }
  $('auth-msg').className = 'msg';
}

async function doAuth() {
  const email = $('auth-email').value.trim();
  const password = $('auth-password').value;
  if (!email || !password) { showMsg('נא למלא אימייל וסיסמה', 'err'); return; }
  if (authMode === 'signup') {
    const confirm = $('auth-confirm').value;
    if (password.length < 6) { showMsg('הסיסמה חייבת להכיל לפחות 6 תווים', 'err'); return; }
    if (password !== confirm) { showMsg('הסיסמאות אינן תואמות', 'err'); return; }
  }
  const btnLabel = $('auth-btn').textContent;
  $('auth-btn').disabled = true; $('auth-btn').textContent = '⏳ רגע...';
  const res = authMode === 'login'
    ? await sb.auth.signInWithPassword({ email, password })
    : await sb.auth.signUp({ email, password });
  $('auth-btn').disabled = false;
  $('auth-btn').textContent = btnLabel;
  if (res.error) { showMsg(res.error.message, 'err'); return; }
  if (authMode === 'signup' && !res.data.session) { showMsg('✅ נשלח מייל אישור! בדקו את תיבת הדואר', 'ok'); return; }
  enterApp(res.data.user);
}

function showMsg(t, type) { const m = $('auth-msg'); m.textContent = t; m.className = 'msg ' + type; }
async function logout() { await sb.auth.signOut(); $('auth-screen').style.display = 'flex'; $('app-screen').style.display = 'none'; currentUser = null; }

// ── FORGOT PASSWORD ──
function showForgot() {
  const emailVal = $('auth-email').value.trim();
  if (emailVal) $('forgot-email').value = emailVal;
  $('forgot-msg').className = 'msg';
  $('forgot-modal').style.display = 'flex';
}
function closeForgot() { $('forgot-modal').style.display = 'none'; }
async function sendReset() {
  const email = $('forgot-email').value.trim();
  if (!email) { const m=$('forgot-msg'); m.textContent='נא להכניס אימייל'; m.className='msg err'; return; }
  $('forgot-btn').disabled = true; $('forgot-btn').textContent = '⏳ שולח...';
  const { error } = await sb.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + window.location.pathname
  });
  $('forgot-btn').disabled = false; $('forgot-btn').textContent = 'שלח קישור';
  const m = $('forgot-msg');
  if (error) { m.textContent = error.message; m.className = 'msg err'; }
  else { m.textContent = '✅ נשלח! בדקו את תיבת הדואר'; m.className = 'msg ok'; setTimeout(closeForgot, 3000); }
}

// ── SETTINGS MENU ──
function toggleSettingsMenu(e) {
  if (e) e.stopPropagation();
  const menu = $('settings-menu'), btn = $('settings-btn');
  const isOpen = menu.classList.contains('open');
  if (isOpen) { menu.classList.remove('open'); return; }
  // מקם את התפריט מתחת לאייקון, מיושר לימין שלו, ובתוך גבולות המסך
  const rect = btn.getBoundingClientRect();
  menu.style.top = (rect.bottom + 8) + 'px';
  // יישור הקצה הימני של התפריט לקצה הימני של האייקון
  let rightEdge = rect.right;
  let leftPos = rightEdge - 240;
  if (leftPos < 8) leftPos = 8; // אל תצא משמאל המסך
  menu.style.left = leftPos + 'px';
  menu.classList.add('open');
}
function closeSettingsMenu() { $('settings-menu').classList.remove('open'); }
// סגירה בלחיצה מחוץ לתפריט
document.addEventListener('click', function(e) {
  const menu = $('settings-menu'), btn = $('settings-btn');
  if (menu && menu.classList.contains('open') && !menu.contains(e.target) && e.target !== btn) {
    menu.classList.remove('open');
  }
});
function openSettings() {
  // טען ערכים נוכחיים
  const taxEl = $('tax-rate-db'); if (taxEl) $('settings-tax').value = taxEl.value;
  const savedBiz = localStorage.getItem('cf_bizname'); if (savedBiz) $('settings-bizname').value = savedBiz;
  const savedNotif = localStorage.getItem('cf_notif'); $('settings-notif').checked = savedNotif !== 'off';
  // סקשן אדמין — הצג רק לאדמינים, וסמן את הבחירה הנוכחית
  const adminSec = $('admin-section');
  if (adminSec) {
    adminSec.style.display = isAdmin() ? 'block' : 'none';
    if (isAdmin()) {
      ['off','trial','basic','pro'].forEach(p => {
        const btn = $('admin-plan-' + p);
        if (btn) btn.classList.toggle('active', (p === 'off' && !adminPlanOverride) || p === adminPlanOverride);
      });
    }
  }
  $('settings-msg').className = 'msg';
  // אכלוס בורר חודש התחלת השימוש
  const smSel = $('settings-start-month'), sySel = $('settings-start-year');
  if (smSel) smSel.innerHTML = '<option value="">— ללא הגבלה —</option>' + HEB_MON.map((n, i) => '<option value="' + String(i + 1).padStart(2, '0') + '">' + n + '</option>').join('');
  if (sySel) { const cy = new Date().getFullYear(); sySel.innerHTML = ''; for (let y = cy - 3; y <= cy + 1; y++) sySel.innerHTML += '<option value="' + y + '">' + y + '</option>'; }
  const smVal = getStartMonth();
  if (smVal) { if (smSel) smSel.value = smVal.slice(5, 7); if (sySel) sySel.value = smVal.slice(0, 4); }
  else { if (smSel) smSel.value = ''; if (sySel) sySel.value = String(new Date().getFullYear()); }
  const curTheme = localStorage.getItem('cf_theme') || 'classic';
  ['classic', 'warm', 'purple'].forEach(name => { const b = $('theme-' + name); if (b) b.classList.toggle('active', name === curTheme); });
  $('settings-modal').style.display = 'flex';
}

// החלפת ערכת צבעים
const CF_THEMES = ['classic', 'warm', 'purple'];
function setTheme(t) {
  if (t === 'classic') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('cf_theme', t);
  CF_THEMES.forEach(name => { const b = $('theme-' + name); if (b) b.classList.toggle('active', name === t); });
}
function closeSettings() { $('settings-modal').style.display = 'none'; }

// אדמין — החלף מסלול תצוגה לבדיקה
function setAdminPlan(plan) {
  adminPlanOverride = plan;
  if (plan) localStorage.setItem('cf_admin_override', plan);
  else localStorage.removeItem('cf_admin_override');
  // עדכן את המסלול הפעיל ורענן
  userPlan = plan || 'pro';
  // סמן כפתור פעיל
  ['off','trial','basic','pro'].forEach(p => {
    const btn = $('admin-plan-' + p);
    if (btn) btn.classList.toggle('active', (p === 'off' && !plan) || p === plan);
  });
  updatePlanUI();
  if (typeof renderAll === 'function') renderAll();
}

let currentLang = localStorage.getItem('cf_lang') || 'he';
// מצב האפליקציה: 'business' (עסק) או 'home' (בית)
let appMode = localStorage.getItem('cf_mode') || 'business';
// שמות טבלאות לפי מצב
const TX_TABLE = () => appMode === 'home' ? 'home_transactions' : 'transactions';
const REC_TABLE = () => appMode === 'home' ? 'home_recurring' : 'recurring_expenses';

// מחיל תרגום על אלמנט בודד וילדיו (טקסט + placeholder)
function translateNode(root) {
  // טקסטים בתוך אלמנטים (text nodes)
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const textNodes = [];
  let n; while (n = walker.nextNode()) textNodes.push(n);
  textNodes.forEach(node => {
    const orig = node.nodeValue;
    if (orig == null) return;
    const trimmed = orig.trim();
    if (!trimmed) return;
    // דלג על טקסט בתוך script/style
    const pn = node.parentNode;
    if (pn && (pn.nodeName === 'SCRIPT' || pn.nodeName === 'STYLE')) return;
    // שמור את המקור הראשוני כדי לאפשר חזרה לעברית
    if (!node._origText) node._origText = orig;
    const origFull = node._origText;
    if (currentLang !== 'en') { node.nodeValue = origFull; return; }
    // התאמה מדויקת תחילה
    const base = origFull.trim();
    if (I18N[base] !== undefined && I18N[base] !== '') {
      node.nodeValue = origFull.replace(base, I18N[base]);
      return;
    }
    // התאמה עם קידומת emoji/סמלים: "💰 יתרה נטו" → emoji + תרגום
    const m = base.match(/^([^\u0590-\u05FFa-zA-Z]*)(.+)$/);
    if (m) {
      const prefix = m[1], rest = m[2].trim();
      if (I18N[rest] !== undefined && I18N[rest] !== '') {
        node.nodeValue = origFull.replace(base, prefix + I18N[rest]);
        return;
      }
    }
    node.nodeValue = origFull;
  });
  // placeholders
  root.querySelectorAll('[placeholder]').forEach(el => {
    if (!el._origPlaceholder) el._origPlaceholder = el.getAttribute('placeholder');
    const base = el._origPlaceholder;
    el.setAttribute('placeholder', currentLang === 'en' && I18N[base] ? I18N[base] : base);
  });
}

// ── מצב עסק/בית ──
// ── קטגוריות לפי מצב ──
const BIZ_CATEGORIES = ['שירותים', 'שכירות', 'ציוד', 'שיווק', 'אחר'];
const HOME_CATEGORIES = ['אוכל', 'רכב', 'קבועות (בית)', 'בריאות', 'חינוך', 'אישי', 'בילויים', 'ביגוד', 'חיסכון', 'אחר'];
function populateCategories() {
  const cats = appMode === 'home' ? HOME_CATEGORIES : BIZ_CATEGORIES;
  const sel = $('t-cat');
  if (sel) {
    const cur = sel.value;
    sel.innerHTML = cats.map(c => '<option value="' + c + '">' + c + '</option>').join('');
    if (cats.includes(cur)) sel.value = cur;
  }
}

function applyModeVisibility() {
  // הצג/הסתר טאבים ופריטי ניווט לפי המצב
  document.querySelectorAll('[data-mode]').forEach(el => {
    el.style.display = el.getAttribute('data-mode') === appMode ? '' : 'none';
  });
  // עדכן כפתורי המתג
  if ($('mode-business')) $('mode-business').classList.toggle('active', appMode === 'business');
  if ($('mode-home')) $('mode-home').classList.toggle('active', appMode === 'home');
  // עדכן את רשימת הקטגוריות בטופס ההוצאות לפי המצב
  populateCategories();
  // רקע חמים במצב בית
  const scr = $('app-screen');
  if (scr) scr.classList.toggle('home-mode', appMode === 'home');
  // הסתר את כרטיס היתרה/צפי-רווח העסקי במצב בית
  const bizHero = $('biz-hero-balance');
  if (bizHero) bizHero.style.display = appMode === 'home' ? 'none' : '';
  const pb = $('profit-breakdown');
  if (pb && appMode === 'home') pb.style.display = 'none';
  // חייב לרוץ אחרי data-mode — אחרת טאבים אדמין-בלבד היו נחשפים שוב
  applyPlanVisibility();
}

function setMode(mode) {
  if (mode === appMode) return;
  appMode = mode;
  localStorage.setItem('cf_mode', mode);
  applyModeVisibility();
  // אם העמוד הנוכחי לא זמין במצב החדש — חזור לדשבורד
  const activePage = document.querySelector('.page.active');
  const activeId = activePage ? activePage.id.replace('page-', '') : '';
  const businessOnly = ['ops', 'profitfirst', 'alerts', 'equipment'];
  const homeOnly = ['goals', 'advisor'];
  const invalid = (mode === 'home' && businessOnly.includes(activeId)) ||
                  (mode === 'business' && homeOnly.includes(activeId)) ||
                  (activeId && pageAccess(activeId) === 'blocked');
  if (invalid || !activePage) {
    const dashBtn = document.querySelector('.tab[onclick*="dashboard"]');
    showPage('dashboard', dashBtn);
  }
  // טען מחדש את הנתונים של המצב הפעיל
  if (currentUser && typeof loadAll === 'function') {
    loadRecurring().then(() => loadAll());
  }
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('cf_lang', lang);
  if ($('lang-he')) $('lang-he').classList.toggle('active', lang === 'he');
  if ($('lang-en')) $('lang-en').classList.toggle('active', lang === 'en');
  // כיוון הדף
  document.documentElement.setAttribute('dir', lang === 'en' ? 'ltr' : 'rtl');
  document.documentElement.setAttribute('lang', lang === 'en' ? 'en' : 'he');
  // תרגם את כל ה-DOM הסטטי
  translateNode(document.body);
  // רנדר מחדש את התצוגות הדינמיות
  if (currentUser && typeof renderAll === 'function') {
    renderAll();
    if (typeof renderEventsList === 'function') renderEventsList();
    if (typeof renderRecurring === 'function') renderRecurring();
    if (typeof renderClientsList === 'function') renderClientsList();
    if (typeof renderEmpCards === 'function') renderEmpCards();
    if (typeof updatePlanUI === 'function') updatePlanUI();
    if (typeof initMonths === 'function') initMonths();
    // תרגם שוב אחרי הרינדור הדינמי (כדי לתפוס טקסט שנוצר ע"י ה-render)
    translateNode(document.body);
  }
}

function saveSettings() {
  // אחוז מס — סנכרן לשדה הראשי
  const taxVal = $('settings-tax').value;
  const taxDb = $('tax-rate-db'), taxMain = $('tax-rate');
  if (taxDb) taxDb.value = taxVal;
  if (taxMain) taxMain.value = taxVal;
  // פרטי עסק + התראות → localStorage
  localStorage.setItem('cf_bizname', $('settings-bizname').value.trim());
  localStorage.setItem('cf_notif', $('settings-notif').checked ? 'on' : 'off');
  // רענן חישובים
  if (typeof renderAll === 'function') renderAll();
  const m = $('settings-msg');
  m.textContent = '✅ ההגדרות נשמרו'; m.className = 'msg ok';
  setTimeout(closeSettings, 1200);
}

// ── CHANGE PASSWORD (logged-in user) ──
function openChangePassword() {
  $('chpass-new').value = ''; $('chpass-confirm').value = '';
  $('chpass-msg').className = 'msg';
  $('chpass-modal').style.display = 'flex';
}
function closeChangePassword() { $('chpass-modal').style.display = 'none'; }
async function saveNewPassword() {
  const pass = $('chpass-new').value, confirm = $('chpass-confirm').value;
  const m = $('chpass-msg');
  if (pass.length < 6) { m.textContent = 'הסיסמה חייבת להכיל לפחות 6 תווים'; m.className = 'msg err'; return; }
  if (pass !== confirm) { m.textContent = 'הסיסמאות אינן תואמות'; m.className = 'msg err'; return; }
  $('chpass-btn').disabled = true; $('chpass-btn').textContent = '⏳ מעדכן...';
  const { error } = await sb.auth.updateUser({ password: pass });
  $('chpass-btn').disabled = false; $('chpass-btn').textContent = 'עדכן סיסמה';
  if (error) { m.textContent = error.message; m.className = 'msg err'; }
  else { m.textContent = '✅ הסיסמה עודכנה בהצלחה!'; m.className = 'msg ok'; setTimeout(closeChangePassword, 2000); }
}

// ── SUBSCRIPTION ──
// מיילים של אדמינים — תמיד מקבלים גישת פרו מלאה
const ADMIN_EMAILS = ['galsela16@gmail.com'];
function isAdmin() { return currentUser && ADMIN_EMAILS.includes((currentUser.email || '').toLowerCase()); }

// ── רקע קוד השפע (ניסוי אדמין) ──
// פיזור חופשי של הקוד 457854 ברקע, בגדלים/זוויות/שקיפויות משתנים.
const ABUNDANCE_CODE = '457854';
function renderAbundanceBg() {
  const el = $('abundance-bg');
  if (!el) return;
  if (!isAdmin()) { el.style.display = 'none'; el.innerHTML = ''; return; }

  const COLS = 4, ROWS = 6;           // רשת בסיס — נשברת ע"י ג'יטר כדי שלא תיראה מסודרת
  const rnd = (a, b) => a + Math.random() * (b - a);
  let html = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      // מיקום בתוך התא + סטייה אקראית — יוצר פיזור אורגני
      const top = (r / ROWS) * 100 + rnd(-6, 10);
      const right = (c / COLS) * 100 + rnd(-6, 12);
      const size = rnd(11, 28);
      // מופעים גדולים שקופים יותר, קטנים בולטים יותר — שומר על איזון ויזואלי
      const opacity = (0.145 - (size - 11) * 0.0045).toFixed(3);
      const rot = rnd(-32, 32).toFixed(1);
      const ls = rnd(1, 6).toFixed(1);
      html += '<span style="top:' + top.toFixed(1) + '%;right:' + right.toFixed(1) + '%;' +
        'font-size:' + size.toFixed(1) + 'px;opacity:' + opacity + ';letter-spacing:' + ls + 'px;' +
        'transform:rotate(' + rot + 'deg)">' + ABUNDANCE_CODE + '</span>';
    }
  }
  el.innerHTML = html;
  el.style.display = 'block';
}
// עקיפת תצוגה לאדמין (לבדיקת גרסאות) — null = ללא עקיפה
let adminPlanOverride = localStorage.getItem('cf_admin_override') || null;

async function loadSubscription() {
  const uid = currentUser.id;
  const res = await sb.from('subscriptions').select('*').eq('user_id', uid).maybeSingle();
  
  if (!res.data) {
    // משתמש חדש — צור רשומת ניסיון עם תאריך התחלה
    const now = new Date().toISOString();
    await sb.from('subscriptions').insert({ user_id: uid, plan: 'trial', status: 'active', trial_start: now });
    userPlan = 'trial';
    trialDaysLeft = 30;
  } else {
    userPlan = res.data.plan;
    if (userPlan === 'trial') {
      // אם trial_start חסר — עדכן אותו עכשיו
      if (!res.data.trial_start) {
        const now = new Date().toISOString();
        await sb.from('subscriptions').update({ trial_start: now }).eq('user_id', uid);
        trialDaysLeft = 30;
      } else {
        const start = new Date(res.data.trial_start);
        const now = new Date();
        const daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
        trialDaysLeft = Math.max(0, 30 - daysPassed);
        if (trialDaysLeft === 0) userPlan = 'expired';
      }
    }
  }
  // אדמין — גישת פרו מלאה (אלא אם בחר לעקוף לבדיקה)
  if (isAdmin()) {
    userPlan = adminPlanOverride || 'pro';
  }
  updatePlanUI();
}

function updatePlanUI() {
  // הצג תווית תוכנית
  const planBadge = document.getElementById('plan-badge');
  if (planBadge) {
    if (isAdmin() && !adminPlanOverride) {
      planBadge.textContent = currentLang === 'en' ? 'Admin 👑' : 'אדמין 👑';
      planBadge.style.background = '#7c3aed';
    } else {
      if (userPlan === 'trial') planBadge.textContent = currentLang === 'en' ? ('Trial · ' + trialDaysLeft + ' days') : ('ניסיון · ' + trialDaysLeft + ' ימים');
      else if (userPlan === 'basic') planBadge.textContent = currentLang === 'en' ? 'Basic' : 'בסיסי';
      else if (userPlan === 'pro') planBadge.textContent = currentLang === 'en' ? 'Pro ⭐' : 'פרו ⭐';
      else if (userPlan === 'expired') planBadge.textContent = currentLang === 'en' ? 'Expired' : 'פג תוקף';
      planBadge.style.background = userPlan === 'pro' ? '#2855e0' : userPlan === 'expired' ? '#c0392b' : '#0d9c6e';
      // אם אדמין בעקיפה — סמן זאת
      if (isAdmin() && adminPlanOverride) planBadge.textContent += currentLang === 'en' ? ' (test)' : ' (בדיקה)';
    }
  }

  applyPlanVisibility();
}

// ── הרשאות לפי מסלול ──
// basic: בית מלא + דשבורד/הכנסות/חשבונות מלא, השאר קריאה בלבד
// trial/pro: הכל (חוץ מ-Profit First שהוא אדמין בלבד כרגע)
// expired: חסום לגמרי עד תשלום
const BASIC_FULL = ['dashboard', 'transactions', 'accounts', 'goals'];
const BASIC_READONLY = ['ops', 'equipment', 'alerts'];
const ADMIN_ONLY_PAGES = ['profitfirst'];

// ── עמודים מוסתרים זמנית ──
// עמודים שעדיין לא מוכנים לעבודה — מוסתרים לגמרי מכולם (כולל אדמין), אבל הקוד נשאר.
// כדי להחזיר עמוד לעבודה: פשוט מוחקים את שמו מהרשימה הזו. זה הכל.
const HIDDEN_PAGES = ['advisor', 'accounts'];

// אדמין אמיתי — כלומר אדמין שאינו מדמה מסלול אחר לבדיקה
function effectiveAdmin() { return isAdmin() && !adminPlanOverride; }

// מחזיר 'full' | 'readonly' | 'blocked'
function pageAccess(id) {
  if (HIDDEN_PAGES.includes(id)) return 'blocked';  // מוסתר זמנית — לא זמין לאף אחד
  if (ADMIN_ONLY_PAGES.includes(id)) return effectiveAdmin() ? 'full' : 'blocked';
  if (effectiveAdmin()) return 'full';
  if (userPlan === 'expired') return 'blocked';
  if (userPlan === 'basic') {
    if (BASIC_FULL.includes(id)) return 'full';
    if (BASIC_READONLY.includes(id)) return 'readonly';
    return 'blocked';
  }
  return 'full'; // trial / pro
}

// מסתיר טאבים שאינם רלוונטיים ומסמן טאבים במצב צפייה
function applyPlanVisibility() {
  // Profit First — מוסתר מכל מי שאינו אדמין, וגם מאדמין שמדמה מסלול לבדיקה.
  // כשמחזירים גישה, ההצגה חוזרת לפי מצב עסק/בית ולא סתם ל"גלוי".
  const admin = effectiveAdmin();
  document.querySelectorAll('[data-adminonly="1"]').forEach(el => {
    const modeAttr = el.getAttribute('data-mode');
    el.style.display = !admin ? 'none'
      : (modeAttr && modeAttr !== appMode ? 'none' : '');
  });
  // הסתר טאבים של עמודים חסומים לגמרי (כמו היועץ במסלול בסיסי)
  document.querySelectorAll('.tab[data-page], .bnav-item[data-page]').forEach(t => {
    const id = t.getAttribute('data-page');
    if (t.hasAttribute('data-adminonly')) return; // כבר טופל למעלה
    const acc = pageAccess(id);
    const modeAttr = t.getAttribute('data-mode');
    const modeHides = modeAttr && modeAttr !== appMode;
    if (acc === 'blocked' && !modeHides) { t.style.display = 'none'; return; }
    if (!modeHides) t.style.display = '';
    t.style.opacity = acc === 'full' ? '1' : '0.6';
    t.title = acc === 'readonly'
      ? (currentLang === 'en' ? 'View only — upgrade to Pro to edit' : 'צפייה בלבד — שדרג לפרו כדי לערוך')
      : '';
  });
  // אם העמוד הפתוח נחסם בעקבות שינוי מסלול — חזור לדשבורד
  const active = document.querySelector('.page.active');
  const activeId = active ? active.id.replace('page-', '') : '';
  if (activeId && pageAccess(activeId) === 'blocked') {
    showPage('dashboard', document.querySelector('.tab[onclick*="dashboard"]'));
  }
}

// מוסיף באנר "מצב צפייה" ומנטרל כל פעולת כתיבה בעמוד נעול.
// רץ אחרי כל רינדור, כך שגם תוכן שנוצר דינמית מכוסה.
function applyReadOnly() {
  document.querySelectorAll('.page').forEach(page => {
    const id = page.id.replace('page-', '');
    const acc = pageAccess(id);
    const existing = page.querySelector(':scope > .ro-banner');

    if (acc !== 'readonly') {
      // שחרר עמוד שכבר אינו נעול (למשל אחרי שדרוג או החלפת מסלול אדמין)
      if (existing) existing.remove();
      page.querySelectorAll('[data-ro="1"]').forEach(el => {
        el.disabled = false;
        el.removeAttribute('data-ro');
      });
      page.classList.remove('ro-locked');
      return;
    }

    if (!existing) {
      const b = document.createElement('div');
      b.className = 'ro-banner';
      b.innerHTML =
        '<div style="font-size:26px">🔒</div>' +
        '<div class="ro-banner-txt">' +
          '<div class="ro-banner-title">' + (currentLang === 'en' ? 'View only' : 'מצב צפייה בלבד') + '</div>' +
          '<div class="ro-banner-sub">' + (currentLang === 'en'
            ? 'Editing on this page is part of the Pro plan — events, employees, clients, business investments and alerts.'
            : 'עריכה בעמוד הזה כלולה במסלול פרו — אירועים, עובדים, לקוחות, השקעות לעסק והתראות.') + '</div>' +
        '</div>' +
        '<button class="ro-banner-btn" onclick="showUpgradeModal()">' + (currentLang === 'en' ? 'Upgrade to Pro' : 'שדרג לפרו') + '</button>';
      page.insertBefore(b, page.firstChild);
    }

    // נטרל כל שדה/כפתור למעט אלה שבתוך הבאנר עצמו
    page.querySelectorAll('button,input,select,textarea').forEach(el => {
      if (el.closest('.ro-banner')) return;
      if (!el.disabled) el.setAttribute('data-ro', '1');
      el.disabled = true;
    });
  });
}

function checkAccess(feature) {
  if (userPlan === 'expired') { showUpgradeModal(); return false; }
  return true;
}

function showUpgradeModal() {
  document.getElementById('upgrade-modal').style.display = 'flex';
}

function closeUpgradeModal() {
  document.getElementById('upgrade-modal').style.display = 'none';
}

async function enterApp(user) {
  currentUser = user;
  $('auth-screen').style.display = 'none';
  $('app-screen').style.display = 'block';
  $('user-email-display').textContent = user.email;
  // אתחל מצב שפה שמור בכפתורי הבחירה
  if ($('lang-he')) { $('lang-he').classList.toggle('active', currentLang === 'he'); $('lang-en').classList.toggle('active', currentLang === 'en'); }
  initMonths();
  loadPFSettings();
  loadSubscription();
  applyModeVisibility();
  // שחזר מצב "החודש במבט אחד" (מכווץ כברירת מחדל)
  if (localStorage.getItem('cf_mv_open') === '1') {
    const wrap = $('mv-grid-wrap'), chev = $('mv-chevron');
    if (wrap) wrap.style.display = 'grid';
    if (chev) chev.style.transform = 'rotate(180deg)';
  }
  if (localStorage.getItem('cf_sal_open') === '1') {
    const sw = $('sal-panel-wrap'), sc = $('sal-chevron');
    if (sw) sw.style.display = 'block';
    if (sc) sc.style.transform = 'rotate(180deg)';
  }
  if (localStorage.getItem('cf_rec_open') === '1') {
    const rw = $('rec-panel-wrap'), rc = $('rec-chevron');
    if (rw) rw.style.display = 'block';
    if (rc) rc.style.transform = 'rotate(180deg)';
  }
  if (localStorage.getItem('cf_sh_open') === '1') {
    const shw = $('sh-panel-wrap'), shc = $('sh-chevron');
    if (shw) shw.style.display = 'block';
    if (shc) shc.style.transform = 'rotate(180deg)';
  }
  if (localStorage.getItem('cf_records_open') === '0') {
    const rvw = $('records-panel-wrap'), rvc = $('rec2-chevron');
    if (rvw) rvw.style.display = 'none';
    if (rvc) rvc.style.transform = '';
  }
  restorePanels();
  renderAbundanceBg();
  // שחזר את תת-הלשונית האחרונה בטאב תפעול
  if (typeof setOpsTab === 'function') setOpsTab(localStorage.getItem('cf_ops_tab') || 'events');
  // טען קודם הוצאות קבועות, ורק אז loadAll (שתלוי בהן לייבוא אוטומטי)
  await loadRecurring();
  await loadAll();
}

// ── MONTHS ──
// חודש התחלת השימוש (מגביל ניווט וספירה). ריק = ללא הגבלה.
function getStartMonth() { return localStorage.getItem('cf_start_month') || ''; }
function syncMonthOptions() {
  const sm = getStartMonth(), mSel = $('monthSel'), ySel = $('yearSel');
  if (!mSel || !ySel) return;
  const sy = sm ? sm.slice(0, 4) : null, smo = sm ? parseInt(sm.slice(5, 7), 10) : null;
  [...mSel.options].forEach(opt => {
    opt.disabled = !!(sm && ySel.value === sy && parseInt(opt.value, 10) < smo);
  });
}
function initMonths() {
  const now = new Date();
  const mSel = $('monthSel');
  const prevMonth = mSel.value; // שמור בחירה קיימת
  mSel.innerHTML = '';
  HEB_MON.forEach((name, i) => {
    const opt = document.createElement('option');
    opt.value = String(i + 1).padStart(2, '0');
    opt.textContent = MON(i);
    if (i === now.getMonth()) opt.selected = true;
    mSel.appendChild(opt);
  });
  if (prevMonth) mSel.value = prevMonth; // שחזר בחירה
  const ySel = $('yearSel');
  const prevYear = ySel.value; // שמור בחירת שנה
  ySel.innerHTML = '';
  // רצפת השנים = שנת התחלת השימוש (אם מוקדמת מהנוכחית), אחרת השנה הנוכחית
  const sm = getStartMonth();
  let floorYear = now.getFullYear();
  if (sm) { const sy = parseInt(sm.slice(0, 4), 10); if (!isNaN(sy) && sy < floorYear) floorYear = sy; }
  for (let y = floorYear; y <= 2099; y++) {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    if (y === now.getFullYear()) opt.selected = true;
    ySel.appendChild(opt);
  }
  if (prevYear && [...ySel.options].some(o => o.value === prevYear)) ySel.value = prevYear;
  syncMonthOptions();
}
function updateMonth() {
  const sm = getStartMonth();
  if (sm && getMonth() < sm) {
    // נבחר חודש שלפני תחילת השימוש — הצמד לחודש ההתחלה
    $('yearSel').value = sm.slice(0, 4);
    $('monthSel').value = sm.slice(5, 7);
  }
  syncMonthOptions();
  loadAll();
}
// שמירת חודש התחלת השימוש מתוך ההגדרות
function setStartMonth() {
  const mo = $('settings-start-month') ? $('settings-start-month').value : '';
  const yr = $('settings-start-year') ? $('settings-start-year').value : String(new Date().getFullYear());
  if (!mo) localStorage.removeItem('cf_start_month');
  else localStorage.setItem('cf_start_month', yr + '-' + mo);
  initMonths();
  updateMonth();
}

// ── LOAD ──
// ════════════ משמרות שכר ממעסיקים (מצב בית) ════════════
let cachedShifts = [];
let editingShiftId = null;
let lastEmployer = null;

const SH_HEB_MONTHS = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
function shiftMonthLabel() {
  const m = getMonth().split('-'); // YYYY-MM
  const mm = parseInt(m[1], 10);
  return (SH_HEB_MONTHS[mm - 1] || m[1]) + ' ' + m[0];
}

// מפיק דף PDF של סיכום המשמרות החודשי למעסיק
function sendEmployerSummary(emp) {
  const rows = cachedShifts.filter(s => (s.employer || '') === emp)
    .slice().sort((a, b) => (a.shift_date || '').localeCompare(b.shift_date || ''));
  if (!rows.length) { alert('אין משמרות למעסיק זה החודש'); return; }
  if (typeof window.jspdf === 'undefined') { alert('ספריית ה-PDF עדיין נטענת, נסה שוב בעוד רגע'); return; }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const hasHeb = ensureHebFont(doc);
  const F = hasHeb ? 'DejaVuHeb' : 'helvetica';
  const R = s => hasHeb ? pdfRTL(s) : String(s == null ? '' : s);
  const pageW = doc.internal.pageSize.getWidth();

  // כותרת
  doc.setFont(F); doc.setFontSize(18);
  doc.text(R('סיכום שעות — ' + emp), pageW - 14, 20, { align: 'right' });
  doc.setFontSize(12); doc.setTextColor(120, 120, 130);
  doc.text(R(shiftMonthLabel()), pageW - 14, 28, { align: 'right' });
  doc.setTextColor(20, 20, 30);

  let totalH = 0, totalP = 0;
  const body = rows.map(s => {
    const h = Number(s.hours) || 0, rate = Number(s.rate) || 0, pay = h * rate;
    totalH += h; totalP += pay;
    const range = (s.start_time && s.end_time) ? (s.start_time + '-' + s.end_time) : '';
    return [s.shift_date || '', range, String(Math.round(h * 100) / 100), fmtNum(rate), fmtNum(pay)];
  });

  doc.autoTable({
    startY: 34,
    head: [['תאריך', 'שעות', 'משך', 'תעריף ₪', 'סה"כ ₪'].map(R)],
    body: body.map(row => row.map(R)),
    foot: [['סה"כ', '', String(Math.round(totalH * 100) / 100), '', fmtNum(totalP)].map(R)],
    theme: 'grid',
    styles: { font: F, halign: 'right', fontSize: 10 },
    headStyles: { font: F, fillColor: [27, 127, 94], halign: 'right', textColor: [255, 255, 255] },
    footStyles: { font: F, fillColor: [232, 250, 243], textColor: [20, 20, 30], halign: 'right', fontStyle: 'bold' }
  });

  const y = doc.lastAutoTable.finalY + 12;
  doc.setFontSize(11);
  doc.text(R('הופק ב-' + new Date().toLocaleDateString('he-IL') + ' · CashflowHQ'), pageW - 14, y, { align: 'right' });

  doc.save('סיכום-' + emp + '-' + getMonth() + '.pdf');
}

// חישוב משך משמרת מ"משעה" עד "עד שעה" (תומך בחציית חצות)
function computeShiftHours(start, end) {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  if ([sh, sm, eh, em].some(n => isNaN(n))) return 0;
  let mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) mins += 1440; // המשמרת חוצה חצות
  return Math.round((mins / 60) * 100) / 100;
}
function fmtHours(h) { return (Math.round(h * 100) / 100).toLocaleString('he-IL') + ' שע׳'; }

// החלפה בין בחירת מעסיק קיים לבין הזנת מעסיק חדש
function onEmployerSelect() {
  const sel = $('sh-employer-select'), inp = $('sh-employer');
  if (!sel || !inp) return;
  const isNew = sel.value === '__new__';
  inp.style.display = isNew ? 'block' : 'none';
  if (isNew) { inp.value = ''; inp.focus(); }
}
function currentEmployerValue() {
  const sel = $('sh-employer-select');
  if (sel && sel.value && sel.value !== '__new__') return sel.value;
  return $('sh-employer') ? $('sh-employer').value.trim() : '';
}

async function loadShifts() {
  if (appMode !== 'home' || !currentUser) { cachedShifts = []; return; }
  const r = await sb.from('home_shifts')
    .select('*')
    .eq('user_id', currentUser.id)
    .eq('month', getMonth())
    .order('shift_date', { ascending: false })
    .order('created_at', { ascending: false });
  cachedShifts = r.data || [];
}

function shiftEmployers() {
  return [...new Set(cachedShifts.map(s => s.employer).filter(Boolean))];
}

async function addShift() {
  const employer = currentEmployerValue();
  const date = $('sh-date').value;
  const start = $('sh-start').value, end = $('sh-end').value;
  const rate = parseFloat($('sh-rate').value);
  const notes = $('sh-notes').value.trim();
  if (!employer) { alert('נא לבחור או להזין מעסיק'); return; }
  if (!start || !end) { alert('נא למלא שעת התחלה וסיום'); return; }
  const hours = computeShiftHours(start, end);
  if (hours <= 0) { alert('טווח השעות אינו תקין'); return; }
  if (isNaN(rate) || rate < 0) { alert('נא למלא תעריף תקין'); return; }
  $('btn-add-shift').disabled = true;
  await sb.from('home_shifts').insert({
    user_id: currentUser.id, month: getMonth(), employer,
    shift_date: date || null, start_time: start, end_time: end, hours, rate, notes: notes || null
  });
  lastEmployer = employer; // שמור את המעסיק שנבחר להזנה הבאה
  $('sh-notes').value = ''; $('sh-start').value = ''; $('sh-end').value = '';
  $('btn-add-shift').disabled = false;
  await loadShifts();
  renderShifts();
}

function startEditShift(id) { editingShiftId = id; renderShifts(); }function cancelEditShift() { editingShiftId = null; renderShifts(); }

async function saveShift(id) {
  const employer = $('she-employer-' + id).value.trim();
  const date = $('she-date-' + id).value;
  const start = $('she-start-' + id).value, end = $('she-end-' + id).value;
  const rate = parseFloat($('she-rate-' + id).value);
  const notes = $('she-notes-' + id).value.trim();
  if (!employer || !start || !end || isNaN(rate) || rate < 0) { alert('נתונים לא תקינים'); return; }
  const hours = computeShiftHours(start, end);
  if (hours <= 0) { alert('טווח השעות אינו תקין'); return; }
  await sb.from('home_shifts').update({
    employer, shift_date: date || null, start_time: start, end_time: end, hours, rate, notes: notes || null
  }).eq('id', id).eq('user_id', currentUser.id);
  editingShiftId = null;
  await loadShifts();
  renderShifts();
}

async function deleteShift(id) {
  if (!confirm('למחוק את המשמרת?')) return;
  await sb.from('home_shifts').delete().eq('id', id).eq('user_id', currentUser.id);
  if (editingShiftId === id) editingShiftId = null;
  await loadShifts();
  renderShifts();
}

// הצג/הסתר היסטוריית משמרות (מוסתר כברירת מחדל)
function toggleShiftHistory() {
  const wrap = $('sh-hist-wrap'), chev = $('sh-hist-chev');
  if (!wrap) return;
  const open = wrap.style.display === 'none';
  wrap.style.display = open ? 'block' : 'none';
  if (chev) chev.style.transform = open ? 'rotate(90deg)' : '';
  localStorage.setItem('cf_sh_hist_open', open ? '1' : '0');
}

function toggleShiftsPanel() {  const wrap = $('sh-panel-wrap'), chev = $('sh-chevron');
  if (!wrap) return;
  const open = wrap.style.display === 'none';
  wrap.style.display = open ? 'block' : 'none';
  if (chev) chev.style.transform = open ? 'rotate(180deg)' : '';
  localStorage.setItem('cf_sh_open', open ? '1' : '0');
  if (open) renderShifts();
}

function shiftPreview() {
  const h = computeShiftHours($('sh-start') ? $('sh-start').value : '', $('sh-end') ? $('sh-end').value : '');
  const r = parseFloat($('sh-rate') ? $('sh-rate').value : '') || 0;
  if ($('sh-preview-hours')) $('sh-preview-hours').textContent = fmtHours(h);
  if ($('sh-preview-val')) $('sh-preview-val').textContent = fmt(h * r);
}

function renderShifts() {
  // ברירת מחדל לתאריך = היום (מקומי)
  if ($('sh-date') && !$('sh-date').value) {
    const d = new Date();
    $('sh-date').value = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  shiftPreview();
  const ml = $('sh-month-label');
  if (ml) ml.textContent = '· ' + shiftMonthLabel();
  const inl = $('sh-total-inline');
  if (inl) { const tot = cachedShifts.reduce((a, s) => a + (Number(s.hours) || 0) * (Number(s.rate) || 0), 0); inl.textContent = tot > 0 ? '· ' + fmt(tot) : ''; }
  // שחזר מצב היסטוריה (מוסתר כברירת מחדל)
  const _hw = $('sh-hist-wrap'), _hc = $('sh-hist-chev');
  if (_hw) { const op = localStorage.getItem('cf_sh_hist_open') === '1'; _hw.style.display = op ? 'block' : 'none'; if (_hc) _hc.style.transform = op ? 'rotate(90deg)' : ''; }

  const totalHours = cachedShifts.reduce((a, s) => a + (Number(s.hours) || 0), 0);
  const totalSalary = cachedShifts.reduce((a, s) => a + (Number(s.hours) || 0) * (Number(s.rate) || 0), 0);
  const avgRate = totalHours > 0 ? (totalSalary / totalHours) : 0;

  const sum = $('shifts-summary');
  if (sum) sum.innerHTML =
    '<div class="card"><div class="card-label">🕐 סה"כ שעות</div><div class="card-value">' + totalHours.toLocaleString('he-IL') + '</div><div class="card-sub">החודש</div></div>' +
    '<div class="card card-soft-green"><div class="card-label">💵 שכר ברוטו</div><div class="card-value c-green">' + fmt(totalSalary) + '</div><div class="card-sub">שעות × תעריף</div></div>' +
    '<div class="card"><div class="card-label">📊 תעריף ממוצע</div><div class="card-value">' + fmt(avgRate) + '</div><div class="card-sub">לשעה</div></div>';

  // פירוט לפי מעסיק
  const byEmp = {};
  cachedShifts.forEach(s => {
    const e = s.employer || '—';
    if (!byEmp[e]) byEmp[e] = { hours: 0, salary: 0 };
    byEmp[e].hours += (Number(s.hours) || 0);
    byEmp[e].salary += (Number(s.hours) || 0) * (Number(s.rate) || 0);
  });
  const bd = $('shifts-breakdown');
  if (bd) {
    const keys = Object.keys(byEmp);
    bd.innerHTML = keys.length ? '<div style="font-size:11.5px;color:var(--muted);margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px;font-weight:700">פירוט לפי מעסיק</div><div class="sh-emp-list">' + keys.map(e => {
      const initial = esc((e || '—').trim().charAt(0) || '—');
      return '<div class="sh-emp">' +
        '<div class="sh-avatar">' + initial + '</div>' +
        '<div><div class="sh-emp-name">' + esc(e) + '</div><div class="sh-emp-hours">' + byEmp[e].hours.toLocaleString('he-IL') + ' שעות</div></div>' +
        '<div class="sh-emp-pay">' + fmt(byEmp[e].salary) + '</div>' +
        '<button class="btn sh-mini" style="margin-inline-start:10px" onclick="sendEmployerSummary(\'' + esc(e).replace(/'/g, "\\'") + '\')" title="הפק סיכום חודשי כ-PDF">📄 PDF</button>' +
      '</div>';
    }).join('') + '</div>' : '';
  }

  // תיבת בחירת מעסיק — מאוכלסת מהמעסיקים הקיימים + אפשרות "מעסיק חדש"
  const selEl = $('sh-employer-select');
  if (selEl) {
    const emps = shiftEmployers();
    const prev = lastEmployer || selEl.value;
    selEl.innerHTML = emps.map(e => '<option value="' + esc(e) + '">' + esc(e) + '</option>').join('') +
      '<option value="__new__">➕ מעסיק חדש…</option>';
    if (prev && prev !== '__new__' && emps.includes(prev)) selEl.value = prev;
    else if (!emps.length) selEl.value = '__new__';
    onEmployerSelect();
  }
  lastEmployer = null;

  // טבלה
  const tb = $('shifts-tbody');
  if (!tb) return;
  if (!cachedShifts.length) {
    tb.innerHTML = '<tr><td colspan="7"><div class="sh-empty"><span class="sh-empty-ic">🗓️</span>עדיין לא הוספת משמרות החודש.<br>הוסף את המשמרת הראשונה למעלה.</div></td></tr>';
    return;
  }
  const inp = 'padding:7px 9px;border:1.5px solid var(--border);border-radius:8px;width:100%;font-size:13px;box-sizing:border-box';
  tb.innerHTML = cachedShifts.map(s => {
    if (editingShiftId === s.id) {
      return '<tr>' +
        '<td><input id="she-employer-' + s.id + '" value="' + esc(s.employer || '') + '" style="' + inp + '"></td>' +
        '<td><input id="she-date-' + s.id + '" type="date" value="' + esc(s.shift_date || '') + '" style="' + inp + '"></td>' +
        '<td><div style="display:flex;gap:4px"><input id="she-start-' + s.id + '" type="time" value="' + esc(s.start_time || '') + '" style="' + inp + '"><input id="she-end-' + s.id + '" type="time" value="' + esc(s.end_time || '') + '" style="' + inp + '"></div></td>' +
        '<td><input id="she-rate-' + s.id + '" type="number" value="' + (Number(s.rate) || 0) + '" style="' + inp + '"></td>' +
        '<td><input id="she-notes-' + s.id + '" value="' + esc(s.notes || '') + '" style="' + inp + '"></td>' +
        '<td style="color:var(--muted)">—</td>' +
        '<td style="white-space:nowrap">' +
          '<button class="btn btn-primary sh-mini" onclick="saveShift(\'' + s.id + '\')">שמור</button> ' +
          '<button class="btn sh-mini" onclick="cancelEditShift()">ביטול</button>' +
        '</td></tr>';
    }
    const total = (Number(s.hours) || 0) * (Number(s.rate) || 0);
    return '<tr>' +
      '<td><span class="sh-chip">' + esc(s.employer || '—') + '</span></td>' +
      '<td>' + esc(s.shift_date || '—') + '</td>' +
      '<td>' + ((s.start_time && s.end_time) ? '<span dir="ltr">' + esc(s.start_time) + '–' + esc(s.end_time) + '</span> · ' + (Number(s.hours) || 0) + ' שע׳' : (Number(s.hours) || 0) + ' שעות') + '</td>' +
      '<td>' + fmt(Number(s.rate) || 0) + '</td>' +
      '<td style="color:var(--muted)">' + esc(s.notes || '—') + '</td>' +
      '<td class="sh-total">' + fmt(total) + '</td>' +
      '<td style="white-space:nowrap">' +
        '<button class="btn sh-mini" onclick="startEditShift(\'' + s.id + '\')">ערוך</button> ' +
        '<button class="btn sh-mini" onclick="deleteShift(\'' + s.id + '\')">מחק</button>' +
      '</td></tr>';
  }).join('');
}

async function loadAll() {
  const month = getMonth(), uid = currentUser.id;
  // ── מצב בית: טען רק עסקאות בית + קבועות בית ──
  if (appMode === 'home') {
    const txR = await sb.from('home_transactions').select('*').eq('user_id', uid).eq('month', month).order('created_at', { ascending: false });
    cachedTx = txR.data || [];
    // אין אירועים/עובדים/לקוחות במצב בית
    cachedEmps = []; cachedEmpEvents = []; cachedClients = []; cachedEventDetails = []; cachedEventWorkers = [];
    await fetchAccounts();
    await autoImportRecurring(month, uid, cachedTx);
    await loadSalaries();
    await loadGoalDeposits();
    await loadGoalItems();
    await loadChildren();
    await loadGoals();
    await loadShifts();
    renderShifts();
    loadAccounts();
    loadSnapshots();
    renderHome();
    return;
  }
  // ── מצב עסק (כרגיל) ──
  const [txR, empR, evR, clientR, detailR] = await Promise.all([
    sb.from('transactions').select('*').eq('user_id', uid).eq('month', month).order('created_at', { ascending: false }),
    sb.from('employees').select('*').eq('user_id', uid).order('name'),
    sb.from('employee_events').select('*').eq('user_id', uid).eq('month', month),
    sb.from('clients').select('*').eq('user_id', uid).order('name'),
    sb.from('event_details').select('*').eq('user_id', uid).order('event_date', { ascending: false })
  ]);
  cachedTx = txR.data || []; cachedEmps = empR.data || []; cachedEmpEvents = evR.data || [];
  cachedClients = clientR.data || []; cachedEventDetails = detailR.data || [];
  // event_workers מסונן לפי האירועים של המשתמש בלבד (אבטחה + ביצועים)
  const detailIds = cachedEventDetails.map(d => d.id);
  if (detailIds.length) {
    const workerR = await sb.from('event_workers').select('*').in('event_detail_id', detailIds);
    cachedEventWorkers = workerR.data || [];
  } else {
    cachedEventWorkers = [];
  }
  // ייבוא אוטומטי של הוצאות קבועות אם עוד לא יובאו החודש
  await fetchAccounts();
  await autoImportRecurring(month, uid, cachedTx);
  renderAll();
  // טען השקעות לעסק
  loadEquipment();
  cleanupOldEventFiles(); // ניקוי קבצים של אירועים שעברו (רקע)
  loadAccounts();
  loadSnapshots();
  // סנכרון יומן גוגל אוטומטי ברקע (לא מעכב את שאר הטעינה)
  loadGCal();
}

// ── RENDER HOME (מצב בית) ──
function renderHome() {
  // הצג דשבורד בית, הסתר דשבורד עסק
  const homeD = $('home-dashboard'), bizD = $('business-dashboard');
  if (homeD) homeD.style.display = 'block';
  if (bizD) bizD.style.display = 'none';

  const month = getMonth();
  // משכורת מהעסק (50% מצפי הרווח שנשמר בעת חישוב העסק)
  let bizSalary = 0;
  try { bizSalary = (JSON.parse(localStorage.getItem('cf_biz_salary') || '{}'))[month] || 0; } catch (e) {}

  const incomeRows = cachedTx.filter(t => t.type === 'income');
  const expenseRows = cachedTx.filter(t => t.type === 'expense');
  const manualIncome = incomeRows.reduce((s, t) => s + t.amount, 0);
  const salaries = cachedSalaries.filter(s => s.active);
  const salaryTotal = salaries.reduce((sum, s) => sum + (s.amount || 0), 0);
  // שכר מהמשמרות (מעסיקים) — נכנס אוטומטית להכנסות הבית
  const shiftIncome = cachedShifts.reduce((s, x) => s + (Number(x.hours) || 0) * (Number(x.rate) || 0), 0);
  const totalIncome = manualIncome + bizSalary + salaryTotal + shiftIncome;
  const totalExpense = expenseRows.reduce((s, t) => s + t.amount, 0);
  const net = totalIncome - totalExpense;

  // כרטיסי סיכום
  if ($('h-income')) $('h-income').textContent = fmt(totalIncome);
  if ($('h-expense')) $('h-expense').textContent = fmt(totalExpense);
  const netEl = $('h-net');
  if (netEl) { netEl.textContent = fmt(net); netEl.style.color = net >= 0 ? 'var(--green)' : 'var(--red)'; }

  // רשימת הכנסות (כולל המשכורת מהעסק אם קיימת)
  let incHtml = '';
  if (bizSalary > 0) {
    incHtml += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">' +
      '<div><div style="font-weight:500">🏢 משכורת מהעסק</div><div style="font-size:11px;color:var(--muted)">50% מצפי הרווח</div></div>' +
      '<div style="font-weight:600;color:var(--green)">' + fmt(bizSalary) + '</div></div>';
  }
  salaries.forEach(s => {
    incHtml += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">' +
      '<div><div style="font-weight:500">💼 ' + esc(s.person_name) + '</div><div style="font-size:11px;color:var(--muted)">משכורת קבועה</div></div>' +
      '<div style="font-weight:600;color:var(--green)">' + fmt(s.amount || 0) + '</div></div>';
  });
  // הכנסות משמרות — שורה לכל מעסיק
  const shiftByEmp = {};
  cachedShifts.forEach(x => {
    const e = x.employer || 'משמרות';
    if (!shiftByEmp[e]) shiftByEmp[e] = { hours: 0, pay: 0 };
    shiftByEmp[e].hours += (Number(x.hours) || 0);
    shiftByEmp[e].pay += (Number(x.hours) || 0) * (Number(x.rate) || 0);
  });
  Object.keys(shiftByEmp).forEach(e => {
    incHtml += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">' +
      '<div><div style="font-weight:500">🕐 ' + esc(e) + '</div><div style="font-size:11px;color:var(--muted)">משמרות · ' + (Math.round(shiftByEmp[e].hours * 100) / 100) + ' שע׳</div></div>' +
      '<div style="font-weight:600;color:var(--green)">' + fmt(shiftByEmp[e].pay) + '</div></div>';
  });
  incHtml += incomeRows.map(t =>
    '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">' +
    '<div><div style="font-weight:500">' + esc(t.description) + '</div>' + (t.category ? '<div style="font-size:11px;color:var(--muted)">' + esc(t.category) + '</div>' : '') + '</div>' +
    '<div style="font-weight:600;color:var(--green)">' + fmt(t.amount) + '</div></div>'
  ).join('');
  const incList = $('h-income-list');
  if (incList) incList.innerHTML = incHtml || '<div class="empty">אין הכנסות החודש</div>';

  // הוצאות לפי קטגוריה
  const cats = {};
  const catRows = {};
  expenseRows.forEach(t => {
    const c = t.category || 'אחר';
    cats[c] = (cats[c] || 0) + t.amount;
    (catRows[c] = catRows[c] || []).push(t);
  });
  const catEl = $('h-cat-bars');
  // פירוט "יצא החודש" לפי קטגוריה (נפתח בלחיצה על הכרטיס)
  const edEl = $('h-expense-detail');
  if (edEl) {
    const entries = Object.entries(cats).sort((a, b) => b[1] - a[1]);
    edEl.innerHTML = entries.length
      ? entries.map(([c, a]) => '<div style="display:flex;justify-content:space-between;gap:10px;padding:8px 12px;border-bottom:1px solid var(--border);font-size:13px"><span>' + esc(c) + '</span><span style="color:var(--red);font-weight:600;white-space:nowrap">' + fmt(a) + '</span></div>').join('') +
        '<div style="display:flex;justify-content:space-between;gap:10px;padding:9px 12px;font-weight:700"><span>סה"כ</span><span style="color:var(--red)">' + fmt(totalExpense) + '</span></div>'
      : '<div style="padding:10px 12px;color:var(--muted);font-size:12px">אין הוצאות החודש</div>';
  }
  if (catEl) {
    if (!Object.keys(cats).length) { catEl.innerHTML = '<div class="empty">אין הוצאות החודש</div>'; }
    else {
      const colors = ['#185FA5', '#0F6E56', '#854F0B', '#993C1D', '#533C89', '#B45309'];
      let i = 0;
      catEl.innerHTML = Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
        const pct = totalExpense > 0 ? Math.round(amt / totalExpense * 100) : 0;
        const color = colors[i++ % colors.length];
        const rows = (catRows[cat] || []).slice().sort((a, b) => b.amount - a.amount);
        const detail = rows.map(r =>
          '<div style="display:flex;justify-content:space-between;gap:10px;padding:5px 8px;font-size:12.5px;border-bottom:1px solid var(--border)">' +
            '<span>' + esc(r.description || '—') + '</span>' +
            '<span style="color:var(--muted);white-space:nowrap">' + fmt(r.amount) + '</span>' +
          '</div>').join('');
        return '<div class="cat-item">' +
          '<div class="bar-wrap" style="cursor:pointer" onclick="toggleCatDetail(this)" title="לחץ לפירוט">' +
            '<div class="bar-label"><span><span class="cat-chev" style="display:inline-block;transition:transform .2s;font-size:10px;color:var(--muted)">▸</span> ' + esc(cat) + '</span><span>' + fmt(amt) + ' (' + pct + '%)</span></div>' +
            '<div class="bar-bg"><div class="bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
          '</div>' +
          '<div class="cat-detail" style="display:none;margin:6px 0 12px;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden">' + (detail || '<div style="padding:8px;font-size:12px;color:var(--muted)">אין רשומות</div>') + '</div>' +
        '</div>';
      }).join('');
    }
  }

  // עדכן את טבלת הרשומות (משותפת) וקבועות
  renderTxTable();
  renderRecurring();
  renderHomeGoalsList();
  renderHomeGoals();
  applyReadOnly();
}

// placeholder — יבנו בשלבים הבאים
let cachedGoals = [];
let cachedGoalItems = [];
async function loadGoalItems() {
  const r = await sb.from('goal_items').select('*').eq('user_id', currentUser.id).order('sort_order').order('created_at');
  cachedGoalItems = r.data || [];
}
function itemsForGoal(goalId) {
  return cachedGoalItems.filter(i => i.goal_id === goalId);
}
// סכום שורה = כמות × מחיר ליחידה
function itemLineTotal(i) {
  const q = (i.quantity === null || i.quantity === undefined) ? 1 : Number(i.quantity);
  return (isNaN(q) ? 1 : q) * (i.amount || 0);
}
// סכום היעד נגזר מהרכיבים אם קיימים, אחרת מהערך שהוזן ידנית
function goalTargetOf(g) {
  const items = itemsForGoal(g.id);
  if (items.length) return items.reduce((s, i) => s + (i.amount || 0), 0);
  return g.target_amount || 0;
}

async function loadGoals() {
  const res = await sb.from('home_goals').select('*').eq('user_id', currentUser.id).order('created_at');
  cachedGoals = res.data || [];
  renderHomeGoalsList();
}
async function addGoal() {
  const name = $('goal-name').value.trim(), target = parseFloat($('goal-target').value);
  const deadline = $('goal-deadline') ? $('goal-deadline').value : '';
  // רק השם חובה — אפשר להוסיף יעד ולפרק אותו לרכיבים אחר כך
  if (!name) { alert('נא למלא שם ליעד'); return; }
  $('btn-add-goal').disabled = true;
  await sb.from('home_goals').insert({
    user_id: currentUser.id, name,
    target_amount: (isNaN(target) || target < 0) ? 0 : target,
    saved_amount: 0,
    deadline: deadline || null
  });
  $('goal-name').value = ''; $('goal-target').value = '';
  if ($('goal-deadline')) $('goal-deadline').value = '';
  $('btn-add-goal').disabled = false;
  await loadGoals();
}
async function deleteGoal(id) {
  if (!confirm('למחוק יעד זה?')) return;
  await sb.from('home_goals').delete().eq('id', id);
  await loadGoals();
}

// היסטוריית הפקדות — לחישוב הרצף החודשי
let cachedDeposits = [];
async function loadGoalDeposits() {
  const r = await sb.from('goal_deposits').select('*').eq('user_id', currentUser.id).order('deposited_on', { ascending: false });
  cachedDeposits = r.data || [];
}

// כמה חודשים ברצף הופקד ליעד (כולל החודש הנוכחי או הקודם)
function goalStreak(goalId) {
  const months = new Set(
    cachedDeposits.filter(d => d.goal_id === goalId && (d.amount || 0) > 0)
      .map(d => (d.deposited_on || '').slice(0, 7))
  );
  if (!months.size) return 0;
  const now = new Date();
  let y = now.getFullYear(), m = now.getMonth(); // 0-based
  const key = (yy, mm) => yy + '-' + String(mm + 1).padStart(2, '0');
  // אם לא הופקד החודש — מתחילים לספור מהחודש הקודם (סלחני)
  if (!months.has(key(y, m))) {
    m--; if (m < 0) { m = 11; y--; }
    if (!months.has(key(y, m))) return 0;
  }
  let streak = 0;
  while (months.has(key(y, m))) {
    streak++;
    m--; if (m < 0) { m = 11; y--; }
  }
  return streak;
}

// עדכון סכום שנחסך — הוספה/הפחתה
async function updateGoalSaved(id, delta) {
  const g = cachedGoals.find(x => x.id === id);
  if (!g) return;
  let amt = delta;
  if (delta === 'custom') {
    const input = prompt('כמה להוסיף לחיסכון? (מספר שלילי מפחית)', '500');
    if (input === null) return;
    amt = parseFloat(input);
    if (isNaN(amt)) return;
  }
  const target = g.target_amount || 0;
  const prevSaved = g.saved_amount || 0;
  const newSaved = Math.max(0, prevSaved + amt);
  await sb.from('home_goals').update({ saved_amount: newSaved }).eq('id', id);
  // רשום הפקדה (רק חיובית) — משמש לרצף החודשי
  if (amt > 0) {
    await sb.from('goal_deposits').insert({
      user_id: currentUser.id, goal_id: id, amount: amt,
      deposited_on: new Date().toISOString().slice(0, 10)
    });
  }
  // ציוני דרך — חוגגים פעם אחת לכל שלב
  if (target > 0) {
    const prevPct = Math.floor(prevSaved / target * 100);
    const newPct = Math.floor(newSaved / target * 100);
    const last = g.last_milestone || 0;
    const milestones = [25, 50, 75, 100];
    let hit = 0;
    milestones.forEach(ms => { if (newPct >= ms && ms > last) hit = ms; });
    if (hit) {
      await sb.from('home_goals').update({ last_milestone: hit }).eq('id', id);
      setTimeout(() => {
        if (hit === 100) alert('🎉 מזל טוב! הגעת ליעד "' + g.name + '"!');
        else alert('🎯 כל הכבוד! עברת ' + hit + '% מהיעד "' + g.name + '"');
      }, 100);
    }
  }
  await loadGoalDeposits();
  await loadGoals();
}

// ── חיסכון לילדים ──
let cachedChildren = [];

async function loadChildren() {
  const r = await sb.from('child_savings').select('*').eq('user_id', currentUser.id).order('created_at');
  cachedChildren = r.data || [];
  renderChildren();
}

async function addChild() {
  const name = $('child-name').value.trim();
  const birth = $('child-birth').value;
  const initial = parseFloat($('child-initial').value) || 0;
  const monthly = parseFloat($('child-monthly').value) || 0;
  const rate = parseFloat($('child-rate').value) || 0;
  const age = parseInt($('child-age').value) || 18;
  if (!name) { alert('נא למלא שם'); return; }
  $('btn-add-child').disabled = true;
  await sb.from('child_savings').insert({
    user_id: currentUser.id, child_name: name, birth_date: birth || null,
    initial_amount: initial, monthly_deposit: monthly, annual_rate: rate,
    target_age: age, current_value: initial,
    value_updated_on: new Date().toISOString().slice(0, 10)
  });
  ['child-name', 'child-birth', 'child-initial', 'child-monthly'].forEach(id => { if ($(id)) $(id).value = ''; });
  if ($('child-rate')) $('child-rate').value = '5';
  if ($('child-age')) $('child-age').value = '18';
  $('btn-add-child').disabled = false;
  await loadChildren();
}

async function deleteChild(id) {
  const c = cachedChildren.find(x => x.id === id);
  if (!confirm('למחוק את החיסכון של "' + (c ? c.child_name : '') + '"?\nכל היסטוריית העדכונים תימחק גם.')) return;
  await sb.from('child_savings').delete().eq('id', id);
  await loadChildren();
}

// עדכון השווי בפועל — טופס קטן בתוך הכרטיס
function updateChildValue(id) {
  const c = cachedChildren.find(x => x.id === id);
  const card = $('child-card-' + id);
  if (!c || !card) return;
  const box = document.createElement('div');
  box.style.cssText = 'margin-top:10px;padding-top:10px;border-top:1px solid var(--border)';
  box.innerHTML =
    '<label style="font-size:11.5px;color:var(--muted);display:block;margin-bottom:4px">💰 מה השווי היום? (מהאפליקציה של בית ההשקעות)</label>' +
    '<div style="display:flex;gap:7px">' +
      '<input id="child-v-' + id + '" type="number" min="0" value="' + (c.current_value || 0) + '" ' +
      'style="flex:1;padding:7px 9px;border:1px solid var(--border);border-radius:8px;font-size:14px;font-weight:700">' +
      '<button class="btn-save-sm" onclick="saveChildValue(\'' + id + '\')">✓</button>' +
      '<button class="btn-cancel-sm" onclick="renderChildren()">✕</button>' +
    '</div>';
  card.appendChild(box);
  const inp = $('child-v-' + id);
  if (inp) { inp.focus(); inp.select(); }
}

async function saveChildValue(id) {
  const c = cachedChildren.find(x => x.id === id);
  const inp = $('child-v-' + id);
  if (!c || !inp) return;
  const val = parseFloat(inp.value);
  if (isNaN(val) || val < 0) return;
  const today = new Date().toISOString().slice(0, 10);
  await sb.from('child_savings').update({ current_value: val, value_updated_on: today }).eq('id', id);
  // רשום בהיסטוריה (בסיס לגרף ההתקדמות)
  await sb.from('child_savings_log').insert({
    user_id: currentUser.id, child_id: id, logged_on: today,
    deposited: c.monthly_deposit || 0, total_value: val
  });
  await loadChildren();
}

// גיל נוכחי בשנים (עשרוני)
function childAgeYears(birth) {
  if (!birth) return null;
  const b = new Date(birth + 'T00:00:00');
  return (Date.now() - b) / (365.25 * 86400000);
}

// תחזית: כמה יהיה בגיל היעד (הרכבה חודשית)
function projectChild(c) {
  const rate = (c.annual_rate || 0) / 100 / 12;
  const monthly = c.monthly_deposit || 0;
  const ageNow = childAgeYears(c.birth_date);
  const yearsLeft = ageNow === null ? (c.target_age || 18) : Math.max((c.target_age || 18) - ageNow, 0);
  const months = Math.round(yearsLeft * 12);
  let bal = c.current_value || 0;
  let deposited = 0;
  for (let i = 0; i < months; i++) { bal = bal * (1 + rate) + monthly; deposited += monthly; }
  return { future: Math.round(bal), months, yearsLeft, deposited: Math.round(deposited) };
}

function renderChildren() {
  const el = $('children-list');
  if (!el) return;
  const grand = cachedChildren.reduce((s, c) => s + (c.current_value || 0), 0);
  const gt = $('child-grand-total');
  if (gt) gt.textContent = fmt(grand);

  if (!cachedChildren.length) {
    el.innerHTML = '<div class="empty">עדיין לא נוספו ילדים. הוסף את הראשון למטה 👶</div>';
    return;
  }
  el.innerHTML = '<div class="child-cards">' + cachedChildren.map(c => {
    const p = projectChild(c);
    const ageNow = childAgeYears(c.birth_date);
    const ageTxt = ageNow === null ? '' : 'גיל ' + ageNow.toFixed(1);
    const yearsTxt = p.yearsLeft > 0 ? 'עוד ' + p.yearsLeft.toFixed(1) + ' שנים לגיל ' + (c.target_age || 18) : 'הגיע לגיל היעד 🎉';
    const gain = p.future - (c.current_value || 0) - p.deposited;
    const dateStr = c.value_updated_on ? c.value_updated_on.split('-').reverse().join('/') : '—';

    return '<div class="child-card" id="child-card-' + c.id + '">' +
      '<div class="child-top">' +
        '<div style="min-width:0">' +
          '<div class="child-name">👶 ' + esc(c.child_name) + '</div>' +
          '<div class="child-age">' + (ageTxt ? ageTxt + ' · ' : '') + yearsTxt + '</div>' +
        '</div>' +
        '<div class="child-proj">' +
          '<div class="child-proj-val">' + fmt(p.future) + '</div>' +
          '<div class="child-proj-lbl">צפוי בגיל ' + (c.target_age || 18) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="child-stats">' +
        '<div class="child-stat"><div class="child-stat-lbl">שווי היום</div><div class="child-stat-val">' + fmt(c.current_value || 0) + '</div></div>' +
        '<div class="child-stat"><div class="child-stat-lbl">הפקדה חודשית</div><div class="child-stat-val">' + fmt(c.monthly_deposit || 0) + '</div></div>' +
        '<div class="child-stat"><div class="child-stat-lbl">עוד יופקד</div><div class="child-stat-val">' + fmt(p.deposited) + '</div></div>' +
        '<div class="child-stat"><div class="child-stat-lbl">רווח מריבית</div><div class="child-stat-val" style="color:var(--green)">' + fmt(Math.max(0, gain)) + '</div></div>' +
      '</div>' +
      '<div style="font-size:11px;color:var(--muted);margin-bottom:10px">תשואה ' + (c.annual_rate || 0) + '% · עודכן ' + dateStr + '</div>' +
      '<div class="goal-actions">' +
        '<button class="btn-paid-quick" onclick="updateChildValue(\'' + c.id + '\')">💰 עדכן שווי</button>' +
        '<button class="btn-edit-sm" onclick="editChild(\'' + c.id + '\')" title="ערוך">&#9998;</button>' +
        '<button class="btn-del" onclick="deleteChild(\'' + c.id + '\')" title="מחק">&#128465;</button>' +
      '</div>' +
    '</div>';
  }).join('') + '</div>';
}

// עריכת פרטי ילד — הופך את הכרטיס לטופס עריכה במקום
function editChild(id) {
  const c = cachedChildren.find(x => x.id === id);
  const card = $('child-card-' + id);
  if (!c || !card) return;
  const F = (lbl, inputId, val, type, extra) =>
    '<div style="flex:1;min-width:110px">' +
      '<label style="font-size:11.5px;color:var(--muted);display:block;margin-bottom:3px">' + lbl + '</label>' +
      '<input id="' + inputId + '" type="' + type + '" value="' + val + '" ' + (extra || '') +
      ' style="width:100%;padding:7px 9px;border:1px solid var(--border);border-radius:8px;font-size:13.5px">' +
    '</div>';

  card.innerHTML =
    '<div style="display:flex;flex-direction:column;gap:9px">' +
      F('שם הילד', 'child-e-name-' + id, esc(c.child_name), 'text', '') +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        F('תאריך לידה', 'child-e-birth-' + id, c.birth_date || '', 'date', '') +
        F('גיל יעד', 'child-e-age-' + id, c.target_age || 18, 'number', 'min="1" max="40"') +
      '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
        F('הפקדה חודשית (₪)', 'child-e-monthly-' + id, c.monthly_deposit || 0, 'number', 'min="0"') +
        F('תשואה שנתית (%)', 'child-e-rate-' + id, c.annual_rate || 0, 'number', 'min="0" step="0.1"') +
      '</div>' +
      F('שווי נוכחי (₪)', 'child-e-value-' + id, c.current_value || 0, 'number', 'min="0"') +
      '<div style="display:flex;gap:7px;margin-top:3px">' +
        '<button class="btn-save-sm" style="flex:1" onclick="saveChildEdit(\'' + id + '\')">✓ שמור</button>' +
        '<button class="btn-cancel-sm" style="flex:1" onclick="renderChildren()">✕ ביטול</button>' +
      '</div>' +
    '</div>';
  const n = $('child-e-name-' + id);
  if (n) n.focus();
}

async function saveChildEdit(id) {
  const name = $('child-e-name-' + id).value.trim();
  const birth = $('child-e-birth-' + id).value;
  const age = parseInt($('child-e-age-' + id).value);
  const monthly = parseFloat($('child-e-monthly-' + id).value);
  const rate = parseFloat($('child-e-rate-' + id).value);
  const value = parseFloat($('child-e-value-' + id).value);
  if (!name) { alert('נא למלא שם'); return; }
  await sb.from('child_savings').update({
    child_name: name,
    birth_date: birth || null,
    target_age: isNaN(age) ? 18 : age,
    monthly_deposit: isNaN(monthly) ? 0 : Math.max(0, monthly),
    annual_rate: isNaN(rate) ? 0 : Math.max(0, rate),
    current_value: isNaN(value) ? 0 : Math.max(0, value)
  }).eq('id', id);
  await loadChildren();
}

// ── פירוט רכיבים ליעד ──
let openGoalItems = null; // איזה יעד פתוח כרגע לפירוט
let expandedGoalItems = null; // איזה יעד מציג את כל הרכיבים
// כרטיסים מכווצים — נשמר בין טעינות
let collapsedGoals = new Set(JSON.parse(localStorage.getItem('cf_collapsed_goals') || '[]'));
let focusedGoal = null; // יעד במיקוד — תצוגת מסך מלא
const GOAL_COLORS = ['#2563eb', '#0d9c6e', '#e76f51', '#8b5cf6', '#f59e0b', '#ec4899', '#14b8a6', '#64748b'];
function goalDateStr(d) { if (!d) return ''; const p = String(d).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : d; }
function pickGoalColor(id, c) {
  const inp = $('goal-e-color-' + id); if (inp) inp.value = c;
  document.querySelectorAll('#goal-card-' + id + ' [data-c]').forEach(b => { b.style.borderColor = b.getAttribute('data-c') === c ? 'var(--text)' : 'transparent'; });
}
function focusGoal(id) { focusedGoal = id; openGoalItems = id; renderHomeGoalsList(); try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {} }
function closeFocusGoal() { focusedGoal = null; renderHomeGoalsList(); }

function toggleGoalCollapse(id) {
  if (collapsedGoals.has(id)) {
    collapsedGoals.delete(id);
  } else {
    collapsedGoals.add(id);
    // כשמכווצים — סוגרים גם את הפירוט שלו
    if (openGoalItems === id) openGoalItems = null;
  }
  localStorage.setItem('cf_collapsed_goals', JSON.stringify([...collapsedGoals]));
  renderHomeGoalsList();
}

function toggleGoalItemsExpand(id) {
  expandedGoalItems = (expandedGoalItems === id) ? null : id;
  renderHomeGoalsList();
}

function toggleGoalItems(id) {
  openGoalItems = (openGoalItems === id) ? null : id;
  renderHomeGoalsList();
}

function goalItemsHtml(g) {
  const items = itemsForGoal(g.id);
  const total = items.reduce((s, i) => s + itemLineTotal(i), 0);
  const open = openGoalItems === g.id;

  const header = '<div onclick="toggleGoalItems(\'' + g.id + '\')" ' +
    'style="display:flex;justify-content:space-between;align-items:center;cursor:pointer;font-size:11.5px;color:var(--muted);padding:7px 0;border-top:1px solid var(--border);margin-top:2px">' +
      '<span>🧩 פירוט' + (items.length ? ' · ' + items.length + ' רכיבים' : '') + '</span>' +
      '<span style="transition:transform .2s;display:inline-block' + (open ? ';transform:rotate(180deg)' : '') + '">▾</span>' +
    '</div>';

  if (!open) return header;

  // רשימה ארוכה — מציגים 5 ראשונים עד שלוחצים "הצג הכל"
  const LIMIT = 5;
  const expanded = expandedGoalItems === g.id;
  const shown = (items.length > LIMIT && !expanded) ? items.slice(0, LIMIT) : items;

  const rows = items.length
    ? '<div id="gi-list-' + g.id + '">' + shown.map(i => {
        const col = i.color || '';
        const dot = col ? col : 'transparent';
        return '<div class="gi-row" draggable="true" data-id="' + i.id + '" data-goal="' + g.id + '" ' +
          'ondragstart="giDragStart(event)" ondragover="giDragOver(event)" ondrop="giDrop(event)" ondragend="giDragEnd(event)" ' +
          'style="display:flex;align-items:center;gap:3px;padding:5px 0;font-size:12.5px;border-bottom:1px solid var(--border);' +
          (col ? 'border-right:3px solid ' + col + ';padding-right:5px;' : 'border-right:3px solid transparent;padding-right:5px;') + '">' +
          '<span class="gi-handle" title="גרור לסידור" style="cursor:grab;color:var(--muted);font-size:12px;padding:0 1px;user-select:none">⋮⋮</span>' +
          '<span onclick="openColorPicker(event,\'' + i.id + '\')" title="בחר צבע" ' +
            'style="width:11px;height:11px;border-radius:50%;background:' + dot + ';border:1.5px solid ' + (col ? col : 'var(--border)') + ';cursor:pointer;flex:0 0 auto"></span>' +
          '<input value="' + esc(i.name) + '" ' +
            'onchange="updateGoalItemName(\'' + i.id + '\',this.value)" ' +
            'style="flex:1;min-width:0;padding:4px 5px;border:1px solid transparent;border-radius:6px;font-size:12.5px;background:transparent;color:var(--text)" ' +
            'onfocus="this.style.borderColor=\'var(--border)\';this.style.background=\'var(--surface)\'" ' +
            'onblur="this.style.borderColor=\'transparent\';this.style.background=\'transparent\'">' +
          '<input type="number" min="1" step="1" value="' + ((i.quantity === null || i.quantity === undefined) ? 1 : i.quantity) + '" ' +
            'onchange="updateGoalItemQty(\'' + i.id + '\',this.value)" title="כמות" ' +
            'style="width:34px;padding:4px 2px;border:1px solid var(--border);border-radius:6px;font-size:12px;text-align:center">' +
          '<span style="color:var(--muted);font-size:10px">×</span>' +
          '<input type="number" min="0" value="' + (i.amount || 0) + '" ' +
            'onchange="updateGoalItem(\'' + i.id + '\',this.value)" title="מחיר ליחידה" ' +
            'style="width:58px;padding:4px 4px;border:1px solid var(--border);border-radius:6px;font-size:12px;text-align:left">' +
          '<span style="min-width:52px;text-align:left;font-weight:700;font-size:12px">' + fmt(itemLineTotal(i)) + '</span>' +
          '<button class="btn-del" style="font-size:13px;padding:2px 3px" onclick="deleteGoalItem(\'' + i.id + '\')" title="מחק">&#128465;</button>' +
        '</div>';
      }).join('') + '</div>'
    : '<div style="font-size:12px;color:var(--muted);padding:6px 0">אין רכיבים עדיין — הוסף למטה כדי לפרק את היעד.</div>';

  const moreRow = (items.length > LIMIT)
    ? '<div onclick="toggleGoalItemsExpand(\'' + g.id + '\')" ' +
      'style="text-align:center;cursor:pointer;font-size:11.5px;color:var(--blue,#2563eb);padding:7px 0;font-weight:600">' +
        (expanded ? '▲ הצג פחות' : '▼ הצג את כל ' + items.length + ' הרכיבים') +
      '</div>'
    : '';

  const totalRow = items.length
    ? '<div style="display:flex;justify-content:space-between;padding:7px 0 3px;font-size:12.5px;font-weight:800">' +
        '<span>סה"כ</span><span>' + fmt(total) + '</span></div>'
    : '';

  const addRow =
    '<div style="display:flex;gap:4px;margin-top:8px">' +
      '<input id="gi-name-' + g.id + '" placeholder="רכיב..." ' +
        'style="flex:1;min-width:0;padding:6px 8px;border:1px solid var(--border);border-radius:7px;font-size:12.5px">' +
      '<input id="gi-qty-' + g.id + '" type="number" min="1" step="1" value="1" title="כמות" ' +
        'style="width:34px;padding:6px 2px;border:1px solid var(--border);border-radius:7px;font-size:12px;text-align:center">' +
      '<input id="gi-amount-' + g.id + '" type="number" min="0" placeholder="₪" title="מחיר ליחידה" ' +
        'style="width:58px;padding:6px 4px;border:1px solid var(--border);border-radius:7px;font-size:12px">' +
      '<button class="btn-save-sm" onclick="addGoalItem(\'' + g.id + '\')">+</button>' +
    '</div>';

  const shareRow = items.length
    ? '<div style="margin-top:9px">' +
        '<button class="btn-outline" style="width:100%;font-size:12px;padding:7px" onclick="copyGoalItems(\'' + g.id + '\')">📋 העתק את הרשימה</button>' +
      '</div>'
    : '';

  return header + '<div style="padding-bottom:4px">' + rows + moreRow + totalRow + addRow + shareRow + '</div>';
}

// בונה את טקסט הפירוט לשיתוף
function goalItemsText(goalId) {
  const g = cachedGoals.find(x => x.id === goalId);
  const items = itemsForGoal(goalId);
  if (!g || !items.length) return '';
  const total = items.reduce((s, i) => s + itemLineTotal(i), 0);
  let txt = '🎯 ' + g.name + '\n\n';
  items.forEach(i => {
    const q = (i.quantity === null || i.quantity === undefined) ? 1 : Number(i.quantity);
    const qTxt = q > 1 ? ' ×' + q : '';
    txt += '• ' + i.name + qTxt + ' — ' + fmt(itemLineTotal(i)) + '\n';
  });
  txt += '\nסה"כ: ' + fmt(total);
  return txt;
}

async function copyGoalItems(goalId) {
  const txt = goalItemsText(goalId);
  if (!txt) return;
  const btn = event && event.currentTarget ? event.currentTarget : null;
  const done = () => {
    if (!btn) return;
    const orig = btn.textContent;
    btn.textContent = '✅ הועתק';
    setTimeout(() => { btn.textContent = orig; }, 1600);
  };
  try {
    await navigator.clipboard.writeText(txt);
    done();
  } catch (e) {
    // גיבוי לדפדפנים שחוסמים גישה ללוח
    const ta = document.createElement('textarea');
    ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); }
    catch (e2) { alert('לא הצלחתי להעתיק. אפשר לסמן ידנית.'); }
    document.body.removeChild(ta);
  }
}

async function addGoalItem(goalId) {
  const name = $('gi-name-' + goalId).value.trim();
  const amount = parseFloat($('gi-amount-' + goalId).value);
  let qty = parseFloat($('gi-qty-' + goalId) ? $('gi-qty-' + goalId).value : 1);
  if (isNaN(qty) || qty < 1) qty = 1;
  if (!name || isNaN(amount) || amount < 0) return;
  await sb.from('goal_items').insert({
    user_id: currentUser.id, goal_id: goalId, name, amount, quantity: qty,
    sort_order: itemsForGoal(goalId).length
  });
  await syncGoalTarget(goalId);
}

// עדכון שם רכיב — לא מרנדר מחדש כדי לא לסגור את הפאנל
async function updateGoalItemName(itemId, value) {
  const name = (value || '').trim();
  if (!name) return;
  await sb.from('goal_items').update({ name }).eq('id', itemId);
  const item = cachedGoalItems.find(i => i.id === itemId);
  if (item) item.name = name;
}

// ── קטלוג בצבע ──
const GI_COLORS = ['#2563eb', '#0d9c6e', '#b45309', '#dc2626', '#7c3aed', '#0891b2'];
async function setGoalItemColor(itemId, color) {
  const item = cachedGoalItems.find(i => i.id === itemId);
  if (!item) return;
  await sb.from('goal_items').update({ color: color || null }).eq('id', itemId);
  item.color = color || null;
  closeColorPicker();
  renderHomeGoalsList();
}

function closeColorPicker() {
  const p = document.getElementById('gi-color-picker');
  if (p) p.remove();
}

// בורר צבעים — נפתח ליד העיגול שנלחץ
function openColorPicker(e, itemId) {
  e.stopPropagation();
  closeColorPicker();
  const item = cachedGoalItems.find(i => i.id === itemId);
  const cur = item ? (item.color || '') : '';
  const dot = e.currentTarget.getBoundingClientRect();

  const box = document.createElement('div');
  box.id = 'gi-color-picker';
  box.style.cssText =
    'position:fixed;z-index:9999;background:var(--surface);border:1px solid var(--border);' +
    'border-radius:10px;padding:8px;box-shadow:0 8px 24px rgba(0,0,0,.16);display:flex;gap:6px;align-items:center';
  box.innerHTML =
    GI_COLORS.map(c =>
      '<span onclick="setGoalItemColor(\'' + itemId + '\',\'' + c + '\')" ' +
      'style="width:20px;height:20px;border-radius:50%;background:' + c + ';cursor:pointer;' +
      'border:2px solid ' + (cur === c ? 'var(--text)' : 'transparent') + '"></span>'
    ).join('') +
    '<span onclick="setGoalItemColor(\'' + itemId + '\',\'\')" title="ללא צבע" ' +
    'style="width:20px;height:20px;border-radius:50%;background:transparent;cursor:pointer;' +
    'border:2px solid ' + (cur ? 'var(--border)' : 'var(--text)') + ';display:flex;align-items:center;' +
    'justify-content:center;font-size:12px;color:var(--muted)">✕</span>';

  document.body.appendChild(box);
  // מיקום מתחת לעיגול, בלי לחרוג מהמסך
  const w = box.offsetWidth;
  let left = dot.left + dot.width / 2 - w / 2;
  left = Math.max(8, Math.min(left, window.innerWidth - w - 8));
  box.style.left = left + 'px';
  box.style.top = (dot.bottom + 6) + 'px';

  // סגירה בלחיצה מחוץ לבורר
  setTimeout(() => {
    document.addEventListener('click', function onDoc(ev) {
      if (!box.contains(ev.target)) { closeColorPicker(); document.removeEventListener('click', onDoc); }
    });
  }, 0);
}

// ── גרירה לסידור מחדש ──
let giDragId = null;
function giDragStart(e) {
  const row = e.currentTarget;
  giDragId = row.getAttribute('data-id');
  row.style.opacity = '0.4';
  e.dataTransfer.effectAllowed = 'move';
  try { e.dataTransfer.setData('text/plain', giDragId); } catch (err) {}
}
function giDragEnd(e) {
  e.currentTarget.style.opacity = '';
  document.querySelectorAll('.gi-row').forEach(r => { r.style.borderTop = ''; });
}
function giDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const row = e.currentTarget;
  if (row.getAttribute('data-id') === giDragId) return;
  document.querySelectorAll('.gi-row').forEach(r => { r.style.borderTop = ''; });
  row.style.borderTop = '2px solid var(--blue,#2563eb)';
}
async function giDrop(e) {
  e.preventDefault();
  const row = e.currentTarget;
  row.style.borderTop = '';
  const targetId = row.getAttribute('data-id');
  const goalId = row.getAttribute('data-goal');
  if (!giDragId || giDragId === targetId) return;

  // אם הרשימה מכווצת — סידור מחדש עלול להיות מבלבל
  const allItems = itemsForGoal(goalId);
  if (allItems.length > 5 && expandedGoalItems !== goalId) {
    alert('כדי לסדר מחדש, לחץ קודם על "הצג את כל הרכיבים".');
    giDragId = null;
    return;
  }

  const items = allItems.slice();
  const from = items.findIndex(i => i.id === giDragId);
  const to = items.findIndex(i => i.id === targetId);
  if (from === -1 || to === -1) return;

  const [moved] = items.splice(from, 1);
  items.splice(to, 0, moved);

  // כתוב מחדש את הסדר לכל הרכיבים
  await Promise.all(items.map((i, idx) =>
    sb.from('goal_items').update({ sort_order: idx }).eq('id', i.id)
  ));
  giDragId = null;
  await loadGoalItems();
  renderHomeGoalsList();
}

async function updateGoalItemQty(itemId, value) {
  let q = parseFloat(value);
  if (isNaN(q) || q < 1) q = 1;
  const item = cachedGoalItems.find(i => i.id === itemId);
  await sb.from('goal_items').update({ quantity: q }).eq('id', itemId);
  if (item) await syncGoalTarget(item.goal_id);
}

async function updateGoalItem(itemId, value) {
  const val = parseFloat(value);
  if (isNaN(val) || val < 0) return;
  const item = cachedGoalItems.find(i => i.id === itemId);
  await sb.from('goal_items').update({ amount: val }).eq('id', itemId);
  if (item) await syncGoalTarget(item.goal_id);
}

async function deleteGoalItem(itemId) {
  const item = cachedGoalItems.find(i => i.id === itemId);
  await sb.from('goal_items').delete().eq('id', itemId);
  if (item) await syncGoalTarget(item.goal_id);
}

// מסנכרן את סכום היעד לסך הרכיבים (אם יש רכיבים)
async function syncGoalTarget(goalId) {
  await loadGoalItems();
  const items = itemsForGoal(goalId);
  if (items.length) {
    const total = items.reduce((s, i) => s + itemLineTotal(i), 0);
    await sb.from('home_goals').update({ target_amount: total }).eq('id', goalId);
  }
  await loadGoals();
}

// עריכת יעד — הופך את הכרטיס לטופס עריכה במקום
function editGoal(id) {
  const g = cachedGoals.find(x => x.id === id);
  const card = $('goal-card-' + id);
  if (!g || !card) return;
  card.innerHTML =
    '<div style="display:flex;flex-direction:column;gap:9px">' +
      '<div>' +
        '<label style="font-size:11.5px;color:var(--muted);display:block;margin-bottom:3px">שם היעד</label>' +
        '<input id="goal-e-name-' + id + '" value="' + esc(g.name) + '" style="width:100%;padding:7px 9px;border:1px solid var(--border);border-radius:8px;font-size:13.5px">' +
      '</div>' +
      '<div style="display:flex;gap:8px">' +
        '<div style="flex:1">' +
          '<label style="font-size:11.5px;color:var(--muted);display:block;margin-bottom:3px">סכום יעד (₪)' +
            (itemsForGoal(id).length ? ' <span style="font-size:10.5px">· מחושב מהפירוט</span>' : '') + '</label>' +
          '<input id="goal-e-target-' + id + '" type="number" min="1" value="' + (g.target_amount || 0) + '"' +
            (itemsForGoal(id).length ? ' readonly style="width:100%;padding:7px 9px;border:1px solid var(--border);border-radius:8px;font-size:13.5px;background:var(--bg);color:var(--muted)"' :
             ' style="width:100%;padding:7px 9px;border:1px solid var(--border);border-radius:8px;font-size:13.5px"') + '>' +
        '</div>' +
        '<div style="flex:1">' +
          '<label style="font-size:11.5px;color:var(--muted);display:block;margin-bottom:3px">נחסך עד כה (₪)</label>' +
          '<input id="goal-e-saved-' + id + '" type="number" min="0" value="' + (g.saved_amount || 0) + '" style="width:100%;padding:7px 9px;border:1px solid var(--border);border-radius:8px;font-size:13.5px">' +
        '</div>' +
      '</div>' +
      '<div>' +
        '<label style="font-size:11.5px;color:var(--muted);display:block;margin-bottom:3px">תאריך יעד</label>' +
        '<input id="goal-e-deadline-' + id + '" type="date" value="' + (g.deadline || '') + '" style="width:100%;padding:7px 9px;border:1px solid var(--border);border-radius:8px;font-size:13.5px">' +
      '</div>' +
      '<div>' +
        '<label style="font-size:11.5px;color:var(--muted);display:block;margin-bottom:5px">צבע הכרטיס</label>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
          GOAL_COLORS.map(c => '<button type="button" data-c="' + c + '" onclick="pickGoalColor(\'' + id + '\',\'' + c + '\')" style="width:26px;height:26px;border-radius:50%;background:' + c + ';border:2px solid ' + ((g.color || '') === c ? 'var(--text)' : 'transparent') + ';cursor:pointer;padding:0"></button>').join('') +
        '</div>' +
        '<input type="hidden" id="goal-e-color-' + id + '" value="' + (g.color || '') + '">' +
      '</div>' +
      '<div style="display:flex;gap:7px;margin-top:3px">' +
        '<button class="btn-save-sm" style="flex:1" onclick="saveGoalEdit(\'' + id + '\')">✓ שמור</button>' +
        '<button class="btn-cancel-sm" style="flex:1" onclick="renderHomeGoalsList()">✕ ביטול</button>' +
      '</div>' +
    '</div>';
  const nameInput = $('goal-e-name-' + id);
  if (nameInput) nameInput.focus();
}

async function saveGoalEdit(id) {
  const name = $('goal-e-name-' + id).value.trim();
  const target = parseFloat($('goal-e-target-' + id).value);
  const saved = parseFloat($('goal-e-saved-' + id).value);
  const deadline = $('goal-e-deadline-' + id).value;
  const hasItems = itemsForGoal(id).length > 0;
  if (!name) { alert('נא למלא שם ליעד'); return; }
  const patch = {
    name,
    saved_amount: isNaN(saved) ? 0 : Math.max(0, saved),
    deadline: deadline || null,
    color: ($('goal-e-color-' + id) ? $('goal-e-color-' + id).value : '') || null
  };
  if (!hasItems) patch.target_amount = (isNaN(target) || target < 0) ? 0 : target;
  await sb.from('home_goals').update(patch).eq('id', id);
  await loadGoals();
}

// ── סיכום כל היעדים ──
function renderGoalsSummary() {
  const el = $('goals-summary');
  if (!el) return;
  if (!cachedGoals.length) { el.innerHTML = ''; return; }

  const today = new Date(); today.setHours(0, 0, 0, 0);
  let totalTarget = 0, totalSaved = 0, monthlyNeeded = 0, doneCount = 0;

  cachedGoals.forEach(g => {
    const target = g.target_amount || 0;
    const saved = g.saved_amount || 0;
    totalTarget += target;
    totalSaved += saved;
    if (target > 0 && saved >= target) doneCount++;
    // כמה צריך להפריש החודש כדי לעמוד בדדליין
    if (g.deadline && target > saved) {
      const dl = new Date(g.deadline + 'T00:00:00');
      const daysLeft = Math.ceil((dl - today) / 86400000);
      if (daysLeft > 0) {
        const monthsLeft = Math.max(daysLeft / 30.44, 0.1);
        monthlyNeeded += (target - saved) / monthsLeft;
      }
    }
  });

  const pct = totalTarget > 0 ? Math.min(Math.round(totalSaved / totalTarget * 100), 100) : 0;
  const remaining = Math.max(0, totalTarget - totalSaved);
  const allDone = doneCount === cachedGoals.length && totalTarget > 0;
  const color = allDone ? 'var(--green)' : 'var(--blue,#2563eb)';

  el.innerHTML =
    '<div class="goals-summary">' +
      '<div class="gs-top">' +
        '<div>' +
          '<div class="gs-label">📊 סה"כ בכל היעדים</div>' +
          '<div style="display:flex;align-items:baseline;gap:7px;flex-wrap:wrap">' +
            '<span class="gs-amount" style="color:' + color + '">' + fmt(totalSaved) + '</span>' +
            '<span class="gs-of">מתוך ' + fmt(totalTarget) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="gs-pct" style="color:' + color + '">' + pct + '<small>%</small></div>' +
      '</div>' +
      '<div class="gs-bar"><span style="width:' + pct + '%;background:' + color + '"></span></div>' +
      '<div class="gs-stats">' +
        '<div class="gs-stat">' +
          '<div class="gs-stat-lbl">יעדים</div>' +
          '<div class="gs-stat-val">' + cachedGoals.length + (doneCount ? ' <span style="font-size:12px;color:var(--green);font-weight:600">· ' + doneCount + ' הושלמו</span>' : '') + '</div>' +
        '</div>' +
        '<div class="gs-stat">' +
          '<div class="gs-stat-lbl">נשאר לחסוך</div>' +
          '<div class="gs-stat-val">' + fmt(remaining) + '</div>' +
        '</div>' +
        '<div class="gs-stat">' +
          '<div class="gs-stat-lbl">נדרש לחודש</div>' +
          '<div class="gs-stat-val" style="color:' + (monthlyNeeded > 0 ? 'var(--amber,#b45309)' : 'var(--muted)') + '">' +
            (monthlyNeeded > 0 ? fmt(Math.ceil(monthlyNeeded)) : '—') + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';

  // חלוקה חודשית לפי יעד (מתקפל)
  const bd = cachedGoals.map(g => {
    const target = g.target_amount || 0, saved = g.saved_amount || 0;
    const remaining = Math.max(0, target - saved);
    const dot = g.color || 'var(--blue,#2563eb)';
    let perM = 0, info = 'ללא תאריך יעד';
    if (g.deadline && remaining > 0) {
      const dl = new Date(g.deadline + 'T00:00:00');
      const daysLeft = Math.ceil((dl - today) / 86400000);
      if (daysLeft > 0) { perM = Math.ceil(remaining / Math.max(daysLeft / 30.44, 0.1)); info = 'עד ' + goalDateStr(g.deadline); }
      else info = 'עבר התאריך';
    } else if (remaining <= 0 && target > 0) { info = '🎉 הושלם'; }
    return '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:7px 0;border-top:1px solid var(--border);font-size:12.5px">' +
      '<div style="display:flex;align-items:center;gap:7px;min-width:0"><span style="width:8px;height:8px;border-radius:50%;background:' + dot + ';flex:none"></span><span style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(g.name) + '</span><span style="color:var(--muted);font-size:11px">· ' + info + '</span></div>' +
      '<span style="font-weight:700;white-space:nowrap;color:' + (perM > 0 ? 'var(--amber,#b45309)' : 'var(--muted)') + '">' + (perM > 0 ? fmt(perM) + '/חו׳' : '—') + '</span>' +
    '</div>';
  }).join('');
  el.innerHTML +=
    '<div style="margin-top:10px">' +
      '<div onclick="toggleGoalsMonthly()" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;font-size:11.5px;color:var(--muted);font-weight:600">' +
        '<span>📅 חלוקה חודשית לפי יעד</span>' +
        '<span id="goals-monthly-chev" style="transition:transform .2s;display:inline-block">▾</span>' +
      '</div>' +
      '<div id="goals-monthly-list" style="display:none;margin-top:4px">' + bd + '</div>' +
    '</div>';
  if (localStorage.getItem('cf_goals_monthly_open') === '1') {
    const l = $('goals-monthly-list'), c = $('goals-monthly-chev');
    if (l) l.style.display = 'block'; if (c) c.style.transform = 'rotate(180deg)';
  }
}
function toggleGoalsMonthly() {
  const l = $('goals-monthly-list'), c = $('goals-monthly-chev');
  if (!l) return;
  const open = l.style.display === 'none';
  l.style.display = open ? 'block' : 'none';
  if (c) c.style.transform = open ? 'rotate(180deg)' : '';
  localStorage.setItem('cf_goals_monthly_open', open ? '1' : '0');
}

function renderHomeGoalsList() {
  const el = $('goals-list');
  if (!el) return;
  const topWrap = document.querySelector('.goals-top');
  const focusMode = !!(focusedGoal && cachedGoals.some(g => g.id === focusedGoal));
  if (topWrap) topWrap.style.display = '';   // הטופס והסיכום נשארים תמיד
  renderGoalsSummary();
  if (!cachedGoals.length) {
    el.innerHTML = '<div class="empty">עדיין אין יעדים. הוסף יעד ראשון למעלה 🎯</div>';
    return;
  }
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const goalsToRender = focusMode ? cachedGoals.filter(g => g.id === focusedGoal) : cachedGoals;
  const backBtn = focusMode ? '<button class="btn-paid-quick" onclick="closeFocusGoal()" style="width:auto;padding:9px 18px;margin-bottom:16px">← חזרה לרשימת היעדים</button>' : '';

  el.innerHTML = backBtn + '<div class="goal-cards' + (focusMode ? ' goal-focus' : '') + '">' + goalsToRender.map(g => {
    const saved = g.saved_amount || 0;
    const target = g.target_amount || 0;
    const pct = target > 0 ? Math.min(Math.round(saved / target * 100), 100) : 0;
    const done = saved >= target && target > 0;
    const remaining = Math.max(0, target - saved);

    let barColor = g.color || (done ? 'var(--green)' : 'var(--blue,#2563eb)');
    const dotColor = g.color || (done ? 'var(--green)' : 'var(--blue,#2563eb)');
    let cardCls = done ? 'goal-card done' : 'goal-card';
    const chips = [];

    // ── דדליין + קצב ──
    if (g.deadline && !done) {
      const dl = new Date(g.deadline + 'T00:00:00');
      const daysLeft = Math.ceil((dl - today) / 86400000);
      const dlStr = g.deadline.split('-').reverse().join('/');

      if (daysLeft < 0) {
        chips.push('<span class="goal-chip bad">⏰ עבר ' + dlStr + '</span>');
        barColor = 'var(--red)';
        cardCls = 'goal-card behind';
      } else {
        const monthsLeft = Math.max(daysLeft / 30.44, 0.1);
        const perMonth = Math.ceil(remaining / monthsLeft);
        chips.push('<span class="goal-chip">🎯 ' + dlStr + ' · ' + daysLeft + ' ימים</span>');
        chips.push('<span class="goal-chip">💰 ' + fmt(perMonth) + ' לחודש</span>');

        // האם בקצב — מוצג רק אחרי שבוע, כדי שההשוואה תהיה משמעותית
        const created = g.created_at ? new Date(g.created_at) : null;
        if (created) {
          const totalMs = dl - created, elapsedMs = today - created;
          const weekMs = 7 * 86400000;
          if (totalMs > 0 && elapsedMs > weekMs) {
            const expected = target * Math.min(elapsedMs / totalMs, 1);
            const diff = saved - expected;
            if (Math.abs(diff) < target * 0.02) {
              chips.push('<span class="goal-chip ok">✓ בקצב</span>');
            } else if (diff > 0) {
              chips.push('<span class="goal-chip ok">▲ ' + fmt(Math.round(diff)) + ' לפני</span>');
            } else {
              chips.push('<span class="goal-chip warn">▼ ' + fmt(Math.round(-diff)) + ' מאחור</span>');
              barColor = 'var(--amber,#b45309)';
              cardCls = 'goal-card behind';
            }
          }
        }
      }
    }

    // ── רצף ──
    const streak = goalStreak(g.id);
    if (streak >= 2) chips.push('<span class="goal-chip fire">🔥 ' + streak + ' חודשים</span>');

    // הצבע שבחר המשתמש תמיד מנצח (הסטטוס עדיין מוצג בצ׳יפים)
    if (g.color) barColor = g.color;
    const isCollapsed = !focusMode;
    const topRow =
      '<div class="goal-card-top" style="margin-bottom:' + (isCollapsed ? '0' : '12px') + '">' +
        '<div style="display:flex;align-items:center;gap:6px;min-width:0;flex:1">' +
          '<button class="goal-collapse-btn" onclick="event.stopPropagation();' + (focusMode ? 'closeFocusGoal()' : 'focusGoal(\'' + g.id + '\')') + '" title="' + (focusMode ? 'חזרה' : 'פתח') + '">' + (focusMode ? '▾' : '‹') + '</button>' +
          '<div class="goal-name"><span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:' + dotColor + ';margin-inline-end:7px;flex:none"></span>' + (done ? '✅ ' : '') + esc(g.name) + '</div>' +
        '</div>' +
        '<div class="goal-pct" style="color:' + barColor + ';font-size:' + (isCollapsed ? '15px' : '18px') + '">' + pct + '<small>%</small></div>' +
      '</div>';

    if (isCollapsed) {
      return '<div class="' + cardCls + ' collapsed" id="goal-card-' + g.id + '" onclick="focusGoal(\'' + g.id + '\')" style="cursor:pointer">' +
        topRow +
        '<div class="goal-bar" style="margin:8px 0 0"><span style="width:' + pct + '%;background:' + barColor + '"></span></div>' +
        (g.deadline ? '<div style="font-size:11px;color:var(--muted);margin-top:8px">🎯 עד ' + goalDateStr(g.deadline) + '</div>' : '') +
      '</div>';
    }

    return '<div class="' + cardCls + '" id="goal-card-' + g.id + '">' +
      topRow +
      '<div class="goal-bar"><span style="width:' + pct + '%;background:' + barColor + '"></span></div>' +
      '<div class="goal-amounts">' +
        '<span class="goal-saved" style="color:' + barColor + '">' + fmt(saved) + '</span>' +
        '<span style="color:var(--muted)">מתוך ' + fmt(target) + '</span>' +
      '</div>' +
      (chips.length ? '<div class="goal-meta">' + chips.join('') + '</div>' : '') +
      '<div style="font-size:12px;color:var(--muted);margin-bottom:10px">' +
        (target <= 0 ? '🧩 הוסף רכיבים בפירוט למטה כדי לקבוע את הסכום' :
          (done ? '🎉 הגעת ליעד!' : 'נשאר ' + fmt(remaining))) +
      '</div>' +
      '<div class="goal-actions">' +
        '<button class="btn-paid-quick" onclick="updateGoalSaved(\'' + g.id + '\',\'custom\')">➕ הוסף חיסכון</button>' +
        '<button class="btn-edit-sm" onclick="editGoal(\'' + g.id + '\')" title="ערוך יעד">&#9998;</button>' +
        '<button class="btn-del" onclick="deleteGoal(\'' + g.id + '\')" title="מחק">&#128465;</button>' +
      '</div>' +
      goalItemsHtml(g) +
    '</div>';
  }).join('') + '</div>';
}

function renderHomeGoals() { calcCompound(); }

// ── השקעות לעסק ──
let cachedEquipment = [];
async function loadEquipment() {
  const res = await sb.from('equipment_plans').select('*').eq('user_id', currentUser.id).order('created_at');
  cachedEquipment = res.data || [];
  renderEquipment();
}
async function addEquipment() {
  const name = $('eq-name').value.trim();
  const qty = parseFloat($('eq-qty').value) || 1;
  const price = parseFloat($('eq-price').value) || 0;
  if (!name || price <= 0) return;
  $('btn-add-eq').disabled = true;
  await sb.from('equipment_plans').insert({ user_id: currentUser.id, name, quantity: qty, unit_price: price });
  $('eq-name').value = ''; $('eq-qty').value = '1'; $('eq-price').value = '';
  $('btn-add-eq').disabled = false;
  await loadEquipment();
}
async function deleteEquipment(id) {
  if (!confirm('למחוק פריט זה?')) return;
  await sb.from('equipment_plans').delete().eq('id', id);
  await loadEquipment();
}
// עריכת כמות או מחיר ישירות מהטבלה
async function updateEquipment(id, field, value) {
  const val = parseFloat(value);
  if (isNaN(val) || val < 0) return;
  const patch = {};
  patch[field] = val;
  await sb.from('equipment_plans').update(patch).eq('id', id);
  await loadEquipment();
}

// ════════════ תכנון עתידי / תחזית תזרים ════════════
// היגיון: לכל חודש עתידי לוקחים את הממוצע בין (א) מה שכבר ביומן — אירועים
// מתוזמנים לפי סטטוס, ו-(ב) הממוצע ההיסטורי של החודשים האחרונים.
// תרחישים נשענים על סטטוס אמיתי, לא אחוז שרירותי.
let fcScenario = 'real';

// כל האירועים בחודש נתון (YYYY-MM) לפי event_date
function fcEventsInMonth(ym) {
  return cachedEventDetails.filter(d => d.event_date && d.event_date.slice(0, 7) === ym && d.price > 0);
}

const FC_PAID = ['בוצע תשלום', 'בוצע תשלום + חשבונית מס'];
const FC_PENDING = ['לא יצאה דרישת תשלום', 'יצאה דרישת תשלום'];

// הכנסה מהיומן לחודש, לפי התרחיש:
// פסימי — רק אירועים ששולמו/אושרו · סביר — משוקלל (בהמתנה ×0.7) · מיטבי — הכל
function fcCalendarIncome(ym, scen) {
  const evs = fcEventsInMonth(ym);
  let sum = 0;
  evs.forEach(d => {
    const paid = FC_PAID.includes(d.status);
    const pending = FC_PENDING.includes(d.status);
    if (scen === 'pess') { if (paid) sum += d.price; }
    else if (scen === 'opt') { if (paid || pending) sum += d.price; }
    else { if (paid) sum += d.price; else if (pending) sum += d.price * 0.7; }
  });
  return sum;
}

// ממוצע הכנסות חודשי היסטורי — לפי אירועים ששולמו ב-6 החודשים האחרונים
function fcHistoricalAvgIncome() {
  const now = new Date();
  const buckets = {};
  cachedEventDetails.forEach(d => {
    if (!d.event_date || !d.price) return;
    if (!FC_PAID.includes(d.status)) return;
    const ym = d.event_date.slice(0, 7);
    buckets[ym] = (buckets[ym] || 0) + d.price;
  });
  const keys = [];
  for (let i = 1; i <= 6; i++) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0'));
  }
  const vals = keys.map(k => buckets[k]).filter(v => v != null);
  if (!vals.length) return 0;
  return vals.reduce((s, v) => s + v, 0) / vals.length;
}

// הוצאות חודשיות צפויות: קבועות + ממוצע ההוצאות המשתנות מהחודש הנוכחי
function fcMonthlyExpense() {
  const recurring = cachedRecurring.reduce((s, r) => s + (r.amount || 0), 0);
  const variable = cachedTx.filter(t => t.type === 'expense')
    .reduce((s, t) => s + (t.amount || 0), 0);
  // הקבועות כבר מיובאות לתוך cachedTx, אז לוקחים את הגבוה מביניהם כדי לא לספור כפול
  return Math.max(recurring, variable);
}

// בונה את התחזית ל-6 חודשים קדימה
function fcBuild(scen) {
  const now = new Date();
  const histAvg = fcHistoricalAvgIncome();
  const expense = fcMonthlyExpense();
  const heb = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];
  const rows = [];
  for (let i = 1; i <= 6; i++) {
    const dt = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const ym = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0');
    const cal = fcCalendarIncome(ym, scen);
    const hasEvents = fcEventsInMonth(ym).length > 0;
    // ממוצע בין היומן להיסטוריה. אם אין אירועים בכלל — נשען על ההיסטוריה בלבד.
    let income;
    let src;
    if (hasEvents && histAvg > 0) { income = (cal + histAvg) / 2; src = 'יומן + היסטוריה'; }
    else if (hasEvents) { income = cal; src = 'לפי היומן'; }
    else { income = histAvg; src = 'ממוצע היסטורי'; }
    rows.push({ label: heb[dt.getMonth()], ym: ym, income: income, expense: expense, net: income - expense, src: src });
  }
  return rows;
}

const FC_SCEN_NOTES = {
  pess: 'פסימי — רק אירועים ששולמו או אושרו נספרים כהכנסה. תמונה זהירה.',
  real: 'סביר — אירועים ששולמו במלואם, אירועים בהמתנה משוקללים ב-70%. הערכה מאוזנת.',
  opt: 'מיטבי — כל האירועים ביומן נספרים במלואם, בהנחה שכולם ייסגרו.'
};

function fcSetScenario(scen, btn) {
  fcScenario = scen;
  document.querySelectorAll('#fc-scen button').forEach(b => b.classList.remove('on'));
  if (btn) btn.classList.add('on');
  renderForecast();
}

function renderForecast() {
  const scen = fcScenario;
  const rows = fcBuild(scen);
  const note = $('fc-scen-note');
  if (note) note.textContent = FC_SCEN_NOTES[scen];

  // כרטיסי סיכום — ממוצע חודשי על פני התחזית
  const avgInc = rows.reduce((s, r) => s + r.income, 0) / rows.length;
  const avgExp = rows.reduce((s, r) => s + r.expense, 0) / rows.length;
  const avgNet = avgInc - avgExp;
  const cards = $('fc-cards');
  if (cards) {
    cards.innerHTML =
      '<div class="fc-card"><div class="lbl">צפי הכנסות · ממוצע חודשי</div><div class="val" style="color:var(--green)">' + fmt(Math.round(avgInc)) + '</div></div>' +
      '<div class="fc-card"><div class="lbl">הוצאות צפויות</div><div class="val">' + fmt(Math.round(avgExp)) + '</div></div>' +
      '<div class="fc-card"><div class="lbl">צפוי להישאר</div><div class="val" style="color:' + (avgNet >= 0 ? 'var(--blue,#2563eb)' : 'var(--red)') + '">' + fmt(Math.round(avgNet)) + '</div></div>';
  }

  // גרף SVG של ה"צפוי להישאר" לאורך 6 חודשים
  const chart = $('fc-chart');
  if (chart) chart.innerHTML = fcChartSVG(rows);

  // טבלה חודשית
  const tbl = $('fc-table');
  if (tbl) {
    tbl.innerHTML = rows.map(r =>
      '<div class="fc-table-row">' +
        '<span class="m">' + r.label + '</span>' +
        '<span class="src">' + r.src + '</span>' +
        '<span class="amt" style="color:' + (r.net >= 0 ? 'var(--green)' : 'var(--red)') + '">' + fmt(Math.round(r.net)) + '</span>' +
      '</div>').join('');
  }
}

// גרף קו פשוט ב-SVG (בלי ספריות חיצוניות)
function fcChartSVG(rows) {
  const W = 620, H = 220, padL = 52, padR = 16, padT = 16, padB = 30;
  const nets = rows.map(r => r.net);
  let min = Math.min(0, ...nets), max = Math.max(0, ...nets);
  if (min === max) max = min + 1000;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const x = i => padL + (innerW * i) / (rows.length - 1);
  const y = v => padT + innerH - ((v - min) / (max - min)) * innerH;
  const zeroY = y(0);

  let pts = rows.map((r, i) => x(i) + ',' + y(r.net));
  const line = '<polyline points="' + pts.join(' ') + '" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
  const area = '<polygon points="' + x(0) + ',' + zeroY + ' ' + pts.join(' ') + ' ' + x(rows.length - 1) + ',' + zeroY + '" fill="#2563eb" opacity="0.08"/>';
  const dots = rows.map((r, i) =>
    '<circle cx="' + x(i) + '" cy="' + y(r.net) + '" r="4" fill="#2563eb" stroke="#fff" stroke-width="2"/>' +
    '<text x="' + x(i) + '" y="' + (y(r.net) - 10) + '" text-anchor="middle" font-size="10.5" font-weight="700" fill="var(--text)">' + fmt(Math.round(r.net)) + '</text>'
  ).join('');
  const xlabels = rows.map((r, i) =>
    '<text x="' + x(i) + '" y="' + (H - 10) + '" text-anchor="middle" font-size="11" fill="var(--muted)">' + r.label + '</text>'
  ).join('');
  const zeroLine = (min < 0)
    ? '<line x1="' + padL + '" y1="' + zeroY + '" x2="' + (W - padR) + '" y2="' + zeroY + '" stroke="var(--border)" stroke-width="1" stroke-dasharray="3,3"/>'
    : '';
  const ymin = '<text x="' + (padL - 8) + '" y="' + (y(min) + 4) + '" text-anchor="end" font-size="10" fill="var(--muted)">' + fmt(Math.round(min)) + '</text>';
  const ymax = '<text x="' + (padL - 8) + '" y="' + (y(max) + 4) + '" text-anchor="end" font-size="10" fill="var(--muted)">' + fmt(Math.round(max)) + '</text>';

  return '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;min-width:520px;height:auto" xmlns="http://www.w3.org/2000/svg">' +
    zeroLine + area + line + dots + xlabels + ymin + ymax + '</svg>';
}

function renderEquipment() {
  const el = $('equipment-table');
  if (!el) return;
  const grand = cachedEquipment.reduce((s, e) => s + (e.quantity || 0) * (e.unit_price || 0), 0);
  const gt = $('eq-grand-total');
  if (gt) gt.textContent = fmt(grand);

  if (!cachedEquipment.length) {
    el.innerHTML = '<div class="empty">עדיין לא נוספו השקעות. הוסף פריט ראשון למעלה 📈</div>';
    return;
  }
  el.innerHTML =
    '<div class="eq-table">' +
      '<div class="eq-row eq-head">' +
        '<div class="eq-c-name">סוג הציוד</div>' +
        '<div class="eq-c-qty">כמות</div>' +
        '<div class="eq-c-price">מחיר ליחידה</div>' +
        '<div class="eq-c-total">סה"כ</div>' +
        '<div class="eq-c-act"></div>' +
      '</div>' +
      cachedEquipment.map(e => {
        const qty = e.quantity || 0, price = e.unit_price || 0;
        const total = qty * price;
        return '<div class="eq-row">' +
          '<div class="eq-c-name">' + esc(e.name) + '</div>' +
          '<div class="eq-c-qty"><input type="number" min="1" value="' + qty + '" onchange="updateEquipment(\'' + e.id + '\',\'quantity\',this.value)" class="eq-input"></div>' +
          '<div class="eq-c-price"><input type="number" min="0" value="' + price + '" onchange="updateEquipment(\'' + e.id + '\',\'unit_price\',this.value)" class="eq-input"></div>' +
          '<div class="eq-c-total">' + fmt(total) + '</div>' +
          '<div class="eq-c-act"><button class="btn-del" onclick="deleteEquipment(\'' + e.id + '\')">&#128465;</button></div>' +
        '</div>';
      }).join('') +
      '<div class="eq-row eq-foot">' +
        '<div class="eq-c-name">סה"כ השקעה</div>' +
        '<div class="eq-c-qty"></div>' +
        '<div class="eq-c-price"></div>' +
        '<div class="eq-c-total">' + fmt(grand) + '</div>' +
        '<div class="eq-c-act"></div>' +
      '</div>' +
    '</div>';
}

// ── מצב חשבונות בנק (שיקוף) ──
let cachedAccounts = [];
let cachedMovements = [];

// שליפת החשבונות בלבד — נדרשת מוקדם, לפני ייבוא הקבועות
async function fetchAccounts() {
  const res = await sb.from('bank_accounts').select('*').eq('user_id', currentUser.id).order('sort_order').order('created_at');
  cachedAccounts = res.data || [];
}

// רשומות ישנות ללא שיוך: כשיש חשבון יחיד למצב אין אי-ודאות, אז משייכים אותן אליו.
// תנועות שקדמו לעוגן לא נספרות ממילא, כך שאין כפל חישוב.
async function backfillAccountLinks() {
  const list = accountsForMode();
  if (list.length !== 1) return;
  await sb.from(TX_TABLE())
    .update({ account_id: list[0].id })
    .eq('user_id', currentUser.id)
    .is('account_id', null);
}

async function loadAccounts() {
  await fetchAccounts();
  await backfillAccountLinks();
  await loadMovements();
  populateAccountSelect();
  renderAccounts();
}

// כל התנועות המשויכות לחשבון — הבסיס לחישוב היתרה הנגזרת
async function loadMovements() {
  const res = await sb.from(TX_TABLE())
    .select('account_id,amount,type,created_at')
    .eq('user_id', currentUser.id)
    .not('account_id', 'is', null);
  cachedMovements = res.data || [];
}

// סכום התנועות בחשבון מאז תאריך העוגן (הכנסה מוסיפה, הוצאה מחסרת)
function movementsSince(acc) {
  if (!acc.anchor_date) return 0;
  const from = new Date(acc.anchor_date).getTime();
  return cachedMovements.reduce((s, m) => {
    if (m.account_id !== acc.id) return s;
    if (new Date(m.created_at).getTime() <= from) return s;
    return s + (m.type === 'income' ? (m.amount || 0) : -(m.amount || 0));
  }, 0);
}

// היתרה שהאפליקציה חושבת שיש בחשבון: עוגן + תנועות מאז
function derivedBalance(acc) {
  if (!acc.anchor_date) return acc.balance || 0;
  return (acc.anchor_balance || 0) + movementsSince(acc);
}

// חשבון ברירת המחדל של מצב מסוים (עסק/בית) — לפי הבחירה האחרונה, אחרת הראשון
function defaultAccountFor(mode) {
  const list = cachedAccounts.filter(a => (a.scope || 'business') === mode);
  if (!list.length) return null;
  const saved = localStorage.getItem('cf_last_account_' + mode);
  if (saved && list.some(a => a.id === saved)) return saved;
  return list[0].id;
}

// בורר החשבון מוצג רק כשיש באמת מה לבחור — אחרת המצב (בית/עסק) מכריע לבד
function populateAccountSelect() {
  const sel = $('t-account');
  if (!sel) return;
  const list = accountsForMode();
  if (list.length < 2) { sel.style.display = 'none'; sel.innerHTML = ''; return; }
  sel.style.display = '';
  sel.innerHTML = '<option value="">— ללא חשבון —</option>' +
    list.map(a => '<option value="' + a.id + '">' + esc(a.name) + (a.account_hint ? ' ••' + esc(a.account_hint) : '') + '</option>').join('');
  const def = defaultAccountFor(appMode);
  if (def) sel.value = def;
}
// חשבונות של המצב הפעיל בלבד (עסק / בית)
function accountsForMode() {
  return cachedAccounts.filter(a => (a.scope || 'business') === appMode);
}
async function addAccount() {
  const name = $('acc-name').value.trim();
  const hint = $('acc-hint').value.trim();
  const balance = parseFloat($('acc-balance').value) || 0;
  if (!name) return;
  $('btn-add-acc').disabled = true;
  const today = new Date().toISOString().slice(0, 10);
  await sb.from('bank_accounts').insert({
    user_id: currentUser.id, name, account_hint: hint || null,
    balance, updated_on: today, sort_order: cachedAccounts.length,
    anchor_balance: balance, anchor_date: new Date().toISOString(),
    scope: appMode   // משויך אוטומטית למצב שבו אתה נמצא
  });
  $('acc-name').value = ''; $('acc-hint').value = ''; $('acc-balance').value = '';
  $('btn-add-acc').disabled = false;
  await loadAccounts();
}
async function deleteAccount(id) {
  if (!confirm('למחוק חשבון זה?')) return;
  await sb.from('bank_accounts').delete().eq('id', id);
  await loadAccounts();
}
// עדכון מהבנק — קובע עוגן חדש ומדווח על הפער מול מה שהאפליקציה חישבה
async function updateAccountBalance(id, value) {
  const bal = parseFloat(value);
  if (isNaN(bal)) return;
  const acc = cachedAccounts.find(a => a.id === id);
  const expected = acc ? derivedBalance(acc) : bal;
  const gap = bal - expected;
  const today = new Date().toISOString().slice(0, 10);
  await sb.from('bank_accounts').update({
    balance: bal, updated_on: today,
    anchor_balance: bal, anchor_date: new Date().toISOString()
  }).eq('id', id);
  await loadAccounts();
  if (acc && acc.anchor_date && Math.abs(gap) >= 1) {
    alert(gap < 0
      ? '⚠️ יצאו ' + fmt(Math.abs(gap)) + ' מהחשבון בלי שתיעדת.\nכדאי לעבור על ההוצאות ולהשלים.'
      : '⚠️ נכנסו ' + fmt(Math.abs(gap)) + ' לחשבון בלי שתיעדת.\nכדאי להוסיף את ההכנסה החסרה.');
  }
}
function renderAccounts() {
  const el = $('accounts-list');
  if (!el) return;
  const hint = $('acc-scope-hint');
  if (hint) hint.textContent = appMode === 'home' ? 'בית' : 'עסק';
  const list = accountsForMode();
  const grand = list.reduce((s, a) => s + derivedBalance(a), 0);
  const gt = $('acc-grand-total');
  if (gt) gt.textContent = fmt(grand);

  if (!list.length) {
    el.innerHTML = '<div class="empty">עדיין לא נוספו חשבונות ' + (appMode === 'home' ? 'לבית' : 'לעסק') + '. הוסף חשבון ראשון למטה 💳</div>';
    renderReconcile();
    return;
  }
  const today = new Date();
  el.innerHTML = list.map(a => {
    const derived = derivedBalance(a);
    const moved = movementsSince(a);
    const neg = derived < 0;
    const anchorStr = a.anchor_date
      ? new Date(a.anchor_date).toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit' })
      : (a.updated_on ? a.updated_on.split('-').reverse().join('/') : '—');
    const dateStr = a.updated_on ? a.updated_on.split('-').reverse().join('/') : '—';
    const movedStr = moved === 0 ? 'אין תנועות מאז'
      : (moved > 0 ? '+' : '−') + fmt(Math.abs(moved)) + ' מאז';
    // כמה ימים עברו מאז העדכון האחרון
    let staleBadge = '';
    if (a.updated_on) {
      const days = Math.floor((today - new Date(a.updated_on + 'T00:00:00')) / 86400000);
      if (days >= 7) {
        const color = days >= 14 ? 'var(--red)' : 'var(--amber,#b45309)';
        const bg = days >= 14 ? 'var(--red-soft,#fef2f2)' : '#fffbeb';
        staleBadge = '<span style="background:' + bg + ';color:' + color + ';font-size:10.5px;font-weight:600;padding:2px 7px;border-radius:100px;margin-inline-start:6px">🔔 ' + days + ' ימים</span>';
      }
    }
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid var(--border);gap:12px;flex-wrap:wrap">' +
      '<div style="min-width:0">' +
        '<div style="font-weight:700;font-size:15px">' + esc(a.name) + (a.account_hint ? ' <span style="font-size:12px;color:var(--muted);font-weight:400">••' + esc(a.account_hint) + '</span>' : '') + '</div>' +
        '<div style="font-size:11px;color:var(--muted)">עוגן ' + fmt(a.anchor_balance || 0) + ' מ-' + anchorStr + ' · ' + movedStr + staleBadge + '</div>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:10px">' +
        '<div style="text-align:left">' +
          '<div style="font-size:10.5px;color:var(--muted);margin-bottom:2px">לפי התיעוד · הקלד מה שכתוב בבנק</div>' +
          '<div style="display:flex;align-items:center;gap:4px">' +
            '<span style="font-size:13px;color:var(--muted)">₪</span>' +
            '<input type="number" value="' + Math.round(derived) + '" onchange="updateAccountBalance(\'' + a.id + '\',this.value)" ' +
            'style="width:120px;padding:7px 9px;border:1px solid var(--border);border-radius:8px;font-size:15px;font-weight:700;text-align:left;color:' + (neg ? 'var(--red)' : 'var(--green)') + '">' +
          '</div>' +
        '</div>' +
        '<button class="btn-del" onclick="deleteAccount(\'' + a.id + '\')" title="מחק">&#128465;</button>' +
      '</div>' +
    '</div>';
  }).join('') +
  '<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0 2px;font-weight:800;font-size:16px">' +
    '<span>סה"כ בכל החשבונות</span>' +
    '<span style="color:' + (grand < 0 ? 'var(--red)' : 'var(--green)') + '">' + fmt(grand) + '</span>' +
  '</div>';
  renderReconcile();
}

// ── ב' — עדכון כל היתרות בחלון אחד ──
function openUpdateAllModal() {
  const list = accountsForMode();
  if (!list.length) { alert('אין חשבונות לעדכון.'); return; }
  const body = $('updall-body');
  body.innerHTML = list.map(a =>
    '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--border)">' +
      '<div style="font-weight:600;font-size:14px">' + esc(a.name) +
        (a.account_hint ? ' <span style="font-size:11px;color:var(--muted);font-weight:400">••' + esc(a.account_hint) + '</span>' : '') + '</div>' +
      '<input type="number" id="updall-' + a.id + '" value="' + Math.round(derivedBalance(a)) + '" ' +
      'style="width:130px;padding:7px 9px;border:1px solid var(--border);border-radius:8px;font-size:15px;font-weight:700;text-align:left">' +
    '</div>'
  ).join('');
  $('updall-modal').style.display = 'flex';
}
function closeUpdateAllModal() { $('updall-modal').style.display = 'none'; }

async function saveAllBalances() {
  const btn = $('btn-updall-save');
  btn.disabled = true; btn.textContent = '⏳ שומר...';
  const today = new Date().toISOString().slice(0, 10);
  const list = accountsForMode();

  const updates = [];
  const details = {};
  for (const a of list) {
    const el = $('updall-' + a.id);
    if (!el) continue;
    const val = parseFloat(el.value);
    if (isNaN(val)) continue;
    updates.push(sb.from('bank_accounts').update({
      balance: val, updated_on: today,
      anchor_balance: val, anchor_date: new Date().toISOString()
    }).eq('id', a.id));
    details[a.name] = val;
  }
  await Promise.all(updates);

  const newTotal = Object.values(details).reduce((s, v) => s + v, 0);
  // רשום snapshot חדש (לפי המצב הפעיל)
  await sb.from('balance_snapshots').insert({
    user_id: currentUser.id, taken_on: today,
    total_balance: newTotal, details, scope: appMode
  });

  btn.disabled = false; btn.textContent = '💾 שמור הכל';
  closeUpdateAllModal();
  await loadAccounts();
  await loadSnapshots();
  renderReconcile();
}

// ── ג' — השוואה: כמה זז בבנק מול כמה תיעדת ──
let cachedSnapshots = [];
async function loadSnapshots() {
  const res = await sb.from('balance_snapshots')
    .select('*').eq('user_id', currentUser.id)
    .eq('scope', appMode)
    .order('taken_on', { ascending: false }).limit(2);
  cachedSnapshots = res.data || [];
}

async function renderReconcile() {
  const el = $('reconcile-box');
  if (!el) return;
  if (cachedSnapshots.length < 2) {
    el.innerHTML = '<div style="font-size:13px;color:var(--muted);line-height:1.7">' +
      'כדי להשוות, צריך לפחות שני עדכונים. לחץ <strong>"עדכן הכל"</strong> עכשיו, ושוב בפעם הבאה — ואז נוכל להראות לך כמה כסף זז מול כמה תיעדת.' +
      '</div>';
    return;
  }
  const [curr, prev] = cachedSnapshots;
  const bankDelta = (curr.total_balance || 0) - (prev.total_balance || 0);

  // כמה תיעדת בין שני התאריכים (הכנסות פחות הוצאות)
  const { data: txs } = await sb.from(TX_TABLE())
    .select('amount,type,created_at')
    .eq('user_id', currentUser.id)
    .gt('created_at', prev.taken_on)
    .lte('created_at', curr.taken_on + 'T23:59:59');

  let inc = 0, exp = 0;
  (txs || []).forEach(t => { if (t.type === 'income') inc += t.amount || 0; else exp += t.amount || 0; });
  const trackedDelta = inc - exp;
  const gap = bankDelta - trackedDelta;

  const d1 = prev.taken_on.split('-').reverse().join('/');
  const d2 = curr.taken_on.split('-').reverse().join('/');
  const gapColor = Math.abs(gap) < 50 ? 'var(--green)' : 'var(--red)';
  const gapLabel = Math.abs(gap) < 50
    ? '✅ תואם — הכל מתועד'
    : (gap < 0 ? '⚠️ ' + fmt(Math.abs(gap)) + ' יצאו מהבנק בלי שתועדו' : '⚠️ ' + fmt(Math.abs(gap)) + ' נכנסו לבנק בלי שתועדו');

  el.innerHTML =
    '<div style="font-size:12px;color:var(--muted);margin-bottom:10px">בין ' + d1 + ' ל-' + d2 + '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
      '<div style="background:var(--bg);border-radius:var(--radius-sm);padding:11px;text-align:center">' +
        '<div style="font-size:11.5px;color:var(--muted);margin-bottom:3px">תזוזה בבנק</div>' +
        '<div style="font-size:18px;font-weight:700;color:' + (bankDelta < 0 ? 'var(--red)' : 'var(--green)') + '">' +
          (bankDelta >= 0 ? '+' : '−') + fmt(Math.abs(bankDelta)) + '</div>' +
      '</div>' +
      '<div style="background:var(--bg);border-radius:var(--radius-sm);padding:11px;text-align:center">' +
        '<div style="font-size:11.5px;color:var(--muted);margin-bottom:3px">תיעדת באפליקציה</div>' +
        '<div style="font-size:18px;font-weight:700;color:' + (trackedDelta < 0 ? 'var(--red)' : 'var(--green)') + '">' +
          (trackedDelta >= 0 ? '+' : '−') + fmt(Math.abs(trackedDelta)) + '</div>' +
      '</div>' +
    '</div>' +
    '<div style="text-align:center;padding:11px;border-radius:var(--radius-sm);background:' + (Math.abs(gap) < 50 ? '#ecfdf5' : '#fef2f2') + '">' +
      '<div style="font-size:14px;font-weight:700;color:' + gapColor + '">' + gapLabel + '</div>' +
    '</div>';
}

// מחשבון ריבית דריבית — הרכבה חודשית עם הפקדות
function calcCompound() {
  const principal = parseFloat($('ci-principal') ? $('ci-principal').value : 0) || 0;
  const monthly = parseFloat($('ci-monthly') ? $('ci-monthly').value : 0) || 0;
  const annualRate = parseFloat($('ci-rate') ? $('ci-rate').value : 0) || 0;
  const years = parseInt($('ci-years') ? $('ci-years').value : 0) || 0;
  if (!$('ci-total')) return;

  const monthlyRate = annualRate / 100 / 12;
  const yearlyData = [];
  let balance = principal;
  let deposited = principal;

  for (let y = 1; y <= years; y++) {
    for (let m = 0; m < 12; m++) {
      balance = balance * (1 + monthlyRate) + monthly;
      deposited += monthly;
    }
    yearlyData.push({ year: y, balance: Math.round(balance), deposited: Math.round(deposited) });
  }

  const total = Math.round(balance);
  const interest = total - deposited;

  $('ci-total').textContent = fmt(total);
  $('ci-deposited').textContent = fmt(deposited);
  $('ci-interest').textContent = fmt(interest);

  // גרף עמודות פשוט — צמיחה שנתית (כיס + ריבית)
  const chart = $('ci-chart');
  if (!chart) return;
  if (!yearlyData.length) { chart.innerHTML = '<div class="empty">הזן מספר שנים</div>'; return; }
  const max = Math.max(...yearlyData.map(d => d.balance)) || 1;
  chart.innerHTML = yearlyData.map(d => {
    const depPct = d.balance > 0 ? (d.deposited / d.balance * 100) : 0;
    const wPct = (d.balance / max * 100);
    return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;font-size:11.5px">' +
      '<div style="flex:0 0 42px;color:var(--muted)">שנה ' + d.year + '</div>' +
      '<div style="flex:1;background:var(--bg);border-radius:100px;height:18px;overflow:hidden;position:relative">' +
        '<div style="width:' + wPct + '%;height:100%;background:var(--green);border-radius:100px;position:relative">' +
          '<div style="width:' + depPct + '%;height:100%;background:#94a3b8"></div>' +
        '</div>' +
      '</div>' +
      '<div style="flex:0 0 auto;font-weight:600;min-width:64px;text-align:left">' + fmt(d.balance) + '</div>' +
    '</div>';
  }).join('') +
  '<div style="display:flex;gap:14px;margin-top:10px;font-size:11px;color:var(--muted)">' +
    '<div style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:2px;background:#94a3b8;display:inline-block"></span>הפקדות</div>' +
    '<div style="display:flex;align-items:center;gap:5px"><span style="width:10px;height:10px;border-radius:2px;background:var(--green);display:inline-block"></span>כולל ריבית</div>' +
  '</div>';
}

// ── סיכום שנתי ──
function openAnnualModal() {
  const m = $('annual-modal');
  if (m) m.style.display = 'flex';
  renderAnnualSummary();
}
function closeAnnualModal() {
  const m = $('annual-modal');
  if (m) m.style.display = 'none';
}
async function renderAnnualSummary() {
  const yearEl = $('annual-year');
  const chartEl = $('annual-chart');
  if (!chartEl) return;
  const year = $('yearSel') ? $('yearSel').value : String(new Date().getFullYear());
  if (yearEl) yearEl.textContent = year;

  const uid = currentUser.id;
  // שלוף את כל העסקאות של השנה (12 חודשים) בשאילתה אחת
  const { data: txs } = await sb.from('transactions')
    .select('month,amount,type')
    .eq('user_id', uid)
    .gte('month', year + '-01')
    .lte('month', year + '-12');

  // אתחל 12 חודשים
  const inc = new Array(12).fill(0);
  const exp = new Array(12).fill(0);

  (txs || []).forEach(t => {
    const mi = parseInt((t.month || '').slice(5, 7), 10) - 1;
    if (mi < 0 || mi > 11) return;
    if (t.type === 'income') inc[mi] += t.amount || 0;
    else exp[mi] += t.amount || 0;
  });

  // הוסף הכנסה מאירועים ששולמו (לפי שנת התאריך)
  cachedEventDetails.forEach(d => {
    if (!d.event_date || !d.price) return;
    if (d.event_date.slice(0, 4) !== year) return;
    if (d.status === 'בוצע תשלום' || d.status === 'בוצע תשלום + חשבונית מס') {
      const mi = parseInt(d.event_date.slice(5, 7), 10) - 1;
      if (mi >= 0 && mi <= 11) inc[mi] += d.price;
    }
  });

  // כבד את חודש התחלת השימוש — אפס חודשים שלפניו באותה שנה
  const _sm = getStartMonth();
  if (_sm && _sm.slice(0, 4) === year) {
    const smo = parseInt(_sm.slice(5, 7), 10);
    for (let i = 0; i < smo - 1; i++) { inc[i] = 0; exp[i] = 0; }
  }

  const totalInc = inc.reduce((a, b) => a + b, 0);
  const totalExp = exp.reduce((a, b) => a + b, 0);
  const profit = totalInc - totalExp;

  if ($('annual-income')) $('annual-income').textContent = fmt(totalInc);
  if ($('annual-expense')) $('annual-expense').textContent = fmt(totalExp);
  const pEl = $('annual-profit');
  if (pEl) { pEl.textContent = fmt(profit); pEl.style.color = profit >= 0 ? 'var(--green)' : 'var(--red)'; }

  const max = Math.max(...inc, ...exp, 1);
  const MONTHS_HE = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יונ', 'יול', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];
  let bars = '';
  for (let i = 0; i < 12; i++) {
    const ih = Math.round(inc[i] / max * 100);
    const eh = Math.round(exp[i] / max * 100);
    bars += '<div class="annual-col">' +
      '<div class="annual-bars">' +
        '<div class="annual-bar inc" style="height:' + ih + '%" title="נכנס ' + MONTHS_HE[i] + ': ' + fmt(inc[i]) + '"></div>' +
        '<div class="annual-bar exp" style="height:' + eh + '%" title="יצא ' + MONTHS_HE[i] + ': ' + fmt(exp[i]) + '"></div>' +
      '</div>' +
      '<div class="annual-mlabel">' + MONTHS_HE[i] + '</div>' +
    '</div>';
  }
  chartEl.innerHTML = bars;
  // מקרא (פעם אחת)
  let legend = chartEl.parentElement.querySelector('.annual-legend');
  if (!legend) {
    chartEl.insertAdjacentHTML('afterend',
      '<div class="annual-legend"><span><i style="background:var(--green,#0d9c6e)"></i>נכנס</span>' +
      '<span><i style="background:var(--red,#dc2626)"></i>יצא</span></div>');
  }
}

// ── RENDER ALL ──
function renderAll() {
  // מצב בית — דלג על רינדור העסק (מטופל ב-renderHome)
  if (appMode === 'home') { renderHome(); return; }
  // הצג דשבורד עסק, הסתר בית
  const homeD = $('home-dashboard'), bizD = $('business-dashboard');
  if (homeD) homeD.style.display = 'none';
  if (bizD) bizD.style.display = 'block';
  const month = getMonth();
  const monthDetails = getMonthDetails(month);
  const monthDetailIds = monthDetails.map(d => d.id);

  const txIncome = cachedTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const eventIncome = monthDetails.filter(d => d.price > 0).reduce((s, d) => { const st = d.status; if (st === '\u05d1\u05d5\u05e6\u05e2 \u05ea\u05e9\u05dc\u05d5\u05dd' || st === '\u05d1\u05d5\u05e6\u05e2 \u05ea\u05e9\u05dc\u05d5\u05dd + \u05d7\u05e9\u05d1\u05d5\u05e0\u05d9\u05ea \u05de\u05e1') return s + (d.price || 0); if (st === '\u05dc\u05d0 \u05d9\u05e6\u05d0\u05d4 \u05d3\u05e8\u05d9\u05e9\u05ea \u05ea\u05e9\u05dc\u05d5\u05dd' || st === '\u05d9\u05e6\u05d0\u05d4 \u05d3\u05e8\u05d9\u05e9\u05ea \u05ea\u05e9\u05dc\u05d5\u05dd') return s + Math.min(Number(d.paid_amount) || 0, d.price || 0); return s; }, 0);
  const income = txIncome + eventIncome;
  const txExpense = cachedTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const paidEmpSalary = cachedEmpEvents.filter(e => e.status === '\u05e9\u05d5\u05dc\u05dd').reduce((s, e) => s + e.amount, 0);
  const paidWorkerSalary = cachedEventWorkers.filter(w => monthDetailIds.includes(w.event_detail_id) && w.status === '\u05e9\u05d5\u05dc\u05dd').reduce((s, w) => s + w.amount, 0);
  const salary = paidEmpSalary + paidWorkerSalary;
  lastSalary = salary;
  const expense = txExpense + salary;
  const net = income - expense;

  const pendingIncome = monthDetails.filter(d => d.price > 0 && (d.status === '\u05dc\u05d0 \u05d9\u05e6\u05d0\u05d4 \u05d3\u05e8\u05d9\u05e9\u05ea \u05ea\u05e9\u05dc\u05d5\u05dd' || d.status === '\u05d9\u05e6\u05d0\u05d4 \u05d3\u05e8\u05d9\u05e9\u05ea \u05ea\u05e9\u05dc\u05d5\u05dd')).reduce((s, d) => s + Math.max(0, (d.price || 0) - (Number(d.paid_amount) || 0)), 0);
  const pendingEmpSalary = cachedEmpEvents.filter(e => e.status === '\u05de\u05de\u05ea\u05d9\u05df').reduce((s, e) => s + e.amount, 0);
  const pendingWorkerSalary = cachedEventWorkers.filter(w => monthDetailIds.includes(w.event_detail_id) && w.status === '\u05de\u05de\u05ea\u05d9\u05df').reduce((s, w) => s + w.amount, 0);
  const totalClientIncome = income + pendingIncome;
  const totalWorkerSalary = salary + pendingEmpSalary + pendingWorkerSalary;
  const pendingNet = totalClientIncome - (expense + pendingEmpSalary + pendingWorkerSalary);

  // שמור רכיבים לפירוט צפי הרווח (שקיפות מלאה)
  profitBreakdownData = {
    txIncome, eventIncome, pendingIncome,
    txExpense, paidEmpSalary, paidWorkerSalary, pendingEmpSalary, pendingWorkerSalary,
    income, pendingNet
  };
  // שמור את צפי הרווח + אחוז שכר ההנהלה כדי שמצב "בית" יחשב את המשכורת מהעסק
  try {
    const mgmtPct = (pfSettings.accounts.find(a => a.name.includes('הנהלה')) || { pct: 50 }).pct;
    const salaryFromBiz = Math.max(0, pendingNet) * mgmtPct / 100;
    const bizSalary = JSON.parse(localStorage.getItem('cf_biz_salary') || '{}');
    bizSalary[month] = Math.round(salaryFromBiz);
    localStorage.setItem('cf_biz_salary', JSON.stringify(bizSalary));
  } catch (e) {}
  if ($('profit-breakdown') && $('profit-breakdown').style.display !== 'none') renderProfitBreakdown();

  $('d-income').textContent = fmt(income);
  $('d-expense').textContent = fmt(expense);
  $('d-pending-income').textContent = fmt(pendingIncome);

  const netEl = $('d-net'); netEl.textContent = fmt(net); netEl.style.color = net >= 0 ? 'var(--green)' : 'var(--red)';
  const pendEl = $('d-pending'); pendEl.textContent = (pendingNet >= 0 ? '+' : '') + fmt(Math.abs(pendingNet)); pendEl.style.color = pendingNet >= 0 ? 'var(--green)' : 'var(--red)';

  updateTax(income, pendingIncome);
  // update dashboard cards
  const salDbEl = $('d-salary-db'); if(salDbEl) salDbEl.textContent = fmt(salary);
  const pSalDbEl = $('d-pending-salary-db'); if(pSalDbEl) pSalDbEl.textContent = fmt(pendingEmpSalary + pendingWorkerSalary);
  const netDbEl = $('d-net-db'); if(netDbEl) { netDbEl.textContent = fmt(net); netDbEl.style.color = net >= 0 ? 'var(--green)' : 'var(--red)'; }
  const pendDbEl = $('d-pending-db'); if(pendDbEl) { pendDbEl.textContent = (pendingNet >= 0 ? '+' : '') + fmt(Math.abs(pendingNet)); pendDbEl.style.color = pendingNet >= 0 ? 'var(--green)' : 'var(--red)'; }
  // sync tax rate from dashboard
  const dbTaxRate = $('tax-rate-db'); if(dbTaxRate) dbTaxRate.value = $('tax-rate').value;
  // שמור את שני הערכים לבחירת מקור ההכנסה ל-Profit First
  pfIncomeReceived = income;
  pfIncomeProjected = Math.max(0, pendingNet);
  updatePFIncome();

  renderCatBars(expense, salary);
  renderEmpStatus(monthDetailIds);
  renderTxTable();
  renderMonthView();
  renderEmpCards(monthDetailIds);
  renderClientsList();
  renderEventsList();
  renderAlerts(income, expense, salary, net, pendingIncome);
  applyReadOnly();
  refreshTxPanel(); // שמור על פאנל הפירוט מעודכן (למשל אחרי החלפת חודש)
}

// פירוט מלא של צפי הרווח — שקיפות מוחלטת של החישוב
function toggleProfitBreakdown() {
  const el = $('profit-breakdown');
  if (el.style.display === 'none') { el.style.display = 'block'; renderProfitBreakdown(); }
  else { el.style.display = 'none'; }
}
function renderProfitBreakdown() {
  const d = profitBreakdownData;
  if (!d) return;
  const row = (label, val, isNeg) => '<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;border-bottom:1px solid var(--border)"><span style="color:var(--muted)">' + label + '</span><span style="font-weight:600;color:' + (isNeg ? 'var(--red)' : 'var(--green)') + '">' + (isNeg ? '−' : '+') + fmt(Math.abs(val)) + '</span></div>';
  const totalIn = d.txIncome + d.eventIncome + d.pendingIncome;
  const totalOut = d.txExpense + d.paidEmpSalary + d.paidWorkerSalary + d.pendingEmpSalary + d.pendingWorkerSalary;
  $('profit-breakdown').innerHTML =
    '<div style="background:#fff;border-radius:var(--radius);padding:16px 20px;margin-bottom:1.1rem;box-shadow:var(--shadow)">' +
    '<div style="font-weight:700;font-size:14px;margin-bottom:10px;color:var(--blue)">📊 מתוך מה מורכב צפי הרווח</div>' +
    '<div style="font-size:12px;font-weight:700;color:var(--green);margin:8px 0 4px">➕ נכנס / צפוי להיכנס</div>' +
    (d.txIncome ? row('הכנסות עסקה (שוטף)', d.txIncome) : '') +
    (d.eventIncome ? row('תשלומים שהתקבלו מלקוחות', d.eventIncome) : '') +
    (d.pendingIncome ? row('צפוי מלקוחות (טרם שולם)', d.pendingIncome) : '') +
    '<div style="font-size:12px;font-weight:700;color:var(--red);margin:12px 0 4px">➖ יוצא / צפוי לצאת</div>' +
    (d.txExpense ? row('הוצאות עסק', d.txExpense, true) : '') +
    (d.paidEmpSalary ? row('שכר עובדים ששולם', d.paidEmpSalary, true) : '') +
    (d.paidWorkerSalary ? row('שכר עובדי אירועים ששולם', d.paidWorkerSalary, true) : '') +
    (d.pendingEmpSalary ? row('שכר עובדים ממתין', d.pendingEmpSalary, true) : '') +
    (d.pendingWorkerSalary ? row('שכר עובדי אירועים ממתין', d.pendingWorkerSalary, true) : '') +
    '<div style="display:flex;justify-content:space-between;padding:10px 0 2px;margin-top:6px;border-top:2px solid var(--border);font-weight:800;font-size:15px"><span>= צפי רווח</span><span style="color:' + (d.pendingNet >= 0 ? 'var(--green)' : 'var(--red)') + '">' + fmt(d.pendingNet) + '</span></div>' +
    '<div style="font-size:11px;color:var(--muted);margin-top:8px">סה"כ צפוי להיכנס: ' + fmt(totalIn) + ' · סה"כ צפוי לצאת: ' + fmt(totalOut) + '</div>' +
    '</div>';
}

// מרענן את פאנל הפירוט אם הוא פתוח (למשל אחרי החלפת חודש)
function refreshTxPanel() {
  const panel = $('tx-panel');
  if (!panel || panel.style.display === 'none') return;
  const t = panel.dataset.type;
  if (!t) return;
  panel.style.display = 'none'; // מאפס כדי ש-toggleTxPanel יבנה מחדש במקום לסגור
  toggleTxPanel(t);
}

function toggleTxPanel(type) {
  const panel = $('tx-panel');
  const title = $('tx-panel-title');
  const content_el = $('tx-panel-content');
  
  // אם כבר פתוח באותו סוג — סגור
  if (panel.style.display !== 'none' && panel.dataset.type === type) {
    panel.style.display = 'none';
    return;
  }
  
  panel.dataset.type = type;
  let rows = [], titleText = '';
  
  if (type === 'income') {
    titleText = '✅ נכנס מלקוחות — פירוט';
    // עסקאות הכנסה + אירועים ששולמו
    const monthDetails = getMonthDetails();
    const paidEvents = monthDetails.filter(d => d.price > 0 && (d.status === 'בוצע תשלום' || d.status === 'בוצע תשלום + חשבונית מס'));
    const txIncome = cachedTx.filter(t => t.type === 'income');
    rows = [
      ...txIncome.map(t => ({ name: t.description, amount: t.amount, sub: t.category })),
      ...paidEvents.map(d => { const c = cachedClients.find(cl => cl.id === d.client_id); return { name: d.event_title, amount: d.price, sub: c ? c.name : 'אירוע', isEvent: true, eventTitle: d.event_title, eventDate: d.event_date, detailId: d.id, paid: true }; })
    ];
  } else if (type === 'pending') {
    titleText = '🕐 צפוי מלקוחות — פירוט';
    const monthDetails = getMonthDetails();
    const pendingEvents = monthDetails.filter(d => d.price > 0 && (d.status === 'לא יצאה דרישת תשלום' || d.status === 'יצאה דרישת תשלום'));
    rows = pendingEvents.map(d => { const c = cachedClients.find(cl => cl.id === d.client_id); return { name: d.event_title, amount: d.price, sub: (c ? c.name + ' · ' : '') + d.status, isEvent: true, eventTitle: d.event_title, eventDate: d.event_date, detailId: d.id, paid: false, paidAmount: Number(d.paid_amount) || 0, price: d.price || 0 }; });
  } else if (type === 'expense') {
    titleText = '💸 הוצאות — פירוט';
    const monthDetailIds = getMonthDetails().map(d => d.id);
    // עסקאות הוצאה
    const txExpense = cachedTx.filter(t => t.type === 'expense').map(t => ({ name: t.description, amount: t.amount, sub: t.category }));
    // תשלומים לעובדים מאירועי עובדים
    const empPayments = cachedEmpEvents.filter(e => e.status === 'שולם').map(e => {
      const emp = cachedEmps.find(em => em.id === e.employee_id);
      return { name: emp ? emp.name : 'עובד', amount: e.amount, sub: 'שכר עובד · ' + (e.event_name || '') };
    });
    // תשלומים לעובדים מאירועים
    const workerPayments = cachedEventWorkers.filter(w => monthDetailIds.includes(w.event_detail_id) && w.status === 'שולם').map(w => {
      const emp = cachedEmps.find(em => em.id === w.employee_id);
      const det = cachedEventDetails.find(d => d.id === w.event_detail_id);
      return { name: emp ? emp.name : 'עובד', amount: w.amount, sub: 'שכר עובד · ' + (det ? det.event_title : '') };
    });
    rows = [...txExpense, ...empPayments, ...workerPayments];
    // Fix expense card display to include salary
    const expCardEl = document.getElementById('d-expense');
    if(expCardEl) expCardEl.textContent = fmt(txExpense.reduce((s,r)=>s+r.amount,0) + empPayments.reduce((s,r)=>s+r.amount,0) + workerPayments.reduce((s,r)=>s+r.amount,0));
  }
  
  if (!rows.length) {
    content_el.innerHTML = '<div class="empty">אין פריטים</div>';
  } else {
    content_el.innerHTML = rows.map((r, i) => {
      if (r.isEvent) {
        // שורת אירוע — לחיצה פותחת עריכה, עם כפתורי פעולה
        const paidBtn = !r.paid ? '<button class="btn-paid-quick" onclick="event.stopPropagation();markEventPaid(\'' + r.detailId + '\')" title="סמן כשולם במלואו">שולם ✓</button>' : '';
        const partialBtn = !r.paid ? '<button class="btn-paid-quick" style="background:var(--amber-bg);color:var(--amber)" onclick="event.stopPropagation();markEventPartial(\'' + r.detailId + '\')" title="הזן תשלום חלקי">חלקי</button>' : '';
        const rem = Math.max(0, (r.price || r.amount || 0) - (r.paidAmount || 0));
        const partialInfo = (r.paidAmount > 0) ? '<div style="font-size:11px;color:var(--green)">שולם ' + fmt(r.paidAmount) + ' · נותר ' + fmt(rem) + '</div>' : '';
        return '<div class="income-row" onclick="editIncomeEvent(\'' + esc(r.eventTitle).replace(/'/g, "\\'") + '\',\'' + r.eventDate + '\',\'' + r.detailId + '\')" style="display:flex;justify-content:space-between;align-items:center;padding:10px 8px;border-bottom:1px solid var(--border);font-size:13px;cursor:pointer;border-radius:8px">' +
          '<div style="flex:1"><div style="font-weight:500">' + esc(r.name) + ' <span style="font-size:11px;color:var(--blue)">✎</span></div>' + (r.sub ? '<div style="font-size:11px;color:var(--muted)">' + esc(r.sub) + '</div>' : '') + partialInfo + '</div>' +
          '<div style="display:flex;align-items:center;gap:6px">' + partialBtn + paidBtn + '<div style="font-weight:600">' + fmt(r.amount) + '</div></div></div>';
      }
      // שורה רגילה (עסקה)
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);font-size:13px">' +
        '<div><div style="font-weight:500">' + esc(r.name) + '</div>' + (r.sub ? '<div style="font-size:11px;color:var(--muted)">' + esc(r.sub) + '</div>' : '') + '</div>' +
        '<div style="font-weight:600">' + fmt(r.amount) + '</div></div>';
    }).join('') +
    '<div style="display:flex;justify-content:space-between;padding:10px 8px;font-size:13px;font-weight:600;color:var(--muted)">' +
    '<span>סה"כ</span><span>' + fmt(rows.reduce((s,r) => s+r.amount, 0)) + '</span></div>';
  }
  
  title.textContent = titleText;
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ── כלי אבחון זמני — לבדיקת אירועים בעייתיים ──
function diagEvents() {
  const month = getMonth();
  const all = cachedEventDetails.filter(d => d.month === month || (d.event_date && d.event_date.slice(0, 7) === month));
  console.table(all.map(d => ({
    title: d.event_title || '(ריק)',
    price: d.price,
    date: d.event_date,
    month: d.month,
    status: d.status,
    client: (cachedClients.find(c => c.id === d.client_id) || {}).name || '(אין)',
    is_manual: d.is_manual,
    id: d.id
  })));
  // מצא בעייתיים: שם ריק או ברירת מחדל
  const problematic = all.filter(d => !d.event_title || d.event_title.trim() === '' || d.event_title === 'פרטי אירוע' || d.event_title === 'Event details');
  const msg = 'סה"כ אירועים החודש: ' + all.length + '\n' +
    'אירועים ללא שם תקין: ' + problematic.length + '\n\n' +
    problematic.map(d => '• מחיר: ' + d.price + ' | תאריך: ' + d.event_date + ' | סטטוס: ' + d.status + ' | שם: "' + (d.event_title || 'ריק') + '"').join('\n');
  alert(msg);
  return { all, problematic };
}

// פתיחת עריכת אירוע מתוך פירוט ההכנסות/צפוי
async function editIncomeEvent(title, date, detailId) {
  await openEditEventModal({ title, date, source: 'gcal', detailId });
}

// סימון מהיר של אירוע כשולם
async function markEventPaid(detailId) {
  if (!detailId) return;
  const det = cachedEventDetails.find(d => d.id === detailId);
  const price = det ? (det.price || 0) : 0;
  await sb.from('event_details').update({ status: 'בוצע תשלום', paid_amount: price }).eq('id', detailId);
  await loadAll();
  // רענן את הפאנל אם פתוח
  const panel = $('tx-panel');
  if (panel && panel.style.display !== 'none') {
    const t = panel.dataset.type;
    panel.style.display = 'none';
    toggleTxPanel(t);
  }
}

// תשלום חלקי — מזין כמה התקבל, מצטבר, ומסמן שולם כשמגיע לסכום המלא
async function markEventPartial(detailId) {
  if (!detailId) return;
  const det = cachedEventDetails.find(d => d.id === detailId);
  if (!det) return;
  const price = det.price || 0;
  const cur = Number(det.paid_amount) || 0;
  const remaining = Math.max(0, price - cur);
  const inp = prompt('כמה התקבל עכשיו?\n(סה"כ ' + fmt(price) + ' · שולם עד כה ' + fmt(cur) + ' · נותר ' + fmt(remaining) + ')', '');
  if (inp === null) return;
  const add = parseFloat(inp);
  if (isNaN(add) || add <= 0) { alert('סכום לא תקין'); return; }
  let newPaid = cur + add;
  let update;
  if (newPaid >= price) { update = { paid_amount: price, status: 'בוצע תשלום' }; }
  else { update = { paid_amount: newPaid }; }
  await sb.from('event_details').update(update).eq('id', detailId);
  await loadAll();
  const panel = $('tx-panel');
  if (panel && panel.style.display !== 'none') {
    const tp = panel.dataset.type;
    panel.style.display = 'none';
    toggleTxPanel(tp);
  }
}

function updateTaxFromDB() {
  // sync rate to hidden input and recalculate
  const dbRate = $('tax-rate-db');
  const hiddenRate = $('tax-rate');
  if (dbRate && hiddenRate) hiddenRate.value = dbRate.value;
  updateTax();
  // update dashboard tax displays
  const rate = parseFloat(dbRate ? dbRate.value : 20) || 20;
  const rec = cachedRecurring.reduce((s, r) => s + r.amount, 0);
  const taxDbEl = $('d-tax-db'); if(taxDbEl) taxDbEl.textContent = fmt(Math.max(0, lastIncome - rec) * rate / 100);
  const taxPendDbEl = $('d-tax-pending-db'); if(taxPendDbEl) taxPendDbEl.textContent = fmt(Math.max(0, lastPendingIncome - rec) * rate / 100);
}

// שומר את ערכי ההכנסה האחרונים לחישוב מס
let lastIncome = 0, lastPendingIncome = 0;

function updateTax(inc, pendInc) {
  const rate = parseFloat($('tax-rate').value) || 20;
  const rec = cachedRecurring.reduce((s, r) => s + r.amount, 0);
  // אם קיבלנו ערכים חדשים — שמור אותם
  if (inc !== undefined) lastIncome = inc;
  if (pendInc !== undefined) lastPendingIncome = pendInc;
  const taxable = Math.max(0, lastIncome - rec);
  $('d-tax').textContent = fmt(taxable * rate / 100);
  const pendTaxable = Math.max(0, lastPendingIncome - rec);
  $('d-tax-pending').textContent = fmt(pendTaxable * rate / 100);
  // update dashboard tax
  const taxDbEl = $('d-tax-db'); if(taxDbEl) taxDbEl.textContent = fmt(taxable * rate / 100);
  const taxPendDbEl = $('d-tax-pending-db'); if(taxPendDbEl) taxPendDbEl.textContent = fmt(pendTaxable * rate / 100);
}

// מקור ההכנסה ל-Profit First: 'received' (נכנס מלקוחות) או 'projected' (צפי רווח)
let pfIncomeSource = localStorage.getItem('cf_pf_source') || 'received';
let pfIncomeReceived = 0, pfIncomeProjected = 0;

function updatePFIncome() {
  const el = $('pf-income-display');
  if (!el) return;
  const amt = pfIncomeSource === 'projected' ? pfIncomeProjected : pfIncomeReceived;
  el.textContent = fmt(amt || 0);
  // עדכן תוויות וכפתורים
  const lbl = $('pf-income-label'), note = $('pf-income-note');
  if (pfIncomeSource === 'projected') {
    if (lbl) lbl.textContent = t('צפי רווח החודש');
    if (note) note.textContent = t('💡 נלקח אוטומטית מ"צפי רווח"');
  } else {
    if (lbl) lbl.textContent = t('נכנס מלקוחות החודש');
    if (note) note.textContent = t('💡 נלקח אוטומטית מ"נכנס מלקוחות"');
  }
  if ($('pf-src-received')) $('pf-src-received').classList.toggle('active', pfIncomeSource === 'received');
  if ($('pf-src-projected')) $('pf-src-projected').classList.toggle('active', pfIncomeSource === 'projected');
  calcPF();
}

// החלפת מקור ההכנסה ל-Profit First
function setPFSource(src) {
  pfIncomeSource = src;
  localStorage.setItem('cf_pf_source', src);
  updatePFIncome();
}

function renderCatBars(totalExp, workerSalary) {
  const cats = {};
  cachedTx.filter(t => t.type === 'expense').forEach(t => { cats[t.category] = (cats[t.category] || 0) + t.amount; });
  // הוסף שכר עובדים כקטגוריה
  const workerTotal = workerSalary || 0;
  if (workerTotal > 0) cats['שכר עובדים'] = (cats['שכר עובדים'] || 0) + workerTotal;
  const el = $('cat-bars');
  if (!Object.keys(cats).length) { el.innerHTML = '<div class="empty">\u05d0\u05d9\u05df \u05d4\u05d5\u05e6\u05d0\u05d5\u05ea \u05d4\u05d7\u05d5\u05d3\u05e9</div>'; return; }
  const colors = { '\u05e9\u05db\u05d9\u05e8\u05d5\u05ea': '#185FA5', '\u05e6\u05d9\u05d5\u05d3': '#0F6E56', '\u05e9\u05d9\u05d5\u05d5\u05e7': '#854F0B', '\u05e9\u05d9\u05e8\u05d5\u05ea\u05d9\u05dd': '#993C1D', '\u05d0\u05d7\u05e8': '#533C89' };
  let idx = 0;
  el.innerHTML = Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
    const pct = totalExp > 0 ? Math.round(amt / totalExp * 100) : 0;
    const color = colors[cat] || '#888';
    const catIdx = idx++;
    // בנה את רשימת הפריטים שמרכיבים את הקטגוריה
    let items = '';
    if (cat === '\u05e9\u05db\u05e8 \u05e2\u05d5\u05d1\u05d3\u05d9\u05dd') {
      // שכר עובדים — פרט לפי עובד (ששולם)
      const paidEmp = cachedEmpEvents.filter(e => e.status === '\u05e9\u05d5\u05dc\u05dd');
      const paidWork = cachedEventWorkers.filter(w => w.status === '\u05e9\u05d5\u05dc\u05dd');
      paidEmp.forEach(e => { const emp = cachedEmps.find(m => m.id === e.employee_id); items += catItemRow((emp ? emp.name : '\u05e2\u05d5\u05d1\u05d3') + (e.event_name ? ' \u00b7 ' + e.event_name : ''), e.amount); });
      paidWork.forEach(w => { const emp = cachedEmps.find(m => m.id === w.employee_id); const det = cachedEventDetails.find(d => d.id === w.event_detail_id); items += catItemRow((emp ? emp.name : '\u05e2\u05d5\u05d1\u05d3') + (det ? ' \u00b7 ' + det.event_title : ''), w.amount); });
    } else {
      // קטגוריית הוצאה רגילה — פרט לפי עסקאות
      cachedTx.filter(t => t.type === 'expense' && t.category === cat).forEach(t => {
        items += catItemRow(t.description || t.category, t.amount, t.date);
      });
    }
    return '<div class="bar-wrap" style="cursor:pointer" onclick="toggleDisplay(\'cat-items-' + catIdx + '\')"><div class="bar-label"><span>' + esc(cat) + ' <span style="font-size:10px;color:var(--muted)">\u25be</span></span><span>' + fmt(amt) + ' (' + pct + '%)</span></div><div class="bar-bg"><div class="bar-fill" style="width:' + pct + '%;background:' + color + '"></div></div></div>' +
      '<div id="cat-items-' + catIdx + '" style="display:none;padding:6px 10px 12px;margin-bottom:6px">' + (items || '<div style="font-size:12px;color:var(--muted)">\u05d0\u05d9\u05df \u05e4\u05d9\u05e8\u05d5\u05d8</div>') + '</div>';
  }).join('');
}

// שורת פריט בתוך פירוט קטגוריה
function catItemRow(name, amount, date) {
  return '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;font-size:12.5px;border-bottom:1px solid var(--border)"><span style="color:var(--text)">' + esc(name) + (date ? ' <span style="color:var(--muted);font-size:11px">\u00b7 ' + date + '</span>' : '') + '</span><span style="color:var(--red);font-weight:600">' + fmt(amount) + '</span></div>';
}

function renderEmpStatus(monthDetailIds) {
  const el = $('emp-status');
  if (!cachedEmps.length) { el.innerHTML = '<div class="empty">\u05dc\u05d0 \u05e0\u05d5\u05e1\u05e4\u05d5 \u05e2\u05d5\u05d1\u05d3\u05d9\u05dd</div>'; return; }
  el.innerHTML = cachedEmps.map(emp => {
    const evs = cachedEmpEvents.filter(e => e.employee_id === emp.id);
    const ewks = cachedEventWorkers.filter(w => w.employee_id === emp.id && monthDetailIds.includes(w.event_detail_id));
    const total = evs.reduce((s, e) => s + e.amount, 0) + ewks.reduce((s, w) => s + w.amount, 0);
    const count = evs.length + ewks.length;
    const allPaid = count > 0 && evs.every(e => e.status === '\u05e9\u05d5\u05dc\u05dd') && ewks.every(w => w.status === '\u05e9\u05d5\u05dc\u05dd');
    const hasLate = evs.some(e => e.status === '\u05d1\u05d0\u05d9\u05d7\u05d5\u05e8') || ewks.some(w => w.status === '\u05d1\u05d0\u05d9\u05d7\u05d5\u05e8');
    const status = count === 0 ? '\u05d0\u05d9\u05df \u05d0\u05d9\u05e8\u05d5\u05e2\u05d9\u05dd' : allPaid ? '\u05e9\u05d5\u05dc\u05dd' : hasLate ? '\u05d1\u05d0\u05d9\u05d7\u05d5\u05e8' : '\u05de\u05de\u05ea\u05d9\u05df';
    const cls = status === '\u05e9\u05d5\u05dc\u05dd' ? 'paid' : status === '\u05d1\u05d0\u05d9\u05d7\u05d5\u05e8' ? 'late' : status === '\u05de\u05de\u05ea\u05d9\u05df' ? 'pending' : '';
    // רשימת אירועים מפורטת — מאירועים (event_workers) ומאירועי עובד ישירים
    const statusBadge = s => '<span class="badge badge-' + (s === '\u05e9\u05d5\u05dc\u05dd' ? 'paid' : s === '\u05d1\u05d0\u05d9\u05d7\u05d5\u05e8' ? 'late' : 'pending') + '">' + s + '</span>';
    // כפתור "סמן שולם" — מוצג רק כשהפריט עדיין לא שולם
    const payBtn = (fnName, id) => '<button class="btn-paid-quick" onclick="event.stopPropagation();' + fnName + '(\'' + id + '\',\'\u05e9\u05d5\u05dc\u05dd\')" style="margin-right:8px">' + t('\u05e1\u05de\u05df \u05e9\u05d5\u05dc\u05dd') + '</button>';
    let detailRows = '';
    ewks.forEach(w => {
      const det = cachedEventDetails.find(d => d.id === w.event_detail_id);
      const btn = w.status !== '\u05e9\u05d5\u05dc\u05dd' ? payBtn('updateEventWorkerStatus', w.id) : '';
      detailRows += '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;font-size:12px;color:var(--muted)"><span' + (det ? ' onclick="event.stopPropagation();mvEditEvent(\'' + det.id + '\')" style="cursor:pointer;text-decoration:underline dotted" title="פתח את האירוע"' : '') + '>' + (det ? esc(det.event_title) : '\u05d0\u05d9\u05e8\u05d5\u05e2') + (det && det.event_date ? ' \u00b7 ' + det.event_date : '') + '</span><span style="display:flex;align-items:center">' + fmt(w.amount) + ' ' + statusBadge(w.status) + btn + '</span></div>';
    });
    evs.forEach(e => {
      const btn = e.status !== '\u05e9\u05d5\u05dc\u05dd' ? payBtn('updateEmpEventStatus', e.id) : '';
      detailRows += '<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;font-size:12px;color:var(--muted)"><span>' + esc(e.event_name) + (e.date ? ' \u00b7 ' + e.date : '') + '</span><span style="display:flex;align-items:center">' + fmt(e.amount) + ' ' + statusBadge(e.status) + btn + '</span></div>';
    });
    const expandable = count > 0;
    return '<div style="border-bottom:1px solid var(--border)">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;' + (expandable ? 'cursor:pointer' : '') + '"' + (expandable ? ' onclick="toggleDisplay(\'empst-' + emp.id + '\')"' : '') + '>' +
      '<div><span style="font-size:13px;font-weight:500">' + esc(emp.name) + '</span>' + (total > 0 ? '<span style="font-size:12px;color:var(--muted);margin-right:8px">' + fmt(total) + '</span>' : '') + (expandable ? '<span style="font-size:11px;color:var(--muted);margin-right:6px">(' + count + ' \u05d0\u05d9\u05e8\u05d5\u05e2\u05d9\u05dd) \u25be</span>' : '') + '</div>' +
      (cls ? statusBadge(status) : '<span style="font-size:12px;color:var(--muted)">' + status + '</span>') +
      '</div>' +
      (expandable ? '<div id="empst-' + emp.id + '" style="display:none;padding:4px 12px 10px;background:var(--bg);border-radius:var(--radius-sm);margin-bottom:6px">' + detailRows + '</div>' : '') +
      '</div>';
  }).join('');
}

// פתיחה/סגירה של פירוט "נכנס החודש"
function toggleIncomeDetail() {
  const d = $('h-income-detail'), chev = $('h-inc-chev');
  if (!d) return;
  const open = d.style.display === 'none';
  d.style.display = open ? 'block' : 'none';
  if (chev) chev.style.transform = open ? 'rotate(90deg)' : '';
}

// פתיחה/סגירה של פירוט "יצא החודש"
function toggleExpenseDetail() {
  const d = $('h-expense-detail'), chev = $('h-exp-chev');
  if (!d) return;
  const open = d.style.display === 'none';
  d.style.display = open ? 'block' : 'none';
  if (chev) chev.style.transform = open ? 'rotate(90deg)' : '';
}

// פתיחה/סגירה של פירוט קטגוריית הוצאה בדשבורד הבית
function toggleCatDetail(el) {
  const d = el.nextElementSibling;
  if (!d) return;
  const open = d.style.display === 'none';
  d.style.display = open ? 'block' : 'none';
  const chev = el.querySelector('.cat-chev');
  if (chev) chev.style.transform = open ? 'rotate(90deg)' : '';
}

function renderTxTable() {  const tb = $('tx-table');
  if (!cachedTx.length) { tb.innerHTML = '<tr><td colspan="5" class="empty">\u05d0\u05d9\u05df \u05e8\u05e9\u05d5\u05de\u05d5\u05ea</td></tr>'; return; }
  tb.innerHTML = cachedTx.map(t => '<tr><td><input type="checkbox" class="tx-check" value="' + t.id + '" onchange="updateTxSelCount()"></td><td>' + esc(t.description) + '</td><td style="color:var(--muted);font-size:12px">' + esc(t.category) + '</td><td><span class="badge badge-' + t.type + '">' + (t.type === 'income' ? '\u05d4\u05db\u05e0\u05e1\u05d4' : '\u05d4\u05d5\u05e6\u05d0\u05d4') + '</span></td><td style="font-weight:600">' + fmt(t.amount) + '</td><td><button class="btn-del" onclick="deleteTx(\'' + t.id + '\')">&#128465;</button></td></tr>').join('');
  updateTxSelCount();
}

// ── החודש במבט אחד: הכנסות עם סטטוס צבעוני מול הוצאות ──
const MV_STATUSES = ['לא יצאה דרישת תשלום', 'יצאה דרישת תשלום', 'בוצע תשלום', 'בוצע תשלום + חשבונית מס'];
// תוויות מקוצרות לבורר הסטטוס (הערך שנשמר ל-DB נשאר המלא)
const MV_SHORT = {
  'לא יצאה דרישת תשלום': 'טרם נדרש',
  'יצאה דרישת תשלום': 'נדרש תשלום',
  'בוצע תשלום': 'שולם',
  'בוצע תשלום + חשבונית מס': 'שולם + חשבונית'
};
const MV_SHORT_EN = {
  'לא יצאה דרישת תשלום': 'Not requested',
  'יצאה דרישת תשלום': 'Requested',
  'בוצע תשלום': 'Paid',
  'בוצע תשלום + חשבונית מס': 'Paid + invoice'
};
const mvShort = s => currentLang === 'en' ? (MV_SHORT_EN[s] || s) : (MV_SHORT[s] || s);
const mvIsPaid = s => s === 'בוצע תשלום' || s === 'בוצע תשלום + חשבונית מס';
const mvCls = s => mvIsPaid(s) ? 'mv-paid' : s === 'יצאה דרישת תשלום' ? 'mv-pending' : '';
const mvSelCls = s => mvIsPaid(s) ? 'mv-st-paid' : s === 'יצאה דרישת תשלום' ? 'mv-st-pending' : '';

// פתיחה/סגירה של "החודש במבט אחד" — מכווץ כברירת מחדל, זוכר את הבחירה
function toggleMonthView() {
  const wrap = $('mv-grid-wrap'), chev = $('mv-chevron');
  if (!wrap) return;
  const open = wrap.style.display === 'none';
  wrap.style.display = open ? 'grid' : 'none';
  if (chev) chev.style.transform = open ? 'rotate(180deg)' : '';
  localStorage.setItem('cf_mv_open', open ? '1' : '0');
  if (open) renderMonthView();
}

// ── תתי-לשוניות: תפעול ואירועים ──
function setOpsTab(which) {
  const tabs = ['events', 'employees', 'clients'];
  tabs.forEach(t => {
    const pane = $('ops-pane-' + t), btn = $('ops-tab-' + t);
    if (pane) pane.style.display = (t === which) ? 'block' : 'none';
    if (btn) btn.classList.toggle('active', t === which);
  });
  localStorage.setItem('cf_ops_tab', which);
  // התוכן כבר מרונדר ע"י renderAll — כאן רק מציגים/מסתירים
}

// פתיחה/סגירה של מחשבון הריבית דריבית
// פאנל מתקפל כללי (חיסכונות)
function togglePanel(key) {
  const wrap = $(key + '-wrap'), chev = $(key + '-chevron');
  if (!wrap) return;
  const open = wrap.style.display === 'none';
  wrap.style.display = open ? 'block' : 'none';
  if (chev) chev.style.transform = open ? 'rotate(180deg)' : '';
  localStorage.setItem('cf_panel_' + key, open ? '1' : '0');
  if (open) {
    if (key === 'calc') calcCompound();
    if (key === 'goals') renderHomeGoalsList();
    if (key === 'children') renderChildren();
  }
}
function restorePanels() {
  ['goals', 'children', 'calc'].forEach(key => {
    const openSaved = localStorage.getItem('cf_panel_' + key);
    // ברירת מחדל: יעדים פתוחים, השאר סגורים
    const shouldOpen = openSaved === null ? (key === 'goals') : openSaved === '1';
    const wrap = $(key + '-wrap'), chev = $(key + '-chevron');
    if (wrap) wrap.style.display = shouldOpen ? 'block' : 'none';
    if (chev) chev.style.transform = shouldOpen ? 'rotate(180deg)' : '';
  });
}


// פתיחה/סגירה של פאנל ההוצאות הקבועות (בתוך טאב הכנסות/הוצאות)
function toggleRecordsPanel() {
  const wrap = $('records-panel-wrap'), chev = $('rec2-chevron');
  if (!wrap) return;
  const open = wrap.style.display === 'none';
  wrap.style.display = open ? 'block' : 'none';
  if (chev) chev.style.transform = open ? 'rotate(180deg)' : '';
  localStorage.setItem('cf_records_open', open ? '1' : '0');
}

function toggleRecurringPanel() {
  const wrap = $('rec-panel-wrap'), chev = $('rec-chevron');
  if (!wrap) return;
  const open = wrap.style.display === 'none';
  wrap.style.display = open ? 'block' : 'none';
  if (chev) chev.style.transform = open ? 'rotate(180deg)' : '';
  localStorage.setItem('cf_rec_open', open ? '1' : '0');
  if (open) renderRecurring();
}

function renderMonthView() {
  const wrap = $('mv-grid-wrap');
  if (wrap && wrap.style.display === 'none') return; // מכווץ — אין צורך לרנדר
  const incEl = $('mv-income'), expEl = $('mv-expense');
  if (!incEl || !expEl) return;
  const month = getMonth();
  const monthDetails = getMonthDetails(month);
  const monthDetailIds = monthDetails.map(d => d.id);

  // הכנסות: אירועים עם מחיר (לפי תאריך) + הכנסות ידניות/בנק
  const evRows = appMode === 'home' ? [] : monthDetails.filter(d => d.price > 0).sort((a, b) => (a.event_date || '') > (b.event_date || '') ? 1 : -1);
  const txIncomeRows = cachedTx.filter(x => x.type === 'income');

  let incHtml = evRows.map(d => {
    const c = cachedClients.find(cl => cl.id === d.client_id);
    const day = d.event_date ? Number(d.event_date.slice(8, 10)) + '/' + Number(d.event_date.slice(5, 7)) : '—';
    const title = esc(d.event_title || 'אירוע') + (c ? ' <span class="mv-sub">· ' + esc(c.name) + '</span>' : '');
    const sel = '<select class="mv-status ' + mvSelCls(d.status) + '" onclick="event.stopPropagation()" onchange="updateEventStatus(\'' + d.id + '\',this.value)">' +
      MV_STATUSES.map(s => '<option value="' + s + '"' + (d.status === s ? ' selected' : '') + '>' + mvShort(s) + '</option>').join('') + '</select>';
    return '<div class="mv-row ' + mvCls(d.status) + '" onclick="mvEditEvent(\'' + d.id + '\')" title="' + esc(d.event_title || '') + '">' +
      '<div class="mv-date">' + day + '</div><div class="mv-name">' + title + '</div>' +
      sel + '<div class="mv-amount">' + fmt(d.price) + '</div></div>';
  }).join('');

  // במצב בית — הוסף את המשכורת מהעסק (אם קיימת) לראש רשימת ההכנסות
  let bizSalary = 0, shiftIncome = 0, shiftEmpCount = 0;
  if (appMode === 'home') {
    try { bizSalary = (JSON.parse(localStorage.getItem('cf_biz_salary') || '{}'))[month] || 0; } catch (e) {}
    if (bizSalary > 0) {
      incHtml += '<div class="mv-row mv-paid mv-static" title="משכורת מהעסק"><div class="mv-date">—</div>' +
        '<div class="mv-name">🏢 משכורת מהעסק <span class="mv-sub">· 50% מצפי הרווח</span></div>' +
        '<span class="badge badge-paid mv-badge-sm">' + t('נכנס') + '</span><div class="mv-amount">' + fmt(bizSalary) + '</div></div>';
    }
    cachedSalaries.filter(s => s.active).forEach(s => {
      incHtml += '<div class="mv-row mv-paid mv-static" title="' + esc(s.person_name) + '"><div class="mv-date">—</div>' +
        '<div class="mv-name">💼 ' + esc(s.person_name) + ' <span class="mv-sub">· משכורת קבועה</span></div>' +
        '<span class="badge badge-paid mv-badge-sm">' + t('נכנס') + '</span><div class="mv-amount">' + fmt(s.amount || 0) + '</div></div>';
    });
    // שכר ממשמרות — שורה לכל מעסיק
    const mvShiftByEmp = {};
    cachedShifts.forEach(x => {
      const e = x.employer || 'משמרות';
      mvShiftByEmp[e] = (mvShiftByEmp[e] || 0) + (Number(x.hours) || 0) * (Number(x.rate) || 0);
    });
    Object.keys(mvShiftByEmp).forEach(e => {
      shiftIncome += mvShiftByEmp[e]; shiftEmpCount++;
      incHtml += '<div class="mv-row mv-paid mv-static" title="' + esc(e) + '"><div class="mv-date">—</div>' +
        '<div class="mv-name">🕐 ' + esc(e) + ' <span class="mv-sub">· משמרות</span></div>' +
        '<span class="badge badge-paid mv-badge-sm">' + t('נכנס') + '</span><div class="mv-amount">' + fmt(mvShiftByEmp[e]) + '</div></div>';
    });
  }
  const mvSalaries = salariesTotal();
  const mvSalaryCount = appMode === 'home' ? cachedSalaries.filter(s => s.active).length : 0;

  incHtml += txIncomeRows.map(x =>
    '<div class="mv-row mv-paid mv-static" title="' + esc(x.description) + '"><div class="mv-date">—</div>' +
    '<div class="mv-name">' + esc(x.description) + ' <span class="mv-sub">· ' + t('הכנסה ידנית') + '</span></div>' +
    '<span class="badge badge-paid mv-badge-sm">' + t('נכנס') + '</span><div class="mv-amount">' + fmt(x.amount) + '</div></div>'
  ).join('');

  incEl.innerHTML = incHtml || '<div class="empty">' + t('אין הכנסות החודש') + '</div>';
  const incCount = evRows.length + txIncomeRows.length + (bizSalary > 0 ? 1 : 0) + mvSalaryCount + shiftEmpCount;
  $('mv-income-count').textContent = incCount ? incCount + ' ' + (currentLang === 'en' ? 'items' : 'פריטים') : '';

  const paidEv = evRows.filter(d => mvIsPaid(d.status)).reduce((s, d) => s + (d.price || 0), 0);
  const pendEv = evRows.filter(d => !mvIsPaid(d.status)).reduce((s, d) => s + (d.price || 0), 0);
  const txInc = txIncomeRows.reduce((s, x) => s + x.amount, 0);
  const inTotal = paidEv + txInc + bizSalary + mvSalaries + shiftIncome;
  $('mv-income-totals').innerHTML =
    '<div class="mv-tot-row"><span style="color:var(--green)">' + t('נכנס') + '</span><span style="color:var(--green);font-weight:600">' + fmt(inTotal) + '</span></div>' +
    '<div class="mv-tot-row"><span style="color:var(--amber)">' + t('ממתין') + '</span><span style="color:var(--amber);font-weight:600">' + fmt(pendEv) + '</span></div>' +
    '<div class="mv-tot-row mv-tot-main"><span>' + t('סה"כ צפוי') + '</span><span>' + fmt(inTotal + pendEv) + '</span></div>';

  // הוצאות: עסקאות הוצאה + שכר ששולם
  const txExpRows = cachedTx.filter(x => x.type === 'expense');
  const paidEmpSalary = cachedEmpEvents.filter(e => e.status === 'שולם').reduce((s, e) => s + e.amount, 0);
  const paidWorkerSalary = cachedEventWorkers.filter(w => monthDetailIds.includes(w.event_detail_id) && w.status === 'שולם').reduce((s, w) => s + w.amount, 0);
  const salary = paidEmpSalary + paidWorkerSalary;

  let expHtml = txExpRows.map(x =>
    '<div class="mv-row mv-static" title="' + esc(x.description) + '"><div class="mv-name">' + esc(x.description) +
    (x.category ? ' <span class="mv-sub">· ' + esc(t(x.category)) + '</span>' : '') + '</div>' +
    '<div class="mv-amount" style="color:var(--red)">' + fmt(x.amount) + '</div></div>'
  ).join('');
  if (salary > 0) expHtml += '<div class="mv-row mv-static"><div class="mv-name">' + t('שכר עובדים') + ' <span class="mv-sub">· ' + t('שולם החודש') + '</span></div>' +
    '<div class="mv-amount" style="color:var(--red)">' + fmt(salary) + '</div></div>';

  expEl.innerHTML = expHtml || '<div class="empty">' + t('אין הוצאות החודש') + '</div>';
  const expCount = txExpRows.length + (salary > 0 ? 1 : 0);
  $('mv-expense-count').textContent = expCount ? expCount + ' ' + (currentLang === 'en' ? 'items' : 'פריטים') : '';

  const expTotal = txExpRows.reduce((s, x) => s + x.amount, 0) + salary;
  const net = inTotal - expTotal;
  $('mv-expense-totals').innerHTML =
    '<div class="mv-tot-row mv-tot-main"><span>' + t('סה"כ הוצאות') + '</span><span style="color:var(--red)">' + fmt(expTotal) + '</span></div>' +
    '<div class="mv-tot-row"><span>' + t('נשאר ביד') + '</span><span style="font-weight:600;color:' + (net >= 0 ? 'var(--green)' : 'var(--red)') + '">' + fmt(net) + '</span></div>';
}

// פתיחת עריכת אירוע מהתצוגה החודשית — לפי ID בלבד (בטוח לכל כותרת)
function mvEditEvent(detailId) {
  const d = cachedEventDetails.find(x => x.id === detailId);
  if (!d) return;
  editIncomeEvent(d.event_title || '', d.event_date || '', detailId);
}

// עדכון סטטוס אירוע ישירות מהשורה (בלי לפתוח מודל)
async function updateEventStatus(id, status) {
  await sb.from('event_details').update({ status }).eq('id', id);
  await loadAll();
}

// בונה את מבנה הנתונים המשותף לשתי התצוגות
// ── הסתרת אירועי יומן (רשימת מוסתרים מקומית) ──
// אירוע יומן שהמשתמש בחר להסתיר לא יופיע גם אחרי סנכרון עתידי.
// מפתח יציב: כותרת + תאריך (עקבי עם האופן שבו getEventInfo מתאים אירועים).
function hiddenKey(title, dateStr) { return (title || '').trim() + '|' + (dateStr || ''); }
function getHiddenEvents() {
  try { return JSON.parse(localStorage.getItem('cf_hidden_events') || '[]'); } catch (e) { return []; }
}
function isEventHidden(title, dateStr) { return getHiddenEvents().includes(hiddenKey(title, dateStr)); }
function hideEvent(title, dateStr) {
  const list = getHiddenEvents();
  const k = hiddenKey(title, dateStr);
  if (!list.includes(k)) { list.push(k); localStorage.setItem('cf_hidden_events', JSON.stringify(list)); }
}

function buildEventsData() {
  const month = getMonth();
  const manualEvents = cachedEventDetails.filter(d => d.month === month && d.is_manual);
  const allEvents = [
    ...gcalEvents
      // סנן לחודש הנבחר בלבד — מונע "דליפה" של אירועי גבול (למשל 1 ביולי בתצוגת יוני)
      .filter(ev => localDateStr(ev.start).slice(0, 7) === month)
      .filter(ev => !isEventHidden(ev.title, localDateStr(ev.start)))
      .map(ev => {
        // צרף את מזהה הרשומה אם קיימת — כך שעריכה תמצא אותה תמיד
        const ds = localDateStr(ev.start);
        let d = cachedEventDetails.find(x => x.event_title === ev.title && x.event_date === ds);
        if (!d) {
          const near = [addDays(ds, -1), addDays(ds, 1)];
          d = cachedEventDetails.find(x => x.event_title === ev.title && near.includes(x.event_date));
        }
        return { title: ev.title, start: ev.start, allDay: ev.allDay, source: 'gcal', detailId: d ? d.id : '' };
      }),
    ...manualEvents.map(d => ({ title: d.event_title, start: d.event_date + 'T00:00:00', allDay: true, source: 'manual', detailId: d.id }))
  ].sort((a, b) => a.start > b.start ? 1 : -1);
  allRenderedEvents = allEvents;
  return allEvents;
}

// מחלץ את התאריך המקומי (YYYY-MM-DD) ממחרוזת אירוע, בצורה שלא מושפעת מאזור זמן.
// אם המחרוזת כוללת זמן/UTC (יש בה 'T' או 'Z'), ממיר לזמן מקומי ואז לוקח את היום.
// אם היא תאריך בלבד (all-day), לוקח את התאריך כמו שהוא.
function localDateStr(start) {
  if (!start) return '';
  // תאריך בלבד ללא זמן — קח כמו שהוא (אירוע יום שלם)
  if (start.length === 10 && start.indexOf('T') === -1) return start;
  // תאריך עם 'T00:00:00' מקומי שהוספנו ידנית (manual) — קח את החלק הראשון
  if (start.indexOf('T00:00:00') !== -1 && start.indexOf('Z') === -1 && start.indexOf('+') === -1) return start.slice(0, 10);
  // אחרת — מחרוזת עם זמן/UTC מגוגל: המר לזמן מקומי
  const d = new Date(start);
  if (isNaN(d)) return start.slice(0, 10);
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return y + '-' + m + '-' + day;
}
// מוסיף/מחסיר ימים ממחרוזת תאריך YYYY-MM-DD ומחזיר מחרוזת תאריך
function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d + n);
  return dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
}

// מחזיר את הפרטים המלאים של אירוע (detail, client, workers, סטטוס, צבע)
function getEventInfo(ev) {
  let detail;
  if (ev.source === 'manual') {
    detail = cachedEventDetails.find(d => d.id === ev.detailId);
  } else {
    const dateStr = localDateStr(ev.start);
    // התאמה מדויקת קודם
    detail = cachedEventDetails.find(d => d.event_title === ev.title && d.event_date === dateStr);
    // אם לא נמצא — חפש לפי כותרת עם סטייה של יום (אירועים ישנים שנשמרו עם תאריך אזור-זמן שגוי)
    if (!detail) {
      const near = [addDays(dateStr, -1), addDays(dateStr, 1)];
      detail = cachedEventDetails.find(d => d.event_title === ev.title && near.includes(d.event_date));
    }
  }
  const client = detail && detail.client_id ? cachedClients.find(c => c.id === detail.client_id) : null;
  const workers = detail ? cachedEventWorkers.filter(w => w.event_detail_id === detail.id) : [];
  const workerTotal = workers.reduce((s, w) => s + w.amount, 0);
  const profit = detail && detail.price ? detail.price - workerTotal : null;
  const statusCls = detail ? (detail.status === '\u05d1\u05d5\u05e6\u05e2 \u05ea\u05e9\u05dc\u05d5\u05dd' || detail.status === '\u05d1\u05d5\u05e6\u05e2 \u05ea\u05e9\u05dc\u05d5\u05dd + \u05d7\u05e9\u05d1\u05d5\u05e0\u05d9\u05ea \u05de\u05e1' ? 'paid' : detail.status === '\u05d9\u05e6\u05d0\u05d4 \u05d3\u05e8\u05d9\u05e9\u05ea \u05ea\u05e9\u05dc\u05d5\u05dd' ? 'pending' : 'late') : '';
  const barColor = !detail ? '#94a3b8' : statusCls === 'paid' ? 'var(--green)' : statusCls === 'pending' ? 'var(--amber)' : 'var(--red)';
  return { detail, client, workers, workerTotal, profit, statusCls, barColor };
}

// גוף מורחב של אירוע (משותף)
function eventBodyHtml(info) {
  const { detail, workers, workerTotal, profit } = info;
  if (!detail) return '<div style="font-size:13px;color:var(--muted);text-align:center">\u05dc\u05d7\u05e5 \u05e2\u05dc \u270f\ufe0f \u05dc\u05d4\u05d5\u05e1\u05e4\u05ea \u05e4\u05e8\u05d8\u05d9\u05dd</div>';
  return '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:10px"><div><div style="font-size:11px;color:var(--muted)">\u05de\u05d7\u05d9\u05e8 \u05dc\u05dc\u05e7\u05d5\u05d7</div><div style="font-weight:600;color:var(--green)">' + fmt(detail.price || 0) + '</div></div><div><div style="font-size:11px;color:var(--muted)">\u05e2\u05dc\u05d5\u05ea \u05e2\u05d5\u05d1\u05d3\u05d9\u05dd</div><div style="font-weight:600;color:var(--red)">' + fmt(workerTotal) + '</div></div><div><div style="font-size:11px;color:var(--muted)">\u05e8\u05d5\u05d5\u05d7</div><div style="font-weight:600;color:' + (profit !== null && profit >= 0 ? 'var(--green)' : 'var(--red)') + '">' + (profit !== null ? fmt(profit) : '\u2014') + '</div></div></div>' + (workers.length ? '<div style="font-size:12px;color:var(--muted);margin-bottom:4px">\u05e2\u05d5\u05d1\u05d3\u05d9\u05dd:</div>' + workers.map(w => { const emp = cachedEmps.find(e => e.id === w.employee_id); return '<div style="display:flex;justify-content:space-between;font-size:13px;padding:4px 0">' + (emp ? esc(emp.name) : '\u2014') + '<span>' + fmt(w.amount) + ' \u00b7 <span class="badge badge-' + (w.status === '\u05e9\u05d5\u05dc\u05dd' ? 'paid' : w.status === '\u05d1\u05d0\u05d9\u05d7\u05d5\u05e8' ? 'late' : 'pending') + '">' + w.status + '</span></span></div>'; }).join('') : '') + (detail.notes ? '<div style="font-size:12px;color:var(--muted);margin-top:8px;padding:8px;background:var(--bg);border-radius:var(--radius-sm)">' + esc(detail.notes) + '</div>' : '');
}

// כפתורי עריכה/מחיקה (משותף)
function eventActionsHtml(ev, info) {
  const editBtn = '<button class="btn-sm" onclick="event.stopPropagation();openEditEventModalByTitle(this);return false;" data-title="' + esc(ev.title||'') + '" data-date="' + localDateStr(ev.start) + '" data-source="' + ev.source + '" data-detailid="' + (ev.detailId||'') + '">&#9999;</button>';
  let delBtn = '';
  if (ev.source === 'manual') {
    // אירוע ידני — מחיקה אמיתית מה-DB
    delBtn = '<button class="btn-del" onclick="event.stopPropagation();deleteManualEventByEl(this);return false;" data-detailid="' + (ev.detailId||'') + '">&#128465;</button>';
  } else {
    // אירוע יומן — הסתרה קבועה (לא יחזור בסנכרון)
    delBtn = '<button class="btn-del" onclick="event.stopPropagation();hideGcalEventByEl(this);return false;" data-title="' + esc(ev.title||'') + '" data-date="' + localDateStr(ev.start) + '" title="' + t('הסתר אירוע') + '">&#128465;</button>';
  }
  // סטטוס תשלום — ניתן לשינוי ישירות מהרשימה (רק לאירוע עם פרטים שמורים)
  let statusHtml = '';
  if (info.detail) {
    const isPaid = info.detail.status === 'בוצע תשלום' || info.detail.status === 'בוצע תשלום + חשבונית מס';
    // הסטטוס נערך כעת ממסך העריכה (✎) כדי לא לדחוס את השורה במובייל; צבע הפס מציין את הסטטוס.
    const quickPaid = !isPaid
      ? '<button class="btn-paid-quick" onclick="event.stopPropagation();updateEventStatus(\'' + info.detail.id + '\',\'בוצע תשלום\');return false;" title="סמן כשולם">✓ שולם</button>'
      : '';
    statusHtml = quickPaid;
  }
  return statusHtml + editBtn + delBtn;
}

function renderEventsList() {
  renderHiddenEvents();
  if (eventViewMode === 'calendar') { renderEventsCalendar(); return; }
  const el = $('events-list');
  const allEvents = buildEventsData();
  if (!allEvents.length) { el.innerHTML = '<div class="empty">\u05d0\u05d9\u05df \u05d0\u05d9\u05e8\u05d5\u05e2\u05d9\u05dd \u05d4\u05d7\u05d5\u05d3\u05e9. \u05d4\u05d5\u05e1\u05e3 \u05d0\u05d9\u05e8\u05d5\u05e2 \u05d9\u05d3\u05e0\u05d9 \u05d0\u05d5 \u05e8\u05e2\u05e0\u05df \u05d0\u05ea \u05d4\u05d9\u05d5\u05de\u05df</div>'; return; }

  const todayStr = new Date().toISOString().slice(0, 10);
  // קבץ לפי תאריך
  const groups = {};
  allEvents.forEach((ev, i) => { const d = localDateStr(ev.start); (groups[d] = groups[d] || []).push({ ev, i }); });

  el.innerHTML = Object.keys(groups).sort().map(dateKey => {
    const date = new Date(dateKey + 'T00:00:00');
    const isToday = dateKey === todayStr;
    const dayCount = groups[dateKey].length;
    const countBadge = dayCount > 1 ? '<span class="ev-day-count">' + dayCount + ' ' + (currentLang === 'en' ? '' : '\u05d0\u05d9\u05e8\u05d5\u05e2\u05d9\u05dd') + '</span>' : '';
    const dayHeader = '<div class="ev-day-header"><span class="ev-day-num">' + date.getDate() + '</span><span class="ev-day-rest">' + MON(date.getMonth()) + ' \u00b7 ' + (currentLang === 'en' ? ENG_DAYS[date.getDay()] : '\u05d9\u05d5\u05dd ' + HEB_DAYS[date.getDay()]) + '</span>' + countBadge + (isToday ? '<span class="ev-day-today">' + (currentLang === 'en' ? 'Today' : '\u05d4\u05d9\u05d5\u05dd') + '</span>' : '') + '</div>';
    const rows = groups[dateKey].map(({ ev, i }) => {
      const info = getEventInfo(ev);
      const wkCount = info.workers ? info.workers.length : 0;
      const wkBadge = wkCount > 0 ? '<span class="ev-wk-badge">\uD83D\uDC65 ' + wkCount + '</span>' : '';
      const metaParts = [];
      if (info.client) metaParts.push(esc(info.client.name));
      if (info.detail && info.detail.price) metaParts.push('<span style="color:var(--green);font-weight:600">' + fmt(info.detail.price) + '</span>');
      if (ev.source === 'manual') metaParts.push('<span style="color:var(--muted)">\u05d9\u05d3\u05e0\u05d9</span>');
      const metaHtml = metaParts.join(' \u00b7 ');
      return '<div class="ev-row" onclick="toggleEl(\'evr-' + i + '\')"><div class="ev-row-bar" style="background:' + info.barColor + '"></div><div class="ev-row-main"><div class="ev-row-title">' + esc(ev.title || '(\u05dc\u05dc\u05d0 \u05e9\u05dd)') + wkBadge + '</div>' + (metaHtml ? '<div class="ev-row-meta">' + metaHtml + '</div>' : '') + '</div><div class="ev-row-side">' + eventActionsHtml(ev, info) + '</div></div><div class="ev-row-body" id="evr-' + i + '">' + eventBodyHtml(info) + '</div>';
    }).join('');
    return '<div class="ev-day-group">' + dayHeader + rows + '</div>';
  }).join('');
}

function renderEventsCalendar() {
  const el = $('events-calendar');
  const allEvents = buildEventsData();
  const [year, mon] = getMonth().split('-').map(Number);
  const firstDay = new Date(year, mon - 1, 1).getDay();
  const daysInMonth = new Date(year, mon, 0).getDate();
  const todayStr = new Date().toISOString().slice(0, 10);

  // מפה תאריך → אירועים
  const byDate = {};
  allEvents.forEach((ev, i) => { const d = Number(localDateStr(ev.start).slice(8, 10)); (byDate[d] = byDate[d] || []).push({ ev, i }); });

  const weekdays = currentLang === 'en'
    ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    : ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
  let cells = weekdays.map(w => '<div class="cal-weekday">' + w + '</div>').join('');
  // תאים ריקים עד תחילת החודש
  for (let i = 0; i < firstDay; i++) cells += '<div class="cal-cell empty-cell"></div>';
  // ימי החודש
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = year + '-' + String(mon).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    const isToday = dateStr === todayStr;
    const dayEvents = byDate[day] || [];
    const shown = dayEvents.slice(0, 3);
    const evHtml = shown.map(({ ev, i }) => {
      const info = getEventInfo(ev);
      return '<div class="cal-event" style="background:' + info.barColor + '" onclick="openEventFromCal(' + i + ')" title="' + esc(ev.title || '') + '">' + esc(ev.title || '(\u05dc\u05dc\u05d0 \u05e9\u05dd)') + '</div>';
    }).join('');
    const more = dayEvents.length > 3 ? '<div class="cal-more">+' + (dayEvents.length - 3) + ' ' + (currentLang === 'en' ? 'more' : '\u05e0\u05d5\u05e1\u05e4\u05d9\u05dd') + '</div>' : '';
    cells += '<div class="cal-cell' + (isToday ? ' today' : '') + '"><span class="cal-cell-num">' + day + '</span>' + evHtml + more + '</div>';
  }
  // מקרא צבעים (סטטוס תשלום)
  const legend = '<div class="cal-legend">' +
    '<div class="cal-legend-item"><span class="cal-legend-dot" style="background:var(--green)"></span>' + t('בוצע תשלום') + '</div>' +
    '<div class="cal-legend-item"><span class="cal-legend-dot" style="background:var(--amber)"></span>' + t('יצאה דרישת תשלום') + '</div>' +
    '<div class="cal-legend-item"><span class="cal-legend-dot" style="background:var(--red)"></span>' + t('לא יצאה דרישת תשלום') + '</div>' +
    '<div class="cal-legend-item"><span class="cal-legend-dot" style="background:#94a3b8"></span>' + (currentLang === 'en' ? 'No details' : '\u05d0\u05d9\u05df \u05e4\u05e8\u05d8\u05d9\u05dd') + '</div>' +
    '</div>';
  el.innerHTML = '<div class="cal-wrap"><div class="cal-grid">' + cells + '</div></div>' + legend;
}

// פתיחת אירוע מתוך תא ביומן — פותח את מודל העריכה
function openEventFromCal(idx) {
  const ev = allRenderedEvents[idx];
  if (!ev) return;
  openEditEventModal({ title: ev.title, date: localDateStr(ev.start), source: ev.source, detailId: ev.detailId });
}

function setEventView(mode) {
  eventViewMode = mode;
  $('vt-list').classList.toggle('active', mode === 'list');
  $('vt-cal').classList.toggle('active', mode === 'calendar');
  $('events-list').style.display = mode === 'list' ? 'block' : 'none';
  $('events-calendar').style.display = mode === 'calendar' ? 'block' : 'none';
  renderEventsList();
}

function renderEmpCards(monthDetailIds) {
  const el = $('emp-cards');
  if (!cachedEmps.length) { el.innerHTML = '<div class="section"><div class="empty">\u05dc\u05d0 \u05e0\u05d5\u05e1\u05e4\u05d5 \u05e2\u05d5\u05d1\u05d3\u05d9\u05dd</div></div>'; return; }
  const ids = monthDetailIds || getMonthDetails().map(d => d.id);
  el.innerHTML = cachedEmps.map(emp => {
    const evs = cachedEmpEvents.filter(e => e.employee_id === emp.id);
    const ewks = cachedEventWorkers.filter(w => w.employee_id === emp.id && ids.includes(w.event_detail_id));
    const total = evs.reduce((s, e) => s + e.amount, 0) + ewks.reduce((s, w) => s + w.amount, 0);

    const evRows = ewks.map(w => {
      const det = cachedEventDetails.find(d => d.id === w.event_detail_id);
      return '<tr><td style="font-size:13px">' + (det ? esc(det.event_title) : '\u05d0\u05d9\u05e8\u05d5\u05e2') + ' <span style="font-size:10px;background:var(--blue-bg);color:var(--blue);padding:1px 5px;border-radius:100px">\u05de\u05d0\u05d9\u05e8\u05d5\u05e2</span></td><td style="font-size:12px;color:var(--muted)">' + (det ? det.event_date || '\u2014' : '\u2014') + '</td><td style="font-weight:600">' + fmt(w.amount) + '</td><td><select class="status-select" onchange="updateEventWorkerStatus(\'' + w.id + '\',this.value)">' + ['\u05de\u05de\u05ea\u05d9\u05df', '\u05e9\u05d5\u05dc\u05dd', '\u05d1\u05d0\u05d9\u05d7\u05d5\u05e8'].map(s => '<option value="' + s + '"' + (w.status === s ? ' selected' : '') + '>' + t(s) + '</option>').join('') + '</select></td><td></td></tr>';
    }).join('');

    const empEvRows = evs.map(ev => '<tr><td style="font-size:13px">' + esc(ev.event_name) + '</td><td style="font-size:12px;color:var(--muted)">' + (ev.date || '\u2014') + '</td><td style="font-weight:600">' + fmt(ev.amount) + '</td><td><select class="status-select" onchange="updateEmpEventStatus(\'' + ev.id + '\',this.value)">' + ['\u05de\u05de\u05ea\u05d9\u05df', '\u05e9\u05d5\u05dc\u05dd', '\u05d1\u05d0\u05d9\u05d7\u05d5\u05e8'].map(s => '<option value="' + s + '"' + (ev.status === s ? ' selected' : '') + '>' + t(s) + '</option>').join('') + '</select></td><td><button class="btn-del" onclick="deleteEmpEvent(\'' + ev.id + '\')">&#128465;</button></td></tr>').join('');

    return '<div class="emp-card"><div class="emp-card-header" onclick="toggleCard(\'' + emp.id + '\')"><div><div class="emp-card-name">&#128100; ' + esc(emp.name) + '</div><div class="emp-card-meta">' + esc(emp.role || '') + (emp.phone ? ' \u00b7 ' + esc(emp.phone) : '') + ' \u00b7 ' + (evs.length + ewks.length) + ' \u05d0\u05d9\u05e8\u05d5\u05e2\u05d9\u05dd \u05d4\u05d7\u05d5\u05d3\u05e9' + (total > 0 ? ' \u00b7 ' + fmt(total) : '') + '</div></div><div style="display:flex;align-items:center;gap:8px"><button class="btn-outline" style="font-size:12px" onclick="event.stopPropagation();openEmpModal(\'' + emp.id + '\')">✏️</button><button class="btn-del" onclick="event.stopPropagation();deleteEmp(\'' + emp.id + '\')">&#128465;</button><span id="toggle-icon-' + emp.id + '">&#9660;</span></div></div><div class="emp-card-body" id="card-body-' + emp.id + '"><div class="event-form"><div style="font-size:12px;color:var(--muted);margin-bottom:8px;font-weight:500">+ \u05d4\u05d5\u05e1\u05e3 \u05d0\u05d9\u05e8\u05d5\u05e2</div><div class="form-row"><input type="text" id="ev-event-' + emp.id + '" placeholder="\u05e9\u05dd \u05d4\u05d0\u05d9\u05e8\u05d5\u05e2" /><input type="date" id="ev-date-' + emp.id + '" /><input type="number" id="ev-amount-' + emp.id + '" placeholder="\u05e1\u05db\u05d5\u05dd \u20aa" min="0" /></div><button class="btn-sm" onclick="addEmpEvent(\'' + emp.id + '\')">\u05d4\u05d5\u05e1\u05e3</button></div>' + ((evs.length + ewks.length) ? '<table><thead><tr><th>\u05d0\u05d9\u05e8\u05d5\u05e2</th><th>\u05ea\u05d0\u05e8\u05d9\u05da</th><th>\u05e1\u05db\u05d5\u05dd</th><th>\u05e1\u05d8\u05d0\u05d8\u05d5\u05e1</th><th></th></tr></thead><tbody>' + evRows + empEvRows + '</tbody></table>' : '<div style="font-size:13px;color:var(--muted);text-align:center;padding:10px">\u05d0\u05d9\u05df \u05d0\u05d9\u05e8\u05d5\u05e2\u05d9\u05dd \u05d4\u05d7\u05d5\u05d3\u05e9</div>') + '</div></div>';
  }).join('');
}

function renderClientsList() {
  const el = $('clients-list');
  if (!cachedClients.length) { el.innerHTML = '<div class="section"><div class="empty">\u05dc\u05d0 \u05e0\u05d5\u05e1\u05e4\u05d5 \u05dc\u05e7\u05d5\u05d7\u05d5\u05ea</div></div>'; return; }
  el.innerHTML = '<div class="clients-wrap">' + cachedClients.map(c => {
    const cEvs = cachedEventDetails.filter(d => d.client_id === c.id);
    const totalPrice = cEvs.reduce((s, d) => s + (d.price || 0), 0);
    const totalPaid = cEvs.filter(d => d.status === '\u05d1\u05d5\u05e6\u05e2 \u05ea\u05e9\u05dc\u05d5\u05dd' || d.status === '\u05d1\u05d5\u05e6\u05e2 \u05ea\u05e9\u05dc\u05d5\u05dd + \u05d7\u05e9\u05d1\u05d5\u05e0\u05d9\u05ea \u05de\u05e1').reduce((s, d) => s + (d.price || 0), 0);
    const debt = totalPrice - totalPaid;
    return '<div class="client-card"><div class="client-card-header" onclick="toggleEl(\'client-body-' + c.id + '\')"><div><div style="font-weight:600;font-size:14px">' + esc(c.name) + '</div><div style="font-size:12px;color:var(--muted);margin-top:2px">' + esc(c.phone || '') + (c.business_id ? ' \u00b7 \u05d7.\u05e4: ' + esc(c.business_id) : '') + (totalPrice > 0 ? ' \u00b7 \u05e1\u05d4"\u05db: ' + fmt(totalPrice) : '') + (debt > 0 ? ' \u00b7 <span style="color:var(--red)">\u05d7\u05d5\u05d1: ' + fmt(debt) + '</span>' : '') + '</div></div><div style="display:flex;align-items:center;gap:8px"><button class="btn-del" onclick="event.stopPropagation();deleteClient(\'' + c.id + '\')">&#128465;</button><span>&#9660;</span></div></div><div class="client-card-body" id="client-body-' + c.id + '"><div class="client-info">' + (c.phone ? '<div class="client-info-item"><label>\u05d8\u05dc\u05e4\u05d5\u05df</label>' + esc(c.phone) + '</div>' : '') + (c.email ? '<div class="client-info-item"><label>\u05d0\u05d9\u05de\u05d9\u05d9\u05dc</label>' + esc(c.email) + '</div>' : '') + (c.business_id ? '<div class="client-info-item"><label>\u05d7.\u05e4 / \u05e2.\u05de</label>' + esc(c.business_id) + '</div>' : '') + '<div class="client-info-item"><label>\u05e1\u05d4"\u05db</label>' + fmt(totalPrice) + '</div><div class="client-info-item"><label>\u05e9\u05d5\u05dc\u05dd</label><span style="color:var(--green)">' + fmt(totalPaid) + '</span></div>' + (debt > 0 ? '<div class="client-info-item"><label>\u05d9\u05ea\u05e8\u05d4</label><span style="color:var(--red)">' + fmt(debt) + '</span></div>' : '') + '</div>' + (cEvs.length ? '<div style="font-size:12px;color:var(--muted);margin-bottom:6px;font-weight:500">\u05d4\u05d9\u05e1\u05d8\u05d5\u05e8\u05d9\u05d9\u05ea:</div>' + cEvs.map(d => '<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px"><span>' + esc(d.event_title) + '</span><span>' + (d.price ? fmt(d.price) : '\u2014') + ' \u00b7 <span class="badge badge-' + (d.status === '\u05d1\u05d5\u05e6\u05e2 \u05ea\u05e9\u05dc\u05d5\u05dd' || d.status === '\u05d1\u05d5\u05e6\u05e2 \u05ea\u05e9\u05dc\u05d5\u05dd + \u05d7\u05e9\u05d1\u05d5\u05e0\u05d9\u05ea \u05de\u05e1' ? 'paid' : d.status === '\u05d9\u05e6\u05d0\u05d4 \u05d3\u05e8\u05d9\u05e9\u05ea \u05ea\u05e9\u05dc\u05d5\u05dd' ? 'pending' : 'late') + '">' + esc(d.status) + '</span></span></div>').join('') : '<div style="font-size:13px;color:var(--muted);text-align:center">\u05d0\u05d9\u05df \u05d0\u05d9\u05e8\u05d5\u05e2\u05d9\u05dd</div>') + '</div></div>';
  }).join('') + '</div>';
}

function renderAlerts(income, expense, salary, net, pendingIncome) {
  const alerts = [];
  if (net < 0) alerts.push({ type: 'danger', msg: '\u05d9\u05ea\u05e8\u05d4 \u05e9\u05dc\u05d9\u05dc\u05d9\u05ea: ' + fmt(net) });
  const lateEvs = cachedEventDetails.filter(d => d.status === '\u05d9\u05e6\u05d0\u05d4 \u05d3\u05e8\u05d9\u05e9\u05ea \u05ea\u05e9\u05dc\u05d5\u05dd');
  if (lateEvs.length) alerts.push({ type: 'warn', msg: lateEvs.length + ' \u05d0\u05d9\u05e8\u05d5\u05e2\u05d9\u05dd \u05e2\u05dd \u05d3\u05e8\u05d9\u05e9\u05ea \u05ea\u05e9\u05dc\u05d5\u05dd \u05e9\u05d8\u05e8\u05dd \u05e9\u05d5\u05dc\u05de\u05d4' });
  const lateWkrs = cachedEmpEvents.filter(e => e.status === '\u05d1\u05d0\u05d9\u05d7\u05d5\u05e8');
  if (lateWkrs.length) alerts.push({ type: 'danger', msg: lateWkrs.length + ' \u05ea\u05e9\u05dc\u05d5\u05de\u05d9\u05dd \u05dc\u05e2\u05d5\u05d1\u05d3\u05d9\u05dd \u05d1\u05d0\u05d9\u05d7\u05d5\u05e8' });
  const debtClients = cachedClients.filter(c => { const evs = cachedEventDetails.filter(d => d.client_id === c.id); const debt = evs.reduce((s, d) => s + (d.price || 0), 0) - evs.filter(d => d.status === '\u05d1\u05d5\u05e6\u05e2 \u05ea\u05e9\u05dc\u05d5\u05dd' || d.status === '\u05d1\u05d5\u05e6\u05e2 \u05ea\u05e9\u05dc\u05d5\u05dd + \u05d7\u05e9\u05d1\u05d5\u05e0\u05d9\u05ea \u05de\u05e1').reduce((s, d) => s + (d.price || 0), 0); return debt > 0; });
  if (debtClients.length) alerts.push({ type: 'warn', msg: debtClients.length + ' \u05dc\u05e7\u05d5\u05d7\u05d5\u05ea \u05e2\u05dd \u05d9\u05ea\u05e8\u05d4 \u05dc\u05ea\u05e9\u05dc\u05d5\u05dd: ' + debtClients.map(c => esc(c.name)).join(', ') });
  if (!alerts.length) alerts.push({ type: 'ok', msg: '\u05d4\u05db\u05dc \u05ea\u05e7\u05d9\u05df \u2713' });
  $('alerts-box').innerHTML = alerts.map(a => '<div class="alert alert-' + a.type + '">' + a.msg + '</div>').join('');
}

// ── GOOGLE CALENDAR ──
async function loadGCal(showLoading) {
  const el = $('events-list');
  if (!currentUser) return;
  if (showLoading && el) el.innerHTML = '<div class="empty">\u05d8\u05d5\u05e2\u05df...</div>';
  try {
    // קרא לאירועי היומן של המשתמש הנוכחי בלבד
    const res = await fetch(GCAL_FN_URL + '?action=events&user_id=' + encodeURIComponent(currentUser.id) + '&month=' + getMonth(), {
      headers: { 'Authorization': 'Bearer ' + SB_KEY }
    });
    const data = await res.json();
    gcalConnected = !!data.connected;
    gcalEvents = Array.isArray(data.events) ? data.events : [];
    renderEventsList();
    updateGCalButton();
  } catch (err) {
    if (!Array.isArray(gcalEvents)) gcalEvents = [];
    renderEventsList();
    updateGCalButton();
    if (showLoading && el) el.innerHTML = '<div class="empty" style="color:var(--red)">\u05e9\u05d2\u05d9\u05d0\u05ea \u05d7\u05d9\u05d1\u05d5\u05e8 \u05dc\u05d9\u05d5\u05de\u05df</div>';
  }
}

// פותח חלון חיבור יומן גוגל עבור המשתמש הנוכחי
async function connectGCal() {
  if (!currentUser) return;
  try {
    const res = await fetch(GCAL_FN_URL + '?action=start&user_id=' + encodeURIComponent(currentUser.id), {
      headers: { 'Authorization': 'Bearer ' + SB_KEY }
    });
    const data = await res.json();
    if (data.url) {
      // פתח את מסך ההסכמה של גוגל בחלון חדש
      window.open(data.url, '_blank', 'width=520,height=640');
      // בדוק שוב אחרי שהמשתמש חוזר (לאחר כמה שניות)
      setTimeout(() => loadGCal(true), 4000);
    }
  } catch (err) {
    alert(currentLang === 'en' ? 'Failed to start calendar connection' : '\u05e9\u05d2\u05d9\u05d0\u05d4 \u05d1\u05d7\u05d9\u05d1\u05d5\u05e8 \u05d4\u05d9\u05d5\u05de\u05df');
  }
}

// מנתק את היומן של המשתמש הנוכחי
async function disconnectGCal() {
  if (!currentUser) return;
  if (!confirm(currentLang === 'en' ? 'Disconnect Google Calendar?' : '\u05dc\u05e0\u05ea\u05e7 \u05d0\u05ea \u05d9\u05d5\u05de\u05df \u05d2\u05d5\u05d2\u05dc?')) return;
  try {
    await fetch(GCAL_FN_URL + '?action=disconnect', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: currentUser.id })
    });
    gcalConnected = false;
    gcalEvents = [];
    renderEventsList();
    updateGCalButton();
  } catch (err) {}
}

// מעדכן את כפתור היומן לפי מצב החיבור
function updateGCalButton() {
  const btn = $('gcal-btn');
  if (!btn) return;
  if (gcalConnected) {
    btn.textContent = currentLang === 'en' ? '\u2713 Calendar connected' : '\u2713 \u05d4\u05d9\u05d5\u05de\u05df \u05de\u05d7\u05d5\u05d1\u05e8';
    btn.onclick = disconnectGCal;
    btn.style.color = 'var(--green)';
  } else {
    btn.textContent = currentLang === 'en' ? '\uD83D\uDCC5 Connect calendar' : '\uD83D\uDCC5 \u05d7\u05d1\u05e8 \u05d9\u05d5\u05de\u05df';
    btn.onclick = connectGCal;
    btn.style.color = '';
  }
}

// ── EVENT MODAL ──
function openNewEventModal() {
  isNewManualEvent = true; currentEditDetailId = null; currentEventDate = null; modalWorkers = [];
  $('modal-event-title').textContent = '\u05d0\u05d9\u05e8\u05d5\u05e2 \u05d7\u05d3\u05e9';
  $('modal-ev-title').value = ''; $('modal-ev-title').style.display = 'block';
  $('modal-ev-date').value = new Date().toISOString().slice(0, 10); $('modal-ev-date').style.display = 'block';
  fillClientSelect(null);
  $('modal-price').value = ''; $('modal-status').value = '\u05dc\u05d0 \u05d9\u05e6\u05d0\u05d4 \u05d3\u05e8\u05d9\u05e9\u05ea \u05ea\u05e9\u05dc\u05d5\u05dd'; $('modal-notes').value = '';
  renderModalWorkers();
  modalFiles = []; renderEventFiles();
  if ($('event-delete-btn')) $('event-delete-btn').style.display = 'none';
  if ($('event-reset-btn')) $('event-reset-btn').style.display = 'none';
  $('event-modal').style.display = 'flex';
}

async function openEditEventModalByTitle(btn) {
  await openEditEventModal({
    title: btn.getAttribute('data-title').trim(),
    date: btn.getAttribute('data-date'),
    source: btn.getAttribute('data-source'),
    detailId: btn.getAttribute('data-detailid')
  });
}

async function deleteManualEventByEl(btn) {
  const id = btn.getAttribute('data-detailid');
  if (!id || !confirm('למחוק אירוע זה?')) return;
  await sb.from('event_workers').delete().eq('event_detail_id', id);
  await sb.from('event_details').delete().eq('id', id);
  await loadAll();
}

// הסתרת אירוע יומן — לא יופיע שוב גם אחרי סנכרון
function hideGcalEventByEl(btn) {
  const title = btn.getAttribute('data-title');
  const date = btn.getAttribute('data-date');
  const msg = currentLang === 'en'
    ? 'Hide this event from the list? It won\'t reappear after syncing.'
    : 'להסתיר את האירוע מהרשימה? הוא לא יחזור גם אחרי סנכרון.';
  if (!confirm(msg)) return;
  hideEvent(title, date);
  renderEventsList();
}

// שחזור אירוע מוסתר
function unhideEvent(key) {
  const list = getHiddenEvents().filter(k => k !== key);
  localStorage.setItem('cf_hidden_events', JSON.stringify(list));
  renderEventsList();
}

// מציג את רשימת האירועים המוסתרים עם אפשרות שחזור
function renderHiddenEvents() {
  const el = $('hidden-events-area');
  if (!el) return;
  const hidden = getHiddenEvents();
  if (!hidden.length) { el.innerHTML = ''; return; }
  const rows = hidden.map(k => {
    const [title, date] = k.split('|');
    const d = date ? Number(date.slice(8, 10)) + '/' + Number(date.slice(5, 7)) : '';
    return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;font-size:12.5px;border-bottom:1px solid var(--border)">' +
      '<span style="color:var(--muted)">' + esc(title) + (d ? ' · ' + d : '') + '</span>' +
      '<button class="btn-paid-quick" onclick="unhideEvent(\'' + esc(k).replace(/'/g, "\\'") + '\')">' + t('שחזר') + '</button></div>';
  }).join('');
  el.innerHTML = '<details style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);padding:8px 12px">' +
    '<summary style="cursor:pointer;font-size:12.5px;color:var(--muted)">' + t('אירועים מוסתרים') + ' (' + hidden.length + ')</summary>' +
    '<div style="margin-top:8px">' + rows + '</div></details>';
}

// פונקציה מאוחדת לפתיחת מודל עריכת אירוע
async function openEditEventModal({ title, date, source, detailId }) {
  isNewManualEvent = source === 'manual';

  // חיפוש אמין: אם יש מזהה — לפיו. אחרת לפי שם+תאריך (רשומות ישנות).
  let detail = null;
  if (detailId) {
    const r = await sb.from('event_details').select('*').eq('id', detailId).maybeSingle();
    detail = r.data || null;
  }
  if (!detail && title && date) {
    // התאמה מדויקת
    detail = cachedEventDetails.find(d => d.event_title === title && d.event_date === date) || null;
    // סובלנות לסטייה של יום (אירועים שנשמרו עם תאריך מאזור-זמן שגוי)
    if (!detail) {
      const near = [addDays(date, -1), addDays(date, 1)];
      detail = cachedEventDetails.find(d => d.event_title === title && near.includes(d.event_date)) || null;
    }
    // גיבוי אחרון — שאילתה ישירה ל-DB
    if (!detail) {
      const r = await sb.from('event_details').select('*').eq('user_id', currentUser.id).eq('event_title', title).eq('event_date', date).maybeSingle();
      detail = r.data || null;
    }
  }
  currentEditDetailId = detail ? detail.id : (detailId || null);

  // התאריך שמוצג: מהרשומה אם קיים, אחרת מה שהגיע מהיומן
  const shownDate = (detail && detail.event_date) ? detail.event_date : (date || '');
  currentEventDate = shownDate;
  const shownTitle = title || (detail && detail.event_title) || '';

  $('modal-event-title').textContent = shownTitle || 'פרטי אירוע';
  $('modal-ev-title').value = shownTitle;
  $('modal-ev-title').style.display = source === 'manual' ? 'block' : 'none';
  // שדה התאריך תמיד פתוח לעריכה — מאפשר לתקן אירועים ללא תאריך או עם תאריך שגוי
  $('modal-ev-date').value = shownDate;
  $('modal-ev-date').style.display = 'block';
  fillClientSelect(detail ? detail.client_id : null);
  $('modal-price').value = detail ? detail.price || '' : '';
  $('modal-status').value = detail ? detail.status || 'לא יצאה דרישת תשלום' : 'לא יצאה דרישת תשלום';
  $('modal-notes').value = detail ? detail.notes || '' : '';

  if (currentEditDetailId) {
    const wRes = await sb.from('event_workers').select('*').eq('event_detail_id', currentEditDetailId);
    modalWorkers = (wRes.data || []).map(w => ({ employee_id: w.employee_id, amount: w.amount, status: w.status }));
  } else {
    modalWorkers = [];
  }
  renderModalWorkers();
  await loadEventFiles(currentEditDetailId);
  if ($('event-delete-btn')) $('event-delete-btn').style.display = currentEditDetailId ? 'inline-block' : 'none';
  // כפתור האיפוס מוצג גם לאירועי יומן שטרם נשמרו — כדי שהמשתמש יבין למה אין מה לאפס
  if ($('event-reset-btn')) $('event-reset-btn').style.display = 'inline-block';
  $('event-modal').style.display = 'flex';
}

function fillClientSelect(selectedId) {
  $('modal-client').innerHTML = '<option value="">\u2014 \u05dc\u05dc\u05d0 \u05dc\u05e7\u05d5\u05d7 \u2014</option>' +
    cachedClients.map(c => '<option value="' + c.id + '"' + (c.id === selectedId ? ' selected' : '') + '>' + esc(c.name) + '</option>').join('');
}

function addWorkerRow() {
  modalWorkers.push({ employee_id: '', amount: 0, status: '\u05de\u05de\u05ea\u05d9\u05df' });
  renderModalWorkers();
}

function renderModalWorkers() {
  $('modal-workers-list').innerHTML = modalWorkers.map((w, i) =>
    '<div class="worker-row"><select onchange="modalWorkers[' + i + '].employee_id=this.value"><option value="">\u05d1\u05d7\u05e8 \u05e2\u05d5\u05d1\u05d3</option>' +
    cachedEmps.map(e => '<option value="' + e.id + '"' + (w.employee_id === e.id ? ' selected' : '') + '>' + esc(e.name) + '</option>').join('') +
    '</select><input type="number" placeholder="\u20aa" value="' + (w.amount || '') + '" oninput="modalWorkers[' + i + '].amount=parseFloat(this.value)||0" />' +
    '<select onchange="modalWorkers[' + i + '].status=this.value">' +
    ['\u05de\u05de\u05ea\u05d9\u05df', '\u05e9\u05d5\u05dc\u05dd', '\u05d1\u05d0\u05d9\u05d7\u05d5\u05e8'].map(s => '<option value="' + s + '"' + (w.status === s ? ' selected' : '') + '>' + t(s) + '</option>').join('') +
    '</select><button class="btn-del" onclick="modalWorkers.splice(' + i + ',1);renderModalWorkers()">✕</button></div>'
  ).join('');
}

function closeEventModal() { $('event-modal').style.display = 'none'; modalWorkers = []; currentEditDetailId = null; currentEventDate = null; }

// מחיקת אירוע מתוך טופס העריכה
async function deleteEventFromModal() {
  if (!currentEditDetailId) return;
  const title = $('modal-ev-title').value || $('modal-event-title').textContent || 'האירוע';
  if (!confirm('למחוק את "' + title + '"?\nהפעולה תמחק גם את פרטי העובדים של האירוע ואינה ניתנת לביטול.')) return;
  // מחק עובדים מקושרים ואז את האירוע
  await sb.from('event_workers').delete().eq('event_detail_id', currentEditDetailId);
  // מחק גם קבצים מצורפים מהאחסון
  if (modalFiles.length) {
    await sb.storage.from('event-files').remove(modalFiles.map(f => f.storage_path));
  }
  await sb.from('event_details').delete().eq('id', currentEditDetailId);
  closeEventModal();
  // סגור פאנל פירוט אם פתוח, ורענן
  const panel = $('tx-panel');
  const panelType = panel ? panel.dataset.type : null;
  await loadAll();
  if (panel && panelType && panel.style.display !== 'none') { panel.style.display = 'none'; toggleTxPanel(panelType); }
}

// איפוס אירוע — מנקה לקוח, מחיר, סטטוס, הערות ועובדים. משאיר שם ותאריך.
async function resetEventFromModal() {
  const title = $('modal-ev-title').value || $('modal-event-title').textContent || 'האירוע';
  if (!currentEditDetailId) {
    // אירוע יומן שטרם נשמרו לו פרטים — פשוט מנקים את הטופס
    modalWorkers = [];
    renderModalWorkers();
    fillClientSelect(null);
    $('modal-price').value = '';
    $('modal-status').value = 'לא יצאה דרישת תשלום';
    $('modal-notes').value = '';
    alert('לאירוע זה עדיין לא נשמרו פרטים — הטופס נוקה.');
    return;
  }
  if (!confirm('לאפס את "' + title + '"?\n\nיימחקו: לקוח, מחיר, סטטוס תשלום, הערות והעובדים המשויכים.\nהשם והתאריך יישארו.\n\nהפעולה אינה ניתנת לביטול.')) return;

  // מחק את העובדים המשויכים
  await sb.from('event_workers').delete().eq('event_detail_id', currentEditDetailId);
  // מחק קבצים מצורפים (אחסון + רשומות)
  if (modalFiles.length) {
    await sb.storage.from('event-files').remove(modalFiles.map(f => f.storage_path));
    await sb.from('event_files').delete().eq('event_detail_id', currentEditDetailId);
    modalFiles = []; renderEventFiles();
  }
  // נקה את שדות האירוע
  const { error } = await sb.from('event_details').update({
    client_id: null,
    price: 0,
    status: 'לא יצאה דרישת תשלום',
    notes: null
  }).eq('id', currentEditDetailId);
  if (error) { alert('שגיאה באיפוס: ' + error.message); return; }

  // עדכן את המודל כך שישקף את המצב הנקי
  modalWorkers = [];
  renderModalWorkers();
  fillClientSelect(null);
  $('modal-price').value = '';
  $('modal-status').value = 'לא יצאה דרישת תשלום';
  $('modal-notes').value = '';

  // רענן נתונים ברקע (המודל נשאר פתוח)
  const panel = $('tx-panel');
  const panelType = panel ? panel.dataset.type : null;
  await loadAll();
  if (panel && panelType && panel.style.display !== 'none') { panel.style.display = 'none'; toggleTxPanel(panelType); }
}

// ── קבצים מצורפים לאירוע ──
let modalFiles = [];

function fmtSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

async function loadEventFiles(detailId) {
  modalFiles = [];
  if (detailId) {
    const r = await sb.from('event_files').select('*').eq('event_detail_id', detailId).order('created_at');
    if (r.error) {
      console.error('loadEventFiles error:', r.error);
      const el = $('modal-files-list');
      if (el) el.innerHTML = '<div style="font-size:12px;color:var(--red)">שגיאה בטעינת קבצים: ' + esc(r.error.message) + '</div>';
      return;
    }
    modalFiles = r.data || [];
  }
  renderEventFiles();
}

function renderEventFiles() {
  const el = $('modal-files-list');
  if (!el) return;
  if (!modalFiles.length) { el.innerHTML = ''; return; }
  el.innerHTML = modalFiles.map(f =>
    '<div class="ev-file-row">' +
      '<a class="ev-file-name" onclick="openEventFile(\'' + f.id + '\');return false;">📄 ' + esc(f.file_name) + '</a>' +
      '<span class="ev-file-size">' + fmtSize(f.file_size) + '</span>' +
      '<button class="btn-del" onclick="deleteEventFile(\'' + f.id + '\')" title="מחק">&#128465;</button>' +
    '</div>'
  ).join('');
}

async function uploadEventFiles(input) {
  const files = Array.from(input.files || []);
  input.value = '';
  if (!files.length) return;
  // חייבים אירוע שמור כדי לשייך אליו קבצים
  if (!currentEditDetailId) {
    alert('כדי לצרף קבצים, שמור קודם את האירוע (לחץ "שמור") ואז פתח אותו שוב.');
    return;
  }
  const drop = $('ev-file-drop-text');
  const orig = drop ? drop.textContent : '';
  if (drop) drop.textContent = '⏳ מעלה...';

  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) { alert('הקובץ "' + file.name + '" גדול מ-10MB ולא הועלה.'); continue; }
    // נתיב האחסון חייב להיות ASCII בלבד — שומרים רק את הסיומת.
    // השם המקורי (כולל עברית) נשמר ב-DB לצורך תצוגה.
    const dot = file.name.lastIndexOf('.');
    let ext = dot > -1 ? file.name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, '') : '';
    if (!ext) ext = 'dat';
    const rand = Math.random().toString(36).slice(2, 8);
    const path = currentUser.id + '/' + currentEditDetailId + '/' + Date.now() + '_' + rand + '.' + ext;
    const up = await sb.storage.from('event-files').upload(path, file);
    if (up.error) { alert('שגיאה בהעלאת "' + file.name + '": ' + up.error.message); continue; }
    const ins = await sb.from('event_files').insert({
      user_id: currentUser.id,
      event_detail_id: currentEditDetailId,
      file_name: file.name,
      storage_path: path,
      file_size: file.size
    });
    if (ins.error) {
      console.error('event_files insert error:', ins.error);
      alert('הקובץ הועלה אך לא נרשם: ' + ins.error.message);
    }
  }
  if (drop) drop.textContent = orig || '+ הוסף קובץ';
  await loadEventFiles(currentEditDetailId);
}

async function openEventFile(id) {
  const f = modalFiles.find(x => x.id === id);
  if (!f) return;
  const { data, error } = await sb.storage.from('event-files').createSignedUrl(f.storage_path, 60);
  if (error) { alert('שגיאה בפתיחת הקובץ: ' + error.message); return; }
  window.open(data.signedUrl, '_blank');
}

async function deleteEventFile(id) {
  const f = modalFiles.find(x => x.id === id);
  if (!f) return;
  if (!confirm('למחוק את "' + f.file_name + '"?')) return;
  await sb.storage.from('event-files').remove([f.storage_path]);
  await sb.from('event_files').delete().eq('id', id);
  await loadEventFiles(currentEditDetailId);
}

// ניקוי אוטומטי — מוחק קבצים של אירועים שעברו לפני יותר משבוע
async function cleanupOldEventFiles() {
  try {
    const weekAgo = Date.now() - 7 * 86400000;
    const cutoff = new Date(weekAgo).toISOString().slice(0, 10);
    // אירועים שהסתיימו לפני יותר משבוע
    const { data: oldEvents } = await sb.from('event_details')
      .select('id').eq('user_id', currentUser.id).lt('event_date', cutoff);
    if (!oldEvents || !oldEvents.length) return;
    const ids = oldEvents.map(e => e.id);
    const { data: files } = await sb.from('event_files')
      .select('*').eq('user_id', currentUser.id).in('event_detail_id', ids);
    if (!files || !files.length) return;
    // חשוב: מוחקים רק קבצים שגם הם עצמם בני יותר משבוע.
    // אחרת קובץ שהועלה עכשיו לאירוע ישן היה נמחק מיד.
    const stale = files.filter(f => f.created_at && new Date(f.created_at).getTime() < weekAgo);
    if (!stale.length) return;
    await sb.storage.from('event-files').remove(stale.map(f => f.storage_path));
    await sb.from('event_files').delete().in('id', stale.map(f => f.id));
    console.log('נוקו ' + stale.length + ' קבצים ישנים');
  } catch (e) { /* ניקוי הוא best-effort — לא מפריע לשימוש */ }
}

async function saveEvent() {
  const uid = currentUser.id;
  const title = $('modal-ev-title').value.trim() || $('modal-event-title').textContent;
  // התאריך שבשדה הוא מקור האמת (מאפשר תיקון תאריך של אירוע קיים)
  const date = $('modal-ev-date').value || currentEventDate || new Date().toISOString().slice(0, 10);
  const clientId = $('modal-client').value || null;
  const price = parseFloat($('modal-price').value) || 0;
  const status = $('modal-status').value;
  const notes = $('modal-notes').value;
  const eventMonth = date ? date.slice(0, 7) : getMonth();
  if (!title) return;

  let detailId = currentEditDetailId;
  if (!detailId) {
    const existing = await sb.from('event_details').select('id').eq('user_id', uid).eq('event_title', title).eq('event_date', date).maybeSingle();
    if (existing.data) detailId = existing.data.id;
  }

  if (detailId) {
    await sb.from('event_details').update({ event_title: title, event_date: date, client_id: clientId, price, status, notes, month: eventMonth }).eq('id', detailId);
  } else {
    const res = await sb.from('event_details').insert({ user_id: uid, event_title: title, event_date: date, client_id: clientId, price, status, notes, month: eventMonth, is_manual: isNewManualEvent }).select();
    detailId = res.data && res.data[0] ? res.data[0].id : null;
  }

  if (detailId) {
    await sb.from('event_workers').delete().eq('event_detail_id', detailId);
    const valid = modalWorkers.filter(w => w.employee_id && w.amount > 0);
    if (valid.length) await sb.from('event_workers').insert(valid.map(w => ({ event_detail_id: detailId, employee_id: w.employee_id, amount: w.amount, status: w.status || '\u05de\u05de\u05ea\u05d9\u05df' })));
  }

  closeEventModal();
  await loadAll();
  if (gcalEvents.length) renderEventsList();
}

// ── TRANSACTIONS ──
async function addTx() {
  const desc = $('t-desc').value.trim(), amount = parseFloat($('t-amount').value), type = $('t-type').value, category = $('t-cat').value;
  const accSel = $('t-account');
  const picking = accSel && accSel.style.display !== 'none';
  // כשהבורר מוסתר — משייכים אוטומטית לחשבון של המצב הנוכחי
  const accountId = picking ? (accSel.value || null) : defaultAccountFor(appMode);
  if (!desc || !amount || amount <= 0) return;
  $('btn-add-tx').disabled = true;
  // זוכר את החשבון האחרון שנבחר — רוב הרשומות נכנסות לאותו חשבון
  if (accountId) localStorage.setItem('cf_last_account_' + appMode, accountId);
  await sb.from(TX_TABLE()).insert({ user_id: currentUser.id, month: getMonth(), description: desc, amount, type, category, account_id: accountId });
  $('t-desc').value = ''; $('t-amount').value = '';
  $('btn-add-tx').disabled = false;
  await loadAll();
}
async function deleteTx(id) { if (!confirm('\u05dc\u05de\u05d7\u05d5\u05e7?')) return; await sb.from(TX_TABLE()).delete().eq('id', id); await loadAll(); }

// בחירה מרובה של רשומות
function updateTxSelCount() {
  const checked = document.querySelectorAll('.tx-check:checked').length;
  const btn = $('tx-del-multi'), cnt = $('tx-sel-count');
  if (cnt) cnt.textContent = checked;
  if (btn) btn.style.display = checked > 0 ? 'inline-block' : 'none';
  // עדכן את מצב ה"בחר הכל"
  const all = $('tx-check-all');
  if (all) { const total = document.querySelectorAll('.tx-check').length; all.checked = total > 0 && checked === total; }
}
function toggleAllTx(cb) {
  document.querySelectorAll('.tx-check').forEach(c => c.checked = cb.checked);
  updateTxSelCount();
}
// איפוס הוצאות החודש הנוכחי — למעט הוצאות קבועות (המסומנות "(קבועה)")
async function resetMonthExpenses() {
  const month = getMonth();
  // רק הוצאות של החודש שאינן קבועות
  const targets = cachedTx.filter(t =>
    t.type === 'expense' && !(t.description && t.description.includes('(קבועה)'))
  );
  if (!targets.length) {
    alert('אין הוצאות למחיקה החודש (הקבועות נשמרות).');
    return;
  }
  const total = targets.reduce((s, t) => s + (t.amount || 0), 0);
  const msg = 'לאפס את הוצאות החודש?\n\n' +
    'יימחקו ' + targets.length + ' הוצאות בסך ' + fmt(total) + '.\n' +
    'ההוצאות הקבועות וההכנסות יישארו.\n\n' +
    'הפעולה אינה ניתנת לביטול.';
  if (!confirm(msg)) return;
  const ids = targets.map(t => t.id);
  const { error } = await sb.from(TX_TABLE()).delete().in('id', ids);
  if (error) { alert('שגיאה במחיקה: ' + error.message); return; }
  await loadAll();
}

// ניקוי כפילויות בחודש הנוכחי — משאיר עותק אחד מכל רשומה זהה (תיאור+סכום+סוג)
async function cleanDuplicates() {
  const month = getMonth();
  // 1) הגדרות "קבועות" כפולות (אותו תיאור+סכום+קטגוריה) — השורש של כפילויות חוזרות
  const dupRecIds = [];
  if (cachedRecurring && cachedRecurring.length) {
    const seenRec = new Map();
    for (const r of cachedRecurring) {
      const k = (r.description || '').trim() + '|' + (r.amount || 0) + '|' + (r.category || '');
      if (seenRec.has(k)) dupRecIds.push(r.id); else seenRec.set(k, r.id);
    }
  }
  // 2) עסקאות כפולות בחודש (אותו תיאור+סכום+סוג) — שמור את המוקדם ביותר
  const seen = new Map();
  const dupIds = [];
  for (const t of [...cachedTx].reverse()) {
    const key = (t.description || '') + '|' + (t.amount || 0) + '|' + (t.type || '');
    if (seen.has(key)) dupIds.push(t.id); else seen.set(key, t.id);
  }
  if (!dupIds.length && !dupRecIds.length) { alert('לא נמצאו כפילויות. 👍'); return; }
  const parts = [];
  if (dupIds.length) parts.push(dupIds.length + ' רשומות בחודש');
  if (dupRecIds.length) parts.push(dupRecIds.length + ' הגדרות קבועות כפולות');
  if (!confirm('נמצאו: ' + parts.join(' + ') + '.\nלמחוק ולהשאיר עותק אחד מכל אחת?\nהפעולה אינה ניתנת לביטול.')) return;
  if (dupRecIds.length) {
    const e1 = (await sb.from(REC_TABLE()).delete().in('id', dupRecIds)).error;
    if (e1) { alert('שגיאה בניקוי הגדרות קבועות: ' + e1.message); return; }
  }
  if (dupIds.length) {
    const e2 = (await sb.from(TX_TABLE()).delete().in('id', dupIds)).error;
    if (e2) { alert('שגיאה: ' + e2.message); return; }
  }
  await loadAll();
  alert('✅ נוקו כפילויות: ' + parts.join(' + ') + '.');
}


async function deleteSelectedTx() {
  const ids = Array.from(document.querySelectorAll('.tx-check:checked')).map(c => c.value);
  if (!ids.length) return;
  if (!confirm('\u05dc\u05de\u05d7\u05d5\u05e7 ' + ids.length + ' \u05e8\u05e9\u05d5\u05de\u05d5\u05ea?')) return;
  await sb.from(TX_TABLE()).delete().in('id', ids);
  await loadAll();
}

// ── EMPLOYEES ──
async function addEmployee() {
  const name = $('e-name').value.trim(); if (!name) return;
  $('btn-add-emp').disabled = true;
  await sb.from('employees').insert({ user_id: currentUser.id, name, role: $('e-role').value.trim(), phone: $('e-phone').value.trim() });
  $('e-name').value = ''; $('e-role').value = ''; $('e-phone').value = ''; $('btn-add-emp').disabled = false;
  await loadAll();
}
async function deleteEmp(id) {
  if (!confirm('\u05dc\u05de\u05d7\u05d5\u05e7 \u05e2\u05d5\u05d1\u05d3?')) return;
  await sb.from('employee_events').delete().eq('employee_id', id);
  await sb.from('employees').delete().eq('id', id);
  await loadAll();
}
async function addEmpEvent(empId) {
  const name = $('ev-event-' + empId).value.trim(), date = $('ev-date-' + empId).value, amount = parseFloat($('ev-amount-' + empId).value);
  if (!name || !amount || amount <= 0) { alert('\u05e0\u05d0 \u05dc\u05de\u05dc\u05d0 \u05e9\u05dd \u05d0\u05d9\u05e8\u05d5\u05e2 \u05d5\u05e1\u05db\u05d5\u05dd'); return; }
  await sb.from('employee_events').insert({ user_id: currentUser.id, employee_id: empId, event_name: name, date: date || null, amount, month: getMonth(), status: '\u05de\u05de\u05ea\u05d9\u05df' });
  $('ev-event-' + empId).value = ''; $('ev-date-' + empId).value = ''; $('ev-amount-' + empId).value = '';
  await loadAll();
}
async function deleteEmpEvent(id) { if (!confirm('\u05dc\u05de\u05d7\u05d5\u05e7?')) return; await sb.from('employee_events').delete().eq('id', id); await loadAll(); }
async function updateEmpEventStatus(id, status) { await sb.from('employee_events').update({ status }).eq('id', id); await loadAll(); }
async function updateEventWorkerStatus(id, status) { await sb.from('event_workers').update({ status }).eq('id', id); await loadAll(); }

// Employee modal
function openEmpModal(empId) {
  currentEmpId = empId;
  const emp = cachedEmps.find(e => e.id === empId); if (!emp) return;
  $('emp-modal-name').value = emp.name || '';
  $('emp-modal-phone').value = emp.phone || '';
  $('emp-modal-email').value = emp.email || '';
  $('emp-modal-role').value = emp.role || '';
  $('emp-modal-notes').value = emp.notes || '';
  $('emp-modal').style.display = 'flex';
}
function closeEmpModal() { $('emp-modal').style.display = 'none'; currentEmpId = null; }
async function saveEmpDetails() {
  if (!currentEmpId) return;
  const name = $('emp-modal-name').value.trim(); if (!name) { alert('\u05e0\u05d0 \u05dc\u05d4\u05db\u05e0\u05d9\u05e1 \u05e9\u05dd'); return; }
  await sb.from('employees').update({ name, phone: $('emp-modal-phone').value.trim(), email: $('emp-modal-email').value.trim(), role: $('emp-modal-role').value, notes: $('emp-modal-notes').value }).eq('id', currentEmpId);
  closeEmpModal(); await loadAll();
}

// ── CLIENTS ──
async function addClient() {
  const name = $('c-name').value.trim(); if (!name) return;
  $('btn-add-client').disabled = true;
  await sb.from('clients').insert({ user_id: currentUser.id, name, phone: $('c-phone').value.trim(), email: $('c-email').value.trim(), business_id: $('c-bizid').value.trim() });
  $('c-name').value = ''; $('c-phone').value = ''; $('c-email').value = ''; $('c-bizid').value = '';
  $('btn-add-client').disabled = false; await loadAll();
}
async function deleteClient(id) { if (!confirm('\u05dc\u05de\u05d7\u05d5\u05e7 \u05dc\u05e7\u05d5\u05d7?')) return; await sb.from('clients').delete().eq('id', id); await loadAll(); }

// ── AUTO IMPORT RECURRING ──
let _importingMonths = new Set();
async function autoImportRecurring(month, uid, existingTx) {
  if (!cachedRecurring.length) return;
  // נעילה — מנע ייבוא כפול (מפתח כולל מצב כדי לא להתנגש בין עסק/בית)
  const lockKey = appMode + ':' + month;
  if (_importingMonths.has(lockKey)) return;
  _importingMonths.add(lockKey); // נעל מיד (אטומי — אין await לפני כן)
  try {
    // שלוף מצב עדכני מה-DB במקום להסתמך על נתונים שהועברו (מונע כפילות בטעינה כפולה)
    const freshR = await sb.from(TX_TABLE()).select('description').eq('user_id', uid).eq('month', month);
    const fresh = freshR.data || existingTx || [];
    const importedDescs = new Set(
      fresh.filter(t => t.description && t.description.includes('(קבועה)'))
        .map(t => t.description.replace(' (קבועה)', '').trim())
    );
    // רשימת קבועות ייחודית לפי תיאור (מונע כפילות גם אם ההגדרות עצמן כפולות)
    const uniqRec = [], seenDesc = new Set();
    cachedRecurring.forEach(r => { const d = (r.description || '').trim(); if (d && !seenDesc.has(d)) { seenDesc.add(d); uniqRec.push(r); } });
    // ייבא רק קבועות שעוד לא יובאו החודש
    const toImport = uniqRec.filter(r => !importedDescs.has((r.description || '').trim()));
    if (!toImport.length) return;
    await sb.from(TX_TABLE()).insert(
      toImport.map(r => ({
        user_id: uid,
        month,
        description: r.description + ' (קבועה)',
        amount: r.amount,
        type: 'expense',
        category: r.category,
        account_id: defaultAccountFor(appMode)
      }))
    );
    // טען מחדש את העסקאות
    const txR = await sb.from(TX_TABLE()).select('*').eq('user_id', uid).eq('month', month).order('created_at', { ascending: false });
    cachedTx = txR.data || [];
  } finally {
    _importingMonths.delete(lockKey);
  }
}

// ── משכורות קבועות (מצב בית) ──
// נשמרות כהגדרה בלבד ומוצגות כשורה וירטואלית בכל חודש,
// כמו המשכורת מהעסק. כך אין רשומות כפולות בטבלת העסקאות.
let cachedSalaries = [];

async function loadSalaries() {
  if (!currentUser) return;
  const res = await sb.from('home_salaries').select('*').eq('user_id', currentUser.id).order('sort_order').order('created_at');
  cachedSalaries = res.data || [];
  renderSalaries();
}

// סך המשכורות הפעילות — נכנס לכל חישובי ההכנסה במצב בית
function salariesTotal() {
  if (appMode !== 'home') return 0;
  return cachedSalaries.filter(s => s.active).reduce((sum, s) => sum + (s.amount || 0), 0);
}

async function addSalary() {
  const name = $('s-name').value.trim(), amount = parseFloat($('s-amount').value);
  if (!name || !amount || amount <= 0) { alert('נא למלא שם וסכום'); return; }
  $('btn-add-sal').disabled = true;
  await sb.from('home_salaries').insert({
    user_id: currentUser.id, person_name: name, amount,
    active: true, sort_order: cachedSalaries.length
  });
  $('s-name').value = ''; $('s-amount').value = '';
  $('btn-add-sal').disabled = false;
  await loadSalaries();
  renderHome();
}

async function deleteSalary(id) {
  const s = cachedSalaries.find(x => x.id === id);
  if (!confirm('למחוק את המשכורת של "' + (s ? s.person_name : '') + '"?\nאם היא רק הופסקה — עדיף לכבות אותה במקום למחוק.')) return;
  await sb.from('home_salaries').delete().eq('id', id);
  await loadSalaries();
  renderHome();
}

// כיבוי/הדלקה — משאיר את ההיסטוריה במקום למחוק
async function toggleSalaryActive(id, active) {
  await sb.from('home_salaries').update({ active }).eq('id', id);
  await loadSalaries();
  renderHome();
}

function editSalary(id) {
  const s = cachedSalaries.find(x => x.id === id);
  const row = $('sal-row-' + id);
  if (!s || !row) return;
  row.innerHTML =
    '<td><input id="sal-e-name-' + id + '" value="' + esc(s.person_name) + '" style="width:100%;padding:5px 7px;border:1px solid var(--border);border-radius:8px;font-size:13px"></td>' +
    '<td><input id="sal-e-amount-' + id + '" type="number" min="0" value="' + (s.amount || 0) + '" style="width:100px;padding:5px 7px;border:1px solid var(--border);border-radius:8px;font-size:13px"></td>' +
    '<td></td>' +
    '<td style="white-space:nowrap"><button class="btn-save-sm" onclick="saveSalary(\'' + id + '\')" title="שמור">&#10003;</button> <button class="btn-cancel-sm" onclick="renderSalaries()" title="בטל">&#10005;</button></td>';
  $('sal-e-name-' + id).focus();
}

async function saveSalary(id) {
  const name = $('sal-e-name-' + id).value.trim();
  const amount = parseFloat($('sal-e-amount-' + id).value);
  if (!name || isNaN(amount) || amount < 0) { alert('נא למלא שם וסכום תקין'); return; }
  await sb.from('home_salaries').update({ person_name: name, amount }).eq('id', id);
  await loadSalaries();
  renderHome();
}

function renderSalaries() {
  const tb = $('sal-table');
  const total = salariesTotal();
  const inline = $('sal-total-inline');
  if (inline) inline.textContent = cachedSalaries.length ? '· ' + fmt(total) + ' / חודש' : '';
  const totalEl = $('sal-total');
  if (totalEl) totalEl.textContent = 'סה"כ: ' + fmt(total) + ' / חודש';
  if (!tb) return;
  if (!cachedSalaries.length) {
    tb.innerHTML = '<tr><td colspan="4" class="empty">עדיין לא נוספו משכורות</td></tr>';
    return;
  }
  tb.innerHTML = cachedSalaries.map(s =>
    '<tr id="sal-row-' + s.id + '"' + (s.active ? '' : ' style="opacity:.5"') + '>' +
      '<td style="font-weight:500">' + esc(s.person_name) + '</td>' +
      '<td style="font-weight:600;color:var(--green)">' + fmt(s.amount || 0) + '</td>' +
      '<td><input type="checkbox" ' + (s.active ? 'checked' : '') + ' onchange="toggleSalaryActive(\'' + s.id + '\',this.checked)" style="width:16px;height:16px;cursor:pointer" title="פעיל"></td>' +
      '<td style="white-space:nowrap"><button class="btn-edit-sm" onclick="editSalary(\'' + s.id + '\')" title="ערוך">&#9998;</button> <button class="btn-del" onclick="deleteSalary(\'' + s.id + '\')" title="מחק">&#128465;</button></td>' +
    '</tr>'
  ).join('');
}

function toggleSalaryPanel() {
  const wrap = $('sal-panel-wrap'), chev = $('sal-chevron');
  if (!wrap) return;
  const open = wrap.style.display === 'none';
  wrap.style.display = open ? 'block' : 'none';
  if (chev) chev.style.transform = open ? 'rotate(180deg)' : '';
  localStorage.setItem('cf_sal_open', open ? '1' : '0');
  if (open) renderSalaries();
}

// ── RECURRING ──
async function loadRecurring() {
  const res = await sb.from(REC_TABLE()).select('*').eq('user_id', currentUser.id).order('created_at');
  cachedRecurring = res.data || [];
  renderRecurring();
  updateTax();
}
function renderRecurring() {
  const tb = $('rec-table'), totalEl = $('rec-total');
  const total = cachedRecurring.reduce((s, r) => s + r.amount, 0);
  // סכום מוצג בכותרת גם כשהפאנל סגור
  const inline = $('rec-total-inline');
  if (inline) inline.textContent = cachedRecurring.length ? '· ' + fmt(total) + ' / חודש' : '';
  if (!tb) return;
  if (totalEl) totalEl.textContent = '\u05e1\u05d4"\u05db: ' + fmt(total) + ' / \u05d7\u05d5\u05d3\u05e9';
  if (!cachedRecurring.length) { tb.innerHTML = '<tr><td colspan="4" class="empty">\u05d0\u05d9\u05df \u05d4\u05d5\u05e6\u05d0\u05d5\u05ea \u05e7\u05d1\u05d5\u05e2\u05d5\u05ea</td></tr>'; return; }
  tb.innerHTML = cachedRecurring.map(r => '<tr id="rec-row-' + r.id + '"><td style="font-weight:500">' + esc(r.description) + '</td><td style="font-size:12px;color:var(--muted)">' + esc(r.category) + '</td><td style="font-weight:600;color:var(--red)">' + fmt(r.amount) + '</td><td style="white-space:nowrap"><button class="btn-edit-sm" onclick="editRecurring(\'' + r.id + '\')" title="ערוך">&#9998;</button> <button class="btn-del" onclick="deleteRecurring(\'' + r.id + '\')" title="מחק">&#128465;</button></td></tr>').join('');
}
// מעבר למצב עריכה — הופך את השורה לשדות ניתנים לעריכה
const REC_CATEGORIES = ['שכירות', 'ביטוח', 'תוכנות', 'טלפון', 'רכב', 'שיווק', 'אחר'];
function editRecurring(id) {
  const r = cachedRecurring.find(x => x.id === id);
  const row = $('rec-row-' + id);
  if (!r || !row) return;
  const catOpts = REC_CATEGORIES.map(c => '<option value="' + c + '"' + (r.category === c ? ' selected' : '') + '>' + c + '</option>').join('');
  row.innerHTML =
    '<td><input id="rec-e-desc-' + id + '" value="' + esc(r.description) + '" style="width:100%;padding:5px 7px;border:1px solid var(--border);border-radius:8px;font-size:13px"></td>' +
    '<td><select id="rec-e-cat-' + id + '" style="width:100%;padding:5px 7px;border:1px solid var(--border);border-radius:8px;font-size:13px">' + catOpts + '</select></td>' +
    '<td><input id="rec-e-amount-' + id + '" type="number" min="0" value="' + r.amount + '" style="width:90px;padding:5px 7px;border:1px solid var(--border);border-radius:8px;font-size:13px"></td>' +
    '<td style="white-space:nowrap"><button class="btn-save-sm" onclick="saveRecurring(\'' + id + '\')" title="שמור">&#10003;</button> <button class="btn-cancel-sm" onclick="renderRecurring()" title="בטל">&#10005;</button></td>';
  $('rec-e-desc-' + id).focus();
}
async function saveRecurring(id) {
  const desc = $('rec-e-desc-' + id).value.trim();
  const category = $('rec-e-cat-' + id).value;
  const amount = parseFloat($('rec-e-amount-' + id).value);
  if (!desc || !amount || amount <= 0) { alert('נא למלא תיאור וסכום תקין'); return; }
  const old = cachedRecurring.find(x => x.id === id);
  // עדכן את ההגדרה הקבועה
  await sb.from(REC_TABLE()).update({ description: desc, category, amount }).eq('id', id);
  // עדכן גם את ההוצאה שכבר יובאה לחודש הנוכחי (אם קיימת) לפי התיאור הישן
  if (old) {
    const oldImported = (old.description || '') + ' (קבועה)';
    const newImported = desc + ' (קבועה)';
    await sb.from(TX_TABLE())
      .update({ description: newImported, category, amount })
      .eq('user_id', currentUser.id)
      .eq('month', getMonth())
      .eq('description', oldImported);
  }
  await loadRecurring();
  await loadAll();
}
async function addRecurring() {
  const desc = $('r-desc').value.trim(), amount = parseFloat($('r-amount').value), category = $('r-cat').value;
  if (!desc || !amount || amount <= 0) return;
  $('btn-add-rec').disabled = true;
  await sb.from(REC_TABLE()).insert({ user_id: currentUser.id, description: desc, amount, category });
  $('r-desc').value = ''; $('r-amount').value = '';
  $('btn-add-rec').disabled = false;
  await loadRecurring();
  await loadAll(); // ייבא את הקבועה החדשה לעסקאות ורענן את הדשבורד
}
async function deleteRecurring(id) {
  if (!confirm('\u05dc\u05de\u05d7\u05d5\u05e7?')) return;
  await sb.from(REC_TABLE()).delete().eq('id', id);
  await loadRecurring();
}
// ── PROFIT FIRST ──
let pfSettings = {
  accounts: [
    { name: '\u05d4\u05d5\u05e6\u05d0\u05d5\u05ea \u05ea\u05e4\u05e2\u05d5\u05dc\u05d9\u05d5\u05ea', icon: '\u2699\ufe0f', pct: 22, color: 'var(--blue)' },
    { name: '\u05e9\u05db\u05e8 \u05d4\u05e0\u05d4\u05dc\u05d4', icon: '\uD83D\uDC64', pct: 50, color: 'var(--green)' },
    { name: '\u05de\u05d9\u05e1\u05d9\u05dd', icon: '\uD83E\uDDFE', pct: 18, color: 'var(--red)' },
    { name: '\u05e8\u05d5\u05d5\u05d7', icon: '\uD83C\uDFC6', pct: 10, color: 'var(--amber)' }
  ],
  lastAllocation: null
};

function loadPFSettings() {
  try { const s = localStorage.getItem('pf_settings'); if (s) pfSettings = JSON.parse(s); } catch (e) {}
  renderPFAccounts(); renderPFSliders();
}
function savePFSettings() { localStorage.setItem('pf_settings', JSON.stringify(pfSettings)); renderPFAccounts(); togglePFEdit(); calcPF(); }
function calcPF() {
  const incomeEl = $('pf-income-display');
  const income = incomeEl ? parseFloat(incomeEl.textContent.replace(/[^0-9.]/g, '')) || 0 : 0;
  document.querySelectorAll('.pf-amount').forEach((el, i) => {
    if (pfSettings.accounts[i]) { el.textContent = fmt(income * pfSettings.accounts[i].pct / 100); el.style.color = pfSettings.accounts[i].color; }
  });
}
function renderPFAccounts() {
  const el = $('pf-accounts'); if (!el) return;
  el.innerHTML = pfSettings.accounts.map((acc, i) => '<div class="pf-account-row"><div><div class="pf-account-name">' + acc.icon + ' ' + esc(acc.name) + '</div><div class="pf-account-pct">' + acc.pct + '%</div></div><div class="pf-amount" style="font-size:20px;font-weight:700;color:' + acc.color + '">' + fmt(0) + '</div></div>').join('');
}
function renderPFSliders() {
  const el = $('pf-sliders'); if (!el) return;
  el.innerHTML = pfSettings.accounts.map((acc, i) => '<div class="pf-slider-row"><label><span>' + acc.icon + ' ' + esc(acc.name) + '</span><span id="pf-pct-' + i + '" style="font-weight:600">' + acc.pct + '%</span></label><input type="range" min="0" max="100" value="' + acc.pct + '" oninput="updatePFSlider(' + i + ',this.value)" /></div>').join('');
  updatePFTotal();
}
function updatePFSlider(i, val) { pfSettings.accounts[i].pct = parseInt(val); $('pf-pct-' + i).textContent = val + '%'; updatePFTotal(); }
function updatePFTotal() { const total = pfSettings.accounts.reduce((s, a) => s + a.pct, 0); const el = $('pf-total-pct'); if (el) { el.textContent = total + '%'; el.style.color = total === 100 ? 'var(--green)' : 'var(--red)'; } }
function togglePFEdit() { const el = $('pf-edit'), btn = $('pf-edit-btn'); if (!el) return; const isOpen = el.style.display !== 'none'; el.style.display = isOpen ? 'none' : 'block'; btn.textContent = isOpen ? '\u270f\ufe0f \u05e2\u05e8\u05d5\u05da \u05d0\u05d7\u05d5\u05d6\u05d9\u05dd' : '\u2715 \u05e1\u05d2\u05d5\u05e8'; if (!isOpen) renderPFSliders(); }

// ── יועץ AI ──
let advHistory = [];
let advStarted = false;

// בונה תמונת מצב מזוקקת מהנתונים שכבר ב-cache (בלי לשלוף מחדש)
function buildAdvisorContext() {
  const month = getMonth();
  if (appMode === 'home') {
    const income = cachedTx.filter(t => t.type === 'income');
    const expense = cachedTx.filter(t => t.type === 'expense');
    let bizSalary = 0;
    try { bizSalary = (JSON.parse(localStorage.getItem('cf_biz_salary') || '{}'))[month] || 0; } catch (e) {}
    const salaries = cachedSalaries.filter(s => s.active).map(s => ({ שם: s.person_name, נטו: s.amount || 0 }));
    const cats = {};
    expense.forEach(t => { cats[t.category || 'אחר'] = (cats[t.category || 'אחר'] || 0) + t.amount; });
    const recTotal = cachedRecurring.reduce((s, r) => s + r.amount, 0);
    const totalIncome = income.reduce((s, t) => s + t.amount, 0) + bizSalary + salaries.reduce((s, x) => s + x.נטו, 0);
    const totalExpense = expense.reduce((s, t) => s + t.amount, 0);
    return {
      מצב: 'בית', חודש: month,
      הכנסות: { משכורות: salaries, משכורת_מהעסק: bizSalary, אחר: income.map(t => ({ תיאור: t.description, סכום: t.amount })), סהכ: totalIncome },
      הוצאות: { לפי_קטגוריה: cats, קבועות_חודשי: recTotal, סהכ: totalExpense },
      נשאר_החודש: totalIncome - totalExpense,
      יעדי_חיסכון: cachedGoals.map(g => ({ שם: g.name, יעד: g.target_amount || 0, נחסך: g.saved_amount || 0, תאריך_יעד: g.deadline || null })),
      חיסכון_ילדים: cachedChildren.map(c => ({ שם: c.child_name, שווי_נוכחי: c.current_value || 0, הפקדה_חודשית: c.monthly_deposit || 0, גיל_יעד: c.target_age }))
    };
  }
  // מצב עסק
  const d = profitBreakdownData || {};
  const cats = {};
  cachedTx.filter(t => t.type === 'expense').forEach(t => { cats[t.category || 'אחר'] = (cats[t.category || 'אחר'] || 0) + t.amount; });
  const debtors = cachedClients.map(c => {
    const evs = cachedEventDetails.filter(x => x.client_id === c.id);
    const total = evs.reduce((s, x) => s + (x.price || 0), 0);
    const paid = evs.filter(x => x.status === 'בוצע תשלום' || x.status === 'בוצע תשלום + חשבונית מס').reduce((s, x) => s + (x.price || 0), 0);
    return { לקוח: c.name, חוב: total - paid };
  }).filter(x => x.חוב > 0);
  return {
    מצב: 'עסק', חודש: month,
    הכנסות: { נכנס_מלקוחות: d.income || 0, צפוי_מלקוחות: d.pendingIncome || 0 },
    הוצאות: { לפי_קטגוריה: cats, קבועות_חודשי: cachedRecurring.reduce((s, r) => s + r.amount, 0) },
    צפי_רווח: d.pendingNet || 0,
    לקוחות_בחוב: debtors
  };
}

function advSystemPrompt() {
  const ctx = buildAdvisorContext();
  const modeWord = appMode === 'home' ? 'משפחות ישראליות' : 'עצמאים ובעלי עסקים קטנים';
  return 'אתה יועץ פיננסי אישי בתוך אפליקציית CashflowHQ, ואתה עוזר ל' + modeWord + ' לקבל החלטות כספיות טובות יותר.\n\n' +
    'הנתונים האמיתיים (כל הסכומים בשקלים):\n' + JSON.stringify(ctx, null, 2) + '\n\n' +
    'כללי התנהגות מחייבים:\n' +
    '- ענה בעברית, בגוף שני, בחום ובאופן ישיר וקצר. אתה מדבר עם אדם עסוק, לא כותב דוח.\n' +
    '- הסתמך אך ורק על הנתונים שלמעלה. אל תמציא מספרים. אם חסר מידע — אמור זאת וציין מה היית צריך.\n' +
    '- תן פרספקטיבה ואפשרויות, לא הבטחות. אל תבטיח תשואות או תוצאות.\n' +
    '- גבה כל טענה במספר קונקרטי מהנתונים.\n' +
    '- בהחלטות מהותיות של מס, השקעות או משפט — ציין שכדאי להתייעץ עם איש מקצוע. אל תיתן ייעוץ מס ספציפי.\n' +
    '- אל תשפוט ואל תטיף. אתה בצד של המשתמש.\n' +
    '- שמור על תשובות קצרות: 2-4 משפטים לרוב.';
}

function advGrow(el) { el.style.height = 'auto'; el.style.height = Math.min(el.scrollHeight, 120) + 'px'; }

function advAddMsg(text, who) {
  const chat = $('adv-chat');
  const d = document.createElement('div');
  d.className = 'msg ' + who;
  d.textContent = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}
function advTyping(on) {
  const chat = $('adv-chat');
  if (on) {
    const t = document.createElement('div');
    t.className = 'typing'; t.id = 'adv-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    chat.appendChild(t); chat.scrollTop = chat.scrollHeight;
  } else { const t = $('adv-typing'); if (t) t.remove(); }
}

// מרנדר את פאנל "מה שאני רואה" + הודעת פתיחה
function renderAdvisor() {
  const ctx = buildAdvisorContext();
  const monthName = (() => { const [y, m] = getMonth().split('-'); return MON(Number(m) - 1) + ' ' + y; })();
  $('adv-seen-month').textContent = 'מה שאני רואה החודש (' + monthName + ')';

  const grid = $('adv-seen-grid');
  if (appMode === 'home') {
    const inc = ctx.הכנסות.סהכ, exp = ctx.הוצאות.סהכ, left = ctx.נשאר_החודש, fixed = ctx.הוצאות.קבועות_חודשי;
    grid.innerHTML =
      cell(fmt(inc), 'נכנס', 'pos') + cell(fmt(exp), 'יצא', 'neg') +
      cell(fmt(left), 'נשאר', left >= 0 ? 'pos' : 'neg') + cell(fmt(fixed), 'קבועות', '');
    const salCount = ctx.הכנסות.משכורות.length + (ctx.הכנסות.משכורת_מהעסק > 0 ? 1 : 0);
    const catCount = Object.keys(ctx.הוצאות.לפי_קטגוריה).length;
    $('adv-mode-note').innerHTML = '📍 מצב <strong>בית</strong> · ' + salCount + ' משכורות · ' +
      ctx.יעדי_חיסכון.length + ' יעדי חיסכון · הוצאות ב-' + catCount + ' קטגוריות';
  } else {
    grid.innerHTML =
      cell(fmt(ctx.הכנסות.נכנס_מלקוחות), 'נכנס', 'pos') +
      cell(fmt(ctx.הכנסות.צפוי_מלקוחות), 'צפוי', '') +
      cell(fmt(ctx.צפי_רווח), 'צפי רווח', ctx.צפי_רווח >= 0 ? 'pos' : 'neg') +
      cell(fmt(ctx.הוצאות.קבועות_חודשי), 'קבועות', '');
    $('adv-mode-note').innerHTML = '📍 מצב <strong>עסק</strong> · ' +
      ctx.לקוחות_בחוב.length + ' לקוחות בחוב · ' + Object.keys(ctx.הוצאות.לפי_קטגוריה).length + ' קטגוריות הוצאה';
  }

  // הודעת פתיחה + צ'יפים — פעם אחת
  if (!advStarted) {
    const chat = $('adv-chat');
    chat.innerHTML = '';
    advAddMsg('שלום! אני רואה את כל המספרים של ' + (appMode === 'home' ? 'הבית' : 'העסק') +
      ' שלכם. שאלו אותי כל דבר, ואעזור לכם להחליט על סמך המצב האמיתי.\n\nמה בא לכם לבדוק?', 'ai');
    const starters = appMode === 'home'
      ? ['כמה אני יכול להוציא החודש?', 'איפה אני מבזבז יותר מדי?', 'אני בקצב לעמוד ביעדים?', 'איך אחסוך עוד ₪1,000 בחודש?']
      : ['איך נראה צפי הרווח שלי?', 'אילו לקוחות חייבים לי כסף?', 'איפה אני מוציא הכי הרבה?', 'מה כדאי לשפר החודש?'];
    const box = document.createElement('div');
    box.className = 'starters';
    box.innerHTML = starters.map(s => '<button class="chip" onclick="advAsk(this.textContent)">' + esc(s) + '</button>').join('');
    chat.appendChild(box);
  }

  function cell(v, k, cls) { return '<div class="seen-cell ' + cls + '"><div class="v">' + v + '</div><div class="k">' + k + '</div></div>'; }
}

async function advAsk(preset) {
  const input = $('adv-input');
  const text = (preset || input.value).trim();
  if (!text) return;
  const starters = $('adv-chat').querySelector('.starters');
  if (starters) starters.remove();
  advStarted = true;
  input.value = ''; advGrow(input);
  $('adv-send').disabled = true;
  advAddMsg(text, 'user');
  advHistory.push({ role: 'user', content: text });
  advTyping(true);

  try {
    const res = await fetch(ADVISOR_FN_URL, {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ system: advSystemPrompt(), messages: advHistory })
    });
    const data = await res.json();
    advTyping(false);
    const reply = (data.content || []).map(b => b.type === 'text' ? b.text : '').join('').trim()
      || 'מצטער, לא קיבלתי תשובה. נסו שוב.';
    advAddMsg(reply, 'ai');
    advHistory.push({ role: 'assistant', content: reply });
  } catch (err) {
    advTyping(false);
    advAddMsg('משהו השתבש בחיבור ליועץ. נסו שוב עוד רגע.', 'ai');
  }
  $('adv-send').disabled = false;
  input.focus();
}

// ── NAV ──
function showPage(id, el) {
  // חסום עמודים שאינם זמינים במסלול הנוכחי
  if (pageAccess(id) === 'blocked') { showUpgradeModal(); return; }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab,.bnav-item').forEach(t => t.classList.remove('active'));
  const page = document.getElementById('page-' + id);
  if (page) page.classList.add('active');
  if (el) el.classList.add('active');
  document.querySelectorAll('[data-page="' + id + '"]').forEach(b => b.classList.add('active'));
  // גלול את הכפתור הפעיל לתצוגה בתפריט התחתון הנגלל (מובייל)
  const activeNav = document.querySelector('.bottom-nav .bnav-item[data-page="' + id + '"]');
  if (activeNav && activeNav.scrollIntoView) activeNav.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  // גלול את תוכן העמוד לראש בעת מעבר סקשן
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // renderRecurring מספיק — הנתונים כבר ב-cache מ-loadAll, אין צורך לטעון מחדש מה-DB
  if (id === 'transactions') { renderRecurring(); renderShifts(); }
  if (id === 'goals') { calcCompound(); renderHomeGoalsList(); renderChildren(); }
  if (id === 'equipment') renderEquipment();
  if (id === 'forecast') renderForecast();
  if (id === 'accounts') { renderAccounts(); loadSnapshots().then(renderReconcile); }
  if (id === 'advisor') renderAdvisor();
  applyReadOnly();
}

function toggleCard(empId) { const body = $('card-body-' + empId), icon = $('toggle-icon-' + empId); body.classList.toggle('open'); if (icon) icon.textContent = body.classList.contains('open') ? '\u25b2' : '\u25bc'; }
function toggleEl(id) { const el = $(id); if (el) el.classList.toggle('open'); }
function toggleDisplay(id) { const el = $(id); if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none'; }

// החל את השפה השמורה בטעינה (גם על מסך ההתחברות)
setLanguage(currentLang);
sb.auth.getSession().then(function(result) { if (result.data.session) enterApp(result.data.session.user); });
