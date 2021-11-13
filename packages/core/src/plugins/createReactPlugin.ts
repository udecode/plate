import { withReact } from 'slate-react';
import { WithOverride } from '../types/plugins/PlatePlugin/WithOverride';
import { createPluginFactory } from '../utils/createPluginFactory';

/**
 * @see {@link withReact}
 */
export const createReactPlugin = createPluginFactory({
  key: 'react',
  withOverrides: withReact as WithOverride,
});
