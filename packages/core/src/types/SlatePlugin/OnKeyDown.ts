import { SPEditor } from '../SPEditor';

/**
 * Function called on key down event.
 * To prevent the next handler from running, return false.
 */
export type OnKeyDown<T extends SPEditor = SPEditor> = (
  editor: T
) => (e: any) => boolean | void;
