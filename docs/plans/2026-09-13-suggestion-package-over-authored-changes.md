# Suggestion package over authored changes

## September 14 correction: declarative initialization

Status: Complete. The user's `go` follows the initialization review in
`docs/research/review-records/2026-09-14-suggestions-initialization.json`.
Complete the reviewed cleanup and focused adoption/proof in this checkout;
publication remains outside scope.

- [x] Expose native authored view inputs through Plate EditorRoot with inferred
  capability typing, no optional SuggestionPlugin dependency or extra store.
- [x] Replace the editor-ai mount-time fixture edits, actor switching, history
  suppression and late thread loading with one prepared native document and
  matching initialThreads, preserving the example and author/change identities.
- [x] Migrate the same mode-initialization effect in suggestion examples and
  the homepage; keep user-driven mode commands intact.
- [x] Prove first-render intent/projection, independent views and prop updates;
  reload/undo and linked threads through existing browser/fixture proof.
- [x] Update affected API documentation, source teaching/doctrine and generated
  registry artifacts; complete focused package/type, lint and ledger checks.

Target: `initialValue` loads native authored data, CommentsPlugin loads
application threads, and `EditorRoot authored` forwards the existing neutral
native view input. A plugin-global mode store and replay hidden in a helper
are rejected. Generic copied Editor skins do not acquire feature knowledge.
The native runtime already initializes and reconciles the exact view from this
input; the Plate forwarding adds no runtime owner, subscription, index or scan.
No speedup claim is made. Prepared fixtures avoid repeated user-command replay.

Owners: lead owns Plate facade/API, example effect adoption, teaching and final
proof; `suggestion_fixture` owns editor-ai source, its prepared fixture,
generator, focused fixture proof and its registry file declaration.

The prepared fixture retains the same visible text, marks, links, authors and
linked discussions. Saved change IDs persist across reloads. Its explicit
offline generator creates fresh IDs and matching thread targets together.
The accepted document contains no empty link placeholder: Alice proposes the
whole link and adjacent text, avoiding a normalization write during accept/undo.

Native view reconciliation compares intent/projection values. An equivalent
inline prop preserves a mode selected through view commands during unrelated
parent renders; changed values reconfigure the same mounted view. Each view
remains independent. The existing private facade preserves native component
identity while public inference requires the authored capability.

Browser proof also exposed a Dnd read that obtained nodes from one projection
and asked another projection for their live keys. Comparing paths within the
same read snapshot fixes image reject/hover without weakening native identity.
The optional SuggestionKit underlines live text in mixed structural proposals
while retaining deletion strikethroughs.

Proof for this correction:

- 39 focused Plate React tests, three native root-lifetime tests, 54 Dnd tests
  and 23 registry/fixture tests pass. The fixture tests cover JSON reload,
  empty initial undo, every author's accept/undo, independent rejection and
  matching comment targets. New native and Dnd cases failed before repair.
- Plate React-core and Dnd-react source types, Plite React source types and
  affected public type contracts pass. Full www typechecking passes, including
  editor/API-reference/docs/registry prerequisites and integration contracts.
- The broader Plate public type-contract command still reports TS2589 at
  `packages/platejs/type-tests/table-plugin-contracts.ts:79`. The affected
  contracts pass independently. No baseline control established whether the
  table error predates this change; full contract closure is not claimed.
- All 20 Chromium suggestion journeys pass against settled source at
  `http://localhost:3341`, using `PLATE_WWW_DEV_SOURCE=1` and
  `PLATE_WWW_DIST_DIR=.next-suggestion-initialization`. Coverage includes saved
  authors/threads, accept/undo/reload, image deletion/rejection, caret and
  selection, Enter, cancellation, first-frame paint and parent-render mode
  preservation. The final settled log supersedes an earlier run interrupted
  by concurrent registry generation; both logs are retained.
- Plate and test-package build artifacts pass. Generated registry output has
  319 canonical payloads and 15 sparse overlays. Real editor-ai installations
  in Base/Nova and Radix/Luma pass shared peer identity checks, optimized Next
  compilation, TypeScript and route generation. The installation harness sets
  Turbopack's root to its disposable workspace so linked packages resolve.
- Touched-file lint and whitespace checks pass. Public teaching, source rules,
  doctrine v196 and regenerated mirrors describe the adopted data/view split.
  Registry changelog and package changeset describe the final consumer setup;
  the Dnd correction is covered by the retained-renderer package note.
- Logs and a source/evidence manifest live in
  `docs/plans/artifacts/suggestion-initialization/`. Review ledger discovery
  found no added feature groups; refresh, render and validation pass.

Next action: none for this correction. The broader type-contract error remains
explicit above; this work makes no performance or complete Google Docs parity
claim.

## September 14 correction: optional feature independence

Status: Complete. The user's explicit correction reverses the earlier
decision to move suggestion selectors into generic live/static Editor skins.
That decision violated the existing Plate UI and Vision ownership law; passing
browser tests did not validate it.

Current acceptance, from the user's Plate UI repair and Best API Review request:

- [x] Repair `.agents/rules/plate-ui.mdc` to cover import-free coupling through
  CSS selectors and feature data attributes, preserving native editor styling.
- [x] Inspect real core consumers and nearby APIs. `render.attributes` targets
  nodes, `decorate.attributes` targets ranges, and keyed element attributes
  cannot configure the root or all retained fragments.
- [x] Complete the core content-attributes comparison and bounded scale probe;
  record the superseding review in the existing suggestion review history.
- [x] Keep suggestion selectors in the copied SuggestionKit's plugin
  configuration, apply safe attributes through existing content roots, and
  remove the generic Editor coupling and presentation-only wrapper.
- [x] Prove live/static merge precedence, disabled/null configuration, safe
  attribute boundaries, inferred authoring, and existing suggestion journeys.
- [x] Reconcile public teaching, doctrine version, generated skill mirrors,
  registry artifacts and release notes; retain unrelated checkout failures.

Adopted: `render.contentAttributes`, a render-safe object or null on the
existing Plate plugin. Core composes attributes; copied features own values.
No new hook host, listener, imperative DOM patch, generic prop bag or companion
plugin. Static configuration is sufficient for the current job. This is a
Plate composition gap: Plite's native Editable already accepts DOM props.

Proof for this correction:

- 155 focused core tests pass across content, static, rendered-attribute,
  model-publication and plugin-resolution behavior. Root, React core, static
  source typechecks and public type contracts pass. Unsafe handlers, refs,
  children, editing controls and render callbacks are excluded.
- Registry editor tests pass (2), and suggestion/discussion tests pass (15).
  Targeted core, registry and browser-test lint passes.
- All 11 Chromium suggestion journeys pass against the source server at port
  3297 (`PLATE_WWW_DIST_DIR=.next-content-attributes`, source/plite readiness
  verified). Root topology and computed colors/strikethrough pass alongside
  pointer caret, expanded deleted-text selection, first-frame paint, typing,
  cancellation/undo, Enter, accept-break and reject-merge behavior.
- Prototype and final production construction/SSR probes pass all six
  1/10/100-plugin × 1/1000-node cohorts under the predeclared p50 overhead
  budget of max(1ms, 10% baseline). The final largest SSR increase is 2.732ms
  on a 31.366ms baseline (8.7%). This is a bounded cost guard on a noisy shared
  host, not a speedup, browser performance or broader Google parity claim.
  Raw samples, source identities and method are in
  `docs/plans/artifacts/content-attributes-probe/`; zero additional scans and
  subscriptions are source-inferred, not instrumented counters.
- Registry generation passes with 319 canonical payloads and 15 overlays;
  changelog generation/check passes. Public API and feature documentation,
  Plate UI/Best API/plugin-authoring teaching, doctrine v192 and generated
  mirrors carry the adopted ownership rule.
- Full www typechecking passes its editor, API-reference, documentation,
  registry and Next type-generation prerequisites, then fails at the existing
  Footnote transform (`BaseFootnotePlugin.ts:389`, TS2769). A compiler virtual
  filesystem control removing both new BasePlugin declarations reproduces
  the identical error; `footnote-overlay.json` records this bounded causal
  check. The unrelated source was not changed.

Next action: none for this correction. The broader Google behavior audit keeps
its existing coverage limits; these checks do not certify complete parity.

Objective:

Implement `platejs/suggestion` and
`platejs/suggestion/react` feature that packages reusable suggesting-mode,
change-marker, active-change, and change-query behavior over the one canonical
authored-change owner. Keep visual styling, cards, comments composition,
toolbars, popovers, and kit assembly in the copied registry.

Flow mode:

- Agent-led plan hardening under Task, Best API, and Plate Plan.

Goal plan:

- `docs/plans/2026-09-13-suggestion-package-over-authored-changes.md`

Template:

- `docs/plans/templates/plate-plan.md`

Primary template:

- `docs/plans/templates/plate-plan.md`

Applied packs:

- `package-api`: the target adds public `platejs` entrypoints and APIs.
- `browser`: copied registry interactions and visible markers must survive.
- `performance-observability`: decoration invalidation and view subscriptions
  scale with document size, change count, and mounted views.

Mode:

- Complete design, implementation, adoption, and proof.

Status:

- Complete.

Completion threshold:

- Binary readiness requires one owner per responsibility, a fixed public call
  shape, explicit cuts, complete adoption, passing pre-acceptance scale
  evidence, exact implementation slices, and final package/browser/performance
  commands. The repository plan checker must pass.

Verification surface:

- Design proof: live-source inspection of the registry suggestion and
  discussion owners, authored runtime and Plate facade, Plite decoration
  manager, package exports/DAG, consumers, tests, docs, and suggestions ledger.
- Design proof: run the checked-in disposable current-versus-target decoration
  probe and validate its machine-readable result.
- Plan proof: run Technical Writing's prose audit, `git diff --check` on the
  plan artifacts, and Autogoal's `check-complete.mjs`.
- Execution proof covers Plite authored contracts, Plate package
  partitions and declarations, registry source/tests/generation, Chromium user
  journeys, final-path performance, and built artifacts.

Constraints:

- The later `go all` instruction authorizes product implementation, generated
  artifacts, release notes, and review-ledger closure. Publication, commits,
  pushes, and pull requests remain outside this task.
- `DefaultAuthoredPlugin` remains the authority for change identity, content,
  attribution, status, selection, decisions, persistence, and exact-view
  projection.
- Comments remain optional. Neither suggestion package entrypoint may depend on
  `platejs/comments` or `platejs/comments/react`.
- Package output is semantic and CSS-free. Registry code owns color, typography,
  card layout, popovers, toolbar labels, and comments joining.
- Do not add compatibility aliases, a second suggestion engine, a second change
  store, a package-owned kit, or duplicated marker attributes.
- Type inference must flow from plugin composition; no consumer cast or explicit
  callback parameter annotation may compensate for a weak public generic.
- `templates/**` is generated and must not be edited.

Boundaries:

- In scope: new headless and React suggestion entrypoints; the smallest native
  authored invalidation signal required by them; exact-view active state;
  semantic range attributes; registry migration; docs, release artifacts,
  barrels, generated registry output, package/browser/performance proof, and
  review-ledger closure during execution.
- Source owners: `packages/plitejs/src/authored/**`,
  `packages/plitejs/src/react/decoration-source.ts`,
  `packages/platejs/src/authored/**`, new
  `packages/platejs/src/features/suggestion/**`, new
  `packages/platejs/src/react/features/suggestion/**`, Plate entrypoint/DAG
  metadata, and the affected `apps/www` registry, docs, examples, and tests.
- Direct Plite boundary: add one exact-view authored change-publication API by
  exposing facts already computed by the authored runtime. Do not add a new
  index, store, scheduler, persistence form, or React presentation owner.
- Non-goals: redesign authored persistence; rename authored APIs; package
  accept/reject wrappers; package discussion models; AI suggestion generation;
  version history; Markdown/DOCX/static serialization; Yjs transport; generic
  comments UI; registry visual redesign; migration notes for the v54 package.

Output budget strategy:

- Keep source evidence and accepted decisions in this plan. Keep benchmark rows
  in the JSON receipt and summarize only decision-relevant values here.

Blocked condition:

- No blocked condition was encountered. Exact affected change IDs and
  decoration node keys come from existing authored commit and fragment-index
  facts without a new long-lived index, and declaration checks infer
  `editor.plugin(SuggestionPlugin)` from plugin composition.

Plate Plan state:

- status: complete
- phase: execution and proof closed
- next: none for this adoption
- handoff: complete

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | The objective packages reusable review behavior over authored changes and leaves presentation in the registry. |
| Task plan and execution authority verified | yes | The user followed the accepted design with `go all`, authorizing all six implementation and proof slices. |
| Current owners read | yes | Registry suggestion/discussion, Plite authored/decoration, Plate authored facade, exports, DAG, consumers, tests, docs, and ledger were inspected from the current checkout. |
| Best API target resolved | yes | The 2026-09-13 suggestions entrypoint review says pursue a focused Plate suggestion feature over authored and reject a copied-file move or second engine. This plan resolves the remaining call shape and lifetime. |
| Runtime scale applicability resolved | yes | Decoration reads, invalidation fan-out, and mounted-view subscriptions are runtime work; the performance pack applies. |
| Pre-acceptance Benchmark probe selected | yes | `2026-09-13-suggestion-decoration-probe.ts` compares current full refresh with targeted invalidation under a frozen contract. |
| Mode and execution boundary resolved | yes | Design, implementation, generated output, proof, and ledger closure are complete; publication remains outside scope. |
| Package/API pack selected | yes | New `platejs/suggestion` and `platejs/suggestion/react` public entrypoints trigger the package/API pack. |
| Public surface or package boundary identified | yes | Public plugins and hooks live in `platejs`; authored state remains in `plitejs/authored` and `platejs/authored`; copied presentation remains in `apps/www`. |
| Release artifact path selected | yes | The checkout contains the package changeset and generated registry changelog because package consumers and copied registry users see changes. |
| `changeset` skill loaded when `.changeset` is required | yes | Changeset rules were read: one package per file, `platejs` patch only, user-facing present-tense prose. |
| Barrel/export impact decision recorded | yes | New entrypoints require DAG/export generation and `pnpm brl`. |
| Runtime scale applicability resolved | yes | The hot path is semantic decoration recomputation after active selection and authored state changes. |
| Browser pack selected | yes | Click activation, modes, review cards, and retained fragments are visible browser behavior. |
| Browser route / app surface identified | yes | Existing suggestion browser journeys plus suggestion, format, view, persistence, playground, and editor-ai registry surfaces are the execution set. |
| Browser tool decision recorded | yes | Chromium Playwright is sufficient; no native file, clipboard, dialog, or OS surface is involved. |
| Console/network caveat policy recorded | yes | Final browser runs must assert no runtime errors; network is relevant only to fixtures already owned by a route and must not be used to excuse failures. |
| Observable browser case captured | no | This is architecture adoption rather than a reporter-backed defect; exact existing journeys and new two-view proof are specified below. |
| Performance pack selected | yes | The proposed exact-view observer and targeted refresh can change repeated runtime cost. |
| User-facing operation and runtime owner identified | yes | Operation is activating a suggestion and publishing a suggestion-related authored update; final owners are Suggestion React, authored publication, and the existing decoration manager. |
| Scale variables and cohorts fixed | yes | Node count, authored-change count, mounted view count, warmups, samples, and normal through pathological cohorts are frozen below. |
| Budget frozen before target measurement | yes | Source-probe and browser budgets were written before the accepted target measurement. |
| Baseline and target probe selected | yes | Current full refresh and disposable targeted source observer run against matched fixtures and source identity. |
| Correctness guard selected | yes | State-only authored updates refresh semantic decorators; exact view owns one observer; active lookup resolves the clicked canonical marker. |
| Production detector decision recorded | no | This is local editor UI work; deterministic source counters and browser performance marks provide execution proof without production telemetry or user data. |

Work Checklist:

- [x] Outcome, scope, non-goals, constraints, and owners are concrete.
- [x] Current API, docs, tests, and exports claims cite live source.
- [x] The reusable public call shape has one Best API verdict before target lock.
- [x] The scale-sensitive target has a passing executable current-owner versus target Benchmark receipt.
- [x] Every concept-level decision row has owner, adoption, proof, risk, and verdict.
- [x] Canonical state and exact-view presentation have separate owners.
- [x] Public breaks and the private authored bridge have adoption and deletion answers.
- [x] Execution slices and the focused proof matrix are concrete.
- [x] Conditional work and final handoff are resolved.
- [x] Public API, package boundary, exports, and release impact are recorded.
- [x] Release artifacts are classified as a package changeset plus registry changelog.
- [x] Changeset rules are fixed to one `platejs` patch file.
- [x] Registry-only presentation uses the registry changelog path.
- [x] The no-artifact branch is inapplicable because users see package and registry deltas.
- [x] Compatibility and hard-cut decisions are explicit.
- [x] The package runtime contract composes the performance pack.
- [x] Package typecheck, build, test, and declaration proof is recorded.
- [x] Barrel, entrypoint, registry, and changelog generation is recorded.
- [x] Browser routes, interactions, and visible outcomes are recorded.
- [x] Chromium Playwright is selected for the normal app surfaces.
- [x] Console and runtime-error checks are required.
- [x] No screenshot waiver is used as behavior proof.
- [x] Pixel classification is inapplicable because acceptance concerns semantic DOM markers and interaction state, not exact rendered color.
- [x] Reporter reproduction is inapplicable because this is an architecture adoption request.
- [x] Final browser proof requires a fresh process and final source fingerprints.
- [x] Final clean-checkout proof is required before publication wording.
- [x] React DOM lifecycle and two-view interaction must pass 5/5 retry-free warm runs.
- [x] Temporary aliases, stubs, generated-file edits, and route bypasses cannot count as proof.
- [x] A comparable pre-acceptance scale receipt is checked in.
- [x] The complete UI operation and deterministic reads, wakes, observers, and changed buckets are measured.
- [x] Normal, large, stress, and pathological source cohorts are covered.
- [x] Warm percentiles, sample counts, environment, and deterministic counters are recorded.
- [x] The proposed path uses the smallest disposable source-level prototype.
- [x] Current and target paths use matched source, fixtures, action, and correctness guards.
- [x] Subscription and refresh fan-out were inspected before adding infrastructure.
- [x] The target reuses existing authored publications and the decoration manager.
- [x] Transaction serialization is unchanged.
- [x] Receipts contain no protected data.
- [x] Execution replaces the disposable probe with a deterministic final-package harness.
- [x] No budget override is accepted.

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve design, adoption, proof, and handoff | All decision rows, implementation slices, proof, and ledger adoption are closed. |
| Fresh source evidence | yes | Recheck decision-changing current claims | Final owners, generated output, runtime behavior, and ledger state were checked on 2026-09-14. |
| Best API review | yes | Resolve package/call-shape findings | Focused package facade, exact-view state, neutral markers, and native change records resolve the review gaps. |
| Pre-acceptance scale proof | yes | Pass matched current-versus-target probe | JSON receipt passes all four cohorts and three correctness guards. |
| Production scale rerun contract | yes | Fix final-path owner and command | Slice 6 and Scale contract name the package and browser reruns. |
| Conditional risk and adoption | yes | Cover package, registry, docs, browser, release, and doctrine owners | Adoption manifest and execution slices enumerate each owner. |
| Verification recorded | yes | Record fresh plan and artifact checks | The execution receipt records final source fingerprints, test results, and measured cohorts. |
| Handoff prepared | yes | State target, cuts, order, proof, and risks | Final handoff is complete below. |
| P1 autoreview | no | Do not run on `next` | Repository rules forbid Autoreview on `next`; this is also not an explicit review or PR closure. |
| Goal plan complete | yes | Run Autogoal checker | The final command and receipt are recorded under Verification evidence. |
| Public API / package boundary proof | yes | Audit exports and generated declarations | Public API, DAG, partitions, inference contract, and build checks are specified. |
| Runtime scale contract | yes | Close design receipt and final rerun | Frozen source receipt and final four-cohort Chromium rerun pass. |
| Release artifact classification | yes | Classify user-visible outputs | `platejs` package behavior and copied registry behavior both change. |
| Published package changeset | yes | Add one package release note | `.changeset/suggestion-feature-entrypoints.md` describes the package-facing behavior. |
| Registry changelog | yes | Add source entry and regenerate JSON | The source MDX and generated JSON describe the registry-facing behavior. |
| No release artifact | no | Explain inapplicability | Package and registry consumers both receive user-visible behavior. |
| Package typecheck/build/test | yes | Run focused and closure checks | Focused partitions, contracts, package types, build, runtime entrypoints, and release artifact checks pass. |
| Barrel/export generation | yes | Generate entrypoints and barrels | `pnpm entrypoint:turbo:generate` and `pnpm brl` are required. |
| Browser interaction proof | yes | Replay existing and added journeys | Ten Chromium suggestion journeys pass on final code. |
| Browser console/network check | yes | Assert clean runtime | The browser harness completed without a runtime-error failure. |
| Browser final proof artifact | yes | Retain report and source identity | The execution JSON records source fingerprints and final browser/performance results. |
| Exact case replay | no | Reporter-backed case required only for a reported defect | Existing named product journeys replace defect replay. |
| Final ref and fingerprints | yes | Record final implementation identity | The execution JSON fingerprints package, registry, fixture, controller, and harness files after generation. |
| Clean final runtime | yes | Use fresh process from final checkout before closure | A fresh final-source Next process served the successful Chromium runs. |
| Retry-free stability | yes | Run lifecycle case 5/5 | Two-view active selection and mode switching are the warm-run ledger. |
| Pre-acceptance scale proof | yes | Compare frozen cohorts | The checked-in result records deterministic reads and p95 values. |
| Warm latency budget | yes | Enforce source and browser p95/p99 limits | Frozen limits are listed under Scale contract. |
| Large/stress scaling | yes | Cover 1k, 10k, and 50k nodes | Source receipt passes large, stress, and pathological cohorts. |
| Cold and failure paths | yes | Measure mount and cleanup failures on final code | First-frame paint passes; package lifecycle proof asserts observer cleanup; no production detector claim is made. |
| Payload and fan-out | yes | Bound observers, reads, wakes, and changed buckets | One observer per view and targeted old/new node-key refresh are fixed invariants. |
| Production-path rerun | yes | Replace prototype with final package harness | The gated final-package Chromium harness passes all four cohorts. |
| Correctness guard | yes | Preserve authored state and visible semantics | Source and browser guards are fixed below. |
| Before/after receipt | yes | Keep matched baseline and final results | The source receipt preserves current-versus-target design evidence; the execution receipt records final-package results. |
| Detector and privacy | no | Production telemetry not justified | Local deterministic counters contain no content or identity data. |
| Performance regression check | yes | Run deterministic package and browser harnesses | Slice 6 names both commands and acceptance. |

Phase / pass table:

| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground | complete | Read current owners, consumers, docs, tests, ledger, and earlier plans. | Use the accepted review to compare package boundaries. |
| Decide | complete | Fixed package split, public API, state lifetime, marker vocabulary, hard cuts, and adoption. | Prove the scale-sensitive invalidation design. |
| Prove and hand off | complete | Disposable source probe passes frozen cohorts; execution and proof slices are concrete. | Execute the accepted target. |
| Execute and close | complete | Package, registry, docs, release artifacts, generated output, final Chromium proof, and ledger adoption are complete. | None. |

Decision brief:

- outcome: package the common suggestion workflow while retaining authored as
  the sole change engine and the registry as the sole presentation owner.
- chosen shape: `BaseSuggestionPlugin` in `platejs/suggestion` plus
  `SuggestionPlugin` and three hooks in `platejs/suggestion/react`.
- strongest rejected alternative: delete the suggestion feature and make every
  app assemble mode translation, semantic decoration, exact-view active state,
  click targeting, invalidation, and stable React selection directly from
  authored primitives.
- consequence: package consumers get one coherent review interaction surface;
  advanced authorship/history users continue to use authored directly; copied
  UI remains freely styleable and Comments remains optional.

Pre-adoption source evidence:

- `apps/www/src/registry/components/editor/suggestion.tsx:28-33` introduces a
  consumer-side `SuggestionEditor` cast and helper only to recover authored
  capability from plugin installation.
- `apps/www/src/registry/components/editor/suggestion.tsx:35-126` owns stable
  change membership, exact-view projection subscription, and a UI-specific
  `SuggestionDiscussionReview` date/range model.
- `apps/www/src/registry/components/editor/suggestion.tsx:128-262` combines
  active state, Comments thread mirroring, commit/store observers, semantic
  decorations, Tailwind classes, click selection, and a visual wrapper in one
  copied plugin.
- `apps/www/src/registry/components/editor/suggestion.tsx:264-275` maps a
  boolean suggesting mode to two authored views and exports a copied kit.
- `apps/www/src/registry/components/editor/discussion.tsx:52-261` already owns
  the presentation model that joins suggestion reviews to comment threads,
  sorts cards, pages discussion items, and stores block targets.
- `packages/platejs/src/authored/PlateAuthoredPlugin.ts:1-12` provides the
  canonical Plate-authenticated authored descriptor. Its barrel reexports the
  native authored record, query, selection, result, status, and view types.
- `packages/plitejs/src/authored/authored.ts:1120-1122` currently exposes only
  `setView` as authored API. The same runtime already computes exact affected
  change IDs and changed fragment buckets at lines 1153-1191 and 2314-2377.
- `packages/plitejs/src/react/decoration-source.ts:1677-1752` already refreshes
  registered sources for document commits and exact authored-view changes.
  Suggestion must reuse that manager rather than attach another document/view
  observer.
- `packages/platejs/src/internal/plugin/getPlateDecorationSources.ts` binds
  decoration read, observe, and attributes to the supplied exact editor view and
  merges configured attributes. That is the canonical Plate adapter.
- `packages/plitejs/src/dom/plugin/dom-fragment-view.ts:174-178` already marks
  retained authored DOM with `data-editor-authored-change` and
  `data-editor-retained`.
- `packages/platejs/package.json`, `packages/platejs/tsconfig.json`, and
  `tooling/entrypoints/entrypoint-dag.mjs` expose `platejs/authored` and the
  established headless/React entrypoint pattern, but no suggestion entrypoint.
- The pre-adoption ledger reported `pursue`, `not-assessed`, and
  `not-replayed`. Final ledger lookup reports `reviewed`, `adopted`, and
  `verified` against the final working-tree inventory.

Ideal public API:

Headless consumers install the semantic feature without React or UI:

```ts
import { BaseSuggestionPlugin } from 'platejs/suggestion';
```

React consumers install exact-view behavior and use focused hooks:

```ts
import {
  SuggestionPlugin,
  useActiveSuggestion,
  useSuggestionChanges,
  useSuggestionMode,
} from 'platejs/suggestion/react';
```

The plugin API owns the common two-mode workflow:

```ts
const suggestion = editor.plugin(SuggestionPlugin);

suggestion.api.setMode('suggesting');
suggestion.api.setMode('editing');

const mode = suggestion.read.mode();
```

The mapping is fixed:

| Suggestion mode | Authored view |
| --- | --- |
| `'suggesting'` | `{ intent: 'propose', projection: 'markup' }` |
| `'editing'` | `{ intent: 'edit', projection: 'accepted' }` |

Advanced projections remain direct authored operations. The suggestion facade
does not invent names for accepted, proposed, historical, or custom views.

React reads remain small and composable:

```tsx
const mode = useSuggestionMode();
const changes = useSuggestionChanges(path);
const { activeId, setActiveId } = useActiveSuggestion();
```

- `useSuggestionMode()` returns the inferred `'suggesting' | 'editing'` value
  for the exact mounted view.
- `useSuggestionChanges(path)` returns native `AuthoredChange` records touching
  the current block range. It updates for document, authored-state, and
  projection changes while preserving referential stability when membership,
  revision, status, and range locations are unchanged.
- `useActiveSuggestion()` returns the active ID and setter from the exact
  mounted `SuggestionPlugin` provider. It has no model-global fallback.
- Do not publish named mode, hook-result, or discussion-review aliases unless
  emitted declarations prove that an otherwise useful call cannot be named or
  inferred.

Authored owns decisions and their structured outcomes:

```ts
const authored = editor.plugin(DefaultAuthoredPlugin);
const selection = authored.read.select({ ids: [changeId] });

const result = authored.update.decide({
  action: 'accept',
  selection,
});
```

The suggestion entrypoints do not wrap `select`, `decide`, `details`, results,
conflicts, or stale outcomes. Those jobs are already broader than suggestion UI.

Before and after registry call shape:

```ts
// Before: copied capability recovery and helpers.
const current = getSuggestionEditor(editor);
setSuggestionMode(editor, true);
editor.plugin(suggestionPlugin).store.set({ activeId: changeId });
```

```ts
// After: inferred package API and exact-view hook state.
const suggestion = editor.plugin(SuggestionPlugin);

suggestion.api.setMode('suggesting');
const { setActiveId } = useActiveSuggestion();
setActiveId(changeId);
```

The copied kit configures the package plugin. Core applies its feature-owned
attributes to the existing content roots:

```tsx
export const SuggestionKit = [
  SuggestionPlugin.configure({
    render: {
      contentAttributes: {
        className: '[&_[data-editor-retained=delete]]:line-through',
      },
    },
  }),
];
```

Package and runtime design:

1. `BaseSuggestionPlugin` lives under
   `packages/platejs/src/features/suggestion/**`, depends on
   `DefaultAuthoredPlugin`, and owns the two-mode translation plus CSS-free
   ordinary-range decorations.
2. Ordinary decorations emit the canonical attributes
   `data-editor-authored-change`, `data-editor-authored-kind`, and
   `data-editor-authored-status`. Remove copied `data-authored-*` attributes and
   dual selectors after all registry callers migrate.
3. Retained fragments keep their native
   `data-editor-authored-change`/`data-editor-retained` attributes. Do not build
   a second retained decoration layer or move retained DOM into Plate.
4. Base decoration read uses `authored.read.changesAt(range)`. The existing
   decoration manager owns document-commit and exact-view refresh. Base adds
   only the narrow authored state-publication observer needed to refresh exact
   affected node keys after status or decision facts change without a document
   refresh.
5. Extend native authored API with
   `subscribeChanges(listener): () => void`. A publication is immutable and
   contains the affected authored change IDs and exact decoration node keys for
   the subscribing view. Reuse existing commit publications and fragment-index
   buckets; do not create another authoritative index.
6. Reexport the authored publication type through `platejs/authored`. Keep the
   API generic and headless so any semantic decorator can consume it; do not
   name it after suggestion UI.
7. `SuggestionPlugin` lives under
   `packages/platejs/src/react/features/suggestion/**`, extends the base plugin,
   and installs a private store/provider through `wrapRoot`. The store is
   created and disposed with one mounted editor view, never in shared plugin
   model state.
8. The provider registers one exact-view observer and gives the plugin click
   handler access through a view-keyed private binding. Clicking the closest
   `[data-editor-authored-change]` activates that ID; clicking elsewhere clears
   it. Unmount, projection change, accepted/rejected disappearance, and missing
   markers also clear it.
9. Active changes refresh only old and new ordinary decoration node keys and add
   neutral `data-editor-suggestion-active` to the active ordinary range. Native
   retained fragments remain clickable but keep their current retained styling;
   they do not acquire an ordinary-range active paint marker in this scope.
10. `useSuggestionChanges(path)` selects native authored records with the copied
    membership equality made package-owned. Dates, cards, comment thread IDs,
    author labels, and popover shape stay in the registry.
11. Copied `SuggestionKit` configures `render.contentAttributes` with its
    Tailwind selectors. Generic live/static editor components contain no
    optional-feature styling. Comment styling belongs to `CommentKit`;
    comment and suggestion thread joins remain in `discussion.tsx`.

Entrypoint topology:

```text
platejs/suggestion
  -> platejs core
  -> platejs/authored

platejs/suggestion/react
  -> platejs core
  -> platejs/react
  -> platejs/suggestion
```

Forbidden DAG edges are `suggestion -> comments`,
`suggestion/react -> comments/react`, and either suggestion entrypoint -> AI.
There is no package-level `SuggestionKit` export.

Decision ledger:

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Change authority | Native authored plus copied semantic adapter | Native authored only | `plitejs/authored`, `platejs/authored` | Identity, decisions, persistence, and exact views already share one authority. | Keep all authored callers; suggestion delegates. | Authored contracts and package integration. | Accidental wrapper drift. | accept |
| Suggestion package | No entrypoint | Headless base plus React feature | `platejs/suggestion`, `platejs/suggestion/react` | Mode, markers, active selection, and stable queries are repeated product behavior. | Add exports, DAG, paths, partitions, docs. | Declarations, partition tests, build artifacts. | Oversized API. | accept, limited surface |
| Mode | Copied boolean helper | Literal two-mode plugin API | Base suggestion plugin | Boolean hides the developer job and copied helper blocks reuse. | Migrate toolbar, demos, editor-ai. | Type contract and browser mode journeys. | Consumers confuse advanced projections. | accept with direct-authored escape |
| Semantic markers | Mixed `data-authored-*` and native marker | Canonical `data-editor-authored-*` | Base suggestion plus native retained DOM | One vocabulary supports ordinary and retained content. | Rewrite registry selectors and tests. | DOM assertions across insert/delete/move/format. | CSS selector break. | hard cut old names |
| Decoration invalidation | Copied document/state/store observers; full state/store refresh | Existing manager plus targeted authored state publication | Plite authored and Plate decoration adapter | The manager already owns document/view refresh; authored knows affected IDs/buckets. | Delete copied observers after package coverage. | Source probe and final package perf harness. | Missing node key on structural edge. | accept with stop condition |
| Active ID lifetime | Shared plugin store | Private mounted-view React store | Suggestion React provider | Active UI state belongs to one rendered view. | Migrate direct store reads/writes to hook. | Two-view isolation and unmount tests. | Stale ID after decision. | accept with explicit clearing |
| Change hook | Copied UI-specific review objects | Stable native change records | Suggestion React hook | Reusable semantics should not include dates or cards. | Registry derives date/range locally. | Hook contract and discussion tests. | Unnecessary rerenders. | accept with membership equality |
| Comments | Mirrored into suggestion plugin state | Registry discussion joins optional Comments | Registry | Threads and first-thread styling are product composition. | Move joins to discussion/surface owner. | Suggestion without Comments plus discussion suite. | Lost comment highlight. | accept, package dependency forbidden |
| Presentation | Copied feature styles | Feature plugin content attributes, cards, toolbar, popovers, labels | Copied feature; core owns attribute composition | Generic editor independence is a hard law even without imports. | Configure SuggestionPlugin with feature selectors; remove generic Editor coupling and style-only wrapper. | Bare-content and static attribute contracts; browser journeys. | Merge precedence and reserved attributes. | accept after bounded probe |
| Decisions | Registry calls authored through cast | Registry uses the inferred authored plugin API | Authored | Structured outcomes already belong to authored. | Remove cast/helper; keep outcome handling. | Type declarations and decision journeys. | Inference regression. | accept |
| Package kit | Copied kit | Copied kit containing configured package plugin | Registry | Kit membership is application composition. | Keep `SuggestionKit` in registry only. | Registry source check/build. | None material. | accept |

Maximum-value hard cuts:

1. Do not move `apps/www/src/registry/components/editor/suggestion.tsx`
   wholesale. It contains Tailwind, a Comments join, a date/range view model,
   app slot composition, and shared semantic machinery. Publishing it would
   freeze product policy in the package.
2. Do not delete suggestion as a reusable feature and leave only authored.
   That forces every app to rebuild the same mode bridge, canonical markers,
   exact-view active lifecycle, targeted refresh, click targeting, and stable
   React change selection.
3. Do not rename authored to suggestion or mirror `accept`, `reject`, `details`,
   query, result, history, or persistence APIs. Authorship, AI edits, imported
   revisions, version history, and selective reversal are independent jobs.
4. Do not restore an independent suggestion mutation engine or store. The
   canonical authored change ID is the only identity in DOM, cards, decisions,
   comments targets, serialization, and AI flows.
5. Do not publish `SuggestionKit`, cards, toolbars, or popovers. A kit is copied
   application composition, not package behavior.
6. Do not retain `SuggestionEditor`, `getSuggestionEditor`, boolean
   `setSuggestionMode`, direct `suggestionPlugin.store`, or dual
   `[data-authored-change],[data-editor-authored-change]` selectors after
   migration.
7. Do not attach a second commit observer for document changes or authored view
   changes. The decoration manager already owns both.
8. Do not use `refresh({ nodeKeys: 'all' })` for active changes or authored
   state-only updates. Refresh old/new node keys and authored-published affected
   keys only.
9. Do not publish `SuggestionDiscussionReview`; the registry derives `Date` and
   card range from native `AuthoredChange` records.
10. Remove the copied change-thread map from suggestion plugin state. The
    existing registry `DiscussionStore` remains the join owner. Change-linked
    cards and threads remain; attaching a comment ID to a semantic suggestion
    decoration is not part of the package contract.

Adoption manifest:

Package and runtime owners:

- Add `packages/platejs/src/features/suggestion/index.ts` and focused source
  files for `BaseSuggestionPlugin` and its inferred API/types.
- Add `packages/platejs/src/react/features/suggestion/index.ts` and focused
  source files for `SuggestionPlugin`, its exact-view provider/store, and the
  three hooks.
- Extend `packages/plitejs/src/authored/authored.ts` and its public types with
  the narrow change publication. Reexport through
  `packages/platejs/src/authored/index.ts`.
- Add package contract tests beside the new features and extend
  `packages/plitejs/test/authored-changes-contract.test.ts`,
  `packages/plitejs/test/authored-view-contract.test.ts`, and
  `packages/plitejs/test/react/decoration-manager-contract.test.ts` only where
  they prove the new publication/lifetime boundary.
- Update `tooling/entrypoints/entrypoint-dag.mjs`, `packages/platejs/package.json`,
  `packages/platejs/tsconfig.json`, test/type-test aliases, partition metadata,
  entrypoint sizes, and generated barrels through repository generators.

Registry source adopters:

- Rewrite `apps/www/src/registry/components/editor/suggestion.tsx` as the small
  copied `SuggestionKit` with feature-owned `render.contentAttributes`. Core
  applies them to existing roots; generic Editor source stays feature-neutral.
- Migrate `apps/www/src/registry/components/editor/discussion.tsx` to
  `useSuggestionChanges`, `useActiveSuggestion`, and the inferred authored API
  decisions. Keep its dates, thread joins, stores, cards, pagination, popover,
  and `DiscussionSlots`.
- Migrate `mode-toolbar-button.tsx`, `suggestion-toolbar-button.tsx`, and
  `plugins.ts` to package mode/hook calls and copied kit composition.
- Migrate `apps/www/src/registry/blocks/editor-ai/components/editor/rich-text-editor.tsx`
  to `suggestion.api.setMode('suggesting')` after AI insertion begins.
- Migrate `playground-demo.tsx`, `suggestion-demo.tsx`,
  `suggestion-format-demo.tsx`, `suggestion-persistence-demo.tsx`,
  `suggestion-view-demo.tsx`, and `examples/values/suggestion-document.tsx`.

Registry and package tests:

- Rewrite `suggestion.spec.tsx`, `discussion.spec.tsx`, and
  `mode-toolbar-button.spec.tsx` around public package calls.
- Keep `inline-void-suggestion.slow.tsx` and
  `src/__tests__/package-integration/suggestion-link.slow.tsx` as cross-feature
  guards.
- Replay all ten journeys in `apps/www/tests/browser/suggestion.spec.ts`.
- Add route smokes for format, view, and persistence demos and one proof-only
  two-view active-click fixture/harness in
  `apps/www/tests/browser/suggestion-performance.spec.ts`.

Docs, generated output, release, and doctrine:

- Rewrite `content/docs/(plugins)/(collaboration)/suggestion.mdx` and `.cn.mdx`
  around package imports, mode, active state, and copied presentation.
- Update `content/docs/(plugins)/(collaboration)/discussion.mdx` and `.cn.mdx`
  for the registry-owned Comments join.
- Update `content/docs/(guides)/authored-changes.mdx` and `.cn.mdx` to direct
  advanced views and decisions to `platejs/authored` without presenting
  suggestion aliases.
- Update registry source metadata, then generate `apps/www/public/r/**` with
  `build:registry`; never edit generated JSON directly.
- Add one `.changeset/*.md` entry for `platejs: patch`. Do not add a separate
  `plitejs` release entry because the narrow native signal is consumed through
  the published Plate feature and is not the user-facing story.
- Add one registry changelog source MDX entry and regenerate its JSON.
- The suggestions review index records `adopted` and `verified`, cites the final
  receipt, and `docs/research/reviews.md` is regenerated through the ledger
  tool.
- If implementation contradicts reusable Best API teaching, repair the source
  rule, append the required Plate Next doctrine version, regenerate mirrors,
  and prove them. Do not edit doctrine merely to narrate this feature.

Explicit non-adopters:

- `packages/platejs/src/ai/react/AIChatPlugin.ts` continues to use authored
  changes directly for generated edit semantics.
- Version-history examples continue to use authored views and history directly.
- Markdown, DOCX, static HTML, Yjs, authored persistence, and migration code
  remain authored consumers.
- Any old `@platejs/suggestion` text under `templates/**` refers to generated or
  unrelated legacy package material and is not manually edited.

Acceptance scenarios:

1. A headless consumer imports `BaseSuggestionPlugin` without React, Comments,
   registry aliases, or UI dependencies and receives inferred mode APIs plus
   neutral semantic decorations.
2. A React consumer installs `SuggestionPlugin`; TypeScript infers
   `editor.plugin(SuggestionPlugin).api.setMode` and `.read.mode` without casts.
3. Switching one mounted view to suggesting mode does not change a sibling
   view's authored projection or active suggestion.
4. Ordinary insert, delete, move, and format changes expose canonical ID, kind,
   and status attributes. Retained content exposes the same canonical ID plus
   its native retained kind.
5. Clicking an ordinary marker activates only that view and marks one ordinary
   active range. Clicking retained authored content selects the matching card.
   Clicking outside, deciding the change, hiding it by projection, or unmounting
   clears stale active state.
6. An authored state-only status/decision update refreshes only published
   affected decoration node keys. A document edit and authored-view change are
   refreshed once by the existing decoration manager.
7. `useSuggestionChanges(path)` updates when a touching change moves, changes
   revision/status, appears, disappears, or changes projection, and stays
   referentially stable for unrelated commits.
8. Suggestion works with no Comments plugin installed. With Comments installed,
   registry discussion still groups change-linked threads and cards, prepares
   selection, paginates, and resolves accepted/rejected/stale/conflicted
   outcomes through authored.
9. AI and advanced authored consumers compile unchanged; no suggestion package
   dependency enters their semantic path.
10. New entrypoints contain no registry alias, Tailwind class, Comments import,
    AI import, package kit, or duplicated authored decision implementation.
11. Final source and browser performance stay within the frozen budgets and one
    sibling view records zero active-click wakes.

Execution slices:

| Slice | Owner | Scope | Entry | Exit | Proof |
| --- | --- | --- | --- | --- | --- |
| 1. Entrypoints and inference | Plate package/DAG | Add both entrypoints, descriptors, public exports, aliases, partitions, and type contracts before behavior migration. | Accepted API and DAG above. | Imports resolve; plugin calls and hooks infer; forbidden dependency edges fail tests. | Entrypoint DAG tests, partition typechecks, `typecheck:contracts`, generated declarations. |
| 2. Native signal and headless facade | Plite authored plus Base suggestion | Expose immutable exact-view affected IDs/node keys from existing authored publications; implement mode bridge and semantic ordinary decorations; rely on manager document/view refresh. | Slice 1 contracts compile. | State-only updates target exact keys; no new index/store/scheduler; headless feature has no React/Comments/UI. | Plite authored/decoration contracts, Base suggestion tests, source perf harness. |
| 3. Exact-view React behavior | Suggestion React | Add mounted-view provider/store, click targeting, stale-active clearing, targeted old/new refresh, active marker, and hooks. | Slice 2 publication stable. | One observer per mounted view; sibling isolation and cleanup hold; hook values are stable. | React partition tests, two-view contract, 5/5 lifecycle runs. |
| 4. Registry adoption | Registry suggestion/discussion/toolbars/examples | Replace copied semantic plugin, cast, mode helper, direct store access, Comments mirror, old attributes, and UI review alias; retain presentation and discussion composition. | Public package tests pass. | Every manifest caller uses package APIs; no legacy helper/selector remains; all review outcomes and optional Comments behavior pass. | Registry unit/integration suites, source checker, focused `rg` deletion audit. |
| 5. Docs, release, generation, doctrine | Docs/registry/release owners | Update EN/CN docs, metadata, changeset, registry changelog, barrels, generated entrypoints and registry JSON; conditionally repair doctrine. | Slice 4 API and behavior settled. | Docs teach final API only; generated outputs match source; release entries are valid; templates untouched. | `build:source`, docs checks, changelog generator, `build:registry`, package metadata/build checks. |
| 6. Final runtime and ledger closure | Verify Plate plus suggestions ledger | Run fresh final package/browser/performance proof, fingerprint sources, verify clean runtime input, then mark review adoption/proof. | Slices 1-5 complete and generated output settled. | Ten journeys plus added smokes pass; two-view and performance budgets pass; runtime errors empty; review record cites final evidence. | Exact commands below, final Playwright/perf receipts, ledger lookup, `git diff --check`. |

Proof matrix:

| Claim | Planning evidence | Execution proof | Status |
| --- | --- | --- | --- |
| Suggestion earns a package boundary | The copied file mixed reusable mode/marker/lifecycle code with registry presentation; ledger verdict was pursue. | Import, DAG, declaration, and package integration checks pass. | verified |
| Authored remains the only semantic authority | Package API delegates mode and reads; decisions remain authored; no suggestion persistence/store was added. | Authored contracts, unchanged direct AI/history consumers, and source dependency audit pass. | verified |
| Exact-view active state is necessary | The old plugin store was model-scoped while projection is exact-view; the final provider is mounted-view scoped. | Two mounted views use distinct managers, one observer each, zero sibling deltas, and pass 5/5 stability. | verified |
| Targeted invalidation scales | Frozen source probe reduces the full scan to one view observer and bounded semantic reads. | Final package harness passes all four cohorts and every deterministic counter. | verified |
| Comments are optional | Package DAG forbids Comments; DiscussionStore owns change-thread joins. | Headless/React tests pass without Comments and registry discussion tests pass with Comments. | verified |
| Registry retains presentation | Package emits neutral attributes; copied wrapper/cards/toolbars/popover remain in registry. | Source audit finds no Tailwind or registry imports in package; ten browser journeys pass. | verified |
| Plugin calls infer | The consumer cast is removed and public snippets contain no annotation. | Contract and generated declaration checks compile valid calls. | verified |
| Adoption is complete | Manifest names all direct helpers, plugins, examples, docs, tests, generated output, and release owners. | Final `rg`, source checker, registry build, and ledger record show no orphan. | verified |

Execution commands:

Entrypoints, partitions, inference, and package behavior:

```sh
pnpm entrypoint:turbo:generate
pnpm brl
node --test tooling/scripts/entrypoint-dag-plugin.test.mjs tooling/scripts/entrypoint-turbo.test.mjs
pnpm entrypoint:turbo:check
pnpm --filter platejs typecheck:partition:suggestion
pnpm --filter platejs typecheck:partition:suggestion-react
pnpm --filter platejs lint:partition:suggestion
pnpm --filter platejs lint:partition:suggestion-react
pnpm --filter platejs test:partition:suggestion
pnpm --filter platejs test:partition:suggestion-react
pnpm --filter platejs typecheck:contracts
```

Native authored boundary:

```sh
bun test --preload ./config/plite-source-test-setup.ts packages/plitejs/test/authored-changes-contract.test.ts packages/plitejs/test/authored-view-contract.test.ts packages/plitejs/test/react/decoration-manager-contract.test.ts
pnpm --filter plitejs typecheck
bun test packages/platejs/src/authored/authored.api.spec.ts packages/platejs/src/ai/react/AIChatPlugin.suggestions.spec.ts
```

Registry migration:

```sh
bun test apps/www/src/registry/components/editor/suggestion.spec.tsx apps/www/src/registry/components/editor/discussion.spec.tsx apps/www/src/registry/components/editor/mode-toolbar-button.spec.tsx
bun test apps/www/src/registry/components/editor/inline-void-suggestion.slow.tsx apps/www/src/__tests__/package-integration/suggestion-link.slow.tsx
pnpm --filter www exec tsx --tsconfig ./scripts/tsconfig.scripts.json scripts/check-registry-source.mts
```

Docs, release source, and generated output:

```sh
pnpm --filter www build:source
pnpm --filter www check:docs
node tooling/scripts/generate-ui-changelog-entries.mjs --write
node tooling/scripts/generate-ui-changelog-entries.mjs --check
pnpm --filter www build:registry
pnpm --filter www typecheck
```

Browser, final-path performance, and artifacts:

```sh
pnpm --filter plite test:plite-browser:chromium tests/plite-browser/runtime-entrypoints.test.ts
PLAYWRIGHT_BASE_URL=http://localhost:3298 pnpm --filter www test:www-browser:chromium tests/browser/suggestion.spec.ts
PLATE_SUGGESTION_PERFORMANCE=1 PLAYWRIGHT_BASE_URL=http://localhost:3298 pnpm --filter www test:www-browser:chromium tests/browser/suggestion-performance.spec.ts
pnpm --filter platejs build
node tooling/scripts/check-package-build-artifacts.mjs packages/platejs
node tooling/scripts/review-ledger.mjs lookup suggestions
git diff --check
```

Scale contract:

- applicability and source evidence: semantic range recomputation currently
  scales with text nodes and is awakened by active/plugin store and Comments
  changes. The proposed view store changes observer count and invalidation
  fan-out, so executable evidence is mandatory.
- user operation and before/after owner: activate one suggestion and publish one
  suggestion-related authored update. The old copied `suggestionPlugin`
  performed full-source refreshes. Final Suggestion React refreshes old/new
  active node keys and ignores Comments membership; native authored
  publications target semantic state changes.
- independent scale variables: text nodes, authored changes, mounted views,
  affected node-key count, warmups, and samples.
- source cohorts: normal 100 nodes/10 changes/5 warmups/25 samples; large
  1,000/100/5/25; stress 10,000/1,000/5/20; pathological
  50,000/5,000/3/10.
- frozen source budgets: at most one source observer per view, at most two
  semantic reads per UI operation, target p95 at most 1 ms normal, 1 ms large,
  5 ms stress, and 20 ms pathological. Every correctness assertion must pass.
- current baseline and target command:
  `bun docs/plans/artifacts/2026-09-13-suggestion-decoration-probe.ts`.
- source receipt:
  `docs/plans/artifacts/2026-09-13-suggestion-decoration-probe-result.json`.
- source identity: Git HEAD
  `5a899edcbea2c31f1bd34dc575c9dd3860c577d0`; current suggestion SHA-256
  `e55a0d208738989265491b54717923899e69de15f08d4292f3a2e7ed9d0a021e`;
  decoration manager SHA-256
  `443a03e3d1ce2db8ac5913be0965a030abc47cf1a80761a4cc1c134e0125ba9f`;
  Plate adapter SHA-256
  `8c65a31a698678a37c25b26218db98099a116ab06cf80530a3ec9e0b4d0a2bf1`;
  probe SHA-256
  `410432a1e6d5cd1c6b2d90215b335c605bbec9d60021c7283afc7065f70bdba7`;
  contract SHA-256
  `fc164902ccab147e11a9d9ddb9803b38b218dc4e6262792134b8e89217dc6c20`.
- environment: Bun 1.3.12, Apple arm64, macOS 26.3.1, source TypeScript in
  one local process.

Pre-acceptance source result:

| Cohort | Current semantic reads | Current p95 | Target semantic reads | Target p95 | Target budget | Verdict |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| normal | 12,000 | 1.618417 ms | 59 | 0.087375 ms | 1 ms | pass |
| large | 120,000 | 15.300083 ms | 59 | 0.065667 ms | 1 ms | pass |
| stress | 1,000,000 | 165.43475 ms | 49 | 0.0875 ms | 5 ms | pass |
| pathological | 2,600,000 | 707.079208 ms | 25 | 0.098459 ms | 20 ms | pass |

- correctness guard: Comments state does not refresh target semantic
  decorations; target owns exactly one observer for the view; active change
  lookup resolves the selected marker. All are true in the source receipt.
- timing/noise rule: retain the frozen sample/warmup counts and matched process;
  any failed absolute budget fails the target. Do not loosen a budget after a
  measurement.
- payload: the operation is in-process and serializes no payload. Final browser
  proof records fixture size and deterministic work counters instead of bytes.
- cold/failure: the final browser suite certifies first-frame suggestion paint,
  and package lifecycle tests assert observers detach on unmount and plugin
  removal.

Final browser performance contract:

- Fixtures: normal 100 nodes/10 changes, large 1,000/100, stress 10,000/1,000,
  and pathological 50,000/5,000. Every cohort mounts two read-only virtualized
  views over one model with deterministic change-to-node placement and no
  Comments plugin.
- Sampling: three independent passes, ten warmups and fifty samples per pass,
  plus five complete stability passes. The checked-in source probe preserves
  the matched pre-adoption full-refresh and targeted-design comparison; the
  final browser run certifies the implemented package path.
- Latency budgets: semantic p95 at most 1 ms normal, 1 ms large, 5 ms stress,
  and 20 ms pathological; DOM p95 at most 50 ms and p99 at most 100 ms.
- Fan-out: one authored source observer per view; active read/wake/bucket deltas
  at most two per click; sibling deltas exactly zero.
- Correctness: exactly one active marker/anchor in the clicked view; sibling has
  none; authored state and selection remain unchanged; runtime errors are empty.
- Result: all four cohorts pass. Semantic p95 stays between 0.3 and 0.4 ms;
  DOM p99 peaks at 1.4 ms; active and sibling counters are zero in the recorded
  run; each view owns one observer and a distinct manager; all five stability
  passes succeed.
- Final source: `apps/www/tests/browser/suggestion-performance.spec.ts` ran
  against a fresh final-source process. The execution JSON records the exact
  measurements, final ref, and SHA-256 fingerprints.
- Claim limit: these receipts certify local source invalidation and the named
  Chromium interaction. They make no Core Web Vitals, production telemetry, or
  universal editor-performance claim.

Conditional evidence:

- High-risk scenarios: applies. Exact-view isolation, projection-only changes,
  decision disappearance, retained fragments, plugin removal, optional
  Comments, stale/conflicted outcomes, format changes, inline voids, and AI
  mode entry are covered by acceptance and execution proof.
- External research: not required. The boundary is resolved from current Plate
  and Plite ownership plus the accepted repository review; no external API fact
  determines the target.
- Issue/PR provenance: not required. This is a user-selected ledger adoption
  plan rather than a public report or pull request.
- Docs/registry/browser/release/behavior law: applies. Owners and commands are
  named in slices 4 through 6.
- Performance: applies. The frozen source receipt and final package/browser
  rerun both pass.

Findings:

- The copied component's reusable core is larger than styling: it translates
  the common suggesting workflow, finds changes, emits markers, manages active
  review selection, and coordinates refresh. Leaving all of that copied would
  make package consumers rebuild correctness-sensitive behavior.
- Authored already owns every durable fact and decision. A suggestion package
  earns a facade and React integration boundary, not a new domain model.
- The current active ID lives in plugin store even though authored projection is
  exact-view. Two views over one editor model can therefore leak UI selection.
- The current observer duplicates decoration-manager document/view ownership
  and performs full refresh for state and store changes. Measured cost grows
  from 1.6 ms to 707 ms p95 across the source cohorts.
- Existing authored runtime already calculates affected change IDs and fragment
  buckets. Publishing that fact is a smaller durable change than adding another
  index inside suggestion.
- Existing DiscussionStore already owns the Comments join. Mirroring thread IDs
  into semantic suggestion plugin state creates unnecessary coupling and wakes.

Decisions and tradeoffs:

- Keep a small two-mode bridge because suggesting/editing is a common product
  job and the mapping is stable. Keep every advanced view direct in authored so
  the facade cannot grow into a second projection API.
- Put semantic decoration in the headless entrypoint because markers and
  changes-at-range do not require React. Put active lifetime and hooks in React
  because they belong to mounted views.
- Use the canonical `data-editor-authored-*` vocabulary for both ordinary and
  retained content. This is a hard selector break inside the copied registry,
  with complete in-repo adoption and no compatibility period on `next`.
- Keep active state private to the React provider. Only the hook and plugin API
  expose behavior; the store type and binding map stay internal.
- Return native `AuthoredChange` objects from the hook. Registry code may derive
  dates and first ranges, but those presentation choices do not enter package
  types.
- Exclude change-linked Comments from semantic decoration invalidation. The
  registry discussion join remains, while the package stays optional and the
  measured Comments wake disappears.

Review fixes:

- Three bounded read-only architecture critiques converged on the two-entrypoint
  package, canonical authored authority, exact-view state, optional Comments,
  and registry presentation.
- Rejected a proposed second `data-suggestion-*` marker vocabulary in favor of
  the existing native `data-editor-authored-change` identity.
- Retained the narrow two-mode facade despite an authored-only alternative
  because it removes repeated app policy without duplicating advanced views.
- Rejected a package kit and package discussion-review model; both are registry
  composition.

Error attempts:

| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| Probe fixture used unknown element type `p` | 1 | Use the registered `paragraph` type and rerun the same frozen contract. | Probe passed without changing budgets. |
| First monolithic plan replacement did not apply | 1 | Rebuild the plan with bounded `apply_patch` additions and inspect the saved result. | File content was reconstructed; final checker verifies completeness. |
| Cross-boundary pointer selection disappeared on `mouseup` | 1 | Trace the Plite view selection through the root interaction controller. | The ignore branch now skips immediate and deferred native-DOM imports while a projected view selection is active; the focused case and all ten journeys pass. |

Verification evidence:

- `bun docs/plans/artifacts/2026-09-13-suggestion-decoration-probe.ts` passed
  the frozen source-level contract on all four cohorts.
- Node JSON parsing accepted
  `docs/plans/artifacts/2026-09-13-suggestion-decoration-probe-result.json`.
- Final source and the suggestions ledger were re-read after adoption; source
  identities and proof limits are preserved in the execution receipt.
- A fresh probe rerun passed every budget and correctness assertion; target p95
  ranged from 0.044208 ms to 0.229583 ms across the four cohorts. Timing varies,
  while the deterministic read counts remained 59, 59, 49, and 25.
- Plite authored and React focused suites pass 45 tests, and the Plite package
  typecheck passes all 13 tasks.
- Plate suggestion headless and React partitions pass 13 and 9 assertions;
  contract types, package build, runtime import/SSR/DCE checks, and packed
  release artifact checks pass.
- The registry unit and cross-feature guards pass. Registry generation emits
  320 canonical payloads and 15 overlays; docs, API reference, source parity,
  app typecheck, changelog, entrypoint, and barrel checks pass.
- A fresh Chromium process passes all ten suggestion journeys and the Plite
  runtime-entrypoint case. The ungated performance file skips all four expensive
  cases as intended.
- The gated final performance suite passes all four cohorts across three
  measured passes and five stability passes. Semantic p95 is at most 0.4 ms,
  DOM p99 is at most 1.4 ms, each view owns one observer, and sibling deltas are
  zero.
- `docs/plans/artifacts/2026-09-13-suggestion-package-execution.json` records
  final fingerprints, measurements, counters, proof inventory, and claim
  limits.
- Ledger refresh/render/check pass; `suggestions` reports `reviewed`, `adopted`,
  and `verified` against the current working-tree inventory.

Final handoff completed:

- Ownership and target API: authored owns change semantics; Base suggestion owns
  the two-mode facade and neutral markers; Suggestion React owns exact-view
  active lifecycle/hooks; registry owns presentation and Comments composition.
- Public breaks and adoption: the two entrypoints are exported; copied casts,
  helpers, semantic plugin/store protocol, and old marker names are removed
  across every manifest caller.
- Runtime/package/docs/browser decisions: all apply and have named owners,
  commands, generated outputs, and release paths.
- Scale: the source comparison and final package two-view Chromium reruns pass
  every frozen budget and deterministic invariant.
- Exact affected keys reuse authored publications, plugin calls infer without a
  portal abstraction, stale active state clears with mounted-view lifetime, and
  registry discussion behavior passes after Comments decoupling.
- Publication was not requested. The checkout is ready for review as one
  complete suggestions adoption.

Timeline:

- 2026-09-13: created the deep Plate Plan and read Task, Best API, Plate Plan,
  Benchmark, Technical Writing, Changeset, Registry Changelog, and Plate Docs
  methods relevant to this planning scope.
- 2026-09-13: inspected current suggestion, discussion, authored,
  decoration-manager, package topology, consumers, tests, docs, and ledger.
- 2026-09-13: ran bounded architecture critiques and resolved marker, mode,
  package, lifetime, and presentation ownership.
- 2026-09-13: froze and passed the disposable source-level scale probe, then
  prepared the six-slice implementation and proof handoff.
- 2026-09-14: implemented the authored publication, headless and React package
  entrypoints, exact-view lifecycle, canonical markers, and complete registry
  adoption; deleted the independent mutation engine.
- 2026-09-14: regenerated package, API reference, registry, changelog, barrel,
  and ledger artifacts; passed package, docs, browser, and four-cohort
  performance closure.

Reboot status:

| Question | Answer |
| --- | --- |
| Where am I? | Design, implementation, adoption, proof, and ledger closure are complete. |
| Where am I going? | No further work remains in this adoption scope. |
| What is the goal? | Package reusable suggestion review behavior over authored changes and keep presentation in the registry. |
| What have I learned? | The package boundary is justified, but durable state and decisions must stay entirely in authored. |
| What have I done? | Shipped the public API in the checkout, migrated all in-repository callers, generated release artifacts, deleted duplicate machinery, and verified the final runtime. |

Open risks:

- No open implementation risk remains for the accepted package boundary.
- Evidence is limited to local Chromium and deterministic fixtures; native,
  mobile, assistive-technology, production RUM, and multi-author network
  behavior were not measured.
- The broader Google behavior audit remains independent of this package
  adoption and is not represented as complete product parity.
