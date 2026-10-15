# Agent spend report

A prototype of the report described in the writeup, built with Claude Code. It connects each team's agent spend in Claude Code to the merged PRs it produced and what they delivered. It runs on synthetic data for a fictional company with six teams over one quarter.

## How to run it

The prototype is live at https://fernandakramer.github.io/agent-spend-report/.

To run it locally, download the repo (Code → Download ZIP), unzip it, and open `index.html` in a browser. There is no build step and nothing to install.

If your browser blocks local files, serve the folder with any static server and open http://localhost:8765. Two options:

```bash
ruby -run -e httpd . -p 8765
```

```bash
python3 -m http.server 8765
```

## What it shows

The report follows the three user stories in the writeup.

1. Each team's total spend, agent spend, and how much agent spend ended in no merged PR. Teams where more than 40% of agent spend ended in no merged PR are highlighted.
2. Select a team to see its merged PRs, the agent cost of each, and a short summary of what each PR did.
3. A spend limit and an Agents switch for each team. Both are mocks. In the first milestone, the spend limit would map to Claude Enterprise's existing group spend limits, and the switch to Claude Code's existing on/off settings for autonomous modes and sub-agents.

Agent spend is estimated from how each session was launched and which requests came from sub-agents. A session launched by an automated job counts in full, and a session launched by a person counts only its sub-agent requests.

## What I'd build next

1. Replace the synthetic data with real usage data and merged PRs for a pilot customer.
2. Partner with the Claude Code team to record agent work and the PRs it produces directly.
3. Connect the spend limit and Agents switch to the existing settings, and add finer control over agent use if customers ask for it.
4. Link merged PRs to key metrics customers already track, and put a dollar or time-saved figure on those metrics.
