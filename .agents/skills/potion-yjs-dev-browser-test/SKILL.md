---
description: Use when a Slate Yjs collaboration behavior is suspicious and Potion should be used as a live reference implementation through dev-browser, especially for offline/reconnect, selection, or history scenarios.
name: potion-yjs-dev-browser-test
metadata:
  skiller:
    source: .agents/rules/potion-yjs-dev-browser-test.mdc
---

# Potion Yjs Dev Browser Test

## Purpose

Use Potion as a live behavioral oracle, not as the product under test. The skill records how to isolate one Potion tab offline with dev-browser and then replay the current bug's repro steps. Do not bake one historical repro into the workflow.

## Workflow

1. Confirm the user is logged in to the persistent debug Chrome connected at `127.0.0.1:9222`.
2. Use the existing debug browser, never a disposable browser, unless the user explicitly asks.
3. Use a disposable or agreed Potion document. Only reset or overwrite content when the current repro requires it.
4. Open two named pages, usually `potion-yjs-reference-a` and `potion-yjs-reference-b`, pointing at the same Potion URL.
5. Use per-page CDP to make only B offline. Never use `page.context().setOffline(true)` for this workflow; it affects the whole browser context and usually disconnects both tabs.
6. Execute the current repro steps exactly:
   - B-only local edits while B is offline
   - A-side online edits while A remains connected
   - B reconnect
   - observe final convergence, selection, history, or presence state
7. Compare the observed Potion result with the local Slate Yjs result. Treat Potion as reference evidence, not automatic proof; confirm the local schema and operation shape are equivalent.

## No Bundled Script

Do not keep a reusable script in this skill. Each collaboration bug has different setup, operations, waits, and assertions. A fixed script becomes stale fast and tempts agents to rerun yesterday's bug.

For each new case, write a small one-off `dev-browser --connect http://127.0.0.1:9222 <<'EOF'` script from the current repro steps. Keep it in the terminal or `.tmp/` only if it needs iteration; do not promote it into the skill unless the user explicitly asks for a durable tool.

## Per-Page CDP Pattern

Use this shape inside the current repro script:

```js
const pageA = await browser.getPage('potion-yjs-reference-a');
const pageB = await browser.getPage('potion-yjs-reference-b');
const cdpB = await pageB.context().newCDPSession(pageB);

await cdpB.send('Network.enable');
await cdpB.send('Network.emulateNetworkConditions', {
  offline: true,
  latency: 0,
  downloadThroughput: 0,
  uploadThroughput: 0,
});

// Run B-local offline repro steps here.

await cdpB.send('Network.emulateNetworkConditions', {
  offline: false,
  latency: 0,
  downloadThroughput: -1,
  uploadThroughput: -1,
});
```

Before editing, probe network isolation:

- A fetch should succeed.
- B fetch should fail while offline.

## One-Off Repro Template

For each new case, write a small dev-browser script from the user's steps:

1. Open both Potion pages and wait for `[data-slate-editor="true"]`.
2. Prepare only the starting document state required by this repro.
3. Put B offline with per-page CDP.
4. Perform the B-side offline operation.
5. Perform the A-side online operation.
6. Reconnect B.
7. Read the document state from both pages and log the result.
8. Restore B online and detach CDP sessions before exiting.

## Interpretation

- If Potion preserves content or history that local Slate Yjs loses, treat the local behavior as suspicious.
- If Potion produces the same result as local Slate Yjs, treat that conflict behavior as plausible, then verify the local operation sequence really matches Potion.
- If Potion and local differ, do not jump straight to a fix. First compare editor schema, normalization, command path, selection shape, and operation ordering.

## Failure Handling

- If no editor is found, stop and ask the user to log in to Potion in the debug Chrome.
- If the Potion page says the document does not exist, stop and ask for a valid shared document URL.
- If navigation is interrupted, force both pages online with CDP and retry once.
- If a live observed run times out, keep the current tab state and resume from the printed step instead of restarting blindly.
