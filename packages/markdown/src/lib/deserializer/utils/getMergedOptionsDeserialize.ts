import type { SlateEditor } from 'platejs';

import type { DeserializeMdOptions } from '../deserializeMd';

import { MarkdownPlugin } from '../../MarkdownPlugin';
import { buildRules } from '../../rules';
import { getRemarkPluginsWithoutMdx } from '../../utils/getRemarkPluginsWithoutMdx';

/**
 * Merges Markdown configurations, following the principle that options take
 * precedence
 *
 * @param editor Editor instance used to get plugin default configurations
 * @param options User-provided options (higher priority)
 * @returns The final merged configuration
 */
export const getMergedOptionsDeserialize = (
  editor: SlateEditor,
  options?: DeserializeMdOptions
): DeserializeMdOptions => {
  const {
    allowedNodes: PluginAllowedNodes,
    allowNode: PluginAllowNode,
    disallowedNodes: PluginDisallowedNodes,
    remarkPlugins: PluginRemarkPlugins,
    rules: PluginRules,
  } = editor.getOptions(MarkdownPlugin);

  const mergedRules = {
    ...buildRules(editor),
    ...(options?.rules ?? PluginRules),
  };

  const remarkPlugins = options?.remarkPlugins ?? PluginRemarkPlugins ?? [];

  return {
    allowedNodes: options?.allowedNodes ?? PluginAllowedNodes,
    allowNode: options?.allowNode ?? PluginAllowNode,
    disallowedNodes: options?.disallowedNodes ?? PluginDisallowedNodes,
    editor,
    memoize: options?.memoize,
    parser: options?.parser,
    remarkPlugins: options?.withoutMdx
      ? getRemarkPluginsWithoutMdx(remarkPlugins)
      : remarkPlugins,
    rules: mergedRules,
    splitLineBreaks: options?.splitLineBreaks,
  };
};
