import { useEffect, useRef } from 'react';
import { usePopper } from 'react-popper';

type useDropdownControlsProps = {
  open: boolean;
  onClose?: (ev: MouseEvent) => void;
};

export const useDropdownControls = ({
  open,
  onClose,
}: useDropdownControlsProps) => {
  const referenceElementRef = useRef<HTMLDivElement | null>(null);
  const popperElementRef = useRef<HTMLDivElement | null>(null);

  const { styles, update } = usePopper<
    'offset' | 'flip' | 'vertical-positioning'
  >(referenceElementRef.current, popperElementRef.current, {
    placement: 'bottom-start',
    strategy: 'fixed',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 0],
        },
      },
    ],
  });

  useEffect(() => {
    if (open) {
      update && update();
    }
  }, [open, update]);

  useEffect(() => {
    const closeAllExceptSelectedOneListener = (ev: MouseEvent) => {
      if (open) {
        if (
          referenceElementRef.current &&
          ev.composedPath().includes(referenceElementRef.current)
        ) {
          return;
        }
        if (
          popperElementRef.current &&
          ev.composedPath().includes(popperElementRef.current)
        ) {
          return;
        }

        onClose?.(ev);
      }
    };

    document.body.addEventListener(
      'mousedown',
      closeAllExceptSelectedOneListener
    );
    return () => {
      document.body.removeEventListener(
        'mousedown',
        closeAllExceptSelectedOneListener
      );
    };
  }, [onClose, open]);

  return {
    styles: styles.popper,
    referenceElementRef,
    popperElementRef,
  };
};
