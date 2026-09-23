---
review_scopes: [authored, selection, suggestions]
review_basis: [2026-09-23-suggestions-direct-delete-retained-selection]
work_kind: implementation
---

# Fix mixed suggestion selection deletion

Status: Completed

Objective:
Repair ordinary expanded selections that cross retained suggestion content so
Backspace/Delete removes the selected content from the editing view, including
the reporter's multi-block range, while retained-only selections stay
protected and follow-up input remains usable.

Goal plan:
docs/plans/2026-09-22-mixed-suggestion-selection-deletion.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (`docs/plans/templates/packs/browser.md`)

Task source:
- User correction on 2026-09-22: "选区内一旦包含了 suggestion 就无法删除了".
- User delivery authority on 2026-09-22: "push".
- Reporter contradiction on 2026-09-23 with
  `CleanShot 2026-09-23 at 10.57.52.mp4`: the first suggestion-free multi-block
  selection disappears, but the next multi-block selection containing seeded
  suggestions/comments becomes green retained deletion markup after Backspace
  instead of disappearing.
- Exact surface: homepage edit/markup editor at `/`.

Completion threshold:
- A mixed homepage selection crossing live and retained content deletes every
  selected block from both the live model and rendered editing view instead of
  turning the gesture into visible deletion markup.
- Retained-only selection remains protected; forward/backward mixed selection,
  undo/redo, Cmd+A, consecutive Enter, and follow-up typing remain valid.
- Package proof, fresh Chromium proof, 5/5 retry-free stability, typecheck,
  lint, formatting, behavior evidence, and plan completion pass.

Verification surface:
- Source: private Plite projected-selection resolution and model-owned mutation.
- Package: authored React contracts, full Plite React suite, full Plite Bun suite,
  package typecheck, and package lint.
- Browser: homepage `/` through `apps/www/tests/browser/suggestion.spec.ts` in
  the repo-owned Chromium runner with a fresh source-backed server.
- Delivery: commit the complete current checkout, push `next`, then compare
  local HEAD, `origin/next`, and the remote advertised SHA.

Constraints:
- The latest reporter-visible editing-mode result is authoritative: Backspace
  removes the selected blocks instead of leaving a new visible deletion
  proposal. Existing retained-only protection remains applicable.
- No public API or Plate-layer workaround.
- A selection entirely inside foreign retained content remains protected.
- Commit and push are authorized for the entire current checkout. PR, issue,
  release, deployment, and public-message mutations remain out of scope.

Boundaries:
- Product owners: private Plite projected-selection bridge, mutation controller,
  and authored decision-suffix selection publication.
- Proof owners: authored fragment React contracts and the existing www
  suggestion browser suite.
- Prior Cmd+A and consecutive-Enter cases remain in the affected corpus.
- Browser claim is local Chromium only; no Firefox, WebKit, mobile, deployed,
  or release claim.

Blocked condition:
- Block only if the current homepage cannot mount under the repository runner,
  the mixed native selection cannot be represented after two host-repair
  attempts, required checks remain red, or remote push/readback is unavailable.

Work Checklist:
- [x] Capture the user outcome, scope, authority, constraints, and proof surface.
- [x] Inspect the current source owner, authored direct-editing law, and prior review basis.
- [x] Run the full-document hard-cut counterfactual before implementation.
- [x] Replace the full-document exception with one general private live-segment target.
- [x] Preserve retained-only protection and authored review semantics.
- [x] Add forward/backward package coverage with undo/redo.
- [x] Add exact homepage Backspace and follow-up typing coverage.
- [x] Re-run the prior Cmd+A, consecutive-Enter, and mixed-pending cases.
- [x] Use a fresh current-source server for final Chromium proof.
- [x] Check runtime errors through the strict browser recorder.
- [x] Run 5/5 retry-free browser stability.
- [x] Run package typecheck, lint, full React, and full Bun suites.
- [x] Record final evidence, limits, fingerprints, and publication authority.
- [x] Reconcile every original acceptance item; no required item is omitted.
- [x] Revoke the prior candidate's local/public completion after the reporter contradiction.
- [x] Capture frozen-byte native/model/view selection transitions and identify the first divergence.
- [x] Reproduce the exact multi-block Backspace case on `/` with the complete homepage fixture.
- [x] Repair the owner without weakening Cmd+A, Enter, undo, follow-up input, or retained-only behavior.
- [x] Inspect the final rendered pixels immediately after Backspace.
- [x] Re-run exact Chromium proof and retry-free stability on final source.

Decisions and tradeoffs:

| Decision | Chosen owner and fix | Rejected alternative | Evidence |
| --- | --- | --- | --- |
| Mixed projected selection | `resolveProjectedSelectionTarget` resolves every live segment and the closed set of pending changes, retained deletions, and dependencies fully contained by the visible selection | Force the whole gesture into a proposal, decide touched-but-partial changes, hide retained DOM, or add Plate glue | package forward/backward/full/partial tests plus exact mounted Chromium case |
| Mutation preparation | Accept the closed selected change set, then apply the direct replacement as an accepted suffix in the same transaction | A second suggestion store, a public selection API, or direct accepted-envelope mapping that conflicts on retained contributions | authored decision-suffix selection test, undo/redo, and final commit trace |
| Incomplete selection | Preserve content and projected selection when a retained fragment or required dependency extends outside the selection | Partially deleting live ranges or accepting unselected work | package two-fragment case and homepage dependency-outside case |
| Fragment-only selection | Preserve existing same-fragment author amendment and foreign-retained protection | Treat every retained segment as a live document range | existing retained-selection corpus |
| Public surface | Keep the owner private; no new export or API noun | New public selection abstraction | source diff and typecheck |

Completion Gates:

| Gate | Applies | Result | Evidence |
| --- | --- | --- | --- |
| Mixed suggestion selection deletes | yes | pass | exact multi-block reporter gesture removes the selected rendered section instead of painting green deletion markup |
| Directionality | yes | pass | package test runs forward and backward native DOM selections |
| Fragment and incomplete dependency protection | yes | pass | retained-only corpus, two-fragment package case, and homepage dependency-outside case |
| Undo/redo and follow-up input | yes | pass | decision plus accepted suffix undo/redo; native `x` lands at `Cox` |
| Cmd+A and consecutive Enter | yes | pass | both homepage cases included in the 25-run stability ledger |
| Best API Review | yes | pass | `2026-09-23-suggestions-direct-delete-retained-selection` supersedes forced-proposal semantics; no public API |
| Runtime errors | yes | pass | strict Playwright recorder empty for every selected case |
| Visual artifact | yes | pass | inspected final screenshot: selected section and green retained paint are absent; unselected `Co` and Rich Content remain |
| Autoreview | no | N/A | branch is `next`; no PR or explicit review request |
| Publication | yes | authorized | `bda11bb012` completion remains revoked; repaired current checkout is ready for commit, push, and exact remote parity readback |

Verification evidence:

- Frozen `bda11bb012` exact-route RED: view selection was backward
  `[7,0]:54 -> [2,0]:2`, with live/retained/live segments; runtime/model were
  collapsed at the endpoint. Backspace reached the correct editor and published
  a structural semantic command, but `tx.authored.propose()` painted the
  selected blocks as green retained deletion markup.
- Focused mixed-selection Vitest: 2 passed, covering forward/backward complete
  selection, decision plus direct deletion, undo/redo, and incomplete
  two-fragment protection.
- Authored decision-suffix selection test: 1 passed with undo/redo.
- Full Plite React suite: 89 files, 1309/1309 passed.
- Full Plite Bun suite: 135 files, 2857/2857 passed.
- Plite typecheck: 13/13 tasks passed.
- Plite lint: 11/11 tasks passed.
- Focused formatting/lint over changed repair files: passed.
- Fresh source-backed Chromium at `http://localhost:3297/`: five affected cases
  x five repetitions = 25/25 passed, zero retries. The new case asserts runtime
  owner, semantic mutation owner, model, view selection, rendered result,
  Undo/Redo, follow-up input, and strict runtime errors.
- Final screenshot inspected at
  `apps/www/test-results/suggestion-homepage-remove-366d6-selection-from-editing-view-chromium/mixed-suggestion-block-delete.png`.
- MDX build and docs source parity passed. The aggregate docs command remains
  blocked before those steps by the unrelated `platejs.AnyBasePlugin` API
  reference classification error.
- Review-ledger helper: 45/45 tests passed; the superseding review record was
  written and 64 hubs rendered. Global `check` still reports stale unrelated
  `application/ai-command` inventory.
- Changeset: N/A because `plitejs` is absent from current `origin/main`.

Runtime-input fingerprints:

| Input | SHA-256 |
| --- | --- |
| `authored.ts` | `584d6ca4e1c2930c94d45cb8bfd7dcd144317132a1f50a9fe3338f892a94095c` |
| `editor.ts` | `167ca35ce8321ca41fd854cc46e9f5dd8b632f212559ee5c7dd5df745fc68f2d` |
| `projected-selection-target.ts` | `953969dc6d5974f71ba108b861469befc7e9cc73215f509c1ed6ad4065da9a9a` |
| `mutation-controller.ts` | `e59f2dbbd30a18a535a9e060309f41fe6467ee15b0b1b8400c94315f5dd91bff` |
| `authored-history-contract.test.ts` | `846eb05a1d96f6d7da975aeb86d704afd1a726fb0bcb99df1a352c74186969a8` |
| `authored-fragment-provider.test.tsx` | `18f91d1f01396a1b9fab3686e932250ef8e6457d3eea9e0673d208b6142c8180` |
| `suggestion.spec.ts` | `b2adc6f7ea50d3c5bcb1542828265eb7c116c701867d93322a84a72728daac0d` |

Findings and remaining work:

- Root cause: the previous repair correctly found the projected selection but
  forced every retained-crossing mutation through `tx.authored.propose()`.
  Model assertions passed while the editing view kept the selected blocks as a
  new green deletion proposal.
- Owning fix: collect only pending changes, retained deletions, and dependencies
  fully covered by the visible selection; accept that closed set, then apply the
  direct replacement as the accepted suffix in one transaction. Incomplete
  selections stay unchanged and keep their projected selection.
- Authored finish publishes an explicitly written suffix selection after a
  decision instead of restoring the pre-decision range to a deleted location.
- Implementation review: accepted. Plite authored/projected-selection owners
  enforce the invariant; no Plate workaround, timer, extra state store, public
  API, or CSS suppression remains.

Failed fix history:

| Attempt | Failure kind | Frozen candidate | Reporter delta | Revoked claim | Resume evidence |
| --- | --- | --- | --- | --- | --- |
| 1 | reporter-contradiction | `bda11bb012c602c9fd553d51896f159d6dbd4139` | Multi-block Backspace across the seeded Collaborative/AI section leaves green retained deletion markup visible | local completion, pushed completion, prior model-only Chromium green | exact-route-reproduction: red; selection-transition-trace: native + model + view + next-input; runtime-owner: pass; mutation-owner: pass; first-divergence: forced proposed publication in `prepareProjectedSelectionMutation` |

Final handoff:

- Outcome and owner: fixed in Plite projected-selection resolution, authored
  decision-suffix selection publication, and the existing mutation controller.
- Proof and limits: package plus fresh local Chromium and inspected pixels; no
  cross-browser or deployed claim.
- Local state: repaired candidate complete; prior pushed completion remains
  revoked until this candidate is committed, pushed, and read back.
- Next action: publish the authorized current checkout and replay the exact case
  on the pushed ref.

Timeline:

- 2026-09-22T03:00:01.290Z Plan created.
- 2026-09-22T15:37:00.000Z Repair, complete package proof, and 5/5 Chromium stability completed.
- 2026-09-23T02:57:52.000Z Reporter video contradicted the pushed candidate; completion revoked and failed-fix recovery opened.
- 2026-09-23T04:10:00.000Z Superseding review, owning repair, full package proof, inspected Chromium proof, and 5/5 stability completed.

Open risks:

- Clipboard paste across retained fragments remains protected by the existing
  data-transfer path and was not part of this deletion request.
- Partial retained or dependency-spanning selections intentionally preserve
  content and selection rather than decide unselected work.
- Cross-browser behavior is unclaimed. Global docs/API and review-ledger checks
  retain the unrelated limits recorded above.
