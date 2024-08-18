import type { SlateEditor } from '@udecode/plate-common';

import markdown from 'remark-parse';
import unified from 'unified';

import {
  type RemarkPluginOptions,
  remarkPlugin,
} from '../../remark-slate/index';
import { DeserializeMdPlugin } from '../DeserializeMdPlugin';

/** Deserialize content from Markdown format to Slate format. `editor` needs */
export const deserializeMd = (editor: SlateEditor, data: string) => {
  const { elementRules, indentList, textRules } =
    editor.getOptions(DeserializeMdPlugin);

  const tree: any = unified()
    .use(markdown)
    .use(remarkPlugin, {
      editor,
      elementRules,
      indentList,
      textRules,
    } as unknown as RemarkPluginOptions)
    .processSync(data);

  return tree.result;
};
