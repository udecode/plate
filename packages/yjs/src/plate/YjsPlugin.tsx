import { toPlatePlugin } from '@platejs/core/react';

import { BaseYjsPlugin } from './BaseYjsPlugin';

/** Installs Yjs collaboration in a React Plate editor. */
export const YjsPlugin = toPlatePlugin(BaseYjsPlugin);
