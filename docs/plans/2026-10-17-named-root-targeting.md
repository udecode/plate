---
review_scopes: [runtime, selection]
verdict: pursue
review_basis: [2026-10-04-runtime-audit, 2026-10-04-selection-audit]
work_kind: implementation
review_commit: c5921381cfd258e50b8cc088a445af279c646784
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plite.md, docs/vision/plate.md, docs/research/review-records/2026-10-04-runtime-audit.json, docs/plans/2026-09-30-content-root-locations.md, docs/plans/2026-10-14-pr-5170-redo.md, docs/plans/2026-10-15-details-title-slot.md, docs/plans/2026-10-17-footnote-review.md, packages/plitejs/src/core/public-state.ts, packages/plitejs/src/core/tx-only.ts, packages/plitejs/src/core/command-frame.ts, packages/plitejs/src/core/command-document.ts, packages/plitejs/src/core/editor-schema.ts, packages/plitejs/src/core/plugin.ts, packages/plitejs/src/editor-runtime-view.ts, packages/plitejs/src/interfaces/editor.ts, packages/plitejs/src/interfaces/selection.ts, packages/plitejs/test/command-spec.test.ts, packages/platejs/src/internal/utils/inRoot.ts, packages/platejs/src/internal/plugin/blockRelease.ts, packages/platejs/src/internal/plugin/insertionAnchor.ts, packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts, packages/platejs/src/features/details/lib/BaseDetailsPlugin.ts, packages/platejs/src/features/details/lib/BaseDetailsCodeConversion.spec.ts, packages/platejs/src/features/details/lib/BaseDetailsConversion.spec.ts, packages/platejs/src/features/details/__tests__/detailsConversionFixture.ts, packages/platejs/src/features/list/lib/BaseListPlugin.ts, packages/platejs/src/features/list/lib/listIdentity.internal.ts, packages/platejs/src/features/layout/lib/BaseColumnPlugin.ts, packages/platejs/src/features/indent/lib/BaseIndentPlugin.ts, packages/platejs/src/features/footnote/lib/BaseFootnotePlugin.ts, packages/platejs/src/features/lint/lib/BaseLintPlugin.ts, packages/platejs/src/features/find/lib/BaseFindPlugin.ts, packages/platejs/src/features/upload/lib/BaseUploadPlugin.ts, packages/platejs/src/ai/react/AIChatPlugin.ts, packages/platejs/src/ai/react/aiOutputLanding.internal.ts, packages/platejs/src/ai/lib/AIChatRequestContext.ts, packages/platejs/src/utils/plugins/ExitBreakPlugin.ts, apps/www/src/registry/components/editor/turn-into-toolbar-button.tsx, 'apps/www/src/app/(app)/examples/plite/plite-example-client.tsx', content/docs/api/editor-api.mdx, 'content/docs/(guides)/plugin-methods.mdx', 'content/docs/(guides)/roots.mdx', content/docs/plite/libraries/plite.mdx]
review_upstreams: ['../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../prosemirror-view@ca4c78e9b56f1b164c0b3758b59d8748f11b7534', '../prosemirror-website@a16b4ece45f135e5f001ab59d25f2d43c25974e1', '../slate@945a484df2497e4c448b33f417b0de2a49840032', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca']
---

# Named roots: run each command in its target's root

Status: partial: built and proven; step 1.2's timing waits on t_590c341a
Playbook: plan

**Pursue.** A plugin command called on the base editor while the caret sits in a named root runs its reads in that root and its path writes in the main document. At `HEAD`, Column toggle from the main editor with the caret in a note replaced the main document's first block with a column group holding the note's text, and Indent indented the main block instead of the note's (the decision log's probe at `HEAD`). Plate patches this per command with a hand-passed root, and every command that missed the patch writes the wrong document. The fix belongs in Plite. A plugin update method should run in the root its target lives in, and then the patches can go. The companion question, whether rooted reads should return rooted paths (task_5fc67c90), is a **Stop**. Paths stay relative to a root, as the content-root design decided, because the view already carries the root.

## Brief

### What will change?

Commands run from the main editor with the caret in a named section edit that section, not the main document. Plate stops passing roots by hand. Tests for all seven reported bugs now pass.

### What could go wrong?

The speed check is open, because the machine was too busy; task t_590c341a times it, and a clear slowdown sends the design back. Named sections are tested, not driven in a browser. Custom commands that hide their targets now throw.

## Teach

A Plite document has one main root and any number of named roots, such as a note or a caption. A view is the editor seen through one root, so a path you give it means a position in that root. Keys and rooted points carry their own root. Bare paths do not.

Today a plugin command runs in the root of the editor you call it on. Called on the main editor with the caret in a note, its reads follow the caret, but its writes by path land in the main document. Plate patches each command by hand, and each one it missed corrupts the main document.

The change runs each plugin command in its target's root, as if called on that root's view. A key or rooted target picks its root, a bare path stays in the caller's root, and no target follows the caret. In review mode the command decides on that root's proposed document.

## Public API

A Code block toggle on the main editor with the caret in a note's title converts the title, instead of refusing.

```ts before
// packages/platejs/src/features/details/lib/BaseDetailsCodeConversion.spec.ts
editor.update.selection.set({ offset: 0, path: [0, 0, 0], root: 'note' });

expect(editor.plugin(BaseCodeBlockPlugin).update.toggle()).toBe(false);
expect(editor.read.value()).toEqual(before);
```

```ts after
// packages/platejs/src/features/details/lib/BaseDetailsCodeConversion.spec.ts
editor.update.selection.set({ offset: 0, path: [0, 0, 0], root: 'note' });
editor.plugin(BaseCodeBlockPlugin).update.toggle();

expect(editor.read.children()).toEqual(main);
expect(editor.read.root('note')).toEqual([
  { type: 'codeBlock', children: [{ text: 'Title' }] },
  { type: 'paragraph', children: [{ text: 'Body' }] },
]);
```

A Plate command keeps no root of its own, because the runtime already runs it in the caret's root.

```ts before
// packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts
const root = SelectionApi.root(initial);

if (root !== tx.view.root()) return false;
```

```ts after
// packages/platejs/src/features/code-block/lib/BaseCodeBlockPlugin.ts
```

`tx.nodes.replace` takes a node key, so code that holds a block replaces it in its own root.

```ts before
// packages/platejs/src/ai/react/AIChatPlugin.ts
if (!tx.nodes.replace(placed, { at: path })) return;
```

```ts after
// packages/platejs/src/ai/react/AIChatPlugin.ts
if (!tx.nodes.replace(placed, { at: tx.key(node) })) return;
```

A plugin method that takes arguments declares where they point outside review mode too, because the runtime picks its root from them.

```ts before
// content/docs/(guides)/plugin-methods.mdx
mark: (at: Path) => {
  tx.nodes.set({ marked: true }, { at });
},
```

```ts after
// content/docs/(guides)/plugin-methods.mdx
mark: txLocate(locateAt(0), (at: Path) => {
  tx.nodes.set({ marked: true }, { at });
}),
```

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| A plugin update method runs in its target's root | Plite | `plitejs` (new `core/plugin-dispatch.ts`, used by both plugin group builders in `core/public-state.ts`; the root's transaction comes from `editor-runtime-view.ts`; the review frame takes the decided root and maps every projected root's keys through the projection in `core/command-frame.ts`) | The runtime knows every target's root and, from `txLocate`, where each method's location arguments sit |
| A view's default targets ignore a selection outside its root | Plite | `plitejs` (`editor-runtime-view.ts`) | `tx.selection()` already hides it; default-target reads and writes still used its path |
| A live node targets its own root, like its key | Plite | `plitejs` (`core/public-state.ts`) | One target resolver for keys and live nodes |
| A node selection passed without a root means the reader's root | Plite | `plitejs` (`core/public-state.ts`, `interfaces/selection.ts`) | Paths, points and ranges without a root already mean the reader's root |
| Plate's placement checks pass the transaction's root | Plate | `platejs` callers of `canPlaceBlocksAtPath` and `placeElementAt` | The transaction knows its root; core callers that plan before a transaction keep passing theirs |
| Hand-passed roots in Code, List, Details, Column, block release and insertion anchor go | Plate | `platejs` (`internal/utils/inRoot.ts`, and the 9 source files and one spec that import it) | The runtime owns the root |
| AI writes a captured target in that target's root | Plate | `platejs/ai` | AI captures keys at `show()` and writes after an async answer, outside any plugin method |

## Hard cuts and app migration

Nothing public is deleted. Three behaviors change for app code, found by the blast-radius census (decision log, architect and plan rows):

- A plugin update method that takes arguments must declare them with `txLocate`, `locateAt` or `txSelection`, or it throws on every call. Today it throws only while a review tree is registered. Plate's `definePlugin` refuses such a method at the type level, but only one level deep and not on a member attached to a function, and Plite's own `definePlugin` does not check it, so some type-valid methods start throwing. Step 1.1 counts the undeclared methods of every installed plugin at runtime before the throw goes on. An app plugin migrates as the plugin-methods pair above shows.
- A plugin command called on the main editor while the caret sits in a named root edits that root. Code that relied on it editing the main document passes a main-root target, such as a main block's key. A command given a main target while the caret sits in a named root reads and writes only main, and its reads at the caret find no caret.
- A node selection built without a root and passed to a named view now means that view's root, as a path, point or range does. The two app-side builders already pass a root or run on the main editor: `turn-into-toolbar-button.tsx` adds the selection's root, and `resolveAIChatRequestContext` restores onto the command editor, which step 2.3 makes the target's view.
- A live node from another root now resolves from the main editor. `tx.nodes.get(liveNoteNode)` returned nothing, and now returns an entry whose path is relative to the note. App code outside a plugin method that gets an entry by node and then writes by its path moves from a silent no-op to a write at that path in main; it should write by the node or its key.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| Caret after a command in a named root | Stays in that root instead of jumping to a main block | jsdom spec, steps 2.1 and 2.3 |
| Undo of a command in a named root | One step restores that root | jsdom spec with history, step 1.1 |
| Node selection without a root in a view | Writes and reads that view's root; selecting already did | jsdom spec, step 1.4 |
| Command in review mode with the caret in a named root | Decides on that root's proposed document, as a main-root command does | jsdom spec with a recorder, step 1.1 |
| Command whose result the named root's schema forbids | Throws, as the same call through that root's view does today, instead of writing main | jsdom spec, step 2.1 |
| Toolbar command in the details title of the live demo | Edits the title | hand drive, step 2.4 |
| DOM selection, IME, clipboard | No change; the change sits above the DOM layer | N/A: no DOM, input or clipboard code changes |

## Main changes

- One plugin dispatcher replaces the command frame's method wrapper in both group builders. For each content method it finds the target's root once from the method's location declaration, then runs the method there. It runs in the transaction guard's call path for update methods, which already wraps a member when it is first read and caches it, so an update that calls no plugin method adds no dispatch work.
- A call whose decided root is the caller's own runs as today, with no new transaction, unless it is a base-editor call whose selection sits in another root. Any other call runs on the decided root's view transaction, a main view for main, built inside the open update and cached for the rest of it, so the write joins the same commit. Under review mode, the dispatcher frames a base-editor call in its decided root, and the frame maps every projected root's keys through the projection. A call that passes a function runs in the caller's root on the caller's transaction, and under review mode the frame maps each key it passes in that key's own root.
- A view's default targets ignore a selection that sits outside its root, as `tx.selection()` already does.
- A live node finds its root through its key, so reads and writes reach it from any root, collections, `nodes.replace`, `blocks.toggle` and `blocks.duplicate` included. `nodes.path` stays scoped to the reader's root.
- `inRoot`, `rootOf` and Plate's hand-passed placement roots go.

## Decisions

The dispatcher sorts methods by their marker, as `tx-only.ts` records it:

| Marker | Root it runs in | Why |
| --- | --- | --- |
| `txOnly` | The caller's | It configures the update and writes no content |
| `txStored` | The caller's | It works on the stored document by design |
| `txSelection` | The caller's | It moves only the selection; its lookups already read the caller's root (the identity census) |
| `txLocate(locate)` with a target | The target's | Keys, live nodes and rooted points carry their root; a bare path means the caller's root |
| `txLocate(locate)` with no target, or `txLocate(false)` | A view caller's own root; for the main editor, the caret's root, else main | Such a method acts at the selection (the no-target census) |
| Any marker, called with a function argument | The caller's, on the caller's own transaction | The function is the caller's own code, so it gets the transaction the caller holds; under review mode the frame maps each key the call passes in that key's own root, so a hidden key skips the method; a plugin method the function calls routes with the inherited root in force where the call was made (`dom.autoScroll`) |
| No marker, with an argument | Throws | Its targets are unknown |

- **Two roots in one call throw** before the method runs, because one method body cannot address two roots by path.
- **A key that no longer resolves** leaves the method in the caller's root, so it fails or refuses as it does today.
- **A call runs on the base transaction only when the base editor calls it, its decided root is main, and the selection sits in main or nowhere.** Every other call runs on its decided root's view transaction, a main-root one for main, never the base one, so `tx.view.root()`, selection reads and bare-path writes agree on one root (premise S2). A main-targeted call from the main editor with the caret in a note therefore reads no caret, instead of reading note paths and writing them into main. `txOnly`, `txSelection`, `txStored` and function-argument calls are exempt and keep the caller's transaction.
- **A routed call behaves as a call through that root's view.** Its explicit paths stay in its root. An implicit write after the method moves the selection out of its root does nothing, as in a view call today; the base editor's selection override (`public-state.ts`, `getMutationRoot`) applies only to calls that stay on the base transaction.
- **A nested call with no target inherits its outer call's root**, on the routed path and on the same-root path alike, so a main-targeted call with the caret in a note does not send a nested call into the note. A function-argument call passes through the inherited root in force where it was made, none at the top level, so a callback's plugin call routes as it would outside the callback.
- **A view's default targets ignore a foreign selection.** Inside a note view with the selection in main, a default-target read or write finds no selection, as `tx.selection()` already does, instead of reading the main selection's path inside the note (`probe/premises-next-a1.log`, P4). Routing a key target from the main editor creates this case whenever the caret is in main.
- **Review frames.** The dispatcher frames a base-editor call whenever a review tree is registered, as today, in its decided root. It enters the frame under `withEditorUpdateRootScope(decidedRoot)`, which sets both the update root that `createFramePlace` reads for paths and the children root that key lookups read. The frame maps each root in the projection's root list through the projection, as it maps main's today, lazily per root (`frameIndexOf`, `LAST_FRAME_INDEXES`, `baseRuntimeIndexes`, the carried projection and `prepareCommandFrame`, all made per root), so a key on a block that holds a pending change still resolves, and a named root keeps main's incremental path. The frame body calls the member on that root's view transaction over the frame's draft. The method then decides on that root's proposed document, and a hidden target skips it, as `command-frame.test.ts` requires for main. Calls made through a view stay unframed, as at `HEAD` (premise P3), so a key the proposed document hides still reaches a method called through a view (t_c3104bb1).
- **A call made inside a frame keeps its arguments as given**, because the outer method, command handler or input rule read them in the proposed document. A key the proposed document hides skips it when the method's locator places that key, as it skips a direct call, and a live node the proposed document rebuilt still finds its root through the stored document. **A read, a write or a selection in a root a pending deletion drops is refused**, a write when the frame ends, so a call with no target and the caret in that root still runs when it touches only other roots, such as `tx.history.restore` or a write to main by key.
- **Placement checks** keep their explicit root. Core callers plan before any transaction exists (`editor-commands.ts`, `getNodeSelectionReplacement`; `public-state.ts`, `replaceBlocksAtSite`), and Plate's callers pass their transaction's own root instead of one read from the selection.
- **Two methods name their node** so routing reaches it. `lint.fix` declares its finding's key. `column.moveMiddle` locates its entry's key and resolves the path from that key in the transaction it runs on, so a review frame still maps it.
- **Footnote definitions** go at the end of the root the command runs in, at `tx.children().length`, because `tx.value()` is the whole document in a view. The footnote registry reads that root's children, so a definition in another root would not resolve. The jumps (`selectDefinition`, `selectReference`) are selection-only and keep the caller's root, so a jump called on the main editor finds only main's notes; a jump through the note's view finds the note's. The new reference's number comes from `nextRef`, which scans that root's registry, so numbering restarts in each section, and the first footnote in a note gets `1` even when main already has a `1`.

What the losing candidates handle that the base drops, each a graft or a limit:

| Case | Candidate | Here |
| --- | --- | --- |
| Root table by marker, census of no-target methods, Indent proof | Sol | Grafted into the table above and step 2.1 |
| Dispatcher sketch, cache on the update's spec context, view framing fact, perf lane | Opus | Grafted into step 1.1, the review frame rule and step 1.2 |
| Node selection input sites versus stored-selection reads | Opus and the judge | Grafted into step 1.4 |
| AI action editor and table-draft gate | Sol and Opus | Grafted into step 2.3 |
| Main-editor code outside plugin methods, such as a raw `editor.update` callback | All three | Limit: it keeps writing bare paths to main; doctrine says pass keys or live nodes |
| A foreign key's entry from `nodes.get` | All three | Limit: its path is relative to the key's root (the rooted-paths Stop) |

## Risks and rollback

Three realistic failures, from the blast radius:

1. **An app plugin method with undeclared arguments throws** where it ran before. Blast radius: app plugins whose undeclared method sits deeper than the type check looks, or that use Plite's `definePlugin`; the runtime count in step 1.1 must find no first-party one. Rollback: let an undeclared method follow the caret instead of throwing. Proof: step 1.1.
2. **A command that wrote a fixed main-document place moves into the caret's section.** The census found two, footnote definitions (accepted, see Decisions) and `lint.fix` (fixed in step 2.2). Rollback: give the method a location declaration. Proof: steps 2.1 and 2.2.
3. **A toolbar command throws in a section whose schema forbids its result.** Today it writes main; after, it throws as that section's own editor already does. Blast radius: commands with no placement check, run with the caret in a restricted root such as a details title. Rollback: none needed for correctness; each such command gains a placement refusal. Proof: step 2.1's schema case and step 2.4's hand drive.

A fourth risk is cost. The dispatcher runs on every plugin method call, live-node resolution runs on every node-target read, and the review frame maps a named root's keys. Step 1.2 gates all three.

## Performance gate

Start Gates:
| Gate | Applies | Evidence |
|------|---------|----------|
| Performance pack selected | yes | The dispatcher is a runtime layer on every plugin method call |
| User-facing operation and runtime owner identified | yes | A plugin update method call in `editor.update`; current owner `frameUpdateMethods` and the base group builder, target `core/plugin-dispatch.ts` |
| Scale variables and cohorts fixed | yes | Installed plugins (Indent alone, and `BaseEditorKit`), named roots in the document (0, 50), where the target sits (main, a named root, the last-registered root), the target note's size under review (200 blocks), whether the update calls a plugin method at all, and whether a review tree is registered with a pending change; cohorts in step 1.2 |
| Budget frozen before target measurement | yes | Step 1.2: candidate over base median per update at most 1.05 on every cohort but `routed` and `review`, and at most 1.10 on those two, one `paired-timing.mjs` config per budget |
| Baseline and target probe selected | yes | Base at `c5921381cf` through `proof-worktree.mjs`; target is step 1.1's dispatcher |
| Correctness guard selected | yes | Step 1.1's spec and the `plitejs` suite |
| Production detector decision recorded | N/A | A headless library path with no production detector |

Completion Gates:
| Gate | Applies | Required action | Evidence |
|------|---------|-----------------|----------|
| Pre-acceptance scale proof | yes | Step 1.2's paired run passes every cohort | open: run 2 was inconclusive under load (`docs/plans/artifacts/2026-10-17-named-root-targeting/perf/paired-b-a2.log`); suggested task t_590c341a times it |
| Warm latency budget | yes | Same run, warm median per update | open: run 2 was inconclusive under load (`docs/plans/artifacts/2026-10-17-named-root-targeting/perf/paired-b-a2.log`); suggested task t_590c341a times it |
| Large/stress scaling | yes | The 50-root cohorts | open: run 2 was inconclusive under load (`docs/plans/artifacts/2026-10-17-named-root-targeting/perf/paired-b-a2.log`); suggested task t_590c341a times it |
| Cold and failure paths | N/A | No cold path; a failed lookup refuses as today | Step 1.1 case (e) |
| Payload and fan-out | yes | The guard wraps a member on first read; the cache adds one view transaction per touched root per update | open: run 2 was inconclusive under load (`docs/plans/artifacts/2026-10-17-named-root-targeting/perf/paired-b-a2.log`); suggested task t_590c341a times it |
| Production-path rerun | yes | Rerun step 1.2 on the final tree | handed to suggested task t_590c341a (Defaults: time it here) |
| Correctness guard | yes | `plitejs` and `platejs` suites on the final tree | `docs/plans/artifacts/2026-10-17-named-root-targeting/build/land-plitejs-suite-a1.log` and `docs/plans/artifacts/2026-10-17-named-root-targeting/build/close-platejs-suite-a1.log`; every red also fails at next (`docs/plans/artifacts/2026-10-17-named-root-targeting/build/next-reds-base-a1.log`, `docs/plans/artifacts/2026-10-17-named-root-targeting/build/next-react-base-a1.log`) |
| Before/after receipt | yes | Step 1.2 and its rerun | open: run 2 was inconclusive under load (`docs/plans/artifacts/2026-10-17-named-root-targeting/perf/paired-b-a2.log`); suggested task t_590c341a times it |
| Detector and privacy | N/A | No production detector | none |
| Performance regression check | yes | Step 4.2's rerun | handed to suggested task t_590c341a (Defaults: time it here) |
| `pnpm check` steps before acceptance | yes | Typechecks, the entrypoint graph and the audits the edits reach, before step 4.2 | `docs/plans/artifacts/2026-10-17-named-root-targeting/build/land-plitejs-typecheck-a1.log`, `docs/plans/artifacts/2026-10-17-named-root-targeting/build/close-platejs-typecheck-a1.log`, `docs/plans/artifacts/2026-10-17-named-root-targeting/build/land-generic-types-a1.log`, `docs/plans/artifacts/2026-10-17-named-root-targeting/build/land-www-tsc-a1.log` and `docs/plans/artifacts/2026-10-17-named-root-targeting/build/close-entrypoint-turbo-check-a2.log`; the one type error also fails at next |
| Hand drive | yes | `verify`'s hand drive of step 2.4 after the last edit to the pages it reaches | `docs/plans/artifacts/2026-10-17-named-root-targeting/build/drive-check-a2.log`, `docs/plans/artifacts/2026-10-17-named-root-targeting/build/drive-docs-check-a1.log` and `docs/plans/artifacts/2026-10-17-named-root-targeting/drive-column/drive.md` |
| Playtest | N/A | `playtest.mjs scope` names no catalog, and the build adds no editor feature | skip: no scenario catalog covers these files |
| Slice review (`thermos`) | N/A | The api-build reviews row owes a panel on the diff, which applies both lenses | skip: api-build panel in step 4.1 |
| Docs example coverage (`plate-docs`) | yes | Steps 3.2 to 3.4 | `docs/plans/artifacts/2026-10-17-named-root-targeting/build/docs-coverage.md` |
| `best-api repair` | yes | Step 3.5 | `docs/plans/artifacts/2026-10-17-named-root-targeting/build/close-teaching-sweep-txlocate-a1.log` |
| Changeset | yes | Step 3.5 | `docs/plans/artifacts/2026-10-17-named-root-targeting/build/close-changeset-status-a2.log` |
| Diff panel (reviews: api-build) | yes | Step 4.1 | `docs/plans/artifacts/2026-10-17-named-root-targeting/panel/diff-r3.md`, round 3 of 3 |

## Steps

Phase 1 ends with a keep or revert decision on the dispatcher, from steps 1.1 to 1.4. Step 1.2 runs after step 1.4, because its `live-read` cohort measures step 1.3.

Each step's proof separates red cases, which fail at `HEAD` with an assertion and pass after, from guard cases, which pass at both and pin behavior the step must keep. The base control runs the red cases in a detached worktree at `c5921381cf`.

- [x] 1.1 Add `packages/plitejs/src/core/plugin-dispatch.ts` and call it from the transaction guard's call path for update methods (`guardTransactionValue`, which both group builders use) in place of `frameUpdateMethods`, with the rules in Decisions. The guard threads the group name and member path through `guardMember`, dispatches only when the update value is a function, and takes the caller's root from the transaction. The guard already wraps a member on first read and caches it, while the protocol check and the group merge before it read and spread every raw member, so the old wrapper position would wrap every member. `editor-runtime-view.ts` registers the root transaction builder with core when it loads, because core cannot import it. The cache sits on the update's spec context, keyed by root, and the frame's spec context has its own. Before the throw for undeclared methods goes on, a runtime count over every `txGroups` registration of an editor with `BaseEditorKit` (`apps/www/src/registry/components/editor/plugins-static.ts`) plus Plite's DOM, history and authored plugins, walking nested objects and members attached to functions, finds no first-party method that takes arguments without a declaration. Proof: a new `packages/plitejs/test/plugin-dispatch.test.ts`. Red cases: (a) with the caret in a note, a main-editor method with no target that writes `[0]` writes the note's first block; (b) given a note key with the caret in main, it writes the note, and a selection-default read inside it finds no selection; (c) a note view given a main key writes main, and the method reads `tx.view.root()` as undefined; (d) two targets in two roots throw before the body runs; (f) a routed plugin method that calls another with no target keeps the nested call in the outer call's root; (g) a routed method that moves the selection into main keeps its explicit-path writes in the note, and its implicit write after the move does nothing; (h) one commit per call, and one undo restores the note; (i) an undeclared method with an argument throws with no review tree registered, at the top level, nested two levels deep and attached to a function; (k) with a review tree whose projection hides a pending deletion in the note, a main-editor call with the caret in the note decides on the note's proposed document, a hidden note key skips the method, a visible note key on a block that holds a pending change runs the method and records a proposal, and accepting all gives the same document as a plain editor run, as `authored-tree-commands.test.ts` checks for main; (l) a note view with the selection in main runs `indent.increase` and changes nothing (P4 indents the note's first block at `HEAD`); (o) `dom.autoScroll` called on the main editor with the caret in a note, whose callback writes at an explicit main path and calls `indent.increase()`, writes the main path in main and indents the note's block, with no review tree and again under one whose projection holds a pending change in the note; (n) a main-key method called on the main editor with the caret in a note, whose nested call is a no-target `indent.increase()`, changes neither main nor the note (at `HEAD` it indents main's block at the note block's path). Guard cases: (e) a missing key runs in the caller's root; (j) `txOnly`, `txSelection` and `txStored` methods keep the caller's root; (m) `dom.autoScroll` called on the main editor with the caret in a note runs its callback's bare paths in main; (p) a plugin group's keys, a spread of it and two reads of one member look the same as at `HEAD`; (q) an update that calls no plugin method counts no dispatch work. `pnpm --filter plitejs test`, `pnpm --filter plitejs typecheck` and `command-frame.test.ts` pass.
  Done: `packages/plitejs/test/plugin-dispatch.test.ts` passes (`docs/plans/artifacts/2026-10-17-named-root-targeting/build/dispatch-final-a1.log`) and its red cases fail at `c5921381cf` (`docs/plans/artifacts/2026-10-17-named-root-targeting/build/red-base-a1.log`); the plitejs suite and typecheck on the final tree are `docs/plans/artifacts/2026-10-17-named-root-targeting/build/land-plitejs-suite-a1.log` and `docs/plans/artifacts/2026-10-17-named-root-targeting/build/land-plitejs-typecheck-a1.log`. Deviation: the census became `packages/platejs/src/lib/plugin-dispatch-census.spec.ts`, which walks the same plugins on every run.
- [ ] 1.2 Pre-acceptance: run Benchmark's pre-acceptance probe on steps 1.1, 1.3 and 1.4 before accepting the dispatcher. Write a bun runner in the run directory that times 2,000 committing updates per sample. Odd updates call `indent.increase` and even ones `indent.decrease`, each in its own update, on a 200-paragraph document. Cohorts: `typing-kit` (`BaseEditorKit`, no roots, each update inserts one character and calls no plugin method); `main-only` (Indent alone, no roots, caret in main); `main-only-kit` (`BaseEditorKit`, no roots, caret in main); `main-target` (Indent alone, 50 roots, caret in main, each call given a main block's key); `live-read` (50 roots, each update reads `tx.nodes.get` of a main block's live node, then writes it); `routed` (Indent alone, 50 roots, a key in the last-registered note from the main editor; the base arm calls the same method through that note's view, which does the same work at `HEAD`); and `review` (Indent and the authored plugin, 50 roots, the last-registered note holding 200 blocks, a review tree registered with a pending change in that note before the target block, a key in the note from the main editor; the base arm calls with a main key and a pending change in main before its target, which `HEAD` frames in main). The `review` cohort reads back a non-null projection and the note's mapped index on each sample. Arms: base at `c5921381cf` through `proof-worktree.mjs`, candidate, a same-code second candidate, and a planted candidate that busy-waits in the code each cohort measures: once per update in the group build for `typing-kit`, in live-node routing for `live-read`, in the per-root key mapping for `review`, and on each dispatcher call for the rest. Each plant waits 50% of its own cohort's base median microseconds per update, so it fails even a candidate faster than base, from one timed base sample per cohort, frozen in the config before any candidate run, and the planted arm reports how often each plant ran and fails when a cohort's count is zero. Two `paired-timing.mjs` configs, frozen before any target run: one at a budget of 1.05 over every cohort but `routed` and `review`, one at 1.10 over those two. Each cohort reads back the root it wrote and the plugin count it installed, and fails when either differs from its name. A conclusive miss sends the design back to `architect`; an inconclusive run keeps the dispatcher at `gate`. Proof: both paired-timing logs with exit 0, and the planted arm rejected on every cohort.
  Open: run 2 was inconclusive under load (`docs/plans/artifacts/2026-10-17-named-root-targeting/perf/paired-b-a2.log`), so the keep or revert decision on the dispatcher stays at gate. Next probe: suggested task t_590c341a runs both configs on the final code on a host under load 9.
- [x] 1.3 Route a live node through its key in `getNodeTargetRoot`, and route `nodes.toArray`, `nodes.blocks`, `nodes.replace`, `blocks.toggle` and `blocks.duplicate` through their target's root before they resolve it, keeping each one's reads and writes in that root. Widen `EditorReplaceNodeOptions.at` to `Descendant | NodeKey | Path`. Proof: red cases, from the main editor: `tx.nodes.set` at a note's live node writes the note (at `HEAD` it writes nothing, `probe/roots-head-a2.log`); `tx.nodes.replace` at a note key and at a note live node replaces the note block; `nodes.toArray` and `nodes.blocks` at a note key and at a note live node return the note's entries; `tx.blocks.toggle` and `tx.blocks.duplicate` at a note key and at a note live node act on the note block (both refuse at `HEAD`). Guard case: `tx.nodes.path` of a note's live node from the main editor stays undefined.
  Done: the red cases are in the same base control, `docs/plans/artifacts/2026-10-17-named-root-targeting/build/red-base-a1.log`, and pass in `docs/plans/artifacts/2026-10-17-named-root-targeting/build/land-plitejs-suite-a1.log`.
- [x] 1.4 Make a node selection passed without a root mean the reader's root, and keep a stored selection's own root. The split goes by where the selection came from, not by site: `runNodeTargetMutation`, `toggleBlock` and `duplicateBlocks` (`public-state.ts`, near lines 6019, 6184 and 6378) and `text.string` (near 5594) take either an explicit `at` or the stored selection, so each applies the reader's root only to the explicit one. `getMutationRoot` (near 2623), `getWriteRoot` (`interfaces/editor.ts`, near 4650) and the sites near 1912, 1928, 4917, 5088 and 6533 are checked the same way, caller by caller, and each site the step changes gets its own red case. Proof: red cases in a note view, each with an explicit rootless node selection: `tx.nodes.set` and `tx.nodes.unset` write the note's block, `tx.blocks.toggle` and `tx.blocks.duplicate` act on the note's block, and `read.text.string` reads the note (`tx.nodes.set` and `read.text.string` reach main at `HEAD`, `probe/next-controls-a1.log`). Guard cases: the same calls with no `at` and a stored node selection in the note act on the note, and on the base editor a stored node selection in main acts on main.
  Done: the red cases are in `docs/plans/artifacts/2026-10-17-named-root-targeting/build/red-base-a1.log` and pass in `docs/plans/artifacts/2026-10-17-named-root-targeting/build/land-plitejs-suite-a1.log`.
Phase 2 ends with a keep or revert decision on the Plate cleanup, from the platejs suite.

- [x] 2.1 Delete `packages/platejs/src/internal/utils/inRoot.ts` and the root threading in the 9 source files and one spec that import it, and the Code toggle's root guard. Plate's callers of `canPlaceBlocksAtPath` and `placeElementAt` pass their transaction's root (`tx.view.root()`) instead of one read from the selection; the helpers and their core callers keep the explicit root. Combobox's root comparison and Table's read helper are not this threading and stay. Move List Tab and Untab (`BaseListPlugin.ts`, `handleListTab` and `handleListUntab`) and Upload's caret anchor (`BaseUploadPlugin.ts`, `getCaretAnchor`) onto the caret root's view, because they write outside a plugin method. Proof: red cases, from the main editor with the caret in a note: Code toggle converts the note title (`BaseDetailsCodeConversion.spec.ts`, the toggle case); Indent increase, Column toggle and Blockquote wrap edit the note (three of the `MAIN-WRITTEN` rows of `probe/premises-next-a1.log`); Details wrap edits a note whose schema admits details; List insert's follow-up joins the note's list; and from a note view, List, Column and Details commands given a rootless node selection edit the note. A case where the note's schema refuses details shows Details wrap throwing as the note view's call does, with main unchanged. `BaseDetailsConversion.spec.ts`'s main-root case is rewritten to the new rule. `git grep -n -e 'utils/inRoot' -- packages apps` prints nothing, and `pnpm --filter platejs test` passes.
  Done: the red cases fail at `c5921381cf` in `docs/plans/artifacts/2026-10-17-named-root-targeting/build/base-p2-specs-a1-a1.log` and pass in `docs/plans/artifacts/2026-10-17-named-root-targeting/build/close-platejs-suite-a1.log`; `git grep -n -e 'utils/inRoot' -- packages apps` prints nothing. Every platejs red also fails at next (`docs/plans/artifacts/2026-10-17-named-root-targeting/build/next-reds-base-a1.log`).
- [x] 2.2 Give `lint.fix` a location declaration for its finding's key. Make `column.moveMiddle` locate its entry's key and resolve the path from that key in its transaction. Place a new footnote definition at `tx.children().length`. Proof: red cases: the main editor fixes a main lint finding while the caret sits in a note (red on step 1.1 without this change); the main editor merges the middle column of a column group inside a note (red at `HEAD`); with two main blocks and four note blocks, the main editor with the caret in a note creates a definition at the note's end, numbered `1` while main already has a `1`, and `selectDefinition` through the note's view finds it. Red case: under a review tree that hides a pending change before a column group inside a note, the main editor's `column.moveMiddle` on that group merges the right column. Guard case: the same with the column group in main merges the right column, as at `HEAD`.
  Done: the footnote and column red cases are in `docs/plans/artifacts/2026-10-17-named-root-targeting/build/base-p2-specs-a1-a1.log`; the lint and column cases pass in `docs/plans/artifacts/2026-10-17-named-root-targeting/build/close-platejs-suite-a1.log`.
- [x] 2.3 Fix AI's captured targets in `AIChatPlugin.ts`: derive an action editor from the captured key or range, `createEditorView(commandEditor, { root })` for a named root and `createEditorView(commandEditor, {})` for main, so a view command editor's read-only state and the authored intent carry over; the selection-restore check (`commandEditor.read.view.isReadOnly()`, near line 487) stays on the command editor, because a main view made from the base editor does not carry its read-only flag; keep the resolver's split between a failed lookup and a main-root hit; drop stored root labels where a key gives the root; `show()` selects the live block; insert-mode accept replaces at the target's key and inserts after the anchor's key; `selectActionEntries` selects live nodes; the table-draft gate compares the action root; the request context keeps a node selection's root. Proof: red cases, one per finding in the brief: `show()` from a note view labels a main block with main; after an answer on a picked note title from the main editor, the caret lands in the note; insert-mode accept for a note target writes the note. Guard cases: accepting a main capture from a read-only note view writes nothing, and from a proposing note view records a proposal; a read-only base editor still skips the selection restore.
  Done: the AI red cases fail at base in `docs/plans/artifacts/2026-10-17-named-root-targeting/build/base-p2b-ai-a1.log` and pass in `docs/plans/artifacts/2026-10-17-named-root-targeting/build/close-ai-slow-a2.log` and `docs/plans/artifacts/2026-10-17-named-root-targeting/build/close-platejs-suite-a1.log`.
- [x] 2.4 Hand drive the details demo, per `verify`'s hand drive: with the caret in a details title, run Code block and Indent from the toolbar and confirm the title changes and the main document does not, then click Details there: main stays unchanged and no uncaught error reaches the page. A miss gives that command a placement refusal in this build. Proof: `node tooling/scripts/hand-drive.mjs check` passes for the cells `hand-drive.mjs scope` lists, with a screenshot of each.
  Done: `docs/plans/artifacts/2026-10-17-named-root-targeting/build/close-drive-check-all-a1.log` covers every cell on the final tree, the details demo was driven again after the rebase (`docs/plans/artifacts/2026-10-17-named-root-targeting/drive-column/drive.md`), and Code block, Indent and Details ran from the toolbar in main (`docs/plans/artifacts/2026-10-17-named-root-targeting/build/drive-details-reads.md`). Deviation, accepted with the Defaults word refuse indent here: Indent from a details title throws before this change too, so it went to suggested task t_33607459 instead of a placement refusal, and the named-root claims rest on the Phase 2 specs because no demo page holds a named root.

Phase 3 teaches the new rule.

- [x] 3.1 State the rule in `docs/vision/plite.md`, under node identity: a plugin update method runs in its target's root, a node selection without a root means the reader's root, and a live node targets its root as its key does. Update the `NodeSelection` comment in `interfaces/selection.ts` and the marker comments in `tx-only.ts`. Proof: `pnpm --filter plitejs typecheck`, and the `best-api repair` check in step 3.5.
  Done: `docs/vision/plite.md`, `packages/plitejs/src/interfaces/selection.ts` and `packages/plitejs/src/core/tx-only.ts`; `docs/plans/artifacts/2026-10-17-named-root-targeting/build/land-plitejs-typecheck-a1.log`.
- [x] 3.2 Run `plate-docs` on `content/docs/(guides)/plugin-methods.mdx` and its Chinese twin: location declarations now also pick the root, and an undeclared method with arguments throws everywhere. Proof: the page's example coverage audit, the docs checks and a rendered preview of both pages.
  Done: `docs/plans/artifacts/2026-10-17-named-root-targeting/build/docs-coverage.md`, `docs/plans/artifacts/2026-10-17-named-root-targeting/build/docs-build-registry-check-a1.log` and the rendered pages in `docs/plans/artifacts/2026-10-17-named-root-targeting/build/drive-docs-reads.md`, whose cells `docs/plans/artifacts/2026-10-17-named-root-targeting/build/close-drive-check-all-a1.log` covers. Limit: `check:docs` stops at `api-reference:check`, which fails at next too.
- [x] 3.3 Run `plate-docs` on `content/docs/api/editor-api.mdx` and its Chinese twin, and on `content/docs/(guides)/roots.mdx`: commands from the main editor follow the target's root, and a live node targets any root. Proof: the example coverage audit, the docs checks and a rendered preview of each page.
  Done: the same coverage note, docs checks and rendered pages.
- [x] 3.4 Run `plate-docs` on `content/docs/plite/libraries/plite.mdx`'s roots passage. Proof: the docs checks and a rendered preview.
  Done: the same docs checks and rendered pages.
- [x] 3.5 Run `best-api repair` for the changed rule, and add a changeset for `plitejs` and `platejs`. Proof: `best-api`'s mirror check passes and `pnpm changeset status` lists both packages.
  Done: `docs/plans/artifacts/2026-10-17-named-root-targeting/build/close-teaching-sweep-txlocate-a1.log` finds no live call of the rejected shape, and `docs/plans/artifacts/2026-10-17-named-root-targeting/build/close-changeset-status-a2.log` lists `.changeset/plitejs-target-root.md` and `.changeset/platejs-target-root.md`. Limit: the generated API reference manifest stays stale, because its generator fails at next too.

Closing gates.

- [x] 4.1 Writing passes (`deslop`, then `no-comments`), then a panel on the diff (reviews: api-build). Proof: the `writing` and `seats` rows in the decision log.
  Done: three diff panel rounds, the last in `docs/plans/artifacts/2026-10-17-named-root-targeting/panel/diff-r3.md`, each round's writing passes ending with `docs/plans/artifacts/2026-10-17-named-root-targeting/panel/no-comments-d3.md`.
- [x] 4.2 Rerun step 1.2 on the final tree, then `pnpm --filter plitejs test`, `pnpm --filter platejs test` and both typechecks, then `pnpm lint:fix` on the task's paths. Proof: the rerun's paired-timing log and each suite's log.
  Done: `docs/plans/artifacts/2026-10-17-named-root-targeting/build/land-plitejs-suite-a1.log`, `docs/plans/artifacts/2026-10-17-named-root-targeting/build/close-platejs-suite-a1.log`, `docs/plans/artifacts/2026-10-17-named-root-targeting/build/land-plitejs-typecheck-a1.log`, `docs/plans/artifacts/2026-10-17-named-root-targeting/build/close-platejs-typecheck-a1.log` and `docs/plans/artifacts/2026-10-17-named-root-targeting/build/land-lint-fix-a1.log`; every red also fails at next (`docs/plans/artifacts/2026-10-17-named-root-targeting/build/next-reds-base-a1.log`, `docs/plans/artifacts/2026-10-17-named-root-targeting/build/next-react-base-a1.log`). The timing rerun went to suggested task t_590c341a with the Defaults word time it here, after `docs/plans/artifacts/2026-10-17-named-root-targeting/perf/paired-b-a2.log`.

## Proof

The red-at-`HEAD` halves of steps 1.1, 1.3, 1.4, 2.1 and 2.3 run in a detached worktree at `c5921381cf` before the build, as the base control. Step 1.2 gates the design's cost before the Plate steps start. Step 2.4 is the only browser proof, because the change sits above the DOM.

The build ran under task_4ed42f14 from the lead session's brief, in the worktree branch `claude/nervous-lamport-7fd3d2`, cut from `next` at `c5921381cf` and rebased onto `b40cebebee`. A Codex worker wrote most of the code of Phases 1 and 2 from the brief `docs/plans/artifacts/codex/task_4ed42f14/phase1-brief.md` and its Phase 2 follow-ups beside it. The lead wrote the runtime fixes Codex stopped at, which are the range roots in `wrap-nodes.ts` and `unwrap-nodes.ts` and the guard and portal routing in `public-state.ts`. It also trimmed Codex's tests, made the panel rounds' fixes, and wrote the docs and the changesets.

## Challenge delta

Plan panel round 1 reviewed the plan frozen at `d39037e82c` with three seats: claude-opus-5-5 @xhigh, gpt-6-astra @xhigh and gpt-6.1-sol @xhigh. The challenge delta is improved, inside the picked target. The runtime still runs each plugin method in its target's root from its declaration.

- The lead reverted its deviation to the synthesis's rule. The dispatcher frames a base-editor call under review in its decided root, because an unframed call decides on stored content and a hidden key reaches the method.
- Step 1.4 splits explicit node selections from the stored one by where the selection came from, because three of the "stored" sites take both.
- Step 1.5 is gone. Core callers plan placement before any transaction exists, so the explicit root stays, and only Plate's callers change, in step 2.1.
- Footnote definitions use the root's own length, `lint.fix` and `column.moveMiddle` keep their frame mapping, and AI derives a main view instead of using the main editor.
- Routing also covers `nodes.replace`, `nodes.toArray` and `nodes.blocks`. A view ignores a foreign selection for default targets, nested calls inherit their outer call's root, and a callback argument keeps the caller's root.
- The perf gate gained the installed-plugin count, a typing cohort, a live-node read cohort, committing updates, two configs and a 25% plant.

Re-scored against keeping `HEAD`, the target still wins: it fixes all seven findings of the task in one owner and deletes Plate's threading, where `HEAD` keeps every command's patch. `architect` is not replayed, because no finding proposed another owner or target.

Plan panel round 2 reviewed the plan frozen at `45b875cb58` with the same three seats. The challenge delta is again improved, inside the picked target.

- The review frame enters the decided root's full scope and maps that root's keys through the projection, because the update root alone left key lookups in main, and a block with a pending change gets a new key in the projection.
- A callback argument sets no inherited root, so a plugin call inside `dom.autoScroll`'s callback still routes.
- `blocks.toggle` and `blocks.duplicate` join step 1.3's routed operations.
- Step 1.2 runs after step 1.4, plants each cohort's slowdown where that cohort's cost lands, sizes each plant from its own cohort, and adds a review-mode cohort.
- The dispatcher sits in the transaction guard's call path, which already wraps members on first read.
- Footnote numbering restarts in each section, and the Defaults row says so.

Re-scored against keeping `HEAD`, the target still wins for the same reason, and `architect` is again not replayed.

Plan panel round 3 reviewed the plan frozen at `8bd46a6c4f`, the last plan round before the build. The challenge delta is again improved, inside the picked target.

- A base-editor call runs on the base transaction only when its decided root is main and the selection sits in main or nowhere; every other call runs on its root's view transaction. That closes the read-from-the-note, write-into-main split a main-targeted call kept, and drops the round 2 limit.
- A function-argument call runs as at `HEAD`, on the caller's own transaction and framed in the caller's root, and passes through the inherited root in force, because a view transaction inside a review frame kept its callback's plugin calls in main.
- The review frame maps every projected root and keeps a per-root incremental path, and the `review` cohort runs on a 200-block note with a pending change.
- Plants are 50% of each cohort's own base, and step 2.2 regains its main-root review guard.

The diff panel reviews the build of these fixes.

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| Rooted read paths (task_5fc67c90) | Keep paths relative to a root; the view carries the root | Reads return paths that carry their root | rooted paths | big |
| Where the fix lives | The runtime runs each plugin command in its target's root (look) | Plate keeps passing the root by hand, command by command | per command | big |
| Command with no target, from the main editor | It follows the caret into its section (look) | It stays in the main document | no target main | big |
| Plugin command that hides its arguments | It throws (look) | It follows the caret | follow caret | small |
| Plugin reads | Only commands that write, for now (look) | Fix plugin reads the same way now | scope reads | small |
| New footnote definitions | At the end of the section the command runs in, numbered within that section; a jump from the main editor finds only main's notes (look) | Always at the end of the main document | footnotes in main | small |
| Commands in review mode that land in another section | Reviewed in that section, as main-root commands are (look) | Run outside review, as that section's own editor does today | unframed sections | small |
| Commands called on a section's editor in review mode | Same as before: they work on the saved document, so they can still change a block a suggestion deletes. Suggested task t_c3104bb1 fixes that (look) | Review them in this build | frame views here | small |
| A command that runs your own callback, such as auto-scroll | Your callback stays in the editor you called (look) | It follows the caret like other commands | callbacks follow caret | detail |
| A section's editor, or a command given a main target, while the caret sits elsewhere | Commands that act at the caret find no caret there (look) | They read the caret's position inside the section, as today | foreign caret | detail |
| Moving a block to another section | Unchanged: the destination is in the source's section | The destination can name its own section | cross-root move | detail |
| A target that no longer exists | The command fails as it does today | The command refuses up front | refuse missing | detail |
| Find and lint selection from a section's editor | Unchanged: they read the main document | Route them to the main document | route find | detail |
| Plate steps while step 1.2's timing stays open | Build them on the dispatcher until a quiet host times it, and revert them with it if the timing misses. Counted work stays close to base: a routed call builds 0.6% more indexes, and a review call builds about 7 per update (look) | Wait for a quiet host before the Plate steps | wait timing | small |
| The final timing rerun in step 4.2 | Suggested task t_590c341a times the final code on a quiet host. A shorter run here would likely end inconclusive too, because the load kept reaching the limit of 9 and the timing copies hold older code (look) | This run waits for a quiet host and times it itself | time it here | small |
| The runtime page's link | The two older pages, https://claude.ai/artifact/BasgJE5jsp5GxhNLk9ZfQw and https://claude.ai/artifact/HyoRG7LFmSEaNy8covmyRh, no longer open, so the page now lives at https://claude.ai/artifact/ShFXKHw7H89pDkPnZTAc8f (look) | Drop the new page, if the old ones were deleted on purpose | drop new page | detail |
| How a command evaluation reads the stored document's keys | It reads each changed root's published snapshot before the review frame starts, about 3% slower per warm probe with 21 changed roots; a probe right after a commit was not timed (safe) | A helper that reads the published snapshot lazily from inside the frame | lazy probe index | detail |
| Indent from a details title, and a named-root drive for step 2.4 | Indent's error goes to suggested task t_33607459, because it threw before this change too. The section cases rest on tests, because no demo page has a named section (look) | This build gives Indent a placement refusal and adds a demo with a named section | refuse indent here | small |

## Evidence

Model: claude-opus-5-5 @xhigh.

- 2026-10-04-runtime-audit: this review reopens it, because its Stop kept the view as the root context but did not see plugin commands on the base editor writing the main document from a named-root caret; its one-runtime-per-document and view-binding findings still hold.
- 2026-10-04-selection-audit: this review reopens it, because a node selection without a root still means the main document in a view, where paths, points and ranges without a root mean the view's root.
- [The content-root locations plan](2026-09-30-content-root-locations.md): this review retains its D1 and D7, so paths stay relative to a root and the view stays the root context.

### Requirements

- A command must never write a root it did not read its target from. The probe shows Column and Indent breaking this at `HEAD` (the decision log's probe at `HEAD`).
- Base-editor path inputs address the main root, and view path inputs address that view's root ([Plite vision](../vision/plite.md), the key paragraph under node identity). A fix may not make a bare path follow the caret.
- Keys are unique across one editor's roots and may target writes in any of them; code that holds a live node passes it as the target (`docs/vision/plite.md`).
- `Path` and `NodeEntry` stay relative to a root, and no root-qualified location carrier is added (content-root locations D1 and D7).
- `main` is never a public root argument.
- The review tree's command frame keeps mapping each method's location arguments onto the proposed document ([command-frame.ts](../../packages/plitejs/src/core/command-frame.ts), `frameUpdateMethods`).
- Commands called through a view keep today's behavior; the probe shows Code, List, Indent and Column correct from the note view.

### Premises proven by run

- P2: a view update nested inside a base update throws, so routing must build the root's transaction inside the open update instead.
- S1 and S2: a note view transaction built inside an open main update writes the note and joins the one commit, and a main view transaction built inside the note scope writes main and reads its root as undefined.
- P3: with a review tree registered, an undeclared main-editor call throws while a view call runs unframed.
- P4: a note view with the selection in main reads the main selection's path inside the note, so `indent.increase` indents the note's first block. Step 1.1 case (l) removes it.
- Marker census: every exported Base plugin's methods with arguments declare them. It skipped Plite's own plugins and a few Plate ones, so step 1.1 recounts at runtime over every installed plugin.
- No-target census: every no-target method acts at the selection except footnote definitions, `lint.fix` and `dom.autoScroll`, which runs the caller's callback.
- Identity census: every method that turns a key into a path either names that key in its declaration, reads the same root it writes, or is `lint.fix` or `column.moveMiddle`.

### Lanes

- **Runtime runs each plugin command in its target's root (picked).** It deletes the most code: every hand-passed root in Plate goes, and a command written without thinking about roots is correct by construction. The target's root comes from the arguments the method's `txLocate` already declares, and from the selection when it has none.
- **Plate passes the root by hand (today).** Every command must remember it. The probe shows two that forgot, and the PR 5170 review deferred Indent and Code for this reason (`docs/plans/2026-10-14-pr-5170-redo.decisions.tsv`).
- **Refuse a command whose selection sits outside the caller's root.** Code does this today. It is safe but leaves toolbars dead whenever the app calls the main editor, which is the common case.
- **Rooted paths everywhere (task_5fc67c90).** Reads return paths that carry a root. The content-root design rejected it because a path then means different things to a view and the base editor, and every path helper must learn roots.
- **Plate dispatches each toolbar command to the focused view.** It fixes toolbars only; app code and tests that call the main editor still write the wrong root.

Proof limits: the probes ran in jsdom against `HEAD`; Media, NodeSelection and ExitBreak sites come from the explorers' traces, not a run.

### Dependents

- `ui`: `apps/www/src/app/(app)/examples/plite/plite-example-client.tsx` mounts examples and calls no plugin command on another root, so it is unaffected.
- `distribution` and `editing`: `packages/platejs/src/utils/plugins/ExitBreakPlugin.ts` writes through plugin update methods, so from the main editor it now writes the caret's root, which is the fix. `SingleBlockPlugin.ts`, `SingleLinePlugin.ts` and `internal/plugin/markdownParagraph.ts` normalize or read inside one root and are unaffected.
- The open footnote review (`docs/plans/2026-10-17-footnote-review.md`) inserts a definition from the main editor; with the caret in a named root it now inserts at the end of that root, where that root's footnote registry finds it, numbered within that root. Its jumps stay in the caller's root. Its HTML anchors (`fn-<ref>`) can then repeat when a static page renders a section's `[1]` beside main's, which that review must handle.

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Plugin update method root | Caller's root; Plate threads a root by hand | Target's root, else a view's own root or the caret's root | Plite runtime | Writes stay in the root reads came from | Delete Plate's threading | Steps 1.1 and 2.1 | An app method with undeclared arguments | rearchitect |
| Dispatcher cost | Frame wrapper only under review | A wrapper on first read and a root lookup on every plugin call | Plite runtime | Routing needs each call's root | None | Step 1.2 | Slower updates with many plugins | gate |
| Live node as a target | Resolves only in the caller's root | Routes like its key | Plite runtime | Doctrine says pass the live node | Docs line on resolution scope | Step 1.3 | None found | rearchitect |
| Node selection without a root | Main root everywhere | The reader's root | Plite runtime | Matches paths, points and ranges | Selection type comment, docs | Step 1.4 | App code that built one to reach main | rearchitect |
| Placement check root | A root option; Plate reads it from the selection | Plate passes its transaction's root; core keeps its own | Plate | The transaction knows its root; core plans before a transaction | Plate's callers | Step 2.1 | None | rearchitect |
| Root threading in Plate | `inRoot.ts` and its 10 importers | Gone | Plate | The runtime owns it | Every importer | Step 2.1 | Missed caller | cut |
| AI captured target | Labeled with the command editor's root; written by bare path | Written in its key's root through an action editor | Plate AI | AI writes after an async answer, outside a plugin method | AI accept and show | Step 2.3 | Table drafts already gated by root | rearchitect |
| Rooted read paths | Paths relative to a root | Same | Plite | Content-root D1 and D7 | None | None needed | None | keep |
| Plugin read root | Caller's root | Same, this run | Plite | Writes corrupt data; reads only misreport | Open work | None | A read misreports from the main editor | defer |

## Close

Reversals and deviations come first.

- Round 3 of the diff panel reverted the `DeclaredPluginUpdate` type check that `pstack:correct` added to Plite's `definePlugin` after round 1. It broke plugins whose method returns a read through `tx.plugin(Self)`, refused arrays, Maps, `any` members and `txOnly` groups, and missed callable groups and deeper namespaces. The runtime throw and the census spec stay, and the type check is suggested task t_f50ba74c.
- Round 2's `correct` row said www's typecheck showed only the CodeMirror error. Its own log also held `lint.update.fix` typed as `(...args: never[])`, which round 3 found and fixed.
- `packages/platejs/turbo.json` stayed stale until the close, because this run's specs import three more partitions. `entrypoint:turbo:check` caught it, and the regenerated file passes.
- Step 1.1's runtime census became `packages/platejs/src/lib/plugin-dispatch-census.spec.ts`, which walks the same plugins on every test run. It walks `BaseEditorKit` and Plite's runtime plugins, not the www examples or the docs, and the round 1 diff panel found five first-party methods outside it, in the Plite images example and two Plite concept pages.
- Step 2.4 took a narrower drive, accepted with the Defaults word refuse indent here. Indent from a Details title throws before this change too, so it went to suggested task t_33607459, and no demo page holds a named root.
- Phases 2 and 3 were built before step 1.2's gate passed, though the Proof section says that gate comes first. The Defaults word wait timing records the pick. If t_590c341a's timing misses, the Plate steps revert with the dispatcher.
- In the cohorts with named roots, step 1.2's runner writes once to main, untimed, after each timed update. The approved step did not say so. At `HEAD`, each write to a named root makes the next one slower, from about 2 ms to 22 ms per update over 1,000 updates (`docs/plans/artifacts/2026-10-17-named-root-targeting/perf/change-value-growth.md`), and the main write resets it. Suggested task t_e6e0645e owns that defect.
- No narrowed rerun of step 1.2 ran at the close. The load averages read 7.51, 10.15 and 8.77 against the limit of 9, and the timing worktrees held older code, so a shorter run would likely have ended inconclusive too. Step 4.2's timing rerun went to suggested task t_590c341a, accepted with the Defaults word time it here.

In the worktree, Plite now runs each plugin update method in its target's root. A key, a live node or a rooted point picks the root, a bare path stays in the caller's root, and a call with no target follows the caret. A live node routes like its key in `nodes.set`, `nodes.replace`, `nodes.toArray`, `nodes.blocks`, `blocks.toggle` and `blocks.duplicate`, and a node selection without a root means the reader's root. An undeclared update method called with an argument throws. Plate's `inRoot.ts` and its root threading are gone, and `lint.fix`, new footnote definitions and AI's captured targets follow their target's root. `next` removed `column.moveMiddle`, so its routing left with it in the merge. Under review, the editor refuses a read, a write or a selection in a root a pending deletion drops, and a plugin call made inside another one skips a key the proposed document hides. A call through a view still reaches a hidden key, as at `HEAD`. The Plite vision, the docs and two changesets teach the rule.

Of the 15 steps, 14 are done, two of them through an accepted narrower proof (2.4 and 4.2), 0 are partial, skipped or blocked, and 1 is open (1.2).

Proof:

- Every red case fails at `c5921381cf` and again at next `b40cebebee`, and passes on the final tree.
- On the final tree, the plitejs and platejs suites and typechecks fail only where next fails the same way. Those are five authored record tests, the legacy suggestions migration test and its type error in platejs and www, two quote Backspace tests beside pending suggestions, two code block tests, two AI suggestion tests and one React audit test. A suggested task owns each of those checks.
- The three AI slow specs pass, 34 tests.
- The column and details demos were driven from the toolbar, and every drive cell of a changed file is covered.
- The diff panel ran three rounds, the cap. Once the owner said "codex are back", the count restarted with a cross-family round on the merge with `next` at `aa2f91c342`. It found four bugs. A command read before a key-targeted plugin write lost the write. A plugin call with the caret in a dropped root threw a schema error instead of refusing. AI requests through a named view lost object mode. The census missed symbol methods and flagged `txOnly` members. Each fix's test fails on the merge commit and passes after. A second round found that the dropped-root refusal also refused calls that write nothing in that root, such as `tx.history.restore`, and that a call made inside another method still ran on a key the proposed document hides. Now the frame refuses only a write into the dropped root, and a nested call skips a hidden key. Each of those tests fails on the first round's fix and passes after. A third round, the cap again, ran with Opus in every seat because the Codex login failed again. It found that a nested call skipped a live node the proposed document had rebuilt, and that a read, a write or a selection in the dropped root threw a raw error instead of refusing. Both are fixed, and each test fails on the second round's fix and passes after. It also found that a call through a view still passes a hidden key to the method, which stays open.
- Every seat probe of the first diff panel's round 3 and of each round after "codex are back" was rerun on the final tree. Each fixed case holds. The ones that still fail are the view case above, `tx.history.restore` of the current history (suggested task t_b58e613e, same at next), and two probes that pass a location shape Plite does not accept, which fail the same way on the second round's fix.

Limits:

- Step 1.2's timing is open. Its second run was inconclusive at a one-minute load of 39.70, so the decision to keep the dispatcher waits on t_590c341a. Routed's median ratio was 1.194 against a budget of 1.10, but the same code timed against itself read 1.340, and the spread was 0.146. Review's was 0.919. These numbers are noise, not a pass.
- The work counts cover five cohorts. Routed, live-read, main-only and main-target keep and snapshot the same roots as base, and routed builds 0.6% more indexes, 24,315 against 24,177. Review builds 28,309 indexes, about 7 per update, where its base builds 3 in all, because the base call stays in main. Typing-kit and main-only-kit were not counted.
- The named-root claims rest on jsdom specs, because no demo page holds a named root.
- The first diff panel's round 3 ran with Opus in every seat, because the Codex login failed. The cross-family rounds after "codex are back" reviewed its picks, the rebase's conflict fixes and the merge. Their own third round fell back to Opus in every seat, so the second round's fixes have only Opus's review and the third round's fixes have none. Suggested task t_d7ba05a8 asks a Codex seat to attack them.
- Under review, a plugin call through a view still decides on the stored document, so a key the proposed document hides reaches the method's body and can write the wrong block. It is the same at `HEAD` and at next. Suggested task t_c3104bb1, which frames view calls, owns it.
- `check:docs` stops at `api-reference:check`, and the generated API reference manifest stays stale. Both fail at next too.

Three other subjects still state the old behavior, and this run left them to their owners. `docs/plans/topics/lint.md` line 299 says a lint fix declares `txLocate(false)`, `docs/plans/topics/footnote.md` line 9 says a new definition goes at the end of the document, and `docs/plans/topics/transactions.md` line 313 says the command frame keeps its own path walker in `frameUpdateMethods`, which this run removed.

The brief's write list left out eight paths this run changed: `apps/www/src/app/(app)/examples/plite/_examples/images.tsx`, the rules row in `docs/development/enforcement.md`, the regenerated registry outputs under `apps/www/public/r` and `apps/www/src/__registry__`, `packages/platejs/turbo.json`, `packages/platejs/src/lib/plugin-dispatch-census.spec.ts`, `packages/platejs/src/lib/plugin/definePlugin.spec.ts`, `packages/platejs/src/react/plugin/definePlugin.spec.ts` and `packages/platejs/src/features/basic-nodes/lib/BaseBlockPlugins.spec.tsx`. The ledger's started rows now list them.

Attention, from the decision-trail review. Reviewed by claude-opus-5-5 @xhigh, a same-family fallback for codex:gpt-6.1-sol, whose ping failed on the ChatGPT login.

- Step 1.2 is weaker than its first Close said. Routed's ratio sits over budget inside the noise, the narrowed rerun was dropped without a row, and the Plate phases went ahead of the gate. The Close now says all three.
- Four platejs spec files sat outside the write list and went unreported. The Close and the ledger now list them.
- The Codex seats were down on the ChatGPT login, so round 3 and this review are Opus-only. The cross-family round after "codex are back" has since reviewed round 3's picks, and round 3's seat probes pass on the merged tree.
- The rebase's conflict fixes in `insertionAnchor.ts` and the footnote spec got no panel review until that cross-family round, which found nothing in them.
- t_e6e0645e, the `HEAD` slowdown that step 1.2's runner works around, was missing from Open work.

## Open work

- Time the dispatcher on a quiet host, which settles step 1.2. owner: zbeyens. stop: suggested task t_590c341a lands or is dropped. Tracked in the suggested-task ledger.
- Review commands called on a section's editor the way main-editor commands are, so they see the suggested document and skip a block a suggestion deletes. Today they still reach that block, as before this change. owner: zbeyens. stop: suggested task t_c3104bb1 lands or is dropped. Tracked in the suggested-task ledger.
- Let footnote jumps and the footnote registry see every root, so a jump called on the main editor finds a note's definition and numbers run across the whole document. owner: zbeyens. stop: suggested task t_ad6feb38 lands or is dropped. Tracked in the suggested-task ledger.
- Decide how Plite's `definePlugin` types refuse an undeclared update method with arguments. owner: zbeyens. stop: suggested task t_f50ba74c lands or is dropped. Tracked in the suggested-task ledger.
- Decide whether plugin reads (the `read` groups) route the same way. owner: zbeyens. stop: suggested task t_1f0c4036 lands or is dropped. Tracked in the suggested-task ledger.
- Keep the roots a transaction wrote apart from its index cache, so the lookup side cache can go. owner: zbeyens. stop: suggested task t_9910cbe2 lands or is dropped. Tracked in the suggested-task ledger.
- Stop Indent throwing in a Details title. owner: zbeyens. stop: suggested task t_33607459 lands or is dropped. Tracked in the suggested-task ledger.
- Stop a main write throwing while the caret sits in a named root. owner: zbeyens. stop: suggested task t_3d6e10dc lands or is dropped. Tracked in the suggested-task ledger.
- Have a Codex seat review the last two diff rounds' fixes, which only Opus reviewed. owner: zbeyens. stop: suggested task t_d7ba05a8 lands or is dropped. Tracked in the suggested-task ledger.
- Stop each write to a named root making the next one slower. owner: zbeyens. stop: suggested task t_e6e0645e lands or is dropped. Tracked in the suggested-task ledger.
