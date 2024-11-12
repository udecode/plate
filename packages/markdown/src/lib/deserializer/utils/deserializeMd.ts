import type { SlateEditor } from '@udecode/plate-common';

import remarkParse from 'remark-parse';
import { type Processor, unified } from 'unified';

import { MarkdownPlugin } from '../../MarkdownPlugin';
import {
  type RemarkElementRules,
  type RemarkPluginOptions,
  type RemarkTextRules,
  remarkPlugin,
} from '../../remark-slate';

/** Deserialize content from Markdown format to Slate format. */
export const deserializeMd = (
  editor: SlateEditor,
  data: string,
  {
    processor,
  }: {
    processor?: (processor: Processor) => Processor;
  } = {}
) => {
  const elementRules: RemarkElementRules = {};
  const textRules: RemarkTextRules = {};

  const options = editor.getOptions(MarkdownPlugin);

  Object.assign(elementRules, options.elementRules);
  Object.assign(textRules, options.textRules);

  let tree: any = unified().use(remarkParse);

  if (processor) {
    tree = processor(tree);
  }

  tree = tree
    .use(remarkPlugin, {
      editor,
      elementRules,
      indentList: options.indentList,
      textRules,
    } as unknown as RemarkPluginOptions)
    .processSync(data);

  return tree.result;
};

// TODO: Collect rules from plugins
// editor.plugins.forEach((plugin: SlatePlugin) => {
//   if (plugin.parsers?.markdown?.deserialize) {
//     const { elementRules: pluginElementRules, textRules: pluginTextRules } =
//       plugin.parsers.markdown.deserialize as MarkdownDeserializer;
//
//     if (pluginElementRules) {
//       Object.assign(elementRules, pluginElementRules);
//     }
//     if (pluginTextRules) {
//       Object.assign(textRules, pluginTextRules);
//     }
//   }
// });
