import { toPlatePlugin } from '@platejs/core/react';

import { BaseBlockquotePlugin } from '../lib/BaseBlockquotePlugin';

export const BlockquotePlugin = toPlatePlugin(BaseBlockquotePlugin);
