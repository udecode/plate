import { useCallback, useEffect, useState } from 'react';
import {
  getAbove,
  getNextSiblingNodes,
  getParent,
  getPluginType,
  isEnd,
  TAncestor,
  usePlateEditorState,
} from '@udecode/plate-core';
import {
  changeSelectionToBeBasedOnTheNextNode,
  Comment,
  deleteThread,
  ELEMENT_THREAD,
  findThreadNodeEntries,
  isTextNode,
  Thread,
  ThreadNode,
  upsertThreadAtSelection,
  User,
} from '@xolvio/plate-comments';
import { Editor, NodeEntry, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { determineAbsolutePosition } from './determineAbsolutePosition';
import { determineThreadNodeEntryWhenCaretIsNextToTheThreadNodeEntryOnTheLeft } from './determineThreadNodeEntryWhenCaretIsNextToTheThreadNodeEntryOnTheLeft';

export type OnSubmitComment = (commentText: string) => Promise<Thread>;

function replaceElement<T>(
  elements: T[],
  newElement: T,
  doesMatch: (element: T, newElement: T) => boolean
): T[] {
  return elements.map((element) =>
    doesMatch(element, newElement) ? newElement : element
  );
}

interface SomethingWithAnId {
  id: any;
}

function doBothElementsHaveTheSameId(
  elementA: SomethingWithAnId,
  elementB: SomethingWithAnId
): boolean {
  return elementA.id === elementB.id;
}

function replaceElementMatchingById<T extends { id: any }>(
  elements: T[],
  newElement: T
): T[] {
  return replaceElement(elements, newElement, doBothElementsHaveTheSameId);
}

function replaceComment(comments: Comment[], newComment: Comment): Comment[] {
  return replaceElementMatchingById(comments, newComment);
}

export interface ThreadPosition {
  left: number;
  top: number;
}

export type RetrieveUser = () => User | Promise<User>;
export type OnSaveComment = (comment: Comment) => Promise<Thread>;

export function useComments({
  retrieveUser,
}: {
  retrieveUser: RetrieveUser;
}): {
  thread: Thread | null;
  position: ThreadPosition;
  onAddThread: () => void;
  onSaveComment: OnSaveComment;
  onSubmitComment: OnSubmitComment;
  onCancelCreateThread: () => void;
} {
  const editor = usePlateEditorState();
  const [thread, setThread] = useState<Thread | null>(null);
  const [threadPosition, setThreadPosition] = useState({ left: 0, top: 0 });
  const [
    newThreadThreadNodeEntry,
    setNewThreadThreadNodeEntry,
  ] = useState<NodeEntry | null>(null);

  const updateThreadPosition = useCallback(
    function updateThreadPosition(threadNodeEntry) {
      const selectionDOMNode = ReactEditor.toDOMNode(
        editor,
        threadNodeEntry[0]
      );
      const selectionDOMNodePosition = determineAbsolutePosition(
        selectionDOMNode
      );

      const editorDOMNode = ReactEditor.toDOMNode(editor, editor);
      const {
        x: editorX,
        width: editorWidth,
      } = editorDOMNode.getBoundingClientRect();

      const newThreadPosition = {
        left: editorX + editorWidth + 16,
        top: selectionDOMNodePosition.top,
      };
      setThreadPosition(newThreadPosition);
    },
    [editor]
  );

  const showThread = useCallback(
    function showThread(threadNodeEntry: any) {
      const { thread: selectedThread } = threadNodeEntry[0];
      requestAnimationFrame(() => {
        updateThreadPosition(threadNodeEntry);
        setThread(selectedThread);
      });
    },
    [updateThreadPosition]
  );

  const hideThread = useCallback(function hideThread() {
    setThread(null);
  }, []);

  const onCancelCreateThread = useCallback(
    function onCancelCreateThread() {
      if (newThreadThreadNodeEntry) {
        deleteThread(editor, newThreadThreadNodeEntry[1]);
        setNewThreadThreadNodeEntry(null);
      }
    },
    [editor, newThreadThreadNodeEntry]
  );

  const handleThreadIdInURL = useCallback(
    function handleThreadIdInURL() {
      const url = new URL(window.location.href);
      const threadIdQueryParam = url.searchParams.get('thread');
      if (threadIdQueryParam) {
        const threadId = parseInt(threadIdQueryParam, 10);
        const threadNodeEntries = Array.from(findThreadNodeEntries(editor));
        const threadNodeEntry = threadNodeEntries.find(
          (threadNodeEntry2: any) => threadNodeEntry2[0].thread.id === threadId
        );
        if (threadNodeEntry) {
          ReactEditor.focus(editor);
          Transforms.select(editor, threadNodeEntry[1]);
          Transforms.collapse(editor, { edge: 'start' });
          showThread(threadNodeEntry);

          // eslint-disable-next-line no-inner-declarations
          function position() {
            requestAnimationFrame(() => {
              const domNode = ReactEditor.toDOMNode(
                editor,
                threadNodeEntry![0]
              );
              domNode.scrollIntoView();
              updateThreadPosition(threadNodeEntry);
            });
          }

          if (document.readyState === 'complete') {
            position();
          } else {
            window.addEventListener('load', position);
          }
        }
      }
    },
    [editor, showThread, updateThreadPosition]
  );

  const [
    hasThreadIdInURLBeenHandled,
    setHasThreadIdInURLBeenHandled,
  ] = useState<boolean>(false);

  useEffect(
    function onChange() {
      if (!hasThreadIdInURLBeenHandled && editor.children.length > 0) {
        setHasThreadIdInURLBeenHandled(true);
        handleThreadIdInURL();
      }
    },
    [editor.children.length, handleThreadIdInURL, hasThreadIdInURLBeenHandled]
  );

  useEffect(
    function onSelectionChange() {
      const type = getPluginType(editor, ELEMENT_THREAD);
      let threadNodeEntry:
        | NodeEntry<ThreadNode & TAncestor>
        | undefined = getAbove<ThreadNode & TAncestor>(editor, {
        match: { type },
      });
      if (!threadNodeEntry && editor.selection) {
        if (Range.isCollapsed(editor.selection)) {
          threadNodeEntry = getAbove<ThreadNode & TAncestor>(editor, {
            at: Editor.after(editor, editor.selection.anchor, {
              distance: 1,
              unit: 'character',
            }),
            match: { type },
          });
        } else {
          threadNodeEntry = determineThreadNodeEntryWhenCaretIsNextToTheThreadNodeEntryOnTheLeft(
            editor
          );
        }
      }
      const isThreadNodeTheNewThreadNode =
        threadNodeEntry &&
        newThreadThreadNodeEntry &&
        threadNodeEntry[0].id === (newThreadThreadNodeEntry[0] as any).id;
      if (!isThreadNodeTheNewThreadNode) {
        onCancelCreateThread();
      }
      if (threadNodeEntry && !threadNodeEntry[0].thread.isResolved) {
        showThread(threadNodeEntry);
      } else {
        hideThread();
      }
    },
    [
      showThread,
      hideThread,
      editor,
      editor.selection,
      newThreadThreadNodeEntry,
      onCancelCreateThread,
    ]
  );

  useEffect(
    function potentiallyCorrectSelection() {
      if (editor.selection && Range.isCollapsed(editor.selection)) {
        const threadType = getPluginType(editor, ELEMENT_THREAD);
        const threadNodeEntry = getAbove<ThreadNode & TAncestor>(editor, {
          match: {
            type: threadType,
          },
        });
        if (threadNodeEntry) {
          const focusPoint = editor.selection.focus;
          const [, threadPath] = threadNodeEntry;
          if (isEnd(editor, focusPoint, threadPath)) {
            const parent = getParent(editor, threadPath);
            if (parent) {
              const siblings = getNextSiblingNodes(parent, threadPath);
              if (siblings.length >= 1 && isTextNode(siblings[0])) {
                changeSelectionToBeBasedOnTheNextNode(editor);
              }
            }
          }
        }
      }
    },
    [editor, editor.selection]
  );

  const onAddThread = useCallback(
    async function onAddThread() {
      if (editor.selection) {
        const newThread: Thread = {
          id: Math.floor(Math.random() * 1000), // FIXME
          comments: [],
          isResolved: false,
          createdBy: await retrieveUser(),
        };
        const newThreadThreadNodeEntry2 = upsertThreadAtSelection(
          editor,
          newThread
        );
        setNewThreadThreadNodeEntry(newThreadThreadNodeEntry2);
      }
    },
    [editor, retrieveUser]
  );

  const updateThread = useCallback(
    function updateThread(newThread: Thread): void {
      upsertThreadAtSelection(editor, newThread);
      setNewThreadThreadNodeEntry(null);
      setThread(null);
    },
    [editor]
  );

  const onSaveComment = useCallback<OnSaveComment>(
    async function onSaveComment(comment: Comment) {
      const newThread = {
        ...thread!,
        comments: replaceComment(thread!.comments, comment),
      };
      updateThread(newThread);
      return newThread;
    },
    [thread, updateThread]
  );

  const onSubmitComment = useCallback<OnSubmitComment>(
    async function onSubmitComment(commentText: string): Promise<Thread> {
      const comment = {
        id: Math.floor(Math.random() * 1000), // FIXME
        text: commentText,
        createdAt: Date.now(),
        createdBy: await retrieveUser(),
      };
      const newThread = {
        ...thread!,
        comments: [...thread!.comments, comment],
      };
      updateThread(newThread);
      return newThread;
    },
    [retrieveUser, thread, updateThread]
  );

  return {
    thread,
    position: threadPosition,
    onAddThread,
    onSaveComment,
    onSubmitComment,
    onCancelCreateThread,
  };
}
