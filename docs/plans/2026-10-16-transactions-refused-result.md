---
review_scopes: [transactions, clipboard]
verdict: pursue
review_basis: [2026-10-15-transactions-placement-types, 2026-10-14-list-paste-type-adoption]
work_kind: implementation
review_commit: fa0ac06f55357f27f1872f2f31d9db9aa6d69ebb
review_inputs: [VISION.md, docs/vision/common.md, docs/vision/plite.md, packages/plitejs/src/core/refusal.ts, packages/plitejs/src/core/public-state.ts, packages/plitejs/src/core/editor-lifecycle-api.ts, packages/plitejs/src/core/plugin.ts, packages/plitejs/src/core/command-registry.ts, packages/plitejs/src/core/transfer.ts, packages/plitejs/src/create-editor.ts, packages/plitejs/src/editor-runtime-view.ts, packages/plitejs/src/interfaces/editor.ts, packages/plitejs/src/authored/authored.ts, packages/plitejs/src/authored/refusal.ts, packages/plitejs/src/authored/ledger/ledger.ts, packages/plitejs/src/dom/plugin/data-transfer-format.ts, packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts, packages/plitejs/src/react/editable/mutation-controller.ts, packages/plitejs/src/history/history-plugin.ts, packages/plitejs/test/authored-refusal.test.ts, packages/platejs/src/lib/plugin/createPluginContext.internal.ts, packages/platejs/src/lib/editor/pluginRuntimeTypes.ts, packages/platejs/src/internal/plugin/resolvePlugins.ts, packages/platejs/src/react/utils/dispatchPlateShortcut.internal.ts, packages/platejs/src/react/features/table/TablePlugin.tsx, packages/platejs/src/react/features/footnote/FootnotePlugin.tsx, packages/platejs/src/features/media/lib/BaseMediaPlugin.ts, packages/platejs/src/ai/react/AIChatPlugin.ts, apps/www/src/registry/components/editor/link.tsx]
review_upstreams: ['../prosemirror-state@ffad5d9450a0b93438be53a801deee1a223a81bf', '../prosemirror-view@ca4c78e9b56f1b164c0b3758b59d8748f11b7534', '../prosemirror-commands@52a84a842774fadec3b167bcdbd56085ec6c85df', '../lexical@dd5c41b13193efa9ab1574234d8593d2c9e4f988', '../slate@945a484df2497e4c448b33f417b0de2a49840032', '../tiptap@91c51be53c4655ef07e29ec489471524debfa0ca']
---

# Transactions: a refused update answers nothing

Status: executed: on your working tree for you to commit
Playbook: plan

**Pursue. A call that opens its own update should answer from that update's outcome: the callback's or method's answer when the update commits or changes nothing, and `undefined` when the editor refuses it.** Today every such call captures the answer inside the draft and returns it after the update, so `editor.update.slice.replace` returns `true` for a paste that Suggesting refused and rolled back. The paste is one instance of a class: `fragment.replace`, `nodes.remove`, `editor.update.command`, every plugin direct method, `dispatchCommand` and DOM `insertData` all report past a refusal, and `runTransfer` reads its outcome through a refusal subscription instead of its own update. The task asked whether the paste should wait for the refusal or refuse in its draft what Suggesting cannot hold; waiting wins, because the refusal runs at commit and only the update knows it. A draft-time check would teach core paste an authored rule, cover only root deletion, and leave every other call reporting past vetoes and generated-value refusals. A refused DOM paste does not fall back to its next format. Requested as suggested task t_cff52975, from findings S3 and N1 of t_1412a88d's bug review, in the local run file `artifacts/2026-10-15-whole-block-roots/review/thermo-bugs.md`. Execution playbook: Build (`.agents/playbooks/build.md`). Run directory: `docs/plans/artifacts/2026-10-16-transactions-refused-result/`.

`architect` ran three runners and an Opus cross-judge. All three put the outcome on the call stack: the outermost update returns its own result, so no subscription, counter or shared record has to correlate it. They split on what a refused call answers. One runner answered `false` for a boolean method, and two answered `undefined` for every method so that "declined" and "refused" stay apart. The judge picked the plain-answer base with the `undefined` graft, and the lead agrees: `undefined` keeps every gesture handler that treats only `false` as unhandled consuming a refused key, with no adapter change.

## Brief

### What will change?

When suggesting mode refuses a paste or any other edit, the call now answers nothing instead of claiming success, and a refused rich paste lands nothing. The Close lists the four places the build changed the plan.

### What could go wrong?

In suggesting mode, a rich paste over a block that owns a content area is refused for now. Apps expecting yes or no get type errors. A Plate paste handler returning a refused answer passes the event on.

## Teach

Plite runs every edit inside an update. Commands write to a draft, and at commit the editor checks the whole update; suggesting mode can refuse it there, for example when the edit would delete a named content area. A refused update rolls back and tells its refusal listeners.

Today a call such as a paste asks the draft whether it worked and returns that answer after the update, without looking at the commit. So a paste that suggesting refused still says it landed. The DOM paste picks its format before the commit too, so a refusal never sent it to the next format.

Now the update itself hands back the answer. When the commit lands, or the update changed nothing, the caller gets the draft's answer. When the editor refuses it, the caller gets nothing. Inside an update the draft answer stays, because the update has not been judged yet.

## Public API

A direct update call answers `undefined` when the editor refuses the update it opened, and its type says so.

```ts before
// packages/plitejs/src/interfaces/editor.ts, EditorCoreUpdateMethods
slice: EditorBivariantMethods<Pick<EditorTransactionSliceApi<V>, 'replace'>>;
// editor.update.slice.replace(slice): boolean
// true in a Suggesting view even when the commit refuses the paste
```

```ts after
// packages/plitejs/src/interfaces/editor.ts, EditorCoreUpdateMethods
slice: EditorDirectMethods<Pick<EditorTransactionSliceApi<V>, 'replace'>>;
// editor.update.slice.replace(slice): boolean | undefined
// undefined when the editor refuses the update this call opened
```

The callback form returns the callback's answer, or `undefined` when the editor refuses the update. Inside the callback, `tx` methods keep reporting the draft.

```ts before
// packages/plitejs/src/interfaces/editor.ts, EditorUpdate
(
  fn: (
    transaction: EditorUpdateTransaction<V, TPlugins>,
    context: EditorUpdateContext<BaseEditor<V, TPlugins>>
  ) => void
): void;
```

```ts after
// packages/plitejs/src/interfaces/editor.ts, EditorUpdate
<R = void>(
  fn: (
    transaction: EditorUpdateTransaction<V, TPlugins>,
    context: EditorUpdateContext<BaseEditor<V, TPlugins>>
  ) => R
): R | undefined;
```

`editor.update.command` answers the same way, while `tx.command` keeps its draft boolean, so the direct form gets its own dispatch type.

```ts before
// packages/plitejs/src/interfaces/editor.ts, EditorCoreUpdateMethods
/** Dispatch a typed semantic command in one update. */
command: EditorCommandDispatch<BaseEditor<V, TPlugins>>;
```

```ts after
// packages/plitejs/src/interfaces/editor.ts, EditorCoreUpdateMethods
/** Dispatch a typed semantic command in one update. */
command: EditorDirectCommandDispatch<BaseEditor<V, TPlugins>>;
```

The DOM clipboard inserts and the React command dispatcher open their own update when no update is open, so they answer `undefined` for a refusal too.

```ts before
// packages/plitejs/src/dom/plugin/dom-editor.ts and packages/plitejs/src/react/hooks/use-plite-runtime.tsx
insertData: (data: DataTransfer) => boolean;
insertFragmentData: (data: DataTransfer) => boolean;
insertTextData: (data: DataTransfer) => boolean;
export type CommandDispatcher<TCommand extends EditorCommandDescriptor> = (
  ...input: CommandArgs<TCommand>
) => boolean;
```

```ts after
// packages/plitejs/src/dom/plugin/dom-editor.ts and packages/plitejs/src/react/hooks/use-plite-runtime.tsx
insertData: (data: DataTransfer) => boolean | undefined;
insertFragmentData: (data: DataTransfer) => boolean | undefined;
insertTextData: (data: DataTransfer) => boolean | undefined;
export type CommandDispatcher<TCommand extends EditorCommandDescriptor> = (
  ...input: CommandArgs<TCommand>
) => boolean | undefined;
```

`runTransfer` reads its own update's answer instead of listening for any refusal while it runs. Every exit of its callback that writes the move returns `true`, so only a refused update reads as a refusal.

```ts before
// packages/plitejs/src/core/transfer.ts, runTransfer
let declined = false;
const stopRefusals = subscribeEditorRefusals(editor, () => {
  declined = true;
});

try {
  editor.update((tx) => {
```

```ts after
// packages/plitejs/src/core/transfer.ts, runTransfer
let accepted: true | undefined;

try {
  accepted = editor.update((tx) => {
    // each exit that writes the move ends with
    return true;
  });
```

## What other editors do

This review read the ProseMirror (`prosemirror-state` `ffad5d9`, `prosemirror-view` `ca4c78e`, `prosemirror-commands` `52a84a8`), Lexical (`dd5c41b13`), Slate (`945a484df`) and Tiptap (`91c51be53`) checkouts beside the repository and ran none of them. None reports whether a dispatched edit survived a whole-update refusal; Plite is the only one whose update can be refused after its commands ran.

| Editor | Who can refuse a whole edit | What the paste or command returns |
| --- | --- | --- |
| ProseMirror | A plugin's `filterTransaction` drops a transaction in `applyTransaction` (`prosemirror-state` `src/state.ts:138`) | `doPaste` returns `true` after `view.dispatch` (`prosemirror-view` `src/input.ts:643`), and commands return `true` after `dispatch`, even when a filter dropped the transaction |
| Lexical | No refusal; `editor.update` runs the edit | `dispatchCommand` returns whether a listener handled it (`packages/lexical/src/LexicalUpdates.ts:878`) |
| Slate | No refusal; transforms apply operations directly | Transforms return nothing |
| Tiptap | ProseMirror's `filterTransaction`, also exposed per extension (`packages/core/src/types.ts:352`) | A command's boolean, as ProseMirror |
| Plite after this plan | The authored recorder refuses at commit, and the update rolls back | The update's own answer, or `undefined` when it was refused; `tx` methods report the draft |

ProseMirror's paste and command booleans mean "handled", which is how Plate's shortcut dispatcher reads them too. Plite's own method contract is stricter: "returns `false` without mutating", so its answers must mean "landed". Returning `undefined` for a refusal satisfies both readings, because a handler that only treats `false` as unhandled keeps consuming a refused key.

## Layer and owner

| Change | Layer (Plite or Plate) | Package | Why |
| --- | --- | --- | --- |
| The outermost update returns its callback's answer, or `undefined` when refused | Plite | `plitejs` (core entrypoint) | `runEditorTransaction` alone sees both the draft answer and the commit outcome |
| Direct update methods, the command facade and plugin portals return the update's answer | Plite | `plitejs` (core entrypoint) | They open the update, so they forward its answer instead of a captured draft value |
| Command dispatch and DOM data-transfer insertion return the update's answer outside an open update | Plite | `plitejs` (core and dom entrypoints) | Same owner; inside an update they keep reporting the draft |
| Transfer reads its own update's answer | Plite | `plitejs` (core entrypoint) | Replaces a refusal subscription that also caught other updates' refusals |
| Plate's plugin context update facade and update overloads return the update's answer | Plate | `platejs` (core entrypoint) | Plate's facade opens its own update through `editor.update` |

## Hard cuts and app migration

Nothing is removed. These type changes can break app code that compiles today:

- The return type of each direct core method, each `editor.update.<plugin>` method and `editor.update.command` gains `| undefined`. So do `editor.api.dom.clipboard.insertData`, `insertFragmentData` and `insertTextData`, the matching `DOMEditor.clipboard` types, and the dispatcher `useCommand` returns from both `plitejs/react` and `platejs/react`. Code that assigns one of these to a `boolean` or a non-optional result, or returns it from a function typed that way, fails typecheck. It picks a reading: `=== true` when it needs "landed", `!== false` when it needs "handled". Code such as `if (!dispatch()) fallback()` now runs its fallback after a refusal; that is the app's call to make.
- `editor.update(fn)` returns `R | undefined` instead of `void`. A callback that returns nothing still returns `void | undefined`, so existing calls compile unchanged. The callback's answer should be plain data; a draft-scoped value outlives its update only as far as it already could through a captured variable.
- A descriptor portal, `editor.plugin(P).update.<method>`, and Plate's plugin context `update.<method>` keep each method's declared type as written, because a mapped type that adds `| undefined` loses a generic method's inference, which `generic-update-policy-contract.ts` pins. At runtime they answer `undefined` for a refusal like every other direct call; their types do not say so.

The plitejs, platejs and www typechecks find every first-party caller that the widened types break. The census adds the callers that read a portal or context result: Media's `insertUrl` forwards a boolean and now answers `false` for a refusal. AI chat's `decideCurrentChange` reads an authored result whose decision update is never refused at commit, so it keeps its code. The registry link editor already treats a falsy upsert as nothing landed and keeps its popover open, which is right for a refusal.

## Native behavior and proof

| Behavior | What changes | Proof surface |
| --- | --- | --- |
| DOM paste over a range Suggesting refuses | The paste call answers `undefined`, nothing lands, one refusal is published, and no plain-text fallback runs | `packages/plitejs/test` under Bun, model level, through `editor.api.dom.clipboard.insertData` |
| Paste, drop and beforeinput events | Unchanged: they prevent the browser default before inserting and ignore the answer | unproven in a browser; the event handlers' code does not change |
| A Plate shortcut whose update is refused | Unchanged: the key stays consumed | `packages/platejs` test through `dispatchPlateShortcut` |
| Undo and redo | Unchanged: Suggesting never refuses a history replay | source read of `authored.ts`, which returns early for `historic` updates |

## Decision ledger

| Surface | Current | Target | Owner | Reason | Adoption | Proof | Risk | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Update outcome | `runEditorTransaction` returns the commit or `null`, the same `null` for a refusal and for no change; every caller drops it; a refusal error after publication is published as a refusal | Returns the callback's answer, or `undefined` when refused before publication; a refusal error after publication is not a refusal and takes the path any other error after publication takes today | `public-state.ts` `runEditorTransaction`, `updateEditor` | Only the outermost update sees both the draft answer and the commit, and publication is the outcome boundary (`docs/vision/plite.md`) | `editor.update`, the runtime and view runtime forward it | callback and re-entry tests | A nested runtime write now returns its answer instead of `null`; no caller reads it | rearchitect |
| Direct update calls | Capture the draft answer and return it past the update | Return the update's answer; the direct core groups, `editor.update.<plugin>` groups and a direct command dispatch type gain `\| undefined`, while `tx`, the spec builder and `tx.command` keep theirs | `editor-lifecycle-api.ts`, `plugin.ts`, `interfaces/editor.ts` | One owner instead of eight copied closures | plitejs, platejs and www typechecks | refused slice, fragment, command and plugin tests; type cases | App code typed `boolean` breaks | rearchitect |
| Portal and context types | A descriptor portal and Plate's context `update` keep each method's declared type | Unchanged; their runtime answers `undefined` for a refusal | `interfaces/editor.ts` `EditorDirectUpdate`, Plate `PluginDirectUpdate` | A mapped `\| undefined` loses generic inference, which `generic-update-policy-contract.ts` pins | none | existing generic contract | A portal method typed with a non-optional return can answer `undefined` | gate |
| Command dispatch and DOM insertion | `runCommandChain` and `applyCommandEvaluation` capture or return a constant `true`; `insertDataTransfer` returns `true` | Return the update's answer outside an open update; keep the draft answer inside one | `command-registry.ts`, `data-transfer-format.ts`, `mutation-controller.ts` | Same class | DOM clipboard API types | refused DOM paste test | none | rearchitect |
| DOM format fallback | Decided on the evaluated spec, before commit | Unchanged: a refused format ends the paste | `data-transfer-format.ts` | A refusal is the mode's answer to this write, not a format that cannot fit; trying again would publish a refusal beside a paste that landed | none | refused DOM paste test asserts no plain text | A user who wanted the plain text pastes it themselves | keep |
| Transfer refusal | Subscribes to every refusal while it runs | Reads its own update's answer | `transfer.ts` | The subscription also flips for a listener's refused update | none | existing policy test plus a re-entry test | none | cut |
| Plate plugin context facade | Captures the draft answer | Returns the update's answer; Plate's update overloads return `R \| undefined` | `createPluginContext.internal.ts`, `pluginRuntimeTypes.ts` | Plate opens its own update | platejs typecheck | refused context method test | none | rearchitect |
| Generated shortcuts | The dispatcher treats only `false` as unhandled | Unchanged | `dispatchPlateShortcut.internal.ts` | `undefined` is not `false` | none | refused shortcut test | none | keep |
| Table Tab | `tabTable` starts `handled` at `false` inside its update; a refusal thrown before the assignment, as a command frame's recorder can, releases the key to the browser | Answers its update's answer: its callback's `handled`, or `undefined` when the update is refused, which the dispatcher treats as handled | `TablePlugin.tsx` `tabTable` | A refused key stays consumed | none | refused Tab test | none | rearchitect |
| Clipboard insert outcome | `editor.api.dom.clipboard.insert*` returns a boolean, though `docs/vision/plite.md` asks a complete model action's `api` service for an explicit outcome, as transfer gives | Stays a boolean, now `\| undefined` for a refusal | `dom-editor.ts` | Reshaping the clipboard API is a separate public decision this task does not need | none | none | Paste and drop report a refusal in two shapes | defer |
| History replay | Never refused: the recorder returns early for `historic` updates | Unchanged | `history-plugin.ts` | Unreachable today | none | source read | A future refuser of replays would hit the missing-receipt error | defer |

## Defaults

| Decision | Pick | Alternative | Word | Impact |
| --- | --- | --- | --- | --- |
| A rich paste that suggesting refuses | Nothing lands and the refusal shows; no plain-text retry (look) | Retry with the next format, such as plain text | fallback | big |
| What a refused call answers | Nothing, so a key it handled stays handled | No, for yes-or-no calls, which lets the browser act on a refused key | false | big |
| Whether an update reports its outcome | Every update hands back its callback's answer (look) | Updates keep returning nothing, and only first-party code gets an internal way to ask | void update | big |
| The shape of that answer | The callback's own answer, or nothing when refused | A status object that wraps the answer | envelope | small |
| Types of plugin portal calls | Keep each method's own type, so generic methods keep their inference; a refusal still answers nothing at runtime (look) | Add "or nothing" to every portal method's type and lose generic inference | widen portals | small |
| A refused Tab in a table | Stays handled, so the browser does nothing | Left to the browser, as today | release tab | detail |
| Undo and redo after a refusal | Unchanged, since suggesting never refuses them | Report a refused replay as blocked | history | detail |
| A refusal listener that throws | Unchanged: the throw reaches the caller | Catch it and report it as a lifecycle error | isolate | detail |
| AI chat's suggestion publish | Left to its own task, which already covers a refused insert | Fix it here | fix ai | small |
| A refused AI chat decision | Unchanged, because Suggesting never refuses a decision at commit | Map a refused decision to an invalid decision anyway | ai decide | detail |
| A Plate `on` handler that returns a refused call's answer | Unchanged here. The handler pipe counts nothing as unhandled, so the event goes on to the next handler, and its own task decides | Count only no as unhandled, like keyboard shortcuts | pipe | small |
| The type of `tx.dom.insertData` | Yes, no or nothing, like the clipboard service, until its own task narrows it | Yes or no, which broke Plate's editor types here | tx dom | detail |
| Suggesting deleting a block that owns a content area | A separate suggested task: record it as a suggested deletion instead of refusing | Change the recorder here | fix recorder | small |
| Where the verdict lives | This transactions review, an iteration on the transactions page | A separate one-off page | one-off | detail |
| The transactions page link | The subject's current page at artifact D17heqLZLTZZRkwSZC5aky, which another session published after the old page at artifact 1gmj9dkmNiLTMRn1FPiHkR stopped opening | Keep the separate page at artifact MDwVtiWrR25gN2hLLqYqrq that this run published before it saw that link | own page | detail |
| Delivery | A patch on your working tree for you to commit | A commit on a branch | commit | detail |

## Evidence

Model: claude-opus-5-5 (lead and cross-judge); runners claude-opus-5-5 @high, codex gpt-6-astra @xhigh and codex gpt-6.1-sol @xhigh; census by codex gpt-6.1-sol @medium.

Prior work:

- This plan retains `2026-10-15-transactions-placement-types`, the transactions scope's head review, because it gave `blocks.insert` its `undefined` for nothing landed, which this plan extends to a refused update.
- This plan retains `2026-10-14-list-paste-type-adoption`, the clipboard scope's head review, because it judges list paste, which this plan does not change.
- This plan retains [whole-block roots](2026-10-15-whole-block-roots.md), because its Defaults deferred this paste to its own task.

### Requirements

- The owner's task: decide whether the paste result waits for the authored refusal, or the paste refuses a write Suggesting cannot represent.
- A paste the editor refused must not report that it landed (finding S3), and the DOM data-transfer behavior after a refusal is settled (finding N1).
- `docs/vision/plite.md`: a method's "nothing landed" answer is `false` or `undefined` with nothing changed, and callers act on what landed.
- `packages/plitejs/src/core/refusal.ts`: a refusal rolls the update back and is reported by the outermost update, not thrown.
- `VISION.md`: Plite stays unopinionated, so core learns no Suggesting rule.

### Lanes

- Wait for the refusal at the update (picked). The outermost update returns its answer; every caller that opens an update forwards it.
- Refuse in the paste's draft what Suggesting cannot represent (the task's alternative). It needs an authored check inside core paste, covers only root deletion, misses veto and generated-value refusals, and leaves every other call reporting past a refusal. Rejected.
- Let the authored plugin own an evaluation-time check that the format loop consults, so a refused format answers `false` and the next format runs. Core would gain a hook for one plugin's admission, the recorder judges the composed change after corrections that an evaluated spec does not have, and the hook still leaves every non-paste call reporting past a refusal. Rejected; it would restore N1's plain-text fallback only by duplicating the recorder's judgment.
- An owner-scoped outcome record or refusal subscription around each call. Any refusal the editor publishes while it listens trips it, and a correctly keyed record duplicates what the call stack already holds. Rejected.
- A status object from every update. Distinguishes refused from declined for any return type, but no current job needs more than the callback's own answer, and a caller that needs to tell them apart returns a value from its callback. Rejected for now.
- Retry the next DOM format after a refusal. Needs trial commits that publish a refusal beside a paste that landed, or a dry-run admission core does not have. Rejected; the authored recorder recording a root deletion as a suggestion is the better fix and goes to its own task.
- Control: change nothing and document it. Keeps `true` for a rolled-back paste, phantom footnote targets and AI change ids. Rejected.
- Proof limits: all runner and judge work was source reading; the lead's probes ran on `next` 0a5cb4f411 and fa0ac06f55 with Bun at model level. No browser ran.

### Reproduction

Probe `probes/probe5.ts` in the run directory, at `next` 0a5cb4f411: in a Suggesting editor over `[portal(b1), paragraph('aa')]` with an exclusive `b1`, a closed paragraph over the owner and a carried portal slice over the range holding it both return `true` from `editor.update.slice.replace`, publish `unrepresentable` and leave the document unchanged. Probe `probes/remove-owner.ts`: `editor.update.fragment.replace` returns `true` and is refused the same way, and `editor.update.nodes.remove` of the owner is refused.

### Three realistic failures

- A handler negates a direct call to decide "handled", so a refused key reads as unhandled and the browser's default runs. The one first-party negation, the registry link editor's upsert, means "landed" and keeps its popover open, which is right.
- A first-party caller relied on `editor.update` or a nested runtime write returning nothing or `null`. The census found no reader of either; the typechecks confirm.
- A plugin method's direct type loses its generic parameters when its return widens. Direct types already rebuild non-generic methods from their parameters and return, and the one generic-marked method returns `void`; a type test pins a boolean and a keyed result.

### Blast radius

The census, in the local run file `artifacts/2026-10-16-transactions-refused-result/census-answer.md`, lists every site that returns a value computed inside an update it opened, across plitejs and platejs. Each is handled in the ledger above or kept with a reason: the internal write helpers return only `void` callbacks' results, history replay is never refused, and the table key handlers already capture "handled" inside their update.

### Dependents

`proof` imports this scope's types through `packages/test/test/types/scenario-types.ts` and is unaffected: its typecheck shows the same 22 errors here and at base, in `artifacts/2026-10-16-transactions-refused-result/proofs/test-pkg-typecheck-a1.log` and `artifacts/2026-10-16-transactions-refused-result/gate/base-test-pkg-typecheck-a1.log`. `ui` imports it through `apps/www/src/app/(app)/examples/plite/[example]/page.tsx` and is unaffected: the www `tsc` configs show the same errors as base, in `artifacts/2026-10-16-transactions-refused-result/gate/`.

## Main changes

- `runEditorTransaction` in `packages/plitejs/src/core/public-state.ts` keeps the author callback's answer and returns it when the update commits or changes nothing, and returns `undefined` when an `EditorRefusalError` rolls the update back before publication. A refusal error thrown after publication publishes no refusal and takes the path any other error after publication takes. `updateEditor`, the editor runtime and the view runtime forward that answer.
- `tabTable` in `packages/platejs/src/react/features/table/TablePlugin.tsx` returns its update's answer instead of a flag set inside the draft. A refused Tab answers `undefined`, which the shortcut dispatcher already treats as handled.
- `packages/plitejs/src/core/editor-lifecycle-api.ts` and `packages/plitejs/src/core/plugin.ts` return the update's answer from every direct method, the command facade and both plugin portals, and delete their captured results.
- `runCommandChain` and `applyCommandEvaluation` in `packages/plitejs/src/core/command-registry.ts`, `insertDataTransfer` in `packages/plitejs/src/dom/plugin/data-transfer-format.ts` and the `insert-data` command in `packages/plitejs/src/react/editable/mutation-controller.ts` return the update's answer when they open the update, and the draft answer inside an open one.
- `runTransfer` in `packages/plitejs/src/core/transfer.ts` reads its update's answer and drops its refusal subscription.
- Plate's `createUpdateFacade` in `packages/platejs/src/lib/plugin/createPluginContext.internal.ts` returns the update's answer, and Plate's update overloads in `packages/platejs/src/lib/editor/pluginRuntimeTypes.ts` return `R | undefined`.
- Media's `insertUrl` in `packages/platejs/src/features/media/lib/BaseMediaPlugin.ts` answers `false` for a refused insert. AI chat's `decideCurrentChange` is unchanged, because a `decide` update never reaches a commit refusal.
- The projected view-selection paste in `packages/plitejs/src/react/editable/mutation-controller.ts` answers its update's answer and keeps the view selection when the paste is refused, instead of clearing it and answering `true`.
- `EditorDirectMethods` in `packages/plitejs/src/interfaces/editor.ts` recurses into nested method groups, so a nested direct plugin method is typed `| undefined` too.

## Steps

Phases 1 and 2 keep or revert together. Keep them when every proof below passes and the plitejs typecheck, the platejs source and spec typechecks and the www typecheck show no error that the same commands do not show at `next` fa0ac06f55 in a detached worktree; otherwise revert both.

Phase 1, Plite.

- [x] Return the update's answer from `runEditorTransaction`, `updateEditor`, the editor runtime and the view runtime, and type the callback form `R | undefined`. Proof: a new test in `packages/plitejs/test` shows `editor.update(() => 7)` answering `7` with no change, an Editing editor's `editor.update((tx) => tx.slice.replace(slice))` answering `true`, a Suggesting editor's same callback over the probe5 document answering `undefined` with the document unchanged, and a commit listener's refused update in a Suggesting view leaving the first call's answer intact. The first two fail at base under `proof-worktree.mjs --expect-fail`, because the callback form answers nothing there; the refused case already answers `undefined` at base, so a mutant that returns the draft answer on refusal must fail it under `mutate.mjs`.
  Done: `packages/plitejs/test/refused-update-answer.test.ts`, failing at base in `artifacts/2026-10-16-transactions-refused-result/proofs/p1-base-expect-fail-a1.log`, and the mutant caught in `artifacts/2026-10-16-transactions-refused-result/mutate/refused-update-answers-draft-a1.log`. Deviation: the callback cases write through `tx.command(editorCommands.replaceSlice, …)` instead of `tx.slice.replace`, because the raw transaction method declines a block selection, which the direct method's command lowering handles.
- [x] Return the update's answer from direct core methods, the command facade, the update plugin path and the plugin portal; widen the direct core groups and `editor.update.<plugin>` groups, and give `editor.update.command` its own dispatch type. Proof: the same test file shows refused `editor.update.slice.replace`, `editor.update.fragment.replace`, `editor.update.command(editorCommands.replaceSlice, …)` and a refused plugin method through both `editor.update.<plugin>` and `editor.plugin(P).update` answering `undefined`, each failing at base; type cases in the plitejs type contracts show the direct `slice.replace` and `command` typed `boolean | undefined`, `tx.slice.replace`, `tx.command` and the spec builder unchanged, and `generic-update-policy-contract.ts` still passing.
  Done: the same test file and `artifacts/2026-10-16-transactions-refused-result/proofs/p1-base-expect-fail-a1.log`; type cases in `packages/plitejs/test/generic-command-contract.ts` and `packages/plitejs/test/public-api-contract.tsx`, checked by `pnpm --filter plitejs typecheck`.
- [x] Return the update's answer from `runCommandChain`, `applyCommandEvaluation`, `insertDataTransfer` and the `insert-data` command when they open the update. Proof: in a Suggesting editor over the probe5 document, `editor.api.dom.clipboard.insertData` with a `text/html` portal and a `text/plain` fallback over the owner range answers `undefined`, leaves the document unchanged, lands no plain text and publishes one `unrepresentable` refusal; `insertTextData` with plain text over the same range answers `true` and lands it as a suggestion; and `insertTextData` over a range whose plain-text replacement is refused answers `undefined`. Each refused case fails at base.
  Done: the same test file and `artifacts/2026-10-16-transactions-refused-result/proofs/p1-base-expect-fail-a1.log`. The rich format is a registered `application/x-carried` format, and the refused plain-text case is a plain-text paste over the owner as a block selection.
- [x] Read `runTransfer`'s own update answer from a body every exit leaves. Proof: the existing transfer policy-refusal test still passes, and a new case where a commit listener opens a refused update in a Suggesting view during a successful `transfer.move` answers `moved`, failing at base.
  Done: `packages/plitejs/test/transfer-contract.test.ts` passes, 136 tests. Deviation: the new case cannot be built. A commit listener's update during a move hits the transfer's own guard and throws `lossy` before Suggesting can refuse it, so the old subscription could not misfire that way. The change stays as a simplification, and the guard reaching listener updates is open work.

Phase 2, Plate.

- [x] Return the update's answer from `createUpdateFacade` and type Plate's update overloads `R | undefined`. Proof: a platejs test shows a refused plugin context method answering `undefined`, failing at base, and a refused generated shortcut through `dispatchPlateShortcut` still handled with its event's default prevented, which already passes at base and must keep passing.
  Done: `packages/platejs/src/lib/plugin/refusedUpdateAnswer.spec.ts`; the context case fails at base in `artifacts/2026-10-16-transactions-refused-result/proofs/p2-base-expect-fail-a1.log`, and the shortcut case passes there and here.
- [x] Make `tabTable` answer `true` for a refused update. Proof: a platejs test presses Tab in the last cell of a table in a Suggesting editor whose row insert is refused, and asserts the handler answers `true` with the document unchanged; a mutant that returns the callback's `handled` alone must fail it.
  Done: the Tab case in `packages/platejs/src/react/features/table/TablePlugin.onKeyDown.spec.tsx`. Deviation: `tabTable` returns its update's answer with no `true` fallback. The planned mutant survived in `artifacts/2026-10-16-transactions-refused-result/mutate/tab-refused-row-unhandled-a1.log` because the shortcut dispatcher already counts `undefined` as handled. A mutant that answers `false` for a refusal is caught in `artifacts/2026-10-16-transactions-refused-result/mutate/tab-refused-row-declined-a1.log`.
- [x] Adopt the widened types and the portal answers in Plate's own callers, Media's `insertUrl` and AI chat's `decideCurrentChange` among them. Proof: the phase gate's typechecks.
  Done: `pnpm --filter plitejs typecheck` shows only the two errors base shows, in `artifacts/2026-10-16-transactions-refused-result/proofs/plitejs-typecheck-a2.log`; the platejs contracts pass in `artifacts/2026-10-16-transactions-refused-result/proofs/platejs-contracts-a1.log`; the platejs spec typecheck has 952 errors here and at base, in `artifacts/2026-10-16-transactions-refused-result/gate/head-platejs-spec-a1.log` and `artifacts/2026-10-16-transactions-refused-result/gate/base-platejs-spec.log`, compared by `artifacts/2026-10-16-transactions-refused-result/compare-tsc.py`; the www `tsc` configs show the same 8 and 7 errors as base in `artifacts/2026-10-16-transactions-refused-result/gate/`. The www `typecheck` script stops at `editor:check` here and at base, because the CLI is not built in a worktree. Media answers `false` for a refused insert. Deviation: AI chat's `decideCurrentChange` keeps its base code. The diff panel showed that a `decide` update passes through the authored recorder, the only thrower of `EditorRefusalError`, so the planned mapping could never run. After the panel's fixes, the same checks pass again in `artifacts/2026-10-16-transactions-refused-result/proofs/plitejs-typecheck-a4.log`, `artifacts/2026-10-16-transactions-refused-result/proofs/platejs-contracts-a4.log` and `artifacts/2026-10-16-transactions-refused-result/gate/head-platejs-spec-a2.log`.

Phase 3, law and docs.

- [x] Add the outcome law to `docs/vision/plite.md` beside the publication boundary, and make it agree with the `api` service law: an update call answers `undefined` for a refused update, and an `api` service that opens an update maps that refusal into its own outcome. Update each `content/docs` page that teaches `editor.update`'s return, a direct method's answer, `useCommand` or the clipboard inserts through `plate-docs`, and run `best-api repair`. Proof: `pnpm check knowledge` and the `plate-docs` checks on the edited pages.
  Done: `artifacts/2026-10-16-transactions-refused-result/proofs/www-build-source-a1.log`, `artifacts/2026-10-16-transactions-refused-result/proofs/www-build-registry-a1.log` and `artifacts/2026-10-16-transactions-refused-result/proofs/www-build-registry-check-a1.log` pass. `pnpm check knowledge` fails in `artifacts/2026-10-16-transactions-refused-result/proofs/check-knowledge-a1.log` on 36 findings, none in a line this run wrote. The teaching sweep found the Chinese twins of `plugin-methods` and `link`, both updated; `editor-api.cn.mdx` teaches no return value.
- [x] Add one changeset each for plitejs and platejs per `changeset`. Proof: `pnpm changeset status` lists both packages.
  Done: `.changeset/plite-refused-update-answer.md` and `.changeset/plate-refused-update-answer.md`; `pnpm changeset status` lists plitejs and platejs in `artifacts/2026-10-16-transactions-refused-result/proofs/changeset-status-a1.log`.

## Close

Reversals and deviations first.

- Phase 2's Tab step planned a `true` fallback for a refused update. `tabTable` returns its update's answer with no fallback, because the shortcut dispatcher already treats `undefined` as handled; the fallback's mutant survived, and a mutant that answers `false` is caught.
- Phase 2's adoption step planned to map a refused AI chat decision to `invalid`. The diff panel showed that mapping can never run, so `AIChatPlugin.ts` keeps its base code, and the Plate changeset drops its AI chat bullet. The Plite changeset also drops a bullet about the DOM format fallback, which base already did.
- Phase 1's first step writes its callback cases through `tx.command(editorCommands.replaceSlice, …)`, because the raw `tx.slice.replace` declines a block selection.
- Phase 1's transfer step dropped its commit-listener case. That update throws `lossy` from the move's own guard before Suggesting can refuse it; suggested task `t_b6f088b9` owns the guard.
- The diff panel's fix that typed `tx.dom.insertData` as `boolean` broke two Plate editor assignability contracts, so it was reverted after two attempts to find the unprojected type; suggested task `t_f9fb1a96` owns it.

What landed. An update returns its callback's answer, or `undefined` when the editor refuses it before publication. Every Plite and Plate call that opens its own update forwards that answer: direct core and plugin methods, `editor.update.command`, plugin portals, command dispatch, the DOM clipboard inserts, the React `insert-data` and projected-selection paste commands, and `runTransfer`. Their direct types say `| undefined`, nested plugin groups included, while `tx` methods keep their draft answers. Media's `insertUrl` answers `false` for a refused insert. `docs/vision/plite.md` states the outcome law, 17 docs pages, Chinese twins included, teach it, and two changesets describe it.

Proof and its limits.

- `packages/plitejs/test/refused-update-answer.test.ts` runs under Bun at model level over a Suggesting editor with an exclusive card root. Its callback, direct method, command, plugin path, portal and clipboard cases answer as planned, and 10 of its cases fail at base in `artifacts/2026-10-16-transactions-refused-result/proofs/p1-base-expect-fail-a1.log`. The draft-answer mutant is caught.
- In `packages/plitejs/test/react/projected-command-contract.test.ts`, under Vitest, a projected-selection paste that Suggesting refuses answers `undefined` and keeps the view selection. Its mutant is caught.
- `packages/platejs/src/lib/plugin/refusedUpdateAnswer.spec.ts` and the Tab case of `TablePlugin.onKeyDown.spec.tsx` run under Bun with Plate's `AuthoredPlugin`. A refused context method answers `undefined`, failing at base, and a refused generated shortcut and a refused Tab stay handled.
- Type contracts pin each direct answer as `| undefined` and the `tx` answers unchanged, except `tx.dom.insertData`, which widens with the clipboard service. The flat-projection mutant is caught. The plitejs typecheck shows only its 2 base errors, the platejs contracts pass, and the platejs spec typecheck shows the same 952 errors as base.
- No browser ran, so no real paste or keypress was driven. The full plitejs and platejs suites ran before the panel's fixes, and only the touched files ran after them. In those full runs, suites that fail at base failed the same way: AI suggestions, V2 pasting, the yjs exclusive property contract, code-block and list pastes, and some load timeouts. `pnpm check knowledge` fails on 36 findings, none in a line this run wrote. No case drives a refused Media insert.

Review inputs: the verdict and the build read `VISION.md`, `docs/vision/common.md`, `docs/vision/plite.md`, `packages/plitejs/src/core/refusal.ts`, `packages/plitejs/src/core/public-state.ts`, `packages/plitejs/src/core/editor-lifecycle-api.ts`, `packages/plitejs/src/core/plugin.ts`, `packages/plitejs/src/core/command-registry.ts`, `packages/plitejs/src/core/transfer.ts`, `packages/plitejs/src/create-editor.ts`, `packages/plitejs/src/editor-runtime-view.ts`, `packages/plitejs/src/interfaces/editor.ts`, `packages/plitejs/src/authored/authored.ts`, `packages/plitejs/src/authored/refusal.ts`, `packages/plitejs/src/authored/ledger/ledger.ts`, `packages/plitejs/src/dom/plugin/data-transfer-format.ts`, `packages/plitejs/src/dom/plugin/dom-clipboard-runtime.ts`, `packages/plitejs/src/react/editable/mutation-controller.ts`, `packages/plitejs/src/history/history-plugin.ts`, `packages/plitejs/test/authored-refusal.test.ts`, `packages/platejs/src/lib/plugin/createPluginContext.internal.ts`, `packages/platejs/src/lib/editor/pluginRuntimeTypes.ts`, `packages/platejs/src/internal/plugin/resolvePlugins.ts`, `packages/platejs/src/react/utils/dispatchPlateShortcut.internal.ts`, `packages/platejs/src/react/features/table/TablePlugin.tsx`, `packages/platejs/src/react/features/footnote/FootnotePlugin.tsx`, `packages/platejs/src/features/media/lib/BaseMediaPlugin.ts`, `packages/platejs/src/ai/react/AIChatPlugin.ts` and `apps/www/src/registry/components/editor/link.tsx`.

Of 9 steps, 9 are done, 4 of them with deviations, and none is partial, skipped, blocked or open. The diff panel ran 1 round with no critical finding: 2 warnings and 6 nits applied, 2 warnings deferred to suggested tasks, 2 nits dismissed. The decision-trail review was skipped, because the run ran in one session and no panel dismissed, narrowed or left open a critical finding.

## Open work

- Suggesting refuses deleting a block that owns an exclusive content root, so a paste or removal over that block cannot be suggested at all, and a rich paste there no longer falls back to plain text. owner: the owner, through suggested task `t_a7c71be6`. stop: that task lands or is dropped.
- A move keeps its landing guard on until after commit observers run, so an update a commit listener opens during a move throws `lossy` and its write is lost. owner: the owner, through suggested task `t_b6f088b9`. stop: that task lands or is dropped.
- AI chat's suggestion publish stores the change id it captured before a refused commit. owner: the owner, through suggested task `task_bb870590`. stop: that task lands or is dropped.
- The registry link editor's text-only edit calls a `void` upsert, then hides its popover even when a table's Suggesting veto refuses the edit. owner: zbeyens. stop: the next change to the link editor's submit.
- A descriptor portal and Plate's context `update` types omit the `undefined` a refused call answers, and `EditorGenericMethod` does not require a return that admits it. owner: zbeyens. stop: the next change to `EditorDirectUpdate` or `EditorGenericMethod`.
- `editor.api.dom.clipboard.insert*` returns a boolean rather than the explicit outcome `docs/vision/plite.md` asks of an `api` service. owner: zbeyens. stop: an API decision on the clipboard service's outcome.
- An error that reaches `runEditorTransaction`'s final catch after publication rethrows, though `docs/vision/plite.md` sends a post-publication failure to `lifecycleErrorSink`. owner: zbeyens. stop: the next change to the transaction's notification error path.
- Plate's `on` handler pipe in `packages/platejs/src/react/utils/pipeHandler.internal.ts` counts `undefined` as unhandled, so a handler that returns a refused call's answer passes its event on, and a refused paste can reach Plite's own paste. owner: the owner, through suggested task `t_7d051d7b`. stop: that task lands or is dropped.
- `tx.dom.insertData` is typed `boolean | undefined` though a draft call never answers `undefined`. Narrowing it needs the broad editor type that reads the DOM plugin's update unprojected. owner: the owner, through suggested task `t_f9fb1a96`. stop: that task lands or is dropped.
