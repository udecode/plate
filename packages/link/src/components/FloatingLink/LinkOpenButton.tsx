import React from 'react';
import {
  createPrimitiveComponent,
  findNode,
  getPluginType,
  useEditorRef,
  useEditorSelection,
} from '@udecode/plate-common';

import { ELEMENT_LINK } from '../../createLinkPlugin';
import { TLinkElement } from '../../types';
import { getLinkAttributes } from '../../utils/index';

export const useLinkOpenButtonState = () => {
  const editor = useEditorRef();
  const selection = useEditorSelection();

  const entry = React.useMemo(
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

  const [element] = entry;

  return {
    element,
  };
};

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
      target: '_blank',
      'aria-label': 'Open link in a new tab',
      onMouseOver: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.stopPropagation();
      },
    },
  };
};

export const LinkOpenButton = createPrimitiveComponent('a')({
  stateHook: useLinkOpenButtonState,
  propsHook: useLinkOpenButton,
});
