import { toPlatePlugin } from '@udecode/plate-common/react';

import { BaseYjsPlugin } from '../lib/BaseYjsPlugin';
import { YjsAboveEditable } from './YjsAboveEditable';

/** Enables support for real-time collaboration using Yjs. */
export const YjsPlugin = toPlatePlugin(BaseYjsPlugin, {
  render: {
    aboveEditable: YjsAboveEditable,
  },
});
