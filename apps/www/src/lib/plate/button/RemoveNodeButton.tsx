import React from 'react';
import {
  findNodePath,
  focusEditor,
  removeNodes,
  TElement,
  useEditorRef,
} from '@udecode/plate-common';

import { Icons } from '@/components/icons';
import { Button, ButtonProps } from '@/components/ui/button';

export function RemoveNodeButton({
  element,
  children,
  ...props
}: ButtonProps & { element: TElement }) {
  const editor = useEditorRef();

  return (
    <Button
      variant="menu"
      onClick={() => {
        const path = findNodePath(editor, element);

        removeNodes(editor, { at: path });

        focusEditor(editor, editor.selection!);
      }}
      {...props}
    >
      <Icons.delete className="mr-2 h-4 w-4" />
      {children}
    </Button>
  );
}
