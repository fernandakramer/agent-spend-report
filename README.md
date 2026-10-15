# Agent spend report

A prototype of the report described in the writeup, built with Claude Code. It connects each team's agent spend in Claude Code to the merged PRs it produced and what they delivered. It uses synthetic data, and the per-team Agents switch is a mock.

## How to run it

Open `index.html` in a browser. There is no build step and nothing to install.

## What I'd build next

1. Replace the synthetic data with real usage data and merged PRs for a pilot customer, estimating agent spend from how each session was launched and which requests came from sub-agents.
2. Partner with the Claude Code team to record agent work and the PRs it produces directly.
3. Connect the Agents switch to Claude Code's existing on/off settings for autonomous modes and sub-agents.
4. Link merged PRs to key metrics customers already track, and put a dollar or time-saved figure on those metrics.
