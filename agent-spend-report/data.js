// Synthetic data for the prototype. Nothing here comes from a real organization.
//
// The shape mirrors what the real product would read:
//   - sessions: token cost per Claude Code session, split into main-conversation
//     and sub-agent cost, plus how the session was launched (by a person or an
//     automated job). In production this comes from Claude Code's usage data.
//   - prs: merged PRs, with the sessions that contributed to them. In production
//     this comes from GitHub, matched to sessions through the commits they made.

const PERIOD = "Q3 2026";

const TEAMS = [
  { id: "payments", name: "Payments" },
  { id: "platform", name: "Platform" },
  { id: "mobile", name: "Mobile" },
  { id: "data", name: "Data Platform" },
  { id: "growth", name: "Growth" },
  { id: "security", name: "Security" },
];

// Merged PRs with a plain-language summary of what each delivered.
// `effort` scales how much session work went into the PR.
const PRS = [
  { id: "PR-4812", team: "payments", effort: 9, title: "Migrate card tokenization to the new vault", summary: "Moves stored card tokens to the new vault service, a prerequisite for the Q4 compliance audit." },
  { id: "PR-4830", team: "payments", effort: 2, title: "Retry logic for failed payouts", summary: "Retries transient payout failures automatically instead of paging on-call." },
  { id: "PR-4851", team: "payments", effort: 1, title: "Fix rounding in multi-currency refunds", summary: "Corrects a rounding error that over-refunded some non-USD orders." },

  { id: "PR-2201", team: "platform", effort: 1, title: "Upgrade logging library across services", summary: "Routine dependency upgrade across 14 services, removing a known vulnerability." },
  { id: "PR-2207", team: "platform", effort: 1, title: "Add health checks to job workers", summary: "Workers now report health, so stuck jobs restart automatically." },
  { id: "PR-2215", team: "platform", effort: 1, title: "Flaky test fixes in CI", summary: "Fixes the eight most frequent flaky tests, cutting CI reruns." },
  { id: "PR-2219", team: "platform", effort: 2, title: "Cache warmup on deploy", summary: "Pre-warms caches during deploys to avoid latency spikes after release." },
  { id: "PR-2230", team: "platform", effort: 1, title: "Remove unused feature flags", summary: "Deletes 31 stale feature flags and the code paths behind them." },

  { id: "PR-7105", team: "mobile", effort: 3, title: "Offline mode for order history", summary: "Customers can view past orders without a connection." },
  { id: "PR-7112", team: "mobile", effort: 1, title: "Fix crash on Android 15 camera permission", summary: "Fixes the top crash in the last release." },

  { id: "PR-3304", team: "data", effort: 2, title: "Backfill revenue table for 2025", summary: "Fills gaps in last year's revenue data used by finance dashboards." },
  { id: "PR-3311", team: "data", effort: 1, title: "Schema tests for the events pipeline", summary: "Catches malformed events before they reach the warehouse." },
  { id: "PR-3320", team: "data", effort: 2, title: "Speed up nightly aggregation job", summary: "Cuts the nightly job from four hours to fifty minutes." },

  { id: "PR-9001", team: "growth", effort: 1, title: "Copy change on signup page", summary: "Updates the headline and button text on the signup page." },

  { id: "PR-5502", team: "security", effort: 4, title: "Rotate service credentials automatically", summary: "Replaces manual quarterly credential rotation with an automated job." },
  { id: "PR-5517", team: "security", effort: 1, title: "Patch dependency with known exploit", summary: "Upgrades a library with a published exploit across all services." },
];

// Per-team behavior used to generate sessions.
//   automatedShare: share of PR work done by sessions launched by an automated job
//   subagentShare:  share of a person-launched session's cost that came from sub-agents
//   deadEndRuns:    automated agent runs that never contributed to a merged PR
//   otherWork:      person-led sessions with no PR (reviewing, planning, questions)
const PROFILES = {
  payments: { automatedShare: 0.45, subagentShare: 0.25, deadEndRuns: 3, otherWork: 10 },
  platform: { automatedShare: 0.8, subagentShare: 0.3, deadEndRuns: 2, otherWork: 6 },
  mobile: { automatedShare: 0.35, subagentShare: 0.15, deadEndRuns: 0, otherWork: 8 },
  data: { automatedShare: 0.55, subagentShare: 0.2, deadEndRuns: 1, otherWork: 6 },
  growth: { automatedShare: 0.7, subagentShare: 0.35, deadEndRuns: 14, otherWork: 5 },
  security: { automatedShare: 0.4, subagentShare: 0.2, deadEndRuns: 1, otherWork: 9 },
};

// Small seeded random generator, so the synthetic data is the same on every load.
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateSessions() {
  const rand = mulberry32(20261015);
  const between = (lo, hi) => lo + rand() * (hi - lo);
  const sessions = [];
  let n = 0;
  const add = (team, launchedBy, cost, subagentShare, prIds) => {
    const costSubagent = launchedBy === "automated" ? cost * 0.3 : cost * subagentShare;
    sessions.push({
      id: `s-${String(++n).padStart(4, "0")}`,
      team,
      launchedBy,
      costMain: cost - costSubagent,
      costSubagent,
      prIds,
    });
  };

  for (const pr of PRS) {
    const p = PROFILES[pr.team];
    const count = 1 + Math.round(pr.effort * between(0.8, 1.4));
    for (let i = 0; i < count; i++) {
      const automated = rand() < p.automatedShare;
      const cost = between(240, 840) * (automated ? 1.6 : 1);
      add(pr.team, automated ? "automated" : "person", cost, p.subagentShare, [pr.id]);
    }
  }

  for (const team of TEAMS) {
    const p = PROFILES[team.id];
    for (let i = 0; i < p.deadEndRuns; i++) add(team.id, "automated", between(360, 1320), p.subagentShare, []);
    for (let i = 0; i < p.otherWork; i++) add(team.id, "person", between(60, 300), p.subagentShare, []);
  }

  return sessions;
}

const SESSIONS = generateSessions();
