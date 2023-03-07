import { createPluginFactory } from '@udecode/plate-common';
import { onKeyDownAutoformat } from './onKeyDownAutoformat';
import { AutoformatPlugin } from './types';
import { withAutoformat } from './withAutoformat';

export const KEY_AUTOFORMAT = 'autoformat';

/**
 * @see {@link withAutoformat}
 */
export const createAutoformatPlugin = createPluginFactory<AutoformatPlugin>({
  key: KEY_AUTOFORMAT,
  withOverrides: withAutoformat,
  handlers: {
    onKeyDown: onKeyDownAutoformat,
  },
  options: {
    rules: [],
  },
});
