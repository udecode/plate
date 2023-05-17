import React, { useCallback } from 'react';
import {
  AsProps,
  createComponentAs,
  focusEditor,
  HTMLPropsAs,
  useEditorRef,
} from '@udecode/plate-common';
import { unwrapLink } from '../../transforms/index';

export const useUnlinkButton = (
  props: HTMLPropsAs<'button'>
): HTMLPropsAs<'button'> => {
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
  const htmlProps = useUnlinkButton(props);

  return <button type="button" {...htmlProps} />;
});
