# Hard cut plugin name lookup

Objective:
Hard-cut Plate plugin name lookup; done when getType and public name-object lookup are gone, all callers/docs migrate, checks pass; plan docs/plans/2026-07-31-hard-cut-plugin-name-lookup.md.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-31-hard-cut-plugin-name-lookup.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- none

Mode:
- `standard` accepted-plan execution.

Completion threshold:
- Zero public `editor.getType` declarations, implementations, callers, tests,
  or docs remain.
- Zero public `editor.plugin({ name })` or `useEditorPlugin({ name })` lookup
  paths remain; descriptor and string overloads are the only accepted inputs.
- Descriptor inference, dynamic-string `.installed`/`.type`, package typecheck,
  focused tests, docs/app adoption, browser proof, lint, autoreview, and the
  mechanical goal checker all pass.

Verification surface:
- Source audits over `packages/**`, `apps/www/src/**`, `content/docs/**`,
  `.agents/rules/**`, and release artifacts.
- Core type tests and focused runtime tests for descriptor and string portals.
- Source-first typechecks for every modified package plus `apps/www`.
- Focused registry browser route with console/DOM proof.
- `pnpm lint:fix`, applicable changeset checks, `autoreview`, and
  `check-complete.mjs`.

Constraints:
- The user explicitly accepted the descriptor-or-string portal target and
  authorized this hard cut.
- No public compatibility aliases or runtime shims.
- Keep codec callback `registry.getType` because it is a separate immutable
  format registry, not an editor plugin lookup.
- Preserve typed descriptor inference and exact descriptor-family checks.
- Preserve unrelated shared checkout work and never edit `templates/**`.

Boundaries:
- In scope: Core portal types/runtime/tests, package/app/docs callers, release
  prose, and durable API doctrine.
- Source owners: `@platejs/core`, consuming Plate packages, `apps/www`, docs,
  `.agents/rules/best-api.mdc`, and `docs/vision/plate.md`.
- Non-goals: changing descriptor constructors, dependency/conflict reference
  objects, typed store hooks, or codec registry lookup.
- Direct Plite boundary owners: audit only. `editor.extension(Extension)` stays
  descriptor-only because dynamic names cannot carry extension capabilities.

Output budget strategy:
- Read named owners first; use counts/file manifests before line output; exclude
  generated/build/template trees; cap broad searches and inspect only relevant
  slices.

Blocked condition:
- Block only if three distinct in-scope attempts hit the same external tooling
  or shared-source conflict and no narrower source/test/browser proof remains.

Plate Plan state:
- status: complete
- phase: prove-and-hand-off
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Exact hard-cut target, exclusions, proof, and handoff requirements recorded above |
| Active goal and plan verified | yes | Goal `019f9471-98c6-7e01-ad02-cc4de59f34e1`; this plan |
| Current owners read | yes | `BaseEditor.ts`, `PlateEditor.ts`, portal runtime, hook, docs, doctrine, and bounded caller manifests |
| Best API target resolved | yes | Accepted: `editor.plugin(Plugin \| name)` and `useEditorPlugin(Plugin \| name)`; remove `getType` and `{ name }` lookup |
| Mode and execution boundary resolved | yes | One-shot accepted-plan execution; no aliases or Plite redesign |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one accepted `best-api` verdict.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks have complete adoption/deletion answers; no private bridge survives.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Implement Core descriptor-or-string portal and remove `getType`.
- [x] Migrate every package/app/test/docs caller and delete name-object lookup examples.
- [x] Repair durable doctrine from source-of-truth rules and regenerate skills.
- [x] Add release evidence relative to `main` and complete source audits.
- [x] Run focused tests, source-first typechecks, browser proof, lint, and autoreview.
- [x] Resolve final handoff, reboot status, and goal checker with fresh evidence.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | complete | Resolve every readiness condition | Accepted API, adoption, doctrine, and proof complete |
| Fresh source evidence | complete | Recheck decision-changing current claims | Final zero-match scans over live source; generated/historical trees excluded explicitly |
| Best API review | complete | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | One descriptor-or-string portal; weak objects and parallel type resolver rejected |
| Conditional risk and adoption | complete | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Current docs, changeset, browser route, rules, and Vision updated; external provenance N/A |
| Verification recorded | complete | Record fresh planning proof and exact execution gates | Typecheck, test, browser, lint, barrel, version, changeset, and review evidence below |
| Handoff prepared | complete | Prepare concise ownership, breaks, proof, risks, and execution order | Final handoff section complete |
| Autoreview | complete | Run for implementation changes or record planning-only N/A | Final pass: clean, no accepted/actionable findings |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-31-hard-cut-plugin-name-lookup.md` | Passed: `[autogoal] complete` |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Live public types/runtime/docs/caller manifests reviewed | Execute |
| Decide | complete | User accepted descriptor-or-string portal and full hard cut | Execute |
| Execute | complete | Core, package, app, docs, release, and doctrine adoption complete | Prove and hand off |
| Prove and hand off | complete | Focused/broad proof, browser QA, and clean autoreview recorded | Final user handoff |

Decision brief:
- outcome: one imperative Plate plugin lookup with no type-only alternative.
- chosen shape: `editor.plugin(Plugin \| name)` and `useEditorPlugin(Plugin \| name)`.
- strongest rejected alternative: retain `getType(name)` or public `{ name }` references for dynamic lookup.
- consequence: missing-plugin policy becomes explicit through `.installed`; required `.type` access fails loudly.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Runtime type lookup | `editor.plugin(name).type` silently falls back to `name` | `editor.plugin(name).type` with explicit `.installed` for optional lookup | Core | One lookup noun and truthful absence | Migrate all source/tests/docs | Compile/runtime/source audit | Hidden fallback consumers | cut |
| Portal input | Descriptor or `{ name }` object | Descriptor or `string` | Core | Remove object ceremony while preserving descriptor inference | Base/Plate types, runtime, React hook, callers | Type and runtime tests | Overload widening | rearchitect |
| Codec registry | `registry.getType(name)` | Keep | Core codec context | Separate immutable format registry job | None | Existing codec tests | Accidental over-cut | keep |
| Durable doctrine | Dynamic-name `getType` exception | String portal is sole dynamic lookup | Vision/best-api | Prevent recurrence | Source rule, Vision, regenerated skill | Source audit and sync | Stale worker wording | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1 | Core | Public types, portal normalization, runtime, tests | Accepted target | No `getType`; descriptor/string overloads compile and run | Focused Core type/runtime tests |
| 2 | Packages/apps | Migrate fixed and dynamic callers | Slice 1 | Zero old calls/wrappers outside historical release baseline decisions | Source audit plus package/www typechecks |
| 3 | Docs/release/doctrine | Current docs, changeset, best-api/Vision sources, generated skills | Slice 2 | One documented current API and valid release note | Docs/source audit, `pnpm install`, changeset checks |
| 4 | Closure | Browser, lint, autoreview, goal checker | Slices 1-3 | All gates green or exact external blocker recorded | Browser route, lint, review, checker |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Descriptor portal retains exact inference | Existing generic signatures and type tests | Core contracts and source-first typecheck pass | complete |
| String portal provides erased `.installed`, `.type`, and compiled plugin | Prior portal accepted weak name objects | Runtime portal tests pass; weak `{ name }` rejected at runtime | complete |
| Missing plugins no longer silently become node types | Prior `getType` used `?? name` | `.installed` is false; `api`, `plugin`, `read`, `store`, `type`, and `update` throw | complete |
| Every caller adopts the surviving API | 245 non-test call expressions previously inventoried | Zero-match audits; 92/92 broad and 58/58 final affected typecheck tasks | complete |
| User-facing app remains functional | Generic registry/editor route consumes portals | `/blocks/basic-blocks-demo` loaded, accepted input, zero browser errors | complete |

Conditional evidence:
- High-risk scenarios: descriptor inference widens; optional names throw before
  `.installed`; compilation-time plugin access regresses. Each gets focused type/runtime proof.
- External research: N/A; accepted local API decision and live owner evidence suffice.
- Issue/PR provenance: N/A; user-directed local hard cut, not issue-backed.
- Docs/registry/browser/release/behavior-law owners: current docs, registry
  browser route, Core changeset relative to `main`, and best-api/Vision repair apply.

Findings:
- `getType` is a public `BaseEditor` method implemented as compiled lookup with
  silent identity fallback.
- Public `{ name }` consumer lookup exists only in the editor portal family and
  `useEditorPlugin`; constructors and dependency references are distinct jobs.
- Store hooks intentionally require typed descriptors; Plite extension portals
  intentionally require exact extension capabilities.

Decisions and tradeoffs:
- Prefer one portal overload family over a dedicated type resolver.
- Preserve private compiler lookup where portal construction is unsuitable.
- Do not broaden descriptor-only store/schema/Plite APIs merely for symmetry.

Review fixes:
- Autoreview P2: absent portals exposed truthy `read`/`update`; all capability
  fields now validate installation on access, including `store`.
- Autoreview P1: weak `{ name }` values still resolved through runtime `any`;
  non-string inputs now require a nominal descriptor and have regression proof.
- Autoreview P1: classic editor transforms threw for intentional raw/type-name
  fallback; installed checks now preserve that behavior and focused tests cover it.
- Rejected autoreview P2: `apps/www/public/r/**` is CI-owned generated registry
  output. Repo rules forbid local regeneration or manual edits; source docs are clean.
- Final autoreview: clean, no accepted/actionable findings.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Same-name paragraph descriptor broke family-agnostic default paragraph slots | 1 | Use the string portal for the installed same-name family | Fixed; Core render/static/HTML tests pass |
| Indent assertion hit TS2775 | 1 | Bind the assertion to an explicit public function type | Fixed; affected typecheck passes |
| First broad fast suite exposed 55 migration regressions | 1 | Repair each explicit absence/family policy at its caller | Fixed; final package batch reached 3014/3014 |
| Classic raw-type regression test initially used an unknown schema type | 2 | Register a differently named schema owner for the same node type | Fixed; 26/26 focused tests pass |
| Browser proof initially held a stale tab binding | 1 | Resolve the current in-app browser tab and scope the locator | Fixed; DOM/input/console proof passes |

Verification evidence:
- Source audit (pre-change): 245 non-test `editor.getType` calls on 241 lines
  across 59 package/app/docs files; 213 fixed descriptor/KEY inputs and 32
  dynamic expressions.
- Final live-source audits: zero `editor.getType`, weak `{ name }` portal, or
  generic string-portal calls outside rule text; codec `registry.getType` stays.
- Broad source-first typecheck: 92/92 tasks. Final Core/www affected rerun:
  58/58 tasks; Core-only contracts: 10/10 tasks.
- Focused final runtime proof: 26/26 Core portal and registry transform tests;
  earlier Core render/static/HTML proof 74/74, selection proof 74/74, DnD 23/23.
- Final broad fast package batch: 3014/3014. The root wrapper still reports three
  unrelated collaboration-demo import failures because `useEditorScrollElement`
  is not exported from `packages/plate/src/react/index.tsx`.
- Browser: `/blocks/basic-blocks-demo` returned 200, rendered one editable,
  accepted `Portal API verified`, and produced zero error-level console logs.
- Formatting/barrels/release: targeted Biome clean; `pnpm brl` 55/55;
  Plate Next v40 registry valid (42 active, 1 retired); changeset status valid.
- Skills regenerated from rule owners with `pnpm install`; no generated registry
  or template output was edited locally.
- Final autoreview: clean, patch correct, no accepted/actionable findings.
- Agent-native review: PASS. User action routes through current docs and
  regenerated skills to the Core portal owner, typed/runtime tests, browser QA,
  release evidence, and this durable handoff without a shadow compatibility path.
- Mechanical goal checker: `[autogoal] complete`.

Final handoff prepared:
- Ownership and target API: Core owns `editor.plugin(Plugin | name)` and
  `useEditorPlugin(Plugin | name)`; descriptor inputs retain exact inference.
- Public breaks and adoption: `editor.getType`, weak `{ name }` lookup, and
  generic string portal casts are gone from live source with no alias or shim.
- Runtime policy: `.installed` is the only safe field on an absent portal; all
  capabilities throw. Explicit fallback remains only where raw/family-agnostic
  names are a real accepted input.
- Package/docs/browser: consuming packages, registry source, current EN/CN docs,
  changeset, rules, and Vision use the surviving surface; browser proof is clean.
- Residual user attention: none for this hard cut. The unrelated collaboration
  demo export failure remains outside this API scope.

Timeline:
- 2026-07-31T19:24:00.531Z Plate Plan created.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Ground |
| Where am I going? | Complete; final user handoff |
| What is the goal? | Remove `getType` and name-object lookup in favor of one descriptor/string portal |
| What have I learned? | Dynamic names need explicit absence policy; descriptor identity must be nominal at runtime too |
| What have I done? | Hard cut, full adoption, doctrine repair, focused/broad proof, browser QA, and final review |

Open risks:
- No open in-scope risk. CI regenerates public registry JSON from the corrected
  source docs; local edits to that generated tree are intentionally forbidden.
