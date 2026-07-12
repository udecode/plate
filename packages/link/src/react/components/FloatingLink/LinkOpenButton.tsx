import React from 'react';

import { useEditorRef, useEditorSelector } from '@platejs/core/react';
import type { TLinkElement } from '@platejs/utils';
import { KEYS } from '@platejs/utils';
import { createPrimitiveComponent } from '@udecode/react-utils';

import { getLinkAttributes } from '../../../lib/utils/getLinkAttributes';

// @deprecated
export const useLinkOpenButtonState = () => {
  const entry = useEditorSelector((editor) => {
    const selection = editor.read.selection();

    if (!selection) return;

    return editor.read.nodes.find<TLinkElement>({
      at: selection,
      match: { type: editor.getType(KEYS.link) },
    });
  }, []);

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
