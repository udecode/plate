import React, { useEffect } from 'react';

import {
  addSelectedRow,
  getNode,
  toDOMNode,
  useEditorRef,
  useEditorSelector,
} from '@udecode/plate-common';

import type { HeadingList } from '../types';

import { getHeadingList, heightToTop } from '../../utils';

export type useTocElementStateProps = {
  isScroll: boolean;
  topOffset: number;
};

export const useTocElementState = ({
  isScroll,
  topOffset,
}: useTocElementStateProps) => {
  const headingList = useEditorSelector(getHeadingList, []);
  const editor = useEditorRef();

  const containerRef = React.useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = toDOMNode(editor, editor);

    if (!container) return;

    containerRef.current = container;

    return () => {
      containerRef.current = null;
    };
  }, [editor]);

  const onContentScroll = React.useCallback(
    (el: HTMLElement, id: string) => {
      if (!containerRef.current) return;
      if (isScroll) {
        containerRef.current?.scrollTo({
          behavior: 'instant',
          top: heightToTop(el, containerRef as any) - topOffset,
        });
      } else {
        const top = heightToTop(el) - topOffset;
        window.scrollTo({ behavior: 'instant', top });
      }

      setTimeout(() => {
        addSelectedRow(editor, id);
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
        item: HeadingList
      ) => {
        e.preventDefault();
        const { id, path } = item;
        const node = getNode(editor, path);

        if (!node) return;

        const el = toDOMNode(editor, node);

        if (!el) return;

        onContentScroll(el, id);
      },
    },
  };
};
