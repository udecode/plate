import type { AnyPluginConfig, PluginConfig } from '../plugin/BasePlugin';
import type { SlatePlugin } from '../plugin/SlatePlugin';

import {
  createSlatePlugin,
  createTSlatePlugin,
} from '../plugin/createSlatePlugin';
import { AstPlugin } from './AstPlugin';
import { DOMPlugin } from './DOMPlugin';
import { HistoryPlugin } from './HistoryPlugin';
import { InlineVoidPlugin } from './InlineVoidPlugin';
import { ParserPlugin } from './ParserPlugin';
import { type DebugErrorType, DebugPlugin, type LogLevel } from './debug';
import { SlateNextPlugin } from './editor-protocol';
import { HtmlPlugin } from './html';
import { LengthPlugin } from './length';
import { ParagraphPlugin } from './paragraph';

// Somehow needed to avoid cyclic dependency
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _ = () => {
  createSlatePlugin();
  createTSlatePlugin();
};

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
    DebugPlugin as SlatePlugin<DebugConfig>,
    SlateNextPlugin,
    DOMPlugin,
    HistoryPlugin,
    InlineVoidPlugin,
    ParserPlugin,
    maxLength
      ? LengthPlugin.configure({
          options: { maxLength },
        })
      : LengthPlugin,
    HtmlPlugin,
    AstPlugin,
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

type LogFunction = (
  message: string,
  type?: DebugErrorType,
  details?: any
) => void;

export type DebugConfig = PluginConfig<
  'debug',
  {
    isProduction: boolean;
    logLevel: LogLevel;
    logger: Partial<Record<LogLevel, LogFunction>>;
    throwErrors: boolean;
  },
  {
    debug: {
      error: (
        message: string | unknown,
        type?: DebugErrorType,
        details?: any
      ) => void;
      info: (message: string, type?: DebugErrorType, details?: any) => void;
      log: (message: string, type?: DebugErrorType, details?: any) => void;
      warn: (message: string, type?: DebugErrorType, details?: any) => void;
    };
  }
>;

export type LengthConfig = PluginConfig<
  'length',
  {
    maxLength: number;
  }
>;

export interface ToggleBlockOptions {
  /** The default block type to revert to when untoggling. Defaults to paragraph. */
  defaultType?: string;

  /** The block type to apply or toggle. */
  type?: string;
}
