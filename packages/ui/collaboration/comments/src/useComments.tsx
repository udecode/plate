import { useCallback, useEffect, useState } from 'react';
import {
  Comment,
  deleteThread,
  ELEMENT_THREAD,
  Thread,
  upsertThread,
} from '@udecode/plate-comments';
import {
  getAbove,
  getPluginType,
  usePlateEditorState,
} from '@udecode/plate-core';
import { NodeEntry } from 'slate';
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

  useEffect(
    function onEditorChange() {
      const type = getPluginType(editor, ELEMENT_THREAD);
      // FIXME: Show thread when putting caret before the first character of the text with which the thread is connected.
      const threadNodeEntry = getAbove(editor, {
        match: { type },
      });
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
      editor.selection,
      showThread,
      hideThread,
      editor,
      newThreadThreadNodeEntry,
      onCancelCreateThread,
    ]
  );

  const onAddThread = useCallback(
    function onAddThread() {
      if (editor.selection) {
        const newThread: Thread = {
          id: Math.floor(Math.random() * 1000), // FIXME
          comments: [],
          isResolved: false,
        };
        const newThreadThreadNodeEntry2 = upsertThread(editor, newThread);
        setNewThreadThreadNodeEntry(newThreadThreadNodeEntry2);
      }
    },
    [editor]
  );

  const onSubmitComment = useCallback(
    function onSubmitComment(comment: Comment) {
      thread!.comments.push(comment);
      upsertThread(editor, thread!);
      setNewThreadThreadNodeEntry(null);
      setThread(null);
    },
    [editor, thread]
  );

  return {
    thread,
    position: threadPosition,
    onAddThread,
    onSubmitComment,
    onCancelCreateThread,
  };
}
