import { toPlatePlugin } from '@udecode/plate-common/react';

import { BaseAutoformatPlugin } from '../lib/BaseAutoformatPlugin';
import { onKeyDownAutoformat } from './onKeyDownAutoformat';

export const AutoformatPlugin = toPlatePlugin(BaseAutoformatPlugin, {
  handlers: {
    onKeyDown: onKeyDownAutoformat,
  },
});
