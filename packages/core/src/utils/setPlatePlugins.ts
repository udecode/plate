import { PlateProps } from '../components/Plate';
import {
  createDeserializeAstPlugin,
  KEY_DESERIALIZE_AST,
} from '../plugins/createDeserializeAstPlugin';
import {
  createEventEditorPlugin,
  KEY_EVENT_EDITOR,
} from '../plugins/createEventEditorPlugin';
import { createHistoryPlugin } from '../plugins/createHistoryPlugin';
import {
  createInlineVoidPlugin,
  KEY_INLINE_VOID,
} from '../plugins/createInlineVoidPlugin';
import {
  createInsertDataPlugin,
  KEY_INSERT_DATA,
} from '../plugins/createInsertDataPlugin';
import { createReactPlugin } from '../plugins/createReactPlugin';
import {
  createDeserializeHtmlPlugin,
  KEY_DESERIALIZE_HTML,
} from '../plugins/html-deserializer/createDeserializeHtmlPlugin';
import { getPlateActions } from '../stores/plate/platesStore';
import { PlateEditor } from '../types/PlateEditor';
import { PlatePlugin } from '../types/plugins/PlatePlugin';
import { flattenDeepPlugins } from './flattenDeepPlugins';
import { overridePluginsByKey } from './overridePluginsByKey';

/**
 * Flatten deep plugins then set editor.plugins and editor.pluginsByKey
 */
export const setPlatePlugins = <T = {}>(
  editor: PlateEditor<T>,
  {
    disableCorePlugins,
    plugins: _plugins = [],
  }: Pick<PlateProps<T>, 'plugins' | 'disableCorePlugins'>
) => {
  let plugins: PlatePlugin<T>[] = [];

  if (disableCorePlugins !== true) {
    const dcp = disableCorePlugins;

    if (typeof dcp !== 'object' || !dcp.react) {
      plugins.push(editor.pluginsByKey?.react ?? createReactPlugin());
    }
    if (typeof dcp !== 'object' || !dcp.history) {
      plugins.push(editor.pluginsByKey?.history ?? createHistoryPlugin());
    }
    if (typeof dcp !== 'object' || !dcp.eventEditor) {
      plugins.push(
        editor.pluginsByKey?.[KEY_EVENT_EDITOR] ?? createEventEditorPlugin()
      );
    }
    if (typeof dcp !== 'object' || !dcp.inlineVoid) {
      plugins.push(
        editor.pluginsByKey?.[KEY_INLINE_VOID] ?? createInlineVoidPlugin()
      );
    }
    if (typeof dcp !== 'object' || !dcp.insertData) {
      plugins.push(
        editor.pluginsByKey?.[KEY_INSERT_DATA] ?? createInsertDataPlugin()
      );
    }
    if (typeof dcp !== 'object' || !dcp.deserializeHtml) {
      plugins.push(
        editor.pluginsByKey?.[KEY_DESERIALIZE_HTML] ??
          createDeserializeHtmlPlugin()
      );
    }
    if (typeof dcp !== 'object' || !dcp.deserializeAst) {
      plugins.push(
        editor.pluginsByKey?.[KEY_DESERIALIZE_AST] ??
          createDeserializeAstPlugin()
      );
    }
  }

  plugins = [...plugins, ..._plugins];

  editor.plugins = [];
  editor.pluginsByKey = {};

  flattenDeepPlugins(editor, plugins);

  // override all the plugins one by one, so plugin.overrideByKey effects can be overridden by the next plugin
  editor.plugins.forEach((plugin) => {
    if (plugin.overrideByKey) {
      const newPlugins = editor.plugins.map((p) => {
        return overridePluginsByKey<T, {}>(p, plugin.overrideByKey as any);
      });

      editor.plugins = [];
      editor.pluginsByKey = {};

      // flatten again the overrides
      flattenDeepPlugins(editor, newPlugins);
    }
  });

  getPlateActions(editor.id).incrementKey('keyPlugins');
};
