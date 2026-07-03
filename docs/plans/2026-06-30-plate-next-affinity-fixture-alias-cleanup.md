# plate-next affinity fixture alias cleanup

Objective:
Remove the explicit `EditorFixture` test helper from
`packages/core/src/lib/plugins/affinity/AffinityPlugin.spec.tsx`, repair
`plate-next` guidance for fixture-shape aliases, and prove focused Core checks
stay green.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-06-30-plate-next-affinity-fixture-alias-cleanup.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user requested repairing `plate-next` around
  `type EditorFixture = { children: Value; selection: Selection; };` in
  `packages/core/src/lib/plugins/affinity/AffinityPlugin.spec.tsx`
- mode: named file/API packet
- target surface: Affinity plugin spec typing and Plate Next review guidance
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: N/A: user named one test file/smell, not `sweep`,
  `all core`, or `full-loop`
- correction-triggered related Core sweep: same-class fixture alias and cast
  audit across `packages/core/src` and `packages/core/type-tests`
- completion threshold summary: no local `EditorFixture` alias or cast
  workaround remains in the target; the fixture type is source-owned by
  `@platejs/test-utils`; `plate-next` forbids repeating the mistake; focused
  Core/test-utils proof passes

First checkpoint:
- [x] Explicit target copied: `AffinityPlugin.spec.tsx`
- [x] Explicit smell copied: local `EditorFixture` shape with `children` and
  `selection`
- [x] Scope copied: repair the code and `plate-next` workflow guidance
- [x] Non-goal copied: no broad Core sweep requested
- [x] Stop condition copied: stop after the named smell is removed, related
  sweep is recorded, and focused proof is green
- [x] Deliverables copied: changed files, proof commands, remaining risk, and
  anything needing review

Timed checkpoint:
- requested duration: N/A: no duration was requested
- semantics: N/A: named packet only
- initial confidence score: N/A: pass/fail packet
- improvement loop: N/A: close when focused proof and source audits pass
- final score / loop closure: 100 for this packet; broader Core fallback-editor
  typing remains outside this named file packet

Completion threshold:
- The target spec does not declare `EditorFixture`.
- The target spec does not use `as TestEditor`, `as any as`, or the old local
  `{ children: Value; selection: Selection }` helper shape.
- `@platejs/test-utils` exports the source-owned `TestEditor` fixture type
  through `jsx.ts`.
- Core test typecheck resolves `@platejs/test-utils` source instead of stale
  local package `dist`.
- `plate-next` source rule and generated skill warn against local fixture-shape
  aliases in tests.
- Focused test, Core typecheck, test-utils typecheck, and lint pass.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-30-plate-next-affinity-fixture-alias-cleanup.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands:
  `pnpm --filter @platejs/core exec bun test src/lib/plugins/affinity/AffinityPlugin.spec.tsx`
- package proof:
  `pnpm --filter @platejs/core typecheck`,
  `pnpm --filter @platejs/test-utils typecheck`
- source audits:
  exact `rg` sweeps for `EditorFixture`, `as TestEditor`, `as any as`,
  `children: Value;`, and `selection: Selection;`
- related Core sweep query / match count / patched count / deferred count:
  recorded below
- Plite/Plate gap ledger: none
- broad Core drift ledger gate: N/A: not in scope
- final plan check:
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-30-plate-next-affinity-fixture-alias-cleanup.md`

Constraints:
- Do not keep a local helper alias just to silence weak hyperscript typing.
- Do not hand-edit generated `SKILL.md`; patch `.agents/rules/plate-next.mdc`
  and run `pnpm install`.
- Do not rely on untracked package `dist` declarations.
- Do not broaden into a full Core sweep.
- Preserve the existing Affinity behavior.

Boundaries:
- allowed edit scope:
  `packages/core/src/lib/plugins/affinity/AffinityPlugin.spec.tsx`,
  `packages/core/tsconfig.json`, `packages/test-utils/src/jsx.ts`,
  `.agents/rules/plate-next.mdc`, generated skill sync output, and this plan
- package/API surfaces: Core test typing and test-utils public test fixture type
- docs/browser surfaces: N/A: no rendered app/docs route changed
- non-goals: no runtime Affinity rewrite, no full Core drift ledger, no rename
  pass
- out-of-scope package errors: none observed

Output budget strategy:
- Use exact `sed` and `rg` reads only.
- Cap proof/audit command output.
- Treat broad Core manifest work as out of scope for this named packet.

Blocked condition:
- Block only if Core test typing cannot resolve a source-owned fixture type
  without a local alias or build-artifact dependency. This did not happen.

Current verdict:
- verdict: main-parity-cleanup plus source-owner typing repair
- confidence: 100 for the named packet
- next owner: none for this packet
- keep / revert / quarantine call: keep
- reason: removes the bad local alias, strengthens the source owner, and proves
  target behavior/typecheck green

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | First checkpoint rows above |
| `plate-next` skill/rule read | yes | Read `.agents/skills/plate-next/SKILL.md` and patched `.agents/rules/plate-next.mdc` |
| Active goal checked or created | yes | Active goal objective matched this packet |
| Mode classified as named packet vs broad Core sweep | yes | Named packet; broad Core sweep N/A |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Plate Next source rows above |
| Broad Core drift ledger initialized when in scope | no | N/A: no broad Core sweep requested |
| Source of truth and allowed workspace recorded | yes | Boundaries section |
| Output budget strategy recorded | yes | Output budget strategy section |
| Public API fork routing checked | yes | N/A: no public API fork |
| Gap policy checked | yes | Gap ledger says none |
| Related Core sweep policy checked | yes | Related Core sweep ledger below |
| Review-mode rename freeze checked | yes | No renames performed |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, stop condition, deliverable, verification surface, and success
      criterion is copied into this plan.
- [x] Mode classified: named file/API packet.
- [x] Best Plate v2 call recorded for every reviewed target.
- [x] Legacy/backcompat decision recorded: no compat alias or local fixture
      shim kept.
- [x] Hack check recorded: no bridge/helper dump, fake alias, broad `any` cast,
      or displaced product/plugin behavior kept.
- [x] Gap ledger updated: no Plite/Plate gap blocks this packet.
- [x] After every correction, related Core sweep row added with query, match
      count, patched count, deferred count, and remaining risk.
- [x] Broad Core drift ledger N/A: named packet, not a sweep.
- [x] Bridge scoring law N/A: no bridge file touched or kept.
- [x] Review matrix filled for inspected file/API/helper.
- [x] Public API forks N/A: no public API fork.
- [x] Review-mode rename freeze applied: no renames.
- [x] Extracted-file recovery gate closed for target scope.
- [x] Safe cleanup packet kept with proof.
- [x] Focused package proof run after code changes.
- [x] `pnpm brl` N/A: no barrel file changed; existing barrel already exports
      `jsx.ts`.
- [x] Old compatibility names audited for this smell.
- [x] Changed list, top drift rows, needs-attention rows, and next owner filled.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run focused proof | Core Affinity spec test passed, Core typecheck passed, test-utils typecheck passed |
| Broad Core drift ledger coverage | no | N/A | Named packet only |
| Score gate | yes | Prove reviewed target has no remaining local alias/cast workaround | Source audit found no `EditorFixture`, `as TestEditor`, or `as any as` in target scope |
| Best Plate v2 recommendation | yes | Record current shape and rejected hacks | Best recommendation table below |
| Plite/Plate gap ledger | yes | Record blockers or N/A | No gap |
| Related Core sweep after correction | yes | Run same-class Core search/review | Related Core sweep ledger below |
| Package/API proof | yes | Run focused typecheck/test | Verification evidence below |
| Non-Core package error triage | no | N/A | No non-Core failures observed |
| Source audit | yes | Run exact audit for removed local fixture alias | Verification evidence below |
| Rename ledger | no | N/A | No renames performed |
| Extracted-file inventory | yes | Record target-scope untracked inventory | Only this plan file is untracked |
| Autoreview / review | no | N/A | Micro named packet with direct proof; no broad review gate needed |
| Final lint/check | yes | Run scoped lint/type/test | Core lint passed; test-utils lint passed after source fix |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Sections below |
| Goal plan complete | yes | Run check-complete | Final command recorded after this edit |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `packages/core/src/lib/plugins/affinity/AffinityPlugin.spec.tsx` | 0 | main-parity-cleanup | Core Affinity tests | Local `EditorFixture` removed; uses `TestEditor` from `@platejs/test-utils` | keep |
| `packages/test-utils/src/jsx.ts` / `TestEditor` export | 0 | keep-in-plate | test-utils fixture owner | `TestEditor` exported from source-owned `jsx.ts`; package typecheck passes | keep |
| `packages/core/tsconfig.json` source path | 0 | keep-in-plate | Core source-first test graph | Core typecheck resolves `@platejs/test-utils` source instead of stale `dist` | keep |
| `.agents/rules/plate-next.mdc` | 0 | keep-in-plate | Plate Next workflow source | Rule now forbids local fixture-shape aliases hiding weak typing | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Affinity spec fixture output | Use `TestEditor` from `@platejs/test-utils` | Local `EditorFixture`, `as TestEditor`, `as any as`, or hand-typed `{ children; selection }` helper | The fixture shape belongs to the hyperscript test utility, not each Core spec | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| none | none | none | none | focused proof passed | no gap |

Related Core sweep ledger:
| Trigger correction | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|----------------------|---------|---------|----------|----------------|
| Remove local `EditorFixture` helper | `rg -n "EditorFixture\|as TestEditor\|as any as\|children: Value;\|selection: Selection;" packages/core/src packages/core/type-tests --glob '!**/dist/**'` | 3 non-rule matches after patch | 1 target patched | 2 reviewed as different class: `createPlateFallbackEditor` runtime fallback shape and `getMarkBoundaryAffinity.spec.ts` explicit selection fixture | `createPlateFallbackEditor` may deserve a later Plate Next review, but it is not this test fixture alias |
| Source-first `@platejs/test-utils` typing | `rg -n "@platejs/test-utils" packages/core/tsconfig*.json packages/*/tsconfig*.json --glob '!**/dist/**'` | 1 unique config owner | 1 patched | 0 | none |

Core drift ledger:
- Applies: no
- Manifest command: N/A: broad Core sweep not requested
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: N/A
- Expected row count: N/A
- Actual row count: N/A
- Missing row count: N/A
- Extra row count: N/A
- Score gate: N/A
- Top drift rows: N/A for this packet

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | N/A | N/A | N/A | Named packet only | N/A |

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Affinity fixture alias | Core/test-utils | Local test fixture alias hides weak hyperscript typing | Affinity spec, test-utils `jsx.ts`, Core tsconfig, Plate Next rule | keep | none |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `docs/plans/2026-06-30-plate-next-affinity-fixture-alias-cleanup.md` | justify-new-proof-tooling | N/A: runtime goal artifact | keep | required autogoal plan |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| none | none | none | none |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Named fixture-alias cleanup | complete | Source owner fixed, related sweep recorded, focused proof passed | goal closeout |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | `packages/core/src/lib/plugins/affinity/AffinityPlugin.spec.tsx`; `packages/core/tsconfig.json`; `packages/test-utils/src/jsx.ts` |
| tests/proof | Affinity spec uses source-owned `TestEditor` instead of local `EditorFixture` |
| docs/templates/skills | `.agents/rules/plate-next.mdc`; generated `.agents/skills/plate-next/SKILL.md`; this plan |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | `createPlateFallbackEditor` local fallback shape | Same audit pattern found a runtime fallback type with `children`/`selection`; it is not the requested test fixture alias but may be future Plate Next cleanup | `packages/core/src/react/utils/createPlateFallbackEditor.ts` | review later only if you want runtime fallback typing cleanup |

Findings:
- The local `EditorFixture` alias was not the right fix; it belonged in the
  test utility fixture surface.
- Core typecheck used stale local package declarations because Core did not map
  `@platejs/test-utils` to source.
- The same-class sweep found no remaining `EditorFixture` or cast workaround in
  Affinity.

Decisions and tradeoffs:
- Export `TestEditor` from `packages/test-utils/src/jsx.ts` rather than editing
  the generated package barrel.
- Add a Core source path for `@platejs/test-utils` so Core test typecheck does
  not depend on untracked `dist`.
- Patch `plate-next` source guidance so future review runs fix the owning test
  utility instead of adding local fixture aliases.

Review fixes:
- Lint rejected re-exporting an imported `createHyperscript` binding; changed
  it to a direct re-export from `./internals/hyperscript`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Core typecheck saw stale `@platejs/test-utils` declarations | 1 | Add Core source path for test-utils | Resolved; Core typecheck passes |
| test-utils lint rejected exported import | 1 | Use direct export-from syntax | Resolved; test-utils lint passes |

Verification evidence:
- `pnpm install` -> pass; regenerated `plate-next` skill after source rule edit
- `pnpm --filter @platejs/core exec bun test src/lib/plugins/affinity/AffinityPlugin.spec.tsx` -> pass, 27 tests
- `pnpm --filter @platejs/core typecheck` -> pass
- `pnpm --filter @platejs/test-utils typecheck` -> pass
- `pnpm --filter @platejs/core lint:fix` -> pass, no fixes
- `pnpm --filter @platejs/test-utils lint:fix` -> pass after direct re-export fix
- `rg -n "EditorFixture|as TestEditor|as any as|children: Value;|selection: Selection;" packages/core/src/lib/plugins/affinity packages/test-utils/src .agents/rules/plate-next.mdc .agents/skills/plate-next/SKILL.md --glob '!**/dist/**'` -> no target smell remains; remaining matches are the new rule, source-owned `TestEditor`, and unrelated explicit selection fixture
- `git ls-files --others --exclude-standard packages/core/src/lib/plugins/affinity packages/test-utils/src packages/core/tsconfig.json .agents/rules/plate-next.mdc docs/plans/2026-06-30-plate-next-affinity-fixture-alias-cleanup.md | sort` -> only this plan file

Final handoff contract:
- target surface and mode: Affinity spec fixture alias, named packet
- files/APIs reviewed: Affinity spec, test-utils JSX fixture export, Core
  source path, Plate Next rule
- broad Core drift score coverage: N/A
- best Plate v2 recommendation: source-owned test fixture type, no local alias
- verdict matrix summary: main-parity-cleanup and keep-in-plate only
- Plite/Plate gaps or blockers: none
- related Core sweep query/matches/patched/deferred: recorded above
- changes made: recorded above
- tests/proof commands: recorded above
- old compatibility names audited: exact source audit recorded above
- needs attention: optional future `createPlateFallbackEditor` review
- next best Plate Next packet: none required for this task

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Closure |
| Where am I going? | Run final mechanical plan check and complete goal |
| What is the goal? | Remove the bad Affinity fixture alias and prevent the workflow from repeating it |
| What have I learned? | The owner is test-utils, and Core needed a source path for it |
| What have I done? | Patched target, test-utils, Core tsconfig, Plate Next rule, and proof plan |

Timeline:
- 2026-06-30T17:32:44.093Z Goal plan created.
- 2026-06-30T17:39Z Removed `EditorFixture` from the Affinity spec.
- 2026-06-30T17:41Z Added source-owned `TestEditor` export and Core source path.
- 2026-06-30T17:44Z Patched `plate-next` source rule and regenerated skill.
- 2026-06-30T17:48Z Focused Core/test-utils proof passed.

Open risks:
- None for the named packet.
