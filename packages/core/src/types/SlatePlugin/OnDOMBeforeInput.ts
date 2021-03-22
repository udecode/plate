import { Editor } from 'slate';

/**
 * Function used to handle beforeInput events.
 * The return value indicates whether the next handler should run and defaults
 * to true.
 * To prevent the next handler from running return false.
 */
export type OnDOMBeforeInput = (
  editor: Editor
) => (event: Event) => boolean | undefined | void;
