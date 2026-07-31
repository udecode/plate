import { HistoryPlugin } from './HistoryPlugin';
import { OverridePlugin } from './override/OverridePlugin';
import { DebugPlugin } from './debug';
import { DOMPlugin } from './dom';
import { ElementStatePlugin } from './element-state';
import { HtmlPlugin } from './html';
import { InputRulesPlugin } from './input-rules/InputRulesPlugin';
import { AffinityPlugin } from './affinity';
import { type NodeIdPluginState, NodeIdPlugin } from './node-id/NodeIdPlugin';
import { BaseParagraphPlugin } from './paragraph';
import type { DefinitionOf } from '../plugin';

export type GetCorePluginsOptions = {
  /** Enable mark/element affinity. */
  affinity?: boolean;
  /** Configure the node id plugin. */
  nodeId?: Partial<NodeIdPluginState> | boolean;
};

export type CorePlugins = readonly [
  typeof DebugPlugin,
  typeof ElementStatePlugin,
  typeof DOMPlugin,
  typeof HistoryPlugin,
  typeof InputRulesPlugin,
  typeof OverridePlugin,
  typeof HtmlPlugin,
  ReturnType<typeof NodeIdPlugin.configure>,
  ReturnType<typeof AffinityPlugin.configure>,
  typeof BaseParagraphPlugin,
];

export const getCorePlugins = ({
  affinity,
  nodeId,
}: GetCorePluginsOptions): CorePlugins => [
  DebugPlugin,
  ElementStatePlugin,
  DOMPlugin,
  HistoryPlugin,
  InputRulesPlugin,
  OverridePlugin,
  HtmlPlugin,
  NodeIdPlugin.configure(
    process.env.NODE_ENV === 'test' && nodeId === undefined
      ? {
          enabled: true,
          initialState: {
            initialValueIds: false,
            match: () => false,
          },
        }
      : typeof nodeId === 'object'
        ? {
            enabled: true,
            initialState: nodeId,
          }
        : { enabled: nodeId !== false }
  ),
  AffinityPlugin.configure({ enabled: affinity }),
  BaseParagraphPlugin,
];

/** Compact normalized definitions installed by every Base editor. */
export type CorePluginDefinition = DefinitionOf<CorePlugins[number]>;
