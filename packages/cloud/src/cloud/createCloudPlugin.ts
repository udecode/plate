import { createPluginFactory, Value } from '@udecode/plate-core';
import { onDropCloud, onPasteCloud } from './handlers';
import { CloudEditor, CloudPlugin } from './types';
import { withCloudOverrides } from './withCloudOverrides';

export const KEY_CLOUD = 'cloud';

export const createCloudPlugin = createPluginFactory<
  CloudPlugin,
  Value,
  CloudEditor<Value>
>({
  key: KEY_CLOUD,
  withOverrides: withCloudOverrides,
  handlers: {
    onDrop: (editor) => (e) => onDropCloud(editor, e),
    onPaste: (editor) => (e) => onPasteCloud(editor, e),
  },
});
