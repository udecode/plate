import { PlateEditor } from '../../PlateEditor';
import { TNode } from '../../slate/TNode';
import { HandlerReturnType } from './DOMHandlers';
import { PlatePlugin } from './PlatePlugin';

/**
 * Function called whenever a change occurs in the editor.
 * Return `false` to prevent calling the next plugin handler.
 * @see {@link SlatePropsOnChange}
 */
export type OnChange<T = {}, P = {}> = (
  editor: PlateEditor<T>,
  plugin: PlatePlugin<T, P>
) => (value: TNode[]) => HandlerReturnType;
