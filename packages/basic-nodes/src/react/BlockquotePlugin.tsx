import { toPlatePlugin } from 'platejs/react';

import { BaseBlockquotePlugin } from '../lib/BaseBlockquotePlugin';

export const BlockquotePlugin = toPlatePlugin(BaseBlockquotePlugin);
