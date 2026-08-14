# Hard cut Plate CLI runtime ownership

Objective:
Hard-cut Plate CLI runtime ownership; done when authored editor modules,
static generation, migrations, adoption, docs, and proof use the accepted
shape.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-08-14-hard-cut-plate-cli-runtime-ownership.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- docs
- package-api
- agent-native
- browser

Mode:
- `standard` accepted-plan execution. The user accepted the final CLI target
  in the immediately preceding exchange and said `Go`.

Completion threshold:
- The ordinary authored module is `editor.ts`, exports named `plugins` and an
  optional single `schema`, and is consumed directly by editor construction.
- `plate generate` reads that module without public `defineEditor`, emits no
  runtime `EditorKit`, and keeps exact generated types/schema/mutations and
  migration artifacts optional and static.
- Active source, exports, current-state docs, examples, and tests contain no
  public `defineEditor`, `bindGeneratedEditor`, generated runtime `EditorKit`,
  `schemaIdentity`, or `editor-definition` path outside explicit before/after
  migration prose and historical plans.
- CLI, Core, React, and www focused tests/typechecks; deterministic generation
  and `--check`; migration fixtures; browser route proof; skill sync; P2
  autoreview; and `check-complete` pass.

Verification surface:
- Focused symbol/path audits over `packages/core`, `packages/cli`, active
  `apps/www` source, `content`, package docs, and agent rule sources.
- `@platejs/cli` tests/typecheck/build plus deterministic generate/check/watch
  and migration tests.
- `@platejs/core` focused generated-contract/schema tests, package test and
  typecheck; affected React/package typechecks.
- www editor generation/check/typecheck and Browser proof on the standalone
  editor AI demo or nearest generated-editor-backed block route.
- Barrels, lint, changesets, agent rule generation/sync, agent-native review,
  P2 autoreview, and final goal-plan checker.

Constraints:
- No public compatibility aliases or runtime shims.
- Keep `@platejs/cli` a dev-only, bin-only package with the `plate` command;
  do not move compiler dependencies into `platejs` or add `platejs/cli`.
- Keep generated `Editor`/`Value` contracts only at explicit static boundaries;
  runtime hooks and constructors infer from authored `plugins` and `schema`.
- Preserve exact schema semantics, migrations, deterministic bytes, `--check`,
  watch recovery, atomic publication, no-op writes, and content-addressed
  fingerprints.
- Preserve independent registry-item ownership; generated app bindings never
  leak into reusable registry UI.
- Device testing remains deferred and is not a completion gate.
- Do not edit CI-controlled templates manually.

Boundaries:
- In scope: Core editor-definition/generated-contract API, CLI evaluator and
  emitter, migration/watch state, app-owned editor composition, current docs,
  release artifacts, checkers, and affected agent rules.
- Source owners: `packages/core/src/lib/editor`, Core editor construction,
  `packages/cli`, three www authored editor modules and their consumers,
  content/docs, `.agents/rules/best-api.mdc`, Plate UI/creator/next execution
  owners when they repeat the rejected shape.
- Non-goals: redesigning schema grammar, changing plugin capability APIs,
  changing persisted document shapes beyond moving lineage into `schema`,
  adding a second CLI configuration format, device testing, unrelated registry
  cleanup, or compatibility aliases.
- Direct Plite boundary owners: schema contract/compiler types consumed by
  Core only. Plite public APIs change only if live implementation proves an
  unavoidable substrate gap.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Stop only if the exact static editor contract cannot be emitted without
  reintroducing recursive runtime grammar, or if another active source writer
  owns the same Core/CLI/registry files and cannot freeze. A failing focused
  test with an identified owner is work, not a blocker.

Plate Plan state:
- status: complete
- phase: prove-and-handoff
- next: user review
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Accepted shape, filename, hard-cut scope, optional CLI boundary, generated artifacts, no device proof, and self-repair are copied above. |
| Active goal and plan verified | yes | Active goal names this exact plan and accepted implementation target. |
| Current owners read | yes | Live CLI bin/emitter, Core public generated-contract owners, www definition/generated files, Plate Vision, and prior CLI plans read; bounded manifest follows before edits. |
| Best API target resolved | yes | Accepted preceding `best-api` verdict: plain `plugins` plus optional `schema`; optional static compiler; no runtime generated owner. |
| Mode and execution boundary resolved | yes | One-shot accepted-plan execution authorized by the user's `Go`. |
| Docs pack selected | yes | Current-state setup/API docs and CLI teaching change. |
| `docs-creator` loaded | yes | Loaded before current-state docs adoption. |
| Docs lane selected | yes | Incidental current-state API/setup adoption, not a docs-dominant rewrite. |
| Target docs and nearest sibling docs read | yes | Editor/plugin guides, migration page, affected plugin pages, and EN/CN siblings were read before adoption. |
| Docs style doctrine read | yes | Root AGENTS current-state-only docs doctrine and Plate Vision read. |
| Documented source owner identified | yes | Core exports and CLI bin/emitter are authoritative; docs follow shipped source. |
| Package/API pack selected | yes | Core and CLI public API/package boundaries change. |
| Public surface or package boundary identified | yes | `platejs`/`@platejs/core` generated-definition exports and `@platejs/cli` command input/output contracts. |
| Release artifact path selected | yes | Reuse or replace the existing generated-editor changeset only after checking the delta from `main`; split one package per file if published package deltas remain. |
| `changeset` skill loaded when `.changeset` is required | yes | Loaded before source edits; main-relative and one-package-per-file rules recorded. |
| Barrel/export impact decision recorded | yes | Core exports and possibly files change; `pnpm brl` is required before final verification. |
| Agent-native pack selected | yes | Reusable API doctrine and execution skills must self-repair. |
| Agent-facing action surface identified | yes | Best API, Plate Next, Plate Plugin Creator, Plate UI, and docs teaching that names generated editor ownership. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/**`; regenerate `.agents/skills/**` with `pnpm install`; never hand-edit generated skills. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Loaded; source rule ownership, generated mirror sync, discovery, and proof routes were audited. |
| Browser pack selected | yes | www editor composition and generated contract adoption change. |
| Browser route / app surface identified | yes | Prefer `/blocks/editor-ai-demo`; fall back to the nearest standalone route that imports the main authored editor. |
| Browser tool decision recorded | yes | Use in-app Browser; no Chrome-native capability is involved. |
| Console/network caveat policy recorded | yes | Report pre-existing noise separately; new runtime/schema/console failures block completion. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
- [x] Docs pack: docs lane, target docs, nearest sibling docs, and source owner are recorded.
- [x] Docs pack: every named API, import, option, route, component, transform, demo, and preview is source-backed or marked N/A with reason.
- [x] Docs pack: docs use current-state reference voice, not changelog voice.
- [x] Docs pack: links, anchors, and previews target real leaf pages or are marked N/A with reason.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.
- [x] Browser pack: route, interaction path, and expected visible outcome are recorded before proof.
- [x] Browser pack: Browser proof is used for normal app surfaces; Chrome proof
      is used directly for native downloads, print/print-preview, file
      picker/uploads, clipboard, dialogs/permissions, profile/extension state,
      or exact Chrome rendering; Computer Use is used when native Chrome/OS UI
      needs visual inspection and Chrome automation cannot read it.
- [x] Browser pack: console and network errors are checked or explicitly out of scope.
- [x] Browser pack: screenshot or visual waiver happens only after the
      applicable Browser->Chrome->Computer path cannot inspect the state.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve every readiness condition | Core/CLI compile, generation/check, exports, and deterministic CLI tests are green. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final exact-symbol audit confirms the rejected runtime APIs and paths are absent from active source. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Accepted target is implemented exactly: authored runtime values, optional static compiler output. |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Core, CLI, www hosts, docs, release prose, and rules adopted; Browser caveat is recorded below. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Exact commands and boundaries are recorded under Verification evidence. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Final ownership, breaks, proof, and residual shared-tree caveats are recorded. |
| P2 autoreview | yes | Run with `--max-priority P2` for implementation changes; P3 is opt-in only, or record planning-only N/A | Final scoped post-fix run exited 0: `autoreview clean: no accepted/actionable findings reported`. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-08-14-hard-cut-plate-cli-runtime-ownership.md` | Final checker command is the last ledger gate. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Docs source and EN/CN parity checks passed; claims match live CLI/Core exports. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | No new links or preview names; touched routes and entry paths were source-audited. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | www docs source parser passed inside the www validation lane. |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | Touched plugin pages only adopt the current editor construction shape; no kit/manual/API reference contract changed. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Core and platejs builds passed; public define/bind/runtime-kit exports are cut and the generated type provider is type-only. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | CLI/Core public behavior and types require package release prose; registry adoption requires registry changelog. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | CLI and portal changesets use final current API; `changeset status` passed with no forbidden Core/platejs minor. |
| Registry changelog | yes | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | `2026-08-14-author-editor-runtime` MDX/JSON generated and changelog write/check passed. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Not applicable because published CLI/Core behavior and registry teaching both changed. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | Core full tests/typecheck/contracts/build and CLI full tests/typecheck/build passed; unrelated List/Suggestion/Table failures are separated below. |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | `pnpm brl` passed 56/56 tasks. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` and the later reinstall synced mirrors; Plate Next v74 validation passed. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | Best API, Plate UI, Plate Next, and generated skill mirrors teach authored runtime ownership and static generation. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Review passed: source owners, generated mirrors, routing, and executable proof all agree. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Browser attempted `/blocks/editor-ai-demo` and `/blocks/playground`; both stop in stale CI-generated `__registry__/index.tsx` before the changed runtime mounts. Local `build:registry` is forbidden. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | The only observed response is HTTP 500 from deleted paths in the stale generated registry index; no changed editor runtime executed. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Exact route/HTTP caveat recorded; no visual claim is made. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Owners, accepted target, and bounded source surface recorded | Decide |
| Decide | complete | One authored runtime owner and static-only compiler contract locked | Prove and hand off |
| Prove and hand off | complete | Source adoption and proof matrix completed with exact caveats | User review |

Decision brief:
- outcome: Runtime editor composition is ordinary authored TypeScript; exact
  recursive contracts are optional generated static output.
- chosen shape: `editor.ts` exports `plugins` and optional `schema`; runtime
  passes both directly; `plate generate` emits `editor.generated.ts` and
  `editor.schema.json` without a generated plugin kit.
- strongest rejected alternative: keep public `defineEditor` plus generated
  `EditorKit` as a runtime binding. It duplicates ownership and makes optional
  codegen look mandatory.
- consequence: public hard cut across Core, CLI, www, tests, docs, and release
  prose; CI `--check` becomes the publication staleness guard.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Authored app composition | Default-export `defineEditor(name, { plugins, schemaIdentity })` | Named `plugins` and optional `schema` from `editor.ts` | App/registry owner | Runtime needs values, not a definition noun | Rename three entries and consumers | CLI evaluation + Core/www typechecks | Named export discovery and absent schema | rearchitect |
| Generated runtime owner | Generated `EditorKit = bindGeneratedEditor(...)` owns runtime plugin input | Generated module exports static exact contracts only | CLI emitter | Optional typing must not own runtime | Replace runtime imports with authored `plugins`; keep type-only imports | CLI goldens + runtime source audit | Losing runtime mismatch guard | cut |
| Schema lineage | `schemaIdentity` appears beside plugin-derived/application schema | `schema.id` and `schema.version` inside the one app schema object | Core schema/application compiler | One concept, one owner | Migrate constructors/tests/docs | Schema identity, history/Yjs, generate/migrate tests | Schema merge/reconfiguration semantics | move |
| Public compiler wrapper | `defineEditor`/`bindGeneratedEditor` exported from Core/platejs | Internal compiler normalization only | Core + CLI | No public job remains | Remove exports/callers/tests; no alias | Build/typecheck/zero-match | Hidden external consumers face a major break | cut |
| CLI package | Separate `@platejs/cli` bin already owns TS/esbuild/watch/migrate | Keep bin-only `plate`; no `platejs/cli` runtime export | CLI | Heavy compiler deps stay dev-only | Update default entry/help and docs | Packed/bin tests | Discoverability | keep |
| Generated artifacts | `.generated.ts` plus `.schema.json` | Keep both as atomic optional committed outputs | CLI | Types and machine migration contract have distinct jobs | Rename source stem to `editor` | Determinism/no-op/recovery/migration tests | Extra file for opt-in users | keep |
| Registry ownership | Some hosts/examples import generated `EditorKit`; independent UI is already prohibited | Hosts import authored `plugins`; generated types stay type-only; independent UI remains generic | www/Plate UI | Product composition stays visible and copied items stay installable | Audit registry metadata and explicit editor-kit package labels | Registry checker + Browser | Accidental host-type leakage | rearchitect |
| Device testing | Deferred | Remain deferred | Future device lane | No native input behavior changes | Record only | N/A | None for this compiler/API cut | defer |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Core contract | Core editor/schema owners | Introduce plain application input and schema lineage; remove public generated-definition runtime | Accepted target | Core focused tests/typecheck green; no compatibility path | Focused tests, typecheck, export audit |
| 2. CLI compiler | `@platejs/cli` | Evaluate named exports; emit static types/schema; preserve generate/check/watch/migrate safety | Core contract stable | Full CLI suite, goldens, build, deterministic/no-op proof green | CLI tests/typecheck/build/perf smoke |
| 3. Application adoption | www registry/app owners | Rename `editor-definition.tsx` to `editor.ts`; export/import `plugins` and `schema`; remove generated runtime imports | CLI shape stable | Three entries and consumers generate/typecheck | www generate/check/typecheck, source audit |
| 4. Public adoption | Core/docs/release owners | Remove stale exports/tests/docs; update changesets from main; barrels | Source adoption complete | Zero active stale teaching and release metadata valid | `pnpm brl`, docs checks, symbol audit |
| 5. Doctrine and proof | Agent rules + browser/review owners | Repair affected rules, sync, browser proof, lint, P2 autoreview, final checker | Product source frozen | No accepted findings or stale mirrors | `pnpm install`, agent-native review, Browser, lint, autoreview, check-complete |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Ordinary runtime needs no CLI definition wrapper | Plate Vision and live current wrapper source | Core/www typechecks and constructor tests | passed |
| Generated exact contracts remain exact without runtime `EditorKit` | Current generator types/goldens and generated schema compiler | CLI full suite, generated type contracts, declaration/build proof | passed |
| Schema lineage remains stable and migration-safe | Prior compiler/history/Yjs tests | Core full suite and focused schema publication contracts | passed |
| CLI remains deterministic and crash-safe | Existing CLI recovery implementation | Full 58-case CLI suite, generate/check/watch/migrate proof | passed |
| Registry/editor demos still run | Current standalone routes | Source/check proof passed; Browser execution blocked before runtime by stale CI-owned registry index | caveat |

Conditional evidence:
- High-risk scenarios: generated/runtime fingerprints silently diverge;
  application schema overrides or lineage disappear during merge; generated
  `Editor` reintroduces TS2589 by recursively evaluating the raw tuple. Each
  has focused proof above.
- External research: N/A; accepted target and live local implementation are
  authoritative.
- Issue/PR provenance: N/A; direct user request, no public mutation authorized.
- Docs/registry/browser/release/behavior-law owners: current docs, app/registry
  hosts, package changesets, schema lineage tests, and standalone Browser route
  are in scope.

Findings:
- Plate Vision already owns the final target: plain `plugins`, one optional
  `schema`, direct runtime consumption, optional static `plate generate`.
- Live CLI still defaults to `editor-definition.tsx`, requires a default
  `defineEditor` export, and emits `EditorKit = bindGeneratedEditor(...)`.
- Live www main definition still duplicates lineage as `schemaIdentity`.
- Existing CLI owns `generate`, `--check`, `--watch`, and `migrate new`; these
  are surviving jobs, not removal targets.

Decisions and tradeoffs:
- Keep one authored file plus two opt-in generated artifacts. The JSON remains
  because migrations and structural diffing need executable-code-independent
  machine data.
- Keep generated `Editor` and `Value` for explicit static boundaries, but do
  not pass them to hooks or runtime constructors.
- Keep `@platejs/cli` separate and bin-only; a `platejs/cli` subpath would make
  runtime users pay for compiler dependencies.
- Use a hard cut with no deprecated aliases or dual entry grammar.

Review fixes:
- Accepted: document-schema-preserving consumers now pass the authored
  `schema` with `plugins` (`plate-to-html`, code drawing, Excalidraw,
  find/replace, and table-no-merge). Tabbable, playground, classic-list, and
  Copilot compositions intentionally change the schema and therefore do not
  claim the main application's lineage.
- Accepted: raw editor inference carries a type-only application-policy marker
  when `schema.overrides` or `schema.properties` can rewrite generic commands.
  Identity-only schemas retain descriptor-inferred commands; policy-bearing
  schemas require generated mutations for exact commands.
- Accepted: the raw-editor `PlateTest` overload requires `id` plus `version`,
  matching its runtime lineage guard.
- Accepted: generated empty schema/mutation/property maps use exact
  `Readonly<Record<PropertyKey, never>>` contracts, with negative compile
  proof.
- Accepted: application-policy detection is distributive across schema unions,
  all synthesized element mutations are suppressed without a generated
  contract, and missing named `plugins` exports fail before editor creation.
- Accepted: generated `Editor` commands are documented only at explicit static
  boundaries, while runtime hooks consume authored values directly.
- Accepted: the shared schema-identity owner and `PlateTest` both reject
  incomplete id/version lineage at runtime.
- Rejected as out of scope: staged Plate/Plite node intrinsic-prop typing and
  Slate harvest ledger/script findings belong to independent shared-tree
  owners and are not caused by this CLI runtime cut.
- Final command: scoped `autoreview --mode local --max-priority P2` over the
  post-fix Core/CLI/docs/consumer neighborhood. Result: clean, no accepted or
  actionable P0-P2 findings. Generated schema JSON was omitted because the
  helper refuses its size; deterministic generation/check/migration tests own
  those machine artifacts.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Broad Core context search exceeded the useful output budget | 1 | Read exact files and exact symbols | Resolved |
| Guessed stale paths for `withPlate.ts` and `createPlateStore.ts` | 1 | Locate owners with `rg --files` | Resolved |
| A shell loop named a variable `path`, shadowing `PATH` | 1 | Use task-specific variable names and direct package commands | Resolved |
| Root `pnpm exec plate` ran before the local CLI artifact existed | 1 | Build the owning CLI, then use the app package script | Resolved |
| First CLI suite run was contaminated by concurrent work and exceeded its timeout | 1 | Freeze the source slice and rerun the package suite alone | Resolved: 58/58 |
| Direct Bun package aggregation exposed split install resolution | 1 | Run the documented reinstall once, then package-owned scripts | Resolved for the owned lane |
| Browser routes returned 500 from stale CI-generated registry imports | 1 | Record exact blocker; do not run forbidden local `build:registry` | Source proof retained; no runtime visual claim |
| Full www/package graph reaches pre-existing List/Suggestion/Table errors | 1 | Keep owner checks exact and report the broader graph boundary | Owned Core/CLI/editor checks green |
| P2 helper saw oversized unrelated untracked Slate harvest ledgers | 2 | Locally exclude only that unrelated harvest directory from review discovery | Review bundle proceeds without source mutation |
| P2 helper refused generated schema JSON above its scan-size limit | 2 | Review executable generator/types and retain deterministic JSON/check/migration proof | Exact limitation recorded; no fake review claim |
| Full `withPlite.slow.ts` surfaced a separate raw application-property-handle identity mismatch | 1 | Run the new lineage regression directly and keep the separate handle-identity failure with its schema owner | New lineage row passed 1/1; full file 48 passed, 1 unrelated failure |

Verification evidence:
- `pnpm --filter @platejs/core test`: 694 passed, 0 failed.
- `pnpm --filter @platejs/core typecheck`: passed, including declaration
  contracts. A fresh final rerun passed after dependency reinstall.
- `pnpm --filter @platejs/core build` and `pnpm --filter platejs build`:
  passed.
- `pnpm --filter @platejs/cli test`: 59 passed, 0 failed.
- `pnpm --filter @platejs/cli typecheck` and build: passed. A fresh final
  typecheck passed.
- CLI performance: median 5.635 s, p95 6.062 s across 10 runs.
- `pnpm --filter www editor:check`: passed for all three authored editors and
  six generated artifacts. A fresh final rerun completed in 10.78 s.
- Docs source, EN/CN parity, registry source, and registry changelog
  write/check passed.
- `pnpm brl`: 56/56 tasks passed.
- `pnpm lint:fix`: passed across 4,107 files; only existing large-file
  warnings remained.
- `pnpm exec changeset status`: passed; no Core/platejs minor release was
  introduced.
- Plate Next v74 registry validation passed: 42 active, 1 retired.
- Exact active-source audit found no public `defineEditor`,
  `bindGeneratedEditor`, `schemaIdentity`, generated runtime `EditorKit`, or
  `editor-definition` caller. The lone `schemaIdentity` local variable is in a
  frozen history test and is not an API/config field.
- `git diff --check`: passed before final ledger update and is rerun at
  closeout.
- Final scoped P2 autoreview: clean, no accepted/actionable findings.
- Browser attempted `/blocks/editor-ai-demo` and `/blocks/playground`. Both
  returned 500 before the changed runtime mounted because CI-generated
  `apps/www/src/__registry__/index.tsx` imports deleted editor-kit/plate-types
  paths. Repo policy forbids local registry generation, so browser behavior is
  not claimed.
- Full www and some dependent-package graphs remain blocked by independent
  List/Suggestion/Table and registry type errors. No reported error names the
  authored editor, generated contract, CLI evaluator, or Core schema owner.

Final handoff prepared:
- Ownership and target API: `editor.ts` owns runtime `plugins` plus optional
  `schema`; `plate generate` owns static contracts and migration JSON only.
- Public breaks and adoption: `defineEditor`, `bindGeneratedEditor`, generated
  runtime `EditorKit`, hook kit arguments, `schemaIdentity`, and
  `editor-definition` are hard-cut with no aliases.
- Runtime/package/docs/browser decisions: Core/CLI/www/docs/rules/release
  artifacts use one shape; browser caveat is isolated to stale CI output.
- Proof and execution risks: owning tests/typechecks/builds/checks pass; broad
  shared-tree type failures remain under their existing owners.
- User attention: review the final public call shape and the exact proof
  boundary; no migration bridge or device-testing work remains in this lane.

Timeline:
- 2026-08-14T12:19:22.421Z Plate Plan created.
- 2026-08-14 User accepted `editor.ts` and authorized full execution with `Go`;
  goal and execution ledger established before source edits.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Prove and hand off |
| Where am I going? | User review after the final P2/check-complete gates |
| What is the goal? | Hard-cut optional CLI from runtime editor ownership while preserving exact static contracts and safety |
| What have I learned? | Runtime composition and static exact typing remain cleaner and cheaper when they have separate owners. |
| What have I done? | Implemented and adopted the hard cut across Core, CLI, www, docs, release artifacts, and agent doctrine; recorded exact proof boundaries. |

Open risks:
- CI must regenerate `apps/www/src/__registry__/index.tsx` before browser routes
  can exercise this checkout. Local policy deliberately prevents agents from
  manufacturing that CI output.
- Independent List/Suggestion/Table type failures prevent a truthful full-www
  green claim. The CLI/Core ownership cut is proven by its owning gates.
- The full Core slow application-schema file has one independent stale raw
  property-handle expectation (`reviewState` compiles to a final target-bound
  identity). The new incomplete-lineage regression passes directly; this task
  does not rewrite the separate schema-handle contract.
