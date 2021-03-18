import { Editor } from 'slate';

/**
 * Function called on key down event.
 * To prevent the next handler from running, return false.
 */
export type OnKeyDown = (editor: Editor) => (e: any) => boolean | void;
