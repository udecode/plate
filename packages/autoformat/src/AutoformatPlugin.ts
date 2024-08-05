import { createPlugin } from '@udecode/plate-common/server';

import type { AutoformatPluginOptions } from './types';

import { onKeyDownAutoformat } from './onKeyDownAutoformat';
import { withAutoformat } from './withAutoformat';

export const KEY_AUTOFORMAT = 'autoformat';

/** @see {@link withAutoformat} */
export const AutoformatPlugin = createPlugin<
  'autoformat',
  AutoformatPluginOptions
>({
  handlers: {
    onKeyDown: onKeyDownAutoformat,
  },
  key: KEY_AUTOFORMAT,
  options: {
    rules: [],
  },
  withOverrides: withAutoformat,
});
