import { useCallback, useEffect, useState } from 'react';
import {
  Comment,
  deleteThread,
  ELEMENT_THREAD,
  findThreadNodes,
  Thread,
  upsertThread,
} from '@udecode/plate-comments';
import {
  getAbove,
  getPluginType,
  usePlateEditorState,
} from '@udecode/plate-core';
import { Editor } from 'slate';
import { ReactEditor } from 'slate-react';

export function determineAbsolutePosition(element: HTMLElement) {
  let left = 0;
  let top = 0;
  let currentElement: HTMLElement | null = element;
  do {
    left += currentElement.offsetLeft || 0;
    top += currentElement.offsetTop || 0;
    currentElement = currentElement.offsetParent as HTMLElement;
  } while (currentElement);
  return {
    left,
    top,
  };
}

export interface UseCommentsResult {
  thread: Thread | null;
  show: boolean;
  position: {
    left: number;
    top: number;
  };
  onSubmitComment: (comment: Comment) => void;
  onAddThread: () => void;
}

export function useComments(): any {
  const editor = usePlateEditorState();
  const [thread, setThread] = useState<Thread | null>(null);
  const [threadPosition, setThreadPosition] = useState({ left: 0, top: 0 });

  const updateThreadPosition = useCallback(
    function updateThreadPosition() {
      let left;
      let top;
      if (editor.selection) {
        const selectionNode = Editor.node(editor, editor.selection)[0];
        const selectionDOMNode = ReactEditor.toDOMNode(editor, selectionNode);
        const selectionDOMNodePosition = determineAbsolutePosition(
          selectionDOMNode
        );

        const editorDOMNode = ReactEditor.toDOMNode(editor, editor);
        const {
          x: editorX,
          width: editorWidth,
        } = editorDOMNode.getBoundingClientRect();
        left = editorX + editorWidth + 16;
        top = selectionDOMNodePosition.top;
      } else {
        left = 0;
        top = 0;
      }

      const newThreadPosition = {
        left,
        top,
      };
      setThreadPosition(newThreadPosition);
    },
    [editor]
  );

  const showThread = useCallback(
    function showThread(threadNode: any) {
      const { thread: selectedThread } = threadNode[0];
      setThread(selectedThread);
      updateThreadPosition();
    },
    [updateThreadPosition]
  );

  const hideThread = useCallback(function hideThread() {
    setThread(null);
  }, []);

  const deleteEmptyThreads = useCallback(
    function removeEmptyThreads() {
      const threadNodes = findThreadNodes(editor);
      for (const threadNodeEntry of threadNodes) {
        const threadNode = threadNodeEntry[0];
        const threadNodeThread = threadNode.thread;
        if (threadNodeThread.comments.length === 0) {
          const threadNodePath = threadNodeEntry[1];
          deleteThread(editor, threadNodePath);
        }
      }
    },
    [editor]
  );

  useEffect(
    function onEditorChange() {
      const type = getPluginType(editor, ELEMENT_THREAD);
      // FIXME: Show thread when putting caret before the first character of the text with which the thread is connected.
      const threadNode = getAbove(editor, {
        match: { type },
      });
      // deleteEmptyThreads();
      if (threadNode && !threadNode[0].thread.isResolved) {
        showThread(threadNode);
      } else {
        hideThread();
      }
    },
    [editor.selection, showThread, hideThread, editor, deleteEmptyThreads]
  );

  const onSubmitComment = useCallback(
    function onSubmitComment(comment: Comment) {
      thread!.comments.push(comment);
      upsertThread(editor, thread!);
      setThread(null);
    },
    [editor, thread]
  );

  const onAddThread = useCallback(
    function onAddThread() {
      if (editor.selection) {
        updateThreadPosition();
        const newThread: Thread = {
          id: Math.floor(Math.random() * 1000), // FIXME
          comments: [],
          isResolved: false,
        };
        upsertThread(editor, newThread);
        setThread(newThread);
      }
    },
    [editor, updateThreadPosition]
  );

  return {
    thread,
    position: threadPosition,
    onSubmitComment,
    onAddThread,
  };
}
