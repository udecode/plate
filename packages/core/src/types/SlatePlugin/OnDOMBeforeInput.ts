import { SPEditor } from '../SPEditor';

/**
 * Function used to handle beforeInput events.
 * To prevent the next handler from running return false.
 */
export type OnDOMBeforeInput<T extends SPEditor = SPEditor> = (
  editor: T
) => (event: Event) => boolean | undefined | void;
