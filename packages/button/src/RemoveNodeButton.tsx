import React, { useCallback } from 'react';
import {
  createComponentAs,
  findNodePath,
  focusEditor,
  removeNodes,
  TElement,
  useEditorRef,
} from '@udecode/plate-core';
import { Button, ButtonProps } from './Button';

export type RemoveNodeButtonProps = { element: TElement } & ButtonProps;

export const useRemoveNodeButtonProps = ({
  element,
  ...props
}: RemoveNodeButtonProps) => {
  const editor = useEditorRef();
  const onClick: RemoveNodeButtonProps['onClick'] = useCallback(
    (e) => {
      const path = findNodePath(editor, element);
      removeNodes(editor, { at: path });

      focusEditor(editor, editor.selection!);
    },
    [editor, element]
  );

  return { onClick, ...props };
};
export const RemoveNodeButton = createComponentAs<RemoveNodeButtonProps>(
  (props) => {
    const htmlProps = useRemoveNodeButtonProps(props);

    return <Button {...htmlProps} />;
  }
);
