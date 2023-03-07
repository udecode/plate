import { Value } from '@udecode/slate';
import { PlateEditor } from '../PlateEditor';
import { HandlerReturnType } from './DOMHandlers';
import { PluginOptions, WithPlatePlugin } from './PlatePlugin';

/**
 * Function called whenever a change occurs in the editor.
 * Return `false` to prevent calling the next plugin handler.
 * @see {@link SlatePropsOnChange}
 */
export type OnChange<
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>
> = (
  editor: E,
  plugin: WithPlatePlugin<P, V, E>
) => (value: V) => HandlerReturnType;
