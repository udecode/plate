/* eslint-disable react-hooks/rules-of-hooks */
import {
  createHistoryPlugin,
  createReactPlugin,
  PlatePlugin,
  PlatePluginComponent,
  PlatePluginOptions,
  SPEditor,
  TEditor,
  withPlate,
} from '@udecode/plate-core';
import { createEditor } from 'slate';
import { ReactEditor } from 'slate-react';
import { createPlateComponents } from './createPlateComponents';
import {
  createPlateOptions,
  DefaultPlatePluginKey,
} from './createPlateOptions';

/**
 * Quick helper to create an editor with plugins.
 * - createEditor
 * - withPlate
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
  plugins?: PlatePlugin<E>[];
  options?: Partial<
    Record<DefaultPlatePluginKey | T, Partial<PlatePluginOptions>>
  >;
  components?: Partial<Record<DefaultPlatePluginKey | T, PlatePluginComponent>>;
} = {}) => {
  return withPlate<E>({
    plugins: [createReactPlugin(), createHistoryPlugin(), ...plugins],
    options: createPlateOptions(options),
    components: createPlateComponents(components),
  })(editor);
};
