import { withHistory } from 'slate-history';
import { WithOverride } from '../types/plugins/PlatePlugin/WithOverride';
import { createPluginFactory } from '../utils/createPluginFactory';

/**
 * @see {@link withHistory}
 */
export const createHistoryPlugin = createPluginFactory({
  key: 'history',
  withOverrides: withHistory as WithOverride,
});
