# Affinity Normalize Adjacent Text Cleanup

Objective:
Cut `normalizeAdjacentText` from `AffinityPlugin.spec.tsx` and fix the Plite insertion behavior it was hiding.

Prompt requirements:
- Target: `packages/core/src/lib/plugins/affinity/AffinityPlugin.spec.tsx normalizeAdjacentText`.
- Mode: named Plate Next review packet, not broad Core sweep.
- Requirement: explain why the helper exists, remove it if it is sludge, and avoid test-side normalization that hides runtime behavior.
- Stop condition: strict Affinity proof passes without the helper, Plite insertion/normalization guards pass, Core/Plite typecheck passes.
- Final handoff: answer what it was, what changed, and proof.

Completion threshold:
Done when the Affinity spec compares strict children without `normalizeAdjacentText`, Plite owns the insertion fix, focused Core and Plite tests pass, Plite/Core typechecks pass, lint passes, and source audit finds no helper or pending-mark `insertNodes` bypass.

Verification surface:
Focused Core Affinity spec, Plite transform contract, Plite normalization/snapshot guards, Plite typecheck, Core typecheck, Plite/Core lint, and source audit for the removed helper/bypass patterns.

Constraints:
Named packet only. Do not run broad Core sweep. Do not add test-side comparators. Do not preserve legacy `editor.tf` behavior. Do not move Core Affinity product behavior into bridge files. Plite owns generic text insertion and normalizer behavior.

Boundaries:
Allowed files are the Affinity spec, Plite insertion/normalization owners, the Plite transform regression test, and this plan. Docs/browser proof are out of scope because this is package-runtime behavior, not visible UI.

Blocked condition:
No blocker remained. A blocker would have been a required public Plite API fork or a failing snapshot/normalization guard after removing the helper.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt captured | yes | Target and stop condition copied above. |
| Skill read | yes | `plate-next` read before edits. |
| Mode classified | yes | Named packet, not broad Core sweep. |
| Gap policy checked | yes | No Plite/Plate gap remained after fixing Plite insertion. |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Explain/helper review | done | Helper classified as test-side behavior mask. |
| Runtime fix | done | Plite insertion wrapper and `applyInsertText` fixed. |
| Proof | done | Focused tests, typechecks, lint, and source audit passed. |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/affinity/AffinityPlugin.spec.tsx` `normalizeAdjacentText` | 4 | hard-cut | Core Affinity spec | Helper normalized expected/actual children before comparison and hid split adjacent leaves. | Deleted helper and kept strict `editor.read.children()` comparison. |
| `packages/plite/src/editor/insert-text.ts` pending-mark `insertNodes` branch | 4 | move-to-plite cleanup | Plite text insertion | Static wrapper bypassed `applyInsertText` and inserted separate text leaves when marks were pending. | Removed bypass; implicit target is seeded into selection, then `applyInsertText` owns insertion. |
| `packages/plite/src/transforms-text/insert-text.ts` boundary insertion | 3 | move-to-plite | Plite text insertion | Pending marks at a boundary need compatible adjacent text insertion, not generic `insertNodes`. | Added compatible point lookup and direct `insert_text` at current/next/previous compatible text point. |
| `packages/plite/src/core/normalize-node.ts` implicit adjacent text canonicalization | 2 | main-parity-cleanup | Plite normalizer | `insert_text` can canonicalize adjacent compatible text; `remove_text` cannot without breaking delete subtree rows. | Kept implicit canonicalization to `insert_text` only. |
| `packages/plite/test/transforms-contract.ts` | 1 | keep | Plite transform proof | Adds regression for same-mark replacement producing one canonical leaf. | Keep. |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected alternatives | Reason | User-review need |
|--------|-------------------|----------------------|--------|------------------|
| Affinity adjacent text expectations | Strict Core spec plus Plite-owned insertion behavior | Test comparator, Core-only helper, broad normalizer merge on all operations | Product spec should catch leaf splits; substrate should decide where text inserts. | None. |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | N/A | N/A | N/A | N/A | No remaining blocker. |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Removed `normalizeAdjacentText` | `rg -n "normalizeAdjacentText|getEditorTransformRegistry\\(editor\\)\\.insertNodes\\(node|const node = \\{ text: command\\.text|options\\.operation\\?\\.type === 'remove_text'" packages/core/src/lib/plugins/affinity packages/plite/src/editor/insert-text.ts packages/plite/src/transforms-text/insert-text.ts packages/plite/src/core/normalize-node.ts --glob '!**/dist/**'` | 0 | 0 | 0 | None. |

Extracted-file inventory:
| Scope | Command | Result | Decision |
|-------|---------|--------|----------|
| Named packet files | `git ls-files --others --exclude-standard packages/core/src/lib/plugins/affinity packages/plite/src packages/plite/test docs/plans/2026-06-30-affinity-normalize-adjacent-text-cleanup.md` | No new source extraction required for this packet; plan file is the only expected artifact. | N/A for source recovery. |

Verification:
| Command | Result |
|---------|--------|
| `pnpm --filter @platejs/core exec bun test src/lib/plugins/affinity/AffinityPlugin.spec.tsx` | pass, 27 tests |
| `pnpm --filter @platejs/plite exec bun test ./test/transforms-contract.ts ./test/normalization-contract.ts ./test/snapshot-contract.ts` | pass, 263 tests |
| `pnpm --filter @platejs/plite typecheck` | pass |
| `pnpm --filter @platejs/core typecheck` | pass |
| `pnpm --filter @platejs/plite lint:fix` | pass, fixed one file |
| `pnpm --filter @platejs/core lint:fix` | pass |
| Source audit above | pass, no matches |

Verification evidence:
Fresh final evidence recorded after the final lint pass.
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/affinity/AffinityPlugin.spec.tsx` passed, 27 tests.
- `pnpm --filter @platejs/plite exec bun test ./test/transforms-contract.ts ./test/normalization-contract.ts ./test/snapshot-contract.ts` passed, 263 tests.
- `pnpm --filter @platejs/plite typecheck` passed.
- `pnpm --filter @platejs/core typecheck` passed.
- `pnpm --filter @platejs/plite lint:fix` passed and fixed one file.
- `pnpm --filter @platejs/core lint:fix` passed.
- Source audit passed with zero matches.

Reboot status:
Current. If resumed, start from the changed files list and rerun the verification evidence commands above before expanding scope.

Open risks:
None for this named packet. Broader Core migration drift remains outside this packet.

Changed files:
- `packages/core/src/lib/plugins/affinity/AffinityPlugin.spec.tsx`
- `packages/plite/src/editor/insert-text.ts`
- `packages/plite/src/transforms-text/insert-text.ts`
- `packages/plite/src/core/normalize-node.ts`
- `packages/plite/test/transforms-contract.ts`
- `docs/plans/2026-06-30-affinity-normalize-adjacent-text-cleanup.md`

Keep / revert / quarantine:
- Keep.
- Reason: removes a test-side behavior mask and fixes the Plite insertion path with focused Core and Plite proof.

Work Checklist:
- [x] Prompt requirements captured.
- [x] `plate-next` skill read.
- [x] Mode classified as named packet, not broad Core sweep.
- [x] Best Plate v2 recommendation recorded.
- [x] Legacy/hack alternative rejected.
- [x] Related sweep recorded.
- [x] Plite/Core focused proof passed.
- [x] Typecheck passed.
- [x] Lint passed.
- [x] Source audit passed.
- [x] Changed list recorded.
