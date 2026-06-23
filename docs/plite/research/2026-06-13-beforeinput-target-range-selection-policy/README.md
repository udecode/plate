# beforeinput target-range selection policy

## Question

Should Plite allow explicit `beforeinput.getTargetRanges()` selection import even when live DOM selection import is policy-gated as model-owned?

## Scope

- Current Plite `beforeinput` selection policy after P155.
- Local source reads from sibling editor repositories only.
- No runtime patch from this artifact.
- No raw issue corpus or broad web scrape.

## Verdict

Keep P155.

External source supports the distinction P155 now makes:

- Explicit `beforeinput` target ranges are event payloads that may be the authoritative edit range.
- Live DOM selection is a separate, noisier signal that can still be policy-gated.
- Target-range import must still be constrained by current editor ownership and stale-range guards.

This artifact promotes no new runtime work. It closes as a docs/research validation packet for the already-kept Plite patch.

## Local Plite Mapping

- `packages/plite-react/src/editable/runtime-before-input-events.ts`: `shouldAllowBeforeInputSelectionImport` allows import when the event has target ranges, even when `selectionPolicyAllowsDOMImport` is false.
- `packages/plite-react/src/editable/selection-reconciler.ts`: target ranges are still checked for editor ownership and stale collapsed insert ranges.
- `packages/plite-react/test/runtime-before-input-events-contract.test.ts`: contract locks target-range import under model-owned live selection policy.

## Stop Rule

Stop after one focused source shard if the source-backed invariant is clear and maps to an already-proved Plite packet. Do not collect extra repos for decoration.

## Current State

- Source shard complete.
- No new open leads.
- P155 remains kept.
