# plate-next create input rules drift

Objective:
Repair `packages/core/src/lib/plugins/input-rules/createInputRules.ts` so the
Plite migration stays behavior-correct without local wrapper sprawl.

Plate Next source:
- prompt: `now fully repair packages/core/src/lib/plugins/input-rules/createInputRules.ts , too much additions`
- mode: named file/API review packet
- target surface: Core input-rule factory helpers and runtime proof
- broad Core sweep: no
- correction-triggered related Core sweep: yes
- completion threshold: the target file keeps only justified Plite migration
  helpers, old wrapper names are audited away, focused behavior proof passes,
  Core type/lint/check gates pass, and same-class matches are reviewed.

First checkpoint:
- [x] Target copied: `packages/core/src/lib/plugins/input-rules/createInputRules.ts`.
- [x] Requirement copied: fully repair the file, especially excessive additions.
- [x] Scope boundary copied: named Core file, not broad Core sweep.
- [x] Style boundary copied from `plate-next`: keep main ownership/readability,
      no legacy compat, no helper dumps, no unnecessary renames.
- [x] Stop condition copied: stop when file is clean, proof passes, and related
      sweep has no same-class leftovers.

Completion threshold:
- [x] `plate-next` skill and `VISION.md` / `docs/vision/plate.md` /
      `docs/vision/common.md` read.
- [x] Compared current file against `origin/main`.
- [x] Removed trivial migration wrappers instead of preserving old Plate/Slate
      helper names.
- [x] Preserved current Plite API shape: `editor.read.*` and
      `editor.update.*`, no `editor.tf`.
- [x] Restored behavior where the migration had drifted: block-start
      `mode: "toggle"` toggles active blocks back to paragraph, and
      delimiter lookup only searches broadly when `skipInvalid: true`.
- [x] Added focused behavior tests for those two risks.
- [x] Related Core sweep run and recorded.
- [x] Extracted/untracked file inventory run for the target scope.
- [x] Focused tests, Core typecheck, Core lint, and `check:core` pass.

Verification surface:
- focused behavior tests: `packages/core/src/react/utils/inputRules.spec.tsx`
  and `packages/core/src/lib/plugins/input-rules/**`
- package type surface: `pnpm --filter @platejs/core typecheck`
- package lint surface: `pnpm --filter @platejs/core lint`
- Core closure surface: `pnpm check:core`
- source audit surface: exact `rg` query recorded in the related sweep ledger

Constraints:
- No public compatibility aliases.
- No `editor.tf`, `editor.transforms`, or `plugin.transforms`.
- No duplicate Plate wrapper around a direct Plite read/update method.
- No helper extraction when a direct Plite call is clearer.
- No rename pass in this packet.
- Preserve current behavior unless a Plate v2 hard cut is explicit.

Boundaries:
- allowed edits: the named input-rule file, focused Core input-rule runtime
  spec, and this autogoal plan.
- not in scope: broad Core drift ledger, public Plite API redesign, package
  sweep, docs rewrite, browser proof, changeset.
- proof boundary: Core/Plite package gates are enough; non-Core package fallout
  is out of scope unless caused by this Core API change.

Blocked condition:
- none. No Plite or Plate blocker prevented the scoped repair.

Work Checklist:
- [x] Read `plate-next` skill.
- [x] Read root and Plate/Common vision files.
- [x] Compare target with `origin/main`.
- [x] Identify unnecessary helper additions.
- [x] Cut direct wrapper helpers.
- [x] Preserve needed input-rule matcher semantics.
- [x] Add behavior tests for restored semantics.
- [x] Run related Core sweep.
- [x] Run focused proof.
- [x] Run Core closure proof.
- [x] Record changed files, risks, and next owner.

Phase / pass table:
| Phase | Status | Evidence |
| --- | --- | --- |
| Source comparison | done | current file and `origin/main` file inspected |
| Implementation | done | `createInputRules.ts` wrapper cleanup and behavior repair |
| Runtime proof | done | focused input-rule test command passed |
| Core proof | done | typecheck, lint, and `check:core` passed |
| Sweep | done | exact old-name/helper audit produced zero matches |
| Plan closure | done | this plan updated with final evidence |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
| --- | ---: | --- | --- | --- | --- |
| `packages/core/src/lib/plugins/input-rules/createInputRules.ts` | 0 | main-parity-cleanup | Core input rules | wrapper helpers cut; `editor.tf` replaced by Plite read/update; toggle and delimiter behavior covered | keep |
| `packages/core/src/react/utils/inputRules.spec.tsx` | 0 | justify-new-proof-tooling | Core input rules proof | added runtime tests for non-adjacent mark delimiters and active block toggle | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
| --- | --- | --- | --- | --- |
| Input-rule helpers | Keep a tiny local matcher helper for input-rule-only delimiter lookup; inline direct Plite reads/writes elsewhere | public `editor.api.before/range/string`, `editor.tf.toggleBlock`, one-off wrapper helpers like `getInputRuleText` | Core owns feature-agnostic matcher access; Plite owns primitives; local code should not recreate old API names | low |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
| --- | --- | --- | --- | --- | --- |
| none blocking | none | not applicable | not applicable | not applicable | no Plite API change in this packet |
| defer-with-owner | generic old `before(matchString)` ergonomics may be worth a Plite plan only if repeated outside input rules | public reintroduction from one file would churn Plite API too early | `plite-plan` | repeated caller evidence | defer |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
| --- | --- | ---: | ---: | ---: | --- |
| removed wrapper helpers and old API names | `rg -n "getInputRuleText|getInputRuleRange|getInputRuleBlock|getLocationStartPoint|toggleEditorBlock|hasCollapsedSelection|editor\\.tf|editor\\.transforms|plugin\\.transforms|api\\.before|api\\.range|api\\.string|tf\\.toggleBlock|removeMarks" packages/core/src/lib/plugins/input-rules packages/core/src/react/utils/inputRules.spec.tsx -g '*.ts' -g '*.tsx'` | 0 | 0 | 0 | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
| --- | --- | --- | --- | --- |
| none | no extracted files | `git ls-files --others --exclude-standard packages/core/src/lib/plugins/input-rules packages/core/src/react/utils/inputRules.spec.tsx \| sort` produced no rows | keep scope closed | command output empty |

Changed files:
- `packages/core/src/lib/plugins/input-rules/createInputRules.ts`
- `packages/core/src/react/utils/inputRules.spec.tsx`
- `docs/plans/2026-07-01-plate-next-create-input-rules-drift.md`

Proof:
- `pnpm --filter @platejs/core exec bun test src/react/utils/inputRules.spec.tsx src/lib/plugins/input-rules` -> 24 pass
- `pnpm --filter @platejs/core typecheck` -> pass
- `pnpm --filter @platejs/core lint` -> pass
- `pnpm check:core` -> pass
- source audit above -> no matches
- extracted-file inventory above -> no rows

Verification evidence:
| Command | Result |
| --- | --- |
| `pnpm --filter @platejs/core exec bun test src/react/utils/inputRules.spec.tsx src/lib/plugins/input-rules` | 24 pass |
| `pnpm --filter @platejs/core typecheck` | pass |
| `pnpm --filter @platejs/core lint` | pass |
| `pnpm check:core` | pass |
| old-name/helper `rg` audit | no matches |
| target-scope untracked inventory | no rows |

Open risks:
- Deferred only: if more callers need old `before(matchString)` semantics,
  route a dedicated `plite-plan` for a Plite-native query primitive instead of
  growing local helper copies.

Reboot status:
- current. Resume from the final score and proof above; no active packet is
  half-applied.

Keep / revert / quarantine:
- decision: keep
- reason: target file is smaller than the migration helper dump, old public
  compatibility names remain cut, and the two behavior risks are now covered.

Final score:
- confidence: 96/100
- remaining risk: only the deferred question of whether old
  `before(matchString)` belongs as a future Plite ergonomic primitive if more
  callers appear.
- next owner: continue one-by-one `plate-next` review on the next Core file the
  user selects.
