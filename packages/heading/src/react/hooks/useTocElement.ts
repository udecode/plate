import React, { useEffect } from 'react';

import { getNode } from '@udecode/plate-common';
import {
  toDOMNode,
  useEditorRef,
  useEditorSelector,
} from '@udecode/plate-common/react';

import type { Heading } from '../../lib/types';

import { getHeadingList } from '../../internal/getHeadingList';
import { heightToTop } from '../utils';

export type useTocElementStateProps = {
  isScroll: boolean;
  scrollContainerSelector?: string;
  topOffset: number;
};

export const useTocElementState = ({
  isScroll,
  scrollContainerSelector,
  topOffset,
}: useTocElementStateProps) => {
  const editor = useEditorRef();

  const headingList = useEditorSelector(getHeadingList, []);

  const containerRef = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = scrollContainerSelector
      ? document.querySelector(scrollContainerSelector)
      : toDOMNode(editor, editor)!;

    if (!container) return;

    containerRef.current = container as HTMLElement;

    return () => {
      containerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
