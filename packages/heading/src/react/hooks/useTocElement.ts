import React from 'react';

import { getNode } from '@udecode/plate-common';
import {
  toDOMNode,
  useEditorPlugin,
  useEditorScrollRef,
  useEditorSelector,
} from '@udecode/plate-common/react';

import type { Heading } from '../../lib/types';

import { getHeadingList } from '../../internal/getHeadingList';
import { TocPlugin } from '../TocPlugin';
import { heightToTop } from '../utils';

export const useTocElementState = () => {
  const { editor, getOptions } = useEditorPlugin(TocPlugin);
  const { isScroll, topOffset } = getOptions();

  const headingList = useEditorSelector(getHeadingList, []);

  const containerRef = useEditorScrollRef();

  const onContentScroll = React.useCallback(
    (el: HTMLElement, id: string, behavior: ScrollBehavior = 'instant') => {
      if (!containerRef.current) return;
      if (isScroll) {
        containerRef.current?.scrollTo({
          behavior,
          top: heightToTop(el, containerRef as any) - topOffset,
        });
      } else {
        const top = heightToTop(el) - topOffset;
        window.scrollTo({ behavior, top });
      }

      setTimeout(() => {
        editor
          .getApi({ key: 'blockSelection' })
          .blockSelection?.addSelectedRow?.(id);
      }, 0);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isScroll, topOffset]
  );

  return { editor, headingList, onContentScroll };
};

export const useTocElement = ({
  editor,
  onContentScroll,
}: ReturnType<typeof useTocElementState>) => {
  return {
    props: {
      onClick: (
        e: React.MouseEvent<HTMLElement, globalThis.MouseEvent>,
        item: Heading,
        behavior: ScrollBehavior
      ) => {
        e.preventDefault();
        const { id, path } = item;
        const node = getNode(editor, path);

        if (!node) return;

        const el = toDOMNode(editor, node);

        if (!el) return;

        onContentScroll(el, id, behavior);
      },
    },
  };
};
