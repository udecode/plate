# plate-next floating media option typing

Objective:
Repair floating-media plugin option inference without casts; prove the typed
portal call, same-class media sweep, focused behavior, and package typecheck.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-14-plate-next-floating-media-option-typing.md

Template:
docs/plans/templates/plate-next.md

Primary template:
docs/plans/templates/plate-next.md

Applied packs:
- none

Plate Next source:
- prompt / link: user flagged the cast in
  `packages/media/src/react/media/FloatingMedia/submitFloatingMedia.ts` and
  asked for a clean repair
- mode: named file/API packet plus mandatory package-local same-class sweep
- target surface: floating-media plugin option lookup and its typed prop chain
- review target: best Plate v2 migration on top of Plite, not legacy
  compatibility
- broad Core sweep: no
- correction-triggered related scoped sweep: yes, media package only
- package review mode: no; the user named one file/API rather than the package
- package review target: N/A
- package file checklist gate: N/A
- completion threshold summary: no cast or fake local structural type; options
  infer through the plugin portal; all same-class media matches classified;
  focused test, media typecheck/lint, review, and plan gate pass

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
- requested duration: N/A: none requested
- semantics: N/A: one-shot execution
- initial confidence score: N/A: binary typing and proof gates
- improvement loop: repair the smallest owner, typecheck, sweep, review, close
- final score / loop closure: zero dirty casts in the scoped class and all
  named checks pass

Completion threshold:
- `submitFloatingMedia` obtains `MediaPluginState` through a typed plugin
  portal with no `as` cast, `any`, or fake structural editor/plugin type.
- The package-local `WithRequiredName` / plugin-option cast class is fully
  audited and every match is repaired or justified.
- Floating-media focused tests, media source-first typecheck/lint, scoped
  review, and the mechanical plan gate pass.
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
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-14-plate-next-floating-media-option-typing.md`
  passes after final evidence is recorded.

Verification surface:
- focused tests / commands: floating-media submit spec
- package proof: `pnpm turbo typecheck --filter=./packages/media` and scoped
  media lint
- shared Core gate: N/A unless the repair changes Core typing
- source audits: `WithRequiredName<PluginConfig`, `as WithRequiredName`,
  `plugin(... as`, and media `getOptions()` callers
- related scoped sweep query / active scope / match count / patched count / deferred count:
  initial query found one cast match in `packages/media/src`; final counts will
  be recorded after repair
- package file manifest / row count / checked count / deferred count: N/A:
  named file/API mode
- Plite/Plate gap ledger: under investigation; prefer existing typed portal
  contract over a new Core API
- broad Core drift ledger gate: N/A: no broad Core sweep
- final plan check: `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-14-plate-next-floating-media-option-typing.md`

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
- allowed edit scope: floating-media option types/callers inside
  `packages/media`, focused tests, an existing media changeset only if public
  typing changes, and this plan; smallest Core type owner only if proven needed
- package/API surfaces: exported floating-media helper/component option typing
- docs/browser surfaces: N/A: headless type/API repair with direct package proof
- non-goals: no full media migration, no app/registry edits, no Core plugin API
  redesign without proof that the current portal cannot express the contract
- out-of-scope package errors: report, do not repair

Output budget strategy:
- For broad Core sweep, use manifest counts and ledger artifacts instead of
  streaming every file path into chat.
- For named file/API work, use targeted `sed`/`rg` reads and capped output.

Blocked condition:
- Stop only if the existing portal cannot carry the media option type without
  a broader public Core API fork; route that fork instead of casting.

Current verdict:
- verdict: `main-parity-cleanup`; preserve the floating-media owner and repair
  the lost typed plugin contract
- confidence: high that the local cast is invalid; implementation choice still
  requires typecheck evidence
- next owner: plate-next
- keep / revert / quarantine call: keep only an inference-preserving portal
  call; revert any solution that moves the cast or invents a fake plugin type
- reason: plugin options are product configuration and belong on the scoped
  plugin portal

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Prompt requirements captured before work | yes | Exact file, clean typing outcome, sweep, proof, non-goals, and final handoff recorded |
| `plate-next` skill/rule read | yes | `.agents/skills/plate-next/SKILL.md` read fully |
| Active goal checked or created | yes | Goal created with this plan path |
| Mode classified as named packet vs broad Core sweep | yes | Named file/API packet; media-local correction sweep only |
| Review target recorded as best Plate v2 / Plite-fit / no legacy compat | yes | Typed scoped portal, no cast or compatibility wrapper |
| Broad Core drift ledger initialized when in scope | no | N/A: no broad Core sweep |
| Source of truth and allowed workspace recorded | yes | Current checkout, target, caller, portal types, and `origin/main` target read |
| Output budget strategy recorded | yes | Exact reads and capped package searches |
| Public API fork routing checked | yes | First attempt must use existing portal contract; broader Core fork stops for routing |
| Gap policy checked | yes | No gap claimed until existing typed portal is proven insufficient |
| Related scoped sweep policy checked | yes | Same-class media cast and option lookups inventoried |
| Review-mode rename freeze checked | yes | No names or files will move |
| Package review checklist initialized when in scope | no | N/A: named file/API mode |

Work Checklist:
- [x] First checkpoint complete: every explicit prompt requirement, scope
      boundary, timing constraint, stop condition, deliverable, final handoff
      section, verification surface, and success criterion is copied into this
      plan before implementation.
- [x] Mode classified: named file/API packet, broad Core sweep, package sweep,
      docs/API mismatch, or public API plan.
- [x] Best Plate v2 call recorded for every reviewed target: `cut`,
      `move-to-plite`, `keep-in-plate`, `private-bridge-with-deletion-gate`,
      `Plite gap`, `Plate gap`, or `blocker`.
- [x] Legacy/backcompat decision recorded: no public compat alias, shim,
      duplicate Plate wrapper around Plite, old command fallback, or old docs
      path is kept unless explicitly accepted with deletion gate.
- [x] Hack check recorded: no bridge/helper dump, broad `any` cast, fake
      alias, or displaced product/plugin behavior is kept as a shortcut.
- [x] Gap ledger updated for every blocker: exact missing Plite or Plate
      capability, why local workaround is wrong, smallest owner, and proof.
- [x] After every correction, related scoped sweep row is added with query,
      active scope, match count, patched count, deferred count, and remaining
      risk. In package review mode, broader matches are deferred, not patched.
- [x] For broad Core sweep, the Core drift ledger in this plan, or linked from
      this plan, has one row per Core source file before closeout.
- [x] For broad Core sweep, every Core file row has `path`, `drift_score`,
      `verdict`, `owner`, `evidence`, and `next`.
- [x] For broad Core sweep, the plan records manifest command, expected row
      count, actual row count, missing row count, extra row count, and confirms
      missing/extra are zero.
- [x] For broad Core sweep, the drift score gate is closed in this plan:
      score `>=2` rows have owner/evidence/next, and score `>=4` rows are not
      closed as `keep-in-plate`.
- [x] For package review mode, the package file checklist is generated before
      implementation, with one checkbox per reviewed file.
- [x] For package review mode, every package file row is either checked at
      score `100` with evidence or left unchecked with deferral reason, owner,
      proof needed, and next action for user review.
- [x] For package review mode, no next package is started before the current
      package checklist closes or the user explicitly redirects.
- [x] For Core-adjacent package review, `tooling/scripts/check-core.mjs` is
      updated to include the package, or the plan records why the package is
      product-only and outside `check:core`.
- [x] Direct one-shot API audit closed: single-operation
      `editor.update((tx) => tx.*)` and single-read
      `editor.read((state) => state.*)` wrappers are replaced with direct
      methods when available, or each remaining callback is justified as grouped
      transaction/snapshot logic.
- [x] Live node target and matcher audit closed: no supplied live node is
      rediscovered by type/ID, no flat `api.findPath` / `api.some` alias remains
      in scope, equality-only callbacks use property matchers, and every
      remaining predicate has computed/path/truthiness/narrowing semantics.
- [x] Optional public-read audit closed: feature-package production code does
      not use `{ required: true }` or non-null assertions to hide unresolved
      Plite reads; each match handles `undefined` or records a Plite-internal
      invariant reason.
- [x] Explicit normalization audit closed: every `tx.normalize(...)` and
      `editor.update.normalize(...)` match in scope has a ledger verdict;
      feature production calls have a named full-root semantic invariant or are
      cut/moved to the Plite owner; explicit normalizer tests remain test-only
      evidence rather than production precedent.
- [x] Plugin export inference audit closed: plugin export annotations/casts
      such as `: BasePlugin<Config>`, `: PlatePlugin<Config>`, and
      `as BasePlugin<Config>` are removed when inference should own the result,
      or each remaining annotation is justified as a real external boundary.
- [x] Empty config inference audit closed: `PluginConfig<'key'>` aliases and
      `createBasePlugin<Config>` generics are removed when the config has no
      typed options, API, tx, selectors, state, or external public contract.
- [x] Plugin extension options audit closed: plugin-owned extension options are
      returned directly from `extendExtension`; `defineEditorExtension` remains
      only for standalone Plite extensions, existing built extensions, or
      explicit non-plugin extension identities.
- [x] Bridge scoring law applied: forbidden bridges score `0`, direct bridge
      imports/installers are capped, displaced owner files are capped, and no
      capped file is raised to 100 from green checks alone.
- [x] Review matrix is filled for every inspected file/API/helper.
- [x] Public API forks are routed to `plate-plan` before implementation.
- [x] Review-mode rename freeze applied: Added/Deleted rename noise is either
      restored to current `HEAD` names or mapped in `docs/plans/pre-renaming.md`
      with an explicit reason it cannot be restored in this packet.
- [x] Extracted-file recovery gate closed: every untracked/extracted file in
      scope has an inventory row and bucket, with `origin/main` owner checked
      before keeping any new path/name.
- [x] Safe cleanup packets are kept, reverted, or quarantined with proof.
- [x] Focused package proof is run after meaningful code changes.
- [x] `pnpm brl` is run when exports/barrels change.
- [x] Old compatibility names are source-audited when cut.
- [x] Changed list, top drift rows, needs-attention rows, and next owner are
      filled before final response.
- [x] Output budget discipline followed.

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Named verification threshold | yes | Prove inferred portal call and behavior | Zero dirty cast matches; 93 tests and 12 typecheck tasks pass |
| Broad Core drift ledger coverage | no | Record N/A | Named media file/API packet |
| Score gate | yes | Fix or own every in-scope drift row | All reviewed rows score 0 after repair |
| Best Plate v2 recommendation | yes | Record preferred shape and rejected hacks | Named media config through the existing scoped plugin portal |
| Plite/Plate gap ledger | yes | Name blocker or N/A | N/A: existing Plate portal carries the type correctly |
| Related scoped sweep after correction | yes | Audit same-class media source | One dirty cast match, one patched, zero deferred |
| Package file checklist | no | Record N/A | Package-review mode was not active |
| Package/API proof | yes | Run focused tests and typecheck | Media 93/93 tests; Turbo 12/12 tasks |
| Shared Core gate coverage | no | Record N/A | No Core source or public Core contract changed |
| Non-Core package error triage | no | Record N/A | Named package proof reported no external failure |
| Source audit | yes | Audit cast and portal patterns | No `as WithRequiredName`, `plugin(... as`, or generic `getOptions` cast remains in media |
| Rename ledger | no | Record N/A | No rename or move |
| Extracted-file inventory | yes | Classify every untracked in-scope file | One goal plan; zero untracked media source/spec/config files |
| Autoreview / review | yes | Run scoped review until clean | Codex autoreview clean, correctness 0.84 |
| Final lint/check | yes | Run media lint and checks | Media lint clean; tests and typecheck pass |
| Changed list / top drift / needs attention | yes | Fill handoff ledgers | Completed below |
| Goal plan complete | yes | Run mechanical plan gate | `check-complete.mjs` exits 0 |

Review matrix:
| Path / API | Drift score | Verdict | Owner | Evidence | Next |
|------------|-------------|---------|-------|----------|------|
| `submitFloatingMedia.ts` plugin options | 0 | main-parity-cleanup | floating-media helper | Direct `editor.plugin(plugin).getOptions()` infers media options | keep |
| `FloatingMediaUrlInput.tsx` plugin prop | 0 | main-parity-cleanup | floating-media component | Carries `WithRequiredName<MediaPluginConfig>` to the helper | keep |
| `lib/media/types.ts` | 0 | keep-in-plate | media public config | Named config composes existing options with `PluginConfig` | keep |
| media changeset | 0 | keep-in-plate | `@platejs/media` release entry | Describes exported config from `origin/main` | keep |

Best Plate v2 recommendation:
| Target | Recommended shape | Rejected legacy/hack alternatives | Reason | User-review need |
|--------|-------------------|-----------------------------------|--------|------------------|
| Generic floating-media option lookup | Carry `MediaPluginConfig` through `WithRequiredName`, then use the scoped portal directly | Local cast, `any`, key-only generic lookup, concrete image/embed union, or Core redesign | Existing portal already infers correctly when the boundary preserves its config | none |

Plite / Plate gap ledger:
| Gap type | Missing capability | Why local workaround is a hack | Smallest owner | Proof needed | Decision |
|----------|--------------------|-------------------------------|----------------|--------------|----------|
| N/A | No capability missing | The cast came from erasing the config at the media prop boundary | media config and floating component | Package typecheck | repaired locally |

Related scoped sweep ledger:
| Trigger correction | Active scope | Sweep query / method | Matches | Patched | Deferred | Remaining risk |
|--------------------|--------------|----------------------|---------|---------|----------|----------------|
| Remove floating-media plugin cast | `packages/media/src` | `as WithRequiredName`, `plugin(... as`, `getOptions<PluginConfig`, and typed portal inventory | 1 | 1 | 0 | none |

Core drift ledger:
- Applies: no; no Core edit.
- Manifest command: N/A.
- Manifest owner: N/A.
- Optional type-test owner: N/A.
- Ledger location: N/A.
- Expected row count: 0.
- Actual row count: 0.
- Missing row count: 0.
- Extra row count: 0.
- Score gate: N/A.
- Top drift rows: none.

Core file drift rows:
| Path | Drift score | Verdict | Owner | Evidence | Next |
|------|-------------|---------|-------|----------|------|
| N/A | 0 | not in scope | N/A | Existing portal contract was sufficient | none |

Package file checklist:
- Applies: no; named file/API mode.
- Package: `@platejs/media`.
- Manifest command: N/A.
- Expected row count: 0.
- Actual row count: 0.
- Checked score-100 count: 0.
- Unchecked/deferred count: 0.
- Missing row count: 0.
- Extra row count: 0.
- Score gate: N/A.
- Next package blocked until: N/A.

Package file rows:
- [x] N/A — package-review mode was not active.

Packet ledger:
| Packet | Owner | Hypothesis / smell | Files / commands | Decision | Next |
|--------|-------|--------------------|------------------|----------|------|
| Floating media option inference | `@platejs/media` | Untyped `WithRequiredName` erased the option config and forced a cast | three media source files, media tests/typecheck/lint | preserve config at the prop boundary | keep |

Extracted file ledger:
| Path | Bucket | Origin/main owner check | Decision | Proof |
|------|--------|-------------------------|----------|-------|
| `docs/plans/2026-07-14-plate-next-floating-media-option-typing.md` | justify-new-proof-tooling | No existing plan owns this packet | keep | Required autogoal ledger |

Out-of-scope package drift:
| Package / command | Error summary | Why not blocking this run | Owner / next |
|-------------------|---------------|---------------------------|--------------|
| none | none | All named proof passed | none |

Out-of-scope matches discovered:
| Pattern / API | Outside-scope owners | Why not patched now | Next package / owner |
|---------------|----------------------|---------------------|----------------------|
| none | none | Package-local same-class sweep was clean | none |

Changed list:
| Group | Current-run changes |
|-------|---------------------|
| code/runtime/API | Added `MediaPluginConfig`; carried it through floating-media props; removed the cast and private URL-validator alias |
| tests/proof | No new test needed; existing submit behavior suite compiles the type and covers transform, validation, normalization, and rejection |
| docs/templates/skills | Updated existing media major changeset and added this plan |
| reverted/quarantined packets | No Core type change attempted; existing portal proved sufficient |

Needs your attention:
| Rank | Item | Why | Anchor | Recommendation |
|------|------|-----|--------|----------------|
| none | none | The scoped class is closed | N/A | continue with the prior next package queue |

Findings:
- The portal was not broken. The floating-media prop erased its config by using
  bare `WithRequiredName`, forcing the submit helper to reconstruct it with a
  cast.
- `WithRequiredName<MediaPluginConfig>` preserves the expected options through
  the existing portal while still supporting installed plugin-key objects.
- All other media option reads already infer through concrete plugin objects or
  extension contexts.

Decisions and tradeoffs:
- Add the named media config at the product owner rather than changing Core.
- Keep the generic floating control decoupled from concrete image/embed plugin
  constants.
- Do not use a key-plus-generic portal lookup: it would move the assertion
  rather than preserve inference.
- Browser proof is N/A because runtime behavior is headless and fully covered by
  the package submit tests.
- `pnpm brl` is N/A because an already-exported wildcard types file changed;
  no exported file or barrel layout changed.

Review fixes:
- Scoped autoreview found no accepted or actionable issue.

Error attempts:
| Error / failed attempt | Count | Next different move | Resolution |
|------------------------|-------|---------------------|------------|
| none | 0 | N/A | First clean typed-boundary implementation passed |

Verification evidence:
- `pnpm --filter @platejs/media test -- src/react/media/FloatingMedia/submitFloatingMedia.spec.ts` -> 93 pass, 0 fail; package runner executes all media specs.
- `pnpm turbo typecheck --filter=./packages/media` -> 12 successful tasks, 0 failed.
- `pnpm --filter @platejs/media lint:fix` -> 104 files checked, no final fixes.
- Scoped source audit -> one initial dirty cast, one patched, zero remaining or deferred.
- Untracked inventory -> one goal plan, no media source/spec/config files.
- Autoreview command with exact four-file scope -> clean, correctness 0.84.

Final handoff contract:
- target surface and mode: named floating-media file/API packet.
- files/APIs reviewed: media options config, floating URL input prop, submit
  helper, and media release entry.
- broad Core drift score coverage: N/A.
- package file checklist coverage: N/A.
- best Plate v2 recommendation: preserve the config at the typed plugin prop
  boundary and use the scoped portal directly.
- verdict matrix summary: three source rows and one release row clean.
- Plite/Plate gaps or blockers: none.
- related scoped sweep: media source, one match, one patched, zero deferred.
- out-of-scope matches discovered: none.
- changes made: named config, inferred portal call, clean default URL validator,
  typed prop chain, and changeset entry.
- tests/proof commands: media tests, typecheck, lint, source audit, autoreview.
- old compatibility names audited: dirty plugin-option casts absent.
- needs attention: none.
- next best Plate Next packet: return to the prior package queue; this media
  typing class is closed.

Phase / pass table:
| Phase | Status | Evidence |
|-------|--------|----------|
| Source and owner diagnosis | complete | Config erasure identified at media prop boundary |
| Typed repair | complete | Direct portal call compiles without casts |
| Same-class sweep | complete | One match patched, zero remaining |
| Package proof | complete | 93 tests and 12 typecheck tasks pass |
| Review and closure | complete | Autoreview clean; mechanical goal gate passes |

Reboot status:
| Question | Answer |
|----------|--------|
| Where am I? | Final closure |
| Where am I going? | Goal completion |
| What is the goal? | Remove floating-media option typing sludge without a cast or Core workaround |
| What have I learned? | The existing portal was sound; the media prop erased its config |
| What have I done? | Repaired the boundary, swept media, proved behavior/types, and reviewed the diff |

Timeline:
- 2026-07-14: Goal and plan created; Plate Next sources read.
- 2026-07-14: Config erasure diagnosed and repaired at the media owner.
- 2026-07-14: Media tests, typecheck, lint, source audit, and autoreview passed.
- 2026-07-14: Mechanical goal-plan gate passed.

Open risks:
- None.
