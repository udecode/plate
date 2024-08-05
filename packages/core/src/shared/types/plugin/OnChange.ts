import type { Value } from '@udecode/slate';

import type { HandlerReturnType } from './DOMHandlers';
import type { PlatePluginContext } from './PlatePlugin';

/**
 * Function called whenever a change occurs in the editor. Return `false` to
 * prevent calling the next plugin handler.
 *
 * @see {@link SlatePropsOnChange}
 */
export type OnChange<O = {}, A = {}, T = {}, S = {}> = (
  ctx: { value: Value } & PlatePluginContext<string, O, A, T, S>
) => HandlerReturnType;
