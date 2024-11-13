import { type PluginConfig, createTSlatePlugin } from '@udecode/plate-common';
import { focusEditor } from '@udecode/plate-common/react';

export type MediaFloatingConfig = PluginConfig<
  'mediaFloating',
  {
    isOpen: boolean;
    url: string;
  }
>;

export const BaseMediaFloatingPlugin = createTSlatePlugin<MediaFloatingConfig>({
  key: 'mediaFloating',
  options: {
    isOpen: false,
    url: '',
  },
}).extendApi(({ editor, setOptions }) => ({
  hide: () => {
    setOptions({ isOpen: false, url: '' });
    focusEditor(editor);
  },
}));
