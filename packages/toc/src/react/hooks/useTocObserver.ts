import React from 'react';

type UseTocObserver = {
  activeId: string;
  isObserve: boolean;
  tocRef: React.RefObject<HTMLElement | null>;
};

export const useTocObserver = ({
  activeId,
  isObserve,
  tocRef,
}: UseTocObserver) => {
  const [visible, setVisible] = React.useState<boolean>(true);
  const [offset, setOffset] = React.useState<number>(0);

  React.useEffect(() => {
    // ✅ Access ref inside effect, not during render
    const root = tocRef.current;

    const updateOffset = (entries: IntersectionObserverEntry[]) => {
      if (!isObserve) return;

      const [entry] = entries;
      const { boundingClientRect, intersectionRatio, rootBounds } = entry;

      if (!rootBounds) return;

      const halfHeight = (root?.getBoundingClientRect().height || 0) / 2;
      const isAbove = boundingClientRect.top < rootBounds.top;
      const isBelow = boundingClientRect.bottom > rootBounds.bottom;
      const isVisible = intersectionRatio === 1;

      setVisible(isVisible);

      if (!isVisible) {
        const offset = isAbove
          ? boundingClientRect.top - rootBounds!.top! - halfHeight
          : isBelow
            ? boundingClientRect.bottom - rootBounds!.bottom! + halfHeight
            : 0;

        setOffset(offset);
      }
    };

    const observer = new IntersectionObserver(updateOffset, {
      root,
    });

    const element = root?.querySelectorAll('#toc_item_active')[0];

    if (element) observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [tocRef, activeId, isObserve]);

  return { offset, visible };
};
