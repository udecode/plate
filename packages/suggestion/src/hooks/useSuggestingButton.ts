import { MouseEventHandler, useCallback } from 'react';
import { HTMLPropsAs } from '@udecode/plate-core';
import { useSetIsSuggesting } from '../store/index';

export const useSuggestingButton = (
  props: HTMLPropsAs<'span'>
): HTMLPropsAs<'span'> => {
  const setIsSuggesting = useSetIsSuggesting();

  const onMouseDown = useCallback<MouseEventHandler<HTMLSpanElement>>(
    (event) => {
      event.preventDefault();

      setIsSuggesting(true);
    },
    [setIsSuggesting]
  );

  return { onMouseDown, ...props };
};
