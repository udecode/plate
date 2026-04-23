---
date: 2026-04-11
topic: slate-browser-agent-browser-ios-setup-proof
status: in_progress
source_repos:
  - /Users/zbeyens/git/plate-2
  - /Users/zbeyens/git/slate-v2
  - /Users/zbeyens/git/agent-browser
---

# Slate Browser Agent-Browser iOS Setup Proof

## Goal

Prove the smallest honest `agent-browser` iOS Simulator setup before broader
transport work.

This is not the full transport architecture.
It is the first setup/proof spike.

## Why This First

- `agent-browser` already opens Safari on iOS Simulator locally
- it is closer to mobile web truth than desktop emulation
- it is a better immediate browser-mobile spike than `agent-device`
- it keeps the next step grounded before broader planning

## What Was Proved

Using a live local `slate-v2` example on `http://localhost:3100`:

1. `agent-browser` opened iOS Simulator Safari on the local placeholder IME
   example with `?debug=1`
2. `agent-browser` returned the resolved URL
3. `agent-browser snapshot -i` returned actionable controls:
   - `Undo`
   - `Redo`
   - `Copy JSON`
   - `Copy Artifact`
   - the textbox

That is enough to say:

- the iOS Simulator Safari transport is real
- the current IME debug surface is reachable there
- the spike is worth formalizing

## What Is Proved Cleanly Now

- historic setup/open proof exists through `pnpm proof:agent-browser:ios:local`
- the iOS provider is a real transport in principle

Current useful read:

- do **not** rely on the current `agent-browser` iOS provider for local Slate
  example-route proof on this repo
- it can open the URL, but it now often exposes only the Next shell/document
  scaffolding instead of the mounted example editor
- that makes selector-based proof on these routes untrustworthy
- direct Appium iOS Safari is now the better setup transport for these local
  routes

## Added Operator Surface

In `/Users/zbeyens/git/slate-v2`:

- `pnpm proof:agent-browser:ios:local`
- `pnpm proof:agent-browser:ios:placeholder-input:local`
- `pnpm proof:agent-browser:ios:inline-edge-input:local`
- `pnpm proof:agent-browser:ios:void-edge-input:local`

This command assumes a local server is already running and does:

1. open iOS Simulator Safari on the chosen example
2. print the resolved URL
3. print an initial interactive snapshot
4. hand off to the human for manual interaction if needed

Default target:

- `placeholder?debug=1`

## Manual Setup

Run the local site first:

```sh
cd /Users/zbeyens/git/slate-v2
PORT=3100 pnpm serve
```

Then in another terminal:

```sh
cd /Users/zbeyens/git/slate-v2
pnpm proof:agent-browser:ios:local
```

Optional overrides:

```sh
AGENT_BROWSER_IOS_DEVICE="iPhone 17 Pro" \
AGENT_BROWSER_DEBUG_QUERY="debug=1" \
bash ./scripts/proof-agent-browser-ios-local.sh 3100 placeholder
```

## Current Take

This is good enough to justify the next architecture work.

It is **not** good enough to claim:

- stable iOS automated proof lane
- stable post-input artifact capture
- full IME parity on iOS

## Follow-On Finding

The current local issue is likely tool-side, not page-side.

Evidence:

- `agent-browser -p ios` opens the local route
- but batch `click #placeholder-ime` / `type #placeholder-ime ...` can fail
  because the mounted editor node never appears
- on the same machine, direct Appium iOS Safari can load the exact same route
  and read the real editor HTML

Upstream follow-up:

- [vercel-labs/agent-browser#1221](https://github.com/vercel-labs/agent-browser/issues/1221)

That means this transport should be treated as a known tooling blocker on local
Slate routes until the upstream issue is resolved.
It should not be the default iOS setup lane for this proof program anymore.

## Next Honest Step

Use direct Appium iOS Safari for setup truth on local routes.

Keep `agent-browser` iOS only as an upstream bug reference until:

1. the mounted editor node is reliably present after route open
2. selector actions work on the real page instead of the shell document
