import { createPlugin } from '@udecode/plate-common/server';

import type { CloudPluginOptions } from './types';

import { onDropCloud, onPasteCloud } from './handlers';
import { withCloud } from './withCloud';

export const KEY_CLOUD = 'cloud';

export const CloudPlugin = createPlugin<'cloud', CloudPluginOptions>({
  handlers: {
    // TODO
    onDrop: ({ editor, event }) => onDropCloud(editor as any, event),
    // TODO
    onPaste: ({ editor, event }) => onPasteCloud(editor as any, event),
  },
  key: KEY_CLOUD,
  withOverrides: withCloud,
});
