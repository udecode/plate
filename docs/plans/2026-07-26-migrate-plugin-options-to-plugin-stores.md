# Migrate plugin options to plugin stores

Objective:
Hard-cut Plate plugin options into `initialState` plus one mutable per-editor
plugin `store` across core, packages, registry, docs, tooling, and changesets.

Flow mode:
one-shot execution

Goal plan:
docs/plans/2026-07-26-migrate-plugin-options-to-plugin-stores.md

Completion threshold:
- Zero current production, test, registry, docs, tooling-consumer, or release
  callers of declaration `options`, `getOption`, `getOptions`, `setOption`,
  `setOptions`, `usePluginOption`, `usePluginOptions`, or
  `PluginOptionsStore`.
- Plugin selectors are pure state-first functions inferred from
  `initialState`; consumers pass only selector arguments.
- Core runtime, type inference, packages, registry, docs, changesets, exports,
  embedded release consumers, and generated barrels use one accepted API with
  no aliases or dual signatures.
- Focused runtime/type proof, every affected Plate package typecheck/test,
  direct app checks, scoped lint, applicable browser attempts, review, and the
  final goal checker are resolved.

Verification surface:
- Core store lifecycle, same-plugin cross-editor isolation, frozen snapshots,
  partial and draft updates, named selectors, selector snapshot correctness,
  unknown-key errors, and builder inference.
- All 30 affected Plate package typecheck and test tasks.
- App docs parity, registry-source, primary TypeScript, and package-integration
  checks.
- Syntax-aware plugin declaration audit over source and current docs code
  fences, plus stale-symbol and terminology audits.
- Packed release consumers under NodeNext, Bundler, Node runtime, and DCE.
- Registry changelog generation, barrels, scoped Biome, Browser route attempt,
  and final manual review.

Constraints:
- Exactly one mutable plugin-state channel.
- No immutable configuration channel, public/private store projections,
  signal-per-field APIs, automatic computed graph, selector chaining, aliases,
  or dual APIs.
- `_` is a convention only.
- Preserve unrelated operation and function parameters named `options`.
- Preserve unrelated shared WIP; no destructive git operations, commits,
  pushes, worktrees, or branch changes.
- Current-state docs teach only the final API. Changesets may show an explicit
  before/after migration example.

Boundaries:
- In scope: Plate core plugin declarations, compiler, runtime, React hooks,
  dependent Plate packages, registry/app callers, docs, changesets, release
  fixtures, exports, barrels, and migration-owned scanners.
- Source owners: `packages/core`, dependent `packages/**`,
  `apps/www/src/registry`, `content`, `tooling`, and `.changeset`.
- Non-goals: generic operation options, Plite extension `options`, a new
  immutable configuration owner, and arbitrary editor/document reads inside
  plugin-store selectors.
- Plite remains unchanged by this Plate plugin-state API break.

Blocked condition:
Only block if sound TypeScript inference cannot express the accepted API, or a
required runtime gate has no narrower owner-level proof after three distinct
attempts. Environment-only Browser, reviewer-engine, or Bun source-alias
failures are resolved through recorded attempts plus direct package/app proof.

Plate Plan state:
- status: complete
- phase: verified-handoff
- next: user review or commit on request
- handoff: prepared

Start Gates:
| Gate | Applies | Evidence |
| --- | --- | --- |
| Prompt requirements captured | yes | One store, `initialState`, pure selectors, full docs/registry/tooling sweep, and no aliases are recorded |
| Active goal and plan verified | yes | Active goal names this plan and its measurable stale/proof threshold |
| Current owners read | yes | Core config, builders, resolver, publication, store owner, portal, hooks, package consumers, docs, changesets, and release fixtures were inspected |
| Public API resolved | yes | Accepted `best-api` target is one mutable store with state-first selectors |
| Execution authority resolved | yes | User explicitly requested full migration including docs |

Work Checklist:
- [x] Capture outcome, scope, exclusions, owners, and proof requirements.
- [x] Replace declaration `options` with `initialState`.
- [x] Replace option helpers with `editor.plugin(Plugin).store`.
- [x] Replace option hooks with `usePluginStore` and
  `useEditorPluginStore`.
- [x] Make named selectors pure state-first functions and execute the supplied
  subscription snapshot.
- [x] Preserve per-editor WeakMap lifecycle and descriptor snapshot ownership.
- [x] Add same-plugin cross-editor isolation and selector snapshot proof.
- [x] Migrate every affected Plate package.
- [x] Migrate registry, app, tests, docs, Chinese docs, changesets, tooling
  scanners, and embedded packed-release consumers.
- [x] Delete old files, exports, helper types, selector projection machinery,
  and dead `optionReferences` plumbing.
- [x] Run stale API, public type-name, terminology, and syntax-aware audits.
- [x] Run package/app typechecks, tests, docs contracts, release artifacts,
  barrels, registry changelog verification, and scoped lint.
- [x] Attempt Browser and automated reviewer proof; record environment-owned
  limits and complete manual review.
- [x] Prepare the final evidence-backed handoff.

Completion Gates:
| Gate | Applies | Required action | Evidence |
| --- | --- | --- | --- |
| Binary readiness | yes | Resolve implementation, adoption, deletion, and review rows | All slices complete; no accepted finding remains |
| Fresh source evidence | yes | Recheck final APIs and declarations | Stale-symbol, public type-name, terminology, selector-factory, and 5,315-file syntax audits are clean |
| Public API review | yes | Preserve one-store target without extra machinery | Final API exposes only `initialState`, `.store`, and two editor-scope hook variants |
| Adoption | yes | Complete package, app, registry, docs, tooling, and release adoption | 30 package typechecks/tests, direct www checks, docs contracts, registry source, and packed consumers pass |
| Verification | yes | Record exact commands and results | Verification evidence below records current results and environment-owned exceptions |
| Handoff | yes | Summarize breaks, proof, and residual risk | Final handoff section is complete |
| Autoreview | yes | Review complete migration and repair accepted findings | Manual diff/source review completed; Codex app-server was sandbox-denied twice and Claude lacked auth after the third engine attempt |
| Goal plan | yes | Run final checker | Checker command is the final command after this ledger update |

Phase / pass table:
| Phase | Status | Evidence | Next |
| --- | --- | --- | --- |
| Ground and lock target | complete | Accepted API and owner/deletion ledger | Core runtime |
| Core runtime and types | complete | Store owner, portal, hooks, builders, inference, lifecycle tests | Package adoption |
| Package and registry adoption | complete | All package, registry, and app callers migrated | Docs and release |
| Docs, changesets, tooling, exports | complete | Current docs, Chinese docs, release notes, scanners, fixtures, and barrels migrated | Proof |
| Proof, review, closure | complete | Package/app/tooling/artifact proof and manual review recorded | Handoff |

Decision brief:
- outcome: one obvious reactive plugin-state API from declaration through
  imperative and React consumers.
- chosen shape: `initialState`; `editor.plugin(P).store.get/set/subscribe`;
  `usePluginStore`; pure state-first named selectors.
- rejected alternative: immutable `options` plus mutable `store`, which creates
  two owners and forces artificial classification.
- consequence: an intentional major break with less API and no compatibility
  layer.

Final public API:

```ts
const CounterPlugin = createPlatePlugin({
  initialState: { count: 0 },
  key: 'counter',
  selectors: {
    doubled: (state, factor: number) => state.count * factor,
  },
});

const counter = editor.plugin(CounterPlugin).store;

counter.get('count');
counter.get('doubled', 2);
counter.set({ count: 1 });
counter.set((draft) => {
  draft.count += 1;
});
counter.subscribe((state, previousState) => {});

const count = usePluginStore(CounterPlugin, 'count');
const doubled = usePluginStore(CounterPlugin, 'doubled', 2);
const pair = usePluginStore(
  CounterPlugin,
  (state) => [state.count, state.label] as const,
  { equalityFn: shallow }
);
const external = useEditorPluginStore(editor, CounterPlugin, 'count');
```

Decision ledger:
| Surface | Final owner | Final shape | Deletion | Proof |
| --- | --- | --- | --- | --- |
| Declaration | Plate plugin descriptor | `initialState` | `options`, option inference helpers | Builder contracts and syntax audit |
| Imperative state | Plugin portal | `.store.get/set/subscribe` | Four option methods and public option store | Runtime tests and package typechecks |
| React | Plate React store owner | Two editor-scope variants | Four option hook names and old file | Hook tests and app typecheck |
| Named selectors | Plugin declaration/store compiler | `(state, ...args) => result` | Selector factory/projection machinery | Snapshot regression test and source audit |
| Lifecycle | Resolver/store owner | Per-editor WeakMap store | Duplicate option-store owner name | Isolation and publication rollback tests |
| Teaching | Docs/registry/release owners | Store vocabulary and examples | Stale current-state API teaching | Docs contracts, parity, changelog check |
| Distribution | Release artifact checker | Dependencies plus `initialState` and live store | Embedded `.plugins` and `.options` fixture | Packed NodeNext/Bundler/runtime proof |

Proof matrix:
| Claim | Final evidence | Status |
| --- | --- | --- |
| Same plugin is isolated per editor | Explicit two-editor store regression | proven |
| Published state cannot alias caller-owned plain data | Frozen snapshot and listener regression | proven |
| Selectors use exact subscription snapshots | Named-selector hook regression sees both snapshots | proven |
| Builder chains preserve state/selector inference | Core type contracts and declaration consumers | proven |
| No second plugin API survives | Stale-symbol, type-name, terminology, and AST audits | proven |
| All consumers adopt | 30 package checks plus direct app/registry/docs checks | proven |
| Release artifacts expose final types/runtime | 10 packages, 34 subpaths, two declaration modes, Node runtime, DCE | proven |
| Browser-rendered registry route | Three server bind attempts were denied by sandbox; source, app, and registry checks provide the available owner-level proof | environment-limited |

Findings:
- The previous Zustand store already had the right editor-owned lifecycle; its
  option vocabulary and selector projection API were the wrong public model.
- Named selector hooks previously ignored their supplied subscription snapshot
  and read live state. Pure state-first selectors remove that correctness bug.
- The root editor store remains `editor.store`; plugin state is only
  `editor.plugin(Plugin).store`.
- Dependency views intentionally preserve keys/capabilities rather than a
  dependency's full store-state type. The packed consumer now proves that
  decoupling.
- The release-artifact fixture hid old `.plugins` and `.options` calls inside
  generated source. Running the executable artifact gate found and repaired
  them.

Decisions and tradeoffs:
- Keep deep snapshot ownership for plain plugin-state graphs and nominal plugin
  references. This predates the rename and prevents seed-object aliasing.
- Keep non-plain host resources such as `Map`, `Set`, and controllers opaque;
  authors mutate observable state through `store.set`.
- Keep zero automatic computed dependencies. Reusable derived state is an
  ordinary pure selector.
- Keep cross-plugin document/editor reads in plugin `read` APIs, not store
  selectors.
- Keep `_` as an unenforced author convention.
- Keep the heterogeneous injected-plugin runtime internally erased. A generic
  restoration produced TS2589; the final boundary uses `AnyPluginConfig`
  instead of leaking an explicit `any`.

Review fixes:
- Deleted dead `optionReferences` WeakMap plumbing.
- Repaired one selector fixture that closed over its store instead of using the
  supplied state.
- Added same-plugin cross-editor isolation proof.
- Replaced stale public generic names and test vocabulary with store-state
  terminology.
- Repaired Chinese/English docs, incorrect API type unions, broken anchors, and
  five stale changeset examples.
- Repaired packed-release embedded source and its dependency-type assertions.
- Repaired two stale runtime error assertions and made errors name
  `` `initialState` `` precisely.
- Removed explicit `TransformOptions<any>` at the heterogeneous injection
  boundary while avoiding recursive generic instantiation.

Error attempts:
| Error / failed attempt | Count | Different move | Resolution |
| --- | ---: | --- | --- |
| Generic injected-plugin helper triggered TS2589 | 1 | Keep heterogeneous boundary erased with `AnyPluginConfig` | Core contracts pass |
| Combined `www` typecheck could not create a `tsx` IPC pipe | 1 | Run both scripts through `node --import tsx` and both `tsc` projects directly | All four direct checks pass |
| Registry Bun tests resolve unchanged Plate source barrels without named exports | 3 | Inspect unchanged owners, reinstall once, restore offline dependencies, and use registry-source/app typechecks | 11 tests pass; four source-alias rows remain harness-owned |
| Dev server bind denied on `0.0.0.0` and `127.0.0.1` | 3 | Try both hosts and Browser navigation | Browser records `ERR_CONNECTION_REFUSED`; direct app proof passes |
| Automated Codex autoreview app-server denied by sandbox | 2 | Retry with private writable `CODEX_HOME` | Same OS denial |
| Claude autoreview engine lacked authentication | 1 | Complete source/diff review manually | No accepted finding remains |
| Root/broad lint includes unrelated audit artifacts, read-only agent files, and an unrelated media-test unused constant | 2 | Lint migration-owned files only | Scoped Biome is clean |
| Offline reinstall prepare could not write the global temporary directory | 1 | Verify restored dependencies through exact checks | All required package commands execute |
| Schema adoption audit reports unrelated `ParagraphPluginBase` scaffolding | 1 | Preserve shared WIP and use target-specific docs/schema contracts | Migration-owned scanners and contracts pass |

Verification evidence:
- `bun test` over 23 changed Core contract files: 278 passed, 0 failed; the
  final store/hook pair passes 13 tests with 39 expectations.
- `pnpm turbo typecheck --filter=./packages/core`: 10 tasks passed, including
  test and declaration contracts.
- Full targeted `pnpm turbo typecheck` over 30 affected Plate packages:
  every package typecheck passed; 81 graph tasks completed before the `www`
  wrapper hit sandbox IPC.
- Direct `www` checks:
  `check-docs-source-parity`, `check-registry-source`, primary `tsc`, and
  package-integration `tsc` all pass.
- `pnpm turbo test` over all 30 affected Plate packages: 30 tasks passed.
- Tooling contract tests: 50 passed, 0 failed.
- `node tooling/scripts/check-plate-doc-code-contracts.mjs`: 363 current docs
  files pass.
- `node tooling/scripts/check-plite-release-artifacts.mjs`: 10 packed packages,
  34 public subpaths, NodeNext/Bundler declarations, package direction, Node
  runtime, and bare/named DCE pass.
- Syntax-aware plugin-config audit: 5,315 files pass.
- Stale helper, public `*PluginOptions` type, option-store terminology, old
  selector-factory, and plugin `.options` audits return no current matches.
- `node tooling/scripts/generate-ui-changelog-entries.mjs --check`: 40 source
  entries pass.
- `pnpm brl`: 55 tasks pass.
- Migration-owned Biome check: clean; `git diff --check` over migration owners:
  clean.
- Browser proof was attempted on `/blocks/block-selection-demo`; OS sandbox
  denied every local bind and Browser recorded `ERR_CONNECTION_REFUSED`.
- Structured autoreview was attempted through two Codex configurations and one
  Claude engine. Environment prevented engine output; the manual owner/API,
  adoption, deletion, docs, type, and artifact review produced the fixes above.

Final handoff prepared:
- Public break: plugin declaration `options` and every option helper/hook are
  gone.
- Replacement: `initialState`, descriptor-scoped `.store`, and state-first
  selectors.
- Adoption: Core, all dependent Plate packages, registry, apps, docs,
  changesets, scanners, exports, and release fixtures use the final API.
- Proof: package, app, docs, tooling, artifact, barrel, stale-audit, and manual
  review evidence is recorded.
- External actions: none; no commit, push, branch change, or PR.

Timeline:
- 2026-07-26: target accepted, implemented, adopted, reviewed, and verified.
- 2026-07-27: removed the remaining five manual store-hook generic calls,
  rejected key-only hook inputs, moved suggestion interaction state to the
  React `SuggestionPlugin` descriptor, and added declaration-only inference
  contracts.

Post-handoff inference repair proof:
- Core declaration contracts, the store-hook runtime suite, and navigation
  feedback tests pass.
- Suggestion package typecheck plus the focused registry component and kit
  tests pass.
- An isolated TypeScript project over the three changed registry files passes.
- Docs code contracts, generated-source parity, and registry-source checks
  pass.
- The broad current `www` projects remain blocked by unrelated
  `list-base-kit.tsx` render-wrapper variance and an existing schema TS2589;
  neither error reaches the changed suggestion files.

Reboot status:
| Question | Answer |
| --- | --- |
| Where am I? | Final verified handoff |
| Where am I going? | User review, then commit only if requested |
| What is the goal? | One plugin store API with no option compatibility surface |
| What have I learned? | Lifecycle was sound; vocabulary, selector execution, and hidden fixture adoption were the real defects |
| What have I done? | Completed implementation, deletion, adoption, docs, tooling, artifact proof, and review |

Open risks:
- Browser rendering could not be observed because this sandbox denies local
  server sockets.
- Four registry Bun rows remain blocked by an existing source-alias named-export
  harness issue; direct registry-source and TypeScript integration checks pass.
- Unrelated shared WIP still makes the broad schema-adoption and root lint lanes
  noisy; this migration does not alter those owners.
