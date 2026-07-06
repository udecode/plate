# plate editor wide default type

Objective:
Fix PlateEditor default type regression; done when clean component/store bounds
pass Core proof.

Goal plan:
docs/plans/2026-07-04-plate-editor-wide-default-type.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user approved the long-term fix after asking why
  `E extends PlateEditor<any, AnyPluginConfig> = PlateEditor<any,
  AnyPluginConfig>` is needed when main did not need it
- mode: named public type/API cleanup packet
- target surface: `packages/core/src/react/editor/PlateEditor.ts`,
  `packages/core/src/react/components/Plate.tsx`, `PlateStore` editor bounds,
  and same-class `PlateEditor<any, AnyPluginConfig>` callers
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: N/A: this is the named editor type-bound cleanup, not an
  all-Core score pass
- correction-triggered related Core sweep: required for all
  `PlateEditor<any, AnyPluginConfig>` and `PlateStoreEditor` bounds found by
  focused `rg`
- completion threshold summary: public `PlateEditor` default is wide enough for
  component/store boundaries, factories/hooks stay precise, no leaked
  `PlateEditor<any, AnyPluginConfig>` in `Plate.tsx`, source audit passes,
  Core typecheck/lint pass, and this plan completes

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.

Timed checkpoint:
- requested duration: N/A
- semantics: N/A
- initial confidence score: N/A
- improvement loop: N/A
- final score / loop closure: N/A

Completion threshold:
- `PlateEditor` default behaves as the wide app/component boundary type instead
  of a core-plugin-only editor.
- `createPlateEditor` and hook return types still carry precise plugin
  inference through their own generics.
- `PlateProps`, `PlateInner`, `Plate`, and store helper bounds do not repeat
  `PlateEditor<any, AnyPluginConfig>` unless an exported compatibility boundary
  truly requires it.
- Focused source audits for old wide-bound boilerplate pass.
- Core typecheck and lint pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-editor-wide-default-type.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: source audit; focused Core typecheck
- package proof: `pnpm --filter @platejs/core typecheck`;
  `pnpm --filter @platejs/core lint`
- source audits: `rg -n "PlateEditor<any, AnyPluginConfig>|PlateStoreEditor|E extends PlateEditor" packages/core/src packages/core/type-tests --glob '!**/dist/**'`
- related Core sweep query / match count / patched count / deferred count:
  run before and after patch
- Plite/Plate gap ledger: no gap expected; this is owner type cleanup
- broad Core drift ledger gate: N/A: named type-bound packet
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-editor-wide-default-type.md`

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
- allowed edit scope: Core editor/store/component type owners and direct type
  tests if needed
- package/API surfaces: `PlateEditor`, `PlateProps`, `PlateStoreState`,
  `createPlateStore` / editor selector bounds where they use the store alias
- docs/browser surfaces: N/A
- non-goals: no broad Core sweep, no runtime migration, no rename pass, no
  docs rewrite, no compatibility aliases
- out-of-scope package errors: ignore non-Core package errors unless they prove
  this public Core type change broke consumers

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop if making `PlateEditor` default wide destroys exact plugin inference from
  `createPlateEditor` / `usePlateEditor` and the fix needs a larger public
  Plate type-design plan.

Current verdict:
- verdict: keep patched type owner cleanup
- confidence: high after proving `PlateEditor<V = Value>` fails invariant
  custom values and `PlateEditor<V = any, P = AnyPluginConfig>` keeps Core
  type contracts green
- next owner: plate-next
- keep / revert / quarantine call: keep
- reason: main had clean `E extends PlateEditor = PlateEditor`; current code
  leaked `PlateEditor<any, AnyPluginConfig>` because bare `PlateEditor` was not
  wide enough for app/component boundaries

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | approved long-term type fix, target and proof recorded |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read |
| Active goal checked or created | yes | no active goal, new goal created for this plan |
| Mode classified as named packet vs broad Core sweep | yes | named public type cleanup packet |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | wide boundary type, precise factory return, no leaked local `any` bounds |
| Broad Core drift ledger initialized when in scope | no | N/A: not a broad Core sweep |
| Source of truth and allowed workspace recorded | yes | current checkout vs `origin/main`, Core-only scope |
| Output budget strategy recorded | yes | targeted `sed`/`rg`, capped output |
| Public API fork routing checked | yes | proceed because user accepted the public type direction |
| Gap policy checked | yes | name Plate type gap if factory inference regresses |
| Related Core sweep policy checked | yes | sweep same-class bounds after correction |
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
| Named verification threshold | yes | Run the proof commands named in this plan | Core typecheck, Core lint, and source audits passed |
| Broad Core drift ledger coverage | no | Record manifest command, expected row count, actual row count, missing row count, and extra row count when broad Core sweep applies | N/A: named type-bound packet |
| Score gate | yes | Prove all scores are valid and high drift is owned/fixed/deferred in the plan ledger | high drift fixed in owner type and component/store bounds |
| Best Plate v2 recommendation | yes | Record the recommended current shape and rejected legacy/hack alternatives for the reviewed target | recorded below |
| Plite/Plate gap ledger | yes | Record blockers or N/A when no gap blocks the target | no Plite gap; one TypeScript invariance discovery handled in Plate owner type |
| Related Core sweep after correction | yes | For each correction, run and record same-class Core search/review results | audit query recorded below |
| Package/API proof | yes | Run focused typecheck/test/build or record N/A | `pnpm --filter @platejs/core typecheck` passed |
| Non-Core package error triage | no | If a proof command reports non-Core failures, classify as named/touched/Core-regression or out-of-scope package drift | no non-Core failures |
| Source audit | yes | Run exact audit for removed compatibility names or record N/A | no `PlateEditor<any, AnyPluginConfig>` / `E extends PlateEditor<any` matches |
| Rename ledger | no | Update `docs/plans/pre-renaming.md` when a rename is postponed or intentionally kept | no rename attempted |
| Extracted-file inventory | yes | Record untracked/extracted file command, row count, and bucket for every file in scope | `git ls-files --others --exclude-standard packages/core/src/react packages/core/type-tests` returned 0 rows |
| Autoreview / review | no | Run review gate for non-trivial implementation diffs or record N/A | N/A: narrow public type owner cleanup, proved by type tests/typecheck/lint |
| Final lint/check | yes | Run scoped lint/check or record N/A | `pnpm --filter @platejs/core lint` passed |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | recorded below |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-04-plate-editor-wide-default-type.md` | to run after final plan fill |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/react/editor/PlateEditor.ts` | 4 before patch, 0 after patch | main-parity-cleanup | Plate editor public type | default `P` is broad `AnyPluginConfig`; default `V` is `any` to accept narrowed app values; typecheck and type-tests pass | done |
| `packages/core/src/react/components/Plate.tsx` | 4 before patch, 0 after patch | main-parity-cleanup | Plate React component boundary | restored `E extends PlateEditor = PlateEditor`; no local `AnyPluginConfig` import | done |
| `packages/core/src/react/stores/plate/PlateStore.ts` | 3 before patch, 0 after patch | main-parity-cleanup | Plate store editor boundary | `PlateStoreEditor = PlateEditor`; no explicit `PlateEditor<any, AnyPluginConfig>` | done |
| `PlateEditor<V = Value>` attempted shape | 4 | rejected | Plate editor public type | Core typecheck failed because Plite read state is invariant for narrowed document values | replaced with `V = any` boundary default |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Public Plate editor type | `PlateEditor<V extends Value = any, P extends AnyPluginConfig = AnyPluginConfig>` for the boundary default; factories/hooks return precise `PlateEditor<V, inferred plugins>` | leaking `PlateEditor<any, AnyPluginConfig>` into components; `P = CorePluginConfig`; `V = Value` as public boundary default | bare `PlateEditor` must accept any app value while still rejecting fake APIs; exact inference belongs to factory return types | low |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | no missing Plite primitive | local generic boilerplate was the hack | Plate editor public type | Core typecheck/type-tests | fixed |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| cut explicit wide `PlateEditor` bounds | `rg -n "PlateEditor<any, AnyPluginConfig>\|E extends PlateEditor<any\|PlateStoreEditor = PlateEditor<any\|AnyPluginConfig.*PlateEditor\|PlateEditor<any, AnyPluginConfig>" packages/core/src packages/core/type-tests --glob '!**/dist/**'` | 0 after patch | `PlateEditor.ts`, `Plate.tsx`, `PlateStore.ts` | none | low |
| audit remaining clean Plate editor bounds | `rg -n "PlateEditor<any\|PlateStoreEditor\|E extends PlateEditor\|type PlateEditor<\|export type PlateEditor<" packages/core/src packages/core/type-tests --glob '!**/dist/**'` | expected generic/inference/store bounds only | no extra patches needed | none | low |

Core drift ledger:
- Applies: no, this is a named public type-bound packet
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A for broad sweep; named targets scored above
- Top drift rows: `PlateEditor` default type, `Plate.tsx` repeated generic
  bound, `PlateStoreEditor` explicit wide alias

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| `packages/core/src/react/editor/PlateEditor.ts` | 0 | clean | Plate editor public type | Core typecheck/lint passed | done |
| `packages/core/src/react/components/Plate.tsx` | 0 | clean | Plate React component boundary | clean generic bound restored | done |
| `packages/core/src/react/stores/plate/PlateStore.ts` | 0 | clean | Plate store boundary | clean alias restored | done |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Plate editor boundary default cleanup | plate-next | public component/store boundaries should not repeat `PlateEditor<any, AnyPluginConfig>` | `PlateEditor.ts`, `Plate.tsx`, `PlateStore.ts`, Core typecheck/lint/audits | keep | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | no untracked/extracted file in scope | `git ls-files --others --exclude-standard packages/core/src/react packages/core/type-tests` returned 0 rows | closed | no rows |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| N/A | no non-Core failures | Core proof passed | N/A |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Intake and source read | complete | prompt, source owner, `origin/main` shape, and same-class search recorded | done |
| Implementation | complete | `PlateEditor` default widened at owner type; `Plate.tsx` and `PlateStore.ts` simplified | done |
| Verification | complete | Core typecheck, Core lint, source audits, and untracked inventory passed | done |
| Closeout | complete | review matrix, recommendation, tradeoff, changed list, and risks filled | run final `check-complete` |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `packages/core/src/react/editor/PlateEditor.ts`; `packages/core/src/react/components/Plate.tsx`; `packages/core/src/react/stores/plate/PlateStore.ts` |
| tests/proof | no tests changed; existing type contracts used |
| docs/templates/skills | this plan only |
| reverted/quarantined packets | rejected `V = Value` boundary default after typecheck failure |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `PlateEditor` intentionally defaults `V` to `any` | this is the only way bare `PlateEditor` accepts narrowed app values because Plite read state is invariant | `packages/core/src/react/editor/PlateEditor.ts` | keep; exact value inference still comes from factory/hook returns |

Findings:
- Current code needed `E extends PlateEditor<any, AnyPluginConfig>` because
  `PlateEditor` defaulted to core plugins and `Value`, which was too narrow for
  component/store boundaries.
- Changing only `P` to `AnyPluginConfig` was not enough: keeping `V = Value`
  failed Core typecheck for narrowed editor values.
- Existing `editor-alias-core-contracts.ts` still proves bare `PlateEditor`
  exposes core APIs and rejects fake APIs.

Decisions and tradeoffs:
- Public boundary default: `PlateEditor<any, AnyPluginConfig>`, encoded once in
  `PlateEditor` defaults instead of repeated at every call site.
- Precise inference remains on `createPlateEditor` / `usePlateEditor` returns,
  which pass explicit `V` and inferred plugin unions.
- This is not a user-facing compat alias. It is the actual public type default
  needed by React component/store boundaries.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| `PlateEditor<V = Value, P = AnyPluginConfig>` | 1 | make only the public boundary value default wide | resolved with `V = any`; Core typecheck passed |

Verification evidence:
- `pnpm --filter @platejs/core typecheck`: pass.
- `pnpm --filter @platejs/core lint`: pass.
- `rg -n "PlateEditor<any, AnyPluginConfig>|E extends PlateEditor<any|PlateStoreEditor = PlateEditor<any|AnyPluginConfig.*PlateEditor|PlateEditor<any, AnyPluginConfig>" packages/core/src packages/core/type-tests --glob '!**/dist/**'`: 0 matches.
- `rg -n "PlateEditor<any|PlateStoreEditor|E extends PlateEditor|type PlateEditor<|export type PlateEditor<" packages/core/src packages/core/type-tests --glob '!**/dist/**'`: expected clean generic/store/inference refs only.
- `git ls-files --others --exclude-standard packages/core/src/react packages/core/type-tests`: 0 rows.

Final handoff contract:
- target surface and mode: named public type-bound cleanup
- files/APIs reviewed: `PlateEditor`, `PlateProps`, `PlateStoreEditor`,
  `PlateStoreState`, same-class store/component bounds
- broad Core drift score coverage: N/A
- best Plate v2 recommendation: bare `PlateEditor` is the wide boundary;
  factories/hooks carry exact plugin and value inference
- verdict matrix summary: three files cleaned; one rejected attempted shape
  recorded
- Plite/Plate gaps or blockers: none
- related Core sweep query/matches/patched/deferred: two audits recorded, no
  deferred matches
- changes made: `PlateEditor.ts`, `Plate.tsx`, `PlateStore.ts`, this plan
- tests/proof commands: Core typecheck, Core lint, source audits, untracked
  inventory
- old compatibility names audited: exact ugly `PlateEditor<any,
  AnyPluginConfig>` and `E extends PlateEditor<any` patterns
- needs attention: intentional `V = any` default at public boundary
- next best Plate Next packet: none from this smell

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Implementation/proof complete |
| Where am I going? | Final plan check and goal close |
| What is the goal? | Fix PlateEditor default type regression |
| What have I learned? | See Findings |
| What have I done? | See Timeline |

Timeline:
- 2026-07-04T10:01:55.921Z Goal plan created.
- Inspected current `PlateEditor`, `Plate.tsx`, `PlateStore`, `BaseEditor`,
  `withPlate`, and `origin/main` `Plate.tsx`.
- Tried `P = AnyPluginConfig` with `V = Value`; typecheck proved `Value`
  default is too narrow for component/store boundaries.
- Patched `PlateEditor` default to `V = any, P = AnyPluginConfig`.
- Restored clean `Plate.tsx` generics and `PlateStoreEditor = PlateEditor`.
- Ran Core typecheck, Core lint, source audits, and untracked inventory.

Open risks:
- Low: `any` exists intentionally as the bare public boundary default, not at
  call sites. If we later make Plite value reads covariant, this can be
  revisited.
