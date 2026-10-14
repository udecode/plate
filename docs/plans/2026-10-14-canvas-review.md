---
review_scopes: [canvas]
verdict: pursue
review_basis: [2026-10-04-canvas-audit]
work_kind: implementation
review_commit: 6fa1169c5e723eb3e058697189cdcad85be220f9
review_inputs: [packages/platejs/src/excalidraw/react/useExcalidrawSync.spec.tsx, packages/plitejs/src/react/editable/runtime-keyboard-events.ts, packages/plitejs/src/react/editable/keyboard-input-strategy.ts, packages/plitejs/test/react/editing-kernel-contract.ts, tooling/scripts/check-plate-schema-adoption.mjs, 'content/docs/(guides)/selection.mdx', packages/plitejs/src/interfaces/schema.ts, packages/platejs/src/migrations/migratePlateV54Ast.internal.ts, packages/platejs/src/migrations/migratePlateV54Ast.spec.ts, packages/platejs/src/migrations/v53-manifest.internal.ts, packages/platejs/src/migrations/documentMigrations.ts, .changeset/excalidraw-v54-runtime.md, 'content/docs/(guides)/plugin-components.cn.mdx', content/docs/examples/editable-voids.cn.mdx, VISION.md, docs/vision/common.md, docs/vision/plate.md, docs/research/review-records/2026-10-04-canvas-audit.json, docs/plans/2026-09-07-full-plate-ui-extraction-audit.md, 'content/docs/(plugins)/(elements)/excalidraw.mdx', 'content/docs/(plugins)/(elements)/excalidraw.cn.mdx', 'content/docs/(guides)/plugin-components.mdx', content/docs/examples/editable-voids.mdx, packages/plitejs/src/react/editable/input-controller.ts, packages/plitejs/src/react/editable/root-interaction-resolver.ts, packages/plitejs/src/dom/plugin/dom-integrity-observer.ts, packages/plitejs/test/react/void-interactive-mouse.test.tsx, packages/platejs/src/react/components/NodeSelection.tsx, apps/www/src/registry/components/editor/table.tsx, tooling/entrypoints/entrypoint-dag.mjs, tooling/oxlint/plate-baseline.json, apps/www/src/i18n/getI18nValues.ts, apps/www/src/registry/examples/playground-demo.tsx, apps/www/src/registry/examples/values/demo-values.tsx, apps/www/src/registry/examples/values/cn/demo-values.tsx, apps/www/src/registry/components/editor/fixed-toolbar.tsx, packages/platejs/src/utils/plugins/ExitBreakPlugin.ts, packages/platejs/src/utils/index.ts]
review_upstreams: ['../prosemirror-view@ca4c78e9b56f1b164c0b3758b59d8748f11b7534', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../slate@945a484df2497e4c448b33f417b0de2a49840032', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca', '../BlockNote@1e26f1c5e1cd7df81df9d4ab2a853bf1b298b163', '../excalidraw@214cd6e6e8ac3ad6b68486aa7aa7241abdf9445f', '../plate@ee214137564c7c060b6993ba69700bd616564ab4']
---

# Canvas: keep the Excalidraw sync, fix its public contract

Status: executed: built and proven; waiting on your commit
Playbook: plan

**Pursue, reaffirming `2026-10-04-canvas-audit` with its open naming choice settled.** The sync design is right and proven. A void block stores the drawing, `useExcalidrawSync` keeps the node and the mounted canvas in step without save echoes, and the copied component owns loading and the frame. Three parts of the public contract are wrong. `ExcalidrawDataState` is Excalidraw's own import shape, which names the settings `appState`. The probe shows the plugin's schema refuses a value of that shape. No code uses the type, and it is the only reason the headless `platejs/excalidraw` entrypoint declares the Excalidraw peer. `width` is a stored field of the closed schema that nothing reads or writes. The demo sets it to 50%, and the canvas ignores it. The copied canvas works only because its wrapper carries Plite's `data-editor-root-chrome-ignore` marker, which hands the canvas its own pointer, typing, clipboard, focus and DOM changes. Undo and Redo shortcuts are an exception, as in any native control or nested editor, and the build found a few more keys the editor takes in narrower cases. Outside an IME composition, an editable editor runs its own history for them, and a read-only editor stops them before the canvas sees them. No docs page names that marker, so a custom copy that drops it stops drawing. Delete the type and the field, and document the marker under its current name. `canvas` is the scope `node tooling/scripts/review-ledger.mjs next` returned. Other sessions own its two uncommitted members. `apps/www/tests/browser/excalidraw.spec.ts` renames the browser handle key, and `packages/platejs/package.json` adds the lint entrypoint scripts. This run builds on both and reverts neither.

## Brief

### What will change?

Plate dropped a drawing type that didn't match saved data and a width nothing used, and it rejects badly saved images. The docs now teach the attribute custom drawings need, and the Close lists where the build left the plan.

### What could go wrong?

Drawings saved with a width on a v54 beta won't load until the app strips it. Nobody has timed the upgrade yet, because a busy machine stopped the timing run. The release check still fails on old size records.

## Teach

An Excalidraw block is a drawing inside a Plate document. The document stores the drawing as plain data on one block: the shapes, a few drawing settings and any images. A live Excalidraw canvas shows that data and lets you draw.

A small hook keeps the two in step. Drawing saves once per change, panning saves nothing, and undoing in the document redraws the canvas. The copied component loads the canvas, turns on view-only mode when the editor is read-only, and wraps the canvas in an attribute that tells the editor to leave its clicks and typing alone. The editor keeps the undo and redo shortcuts for itself.

The build deleted a published type that described data the block refuses, and a saved width that did nothing. The block now refuses images saved in the wrong shape. The docs teach the attribute, so people who build their own drawing component know to keep it.

## Public API

The headless entrypoint stops exporting Excalidraw's import shape. A stored drawing's type stays reachable as `NonNullable<ExcalidrawElement['data']>`.

```ts before
// packages/platejs/src/excalidraw/lib/BaseExcalidrawPlugin.ts
import type { ImportedDataState } from '@excalidraw/excalidraw/data/types';

export type ExcalidrawDataState = ImportedDataState;
```

```ts after
```

The demo value stops storing a width.

```tsx before
// apps/www/src/registry/examples/values/excalidraw-value.tsx
<hexcalidraw {...excalidrawInitialData} width="50%">
  <htext />
</hexcalidraw>
```

```tsx after
// apps/www/src/registry/examples/values/excalidraw-value.tsx
<hexcalidraw {...excalidrawInitialData}>
  <htext />
</hexcalidraw>
```

## Document shape

Plate's schema check and the sync hook read the stored node. After the cut, a stored `width` is an unknown property, and the v54 upgrade removes it from older documents.

```json before
{
  "type": "excalidraw",
  "data": {
    "elements": [{ "id": "oDVXy8D6rom3H1-LLH2-f", "type": "rectangle" }],
    "state": { "viewBackgroundColor": "#AFEEEE" }
  },
  "width": "50%",
  "children": [{ "text": "" }]
}
```

```json after
{
  "type": "excalidraw",
  "data": {
    "elements": [{ "id": "oDVXy8D6rom3H1-LLH2-f", "type": "rectangle" }],
    "state": { "viewBackgroundColor": "#AFEEEE" }
  },
  "children": [{ "text": "" }]
}
```

The schema check also reads `data.files`. Today it accepts any JSON there, so a string, an array or `null` passes (`probe-files-a1.log`). After the change, `files` is absent or an object keyed by file id. That is what Excalidraw's serializer writes and what the `ExcalidrawElement['data']` type already declares, so a valid stored drawing keeps its shape.

## Layer and owner

| Change | Layer | Package | Why |
| --- | --- | --- | --- |
| Delete `ExcalidrawDataState` and the headless Excalidraw peer | Plate | `platejs/excalidraw`, the `excalidraw` entry of `tooling/entrypoints/entrypoint-dag.mjs` | The headless value contract needs no optional runtime peer, and the entrypoint lint then refuses any Excalidraw import there. |
| Delete `width`, check `files`, move the validator to version 2 | Plate | `platejs/excalidraw` | A closed-schema property needs a reader or a writer, and the accepted set should match the declared type. |
| Drop a stored `width` in the v54 upgrade, and ask about ownership at the node's own root and parents | Plate | `platejs/migrations` | `migrateV54` owns the v53 contract and already drops media `name` the same way; the context fix in its shared `ownsProperty` covers both drops. |
| Teach the input marker | Plite owns the literal DOM protocol; Plate docs teach it | `content/docs` Plugin Components and Excalidraw pages | Copied UI applies Plite's literal markers, and no page names this one. |
| View-only mode | Registry UI | `apps/www/src/registry/components/editor/excalidraw.tsx`, unchanged | Excalidraw's `viewModeEnabled` prop is a controlled input; the Design section says why the hook does not take it over. |

## Hard cuts and app migration

- `ExcalidrawDataState` is deleted. No source file imports it. The two `excalidraw.mdx` rows that name it, its `plate-baseline.json` entry and three generated registry docs files go with it. An app that typed Excalidraw's own input, such as `initialData`, imports Excalidraw's `ImportedDataState`, as legacy Plate's `initialData` did. An app that typed a stored drawing reads `NonNullable<ExcalidrawElement['data']>` from `platejs/excalidraw`.
- The `width` property is deleted from the `excalidraw` element schema. The demo value, its Chinese twin and one plugin spec set it, and nothing renders it. Documents coming from v53 lose it in `migrateV54`, unless the app's schema declares `width` for that node's type in that node's root and under its parents. A document saved on a v54 beta that still holds `width` fails to load with `Unknown element property "width" in closed editor schema.`
- Removing `width` and moving the validator to version 2 change the schema fingerprint, even for documents with no drawing (`probe-fingerprint-a1.log`). What an app does depends on how it saves:
  - An app with a named schema bumps its `schema.version`, records the old fingerprint under `sourceFingerprints`, as `probe-v53-width.ts` does, and adds a step that removes `width` from `excalidraw` nodes saved on a v54 beta.
  - An app on the default derived identity that saved `{ document, schema }` envelopes finds them refused, because the stored fingerprint no longer matches and `migrateDocument` accepts only a named lineage. It removes `width` from the saved `document`, loads `{ ...document, selection }` without the old stamp so the saved selection survives, and saves again under the current identity.
  - An app that saves the bare document removes `width` from `excalidraw` nodes before `createEditor`.
- A stored `files` value that is not an object is refused. The sync hook writes only the object Excalidraw serializes, so only hand-written data meets this.
- The copied `excalidraw.tsx` does not change. The registry demo value and its Chinese twin drop `width`.

## Main changes

- The v54 upgrade drops `width` from `excalidraw` nodes unless the target schema declares it, beside the media `name` drop.
- `migratePlateV54Ast` passes each node's root and parent types to its `ownsProperty` check, so neither drop removes a property an app declares only for one root or one parent.
- The headless `platejs/excalidraw` entrypoint no longer lists `@excalidraw/excalidraw` as a peer, so `entrypoint-dag(no-forbidden-imports)` refuses an Excalidraw import there.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Stored data type export | `ExcalidrawDataState = ImportedDataState`, a shape the schema refuses | Deleted; `NonNullable<ExcalidrawElement['data']>` | `platejs/excalidraw` | No consumer, wrong shape, only Excalidraw import in the headless entry | Two docs rows, one baseline entry | Partition typecheck, planted-import lint | An app imported it; the fix is one type reference | cut |
| Headless Excalidraw peer | `excalidraw` entry lists `@excalidraw/excalidraw` | No peer | `tooling/entrypoints/entrypoint-dag.mjs` | Only the type above used it | None | `pnpm check entrypoint-graph`, planted-import lint | none found | cut |
| Stored `width` | `property.string()` with no reader or writer | Deleted; `migrateV54` drops it | `platejs/excalidraw`, `platejs/migrations` | Dead closed-schema field | Demo values, one spec, docs migration note | Red-then-green schema and migration specs | v54 beta documents that saved it | cut |
| `files` check | Any JSON accepted | Absent or an object, `validationVersion: 2` | `platejs/excalidraw` | Accepted set matches the declared type | None | Red-then-green schema spec | Hand-written data with a non-object `files` | keep |
| Sync lifecycle | `useExcalidrawSync` | Unchanged | `platejs/excalidraw/react` | Durable no-echo, undo and read-only invariants | None | Existing hook spec and browser spec | none | keep |
| View-only mode | Copied component passes `viewModeEnabled={readOnly}` | Unchanged, taught on the Excalidraw page | Registry UI | Excalidraw's prop locks view mode; the hook cannot | Docs | The hook spec's read-only case; source read of Excalidraw 0.18.0 | A custom copy omits the prop; the hook still refuses writes | keep |
| Stored settings key | `state` | Unchanged | `platejs/excalidraw` | A rename costs a data migration for a name | None | none needed | none | keep |
| Input marker | `data-editor-root-chrome-ignore`, undocumented | Documented under its name, with the keys the editor still takes | Plite DOM protocol, Plate docs | Five owners share it | Plugin Components, Excalidraw, Editable Voids and Selection pages | Docs checks, hand drive with the undo shortcut | none | keep |

## Design

`architect` ran three runners, `gpt-6.1-sol @xhigh`, `claude-opus-5-5 @high` and `gpt-6-astra @xhigh`, and one blind cross-judge, `claude-opus-5-5 @high`. The base is the Astra candidate. It deletes `ExcalidrawDataState`, `width` and the headless peer, keeps `{ elements, state, files? }`, the void block and the hook, and teaches the marker on Plugin Components, with the Excalidraw page linking there. The lead tied it with the Sol candidate. The judge picked it because Sol's custom-copy example drops `initialData`, an unproven behavior bet.

Grafts taken:

1. `migrateV54` drops `width` from `excalidraw` nodes unless the target schema owns it (`probe-v53-width-a1.log`: with `width` removed, a v53 drawing that holds it is refused).
2. The validator checks `files` as an optional object, with `validationVersion: 2` (`probe-files-a1.log`: at `HEAD` a string, an array and `null` all pass).
3. Plugin Components says the editor already leaves native controls alone and that a click outside the marked wrapper still selects the node. The panel corrected the third clause in all three rounds. Outside an IME composition, the editor takes Undo and Redo shortcuts pressed anywhere inside it, in a marked widget, a native control or a nested editor, before the widget's own key handlers run. An editable editor runs its history for them, even an empty one. A read-only editor only stops them, so a native text field still applies the browser's own undo.
4. The changeset's migration note covers the fingerprint bump for named schemas.
5. The headless boundary's check is the existing `entrypoint-dag(no-forbidden-imports)` lint (`spike/lint-planted-import-a1.log`).

**This plan drops the view-mode graft after the verdict.** The synthesis took a Claude-only graft that moved view mode into `useExcalidrawSync` and dropped `viewModeEnabled` from the copied component. The installed Excalidraw 0.18.0 bundle shows that the move would weaken read-only mode. While the `viewModeEnabled` prop is undefined, `syncActionResult` takes view mode from each action result, so Alt+R, the command palette's toggle or another action can leave view mode, and a reader of a read-only document could then draw strokes the hook refuses to save. A defined prop makes `syncActionResult` keep the prop's value after every action, and the toggle's `predicate` hides it from the command palette. The hook's own document projections go through `api.updateScene`, which keeps the view mode it finds. Excalidraw's prop is the controlled input, so the copied component keeps it, and the Excalidraw page teaches custom copies to pass it. This rests on a source read of `dist/dev/index.js` in the installed package, not a browser run. The panel confirmed it in round 1. A third option, a hook that returns canvas props for the copy to spread, also loses: it adds a return contract to the hook, and a copy can still forget to spread it, which is the same miss as forgetting the one prop.

Rejected: the `state` to `appState` rename and a `migrateExcalidrawScene` export, a packaged canvas component, a marker wrapper, an iframe, a modal, and a custom example without `initialData`.

Challenge delta: improved. Round 1 of the plan's panel kept the target and changed six things:
- The marker docs name the Undo and Redo exception.
- The migration's ownership check takes the node's root and parents, which also fixes the media `name` drop.
- The app migration note covers derived and bare-document saves.
- The removed type gets two named replacements.
- Phase 2 and the close run the hook's test group.
- The headless boundary gets a packed proof without Excalidraw installed.

Round 2 kept the target and tightened five things:
- The shortcut exception covers native controls and nested editors, an empty history and read-only mode.
- The migration context fix covers parents and converted Toggles, with a mutant for each half.
- The packed proof asserts that Excalidraw is absent, because the release checker alone cannot fail on it.
- The hand drive tells document undo from canvas undo.
- The derived-envelope recipe keeps the saved selection.

Round 3, the last plan round the cap allows, kept the target and changed five things:
- The shortcut exception names IME composition and a native field's own undo in read-only mode.
- The Excalidraw page makes no promise about undo inside an open text label, and that sync defect goes to Open work.
- Every `ownsProperty` caller must pass the context, and a converted-Toggle case with its own mutant pins the summary query.
- The packed proof keeps its fixture and reads it through the checker's exported helpers.
- The hand drive refocuses the canvas before redo.

## Start Gates

| Gate | Applies | Evidence |
| --- | --- | --- |
| A stored `width` is refused once the schema drops it | yes | `docs/plans/artifacts/2026-10-14-canvas-review/probe-schema-a2.log` (undeclared property refused), `docs/plans/artifacts/2026-10-14-canvas-review/spike/test-excalidraw-a1.log` (the width spec fails on the cut) |
| A v53 drawing with `width` needs the migration drop | yes | `docs/plans/artifacts/2026-10-14-canvas-review/probe-v53-width-a1.log` |
| `files` accepts non-objects at `HEAD` | yes | `docs/plans/artifacts/2026-10-14-canvas-review/probe-files-a1.log` |
| The headless entry typechecks, lints and passes the graph check without the peer | yes | `docs/plans/artifacts/2026-10-14-canvas-review/spike/typecheck-excalidraw-a1.log`, `spike/typecheck-excalidraw-react-a1.log`, `spike/lint-excalidraw-a1.log`, `spike/entrypoint-graph-a1.log` |
| An Excalidraw import in the headless entry fails the lint once the peer goes | yes | `docs/plans/artifacts/2026-10-14-canvas-review/spike/lint-planted-import-a1.log` |
| Performance pack | yes | The `files` check adds one type check per drawing, but step 2.2 adds repeated-unit work: the v54 walker builds a parent-type list for every element and passes it to each property query. The decision-trail review found the first reason stale. The pre-acceptance probe is a gate: one sample per side on four cohorts ran (`docs/plans/artifacts/2026-10-14-canvas-review/perf/`), and the paired run stopped twice, once at a session restart and once on a one-minute load of 12.4 over its frozen limit of 9. Open work tracks the rerun. |

## Completion Gates

| Gate | Evidence |
| --- | --- |
| `pstack:blast-radius` before code moves | The decision log's `build` row "Blast radius of the type, width and files changes (step 1.1)" |
| `plate-docs` on every named docs page | Invoked for steps 3.1-3.3 and again for drift-1 and the round-2 fixes. On the final docs bytes: `docs/plans/artifacts/2026-10-14-canvas-review/build/close-build-source-a1.log`, `docs/plans/artifacts/2026-10-14-canvas-review/build/close-docs-source-parity-a1.log`, `docs/plans/artifacts/2026-10-14-canvas-review/build/close-build-registry-check-a1.log` and the anchor check `docs/plans/artifacts/2026-10-14-canvas-review/build/drift-1-green-a1.log`. `check:docs` stops at `api-reference:check` on another session's `SchemaRoot` (`docs/plans/artifacts/2026-10-14-canvas-review/build/p3-check-docs-a1.log`), so its later links ran on their own. |
| `best-api repair` | Invoked for step 3.5; `docs/plans/artifacts/2026-10-14-canvas-review/build/p3-sync-resources-check-a1.log` |
| `changeset` | Loaded for step 2.4; `docs/plans/artifacts/2026-10-14-canvas-review/build/p2-check-registry-changelog-a1.log` |
| `pnpm check` steps the edits reach, before the expensive acceptance runs | `docs/plans/artifacts/2026-10-14-canvas-review/build/close-final-base-patch-a1.log`: at `6fa1169c5e` plus this task's final hunks, every partition typecheck, lint and test, `entrypoint-graph` and `lint-baseline` pass; `core-audits` shows the same eleven findings as `HEAD` |
| `oxlint --type-aware` on the task's lintable files before the diff panel freeze | `docs/plans/artifacts/2026-10-14-canvas-review/build/close-oxlint-type-aware-a1.log`, 7 files, 0 findings |
| Writing passes: `deslop`, `no-comments`, `unslop` | The decision log's `writing` rows for the Phase 3 docs, the product diff and the round-1 fixes |
| Diff panel (reviews: api-build) | Round 1 on frozen `22e72840de79e844d9c89b356de4f69dbd963a57`: no critical finding, seven warnings and nits applied, one deferred; `docs/plans/artifacts/2026-10-14-canvas-review/panel-d1/`. Round 2 on frozen `bc185e46fcf469466aa241b5e63c67dda395440f`, the delta plus drift-1 and the spec fix: no critical finding, three applied, one deferred; `docs/plans/artifacts/2026-10-14-canvas-review/panel-d2/` |
| `pnpm lint:task` as the last check that edits code | `docs/plans/artifacts/2026-10-14-canvas-review/build/close-lint-task-a2.log`: the eight code paths, 0 warnings and 0 errors, no bytes changed. Lint covers no MDX (`docs/plans/artifacts/2026-10-14-canvas-review/build/close-lint-task-docs-a1.log`) |
| Hand drive `check` log | `docs/plans/artifacts/2026-10-14-canvas-review/build/hand-drive-check-a2.log`: 39 of 39 cells covered after the round-2 fixes; drift-1 closed red to green |
| Code-quality review | skip: the api-build panel already owes a review of this diff, and every seat applies the code-quality lens |
| `review-ledger.mjs check` at close | The check names no error in this plan; its other errors belong to other sessions' plans. `lookup canvas` shows this plan as the head with no open state. Freshness reads stale until the owner commits the working-tree changes. |

## Steps

Execution playbook: Build (`.agents/playbooks/build.md`). Execution authority: the owner's `verdict canvas` request, whose Pursue continues into this build under Autopilot. The packet is every file the steps below name. Before the first edit to a file that holds another session's uncommitted work, copy it to `docs/plans/artifacts/2026-10-14-canvas-review/pre-edit/`. Today that covers `tooling/entrypoints/entrypoint-dag.mjs` and `tooling/oxlint/plate-baseline.json`.

### Phase 1. Cut the headless Excalidraw import

Keep it when the partitions typecheck and the planted import fails the lint; revert the phase otherwise.

- [x] 1.1 Run `pstack:blast-radius` on `ExcalidrawDataState`, the `excalidraw` element's `width` and the `files` check. Proof: a `build` row listing serialized documents, registry copies, docs, generated output and open plans that cite them. Closed by the decision log's `build` row "Blast radius of the type, width and files changes (step 1.1)".
- [x] 1.2 Delete `ExcalidrawDataState` and its `ImportedDataState` import from `BaseExcalidrawPlugin.ts`. Remove `{ peerDependencies: ['@excalidraw/excalidraw'] }` from the `excalidraw` entry in `tooling/entrypoints/entrypoint-dag.mjs`. Remove the alias's entry from `tooling/oxlint/plate-baseline.json` with the Edit tool. Proof: from `packages/platejs`, `pnpm run typecheck:partition:excalidraw`, `pnpm run typecheck:partition:excalidraw-react` and `pnpm run lint:partition:excalidraw` exit 0; from the root, `pnpm check entrypoint-graph` and `pnpm check lint-baseline` exit 0; a planted Excalidraw type import in `lib` fails `lint:partition:excalidraw` with `entrypoint-dag(no-forbidden-imports)`, each through `proof.mjs`.
  Closed by `docs/plans/artifacts/2026-10-14-canvas-review/build/p1-typecheck-partition-excalidraw-a1.log`, `docs/plans/artifacts/2026-10-14-canvas-review/build/p1-typecheck-partition-excalidraw-react-a1.log` and `docs/plans/artifacts/2026-10-14-canvas-review/build/p1-lint-partition-excalidraw-a1.log` in this checkout. Other sessions' uncommitted work fails both `pnpm check` steps here, so `docs/plans/artifacts/2026-10-14-canvas-review/build/p1-base-patch-a3.log` runs them at `6fa1169c5e` plus this task's hunks, where both pass. `docs/plans/artifacts/2026-10-14-canvas-review/build/p1-planted-import-a3.log` exits 1 on the forbidden-import line; the helper's `--expect-fail` reads only test-runner failure lines, so the log line is the assertion.

### Phase 2. Make the stored drawing truthful

Keep it when both specs run red at `HEAD` and green on the change; revert the phase otherwise.

- [x] 2.1 In `BaseExcalidrawPlugin.ts`, delete `width`, accept `files` only when absent or an object that is not an array, and set `validationVersion: 2`. In `BaseExcalidrawPlugin.spec.ts`, replace "accepts the persisted drawing width" with a case that a stored `width` is refused with `Unknown element property "width"`, and add a case that `files` as a string, an array or `null` is refused while an object passes. Proof: `node tooling/scripts/proof-worktree.mjs` at `6fa1169c5e` with `--with` the spec and `--expect-fail` each new case's `(fail)` line, running `test:partition:excalidraw`; then, from `packages/platejs`, `pnpm run test:partition:excalidraw` and `pnpm run test:partition:excalidraw-react` exit 0, the second covering the hook spec's image-files, `data: null` and read-only cases; and `pnpm check core-audits` exits 0, because `check-plate-schema-adoption.mjs` pins this spec's raw schema queries.
  Deviation: the spec has no case that a stored `width` is refused. `CODING_STANDARDS.md` forbids a test that only asserts a removed field is gone, and the schema core already refuses every undeclared property, as `docs/plans/artifacts/2026-10-14-canvas-review/probe-schema-a2.log` shows. The old width case is deleted instead.
  Closed by `docs/plans/artifacts/2026-10-14-canvas-review/build/p2-red-base-schema-a1.log`, where the three image cases fail at `6fa1169c5e`, and by `docs/plans/artifacts/2026-10-14-canvas-review/build/p2-test-partition-excalidraw-a2.log` and `docs/plans/artifacts/2026-10-14-canvas-review/build/p2-test-partition-excalidraw-react-a1.log`, both `exit=0`. `pnpm check core-audits` stops early in this checkout on generated declarations another session staged. At `6fa1169c5e` it fails with the same eleven findings with and without this task's hunks, none in this task's files, so this spec's pinned raw query count holds: `docs/plans/artifacts/2026-10-14-canvas-review/build/head-core-audits-a1.log` and `docs/plans/artifacts/2026-10-14-canvas-review/build/p2-base-patch-core-audits-a1.log`.
- [x] 2.2 In `migratePlateV54Ast.internal.ts`, pass each node's root and parent types, nearest first, from `migrateChildren` into `migrateDescendant`, and have `ownsProperty` query the target schema with that `root` and `ancestors`. The walker's `'main'` maps to `root: null`, because the schema getter refuses the primary root's name. The context is a required argument, so every `ownsProperty` caller passes it, the `listStart`, `indent` and `textAlign` checks included. `convertLegacyToggle` gets the Toggle's own context. It asks about Details properties in that context and about summary properties with Details prepended to the ancestors. The walker converts a Toggle before it descends, so a converted body's parent type is Details. Then drop `width` from `excalidraw` nodes unless `ownsProperty` finds it, beside the media `name` drop, which now gets the same context. In `migratePlateV54Ast.spec.ts`, add cases through `defineDocumentMigrations` and `runDocumentMigration`, adding no `plate@54` editor:
  - a v53 drawing with `width: '50%'` migrates without it;
  - a target that declares `width` on `excalidraw` only under a named root keeps it there;
  - a target that declares `width` on `excalidraw` only under Details keeps it in the body of a converted flat Toggle;
  - a target that declares `name` on a media type only under one parent keeps it there;
  - a flat Toggle in a named root that carries one property the target declares on Details only in that root, and one it declares on the summary only under Details, converts with both kept.

  Proof: `proof-worktree.mjs` at `6fa1169c5e` with `--with` the spec and `--expect-fail` the drop case, running `test:partition:migrations`. `node .agents/pstack/mutate.mjs` runs three mutants. One that stops passing `root` fails the named-root and Toggle cases. One that stops passing `ancestors` fails the Details-body and media cases. One that drops the Details prefix from the summary query fails the Toggle case. Then `pnpm run test:partition:migrations` from `packages/platejs` and `pnpm check core-audits` exit 0.

  Deviation: a Plate plugin cannot declare a named schema root, and `target.root('sidebar')` on an undeclared root fails to compile. A Plate document's extra roots belong to elements, and the editor checks each one with its root key and no ancestors. So the two root cases scope their property to every root but the primary one, with `target.not(target.root())`, in a root that a `sidebar` element owns. The walker's context and the mutants are unchanged.
  Closed by `docs/plans/artifacts/2026-10-14-canvas-review/build/p2-red-base-migrations-a1.log`, where all five new cases fail at `6fa1169c5e`, and by the three mutant logs under `docs/plans/artifacts/2026-10-14-canvas-review/build/mutate/`. Dropping `root` fails the two root cases, dropping `ancestors` fails the Details-body, media and Toggle cases, and dropping the Details prefix fails the Toggle case. `docs/plans/artifacts/2026-10-14-canvas-review/build/p2-test-partition-migrations-a1.log` passes 102 tests. The partition typecheck fails here only in a file another session staged and passes at the base plus this task's files (`docs/plans/artifacts/2026-10-14-canvas-review/build/p2-base-patch-typecheck-migrations-a1.log`). The spec keeps exactly the two type errors it had at `HEAD`. `core-audits` is attributed as in 2.1.
- [x] 2.3 Remove `width="50%"` and the `'width'` key of the `Pick` from `apps/www/src/registry/examples/values/excalidraw-value.tsx` and `cn/excalidraw-value.tsx`. Proof: a run-directory probe that loads `excalidrawValue` from both files into `createEditor` with `BaseExcalidrawPlugin` fails after 2.1 and passes after 2.3, and `apps/www`'s own `tsc --noEmit -p tsconfig.json` stage, run alone through `proof.mjs`, completes with its exit status in the log and lists no error in either file.
  Closed by `docs/plans/artifacts/2026-10-14-canvas-review/build/p2-probe-demo-values-before-a1.log`, which refuses both drawings for `width`, `docs/plans/artifacts/2026-10-14-canvas-review/build/p2-probe-demo-values-after-a1.log`, which loads both, and `docs/plans/artifacts/2026-10-14-canvas-review/build/p2-www-tsc-a1.log`, which exits 1 with eight errors in two drive specs and the staged Suggestions file, none in either value file.
- [x] 2.4 Load `changeset`. Amend `.changeset/excalidraw-v54-runtime.md` with the removed type and its two replacements, the removed `width`, the `files` check, the v54 upgrade's drop and the three app cases from Hard cuts and app migration. Replace its `editor.update.excalidraw.insert` line, which names no real call, with `editor.plugin(BaseExcalidrawPlugin).update.insert(props, options)`. Add a registry changelog entry for the demo value when `changeset` says the change reaches registry consumers. Proof: `pnpm check registry-changelog` exits 0, and `git grep update.excalidraw` finds nothing.
  Deviation: the changeset leaves out the three app cases and the schema-level `width` removal. `changeset` writes only the change from the release baseline, which is platejs 53 and `@platejs/excalidraw` 53 on `main`. That release had no closed schema and no declared `width`, so documents saved on a v54 beta are outside its scope. Hard cuts and app migration above keeps the three cases.
  Closed by `docs/plans/artifacts/2026-10-14-canvas-review/build/p2-check-registry-changelog-a1.log` (`exit=0`) and the new entry `apps/www/src/registry/changelog/entries/2026-10-14-excalidraw-demo-width.mdx`. The changeset now names the removed type and both replacements, the `files` rule, the v54 `width` drop and `editor.plugin(BaseExcalidrawPlugin).update.insert(props, options)`. `git grep update.excalidraw` finds only plans and review records.

### Phase 3. Teach the canvas boundary

Keep it when the docs checks pass and the hand drive covers every cell.

- [x] 3.1 Run `plate-docs` on `content/docs/(guides)/plugin-components.mdx` and its Chinese twin. Add a section on embedding a widget that owns its input: wrap it in `contentEditable={false}` and `data-editor-root-chrome-ignore="true"`. The editor already leaves native controls alone, and a click outside the marked wrapper still selects the node. Undo and Redo shortcuts are the one exception. Outside an IME composition, the editor takes them before the widget's own key handlers run, in a marked widget, a native control or a nested editor alike. An editable editor runs its own history for them, even when it has nothing to undo. A read-only editor only stops them, so a native text field still applies the browser's own undo. Proof: the docs checks `plate-docs` names, and the hand drive below.
  Deviation: Undo and Redo are not the one exception. The editor also takes Shift+Arrow from a nested editor or while its own selection is in another root, and Backspace, Delete and Enter while it holds a selection it draws itself, unless Alt, Ctrl or Meta is held. The Callout is titled "Keys the editor still takes" and lists both conditions, as diff rounds 1 and 2 found in `runtime-keyboard-events.ts`.
  Closed by `docs/plans/artifacts/2026-10-14-canvas-review/build/close-build-source-a1.log`, `docs/plans/artifacts/2026-10-14-canvas-review/build/close-docs-source-parity-a1.log` and `docs/plans/artifacts/2026-10-14-canvas-review/build/close-build-registry-check-a1.log`, all `exit=0`, and the hand drive's five Plugin Components cells in `docs/plans/artifacts/2026-10-14-canvas-review/build/hand-drive-check-a2.log`.
- [x] 3.2 Run `plate-docs` on `content/docs/(plugins)/(elements)/excalidraw.mdx` and its Chinese twin. Drop the `ExcalidrawDataState` rows and name the two replacements, state the `files` rule in Value shape, and correct the UI behavior table. It says that Undo and Redo shortcuts inside the canvas run the document's history, which the hook redraws into the canvas, and do nothing in read-only mode. It makes no promise about undo while a text label is open, which Open work tracks. It also says that the canvas's own undo buttons undo local steps and save the result. Add a custom-component note: keep the marked wrapper, pass `viewModeEnabled` from `useEditorReadOnly`, import the stylesheet, and link to the new Plugin Components section. Proof: the docs checks and the hand drive.
  Deviation: the page now documents the open label limit instead of leaving it out. Its UI behavior table has an "Open text label" row: a document undo leaves an open label editor's text unchanged, closing the editor writes that text back while the label still exists, and readers should close the label before they undo. The fix stays in Open work.
  Closed by the same three docs logs as 3.1, the twelve cells of the Excalidraw docs, example and component pages and the narrowest preview in `docs/plans/artifacts/2026-10-14-canvas-review/build/hand-drive-check-a2.log`, and the undo shortcut probe `docs/plans/artifacts/2026-10-14-canvas-review/drive/excalidraw-undo-probe.md`, where Undo from a focused canvas removed a typed word and kept a drawn shape, and Redo restored the word.
- [x] 3.3 Run `plate-docs` on `content/docs/examples/editable-voids.mdx` and `content/docs/(guides)/selection.mdx`, which teaches the sibling `data-editor-keep-selection-visible` marker, and their Chinese twins, and link each to the new section. Proof: the docs checks and the hand drive.
  Closed by the docs logs of 3.1 and the Editable Voids and Selection cells in `docs/plans/artifacts/2026-10-14-canvas-review/build/hand-drive-check-a2.log`. The drive found the three Chinese links opening the English page at an anchor it lacks (drift-1). They now open `/cn/docs/plugin-components#嵌入式组件`: `docs/plans/artifacts/2026-10-14-canvas-review/build/drift-1-red-a1.log` fails on them, `docs/plans/artifacts/2026-10-14-canvas-review/build/drift-1-green-a1.log` passes, and the browser lands on the heading.
- [x] 3.4 Run `pnpm --filter www build:registry` after the docs and demo edits, so the generated registry docs files stop naming `ExcalidrawDataState`. Proof: `pnpm --filter www build:registry --check` exits 0, and `git grep ExcalidrawDataState -- apps/www/public` finds nothing.
  Closed by `docs/plans/artifacts/2026-10-14-canvas-review/build/p3-build-registry-check-a1.log` (`exit=0`); the grep finds nothing.
- [x] 3.5 Run `best-api repair` on the removed type and field. Proof: a `git grep` of `ExcalidrawDataState`, of the `excalidraw` `width` and of `update.excalidraw` over live source, generated output, docs, skills and open plans returns only history, and `node .agents/rules/plate-next/scripts/sync-resources.mjs --check` exits 0.
  Closed by `teaching-sweep.mjs ExcalidrawDataState`, whose live hits are only this plan and the subject file the close folds, and `docs/plans/artifacts/2026-10-14-canvas-review/build/p3-sync-resources-check-a1.log` (`exit=0`). No Vision rule changes, because `docs/vision/common.md` already keeps optional runtime peers behind explicit subpaths.

### Close

- [x] Writing passes: `deslop`, then `no-comments`, on the product code, and one `unslop` pass on the docs, the changeset and this plan. Proof: `writing` rows.
  The product code, docs and changeset passes ran during the build. This plan's `unslop` and `bro` passes ran on the Close and the folded subject file.
- [x] The diff's panel (reviews: api-build). Proof: `seats` and finding rows.
  Round 1 found no critical finding. Its warnings and nits row lists seven applied and one deferred. Round 2 reviewed the round-1 fixes, drift-1 and the spec fix: no critical finding, three applied and one deferred.
- [x] `pnpm lint:task` on this task's paths only, then rerun the Phase 1 and Phase 2 proofs, both Excalidraw test partitions included, on the final bytes in a detached worktree at the base plus the saved patch. Proof: one log per command, each with `exit=0`.
  Closed by `docs/plans/artifacts/2026-10-14-canvas-review/build/close-lint-task-a2.log` (eight code paths, no bytes changed) and `docs/plans/artifacts/2026-10-14-canvas-review/build/close-final-base-patch-a1.log`, one `step` line per command. Every product file was last written before `final-product.patch`, so that run covers the final bytes. Its `core-audits` step is red at `6fa1169c5e` itself and shows the same eleven findings there.
- [x] `pnpm plite:release:packages -- --keep` packs the packages, runs each export in a fresh consumer and keeps that fixture. Its checker installs whatever optional peers a packed export imports, so it cannot fail on a leftover Excalidraw import by itself. A run-directory script therefore builds the export records with the checker's exported `getPublicExports` over the kept fixture's `platejs` package, calls `createPackedPublicExportPeerProofs` on them and asserts that the group holding `platejs/excalidraw` has no `requiredOptionalPackages` and forbids `@excalidraw/excalidraw`. Proof: the release log with `exit=0`, and the script's log, which passes on the change and fails at `6fa1169c5e` in a detached worktree.
  Accepted under the Defaults row "Packed release proof" (word: release gate). `docs/plans/artifacts/2026-10-14-canvas-review/build/close-packed-proof-candidate-a1.log` prints the PASS line, and `docs/plans/artifacts/2026-10-14-canvas-review/build/close-packed-proof-base-a2.log` fails on `@excalidraw/excalidraw` at the base. The release check exits 1 in both runs on the same 29 stale entrypoint size records, so it never reaches its own peer step.
- [x] Run `apps/www/tests/browser/excalidraw.spec.ts` on Chromium five times, warm, without retries, against a `www` server that serves this source. Proof: five logs, each with `exit=0`.
  Deviation: as written, the other session's spec failed all five runs on a Playwright strict-mode violation, because its Undo locator also matches the fixed toolbar's Undo, labeled since `3e0ab4dd7d`. Both Undo locators now read `page.locator('.excalidraw').getByRole(...)`, after a copy to `docs/plans/artifacts/2026-10-14-canvas-review/pre-edit/`. Closed by `docs/plans/artifacts/2026-10-14-canvas-review/build/spec-x5-run1-a2.log` through `spec-x5-run5-a2.log`, each one test passed and `exit=0`, against `www-drive` on port 3519 with `devSource` true.
- [x] Hand drive every cell `node tooling/scripts/hand-drive.mjs scope` lists for the changed files. On `/blocks/excalidraw-demo`, also draw a shape, then type a word in a paragraph, then focus the canvas and press the undo shortcut. The typed word goes away and the shape stays, which only document history does. Then focus the canvas again, press redo and see the word come back. Proof: the `check` log with `exit=0`, and a `verify` row for the shortcut with its screenshots.
  Closed by `docs/plans/artifacts/2026-10-14-canvas-review/build/hand-drive-check-a2.log` (39 of 39 covered) and the `verify` row "Undo and Redo from a focused Excalidraw canvas run document history" with `docs/plans/artifacts/2026-10-14-canvas-review/drive/excalidraw-undo-after.png` and `docs/plans/artifacts/2026-10-14-canvas-review/drive/excalidraw-redo-after.png`.

## Proof

Each step names its own proof. Phase 2's specs must fail at `HEAD` for the stated reason before they pass on the change, and the hook's spec covers saved images, cleared data and read-only. The browser spec proves that a drawing without images still saves under the stricter `files` check. The hand drive covers the changed docs pages, the demo and the undo shortcut the docs now describe.

## Close

### Reversals and deviations

- The plan dropped the arena's view-mode graft before the build. The copied component keeps `viewModeEnabled`, because Excalidraw 0.18.0 lets Alt+R leave view mode while that prop is undefined.
- Step 2.1 adds no test that a stored `width` is refused. `CODING_STANDARDS.md` forbids a test that only asserts a removed field is gone, and the schema core already refuses every undeclared property.
- Step 2.2's two root cases scope their property to every root but the primary one, in a root a `sidebar` element owns, because a Plate plugin cannot declare a named schema root. The walker's context and the three mutants match the plan.
- Step 2.2's implementation landed before its spec cases. The base run and the mutants still show that each case fails without the change it names.
- Step 2.4's changeset leaves out the three app cases and the schema-level `width` removal, and with them graft 4's fingerprint note. Its release baseline, platejs 53 on `main`, had no closed schema. Hard cuts and app migration keeps all three cases.
- Step 3.1's Callout lists more keys than Undo and Redo. The editor also takes Shift+Arrow from a nested editor or while its selection is in another root, and Backspace, Delete and Enter while it holds a selection it draws itself.
- Step 3.2's page documents the open text label limit instead of staying silent on it.
- The browser spec ran with this run's edit to another session's file. As written, it failed 5 of 5 on an Undo locator that also matched the toolbar's Undo. Both locators now scope to `.excalidraw`, and no assertion changed.
- The packed release proof is the peer-closure assertion alone, accepted under the Defaults row "Packed release proof". The release check fails on 29 stale size records at the base and on the change.
- Drift-1 closed on a run-directory anchor check and a browser click, not on a repository test that fails at the old code, as the hand-drive rule asks. A repository anchor test over every docs page would fail on 16 older broken anchors, which a suggested task fixes. The Defaults row "Drift-1 check" records this call.
- Four slips against the owner's rules. The run-directory queue file was edited once with an inline `node -e` script and once with `sed -i`. The review page was replaced in full once with the Write tool. The registry changelog generator in step 2.4 rewrote three generated files that held another session's entries, `2026-10-14-exit-break-demo-copy.json`, `index.json` and `components.json`, with no pre-edit copy. Their new bytes match that session's own staged sources, and the autostage hook has restaged them, so the old bytes are gone.

### What landed

- `platejs/excalidraw` no longer exports `ExcalidrawDataState` or lists the Excalidraw peer, so `entrypoint-dag(no-forbidden-imports)` refuses an Excalidraw import there.
- The `excalidraw` element schema has no `width`, accepts `data.files` only as an object, and validates at version 2.
- `migrateV54` drops `width` from `excalidraw` nodes unless the target schema declares it. Its `ownsProperty` check now takes each node's root and parents, which also scopes the media `name` drop and the Toggle conversion.
- Both Excalidraw demo values drop `width`, with a registry changelog entry.
- `.changeset/excalidraw-v54-runtime.md` names the removed type and both replacements, the `files` rule, the `width` drop and the real insert call.
- Plugin Components gains an Embedded widgets section, a Callout on the keys the editor still takes and an API row for the marker. The Excalidraw page names the replacement types, the `files` rule, the undo rows and a custom component section. Editable Voids and Selection link to Embedded widgets. Every Chinese twin follows.
- The generated registry output no longer names the removed type.

### Proof and its limits

- Phase 1: the partition typecheck and lint pass in this checkout. `entrypoint-graph` and `lint-baseline` pass only at `6fa1169c5e` plus the task patch, because other sessions' uncommitted files fail both here. The planted import fails the lint.
- Step 2.1: the three image cases fail at the base and pass on the change. `core-audits` fails at the base with the same eleven findings with or without this task's hunks, so it shows only that the task adds none.
- Step 2.2: all five new cases fail at the base, each mutant fails exactly the cases the plan names, and the partition passes 102 tests. Its typecheck passes only at the base plus the task patch.
- Step 2.3: the demo values are refused before the edit and load after it. The `apps/www` type stage exits 1 on eight errors in other files here. At the base and at the base plus this task's files it gives the same ten errors, so the task adds none.
- Docs: `build:source`, docs source parity and `build:registry --check` pass on the final docs bytes. `check:docs` stops at `api-reference:check` on another session's `SchemaRoot`, so its later links ran alone. `api-reference:check` never ran at the base, because a fresh worktree has no built declarations; its config names no Excalidraw entrypoint, and the task's one migrations change is internal. The anchor check is a run-directory script, red then green, not a repository test.
- Final bytes: `lint:task` changed nothing, and the rerun at the base plus the saved patch passes every Phase 1 and Phase 2 command except `core-audits`, which fails at the base itself.
- Packed: the peer assertion walks the packed runtime and declaration files, where the removed type-only import lived, and passes on the change and fails at the base. The release check is red at both, so its stage that typechecks a consumer without Excalidraw installed never ran.
- Migration: the v54 Ast step keeps a property an app declares for one root or parent. The Profile step that runs before it still asks without that context, so the full migration does not yet promise it. Open work tracks the fix.
- Browser: the spec passes 5 of 5 on Chromium against a `www` server serving source. Firefox and WebKit did not run. Its canvas Undo check cannot catch a hook that stops clearing history; the hook's unit spec proves only that it calls `history.clear()`. Open work tracks the stronger check.
- Hand drive: 39 of 39 cells, every screenshot read. The undo shortcut probe ran once, on Chromium at 1280 wide in light mode.
- Speed: no paired timing run finished, so whether the context walker slows the v53 upgrade is unmeasured. One unpaired sample per side ranged from 20% faster to 8% slower across the four cohorts, which proves nothing under the noise rule. Open work tracks the rerun.
- Not proven: the open text label limit on the Excalidraw page rests on a source read, not a browser run. The view-mode decision rests on a source read too. Whether apps stored `width` is unknown. Apps on a v54 beta that saved a drawing width find no note in the release notes, because the changeset covers only the change from platejs 53; the recipe is in Hard cuts and app migration.

### Counts

29 items: 11 steps, 12 Completion Gates and 6 Close boxes. 27 are done, 1 is partial, 1 is skipped, 0 are blocked and 0 are open. The partial item is the packed release proof, accepted under its Defaults row. The skipped item is the code-quality review, which the diff panel covered.

### Review inputs

This run changed these inputs:
- `packages/platejs/src/migrations/migratePlateV54Ast.internal.ts`, `packages/platejs/src/migrations/migratePlateV54Ast.spec.ts`
- `content/docs/(guides)/plugin-components.mdx`, `content/docs/(guides)/plugin-components.cn.mdx`, `content/docs/(plugins)/(elements)/excalidraw.mdx`, `content/docs/(plugins)/(elements)/excalidraw.cn.mdx`, `content/docs/examples/editable-voids.mdx`, `content/docs/examples/editable-voids.cn.mdx`, `content/docs/(guides)/selection.mdx`
- `tooling/entrypoints/entrypoint-dag.mjs`, `tooling/oxlint/plate-baseline.json`

Only other sessions changed these inputs since `6fa1169c5e`: `packages/plitejs/src/react/editable/keyboard-input-strategy.ts`, `tooling/scripts/check-plate-schema-adoption.mjs`, `packages/plitejs/src/interfaces/schema.ts`, `packages/platejs/src/migrations/documentMigrations.ts`, `docs/vision/plate.md`, `packages/plitejs/src/dom/plugin/dom-integrity-observer.ts`, `apps/www/src/registry/components/editor/table.tsx`, `apps/www/src/i18n/getI18nValues.ts`, `apps/www/src/registry/examples/playground-demo.tsx`, `packages/platejs/src/utils/plugins/ExitBreakPlugin.ts` and `packages/platejs/src/excalidraw/react/useExcalidrawSync.spec.tsx`, which another session staged after this run's proofs ran.

These inputs were read and stayed unchanged: `packages/plitejs/src/react/editable/runtime-keyboard-events.ts`, `packages/plitejs/test/react/editing-kernel-contract.ts`, `packages/platejs/src/migrations/v53-manifest.internal.ts`, `VISION.md`, `docs/vision/common.md`, `docs/research/review-records/2026-10-04-canvas-audit.json`, `docs/plans/2026-09-07-full-plate-ui-extraction-audit.md`, `packages/plitejs/src/react/editable/input-controller.ts`, `packages/plitejs/src/react/editable/root-interaction-resolver.ts`, `packages/plitejs/test/react/void-interactive-mouse.test.tsx`, `packages/platejs/src/react/components/NodeSelection.tsx`, `apps/www/src/registry/examples/values/demo-values.tsx`, `apps/www/src/registry/examples/values/cn/demo-values.tsx`, `apps/www/src/registry/components/editor/fixed-toolbar.tsx` and `packages/platejs/src/utils/index.ts`.

### Shared files

The files this run changed hold only its hunks, with three exceptions. `tooling/entrypoints/entrypoint-dag.mjs` and `tooling/oxlint/plate-baseline.json` also carry other sessions' uncommitted lines, and the second hunk of `selection.mdx` is another session's staged edit. `apps/www/tests/browser/excalidraw.spec.ts` and `packages/platejs/package.json` kept every hunk the other session wrote.

### Reviews

`architect` ran three runners and a blind cross-judge. The plan's panel ran three rounds, the cap, and the diff's panel ran two rounds, none with a critical finding. The decision-trail review ran on `gpt-6.1-sol @xhigh`.

### Attention

reviewed by gpt-6.1-sol @xhigh

The seat named itself GPT-6 Codex in its answer.

- warning: the changelog generator rewrote three files holding another session's entries with no pre-edit copy. Logged as a slip; the old bytes are gone, and the new ones match that session's sources.
- warning: the packed proof never ran a consumer without Excalidraw. Running the export cannot tell base from change, since the import was type-only. The Close names the unrun consumer typecheck.
- warning: the changeset gives v54 beta users no migration note. The changeset rule writes only the change from platejs 53. The gap is named above, and the recipe stays in Hard cuts and app migration.
- warning: the Profile step still drops context. It is in Open work, and the Close no longer claims the whole migration keeps contextual properties.
- warning: no browser run proves that projection clears canvas history. It is in Open work, and the Close says the unit spec proves only a call count.
- warning: the open text label limit rests on a source read. The Close says so.
- warning: five "older than this change" observations had no base run. The Close labels them inferred, and a correction row follows the original.
- warning: the www type stage and `check:docs` failures lacked base runs. The www type stage now matches the base error for error. `api-reference:check` stays unrun, on source evidence.
- warning: drift-1 closed without a repository test. Logged as a deviation under the Defaults row "Drift-1 check".
- warning: the performance-pack exclusion was stale. The Start Gates row now applies, and the timing probe is an inconclusive gate in Open work after a loaded host stopped it.
- nit: the review page was once replaced in full with the Write tool. Logged as a slip.

### Seen, older than this change

The hand drive saw five defects that none of this change's hunks touches, so the run calls them older than this change without a base run: raw backticks in every releases card body, the first releases card squeezing its chip at 375 wide, English demo text on Chinese pages, a light canvas inside dark pages, and white text on the migration demo's yellow header fill in dark mode. The anchor check found 16 older broken anchors across 12 docs files. Suggested tasks cover the releases code spans, the anchors, the stale size records, `proof-worktree --expect-fail` on lint lines and the open text label fix.

## Open work

- Replace the hook's `restore` parameter with `restoreElements` and `restoreAppState`, which Excalidraw 0.18.0 and its main branch both export, when the app upgrades past 0.18.0. A copy passes the whole module, so the change breaks only a caller that hand-builds the object. The canvas subject file's Open work tracks it. owner: zbeyens. stop: the `@excalidraw/excalidraw` upgrade that drops `restore`.
- Undo while an Excalidraw text label is open runs document history and redraws the scene, but the open label editor keeps its old text, so closing the label writes that text back whenever the label's element survives the undo. The panel traced this in the installed 0.18.0 source; nobody has driven it in a browser. The Excalidraw page documents the limit. Fix the sync, for example by closing an open label before projecting a document change. The canvas subject file's Open work tracks it, and a suggested task offers the fix. owner: zbeyens. stop: a browser repro and a fix or a documented limit land.
- Undo and Redo pressed inside a nested editor, such as the Editable Voids demo's inner editor, run the outer editor's history, so the inner editor's own history is unreachable from the keyboard. A browser run confirmed it (`docs/plans/artifacts/2026-10-14-canvas-review/drive/nested-undo-probe.md`), and the Editable Voids page now states it as a limitation. Fixing it means Plite routing history keys to a nested editor's own runtime. owner: zbeyens. stop: a Plite plan for nested-editor history routing.
- The v54 Profile step (`migratePlateV54Profile.internal.ts`) still asks `ownsProperty` without the node's root or parents, so its renames and drops can miss a property an app declares for one root or parent. The diff panel's round 1 raised it; this plan's steps cover only the Ast step. owner: zbeyens. stop: a plan that reopens the v54 migration profile.
- The Excalidraw browser spec checks that the canvas Undo is disabled after a projected document change, but the canvas history is already empty there, so the check cannot catch a hook that stops clearing it. The hook's unit spec does catch that (`useExcalidrawSync.spec.tsx` counts four `history.clear` calls). Diff round 2 raised it; the spec belongs to another session. Draw a shape and assert the canvas Undo enabled before the projection. owner: zbeyens. stop: the next edit to `apps/www/tests/browser/excalidraw.spec.ts`.
- Rerun the v53 upgrade timing probe on a quiet host. It times one `migrateDocument` call per cohort (300 and 10,000 paragraphs, 2,000 drawings, and 40 blockquote chains 24 deep) and asserts each cohort's shape first. The frozen line is a median paired ratio of at most 1.10 against `6fa1169c5e` on every cohort, with a one-minute load limit of 9. The planted arm adds a 0.08 ms spin at the top of `migrateDescendant`. Recreate the four worktrees with `proof-worktree.mjs`, then run `paired-timing.mjs` on `docs/plans/artifacts/2026-10-14-canvas-review/perf/config.json`. A conclusive miss sends step 2.2's context walker back to `architect`. owner: zbeyens. stop: a conclusive run, or the next edit to `migratePlateV54Ast.internal.ts`.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Next step for canvas | Build the reviewed plan (look) | Stop here | hold | big |
| Unused drawing width | Delete it, and remove it from older documents on upgrade (look) | Let people resize drawings | resize | small |
| Excalidraw data type | Delete it (look) | Keep it and fix its description | keep type | small |
| Saved settings name | Keep calling it state (look) | Rename it to Excalidraw's appState | appstate | small |
| Canvas input attribute | Keep its name and document it | Rename it first | rename | small |
| Saved images check | Refuse images saved in the wrong shape | Keep accepting anything there | loose files | detail |
| View-only switch | The copied component keeps it | Move it into the drawing hook | hook view | small |
| Packed release proof | Count the peer check as proof, since the release check also fails on 29 old size records before this change (look) | Keep the box open until the size records are refreshed | release gate | small |
| Drift-1 check | A link check in the run folder plus a browser click (look) | Add a repository link test now | anchor test | small |
| Canvas page link | The old page at Fb5GuoQGwRXR1etzCauZbV no longer opens, so the page moved to TizB11h9kY6spbRpx49oV3 | Drop the new page | drop page | detail |

## Evidence

Model: claude-opus-5-5 at xhigh effort, read from this session's metadata.

### Requirements

- Persist an Excalidraw scene inside the document as a void block with JSON-safe, validated data ([plate.md](../vision/plate.md), the schema property laws).
- Keep the Excalidraw runtime out of the headless value contract (the ledger question). Optional runtime peers stay behind their explicit subpath, and a package root exposes only code backed by its required dependencies ([common.md](../vision/common.md), Boundary Law).
- Project document changes, document undo and read-only into the mounted canvas without echo writes or transient viewport state.
- Let the embedded canvas own its own pointer, keyboard, focus and DOM changes inside the editor (native-behavior law). When the view derives the behavior from its DOM, Plite React owns a literal DOM protocol and copied UI applies the markers ([VISION.md](../../VISION.md), Boundary Law).
- A closed-schema property needs a reader or a writer, and persisted fields are public API worth their compatibility cost ([common.md](../vision/common.md), Taste).
- Durable neutral lifecycle stays with the feature owner even with one consumer; the copied renderer owns loading, frame and presentation ([plate.md](../vision/plate.md), the split-hook paragraph).
- Normal customization that must reach into internals marks a wrong boundary ([common.md](../vision/common.md), Taste).
- The owner's run asked to build on the uncommitted `apps/www/tests/browser/excalidraw.spec.ts` and `packages/platejs/package.json` and never revert them.

### Current source

- `BaseExcalidrawPlugin.ts` declares `data` as `property.json` with a validator that requires an `elements` array and a `state` object, `validationVersion: 1`, and `width: property.string()`, on a `void: 'block'` element. It exports `ExcalidrawDataState = ImportedDataState`, a type-only import from `@excalidraw/excalidraw/data/types`.
- `useExcalidrawSync.ts` maps `state` to Excalidraw's `appState` when it restores a scene and maps `appState` back to `state` when it saves, through `serializeAsJSON(..., 'local')`. It saves only when the serialized scene changed, applies document changes with `captureUpdate: 'NEVER'` and `history.clear()`, and ignores canvas writes while read-only.
- The copied `excalidraw.tsx` renders `<div contentEditable={false} data-editor-root-chrome-ignore="true">` around a fixed `h-[600px] w-[min(100%,600px)]` frame and passes `viewModeEnabled={readOnly}` from `useEditorReadOnly`. It never reads `element.width`. A `git grep -w width` over the package, the copied component and the docs finds the property only in the schema, one spec and the demo value.
- `git grep ExcalidrawDataState` outside plans and records finds only its declaration, two rows of `excalidraw.mdx` and its `plate-baseline.json` entry, which grandfathers the alias as a `plate/no-second-name` finding. The headless `excalidraw` entry in `tooling/entrypoints/entrypoint-dag.mjs` lists `@excalidraw/excalidraw` as its peer, and that type import is the only Excalidraw import under `packages/platejs/src/excalidraw/lib/`.
- Plite reads the marker in three places. `input-controller.ts` holds `isInteractiveInternalTarget` and `isNativeInternalControlTarget`, which the keyboard, clipboard, input, selection and focus paths call. `root-interaction-resolver.ts` uses it to skip mouse-down caret placement, and `dom-integrity-observer.ts` uses it to leave foreign DOM changes alone. Plite's drop cursor and view-selection caret, Plate's `NodeSelection` highlight, the copied table resize handles and the copied canvas all set it. `void-interactive-mouse.test.tsx` proves that marked canvas controls keep their first gesture while a click on the unmarked void area selects the node. No page under `content/docs` names the marker.
- `migratePlateV54Ast.internal.ts` drops a media node's `name` unless the target schema owns it (`ownsProperty`), and `v53-manifest.internal.ts` lists `excalidraw` as `element-unchanged`, the same kind as `audio`, whose `name` that drop removes.
- In the installed Excalidraw 0.18.0, Alt+R runs `actionToggleViewMode` whatever the prop, and `syncActionResult` then keeps a defined `viewModeEnabled` prop's value or, while the prop is undefined, takes the action's result. The action's `predicate`, `typeof appProps.viewModeEnabled === "undefined"`, only hides it from the command palette (`dist/dev/index.js`). `api.updateScene`, which the hook uses, sets app state directly and keeps the current view mode.
- Plite classifies Undo and Redo keys as `history` before it checks the target, unless an IME composition is active, which it classifies first (`input-controller.ts`). It captures them from every internal control, which covers native controls, nested editors and the marker (`runtime-keyboard-events.ts`). An editable editor then runs document history, even an empty one, with `preventDefault` and `stopPropagation`, and a read-only editor only calls `stopPropagation` (`keyboard-input-strategy.ts`). The kernel contract "beforeinput history stays model-owned for internal controls" pins the same choice for `beforeinput`.
- Legacy Plate (`../plate` at `ee214137564c7c060b6993ba69700bd616564ab4`) used `ExcalidrawDataState` to type the stored element data and the React hook's `initialData`. Both consumers are gone in v2. The legacy demo set `width="50%"` too, and its UI never read it.

### Runtime proof

`docs/plans/artifacts/2026-10-14-canvas-review/probe-schema-a2.log` ran `BaseExcalidrawPlugin` from source (`loaded-from-source true false`) through `editor.read.schema.assertDocument` and `createEditor({ initialValue })`, exit 0:

- `{ data: { elements: [], state: {} } }` is accepted, the control.
- The same data with `width: '50%'` is accepted and stored, because the schema declares it.
- The same data with an undeclared `height` is refused by both calls with `Unknown element property "height" in closed editor schema.`, which is what a stored `width` meets once the schema drops it.
- `{ data: { elements: [], appState: {} } }`, the shape `ExcalidrawDataState` documents, is refused by both calls with `Editor element property "data" fails custom property validation.`

`docs/plans/artifacts/2026-10-14-canvas-review/probe-v53-width-a1.log` ran `migrateV54` through `defineDocumentMigrations` and `migrateDocument` from source. With the shipped schema, a v53 drawing holding `width: '50%'` migrates and keeps it. With `width` removed from the schema, the same drawing is refused with `Unknown element property "width" in closed editor schema.`, and one without `width` migrates.

`docs/plans/artifacts/2026-10-14-canvas-review/probe-files-a1.log` ran the schema check from source: an object `files`, an empty object, a string, an array and `null` are all accepted at `HEAD`.

### Lanes

1. **Keep everything. Loses.** The block, the hook and the copied frame are sound, but the docs teach a type whose values the schema refuses, a dead stored field, and an attribute a custom copy cannot learn.
2. **Strongest deletion: delete `platejs/excalidraw` and copy everything into the registry. Loses.** The hook carries durable invariants: no save echo, document undo projection, read-only rejection and the stale-callback guard that its spec covers. [plate.md](../vision/plate.md)'s split-hook paragraph keeps that lifecycle with the feature owner even with one consumer. The cut's predicted benefit is one package entrypoint fewer, which does not pay for re-deriving those guards in every copy.
3. **Store Excalidraw's own key, `appState`, instead of `state`. Loses.** `elements` and `files` are already stored as Excalidraw writes them, so one name would match Excalidraw's export and remove the two renames in the hook. But Plate has stored `state` since legacy Plate, so every saved drawing would need a migration, and the gain is a key name inside one JSON value. [udecode/plate#3105](https://github.com/udecode/plate/issues/3105) shows a user passing Excalidraw props to insert; deleting the misleading type and documenting the stored shape answers that confusion without a data change.
4. **Make `width` real with a resize handle, as media does through `platejs/resizable/react`. Loses for now.** No issue among the 17 `gh search issues --repo udecode/plate excalidraw` returned on 2026-10-14 asks for resizing, and the copied frame is fixed. A future resize job adds the field back with its reader and writer.
5. **Rename the marker to an embedded-control name before documenting it. Loses.** One semantic serves five owners across Plite, Plate and the registry: content inside the editor DOM that the editor leaves alone. It already belongs to the `data-editor-root-chrome` family that `useRootChrome` writes. A rename churns Plite's DOM protocol, its tests and the integrity observer's attribute list for a reader gain that one docs sentence also delivers.
6. **A Plate wrapper component that renders the marker. Loses.** It would wrap one attribute, and doctrine has copied UI apply Plite's literal markers, as it does with `data-editor-keep-selection-visible`.
7. **Edit in a modal outside the editor, as Lexical does. Loses.** Lexical shows an SVG preview in the document and portals the live canvas to `document.body`, so no marker is needed and a stored size has a real reader. But drawing inline is the copied UI's product choice, the preview needs an export step on every change, and a custom copy that wants inline drawing would still need the marker. The modal stays open to any app as its own copied UI.
8. **Store the scene outside the document behind an app URL. Loses.** It adds a storage gateway and orphan lifecycle for an unmeasured size problem, and drops document undo and collaboration of the drawing.
9. **Repair the contract at its owners. Wins.** Delete `ExcalidrawDataState` and the headless entrypoint's Excalidraw peer, delete `width` with a v54 upgrade drop and app migration text, check `files` as declared, and document the marker on the Plugin Components guide and the Excalidraw page.

**Proof limits.** The probes are source runs of the schema and the migration, not browser runs. Whether downstream apps stored `width` is unknown; the field reaches documents only from the demo value or app code that copied it. The per-change `serializeAsJSON` cost on image-heavy drawings was not measured, and nothing here changes it. The editor comparison is a source read by a Codex reader, spot-checked by the lead on Lexical's serialized node and Excalidraw's `serializeAsJSON`. That reader also found that Excalidraw's main branch no longer exports the `restore` the hook calls; the installed 0.18.0 still does, so this matters only at the next Excalidraw upgrade. The view-mode decision rests on a source read of the installed Excalidraw bundle and a seat's run of its `updateScene`, not a browser run of a copy without the prop.

### Dependents

- `distribution`: unaffected. It reaches canvas only through `packages/platejs/src/utils/plate-keys.ts` (`packages/platejs/src/utils/index.ts`, `packages/platejs/src/internal/plugin/markdownParagraph.ts` and the utils plugins), and the plan changes no plugin key.
- `editing`: unaffected for the same reason, through `packages/platejs/src/utils/plugins/ExitBreakPlugin.ts`, `SingleBlockPlugin.ts`, `SingleLinePlugin.ts` and `TrailingBlockPlugin.ts`.
- `ui`: unaffected. `apps/www/src/registry/components/editor/fixed-toolbar.tsx` imports `InsertToolbarButton`, `apps/www/src/registry/components/editor/plugins.ts` imports the slash kit, and `apps/www/src/registry/examples/values/demo-values.tsx` and its Chinese twin import `excalidrawValue`. Every one of those exports keeps its name, and only the demo value's `width` attribute leaves.

### History

- This review retains [2026-10-04-canvas-audit](../research/review-records/2026-10-04-canvas-audit.json), because its Pursue, its three defects and its rejected lanes still hold. This review keeps the marker name that review left to `best-api`, rejects its open `appState` option, and adds the measured schema refusals and the entrypoint peer cost.
- This review retains [2026-09-07-full-plate-ui-extraction-audit](2026-09-07-full-plate-ui-extraction-audit.md), recorded as `2026-09-18-recovered-2026-09-07-full-plate-ui-extraction-audit`, because its sync ownership and its Plite control-boundary repair stay.
- [2026-07-12-plate-next-excalidraw-find-replace-floating-package-reviews](2026-07-12-plate-next-excalidraw-find-replace-floating-package-reviews.md): historical, superseded by the 2026-09-07 sync design.
- The ledger marked the October 4 verdict stale. Its member changes since then are a browser handle key rename in the test, a spec tweak and dependency bumps in `apps/www/package.json`, none of which touches the contract. The doctrine moved too. The new Taste lines on deep interfaces, single paths and exact carriers support this verdict, and no new line contradicts it.
