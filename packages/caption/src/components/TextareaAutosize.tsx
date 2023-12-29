import React from 'react';
import { useIsomorphicLayoutEffect } from '@udecode/plate-common';
import ReactTextareaAutosize, {
  TextareaAutosizeProps,
} from 'react-textarea-autosize';

/**
 * `<textarea />` component for React which grows with content.
 * @see https://github.com/Andarist/react-textarea-autosize
 * @see https://github.com/Andarist/react-textarea-autosize/issues/337
 */
const TextareaAutosize = React.forwardRef<
  HTMLTextAreaElement,
  TextareaAutosizeProps
>((props, ref) => {
  const [isRerendered, setIsRerendered] = React.useState(false);

  useIsomorphicLayoutEffect(() => setIsRerendered(true), []);

  return isRerendered ? <ReactTextareaAutosize {...props} ref={ref} /> : null;
});
TextareaAutosize.displayName = 'TextareaAutosize';

export { TextareaAutosize };
