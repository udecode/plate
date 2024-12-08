import React from 'react';

interface UseTocObserver {
  activeId: string;
  isObserve: boolean;
  tocRef: React.RefObject<HTMLElement | null>;
}

export const useTocObserver = ({
  activeId,
  isObserve,
  tocRef,
}: UseTocObserver) => {
  const root = tocRef.current;

  const [visible, setVisible] = React.useState<boolean>(true);
  const [offset, setOffset] = React.useState<number>(0);

  const updateOffset = React.useCallback(
    (entries: IntersectionObserverEntry[]) => {
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
    },
    [isObserve, root]
  );

  React.useEffect(() => {
    const observer = new IntersectionObserver(updateOffset, {
      root: root,
    });

    const element = root?.querySelectorAll('#toc_item_active')[0];

    if (element) observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [root, activeId, updateOffset]);

  return { offset, visible };
};
