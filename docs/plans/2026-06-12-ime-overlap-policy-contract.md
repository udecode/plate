# ime overlap policy contract

Objective:
Define Slate v2 IME-overlap policy; done when the policy target, research
evidence, future proof gates, and user-review boundary are explicit.

Goal plan:
docs/plans/2026-06-12-ime-overlap-policy-contract.md

Template:
docs/plans/templates/slate-plan.md

Primary template:
docs/plans/templates/slate-plan.md

Applied packs:
- none

Completion threshold:
- This activation is planning-only. It is done when Slate v2 has a clear draft
  policy for active IME composition overlapped by app/model/remote edits, plus
  explicit runtime proof gates and a user-review boundary.
- Runtime/test execution is illegal until the user accepts or revises the
  policy.

Verification surface:
- Research proof: `docs/slate-v2/research/2026-06-12-ime-overlap-policy/**`.
- Future runtime proof after acceptance: native browser IME rows for full
  overlap, partial overlap, inside overlap, and non-overlap preservation; package
  contracts for stale composition event idempotence and active composition
  ownership.
- Future package/browser commands must run from `.tmp/slate-v2`.

Constraints:
- Planning mode only. Do not patch Slate v2 runtime, tests, or browser helpers
  from this plan.
- Do not copy ProseMirror or Lexical implementation code.
- Do not claim current Slate v2 fully handles overlapping app/remote edits
  during active IME composition.
- Do not let synthetic composition helpers prove DOM composition-span mutation
  unless they create or observe a real active native composition span.

Blocked condition:
- Runtime execution is blocked until the user accepts the overlap policy or
  gives a different taste decision.
- If timed automation continues, queue this as a stopping checkpoint and work on
  another safe packet.

Slate Plan lane state:
- slate_plan_lane_status: pending_user_review
- current_pass: research-to-policy
- current_pass_status: complete
- next_pass: user-review
- next_action: wait for explicit acceptance before implementation execution
- final_handoff_status: queued

Current verdict:
- verdict: adopt ProseMirror-style cancellation as the draft default: an
  app/model/remote edit whose affected range overlaps active IME composition
  ends composition ownership before applying the edit; stale native composition
  events are ignored; non-overlap edits preserve the active composition.
- confidence: medium-high for policy direction, medium for exact Slate runtime
  shape until red/green native browser rows exist.
- keep / cut / revise call: keep existing non-overlap and same-point
  composition oracles; revise overlap runtime semantics only after user review.
- reason: mature editors treat active IME composition as owned fragile state.
  Overlap merging has weak precedent and high risk of double insert, stale text
  resurrection, and wrong caret ownership.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Source of truth read before edits | yes | Read `docs/slate-v2/research/2026-06-12-ime-overlap-policy/**`. |
| Live `.tmp/slate-v2` grounding needed for runtime claim | no | This is planning-only and makes no runtime-green claim. |
| User taste needed | yes | Overlap cancellation changes user-visible IME conflict behavior. |

Work Checklist:
- [x] Research evidence mapped to a Slate-native policy target.
- [x] Runtime non-goals and proof limits recorded.
- [x] Future proof gates named.
- [x] User-review boundary recorded.
- [ ] User accepts or revises the overlap policy.
- [ ] Runtime/browser execution plan written after acceptance.

Policy Target:
| Case | Draft Slate v2 behavior | Why | Future proof |
|------|-------------------------|-----|--------------|
| Full overlap | End/cancel composition ownership, apply app/model edit, ignore stale native composition commit. | ProseMirror cancels full overlap; merging stale IME text is harder to reason about. | Native browser row plus stale `compositionend` idempotence contract. |
| Partial overlap | Same as full overlap. | Partial stale commits can resurrect deleted text or place caret inside invalid text. | Native browser row for partial range overlap. |
| Edit inside composing range | Same as full overlap. | The active composition text no longer has a trustworthy DOM/model owner. | Native browser row for inside-range edit. |
| Edit elsewhere | Preserve composition and rebase adjusted caret/range. | Existing Slate rows already prove non-overlap and same-point coherence. | Keep existing native IME model-update rows green. |
| Renderer/reconciler update touching composition DOM | Protect active DOM or end composition first. | Mature editor precedent treats active composition DOM as fragile. | Browser proof with real native composition span, not synthetic-only helper. |
| Normalization/transform on active composition node | Suppress or route through cancellation policy. | Lexical skips transforms on the active composition node. | Package contract once Slate ownership shape is chosen. |

Evidence:
| Source | Evidence | Slate pressure |
|--------|----------|----------------|
| ProseMirror view | `docs/slate-v2/research/2026-06-12-ime-overlap-policy/sources/prosemirror-view-summary.md` | Strongest direct precedent: full, partial, and inside overlap cancel; non-overlap preserves. |
| Lexical | `docs/slate-v2/research/2026-06-12-ime-overlap-policy/sources/lexical-summary.md` | Composition ownership should be explicit enough for transforms and stale events. |
| Slate v2 current proof | existing richtext native IME rows | Non-overlap and same-point delete/paste coherence are covered, but true overlap cancellation is not. |

Stopping checkpoint:
| Id | Type | Question / decision | Paused work | Recommendation |
|----|------|---------------------|-------------|----------------|
| ime-overlap-cancellation-taste | user-review | Should Slate v2 adopt ProseMirror-style overlap cancellation: overlapping app/model/remote edit wins, stale composition commits are ignored, and non-overlap edits preserve composition? | Runtime overlap cancellation and browser proof. | Yes. It is stricter and easier to prove than merging stale composition text. |

Future execution gates:
| Gate | Command / proof | Owner |
|------|-----------------|-------|
| native full-overlap row | Chromium native IME Playwright row with active composition, overlapping model edit, stale commit ignored | `slate-browser` / `slate-react` |
| native non-overlap preservation | Existing richtext native IME model-update rows stay green | `slate-browser` |
| stale composition idempotence | Package contract proves stale `compositionupdate`/`compositionend` cannot insert or resurrect text | `slate-react` |
| real DOM composition span | Browser helper can observe/mutate true native composition DOM span, or the claim is not made | `slate-browser` |

Final handoff note:
- Queue under `Needs your attention` and `Stopping checkpoints` in the parent
  `slate-auto` final handoff until accepted or revised.
