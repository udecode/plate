import React from 'react';

import { getNode } from '@udecode/plate-common';
import {
  toDOMNode,
  useEditorRef,
  useEditorSelector,
} from '@udecode/plate-common/react';

import type { Heading } from '../../lib/types';
import type { TocSideBarProps } from '../types';

import { useContentController, useTocController } from '.';
import { getHeadingList } from '../../internal/getHeadingList';
import { checkIn } from '../utils';

export const useTocSideBarState = ({
  containerRef,
  open = true,
  rootMargin = '0px 0px 0px 0px',
  showHeader = true,
  style,
  topOffset = 0,
  onOpenChange,
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
    open,
    setIsObserve,
    setMouseInToc,
    showHeader,
    style,
    tocRef,
    onContentScroll,
    onOpenChange,
  };
};

export const useTocSideBar = ({
  editor,
  mouseInToc,
  open,
  setIsObserve,
  setMouseInToc,
  tocRef,
  onContentScroll,
}: ReturnType<typeof useTocSideBarState>) => {
  React.useEffect(() => {
    if (mouseInToc) {
      setIsObserve(false);
    } else {
      setIsObserve(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mouseInToc]);

  const onContentClick = React.useCallback(
    (
      e: React.MouseEvent<HTMLElement, globalThis.MouseEvent>,
      item: Heading,
      behavior?: ScrollBehavior
    ) => {
      e.preventDefault();
      const { id, path } = item;
      const node = getNode(editor, path);

      if (!node) return;

      const el = toDOMNode(editor, node);

      if (!el) return;

      onContentScroll({ id, behavior, el });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    navProps: {
      ref: tocRef,
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
    },
    onContentClick,
  };
};
