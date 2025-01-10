import type { SlateEditor } from '@udecode/plate';

import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { type Processor, unified } from 'unified';

import { MarkdownPlugin } from '../../MarkdownPlugin';
import {
  type RemarkElementRules,
  type RemarkPluginOptions,
  type RemarkTextRules,
  remarkPlugin,
} from '../../remark-slate';
import { parseMarkdownBlocks } from './parseMarkdownBlocks';

export type DeserializeMdOptions = {
  /** Token types to filter out from marked lexer */
  excludeTokens?: string[];
  /** Whether to add _memo property to elements */
  memoize?: boolean;
  /** A function that allows you to modify the markdown processor. */
  processor?: (processor: Processor) => Processor;
};

/** Deserialize content from Markdown format to Slate format. */
export const deserializeMd = (
  editor: SlateEditor,
  data: string,
  {
    excludeTokens = ['space'],
    memoize = true,
    processor,
  }: DeserializeMdOptions = {}
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

  tree = tree.use(remarkGfm).use(remarkPlugin, {
    editor,
    elementRules,
    indentList: options.indentList,
    textRules,
  } as unknown as RemarkPluginOptions);

  if (memoize) {
    return parseMarkdownBlocks(data, { excludeTokens }).map((token) => ({
      _memo: token.raw,
      ...tree.processSync(token.raw).result[0],
    }));
  }

  return tree.processSync(data).result;
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
