import type { SlateEditor } from '@udecode/plate-common';

import markdown from 'remark-parse';
import unified from 'unified';

import { MarkdownPlugin } from '../../MarkdownPlugin';
import {
  type RemarkElementRules,
  type RemarkPluginOptions,
  type RemarkTextRules,
  remarkPlugin,
} from '../../remark-slate';

/** Deserialize content from Markdown format to Slate format. */
export const deserializeMd = (editor: SlateEditor, data: string) => {
  const elementRules: RemarkElementRules = {};
  const textRules: RemarkTextRules = {};

  // Collect rules from plugins
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

  const options = editor.getOptions(MarkdownPlugin);

  Object.assign(elementRules, options.elementRules);
  Object.assign(textRules, options.textRules);

  const tree: any = unified()
    .use(markdown)
    .use(remarkPlugin, {
      editor,
      elementRules,
      indentList: options.indentList,
      // || !editor.plugins.list,
      textRules,
    } as unknown as RemarkPluginOptions)
    .processSync(data);

  return tree.result;
};
