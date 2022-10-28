import { createPluginFactory, Value } from '@udecode/plate-core';
import { onDrop, onPaste } from './handlers';
import { CloudEditor, CloudPlugin } from './types';
import { withCloudOverrides } from './withCloudOverrides';

export const createCloudPlugin = createPluginFactory<
  CloudPlugin,
  Value,
  CloudEditor<Value>
>({
  key: 'cloud',
  withOverrides: withCloudOverrides,
  handlers: {
    onDrop: (editor) => (e) => onDrop(editor, e),
    onPaste: (editor) => (e) => onPaste(editor, e),
  },
});
