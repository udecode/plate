import type { PluginConfig } from '../plugin/PluginConfig';
import type { BasePluginInput } from '../editor/pluginRuntimeTypes';
import type { BasePlugin, InferConfig } from '../plugin/BasePlugin';
import type { ReactApi } from '@platejs/plite-react';
import type { HistoryExtensionTypes } from '@platejs/plite-history';

import { HistoryPlugin } from './HistoryPlugin';
import { OverridePlugin } from './override/OverridePlugin';
import { ParserPlugin } from './ParserPlugin';
import { type DebugErrorType, type LogLevel, DebugPlugin } from './debug';
import { type DomConfig, DOMPlugin } from './dom';
import { type ElementStateConfig, ElementStatePlugin } from './element-state';
import { HtmlPlugin } from './html';
import { InputRulesPlugin } from './input-rules/internal/InputRulesPlugin';
import { AffinityPlugin } from './affinity';
import {
  type NodeIdConfig,
  type NodeIdOptions,
  NodeIdPlugin,
} from './node-id/NodeIdPlugin';
import { BaseParagraphPlugin } from './paragraph';

export type CorePlugin = CorePluginConfig;

export type CorePluginConfig =
  | InferConfig<typeof AffinityPlugin>
  | DebugConfig
  | DomConfig
  | ElementStateConfig
  | NodeIdConfig
  | InferConfig<typeof BaseParagraphPlugin>
  | PluginConfig<
      'history',
      {},
      {},
      HistoryExtensionTypes['tx'],
      {},
      HistoryExtensionTypes['state']
    >
  | PluginConfig<'html'>
  | PluginConfig<'inputRules'>
  | PluginConfig<'override'>
  | PluginConfig<'parser'>;

export type GetCorePluginsOptions = {
  /** Enable mark/element affinity. */
  affinity?: boolean;
  /** Configure the node id plugin. */
  nodeId?: NodeIdOptions | boolean;
  /** Override the core plugins using the same key. */
  plugins?: BasePluginInput[];
};

export const getCorePlugins = ({
  affinity,
  nodeId,
  plugins = [],
}: GetCorePluginsOptions): BasePluginInput[] => {
  const resolvedNodeId =
    process.env.NODE_ENV === 'test' && nodeId === undefined
      ? ({
          initialValueIds: false,
          match: () => false,
        } satisfies NodeIdOptions)
      : nodeId;

  const corePlugins = [
    DebugPlugin as BasePlugin<DebugConfig>,
    ElementStatePlugin,
    DOMPlugin,
    HistoryPlugin,
    InputRulesPlugin,
    OverridePlugin,
    ParserPlugin,
    HtmlPlugin,
    NodeIdPlugin.configure(
      typeof resolvedNodeId === 'object'
        ? {
            enabled: true,
            options: resolvedNodeId,
          }
        : { enabled: resolvedNodeId !== false }
    ),
    AffinityPlugin.configure({ enabled: affinity }),
    BaseParagraphPlugin,
  ];

  // Create a map for quick lookup of custom plugins
  const customPluginsMap = new Map(
    plugins.map((plugin) => [plugin.key, plugin])
  );

  // Replace core plugins with custom plugins if they exist and remove them from plugins
  const resolvedCorePlugins = corePlugins.map((corePlugin) => {
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

  return resolvedCorePlugins;
};

export type CorePluginApi = ElementStateConfig['api'] & {
  react: ReactApi;
} & DebugConfig['api'] &
  DomConfig['api'] &
  InferConfig<typeof HistoryPlugin>['api'];

export type CorePluginTx = DomConfig['tx'] &
  InferConfig<typeof HistoryPlugin>['tx'] &
  InferConfig<typeof NodeIdPlugin>['tx'];

export type CorePluginState = HistoryExtensionTypes['state'];

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

type LogFunction = (
  message: string,
  type?: DebugErrorType,
  details?: any
) => void;
