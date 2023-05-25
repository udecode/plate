import React, { HTMLAttributes, useCallback } from 'react';
import {
  AsProps,
  createComponentAs,
  focusEditor,
  useEditorRef,
} from '@udecode/plate-common';
import { unwrapLink } from '../../transforms/index';

export const useUnlinkButton = (
  props: HTMLAttributes<HTMLButtonElement>
): HTMLAttributes<HTMLButtonElement> => {
  const editor = useEditorRef();

  return {
    onClick: useCallback(() => {
      unwrapLink(editor);
      focusEditor(editor, editor.selection!);
    }, [editor]),
    ...props,
  };
};

export const UnlinkButton = createComponentAs<AsProps<'button'>>((props) => {
  const htmlProps = useUnlinkButton(props as any);

  return <button type="button" {...htmlProps} />;
});
