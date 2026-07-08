# plate-next without-normalizing tx sweep

Objective:
Repair `withoutNormalizing` so public update callbacks receive `{ tx }`, ban
nested `editor.update.*` inside active update callbacks, and sweep current
offenders.

Goal plan:
docs/plans/2026-07-07-plate-next-without-normalizing-tx-sweep.md

Completion threshold:
- Plite `editor.update.withoutNormalizing` callback receives `{ tx }`.
- `copySelectedBlocks.ts` and same-class selection callers use `tx.*` inside
  `withoutNormalizing`, not nested `editor.update.*`.
- Same-class nested `editor.update.*` usages are swept across package sources.
- `plate-next` source rule, generated skill mirror, and template record the
  active transaction rule.
- Focused Plite/Core/Selection proof passes.

Verification surface:
- `pnpm prepare`
- `pnpm install`
- `rg -n "editor\\.update\\.withoutNormalizing\\(\\(\\) =>" packages --glob '*.{ts,tsx,mts,cts}' --glob '!**/dist/**'`
- read-only nested update scanner across `packages/**/*.{ts,tsx,mts,cts}`
- `rg -n 'callbacks must never call \`editor\\.update|Active transaction law|nested \`editor\\.update' .agents/rules/plate-next.mdc .agents/skills/plate-next/SKILL.md docs/plans/templates/plate-next.md`
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/core --filter=./packages/selection`
- `pnpm --filter @platejs/plite test`
- `pnpm --filter @platejs/selection test`
- `pnpm --filter @platejs/plite lint`
- `pnpm --filter @platejs/core lint`
- `pnpm --filter @platejs/selection lint`
- `pnpm --filter @platejs/selection build`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-07-plate-next-without-normalizing-tx-sweep.md`

Constraints:
- Do not paper over this locally with callback parameter annotations or casts.
- Fix the Plite owner API when inference is weak.
- Do not broaden into default block factory work in this packet.
- No git action.

Boundaries:
- Changed source: `packages/plite/src`, `packages/selection/src`,
  `.agents/rules/plate-next.mdc`, `docs/plans/templates/plate-next.md`,
  generated `plate-next` skill mirror.
- Browser/docs route proof: not applicable; no UI route changed.

Output budget strategy:
- Used targeted `rg`, one read-only scanner, and focused package proof.

Blocked condition:
Stop if `withoutNormalizing(({ tx }) => ...)` cannot preserve transaction
typing without breaking existing callers; route to `plite-plan`.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | User required `{ tx }` callback, no nested `editor.update.*`, skill repair, sweep |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read in current turn |
| Active goal checked or created | yes | Active goal objective matches this plan |
| Mode classified as named packet vs broad Core sweep | yes | Named API/rule repair plus focused sweep |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Fixed Plite owner API instead of local workaround |
| Broad Core drift ledger initialized when in scope | no | Broad Core sweep not requested |
| Source of truth and allowed workspace recorded | yes | Source rule/template plus Plite/Selection |
| Output budget strategy recorded | yes | Targeted searches only |
| Public API fork routing checked | yes | Internal public Plite ergonomics repair accepted in this packet |
| Gap policy checked | yes | No unresolved Plite/Plate gap remained |
| Related Core sweep policy checked | yes | Same-class nested update sweep run |
| Review-mode rename freeze checked | yes | No renames |
| Package review checklist initialized when in scope | no | Not package review mode |

Work Checklist:
- [x] First checkpoint complete: exact target, non-goals, proof, and stop
      condition copied before implementation.
- [x] Patch Plite `withoutNormalizing` transaction callback type.
- [x] Patch Plite transaction implementation to call `fn({ tx })`.
- [x] Patch `copySelectedBlocks.ts` to use `tx.selection.*` inside the
      callback.
- [x] Patch sibling Selection `withoutNormalizing` callers to use `tx`.
- [x] Sweep same-class nested update calls across package sources.
- [x] Repair Plate Next source rule and template.
- [x] Regenerate generated Plate Next skill mirror with `pnpm prepare`.
- [x] Run focused proof.
- [x] Record verification and closeout.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Checkpoint zero | complete | Requirement copied before implementation |
| API repair | complete | `EditorUpdateMethods.withoutNormalizing` now carries the installed transaction type |
| Source sweep | complete | Package scanner found no nested `editor.update.*` inside scanned update callbacks |
| Skill repair | complete | Source rule, generated skill, and template contain the active transaction law |
| Verification | complete | Typecheck, tests, lint, build, and scanner proof passed |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Plite API owner repair | yes | `withoutNormalizing` callback receives `{ tx }` | `packages/plite/src/interfaces/editor.ts`, `packages/plite/src/core/public-state.ts` |
| Nested update sweep | yes | Search and patch same-class offenders | scanner output: `no nested editor.update.* inside scanned editor.update callbacks` |
| Skill mirror sync | yes | `pnpm prepare` | skiller apply completed successfully |
| Dependency/rule sync | yes | `pnpm install` | already up to date |
| Focused proof | yes | Run listed commands | proof commands below passed |
| Broad Core review | no | Not requested | scoped packet |
| Goal plan complete | yes | Run completion checker | checker command listed below |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/plite/src/interfaces/editor.ts` | 100 | move-to-plite owner repair | Plite | Public update transaction type now threads `tx` through `withoutNormalizing` | keep |
| `packages/plite/src/core/public-state.ts` | 100 | move-to-plite owner repair | Plite | Runtime calls `fn({ tx })` with the fully installed transaction | keep |
| `packages/selection/src/react/utils/copySelectedBlocks.ts` | 100 | main-parity-cleanup | Selection | Uses `tx.selection.*` inside the active `withoutNormalizing` transaction | keep |
| `packages/selection/src/react/transforms/setBlockSelectionNodes.ts` | 100 | main-parity-cleanup | Selection | Three selection update helpers use active `tx.nodes.set` | keep |
| `packages/selection/src/react/components/BlockSelectionAfterEditable.tsx` | 100 | main-parity-cleanup | Selection | Delete selection path uses active `tx.nodes.remove` | keep |
| `.agents/rules/plate-next.mdc` | 100 | source-rule repair | Skills | Active transaction rule added | keep |
| `docs/plans/templates/plate-next.md` | 100 | template repair | Autogoal template | Active transaction law added | keep |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| No-arg public `withoutNormalizing` callbacks | `rg -n "editor\\.update\\.withoutNormalizing\\(\\(\\) =>" packages --glob '*.{ts,tsx,mts,cts}' --glob '!**/dist/**'` | 0 | 0 | 0 | none |
| Nested `editor.update.*` inside update callbacks | read-only scanner over `packages/**/*.{ts,tsx,mts,cts}` for `editor.update.withoutNormalizing(` and `editor.update(` callback bodies | 0 findings after patch | 5 call sites already patched | 0 | none |
| Skill/template rule sync | `rg -n 'callbacks must never call \`editor\\.update|Active transaction law|nested \`editor\\.update' ...` | 5 rule/template hits | 3 owners updated/synced | 0 | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `packages/plite/src/interfaces/editor.ts`, `packages/plite/src/core/public-state.ts` |
| Selection callers | `packages/selection/src/react/utils/copySelectedBlocks.ts`, `packages/selection/src/react/transforms/setBlockSelectionNodes.ts`, `packages/selection/src/react/components/BlockSelectionAfterEditable.tsx` |
| tests/proof | `packages/selection/src/react/utils/copySelectedBlocks.spec.tsx` fixture updated for `{ tx }` |
| docs/templates/skills | `.agents/rules/plate-next.mdc`, `.agents/skills/plate-next/SKILL.md`, `docs/plans/templates/plate-next.md`, this plan |
| reverted/quarantined packets | none |

Verification evidence:
- `pnpm prepare`: passed.
- `pnpm install`: passed, already up to date.
- `rg -n "editor\\.update\\.withoutNormalizing\\(\\(\\) =>" packages --glob '*.{ts,tsx,mts,cts}' --glob '!**/dist/**'`: no matches.
- Read-only nested update scanner across `packages/**/*.{ts,tsx,mts,cts}`:
  `no nested editor.update.* inside scanned editor.update callbacks`.
- Rule sync grep: hits in `.agents/rules/plate-next.mdc`,
  `.agents/skills/plate-next/SKILL.md`, and
  `docs/plans/templates/plate-next.md`.
- `pnpm turbo typecheck --filter=./packages/plite --filter=./packages/core --filter=./packages/selection`: passed.
- `pnpm --filter @platejs/plite test`: 1023 pass, 85 skip.
- `pnpm --filter @platejs/selection test`: 98 pass.
- `pnpm --filter @platejs/plite lint`: passed.
- `pnpm --filter @platejs/core lint`: passed.
- `pnpm --filter @platejs/selection lint`: passed.
- `pnpm --filter @platejs/selection build`: passed.

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | None for this packet | The bad nested update pattern is gone and proof is green | scoped transaction sweep | Move on to the next Plate Next package/file review |

Final handoff contract:
- target surface and mode: `plate-next` transaction-rule repair and sweep.
- files/APIs reviewed: Plite update transaction API plus Selection
  `withoutNormalizing` call sites.
- related sweep query/matches/patched/deferred: package scanner, zero findings
  after five patched call sites, zero deferred.
- changes made: Plite callback API, selection tx call sites, skill/template
  rule.
- tests/proof commands: listed above.
- Plite/Plate gaps or blockers: none.
- next best Plate Next packet: continue package review where the user points
  next.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Packet proof complete |
| Where am I going? | Close autogoal after completion checker |
| What is the goal? | No nested `editor.update.*` inside update callbacks; use active `tx` |
| What learned? | Public `withoutNormalizing` needed to carry the fully installed update transaction |
| What done? | Owner API, callers, skill rule, template, scanner, and proof completed |

Open risks:
- The read-only scanner is textual, not a TS AST pass. It is enough for this
  pattern, but a future broader lint rule would be stronger if this regresses.
