import type { AnyPluginConfig, PluginConfig } from '../plugin/BasePlugin';
import type { AnyEditorPlugin, EditorPlugin } from '../plugin/EditorPlugin';

import { AstPlugin } from './AstPlugin';
import { HistoryPlugin } from './HistoryPlugin';
import { OverridePlugin } from './override/OverridePlugin';
import { ParserPlugin } from './ParserPlugin';
import { type DebugErrorType, type LogLevel, DebugPlugin } from './debug';
import { DOMPlugin } from './dom';
import { HtmlPlugin } from './html';
import { InputRulesPlugin } from './input-rules/internal/InputRulesPlugin';
import { LengthPlugin } from './length';
import {
  type NavigationFeedbackConfig,
  type NavigationFeedbackTransforms,
  NavigationFeedbackPlugin,
} from './navigation-feedback';
import { AffinityPlugin } from './affinity';
import { type NodeIdConfig, NodeIdPlugin } from './node-id/NodeIdPlugin';
import { BaseParagraphPlugin } from './paragraph';
import {
  type PliteExtensionConfig,
  type PliteExtensionTransforms,
  PliteExtensionPlugin,
} from './plite-extension';
import { type ChunkingConfig, ChunkingPlugin } from './chunking/ChunkingPlugin';

export type CorePlugin = AnyEditorPlugin;

export type GetCorePluginsOptions = {
  /** Enable mark/element affinity. */
  affinity?: boolean;
  /** Configure Plite's chunking optimization. */
  chunking?: ChunkingConfig['options'] | boolean;
  /** Specifies the maximum number of characters allowed in the editor. */
  maxLength?: number;
  /** Configure the navigation feedback plugin. */
  navigationFeedback?: NavigationFeedbackConfig['options'] | boolean;
  /** Configure the node id plugin. */
  nodeId?: NodeIdConfig['options'] | boolean;
  /** Override the core plugins using the same key. */
  plugins?: AnyPluginConfig[];
};

export const getCorePlugins = ({
  affinity,
  chunking,
  maxLength,
  navigationFeedback,
  nodeId,
  plugins = [],
}: GetCorePluginsOptions): CorePlugin[] => {
  // Disable nodeId by default in test environment for deterministic tests
  let resolvedNodeId: any = nodeId;
  if (process.env.NODE_ENV === 'test' && nodeId === undefined) {
    resolvedNodeId = false;
  }

  let corePlugins = [
    DebugPlugin as EditorPlugin<DebugConfig>,
    PliteExtensionPlugin,
    DOMPlugin,
    NavigationFeedbackPlugin.configure({
      enabled: navigationFeedback !== false,
      options:
        typeof navigationFeedback === 'boolean'
          ? undefined
          : navigationFeedback,
    }),
    HistoryPlugin,
    InputRulesPlugin,
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
  ] as CorePlugin[];

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

      return customPlugin as CorePlugin;
    }

    return corePlugin as any;
  });

  return corePlugins;
};

export type CorePluginTransforms = PliteExtensionTransforms &
  NavigationFeedbackTransforms;
export type CorePluginApi = PliteExtensionConfig['api'] &
  NavigationFeedbackConfig['api'];

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
