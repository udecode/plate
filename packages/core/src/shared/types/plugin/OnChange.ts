import type { Value } from '@udecode/slate';

import type { PlateEditor } from '../PlateEditor';
import type { HandlerReturnType } from './DOMHandlers';
import type { PlatePlugin } from './PlatePlugin';

/**
 * Function called whenever a change occurs in the editor. Return `false` to
 * prevent calling the next plugin handler.
 *
 * @see {@link SlatePropsOnChange}
 */
export type OnChange<O = {}, T = {}, Q = {}, S = {}> = (
  editor: PlateEditor,
  plugin: PlatePlugin<O, T, Q, S>
) => (value: Value) => HandlerReturnType;
