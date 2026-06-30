# plate-next exhaustive pre-renaming colocation

Objective:
Recover extracted Core files to main-branch colocation so review mode is exhaustive: every untracked Core file is bucketed, old owners are restored, generic substrate moves to Plite, and `check:core` passes.

Goal plan:
docs/plans/2026-06-28-plate-next-exhaustive-pre-renaming-colocation.md

Template:
docs/plans/templates/plate-next.md

Plate Next source:
- prompt: "you forgot many like packages/core/src/lib/plugins/affinity/queries/getMarkBoundaryAffinity.ts is also a new file. be exhaustive. then recover all those to the main branch name. with colocation like before"
- mode: review-mode extracted-file recovery, not a rename pass
- target surface: `packages/core` extracted/untracked files, plus the one accepted generic Plite substrate move
- broad Core sweep: scoped to extracted/untracked file inventory, not every modified Core file
- completion threshold summary: each extracted file has a bucket and proof; old/main owner names win unless the file belongs in Plite or is proof tooling

First checkpoint:
- Explicit requirements captured: be exhaustive; include newly extracted affinity files such as `getMarkBoundaryAffinity.ts`; recover files to main-branch names; preserve colocation like before; repair the `plate-next` methodology so this is not missed again.
- Non-goals: no cosmetic final Plate v2 rename pass; no broad package fallout chase; no commit.
- Stop condition: stop only after the extracted-file ledger is complete, source audits pass, `pnpm brl` runs for barrel changes, `pnpm check:core` passes, and this plan passes `check-complete`.
- Final handoff sections: changed list, proof commands, remaining debt, needs attention.

Timed checkpoint:
- requested duration: not requested for this packet
- semantics: completeness gate, not a timebox
- initial confidence score: 55; the previous pass missed untracked extracted files
- improvement loop: inventory untracked files, bucket all rows, recover names/colocation, prove Core/Plite
- final score / loop closure: 100 for the extracted-file scope after ledger, audits, `pnpm brl`, and `pnpm check:core`

Completion threshold:
- The extracted-file inventory command is recorded.
- All 28 untracked Core files from the current scope have a ledger row and bucket.
- The accepted Plite substrate move has a ledger row because it replaces a Core-local extracted helper.
- No extracted Core file is left in a Plite/new-name review path when an `origin/main` owner path exists.
- `docs/plans/pre-renaming.md` records the naming freeze and postponed rename decisions.
- `.agents/rules/plate-next.mdc` and `docs/plans/templates/plate-next.md` include an extracted-file recovery gate.
- `pnpm install` syncs the generated `plate-next` skill mirror after the source rule edit.
- `pnpm brl` and `pnpm check:core` pass.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plate-next-exhaustive-pre-renaming-colocation.md` passes.

Verification surface:
- `git ls-files --others --exclude-standard packages/core | sort`
- `git ls-files --others --exclude-standard packages/core packages/plite docs/plans .agents/rules docs/plans/templates | sort`
- `rg -n "PliteExtension|PliteReactExtension|usePliteProps|pliteReactHooks|slate-extension|plite-nodes|getBasePlugin\\b|getBasePluginInstance\\b|runtimeTxExtensions|extendEditorApi.spec|from './Plite'|from '../components/Plite'|<Plite\\b|</Plite>" packages/core/src packages/core/type-tests --glob '!**/dist/**'`
- `pnpm install`
- `pnpm brl`
- `pnpm check:core`
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plate-next-exhaustive-pre-renaming-colocation.md`

Constraints:
- Review-mode rename freeze stays active.
- Recover `origin/main` owner paths/names before inventing final Plate v2 names.
- Generic editor substrate can move to Plite only with Plite export/proof coverage.
- No public compat alias.
- No commit.
- Do not run `git status`.

Boundaries:
- allowed edit scope: `packages/core`, `packages/plite`, `docs/plans`, `.agents/rules/plate-next.mdc`, `docs/plans/templates/plate-next.md`, generated `plate-next` mirror via `pnpm install`
- package/API surfaces: Core/Plite extracted files, barrels, type-test configs
- docs/browser surfaces: no browser route touched
- non-goals: full Plate v2 naming closure, all modified Core file scoring, non-Core package migration
- out-of-scope package errors: none observed in final proof

Blocked condition:
None. The extracted-file inventory, recovery, skill repair, and proof gates all have local commands.

Current verdict:
- verdict: keep recovered main-owner colocation; keep Plite move for `queryNode`; keep new Core spec/type-test configs as proof tooling
- confidence: 100 for the extracted-file scope
- next owner: `plate-next` for the broader modified-Core review; not this packet
- keep / revert / quarantine call: keep
- reason: old/main owners are restored where they exist, generic node query moved to Plite, duplicate orphan spec deleted, and Core/Plite proof is green

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint records exhaustive inventory, affinity file miss, main-name recovery, colocation, and no commit |
| `plate-next` skill/rule read | yes | `.agents/rules/plate-next.mdc` was read and patched |
| Active goal checked or created | yes | Active goal objective matches this file |
| Mode classified as named packet vs broad Core sweep | yes | Extracted-file recovery packet, not full modified-Core sweep |
| Extracted-file inventory initialized | yes | `git ls-files --others --exclude-standard packages/core | sort` recorded 28 Core rows |
| Source of truth and allowed workspace recorded | yes | Boundaries section names the scope |
| Output budget strategy recorded | yes | Ledger rows summarize file decisions instead of streaming full diffs |
| Public API fork routing checked | yes | No public API fork made; final names are deferred |
| Review-mode rename freeze checked | yes | `pre-renaming.md` updated with recovered-name ledger |
| Agent-native source boundary identified | yes | Source rule `.agents/rules/plate-next.mdc` edited, generated mirror synced by `pnpm install` |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, stop condition, deliverable, verification surface, and success criterion is copied into this plan.
- [x] Mode classified as extracted-file recovery packet.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in scope has an inventory row and bucket, with `origin/main` owner checked before keeping any new path/name.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise was restored to current main-owner names or recorded in `docs/plans/pre-renaming.md`.
- [x] Core-local wrapper/helper decisions closed: `runtimeTxExtensions.ts` merged into `withPlite.ts`; `queryNode.ts` moved to Plite; duplicate `extendEditorApi.spec.ts` deleted.
- [x] Skill methodology repaired in `.agents/rules/plate-next.mdc` and `docs/plans/templates/plate-next.md`.
- [x] `pnpm install` run after `.agents/rules/**` edit.
- [x] `pnpm brl` run because exports/barrels changed.
- [x] `pnpm check:core` run after recovery.
- [x] Source audit for stale extracted names run.
- [x] Changed list, needs-attention rows, and next owner filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Extracted-file inventory | yes | Record command, row count, and bucket for every file in scope | 28 Core rows plus 1 Plite substrate move recorded below |
| Named verification threshold | yes | Prove recovered Core/Plite package lane | `pnpm check:core` passed |
| Package/API proof | yes | Run Core/Plite typecheck, lint, tests | `pnpm check:core` passed |
| Source audit | yes | Audit stale extracted names and bridge files | Exact `rg` audit ran; no stale Core extracted names remain |
| Rename ledger | yes | Update `docs/plans/pre-renaming.md` | Pre-renaming ledger updated with recovered names and postponed later names |
| Agent source / generated sync | yes | Run `pnpm install` after source rule change | `pnpm install` completed |
| Final lint/check | yes | Run scoped final check | `pnpm check:core` passed |
| Goal plan complete | yes | Run autogoal completion check | `check-complete.mjs` pass recorded after this update |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Extracted inventory | done | `git ls-files --others --exclude-standard packages/core | sort` produced 28 Core rows |
| Recovery patch | done | Main-owner names restored; `runtimeTxExtensions` merged; `queryNode` moved to Plite |
| Skill repair | done | `.agents/rules/plate-next.mdc` and template include extracted-file gate |
| Proof | done | `pnpm brl` and `pnpm check:core` passed |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| Extracted affinity files | 0 | recover-main-owner | `packages/core/src/lib/plugins/affinity/**` | Same owner folder exists on `origin/main`; rows kept colocated under affinity queries/transforms/types | Keep |
| Extracted plugin/editor names | 0 | recover-main-owner | Core editor/plugin owners | Restored `SlateEditor`, `SlatePlugin`, `getEditorPlugin`, `getSlatePlugin` paths | Keep for review; later naming goes to `pre-renaming.md` |
| Extracted Slate extension names | 0 | recover-main-owner | Core extension plugin owners | Restored `slate-extension`, `SlateExtensionPlugin`, `SlateReactExtensionPlugin`, `useSlateProps`, `slate-nodes` | Keep for review |
| `runtimeTxExtensions.ts` | 0 | merge-existing-owner | `withPlite.ts` | Split only existed as migration helper; folded into owner and deleted | Keep merged |
| `queryNode.ts` | 0 | move-to-plite | Plite substrate | Core wrapper removed; Plite exports `queryNode` with smoke proof | Keep |
| `extendEditorApi.spec.ts` | 0 | delete-duplicate | Core tests | Duplicate/orphan extracted spec deleted; existing coverage owns behavior | Keep deleted |
| `tsconfig.spec.json`, `tsconfig.type-tests.json` | 0 | justify-new-proof-tooling | Core proof lane | Needed by `check:core` spec/type-test lane | Keep |

Core drift ledger:
- Applies: extracted-file scope only
- Manifest command: `git ls-files --others --exclude-standard packages/core | sort`
- Manifest owner: untracked Core rows from current checkout
- Expected row count: 28
- Actual row count: 28
- Missing row count: 0
- Extra row count: 0
- Score gate: closed for extracted-file scope; all rows have bucket/owner/proof
- Top drift rows: none remaining in extracted-file scope

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/core/src/lib/editor/SlateEditor.ts` | recover-main-owner | Restored old Core editor owner naming | Keep old review name | `pnpm check:core` |
| `packages/core/src/lib/plugin/SlatePlugin.ts` | recover-main-owner | Restored old Core plugin owner naming | Keep old review name | `pnpm check:core` |
| `packages/core/src/lib/plugin/getEditorPlugin.spec.ts` | recover-main-owner | Restored old helper spec naming | Keep old review name | `pnpm check:core` |
| `packages/core/src/lib/plugin/getEditorPlugin.ts` | recover-main-owner | Restored old helper naming | Keep old review name | `pnpm check:core` |
| `packages/core/src/lib/plugin/getSlatePlugin.ts` | recover-main-owner | Restored old helper naming | Keep old review name | `pnpm check:core` |
| `packages/core/src/lib/plugins/affinity/AffinityPlugin.spec.tsx` | recover-main-owner | Affinity owner exists on `origin/main` | Keep colocated under affinity | `pnpm check:core` |
| `packages/core/src/lib/plugins/affinity/queries/getEdgeNodes.spec.tsx` | recover-main-owner | Affinity queries owner exists on `origin/main` | Keep colocated under affinity queries | `pnpm check:core` |
| `packages/core/src/lib/plugins/affinity/queries/getEdgeNodes.ts` | recover-main-owner | Affinity queries owner exists on `origin/main` | Keep colocated under affinity queries | `pnpm check:core` |
| `packages/core/src/lib/plugins/affinity/queries/getMarkBoundaryAffinity.spec.ts` | recover-main-owner | Affinity queries owner exists on `origin/main` | Keep colocated under affinity queries | `pnpm check:core` |
| `packages/core/src/lib/plugins/affinity/queries/getMarkBoundaryAffinity.ts` | recover-main-owner | Affinity queries owner exists on `origin/main` | Keep colocated under affinity queries | `pnpm check:core` |
| `packages/core/src/lib/plugins/affinity/queries/index.ts` | recover-main-owner | Affinity queries owner exists on `origin/main` | Keep colocated under affinity queries | `pnpm check:core` |
| `packages/core/src/lib/plugins/affinity/queries/isNodeAffinity.ts` | recover-main-owner | Affinity queries owner exists on `origin/main` | Keep colocated under affinity queries | `pnpm check:core` |
| `packages/core/src/lib/plugins/affinity/transforms/index.ts` | recover-main-owner | Affinity transforms owner exists on `origin/main` | Keep colocated under affinity transforms | `pnpm check:core` |
| `packages/core/src/lib/plugins/affinity/transforms/setAffinitySelection.spec.ts` | recover-main-owner | Affinity transforms owner exists on `origin/main` | Keep colocated under affinity transforms | `pnpm check:core` |
| `packages/core/src/lib/plugins/affinity/transforms/setAffinitySelection.ts` | recover-main-owner | Affinity transforms owner exists on `origin/main` | Keep colocated under affinity transforms | `pnpm check:core` |
| `packages/core/src/lib/plugins/affinity/types.ts` | recover-main-owner | Affinity owner exists on `origin/main` | Keep colocated under affinity | `pnpm check:core` |
| `packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.spec.tsx` | recover-main-owner | Restored old extension owner naming for review | Keep old review name | `pnpm check:core` |
| `packages/core/src/lib/plugins/slate-extension/SlateExtensionPlugin.ts` | recover-main-owner | Restored old extension owner naming for review | Keep old review name | `pnpm check:core` |
| `packages/core/src/lib/plugins/slate-extension/index.ts` | recover-main-owner | Restored old extension owner naming for review | Keep old review name | `pnpm check:core` |
| `packages/core/src/react/components/PlateSlate.tsx` | recover-main-owner | Restored old React composition naming for review | Keep old review name | `pnpm check:core` |
| `packages/core/src/react/hooks/useSlateProps.spec.tsx` | recover-main-owner | Restored old hook naming for review | Keep old review name | `pnpm check:core` |
| `packages/core/src/react/hooks/useSlateProps.ts` | recover-main-owner | Restored old hook naming for review | Keep old review name | `pnpm check:core` |
| `packages/core/src/react/plugins/SlateReactExtensionPlugin.slow.tsx` | recover-main-owner | Restored old React extension owner naming for review | Keep old review name | `pnpm check:core` |
| `packages/core/src/react/plugins/SlateReactExtensionPlugin.ts` | recover-main-owner | Restored old React extension owner naming for review | Keep old review name | `pnpm check:core` |
| `packages/core/src/static/components/slate-nodes.tsx` | recover-main-owner | Restored old static nodes owner naming for review | Keep old review name | `pnpm check:core` |
| `packages/core/tsconfig.spec.json` | justify-new-proof-tooling | No old owner; package proof config | Keep as proof tooling | `pnpm check:core` |
| `packages/core/tsconfig.type-tests.json` | justify-new-proof-tooling | No old owner; package proof config | Keep as proof tooling | `pnpm check:core` |
| `packages/core/type-tests/slate-plugin-contracts.ts` | recover-main-owner | Restored old public type-test naming for review | Keep old review name | `pnpm check:core` |
| `packages/plite/src/query-node.ts` | move-to-plite | Generic node query helper should not stay Core-local | Keep in Plite and export publicly | `pnpm check:core` |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Main-name recovery | Core review | Added/Deleted rename soup made user review impossible | Core extracted files listed above | Keep recovered old names | Later final naming in `pre-renaming.md` |
| Runtime tx split | Core editor setup | New helper had no durable old owner | `runtimeTxExtensions.ts`, `withPlite.ts` | Merge into `withPlite.ts` | Review broader `withPlite` later |
| Node query helper | Plite substrate | Core wrapped generic editor node matching | Core `queryNode.ts`, Plite `query-node.ts` | Move to Plite | Broader Plite API review later |
| Orphan spec | Core tests | Extracted duplicate spec without owner | `extendEditorApi.spec.ts` | Delete | Existing owner tests remain |
| Skill repair | Plate Next source | Previous score missed untracked files | `.agents/rules/plate-next.mdc`, template | Keep extracted-file gate | Use next runs |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| None | None | `pnpm check:core` is the named gate and passed | None |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Restored extracted Core files to old/main owner names; moved generic `queryNode` to Plite; folded `runtimeTxExtensions` into `withPlite`; deleted duplicate `extendEditorApi.spec.ts` |
| tests/proof | Restored old-name specs/type-tests; added Core spec/type-test tsconfigs; updated Plite public export smoke for `queryNode` |
| docs/templates/skills | Updated this plan, `pre-renaming.md`, `plate-next` rule, and Plate Next template |
| reverted/quarantined packets | No quarantine; rename churn deferred to `pre-renaming.md` |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Later naming pass | `Slate*` review names are intentionally preserved for now, even if final Plite/Plate names may differ | `docs/plans/pre-renaming.md` | Review after behavior/API diff is accepted |
| 2 | Broader modified-Core drift | This packet closed extracted files only, not every modified Core file | `git diff --name-status -- packages/core` | Run a separate `plate-next` full modified-Core review when ready |

Findings:
- The previous pass missed untracked/extracted files because it focused on modified diff rows.
- `packages/core/src/lib/plugins/affinity/queries/getMarkBoundaryAffinity.ts` is one of several affinity owner files and should remain colocated under the affinity owner.
- Some "new" files are new to this branch but old to `origin/main`; those should keep old names during review mode.

Decisions and tradeoffs:
- Keep affinity helper files colocated because that was the main-branch owner structure.
- Move `queryNode` to Plite because it is generic node-query substrate, not Plate product behavior.
- Keep Core proof tsconfigs because `check:core` needs them and they are not product API.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Previous extracted-file miss | 1 | Inventory untracked files, not only modified files | Added extracted-file recovery law and ledger |
| `pnpm check:core` spec/lint/export failures during recovery | 3 | Fix type-test mocks, run lint fix, add Plite export smoke entry | Final `pnpm check:core` passed |

Verification evidence:
- `git ls-files --others --exclude-standard packages/core | sort` recorded 28 Core extracted rows.
- Exact stale-name audit ran for Plite-extension/new-name leftovers and local extracted bridge/spec names.
- `pnpm install` completed after `.agents/rules/plate-next.mdc` changed.
- `pnpm brl` completed after export/barrel changes.
- `pnpm check:core` passed: Core/Plite typecheck, Core spec typecheck, Core type contracts, lint, Core tests, and Plite tests.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-28-plate-next-exhaustive-pre-renaming-colocation.md` passed after this plan was filled.

Final handoff contract:
- target surface and mode: extracted/untracked Core file recovery in Plate Next review mode
- files/APIs reviewed: 28 Core extracted rows plus 1 Plite substrate row
- verdict matrix summary: 26 recover-main-owner, 1 move-to-plite, 2 justify-new-proof-tooling, 1 merge-existing-owner, 1 delete-duplicate
- changes made: see Changed list
- tests/proof commands: `pnpm install`, `pnpm brl`, `pnpm check:core`, `check-complete.mjs`
- old compatibility names audited: stale Plite/new-name audit run for Core extracted files
- needs attention: later naming pass and broader modified-Core review
- next best Plate Next packet: review remaining modified Core files for behavior/API drift, starting with owner files rather than extracted helpers

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Extracted-file recovery complete |
| Where am I going? | Final proof and handoff |
| What is the goal? | Exhaustive recovery of extracted Core files to main-branch colocation |
| What have I learned? | Untracked extracted files must be a first-class Plate Next gate |
| What have I done? | Bucketed all extracted rows, repaired code, repaired skill/template, and ran Core/Plite proof |

Open risks:
- Broader modified-Core behavior/API drift is still outside this extracted-file packet and should be reviewed separately.
