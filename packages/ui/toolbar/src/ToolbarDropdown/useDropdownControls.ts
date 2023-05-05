import { useEffect } from 'react';
import { ExtendedRefs, flip, useFloating } from '@udecode/plate-floating';

type useDropdownControlsProps = {
  open: boolean;
  onClose?: (ev: MouseEvent) => void;
};

const closeAllExceptSelectedOneListener = ({
  open,
  onClose,
  refs,
}: useDropdownControlsProps & { refs: ExtendedRefs<HTMLElement> }) => (
  ev: MouseEvent
) => {
  if (open) {
    const target = ev.target as HTMLElement;
    // TS2339: Property 'contains' does not exist on type 'ReferenceType'
    // if (refs.reference.current?.contains(target)) {
    //   return;
    // }
    if (refs.floating.current?.contains(target)) {
      return;
    }

    onClose?.(ev);
  }
};

export const useDropdownControls = ({
  open,
  onClose,
}: useDropdownControlsProps) => {
  const floatingResult = useFloating<HTMLElement>({
    open,
    strategy: 'fixed',
    placement: 'bottom-start',
    middleware: [flip()],
  });
  const { x, y, refs, strategy } = floatingResult;

  useEffect(() => {
    const listener = closeAllExceptSelectedOneListener({ open, onClose, refs });
    document.body.addEventListener('mousedown', listener);
    return () => {
      document.body.removeEventListener('mousedown', listener);
    };
  }, [onClose, open, refs]);

  return {
    styles: {
      position: strategy,
      top: y ?? 0,
      left: x ?? 0,
      width: 'max-content',
    },
    ...floatingResult,
  };
};
