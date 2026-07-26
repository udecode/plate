# Unified plugin extend hard cut

Objective:

Ship one inference-preserving plugin authoring verb, `.extend()`,
across Core, packages, apps, registries, tests, docs, and agent doctrine.

Flow mode: one-shot execution.

Goal plan: `docs/plans/2026-07-25-unified-plugin-extend-hard-cut.md`.

Primary template: `docs/plans/templates/major-task.md`, materialized after the
accepted API decision because implementation had already started.

Applied packs:

- `docs`
- `package-api`
- `agent-native`
- `browser`

Completion threshold:

- Every binary gate below is proven, every required checklist row is complete
  or has an evidence-backed N/A reason, no in-scope deleted-name or direct
  `render.node` authoring reference remains, and the autogoal completion
  checker passes.

Verification surface:

- Core contract emit, source and test typechecks, focused Core runtime tests,
  affected package tests/typechecks, www docs/typecheck/build, source audits,
  Browser route proof, agent-native review, and final autoreview.

Constraints:

- Preserve unrelated dirty work and runtime behavior.
- No compatibility aliases, callback annotations, casts, `any`, `satisfies`
  patches, or ferry types used to recover inference.
- Do not edit CI-owned `templates/**` or generated `public/r/**`.
- Do not commit, push, open a PR, or message other Codex tasks.

Boundaries:

- In scope: Core public/runtime types, non-template package/app/test consumers,
  current docs, changesets, Vision, source rules, and regenerated skill mirrors.
- Out of scope: historical release evidence, completed plans/artifacts, template
  regeneration, and unrelated Plite/schema/history work.

Output budget strategy:

- Count and group broad audits before printing matches; exclude generated,
  historical, dependency, build, and template trees; cap source reads and test
  output; use exact package/file gates instead of unbounded root output.

Blocked condition:

- Stop only if exact contextual inference cannot be expressed without a cast or
  compatibility bridge, or if an owning package/browser surface remains broken
  after three distinct source-backed repair attempts.

## Accepted target

- `createBasePlugin()` / `createPlatePlugin()` own identity, schema,
  dependencies, and default options.
- Repeated `.extend()` calls own every type-widening author contribution.
- Prefer one `.extend()` per plugin: merge every independent contribution into
  one object or callback. Repeat it only when a later contribution needs types
  introduced by an earlier stage.
- Plugin-scoped `api`, `read`, `selectors`, and `update` contributions compile
  from fields returned by `.extend()`.
- True editor-wide API, read, update, state, command, middleware, and
  normalizer contributions compile from `.extend({ extension })`.
- Reusable extracted editor-extension factories use the context-bound
  `defineEditorExtension` identity helper to recover the same exact contextual
  typing as an inline `extension` object. It is an inference anchor, not a
  second plugin authoring verb.
- Codec contributions compile from `.extend(({ defineCodecs }) => ({
  codecs: defineCodecs(map) }))`. The context-bound helper is the sole inline
  inference anchor; self/product maps take one argument, foreign maps use
  `defineCodecs(TargetPlugin, map)` and the helper injects the target.
- `codecs['text/html']` accepts one rule or a non-empty ordered rule tuple so a
  plugin with multiple HTML match rules still needs only one authoring stage.
- `.withComponent()` is the ordinary component-binding path. Registry and docs
  code do not author `render.node` directly.
- `.configure()` is the single terminal consumer override and never widens.
- Hard-delete `.extendApi()`, `.extendEditorApi()`, `.extendSelectors()`,
  `.extendTx()`, `.extendTxGroup()`, `.extendExtension()`, `.extendCodecs()`,
  and `.extendHtmlCodec()`. No aliases, shims, deprecated declarations, or
  migration bridges survive.

## Scope

- Core runtime, public types, Base/Plate conversion, compile-only contracts,
  runtime tests, and declaration emit.
- Every non-template production/test consumer under `packages/**`, `apps/**`,
  `content/**`, `docs/**`, and tooling.
- Current public docs in English and Chinese, examples, changesets, Vision,
  source agent rules, and regenerated skill mirrors.
- A major `@platejs/core` changeset, plus package changesets only where the
  final delta from `origin/main` is independently published and user-visible.

## Non-goals and boundaries

- Preserve unrelated dirty work, especially Media HTML codec safety changes,
  Plite/schema/history work, and CI-controlled `templates/**`.
- Do not change runtime behavior, serialized output, plugin ownership, or
  package topology except where the accepted authoring API requires it.
- Do not add callback annotations, casts, `any`, `satisfies` patches, config
  ferry types, or compatibility wrappers to recover inference.
- Do not commit, push, open a PR, or message other Codex tasks.

## Binary gates

- Core `.extend()` widens options, plugin API, read/state, own update, named
  editor extension groups, selectors, dependencies carried through, schema
  carried through once, codecs, Base-to-Plate conversion, portals/root
  projection, repeated stages, terminal configuration, and declaration emit.
- Negative type proof rejects unknown fields/groups, schema replacement,
  renderer component binding through ordinary config, post-configuration
  authoring, and read/update leakage onto the wrong surface.
- Zero surviving public declarations, implementations, calls, current docs,
  comments, strings, or tests for the eight deleted methods outside current
  migration changesets, completed historical plans/artifacts that must preserve
  exact evidence, and the two permanent hard-cut checker fixture files that
  must name the rejected syntax. Record every excluded path in the final sweep.
- Zero ordinary registry/docs component bindings through `render.node`; runtime
  reads and the internal `withComponent()` write remain valid.
- Core/package/www/docs typechecks and focused behavior suites pass.
- `pnpm install` regenerates agent mirrors from `.agents/rules/**`.
- Scoped lint, `git diff --check`, docs build/check, browser route proof, agent
  native review, and final autoreview pass.

## Execution order

1. Freeze the exhaustive source/docs/type/proof manifest.
2. Implement and prove Core before consumer edits.
3. Migrate production packages and app/registry consumers.
4. Migrate tests, type tests, docs, changesets, Vision, and source rules.
5. Regenerate mirrors, sweep deleted names and direct renderer bindings.
6. Run focused-to-broad proof and repair until clean.

## Risks

- Generic inference may carry rather than widen one accumulator, especially
  Plate conversion, repeated extension stages, foreign HTML targets, or named
  editor groups.
- Executing unified contributions at a different lifecycle stage may capture
  stale API/options or alter codec schema ownership.
- Mechanical component migration may accidentally place `.withComponent()`
  after terminal `.configure()`.

Rollback is the current working tree; no compatibility path is acceptable in
the shipped target.

## Start Gates

Start Gates:

| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | Accepted target, scope, non-goals, binary gates, execution order, and risks above |
| Active goal created | yes | Thread goal created for this exact hard cut |
| Source owners read | yes | Core plugin types/runtime, constructor/render consumers, docs/doctrine, changesets, and proof scripts audited |
| Best API target resolved | yes | User accepted one `.extend()` authoring verb plus `.withComponent()` and terminal `.configure()` |
| Hard-cut boundary resolved | yes | Eight deleted verbs named; no shims/deprecations/aliases |
| Docs pack selected | yes | Current EN/CN docs and source doctrine are in scope |
| Package/API pack selected | yes | Published Core API hard cut requires a major changeset |
| Agent-native pack selected | yes | `.agents/rules/**` and generated mirrors are in scope |
| Browser pack selected | yes | Package/app-facing authoring examples require a real demo route check |
| Workspace authority selected | yes | `/Users/zbeyens/git/plate-2` current checkout |
| Git publication expectation | no | User did not request add/commit/push/PR |
| Output budget recorded | yes | Scoped/count-first policy above |

## Work Checklist

Work Checklist:

- [x] Copy the accepted call shape, hard-cut list, colocation/order rules, scope
      boundaries, proof surfaces, and stop conditions into this plan.
- [x] Inventory all eight specialized methods across declarations, runtime,
      production consumers, tests, docs, comments, and release artifacts.
- [x] Inventory constructor behavior fields and ordinary direct `render.node`
      authoring.
- [x] Implement one Core `.extend()` compiler that preserves exact repeated
      stage, Base-to-Plate, dependency, schema, extension, codec, and foreign
      HTML target inference.
- [x] Type-reject constructor behavior fields and direct ordinary
      `render.node`; keep `.withComponent()` as the component binding path.
- [x] Delete the eight specialized public/runtime methods and obsolete types
      without aliases.
- [x] Migrate every non-template package, app, registry, example, benchmark,
      test, and type-test consumer.
- [x] Merge independent contributions into one `.extend()` per plugin; retain
      another stage only for an actual earlier-stage type dependency.
- [x] Rewrite current English/Chinese docs, changesets, Vision, research,
      solutions, and source agent doctrine to the sole final shape.
- [x] Regenerate source-owned skill mirrors with `pnpm install`.
- [x] Close every accepted type/runtime/docs/browser/review finding.

## Completion Gates

Completion Gates:

| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Core public/runtime hard cut | yes | Compile and runtime-prove the unified authoring path | Core typecheck/contracts/build pass; five focused files pass 132/132 |
| Deleted-name source audit | yes | Record every excluded historical/migration path and prove zero live references | 4,698-file permanent audit passes; remaining names are historical plans/artifacts, two checker fixtures, and the two exact foreign Zustand calls |
| Constructor shape audit | yes | Prove only static identity/schema/dependency/default fields remain in constructors | Permanent constructor gate passes across the live source audit |
| Component binding audit | yes | Prove zero ordinary direct `render.node` authoring outside internal runtime/historical exclusions | Permanent render gate passes; only Core implementation/negative fixtures and historical evidence remain |
| Package/API proof | yes | Run Core and affected package typechecks/tests | Rebuilt Core; 35/35 integrated tasks, List 51/51, and exact List declaration build pass |
| Declaration inference proof | yes | Run contract emit and type tests including foreign HTML target and repeated-stage inference | Core `typecheck:contracts` and publishable List declaration build pass without callback annotations or casts |
| Docs source-backed audit | yes | Run docs checker/build and verify examples against source | Plate 15/15 over 363 files, Plite 9/9, both audits, and www source parity pass |
| Published package changeset | yes | Major `@platejs/core` changeset; validate changeset status | `.changeset/unified-plugin-authoring.md`; Changesets status passes |
| Barrel generation | N/A | Run `pnpm brl` if public export topology changed; otherwise record N/A | No public file, folder, or barrel topology changed; existing module barrels already expose their owned declarations |
| Agent source/generated sync | yes | Run `pnpm install`, source-audit doctrine, and close agent-native review | Final `pnpm install` regenerated mirrors; Plate Next v7 validates with 7 current, 34 intentionally unattested packages, and no drift |
| Browser proof | yes | Exercise a representative standalone registry demo and check console/network | `/docs/html`, `/docs/plugin-methods`, `/docs/plugin`, and `/blocks/table-demo` rendered with no new console errors |
| Final lint/diff | yes | Run scoped lint/Biome and `git diff --check` | Biome passes 273 changed supported files; diff check passes |
| Autoreview | yes | Run final current-tree autoreview and close accepted findings | Codex `gpt-5.5` local autoreview: clean, zero accepted/actionable findings |
| Goal plan complete | yes | Run `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-07-25-unified-plugin-extend-hard-cut.md` | Autogoal completeness checker passes |

## Phase / pass table

Phase / pass table:

| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Intake and source map | complete | Frozen method/render/constructor/docs/proof manifests | Core compiler |
| Core compiler and contracts | complete | One compiler, eight methods deleted, contracts/build/runtime green | none |
| Consumer migration | complete | Live source audit passes across 4,698 files | none |
| Docs/release/doctrine | complete | Current docs, changeset, Vision, source rules, and generated mirrors use the final shape | none |
| Integrated verification | complete | 35/35 graph, declaration emit, docs, browser, checker, and formatting green | none |
| Closeout | complete | Autoreview clean; goal checker is the final command | final response |

## Findings

- The initial eight-method scan found 739 tokens across 141 files, including
  219 production and 362 test direct calls.
- Constructor auditing found 265 plugin literals with behavior outside static
  identity/schema/dependencies/default options; Core tests contain the largest
  share.
- Ordinary `render.node` authoring appears in package/app production and tests;
  resolved runtime storage remains internal.
- `BlockSelectionPlugin` requires active update context in unified
  `update: ({ tx, context }) => ...`.
- Independent contributions should be merged; mechanical one-field-per-extend
  chains are rejected.
- The permanent AST gate accepts exactly eight production multi-stage owners:
  Placeholder, List, Blockquote, Comment, Code Block, Indent, Suggestion, and
  Table. It rejects path or stage-field drift and excludes tests, type tests,
  historical evidence, and generated output.
- BlockSelection, BlockMenu, CursorOverlay, BlockPlaceholder, and the Core
  foreign codec probe had complete contracts or independent contributions;
  their chains were mergeable rather than genuine type staging. Package owners
  and the Core probe are collapsed.

## Decisions and tradeoffs

- One `.extend()` compiler wins over specialized verbs: fewer concepts and one
  inference path. Risk is concentrated generic complexity, paid once in Core.
- One `.extend()` per plugin is the default. Repetition is reserved for
  dependent type staging, not visual grouping.
- HTML and product codecs share the `codecs` field; overloads must retain exact
  foreign-target contextual typing without casts.
- TypeScript cannot contextually type the nested self/foreign/create-element
  callback union from `.extend()` overloads alone. `defineCodecs` anchors that
  inference at the MIME map without adding another plugin authoring verb.
- Contextual typing also cannot flow backward from `.extend({ extension })`
  through an extracted shared factory. `defineEditorExtension` anchors that
  reusable factory without a broad return annotation, ferry type, cast, or
  duplicated implementation.
- Repeated HTML rules are represented as one ordered tuple, not repeated
  `.extend()` calls. Foreign tuples must retain one exact target contract rather
  than widen callbacks across heterogeneous targets.
- `.withComponent()` stays as a narrow non-widening convenience because direct
  component registry authoring through `render.node` is too easy to misuse.

## Review fixes

- User rejected mechanical multiple `.extend()` chains. All migration lanes
  were redirected to merge independent contributions and doctrine now states
  that default.
- DOM's `dom.autoScroll` group matches its owning plugin key, so it moved from
  editor-wide `extension.tx.dom` to plugin-owned `update`; only the genuinely
  root `extension.api.dom` contribution remains.

## Error attempts

| Error / failed attempt | Count | Next different move | Resolution |
| --- | ---: | --- | --- |
| TypeScript 7 root compiler API lacked parser exports for constructor audit | 1 | Use Babel parser with per-file recovery | Audit works; seven Plite syntax files are skipped and contain no plugin constructors |
| Baseline BlockSelection focused test exposed staging gap (`api.deselect`) | 1 | Make earlier-stage plugin API visible to later unified update contribution | Selection chain collapsed under its declared full contract; focused selection family passes 22/22 |
| One codec union and hidden `.extend()` overload ordering each left one nested callback family untyped | 2 | Move schema/target discrimination to one context-bound `defineCodecs` value helper | Self, product, foreign, tuple, creates-element, and mixed Paragraph source probes pass without annotations/casts |
| Removing the broad `PlateEditorExtension<C>` return annotation from shared `withTriggerCombobox` made nested command/input/state/tx parameters implicit `any` | 1 | Add a context-bound `defineEditorExtension` identity helper and use it inside the extracted factory | Core extracted-helper contracts and Combobox/Mention/Slash/Emoji/Footnote typechecks pass |
| Generic `defineMediaPlugin<C>` callback with an explicit `update` contract and `transformInitialValue` passes direct inference but fails declaration emit overload selection | 1 | Make authored `update` return exactly `TUpdate` instead of intersecting generic existing tx; keep one merged stage and exact contract | Core source/build and Media declaration build pass |
| Final docs rerun first used a guessed generated-skill script path that does not exist | 1 | Resolve the repository-owned tooling scripts by filename | Correct Plate docs tests/audit and Plite docs tests/audit pass |
| Full non-truncated AI diagnostic expanded dependency types to 99k characters | 1 | Use one representative contract/source shape and focused follow-up diagnostics | Root cause isolated to explicit-contract calls defaulting undeclared extension inference to `{}` |
| Broad Core test typecheck output was streamed twice while the generic was mid-edit | 2 | Stop broad output; use source-only and named package gates until Core checkpoint | Output discipline restored |
| Static root extension API and update shortcuts initially lacked ownership metadata | 1 | Compile root extension methods into the same shortcut publication map | `/docs/html` and focused shortcut contracts pass |
| A staged plugin API callback captured the pre-publication empty facade | 1 | Keep plugin API access lazy through the compiled candidate | Repeated-stage API contracts and consumers pass |
| Nested root API objects remained mutable after publication | 1 | Snapshot API values recursively at publication | Runtime immutability contracts pass |
| Concurrent List work restored six mechanical `.extend()` stages | 1 | Re-read live source and enforce the exact owner-stage checker | List is three stages: base behavior, dependent update, dependent extension |
| Raw codec objects could spoof the helper-only field structurally | 1 | Brand context-created codec maps with a private symbol and reject raw maps at resolution | Negative contracts and 39/39 HTML codec tests pass |
| Published List declaration emit lost callback inference with 17 errors | 1 | Preserve dependency config witnesses in Core and reconstruct descriptor references | Core rebuild plus exact List build passes repeatedly |
| Migrated Core runtime tests re-resolved runtime output and expected callback codecs before context | 1 | Test author descriptors at editor resolution and keep editor-wide extension groups globally unique | Five focused Core files pass 132/132 |
| Changed-file Biome found two dependency witness formatting drifts | 1 | Format the two Core type owners, rebuild Core, and rerun every consumer gate | Biome passes 273 files; rebuilt 35/35 graph and List emit pass |
| Next production build stopped during unrelated `/blocks/editor-select` static generation | 1 | Preserve the successful compile evidence and classify the foreign schema-data failure | Build compiled; unrelated unknown `url` property on `tag` remains outside this API hard cut |
| Full `pnpm lint:fix` reached unrelated shared Yjs and Wordgard WIP failures | 1 | Run the exact changed-file Biome gate and do not rewrite foreign work | Scoped Biome and diff check pass |

## Verification evidence

Verification evidence:

- Pre-change Core source typecheck, Core test typecheck, contract emit, type
  tests, and focused Core runtime suite passed.
- Pre-change focused selection suite: 3 passed, 1 failed at
  `api.deselect is not a function`; this is an explicit regression gate.
- Changeset/Vision/research lane: scoped stale-name/render audit,
  `git diff --check`, and `pnpm exec changeset status --since origin/main`
  passed before integrated source migration completed.
- Final-shape release prose uses `defineCodecs(...)`, the one-stage default,
  `.withComponent()`, and the unified `extension` field. `pnpm exec changeset
  status --since origin/main` passes after that repair.
- `withTriggerCombobox` uses context-bound `defineEditorExtension` with no
  return annotation, cast, or ferry type. Combobox, Mention, Slash Command,
  Emoji, and Footnote source typechecks pass.
- The one-stage Selection family passes 22/22; BlockPlaceholder passes 10/10.
- The permanent AST multi-stage checker initially passed 19/19 contracts while
  identifying the final mergeable Core foreign codec probe; that probe is now
  collapsed.
- `pnpm install` regenerated source-owned agent mirrors. Plate Next v7 validates
  at fingerprint
  `sha256:64da9bcb05cac856789d68e4d6711515954e8bec9d65361b4c857ad660a9e727`;
  Plate docs contracts pass 15/15 over 363 current files and Plite docs
  contracts pass 9/9.
- Core's exact contextual overload plus portable built-extension overload
  preserves inline inference while allowing explicit contracts to carry
  prebuilt Plite state/effect extensions. The portable path accumulates only
  declared contract fields. Core source/test/contracts/build pass.
- Core package proof passes in full: typecheck (including test and declaration
  contracts), runtime test suite, build, Biome over 387 files, and scoped diff
  check. Runtime authoring-helper factories and the codec brand live in the
  private non-barreled `pluginAuthoringContext.ts`; public declarations expose
  only the two callback-context helper types.
- The permanent checker passes 20/20 unit contracts and the global 4,702-file
  adoption audit passes. Its only raw-codec exceptions are two exact,
  marker-bound negative Core contracts; path, marker, or count drift fails.
- Final source count is 4,698 after concurrent file moves/deletions. The same
  checker passes 20/20 and excludes only CI-generated registry/template roots.
- Final Core proof after the last source formatting pass: Core build,
  typecheck/test/contracts, five focused runtime files 132/132, exact List
  declaration build, List 51/51, and the 35/35 affected graph all pass.
- Current docs proof: Plate contracts 15/15 over 363 files, Plite contracts
  9/9, both live audits, and `www` docs source parity pass.
- Final `pnpm install` regenerated rule mirrors. Plate Next v7 registry
  validates: seven attested packages current, zero drifted, 34 intentionally
  unattested packages, and one retired package.
- Browser proof covered `/docs/html`, `/docs/plugin-methods`, `/docs/plugin`,
  and `/blocks/table-demo`; authoring examples and table runtime rendered with
  no new console errors.
- Changed-file Biome passes 273 supported files, Changesets status and
  `git diff --check` pass, and Codex `gpt-5.5` autoreview reports no accepted or
  actionable findings.

## Agent-native capability map

| Capability | Human path | Agent path | Failure/proof path |
| --- | --- | --- | --- |
| Author a plugin | Current plugin docs and package owners | `best-api`, `plate-plugin-creator`, and `plate-next` generated skills | Core type contracts plus the permanent source checker |
| Choose contribution ownership | One merged `.extend()` by default; repeat only for inferred dependency | Source doctrine encodes the same one-stage rule | Exact multi-stage owner allowlist rejects drift |
| Bind components | `.withComponent()` | Plugin creator and Plate Next rules | Direct `render.node` source gate |
| Author codecs | Context `defineCodecs` helper | Best API and plugin creator examples | Private brand, runtime rejection, and HTML codec suite |
| Override consumers | Terminal `.configure()` | Current docs and generated skills | Post-configuration authoring rejection contracts |

## Timeline

- 2026-07-25: accepted one widening authoring verb and hard-cut scope recorded.
- 2026-07-25: exhaustive method, constructor, render binding, docs, changeset,
  and proof manifests frozen.
- 2026-07-25: Core, packages, apps, docs/doctrine, and release work split into
  non-overlapping source lanes.
- 2026-07-25: user corrected over-splitting; default one merged `.extend()` was
  propagated to every lane and this plan.

## Reboot status

Reboot status:

| Question | Answer |
| --- | --- |
| Where am I? | Closeout complete |
| Where am I going? | Final goal checker and handoff |
| What is the goal? | Sole inference-preserving `.extend()` authoring path, with specialized verbs and direct node binding hard-cut |
| What have I learned? | Constructor behavior and over-split contributions were larger problems than the eight visible methods alone |
| What have I done? | Shipped the hard cut across Core, consumers, docs, doctrine, proof, browser, and review |

## Open risks

Open risks:

- None. Same-stage extension and codec inference is covered by compile-only contracts,
  exact package declaration emit, and runtime suites.
- Negative Core assertions remain hard failures for unknown fields, schema
  replacement, raw codecs, renderer binding, and post-configuration authoring.
- Shared WIP was preserved; scoped proof and review found no accepted overlap
  regression.
