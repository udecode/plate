import type { AnyPluginConfig, PluginConfig } from '../plugin/BasePlugin';
import type { SlatePlugin } from '../plugin/SlatePlugin';

import { AstPlugin } from './AstPlugin';
import { HistoryPlugin } from './HistoryPlugin';
import { OverridePlugin } from './override/OverridePlugin';
import { ParserPlugin } from './ParserPlugin';
import { type DebugErrorType, type LogLevel, DebugPlugin } from './debug';
import { DOMPlugin } from './dom';
import { HtmlPlugin } from './html';
import { LengthPlugin } from './length';
import { AffinityPlugin } from './affinity';
import { type NodeIdConfig, NodeIdPlugin } from './node-id/NodeIdPlugin';
import { BaseParagraphPlugin } from './paragraph';
import {
  type SlateExtensionConfig,
  SlateExtensionPlugin,
} from './slate-extension';
import { type ChunkingConfig, ChunkingPlugin } from './chunking/ChunkingPlugin';

export type CorePlugin = ReturnType<typeof getCorePlugins>[number];

export type GetCorePluginsOptions = {
  /** Enable mark/element affinity. */
  affinity?: boolean;
  /** Configure Slate's chunking optimization. */
  chunking?: ChunkingConfig['options'] | boolean;
  /** Specifies the maximum number of characters allowed in the editor. */
  maxLength?: number;
  /** Configure the node id plugin. */
  nodeId?: NodeIdConfig['options'] | boolean;
  /** Override the core plugins using the same key. */
  plugins?: AnyPluginConfig[];
};

export const getCorePlugins = ({
  affinity,
  chunking,
  maxLength,
  nodeId,
  plugins = [],
}: GetCorePluginsOptions) => {
  // Disable nodeId by default in test environment for deterministic tests
  let resolvedNodeId: any = nodeId;
  if (process.env.NODE_ENV === 'test' && nodeId === undefined) {
    resolvedNodeId = false;
  }

  let corePlugins = [
    DebugPlugin as SlatePlugin<DebugConfig>,
    SlateExtensionPlugin,
    DOMPlugin,
    HistoryPlugin,
    OverridePlugin,
    ParserPlugin,
    maxLength
      ? LengthPlugin.configure({ options: { maxLength } })
      : LengthPlugin,
    HtmlPlugin,
    AstPlugin,
    NodeIdPlugin.configure({
      enabled: resolvedNodeId !== false,
      options: resolvedNodeId === false ? undefined : resolvedNodeId,
    }),
    AffinityPlugin.configure({ enabled: affinity }),
    BaseParagraphPlugin,
    ChunkingPlugin.configure({
      enabled: chunking !== false,
      options: typeof chunking === 'boolean' ? undefined : chunking,
    }),
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

export type CorePluginTransforms = SlateExtensionConfig['transforms'];
export type CorePluginApi = SlateExtensionConfig['api'];

export type DebugConfig = PluginConfig<
  'debug',
  {
    isProduction: boolean;
    logger: Partial<Record<LogLevel, LogFunction>>;
    logLevel: LogLevel;
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

type LogFunction = (
  message: string,
  type?: DebugErrorType,
  details?: any
) => void;
