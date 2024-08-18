import type { AnyPluginConfig } from '../plugin/BasePlugin';

import { DOMPlugin } from './DOMPlugin';
import { DeserializeAstPlugin } from './DeserializeAstPlugin';
import { HistoryPlugin } from './HistoryPlugin';
import { InlineVoidPlugin } from './InlineVoidPlugin';
import { InsertDataPlugin } from './InsertDataPlugin';
import { DebugPlugin } from './debug/DebugPlugin';
import { SlateNextPlugin } from './editor-protocol/SlateNextPlugin';
import { DeserializeHtmlPlugin } from './html-deserializer';
import { LengthPlugin } from './length';
import { ParagraphPlugin } from './paragraph';
import { PlateApiPlugin } from './plate-api/PlateApiPlugin';

export type CorePlugin = ReturnType<typeof getCorePlugins>[number];

export type GetCorePluginsOptions = {
  /** Specifies the maximum number of characters allowed in the editor. */
  maxLength?: number;

  /** Override the core plugins using the same key. */
  plugins?: AnyPluginConfig[];
};

export const getCorePlugins = ({
  maxLength,
  plugins = [],
}: GetCorePluginsOptions) => {
  let corePlugins = [
    DebugPlugin,
    SlateNextPlugin,
    DOMPlugin,
    HistoryPlugin,
    PlateApiPlugin,
    InlineVoidPlugin,
    InsertDataPlugin,
    maxLength
      ? LengthPlugin.configure({
          options: { maxLength },
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
  corePlugins = corePlugins.map((corePlugin) => {
    const customPlugin = customPluginsMap.get(corePlugin.key);

    if (customPlugin) {
      // Remove the custom plugin from the plugins array
      const index = plugins.findIndex((p) => p.key === corePlugin.key);

      if (index !== -1) {
        plugins.splice(index, 1);
      }

      return customPlugin;
    }

    return corePlugin as any;
  });

  return corePlugins;
};
