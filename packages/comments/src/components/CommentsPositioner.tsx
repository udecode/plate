import { useEffect, useState } from 'react';
import {
  createPrimitiveComponent,
  toDOMNode,
  usePlateEditorRef,
} from '@udecode/plate-common';
import { getCommentPosition } from '../queries/index';
import { useCommentsSelectors } from '../stores/comments/CommentsProvider';
import { useActiveCommentNode } from '../stores/comments/useActiveCommentNode';

export const useCommentsPositionerState = () => {
  const editor = usePlateEditorRef();
  let activeCommentId = useCommentsSelectors().activeCommentId();

  const [position, setPosition] = useState<{ top: number; left: number }>({
    left: 0,
    top: 0,
  });

  if (position.left === 0 && position.top === 0) {
    activeCommentId = null;
  }

  const [node] = useActiveCommentNode() ?? [];

  useEffect(() => {
    if (!node) return;

    const domNode = toDOMNode(editor, node);
    if (!domNode) return;

    const newPosition = getCommentPosition(editor, node);
    if (!newPosition) return;

    setPosition(newPosition);
  }, [editor, node]);

  return {
    activeCommentId,
    position,
  };
};

export const useCommentsPositioner = ({
  activeCommentId,
  position,
}: ReturnType<typeof useCommentsPositionerState>) => {
  return {
    hidden: !activeCommentId,
    props: {
      style: {
        ...position,
      },
    },
  };
};

export const CommentsPositioner = createPrimitiveComponent('div')({
  stateHook: useCommentsPositionerState,
  propsHook: useCommentsPositioner,
});
