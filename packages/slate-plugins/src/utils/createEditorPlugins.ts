/* eslint-disable react-hooks/rules-of-hooks */
import { FunctionComponent } from 'react';
import {
  createHistoryPlugin,
  createReactPlugin,
  SlatePlugin,
  SlatePluginOptions,
  SPEditor,
  TEditor,
  withSlatePlugins,
} from '@udecode/slate-plugins-core';
import { createEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import { createSlatePluginsComponents } from './createSlatePluginsComponents';
import {
  createSlatePluginsOptions,
  DefaultSlatePluginKey,
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
export const createEditorPlugins = <
  E extends SPEditor & ReactEditor = SPEditor & ReactEditor,
  T extends string = string
>({
  editor = createEditor(),
  plugins = [],
  options,
  components,
}: {
  editor?: TEditor;
  plugins?: SlatePlugin<E>[];
  options?: Partial<
    Record<DefaultSlatePluginKey | T, Partial<SlatePluginOptions>>
  >;
  components?: Partial<
    Record<DefaultSlatePluginKey | T, FunctionComponent<any>>
  >;
} = {}) => {
  return withSlatePlugins<E>({
    plugins: [createReactPlugin(), createHistoryPlugin(), ...plugins],
    options: createSlatePluginsOptions(options),
    components: createSlatePluginsComponents(components),
  })(editor);
};
