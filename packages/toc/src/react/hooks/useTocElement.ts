import React from 'react';

import { type Path, NodeApi } from 'platejs';
import {
  useEditorPlugin,
  useEditorSelector,
  useScrollRef,
} from 'platejs/react';

import type { Heading } from '../../lib/types';

import { getHeadingList } from '../../internal/getHeadingList';
import { TocPlugin } from '../TocPlugin';
import { useContentController } from './useContentController';

export const useTocElementState = () => {
  const { editor, getOptions } = useEditorPlugin(TocPlugin);
  const { topOffset } = getOptions();

  const headingList = useEditorSelector(getHeadingList, []);

  const containerRef = useScrollRef();

  const { activeContentId, onContentScroll } = useContentController({
    containerRef,
    isObserve: true,
    rootMargin: '0px 0px 0px 0px',
    topOffset,
  });

  const onHeadingScroll = React.useCallback(
    (
      el: HTMLElement,
      id: string,
      behavior: ScrollBehavior = 'instant',
      path?: Path
    ) => {
      onContentScroll({
        behavior,
        el,
        id,
        path,
      });
    },
    [onContentScroll]
  );

  return {
    activeContentId,
    editor,
    headingList,
    onContentScroll: onHeadingScroll,
  };
};

export const useTocElement = ({
  editor,
  onContentScroll,
}: ReturnType<typeof useTocElementState>) => ({
  props: {
    onClick: (
      e: React.MouseEvent<HTMLElement, globalThis.MouseEvent>,
      item: Heading,
      behavior: ScrollBehavior
    ) => {
      e.preventDefault();
      const { id, path } = item;
      const node = NodeApi.get(editor, path);

      if (!node) return;

      const el = editor.api.toDOMNode(node);

      if (!el) return;

      onContentScroll(el, id, behavior, path);
    },
  },
});
