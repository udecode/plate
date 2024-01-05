import { Value } from '@udecode/slate';
import { isDefined } from '@udecode/utils';

import { PlateProps } from '../components/index';
import {
  createDeserializeAstPlugin,
  createDeserializeHtmlPlugin,
  createEditorProtocolPlugin,
  createEventEditorPlugin,
  createHistoryPlugin,
  createInlineVoidPlugin,
  createInsertDataPlugin,
  createLengthPlugin,
  createNodeFactoryPlugin,
  createPrevSelectionPlugin,
  createReactPlugin,
  KEY_DESERIALIZE_AST,
  KEY_DESERIALIZE_HTML,
  KEY_EDITOR_PROTOCOL,
  KEY_EVENT_EDITOR,
  KEY_INLINE_VOID,
  KEY_INSERT_DATA,
  KEY_LENGTH,
  KEY_NODE_FACTORY,
  KEY_PREV_SELECTION,
} from '../plugins';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugin/PlatePlugin';
import { flattenDeepPlugins } from './flattenDeepPlugins';
import { overridePluginsByKey } from './overridePluginsByKey';

/**
 * Flatten deep plugins then set editor.plugins and editor.pluginsByKey
 */
export const setPlatePlugins = <
  V extends Value = Value,
  E extends PlateEditor<V> = PlateEditor<V>,
>(
  editor: E,
  {
    disableCorePlugins,
    plugins: _plugins = [],
    maxLength,
  }: Pick<PlateProps<V, E>, 'plugins' | 'disableCorePlugins' | 'maxLength'>
) => {
  let plugins: PlatePlugin<{}, V, PlateEditor<V>>[] = [];

  if (disableCorePlugins !== true) {
    const dcp = disableCorePlugins;

    if (typeof dcp !== 'object' || !dcp?.react) {
      plugins.push((editor?.pluginsByKey?.react as any) ?? createReactPlugin());
    }
    if (typeof dcp !== 'object' || !dcp?.history) {
      plugins.push(
        (editor?.pluginsByKey?.history as any) ?? createHistoryPlugin()
      );
    }
    if (typeof dcp !== 'object' || !dcp?.nodeFactory) {
      plugins.push(
        (editor?.pluginsByKey?.[KEY_NODE_FACTORY] as any) ??
          createNodeFactoryPlugin()
      );
    }
    if (typeof dcp !== 'object' || !dcp?.eventEditor) {
      plugins.push(
        (editor?.pluginsByKey?.[KEY_EVENT_EDITOR] as any) ??
          createEventEditorPlugin()
      );
    }
    if (typeof dcp !== 'object' || !dcp?.inlineVoid) {
      plugins.push(
        (editor?.pluginsByKey?.[KEY_INLINE_VOID] as any) ??
          createInlineVoidPlugin()
      );
    }
    if (typeof dcp !== 'object' || !dcp?.insertData) {
      plugins.push(
        (editor?.pluginsByKey?.[KEY_INSERT_DATA] as any) ??
          createInsertDataPlugin()
      );
    }
    if (typeof dcp !== 'object' || !dcp?.selection) {
      plugins.push(
        (editor?.pluginsByKey?.[KEY_PREV_SELECTION] as any) ??
          createPrevSelectionPlugin()
      );
    }
    if ((typeof dcp !== 'object' || !dcp?.length) && isDefined(maxLength)) {
      plugins.push(
        (editor?.pluginsByKey?.[KEY_LENGTH] as any) ??
          createLengthPlugin({
            options: {
              maxLength,
            },
          })
      );
    }
    if (typeof dcp !== 'object' || !dcp?.deserializeHtml) {
      plugins.push(
        (editor?.pluginsByKey?.[KEY_DESERIALIZE_HTML] as any) ??
          createDeserializeHtmlPlugin()
      );
    }
    if (typeof dcp !== 'object' || !dcp?.deserializeAst) {
      plugins.push(
        (editor?.pluginsByKey?.[KEY_DESERIALIZE_AST] as any) ??
          createDeserializeAstPlugin()
      );
    }
    if (typeof dcp !== 'object' || !dcp?.editorProtocol) {
      plugins.push(
        (editor?.pluginsByKey?.[KEY_EDITOR_PROTOCOL] as any) ??
          createEditorProtocolPlugin()
      );
    }
  }

  plugins = [...plugins, ..._plugins] as any;

  editor.plugins = [];
  editor.pluginsByKey = {};

  flattenDeepPlugins(editor, plugins);

  // override all the plugins one by one, so plugin.overrideByKey effects can be overridden by the next plugin
  editor.plugins.forEach((plugin) => {
    if (plugin.overrideByKey) {
      const newPlugins = editor.plugins.map((p) => {
        return overridePluginsByKey<V>(p as any, plugin.overrideByKey as any);
      });

      editor.plugins = [];
      editor.pluginsByKey = {};

      // flatten again the overrides
      flattenDeepPlugins<V>(editor, newPlugins as any);
    }
  });
};
