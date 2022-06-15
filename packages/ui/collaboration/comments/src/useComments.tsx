import { useCallback, useEffect, useState } from 'react';
import {
  getAboveNode,
  getNextSiblingNodes,
  getParentNode,
  getPluginType,
  isEndPoint,
  platesStore,
  TAncestor,
  useEventEditorSelectors,
  usePlateEditorState,
  usePlateSelection,
} from '@udecode/plate-core';
import {
  changeSelectionToBeBasedOnTheNextNode,
  Comment,
  deleteThread,
  ELEMENT_THREAD,
  findThreadNodeEntries,
  isTextNode,
  Thread,
  ThreadElement,
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

export function useTestABC() {
  // debugger;
  //
  // // @ts-ignore
  // window.platesStore = platesStore;
  //
  // const selection = usePlateSelection('50745bb0-299b-4e79-8aa6-0011da8fcee6');
  // console.log('selection AA', selection);
  // return 1;
}

export function useTestABCD() {
  debugger;

  // @ts-ignore
  window.platesStore = platesStore;

  const selection = usePlateSelection('50745bb0-299b-4e79-8aa6-0011da8fcee7');
  console.log('selection AB', selection);
  return 1;
}

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
  const lastFocusedEditorId = useEventEditorSelectors.focus() ?? undefined;
  console.log('lastFocusedEditorId', lastFocusedEditorId);
  const editor = usePlateEditorState(lastFocusedEditorId);
  // @ts-ignore
  window.editor2 = editor;

  // @ts-ignore
  window.platesStore = platesStore;

  const selection = usePlateSelection(lastFocusedEditorId);
  console.log('useComments', editor, editor?.selection);
  console.log('selection', selection);
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

  const onCancelCreateThread = useCallback(
    function onCancelCreateThread() {
      if (editor && newThreadThreadNodeEntry) {
        deleteThread(editor, newThreadThreadNodeEntry[1]);
        setNewThreadThreadNodeEntry(null);
      }
    },
    [editor, newThreadThreadNodeEntry]
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
      if (
        !hasThreadIdInURLBeenHandled &&
        editor &&
        editor.children.length > 0
      ) {
        setHasThreadIdInURLBeenHandled(true);
        handleThreadIdInURL();
      }
    },
    [editor, handleThreadIdInURL, hasThreadIdInURLBeenHandled]
  );

  useEffect(
    function onSelectionChange() {
      console.log('onSelectionChange', editor, selection);
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
              const siblings = getNextSiblingNodes(parent, threadPath);
              if (siblings.length >= 1 && isTextNode(siblings[0][0])) {
                changeSelectionToBeBasedOnTheNextNode(editor);
              }
            }
          }
        }
      }
    },
    [editor, selection]
  );

  const onAddThread = useCallback(
    async function onAddThread() {
      if (editor && selection) {
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
    [editor, selection, retrieveUser]
  );

  const updateThread = useCallback(
    function updateThread(newThread: Thread): void {
      if (editor) {
        upsertThreadAtSelection(editor, newThread);
        setNewThreadThreadNodeEntry(null);
        setThread(null);
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
