# Native Text Repair Idle OSS Validation

Date: 2026-06-13

Scope:
- Validate the Plite deferred native text repair idle reduction with source
  reads from ProseMirror and Lexical.
- Decide keep/revert/quarantine from source-backed invariants and Plite-native
  measurements, not from copied implementation details.

Outcome:
- Keep the Plite `1ms` deferred native text repair idle patch.
- ProseMirror's normal mutation observer path flushes immediately. Its 20ms
  timers are specific browser/platform repair guards, mostly composition,
  Android, IE, Safari, and selection restoration.
- Lexical dispatches native `input` through a synchronous editor update path
  and batches reconciliation with a microtask. It also preserves browser-native
  `beforeinput` behavior to avoid blocking platform input.
- Plite's patch matches that direction: the normal text repair path should
  get out of the way quickly, while composition/platform edges stay covered by
  focused repair policy tests and browser rows.

Decision:
- `keep`

Verification already attached to the active supervisor loop:
- `packages/plite-react` focused input-router contract: 39 passed.
- `packages/plite-react` adjacent input/keyboard/DOM/selection virtualization
  contracts: 133 passed.
- Huge-document Chromium behavior rows passed for staged and virtualized lanes.
- Firefox/WebKit ShiftArrow coherence passed.
- `bun check` passed after the runtime/test patch.
- Post-patch 5k virtualized typing improved from about `33.3ms` p95 to about
  `24.4ms` p95, and type-ready improved from about `14.4ms` to about `6ms`.

Non-claims:
- This does not prove raw mobile/device behavior.
- This does not loosen IME/composition guards.
- This does not justify runtime patches from external snippets without
  Plite-native proof.

Next:
- If mobile/IME bugs appear, add real-device or source-level composition rows
  before changing the repair timer again.
