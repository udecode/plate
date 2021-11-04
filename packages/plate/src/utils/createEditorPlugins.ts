/* eslint-disable react-hooks/rules-of-hooks */
import {
  createHistoryPlugin,
  createReactPlugin,
  PlateEditor,
  PlatePlugin,
  PlatePluginComponent,
  PlatePluginOptions,
  withPlate,
} from '@udecode/plate-core';
import { createEditor } from 'slate';
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
export const createEditorPlugins = <T extends string = string>({
  editor = createEditor() as any,
  plugins = [],
  options,
  components,
}: {
  editor?: PlateEditor;
  plugins?: PlatePlugin[];
  options?: Partial<
    Record<DefaultPlatePluginKey | T, Partial<PlatePluginOptions>>
  >;
  components?: Partial<Record<DefaultPlatePluginKey | T, PlatePluginComponent>>;
} = {}) => {
  return withPlate({
    plugins: [createReactPlugin(), createHistoryPlugin(), ...plugins],
    options: createPlateOptions(options),
    components: createPlateComponents(components),
  })(editor);
};
