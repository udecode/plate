import { PlateProps } from '../../components/plate/Plate';
import {
  createDeserializeAstPlugin,
  KEY_DESERIALIZE_AST,
} from '../../plugins/createDeserializeAstPlugin';
import {
  createEventEditorPlugin,
  KEY_EVENT_EDITOR,
} from '../../plugins/createEventEditorPlugin';
import { createHistoryPlugin } from '../../plugins/createHistoryPlugin';
import {
  createInlineVoidPlugin,
  KEY_INLINE_VOID,
} from '../../plugins/createInlineVoidPlugin';
import {
  createInsertDataPlugin,
  KEY_INSERT_DATA,
} from '../../plugins/createInsertDataPlugin';
import {
  createPrevSelectionPlugin,
  KEY_PREV_SELECTION,
} from '../../plugins/createPrevSelectionPlugin';
import { createReactPlugin } from '../../plugins/createReactPlugin';
import {
  createDeserializeHtmlPlugin,
  KEY_DESERIALIZE_HTML,
} from '../../plugins/html-deserializer/createDeserializeHtmlPlugin';
import { Value } from '../../slate/editor/TEditor';
import { PlateEditor } from '../../types/plate/PlateEditor';
import { PlatePlugin } from '../../types/plugin/PlatePlugin';
import { flattenDeepPlugins } from './flattenDeepPlugins';
import { overridePluginsByKey } from './overridePluginsByKey';

/**
 * Flatten deep plugins then set editor.plugins and editor.pluginsByKey
 */
export const setPlatePlugins = <V extends Value>(
  editor: PlateEditor<V>,
  {
    disableCorePlugins,
    plugins: _plugins = [],
  }: Pick<PlateProps<V>, 'plugins' | 'disableCorePlugins'>
) => {
  let plugins: PlatePlugin<{}, V, PlateEditor<V>>[] = [];

  if (disableCorePlugins !== true) {
    const dcp = disableCorePlugins;

    if (typeof dcp !== 'object' || !dcp.react) {
      plugins.push((editor.pluginsByKey?.react as any) ?? createReactPlugin());
    }
    if (typeof dcp !== 'object' || !dcp.history) {
      plugins.push(
        (editor.pluginsByKey?.history as any) ?? createHistoryPlugin()
      );
    }
    if (typeof dcp !== 'object' || !dcp.eventEditor) {
      plugins.push(
        (editor.pluginsByKey?.[KEY_EVENT_EDITOR] as any) ??
          createEventEditorPlugin()
      );
    }
    if (typeof dcp !== 'object' || !dcp.inlineVoid) {
      plugins.push(
        (editor.pluginsByKey?.[KEY_INLINE_VOID] as any) ??
          createInlineVoidPlugin()
      );
    }
    if (typeof dcp !== 'object' || !dcp.insertData) {
      plugins.push(
        (editor.pluginsByKey?.[KEY_INSERT_DATA] as any) ??
          createInsertDataPlugin()
      );
    }
    if (typeof dcp !== 'object' || !dcp.selection) {
      plugins.push(
        (editor.pluginsByKey?.[KEY_PREV_SELECTION] as any) ??
          createPrevSelectionPlugin()
      );
    }
    if (typeof dcp !== 'object' || !dcp.deserializeHtml) {
      plugins.push(
        (editor.pluginsByKey?.[KEY_DESERIALIZE_HTML] as any) ??
          createDeserializeHtmlPlugin()
      );
    }
    if (typeof dcp !== 'object' || !dcp.deserializeAst) {
      plugins.push(
        (editor.pluginsByKey?.[KEY_DESERIALIZE_AST] as any) ??
          createDeserializeAstPlugin()
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
