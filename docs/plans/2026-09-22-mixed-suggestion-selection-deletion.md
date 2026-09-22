---
review_scopes: [authored, selection, suggestions]
review_basis: [2026-09-17-suggestions-authored-editing-final]
work_kind: implementation
---

# Fix mixed suggestion selection deletion

Status: Completed

Objective:
Repair ordinary expanded selections that cross retained suggestion content so
Backspace/Delete mutates every live selected range, keeps retained-only
selections protected, preserves review semantics, and leaves follow-up input
usable.

Goal plan:
docs/plans/2026-09-22-mixed-suggestion-selection-deletion.md

Primary template:
docs/plans/templates/task.md

Applied packs:
- browser (`docs/plans/templates/packs/browser.md`)

Task source:
- User correction on 2026-09-22: "选区内一旦包含了 suggestion 就无法删除了".
- User delivery authority on 2026-09-22: "push".
- Exact surface: homepage edit/markup editor at `/`.

Completion threshold:
- A mixed homepage selection crossing live and retained content deletes every
  live selected range without deciding the retained change.
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
- The mixed gesture stays reviewable through existing authored publication;
  it never auto-accepts or auto-rejects prior suggestions.
- No public API or Plate-layer workaround.
- A selection entirely inside foreign retained content remains protected.
- Commit and push are authorized for the entire current checkout. PR, issue,
  release, deployment, and public-message mutations remain out of scope.

Boundaries:
- Product owners: private Plite projected-selection and mutation code.
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

Decisions and tradeoffs:

| Decision | Chosen owner and fix | Rejected alternative | Evidence |
| --- | --- | --- | --- |
| Mixed projected selection | `resolveProjectedSelectionTarget` filters retained fragments, resolves every live segment in document order, and marks the target dependent so `tx.authored.propose()` owns the whole gesture | More full-document exceptions, implicit accept/reject, mutable retained fragments, or Plate glue | package forward/backward test plus mounted Chromium case |
| Mutation preparation | Re-resolve the projected target inside the authored proposal transaction | Reconstructing only document edges or carrying stale pre-transaction points | undo/redo and complete React suite |
| Fragment-only selection | Preserve existing same-fragment author amendment and foreign-retained protection | Treat every retained segment as a live document range | existing retained-selection corpus |
| Public surface | Keep the owner private; no new export or API noun | New public selection abstraction | source diff and typecheck |

Completion Gates:

| Gate | Applies | Result | Evidence |
| --- | --- | --- | --- |
| Mixed suggestion selection deletes | yes | pass | package test and `homepage deletes live text around retained suggestion content` |
| Directionality | yes | pass | package test runs forward and backward native DOM selections |
| Fragment-only protection | yes | pass | full authored React file and existing retained-only cases |
| Undo/redo and follow-up input | yes | pass | package history assertions; homepage native `x` assertion |
| Cmd+A and consecutive Enter | yes | pass | both homepage cases included in the 20-run stability ledger |
| Best API Review | yes | pass | hard cut selected the general private live-segment owner; no public API |
| Runtime errors | yes | pass | strict Playwright recorder empty for every selected case |
| Visual artifact | no | N/A | no paint, geometry, or styling claim; model and native input are the reporter oracle |
| Autoreview | no | N/A | branch is `next`; no PR or explicit review request |
| Publication | yes | authorized | commit/push current checkout; final remote SHA/parity readback occurs after this plan closes |

Verification evidence:

- Focused mixed-selection Vitest: 1 passed, including forward/backward selection,
  retained crossing, undo, and redo.
- Full authored React file: 62/62 passed.
- Full Plite React suite: 89 files, 1308/1308 passed.
- Full Plite Bun suite: 135 files, 2857/2857 passed.
- Plite typecheck: 13/13 tasks passed.
- Plite lint: 11/11 tasks passed.
- Focused formatting/lint over changed repair files: passed.
- Fresh Chromium exact case: 1/1 passed after terminating a stale 10:56
  server and allowing the repo runner to build/serve the current checkout.
- Chromium stability: four affected homepage cases x five repetitions = 20/20
  passed, zero retries.
- The pre-fix owner returned `retained` for every fragment-bearing selection
  except full-document selection; the first exact old-server replay preserved
  the reported no-op. Final green evidence does not reuse that server.

Runtime-input fingerprints:

| Input | SHA-256 |
| --- | --- |
| `projected-selection-target.ts` | `c70e7643a8495a011939587cee295f4d5fd9258f6e67182a1510d602e5cc14c4` |
| `mutation-controller.ts` | `92f125171487bd838ce1eda4d9fe9486c3ff0db8a20aab5ae6b3648af997bd88` |
| `decoration-repair-bridge.ts` | `f9b03227d19e877f777d94a3b036de28b91f66f6212147001519ff8c2e80c1c8` |
| `authored-fragment-provider.test.tsx` | `bfb41cac29db8e6f4773d496eb53a5241f3a19572c05fd32b185c68a3136f71c` |
| `suggestion.spec.ts` | `811a5c7fec94b2bef0d3f779c0a55fe061ba50e23c34a3d373ea911e0a9428d7` |

Findings and remaining work:

- Root cause: fragment presence was treated as a global read-only selection;
  only Cmd+A had a bespoke escape hatch.
- Fix: retained fragments no longer erase neighboring live selection ranges.
  The live ranges delete in reverse order and collapse at the first live point
  inside one authored proposal transaction.
- No product or proof blocker remains. Final Git publication proof is separate
  from the local behavior claim.

Final handoff:

- Outcome and owner: fixed in Plite projected-selection target resolution and
  the existing model-owned mutation controller.
- Proof and limits: package plus local Chromium; no cross-browser or deployed
  claim.
- Local state: implementation and proof complete; current-checkout push
  authorized.
- Next action: commit every modified/untracked file, push `next`, and read back
  remote SHA/parity.

Timeline:

- 2026-09-22T03:00:01.290Z Plan created.
- 2026-09-22T15:37:00.000Z Repair, complete package proof, and 5/5 Chromium stability completed.

Open risks:

- Clipboard paste across retained fragments remains intentionally protected by
  the existing data-transfer path and was not part of this deletion request.
- Cross-browser behavior is unclaimed.
