import { Value } from '../../slate/editor/TEditor';
import { PlateEditor } from '../PlateEditor';
import { HandlerReturnType } from './DOMHandlers';
import { WithPlatePlugin } from './PlatePlugin';

/**
 * Function called whenever a change occurs in the editor.
 * Return `false` to prevent calling the next plugin handler.
 * @see {@link SlatePropsOnChange}
 */
export type OnChange<V extends Value, T = {}, P = {}> = (
  editor: PlateEditor<V, T>,
  plugin: WithPlatePlugin<V, T, P>
) => (value: V) => HandlerReturnType;
