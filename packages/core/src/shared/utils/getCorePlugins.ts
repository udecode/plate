import type { PlatePlugin, PlatePlugins } from '../types';

import {
  DebugPlugin,
  DeserializeAstPlugin,
  DeserializeHtmlPlugin,
  EditorProtocolPlugin,
  EventEditorPlugin,
  HistoryPlugin,
  InlineVoidPlugin,
  InsertDataPlugin,
  LengthPlugin,
  NodeFactoryPlugin,
  PrevSelectionPlugin,
} from '../plugins';

export type GetCorePluginsOptions = {
  /** Specifies the maximum number of characters allowed in the editor. */
  maxLength?: number;
};

export const getCorePlugins = ({
  maxLength,
  reactPlugin,
}: { reactPlugin: PlatePlugin<'react'> } & GetCorePluginsOptions) => {
  const plugins: PlatePlugins = [
    reactPlugin,
    HistoryPlugin,
    DebugPlugin,
    NodeFactoryPlugin,
    EventEditorPlugin,
    InlineVoidPlugin,
    InsertDataPlugin,
    PrevSelectionPlugin,
    maxLength
      ? LengthPlugin.configure({
          maxLength,
        })
      : LengthPlugin,
    DeserializeHtmlPlugin,
    DeserializeAstPlugin,
    EditorProtocolPlugin,
  ];

  return plugins;
};
