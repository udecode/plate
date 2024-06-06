import { type RefObject, useCallback, useEffect, useState } from 'react';

import type { ComboboxInputCursorState } from '../types';

export const useHTMLInputCursorState = (
  ref: RefObject<HTMLInputElement>
): ComboboxInputCursorState => {
  const [cursorState, setCursorState] = useState<ComboboxInputCursorState>({
    atEnd: false,
    atStart: false,
  });

  const recomputeCursorState = useCallback(() => {
    if (!ref.current) return;

    const { selectionEnd, selectionStart, value } = ref.current;

    setCursorState({
      atEnd: selectionEnd === value.length,
      atStart: selectionStart === 0,
    });
  }, [ref]);

  useEffect(() => {
    recomputeCursorState();

    const input = ref.current;

    if (!input) return;

    input.addEventListener('input', recomputeCursorState);
    input.addEventListener('selectionchange', recomputeCursorState);

    return () => {
      input.removeEventListener('input', recomputeCursorState);
      input.removeEventListener('selectionchange', recomputeCursorState);
    };
  }, [recomputeCursorState, ref]);

  return cursorState;
};
