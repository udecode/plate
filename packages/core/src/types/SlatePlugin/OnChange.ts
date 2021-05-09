import { SPEditor } from '../SPEditor';
import { TNode } from '../TNode';

/**
 * Function called whenever a change occurs in the editor.
 * Return `false` to prevent calling the next plugin handler.
 * @see {@link SlatePropsOnChange}
 */
export type OnChange<T extends SPEditor = SPEditor> = (
  editor: T
) => (value: TNode[]) => boolean | void;
