# Slate v2 Extension Slots Ralplan

Date: 2026-05-18
Status: done
Completion id: `019e390b-a7f2-7423-af90-d7dd8e45f8fb`
Current pass: `verification-sweep-pass`
Current pass status: complete
Score: 0.92 ready

## Current Verdict

The mechanisms are necessary. The current names are not the best Slate-ish DX.

- `operationMiddlewares`: necessary substrate, wrong public name. Rename the author-facing slot to `operations.apply`.
- `commitListeners`: necessary substrate, okay mechanism, registry-ish name. Rename author-facing slot to `onCommit`.
- `register`: necessary lifecycle, but slightly framework-internal. Rename author-facing slot to `setup`.

Keep the internal registry names if useful internally. Do not make extension authors write registry names as their normal API.

## What They Are Used For

### `operationMiddlewares`

Current shape:

```ts
operationMiddlewares: [
  ({ operation }, next) => {
    next(operation)
  },
]
```

Live source:

- `../slate-v2/packages/slate/src/interfaces/editor.ts:1177` defines operation middleware context as `{ editor, operation }`.
- `../slate-v2/packages/slate/src/interfaces/editor.ts:1341` and `:1358` expose `operationMiddlewares` on extension registration output and extension objects.
- `../slate-v2/packages/slate/src/core/public-state.ts:1779` routes every applied operation through registered operation middleware before base apply.
- `../slate-v2/packages/slate/src/core/extension-registry.ts:225` stores/removes operation middleware in the extension registry.
- `../slate-v2/packages/slate-dom/src/plugin/with-dom.ts:143` uses it to keep DOM-side pending text diffs, pending selection, path refs, and key maps coherent as operations apply.
- `../slate-v2/packages/slate/test/transaction-contract.ts:409` proves `tx.apply` routes through operation middleware.

Real use:

- low-level operation observation/rewrite
- path/ref/DOM runtime mapping
- collaboration import/export adapters when they need operation-level taps
- core bridge work that used to override `editor.apply`

DX verdict:

`operationMiddlewares` is honest but ugly. It sounds like Express, not Slate. The closest Slate-ish shape is:

```ts
operations: {
  apply({ operation, next }) {
    next(operation)
  },
}
```

Why this wins:

- it maps directly to legacy Slate's `editor.apply` override
- it stays operation-first, not transform-command sugar
- it keeps `tx` out of the operation pipeline
- it reads as "handle operation apply", not "install middleware infrastructure"

### `commitListeners`

Current shape:

```ts
commitListeners: [
  (commit, snapshot) => {
    // observe post-transaction commit
  },
]
```

Live source:

- `../slate-v2/packages/slate/src/interfaces/editor.ts:1347` exposes `commitListeners` from registration output.
- `../slate-v2/packages/slate/src/interfaces/editor.ts:1364` exposes `commitListeners` on extension objects.
- `../slate-v2/packages/slate/src/interfaces/editor.ts:1583` defines a listener as `(commit, snapshot) => void`.
- `../slate-v2/packages/slate/src/core/public-state.ts:2616` notifies commit listeners after a snapshot change and lazily computes snapshot only when needed.
- `../slate-v2/packages/slate-history/src/history-extension.ts:233` uses commit listeners to build undo batches, merge/push/skip history, clear redo, and rebase history on remote/collab commits.
- `../slate-v2/packages/slate/test/collab-adapter-extension-contract.ts:122` uses commit listeners to export local commits for a fake collaboration adapter.
- `../slate-v2/packages/slate/test/generic-extension-contract.ts:40` proves typed commit/snapshot access.

Real use:

- history recording after a transaction commits
- collaboration export after local commits
- analytics/devtools/debugging over committed operations
- external stores that need commit metadata without joining mutation lifecycle

DX verdict:

`commitListeners` is a registry name. It is acceptable internally, but public extension DX should be:

```ts
onCommit({ commit, snapshot }) {
  // post-commit work
}
```

Why this wins:

- Slate already has callback/event vocabulary like `onChange`
- `onCommit` makes timing obvious: after transaction, not during update
- object context leaves room for `editor` or `state` later without positional-arg churn
- one function per extension is simpler than teaching arrays; multiple internal listeners can be composed inside the extension

### `register`

Current shape:

```ts
register({ editor, options, runtimeState, signal }) {
  const state = runtimeState(initial)

  return {
    api: {},
    cleanup() {},
    commitListeners: [],
    state: {},
    tx: {},
  }
}
```

Live source:

- `../slate-v2/packages/slate/src/interfaces/editor.ts:1328` defines registration context with `editor`, `name`, `options`, `runtimeState`, and `signal`.
- `../slate-v2/packages/slate/src/core/editor-extension.ts:351` builds that context.
- `../slate-v2/packages/slate/src/core/editor-extension.ts:545` calls `extension.register(context)`, registers both static slots and returned slots, wires runtime-state cleanup, returned cleanup, and abort signal.
- `../slate-v2/packages/slate-history/src/history-extension.ts:211` uses `register` to initialize history state, expose `editor.api.history`, return cleanup, and attach commit listener.
- `../slate-v2/packages/slate-dom/src/plugin/with-dom.ts:273` uses `register` to install DOM runtime, remove the temporary root `editor.dom`, and expose `editor.api.dom` / `editor.api.clipboard`.
- `../slate-v2/packages/slate-react/src/plugin/with-react.ts:87` uses `register` to install DOM/React runtime and expose API groups.
- `../slate-v2/packages/slate/test/extension-methods-contract.ts:136` proves options, cleanup signal, and extension-local runtime state.
- `../slate-v2/packages/slate/test/generic-extension-namespace-contract.ts:174` proves registration can return typed `state` and `tx` groups.
- `../slate-v2/packages/slate/test/transaction-contract.ts:1265` proves cleanup and abort after unextend.

Real use:

- install extension-owned runtime resources
- allocate extension-local state without putting it on the editor root
- expose APIs that require an editor instance
- return cleanup and abortable side effects
- install slots that depend on options or local state

DX verdict:

`register` is not terrible, but `setup` is closer to the actual job:

```ts
setup({ editor, options, runtimeState, signal }) {
  const mode = runtimeState('text')

  return {
    api: {},
    onCommit() {},
    state: {},
    tx: {},
    cleanup() {},
  }
}
```

Why `setup` wins:

- the extension author is not "registering a registry"; they are setting up runtime state and returning slots
- it matches the replacement for `withX(editor)` better than `register`
- it makes cleanup/signal feel natural
- it keeps raw Slate less framework-y

## Target Public Shape

```ts
const history = () =>
  defineEditorExtension({
    name: 'history',

    state: {
      history(state, editor) {
        return {
          get: () => getHistory(editor),
          redos: () => getHistory(editor).redos,
          undos: () => getHistory(editor).undos,
        }
      },
    },

    tx: {
      history(tx, editor) {
        return {
          redo() {},
          undo() {},
        }
      },
    },

    setup({ editor, runtimeState, signal }) {
      getHistory(editor)

      return {
        api: {
          history: {
            withoutSaving(fn) {},
          },
        },
        onCommit({ commit }) {
          // build history batch
        },
        cleanup() {
          // delete WeakMap state
        },
      }
    },
  })
```

Low-level operation hook:

```ts
const dom = () =>
  defineEditorExtension({
    name: 'dom',
    operations: {
      apply({ operation, next }) {
        // update DOM-side refs/pending ranges
        next(operation)
      },
    },
    setup({ editor }) {
      return {
        api: {
          clipboard,
          dom,
        },
      }
    },
  })
```

## Keep / Rename / Cut

| Current public slot | Decision | Target | Why |
| --- | --- | --- | --- |
| `operationMiddlewares` | rename | `operations.apply` | `middleware` is registry-speak; `apply` is the Slate mental model. |
| `commitListeners` | rename | `onCommit` | Post-commit extension callback; callback name beats listener array. |
| `register` | rename | `setup` | Installs runtime state/resources and returns slots; less framework-internal. |
| internal registry `operationMiddlewares` | keep internal | no public docs | Registry can keep literal storage names. |
| internal registry `commitListeners` | keep internal | no public docs | Runtime internals can stay explicit. |
| `runtimeState` context helper | keep | `runtimeState` | Verbose but precise; avoids confusion with `state` read view. |
| `signal` | keep | `signal` | AbortSignal is right for cleanup. |
| `cleanup` | keep | `cleanup` | Clear, conventional, needed. |

## Initial Issue Accounting

No issue fix claim. This is API review only.

Related surfaces already in durable ledgers:

- operation/collab/history pressure: `#1770`, `#2288`, `#3741`, `#3874`
- clipboard/runtime boundary pressure: `#1024`, `#5233`, `#4569`
- extension/plugin API pressure: `#3222`, `#4089`, `#3177`

Issue-ledger closure:

- `docs/slate-v2/ledgers/issue-coverage-matrix.md` updates `#3557` to name
  the target slot vocabulary: `operations.apply`, `onCommit`, and `setup`.
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md` updates the current `#3557`
  manual sync row with this plan as the latest planning source.
- `docs/slate-v2/ledgers/fork-issue-dossier.md` adds the extension slot naming
  review and records `0` new fixed/improved claims.
- `docs/slate-v2/references/pr-description.md` records the accepted
  author-facing naming target.

## Ecosystem Notes

- Lexical supports keeping these mechanisms: it has partitioned listeners, update tags, extension lifecycle, and extension-local reactive state.
- ProseMirror supports the operation/commit split: transactions own changes and metadata; view/DOM bridge owns host runtime.
- Tiptap supports extension ergonomics but is too product-command shaped for raw Slate.

Initial strategy:

- steal Lexical's lifecycle partitioning
- steal ProseMirror's transaction/operation seriousness
- steal Tiptap's extension packaging DX
- reject public registry names and command-first product APIs

## Open Risks

- `operations.apply` may look too approachable for app authors; docs must label it advanced/substrate.
- `onCommit` can tempt mutation from post-commit listeners; tests/docs should say post-commit observers must start a fresh `editor.update` if they mutate.
- `setup` return shape must not become a dumping ground for product hooks. Plate owns product plugin bundles.

## Decision Brief

Principles:

- Raw Slate should expose lifecycle concepts that map to the editor model, not
  registry implementation names.
- Operation-level hooks must remain lower-level than transforms.
- Post-commit observers must not pretend to be mutation hooks.
- Extension-local runtime setup must replace `withX(editor)` without mutating
  the editor root.

Drivers:

- Keep legacy Slate mental models recognizable: `apply`, commit/onChange
  pressure, and `withX` setup pressure.
- Keep Plate-style product plugin composition out of raw Slate.
- Preserve history, DOM, React, and collaboration adapter needs.
- Make the common extension authoring path readable without hiding advanced
  low-level hooks.

Options considered:

| Option | Verdict | Reason |
| --- | --- | --- |
| Keep `operationMiddlewares`, `commitListeners`, `register` public | reject | Mechanically honest but registry-shaped and not Slate-ish enough. |
| Rename to `operations.apply`, `onCommit`, `setup` | accept | Maps to operation apply, post-commit observation, and extension runtime installation without widening scope. |
| Collapse these into `api` or `editor` helpers | reject | Loses lifecycle timing and encourages app-level helpers for engine-level work. |
| Cut operation/commit/setup slots entirely | reject | Breaks first-party history, DOM, React, and collaboration adapter architecture. |

Consequence:

The plan is a breaking public API rename plan. It needs a later Ralph execution
slice with public-surface tests, first-party extension migration, and examples.

## Maintainer Objection Pass

Objection: "`operations.apply` is too inviting; app authors will misuse it."

Answer: keep it documented as advanced and operation-level. The name is still
better than `operationMiddlewares` because it maps to Slate's historical
`apply` override instead of middleware infrastructure.

Objection: "`onCommit` sounds like React and might encourage mutation after
commit."

Answer: the timing is the point. It should be documented as post-transaction
observation. If a listener mutates, it must start a new `editor.update`.

Objection: "`setup` is vague."

Answer: `register` is more vague for authors because it describes an internal
registry action. `setup` describes what extension authors do: allocate runtime
state, install APIs, and return cleanup.

Objection: "This is churn without behavior."

Answer: the behavior already exists and is necessary. The churn is justified
because this is the raw extension authoring spine. Bad names here become
permanent copy-paste debt across every first-party and third-party extension.

## High-Risk Deliberate Pass

Pre-mortem:

- Risk: `operations.apply` becomes a product command hook.
  Mitigation: docs mark it advanced and operation-level; product behavior stays
  in `transforms`.
- Risk: `onCommit` grows into an event bus.
  Mitigation: one author-facing callback per extension; internal registry can
  compose returned listeners.
- Risk: `setup` return shape becomes a dumping ground.
  Mitigation: accepted return keys stay the existing extension slot families.
- Risk: rename breaks first-party packages.
  Mitigation: Ralph execution must migrate history, DOM, React, and contracts
  in one hard cut.

Proof matrix for Ralph:

- Public type tests reject old public slot names.
- Runtime tests prove operation apply order, commit callback timing, setup
  cleanup, abort signal, and runtime state.
- First-party `history`, `dom`, and `react` extensions use the target names.
- PR/reference docs avoid legacy names except in planning/history context.

## Example Impact Refresh - 2026-05-18

Verdict after live source read: the slot rename itself does not force a site
example edit. Current examples do not author `operationMiddlewares`,
`commitListeners`, or `register` directly.

The broader DX cleanup does affect examples that teach first-party feature
extensions while still passing rendering through `Editable render*` props. That
is a teaching mismatch: the feature extension owns behavior/schema, but the
visible rendering is still separate at the call site.

| File | Current live shape | Required change | Why |
| --- | --- | --- | --- |
| `../slate-v2/site/examples/ts/check-lists.tsx` | `extensions: [checklist()]`; `transforms.deleteBackward`; `Editable renderElement` | Keep transform shape; move checklist element rendering into extension-owned renderer registration when the renderer API is finalized. | This is the canonical checklist DX example. It should show one feature extension owning behavior plus rendering. |
| `../slate-v2/site/examples/ts/tables.tsx` | `extensions: [table()]`; `transforms.deleteBackward`, `deleteForward`, `insertBreak`; `Editable renderElement` / `renderLeaf` | Keep transform middleware; move table element rendering into the table feature extension if raw Slate keeps renderer registration, otherwise keep `renderElement` and document it as per-editor rendering. | Table behavior already proves transform middleware is the right answer instead of keydown interception. |
| `../slate-v2/site/examples/ts/markdown-shortcuts.tsx` | `extensions: [markdownShortcuts()]`; transform middleware; `Editable renderElement` | Keep transform middleware. Renderer move is optional because the extension is mainly behavior, not a schema package. | This is a behavior-extension example; rendering can stay explicit if we want to teach local block rendering separately. |
| `../slate-v2/site/examples/ts/inlines.tsx` | `extensions: [inline()]`; clipboard + transform middleware + elements; `Editable renderElement` / `renderText` | Keep clipboard/transform/elements; move link/button/badge renderers into the extension only if renderer registration stays in raw Slate. | It is a mixed schema/behavior/rendering feature, so split teaching is noisy. |
| `../slate-v2/site/examples/ts/images.tsx` | `extensions: [image()]`; `clipboard.insertData`; `elements`; `Editable renderElement` / `renderVoid` | Keep `clipboard.insertData`; move image void rendering into the image extension when renderer registration is accepted. | This is the strongest public example for extension-owned clipboard + void rendering. |
| `../slate-v2/site/examples/ts/editable-voids.tsx` | `extensions: [editableVoid()]`; `elements`; `Editable renderElement` / `renderVoid` | Move editable-void rendering into the extension if renderer registration is retained; otherwise keep the explicit render props. | It demonstrates the void/embedded editor model and should not teach two extension paths unless one is clearly an override. |
| `../slate-v2/site/examples/ts/embeds.tsx` | `extensions: [embed()]`; `elements`; `Editable renderElement` / `renderVoid` | Same as images/editable-voids: renderer ownership belongs with the feature if raw Slate keeps renderer registration. | Embeds are feature-level schema + rendering, not only per-editor decoration. |
| `../slate-v2/site/examples/ts/mentions.tsx` | `extensions: [mention()]`; `elements`; `Editable renderElement` / `renderLeaf` / `renderVoid` | Keep mention schema extension; decide whether mention renderer belongs in raw Slate extension or stays as an app override. | Mentions mix schema, popup UI, marks, and void rendering, so raw Slate must avoid becoming Plate. |
| `../slate-v2/site/examples/ts/forced-layout.tsx` | `normalizers.editor`; `Editable renderElement` | No slot rename change. Keep normalizer shape; renderer can stay explicit because the example is about document constraints. | The public-surface contract already forbids stale post-commit repair here. |
| `../slate-v2/site/examples/ts/richtext.tsx` | `richText()` extension with clipboard + transforms; `Editable renderElement` / `renderLeaf` | Do not shove the whole rich-text UI into raw extension slots. Keep as a broader example unless a dedicated renderer-registration API is accepted. | This is closest to a product bundle. Raw Slate should avoid turning it into Plate. |
| `../slate-v2/site/examples/ts/paste-html-import.ts` / `paste-html.tsx` | `html()` extension with `clipboard.insertData` and elements; rendering remains in the example | Keep `clipboard.insertData`; no direct slot rename change. | Clipboard ingress shape is already right; output/rendering is separate policy. |

Hard answer: for the three-slot rename, the examples that must change are not
site examples; they are first-party packages and contracts:

- `../slate-v2/packages/slate-history/src/history-extension.ts`: `register` ->
  `setup`, returned `commitListeners` -> returned or top-level `onCommit`.
- `../slate-v2/packages/slate-dom/src/plugin/with-dom.ts`: ad-hoc DOM
  operation middleware -> `operations.apply`; `dom()` lifecycle `register` ->
  `setup`.
- `../slate-v2/packages/slate-react/src/plugin/with-react.ts`: lifecycle
  `register` -> `setup`.
- `../slate-v2/packages/slate/test/transaction-contract.ts`: operation
  middleware and lifecycle tests must use `operations.apply`, `onCommit`, and
  `setup`.
- `../slate-v2/packages/slate/test/collab-adapter-extension-contract.ts`:
  fake adapter uses `setup` + `onCommit`.
- `../slate-v2/packages/slate/test/extension-methods-contract.ts` and generic
  extension contracts: public typing must reject old slot names and prove the
  new ones.

Example policy after this review:

- Feature examples with schema plus behavior plus rendering should eventually
  teach one extension-owned feature shape.
- Behavior-only examples can keep local `renderElement` when the renderer is
  not part of the feature being taught.
- Raw `Editable render*` props remain valid escape hatches and per-instance
  overrides. They should not be the default teaching path for first-party
  feature extensions.
- No example should use local helper extraction just to hide the proposed API.
  The call site should show the real extension shape inline first.

## Pass State Ledger

| Pass | Status | Evidence | Next |
| --- | --- | --- | --- |
| Activation reset | complete | `.tmp/019e1fc0-dba0-7de1-9236-b484a144cda6/completion-check.md` reset from previous `done` state | none |
| Current-state read | complete | live `../slate-v2` source, tests, first-party history/dom/react/collab uses, compiled Lexical/ProseMirror/Tiptap research | related issue discovery |
| Related issue discovery | complete | related rows checked in coverage matrix, fork dossier, current sync ledger, and frozen open issue ledger | ledger sync |
| Issue ledger sync | complete | updated `#3557` in coverage matrix and current sync ledger; added fork dossier section; PR reference synced | decision brief |
| Decision brief | complete | options, drivers, rejected alternatives, and consequence recorded above | maintainer objection |
| Maintainer objection pass | complete | objections for `operations.apply`, `onCommit`, `setup`, and churn recorded above | deliberate pass |
| High-risk deliberate mode | complete | pre-mortem and Ralph proof matrix recorded above | closure gate |
| Closure gate | complete | planning artifacts synced; no Slate v2 source edit made; completion-check passes | none |
| Example impact refresh | complete | live example grep/read over `../slate-v2/site/examples/ts` and package contracts; table recorded above | closure refresh |
| Closure refresh | complete | example-impact refresh added no new issue claim, no Slate v2 source edit, and no new ledger sync requirement; completion state closed for current hook id | none |
| Ralph execution activation | complete | `.tmp/019e390b-a7f2-7423-af90-d7dd8e45f8fb/completion-check.md` reset to `pending`; `.tmp/019e390b-a7f2-7423-af90-d7dd8e45f8fb/continue.md` rewritten for execution | public API TDD slice |
| Public API TDD slice | complete | RED: focused `transaction-contract` showed `operations.apply` not wired; GREEN: runtime contracts and package typechecks pass with `setup`, `onCommit`, and `operations.apply` | diff review |
| Diff review pass | complete | Fixed snapshot eagerness in the `onCommit` wrapper by keeping the internal listener arity 1 and exposing lazy `snapshot` | verification sweep |
| Verification sweep | complete | `bun check` passed in `../slate-v2`; targeted runtime contracts, package typechecks, `slate-react` vitest, lint fix, and solution capture completed | none |

## Ralph Execution Activation - 2026-05-18

The accepted planning verdict is now an implementation lane.

Completed owner:

- Public extension-slot API and type contract in `../slate-v2`.
- First-party migration in history, DOM, React, transaction, collab, and generic extension contracts.

TDD slice:

- Public behavior under test: extension authors can use `setup`, `onCommit`, and `operations.apply`; old public slot names are rejected by type contracts.
- Red proof: `bun test ./packages/slate/test/transaction-contract.ts --test-name-pattern "tx.apply routes through operations.apply"` failed because `seenOperations.length` stayed `0`.
- Green proof: core extension registration and first-party packages use the new slots; package typechecks pass.

Remaining required passes:

- `tdd-pass`: complete.
- Implementation hard cut: complete.
- `diff-review-pass`: complete.
- `verification-sweep-pass`: complete.

## Final Score

| Dimension | Score | Why |
| --- | ---: | --- |
| Slate-close DX | 0.92 | Target names map to Slate mental models: operation apply, commit callback, extension setup. |
| Architecture coherence | 0.93 | Operation, commit, and setup lifecycles stay distinct and match first-party history, DOM, React, and collab use. |
| Regression safety | 0.88 | Rename plan has clear Ralph proof requirements: public type tests, runtime tests, and first-party extension migration. |
| Migration backbone | 0.93 | History, DOM, React, and collab adapter uses prove the hooks are real and must survive the hard cut. |
| Research support | 0.9 | Lexical, ProseMirror, and Tiptap support lifecycle partitioning while Slate keeps product plugin bundles out. |
| Example quality | 0.92 | Example impact table now distinguishes direct slot-rename changes from broader feature-extension teaching cleanup. |

Overall: 0.92 ready.

## Next Action

No further autonomous work remains for this activation.
