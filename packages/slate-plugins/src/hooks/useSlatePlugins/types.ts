import { SlatePlugin } from '@udecode/slate-plugins-core';
import { createEditor } from 'slate';

export type EditorKeyType = string | number;

export type SlatePluginsState = {
  key: EditorKeyType;
  withPlugins: any[];
  plugins: SlatePlugin[];
  editor: typeof createEditor;
  components: React.ElementType[];
  setComponents: (newComponents: SlatePluginsState['components']) => void;
  setPlugins: (newPlugins: SlatePluginsState['plugins']) => void;
  setWithPlugins: (newWithPlugins: SlatePluginsState['withPlugins']) => void;
  setEditor: (newEditor: SlatePluginsState['editor']) => void;
};

export type UseSlatePluginsOptionType = {
  key: EditorKeyType;
  withPlugins?: any[];
  plugins?: SlatePlugin[];
  editor?: typeof createEditor;
  components?: React.ElementType[];
  initialValue?: Node[];
};
