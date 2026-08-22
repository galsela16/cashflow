/* CashflowHQ Pricing Calculator v1
 * Workbook source: "מחשבון הגברה חדש.xlsx".
 * Ambiguous workbook assumptions are intentionally exposed in settings.
 * No database writes: settings persist locally in this browser only.
 */
(function () {
  'use strict';

  const SETTINGS_KEY = 'cf_pricing_settings_v1';
  const defaults = Object.freeze({
    annualEvents: 100,
    annualOverhead: 8660,
    equipmentValue: 150000,
    equipmentReturnYears: 2,
    soundDayRate: 1200,
    lightDayRate: 1200,
    backlineHourlyRate: 50,
    backlineMultiplier: 1.2,
    backlineThreshold: 350,
    backlineMinimum: 400,
    costPerKm: 2,
    longTripThresholdKm: 260,
    longTripSurcharge: 140,
    foodPerPerson: 80,
    foodRule: 'always',
    markupRate: 45,
    annualInterestRate: 7.5,
    vatRate: 18,
    applyActionsToLighting: false,
    stageMinimum: 1500,
    stageDelivery: 1800
  });

  const addonDefaults = [
    ['projector23', 'מקרן ומסך 2×3 מטר', 1200],
    ['projector34', 'מקרן ומסך 3×4 מטר', 1500],
    ['projector22', 'מקרן ומסך 2×2 מטר', 800],
    ['closedCircuit', 'מעגל סגור', 1500],
    ['ledScreen', 'מסך LED (יחידה / מ״ר)', 500],
    ['plasma', 'מסך פלזמה', 600],
    ['recording', 'הקלטה', 400],
    ['inear', 'מדונות / In-Ear', 180],
    ['bassAmp', 'מגבר בס', 100],
    ['guitarAmp', 'מגבר גיטרה', 100],
    ['drums', 'מערכת תופים', 500],
    ['dj', 'עמדת DJ', 150],
    ['stage', 'במה (מ״ר)', 150],
    ['backdrop', 'גב במה (מ״ר)', 120],
    ['barriers', 'מחסומים', 35],
    ['chairs', 'כיסאות', 5],
    ['smallGenerator', 'גנרטור קטן', 600],
    ['largeGenerator', 'גנרטור גדול', 4500],
    ['engineer', 'מהנדס', 1500],
    ['specialDelivery', 'הובלה מיוחדת', 1800]
  ];

  const settingFields = [
    ['annualEvents', 'אירועים בשנה', 'number', 1],
    ['annualOverhead', 'תקורה שנתית', 'number', 0],
    ['equipmentValue', 'שווי ציוד', 'number', 0],
    ['equipmentReturnYears', 'שנות החזר ציוד', 'number', 0.1],
    ['soundDayRate', 'יומית סאונדמן', 'number', 0],
    ['lightDayRate', 'יומית תאורן', 'number', 0],
    ['backlineHourlyRate', 'שעת בקליינר', 'number', 0],
    ['backlineMultiplier', 'מקדם בקליינר', 'number', 0.1],
    ['backlineThreshold', 'סף מינימום בקליינר', 'number', 0],
    ['backlineMinimum', 'חיוב מינימום בקליינר', 'number', 0],
    ['costPerKm', 'עלות לק״מ', 'number', 0.1],
    ['longTripThresholdKm', 'סף נסיעה ארוכה (ק״מ)', 'number', 0],
    ['longTripSurcharge', 'תוספת נסיעה ארוכה', 'number', 0],
    ['foodPerPerson', 'אוכל לאיש צוות', 'number', 0],
    ['markupRate', 'תוספת רווח גולמי (%)', 'number', 0.1],
    ['annualInterestRate', 'ריבית שנתית לשוטף (%)', 'number', 0.1],
    ['vatRate', 'מע״מ (%)', 'number', 0.1],
    ['stageMinimum', 'מינימום במה / גב במה', 'number', 0],
    ['stageDelivery', 'הובלה לבמה / גב במה', 'number', 0]
  ];

  let initialized = false;
  let settings = loadSettings();
  const byId = (id) => document.getElementById(id);
  const num = (id) => Math.max(0, Number(byId(id)?.value) || 0);
  const money = (value) => new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(Number(value) || 0);
  const pct = (value) => (Number(value) || 0).toLocaleString('he-IL', { maximumFractionDigits: 1 }) + '%';

  function loadSettings() {
    try { return Object.assign({}, defaults, JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}')); }
    catch (_) { return Object.assign({}, defaults); }
  }

  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (_) {}
  }

  function timeHours(start, end) {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    let minutes = (eh * 60 + em) - (sh * 60 + sm);
    if (minutes < 0) minutes += 24 * 60;
    return minutes / 60;
  }

  function renderAddons() {
    const root = byId('pc-addons');
    if (!root) return;
    root.innerHTML = addonDefaults.map(([id, label, price]) =>
      '<label class="pricing-addon"><span><b>' + label + '</b><small>' + money(price) + ' ליחידה</small></span>' +
      '<input id="pc-addon-' + id + '" data-addon-id="' + id + '" data-price="' + price + '" type="number" min="0" step="1" value="0" aria-label="כמות ' + label + '"></label>'
    ).join('');
  }

  function renderSettings() {
    const root = byId('pc-settings-grid');
    if (!root) return;
    root.innerHTML = settingFields.map(([key, label, type, step]) =>
      '<label>' + label + '<input id="pc-setting-' + key + '" data-pricing-setting="' + key + '" type="' + type + '" min="0" step="' + step + '" value="' + settings[key] + '"></label>'
    ).join('') +
      '<label>כלל אוכל<select id="pc-setting-foodRule" data-pricing-setting="foodRule"><option value="always">כן — בכל אירוע</option><option value="multiAction">רק מעל פעולה אחת</option><option value="never">לא</option></select></label>' +
      '<label class="pricing-check"><input id="pc-setting-applyActionsToLighting" data-pricing-setting="applyActionsToLighting" type="checkbox"><span>הכפל גם תאורן במספר פעולות</span></label>';
    byId('pc-setting-foodRule').value = settings.foodRule;
    byId('pc-setting-applyActionsToLighting').checked = !!settings.applyActionsToLighting;
  }

  function readSettings() {
    document.querySelectorAll('[data-pricing-setting]').forEach((el) => {
      const key = el.dataset.pricingSetting;
      settings[key] = el.type === 'checkbox' ? el.checked : (el.type === 'number' ? Math.max(0, Number(el.value) || 0) : el.value);
    });
    saveSettings();
  }

  function addonCost() {
    let total = 0;
    const lines = [];
    document.querySelectorAll('[data-addon-id]').forEach((input) => {
      const qty = Math.max(0, Number(input.value) || 0);
      if (!qty) return;
      const def = addonDefaults.find((item) => item[0] === input.dataset.addonId);
      let cost = qty * Number(input.dataset.price);
      // Workbook rows 28-29 apply a ₪1,500 threshold and add delivery below it.
      if ((def[0] === 'stage' || def[0] === 'backdrop') && cost > 0 && cost <= settings.stageMinimum) cost += settings.stageDelivery;
      total += cost;
      lines.push([def[1] + ' × ' + qty, cost]);
    });
    const custom = num('pc-custom-addon');
    if (custom) {
      total += custom;
      lines.push([byId('pc-custom-addon-name').value.trim() || 'תוספת חופשית', custom]);
    }
    return { total, lines };
  }

  function calculate() {
    if (!initialized) return;
    readSettings();
    const hours = timeHours(byId('pc-start').value, byId('pc-end').value);
    const actions = Math.max(1, num('pc-actions'));
    const eventCount = Math.max(1, num('pc-events'));
    const soundCount = num('pc-sound');
    const lightCount = num('pc-light');
    const backlineCount = num('pc-backline');
    const sound = soundCount * settings.soundDayRate * actions;
    const light = lightCount * settings.lightDayRate * (settings.applyActionsToLighting ? actions : 1);
    const rawBacklineUnit = hours * settings.backlineHourlyRate * settings.backlineMultiplier;
    const backlineUnit = rawBacklineUnit < settings.backlineThreshold ? settings.backlineMinimum : rawBacklineUnit;
    const backline = backlineCount * backlineUnit;
    const annualEvents = Math.max(1, settings.annualEvents);
    const returnYears = Math.max(0.1, settings.equipmentReturnYears);
    const overhead = settings.annualOverhead / annualEvents + settings.equipmentValue / (returnYears * annualEvents);
    const roundTripKm = num('pc-distance-oneway') * 2;
    const travel = roundTripKm * settings.costPerKm + (roundTripKm > settings.longTripThresholdKm ? settings.longTripSurcharge : 0);
    const crewCount = soundCount + lightCount + backlineCount;
    const foodAllowed = settings.foodRule === 'always' || (settings.foodRule === 'multiAction' && actions > 1);
    const food = byId('pc-food-enabled').checked && foodAllowed ? crewCount * settings.foodPerPerson : 0;
    const eventCost = sound + light + backline + overhead + travel + food;
    const baseMarkup = eventCost * settings.markupRate / 100;
    const basePrice = eventCost + baseMarkup;
    const addons = addonCost();
    const recommendedBeforeTerms = (basePrice + addons.total) * eventCount;
    const paymentDays = num('pc-payment-days');
    const dailyInterest = (settings.annualInterestRate / 100) / 365;
    const interest = recommendedBeforeTerms * dailyInterest * paymentDays;
    const recommended = recommendedBeforeTerms + interest;
    const overrideRaw = byId('pc-override').value.trim();
    const hasOverride = overrideRaw !== '';
    const clientPrice = hasOverride ? Math.max(0, Number(overrideRaw) || 0) : recommended;
    const totalCost = eventCost * eventCount;
    const profit = clientPrice - totalCost;
    const margin = clientPrice > 0 ? profit / clientPrice * 100 : 0;
    const recommendedProfit = recommended - totalCost;
    const recommendedMargin = recommended > 0 ? recommendedProfit / recommended * 100 : 0;
    const vat = clientPrice * settings.vatRate / 100;

    byId('pc-duration').textContent = hours.toLocaleString('he-IL', { maximumFractionDigits: 2 }) + ' שעות';
    byId('pc-sound-cost').textContent = money(sound);
    byId('pc-light-cost').textContent = money(light);
    byId('pc-backline-cost').textContent = money(backline);
    byId('pc-sound-note').textContent = money(settings.soundDayRate) + ' × ' + actions + ' פעולות';
    byId('pc-light-note').textContent = money(settings.lightDayRate) + (settings.applyActionsToLighting ? ' × ' + actions + ' פעולות' : ' ליומית');
    byId('pc-backline-note').textContent = money(settings.backlineHourlyRate) + ' לשעה × ' + settings.backlineMultiplier + ' · מינימום ' + money(settings.backlineMinimum);
    byId('pc-travel-cost').textContent = money(travel);
    byId('pc-food-cost').textContent = money(food);
    byId('pc-overhead-cost').textContent = money(overhead);
    byId('pc-recommended').textContent = money(clientPrice);
    byId('pc-vat-line').textContent = (hasOverride ? 'מחיר ידני' : 'מחיר מומלץ') + ' · לפני מע״מ ' + settings.vatRate + '%';
    byId('pc-total-cost').textContent = money(totalCost);
    byId('pc-profit').textContent = money(profit);
    byId('pc-profit').className = profit < 0 ? 'is-negative' : '';
    byId('pc-margin').textContent = pct(margin);
    byId('pc-margin').className = margin < 0 ? 'is-negative' : '';
    byId('pc-interest').textContent = money(interest);
    byId('pc-with-vat').textContent = money(clientPrice + vat);

    const rows = [
      ['כוח אדם', sound + light + backline], ['תקורה והחזר ציוד', overhead], ['נסיעות', travel], ['אוכל', food],
      ['עלות לאירוע', eventCost], ['רווח גולמי ' + settings.markupRate + '%', baseMarkup], ['תוספות', addons.total]
    ];
    if (eventCount > 1) rows.push(['כמות אירועים', '× ' + eventCount]);
    if (interest) rows.push(['ריבית לשוטף +' + paymentDays, interest]);
    byId('pc-breakdown').innerHTML = rows.map(([label, value]) => '<div><span>' + label + '</span><b>' + (typeof value === 'number' ? money(value) : value) + '</b></div>').join('');

    const effect = byId('pc-override-effect');
    if (hasOverride) {
      const delta = clientPrice - recommended;
      effect.hidden = false;
      effect.className = 'pricing-override-effect ' + (delta < 0 ? 'is-discount' : 'is-premium');
      effect.textContent = (delta < 0 ? 'הנחה ' : 'תוספת ') + money(Math.abs(delta)) + ' · הרווחיות השתנתה מ־' + pct(recommendedMargin) + ' ל־' + pct(margin);
    } else effect.hidden = true;
  }

  window.pricingStep = function (id, delta) {
    const input = byId(id);
    if (!input) return;
    input.value = Math.max(0, (Number(input.value) || 0) + delta);
    calculate();
  };

  window.pricingToggleSettings = function () {
    const panel = byId('pc-settings');
    if (!panel) return;
    panel.hidden = !panel.hidden;
    if (!panel.hidden) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  window.pricingResetSettings = function () {
    settings = Object.assign({}, defaults);
    saveSettings();
    renderSettings();
    calculate();
  };

  window.initPricingCalculator = function () {
    if (initialized) { calculate(); return; }
    if (!byId('page-pricing')) return;
    renderAddons();
    renderSettings();
    byId('page-pricing').addEventListener('input', calculate);
    byId('page-pricing').addEventListener('change', calculate);
    initialized = true;
    calculate();
  };
})();
