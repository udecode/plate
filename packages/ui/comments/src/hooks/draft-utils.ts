export const _aaa = 1;

// const showThread = useCallback((threadNodeEntry: any) => {
//   const node = threadNodeEntry[0];
//   const { thread: selectedThread } = node;
//   requestAnimationFrame(() => {
//     getCommentPosition(threadNodeEntry);
//     setThread(selectedThread);
//   });
// }, []);
//
// const hideThread = useCallback(() => {
//   if (thread) {
//     setThread(null);
//     blurEditor(editor);
//     deselect(editor);
//   }
// }, [editor, thread]);
//
// const onResolveComment = useCallback(() => {
//   if (!editor || !thread) return;
//   const newThread = cloneDeep(thread);
//   newThread.isResolved = true;
//   upsertThread(editor, { thread: newThread });
//   normalizeThreadColor();
//   hideThread();
// }, [editor, hideThread, normalizeThreadColor, thread]);
//
// const onCancelCreateThread = useCallback(() => {
//   if (editor && newThreadThreadNodeEntry) {
//     const [, path] = newThreadThreadNodeEntry;
//     deleteThread(editor, { at: path });
//     setNewThreadThreadNodeEntry(null);
//   }
// }, [editor, newThreadThreadNodeEntry]);
//
// export const onSubmitComment = (
//   commentText: string,
//   user = undefined
// ) => {
//   const comment = {
//     id: nanoid(),
//     text: commentText,
//     createdAt: Date.now(),
//     userId: retrieveUser(),
//   };
//   const newThread = {
//     ...thread!,
//     isResolved: false,
//     comments: [...thread!.comments, comment],
//   };
//   if (user) {
//     newThread.user = user;
//   }
//   updateThread(newThread);
//   return newThread;
// };
//
// const handleparentIdInURL = useCallback(() => {
//   if (!editor) {
//     return;
//   }
//
//   const url = new URL(window.location.href);
//   const parentIdQueryParam = url.searchParams.get('thread');
//   if (!parentIdQueryParam) {
//     return;
//   }
//
//   const parentId = parseInt(parentIdQueryParam, 10);
//   const threadNodeEntries = getThreadNodeEntries(editor);
//   const threadNodeEntriesArray = Array.from(threadNodeEntries);
//   const threadNodeEntry = threadNodeEntriesArray.find(
//     (entry: TNodeEntry) => (entry[0] as TThreadElement).thread.id === parentId
//   );
//   if (!threadNodeEntry) {
//     return;
//   }
//
//   focusEditor(editor);
//   select(editor, threadNodeEntry[1]);
//   collapseSelection(editor, { edge: 'start' });
//   showThread(threadNodeEntry);
// }, [editor, showThread]);
