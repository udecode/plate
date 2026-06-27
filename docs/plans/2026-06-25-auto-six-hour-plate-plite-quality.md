# auto six hour plate plite quality

Objective:
Run a six-hour Auto Plate/Plite quality loop without committing; close each packet with proof and keep/revert/quarantine.

Goal plan:
docs/plans/2026-06-25-auto-six-hour-plate-plite-quality.md

Template:
docs/plans/templates/auto.md

Primary template:
docs/plans/templates/auto.md

Applied packs:
- none

Automation source:
- type: direct user invocation of `$auto`
- prompt / link: `[$auto] 6h (dont commit)`
- lane: shared Plate/Plite internal quality supervisor
- surface / route / package: current Plate repo; start with Plite/Core package and browser proof, then route by evidence
- invocation mode: timed autonomous loop with dynamic checkpoint supervision
- minimum runtime / deadline: at least 6 active hours; after the timer, finish the current packet before handoff
- completion threshold summary: no commit/stage/push/PR; minimum runtime elapsed; active packet verified and classified keep/revert/quarantine; final proof and handoff complete

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt requirement into this plan as checkable rows: scope, non-goals, timing, stop conditions, deliverables, final handoff sections, verification surfaces, and success criteria.
- The initial checkpoint list is only the seed. After every loop, reconcile this plan against new evidence and add, update, split, merge, retire, remove, reprioritize, or reopen checkpoints as needed.
- Do not continue into implementation until first extraction is complete or explicitly marked N/A with reason.

Timed checkpoint:
- requested duration: 6h
- semantics: keep finding quality improvements for at least six active hours; if the obvious backlog closes early, enter supervision mode instead of stopping
- initial confidence score: 74/100 based on recent Core/Plite gate work: Core gate confidence 85, Plite browser confidence 66, Plate boundary confidence 62, docs/API cohesion 70, workflow confidence 78, unknown-unknown coverage 60
- improvement loop: raise confidence by running gates, fixing real failures, deleting stale compat/weak harness where proven, and adding/reconciling checkpoints from evidence
- final score / loop closure: pending until timer elapsed and final packet is cleanly closed

Completion threshold:
- Legal completion requires at least six active hours, no commit/stage/push/PR, no dirty half-packet, all accepted patches verified or reverted/quarantined, final proof commands recorded, current-run changed list filled, review-attention/stopping-checkpoint rows filled, workflow slowdowns recorded, and this plan passing `check-complete`.
- Closure is legal only when required behavior, visual/native selection, package/API, mobile/raw-device claim width, huge-document, docs/skill repair, changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and final handoff rows are complete, explicitly deferred, or N/A with evidence, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-25-auto-six-hour-plate-plite-quality.md` passes.

Verification surface:
- Baseline and final package proof: `pnpm check:core` for Core/Plite boundary work.
- Plite daily proof when Plite behavior/browser/package surface is touched: `pnpm check:plite`.
- Focused Plite browser proof: `pnpm --filter plite test:plite-browser:chromium <file-or--grep>`.
- Source audits: `rg` over changed APIs, stale compat names, and Plite/Plate boundary helpers before broad edits.
- Docs proof if content changes: relevant docs route with Browser and docs check.
- Skill proof if `.agents/rules/**` changes: `pnpm install`, source/generated mirror audit, and agent-native review.
- Final plan proof: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-25-auto-six-hour-plate-plite-quality.md`.
- Plite package proof uses `pnpm plite:test` and `pnpm plite:typecheck`.
- Plite daily proof uses `pnpm check:plite`.
- Plite focused browser proof uses `pnpm --filter plite test:plite-browser:chromium <file-or--grep>`.
- `apps/plite` reuses `apps/www` Plite examples; never maintain a second example source tree.
- Plite release/deletion proof adds explicit closure gates such as package
  build, docs checks, benchmark target audit, and
  `pnpm check:plite:browser-matrix` when those claims are in scope.

Constraints:
- Resolve lane first: Plite, Plate, or shared editor. Use `autoclosure` for post-merge/current-tree until-clean closure.
- Release, PR, and publish work are in scope only when the prompt explicitly asks for them or the active lane requires them.
- Plite-lane proof runs from the Plate repo root against transplanted Plite packages and routes. Do not use donor-checkout proof.
- Plate-lane proof runs in the owning Plate package, app, or docs route. Plite runtime proof does not prove Plate docs, registry, plugin, or package DX.
- Behavior proof beats perf. Native/visual proof beats model-only selection.
- No hidden debounce or fake stress fixture wins.
- No broad pagination/virtualization architecture unless the prompt or a stopping checkpoint routes to `plite-plan`.
- Do not patch Plate when the run is scoped to Plite. Do not patch Plite runtime when the run is scoped to Plate docs/product unless a shared-editor owner row names that boundary.
- Use root `VISION.md` and relevant `docs/vision/*.md` for durable taste.
- Do not create compatibility aliases or runtime shims unless the checkpoint explicitly requires them.

Boundaries:
- Source of truth: root `VISION.md`, `docs/vision/common.md`, `docs/vision/plite.md`, `docs/vision/plate.md`, package source/tests, and active plan evidence.
- Allowed edit scope: current checkout only; Plate/Plite source, tests, scripts, docs, and skill source only when evidence names them.
- Browser surfaces: apps/plite Playwright lanes and Browser verification for edited content/app routes; no raw mobile claim without real device proof.
- Package/API surfaces: `packages/plite*`, `packages/core`, and downstream Plate packages only when the packet names the boundary and proof.
- Agent/skill surfaces: `.agents/rules/**` only for repeatable workflow misses; never edit generated `SKILL.md` directly.
- Docs/research surfaces: docs/plans artifacts for ledgers; content/docs only when docs/API mismatch is proven.
- Non-goals: no commit, no stage, no push, no PR, no release/publish, no broad pagination architecture, no donor-checkout proof, no compat aliases/shims as public API.

Output budget strategy:
- Use `rg`/focused commands first. Cap streamed output with `max_output_tokens`. Write broad audit data under `docs/plans/artifacts/2026-06-25-auto-six-hour-plate-plite-quality/` instead of dumping it into chat.

Blocked condition:
- Hard block only for missing credentials/device authority, an unsafe public API fork that needs user taste, a repeated environment failure after one reinstall when appropriate, or no safe packet remaining after minimum runtime and current packet closure.
- Do not block while a safe alternate checkpoint remains runnable. In timed or batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious backlog looks empty. Enter supervision mode and infer the next checkpoint from `vision`, current evidence, weak proofs, benchmark gaps, API/docs mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- lane: shared Plate/Plite
- surface: current checkout, starting from Core/Plite proof and then evidence-selected packets
- mode: timed autonomous loop, no commit
- minimum_runtime: 6h
- target_deadline: elapsed-time based; finish current packet after timer
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 0
- current_checkpoint: checkpoint-zero
- current_checkpoint_status: in_progress
- next_checkpoint: status
- goal_status: active

Current verdict:
- verdict: checkpoint-zero in progress; no implementation yet
- confidence: 74/100 initial
- next owner: auto
- keep / revert / quarantine call: not applicable before first packet
- reason: requirements and proof contract are being made explicit first

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item remains unchecked. If an item does not apply, check it and add `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold above is satisfied, final handoff evidence is recorded, and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-25-auto-six-hour-plate-plite-quality.md` passes.
- Do not create hook state for this goal. This file plus the active goal are the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | auto | complete | P0 | Copy prompt requirements and read vision before implementation. | Requirement rows complete. | updated |
| status | auto | complete | P0 | Read active plan, latest prompt, source status, and current evidence. | Current state recorded. | updated |
| gap-scan | auto | in_progress | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Gaps routed to packet owners. | updated |
| closure-handoff | autoclosure | pending | P0 when merged/current-tree work is in scope | Run until-clean closure for already-applied work. | Closure delegated or N/A. | seed |
| behavior-proof | lane proof owner | pending | P0 | Prove stable editor behavior before perf. | Focused behavior commands pass or failures routed. | seed |
| oracle-repair | lane test owner / tdd | pending | P0 | Add missing native/visual/model oracles for found gaps. | New proof fails before fix or coverage gap is explicit. | seed |
| visual-proof | Browser / Playwright | pending | P0 | Prove visible editor behavior and native selection. | Browser/screenshot/geometry evidence recorded. | seed |
| browser-helper-promotion | lane proof harness | pending | P1 | Promote repeated browser proof into reusable API/helper. | Helper added, queued, or N/A with reason. | seed |
| mobile-claim-width | auto | pending | P1 | Separate raw-device proof from viewport proof. | Raw proof command passes or scoped blocker recorded. | seed |
| huge-document-smoke | lane proof owner | pending | P1 | Smoke huge-doc correctness without broad architecture work when in scope. | Typing/Enter/paste/select-all/undo/nav/scroll proof recorded or N/A. | seed |
| perf-packet | lane perf owner | pending | P2 | Optimize only after correctness is green. | Metric target or plateau recorded. | seed |
| plate-docs-api-corpus | docs-creator / auto | complete | P1 | Public Plate docs still contained legacy `editor.tf` / `getPluginApi` / `tf.*` patterns after code hard-cut. | Active English docs stale API scans clean; `pnpm --filter www check:docs`; `pnpm --filter www typecheck`; route probe 200 for affected docs; Browser proof for `/docs/markdown` and `/docs/yjs`. | updated |
| diff-fragment-current-api | package owner / auto | complete | P1 | `packages/diff` still had a quarantined legacy `api.fragment` override cast. | Replaced with a Plite `fragment.get` query extension; focused spec, package test/typecheck/lint, core typecheck, stale-symbol audit, and `www` typecheck pass. | updated |
| docs-schema-read-corpus | docs-creator / auto | complete | P1 | Active docs/examples still referenced old helper names and direct `editor.api.isVoid/isInline` reads. | Patched docs and registry/source examples to current `state.schema.*` and diff extension names; `www` docs/type/source-mode route sanity plus Browser route proof passed. | updated |
| runtime-operations-mirror | auto / core runtime | complete | P0 | `/docs/tabbable` exposed a Plate runtime editor shape missing the promised `operations` mirror used by table selection cache. | Added React runtime `operations` mirror; core contract test, core typecheck/lint/build, table typecheck/lint/test, and source-mode route sanity passed. | added |
| base-parser-paste-route | auto / core runtime | complete | P0 | Base-editor package-integration paste tests needed current parser/insertData routing after cutting `editor.api.clipboard.insertData`. | Added base runtime parser installation, migrated package-integration helpers to current runtime commands, and proved Core/List/www tests/typechecks. | added |
| plite-empty-doc-fragment-props | auto / Plite substrate | complete | P0 | List paste oracle exposed Plite dropping first copied text-block props when inserting a multi-block fragment into a single empty document. | First block now clones the fragment node, not the empty placeholder; Plite regression, List integration, package tests, and `pnpm check:core` pass. | added |
| plite-stale-slate-api-rename | auto / Core-Plite boundary | complete | P1 | Public-ish Core/static/runtime names still used `Slate` wording after the Plite rename. | Hard-renamed stale render/runtime option names to Plite, kept upstream/historical Slate references scoped, and proved Core/List/www/check:core gates. | added |
| direct-plite-read-api-test-cleanup | auto / package tests | complete | P1 | Tests still taught direct Plite read helpers through `editor.api.node/string/nodes/isInline` after the read/update law. | Migrated the AI integration test to `editor.read`; deleted dead selection mocks; rewired suggestion mocks to fake read state directly; direct-read audit leaves only intentional custom API/host-service tests. | added |
| troubleshooting-plite-package-docs | docs-creator / auto | complete | P1 | Troubleshooting docs still showed upstream/bare Slate package commands after the Plite package rename. | Updated English/CN troubleshooting package alignment commands to `@platejs/plite*`; docs check and Browser route proof pass. | added |
| huge-document-upstream-slate-comparison | auto / docs example | complete | P1 | Huge-document comparison mounted upstream Slate but labeled the lane as Plite, and Browser proof exposed a Plate-only hook call inside the upstream pane. | Renamed the comparison engine to `upstream-slate`, fixed labels/stat columns, and scoped `useElementSelected` to Plate headings; `www` typecheck/lint, HTTP 200, and Browser route label proof pass. | added |
| plugin-docs-current-state | docs-creator / core docs | complete | P1 | Plate plugin docs and Core JSDoc still described `extendEditor` and a generic slot as legacy surfaces. | Rewrote docs/JSDoc to current escape-hatch/reserved-slot wording; docs check, Core typecheck/lint, stale phrase audit, and Browser proof pass. | added |
| core-shortcut-tx-type-boundary | auto / Core plugin resolution | complete | P1 | Core shortcut routing still used an explicit `(tx: any)` update callback. | Replaced it with a bounded dynamic shortcut transaction helper; focused shortcut tests, Core typecheck/lint, and full Core test pass. | added |
| test-tx-mock-type-boundary | auto / package tests | complete | P1 | AI/Suggestion/Media tests still normalized `update(fn: (tx: any) => void)` mocks after the tx API hard cut. | Added local mock transaction shapes and mock-call helpers; focused tests, package typecheck/lint, package tests, and targeted `tx:any` audit pass. | added |
| selected-dom-blocks-alias-cut | auto / Core static utils | complete | P1 | Core exported a deprecated `getSelectedDomBlocks` alias with tests, while `getSelectedDomFragment` is the current owner. | Deleted alias source/test/export, regenerated Core barrels, proved no consumers, and ran Core typecheck/lint/test. | added |
| static-plite-html-props-rename | auto / Core static components | complete | P2 | Static Plite node components still exported a `SlateHTMLProps` type name after the Plite rename. | Hard-renamed it to `PliteHTMLProps`, proved no `SlateHTMLProps` leftovers, and ran Core typecheck/lint. | added |
| normalize-initial-value-alias-cut | auto / Core plugin API + Plite internals | complete | P1 | Core still exposed deprecated `normalizeInitialValue` / `NormalizeInitialValue` plugin aliases and a `pipeNormalizeInitialValue` file after `transformInitialValue` became the single API. | Deleted alias types/options/runtime fallback/tests/docs, renamed the internal Plite helper to `normalizeEditorValue`, and proved focused Core tests, Core/Plite typecheck/lint/test, docs check, stale-symbol audit, and Core barrels. | added |
| node-wrapper-type-alias-cut | auto / Core plugin API | complete | P2 | Core still exported deprecated `NodeWrapperComponent*` and `NodeStaticWrapperComponent*` type aliases with no current consumers. | Deleted wrapper alias types, proved no consumers, and ran Core typecheck/lint/test plus barrels. | added |
| node-props-class-style-compat | auto / Core render components | complete | P1 | Remaining `@deprecated` source was `DeprecatedNodeProps` for render-prop `className`/`style` compatibility in Plate/Plite node components. | Removed `className/style` from render-prop types while keeping them on `PlateHTMLProps` / `PliteHTMLProps` helper component props; deprecated source audit and Core proof pass. | updated |
| runtime-extension-metadata-cleanup | auto / Core runtime metadata | complete | P2 | Runtime plugin support still used `legacy` wording/metadata for removed transform-extension packets even though the current API is `extendTx` / `extendTxGroup`. | Renamed the guard metadata to `isUnsupportedTransformExtension`, rewrote runtime/internal error messages and test names to current wording, and proved focused runtime/plugin tests plus Core typecheck/lint. | added |
| plate-static-value-hard-cut | auto / Core static + Plate React aggregator | complete | P1 | Public docs/source still treated `PlateStatic value` as a controlled alias, and route proof exposed `platejs/react` missing current Plite React hooks used by Plate UI. | Removed `PlateStatic value`, updated docs/tests/consumer, exported curated Plite React hooks/components through the Plate React aggregator, fixed render-prop `className/style` consumers, and proved Core/platejs/www plus Browser routes. | added |
| core-package-metadata-proof | auto / Core package metadata | complete | P2 | `@platejs/core` package metadata still described Core as a plugin system for Slate after the Plite boundary cut. | Updated the package description to the current Plate/Plite ownership wording and ran the full `check:core` lane. | added |
| www-plite-dev-proof-lane | auto / www dev proof | complete | P1 | The current Plite proof script and dev output directory were still named `dev:slate` and `.next-slate`, and `next.config.ts` traced obsolete Slate-to-HTML routes. | Renamed the proof script to `dev:plite`, renamed the private Plite dev output dir to `.next-plite`, removed stale trace entries, and bounded a core-html package-integration fixture that `www` typecheck exposed. | added |
| markdown-mdast-plate-vocabulary | auto / Markdown package | complete | P1 | Active Markdown package internals and docs still used `mdastToSlate`, `slateToMdast`, and `mdast-to-slate` terminology for Plate-node conversion. | Hard-renamed root conversion to `mdastToPlateNodes`, renamed the serializer helper to `plateNodesToMdast`, updated docs diagrams, regenerated barrels, and proved Markdown/docs gates. | added |
| current-docs-cn-api-and-route-cleanup | auto / docs + Markdown route | complete | P1 | Active docs, especially CN pages, still taught stale `editor.tf`, `getPluginApi`, Yjs plugin names, and one docs route exposed a current-list Markdown deserialization bug. | Cleaned active docs to current `editor.update`, `editor.api`, `state.yjs`, and `tx.yjs` surfaces; fixed Markdown list-style deserialization so `disc`/`decimal`/`todo` are metadata values, not plugin keys; docs/package/app/Browser proof pass. | added |
| registry-plite-history-link | auto / registry docs | complete | P2 | Registry component metadata still linked `History Toolbar Button` to upstream Slate history docs while the item uses Plite history hooks. | Pointed the registry doc link at `/docs/plite/libraries/plite-history`; source/docs/type checks and structured route HTML proof pass. | added |
| stale-plite-url-and-fixture-boundary | auto / source URL + package-integration fixture | complete | P2 | Current Plite-owned source/tests still had upstream Slate doc/site URLs, and the final `www` typecheck exposed another React-plugin generic-depth fixture leak. | Repointed owned Plite docs/test URLs to Plate/Plite docs, bounded the list package-integration fixture with `BasePluginInput`, and proved focused tests, Core typecheck, `www` typecheck, and stale URL scan. | added |
| upstream-slate-contract-filename | auto / Plite test corpus | complete | P2 | One Plite test file still had an ambiguous `slate-helper` filename even though its purpose is upstream Slate behavior recovery through current Plite APIs. | Renamed it to `upstream-slate-helper-loss-contract.ts`; focused test, full Plite typecheck/test/lint, and current-source filename scan pass. | added |
| plite-dom-clipboard-empty-target-contract | auto / Plite DOM clipboard contract | complete | P1 | `pnpm check:plite` exposed a stale DOM clipboard expectation for pasting a rich multi-block fragment into a single empty target block. | Aligned the DOM clipboard boundary with the Plite substrate contract: copied first text block props win over the empty placeholder; focused Plite DOM test/typecheck/test and full `pnpm check:plite` pass. | added |
| plite-richtext-keydown-command-oracle | auto / Plite React + browser oracle | complete | P1 | Full Chromium proof showed the browser row was asserting `lastCommit.command` after browser selection sync could legally supersede the core command commit. | Added a React unit oracle for caret movement preserving core `move_selection` commit metadata, then moved the browser row to editable kernel command trace ownership; focused unit/browser rows and full `pnpm check:plite` pass. | added |
| supervision-mode | auto | pending | P0 when timed runtime remains | If backlog looks empty before minimum runtime, predict next useful checkpoint from vision and evidence. | New checkpoint added/run, or hard blocker recorded. | seed |
| consolidation | auto | pending | P1 | Move accepted reusable decisions to durable docs/rules. | Durable owner updated or N/A. | seed |
| final-handoff | auto | pending | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff rows complete. | seed |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed | initial template rows | plan creation | starter topology only | pending |
| 1 | update | checkpoint-zero, status | plan requirement extraction | prompt is now copied into gates and status can start | complete |
| 2 | update | status, gap-scan | `pnpm check:core`, stale API scans | core/plite source is green; active migration docs still teach old Plate `editor.tf` surface | first packet = docs/API mismatch |
| 3 | add | www-api-migration | Browser route proof and `www` typecheck | docs route compiles the registry and exposed stale Plate API imports/usages | fix app/registry without restoring public compat aliases |
| 4 | update | www-api-migration | repeated `pnpm --filter www typecheck` frontier | app registry errors are the current highest-value Plate/Plite boundary proof | continue per-file stale API migration |
| 5 | update | www-api-migration | toolbar/select/import/export/value/markdown demo buckets cleared from `pnpm --filter www typecheck` frontier | repeated stale public-example APIs prove docs/examples need current-state migration, not compat shims | continue remaining examples/static UI buckets |
| 6 | update | www-api-migration, oracle-repair | `pnpm --filter www typecheck`, suggestion package proof, focused suggestion integration | `www` compile frontier is green; package-level runtime regression was exposed by migrated test proof | keep packets; next owner = supervision/gap scan |
| 7 | add | stale-api-literal-cleanup | focused stale API scan over `apps/www/src` and `packages` | production and test scaffolding still mentioned removed Plate APIs after compile was green | clean literals, verify with scan/typecheck/Biome |
| 8 | update | visual-proof, browser-route-proof | Browser smoke on `/docs/plite/migration` and `/examples/plite/richtext` | docs route and example route render; richtext accepts typing with native selection/focus; screenshot captured | keep proof; route next stale docs/API corpus |
| 9 | add | plate-docs-api-corpus | `rg` over `content/docs` found many old Plate docs still teaching `editor.tf` / `getPluginApi` | code/app hard-cut can be green while public docs still advertise legacy Plate runtime API | audit docs scope and patch current-state public docs, not historical archives |
| 10 | update | plate-docs-api-corpus, workflow-slowdown | active-doc stale scans, docs checks, route probes, Browser proof | docs packet found and fixed stale API docs plus stale registry item `markdown-to-slate-demo`; `/docs/markdown` went from 500 to 200 | keep packet; next owner = diff fragment current API or supervision gap scan |
| 11 | update | diff-fragment-current-api | `@platejs/diff` focused spec/test/typecheck/lint, `@platejs/core` typecheck, stale-symbol audit, `www` typecheck | legacy `api.fragment` override was not a current public API; Plite query middleware is the right owner for fragment filtering | keep packet; next owner = supervision gap scan |
| 12 | add | docs-schema-read-corpus, runtime-operations-mirror, workflow-slowdown | source-mode docs route sanity, dev-server runtime error, package proof | docs/schema cleanup exposed a real runtime-shape gap and multiple proof-command footguns | keep both packets; record Browser/dist/build slowdowns |
| 13 | update | gap-scan | package proof and route sanity after runtime mirror | active source/docs packets are green enough; minimum runtime remains | continue supervision gap scan |
| 14 | add | base-parser-paste-route, plite-empty-doc-fragment-props, workflow-slowdown | focused parser/list/html slow tests, package proof, `pnpm check:core` | package-integration paste routes exposed both missing base runtime parser wiring and a Plite empty-document fragment fast-path bug | keep both packets; continue timed supervision |
| 15 | add | plite-stale-slate-api-rename, workflow-slowdown | stale-name audit, focused HTML integration tests, `www` typecheck, Core/List proof, `pnpm check:core` | stale Slate naming remained in current Core/public-ish render/runtime contracts; `www` typecheck also exposed a deep plugin generic fixture boundary | keep rename packet; continue timed supervision |
| 16 | add | direct-plite-read-api-test-cleanup | direct-read API audit, focused package tests/typechecks/lints | stale tests and mocks still showed removed direct Plite read helpers even though production code used `editor.read` | keep cleanup; continue timed supervision |
| 17 | add | troubleshooting-plite-package-docs, workflow-slowdown | package-name docs audit, `www check:docs`, Browser proof | public troubleshooting docs still had old package names; broad scans hit generated/public/historical artifacts and needed narrowing | keep docs packet; continue timed supervision |
| 18 | add | huge-document-upstream-slate-comparison, workflow-slowdown | focused huge-document demo audit, `www` typecheck/lint, HTTP route proof, Browser label proof | comparison route mounted upstream Slate but advertised Plite; route proof also caught a Plate hook escaping into the upstream Slate pane | keep packet; continue timed supervision |
| 19 | update | docs-schema-read-corpus, review-attention | Browser proof for `/docs/examples/version-history` and `/docs/tabbable` | the previous scoped Browser limitation is now closed after Browser reconnect | remove solved review-attention item; continue timed supervision |
| 20 | add | plugin-docs-current-state, workflow-slowdown | stale legacy phrase audit, docs/JSDoc patch, `www check:docs`, Core typecheck/lint, Browser proof | docs taught legacy wording for current plugin APIs; broad legacy scan also proved the scan needed tighter current-doc/public JSDoc scope | keep packet; continue timed supervision |
| 21 | add | core-shortcut-tx-type-boundary | focused `(tx: any)` audit, shortcut tests, Core package gates | one explicit any remained in Core plugin shortcut routing; dynamic plugin keys still need a cast, but the update callback no longer widens transaction inference | keep packet; continue timed supervision |
| 22 | add | test-tx-mock-type-boundary, workflow-slowdown | targeted `tx:any` audit, package test/type/lint gates | package test mocks still taught `tx:any`; first typed attempt exposed Bun `mock()` call-signature quirks, fixed with local `callMock` helpers | keep packet; continue timed supervision |
| 23 | add | selected-dom-blocks-alias-cut, workflow-slowdown | deprecated/compat scan, consumer audit, Core gates, barrel generation | `getSelectedDomBlocks` was a public deprecated alias with no consumers except its own tests | keep hard cut; continue timed supervision |
| 24 | add | static-plite-html-props-rename | stale Slate-name audit, Core typecheck/lint | `SlateHTMLProps` survived in the current static Plite component surface as a pure stale vocabulary leak | keep hard rename; continue timed supervision |
| 25 | add | normalize-initial-value-alias-cut, workflow-slowdown | deprecated alias audit, focused Core tests, package gates, docs check | `normalizeInitialValue` was only used by Core alias tests/docs/runtime fallback and no feature package depended on it | keep hard cut; continue timed supervision |
| 26 | add | node-wrapper-type-alias-cut, node-props-class-style-compat, workflow-slowdown | deprecated source audit, consumer audit, Core gates | wrapper type aliases had no consumers; render-prop `className/style` could be cut from render props while staying available on helper component HTML props | keep both hard cuts; continue timed supervision |
| 27 | add | runtime-extension-metadata-cleanup | current-source compat/legacy scan, focused runtime/plugin tests, Core typecheck/lint | the runtime still rejected removed transform-extension packets correctly, but its flag/error/test names described the old migration state instead of current API law | keep behavior-neutral wording/metadata cleanup; continue timed supervision |
| 28 | add | plate-static-value-hard-cut, workflow-slowdown | static component docs/source audit, `www` typecheck/browser route proof | hard-cutting `PlateStatic value` exposed one actual consumer and docs route proof exposed missing Plate React aggregator exports for current Plite React hooks | keep hard cut and aggregator export; continue timed supervision |
| 29 | add | core-package-metadata-proof | package metadata audit, `pnpm check:core` | package metadata is public API/DX surface and still said Slate after the Plite rename | keep wording cleanup; continue timed supervision |
| 30 | add | www-plite-dev-proof-lane, workflow-slowdown | active config/script audit, `www` docs/typecheck, focused core-html test, live `dev:plite` proof | repeated source-mode route proof used an unnamed manual command while the official Plite script still said Slate | keep script/config cleanup; continue timed supervision |
| 31 | add | markdown-mdast-plate-vocabulary, workflow-slowdown | active Markdown docs/source audit, focused tests, package gates, docs check | package docs exposed stale Slate conversion names; first chosen replacement collided with existing type mapper | keep hard rename; continue timed supervision |
| 32 | add | current-docs-cn-api-and-route-cleanup, workflow-slowdown | active docs stale API audit, `www` docs/typecheck, Markdown package tests/typecheck, Browser route proof | CN docs and collaboration docs still taught removed APIs; Browser route proof found a real Markdown current-list plugin-key bug | keep docs cleanup and Markdown route fix; continue timed supervision |
| 33 | add | registry-plite-history-link, workflow-slowdown | source registry audit, `www` docs/typecheck, structured route HTML proof | current registry source linked Plite History to upstream Slate docs; first Browser/curl proof attempts exposed stale dev-server and huge minified HTML output footguns | keep source registry fix; continue timed supervision |
| 34 | add | stale-plite-url-and-fixture-boundary, workflow-slowdown | focused stale upstream URL audit, focused tests, Core typecheck, `www` typecheck | owned Plite source/test URLs still pointed to upstream Slate docs/site, and `www` typecheck exposed another package-integration fixture that needed an explicit base-plugin boundary | keep URL cleanup and fixture boundary; continue timed supervision until six-hour floor |
| 35 | add | upstream-slate-contract-filename, workflow-slowdown | focused naming audit, focused Plite test, Plite typecheck/test/lint | Plite test source should be clear when `Slate` is intentional upstream provenance, not old package identity | keep file rename; continue timed supervision until six-hour floor |
| 36 | add | plite-dom-clipboard-empty-target-contract, workflow-slowdown | failed `pnpm check:plite`, focused Plite DOM clipboard test/typecheck/test, full `pnpm check:plite` | full Plite gate exposed a stale DOM clipboard expectation that contradicted the current substrate contract | keep oracle repair; continue because full gate found another browser oracle failure |
| 37 | add | plite-richtext-keydown-command-oracle, workflow-slowdown | failed `pnpm check:plite`, focused React unit test, focused richtext browser row, focused code-highlighting flaky row, full `pnpm check:plite` | browser proof exposed that `lastCommit` is too narrow for keydown command metadata after browser selection sync; kernel trace owns browser event metadata | keep unit oracle plus browser-oracle correction; close timed run after final gate |

Mutation rules:
- Add a checkpoint when a new failure, missing oracle, missing metric, API smell, visual proof gap, workflow slowdown, taste gap, or owner gap appears.
- Update a checkpoint when evidence changes its scope, priority, owner, command, exit rule, or proof surface.
- Split a checkpoint when it hides multiple owners or one prompt would become too large.
- Merge checkpoints when overlap confuses routing or two rows always close together.
- Retire or remove checkpoints that are stale, superseded, irrelevant, duplicated, or contradicted by current evidence. Record the reason in the mutation ledger.
- Reopen a closed checkpoint when new evidence invalidates its proof.
- Reprioritize after every loop. The next checkpoint is chosen from current evidence, not from the original row order.
- The supervisor is not stuck on this template or the initial prompt plan. The user's latest request, `vision`, and current source evidence outrank stale plan rows.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Prompt copied: `$auto` 6h, no commit. |
| `auto` source rule read or fallback recorded | yes | Read `.agents/skills/auto/SKILL.md` before plan edits. |
| `vision` read as checkpoint zero | yes | Read root `VISION.md` plus `docs/vision/{common,plite,plate}.md`. |
| Active goal checked or created | yes | Active goal `019ef64c-34ef-7502-bd16-3794a9767879`. |
| Lane resolved | yes | Shared Plate/Plite internal quality, evidence-selected packets. |
| Invocation mode and timebox recorded | yes | Timed six-hour minimum; finish active packet after timer. |
| Dynamic checkpoint policy accepted | yes | Checkpoints may be added/updated/removed each loop from evidence. |
| Source of truth and allowed workspaces recorded | yes | `VISION.md`, docs/vision, source/tests, current checkout only. |
| Output budget strategy recorded | yes | Focused output; broad audits go to artifacts. |
| Release/PR/publish boundary recorded | yes | Explicit non-goal; no commit/stage/push/PR/release. |
| Browser proof strategy recorded | yes | Plite browser lanes and Browser proof for edited routes only. |
| Package/API proof strategy recorded | yes | `check:core`, `check:plite`, focused package/browser tests. |
| Mobile/raw-device claim-width policy recorded | yes | No raw mobile claim without real device proof. |
| Skill repair authority and source-rule boundary recorded | yes | Patch `.agents/rules/**`, run `pnpm install`; never edit generated skill mirrors. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope boundary, timing constraint, stop condition, deliverable, final handoff section, verification surface, and success criterion is copied into this plan as checkable checkpoints before implementation.
- [x] Short objective, completion threshold, verification surface, constraints, boundaries, and blocked condition are concrete.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining backlog ladder, and supervision-mode fallback are recorded.
- [x] Lane is resolved as Plite, Plate, or shared editor, with owning workspace/package/app proof named.
- [x] Checkpoint supervisor table has been reconciled at least once after the initial seed.
- [x] Post-merge/current-tree closure is routed to `autoclosure` when in scope, or marked N/A with reason. N/A: this run is an internal quality loop on the current checkout, not post-merge closure.
- [x] Each loop ends with a checkpoint mutation decision: add, update, split, merge, retire, remove, reopen, reprioritize, or no-change with reason.
- [x] Current-tree/status packet recorded before new runtime patches.
- [x] Behavior proof packet recorded for every in-scope stable editor family or explicitly skipped/deferred with reason.
- [x] Visual/native selection proof packet recorded for browser-visible selection/editing risks or explicitly scoped.
- [x] Missing oracle packets are written, kept, reverted, quarantined, or deferred with owner and proof command.
- [x] Repeated browser proof patterns are promoted to `@platejs/browser` or queued with reason. N/A: no reusable helper pattern was accepted in the current packet.
- [x] Mobile/raw-device proof is run or the claim width is explicitly limited; Playwright viewport proof is not recorded as raw-device proof. N/A: no mobile/raw-device claim in this run packet.
- [x] Huge-document correctness smoke is run or deferred with owner and reason. Deferred: not in scope for docs/Markdown route repair.
- [x] Perf packet runs only after correctness is green, or is marked N/A for this run. N/A: no perf claim in current packet.
- [x] Package/API hard cuts, aliases, exports, and docs/API consistency are audited when in scope.
- [x] Docs/vision/rule consolidation is applied when a reusable decision is accepted, or marked N/A. N/A: no new doctrine change accepted, only plan slowdown logging.
- [x] Workflow slowdowns are logged and avoidable repeats are repaired in the owner skill/script/gate.
- [x] Packet ledger contains one row per proof, bug fix, oracle, benchmark, docs, or skill packet.
- [x] Changed list is current and includes only this run.
- [x] Needs-your-attention list is ranked and capped at five items.
- [x] Stopping checkpoints are queued or marked none.
- [x] Autoreview/review gate is run for non-trivial implementation diffs or marked N/A with reason. N/A until timer floor/final packet closeout; no commit requested.
- [x] Agent-native review is run for `.agents/**`, commands, skills, hooks, or prompt/tooling changes, or marked N/A with reason. N/A: no `.agents/**` or command owner changed in this packet.
- [x] Output budget discipline is followed: broad scans are capped or written to artifacts instead of streamed; one broad list scan overflowed and is logged as workflow slowdown.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run the proof commands/artifacts named in this plan | Current packet proof recorded: Markdown package tests/typecheck, `www` docs/typecheck, focused app ESLint, and Browser route proof. |
| Dynamic checkpoint reconciliation | yes | Prove the plan was updated from evidence and not frozen to the initial seed | Added checkpoint, mutation row, packet row, evidence, timeline, and risks for current docs/Markdown route packet. |
| Lane authority proof | yes | Prove each command ran in the owning Plite/Plate/shared workspace, or record N/A | Markdown commands ran in package owner; docs/app commands ran in `apps/www` or repo root with `--filter www`; Browser proof hit `localhost:3002`. |
| Workspace authority proof | yes | Record cwd/tool for each package, docs, skill, browser, or benchmark proof | Evidence rows name package/app commands and Browser route URLs. |
| Behavior gates | scoped | Run focused stable behavior proof or record scoped defer rows | Markdown list deserialization behavior proven by `deserializeMdList.spec.tsx` and package test suite. |
| Visual/native selection proof | scoped | Record Browser/Playwright/native-selection evidence or scoped blocker | Browser route proof recorded; no native selection claim made for this docs packet. |
| Missing oracle repair | yes | Add/verify/revert/quarantine oracle packets or record owner defer | Added regression preventing bullet, ordered, and task-list style values from being resolved as plugin keys. |
| `@platejs/browser` promotion | N/A | Add/verify helper/API or record queue/defer reason | Current Browser route proof did not reveal a repeated helper-worthy pattern. |
| Mobile/raw-device claim width | N/A | Run raw-device proof or record that only scoped viewport/browser proof is available | No mobile/raw-device claim made. |
| Huge-document correctness smoke | deferred | Run focused huge-document behavior smoke or record owner defer | Not in scope for current docs/Markdown route packet; previous huge-document packet remains logged separately. |
| Package/API proof | yes | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | Stale docs API audit clean; Markdown package test/typecheck pass; `www` docs/typecheck pass. |
| Autoclosure handoff | N/A | Delegate post-merge/current-tree until-clean work to `autoclosure`, otherwise N/A | This is an internal quality loop, not post-merge closure. |
| Skill/rule sync | N/A | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | No skill/rule source changed. |
| Changed list / review attention / stopping checkpoints | yes | Fill final handoff ledgers from current packet evidence | Current changed-list/review/stopping sections are filled below and will be mirrored in final. |
| Final lint/check | yes | Run scoped lint/check or record why no code changed | Focused app ESLint exit 0 with ignored test warning; package/docs/type gates pass. |
| Workflow slowdown review | yes | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | Slowdowns logged: broad `rg`/sed overflow, app-relative ESLint command shape, Browser route proof catching runtime-only failures. |
| Agent-native review for agent/tooling changes | N/A | Load `agent-native-reviewer` and close accepted findings, or N/A | No agent/tooling changed. |
| Autoreview for non-trivial implementation changes | deferred | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | No commit requested; final handoff will recommend review focus instead of staging. |
| Goal plan complete | in-progress | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-25-auto-six-hour-plate-plite-quality.md` | Run after six-hour floor and active packet closure. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | prompt copied, vision/auto read, no-commit and six-hour semantics recorded | status |
| Status and current-state read | complete | `pnpm check:core` passed; source scan found no active `src` stale compat hits for `editor.tf`, `getPluginApi`, `slate-legacy`; docs scan found active migration stale API text | gap scan |
| Gap scan and scenario matrix | complete | Current packet selected from active docs/API audit and Browser route proof; Markdown route failure was fixed and proven | supervision gap scan |
| Behavior proof | scoped | Current packet is docs/package route repair; behavior proof is Markdown deserialization package behavior plus route render proof | supervision gap scan |
| Oracle repair | complete | Added `deserializeMdList` regression proving current list style values are not plugin keys | visual proof |
| Visual/native proof | scoped | Browser route proof for docs pages recorded; no editor selection/native claim in this packet | browser helper promotion |
| Browser helper promotion | scoped | No repeated new helper pattern accepted; route proof used existing Browser surface | mobile claim width |
| Mobile/raw-device claim width | N/A | No mobile/raw-device claim made in this packet | huge-document smoke |
| Huge-document correctness smoke | N/A | Not in scope for current docs/Markdown route packet | perf/API/docs as needed |
| Perf/API/docs/skill packets as needed | complete | Docs/API cleanup and Markdown route repair complete with proof | consolidation |
| Consolidation and review | complete | Reusable slowdown and route-proof lessons logged in this plan | final handoff |
| Final handoff and goal-plan check | pending final | Await six-hour floor and current packet closure before final response | final response |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| `/docs/markdown` | docs route with registry demo and Markdown package | Browser on `localhost:3002` | route load | h1, no load-error text, no stale API text, no recent browser errors | pass |
| Markdown list deserializer | package unit behavior | Bun package test | deserialize `-`, `1.`, `- [x]` | output list metadata and no `disc`/`decimal`/`todo` plugin lookup | pass |
| Active docs API corpus | docs MDX source | `rg` + docs build | source audit | no stale removed API terms outside migration docs | pass |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| docs-api-mismatch-1 | 1 | docs-creator / auto | Active Plite-to-Plate migration doc taught `editor.tf` after Plate API hard-cut direction. | patched `content/docs/migration/plite-to-plate*.mdx`; `pnpm --filter www check:docs`; `pnpm --filter www build:source` | docs/API proof only; no browser route proof claimed | keep | continue app compile repair |
| www-api-migration-1 | 2 | auto / Plate app | `www` docs route failed to compile because registry/app code imported old React hook names and old Plate runtime APIs. | repeated `pnpm --filter www typecheck` frontier; patched editor kits, transforms, AI menu, block draggable, table toolbar, footnote, table node, comment UI, block context menu, use-chat, basic toolbars, select/import/export, controlled/value/markdown examples, package-integration helpers | `pnpm --filter www typecheck` pass | keep | supervision/gap scan |
| diff-fragment-legacy-cut | 2 | auto / package owner | `packages/diff` still has a casted legacy `api.fragment` override while runtime APIs are being hard-cut. | `packages/diff/src/lib/withGetFragmentExcludeDiff.ts` cast used to unblock package source typecheck | no behavior proof; review debt | quarantine | convert to explicit current API/helper after `www` frontier or route to package owner |
| suggestion-inline-boundary-delete | 3 | package owner / oracle-repair | Migrating suggestion integration exposed that backward deletion after a link over-marked the previous text/link range instead of only the adjacent link character. | patched `packages/suggestion/src/lib/transforms/deleteSuggestion.ts`; focused tests listed in verification evidence | package + integration behavior proof; no browser visual proof claimed | keep | next gap scan |
| stale-api-literal-cleanup | 4 | auto / Plate app | `getPluginApi`, `getTransforms`, `editor.tf`, `api.findPath`, and `api.fragment` literals remained in app/package source after hard cut. | patched suggestion kits, registry test mocks, dev editor perf path lookup, markdown streaming comment; `rg` stale API scan; Biome affected files; `pnpm --filter www typecheck` | no browser visual proof claimed; source/type proof only | keep | next supervision/gap scan |
| browser-route-proof-1 | 5 | Browser / apps/www | `www` compile passing still needed route/browser proof for edited Plite docs/example surfaces. | started docs app on `http://localhost:3002`; Browser route smoke on `/docs/plite/migration` and `/examples/plite/richtext`; richtext click/end/type/readback; screenshot captured | docs route loads with `Migration` headings and no `editor.tf`/`getPluginApi`/`getTransforms`; richtext editable renders and accepts typed ` proof` with focus/native selection; screenshot nonblank | keep | route stale Plate docs/API corpus |
| plate-docs-api-corpus | 6 | docs-creator / auto | Active public docs still advertised removed Plate runtime names (`editor.tf`, `tf.*`, `getPluginApi`, `api.markdown`, `api.yjs`) and stale registry item `markdown-to-slate-demo`. | patched active docs under `content/docs/**`, `apps/www/src/registry/registry-examples.ts`; stale API audits; `pnpm --filter www check:docs`; `pnpm --filter www typecheck`; route probes | Browser proof: `/docs/markdown` renders `Markdown`, `serializeMd`, `deserializeMd`; `/docs/yjs` renders `Provider Boundary`, `createYjsExtension`, `tx.yjs.connect`; no app error text | keep | diff fragment current API or next gap scan |
| diff-fragment-current-api | 7 | auto / package owner | `packages/diff` used a casted legacy `api.fragment` override even though Plite fragment reads now flow through `editor.read(state => state.fragment.get())`. | deleted `withGetFragmentExcludeDiff`; added `createExcludeDiffFragmentExtension` query middleware; updated version-history example; regenerated diff barrel; commands listed in verification evidence | package behavior proof only; no browser visual proof claimed for version-history | keep | supervision gap scan |
| docs-schema-read-corpus | 8 | docs-creator / auto | Docs/examples still taught stale diff helper and direct schema methods through `editor.api.isVoid/isInline`. | patched version-history and tabbable docs/source snippets, `BaseTabbablePlugin` comments, suggestion static UI schema reads, and removed avoidable casts in version-history demo; commands listed in verification evidence | source-mode HTTP route sanity only; Browser control unavailable after REPL timeout reset | keep | runtime operations mirror |
| runtime-operations-mirror | 9 | auto / core runtime | Tabbable route crashed because table selection cache read `editor.operations.length`, but the React runtime editor shape lacked the promised `operations` mirror. | added `operations` getter to `createPlateRuntimeEditor`; added focused core contract test; cleaned table lint dead vars; commands listed in verification evidence | source-mode route sanity for `/docs/tabbable`; no Browser-native claim | keep | supervision gap scan |
| base-parser-paste-route | 10 | auto / core runtime | Base editors had parser declarations but no current `insertData` runtime route after the public clipboard facade was cut. | added `packages/core/src/internal/editor/runtimeParser.ts`; installed it from `withPlite`; migrated core-html/list/docx package-integration helpers to `getCurrentRuntimeCommands(editor).insertData`; commands listed in verification evidence | package-integration paste behavior proof; no Browser claim | keep | Plite fragment prop bug |
| plite-empty-doc-fragment-props | 11 | auto / Plite substrate | Inserting a multi-block text fragment into a single empty document kept the empty target block props for the first pasted block, dropping list metadata. | patched `packages/plite/src/transforms-text/insert-fragment-text-blocks.ts`; added `packages/plite/test/clipboard-contract.ts` regression; commands listed in verification evidence | Plite substrate + List package-integration paste proof; no Browser claim | keep | supervision gap scan |
| plite-stale-slate-api-rename | 12 | auto / Core-Plite boundary | Current Core/static/runtime files still exposed stale `SlateRender*`, `WithSlate*`, `PlateRuntimeSlate*`, `AboveSlate`, and `markdown-to-slate` names outside intentional upstream/historical references. | hard-renamed to `PliteRender*`, `WithPlite*`, `PlateRuntimePlite*`, `AbovePlite`, and `markdown-to-plite`; converted core-html slow integration fixture to base plugin imports and a bounded `BasePluginInput` type boundary; commands listed in verification evidence | package/API proof only; no Browser visual claim | keep | supervision gap scan |
| direct-plite-read-api-test-cleanup | 13 | auto / package tests | Tests still used direct Plite read helper names after public code had moved to `editor.read`, making the corpus teach the wrong API law. | patched `apps/www/src/__tests__/package-integration/ai-utils/findTextRangeInBlock.spec.tsx`, `packages/selection/src/react/utils/copySelectedBlocks.spec.tsx`, `packages/selection/src/react/hooks/useBlockSelectionNodes.ts`, and `packages/suggestion/src/lib/transforms/setSuggestionNodes.spec.ts`; commands listed in verification evidence | package/test proof only; no Browser claim | keep | supervision gap scan |
| troubleshooting-plite-package-docs | 14 | docs-creator / auto | Public troubleshooting docs still told users to inspect `slate`, `plite-dom`, and `slate-react`, which conflicts with the current `@platejs/plite*` package surface. | patched `content/docs/(guides)/troubleshooting.mdx` and `content/docs/(guides)/troubleshooting.cn.mdx`; commands listed in verification evidence | Browser proof on `/docs/troubleshooting`; docs check proof | keep | supervision gap scan |
| huge-document-upstream-slate-comparison | 15 | auto / docs example | `/docs/examples/huge-document` mounted upstream Slate while UI/stat labels claimed Plite; the upstream pane also crashed because shared heading rendering always called Plate `useElementSelected`. | patched `apps/www/src/registry/examples/huge-document-demo.tsx` and `apps/www/src/registry/examples/values/huge-document-value.tsx`; focused stale-label audit, `www` typecheck, focused ESLint, HTTP route proof, Browser label proof | Browser proof on `/docs/examples/huge-document?blocks=2&engines=upstream-slate&chunking=false`: h1 `Huge Document`, pane `Upstream Slate`, mounted-editor labels `Plate + upstream Slate` / `Upstream Slate only`, no old Plite comparison labels | keep | supervision gap scan |
| docs-schema-browser-proof-close | 16 | Browser / docs route proof | The docs/schema packet only had source-mode HTTP sanity after a Browser reset. Browser was available again, so the scoped proof gap should be closed instead of left for user review. | no source changes; Browser proof only | Browser proof: `/docs/examples/version-history` renders `Version History` + `createExcludeDiffFragmentExtension`; `/docs/tabbable` renders `Tabbable` + `state.schema.isVoid`; no app error text | keep | supervision gap scan |
| plugin-docs-current-state | 17 | docs-creator / core docs | Public Plate plugin docs and Core JSDoc still said `legacy Plite`, `legacy transform slot`, and `Reserved legacy generic slot` for current plugin API surfaces. | patched `content/docs/api/core/plate-plugin.mdx`, `content/docs/(guides)/plugin.mdx`, `content/docs/(guides)/plugin.cn.mdx`, and `packages/core/src/lib/plugin/createBasePlugin.ts`; commands listed in verification evidence | Browser proof on `/docs/plugin` and `/docs/api/core/plate-plugin`; docs/JSDoc proof only, no runtime behavior claim | keep | supervision gap scan |
| core-shortcut-tx-type-boundary | 18 | auto / Core plugin resolution | Shortcut auto-routing used `editor.update((tx: any) => ...)`, weakening the Plate tx typing story in current Core source. | patched `packages/core/src/internal/plugin/resolvePlugins.ts`; commands listed in verification evidence | focused shortcut routing tests plus full Core package proof; no Browser claim | keep | test mock tx cleanup scan |
| test-tx-mock-type-boundary | 19 | auto / package tests | AI/Suggestion/Media test fakes still typed update callbacks as `(tx: any)`, so tests taught the wrong transaction shape. | patched `packages/media/src/lib/placeholder/transforms/insertPlaceholder.spec.ts`, `packages/suggestion/src/lib/transforms/{deleteSuggestion,insertFragmentSuggestion,setSuggestionNodes}.spec.ts`, and `packages/ai/src/{lib/transforms/aiStreamSnapshot,lib/transforms/undoAI,react/ai-chat/utils/applyAISuggestions}.spec.ts`; commands listed in verification evidence | focused tests and full package tests for Media/Suggestion/AI pass; no Browser claim | keep | supervision gap scan |
| selected-dom-blocks-alias-cut | 20 | hard-cut / Core static utils | `packages/core/src/static/utils/getSelectedDomBlocks.ts` was a deprecated public alias with no current consumers. | deleted `packages/core/src/static/utils/getSelectedDomBlocks.ts`, deleted `getSelectedDomBlocks.spec.ts`, removed the barrel export in `packages/core/src/static/utils/index.ts`, ran `pnpm --filter @platejs/core brl`; commands listed in verification evidence | Core static fragment tests and full Core package tests pass; no Browser claim | keep | supervision gap scan |
| static-plite-html-props-rename | 21 | hard-cut / Core static components | `packages/core/src/static/components/plite-nodes.tsx` still exposed `SlateHTMLProps` in the current Plite component type surface. | renamed `SlateHTMLProps` to `PliteHTMLProps`; commands listed in verification evidence | Core typecheck/lint pass; no Browser claim | keep | supervision gap scan |
| normalize-initial-value-alias-cut | 22 | hard-cut / Core plugin API | Core plugin types, runtime cache, edit-only handling, docs, and tests still carried `normalizeInitialValue` as a deprecated alias for `transformInitialValue`. | removed `NormalizeInitialValue` types and `normalizeInitialValue` options/fallbacks, deleted `pipeNormalizeInitialValue.ts`, renamed the pipe spec file, removed alias-only tests/docs, and renamed Plite's internal value helper to `normalizeEditorValue`; commands listed in verification evidence | focused Core tests pass; Core/Plite typecheck/lint/test pass; docs check passes; no Browser claim | keep | supervision gap scan |
| node-wrapper-type-alias-cut | 23 | hard-cut / Core plugin API | Deprecated `NodeWrapperComponent*` and `NodeStaticWrapperComponent*` type aliases stayed exported even though current API names are `RenderNodeWrapper*` and `RenderStaticNodeWrapper*`. | deleted the alias type families from `PlatePlugin.ts` and `BasePlugin.ts`; commands listed in verification evidence | Core typecheck/lint/test pass and no consumer audit hits; no Browser claim | keep | node prop compat review |
| node-props-class-style-compat | 24 | hard-cut / Core render component types | `PlateElementProps` / `PlateTextProps` / `PlateLeafProps` and static Plite equivalents carried deprecated `className/style` render-prop fields. | removed deprecated fields from render-prop types, kept `className/style` on `PlateHTMLProps` / `PliteHTMLProps` helper component props, and proved render/injection behavior; commands listed in verification evidence | focused render/injection tests and full Core proof pass; no Browser claim | keep | supervision gap scan |
| runtime-extension-metadata-cleanup | 25 | auto / Core runtime metadata | Runtime plugin support still used `isLegacyTransform` and legacy-worded test/error strings for packets that are simply unsupported removed transform-extension metadata. | patched `createBasePlugin.ts`, `resolvePlugins.ts`, `createPlateRuntimeEditor.ts`, and `createPlateRuntimeEditor.spec.ts`; commands listed in verification evidence | focused runtime/plugin tests, stale-word scan, Core typecheck, and Core lint pass; no Browser claim | keep | supervision gap scan |
| plate-static-value-hard-cut | 26 | auto / Core static + Plate React aggregator | `PlateStatic value` duplicated editor value ownership and mutated `editor.children` during render; after removal, docs routes also exposed missing Plate React aggregator exports for Plite React hooks used by Plate UI. | patched `PlateStatic`, its memoization spec, static/API docs, `EditorStatic` consumer, render-prop `className/style` consumers, and `pliteReactHooks`; regenerated Core barrels; commands listed in verification evidence | focused static component test, stale prop audits, Core/platejs/www typechecks, Core lint, HTTP 200 probes, and Browser docs proof pass | keep | supervision gap scan |
| core-package-metadata-proof | 27 | auto / Core package metadata | `packages/core/package.json` still described Core as a plugin system for Slate after Plite became the substrate boundary. | patched the package description only; commands listed in verification evidence | `pnpm check:core` passes: Core+Plite typecheck, Core/Plite lint, Core spec batches, and Plite tests | keep | supervision gap scan |
| www-plite-dev-proof-lane | 28 | auto / www dev proof | The official Plite docs/example proof script still used stale Slate naming and did not encode the workflow we kept running manually. | patched `apps/www/package.json`, `apps/www/next.config.ts`, and `deserializeHtmlElement.slow.tsx`; commands listed in verification evidence | `www` docs/typecheck pass, focused core-html integration test passes, and `PORT=3102 pnpm --filter www dev:plite` returns Plite source-mode readiness plus `/examples/plite/richtext` 200 | keep | supervision gap scan |
| markdown-mdast-plate-vocabulary | 29 | auto / Markdown package | Markdown conversion internals/docs still named Plate-node conversion as Slate conversion. | renamed `mdastToSlate` file/export/spec to `mdastToPlateNodes`, renamed serializer local helper to `plateNodesToMdast`, updated English/CN Markdown docs diagrams, and regenerated Markdown barrels; commands listed in verification evidence | stale Slate conversion audit passes; Markdown typecheck/lint/test pass; docs check passes | keep | supervision gap scan |
| current-docs-cn-api-and-route-cleanup | 30 | auto / docs + Markdown package | Active docs still exposed removed API names and `/docs/markdown` crashed with `Plugin "disc" is not installed` because Markdown treated current list-style values as plugin keys. | patched active docs/CN collaboration/API examples, `markdown-streaming-demo`, `htmlElementToLeaf.slow.tsx`, `packages/markdown/src/lib/rules/defaultRules.ts`, and `deserializeMdList.spec.tsx`; commands listed in verification evidence | Browser proof: `/docs/markdown` h1 `Markdown`, no load error, no `Plugin "disc"` text, no stale API text, and no recent errors; Markdown package tests/typecheck and `www` docs/typecheck pass | keep | timed supervision continues until six-hour floor |
| registry-plite-history-link | 31 | auto / registry docs | `history-toolbar-button` registry metadata used upstream Slate History docs even though the UI imports `usePliteHistory`. | patched `apps/www/src/registry/registry-ui.ts`; commands listed in verification evidence | Structured route proof for `/docs/components/history-toolbar-button` returns 200, contains `/docs/plite/libraries/plite-history` / `Plite History`, and does not contain upstream Slate History docs URL | keep | timed supervision continues until six-hour floor |
| stale-plite-url-and-fixture-boundary | 32 | auto / source URL + package-integration fixture | Owned Plite source/tests still pointed to upstream Slate docs/site URLs, and `www` typecheck exposed a list package-integration fixture comparing full React plugin generics against base plugin input. | patched `packages/core/src/lib/editor/withPlite.ts`, `packages/core/src/static/serializeHtml.node-props.spec.ts`, `apps/www/src/__tests__/package-integration/ai-utils/aiCommentToRange.spec.tsx`, and `apps/www/src/__tests__/package-integration/list/ListPlugin.slow.tsx`; commands listed in verification evidence | URL/test proof plus `www` typecheck; no Browser visual claim | keep | timed supervision continues until six-hour floor |
| upstream-slate-contract-filename | 33 | auto / Plite test corpus | Plite had a current test named `slate-helper-loss-contract.ts`; the contract is still valid, but the filename blurred old Slate identity with intentional upstream provenance. | renamed to `packages/plite/test/upstream-slate-helper-loss-contract.ts`; commands listed in verification evidence | focused contract test, Plite typecheck/test/lint pass; no Browser claim | keep | timed supervision continues until six-hour floor |
| plite-dom-clipboard-empty-target-contract | 34 | auto / Plite DOM clipboard contract | Full Plite gate failed because DOM clipboard expected the empty target block type to survive where Plite substrate already preserves copied first-block props. | patched `packages/plite-dom/test/clipboard-boundary.ts`; commands listed in verification evidence | focused clipboard row, Plite DOM typecheck/test, and full `pnpm check:plite` pass | keep | browser oracle packet |
| plite-richtext-keydown-command-oracle | 35 | auto / Plite React + browser oracle | Full Chromium proof failed because `lastCommit.command` can be superseded by browser selection sync while the keydown kernel trace still owns the event command metadata. | added `packages/plite-react/test/caret-engine-contract.test.ts`; patched `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts`; commands listed in verification evidence | focused React unit oracle, focused richtext browser row, focused code-highlighting row, and full `pnpm check:plite` pass | keep | final handoff |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| `pnpm check:core` | auto | ~14s streamed; full Plite/core test output huge | expected for broad core gate | pass: typecheck, lint, Core batches, Plite tests | keep as baseline; cap future output harder |
| Browser route `/docs/migration/plite-to-plate` | Browser / www | compile timed out then server emitted large error stream | docs route imports registry client bundle | found stale app/package surface (`useFocused`, `useSelected`, `useReadOnly`, `usePliteHistory`, `editor.tf`) | repair owner = www/api migration |
| `pnpm --filter www typecheck` | auto / apps/www | repeated frontier command written to `.tmp/www-typecheck.log` | no browser yet | pass after registry, examples, and package-integration API migration | keep; app compile proof unblocks next route/browser checkpoint |
| suggestion delete after link | `@platejs/suggestion` / apps/www package integration | `bun test apps/www/src/__tests__/package-integration/suggestion-link.spec.tsx`; `pnpm --filter @platejs/suggestion test` | no browser visual proof claimed | pass: only adjacent link character is marked as remove suggestion; package suite 101 pass | keep runtime fix |
| stale Plate API literals | apps/www + packages source | `rg -n "editor\\.tf|getTransforms|getPluginApi|extendTransforms|editor\\.transforms|plugin\\.transforms|api\\.fragment|api\\.findPath|findPath\\(" apps/www/src packages ...` | no browser | pass: no matches in scanned app/package source scope | keep hard-cut cleanup |
| Plite migration docs route | `/docs/plite/migration` on www dev server | Browser route smoke at `http://localhost:3002/docs/plite/migration` | Browser | pass: title/headings render, no visible 404, no `editor.tf`/`getPluginApi`/`getTransforms`, contains `editor.update` | keep route proof |
| Plite richtext example route | `/examples/plite/richtext` on www dev server | Browser load + contenteditable click + `ControlOrMeta+End` + type ` proof` + DOM/native-selection readback + screenshot | Browser | pass: one visible editable, typed text appears, focus stays editable, screenshot captured | keep visual proof |
| Plate docs API corpus | `/docs/yjs`, `/docs/markdown`, `/docs/html`, `/docs/docx-io`, `/docs/toolbar`, `/docs/single-block`, `/docs/code-drawing`, `/docs/media` | curl route probes on port 3002 | Browser/curl | pass after fix: all listed routes return 200; `/docs/markdown` previously 500 due stale `markdown-to-slate-demo` registry dependency | keep docs packet |
| Diff fragment filtering | `@platejs/diff` | `bun test packages/diff/src/lib/createExcludeDiffFragmentExtension.spec.ts`; `pnpm --filter @platejs/diff test` | no browser | pass: selected fragment is cloned and diff metadata is stripped through Plite query middleware while source document metadata remains intact | keep current API packet |
| Docs schema/current API read cleanup | `/docs/examples/version-history`, `/docs/tabbable` | source-mode HTTP route sanity on port 3002 plus `pnpm --filter www check:docs` / `pnpm --filter www typecheck`; later Browser proof after reconnect | Browser | pass: both routes return 200 and render without app errors; version history contains `createExcludeDiffFragmentExtension`; tabbable contains `state.schema.isVoid` | keep docs packet |
| PlateStatic value hard cut | `/docs/static`, `/docs/api/core/plate-components` | focused static component test, `www` typecheck, HTTP route probes, Browser route proof on port 3002 | Browser | pass: static docs render `Static Rendering` with `PlateStatic`, no `Value Override`/`value?: Value`; Core components docs render `Plate Components` with `PlateView`, no `Controlled value alias` | keep static/API packet |
| Core package metadata proof | `@platejs/core` / `@platejs/plite` | `pnpm check:core` | no Browser | pass: Core+Plite typecheck, Core lint, Plite lint, 115 Core spec files in 12 batches, and Plite tests all pass after Core package description cleanup | keep metadata packet |
| Plite www dev proof lane | `apps/www` source-mode Plite dev | `PORT=3102 pnpm --filter www dev:plite`; curl `/api/plite/ready`; curl `/examples/plite/richtext` | curl/live dev server | pass: dev server starts on port 3102, readiness returns `{"devSource":true,"plite":true}`, and `/examples/plite/richtext` returns 200 | keep script/config packet |
| Markdown mdast conversion vocabulary | `@platejs/markdown`, Markdown docs | stale conversion-name audit, focused tests, package typecheck/lint/test, docs check | no Browser | pass: no `mdastToSlate`/`slateToMdast`/`mdast-to-slate`/`slate-to-mdast` leftovers in active Markdown/docs scan; Markdown suite 234 pass | keep hard rename |
| Plate runtime operation mirror | `@platejs/core`, `@platejs/table`, `/docs/tabbable` | `bun test packages/core/src/react/editor/createPlateRuntimeEditor.spec.ts --test-name-pattern 'live operation queue'`; `pnpm --filter @platejs/core typecheck`; `pnpm --filter @platejs/core lint`; `pnpm --filter @platejs/core build`; `pnpm --filter @platejs/table typecheck`; `pnpm --filter @platejs/table lint`; `pnpm --filter @platejs/table test` | source-mode route sanity only | pass: runtime editor exposes live Plite operation queue; table suite 219 pass; `/docs/tabbable` no longer returns error text in source mode | keep runtime bridge packet |
| Base editor parser route | `@platejs/core`, apps/www package-integration | `bun test ./packages/core/src/lib/plugins/ParserPlugin.spec.ts`; `bun test ./apps/www/src/__tests__/package-integration/core-html/HtmlPlugin.slow.tsx`; `pnpm --filter @platejs/core test`; `pnpm --filter www typecheck` | no Browser claim | pass: base editor insertData routes parser transform/deserialize/transformFragment/preInsert and core HTML package-integration stays green | keep runtime parser packet |
| List paste fragment props | `@platejs/plite`, `@platejs/list`, apps/www package-integration | `bun test ./packages/plite/test/clipboard-contract.ts --grep "empty document block"`; `bun test ./apps/www/src/__tests__/package-integration/list/ListPlugin.slow.tsx`; `pnpm --filter @platejs/list test`; `pnpm --filter @platejs/plite test`; `pnpm check:core` | no Browser claim | pass: copied list props survive first block paste into empty editor; `check:core` passed after the fix | keep substrate packet |
| Plite stale Slate API rename | Core/static runtime and docs icon source | stale-name `rg`; focused core-html slow tests; `pnpm --filter www typecheck`; Core/List package gates; `pnpm check:core` | no Browser claim | pass: stale current-source names are gone in scanned scope, HTML integration behavior is unchanged, Core/List/type/doc gates pass | keep boundary rename packet |
| Direct Plite read API test cleanup | AI package-integration, Suggestion tests, Selection tests | focused Bun tests; package typecheck/lint/test gates; direct-read API audit | no Browser claim | pass: stale direct read helper usage removed from tests/mocks; remaining `editor.api.get*` hits are intentional custom API/host service tests | keep test corpus cleanup |
| Troubleshooting package-name docs | `/docs/troubleshooting` | `pnpm --filter www check:docs`; Browser route proof | Browser | pass: route renders `Troubleshooting`, current `@platejs/plite-dom` / `@platejs/plite-react` names are visible, old Slate command pattern is absent | keep docs packet |
| Huge-document upstream comparison | `/docs/examples/huge-document?blocks=2&engines=upstream-slate&chunking=false` | `pnpm --filter www typecheck`; focused ESLint; HTTP 200; Browser DOM read | Browser | pass: upstream pane renders without Plate hook-context error; mounted-editor selector and stats/pane labels say upstream Slate, not Plite | keep example packet |
| Plugin docs current-state wording | `/docs/plugin`, `/docs/api/core/plate-plugin` | `pnpm --filter www check:docs`; Core typecheck/lint; stale phrase audit | Browser | pass: docs render without app errors, teach low-level enhancer/reserved slot wording, and no longer show `legacy Plite` / `legacy transform slot` in these pages | keep docs packet |
| Core shortcut tx type boundary | `packages/core/src/internal/plugin/resolvePlugins.ts` | focused Bun shortcut tests; Core typecheck/lint/test | no Browser | pass: plugin-specific tx shortcuts still route, plugin-specific API shortcuts still route, and Core suite stays green | keep Core packet |
| Package test tx mock boundaries | AI/Suggestion/Media tests | focused Bun tests; package typecheck/lint/test; targeted `tx:any` audit | no Browser | pass: touched test mocks use local transaction shapes instead of `tx:any`, and package suites remain green | keep test cleanup packet |
| Core static DOM fragment alias cut | `packages/core/src/static/utils` | consumer audit; focused static tests; Core typecheck/lint/test; Core `brl` | no Browser | pass: deprecated alias is gone, current `getSelectedDomFragment` tests still pass, Core suite stays green | keep hard-cut packet |
| Static Plite HTML props rename | `packages/core/src/static/components/plite-nodes.tsx` | stale-name audit; Core typecheck/lint | no Browser | pass: `SlateHTMLProps` is gone and Core still type/lint checks | keep hard-cut packet |
| Normalize initial value alias cut | Core plugin API + Plite internal value init | stale-symbol audit; focused Core tests; Core/Plite typecheck/lint/test; `www` docs check; Core `brl` | no Browser | pass: `normalizeInitialValue`, `NormalizeInitialValue`, and `pipeNormalizeInitialValue` are gone from current source/docs; `transformInitialValue` remains the single plugin API | keep hard-cut packet |
| Node wrapper type alias cut | Core plugin API | consumer audit; Core typecheck/lint/test; Core `brl` | no Browser | pass: wrapper alias type names are gone from current source/docs and Core package proof stays green | keep hard-cut packet |
| Node render-prop deprecated field cut | Core React/static node components | deprecated-source audit; focused render/injection tests; Core typecheck/lint/test | no Browser | pass: no current `@deprecated` source remains in scanned Core/Plite/browser source, while helper component className/style behavior remains covered | keep hard-cut packet |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| `pnpm --filter www typecheck` frontier | auto / apps/www | about 5-14s per run | acceptable repeated proof while app has many stale API buckets | exact file-error frontier in `.tmp/www-typecheck.log` | keep as focused loop; no workflow repair yet |
| `/examples/plite/richtext` click/type | DOM readback after Browser typing | collapsed native selection, empty selected text | active element is the editable; anchor node text ends with typed ` proof`; editable rect `960x160` | Browser screenshot bytes `44220`, nonblank route image captured | keep |

Browser helper promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| pending | pending | pending | pending | pending |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| pending | pending | pending | pending | pending |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| pending | pending | pending | pending | pending |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| repeated full `www` typecheck frontier | auto / apps/www | ~5-11s per run | many stale API buckets, but no narrower reliable changed-file typecheck lane for registry import graph yet | per-file frontier reduction in `.tmp/www-typecheck.log` | keep during compile closure; consider a future script that groups frontier by stale API pattern |
| `pnpm exec prettier --write ...` | auto / command shape | <1s | Prettier is not installed in this workspace; formatting owner is Biome/package lint. | command failed before touching files | keep as one-off miss; use package lint / `pnpm lint:fix` instead |
| broad Bun package-integration command | auto / test command | <1s | Root Bun command with many `.slow.tsx` paths only ran 2 files / 5 tests, so it was not a valid broad proof. | output proved weak command shape | record as workflow miss; rely on `www` typecheck plus focused runnable test files |
| broad stale-name scan | auto / source audit | <1s but huge output | scan included docs/plans historical artifacts and streamed 380+ lines / truncation | proved scope mistake, little useful evidence | repaired by narrowing follow-up scan to `apps/www/src packages` and exact stale API pattern |
| direct registry UI spec command | auto / test command | <1s | direct Bun import/mocking path resolves package exports differently and failed before exercising patched code | command-shape failures in AI/media/suggestion tests | do not use as packet proof; use `www` typecheck plus known runnable focused tests |
| `pnpm --filter www lint` | www lint script | ~9s | app lint script scans generated `.source`/`.next-plite` and parses many TS files incorrectly | global command failed with 99 parse errors unrelated to packet | use `pnpm exec biome check` on affected files; record lint script as workflow debt |
| stale route smoke | Browser / docs route | <4s | first Browser target used old nested migration URL, which correctly 404s after docs IA cleanup | `/docs/plite/migration/plite-to-plate` returned title `404`; current route `/docs/plite/migration` passed | update route memory in this plan; use current `content/docs/plite/migration.mdx` path |
| route probe after docs patch | docs route proof | ~9s | `/docs/markdown` returned 500 even though `check:docs` and `www typecheck` passed; route proof found stale registry dependency | dev server stack: `Dependency markdown-to-slate-demo not found`; fixed docs + registry source to `markdown-to-plite-demo`; route now 200 | keep Browser/curl route proof as required docs packet gate |
| `rg` lookahead audit without PCRE2 | source audit command shape | <1s | Rust regex does not support lookahead | command failed before evidence; retried with `rg --pcre2` | record command-shape miss; use `--pcre2` for lookahead audits |
| Browser REPL timeout reset | Browser / node_repl | ~60s | a Browser route proof timed out and reset the Node REPL, removing the injected `agent` global | Browser control became unavailable; source-mode HTTP sanity and server logs were used instead | record as scoped proof limitation; do not claim fresh Browser visual proof for this packet |
| mixed source/dist docs dev server | apps/www dev config | ~2 min | `next dev` without `PLATE_WWW_DEV_SOURCE=1` switches to package `dist` aliases when dist exists; after `@platejs/core` build, nested dist imports failed to resolve `@platejs/core` | module-not-found stream for `@platejs/core`, `@platejs/core/react`, `@platejs/core/static`; source-mode restart fixed route sanity | use `PLATE_WWW_DEV_SOURCE=1` for current-source docs proof; consider owner repair if repeated |
| package build/test race | auto / command scheduling | <1s false red | ran `@platejs/table test` in parallel with `@platejs/core build`; Bun imported package dist while Core dist was being rewritten | transient 42-file table failure; serial rerun after build passed 219 tests | never parallelize package build with tests importing its dist graph |
| Bun path filter footgun | auto / command shape | <1s | `bun test packages/plite/test/clipboard-contract.ts` did not treat the file as a path without `./` | command reported no matching test files; rerun with `./packages/...` passed | always use `./` for focused Bun file paths |
| source/dist mismatch in package-integration tests | auto / test command | <5s false red | apps/www package-integration tests imported Core source but Core source imported built `@platejs/plite` package output until Plite was rebuilt | List paste stayed red until `pnpm --filter @platejs/plite build`; then the exact integration passed | prefer source-first package-integration setup; rebuild only when a test intentionally resolves package exports |
| broad transformData scan overflow | auto / source audit | <1s but truncated | broad `rg transformData` over Core/packages streamed hundreds of irrelevant lines | output truncated and slowed diagnosis | use capped owner-specific scans or write artifacts before broad audits |
| package build/test race during rename proof | auto / command scheduling | <5s false red | ran `@platejs/core build` in parallel with Core/List tests; tests import `packages/plate/dist`, so the dist graph was briefly inconsistent | Core/List tests failed with missing `@platejs/core` from `packages/plate/dist`; serial reruns passed | do not parallelize package builds with tests that import built package graphs |
| TypeScript stack-depth in package-integration plugin array | www package-integration | ~2 failed `www` typecheck reruns | `createBaseEditor` with a large inline configured plugin array forced excessive plugin generic comparison in the package-integration TS project | focused behavior stayed green; explicit `BasePluginInput` boundary made `www` typecheck pass | keep boundary in slow integration fixture; do not use `any` or React plugins in base-editor proof |
| mock tuple inference in suggestion spec | auto / test cleanup | one failed package typecheck | fake `nodes()` state returned loose nested arrays until typed as node-entry tuples | `@platejs/suggestion` typecheck passed after tuple annotations | keep exact tuple typing in mocks that emulate Plite read state |
| broad Slate package-name scan | auto / source audit | huge truncated output | scan included generated `apps/www/public/r/**`, old plans, historical migration docs, and intentional upstream comparison code | concrete current hit was only troubleshooting docs plus intentional huge-document upstream comparison deps | narrow future package-name scans to active docs/source paths and exclude generated public route JSON and `docs/plans/**` |
| Browser stale error tab | Browser / docs route proof | one failed navigation | prior Browser tab was stuck on Chrome's generated connection-error data page and Browser policy refused navigation from that page | fresh tab loaded `/docs/troubleshooting` and proof passed | use a fresh Browser tab after connection-refused pages |
| broad huge-document scan overflow | auto / source audit | output-budget miss before packet | broad huge-document search over app/package/benchmark roots streamed too much and triggered compaction pressure | useful owner file was only `apps/www/src/registry/examples/huge-document-demo.tsx` plus its value factory | start from exact owner files; use `rg -l` or capped file lists before broad example scans |
| Browser stale route error cache | Browser / docs example proof | one timed-out navigation and one cached 500 | first proof hit the real hook-context bug, then the dev route cached the 500 until a fresh query/load after patch | HTTP 500 became 200; Browser proof passed on cache-busted URL | use cache-busted route or reload after fixing Next dev prerender errors |
| broad legacy wording scan | auto / docs/API audit | huge noisy output | scan mixed current docs/JSDoc with tests, changelog, generated examples, and intentionally historical compatibility text | useful current-doc/JSDoc hits were `content/docs/api/core/plate-plugin.mdx`, `content/docs/(guides)/plugin*.mdx`, and `createBasePlugin.ts` | split future legacy-word audits into public-docs/JSDoc scope first, then tests/history only if the packet owns them |
| Bun mock call signature in typed test fakes | auto / test cleanup | one failed package typecheck round | Bun `mock()` values are runtime-callable but their TS type has no call signature, so assigning or calling them through precise transaction types failed | package tests were already green; typecheck failures pointed at direct mock assignment/calls | wrap mocks through local `callMock` helpers instead of widening transaction callbacks to `any` |
| atomic patch signature guess | auto / alias cut | one failed patch attempt | guessed the Plite helper signature while editing multiple files in one patch | no files changed; inspected exact helper lines and reapplied precisely | inspect exact signatures before multi-file patching |
| Core lint after test deletion | auto / alias cut | one failed lint round | deleting alias-only tests left blank lines before closing braces | behavior/type proof stayed green; manual formatting patch fixed lint | rerun package lint after test deletion, even when tests pass |
| barrel/test race during deprecated-field proof | auto / Core proof | one interrupted test run | ran Core test while `brl` touched generated component barrels, causing transient ENOENT on `src/static/components/index.ts` | interrupted the bad run, formatted files, and reran Core test serially after `brl` completed | never run `brl` in parallel with package tests |
| unquoted docs path and backtick scan | auto / source audit | two failed scans | zsh treated `content/docs/(guides)` as a glob qualifier, and a double-quoted pattern with backticks executed `editor.children` as shell command | no source changes from either failed scan | quote paths with parentheses and use `rg -F` / single quotes for markdown inline-code scans |
| Browser data-error tab and dev-server crash | Browser / apps/www dev proof | one blocked navigation plus server restart | Browser was on a Chrome `data:` error page and refused navigation; the source-mode Next dev server later crashed with `Map maximum size exceeded` after stale route error logs | fresh source-mode server and fresh Browser tab produced valid route proof | use fresh Browser tabs after connection-refused pages; restart source-mode dev server after Next dev log/state corruption |
| route proof exposed missing Plate React exports | apps/www route proof | one failed route proof round | docs routes import the registry index, so missing `platejs/react` exports only appeared in live route proof after package/API hard cuts | `www` typecheck later reproduced and passed after aggregator export fix | keep route proof as a required API/docs packet gate |
| Plite dev script port argument | auto / command shape | one failed proof command | `pnpm --filter www dev:plite -- -p 3102` passed `-p` as a project directory to Next | no source change from failed command; `PORT=3102 pnpm --filter www dev:plite` started the server correctly | use `PORT=<port>` for this package script |
| core-html fixture plugin generic depth | apps/www package-integration | one `www` typecheck failure | a base-editor HTML fixture passed React plugin generics directly, triggering excessive TypeScript comparison depth | focused integration behavior already passed; bounding plugin inputs as `BasePluginInput` made `www` typecheck pass | keep package-integration generic boundaries explicit |
| list fixture plugin generic depth | apps/www package-integration | one `www` typecheck failure | a base-editor list fixture passed React plugin generics directly, triggering the same excessive TypeScript comparison depth as the earlier HTML fixture | focused integration behavior already passed; bounding React plugins as `BasePluginInput` made `www` typecheck pass | keep package-integration generic boundaries explicit |
| Markdown converter name collision | auto / Markdown package | one failed package typecheck | `mdastToPlate` was already the public mdast-type-to-Plate-key mapper, so using the same name for root conversion created an ambiguous export | root conversion became `mdastToPlateNodes`; serializer helper became `plateNodesToMdast` | avoid reusing mapper names for root/node conversion helpers |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | migrated multiple registry/app call sites from old hook names, `editor.tf`, `getPluginApi`, and `getTransforms` to current hooks, `editor.read`, `editor.update`, `editor.api.*`, and tx groups; fixed suggestion delete-after-link loop to stop after the target character; removed stale `api.findPath` fallback from dev editor perf route; narrowed `isEqualTags` to read-only structural editor capability; replaced diff legacy `api.fragment` override with a Plite fragment query extension; added the React runtime `operations` mirror promised by the Plate editor shape; removed dead table helper variables; added base-editor parser insertData routing; fixed Plite multi-block fragment insertion into a single empty document so first copied block props survive; hard-renamed stale current-source `Slate*` runtime/render option names to `Plite*` equivalents; removed stale direct Plite read helper usage from package-integration/test scaffolding; replaced Core shortcut routing's explicit `(tx: any)` callback with a bounded dynamic transaction helper; deleted deprecated `getSelectedDomBlocks` in favor of current `getSelectedDomFragment`; renamed static Plite component `SlateHTMLProps` to `PliteHTMLProps`; removed the Core `normalizeInitialValue` plugin API alias in favor of `transformInitialValue` only; removed deprecated `NodeWrapperComponent*` and `NodeStaticWrapperComponent*` type aliases; removed deprecated `className/style` render-prop type fields while keeping helper component HTML props; renamed unsupported runtime transform-extension metadata away from `legacy` wording; removed `PlateStatic value` and exposed curated Plite React hooks/components through `platejs/react`; updated `@platejs/core` package metadata from stale Slate wording to the current Plate/Plite boundary; renamed the www Plite proof lane from `dev:slate`/`.next-slate` to `dev:plite`/`.next-plite` and removed obsolete Slate-to-HTML trace entries; renamed active Markdown mdast conversion helpers/docs from Slate conversion vocabulary to Plate conversion vocabulary; repointed owned Plite source/test URLs away from upstream Slate docs/site URLs; renamed the old-helper recovery test to explicit upstream Slate provenance |
| tests/oracles/browser proof | focused `bun test apps/www/src/registry/components/editor/transforms.spec.ts` passed earlier; `www` typecheck passes; suggestion package tests/typecheck/lint pass; focused suggestion-link integration passes; stale API literal audit passes; affected files Biome-clean; Browser route proof passes for `/docs/plite/migration` and `/examples/plite/richtext` including click/type/screenshot; diff fragment extension spec/package suite pass; core runtime operation-mirror spec passes; table typecheck/lint/test pass; Browser docs route proof passes for `/docs/examples/version-history` and `/docs/tabbable`; parser/list/core-html package-integration paste tests pass; stale `Slate` current-source name audit passes; Core/List package proof and `pnpm check:core` pass; AI/Suggestion/Selection focused tests and package gates pass after direct-read cleanup; Browser proof passes for `/docs/troubleshooting`; Browser proof passes for the huge-document upstream Slate comparison route; Media/Suggestion/AI package tests and type/lint gates pass after tx mock cleanup; runtime/plugin metadata focused tests plus Core typecheck/lint pass; PlateStatic focused test, Core/platejs/www typechecks, Core lint, HTTP route probes, and Browser docs proof pass; stale upstream URL source scan passes; list package-integration fixture proof and `www` typecheck pass after `BasePluginInput` boundary repair; upstream Slate-helper recovery contract, Plite typecheck, Plite full test suite, and Plite lint pass after the explicit filename rename |
| benchmarks/metrics/targets | pending |
| examples/docs | updated Plite-to-Plate migration docs; migrated controlled/value/markdown conversion examples to current `editor.update`/`tx.value.replace` and Markdown API helper patterns; cleaned active Plate docs from `editor.tf`, `tf.*`, `getPluginApi`, stale Markdown/Yjs API names; replaced stale markdown demo registry item with `markdown-to-plite-demo`; rewrote Yjs collaboration docs around app-owned providers and `createYjsExtension`; updated version-history/tabbable docs and source comments to current diff/schema APIs; updated troubleshooting package alignment commands to `@platejs/plite*`; fixed the huge-document comparison demo to label and query upstream Slate honestly instead of calling it Plite; rewrote plugin docs/JSDoc from legacy wording to current low-level enhancer/reserved-slot wording; removed `PlateStatic value` docs/examples and kept static content ownership on `createBaseEditor({ value })`; repointed Plite performance/source test links to Plate/Plite docs |
| skills/workflow | pending |
| reverted/quarantined packets | removed `.tmp/inspect-suggestion-link.tsx` scratch probe; retired `packages/diff` legacy fragment quarantine after current API replacement; Browser visual proof for the latest docs/schema packet is scoped, not claimed, because Browser control was unavailable after REPL reset |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Mixed source/dist dev proof footgun | Building one package can make `apps/www` dev switch to partial dist aliases unless source mode is forced. | `apps/www/next.config.ts`, workflow slowdown row `mixed source/dist docs dev server` | accept current workaround; repair config/script if this repeats |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| none-yet | N/A | No user-only decision currently blocks safe work. | Safe `www` migration remains runnable. | none | continue app compile repair | continue | `pnpm --filter www typecheck` frontier |

Findings:
- `www` typecheck was the best boundary oracle for this packet: docs routes import registry UI/examples, so app typecheck exposed stale Plate API usage that package-local proof missed.
- Table and footnote packages already expose clean plugin API/tx groups; stale app code was the issue.
- Comment nested-editor flows need explicit `tx.value.replace` plus `api.dom.focus`/edge selection; do not restore public `tf` helpers for that.
- Suggestion delete-after-link needed a runtime loop stop when the target point is reached. The exact `tx.nodes.set(..., split: true)` range was not the bug; continuing the loop after a split was.
- `www` compile green was not enough: stale API literals still existed in production/test/dev route source. A literal audit is a useful hard-cut gate after API migrations.
- Browser route proof caught one stale mental route (`/docs/plite/migration/plite-to-plate`) but the current docs IA is `/docs/plite/migration`, which renders and teaches the current `editor.update` shape.
- Public docs outside Plite did contain many old Plate `editor.tf`/`getPluginApi`/`tf.*` examples. The active English current-doc corpus is now clean; historical migration archives and most CN docs are scoped separately.
- Active public docs API corpus is now clean for old Plate runtime names in English current docs. The route probe found a stronger issue than static checks: stale markdown registry dependency made `/docs/markdown` 500 until docs and registry source were aligned.
- `packages/diff` fragment filtering belongs in Plite query middleware, not an `api.fragment` Plate override. The current extension keeps the behavior while aligning with `editor.read(state => state.fragment.get())`.

Decisions and tradeoffs:
- Keep app-local typed accessors/capability helpers when a registry UI file consumes plugin API/tx groups; do not reintroduce global `getPluginApi`, `getTransforms`, or `editor.tf`.
- Prefer selecting by path/id helper (`usePath`, `selectBlockById`) over resurrecting `editor.api.findPath(element)`.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| None yet | 0 | | |
| `pnpm exec prettier --write ...` not available | 1 | use package lint / Biome owner | `pnpm --filter @platejs/suggestion lint` passed |
| broad root Bun command over `.slow.tsx` paths ran only 2 files | 1 | use `www` typecheck plus focused runnable tests | `pnpm --filter www typecheck` and focused package/integration tests passed |
| broad docs/source stale-name scan streamed huge historical output | 1 | narrow scans to active source or write artifacts first | follow-up app/package stale API literal scan passed |
| direct registry UI spec command failed at module import/mocking layer | 1 | avoid treating those files as direct proof until runner shape is repaired | `www` typecheck used instead |
| `pnpm --filter www lint` globally fails on generated/TS parser config | 1 | use Biome affected-file check for this packet; fix lint script in a separate workflow packet if selected | affected-file Biome check passed after fixes |
| old Plite migration route 404 | 1 | locate current route from `content/docs/plite/migration.mdx` and proof that path | `/docs/plite/migration` Browser proof passed |
| Browser route proof timed out and reset `node_repl` | 1 | record Browser proof as scoped/unavailable and use source-mode HTTP/server sanity only for this packet | Browser visual proof not claimed for latest packet |
| mixed `apps/www` source/dist aliases after package build | 1 | restart dev server with `PLATE_WWW_DEV_SOURCE=1` for current-source route sanity | source-mode routes returned 200 and server logs were clean |
| `@platejs/table test` run in parallel with `@platejs/core build` | 1 | rerun table test serially after build | serial `pnpm --filter @platejs/table test` passed 219 tests |

Verification evidence:
- `pnpm check:core` -> pass before `www` migration.
- `pnpm --filter www check:docs` -> pass after docs API packet.
- `pnpm --filter www build:source` -> pass after docs API packet.
- `bun test apps/www/src/registry/components/editor/transforms.spec.ts` -> 4 pass after transforms API migration.
- `bun test apps/www/src/__tests__/package-integration/suggestion-link.spec.tsx` -> 3 pass after suggestion boundary fix.
- `bun test packages/suggestion/src/lib/transforms/deleteSuggestion.spec.ts packages/suggestion/src/lib/transforms/setSuggestionNodes.spec.ts` -> 5 pass.
- `pnpm --filter @platejs/suggestion test` -> 101 pass.
- `pnpm --filter @platejs/suggestion typecheck` -> pass.
- `pnpm --filter @platejs/suggestion lint` -> pass.
- `pnpm --filter www typecheck` -> pass.
- `rg -n "editor\\.tf|getTransforms|getPluginApi|extendTransforms|editor\\.transforms|plugin\\.transforms|api\\.fragment|api\\.findPath|findPath\\(" apps/www/src packages --glob '*.{ts,tsx}' --glob '!**/dist/**' --glob '!**/.next/**' --glob '!**/node_modules/**'` -> no matches.
- `pnpm exec biome check --write <affected files>` -> pass after formatting two files.
- `pnpm --filter www lint` -> fail due generated/TS parser configuration unrelated to touched packet; logged as workflow slowdown, not product regression proof.
- Browser `http://localhost:3002/docs/plite/migration` -> pass: `Migration` page renders, no visible 404, no `editor.tf` / `getPluginApi` / `getTransforms`, contains `editor.update`.
- Browser `http://localhost:3002/examples/plite/richtext` -> pass: one visible contenteditable, `ControlOrMeta+End` + typed ` proof` lands in editor, focus remains editable, native selection is collapsed, screenshot captured.
- `rg -n "editor\\.tf|getPluginApi|getTransforms|extendTransforms|editor\\.transforms|plugin\\.transforms|api\\.findPath|api\\.fragment" content/docs --glob '*.mdx' --glob '!**/*.cn.mdx' --glob '!content/docs/migration/v48.mdx' --glob '!content/docs/migration/index.mdx'` -> no matches.
- `rg -n "\\btf\\.|api\\.markdown|api\\.yjs" content/docs --glob '*.mdx' --glob '!**/*.cn.mdx' --glob '!content/docs/migration/v48.mdx' --glob '!content/docs/migration/index.mdx'` -> no matches.
- `rg -n "markdown-to-slate|markdown-to-Plate|editor\\.tf|getPluginApi|getTransforms|\\btf\\." content/docs apps/www/src/registry/registry-examples.ts --glob '*.mdx' --glob '*.ts' --glob '!**/*.cn.mdx' --glob '!content/docs/migration/v48.mdx' --glob '!content/docs/migration/index.mdx'` -> no matches.
- `pnpm --filter www check:docs` -> pass after docs corpus packet.
- `pnpm --filter www typecheck` -> pass after docs corpus packet.
- curl route probe on port 3002 -> pass: `/docs/yjs`, `/docs/markdown`, `/docs/html`, `/docs/docx-io`, `/docs/toolbar`, `/docs/single-block`, `/docs/code-drawing`, `/docs/media` all return 200.
- Browser `http://localhost:3002/docs/markdown` -> pass: h1 `Markdown`, no app error text, includes `serializeMd` and `deserializeMd`.
- Browser `http://localhost:3002/docs/yjs` -> pass: h1 `Collaboration`, no app error text, includes `Provider Boundary`, `createYjsExtension`, and `tx.yjs.connect`.
- `bun test packages/diff/src/lib/createExcludeDiffFragmentExtension.spec.ts` -> 1 pass.
- `pnpm --filter @platejs/diff brl` -> pass.
- `pnpm --filter @platejs/diff typecheck` -> pass.
- `pnpm --filter @platejs/diff test` -> 62 pass.
- `pnpm --filter @platejs/diff lint` -> pass.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `rg -n "PluginContextApi|withGetFragmentExcludeDiff|api\\.fragment|\\.overrideEditor\\(withGetFragmentExcludeDiff\\)" packages/core/src/lib/plugin packages/core/src/react/plugin packages/diff apps/www/src/registry/examples/version-history-demo.tsx -g '*.{ts,tsx}'` -> no matches.
- `pnpm --filter www check:docs` -> pass after docs schema read cleanup.
- `pnpm --filter www typecheck` -> pass after docs schema read cleanup.
- `pnpm --filter @platejs/tabbable typecheck` -> pass.
- `pnpm --filter @platejs/tabbable lint` -> pass.
- source audit over touched docs/source for `withGetFragmentExcludeDiff`, `api.isVoid`, `api.isInline`, `editor.api.isVoid`, `editor.api.isInline` -> no matches.
- source-mode HTTP sanity with `PLATE_WWW_DYNAMIC_DOCS=1 PLATE_WWW_DEV_SOURCE=1` on port 3002 -> `/docs/examples/version-history` 200 with `createExcludeDiffFragmentExtension`; `/docs/tabbable` 200 with `state.schema.isVoid`; no load-error text.
- `bun test packages/core/src/react/editor/createPlateRuntimeEditor.spec.ts --test-name-pattern 'live operation queue'` -> 1 pass.
- `bun test packages/core/src/react/editor/createPlateRuntimeEditor.spec.ts` -> 102 pass.
- `pnpm --filter @platejs/core typecheck` -> pass after runtime operation mirror.
- `pnpm --filter @platejs/core lint` -> pass after formatting.
- `pnpm --filter @platejs/core build` -> pass after runtime operation mirror.
- `pnpm --filter @platejs/table typecheck` -> pass.
- `pnpm --filter @platejs/table lint` -> pass after dead variable cleanup.
- `pnpm --filter @platejs/table test` -> pass serially, 219 pass.
- `bun test ./packages/core/src/lib/plugins/ParserPlugin.spec.ts` -> 4 pass.
- `bun test ./apps/www/src/__tests__/package-integration/core-html/HtmlPlugin.slow.tsx` -> 7 pass.
- `bun test ./apps/www/src/__tests__/package-integration/list/ListPlugin.slow.tsx` -> 2 pass.
- `bun test ./packages/plite/test/clipboard-contract.ts --grep "empty document block"` -> 2 pass, 34 filtered.
- `bun test packages/list/src/lib/BaseListPlugin.spec.tsx` -> 3 pass.
- `pnpm --filter @platejs/plite build` -> pass.
- `pnpm --filter @platejs/plite typecheck` -> pass.
- `pnpm --filter @platejs/core typecheck` -> pass.
- `pnpm --filter @platejs/list typecheck` -> pass.
- `pnpm --filter www typecheck` -> pass.
- `pnpm --filter @platejs/plite test` -> 1007 pass, 85 skip.
- `pnpm --filter @platejs/list test` -> 104 pass.
- `pnpm --filter @platejs/core test` -> 759 pass, 0 fail; emitted existing duplicate-instance/DOM-coverage warnings.
- `pnpm --filter @platejs/plite lint` -> pass.
- `pnpm --filter @platejs/core lint` -> pass after formatting `runtimeParser.ts`.
- `pnpm --filter @platejs/list lint` -> pass.
- `pnpm check:core` -> pass after parser/list packets.
- `rg -n 'markdown-to-slate|slate-to-html|data-slate|x-slate|SlateRender|PlateRuntimeSlate|WithSlate' apps/www/src packages/core/src packages/list/src content/docs/plite --glob '*.{ts,tsx,mdx,md,json}' --glob '!apps/www/src/generated/**' --glob '!apps/www/src/registry/changelog/**' --glob '!**/CHANGELOG.md' --glob '!**/dist/**' --glob '!**/.next/**' --glob '!**/node_modules/**'` -> no matches.
- `bun test ./apps/www/src/__tests__/package-integration/core-html/deserializeHtml.slow.tsx` -> 5 pass after base plugin import migration.
- `bun test ./apps/www/src/__tests__/package-integration/core-html/HtmlPlugin.slow.tsx` -> 7 pass after package-integration plugin type-boundary cleanup.
- `pnpm --filter www typecheck` -> pass after stale-name rename packet.
- `pnpm --filter @platejs/core typecheck` -> pass after stale-name rename packet.
- `pnpm --filter @platejs/list typecheck` -> pass after stale-name rename packet.
- `pnpm --filter @platejs/core lint` -> pass after stale-name rename packet.
- `pnpm --filter @platejs/list lint` -> pass after stale-name rename packet.
- `pnpm --filter @platejs/core test` -> 759 pass after serial rerun.
- `pnpm --filter @platejs/list test` -> 104 pass after serial rerun.
- `pnpm --filter @platejs/core build` -> pass.
- `pnpm check:core` -> pass after stale-name rename packet.
- `bun test ./apps/www/src/__tests__/package-integration/ai-utils/findTextRangeInBlock.spec.tsx` -> 6 pass.
- `bun test ./packages/selection/src/react/utils/copySelectedBlocks.spec.tsx` -> 3 pass.
- `bun test ./packages/suggestion/src/lib/transforms/setSuggestionNodes.spec.ts` -> 2 pass.
- `pnpm --filter @platejs/selection typecheck` -> pass.
- `pnpm --filter @platejs/suggestion typecheck` -> pass.
- `pnpm --filter @platejs/ai typecheck` -> pass.
- `pnpm --filter www typecheck` -> pass after AI integration direct-read cleanup.
- `pnpm --filter @platejs/suggestion test` -> 101 pass.
- `pnpm --filter @platejs/suggestion lint` -> pass after formatting.
- `pnpm --filter @platejs/selection test` -> 102 pass.
- `pnpm --filter @platejs/selection lint` -> pass after dead hook-call cleanup.
- `pnpm --filter @platejs/ai lint` -> pass.
- `pnpm --filter @platejs/ai test` -> 64 pass.
- `rg -n 'editor\\.api\\.(above|after|before|edges|end|fragment|get|hasBlocks|hasInlines|hasTexts|isBlock|isEdge|isEmpty|isEnd|isInline|isStart|isVoid|levels|marks|next|node|nodes|parent|path|point|positions|previous|range|string|start|void)' packages apps/www/src --glob '*.{ts,tsx}' --glob '!**/dist/**' --glob '!**/node_modules/**'` -> remaining hits only in custom API/host service tests: `getTotal`, `getFragment`, `getVariant/getTrigger`.
- `pnpm --filter www check:docs` -> pass after troubleshooting docs package-name cleanup.
- `rg -n 'npm ls .*slate|pnpm why .*slate|\\bslate-react\\b|\\bplite-dom\\b|\\bplite-react\\b' content/docs/(guides)/troubleshooting*.mdx` -> only current `@platejs/plite-dom` / `@platejs/plite-react` names remain.
- Browser `http://localhost:3002/docs/troubleshooting` -> pass: h1 `Troubleshooting`, no app error, current package names visible, old Slate command pattern absent.
- `rg -n "EngineKind|MountedEngines|'slate'|\"slate\"|statistics\\.slate|Plite only|Plate \\+ Plite|engine === 'slate'|includes\\('slate'\\)|value=\"slate\"" apps/www/src/registry/examples/huge-document-demo.tsx apps/www/src/registry/examples/values/huge-document-value.tsx` -> only intentional upstream Slate imports and current type names remain.
- `pnpm --filter www typecheck` -> pass after huge-document comparison packet.
- `pnpm exec eslint src/registry/examples/huge-document-demo.tsx src/registry/examples/values/huge-document-value.tsx` from `apps/www` -> pass after adding the `engine` hook dependency.
- `curl -I --max-time 30 'http://localhost:3002/docs/examples/huge-document?blocks=2&engines=upstream-slate&chunking=false&_proof=2'` -> 200 after Plate hook-context fix.
- Browser `http://localhost:3002/docs/examples/huge-document?blocks=2&engines=upstream-slate&chunking=false&_proof=3` -> pass: h1 `Huge Document`, pane `Upstream Slate`, mounted-editor select value `upstream-slate`, labels `Plate + upstream Slate` / `Upstream Slate only`, no `Plite only` / `Plate + Plite` label text.
- Browser `http://localhost:3002/docs/examples/version-history?_proof=browser-schema-1` -> pass: h1 `Version History`, no app error, contains `createExcludeDiffFragmentExtension`.
- Browser `http://localhost:3002/docs/tabbable?_proof=browser-schema-1` -> pass: h1 `Tabbable`, no app error, contains `state.schema.isVoid`.
- `rg -n "legacy Plite|legacy transform slot|Reserved legacy generic slot|extendEditor.*legacy|Example: Integrating a legacy" content/docs packages/core/src/lib/plugin/createBasePlugin.ts --glob '*.{ts,tsx,mdx}'` -> no matches.
- `pnpm --filter www check:docs` -> pass after plugin docs current-state wording.
- `pnpm --filter @platejs/core typecheck` -> pass after `createBasePlugin` JSDoc wording.
- `pnpm --filter @platejs/core lint` -> pass after `createBasePlugin` JSDoc wording.
- Browser `http://localhost:3002/docs/plugin?_proof=extend-editor-current` -> pass: h1 `Plugin Configuration`, contains `low-level editor enhancer` and `editor.update`, no `legacy Plite` or `legacy transform slot`.
- Browser `http://localhost:3002/docs/api/core/plate-plugin?_proof=extend-editor-current` -> pass: h1 `Plate Plugin`, contains `Low-level escape hatch` and `withYjs`, no `legacy Plite` or `Example: Integrating a legacy`.
- `rg -n "editor\\.update\\(\\(tx: any\\)|\\(tx: any\\)" packages/core/src packages --glob '*.{ts,tsx}' --glob '!**/dist/**'` -> no Core source hits after shortcut packet; remaining hits are AI/Suggestion/Media test mocks.
- `bun test ./packages/core/src/internal/plugin/resolvePlugins.spec.tsx --test-name-pattern "shortcut handler"` -> 2 pass.
- `pnpm --filter @platejs/core typecheck` -> pass after shortcut tx type-boundary packet.
- `pnpm --filter @platejs/core lint` -> pass after shortcut tx type-boundary packet.
- `pnpm --filter @platejs/core test` -> 759 pass after shortcut tx type-boundary packet; existing duplicate-instance/DOM-coverage warnings only.
- `rg -n "editor\\.update\\(\\(tx: any\\)|update: (mock\\()?\\(fn: \\(tx: any\\) => void\\)|update: \\(fn: \\(tx: any\\) => void\\)|\\(tx: any\\)" packages/core/src packages/media/src packages/suggestion/src packages/ai/src --glob '*.{ts,tsx}' --glob '!**/dist/**'` -> no matches after test tx mock cleanup.
- `bun test ./packages/media/src/lib/placeholder/transforms/insertPlaceholder.spec.ts ./packages/suggestion/src/lib/transforms/insertFragmentSuggestion.spec.ts ./packages/suggestion/src/lib/transforms/setSuggestionNodes.spec.ts ./packages/suggestion/src/lib/transforms/deleteSuggestion.spec.ts ./packages/ai/src/react/ai-chat/utils/applyAISuggestions.spec.ts ./packages/ai/src/lib/transforms/aiStreamSnapshot.spec.ts ./packages/ai/src/lib/transforms/undoAI.spec.ts` -> 22 pass.
- `pnpm --filter @platejs/media typecheck` -> pass after tx mock cleanup.
- `pnpm --filter @platejs/suggestion typecheck` -> pass after tx mock cleanup.
- `pnpm --filter @platejs/ai typecheck` -> pass after tx mock cleanup.
- `pnpm --filter @platejs/media lint` -> pass after tx mock cleanup.
- `pnpm --filter @platejs/suggestion lint` -> pass after tx mock cleanup.
- `pnpm --filter @platejs/ai lint` -> pass after tx mock cleanup.
- `pnpm --filter @platejs/media test` -> 95 pass after tx mock cleanup.
- `pnpm --filter @platejs/suggestion test` -> 101 pass after tx mock cleanup.
- `pnpm --filter @platejs/ai test` -> 64 pass after tx mock cleanup.
- `rg -n "SlateHTMLProps" packages/core/src packages/plite* apps/www/src content/docs --glob '*.{ts,tsx,mdx}' --glob '!**/dist/**' --glob '!**/.next/**'` -> no matches after static Plite component type rename.
- `pnpm --filter @platejs/core typecheck` -> pass after `PliteHTMLProps` rename.
- `pnpm --filter @platejs/core lint` -> pass after `PliteHTMLProps` rename.
- `rg -n "\\b(NormalizeInitialValue|normalizeInitialValue|pipeNormalizeInitialValue)\\b|legacy normalizeInitialValue|legacy editor methods" packages/core/src packages/plite/src packages/plite-react/src packages/plite-dom/src apps/www/src content/docs --glob '*.{ts,tsx,mdx}' --glob '!**/dist/**' --glob '!**/.next/**' --glob '!**/node_modules/**' --glob '!content/docs/migration/**'` -> no matches after alias cut.
- `bun test ./packages/core/src/internal/plugin/pipeTransformInitialValue.spec.tsx ./packages/core/src/internal/plugin/isEditOnlyDisabled.spec.ts ./packages/core/src/react/plugin/createPlatePlugin.spec.ts ./packages/core/src/internal/plugin/resolvePlugins.spec.tsx ./packages/core/src/lib/editor/withPlite.spec.ts` -> 79 pass after alias cut.
- `pnpm --filter @platejs/core typecheck` -> pass after alias cut.
- `pnpm --filter @platejs/plite typecheck` -> pass after `normalizeEditorValue` rename.
- `pnpm --filter @platejs/plite lint` -> pass after `normalizeEditorValue` rename.
- `pnpm --filter www check:docs` -> pass after API docs alias cut.
- `pnpm --filter @platejs/plite test` -> 1007 pass, 85 skip after `normalizeEditorValue` rename.
- `pnpm --filter @platejs/core test` -> 739 pass after alias tests were removed; existing duplicate-instance/DOM-coverage warnings only.
- `pnpm --filter @platejs/core lint` -> pass after formatting two alias-test files.
- `pnpm --filter @platejs/core brl` -> pass after deleting `pipeNormalizeInitialValue.ts`.
- `rg -n "\\b(NodeWrapperComponent|NodeWrapperComponentProps|NodeWrapperComponentReturnType|NodeStaticWrapperComponent|NodeStaticWrapperComponentProps|NodeStaticWrapperComponentReturnType)\\b" packages apps/www/src content/docs --glob '*.{ts,tsx,mdx}' --glob '!**/dist/**' --glob '!**/.next/**' --glob '!**/node_modules/**' --glob '!content/docs/migration/**'` -> no matches after wrapper alias cut.
- `pnpm --filter @platejs/core typecheck` -> pass after wrapper alias cut.
- `pnpm --filter @platejs/core lint` -> pass after wrapper alias cut.
- `pnpm --filter @platejs/core test` -> 739 pass after wrapper alias cut; existing duplicate-instance/DOM-coverage warnings only.
- `pnpm --filter @platejs/core brl` -> pass after wrapper alias cut.
- `rg -n "@deprecated|Deprecated|deprecated|DeprecatedNodeProps" packages/core/src packages/plite/src packages/plite-react/src packages/plite-dom/src packages/browser/src --glob '*.{ts,tsx}' --glob '!**/dist/**'` -> no matches after node render-prop deprecated field cut.
- `bun test ./packages/core/src/react/components/plate-nodes.spec.tsx ./packages/core/src/react/utils/getRenderNodeProps.spec.ts ./packages/core/src/react/utils/pipeRenderElement.spec.tsx ./packages/core/src/internal/plugin/pluginInjectNodeProps.spec.ts` -> 32 pass after node render-prop deprecated field cut.
- `pnpm --filter @platejs/core typecheck` -> pass after node render-prop deprecated field cut.
- `pnpm --filter @platejs/core lint` -> pass after node render-prop deprecated field cut.
- `pnpm --filter @platejs/core test` -> 739 pass after node render-prop deprecated field cut; existing duplicate-instance/DOM-coverage warnings only.
- `rg -n "isLegacyTransform|legacy editor transforms|legacy api mutation|legacy Plate history|legacy Plate React enhancer|legacy transform metadata|legacy Plite facade|extends editor api/transforms" packages/core/src --glob '*.{ts,tsx}' --glob '!**/dist/**'` -> no matches after runtime metadata cleanup.
- `rg -n "\\blegacy\\b|\\bcompat\\b|compatibility|alias|aliases|shim|old API|old Plate|old Slate|@deprecated|Deprecated|deprecated" packages/core/src packages/plite/src packages/plite-react/src packages/plite-dom/src packages/browser/src --glob '*.{ts,tsx}' --glob '!**/dist/**'` -> only intentional React legacy-event-pooling URL and browser `compat-alias-hard-cut-contract` proof id remain.
- `bun test ./packages/core/src/react/editor/createPlateRuntimeEditor.spec.ts ./packages/core/src/internal/plugin/resolvePlugins.spec.tsx ./packages/core/src/lib/plugin/createBasePlugin.spec.ts` -> 155 pass after runtime metadata cleanup.
- `pnpm --filter @platejs/core typecheck` -> pass after runtime metadata cleanup.
- `pnpm --filter @platejs/core lint` -> pass after runtime metadata cleanup.
- `pnpm check:core` -> pass after `@platejs/core` package description cleanup: Core+Plite typecheck, Core lint, Plite lint, 115 Core spec files in 12 batches, and Plite tests.
- `rg -n "dev:slate|\\.next-slate|/blocks/slate-to-html|/view/slate-to-html|/docs/examples/plite-to-html" package.json apps/www/package.json apps/www/next.config.ts apps/www/src content --glob '!apps/www/public/**' --glob '!apps/www/.next*/**' --glob '!**/node_modules/**' --glob '!**/dist/**'` -> no active-surface matches after www Plite dev proof cleanup.
- `pnpm --filter www check:docs` -> pass after www Plite dev proof cleanup.
- `bun test ./apps/www/src/__tests__/package-integration/core-html/deserializeHtmlElement.slow.tsx` -> 8 pass after fixture plugin generic boundary.
- `pnpm exec biome check apps/www/package.json apps/www/next.config.ts apps/www/src/__tests__/package-integration/core-html/deserializeHtmlElement.slow.tsx` -> pass.
- `pnpm --filter www typecheck` -> pass after fixture plugin generic boundary.
- `PORT=3102 pnpm --filter www dev:plite` -> starts Next dev on port 3102 with webpack, `PLATE_WWW_PLITE=1`, and `PLATE_WWW_DEV_SOURCE=1`.
- `curl -sS --max-time 20 http://localhost:3102/api/plite/ready` -> `{"devSource":true,"plite":true}`.
- `curl -I --max-time 20 http://localhost:3102/examples/plite/richtext` -> 200.
- `rg -n "mdastToSlate|slateToMdast|mdast-to-slate|slate-to-mdast" packages/markdown apps/www/src content/docs --glob '*.{ts,tsx,md,mdx,json}' --glob '!apps/www/public/**' --glob '!**/dist/**' --glob '!**/.next/**' --glob '!**/node_modules/**'` -> no matches after Markdown conversion vocabulary hard rename.
- `pnpm --filter @platejs/markdown brl` -> pass after `mdastToPlateNodes` file rename.
- `bun test ./packages/markdown/src/lib/deserializer/mdastToPlateNodes.spec.ts ./packages/markdown/src/lib/deserializer/deserializeMd.spec.ts ./packages/markdown/src/lib/serializer/serializeMd.spec.ts` -> 15 pass.
- `pnpm --filter @platejs/markdown typecheck` -> pass after converter/helper name collision repair.
- `pnpm --filter @platejs/markdown lint` -> pass after converter/helper name collision repair.
- `pnpm --filter @platejs/markdown test` -> 234 pass after final helper rename.
- `pnpm --filter www check:docs` -> pass after Markdown docs diagram rename.
- `rg -n 'editor\.tf|getPluginApi|extendTransforms|editor\.transforms|plugin\.transforms|api\.findPath|api\.fragment|YjsPlugin|editor\.api\.yjs|docs\.plite-yjs\.dev' content/docs --glob '*.mdx' --glob '!content/docs/migration/**'` -> no matches after current docs/CN cleanup.
- Browser `http://localhost:3002/docs/ai?_proof=ai-route-fixed-1` -> pass after `markdown-streaming-demo` empty-value repair: h1 `AI`, no load error, no stale API text, `editor.api.aiChat.submit` visible.
- Browser `http://localhost:3002/docs/markdown?_proof=markdown-list-style-fix-2` -> pass after Markdown list-style fix: h1 `Markdown`, no load error, no `Plugin "disc"` text, no stale API text, and no recent browser errors.
- `bun test ./apps/www/src/__tests__/package-integration/core-html/htmlElementToLeaf.slow.tsx` -> 3 pass after bounded base plugin fixture type repair.
- `bun test packages/markdown/src/lib/deserializer/deserializeMdList.spec.tsx` -> 5 pass after adding the no-style-plugin-lookup regression.
- `pnpm --filter @platejs/markdown test` -> 235 pass after current-list style fix.
- `pnpm --filter @platejs/markdown typecheck` -> pass after typing list-style metadata as string.
- `pnpm --filter www check:docs` -> pass after current docs/CN cleanup.
- `pnpm --filter www typecheck` -> pass after docs route repair and fixture typing.
- `pnpm exec eslint src/registry/examples/markdown-to-plite-demo.tsx src/registry/examples/markdown-streaming-demo.tsx src/__tests__/package-integration/core-html/htmlElementToLeaf.slow.tsx` from `apps/www` -> exit 0; one ignored test-file warning only.
- `rg -n "docs\\.slatejs\\.org/libraries/slate-history|Plate History|Plite History|/docs/plite/libraries/plite-history" apps/www/src/registry/registry-ui.ts apps/www/src/__registry__/index.tsx --glob '*.{ts,tsx}'` -> source registry points to `/docs/plite/libraries/plite-history`; generated `__registry__` still has old URL and is intentionally not hand-edited.
- `pnpm --filter www check:docs` -> pass after registry history docs link source change.
- `pnpm --filter www typecheck` -> pass after registry history docs link source change; registry source check passed.
- `pnpm exec eslint src/registry/registry-ui.ts` from `apps/www` -> exit 0 with ignored-file warning because no matching ESLint config applies to that source path.
- Structured route proof for `http://localhost:3002/docs/components/history-toolbar-button?_proof=plite-history-link-node-1` -> status 200, contains `History Toolbar Button`, `/docs/plite/libraries/plite-history`, and `Plite History`, and does not contain `docs.slatejs.org/libraries/slate-history`.
- `bun test ./packages/core/src/static/serializeHtml.node-props.spec.ts ./apps/www/src/__tests__/package-integration/ai-utils/aiCommentToRange.spec.tsx` -> 3 pass after Plite URL cleanup.
- `rg -n 'https://slatejs\\.org|docs\\.slatejs\\.org' packages/core/src/lib/editor/withPlite.ts packages/core/src/static/serializeHtml.node-props.spec.ts apps/www/src/__tests__/package-integration/ai-utils/aiCommentToRange.spec.tsx` -> no matches.
- `pnpm --filter @platejs/core typecheck` -> pass after Plite URL cleanup.
- `bun test ./apps/www/src/__tests__/package-integration/list/ListPlugin.slow.tsx` -> 2 pass after list fixture `BasePluginInput` boundary repair.
- `pnpm --filter www typecheck` -> pass after list fixture `BasePluginInput` boundary repair.
- `rg -n 'https://slatejs\\.org|docs\\.slatejs\\.org' apps/www/src packages/core/src --glob '*.{ts,tsx}' --glob '!apps/www/src/__registry__/**' --glob '!apps/www/src/generated/**' --glob '!apps/www/src/registry/changelog/**'` -> no matches in owned current source/test roots.
- `rg -n 'slate-helper-loss-contract' packages/plite apps/www/src packages/core/src content/docs/plite --glob '*.{ts,tsx,md,mdx,json}' --glob '!**/dist/**' --glob '!**/.next/**' --glob '!**/node_modules/**'` -> no matches in current source/docs roots after file rename.
- `cd packages/plite && bun test ./test/upstream-slate-helper-loss-contract.ts` -> 15 pass after explicit upstream Slate provenance rename.
- `pnpm --filter @platejs/plite typecheck` -> pass after test file rename.
- `pnpm --filter @platejs/plite test` -> 1007 pass, 85 skip, 0 fail after test file rename.
- `pnpm --filter @platejs/plite lint` -> pass after test file rename.
- First closure `pnpm check:plite` -> failed in `packages/plite-dom/test/clipboard-boundary.ts` because the DOM clipboard row expected an empty target `block-quote` to survive where current Plite substrate preserves the copied first paragraph props.
- `cd packages/plite-dom && bun test --preload ../../config/plite-source-test-setup.ts ./test/clipboard-boundary.ts --test-name-pattern 'copied first text block'` -> 1 pass after DOM clipboard expectation repair.
- `pnpm --filter @platejs/plite-dom typecheck` -> pass after DOM clipboard expectation repair.
- `pnpm --filter @platejs/plite-dom test` -> 130 pass, 0 fail after DOM clipboard expectation repair.
- Second closure `pnpm check:plite` -> failed in `apps/plite/tests/plite-browser/donor/examples/richtext.test.ts` because `lastCommit.command` can be superseded by browser selection sync; same run also had a code-highlighting click timeout that passed on retry and later focused proof.
- `cd packages/plite-react && bun test:vitest test/caret-engine-contract.test.ts` -> 1 pass after adding the caret movement core commit metadata oracle.
- `pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/examples/richtext.test.ts -g 'records editable command metadata'` -> 1 pass after moving the browser row to kernel command trace ownership.
- `pnpm --filter plite test:plite-browser:chromium tests/plite-browser/donor/examples/code-highlighting.test.ts -g 'converts a selected paragraph into a code block with code lines'` -> 1 pass; the earlier full-run timeout did not reproduce.
- Final `pnpm check:plite` -> pass: Plite package typecheck, package tests, `@platejs/browser` tests, main Chromium browser proof `587 passed / 7 skipped`, and serialized browser slices `3 passed`, `45 passed`, `46 passed / 1 skipped`.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-25-auto-six-hour-plate-plite-quality.md`
- Lane: shared Plate/Plite internal quality supervisor.
- Surface and route/package: active docs/CN docs, `apps/www` docs routes, `@platejs/markdown`, `packages/core`, Plite/Plite DOM/Plite React/browser proof, and `apps/www` package-integration fixtures.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: timed 6h minimum; active packet finished after timer; latest packet loop 37.
- Behavior gates and visual proof: Markdown list deserialization package proof plus Browser route proof for `/docs/ai` and `/docs/markdown`; Plite DOM clipboard proof; Plite React caret command unit proof; Plite richtext/code-highlighting Chromium focused proof; full `pnpm check:plite` browser proof.
- Primary metric baseline/latest/best and stop reason: no perf metric in the late packets; stopped because six-hour floor elapsed and final Plite closure gate passed.
- Bugs fixed and oracles added: fixed AI demo empty initial value, current-list Markdown `disc` plugin lookup, core-html fixture typing, stale Plite DOM clipboard expectation, and stale richtext browser command metadata oracle; added no-style-plugin-lookup regression and caret-movement core commit metadata unit oracle.
- Benchmark/skill/docs repairs: docs/CN cleanup to current API surfaces; no benchmark or skill source changed.
- Workflow slowdowns and repairs: broad scan overflow, app-relative ESLint path, Browser route proof catching runtime-only bugs, `check:plite` late full-gate failure/retry cost, and Playwright click timeout flake are recorded.
- Changed list: docs API cleanup; `markdown-streaming-demo`; `htmlElementToLeaf.slow.tsx`; Markdown list deserializer/spec; registry history docs link; stale Plite URLs; list fixture type boundary; upstream Slate-helper contract filename; Plite DOM clipboard expectation; Plite React caret command oracle; richtext browser trace assertion; this plan.
- Needs your attention: review large CN doc rewrites, Markdown current-list deserialization semantics, and the browser-oracle decision that keydown command metadata belongs to kernel trace while core commit metadata is covered by a React unit contract.
- Stopping checkpoints to unblock: none blocking; remaining broad behavior/mobile/perf lanes are scoped out unless re-entered by future `auto`.
- Accepted deferrals and residual risks: no raw mobile/native-selection/perf claims; broad `www lint` remains unsuitable as a gate.
- Next owner: `auto` timed supervision until minimum runtime, then final handoff.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final packet `plite-richtext-keydown-command-oracle` is kept with focused proof and full `pnpm check:plite` green. |
| Where am I going? | Close the timed goal; no commit/stage/push/PR requested. |
| What is the goal? | Run a six-hour Auto Plate/Plite quality loop without committing; close each packet with proof and keep/revert/quarantine. |
| What have I learned? | Browser proof matters for docs and editor oracles: type/docs checks missed route crashes, and full Chromium proof caught a stale command metadata assertion that unit tests alone did not expose. |
| What have I done? | See Timeline and packet ledger. |
| What changed in the checkpoint plan? | See Checkpoint mutation ledger. |

Timeline:
- 2026-06-25T23:31:57.113Z Goal plan created.
- 2026-06-26T00:10Z-00:45Z Continued `www` API migration; cleaned footnote, table-node, and comment buckets from the typecheck frontier.
- 2026-06-26T00:45Z-01:02Z Continued `www` API migration; cleaned block context, use-chat, basic toolbar, select/import/export, controlled/value, and markdown conversion buckets from the typecheck frontier.
- 2026-06-26T01:02Z-01:25Z Closed `www` typecheck frontier; fixed suggestion delete-after-link boundary over-marking; verified with focused integration, package tests/typecheck/lint, and `www` typecheck.
- 2026-06-26T01:25Z-01:45Z Removed remaining stale API literals from active app/package source; affected files Biome-clean; `www` typecheck and stale API audit pass.
- 2026-06-26T01:45Z-01:55Z Started `apps/www` on port 3002; Browser-proofed `/docs/plite/migration` and `/examples/plite/richtext` including richtext focus/type/screenshot; added stale Plate docs/API corpus checkpoint.
- 2026-06-26T01:55Z-02:20Z Cleaned active Plate docs API corpus, fixed stale markdown registry dependency, proved docs/source parity, `www` typecheck, route 200 probes, and Browser smoke for `/docs/markdown` and `/docs/yjs`.
- 2026-06-26T02:20Z-02:40Z Replaced `packages/diff` legacy `api.fragment` override with a Plite `fragment.get` query extension; focused diff/core/www proof passed.
- 2026-06-26T02:40Z-03:20Z Cleaned docs/schema API reads, exposed and fixed missing React runtime `operations` mirror, cleaned table lint dead variables, proved core/table packages and source-mode docs routes.
- 2026-06-26T03:20Z-03:45Z Added base-editor parser insertData routing, migrated stale package-integration paste helpers, fixed Plite empty-document multi-block fragment prop loss, and proved with focused package-integration tests plus `pnpm check:core`.
- 2026-06-26T03:45Z-04:20Z Hard-renamed stale current-source Slate wording in Core/static/runtime/public-ish names to Plite, migrated the all-plugin HTML integration fixture to base plugin imports, capped TS plugin recursion with `BasePluginInput`, and proved with `www`, Core/List, and `check:core` gates.
- 2026-06-26T04:20Z-04:45Z Cleaned stale direct Plite read helper usage from AI package-integration, Selection mocks, and Suggestion fake read state; proved with focused tests, package typecheck/lint/test gates, and a direct-read audit.
- 2026-06-26T04:45Z-05:05Z Cleaned troubleshooting docs package-name commands from upstream/bare Slate names to `@platejs/plite*`; proved with docs check and Browser route proof.
- 2026-06-26T05:05Z-05:30Z Fixed huge-document comparison route labels and a Plate-only hook leak into the upstream Slate pane; proved with `www` typecheck, focused lint, HTTP 200, and Browser label proof.
- 2026-06-26T05:30Z-05:35Z Closed the earlier docs/schema Browser proof gap for version-history and tabbable routes after reconnecting Browser.
- 2026-06-26T05:35Z-05:50Z Rewrote Plate plugin docs/JSDoc from legacy wording to current low-level enhancer/reserved-slot wording; proved with docs check, Core typecheck/lint, audit, and Browser route proof.
- 2026-06-26T05:50Z-06:05Z Removed the explicit Core shortcut-routing `(tx: any)` update callback; proved focused shortcut routing and full Core package tests.
- 2026-06-26T06:05Z-06:25Z Removed explicit `tx:any` update callback signatures from AI/Suggestion/Media test mocks; proved focused tests, package typecheck/lint, package tests, and targeted audit.
- 2026-06-26T06:25Z-06:40Z Renamed unsupported runtime transform-extension metadata away from `legacy` wording; proved with focused runtime/plugin tests, stale-word scans, and Core typecheck/lint.
- 2026-06-26T06:40Z-06:55Z Removed stale Slate wording from `@platejs/core` package metadata; proved with `pnpm check:core`.
- 2026-06-26T06:55Z-07:25Z Renamed www Plite proof lane from `dev:slate`/`.next-slate` to `dev:plite`/`.next-plite`, removed obsolete HTML trace entries, bounded a core-html fixture generic, and proved docs/typecheck/focused test/live dev readiness.
- 2026-06-26T07:25Z-07:45Z Hard-renamed Markdown mdast conversion internals/docs from Slate vocabulary to Plate vocabulary; resolved public mapper name collision and proved Markdown package/docs gates.
- 2026-06-26T07:45Z-08:05Z Cleaned active docs/CN API references, repaired `markdown-streaming-demo` empty initial value, fixed `htmlElementToLeaf` fixture typing, and fixed Markdown current-list deserialization so list-style values are not resolved as plugins; proved with package tests/typecheck, `www` docs/typecheck, and Browser route proof for `/docs/ai` and `/docs/markdown`.
- 2026-06-26T08:05Z-08:18Z Repointed the `history-toolbar-button` registry docs link from upstream Slate History to Plite History; proved source docs/type checks and structured route HTML.
- 2026-06-26T08:18Z-08:35Z Repointed owned Plite source/test URLs away from upstream Slate docs/site URLs, bounded the list package-integration fixture plugin generics, and proved focused tests, Core typecheck, `www` typecheck, and stale URL scan.
- 2026-06-26T08:35Z-08:45Z Renamed the old helper recovery contract to `upstream-slate-helper-loss-contract.ts`; proved focused contract, Plite typecheck, Plite full test suite, and Plite lint.
- 2026-06-26T08:45Z-09:15Z Final Plite closure gate exposed and repaired stale Plite DOM clipboard expectation for empty-target rich fragment paste; focused Plite DOM proof passed.
- 2026-06-26T09:15Z-09:35Z Final Chromium proof exposed stale richtext command metadata browser oracle; added Plite React caret command unit oracle, moved browser assertion to kernel trace ownership, proved richtext/code-highlighting focused rows.
- 2026-06-26T09:35Z-09:42Z Final `pnpm check:plite` passed, including package typecheck/tests, browser package tests, 587 main Chromium tests, and serialized browser slices.

Open risks:
- English current Plate docs are clean for legacy `editor.tf`, `tf.*`, `getPluginApi`, `api.markdown`, and `api.yjs` references; CN and historical migration docs were not fully normalized unless directly touched.
- `packages/diff` fragment override quarantine is closed; Browser proof for version-history is now recorded.
- `pnpm --filter www lint` is not usable as a broad packet gate until generated/TS parser scope is repaired; focused app-relative ESLint is usable.
- Latest docs/schema and Markdown route packets have Browser route proof recorded.
- `apps/www/src/__registry__/index.tsx` remains generated/stale for the registry link until CI/source generation refreshes it; source registry and route render are correct.
- `apps/www` dev proof should use `PLATE_WWW_DEV_SOURCE=1` when proving current source after package builds; mixed source/dist mode can produce false module-resolution reds.
- `lastCommit.command` is intentionally no longer used as the browser-level keydown command oracle; browser keydown metadata is asserted through kernel trace, while core commit metadata is asserted by `packages/plite-react/test/caret-engine-contract.test.ts`.
