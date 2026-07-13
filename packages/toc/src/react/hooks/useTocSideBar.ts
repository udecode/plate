import React from 'react';

import {
  useEditorRef,
  useEditorScrollElement,
  useEditorSelector,
} from '@platejs/core/react';

import type { Heading } from '../../lib/types';
import type { TocSideBarProps } from '../types';

import { useContentController, useTocController } from '.';
import { getHeadingList } from '../../internal/getHeadingList';
import { checkIn } from '../utils';

type TocSideBarState = {
  activeContentId: string | null;
  editor: ReturnType<typeof useEditorRef>;
  headingList: Heading[];
  mouseInToc: boolean;
  onContentScroll: ReturnType<typeof useContentController>['onContentScroll'];
  open: boolean;
  setMouseInToc: React.Dispatch<React.SetStateAction<boolean>>;
  tocRef: React.RefObject<HTMLElement | null>;
};

export const useTocSideBarState = ({
  open = true,
  rootMargin = '0px 0px 0px 0px',
  topOffset = 0,
}: TocSideBarProps): TocSideBarState => {
  const editor = useEditorRef();
  const headingList = useEditorSelector(getHeadingList, []);
  const container = useEditorScrollElement(editor);

  const tocRef = React.useRef<HTMLElement>(null);

  const [mouseInToc, setMouseInToc] = React.useState(false);

  const isObserve = open && !mouseInToc;

  const { activeContentId, onContentScroll } = useContentController({
    container,
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
    setMouseInToc,
    tocRef,
    onContentScroll,
  };
};

export const useTocSideBar = ({
  editor,
  mouseInToc,
  open,
  setMouseInToc,
  tocRef,
  onContentScroll,
}: TocSideBarState) => {
  const onContentClick = React.useCallback(
    (
      e: React.MouseEvent<HTMLElement, globalThis.MouseEvent>,
      item: Heading,
      behavior?: ScrollBehavior
    ) => {
      e.preventDefault();
      const { id, path } = item;
      const node = editor.read.nodes.get(path)?.[0];

      if (!node) return;

      const el = editor.api.dom.resolveDOMNode(node);

      if (!el) return;

      onContentScroll({ behavior, el, id, path });
    },
    [editor, onContentScroll]
  );

  return {
    navProps: {
      ref: tocRef,
      onMouseEnter: () => {
        if (!mouseInToc && open) {
          setMouseInToc(true);
        }
      },
      onMouseLeave: (
        e: React.MouseEvent<HTMLElement, globalThis.MouseEvent>
      ) => {
        if (open) {
          const isIn = checkIn(e);

          if (isIn !== mouseInToc) {
            setMouseInToc(isIn);
          }
        }
      },
    },
    onContentClick,
  };
};
