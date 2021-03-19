import { Editor, Node } from 'slate';

/**
 * Function called whenever a change occurs in the editor.
 * To prevent the next handler from running, return false.
 * @see {@link SlatePropsOnChange}
 */
export type OnChange = (editor: Editor) => (value: Node[]) => boolean | void;
