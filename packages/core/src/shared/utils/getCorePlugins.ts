import { isDefined } from '@udecode/utils';

import {
  DeserializeAstPlugin,
  DeserializeHtmlPlugin,
  EditorProtocolPlugin,
  EventEditorPlugin,
  HistoryPlugin,
  InlineVoidPlugin,
  InsertDataPlugin,
  KEY_DESERIALIZE_AST,
  KEY_DESERIALIZE_HTML,
  KEY_EDITOR_PROTOCOL,
  KEY_EVENT_EDITOR,
  KEY_INLINE_VOID,
  KEY_INSERT_DATA,
  KEY_NODE_FACTORY,
  KEY_PREV_SELECTION,
  LengthPlugin,
  NodeFactoryPlugin,
  type PlateEditor,
  type PlatePlugin,
  type PlatePluginList,
  PrevSelectionPlugin,
} from '../index';

export type GetCorePluginsOptions = {
  /**
   * If `true`, disable all the core plugins. If an object, disable the core
   * plugin properties that are `true` in the object.
   */
  disableCorePlugins?:
    | {
        deserializeAst?: boolean;
        deserializeHtml?: boolean;
        editorProtocol?: boolean;
        eventEditor?: boolean;
        history?: boolean;
        inlineVoid?: boolean;
        insertData?: boolean;
        length?: boolean;
        nodeFactory?: boolean;
        react?: boolean;
        selection?: boolean;
      }
    | boolean;

  /** Specifies the maximum number of characters allowed in the editor. */
  maxLength?: number;
};

export const getCorePlugins = (
  editor: PlateEditor,
  {
    disableCorePlugins,
    maxLength,
    reactPlugin,
  }: { reactPlugin: PlatePlugin<'react'> } & GetCorePluginsOptions
) => {
  const plugins: PlatePluginList = [];

  if (disableCorePlugins !== true) {
    const dcp = disableCorePlugins;

    if (typeof dcp !== 'object' || !dcp?.react) {
      plugins.push((editor?.pluginsByKey?.react as any) ?? reactPlugin);
    }
    if (typeof dcp !== 'object' || !dcp?.history) {
      plugins.push((editor?.pluginsByKey?.history as any) ?? HistoryPlugin);
    }
    if (typeof dcp !== 'object' || !dcp?.nodeFactory) {
      plugins.push(
        (editor?.pluginsByKey?.[KEY_NODE_FACTORY] as any) ?? NodeFactoryPlugin
      );
    }
    if (typeof dcp !== 'object' || !dcp?.eventEditor) {
      plugins.push(
        (editor?.pluginsByKey?.[KEY_EVENT_EDITOR] as any) ?? EventEditorPlugin
      );
    }
    if (typeof dcp !== 'object' || !dcp?.inlineVoid) {
      plugins.push(
        (editor?.pluginsByKey?.[KEY_INLINE_VOID] as any) ?? InlineVoidPlugin
      );
    }
    if (typeof dcp !== 'object' || !dcp?.insertData) {
      plugins.push(
        (editor?.pluginsByKey?.[KEY_INSERT_DATA] as any) ?? InsertDataPlugin
      );
    }
    if (typeof dcp !== 'object' || !dcp?.selection) {
      plugins.push(
        (editor?.pluginsByKey?.[KEY_PREV_SELECTION] as any) ??
          PrevSelectionPlugin
      );
    }
    if ((typeof dcp !== 'object' || !dcp?.length) && isDefined(maxLength)) {
      plugins.push(
        (editor?.pluginsByKey?.[LengthPlugin.key] as any) ??
          LengthPlugin.configure({
            maxLength,
          })
      );
    }
    if (typeof dcp !== 'object' || !dcp?.deserializeHtml) {
      plugins.push(
        (editor?.pluginsByKey?.[KEY_DESERIALIZE_HTML] as any) ??
          DeserializeHtmlPlugin
      );
    }
    if (typeof dcp !== 'object' || !dcp?.deserializeAst) {
      plugins.push(
        (editor?.pluginsByKey?.[KEY_DESERIALIZE_AST] as any) ??
          DeserializeAstPlugin
      );
    }
    if (typeof dcp !== 'object' || !dcp?.editorProtocol) {
      plugins.push(
        (editor?.pluginsByKey?.[KEY_EDITOR_PROTOCOL] as any) ??
          EditorProtocolPlugin
      );
    }
  }

  return plugins;
};
