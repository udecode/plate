# plate-next static components withStatic drift review

Objective:
Deep-review static Plate Core files against `origin/main`, repair only real
Plate-to-Plite drift/type smell, and prove no regression with focused Core
static tests/typecheck.

Goal plan:
docs/plans/2026-07-03-plate-next-static-components-withstatic-drift-review.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user named `plate-next` and four static Core files
- mode: named file/API review packet
- target surface:
  `packages/core/src/static/components/PlateStatic.spec.tsx`,
  `packages/core/src/static/components/plite-nodes.tsx`,
  `packages/core/src/static/editor/withStatic.spec.tsx`,
  `packages/core/src/static/editor/withStatic.tsx`
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related Core sweep: yes, for each patched smell
- completion threshold summary: target files have main-parity ownership,
  Plite-native implementation, no avoidable `any`/cast migration sludge, and
  focused static tests plus Core typecheck pass

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: N/A
- semantics: named review packet, no timed loop requested
- initial confidence score: 70
- improvement loop: reviewed main/current, patched type drift, ran proof
- final score / loop closure: 95 for named static packet

Completion threshold:
- Exact done state: the four target files are reviewed against `origin/main`,
  each receives a review-matrix verdict, accepted cleanups are patched, same
  smell searches are run across Core static surfaces, focused static tests pass,
  Core typecheck passes, and this plan passes `check-complete`.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-plate-next-static-components-withstatic-drift-review.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands:
  `pnpm --filter @platejs/core exec bun test src/static/components/PlateStatic.spec.tsx src/static/editor/withStatic.spec.tsx`
- package proof: `pnpm --filter @platejs/core typecheck`
- source audits:
  `rg -n "data-slate|@platejs/slate|editor\\.tf|editor\\.children|editor\\.selection|editor\\.meta|findPath|getApi|getPluginApi|SlateElement|SlateLeaf|SlateText|slate-nodes" packages/core/src/static --glob '!**/dist/**'`
- related Core sweep query / match count / patched count / deferred count:
  see related Core sweep ledger
- Plite/Plate gap ledger: no blockers
- broad Core drift ledger gate: N/A, broad Core sweep not requested
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-plate-next-static-components-withstatic-drift-review.md`

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
- allowed edit scope: target files plus directly owned static plugin/editor
  typing if required to remove target-file casts
- package/API surfaces: Core static renderer/editor/plugin typing only
- docs/browser surfaces: none
- non-goals: no broad Core sweep, no rename pass, no legacy controlled
  `PlateStatic value` alias, no `Slate*` restoration except intentionally
  comparing upstream/main evidence
- out-of-scope package errors: ignore non-Core package failures unless caused
  by these Core static changes

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- None.

Current verdict:
- verdict: keep
- confidence: high for the named static packet; broader static type renames are
  out of scope
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: target static files now use Plite-native editor APIs, no local
  plugin/editor cast hacks remain in `withStatic`, focused static tests pass,
  Core typecheck passes, and Core lint passes

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | four named files copied above |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` |
| Active goal checked or created | yes | this plan |
| Mode classified as named packet vs broad Core sweep | yes | named file/API packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | completion threshold |
| Broad Core drift ledger initialized when in scope | no | broad Core sweep not requested |
| Source of truth and allowed workspace recorded | yes | `origin/main` evidence, current checkout patches |
| Output budget strategy recorded | yes | targeted reads/searches |
| Public API fork routing checked | yes | no public API fork expected |
| Gap policy checked | yes | record Plite/Plate gap if casts require missing owner typing |
| Related Core sweep policy checked | yes | mandatory after each correction |
| Review-mode rename freeze checked | yes | no rename pass |

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
| Named verification threshold | yes | Run the proof commands named in this plan | 37 static tests pass; 65 tests pass with `withPlite.spec.ts`; Core typecheck pass |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | named packet only |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | all named rows score <=1 after cleanup |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | see recommendation table |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | no blocker |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | see sweep ledger |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm --filter @platejs/core typecheck` pass |
| Non-Core package error triage | no | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | no non-Core command run |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | hard Slate/static legacy audit has no matches |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | no new rename introduced |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | one current untracked file: `plite-nodes.tsx` |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | scoped `plate-next` review plus tests/typecheck/lint; no autoreview requested |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm --filter @platejs/core lint` pass |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | filled below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-plate-next-static-components-withstatic-drift-review.md` | to run after this update |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/static/components/PlateStatic.spec.tsx` | 1 | main-parity-cleanup | Core static proof | old Slate editor/plugin usage replaced with `createBaseEditor`/`createBasePlugin`; plugin casts removed; readonly live-root mutation cast kept and documented because test intentionally mutates memoization reference | keep |
| `packages/core/src/static/components/plite-nodes.tsx` | 1 | main-parity-cleanup | Core static nodes | public component prop `any` removed; node attribute merge typed; Plite data attributes retained | keep; file remains untracked until staged |
| `packages/core/src/static/editor/withStatic.spec.tsx` | 0 | main-parity-cleanup | Core static editor proof | direct editor state assertions moved to `editor.read.*`; `tf` path gone; casts removed | keep |
| `packages/core/src/static/editor/withStatic.tsx` | 0 | main-parity-cleanup | Core static editor | removed `_rest`, empty option aliases, `getStaticPlugins() as any`, and local `as BaseEditor`; typed via source-owner `extendBaseEditor` return | keep |
| `packages/core/src/static/plugins/ViewPlugin.ts` | 0 | main-parity-cleanup | Core static view plugin | connected `ViewApi` to `extendEditorApi`; old transform override shape is gone; writes Plite fragment MIME | keep |
| `packages/core/src/static/plugins/getStaticPlugins.ts` | 0 | main-parity-cleanup | Core static plugin list | preserves tuple type with `as const`, removing downstream casts | keep |
| `packages/core/src/lib/editor/withPlite.ts` return type | 0 | source-owner type repair | Core base editor | `extendBaseEditor` return type includes installed Core plugins, matching runtime reality | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Static renderer tests | Use Plite editor reads/updates and keep only an explicit live-root mutation cast for memoization proof | old `editor.children`, `editor.tf`, controlled `PlateStatic value` alias | Current Plite contract is read/update, not direct state mirrors or static controlled value alias | none |
| Static editor factory | `createStaticEditor` composes `getStaticPlugins()` into `extendBaseEditor` with inferred plugin input | `_rest`, `getStaticPlugins() as any`, `as unknown as ExtendStaticEditorOptions` | The Core base editor type now knows it always installs Core plugins | none |
| Static view plugin | Expose copy behavior as `editor.api.setFragmentData` and typed `ViewConfig['api']` | transform override / `tf.setFragmentData` | Static view copy is an API/service, not a mutation transaction | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | no blocker | no local workaround needed after `extendBaseEditor` return type fix | N/A | focused static tests/typecheck/lint | closed |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Remove local plugin/editor casts | `rg -n "as any|as unknown|_rest|plugins: \\[.*\\] as any" target static files` | 1 remaining `expect.any` only | static casts removed | none | none |
| Cut old static Slate API names | `rg -n "data-slate|@platejs/slate|editor\\.tf|editor\\.children|editor\\.selection|editor\\.meta|findPath|getApi|getPluginApi|SlateElement|SlateLeaf|SlateText|slate-nodes|application/x-slate-fragment" packages/core/src/static` | 0 | stale touched test wording and `findPath` comment patched | broader `SlateRender*` type names excluded from hard audit as rename pass | static public type naming debt remains separate |
| ViewPlugin API migration | `rg -n "setFragmentData\\(" packages/core/src packages/plite* packages/core/type-tests` | 7 static/react call sites | ViewPlugin spec and `PlateView` typing remain aligned with API path | none | none |

Core drift ledger:
- Applies: no
- Manifest command: N/A, named packet only
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: N/A

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | named packet only | N/A | broad Core sweep not requested | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| static cast cleanup | Core static | target files had migration casts and stale old API wording | target files, ViewPlugin, getStaticPlugins, `withPlite` return type | keep | no follow-up |
| static proof | Core static | behavior should match main while using Plite APIs | focused Bun tests, typecheck, lint | keep | no follow-up |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | done | `plate-next` read; target files and `origin/main` counterparts reviewed | implementation |
| Implementation | done | static casts/type drift patched; `extendBaseEditor` return type repaired | verification |
| Verification | done | focused tests, Core typecheck, Core lint, hard static audit passed | closeout |
| Closeout | done | ledgers filled; final handoff ready | final response |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/core/src/static/components/plite-nodes.tsx` | keep-current-plite-path | `origin/main` had `slate-nodes.tsx`; current branch imports/exports `plite-nodes.tsx` and user named this path | keep current path; not staged by this run | typecheck/lint/static tests pass |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | no non-Core proof errors | N/A | N/A |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `extendBaseEditor` return type now includes Core plugins; `withStatic` composes static plugins without local cast; `ViewPlugin` API is typed |
| tests/proof | static specs moved to Plite API/read/update shape; stale ViewPlugin spec wording and MIME expectations aligned |
| docs/templates/skills | this autogoal plan updated |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `plite-nodes.tsx` is untracked | Git will still show it as an added file until staged; I did not stage because no git action was requested | `packages/core/src/static/components/plite-nodes.tsx` | stage with the rest of the Plite rename when committing |
| 2 | Broader static `SlateRender*`/`stripSlateDataAttributes` names remain | They are outside this named packet and would be rename churn here | `packages/core/src/static/types.ts` | handle in a separate explicit static public type naming pass |

Findings:
- Target static behavior is clean against main: memoization, static editor
  initialization, static plugin order, and ViewPlugin copy payload are covered.
- `PlateStatic value` should stay cut; reintroducing it would be a legacy
  controlled-value alias against the current Plite read/update contract.
- The only intentional cast left in the named target files is
  `readMutableRoot(... ) as Value`, because that spec intentionally mutates the
  live root reference to test memoization.

Decisions and tradeoffs:
- Keep current Plite path/name for `plite-nodes.tsx` because the current branch
  imports it and the user named it directly.
- Do not rename broader `SlateRender*` static types in this packet.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/static/components/PlateStatic.spec.tsx src/static/editor/withStatic.spec.tsx src/static/plugins/ViewPlugin.spec.ts` -> 37 pass.
- `pnpm --filter @platejs/core exec bun test src/static/components/PlateStatic.spec.tsx src/static/editor/withStatic.spec.tsx src/static/plugins/ViewPlugin.spec.ts src/lib/editor/withPlite.spec.ts` -> 65 pass.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm --filter @platejs/core lint` -> pass.
- hard static legacy audit -> no matches.

Final handoff contract:
- target surface and mode: named static Core packet
- files/APIs reviewed: target four files plus related ViewPlugin,
  getStaticPlugins, getRenderNodeStaticProps comment, and `extendBaseEditor`
  return typing
- broad Core drift score coverage: N/A
- best Plate v2 recommendation: keep static renderer/editor as Plite-native
  read/update/API path; no legacy aliases
- verdict matrix summary: all target rows keep after cleanup
- Plite/Plate gaps or blockers: none
- related Core sweep query/matches/patched/deferred: recorded above
- changes made: static tests, static plugin typing, static editor typing,
  source-owner base editor return type
- tests/proof commands: recorded above
- old compatibility names audited: hard audit passed
- needs attention: untracked `plite-nodes.tsx`; broader static type naming
  debt
- next best Plate Next packet: explicit static public type naming pass if you
  want to cut `SlateRender*` names

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Named static packet closure |
| Where am I going? | Final handoff |
| What is the goal? | Prove the four named static files have no drift regression against main while fitting Plite |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- 2026-07-03T20:42:32.631Z Goal plan created.
- 2026-07-03 Static files reviewed against `origin/main`.
- 2026-07-03 Removed avoidable static casts and stale old API wording.
- 2026-07-03 Patched `extendBaseEditor` return type so `withStatic` no longer
  needs a local return cast.
- 2026-07-03 Focused static tests, Core typecheck, and Core lint passed.

Open risks:
- `plite-nodes.tsx` is untracked until staged.
- Broader static public type names with `SlateRender*` are outside this packet.
