# plate-next usePath subscription sweep

Objective:
Remove unnecessary production usePath dependencies; done when every call is
classified, event-only drift is cut, and focused proof passes.

Goal plan:
docs/plans/2026-07-20-plate-next-usepath-subscription-sweep.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user correction: "ok go fix all" after identifying
  `usePath()` as costly repeated-node path reactivity
- mode: broad named-API correction sweep, not a broad Core file review
- target surface: every production `usePath()` call under `packages/**` and
  `apps/www/**`, with the hook implementation/tests read only as context
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no; this is a cross-owner call-site classification
- correction-triggered related scoped sweep: yes; classify every production
  `usePath()` match
- package review mode: no; the user explicitly requested all matching owners
- package review target: N/A
- package file checklist gate: N/A
- completion threshold summary: 100% production matches classified; all
  event-only dependencies removed; every retained reactive call justified;
  focused types/tests/browser proof pass

First checkpoint:
- Copy every explicit prompt requirement into this plan before implementation:
  target, duration, non-goals, stop condition, proof commands, final handoff,
  and whether the user asked for `sweep`, `all core`, `full-loop`, or an
  equivalent broad Core review.
- If broad Core sweep is in scope, fill the Core drift ledger rows in this
  plan before closing any packet. Keep this template-only.
- If package review mode is in scope, generate the package file manifest and
  materialize one checkbox per reviewed file in this plan before
  implementation. A file checkbox may be checked only when its score is `100`.

Timed checkpoint:
- requested duration: none
- semantics: N/A
- initial confidence score: N/A; binary manifest and proof gates apply
- improvement loop: audit, patch, prove, re-audit
- final score / loop closure: zero unclassified production matches

Completion threshold:
- Every production `usePath()` call is listed and classified as
  `event-only-cut`, `render-reactive-keep`, `effect-reactive-keep`, or
  `intentional-perf-proof`.
- Every `event-only-cut` call resolves the path lazily from the live element at
  interaction time and handles an unresolved path.
- Every retained call has a concrete render/effect dependency on path changes.
- Focused typechecks/tests for every touched package and `apps/www` browser
  proof pass.
- Named file/API work may close from a scoped source map and focused proof.
- One-by-one review work may close only after the best Plate v2 recommendation
  is recorded, legacy/backcompat hacks are rejected, any Plite/Plate gaps are
  named, and every correction has a related scoped sweep row.
- Broad Core sweep may close only when every Core source file has a valid row
  in this plan's Core drift ledger section or a linked plan artifact summarized
  in this plan.
- Package review mode may close only when every package file row is either
  checked at score `100` or explicitly deferred for user review with reason,
  owner, proof needed, and next action. Do not move to the next package while
  unchecked package rows remain.
- Core-adjacent package review may close only after
  `tooling/scripts/check-core.mjs` is updated to include that package, or the
  plan records why the package is product-only and does not belong in
  `check:core`.
- The plan records manifest command, expected row count, actual row count,
  missing row count, extra row count, and top drift rows before closeout.
- Any drift score `>=2` has an owner, evidence, and next action.
- Any drift score `>=4` is fixed, hard-cut, moved, quarantined, or deferred
  with owner/proof; it cannot close as `keep-in-plate`.
- Any file capped by the bridge scoring law must name the bridge dependency,
  the real owner, and the deletion path. It cannot be raised to 100 from
  `check:core` alone.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-20-plate-next-usepath-subscription-sweep.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: touched package source-first typechecks plus
  focused owner tests where available
- package proof: all touched package typechecks pass
- shared Core gate: N/A unless a Core API change becomes necessary
- source audits: exact `rg` manifest before and after; every remaining
  production match has a ledger row
- related scoped sweep query / active scope / match count / patched count / deferred count:
  production `usePath()` audit under `packages/**` and `apps/www/**`; 15
  initial calls, 14 cut, 1 intentional benchmark retained, 0 deferred
- package file manifest / row count / checked count / deferred count: N/A;
  this is a named-API sweep, not package review mode
- Plite/Plate gap ledger: N/A unless lazy element-to-path resolution proves
  unavailable
- broad Core drift ledger gate: N/A; no broad Core file review
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-20-plate-next-usepath-subscription-sweep.md`

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
- After every correction, run a related sweep only inside the active mode
  scope. Package review mode is scoped to the named package plus the smallest
  Plite/Core owner needed to unblock that package. Broader matches become
  deferred rows or next-package candidates, not edits.
- In package review mode, do not update docs, examples, package callers outside
  the named package, unrelated packages, generated registries, or broad repo
  surfaces unless the user explicitly broadens scope with `all packages`,
  `current tree`, `full-loop`, `sweep`, or the broader owner name.
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
- Package review mode is review-first, not migration-first. Freeze scope to the
  named package plus the smallest Plite/Core owner needed to remove a blocker.
- Package hard cuts land package by package. A broad audit can discover
  outside-scope callers, but the plan must record them as deferred rows instead
  of patching them in the current package packet.
- Package file rows can be checked `[x]` only at score `100`: no behavior
  regression versus `origin/main`, no type regression, inline inference
  preserved, no inferred local type annotations, no fake casts/local helper
  types, no compat sludge, correct Plite/Plate ownership, accepted
  owner/name/path drift, and focused proof or justified source audit.
- Green package tests alone do not score a file `100`.
- Do not move to the next package until every package file row is checked at
  `100` or explicitly deferred for user review.
- Core-adjacent package review must update `check:core` coverage before
  closeout, or explicitly classify the package as not belonging in that gate.
- For Core-only targets, ignore non-Core package errors unless the package is
  named, touched by the packet, or the failure proves a Core public API
  regression.
- Direct one-shot Plite API law: prefer `editor.update.foo.bar(...)` and
  `editor.read.foo(...)` over callback wrappers for one-line reads/writes.
  Callback form is only for grouped transaction/snapshot logic, shared
  intermediate state, branching/looping, or missing direct API that is recorded
  as a Plite gap.
- Live node target law: if a caller already has a live descendant, pass it as
  the `NodeTarget` / `at` value or use `editor.read.nodes.path(node)` only when
  a `Path` is required. Do not rediscover it with a type/ID query. Handle an
  unresolved public path instead of asserting it.
- Property matcher law: exact shallow equality uses property objects such as
  `match: { type }`, `match: { id }`, and array-valued one-of matchers.
  Property matchers intentionally ignore `text` and `children`; content and
  structure checks remain predicates. Predicates also remain for computed
  schema policy, path-dependent logic, truthiness semantics, or consumed type
  narrowing.
- Flat node-query aliases are forbidden: no `editor.api.findPath`,
  `editor.api.some`, `read.nodes.pathOf`, Plate wrappers, or implicit type/ID
  scans. Use `editor.read.nodes.path`, `editor.read.nodes.some`, and direct
  node targets.
- Boolean node-query law: when an entry-producing collection query is used only
  for truthiness and `nodes.some` has the same target/match/traversal semantics,
  use `editor.read.nodes.some`. Keep `above`, `block`, `parent`, `previous`, and
  `next` when their ancestor/current-block/relative traversal is the actual
  question, and keep any entry-producing query when the node/path is consumed.
- Optional public-read law: Plate feature-package source handles unresolved
  Plite reads with an early return/no-op. `{ required: true }` is reserved for
  Plite internals with a proven runtime invariant; fixture assertions are the
  test-only exception.
- Explicit normalization law: bare `tx.normalize()` /
  `editor.update.normalize()` is an explicit full-root pass in Plite. Feature
  code may keep it only for a named full-root semantic invariant. Do not use it
  to coalesce equivalent text leaves or preserve old fixture shape. Prefer
  transaction dirty-path normalization, repair a universal invariant in Plite,
  and classify every match in the active scope as `cut`,
  `semantic-dirty-path`, `semantic-full-root`, `explicit-normalizer-test`,
  `lifecycle-option`, or `Plite-owner-gap`.
- Active transaction law: no `editor.update.*` call may appear inside an
  `editor.update(...)`, `editor.update.withoutNormalizing(...)`, transform
  middleware, or other active transaction callback. The callback must receive
  and use the active `tx`; `withoutNormalizing` callbacks should be
  `({ tx }) => { ... }`.
- Plugin export inference law: plugin constants should infer from
  `createBasePlugin`, `createPlatePlugin`, `toPlatePlugin`, and chained
  `.extend*` methods. Do not annotate exports as `BasePlugin<Config>` /
  `PlatePlugin<Config>` or cast chained plugin results unless the annotation is
  a true external boundary. If inference fails, fix the builder/generic owner.
- Empty config inference law: do not create `type FooConfig =
  PluginConfig<'foo'>` only to call `createBasePlugin<FooConfig>({ key:
  'foo' })`. Manual plugin config types are only for real options, API, tx,
  selectors, state, or external public contracts.
- Plugin editor extension law: plugin-owned editor extension options should be
  returned directly from `extendExtension`. Do not wrap them in
  `defineEditorExtension({ name: pluginName, ... })` just to satisfy types.
  `extendExtension` must accept both built extensions and raw options; raw
  options without `name` default to the owning plugin key. Keep explicit names
  only for genuinely separate extension identities.
- Inferred local type law: do not annotate local variables whose initializer
  should infer the type. Smells like `const entries: NodeEntry<T>[] =
  editor.read...` or `const value: Value = [...]` hide type regressions at the
  owner API. Remove the annotation and fix the source API if inference is weak.
  Keep annotations only for uninferrable locals such as empty arrays,
  deliberate narrowing/widening, exported/public signatures, or external
  boundary callbacks.
- Plugin option law: root plugin option helpers are forbidden public API. Do
  not use or re-add `editor.getOption(...)`, `editor.getOptions(...)`,
  `editor.setOption(...)`, or `editor.setOptions(...)`. Package code should use
  scoped plugin portals by default (`editor.plugin(FooPlugin).getOption(...)`,
  `editor.plugin(FooPlugin).getOptions()`,
  `editor.plugin(FooPlugin).setOption(...)`,
  `editor.plugin(FooPlugin).setOptions(...)`). `usePluginOption(FooPlugin, ...)`
  remains the render-subscription path. Key+generic fallbacks need an owner
  reason: plugin self-definition cycle, React hook/component imported by the
  plugin itself, non-React layer that must not import a React plugin, or
  intentionally decoupled cross-package code. Plugin-owned helper graphs should
  receive plugin context (`api`, `getOption`, `getOptions`, `setOption`, `tx`)
  or be thin wrappers over the typed plugin API/tx group.

Boundaries:
- allowed edit scope: production `usePath()` consumers under `packages/**` and
  `apps/www/**`, colocated tests when behavior needs proof, this plan, and the
  smallest Core/Plite owner only if a real API gap is proven
- package/API surfaces: React hooks/components that currently consume
  `usePath()`; no public API redesign planned
- docs/browser surfaces: affected standalone registry demo route for browser
  proof; no content-doc rewrite
- non-goals: do not remove legitimate path-reactive UI, change node behavior,
  redesign `usePath()`, sweep unrelated subscriptions, or touch generated
  registry output
- out-of-scope package errors: classify and leave alone unless caused by this
  sweep

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.
- Count/file-list searches come before code reads; inspect only matched files
  and relevant owner APIs.

Blocked condition:
- A production caller genuinely needs reactive path state but no narrow
  renderer prop/runtime-id mechanism exists, requiring a public Plite/Plate API
  decision; or the same attributable proof failure repeats three times with no
  autonomous next move.

Current verdict:
- verdict: keep
- confidence: high
- next owner: plate-next
- keep / revert / quarantine call: keep the sweep
- reason: production consumers use live node targets, renderer path props, or
  lazy event-time path resolution; the only remaining runtime hook call is an
  explicit performance benchmark

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact all-call sweep, preservation rule, proof, and stop condition recorded above |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read completely |
| Active goal checked or created | yes | Goal created for this plan |
| Mode classified as named packet vs broad Core sweep | yes | Broad named-API correction sweep; not broad Core review |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Lazy event-time path resolution; reactive hook only for actual render/effect dependency |
| Broad Core drift ledger initialized when in scope | no | N/A: broad Core review is outside scope |
| Source of truth and allowed workspace recorded | yes | `/Users/zbeyens/git/plate-2`; boundaries above |
| Output budget strategy recorded | yes | Count/file-list first; matched-file reads only |
| Public API fork routing checked | no | N/A unless audit proves an API gap |
| Gap policy checked | yes | Stop and route a real missing primitive; no local bridge |
| Related scoped sweep policy checked | yes | Every production `usePath()` match is in scope |
| Review-mode rename freeze checked | yes | No renames planned |
| Package review checklist initialized when in scope | no | N/A: cross-owner named-API sweep, not package mode |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
- [x] Best Plate v2 call recorded for every reviewed target.
- [x] Legacy/backcompat decision recorded: no alias, shim, wrapper, or fallback
      was introduced.
- [x] Hack check recorded: no bridge, broad cast, or duplicate helper was
      introduced.
- [x] Gap ledger closed: existing Plite `NodeTarget` and `nodes.path` APIs
      cover the sweep.
- [x] Related scoped sweep recorded with exact query and counts.
- [x] Broad Core ledger gates recorded as N/A.
- [x] Package review checklist gates recorded as N/A.
- [x] `check:core` coverage recorded as N/A; no package review occurred.
- [x] Direct one-shot API audit closed in the touched source.
- [x] Live node target audit closed: updates pass live elements; `Path` is
      resolved only where selection/plugin state requires it.
- [x] Optional public reads handle unresolved paths with early return.
- [x] Normalization, plugin export, empty config, extension options, and bridge
      gates are N/A for this named API sweep.
- [x] Review matrix is filled for every inspected runtime/API group.
- [x] No public API fork was needed.
- [x] Rename freeze applied; no file or API rename landed.
- [x] Extracted-file gate is N/A; no new source/test file was created.
- [x] Safe cleanup packet kept after focused proof and clean autoreview.
- [x] Focused package proof was rerun after meaningful changes.
- [x] Barrel generation is N/A; exports did not change.
- [x] Removed-hook source audit is clean.
- [x] Changed list, drift rows, attention rows, and next owner are filled.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Run named proof | Package/app types, focused tests, source audit, and Browser proof passed |
| Broad Core drift ledger coverage | no | N/A | Named API sweep; zero Core review rows |
| Score gate | yes | Close all drift | 14 calls cut; one benchmark retained intentionally |
| Best Plate v2 recommendation | yes | Record best shape | Live node target, renderer path prop, or lazy path lookup |
| Plite/Plate gap ledger | yes | Record blockers or N/A | No gap; Plite APIs are sufficient |
| Related scoped sweep after correction | yes | Re-audit same class | 15 initial, 14 patched, one retained, zero deferred |
| Package file checklist | no | N/A | Not package review mode |
| Package/API proof | yes | Typecheck and test | All touched packages pass |
| Shared Core gate coverage | no | N/A | No Core-adjacent package review |
| Non-Core package error triage | yes | Classify failures | Concurrent build race passed serially; demo blockers recorded below |
| Source audit | yes | Audit removed hook | Only benchmark call and Core hook message remain |
| Rename ledger | no | N/A | No rename |
| Extracted-file inventory | no | N/A | No new source/test file |
| Autoreview / review | yes | Run until clean | Two findings fixed; rerun clean at 0.82 confidence |
| Final lint/check | yes | Run scoped checks | Biome clean; ESLint zero errors; diff check recorded below |
| Changed list / top drift / needs attention | yes | Fill ledgers | Filled below |
| Goal plan complete | yes | Run plan checker | Checker command listed in verification evidence |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| callout and combobox hooks | 0 | cut hook subscription | feature packages | live element targets; tests pass | keep |
| math equation input and equation registry UI | 0 | cut hook subscription | math / www | points and writes accept live element targets | keep |
| date, code block, table, and column registry UI | 0 | cut hook subscription | www / layout | event handlers target live elements | keep |
| footnote registry UI | 0 | use renderer path prop | www | path drives render selection/highlight state | keep |
| resizable | 0 | lazy path only for selection | resizable | resize mutation uses live element; focus path resolves on event | keep |
| caption button, textarea, and showCaption | 0 | lazy path at use time | caption | delayed/event logic no longer captures stale paths | keep |
| editor performance benchmark | 0 | intentional-perf-proof | www perf | benchmark explicitly measures hook cost | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| node mutation/read at interaction time | pass the live element as `NodeTarget` | subscribing to `usePath`; rediscovering by ID/type | avoids per-node path reactivity and stale locations | none |
| render state genuinely keyed by path | consume renderer `props.path` | adding another path subscription | renderer already owns the path for that render | none |
| APIs that require a `Path` | resolve `editor.read.nodes.path(element)` immediately before use and return if absent | capture-before-timeout; non-null assertion | handles moves/removals correctly | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | none | N/A | Plite already exposes live `NodeTarget` reads/writes and optional path resolution | package types and tests | no API addition |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| costly `usePath()` subscriptions | production TypeScript under `packages/**` and `apps/www/**` | `rg -n '\busePath\s*\(' ...` excluding tests/generated | 15 initial calls | 14 calls in 12 consumers | 0 | one explicit benchmark call |
| stale path captured before delayed work | caption runtime siblings | review of `setTimeout` + `nodes.path` call sites | 2 caption helpers | 2 | 0 | none in caption scope |
| stale test mocks | colocated touched tests | `rg 'usePathMock|usePath\s*:'` | 4 stale app mocks plus one callout spy | 5 | 0 | Core hook tests intentionally exercise `usePath` |

Core drift ledger:
- Applies: no
- Manifest command: N/A
- Manifest owner: `packages/core/src/**/*.{ts,tsx,mts,cts}`
- Optional type-test owner: `packages/core/type-tests/**/*.{ts,tsx,mts,cts}`
- Ledger location: this table or a linked artifact summarized here
- Expected row count: 0
- Actual row count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: N/A
- Top drift rows: N/A

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | 0 | outside scope | core | hook implementation unchanged | none |

Package file checklist:
- Applies: no
- Package: N/A
- Manifest command: N/A
- Manifest owner:
  `packages/<package>/src/**/*.{ts,tsx,mts,cts}` plus package-local specs,
  test-utils, type-tests, fixtures, examples, and docs only when touched.
- Expected row count: 0
- Actual row count: 0
- Checked score-100 count: 0
- Unchecked/deferred count: 0
- Missing row count: 0
- Extra row count: 0
- Score gate: `[x]` only when score is `100`.
- Next package blocked until: N/A

Package file rows:
- [x] N/A — package mode was not entered.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| live target conversion | feature packages / www | event handlers do not need reactive paths | 12 production consumers | cut 14 hook calls | keep |
| path-only behavior | caption / footnote | some behavior truly consumes a path | props path or lazy lookup | preserve semantics without subscription | keep |
| proof correction | colocated tests | mocks asserted legacy `[0]` paths | seven tests | prove live targets/renderer paths | keep |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| N/A | no extracted files | N/A | none created | named-file diff review |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| concurrent `apps/www` typecheck attempt | two parallel Turbo graphs raced on `packages/plite-dom/.plite-types` | serial rerun passed 57/57 | tooling follow-up only if reproducible without concurrent graphs |
| `/blocks/date-demo` and `/blocks/code-block-demo` | editor value fails JSON validation before component render; later reload also reports missing `KEYS` in suggestion-node | failures occur in generic `Demo`/`EditorKit`, before any changed component | apps/www migration runtime |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| Core `usePath()` contract tests | packages/core | they intentionally validate the hook implementation | keep |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | 12 hook consumers repaired; caption sibling fixed; `setColumns.at` accepts live column-group targets |
| tests/proof | seven colocated test files prove live targets or renderer paths |
| docs/templates/skills | this goal ledger only |
| reverted/quarantined packets | none |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| 1 | registry standalone demos fail before changed nodes render | blocks demo-specific Browser proof | `apps/www/src/registry/examples/demo.tsx` and `apps/www/src/registry/ui/suggestion-node.tsx` | repair as the next apps/www migration packet |

Findings:
- A live descendant is already the best mutation/read target; subscribing every
  node to its path is unnecessary.
- Renderer `props.path` covers path-reactive footnote state without a second
  store subscription.
- Delayed caption focus must resolve the node path inside the callback.
- No Plite API is missing for this correction.

Decisions and tradeoffs:
- Keep `usePath()` public and tested; cut only production consumers that do not
  need path reactivity.
- Keep the explicit performance benchmark because it measures the exact cost
  this sweep avoids.
- Do not broaden into unrelated registry initialization failures.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| raw Bun invocation skipped the math package test setup | 1 | use package `test` wrapper | full math suite passed 18/18 |
| footnote test initially omitted two renderer paths | 1 | pass `nodePath` through component props | slow suite passed 19/19 |
| parallel package/app typecheck raced on generated declarations | 1 | rerun app graph serially | 57/57 tasks passed |
| standalone registry demo Browser routes fail before component render | 2 routes | verify the unaffected huge-document/perf route and record owner | `/dev/editor-perf` mounted 5,000 blocks |
| autoreview found stale delayed caption path and callout test mock | 1 cycle | fix both and rerun focused proof/review | final review clean |

Verification evidence:
- `pnpm turbo typecheck --filter=./packages/callout --filter=./packages/combobox --filter=./packages/math --filter=./packages/resizable --filter=./packages/caption --filter=./packages/layout` — 17/17.
- `pnpm turbo typecheck --filter=./apps/www` — 57/57 on serial rerun.
- Package tests: callout 3/3, caption 6/6, combobox 42/42, layout 24/24,
  math 18/18, resizable 13/13.
- Registry tests: code block 2/2; date 3/3; footnote 19/19; inline void 4/4.
- Biome checked all touched files; ESLint reported zero errors.
- Browser: `/dev/editor-perf` mounted the 5,000-block Plite baseline and exposed
  the intentional `usePath()` benchmark lane.
- Autoreview final result: clean, no accepted/actionable findings, confidence
  0.82.
- `git diff --check` and the plan checker are final closeout commands.

Final handoff contract:
- target surface and mode: every production `usePath()` consumer in packages
  and apps/www; broad named-API correction sweep
- files/APIs reviewed: 13 runtime helpers/components, one layout API owner, and
  seven colocated tests
- broad Core drift score coverage: N/A
- package file checklist coverage: N/A
- best Plate v2 recommendation: live node target by default; renderer path prop
  for render state; lazy optional lookup only for APIs requiring a `Path`
- verdict matrix summary: 14 calls cut, one benchmark kept, zero deferred
- Plite/Plate gaps or blockers: none
- related scoped sweep query/active scope/matches/patched/deferred:
  `rg '\busePath\s*\('` in production packages/apps; 15/14/0
- out-of-scope matches discovered: intentional Core hook tests
- changes made: subscription cuts, live-target typing, stale delayed-path fix,
  and corrected test contracts
- tests/proof commands: recorded above
- old compatibility names audited: stale production/test path hook references
  are gone outside intentional hook tests and benchmark
- needs attention: registry generic Demo/EditorKit runtime blocker
- next best Plate Next packet: repair the standalone registry demo runtime, then
  resume the next package migration packet

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final verification |
| Where am I going? | Close the usePath subscription sweep |
| What is the goal? | Remove unnecessary production path subscriptions without losing path semantics |
| What have I learned? | Plite live targets already cover every changed mutation/read |
| What have I done? | Cut 14 calls, fixed a delayed stale path, proved the touched owners |

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Manifest and classification | done | 15 initial calls classified |
| Runtime and test repair | done | 14 calls cut; stale delayed path fixed |
| Focused proof and review | done | types/tests/browser/audit/review clean |
| Ledger closure | done | diff check and plan checker clean |

Timeline:
- 2026-07-20T18:43:02.425Z Goal plan created.
- 2026-07-20T18:48:00Z Production manifest classified: 15 calls.
- 2026-07-20T18:55:00Z Runtime and test sweep implemented.
- 2026-07-20T19:01:00Z Focused package/app proof passed.
- 2026-07-20T19:04:00Z Autoreview rerun clean after two accepted fixes.

Open risks:
- Standalone registry demo initialization is independently broken before the
  changed node components render; this does not invalidate package/test proof
  or the green 5,000-block browser route.
