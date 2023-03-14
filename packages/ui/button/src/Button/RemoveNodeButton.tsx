import React from 'react';
import {
  findNodePath,
  focusEditor,
  removeNodes,
  TElement,
  useEditorRef,
} from '@udecode/plate-common';
import { DeleteIcon } from '../Icon/DeleteIcon';
import { PlateButton, PlateButtonProps } from './PlateButton';

export const RemoveNodeButton = ({
  element,
  ...props
}: PlateButtonProps & { element: TElement }) => {
  const editor = useEditorRef();

  return (
    <PlateButton
      tw="py-1 px-0"
      css={`
        width: 24px;
        height: 24px;
      `}
      onClick={() => {
        const path = findNodePath(editor, element);

        removeNodes(editor, { at: path });

        focusEditor(editor, editor.selection!);
      }}
      {...props}
    >
      <DeleteIcon />
    </PlateButton>
  );
};
