import React, { forwardRef, useLayoutEffect, useState } from 'react';
import ReactTextareaAutosize, {
  TextareaAutosizeProps,
} from 'react-textarea-autosize';

/**
 * `<textarea />` component for React which grows with content.
 * @see https://github.com/Andarist/react-textarea-autosize
 * @see https://github.com/Andarist/react-textarea-autosize/issues/337
 */
export const TextareaAutosize = forwardRef<
  HTMLTextAreaElement,
  TextareaAutosizeProps
>((props, ref) => {
  const [isRerendered, setIsRerendered] = useState(false);

  useLayoutEffect(() => setIsRerendered(true), []);

  return isRerendered ? <ReactTextareaAutosize {...props} ref={ref} /> : null;
});
