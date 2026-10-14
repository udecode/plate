import type { PluginFormatRegistry } from '../../lib/plugin/PluginFormatContext';
import { PLUGINS } from '../../utils/plate-keys';

export const UNLANDED_MARKDOWN_PARAGRAPH_TYPE = 'markdown:paragraph';

export const getMarkdownParagraphType = (
  registry: Pick<PluginFormatRegistry, 'type'>
) => registry.type(PLUGINS.paragraph) ?? UNLANDED_MARKDOWN_PARAGRAPH_TYPE;

export const landsMarkdownParagraph = (
  registry: Pick<PluginFormatRegistry, 'type'>
) => registry.type(PLUGINS.paragraph) === undefined;
