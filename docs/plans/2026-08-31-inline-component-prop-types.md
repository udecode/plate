# Inline component prop types

Objective:
Inline every component-owned prop shape in authored Plate/Plite TSX. Keep a
named prop contract only when another file consumes its export or a published
source entrypoint exposes it. Enforce that rule for future code.

Completion threshold:
- Enumerate every authored TSX source and every component-shaped declaration.
- Record one keep/inline decision for each named local prop contract.
- Finish with zero unjustified aliases and machine-readable survivor evidence.
- Preserve every real cross-file and published prop contract.
- Change no runtime or rendered behavior.
- Put the rule in Plate UI, Best API, Plate Vision, and Plate Next doctrine;
  regenerate mirrors and prove parity.
- Pass the structural checker, its adversarial tests, repo lint, type-aware
  lint, affected typechecks, registry generators, focused tests, and a
  representative Browser smoke.

Verification surface:
- `docs/plans/artifacts/inline-component-prop-types/component-prop-ledger.json`
  is the deterministic 3,634-source-file manifest and decision ledger.
- `docs/plans/artifacts/inline-component-prop-types/component-prop-audit.md`
  records the complete localized and survivor lists, navigation score, release
  classification, and agent-native capability map.
- `tooling/scripts/check-inline-component-props.mjs` is the permanent AST and
  import/entrypoint-graph oracle invoked by root `pnpm lint`.
- Focused checker tests cover local aliases, same-file reuse, wrappers, class
  components, archived TSX, unused imports, orphan reexports, real consumers,
  and published entrypoints.

Constraints:
- Do not create a compatibility alias or rename `*Props` to evade the rule.
- Do not split components or alter runtime behavior to make type cleanup easy.
- Do not edit generated registry payloads, templates, or generated skill
  mirrors directly.
- Preserve honest state, domain, and descriptor models selected inside an
  inline prop expression.
- Do not remove a public contract reachable from a package entrypoint.

Boundaries:
- Authored roots: `apps/**`, `benchmarks/**`, `docs/**`, `packages/**`, and
  `tooling/**` TypeScript sources.
- Excluded output: dependencies, build/dist/coverage output, `.next`, `.turbo`,
  generated registry output, `apps/www/src/generated/**`, and `templates/**`.
- Component doctrine owner: `.agents/rules/plate-ui*`; API locality owner:
  `.agents/rules/best-api.mdc`; durable target: `docs/vision/plate.md`.
- Public evidence comes from actual type imports/reexports plus package
  manifests and configured public source entrypoints.
- No package symbol, barrel, serialized data, runtime contract, or JSX output
  changes as part of this cleanup.

Blocked condition:
Block only if an authored file cannot be classified as source/generated after
three evidence passes, or an apparent public contract cannot be resolved from
the import graph, package exports, and TypeScript path entrypoints. Neither
condition occurred.

Current verdict:
Local component prop aliases were navigation tax. The repo had 109 stable
baseline violations in 72 files. The repair localized 117 declarations,
including aliases revealed recursively by earlier expansion, and retained 20
real contracts. The final violation count is zero.

Start Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Prompt requirements captured | yes | Full-repo audit, strict exported-use exception, repair, enforcement, and proof are explicit above |
| Active goal | yes | Goal targets this plan and the zero-violation threshold |
| Architecture cleanup | yes | Delete/inline was evaluated before extraction; no split was accepted |
| Best API repair | yes | Hard-cut verdict keeps only real cross-file or published contracts |
| Plate UI owner | yes | Component source-shape doctrine lives in `.agents/rules/plate-ui*` |
| Source/mirror boundary | yes | Rules were edited; `pnpm install` generated skill mirrors |
| Package/public boundary | yes | Package manifests, source entrypoints, reexports, and external consumers were traced |
| Runtime scale | no | Type annotations erase; only the developer/CI audit has measurable cost |
| Browser route | yes | `/blocks/selection-retention-demo` is the representative registry route |
| Release artifacts | yes | Registry changelog applies; package changeset and barrels do not |

Work Checklist:
- [x] Copy every explicit user requirement and completion condition into the plan.
- [x] Read VISION, Plate/Plite vision details, repo rules, Plate UI, Best API,
      architecture cleanup, shadcn, registry changelog, changeset, and
      agent-native reviewer guidance.
- [x] Enumerate 3,634 authored TypeScript files and all 1,809 authored TSX files.
- [x] Detect 1,693 component-shaped declarations across 519 files.
- [x] Trace named prop aliases through direct imports, reexports, package
      manifests, and TypeScript public source entrypoints.
- [x] Inline every local-only contract, including same-file reuse.
- [x] Preserve all 20 externally justified contracts with evidence in the ledger.
- [x] Repair generic reductions and remove type-aware noise exposed by expansion.
- [x] Add a deterministic lint oracle and 10 adversarial tests.
- [x] Add the root lint route and prove it finds wrappers, classes, archives,
      false exports, real consumers, and published entrypoints.
- [x] Update Plate UI, Best API, Plate Vision, and Plate Next doctrine version 134.
- [x] Run `pnpm install` and verify source/generated mirror parity.
- [x] Generate and verify the registry changelog and registry payloads.
- [x] Record package changeset and barrel decisions against published impact.
- [x] Pass formatting, repo lint, type-aware lint, affected package/app typechecks,
      focused contract tests, registry checks, and Browser smoke.
- [x] Run the broad repo check and preserve the exact unrelated schema-oracle blocker.
- [x] Complete the agent-native capability review with no accepted gap.
- [x] Record cleanup counts, changed owners, verification, and residual risk.

Completion Gates:
| Gate | Applies | Evidence |
|---|---|---|
| Named verification threshold | yes | Final audit: 20 retained contracts, 0 violations, 1,809 TSX files |
| Source map complete | yes | Ledger records 3,634 source files, 1,693 components, 519 component files, exports, and consumers |
| Deslop inventory complete | yes | Audit records 109 stable violations in 72 files and 117 live localizations |
| Candidate matrix complete | yes | Seven ranked contract classes are recorded in the audit artifact |
| Agent-navigation score complete | yes | Invalid aliases 109 to 0; local declaration jump removed; one proof owner added |
| Anti-confetti gate | yes | No split, wrapper, facade, or new component layer was added |
| Delete/merge/inline gate | yes | Inline won; extraction and compatibility aliases were rejected |
| VISION fit | yes | `docs/vision/plate.md` states the durable locality rule |
| Implementation packets | yes | App/docs, registry, package internals, archive, checker, and doctrine packets are kept with focused proof |
| Runtime scale preservation | no | Product runtime is unchanged; audit median improved from 13.70s to 4.72s in the recorded probe |
| Source-owner oracle | yes | Root lint invokes the new deterministic checker; 10 tests protect its classification law |
| Public API safety | yes | All 16 published/cross-file contracts at the stable baseline remain; current tree retains 20 |
| Package/API proof | yes | Plate/Plite/test package graph passed; `www` typecheck passed after final config repair |
| Browser proof | yes | Local route returned 200, rendered editor plus controls, and logged zero browser errors |
| Final lint/check | yes | `pnpm lint` and `pnpm lint:type-aware` pass; affected typechecks and focused tests pass |
| Broad test boundary | yes | `pnpm test` reached 607 passing tests; only the untouched schema-adoption cardinality guard fails |
| Output budget discipline | yes | Full manifests are artifacts; interactive output used counts, capped lists, and focused diffs |
| Agent source/generated sync | yes | `pnpm install`; Plate Next v134 validates at fingerprint `sha256:2aa1c2650ed29d286272f98588e5dc32f6ceaa86831f42c7b547f16241be98a7` |
| Agent action discoverability | yes | Plate UI and Best API mirrors teach the rule; root `pnpm lint` enforces it |
| Agent-native review | yes | Source owner, route, mirror, proof, and handoff are all present |
| Runtime scale contract | no | Source-backed zero-runtime change; checker-only performance is recorded |
| Release artifact classification | yes | Copied registry source has a changelog; package types remain structurally and publicly unchanged |
| Published package changeset | no | No published symbol, assignability, runtime, or migration delta from the release baseline |
| Registry changelog | yes | `2026-08-31-inline-component-props` generated and checked |
| Barrel generation | no | No exported file or public export list changed |
| Goal plan complete | yes | This file contains no unresolved work and is ready for the final plan checker |

Phase / pass table:
| Phase | Status | Evidence |
|---|---|---|
| Intake and source read | completed | Requirements, owners, vision, and release law captured |
| Source map | completed | Deterministic full-source ledger generated |
| Candidate review | completed | Every candidate classified by consumer/entrypoint evidence |
| Cleanup | completed | 117 local declarations inlined; 20 contracts retained |
| Enforcement | completed | Root lint checker, tests, doctrine, mirrors, and v134 registry valid |
| Verification | completed | Focused and broad static gates pass; browser smoke passes |
| Closeout | completed | Artifacts and exact unrelated repo-test blocker recorded |

Source map:
- Canonical code owners are the component signatures themselves.
- Highest-risk generic owners were `editable-text.tsx`, live/static node
  renderers, DnD scroller options, and wrapper/class component forms.
- Public owners are package source entrypoints derived from package manifests
  and root TypeScript paths; an internal barrel alone is insufficient.
- Proof owners are the AST checker, its test file, package/app typechecks,
  registry generators, and one local Browser route.

Deslop inventory:
- Local `*Props` and `*Options` bags with one component owner: inline.
- Same-file aliases shared by helpers or sibling components: inline.
- Exported aliases with no consumer and no published entrypoint: inline.
- Orphan reexports and unused type imports: do not count as contracts.
- Honest state/domain/descriptor types inside `Pick`/`Omit`: keep.
- Real cross-file or published contracts: keep.
- Compatibility aliases, renamed aliases, component splits, and new wrappers:
  rejected.

Candidate matrix:
| Rank | Candidate class | Decision | Evidence owner |
|---:|---|---|---|
| 1 | App/docs-local prop bag | inline | component signature |
| 2 | Copied registry prop bag | inline | registry source and changelog |
| 3 | Generic Plate/Plite renderer prop bag | inline | package typecheck |
| 4 | Same-file shared alias | inline | same-file use does not cross a boundary |
| 5 | Export with an actual importing consumer | keep | import graph |
| 6 | Published source-entrypoint contract | keep | package manifest and TS paths |
| 7 | Independent state/domain/descriptor type | keep inside inline expression | semantic owner |

Agent-navigation score:
| Measure | Before | After |
|---|---:|---:|
| Invalid named prop contracts | 109 | 0 |
| Files with invalid contracts | 72 | 0 |
| Retained contract files | mixed with local aliases | 16 evidence-backed files |
| Local prop declaration jump | required | removed |
| Proof route | manual search | root lint plus deterministic ledger |
| Public/private classification | inferred from naming | proven from graph reachability |

Packet ledger:
| Packet | Action | Owner | Proof | Result |
|---|---|---|---|---|
| App and docs components | inline local prop bags | component source | lint and www typecheck | keep |
| Copied registry components | inline local prop bags | registry source | changelog, registry build, focused tests | keep |
| Plate/Plite components | inline private bags, retain public contracts | package source | package build/typecheck | keep |
| Archived authored TSX | inline two local bags | archived source | full AST audit | keep |
| Enforcement | add graph-aware checker and tests | tooling | 10/10 tests, root lint | keep |
| Doctrine | update source rules, Vision, v134 | `.agents/rules/**`, Vision | install, mirror search, fingerprint validation | keep |
| Gate cleanup | repair 29 type-aware diagnostics exposed in the checkout | cited files | type-aware lint and typechecks | keep |

Cleanup counts:
- inline: 117 local declarations
- keep: 20 exported cross-file or published contracts
- simplify: 29 type-aware diagnostics repaired
- split: 0
- compatibility aliases: 0
- defer: 0 in the component-prop scope

Changed list:
- Components: authored app/docs/registry/package/test TSX listed in the audit artifact.
- Enforcement: `tooling/scripts/check-inline-component-props.mjs`, its test,
  root `package.json`, and the deterministic ledger.
- Doctrine: Plate UI, Best API, Plate Vision, Plate Next v134, and generated mirrors.
- Registry: source changelog entry, generated changelog JSON/index, and generated registry payloads.
- Verification repairs: floating-toolbar source-count test, www Plite alias config,
  and type-aware cleanup identified by the broad gate.
- Package release files: none; no changeset or barrel regeneration applies.

Agent-native review:
| User action | Agent route | Source owner | Mirror/doc | Proof | Status |
|---|---|---|---|---|---|
| Author component props | `plate-ui` | `.agents/rules/plate-ui*` | generated Plate UI skill | root lint | pass |
| Judge API locality | `best-api` | `.agents/rules/best-api.mdc` | generated Best API skill | source/mirror search | pass |
| Audit all components | `pnpm lint` | checker script | root package command | ledger plus 10 tests | pass |
| Audit Plate Next adoption | `plate-next` v134 | version registry | generated Plate Next skill | validate/fingerprint | pass |

Verification evidence:
- `node tooling/scripts/check-inline-component-props.mjs --report ...` -> pass;
  20 retained contracts, 0 violations, 1,809 TSX files.
- `node --test tooling/scripts/check-inline-component-props.test.mjs` -> 10/10 pass.
- `pnpm lint` -> pass over 4,156 matched files plus structural audit.
- `pnpm lint:type-aware` -> pass after 29 diagnostics were repaired.
- Affected Turbo graph -> Plate/Plite/test packages passed; final
  `pnpm --filter www typecheck` passed source, docs, registry, Next route, app,
  and package-integration checks.
- `pnpm --filter www build:registry` -> 366 canonical payloads and 15 sparse
  overlays generated.
- Registry changelog write/check -> 97/97 events pass.
- Focused Plite alias and toolbar contract tests -> 16/16 pass.
- `pnpm install` -> rule mirrors generated; Plate Next v134 registry and
  fingerprint validate.
- Browser -> `/blocks/selection-retention-demo` returned 200, exposed the
  editor and two controls, and produced zero browser errors.
- `pnpm test` -> 607 pass; one untouched schema-adoption module errors because
  its allowlist totals 88 while its hard guard requires 89. A diagnostic run
  with the guard matched also revealed three existing AI/Yjs adoption findings,
  so the oracle was restored rather than weakened.
- `git diff --check` -> pass.

Open risks:
- Accepted component-prop scope: none. The deterministic lint rule prevents
  recurrence.
- Repo-wide test closure remains blocked outside this scope by
  `tooling/scripts/check-plate-schema-adoption.mjs`: its explicit counts and
  untouched AI/Yjs source findings need their owning schema-adoption repair.
- Plate Next status still reports the already-active `packages/platejs` and
  `packages/test` rows stale; this cleanup does not forge package attestations.

Final handoff contract:
- Decision: local prop shapes are inline; only 20 proven contracts remain named.
- Full evidence: component audit Markdown plus machine-readable ledger.
- Runtime impact: none; Browser smoke is supporting route proof, not evidence
  that erased TypeScript changed UI.
- Release impact: registry changelog only; no package changeset or barrels.
- Remaining external gate: schema-adoption oracle described under Open risks.
- Next owner: schema-adoption maintenance, starting with
  `tooling/scripts/check-plate-schema-adoption.mjs` and the three diagnostics
  already recorded; it is not required for this component-prop goal.

Timeline:
- 2026-08-31: goal and full authored-source audit created.
- 2026-08-31: 117 local declarations inlined; 20 contracts retained.
- 2026-08-31: permanent checker, doctrine v134, registry artifacts, static
  gates, focused tests, and Browser smoke completed.

Reboot status:
| Question | Answer |
|---|---|
| Where am I? | Final plan checker |
| Where am I going? | Mark the active goal complete after the checker passes |
| What is the goal? | Zero unjustified named component prop contracts repo-wide |
| What is proven? | 1,809 TSX files, 1,693 components, 20 retained contracts, zero violations |
| What remains outside scope? | The pre-existing schema-adoption repo-test blocker |
