import React from 'react';
import { findNodePath } from '@udecode/plate-common';
import { useEditorRef } from '@udecode/plate-core';
import { useAtom } from 'jotai';
import { Transforms } from 'slate';
import { DeleteIcon } from '../Icon/DeleteIcon';
// import { elementAtom } from '../table.atoms';
import { Button } from './Button';
import { ButtonProps } from './Button.types';

export const RemoveNodeButton = (props: ButtonProps) => {
  const editor = useEditorRef();
  // const [element] = useAtom(elementAtom);

  return (
    <Button
      size={24}
      py={4}
      onClick={() => {
        // const path = findNodePath(editor, element);
        // Transforms.removeNodes(editor, { at: path });
      }}
      {...props}
    >
      <DeleteIcon />
    </Button>
  );
};
