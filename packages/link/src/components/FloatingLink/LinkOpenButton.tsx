import React from 'react';

import { findNode, getPluginType } from '@udecode/plate-common';
import {
  createPrimitiveComponent,
  useEditorRef,
  useEditorSelection,
} from '@udecode/plate-common/react';

import type { TLinkElement } from '../../types';

import { LinkPlugin } from '../../LinkPlugin';
import { getLinkAttributes } from '../../utils/index';

export const useLinkOpenButtonState = () => {
  const editor = useEditorRef();
  const selection = useEditorSelection();

  const entry = React.useMemo(
    () =>
      findNode<TLinkElement>(editor, {
        match: { type: editor.getType(LinkPlugin) },
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
      'aria-label': 'Open link in a new tab',
      onMouseOver: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.stopPropagation();
      },
      target: '_blank',
    },
  };
};

export const LinkOpenButton = createPrimitiveComponent('a')({
  propsHook: useLinkOpenButton,
  stateHook: useLinkOpenButtonState,
});
