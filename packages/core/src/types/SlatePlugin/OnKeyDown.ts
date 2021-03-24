import { SPEditor } from '../SPEditor';

/**
 * Function called on key down event.
 * To prevent the next handler from running, return false.
 */
export type OnKeyDown = (editor: SPEditor) => (e: any) => boolean | void;
