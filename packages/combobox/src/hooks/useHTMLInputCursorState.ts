import { RefObject, useCallback, useEffect, useState } from 'react';

import { ComboboxInputCursorState } from '../types';

export const useHTMLInputCursorState = (
  ref: RefObject<HTMLInputElement>
): ComboboxInputCursorState => {
  const [cursorState, setCursorState] = useState<ComboboxInputCursorState>({
    atStart: false,
    atEnd: false,
  });

  const recomputeCursorState = useCallback(() => {
    if (!ref.current) return;

    const { selectionStart, selectionEnd, value } = ref.current;

    setCursorState({
      atStart: selectionStart === 0,
      atEnd: selectionEnd === value.length,
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
