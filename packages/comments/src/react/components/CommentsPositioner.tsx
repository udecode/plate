import React from 'react';

import {
  createPrimitiveComponent,
  toDOMNode,
  useEditorPlugin,
} from '@udecode/plate-common/react';

import { CommentsPlugin } from '../CommentsPlugin';
import { getCommentPosition } from '../queries';
import { useActiveCommentNode } from '../stores/comments/useActiveCommentNode';

export const useCommentsPositionerState = () => {
  const { editor, useOption } = useEditorPlugin(CommentsPlugin);

  let activeCommentId = useOption('activeCommentId');

  const [position, setPosition] = React.useState<{ left: number; top: number }>(
    {
      left: 0,
      top: 0,
    }
  );

  if (position.left === 0 && position.top === 0) {
    activeCommentId = null;
  }

  const [node] = useActiveCommentNode() ?? [];

  React.useEffect(() => {
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
  propsHook: useCommentsPositioner,
  stateHook: useCommentsPositionerState,
});
