import type { Value } from '@udecode/slate';

import type { PlateEditor } from '../PlateEditor';
import type { HandlerReturnType } from './DOMHandlers';
import type { PluginOptions, WithPlatePlugin } from './PlatePlugin';

/**
 * Function called whenever a change occurs in the editor. Return `false` to
 * prevent calling the next plugin handler.
 *
 * @see {@link SlatePropsOnChange}
 */
export type OnChange<
  P = PluginOptions,
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
> = (
  editor: E,
  plugin: WithPlatePlugin<P, V, E>
) => (value: V) => HandlerReturnType;
