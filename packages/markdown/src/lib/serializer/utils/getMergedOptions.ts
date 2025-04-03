import type { SlateEditor } from '@udecode/plate';

import type { SerializeMdOptions } from '../serializeMd';

import { MarkdownPlugin } from '../../MarkdownPlugin';
import { defaultNodes } from '../../node-rules';

/**
 * Merges Markdown configurations, following the principle that options take
 * precedence
 *
 * @param editor Editor instance used to get plugin default configurations
 * @param options User-provided options (higher priority)
 * @returns The final merged configuration
 */
export const getMergedOptionsSerialize = (
  editor: SlateEditor,
  options?: SerializeMdOptions
): SerializeMdOptions => {
  const {
    allowedNodes: PluginAllowedNodes,
    allowNode: PluginAllowNode,
    disallowedNodes: PluginDisallowedNodes,
    nodes: PluginNodes,
    remarkPlugins: PluginRemarkPlugins,
  } = editor.getOptions(MarkdownPlugin);

  const mergedNodes = Object.assign({}, defaultNodes, PluginNodes);

  return {
    allowedNodes: options?.allowedNodes ?? PluginAllowedNodes,
    allowNode: options?.allowNode ?? PluginAllowNode,
    disallowedNodes: options?.disallowedNodes ?? PluginDisallowedNodes,
    editor,
    nodes: mergedNodes,
    remarkPlugins: options?.remarkPlugins ?? PluginRemarkPlugins ?? [],
    value: options?.value ?? editor.children,
  };
};
