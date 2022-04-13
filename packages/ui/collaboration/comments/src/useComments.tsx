import { useCallback, useEffect, useState } from 'react';
import {
  addThread,
  Comment,
  ELEMENT_THREAD,
  Thread,
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
  const [thread, setThread] = useState(null);
  const [isThreadShown, setIsThreadShown] = useState(false);
  const [threadPosition, setThreadPosition] = useState({ left: 0, top: 0 });

  const updateThreadPosition = useCallback(
    function updateThreadPosition() {
      let left;
      let top;
      if (editor?.selection) {
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
      setIsThreadShown(true);
    },
    [updateThreadPosition]
  );

  const hideThread = useCallback(function hideThread() {
    setThread(null);
    setIsThreadShown(false);
  }, []);

  useEffect(
    function onEditorChange() {
      if (editor) {
        const type = getPluginType(editor, ELEMENT_THREAD);
        const threadNode = getAbove(editor, {
          match: { type },
        });
        if (threadNode) {
          showThread(threadNode);
        } else {
          hideThread();
        }
      }
    },
    [editor.selection, showThread, hideThread, editor]
  );

  const onSubmitComment = useCallback(
    function onSubmitComment(comment: Comment) {
      const newThread: Thread = thread || {
        id: Math.floor(Math.random() * 1000), // FIXME
        comments: [],
      };
      newThread.comments.push(comment);
      addThread(editor, newThread);
      setIsThreadShown(false);
    },
    [editor, thread]
  );

  const onAddThread = useCallback(
    function onAddThread() {
      updateThreadPosition();
      setIsThreadShown(true);
    },
    [updateThreadPosition]
  );

  return {
    thread,
    show: isThreadShown,
    position: threadPosition,
    onSubmitComment,
    onAddThread,
  };
}
