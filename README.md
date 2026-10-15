# Agent spend report

A prototype for the take-home "Paying for Intelligence." It is a report for the person who owns the Claude Enterprise budget. It connects each team's agent spend in Claude Code to the merged PRs that spend produced and what those PRs delivered.

The prototype was built with Claude Code. It runs on synthetic data for a fictional company with six teams over one quarter.

## How to run it

There is no build step and nothing to install. Open `index.html` in a browser.

If your browser blocks local files, serve the folder with any static server and open http://localhost:8765. Two options:

```bash
ruby -run -e httpd . -p 8765
```

```bash
python3 -m http.server 8765
```

## What it shows

The report follows the three user stories in the writeup.

1. As a budget owner, I can see how much of each team's spend was agent work and how much of it ended in a merged PR. The summary cards and the team table show total spend, agent spend, agent share, and agent spend with no merged PR for each team. A team is highlighted when more than 40% of its agent spend ended in no merged PR.
2. As a budget owner, I can see the cost of each merged PR by team, with a short summary of what the PR did. Select a team to see its merged PRs, sorted by agent cost, each with a plain-language summary.
3. As a budget owner, I can turn agent use on or off for a team. Each team row has an Agents switch. In the prototype it is a mock that only remembers its setting in your browser. In the first milestone it would map to Claude Code's existing on/off settings for autonomous modes and sub-agents.

The synthetic data is set up to show two different situations. Growth spent most of its budget on automated agent runs, and most of that ended in no merged PR. Payments has the most expensive PR, a card tokenization migration that a budget owner may well judge worth the cost. A high cost per PR isn't a problem on its own. The report gives the budget owner what they need to make that call.

## How the numbers are computed

Agent spend is an estimate. A session launched by an automated job counts as agent work in full. A session launched by a person counts only the requests that came from sub-agents. A session's cost is split evenly across the merged PRs it contributed to. Sessions that contributed to no merged PR count toward "agent spend, no merged PR."

The writeup explains why this is only an estimate. Usage data shows how each session was launched and which requests came from sub-agents, but that isn't a perfect measure of agent work, and nothing links sessions to merged PRs today.

## Files

- `data.js` holds the synthetic teams, merged PRs, and sessions. Sessions are generated from a fixed seed, so the numbers are the same on every load.
- `report.js` turns sessions and PRs into the per-team report.
- `app.js` renders the page and handles the Agents switch.
- `index.html` and `styles.css` hold the page and its styling.

## What the real version would read

Instead of `data.js`, the real version would read two sources.

- Claude Code usage data, which reports token cost per request with a session ID. Each request also says whether it came from the main conversation or a sub-agent. An optional attribute shows how the session was launched, such as from the CLI, an IDE, or the SDK.
- Merged PRs from GitHub, matched to sessions through the commits each session made. PR titles and descriptions would feed the short summary of what each PR delivered.

## What I'd build next

These follow the writeup's "What isn't possible yet" and "Six months from now" sections.

1. Replace the synthetic data with a connection to real Claude Code usage data and GitHub for a pilot customer, using the estimate described above.
2. Check the estimate against a hand-reviewed sample of PRs, and partner with the Claude Code team to record agent work and the PRs it produces directly.
3. Connect the Agents switch to Claude Code's existing settings. If pilot customers ask for finer control after seeing the report, work with the Claude Code team on a control for the share or number of tokens that can go to agents.
4. Link merged PRs to key metrics customers already track, then put a dollar or time-saved figure on those metrics so the report can show return alongside cost.
5. Build Claude skills from the report's findings, giving agents better instructions where their work rarely ends in a merged PR.
6. Extend the report to outcomes beyond code, starting with other work whose results are as clear and measurable as a merged PR.
