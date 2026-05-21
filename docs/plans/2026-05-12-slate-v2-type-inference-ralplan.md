# Slate v2 Type Inference Ralplan

## Status

Original broad inference execution completed on 2026-05-12.

Reopened on 2026-05-14 for the `useEditorSelector<boolean, CustomEditor>` DX
question. The selector generic inference subplan is ready for Ralph execution.

This is a planning pass only. No `.tmp/slate-v2` implementation files were
edited.

## Current Verdict

Yes, push hard on inference. But do it precisely.

The best architecture is not "delete every type annotation." That would be
sloppy and would weaken public package contracts. The right cut is:

1. Keep public boundary types, generic contracts, type guards, overloads,
   nullable React state/ref annotations, and empty mutable collection element
   annotations.
2. Remove redundant local annotations where the right-hand side already owns the
   type.
3. Replace repeated local assertions with one typed helper or one quarantined
   bridge.
4. Prefer `satisfies` for object literals that need structural checking without
   widening the variable.
5. Add compiler-backed public type contracts for any public API type change.

The biggest code smell is `create-editor.ts`: it has about 88 local `as any`
hits and many `(...args: any[])` wrappers even though the repo already has
mapped runtime method types. That is not a "manual type annotation" problem; it
is a missing typed binder/factory problem.

## Intent And Boundary

Intent:

- Make Slate v2 teach inference by default.
- Make implementation code smaller by deleting redundant local type spelling.
- Make type safety stronger by replacing assertion carpets with typed helpers,
  guards, and `satisfies`.
- Preserve the current public type model: exact generics at public/static
  boundaries, broad internal runtime parameters where TypeScript variance would
  otherwise poison the implementation.

In scope:

- `/Users/zbeyens/git/slate-v2/packages/**/src/**/*.{ts,tsx}`
- `/Users/zbeyens/git/slate-v2/packages/**/test/**/*.{ts,tsx}`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/**/*.{ts,tsx}`
- `/Users/zbeyens/git/slate-v2/playwright/**/*.{ts,tsx}`
- `/Users/zbeyens/git/slate-v2/scripts/benchmarks/**/*.{ts,tsx}`
- package typecheck scripts and type-contract tsconfigs when required to prove
  public type behavior

Non-goals:

- No public API churn just to make the source look cleaner.
- No global `noExplicitAny` gate until the intentional `any` buckets have a
  written allowlist.
- No rewrite of the editor runtime, React rendering runtime, or examples
  behavior in this plan.
- No issue close/fix claims from type cleanup alone.

Decision boundaries:

- A public exported type can only be simplified if a root-import public
  type-contract proves the emitted package surface remains better or equal.
- An internal annotation can be removed when the compiler infers the same or a
  narrower useful type.
- An assertion can stay only when it crosses a real runtime/generic boundary
  and the plan records why TypeScript cannot express it locally.

## Read Inputs

Live source:

- `/Users/zbeyens/git/slate-v2/package.json`
- `/Users/zbeyens/git/slate-v2/config/typescript/tsconfig.json`
- `/Users/zbeyens/git/slate-v2/biome.jsonc`
- `/Users/zbeyens/git/slate-v2/eslint.config.mjs`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/create-editor.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/editor-runtime.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/runtime-event-engine.ts`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/rendering-strategy-runtime.tsx`

Prior plans and learnings:

- `docs/plans/2026-04-26-slate-v2-plate-generics-type-system-plan.md`
- `docs/plans/2026-04-25-slate-v2-source-first-typecheck-plan.md`
- `docs/plans/2026-05-04-slate-v2-legacy-example-dx-ralplan.md`
- `docs/plans/2026-04-13-any-cleanup.md`
- `docs/solutions/developer-experience/2026-04-26-slate-v2-value-generics-should-be-public-boundary-not-runtime-variance.md`
- `docs/solutions/developer-experience/2026-04-07-slate-v2-react-19-2-cleanup-should-remove-forwardref-not-selection-layout-effects.md`
- `docs/solutions/developer-experience/2026-05-11-slate-v2-react-hooks-refs-lint-needs-real-render-fixes.md`
- `docs/solutions/developer-experience/2026-05-04-package-typecheck-must-run-public-type-contracts.md`
- `docs/solutions/workflow-issues/2026-03-26-published-package-type-regressions-may-be-release-artifacts-not-source.md`

Research and issue ledgers:

- `docs/research/README.md`
- `docs/research/index.md`
- `docs/research/log.md`
- `docs/slate-issues/gitcrawl-live-open-ledger.md`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`

## Live Audit Snapshot

Read-only scanner over `packages`, `site`, `scripts`, and `playwright`:

```txt
files scanned: 1497
as any: 145
as unknown as: 83
React hook explicit generic calls: 48
explicit arrow return annotations: 619
function declaration return annotations: 7
const/let type annotations: 675
satisfies: 37
as const: 157
```

Top hotspots:

| File                                                                                            |                                    Signal | Current shape                                                                                |
| ----------------------------------------------------------------------------------------------- | ----------------------------------------: | -------------------------------------------------------------------------------------------- |
| `/Users/zbeyens/git/slate-v2/packages/slate/src/create-editor.ts:323`                           |                          88 `as any` hits | transform/query/runtime wrappers manually erase args before satisfying typed runtime records |
| `/Users/zbeyens/git/slate-v2/packages/slate/src/core/public-state.ts:1046`                      | 62 explicit arrow returns, 5 `unknown as` | good `satisfies` core views plus extension group record casts                                |
| `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:1376` |                           9 hook generics | some null state/ref generics are needed; some `useMemo<T>` returns can infer                 |
| `/Users/zbeyens/git/slate-v2/site/examples/ts/rendering-strategy-runtime.tsx:33`                |    many `CSSProperties` const annotations | good target for `satisfies CSSProperties`                                                    |
| `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:45`         |           `createContext<...>({} as any)` | avoidable context assertion; use nullable context and narrow                                 |
| `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/*.ts`                            |                        DOM event `as any` | create typed beforeinput/dataTransfer helpers                                                |

Important config facts:

- TypeScript is strict and source-first:
  `/Users/zbeyens/git/slate-v2/config/typescript/tsconfig.json`.
- Biome currently allows explicit `any`:
  `/Users/zbeyens/git/slate-v2/biome.jsonc`.
- React Hooks recommended rules are enabled for `slate-react` and `site`, with
  only `immutability` disabled:
  `/Users/zbeyens/git/slate-v2/eslint.config.mjs`.
- `slate-react` typecheck already includes the generic public contract:
  `/Users/zbeyens/git/slate-v2/packages/slate-react/package.json`.

## TypeScript Advanced Types Policy

Use advanced types where they remove local spelling. Do not use them to show
off.

Allowed:

- `Parameters<T>` and `ReturnType<T>` when deriving helper signatures from the
  actual API owner.
- mapped types for runtime method groups.
- conditional types with `infer` for binder helpers and value extraction.
- `satisfies` for object literals, configs, examples, scenario rows, and test
  fixtures.
- local type guards for DOM/event payload boundaries.

Avoid:

- recursive type tricks in hot public APIs unless there is a package contract
  proving the DX.
- replacing clear public interfaces with unreadable conditional-type soup.
- moving assertions from call sites into helpers without naming the boundary.
- `unknown as T` as the default answer. It is only acceptable at an explicit
  runtime/generic bridge.

## Keep, Cut, Replace

### Keep

- Public exported API interfaces and type aliases.
- Type predicates and overload return types.
- `useState<T | null>(null)` and `useRef<T | null>(null)` where the initializer
  is only `null`.
- `const items: T[] = []` and `let current: T | null = null` where the initial
  value cannot infer the element/member type.
- `ReturnType<typeof createEditor>` in tests where the helper has no exported
  public type.
- `as const` for literal tuple/string preservation.
- Runtime-generic casts in weak maps when the map intentionally stores a broad
  runtime and returns a typed view.

### Cut

- `useMemo<T>(...)` when the callback return expression already infers `T`.
- `const x: CSSProperties = { ... }` in examples; use
  `const x = { ... } satisfies CSSProperties`.
- callback parameter annotations in examples when the prop/API already infers
  them.
- `as any` for object literals that can use `satisfies`.
- repeated `(...args: any[]) => (fn as any)(editor, ...args)` wrappers.

### Replace

- `createContext<T>({} as any)` with `createContext<T | null>(null)` plus a
  narrow hook or local context check.
- DOM `InputEvent` casts with typed helpers:
  `getInputEventData`, `getInputEventDataTransfer`, `getBeforeInputTargetRanges`.
- `globalThis as any` profiler access with a declared local global shape.
- repeated runtime wrapper casts with one `bindEditorMethod` /
  `bindRuntimeMethod` helper.
- public API `any` only after a dedicated type-contract proves `unknown` or an
  exact generic value type is better for consumers.

## Decision Brief

Principles:

- Public API precision beats implementation cleverness.
- Inference belongs to the API owner, not every call site.
- One named bridge is better than dozens of local assertions.
- Examples are documentation. They should teach the way we want users to write
  Slate v2.

Drivers:

1. Better DX: users should get useful inference without importing aliases or
   writing casts.
2. Lower source noise: local implementation should read like runtime logic, not
   a type workaround ledger.
3. Stronger public contracts: package root imports must prove the API.
4. Maintained performance: no type-system cleanup can touch React runtime
   behavior without the existing perf/runtime gates.

Chosen option:

- Do a multi-lane cleanup with typed helpers, `satisfies`, and public type
  contracts.

Rejected alternatives:

- Blanket delete annotations: wrong. It breaks nullable state, empty arrays,
  public APIs, and type guards.
- Blanket `noExplicitAny`: too early. It would force churn before intentional
  `any` buckets are classified.
- Global `any` to `unknown`: mostly fake safety unless the consumer contracts
  prove better narrowing.
- Leave all assertions because typecheck passes: bad DX. The source is teaching
  future contributors to cast instead of model.

## Implementation Phases For Ralph

### Phase 1 - Core Runtime Binder

Owner: `.tmp/slate-v2/packages/slate`.

Target:

- Replace the assertion-heavy runtime wrapper tables in
  `/Users/zbeyens/git/slate-v2/packages/slate/src/create-editor.ts:323` with
  typed binders derived from `EditorStaticApi`, `EditorTransformRegistry<V>`,
  and the existing `InternalEditor*Runtime` types.
- Keep unavoidable generic variance casts in one helper with a comment naming
  the runtime boundary.
- Do not change public editor behavior.

Candidate shape:

```ts
type BoundEditorMethod<T> = T extends (
  editor: Editor,
  ...args: infer Args
) => infer Result
  ? (...args: Args) => Result
  : never;

const bindEditorMethod = <T extends (editor: Editor, ...args: any[]) => any>(
  getEditor: () => Editor,
  method: T,
): BoundEditorMethod<T> =>
  ((...args) => method(getEditor(), ...args)) as BoundEditorMethod<T>;
```

The exact helper should avoid leaking `any` at call sites. If TypeScript needs a
single helper-level `any`, quarantine it there.

Proof:

- `bun --filter slate typecheck`
- `bunx tsc --project packages/slate/test/tsconfig.generic-types.json --noEmit --pretty false`
- focused `bun test ./packages/slate/test/generic-editor-api-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts --bail 1`

### Phase 2 - React Context And DOM Event Type Guards

Owner: `.tmp/slate-v2/packages/slate-react`.

Target:

- Replace `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:45`
  `createContext<...>({} as any)` with a nullable context.
- Add typed DOM helpers for beforeinput/dataTransfer target-range reads used by:
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/editing-kernel.ts:906`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/editing-kernel.ts:922`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/native-input-strategy.ts:107`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/src/hooks/android-input-manager/android-input-manager.ts:435`
  - `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/selection-reconciler.ts:609`
- Replace the plain-text paste paragraph `as any` in
  `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/clipboard-input-strategy.ts:523`
  with `satisfies` or a typed snapshot helper.

Proof:

- `bun --filter slate-react typecheck`
- `bunx tsc --project packages/slate-react/test/tsconfig.generic-types.json --noEmit --pretty false`
- focused Slate React tests covering selectors, clipboard input, and beforeinput
  command extraction

### Phase 3 - React Hook Inference Cleanup

Owner: `.tmp/slate-v2/packages/slate-react`.

Target:

- Remove `useMemo<T>` generics where callback return expressions infer the
  shape.
- Keep nullable `useState<T | null>(null)` and `useRef<T | null>(null)`.
- Keep lazy state cells that replaced render-time ref writes.
- Use typed factory functions when a state cell shape is repeated.

First files:

- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:1395`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:1420`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/components/editable-text-blocks.tsx:1681`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/runtime-event-engine.ts:162`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts:135`
- `/Users/zbeyens/git/slate-v2/packages/slate-react/src/editable/runtime-root-engine.ts:209`

Proof:

- `bun --filter slate-react typecheck`
- `bun lint`
- focused React Hooks lint remains green

### Phase 4 - Examples Inference Cleanup

Owner: `.tmp/slate-v2/site/examples`.

Target:

- Convert `CSSProperties` variable annotations to `satisfies CSSProperties`.
- Remove callback parameter types where props infer them.
- Replace `as Value`, `as any`, and custom editor casts with `satisfies`,
  helper factories, or fixed upstream generic surfaces.
- Keep exported component prop types and `ComponentProps` wrappers where there
  is no inference owner.

First files:

- `/Users/zbeyens/git/slate-v2/site/examples/ts/rendering-strategy-runtime.tsx:33`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/huge-document.tsx`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/paste-html.tsx:211`
- `/Users/zbeyens/git/slate-v2/site/examples/ts/components/index.tsx`

Proof:

- `bun typecheck:site`
- targeted example Playwright only if runtime output changes; otherwise site
  typecheck is enough for this phase

### Phase 5 - Test And Benchmark Type Derivation

Owner: `.tmp/slate-v2/packages/**/test`, `.tmp/slate-v2/playwright`,
`.tmp/slate-v2/scripts/benchmarks`.

Target:

- Keep `ReturnType` / `Parameters` when deriving from helper owners.
- Add local aliases only when the same derived type repeats enough to hurt
  readability.
- Replace scenario/config array assertions with `satisfies`.
- Do not create tests that assert old code text disappeared.

Proof:

- `bun test ./packages/slate --bail 1`
- `bun --cwd packages/slate-react test -- --bail 1`
- relevant Playwright/stress typecheck only if those files change

### Phase 6 - Public API `any` Classification

Owner: public type-contract lane.

Target:

- Classify exported `any` into:
  - intentionally open user data
  - generic-erasure debt
  - local helper laziness
  - declaration-artifact risk
- Public examples:
  - `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:613`
    `Editor<V extends Value = any>`
  - `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:1133`
    `addMark` value
  - `ReactEditor<any>` defaults in public hooks
- Only change these after a root-import public type contract proves the new
  shape.

Proof:

- package generic type contracts from package root imports
- declaration build check when emitted `.d.ts` shape matters:
  `bunx turbo build --filter=./packages/slate --filter=./packages/slate-react --force`
- inspect generated declaration entrypoints for accidental `any` collapse

### Phase 7 - Optional Audit Tooling

Owner: tooling.

Target:

- Add a non-blocking audit script first, not a hard lint gate.
- Report buckets:
  - `as any`
  - `as unknown as`
  - `useMemo<T>`
  - `CSSProperties` variable annotations
  - exported `any`
- Require an allowlist reason for remaining source assertions before turning it
  into a gate.

Rejected as first move:

- enabling Biome `noExplicitAny` globally. It would make noise before the real
  boundary decisions are encoded.

## Related Issue Accounting

ClawSweeper/live GitHub discovery: skipped for this pass.

Reason: cache-first ledgers already cover the TypeScript/API issue rows, and
this plan makes no fix or close claim. No broad GitHub refresh is justified.

Related but not claimed:

| Issue                                              | Existing ledger status                                                 | This plan                                                                     |
| -------------------------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `#5612` examples not 100% type safe                | `not-claimed` in `docs/slate-issues/gitcrawl-v2-sync-ledger.md:125`    | Phase 4 may improve examples, but no claim until current repro and site proof |
| `#4290` TypeScript definition from example         | `issue-reviewed` in `docs/slate-issues/gitcrawl-v2-sync-ledger.md:450` | Phase 4 related only                                                          |
| `#4095` example `n: Node` type incorrect           | `issue-reviewed` in `docs/slate-issues/gitcrawl-v2-sync-ledger.md:498` | Phase 4 related only                                                          |
| `#5075` formatting type indexing                   | `not-claimed` in `docs/slate-issues/gitcrawl-v2-sync-ledger.md:281`    | Public API type lane may revisit, not claimed                                 |
| `#5508` CustomEditor overriding prop breaks typing | `cluster-synced` in `docs/slate-issues/gitcrawl-v2-sync-ledger.md:191` | Phase 6 related only                                                          |
| `#5487` createEditor return typing                 | `cluster-synced` in `docs/slate-issues/gitcrawl-v2-sync-ledger.md:197` | Phase 6 related only                                                          |
| `#5404` hook return type                           | `cluster-synced` in `docs/slate-issues/gitcrawl-v2-sync-ledger.md:224` | Phase 2 and Phase 6 related only                                              |
| `#4366` generalized Slate React types              | `cluster-synced` in `docs/slate-issues/gitcrawl-v2-sync-ledger.md:439` | Phase 2 and Phase 6 related only                                              |

No `Fixes #...` rows should be added until implementation proves a current
issue-shaped contract.

## Regression Proof Matrix

| Risk                                                     | Required proof                                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Public generic precision regresses                       | package root-import generic type contracts                                     |
| Declaration output collapses to `any`                    | package build plus generated declaration inspection when public exports change |
| Runtime wrappers lose a method or wrong args             | `slate` generic/static API contracts and core tests                            |
| React selector context changes outside provider behavior | `slate-react` provider/selector tests                                          |
| DOM input helper changes event behavior                  | focused beforeinput/clipboard/selection tests                                  |
| Example type cleanup changes visible behavior            | `bun typecheck:site`; Playwright only for runtime-output changes               |
| Lint cleanup fights React Hooks rules                    | `bun lint` plus React Hooks recommended preset still active                    |

## Scorecard

| Dimension                                                | Score | Evidence                                                                                                                                                 |
| -------------------------------------------------------- | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                           |  0.84 | React hook cleanup keeps lazy state and memo walls from existing React Hooks learnings; no runtime behavior changes accepted without `slate-react` tests |
| Slate-close unopinionated DX                             |  0.88 | examples inference target from `2026-05-04-slate-v2-legacy-example-dx-ralplan.md`; public type contracts remain root-import based                        |
| Plate and slate-yjs migration backbone                   |  0.82 | keeps public/static generic boundary from `2026-04-26-slate-v2-plate-generics-type-system-plan.md`; does not weaken broad internal runtime variance      |
| Regression-proof testing                                 |  0.80 | proof matrix names package, type-contract, and declaration gates; implementation still pending                                                           |
| Research evidence completeness                           |  0.84 | live source scan plus prior TS/generic learnings; no external ecosystem refresh needed for this local type cleanup                                       |
| shadcn-style composability and hook/component minimalism |  0.86 | nullable context cleanup and example prop inference reduce weird surface; public wrappers kept where useful                                              |

Weighted total: `0.84`.

Status stays `pending` because this is the first activation of a new plan, and
the implementation trials/type-contract bake-off have not run.

## Pass-State Ledger

| Pass                                 | Status   | Evidence added                                                                                                                        | Plan delta                                                                                                                               | Open issues                                                                                                                           | Next owner                            |
| ------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Skill reload and prior context       | complete | loaded `slate-ralplan`, `typescript-advanced-types`, `planning-with-files`, `learnings-researcher`; memory and docs/solutions checked | planning-only boundary confirmed                                                                                                         | none                                                                                                                                  | current pass                          |
| Current-state read and initial score | complete | live scanner counts, config reads, hotspot line refs                                                                                  | created this plan                                                                                                                        | scanner regex is approximate, so ralph should trust compiler over counts                                                              | ralph                                 |
| Related issue cache pass             | complete | ledger search for type/API issue rows                                                                                                 | no fix claims                                                                                                                            | no live GH refresh needed                                                                                                             | ralph if implementation claims issues |
| Ralph activation                     | complete | `.tmp/019e1701-5e30-75c0-9a6d-bf7127ba2ee0/continue.md`, session completion reset to this plan                                        | execution handoff written                                                                                                                | none                                                                                                                                  | ralph                                 |
| TypeScript binder design pass        | complete | `bun --filter slate typecheck`; core runtime now has one local binder boundary instead of per-method `as any` wrappers                | implemented in `.tmp/slate-v2/packages/slate/src/create-editor.ts`; extension group registration no longer casts factories through `any` | one intentional helper-level `any[]` remains to bind arbitrary static editor methods                                                  | closed                                |
| React context and DOM event pass     | complete | `bun --filter slate-react typecheck`; selector/input/clipboard/rendering tests passed                                                 | nullable selector context, typed DOM input helpers, context-first `useElementSelected` path lookup                                       | native `onBeforeInput` fallback still needs `unknown as React.FormEvent` because React synthetic and DOM native events do not overlap | closed                                |
| Hook and example inference pass      | complete | `bun typecheck:site`; `useMemo<...>` and `useCallback<...>` audit count is `0`                                                        | examples use `satisfies` for style/rule objects; render-prop path usage moved to hooks                                                   | remaining `CSSProperties` annotations are prop/return contracts, not redundant literals                                               | closed                                |
| Public API any classification        | complete | `bunx tsc --project packages/slate/test/tsconfig.generic-types.json --noEmit --pretty false`; surface contract passed                 | `ElementOf`/`TextOf`/entry helpers now derive through `Editor<V>`; stale primitive instance-method contract rewritten to transaction API | repo still has intentional test/mock escape hatches outside package source                                                            | closed                                |
| Closure score                        | complete | all focused gates below passed after `bun lint:fix`                                                                                   | implementation accepted                                                                                                                  | no blocker                                                                                                                            | closed                                |

## Ralph Execution Result

Completed on 2026-05-12.

Primary outcomes:

- `.tmp/slate-v2/packages/slate/src` and `.tmp/slate-v2/packages/slate-react/src`
  now have no repeated implementation `as any` wrappers. The remaining package
  source `any` is the single editor binder rest tuple in `create-editor.ts`.
- Repository audit counts after the pass: `as any` = 36, `as unknown as` = 89,
  `useMemo<` = 0, `useCallback<` = 0, `: CSSProperties` = 10.
- Generic type contracts now prove editor-derived helpers like
  `ElementOf<typeof editor>`, `TextOf<typeof editor>`, and entry helpers retain
  `Editor<V>` value information.
- Render-prop path stays cut from public props; examples use
  `useElementPath`/`useElementSelected` instead.

Fresh verification:

```bash
bun lint:fix
bun --filter slate typecheck
bun --filter slate-react typecheck
bun typecheck:site
bun typecheck:root
bunx tsc --project packages/slate/test/tsconfig.generic-types.json --noEmit --pretty false
bun test ./packages/slate/test/generic-editor-api-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts ./packages/slate/test/transaction-target-runtime-contract.ts --bail=1
bun test ./packages/slate-react/test/provider-hooks-contract.tsx --bail=1
bun test ./packages/slate-react/test/rendering-strategy-and-scroll.tsx --bail=1
bun test ./packages/slate-react/test/surface-contract.tsx --bail=1
bun --filter slate-react test:vitest test/model-input-strategy-contract.test.ts test/dom-coverage-native-bridge-contract.test.ts
```

## Fast Driver Gates

Run from `/Users/zbeyens/git/slate-v2` unless noted.

Core:

```bash
bun --filter slate typecheck
bunx tsc --project packages/slate/test/tsconfig.generic-types.json --noEmit --pretty false
bun test ./packages/slate/test/generic-editor-api-contract.ts ./packages/slate/test/state-tx-public-api-contract.ts --bail 1
```

React:

```bash
bun --filter slate-react typecheck
bunx tsc --project packages/slate-react/test/tsconfig.generic-types.json --noEmit --pretty false
bun --cwd packages/slate-react test -- --bail 1
```

Examples:

```bash
bun typecheck:site
```

Whole repo closeout:

```bash
bun lint
bun run lint:fix
bun check
```

Declaration proof when public exports change:

```bash
bunx turbo build --filter=./packages/slate --filter=./packages/slate-react --force
```

Planning repo state:

```bash
bun run completion-check
```

## Final Completion Gates

- All accepted phases either implemented or explicitly cut with a reason.
- No public API `any` change without a package root-import type contract.
- No implementation `as any` reduction replaced by behavior drift.
- Remaining assertions documented in an allowlist or local comment at the true
  boundary.
- `.tmp/slate-v2` package gates pass for touched packages.
- `bun check` passes before claiming closure.
- Issue ledgers updated only for real fix/improve claims.

## Ralph Handoff

Execute this plan in order. Start with Phase 1 and Phase 2 because they remove
the worst assertion debt and improve real safety. Keep Phase 6 separate from
local cleanup; public `any` changes need type-contract proof and declaration
inspection.

Do not run a cosmetic sweep that removes useful annotations. The target is
fewer local lies, not fewer type characters at any cost.

## Notes

- The `learnings-researcher` skill references
  `docs/solutions/patterns/critical-patterns.md`, but that file does not exist
  in this repo. This was already noted in `docs/plans/2026-04-13-any-cleanup.md`.
- One package script discovery command failed because `find -exec` substituted
  the package path into a JavaScript expression. The replacement Node scan
  succeeded and showed current package `typecheck` scripts.

## 2026-05-14 Selector Generic Inference Reopen Pass

### Current Verdict

No, `useEditorSelector<boolean, CustomEditor>(...)` is not the absolute best DX.
The return type should be inferred from the selector result.

The target is not a new hook and not a generic-order break. The implemented
target keeps `useEditorSelector`, annotates the editor parameter only where the
custom editor type is needed, and lets the return type infer:

```ts
const active = useEditorSelector((editor: CustomEditor) =>
  isMarkActive(editor, format),
);
```

`useEditorState(..., { deps })` remains the preferred normal state-read shape
when the custom value type can be inferred. Ralph tested it here and rejected it
for these examples because the current public generic order forces explicit
return generics or a wrapper to keep `CustomValue`; that would reintroduce the
DX problem this pass is removing.

Explicit return generics stay only in type-contract code when the test is
proving the generic itself.

### Intent And Boundary

Intent:

- Remove example code that teaches users to spell a selector result type that
  TypeScript can infer.
- Keep Slate v2 close to raw Slate: small hooks, no Plate-style product wrapper
  just for local typing comfort.
- Preserve the current selector runtime and subscription behavior.

In scope:

- `.tmp/slate-v2/site/examples/ts/{richtext,hovering-toolbar,inlines,iframe}.tsx`
  call sites that currently use `useEditorSelector<boolean, CustomEditor>`.
- `.tmp/slate-v2/packages/slate-react/test/generic-react-editor-contract.tsx`
  type-contract coverage for inferred selector return values.
- Slate React hook docs if examples need a short rule: prefer `useEditorState`
  for state reads, `useEditorSelector` only for editor/operation reads.

Non-goals:

- No public hook rename.
- No `useTypedEditorSelector`, `useCustomEditorSelector`, or curried selector
  factory.
- No generic-order breaking change.
- No Plate compatibility API in raw Slate.
- No issue fix/close claim from this cleanup.

Decision boundary:

- Ralph may remove explicit selector return generics and rewrite state-only
  active checks to `useEditorState`.
- Ralph may annotate the selector parameter with `CustomEditor` only for
  low-level editor-object selectors that cannot be moved to `useEditorState`.
- Ralph must keep a package type-contract proving typed editor operations and
  inferred selector return values.

### Live Source Evidence

| Surface                        | Current owner                                                                  | Current shape                                                                             | Decision                                                                                                                         |
| ------------------------------ | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Slate selector API             | `.tmp/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:82`      | `useEditorSelector<T, TEditor>(selector, equalityFn?, options?)` returns `T`.             | Keep runtime API; infer `T` at call sites.                                                                                       |
| Slate state selector API       | `.tmp/slate-v2/packages/slate-react/src/hooks/use-editor-selector.tsx:161`     | `useEditorState<T, TEditor>(selector, options?)` wraps `editor.read` and has `deps`.      | Prefer for toolbar/shell state reads.                                                                                            |
| Slate hook docs                | `.tmp/slate-v2/docs/libraries/slate-react/hooks.md:25` and `:55`               | Docs already say normal app reads use `useEditorState`; `useEditorSelector` is low-level. | Align examples with docs.                                                                                                        |
| Slate richtext example         | `.tmp/slate-v2/site/examples/ts/richtext.tsx:500` and `:540`                   | `useEditorSelector<boolean, CustomEditor>(...)`.                                          | Replace with inferred return, preferably via `useEditorState`.                                                                   |
| Slate hovering toolbar example | `.tmp/slate-v2/site/examples/ts/hovering-toolbar.tsx:147`                      | `useEditorSelector<boolean, CustomEditor>(...)`.                                          | Replace with inferred return, preferably via `useEditorState`.                                                                   |
| Slate inlines example          | `.tmp/slate-v2/site/examples/ts/inlines.tsx:414` and `:436`                    | `useEditorSelector<boolean, CustomEditor>(...)`.                                          | Replace with inferred return, preferably via `useEditorState`.                                                                   |
| Slate iframe example           | `.tmp/slate-v2/site/examples/ts/iframe.tsx:97`                                 | `useEditorSelector<boolean, CustomEditor>(...)`.                                          | Replace with inferred return, preferably via `useEditorState`.                                                                   |
| Slate generic type contract    | `.tmp/slate-v2/packages/slate-react/test/generic-react-editor-contract.tsx:87` | `useEditorSelector<number, typeof reactEditor>(...)`.                                     | Add/replace a contract that proves return inference without spelling `number`.                                                   |
| Plate selector API             | `packages/core/src/react/stores/plate/useEditorSelector.ts:15`                 | `useEditorSelector<T, E>(selector, deps, options?)`.                                      | Plate has similar generic ordering, but most call sites infer `T`; copy that usage lesson, not Plate's deps signature wholesale. |

### Decision Brief

Principles:

- Inference belongs to the API owner and selector result, not to call-site
  boilerplate.
- State reads should use a state hook; editor-object selectors are an escape
  hatch.
- Do not add a hook only to avoid a one-line selector parameter type in rare
  low-level cases.
- Public generic order is API; do not churn it without a better migration story.

Viable options:

| Option                                                                                         | Pros                                                                                                            | Cons                                                                                                                               | Verdict                                      |
| ---------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Keep `useEditorSelector<boolean, CustomEditor>` in examples                                    | No code movement.                                                                                               | Teaches redundant return generics and makes examples look harder than Plate.                                                       | Reject.                                      |
| Reorder `useEditorSelector` generics to editor-first                                           | Lets callers imagine `useEditorSelector<CustomEditor>`.                                                         | Breaks `useEditorSelector<T>` style and TypeScript still lacks true partial type-arg inference for every desired form.             | Reject.                                      |
| Add `useTypedEditorSelector` or a curried factory                                              | Can hide editor parameter annotations.                                                                          | Extra public API for a small TypeScript ergonomics issue; not Slate-close.                                                         | Reject.                                      |
| Use `useEditorState` for state reads and infer `useEditorSelector` returns for low-level reads | Matches current docs and would give explicit closure deps.                                                      | Current `useEditorState<T, TEditor>` cannot keep custom value typing here without spelling the return generic or adding a wrapper. | Tried during Ralph, rejected for this slice. |
| Keep `useEditorSelector` but remove explicit return generics                                   | Smallest code change, preserves runtime behavior, proves return inference, and avoids wrapper/public API churn. | Still uses a low-level selector for toolbar active state.                                                                          | Final implementation.                        |

### Ecosystem Strategy Synthesis

| System                          | Source                                                                                                                               | Mechanism                                                                                      | Avoids                                                    | Steal                                                                                  | Reject                                                           | Slate target                                                                                                      | Verdict |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------- |
| Plate                           | `packages/core/src/react/stores/plate/useEditorSelector.ts:15`, `packages/core/src/react/stores/plate/useEditorSelector.spec.tsx:24` | Selector return type is inferred at normal call sites; dependencies are explicit.              | Repeated `<boolean, Editor>` spelling in app code.        | Teach inferred selector returns and explicit closure deps where Slate has that option. | Do not copy Plate's product-layer selector shape into raw Slate. | Inferred `useEditorSelector` returns now; revisit state-hook inference only with an API pass, not local wrappers. | partial |
| Slate v2 docs                   | `.tmp/slate-v2/docs/libraries/slate-react/hooks.md:25-68`                                                                            | Separate `useEditorState` from low-level `useEditorSelector`.                                  | App code opening `editor.read` inside a generic selector. | Align examples with the documented hook split.                                         | Do not document raw selectors as the common toolbar path.        | Examples stop spelling return generics and prefer state selectors.                                                | agree   |
| React 19.2 external-store model | `.tmp/slate-v2/packages/slate-react/src/hooks/use-generic-selector.tsx:48-136`                                                       | Selector result equality controls rerender; selector identity changes recompute during render. | Broad rerenders from unrelated commits.                   | Keep equality/invalidation runtime unchanged.                                          | Do not make type cleanup alter subscriptions.                    | Type-only/example cleanup with existing selector runtime proof.                                                   | agree   |

### Public API Target

Keep:

```ts
useEditorState(selector, options?)
useEditorSelector(selector, equalityFn?, options?)
```

Do not add:

```ts
useTypedEditorSelector();
useCustomEditorSelector();
useEditorSelector.withEditor();
```

Do not teach:

```ts
useEditorSelector<boolean, CustomEditor>(...)
```

### Implementation Phases For Ralph

1. Replace the six example call sites:
   - `.tmp/slate-v2/site/examples/ts/richtext.tsx:500`
   - `.tmp/slate-v2/site/examples/ts/richtext.tsx:540`
   - `.tmp/slate-v2/site/examples/ts/hovering-toolbar.tsx:147`
   - `.tmp/slate-v2/site/examples/ts/inlines.tsx:414`
   - `.tmp/slate-v2/site/examples/ts/inlines.tsx:436`
   - `.tmp/slate-v2/site/examples/ts/iframe.tsx:97`
2. Prefer `useEditorState(..., { deps: [...] })` only when the custom value type
   stays inferred without explicit return generics or a wrapper.
3. If a helper needs the editor object, use
   `useEditorSelector((editor: CustomEditor) => ...)` and let the boolean return
   infer.
4. Update `generic-react-editor-contract.tsx` so one contract proves:
   - selector editor argument is `typeof reactEditor`;
   - operations are `Operation<CustomValue>[]`;
   - returned value is inferred as `number` without
     `useEditorSelector<number, typeof reactEditor>`.
5. Grep gate: no `useEditorSelector<boolean,` remains in `.tmp/slate-v2`.

### Issue Ledger Accounting

ClawSweeper/live GitHub discovery: skipped.

Reason: this is a type/example DX cleanup under an already-classified hook
typing cluster. It makes no `Fixes #...` claim and does not change runtime
behavior.

Related but not claimed:

| Issue                                 | Ledger status                                                       | This pass                                                                              |
| ------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| `#5404` hook return type              | related in `docs/slate-v2/ledgers/fork-issue-dossier.md:4375`       | Improves the same hook-typing pressure but no legacy `useSlateStatic` closure.         |
| `#4366` generalized Slate React types | related in `docs/slate-v2/ledgers/fork-issue-dossier.md:4491`       | Keeps generic React editor contracts; no exact legacy component typing closure.        |
| `#5612` examples type safety          | `not-claimed` in `docs/slate-issues/gitcrawl-v2-sync-ledger.md:125` | Example type cleanup may improve it; no fix claim until exact current repro is proven. |

`docs/slate-v2/references/pr-description.md` unchanged: no fixed issue claims,
accepted public API shape, release gate, or maintainer-facing claim changes.

### Applicable Implementation-Skill Review Matrix

| Lens                          | Applicability | Finding                                                                                                                 | Plan delta                                                                   |
| ----------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `vercel-react-best-practices` | applied       | Type cleanup must not widen subscriptions. Ralph kept the existing selector runtime instead of changing subscriptions.  | Remove explicit return generics only.                                        |
| `performance-oracle`          | applied       | The state-hook tactic would improve closure stability but currently needs explicit generics/wrappers for custom values. | Keep runtime unchanged; defer state-hook inference to an API pass if needed. |
| `tdd`                         | applied       | Public hook typing needs compiler-backed proof.                                                                         | Update generic React editor contract before/with examples.                   |
| `build-web-apps:shadcn`       | skipped       | No UI chrome shape change.                                                                                              | none                                                                         |
| `react-useeffect`             | skipped       | No effect or external synchronization change.                                                                           | none                                                                         |

### High-Risk Deliberate Mode

Risk is low because no runtime API or subscription engine changes are accepted.

Failure scenarios:

- A helper rewrite accidentally changes active toolbar semantics.
- The type contract stops proving custom editor operation typing.
- A cleanup leaves one explicit return generic in examples and keeps teaching the
  bad pattern.

Proof plan:

```bash
cd /Users/zbeyens/git/slate-v2
bun --filter slate-react typecheck
bun typecheck:site
rg -n "useEditorSelector<boolean," packages site
bunx tsc --project packages/slate-react/test/tsconfig.generic-types.json --noEmit --pretty false
```

### Scorecard

| Dimension                                                | Score | Evidence                                                                                                                          |
| -------------------------------------------------------- | ----: | --------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance                           |  0.93 | Keeps `useEditorSelector` runtime unchanged; current source verified in `use-editor-selector.tsx` and `use-generic-selector.tsx`. |
| Slate-close unopinionated DX                             |  0.94 | Removes redundant return generics without adding a new public hook.                                                               |
| Plate and slate-yjs migration backbone                   |  0.88 | No collab/data-model surface; Plate comparison supports inferred selector usage while raw Slate keeps its smaller hook split.     |
| Regression-proof testing                                 |  0.92 | Type-contract, site typecheck, package typecheck, and grep gate are named.                                                        |
| Research evidence completeness                           |  0.90 | Live Slate v2 source/docs plus live Plate selector source were read; no algorithmic external editor research needed.              |
| shadcn-style composability and hook/component minimalism |  0.93 | Cuts call-site type noise and rejects extra wrapper hooks.                                                                        |

Weighted total: `0.92`.

### Verification Run Before This Planning Update

From `/Users/zbeyens/git/slate-v2`:

```bash
bun --filter slate-react typecheck
# passed

bun typecheck:site
# passed
```

These prove the current baseline only. Ralph still owns the post-change gates
above.

### Pass-State Ledger Addendum

| Pass                              | Status   | Evidence added                                                                                                                                  | Plan delta                                                                      | Open issues                     | Next owner         |
| --------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------- | ------------------ |
| Selector generic inference reopen | complete | live Slate selector API, Slate docs, six example call sites, generic contract, Plate selector source, current `slate-react` and site typechecks | accepted inferred return target; rejected generic reorder and new wrapper hooks | implementation applied by Ralph | verification sweep |

### Final User-Review Handoff

- Public API: keep `useEditorState` and `useEditorSelector`; no new selector
  hook.
- Generic DX: cut `useEditorSelector<boolean, CustomEditor>` from examples.
- State reads: use `useEditorState(..., { deps })` only when custom value typing
  does not force explicit return generics or a wrapper.
- Selectors: annotate the selector parameter where the custom editor type is
  needed and infer the return.
- Tests: update generic React editor contract to prove inferred return and typed
  custom editor operations.
- Gates: `slate-react` typecheck, site typecheck, generic type-contract
  tsc, and grep for `useEditorSelector<boolean,`.

### Ralph Execution Result

Completed on 2026-05-14.

Changed files in `.tmp/slate-v2`:

- `site/examples/ts/richtext.tsx`
- `site/examples/ts/hovering-toolbar.tsx`
- `site/examples/ts/inlines.tsx`
- `site/examples/ts/iframe.tsx`
- `packages/slate-react/test/generic-react-editor-contract.tsx`

Implementation:

- Replaced all six example `useEditorSelector<boolean, CustomEditor>` calls with
  `useEditorSelector((editor: CustomEditor) => ...)`, so the selector result
  infers as `boolean`.
- Replaced the generic contract's
  `useEditorSelector<number, typeof reactEditor>` call with an inferred return
  and `const inferredSelected: number = selected`.
- Tried the planned `useEditorState` route and rejected it for this slice:
  current `useEditorState<T, TEditor>` defaults to `Value` and cannot keep the
  examples' `CustomValue` without explicit return generics or a wrapper.
- Reference docs: no change. No issue claims, public API shape, release gates,
  proof status, or PR narrative changed.

Verification from `.tmp/slate-v2`:

```bash
bun --filter slate-react typecheck
bun typecheck:site
bunx tsc --project packages/slate-react/test/tsconfig.generic-types.json --noEmit --pretty false
rg -n "useEditorSelector<boolean,|useEditorSelector<number, typeof reactEditor>" packages site
bun check
```

Results:

- `slate-react` typecheck passed.
- Site typecheck passed.
- Generic React editor type contract passed.
- Banned selector generic grep returned no matches.
- `bun check` passed: lint, all package/site/root typechecks, Bun tests, and
  Slate React Vitest.
