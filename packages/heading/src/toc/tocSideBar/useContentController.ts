'use client';

import React from 'react';

import { addSelectedRow, useEditorRef } from '@udecode/plate-common';

import type { UseContentController } from '../types';

import { heightToTop } from '../../utils';
import { useContentObserver } from './useContentObserver';

export const useContentController = ({
  containerRef,
  isObserve,
  rootMargin,
  topOffset,
}: UseContentController) => {
  const editor = useEditorRef();
  const [editorContentRef, setEditorContentRef] = React.useState(containerRef);

  const isScroll =
    (editorContentRef.current?.scrollHeight || 0) >
    (editorContentRef.current?.clientHeight || 0);

  const scrollContainer = React.useMemo(() => {
    if (typeof window !== 'object') return;

    return isScroll ? editorContentRef.current : window;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScroll]);

  const [status, setStatus] = React.useState(0);

  const { activeId } = useContentObserver({
    editorContentRef,
    isObserve,
    isScroll,
    rootMargin,
    status,
  });

  const [activeContentId, setActiveContentId] = React.useState(activeId);

  const onContentScroll = (el: HTMLElement, id: string) => {
    setActiveContentId(id);

    if (isScroll) {
      editorContentRef.current?.scrollTo({
        behavior: 'instant',
        top: heightToTop(el, editorContentRef) - topOffset,
      });
    } else {
      const top = heightToTop(el) - topOffset;
      // Note: if behavior === smooth,scrolling the toc then click the title immediately will scroll to the wrong position.It should be a chrome bug.
      window.scrollTo({ behavior: 'instant', top });
    }

    addSelectedRow(editor, id);
  };

  React.useEffect(() => {
    setEditorContentRef(containerRef);
  }, [containerRef]);

  React.useEffect(() => {
    setActiveContentId(activeId);
  }, [activeId]);

  React.useEffect(() => {
    if (!scrollContainer) return;

    const scroll = () => {
      if (isObserve) {
        setStatus(Date.now());
      }
    };

    scrollContainer.addEventListener('scroll', scroll);

    return () => {
      scrollContainer.removeEventListener('scroll', scroll);
    };
  }, [isObserve, scrollContainer]);

  return { activeContentId, onContentScroll };
};
