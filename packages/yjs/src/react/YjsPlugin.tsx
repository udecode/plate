import { toPlatePlugin } from '@platejs/core/react';

import { BaseYjsPlugin } from '../lib/BaseYjsPlugin';

/** Installs Yjs collaboration in a React Plate editor. */
export const YjsPlugin = toPlatePlugin(BaseYjsPlugin);
