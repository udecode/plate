# plate-next move redecorate to plite react

Objective:
Move Core `RedecoratePlugin` into Plite React as a better-named decoration
refresh API; delete the Core plugin and prove Plate callers still work.

Goal plan:
docs/plans/2026-07-02-plate-next-move-redecorate-to-plite-react.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user asked why `packages/core/src/lib/plugins/redecorate/RedecoratePlugin.ts`
  exists and wants the API in Plite React, maybe with a better name
- mode: named API/ownership cleanup packet
- target surface: Core `RedecoratePlugin`, Plate React installation, navigation
  feedback callers, Plite React API owner
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related Core sweep: yes, audit `RedecoratePlugin`,
  `redecorate`, and new `refreshDecorations`
- completion threshold summary: Core `RedecoratePlugin` gone, Plite React owns
  `editor.api.react.refreshDecorations()`, Plate callers use it, focused proof
  passes

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: none
- semantics: not timed
- initial confidence score: 82/100
- improvement loop: move API to Plite React, choose final name, delete Core
  plugin, update callers/tests
- final score / loop closure: 98/100 after focused proof, typecheck, lint,
  barrels, and source audits passed

Completion threshold:
- `RedecoratePlugin` source/export/core-plugin registration is deleted.
- `editor.api.redecorate` is gone from Core/Plate code and tests.
- Plite React exposes the live method as `editor.api.react.refreshDecorations`.
- Plate runtime installs that method from its store-backed invalidator.
- Navigation feedback and tests call `editor.api.react.refreshDecorations`.
- Named file/API work may close from a scoped source map and focused proof.
- One-by-one review work may close only after the best Plate v2 recommendation
  is recorded, legacy/backcompat hacks are rejected, any Plite/Plate gaps are
  named, and every correction has a related Core sweep row.
- Broad Core sweep may close only when every Core source file has a valid row
  in this plan's Core drift ledger section or a linked plan artifact summarized
  in this plan.
- The plan records manifest command, expected row count, actual row count,
  missing row count, extra row count, and top drift rows before closeout.
- Any drift score `>=2` has an owner, evidence, and next action.
- Any drift score `>=4` is fixed, hard-cut, moved, quarantined, or deferred
  with owner/proof; it cannot close as `keep-in-plate`.
- Any file capped by the bridge scoring law must name the bridge dependency,
  the real owner, and the deletion path. It cannot be raised to 100 from
  `check:core` alone.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plate-next-move-redecorate-to-plite-react.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: `pnpm --filter @platejs/core exec bun test src/react/components/EditorMethodsEffect.spec.tsx src/react/components/PlateContent.spec.tsx src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.tsx src/lib/editor/withPlite.spec.ts`
- package proof: `pnpm turbo typecheck --filter=./packages/plite-react --filter=./packages/core`; `pnpm --filter @platejs/plite-react test`; `pnpm --filter @platejs/core lint`
- source audits: `rg -n "RedecoratePlugin|RedecorateConfig|api\\.redecorate|\\bredecorate\\b" packages/core packages/plite-react --glob '*.{ts,tsx}'`
- related Core sweep query / match count / patched count / deferred count:
  old redecorate audit returned 0 Core/Plite React matches; new
  `refreshDecorations` audit returned expected Plite React API, Plate store,
  navigation, and test matches
- Plite/Plate gap ledger: Plite React needs a first-class decoration refresh
  API; local Core plugin is the hack to remove
- broad Core drift ledger gate: N/A, named packet
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plate-next-move-redecorate-to-plite-react.md`

Constraints:
- Review mode targets the best Plate v2 shape: clean Plate product layer on top
  of Plite, no legacy compatibility goal.
- Plate owns product composition; Plite owns editor substrate.
- Core must not wrap Plite editor APIs under Plate names.
- No public compat aliases, old Slate shims, or docs for old API names.
- No local hacks: do not hide migration difficulty in bridge dumps, helper
  dumps, `any` casts, duplicated wrappers, command fallbacks, or fake aliases.
- If clean migration is blocked, record a `Plite gap` or `Plate gap` instead of
  inventing a compatibility workaround.
- After every correction, run a related Core sweep across `packages/core/src`
  and relevant `packages/core/type-tests` for the same symbol/pattern/smell.
- Review-mode rename freeze: keep current `HEAD` names/paths while behavior and
  API drift are under review. Put desirable later renames in
  `docs/plans/pre-renaming.md`; do not turn the active diff into Added/Deleted
  rename soup unless the user explicitly asks for a rename pass.
- Extracted-file recovery gate: every untracked/extracted Core/Plate source,
  spec, type-test, and config file in scope must be inventoried and classified
  as `recover-main-owner`, `merge-existing-owner`, `move-to-plite`,
  `justify-new-proof-tooling`, or `delete-duplicate`.
- No file or packet can score `100` while an extracted/untracked file in scope
  lacks a ledger row and one of those buckets.
- Private bridges require owner, deletion gate, and proof.
- Private bridges cannot collect displaced product/plugin behavior. A bridge
  file that centralizes input-rules, node-id, affinity, DOM, command, or change
  listener behavior scores `0` until deleted.
- Any file importing or installing a forbidden bridge is capped at `25`.
- Owner files whose runtime behavior lives in a forbidden bridge are capped:
  `InputRulesPlugin` `<=5`, `NodeIdPlugin` `<=45`, `AffinityPlugin` `<=55`,
  `PliteExtensionPlugin` `<=45`.
- Public type/plugin/editor files touched while a forbidden bridge remains are
  capped at `75`.
- If a helper exists only because migration was hard, cut it.
- Do not use a narrow representative file to close a broad Core sweep.
- For Core-only targets, ignore non-Core package errors unless the package is
  named, touched by the packet, or the failure proves a Core public API
  regression.

Boundaries:
- allowed edit scope: Plite React API/runtime, Core redecorate plugin and
  callers/tests, this plan
- package/API surfaces: `@platejs/plite-react` React API and `@platejs/core`
  plugin/caller surface
- docs/browser surfaces: out of scope unless type surface requires docs later
- non-goals: broad Core sweep, rename unrelated decoration concepts, feature
  package migration
- out-of-scope package errors: ignore unless caused by this API move

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if Plite React cannot expose the refresh method without a public API
  fork broader than `editor.api.react.refreshDecorations`.

Current verdict:
- verdict: move-to-plite-react
- confidence: 82/100 before patch
- next owner: plate-next
- keep / revert / quarantine call: keep if focused proof passes and old Core
  names audit clean
- reason: decoration invalidation is React runtime substrate; Core plugin
  no-op fallback is fake API surface

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Move API out of Core into Plite React and choose better name |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | Goal created for this plan |
| Mode classified as named packet vs broad Core sweep | yes | Named API/ownership packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | No Core no-op compatibility plugin |
| Broad Core drift ledger initialized when in scope | no | N/A: not broad Core sweep |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`, Core/Plite React owners |
| Output budget strategy recorded | yes | Targeted reads and focused proof |
| Public API fork routing checked | yes | Local Plite React API addition, no separate plan needed |
| Gap policy checked | yes | Plite React decoration refresh primitive is the owner |
| Related Core sweep policy checked | yes | Audit old and new symbols |
| Review-mode rename freeze checked | yes | Rename only the API because user explicitly asked for better name |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
- [x] Best Plate v2 call recorded for every reviewed target: `cut`,
      `move-to-plite`, `keep-in-plate`, `private-bridge-with-deletion-gate`,
      `Plite gap`, `Plate gap`, or `blocker`.
- [x] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate.
- [x] Hack check recorded: no bridge/helper dump, broad `any` cast, fake
      alias, or displaced product/plugin behavior is kept as a shortcut.
- [x] Gap ledger updated for every blocker: exact missing Plite or Plate
      capability, why local workaround is wrong, smallest owner, and proof.
- [x] After every correction, related Core sweep row is added with query,
      match count, patched count, deferred count, and remaining risk.
- [x] For broad Core sweep, the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout.
- [x] For broad Core sweep, every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`.
- [x] For broad Core sweep, the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero.
- [x] For broad Core sweep, the drift score gate is closed in this plan:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`.
- [x] Bridge scoring law applied: forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` is run when exports/barrels change.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands named in this plan | Focused Core tests, Plite React contract, typecheck, lint, brl, audits passed |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A named packet |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | All reviewed rows are score 0 after move |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | `react.refreshDecorations` in Plite React, no Core plugin |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | Gap closed by adding Plite React API |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | Old symbol audit clean |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | Core + Plite React typecheck passed |
| Non-Core package error triage | yes | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | Full Plite React package test/lint have unrelated existing failures recorded below |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | Old Core names 0 matches |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | API rename requested by user; no file rename |
| Extracted-file inventory | no | Record untracked/extracted file command, row count, and bucket for every file in scope | No new extracted Core file kept |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A narrow packet with focused proof |
| Final lint/check | yes | Run scoped lint/check or record N/A | Core lint and touched Plite React biome passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Filled below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-02-plate-next-move-redecorate-to-plite-react.md` | Run after ledger update |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/redecorate/RedecoratePlugin.ts` | 0 | hard-cut | none | Deleted no-op Core plugin | keep deleted |
| `editor.api.redecorate` | 0 | hard-cut | none | Source audit clean in Core/Plite React | keep cut |
| `editor.api.react.refreshDecorations` | 0 | move-to-plite | Plite React | Typed in `ReactApi`; contract test added | keep |
| `EditorMethodsEffect` install | 0 | keep-in-plate | Plate store bridge | Installs Plate store invalidator into Plite React API namespace | keep |
| `NavigationFeedbackPlugin` callers | 0 | main-parity-cleanup | Navigation feedback | Calls Plite React API instead of old Core top-level API | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Decoration refresh API | `editor.api.react.refreshDecorations()` | `editor.api.redecorate()`, Core no-op plugin, top-level API alias | This is React decoration projection invalidation, not generic Core substrate | no |
| Name | `refreshDecorations` | `redecorate` | Clearer job, less Slate-era jargon | no |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| Plite React API | React decoration invalidation method | Core no-op plugin fakes an API that only works once React mounts | `@platejs/plite-react` `ReactApi` | Plite React contract + Core caller proof | Patched |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Cut Core redecorate plugin | `rg -n "RedecoratePlugin|RedecorateConfig|api\\.redecorate|\\bredecorate\\b|useRedecorate" packages/core packages/plite-react --glob '*.{ts,tsx}'` | 0 | Core plugin, exports, registration, callers, tests | 0 | none |
| Add Plite React API | `rg -n "refreshDecorations" packages/core packages/plite-react --glob '*.{ts,tsx}'` | expected API/caller/test matches | Plite React + Core callers | 0 | none |

Core drift ledger:
- Applies: no, named API packet
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: N/A
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: none

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| Core redecorate surface | 0 | hard-cut | none | Deleted and audited clean | none |
| Navigation feedback refresh calls | 0 | main-parity-cleanup | Core navigation feedback | Focused tests pass | none |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Move redecorate to Plite React | plate-next | Core no-op plugin is wrong owner for React decoration invalidation | Plite React API, Plate store bridge, navigation callers, focused proof | keep | none |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Start gates | done | Prompt, scope, proof, and stop condition captured | none |
| Implementation | done | Core plugin deleted; Plite React API added; callers moved | none |
| Verification | done | Focused tests/typecheck/lint/brl/audits passed | none |
| Closeout | done | Plan ledgers filled | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/core/src/lib/plugins/redecorate/*` | delete-duplicate | Core no-op plugin was the wrong owner | deleted | source audit clean |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| `pnpm --filter @platejs/plite-react test` | Existing `surface-contract` fails on internal import allowlist for seven runtime files | Not caused by `refreshDecorations`; focused Plite React contract and typecheck passed | Plite React surface-contract cleanup |
| `pnpm --filter @platejs/plite-react lint` | Existing package-wide lint has 117 errors | Touched-file biome check passed; failures predate this packet | Plite React lint debt |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Added `ReactApi.refreshDecorations`; installed Plate store callback into `api.react`; removed Core `RedecoratePlugin` and exports; navigation feedback uses `api.react.refreshDecorations` |
| tests/proof | Updated Core tests and added Plite React contract assertion |
| docs/templates/skills | Plan only |
| reverted/quarantined packets | Removed dead assertion from non-included `with-react-contract.tsx`; kept small lint cleanup in that touched file |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Full Plite React package test/lint still red | Existing surface/lint debt unrelated to this API move | `packages/plite-react/test/surface-contract.tsx` | Handle in separate Plite React cleanup packet |

Findings:
- `RedecoratePlugin` was a no-op Core API shim; the real implementation came
  from React mount state.
- Extension APIs merge object namespaces, so Plate can safely install
  `api.react.refreshDecorations` without a top-level alias.

Decisions and tradeoffs:
- Name is `refreshDecorations`, not `redecorate`.
- API lives under `editor.api.react`, not top-level `editor.api`.
- Plate store still owns the concrete version bump because that is Plate state.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Tried direct Bun run of non-included `with-react-contract.tsx`; file is not runnable in current source/dist setup | 1 | Move assertion to included React editor contract | Passed |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/react/components/EditorMethodsEffect.spec.tsx src/react/components/PlateContent.spec.tsx src/react/plugins/navigation-feedback/NavigationFeedbackPlugin.spec.tsx src/lib/editor/withPlite.spec.ts src/react/stores/plate/createPlateStore.spec.tsx` -> 38 pass.
- `pnpm --filter @platejs/plite-react exec vitest run --config ./vitest.config.mjs test/react-editor-contract.test.tsx` -> 8 pass.
- `pnpm turbo typecheck --filter=./packages/plite-react --filter=./packages/core` -> pass.
- `pnpm brl` -> pass.
- `pnpm --filter @platejs/core lint` -> pass.
- `pnpm exec biome check packages/plite-react/src/plugin/with-react.ts packages/plite-react/src/hooks/use-plite-runtime.tsx packages/plite-react/test/react-editor-contract.tsx packages/plite-react/test/with-react-contract.tsx` -> pass.
- `rg -n "RedecoratePlugin|RedecorateConfig|api\\.redecorate|\\bredecorate\\b|useRedecorate" packages/core packages/plite-react --glob '*.{ts,tsx}'` -> 0 matches.

Final handoff contract:
- target surface and mode: named Core/Plite React API ownership packet
- files/APIs reviewed: `RedecoratePlugin`, `ReactApi`, `EditorMethodsEffect`,
  `NavigationFeedbackPlugin`, Core plugin registration/exports
- broad Core drift score coverage: N/A
- best Plate v2 recommendation: `editor.api.react.refreshDecorations`
- verdict matrix summary: hard-cut old Core plugin; move API to Plite React
- Plite/Plate gaps or blockers: no blocker; gap patched
- related Core sweep query/matches/patched/deferred: old symbol audit clean, 0 deferred
- changes made: listed above
- tests/proof commands: listed above
- old compatibility names audited: `RedecoratePlugin`, `RedecorateConfig`, `api.redecorate`, `redecorate`, `useRedecorate`
- needs attention: unrelated Plite React package test/lint debt
- next best Plate Next packet: continue user-directed Core review

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closed named API ownership packet |
| Where am I going? | Plan check and final handoff |
| What is the goal? | Move redecorate API to Plite React and delete Core shim |
| What have I learned? | React API namespace is the correct owner |
| What have I done? | Patched API, callers, tests, and proof |

Timeline:
- 2026-07-02T10:56:55.997Z Goal plan created.
- 2026-07-02T13:00:00.000Z Added `ReactApi.refreshDecorations` to Plite React.
- 2026-07-02T13:03:00.000Z Deleted Core `RedecoratePlugin` and moved callers/tests.
- 2026-07-02T13:06:00.000Z Focused Core and Plite React proof passed.

Open risks:
- Full `@platejs/plite-react` package test/lint remains red from unrelated
  existing surface/lint debt; focused touched-file proof is green.
