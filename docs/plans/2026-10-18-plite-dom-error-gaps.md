# Plite DOM error gaps

Status: executed; the cost gate's quiet-host rerun waits on t_cbbb1ad9
Page: https://claude.ai/artifact/DTD59Qvg8NGXuLyrwycERz
Playbook: build

## Brief

### What will change?

Plite's own code no longer crashes when DOM is missing, and coverage lookups answer "not found". Editor errors with no handler reach the browser's error event, and production reports a renderer that drops editable content.

### What could go wrong?

Apps with no error handler now see page errors the console hid. A slow child reports unless a coverage boundary marks it. The speed check stays open because the machine was busy, and a quiet rerun is queued.

## Teach

Plite maps editor content to DOM nodes and has two kinds of lookup. Strict lookups throw, for app code that knows the DOM exists. Soft lookups return nothing, for code that runs while React may still be mounting.

Today some of Plite's own runtime code calls the strict lookups and catches the throw. The coverage lookups throw for content that just isn't mounted. Errors with no handler mostly go to the console. When a custom renderer forgets to render its children, only development builds say so.

After this, runtime code uses soft lookups, and a lint rule keeps it that way. Coverage lookups return nothing. Unhandled lifecycle errors go to the browser's error event. One checker reports a dropped child in every build. It looks twice, a frame and a macrotask apart. It reports only when the editor is on the page, the parent rendered that child, and neither one bound in between. A child portaled into a slow iframe needs a coverage boundary.

## Public API

A coverage lookup returns null when the point has no DOM and no boundary covers it, so callers check for null instead of catching a throw.

```ts before
// packages/plitejs/test/react/dom-coverage-boundary-contract.tsx:146
const point = runtime.domCoverage.resolveDOMPointOrBoundary({
  path: [1, 0],
  offset: 2,
});
expect(point.type).toBe('dom-point');
```

```ts after
// packages/plitejs/test/react/dom-coverage-boundary-contract.tsx:146
const point = runtime.domCoverage.resolveDOMPointOrBoundary({
  path: [1, 0],
  offset: 2,
});
expect(point?.type).toBe('dom-point');
```

A new soft root lookup returns null when the editor has no mounted root, beside the strict `findDocumentOrShadowRoot`, which keeps throwing.

```ts before
// packages/platejs/src/react/features/table/TablePlugin.tsx:411
const domSelection = getSelection(
  editor.api.dom.findDocumentOrShadowRoot()
);
```

```ts after
// packages/platejs/src/react/features/table/TablePlugin.tsx:411
const root = editor.api.dom.resolveDocumentOrShadowRoot();
if (!root) return undefined;
const domSelection = getSelection(root);
```

An app's lifecycle sink gets a new report when a `renderElement` leaves an editable child without DOM or a DOM coverage boundary.

```ts before
```

```ts after
// content/docs/api/core.mdx, lifecycleErrorSink (planned)
const editor = createEditor({
  lifecycleErrorSink: (error) => {
    if ('source' in error && error.source === 'render-element') {
      reportBug(error.cause, {
        childPath: error.childPath,
        path: error.path,
        phase: error.phase,
      });
    }
  },
});
```

The new `EditorLifecycleError` member:

```ts
| Readonly<{
    cause: Error;
    childPath: Path;
    editor: TEditor;
    element: Element;
    path: Path;
    phase: 'commit' | 'selection-export';
    source: 'render-element';
  }>
```

`phase: 'commit'` comes from the development check after an element renders. `phase: 'selection-export'` comes from a failed post-commit selection export in any build.

A history handler that throws after an undo or redo now reaches the sink with a new phase, instead of skipping it. `'replay'` stays for a replay that could not finish.

```ts before
// packages/plitejs/src/interfaces/editor.ts:2874
| Readonly<{
    cause: unknown;
    direction: 'redo' | 'undo';
    editor: TEditor;
    phase: 'replay';
    source: 'history';
  }>;
```

```ts after
// packages/plitejs/src/interfaces/editor.ts:2874
| Readonly<{
    cause: unknown;
    direction: 'redo' | 'undo';
    editor: TEditor;
    phase: 'observer' | 'replay';
    source: 'history';
  }>;
```

## Main changes

- **One lifecycle default.** `reportEditorLifecycleError` with no sink calls `globalThis.reportError` for every source, and `console.error(error)` only where `reportError` does not exist. It reports one `Error` whose message names the source, the phase and the fields that identify the failing part, such as the plugin name, MIME type or key, with the original as its `cause`. A bare cause would drop all of that, which `console.error(error)` shows today. A throwing sink stays contained. This closes the open item at `docs/plans/topics/history.md:167`. Bun fails any test that calls `reportError`. One Bun test reaches the default today, `authored-tree-decide-completion.test.ts:93`, and the build fixes its hidden `afterPublish` error at the cause.
- **History handlers reach the sink.** A history replay never rejects: the history owner reports its own failure with `phase: 'replay'` and settles `failed` (`history-plugin.ts:929`). So `dispatchHistory` (`editable-dom-runtime.ts:1132`) uses `phase: 'replay'` only for a throw before an outcome exists, such as a synchronous throw from `history[direction]()`. Everything after an outcome reports `phase: 'observer'`, each step on its own: the view selection write, the focus handler, `onHistoryReplay` and the fulfillment callback. `runAllRuntimeSteps` rethrows only the first error (`editable-dom-runtime.ts:130`), so this path stops using it. Its own `reportError` call and scheduled rethrow are deleted.
- **Nullable coverage lookups.** `resolveDOMPointOrBoundary` and `resolveDOMRangeOrBoundary` call the root-scoped `resolveDOM*InRoot` resolvers and return `null` when neither DOM nor a boundary answers. `assertCoverageDOMResult` is deleted.
- **Runtime lookups never throw.** The 25 runtime `assertDOM*` calls switch to resolvers. The editor root comes from `DOMEditor.editable(editor)`, which also removes the `as unknown as Node` casts in `focus-plite-editable.ts`. A catch that existed only for the lookup is deleted; a catch that also guards a DOM write stays and loses only the strict call. The `resolveEventRange` catch stays, because `hasDOMNode` rethrows browser errors other than Firefox's restricted-node one (`dom-editor.ts:1674-1682`). The build classifies all 101 runtime `try` blocks under `dom/` and `react/` and logs the list, so a strict lookup reached through another name cannot hide.
- **Soft root lookup.** `resolveDocumentOrShadowRoot` joins `DOMEditor` and `editor.api.dom` and returns `null` with no mounted root. `findDocumentOrShadowRoot` stays strict and unwraps it. Its 23 Plite runtime callers, 20 in `react/` and 3 inside `dom-editor.ts`, and the Table plugin's `mouseUp` move to the soft lookup, because the strict one asserts the root inside (`dom-editor.ts:1275`) and the post-commit export, `blur` and `deselect` reach it.
- **Soft window and key reads.** An internal window read returns `null` before the first mount. It serves `resolveDOMDropTarget` (`dom-drag.ts:579`), a public resolver that throws today on an unmounted editor. It also serves the three clipboard codec lookups (`dom-clipboard-runtime.ts:408, 726, 751`) and `content-root-navigation.ts:176`, and their catches go. `resolvePoint` builds its range from the text node's own `ownerDocument` instead of strict `getWindow` (`dom-editor.ts:2174`), because a caller can resolve a leaf point before the editor's window is recorded. Event handlers keep strict `getWindow`, because an event on mounted DOM means the window is set. The build logs every remaining runtime `getWindow` call with why it cannot run before that first layout effect (`selection-reconciler.ts:1020`). An internal key read factored out of `getEditorNodeKeyForNode` (`public-state.ts:2958`) returns `null` for a node that is not live. It replaces the `findKey` catch in `resolveDOMNode` (`dom-editor.ts:1786`) and the strict call in `cachePliteDOMNode` (`dom-editor.ts:735`). `findKey` and `editor.key` keep throwing for direct callers.
- **`blur` and `deselect` on an unmounted editor.** `blur` clears its focus request, retry and focused state first, and touches the DOM only when the root resolves. `deselect` clears the model selection whether or not a root resolves. Both throw today. `focus` already returns when `editable(editor)` is null (`dom-editor.ts:1404`), so its edit only moves it to the soft lookups.
- **Clipboard voids.** When a selected void has no DOM, the copy keeps the cloned range contents and skips the void expansion, instead of throwing.
- **Lint guard.** `plate/no-strict-dom-lookup` in `tooling/oxlint/plate-plugin.mjs` bans the strict `DOMEditor` lookups, the `assert*` family, `findDocumentOrShadowRoot` and `findKey`, in `packages/plitejs/src/**` and `packages/platejs/src/**` outside tests. It refuses a member, bracket or destructured read of each name and a bare call of one, and its message names the resolver to use. The JSON node check in `core/change/tokens.ts` is named `assertJsonNode`, so the bare-call check never flags it. It covers `dom/plugin/dom-editor.ts` too, so `blur` and `focus` stay checked. The one form it allows is a property with a strict name whose arrow returns a strict call, such as the `editor.api.dom` forwarders, because every caller still reads a strict name. An override still bans `getWindow` through `no-restricted-properties` in `dom-clipboard-runtime.ts`, `dom-drag.ts` and `content-root-navigation.ts`, so the window catches the sweep deletes cannot come back.
- **Render contract monitor.** A new internal `react/editable/render-contract-monitor.ts`, one per `EditableDOMRuntime`, owns the omitted-child check, its dedupe and its report. A `*-contract.*` name would fall outside the React entrypoint's tsconfig (`tsconfig.entrypoints/react.json`). Several Editables can share one view editor and its key maps, so every lookup is scoped to the Editable's root, and a child portaled outside that root counts as missing, as it does for the export:
  - **What the parent rendered.** Each `bindPliteNodeElement` call for an element node writes a fresh record, `{ node: providedEditorNode }`, into a new `ELEMENT_TO_RENDERED_RECORD` WeakMap, and its cleanup deletes the entry only while it still holds that record. Text leaves bind through the same function (`editable-text.tsx:681, 736`) and write nothing, because no check reads them. Nothing else writes the map. A bind with no `providedEditorNode`, such as a custom shell that calls `usePliteNodeRef(nodeKey)` alone, writes nothing, so that parent never vouches for a child. `ELEMENT_TO_NODE` cannot do this job, because the binding stores the live node there (`use-plite-node-ref.tsx:619`) and lookups overwrite it (`dom-editor.ts:743`, from `resolveNode` and the path fallbacks). The record is new on every bind, not only when the node changes, because a parent can remount on new DOM with the same node object: an `as` change (`plite-element.tsx:61`) or a render revision bump (`editable-text-blocks.tsx:995`) rebinds through the ref callback (`use-plite-node-ref.tsx:835`) with the same node. Both element bindings already pass the rendered node (`editable-text-blocks.tsx:769`, `plite-element.tsx:67`), so the cost is one allocation and one WeakMap write in an effect that already runs.
  - **Nominations.** The post-commit export handler (`runtime-root-engine.ts:201`) nominates once, after `syncDOMSelectionToEditor` returns, so the export itself stays untouched. The export has more returns that leave a selection unplaced than the coverage ones, such as the view-selection returns at `selection-controller.ts:1487` and `:1531`, and a return added later could skip a check placed inside it. For each endpoint of the model selection, or of the view selection, that lies in this view's root, the handler nominates it when its text does not resolve and no boundary covers it. A boundary that covers one end says nothing about the other. An endpoint in another view's root stays silent. The handler runs only while the editor is focused, as the export does. A selection change with no commit runs the selection-only export (`selection-runtime.ts:203`), which nominates the same way once `syncDOMSelectionToEditor` returns (`runtime-root-selection-export.ts:44`). The focus, mouse, input and repair exports do not nominate, so a selection placed while the editor is blurred reports at the first commit or selection change after it gains focus. A look scheduled before the root attaches belongs to an older root generation and never runs (`dom-root-runtime.ts:553`), so the runtime schedules it again once the root mounts. The development guard keeps its per-element layout effect and nominates that element's direct children. Its `console.error`, its `setTimeout(0)` and its private checker are deleted. The development flag stays a module-level read (`editable-rendered-element.tsx:39`). It reads `globalThis.process`, which no bundler replaces, so a page with no global `process` already runs the production path in development, as today.
  - **Candidates.** For an endpoint, the probe point is the endpoint's own text at offset 0, and the candidate is the highest non-top-level node on its path with no DOM by key whose parent has DOM. For a development child, the probe point is the child's first text that no boundary covers. A candidate counts when this view's root is in the document, its probe point has no DOM in that root, no boundary covers it, and the node in the parent's record has a child with the candidate's `NodeKey`. Keys are read through the runtime owner, because `getNodeKeyForNode` keys by owner (`utils/node-keys.ts:59`). The DOM check reads the bound elements by key, `NODE_TO_ELEMENT`, the key map and the mounted path, and writes nothing, because the DOM point resolver caches the host it finds (`dom-editor.ts:1045`) and this check runs inside commits. A stale or offset-only miss reports nothing, because the candidate itself has DOM.
  - **Two looks.** The first look runs an animation frame and one macrotask after a nomination and remembers each candidate's parent record. The second runs one frame and one macrotask later. It reports only when the parent's DOM by key holds the same record object, the candidate's own key neither bound nor unbound since the first look, the candidate still counts, and no composition, deferred composition write or Android action is pending. A renderer can remount its own children through its own state, such as a portal target set after an iframe loads, without the parent binding again (`apps/www/src/app/(app)/examples/plite/_examples/iframe.tsx:169-187`). So the runtime keeps the pending candidates in a map by key that each bind and its cleanup check, one lookup per bind on a map that is almost always empty. A real omission never binds, so this drops no true report. So every report comes a full frame and macrotask after a parent bind that already held the child, which is when iframe and portal children have bound (`docs/research/sources/plate-notes/rendering-and-overlays.md`), whichever nomination started it. A parent that bound again, on new DOM or the same, drops the candidate. Its new bind requests a selection export (`use-plite-node-ref.tsx:798`), which nominates again. A change to the parent's own properties or child list replaces its record and rebinds it (`use-plite-node-ref.tsx:800-808`), so such changes less than two frames apart postpone the report until they pause. A text edit inside a child does not rebind the parent, because element equality ignores the children's content (`editable-node-equality.ts`, `editable-text-blocks.tsx:742-751`), so the report lands during a stream of text edits. No fence counter is used, and `IS_NODE_MAP_DIRTY` is never read.
  - **One report.** It reports at most once per omitted child `NodeKey` per mounted editor, recorded before the sink runs. The message names the element type, its path and the child path, so the error event carries them with no sink.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Errors with no handler | Every source goes to the browser's error event, and to the console only where that event is missing (look) | Console for everything except history, as today | console default | big |
| What the error event gets | One error whose message names the source and the failing part, with the original error inside it (look) | The original error alone, which drops which plugin or step failed | bare cause | small |
| Dev warnings for dropped children | Same channel as production, so dev error overlays show them, on pages that expose the build mode as today (look) | Keep them as console warnings in development | quiet dev | small |
| Coverage lookup names | Keep the names and return nothing when unresolved | Rename them; cut them, since no production code calls them | rename coverage | small |
| Repeat reports | Once per dropped child per mounted editor | Report again after it recovers and breaks again | rearm reports | small |
| A parent under constant edits | Postpone the report until edits under the parent pause for two frames, because a parent render can queue a new late child bind (look) | Keep a candidate across parent renders on the same element and report while edits continue | report busy parents | small |
| Document root lookup | Add a soft root lookup and move every runtime caller now | Keep only the strict one and move its callers later | strict root | small |
| Window lookup | An internal soft read for code that can run before mount or headless; event handlers stay strict | A public soft window lookup, with every caller moved | public window | detail |
| History handler errors that skip the handler | Route them through the handler now, with a new observer phase | Leave them on the browser's error event and file a backlog item | backlog history | small |
| Slow loading children | Report a child under a loading fallback, or portaled into a loading iframe, unless an unmounted content boundary covers it while it loads, as the boundary docs show (look) | Never report while a fallback shows | quiet suspense | small |
| Bun tests that reach the default | Keep Bun failing any test that reports to the error event, so a hidden lifecycle error fails its test, and fix the one that exists | Stub the error event in the Bun test setup | stub bun | detail |
| Guard scope | Plite and Plate package source, where the rule allows only a property with a strict name that forwards a strict lookup | Also cover the registry; exempt the whole file that defines them | wider guard | detail |
| Guard limits | Three rare ways past the lint stay open, and review catches them: a lookup name held in a variable, a reflective property read, and a strict lookup copied into a helper with another name (look) | Ban computed and reflective reads on the DOM editor in package source | close lint gaps | small |
| Stale text right after typing | Its own session card | Fix it in this change | fix stale here | detail |
| Plan home | Its own page | The React rendering subject page | react page | detail |
| Page link | A new page, https://claude.ai/artifact/DTD59Qvg8NGXuLyrwycERz, because the old one, https://claude.ai/artifact/AsJrkgWac1vUPArbMG7iGb, no longer opens for this account | Go back to the old page | old page | detail |

## Scope

- In: the four gaps the owner named and the commit-window probe, which already ran.
- Out, tracked elsewhere:
  - The stale DOM range one commit after a text insert. Session card task_9920ae68.
  - Whether `resolveDOMPointOrBoundary` and `resolveDOMRangeOrBoundary` earn their place with no production caller, and whether strict `findDocumentOrShadowRoot` should carry an `assert` name once nothing internal calls it. The review ledger scope `dom-lookup-names` queues it as a verdict item, because no hard cut is authorized.
  - Twelve Bun tests that already fail on `origin/next` at `aa2f91c342`: five in `plitejs` `test/authored-tree-record.test.ts` and seven in `platejs`. A session card.

## Steps

- [x] 1. Lifecycle default, history handlers and coverage lookups. Proof, each failing on `origin/next` first:
  - A core test that a non-history lifecycle error with no sink reaches `reportError` as one error whose message names its source and whose `cause` is the original, and reaches `console.error` when `reportError` is absent.
  - A throwing `onHistoryReplay` reaches an installed sink with `phase: 'observer'`. So does a focus handler that throws after an applied undo. When `onHistoryReplay` and the fulfillment callback both throw, the sink gets two reports. A throw before the replay has an outcome reports `phase: 'replay'`.
  - A coverage test that an uncovered unmounted point and range return `null`.
  - Then the plitejs Bun suite with `authored-tree-decide-completion.test.ts` green, and the vitest suite. jsdom and Node have no `reportError`, so vitest takes the console path and proves nothing about the error event.
  - The Plite Chromium suite and the www Chromium suite on the Step 1 build. `recordBrowserRuntimeErrors` records every `pageerror` (`packages/test/src/playwright/runtime-errors.ts:70`), so each lifecycle error those suites hid in the console now fails its row. Each new failure is fixed at its cause or listed with its owner.
  - The Step 1 build exposed four hidden errors, and each fix goes to its cause. The Markdown clipboard encoder throws on content it cannot write: an unknown `table` node and an undeclared `notes` root (`plate-schema-descriptors.test.ts:105, 310`), and a `column` in the primary root (www `dnd.spec.ts:463`). The serializer drops and reports such a node before mdast-util-to-markdown's own writers run, because they read their neighbors' output. Under a configured writer, which may write its children itself, a fallback writer reports the node only when that writer reaches it. The serializer adds the fallback to the writer list after every plugin runs, so a plugin that replaces the list does not drop it. Pagination reports the same missing-plan fallback for a blockquote on every measure, 12 times in one test (www `pagination.spec.ts:52`). Each fix has a test that fails first, and those four rows pass.
- [x] 2. Runtime sweep, soft lookups and guard. Proof, each failing first: `blur` and `deselect` on an unmounted editor do not throw and clear focus and selection state; `resolveDropTarget({ clientX: 0, clientY: 0 })` on an unmounted editor returns `null`; a leaf point resolved before the editor's window is recorded gets a point instead of a throw; copying a selected void with no DOM still writes clipboard data; the headless clipboard codecs work with no catch around a window lookup. No codec test can fail first while the catch hides the defect, so a mutant with strict `getWindow` and no catch fails two existing tests instead. The guard fails on a reintroduced `ReactEditor.assertDOMNode(editor, editor)` at a removed try/catch site, on a destructured and a bracket form of it, on a runtime `findDocumentOrShadowRoot`, on the Table plugin calling it, on a call under `platejs/src/docx`, on a runtime `findKey` and on `getWindow` in the three window files. A reintroduced `DOMParser` still fails in `platejs/src` and `platejs/src/docx`. `platejs/src/docx/internal/domParser.ts` and the `editor.api.dom` forwarders still lint clean. The logged `try` block list shows no catch around a strict lookup.
- [x] 3. Render contract monitor. Production rows load React and Testing Library first, then set `NODE_ENV` to `production`, then load Plite. React keeps its development build and `act`, because production React has no `act`, and Plite's module-level flag reads production. A renderer is never shared between a development row and a production row, because each renderer keeps the mode it was first wrapped in. Rows install a recording sink, except one production and one development row that run with no sink and assert the report with `reportError` present and with it absent. Proof, each case failing or absent first where the case reports:
  - A renderer that omits a child, with the selection set into it while focused, gets exactly one `render-element` report: `phase: 'selection-export'` in production after two frames and two macrotasks, `phase: 'commit'` in development.
  - A range from a covered child into an omitted, uncovered child reports once in production. So does a virtualized selection from an offscreen covered block into an omitted child of a mounted block.
  - A collapsed view caret in an omitted child reports once in production. So does an undo that restores a recorded view selection into an omitted child. A view selection whose endpoint lies in another view's root reports nothing.
  - An iframe or portal child that binds one macrotask late reports nothing. So does a second nomination whose parent commit lands after the first nomination's frame, with its child binding one macrotask later.
  - A parent that remounts on new DOM with the same node object between the two looks, through an `as` change or a render revision bump, with its child binding one macrotask late, reports nothing. So does the same case under `StrictMode`.
  - A renderer that remounts its own portaled children through its own state between the two looks, with the child binding one macrotask late and no parent bind, reports nothing.
  - A child portaled after a `load` event slower than two frames reports nothing under an unmounted content boundary and reports once without one. The row portals into a target in the same document, because jsdom never binds text inside an iframe.
  - A lookup that refreshes the parent's `ELEMENT_TO_NODE` (`resolveNode(parentDOM)`) while the parent's render with the new child is still pending reports nothing. The row checks this within one tick, because a test cannot hold the parent's render pending across both looks.
  - A custom shell bound with `usePliteNodeRef(nodeKey)` and no rendered node, with a child insert pending, reports nothing.
  - A range with both ends in one omitted child reports once, and ten more commits report nothing.
  - A parent whose property changes on each of ten frames, with the selection in its omitted child, reports once after the changes stop. A sibling of the omitted child that gets a text insert on each of ten frames reports once, during the inserts, because a text edit does not rebind the parent.
  - A covered child, a composition in progress, an unmount before the second look, an editor removed from the document without unmounting and a Suspense fallback that renders a content boundary report nothing.
  - An omitted child whose editor leaves the document before the first look, or between the looks, and comes back with no commit reports once.
  - In the stale-DOM window one commit after a text insert, nothing reports. A plain text insert never nominates, because the stale text still has DOM by key and the text-flow resolver clamps the offset to the old text (`dom-text-flow-index.ts:369-373`). An insert that splits a new leaf at the end, with the selection in it, also reports nothing, because the parent's record still holds the node from before the split, which lacks the new key. The row asserts which of the two checks stopped it. If the new leaf has DOM by key at once, the row says so.
  - A view editor, such as a pagination view, reports its omitted child once.
  - A development grandchild omission reports once, against the child's renderer.
  - Browser rows. The Plite browser app is a production build (`apps/plite/playwright.config.ts:132`), and the export runs only while the editor is focused, so the old rows in `iframe.test.ts` and `mentions.test.ts` never nominate. A hidden example in the Plite example registry gets a `renderElement` that portals its children one macrotask late. A row focuses it and selects into a newly inserted portaled child, then expects no error after an in-page wait of five animation-frame-and-timeout cycles in the editor's window. The same route also has a truly omitted child, and selecting into it gives exactly one `pageerror` within the wait. Both rows record through `recordBrowserRuntimeErrors`, which already listens on `pageerror` and `console`. The late-child row fails against a mutant that reports every nomination at the second look and ignores the child's own bind, then both rows pass five warm runs. The two old rows switch to `recordBrowserRuntimeErrors` and no longer carry the monitor's proof.
  - The Plite and www Chromium suites on the Step 3 build, as in Step 1, so a production `selection-export` report that a suite now raises is fixed at its cause or listed.
- [x] 4. Docs, changeset and API repair. Proof: `plate-docs` on each page that states the sink default or the coverage lookups, plus Editable's `renderElement` section for the check; `best-api repair`; a `changeset` for `plitejs`. No custom shell page exists to update, because `usePliteNodeRef` is not public and every element bind passes its rendered node.
- [x] 5. Close. Proof: writing passes, `pnpm exec oxlint --type-aware --format=default` on the task's files, a panel on the diff, the cost gate below, the `pnpm check` steps the edits reach, then `land.mjs`.
  - Cost gate. Once the diff panel's fixes are in, rerun the bind-record probe in the run directory's `bench/` against the final tree, through `paired-timing.mjs` with its frozen config. Each mount cohort, 200, 5000 and 3300 elements, passes when its candidate-to-base median ratio stays at or under 1.15 and its planted arm, 40 µs per bind, fails. The load limit is 9. The typing cohort types into a focused editor, so each insert runs the selection export and the monitor's nomination, and it passes on the same 1.15 line while its planted arm, which adds 400 µs per nomination, fails. Every arm also counts two record writes per element per mount, because each element binds twice while it mounts. A conclusive miss sends the record design back to `architect`. A line still inconclusive stays a gate and the page says so.

## Completion Gates

| Gate | Evidence |
| --- | --- |
| `pstack:blast-radius` before the first delegate | done: a console preload counted every lifecycle envelope the Bun suites log with no sink; see Proof |
| Benchmark pre-acceptance probe | done: on a quiet host the mount cohorts passed a 1.15 line at 1.051, 1.007 and 1.015 before the design was accepted |
| Cost gate on the final tree | inconclusive: both runs crossed load 9; run 2 met every 1.15 line and every planted arm failed; a quiet-host rerun is suggested task t_cbbb1ad9 |
| `verify` before the first proof gate | done: loaded before the final suites and the hand drive |
| `best-api repair` | done: three rules in `docs/vision/plite.md`, two option JSDocs fixed, the registry JSON regenerates in `build:registry` |
| `plate-docs` on changed pages | done: pages reviewed, `build:registry` regenerated the docs JSON and `build:registry --check` says fresh |
| `changeset` | done: `.changeset/plite-dom-lookup-errors.md`, and three unreleased changesets amended |
| `deslop`, then `no-comments` | done: one cast cut; 40 comments deleted, 10 lint suppressions removed by `plate/no-strict-dom-lookup`, and comment-sicko's naming flags applied |
| `unslop` on docs and plan prose | done |
| Oxlint type-aware on the task's files | done: 0 errors on 64 files |
| Hand drive | done: 19 cells on the final bytes, and `hand-drive.mjs check` covers each one |
| Playtest scope | done: the suggestions spec runner adds no failure in three engines; each case red on the tree fails the same at HEAD and base, or passed on the rerun |
| `pstack:thermos` per slice | skip: the `api-build` and `push` rows already owe a panel on the diff |
| Panel on the diff | done: three rounds, the cap; each round's fixes tested and given their writing passes |
| `pnpm check` steps | done: 12 of 21 static steps pass and the nine red ones fail the same way at base; every failing test in the test steps and in `plite-test` also fails at base, once the detached-root fix is in |
| Land through `land.mjs` | done: one squashed commit on `origin/next` |

## Proof

The commit-window probe ran on `origin/next` at `aa2f91c342` in jsdom:

- From a layout effect above `<Editable>` at first mount, `resolveDOMRange` returns `null`. It never throws and logs nothing. Slate PR 6266's head throws there.
- After a model insert or a `beforeinput` insert, it returns a range in every case tried.
- For one commit after a text insert, the range points into the old text. The probe recorded the text DOM write landing after the subscriber's effect. That is the stale-range defect in Scope.

The blast radius of the new default ran on the same commit, with a Bun preload that records each lifecycle envelope sent to `console.error`:

- `plitejs`: 4018 tests, one envelope, from `test/authored-tree-decide-completion.test.ts:93`. Its authored plugin's `afterPublish` throws `Schema element property "role" cannot target element "row"`, which the console hides today.
- `platejs`: 3691 tests, no envelope. A marker row showed the preload ran. The census missed 11 tests in `ProductFormats.spec.ts` and `HtmlPlugin.mapping.spec.ts`, because their own `console.error` spies replaced the preload's. Step 1 moved those spies to `reportError`.
- A scratch Bun test that calls `reportError` fails, with or without an `error` listener, so the new default turns that one hidden error into a failing test.
- No code reads `source` to narrow `EditorLifecycleError`, so the new member breaks no caller. No production code calls the coverage lookups.
- The browser rows that read the old warning listen only on `console` (`iframe.test.ts:11`, `mentions.test.ts:164`), and they run on a production build, so they never saw the development warning.
- This census covered the Bun suites only. The browser suites record every `pageerror`, and 137 files use that recorder, so Step 1 runs the Plite and www Chromium suites on its build.

## Close

Deviations come first.

- The cost gate is still a gate. Both runs on the final tree went over the frozen load limit of 9, at 11.20 and 9.52, while two Bun processes from other sessions held the base load near 6 (`bench/final-run-a1.log`, `bench/final-run-2-a1.log`). Run 2's numbers meet every line: normal 1.014, large 1.004, nested 1.016 and typing 1.038 against the 1.15 line, with same-code noise of 0.009 to 0.021. Every planted arm fails at 1.529 to 1.885. The quiet-host rerun is suggested task t_cbbb1ad9, so this close claims only what the two runs measured.
- The typing cohort now passes or fails on time, not only on counts. Diff panel round 1 made it type focused at the caret, plant a 400 µs spin per selection check and refuse a run that skips the DOM selection write. Its planted arm fails in run 2, and the unfocused known-bad probe fails with its own assertion (`bench/known-bad-unfocused-a1.log`).
- The Plite browser runner stops at the first failing batch. Its first batch holds `huge-document.test.ts`, whose select-all undo case fails the same way at base, so the other 59 files ran on their own (`final/plite-chromium-suite-a2.log`, `final/plite-chromium-rest-a1.log`).
- The playtest's spec runner ran after the diff panel instead of before it, because its scope check was still open at the panel.
- `pnpm check` caught two files the format check refused and a stale API reference manifest after the panel. The format fix changes line wrapping only, and the regenerated manifest also refreshes six entries `origin/next` had left stale.
- `plite-test` stops at the migrations type error that `origin/next` carried at the merge base, before its package tests run. Its package link ran again with `--continue`, at HEAD and at base, so every test partition whose dependencies pass ran.
- That run found one failure only at HEAD. A ListPlugin test removes its hydrated editor from the page without unmounting it, and the monitor then reported a dropped child in the next test. Its DOM check found no DOM in any root outside the document. The first fix skipped such a root. It landed after the diff panel's last round with no review of its own, though the reviews list's `push` row requires one. The reflect after the land found that gap, so a third diff round reviewed the change.
- Round 3 found that skipping a detached root also lost a true report. An editor that left the document during its looks and came back with no commit never reported its dropped child. The DOM check now looks for the probe's DOM inside its own root, attached or not, and the skip is gone. So a healthy detached editor reports nothing, and a dropped child reports once whether or not its editor is in the document. Round 3 used the last round the cap allows, so its fix had no review after it.

What landed is this plan's commit on `origin/next`, which `land.mjs` squashed and rebased, and a second commit with round 3's fix. Runtime code calls only soft DOM lookups, and `plate/no-strict-dom-lookup` refuses a strict one in Plite and Plate package source. The two coverage lookups return `null` when nothing answers, and `resolveDocumentOrShadowRoot` joins `DOMEditor` and `editor.api.dom`. A lifecycle error with no sink goes to the browser's error event as one error that names its source, and history handler errors reach the sink with an `observer` phase. A renderer that drops an editable child reports to the sink in every build. Each error the old console default hid is fixed at its cause. Markdown drops and reports content no writer handles, and pagination reports a missing plan once.

Proof, from each log row's scope:

- Red first, then green, for each slice: slice 2 in `slice2/base-*-a1.log` and the codec mutant `slice2/mutant-codec-strict-window-a1.log`; slice 1 in `slice1/red-*-a1.log` and `slice1/green-*-a1.log`; the hidden errors in `slice1b/*-before-a*.log` and `slice1b/*-after-a1.log`; slice 3's 16 vitest rows and its omitted-child browser row at base in `slice3/base-vitest-rows-a2.log` and `slice3/base-browser-rows-a1.log`, both browser rows five warm runs in `slice3/browser-rows-warm-*-a3.log`, and the late-portal row failing under the mutant in `slice3/mutant-browser-rows-a3.log`.
- The guard ran over 1377 files (`lead/oxlint-strict-lookups-all-src-a2.log`), and `panel-diff-r2/strict-rule-ways-a1.log` tries every way past it. A key in a variable, a reflective read and a strict lookup hoisted under another name still pass, as the Guard limits default says.
- The diff panel ran three rounds, and all three seats answered each one. Round 1 had three critical findings. Two got a fix with a red-then-green test, and one was dismissed with a mutation that fails both loading rows. Round 2 found no critical, and each of its warnings got a fix with a test that fails first (`panel-diff-r2/markdown-spec-before-a1.log`, `markdown-spec-final-a1.log`).
- Round 3 reviewed only the change made after round 2. Astra and Sol raised its one critical finding, and Opus raised it as a warning. Both detach-and-return rows fail on the landed guard and pass on the fix (`panel-diff-r3/reattach-*-landed-a1.log`, `reattach-rows-fixed-a1.log`). With only the DOM check reverted to need a connected root, the healthy detached row reports again (`healthy-detached-row-connected-lookup-a1.log`). The monitor files pass 36 of 36, the ListPlugin partition passes 35 of 35 in five runs in a row, and the two Plite Chromium render-contract rows pass.
- On the final tree in Chromium, the Plite suite passes 748 cases in the 59 files besides `huge-document.test.ts`, which passes 7 of 8 with its undo case red at base too, and the two render-contract rows pass five warm runs. The www suite fails 35 of 601 against 38 at base, and its one failure outside the base set fails the same way 4 of 5 times at base.
- The playtest's suggestions spec runner adds no failure in three engines (`playtest/specs-a1.md`). Each case red on the tree either fails the same way at HEAD and base, where `origin/next` has since fixed five of them, or passed on the rerun at HEAD and base.
- In `pnpm check`, 12 of 21 static steps pass, and the nine red ones list the same findings at base (`final/check-static-a1.log`, `final/base-check-static-a1.log`). Of the test steps, `bench-targets` passes, and every case `test`, `test-slow` and `cli-test` fail also fails at base (`final/check-tests-a1.log`, `final/base-check-tests-a1.log`). `plite-test`'s package link with `--continue` fails 13 tests at HEAD, and base fails all 13 plus 7 more (`final/plite-test-continue-head-a2.log`, `final/plite-test-continue-base-a1.log`).
- The hand drive covered 19 desktop cells on the final bytes and read each changed docs sentence back in English and Chinese, and `hand-drive.mjs check` covers every cell (`final/hand-drive-check-a1.log`).

The reflect after the land applied no lesson. It offered each accepted one as a suggested task:

- t_8ac5303b, single-command forms of the compound commands the app refuses in a worktree session.
- t_25686d8c, a second ping before a failed seat stops the run, after the owner corrected a wrong `codex login` diagnosis.
- t_08bb9e40, a run directory the Write tool can reach.
- t_ed4501cf, teaching that Bun fails a test whose code calls `reportError`.
- t_f20cd302, regenerating registry output when a land's rebase conflicts on it.
- t_b4dcfc67, routing "would you improve X from Y" questions to verdict.
- t_d5c59a88, refusing a land whose code changed after the last panel round.
- t_9cdaf517, how a frozen load limit works on a shared host.
- t_41dc9ac0, refusing an edit to a logged decision row.
- A fold into t_7cbd98de, finding the lead of an append that a script runs.

The missed review of the guard ran as round 3. The reflect rejected these findings because a rule or task already covers them:

- the inline `node -e` ban;
- base attribution and `TURBO_FORCE` in verify;
- encoding a removed suppression, which no-comments already asks;
- the Extraction rule's evidence seat;
- the same-family panel rule;
- the app's own merge advice;
- the changeset, which already names the `reportError` default;
- the spec typecheck (t_d957b48c) and the drive server (t_d6957617).

It rejected four as too vague or unproven: duplicate helpers after a merge, stale errors in the console tool, scoped skill names, and finding a leaking test first.

The request had five asks, and all five are done. The four gaps landed, and the commit-window probe ran before the build, as Proof above shows. No ask was skipped.

## Open work

- t_cbbb1ad9 Rerun the bind-record cost protocol on a quiet host. owner: zbeyens. Tracked in the suggested-task ledger. stop: that task lands or is dropped. A miss sends the record design to `architect`.
- t_ce2c85a6 Split resolveDOMPointInRoot's node-cache write from its lookup. owner: zbeyens. Tracked in the suggested-task ledger. stop: that task lands or is dropped.
- t_d6957617 Start the hand drive's www-drive server in the session's worktree. owner: zbeyens. Tracked in the suggested-task ledger. stop: that task lands or is dropped.
- t_bd6b6f64 Keep a detached editor's element bindings until their ref cleanup runs. Until it lands, a dropped child reports nothing when a structural commit arrives while its editor is out of the document. owner: zbeyens. Tracked in the suggested-task ledger. stop: that task lands or is dropped.
- t_7d471401 Unmount the hydrated editor in ListPlugin's hydrate row. owner: zbeyens. Tracked in the suggested-task ledger. stop: that task lands or is dropped.
- The `dom-lookup-names` verdict on the two coverage lookups with no production caller and the strict root lookup's name. owner: zbeyens. Tracked in the review ledger scope `docs/research/review-scopes/dom-lookup-names.json`. stop: its verdict is written.
- t_f8e9a646 Make a subscriber's DOM range read the text one commit after an insert. owner: zbeyens. Tracked in the suggested-task ledger, card task_9920ae68. stop: that task lands or is dropped.
- Suite cases red at base: t_e2d741f4 (huge-document undo), t_30d86df2 (richtext drag undo), t_c1908482 (kernel authority audit) and t_7f9094c6 (www Chromium base failures). owner: zbeyens. Tracked in the suggested-task ledger. stop: each task lands or is dropped.
- `pnpm check` steps red at base, each owned in the suggested-task ledger: t_7c3739dd (search route format), t_5f457422 and t_019f662d (core audits), t_9ab7fdd4 (Plite bridge), t_7214ea31 (stale platejs `turbo.json`), t_3ea68f2e (review ledger and knowledge), t_ceb53af4 (import smoke list), t_e044002d and t_8bbf88b5 (www focus specs), t_eaba3553 (list paste timing), t_278b93f3 (CLI esbuild service) and the `cmd:root-test-slow` owners. owner: zbeyens. stop: each task lands or is dropped.
