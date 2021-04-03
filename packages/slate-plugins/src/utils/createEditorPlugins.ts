/* eslint-disable react-hooks/rules-of-hooks */
import { ReactNode } from 'react';
import {
  createHistoryPlugin,
  createReactPlugin,
  SlatePlugin,
  SlatePluginOptions,
  TEditor,
  withSlatePlugins,
} from '@udecode/slate-plugins-core';
import { createEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import { createSlatePluginsComponents } from './createSlatePluginsComponents';
import {
  createSlatePluginsOptions,
  SlatePluginKey,
} from './createSlatePluginsOptions';

/**
 * Quick helper to create an editor with plugins.
 * - createEditor
 * - withSlatePlugins
 * - createReactPlugin
 * - createHistoryPlugin
 * - options
 * - components
 */
export const createEditorPlugins = <T extends string = string>({
  editor = createEditor(),
  plugins = [],
  options,
  components,
}: {
  editor?: TEditor;
  plugins?: SlatePlugin[];
  options?: Partial<Record<SlatePluginKey | T, Partial<SlatePluginOptions>>>;
  components?: Partial<Record<SlatePluginKey | T, ReactNode>>;
} = {}) => {
  return withSlatePlugins<ReactEditor>({
    plugins: [createReactPlugin(), createHistoryPlugin(), ...plugins],
    options: createSlatePluginsOptions(options),
    components: createSlatePluginsComponents(components),
  })(editor);
};
