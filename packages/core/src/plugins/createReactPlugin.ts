import { withReact } from 'slate-react';
import { WithOverride } from '../types/PlatePlugin/WithOverride';
import { getPlatePluginWithOverrides } from '../utils/getPlatePluginWithOverrides';

/**
 * @see {@link withReact}
 */
export const createReactPlugin = getPlatePluginWithOverrides(
  () => withReact as WithOverride
);
