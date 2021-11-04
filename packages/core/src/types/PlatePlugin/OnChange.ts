import { PlateEditor } from '../SPEditor';
import { TNode } from '../TNode';
import { HandlerReturnType } from './DOMHandlers';

/**
 * Function called whenever a change occurs in the editor.
 * Return `false` to prevent calling the next plugin handler.
 * @see {@link SlatePropsOnChange}
 */
export type OnChange<T = {}> = (
  editor: PlateEditor<T>
) => (value: TNode[]) => HandlerReturnType;
