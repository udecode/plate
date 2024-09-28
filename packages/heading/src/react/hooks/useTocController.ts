import React from 'react';

import { useTocObserver } from './useTocObserver';

interface UseTocController {
  activeId: string;
  isObserve: boolean;
  tocRef: React.RefObject<HTMLElement>;
}

export const useTocController = ({
  activeId,
  isObserve,
  tocRef,
}: UseTocController) => {
  const [activeTocId, setActiveTocId] = React.useState('');
  const { offset, visible } = useTocObserver({
    activeId: activeTocId,
    isObserve,
    tocRef,
  });

  React.useEffect(() => {
    if (!visible) {
      const tocItemWrapper = tocRef.current?.querySelector('#toc_wrap');
      const top = (tocItemWrapper?.scrollTop as any) + offset;

      tocItemWrapper?.scrollTo({ behavior: 'instant', top: top });
    }
  }, [visible, offset, tocRef]);

  React.useEffect(() => {
    setActiveTocId(activeId);
  }, [activeId]);
};
