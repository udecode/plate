import type { AnyPluginConfig, PluginConfig } from '../plugin/SlatePlugin';
import type { BasePlugin, InferConfig } from '../plugin/BasePlugin';

import { AstPlugin } from './AstPlugin';
import { HistoryPlugin } from './HistoryPlugin';
import { OverridePlugin } from './override/OverridePlugin';
import { ParserPlugin } from './ParserPlugin';
import { type DebugErrorType, type LogLevel, DebugPlugin } from './debug';
import { type DomConfig, DOMPlugin } from './dom';
import { type HtmlConfig, HtmlPlugin } from './html';
import { InputRulesPlugin } from './input-rules/internal/InputRulesPlugin';
import { LengthPlugin } from './length';
import {
  type NavigationFeedbackConfig,
  NavigationFeedbackPlugin,
} from './navigation-feedback';
import { type AffinityConfig, AffinityPlugin } from './affinity';
import { type NodeIdConfig, NodeIdPlugin } from './node-id/NodeIdPlugin';
import { type ParagraphConfig, BaseParagraphPlugin } from './paragraph';
import {
  type SlateExtensionConfig,
  SlateExtensionPlugin,
} from './slate-extension';

export type CorePlugin = ReturnType<typeof getCorePlugins>[number];

export type CorePluginConfig =
  | AffinityConfig
  | DebugConfig
  | DomConfig
  | LengthConfig
  | NavigationFeedbackConfig
  | NodeIdConfig
  | ParagraphConfig
  | SlateExtensionConfig
  | PluginConfig<'ast'>
  | PluginConfig<'history'>
  | HtmlConfig
  | PluginConfig<'inputRules'>
  | PluginConfig<'override'>
  | PluginConfig<'parser'>;

export type GetCorePluginsOptions = {
  /** Enable mark/element affinity. */
  affinity?: boolean;
  /** Specifies the maximum number of characters allowed in the editor. */
  maxLength?: number;
  /** Configure the navigation feedback plugin. */
  navigationFeedback?: NavigationFeedbackConfig['options'] | boolean;
  /** Configure the node id plugin. */
  nodeId?: NodeIdConfig['options'] | boolean;
  /** Initial read-only state for base editors. */
  readOnly?: boolean;
  /** Override the core plugins using the same key. */
  plugins?: AnyPluginConfig[];
};

export const getCorePlugins = ({
  affinity,
  maxLength,
  navigationFeedback,
  nodeId,
  readOnly,
  plugins = [],
}: GetCorePluginsOptions) => {
  // Disable nodeId by default in test environment for deterministic tests
  let resolvedNodeId: any = nodeId;
  if (process.env.NODE_ENV === 'test' && nodeId === undefined) {
    resolvedNodeId = false;
  }

  const corePlugins = [
    DebugPlugin as BasePlugin<DebugConfig>,
    SlateExtensionPlugin,
    DOMPlugin.configure({
      options: {
        readOnly: readOnly ?? false,
      },
    }),
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

export type CorePluginApi = SlateExtensionConfig['api'] &
  NavigationFeedbackConfig['api'] &
  DebugConfig['api'] &
  DomConfig['api'] &
  InferConfig<typeof HistoryPlugin>['api'] &
  HtmlConfig['api'];

export type CorePluginTx = NavigationFeedbackConfig['tx'] &
  DomConfig['tx'] &
  InferConfig<typeof HistoryPlugin>['tx'] &
  InferConfig<typeof NodeIdPlugin>['tx'];

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
