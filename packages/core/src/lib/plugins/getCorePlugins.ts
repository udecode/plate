import type { InferConfig } from '../plugin/BasePlugin';
import type { ReactApi } from '@platejs/plite-react';
import type { HistoryExtensionTypes } from '@platejs/plite-history';

import { HistoryPlugin } from './HistoryPlugin';
import { OverridePlugin } from './override/OverridePlugin';
import { DebugPlugin } from './debug';
import { type DomConfig, DOMPlugin } from './dom';
import { ElementStatePlugin } from './element-state';
import { type HtmlApi, HtmlPlugin } from './html';
import { InputRulesPlugin } from './input-rules/InputRulesPlugin';
import { AffinityPlugin } from './affinity';
import {
  type NodeIdPluginState,
  type NodeIdPluginUpdate,
  NodeIdPlugin,
} from './node-id/NodeIdPlugin';
import { BaseParagraphPlugin } from './paragraph';

export type GetCorePluginsOptions = {
  /** Enable mark/element affinity. */
  affinity?: boolean;
  /** Configure the node id plugin. */
  nodeId?: Partial<NodeIdPluginState> | boolean;
};

export const getCorePlugins = ({ affinity, nodeId }: GetCorePluginsOptions) =>
  [
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
  ] as const;

type CorePluginDescriptor = ReturnType<typeof getCorePlugins>[number];

export type CorePluginConfig = InferConfig<CorePluginDescriptor>;

export type CorePlugin = CorePluginConfig;

export type CorePluginApi = {
  html: HtmlApi;
  react: ReactApi;
} & DomConfig['api'] &
  InferConfig<typeof HistoryPlugin>['api'];

export type CorePluginTx = DomConfig['tx'] &
  InferConfig<typeof HistoryPlugin>['tx'] & { nodeId: NodeIdPluginUpdate };

export type CorePluginState = HistoryExtensionTypes['state'];
