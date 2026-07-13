import React from 'react';

import { useTocObserver } from './useTocObserver';

type UseTocController = {
  activeId: string;
  isObserve: boolean;
  tocRef: React.RefObject<HTMLElement | null>;
};

export const useTocController = ({
  activeId,
  isObserve,
  tocRef,
}: UseTocController) => {
  const { offset, visible } = useTocObserver({
    activeId,
    isObserve,
    tocRef,
  });

  React.useEffect(() => {
    if (!visible) {
      const tocItemWrapper =
        tocRef.current?.querySelector<HTMLElement>('#toc_wrap');
      const top = (tocItemWrapper?.scrollTop ?? 0) + offset;

      tocItemWrapper?.scrollTo({ behavior: 'instant', top });
    }
  }, [visible, offset, tocRef]);
};
