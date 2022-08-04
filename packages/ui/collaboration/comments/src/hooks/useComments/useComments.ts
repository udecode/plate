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
} from '@xolvio/plate-comments';
import { BaseEditor, Editor, NodeEntry, Range, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';
import { v4 as createV4UUID } from 'uuid';
import { determineThreadNodeEntryWhenCaretIsNextToTheThreadNodeEntryOnTheLeft } from '../../queries';
import { replaceComment } from '../../transforms';
import {
  OnAddThread,
  OnCancelCreateThread,
  OnSaveComment,
  OnSubmitComment,
  ThreadPosition,
} from '../../types';
import { determineAbsolutePosition } from '../../utils';
import { UseCommentsParams, UseCommentsReturnType } from './useComments.types';

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

      const newThreadPosition = {
        left: editorX + editorWidth + 16,
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
    setThread(null);
  }, []);

  const onCancelCreateThread = useCallback<OnCancelCreateThread>(() => {
    if (editor && newThreadThreadNodeEntry) {
      const [, path] = newThreadThreadNodeEntry;
      deleteThread(editor, path);
      setNewThreadThreadNodeEntry(null);
    }
  }, [editor, newThreadThreadNodeEntry]);

  const onResolveThread = useCallback(() => {
    if (editor && thread) {
      const newThread = {
        ...thread,
        isResolved: true,
      };
      upsertThreadAtSelection(editor, newThread);
      hideThread();
    }
  }, [editor, hideThread, thread]);

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

  const onAddThread = useCallback<OnAddThread>(async () => {
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

  const onSaveComment = useCallback<OnSaveComment>(
    // TODO: remove the ts ignore
    // @ts-ignore
    async (comment: Comment) => {
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
    async (commentText: string, assignedTo = undefined): Promise<Thread> => {
      const comment = {
        id: createV4UUID(),
        text: commentText,
        createdAt: Date.now(),
        createdBy: await retrieveUser(),
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
    editorKey,
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
        previousThreadNodeDomNode.style.backgroundColor = '';
      }
    }
    if (threadNodeEntry && !threadNodeEntry[0].thread.isResolved) {
      const threadNode = threadNodeEntry[0];
      let domNode;
      try {
        domNode = ReactEditor.toDOMNode(editor as any, threadNode);
      } catch (error) {}
      if (domNode) {
        domNode.style.backgroundColor = '#fcc934';
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
};
