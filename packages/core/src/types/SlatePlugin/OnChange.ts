import { SPEditor } from '../SPEditor';
import { TNode } from '../TNode';

/**
 * Function called whenever a change occurs in the editor.
 * To prevent the next handler from running, return false.
 * @see {@link SlatePropsOnChange}
 */
export type OnChange<T extends SPEditor = SPEditor> = (editor: T) => (value: TNode[]) => boolean | void;
