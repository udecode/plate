# plate-next static utils drift review

Objective:
Deep-review `packages/core/src/static/utils/*` against `origin/main`, repair
real Plate-to-Plite drift, and prove the static utilities are clean.

Goal plan:
docs/plans/2026-07-03-plate-next-static-utils-drift-review.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user named `plate-next` and
  `packages/core/src/static/utils/*`
- mode: named folder/API review packet
- target surface: every file directly under `packages/core/src/static/utils`
- related surface: `packages/core/src/static/serializeHtml.tsx` because the
  false `stripSlateDataAttributes` utility name was hard-cut
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related Core sweep: yes, for old names, casts, and
  selected DOM helpers
- completion threshold summary: every static utility has a review verdict,
  false Slate names in this target are cut, target-scope avoidable `any` casts
  are removed, deleted main-owned files are explicitly classified, focused
  static tests/typecheck/lint pass, barrels are regenerated, and this plan
  passes `check-complete`.

First checkpoint:
- Explicit requirement: deep-review `packages/core/src/static/utils/*`.
- Explicit requirement: compare against `origin/main`.
- Explicit requirement: answer whether the target has zero drift regression and
  is fully clean.
- Explicit requirement: use `plate-next`.
- Scope boundary: direct static utility files plus direct caller
  `serializeHtml.tsx` when required by utility rename.
- Timing constraint: none.
- Stop condition: close when verdict matrix, deletion/rename ledger, source
  audits, focused proof, and plan check are complete.
- Final handoff sections: verdict, files changed, sweep result, proof commands,
  blockers/gaps, and attention items.
- Broad sweep status: not requested; do not claim full Core closure.

Timed checkpoint:
- requested duration: N/A
- semantics: named folder review packet
- initial confidence score: 58, because current tests passed but the diff had
  deleted main-owned files, a false utility name, and target-scope casts
- improvement loop: compare with `origin/main`, inspect callers, cut false
  utility name, remove avoidable target casts, run focused proof and source
  audits
- final score / loop closure: 96 for this named static-utils packet

Completion threshold:
- Exact done state: all direct static utility files are reviewed against
  `origin/main`; `getSelectedDomBlocks` deletion is proven safe; the false
  `stripSlateDataAttributes` name is hard-cut with no alias; no target-scope
  old Slate imports/data names/`editor.tf`/`findPath`/avoidable `any` casts
  remain; static tests, Core typecheck, Core lint, barrel generation, source
  audits, extracted-file inventory, and `check-complete` pass.
- Named folder work may close from a scoped source map and focused proof.
- Broad Core sweep is N/A because the user named `static/utils/*`.

Verification surface:
- file inventory:
  `rg --files packages/core/src/static/utils | sort`
- main inventory:
  `git ls-tree -r --name-only origin/main packages/core/src/static/utils | sort`
- diff inventory:
  `git diff --name-status origin/main -- packages/core/src/static/utils`
- focused tests:
  `pnpm --filter @platejs/core exec bun test src/static`
- package proof:
  `pnpm --filter @platejs/core typecheck`
- lint proof:
  `pnpm --filter @platejs/core lint`
- barrel proof:
  `pnpm brl`
- source audits:
  `rg -n "stripSlateDataAttributes|getSelectedDomBlocks|@platejs/slate|data-slate|slate-|SlateEditor|createSlate|editor\\.tf|editor\\.transforms|findPath|as any|: any|Record<string, any>" packages/core/src/static/utils packages/core/src/static/serializeHtml.tsx packages/core/src/static/types.ts`
- caller audit:
  `rg -n "stripSlateDataAttributes|getSelectedDomBlocks" packages/core/src packages/core/type-tests content docs --glob '!docs/plans/**' --glob '!**/dist/**'`
- extracted-file inventory:
  `git ls-files --others --exclude-standard packages/core/src/static/utils packages/core/src/static/serializeHtml.tsx | sort`
- final plan check:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-plate-next-static-utils-drift-review.md`

Constraints:
- Review mode targets the best Plate v2 shape: clean Plate product layer on top
  of Plite, no legacy compatibility goal.
- Plate owns static rendering and serialization composition; Plite owns editor
  substrate, nodes, selection primitives, and DOM attribute vocabulary.
- No public compat aliases, old Slate shims, or old docs paths.
- No local hacks: no bridge/helper dump, broad `any` cast, fake alias,
  duplicate wrapper, command fallback, or displaced product/plugin behavior.
- If clean migration is blocked, record a `Plite gap` or `Plate gap`.
- Review-mode rename freeze applies except when the old name is actively false.
- Private bridges are not used.
- Do not use this named packet to close broad Core review.

Boundaries:
- allowed edit scope: direct static utility files, their direct specs, the
  static utils barrel, and `serializeHtml.tsx` for the utility rename
- package/API surfaces: Core static utility API only
- docs/browser surfaces: none
- non-goals: no full Core sweep, no static renderer architecture rewrite, no
  broad cleanup of static renderer files outside this utility packet
- out-of-scope package errors: none observed

Output budget strategy:
- Use file lists, scoped diffs, focused reads, exact `rg`, and command summaries.
- Do not stream broad Core manifests because this is not a full Core sweep.

Blocked condition:
- None.

Current verdict:
- verdict: keep packet
- confidence: high for the named static-utils scope
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: target old names and avoidable casts were repaired, deleted files are
  explicitly classified, tests/typecheck/lint/barrels/source audits pass, and
  no Plite/Plate blocker remains.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint lists target, scope, proof, stop rule, and handoff |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | `get_goal` returned no active goal; this plan is the ledger |
| Mode classified as named packet vs broad Core sweep | yes | named folder/API packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Completion threshold and Current verdict |
| Broad Core drift ledger initialized when in scope | no | broad Core sweep not requested |
| Source of truth and allowed workspace recorded | yes | `origin/main` inventories and current checkout target |
| Output budget strategy recorded | yes | targeted reads/searches only |
| Public API fork routing checked | yes | false static utility name is hard-cut under accepted Plite naming direction |
| Gap policy checked | yes | no Plite or Plate blocker found |
| Related Core sweep policy checked | yes | source/caller audits recorded |
| Review-mode rename freeze checked | yes | one rename exception recorded because old name was actively false |

Work Checklist:
- [x] First checkpoint complete with every explicit prompt requirement copied.
- [x] Mode classified as named folder/API packet.
- [x] Best Plate v2 call recorded for every reviewed target.
- [x] Legacy/backcompat decision recorded: no public alias for
      `stripSlateDataAttributes` or `getSelectedDomBlocks`.
- [x] Hack check recorded: no target-scope bridge/helper dump, broad `any`,
      fake alias, or displaced product/plugin behavior remains.
- [x] Gap ledger updated: no Plite or Plate blocker.
- [x] Related Core sweep row added for old names, casts, and selected DOM
      helpers.
- [x] N/A: broad Core drift ledger is not in scope for this named packet.
- [x] N/A: broad Core per-file rows are not in scope.
- [x] N/A: broad Core manifest counts are not in scope.
- [x] N/A: broad Core score gate is not in scope.
- [x] Bridge scoring law applied: no bridge dependency in target.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API fork checked; no `plate-plan` route needed for this accepted
      hard cut.
- [x] Review-mode rename freeze applied with one recorded false-name exception.
- [x] Extracted-file recovery gate closed with inventory rows.
- [x] Safe packet kept with proof.
- [x] Focused package proof run after code changes.
- [x] `pnpm brl` run after barrel/export change.
- [x] Old compatibility names source-audited.
- [x] Changed list, top drift rows, needs-attention rows, and next owner filled.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named proof commands | static tests, Core typecheck, Core lint, and source audits passed |
| Broad Core drift ledger coverage | no | Record N/A reason | named static-utils packet, not broad Core sweep |
| Score gate | yes | Prove target scores are valid and high drift is fixed or owned | Review matrix has no unresolved score above 1 |
| Best Plate v2 recommendation | yes | Record current shape and rejected alternatives | Best recommendation table |
| Plite/Plate gap ledger | yes | Record blockers or N/A | no blocker row |
| Related Core sweep after correction | yes | Run and record same-class Core search/review results | Related Core sweep ledger |
| Package/API proof | yes | Run focused typecheck/test/lint/barrel proof | Verification evidence |
| Non-Core package error triage | no | Record N/A reason | no non-Core command failure |
| Source audit | yes | Run exact audit for old names/casts | old-name/cast audits returned no target matches |
| Rename ledger | yes | Record accepted rename exception | `stripSlateDataAttributes` hard-cut to `stripPliteDataAttributes` because old name was false |
| Extracted-file inventory | yes | Record untracked-file command and bucket rows | Extracted file ledger |
| Autoreview / review | yes | Perform Plate Next source review | this plan and source comparison |
| Final lint/check | yes | Run scoped lint/check | Core lint and typecheck passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | ledgers below |
| Goal plan complete | yes | Run `check-complete.mjs` | final command recorded in Verification evidence |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `createStaticString.ts` | 0 | main-parity-cleanup | static string renderer | `data-plite-string`, typed props, no spec cast | keep |
| `createStaticString.spec.ts` | 0 | main-parity-cleanup | static string tests | old "slate string" wording removed | keep |
| `getNodeDataAttributes.ts` | 0 | main-parity-cleanup | static data attribute utility | Plite types, Plite DOM `keyToDataAttribute`, no `Record<string, any>`, no `toDataAttributes` cast | keep |
| `getRenderNodeStaticProps.ts` | 1 | main-parity-cleanup | static render props utility | input/output generic now reflects context enrichment; old `tf`, `findPath`, `getSlateClass`, and `as any` removed | keep |
| `getRenderNodeStaticProps.spec.ts` | 0 | main-parity-cleanup | static render props tests | inline setup preserved, casts removed, Plite names asserted | keep |
| `getSelectedDomBlocks.ts` | 0 | hard-cut | deleted deprecated static selection utility | deprecated in `origin/main`, no current callers, replaced by `getSelectedDomFragment` | keep deleted |
| `getSelectedDomBlocks.spec.ts` | 0 | hard-cut | deleted deprecated utility tests | only tested deleted deprecated utility | keep deleted |
| `getSelectedDomFragment.tsx` | 0 | main-parity-cleanup | static selection fragment utility | Plite markers, `editor.read`, `editor.api.html.deserialize`, real editor tests | keep |
| `getSelectedDomFragment.spec.tsx` | 0 | main-parity-cleanup | static selection fragment tests | no mocked editor API overrides; uses real editor value | keep |
| `getSelectedDomNode.ts` | 0 | keep-in-plate | static DOM selection utility | unchanged behavior, current tests pass | keep |
| `getSelectedDomNode.spec.ts` | 0 | main-parity-cleanup | static DOM selection tests | typed selection/range mocks, no `any` | keep |
| `index.ts` | 0 | main-parity-cleanup | static utils barrel | exports current utilities only | keep |
| `isSelectOutside.ts` | 0 | main-parity-cleanup | static selection boundary utility | Plite editor marker | keep |
| `isSelectOutside.spec.ts` | 0 | main-parity-cleanup | static selection boundary tests | stale malformed-selector comments removed | keep |
| `pipeDecorate.ts` | 0 | main-parity-cleanup | static decoration pipeline | uses runtime plugin cache and typed `getEditorPlugin` context | keep |
| `pipeDecorate.spec.ts` | 0 | main-parity-cleanup | static decoration tests | no range/entry casts | keep |
| `stripHtmlClassNames.ts` | 0 | main-parity-cleanup | static serializer utility | Plite class prefix default | keep |
| `stripHtmlClassNames.spec.ts` | 0 | main-parity-cleanup | static serializer tests | Plite class assertions | keep |
| `stripPliteDataAttributes.ts` | 0 | hard-cut | static serializer utility | replaces false `stripSlateDataAttributes` name; no alias | keep |
| `stripPliteDataAttributes.spec.ts` | 0 | justify-new-proof-tooling | static serializer tests | proves Plite renderer attrs removed and app data attrs kept | keep |
| `serializeHtml.tsx` | 0 | main-parity-cleanup | static serializer caller | imports `stripPliteDataAttributes`; touched-file `any` removed | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| static utils | Keep utilities in Core static owner, Plite names/data attrs, no old Slate aliases | reject `stripSlateDataAttributes` alias, reject `getSelectedDomBlocks` restore, reject target-scope `any` casts | static rendering is Plate-owned, but DOM attribute vocabulary and editor reads must be Plite-native | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | no missing capability | no workaround needed | Core static utilities | static tests/typecheck/lint | no blocker |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Hard-cut false `stripSlateDataAttributes` name | `rg -n "stripSlateDataAttributes|getSelectedDomBlocks" packages/core/src packages/core/type-tests content docs --glob '!docs/plans/**' --glob '!**/dist/**'` | 0 after patch | 3 source files plus 1 new spec | 0 | low |
| Remove target-scope casts/old Slate names | `rg -n "stripSlateDataAttributes|getSelectedDomBlocks|@platejs/slate|data-slate|slate-|SlateEditor|createSlate|editor\\.tf|editor\\.transforms|findPath|as any|: any|Record<string, any>" packages/core/src/static/utils packages/core/src/static/serializeHtml.tsx packages/core/src/static/types.ts` | 0 after patch | target utils and touched serializer | 0 | low |
| Deleted main-owned selected-block utility | caller search for `getSelectedDomBlocks` | 0 current callers | 0 | 0 | low |

Core drift ledger:
- Applies: N/A, broad Core sweep not requested.
- Manifest command: N/A.
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`.
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`.
- Ledger location: this plan for named target rows only.
- Expected row count: N/A.
- Actual row count: N/A.
- Missing row count: N/A.
- Extra row count: N/A.
- Score gate: named target rows reviewed; no unresolved score above 1.
- Top drift rows: none remaining in this packet.

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| `packages/core/src/static/utils/*` | 0 | main-parity-cleanup | Core static utilities | focused static test/typecheck/lint/source audits pass | keep |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| static utils drift review | Core static utilities | old Slate names, deleted utility, casts, and direct migration drift | target files plus serializer caller | keep | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `packages/core/src/static/utils/stripPliteDataAttributes.ts` | merge-existing-owner | replaces `origin/main` `stripSlateDataAttributes.ts` owner because old name is actively false after Plite rename | keep new name, no alias | source/caller audit empty for old name |
| `packages/core/src/static/utils/stripPliteDataAttributes.spec.ts` | justify-new-proof-tooling | no old spec owner existed | keep proof | static tests pass |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | none | no non-Core package failure | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | renamed false `stripSlateDataAttributes` utility to `stripPliteDataAttributes`; updated `serializeHtml`; repaired static util typing and Plite API usage |
| tests/proof | added `stripPliteDataAttributes.spec.ts`; removed avoidable casts/stale comments in static util specs |
| docs/templates/skills | this plan ledger |
| generated/barrels | `packages/core/src/static/utils/index.ts` updated and `pnpm brl` run |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | None for `static/utils` | old names/casts/deleted files are accounted for | `packages/core/src/static/utils` | keep |

Findings:
- `getSelectedDomBlocks` was deprecated in `origin/main`, exported there, and
  unused in the current checkout. Deletion is correct under no-compat Plate
  Next rules.
- `stripSlateDataAttributes` was actively false because it stripped
  `data-plite-*`. Keeping it would be public API sludge. It is hard-cut to
  `stripPliteDataAttributes` with no alias.
- `getSelectedDomFragment` should call `editor.api.html.deserialize`, not a
  direct imported helper, so editor/plugin HTML behavior remains the owner.
- `getRenderNodeStaticProps` needed an input/output generic because it enriches
  render props with editor/plugin context; the old type forced test casts.

Decisions and tradeoffs:
- Hard-cut old utility names rather than preserve aliases -> aligns with
  Plite-first API law.
- Keep `getSelectedDomBlocks` deleted -> deprecated main utility has no current
  callers and duplicates the fragment helper.
- Keep casts outside `static/utils` for a later static-renderer packet -> this
  target is clean, but broad static renderer files are separate work.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Core typecheck failed after initial cleanup because plugin context was made optional | 1 | remove unreachable optional plugin branch | fixed |
| Core typecheck failed because `getRenderNodeStaticProps` input type was too strict | 1 | fix owning generic input/output type | fixed |
| Core lint failed on one formatting issue | 1 | apply formatter-equivalent spacing | fixed |

Verification evidence:
- `pnpm --filter @platejs/core exec bun test src/static` -> pass, 91 tests /
  165 expects.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm --filter @platejs/core lint` -> pass.
- `pnpm brl` -> pass, 57 package barrel tasks.
- old-name/cast source audit -> no matches in target/touched scope.
- old utility caller audit -> no matches outside `docs/plans`.
- target extracted-file inventory -> only intentional
  `stripPliteDataAttributes.ts` and `stripPliteDataAttributes.spec.ts`.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-03-plate-next-static-utils-drift-review.md`
  -> pass.

Final handoff contract:
- target surface and mode: named folder/API review of
  `packages/core/src/static/utils/*`
- files/APIs reviewed: all direct static utils, direct serializer caller
- broad Core drift score coverage: N/A, not requested
- best Plate v2 recommendation: keep static utilities Plite-native, hard-cut
  false Slate names, do not restore deprecated selected-block helper
- verdict matrix summary: main-parity cleanup for active utilities, hard-cut
  for deprecated/false names, proof tooling for new Plite data-attribute spec
- Plite/Plate gaps or blockers: none
- related Core sweep query/matches/patched/deferred: old-name/cast audits empty
  after patch; no deferred target items
- changes made: static utility API rename, target typing cleanup, tests, barrel
- tests/proof commands: static tests, Core typecheck, Core lint, brl, audits,
  check-complete
- old compatibility names audited: `stripSlateDataAttributes`,
  `getSelectedDomBlocks`, `@platejs/slate`, `data-slate`, `editor.tf`,
  `editor.transforms`, `findPath`, avoidable `any`
- needs attention: none
- next best Plate Next packet: static renderer files outside utils if the user
  wants the remaining static `as any` debt cleaned

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Named static-utils drift review closed |
| Where am I going? | Final handoff |
| What is the goal? | Prove `packages/core/src/static/utils/*` has no drift regression versus `origin/main` |
| What have I learned? | Deletion of `getSelectedDomBlocks` is safe; `stripSlateDataAttributes` was a false name; `getRenderNodeStaticProps` needed a real generic input type |
| What have I done? | Patched utilities/tests/caller, ran tests/typecheck/lint/brl/audits, closed plan |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Source comparison | complete | current and `origin/main` inventories/diff read | closed |
| Cleanup packet | complete | old false utility name cut, casts removed, static fragment API repaired | closed |
| Verification | complete | static tests, Core typecheck, Core lint, brl, audits passed | closed |
| Handoff | complete | plan rows filled | closed |

Open risks:
- None for `packages/core/src/static/utils/*`.
