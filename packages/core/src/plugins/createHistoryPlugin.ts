import { withHistory } from 'slate-history';
import { WithOverride } from '../types/plugins/PlatePlugin/WithOverride';
import { createPlugin } from '../utils/createPlugin';

/**
 * @see {@link withHistory}
 */
export const createHistoryPlugin = createPlugin({
  key: 'history',
  withOverrides: withHistory as WithOverride,
});
