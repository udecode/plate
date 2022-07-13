import { useCallback } from 'react';
import {
  AsProps,
  createComponentAs,
  createElementAs,
  findNode,
  getEditorString,
  getPluginType,
  HTMLPropsAs,
  useEditorRef,
} from '@udecode/plate-core';
import { ELEMENT_LINK } from '../../createLinkPlugin';
import { TLinkElement } from '../../types';
import { floatingLinkActions } from './floatingLinkStore';

export const useFloatingLinkEditButton = (
  props: HTMLPropsAs<'button'>
): HTMLPropsAs<'button'> => {
  const editor = useEditorRef();

  return {
    onClick: useCallback(() => {
      floatingLinkActions.isEditing(true);

      const entry = findNode<TLinkElement>(editor, {
        match: { type: getPluginType(editor, ELEMENT_LINK) },
      });
      if (!entry) return;

      const [link, path] = entry;

      let text = getEditorString(editor, path);

      floatingLinkActions.url(link.url);

      if (text === link.url) {
        text = '';
      }

      floatingLinkActions.text(text);
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
