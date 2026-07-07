# Execute Plite Blockquote Child Replace And Tab Owner

Objective:
Execute the accepted Plite blockquote plan: add a Plite child-replacement transaction API, preserve blockquote normalization as one replace-children operation, and restore reverse-tab lifting without dirty Core/Basic local rewrites.

Goal plan:
docs/plans/2026-07-06-execute-plite-blockquote-child-replace-and-tab-owner.md

Completion threshold:
Done when Plite owns generic child replacement, Core shortcut tx handlers can return false for fallback, Basic Nodes blockquote normalization and reverse-tab tests pass, touched packages typecheck and lint, and this plan passes autogoal completion.

Verification surface:
Focused Bun tests for Plite, Core, and Basic Nodes; package lint for Plite/Core/Basic Nodes; three-package Turbo typecheck for Plite/Core/Basic Nodes; autogoal check-complete for this plan.

Constraints:
No broad Plate migration, no compatibility aliases, no package sweep beyond the owner files required for this packet, and no browser claim without browser proof.

Boundaries:
Allowed edits were limited to Plite transform/runtime/type surfaces, Core shortcut dispatch, Basic Nodes blockquote behavior/tests, and this execution plan.

Blocked condition:
Blocked only if the new Plite transaction API could not typecheck through Plite/Core/Basic Nodes or if blockquote reverse-tab required a broader Plate runtime decision. Neither blocker happened.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Skill analysis before edits | yes | Read Plite Plan and Autogoal instructions before execution. |
| Active goal checked or created | yes | Active goal objective: Execute accepted Plite blockquote plan. |
| Source of truth read before edits | yes | Reviewed Plite transform/runtime interfaces, Core shortcut dispatch, and Basic Nodes blockquote plugin/tests. |
| Existing docs/solutions checked | no | N/A: this was a narrow accepted-plan execution packet, not a new design search. |
| Live Plate repo grounding | yes | All checks ran in `/Users/zbeyens/git/plate-2`. |

Work Checklist:
- [x] Captured every explicit requirement: Plite child replacement, Core shortcut fallback, Basic Nodes blockquote normalization, reverse-tab behavior, focused tests, package typecheck/lint, and completed handoff.
- [x] Implemented Plite `replaceChildren` through transform methods, transaction/update APIs, middleware keys, and public/internal type contracts.
- [x] Added Plite regression proof that `editor.update.nodes.replaceChildren` emits one logical `replace_children` operation.
- [x] Updated Core shortcut tx dispatch so a tx shortcut command returning `false` allows fallback instead of always preventing default.
- [x] Added Core regression proof for false-return shortcut fallback.
- [x] Updated Basic Nodes blockquote normalization to use Plite `tx.nodes.replaceChildren` and remap selection.
- [x] Restored Basic Nodes reverse-tab blockquote child lifting with true/false shortcut result semantics.
- [x] Added Basic Nodes regression proof for normalization operation shape, selection remap, reverse-tab lifting, and fallback outside blockquote children.
- [x] Ran focused package tests and recorded evidence.
- [x] Ran package lint and three-package typecheck.
- [x] Browser proof marked N/A because this packet did not claim rendered route behavior; package keyboard/transaction semantics are covered by focused package tests.

Completion Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Named verification threshold | yes | Focused tests, package lint, and three-package typecheck passed. |
| Plite source/runtime/public API claim | yes | `pnpm --filter @platejs/plite exec bun test ./test/editor-methods-contract.ts ./test/public-package-import-smoke.test.ts` passed 22 tests. |
| Core runtime claim | yes | `pnpm --filter @platejs/core exec bun test src/internal/plugin/resolvePlugins.spec.tsx` passed 41 tests. |
| Basic Nodes behavior claim | yes | `pnpm --filter @platejs/basic-nodes exec bun test src/lib/BaseBlockquotePlugin.spec.ts` passed 5 tests. |
| Package type safety | yes | `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/core --filter=./packages/basic-nodes` passed. |
| Package lint | yes | `pnpm --filter @platejs/plite lint && pnpm --filter @platejs/core lint && pnpm --filter @platejs/basic-nodes lint` passed. |
| Browser proof | no | N/A: no route or visual claim was made; this packet is package/runtime behavior. |
| Issue ledger or PR reference changed | no | N/A: no public issue, PR reference, or ledger row was changed. |
| Autoreview | no | N/A: user requested execution of a reviewed narrow plan, not pre-commit review. |
| Final user-review handoff | yes | Final response summarizes changed list, proof, and remaining review points. |
| Goal plan complete | yes | `check-complete` is the final mechanical gate for this file. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Accepted plan execution | complete | Plite/Core/Basic owner patches applied. | verification |
| Focused behavior proof | complete | Plite 22 tests, Core 41 tests, Basic Nodes 5 tests passed. | type and lint |
| Type and lint proof | complete | Three-package typecheck and package lint passed. | closeout |
| Closeout | complete | Plan rewritten as completed ledger. | final handoff |

Scorecard:
| Dimension | Weight | Score | Evidence |
|-----------|-------:|------:|----------|
| Plite ownership | 0.30 | 1.00 | Generic child replacement lives in Plite API/runtime/transactions. |
| Core fallback correctness | 0.20 | 1.00 | Shortcut tx false return test passed. |
| Basic Nodes behavior | 0.25 | 1.00 | Blockquote normalization and reverse-tab tests passed. |
| Type inference and package safety | 0.15 | 1.00 | Plite/Core/Basic Nodes typecheck passed. |
| Minimal migration drift | 0.10 | 0.95 | Packet touched only owner surfaces; browser proof intentionally skipped. |

Decisions and tradeoffs:
- Plite owns `replaceChildren` because replacing an ancestor's children is generic document-tree mutation, not a blockquote or Plate helper.
- Core owns shortcut fallback because plugin tx commands need a shared way to say "not handled".
- Basic Nodes owns blockquote rules because wrapping legacy flat children and reverse-tab lifting are blockquote semantics.
- Browser proof is not claimed here; the proof is package-level behavior and transaction legality.

Verification evidence:
- `pnpm --filter @platejs/plite exec bun test ./test/editor-methods-contract.ts ./test/public-package-import-smoke.test.ts` -> 22 pass, 0 fail.
- `pnpm --filter @platejs/core exec bun test src/internal/plugin/resolvePlugins.spec.tsx` -> 41 pass, 0 fail.
- `pnpm --filter @platejs/basic-nodes exec bun test src/lib/BaseBlockquotePlugin.spec.ts` -> 5 pass, 0 fail.
- `pnpm --filter @platejs/plite lint && pnpm --filter @platejs/core lint && pnpm --filter @platejs/basic-nodes lint` -> pass.
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/core --filter=./packages/basic-nodes` -> 13 successful tasks.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closeout after successful verification. |
| What changed? | Plite child replacement API, Core shortcut fallback semantics, Basic Nodes blockquote normalization and reverse-tab behavior. |
| What remains? | No remaining work inside this packet. |
| Next owner? | Plate Next package-by-package review can continue with Basic Nodes after user review. |

Open risks:
- Browser route behavior was not asserted in this packet; run browser proof later only if a rendered blockquote shortcut route claim is needed.
- This adds a public Plite mutation method; docs can be updated when broader Plite API docs are next touched.
