# Fully typed parameterized plugin factories

Status: Complete. The factory API, Yjs and copied collaboration migrations,
focused package proof, registry output, doctrine repair, and review-ledger
closeout are complete. The package-wide Plate declaration gate remains blocked
by the unrelated concurrent `SuggestionPlugin.tsx` declaration errors recorded
below.

Objective:

Replace Plate Yjs's handwritten forwarding factories and overload mirrors with
one non-installable, fully inferred factory object. `YjsPlugin.create(options)`
must return one complete exact descriptor; `YjsPlugin.require(key)` must refine
the accepted construction input; and `YjsPlugin.map(stage)` must derive another
factory while preserving the exact input-to-descriptor relation through Plate
adaptation and copied collaboration UI.

Goal plan:
`docs/plans/2026-09-14-parameterized-plugin-factories.md`

Template:
`docs/plans/templates/task-complex.md`

Major source:

- type: accepted Best API Review record
- id / link: `2026-09-14-plugin-factory-mapping`
- title: typed plugin-factory mapping
- decision to make: select the exact factory object, type witness, mapping,
  narrowing, ownership, migration, and proof contracts
- decision criteria: no incomplete installable plugin; no duplicated Yjs API
  model or forwarding overloads; exact conditional capability and validator
  inference after mapping; unchanged descriptor identity and binding lifetime;
  finite declarations and bounded type/runtime cost

Major lane:

- lane: Best API design followed by Plate adoption planning, with the native
  Yjs callable remaining the capability owner
- output type: implemented API migration with proof and doctrine closeout
- implementation expected: yes
- affected packages / surfaces: Plite Yjs's private type relation, Plate plugin
  factory types/runtime, `platejs/yjs/react`, copied collaboration UI, package
  declarations/tests/smokes, registry output, doctrine, and the review ledger
- dominant risk: a pleasant `.create()`/`.map()` surface that silently widens
  cursor metadata or optional presence/compaction capabilities

First checkpoint:

- [x] Preserve the user's selected `YjsPlugin.create()` / `.map()` object shape.
- [x] Keep Yjs document, readiness, awareness, cursor validation, compaction,
      namespace, activation, rollback, cleanup, and descriptor ancestry laws.
- [x] Keep `.configure()` terminal and non-widening for consumer overrides.
- [x] Keep descriptor `.extend()` as author composition after construction.
- [x] Make the factory itself non-installable and non-addressable by
      `editor.plugin(...)`.
- [x] Do not merge unrelated feature APIs or migrate history, DOM, or authored
      constructors merely for symmetry.
- [x] Produce a fully typed plan with positive, negative, declaration, runtime,
      package, registry, and doctrine proof.
- [x] No duration, publication, PR, commit, release, or external tracker action
      was requested.

Timed checkpoint:

- requested duration: N/A
- semantics: no timed loop requested
- initial evidence or measured baseline: source audit, focused disposable HKT
  compile probe, and an exact reconstruction of the uncommitted pre-change
  forwarding contract
- improvement loop: three interleaved TypeScript cohorts, nine interleaved
  runtime construction packets, clean declaration output, and named DCE proof
- final evidence / loop closure: all frozen budgets passed; focused contracts,
  registry generation, doctrine validation, ledger checks, and this plan's
  completion checker passed

Completion threshold:

The task is complete when the selected public calls, internal dependent-type
model, runtime invariants, exact migration set, cost budgets, doctrine repair,
registry output, and ledger state are implemented and proved. Focused proof
must distinguish this change from unrelated package-wide failures.

Verification surface:

- current Yjs option-dependent source types and all Plate/copy adapters
- permanent positive and negative TypeScript contracts
- focused runtime and copied-registry tests
- clean Yjs React declaration partition and named DCE output
- matched type and descriptor-construction benchmark
- exact call-site/export inventory
- maximum-value hard-cut and alternative comparison
- public and private type contracts below
- `node .agents/skills/autogoal/scripts/check-complete.mjs` on this plan

Constraints:

- `yjs(options)` remains the native Plite public constructor in this slice. Its
  returned descriptor remains the sole source of document, presence,
  compaction, and cursor-data capabilities.
- Plate applications import the adapted factory from `platejs/yjs/react`.
- Each `.create()` call makes a fresh native Yjs descriptor/token and resource
  closure. Factory definition, `.require()`, and `.map()` capture no Yjs host
  resources and create no editor runtime state.
- A public call contains no explicit generic, callback parameter annotation,
  `any`, assertion, or reconstructed Yjs API type.
- Type machinery may erase one implementation call inside the private generic
  factory runtime only after the public witness has proved the relation. That
  erasure uses `unknown`, stays outside package declarations, and is covered by
  positive and negative type fixtures plus runtime input/descriptor checks.
- Existing historical plans and immutable review records are not rewritten.
- Start from repo evidence; no external source is needed for this repo-owned
  API and compiler question.

Boundaries:

- Source of truth: `packages/plitejs/src/yjs/core/plugin.ts`,
  `packages/platejs/src/lib/plugin`, `packages/platejs/src/react/plugin`,
  `packages/platejs/src/yjs/react/YjsPlugin.tsx`, and
  `apps/www/src/registry/components/editor/remote-cursor-overlay.tsx`.
- Allowed implementation scope: the exact factory/type owners, Yjs adapter,
  copied collaboration component/demo, affected tests/smokes/barrels,
  generated registry output, smallest doctrine owners, Plate Next version, and
  canonical review-ledger artifacts.
- External sources: N/A; current repo types and the local TypeScript compiler
  settle feasibility.
- Browser surface: copied collaboration behavior is covered by focused component
  tests; this task makes no mounted-browser or visual claim.
- Tracker sync: canonical local review ledger only; no external tracker.
- Non-goals: moving Yjs resources into `.configure()` or `.extend()`; making
  factories installable templates; moving options into `createEditor`; splitting
  Yjs capabilities; changing CRDT wire/data semantics; renaming raw `yjs`;
  converting history/DOM/authored factories; unrelated plugin or feature work.

Output budget strategy:

- Searches are bounded to the affected packages, registry, plans, and exact
  symbols. Large rule/source files are read in relevant ranges. Compiler output
  is capped and the disposable probe is removed after its result is recorded.

Blocked condition:

No task-specific blocker remains. The real Plate `.map()` implementation
preserves exact validator and optional capability inference without caller
generics or annotations and stays within every accepted cost budget. The wider
Plate declaration build stops only in unrelated concurrent suggestion code.

Major state:

- task_type: major
- task_complexity: major
- current_phase: closeout
- current_phase_status: complete
- next_phase: none
- goal_status: complete

Current verdict:

- verdict: pursue `YjsPlugin.create` / `.require` / `.map`
- confidence: implemented and proved at the exact public, type, runtime,
  declaration, copied-registry, benchmark, doctrine, and ledger boundaries
- next owner: none for this task
- reason: the object makes construction explicit, preserves complete nominal
  descriptors, and removes two manually forwarded generic factory layers
  without overloading terminal configuration

## Selected public API

The direct Plate React path is:

```ts
import { YjsPlugin } from "platejs/yjs/react";

const Collaboration = YjsPlugin.create({
  doc,
  initialReady,
  awareness,
  cursorData: { validate: isCollaborator },
});

const editor = createEditor({ plugins: [Collaboration] });

editor.plugin(Collaboration).api.setCursorData({
  color: "#7c3aed",
  name: "Ada",
});
```

Copied collaboration UI defines a factory once and creates a complete
descriptor per provider/editor resource set:

```ts
export const CollaborationPlugin = YjsPlugin.require("awareness").map(
  ({ api, editor }) => ({
    decorate: {
      attributes: ({ decoration }) => {
        const cursor = api.remoteCursor(Number(decoration.key));

        return {
          style: {
            backgroundColor: cursorColor(cursor),
          },
        };
      },
    },
    slots: {
      afterEditable: ({ editableRef }) => (
        <RemoteCursorOverlay editableRef={editableRef} editor={editor} />
      ),
    },
  })
);

const Collaboration = CollaborationPlugin.create({
  doc,
  initialReady,
  awareness,
  cursorData: { validate: isCollaborator },
});
```

`YjsPlugin` and `CollaborationPlugin` are factories. Neither has a plugin
`name`, schema identity, plugin portal, `.configure()`, or descriptor
`.extend()`. Their `.map()` is factory composition: it stores one ordinary
Plate author stage and applies it to every descriptor produced later.

`YjsPlugin.create(...)` returns the installable descriptor. That result retains
ordinary descriptor `.extend()` and terminal `.configure()` for jobs that occur
after resources are bound:

```ts
const Collaboration = YjsPlugin.create(options)
  .extend(sharedAuthorContribution)
  .configure({ component: RemoteSelection });
```

The hard cut deletes these APIs without aliases:

- `createYjsPlugin(options)`
- copied `createCollaborationPlugin(options)`
- the four Plate Yjs overloads
- Plate's handwritten `BaseApi`, `PresenceApi`, `ApiFor`,
  `PlateYjsDefinition`, and `PlateYjsPlugin` mirrors

Raw Plite keeps `yjs(options)` in this slice. Its public job and other Plite
parameterized constructors are not forced through a new syntax merely because
Plate needs a mapped factory.

## Type architecture

### 1. Native source relation

The native Yjs owner exposes a private type provider for its existing callable
constructor. The provider is analogous to Plite's value-sensitive
`PluginTypeLambda`, but is not exported from a public entrypoint:

```ts
interface YjsFactoryType extends PluginFactoryTypeLambda {
  readonly input: YjsPluginOptions;
  readonly output: YjsPluginForOptions<this["input"]>;
}
```

`YjsPluginForOptions` stays beside `yjs` and remains authoritative. Plate never
redeclares Yjs API groups. The source callable carries this private provider so
the Plate adapter can recover the relation rather than use `ReturnType<typeof
yjs>` at its broad generic instantiation.

### 2. Factory application witness

The private core model is one input/output type lambda plus a nominal factory
witness:

```ts
interface PluginFactoryTypeLambda {
  readonly input: object;
  readonly output: PluginReference;
}

type ApplyPluginFactory<
  TType extends PluginFactoryTypeLambda,
  TInput extends TType["input"]
> = (TType & Readonly<{ input: TInput }>)["output"];

declare class PrivatePluginFactoryWitness<TType, TAllowedInput> {
  protected readonly pluginFactory: readonly [TType, TAllowedInput];
}
```

The public value exposes only the three real jobs. The type lambda, normalized
stage accumulators, mapper output, and brand remain package-private:

```ts
interface PluginFactory<
  TType extends PluginFactoryTypeLambda,
  TAllowedInput extends TType["input"] = TType["input"]
> extends PrivatePluginFactoryWitness<TType, TAllowedInput> {
  create<const TInput extends TAllowedInput>(
    input: TInput
  ): ApplyPluginFactory<TType, TInput>;

  require<const TKey extends keyof TAllowedInput>(
    ...keys: readonly TKey[]
  ): PluginFactory<TType, RequireDefined<TAllowedInput, TKey> & TType["input"]>;

  map(/* the existing inferred Plate .extend() author-stage contract */): PluginFactory<
    MappedPluginFactoryType<TType, NormalizedStage>,
    TAllowedInput
  >;
}
```

These names are explanatory. Implementation may rename private helpers, but
the relation and visibility are acceptance requirements.

`PluginFactory` is a public behavior type only if declaration emit needs a
name. It has no public constructor and exposes no type-lambda argument at a
root export. Consumers use `typeof YjsPlugin` or the value's methods. The
package declaration-brand checks must reject leaked `PluginFactoryTypeLambda`,
normalization types, private symbols, or Plite implementation imports.

### 3. Required input refinement

The only selected refinement is a root-key requirement:

```ts
type RequireDefined<TInput, TKey extends keyof TInput> = Omit<TInput, TKey> & {
  readonly [K in TKey]-?: NonNullable<TInput[K]>;
};
```

`.require('awareness')` changes the allowed input before `.map()` is
contextually typed. The native relation therefore exposes presence methods in
the mapping callback. It also validates the key at runtime before invoking the
source constructor, so untyped JavaScript cannot create a mapped descriptor
whose author stage assumes a missing capability.

Do not add predicates, schema refinement, nested paths, default injection, or a
general validation DSL. The current job needs non-nullish root capability
presence. Existing option validation remains with the native constructor.

### 4. Mapping relation

`.map(stage)` lifts the existing Plate descriptor `.extend(stage)` relation
over future factory outputs. It is not an unconstrained JavaScript `map` whose
generic return is recovered with `ReturnType`.

Conceptually:

```ts
interface MappedPluginFactoryType<
  TSource extends PluginFactoryTypeLambda,
  TStage
> extends PluginFactoryTypeLambda {
  readonly input: TSource["input"];
  readonly output: ExtendPluginResult<
    ApplyPluginFactory<TSource, this["input"]>,
    TStage
  >;
}
```

`ExtendPluginResult` must be factored from the current `.extend()` generic and
normalization owner. The factory path may not copy a reduced merge rule. It
must preserve every applicable accumulator: API, read, update, selectors,
initial state, dependencies, conflicts, native fields, render/decorate/slots,
schema providers, target plugins, and source ancestry. Callback contextual
typing uses `ApplyPluginFactory<TType, TAllowedInput>`; after
`.require('awareness')`, presence APIs exist in that context. Each later
`.create(exactOptions)` reapplies the mapper to the exact source output, so the
created descriptor retains its validator-derived cursor type.

If sharing the full `.extend()` relation requires extracting a reusable
internal type operation or method signature, do that at the existing owner.
Do not maintain parallel descriptor and factory merge accumulators. Repeated
`.map()` calls must accumulate exactly like repeated descriptor `.extend()`
calls.

### 5. Plate adaptation

The private adapter derives Plate output from the native source relation and
the existing `toReactPlugin` type operation:

```ts
const NativeYjsFactory = pluginFactory(yjs);

export const YjsPlugin = NativeYjsFactory.map(toPlateYjsPlugin);
```

`toPlateYjsPlugin` remains private and performs the current runtime work:

```ts
toReactPlugin(
  definePlugin("yjs", {}).extend(nativePlugin),
  remoteCursorDecoration
);
```

Its mapped output is derived from the native descriptor's exact definition and
the existing Base-to-React adapter result. It contains no Yjs-specific API
shape. A standalone `mapPluginFactory(source, mapper)` helper loses to the
method because it adds a second public operation for the same composition job;
an internal helper is allowed if needed to implement the method.

### 6. Runtime representation

The factory runtime is a frozen object containing:

- one source constructor
- an immutable list of required root keys
- an immutable list of descriptor mapping stages
- `create`, `require`, and `map` methods

`require()` and `map()` return new frozen factory objects and do not mutate the
parent. `create(input)` checks required keys, calls the source exactly once,
verifies the result is one nominal non-configured plugin descriptor, and
applies mapping stages in declaration order. It performs no caching. Every
result therefore retains a fresh native Yjs descriptor/token, closure, source
ancestry, activation, and cleanup lifetime.

Passing a factory to a plugin tuple fails statically because it is not a
`PluginReference`; erased JavaScript fails through the existing nominal plugin
validation. `editor.plugin(YjsPlugin)` fails for the same reason.

## Type acceptance matrix

| Case                    | Must compile                                                                                       | Must fail                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Document only           | admission status and retry on root API and exact portal                                            | every presence and compaction method                                            |
| Presence                | cursor reads/writes and selection publication                                                      | compaction method without compaction input                                      |
| Compaction only         | retirement plus base API                                                                           | every presence method                                                           |
| Presence + compaction   | both optional capability groups                                                                    | invalid or missing construction inputs                                          |
| Cursor validator        | exact metadata through root API, portal, React hooks, created descriptor, and two mapped factories | malformed metadata payload and untyped hook result claims                       |
| `.require('awareness')` | presence methods inside the following `.map()` callback                                            | `.create()` without awareness; presence access before refinement                |
| Chained `.map()`        | all prior and new accumulators plus exact source capabilities                                      | widened name, API, schema, dependency, or cursor types                          |
| Descriptor use          | `.create(...).extend(...).configure(...)` in legal order                                           | factory `.configure`, factory descriptor `.extend`, or terminal descriptor map  |
| Installation            | descriptor returned by `.create()`                                                                 | factory in `plugins`, `editor.install`, dependency arrays, or `editor.plugin`   |
| Declarations            | finite portable `.d.ts` with exact methods and no private owner imports                            | `any`, exported type lambda, private compiler names, Plite implementation paths |

The permanent fixture extends
`packages/platejs/type-tests/yjs-collaboration-contracts.ts`. It must include
direct, `require + map`, two-map, copied registry, exact portal, root API,
explicit-editor hook, document-only, compaction-only, and negative installation
cases. Do not restore a generic forwarding helper as proof; the mapped factory
is the replacement for that helper.

## Migration and implementation units

### Unit 1: freeze matched evidence

- Add a disposable baseline fixture for the current `createYjsPlugin` across
  document-only, presence, compaction, combined, exact validator, and copied
  generic composition cohorts.
- Record median TypeScript extended diagnostics over three runs and one runtime
  construction cohort. Reuse the shared-plugin-identity benchmark budgets:
  candidate runtime p50 `<= 1.25x`, type instantiations and memory `<= 1.25x`,
  and check time `<= 1.5x` baseline.
- Record built `platejs/yjs/react` JavaScript and declaration bytes and named
  DCE behavior. Bundle size may change only by the reviewed factory runtime;
  an unexpected import or retained unused Yjs runtime is a failure.

### Unit 2: add the private factory relation

- Add the private type lambda/provider and factory runtime at the Plate plugin
  owner, with no root-level factory-construction grammar.
- Give native `yjs` the private input-to-output provider at its owning module.
- Factor the exact `.extend()` result operation so descriptor and factory map
  share one normalization/type owner.
- Add focused runtime and compile-only tests for factory non-installability,
  immutable composition, ordering, required-key validation, fresh identity,
  and repeated map accumulation.

### Unit 3: replace Plate Yjs forwarding

- Replace `createYjsPlugin.tsx` with the inferred `YjsPlugin` factory module.
- Derive Plate output from native `yjs`; delete Plate API mirrors and four
  overloads.
- Keep remote selection decoration behavior and React entrypoint ownership.
- Export `YjsPlugin` from `platejs/yjs/react`; keep `platejs/yjs` a pure native
  facade and keep raw `yjs(options)` unchanged.
- Update barrels because a public file/export is renamed or removed.

### Unit 4: replace copied forwarding

- Define `CollaborationPlugin` once with
  `YjsPlugin.require('awareness').map(...)`.
- Replace each `createCollaborationPlugin(options)` call with
  `CollaborationPlugin.create(options)`.
- Update registry mocks/specs and build generated registry output on `next`.
- Preserve one descriptor instance per editor/provider memoization lifetime;
  never call `.create()` during render without the existing stable owner.

### Unit 5: hard-cut and package proof

- Delete all live `createYjsPlugin` and `createCollaborationPlugin` exports,
  imports, call sites, test names, and declaration references. Historical
  plans/review records remain immutable evidence.
- Update package import smokes for headless/native versus React factory
  ownership.
- Build Plite and Plate declarations; inspect `platejs/yjs/react` and copied
  registry declarations for exact public shape and private-type leakage.
- Run the matched candidate type/runtime/DCE comparison and reject widening or
  budget failures instead of adding overloads, annotations, or API mirrors.

### Unit 6: doctrine and ledger closeout

- Run Best API doctrine repair. Update the smallest durable owner to state that
  an externally parameterized plugin may expose a non-installable factory
  object with `.create()`, required-key refinement, and mapped author stages;
  descriptor `.extend()` and terminal `.configure()` retain their current jobs.
- Audit `best-api`, Plate/Plite plan, Plugin Creator, Plate UI, Plate Docs, and
  Plate Next sources; edit only owners that teach the affected contract.
- Append one immutable Plate Next doctrine version when fingerprinted doctrine
  changes, run `pnpm install`, validate generated mirrors, and do not advance
  package attestations without their required checks.
- Update `docs/research/decisions/plate-core-ownership.md` and
  `docs/research/decisions/collaboration-ownership.md` to the implemented call
  shape. Record one implementation/proof review record and regenerate the
  canonical review index/dashboard so `plate-api` adoption and proof states
  reflect actual evidence.

## Exact caller/export inventory

Current source audit found `createYjsPlugin` in 17 files / 49 references and
`createCollaborationPlugin` in 6 files / 11 references across packages, apps,
and docs. Execution must classify each hit as live code/test/export, current
decision teaching, or immutable history before editing. Known live owners are:

- `packages/platejs/src/yjs/react/createYjsPlugin.tsx`
- `packages/platejs/src/yjs/react/index.tsx`
- `packages/platejs/src/yjs/createYjsPlugin.api.spec.ts`
- `packages/platejs/type-tests/yjs-collaboration-contracts.ts`
- `packages/platejs/test/public-package-import-smoke.slow.ts`
- `packages/platejs/test/yjs/react-contract.spec.tsx`
- Yjs-using Plate table specs
- `apps/www/src/registry/components/editor/remote-cursor-overlay.tsx`
- its component spec, collaboration demo/spec, and generated registry outputs
- Plite/Plate public-package type and package-config contract tests that assert
  facade ownership

The implementation performs a fresh final `rg` because generated outputs and
source may move. No historical review record or completed plan is edited to
erase the old call shape.

## Rejected alternatives

| Alternative                                                   | Rejection                                                                                                                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep `createYjsPlugin` overloads                              | Correct today, but Plate owns a duplicate Yjs capability model and copied UI owns another forwarding function.                                                |
| `YjsPlugin.configure(options)`                                | Makes terminal consumer override also construct resources and requires an incomplete plugin state.                                                            |
| `YjsPlugin.extend(options)`                                   | Conflates external resource construction with author contribution.                                                                                            |
| Install `[YjsPlugin, options]` or configure at `createEditor` | Makes plugin tuples/configuration own construction and still needs the same dependent result typing.                                                          |
| Split document/presence/compaction plugins                    | Adds coordination around one binding, namespace, admission, and cleanup lifetime.                                                                             |
| Plain object with `create: createYjsPlugin`                   | Renames the overload factory but keeps every duplicate type and copied forwarding problem.                                                                    |
| `ReturnType<typeof yjs>` or conditional alias only            | Direct exact calls can work, but generic forwarding widens; the earlier probe reproduced that failure.                                                        |
| Public standalone `mapPluginFactory(...)`                     | Adds a second operation for a job naturally owned by the factory value. Keep any implementation helper private.                                               |
| Public `definePluginFactory(...)` grammar                     | One concrete mapped factory is not evidence for another root authoring grammar. Keep construction machinery private until an independent author job earns it. |
| Convert history/DOM/authored factories now                    | Symmetry is not a user job and would merge unrelated feature migrations into this architecture slice.                                                         |

## Risks and recovery

- **Type-lambda leakage:** declaration audits fail. Keep the provider private,
  flatten the exported concrete factory declaration, or expose only a neutral
  provider carrier consistent with current `PluginTypeProvider`; never export
  the lambda/accumulators.
- **Cursor metadata widens after map:** stop. Repair the factory application
  relation. Do not add a Yjs-specific overload or annotate callback parameters.
- **Map supports only a reduced subset of `.extend()`:** stop or explicitly
  narrow the API before shipping. The selected target requires one shared
  accumulator owner, including repeated stages and dependency/provider
  propagation.
- **Type cost exceeds budget:** inspect the mapped type once, remove recursive
  whole-editor expansion, and compare a shallow provider carrier. If cost stays
  above budget, return to Best API with the measured result.
- **Runtime factory is accidentally installable:** remove every descriptor
  field/brand from the factory and retain nominal runtime validation.
- **Factory reuse shares a Yjs token/closure:** move construction back under
  `.create()` and prove two results have distinct descriptor/token identity.
- **Entry point pulls Yjs into unrelated bundles:** restore leaf ownership and
  fail the DCE/entrypoint gate.

## Verification commands for execution

Run focused checks while implementing, then the smallest complete closure set:

```bash
pnpm exec tsc -p packages/platejs/tsconfig.type-tests.json --noEmit
pnpm --filter platejs test -- packages/platejs/src/yjs/createYjsPlugin.api.spec.ts
pnpm --filter platejs test -- packages/platejs/test/yjs/react-contract.spec.tsx
pnpm --filter www test -- apps/www/src/registry/components/editor/remote-cursor-overlay.spec.tsx
pnpm --filter www test -- apps/www/src/registry/examples/collaboration-demo.spec.tsx
pnpm turbo typecheck --filter=./packages/plitejs --filter=./packages/platejs --filter=www
pnpm --filter platejs build
pnpm --filter www build:registry
pnpm plite:release:boundaries
node .agents/rules/plate-next/scripts/version.mjs validate
node tooling/scripts/review-ledger.mjs check
```

Execution must resolve the exact current test runner syntax from Verify Plate
before running it; the paths above identify the required surfaces rather than
authorizing an incorrect runner invocation. Run `pnpm brl` after the public
file/export move. Run scoped formatting/lint for changed files and the wider
required gate only after focused proof is green.

## Planning evidence

- Current source has four Plate `createYjsPlugin` overloads and handwritten
  Plate `BaseApi`, `PresenceApi`, conditional `ApiFor`, definition, and plugin
  aliases.
- Copied collaboration currently repeats a generic options-forwarding function
  before adding decoration/slot UI.
- `.configure()` and `.extend()` on a configured descriptor are `never`,
  confirming construction cannot truthfully be hidden after terminal
  configuration.
- `PluginTypeLambda` proves the repo already accepts a private higher-kinded
  provider for a value-sensitive capability relation.
- The earlier disposable probe proved a derived direct signature but lost
  awareness through the copied generic function.
- This planning pass ran a second disposable probe with a private
  `input -> output` type lambda, `.require('awareness')`, and a mapped factory.
  A direct exact-validator `.create()` retained `Collaborator`, document-only
  output omitted presence, and missing awareness failed. The focused command
  `pnpm exec tsc -p packages/platejs/tsconfig.plugin-factory-probe.json
--pretty false` exited 0. Both temporary files were removed.
- The full existing Plate type-test command still reports the unrelated
  `packages/platejs/type-tests/table-plugin-contracts.ts:79` TS2589 known from
  the prior review; no factory probe error remained.

Completion rule:

- Close only after every required acceptance row has implementation evidence,
  all matched budgets pass, and current source, declarations, generated
  registry output, doctrine mirrors, and ledger state agree.
- Record an unrelated broad-gate failure precisely; it cannot replace focused
  proof or be misreported as a failure of this factory implementation.

Start Gates:

| Gate                                     | Applies | Evidence                                                                    |
| ---------------------------------------- | ------- | --------------------------------------------------------------------------- |
| Prompt requirements captured before work | yes     | First checkpoint above                                                      |
| Timed checkpoint parsed                  | no      | No duration requested                                                       |
| `task` loaded                            | yes     | Task skill and workflow read                                                |
| Standing goal request applied            | yes     | Native goal created for this planning outcome                               |
| Source of truth read before analysis     | yes     | Yjs, plugin types/runtime, adapters, tests, Vision, review record           |
| Major lane selected                      | yes     | Best API design plus Plate adoption planning                                |
| Decision criteria stated                 | yes     | Major source and completion threshold                                       |
| Existing patterns / decisions checked    | yes     | PluginTypeLambda, current factories, collaboration and plate-core decisions |
| Helper stack selected                    | yes     | Task, Best API, type-system discipline; no panel/subagent available         |
| External research decision recorded      | yes     | N/A; repo/compiler evidence settles it                                      |
| Implementation expectation recorded      | yes     | Full local execution, proof, doctrine, and ledger closeout                  |
| Workspace authority selected             | yes     | Current `next` checkout                                                     |
| Branch / PR expectation decided          | yes     | `next`; no PR/publication requested                                         |
| Runtime scale applicability resolved     | yes     | Editor runtime unchanged; construction/type/DCE cost gets matched proof     |
| Output budget strategy recorded          | yes     | Bounded searches and focused compiler probe                                 |

Work Checklist:

- [x] Every applicable user, method, reference, and template obligation maps to
      this plan or the linked review record.
- [x] Final reconciliation found no omitted planning requirement.
- [x] First checkpoint is complete.
- [x] Objective, threshold, verification, constraints, boundaries, and blocked
      condition are concrete.
- [x] Current owners and current forwarding/overload architecture are mapped.
- [x] Repo patterns and prior decisions are recorded before external research.
- [x] External research is N/A with reason.
- [x] Options, recommendation, tradeoffs, blast radius, and rejection reasons
      are recorded.
- [x] Observed facts, inference, recommendation, and future proof are separated.
- [x] Maximum-value hard-cut and type-system pressure passes are complete.
- [x] The accepted factory, Yjs adapter, copied collaboration API, callers,
      docs, release artifacts, doctrine, and ledger state are implemented.
- [x] Type/runtime/declaration/DCE/registry/doctrine/ledger proof is specified.
- [x] Workspace and command owners are named.
- [x] Output remained bounded and disposable probes were removed.

Completion Gates:

| Gate                            | Applies | Required action                                                  | Evidence                                                            |
| ------------------------------- | ------- | ---------------------------------------------------------------- | ------------------------------------------------------------------- |
| Named verification threshold    | yes     | Prove the design is type-feasible and plan every production gate | Focused HKT probe plus matrices above                               |
| Current-state source audit      | yes     | Map owner, boundaries, current adapters, and callers             | Planning evidence and caller inventory                              |
| Pre-acceptance scale proof      | yes     | Bound construction/type/DCE cost                                 | Matched baseline/candidate contract and existing benchmark budgets  |
| Production scale rerun contract | yes     | Name final candidate command/cohorts                             | Unit 1, Unit 5, verification commands                               |
| Decision criteria closure       | yes     | Resolve every criterion into target or gate                      | Selected API/type architecture                                      |
| Options / rejection record      | yes     | Record viable lanes                                              | Rejected alternatives table                                         |
| Review / pressure pass          | yes     | Apply first-principles hard cut and type discipline              | Public surface cut and HKT probe                                    |
| Review findings closure         | yes     | Incorporate the stronger factory-object syntax                   | `YjsPlugin.create/require/map` target                               |
| External-source audit           | no      | N/A                                                              | Repo-owned API/compiler question                                    |
| Implementation gates            | yes     | Implement all six units and prove their public boundaries        | Source, contract, registry, benchmark, doctrine and ledger evidence |
| Final handoff contract          | yes     | Name exact recommendation, evidence, caveats, owner              | Below                                                               |
| Final lint                      | yes     | Check plan formatting/read-back                                  | Prettier check passed                                               |
| Output budget discipline        | yes     | Confirm bounded output                                           | Recorded above                                                      |
| Timed checkpoint                | no      | N/A                                                              | No duration requested                                               |
| Goal plan complete              | yes     | Run plan checker                                                 | Completion checker passed                                           |

Phase / pass table:

| Phase                           | Status   | Evidence                                           | Next              |
| ------------------------------- | -------- | -------------------------------------------------- | ----------------- |
| Intake and source read          | complete | User target, skills, Vision, record, source, tests | current-state map |
| Current-state map               | complete | overload/API mirror and caller inventory           | options           |
| Options and recommendation      | complete | hard-cut table and selected API                    | pressure pass     |
| Review / pressure pass          | complete | HKT feasibility and failure/recovery laws          | plan artifact     |
| Implementation or plan artifact | complete | all six implementation units and release artifacts | verification      |
| Verification                    | complete | focused type/runtime/declaration/registry proof    | closeout          |
| Closeout                        | complete | doctrine v195, ledger record, generated mirrors    | none              |

Findings:

- The clean syntax is a factory object, but syntax alone does not fix the type
  owner. The private re-applicable input/output witness is the essential part.
- A mapped factory avoids the generic forwarding-function inference cliff that
  forced Plate's overloads.
- `.require('awareness')` is justified only as input refinement before mapping;
  it must perform the corresponding runtime check.
- A public generic factory-definition grammar and migration of unrelated native
  constructors are not earned by this Yjs composition job.

Decisions and tradeoffs:

- Select `YjsPlugin.create`, `.require`, and `.map` at the Plate React Yjs
  entrypoint.
- Keep raw `yjs(options)`, descriptor `.extend()`, and terminal `.configure()`.
- Accept that `YjsPlugin` looks descriptor-like; the mandatory `.create()` and
  compile/runtime rejection of installation make the lifecycle explicit.
- Keep type machinery private even if the internal implementation is more
  complex than the deleted overloads. The user-facing and package-facing
  contract becomes smaller and has one capability owner.

Implementation notes:

- One private mapper/erasure boundary implements factory runtime composition;
  Yjs and copied files contain no output cast or explicit factory result
  annotation.
- Shared internal result owners preserve the existing `.extend()` type
  operation instead of copying its overload matrix.
- Factory objects are frozen and expose only `.create()`, `.require()`, and
  `.map()`. Created descriptors retain ordinary `.extend()` and terminal
  `.configure()`.

Review fixes:

- The earlier illustrative callable factory is refined to a non-callable object
  with explicit `.create()`.
- The initial `.map()` sketch is tightened to a lifted Plate author stage with
  a re-applicable HKT result, avoiding false generic callback inference.
- `.require()` is limited to root non-nullish keys and gains a matching runtime
  check; no general refinement DSL is planned.

Error attempts:

| Error / failed attempt                                                   | Count | Next different move                                                          | Resolution                                                        |
| ------------------------------------------------------------------------ | ----: | ---------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Naive derived generic forwarding lost awareness                          |     1 | Encode a re-applicable factory type relation                                 | Private input/output witness preserves the exact native relation  |
| First HKT probe through another generic function widened cursor metadata |     1 | Replace forwarding function with mapped factory and direct exact `.create()` | Permanent mapped-factory contract passes                          |
| Incremental Yjs declaration output retained the deleted factory          |     1 | Delete the partition output and build-info, then rebuild clean               | Finite partition contains `YjsPlugin` and no old factory          |
| Combined Bun copied-UI run leaked one file's module mock into another    |     1 | Use the repository's isolated mock-file runner contract                      | Both copied suites pass independently                             |
| Collaboration demo spec still mocked the old export shape                |     1 | Update the mock to the copied factory's `.create()` boundary                 | Demo suite passes                                                 |
| Schema-adoption fixture named the deleted API spec                       |     1 | Point the architecture fixture at `YjsPlugin.api.spec.ts`                    | All 91 architecture-tooling tests pass                            |
| First DCE command omitted the required relative path prefix              |     1 | Rerun Rolldown with `./.tmp/...`                                             | Sentinel-only 101-byte output contains no factory or Yjs runtime  |
| Release boundary and broad Plate declaration gates stop in suggestions   |     2 | Isolate Yjs declarations and inspect the exact first unrelated errors        | Yjs partition passes; unrelated limitation is recorded accurately |

Verification evidence:

- `git branch --show-current` → `next`.
- Plite Yjs tests (`271`), Plate Yjs tests (`5`), Plate Yjs React tests (`3`),
  Plate React-core tests (`303`), table caller tests (`15`), and isolated copied
  collaboration suites (`4` and `1`) pass.
- Plite package typecheck/tests, Plate Yjs/Yjs React/React-core checks, and the
  permanent Plate type-contract suite pass. The clean Yjs React declaration is
  finite, retains exact factory inference, and contains no deleted factory.
- Architecture checks pass `91/91`; package declaration-brand checks, barrels,
  scoped lint/format, registry changelog generation, release and development
  registry builds, Plate Next v195 validation, and review-ledger validation pass.
- Matched benchmark ratios are `0.9864x` type instantiations, `1.0225x` memory,
  `1.0394x` check time, and `0.6365x` runtime construction p50. Named DCE emits
  a 101-byte sentinel-only bundle. Every frozen budget passes. See
  `docs/plans/artifacts/parameterized-plugin-factories/benchmark.json`.
- Final live-source and generated-registry scans find no forwarding factory or
  factory-level `.configure()` call. Remaining old names are negative API tests
  and immutable migration history.
- The package-wide Plate build, website API-reference prerequisite, and
  `plite:release:boundaries` stop at the unrelated concurrent
  `SuggestionPlugin.tsx` TS4023/TS7056 declaration failure. Focused Yjs proof is
  green and no suggestion source was changed by this task.
- `pnpm exec prettier --check docs/plans/2026-09-14-parameterized-plugin-factories.md`
  → passed.
- `node .agents/skills/autogoal/scripts/check-complete.mjs docs/plans/2026-09-14-parameterized-plugin-factories.md`
  → passed at closeout.

Final handoff contract:

- Outcome: `YjsPlugin.create(options)` and
  `YjsPlugin.require('awareness').map(stage)` are the public Plate construction
  and copied-composition boundaries. Raw Plite `yjs(options)` remains the native
  capability owner. Both forwarding factories are hard-cut.
- Confidence: exact inference, runtime freshness and guards, descriptor
  composition, declaration portability, copied UI, bounded cost, DCE, registry
  output, doctrine, and ledger state have direct proof.
- Evidence: implementation record
  `2026-09-14-plugin-factory-mapping-implementation` plus the benchmark artifact
  and commands above.
- Browser proof: no mounted-browser or visual claim. Existing focused copied UI
  tests cover the changed registry boundary.
- PR / tracker: no PR, commit, publication, release, or external tracker action
  was authorized or performed. The local review ledger is complete.
- Caveat: the unrelated suggestion declaration failure prevents a green
  package-wide Plate declaration bundle and dependent website API-reference
  gate; it does not affect the clean Yjs partition.
- Next owner: none for this task.

Timeline:

- 2026-09-14: accepted Best API Review direction reopened under breaking freedom.
- 2026-09-14: selected explicit factory-object syntax and bounded `.require()` /
  `.map()` semantics.
- 2026-09-14: focused mapped-factory HKT feasibility probe passed and was removed.
- 2026-09-14: implemented the private relation, public Yjs factory, copied
  collaboration factory, callers, docs, tests, release artifacts, and tooling.
- 2026-09-14: matched benchmark, clean declaration/DCE proof, registry output,
  doctrine v195, and implementation review record passed closeout.

Reboot status:

| Question             | Answer                                                                           |
| -------------------- | -------------------------------------------------------------------------------- |
| Where am I?          | Complete                                                                         |
| Where am I going?    | No remaining task-owned phase                                                    |
| What is the goal?    | Exact typed factory object without incomplete plugins or capability mirrors      |
| What have I learned? | Mapping must reapply a private input/output relation; direct syntax alone widens |
| What have I done?    | Implemented, migrated, proved, documented, benchmarked, and recorded the API     |

Open risks:

- The package-wide Plate declaration and dependent website API-reference gates
  remain blocked by unrelated concurrent suggestion code. The clean Yjs
  declaration partition is the valid task-owned declaration proof.
- The benchmark baseline is an exact reconstruction of the uncommitted
  pre-change local source captured during this task, rather than a Git revision.
- The object API is deliberately limited to Yjs adoption; an independent future
  factory-authoring job must earn any public `definePluginFactory` surface.
