// Renders the report and handles the per-team agent switch.

const STORAGE_KEY = "agent-spend-report.agentsOff";
const LIMITS_KEY = "agent-spend-report.limits";

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private window, file:// restrictions). The controls still work for this visit.
  }
}

const money = (n) => (n === null ? "–" : `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`);
const pct = (n) => `${Math.round(n * 100)}%`;
const el = (tag, attrs = {}, ...children) => {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  node.append(...children.filter((c) => c !== null && c !== undefined));
  return node;
};

const report = buildReport(TEAMS, PRS, SESSIONS);
const agentsOff = new Set(load(STORAGE_KEY, []));
const limits = load(LIMITS_KEY, {});
// Default limit: this quarter's spend plus 20%, rounded up to the nearest $1,000.
const limitFor = (r) => limits[r.id] ?? Math.ceil((r.totalSpend * 1.2) / 1000) * 1000;
let selectedTeam = null;

function renderSummary() {
  const t = report.totals;
  const cards = [
    ["Total Claude Code spend", money(t.totalSpend), PERIOD],
    ["Agent spend", money(t.agentSpend), `${pct(t.agentSpend / t.totalSpend)} of total`],
    ["Agent spend that ended in a merged PR", money(t.agentSpendOnPRs), `${pct(t.agentSpendOnPRs / t.agentSpend)} of agent spend, ${t.mergedPRs} PRs`],
    ["Agent spend with no merged PR", money(t.agentSpendNoPR), `${pct(t.agentSpendNoPR / t.agentSpend)} of agent spend`],
  ];
  document.getElementById("summary").replaceChildren(
    ...cards.map(([label, value, note]) => el("div", { class: "card" }, el("div", { class: "card-label" }, label), el("div", { class: "card-value" }, value), el("div", { class: "card-note" }, note))),
  );
}

function renderTeams() {
  const body = document.getElementById("team-rows");
  body.replaceChildren(
    ...report.rows.map((r) => {
      const off = agentsOff.has(r.id);
      const toggle = el(
        "button",
        {
          class: `toggle ${off ? "off" : "on"}`,
          "aria-pressed": String(!off),
          "aria-label": `Agents for ${r.name}`,
          onclick: (e) => {
            e.stopPropagation();
            off ? agentsOff.delete(r.id) : agentsOff.add(r.id);
            save(STORAGE_KEY, [...agentsOff]);
            renderTeams();
          },
        },
        off ? "Agents off" : "Agents on",
      );
      const limit = limitFor(r);
      const limitInput = el("input", {
        type: "number",
        min: "0",
        step: "1000",
        value: String(limit),
        class: "limit",
        "aria-label": `Spend limit for ${r.name}`,
        onclick: (e) => e.stopPropagation(),
        onchange: (e) => {
          limits[r.id] = Math.max(0, Math.round(Number(e.target.value) || 0));
          save(LIMITS_KEY, limits);
          renderTeams();
        },
      });
      const used = limit > 0 ? r.totalSpend / limit : null;
      return el(
        "tr",
        { class: `${selectedTeam === r.id ? "selected" : ""} ${r.noPRShare > 0.4 ? "flag" : ""}`, onclick: () => selectTeam(r.id) },
        el("td", { class: "team" }, r.name),
        el("td", { class: "num" }, money(r.totalSpend)),
        el("td", { class: "num" }, money(r.agentSpend)),
        el("td", { class: "num" }, pct(r.agentShare)),
        el("td", { class: "num" }, String(r.prs.length)),
        el("td", { class: "num" }, money(r.agentCostPerPR)),
        el("td", { class: "num" }, el("span", { class: r.noPRShare > 0.4 ? "warn" : "" }, `${money(r.agentSpendNoPR)} (${pct(r.noPRShare)})`)),
        el(
          "td",
          { class: "num" },
          el("span", { class: "limit-wrap" }, "$", limitInput),
          el("div", { class: `card-note ${used > 1 ? "warn" : ""}` }, used === null ? "No limit" : `${pct(used)} used`),
        ),
        el("td", {}, toggle),
      );
    }),
  );
}

function selectTeam(id) {
  selectedTeam = id;
  renderTeams();
  const r = report.rows.find((x) => x.id === id);
  const prs = [...r.prs].sort((a, b) => b.agentCost - a.agentCost);
  document.getElementById("detail").replaceChildren(
    el("h2", {}, `${r.name}: merged PRs and their agent cost`),
    el(
      "p",
      { class: "muted" },
      `${money(r.agentSpendOnPRs)} of agent spend went to ${prs.length} merged ${prs.length === 1 ? "PR" : "PRs"}. ${money(r.agentSpendNoPR)} went to work with no merged PR, including ${r.deadEndRuns} automated ${r.deadEndRuns === 1 ? "run" : "runs"}. A high cost per PR isn't a problem on its own; judge it against what the PR delivered.`,
    ),
    el(
      "table",
      { class: "prs" },
      el("thead", {}, el("tr", {}, el("th", {}, "PR"), el("th", {}, "What it delivered"), el("th", { class: "num" }, "Agent cost"), el("th", { class: "num" }, "Agent share of PR cost"))),
      el(
        "tbody",
        {},
        ...prs.map((pr) =>
          el(
            "tr",
            {},
            el("td", { class: "pr-id" }, pr.id),
            el("td", {}, el("div", { class: "pr-title" }, pr.title), el("div", { class: "muted" }, pr.summary)),
            el("td", { class: "num" }, money(pr.agentCost)),
            el("td", { class: "num" }, pct(pr.agentShare)),
          ),
        ),
      ),
    ),
  );
}

renderSummary();
renderTeams();
selectTeam(report.rows[0].id);
