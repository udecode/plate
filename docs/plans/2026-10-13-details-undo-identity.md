# Restore Details disclosure after authored undo

Status: executed locally; local commit authorized, no push.
Playbook: figure-it-out

## Brief

### What will change?

Undoing a Details unwrap will restore its previous expanded state. The fix will address the required Plite history behavior, while keeping the existing Details state API without changing the public API.

### What could go wrong?

History is shared by other blocks and authored views. A wrong identity match could affect a neighboring block, a grouped undo, or redo. Tests must check document content, node identity, selection, and rendered disclosure.

## Teach

Details keeps its expanded state under the editor's local node key. That state should still refer to the restored block after undo.

Ordinary history retains node keys in inverse document changes. Authored history instead replays compensating operations. Our baseline restores the content but loses the original key, so the expanded-state entry no longer identifies the block.

The plan compares ways to retain identity through the existing history owner. It rejects matching titles or positions, adding persistent IDs, and restoring state from the Details UI.

## Scope

User authority: "老板同意了修改Plite底层了，先去写好计划， 先修复第一个bug，那个撤回的问题."

- Checkout: `/Users/sin/Documents/Project/PlateCompany/plate`.
- Branch: `codex/sin/fix-details-blockSelection`.
- Intake base: `8fa2f353462fc7846987662d808611f42ff4d250`.
- Expected footprint: one native identity/history owner and its required integration, roughly 2–4 production files plus focused package/browser tests and release notes. Expand only when evidence makes it necessary.
- High rigor: shared undo/redo code. One bounded fix, not a general history rewrite.
- Initial delivery was uncommitted. The owner subsequently authorized one local commit: "先提交一次代码吧，就是你刚刚修复好的那个问题，去提交一次代码，然后继续确认问题情况". No push, AGENTS.md edits, dependency upgrades, or registry generation.
- DnD failure remains a separate diagnostic case. No DnD-specific repair in this plan.
- Preserve the unrelated untracked selection performance note.

## Definition of done

On the source-served `/blocks/details-demo` and `/blocks/playground`, expand both Details levels, put the caret at the inner Summary start, press Backspace to unwrap it, then undo. The same content and nested structure return, the outer and inner disclosure states match before the unwrap, the caret is in visible Summary text, and redo/undo remains consistent. Repeat each final native case five times without retries. A previously closed Details must remain closed, and a neighboring same-text block must not acquire its state.

## Workflow

Throughput checkpoint: reuse existing source aliases, Details partition and browser runner; the lead alone edits; read-only readers compare approaches. Baseline and failed approaches stay in the artifact directory.

1. Capture exact red package and browser proof before product edits.
2. Trace native inverse identity and authored replay. Compare two whole approaches, not two guards in Details. Review the chosen plan before behavior edits.
3. Implement one minimum unit. Run the original failure plus existing nearby contracts. Revert a hypothesis when its own observation rejects it.
4. Check grouped history, accepted/proposed projection boundaries, duplicate content, closed-state and selection invariants at the smallest existing owner. Preserve remote conflict behavior; do not silently broaden guarantees.
5. Review final diff, apply scoped lint, execute final browser proof, and audit evidence against actual outputs.
6. Render the local plan page and report exact limits. Deliver one local commit under the owner's subsequent authorization; do not push.

## Main changes

Capture runtime keys from each commit's accepted/proposed inverse changes and attach the recovery metadata to that commit's local history effects. Restore keys through exact authored token provenance before applying compensation. Exclude this metadata from persistence and leave the Details UI unchanged.

## Steps

- [x] Baseline red package and native browser cases. Proof: `docs/plans/artifacts/details-undo-identity-2026-10-13/details-baseline-a1.log` and `docs/plans/artifacts/details-undo-identity-2026-10-13/browser-baseline-a1.log` fail on the reported disclosure state.
- [x] Architecture comparison and plan review. Proof: `docs/plans/artifacts/details-undo-identity-2026-10-13/review-notes.txt` and the selected design below.
- [x] Minimal implementation and focused regressions. Proof: `docs/plans/artifacts/details-undo-identity-2026-10-13/details-settled-a1.log` and `docs/plans/artifacts/details-undo-identity-2026-10-13/authored-projection-a1.log`.
- [x] Final review and verification. Proof: `docs/plans/artifacts/details-undo-identity-2026-10-13/lint-final-a1.log`, `docs/plans/artifacts/details-undo-identity-2026-10-13/browser-settled-a1.log`, and `docs/plans/artifacts/details-undo-identity-2026-10-13/browser-user-port-a1.log`.
- [x] Audit and hand-back. Proof: `node .agents/pstack/decisions-check.mjs docs/plans/artifacts/details-undo-identity-2026-10-13/decisions-validated.tsv`, `git diff --check`, and the Close below.

## Evidence

Run directory: `docs/plans/artifacts/details-undo-identity-2026-10-13/`.
Decision trail: `docs/plans/artifacts/details-undo-identity-2026-10-13/decisions-validated.tsv`. The initial `decisions.tsv` is retained as an immutable draft with formatting errors; the validated trail supersedes its format, not its observations.
Prior diagnostics: `docs/plans/artifacts/details-undo-fix-2026-10-13/DIAGNOSIS.txt`; `docs/plans/artifacts/details-drag-diagnosis-2026-10-13/DIAGNOSIS.txt`.

## Selected design

The two read-only architecture readers converged on native history capture plus authored token provenance. A final publication reset is invalid because it requires a publication base that ordinary accepted edits do not retain. Replacing authored compensation with the native inverse would bypass authored conflict and proposal semantics.

Private data shape: each local history effect may carry accepted/proposed recovery entries `{ root, origin, offset, key }`. Capture them from the runtime-keyed inserted slices of the inverse change, translating the exact original node-open token through the existing authored position index. The information belongs to that undo/redo entry and is discarded with it. It is explicitly omitted by the history effect persistence encoder; node keys never enter the authored document or transport format.

On replay, keep the existing causal compensation. Resolve recovery entries against the exact node-opening origin/offset in each resulting projection, and bind keys to its inserted slices before source transaction application and projection-index inheritance. Use `bindDocumentChangeNodeKeys` and the existing duplicate/live-owner protection in `snapshot-index`. There is no path/text fallback and no permanent origin registry.

Implementation owners: private recovery types/capture/bind helpers and effect persistence in `packages/plitejs/src/authored/history.ts`; capture and replay integration in `packages/plitejs/src/authored/authored.ts`. Generalize the complete-node slice binder only if a failing required test proves partial insertion support is necessary. This is an internal metadata change, not a new public call shape.

Required additional falsifiers: grouped removal/undo/redo; identical neighboring Details with different open states; projected view containing prior suggested content; history serialization excludes runtime keys; existing foreign-author refusal and history composition tests. The browser reporter remains the completion boundary.


## Demo

1. Open http://localhost:3000/blocks/details-demo and expand both Details levels.
2. Click the start of the inner Summary, press Backspace to unwrap it, then press Command+Z. Both levels remain expanded, the body returns, and the caret is visible at the inner Summary start. ![after](artifacts/details-undo-identity-2026-10-13/after-details-demo.png)
3. Press Command+Shift+Z, then Command+Z again. The content and disclosure state remain consistent. Type a character; it appears in the Summary.
4. Repeat on http://localhost:3000/blocks/playground at its nested Details. ![after](artifacts/details-undo-identity-2026-10-13/after-playground.png)

## Close

Implementation is verified on `codex/sin/fix-details-blockSelection`; the owner has authorized a local commit. Only two product files changed, both in Plite authored history. The Details plugin implementation, copied UI, AGENTS.md and lockfile were not edited. The pre-existing untracked selection performance note remains intact.

Verified: Details 38/0, authored partition 689/0 across its runner invocations, history partition 190/0, scoped lint, Plite typecheck. The exact native reporter ran five times per route without retries on source port3299 and again on the user's port3000: 10/0 on each service. Screenshots were opened and show restored body text, expanded disclosure arrows and a caret at the inner Summary. Red baseline logs demonstrate content recovery with missing expansion before the change.

Reversals and limits: no abandoned production approach was applied. The initial log used a format the project checker rejected; its original is retained and the validated trail is canonical. No registry regeneration, dependency upgrade, push, full monorepo CI or other-engine run occurred. The local commit was authorized after verification. This scoped repair does not claim universal identity restoration for partial-token insertions, review decisions, retained-fragment undo or arbitrary multiple authored operations in one commit. Existing surrounding contract suites passed, but those broader guarantees are not the reporter predicate.

Attention: reviewed by independent session-model readers, same-family because Claude is unavailable. No critical correctness finding remained. Removed one redundant comment. Updated stale plan status and narrowed per-operation wording to actual per-commit capture. The known DnD case was not independently repaired or accepted in this task; owner: user for the next requested investigation; stop: a separate exact drag replay establishes its outcome.
