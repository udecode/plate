import React from 'react';

import { NodeApi } from '@udecode/plate';
import {
  useEditorRef,
  useEditorSelector,
  useScrollRef,
} from '@udecode/plate/react';

import type { Heading } from '../../lib/types';
import type { TocSideBarProps } from '../types';

import { useContentController, useTocController } from '.';
import { getHeadingList } from '../../internal/getHeadingList';
import { checkIn } from '../utils';

export const useTocSideBarState = ({
  open = true,
  rootMargin = '0px 0px 0px 0px',
  topOffset = 0,
}: TocSideBarProps) => {
  const editor = useEditorRef();
  const headingList = useEditorSelector(getHeadingList, []);
  const containerRef = useScrollRef();

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
    tocRef,
    onContentScroll,
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
      const node = NodeApi.get(editor, path);

      if (!node) return;

      const el = editor.api.toDOMNode(node);

      if (!el) return;

      onContentScroll({ id, behavior, el });
    },
    [editor, onContentScroll]
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
