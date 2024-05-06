import { type Value, createPluginFactory } from '@udecode/plate-common/server';

import type { CloudPlugin, PlateCloudEditor } from './types';

import { onDropCloud, onPasteCloud } from './handlers';
import { withCloud } from './withCloud';

export const KEY_CLOUD = 'cloud';

export const createCloudPlugin = createPluginFactory<
  CloudPlugin,
  Value,
  PlateCloudEditor
>({
  handlers: {
    onDrop: (editor) => (e) => onDropCloud(editor, e),
    onPaste: (editor) => (e) => onPasteCloud(editor, e),
  },
  key: KEY_CLOUD,
  withOverrides: withCloud,
});
