import { withReact } from 'slate-react';
import { WithOverride } from '../types/plugins/PlatePlugin/WithOverride';
import { createPlugin } from '../utils/createPlugin';

/**
 * @see {@link withReact}
 */
export const createReactPlugin = createPlugin({
  key: 'react',
  withOverrides: withReact as WithOverride,
});
