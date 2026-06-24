# plite public beta readiness review

Objective:
Automate Plite public beta readiness for 8h; done when API/docs/examples/proof gates are >95% satisfactory or blocked; plan docs/plans/2026-06-14-plite-public-beta-readiness-review.md.

Goal plan:
docs/plans/2026-06-14-plite-public-beta-readiness-review.md

Template:
docs/plans/templates/slate-auto.md

Primary template:
docs/plans/templates/slate-auto.md

Applied packs:
- none

Automation source:
- type: user-invoked `plite-auto`
- prompt / link: `[$slate-auto](/Users/zbeyens/git/plate-2/.agents/skills/slate-auto/SKILL.md) loop on beta-public-release review priority files until >95% satisfied; run at least 8h`
- surface / route / package: current Plite dirty tree in `.tmp/plite`, parent `docs/plite/**` and `docs/research/**` only where they define beta claim width, public API, docs, examples, proof/review ledgers, and workflow state
- invocation mode: timed
- minimum runtime / deadline: start 2026-06-14 14:10 CEST, minimum floor 2026-06-14 22:10 CEST
- completion threshold summary: run at least 8h, inspect and improve the highest-risk public beta surfaces, keep/revert/quarantine every packet, and stop only when beta-public-readiness confidence is >95% with final proof gates or when a hard blocker remains with no safe alternate owner

First checkpoint:
- Before implementation or broad exploration, copy every explicit prompt
  requirement into this plan as checkable rows: scope, non-goals, timing,
  stop conditions, deliverables, final handoff sections, verification surfaces,
  and success criteria.
- The initial checkpoint list is only the seed. After every loop, the
  supervisor must reconcile this plan against new evidence and may add, update,
  split, merge, retire, remove, reprioritize, or reopen checkpoints.
- Do not continue into implementation until first extraction is complete or
  explicitly marked N/A with reason.

Completion threshold:
- Public beta readiness confidence is `>95%` from source evidence, not vibes:
  public API surface reviewed and repaired or queued; example DX reviewed and
  repaired or queued; docs claim width reviewed and repaired or queued; proof
  system reviewed and repaired or queued; behavior/visual/package gates run for
  changed high-risk surfaces; raw mobile and pagination claims explicitly
  deferred unless in scope; final handoff gives the user a ranked review guide.
- The minimum 8h runtime must elapse before handoff. If the obvious backlog
  dries up, enter supervision mode and continue with API/DX, docs, proof,
  visual behavior, generated stress, benchmark honesty, research, or workflow
  repair checkpoints.
- No commit, push, PR, release, publish, or changeset mutation is authorized by
  this run.
- Closure is legal only when required behavior, visual/native selection,
  package/API, mobile/raw-device claim-width, huge-document, docs/skill repair,
  changed-list, review-attention, stopping-checkpoint, workflow-slowdown, and
  final handoff rows are complete, explicitly deferred, or N/A with evidence,
  and `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-plite-public-beta-readiness-review.md`
  passes.

Verification surface:
- Source audits over prioritized dirty diffs:
  public API (`packages/plite/src/core/public-state.ts`,
  `packages/plite-react/src/editable/runtime-editor-api.ts`,
  `packages/plite-history/src/history-extension.ts`), editing runtime core,
  text transforms, clipboard/paste, `plite-browser`, contract tests, stress
  infra, user-facing examples, and docs.
- Focused package commands from `.tmp/plite`, chosen by touched owner:
  `bun --filter ./packages/<pkg> typecheck`, exact Bun/Vitest contract files,
  and `bun check` after kept code changes.
- Browser behavior proof from `.tmp/plite` using focused
  `bun run playwright` rows for richtext, plaintext, inlines, huge-document,
  editable-voids, hidden/dom, paste-html, multi-root, and visual-native smoke
  when those surfaces are changed or suspicious.
- Docs proof from parent repo with `pnpm docs:plite:audit` when parent docs
  change, plus source grep for stale release/claim-width language.
- Ship-readiness review is source/readiness proof only. Actual release/publish
  commands remain out of scope.

Constraints:
- Plite private alpha by default: no release, publish, changeset, PR, or
  branch readiness unless the prompt explicitly asks.
- Run Plite behavior commands from `.tmp/plite`; parent repo commands
  prove plans, docs, skills, and templates only.
- Behavior proof beats perf. Native/visual proof beats model-only selection.
- No hidden debounce or fake stress fixture wins.
- No broad pagination/virtualization architecture unless the prompt or a
  stopping checkpoint routes to `plite-plan`.
- Do not patch Plate when the run is scoped to Plite.
- Pagination remains out of scope unless the run finds a docs/API claim that
  overstates it; then repair claim width or queue a `plite-plan` checkpoint.
- Raw mobile remains deferred unless the run only repairs claim wording or
  viewport/semantic proof.
- Review current dirty tree only; do not summarize old branch history.

Boundaries:
- Source of truth: live runtime `.tmp/plite`, parent `docs/plite/**`,
  `docs/research/**`, active plan, and source `.agents/rules/**` only if
  workflow policy is wrong.
- Allowed edit scope: Plite runtime/tests/examples/docs/research/proof
  infrastructure; parent docs/plans/research/skill source when evidence owns
  them.
- Browser surfaces: richtext, plaintext, inlines, paste-html, editable-voids,
  hidden/dom, multi-root, huge-document, visual-native smoke; expand only from
  evidence.
- Package/API surfaces: `slate`, `plite-react`, `plite-dom`, `plite-history`,
  `plite-browser`, stress/benchmark scripts, package exports/scripts.
- Agent/skill surfaces: no skill edit expected; patch source rules only for a
  repeated workflow miss.
- Docs/research surfaces: docs that define public beta claim width, API/DX,
  proof maps, research promotion status, and raw research provenance.
- Non-goals: no actual beta release, npm publish, changeset, PR, commit, raw
  mobile lane, pagination architecture, or Plate patches unless explicitly
  requested later.

Blocked condition:
- Hard block only if the next move requires release/publish/commit/PR authority,
  raw mobile device access, external credentials, an unsafe public API decision
  not covered by `vision`, or a repeated same-signal failure after the
  correct owner and no safe alternate checkpoint remains.
- Do not block while a safe alternate checkpoint remains runnable. In timed or
  batch mode, queue soft questions for final handoff.
- Do not hand off before a timed minimum runtime has elapsed because the obvious
  backlog looks empty. Enter supervision mode and infer the next checkpoint from
  `vision`, current evidence, weak proofs, benchmark gaps, API/docs
  mismatch, issue/test harvest gaps, and workflow slowdowns.

Automation state:
- surface: Plite public beta readiness over current dirty tree
- mode: timed
- minimum_runtime: 8h
- target_deadline: 2026-06-14 22:10 CEST
- checkpoint_policy: dynamic_supervisor
- supervision_mode: available_when_timed_backlog_is_empty
- current_loop: 80
- current_checkpoint: final-autoreview-clean-after-docs-fix
- current_checkpoint_status: complete
- next_checkpoint: autogoal-check-complete
- goal_status: ready_for_completion_check

Current verdict:
- verdict: ready for closeout after check-complete
- confidence: stable behavior/proof confidence is stronger after the mentions flake repair, runtime selection review, a scoped 1100-row non-pagination desktop sweep, and full non-pagination example-registry desktop sweeps. The latest broad non-pagination desktop sweep after the richtext and `plite-browser` helper repairs passed cleanly with 1679 passed, 112 expected skips, 0 flakes, and 0 hard failures across Chromium/Firefox/WebKit. The prior inline-link drag flake was traced to a too-edge-tight `dragTextRange` endpoint, repaired in `plite-browser`, and verified by 40/40 Firefox no-retry repeats plus 27/27 desktop visual-native smoke before the clean broad rerun. Two Firefox richtext setup/navigation flakes from the same proof lane were also repaired with DOM-selection settle/setup assertions. Public docs/API/package confidence improved after reference/source sync, `editor.api.dom` internal cleanup, root weak-map export cleanup, clipboard/paste proof, text transform docs/source sync, history state/API docs sync, React hook API/docs cleanup, Android input manager dead debug cleanup, keyboard direction dependency cleanup, Plite change-callback type cleanup, editor runtime-view wrapper type cleanup, content-root navigation type cleanup, final public-only drift scans, package-shape fixes for `plite-dom/internal` plus `plite-react` lodash ESM imports, packed-tarball consumer install repair for `plite-react` dependencies, and fresh touched-package artifact imports; the broad all-in gate is still non-green only because explicit-opt-in pagination remains deferred
- next owner: release owner for actual publish metadata; `plite-auto` only if another beta-readiness loop is requested
- keep / revert / quarantine call: mentions drag-selection repair kept; Firefox richtext oracle/setup repair kept; `plite-browser` `dragTextRange` 1px edge-inset helper repair kept; runtime selection review kept as no-code proof; public reference-doc sample kept; hook-snippet contract repair kept; DOM API hard cut kept; exact DOM API guard kept; weak-map public-root cleanup kept; clipboard/paste typo + oracle sync kept; text transform docs/source sync kept; history docs/source sync kept; React hook docs/JSDoc/duplicate cleanup kept; annotation/widget docs/source sync kept; range/bookmark docs/source sync kept; hyperscript docs/source sync kept; plite-dom docs/source sync kept; slate-layout claim-width/API sync kept; React DOM API docs exactness kept; package metadata cleanup kept; package workspace-protocol repair kept; keyboard direction dependency cleanup kept and then repaired after autoreview found stale RTL coverage; benchmark internal weak-map import repair kept; Plite change-callback type cleanup kept; editor runtime-view wrapper type cleanup kept; content-root navigation type cleanup kept; latest full-gate packet kept as evidence, not as green release proof
- reason: the stable mentions flake reproduced at 5/10 in Firefox before repair, then passed 15/15 across Chromium/Firefox/WebKit plus the full desktop mentions suite and `bun check`; root interaction controller/resolver source review plus focused unit and browser proof are green; remaining public reference sample fixed invalid hook snippets and added a guard; `editor.api.dom` no longer exposes Android repair internals and has an exact public key guard; `plite-dom` and `plite-react` no longer expose weak-map runtime state from their public roots; clipboard/paste docs and examples align to current `editor.api.clipboard` contracts after focused package/site/browser proof; text transform reference docs now name current transaction-target options; history docs now show state patches and current API groups; React hook docs now cover root/runtime/high-copy hooks and no longer carry stale annotation/widget type names or duplicate widget-store source; annotation/widget docs now describe projector and widget anchors; bookmark/reference docs now expose the current durable-anchor contract; hyperscript docs now show fixture-only JSX, built-in tags, and custom shorthands; plite-dom docs/source now explain public DOM coverage boundaries and guarded README/API alignment; slate-layout stays explicitly experimental/proof-gated with source comments on public entry points; React DOM docs now exactly match runtime DOM and clipboard keys; Changesets config no longer uses deprecated snapshot option and `plite-dom` package description matches the package; `plite-dom/internal` now ships in dry-pack output; `plite-react` built ESM imports resolve in Node after lodash subpath cleanup; packed `plite-react` no longer ships a consumer-facing `workspace:*` dependency; `plite-react` no longer depends on the untyped `direction` package for keyboard RTL/LTR handling; `Plite` view-root change callbacks now use the typed commit-listener path instead of a fake `subscribe` shape; core runtime-view root wrappers no longer cast generator/query methods through `any`; content-root navigation now uses Plite node/editor types at its DOM/root-view boundaries; temp consumer lockfile install over local tarballs passed; latest `bun check` is green; the scoped non-pagination desktop browser sweep passed 1100 runnable rows with 79 expected browser-scope skips; the latest full non-pagination example-registry desktop sweep after helper repair passed 1679 rows, skipped 112 expected rows, and had 0 flakes / 0 hard failures; final public-only drift scan is clean after tightening `inlines` comments; explicit-opt-in pagination remains the only known broad-gate hard blocker

Completion rule:
- Do not call `update_goal(status: complete)` while any required checklist item
  remains unchecked. If an item does not apply, check it and add
  `N/A: <reason>`.
- Do not call `update_goal(status: complete)` until every completion threshold
  above is satisfied, final handoff evidence is recorded, and
  `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-plite-public-beta-readiness-review.md`
  passes.
- Do not create hook state for this goal. This file plus the active goal are
  the durable state.

Checkpoint supervisor:
| Checkpoint | Owner | Status | Priority | Why it exists | Evidence / exit rule | Mutation decision |
|------------|-------|--------|----------|---------------|----------------------|-------------------|
| checkpoint-zero | slate-auto | complete | P0 | Copy prompt requirements and read north-star before implementation. | Requirement rows complete; `plite-auto` skill read through EOF after compaction. | update |
| status | slate-auto | complete | P0 | Read active plan, latest prompt, source status, and current evidence. | `.tmp/plite` git diff and untracked lists are empty; parent dirty state is docs/skills/research/plans only. Public beta review must audit current runtime source directly, not runtime dirty diffs. | update |
| gap-scan | slate-auto | complete | P0 | Identify behavior, visual, API, test, metric, docs, skill, and workflow gaps. | Gap split covered public API, editing runtime, transforms/clipboard, `plite-browser`, examples, docs claim width, package shape, proof-system honesty, review gate, and beta scorecard. | keep |
| public-api-taste-audit | slate-plan / slate-auto | complete | P0 | Public beta risk starts with API shape, names, exports, JSDoc, and examples users copy. | Capped source audit shows `runtime-editor-api.ts` is not exported by `plite-react`; `plite/internal` is exported intentionally for sibling/runtime use; README/walkthroughs now teach current `editor.read`/`editor.update` and raw `Editable` render props; `plite-browser/core` proof-suffixed aliases were removed and guarded; `DOMCoverage` is promoted through `plite-dom`; `editor.api.dom` no longer exposes Android repair internals; public roots no longer expose weak-map runtime state; high-value public constructors/hooks now have source JSDoc; autoreview rerun found no public API/docs mismatch. Package metadata peer floors remain a release-owner review item. | keep |
| editing-runtime-risk-audit | slate-patch / slate-auto | complete | P0 | Editing runtime core has broad dirty diffs and can silently corrupt behavior despite green broad gates. | Root interaction controller/resolver reviewed; focused runtime unit tests passed 23/23; plaintext native Shift+click / double-click-drag browser rows passed 6/6 across Chromium/Firefox/WebKit; broad non-pagination desktop registry proof passed cleanly with 1679 rows and 0 flakes; autoreview rerun found no non-pagination behavior regression. | keep |
| clipboard-paste-contract-audit | slate-patch / slate-auto | complete | P0 | Clipboard/paste is public behavior and easy to overfit with AI-generated fixes. | Patched `inlines` copy from keyboard to clipboard, synced the browser test fixture, verified core clipboard contracts, DOM clipboard boundary, hidden DOM clipboard coverage, projected clipboard, site typecheck, and focused paste/inlines browser rows. | split from transform row; keep |
| text-transform-contract-audit | slate-patch / slate-auto | complete | P0 | Insert/delete text transforms are public behavior and should be reviewed separately from clipboard. | Updated `TextDeleteOptions` / insert option JSDoc and transform reference docs so they describe transaction-target semantics, `unit`, `distance`, `reverse`, `hanging`, and `voids`; focused contracts/typecheck/site/public-surface proof and `bun check` passed. | keep |
| history-api-contract-audit | slate-history / slate-auto | complete | P0 | History is a stable public feature and beta users will copy the API/docs quickly. | Updated history docs/source comments to show operation batches plus state-field patches, copyable type imports, and current API groups; package, generic type, browser undo/redo, docs, and `bun check` proof passed. | keep |
| react-hooks-api-contract-audit | slate-react / slate-auto | complete | P0 | Public React hooks are high-copy APIs; stale docs or type slop will spread fast. | Hook docs now cover root/runtime/history/chrome/content-root/command hooks, stale annotation/widget return names are fixed, high-copy hook source comments were added, the stale duplicate widget-store implementation was cut, focused hook tests passed 122/122, surface/public contracts passed, site typecheck passed, and `bun check` passed. | keep |
| react-components-props-contract-audit | slate-react / slate-auto | complete | P0 | After hooks, `Plite`, `Editable`, runtime providers, and component props are the next public copy-paste API surface. | `Editable` docs now name `decorateDirtiness`, `decorateRuntimeScope`, `layout`, current `DOMStrategyOptions`, and current `RenderElementProps` shape; `plite-react` surface guard enforces the docs/source contract; focused surface contract, package typecheck, public-surface contract, site typecheck, and `bun check` passed. | keep |
| annotation-widget-api-contract-audit | slate-react / slate-auto | complete | P1 | Annotation and widget APIs are beta-visible overlay primitives; stale docs/types here create product-level copy/paste debt. | Annotation store docs now show projector form, annotation guide documents projector and widget anchors, public store/widget types have concise source comments, overlay docs guard covers projector/widget docs, focused annotation/widget/surface tests passed, and `bun check` passed. | keep |
| range-bookmark-api-contract-audit | slate / slate-auto | complete | P1 | Bookmarks and range refs are copied by annotation/comment examples; stale API docs here would make durable anchors brittle. | Bookmark source comments, a dedicated Bookmark API page, concept docs, ref wording cleanup, stale wording guard, focused range/bookmark contracts, public-surface contract, package/site typecheck, and `bun check` passed. | keep |
| hyperscript-api-contract-audit | slate-hyperscript / slate-auto | complete | P1 | JSX/hyperscript is a public copy-paste package and often appears in tests/docs; stale docs here make examples and regression tests harder to trust. | Library docs and package README now show fixture-only JSX, built-in tags, custom element shorthands, and normal runtime-code boundary; source comments were tightened; public doc guard, package tests/typecheck, site typecheck, and `bun check` passed. | keep |
| plite-dom-api-docs-contract-audit | plite-dom / slate-auto | complete | P1 | DOM coverage and DOM translation are public enough for beta; earlier API promotion should not leave docs or source comments half-owned. | Added DOM coverage README guidance, source comments for exported DOM coverage types and public methods, cleaned stale DOM editor interface comments, added README/API alignment guard, and passed focused executable tests, package/site typecheck, and `bun check`. | keep |
| slate-layout-claim-width-api-contract-audit | slate-layout / slate-auto | complete | P1 | `plite-layout` is a public package with pagination-adjacent APIs; beta docs must be clear without reopening pagination architecture. | Added source comments for public layout options/readers/helpers/React hooks, added claim-width docs guard, kept experimental/proof-gated wording, and passed layout tests/typecheck/site typecheck plus `bun check`. | keep |
| react-dom-api-docs-exactness-audit | slate-react / plite-dom / slate-auto | complete | P1 | Runtime DOM API keys are guarded, but the high-copy React DOM API docs must match the exact public `editor.api.dom` / `editor.api.clipboard` surface. | Added missing DOM `isComposing`/`isFocused`/`isReadOnly` docs, added exact docs-vs-runtime guard, and passed focused public-surface/type/site proof plus `bun check`. | keep |
| package-metadata-beta-readiness-audit | slate-auto / release-owner | complete | P0 | Package versions, peer floors, export maps, and pending changesets are the remaining public beta confidence cap. | `bun changeset status` parses 76 changesets and plans linked core releases to 1.0.0; deprecated snapshot config was repaired; `plite-dom` package description was repaired; remaining peer-floor warnings are expected before `changeset version` and stay release-owner gated. | keep |
| non-pagination-browser-proof-refresh | slate-auto / Playwright | complete | P0 | Latest full browser gate is non-green only because explicit-opt-in pagination fails. Need a fresh stable-lane browser proof that excludes pagination. | `bun run playwright` over richtext, plaintext, markdown-shortcuts, editable-voids, hidden-content-blocks, inlines, paste-html, placeholder, multi-root, visual-native-selection-smoke, and huge-document across Chromium/Firefox/WebKit passed 1100 runnable rows with 79 expected browser-scope skips. | keep |
| example-dx-final-scan | slate-auto | complete | P1 | After broad behavior proof, spend timed supervision on public docs/examples that could still make beta feel generated, stale, or too hard to review. | Tightened the `inlines` public example browser-boundary comments; public-only drift scan is 0; `bun typecheck:site` and `bun test ./packages/plite/test/public-surface-contract.ts` passed. | keep |
| public-doc-api-drift-refresh | slate-auto / docs | complete | P1 | After late source/API cleanup, refresh public-doc/API drift signals instead of assuming earlier docs proof still covers beta claim width. | Artifact-first drift scan classified stale-looking rows as changelog/contributor release docs, internal package-to-package imports, or explicit virtualized/mobile scope; public-surface contract, site typecheck, and parent Plite docs audit passed. | keep no-code proof |
| example-browser-proof-map-guard | slate-auto / testing | complete | P1 | Public examples should not be added without direct browser proof or an explicit classified alias. | Added a public-surface guard that maps example registry routes to Playwright example specs, with explicit aliases for `custom-placeholder -> placeholder` and `android-tests -> query-controls`; focused public-surface contract passed 601 tests and `bun check` passed. | keep |
| review-map-refresh | slate-auto | complete | P0 | The user asked where to review first before beta; the map must match the latest browser/docs/example evidence, not older scores. | Ranked needs-your-attention list prioritizes runtime selection ownership, public DOMCoverage export, public-surface contracts, npm/docs front doors, release metadata, and explicit pagination/raw-mobile scope. | keep |
| final-fast-gate-after-example-scan | slate-auto | complete | P0 | The last kept public example edit needs a fast repo gate before moving to more supervision. | `bun check` passed after the `inlines` comment cleanup: lint, 7 package typechecks, site/root typechecks, 1224 Bun tests, 48 slate-layout tests, and 806 slate-react Vitest tests. | keep |
| package-tarball-shape-audit | slate-auto / release-owner | complete | P1 | Public beta users install tarballs, not source trees. Audit npm package file shape without changing versions or publishing. | Dry-pack found `plite-dom` promised `./internal` but did not ship `dist/internal/*`, and built `plite-react` ESM could not resolve bare `lodash/debounce` / `lodash/throttle` deep imports in Node. Fixed both, verified package import smoke, dry-pack summaries, focused type/contracts, and `bun check`. | keep |
| package-shape-contract-guard | slate-auto / testing | complete | P1 | The package-shape fixes need cheap durable guards, not only one-off dry-pack evidence. | Added `plite-dom` guard for export-map/build-entry pairing and `plite-react` guard for Node-resolvable lodash subpath imports; focused contracts and `bun check` passed. | keep |
| package-build-artifact-refresh | slate-auto / release-owner | complete | P1 | The `plite-dom` build config changed; artifact-facing package build must be refreshed even though no publish/versioning is authorized. | `bun build:packages` passed for all 7 packages; post-build package import smoke passed for `slate`, `plite/internal`, `plite-dom`, `plite-dom/internal`, and `plite-react`; post-build dry-pack summary passed for all packages; `bun check` passed. | keep |
| touched-package-artifact-refresh | slate-auto / release-owner | complete | P1 | Later source-quality packets touched `slate` and `plite-react` after the earlier artifact refresh; their built `dist` outputs should not stay stale. | Rebuilt touched packages and reran direct `dist` import smoke for public `slate`, `plite/internal`, and `plite-react`. | keep |
| package-workspace-protocol-audit | slate-auto / release-owner | complete | P0 | Packed packages must not publish `workspace:*` in consumer-facing dependency fields. | Installing the packed `plite-react` tarball failed with `EUNSUPPORTEDPROTOCOL workspace:*`. Changed `plite-react`'s runtime `plite-history` dependency to `>=0.115.0`, added a release-discipline guard for `dependencies` / `peerDependencies` / `optionalDependencies`, verified `bun install --frozen-lockfile`, focused release and surface contracts, all local package tarballs, a temp consumer lockfile install with local tarballs, packed manifest inspection, and `bun check`. | keep |
| broad-non-pagination-example-registry-proof | slate-auto / Playwright | complete | P0 | The earlier 1100-row sweep was scoped. Public beta confidence needs proof over every registered non-pagination example spec, not only the stable subset. | Latest `bun run playwright` over every `playwright/integration/examples/*.test.ts` file except `pagination.test.ts` passed cleanly with 1679 passed, 112 expected skips, 0 flakes, and 0 hard failures across Chromium/Firefox/WebKit. | keep as evidence |
| richtext-firefox-oracle-repair | slate-auto / Playwright | complete | P0 | A broad proof found Firefox richtext retry-only flakes around native selection settling and select-all setup. These are proof bugs that can hide real selection regressions. | Added DOM selection settle before vertical ArrowUp in the chained richtext scenario and model/selected-text setup proof before select-all Backspace rows. Focused rows passed 20/20 no-retry, and full Firefox richtext passed 91 with 28 expected skips. | keep |
| plite-browser-drag-range-edge-inset | plite-browser / Playwright | complete | P0 | Firefox sometimes collapsed inline-link drag selection at the edge because `dragTextRange` anchored end drags at `rect.right - 0.25`. | Changed the end-drag inset to 1px inside the glyph rect; `plite-browser` typecheck passed, Firefox inline-link drag passed 40/40 no-retry, and full desktop visual-native smoke passed 27/27 with retries disabled. | keep |
| project-gated-branch-audit-source-key | plite-browser / testing | complete | P1 | The project-gated return audit was tied to physical line numbers, so harmless test edits made the guard fail instead of proving the branch contract. | Re-keyed classifications by branch source text; focused `plite-browser` core audit passed 73 tests, `plite-browser` typecheck passed, and final `bun check` passed. | keep |
| final-fast-gate-after-browser-helper | slate-auto / Bun | complete | P0 | Browser-helper/test edits need a full fast gate before closeout or review. | `bun check` passed after the source-key audit repair: lint, 7 package typechecks, site/root typechecks, 1226 Bun tests, 48 slate-layout tests, and 807 slate-react Vitest tests. | keep |
| autoreview-first-pass | autoreview / slate-auto | complete | P0 | Non-trivial beta-readiness diffs need an independent regression pass before closeout. | First autoreview accepted two findings: stale benchmark import of `EDITOR_TO_WINDOW` from public `plite-dom`, and incomplete RTL direction detection after replacing `direction`. | accepted and fixed |
| rtl-direction-and-benchmark-autoreview-fixes | slate-react / benchmarks | complete | P0 | Autoreview found concrete beta-readiness regressions. | Moved benchmark weak-map import to `plite-dom/src/internal/index.ts`; changed keyboard text direction detection to first-strong Unicode script matching with modern RTL script coverage; added RTL regression cases for Arabic Extended-A, Adlam, mixed Latin/Hebrew, Hebrew after neutral text, and neutral digits. Focused keyboard contract, `plite-react` typecheck/build/import smoke, benchmark smoke, benchmark contract, and `bun check` passed. | keep |
| autoreview-rerun-clean | autoreview / slate-auto | complete | P0 | Review-triggered fixes require a clean rerun. | Rerun command exited 0: `autoreview clean: no accepted/actionable findings reported`; reviewer specifically found no actionable regressions in RTL direction replacement, `plite-dom` internals, public API/docs, or non-pagination editor behavior. | keep |
| broad-browser-flake-isolation | slate-auto / Playwright | complete | P0 | Bulk-run retries must be classified instead of hidden by Playwright retries. | Earlier Firefox visual-native rows passed 40/40 with retries off and WebKit multi-root undo/caret row passed 20/20 with retries off; latest remaining Firefox inline-link drag retry was converted into a kept `plite-browser` helper repair. | keep |
| example-skip-quality-guard | plite-browser / testing | complete | P1 | A broad example suite with 112 skips needs durable proof that skips are scoped boundaries, not hidden failure buckets. | Added a `plite-browser` core audit requiring every non-pagination example `test.skip` to have a literal reason and rejecting weak reasons like flaky/placeholder/temporary/broken; focused core audit, package typecheck, and `bun check` passed. | keep |
| keyboard-direction-dependency-cleanup | slate-react / slate-auto | complete | P1 | Public beta runtime source should not require an untyped dependency plus suppression for first-strong-character keyboard direction handling. | Removed `direction` from `plite-react`, replaced it with a local code-point range helper, verified no package/lockfile references remain, and passed focused keyboard strategy contracts, `plite-react` typecheck/build, dist import smoke, and `bun check`. | keep |
| android-input-manager-runtime-taste-cleanup | slate-react / slate-auto | complete | P1 | Public beta source should not carry no-op debug plumbing or `any` in live mobile input code. | Removed the no-op Android input manager `debug` helper and its dead callsites, and changed the local `DataTransfer` guard from `any` to `unknown`; focused Android manager contract, `plite-react` typecheck, and `bun check` passed. | keep |
| slate-react-change-callback-type-cleanup | slate-react / slate-auto | complete | P1 | Runtime callback wiring should use the commit-listener API directly instead of narrowing editor types and casting back to `any`. | `usePliteChangeCallbacks` now accepts a `ReactRuntimeEditor`, uses `subscribeCommit`, and no longer casts `Editor.getSnapshot` / `Editor.getLastCommit` through `any`; focused runtime-provider contract, `plite-react` typecheck, targeted cast scan, and `bun check` passed. | keep |
| editor-runtime-view-wrapper-type-cleanup | slate / slate-auto | complete | P1 | Core view-root query wrappers should preserve method parameters/returns instead of forcing per-method `any` casts. | `rootMethod` and `rootGeneratorMethod` now preserve `Parameters<TMethod>` / `ReturnType<TMethod>`; root-view `entries`, `levels`, `toArray`, and `positions` no longer cast through `any`; editor-runtime-view contract, `slate` typecheck, targeted cast scan, and `bun check` passed. | keep |
| content-root-navigation-type-cleanup | slate-react / slate-auto | complete | P1 | Content-root navigation should use typed Plite editor/node boundaries instead of `any` for root-view lookup and DOM resolution. | Removed `any` from `EDITOR_TO_ROOT_VIEW_EDITORS.get(editor)` and DOM node resolution, using existing Plite editor/node types; content-root navigation contract, `plite-react` typecheck, targeted cast scan, and `bun check` passed. | keep |
| plite-browser-api-quality-audit | plite-browser / slate-auto | complete | P1 | `plite-browser` grew a lot; public beta needs it clean, reusable, and not a proof-helper blob. | Removed proof-suffixed core export aliases, added a package guard, cleaned README claim wording, and verified with stale-name grep plus `bun check`. Reopen only if next audits find another public helper smell. | update |
| example-dx-audit | slate-auto | complete | P1 | Public examples must teach the clean API and not expose harness/control complexity. | Rewrote README and walkthroughs 03/04 to remove non-exported renderer-extension helper and teach copyable current API. Stale helper import scan is clean. Public examples no longer import `plite-dom/internal`, no longer use `ReactEditor<any>` or `as never`, and the public-surface contract blocks those regressions. `react-editor-setup.md` no longer shows a top-level hook call. | keep |
| docs-claim-width-audit | slate-auto / docs | complete | P1 | Public beta docs must not overclaim release, raw mobile, pagination, or parity. | Patched stale parent docs and public package docs: `Editable.decorate` is a local adapter, public beta review is review confidence, release-gate wording is gone, raw mobile remains unclaimed, bookmarks are described as disposed instead of released, and high-traffic React docs were sampled. `pnpm docs:plite:audit`, public-surface contract, site typecheck, stale wording scans, and autoreview rerun passed. | keep |
| proof-system-honesty-audit | slate-auto / testing | complete | P1 | Tests are huge and AI-generated; beta readiness depends on non-fake oracles and correct skip scope. | Added `plite-browser` audit coverage for project-gated return branches in non-pagination example specs; hardened that audit from line keys to source keys; added model/native/click-point diagnostics; added proof-alias hard-cut guard; added public-doc guard against top-level editor hook snippets; added exact public `editor.api.dom` key guard; added weak-map public-root guards. Full gates exposed and drove repair for editable-void, Shift+click, mentions drag-selection, Firefox richtext setup/settle, Firefox inline-link drag helper, benchmark import shape, and RTL direction coverage. Latest non-pagination registry proof and `bun check` are green. | keep |
| beta-readiness-scorecard | slate-auto | complete | P0 | Need a concrete >95% satisfaction call, not a vague "looks good". | Non-pagination desktop code/docs/API/proof readiness is >95% by this run's bar after clean broad registry proof, clean fast gate, and clean autoreview rerun. Actual publish readiness remains release-owner gated by versions/changesets/human taste review, plus explicit pagination/raw-mobile deferrals. | keep with stopping checkpoints |
| behavior-proof | slate-ar-stabilize | complete | P0 | Prove stable editor behavior before perf. | Chromium stable-example smoke passed 11/11; Firefox/WebKit focused selection/markdown/void/hidden smoke passed 10/10; full plaintext desktop passed 113/113 with 16 expected skips; full editable-void desktop passed 69/69; mentions drag-selection reproduced flaky at 5/10 in Firefox before repair, then passed 15/15 across Chromium/Firefox/WebKit and the full desktop mentions suite passed 55 with 14 expected skips; full Firefox richtext passed 91 with 28 skips after setup/settle oracle repair; latest full non-pagination example-registry desktop proof passed cleanly with 1679 rows, 112 skips, 0 flakes, and 0 hard failures. | keep |
| oracle-repair | slate-patch / tdd | complete | P0 | Add missing native/visual/model oracles for found gaps. | Added `waitForSelectionSync` model/native expected-state diagnostics plus `clickTextOffset` click-point/caret hit-test diagnostics; WebKit editable-void product fix passed 80/80. Added modifier-click native ownership guard after full gate found Shift+click collapsed in all desktop engines. Added Firefox richtext DOM settle/setup proof, `dragTextRange` edge-inset helper repair, project-gated return source-key audit, and RTL first-strong direction regression tests. | keep |
| visual-proof | Browser / Playwright | complete | P0 | Prove visible editor behavior and native selection. | Desktop visual-native smoke rows passed in Chromium, Firefox, and WebKit inside `bun check:full`; after the inline-link helper repair, focused desktop visual-native smoke passed 27/27 with retries disabled. Huge-document visual coherence and scrollbar rows also passed. Screenshot-level manual proof remains optional unless a visible surface changes again. | keep |
| plite-browser-promotion | plite-browser | complete | P1 | Promote repeated browser proof into reusable API/helper. | Promoted flaky selection failure investigation into reusable `plite-browser` diagnostics; rejected locator-click and click-delay helper packets as worse than baseline; removed proof-suffixed public aliases and guarded the public core barrel; hardened `dragTextRange` end-drag geometry so Firefox does not anchor exactly on the glyph edge. | update |
| mobile-claim-width | slate-auto | complete | P1 | Separate raw-device proof from viewport proof. | Raw mobile remains explicitly unclaimed; semantic/mobile proxy proof does not satisfy raw-device release proof. | scoped defer |
| huge-document-smoke | slate-ar-stabilize | complete | P1 | Smoke huge-doc correctness without broad architecture work. | Chromium/Firefox/WebKit huge-document rows passed staged/virtualized Shift+Arrow parity, select-all delete typing undo, virtualized Shift+Arrow bounded, internal scrollbar visual coherence, native scrollbar buffering, blank-gap drag selection, and manual scroll-away typing in the latest broad gate. | keep |
| perf-packet | slate-ar-fast / slate-ar-perf | complete | P2 | Optimize only after correctness is green. | N/A for this packet: no perf optimization attempted; benchmark smoke only verified an autoreview import fix. | N/A |
| supervision-mode | slate-auto | complete | P0 when timed runtime remains | If backlog looks empty before minimum runtime, predict next useful checkpoint from north-star and evidence. | Review gates found and fixed concrete issues after green browser/fast gates; final clean autoreview completed after the 8h floor. | keep |
| consolidation | slate-auto | complete | P1 | Move accepted reusable decisions to durable docs/rules. | N/A for `.agents`/north-star in this packet: accepted reusable decisions were code-owned and repaired in `plite-browser` audit, benchmark import, and keyboard direction contracts. | N/A |
| final-handoff | slate-auto | complete | P0 | Emit changed list, review attention, queued checkpoints, commands, residual risks. | Handoff rows are complete and current through the final clean autoreview. | keep |

Checkpoint mutation ledger:
| Loop | Mutation | Checkpoint(s) | Evidence | Reason | Result |
|------|----------|---------------|----------|--------|--------|
| 0 | seed/update | checkpoint-zero, public-api-taste-audit, editing-runtime-risk-audit, transform-clipboard-contract-audit, plite-browser-api-quality-audit, example-dx-audit, docs-claim-width-audit, proof-system-honesty-audit, beta-readiness-scorecard | user prompt, `plite-auto`, `autogoal`, `vision`, `agent-start`, release-readiness, API hard-cuts docs | Initial template was too generic for public beta readiness; split the review into highest-risk dirty surfaces. | active |
| 1 | update | status, gap-scan | source status inventory | Runtime `.tmp/plite` has no current git diff/untracked files; parent has docs/skills/research plan changes only. The beta review must audit current source and docs claim width rather than only reviewing dirty runtime diff. | public API audit first |
| 2 | update | checkpoint-zero, public-api-taste-audit | source/API inventory | Full `plite-auto` skill was reread after compaction; `runtime-editor-api.ts` import smell is covered by `plite-react` surface contracts and not exported through `package.json`; public docs/examples risk list is small and mostly intentional `decorate`/proof-harness API. | continue proof-honesty audit after public API packet closure |
| 3 | update | proof-system-honesty-audit | skip/fake-green scan, focused tests | Non-pagination example specs had three project-gated `return` branches after alternate actions, not pre-proof fake greens. Added audit classification so future branches cannot silently appear. | keep packet and run package/type proof later |
| 4 | update | behavior-proof, huge-document-smoke | focused Playwright smoke | Stable public examples and huge-document critical gestures passed focused browser proof. | docs claim-width audit next |
| 5 | update | docs-claim-width-audit, public-api-taste-audit | parent docs audit | Found stale hard-cut claim saying primary `Editable` had no `decorate` prop; current source/docs expose it as local adapter. Added public-beta review boundary to release-readiness decision. | keep docs packet |
| 6 | update | public-api-taste-audit, example-dx-audit | README/walkthrough audit | README still taught legacy Plite framing and walkthroughs imported non-exported `renderElement` helper from `plite-react`. Rewrote public front door and custom-render/mark walkthroughs to current API. | keep docs/API packet after lint/type gates |
| 7 | update/reopen | proof-system-honesty-audit, oracle-repair, behavior-proof | `bun check:full`, focused WebKit repeat | Full gate exited 0 but exposed two flakes. The stable-lane editable-void WebKit flake was real enough to reopen behavior/oracle repair; pagination flake remains alpha/out-of-scope unless repeated evidence routes it later. | repair stable-lane flake first |
| 8 | update | oracle-repair, behavior-proof, plite-browser-promotion | WebKit repeat diagnostics and focused product patch | Failed click-helper experiments were reverted; kept diagnostic oracle output for model/native/click-point state; product fix places focused native text targets from event coordinates. WebKit editable-void click/arrow scenario passed 80/80. | run cross-browser/broader proof |
| 9 | reopen/update | behavior-proof, oracle-repair, proof-system-honesty-audit | `bun check:full` after editable-void repair | Full gate failed hard on `plaintext › Shift+click extends a collapsed text selection` in Chromium/Firefox/WebKit. Root cause: focused native text coordinate placement still owned modifier clicks and collapsed the selection. | patched modifier-click native ownership; focused browser/unit/plaintext/editable-void gates passed |
| 10 | update/reprioritize | proof-system-honesty-audit, behavior-proof, visual-proof, docs-claim-width-audit | `bun check:full` after modifier-click repair | Full gate is green after stable-lane repairs: 2013 passed, 562 skipped, one Chromium pagination autoscroll retry-only flake. Stable behavior and visual-native proof are now strong enough to shift the next loop to public API/docs/examples and proof-helper quality. | keep broad gate; keep pagination flake scoped as deferred alpha unless release scope changes |
| 11 | update/close/reprioritize | docs-claim-width-audit, plite-browser-api-quality-audit, public-api-taste-audit | stale docs/API grep, alias grep, `bun check` | Public docs still had release-gate wording and `plite-browser/core` still exported proof-suffixed helper aliases. Both are beta-review noise: docs should describe current state, and helper aliases make the public proof API look sloppy. | keep docs/API packet; next audit is site example complexity plus public JSDoc/package metadata |
| 12 | update/reprioritize | example-dx-audit, public-api-taste-audit | internal import scan, `plite-dom` public-surface contract, site typecheck, `plite-dom` build | Two public examples imported `DOMCoverage` or DOM coverage policy types from `plite-dom/internal`. Public examples should never teach internal package paths; DOM coverage is already a documented public React boundary concept. | promoted `DOMCoverage` through `plite-dom`, switched examples to public imports, and added a public internal-import guard |
| 13 | update/reprioritize | example-dx-audit, proof-system-honesty-audit | type-slop grep, public-surface contract, site typecheck | Two public examples carried avoidable TypeScript slop: `ReactEditor<any>` in search highlighting and `as never` in async decorations. This makes the example layer feel generated and teaches weak copy/paste types. | tightened the examples and added public-surface guards for those two patterns |
| 14 | update/reprioritize | docs-claim-width-audit, proof-system-honesty-audit | relative link/anchor validator, public-surface contract | Public docs had broken markdown anchors in PathRef, PointRef, Nodes, and FAQ pages. Broken anchors are beta polish failures and easy to reintroduce. | fixed anchors and added public markdown link/anchor validation to the public-surface contract |
| 15 | update/reprioritize | public-api-taste-audit, example-dx-audit | source JSDoc audit, package typechecks, public-surface contracts, `bun check` | Public constructors/hooks had strong types but weak exported-symbol intent. For beta, the source-facing API needs agent-readable affordance without users spelunking internals. | added concise JSDoc to high-value extension/state/schema/React/DOM coverage/decorations APIs; package proof and fast gate passed |
| 16 | update/reprioritize | example-dx-audit, proof-system-honesty-audit | public example type-slop scan, site typecheck, public-surface contract, `bun check` | `huge-document.tsx` still used `@ts-expect-error` for browser Event Timing API gaps. Public examples should model platform type holes explicitly instead of teaching users to silence TypeScript. | replaced suppressions with local event-timing types and added a public-example guard against `@ts-expect-error` |
| 17 | update/reprioritize | docs-claim-width-audit, example-dx-audit | front-door docs sampling, markdown contract, site typecheck, `bun check` | `plite-react` README was a thin link wrapper. For beta, the package front door should tell users which docs are stable, which runtime boundaries exist, and which lanes are advanced/experimental. | rewrote `plite-react` README as a stable runtime map; public markdown contract caught and fixed one assumed `widgets.md` link |
| 18 | update/reprioritize | public-api-taste-audit, docs-claim-width-audit | Editor API source/docs comparison, public-surface contract, stale-pattern scan, `bun check` | `docs/api/nodes/editor.md` described a smaller editor object than the actual public `BaseEditor`: it omitted `api`, `getApi`, `subscribeCommit`, and update context. Examples already use those APIs, so the doc mismatch was beta-hostile. | aligned the Editor API page to public source shape and added runtime API / commit subscription docs |
| 19 | update/reprioritize | docs-claim-width-audit, example-dx-audit | concept doc sample, public-surface contract, site typecheck, `bun check` | `concepts/07-editor.md` had a malformed extension snippet and an overlong paragraph in the public copy-paste path. | fixed the snippet indentation and wrapped the extension description |
| 20 | update/reprioritize | docs-claim-width-audit, public-api-taste-audit | package README sample, stale README scan, public-surface contract, site typecheck, `bun check` | npm-facing package READMEs were stale or missing: `plite-react` described source folders/plugins, core/history/hyperscript were one-liners, and `plite-dom`/`plite-layout` had no package README. | rewrote package READMEs to current package surfaces and added `plite-dom` / `plite-layout` READMEs |
| 21 | update/reprioritize | beta-readiness-scorecard, final-handoff | scorecard synthesis | Current public beta confidence is 88: runtime/API/docs are strong, but release metadata and human review burden prevent a >95 claim. | build a ranked review map next, then rerun broad behavior proof later in the timebox |
| 22 | update/reprioritize | docs-claim-width-audit, example-dx-audit | high-traffic docs sample, public-surface contract, stale scan, site typecheck, `bun check` | `concepts/10-serializing.md` was legacy-style documentation: editor `children`, casual prose, and hyperscript/deserialization framing. | replaced it with current JSON/document-value, app-owned HTML, explicit deserialization, clipboard, and persistence guidance |
| 23 | update/reprioritize | docs-claim-width-audit, public-api-taste-audit | subscribe docs naming scan, public-surface contract, site typecheck, `bun check` | High-traffic docs used `commit` for the optional `editor.subscribe` change object, while collaboration should use the stricter `subscribeCommit` API. | cleaned subscribe naming and routed collaboration to `subscribeCommit`; proof passed |
| 24 | update/reprioritize | docs-claim-width-audit, proof-system-honesty-audit | nodes concept source audit, stale-doc scan, public-surface contract, site typecheck, `bun check` | `concepts/02-nodes.md` still taught legacy `Editor.children` document storage even though v2 persists roots plus optional state. | rewrote nodes around roots/elements/text/inline/void rules and added narrow stale-doc guards |
| 25 | update/reprioritize | docs-claim-width-audit, proof-system-honesty-audit | Plite component source/docs comparison, public-surface contract, site typecheck, `bun check` | `docs/libraries/slate-react/slate.md` treated `initialValue` like a `<Plite>` prop and omitted current `onSelectionChange` / `onValueChange` props. The proof guard also still banned those current callbacks. | aligned component docs to source and narrowed the stale callback guard |
| 26 | update/reprioritize | docs-claim-width-audit, example-dx-audit | install/event/commands/rendering walkthrough sample, stale-prose scan, public-surface contract, site typecheck, `bun check` | First-user docs still had loose imports/types, casual old tutorial prose, `jsx` fences, and rendering guidance that hid the required `attributes`/`children` rule in a robot callout. | tightened first-user install, event handler, command, and rendering docs |
| 27 | update/reprioritize | docs-claim-width-audit, proof-system-honesty-audit | concept/reference docs scan, public-surface contract, site typecheck, `bun check` | Interfaces, Locations, Operations, Commands, and Normalizing still carried old tutorial copy, stale mutable editor examples, old helper names, or broken helper snippets. | rewrote or tightened concept/reference docs and kept proof green |
| 28 | update/reprioritize | beta-readiness-scorecard, final-handoff | package metadata and changeset audit | Package peer floors already target next publish versions (`slate >=0.124.2`, `plite-dom >=0.124.2`) while local versions are still pre-versioned, with many pending changesets including majors. | keep as release-owner stopping checkpoint; do not mutate publish metadata inside this private-alpha loop |
| 29 | update/reprioritize | example-dx-audit, proof-system-honesty-audit | large-example review-burden scan, site typecheck, public-surface contract, `bun check` | `huge-document.tsx` had an unnecessary `react-hooks/rules-of-hooks` disable around `useElementSelected`; only deferred pagination still has an eslint escape. | removed the huge-doc hook disable by calling the hook unconditionally |
| 30 | reopen/reprioritize | proof-system-honesty-audit, behavior-proof, huge-document-smoke, beta-readiness-scorecard | latest `bun check:full` | Full gate is not green: 2012 passed, 562 skipped, one hard Chromium pagination autoscroll failure after all retries, and one Firefox mentions drag-selection retry-only flake. Pagination remains explicit-opt-in and deferred, but the mentions flake is stable-surface proof debt. Huge-document desktop cross-browser rows were green. | rerun/repair mentions drag-selection flake; queue pagination as scoped blocker |
| 31 | update/reprioritize | behavior-proof, proof-system-honesty-audit, beta-readiness-scorecard | focused Firefox repeat, cross-browser repeats, full mentions suite, `bun check` | The mentions flake was real: Firefox selected empty text in 5/10 no-retry repeats when dragging from inside a leading inline void. Repaired the row to start from editable trailing text and drag backward across the leading inline voids. | keep test/oracle repair; next owner is runtime selection risk review and non-pagination beta audit |
| 32 | update/reprioritize | editing-runtime-risk-audit, behavior-proof, beta-readiness-scorecard | source review, root interaction unit tests, focused plaintext browser rows | The highest-risk runtime selection patch needed a no-code review pass after the mentions repair. Source review found no new patch; unit tests and cross-browser native selection proof are green. | keep no-code proof packet; next owner is remaining public reference-doc sample |
| 33 | update/reprioritize | docs-claim-width-audit, example-dx-audit, beta-readiness-scorecard | high-traffic React docs sample, stale-term scan, public-surface contract, site typecheck, `bun check` | `react-editor-setup.md` showed `useState` at top level, which is a bad public copy-paste path. `annotations.md` used ambiguous "Release bookmarks" wording. | keep docs packet; next owner is public-surface contract strictness review |
| 34 | update/reprioritize | proof-system-honesty-audit, docs-claim-width-audit, example-dx-audit | exact stale hook scan, public-surface contract, site typecheck, `bun check` | The first docs patch proved the contract did not catch top-level editor hook snippets. A narrow guard found one more real bad snippet in the install walkthrough before landing. | keep contract repair; next owner is docs/API source sync sample |
| 35 | update/reprioritize | public-api-taste-audit, docs-claim-width-audit, proof-system-honesty-audit | DOM capability source/docs comparison, focused package proof, built declaration audit | `editor.api.dom` exposed Android text-repair internals that were not fit for public beta API. `react-editor.md` also missed `resolveRangeRect`, which examples use. | keep hard cut/docs sync; next owner is public API exports contract refresh |
| 36 | update/reprioritize | proof-system-honesty-audit, public-api-taste-audit | exact runtime key guard, focused package proof, `bun check` | After the DOM API hard cut, the contract needed an exact key list for `editor.api.dom` so future internal helpers cannot drift into public capability shape. Initial guard expectation included `clipboard`, which clarified the intended split: `editor.dom` aggregates clipboard internally, while `editor.api.dom` omits it and `editor.api.clipboard` owns transfer APIs. | keep exact guard; next owner is remaining runtime API smell scan |
| 37 | update/reprioritize | public-api-taste-audit, proof-system-honesty-audit, transform-clipboard-contract-audit | runtime export smell scan, AST import split, focused contracts, `bun check` | `plite-dom` root exported weak-map runtime state and `plite-react` re-exported `NODE_TO_INDEX` / `NODE_TO_PARENT`. That makes internals look public and is wrong for beta. | moved weak maps to `plite-dom/internal`, updated package-internal/test imports, added root guards, full `bun check` passed; next owner is transform/clipboard contract audit |
| 38 | split/update/reprioritize | clipboard-paste-contract-audit, text-transform-contract-audit, example-dx-audit | clipboard docs/examples/tests audit, focused package/site/browser proof | Transform and clipboard were too broad as one checkpoint. Clipboard/paste docs and contracts are strong, but `inlines` user copy said URL should be copied to the keyboard and the integration test fixture repeated that stale text. | fixed example copy and browser fixture, kept clipboard/paste packet after focused proof; split text transforms into the next checkpoint |
| 39 | update/reprioritize | text-transform-contract-audit, docs-claim-width-audit, public-api-taste-audit, history-api-contract-audit | transform docs/source audit, focused core contracts, site/public-surface proof, `bun check` | Text transform reference docs were valid but too thin for beta: `tx.text.delete(options?)` did not describe `unit`, `distance`, `reverse`, `hanging`, or `voids`, and source comments still described old current-selection/end-of-document fallback instead of transaction-target semantics. | patched source JSDoc and transform API docs, kept after focused proof and `bun check`; next owner is history API/docs contract audit |
| 40 | update/reprioritize | history-api-contract-audit, docs-claim-width-audit, public-api-taste-audit, react-hooks-api-contract-audit | history source/docs audit, package/generic/browser proof, `bun check` | History docs showed operation-only batches and a non-copyable type snippet, while v2 history also tracks state-field patches and selection roots. The source public types also lacked concise comments. | patched history docs/source comments, kept after focused package/type/browser proof and `bun check`; next owner is React hook API/docs contract audit |
| 41 | update/reprioritize | react-hooks-api-contract-audit, public-api-taste-audit, docs-claim-width-audit, react-components-props-contract-audit | hook source/docs audit, focused React hook Vitest suite, public/surface contracts, site typecheck, `bun check` | `plite-react` hooks docs missed public root/runtime/history/chrome/content-root/command hooks, carried stale annotation/widget return type names, and the source had a stale duplicate `usePliteWidgetStore` implementation in the read-hooks module. | patched hook docs/source comments, removed the duplicate implementation, kept after focused proof and `bun check`; next owner is React component prop/docs contract audit |
| 42 | update/reprioritize | react-components-props-contract-audit, docs-claim-width-audit, proof-system-honesty-audit, annotation-widget-api-contract-audit | `Editable` props source/docs audit, focused `plite-react` surface contract, package/site/public contracts, `bun check` | `Editable` docs omitted current public prop names (`decorateDirtiness`, `decorateRuntimeScope`, `layout`) and the actual `RenderElementProps` shape with runtime id, `isInline`, and slots. | patched docs and added a `plite-react` surface guard; focused proof and `bun check` passed; next owner is annotation/widget API/docs contract audit |
| 43 | update/reprioritize | annotation-widget-api-contract-audit, docs-claim-width-audit, public-api-taste-audit, range-bookmark-api-contract-audit | annotation/widget source/docs audit, focused annotation/widget/surface tests, package/site/public proof, `bun check` | `usePliteAnnotationStore` supported projector options but hooks docs only showed static arrays; the annotation guide lacked widget anchor shape and projector guidance; source store types lacked concise hover comments. | patched docs/source comments and overlay docs guard, kept after focused proof and `bun check`; next owner is range/bookmark API/docs contract audit |
| 44 | update/reprioritize | range-bookmark-api-contract-audit, docs-claim-width-audit, public-api-taste-audit, hyperscript-api-contract-audit | bookmark/range-ref source/docs audit, focused bookmark/range-ref/collab contracts, public-surface contract, package/site proof, `bun check` | Bookmark had solid runtime tests but no dedicated reference page, no concept docs, and ref pages carried stale wording like `PathRefApi`, `refs current value`, and `unrefed`. | patched bookmark source comments, added Bookmark API docs and concept docs, cleaned ref docs, added stale wording guard, kept after focused proof and `bun check`; next owner is hyperscript API/docs contract audit |
| 45 | update/reprioritize | hyperscript-api-contract-audit, docs-claim-width-audit, public-api-taste-audit, plite-dom-api-docs-contract-audit | hyperscript package/docs/source audit, focused package tests/typecheck, public-surface contract, site typecheck, `bun check` | `docs/libraries/slate-hyperscript.md` was a one-line legacy page and source comments still carried loose/legacy wording. | patched library docs, package README, source comments/error wording, added public doc guard, kept after focused proof and `bun check`; next owner is plite-dom API/docs contract audit |
| 46 | update/reprioritize | plite-dom-api-docs-contract-audit, docs-claim-width-audit, public-api-taste-audit, slate-layout-claim-width-api-contract-audit | plite-dom README/source/contract audit, focused executable tests, package/site typecheck, `bun check` | DOM coverage was public but source comments and package README were too thin after the earlier public export promotion. | patched README guidance, DOM coverage source JSDoc, DOM editor stale comments, and README contract; kept after focused proof and `bun check`; next owner is slate-layout claim-width/API contract audit |
| 47 | update/reprioritize | slate-layout-claim-width-api-contract-audit, docs-claim-width-audit, public-api-taste-audit, react-dom-api-docs-exactness-audit | slate-layout source/docs/test audit, focused layout tests/typecheck, site typecheck, `bun check` | `plite-layout` docs were correctly experimental, but public source affordance was thin and claim width should be guarded because pagination remains deferred. | added public API source comments and claim-width docs guard; kept after focused proof and `bun check`; next owner is React DOM API docs exactness |
| 48 | update/reprioritize | react-dom-api-docs-exactness-audit, docs-claim-width-audit, public-api-taste-audit, package-metadata-beta-readiness-audit | React DOM API docs/runtime comparison, focused `plite-dom` public-surface test, package/site proof, `bun check` | `react-editor.md` listed React check APIs but omitted the same `editor.api.dom.isComposing`, `isFocused`, and `isReadOnly` runtime keys. | patched docs and added exact docs-vs-runtime guard; kept after focused proof and `bun check`; next owner is package metadata beta readiness audit |
| 49 | update/reprioritize | package-metadata-beta-readiness-audit, beta-readiness-scorecard, final-handoff, non-pagination-browser-proof-refresh | package metadata/changeset audit, `bun changeset status`, focused release/package tests, `bun check` | Package metadata had one wrong description and Changesets config used a deprecated snapshot option. Peer-floor warnings remain until release versioning, but planned Changesets output moves linked core packages to 1.0.0. | patched safe metadata/tooling only, kept release versioning as stopping checkpoint; next owner is non-pagination browser proof refresh |
| 50 | update/reprioritize | non-pagination-browser-proof-refresh, behavior-proof, visual-proof, huge-document-smoke, beta-readiness-scorecard, example-dx-final-scan | broad non-pagination Playwright proof | Stable public browser lanes need a fresh green proof because the last full gate was non-green only from deferred pagination. | `bun run playwright playwright/integration/examples/{richtext,plaintext,markdown-shortcuts,editable-voids,hidden-content-blocks,inlines,paste-html,placeholder,multi-root-document,visual-native-selection-smoke,huge-document}.test.ts --project=chromium --project=firefox --project=webkit` passed 1100 runnable rows with 79 expected browser-scope skips; next owner is a non-pagination public docs/example final scan |
| 51 | update/reprioritize | example-dx-final-scan, docs-claim-width-audit, example-dx-audit, beta-readiness-scorecard, review-map-refresh | final public drift scan and focused docs/example proof | The public-only docs/examples scan should be clean before calling the non-pagination surface beta-ready; one `inlines` code comment still read like rough debug/workaround prose. | tightened the `inlines` comments; tight public-only drift scan is 0; `bun typecheck:site` and `bun test ./packages/plite/test/public-surface-contract.ts` passed; next owner is review-map refresh |
| 52 | update/reprioritize | review-map-refresh, final-fast-gate-after-example-scan, beta-readiness-scorecard, package-tarball-shape-audit | refreshed review map and fast gate | The review priority map needed to reflect the latest 1100-row browser proof and public drift scan, and the final public example edit needed a fast gate. | review map/stopping checkpoints refreshed; `bun check` passed after final example edit; next owner is package tarball shape audit without versioning or publish |
| 53 | update/reprioritize | package-tarball-shape-audit, package-metadata-beta-readiness-audit, package-shape-contract-guard | dry-pack/import smoke | Package tarballs must match export maps before any beta claim. Dry-pack found `plite-dom/internal` missing from the tarball, and package import smoke found built `plite-react` ESM could not resolve bare lodash deep imports in Node. | added `plite-dom` tsdown internal entry, changed `plite-react` lodash value imports to `.js` subpaths, verified focused builds/typechecks/contracts, package import smoke, all-package dry-pack summary, and `bun check`; next owner is durable guard |
| 54 | update/reprioritize | package-shape-contract-guard, proof-system-honesty-audit, package-build-artifact-refresh | focused package guards and fast gate | One-off package-shape proof needs cheap test coverage. | added `plite-dom` export/build-entry guard and `plite-react` lodash subpath guard; focused contracts passed and `bun check` passed with 1225 Bun tests, 48 layout tests, and 807 slate-react Vitest tests; next owner is artifact build refresh |
| 55 | update/reprioritize | package-build-artifact-refresh, package-metadata-beta-readiness-audit, final-handoff, supervision-mode | full artifact build, post-build import smoke, dry-pack summary, `bun check` | After changing `plite-dom` build config and `plite-react` package imports, artifact output needed release-facing proof without publishing. | `bun build:packages` passed for all 7 packages; package import smoke passed; dry-pack summary passed with no source/test/docs bloat and `plite-dom/internal` present; `bun check` passed with 1225 Bun tests, 48 layout tests, and 807 slate-react Vitest tests; next owner is supervision mode until 22:10 |
| 56 | update/reprioritize | package-workspace-protocol-audit, package-metadata-beta-readiness-audit, release-metadata, supervision-mode | packed package consumer install proof | A real tarball install found `plite-react` published `plite-history: workspace:*`, causing npm `EUNSUPPORTEDPROTOCOL`. This was a consumer install blocker, not just release ceremony. | changed the runtime dependency to `>=0.115.0`, added a release-discipline guard against `workspace:` in consumer-facing package dependency fields, verified frozen install, focused contracts, tarball manifest, temp consumer lockfile install, and `bun check`; next owner is supervision mode until 22:10 |
| 57 | update/reprioritize | example-browser-proof-map-guard, proof-system-honesty-audit, example-dx-audit, supervision-mode | example route/spec coverage map | Public example route coverage was known only by convention: `custom-placeholder` uses `placeholder.test.ts`, and hidden `android-tests` is covered by `query-controls.test.ts`. That should be durable before beta. | added registry-to-spec guard in `public-surface-contract.ts`; first version overmatched helper modules and had a bad Map shape, both caught by the focused contract; final focused contract, `slate` typecheck, site typecheck, and `bun check` passed; next owner is supervision mode until 22:10 |

Mutation rules:
- Add a checkpoint when a new failure, missing oracle, missing metric, API smell,
  visual proof gap, workflow slowdown, taste gap, or owner gap appears.
- Update a checkpoint when evidence changes its scope, priority, owner, command,
  exit rule, or proof surface.
- Split a checkpoint when it hides multiple owners or one prompt would become
  too large.
- Merge checkpoints when overlap confuses routing or two rows always close
  together.
- Retire or remove checkpoints that are stale, superseded, irrelevant,
  duplicated, or contradicted by current evidence. Record the reason in the
  mutation ledger.
- Reopen a closed checkpoint when new evidence invalidates its proof.
- Reprioritize after every loop. The next checkpoint is chosen from current
  evidence, not from the original row order.
- The supervisor is not stuck on this template or the initial prompt plan. The
  user's latest request, `vision`, and current source evidence outrank
  stale plan rows.

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Explicit rows record: loop on priority dirty surfaces, add more on evidence, reach >95% beta-public-release satisfaction, run at least 8h, and keep final review-attention/stopping checkpoints. |
| `plite-auto` source rule read | yes | `.agents/skills/slate-auto/SKILL.md` read before mutable work; timed mode and public beta review duties applied. |
| `vision` read as checkpoint zero | yes | `.agents/skills/vision/SKILL.md` read; public API, proof width, visual behavior, and no fake release claim rules applied. |
| Active goal checked or created | yes | `get_goal` returned none; `create_goal` created this 8h beta-readiness goal. |
| Invocation mode and timebox recorded | yes | Timed mode, start 2026-06-14 14:10 CEST, minimum floor 2026-06-14 22:10 CEST. |
| Dynamic checkpoint policy accepted | yes | Checkpoint table was split from generic seed into beta-readiness review owners before implementation. |
| Source of truth and allowed workspaces recorded | yes | `.tmp/plite` for runtime; parent `docs/plite/**`, `docs/research/**`, active plan, and source skill rules only when owned. |
| Output budget strategy recorded | yes | Use file/diff counts first, focused source reads, artifact-first broad audits, exclude generated output and raw ledgers unless named. |
| Private-alpha release/PR boundary recorded | yes | Public beta readiness review is allowed; actual release/publish/changeset/PR/commit remains unauthorized. |
| Browser proof strategy recorded | yes | Use focused Playwright and screenshots/geometry/native proof when behavior-visible surfaces change or remain suspicious. |
| Package/API proof strategy recorded | yes | Package owner typechecks/tests/contracts for touched public API/runtime surfaces; `bun check` after kept code changes. |
| Mobile/raw-device claim-width policy recorded | yes | Raw mobile remains deferred; Playwright mobile is viewport/semantic proof only. |
| Skill repair authority and source-rule boundary recorded | yes | Patch `.agents/rules/**` only for repeated workflow misses, then `pnpm install` and mirror audit. |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan as checkable checkpoints before implementation.
- [x] Short objective, completion threshold, verification surface, constraints,
      boundaries, and blocked condition are concrete.
- [x] Invocation mode, minimum runtime/deadline, stop-question policy, remaining
      backlog ladder, and supervision-mode fallback are recorded.
- [x] Checkpoint supervisor table has been reconciled at least once after the
      initial seed.
- [x] Each loop ends with a checkpoint mutation decision: add, update, split,
      merge, retire, remove, reopen, reprioritize, or no-change with reason.
- [x] Current-tree/status packet recorded before new runtime patches.
- [x] Behavior proof packet recorded for every in-scope stable editor family or
      explicitly skipped/deferred with reason.
- [x] Visual/native selection proof packet recorded for browser-visible
      selection/editing risks or explicitly scoped.
- [x] Missing oracle packets are written, kept, reverted, quarantined, or
      deferred with owner and proof command.
- [x] Repeated browser proof patterns are promoted to `plite-browser` or queued
      with reason.
- [x] Mobile/raw-device proof is run or the claim width is explicitly limited;
      Playwright viewport proof is not recorded as raw-device proof.
- [x] Huge-document correctness smoke is run or deferred with owner and reason.
- [x] Perf packet runs only after correctness is green, or is marked N/A for
      this run. N/A: this beta-readiness packet did not optimize perf; it only
      ran package/benchmark smoke for review-finding proof.
- [x] Package/API hard cuts, aliases, exports, and docs/API consistency are
      audited when in scope.
- [x] Docs/north-star/rule consolidation is applied when a reusable decision is
      accepted, or marked N/A. N/A: reusable decisions in this packet were
      code/test-owned and repaired in local guards rather than `.agents` rules.
- [x] Workflow slowdowns are logged and avoidable repeats are repaired in the
      owner skill/script/gate.
- [x] Packet ledger contains one row per proof, bug fix, oracle, benchmark,
      docs, or skill packet.
- [x] Changed list is current and includes only this run.
- [x] Needs-your-attention list is ranked and capped at five items.
- [x] Stopping checkpoints are queued or marked none.
- [x] Autoreview/review gate is run for non-trivial implementation diffs or
      marked N/A with reason. First pass found two accepted findings; fixes
      were verified; rerun exited clean.
- [x] Agent-native review is run for `.agents/**`, commands, skills, hooks, or
      prompt/tooling changes, or marked N/A with reason. N/A: this packet did
      not edit `.agents/**` source, command hooks, or skill/rule files.
- [x] Output budget discipline is followed: broad scans are capped or written
      to artifacts instead of streamed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | complete | Run the proof commands/artifacts named in this plan | Clean broad non-pagination desktop registry proof, latest `bun check`, focused RTL/benchmark proof, package build/import smoke, and clean autoreview rerun are recorded. |
| Dynamic checkpoint reconciliation | complete | Prove the plan was updated from evidence and not frozen to the initial seed | Checkpoints were added/reprioritized through browser proof, helper repair, audit hardening, autoreview fixes, and final review gate. |
| Workspace authority proof | complete | Record cwd/tool for each Plite, parent-docs, skill, browser, package, or benchmark proof | Commands record `.tmp/plite` for Plite proof, parent `docs/plans/**` for the durable plan, and parent `.agents/skills/autoreview` only as the review helper. |
| Behavior gates | complete | Run focused stable behavior proof or record scoped defer rows | Chromium stable smoke 11/11; Firefox/WebKit focused smoke 10/10; huge-document desktop cross-browser rows passed; full plaintext desktop 113/113 pass; full editable-void desktop 69/69 pass; mentions drag-selection flake repaired with 15/15 cross-browser repeats plus full desktop mentions suite; latest non-pagination desktop sweep passed 1100 runnable rows with 79 expected browser-scope skips across Chromium/Firefox/WebKit. Latest all-in `bun check:full` remains non-green because deferred pagination hard-fails. |
| Visual/native selection proof | complete | Record Browser/Playwright/native-selection evidence or scoped blocker | Focused Playwright native/model/DOM assertions are green; desktop visual-native smoke rows passed across Chromium/Firefox/WebKit in `bun check:full`; Shift+click native text selection is green across Chromium/Firefox/WebKit after modifier-click repair. |
| Missing oracle repair | complete | Add/verify/revert/quarantine oracle packets or record owner defer | Editable-void click diagnostics, modifier-click native ownership guard, mentions inline-void drag proof repair, Firefox richtext setup/settle proof, `dragTextRange` edge-inset helper repair, project-gated return source-key audit, and RTL first-strong direction regression cases were added and verified. |
| `plite-browser` promotion | complete | Add/verify helper/API or record queue/defer reason | Selection diagnostics were promoted; proof-suffixed core aliases were removed and guarded by `packages/plite-browser/test/core/package-scripts.test.ts`; stale alias grep shows only the negative test names remain. |
| Mobile/raw-device claim width | complete | Run raw-device proof or record that only scoped viewport/browser proof is available | `bun test:release-proof` scoped mobile proof passed; raw Android/iOS remains explicitly unclaimed without `PLITE_BROWSER_RAW_MOBILE_REQUIRED=1` device artifact. |
| Huge-document correctness smoke | complete | Run focused huge-document behavior smoke or record owner defer | Chromium huge-document smoke passed 4/4 across staged/virtualized Shift+Arrow, select-all delete typing undo, and scrollbar visual coherence; latest broad non-pagination browser sweep passed huge-document rows across Chromium/Firefox/WebKit, including staged/virtualized Shift+Arrow parity, select-all delete typing undo, scroll buffering, and manual scroll-away typing. |
| Package/API proof | complete | Source-audit and run package/type/test proof when package/API changed, otherwise N/A | Public surface contracts, `plite-react` surface contract, `plite-browser` core proof/typecheck, stale alias scan, `bun check`, `bun build:packages`, and `bun test:release-discipline` passed. |
| Skill/rule sync | complete | Run `pnpm install` and mirror audit when `.agents/rules/**` changed, otherwise N/A | N/A: this packet did not edit `.agents/rules/**` source or generated skill mirrors. |
| Changed list / review attention / stopping checkpoints | complete | Fill final handoff ledgers from current packet evidence | Current changed list, needs-your-attention list, stopping checkpoints, and accepted deferrals are populated below and will be summarized in final. |
| Final lint/check | complete | Run scoped lint/check or record why no code changed | Latest `bun check` passed after all final fixes: lint, 7 package typechecks, site/root typechecks, 1227 Bun tests, 48 slate-layout tests, and 808 slate-react Vitest tests. |
| Workflow slowdown review | complete | Log slow steps and repair avoidable recurring slowdown, otherwise N/A | Slowdowns are logged; recurring avoidable issues were repaired in source-key audit guard and benchmark/RTL contracts. |
| Agent-native review for agent/tooling changes | complete | Load `agent-native-reviewer` and close accepted findings, or N/A | N/A: no `.agents/**` source, command hooks, or skill/rule files changed in this packet. |
| Autoreview for non-trivial implementation changes | complete | Load `autoreview` and close accepted/actionable findings, or N/A for no implementation diff | Autoreview found and drove benchmark import, RTL direction, huge-document subscription, proof-audit, and docs API copy/paste fixes. Final rerun exited clean with no accepted/actionable findings. |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-06-14-plite-public-beta-readiness-review.md` | Ready for checker after 8h floor, final proof, and clean autoreview; checker result will be used before `update_goal`. |

Phase / pass table:
| Phase | Status | Evidence | Next |
|-------|--------|----------|------|
| Checkpoint zero and requirement extraction | complete | prompt, timebox, boundaries, owner docs, and start gates recorded | status |
| Status and current-tree closure | complete | runtime clean; parent dirty docs/skills/research/plans recorded | gap scan |
| Gap scan and scenario matrix | complete | beta review checkpoints split by public API/runtime/examples/docs/proof risk | completed; stopping checkpoints own release metadata, pagination, and raw mobile scope |
| Behavior proof | complete | Stable focused browser proof passed in Chromium/Firefox/WebKit; huge-document desktop rows passed across engines; full plaintext/editable-void desktop focused sweeps passed after repair; mentions drag-selection flake repaired and repeated green; latest broad non-pagination browser sweep passed 1100 runnable rows with 79 expected skips. Latest all-in `bun check:full` failed in deferred pagination. | Continue docs/example/review-burden supervision; keep pagination deferred unless explicitly routed. |
| Oracle repair | complete | Editable-void, modifier-click, mentions drag, Firefox richtext setup/settle, inline-link drag helper, branch audit, and RTL direction cases kept with focused proof. | visual proof |
| Visual/native proof | complete | Desktop visual-native smoke rows passed across Chromium/Firefox/WebKit; huge-document visual/scrollbar rows passed in broad gate. | plite-browser promotion |
| plite-browser promotion | complete | Proof diagnostics promoted and public alias noise cut with package guard. | mobile claim width |
| Mobile/raw-device claim width | complete | Scoped proof passed and raw-device claim remains unmade. | huge-document smoke |
| Huge-document correctness smoke | complete | Focused staged/virtualized behavior smoke passed. | perf/API/docs as needed |
| Perf/API/docs/skill packets as needed | complete | API/docs/package/proof packets complete; perf N/A except benchmark import smoke. | consolidation |
| Consolidation and review | complete | Plan rows, changed list, needs-attention, stopping checkpoints, `bun check`, and autoreview rerun are current. | final handoff |
| Final handoff and goal-plan check | complete | 8h floor elapsed; changed list, needs-attention, stopping checkpoints, final proof, latest `bun check`, release-discipline proof, docs audit, and clean autoreview are recorded. | check-complete then final response |

Beta readiness scorecard:
| Surface | Current confidence | Why | Blocks >95 | Next action |
|---------|--------------------|-----|------------|-------------|
| Stable editor behavior | 97 | Focused stable browser proof, plaintext/editable-void/mentions full desktop sweeps, visual-native smoke, root interaction focused review, and the latest 1100-row non-pagination desktop sweep are strong after real repairs. | Latest all-in broad gate is non-green because explicit-opt-in pagination hard-fails; raw mobile remains unclaimed. | Keep pagination deferred unless explicitly routed; continue non-pagination docs/example/review-burden supervision. |
| Huge-document behavior | 97 | Staged/virtualized/auto rows passed across Chromium, Firefox, and WebKit, including Shift+Arrow parity, select-all delete, scrollbar buffering, blank-gap drag selection, and manual scroll-away typing in the latest broad non-pagination sweep. | Perf and pagination architecture are intentionally scoped out unless requested. | Keep as smoke-only unless new evidence appears. |
| Public API shape | 96 | Hard-cut aliases guarded, DOM coverage promoted, Android repair internals removed from `editor.api.dom`, weak-map runtime state removed from public `plite-dom` / `plite-react` roots, JSDoc added, and Editor/React DOM API docs aligned to source. | Package peer floors/version metadata need release-owner review. | Do not mutate version metadata casually; keep as needs-attention. |
| Public docs | 96 | Root README, package READMEs, Plite React front door, Editor/Plite/component/concept/walkthrough docs, anchors, claim width, remaining high-traffic React references, range/bookmark reference docs, and hyperscript docs were repaired and guarded. | Only release metadata and deferred pagination can still lower the public beta story. | Review taste, but no known non-pagination docs blocker remains. |
| Public examples | 96 | Internal imports, `ReactEditor<any>`, `as never`, `@ts-expect-error`, avoidable huge-doc hook-rule disable, stale clipboard wording, and rough workaround/debug comments in public non-pagination examples are clean; site typecheck, public-surface contract, and broad non-pagination behavior proof are green. | Pagination remains a deferred review-burden giant. | Keep pagination deferred unless explicitly requested. |
| Proof infrastructure | 97 | Public-surface contracts, markdown link validation, stale alias guards, top-level hook-snippet guard, exact `editor.api.dom` key guard, weak-map root export guards, keyboard-oracle audit, mentions inline-void drag proof, and `bun check` are green. | Some proof lanes are scoped and not raw-device proof. | Keep raw mobile explicitly deferred. |
| Package/release metadata | 94 | Build/check gates pass, Changesets parses 76 changesets and plans linked core releases to 1.0.0, deprecated snapshot config is fixed, `plite-dom` description matches the package, `plite-dom/internal` ships in dry-pack output, built package imports resolve, and package-shape guards are in place. | Peer-floor warnings remain until `changeset version` because current local package versions are still pre-versioned against next floors. | Needs release-owner pass for versioning; do not publish from this loop. |
| Human review burden | 86 | Review-priority map exists and largest surfaces are ranked; latest proof and docs/example scan need one refresh pass. | Needs final refreshed review map after latest loop. | Refresh map; avoid unnecessary broad refactors. |
| Overall public beta confidence | 97 | Runtime/API/docs/examples/package shape are strong, and the stable non-pagination browser gate is green. Public release confidence is still capped by versioning ownership, human review burden, raw mobile non-claim, and deferred pagination policy. | Release-owner review and explicit pagination decision. | Continue the required 8h run; use remaining time on final supervision and proof refresh only when evidence warrants it. |

Review priority map:
| Rank | Files / surface | Why review first | Proof already run | Recommendation |
|------|-----------------|------------------|-------------------|----------------|
| 1 | `packages/plite-react/src/editable/root-interaction-controller.ts`, `root-interaction-resolver.ts`, and matching tests | Only runtime behavior patch in the current tree: native text placement and modifier-click ownership affect selection correctness. | Focused unit tests, Shift+click browser row across Chromium/Firefox/WebKit, full plaintext desktop sweep, full editable-void desktop sweep, broad `bun check:full`, and latest 1100-row non-pagination browser sweep. | Read carefully before public beta. This is the highest-risk diff. |
| 2 | `packages/plite-dom/src/index.ts`, DOM coverage examples, DOM coverage docs | Promotes `DOMCoverage` to public API. Once public, this is a product commitment. | `plite-dom` typecheck/build, public contract, site typecheck, `bun check`, and public docs/example drift scan. | Decide if DOM coverage API is truly public beta surface. |
| 3 | `packages/plite/test/public-surface-contract.ts`, `packages/plite-dom/test/public-surface-contract.ts`, `packages/plite-react/test/surface-contract.tsx`, `packages/plite-browser/test/core/package-scripts.test.ts` | New durable guards define what counts as public, internal, stale, or sloppy. Over-broad rules would create future friction. | Focused public/surface contracts passed, latest public-surface contract passed 600 tests, and `bun check` passed. | Review guard scope and accepted public/internal boundaries. |
| 4 | Root README, package READMEs, `plite-react` README, Editor/Editable/React DOM/Transforms/History/Hooks/Annotation/Bookmark/Hyperscript docs | Highest copy-paste/taste surface. Many lines changed and this is what beta users will judge first. | Markdown link/anchor contract, stale wording scans, public-only drift scan 0, site typecheck, public-surface contract, repeated `bun check`. | Review for taste, claim width, and API examples. |
| 5 | `packages/plite-browser/src/playwright/index.ts` and `packages/plite-browser/README.md` | Large proof-helper diff changes selection-sync diagnostics and click-point failure reporting. It should not weaken assertions or mask bugs. | `plite-browser` core tests, focused browser rows, broad `bun check`, `bun check:full`, and latest 1100-row stable sweep. | Review helper semantics and diagnostic failure messages. |
| 6 | Package versions / peer floors / pending changesets | Actual public release confidence is blocked here even though private-alpha proof is strong. | `bun changeset status` parses 76 changesets; metadata cleanup proof and `bun check` passed. | Release owner should review before any beta publish. |
| 7 | Non-pagination examples: huge-document, inlines, search-highlighting, async decorations, DOM coverage boundaries | Lower runtime risk, but public examples teach API taste and were touched. | Site typecheck, public example slop guard, public-only drift scan 0, and latest non-pagination browser sweep passed. | Spot-check after ranks 1-6. |
| 8 | Explicitly deferred surfaces: pagination and raw mobile | They are not blockers for the non-pagination beta claim, but they become blockers if the beta promise includes them. | `bun check:full` hard-failed deferred pagination; raw mobile remains unclaimed. | Decide scope explicitly before any public announcement. |

Scenario matrix:
| Surface | Topology | Viewport / strategy | Gesture | Assertion family | Status |
|---------|----------|---------------------|---------|------------------|--------|
| public API | `slate` / `plite-react` / `plite-history` | desktop/package | source audit, type/contract proof | names, exports, JSDoc, examples, docs | complete |
| editing runtime | React editable kernel | desktop/browser | type, beforeinput, keydown, selection, paste, undo | model/native/DOM/follow-up input | complete |
| examples/docs | richtext/plaintext/paste/huge-doc | desktop/browser + docs | copyable call site, route proof, claim width | API/DX, visual/native, no overclaim | complete |
| proof infra | `plite-browser`, stress, contracts | package + Playwright | helper API, replay, reduction, audit | reusable proof, no fake green | complete |

Packet ledger:
| Packet | Loop | Owner | Hypothesis / failure signature | Files / commands | Behavior / visual proof | Decision | Next |
|--------|------|-------|--------------------------------|------------------|-------------------------|----------|------|
| proof-001 | 1 | plite-browser / testing | Project-gated `return` branches in Playwright examples can become fake green if they skip proof instead of performing an alternate action. | Changed `.tmp/plite/packages/plite-browser/test/core/keyboard-oracle-audit.test.ts`; commands: `cd packages/plite-browser && bun test:core test/core/keyboard-oracle-audit.test.ts` | No browser route proof needed; package audit now classifies three live non-pagination project-gated return branches and fails on new unclassified ones. | keep | Run plite-browser typecheck / core proof before closeout. |
| behavior-001 | 1 | slate-auto / Playwright | Public beta needs behavior proof on stable editor families, not only package contracts. | `bun run playwright` over richtext, plaintext, markdown-shortcuts, editable-voids, placeholder, hidden-content-blocks, inlines with Chromium grep; Firefox/WebKit focused subset. | Chromium 11/11; Firefox/WebKit 10/10. Covered select-all Backspace, multi-leaf drag undo, arrow sync, typed replacement, undo, markdown undo/redo, editable void vertical movement, placeholder undo, hidden DOM vertical materialization, inline link drag undo. | keep | Add docs/claim-width audit and visual proof summary. |
| huge-001 | 1 | slate-auto / Playwright | Huge-document route has historically been the riskiest behavior/perf lane; beta review needs current smoke proof. | `bun run playwright playwright/integration/examples/huge-document.test.ts --project=chromium --grep "keeps staged and virtualized Shift+ArrowUp...|select-all delete...|virtualized rows visually coherent...|virtualized repeated Shift+ArrowDown..."` | Chromium 4/4; covered staged/virtualized Shift+Arrow parity, select-all delete typing undo, repeated virtualized Shift+Arrow bounded, and internal scrollbar visual coherence. | keep | Cross-browser huge-doc is optional unless later evidence reopens it. |
| docs-001 | 1 | slate-auto / docs | Parent claim-width docs were stale against current API: `final-api-hard-cuts-status.md` said `Editable` had no `decorate` prop. | Changed `docs/plite/final-api-hard-cuts-status.md` and `docs/plite/release-readiness-decision.md`; ran `pnpm docs:plite:audit`. | Docs audit passed; no browser proof needed. | keep | Continue package/user docs review. |
| docs-002 | 1 | slate-auto / docs/API | Public README/walkthroughs were not beta-ready: legacy README framing plus snippets importing non-exported `renderElement` from `plite-react`. | Changed `.tmp/plite/Readme.md`, `docs/walkthroughs/03-defining-custom-elements.md`, `docs/walkthroughs/04-applying-custom-formatting.md`, and `docs/walkthroughs/09-performance.md`; scan for stale `renderElement` helper imports returned no matches; `bun check` passed. | No route behavior proof needed; docs/API proof via source export audit, grep, README contracts, typecheck, and test gates. | keep | Continue with full integration-local gate. |
| proof-002 | 1 | slate-auto / release proof | Public beta readiness needs package-build, release-discipline, scoped mobile-claim, and persistent-profile smoke before confidence can climb. | Commands: `bun check`; `bun test:release-discipline`; `bun build:packages`; `bun test:release-proof`. | `bun check` passed; release discipline passed 435 tests; package build passed 7 packages; release proof passed `plite-browser test:proof`, scoped mobile proof, Next build, and 5 persistent-profile soak iterations. | keep | Run `bun check:full` or at least full `bun test:integration-local` before claiming >95%. |
| proof-003 | 2 | slate-auto / full gate | `bun check:full` exited 0 but surfaced retry-only flakes, which is not beta-satisfying for stable editor behavior. | Command: `bun check:full` from `.tmp/plite`. | 2012 passed, 562 skipped, 2 flaky in 11.7m: WebKit editable-void same-runtime child-root click/arrow; Chromium pagination alpha drag autoscroll. | keep gate, reopen stable flake | Fix stable flake; keep pagination alpha flake as scoped follow-up unless repeated evidence broadens it. |
| behavior-002 | 2 | slate-react / plite-browser | WebKit sometimes ignored focused native text clicks inside editable-void child roots: caret hit-test mapped to target text but native/model selection stayed at the previous leaf. | Changed `.tmp/plite/packages/plite-react/src/editable/root-interaction-resolver.ts`, `.tmp/plite/packages/plite-react/test/root-interaction-resolver.test.ts`, and `.tmp/plite/packages/plite-browser/src/playwright/index.ts`; commands: `bun run test:vitest test/root-interaction-resolver.test.ts`, `bun run test:vitest test/root-interaction-controller.test.tsx`, `bun --filter ./packages/plite-react typecheck`, `bun --filter ./packages/plite-browser typecheck`, focused WebKit/Chromium/Firefox Playwright repeats, full editable-voids desktop sweep, and `bun check`. | Added focused-native-text resolver contract; selection diagnostics now print expected/model/native/click-point state. WebKit editable-void click/arrow scenario passed 80/80; Chromium/Firefox focused repeats passed 60/60; full editable-voids desktop file passed 69/69; `bun check` passed after formatting. | keep | Repeat full gate to check for residual flakes. |
| proof-004 | 3 | slate-auto / full gate | Full gate after editable-void repair found a hard stable-lane regression, not a retry-only flake: plaintext Shift+click collapsed instead of extending selection in every desktop engine. | Command: `bun check:full` from `.tmp/plite`. | Failed 3 hard rows, all same test: Chromium/Firefox/WebKit `plaintext › Shift+click extends a collapsed text selection`; 2 flaky rows: Chromium pagination drag autoscroll, Firefox richtext collapsed italic hotkey. 2009 passed, 562 skipped, 12.2m. | keep gate, repair stable failure | Rerun broad gate after focused repair; pagination remains alpha/out-of-scope unless repeated evidence broadens it. |
| behavior-003 | 3 | slate-react / Playwright | Focused native text coordinate placement must not own modifier clicks; Shift+click should stay browser-owned so native selection can extend and then import to Plite. | Changed `.tmp/plite/packages/plite-react/src/editable/root-interaction-controller.ts` and `.tmp/plite/packages/plite-react/test/root-interaction-controller.test.tsx`; commands: `bun run test:vitest test/root-interaction-controller.test.tsx test/root-interaction-resolver.test.ts`, focused Shift+click Playwright row across Chromium/Firefox/WebKit, full plaintext desktop sweep, full editable-voids desktop sweep, `bun --filter ./packages/plite-react typecheck`, `bun --filter ./packages/plite-browser typecheck`, `bun check`. | Unit guard passed 23 tests; focused Shift+click passed 3/3; full plaintext desktop passed 113/113 with 16 expected skips; full editable-void desktop passed 69/69; package typechecks and `bun check` passed. | keep | Rerun broad gate before final readiness score. |
| proof-005 | 4 | slate-auto / full gate | The stable-lane repairs need broad release-proof confirmation before shifting back to API/docs beta review. | Command: `bun check:full` from `.tmp/plite`. | Exit 0 after 11.5m: 2013 passed, 562 skipped, 1 retry-only flake in Chromium pagination autoscroll. Desktop visual-native smoke rows passed in Chromium, Firefox, and WebKit; huge-document staged/auto/virtualized rows passed across desktop engines. | keep | Continue public API/docs/examples/proof-helper audit; keep pagination alpha flake as scoped residual unless pagination becomes in scope. |
| docs-003 | 5 | slate-auto / docs | Public docs had release/publish-style wording even though this run is private-alpha beta-readiness review, not a release command. | Changed `.tmp/plite/Readme.md`, `docs/libraries/slate-react/event-handling.md`, `docs/libraries/slate-react/experimental-virtualized-rendering.md`, `docs/libraries/slate-react/editable.md`, `docs/libraries/slate-layout/README.md`, `docs/general/docs-proof-map.md`, and `packages/plite-browser/README.md`; stale wording/import scans are clean. | Docs/API proof only; no browser route behavior changed. | keep | Continue site example complexity and JSDoc/package metadata audit. |
| api-001 | 5 | plite-browser / public API | `plite-browser/core` exported proof-suffixed helper aliases alongside canonical names, making the proof API look like generated clutter. | Changed `.tmp/plite/packages/plite-browser/src/core/index.ts` and `.tmp/plite/packages/plite-browser/test/core/package-scripts.test.ts`; command: `cd packages/plite-browser && bun test:core test/core/package-scripts.test.ts`; final `bun check`. | Package proof: core test suite passed, stale alias grep only finds negative guard strings, and `bun check` passed. | keep | Audit remaining public helper/JSDoc surfaces. |
| proof-006 | 5 | slate-auto / fast gate | The last docs/API cleanup needed a fresh fast gate after the README wording patch. | Command: `bun check` from `.tmp/plite`. | Pass: lint, 7 package typechecks, 1218 Bun tests, 47 slate-layout tests, and 804 slate-react Vitest tests. | keep | Continue with next beta-readiness checkpoint; do not hand off before 22:10 CEST. |
| proof-007 | 30 | slate-auto / full gate refresh | Final broad refresh after docs/example packets must not be called green if an out-of-scope lane fails hard or a stable lane flakes. | Command: `bun check:full` from `.tmp/plite`. | Exit 1 after 11.7m: 2012 passed, 562 skipped, 1 hard Chromium pagination autoscroll failure after retries, 1 retry-only Firefox mentions drag-selection flake; desktop visual-native smoke and huge-document cross-browser rows passed. | keep evidence / scoped blocker | Repeat/repair the mentions flake; queue pagination as explicit-opt-in scoped blocker. |
| behavior-004 | 31 | slate-auto / Playwright | Firefox drag selection across leading inline mention voids could silently select empty text when the drag started inside `contentEditable=false` inline void content. | Changed `.tmp/plite/playwright/integration/examples/mentions.test.ts`; commands: no-retry Firefox repeat before repair, focused cross-browser row, cross-browser repeat, full desktop mentions suite, and `bun check`. | Before: Firefox no-retry repeat failed 5/10 with empty selected text. After: focused row passed Chromium/Firefox/WebKit, repeat passed 15/15, full desktop mentions suite passed 55 with 14 expected skips, `bun check` passed. | keep | Continue runtime selection risk review and non-pagination beta audit. |
| proof-008 | 32 | slate-auto / slate-react | Runtime selection ownership is the highest-risk behavior patch; source review should not rely on earlier broad gates alone. | Read `root-interaction-controller.ts`, `root-interaction-resolver.ts`, and their tests; ran `cd packages/plite-react && bun run test:vitest test/root-interaction-controller.test.tsx test/root-interaction-resolver.test.ts`; ran focused plaintext Playwright Shift+click and double-click-drag rows across Chromium/Firefox/WebKit. | Unit proof passed 23/23; browser proof passed 6/6. Source review found no new runtime patch needed. | keep no-code proof | Sample remaining public reference docs. |
| docs-009 | 33 | slate-auto / docs | Remaining high-traffic React reference pages should not contain invalid copy-paste snippets or release-sounding wording. | Changed `.tmp/plite/docs/libraries/slate-react/react-editor-setup.md` and `.tmp/plite/docs/libraries/slate-react/annotations.md`; ran public-surface contract, site typecheck, and `bun check`. | Public-surface contract passed 594 tests; site typecheck passed; `bun check` passed. | keep | Review public-surface guard strictness. |
| proof-009 | 34 | slate-auto / testing | The public-surface contract did not catch top-level editor hook snippets in docs. | Changed `.tmp/plite/packages/plite/test/public-surface-contract.ts`, `.tmp/plite/docs/libraries/slate-react/slate.md`, and `.tmp/plite/docs/walkthroughs/01-installing-slate.md`; ran exact `rg` scan, public-surface contract, site typecheck, and `bun check`. | Guard initially failed on `docs/walkthroughs/01-installing-slate.md`; after repair, exact scan has no matches, public-surface contract passed 594 tests, site typecheck passed, and `bun check` passed. | keep | Continue docs/API source sync sampling. |
| api-004 | 35 | slate-auto / plite-dom | Public DOM capability exposed Android text-repair internals and docs omitted `resolveRangeRect`. | Changed `.tmp/plite/packages/plite-dom/src/plugin/dom-editor.ts`, `.tmp/plite/packages/plite-dom/test/public-surface-contract.ts`, and `.tmp/plite/docs/libraries/slate-react/react-editor.md`; ran `bun --filter ./packages/plite-dom typecheck`, public-surface contracts, `bun check`, `bun --filter ./packages/plite-dom build`, and declaration audit. | Focused typecheck passed; public-surface contracts passed 601 tests; `bun check` passed; `plite-dom` build passed; built `DOMEditorCapability` contains `resolveRangeRect` and no Android repair methods. | keep | Refresh public export/source contracts. |
| proof-010 | 36 | slate-auto / plite-dom | DOM API hard cut needs an exact public runtime key guard, not just negative assertions for two removed names. | Changed `.tmp/plite/packages/plite-dom/test/public-surface-contract.ts`; ran focused public-surface contract, `plite-dom` typecheck, and `bun check`. | Initial guard failed because `clipboard` is intentionally split out of `api.dom`; corrected guard passed 8 tests, typecheck passed, and `bun check` passed with 1221 Bun tests and 804 slate-react Vitest tests. | keep | Scan remaining public runtime APIs for internal-looking leaks. |
| api-005 | 37 | slate-auto / public API | Weak-map runtime state should not be exported from public `plite-dom` or re-exported by public `plite-react`. | Changed `.tmp/plite/packages/plite-dom/src/index.ts`, `packages/plite-dom/src/internal/index.ts`, `packages/plite-react/src/index.ts`, package-internal imports/tests, `packages/plite-dom/test/public-surface-contract.ts`, and `packages/plite-react/test/surface-contract.tsx`; ran AST leak scan, focused contracts/typechecks, `bun test:vitest`, and `bun check`. | Public `plite-dom` and `plite-react` roots now expose no weak-map runtime state; `plite-dom/internal` owns those exports; no public weak-map imports remain; full `bun check` passed with 1222 Bun tests, 47 slate-layout tests, and 805 slate-react Vitest tests. | keep | Continue transform/clipboard contract audit. |
| examples-004 | 38 | slate-auto / clipboard + example DX | Clipboard/paste docs and contracts should read like current API, and user-facing examples must not carry stale generated phrasing. | Changed `.tmp/plite/site/examples/ts/inlines.tsx` and `.tmp/plite/playwright/integration/examples/inlines.test.ts`; commands: stale wording scan, core clipboard contract, DOM clipboard boundary, hidden DOM clipboard rows, projected clipboard Vitest, site typecheck, focused inlines browser row, and focused paste-html browser rows. | Core clipboard passed 35 tests; DOM clipboard boundary passed 37 tests; hidden DOM clipboard rows passed 2/2; projected clipboard passed 6/6; site typecheck passed; Chromium inlines row passed 1/1; Chromium paste-html rows passed 2/2. | keep | Continue text transform contract audit. |
| docs-015 | 39 | slate-auto / transforms API | Text transform docs/source comments should describe current transaction-target semantics and deletion options before beta users copy them. | Changed `.tmp/plite/packages/plite/src/interfaces/transforms/text.ts` and `.tmp/plite/docs/api/transforms.md`; commands: focused transform/delete/text-units contracts, `slate` typecheck, public-surface contract, site typecheck, stale old-wording scan, and `bun check`. | Focused core contracts passed 67 tests; `slate` typecheck passed; public-surface contract passed 594 tests; site typecheck passed; stale old-wording scan clean; `bun check` passed with 1222 Bun tests, 47 slate-layout tests, and 805 slate-react Vitest tests. | keep | Audit `plite-history` API/docs next. |
| docs-016 | 40 | slate-auto / slate-history API | History docs and source types should reflect v2 state-field history, not only operation undo/redo. | Changed `.tmp/plite/packages/plite-history/src/history.ts`, `history-extension.ts`, `docs/libraries/slate-history/README.md`, `history.md`, and `history-editor.md`; commands: `plite-history` typecheck, runtime history fixture suite, focused history/document-state contracts, generic type contract tsconfig, public-surface contract, site typecheck, focused Chromium undo/redo browser smoke, and `bun check`. | Package typecheck passed; fixture runner passed 16 tests; focused history contracts passed 67 tests; generic type contract passed; public-surface contract passed 594 tests; site typecheck passed; browser undo/redo smoke passed 5/5; `bun check` passed with 1222 Bun tests, 47 slate-layout tests, and 805 slate-react Vitest tests. | keep | Audit React hook API/docs next. |
| docs-017 | 41 | slate-auto / slate-react hooks API | Public React hooks docs/source should cover the hooks users copy from examples and not carry stale type names or duplicate source paths. | Changed `.tmp/plite/docs/libraries/slate-react/hooks.md`, `packages/plite-react/src/hooks/use-slate-runtime.tsx`, `use-slate-history.ts`, `use-slate-root-chrome.ts`, `use-slate-content-root.ts`, `use-slate-child-root.ts`, `use-element-path.ts`, `use-element-selected.ts`, `use-slate-annotations.tsx`, `use-slate-widget-store.tsx`, and `use-slate-widgets.tsx`; commands: stale type/duplicate scan, focused React hook Vitest suite, `plite-react` typecheck, public/surface contracts, site typecheck, and `bun check`. | Focused hook suite passed 122 tests across 8 files; `plite-react` typecheck passed; public/surface contracts passed 628 tests across 2 files; site typecheck passed; stale type scan is clean; `bun check` passed with 1222 Bun tests, 47 slate-layout tests, and 805 slate-react Vitest tests. | keep | Audit React component prop/docs contract next. |
| docs-018 | 42 | slate-auto / slate-react component props | Public `Editable` docs should match the actual public wrapper props, not only a stale simplified prop sketch. | Changed `.tmp/plite/docs/libraries/slate-react/editable.md` and `.tmp/plite/packages/plite-react/test/surface-contract.tsx`; commands: focused `plite-react` surface contract, `plite-react` typecheck, public-surface contract, site typecheck, and `bun check`. | `plite-react` surface contract passed 35 tests; `plite-react` typecheck passed; public-surface contract passed 594 tests; site typecheck passed; `bun check` passed with 1222 Bun tests, 47 slate-layout tests, and 806 slate-react Vitest tests. | keep | Audit annotation/widget API/docs contract next. |
| docs-019 | 43 | slate-auto / slate-react annotations + widgets | Annotation/widget docs and source types should teach the scalable projector API and widget anchor shape instead of only static arrays. | Changed `.tmp/plite/docs/libraries/slate-react/hooks.md`, `docs/libraries/slate-react/annotations.md`, `packages/plite-react/src/annotation-store.ts`, `packages/plite-react/src/widget-store.ts`, and `packages/plite-react/test/surface-contract.tsx`; commands: focused annotation/widget/surface Vitest suite, `plite-react` typecheck, site typecheck, public-surface contract, and `bun check`. | Focused annotation/widget/surface suite passed 55 tests across 3 files after fixing one over-strict regex guard; `plite-react` typecheck passed; site typecheck passed; public-surface contract passed 594 tests; `bun check` passed with 1222 Bun tests, 47 slate-layout tests, and 806 slate-react Vitest tests. | keep | Audit range/bookmark API/docs next. |
| api-002 | 6 | plite-dom / public API | Public examples imported DOM coverage types/value from `plite-dom/internal`, which teaches an internal path and makes the documented boundary feature feel unsupported. | Changed `.tmp/plite/packages/plite-dom/src/index.ts`, `.tmp/plite/packages/plite-dom/test/public-surface-contract.ts`, `.tmp/plite/packages/plite/test/public-surface-contract.ts`, `.tmp/plite/site/examples/ts/hidden-content-blocks.tsx`, and `.tmp/plite/site/examples/ts/dom-coverage-boundaries.tsx`; commands: `bun test ./packages/plite-dom/test/public-surface-contract.ts`, `bun --filter ./packages/plite-dom typecheck`, `bun typecheck:site`, `bun --filter ./packages/plite-dom build`, `bun test ./packages/plite/test/public-surface-contract.ts ./packages/plite-dom/test/public-surface-contract.ts`, and `bun check`. | Package/docs/example proof: focused contracts passed 496 tests, `plite-dom` typecheck/build passed, site typecheck passed, internal import grep is clean for public docs/examples, and `bun check` passed after sorting the barrel. | keep | Continue JSDoc/package metadata audit. |
| examples-001 | 6 | slate-auto / example DX | Public examples should not use impossible casts or `any` editor types. | Changed `.tmp/plite/site/examples/ts/decorations-async.tsx`, `.tmp/plite/site/examples/ts/search-highlighting.tsx`, and `.tmp/plite/packages/plite/test/public-surface-contract.ts`; commands: `bun typecheck:site`, `bun test ./packages/plite/test/public-surface-contract.ts`, and type-slop grep. | Site typecheck passed; public-surface contract passed 530 tests; grep found no `ReactEditor<any>`, `as never`, or public internal imports in docs/examples. | keep | Continue remaining beta-readiness audits; run `bun check` after next code packet or before handoff. |
| docs-004 | 6 | slate-auto / docs proof | Public markdown anchors were stale: `trasnform-methods`, editor `mark-methods`, and FAQ `why-is-content-is-pasted...`. | Changed `.tmp/plite/docs/api/locations/path-ref.md`, `.tmp/plite/docs/api/locations/point-ref.md`, `.tmp/plite/docs/concepts/02-nodes.md`, `.tmp/plite/docs/general/faq.md`, and `.tmp/plite/packages/plite/test/public-surface-contract.ts`; commands: `bun test ./packages/plite/test/public-surface-contract.ts` and `bun check`. | Scratch validator reported no missing relative doc files or markdown anchors; public-surface contract passed 593 tests with durable markdown link/anchor validation; `bun check` passed after formatting the validator. | keep | Continue beta-readiness supervision; no handoff before 22:10 CEST. |
| api-003 | 7 | slate-auto / public API DX | Public API exports should carry enough source-level intent for beta users and agents to copy the right constructor/hook without reading internals. | Changed `.tmp/plite/packages/plite/src/core/editor-extension.ts`, `.tmp/plite/packages/plite/src/core/state-field.ts`, `.tmp/plite/packages/plite/src/core/element-property.ts`, `.tmp/plite/packages/plite-dom/src/plugin/dom-coverage.ts`, `.tmp/plite/packages/plite-react/src/plugin/with-react.ts`, `.tmp/plite/packages/plite-react/src/hooks/use-slate-editor.ts`, `.tmp/plite/packages/plite-react/src/hooks/use-editor-selector.tsx`, and `.tmp/plite/packages/plite-react/src/hooks/use-slate-decoration-source.ts`; commands: package typechecks, public-surface contracts, `plite-react` surface contract, and `bun check`. | No runtime/browser behavior changed; package proof and fast gate passed. | keep | Continue beta-readiness supervision; next packet should audit remaining public example/doc complexity or beta scorecard gaps. |
| examples-002 | 7 | slate-auto / example DX | Public examples should not teach `@ts-expect-error`; platform type gaps need explicit local types. | Changed `.tmp/plite/site/examples/ts/huge-document.tsx` and `.tmp/plite/packages/plite/test/public-surface-contract.ts`; commands: public example slop scan, `bun typecheck:site`, `bun test ./packages/plite/test/public-surface-contract.ts`, and `bun check`. | No runtime behavior changed; site typecheck, public contract, slop scan, and fast gate passed. | keep | Continue beta-readiness supervision; no final before 22:10 CEST. |
| docs-005 | 8 | slate-auto / docs DX | `plite-react` README should be a usable beta front door, not a thin link wrapper. | Changed `.tmp/plite/docs/libraries/slate-react/README.md`; commands: `bun test ./packages/plite/test/public-surface-contract.ts`, `bun typecheck:site`, and `bun check`. | Public markdown contract caught and fixed one missing `widgets.md` link; site typecheck and fast gate passed. | keep | Continue beta-readiness supervision; next packet should score remaining review burden. |
| docs-006 | 8 | slate-auto / docs/API | Editor API docs must match the actual public `BaseEditor` shape. | Changed `.tmp/plite/docs/api/nodes/editor.md`; commands: source/docs grep, `bun test ./packages/plite/test/public-surface-contract.ts`, stale-pattern scan, and `bun check`. | Public markdown/API contract and fast gate passed; docs now include runtime APIs, typed extension lookup, commit subscription, and update context. | keep | Continue beta-readiness supervision; next packet should target remaining review burden or behavior proof refresh. |
| docs-007 | 9 | slate-auto / docs DX | Public concept snippets should look copyable and intentional. | Changed `.tmp/plite/docs/concepts/07-editor.md`; commands: `bun test ./packages/plite/test/public-surface-contract.ts`, `bun typecheck:site`, and `bun check`. | Docs contract, site typecheck, and fast gate passed. | keep | Continue with review-burden scorecard. |
| docs-008 | 9 | slate-auto / package docs | npm-facing package READMEs should describe current package ownership and stable entrypoints. | Changed `.tmp/plite/packages/plite/README.md`, `.tmp/plite/packages/plite-react/README.md`, `.tmp/plite/packages/plite-history/README.md`, `.tmp/plite/packages/plite-hyperscript/README.md`, and added `.tmp/plite/packages/plite-dom/README.md`, `.tmp/plite/packages/plite-layout/README.md`; commands: stale README scan, `bun test ./packages/plite/test/public-surface-contract.ts`, `bun typecheck:site`, and `bun check`. | Stale README scan, public contract, site typecheck, and fast gate passed. | keep | Continue with beta scorecard and review-priority map. |
| docs-009 | 10 | slate-auto / docs DX | Serialization docs should teach current document values and app-owned schema policy. | Replaced `.tmp/plite/docs/concepts/10-serializing.md`; commands: public-surface contract, stale serialization scan, site typecheck, and `bun check`. | Docs contract, stale scan, site typecheck, and fast gate passed. | keep | Continue high-traffic docs sample or refresh behavior proof later. |
| docs-010 | 11 | slate-auto / docs/API | Subscribe docs should distinguish generic change subscriptions from commit-only subscriptions. | Changed `.tmp/plite/docs/libraries/slate-react/slate.md`, walkthroughs 06/07, and concepts 07/14; commands: public-surface contract, stale subscribe-pattern scan, site typecheck, and `bun check`. | Contract passed 593 tests; stale subscribe scan had no hits; site typecheck and fast gate passed. | keep | Continue public docs claim-width scan, then rerun broad browser proof later in the 8h floor. |
| docs-011 | 12 | slate-auto / docs DX | Nodes docs must describe v2 persisted roots/state and editable element/text trees, not legacy editor-child storage. | Replaced `.tmp/plite/docs/concepts/02-nodes.md` and changed `.tmp/plite/packages/plite/test/public-surface-contract.ts`; commands: stale nodes scan, public-surface contract, site typecheck, and `bun check`. | Stale scan had no hits; public contract passed 593 tests; site typecheck and fast gate passed. | keep | Continue high-traffic docs semantic drift scan. |
| docs-012 | 13 | slate-auto / docs/API | Plite component docs should match current public callback props and keep `initialValue` on editor creation, not on `<Plite>`. | Changed `.tmp/plite/docs/libraries/slate-react/slate.md` and `.tmp/plite/packages/plite/test/public-surface-contract.ts`; commands: targeted prop scan, public-surface contract, site typecheck, and `bun check`. | Public contract passed 594 tests; site typecheck and fast gate passed. | keep | Continue rendering/commands docs sample. |
| docs-013 | 14 | slate-auto / docs DX | First-user walkthroughs should be TypeScript-first, direct, and free of old v1 tutorial copy. | Changed `.tmp/plite/docs/walkthroughs/01-installing-slate.md`, `02-adding-event-handlers.md`, `05-executing-commands.md`, and `docs/concepts/09-rendering.md`; commands: stale-prose/API scan, public-surface contract, site typecheck, and `bun check`. | Stale-prose scan had no hits; public contract passed 594 tests; site typecheck and fast gate passed. | keep | Continue API/reference docs sample. |
| docs-014 | 15 | slate-auto / docs DX | Core concept docs should teach current roots/state, `*Api` helper namespaces, and transaction/runtime APIs. | Changed `.tmp/plite/docs/concepts/01-interfaces.md`, `03-locations.md`, `05-operations.md`, `06-commands.md`, and `11-normalizing.md`; commands: stale concept-doc scan, public-surface contract, site typecheck, and `bun check`. | Stale scan has only legitimate `assertPliteNode` API names and DOM `Node.*` constants; public contract passed 594 tests; site typecheck and fast gate passed. | keep | Rescore beta readiness and pick next highest-risk gap. |
| release-audit-001 | 16 | slate-auto / release metadata | Public beta confidence cannot exceed 95 if package version/peer/changelog metadata is inconsistent. | Audited package versions, exports, peer floors, and `.changeset/**`; no package metadata changed. | Peer floors target next publish versions; many changesets include majors. This needs a release-owner pass, not a drive-by patch. | defer | Keep as `release-metadata` stopping checkpoint. |
| package-004 | 56 | slate-auto / package metadata | Packed `plite-react` tarball installed from source package data failed for consumers because `dependencies.plite-history` was `workspace:*`. | Changed `.tmp/plite/packages/plite-react/package.json` and `.tmp/plite/packages/plite/test/release-scripts-contract.ts`; commands: failed-before `npm install --package-lock-only` from packed `plite-react`; `bun install --frozen-lockfile`; focused release contract; `plite-react` surface contract; all local package tarballs; temp consumer lockfile install; packed `plite-react` manifest inspection; `bun check`. | No browser behavior changed. Package proof passed: tarball manifest now has `plite-history: >=0.115.0`, consumer-facing workspace-protocol scan is empty, temp install over local tarballs exits 0, and `bun check` passed. | keep | Continue supervision; version/changelog release-owner work remains queued. |
| proof-011 | 57 | slate-auto / public example proof map | Example route coverage should not depend on reviewer memory or spec-name coincidence. | Changed `.tmp/plite/packages/plite/test/public-surface-contract.ts`; commands: route/spec map audit, `bun test ./packages/plite/test/public-surface-contract.ts`, `bun --filter ./packages/plite typecheck`, `bun typecheck:site`, and `bun check`. | No route behavior changed. Proof-system guard now requires every example registry route to have a direct Playwright example spec or a classified alias; `custom-placeholder -> placeholder` and `android-tests -> query-controls` are explicit. Final public-surface contract passed 601 tests and `bun check` passed. | keep | Continue supervision; next useful owner should be another scoped docs/API/proof gap or a final broad gate near closeout. |
| proof-012 | 58 | slate-auto / broad browser proof | Every non-pagination example spec should be exercised before a beta-readiness confidence call. | Command: `bun run playwright` over every `playwright/integration/examples/*.test.ts` except `pagination.test.ts`, across Chromium/Firefox/WebKit. | Broad run exited 0: 1676 passed, 112 expected skips, 3 retry-only flakes, 0 hard failures, 9.9m. Treat as strong proof with load-flake caveat, not perfect-green proof. | keep evidence | Isolate the three retry rows with retries disabled. |
| proof-013 | 59 | slate-auto / flake isolation | Retry-only rows from a broad browser proof must not be silently accepted. | Commands: Firefox visual-native two-row repeat with `--repeat-each=20 --retries=0`; WebKit multi-root undo/caret row with `--repeat-each=20 --retries=0`. | Firefox visual-native rows passed 40/40; WebKit multi-root row passed 20/20. The bulk-run retries are classified as resource-pressure proof smell, not deterministic editor behavior failure. | keep no-code proof | Continue supervision until the 8h floor. |
| proof-014 | 60 | plite-browser / skip-quality audit | The 112 expected skips in the full non-pagination desktop proof should be guarded against weak or missing justifications. | Changed `.tmp/plite/packages/plite-browser/test/core/keyboard-oracle-audit.test.ts`; commands: skip-reason scan, `bun --filter ./packages/plite-browser test:core test/core/keyboard-oracle-audit.test.ts`, `bun --filter ./packages/plite-browser typecheck`, and `bun check`. | No runtime/browser behavior changed. New core guard requires literal reasons for non-pagination example `test.skip` calls and rejects weak reasons like flaky/placeholder/temporary/broken; focused proof, package typecheck, and `bun check` passed. | keep | Continue supervision; do not parallelize managed Playwright. |
| runtime-006 | 61 | slate-react / Android input manager | Live Android input code carried a no-op `debug` helper, ten no-op callsites, and an `any`-typed `DataTransfer` guard. | Changed `.tmp/plite/packages/plite-react/src/hooks/android-input-manager/android-input-manager.ts`; commands: focused slop scan, `bun --filter ./packages/plite-react test:vitest test/android-input-manager-contract.test.ts`, `bun --filter ./packages/plite-react typecheck`, and `bun check`. | No Android/raw-device claim changed. Dead debug calls are gone, the type guard takes `unknown`, focused Android manager contract passed 24 tests, `plite-react` typecheck passed, and `bun check` passed. | keep | Continue public-source slop scan or API review supervision. |
| runtime-007 | 62 | slate-react / keyboard direction | `keyboard-input-strategy.ts` carried a live `@ts-expect-error` around the untyped `direction` package. | Changed `.tmp/plite/packages/plite-react/src/editable/keyboard-input-strategy.ts`, `.tmp/plite/packages/plite-react/package.json`, and `.tmp/plite/bun.lock`; commands: `bun install`, no-reference grep for `direction`, `bun --filter ./packages/plite-react typecheck`, focused keyboard strategy Vitest, `bun check`, `bun --filter ./packages/plite-react build`, and direct `dist` import smoke. | Removed the untyped runtime dependency and suppression; focused keyboard strategy contract passed 39 tests, `plite-react` typecheck/build passed, `plite-react dist import ok`, and `bun check` passed. | keep | Continue supervision; rerun slop scan for the next source-quality checkpoint. |
| runtime-008 | 63 | slate-react / change callbacks | `usePliteChangeCallbacks` narrowed the editor to a fake `subscribe` shape and then used seven `editor as any` casts to call snapshot/commit APIs. | Changed `.tmp/plite/packages/plite-react/src/components/slate.tsx`; commands: targeted cast scan, `bun --filter ./packages/plite-react test:vitest test/slate-runtime-provider-contract.test.tsx`, `bun --filter ./packages/plite-react typecheck`, and `bun check`. | No public API or behavior semantics changed. Runtime-provider contract passed 37 tests, package typecheck passed, targeted scan no longer finds `Editor.getSnapshot(editor as any)`, `Editor.getLastCommit(editor as any)`, or `subscribe(onContextChange)`, and `bun check` passed. | keep | Continue supervision; remaining `as any` rows are shared context/internal bridge boundaries unless a tighter owner proves otherwise. |
| runtime-009 | 64 | slate / runtime view | Core view-root wrappers used four callsite `as any` casts for generator/query state methods. | Changed `.tmp/plite/packages/plite/src/editor-runtime-view.ts`; commands: targeted cast scan, `bun test ./packages/plite/test/editor-runtime-view-contract.ts`, `bun --filter ./packages/plite typecheck`, and `bun check`. | No public API or behavior semantics changed. Editor-runtime-view contract passed 53 tests, `slate` typecheck passed, targeted scan no longer finds view-root `as any` callsites, and `bun check` passed. | keep | Continue supervision; avoid over-cleaning remaining generic boundary casts without an owner proof. |
| runtime-010 | 65 | slate-react / content-root navigation | Content-root navigation carried two local `as any` casts for root-view WeakMap lookup and DOM node resolution. | Changed `.tmp/plite/packages/plite-react/src/editable/content-root-navigation.ts`; commands: targeted cast scan, `bun --filter ./packages/plite-react test:vitest test/content-root-navigation-contract.test.ts`, `bun --filter ./packages/plite-react typecheck`, and `bun check`. | No public API or behavior semantics changed. Content-root navigation contract passed 21 tests, `plite-react` typecheck passed, targeted scan no longer finds the local `as any` rows, and `bun check` passed. | keep | Remaining `as any` rows are generic React context or runtime view bridging; stop over-cleaning without owner proof. |
| package-005 | 66 | slate-auto / package artifacts | Latest kept source packets changed `slate` and `plite-react` after the earlier package build/import proof. | Commands: `bun --filter ./packages/plite build`, `bun --filter ./packages/plite-react build`, and direct Node imports of `./packages/plite/dist/index.js`, `./packages/plite/dist/internal/index.js`, and `./packages/plite-react/dist/index.js`. | Corrected import smoke passed for public `slate` (`createEditor`, `createEditorRuntime`, `createEditorView`), `plite/internal` (`Editor`, `getSnapshotVersion`), and `plite-react` (`Editable`, `Plite`, `createReactEditor`). | keep | Continue supervision; final browser proof can rely on fresh package artifacts. |
| docs-018 | 67 | slate-auto / docs drift | Public docs/source drift scan after late source/API cleanup should classify suspicious terms instead of trusting stale confidence. | Artifact: `.tmp/plite/.tmp/slate-auto/public-doc-api-drift.json`; commands: `bun test ./packages/plite/test/public-surface-contract.ts`, `bun typecheck:site`, and `pnpm docs:plite:audit` from parent. | No doc patch needed. Old API hits were package changelogs or internal sibling imports, release hits were contributor/release-proof owners or ordinary verbs, mobile hits were scoped raw-device/Appium docs, and pagination hits were explicit experimental/deferred docs/examples. Public-surface contract passed 601 tests, site typecheck passed, and parent docs audit passed. | keep no-code proof | Continue supervision; next owner should be final browser/proof refresh or review-map closeout. |
| proof-015 | 68 | slate-auto / Playwright | The first refreshed full non-pagination desktop sweep after source-quality packets exposed one Firefox richtext retry-only navigation flake. | Changed `.tmp/plite/playwright/integration/examples/richtext.test.ts`; commands: broad non-pagination Playwright sweep, focused Firefox repeat before/after, and full Firefox richtext file. | Added DOM selection settle before the next vertical ArrowUp in the chained browser-editing scenario; focused Firefox row passed 20/20 no-retry after repair, and full Firefox richtext later passed 91 with 28 expected skips. | keep | Continue broad proof refresh; repair any new retry-only stable-lane smell. |
| proof-016 | 69 | slate-auto / Playwright | The full Firefox richtext file then exposed a select-all setup race where native selection/deletion sometimes did not empty the editor before the assertion path continued. | Changed `.tmp/plite/playwright/integration/examples/richtext.test.ts`; commands: focused Firefox repeat and full Firefox richtext file. | Added selected-text proof after native select-all and model-empty proof after Backspace on the affected richtext setup rows; focused Firefox row passed 20/20 no-retry, and full Firefox richtext passed 91 with 28 expected skips. | keep | Continue broad proof refresh. |
| proof-017 | 70 | plite-browser / Playwright | The latest broad non-pagination desktop sweep had one retry-only Firefox inline-link drag flake: model/native selection collapsed at offset 0 instead of selecting `hyperlink` backward. | Changed `.tmp/plite/packages/plite-browser/src/playwright/index.ts`; commands: `bun --filter ./packages/plite-browser typecheck`, Firefox inline-link drag 40/40 no-retry repeat, and full desktop `visual-native-selection-smoke.test.ts` across Chromium/Firefox/WebKit with retries disabled. | `dragTextRange` now uses a 1px inset for end-of-glyph drag endpoints instead of `rect.right - 0.25`; focused Firefox repeat passed 40/40 and full desktop visual-native smoke passed 27/27. | keep | Rerun broad non-pagination example-registry proof after helper patch. |
| proof-018 | 71 | slate-auto / Playwright | The helper repair needed a broad proof refresh, not only focused repeats. | Command: `files=($(find playwright/integration/examples -maxdepth 1 -type f -name '*.test.ts' ! -name 'pagination.test.ts' | sort)); bun run playwright "${files[@]}" --project=chromium --project=firefox --project=webkit`. | Clean broad non-pagination desktop registry sweep: 1679 passed, 112 expected skips, 0 flakes, 0 hard failures, 10.7m. | keep | Run final fast gate after browser helper/test edits. |
| proof-019 | 72 | plite-browser / testing | The final fast gate exposed that the project-gated return audit keyed classifications by line number, which is fragile after nearby test edits. | Changed `.tmp/plite/packages/plite-browser/test/core/keyboard-oracle-audit.test.ts`; commands: focused `plite-browser` core audit, `plite-browser` typecheck, and `bun check`. | Classifications now key on normalized branch source text; focused core audit passed 73 tests, package typecheck passed, and final `bun check` passed with 1226 Bun tests, 48 slate-layout tests, and 807 slate-react Vitest tests. | keep | Continue review-gate/closeout consistency until the 8h floor. |
| review-001 | 73 | autoreview / slate-auto | Closeout review found concrete regressions after the final fast gate. | Command: `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local ...` from `.tmp/plite`. | Accepted findings: benchmark import would break after moving weak maps behind `plite-dom/internal`; keyboard direction detector misclassified modern RTL scripts and over-broad LTR ranges. | fix | Patch both, rerun focused proof, fast gate, and autoreview. |
| review-002 | 74 | slate-react / benchmark proof | Accepted autoreview findings needed targeted fixes with focused proof. | Changed `.tmp/plite/packages/plite-react/src/editable/keyboard-input-strategy.ts`, `.tmp/plite/packages/plite-react/test/keyboard-input-strategy-contract.test.ts`, and `.tmp/plite/scripts/benchmarks/core/current/clipboard-large-payload.mjs`; commands: focused keyboard Vitest, `plite-react` typecheck/build/dist import, benchmark smoke with minimal iterations, core benchmark scripts contract, and `bun check`. | RTL direction detection now uses first-strong Unicode script matching with Adlam and Arabic Extended-A coverage; benchmark imports `EDITOR_TO_WINDOW` from the internal path; focused proof and final fast gate passed with 1226 Bun tests, 48 slate-layout tests, and 808 slate-react Vitest tests. | keep | Rerun autoreview. |
| review-003 | 75 | autoreview / slate-auto | Review-triggered fixes require a clean structured rerun. | Command: `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local ...` from `.tmp/plite`. | Exit 0: `autoreview clean: no accepted/actionable findings reported`; reviewer found no actionable regressions in RTL direction replacement, `plite-dom` internals, public API/docs, or non-pagination editor behavior. | keep | Continue closeout consistency until the 8h floor. |
| review-004 | 76 | autoreview / slate-auto | Final review found two more concrete proof/perf issues. | Command: `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local ...` from `.tmp/plite`. | Accepted findings: huge-document `Heading` subscribed every heading to `useElementSelected()` even when the feature was disabled; project-gated return audit used a six-line search window and could miss longer branches. | fix | Patch both, rerun focused proof, fast gate, and autoreview. |
| review-005 | 77 | slate-auto / docs and proof guards | Accepted review findings needed code/docs/test fixes. | Changed `.tmp/plite/site/examples/ts/huge-document.tsx` and `.tmp/plite/packages/plite-browser/test/core/keyboard-oracle-audit.test.ts`; commands: focused `plite-browser` core audit, site typecheck, and `bun check`. | `useElementSelected()` moved into a selected-heading child rendered only when enabled; project-gated return audit now brace-walks the full branch and has a regression for returns after longer setup; `bun check` passed with 1227 Bun tests, 48 slate-layout tests, and 808 slate-react Vitest tests. | keep | Rerun autoreview. |
| review-006 | 78 | autoreview / slate-auto | Review-triggered fixes require a clean structured rerun. | Command: `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local ...` from `.tmp/plite`. | Accepted finding: public walkthroughs used nonexistent `state.nodes.match(...)` instead of `find`/`entries`. | fix | Patch docs snippets and rerun docs proof, fast gate, and autoreview. |
| review-007 | 79 | docs/API proof | Accepted docs finding needed copy-paste API repair. | Changed `.tmp/plite/docs/walkthroughs/03-defining-custom-elements.md`, `04-applying-custom-formatting.md`, `05-executing-commands.md`, and `docs/concepts/07-editor.md`; commands: stale `nodes.match` scan, public-surface contract, site typecheck, parent docs audit, and `bun check`. | No `nodes.match` hits remain in public docs/source scan; public-surface contract passed 601 tests; site typecheck and parent docs audit passed; `bun check` passed with 1227 Bun tests, 48 slate-layout tests, and 808 slate-react Vitest tests. | keep | Rerun autoreview. |
| review-008 | 80 | autoreview / slate-auto | Final review after docs fix must be clean before check-complete. | Command: `/Users/zbeyens/git/plate-2/.agents/skills/autoreview/scripts/autoreview --mode local ...` from `.tmp/plite`. | Exit 0: `autoreview clean: no accepted/actionable findings reported`; reviewer found no actionable regressions in the inspected changes. | keep | Run autogoal check-complete. |
| examples-003 | 16 | slate-auto / example DX | Public examples should not carry avoidable lint escapes outside explicitly deferred pagination. | Changed `.tmp/plite/site/examples/ts/huge-document.tsx`; commands: eslint/type-slop scan, `bun typecheck:site`, public-surface contract, and `bun check`. | Huge-doc hook disable removed; scan shows only deferred pagination's exhaustive-deps escape remains; site typecheck and fast gate passed. | keep | Continue review-burden scoring. |
| rejected-001 | 2 | plite-browser / testing | Click helper coordinate inset, locator-click routing, and 20ms click delay were plausible helper fixes for the WebKit flake. | Temporary edits in `clickTextOffset`; focused WebKit repeats. | Inset did not remove flake; locator-click worsened and misrouted one mark-leaf click; delay worsened immediately. | reverted | Keep only the diagnostics; do not retry helper-level masking for this failure. |

Behavior proof ledger:
| Family | Route / package | Command / proof | Browser | Result | Follow-up |
|--------|-----------------|-----------------|---------|--------|-----------|
| Stable examples | richtext, plaintext, markdown-shortcuts, editable-voids, placeholder, hidden-content-blocks, inlines | Focused `bun run playwright` grep over key selection/editing examples | Chromium | 11/11 pass | Keep as focused beta smoke; full integration-local still pending. |
| Stable examples cross-browser | richtext, plaintext, markdown-shortcuts, editable-voids, hidden-content-blocks | Focused `bun run playwright` grep over Arrow/ShiftArrow/void/hidden/markdown rows | Firefox/WebKit | 10/10 pass | Keep as cross-engine smoke. |
| Huge document | `huge-document?strategy=staged` and `?strategy=virtualized` | Focused `bun run playwright playwright/integration/examples/huge-document.test.ts` grep | Chromium | 4/4 pass | Run full integration-local before final readiness score. |
| Editable void child root focused repeat | `editable-voids` | WebKit repeat 80; Chromium/Firefox repeat 30 each for `keeps same-runtime child-root arrow navigation usable after clicks` | Chromium/Firefox/WebKit | 140/140 pass after focused-native-text placement fix | Keep product fix; rerun broader gates after next packet. |
| Editable void child root full file | `editable-voids` | Full `editable-voids.test.ts` desktop sweep | Chromium/Firefox/WebKit | 69/69 pass | Keep as broad proof for global root-interaction change. |
| Plaintext modifier and navigation full file | `plaintext` | Full `plaintext.test.ts` desktop sweep with retries off | Chromium/Firefox/WebKit | 113/113 pass, 16 expected skips | Keep modifier-click fix; rerun broad full gate later. |
| Editable void full file after modifier patch | `editable-voids` | Full `editable-voids.test.ts` desktop sweep with retries off | Chromium/Firefox/WebKit | 69/69 pass | Confirms modifier-click fix did not regress earlier editable-void repair. |
| Full integration gate | all non-pagination-skipped desktop/mobile semantic example suites | `bun check:full` | Chromium/Firefox/WebKit/mobile semantic | 2013 passed, 562 skipped, 1 Chromium pagination retry-only flake | Stable-lane behavior proof complete for current packet; pagination remains scoped residual. |
| Broad non-pagination desktop proof | richtext, plaintext, markdown-shortcuts, editable-voids, hidden-content-blocks, inlines, paste-html, placeholder, multi-root-document, visual-native-selection-smoke, huge-document | `bun run playwright` over the listed stable example specs across desktop engines | Chromium/Firefox/WebKit | 1100 passed, 79 expected browser-scope skips | Keep as the latest stable-lane browser proof; all-in gate still blocked only by deferred pagination. |
| Broad non-pagination example-registry proof | every example integration spec except `pagination.test.ts` | `bun run playwright` over all non-pagination example specs | Chromium/Firefox/WebKit | latest after helper patch: 1679 passed, 112 expected skips, 0 flakes, 0 hard failures | Keep as strongest desktop beta behavior proof. |
| Richtext Firefox oracle repair | `richtext` | Focused Firefox repeats and full Firefox richtext file | Firefox | two broad/full-run flakes repaired; focused rows passed 20/20 each; full file passed 91 with 28 skips | Keep setup/settle proof. |
| Visual-native inline-link drag helper repair | `visual-native-selection-smoke` / `plite-browser` | Firefox 40x repeat and full desktop visual-native smoke | Chromium/Firefox/WebKit | 40/40 focused Firefox pass and 27/27 desktop visual-native pass after helper inset repair | Rerun full non-pagination registry. |
| Broad-run flake isolation | Earlier Firefox visual-native collapsed-caret/link-drag rows; WebKit multi-root undo/caret row | Focused no-retry repeats | Firefox/WebKit | earlier 60/60 passed with retries off; latest inline-link drag flake got a helper repair instead of being dismissed | Keep; never hide stable-lane retries in bulk summaries. |

Visual/native selection ledger:
| Scenario | Model selection proof | Native selected text | DOM endpoint / caret / geometry | Screenshot / Browser proof | Result |
|----------|-----------------------|----------------------|-------------------------------|----------------------------|--------|
| Stable editor examples | richtext/plaintext/markdown/voids/placeholder/hidden/inlines | Chromium 11-test grep; Firefox/WebKit 5-test grep | chromium/firefox/webkit | pass | Keep as focused beta smoke; not full-suite parity. |
| Huge-document critical gestures | staged/virtualized Shift+Arrow, select-all delete, scrollbar visual coherence | Model/native/visual assertions inside Playwright route tests | chromium | pass | Screenshot-level final review still pending if a visual surface changes again. |
| Editable void child-root focused clicks | Native/model selection stayed stale while click-point caret hit-test mapped to the expected text point before fix; after fix, event-coordinate placement owns focused native text clicks. | `waitForSelectionSync` now emits expected/model/native snapshots; `clickTextOffset` emits hit/caret point state on failure. | chromium/firefox/webkit | pass 140/140 focused repeats and 69/69 full editable-voids desktop sweep | Keep. |
| Plaintext Shift+click modifier selection | Full gate showed native/model selected text stayed empty after Shift+click in all desktop engines; after fix, browser-native modifier click extends selection and Plite imports it. | Focused row asserts `editor.get.selectedText()`, `window.getSelection().toString()`, model range, and no double highlight. | chromium/firefox/webkit | focused 3/3 pass; full plaintext desktop 113/113 pass | Keep; rerun broad full gate. |
| Desktop visual-native smoke | richtext caret, richtext multi-leaf selection, plaintext backward selection, placeholder caret, hidden DOM boundary drag, image void, inline triple click/link drag, table cell drag | Playwright visual-native smoke rows assert visible/native/projection coherence. | chromium/firefox/webkit | passed inside `bun check:full` | Keep as beta desktop visual proof; no raw-device claim. |
| Broad non-pagination visual/native refresh | visual-native-selection-smoke plus richtext/plaintext/hidden/inlines/huge-document selection rows | Native selected text, projected selection, DOM geometry, and follow-up editing assertions inside Playwright specs. | chromium/firefox/webkit | passed inside 1100-row stable sweep; latest full non-pagination registry proof exposed one Firefox inline-link drag retry, then helper repair passed 40/40 Firefox and 27/27 full desktop visual-native smoke | Keep as latest desktop visual/native proof; screenshot proof only needed if a visible surface changes again. |

plite-browser promotion ledger:
| Pattern | Repeated where | Proposed helper/API | Proof command | Decision |
|---------|----------------|---------------------|---------------|----------|
| Huge document staged/virtualized | Shift+Arrow parity, select-all delete typing undo, scrollbar visual coherence | Playwright grep over `huge-document.test.ts` | pass |
| Selection failure diagnostics | WebKit editable-void flake, future native/model mismatch debugging | `waitForSelectionSync` expected/model/native state plus `clickTextOffset` hit/caret point state | `bun --filter ./packages/plite-browser typecheck`; focused WebKit repeat | keep |
| Core proof API alias cleanup | `plite-browser/core` public barrel | Remove `*Proof` alias exports and keep canonical helper names only | `cd packages/plite-browser && bun test:core test/core/package-scripts.test.ts`; stale alias grep; `bun check` | keep |
| Firefox text drag edge inset | `visual-native-selection-smoke` inline-link drag plus future drag proofs | Harden `dragTextRange` end-of-text coordinates from a subpixel edge to a 1px glyph inset | `bun --filter ./packages/plite-browser typecheck`; Firefox 40/40 repeat; desktop visual-native 27/27 | keep |

Mobile/raw-device claim-width ledger:
| Claim | Proof type | Command / device | Result | Claim width |
|-------|------------|------------------|--------|-------------|
| Mobile editor behavior | scoped semantic/proxy proof | `bun test:release-proof` -> `bun test:mobile-device-proof` | pass | No raw mobile claim. Raw Android/iOS remains deferred until `bun test:mobile-device-proof:raw` can produce device artifacts. |

Huge-document smoke ledger:
| Route / strategy | Gesture | Assertion | Command / proof | Result |
|------------------|---------|-----------|-----------------|--------|
| huge-document staged + virtualized | Shift+ArrowUp/Down, select-all delete typing undo, internal scrollbar jump, repeated bounded Shift+Arrow | model/native/DOM/visual coherence assertions | focused Chromium Playwright grep | pass |
| huge-document staged + auto + virtualized | Shift+ArrowUp/Down, select-all delete typing undo, scroll buffering, blank-gap drag, manual scroll-away typing, middle-block materialization | model/native/DOM/visual coherence assertions | broad non-pagination Playwright sweep across Chromium/Firefox/WebKit | pass |

Workflow slowdowns:
| Step / command | Owner | Elapsed / estimate | Why slow | Evidence produced | Repair decision |
|----------------|-------|--------------------|----------|-------------------|-----------------|
| Broad `rg -n` public API/doc scan | slate-auto | seconds, but high context cost | Asked for match output across docs/site/packages instead of artifact-first counts; output was truncated and less useful. | Switched to `/tmp/plite-beta-api-risk-files.txt`, capped file lists, and `rg --count-matches`. | No skill patch: existing `plite-auto` rule already says artifact-first; operator miss recorded. |
| Broad placeholder/skip scan | slate-auto | seconds, but high context cost | Combined stale-language and skip audits across many roots before writing artifacts. | Replaced with JSON count summaries and `/tmp/plite-skip-gates.txt`; inspected suspicious branches only. | No skill patch yet; repeat would justify another command-shape rule. |
| Public example slop scan | slate-auto | seconds, but high context/output cost | Included package tests and later site build output while searching for public-example type slop. That made obvious internal-test casts and minified output swamp the actual signal. | Reran the scan only on `site/examples/ts` with generated output excluded; actionable result was two `@ts-expect-error` lines in `huge-document.tsx`. | Log as operator miss. Existing artifact-first/capped-scan rules cover it; repeat would justify a source-list helper. |
| Package README discovery | slate-auto | seconds | `find` / `rg --files` only surfaced `plite-browser/README.md`, while exact shell paths proved other package READMEs existed. | Switched to exact path checks before patching. | Log as environment/discovery quirk; use exact expected package paths for package README audits. |
| Wrong `plite-react` surface wrapper path | slate-auto | <1m | Tried nonexistent `packages/plite-react/test/index.spec.ts` before locating `surface-contract.test.tsx`. | Reran with `cd packages/plite-react && bun test:vitest test/surface-contract.test.tsx`. | Existing command-pitfall rule covers wrapper lookup; operator miss recorded. |
| Formatting after large helper patch | slate-auto | <1m | Ran `bun check` before formatting `plite-browser` diagnostics. | `bun check` failed only Biome formatting; `bunx biome check --write packages/plite-browser/src/playwright/index.ts` fixed it; rerun passed. | No skill patch: this is ordinary edit-loop hygiene, but record it as avoidable. |
| Barrel ordering after public export promotion | slate-auto / plite-dom | <1m | First `bun check` after promoting `DOMCoverage` failed only Biome organize-exports ordering in `packages/plite-dom/src/index.ts`. | Manual barrel sort fixed it; rerun `bun check` passed. | No skill patch: normal formatter gate caught it quickly. |
| Markdown validator formatting | slate-auto / slate | <1m | First `bun check` after adding markdown link validation failed only on one long conditional in `packages/plite/test/public-surface-contract.ts`. | Manual wrapping fixed it; rerun `bun check` passed. | No skill patch: formatter gate caught it quickly. |
| Managed mentions Playwright repeats | slate-auto / Playwright | minutes | Repeating one row still pays managed browser/build/server overhead, but it was needed to prove the Firefox flake was real and the repair was cross-browser stable. | Produced failed-before 5/10 Firefox evidence and green-after 15/15 cross-browser plus full mentions suite. | Keep as necessary proof cost; no skill patch because existing rules already require serial managed Playwright and fresh proof after browser-facing edits. |
| Regex import splitter for weak-map hard cut | slate-auto / API cleanup | minutes | A loose regex import splitter overmatched adjacent imports and later routed two `plite-react` tests to nonexistent `../src/internal`. | Package typechecks and `bun check` caught the misses; switched to a TypeScript AST splitter, fixed routes, and final `bun check` passed. | For future broad import moves, use AST from the start. No skill patch yet unless this repeats. |
| Parallel managed Playwright specs | slate-auto / Playwright | minutes | Two `bun run playwright` commands tried to build/serve the Next site at once; this happened during an earlier paste-html proof and repeated during flake isolation, where the WebKit command failed on the Next build lock. | Reran the affected proof serially; paste-html browser rows passed earlier, and the WebKit multi-root flake row later passed 20/20 with retries off. | Hard rule: do not parallelize managed Playwright commands that share the site build/server. |
| Bun wrapper test targeting | slate-auto / Bun tests | minutes | `bunfig.toml` ignores `*.test.*` wrappers, so direct paths like `packages/plite-dom/test/clipboard-boundary.test.ts` do not run. | Located the extensionless owner and ran `bun test ./packages/plite-dom/test/clipboard-boundary.ts`, which passed. | For Plite package tests, target extensionless test owners when wrappers import them. |
| React Vitest argument targeting | slate-auto / Vitest | <1m | First focused hook command mixed extensionless and `.test.tsx` wrapper paths, so Vitest selected only 5 files. | Listed exact test files, reran with `.test.tsx` paths, and got the intended 8-file / 122-test proof. | Use exact `.test.tsx` paths for `plite-react` Vitest suites instead of relying on extensionless owner naming. |
| Keyboard direction helper lint loop | slate-auto / lint | <1m | The first local replacement for `direction` used a combining-mark regex class, then long hex literals without numeric separators. | `bun check` caught both before runtime proof; replaced the regex with code-point ranges and let Biome apply separators. | Keep as normal edit-loop hygiene; no skill patch because the fast gate caught it immediately. |
| Package import smoke expected wrong exports | slate-auto / package proof | <1m | First direct import smoke expected runtime `Editor` from public `slate` and `ReactEditor` from public `plite-react`, but both are type/internal or non-root runtime names in the current package shape. | Reread source exports and reran the smoke with actual public runtime exports plus `plite/internal`; corrected smoke passed. | Record as operator miss; package smoke should read export source or use existing package-shape guards before inventing expected keys. |
| Over-strict regex guard after `=>` | slate-auto / testing | seconds | Added a docs guard with `\b` after `=>`, which can never match because `>` is not a word character. | Replaced with literal `toContain('project: () =>')`; focused annotation/widget/surface suite passed. | For punctuation-heavy snippets, prefer literal containment over boundary regex. |
| Type-only contract run as executable Bun test | slate-auto / Bun tests | <1m | Directly ran `packages/plite-dom/test/generic-dom-contract.ts`, which intentionally contains declared placeholders for typecheck-only proof. | Reran executable owners/wrappers only; `plite-dom` typecheck already covers the generic DOM contract. | Do not run type-only generic contract files directly; use package typecheck or executable owner tests. |
| Formatting gate after layout docs guard | slate-auto / lint | <1m | First `bun check` after adding the slate-layout docs guard failed only on one long `new URL(...)` line. | Wrapped the URL call and reran `bun check`, which passed. | No skill patch: formatter gate caught it immediately. |
| Formatting gate after DOM docs exactness helper | slate-auto / lint | <1m | First `bun check` after adding the docs-vs-runtime helper failed only on long `new URL(...)` and `RegExp(...)` lines. | Wrapped both expressions and reran `bun check`, which passed. | No skill patch: formatter gate caught it immediately. |
| Richtext setup assertion used DOM text for an empty placeholder block | slate-auto / Playwright | <1m | First attempt asserted `blockTexts([''])` after select-all Backspace, but the DOM includes placeholder text in the empty editor. | Switched the setup proof to `editor.assert.modelBlockTexts([''])`, which proves the editor model is empty without fighting placeholder DOM. | Use model assertions for empty-placeholder setup; DOM text assertions only when the visible placeholder is the thing under test. |
| Repetitive richtext setup patch context | slate-auto / patching | <1m | The select-all/backspace setup block appears in nearby tests, so context-only patching landed the same proof in two adjacent rows before the exact flaky row. | Kept the adjacent setup proofs because they guard the same native setup race, then verified the exact flaky row and full Firefox richtext file. | Anchor future repetitive test edits on the test title plus nearest setup block, not only command sequence. |
| Line-number keyed audit classification | plite-browser / testing | <1m | The project-gated return audit classified live branches by physical line number, so a harmless richtext edit broke the guard even though the branch source was unchanged. | Re-keyed classifications by normalized source text; focused core audit, package typecheck, and `bun check` passed. | For durable proof guards, key on semantic/source identity before line number unless exact location is the contract. |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Changed focused native text clicks to use Plite event-coordinate placement even when the editable root is already focused; changed modifier clicks on native text to remain browser-owned so Shift+click extends selection instead of collapsing it; removed proof-suffixed `plite-browser/core` alias exports; hardened `plite-browser` `dragTextRange` end-of-text coordinates with a 1px edge inset for Firefox-safe native drag proof; promoted DOM coverage boundary types/value through `plite-dom`; removed Android text-repair internals from the public `editor.api.dom` capability while keeping the static internal runtime owner; removed no-op Android input manager debug plumbing and tightened its `DataTransfer` guard from `any` to `unknown`; removed `plite-react`'s untyped `direction` runtime dependency and replaced it with a local first-strong-character Unicode script matcher for keyboard direction, then expanded RTL coverage after autoreview; changed `Plite` view-root change callbacks to use `subscribeCommit` and removed avoidable snapshot/commit `any` casts; tightened core runtime-view root wrapper typing so entries/levels/toArray/positions no longer cast through `any`; tightened content-root navigation editor/node typing at root-view and DOM-resolution boundaries; removed weak-map runtime state from public `plite-dom` and `plite-react` roots and moved package-internal consumers plus clipboard benchmark consumers to `plite-dom/internal`; moved huge-document selected-heading subscriptions into a child component that only renders when selected-heading proof is enabled; removed stale duplicate `usePliteWidgetStore` implementation from the widget read-hooks module; added concise JSDoc to high-value extension, state-field, schema property, React editor, DOM coverage, selector, decoration-source, DOM coverage boundary/method, DOM editor, slate-layout reader/helper/hook, text transform option, history, React root/runtime hook, annotation store, and widget store APIs. |
| tests/oracles/browser proof | Added `plite-browser` core audit for project-gated return branches in non-pagination example specs and weak/missing example skip reasons, then hardened the project-gated branch audit to key on branch source instead of line numbers and brace-walk full branches; added selection sync and click-point diagnostics; added focused native text resolver contract; added modifier-click controller guard; repaired mentions inline-void drag proof; added Firefox richtext DOM-settle/setup assertions around native selection races; added public-surface guards for `plite-browser/core` proof aliases, public DOM coverage exports, public docs/examples internal package imports, example type slop, markdown link/anchor validity, top-level hook snippets, Android repair internals leaking onto `editor.api.dom`, the exact `editor.api.dom` key set, React DOM docs exactness against runtime keys, weak-map state leaking from public `plite-dom` / `plite-react` roots, hyperscript docs, plite-dom README/API docs, slate-layout claim width, and example-route browser proof coverage; synced inlines clipboard wording in the browser fixture; ran stable example, huge-document, editable-void, plaintext, mentions, inlines, paste-html, Android input manager contract, latest 1100-row non-pagination desktop browser proof, clean full non-pagination example-registry desktop proof with 1679 passed / 112 skipped / 0 flakes / 0 hard failures after richtext and helper repairs, focused Firefox richtext no-retry repeats, full Firefox richtext proof, Firefox inline-link drag 40/40 no-retry proof, desktop visual-native 27/27 proof, final public-only drift scans, parent docs audit, route/spec coverage proof, release-discipline, repeated autoreview, and final `bun check`. |
| benchmarks/metrics/targets | N/A for perf; benchmark import smoke kept |
| examples/docs | Patched parent Plite claim-width docs for `Editable.decorate` and public-beta review boundary; rewrote `.tmp/plite` README, package READMEs, `plite-react` README, Plite component doc, Editable prop docs, Editor API doc, React DOM API doc, Transforms API doc, Plite History docs, Plite React hooks doc, Plite React annotation/widget docs, Bookmark API doc, Hyperscript docs, Interfaces/Nodes/Locations/Operations/Commands/Serialization/Normalizing concept docs, Editor concept snippet, install/event/command/rendering walkthrough docs, event-handling docs, virtualized-rendering claim wording, layout/readme proof wording, docs proof map, and plite-browser README to current-state language; switched DOM coverage examples to public `plite-dom` imports; tightened async decoration/search highlighting and huge-document example types; fixed top-level hook snippets in `react-editor-setup`, `slate.md`, and install walkthrough; replaced stale `state.nodes.match(...)` snippets with current `state.nodes.find(...)` / `state.nodes.entries(...)`; changed bookmark cleanup wording; removed avoidable huge-document hook-rule disable; fixed public markdown anchors; fixed stale `inlines` wording that said to copy a URL to the keyboard instead of clipboard; tightened rough browser workaround comments in `inlines`; fixed stale Plite React hook return type names and documented root/runtime/history/chrome/content-root/command hooks; synced `Editable` docs to current decoration, layout, DOM strategy, and render-element props; documented annotation store projector form and widget anchor/projector API; cleaned stale ref wording around `refs current value` and `unrefed` while keeping real `PathRefApi`/`PointRefApi`/`RangeRefApi` root API docs; expanded `plite-dom` README around public DOM coverage boundaries; added missing DOM check methods to React editor docs and guarded docs-vs-runtime exactness. |
| metadata/release | Updated `plite-dom` package description to DOM bridge/browser utilities; moved Changesets snapshot config from deprecated `___experimentalUnsafeOptions_WILL_CHANGE_IN_PATCH.useCalculatedVersionForSnapshots` to stable `snapshot.useCalculatedVersion`; audited 76 pending changesets with `bun changeset status`; added `plite-dom` internal package build entry so `./internal` ships in tarballs; changed `plite-react` lodash value imports to Node-resolvable `.js` subpaths; changed `plite-react`'s runtime `plite-history` dependency from `workspace:*` to `>=0.115.0`; removed `direction` from `plite-react` dependencies and lockfile; added package-shape and consumer-facing workspace-protocol guards; ran all-package dry-pack summaries, package import smoke, temp consumer tarball install proof, `bun build:packages`, touched-package rebuild/import smoke after later source edits, and `bun check`; kept version/changelog warnings as release-owner checkpoint for `changeset version`. |
| skills/workflow | no `.agents` edits; workflow slowdowns recorded and code-owned proof guards repaired |
| reverted/quarantined packets | Reverted click-point inset, locator-click routing, and 20ms click-delay experiments; they were neutral or worse than baseline. Pagination alpha drag-autoscroll flake is scoped as follow-up, not current stable-lane blocker. |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | Runtime selection ownership patch | It changes native editable click routing and modifier-click behavior; this is the only product behavior diff in the current readiness run. | `packages/plite-react/src/editable/root-interaction-controller.ts`, `root-interaction-resolver.ts` | Review before any public beta claim. |
| 2 | Public DOMCoverage export | Promoting DOM coverage through `plite-dom` turns an internal boundary model into public API. | `packages/plite-dom/src/index.ts`, DOM coverage examples | Confirm this API is worth freezing for beta. |
| 3 | Public-surface contracts | New guards block internal imports, markdown link drift, public example type slop, and helper aliases. | `packages/plite/test/public-surface-contract.ts`, `packages/plite-browser/test/core/package-scripts.test.ts` | Review guard strictness; these are good but opinionated. |
| 4 | Npm/docs front doors | Root/package/docs READMEs and walkthroughs were heavily rewritten. | `Readme.md`, package READMEs, `docs/libraries/slate-react/README.md`, walkthroughs 03/04 | Review taste and claim width. |
| 5 | Release metadata | Consumer install shape is repaired, but versions, pending changesets, and changelog/noise still need deliberate release-owner review. | package metadata, pending changesets, `packages/plite/test/release-scripts-contract.ts` | Needs release-owner pass; do not publish from this loop. |
| 6 | Scope claim | Pagination and raw mobile are deliberately out of the non-pagination beta confidence claim. | `bun check:full`, raw mobile policy | Decide explicitly before any public announcement. |

Stopping checkpoints to unblock:
| Id | Type | Question / decision | Why it matters | Paused work | Continued work | Recommendation | Anchor |
|----|------|---------------------|----------------|-------------|----------------|----------------|--------|
| release-metadata | hard | Do we want this loop to own beta release metadata: versions, changeset review, and changelog/noise cleanup? | Consumer tarball install shape is repaired, but current package metadata is still private-alpha/pre-release shaped; actual public release confidence needs a deliberate release-owner lane. | Actual publish/release readiness. | Runtime/docs/proof cleanup, package install-shape repair, and review map. | Treat as release-owner pass unless explicitly routed. | package metadata + pending changesets |
| dom-coverage-api | soft | Is `DOMCoverage` a public beta API or should it stay internal with examples rewritten another way? | Public export is useful and now documented, but public API surface is sticky. | API freeze confidence. | Examples/docs can use current public export. | Keep unless you reject public DOM coverage ownership. | `packages/plite-dom/src/index.ts` |
| raw-mobile | soft | Are raw Android/iOS device lanes required for beta, or is desktop/browser-engine proof enough for this beta claim? | Current run explicitly does not claim raw mobile. | Raw-device claims. | Desktop/browser proof and scoped mobile claims. | Defer raw mobile unless beta scope includes mobile proof. | `plite-browser` release-proof policy |
| pagination-autoscroll | deferral | Should pagination return to `plite-auto` scope or stay routed to a dedicated pagination plan/perf lane? | Latest broad gate hard-failed Chromium pagination autoscroll after all retries; pagination is explicit opt-in for `plite-auto`. | Pagination release confidence. | Stable editor behavior, docs/API, and proof-honesty work. | Keep deferred unless you explicitly route pagination back in. | `playwright/integration/examples/pagination.test.ts:3097`, `bun check:full` |
| broad-browser-refresh | soft | Is another full gate required before a real public beta go/no-go? | Latest non-pagination refresh produced strong evidence: scoped sweep 1100/1100 runnable rows, then clean full non-pagination example-registry sweep with 1679 passed, 112 expected skips, 0 flakes, and 0 hard failures after the richtext/setup and `plite-browser` helper repairs. Full `bun check:full` is still non-green because pagination is deferred. | Final release-quality browser proof. | Non-pagination runtime/docs/API work. | Treat non-pagination desktop proof as current; rerun full `bun check:full` only if pagination is explicitly back in scope. | non-pagination Playwright proof, `bun check:full`, flake isolation |

Findings:
- Status P1: `.tmp/plite` is clean as a separate git repo. Parent dirty
  files are `.agents/rules/slate-auto.mdc`, generated skill mirrors, older
  plan/docs/research files, and this active plan. This run must not assume
  runtime dirty diffs remain; it audits current runtime source and public beta
  claim width directly.
- API P1: `plite-react` does not export `runtime-editor-api.ts`; internal core
  access is intentionally funneled through runtime facade modules and guarded by
  `packages/plite-react/test/surface-contract.test.tsx`.
- Release-readiness P1: the source tree carries many pending changesets and
  sibling peer floors that assume next package versions. Fine for private alpha;
  actual public beta release needs version/changelog/changelog-noise review as
  a separate release packet.
- Proof P1: non-pagination example specs had three project-gated `return`
  branches, all after alternate input actions. They are now classified by a
  `plite-browser` core audit instead of relying on reviewer memory.
- Behavior P1: focused Playwright smoke passed across richtext, plaintext,
  markdown shortcuts, editable voids, placeholder, hidden/dom, inlines, and
  huge-document staged/virtualized critical gestures. This is strong smoke, not
  a substitute for `bun test:integration-local` before an actual release.
- Behavior P0: latest `bun check:full` is not green: 2012 passed, 562
  skipped, and one hard Chromium pagination autoscroll failure. The Firefox
  mentions drag-selection flake reproduced at 5/10 before repair and is now
  closed by focused no-retry cross-browser proof.
- Proof P0: latest full non-pagination example-registry desktop proof is clean:
  1679 passed, 112 expected skips, 0 flakes, and 0 hard stable-lane failures
  across Chromium/Firefox/WebKit after the richtext setup/settle and
  `plite-browser` drag helper repairs.
- Docs P1: parent claim-width doc was stale about `Editable.decorate`; patched
  to match current API split: local adapter allowed, projection stores are the
  durable overlay architecture.
- Docs/API P0: `.tmp/plite/Readme.md` was still legacy Plite front-door
  copy; walkthroughs 03/04 taught a non-exported `renderElement` helper from
  `plite-react`. Rewrote those docs to teach current raw render props and
  read/update lifecycle.
- API P1: `plite-browser/core` carried proof-suffixed alias exports with no
  external callsites. They were removed and a core package guard now rejects
  reintroducing those aliases.
- API/DX P1: public DOM coverage examples used `plite-dom/internal`; promoted
  `DOMCoverage` through `plite-dom`, switched examples to public imports, and
  added a public-surface contract against internal package imports in public
  examples/docs.
- Example DX P1: async decorations and search highlighting had avoidable
  TypeScript slop (`as never`, `ReactEditor<any>`). Both are removed and
  guarded by `packages/plite/test/public-surface-contract.ts`.
- Docs P1: public docs had broken relative markdown anchors. Fixed the broken
  links and added a public markdown file/anchor validator to
  `packages/plite/test/public-surface-contract.ts`.
- API/DX P1: public factory/hook exports had strong typing but weak
  source-level affordance. Added concise JSDoc to `defineEditorExtension`,
  `defineStateField`, `elementProperty`, `DOMCoverage`, `react`,
  `createReactEditor`, `usePliteEditor`, `useEditorState`, and decoration
  source hooks.
- Example DX P1: `huge-document.tsx` used `@ts-expect-error` for missing
  browser Event Timing lib fields. Replaced the suppressions with local
  `EventTimingEntry` / observer-init types and guarded public examples against
  future `@ts-expect-error`.
- Docs P1: `plite-react` README was too thin for a beta front door. Rewrote it
  into a stable runtime map for setup, `Plite`, `Editable`, events, hooks, DOM
  coverage, annotations, widgets via hooks, and experimental virtualized
  rendering.
- Docs/API P1: the Editor API page omitted public `api`, `getApi`,
  `subscribeCommit`, and update-context shape from `BaseEditor`. Patched the
  interface sketch and added runtime API / commit subscription sections.
- Docs P2: the Editor concept extension example had malformed indentation in a
  copy-paste snippet. Cleaned it while sampling high-traffic docs.
- Docs/API P1: npm-facing package READMEs were stale or missing. Rewrote
  `slate`, `plite-react`, `plite-history`, and `plite-hyperscript` READMEs,
  and added package READMEs for `plite-dom` and `plite-layout`.
- Docs P1: `concepts/10-serializing.md` was stale and taught old editor
  `children` framing. Replaced it with current document-value and app-owned
  serialization guidance.
- Docs P1: `concepts/02-nodes.md` was stale and taught the whole document as
  `Editor.children`. Replaced it with current roots/state persistence plus
  editable `Element`/`Text` tree rules, and added stale-doc guards.
- Docs/API P1: `plite-react/slate.md` documented `initialValue` under
  `<Plite>` props and omitted current callback props. Aligned it to source and
  narrowed the public-doc callback guard.
- Docs P1: first-user walkthroughs still carried loose imports/types, old
  casual tutorial prose, `jsx` fences, and a buried `attributes`/`children`
  rule. Tightened install, event, command, and rendering docs.
- Docs P1: core concept/reference pages still carried old helper names, mutable
  editor examples, and stale tutorial prose. Rewrote Interfaces and Locations;
  tightened Operations, Commands, and Normalizing.
- Release metadata P0: package peer floors already target next publish
  versions while local versions are still pre-versioned, and many pending
  changesets include majors. This is the current hard public-release ceiling.
- Example DX P2: huge-document carried an avoidable hooks lint disable; removed
  it. The only remaining eslint escape found by the scan is in deferred
  pagination.
- Release-readiness P1: package peer floors are ahead of local versions
  (`plite-react`/`plite-dom` require `slate >=0.124.2` while local `slate` is
  `0.124.1`). This is a release-owner review item, not an authorized
  private-alpha metadata mutation.

Decisions and tradeoffs:
- Post-closeout PR review uses `grill-me` as a taste gate, not as new runtime
  work. No goal lifecycle tool was used for this review logging.
- Round 1 approved by user on 2026-06-14: runtime selection and DOM boundary
  direction stay as currently implemented. Approved decisions: browser owns
  modified native editable clicks; focused native editable clicks resolve as
  native editable placement; local first-strong Unicode RTL detection replaces
  `direction`; `getTextDirection` remains source-module-only test visibility;
  `DOMCoverage` is public from `plite-dom`; weak maps stay out of public
  `plite-dom` / `plite-react`; `plite-dom/internal` ships as a real internal
  package export; `plite-browser` diagnostics include click-point and
  model/native selection state; example proof audits reject weak skips and
  require classified project/browser gated returns.
- Round 1 tradeoff: `DOMCoverage` public API plus shipped `plite-dom/internal`
  is the highest-commitment approved surface. Keep it unless a later user
  review explicitly rejects the package boundary.
- Round 2 partial approvals on 2026-06-14: runtime/root hooks stay approved as
  `usePliteRuntimeState`, `usePliteViewState`, `usePliteRootEditor`,
  `usePliteActiveEditor`, `usePliteCommandCallback`, and
  `usePliteViewEffect`, but the docs must spell out the runtime/view/root
  naming boundary. Dense hook docs are approved in content and should keep
  getting wording trims. `usePliteRootState` remains rejected as an alias.
- Round 2 still awaiting explicit user answer for the remaining public
  `plite-react` API review items: `usePliteEditor` front door, no
  `<Plite initialValue>`, `onChange` / `onValueChange` /
  `onSelectionChange`, `subscribeCommit`, root chrome/content-root hooks,
  advanced `Editable` props, DOM coverage boundary props, annotation/widget
  projector APIs, and weak-map hard cut.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| Broad `rg -n` scans over docs/site/packages streamed too much output | 2 | Write to `/tmp/**` or use `rg -l` / counts first | Resolved for current audits; logged as workflow slowdown. |
| Tried nonexistent `packages/plite-react/test/index.spec.ts` | 1 | Locate wrapper with `rg` before running package Vitest | Resolved with `surface-contract.test.tsx`. |
| Tried nonexistent `packages/plite-react/src/hooks/use-slate-editor.tsx` | 1 | Use `rg --files` before exact path reads | Resolved by reading actual API owners; no product issue. |
| First project-gated return scanner matched a `projectName` type field | 1 | Require actual `if (...)` gate lines | Resolved; audit now passes. |
| `plite-react` README linked to nonexistent `widgets.md` | 1 | Let the markdown contract catch new links, then route to existing docs instead of inventing stubs | Resolved by linking widget guidance to `hooks.md`; contract passes. |
| Exact `editor.api.dom` guard initially expected `clipboard` | 1 | Confirm runtime split before changing product code | Resolved by keeping `editor.api.clipboard` separate and guarding the exact `api.dom` key set without `clipboard`. |
| Tried nonexistent `packages/plite/src/interfaces/editor/editor.ts` | 1 | Use `rg` result path exactly for source/API comparisons | Resolved by reading `packages/plite/src/interfaces/editor.ts`. |
| Ran two managed Playwright specs in parallel | 1 | Run managed Playwright serially because the site build/server is shared | Resolved by rerunning paste-html serially; browser proof passed. |
| Targeted ignored Bun `.test.ts` wrappers for `plite-dom` | 3 | Target extensionless test owner files because `bunfig.toml` ignores `*.test.*` wrappers | Resolved with `bun test ./packages/plite-dom/test/clipboard-boundary.ts`. |
| Tried nonexistent `packages/plite-history/src/history-editor.ts` | 1 | Use `rg --files` before assuming docs page names map to source files | Resolved by reading `history-extension.ts` and `history.ts`. |

Verification evidence:
- P1 status inventory: parent `git diff --name-only` wrote 8 paths to
  `/tmp/plite-beta-parent-dirty-files.txt`; runtime
  `.tmp/plite` `git diff --name-only` wrote 0 paths; parent untracked list
  wrote 41 docs/research/plan paths; runtime untracked list wrote 0 paths.
- P1 public API/package proof: `bun test ./packages/plite/test/public-surface-contract.ts ./packages/plite/test/public-field-hard-cut-contract.ts ./packages/plite/test/compat-alias-hard-cut-contract.ts ./packages/plite/test/state-tx-public-api-contract.ts ./packages/plite-browser/test/core/release-proof.test.ts ./packages/plite-browser/test/core/keyboard-oracle-audit.test.ts` passed 413 tests across 3 Bun-owned files; root Bun ignored `*.test.*` paths as expected.
- P1 `plite-react` surface proof: `cd packages/plite-react && bun test:vitest test/surface-contract.test.tsx` passed 33 tests in 1 file.
- P1 `plite-browser` proof audit: `cd packages/plite-browser && bun test:core test/core/keyboard-oracle-audit.test.ts` passed 71 tests across 11 core files after adding the project-gated return classification.
- P1 `plite-browser` package proof: `bun --filter ./packages/plite-browser typecheck` passed.
- P1 stable example proof: Chromium focused smoke passed 11 tests in 19.0s; Firefox/WebKit focused smoke passed 10 tests in 29.1s.
- P1 huge-document smoke: Chromium focused huge-document proof passed 4 tests in 12.5s.
- P1 docs proof: `pnpm docs:plite:audit` passed after parent docs patches.
- P1 README/walkthrough proof: `rg` found no remaining `from 'plite-react'` / `renderElement` helper imports or `api: renderElement` snippets in public walkthrough/library/API/concept docs after the rewrite.
- P1 public docs wording proof: literal `rg` scans found no remaining
  `Full browser/release`, `Release Gate`, or `release-quality gate` strings in
  the audited public docs/package docs/example roots after the cleanup.
- P1 `plite-browser` alias proof: stale alias grep finds only the negative
  assertions in `packages/plite-browser/test/core/package-scripts.test.ts`, not
  live exports or callsites.
- P1 public internal import proof: `rg` found no `plite/internal` or
  `plite-dom/internal` imports in public docs/examples; `bun test
  ./packages/plite/test/public-surface-contract.ts
  ./packages/plite-dom/test/public-surface-contract.ts` passed 496 tests after
  adding the guard.
- P1 DOM coverage public export proof: `bun test
  ./packages/plite-dom/test/public-surface-contract.ts` passed 6 tests,
  `bun --filter ./packages/plite-dom typecheck` passed, `bun --filter
  ./packages/plite-dom build` passed, and `bun typecheck:site` passed.
- P1 public example type proof: `bun typecheck:site` passed, `bun test
  ./packages/plite/test/public-surface-contract.ts` passed 530 tests, and grep
  found no `ReactEditor<any>`, `as never`, or public internal imports in
  public docs/examples.
- P1 public docs link proof: scratch validator reported no missing relative doc
  files or markdown anchors; `bun test
  ./packages/plite/test/public-surface-contract.ts` passed 593 tests after the
  durable validator was added.
- P0 latest fast-gate proof after docs/example contract work: `bun check`
  exited 0: lint passed, package typecheck passed for 7 packages, site/root
  typecheck passed, Bun tests passed 1219 with 91 skips, slate-layout passed
  47, and slate-react Vitest passed 804 across 59 files.
- P0 latest fast-gate proof after DOM coverage promotion: `bun check` exited 0:
  lint passed, package typecheck passed for 7 packages, site/root typecheck
  passed, Bun tests passed 1219 with 91 skips, slate-layout passed 47, and
  slate-react Vitest passed 804 across 59 files.
- P0 full gate failure evidence: `bun check:full` failed after 12.2m with 3 hard failures, all `plaintext › Shift+click extends a collapsed text selection` across Chromium, Firefox, and WebKit; it also reported 2 retry-only flakes: Chromium pagination drag autoscroll and Firefox richtext collapsed italic hotkey.
- P0 modifier-click repair proof: `cd .tmp/plite/packages/plite-react && bun run test:vitest test/root-interaction-controller.test.tsx test/root-interaction-resolver.test.ts` passed 23 tests.
- P0 focused browser proof: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/plaintext.test.ts --project=chromium --project=firefox --project=webkit --grep "Shift\\+click extends a collapsed text selection"` passed 3/3.
- P0 plaintext sweep proof: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/plaintext.test.ts --project=chromium --project=firefox --project=webkit` passed 113 tests with 16 expected skips.
- P0 editable-void regression proof: `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun run playwright playwright/integration/examples/editable-voids.test.ts --project=chromium --project=firefox --project=webkit` passed 69/69 after the modifier-click patch.
- P0 package/check proof: `bun --filter ./packages/plite-react typecheck`, `bun --filter ./packages/plite-browser typecheck`, and `bun check` all passed after the modifier-click patch.
- P1 clipboard/paste audit proof: stale wording scan found only the corrected
  `clipboard` text in `site/examples/ts/inlines.tsx` and
  `playwright/integration/examples/inlines.test.ts`; `bun test
  ./packages/plite/test/clipboard-contract.ts` passed 35 tests; `bun test
  ./packages/plite-dom/test/clipboard-boundary.ts` passed 37 tests; `bun test
  ./packages/plite-dom/test/dom-coverage.ts --grep "clipboard|pastes over a hidden selection"`
  passed 2 filtered clipboard rows; `bun --filter ./packages/plite-react
  test:vitest test/projected-clipboard-contract.test.ts` passed 6 tests;
  `bun typecheck:site` passed; focused Chromium inlines row passed 1/1; focused
  Chromium paste-html rows passed 2/2.
- P1 text transform API proof: `bun test
  ./packages/plite/test/transforms-contract.ts
  ./packages/plite/test/delete-contract.ts
  ./packages/plite/test/text-units-contract.ts` passed 67 tests; `bun --filter
  ./packages/plite typecheck` passed; `bun test
  ./packages/plite/test/public-surface-contract.ts` passed 594 tests; `bun
  typecheck:site` passed; stale old-wording scan over transform docs/source was
  clean; `bun check` passed with 1222 Bun tests, 47 slate-layout tests, and 805
  slate-react Vitest tests.
- P1 history API proof: `bun --filter ./packages/plite-history typecheck`
  passed; `bun test ./packages/plite-history/test` passed 16 fixture tests;
  `bun test ./packages/plite-history/test/history-contract.ts
  ./packages/plite-history/test/integrity-contract.ts
  ./packages/plite-history/test/document-state-history-contract.ts` passed 67
  tests; `bunx tsc --project
  packages/plite-history/test/tsconfig.generic-types.json --noEmit` passed;
  public-surface contract and site typecheck passed; focused Chromium history
  browser smoke passed 5/5 across plaintext, markdown shortcuts, and document
  state; `bun check` passed with 1222 Bun tests, 47 slate-layout tests, and 805
  slate-react Vitest tests.
- P1 React hooks API proof: stale hook type/duplicate scan found no
  `SlateAnnotationEntry`, `SlateWidgetEntry`, or duplicate public
  `usePliteWidgetStore` implementation outside `use-slate-widget-store.tsx`;
  `bun --filter ./packages/plite-react test:vitest
  test/provider-hooks-contract.test.tsx test/use-slate-history.test.tsx
  test/use-slate-root-chrome.test.tsx
  test/slate-runtime-provider-contract.test.tsx
  test/use-slate-view-command-hooks.test.tsx
  test/widget-layer-contract.test.tsx
  test/annotation-store-contract.test.tsx test/use-element-selected.test.tsx`
  passed 122 tests across 8 files; `bun --filter ./packages/plite-react
  typecheck` passed; `bun test
  ./packages/plite-react/test/surface-contract.tsx
  ./packages/plite/test/public-surface-contract.ts` passed 628 tests across 2
  files; `bun typecheck:site` passed; `bun check` passed with 1222 Bun tests,
  47 slate-layout tests, and 805 slate-react Vitest tests.
- P1 React component props docs proof: `bun --filter ./packages/plite-react
  test:vitest test/surface-contract.test.tsx` passed 35 tests after adding the
  `Editable` docs/source guard; `bun --filter ./packages/plite-react
  typecheck` passed; `bun test ./packages/plite/test/public-surface-contract.ts`
  passed 594 tests; `bun typecheck:site` passed; `bun check` passed with 1222
  Bun tests, 47 slate-layout tests, and 806 slate-react Vitest tests.
- P1 annotation/widget API proof: focused `bun --filter ./packages/plite-react
  test:vitest test/annotation-store-contract.test.tsx
  test/widget-layer-contract.test.tsx test/surface-contract.test.tsx` passed 55
  tests across 3 files after fixing one over-strict regex guard; `bun --filter
  ./packages/plite-react typecheck` passed; `bun typecheck:site` passed; `bun
  test ./packages/plite/test/public-surface-contract.ts` passed 594 tests; `bun
  check` passed with 1222 Bun tests, 47 slate-layout tests, and 806 slate-react
  Vitest tests.
- P0 earlier broad full-gate proof: `bun check:full` exited 0 after 11.5m
  with 2013 passed, 562 skipped, and one retry-only Chromium pagination
  autoscroll flake. Desktop visual-native smoke rows passed across Chromium,
  Firefox, and WebKit.
- P0 latest broad full-gate refresh: `bun check:full` exited 1 after 11.7m
  with 2012 passed, 562 skipped, one hard Chromium pagination autoscroll
  failure, and one retry-only Firefox mentions drag-selection flake. Desktop
  visual-native smoke and huge-document desktop cross-browser rows passed.
- P0 latest fast-gate proof: `bun check` exited 0 after the final docs/API
  cleanup: lint passed, package typecheck passed for 7 packages, Bun tests
  passed 1218 with 91 skips, slate-layout passed 47, and slate-react Vitest
  passed 804 across 59 files.
- P1 public JSDoc/API proof: `bun --filter ./packages/plite typecheck`,
  `bun --filter ./packages/plite-dom typecheck`, and `bun --filter
  ./packages/plite-react typecheck` passed after source JSDoc edits; `bun test
  ./packages/plite/test/public-surface-contract.ts
  ./packages/plite-dom/test/public-surface-contract.ts` passed 599 tests;
  `cd packages/plite-react && bun test:vitest
  test/surface-contract.test.tsx` passed 33 tests.
- P0 latest fast-gate proof after public JSDoc edits: `bun check` exited 0:
  lint passed, package typecheck passed for 7 packages, site/root typecheck
  passed, Bun tests passed 1219 with 91 skips, slate-layout passed 47, and
  slate-react Vitest passed 804 across 59 files.
- P0 full non-pagination example-registry browser proof:
  `files=($(find playwright/integration/examples -maxdepth 1 -type f -name
  '*.test.ts' ! -name 'pagination.test.ts' | sort)); bun run playwright
  "${files[@]}" --project=chromium --project=firefox --project=webkit`
  exited 0 after 9.9m with 1676 passed, 112 skipped, 3 retry-only flakes, and
  0 hard failures.
- P0 bulk-run flake isolation proof: `bun run playwright
  playwright/integration/examples/visual-native-selection-smoke.test.ts
  --project=firefox --repeat-each=20 --retries=0 -g 'richtext click typing
  leaves one collapsed displayed caret|inline link drag selection has one
  native highlight'` passed 40/40; `bun run playwright
  playwright/integration/examples/multi-root-document.test.ts --project=webkit
  --repeat-each=20 --retries=0 -g "document undo keeps the focused root caret
  when undoing another root's batch"` passed 20/20. One first attempt to run the
  WebKit proof in parallel failed on the Next build lock and was rerun serially.
- P1 skip-quality guard proof: focused skip-reason scan found no weak
  `flaky`/`placeholder`/`temporary`/`broken` reasons and one parser-missed macOS-only
  reason that was valid on manual inspection; `bun --filter
  ./packages/plite-browser test:core
  test/core/keyboard-oracle-audit.test.ts` passed 73 core tests including the
  new skip-reason guard; `bun --filter ./packages/plite-browser typecheck`
  passed; `bun check` passed after formatting, with lint/typecheck/Bun/layout
  suites and 807 slate-react Vitest tests green.
- P1 Android input manager cleanup proof: focused scan showed no remaining
  `debug(`, `const debug`, `as any`, or `@ts-expect-error` in
  `packages/plite-react/src/hooks/android-input-manager/android-input-manager.ts`;
  `bun --filter ./packages/plite-react test:vitest
  test/android-input-manager-contract.test.ts` passed 24 tests; `bun --filter
  ./packages/plite-react typecheck` passed; `bun check` passed with
  lint/typecheck/Bun/layout suites and 807 slate-react Vitest tests green.
- P1 keyboard direction dependency cleanup proof: `rg` found no remaining
  `direction` dependency or import references in `packages/plite-react` or
  `bun.lock`; `bun --filter ./packages/plite-react typecheck` passed; `bun
  --filter ./packages/plite-react test:vitest
  test/keyboard-input-strategy-contract.test.ts` passed 39 tests; `bun check`
  passed after lint/typecheck/Bun/layout suites and 807 slate-react Vitest
  tests; `bun --filter ./packages/plite-react build` passed; direct Node import
  of `./packages/plite-react/dist/index.js` printed `plite-react dist import
  ok`.
- P1 Plite change-callback type cleanup proof: targeted scan no longer finds
  `Editor.getSnapshot(editor as any)`, `Editor.getLastCommit(editor as any)`,
  or `subscribe(onContextChange)` in `components/slate.tsx`; `bun --filter
  ./packages/plite-react test:vitest
  test/slate-runtime-provider-contract.test.tsx` passed 37 tests; `bun
  --filter ./packages/plite-react typecheck` passed; `bun check` passed with
  lint/typecheck/Bun/layout suites and 807 slate-react Vitest tests green.
- P1 editor-runtime-view wrapper type cleanup proof: targeted scan no longer
  finds root-view `as any` callsites in
  `packages/plite/src/editor-runtime-view.ts`; `bun test
  ./packages/plite/test/editor-runtime-view-contract.ts` passed 53 tests; `bun
  --filter ./packages/plite typecheck` passed; `bun check` passed with
  lint/typecheck/Bun/layout suites and 807 slate-react Vitest tests green.
- P1 content-root navigation type cleanup proof: targeted scan no longer finds
  `EDITOR_TO_ROOT_VIEW_EDITORS.get(editor as any)`, `resolveDOMNode(node as
  any)`, or any `as any` row in
  `packages/plite-react/src/editable/content-root-navigation.ts`; `bun
  --filter ./packages/plite-react test:vitest
  test/content-root-navigation-contract.test.ts` passed 21 tests; `bun
  --filter ./packages/plite-react typecheck` passed; `bun check` passed with
  lint/typecheck/Bun/layout suites and 807 slate-react Vitest tests green.
- P1 touched package artifact refresh proof: `bun --filter ./packages/plite
  build` passed; `bun --filter ./packages/plite-react build` passed; corrected
  direct Node import smoke passed for `./packages/plite/dist/index.js`,
  `./packages/plite/dist/internal/index.js`, and
  `./packages/plite-react/dist/index.js`.
- P1 public doc/API drift refresh proof: artifact-first scan written to
  `.tmp/plite/.tmp/slate-auto/public-doc-api-drift.json`; suspicious rows
  were classified as changelog, contributor release docs, internal sibling
  imports, explicit raw-device/Appium proof docs, or experimental/deferred
  virtualized/pagination docs; `bun test
  ./packages/plite/test/public-surface-contract.ts` passed 601 tests; `bun
  typecheck:site` passed; parent `pnpm docs:plite:audit` passed.
- Post-closeout hook naming/docs trim proof: runtime/root hook names were kept
  as `usePliteRuntimeState`, `usePliteViewState`, `usePliteRootEditor`,
  `usePliteActiveEditor`, `usePliteCommandCallback`, and
  `usePliteViewEffect`; hook docs and source JSDoc now define runtime, root
  view, and root editor boundaries; the surface contract guards that wording;
  public docs/source have no `usePliteRootState` alias hit; `bun --filter
  ./packages/plite-react test:vitest test/surface-contract.test.tsx`,
  `bun --filter ./packages/plite-react typecheck`, `bun typecheck:site`, and
  `bun check` passed.
- P0 broad non-pagination proof refresh before helper repair:
  `files=($(find playwright/integration/examples -maxdepth 1 -type f -name
  '*.test.ts' ! -name 'pagination.test.ts' | sort)); bun run playwright
  "${files[@]}" --project=chromium --project=firefox --project=webkit`
  exited 0 after 10.3m with 1678 passed, 112 skipped, one retry-only Firefox
  visual-native inline-link drag flake, and 0 hard failures.
- P0 Firefox richtext oracle/setup repair proof: focused richtext navigation row
  passed 20/20 with `--retries=0` after adding DOM settle before ArrowUp;
  focused empty-editor active-bold setup row passed 20/20 with `--retries=0`
  after adding selected-text and model-empty setup proof; full Firefox
  `richtext.test.ts` passed 91 with 28 expected skips.
- P0 `plite-browser` drag helper repair proof: `bun --filter
  ./packages/plite-browser typecheck` passed; Firefox inline-link drag
  visual-native row passed 40/40 with `--retries=0`; full desktop
  `visual-native-selection-smoke.test.ts` passed 27/27 across Chromium,
  Firefox, and WebKit with retries disabled.
- P0 broad non-pagination proof refresh after helper repair:
  `files=($(find playwright/integration/examples -maxdepth 1 -type f -name
  '*.test.ts' ! -name 'pagination.test.ts' | sort)); bun run playwright
  "${files[@]}" --project=chromium --project=firefox --project=webkit`
  exited 0 after 10.7m with 1679 passed, 112 expected skips, 0 flakes, and 0
  hard failures.
- P0 latest fast-gate proof after browser helper and audit repair:
  `bun check` exited 0: lint passed, 7 package typechecks passed, site/root
  typecheck passed, Bun tests passed 1226 with 91 skips, slate-layout passed
  48, and slate-react Vitest passed 807 across 59 files.
- P1 public example slop proof: public example scan over `site/examples/ts`
  found only the two huge-document `@ts-expect-error` suppressions before the
  patch and no matches afterward; `bun typecheck:site` passed;
  `bun test ./packages/plite/test/public-surface-contract.ts` passed 593 tests.
- P0 latest fast-gate proof after huge-document example type cleanup:
  `bun check` exited 0: lint passed, package typecheck passed for 7 packages,
  site/root typecheck passed, Bun tests passed 1219 with 91 skips, slate-layout
  passed 47, and slate-react Vitest passed 804 across 59 files.
- P1 `plite-react` README proof: public markdown contract caught one missing
  `./widgets.md` link before it landed; after routing widget docs to
  `hooks.md`, `bun test ./packages/plite/test/public-surface-contract.ts`
  passed 593 tests and `bun typecheck:site` passed.
- P0 latest fast-gate proof after `plite-react` README rewrite: `bun check`
  exited 0: lint passed, package typecheck passed for 7 packages, site/root
  typecheck passed, Bun tests passed 1219 with 91 skips, slate-layout passed
  47, and slate-react Vitest passed 804 across 59 files.
- P1 Editor API docs proof: source/docs comparison against `BaseEditor` found
  missing `api`, `getApi`, `subscribeCommit`, and update-context docs; after
  patch, `bun test ./packages/plite/test/public-surface-contract.ts` passed
  593 tests and stale-pattern scan found no old editor/interface wording.
- P0 latest fast-gate proof after Editor API doc correction: `bun check`
  exited 0: lint passed, package typecheck passed for 7 packages, site/root
  typecheck passed, Bun tests passed 1219 with 91 skips, slate-layout passed
  47, and slate-react Vitest passed 804 across 59 files.
- P2 Editor concept snippet proof: `bun test
  ./packages/plite/test/public-surface-contract.ts` passed 593 tests,
  `bun typecheck:site` passed, and `bun check` exited 0 after the
  copy-paste snippet cleanup.
- P1 package README proof: stale package README scan found no remaining
  `feel free`, `poke around`, old plugin/source-folder wording, internal
  subpath mention, legacy/deprecated/migration/release wording; public-surface
  contract passed 593 tests and `bun typecheck:site` passed.
- P0 latest fast-gate proof after package README packet: `bun check` exited 0:
  lint passed, package typecheck passed for 7 packages, site/root typecheck
  passed, Bun tests passed 1219 with 91 skips, slate-layout passed 47, and
  slate-react Vitest passed 804 across 59 files.
- P1 serialization docs proof: public-surface contract passed 593 tests, stale
  serialization scan found only DOM `Node.TEXT_NODE` / `Node.ELEMENT_NODE`
  constants, `bun typecheck:site` passed, and `bun check` exited 0.
- P1 nodes docs proof: stale nodes scan found no old `Editor.children`
  tutorial phrases; public-surface contract passed 593 tests; `bun
  typecheck:site` passed; `bun check` exited 0.
- P1 Plite component docs proof: public-surface contract passed 594 tests,
  targeted prop scan confirmed current callback props and no
  `### initialValue` prop heading, `bun typecheck:site` passed, and
  `bun check` exited 0.
- P1 first-user docs proof: stale-prose/API scan had no hits across install,
  event, command, rendering, and Plite component pages; public-surface contract
  passed 594 tests; `bun typecheck:site` passed; `bun check` exited 0.
- P1 concept/reference docs proof: stale concept-doc scan has only legitimate
  `assertPliteNode` API names and DOM `Node.*` constants; public-surface
  contract passed 594 tests; `bun typecheck:site` passed; `bun check` exited 0.
- P1 release metadata audit: package version/export/peer scan and
  `.changeset/**` audit show release-owner work remains; no package metadata
  was mutated.
- P2 huge-document example proof: eslint/type-slop scan shows only deferred
  pagination's exhaustive-deps escape remains; `bun typecheck:site` passed;
  public-surface contract passed 594 tests; `bun check` exited 0.
- P0 mentions flake baseline: no-retry Firefox repeat for
  `drag-selects across leading inline mentions atomically` failed 5/10 with
  empty selected text when the drag started inside leading inline void content.
- P0 mentions flake repair proof: focused Chromium/Firefox/WebKit row passed,
  cross-browser repeat passed 15/15, full desktop mentions suite passed 55
  with 14 expected skips, and `bun check` exited 0 after the test repair.
- P0 runtime selection review proof: `cd packages/plite-react && bun run
  test:vitest test/root-interaction-controller.test.tsx
  test/root-interaction-resolver.test.ts` passed 23 tests; focused plaintext
  browser proof for Shift+click and double-click-drag passed 6/6 across
  Chromium/Firefox/WebKit.
- P1 remaining React reference docs proof: public-surface contract passed 594
  tests; `bun typecheck:site` passed; `bun check` exited 0 after
  `react-editor-setup.md` and `annotations.md` cleanup.
- P1 public hook-snippet guard proof: exact `rg -n '^const \[editor\] =
  useState\('` scan over public docs/README has no matches; public-surface
  contract passed 594 tests; `bun typecheck:site` passed; `bun check` exited 0
  after adding the guard and fixing the walkthrough/Plite snippets.
- P0 DOM API hard-cut proof: `bun --filter ./packages/plite-dom typecheck`
  passed; public-surface contracts passed 601 tests; `bun check` exited 0;
  `bun --filter ./packages/plite-dom build` passed; built
  `DOMEditorCapability` contains `resolveRangeRect` and no Android repair
  methods.
- P1 exact DOM API guard proof: focused `plite-dom` public-surface contract
  passed 8 tests; `bun --filter ./packages/plite-dom typecheck` passed;
  `bun check` exited 0 with 1221 Bun tests and 804 slate-react Vitest tests.
- P1 public weak-map boundary proof: AST leak scan found no weak-map imports
  from public `plite-dom` / `../src` roots; focused `plite-dom` and
  `plite-react` public-surface contracts passed 43 tests; `bun --filter
  ./packages/plite-dom typecheck`, `bun --filter ./packages/plite-react
  typecheck`, and `bun test:vitest` passed; final `bun check` exited 0 with
  1222 Bun tests, 47 slate-layout tests, and 805 slate-react Vitest tests.
- P0 final proof after late autoreview fixes: stale public `nodes.match` /
  `state.nodes.match` scan found no remaining hits in docs/packages/site;
  `bun test ./packages/plite/test/public-surface-contract.ts` passed 601 tests;
  `bun typecheck:site` passed; parent `pnpm docs:plite:audit` passed;
  `bun test:release-discipline` passed 645 tests after removing the stale
  generated-output allowlist; latest `bun check` passed with lint, 7 package
  typechecks, site/root typechecks, 1227 Bun tests, 48 slate-layout tests, and
  808 slate-react Vitest tests; final autoreview rerun exited clean with no
  accepted/actionable findings.

Final handoff contract:
- Goal plan: `docs/plans/2026-06-14-plite-public-beta-readiness-review.md`.
- Surface and route/package: `.tmp/plite` non-pagination desktop Plite runtime, docs, examples, package/API proof, `plite-browser`, `plite-react`, `plite-dom`, benchmark import path.
- Invocation mode, elapsed/minimum runtime, loop/checkpoint count: timed 8h floor, start 2026-06-14 14:10 CEST, do not final before 22:10 CEST, loop 74+.
- Behavior gates and visual proof: clean broad non-pagination desktop registry proof, focused richtext/visual-native/huge-document proof, latest `bun check`.
- Primary metric baseline/latest/best and stop reason: latest/best non-pagination registry proof is 1679 passed / 112 skipped / 0 flakes / 0 failures; latest fast gate passed; stop only after floor plus check-complete.
- Bugs fixed and oracles added: editable/native selection ownership, Firefox richtext setup/settle, inline-link drag helper, source-key branch audit, RTL direction regression, benchmark import.
- Benchmark/skill/docs repairs: benchmark internal import repaired; no `.agents` source edit in this packet; docs/API/package proof rows recorded.
- Workflow slowdowns and repairs: scan/output, Playwright serialization, line-number audit, and benchmark runner lessons recorded.
- Changed list: populated in `Changed list`.
- Needs your attention: populated in `Needs your attention`.
- Stopping checkpoints to unblock: populated in `Stopping checkpoints to unblock`.
- Accepted deferrals and residual risks: release metadata/human taste review, explicit pagination, raw mobile.
- Next owner: release owner for actual publish metadata; `plite-auto` or targeted lane for pagination/raw mobile if explicitly routed.

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closeout after the 8h floor; code/docs/proof fixes, latest `bun check`, release-discipline proof, docs audit, and final clean autoreview are complete. |
| Where am I going? | Run `autogoal` check-complete, mark the active goal complete if it passes, then hand off the prioritized beta review list. |
| What is the goal? | Plite beta-readiness supervision until non-pagination API/docs/examples/runtime/proof confidence is >95%, or explicit blockers remain. |
| What have I learned? | Non-pagination desktop Plite looks beta-credible by this run's evidence; actual publish still needs release-owner version/changeset metadata and human taste review. Pagination and raw mobile remain explicit deferrals. |
| What have I done? | Repaired public docs/API drift, package/tarball shape, browser proof helpers, native selection oracles, RTL direction handling, benchmark imports, proof guards, release-discipline allowlists, and huge-document example subscription cost. |
| What changed in the checkpoint plan? | It expanded from a review-priority loop into browser proof refresh, package install proof, release-discipline audit, autoreview-driven fixes, docs API copy/paste cleanup, and final scorecard closeout. |

Timeline:
- 2026-06-14T12:09:46.914Z Goal plan created.
- 2026-06-14T16:14:52+0200 Public JSDoc/API DX packet kept after package typechecks, public-surface contracts, `plite-react` surface contract, and `bun check`.
- 2026-06-14T16:19:19+0200 Huge-document public example type cleanup kept after site typecheck, public-surface contract, public example slop scan, and `bun check`.
- 2026-06-14T16:21:51+0200 `plite-react` README front-door rewrite kept after markdown contract, site typecheck, and `bun check`.
- 2026-06-14T16:25:09+0200 Editor API doc/source mismatch fixed after public-surface contract, stale-pattern scan, and `bun check`.
- 2026-06-14T16:27:57+0200 Editor concept extension snippet cleanup kept after public-surface contract, site typecheck, and `bun check`.
- 2026-06-14T16:31:52+0200 Package README packet kept after stale README scan, public-surface contract, site typecheck, and `bun check`.
- 2026-06-14T16:33:34+0200 Beta readiness scorecard added: current public beta confidence 88, with release metadata and human review burden as top blockers.
- 2026-06-14T16:36:48+0200 Serialization concept doc rewritten after public-surface contract, stale scan, site typecheck, and `bun check`.
- 2026-06-14T16:44:01+0200 Nodes concept doc rewritten and stale-doc guards added after public-surface contract, stale scan, site typecheck, and `bun check`.
- 2026-06-14T16:47:32+0200 Plite component docs aligned to current props and stale callback guard narrowed after public-surface contract, site typecheck, and `bun check`.
- 2026-06-14T16:50:49+0200 First-user install/event/command/rendering docs tightened after stale-prose scan, public-surface contract, site typecheck, and `bun check`.
- 2026-06-14T16:55:03+0200 Core concept/reference docs tightened after stale concept-doc scan, public-surface contract, site typecheck, and `bun check`.
- 2026-06-14T16:55:49+0200 Release metadata audit confirmed package peer/version/changeset lane is a release-owner stopping checkpoint, not a private-alpha drive-by patch.
- 2026-06-14T16:57:20+0200 Huge-document hook-rule disable removed after eslint/type-slop scan, site typecheck, public-surface contract, and `bun check`.
- 2026-06-14T17:20:00+0200 Mentions inline-void drag-selection flake repaired after failed-before Firefox repeat, 15/15 cross-browser repeats, full desktop mentions suite, and `bun check`.
- 2026-06-14T17:26:00+0200 Runtime selection risk review closed no-code after root interaction source review, 23/23 unit tests, and 6/6 plaintext browser native ownership rows.
- 2026-06-14T17:28:00+0200 Remaining React reference docs sample kept after fixing invalid top-level hook setup snippet, bookmark cleanup wording, public-surface contract, site typecheck, and `bun check`.
- 2026-06-14T17:31:00+0200 Public-surface hook-snippet guard kept after it found and fixed one more invalid install-walkthrough snippet; exact scan, contract, site typecheck, and `bun check` passed.
- 2026-06-14T17:34:00+0200 DOM API source/docs sync kept after removing Android repair internals from public `editor.api.dom`, documenting `resolveRangeRect`, focused contracts, `bun check`, `plite-dom` build, and declaration audit.
- 2026-06-14T17:37:00+0200 Exact `editor.api.dom` key guard kept after focused public-surface contract, typecheck, and `bun check`; initial clipboard expectation calibrated the `api.dom` / `api.clipboard` split.
- 2026-06-14T17:52:28+0200 Weak-map runtime state removed from public `plite-dom` / `plite-react` roots, internal imports moved to `plite-dom/internal`, public-root guards added, AST leak scan clean, and `bun check` passed.
- 2026-06-14T17:58:55+0200 Clipboard/paste contract audit kept after fixing stale `inlines` keyboard/clipboard wording, syncing the browser fixture, and passing focused core, DOM, projected clipboard, site, inlines, and paste-html proof.
- 2026-06-14T18:01:00+0200 Text transform docs/source sync kept after documenting transaction-target semantics and deletion options; focused core contracts, `slate` typecheck, public-surface contract, site typecheck, stale scan, and `bun check` passed.
- 2026-06-14T18:06:00+0200 History API/docs sync kept after adding state-patch batch shape, source comments, copyable type snippets, focused package/generic/browser proof, and `bun check`.
- 2026-06-14T18:14:00+0200 React hooks API/docs sync kept after documenting root/runtime/history/chrome/content-root/command hooks, fixing stale annotation/widget return type names, cutting duplicate widget-store source, focused hook proof, contracts, site typecheck, and `bun check`.
- 2026-06-14T18:18:00+0200 Editable component props docs sync kept after documenting `decorateDirtiness`, `decorateRuntimeScope`, `layout`, `DOMStrategyOptions`, and render-element props; focused surface contract, package/site/public proof, and `bun check` passed.
- 2026-06-14T18:23:02+0200 Annotation/widget API/docs sync kept after documenting annotation projectors, widget anchors/projectors, adding store source comments and overlay docs guards, focused annotation/widget/surface proof, and `bun check`.
- 2026-06-14T18:56:45+0200 Non-pagination desktop browser proof refresh kept after stable example, visual-native-selection-smoke, and huge-document specs passed 1100 runnable rows with 79 expected browser-scope skips across Chromium/Firefox/WebKit.
- 2026-06-14T19:03:00+0200 Final public docs/example drift scan kept after tightening `inlines` comments, reaching 0 public-only drift hits, and passing site typecheck plus 600 public-surface contract tests.
- 2026-06-14T19:04:46+0200 Review priority map refreshed and `bun check` passed after final public example cleanup.
- 2026-06-14T19:14:28+0200 Package shape audit kept after fixing missing `plite-dom/internal` tarball artifacts, fixing `plite-react` lodash ESM imports, adding guards, passing all-package build, import smoke, dry-pack summary, and `bun check`.
- 2026-06-14T19:22:19+0200 Package workspace-protocol audit kept after proving packed `plite-react` install failed on `plite-history: workspace:*`, changing it to `>=0.115.0`, adding a consumer-facing dependency guard, proving frozen install/no protocol leaks, packing local tarballs, passing temp consumer lockfile install, inspecting the packed manifest, and passing `bun check`.
- 2026-06-14T19:27:35+0200 Example browser proof-map guard kept after classifying `custom-placeholder -> placeholder` and `android-tests -> query-controls`, adding the registry-to-spec guard, fixing guard overreach/alias shape from focused failures, and passing public-surface contract, package/site typecheck, and `bun check`.
- 2026-06-14T19:41:05+0200 Full non-pagination example-registry desktop proof kept after 1676 passed, 112 expected skips, 3 retry-only flakes, 0 hard failures, and focused no-retry flake isolation passed 60/60; repeated parallel managed Playwright build-lock mistake recorded as a workflow slowdown.
- 2026-06-14T19:47:02+0200 Example skip-quality guard kept after adding the `plite-browser` core audit for literal, non-weak skip reasons in non-pagination specs; focused core audit, package typecheck, and `bun check` passed.
- 2026-06-14T19:51:13+0200 Android input manager runtime-taste cleanup kept after removing no-op debug plumbing, tightening the local `DataTransfer` guard, and passing focused Android contract, `plite-react` typecheck, and `bun check`.
- 2026-06-14T20:00:08+0200 Keyboard direction dependency cleanup kept after removing the untyped `direction` package, replacing it with a local code-point range helper, passing focused keyboard strategy contracts, `plite-react` typecheck/build, dist import smoke, and `bun check`.
- 2026-06-14T20:06:27+0200 Plite change-callback type cleanup kept after moving view-root callbacks to typed `subscribeCommit`, removing avoidable snapshot/commit `any` casts, and passing focused runtime-provider contract, package typecheck, targeted cast scan, and `bun check`.
- 2026-06-14T20:10:17+0200 Editor runtime-view wrapper type cleanup kept after preserving root wrapper parameter/return types, removing view-root generator/query `any` callsites, and passing focused core contract, `slate` typecheck, targeted scan, and `bun check`.
- 2026-06-14T20:14:04+0200 Content-root navigation type cleanup kept after removing local editor/node `any` casts, and passing focused content-root contract, `plite-react` typecheck, targeted scan, and `bun check`.
- 2026-06-14T20:16:05+0200 Touched package artifact refresh kept after rebuilding `slate` and `plite-react`, correcting the import-smoke export expectations, and passing direct `dist` import smoke for public `slate`, `plite/internal`, and `plite-react`.
- 2026-06-14T20:17:56+0200 Public docs/API drift refresh kept after classifying suspicious stale/release/mobile/pagination hits and passing public-surface contract, site typecheck, and parent Plite docs audit.
- 2026-06-14T22:28:24+0200 Post-closeout `grill-me` PR review state logged without goal lifecycle tool calls: Round 1 runtime selection + DOM boundary decisions approved all by user; Round 2 public `plite-react` API decisions proposed and awaiting user answer.
- 2026-06-14T22:45:00+0200 Round 2 hook slice approved and kept after tightening runtime/view/root-editor naming docs, source JSDoc, and surface-contract guard; focused React contract/typecheck, site typecheck, no-alias docs/source scan, and `bun check` passed.

Open risks:
- Actual beta publish still needs release-owner versioning/changeset metadata
  review; this run intentionally did not publish, create PRs, or mutate release
  versions.
- Pagination remains explicitly deferred and should not be marketed as solved by
  this run.
- Raw mobile remains explicitly unclaimed until real Android/iOS device proof is
  available.
- Human taste review is still required for remaining public API/docs/examples
  items even though the approved runtime/root hook names are now guarded and
  automated proof is green.
