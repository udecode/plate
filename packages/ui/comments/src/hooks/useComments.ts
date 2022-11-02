import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  changeSelectionToBeBasedOnTheNextNode,
  Comment,
  deleteThread,
  determineThreadNodeEntryWhenCaretIsNextToTheThreadNodeEntryOnTheLeft,
  ELEMENT_THREAD,
  findSelectedThreadNodeEntry,
  findThreadNodeEntries,
  isTextNode,
  replaceComment,
  Thread,
  ThreadElement,
  upsertThreadAtSelection,
  User,
} from '@udecode/plate-comments';
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
import { clamp, cloneDeep } from 'lodash';
import { BaseEditor, Editor, NodeEntry, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { v4 as createV4UUID } from 'uuid';
import { ThreadPosition } from '../types';
import { determineAbsolutePosition } from '../utils';

const ACTIVE_THREAD_COLOR = '#fcc934';
const INACTIVE_THREAD_COLOR = '#fae093';

export type UseCommentsParams = {
  retrieveUser: () => User;
};

export type UseCommentsReturnType = {
  thread: Thread | null;
  position: ThreadPosition;
  onAddThread: () => void;
  onSaveComment: (comment: Comment) => Thread;
  onSubmitComment: (commentText: string, assignedTo?: User) => Thread;
  onCancelCreateThread: () => void;
  onResolveThread: () => void;
  hideThread: () => void;
};

export const useComments = (
  params: UseCommentsParams
): UseCommentsReturnType => {
  const { retrieveUser } = params;

  const id = usePlateId() ?? undefined;
  const editorKey = usePlateSelectors(id).keyEditor();
  const editor = usePlateEditorState(id);
  const selection = usePlateSelection(id);

  const [thread, setThread] = useState<Thread | null>(null);
  const [threadPosition, setThreadPosition] = useState<ThreadPosition>({
    left: 0,
    top: 0,
  });
  const [
    newThreadThreadNodeEntry,
    setNewThreadThreadNodeEntry,
  ] = useState<NodeEntry | null>(null);
  const [previousThreadNode, setPreviousThreadNode] = useState<ThreadElement>();
  const [
    hasThreadIdInURLBeenHandled,
    setHasThreadIdInURLBeenHandled,
  ] = useState<boolean>(false);

  const updateThreadPosition = useCallback(
    (threadNodeEntry) => {
      if (!editor) {
        return;
      }
      const [node] = threadNodeEntry;
      const selectionDOMNode = ReactEditor.toDOMNode(
        editor as ReactEditor,
        node
      );
      const selectionDOMNodePosition = determineAbsolutePosition(
        selectionDOMNode
      );

      const editorDOMNode = ReactEditor.toDOMNode(
        editor as ReactEditor,
        editor
      );
      const {
        x: editorX,
        width: editorWidth,
      } = editorDOMNode.getBoundingClientRect();

      const sideThreadWidth = 418;
      const padding = 16;

      const newThreadPosition = {
        left: clamp(
          editorX + editorWidth + 16,
          window.innerWidth - (sideThreadWidth + padding)
        ),
        top: selectionDOMNodePosition.top,
      };
      setThreadPosition(newThreadPosition);
    },
    [editor]
  );

  const showThread = useCallback(
    (threadNodeEntry: any) => {
      const node = threadNodeEntry[0];
      const { thread: selectedThread } = node;
      requestAnimationFrame(() => {
        updateThreadPosition(threadNodeEntry);
        setThread(selectedThread);
      });
    },
    [updateThreadPosition]
  );

  const hideThread = useCallback(() => {
    if (thread) {
      setThread(null);
      ReactEditor.blur(editor as ReactEditor);
      Transforms.deselect(editor as BaseEditor);
    }
  }, [editor, thread]);

  const onCancelCreateThread = useCallback(() => {
    if (editor && newThreadThreadNodeEntry) {
      const [, path] = newThreadThreadNodeEntry;
      deleteThread(editor, path);
      setNewThreadThreadNodeEntry(null);
    }
  }, [editor, newThreadThreadNodeEntry]);

  const normalizeThreadColor = useCallback(() => {
    if (!editor) return;
    const threadNodeEntry = findSelectedThreadNodeEntry(editor);
    if (!threadNodeEntry) return;
    const [threadNode] = threadNodeEntry;
    const threadDomNode = ReactEditor.toDOMNode(
      editor as ReactEditor,
      threadNode
    );
    threadDomNode.style.backgroundColor = '';
  }, [editor]);

  const onResolveThread = useCallback(() => {
    if (!editor || !thread) return;
    const newThread = cloneDeep(thread);
    newThread.isResolved = true;
    upsertThreadAtSelection(editor, newThread);
    normalizeThreadColor();
    hideThread();
  }, [editor, hideThread, normalizeThreadColor, thread]);

  const handleThreadIdInURL = useCallback(() => {
    if (!editor) {
      return;
    }

    const url = new URL(window.location.href);
    const threadIdQueryParam = url.searchParams.get('thread');
    if (!threadIdQueryParam) {
      return;
    }

    const threadId = parseInt(threadIdQueryParam, 10);
    const threadNodeEntries = findThreadNodeEntries(editor);
    const threadNodeEntriesArray = Array.from(threadNodeEntries);
    const threadNodeEntry = threadNodeEntriesArray.find(
      (entry: NodeEntry<any>) => entry[0].thread.id === threadId
    );
    if (!threadNodeEntry) {
      return;
    }

    ReactEditor.focus(editor as ReactEditor);
    Transforms.select(editor as BaseEditor, threadNodeEntry[1]);
    Transforms.collapse(editor as BaseEditor, { edge: 'start' });
    showThread(threadNodeEntry);

    // eslint-disable-next-line no-inner-declarations
    const position = () => {
      requestAnimationFrame(() => {
        const domNode = ReactEditor.toDOMNode(
          editor as ReactEditor,
          threadNodeEntry[0]
        );
        domNode.scrollIntoView();
        updateThreadPosition(threadNodeEntry);
      });
    };

    if (document.readyState === 'complete') {
      position();
    } else {
      window.addEventListener('load', position);
    }
  }, [editor, showThread, updateThreadPosition]);

  const onAddThread = useCallback(() => {
    if (editor && selection) {
      const newThread: Thread = {
        id: createV4UUID(),
        comments: [],
        isResolved: false,
        createdBy: retrieveUser(),
      };
      const newThreadThreadNodeEntry2 = upsertThreadAtSelection(
        editor,
        newThread
      );
      // @ts-ignore
      setNewThreadThreadNodeEntry(newThreadThreadNodeEntry2);
    }
  }, [editor, selection, retrieveUser]);

  const updateThread = useCallback(
    (newThread: Thread): void => {
      if (editor) {
        upsertThreadAtSelection(editor, newThread);
        setNewThreadThreadNodeEntry(null);
        setThread(newThread);
      }
    },
    [editor]
  );

  const onSaveComment = useCallback(
    (comment: Comment) => {
      const newThread = {
        ...thread!,
        comments: replaceComment(thread!.comments, comment),
      };
      updateThread(newThread);
      return newThread;
    },
    [thread, updateThread]
  );

  const onSubmitComment = useCallback(
    (commentText: string, assignedTo = undefined) => {
      const comment = {
        id: createV4UUID(),
        text: commentText,
        createdAt: Date.now(),
        createdBy: retrieveUser(),
      };
      const newThread = {
        ...thread!,
        isResolved: false,
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

  useEffect(() => {
    if (!editor || editor.children.length === 0) {
      return;
    }

    if (!hasThreadIdInURLBeenHandled) {
      setHasThreadIdInURLBeenHandled(true);
      handleThreadIdInURL();
    }

    if (thread) {
      const threadNodeEntry = findSelectedThreadNodeEntry(editor);
      const threadFromNode = threadNodeEntry ? threadNodeEntry[0].thread : null;
      setThread(threadFromNode);
    }
  }, [
    editor,
    editorKey, // extra dependency to force effect when editor changes
    handleThreadIdInURL,
    hasThreadIdInURLBeenHandled,
    thread,
  ]);

  useEffect(() => {
    if (!editor) {
      return;
    }

    const type = getPluginType(editor, ELEMENT_THREAD);
    let threadNodeEntry = getAboveNode<ThreadElement & TAncestor>(editor, {
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
    if (previousThreadNode) {
      let previousThreadNodeDomNode;
      try {
        previousThreadNodeDomNode = ReactEditor.toDOMNode(
          editor as any,
          previousThreadNode
        );
      } catch (error) {}

      if (previousThreadNodeDomNode) {
        previousThreadNodeDomNode.style.backgroundColor = previousThreadNode
          .thread.isResolved
          ? ''
          : INACTIVE_THREAD_COLOR;
      }
    }
    if (threadNodeEntry && !threadNodeEntry[0].thread.isResolved) {
      const threadNode = threadNodeEntry[0];
      let domNode;
      try {
        domNode = ReactEditor.toDOMNode(editor as any, threadNode);
      } catch (error) {}
      if (domNode) {
        domNode.style.backgroundColor = threadNode.thread.isResolved
          ? ''
          : ACTIVE_THREAD_COLOR;
      }
      showThread(threadNodeEntry);
    } else {
      hideThread();
    }
    if (threadNodeEntry) {
      const threadNode = threadNodeEntry[0];
      setPreviousThreadNode(threadNode);
    }
  }, [
    showThread,
    hideThread,
    editor,
    selection,
    newThreadThreadNodeEntry,
    onCancelCreateThread,
    previousThreadNode,
  ]);

  useEffect(() => {
    if (editor && selection && Range.isCollapsed(selection)) {
      const threadType = getPluginType(editor, ELEMENT_THREAD);
      const threadNodeEntry = getAboveNode<ThreadElement & TAncestor>(editor, {
        match: {
          type: threadType,
        },
      });
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
  }, [editor, selection]);

  useEffect(() => {
    normalizeThreadColor();
  }, [editor, normalizeThreadColor]);

  const returnValue = useMemo(
    () => ({
      onAddThread,
      onCancelCreateThread,
      onResolveThread,
      onSaveComment,
      onSubmitComment,
      position: threadPosition,
      thread,
      hideThread,
    }),
    [
      onAddThread,
      onCancelCreateThread,
      onResolveThread,
      onSaveComment,
      onSubmitComment,
      thread,
      threadPosition,
      hideThread,
    ]
  );

  return returnValue;
};
