---
title: Encode move_node through visible destination slots
date: 2026-05-26
last_updated: 2026-05-29
category: logic-errors
module: slate-yjs
problem_type: logic_error
component: tooling
symptoms:
  - Keyboard undo after a reconnected offline block move changed only the initiating editor
  - Other connected peers stayed on the moved order after Cmd+Z
  - Reconcile snapped the initiating editor back to the remote Yjs order
root_cause: logic_error
resolution_type: code_fix
severity: high
tags: [slate-yjs, yjs, move-node, undo-redo, playwright]
---

# Encode move_node through visible destination slots

## Problem
After an offline peer moved a block, reconnected, and pressed keyboard Undo, the initiating editor showed the undone order while the other peers stayed on the moved order.

## Symptoms
- Reconnect converged all peers to `beta / alpha / gamma!`.
- Keyboard Undo on B changed B to `alpha / beta / gamma!`.
- A/C/D stayed at `beta / alpha / gamma!`.
- B Reconcile restored B to `beta / alpha / gamma!`, proving B's Yjs document had not encoded the local undo.

## What Didn't Work
- Checking the button path alone was misleading. The Undo button used the Yjs history stack and converged, while keyboard Undo fell back to operation replay.
- Treating the browser event path as the root cause missed the real failure: the fallback `move_node` encoder accepted the operation but produced no visible Yjs value change.
- Waiting longer did not help. The split was stable because the wrong Yjs tree state had already been exported.

## Solution
Represent moved nodes with a virtual placeholder at the destination and keep the original Yjs node hidden in place:

```ts
const placeholder = createVirtualYjsMovePlaceholder(target)

insertYjsChild(root, newParent, operation.newPath.at(-1)!, placeholder)
```

The regression should cover both layers:

- Core: `move_node [0] -> [2]` encodes `beta / gamma / alpha` while `alpha` remains the same `Y.XmlElement`.
- Browser: offline move, reconnect, keyboard Undo, keyboard Redo, assert every peer converges.

## Why This Works
`@slate/yjs` cannot treat a moved subtree as disposable if a remote peer may still edit the original shared type. The virtual placeholder gives the destination a visible slot that resolves back to the same hidden source node. Destination insertion is computed against visible child slots, so hidden sources and placeholders do not corrupt same-parent forward indexes.

Undo and redo then work through Yjs: undo removes the placeholder and restores the hidden source; redo hides the source and restores the placeholder. Remote text remains attached to the same Yjs node through both directions.

## Prevention
- Test same-parent and cross-parent `move_node` operations with direct identity assertions against the visible Yjs node.
- Browser collaboration tests should exercise keyboard history, not just toolbar buttons.
- When a local editor changes but Reconcile restores the remote value, inspect the Yjs document state before debugging UI rendering.
- Do not clone a moved subtree when the operation needs collaboration conflict resolution. Use a traceable virtual placeholder or explicitly mark the shape unsupported.

## Related Issues
- `docs/solutions/ui-bugs/yjs-user-history-button-routing-2026-05-25.md`
- `docs/solutions/runtime-errors/yjs-disconnected-undo-history-offset-2026-05-25.md`
- `docs/solutions/logic-errors/yjs-offline-replace-undo-concurrent-append-2026-05-25.md`
