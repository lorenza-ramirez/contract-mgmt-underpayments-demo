import React, { useState, useMemo, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, CartesianGrid } from "recharts";
import { Upload, FileText, ChevronRight, ChevronDown, Check, CheckCircle2, AlertTriangle, X, Search, Sparkles, Send, Clock, Link2, Loader2, Info, Receipt, BarChart3, Circle, PanelLeft, Bell, Mic, BookOpen, Settings, HelpCircle, Download, Plus, ThumbsUp, ThumbsDown, ZoomIn, ZoomOut, ArrowUp, ArrowRight, SkipForward, ListChecks, SlidersHorizontal, ListFilter, ChevronUp, ChevronLeft } from "lucide-react";

/* ============================================================
   ATI DEMO, Mock B: Contract management and underpayment engine
   All data is fictional. Payers, patients and amounts are synthetic.
   ============================================================ */

const CONTRACT_TEXT = "PROVIDER PARTICIPATION AGREEMENT\n\nCascadia Mutual Health (\"Payer\") and Ridgeline Physical Therapy Group (\"Provider\")\n\nEffective Date: January 1, 2025\nTerm: through December 31, 2027\n\n1. PARTIES AND FACILITIES\n1.1 This Agreement covers outpatient physical therapy services rendered at Provider facilities in Hartford CT, Stamford CT, Springfield MA, and Worcester MA.\n1.2 Payer entities covered by this Agreement are Cascadia Commercial and Cascadia Medicare Advantage.\n\n4. COMPENSATION\n4.1 Choice PPO (Cascadia Commercial). Provider shall be paid 78% of the Cascadia Outpatient Therapy Fee Schedule (Exhibit B) per unit of service, at all Provider facilities in CT and MA.\n4.2 Select HMO (Cascadia Commercial). Provider shall be paid a flat rate of $64.00 per visit, regardless of units billed, up to four units per visit. This rate applies at Provider facilities in CT only.\n4.3 Annual Escalator. On January 1 of each year beginning January 1, 2026, the rates in Sections 4.1 and 4.2 shall increase by 2.5%.\n4.4 Senior Plus (Cascadia Medicare Advantage). Provider shall be paid 95% of the current Medicare Physician Fee Schedule (Exhibit C) per unit of service, at all Provider facilities in CT and MA. Section 4.3 does not apply to Senior Plus.\n\n5. LICENSE AND STATE REQUIREMENTS\n5.1 Services furnished by a physical therapist assistant (PTA) and billed with modifier CQ shall be paid at 85% of the applicable rate.\n5.2 In Massachusetts, every claim line must identify the supervising licensed physical therapist as rendering provider. Lines without this identifier are not payable.\n\n6. UTILIZATION\n6.1 Select HMO members are covered for 30 visits per plan year. Authorization is required beginning with visit 13.\n\n9. DISPUTES\n9.1 Provider may dispute any payment that differs from the rates in this Agreement.\n9.2 Payment disputes must be submitted in writing within 180 days of the remittance date.\n\nEXHIBIT B. CASCADIA OUTPATIENT THERAPY FEE SCHEDULE (2025)\nCPT 97110 Therapeutic exercise, per 15 minutes: $42.00\nCPT 97140 Manual therapy, per 15 minutes: $39.50\nCPT 97530 Therapeutic activities, per 15 minutes: $48.00\nCPT 97112 Neuromuscular re-education, per 15 minutes: $46.00\nCPT 97161 Physical therapy evaluation, low complexity: $138.00\n\nEXHIBIT C. MEDICARE PHYSICIAN FEE SCHEDULE REFERENCE (national amounts)\nCPT 97110: $29.50\nCPT 97140: $27.80\nCPT 97530: $34.10\nCPT 97112: $33.40\nCPT 97161: $98.20";

/* ---------- helpers ---------- */
const TODAY = "2026-11-16";
const r2 = (n) => Math.round(n * 100) / 100;
const fmt = (n, d = 2) => (n < 0 ? "-" : "") + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fmtDate = (s) => (s ? new Date(s + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "");
const addDays = (s, n) => { const d = new Date(s + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
const daysBetween = (a, b) => Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 86400000);
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const num = (v) => (v === null || v === undefined || v === "" || isNaN(Number(v)) ? null : Number(v));
const rng32 = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };

/* ---------- reference data ---------- */
const CPT = { "97110": "Therapeutic exercise", "97140": "Manual therapy", "97530": "Therapeutic activities", "97112": "Neuromuscular re-education", "97161": "PT evaluation, low complexity" };
const CPT_LIST = Object.keys(CPT);
const CHARGE = { "97110": 85, "97140": 80, "97530": 95, "97112": 90, "97161": 210 };
const FS_CASCADIA = { "97110": 42, "97140": 39.5, "97530": 48, "97112": 46, "97161": 138 };
const FS_MEDICARE = { "97110": 29.5, "97140": 27.8, "97530": 34.1, "97112": 33.4, "97161": 98.2 };
const FS_MEDICAID = { "97110": 21.4, "97140": 20.1, "97530": 24.8, "97112": 24.1, "97161": 71 };
const METHOD = { percent_of_fee_schedule: "% of fee schedule", per_visit: "Per visit", per_unit: "Per unit" };

/* ---------- contract model ---------- */
const NUMBERS = { cascadia: "CTR-2025-0147", summit: "CTR-2024-0112", keystone: "CTR-2025-0063" };
function buildContract({ contract, plans, feeSchedules, terms }, extra = {}) {
  const c = { ...contract, ...extra };
  c.number = c.number || NUMBERS[c.id] || "CTR-" + String(c.effectiveStart || "2026").slice(0, 4) + "-0000";
  c.rows = plans.flatMap((p) => {
    const fs = (feeSchedules && feeSchedules[p.feeSchedule]) || {};
    const mk = (cpt) => ({
      id: `${c.id}-${slug(p.plan)}-${slug(cpt)}`, contractId: c.id, payer: p.payer, payerGroup: p.payerGroup, planType: p.planType, plan: p.plan, cpt,
      method: p.method, base: fs[cpt] != null ? Number(fs[cpt]) : null, discount: p.discountPct != null ? Number(p.discountPct) : null,
      flat: p.flatRate != null ? Number(p.flatRate) : null, facility: p.facilities || "All facilities", state: p.states || "",
      units: p.method === "per_visit" ? `Per visit, max ${p.maxUnits || 4} units` : "Per unit", apptType: cpt === "97161" ? "Evaluation only" : "All",
      start: c.effectiveStart, end: c.effectiveEnd, escalates: !!p.escalates, source: p.source || "",
    });
    return p.method === "per_visit" ? [mk("All PT codes")] : CPT_LIST.map(mk);
  });
  c.plans = plans;
  c.terms = (terms || []).map((t, i) => ({
    ...t, id: `${c.id}-t${i}`,
    ruleKey: /escalat|increas|\brise|\braise|annual|1\.0\d\d/i.test((t.summary || "") + " " + (t.then || "")) ? "escalator" : /\bPTA\b|\bCQ\b|assistant/i.test((t.summary || "") + " " + (t.then || "")) ? "pta" : null,
  }));
  return c;
}

const CASCADIA_RAW = {
  contract: { id: "cascadia", masterPayer: "Cascadia Mutual Health", provider: "Ridgeline Physical Therapy Group", effectiveStart: "2025-01-01", effectiveEnd: "2027-12-31", escalatorPct: 2.5, escalatorStart: "2026-01-01", ptaPct: 85, disputeDays: 180 },
  plans: [
    { payer: "Cascadia Commercial", payerGroup: "Commercial", planType: "PPO", plan: "Choice PPO", method: "percent_of_fee_schedule", discountPct: 78, feeSchedule: "B", facilities: "All facilities", states: "CT, MA", escalates: true, source: "78% of the Cascadia Outpatient Therapy Fee Schedule" },
    { payer: "Cascadia Commercial", payerGroup: "Commercial", planType: "HMO", plan: "Select HMO", method: "per_visit", flatRate: 64, maxUnits: 4, facilities: "Hartford, Stamford", states: "CT", escalates: true, source: "flat rate of $64.00 per visit" },
    { payer: "Cascadia Medicare Advantage", payerGroup: "Medicare", planType: "Medicare Advantage", plan: "Senior Plus", method: "percent_of_fee_schedule", discountPct: 95, feeSchedule: "C", facilities: "All facilities", states: "CT, MA", escalates: false, source: "95% of the current Medicare Physician Fee Schedule" },
  ],
  feeSchedules: { B: FS_CASCADIA, C: FS_MEDICARE },
};
const CASCADIA_TERMS = [
  { section: "4.3", category: "Rate", summary: "Choice PPO and Select HMO rates rise 2.5% each January 1, starting 2026.", when: "Plan is Choice PPO or Select HMO and service date is on or after 1/1/2026", then: "Multiply the contracted rate by 1.025", source: "On January 1 of each year beginning January 1, 2026" },
  { section: "5.1", category: "License", summary: "Services by a PTA billed with modifier CQ are paid at 85% of the rate.", when: "Claim line has modifier CQ", then: "Pay 85% of the contracted rate", source: "billed with modifier CQ" },
  { section: "5.2", category: "State", summary: "Massachusetts lines must name the supervising licensed PT as rendering provider.", when: "Facility state is MA", then: "Hold the claim if any line is missing the supervising PT", source: "supervising licensed physical therapist" },
  { section: "6.1", category: "Authorization", summary: "Select HMO covers 30 visits per plan year, with authorization from visit 13.", when: "Select HMO visit number is 13 or higher", then: "Require authorization before the visit is scheduled", source: "Authorization is required beginning with visit 13" },
  { section: "9.2", category: "Appeals", summary: "Payment disputes must be filed within 180 days of the remittance date.", when: "An underpayment is found on a Cascadia remittance", then: "Set the appeal deadline to remittance date plus 180 days", source: "within 180 days of the remittance date" },
];
const CASCADIA_CANON = buildContract({ ...CASCADIA_RAW, terms: CASCADIA_TERMS }, { file: "Cascadia_Participation_Agreement_2025.pdf", uploaded: "Today" });

const SUMMIT = buildContract({
  contract: { id: "summit", masterPayer: "Summit Care Alliance", provider: "Ridgeline Physical Therapy Group", effectiveStart: "2024-07-01", effectiveEnd: "2027-06-30", escalatorPct: null, escalatorStart: null, ptaPct: 100, disputeDays: 150 },
  plans: [{ payer: "Summit Commercial", payerGroup: "Commercial", planType: "PPO", plan: "Summit PPO", method: "percent_of_fee_schedule", discountPct: 82, feeSchedule: "C", facilities: "All facilities", states: "CT, MA, RI", escalates: false, source: "" }],
  feeSchedules: { C: FS_MEDICARE },
  terms: [
    { section: "3.2", category: "License", summary: "Services by a PTA are paid at 100% of the contracted rate.", when: "Claim line has modifier CQ", then: "Pay 100% of the contracted rate", source: "" },
    { section: "8.1", category: "Appeals", summary: "Payment disputes must be filed within 150 days of the remittance date.", when: "An underpayment is found on a Summit remittance", then: "Set the appeal deadline to remittance date plus 150 days", source: "" },
  ],
}, { file: "Summit_Care_Agreement_2024.pdf", uploaded: "Mar 2026" });

const KEYSTONE = buildContract({
  contract: { id: "keystone", masterPayer: "Keystone Health Partners", provider: "Ridgeline Physical Therapy Group", effectiveStart: "2025-04-01", effectiveEnd: "2027-03-31", escalatorPct: null, escalatorStart: null, ptaPct: 100, disputeDays: 120 },
  plans: [{ payer: "Keystone Medicaid", payerGroup: "Medicaid", planType: "Medicaid managed care", plan: "Keystone Medicaid", method: "per_unit", feeSchedule: "M", facilities: "Hartford, Stamford", states: "CT", escalates: false, source: "" }],
  feeSchedules: { M: FS_MEDICAID },
  terms: [{ section: "7.4", category: "Appeals", summary: "Payment disputes must be filed within 120 days of the remittance date.", when: "An underpayment is found on a Keystone remittance", then: "Set the appeal deadline to remittance date plus 120 days", source: "" }],
}, { file: "Keystone_Medicaid_Addendum_2025.pdf", uploaded: "Mar 2026" });

const CANON = { cascadia: CASCADIA_CANON, summit: SUMMIT, keystone: KEYSTONE };

/* ---------- expected allowed engine ---------- */
function calcUnit(row, contract, dos, on, cq) {
  const steps = [];
  let v;
  if (row.method === "percent_of_fee_schedule") {
    steps.push({ k: "fs", label: `Fee schedule, CPT ${row.cpt}`, note: "Contract exhibit", value: row.base });
    v = r2((row.base * row.discount) / 100);
    steps.push({ k: "disc", label: `Contracted rate, ${row.discount}% of fee schedule`, note: `${fmt(row.base)} x ${row.discount}%`, value: v });
  } else if (row.method === "per_visit") {
    v = row.flat; steps.push({ k: "flat", label: "Flat visit rate", note: "Paid once per visit", value: v });
  } else {
    v = row.base; steps.push({ k: "unit", label: `Contracted unit rate, CPT ${row.cpt}`, note: "Per 15 minute unit", value: v });
  }
  if (row.escalates && contract.escalatorPct && contract.escalatorStart && dos >= contract.escalatorStart) {
    const active = !!on[contract.id + ":escalator"];
    const nv = active ? r2(v * (1 + contract.escalatorPct / 100)) : v;
    steps.push({ k: "esc", rule: "escalator", label: `Annual escalator, +${contract.escalatorPct}%`, note: `Applies to service dates from ${fmtDate(contract.escalatorStart)}`, value: nv, active });
    v = nv;
  }
  if (cq && contract.ptaPct != null && row.method !== "per_visit") {
    const active = !!on[contract.id + ":pta"];
    const nv = active ? r2((v * contract.ptaPct) / 100) : v;
    steps.push({ k: "pta", rule: "pta", label: `PTA services (modifier CQ), paid at ${contract.ptaPct}%`, note: "Applies when a PTA delivers the service", value: nv, active });
    v = nv;
  }
  return { steps, amount: v };
}
const findRow = (contract, claim, cpt) => {
  const rows = contract.rows.filter((r) => r.plan.toLowerCase().includes(claim.planKey));
  return rows.find((r) => r.cpt === cpt) || rows.find((r) => r.method === "per_visit") || null;
};
function expectedLines(claim, contract, on) {
  return claim.lines.map((l, i) => {
    const row = findRow(contract, claim, l.cpt);
    if (!row) return null;
    if (row.method === "per_visit") return i === 0 ? calcUnit(row, contract, claim.dos, on, false).amount : 0;
    return r2(calcUnit(row, contract, claim.dos, on, l.cq).amount * l.units);
  });
}

/* ---------- synthetic claims ---------- */
const PLAN_META = {
  choice: { plan: "Choice PPO", master: "Cascadia Mutual Health", contractId: "cascadia", group: "Commercial", w: 30 },
  select: { plan: "Select HMO", master: "Cascadia Mutual Health", contractId: "cascadia", group: "Commercial", w: 12 },
  senior: { plan: "Senior Plus", master: "Cascadia Mutual Health", contractId: "cascadia", group: "Medicare", w: 12 },
  summit: { plan: "Summit PPO", master: "Summit Care Alliance", contractId: "summit", group: "Commercial", w: 30 },
  keystone: { plan: "Keystone Medicaid", master: "Keystone Health Partners", contractId: "keystone", group: "Medicaid", w: 16 },
};
const ALL5 = ["choice", "select", "senior", "summit", "keystone"];
const FACILITIES = [
  { name: "Hartford", state: "CT", plans: ALL5 }, { name: "Stamford", state: "CT", plans: ALL5 },
  { name: "Springfield", state: "MA", plans: ["choice", "senior", "summit"] }, { name: "Worcester", state: "MA", plans: ["choice", "senior", "summit"] },
  { name: "Providence", state: "RI", plans: ["summit"] },
];
const ON_ALL = { "cascadia:escalator": true, "cascadia:pta": true, "summit:pta": true };
const ON_NOESC = { "cascadia:escalator": false, "cascadia:pta": true, "summit:pta": true };
const HERO_ID = "CLM-26-30418";

function makeClaim(i, forced) {
  const rnd = rng32(1000 + i * 31);
  const f = forced || {};
  const fac = f.facility ? FACILITIES.find((x) => x.name === f.facility) : FACILITIES[Math.floor(rnd() * FACILITIES.length)];
  let planKey = f.planKey;
  if (!planKey) {
    const tot = fac.plans.reduce((s, k) => s + PLAN_META[k].w, 0); let x = rnd() * tot;
    for (const k of fac.plans) { x -= PLAN_META[k].w; if (x <= 0) { planKey = k; break; } }
    planKey = planKey || fac.plans[0];
  }
  const dos = f.dos || addDays("2026-05-01", Math.floor(rnd() * 183));
  const a = rnd();
  const apptType = f.apptType || (a < 0.1 ? "Evaluation" : a < 0.8 ? "Follow-up" : a < 0.9 ? "Re-evaluation" : "Discharge");
  let lineSpec = f.lines;
  if (!lineSpec) {
    if (apptType === "Evaluation") lineSpec = [["97161", 1]].concat(rnd() < 0.5 ? [["97140", 1]] : []);
    else {
      const pool = ["97110", "97140", "97530", "97112"].sort(() => rnd() - 0.5).slice(0, 2 + Math.floor(rnd() * 3));
      lineSpec = pool.map((c) => [c, c === "97110" ? 1 + Math.floor(rnd() * 3) : 1 + Math.floor(rnd() * 2)]);
    }
  }
  const cqOn = f.cq != null ? f.cq : apptType !== "Evaluation" && rnd() < 0.3;
  const meta = PLAN_META[planKey];
  const claim = {
    id: f.id || `CLM-26-${30000 + i * 7}`, patient: f.patient || String.fromCharCode(65 + Math.floor(rnd() * 26)) + "." + String.fromCharCode(65 + Math.floor(rnd() * 26)) + ".",
    pid: f.pid || "PT-" + (40000 + Math.floor(rnd() * 9999)), dos, facility: fac.name, state: fac.state, planKey, plan: meta.plan, master: meta.master, contractId: meta.contractId, group: meta.group,
    apptType, cq: cqOn, remitDate: f.remit || addDays(dos, 21 + Math.floor(rnd() * 10)), remitId: "835-" + (700000 + i * 13),
    lines: lineSpec.map(([cpt, units]) => ({ cpt, units, cq: cqOn && cpt !== "97161", billed: CHARGE[cpt] * units })),
  };
  const contract = CANON[claim.contractId];
  const truth = expectedLines(claim, contract, ON_ALL);
  let pattern = null;
  let paid = truth.slice();
  const roll = rnd();
  if ((planKey === "choice" || planKey === "select") && dos < "2026-10-01" && (f.pattern === "escalator" || roll < 0.6)) { pattern = "escalator"; paid = expectedLines(claim, contract, ON_NOESC); }
  else if (planKey === "summit" && claim.lines.some((l) => l.cq) && (f.pattern === "pta" || roll < 0.55)) { pattern = "pta"; paid = truth.map((t, k) => (claim.lines[k].cq ? r2(t * 0.85) : t)); }
  else if (planKey === "keystone" && claim.lines.some((l) => l.cpt === "97110") && claim.lines.some((l) => l.cpt === "97530")) { pattern = "bundling"; paid = truth.map((t, k) => (claim.lines[k].cpt === "97530" ? 0 : t)); }
  claim.lines.forEach((l, k) => { l.paid = paid[k]; });
  claim.pattern = pattern;
  claim.billed = claim.lines.reduce((s, l) => s + l.billed, 0);
  claim.paid = r2(claim.lines.reduce((s, l) => s + l.paid, 0));
  return claim;
}
const HERO = makeClaim(0, { id: HERO_ID, patient: "M.O.", pid: "PT-48213", dos: "2026-08-14", facility: "Hartford", planKey: "choice", apptType: "Follow-up", lines: [["97110", 3], ["97140", 1], ["97530", 2]], cq: false, remit: "2026-09-08", pattern: "escalator" });
const CLAIMS = [HERO, ...Array.from({ length: 169 }, (_, i) => makeClaim(i + 1))];

const PATTERN = {
  escalator: { prob: 0.92, short: "Escalator not applied", carc: "CO-45" },
  pta: { prob: 0.74, short: "PTA rate cut applied", carc: "CO-45" },
  bundling: { prob: 0.31, short: "Payer edit on 97530", carc: "CO-97" },
};
function derive(claim, contracts, ruleOn, appeals) {
  const contract = contracts.find((c) => c.id === claim.contractId) || null;
  const d = { ...claim, contract, status: "no_contract", expected: null, variance: 0, lineExp: [], deadline: null, daysLeft: null, prob: 0, recover: 0, level: "", reason: "", appeal: appeals[claim.id] || null };
  if (!contract) return d;
  d.lineExp = expectedLines(claim, contract, ruleOn);
  d.expected = r2(d.lineExp.reduce((s, x) => s + (x || 0), 0));
  const v = r2(d.expected - claim.paid);
  d.status = v > 0.5 ? "underpaid" : "ok";
  d.deadline = addDays(claim.remitDate, contract.disputeDays || 180);
  d.daysLeft = daysBetween(TODAY, d.deadline);
  if (d.status === "underpaid") {
    d.variance = v;
    const p = PATTERN[claim.pattern] || { prob: 0.5 };
    d.prob = d.daysLeft < 0 ? 0 : p.prob;
    d.recover = r2(v * d.prob);
    d.level = d.daysLeft < 0 ? "Closed" : d.prob >= 0.8 ? "High" : d.prob >= 0.5 ? "Medium" : "Low";
    const esc = contract.terms.find((t) => t.ruleKey === "escalator"), pta = contract.terms.find((t) => t.ruleKey === "pta");
    if (claim.pattern === "escalator") d.reason = `Section ${esc ? esc.section : "4.3"} raises the contracted rate ${contract.escalatorPct}% from ${fmtDate(contract.escalatorStart)}. The payer paid the 2025 rate.`;
    else if (claim.pattern === "pta") d.reason = `Contract pays PTA services at 100% of the rate. The payer reduced CQ lines to 85%.`;
    else if (claim.pattern === "bundling") d.reason = "The payer denied 97530 with a bundling edit (CO-97). The contract is silent on bundling, so this is a policy dispute.";
    else d.reason = "Paid amount is below the contracted rate.";
  }
  return d;
}

/* ---------- Claude calls ---------- */
async function callClaude(system, content) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system, messages: [{ role: "user", content }] }),
  });
  if (!r.ok) throw new Error("api " + r.status);
  const d = await r.json();
  return (d.content || []).filter((b) => b.type === "text").map((b) => b.text).join("");
}
function parseJSON(t) {
  const c = t.replace(/```json|```/g, "").trim();
  return JSON.parse(c.slice(c.indexOf("{"), c.lastIndexOf("}") + 1));
}
const SYS_PARSE = "You extract structured data from healthcare provider and payer contracts. Reply with minified JSON only. No markdown, no commentary.";
const PROMPT_A = `Extract the compensation structure from this contract. Return JSON with this exact shape: {"contract":{"masterPayer":string,"provider":string,"effectiveStart":"YYYY-MM-DD","effectiveEnd":"YYYY-MM-DD","escalatorPct":number or null,"escalatorStart":"YYYY-MM-DD" or null,"ptaPct":number or null,"disputeDays":number or null},"plans":[{"payer":string,"payerGroup":"Commercial" or "Medicare" or "Medicaid","planType":string,"plan":string,"method":"percent_of_fee_schedule" or "per_visit" or "per_unit","discountPct":number or null,"flatRate":number or null,"maxUnits":number or null,"feeSchedule":"B" or "C" or null,"facilities":string,"states":string,"escalates":boolean,"source":"an exact phrase of 5 to 9 words copied from the contract"}],"feeSchedules":{"B":{"97110":number,"97140":number,"97530":number,"97112":number,"97161":number},"C":{"97110":number,"97140":number,"97530":number,"97112":number,"97161":number}}}. The feeSchedule field is the exhibit letter whose amounts the plan uses. The plan field is the short plan name without the payer prefix, for example Choice PPO.`;
const PROMPT_B = `List the contract terms that affect payment, authorization, licensure, state rules or disputes. Return JSON: {"terms":[{"section":string,"category":"Rate" or "License" or "State" or "Authorization" or "Appeals","summary":"under 15 words","when":"under 14 words, the condition","then":"under 14 words, the action","source":"an exact phrase of 4 to 8 words copied from the contract"}]}. Include at most 6 terms.`;

function validA(a) {
  try {
    if (!a || !Array.isArray(a.plans) || !a.plans.length || !a.contract) return false;
    return a.plans.every((p) => ["percent_of_fee_schedule", "per_visit", "per_unit"].includes(p.method) && /choice|select|senior/i.test(p.plan || "") &&
      (p.method === "per_visit" ? num(p.flatRate) != null : a.feeSchedules && a.feeSchedules[p.feeSchedule] && CPT_LIST.every((c) => num(a.feeSchedules[p.feeSchedule][c]) != null) && (p.method === "per_unit" || num(p.discountPct) != null)));
  } catch (e) { return false; }
}
function normA(a) {
  const c = a.contract;
  return {
    contract: { id: "cascadia", masterPayer: c.masterPayer || "Cascadia Mutual Health", provider: c.provider || "", effectiveStart: c.effectiveStart, effectiveEnd: c.effectiveEnd, escalatorPct: num(c.escalatorPct), escalatorStart: c.escalatorStart || null, ptaPct: num(c.ptaPct), disputeDays: num(c.disputeDays) || 180 },
    plans: a.plans.map((p) => ({ ...p, discountPct: num(p.discountPct), flatRate: num(p.flatRate), maxUnits: num(p.maxUnits), escalates: !!p.escalates })),
    feeSchedules: a.feeSchedules,
  };
}
const validB = (b) => b && Array.isArray(b.terms) && b.terms.length > 0 && b.terms.every((t) => t.section && t.summary);

function computeMarks(text, sources) {
  const marks = [];
  sources.forEach((s, idx) => {
    if (!s) return;
    const low = text.toLowerCase();
    let i = low.indexOf(s.toLowerCase());
    let len = s.length;
    if (i < 0) { const w = s.split(/\s+/).slice(0, 4).join(" "); i = low.indexOf(w.toLowerCase()); len = w.length; }
    if (i >= 0) marks.push({ start: i, end: i + len, idx });
  });
  return marks.sort((a, b) => a.start - b.start).filter((m, k, arr) => k === 0 || m.start >= arr[k - 1].end);
}

/* ---------- small UI ---------- */
const Chip = ({ tone = "", children }) => <span className={"chip " + tone}>{children}</span>;
const Switch = ({ on, onChange, label, disabled }) => (
  <button role="switch" aria-checked={on} aria-label={label} disabled={disabled} className={"sw" + (on ? " on" : "")} onClick={() => onChange(!on)}><span /></button>
);
const levelTone = { High: "moss", Medium: "amber", Low: "grey", Closed: "rust" };

/* ============================================================
   Doc viewer
   ============================================================ */
function resolveAnchor(text, needle, nth = 0, toEol = false) {
  if (!text || !needle) return null;
  const low = text.toLowerCase(); const nd = needle.toLowerCase();
  let i = -1, from = 0;
  for (let k = 0; k <= nth; k++) { i = low.indexOf(nd, from); if (i < 0) break; from = i + nd.length; }
  let len = needle.length;
  if (i < 0 && nth > 0) return resolveAnchor(text, needle, 0, toEol);
  if (i < 0) { const w = needle.split(/\s+/).slice(0, 4).join(" "); i = low.indexOf(w.toLowerCase()); len = w.length; }
  if (i < 0) return null;
  let end = i + len;
  if (toEol) { const nl = text.indexOf("\n", end); end = nl < 0 ? text.length : nl; }
  return { start: i, end };
}

function DocPane({ text, marks = [], activeIdx = -1, shownIdx = [], nonce = 0, title, pdfName, zoom = 100 }) {
  const cont = useRef(null);
  const act = useRef(null);
  useEffect(() => {
    const c = cont.current, m = act.current;
    if (!c || !m) return;
    const top = m.getBoundingClientRect().top - c.getBoundingClientRect().top + c.scrollTop - c.clientHeight / 3;
    if (c.scrollTo) c.scrollTo({ top: Math.max(0, top), behavior: "smooth" }); else c.scrollTop = Math.max(0, top);
  }, [activeIdx, nonce]);
  if (text == null) return (
    <div className="docscroll" ref={cont}><div className="paper pdfcard"><FileText size={28} /><div className="b">{pdfName}</div><div className="muted">PDF sent to Claude for reading. Page preview is not available in this prototype, so selecting a row cannot scroll the document.</div></div></div>
  );
  const parts = []; let pos = 0;
  marks.forEach((m, k) => {
    if (m.start > pos) parts.push(<span key={"t" + k}>{text.slice(pos, m.start)}</span>);
    const shown = shownIdx.includes(m.idx) || m.idx === activeIdx;
    parts.push(<mark key={"m" + k} ref={m.idx === activeIdx ? act : null} className={m.idx === activeIdx ? "hl active" : shown ? "hl" : "hl off"}>{text.slice(m.start, m.end)}</mark>);
    pos = m.end;
  });
  parts.push(<span key="end">{text.slice(pos)}</span>);
  return (
    <div className="docscroll" ref={cont}>
      <div className="paper">{title ? <div className="paper-title">{title}</div> : null}<div className="paper-body" style={{ fontSize: 13 * zoom / 100 }}>{parts}</div></div>
    </div>
  );
}

/* ============================================================
   Rates table
   ============================================================ */
function RatesTable({ rows, contractMap, ruleOn, onRow, activeId, compact }) {
  return (
    <div className="tblwrap">
      <table className={"tbl" + (compact ? " compact" : "")}>
        <thead><tr>
          <th>Payer</th><th>Payer group</th><th>Plan type</th><th>Plan</th><th>CPT</th><th>Method</th><th className="r">Fee schedule</th><th className="r">Rate</th>
          <th className="r">Expected allowed</th><th>Facility</th><th>State</th><th>Units</th><th>Appt type</th><th>Start</th><th>End</th>
        </tr></thead>
        <tbody>
          {rows.map((r) => {
            const c = contractMap[r.contractId];
            const u = calcUnit(r, c, TODAY, ruleOn, false).amount;
            return (
              <tr key={r.id} className={"clickrow" + (activeId === r.id ? " active" : "")} onClick={() => onRow && onRow(r)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onRow && onRow(r)}>
                <td>{r.payer}</td><td><Chip tone={r.payerGroup === "Commercial" ? "teal" : r.payerGroup === "Medicare" ? "navy" : "plum"}>{r.payerGroup}</Chip></td>
                <td>{r.planType}</td><td className="b">{r.plan}</td><td className="nowrap">{r.cpt}</td><td>{METHOD[r.method]}</td>
                <td className="r">{r.base != null ? fmt(r.base) : "n/a"}</td>
                <td className="r">{r.method === "percent_of_fee_schedule" ? r.discount + "%" : r.method === "per_visit" ? fmt(r.flat) : "n/a"}</td>
                <td className="r b">{fmt(u)}<span className="sub">{r.method === "per_visit" ? "per visit" : "per unit"}</span></td>
                <td>{r.facility}</td><td>{r.state}</td><td>{r.units}</td><td>{r.apptType}</td><td className="nowrap">{fmtDate(r.start)}</td><td className="nowrap">{fmtDate(r.end)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ============================================================
   Upload and extraction flow
   ============================================================ */
const STAGES = ["Reading the document", "Identifying payer hierarchy", "Extracting rate methodology", "Reading fee schedule exhibits", "Flagging terms and state rules"];

function qaFor(contract, text) {
  const checks = [], reviews = [];
  const payers = [...new Set(contract.plans.map((p) => p.payer))];
  checks.push({ id: "h", label: "Payer hierarchy", detail: `${contract.masterPayer}, ${payers.length} payer line${payers.length > 1 ? "s" : ""}, ${contract.plans.length} plans`, ok: true, anchor: { needle: contract.masterPayer, nth: 0 } });
  const missing = [];
  contract.plans.forEach((p) => { if (p.method !== "per_visit") CPT_LIST.forEach((c) => { const r = contract.rows.find((x) => x.plan === p.plan && x.cpt === c); if (!r || r.base == null) missing.push(p.plan + " " + c); }); });
  checks.push({ id: "f", label: "Fee schedule load", detail: missing.length ? "Missing: " + missing.join(", ") : `All ${CPT_LIST.length} CPT codes present for every fee schedule plan`, ok: !missing.length, anchor: { needle: "Exhibit B. ", nth: 0 } });
  const odd = contract.plans.filter((p) => (p.method === "percent_of_fee_schedule" && (p.discountPct < 50 || p.discountPct > 130)) || (p.method === "per_visit" && (p.flatRate < 30 || p.flatRate > 150)));
  checks.push({ id: "p", label: "Rate range check", detail: odd.length ? "Outside expected range: " + odd.map((p) => p.plan).join(", ") : "All rates fall inside the expected range for outpatient PT", ok: !odd.length, anchor: { needle: (odd[0] || contract.plans[0]).source, nth: 0 } });
  checks.push({ id: "d", label: "Effective dates", detail: `${fmtDate(contract.effectiveStart)} to ${fmtDate(contract.effectiveEnd)}`, ok: !!contract.effectiveStart && !!contract.effectiveEnd && contract.effectiveEnd > contract.effectiveStart, anchor: { needle: "Effective Date", nth: 0 } });
  contract.plans.forEach((p) => {
    if (p.method === "per_visit") reviews.push({ id: "v" + p.plan, label: `${p.plan}: flat visit rate`, detail: `Claude read ${fmt(p.flatRate)} per visit with a ${p.maxUnits || 4} unit cap. Confirm it replaces per-unit rates.`, anchor: { needle: p.source, nth: 0 } });
    else if (text && p.source && computeMarks(text, [p.source]).length === 0) reviews.push({ id: "s" + p.plan, label: `${p.plan}: source passage not found`, detail: "The quoted source could not be located in the document. Verify the rate by hand.", anchor: null });
  });
  return { checks, reviews };
}

function Sec({ id, title, count, open, setOpen, children }) {
  return (
    <section className="sec">
      <button className="sec-h" onClick={() => setOpen({ ...open, [id]: !open[id] })} aria-expanded={open[id]}>
        {open[id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}<span>{title}</span>{count != null && <span className="cnt">{count}</span>}
      </button>
      {open[id] && <div className="sec-b">{children}</div>}
    </section>
  );
}

const STEP_NAMES = ["Upload", "Review and publish"];

function AddContractFlow({ mode = "pdf", onCancel, onPublish, setAiHook }) {
  const [phase, setPhase] = useState("idle");
  const [src, setSrc] = useState(null);
  const [stage, setStage] = useState(0);
  const [result, setResult] = useState(null);
  const [reveal, setReveal] = useState(0);
  const [reviewed, setReviewed] = useState({});
  const [focus, setFocus] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [menu, setMenu] = useState(false);
  const [open, setOpen] = useState({ rates: true, terms: true, qa: true });
  const [helpful, setHelpful] = useState(null);
  const fileRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menu) return;
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    const k = (e) => { if (e.key === "Escape") setMenu(false); };
    document.addEventListener("mousedown", h); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [menu]);

  async function run(s) {
    setSrc(s); setPhase("extracting"); setStage(0); setResult(null); setReveal(0); setReviewed({}); setFocus(null);
    const t0 = Date.now();
    const timer = setInterval(() => setStage((x) => Math.min(x + 1, STAGES.length - 1)), 900);
    const doc = s.text != null ? { type: "text", text: "CONTRACT DOCUMENT:\n" + s.text } : { type: "document", source: { type: "base64", media_type: "application/pdf", data: s.b64 } };
    const ask = async (p) => { try { return { ok: true, data: parseJSON(await callClaude(SYS_PARSE, [doc, { type: "text", text: p }])) }; } catch (e) { return { ok: false }; } };
    const [a, b] = await Promise.all([ask(PROMPT_A), ask(PROMPT_B)]);
    const okA = a.ok && validA(a.data), okB = b.ok && validB(b.data);
    const rawA = okA ? normA(a.data) : CASCADIA_RAW;
    const terms = okB ? b.data.terms.slice(0, 6) : CASCADIA_TERMS;
    const contract = buildContract({ ...rawA, terms }, { file: s.name, uploaded: "Today" });
    await sleep(Math.max(0, 4600 - (Date.now() - t0)));
    clearInterval(timer);
    setStage(STAGES.length);
    setResult({ contract, liveA: okA, liveB: okB, ms: Date.now() - t0 });
    setPhase("review"); setReveal(0);
  }
  useEffect(() => {
    if (phase !== "review" || !result) return;
    if (reveal >= result.contract.rows.length) return;
    const t = setTimeout(() => setReveal((x) => x + 1), 110);
    return () => clearTimeout(t);
  }, [phase, reveal, result]);

  const onFile = (f) => {
    if (!f) return;
    const rd = new FileReader();
    if (/pdf$/i.test(f.name)) { rd.onload = () => run({ name: f.name, b64: String(rd.result).split(",")[1] }); rd.readAsDataURL(f); }
    else { rd.onload = () => run({ name: f.name, text: String(rd.result) }); rd.readAsText(f); }
  };

  const text = src && src.text != null ? src.text : null;
  const contract = result && result.contract;
  const qa = useMemo(() => (contract ? qaFor(contract, text) : null), [contract, text]);
  const revealed = contract ? contract.rows.slice(0, reveal) : [];
  const allRevealed = !!contract && reveal >= contract.rows.length;
  const pending = qa ? qa.reviews.filter((r) => !reviewed[r.id]).length : 0;
  const activePlanIdx = contract && revealed.length ? contract.plans.findIndex((p) => p.plan === revealed[revealed.length - 1].plan) : -1;
  const donePlanIdx = contract ? contract.plans.map((p, i) => i).filter((i) => revealed.some((r) => r.plan === contract.plans[i].plan) && i !== activePlanIdx) : [];
  const baseMarks = useMemo(() => (text && contract ? computeMarks(text, [...contract.plans.map((p) => p.source), ...contract.terms.map((t) => t.source)]) : []), [text, contract]);
  const focusMark = useMemo(() => (focus && text ? resolveAnchor(text, focus.needle, focus.nth, focus.toEol) : null), [focus, text]);
  const marks = focusMark ? [...baseMarks.filter((m) => m.end <= focusMark.start || m.start >= focusMark.end), { ...focusMark, idx: 1000 }].sort((x, y) => x.start - y.start) : baseMarks;
  const activeIdx = focusMark ? 1000 : allRevealed ? -1 : activePlanIdx;
  const shownIdx = allRevealed ? baseMarks.map((m) => m.idx) : donePlanIdx;
  const cmap = contract ? { [contract.id]: contract } : {};
  const ruleOnPreview = contract ? { [contract.id + ":escalator"]: true, [contract.id + ":pta"]: true } : {};

  const point = (needle, nth, meta = {}) => setFocus({ needle, nth: nth || 0, nonce: Date.now(), ...meta });
  const rowAnchor = (row) => {
    const p = contract.plans.find((x) => x.plan === row.plan);
    if (p && p.method !== "per_visit" && p.feeSchedule && /^\d{5}$/.test(row.cpt)) {
      const order = [...new Set(contract.plans.map((x) => x.feeSchedule).filter(Boolean))].sort();
      return { needle: "CPT " + row.cpt, nth: Math.max(0, order.indexOf(p.feeSchedule)), toEol: true };
    }
    return { needle: (p && p.source) || contract.masterPayer, nth: 0 };
  };
  const escTerm = contract && contract.terms.find((t) => t.ruleKey === "escalator");

  useEffect(() => {
    if (!contract) {
      setAiHook({ context: "The user is adding a contract in Air. Step 1 is uploading a PDF or CSV. Claude then reads it and extracts the payer hierarchy (master payer, payer, plan), rate methodology (percent of fee schedule, per visit, per unit), fee schedule exhibits, and terms such as escalators, license rules, state rules, authorization limits and appeal windows. The user then reviews the rates, terms and QA checks in one scrolling pane next to the document, and publishes to the contract repository.", prompts: [{ q: "What can I upload here?" }, { q: "What happens after I upload?" }] });
      return;
    }
    const ctx = `Contract just read: ${contract.masterPayer}, effective ${contract.effectiveStart} to ${contract.effectiveEnd}. Plans: ${contract.plans.map((p) => `${p.plan} (${METHOD[p.method]}${p.discountPct ? " " + p.discountPct + "%" : ""}${p.flatRate ? " $" + p.flatRate : ""})`).join("; ")}. Terms: ${contract.terms.map((t) => `Section ${t.section}: ${t.summary}`).join(" | ")}. Items awaiting human review: ${qa ? qa.reviews.map((r) => r.label).join("; ") || "none" : "none"}.` + (text ? "\n\nDocument text:\n" + text : "");
    setAiHook({
      context: ctx,
      prompts: [
        { q: "Which items need my review?" },
        { q: "Show me the escalator clause", act: () => escTerm && point(escTerm.source, 0, { termId: escTerm.id }) },
        { q: "Where do the fee schedules come from?", act: () => point("Exhibit B. ", 0, { toEol: true }) },
      ],
    });
  }, [contract, text, pending]);

  const stepStatus = (i) => (i === 0 ? (phase === "idle" ? "In progress" : "Complete") : phase === "idle" ? "Pending" : pending ? `${pending} to review` : phase === "review" && allRevealed ? "Ready to publish" : "In progress");
  const canPublish = phase === "review" && allRevealed && pending === 0;
  const backToUpload = () => { setMenu(false); setPhase("idle"); setResult(null); setSrc(null); setFocus(null); setReviewed({}); };
  return (
    <div className="flowwrap">
      <div className="fhead">
        <div className="fbc"><span className="bc-link">Contracts</span><span className="bc-sep">/</span><span className="bc-cur">{mode === "csv" ? "Import CSV File" : "Add contract"}</span></div>
        <div className="fhead-r">
          <div className="stepwrap" ref={menuRef}>
            <button className="stepbtn" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>{phase === "idle" ? 1 : 2} of 2: {STEP_NAMES[phase === "idle" ? 0 : 1]}<ChevronDown size={14} /></button>
            {menu && (
              <div className="menu stepmenu" role="menu">
                {STEP_NAMES.map((n, i) => (
                  <button key={n} role="menuitem" className={"step-i" + ((phase === "idle" ? 0 : 1) === i ? " on" : "")} disabled={i === 1 && phase === "idle"} onClick={() => { if (i === 0 && phase !== "idle") backToUpload(); else setMenu(false); }}>
                    <span className="stepnum">{i + 1}</span><span><span className="b">{n}</span><span className="sub">{stepStatus(i)}</span></span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="vdiv" />
          <button className="cancel" onClick={onCancel}>Cancel</button>
          {phase !== "idle" && <button className="btn primary" disabled={!canPublish} title={canPublish ? "" : pending ? "Confirm the items in QA review first" : "Waiting for extraction"} onClick={() => onPublish(contract)}>Publish to repository</button>}
        </div>
      </div>

      {phase === "idle" ? (
        <div className="emptyfull" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}>
          <div className="emptyicon"><FileText size={28} /></div>
          <div className="h2">{mode === "csv" ? "Import a fee schedule CSV" : "Add a contract to the repository"}</div>
          <p className="muted emptycopy">{mode === "csv" ? "Claude maps the columns in your CSV to rate rows. You review everything next to the source before it is published." : "Drop a payer contract PDF. Claude reads it, pulls out payers, plans, rates and terms, and you review them next to the document before publishing."}</p>
          <div className="dropbox">
            <Upload size={22} />
            <div className="b">{mode === "csv" ? "Drop a CSV file here" : "Drop a contract PDF here"}</div>
            <div className="muted small">{mode === "csv" ? "CSV, up to 25 MB" : "PDF or CSV, up to 25 MB"}</div>
            <input ref={fileRef} type="file" accept={mode === "csv" ? ".csv" : ".pdf,.csv,.txt"} hidden onChange={(e) => onFile(e.target.files[0])} />
            <div className="row gap"><button className="btn" onClick={() => fileRef.current.click()}>Choose a file</button>
              {mode !== "csv" && <button className="btn primary" onClick={() => run({ name: "Cascadia_Participation_Agreement_2025.pdf", text: CONTRACT_TEXT })}>Use the sample Cascadia agreement</button>}</div>
          </div>
          <div className="muted small">The sample agreement is fictional. If the live read is unavailable, a cached extraction is used and the screen says so.</div>
        </div>
      ) : (
        <div className="fsplit">
          <div className="dcol">
            <div className="dochead">
              <FileText size={16} /><span className="b ellip">{src.name}</span><span className="grow" />
              <button className="icon" aria-label="Zoom out" onClick={() => setZoom(Math.max(70, zoom - 10))}><ZoomOut size={16} /></button>
              <span className="zoomv">{zoom}%</span>
              <button className="icon" aria-label="Zoom in" onClick={() => setZoom(Math.min(160, zoom + 10))}><ZoomIn size={16} /></button>
            </div>
            <DocPane text={text} marks={marks} activeIdx={activeIdx} shownIdx={shownIdx} nonce={focus ? focus.nonce : 0} title="" pdfName={src.name} zoom={zoom} />
          </div>
          <div className="rcol">
            {phase === "extracting" && (
              <div className="sec"><div className="sec-b stages">
                <div className="h3">Claude is reading the contract</div>
                {STAGES.map((s, i) => (
                  <div key={s} className={"stage" + (i < stage ? " done" : i === stage ? " cur" : "")}>
                    {i < stage ? <CheckCircle2 size={16} /> : i === stage ? <Loader2 size={16} className="spin" /> : <span className="dot" />}{s}
                  </div>
                ))}
              </div></div>
            )}
            {phase === "review" && contract && (
              <>
                <div className="aibanner">
                  <Sparkles size={16} />
                  <div className="grow">
                    <div className="b">{allRevealed ? (pending ? `${pending} item${pending > 1 ? "s" : ""} need${pending > 1 ? "" : "s"} your review before you publish` : "Everything checks out. You can publish to the repository") : "Reading rates into the table"}</div>
                    <div className="muted small">Athelas AI found {contract.plans.length} plans, {contract.rows.length} rate rows and {contract.terms.length} terms. {result.liveA && result.liveB ? `Read live by Claude in ${(result.ms / 1000).toFixed(1)}s.` : "Live read unavailable, showing the cached extraction."} Select anything below to see where it comes from in the document.</div>
                  </div>
                  <button className={"icon" + (helpful === "up" ? " sel" : "")} aria-label="Helpful" onClick={() => setHelpful("up")}><ThumbsUp size={16} /></button>
                  <button className={"icon" + (helpful === "down" ? " sel" : "")} aria-label="Not helpful" onClick={() => setHelpful("down")}><ThumbsDown size={16} /></button>
                </div>

                <Sec open={open} setOpen={setOpen} id="rates" title="Rates" count={contract.rows.length}>
                  <RatesTable rows={revealed} contractMap={cmap} ruleOn={ruleOnPreview} compact activeId={focus && focus.rowId} onRow={(r) => point(rowAnchor(r).needle, rowAnchor(r).nth, { toEol: rowAnchor(r).toEol, rowId: r.id })} />
                </Sec>

                <Sec open={open} setOpen={setOpen} id="terms" title="Terms" count={contract.terms.length}>
                  <div className="terms">
                    {contract.terms.map((t) => (
                      <button key={t.id} className={"termrow clickable" + (focus && focus.termId === t.id ? " on" : "")} onClick={() => point(t.source, 0, { termId: t.id })}>
                        <Chip tone="grey">{t.category}</Chip><span className="b">Section {t.section}</span><span className="left">{t.summary}</span>
                      </button>
                    ))}
                  </div>
                </Sec>

                <Sec open={open} setOpen={setOpen} id="qa" title="QA review" count={pending ? `${pending} to confirm` : "Complete"}>
                  <div className="qa">
                    {qa.checks.map((c) => (
                      <button key={c.id} className={"qarow clickable" + (focus && focus.qaId === c.id ? " on" : "")} onClick={() => c.anchor && point(c.anchor.needle, c.anchor.nth, { qaId: c.id, toEol: c.id === "f" || c.id === "d" })}>
                        {c.ok ? <CheckCircle2 size={16} className="okc" /> : <AlertTriangle size={16} className="warnc" />}<div className="left"><div className="b">{c.label}</div><div className="muted">{c.detail}</div></div>
                      </button>
                    ))}
                    {qa.reviews.length > 0 && <div className="h3 mt">Needs a human check</div>}
                    {qa.reviews.map((r) => (
                      <div key={r.id} className={"qarow review-item" + (focus && focus.qaId === r.id ? " on" : "")}>
                        <input type="checkbox" aria-label={"Confirm " + r.label} checked={!!reviewed[r.id]} onChange={(e) => setReviewed({ ...reviewed, [r.id]: e.target.checked })} />
                        <button className="clickable plain left" onClick={() => r.anchor && point(r.anchor.needle, r.anchor.nth, { qaId: r.id })}><div className="b">{r.label}</div><div className="muted">{r.detail}</div></button>
                      </div>
                    ))}
                  </div>
                </Sec>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Contracts page
   ============================================================ */
function AddContractButton({ onAdd, onImport }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const k = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", h); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [open]);
  return (
    <div className="sbtn-wrap" ref={ref}>
      <div className="sbtn">
        <button className="sbtn-main" onClick={onAdd}><Plus size={16} />Add Contract</button>
        <button className="sbtn-caret" aria-haspopup="menu" aria-expanded={open} aria-label="More ways to add contracts" onClick={() => setOpen(!open)}><ChevronDown size={16} /></button>
      </div>
      {open && <div className="menu" role="menu"><button role="menuitem" className="menu-i" onClick={() => { setOpen(false); onImport(); }}><Upload size={16} />Import CSV File</button></div>}
    </div>
  );
}

const COLS = [["payer", "Payer"], ["group", "Payer group"], ["ptype", "Plan type"], ["plan", "Plan"], ["cpt", "CPT"], ["method", "Method"], ["fs", "Fee schedule"], ["rate", "Rate"], ["exp", "Expected allowed"], ["fac", "Facility"], ["state", "State"], ["units", "Units"], ["appt", "Appt type"], ["start", "Start"], ["end", "End"]];
const RIGHT = { fs: 1, rate: 1, exp: 1 };
const CELLS = {
  payer: (r) => r.payer,
  group: (r) => <Chip tone={r.payerGroup === "Commercial" ? "teal" : r.payerGroup === "Medicare" ? "navy" : "plum"}>{r.payerGroup}</Chip>,
  ptype: (r) => r.planType, plan: (r) => <span className="b">{r.plan}</span>, cpt: (r) => <span className="nowrap">{r.cpt}</span>, method: (r) => METHOD[r.method],
  fs: (r) => (r.base != null ? fmt(r.base) : "n/a"),
  rate: (r) => (r.method === "percent_of_fee_schedule" ? r.discount + "%" : r.method === "per_visit" ? fmt(r.flat) : "n/a"),
  exp: (r, c, on) => <span className="b">{fmt(calcUnit(r, c, TODAY, on, false).amount)}<span className="sub">{r.method === "per_visit" ? "per visit" : "per unit"}</span></span>,
  fac: (r) => r.facility, state: (r) => r.state, units: (r) => r.units, appt: (r) => r.apptType,
  start: (r) => <span className="nowrap">{fmtDate(r.start)}</span>, end: (r) => <span className="nowrap">{fmtDate(r.end)}</span>,
};
function usePop(open, close) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) close(); };
    const k = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("mousedown", h); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [open]);
  return ref;
}

function ContractsPage({ contracts, ruleOn, setRuleOn, createdTerms, setCreatedTerms, onUpload, drawerRow, setDrawerRow, openDoc, toast, claims, ruleLog, setRuleLog }) {
  const [view, setView] = useState("all");
  const [q, setQ] = useState("");
  const [pop, setPop] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState([]);
  const [groupBy, setGroupBy] = useState("contract");
  const [cols, setCols] = useState(() => Object.fromEntries(COLS.map(([k]) => [k, true])));
  const [collapsed, setCollapsed] = useState({});
  const [draft, setDraft] = useState(null);
  const [showHist, setShowHist] = useState(false);
  const [pv, setPv] = useState("root");
  const [termsFor, setTermsFor] = useState(null);
  const close = () => setPop(null);
  const sRef = usePop(pop === "settings", close), fRef = usePop(pop === "filter", close), qRef = usePop(pop === "search", close);

  const cmap = Object.fromEntries(contracts.map((c) => [c.id, c]));
  const sorted = [...contracts].sort((a, b) => a.masterPayer.localeCompare(b.masterPayer));
  const expiring = (c) => c.effectiveEnd <= "2027-11-16";
  const inView = (c) => view === "all" || expiring(c);

  /* settings: every contract rule lives behind the table's gear */
  const tf = (cat) => contracts.flatMap((c) => c.terms.filter((t) => t.category === cat && !t.ruleKey));
  const DEFS = [
    { k: "escalator", label: "Apply annual escalators to expected allowed", sub: "Raises contracted rates on the dates written in each contract", has: contracts.some((c) => c.escalatorPct), get: contracts.some((c) => c.escalatorPct) && contracts.filter((c) => c.escalatorPct).every((c) => !!ruleOn[c.id + ":escalator"]) },
    { k: "pta", label: "Pay PTA (CQ) services at the contract percentage", sub: "Changes expected allowed on lines delivered by a PTA", has: contracts.some((c) => c.ptaPct != null), get: contracts.some((c) => c.ptaPct != null) && contracts.filter((c) => c.ptaPct != null).every((c) => !!ruleOn[c.id + ":pta"]) },
    { k: "state", label: "Hold claims that break a state or license rule", sub: "Feeds claim edits, such as the Massachusetts supervising PT rule", has: tf("State").length > 0, get: tf("State").length > 0 && tf("State").every((t) => !!createdTerms[t.id]) },
    { k: "auth", label: "Require authorization at visit limits", sub: "Feeds scheduling and authorization", has: tf("Authorization").length > 0, get: tf("Authorization").length > 0 && tf("Authorization").every((t) => !!createdTerms[t.id]) },
  ];
  const cur = Object.fromEntries(DEFS.map((d) => [d.k, d.get]));
  const dirty = draft && DEFS.some((d) => d.has && draft[d.k] !== cur[d.k]);
  const openSettings = () => { if (pop === "settings") return close(); setDraft(cur); setShowHist(false); setPv("root"); setPop("settings"); };
  const rulesOn = DEFS.filter((d) => d.has && d.get).length, rulesTotal = DEFS.filter((d) => d.has).length;
  const saveSettings = () => {
    const changed = DEFS.filter((d) => d.has && draft[d.k] !== cur[d.k]);
    setRuleOn((p) => { const n = { ...p }; contracts.forEach((c) => { if (c.escalatorPct) n[c.id + ":escalator"] = draft.escalator; if (c.ptaPct != null) n[c.id + ":pta"] = draft.pta; }); return n; });
    setCreatedTerms((p) => { const n = { ...p }; tf("State").forEach((t) => { n[t.id] = draft.state; }); tf("Authorization").forEach((t) => { n[t.id] = draft.auth; }); return n; });
    setRuleLog((l) => [...changed.map((d) => ({ d: fmtDate(TODAY), t: d.label + ": " + (draft[d.k] ? "on" : "off") })), ...l]);
    toast("Table settings saved"); close();
  };

  /* filters, search and grouping */
  const kinds = [...new Set(filters.map((f) => f.k))];
  const matchF = (k, v, r) => (k === "payer" ? cmap[r.contractId].masterPayer === v : k === "group" ? r.payerGroup === v : r.method === v);
  let rows = sorted.filter(inView).flatMap((c) => c.rows).filter((r) => kinds.every((k) => filters.filter((f) => f.k === k).some((f) => matchF(k, f.v, r))));
  if (q) rows = rows.filter((r) => (r.payer + r.plan + r.cpt + r.planType + r.facility + r.state + cmap[r.contractId].number + cmap[r.contractId].masterPayer).toLowerCase().includes(q.toLowerCase()));
  const groups = [];
  if (groupBy === "none") groups.push({ key: "all", name: null, rows });
  else rows.forEach((r) => {
    const c = cmap[r.contractId];
    const key = groupBy === "contract" ? c.id : c.masterPayer;
    let g = groups.find((x) => x.key === key);
    if (!g) { g = { key, name: groupBy === "contract" ? c.number : c.masterPayer, contract: groupBy === "contract" ? c : null, rows: [] }; groups.push(g); }
    g.rows.push(r);
  });
  const vcols = COLS.filter(([k]) => cols[k]);
  const allRows = contracts.flatMap((c) => c.rows);
  const filterOpts = [
    ["payer", "Master payer", [...new Set(contracts.map((c) => c.masterPayer))].map((v) => [v, v])],
    ["group", "Payer group", [...new Set(allRows.map((r) => r.payerGroup))].map((v) => [v, v])],
    ["method", "Method", [...new Set(allRows.map((r) => r.method))].map((v) => [v, METHOD[v]])],
  ];
  const labelOf = (k, v) => (k === "method" ? METHOD[v] : v);
  const addFilter = (k, v) => { if (!filters.some((f) => f.k === k && f.v === v)) setFilters([...filters, { k, v }]); close(); };
  const drow = drawerRow ? allRows.find((r) => r.id === drawerRow) : null;
  const tcon = termsFor ? cmap[termsFor] : null;

  return (
    <div className="page fillpage">
      <div className="pagehead"><h1>Contracts</h1></div>

      <div className="thdr">
        <div className="tabs">
          <button className={view === "all" ? "on" : ""} onClick={() => setView("all")}>All ({contracts.length})</button>
          <button className={view === "expiring" ? "on" : ""} onClick={() => setView("expiring")}>Expiring ({contracts.filter(expiring).length})</button>
        </div>
        <div className="hact">
          <div className="popwrap" ref={qRef}>
            <button className={"tgl" + (pop === "search" || q ? " on" : "")} aria-label="Search contracts" aria-haspopup="dialog" aria-expanded={pop === "search"} onClick={() => setPop(pop === "search" ? null : "search")}><Search size={16} /></button>
            {pop === "search" && (
              <div className="pop searchpop" role="dialog" aria-label="Search contracts">
                <label className="sf wide"><input autoFocus placeholder="Search" aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && close()} /><Search size={16} /></label>
              </div>
            )}
          </div>
          <button className={"tgl" + (showFilters ? " on" : "")} aria-label="Filters" aria-pressed={showFilters} onClick={() => setShowFilters(!showFilters)}><ListFilter size={16} /></button>
          <button className="tgl" aria-label="Export contracts" onClick={() => toast("Exported contracts.csv")}><Download size={16} /></button>
          <div className="popwrap" ref={sRef}>
            <button className={"tgl" + (pop === "settings" ? " on" : "")} aria-label="Table configuration" aria-haspopup="dialog" aria-expanded={pop === "settings"} onClick={openSettings}><Settings size={16} /></button>
            {pop === "settings" && draft && (
              <div className="pop settings" role="dialog" aria-label="Table configuration">
                {pv === "root" && (
                  <>
                    <div className="cfg-s">
                      <div className="dprow"><span>Grouping</span><select className="fsel" aria-label="Grouping" value={groupBy} onChange={(e) => setGroupBy(e.target.value)}><option value="contract">Contract</option><option value="payer">Master payer</option><option value="none">None</option></select></div>
                    </div>
                    <div className="cfg-m">
                      <button className="mi" onClick={() => setPv("columns")}><span className="mi-t"><span>Columns</span><span className="mi-s">{vcols.length} of {COLS.length} shown</span></span><ChevronRight size={20} /></button>
                      <button className="mi" onClick={() => setPv("rules")}><span className="mi-t"><span>Rules</span><span className="mi-s">{rulesOn} of {rulesTotal} on</span></span><ChevronRight size={20} /></button>
                    </div>
                  </>
                )}
                {pv === "columns" && (
                  <>
                    <div className="cfg-h"><button className="icon" aria-label="Back" onClick={() => setPv("root")}><ChevronLeft size={18} /></button><span className="b">Columns</span></div>
                    <div className="cfg-b">{COLS.map(([k, l]) => <label key={k} className="crowc"><input type="checkbox" checked={cols[k]} disabled={cols[k] && vcols.length === 1} onChange={(e) => setCols({ ...cols, [k]: e.target.checked })} />{l}</label>)}</div>
                  </>
                )}
                {pv === "rules" && (
                  <>
                    <div className="cfg-h"><button className="icon" aria-label="Back" onClick={() => setPv("root")}><ChevronLeft size={18} /></button><span className="b">Rules</span></div>
                    <div className="cfg-b rules">
                      {DEFS.map((d) => (
                        <div key={d.k} className={"prow2" + (d.has ? "" : " dis")}>
                          <div><div>{d.label}</div><div className="sub2">{d.has ? d.sub : "No matching terms on file yet"}</div></div>
                          <Switch on={!!draft[d.k]} disabled={!d.has} label={d.label} onChange={(v) => setDraft({ ...draft, [d.k]: v })} />
                        </div>
                      ))}
                    </div>
                    {showHist && (
                      <div className="hist">{ruleLog.length ? ruleLog.map((h, i) => <div key={i}><span className="muted">{h.d}</span><span>{h.t}</span></div>) : <span className="muted">No changes yet</span>}</div>
                    )}
                    <div className="pfoot"><button className="link" onClick={() => setShowHist(!showHist)}>{showHist ? "Hide history" : "View history"}</button>
                      <button className="btn primary" disabled={!dirty} onClick={saveSettings}>Save</button></div>
                  </>
                )}
              </div>
            )}
          </div>
          <AddContractButton onAdd={() => onUpload("pdf")} onImport={() => onUpload("csv")} />
        </div>
      </div>

      {showFilters && (
        <div className="frow">
          <div className="popwrap" ref={fRef}>
            <button className="btn" aria-haspopup="menu" aria-expanded={pop === "filter"} onClick={() => setPop(pop === "filter" ? null : "filter")}><Plus size={14} />Filter</button>
            {pop === "filter" && (
              <div className="menu fmenu" role="menu">
                {filterOpts.map(([k, l, vals]) => (
                  <div key={k}><div className="menu-h">{l}</div>
                    {vals.map(([v, vl]) => <button key={v} role="menuitem" className="menu-i" onClick={() => addFilter(k, v)}>{vl}</button>)}</div>
                ))}
              </div>
            )}
          </div>
          <div className="grow row gap wrap">{filters.map((f) => <span key={f.k + f.v} className="fchip">{labelOf(f.k, f.v)}<button aria-label={"Remove filter " + labelOf(f.k, f.v)} onClick={() => setFilters(filters.filter((x) => x !== f))}><X size={12} /></button></span>)}</div>
          <button className="btn tert" onClick={() => setShowFilters(false)}><ChevronUp size={14} />Hide</button>
        </div>
      )}

      <div className="tblwrap fill">
        <table className="gtbl">
          <thead><tr>{vcols.map(([k, l]) => <th key={k} className={RIGHT[k] ? "r" : ""}>{l}</th>)}</tr></thead>
          <tbody>
            {groups.map((g) => (
              <React.Fragment key={g.key}>
                {g.name != null && (
                  <tr className="grow2"><td colSpan={vcols.length}>
                    <div className="ginner">
                      <button className="gcol" aria-label={collapsed[g.key] ? "Expand group" : "Collapse group"} aria-expanded={!collapsed[g.key]} onClick={() => setCollapsed({ ...collapsed, [g.key]: !collapsed[g.key] })}>{collapsed[g.key] ? <ChevronDown size={18} /> : <ChevronUp size={18} />}</button>
                      <span className="gname">{g.name}</span>
                      <span className="ginfo">{g.contract ? `${g.contract.masterPayer}, ${fmtDate(g.contract.effectiveStart)} to ${fmtDate(g.contract.effectiveEnd)}, ${g.rows.length} rates` : `${g.rows.length} rates`}</span>
                      {g.contract && (
                        <span className="gact">
                          <button className="gbtn" aria-label={"Open " + g.contract.file} title={g.contract.file} onClick={() => openDoc(g.contract.id, null)}><FileText size={14} /></button>
                          <button className="gbtn" aria-label={"Terms for " + g.name} title="Contract terms" onClick={() => { setDrawerRow(null); setTermsFor(g.contract.id); }}><ListChecks size={14} /></button>
                        </span>
                      )}
                    </div>
                  </td></tr>
                )}
                {!collapsed[g.key] && g.rows.map((r) => (
                  <tr key={r.id} className={"drow clickrow" + (drawerRow === r.id ? " active" : "")} onClick={() => { setTermsFor(null); setDrawerRow(r.id); }} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setDrawerRow(r.id)}>
                    {vcols.map(([k]) => <td key={k} className={RIGHT[k] ? "r" : ""}>{CELLS[k](r, cmap[r.contractId], ruleOn)}</td>)}
                  </tr>
                ))}
              </React.Fragment>
            ))}
            {!rows.length && <tr><td colSpan={vcols.length} className="empty">No contracts match these filters.</td></tr>}
          </tbody>
        </table>
      </div>

      {drow && <ExpectedDrawer row={drow} contract={cmap[drow.contractId]} ruleOn={ruleOn} setRuleOn={setRuleOn} onClose={() => setDrawerRow(null)} openDoc={openDoc} claims={claims} />}
      {tcon && <TermsDrawer contract={tcon} ruleOn={ruleOn} createdTerms={createdTerms} onClose={() => setTermsFor(null)} openDoc={openDoc} />}
    </div>
  );
}

function TermsDrawer({ contract, ruleOn, createdTerms, onClose, openDoc }) {
  return (
    <div className="drawer" role="dialog" aria-label="Contract terms">
      <div className="drawer-head"><div><div className="crumb">Contract terms</div><div className="h2">{contract.number}</div><div className="muted">{contract.masterPayer}</div></div><button className="icon" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
      <div className="drawer-body">
        {contract.terms.map((t) => {
          const active = t.ruleKey ? !!ruleOn[contract.id + ":" + t.ruleKey] : !!createdTerms[t.id];
          return (
            <div key={t.id} className="term">
              <div className="term-top"><Chip tone="grey">{t.category}</Chip><span className="b">Section {t.section}</span><span className="grow" />{active ? <Chip tone="moss"><Check size={12} />Rule on</Chip> : <Chip tone="grey">Rule off</Chip>}</div>
              <div>{t.summary}</div>
              <div className="muted small mt4">When: {t.when}. Then: {t.then}.</div>
              {t.source && contract.id === "cascadia" && <button className="link" onClick={() => openDoc(contract.id, t.source)}>View in contract</button>}
            </div>
          );
        })}
        <div className="note"><Info size={14} /><span>Rules are managed in the table settings, behind the gear icon above the contracts table.</span></div>
      </div>
    </div>
  );
}

function ExpectedDrawer({ row, contract, ruleOn, setRuleOn, onClose, openDoc, claims }) {
  const [year, setYear] = useState("2026-08-14");
  const [cq, setCq] = useState(false);
  const r = calcUnit(row, contract, year, ruleOn, cq);
  const used = claims.filter((c) => c.contractId === contract.id && c.planKey && row.plan.toLowerCase().includes(c.planKey));
  const under = used.filter((c) => c.status === "underpaid");
  return (
    <div className="drawer" role="dialog" aria-label="Expected allowed calculation">
      <div className="drawer-head"><div><div className="crumb">Expected allowed</div><div className="h2">{row.plan}, {row.cpt === "All PT codes" ? "all PT codes" : "CPT " + row.cpt}</div>
        <div className="muted">{row.payer}. {row.cpt !== "All PT codes" && CPT[row.cpt]}</div></div><button className="icon" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
      <div className="drawer-body">
        <div className="whatif">
          <div><div className="k">Date of service</div>
            <div className="seg"><button className={year < "2026" ? "on" : ""} onClick={() => setYear("2025-08-14")}>2025</button><button className={year >= "2026" ? "on" : ""} onClick={() => setYear("2026-08-14")}>2026</button></div></div>
          <div><div className="k">Delivered by</div>
            <div className="seg"><button className={!cq ? "on" : ""} onClick={() => setCq(false)}>PT</button><button className={cq ? "on" : ""} onClick={() => setCq(true)}>PTA (CQ)</button></div></div>
        </div>
        <div className="chain">
          {r.steps.map((s, i) => (
            <div key={i} className={"node" + (s.rule ? " rule" : "") + (s.rule && !s.active ? " off" : "")}>
              <div className="node-main"><div className="b">{s.label}</div><div className="muted">{s.note}</div></div>
              {s.rule && <Chip tone={s.active ? "moss" : "grey"}>{s.active ? "Rule on" : "Rule off"}</Chip>}
              <div className="node-v">{fmt(s.value)}</div>
            </div>
          ))}
          <div className="node total"><div className="node-main"><div className="b">Expected allowed</div><div className="muted">{row.method === "per_visit" ? "Per visit" : "Per unit"}</div></div><div className="node-v">{fmt(r.amount)}</div></div>
        </div>
        <div className="note"><Info size={14} /><span>Each step is a rule that runs when a payment posts. Rules are managed in the table settings, behind the gear icon above the contracts table.</span></div>
        <div className="impact">
          <div><div className="kv">{used.length}</div><div className="kl">claims use this plan</div></div>
          <div><div className="kv">{under.length}</div><div className="kl">underpaid against it</div></div>
          <div><div className="kv">{fmt(under.reduce((s, c) => s + c.variance, 0))}</div><div className="kl">variance found</div></div>
        </div>
        {row.source && contract.id === "cascadia" && <button className="btn" onClick={() => openDoc(contract.id, row.source)}><FileText size={14} />Show source in contract</button>}
      </div>
    </div>
  );
}

function DocModal({ doc, contracts, onClose }) {
  const c = contracts.find((x) => x.id === doc.id);
  const marks = doc.hl ? computeMarks(CONTRACT_TEXT, [doc.hl]) : [];
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-card doc">
        <div className="modal-head"><div><div className="h2">{c ? c.file : "Contract"}</div><div className="muted">{c ? c.masterPayer : ""}</div></div><button className="icon" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
        <div className="docbody">
          {doc.id === "cascadia" ? <DocPane text={CONTRACT_TEXT} marks={marks} activeIdx={0} title={c ? c.file : ""} /> :
            <div className="paper pdfcard"><FileText size={28} /><div className="b">{c ? c.file : ""}</div><div className="muted">The stored PDF opens here in the product. This prototype includes the full viewer for the Cascadia agreement only.</div></div>}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Claims
   ============================================================ */
const statusChip = (d) => {
  if (d.appeal) return <Chip tone={d.appeal.status === "Won" ? "moss" : d.appeal.status === "Denied" ? "rust" : "navy"}>{d.appeal.status === "Submitted" ? "Appeal submitted" : d.appeal.status === "Won" ? "Recovered" : "Appeal denied"}</Chip>;
  if (d.status === "no_contract") return <Chip tone="grey">No contract on file</Chip>;
  if (d.status === "underpaid") return <Chip tone="rust">Underpaid</Chip>;
  return <Chip tone="grey">Paid as expected</Chip>;
};

function ClaimsPage({ claims, view, setView, sel, setSel, openClaim, setOpenClaim, startAppeal, loaded, goLoad }) {
  const underpaid = claims.filter((c) => c.status === "underpaid");
  const appealed = claims.filter((c) => c.appeal);
  const noContract = claims.filter((c) => c.status === "no_contract");
  let list = view === "all" ? [...claims].sort((a, b) => (a.dos < b.dos ? 1 : -1)) : view === "appealed" ? appealed : [...underpaid].sort((a, b) => b.recover - a.recover || b.variance - a.variance);
  const shown = list.slice(0, 60);
  const closing = underpaid.filter((c) => !c.appeal && c.daysLeft >= 0 && c.daysLeft <= 30);
  const eligible = underpaid.filter((c) => !c.appeal && c.daysLeft >= 0);
  const toggle = (id) => setSel(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]);
  const selectable = shown.filter((c) => !c.appeal && c.daysLeft >= 0);
  const allOn = selectable.length > 0 && selectable.every((c) => sel.includes(c.id));
  const someOn = selectable.some((c) => sel.includes(c.id));
  const toggleAll = () => setSel(allOn ? sel.filter((id) => !selectable.some((c) => c.id === id)) : [...new Set([...sel, ...selectable.map((c) => c.id)])]);
  const high = eligible.filter((c) => c.level === "High");

  return (
    <div className="page">
      <div className="pagehead"><div><div className="crumb">Revenue cycle</div><h1>Claims</h1></div></div>
      {!loaded && noContract.length > 0 && (
        <div className="banner amber"><AlertTriangle size={16} /><span><b>{noContract.length} Cascadia claims</b> have no contract on file, so expected allowed cannot be calculated and underpayments are invisible.</span><button className="btn" onClick={goLoad}>Load the contract</button></div>
      )}
      <div className="tabs page-tabs">
        <button className={view === "all" ? "on" : ""} onClick={() => setView("all")}>All claims <span className="cnt">{claims.length}</span></button>
        <button className={view === "underpaid" ? "on" : ""} onClick={() => setView("underpaid")}>Underpaid <Chip tone="grey">Custom view</Chip> <span className="cnt">{underpaid.length}</span></button>
        <button className={view === "appealed" ? "on" : ""} onClick={() => setView("appealed")}>Appealed <span className="cnt">{appealed.length}</span></button>
      </div>
      {view === "underpaid" && (
        <div className="summary">
          <div><div className="kv">{fmt(underpaid.reduce((s, c) => s + c.variance, 0))}</div><div className="kl">underpaid across {underpaid.length} claims</div></div>
          <div><div className="kv">{fmt(eligible.reduce((s, c) => s + c.recover, 0))}</div><div className="kl">expected recovery, open windows</div></div>
          <div><div className="kv">{closing.length}</div><div className="kl">appeal windows close within 30 days ({fmt(closing.reduce((s, c) => s + c.variance, 0))})</div></div>
          <div className="grow" />
          <div className="row gap">
            <button className="btn" disabled={!high.length} onClick={() => setSel(high.map((c) => c.id))}>Select high recoverability ({high.length})</button>
            <button className="btn primary" disabled={!sel.length} onClick={() => startAppeal(sel)}><Send size={14} />Appeal {sel.length || ""} selected</button>
          </div>
        </div>
      )}
      <div className="tblwrap tall">
        <table className="tbl claims">
          <thead><tr>{view === "underpaid" && <th><input type="checkbox" aria-label="Select all claims with an open appeal window" title="Select all claims that can still be appealed" ref={(el) => { if (el) el.indeterminate = someOn && !allOn; }} checked={allOn} disabled={!selectable.length} onChange={toggleAll} /></th>}<th>Claim</th><th>Service date</th><th>Facility</th><th>Payer and plan</th><th className="r">Billed</th><th className="r">Expected</th><th className="r">Paid (835)</th><th className="r">Variance</th><th>Recoverability</th><th>Appeal by</th><th>Status</th></tr></thead>
          <tbody>
            {shown.map((c) => (
              <tr key={c.id} className="clickrow" onClick={() => setOpenClaim(c.id)} tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setOpenClaim(c.id)}>
                {view === "underpaid" && <td onClick={(e) => e.stopPropagation()}><input type="checkbox" aria-label={"Select " + c.id} disabled={!!c.appeal || c.daysLeft < 0} checked={sel.includes(c.id)} onChange={() => toggle(c.id)} /></td>}
                <td className="b nowrap">{c.id}</td><td className="nowrap">{fmtDate(c.dos)}</td><td>{c.facility}, {c.state}</td><td>{c.master}<span className="sub">{c.plan}</span></td>
                <td className="r">{fmt(c.billed)}</td><td className="r">{c.expected == null ? <span className="muted">n/a</span> : fmt(c.expected)}</td><td className="r">{fmt(c.paid)}</td>
                <td className={"r b" + (c.variance ? " neg" : "")}>{c.variance ? "-" + fmt(c.variance) : c.status === "no_contract" ? "" : fmt(0)}</td>
                <td>{c.status === "underpaid" ? <span><Chip tone={levelTone[c.level]}>{c.level}</Chip><span className="sub">{c.level === "Closed" ? "Window closed" : "Expect " + fmt(c.recover)}</span></span> : ""}</td>
                <td className="nowrap">{c.status === "underpaid" ? <span className={c.daysLeft < 0 ? "neg" : c.daysLeft <= 30 ? "warn" : ""}>{c.daysLeft < 0 ? "Closed" : c.daysLeft + " days"}</span> : ""}</td>
                <td>{statusChip(c)}</td>
              </tr>
            ))}
            {shown.length === 0 && <tr><td colSpan={12} className="empty">{view === "appealed" ? "No appeals yet. Select underpaid claims and choose Appeal." : "Nothing here."}</td></tr>}
          </tbody>
        </table>
        {list.length > shown.length && <div className="muted pad">Showing the first {shown.length} of {list.length} claims.</div>}
      </div>
    </div>
  );
}

function ClaimFlyout({ d, onClose, startAppeal, openDoc }) {
  const term = d.contract ? (d.pattern === "escalator" ? d.contract.terms.find((t) => t.ruleKey === "escalator") : d.pattern === "pta" ? d.contract.terms.find((t) => t.ruleKey === "pta") : d.contract.terms.find((t) => t.category === "Appeals")) : null;
  return (
    <div className="drawer wide" role="dialog" aria-label="Claim detail">
      <div className="drawer-head"><div><div className="crumb">Claim</div><div className="h2">{d.id}</div><div className="muted">Patient {d.pid} ({d.patient}). {d.apptType}, {d.facility} {d.state}. Service date {fmtDate(d.dos)}.</div></div><button className="icon" onClick={onClose} aria-label="Close"><X size={18} /></button></div>
      <div className="drawer-body">
        <div className="row gap wrap">{statusChip(d)}<span className="muted">{d.master}, {d.plan}</span>{d.status === "underpaid" && <Chip tone={levelTone[d.level]}>{d.level} recoverability</Chip>}</div>
        <div className="facts">
          <div><div className="k">Billed</div><div className="v">{fmt(d.billed)}</div></div>
          <div><div className="k">Expected allowed</div><div className="v">{d.expected == null ? "n/a" : fmt(d.expected)}</div></div>
          <div><div className="k">Paid on 835</div><div className="v">{fmt(d.paid)}</div></div>
          <div><div className="k">Variance</div><div className={"v" + (d.variance ? " neg" : "")}>{d.variance ? "-" + fmt(d.variance) : fmt(0)}</div></div>
        </div>
        <table className="tbl compact"><thead><tr><th>CPT</th><th>Service</th><th className="r">Units</th><th className="r">Expected</th><th className="r">Paid</th><th className="r">Variance</th></tr></thead>
          <tbody>{d.lines.map((l, i) => { const e = d.lineExp[i]; const v = e == null ? null : r2(e - l.paid); return (
            <tr key={i}><td className="b">{l.cpt}{l.cq ? <Chip tone="grey">CQ</Chip> : null}</td><td>{CPT[l.cpt]}</td><td className="r">{l.units}</td><td className="r">{e == null ? "n/a" : fmt(e)}</td><td className="r">{fmt(l.paid)}</td><td className={"r" + (v > 0.005 ? " neg b" : "")}>{v == null ? "" : v > 0.005 ? "-" + fmt(v) : fmt(0)}</td></tr>); })}</tbody></table>
        {d.status === "underpaid" && (
          <div className="why"><div className="b">Why this was flagged</div><div>{d.reason}</div><div className="muted">835 adjustment {PATTERN[d.pattern] ? PATTERN[d.pattern].carc : "CO-45"} on remittance {d.remitId}, posted {fmtDate(d.remitDate)}.</div></div>
        )}
        {d.contract && (
          <div className="ccard">
            <div className="row between"><div className="b">Contract on file</div>{d.contract.id === "cascadia" && <button className="link" onClick={() => openDoc(d.contract.id, term ? term.source : null)}>View contract</button>}</div>
            <div>{d.contract.masterPayer}, {d.plan}</div><div className="muted">Effective {fmtDate(d.contract.effectiveStart)} to {fmtDate(d.contract.effectiveEnd)}</div>
            {term && <div className="quote"><span className="b">Section {term.section}.</span> {term.summary}</div>}
          </div>
        )}
        {d.status === "underpaid" && <div className="muted">Appeal window closes {fmtDate(d.deadline)} ({d.daysLeft < 0 ? "closed" : d.daysLeft + " days left"}).</div>}
        <div className="row gap">
          {d.status === "underpaid" && !d.appeal && d.daysLeft >= 0 && <button className="btn primary" onClick={() => startAppeal([d.id])}><Send size={14} />Appeal underpayment</button>}
          {d.appeal && <Chip tone="navy">Appeal {d.appeal.id}, {d.appeal.status.toLowerCase()}</Chip>}
        </div>
      </div>
    </div>
  );
}

/* ---------- appeal letters ---------- */
function letterTemplate(d) {
  const lines = d.lines.map((l, i) => { const e = d.lineExp[i]; return `  CPT ${l.cpt}, ${l.units} unit${l.units > 1 ? "s" : ""}: contracted ${fmt(e)}, paid ${fmt(l.paid)}`; }).join("\n");
  const basis = d.pattern === "escalator" ? `Section ${(d.contract.terms.find((t) => t.ruleKey === "escalator") || {}).section || "4.3"} of our agreement increases contracted rates by ${d.contract.escalatorPct}% effective ${fmtDate(d.contract.escalatorStart)}. The remittance reflects the prior year rate.`
    : d.pattern === "pta" ? "Our agreement pays services delivered by a physical therapist assistant at 100% of the contracted rate. The remittance reduced CQ lines to 85%."
    : "We request a policy review of the edit applied to CPT 97530, which our fee schedule lists as separately payable.";
  return `Re: Underpayment dispute, claim ${d.id}\nPatient ID ${d.pid}, service date ${fmtDate(d.dos)}, remittance ${d.remitId} dated ${fmtDate(d.remitDate)}\n\nTo the Provider Disputes Department, ${d.master}:\n\n${basis}\n\nThe claim was paid ${fmt(d.paid)} against a contracted amount of ${fmt(d.expected)}, a shortfall of ${fmt(d.variance)}.\n\nLine detail:\n${lines}\n\nPlease reprocess the claim at the contracted rate and remit the difference. Supporting documents are attached.\n\nRidgeline Physical Therapy Group, Revenue Cycle`;
}

const AP_STEPS = ["Setup", "Cover Letter", "Payer Form", "Review and submit"];
const mdy = (s) => (s ? s.slice(5, 7) + "/" + s.slice(8, 10) + "/" + s.slice(0, 4) : "");
const kindOf = (n) => (/\.pdf$/i.test(n) ? ["PDF", "rust"] : /\.xlsx?$/i.test(n) ? ["XLS", "moss"] : /\.docx?$/i.test(n) ? ["DOC", "navy"] : ["IMG", "navy"]);
const sizeOf = (s) => 48 + (String(s).split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 140);

function groupTemplate(g) {
  if (g.claims.length === 1) return letterTemplate(g.claims[0]);
  const c0 = g.claims[0];
  const basis = g.pattern === "escalator" ? `Our agreement increases contracted rates ${c0.contract.escalatorPct}% effective ${fmtDate(c0.contract.escalatorStart)}. The attached remittances reflect the prior year rate.`
    : g.pattern === "pta" ? "Our agreement pays services by a physical therapist assistant at 100% of the contracted rate. The attached remittances reduced CQ lines to 85%."
    : "We request a policy review of the edits listed in the attached worksheet.";
  return `Re: Underpayment dispute, ${g.claims.length} claims\n\nTo the Provider Disputes Department, ${g.master}:\n\n${basis}\n\nAn itemized worksheet lists each claim, remittance, contracted amount, paid amount, and shortfall. Total shortfall: ${fmt(r2(g.claims.reduce((s, c) => s + c.variance, 0)))}.\n\nPlease reprocess these claims at the contracted rate and remit the difference within 30 days. Supporting documents are attached.\n\nRidgeline Physical Therapy Group, Revenue Cycle`;
}

function AiBanner({ title, children }) {
  const [v, setV] = useState(null);
  return (
    <div className="aibanner">
      <Sparkles size={16} />
      <div className="grow"><div className="b">{title}</div>{children && <div className="muted small">{children}</div>}</div>
      <button className={"icon" + (v === "up" ? " sel" : "")} aria-label="Helpful" onClick={() => setV("up")}><ThumbsUp size={16} /></button>
      <button className={"icon" + (v === "down" ? " sel" : "")} aria-label="Not helpful" onClick={() => setV("down")}><ThumbsDown size={16} /></button>
    </div>
  );
}
function ACard({ title, right, children, startOpen = true }) {
  const [open, setOpen] = useState(startOpen);
  return (
    <section className="acard">
      <div className="acard-h">
        <button className="acard-t" aria-expanded={open} onClick={() => setOpen(!open)}>{title}<ChevronDown size={16} className={open ? "" : "flipc"} /></button>
        {right}
      </div>
      {open && <div className="acard-b">{children}</div>}
    </section>
  );
}
function Fld({ label, value, onChange, readOnly, wide, area }) {
  return (
    <label className={"fld" + (wide ? " wide" : "") + (readOnly ? " ro" : "")}>
      <span>{label}</span>
      {area ? <textarea value={value} readOnly={readOnly} onChange={(e) => onChange && onChange(e.target.value)} rows={3} /> : <input value={value} readOnly={readOnly} onChange={(e) => onChange && onChange(e.target.value)} />}
    </label>
  );
}

function AppealPackageFlow({ ids, claims, onCancel, onSubmit, setAiHook, onViewAppeals }) {
  const all = ids.map((id) => claims.find((c) => c.id === id)).filter(Boolean);
  const bulk = all.length > 1;
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(null);
  const [menu, setMenu] = useState(false);
  const [skipped, setSkipped] = useState({});
  const [visited, setVisited] = useState({ 1: true });
  const [type, setType] = useState("full");
  const [off, setOff] = useState({});
  const [openRow, setOpenRow] = useState({});
  const [docOff, setDocOff] = useState({});
  const [extra, setExtra] = useState([]);
  const [docTab, setDocTab] = useState("All");
  const [gk, setGk] = useState(null);
  const [letters, setLetters] = useState({});
  const [forms, setForms] = useState({});
  const [zoom, setZoom] = useState(100);
  const [pv, setPv] = useState("Package");
  const [formType, setFormType] = useState("Provider payment dispute form");
  const menuRef = useRef(null);
  const fileRef = useRef(null);

  const items = all.filter((c) => !off[c.id]);
  const groups = useMemo(() => {
    const g = {};
    items.forEach((c) => { const k = c.master + "|" + c.pattern; (g[k] = g[k] || { key: k, master: c.master, pattern: c.pattern, claims: [] }).claims.push(c); });
    return Object.values(g);
  }, [items.map((c) => c.id).join()]);
  const active = groups.find((g) => g.key === gk) || groups[0];
  const sig = active ? active.claims.map((c) => c.id).join() : "";
  const disputed = r2(items.reduce((s, c) => s + c.variance, 0));
  const recover = r2(items.reduce((s, c) => s + c.recover, 0));
  const soonest = items.length ? [...items].sort((a, b) => a.daysLeft - b.daysLeft)[0] : null;

  const docs = useMemo(() => {
    const d = []; const seen = {};
    items.forEach((c) => {
      if (c.contract && !seen[c.contract.id]) { seen[c.contract.id] = 1; d.push({ id: "ct-" + c.contract.id, name: c.contract.file.replace(/\.pdf$/i, "") + "_excerpt.pdf", cat: "Contract", up: "11/16/2026", by: "Air", size: sizeOf(c.contract.id) + " KB", cid: c.contract.id }); }
    });
    items.forEach((c) => d.push({ id: "rm-" + c.id, name: c.remitId + "_" + c.id + ".pdf", cat: "Remittance", up: mdy(c.remitDate), by: "Remittance bot", size: sizeOf(c.id) + " KB", claim: c.id }));
    groups.forEach((g) => d.push({ id: "ws-" + g.key, name: "Variance_worksheet_" + g.master.split(" ")[0] + (g.pattern ? "_" + g.pattern : "") + ".xlsx", cat: "Worksheet", up: "11/16/2026", by: "Air", size: "18 KB" }));
    return [...d, ...extra];
  }, [items.map((c) => c.id).join(), extra.length]);
  const incl = (d) => !docOff[d.id];
  const chosen = docs.filter(incl);
  const checklist = [
    ["Claims selected", items.length > 0],
    ["Contract excerpt attached", items.length > 0 && items.every((c) => !c.contract || chosen.some((d) => d.cid === c.contract.id))],
    ["Remittance attached for every claim", items.length > 0 && items.every((c) => chosen.some((d) => d.claim === c.id))],
    ["Appeal window open", items.length > 0 && items.every((c) => c.daysLeft >= 0)],
  ];
  const doneCount = checklist.filter((x) => x[1]).length;

  const form = active ? (forms[active.key] && forms[active.key].sig === sig ? forms[active.key].v : null) : null;
  const termFor = (g) => { const c = g.claims[0]; return c.contract.terms.find((t) => t.ruleKey === (g.pattern === "escalator" ? "escalator" : g.pattern === "pta" ? "pta" : "__")) || c.contract.terms.find((t) => t.category === "Appeals"); };
  const defaults = (g) => {
    const cl = g.claims; const dos = cl.map((c) => c.dos).sort(); const rm = cl.map((c) => c.remitDate).sort(); const term = termFor(g);
    return {
      date: "11/16/2026", level: "First-level appeal", payer: g.master, plan: [...new Set(cl.map((c) => c.plan))].join(", "),
      provider: "Ridgeline Physical Therapy Group", tin: "12-3456789 / 1234567890", contact: "Appeals Team", phone: "(860) 555-0187", address: "100 Main Street, Suite 200, Hartford, CT 06103",
      claimIds: cl.length > 3 ? cl.slice(0, 3).map((c) => c.id).join(", ") + ` and ${cl.length - 3} more` : cl.map((c) => c.id).join(", "),
      claims: String(cl.length), service: mdy(dos[0]) + (dos.length > 1 ? " to " + mdy(dos[dos.length - 1]) : ""), remit: mdy(rm[0]) + (rm.length > 1 ? " to " + mdy(rm[rm.length - 1]) : ""),
      cpt: [...new Set(cl.flatMap((c) => c.lines.map((l) => l.cpt)))].join(", "), disputed: fmt(r2(cl.reduce((s, c) => s + c.variance, 0))),
      contractRef: (cl[0].contract.file) + (term ? ", Section " + term.section : ""), deadline: mdy(cl.map((c) => c.deadline).sort()[0]),
      why: PATTERN[g.pattern] ? PATTERN[g.pattern].short : "Underpaid", explain: cl[0].reason,
    };
  };
  const f = form || (active ? defaults(active) : {});
  const setF = (k, v) => active && setForms((p) => ({ ...p, [active.key]: { sig, v: { ...f, [k]: v } } }));

  const L = active ? letters[active.key] : null;
  const letterOk = L && L.sig === sig;
  async function draft(g, s) {
    setLetters((p) => ({ ...p, [g.key]: { sig: s, text: "", busy: true, live: null } }));
    const base = groupTemplate(g);
    let text = base, live = false;
    try {
      const out = await callClaude("You write concise, professional payer appeal letters for physical therapy underpayments. Plain text, under 190 words, no markdown, no bullet symbols. Keep the Re: line and the sign-off. Do not invent facts.", "Rewrite this appeal letter so it is polished and firm while keeping every number and fact exactly as given:\n\n" + base);
      if (out && out.length > 150) { text = out.trim(); live = true; }
    } catch (e) { /* keep template */ }
    setLetters((p) => (p[g.key] && p[g.key].sig === s ? { ...p, [g.key]: { sig: s, text, busy: false, live } } : p));
  }
  useEffect(() => { if (step === 2 && active && !letterOk) draft(active, sig); }, [step, sig, active && active.key]);

  useEffect(() => {
    if (!menu) return;
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    const k = (e) => { if (e.key === "Escape") setMenu(false); };
    document.addEventListener("mousedown", h); document.addEventListener("keydown", k);
    return () => { document.removeEventListener("mousedown", h); document.removeEventListener("keydown", k); };
  }, [menu]);

  useEffect(() => {
    setAiHook({
      context: `The user is building an appeal package for ${items.length} underpaid claim${items.length > 1 ? "s" : ""} (step ${step} of 4: ${AP_STEPS[step - 1]}). Total disputed ${fmt(disputed)}, expected recovery ${fmt(recover)}. Earliest deadline ${soonest ? mdy(soonest.deadline) + " (" + soonest.daysLeft + " days left)" : "n/a"}. Groups: ${groups.map((g) => `${g.master}, ${PATTERN[g.pattern] ? PATTERN[g.pattern].short : "Underpaid"}, ${g.claims.length} claims, ${fmt(r2(g.claims.reduce((s, c) => s + c.variance, 0)))}`).join(" | ")}. Reasons: ${[...new Set(items.map((c) => c.reason))].join(" ")} Documents included: ${chosen.map((d) => d.name).join(", ")}. Checklist: ${checklist.map((x) => x[0] + (x[1] ? " done" : " open")).join("; ")}. The packet has a cover letter, a payer dispute form, the contract excerpt, the 835 remittances and an itemized worksheet. After submission the payer has 30 days to respond.`,
      prompts: [{ q: "Which documents should I send?" }, { q: "Why this submission?" }, { q: "What happens after I submit?" }],
    });
  }, [items.length, step, chosen.length, disputed]);

  const next = () => { const n = Math.min(4, step + 1); setStep(n); setVisited({ ...visited, [n]: true }); };
  const status = (i) => (skipped[i] ? "Skipped" : i < step ? "Complete" : i === step ? "In progress" : visited[i] ? "In progress" : "Pending");
  const canNext = step === 1 ? items.length > 0 && doneCount >= 1 : step === 2 ? letterOk && !L.busy : true;
  const submit = () => {
    const batch = "APL-" + (4100 + Math.floor(Math.random() * 800));
    onSubmit(items.map((c) => c.id), batch, bulk);
    setDone({ batch, n: items.length, amt: disputed });
  };
  const addFiles = (list) => {
    const arr = [...list].map((f, i) => ({ id: "x-" + Date.now() + "-" + i, name: f.name, cat: "Other", up: "11/16/2026", by: "You", size: Math.max(1, Math.round(f.size / 1024)) + " KB" }));
    if (arr.length) setExtra((p) => [...p, ...arr]);
  };

  const topCrumb = bulk ? "Underpaid" : all[0] ? all[0].id : "Claims";
  const cats = ["All", "Contract", "Remittance", "Worksheet", "Other"];
  const shownDocs = docs.filter((d) => docTab === "All" || d.cat === docTab);
  const allShownOn = shownDocs.length > 0 && shownDocs.every(incl);
  const pillSel = groups.length > 1 && (
    <select className="pillsel" aria-label="Packet" value={active ? active.key : ""} onChange={(e) => setGk(e.target.value)}>
      {groups.map((g) => <option key={g.key} value={g.key}>{g.master}, {PATTERN[g.pattern] ? PATTERN[g.pattern].short : "Underpaid"} ({g.claims.length})</option>)}
    </select>
  );

  if (done) return (
    <div className="flowwrap">
      <div className="fhead"><div className="fbc"><span className="bc-link">{topCrumb}</span><span className="bc-sep">/</span><span className="bc-cur">Create Appeal Package</span></div></div>
      <div className="emptyfull">
        <div className="emptyicon ok"><CheckCircle2 size={30} /></div>
        <div className="h2">{done.n > 1 ? `${done.n} appeals submitted` : "Appeal submitted"}</div>
        <p className="muted emptycopy">Batch {done.batch}. {fmt(done.amt)} in dispute. The payer has 30 days to respond, and each claim keeps its own deadline and status.</p>
        <div className="row gap"><button className="btn" onClick={onCancel}>Back to claims</button><button className="btn primary" onClick={onViewAppeals}>View appeals</button></div>
      </div>
    </div>
  );

  return (
    <div className="flowwrap">
      <div className="fhead">
        <div className="fbc"><span className="bc-link">{topCrumb}</span><span className="bc-sep">/</span><span className="bc-cur">Create Appeal Package</span></div>
        <div className="fhead-r">
          <div className="stepwrap" ref={menuRef}>
            <button className="stepbtn" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>{step} of 4: {AP_STEPS[step - 1]}<ChevronDown size={14} /></button>
            {menu && (
              <div className="menu stepmenu" role="menu">
                {AP_STEPS.map((n, i) => (
                  <button key={n} role="menuitem" className={"step-i" + (step === i + 1 ? " on" : "")} disabled={i + 1 > step && !visited[i + 1]} onClick={() => { setStep(i + 1); setMenu(false); }}>
                    <span className="stepnum">{i + 1}</span><span><span className="b">{n}</span><span className="sub">{status(i + 1)}</span></span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="vdiv" />
          <button className="cancel" onClick={onCancel}>Cancel</button>
          {(step === 2 || step === 3) && <button className="btn outline" onClick={() => { setSkipped({ ...skipped, [step]: true }); next(); }}>Skip<SkipForward size={14} /></button>}
          {step < 4 ? <button className="btn primary" disabled={!canNext} onClick={next}>Continue<ArrowRight size={14} /></button>
            : <button className="btn primary" disabled={!items.length || doneCount < 4} onClick={submit}><Send size={14} />Submit {items.length > 1 ? items.length + " appeals" : "appeal"}</button>}
        </div>
      </div>

      {step === 1 && (
        <div className="flowbody"><div className="apcol">
          <AiBanner title="Pick the documents to send">
            Appealing <b>{items.length} of {all.length}</b> {all.length > 1 ? "claims" : "claim"} | Disputed <b>{fmt(disputed)}</b> | Documents <b>{chosen.length} selected</b> | Checklist <b>{doneCount} of 4</b> | Deadline <b>{soonest ? mdy(soonest.deadline) + " (" + soonest.daysLeft + " days)" : "n/a"}</b>
          </AiBanner>

          <ACard title="Type of appeal">
            <div className="radios">
              <label><input type="radio" name="aptype" checked={type === "full"} onChange={() => setType("full")} /><span>Full appeal packet <span className="muted">(Letter, form, documents)</span></span></label>
              <label><input type="radio" name="aptype" checked={type === "docs"} onChange={() => setType("docs")} /><span>Documents only <span className="muted">(No letter, no form)</span></span></label>
            </div>
          </ACard>

          {active && (
            <ACard title={bulk ? "Remittances you are appealing" : "Remittance you are appealing"} right={pillSel}>
              <div className="kv2">
                {[["Status", "Underpaid"], ["Index", "Primary"], ["Payer", active.master], ["Plan", f.plan], ["Reason", f.why], ["Claims", f.claims], ["Remit date", f.remit], ["Service date", f.service], ["Disputed", f.disputed], ["Appeal deadline", `${f.deadline} (${Math.min(...active.claims.map((c) => c.daysLeft))} days left)`], ["Contract", f.contractRef], ["Method", "Payer portal (simulated)"]].map(([k, v]) => <React.Fragment key={k}><span className="k2">{k}</span><span className="v2">{v}</span></React.Fragment>)}
                <span className="k2 span">Reason detail</span><span className="v2 span">{active.claims[0].reason}</span>
              </div>
            </ACard>
          )}

          <ACard title={bulk ? "Claims on this appeal" : "Procedures on this claim"} right={<span className="pillnote">{bulk ? "One packet per payer and reason (recommended)" : "One packet for this claim"}</span>}>
            <div className="plist">
              {all.map((c) => (
                <div key={c.id}>
                  <div className="prow">
                    <button className="icon" aria-label={openRow[c.id] ? "Collapse" : "Expand"} onClick={() => setOpenRow({ ...openRow, [c.id]: !openRow[c.id] })}>{openRow[c.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button>
                    <input type="checkbox" aria-label={"Include " + c.id} checked={!off[c.id]} onChange={(e) => setOff({ ...off, [c.id]: !e.target.checked })} />
                    <span className="pname">{c.id} <span className="muted">{c.plan}, {c.facility}</span></span>
                    <span className="grow" />
                    <Chip tone="grey">{PATTERN[c.pattern] ? PATTERN[c.pattern].short : "Underpaid"}</Chip>
                    {[...new Set(c.lines.map((l) => l.cpt))].slice(0, 3).map((x) => <span key={x} className="cpt">{x}</span>)}
                    <span className="cpt wide">{fmt(c.variance)} at stake</span>
                  </div>
                  {openRow[c.id] && (
                    <div className="pexp"><table className="tbl compact"><thead><tr><th>CPT</th><th className="r">Units</th><th className="r">Contracted</th><th className="r">Paid</th><th className="r">Shortfall</th></tr></thead>
                      <tbody>{c.lines.map((l, i) => { const e = c.lineExp[i]; const v = e == null ? 0 : r2(e - l.paid); return <tr key={i}><td className="b">{l.cpt}</td><td className="r">{l.units}</td><td className="r">{fmt(e || 0)}</td><td className="r">{fmt(l.paid)}</td><td className={"r" + (v > 0.005 ? " neg" : "")}>{v > 0.005 ? fmt(v) : fmt(0)}</td></tr>; })}</tbody></table></div>
                  )}
                </div>
              ))}
            </div>
          </ACard>

          <ACard title="Documentation">
            <div className="dz" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}>
              <span className="dzi"><Upload size={16} /></span>drop files here or <button className="link" onClick={() => fileRef.current.click()}>Browse Files</button>
              <input ref={fileRef} type="file" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
            </div>
            <div className="tabs doctabs">{cats.map((c) => <button key={c} className={docTab === c ? "on" : ""} onClick={() => setDocTab(c)}>{c}</button>)}</div>
            <div className="tblwrap"><table className="tbl">
              <thead><tr><th style={{ width: 36 }}><input type="checkbox" aria-label="Select all documents" checked={allShownOn} onChange={() => { const n = { ...docOff }; shownDocs.forEach((d) => { if (allShownOn) n[d.id] = true; else delete n[d.id]; }); setDocOff(n); }} /></th><th>File</th><th>Category</th><th className="r">Uploaded</th><th>Uploaded by</th><th className="r">Size</th></tr></thead>
              <tbody>{shownDocs.map((d) => { const [k, tone] = kindOf(d.name); return (
                <tr key={d.id}><td><input type="checkbox" aria-label={"Include " + d.name} checked={incl(d)} onChange={(e) => setDocOff({ ...docOff, [d.id]: !e.target.checked })} /></td>
                  <td><Chip tone={tone}>{k}</Chip> <span className="doclink">{d.name}</span></td><td>{d.cat}</td><td className="r">{d.up}</td><td>{d.by}</td><td className="r">{d.size}</td></tr>); })}
                {!shownDocs.length && <tr><td colSpan={6} className="empty">No documents in this category.</td></tr>}</tbody></table></div>
          </ACard>
        </div></div>
      )}

      {(step === 2 || step === 3) && active && (
        <div className="fsplit even">
          <div className="apleft">
            {pillSel && <div className="packrow"><span className="muted">Packet</span>{pillSel}</div>}
            {step === 2 ? (
              <>
                <ACard title="Claim and appeal values">
                  <div className="fgrid">
                    <Fld label="Payer" value={f.payer} onChange={(v) => setF("payer", v)} />
                    <Fld label="Appeal level" value={f.level} onChange={(v) => setF("level", v)} />
                    <Fld label="Claims in this packet" value={f.claims} readOnly />
                    <Fld label="Amount disputed" value={f.disputed} readOnly />
                    <Fld label="Service date(s)" value={f.service} onChange={(v) => setF("service", v)} />
                    <Fld label="Remit date(s)" value={f.remit} onChange={(v) => setF("remit", v)} />
                    <Fld label="Contract reference" value={f.contractRef} onChange={(v) => setF("contractRef", v)} wide />
                    <Fld label="Date" value={f.date} onChange={(v) => setF("date", v)} />
                    <Fld label="Appeal deadline" value={f.deadline} readOnly />
                  </div>
                </ACard>
                <ACard title="Document text">
                  <AiBanner title="Athelas AI suggested a cover letter based on the contract and the remittance variance" />
                  <label className="fld wide area"><span>Edit document content here</span>
                    <textarea value={letterOk ? L.text : ""} disabled={!letterOk || L.busy} placeholder={letterOk && L.busy ? "Claude is drafting the letter" : ""} onChange={(e) => setLetters((p) => ({ ...p, [active.key]: { ...p[active.key], text: e.target.value } }))} rows={14} /></label>
                  {letterOk && !L.busy && <div className="muted small">{L.live ? "Drafted by Claude from the claim and contract data." : "Drafted from a template because the live draft was unavailable."}</div>}
                </ACard>
              </>
            ) : (
              <ACard title="Payer form fields" right={<select className="pillsel" aria-label="Change payer form" value={formType} onChange={(e) => setFormType(e.target.value)}><option>Provider payment dispute form</option><option>Reconsideration request form</option></select>}>
                <AiBanner title="Athelas AI mapped these values. Click any box to edit it." />
                <div className="fgrid">
                  <Fld label="Today's date" value={f.date} onChange={(v) => setF("date", v)} />
                  <Fld label="Payer" value={f.payer} onChange={(v) => setF("payer", v)} />
                  <Fld label="Plan" value={f.plan} onChange={(v) => setF("plan", v)} />
                  <Fld label="Provider name" value={f.provider} onChange={(v) => setF("provider", v)} />
                  <Fld label="TIN / NPI" value={f.tin} onChange={(v) => setF("tin", v)} />
                  <Fld label="Contact name and title" value={f.contact} onChange={(v) => setF("contact", v)} />
                  <Fld label="Contact phone" value={f.phone} onChange={(v) => setF("phone", v)} />
                  <Fld label="Contact address" value={f.address} onChange={(v) => setF("address", v)} wide />
                  <Fld label="Claim ID(s)" value={f.claimIds} onChange={(v) => setF("claimIds", v)} wide />
                  <Fld label="Service date(s)" value={f.service} onChange={(v) => setF("service", v)} />
                  <Fld label="Remittance date(s)" value={f.remit} onChange={(v) => setF("remit", v)} />
                  <Fld label="CPT codes disputed" value={f.cpt} onChange={(v) => setF("cpt", v)} />
                  <Fld label="Amount in dispute" value={f.disputed} onChange={(v) => setF("disputed", v)} />
                  <Fld label="Contract reference" value={f.contractRef} onChange={(v) => setF("contractRef", v)} wide />
                  <Fld label="Explanation of your request" value={f.explain} onChange={(v) => setF("explain", v)} wide area />
                </div>
              </ACard>
            )}
          </div>
          <div className="apright">
            <div className="pvhead">
              <div className="tabs">{["Package", "Claim Details", "Documentation"].map((t) => <button key={t} className={pv === t ? "on" : ""} onClick={() => setPv(t)}>{t}</button>)}</div>
            </div>
            {pv === "Package" && (
              <div className="pvbar">
                <button className="icon" aria-label="Zoom out" onClick={() => setZoom(Math.max(70, zoom - 10))}><ZoomOut size={16} /></button><span className="zoomv">{zoom}%</span><button className="icon" aria-label="Zoom in" onClick={() => setZoom(Math.min(160, zoom + 10))}><ZoomIn size={16} /></button>
                <span className="grow" /><span className="muted">1 of 1</span>
              </div>
            )}
            <div className="pvscroll">
              {pv === "Package" && step === 2 && (
                <div className="apaper" style={{ fontSize: 12 * zoom / 100 }}>
                  <div className="lh"><b>{f.provider}</b><div>{f.address}</div><div>{f.phone}</div></div>
                  <div className="ltxt">{`Date: ${f.date}\nTo: ${f.payer}, Appeals / Provider Disputes\n\n`}{letterOk ? L.text : "Drafting the letter..."}</div>
                </div>
              )}
              {pv === "Package" && step === 3 && (
                <div className="apaper form" style={{ fontSize: 12 * zoom / 100 }}>
                  <div className="ftitle"><b>{f.payer}</b><div>{formType}</div><div className="muted">Completion of this form is mandatory. Attach the documents that support your request.</div></div>
                  <div className="pgrid">
                    {[["Today's date", f.date], ["Plan", f.plan], ["Provider name", f.provider], ["TIN / NPI", f.tin], ["Contact name and title", f.contact], ["Contact phone", f.phone], ["Contact address", f.address, 1], ["Claim ID(s)", f.claimIds, 1], ["Service date(s)", f.service], ["Remittance date(s)", f.remit], ["CPT codes disputed", f.cpt], ["Amount in dispute", f.disputed], ["Contract reference", f.contractRef, 1]].map(([k, v, w]) => <div key={k} className={"pc" + (w ? " w" : "")}><span>{k}</span>{v}</div>)}
                  </div>
                  <div className="pc w tall"><span>Explanation of your request</span>{f.explain}</div>
                  <div className="muted">Submit through the {f.payer} provider portal. Keep a copy for your records.</div>
                </div>
              )}
              {pv === "Claim Details" && (
                <div className="tblwrap"><table className="tbl compact"><thead><tr><th>Claim</th><th>Service date</th><th className="r">Contracted</th><th className="r">Paid</th><th className="r">Shortfall</th></tr></thead>
                  <tbody>{active.claims.map((c) => <tr key={c.id}><td className="b">{c.id}</td><td>{mdy(c.dos)}</td><td className="r">{fmt(c.expected)}</td><td className="r">{fmt(c.paid)}</td><td className="r neg">{fmt(c.variance)}</td></tr>)}</tbody></table></div>
              )}
              {pv === "Documentation" && (
                <div className="tblwrap"><table className="tbl compact"><thead><tr><th>File</th><th>Category</th></tr></thead>
                  <tbody>{chosen.map((d) => <tr key={d.id}><td><Chip tone={kindOf(d.name)[1]}>{kindOf(d.name)[0]}</Chip> {d.name}</td><td>{d.cat}</td></tr>)}</tbody></table></div>
              )}
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flowbody"><div className="apcol">
          <AiBanner title={doneCount === 4 ? "Everything is ready to submit" : "Finish the checklist before you submit"}>
            {items.length} {items.length > 1 ? "appeals" : "appeal"} | Disputed <b>{fmt(disputed)}</b> | Expected recovery <b>{fmt(recover)}</b> | Checklist <b>{doneCount} of 4</b>
          </AiBanner>
          <ACard title="Checklist">
            <div className="check">{checklist.map(([k, ok]) => <div key={k} className="crow2">{ok ? <CheckCircle2 size={16} className="okc" /> : <AlertTriangle size={16} className="warnc" />}<span>{k}</span></div>)}</div>
          </ACard>
          <ACard title="Package contents">
            <div className="tblwrap"><table className="tbl compact"><thead><tr><th>Packet</th><th className="r">Claims</th><th className="r">Disputed</th><th>Letter</th><th>Payer form</th><th className="r">Documents</th></tr></thead>
              <tbody>{groups.map((g) => { const lt = letters[g.key]; return (
                <tr key={g.key}><td className="b">{g.master}, {PATTERN[g.pattern] ? PATTERN[g.pattern].short : "Underpaid"}</td><td className="r">{g.claims.length}</td><td className="r">{fmt(r2(g.claims.reduce((s, c) => s + c.variance, 0)))}</td>
                  <td>{type === "docs" ? <Chip tone="grey">Not included</Chip> : skipped[2] ? <Chip tone="amber">Skipped</Chip> : lt ? <Chip tone="moss">Ready</Chip> : <Chip tone="grey">Template</Chip>}</td>
                  <td>{type === "docs" ? <Chip tone="grey">Not included</Chip> : skipped[3] ? <Chip tone="amber">Skipped</Chip> : <Chip tone="moss">Ready</Chip>}</td>
                  <td className="r">{chosen.filter((d) => !d.claim || g.claims.some((c) => c.id === d.claim)).length}</td></tr>); })}</tbody></table></div>
          </ACard>
          <ACard title="Submission">
            <div className="kv2">{[["Method", "Payer portal (simulated)"], ["Response due", "Within 30 days"], ["Earliest deadline", soonest ? mdy(soonest.deadline) + " (" + soonest.daysLeft + " days)" : "n/a"], ["Tracking", "Appeals page, per claim"]].map(([k, v]) => <React.Fragment key={k}><span className="k2">{k}</span><span className="v2">{v}</span></React.Fragment>)}</div>
          </ACard>
        </div></div>
      )}
    </div>
  );
}

/* ============================================================
   Appeals tracking
   ============================================================ */
function AppealsPage({ claims, respond }) {
  const list = claims.filter((c) => c.appeal).sort((a, b) => (a.appeal.on < b.appeal.on ? 1 : -1));
  const inDispute = list.filter((c) => c.appeal.status === "Submitted").reduce((s, c) => s + c.variance, 0);
  const won = list.filter((c) => c.appeal.status === "Won"), lost = list.filter((c) => c.appeal.status === "Denied");
  const rec = won.reduce((s, c) => s + c.variance, 0);
  return (
    <div className="page">
      <div className="pagehead"><div><div className="crumb">Revenue cycle</div><h1>Appeals</h1></div>
        <button className="btn" disabled={!list.some((c) => c.appeal.status === "Submitted")} onClick={respond}><Clock size={14} />Simulate payer responses</button></div>
      <div className="summary"><div><div className="kv">{list.length}</div><div className="kl">appeals filed</div></div><div><div className="kv">{fmt(inDispute)}</div><div className="kl">in dispute</div></div><div><div className="kv moss">{fmt(rec)}</div><div className="kl">recovered</div></div>
        <div><div className="kv">{won.length + lost.length ? Math.round((won.length / (won.length + lost.length)) * 100) + "%" : "n/a"}</div><div className="kl">win rate</div></div></div>
      <div className="tblwrap tall"><table className="tbl"><thead><tr><th>Appeal</th><th>Claim</th><th>Payer and plan</th><th>Reason</th><th>Filed</th><th>Response due</th><th className="r">In dispute</th><th>Status</th></tr></thead>
        <tbody>{list.map((c) => <tr key={c.id}><td className="b">{c.appeal.id}</td><td>{c.id}</td><td>{c.master}<span className="sub">{c.plan}</span></td><td>{PATTERN[c.pattern] ? PATTERN[c.pattern].short : "Underpaid"}</td><td className="nowrap">{fmtDate(c.appeal.on)}</td><td className="nowrap">{fmtDate(addDays(c.appeal.on, 30))}</td><td className="r">{fmt(c.variance)}</td><td>{statusChip(c)}</td></tr>)}
          {!list.length && <tr><td colSpan={8} className="empty">No appeals yet. Start from the Underpaid view on Claims.</td></tr>}</tbody></table></div>
    </div>
  );
}

/* ============================================================
   Analytics
   ============================================================ */
const BENCH = { "Cascadia Mutual Health": { lo: 2.8, med: 4.6, hi: 7.4 }, "Summit Care Alliance": { lo: 3.5, med: 5.9, hi: 9.2 }, "Keystone Health Partners": { lo: 5.0, med: 8.4, hi: 12.5 } };
const DIMS = { master: "Payer", facility: "Facility", group: "Payer group", apptType: "Appointment type" };
function AnalyticsPage({ claims, openFromAnalytics }) {
  const [dim, setDim] = useState("master");
  const [drill, setDrill] = useState(null);
  const base = claims.filter((c) => c.status !== "no_contract");
  const under = base.filter((c) => c.status === "underpaid");
  const groupBy = (arr, key) => { const m = {}; arr.forEach((c) => { const k = typeof key === "function" ? key(c) : c[key]; (m[k] = m[k] || []).push(c); }); return m; };
  const tot = groupBy(base, dim);
  const data = Object.entries(tot).map(([k, arr]) => ({ name: k, rate: r2((arr.filter((c) => c.status === "underpaid").length / arr.length) * 100), dollars: r2(arr.reduce((s, c) => s + c.variance, 0)), n: arr.length })).sort((a, b) => b.rate - a.rate);
  const overall = base.length ? (under.length / base.length) * 100 : 0;
  const avgVar = under.length ? under.reduce((s, c) => s + c.variance, 0) / under.length : 0;
  const perPct = 0.01 * 6750000 * avgVar;
  const drillClaims = drill ? base.filter((c) => c[dim] === drill) : [];
  const months = ["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"];
  const trend = months.map((m) => { const arr = drillClaims.filter((c) => c.remitDate.slice(0, 7) === m); return { m: new Date(m + "-15").toLocaleDateString("en-US", { month: "short" }), rate: arr.length ? r2((arr.filter((c) => c.status === "underpaid").length / arr.length) * 100) : null }; });
  const reasons = Object.entries(groupBy(drillClaims.filter((c) => c.status === "underpaid"), (c) => (PATTERN[c.pattern] ? PATTERN[c.pattern].short : "Other"))).map(([k, a]) => ({ k, n: a.length, d: r2(a.reduce((s, c) => s + c.variance, 0)) }));
  const payerRows = Object.entries(groupBy(base, "master")).map(([k, a]) => ({ k, rate: (a.filter((c) => c.status === "underpaid").length / a.length) * 100, b: BENCH[k] })).filter((x) => x.b);
  const maxScale = Math.max(40, ...payerRows.map((x) => x.rate + 5));

  if (!base.length) return <div className="page"><div className="pagehead"><div><div className="crumb">Revenue cycle</div><h1>Analytics</h1></div></div><div className="empty pad">Load a contract to see underpayment trends.</div></div>;
  return (
    <div className="page">
      <div className="pagehead"><div><div className="crumb">Revenue cycle</div><h1>Analytics</h1></div><Chip tone="grey">Illustrative sample data</Chip></div>
      <div className="summary">
        <div><div className="kv">{overall.toFixed(1)}%</div><div className="kl">of claims underpaid</div></div>
        <div><div className="kv">{fmt(under.reduce((s, c) => s + c.variance, 0))}</div><div className="kl">underpaid in this sample</div></div>
        <div><div className="kv">{fmt(avgVar)}</div><div className="kl">average per underpaid claim</div></div>
        <div className="scale"><div className="kv">{"$" + (perPct / 1e6).toFixed(2) + "M"}</div><div className="kl">per year for every 1% of claims underpaid by this average, at ATI volume of about 6.75M claims a year</div></div>
      </div>
      <div className="panel">
        <div className="row between"><div className="h3">Underpayment rate</div><div className="seg">{Object.entries(DIMS).map(([k, v]) => <button key={k} className={dim === k ? "on" : ""} onClick={() => { setDim(k); setDrill(null); }}>{v}</button>)}</div></div>
        <div className="muted">Share of claims paid below the contracted amount. Select a bar to drill in.</div>
        <div style={{ height: Math.max(180, data.length * 46 + 30) }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 30, right: 40, top: 10 }}>
              <CartesianGrid horizontal={false} stroke="rgba(0,0,0,0.08)" />
              <XAxis type="number" unit="%" tick={{ fontSize: 12, fill: "#737373" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" width={170} tick={{ fontSize: 12, fill: "#1f1f1f" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v, n, p) => [v + "% (" + fmt(p.payload.dollars) + " underpaid, " + p.payload.n + " claims)", "Rate"]} cursor={{ fill: "#f5f5f5" }} />
              <Bar dataKey="rate" radius={[0, 3, 3, 0]} onClick={(d) => setDrill(d.name === drill ? null : d.name)} cursor="pointer">
                {data.map((d) => <Cell key={d.name} fill={drill && drill !== d.name ? "#b9c3f8" : "#1132ee"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {drill && (
        <div className="panel">
          <div className="h3">{drill}</div>
          <div className="two">
            <div><div className="muted">Underpayment rate by remittance month</div>
              <div style={{ height: 190 }}><ResponsiveContainer width="100%" height="100%"><LineChart data={trend} margin={{ left: 0, right: 20, top: 10 }}><CartesianGrid stroke="rgba(0,0,0,0.08)" vertical={false} /><XAxis dataKey="m" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} /><YAxis unit="%" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={42} /><Tooltip formatter={(v) => [v + "%", "Rate"]} /><Line type="monotone" dataKey="rate" stroke="#1132ee" strokeWidth={2} dot={{ r: 3 }} connectNulls /></LineChart></ResponsiveContainer></div></div>
            <div><div className="muted">What is driving it</div>
              {reasons.map((r) => <div key={r.k} className="reason"><span>{r.k}</span><span className="b">{r.n} claims, {fmt(r.d)}</span></div>)}
              {!reasons.length && <div className="muted">No underpaid claims.</div>}
              <div className="b mt">Largest recoveries</div>
              {drillClaims.filter((c) => c.status === "underpaid").sort((a, b) => b.recover - a.recover).slice(0, 4).map((c) => <button key={c.id} className="linkrow" onClick={() => openFromAnalytics(c.id)}><span>{c.id}</span><span className="muted">{c.plan}</span><span className="neg b">-{fmt(c.variance)}</span></button>)}
            </div>
          </div>
        </div>
      )}
      <div className="panel">
        <div className="h3">How you compare with similar practices</div>
        <div className="muted">Underpayment rate by payer against outpatient PT groups of similar size. Benchmark values are illustrative. The shaded band is the middle half of the cohort.</div>
        <div className="cohort">
          {payerRows.map((x) => (
            <div key={x.k} className="crow"><div className="cname">{x.k}</div>
              <div className="ctrack"><div className="cband" style={{ left: (x.b.lo / maxScale) * 100 + "%", width: ((x.b.hi - x.b.lo) / maxScale) * 100 + "%" }} /><div className="cmed" style={{ left: (x.b.med / maxScale) * 100 + "%" }} /><div className={"cyou" + (x.rate > x.b.hi ? " hot" : "")} style={{ left: (x.rate / maxScale) * 100 + "%" }} /></div>
              <div className="cval"><span className="b">{x.rate.toFixed(1)}%</span><span className="muted"> vs {x.b.med}% median</span></div>
              <div className="cflag">{x.rate > x.b.hi ? <Chip tone="rust">{(x.rate / x.b.med).toFixed(1)}x the median</Chip> : x.rate > x.b.med ? <Chip tone="amber">Above median</Chip> : <Chip tone="moss">In line with peers</Chip>}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Connections and the Axiom answer
   ============================================================ */
function ConnectionsPage({ contracts, claims, createdTerms, ruleOn }) {
  const c = contracts.find((x) => x.id === "cascadia");
  const hmo = c && c.rows.find((r) => r.plan === "Select HMO");
  const authTerm = c && c.terms.find((t) => t.category === "Authorization");
  const stateTerm = c && c.terms.find((t) => t.category === "State");
  const under = claims.filter((x) => x.status === "underpaid" && x.contractId === "cascadia" && !x.appeal);
  const hmoAmt = c && hmo ? calcUnit(hmo, c, TODAY, ruleOn, false).amount : null;
  const st = (t) => (t && createdTerms[t.id] ? <Chip tone="moss"><Check size={12} />Rule active</Chip> : <Chip tone="grey">Suggested</Chip>);
  if (!c) return <div className="page"><div className="pagehead"><div><div className="crumb">Practice data</div><h1>Contract usage</h1></div></div><div className="empty pad">Load the Cascadia contract to see it feed the rest of the platform.</div></div>;
  return (
    <div className="page">
      <div className="pagehead"><div><div className="crumb">Practice data</div><h1>Contract usage</h1></div></div>
      <div className="muted lead">One contract, loaded once. Everything below reads from the same record, so nobody re-keys rates into a second system.</div>
      <div className="hub">
        <div className="hubcore"><FileText size={20} /><div className="b">{c.masterPayer}</div><div className="muted">{c.plans.length} plans, {c.rows.length} rate rows, {c.terms.length} terms</div></div>
        <div className="uses">
          <div className="use"><div className="b">Scheduling</div><div>Booking a Select HMO visit in Hartford shows the expected allowed amount before the patient arrives.</div><div className="stat">{hmoAmt != null ? fmt(hmoAmt) + " per visit" : ""}</div></div>
          <div className="use"><div className="b">Authorization</div><div>{authTerm ? authTerm.summary : "Visit limits and authorization triggers."}</div><div className="stat">{st(authTerm)}</div></div>
          <div className="use"><div className="b">Claim edits for state rules</div><div>{stateTerm ? stateTerm.summary : "State and license rules."}</div><div className="stat">{st(stateTerm)}</div></div>
          <div className="use"><div className="b">AR and appeals</div><div>Expected allowed prioritizes the AR worklist. The appeal deadline comes from the contract.</div><div className="stat">{under.length} open underpayments</div></div>
        </div>
      </div>
      <div className="h3 mt">Do ATI still need Syntellis Axiom and the billing calculators?</div>
      <div className="tblwrap"><table className="tbl answer"><thead><tr><th>Tool</th><th>What it does today</th><th>With the contract repository</th><th>Recommendation</th></tr></thead>
        <tbody>
          <tr><td className="b">Billing calculator</td><td>Clinicians pick CPT codes from treatment minutes.</td><td>Folds into the new EMR charge capture. Expected allowed comes from the repository.</td><td><Chip tone="rust">Retire</Chip></td></tr>
          <tr><td className="b">Excel Contract Grid and manual validation</td><td>Two people validate contracts for the whole company.</td><td>Claude reads the contract, a reviewer approves flagged items, and the QA record is kept.</td><td><Chip tone="rust">Retire</Chip></td></tr>
          <tr><td className="b">Syntellis Axiom, claim level</td><td>Models expected reimbursement from payer contracts. Waystar pushes CPTs to it.</td><td>Expected allowed is calculated per claim line at posting and compared with the 835.</td><td><Chip tone="rust">Not needed</Chip></td></tr>
          <tr><td className="b">Syntellis Axiom, planning</td><td>Budgeting and forecasting for finance.</td><td>Receives expected allowed and variance as a feed. Finance keeps its tool.</td><td><Chip tone="teal">Keep, integrate</Chip></td></tr>
        </tbody></table></div>
      <div className="panel">
        <div className="h3">If ATI keep Axiom for planning</div>
        <div className="muted">Proposal for discussion. No contract data is entered twice.</div>
        <div className="flow">
          <div className="fnode"><div className="b">Contract repository</div><div className="muted">Rates, terms, rules</div></div>
          <div className="fedge"><span>nightly, per payer and plan</span><i /></div>
          <div className="fnode"><div className="b">Data warehouse</div><div className="muted">Databricks. Also holds 835 and claims</div></div>
          <div className="fedge"><span>expected allowed and variance</span><i /></div>
          <div className="fnode"><div className="b">Syntellis Axiom</div><div className="muted">Budget and forecast models</div></div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   Shell
   ============================================================ */
const CHAPTERS = [
  { k: "load", label: "Load", line: "One PDF becomes structured rates.", page: "contracts" },
  { k: "understand", label: "Understand", line: "Every expected allowed amount shows its math.", page: "contracts" },
  { k: "catch", label: "Catch", line: "Each 835 is checked against the contract at posting.", page: "claims" },
  { k: "recover", label: "Recover", line: "From variance to appeal in a few clicks.", page: "claims" },
  { k: "learn", label: "Learn", line: "See patterns by payer, site, and against peers.", page: "analytics" },
  { k: "connect", label: "Connect", line: "Load once. Scheduling, auth, and AR use it too.", page: "connections" },
];
const NAV = [
  { g: "Revenue Cycle", icon: Receipt, items: [["claims", "Claims", ["claims"]], ["appeals", "Appeals", ["appeals"]], ["analytics", "Analytics", ["analytics"]]] },
  { g: "Admin Panel", icon: BookOpen, items: [["contracts", "Practice Data", ["contracts", "connections"]]] },
];
const SUBNAV = [["inert", "Line Item Options"], ["contracts", "Contracts"], ["connections", "Contract Usage"], ["inert", "Write-Off Reasons"], ["inert", "Skip Collection Reasons"], ["inert", "Adjustment Types"], ["inert", "Provider Credentialing"]];
const CRUMBS = { claims: ["Revenue Cycle", "Claims"], appeals: ["Revenue Cycle", "Appeals"], analytics: ["Revenue Cycle", "Analytics"], contracts: ["Practice Data", "Contracts"], connections: ["Practice Data", "Contract Usage"] };

function AssistantPanel({ context, prompts = [], onClose }) {
  const [msgs, setMsgs] = useState([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef(null);
  useEffect(() => { if (end.current && end.current.scrollIntoView) end.current.scrollIntoView({ block: "end" }); }, [msgs, busy]);
  const h = new Date().getHours();
  const hello = h < 12 ? "Good Morning" : h < 18 ? "Good Afternoon" : "Good Evening";
  async function ask(text, act) {
    const question = (text || "").trim();
    if (!question || busy) return;
    if (act) act();
    setMsgs((m) => [...m, { r: "u", t: question }]); setQ(""); setBusy(true);
    let answer;
    try {
      answer = await callClaude("You are Athelas AI, the assistant inside Air, a healthcare revenue cycle platform. Answer in under 80 words, plain text, no markdown. Use only the context provided. If the answer is not in the context, say so.", `Context:\n${context}\n\nQuestion: ${question}`);
    } catch (e) { answer = "I could not reach the assistant just now. Try again in a moment."; }
    setMsgs((m) => [...m, { r: "a", t: answer.trim() }]); setBusy(false);
  }
  return (
    <aside className="aipanel" aria-label="Athelas AI">
      <div className="aiscroll">
        {msgs.length === 0 ? (
          <div className="aihello">
            <svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true"><g fill="#1132ee" fillOpacity=".5"><ellipse cx="48" cy="26" rx="14" ry="22" /><ellipse cx="48" cy="70" rx="14" ry="22" /><ellipse cx="26" cy="48" rx="22" ry="14" /><ellipse cx="70" cy="48" rx="22" ry="14" /></g><circle cx="48" cy="48" r="6" fill="#1132ee" /></svg>
            <div className="aigreet">{hello}</div>
            <div>How can I help you today?</div>
            <div className="aiprompts">{prompts.map((p) => <button key={p.q} className="link" onClick={() => ask(p.q, p.act)}>{p.q}</button>)}</div>
          </div>
        ) : (
          <div className="aichat">
            {msgs.map((m, i) => <div key={i} className={"aimsg " + m.r}>{m.r === "a" && <Sparkles size={14} />}<span>{m.t}</span></div>)}
            {busy && <div className="aimsg a"><Loader2 size={14} className="spin" /><span className="muted">Thinking</span></div>}
            <div ref={end} />
          </div>
        )}
      </div>
      {msgs.length === 0 && <button className="link aiteach" onClick={() => ask("Teach me about this page")}>Teach me about this page</button>}
      {msgs.length > 0 && <div className="aichips">{prompts.slice(0, 3).map((p) => <button key={p.q} className="aichip" onClick={() => ask(p.q, p.act)}>{p.q}</button>)}</div>}
      <div className="aibox">
        <input placeholder="Ask anything..." value={q} aria-label="Ask Athelas AI" onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && ask(q)} />
        <div className="row between">
          <button className="icon" aria-label="Attach a file"><Upload size={16} /></button>
          <div className="row gap"><button className="icon" aria-label="Dictate"><Mic size={16} /></button><button className="send" aria-label="Send" disabled={!q.trim() || busy} onClick={() => ask(q)}><ArrowUp size={16} /></button></div>
        </div>
      </div>
    </aside>
  );
}

export default function App() {
  const [page, setPage] = useState("contracts");
  const [chapter, setChapter] = useState("load");
  const [contracts, setContracts] = useState([SUMMIT, KEYSTONE]);
  const [ruleOn, setRuleOn] = useState({ "summit:pta": true, "keystone:pta": true });
  const [createdTerms, setCreatedTerms] = useState({});
  const [appeals, setAppeals] = useState({});
  const [upload, setUpload] = useState(false);
  const [drawerRow, setDrawerRow] = useState(null);
  const [doc, setDoc] = useState(null);
  const [view, setView] = useState("underpaid");
  const [openClaim, setOpenClaim] = useState(null);
  const [appealIds, setAppealIds] = useState(null);
  const [sel, setSel] = useState([]);
  const [msg, setMsg] = useState("");
  const [pending, setPending] = useState(null);
  const [presenter, setPresenter] = useState(true);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiHook, setAiHook] = useState(null);
  const [ruleLog, setRuleLog] = useState([{ d: "Mar 12, 2026", t: "Apply PTA (CQ) services at the contract percentage: on" }]);

  useEffect(() => { if (upload || appealIds) setAiOpen(true); else setAiHook(null); }, [upload, appealIds]);
  const loaded = contracts.some((c) => c.id === "cascadia");
  const claims = useMemo(() => CLAIMS.map((c) => derive(c, contracts, ruleOn, appeals)), [contracts, ruleOn, appeals]);
  const hero = claims.find((c) => c.id === HERO_ID);
  const toast = (m) => { setMsg(m); setTimeout(() => setMsg(""), 3800); };

  const publish = (c, quiet) => {
    setContracts((prev) => [...prev.filter((x) => x.id !== c.id), c]);
    setRuleOn((p) => ({ ...p, [c.id + ":escalator"]: !!c.escalatorPct, [c.id + ":pta"]: c.ptaPct != null }));
    setRuleLog((l) => [{ d: fmtDate(TODAY), t: `Rate rules applied from ${c.number} on publish` }, ...l]);
    if (!quiet) toast(`Published ${c.masterPayer}: ${c.plans.length} plans, ${c.rows.length} rate rows. Claims are now checked against it.`);
  };
  const go = (k) => {
    const ch = CHAPTERS.find((x) => x.k === k);
    setChapter(k); setUpload(false); setPage(ch.page); setOpenClaim(null); setAppealIds(null); setDrawerRow(null); setDoc(null);
    if (["understand", "catch", "recover", "learn"].includes(k) && !loaded) { publish(CASCADIA_CANON, true); toast("Loaded the sample Cascadia contract so this step has data."); }
    if (k === "catch") { setView("underpaid"); setSel([]); }
    setPending(k);
  };
  useEffect(() => {
    if (!pending || !loaded) return;
    if (pending === "understand") { const r = contracts.find((c) => c.id === "cascadia").rows.find((x) => x.plan.toLowerCase().includes("choice") && x.cpt === "97110"); if (r) setDrawerRow(r.id); }
    if (pending === "recover") { setView("underpaid"); setOpenClaim(HERO_ID); }
    setPending(null);
  }, [pending, loaded, contracts]);

  const startAppeal = (ids) => { setOpenClaim(null); setAppealIds(ids); };
  const submitAppeals = (ids, batch, bulk) => {
    setAppeals((p) => { const n = { ...p }; ids.forEach((id, i) => { n[id] = { id: bulk ? batch + "-" + (i + 1) : batch, status: "Submitted", on: TODAY }; }); return n; });
    setSel([]);
  };
  const respond = () => { setAppeals((p) => { const n = { ...p }; Object.keys(n).forEach((id) => { if (n[id].status === "Submitted") { const cl = CLAIMS.find((c) => c.id === id); n[id] = { ...n[id], status: cl.pattern === "bundling" ? "Denied" : "Won" }; } }); return n; }); toast("Payer responses received."); };
  const reset = () => { setContracts([SUMMIT, KEYSTONE]); setRuleOn({ "summit:pta": true, "keystone:pta": true }); setCreatedTerms({}); setAppeals({}); setSel([]); setOpenClaim(null); setAppealIds(null); setDrawerRow(null); setDoc(null); setUpload(false); setAiHook(null); setView("underpaid"); go("load"); };
  const openDoc = (id, hl) => setDoc({ id, hl });
  const detail = openClaim ? claims.find((c) => c.id === openClaim) : null;
  const thread = hero ? (hero.appeal ? (hero.appeal.status === "Won" ? `${fmt(hero.variance)} recovered` : "Appeal submitted") : hero.status === "underpaid" ? `${fmt(hero.variance)} underpaid` : hero.status === "no_contract" ? "No contract on file" : "Paid as expected") : "";
  const crumb = appealIds ? ["Claims", appealIds.length === 1 ? appealIds[0] : "Underpaid"] : CRUMBS[page];
  const underAll = claims.filter((c) => c.status === "underpaid");
  const baseContext = `Page: ${CRUMBS[page].join(" / ")}. Contracts on file: ${contracts.map((c) => `${c.masterPayer} (${c.plans.map((p) => p.plan + ", " + METHOD[p.method] + (p.discountPct ? " " + p.discountPct + "%" : "") + (p.flatRate ? " $" + p.flatRate : "")).join("; ")}; appeals due within ${c.disputeDays} days of remittance)`).join(" | ")}. Sample claims: ${claims.length}; underpaid: ${underAll.length} totalling ${fmt(underAll.reduce((s, c) => s + c.variance, 0))}; high recoverability and open: ${underAll.filter((c) => c.level === "High" && !c.appeal).length}; appeals filed: ${claims.filter((c) => c.appeal).length}. Featured claim ${HERO_ID}: ${hero ? hero.reason : ""} Expected allowed is calculated per claim line from the contract (fee schedule x rate, then escalator and PTA rules) and compared with the 835 at posting. Axiom: the billing calculator retires into the new EMR, Axiom is not needed for claim level expected reimbursement, and can stay for planning through a Databricks feed.`;
  const basePrompts = { contracts: [{ q: "Which payers have contracts on file?" }, { q: "How is expected allowed calculated?" }], connections: [{ q: "Do we still need Axiom?" }, { q: "Which teams use the contract?" }], claims: [{ q: "Which underpaid claims should I appeal first?" }, { q: `Why was ${HERO_ID} flagged?` }], appeals: [{ q: "What is in dispute right now?" }], analytics: [{ q: "Which payer is furthest from peers?" }] }[page] || [];
  const wonTotal = claims.filter((c) => c.appeal && c.appeal.status === "Won").reduce((s, c) => s + c.variance, 0);

  return (
    <div className="app">
      <style>{CSS}</style>
      {presenter && (
        <div className="presenter">
          <div className="p-label">Presenter</div>
          <ol className="trail">
            {CHAPTERS.map((ch, i) => (
              <li key={ch.k} className={chapter === ch.k ? "cur" : CHAPTERS.findIndex((x) => x.k === chapter) > i ? "past" : ""}>
                <button onClick={() => go(ch.k)}><span className="pn">{i + 1}</span><span className="pl">{ch.label}</span></button>
              </li>
            ))}
          </ol>
          <div className="p-line">{CHAPTERS.find((x) => x.k === chapter).line}</div>
          <div className="p-thread" title="The claim we follow through the demo">
            <span className="muted">Following</span> <b>{HERO_ID}</b><span className="tag">{thread}</span>
            {wonTotal > 0 && <span className="tag moss">{fmt(wonTotal)} recovered in total</span>}
          </div>
          <button className="pbtn" onClick={reset}>Reset</button>
          <button className="pbtn" onClick={() => setPresenter(false)} aria-label="Hide presenter bar">Hide</button>
        </div>
      )}
      {!presenter && <button className="showp" onClick={() => setPresenter(true)}>Presenter</button>}
      <div className={"shell" + (upload || appealIds ? " flowing" : "")}>
        <nav className="sidecol" aria-label="Main">
          <div className="logo">Air</div>
          <div className="sidescroll">
            {NAV.map((g) => {
              const Ic = g.icon;
              return (
                <div key={g.g} className="sgroup">
                  <div className="shead"><Ic size={16} /><span>{g.g}</span><ChevronDown size={16} className="flip" /></div>
                  <div className="sbody"><span className="sline" />
                    <div className="slist">
                      {g.items.map(([k, l, keys]) => <button key={k} className={"ni" + (keys.includes(page) ? " on" : "")} onClick={() => { setPage(k); setOpenClaim(null); }}><span>{l}</span></button>)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="sfoot"><span className="avatar">LR</span><Settings size={16} /><span className="grow" /><HelpCircle size={16} /></div>
        </nav>
        <div className="rightcol">
          <header className="hdr">
            <div className="hdr-l"><PanelLeft size={16} /><div className="bc"><span className="bc-link">{crumb[0]}</span><span className="bc-sep">/</span><span className="bc-cur">{crumb[1]}</span></div></div>
            <div className="hdr-c"><Bell size={16} /><div className="gsearch"><Search size={16} />Global Search<span className="kbd">⌘K</span></div></div>
            <div className="hdr-r"><span className="aitab"><Mic size={16} />Scribe</span><button className={"aitab" + (aiOpen ? " on" : "")} aria-pressed={aiOpen} onClick={() => setAiOpen(!aiOpen)}><Sparkles size={16} />Athelas AI</button></div>
          </header>
          <div className="workrow">
          <main className={"canvas" + (upload || appealIds ? " flowing" : (page === "contracts" || page === "connections") ? " pdc" : "")}>
            {appealIds ? <AppealPackageFlow key={appealIds.join()} ids={appealIds} claims={claims} setAiHook={setAiHook} onCancel={() => setAppealIds(null)} onSubmit={submitAppeals} onViewAppeals={() => { setAppealIds(null); setPage("appeals"); }} /> : upload ? <AddContractFlow key={upload} mode={upload} setAiHook={setAiHook} onCancel={() => setUpload(false)} onPublish={(c) => { publish(c); setUpload(false); setChapter("understand"); }} /> : <>
            {(page === "contracts" || page === "connections") ? (
              <div className="pd">
                <aside className="subnav" aria-label="Practice data">
                  <div className="sub-h">Billing</div>
                  {SUBNAV.map(([k, l]) => k === "inert"
                    ? <button key={l} className="sub-i" onClick={() => toast("Not part of this demo")}>{l}</button>
                    : <button key={k} className={"sub-i" + (page === k ? " on" : "")} onClick={() => { setPage(k); setOpenClaim(null); }}>{l}</button>)}
                </aside>
                <section className="pd-main">
                  {page === "contracts" ? <ContractsPage contracts={contracts} ruleOn={ruleOn} setRuleOn={setRuleOn} createdTerms={createdTerms} setCreatedTerms={setCreatedTerms} onUpload={(m) => setUpload(m || "pdf")} drawerRow={drawerRow} setDrawerRow={setDrawerRow} openDoc={openDoc} toast={toast} claims={claims} ruleLog={ruleLog} setRuleLog={setRuleLog} />
                    : <ConnectionsPage contracts={contracts} claims={claims} createdTerms={createdTerms} ruleOn={ruleOn} />}
                </section>
              </div>
            ) : (
              <>
                {page === "claims" && <ClaimsPage claims={claims} view={view} setView={setView} sel={sel} setSel={setSel} openClaim={openClaim} setOpenClaim={setOpenClaim} startAppeal={startAppeal} loaded={loaded} goLoad={() => go("load")} />}
                {page === "appeals" && <AppealsPage claims={claims} respond={respond} />}
                {page === "analytics" && <AnalyticsPage claims={claims} openFromAnalytics={(id) => { setPage("claims"); setView("underpaid"); setOpenClaim(id); }} />}
              </>
            )}
            </>}
          </main>
          {aiOpen && <AssistantPanel context={aiHook ? aiHook.context : baseContext} prompts={aiHook ? aiHook.prompts : basePrompts} onClose={() => setAiOpen(false)} />}
          </div>
        </div>
      </div>
      {detail && page === "claims" && <ClaimFlyout d={detail} onClose={() => setOpenClaim(null)} startAppeal={startAppeal} openDoc={openDoc} />}
                  {doc && <DocModal doc={doc} contracts={contracts} onClose={() => setDoc(null)} />}
      {msg && <div className="toast" role="status">{msg}</div>}
    </div>
  );
}

/* ============================================================
   Styles
   ============================================================ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Source+Serif+4:wght@400;600&display=swap');
.app{
/* Design System 3.0 tokens (Theme collection) */
--fg1:#1f1f1f;--fg2:#454545;--fg3:#737373;--fg-dis:rgba(0,0,0,.4);--fg-accent:#1132ee;--on-accent:#fff;
--bs:rgba(0,0,0,.1);--bst:rgba(0,0,0,.2);
--base:#fff;--solid2:#f5f5f5;--tonal:#f1f3fe;--d5:rgba(0,0,0,.05);--d10:rgba(0,0,0,.1);
--accent:#1132ee;--accent-h:#0d27c0;--accent-sub:rgba(17,50,238,.1);--accent-sub-h:rgba(17,50,238,.06);
--danger:#b52b2b;--danger-sub:rgba(181,43,43,.1);--info:#416bcf;--info-sub:rgba(65,107,207,.1);
--t-red:rgba(181,43,43,.1);--t-orange:rgba(194,112,35,.1);--t-yellow:rgba(199,162,42,.1);--t-green:rgba(42,153,83,.1);--t-teal:rgba(36,147,136,.1);--t-blue:rgba(65,107,207,.1);--t-purple:rgba(174,66,176,.1);--t-neutral:rgba(89,89,89,.1);
--r-soft:8px;--r-semi:4px;--r-extra:12px;--r-card:16px;--r-full:100px;
font-family:'Geist',system-ui,-apple-system,'Segoe UI',sans-serif;color:var(--fg1);font-size:13px;line-height:1.6;height:100vh;display:flex;flex-direction:column;background:var(--tonal);font-variant-numeric:tabular-nums;position:relative}
.app *{box-sizing:border-box}
.app button{font-family:inherit;font-size:inherit;color:inherit;cursor:pointer}
.app :focus-visible{outline:2px solid var(--accent);outline-offset:2px}
.b{font-weight:500}.muted{color:var(--fg3)}.small{font-size:12px;line-height:1.4}.grow{flex:1}.nowrap{white-space:nowrap}.r{text-align:right}.mt{margin-top:18px}.pad{padding:14px}
.neg{color:var(--danger)}.warn{color:var(--fg1);font-weight:600}.moss{color:inherit}
.row{display:flex;align-items:center}.gap{gap:8px}.between{justify-content:space-between}.wrap{flex-wrap:wrap}
.inl{vertical-align:-2px;margin-right:6px}
h1{font-size:18px;font-weight:600;line-height:1.2;margin:0}.h2{font-size:18px;font-weight:600;line-height:1.3}.h3{font-size:14px;font-weight:600;margin-bottom:4px}
.crumb{font-size:12px;color:var(--fg3);line-height:1.4}.pagehead .crumb{display:none}

/* presenter bar (demo chrome, dark tokens so it never reads as product UI) */
.presenter{display:flex;align-items:center;gap:16px;background:#141414;color:#e5e5e5;padding:6px 14px;flex-wrap:wrap}
.p-label{font-weight:600;font-size:12px;color:#8a8a8a}
.trail{display:flex;list-style:none;margin:0;padding:0;gap:0;align-items:center}
.trail li{display:flex;align-items:center}
.trail li+li:before{content:"";width:16px;height:1px;background:rgba(255,255,255,.25);margin:0 2px}
.trail li.past+li:before,.trail li.cur:before{background:#e5e5e5}
.trail button{display:flex;align-items:center;gap:6px;border:0;background:transparent;padding:2px 10px 2px 4px;border-radius:var(--r-full);color:#e5e5e5;height:28px}
.trail button:hover{background:rgba(255,255,255,.1)}
.trail .pn{width:20px;height:20px;border-radius:50%;border:1px solid rgba(255,255,255,.4);display:grid;place-items:center;font-size:11px;font-weight:500}
.trail li.past .pn{background:#e5e5e5;color:#141414;border-color:#e5e5e5}
.trail li.cur button{background:var(--accent);color:#fff}.trail li.cur .pn{border-color:#fff}
.trail .pl{font-weight:500}
.p-line{color:#b5b5b5;flex:1;min-width:200px}
.p-thread{display:flex;align-items:center;gap:6px;background:rgba(255,255,255,.08);border-radius:var(--r-soft);padding:2px 10px;height:28px}
.p-thread .muted{color:#9a9a9a}
.p-thread .tag{background:rgba(215,98,104,.2);color:#f0a3a6;border-radius:var(--r-soft);padding:0 8px;font-weight:500;font-size:12px}
.p-thread .tag.moss{background:rgba(95,199,133,.18);color:#8fdcab}
.pbtn{border:1px solid rgba(255,255,255,.2);background:transparent;border-radius:var(--r-full);padding:0 12px;height:28px;color:#e5e5e5}.pbtn:hover{background:rgba(255,255,255,.1)}
.showp{position:absolute;top:6px;right:10px;z-index:5;border:1px solid var(--bst);background:var(--base);border-radius:var(--r-full);padding:0 12px;height:28px;font-size:12px}

/* Air app shell */
.shell{flex:1;display:grid;grid-template-columns:200px 1fr;min-height:0;background:var(--tonal)}
.sidecol{display:flex;flex-direction:column;gap:16px;padding:8px;min-height:0}
.logo{font-weight:600;font-size:20px;letter-spacing:-.02em;padding:0 8px;height:32px;display:flex;align-items:center}
.sidescroll{flex:1;overflow:auto;border-bottom:1px solid var(--bs)}
.sgroup{display:flex;flex-direction:column;margin-bottom:4px}
.shead{display:flex;align-items:center;gap:6px;height:28px;font-weight:500;color:var(--fg2)}
.shead .flip{transform:rotate(180deg);margin-left:2px}
.sbody{display:flex}.sline{width:1px;background:var(--d10);margin:0 12px 12px 8px}
.slist{flex:1;display:flex;flex-direction:column;gap:2px;padding-bottom:12px;min-width:0}
.ni{display:flex;align-items:center;gap:6px;width:100%;text-align:left;background:transparent;border:0;color:var(--fg2);padding:0 8px;height:28px;border-radius:var(--r-soft);overflow:hidden;white-space:nowrap}
.ni span{overflow:hidden;text-overflow:ellipsis}
.ni:hover{background:var(--d5)}.ni.on{background:var(--accent-sub);color:var(--fg-accent);font-weight:500}
.sfoot{display:flex;align-items:center;height:36px;padding-top:8px}
.avatar{width:28px;height:28px;border-radius:50%;border:1px solid var(--bst);display:grid;place-items:center;font-size:11px;font-weight:500;background:var(--base)}
.rightcol{display:flex;flex-direction:column;min-width:0;min-height:0;padding:0 8px 8px 0}
.hdr{display:flex;align-items:center;justify-content:space-between;padding:4px 0;position:relative;height:36px;flex:none}
.hdr-l,.hdr-r{display:flex;align-items:center;gap:6px}
.hdr-l svg{color:var(--fg2);margin:0 6px}
.bc{display:flex;align-items:center}.bc-link{color:var(--fg3)}.bc-sep{color:var(--bst);padding:0 12px 0 12px}.bc-cur{font-weight:500}
.hdr-c{position:absolute;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:4px;top:4px;color:var(--fg2)}
.gsearch{display:flex;align-items:center;gap:4px;justify-content:center;width:320px;background:var(--d5);border-radius:var(--r-soft);padding:3px 6px;color:var(--fg3);position:relative}
.kbd{position:absolute;right:10px;font-size:12px;color:var(--fg-dis)}
.aitab{display:flex;align-items:center;gap:6px;height:28px;padding:0 8px;color:var(--fg-accent);font-weight:500}
.canvas{flex:1;min-height:0;overflow:auto;background:var(--base);border:1px solid var(--bs);border-radius:var(--r-soft);position:relative}
.page{padding:20px 24px 40px;max-width:1500px}
.pagehead{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:12px}

/* buttons, tags, tabs (DS: Button, Tag, Solid Tab Menu) */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:4px;height:28px;border:1px solid var(--bs);background:var(--base);border-radius:var(--r-full);padding:0 14px;font-weight:500;white-space:nowrap}
.btn:hover:not(:disabled){background:var(--d5)}
.btn.primary{background:var(--accent);border-color:var(--accent);color:var(--on-accent)}.btn.primary:hover:not(:disabled){background:var(--accent-h)}
.btn:disabled{opacity:.4;cursor:not-allowed}
.icon{border:0;background:transparent;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;color:var(--fg2)}.icon:hover{background:var(--d5)}
.link{border:0;background:transparent;color:var(--fg-accent);font-weight:500;padding:0;height:28px}.link:hover{text-decoration:underline;text-underline-offset:2px}
.chip{display:inline-flex;align-items:center;gap:4px;height:24px;border-radius:var(--r-soft);padding:0 8px;font-size:13px;font-weight:500;background:var(--t-neutral);color:var(--fg1);margin-left:4px;white-space:nowrap}
.chip:first-child{margin-left:0}
.chip.teal{background:var(--t-teal)}.chip.navy{background:var(--t-blue)}.chip.plum{background:var(--t-purple)}.chip.amber{background:var(--t-yellow)}.chip.rust{background:var(--t-red)}.chip.moss{background:var(--t-green)}.chip.grey{background:var(--t-neutral)}
.sw{width:34px;height:20px;border-radius:10px;border:0;background:rgba(0,0,0,.25);position:relative;padding:0;flex:none}
.sw span{position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;transition:left .15s}
.sw.on{background:var(--accent)}.sw.on span{left:16px}
.seg{display:inline-flex;gap:8px;align-items:center}
.seg button{height:28px;padding:0 6px;border:0;border-radius:var(--r-soft);background:transparent;color:var(--fg2)}
.seg button:hover:not(.on){background:var(--d5)}.seg button.on{background:var(--accent-sub);color:var(--fg-accent)}
.tabs{display:flex;gap:8px;align-items:center;margin-bottom:12px}
.tabs button{height:28px;padding:0 6px;border:0;border-radius:var(--r-soft);background:transparent;color:var(--fg2);display:flex;align-items:center;gap:4px}
.tabs button:hover:not(.on){background:var(--d5)}.tabs button.on{background:var(--accent-sub);color:var(--fg-accent)}
.badge,.cnt{background:var(--d10);border-radius:10px;padding:0 6px;font-size:12px;line-height:18px;color:var(--fg1)}
.badge{background:var(--t-yellow);font-weight:600}
.search{display:flex;align-items:center;gap:6px;border-radius:6px;background:var(--d5);padding:0 8px;height:28px;width:300px;color:var(--fg3)}
.search input{border:0;outline:0;flex:1;font:inherit;background:transparent;color:var(--fg1)}

/* tables (DS: Data Table, Table Row compact, Table Heading Cell) */
.tblwrap{background:var(--base);border:1px solid var(--bs);border-radius:var(--r-soft);overflow:auto;max-width:100%}
.tblwrap.tall{max-height:calc(100vh - 360px)}.tblwrap.short{max-height:240px;margin-top:10px}
.tbl{border-collapse:separate;border-spacing:0;width:100%;font-size:13px}
.tbl th{position:sticky;top:0;background:var(--solid2);text-align:left;font-weight:400;color:var(--fg1);padding:0 8px;height:28px;border-bottom:1px solid var(--bs);white-space:nowrap;z-index:1}
.tbl td{padding:4px 8px;height:36px;border-bottom:1px solid var(--bs);vertical-align:middle;color:var(--fg2)}
.tbl tbody tr:last-child td{border-bottom:0}
.tbl th.r,.tbl td.r{text-align:right}

.tbl .sub{display:inline;margin-left:6px;font-size:12px;line-height:1.4;color:var(--fg3);font-weight:400}
.tbl td.b{color:var(--fg1)}

.clickrow{cursor:pointer}.clickrow:hover td{background:var(--accent-sub-h)}.clickrow.active td{background:var(--accent-sub)}
.empty{text-align:center;color:var(--fg3);padding:28px}
.answer td{vertical-align:middle}

/* score cards */
.kpis,.summary{display:flex;gap:12px;align-items:stretch;margin-bottom:12px;flex-wrap:wrap}
.kpis>div,.summary>div:not(.grow):not(.row){background:var(--base);border:1px solid var(--bs);border-radius:var(--r-extra);padding:10px 16px;min-width:150px}
.summary>.row{align-self:center}
.kv{font-size:22px;font-weight:600;line-height:1.2;letter-spacing:-.01em}.kl{font-size:12px;line-height:1.4;color:var(--fg3);max-width:260px}
.scale{max-width:360px}
.banner{display:flex;align-items:center;gap:12px;border-radius:var(--r-semi);padding:6px 12px;margin-bottom:12px;border-left:4px solid var(--info);background:var(--info-sub)}
.banner.amber{border-left-color:#c7a22a;background:rgba(199,162,42,.12);color:var(--fg1)}.banner span{flex:1}

/* contracts */
.page-tabs{margin-top:4px}
.cols{display:grid;grid-template-columns:230px 1fr;gap:16px;align-items:start}
.tree{background:var(--base);border:1px solid var(--bs);border-radius:var(--r-soft);padding:8px}
.tree-title{font-weight:500;color:var(--fg3);font-size:12px;padding:2px 8px 6px}
.tn{display:block;width:100%;text-align:left;border:0;background:transparent;padding:0 8px;height:28px;border-radius:var(--r-soft);color:var(--fg2)}
.tn:hover{background:var(--d5)}.tn.on{background:var(--accent-sub);color:var(--fg-accent);font-weight:500}
.tn-row{display:flex;align-items:center}.tw{border:0;background:transparent;padding:2px;color:var(--fg3);display:grid;place-items:center}
.lvl2{padding-left:20px}.lvl3{padding-left:12px;display:flex;justify-content:space-between;align-items:center}.pt{font-size:11px;color:var(--fg3)}
.toolbar{display:flex;align-items:center;gap:14px;margin-bottom:10px}
.content{min-width:0}
.termgroup{margin-bottom:22px}.term{background:var(--base);border:1px solid var(--bs);border-radius:var(--r-soft);padding:12px 14px;margin-bottom:10px}
.term-top{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.rulebox{display:grid;grid-template-columns:130px 1fr auto;gap:12px;align-items:center;background:var(--tonal);border:1px solid var(--accent-sub);border-radius:var(--r-soft);padding:10px 12px}
.rule-l{display:flex;gap:6px;align-items:center;color:var(--fg-accent)}
.rule-b .k{display:inline-block;width:44px;color:var(--fg3);font-weight:500}
.termrow{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--bs)}

/* drawer + modal (DS: Drawer, Modal, Overlay) */
.drawer{position:fixed;top:0;right:0;bottom:0;width:480px;background:var(--base);border-left:1px solid var(--bs);box-shadow:0 2px 16px rgba(0,0,0,.12);z-index:20;display:flex;flex-direction:column}
.drawer.wide{width:600px}
.drawer-head{display:flex;justify-content:space-between;gap:12px;padding:16px 20px;border-bottom:1px solid var(--bs)}
.drawer-body{padding:16px 20px;overflow:auto;display:flex;flex-direction:column;gap:14px}
.whatif{display:flex;gap:24px}.k{font-size:12px;color:var(--fg3);margin-bottom:3px;line-height:1.4}
.chain{display:flex;flex-direction:column;border:1px solid var(--bs);border-radius:var(--r-soft);overflow:hidden}
.node{display:flex;align-items:center;gap:12px;padding:8px 14px;border-bottom:1px solid var(--bs);background:var(--base)}
.node.rule{background:var(--tonal)}.node.rule.off{background:var(--solid2);color:var(--fg3)}.node.rule.off .node-v{text-decoration:line-through}
.node-main{flex:1}.node-v{font-family:'Geist Mono',ui-monospace,monospace;font-weight:500;min-width:70px;text-align:right}
.node.total{background:#141414;color:#e5e5e5;border:0}.node.total .muted{color:#9a9a9a}.node.total .node-v{font-size:18px}
.note{display:flex;gap:8px;color:var(--fg3);font-size:12px;line-height:1.4}
.impact{display:flex;gap:12px;border-top:1px solid var(--bs);padding-top:12px}
.facts{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.facts>div{background:var(--solid2);border-radius:var(--r-soft);padding:8px 10px}.facts .v{font-size:16px;font-weight:600}
.why{background:var(--danger-sub);border-left:4px solid var(--danger);border-radius:var(--r-semi);padding:8px 12px;display:flex;flex-direction:column;gap:3px}
.ccard{border:1px solid var(--bs);border-radius:var(--r-soft);padding:10px 12px;display:flex;flex-direction:column;gap:3px}
.quote{border-left:3px solid var(--accent);padding-left:10px;margin-top:6px;color:var(--fg1)}
.modal{position:fixed;inset:0;background:rgba(20,20,20,.45);z-index:30;display:grid;place-items:center;padding:20px}
.modal-card{background:var(--base);border:1px solid var(--bs);border-radius:var(--r-card);width:min(760px,100%);max-height:94vh;display:flex;flex-direction:column;box-shadow:0 2px 16px rgba(0,0,0,.2);overflow:hidden}
.modal-card.wide{width:min(1240px,100%);height:min(780px,94vh)}.modal-card.doc{width:min(760px,100%);height:min(780px,94vh)}.modal-card.appeal{width:min(820px,100%)}
.modal-head{display:flex;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--bs)}
.steps{display:flex;gap:14px;margin-top:6px;color:var(--fg3);font-size:13px}.step{display:flex;align-items:center;gap:4px}.step.cur{color:var(--fg1);font-weight:500}.step.done{color:var(--fg-accent)}
.choose{padding:28px;display:flex;flex-direction:column;gap:12px;align-items:center;justify-content:center;flex:1}
.drop{border:1px dashed var(--bst);border-radius:var(--r-card);padding:40px 60px;display:flex;flex-direction:column;align-items:center;gap:8px;background:var(--tonal);color:var(--fg-accent)}
.drop .muted{max-width:380px;text-align:center}.drop .b{color:var(--fg1)}
.split{flex:1;display:grid;grid-template-columns:42% 1fr;min-height:0}
.left{background:var(--solid2);overflow:auto;padding:16px;border-right:1px solid var(--bs)}
.right{overflow:auto;padding:16px 18px;min-width:0}
.paper{background:#fff;border:1px solid var(--bs);box-shadow:0 1px 4px rgba(0,0,0,.08);padding:30px 34px;font-family:'Source Serif 4',Georgia,serif;font-size:13px;line-height:1.65;color:var(--fg1)}
.paper-title{font-family:'Geist',sans-serif;font-size:12px;color:var(--fg3);margin-bottom:12px}
.paper-body{white-space:pre-wrap}
.pdfcard{display:flex;flex-direction:column;align-items:center;gap:8px;text-align:center;padding:50px;font-family:'Geist',sans-serif}
.hl{background:transparent;color:inherit}.hl.off{background:transparent}.hl:not(.off){background:rgba(199,162,42,.25);border-radius:2px}.hl.active{background:rgba(199,162,42,.55);box-shadow:0 0 0 2px rgba(199,162,42,.55)}
.stages{display:flex;flex-direction:column;gap:12px;padding:10px 6px}
.stage{display:flex;align-items:center;gap:10px;color:var(--fg3)}.stage.cur{color:var(--fg1);font-weight:500}.stage.done{color:var(--fg2)}.stage.done svg{color:#2a9953}
.dot{width:16px;height:16px;border-radius:50%;border:1.5px solid var(--bst)}
.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}
.livebar{display:flex;align-items:center;gap:6px;font-size:12px;padding:3px 10px;border-radius:var(--r-soft);margin-bottom:10px;width:fit-content}
.livebar.live{background:var(--accent-sub);color:var(--fg-accent)}.livebar.cached{background:var(--t-yellow);color:var(--fg1)}
.review{display:flex;flex-direction:column;min-height:100%}
.foot{display:flex;justify-content:space-between;align-items:center;margin-top:auto;padding-top:14px;border-top:1px solid var(--bs)}
.qa{display:flex;flex-direction:column;gap:2px}.qarow{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid var(--bs)}.review-item{background:var(--t-yellow);padding:10px;border-radius:var(--r-soft);margin-top:6px;border:0;cursor:pointer}
.okc{color:#2a9953}.warnc{color:#c7a22a}
.docbody{flex:1;overflow:auto;padding:16px;background:var(--solid2)}
.appeal-body{padding:18px 22px;display:flex;flex-direction:column;gap:14px;overflow:auto}
.letter{display:flex;flex-direction:column;gap:10px}.letter textarea{width:100%;min-height:290px;border:1px solid var(--bst);border-radius:var(--r-soft);padding:12px;font:inherit;line-height:1.55;resize:vertical;color:var(--fg1)}
.pre{white-space:pre-wrap;font-family:inherit;background:var(--solid2);border:1px solid var(--bs);border-radius:var(--r-soft);padding:12px;margin:6px 0 12px}
.attach{display:flex;flex-direction:column;gap:5px}.attach label{display:flex;gap:8px;align-items:center}
.group{background:var(--solid2);border-radius:var(--r-soft);padding:8px 12px;margin-top:8px}
.donebox{padding:40px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center}
.app input[type=checkbox]{accent-color:#1132ee;width:16px;height:16px}

/* analytics */
.panel{background:var(--base);border:1px solid var(--bs);border-radius:var(--r-soft);padding:14px 18px;margin-bottom:14px}
.two{display:grid;grid-template-columns:1.2fr 1fr;gap:28px;margin-top:8px}
.reason{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--bs)}
.linkrow{display:flex;gap:12px;justify-content:space-between;width:100%;border:0;background:transparent;padding:6px 4px;border-bottom:1px solid var(--bs);text-align:left}.linkrow:hover{background:var(--accent-sub-h)}
.cohort{display:flex;flex-direction:column;gap:14px;margin-top:14px}
.crow{display:grid;grid-template-columns:190px 1fr 190px 130px;gap:14px;align-items:center}
.ctrack{position:relative;height:10px;background:var(--d5);border-radius:5px}
.cband{position:absolute;top:0;bottom:0;background:rgba(17,50,238,.18);border-radius:5px}
.cmed{position:absolute;top:-3px;bottom:-3px;width:2px;background:var(--fg3)}
.cyou{position:absolute;top:-4px;width:18px;height:18px;margin-left:-9px;border-radius:50%;background:var(--accent);border:3px solid #fff;box-shadow:0 0 0 1px var(--accent)}.cyou.hot{background:var(--danger);box-shadow:0 0 0 1px var(--danger)}

/* connections */
.lead{margin-bottom:14px;max-width:640px}
.hub{display:grid;grid-template-columns:260px 1fr;gap:16px;align-items:stretch}
.hubcore{background:#141414;color:#e5e5e5;border-radius:var(--r-extra);padding:18px;display:flex;flex-direction:column;gap:6px;justify-content:center}.hubcore .muted{color:#9a9a9a}
.uses{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.use{background:var(--base);border:1px solid var(--bs);border-radius:var(--r-extra);padding:12px 14px;display:flex;flex-direction:column;gap:6px}.stat{margin-top:auto;font-weight:500;color:var(--fg1)}
.flow{display:flex;align-items:center;gap:0;margin-top:16px;flex-wrap:wrap}
.fnode{border:1px solid var(--bs);background:var(--tonal);border-radius:var(--r-soft);padding:12px 16px;min-width:200px}
.fedge{display:flex;flex-direction:column;align-items:center;min-width:150px;font-size:12px;color:var(--fg3);padding:0 8px}.fedge i{display:block;width:100%;height:2px;background:var(--accent);position:relative;margin-top:4px}.fedge i:after{content:"";position:absolute;right:-1px;top:-4px;border-left:8px solid var(--accent);border-top:5px solid transparent;border-bottom:5px solid transparent}

/* Practice Data secondary menu */
.pd{display:grid;grid-template-columns:260px 1fr;min-height:100%}
.subnav{padding:16px 12px;border-right:1px solid var(--bs);display:flex;flex-direction:column;gap:2px;align-self:stretch}
.sub-h{font-size:16px;font-weight:500;padding:0 12px 12px}
.sub-i{display:block;width:100%;text-align:left;height:36px;padding:0 12px;border:0;background:transparent;border-radius:var(--r-soft);color:var(--fg1);font-size:13px}
.sub-i:hover{background:var(--d5)}.sub-i.on{background:var(--accent-sub);color:var(--fg-accent);font-weight:500}
.pd-main{min-width:0}
.pd .page{padding:16px 24px 40px;max-width:none}
.pd .pagehead{padding-bottom:12px;border-bottom:1px solid var(--bs);margin-bottom:14px;align-items:center}
.sfoot{gap:10px;color:var(--fg2)}
.avatar{background:var(--accent-sub);color:var(--fg-accent);border:0}
@media (max-width:1000px){.pd{grid-template-columns:1fr}.subnav{flex-direction:row;flex-wrap:wrap;border-right:0;border-bottom:1px solid var(--bs)}.sub-h{width:100%}.sub-i{width:auto}}

/* split button + menu (DS: Button group, Menu) */
.tabrow{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.tabact{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.sbtn-wrap{position:relative}
.sbtn{display:inline-flex;border-radius:var(--r-full);overflow:hidden;background:var(--accent)}
.sbtn button{border:0;background:transparent;color:var(--on-accent);height:28px;display:inline-flex;align-items:center;gap:4px;font-weight:500}
.sbtn-main{padding:0 14px}.sbtn-main:hover,.sbtn-caret:hover{background:var(--accent-h)}
.sbtn-caret{width:30px;justify-content:center;background:rgba(0,0,0,.25)!important;border-left:1px solid rgba(255,255,255,.18)!important}
.sbtn-caret:hover{background:rgba(0,0,0,.4)!important}
.menu{position:absolute;right:0;top:34px;z-index:15;background:var(--base);border:1px solid var(--bs);border-radius:var(--r-card);box-shadow:0 2px 16px rgba(0,0,0,.12);padding:6px;min-width:220px}
.menu-i{display:flex;align-items:center;gap:10px;width:100%;height:36px;padding:0 12px;border:0;background:transparent;border-radius:var(--r-soft);text-align:left;color:var(--fg1)}
.menu-i:hover{background:var(--d5)}

/* Athelas AI panel + full-page add-contract flow */
.shell.flowing{grid-template-columns:1fr}.shell.flowing .sidecol{display:none}
.workrow{flex:1;display:flex;gap:8px;min-height:0}
.workrow .canvas{flex:1;min-width:0}
.canvas.flowing{overflow:hidden}
.aitab{border:0;background:transparent;border-radius:var(--r-soft)}.aitab.on{background:var(--accent-sub)}
.aipanel{width:276px;flex:none;display:flex;flex-direction:column;align-items:center;min-height:0;padding:8px 4px 0 4px}
.aiscroll{flex:1;min-height:0;overflow:auto;width:100%;display:flex;flex-direction:column;justify-content:center}
.aihello{display:flex;flex-direction:column;align-items:center;text-align:center;gap:4px}
.aigreet{font-size:18px;font-weight:600;margin-top:12px}
.aiprompts{display:flex;flex-direction:column;gap:10px;margin-top:36px}
.aiprompts .link{height:auto;line-height:1.4;text-align:center}
.aiteach{margin:12px 0}
.aichat{display:flex;flex-direction:column;gap:10px;padding:8px 4px;justify-content:flex-start;align-self:stretch}
.aiscroll:has(.aichat){justify-content:flex-start}
.aimsg{display:flex;gap:6px;font-size:13px;line-height:1.5}.aimsg.a svg{color:var(--fg-accent);flex:none;margin-top:3px}
.aimsg.u{align-self:flex-end;background:var(--accent-sub);border-radius:12px 12px 4px 12px;padding:6px 10px;max-width:92%}
.aichips{display:flex;flex-direction:column;gap:6px;width:100%;margin:8px 0}
.aichip{border:1px solid var(--bs);background:var(--base);border-radius:var(--r-full);padding:2px 12px;text-align:left;font-size:12px;line-height:1.5}.aichip:hover{background:var(--d5)}
.aibox{width:100%;background:var(--base);border:1px solid var(--bs);border-radius:var(--r-extra);padding:10px 12px;display:flex;flex-direction:column;gap:10px;margin-bottom:4px}
.aibox input{border:0;outline:0;font:inherit;background:transparent;color:var(--fg1)}
.send{width:28px;height:28px;border-radius:50%;border:0;background:var(--accent);color:#fff;display:grid;place-items:center}.send:disabled{opacity:.4;cursor:not-allowed}
.icon.sel{background:var(--accent-sub);color:var(--fg-accent)}

.flowwrap{display:flex;flex-direction:column;height:100%;min-height:0}
.fhead{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 16px 8px 20px;border-bottom:1px solid var(--bs);flex:none}
.fbc{display:flex;align-items:center}
.fhead-r{display:flex;align-items:center;gap:12px}
.vdiv{width:1px;height:20px;background:var(--bs)}
.cancel{border:0;background:transparent;color:var(--danger);font-weight:500;height:28px;padding:0 8px;border-radius:var(--r-full)}.cancel:hover{background:var(--danger-sub)}
.stepwrap{position:relative}
.stepbtn{height:28px;border:1px solid var(--accent);color:var(--fg-accent);background:var(--base);border-radius:var(--r-full);padding:0 12px;display:flex;align-items:center;gap:4px;font-weight:500}
.stepmenu{right:auto;left:0;top:34px;min-width:240px;padding:6px}
.step-i{display:flex;align-items:flex-start;gap:10px;width:100%;border:0;background:transparent;text-align:left;padding:8px 10px;border-radius:var(--r-soft)}
.step-i:hover:not(:disabled){background:var(--d5)}.step-i.on{background:var(--accent-sub)}.step-i:disabled{opacity:.5;cursor:not-allowed}
.stepnum{width:16px;height:16px;border:1px solid var(--fg2);border-radius:var(--r-semi);display:grid;place-items:center;font-size:11px;margin-top:3px;flex:none}
.step-i.on .stepnum{background:var(--accent);border-color:var(--accent);color:#fff}
.step-i .sub{display:block;font-size:12px;color:var(--fg3);line-height:1.4}
.emptyfull{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:24px;text-align:center}
.emptyicon{width:64px;height:64px;border-radius:50%;background:var(--accent-sub);color:var(--fg-accent);display:grid;place-items:center}
.emptycopy{max-width:480px;margin:0}
.dropbox{margin-top:8px;width:min(560px,100%);border:1px dashed var(--bst);border-radius:var(--r-card);padding:32px 24px;display:flex;flex-direction:column;align-items:center;gap:8px;background:var(--tonal);color:var(--fg-accent)}
.dropbox .b{color:var(--fg1)}.dropbox .muted{color:var(--fg3)}
.fsplit{flex:1;min-height:0;display:grid;grid-template-columns:42% 1fr}
.dcol{display:flex;flex-direction:column;min-height:0;background:var(--solid2);border-right:1px solid var(--bs)}
.dochead{display:flex;align-items:center;gap:8px;padding:6px 12px;border-bottom:1px solid var(--bs);background:var(--base);flex:none;min-width:0}
.ellip{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.zoomv{min-width:40px;text-align:center}
.docscroll{flex:1;min-height:0;overflow:auto;padding:16px}
.rcol{min-height:0;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:12px;min-width:0}
.aibanner{display:flex;align-items:flex-start;gap:10px;background:linear-gradient(90deg,var(--accent-sub),rgba(17,50,238,.03));border-radius:var(--r-extra);padding:12px 14px}
.aibanner>svg{color:var(--fg-accent);flex:none;margin-top:3px}
.sec{border:1px solid var(--bs);border-radius:var(--r-extra);background:var(--base);overflow:hidden}
.sec-h{display:flex;align-items:center;gap:6px;width:100%;border:0;background:transparent;padding:10px 14px;font-weight:600;font-size:14px;text-align:left}
.sec-b{padding:0 14px 14px}.sec-b .tblwrap{border-radius:var(--r-soft)}
.clickable{cursor:pointer}
.termrow.clickable,.qarow.clickable{width:100%;border:0;background:transparent;text-align:left;border-bottom:1px solid var(--bs);border-radius:0}
.termrow.clickable:hover,.qarow.clickable:hover{background:var(--accent-sub-h)}
.termrow.on,.qarow.on{background:var(--accent-sub)!important}
.left{text-align:left;flex:1;min-width:0}.plain{border:0;background:transparent;padding:0;cursor:pointer}
.review-item.on{outline:1px solid var(--accent)}
.terms{display:flex;flex-direction:column}
.docbody{display:flex;flex-direction:column;padding:0}
@media (max-width:1000px){.fsplit{grid-template-columns:1fr}.aipanel{display:none}}

/* Create Appeal Package flow (layout follows the appeals prototype) */
.btn.outline{border-color:var(--accent);color:var(--fg-accent);background:var(--base)}.btn.outline:hover:not(:disabled){background:var(--accent-sub-h)}
.flowbody{flex:1;min-height:0;overflow:auto}
.apcol{max-width:880px;margin:0 auto;padding:16px;display:flex;flex-direction:column;gap:12px}
.aibanner b{font-weight:600;color:var(--fg1)}
.acard{border:1px solid var(--bs);border-radius:var(--r-extra);background:var(--base)}
.acard-h{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px}
.acard-t{display:flex;align-items:center;gap:6px;border:0;background:transparent;font-weight:600;font-size:15px;padding:0}
.acard-t svg{color:var(--fg2)}.flipc{transform:rotate(-90deg)}
.acard-b{padding:0 14px 14px;display:flex;flex-direction:column;gap:10px}
.radios{display:grid;grid-template-columns:1fr 1fr;gap:12px}.radios label{display:flex;align-items:center;gap:8px}
.app input[type=radio]{accent-color:#1132ee;width:16px;height:16px}
.kv2{display:grid;grid-template-columns:130px 1fr 130px 1fr;gap:8px 12px;background:var(--solid2);border-radius:var(--r-soft);padding:10px 12px}
.k2{color:var(--fg3)}.v2{color:var(--fg1);min-width:0;overflow-wrap:anywhere}.span{grid-column:span 1}
.kv2 .k2.span{grid-column:1}.kv2 .v2.span{grid-column:2 / span 3}
.pillnote{background:var(--d5);border-radius:var(--r-soft);padding:2px 10px;font-size:12px}
.pillsel{height:28px;border:1px solid var(--bs);border-radius:var(--r-full);padding:0 10px;background:var(--base);font:inherit;color:var(--fg1);max-width:360px}
.plist{border:1px solid var(--bs);border-radius:var(--r-soft);overflow:hidden;background:var(--solid2)}
.prow{display:flex;align-items:center;gap:8px;padding:0 10px 0 4px;height:36px;flex-wrap:nowrap;border-bottom:1px solid var(--bs)}
.plist>div:last-child .prow{border-bottom:0}
.pname{font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.cpt{background:var(--base);border-radius:var(--r-full);padding:1px 10px;font-size:12px;white-space:nowrap;flex:none}
.pexp{padding:8px 12px 12px 44px;background:var(--base);border-bottom:1px solid var(--bs)}
.dz{display:flex;align-items:center;justify-content:center;gap:8px;border:1px dashed var(--bst);border-radius:var(--r-soft);padding:18px;background:var(--base)}
.dzi{width:32px;height:32px;border-radius:var(--r-soft);background:var(--d5);display:grid;place-items:center}
.doctabs{margin:0}.doctabs button{font-size:13px}
.doclink{color:var(--fg-accent)}
.fsplit.even{grid-template-columns:1fr 1fr}
.apleft{min-height:0;overflow:auto;padding:16px;display:flex;flex-direction:column;gap:12px;border-right:1px solid var(--bs)}
.packrow{display:flex;align-items:center;gap:8px}
.apright{min-height:0;display:flex;flex-direction:column;background:var(--solid2)}
.pvhead{padding:8px 12px 0;flex:none;background:var(--base);border-bottom:1px solid var(--bs)}.pvhead .tabs{margin-bottom:8px}
.pvbar{display:flex;align-items:center;gap:4px;padding:4px 12px;flex:none;background:var(--base);border-bottom:1px solid var(--bs)}
.pvscroll{flex:1;min-height:0;overflow:auto;padding:16px}
.apaper{background:#fff;border:1px solid var(--bs);box-shadow:0 1px 4px rgba(0,0,0,.08);padding:28px 32px;line-height:1.5;color:var(--fg1)}
.lh{text-align:center;margin-bottom:16px;line-height:1.4}
.ltxt{white-space:pre-wrap}
.ftitle{margin-bottom:12px;line-height:1.4}
.pgrid{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--bst);margin-bottom:-1px}
.pc{border:1px solid var(--bst);margin:0 -1px -1px 0;padding:3px 6px;min-height:34px}.pc.w{grid-column:1 / -1}.pc.tall{min-height:80px;margin-top:8px;border-width:1px}
.pc span{display:block;font-size:.78em;color:var(--fg3);line-height:1.2}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.fld{position:relative;display:block;border:1px solid var(--bst);border-radius:var(--r-soft);padding:17px 10px 5px;background:var(--base)}
.fld.wide{grid-column:1 / -1}
.fld span{position:absolute;top:2px;left:10px;font-size:11px;color:var(--fg3);line-height:1.4}
.fld input,.fld textarea{width:100%;border:0;outline:0;background:transparent;font:inherit;color:var(--fg1);resize:vertical;padding:0}
.fld:focus-within{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent)}
.fld.ro{background:var(--solid2)}.fld.ro input{color:var(--fg2)}
.fld.area textarea{margin-top:2px;line-height:1.55}
.check{display:flex;flex-direction:column;gap:8px}.crow2{display:flex;align-items:center;gap:8px}
.emptyicon.ok{background:var(--t-green);color:#2a9953}

/* Contracts: Table Header, Table Group, settings popover (Design System 3.0) */
.thdr{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;flex-wrap:wrap}
.thdr .tabs{margin-bottom:0}
.hact{display:flex;align-items:center;gap:6px}
.tgl{width:28px;height:28px;border:0;border-radius:var(--r-soft);background:transparent;display:grid;place-items:center;color:var(--fg2);padding:0}
.tgl:hover:not(.on){background:var(--d5)}.tgl.on{background:var(--accent-sub);color:var(--fg-accent)}
.sf{display:flex;align-items:center;justify-content:space-between;gap:8px;width:180px;height:28px;padding:0 8px;border-radius:6px;background:var(--d5);color:var(--fg2)}
.sf input{border:0;background:transparent;outline:0;font:inherit;flex:1;min-width:0;color:var(--fg1)}.sf input::placeholder{color:var(--fg3)}
.sf:focus-within{box-shadow:0 0 0 2px var(--accent)}.sf input:focus-visible{outline:none}
.popwrap{position:relative}
.pop{position:absolute;z-index:15;top:36px;right:-8px;width:360px;background:var(--base);border:1px solid var(--bs);border-radius:var(--r-card);box-shadow:0 2px 8px rgba(0,0,0,.06),0 10px 28px rgba(0,0,0,.08)}
.pop:before{content:"";position:absolute;top:-6px;right:16px;width:10px;height:10px;background:var(--base);border-left:1px solid var(--bs);border-top:1px solid var(--bs);transform:rotate(45deg)}
.pop.display{width:280px;right:0}
.prow2{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:10px 16px 4px}
.prow2:first-child{padding-top:14px}
.prow2.dis{opacity:.5}
.sub2{font-size:12px;line-height:1.4;color:var(--fg3)}
.pfoot{display:flex;justify-content:space-between;align-items:center;padding:10px 16px 12px;margin-top:8px;border-top:1px solid var(--bs)}
.hist{margin:8px 16px 0;border-top:1px solid var(--bs);padding-top:8px;max-height:140px;overflow:auto;display:flex;flex-direction:column;gap:6px;font-size:12px;line-height:1.4}
.hist>div{display:flex;gap:10px}.hist .muted{min-width:84px}
.dsec{padding:12px;border-bottom:1px solid var(--bs)}.dsec.cl{border-bottom:0;max-height:300px;overflow:auto}
.dprow{display:flex;align-items:center;justify-content:space-between}
.fsel{width:140px;height:28px;border:0;border-radius:6px;background:var(--d5);padding:0 8px;font:inherit;color:var(--fg1)}
.crowc{display:flex;align-items:center;gap:8px;height:30px;padding:0 4px}
.frow{display:flex;align-items:center;gap:8px;padding:4px 0;margin-bottom:8px}
.fchip{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 6px 0 12px;border-radius:var(--r-full);background:var(--accent-sub);color:var(--fg-accent);font-weight:500}
.fchip button{border:0;background:transparent;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;color:inherit;padding:0}.fchip button:hover{background:var(--d10)}
.btn.tert{border:0;background:transparent;color:var(--fg-accent)}.btn.tert:hover:not(:disabled){background:var(--accent-sub-h)}
.fmenu{left:0;right:auto;max-height:340px;overflow:auto}
.menu-h{font-size:12px;color:var(--fg3);padding:6px 12px 2px}
.gtbl{border-collapse:separate;border-spacing:0;width:100%;font-size:13px}
.gtbl th{position:sticky;top:0;z-index:2;background:var(--solid2);text-align:left;font-weight:400;color:var(--fg1);padding:0 8px;height:28px;border-bottom:1px solid var(--bs);white-space:nowrap}
.gtbl th.r,.gtbl td.r{text-align:right}
.gtbl td{padding:4px 8px;height:36px;border-bottom:1px solid var(--bs);vertical-align:middle;color:var(--fg2);background:var(--base)}
.gtbl td.b,.gtbl td .b{color:var(--fg1)}
.gtbl .sub{display:inline;margin-left:6px;font-size:12px;line-height:1.4;color:var(--fg3);font-weight:400}
.gtbl tr.grow2 td{height:28px;padding:0;background:var(--solid2)}
.ginner{position:sticky;left:0;display:flex;align-items:center;gap:12px;height:27px;padding-left:4px;width:max-content;max-width:calc(100vw - 340px)}
.gname{font-weight:500;color:var(--fg1)}.ginfo{color:var(--fg3);font-size:12px;white-space:nowrap}
.gcol{width:28px;height:28px;border:0;border-radius:50%;background:transparent;display:grid;place-items:center;color:var(--fg2);padding:0}.gcol:hover{background:var(--d5)}
.gact{display:flex;gap:4px;align-items:center}
.gbtn{width:20px;height:20px;border:0;border-radius:50%;background:transparent;display:grid;place-items:center;color:var(--fg2);padding:0}.gbtn:hover{background:var(--d10)}
.gtbl tr.drow td:first-child{border-left:6px solid var(--bs)}
.gtbl tr.drow:hover td{background:var(--accent-sub-h)}.gtbl tr.drow.active td{background:var(--accent-sub)}
.mt4{margin-top:4px}

/* rows: one line, 36px, scroll sideways instead of wrapping (DS Table Row, Compact) */
.tbl th,.tbl td,.gtbl th,.gtbl td{white-space:nowrap}
.tbl.answer td{white-space:normal;height:auto;padding:8px}
.tbl,.gtbl{min-width:max-content}
.tbl td,.gtbl td{height:36px;padding-top:0;padding-bottom:0;line-height:20px}
.tbl th,.gtbl th{line-height:20px}
.gtbl tr.grow2 td{height:27px;line-height:20px}
.tbl td .chip,.gtbl td .chip{vertical-align:middle}

/* Contracts toolbar as icon buttons, table fills the container */
.canvas.pdc{display:flex;flex-direction:column}
.pd{flex:1;min-height:0;grid-template-rows:minmax(0,1fr)}
.pd-main{overflow:auto;display:flex;flex-direction:column;min-height:0}
.pd-main>.page{flex:none}
.pd-main>.fillpage{flex:1;min-height:0;display:flex;flex-direction:column;padding-bottom:16px}
.tblwrap.fill{flex:1;min-height:120px;max-height:none}
.pop.searchpop{width:260px;right:-4px;padding:8px}
.sf.wide{width:100%}

/* merged Table Configuration popover (DS: 280px, grouping slot, drill-in menu items) */
.pop.settings{width:280px;right:-8px}
.cfg-s{padding:12px;border-bottom:1px solid var(--bs)}
.cfg-m{padding:12px 2px}
.mi{display:flex;align-items:flex-start;gap:8px;width:100%;min-height:36px;padding:6px 8px 6px 10px;border:0;background:transparent;border-radius:var(--r-soft);text-align:left;line-height:1.6}
.mi:hover{background:var(--d5)}
.mi-t{flex:1;display:flex;flex-direction:column;padding-top:1.5px;min-width:0}.mi-s{color:var(--fg3)}
.mi svg{color:var(--fg2);flex:none;margin-top:2px}
.cfg-h{display:flex;align-items:center;gap:4px;padding:8px 12px 8px 8px;border-bottom:1px solid var(--bs)}
.cfg-b{padding:8px 12px;max-height:300px;overflow:auto}
.cfg-b.rules{padding:0 0 4px}
.pop.settings .prow2{padding:10px 14px 4px;gap:12px}
.toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:#141414;color:#e5e5e5;padding:8px 16px;border-radius:var(--r-soft);z-index:50;box-shadow:0 6px 8px rgba(0,0,0,.25);max-width:80vw}
@media (prefers-reduced-motion:reduce){.spin{animation:none}.sw span{transition:none}}
@media (max-width:1000px){.shell{grid-template-columns:1fr}.sidecol{display:none}.cols,.hub,.two{grid-template-columns:1fr}.split{grid-template-columns:1fr}.crow{grid-template-columns:1fr}.hdr-c{display:none}}
`;
