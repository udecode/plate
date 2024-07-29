import { isDefined } from '@udecode/utils';

import type { PlateProps } from '../client';
import type { PlateEditor, PlatePlugin } from '../shared/types';

import {
  KEY_DESERIALIZE_AST,
  KEY_DESERIALIZE_HTML,
  KEY_EDITOR_PROTOCOL,
  KEY_EVENT_EDITOR,
  KEY_INLINE_VOID,
  KEY_INSERT_DATA,
  KEY_LENGTH,
  KEY_NODE_FACTORY,
  KEY_PREV_SELECTION,
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
} from '../shared/plugins';
import { flattenDeepPlugins } from '../shared/utils/flattenDeepPlugins';
import { overridePluginsByKey } from '../shared/utils/overridePluginsByKey';
import { createReactPlugin } from './createReactPlugin';

export const setPlatePlugins = (
  editor: PlateEditor,
  {
    disableCorePlugins,
    maxLength,
    plugins: _plugins = [],
  }: Pick<PlateProps, 'disableCorePlugins' | 'maxLength' | 'plugins'>
) => {
  let plugins: PlatePlugin[] = [];

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
        return overridePluginsByKey(p as any, plugin.overrideByKey as any);
      });

      editor.plugins = [];
      editor.pluginsByKey = {};

      // flatten again the overrides
      flattenDeepPlugins(editor, newPlugins as any);
    }
  });
};
