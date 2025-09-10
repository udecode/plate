import type { SlateEditor } from 'platejs';

import type { SerializeMdOptions } from '../serializeMd';

import { MarkdownPlugin } from '../../MarkdownPlugin';
import { buildRules } from '../../rules';

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
    remarkPlugins: PluginRemarkPlugins,
    rules: PluginRules,
  } = editor.getOptions(MarkdownPlugin);

  const mergedRules = Object.assign(
    {},
    buildRules(editor),
    options?.rules ?? PluginRules
  );

  return {
    allowedNodes: options?.allowedNodes ?? PluginAllowedNodes,
    allowNode: options?.allowNode ?? PluginAllowNode,
    disallowedNodes: options?.disallowedNodes ?? PluginDisallowedNodes,
    editor,
    remarkPlugins: options?.remarkPlugins ?? PluginRemarkPlugins ?? [],
    rules: mergedRules,
    spread: options?.spread,
    value: options?.value ?? editor.children,
    withBlockId: options?.withBlockId ?? false,
  };
};
