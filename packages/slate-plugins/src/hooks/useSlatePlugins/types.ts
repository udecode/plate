import { SlatePlugin } from '@udecode/slate-plugins-core';
import { createEditor } from 'slate';

export type SlatePluginStateOptions = {
  key?: string;
  withPlugins: any[];
  plugins: SlatePlugin[];
  editor: typeof createEditor;
  components: React.ElementType[];
  setComponents: (newComponents: SlatePluginStateOptions['components']) => void;
  setPlugins: (newPlugins: SlatePluginStateOptions['plugins']) => void;
  setWithPlugins: (
    newWithPlugins: SlatePluginStateOptions['withPlugins']
  ) => void;
  setEditor: (newEditor: SlatePluginStateOptions['editor']) => void;
};

export type SlatePluginsState = SlatePluginStateOptions;

export type UseSlatePluginsOptionType = {
  key?: string;
  withPlugins?: any[];
  plugins?: SlatePlugin[];
  editor?: typeof createEditor;
  components?: React.ElementType[];
  initialValue?: Node[];
};
