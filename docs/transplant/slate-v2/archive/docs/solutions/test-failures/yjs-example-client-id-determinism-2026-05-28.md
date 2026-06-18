---
title: Yjs example client ids must match real Y.Doc client ids
date: 2026-05-28
category: docs/solutions/test-failures
module: yjs-collaboration example
problem_type: test_failure
component: testing_framework
symptoms:
  - Full yjs-collaboration Playwright run sometimes ordered same-position concurrent inserts differently from the focused test.
  - The page diagnostics showed fixed peer client ids while the underlying Y.Doc client ids were random.
root_cause: incomplete_setup
resolution_type: code_fix
severity: medium
tags: [slate-yjs, yjs, playwright, client-id, determinism]
---

# Yjs example client ids must match real Y.Doc client ids

## Problem
The Yjs collaboration example displayed fixed peer ids such as `101` and `202`,
but each peer's `Y.Doc` still used Yjs' random default `clientID`. That made
same-position concurrent insert ordering drift between focused and full
Playwright runs.

## Symptoms
- A focused insert-fragment reconnect test passed with `alpha AdaLin fragment`.
- The same row inside the full file could converge to `alphaLin fragment Ada`.
- The visible diagnostics implied deterministic peers, but the CRDT tie-breaker
  used different random document ids.

## What Didn't Work
- Treating this as a product merge regression was too broad. Both documents
  preserved the local fragment and remote append; only the tie-break order moved.
- Weakening the e2e assertion would have hidden the mismatch between displayed
  peer ids and real Yjs identities.

## Solution
Assign the example's fixed peer id to the actual `Y.Doc` before seeding it:

```ts
for (const peer of PEERS) {
  const doc = new Y.Doc()

  doc.clientID = peer.clientId
  Y.applyUpdate(doc, Y.encodeStateAsUpdate(seedDoc), NETWORK_ORIGIN)
}
```

## Why This Works
Yjs orders concurrent inserts at the same position using document identity. The
example already treats peers as stable actors in its UI, awareness state, and
tests, so the CRDT document identity needs to use the same stable id. Once those
ids match, focused and full Playwright runs exercise the same ordering rule.

## Prevention
- In deterministic multi-peer examples, set `Y.Doc.clientID` explicitly for
  every simulated peer.
- Do not assume an awareness client id controls Yjs document ordering.
- Keep e2e assertions strict when the demo claims stable peer identities; fix the
  simulation identity instead of allowing both orders.

## Related Issues
- `docs/solutions/logic-errors/yjs-structural-wrap-fragment-parity-2026-05-28.md`
- `docs/solutions/ui-bugs/yjs-user-history-button-routing-2026-05-25.md`
