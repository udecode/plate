import React from 'react';
import {
  findNodePath,
  removeNodes,
  TElement,
  useEditorRef,
} from '@udecode/plate-core';
import { DeleteIcon } from '../Icon/DeleteIcon';
import { Button } from './Button';
import { ButtonProps } from './Button.types';

export const RemoveNodeButton = ({
  element,
  ...props
}: ButtonProps & { element: TElement }) => {
  const editor = useEditorRef();

  return (
    <Button
      size={24}
      py={4}
      onClick={() => {
        const path = findNodePath(editor, element);
        removeNodes(editor, { at: path });
      }}
      {...props}
    >
      <DeleteIcon />
    </Button>
  );
};
