import { createPluginFactory } from '@udecode/plate-common/server';

import type { AutoformatPlugin } from './types';

import { onKeyDownAutoformat } from './onKeyDownAutoformat';
import { withAutoformat } from './withAutoformat';

export const KEY_AUTOFORMAT = 'autoformat';

/** @see {@link withAutoformat} */
export const createAutoformatPlugin = createPluginFactory<AutoformatPlugin>({
  handlers: {
    onKeyDown: onKeyDownAutoformat,
  },
  key: KEY_AUTOFORMAT,
  options: {
    rules: [],
  },
  withOverrides: withAutoformat,
});
