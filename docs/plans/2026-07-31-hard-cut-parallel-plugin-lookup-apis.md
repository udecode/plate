# hard-cut parallel plugin lookup APIs

Objective:
Hard-cut parallel Plate plugin lookup APIs; done when canonical portal
adoption, stale-symbol audit, affected checks, docs/browser proof, and review
pass.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-31-hard-cut-parallel-plugin-lookup-apis.md

Template:
docs/plans/templates/plate-plan.md

Primary template:
docs/plans/templates/plate-plan.md

Applied packs:
- docs
- agent-native
- package-api
- browser

Mode:
- `standard` accepted-plan execution.

Completion threshold:
- Zero public exports, editor methods, source callers, docs, or examples for
  the rejected lookup family; the surviving portal and dynamic-name type query
  compile with exact inference; Core and affected package/app checks pass;
  docs and one runnable registry surface pass browser proof; agent rules and
  generated skills agree; autoreview has zero accepted findings; and
  `check-complete` passes.

Verification surface:
- Source audits over `packages/**`, `apps/www/src/**`, `content/docs/**`,
  exports, type tests, and agent rules, excluding generated release history.
- Source-first Core and affected package/www typechecks plus focused Core and
  package tests.
- `pnpm brl`, MDX/content parsing, changeset validation, `pnpm install` skill
  sync, Browser proof, and autoreview.

Constraints:
- User explicitly accepted the reviewed target with `go all`; execute without
  another approval pause.
- No public compatibility aliases or runtime shims.
- Preserve the distinct concrete-editor `editor.api.<name>` discovery surface,
  generic descriptor portal, React subscription hooks, plugin behavior,
  static/RSC rendering, configured node types, and optional-plugin checks.
- Do not change raw Plite extension APIs or unrelated feature API shapes.

Boundaries:
- In scope: Core plugin lookup/public editor surface; all live package,
  registry/app, test, type-test, docs, and example adopters; Markdown registry
  callback shape; relevant skills/doctrine; barrels and release artifact.
- Source owners: `packages/core`, `packages/markdown`, affected Plate packages,
  `apps/www`, `content/docs`, `.agents/rules`, `docs/vision`, `.changeset`.
- Non-goals: raw Plite portal redesign, feature behavior changes, compatibility
  aliases, historical changelog/generated release rewrites, unrelated cleanup.
- Direct Plite boundary owners: N/A; this hard cut stays in Plate/Core and
  consumes existing Plite editor/runtime primitives unchanged.

Output budget strategy:
- Read named owners first; use file/count inventories before matching lines;
  exclude changelogs, generated release indexes, templates, build output, and
  dependencies; cap broad outputs and inspect owner slices.

Blocked condition:
- Block only if three focused attempts prove an owning generic/runtime law
  cannot express the accepted portal without a new user decision, or required
  browser/tooling infrastructure remains unavailable after documented repair.

Plate Plan state:
- status: complete
- phase: handoff
- next: user review
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | This plan records every accepted cut, preserved surface, adoption owner, proof gate, and no-alias constraint. |
| Active goal and plan verified | yes | Active goal points to this exact plan. |
| Current owners read | yes | Core lookup/editor/portal types and runtime, Markdown conversion context, public docs, representative package/registry consumers inspected. |
| Best API target resolved | yes | Accepted review: one `editor.plugin(Plugin)` portal plus dynamic-only `editor.plugin(name).type`; internalize compiler lookups. |
| Mode and execution boundary resolved | yes | Standard one-shot execution explicitly authorized by `go all`. |
| Docs pack selected | yes | Materialized docs rows apply to Core API guides, Markdown docs, and migration/reference cleanup. |
| `docs-creator` loaded | yes | Read `.agents/skills/docs-creator/SKILL.md`; API-reference/current-state lane applies. |
| Docs lane selected | yes | Current-state API/reference and guide adoption; historical generated releases excluded. |
| Target docs and nearest sibling docs read | yes | Core plate-editor, editor-methods, plugin-context, and Markdown context docs inspected. |
| Docs style doctrine read | yes | Current-state voice, exact source-backed imports/API names, and API reference shape recorded. |
| Documented source owner identified | yes | Core editor/portal types and Markdown runtime registry are authoritative. |
| Agent-native pack selected | yes | Canonical lookup and portal guidance changes future agent actions. |
| Agent-facing action surface identified | yes | `best-api`, `plate-next`, and `plate-plugin-creator` source rules. |
| Source rule versus generated mirror boundary identified | yes | Edit `.agents/rules/*.mdc`; regenerate `.agents/skills/*/SKILL.md` with `pnpm install`. |
| `agent-native-reviewer` loaded or waiver recorded | yes | Read `.agents/skills/agent-native-reviewer/SKILL.md`; final parity map/review required. |
| Package/API pack selected | yes | Public Core editor/plugin exports and Markdown callback API change. |
| Public surface or package boundary identified | yes | `@platejs/core`, React Core exports, `platejs`, and `@platejs/markdown` adoption. |
| Release artifact path selected | yes | Package changeset required for published breaking API/type removal. |
| `changeset` skill loaded when `.changeset` is required | yes | Read `.agents/skills/changeset/SKILL.md`; one package per file and `main`-relative user impact apply. |
| Barrel/export impact decision recorded | yes | Removing exported files/symbols requires `pnpm brl` and root export audit. |
| Browser pack selected | yes | `apps/www` and docs change. |
| Browser route / app surface identified | yes | Core API docs route plus `/blocks/table-demo` as a representative portal-heavy registry surface. |
| Browser tool decision recorded | yes | Use Browser; no native Chrome/OS behavior applies. |
| Console/network caveat policy recorded | yes | Record console/network output; distinguish pre-existing warnings from migration failures. |

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
- [x] Agent-native pack: source-of-truth rule files are edited instead of generated skill mirrors.
- [x] Agent-native pack: the changed agent action is discoverable from the skill/rule text.
- [x] Agent-native pack: generated mirrors are synced when `.agents/rules/**` changed, or N/A reason is recorded.
- [x] Agent-native pack: accepted agent-native review findings are fixed or explicitly rejected with reason.
- [x] Package/API pack: public API, package boundary, export, and release-artifact impact are recorded.
- [x] Package/API pack: release artifact matrix is applied: `.changeset`, registry changelog, or explicit no-artifact reason.
- [x] Package/API pack: `.changeset` work loads `changeset` and follows its package/version/prose rules.
- [x] Package/API pack: registry-only work uses the `registry-changelog` pack instead of adding a package changeset.
- [x] Package/API pack: no-artifact decisions state why the diff has no published package user-visible delta from `main`.
- [x] Package/API pack: compatibility, migration, or hard-cut decision is explicit when public shape changes.
- [x] Package/API pack: package-owned typecheck/build/test proof is recorded or marked N/A with reason.
- [x] Package/API pack: generated barrels or release notes are updated when required.
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
| Binary readiness | yes | Resolve every readiness condition | Stale-symbol and filename audits are empty; focused tests, integrated types, docs, rules, Browser, and review gates are closed. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final source audits ran after the last implementation edit and found no live rejected lookup. |
| Best API review | yes | Resolve/reject every P0/P1 call-shape finding, or record no public shape change | Accepted target remains one portal, dynamic-only `getType`, and private compiler registries; no unresolved P0/P1 remains. |
| Conditional risk and adoption | yes | Complete triggered risk/docs/browser/provenance work or give one scoped N/A reason | Static/React fallback, injection compilation, Markdown registry, Docx export inputs, docs, and app consumers are covered. |
| Verification recorded | yes | Record fresh planning proof and exact execution gates | Exact commands and counts are recorded below. |
| Handoff prepared | yes | Prepare concise ownership, breaks, proof, risks, and execution order | Ownership, breaks, proof, review disposition, and generated-output caveat are recorded below. |
| Autoreview | yes | Run for implementation changes or record planning-only N/A | Three passes: fixed the unknown-node fallback and doctrine version findings; rejected one generated-registry finding because repo policy forbids local registry generation and the source registry check passes. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-31-hard-cut-parallel-plugin-lookup-apis.md` | Run after this ledger update. |
| Docs source-backed claim audit | yes | Verify docs claims against current source or record N/A | Core, Markdown, and DOCX examples/types match the final source API. |
| Docs links / routes / previews | yes | Verify leaf links, routes, anchors, and preview names or record N/A | `/docs/api/core/plate-editor` and `/docs/docx-io` return their expected H1/title in Browser. |
| Docs MDX/content parser | yes | Run `pnpm --filter www build:source` for MDX/content changes, or record N/A | `www` typecheck ran MDX build plus docs source parity successfully. |
| Plugin page specifics | yes | For plugin pages, apply `docs-creator` kit/manual/API rules; otherwise N/A | DOCX page documents explicit operation options; Markdown page documents the final registry callback API. |
| Agent source / generated sync | yes | Run `pnpm install` when `.agents/rules/**` changed and verify generated mirrors | `pnpm install` regenerated skills; Plate Next v38 registry validation passes. |
| Agent action discoverability | yes | Source-audit the skill/rule path an agent will read | `best-api`, `plate-next`, and `plate-plugin-creator` source and generated skills teach the sole portal and rejected lookup family. |
| Agent-native review | yes | Load `.agents/skills/agent-native-reviewer/SKILL.md` and close accepted findings, or record N/A | Source/generated parity, discoverability, version ledger, and action wording are aligned at Plate Next v38. |
| Public API / package boundary proof | yes | Source-audit public API, exports, and package boundary impact | Old helper files/exports are absent; private context/compiler owners remain under internal entrypoints. |
| Release artifact classification | yes | Record whether the change is published package behavior/API/types/config/runtime, registry-only, or no published user-visible delta | Published breaking Core, Markdown, and DOCX API/type changes are covered by existing v54 major changesets. |
| Published package changeset | yes | If published package users see a delta, load `changeset`, add/update one `.changeset/*.md` per package, and prove no forbidden `minor` on `@platejs/plite`, `@platejs/core`, or `platejs` | `plugin-portal-scoped-api`, `markdown-plite-runtime`, `platejs-product-codecs`, and `docx-io-v54-api` describe the final shapes; changeset status reports no minor packages. |
| Registry changelog | no | If the change is registry-only under `apps/www/src/registry/**`, use the `registry-changelog` pack and do not add a package changeset | Not registry-only; registry callers adopt published package breaks. |
| No release artifact | no | If no artifact is needed, record the exact reason: internal-only, docs-only, agent-only, test-only, or no user-visible delta from `main` | Published API breaks require and have package changesets. |
| Package typecheck/build/test | yes | Run owning package checks or record N/A with reason | 92 focused tests pass; 70/70 integrated Turbo tasks pass across 14 affected package/app targets. |
| Barrel/export generation | yes | Run `pnpm brl` when exports or exported file layout changed, otherwise N/A | Full `pnpm brl` and focused Core barrel generation passed; private `.internal.ts` owners are absent from public barrels. |
| Browser interaction proof | yes | Exercise target route/interaction with Browser for normal app surfaces or Chrome/Computer for native browser/OS surfaces; otherwise record blocker | Browser rendered both docs routes and `/blocks/table-demo`; the demo contains one editable table with 20 cells. |
| Browser console/network check | yes | Record console/network state or why it is not applicable | All three final routes returned normally with zero captured console errors. |
| Browser final proof artifact | yes | Record screenshot/trace/route/native proof or exact caveat | Route/title/H1 and rendered table DOM evidence recorded; screenshot unnecessary because structural rendered state was directly inspectable. |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Owners, constraints, and accepted target captured | Done |
| Decide | complete | One portal/dynamic-name/private-registry target locked | Done |
| Prove and hand off | complete | Tests, types, docs, Browser, doctrine, release, and review closed | User review |

Decision brief:
- outcome: one public installed-plugin portal with no lookup-helper family.
- chosen shape: `editor.plugin(Plugin)` for descriptor access and optionality;
  `editor.plugin(name).type` only for true runtime-name resolution; private Core
  registries for reverse/type/render lookups; Markdown `registry.*` callbacks.
- strongest rejected alternative: retain helpers as convenience aliases or
  deprecations. Rejected because every alias creates another taught path and
  preserves internal cache vocabulary publicly.
- consequence: broad breaking adoption across Core, packages, apps, tests,
  docs, exports, skills, and release notes.

Decision ledger:
| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Installed descriptor/context access | `getBasePlugin`, two `getEditorPlugin` exports, React `getPlugin`, and `editor.getPlugin` overlap | `editor.plugin(Plugin)`; private context/compiler factories only | Core | One typed portal | Replace consumers; remove exports/types/tests/docs | Exact type tests plus runtime portal tests | Hot internal paths must use private direct lookup, not allocate portals needlessly | cut |
| Type lookup | `getPluginType(s)` plus `editor.getType` and portal `.type` | Portal `.type` for descriptors; `editor.plugin(name).type` only for runtime names | Core | Input ownership distinguishes the two surviving paths | Rewrite known descriptors and arrays; keep dynamic names | Stale-symbol audit and configured-type tests | Accidental throws for optional absent names | cut |
| Reverse/type registry | `getPluginName(s)`, `getPluginByType`, `getContainerTypes` publicly expose caches | Private Core registry/compiler lookup; schema predicates for public node questions | Core/schema | Runtime implementation detail | Migrate render, affinity, override, selection, registry UI | Core tests, browser table demo | Render/static behavior regression | move |
| Injected node props | `editor.getInjectProps` derives defaults outside compiled descriptor | Compile resolved `inject.nodeProps` defaults and read through portal descriptor | Core compiler | Delete dedicated query and duplicate resolution | Migrate style plugins/tests/UI | Compile/runtime injection tests | Configuration/type timing | rearchitect |
| Consumer portal contract | Runtime portal exposes callback-only `editor` and `defineCodecs` | Narrow consumer portal; authoring context retains callback fields internally | Core types/runtime | Stop leaking authoring machinery | Update contextual types and type tests | Declaration/type tests and plugin callback tests | Generic recursion/inference | rearchitect |
| Markdown plugin registry context | Loose `getPluginType`, `getPluginName`, `hasPlugin` callbacks duplicate registry | `registry.getType/getName/has` | Markdown/Core codec contract | One registry noun | Migrate conversion, codecs, docs, tests | Markdown tests/typecheck/docs | External codec callback break | rearchitect |
| Concrete vs generic capability access | Root `editor.api.<name>` and portal `.api` | Keep both with strict ownership: concrete discovery vs generic/exact descriptor | Core doctrine | Distinct typing jobs, one contributed implementation | Repair docs/rules to prevent arbitrary choice | Type tests | Mis-teaching as aliases | keep |

Execution slices:
| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Core portal and private registries | Core | types, runtime lookup, compiler defaults, exports, Core tests/type tests | Accepted target and manifest | Rejected public symbols absent; exact portal inference passes | Focused Core tests/type tests/typecheck |
| 2. Package and app adoption | Package owners + www | Markdown, affected packages, registry/app/tests | Core compiles | All callers use portal/schema/private owners; affected checks pass | Package tests/typechecks and www typecheck |
| 3. Docs/rules/release | Docs + agent rules + changeset | current-state docs, skills/doctrine, changeset, barrels | Source adoption stable | No stale teaching; generated skills/barrels synced | MDX check, skill sync/review, changeset/barrel audits |
| 4. Browser and closure | www + review | representative routes, console/network, autoreview, stale-symbol audit | All checks green | Browser proof and zero accepted findings | Browser + autoreview + check-complete |

Proof matrix:
| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Public lookup family is absent | Core export/runtime/caller inventory | Exact symbol and filename audits return zero live matches | complete |
| Portal preserves exact descriptor inference and optional checks | Current portal type/runtime tests | Core declaration contracts and portal runtime tests pass | complete |
| Render/static/injection behavior survives | Current renderer/injection tests and representative callers | Unknown-node fallback regression test, focused package tests, and table Browser demo pass | complete |
| Docs and agent teaching expose one path | Current docs/rules inventory | MDX build/parity, v38 skill regeneration/validation, and final source audit pass | complete |

Conditional evidence:
- High-risk scenarios: static renderer cannot resolve plugins by node type;
  optional plugin check throws; configured inject node keys drift; public
  declaration inference recurses or widens.
- External research: N/A; accepted target is grounded in the current checkout.
- Issue/PR provenance: N/A; user-directed local architecture hard cut.
- Docs/registry/browser/release/behavior-law owners: docs, registry demo,
  package changeset, Core/Markdown tests, and agent rules all apply.

Findings:
- Live Core exports eight overlapping lookup helpers from
  `packages/core/src/lib/plugin/getBasePlugin.ts`, plus standalone Base/React
  context helpers and editor methods.
- `editor.plugin(Plugin)` already owns installed checks, descriptor, type, API,
  read, update, and store. Reverse and container helpers read private runtime
  cache state.
- `editor.getInjectProps` uniquely materializes defaults and therefore needs a
  compiler-owner move before deletion rather than a blind call-site rewrite.
- Markdown already owns a `runtime.registry`; its loose callbacks are wrappers.

Decisions and tradeoffs:
- Keep private direct compiler lookups for hot renderer/runtime code; public API
  deletion does not require routing internal hot paths through proxy portals.
- Keep `editor.plugin(name).type` only for genuine dynamic-name resolution; known
  descriptors use portal `.type`.
- Keep root projected capabilities and portal capabilities because concrete
  autocomplete and generic descriptor inference are distinct jobs.

Review fixes:
- Fixed strict portal creation in the default React element fallback; an
  unregistered compiled descriptor now reaches plain editor-level rendering.
- Bumped Plate Next doctrine to v38 with the final fingerprint and migration
  checks, then regenerated and validated all skill mirrors.
- Rejected the generated `public/r` registry artifact finding: repository
  policy forbids local registry generation or manual output edits; the owning
  source and registry-source checker are green, and CI owns artifact refresh.
- Removed DOCX plugin descriptors from cloned plugin state. Both plugin and
  standalone export now receive explicit `DocxExportOptions`, preserving
  descriptor identity without a lookup backdoor.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Unknown-node fallback test initially used schema-invalid content | 3 | Model the fallback by publishing a runtime without the descriptor while retaining a valid document | Regression test passes |
| DOCX descriptor identity was lost through cloned plugin state | 1 | Move export-kit descriptors to explicit operation options | DOCX focused tests/typecheck pass |

Verification evidence:
- `bun test` over 11 focused Core/Markdown/Table/Utils/Docx/www files: 92
  pass, 0 fail, 289 expectations.
- Affected source-first Turbo typecheck: 70/70 tasks across 14 targets, 0
  cached on the final run.
- Targeted Biome: 607 files checked, zero diagnostics; `git diff --check`
  passes. Earlier root `pnpm lint:fix` remains blocked by 219 unrelated
  pre-existing diagnostics in editor-audit/Wordgard artifacts.
- `pnpm --filter www build:source`, docs parity, registry source, app TypeScript,
  and package-integration TypeScript all pass through the final www typecheck.
- Exact rejected-symbol and rejected-filename audits return no live matches in
  packages, app source, or docs; generated/historical release output excluded.
- Full/focused barrel generation passed; private context factories are present
  only under Core internal entrypoints.
- `pnpm install` and Plate Next v38 validation pass with fingerprint
  `sha256:2b7829d44224ce517267c7dc1b44d17a6a1f95ba098b577cf6ee49a92424c653`.
- Changeset status succeeds with no minor packages.
- Browser: Plate Editor docs H1/title correct; DOCX docs H1/title and Export
  options visible; table demo renders one editable table/20 cells; zero console
  errors on all routes.

Final handoff prepared:
- Ownership and target API: Core owns `editor.plugin(Plugin)` and private
  compiler registries; Markdown owns `registry.*`; DOCX export owns explicit
  operation options.
- Public breaks and adoption: rejected lookup exports/methods/files removed;
  packages, app/tests, docs, rules, and changesets use the final surface.
- Applicable runtime/package/docs/browser decisions: compiler-normalized inject
  props, method-free consumer portal, unknown-node fallback, dynamic-only
  `getType`, and CI-owned generated registry artifacts are explicit.
- Proof and execution risks: no open runtime/type/docs/browser risk remains;
  global lint has unrelated pre-existing artifact diagnostics only.
- Execution order and user attention: implementation is complete; no follow-up
  decision is required.

Timeline:
- 2026-07-31T18:02:50.094Z Plate Plan created.
- 2026-07-31 Accepted `best-api` target materialized as one-shot execution plan.
- 2026-07-31 Hard cut, adoption, docs/release, Plate Next v38, Browser, and
  review closure completed.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Final hard cut and all applicable proof gates are complete. |
| Where am I going? | User handoff; no implementation remains. |
| What is the goal? | Remove every public parallel lookup path while preserving one exact portal and distinct dynamic-name lookup. |
| What have I learned? | Compiler registries and authoring context must stay private; explicit operation inputs preserve descriptor identity better than plugin state. |
| What have I done? | Removed the lookup family, migrated consumers/docs/releases/rules, added regressions, validated Plate Next v38, and closed tests/types/Browser/review. |

Open risks:
- None in the accepted scope. Generated registry JSON remains CI-owned by
  repository policy; the source registry checker proves its owner input.
