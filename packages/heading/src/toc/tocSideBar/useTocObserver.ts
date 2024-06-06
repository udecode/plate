import React from 'react';

interface UseTocObserver {
  activeId: string;
  isObserve: boolean;
  showHeader: boolean;
  tocRef: React.RefObject<HTMLElement>;
}

export const useTocObserver = ({
  activeId,
  isObserve,
  showHeader,
  tocRef,
}: UseTocObserver) => {
  const root = tocRef.current;

  const [visible, setVisible] = React.useState<boolean>(true);
  const [offset, setOffset] = React.useState<number>(0);

  React.useEffect(() => {
    const callback = (entries: IntersectionObserverEntry[]) => {
      if (!isObserve) return;

      const entry = entries[0];
      const isBelow =
        entry.boundingClientRect.bottom > entry.rootBounds!.bottom!;

      const isAbove = entry.boundingClientRect.top < entry.rootBounds!.top!;

      const isVisible = entry.intersectionRatio === 1;

      if (isVisible) {
        setVisible(true);
      } else {
        setVisible(false);

        if (isAbove) {
          setOffset(entry.boundingClientRect.top - entry.rootBounds!.top!);
        }
        if (isBelow) {
          setOffset(
            entry.boundingClientRect.bottom - entry.rootBounds!.bottom!
          );
        }
      }
    };
    const observer = new IntersectionObserver(callback, {
      root: root,
    });

    const element = document.querySelectorAll('#toc_item_active')[0];

    if (element) observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [activeId, root, isObserve, showHeader]);

  return { offset, visible };
};
