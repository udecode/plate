import {
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { ComboboxInputCursorState } from '../types';

export const useHTMLInputCursorState = (
  ref: RefObject<HTMLInputElement>
): ComboboxInputCursorState => {
  const [atStart, setAtStart] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  const recomputeCursorState = useCallback(() => {
    // Wait for events to finish processing
    setTimeout(() => {
      if (!ref.current) return;

      const { selectionEnd, selectionStart, value } = ref.current;
      setAtStart(selectionStart === 0);
      setAtEnd(selectionEnd === value.length);
    });
  }, [ref]);

  useEffect(() => {
    recomputeCursorState();

    const input = ref.current;

    if (!input) return;

    input.addEventListener('input', recomputeCursorState);
    input.addEventListener('selectionchange', recomputeCursorState);

    /**
     * Compat: selectionchange is not supported for <input> except in Firefox,
     * so we add keydown, pointerdown and pointerup as fallbacks (2024-06-14).
     */
    input.addEventListener('keydown', recomputeCursorState);
    input.addEventListener('pointerdown', recomputeCursorState);
    input.addEventListener('pointerup', recomputeCursorState);

    return () => {
      input.removeEventListener('input', recomputeCursorState);
      input.removeEventListener('selectionchange', recomputeCursorState);
      input.removeEventListener('keydown', recomputeCursorState);
      input.removeEventListener('pointerdown', recomputeCursorState);
      input.removeEventListener('pointerup', recomputeCursorState);
    };
  }, [recomputeCursorState, ref]);

  return useMemo(
    () => ({
      atEnd,
      atStart,
    }),
    [atStart, atEnd]
  );
};
