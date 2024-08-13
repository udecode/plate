import type { AnyPlatePlugin } from '../plugin/types/PlatePlugin';

import { DOMPlugin } from './DOMPlugin';
import { DeserializeAstPlugin } from './DeserializeAstPlugin';
import { HistoryPlugin } from './HistoryPlugin';
import { InlineVoidPlugin } from './InlineVoidPlugin';
import { InsertDataPlugin } from './InsertDataPlugin';
import { PlateApiPlugin } from './PlateApiPlugin';
import { DebugPlugin } from './debug/DebugPlugin';
import { SlateNextPlugin } from './editor-protocol/SlateNextPlugin';
import { EventEditorPlugin } from './event-editor';
import { DeserializeHtmlPlugin } from './html-deserializer';
import { LengthPlugin } from './length/LengthPlugin';
import { ParagraphPlugin } from './paragraph';

export type CorePlugin = ReturnType<typeof getCorePlugins>[number];

export type GetCorePluginsOptions = {
  /** Specifies the maximum number of characters allowed in the editor. */
  maxLength?: number;

  /** Override the core plugins using the same key. */
  plugins?: AnyPlatePlugin[];
};

export const getCorePlugins = ({
  maxLength,
  plugins = [],
}: GetCorePluginsOptions) => {
  const corePlugins = [
    DebugPlugin,
    SlateNextPlugin,
    DOMPlugin,
    HistoryPlugin,
    PlateApiPlugin,
    InlineVoidPlugin,
    InsertDataPlugin,
    EventEditorPlugin,
    maxLength
      ? LengthPlugin.configure({
          maxLength,
        })
      : LengthPlugin,
    DeserializeHtmlPlugin,
    DeserializeAstPlugin,
    ParagraphPlugin,
  ];

  // Create a map for quick lookup of custom plugins
  const customPluginsMap = new Map(
    plugins.map((plugin) => [plugin.key, plugin])
  );

  // Replace core plugins with custom plugins if they exist and remove them from plugins
  return corePlugins.map((corePlugin) => {
    const customPlugin = customPluginsMap.get(corePlugin.key);

    if (customPlugin) {
      // Remove the custom plugin from the plugins array
      const index = plugins.findIndex((p) => p.key === corePlugin.key);

      if (index !== -1) {
        plugins.splice(index, 1);
      }

      return customPlugin;
    }

    return corePlugin;
  });
};
