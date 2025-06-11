import React from 'react';

import { type TLinkElement, KEYS } from 'platejs';
import {
  createPrimitiveComponent,
  useEditorRef,
  useEditorSelection,
} from 'platejs/react';

import { getLinkAttributes } from '../../../lib/utils/getLinkAttributes';

// @deprecated
export const useLinkOpenButtonState = () => {
  const editor = useEditorRef();
  const selection = useEditorSelection();

  const entry = React.useMemo(
    () =>
      editor.api.node<TLinkElement>({
        match: { type: editor.getType(KEYS.link) },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editor, selection]
  );

  if (!entry) {
    return {};
  }

  const [element] = entry;

  return {
    element,
  };
};

// @deprecated
export const useLinkOpenButton = ({ element }: { element?: TLinkElement }) => {
  const editor = useEditorRef();

  if (!element) {
    return {
      props: {},
    };
  }

  const linkAttributes = getLinkAttributes(editor, element);

  return {
    props: {
      ...linkAttributes,
      'aria-label': 'Open link in a new tab',
      target: '_blank',
      onMouseOver: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.stopPropagation();
      },
    },
  };
};

export const LinkOpenButton = createPrimitiveComponent('a')({
  propsHook: useLinkOpenButton,
  stateHook: useLinkOpenButtonState,
});
