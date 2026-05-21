# Slate V2 Normalizer Extension DX Ralplan

Status: done

Runtime id: `019e362b-c486-7372-84c1-1c04fef96ff6`

Completion file:
`.tmp/019e362b-c486-7372-84c1-1c04fef96ff6/completion-check.md`

Continuation file:
`.tmp/019e362b-c486-7372-84c1-1c04fef96ff6/continue.md`

Current pass: editor-node-normalizer-split, complete

Next pass: none

## Ralph Execution Grounding

Task statement: implement the accepted follow-up in `.tmp/slate-v2`: split
extension normalization into `normalizers.editor` for editor-root/value repair
and `normalizers.node` for non-root node repair, keep scoped normalizer `tx`,
migrate `forced-layout` off `WeakSet + commitListeners`, and prove
type/runtime, benchmark, browser, and broad gates.

Desired outcome: Slate v2 has one Slate-close extension authoring path for
normalization, with root/value repair separated from node-entry repair, no
public arbitrary normalizer ids, and first-party examples teaching normalization
instead of post-commit repair.

Known facts:

- `packages/slate/src/interfaces/editor.ts` exposes typed
  `normalizers.editor` and `normalizers.node` lanes.
- `packages/slate/src/core/editor-extension.ts` registers those lanes with
  extension-local internal ids.
- `packages/slate/src/core/normalize-node.ts` runs extension normalizers before
  fallback with `next(...)`.
- `site/examples/ts/forced-layout.tsx` now uses `normalizers.editor` instead of
  a module `WeakSet`, `register`, and `commitListeners`.
- `bench:core:normalization:compare:local` already compares current v2 against
  legacy `../slate` and writes `tmp/slate-normalization-compare-benchmark.json`.

Constraints:

- Do not add top-level `extension.normalizeNode`.
- Do not keep public arbitrary normalizer map keys.
- Do not expose full `EditorUpdateTransaction` in normalizer context.
- Do not claim new `Fixes` or `Improves` without exact proof.
- Keep Plate APIs and current slate-yjs adapters untouched.

Likely touchpoints:

- `.tmp/slate-v2/packages/slate/src/interfaces/editor.ts`
- `.tmp/slate-v2/packages/slate/src/core/editor-extension.ts`
- `.tmp/slate-v2/packages/slate/src/core/normalize-node.ts`
- `.tmp/slate-v2/packages/slate/test/normalization-contract.ts`
- `.tmp/slate-v2/packages/slate/test/public-surface-contract.ts`
- `.tmp/slate-v2/scripts/benchmarks/core/compare/normalization.mjs`
- `.tmp/slate-v2/site/examples/ts/forced-layout.tsx`

Execution state: active under Ralph as of 2026-05-17. Completion state is
`.tmp/019e362b-c486-7372-84c1-1c04fef96ff6/completion-check.md` and stays
`pending` until implementation, proofs, reference docs, and closeout pass
accounting are complete.

## Current Verdict

The current `forced-layout` example is bad DX. The module-level
`WeakSet<CustomEditor>` plus `commitListeners` repair loop teaches the wrong
model for document constraints. It looks like an app-level afterthought when
the feature is actually normalization policy.

The best target preserves the legacy Slate `normalizeNode` mental model without
reviving method monkeypatching, `with*` wrappers, or a second vocabulary beside
`transforms` and `queries`. The public authoring surface is:

- first-class `extension.normalizers.node(...)` for node normalization
- no top-level `extension.normalizeNode`
- no arbitrary public normalizer id map
- `tx` exposed in normalizer context so examples write through the current
  transaction, not nested `editor.update(...)`
- no global `WeakSet`, no post-commit repair listener, no wrapper composition
- extension-local internal registration keys, so two extensions can both define
  `normalizers.node` without overwriting each other

This is a public DX/API refinement, not a new schema DSL.

## Intent Boundary

| Field                | Decision                                                                                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Intent               | Make the forced-layout example teach the same mental model as Slate `normalizeNode`: document invariants are repaired during normalization.                                  |
| Desired outcome      | A later Ralph pass can replace `WeakSet + commitListeners` with a normalizer-shaped extension and add package/browser proof.                                                 |
| In scope             | `site/examples/ts/forced-layout.tsx`, extension normalizer authoring shape, normalizer context typing, public-surface contract cleanup, focused forced-layout browser proof. |
| Non-goals            | Reintroduce `editor.normalizeNode = ...`, resurrect `withForcedLayout`, invent a Plate-like schema DSL, claim issue fixes without exact proof.                               |
| Decision boundary    | Breaking changes are allowed if they simplify first-party Slate authoring and preserve full old-normalizer capability through typed extension hooks.                         |
| User decision needed | None for the plan direction. The chosen target is strong enough to hand to Ralph.                                                                                            |

Intent-boundary pass status: complete.

Evidence used:

- Live forced-layout source shows the public example currently teaches a
  module-level reentry guard and commit-listener repair loop.
- Live Slate v2 core already has typed ordered extension normalizers with
  `next(...)`, fallback delegation, cleanup, and fixpoint scheduling.
- The related issue pass found no fixed-issue claim that would require asking
  the user to choose between DX and closure.

Accepted boundaries:

- The target may use `extension.normalizers.node` as the authoring surface.
- The target may add `tx` to normalizer context.
- The target may register typed normalizer lanes by extension name plus lane
  through an internal id helper.
- The target may rewrite first-party examples and public-surface contracts.
- The target may break current internal extension shape if it improves Slate
  authoring and preserves normalizer capability.

Rejected boundaries:

- No legacy method override teaching path.
- No `with*` wrapper composition.
- No Plate-like required-root schema DSL in raw Slate.
- No generic empty-text factory unless a later pass proves it separately.
- No preflight schema-veto hook in this plan.
- No issue auto-close claim without exact package/browser proof.

Weakest-answer pressure test:

The only risky part is `tx` in normalizer context. Without `tx`, public examples
either use nested `editor.update(...)`, import internal transforms, or mutate
through a second API shape. That is exactly how the current bad example
happened. The plan therefore keeps `tx`, but requires Ralph to prove it does
not create unsafe recursion and that writes stay in the active transaction.

User question: none. The repo facts and the user's stated preference are enough:
the desired shape is closest to Slate normalization, named consistently as
`normalizers.node`, not closest to the current `commitListeners` repair loop.

## Source-Backed Current State

| Evidence                                                                               | Current shape                                                                     | Meaning                                                                  |
| -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `/Users/zbeyens/git/slate-v2/site/examples/ts/forced-layout.tsx:19`                    | `const ENFORCING_LAYOUT = new WeakSet<CustomEditor>()`                            | Reentry guard leaks engine concern into the public example.              |
| `/Users/zbeyens/git/slate-v2/site/examples/ts/forced-layout.tsx:34`                    | `enforceLayout(editor)` reads the whole value and plans repairs manually.         | This is normalization policy living outside the normalizer pipeline.     |
| `/Users/zbeyens/git/slate-v2/site/examples/ts/forced-layout.tsx:70`                    | Repairs run through `editor.update((tx) => ...)`.                                 | Fine for commands; weird as a post-commit normalizer substitute.         |
| `/Users/zbeyens/git/slate-v2/site/examples/ts/forced-layout.tsx:98`                    | `register({ editor })` runs `enforceLayout(editor)`.                              | Startup enforcement is hand-scheduled.                                   |
| `/Users/zbeyens/git/slate-v2/site/examples/ts/forced-layout.tsx:102`                   | `commitListeners: [() => enforceLayout(editor)]`                                  | This is after-commit repair, not normalization.                          |
| `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:1198`             | `EditorNormalizerArgs` carries `entry` plus normalize options.                    | The type substrate exists.                                               |
| `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:1207`             | normalizer context has `{ editor, next }`.                                        | Missing ergonomic `tx` for public normalizer writes.                     |
| `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:1297`             | extension registration output includes `commitListeners` and `normalizers`.       | The example picked the wrong slot for layout repair.                     |
| `/Users/zbeyens/git/slate-v2/packages/slate/src/interfaces/editor.ts:1320`             | top-level extension input includes `normalizers`.                                 | The existing public slot is map-shaped, not fixed-lane-shaped.           |
| `/Users/zbeyens/git/slate-v2/packages/slate/src/core/editor-extension.ts:421`          | normalizers register from `Object.entries(slots.normalizers ?? {})`.              | Existing registration is already wired.                                  |
| `/Users/zbeyens/git/slate-v2/packages/slate/src/core/extension-registry.ts:198`        | `registerNormalizer(editor, id, normalizer)` stores by raw id.                    | Map ids are global, so author-chosen names can collide.                  |
| `/Users/zbeyens/git/slate-v2/packages/slate/src/core/normalize-node.ts:433`            | runtime reads `getExtensionRegistry(editor).normalizers`.                         | Extension normalizers run in the real pipeline.                          |
| `/Users/zbeyens/git/slate-v2/packages/slate/src/core/normalize-node.ts:452`            | normalizer context delegates through `next(...)`.                                 | This already models legacy `normalizeNode` fallback.                     |
| `/Users/zbeyens/git/slate-v2/packages/slate/src/editor/normalize.ts:114`               | normalize loops until dirty entries reach fixpoint.                               | A normalizer can repair one thing and return; the engine reruns.         |
| `/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts:21`         | package test proves ordered extension normalizers before fallback.                | The lower-level mechanism is tested.                                     |
| `/Users/zbeyens/git/slate-v2/packages/slate/test/normalization-contract.ts:57`         | package test proves fallback override and cleanup.                                | The existing normalizer API is real, not speculative.                    |
| `/Users/zbeyens/git/slate-v2/packages/slate/test/public-surface-contract.ts:61`        | forced-layout is classified as a normalizer example.                              | The guard already says this should be a normalizer teaching surface.     |
| `/Users/zbeyens/git/slate-v2/playwright/integration/examples/forced-layout.test.ts:19` | browser test clears editor and expects `h2`/`p` to persist.                       | The behavior has a focused browser proof route.                          |
| `/Users/zbeyens/git/slate-v2/package.json:20`                                          | `bench:core:normalization:compare:local` exists.                                  | Ralph can compare Slate v2 core normalization against legacy `../slate`. |
| `/Users/zbeyens/git/slate-v2/scripts/benchmarks/core/compare/normalization.mjs:1`      | benchmark compares current repo and legacy repo, defaulting legacy to `../slate`. | The plan should reuse this lane, not create a new benchmark file.        |
| `/Users/zbeyens/git/slate-v2/scripts/benchmarks/core/compare/normalization.mjs:292`    | writes `tmp/slate-normalization-compare-benchmark.json`.                          | Legacy-normalizer proof has a stable artifact path.                      |
| `/Users/zbeyens/git/slate-v2/scripts/benchmarks/README.md:125`                         | lists `tmp/slate-normalization-compare-benchmark.json` as an artifact owner.      | The artifact name is already part of benchmark policy.                   |

Live diff note: `git -C /Users/zbeyens/git/slate-v2 diff -- site/examples/ts/forced-layout.tsx`
returned empty output. The bad DX is in the live file, not an uncommitted local
diff in that sibling checkout.

## Decision Brief

Principles:

- Slate users should recognize normalization immediately.
- Public examples must not teach hidden global guards for core engine policy.
- The extension model stays the single composition path.
- Public writes go through transaction APIs, not old `Transforms` globals.
- Normalizer lifecycle slots follow the same plural-bucket grammar as
  `transforms` and `queries`.

Top drivers:

- The example is first-party teaching material.
- Legacy Slate developers expect the normalization mental model, but the public
  shape should be consistent with `transforms` and `queries`.
- Current engine already has typed ordered normalizer middleware.
- Commit listeners are for observing commits, not enforcing document shape.
- Normalizer registration must be collision-safe across extensions.

Viable options:

| Option                                                                 | Verdict | Why                                                                                                                         |
| ---------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| Keep `WeakSet + commitListeners`                                       | reject  | It is the wrong mental model and makes normalization look like a userland polling loop.                                     |
| Rewrite example to `normalizers: { rootLayout(...) {} }`               | reject  | It uses the right engine, but arbitrary public rule ids create a registry-shaped API and force authors to invent names.     |
| Add top-level `normalizeNode(...)` sugar over the normalizer registry  | reject  | It is familiar, but it creates two extension grammars beside `transforms` and `queries`.                                    |
| Use `normalizers.node(...)` as the typed lifecycle slot                | choose  | It is closest to Slate's normalizer mental model while keeping extension authoring consistent and avoiding public rule ids. |
| Reintroduce `withForcedLayout(editor)` or `editor.normalizeNode = ...` | reject  | Two extension systems is worse DX and regresses the hard cut away from method override teaching.                            |
| Add a schema DSL for required root blocks                              | reject  | Too opinionated for raw Slate and too narrow for custom normalizers.                                                        |

Chosen target:

```ts
export type EditorNormalizerTransaction<V extends Value = Value> = Pick<
  EditorUpdateTransaction<V>,
  "break" | "fragment" | "marks" | "nodes" | "selection" | "text"
> & {
  value: Pick<EditorUpdateTransaction<V>["value"], "get">;
};

export type EditorNormalizerContext<TEditor extends BaseEditor<any> = Editor> =
  EditorNormalizerArgs<ValueOf<TEditor>> & {
    editor: TEditor;
    next: EditorNormalizerNext<EditorNormalizerArgs<ValueOf<TEditor>>>;
    tx: EditorNormalizerTransaction<ValueOf<TEditor>>;
  };

export type EditorNormalizerMiddlewareMap<
  TEditor extends BaseEditor<any> = Editor,
> = {
  node?: EditorNormalizer<TEditor>;
};

export type EditorExtension<TEditor extends BaseEditor<any> = Editor> = {
  name: string;
  normalizers?: EditorNormalizerMiddlewareMap<TEditor>;
  // other existing slots stay
};
```

Registration rule:

```ts
if (slots.normalizers?.node) {
  cleanups.push(
    registerNormalizer(
      editor,
      getExtensionSlotId(extension.name, "normalizers.node"),
      slots.normalizers.node,
    ),
  );
}
```

Consequence: extensions get one obvious public node-normalizer hook that matches
the existing plural-bucket style. Arbitrary normalizer ids disappear from the
public API. The internal id format is not documented.

## Before And After

Current forced-layout shape:

```ts
const ENFORCING_LAYOUT = new WeakSet<CustomEditor>();

const enforceLayout = (editor: CustomEditor) => {
  if (ENFORCING_LAYOUT.has(editor)) return;

  const children = editor.read((state) => state.value.get());
  // plan repairs...

  ENFORCING_LAYOUT.add(editor);
  try {
    editor.update((tx) => {
      // insert title, insert paragraph, set types
    });
  } finally {
    ENFORCING_LAYOUT.delete(editor);
  }
};

const forcedLayout = () =>
  defineEditorExtension<CustomEditor>()({
    name: "forced-layout",
    register({ editor }) {
      enforceLayout(editor);

      return {
        commitListeners: [() => enforceLayout(editor)],
      };
    },
  });
```

Target teaching shape:

```ts
const forcedLayout = () =>
  defineEditorExtension<CustomEditor>()({
    name: "forced-layout",
    normalizers: {
      node({ entry, next, tx }) {
        const [node, path] = entry;

        if (!NodeApi.isEditor(node) || path.length !== 0) {
          next();
          return;
        }

        const children = tx.value.get();
        const first = children[0];
        const second = children[1];
        const firstText = first ? NodeApi.string(first) : "";

        if (children.length <= 1 && firstText === "") {
          tx.nodes.insert(createTitle(), { at: [0], select: true });
          return;
        }

        if (children.length < 2) {
          tx.nodes.insert(createParagraph(), { at: [1] });
          return;
        }

        if (NodeApi.isElement(first) && first.type !== "title") {
          tx.nodes.set(setType("title"), { at: [0] });
          return;
        }

        if (NodeApi.isElement(second) && second.type !== "paragraph") {
          tx.nodes.set(setType("paragraph"), { at: [1] });
          return;
        }

        next();
      },
    },
  });
```

The important rule: one repair per normalizer invocation, then return. The
normalization loop reruns until fixpoint. That removes the need for the
`WeakSet`.

First-party usage should call the feature factory by feature name:

```ts
const editor = useSlateEditor({
  extensions: [forcedLayout()],
});
```

## Public API Target

- Replace public `normalizers?: EditorNormalizerMap<TEditor>` with
  `normalizers?: EditorNormalizerMiddlewareMap<TEditor>`.
- Add `normalizers.node?: EditorNormalizer<TEditor>` as the node-normalizer
  lifecycle slot.
- Add normalizer-scoped `tx` to `EditorNormalizerContext`.
- Keep `next(overrides?)` exactly once.
- Register `normalizers.node` by extension name plus typed lane through an
  internal helper, not a documented string format.
- Preserve extension latest-wins behavior at the extension name level.
- Teach `normalizers.node` as the normal node-normalizer authoring path.
- Do not expose arbitrary public normalizer ids such as `root`, `title`,
  `paragraph`, or `layout`.
- Do not expose recursive or bulk transaction controls on normalizer `tx`:
  `tx.normalize`, `tx.withoutNormalizing`, `tx.operations.replay`, and
  `tx.value.replace` stay unavailable in normalizers.
- Do not expose top-level `extension.normalizeNode`.
- Do not expose old `Editor.normalizeNode` as the public authoring path.
- Do not add `withForcedLayout`, `withNormalizers`, or wrapper composition.

## Internal Runtime Target

- `normalizers.node` registers into the existing normalizer pipeline.
- The registration id is generated internally from extension name plus
  `normalizers.node`.
- `tx` is a restricted facade over the active update view used by the
  normalization pass, not a nested `editor.update(...)`.
- Normalizer writes stay inside the current transaction and participate in the
  existing dirty-path/fixpoint loop.
- Full update APIs that can recurse, replay arbitrary ops, or replace the whole
  value stay out of normalizer context.
- Existing tests for ordered normalizers, fallback override, cleanup, and
  double `next()` stay green.

## React And Example Target

- `forced-layout.tsx` should import no reentry guard.
- It should not use `register(...)` or `commitListeners` for layout repair.
- It should not call `editor.update(...)` from normalizer code.
- It should keep the visible render behavior: one title and one paragraph.
- Public-surface tests should stop classifying forced-layout as a primitive
  write exception unless the contract explicitly permits `tx` writes inside
  `normalizers.node`.

## Migration Backbone

Plate pressure:

- Plate can map plugin-owned structural policy to `normalizers.node` without
  wrapper composition.
- Plate still owns opinionated schema presets. Raw Slate only supplies the
  generic normalization hook.

slate-yjs pressure:

- Normalizer repairs remain normal operations inside the transaction pipeline,
  which keeps history/collab metadata ownership outside the example.
- The plan does not claim remote convergence changes. It only requires that
  normalizer-generated operations stay within existing operation replay proof.

## Issue Ledger Accounting

No fixed issue claim in this pass.

Related issue discovery pass status: complete.

ClawSweeper mode: archive-first local ledger discovery. No broad live GitHub
search was run. The pass read the generated live ledger, v2 sync ledger, test
candidate maps, coverage matrix, fork dossier, and PR reference rows for
normalizer/`normalizeNode` candidates.

Discovery result:

- No issue should be newly claimed as fixed by this plan alone.
- `#4641` is the only direct implementation-pressure row for the Ralph slice.
- `#4701` and `#3275` are API/DX pressure, not closure claims.
- `#2039` is related debugging pressure but not solved by forced-layout DX.
- `#3950` and `#5811` are already accounted through prior normalization
  fixpoint work and should not be reopened by this example/API cleanup.

Reviewed issue surfaces:

| Issue | Cluster                                  | Current claim                    | Why                                                                                                                                                                                                                                               | Proof route                                                                                             |
| ----- | ---------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| #4641 | normalizeNode property updates           | Related, implementation-pressure | Live ledger title is directly about `normalizeNode`; test candidate map says ready with minor setup and expects property-update reproduction not to recur. The current v2 sync bucket is noisy, so the plan treats it as normalizer API pressure. | Add package proof in `normalization-contract.ts`; forced-layout browser row remains example proof only. |
| #4701 | hardcoded text node inside normalizeNode | Related, no `Fixes` claim        | Test candidate map says this is not a direct red-test target and reads as historical/example debt. The plan's `tx` normalizer context helps examples avoid hidden hardcoded repair policy, but does not prove the exact old complaint.            | Public API/type proof plus docs/example review; no auto-close.                                          |
| #3275 | normalizeNode path/entry shape           | Related, no `Fixes` claim        | Test candidate map classifies it as architecture/API-shape pressure. The chosen API keeps `entry` for Slate familiarity and explicit root checks, so it intentionally does not adopt "path only."                                                 | Decision brief, type tests, and maintainer objection row.                                               |
| #2039 | normalizer infinite loop errors          | Related, no `Fixes` claim        | Existing sync ledger says not claimed. The forced-layout cleanup removes the example's `WeakSet` smell but does not add named normalizer diagnostics.                                                                                             | Existing fixpoint guard proof only; future debug-label work would need separate scope.                  |
| #3950 | transformed-node rerun                   | Already fixed elsewhere          | Coverage matrix and fork dossier already claim custom normalization rechecks transformed nodes until later normalizers finish.                                                                                                                    | Leave existing `Fixes #3950` rows unchanged.                                                            |
| #5811 | normalization fixpoint/loop guard        | Already improved elsewhere       | Coverage matrix and fork dossier already claim deterministic fixpoint failure instead of runaway normalization budget.                                                                                                                            | Leave existing `Improves #5811` rows unchanged.                                                         |

Issue sync status:

- `docs/slate-issues/gitcrawl-live-open-ledger.md` read for current live rows.
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md` read for current manual
  classifications.
- `docs/slate-issues/open-issues-ledger.md` read for normalization/API cluster
  rows.
- `docs/slate-issues/gitcrawl-clusters.md` and
  `docs/slate-issues/issue-clusters.md` read for cluster-level normalization
  pressure.
- `docs/slate-issues/test-candidate-map/` read for candidate proof rows.
- `docs/slate-issues/benchmark-candidate-map.md` read for performance
  normalization pressure.
- `docs/slate-issues/package-impact-matrix.md` and
  `docs/slate-issues/requirements-from-issues.md` read for package ownership
  and requirements pressure.
- `docs/slate-v2/ledgers/issue-coverage-matrix.md` read for existing `#3950`
  and `#5811` claims.
- `docs/slate-v2/ledgers/fork-issue-dossier.md` read for existing `#3950` and
  `#5811` long-form sections.
- No manual ledger rows changed in this pass; pass 11 remains the formal issue
  sync accounting owner if the accepted implementation changes claim text.

Full issue-ledger pass status: complete.

Wider corpus classifications:

| Issue / cluster                                   | Claim for this plan                 | Why                                                                                                                                                                       | Proof / owner                                                     |
| ------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| normalization-reentrancy-and-plugin-composability | Improves architecture pressure only | Removing example-local `WeakSet` and adding collision-safe normalizer registration directly answers plugin-composability pressure, but no exact issue closure exists yet. | Ralph package tests for normalizer id namespacing and cleanup.    |
| normalization-and-structural-transform-contracts  | Related                             | The plan keeps normalization in the engine pipeline and does not change structural transform semantics.                                                                   | Existing structural normalization rows stay owned by prior plans. |
| #3465 initial-value normalization                 | Not claimed                         | Forced-layout startup behavior is an example policy. It does not make full-document initial value normalization/default-root policy a core feature.                       | Existing issue coverage matrix already marks #3465 not claimed.   |
| #2643 schema veto                                 | Not claimed                         | Node normalization repairs after mutation. It is not a preflight validation/veto hook.                                                                                    | Existing coverage matrix keeps #2643 related to validation work.  |
| #2405 command-scoped schema rules                 | Related                             | Dirty-path/fixpoint scheduling pressure is relevant, but adding `normalizers.node` does not prove command-scoped rule evaluation.                                         | Existing #2405 related row remains.                               |
| #2195 skip text nodes in dirty tracking           | Related                             | The plan should avoid adding after-every-commit repair loops, but it does not benchmark dirty-path tracking.                                                              | Existing #2195 related row remains.                               |
| #2355 selection normalization                     | Not claimed                         | The plan normalizes document nodes only. It does not add selection normalization.                                                                                         | Existing #2355 related row remains.                               |
| #3430 inline-heavy normalization freeze           | Not claimed                         | The plan names one forced-layout browser row, not an inline-heavy perf/browser repro.                                                                                     | Existing #3430 not-claimed row remains.                           |
| #4701 custom empty text-node factory              | Related                             | `tx` in normalizer context improves authoring, but the plan does not add a generic empty-text factory.                                                                    | Public API docs/example proof only.                               |
| #3275 path-only normalizeNode                     | Rejected alternative                | The plan keeps `entry` because Slate normalizers often need node plus path and current v2 already uses `entry`.                                                           | Decision brief and type tests.                                    |

PR reference status: unchanged in this pass. The accepted API shape is planned,
not implemented, and no fixed issue claim changed.

## Regression Proof Matrix

| Surface                      | Required proof                                                                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type shape                   | Negative and positive type tests prove `normalizers.node` gets `tx`, `entry`, `next`, and typed custom editor value.                                    |
| Public normalizer shape      | Type tests reject arbitrary normalizer map keys and top-level `normalizeNode`.                                                                          |
| Registration order           | Test proves extension `normalizers.node` runs before built-in fallback.                                                                                 |
| Registration collision       | Test proves two extensions can both define `normalizers.node` without overwriting.                                                                      |
| Normalizer transaction scope | Negative type tests reject `tx.normalize`, `tx.withoutNormalizing`, `tx.operations.replay`, and `tx.value.replace` inside `normalizers.node`.           |
| Double next                  | Existing double `next()` rejection still applies to `normalizers.node`.                                                                                 |
| Cleanup                      | Unextending removes the extension's node normalizer.                                                                                                    |
| Forced layout package test   | Add core or site-adjacent test proving root title/paragraph repair uses normalizer loop without `commitListeners`.                                      |
| Public-surface contract      | Grep/contract rejects `ENFORCING_LAYOUT`, `WeakSet<CustomEditor>`, and forced-layout commit-listener layout repair.                                     |
| Legacy normalizer benchmark  | `bench:core:normalization:compare:local` compares v2 to legacy `../slate` and writes `tmp/slate-normalization-compare-benchmark.json`.                  |
| Custom normalizer benchmark  | Compare legacy `editor.normalizeNode` override against v2 `normalizers.node` no-op dispatch and v2 `normalizers.editor` forced-layout one-repair lanes. |
| Browser                      | `forced-layout` route still keeps exactly one `h2` and one `p` after full editor clear.                                                                 |
| Broad gate                   | Package typecheck plus focused tests, then `bun check` when Ralph implementation closes.                                                                |

## Browser Stress And Parity Strategy

Focused browser row:

```bash
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun x playwright test playwright/integration/examples/forced-layout.test.ts --project=chromium
```

Run from cwd:

```txt
/Users/zbeyens/git/slate-v2
```

No broader browser matrix is required for the plan itself. If Ralph touches the
normalizer engine, the implementation closeout should also run the package
normalization tests and the broad `bun check` gate from `.tmp/slate-v2`.

## Performance Review And Legacy Normalizer Benchmark

Performance applicability: applied.

Why this is not optional: changing the extension normalizer shape can make
normalization look cleaner while quietly adding middleware dispatch, transaction
facade, or id lookup overhead. That would be a bad trade.

Vercel micro-rules used:

- `js-early-exit`: normalizers must exit fast for non-root entries.
- `js-set-map-lookups`: internal lane lookup must stay keyed, not scan-based.
- `js-cache-property-access`: hot-path normalizer dispatch should avoid repeated
  deep reads where a local binding is enough.

Performance rules used:

- cohort segmentation
- repeated-unit budget
- interaction INP matrix as lab-proxy discipline
- memory and DOM tagging

Repeated unit:

- dirty node entry visited by normalization
- extension node-normalizer dispatch
- transaction-facade write during one repair

Cohorts:

| Cohort | Benchmark config                                                                                                            | Meaning                                                                                                                           |
| ------ | --------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| normal | `NORMALIZATION_BENCH_EXPLICIT_BLOCKS=250`, `NORMALIZATION_BENCH_INSERT_BLOCKS=500`, `NORMALIZATION_BENCH_INSERT_OPS=50`     | Default local proof and current script default.                                                                                   |
| medium | `NORMALIZATION_BENCH_EXPLICIT_BLOCKS=1000`, `NORMALIZATION_BENCH_INSERT_BLOCKS=2000`, `NORMALIZATION_BENCH_INSERT_OPS=200`  | Required implementation closeout.                                                                                                 |
| large  | `NORMALIZATION_BENCH_EXPLICIT_BLOCKS=5000`, `NORMALIZATION_BENCH_INSERT_BLOCKS=10000`, `NORMALIZATION_BENCH_INSERT_OPS=500` | Required if implementation touches normalization scheduling, dirty-entry queues, or extension registry internals beyond this API. |

Benchmark owner:

- Reuse `scripts/benchmarks/core/compare/normalization.mjs`.
- Extend that file if needed; do not create a new benchmark file unless this
  lane cannot express the decision.
- Keep artifact output at `tmp/slate-normalization-compare-benchmark.json`.

Required legacy-compare command, cwd `/Users/zbeyens/git/slate-v2`:

```bash
bun run bench:core:normalization:compare:local
```

Required medium cohort command, cwd `/Users/zbeyens/git/slate-v2`:

```bash
NORMALIZATION_BENCH_ITERATIONS=7 NORMALIZATION_BENCH_EXPLICIT_BLOCKS=1000 NORMALIZATION_BENCH_INSERT_BLOCKS=2000 NORMALIZATION_BENCH_INSERT_OPS=200 bun run bench:core:normalization:compare:local
```

Custom normalizer lane requirement:

- Add or extend a compare lane that measures legacy
  `editor.normalizeNode = (entry) => { ...; normalizeNode(entry) }` against v2
  `normalizers.node({ entry, next, tx })`.
- Include a no-op pass-through normalizer lane to measure dispatch overhead.
- Include a forced-layout one-repair lane to measure the real planned example.
- Keep the benchmark cross-repo: current v2 against `../slate` legacy.

Acceptance budget:

| Metric                                  | Gate                                                                                                       |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `explicitAdjacentTextNormalizeMs.mean`  | v2 must be no slower than legacy by more than 5% or 0.25ms, whichever is larger.                           |
| `explicitInlineFlattenNormalizeMs.mean` | v2 must be no slower than legacy by more than 5% or 0.25ms, whichever is larger.                           |
| custom no-op normalizer dispatch        | v2 overhead must stay below 5% of the built-in explicit-normalize lane.                                    |
| custom forced-layout repair             | v2 must be no slower than equivalent legacy `normalizeNode` override by more than 5% or 0.25ms.            |
| `insertTextReadAfterEachMs.mean`        | diagnostic only against legacy, but hard no-regression against the pre-change v2 artifact by more than 5%. |

Memory and DOM tags:

- No DOM tag is expected for the core normalization compare.
- Record heap delta if the compare harness exposes it.
- For the forced-layout browser proof, record visible `h2`/`p` counts and
  confirm no post-commit repair loop is mounted.

Plan delta:

- The implementation is not Ralph-complete until the legacy normalizer compare
  artifact is produced and summarized.
- If the existing v2 baseline already loses one diagnostic lane to legacy, do
  not hide it. Record it, prove this change did not worsen it, and open a
  separate performance follow-up if needed.

## Implementation Review Matrix

| Lens                 | Status  | Finding                                                                                                                                                                                                     | Plan delta                                                                                                                                          |
| -------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| React best practices | skipped | No React subscription or rendering API changes are proposed.                                                                                                                                                | Browser proof remains focused on example behavior.                                                                                                  |
| performance-oracle   | applied | `commitListeners` repair can run after every commit. Normalizer dirty-path/fixpoint scheduling is the right hot-path owner.                                                                                 | Move layout repair into normalizer pipeline and one-repair-per-pass style.                                                                          |
| performance          | applied | The existing `bench:core:normalization:compare:local` lane compares current Slate v2 normalization to legacy `../slate`, but the plan must add a custom normalizer lane for the new extension API overhead. | Add legacy normalizer compare gates, medium cohort config, custom no-op dispatch lane, forced-layout repair lane, and artifact summary requirement. |
| tdd                  | applied | Public API and example behavior need regression tests before implementation close.                                                                                                                          | Add type/runtime normalizer tests plus forced-layout browser proof.                                                                                 |
| shadcn               | skipped | No UI component composition change.                                                                                                                                                                         | None.                                                                                                                                               |
| react-useeffect      | skipped | No effects are involved.                                                                                                                                                                                    | None.                                                                                                                                               |

## Pressure Pass Results

Pressure-passes status: complete.

| Lens                   | Verdict                    | Evidence                                                                                                                                                                                                                                                                            | Plan delta                                                                                                                                               |
| ---------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Performance            | pass with benchmark gate   | Live forced-layout uses a commit listener that can run after every commit; live Slate v2 normalizers already run inside transaction closeout and dirty-path/fixpoint scheduling; live benchmark scripts include `bench:core:normalization:compare:local` against legacy `../slate`. | Keep one-repair-per-normalize style; require no nested update, no post-commit repair proof, and legacy normalizer compare artifact before Ralph closure. |
| DX                     | pass after rename          | The Slate concept is normalization, but the best extension grammar is consistent with `transforms` and `queries`. Generic `layout()` is too vague for a first-party example.                                                                                                        | Rename the teaching factory to `forcedLayout()`; teach `normalizers.node` as the public path.                                                            |
| Unopinionated core     | pass                       | The target adds a generic normalizer hook only. It does not add required-root schema policy, empty-text factories, Plate presets, or product command catalogs.                                                                                                                      | Keep schema DSL and validation/veto hooks out of this plan.                                                                                              |
| Plate migration        | pass                       | Plate already proves typed product-layer plugin registries and `editor.api`; raw Slate should supply extension hooks and let Plate map plugin policy onto them.                                                                                                                     | Keep raw Slate naming `extensions`; do not import Plate `plugins` vocabulary into core.                                                                  |
| slate-yjs migration    | pass with no closure claim | Live slate-yjs still patches `editor.apply`, `editor.onChange`, `Editor.withoutNormalizing`, and `editor.normalizeNode`; remote events replay operations and then normalize.                                                                                                        | Require normalizer repairs to be ordinary transaction operations with metadata; do not claim current slate-yjs adapter support.                          |
| Regression             | pass with stricter order   | Existing tests cover normalizer order, fallback override, cleanup, and double `next`; forced-layout has a focused browser row.                                                                                                                                                      | Add tests for `normalizers.editor` / `normalizers.node` with `tx`, then typed-lane collision/latest-wins tests, then forced-layout browser proof.        |
| Verification workspace | pass for planning          | Live source reads came from `/Users/zbeyens/git/slate-v2`; no Slate v2 command was run because this skill is planning-only.                                                                                                                                                         | Keep implementation verification in the Ralph phase.                                                                                                     |
| Research               | pass                       | The compiled Lexical/ProseMirror/Tiptap corpus now drives concrete keep/reject/borrow rows.                                                                                                                                                                                         | No new research page needed.                                                                                                                             |
| Simplicity             | pass                       | The smallest API that fixes the DX is one typed lifecycle slot plus `tx` in context and internal typed-lane ids.                                                                                                                                                                    | Do not add aliases, wrapper helpers, schema shortcuts, or a second extension composition path.                                                           |

Hard pressure verdict:

- `tx` is still the right target, but only if Ralph proves it is the active
  update view created during normalization. A fake `tx` or nested update is a
  regression dressed as DX.
- `normalizeNode` and arbitrary normalizer maps are rejected as public
  authoring paths. Docs and examples should use `normalizers.node`.
- `forcedLayout()` is better than `layout()` because examples teach naming
  conventions. Generic names look small but age badly.
- The plan still must not claim slate-yjs convergence. It only gives slate-yjs
  a sane future migration backbone.

## Maintainer Objection Ledger

| Objection                                                            | Answer                                                                                                                                                                                                      | Verdict                       |
| -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| "Why not add top-level `normalizeNode` because Slate users know it?" | Because extension objects already use plural buckets like `transforms` and `queries`. `normalizers.node` keeps the Slate mental model without creating a one-off lifecycle spelling.                        | reject sugar, keep typed lane |
| "Does `tx` in normalizers make normalizers too powerful?"            | Full update `tx` would be too powerful. Keep the `tx` name, but expose a normalizer-scoped transaction facade without recursive normalize, replay, disable-normalizing, or whole-document replace controls. | revise                        |
| "Could this create hidden infinite loops?"                           | The existing fixpoint loop and double-next guard remain. The example must mutate once and return.                                                                                                           | handled by tests              |
| "Why not keep `commitListeners` for simplicity?"                     | Commit listeners observe commits. Using them for structural repair means every app author learns the wrong primitive.                                                                                       | reject                        |
| "Why not make a required-root schema option?"                        | Raw Slate should not own that product policy. `normalizers.node` covers title/paragraph, code blocks, embeds, tables, and app-specific rules.                                                               | reject                        |
| "Why not keep arbitrary named normalizers?"                          | They make the API look like a registry of user-invented ids. A fixed `node` lane is clearer now; add future lanes only when they are real.                                                                  | reject public ids             |

## Steelman Challenge Ledger

Steelman pass status: complete.

| Decision                                   | Strongest fair objection                                                                                    | Antithesis                                                           | Revision / answer                                                                                                                                                                | Proof required                                                                                                     | Verdict |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------- |
| Use `normalizers.node`                     | `normalizeNode` is more familiar to legacy Slate users.                                                     | Add top-level `normalizeNode` sugar.                                 | Familiarity loses to consistency here. `normalizers.node` still reads as normalization, aligns with `transforms`/`queries`, and avoids two public spellings for one lifecycle.   | Type/runtime test for `normalizers.node`; negative type test rejects top-level `normalizeNode` and arbitrary keys. | keep    |
| Put `tx` in normalizer context             | Full `EditorUpdateTransaction` gives normalizers dangerous powers and makes recursive normalization easier. | Keep `{ editor, entry, next }` and make users call lower-level APIs. | Revise to a normalizer-scoped `tx` facade. It keeps Slate-like transform ergonomics without exposing `normalize`, `withoutNormalizing`, `operations.replay`, or `value.replace`. | Positive tests for normalizer writes; negative type tests for forbidden members; runtime proof no nested update.   | revise  |
| Remove arbitrary public normalizer ids     | A future extension might want several node rules under different names.                                     | Keep the current map and namespace ids internally.                   | Split rules inside `normalizers.node` or use multiple extensions. Public arbitrary ids are not worth the DX tax.                                                                 | Collision test with two extensions both defining `normalizers.node`; cleanup test.                                 | keep    |
| Rename example factory to `forcedLayout()` | Naming polish is not architecture.                                                                          | Leave `layout()` and focus on engine API.                            | First-party examples teach conventions. `forcedLayout()` is clearer and matches lower-case extension factory style without adding API surface.                                   | Example compile and forced-layout browser row.                                                                     | keep    |
| Cut commit-listener repair                 | Commit listener is easy to reason about and already works.                                                  | Keep it to avoid touching core normalizer API.                       | It works by teaching the wrong owner. Layout invariants belong in normalization, not after every commit.                                                                         | Public-surface contract rejects guard/listener repair; browser row stays green.                                    | keep    |

## High-Risk Deliberate Pass

High-risk pass status: complete.

Trigger: this changes public extension API, normalizer runtime behavior, example
teaching surface, and migration backbone expectations for plugin and
collaboration authors.

Blast radius:

| Area                     | Risk                                                                                                                                                             |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/slate` types   | `EditorExtension.normalizers.node`, `EditorExtensionRegistrationOutput`, `EditorNormalizerContext`, and the new normalizer transaction facade become public API. |
| `packages/slate` runtime | Extension registration, normalizer ordering, cleanup, and active transaction facade creation can change normalization behavior.                                  |
| Tests                    | Normalization contracts, extension install contracts, public-surface contracts, and type-only negative tests must move together.                                 |
| Examples                 | `site/examples/ts/forced-layout.tsx` changes the teaching path from post-commit repair to normalizer repair.                                                     |
| Downstream authors       | Plate/plugin authors need a stable extension-normalizer route; slate-yjs/collab authors need normalizer writes to remain ordinary transaction operations.        |

Pre-mortem:

| Failure scenario                                              | How it would show up                                                                                                                                                 | Required guard                                                                                                |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Normalizer `tx` leaks full update power                       | A normalizer calls `tx.normalize`, `tx.withoutNormalizing`, `tx.operations.replay`, or `tx.value.replace`, causing recursion or impossible-to-reason repair batches. | Normalizer-scoped facade plus negative type tests for forbidden members.                                      |
| Typed normalizer-lane registration breaks order or cleanup    | Two extensions defining `normalizers.node` overwrite each other, or unextend leaves a stale rule installed.                                                          | Collision, order, latest-wins, and cleanup tests across extensions.                                           |
| Forced-layout browser behavior regresses                      | Clearing the editor no longer restores one title plus one paragraph, or selection jumps after normalizer repair.                                                     | Focused forced-layout Playwright row after package tests.                                                     |
| History/collab metadata gets smeared                          | Normalizer-generated operations are hidden from commit/history/collab consumers or tagged as a separate nested update.                                               | Runtime test proving no nested `editor.update` and operations stay in the outer normalization transaction.    |
| Extension normalizer dispatch is slower than legacy overrides | The new API looks nicer but adds measurable overhead versus legacy `editor.normalizeNode`.                                                                           | Legacy compare artifact with custom no-op and forced-layout normalizer lanes; medium cohort must pass budget. |

Expanded proof plan:

| Proof lane         | Required evidence                                                                                                                                                                                                            |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit               | `packages/slate/test/normalization-contract.ts` covers `normalizers.node`, fallback delegation, double-next, cleanup, extension-lane collisions, and one-repair reruns.                                                      |
| Type               | Negative type tests reject forbidden normalizer `tx` members, arbitrary normalizer keys, and top-level `normalizeNode`; positive tests prove custom editor value inference survives `defineEditorExtension<CustomEditor>()`. |
| Integration        | Public-surface contract rejects `ENFORCING_LAYOUT`, forced-layout commit-listener repair, and legacy `editor.normalizeNode = ...` teaching in the example.                                                                   |
| Browser            | Forced-layout Playwright row verifies clear-editor recovery, visible `h2`/`p`, and follow-up typing.                                                                                                                         |
| Migration/adoption | Docs/example notes teach `normalizers.node` and explicitly avoid current slate-yjs support claims.                                                                                                                           |
| Performance        | `bench:core:normalization:compare:local` plus medium cohort and custom normalizer lanes prove v2 normalizer API overhead against legacy `editor.normalizeNode`.                                                              |

Rollback / hard-cut answer:

- Keep the hard cut away from `WeakSet + commitListeners`; it teaches the wrong
  runtime owner.
- If normalizer-scoped `tx` cannot be implemented safely, fall back to
  `normalizers.node({ editor, entry, next })` and do not ship nested update
  examples.
- If typed normalizer-lane registration creates runtime churn, keep the
  internal helper but document only `normalizers.node`.

High-risk verdict: keep with the scoped-`tx` revision and proof gates above.

## Ecosystem Maintainer Pass

Ecosystem maintainer pass status: complete.

Trigger: this proposal changes extension authoring, normalizer registration,
normalization writes, example behavior, and the migration backbone for plugin
and collaboration authors.

| Triggered surface                             | Plate/plugin maintainer answer                                                                                                                                                                                                                   | slate-yjs/collab maintainer answer                                                                                                                                          | Proof required before closure                                                                                                                            | Verdict                 |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| `EditorExtension.normalizers.node`            | Plate can map plugin-owned structural policy to raw Slate node normalization without wrapping every core call. Plate keeps `plugins`, `editor.api`, `editor.tf`, `getApi`, options, and product presets. Raw Slate only adds the lifecycle hook. | Collab adapters do not need arbitrary rule ids. They need the produced operations to be ordinary normalization operations.                                                  | Type test with a custom extension, runtime test proving `normalizers.node` composes with fallback, and no Plate API edits.                               | keep                    |
| Normalizer-scoped `tx`                        | Product plugins get transaction ergonomics without importing legacy global transforms or nesting `editor.update(...)` inside a rule. The restricted facade avoids becoming a second Plate transform registry.                                    | Normalizer repairs must be emitted inside the outer normalization transaction. No hidden update, no replay, no whole-value replace, no dropped metadata.                    | Runtime proof that normalizer writes are in the outer batch; negative type tests for forbidden `tx` members; history/collab metadata row stays explicit. | keep with scoped facade |
| Internal typed-lane normalizer ids            | Plate and plugin authors do not have to invent names like `root` or `layout`. Latest extension still wins by extension name.                                                                                                                     | Deterministic registration order and cleanup matter for replay. Internal ids must not reorder rules or leave stale normalizers after unextend.                              | Collision test for two `normalizers.node` extensions, order test, latest-wins test, and cleanup test.                                                    | keep                    |
| Forced-layout hard cut from `commitListeners` | Plate does not need to mirror the bad example. A product layer can put layout policy in a plugin/extension normalizer and keep React UI/render ownership elsewhere.                                                                              | The plan makes no current slate-yjs support promise. It only requires that layout repair is observable as normal Slate operations if a future adapter watches transactions. | Public-surface grep for no `WeakSet` or commit-listener repair, plus focused forced-layout browser proof.                                                | keep                    |

Affected extension points:

- `EditorExtension.normalizers.node`
- `EditorExtensionRegistrationOutput`
- `EditorNormalizerContext`
- internal normalizer registration ids
- normalization transaction closeout

Plugin migration-backbone surface:

- Raw Slate stays `extensions: [forcedLayout()]`.
- Plate can map a product plugin's structural policy to a Slate extension
  normalizer.
- Plate keeps `plugins`, typed plugin options, `editor.api`, `editor.tf`, and
  `getApi(...)` as product-layer APIs.
- No Plate adapter, Plate API rename, or Plate registry change is required by
  this planning slice.

Collab contract affected:

- Normalizer-generated repairs must be regular transaction operations.
- Repairs must not be produced by nested `editor.update(...)`.
- Repairs must not use `tx.operations.replay` or `tx.value.replace`.
- Metadata and selection behavior must stay attached to the outer update.
- Current slate-yjs wrappers are pressure evidence only; this plan does not
  claim current adapter closure.

Ecosystem verdict: keep. The plan is stronger with the scoped `tx`, internal id
helper, and explicit no-adapter-support claim. The main closure blocker is
runtime proof that normalizer writes stay in the outer transaction.

## Ecosystem Strategy Synthesis

| Reference     | Observed mechanism                                                                                                                                                         | Slate target                                                                                                                                              | Verdict                                   |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Legacy Slate  | Plugins override `editor.normalizeNode(entry)` and call the captured handler as fallback. slate-yjs examples still show this exact pattern.                                | Keep the normalization fallback mental model, but express it as `defineEditorExtension({ normalizers: { node(...) {} } })`.                               | steal mental model, reject monkeypatching |
| Live Slate v2 | Extension `normalizers` already run before fallback with `next(...)`, cleanup, ordered chaining, dirty-path/fixpoint scheduling, and package tests.                        | Replace the arbitrary map-shaped public slot with a typed `normalizers.node` lifecycle lane.                                                              | build on existing substrate               |
| Lexical       | `editor.update` is the mutation boundary, `editor.read` is the coherent read boundary, and extensions register behavior without root method override DX.                   | Normalizer writes should use the active transaction view; do not teach nested `editor.update(...)` or wrapper composition.                                | steal lifecycle discipline                |
| ProseMirror   | Transactions own document, selection, metadata, and DOM selection discipline; view/input owns DOM import/export.                                                           | Structural repair belongs in the editor transaction/normalization pipeline, not post-commit observation or React effects.                                 | steal transaction ownership               |
| Tiptap        | Product DX comes from lowercase extension factories and declarative extension objects bundling behavior, commands, events, and React UI.                                   | Keep `forcedLayout()` as a lowercase extension factory with `defineEditorExtension({ normalizers: { node(...) {} } })`.                                   | steal packaging DX                        |
| Plate         | `SlateEditor` already proves typed plugin registries, `editor.api`, `editor.tf`, `getApi`, and plugin-key inference are valuable at the product layer.                     | Raw Slate should reserve `extensions` and stay smaller: lifecycle plus extension namespaces. Do not copy Plate's full plugin registry into core.          | borrow pressure, keep boundary            |
| slate-yjs     | Current adapters patch `editor.apply`, `editor.onChange`, `Editor.withoutNormalizing`, and `editor.normalizeNode`; remote events replay ops into Slate and then normalize. | Normalizer-generated repairs must remain ordinary transaction operations with metadata so future adapters can observe/replay them without wrapper stacks. | migration pressure, no closure claim      |

Research/ecosystem live-source refresh pass status: complete.

Evidence used:

- `docs/research/sources/editor-architecture/read-update-runtime-corpus-ledger.md`
  marks Lexical, ProseMirror, and Tiptap as evidenced, with no raw or compile
  gap for this scoped question.
- `docs/research/sources/editor-architecture/lexical-read-update-extension-runtime.md`
  supports read/update lifecycle, update tags, dirty scheduling, and extension
  dependency ideas.
- `docs/research/sources/editor-architecture/prosemirror-transaction-view-dom-runtime.md`
  supports transaction ownership, selection mapping/bookmarks, centralized DOM
  bridge ownership, and decorations as view data.
- `docs/research/sources/editor-architecture/tiptap-extension-command-react-dx.md`
  supports extension packaging, command discoverability, selector posture, and
  optional chain sugar.
- `docs/research/decisions/slate-v2-state-tx-public-api-and-extension-namespaces.md`
  is the current authority for `state` / `tx` public naming and extension
  namespaces.
- Live Slate v2 source confirms `EditorNormalizerContext` currently has
  `{ editor, next }`, extension inputs expose `normalizers`, registration uses
  raw normalizer ids, and forced-layout currently uses `WeakSet` plus
  `commitListeners`.
- Live Plate source confirms product-layer plugin inference and `editor.api`
  belong to Plate pressure, not raw Slate core naming.
- Live slate-yjs source confirms current wrapper pressure around
  `withYjs`, `withYHistory`, `Editor.withoutNormalizing`, `editor.apply`, and
  `editor.normalizeNode`.

No research wiki page changed in this pass. Maintain mode found accepted
compiled pages that already answer this scoped API question; the stale artifact
was this plan's synthesis, not the research layer.

## Hard Cuts

- Cut `ENFORCING_LAYOUT`.
- Cut `commitListeners` from forced-layout.
- Cut `register({ editor })` for initial layout repair.
- Cut nested `editor.update(...)` from public normalizer example code.
- Cut global normalizer ids that let same-key map entries overwrite across
  extensions.
- Cut top-level `extension.normalizeNode`.
- Cut arbitrary public normalizer map keys.
- Keep `commitListeners` as a separate extension slot for observers.
- Keep `normalizers.node` as the public node-normalizer lane.

## Implementation Phases

1. Core type/API phase, owner Ralph:

   - Add `normalizers.node` to `EditorExtension` and registration output.
   - Remove public arbitrary normalizer map keys.
   - Add normalizer-scoped `tx` to `EditorNormalizerContext`.
   - Register the typed node-normalizer lane by extension name through an
     internal helper.
   - Add type/runtime tests.

2. Example phase, owner Ralph:

   - Rewrite `forced-layout.tsx` to
     `normalizers.node({ entry, tx, next })`.
   - Remove `ENFORCING_LAYOUT`, `enforceLayout`, `register`, and
     `commitListeners`.
   - Keep visible title/paragraph behavior unchanged.

3. Public-surface phase, owner Ralph:

   - Update `public-surface-contract.ts` classification.
   - Add grep/contract coverage for no forced-layout guard or commit-listener
     repair.

4. Verification phase, owner Ralph:
   - Run focused package tests.
   - Run legacy normalizer compare benchmark.
   - Run forced-layout Playwright row.
   - Run package typecheck and broad gate named by implementation impact.

## Fast Driver Gates

Planning artifact check, cwd `/Users/zbeyens/git/plate-2`:

```bash
node tooling/scripts/completion-check.mjs
```

Expected while this plan is pending: fail with the scoped completion file named.
That is correct until closure/final-gates pass.

Implementation gates, cwd `/Users/zbeyens/git/slate-v2`:

```bash
bun test ./packages/slate/test/normalization-contract.ts
```

```bash
bun test ./packages/slate/test/public-surface-contract.ts
```

```bash
bun run bench:core:normalization:compare:local
```

```bash
NORMALIZATION_BENCH_ITERATIONS=7 NORMALIZATION_BENCH_EXPLICIT_BLOCKS=1000 NORMALIZATION_BENCH_INSERT_BLOCKS=2000 NORMALIZATION_BENCH_INSERT_OPS=200 bun run bench:core:normalization:compare:local
```

```bash
PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun x playwright test playwright/integration/examples/forced-layout.test.ts --project=chromium
```

```bash
bun check
```

## Ralph Execution Results - 2026-05-17

Implemented in `/Users/zbeyens/git/slate-v2`:

- `EditorExtension.normalizers.editor` and `EditorExtension.normalizers.node`
  replaced arbitrary public normalizer map keys.
- `defineEditorExtension(...)` now rejects extra top-level extension keys, so
  direct `normalizeNode` and `commands` slots fail at the helper boundary.
- Normalizer context now exposes scoped `tx` with core repair APIs and
  `value.get()`.
- Extension normalizer registration uses extension-local internal ids like
  `name:normalizers.editor` and `name:normalizers.node`.
- `forced-layout` now uses `normalizers.editor({ next, tx })` and no longer
  uses `WeakSet`, startup `register` repair, `commitListeners`, or nested
  `editor.update(...)`.
- The normalization compare benchmark includes v2 `normalizers.node` for
  no-op dispatch and v2 `normalizers.editor` for forced-layout repair versus
  legacy `editor.normalizeNode` override lanes.

Proof completed before closeout:

- `bun test ./packages/slate/test/normalization-contract.ts` passed.
- `bun test ./packages/slate/test/normalization-contract.ts ./packages/slate/test/public-surface-contract.ts` passed.
- `bun --filter slate typecheck` passed.
- `bun typecheck:site` passed.
- `bun typecheck:root` passed.
- `bun lint:fix` passed and fixed formatting/imports needed by the current
  Slate v2 checkout.
- `bun run bench:core:normalization:compare:local` passed with v2 faster than
  legacy on explicit normalization and no-op normalizer dispatch; forced-layout
  repair measured `0.03ms` per repair versus legacy `0.02ms`, delta `+0.01ms`,
  inside the accepted absolute budget.
- `NORMALIZATION_BENCH_ITERATIONS=7 NORMALIZATION_BENCH_EXPLICIT_BLOCKS=1000 NORMALIZATION_BENCH_INSERT_BLOCKS=2000 NORMALIZATION_BENCH_INSERT_OPS=200 bun run bench:core:normalization:compare:local`
  passed; medium cohort kept v2 faster than legacy on explicit normalization
  and no-op normalizer dispatch, while forced-layout repair stayed within the
  accepted absolute budget at delta `+0.01ms`.
- `PLAYWRIGHT_RETRIES=0 PLAYWRIGHT_WORKERS=1 bun x playwright test playwright/integration/examples/forced-layout.test.ts --project=chromium`
  passed both forced-layout browser rows.
- `bun check` passed. It still prints the existing React Hooks dependency
  warning in `packages/slate-react/src/components/slate.tsx`.

Known diagnostic still outside this slice:

- The normalization compare benchmark still shows current v2 slower than legacy
  on `insertTextReadAfterEachMs`; that lane existed before this API slice and is
  not caused by the normalizer lane split.

## Editor/Node Normalizer Split - 2026-05-17

Follow-up decision: split root/editor normalization from ordinary node
normalization.

Chosen API:

```ts
defineEditorExtension({
  name: "forced-layout",
  normalizers: {
    editor({ next, tx }) {
      // root value/layout repair
      next();
    },
    node({ entry, next, tx }) {
      // non-root node repair
      next();
    },
  },
});
```

Rules:

- `normalizers.editor` owns editor-root/value-level repair.
- `normalizers.node` does not receive the editor root.
- Do not add `element` or `text` lanes in this slice.
- Keep scoped normalizer `tx`.
- Migrate `forced-layout` to `normalizers.editor`.
- Preserve existing cleanup, ordering, double-next, and benchmark proof.

Execution result:

- Added `EditorRootNormalizer*` types and `normalizers.editor`.
- Renamed node-entry normalizer types to `EditorNodeNormalizer*`.
- Routed only the editor root (`[]`) through `normalizers.editor`.
- Routed only non-root entries through `normalizers.node`.
- Kept scoped normalizer `tx` on both lanes.
- Migrated `forced-layout` to `normalizers.editor({ next, tx })`.
- Updated public-surface and generic type tests so `normalizers.editor` has no
  `entry`, while `normalizers.node` never receives the editor root.

## Pass Schedule And Ledger

| Pass                                    | Status   | Evidence added                                                                                                                                                       | Plan delta                                                                                                                                                                                           | Open issues                          | Next owner   |
| --------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ------------ |
| 1. Current-state read and initial score | complete | Live forced-layout, normalizer type/runtime, tests, browser row.                                                                                                     | Chose `normalizers.node` plus `tx` context, then split editor-root repair into `normalizers.editor`.                                                                                                 | resolved in passes 2-3               | Codex        |
| 2. Related issue discovery              | complete | Local ledgers and test candidate maps for #4641, #4701, #3275, #2039, #3950, #5811.                                                                                  | Classified #4641 as direct implementation-pressure; kept #4701/#3275/#2039 as related/no-claim; left #3950/#5811 already accounted.                                                                  | no new fixed issue claim             | Codex        |
| 3. Issue-ledger pass                    | complete | Full corpus normalization/API scan across open ledger, clusters, test/benchmark maps, package impact, requirements, coverage matrix, fork dossier, and PR reference. | Added wider exclusions for #3465, #2643, #2405, #2195, #2355, #3430 and cluster-level normalization pressure.                                                                                        | no new fixed issue claim             | Codex        |
| 4. Intent/boundary and decision brief   | complete | Hardened accepted/rejected boundaries, no-question status, and `tx` pressure test.                                                                                   | Confirmed no user decision is missing; kept `normalizers.node`, `tx`, internal typed-lane ids, and no wrapper path.                                                                                  | none                                 | Codex        |
| 5. Research/ecosystem refresh           | complete | Compiled editor-architecture corpus, live Slate v2 normalizer source, Plate plugin type source, slate-yjs wrapper pressure.                                          | Replaced thin synthesis with steal/reject/borrow rows and no-new-research-page verdict.                                                                                                              | none                                 | Codex        |
| 6. Pressure passes                      | complete | Performance, DX, unopinionated-core, migration, regression, verification workspace, research, and simplicity pressure rows.                                          | Renamed target factory to `forcedLayout()`, narrowed `tx` to active update view, selected `normalizers.node` over top-level sugar or arbitrary map ids, and added legacy normalizer benchmark gates. | none                                 | Codex        |
| 7. Maintainer objection ledger          | complete | Steelman rows for `normalizers.node`, `tx`, normalizer ids, `forcedLayout()`, and commit-listener repair.                                                            | Revised `tx` into a normalizer-scoped transaction facade and made normalizer id format internal.                                                                                                     | none                                 | Codex        |
| 8. High-risk deliberate mode            | complete | Blast radius, four failure scenarios, expanded proof plan, and rollback answer.                                                                                      | Kept plan only with scoped-`tx` facade, no nested update examples, and explicit no-collab-closure claim.                                                                                             | none                                 | Codex        |
| 9. Ecosystem maintainer pass            | complete | Plate/plugin and slate-yjs/collab maintainer answers for `normalizers.node`, scoped `tx`, internal typed-lane ids, and forced-layout hard cut.                       | Confirmed raw Slate does not copy Plate plugin APIs and does not claim current slate-yjs adapter support.                                                                                            | none                                 | Codex        |
| 10. Revision pass                       | complete | Re-read accepted objection, high-risk, and ecosystem rows against the public API target.                                                                             | Kept API direction unchanged; tightened final handoff wording around scoped `tx`, outer-transaction writes, Plate boundary, and no slate-yjs adapter edits.                                          | none                                 | Codex        |
| 11. Issue sync accounting               | complete | Re-read live open ledger, v2 sync ledger, open dossiers, test/benchmark maps, issue coverage matrix, fork dossier, and PR reference for normalization candidates.    | Added a normalizer extension DX planning-sync section to the issue coverage matrix; kept PR reference unchanged.                                                                                     | no new fixed or improved issue claim | Codex        |
| 12. Closure score and final gates       | complete | Verified every pass row, score cap, handoff, issue accounting, and completion gate.                                                                                  | Marked the Slate Ralplan planning lane done and Ralph-ready; implementation remains a separate `ralph` execution.                                                                                    | none                                 | user / Ralph |

## Current Score

| Dimension                              | Score | Evidence                                                                                                                                                                                                                                                       |
| -------------------------------------- | ----: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React 19.2 runtime performance         |  0.89 | Moving repair from commit listener to dirty-path normalization avoids after-every-commit app repair; the pressure pass added an active-transaction proof guard plus legacy normalizer benchmark gates against `../slate`.                                      |
| Slate-close unopinionated DX           |  0.93 | Revision pass found `normalizers.node` plus scoped `tx` better than top-level `normalizeNode` sugar because it keeps Slate normalization semantics while matching `transforms` and `queries`; wrapper composition, schema DSL, and dual `with*` APIs stay cut. |
| Plate and slate-yjs migration backbone |  0.88 | Ecosystem pass now names the Plate mapping route and the collab contract: normalizer writes must be regular outer-transaction operations with metadata, but no adapter closure is claimed.                                                                     |
| Regression-proof testing strategy      |  0.88 | Required type/runtime/browser rows are named and ordered, high-risk pre-mortem failure modes are mapped to proof lanes, issue sync now records conservative claim policy, and implementation proof is still Ralph-owned.                                       |
| Research evidence completeness         |  0.88 | Compiled Lexical/ProseMirror/Tiptap decisions are accepted; live Slate v2, Plate, and slate-yjs source now back both the strategy synthesis and ecosystem answers.                                                                                             |
| shadcn-style composability             |  0.89 | Extension factory is now `forcedLayout()`, lowercase and option-ready without extra aliases.                                                                                                                                                                   |
| Total                                  |  0.92 | Planning lane closed; implementation remains Ralph-owned.                                                                                                                                                                                                      |

Score note: this is plan-confidence, not implementation proof. The plan is
Ralph-ready; source/runtime/browser proof remains in the Ralph execution gates.

## Plan Deltas From Review

- Rejected the current `WeakSet + commitListeners` shape.
- Strengthened the target beyond `normalizers: { rootLayout }` by replacing
  arbitrary public ids with the typed `normalizers.node` lane.
- Added normalizer-scoped `tx` so the public example uses transaction APIs.
- Added extension-local typed-lane registration keys through an internal helper
  to prevent collisions.
- Renamed the teaching factory from `layout()` to `forcedLayout()`.
- Rejected top-level `normalizeNode` sugar to avoid two public spellings for
  one lifecycle slot.
- Revised `tx` from full `EditorUpdateTransaction` to a normalizer-scoped
  transaction facade.
- Made normalizer id namespacing internal instead of a documented string
  format.
- Added high-risk pre-mortem and proof gates for transaction scope, normalizer
  ordering/cleanup, browser behavior, and history/collab metadata.
- Added a performance review requiring `bench:core:normalization:compare:local`
  against legacy `../slate`, a medium cohort, and custom normalizer lanes for
  no-op dispatch and forced-layout repair.
- Added ecosystem maintainer answers for Plate/plugin migration and
  slate-yjs/collab determinism.
- Confirmed raw Slate should not copy Plate plugin APIs.
- Confirmed this plan makes no current slate-yjs adapter support promise.
- Revision pass kept the architecture unchanged and narrowed the handoff to the
  exact core/example/test slice.
- Added issue coverage matrix planning sync for the normalizer extension DX
  plan.
- Kept PR reference unchanged because there is no implemented proof and no new
  fixed or improved claim.
- Closed the Slate Ralplan lane after verifying all scheduled passes.
- Cut arbitrary public normalizer map keys.
- Kept `commitListeners` only for observation, not structural repair.

## Revision Pass

Revision pass status: complete.

The pass re-read the accepted decisions after the maintainer, high-risk, and
ecosystem passes. No reversal is needed.

Final architecture target:

- `extensions: [forcedLayout()]` is the single authoring route.
- `defineEditorExtension({ normalizers: { node(...) {} } })` is the normal
  node-normalizer path.
- Arbitrary public normalizer map keys are cut.
- `tx` stays in the normalizer context, but only as a normalizer-scoped facade.
- Normalizer writes must join the outer normalization transaction.
- Normalizer id generation is internal; docs teach typed lifecycle lanes only.
- `commitListeners` remain valid for observation, not structural repair.
- Plate APIs and slate-yjs adapters stay untouched in this slice.

Rejected during revision:

- No `withForcedLayout(...)`.
- No top-level `extension.normalizeNode`.
- No `editor.normalizeNode = ...` teaching route.
- No arbitrary public normalizer id map.
- No schema DSL for required root blocks.
- No full `EditorUpdateTransaction` in normalizer context.
- No nested `editor.update(...)` inside normalizers.
- No current slate-yjs adapter support claim.

Handoff wording revision:

Before this pass, the handoff could be misread as "add enough API to make the
example prettier." That is too weak. The actual handoff is: move structural
repair into the normalization pipeline while preserving Slate's extension
composition model and keeping transaction/collab behavior observable.

Revision verdict: keep. The remaining work is accounting, not architecture
debate.

## Issue Sync Accounting

Issue sync accounting status: complete.

Source files re-read:

- `docs/slate-issues/gitcrawl-live-open-ledger.md`
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md`
- `docs/slate-issues/open-issues-ledger.md`
- `docs/slate-issues/gitcrawl-clusters.md`
- `docs/slate-issues/issue-clusters.md`
- `docs/slate-issues/test-candidate-map/`
- `docs/slate-issues/benchmark-candidate-map.md`
- `docs/slate-issues/package-impact-matrix.md`
- `docs/slate-issues/requirements-from-issues.md`
- `docs/slate-v2/ledgers/issue-coverage-matrix.md`
- `docs/slate-v2/ledgers/fork-issue-dossier.md`
- `docs/slate-v2/references/pr-description.md`
- issue dossiers for `#4641`, `#4701`, `#3275`, `#2039`, `#3950`, and `#5811`

Accounting result:

- Added `Normalizer Extension DX Planning Sync - 2026-05-17` to
  `docs/slate-v2/ledgers/issue-coverage-matrix.md`.
- No fixed issue claim added.
- No improved issue claim added.
- `docs/slate-v2/references/pr-description.md` stays unchanged.
- `docs/slate-issues/gitcrawl-v2-sync-ledger.md` stays unchanged because the
  accepted plan preserves the existing manual classifications.
- `docs/slate-v2/ledgers/fork-issue-dossier.md` stays unchanged because the
  current long-form sections already cover `#3950`, `#5811`, `#2643`, `#2195`,
  `#2405`, `#2355`, and `#3430`, while `#4641`, `#4701`, `#3275`, and `#2039`
  remain planning-pressure rows until implementation proof exists.

Formal issue matrix:

| Issue | Cluster                              | Claim                         | Why                                                                                                               | Proof route                                                           | V2 sync ledger                                                                | PR line                    |
| ----- | ------------------------------------ | ----------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------- | -------------------------- |
| #4641 | normalizeNode property updates       | Related                       | Direct normalizer implementation pressure, but no exact property-copy/update repro is fixed by planning.          | Ralph package test in `normalization-contract.ts`.                    | unchanged `cluster-synced`                                                    | related planning sync only |
| #4701 | custom empty text-node factory       | Related / no claim            | Scoped normalizer `tx` improves authoring, but it does not add a generic empty-text factory.                      | Type/docs/example proof only.                                         | unchanged `cluster-synced`                                                    | related planning sync only |
| #3275 | path-only normalizeNode              | Rejected alternative          | The plan keeps `entry` for Slate familiarity and current v2 substrate; it does not adopt path-only normalization. | Decision brief and type tests.                                        | unchanged `cluster-synced`                                                    | related planning sync only |
| #2039 | normalizer infinite-loop diagnostics | Not claimed                   | The plan avoids bad example repair loops but does not add named rule diagnostics.                                 | Existing fixpoint proof only; future diagnostics need separate scope. | unchanged `not-claimed`                                                       | related planning sync only |
| #3950 | transformed-node rerun               | Existing `Fixes` preserved    | Prior structural normalization proof already owns this claim.                                                     | Existing `normalization-contract.ts` proof.                           | unchanged `fixes-claimed`                                                     | existing `Fixes #3950`     |
| #5811 | normalization fixpoint/loop guard    | Existing `Improves` preserved | Prior structural normalization proof already owns deterministic fixpoint diagnostics.                             | Existing `normalization-contract.ts` proof.                           | unchanged `cluster-synced` in manual ledger; coverage matrix keeps `Improves` | existing `Improves #5811`  |
| #3465 | initial-value normalization          | Not claimed                   | Forced-layout example policy does not add full-document/default-root initialization policy.                       | Existing coverage matrix row.                                         | unchanged `not-claimed`                                                       | related matrix only        |
| #2643 | schema veto                          | Related / not claimed         | Normalizer repair is not preflight validation.                                                                    | Existing coverage matrix row.                                         | unchanged `cluster-synced`                                                    | related matrix only        |
| #2405 | command-scoped schema rules          | Related                       | Dirty-path pressure is represented, but this plan does not add command-scoped rule evaluation.                    | Existing coverage matrix row.                                         | unchanged `cluster-synced`                                                    | related matrix only        |
| #2195 | text-node dirty tracking             | Related                       | The plan avoids after-commit repair but does not benchmark or alter dirty tracking.                               | Existing coverage matrix row.                                         | unchanged `cluster-synced`                                                    | related matrix only        |
| #2355 | selection normalization              | Related / not claimed         | Node normalization DX does not add a selection-normalization hook.                                                | Existing coverage matrix row.                                         | unchanged `cluster-synced`                                                    | related matrix only        |
| #3430 | inline-heavy normalization freeze    | Not claimed                   | No inline-heavy performance/browser proof is added.                                                               | Existing coverage matrix row.                                         | unchanged existing live row                                                   | related matrix only        |

ClawSweeper verdict: applied, ledger-first. No broad live GitHub search was
needed. The active plan has precise related/no-claim accounting and the PR
reference does not need a change.

## Closure Final Gates

Closure final-gates status: complete.

Gate results:

| Gate                                   | Result | Evidence                                                                                                                         |
| -------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Every scheduled pass complete          | pass   | Passes 1-12 are complete in the pass schedule.                                                                                   |
| No runnable Slate Ralplan pass remains | pass   | `next_pass: none`; remaining implementation is Ralph-owned.                                                                      |
| Current pass is closure/final-gates    | pass   | Completion state records `current_pass: closure-final-gates`.                                                                    |
| Final handoff complete                 | pass   | The final handoff below lists public API, runtime, migration, issue accounting, rejected alternatives, and implementation gates. |
| Issue accounting conservative          | pass   | No new fixed or improved issue claim; planning sync added to `issue-coverage-matrix.md`.                                         |
| Sibling source untouched by this skill | pass   | Slate Ralplan artifacts only; implementation gates point to `.tmp/slate-v2` for Ralph.                                           |
| Completion state can close             | pass   | Earlier pass rows were complete before this activation; closure is the only pass completed in this activation.                   |

Final handoff status: complete.

## Open Questions

None blocking the chosen direction.

What could change the decision:

- If current normalizer transaction internals cannot expose `tx` without unsafe
  recursion, fall back to `normalizers.node({ editor, entry, next })` plus a
  documented narrow repair path. That would be worse DX and should need proof
  before accepting.
- If closure finds a missing final gate or stale handoff claim, fix that before
  Ralph.

## Final Handoff

Ralph-ready handoff:

Public API:

- Build `extension.normalizers.node`.
- Remove arbitrary public normalizer map keys.
- Add normalizer-scoped `tx` to normalizer context.
- Register typed normalizer lanes by extension name through an internal helper.
- Keep `commitListeners` for observation only.

Runtime:

- Keep normalizer writes in the outer normalization transaction.
- Do not expose full `EditorUpdateTransaction` in normalizer context.
- Do not expose `tx.normalize`, `tx.withoutNormalizing`,
  `tx.operations.replay`, or `tx.value.replace`.
- Require no nested `editor.update(...)` inside normalizers.

Example:

- Use `forcedLayout()` for the example extension factory.
- Rewrite forced-layout to the target snippet.
- Remove `ENFORCING_LAYOUT`, post-commit repair, and startup repair scheduling.

Proof:

- Add positive and negative type tests for extension inference and scoped `tx`.
- Add negative type tests rejecting top-level `normalizeNode` and arbitrary
  normalizer keys.
- Add runtime tests for typed-lane registration, two-extension collisions,
  order/latest-wins, cleanup, double-next, and no nested update.
- Add legacy normalizer benchmark proof:
  `bench:core:normalization:compare:local`, the medium cohort command, and a
  custom normalizer lane comparing legacy `editor.normalizeNode` override to v2
  `normalizers.node`.
- Add public-surface proof that forced-layout no longer teaches `WeakSet`,
  commit-listener repair, or legacy `editor.normalizeNode = ...`.
- Add focused forced-layout browser proof.

Boundaries:

- Do not edit Plate APIs or current slate-yjs adapters for this slice.
- Do not add a schema DSL, path-only normalization, wrapper composition,
  top-level `extension.normalizeNode`, arbitrary public normalizer ids, or a
  generic empty-text factory in this slice.
- Do not claim current slate-yjs adapter support.

Issue accounting:

- New `Fixes`: none.
- New `Improves`: none.
- Related/planning pressure: `#4641`, `#4701`, `#3275`, `#2039`.
- Existing preserved claims: `Fixes #3950`, `Improves #5811`.
- Existing non-claims/related rows preserved: `#3465`, `#2643`, `#2405`,
  `#2195`, `#2355`, `#3430`.

## Completion Gates

Status is `done` because:

- every scheduled Slate Ralplan pass is complete
- issue accounting is synced conservatively
- final handoff is complete
- next pass is none
- implementation proof is explicitly delegated to a later `ralph` execution
