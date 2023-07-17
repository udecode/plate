import { createPluginFactory, Value } from '@udecode/plate-common';

import { onDropCloud, onPasteCloud } from './handlers';
import { CloudPlugin, PlateCloudEditor } from './types';
import { withCloud } from './withCloud';

export const KEY_CLOUD = 'cloud';

export const createCloudPlugin = createPluginFactory<
  CloudPlugin,
  Value,
  PlateCloudEditor
>({
  key: KEY_CLOUD,
  withOverrides: withCloud,
  handlers: {
    onDrop: (editor) => (e) => onDropCloud(editor, e),
    onPaste: (editor) => (e) => onPasteCloud(editor, e),
  },
});
