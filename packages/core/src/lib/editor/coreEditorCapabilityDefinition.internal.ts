import type { HistoryStateApi, HistoryTxApi } from '@platejs/plite-history';

import type { AffinityPluginUpdate } from '../plugins/affinity/AffinityPlugin';
import type { DebugApi } from '../plugins/debug/DebugPlugin';
import type { DomApi, DomPluginUpdate } from '../plugins/dom/DOMPlugin';
import type { ElementStateApi } from '../plugins/element-state/ElementStatePlugin';
import type { HtmlApi } from '../plugins/html/HtmlPlugin';
import type { NodeIdPluginUpdate } from '../plugins/node-id/NodeIdPlugin';
import type { OverridePluginUpdate } from '../plugins/override/OverridePlugin';

/**
 * Non-recursive capability leaf for the plugins installed by every Base
 * editor. Public plugin definitions remain inferred from their descriptors.
 */
export type CoreEditorCapabilityDefinition =
  | Readonly<{
      name: 'affinity';
      update: AffinityPluginUpdate;
    }>
  | Readonly<{
      api: DebugApi;
      name: 'debug';
    }>
  | Readonly<{
      api: DomApi;
      name: 'dom';
      update: DomPluginUpdate;
    }>
  | Readonly<{
      api: ElementStateApi;
      name: 'elementState';
    }>
  | Readonly<{
      name: 'history';
      read: HistoryStateApi;
      update: HistoryTxApi;
    }>
  | Readonly<{
      api: HtmlApi;
      name: 'html';
    }>
  | Readonly<{ name: 'inputRules' }>
  | Readonly<{
      name: 'nodeId';
      update: NodeIdPluginUpdate;
    }>
  | Readonly<{
      name: 'override';
      update: OverridePluginUpdate;
    }>
  | Readonly<{ name: 'p' }>;

export type CoreEditorApi = Readonly<{
  debug: DebugApi;
  dom: DomApi;
  elementState: ElementStateApi;
  html: HtmlApi;
}>;

export type CoreEditorRead = Readonly<{
  history: HistoryStateApi;
}>;

export type CoreEditorTransaction = Readonly<{
  affinity: AffinityPluginUpdate;
  dom: DomPluginUpdate;
  history: HistoryStateApi & HistoryTxApi;
  nodeId: NodeIdPluginUpdate;
  override: OverridePluginUpdate;
}>;

export type CoreEditorUpdate = Readonly<{
  affinity: AffinityPluginUpdate;
  dom: DomPluginUpdate;
  history: HistoryTxApi;
  nodeId: NodeIdPluginUpdate;
  override: OverridePluginUpdate;
}>;

export type CoreNodePluginName = 'p';
