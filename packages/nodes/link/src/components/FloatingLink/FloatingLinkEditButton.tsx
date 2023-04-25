import { useCallback } from 'react';
import {
  AsProps,
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
  useEditorRef,
} from '@udecode/plate-common';
import { triggerFloatingLinkEdit } from '../../utils/triggerFloatingLinkEdit';

export const useFloatingLinkEditButton = (
  props: HTMLPropsAs<'button'>
): HTMLPropsAs<'button'> => {
  const editor = useEditorRef();

  return {
    onClick: useCallback(() => {
      triggerFloatingLinkEdit(editor);
    }, [editor]),
    ...props,
  };
};

export const FloatingLinkEditButton = createComponentAs<AsProps<'button'>>(
  (props) => {
    const htmlProps = useFloatingLinkEditButton(props);

    return createElementAs('button', htmlProps);
  }
);
