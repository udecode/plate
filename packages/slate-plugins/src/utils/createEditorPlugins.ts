/* eslint-disable react-hooks/rules-of-hooks */
import { ReactNode } from 'react';
import {
  SlatePlugin,
  SlatePluginOptions,
  useHistoryPlugin,
  useReactPlugin,
  withSlatePlugins,
} from '@udecode/slate-plugins-core';
import { createEditor, Editor } from 'slate';
import { ReactEditor } from 'slate-react';
import { getSlatePluginsComponents } from './getSlatePluginsComponents';
import {
  getSlatePluginsOptions,
  SlatePluginKey,
} from './getSlatePluginsOptions';

/**
 * Quick helper to create an editor with plugins.
 * - createEditor
 * - withSlatePlugins
 * - useReactPlugin
 * - useHistoryPlugin
 * - options
 * - components
 */
export const createEditorPlugins = <T extends string = string>({
  editor = createEditor(),
  plugins = [],
  options,
  components,
}: {
  editor?: Editor;
  plugins?: SlatePlugin[];
  options?: Partial<Record<SlatePluginKey | T, Partial<SlatePluginOptions>>>;
  components?: Partial<Record<SlatePluginKey | T, ReactNode>>;
} = {}) => {
  return withSlatePlugins<ReactEditor>({
    plugins: [useReactPlugin(), useHistoryPlugin(), ...plugins],
    options: getSlatePluginsOptions(options),
    components: getSlatePluginsComponents(components),
  })(editor);
};
