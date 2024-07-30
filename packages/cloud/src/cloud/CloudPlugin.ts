import { createPlugin } from '@udecode/plate-common/server';

import type { CloudPluginOptions } from './types';

import { onDropCloud, onPasteCloud } from './handlers';
import { withCloud } from './withCloud';

export const KEY_CLOUD = 'cloud';

export const CloudPlugin = createPlugin<CloudPluginOptions>({
  handlers: {
    // TODO
    onDrop: (editor) => (e) => onDropCloud(editor as any, e),
    // TODO
    onPaste: (editor) => (e) => onPasteCloud(editor as any, e),
  },
  key: KEY_CLOUD,
  withOverrides: withCloud,
});
