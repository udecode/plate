Every editor-level undo I checked is synchronous. The only async undo API I found is VS Code's workbench service, and even that returns `Promise<void> | void`, not an always-Promise.

Local clones are under `/Users/zbeyens/git`. Liveblocks was cloned shallow into scratch.

| Editor | Undo signature | Sync/async | Non-document side effects | Citation |
|---|---|---|---|---|
| ProseMirror | `undo: Command = (state, dispatch?, view?) => boolean` | sync | Records document steps and selection. A transaction with `addToHistory: false` is skipped; plugins can check `isHistoryTransaction`. | `prosemirror/history/src/history.ts:391-447`, `state/src/transaction.ts:18` |
| Lexical | `dispatchCommand(UNDO_COMMAND): boolean` | sync | Restores a whole `EditorState` snapshot tagged `HISTORIC_TAG`. The playground's `CommentStore` is outside history, so undo only removes the mark. | `lexical-history/src/index.ts:415-449,572`; `LexicalEditor.ts:604,1584`; `CommentPlugin/index.tsx:752-805` |
| Tiptap | `commands.undo(): boolean`; `chain().run(): boolean` | sync | Wraps prosemirror-history. With collaboration, its docs say to switch to Yjs undo. | `extensions/src/undo-redo/undo-redo.ts:56-68`; `core/src/types.ts:626,819-823` |
| Slate | `undo: () => void` | sync | Records operations only; `withoutSaving` excludes them. | `slate-history/src/history-editor.ts:17-21` |
| CodeMirror 6 | `undo: StateCommand => boolean` | sync | The `invertedEffects` facet lets non-document state be undone, still as pure state. | `codemirror-commands/src/history.ts:16-21,117-134` |
| Yjs | `undo(): StackItem \| null` | sync | `trackedOrigins` decides which changes are captured. `stack-item-added`/`popped` events carry a `meta` Map for extra state. The `undoing` flag is true only during the call. | `yjs/src/utils/UndoManager.js:137,151-155,342-366` |
| VS Code | service `undo(resource): Promise<void> \| void`; element `undo(): Promise<void> \| void`; `prepareUndoRedo?()`; `confirmBeforeUndo?` | sync or async per element | Locks per stack (details below) | `vscode/src/vs/platform/undoRedo/common/undoRedo.ts:17-72,186-189` |
| Monaco | `undo(): void \| Promise<void>`; `pushStackElement(): void` | union; text edits run sync | Uses the same VS Code service | `vscode/src/vs/monaco.d.ts:2347,2385,8464-8469` |
| Liveblocks | `room.history.undo: () => void` | sync | Storage and presence (`addToHistory`). Comments are not in history: `useCreateThread` returns the thread immediately, the server result replaces it, and `onMutationFailure` rolls it back. | `liveblocks-core/src/room.ts:255-281`; `liveblocks-react/src/room.tsx:248-275,1974-2058` |
| Quill | `history.undo(): void` | sync | `userOnly` option skips API changes | `quill/src/modules/history.ts:85-150` |
| BlockNote | `editor.undo(): boolean` | sync | Thread creation waits for the server first: it awaits `threadStore.createThread`, then sets the mark. Undo removes only the mark; marks without a live thread get an `orphan` flag. | `BlockNoteEditor.ts:1108`; `comments/extension.ts:120-160,366-382` |
| tldraw, Loro | `undo(): this`; `undo() -> LoroResult<bool>` | sync | Loro attaches extra data per entry through its `on_push`/`on_pop` callbacks | `tldraw Editor.ts:1551`; `loro undo.rs:194-199,764` |

**VS Code in detail** (`undoRedoService.ts`):
- **Busy press:** if a stack is locked, `_resourceUndo` (1012-1028) shows the warning "Could not undo '{0}' because there is already an undo or redo operation running" and returns. The press is dropped, not queued.
- **Pointer then lock:** `moveBackward(element)` runs before the element's undo. `_safeInvokeWithLocks` (740-772) then holds the lock until the promise settles.
- **Failure:** `_onError` (710) reports the error, removes the undo and redo stacks of every affected resource, and shows a notification. The returned promise resolves; it does not reject.
- **Workspace elements** (`_confirmAndExecuteWorkspaceUndo`, 940-1009): asks "undo across all files / this file / cancel", awaits `prepareUndoRedo`, and checks again after each await whether the stack changed, is locked, or was undone "in the meantime".
- **Confirmation:** an element from a different source, or with `confirmBeforeUndo`, prompts first (1099-1127).
- **Edits during a pending undo:** `pushElement` (505) has no lock check, so new edits still land while an undo is pending.
- **How undo is called:** `CommandImplementation = (accessor, args) => boolean | Promise<void>` (`editorExtensions.ts:194`). The explorer calls `undoRedoService.undo(...)` without awaiting and returns `true` (`files.contribution.ts:653-662`). The keybinding layer calls `.then(undefined, err => notificationService.warn(err))` (`abstractKeybindingService.ts:394`).
- **Which elements are actually async:** file operations (`bulkFileEdits.ts:306`) and notebook cell edits. Text edits are synchronous.

**Product comment undo**
- **Google Docs:** unverified. The "Use comments" help page (support.google.com/docs/answer/65129) doesn't mention undo.
- **Notion:** unverified. Its comments help page doesn't mention undo.
- **Figma:** unverified. The only source is a community forum thread (closed 2022-12-13, no staff answer) where users say Cmd+Z undoes design changes, not comment moves.
- **Linear:** unverified. The 2020-10-07 changelog says undo covers "almost every operation that changes issues, notifications, cycles or projects" and doesn't name comments.
- **Confluence:** unverified.
- **Optimistic vs waiting for the server:** no primary source for any of these products. In the libraries, Liveblocks is optimistic with rollback, and BlockNote's undo never calls the server.

**Guidance**
- Zalgo ("Designing APIs for Asynchrony", blog.izs.me/2013/08/designing-apis-for-asynchrony): a callback must always run synchronously or always run later.
- typescript-eslint `no-floating-promises` flags any promise that isn't awaited, returned, `void`ed or caught (`no-floating-promises.mdx:11-21`). `allowForKnownSafeCalls` and `allowForKnownSafePromises` exist for library APIs "whose rejections are safely handled by the library" (177-240).

**Conclusions**

Verified:
1. No surveyed editor undo returns a Promise. All eleven return `boolean`, `void`, `this` or a stack item.
2. VS Code is the only async precedent. It chose `Promise | void`, not always-Promise, and its async elements are file system operations, not editor text.
3. VS Code's rules for a pending undo:
   - The stack pointer moves synchronously.
   - Each stack is locked until the undo settles.
   - A repeat press is dropped with a warning.
   - A failure clears the affected stacks.
   - Callers fire and forget, and errors go to notifications, never rejections.
4. Comment data stays out of document history in BlockNote, the Lexical playground and Liveblocks. Undo removes only the anchor mark, and BlockNote reconciles marks left without a thread.
5. Liveblocks's model for server-backed comments returns synchronously, applies the change optimistically, and rolls back on server failure.
6. An always-Promise `undo()` gets flagged at every unawaited call site, keybindings included, unless the library guarantees it never rejects and users opt it in through `allowForKnownSafeCalls`.

Inference:
7. Returning `Promise<HistoryResult>` from every undo makes all callers pay for one feature. A synchronous `undo(): HistoryResult` that can report a `pending` status, plus a way to observe when it settles, matches the precedent better.
8. If async stays, copy VS Code's rules from point 3, and decide explicitly what a failed comment undo does to the stack. VS Code drops the stack.
9. I found no library where undo waits on a server before taking local effect. A comment undo that waits on the server has no precedent here, and the product behavior is unverified.

The same content is saved as a 36-line TSV at `/private/tmp/claude-501/-Users-zbeyens-git-plate-2/77220dd0-ee8b-48e9-a5a3-6b1b40c6c371/scratchpad/undo-survey/survey.tsv`; the Liveblocks clone is in the same folder.