import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getAboveNode,
  getNextSiblingNodes,
  getParentNode,
  getPluginType,
  isEndPoint,
  TAncestor,
  TDescendant,
  usePlateEditorState,
  usePlateId,
  usePlateSelection,
  usePlateSelectors,
} from '@udecode/plate-core';
import {
  changeSelectionToBeBasedOnTheNextNode,
  Comment,
  deleteThread,
  ELEMENT_THREAD,
  findSelectedThreadNodeEntry,
  findThreadNodeEntries,
  isTextNode,
  Thread,
  ThreadElement,
  upsertThreadAtSelection,
  User,
} from '@xolvio/plate-comments';
import { Editor, NodeEntry, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { v4 as createV4UUID } from 'uuid';
import { determineAbsolutePosition } from './determineAbsolutePosition';
import { determineThreadNodeEntryWhenCaretIsNextToTheThreadNodeEntryOnTheLeft } from './determineThreadNodeEntryWhenCaretIsNextToTheThreadNodeEntryOnTheLeft';

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

export type RetrieveUserReturnType = User;
export type RetrieveUser = () =>
  | RetrieveUserReturnType
  | Promise<RetrieveUserReturnType>;
export type OnAddThread = () => Promise<void>;
export type OnSaveComment = (comment: Comment) => Promise<Thread>;
export type OnSubmitComment = (
  commentText: string,
  assignedTo?: User
) => Promise<Thread>;
export type OnCancelCreateThread = () => void;
export type OnResolveThread = () => void;

export type UseCommentsReturnType = {
  thread: Thread | null;
  position: ThreadPosition;
  onAddThread: OnAddThread;
  onSaveComment: OnSaveComment;
  onSubmitComment: OnSubmitComment;
  onCancelCreateThread: OnCancelCreateThread;
  onResolveThread: OnResolveThread;
};

export function useComments({
  retrieveUser,
}: {
  retrieveUser: RetrieveUser;
}): UseCommentsReturnType {
  const id = usePlateId() ?? undefined;
  const editorKey = usePlateSelectors(id).keyEditor();
  const editor = usePlateEditorState(id);

  const selection = usePlateSelection(id);
  const [thread, setThread] = useState<Thread | null>(null);
  const [threadPosition, setThreadPosition] = useState({ left: 0, top: 0 });
  const [
    newThreadThreadNodeEntry,
    setNewThreadThreadNodeEntry,
  ] = useState<NodeEntry | null>(null);

  const updateThreadPosition = useCallback(
    function updateThreadPosition(threadNodeEntry) {
      if (editor) {
        const selectionDOMNode = ReactEditor.toDOMNode(
          editor as any,
          threadNodeEntry[0]
        );
        const selectionDOMNodePosition = determineAbsolutePosition(
          selectionDOMNode
        );

        const editorDOMNode = ReactEditor.toDOMNode(editor as any, editor);
        const {
          x: editorX,
          width: editorWidth,
        } = editorDOMNode.getBoundingClientRect();

        const newThreadPosition = {
          left: editorX + editorWidth + 16,
          top: selectionDOMNodePosition.top,
        };
        setThreadPosition(newThreadPosition);
      }
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

  const onCancelCreateThread = useCallback<OnCancelCreateThread>(
    function onCancelCreateThread() {
      if (editor && newThreadThreadNodeEntry) {
        deleteThread(editor, newThreadThreadNodeEntry[1]);
        setNewThreadThreadNodeEntry(null);
      }
    },
    [editor, newThreadThreadNodeEntry]
  );

  const onResolveThread = useCallback(
    function onResolveThread() {
      if (editor && thread) {
        const newThread = {
          ...thread,
          isResolved: true,
        };
        upsertThreadAtSelection(editor, newThread);
        hideThread();
      }
    },
    [editor, hideThread, thread]
  );

  const handleThreadIdInURL = useCallback(
    function handleThreadIdInURL() {
      if (editor) {
        const url = new URL(window.location.href);
        const threadIdQueryParam = url.searchParams.get('thread');
        if (threadIdQueryParam) {
          const threadId = parseInt(threadIdQueryParam, 10);
          const threadNodeEntries = Array.from(findThreadNodeEntries(editor));
          const threadNodeEntry = threadNodeEntries.find(
            (threadNodeEntry2: any) =>
              threadNodeEntry2[0].thread.id === threadId
          );
          if (threadNodeEntry) {
            ReactEditor.focus(editor as any);
            Transforms.select(editor as any, threadNodeEntry[1]);
            Transforms.collapse(editor as any, { edge: 'start' });
            showThread(threadNodeEntry);

            // eslint-disable-next-line no-inner-declarations
            function position() {
              requestAnimationFrame(() => {
                const domNode = ReactEditor.toDOMNode(
                  editor as any,
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
      if (editor && editor.children.length > 0) {
        if (!hasThreadIdInURLBeenHandled) {
          setHasThreadIdInURLBeenHandled(true);
          handleThreadIdInURL();
        }

        if (thread) {
          const threadNodeEntry = findSelectedThreadNodeEntry(editor);
          const threadFromNode = threadNodeEntry
            ? threadNodeEntry[0].thread
            : null;
          setThread(threadFromNode);
        }
      }
    },
    [
      editorKey,
      editor,
      handleThreadIdInURL,
      hasThreadIdInURLBeenHandled,
      thread,
    ]
  );

  useEffect(
    function onSelectionChange() {
      if (editor) {
        const type = getPluginType(editor, ELEMENT_THREAD);
        let threadNodeEntry:
          | NodeEntry<ThreadElement & TAncestor>
          | undefined = getAboveNode<ThreadElement & TAncestor>(editor, {
          match: { type },
        });
        if (!threadNodeEntry && selection) {
          if (Range.isCollapsed(selection)) {
            threadNodeEntry = getAboveNode<ThreadElement & TAncestor>(editor, {
              at: Editor.after(editor as any, selection.anchor, {
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
      }
    },
    [
      showThread,
      hideThread,
      editor,
      selection,
      newThreadThreadNodeEntry,
      onCancelCreateThread,
    ]
  );

  useEffect(
    function potentiallyCorrectSelection() {
      if (editor && selection && Range.isCollapsed(selection)) {
        const threadType = getPluginType(editor, ELEMENT_THREAD);
        const threadNodeEntry = getAboveNode<ThreadElement & TAncestor>(
          editor,
          {
            match: {
              type: threadType,
            },
          }
        );
        if (threadNodeEntry) {
          const focusPoint = selection.focus;
          const [, threadPath] = threadNodeEntry;
          if (isEndPoint(editor, focusPoint, threadPath)) {
            const parent = getParentNode(editor, threadPath);
            if (parent) {
              const siblings = (getNextSiblingNodes(
                parent,
                threadPath
              ) as any) as TDescendant[];
              if (siblings.length >= 1 && isTextNode(siblings[0])) {
                changeSelectionToBeBasedOnTheNextNode(editor);
              }
            }
          }
        }
      }
    },
    [editor, selection]
  );

  const onAddThread = useCallback<OnAddThread>(
    async function onAddThread() {
      if (editor && selection) {
        const newThread: Thread = {
          id: createV4UUID(),
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
    [editor, selection, retrieveUser]
  );

  const updateThread = useCallback(
    function updateThread(newThread: Thread): void {
      if (editor) {
        upsertThreadAtSelection(editor, newThread);
        setNewThreadThreadNodeEntry(null);
        setThread(newThread);
      }
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
    async function onSubmitComment(
      commentText: string,
      assignedTo = undefined
    ): Promise<Thread> {
      const comment = {
        id: createV4UUID(),
        text: commentText,
        createdAt: Date.now(),
        createdBy: await retrieveUser(),
      };
      const newThread = {
        ...thread!,
        comments: [...thread!.comments, comment],
      };
      if (assignedTo) {
        newThread.assignedTo = assignedTo;
      }
      updateThread(newThread);
      return newThread;
    },
    [retrieveUser, thread, updateThread]
  );

  const returnValue = useMemo(
    () => ({
      thread,
      position: threadPosition,
      onAddThread,
      onSaveComment,
      onSubmitComment,
      onCancelCreateThread,
      onResolveThread,
    }),
    [
      onAddThread,
      onCancelCreateThread,
      onResolveThread,
      onSaveComment,
      onSubmitComment,
      thread,
      threadPosition,
    ]
  );

  return returnValue;
}
