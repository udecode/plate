import type { Descendant, SlateEditor } from '@udecode/plate';
import type { Plugin } from 'unified';

import type { SerializeMdOptions } from '../serializeMd';

import {
  type AllowNodeConfig,
  type NodesConfig,
  MarkdownPlugin,
} from '../../MarkdownPlugin';
import { type TNodes, defaultNodes } from '../../nodesRule';

/**
 * Merges Markdown configurations, following the principle that options take
 * precedence
 *
 * @param editor Editor instance used to get plugin default configurations
 * @param options User-provided options (higher priority)
 * @returns The final merged configuration
 */
export const getMergedOptions = (
  editor: SlateEditor,
  options?: SerializeMdOptions
): {
  allowedNodes: NodesConfig;
  disallowedNodes: NodesConfig;
  editor: SlateEditor;
  remarkPlugins: Plugin[];
  value: Descendant[];
  allowNode?: AllowNodeConfig;
  nodes?: TNodes;
} => {
  const {
    allowedNodes: PluginAllowedNodes,
    allowNode: PluginAllowNode,
    disallowedNodes: PluginDisallowedNodes,
    nodes: PluginNodes,
    remarkPlugins: PluginRemarkPlugins,
  } = editor.getOptions(MarkdownPlugin);

  return {
    allowedNodes: options?.allowedNodes ?? PluginAllowedNodes,
    allowNode: options?.allowNode ?? PluginAllowNode,
    disallowedNodes: options?.disallowedNodes ?? PluginDisallowedNodes,
    editor,
    nodes: options?.nodes ?? PluginNodes ?? defaultNodes,
    remarkPlugins: options?.remarkPlugins ?? PluginRemarkPlugins ?? [],
    value: options?.value ?? editor.children,
  };
};
