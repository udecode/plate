'use client';

import React from 'react';

import {
  type NavigationFeedbackConfig,
  type PlateEditor,
  useEditor,
} from '@platejs/core/react';
import type { Path, Value } from '@platejs/plite';

import type { UseContentController } from '../types';

import { heightToTop } from '../utils';
import { useContentObserver } from './useContentObserver';

export const useContentController = ({
  container,
  isObserve,
  rootMargin,
  topOffset,
}: UseContentController) => {
  const editor = useEditor<PlateEditor<Value, NavigationFeedbackConfig>>();

  const isScroll =
    (container?.scrollHeight || 0) > (container?.clientHeight || 0);

  const scrollContainer =
    typeof window === 'object' ? (isScroll ? container : window) : undefined;

  const [status, setStatus] = React.useState(0);

  const { activeId } = useContentObserver({
    editorContent: container,
    isObserve,
    isScroll,
    rootMargin,
    status,
  });

  const [selectedContent, setSelectedContent] = React.useState<{
    id: string;
    observedId: string;
  }>();
  const activeContentId =
    selectedContent?.observedId === activeId ? selectedContent.id : activeId;

  const onContentScroll = React.useCallback(
    ({
      behavior = 'instant',
      el,
      id,
      path,
    }: {
      behavior?: ScrollBehavior;
      el: HTMLElement;
      id: string;
      path?: Path;
    }) => {
      setSelectedContent({ id, observedId: activeId });

      if (isScroll) {
        container?.scrollTo({
          behavior,
          top: heightToTop(el, container) - topOffset,
        });
      } else {
        const top = heightToTop(el) - topOffset;

        window.scrollTo({ behavior, top });
      }

      if (path) {
        editor.update.navigation.flashTarget({
          target: {
            path,
            type: 'node',
          },
        });
      }
    },
    [activeId, container, editor, isScroll, topOffset]
  );

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
