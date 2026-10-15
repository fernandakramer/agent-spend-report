// Turns sessions and merged PRs into the per-team numbers the report shows.

// The agent part of a session. A session started by an automated job is all
// agent work. In a session a person started, only the sub-agent cost counts.
// This is an estimate: see "What isn't possible yet" in the writeup.
function agentCost(session) {
  return session.launchedBy === "automated" ? session.costMain + session.costSubagent : session.costSubagent;
}

function totalCost(session) {
  return session.costMain + session.costSubagent;
}

function buildReport(teams, prs, sessions) {
  const byTeam = new Map(
    teams.map((t) => [
      t.id,
      { ...t, totalSpend: 0, agentSpend: 0, agentSpendOnPRs: 0, agentSpendNoPR: 0, prs: [], deadEndRuns: 0 },
    ]),
  );
  const prCost = new Map(prs.map((pr) => [pr.id, { agent: 0, total: 0 }]));

  for (const s of sessions) {
    const team = byTeam.get(s.team);
    const agent = agentCost(s);
    team.totalSpend += totalCost(s);
    team.agentSpend += agent;

    if (s.prIds.length === 0) {
      team.agentSpendNoPR += agent;
      if (s.launchedBy === "automated") team.deadEndRuns += 1;
      continue;
    }
    team.agentSpendOnPRs += agent;
    // A session that contributed to several PRs splits its cost evenly between them.
    for (const id of s.prIds) {
      const c = prCost.get(id);
      c.agent += agent / s.prIds.length;
      c.total += totalCost(s) / s.prIds.length;
    }
  }

  for (const pr of prs) {
    const c = prCost.get(pr.id);
    byTeam.get(pr.team).prs.push({ ...pr, agentCost: c.agent, agentShare: c.total ? c.agent / c.total : 0 });
  }

  const rows = [...byTeam.values()].map((t) => ({
    ...t,
    agentShare: t.totalSpend ? t.agentSpend / t.totalSpend : 0,
    noPRShare: t.agentSpend ? t.agentSpendNoPR / t.agentSpend : 0,
    agentCostPerPR: t.prs.length ? t.agentSpendOnPRs / t.prs.length : null,
  }));

  const sum = (key) => rows.reduce((a, r) => a + r[key], 0);
  const totals = {
    totalSpend: sum("totalSpend"),
    agentSpend: sum("agentSpend"),
    agentSpendOnPRs: sum("agentSpendOnPRs"),
    agentSpendNoPR: sum("agentSpendNoPR"),
    mergedPRs: rows.reduce((a, r) => a + r.prs.length, 0),
  };

  return { rows, totals };
}
