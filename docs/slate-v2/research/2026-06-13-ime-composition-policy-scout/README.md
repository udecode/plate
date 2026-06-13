# IME Composition Policy Scout

Date: 2026-06-13

## Question

Does fresh source-backed IME/composition research change Slate v2's current
policy boundary for model/app/remote edits during active composition?

## Scope

- Inspect current Slate v2 IME rows and composition-state owner code.
- Re-check source-level composition handling in CodeMirror, ProseMirror, and
  Lexical.
- Use browser/spec evidence only to shape proof bars and claim width.
- Do not patch runtime until the IME overlap policy is accepted.

## Verdict

No runtime patch is justified from this scout.

The existing IME overlap plan remains the right boundary: Slate v2 should not
claim full app/model/remote overlap behavior during active native composition
until `slate-plan` accepts the policy and `slate-browser` can prove a real
native composition span. Current Slate rows cover same-point and non-overlap
composition coherence, rich-text replacement, and WebKit compositionend cleanup,
but they do not close the taste-bearing overlap-cancellation decision.

The research strengthens the proof bar:

- Treat composition as a lifecycle with pending changes and stale terminal
  events, not a single DOM event.
- Do not use keyboard events alone to decide IME state.
- Protect active composition DOM or explicitly end ownership before a model
  change touches it.
- Keep non-overlap edits distinct from edits that intersect the active
  composition span.
- Claim raw mobile/IME only from a real device lane, not desktop Playwright.

## Evidence Summary

- CodeMirror tracks composition counters, pending key/change flags, Safari
  ordering quirks, and delayed composition cleanup. Its source reinforces that
  composition is a lifecycle and browser events can arrive in misleading order.
- ProseMirror tracks `view.composing`, `compositionID`,
  `compositionPendingChanges`, and protected local composition DOM. It also
  lets native paste happen during composition outside Android because scripted
  paste in composition is unreliable.
- Lexical keeps an editor composition key, marks prior/current composition
  nodes writable when the key changes, skips transforms on the active
  composition node, lets the browser own composition beforeinput, and has
  platform-specific end/cleanup handling.
- W3C UI Events notes that keyboard and composition events do not map one to
  one, which means keyboard traces are not enough IME authority.
- W3C Input Events issue discussion shows `insertCompositionText`
  cancelability/commit semantics are underspecified enough that Slate tests
  should capture target ranges and native event traces instead of assuming a
  uniform browser contract.

## Promotion

Promote this as a docs/policy proof-width packet:

- Keep `docs/plans/2026-06-12-ime-overlap-policy-contract.md` as the runtime
  authority boundary.
- Add IME claim-boundary wording to
  `docs/slate-v2/selection-navigation-coverage.md`.
- Queue `ime-overlap-cancellation-taste` for final handoff unless the user
  accepts/revises it before then.

## Claim Width

This packet claims research consolidation and proof-boundary repair. It does
not claim Slate v2 already handles overlapping app/model/remote edits during
active native IME composition, does not add synthetic-only composition proof,
and does not claim raw mobile IME coverage.
