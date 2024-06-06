import React from 'react';

import {
  getNode,
  toDOMNode,
  useEditorRef,
  useEditorSelector,
} from '@udecode/plate-common';

import type { HeadingList, TocSideBarProps } from '../types';

import { useContentController, useTocController } from '.';
import { checkIn, getHeadingList } from '../../utils';

export const useTocSideBarState = ({
  containerRef,
  onOpenChange,
  open = true,
  rootMargin = '0px 0px 0px 0px',
  showHeader = true,
  style,
  topOffset = 0,
}: TocSideBarProps) => {
  const editor = useEditorRef();
  const headingList = useEditorSelector(getHeadingList, []);

  const tocRef = React.useRef<HTMLElement>(null);

  const [mouseInToc, setMouseInToc] = React.useState(false);

  const [isObserve, setIsObserve] = React.useState(open);

  const { activeContentId, onContentScroll } = useContentController({
    containerRef,
    isObserve,
    rootMargin,
    topOffset,
  });

  useTocController({
    activeId: activeContentId,
    isObserve,
    showHeader,
    tocRef,
  });

  return {
    activeContentId,
    editor,
    headingList,
    mouseInToc,
    onContentScroll,
    onOpenChange,
    open,
    setIsObserve,
    setMouseInToc,
    showHeader,
    style,
    tocRef,
  };
};

export const useTocSideBar = ({
  editor,
  mouseInToc,
  onContentScroll,
  open,
  setIsObserve,
  setMouseInToc,
  tocRef,
}: ReturnType<typeof useTocSideBarState>) => {
  React.useEffect(() => {
    if (mouseInToc) {
      setIsObserve(false);
    } else {
      setIsObserve(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mouseInToc]);

  const onConentClick = React.useCallback(
    (
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    navProps: {
      onMouseEnter: () => {
        !mouseInToc && open && setMouseInToc(true);
      },
      onMouseLeave: (
        e: React.MouseEvent<HTMLElement, globalThis.MouseEvent>
      ) => {
        if (open) {
          const isIn = checkIn(e);
          isIn !== mouseInToc && setMouseInToc(isIn);
        }
      },
      ref: tocRef,
    },
    onConentClick,
  };
};
