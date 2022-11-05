import { useMemo } from 'react';
import {
  AsProps,
  createComponentAs,
  createElementAs,
  findNode,
  getPluginType,
  HTMLPropsAs,
  useEditorRef,
  usePlateSelection,
} from '@udecode/plate-core';
import { ELEMENT_LINK } from '../../createLinkPlugin';
import { TLinkElement } from '../../types';

export const useOpenLinkButton = (
  props: HTMLPropsAs<'a'>
): HTMLPropsAs<'a'> => {
  const editor = useEditorRef();
  const selection = usePlateSelection();

  const entry = useMemo(
    () =>
      findNode<TLinkElement>(editor, {
        match: { type: getPluginType(editor, ELEMENT_LINK) },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, selection]
  );

  if (!entry) {
    return {};
  }

  const [link] = entry;

  return {
    'aria-label': 'Open link in a new tab',
    target: '_blank',
    href: link.url,
    onMouseOver: (e) => {
      e.stopPropagation();
    },
    ...props,
  };
};

export const OpenLinkButton = createComponentAs<AsProps<'a'>>((props) => {
  const htmlProps = useOpenLinkButton(props);

  return createElementAs('a', htmlProps);
});
