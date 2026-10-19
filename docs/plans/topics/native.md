# Native input

The ledger asks how browser input becomes canonical edits. The 2026-10-04 audit stopped. Each mounted Editable has one input controller built on the shared `DOMInputRuntime`, every accepted edit lands as a canonical transaction through either the model command path or the single native-text writer, and the integrity observer restores DOM mutations nothing authorized. No competing write path exists to remove. `node tooling/scripts/review-ledger.mjs show native` prints the scope's history.

## Layer and owner

| Responsibility | Decision |
| --- | --- |
| Shared input state | `packages/plitejs/src/react/editable/editable-dom-runtime.ts` binds one `DOMInputRuntime` per Editable. |
| Arbitration | `runtime-input-events.ts` excludes Android from root repair and suppresses React repair after a root claim. |
| Native text | `dom-repair-queue.ts` writes accepted native text through canonical transactions. |
| Integrity | The observer restores unauthorized DOM changes and recognizes only its exact owned attributes. |
| Composition | IME lifetime and composition-owned history grouping stay with the native owner; `ReactApi.settleInput()` flushes a pending composition end ([autocomplete](autocomplete.md)). |

Rejected, and why:

| Alternative | Why it lost |
| --- | --- |
| Absorbing router, controller and kernel into `DOMInputRuntime` | No caller benefit; the binding already shares that state. |
| Uniform model-only handling | Still needs IME reconciliation. |
| Uniform DOM ownership | Cannot replace semantic commands and renderer safety. |
| A generic input primitive | No current caller. |

## What other editors do

Not compared in this scope; the [editor comparison](editor-comparison.md) holds the cross-editor reads.

## Main changes

- None since the 2026-10-04 audit; the 5066 safety-flag cut and composition-owned history stand.

## Open work

- Double insertion, lost pending input and split undo stay the critical regression risks; no physical-device IME run backs the Stop. owner: Verify. stop: a device run per platform.
