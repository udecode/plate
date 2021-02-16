import { Editor } from 'slate';

/**
 * Function used to handle beforeInput events.
 * The return value indicates whether the next handler should run and defaults
 * to true.
 * To prevent the next handler from running return false.
 */
export type OnDOMBeforeInput = (
  event: Event,
  editor: Editor
) => boolean | undefined | void;
