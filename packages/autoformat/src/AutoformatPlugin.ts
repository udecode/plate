import { createPlugin } from '@udecode/plate-common';

import type { AutoformatPluginOptions } from './types';

import { onKeyDownAutoformat } from './onKeyDownAutoformat';
import { withAutoformat } from './withAutoformat';

/** @see {@link withAutoformat} */
export const AutoformatPlugin = createPlugin<
  'autoformat',
  AutoformatPluginOptions
>({
  handlers: {
    onKeyDown: onKeyDownAutoformat,
  },
  key: 'autoformat',
  options: {
    rules: [],
  },
  withOverrides: withAutoformat,
});
