# base static component boundary

Objective:
Remove every React-entrypoint import from Base/static plugin kits by giving
Base descriptors a terminal `component` binding that feeds the existing static
renderer registry.

Flow mode:
one-shot execution; the user's latest `then fix` / `go` instruction explicitly
authorizes the accepted API correction and adoption.

Goal plan:
docs/plans/2026-07-25-base-static-component-boundary.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- agent-native
- browser
- package-api

Mode:
- `standard`

Completion threshold:
- zero `/react` imports and zero `toPlatePlugin` calls in Base/static registry
  kit source;
- Core Base terminal component type/runtime proof and static HTML proof pass;
- affected package/app typechecks, skill sync/validation, focused Browser
  proof, review, and `check-complete` pass.

Verification surface:
- source audits over `apps/www/src/registry/**/*base*` and `*static*`;
- focused Core type/runtime/static-render tests and Core/www typechecks;
- the three named source rule owners plus generated skill mirrors;
- a representative www static-render route exercised through Browser.

Constraints:
- The latest user prompt already authorizes implementation.
- No public compatibility aliases or runtime shims.
- Update the relevant skill rules named by the user:
  `plate-plugin-creator`, `plate-ui`, and `plate-next`; do not hand-edit their
  generated `SKILL.md` mirrors.
- Base/package descriptors remain renderer-neutral; only terminal consumer
  configuration binds a component.
- Static/Base source must not import `platejs/react`,
  `@platejs/core/react`, or any `@platejs/*/react` entrypoint.
- Preserve live React kit component binding through the existing Plate
  `.configure({ component })` path.
- Keep one plan as the default artifact; add a machine-readable artifact only
  when it materially improves a large audit.

Boundaries:
- In scope: Core Base terminal configuration, static rendering adoption,
  Base/static registry kits, focused tests/checkers, current API release prose,
  and the three named skill owners.
- Source owners: `packages/core`, `apps/www/src/registry`, `.agents/rules`.
- Non-goals: changing live React kit behavior, adding another adapter, exposing
  `render.node`, compatibility aliases, unrelated shared checkout WIP.
- Direct Plite boundary owners: N/A; this is Plate plugin/component and
  registry/static-render ownership.

Output budget strategy:
- Read named owners first; expand by evidence; count or artifact large audits
  instead of streaming them.

Blocked condition:
- Block only if the existing Core model cannot publish Base-configured
  components without a React runtime dependency and three distinct owner-level
  approaches fail; otherwise continue with the smallest owner fix.

Plate Plan state:
- status: complete
- phase: prove and hand off
- next: none
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Requirements, constraints, and zero-import threshold are recorded above. |
| Active goal and plan verified | yes | Active goal names this exact plan and correction. |
| Current owners read | yes | Read Base/Plate plugin types and builders, static renderer, resolver component publication, representative Base/live kits, and VISION owners. |
| Best API target resolved | yes | `best-api` verdict: Base terminal `.configure({ component })`; reject constructor component and a static adapter. |
| Mode and execution boundary resolved | yes | One-shot execution; latest user prompt explicitly authorizes the fix. |
| Agent-native pack selected | yes | Three named skill source rules change. |
| Agent-facing action surface identified | yes | Base/static import and component-binding law in the three named skills. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/*.mdc`; regenerate with `pnpm install`; do not edit `SKILL.md` directly. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Load before final agent-native review. |
| Browser pack selected | yes | `apps/www` registry/static render surface changes. |
| Browser route / app surface identified | yes | Select the nearest runnable static HTML/registry route after adoption scan; prefer the existing plate-to-html block when runnable. |
| Browser tool decision recorded | yes | Use Browser plugin; no native Chrome/OS behavior is involved. |
| Console/network caveat policy recorded | yes | Check route console; report unrelated pre-existing noise separately. |
| Package/API pack selected | yes | `@platejs/core` public Base configuration type/runtime changes. |
| Public surface or package boundary identified | yes | `BasePlugin.configure({ component })` in `@platejs/core`; no new export noun. |
| Release artifact path selected | yes | Update/add the existing Core API changeset after loading `changeset`. |
| `changeset` skill loaded when `.changeset` is required | yes | Load before editing release prose. |
| Barrel/export impact decision recorded | yes | No exported file move/add expected; run `pnpm brl` only if live edits change exports. |

Work Checklist:
- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API/docs/tests/exports claims cite live source.
- [x] Reusable public call shape has one `best-api` verdict before target lock.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Public breaks and any private bridge have complete adoption/deletion answers.
- [x] Execution slices and focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved without generic N/A matrices.
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
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | pass | Resolve every readiness condition | All required source, type, runtime, skill, registry, docs, and Browser gates are resolved. |
| Fresh source evidence | pass | Recheck decision-changing current claims | Final source audit covers 4,699 source/docs files and the 17 migrated Base kits. |
| Best API review | pass | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Terminal `BasePlugin.configure({ component })` accepted; constructor component and another adapter rejected. |
| Conditional risk and adoption | pass | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Core, all Base kits, public docs, release prose, checker, registry changelog, Browser, and named skills are covered. |
| Verification recorded | pass | Record fresh planning proof and exact execution gates | See Verification evidence. |
| Handoff prepared | pass | Prepare concise ownership, breaks, proof, risks, and execution order | See Final handoff prepared. |
| Autoreview | pass | Run for implementation changes or record planning-only N/A | Three accepted findings were repaired; final scoped review reports no accepted/actionable findings and `patch is correct` at 0.82 confidence. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-25-base-static-component-boundary.md` | Run after this evidence update. |
| Agent source / generated sync | pass | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install`; source/generated sidecar byte comparison; Plate Next v9 validation. |
| Agent action discoverability | pass | Source-audit the skill/rule path an agent will read | Boundary law is present in all three generated `SKILL.md` entrypoints. |
| Agent-native review | pass | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Source owner, mirror, route, and proof mapping is complete; no agent-action gap remains. |
| Browser interaction proof | pass | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Browser rendered `/blocks/plate-to-html` with editable and static editor trees, including headings, blockquote, HR, table, equation, columns, mention, date, media, and iframe. |
| Browser console/network check | pass | Record console/network state or why it is not applicable | Route returned 200; one pre-existing/harness `MutationObserver.observe` console error was unrelated to component publication. |
| Browser final proof artifact | pass | Record screenshot/trace/route/native proof or exact caveat | DOM snapshot is the final proof; Browser URL policy blocked screenshot capture, so no screenshot is claimed. |
| Public API / package boundary proof | pass | Source-audit public API, exports, and package boundary impact | Built declaration exposes constructor `component?: never` and terminal `component?: NodeComponent`; no new export noun/file. |
| Release artifact classification | pass | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published Core terminal configuration plus user-visible registry kit correction. |
| Published package changeset | pass | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | Existing `.changeset/plugin-portal-scoped-api.md` carries the final Core API prose at major level; no forbidden minor bump. |
| Registry changelog | pass | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Added source entry and generated JSON/index/component targets; 37/37 event check passes. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | N/A: both package and registry user-visible deltas have their required artifacts. |
| Package typecheck/build/test | pass | Run owning package checks or record N/A with reason | Core typecheck/contracts/build, Plate package typecheck, www package-integration typecheck, and 61 focused tests pass. |
| Barrel/export generation | no | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | N/A: no exported file was added, removed, moved, or newly exported. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | completed | Live Core/static/registry owners and doctrine read. | Decide |
| Decide | completed | Base terminal configuration wins; constructor and adapter rejected. | Execute and prove |
| Prove and hand off | completed | Core owner, adoption, docs, skills, Browser, and package proof complete. | None |

Decision brief:
- outcome: Base/static source binds static node components without importing a
  React package entrypoint.
- chosen shape: `BaseFooPlugin.configure({ component: FooStatic })`, normalized
  internally to the existing private `render.node` registry.
- strongest rejected alternative: `toStaticPlugin`/another adapter; it adds a
  noun solely to bridge a missing terminal field. Constructor-level
  `component` is also rejected because reusable Base descriptors should remain
  renderer-neutral.
- consequence: Base terminal configuration gains one typed field; all Base kits
  lose `toPlatePlugin` and `/react` imports; live kits remain unchanged.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Base static component binding | Base kit imports React `toPlatePlugin` only to bind a static component | `BasePlugin.configure({ component })` | Core Base plugin | Terminal consumer binding is renderer policy and Core already stores/publishes `render.node` | Rewrite every Base/static kit | type/runtime/static HTML tests | accidental constructor exposure or component loss during resolution | rearchitect |
| Base constructor | no public `component` | remain renderer-neutral | feature package/Base plugin | package descriptor must not own one renderer | no adoption | negative type proof | widening constructor would invite React ownership in Base packages | keep |
| Live Plate component binding | `.configure({ component })` | unchanged | Plate React plugin | correct live consumer path | none | existing tests/typecheck | none | keep |
| Static adapter | `toPlatePlugin` misused | no replacement adapter | none | adapter exists only because Base terminal field was missing | delete calls/imports | zero-match audit | hidden alias could preserve wrong ownership | cut |
| Agent teaching | skills teach React conversion in Base kits or omit boundary | three named owners forbid `/react` and teach direct Base terminal binding | named rules | future agents must repair Core/static owner instead of crossing layers | sync generated skills | rule/source audit and agent-native review | contradictory examples | rearchitect |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1 | Core Base plugin | terminal type plus runtime normalization | current component registry proven | direct Base configured component publishes to runtime; constructor remains rejected | focused typed/runtime/static-render tests |
| 2 | Registry | all Base/static kits | Core path green | zero React-entrypoint imports and zero `toPlatePlugin` calls | source audit + www typecheck |
| 3 | Agent rules | plate-plugin-creator, plate-ui, plate-next | target API fixed | source rules, doctrine version, generated mirrors agree | `pnpm install`, version validation, agent-native review |
| 4 | Release/docs/proof | changeset, package checks, Browser, review | all adoption complete | all gates and check-complete pass | focused then broad commands and Browser |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Static renderer already consumes resolved plugin components | `resolvePlugins.ts` publishes `plugin.render.node`; static renderers read runtime components | focused Core/static HTML test preserves constructor `nodeProps` and renders configured `<aside>` | pass |
| Base terminal binding needs no React adapter | Base terminal type lacks only `component`; runtime configuration layers already merge render config | runtime test plus zero forbidden imports/calls across all Base/static registry modules | pass |
| Base packages stay renderer-neutral | constructor currently rejects public node renderer ownership | compile-only `component?: never` plus runtime rejection | pass |
| Live kits remain on Plate path | representative live kit uses Plate `.configure({ component })` | source audit and www package-integration typecheck | pass |

Conditional evidence:
- High-risk scenarios: component dropped during terminal layer resolution;
  constructor accidentally accepts component; converted/configured descriptors
  lose terminality; Base/static imports regress.
- External research: N/A; live local owner code fully determines the boundary.
- Issue/PR provenance: N/A; user-directed current-tree correction.
- Docs/registry/browser/release/behavior-law owners: registry, Core changeset,
  Browser proof, and three named agent rules apply.

Findings:
- `resolvePlugins` already publishes `plugin.render.node` into the immutable
  runtime component map, and static renderers consume that map.
- Base terminal configuration is the missing public type/runtime normalization.
- The initial migration introduced React imports in every `*-base-kit.tsx`
  solely through `toPlatePlugin`.

Decisions and tradeoffs:
- Add `component` only to terminal Base configuration.
- Normalize it internally to private `render.node`.
- Do not add a static plugin adapter or expose registry internals.
- Do not change live React kit composition.

Review fixes:
- Autoreview found `BulletedListElement` bound to the behavior-only
  `ListPlugin` in the uncommitted EN docs. Moved it to
  `BulletedListPlugin.configure(...)` in EN and CN, matching the registry owner.
- Autoreview found one stale sentence that told consumers to call terminal
  `.configure()` twice. It now requires component and every override in the
  same terminal call.
- Autoreview found `code-drawing-base-kit` still bound the live client node
  component. It now imports `CodeDrawingElementStatic`; the permanent checker
  rejects live `@/registry/ui/*-node` modules from Base/static kits, and all
  three named skills teach the transitive renderer boundary.
- Final autoreview: clean, no accepted/actionable findings; patch correct at
  0.82 confidence.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Docs parity script ran before Fumadocs source generation | 1 | Generate `.source`, then rerun the owner check | `pnpm --filter www build:source`; parity passed. |
| Biome received ignored MDX paths | 1 | Use the docs source/parity owner instead of treating ignored MDX as lintable input | Docs source parity passed; no source failure. |

Verification evidence:
- `bun test packages/core/src/lib/plugin/createBasePlugin.spec.ts packages/core/src/static/renderStaticHtml.node-props.spec.ts tooling/scripts/check-plate-schema-adoption.test.mjs`: 61 pass, 0 fail.
- `pnpm --filter @platejs/core typecheck`: pass, including emitted type contracts.
- `pnpm --filter @platejs/core build`: pass; built declarations retain
  constructor `component?: never` and terminal `component?: NodeComponent`.
- `pnpm --filter platejs typecheck`: pass.
- `pnpm --filter www exec tsc --noEmit -p tsconfig.package-integration.json`:
  pass.
- `node tooling/scripts/check-plate-schema-adoption.mjs`: pass across 4,699
  source/docs files.
- `pnpm --filter www build:source`, docs source parity, and registry source
  checks: pass.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check`: 37 source
  entries/events pass.
- `node .agents/rules/plate-next/scripts/version.mjs validate`: Plate Next v9
  registry valid, 41 active and 1 retired.
- Generated skill entrypoints contain the Base/static boundary law and the
  static-renderer-module law; the Plate UI sidecar is byte-identical to its
  source.
- Browser: `/blocks/plate-to-html` returned 200 and rendered the complete
  static output tree. Screenshot capture was blocked by Browser URL policy;
  the DOM snapshot is the retained proof. One unrelated/harness
  `MutationObserver.observe` console error is not attributed to this diff.
- Full www `tsc` remains blocked only by shared readonly `Value` mutation
  errors in huge/multi-editor/version-history fixtures; no Base kit or changed
  component-boundary file appears in that failure set.

Final handoff prepared:
- Ownership and target API: Core owns terminal
  `BasePlugin.configure({ component })`; constructors remain renderer-neutral.
- Public breaks and adoption: no compatibility adapter; all 17 affected
  Base/static registry kits bind their component directly and import no React
  plugin entrypoint.
- Applicable runtime/package/docs/browser decisions: Core runtime/type tests,
  public docs/release prose, registry changelog, and the three named skills
  agree.
- Proof and execution risks: component publication, sibling render-field
  preservation, constructor rejection, declaration emission, regression audit,
  and representative static Browser rendering are proven.
- Execution order and user attention: complete; no manual decision remains.

Timeline:
- 2026-07-25T14:59:21.228Z Plate Plan created.
- 2026-07-25 Core terminal component binding and constructor rejection added.
- 2026-07-25 Migrated 17 Base/static registry kits and added permanent source checker.
- 2026-07-25 Repaired and regenerated the three named skills; Plate Next doctrine v9.
- 2026-07-25 Added docs, package release prose, registry changelog, and Browser proof.
- 2026-07-25 Accepted autoreview docs finding repaired in EN/CN; final gates rerun.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Complete |
| Where am I going? | Final handoff |
| What is the goal? | Zero React imports in Base/static kits with typed Base terminal component binding |
| What have I learned? | See Findings |
| What have I done? | Completed Core, adoption, docs, skills, release, checker, type/runtime, and Browser proof |

Open risks:
- Shared checkout contains unrelated WIP; it was preserved. Full www `tsc`
  retains unrelated readonly fixture errors recorded above.
