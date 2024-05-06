import {
  type PlateEditor,
  type Value,
  getPluginOptions,
} from '@udecode/plate-common/server';
import markdown from 'remark-parse';
import unified from 'unified';

import type { DeserializeMdPlugin } from '../types';

import {
  type RemarkPluginOptions,
  remarkPlugin,
} from '../../remark-slate/index';
import { KEY_DESERIALIZE_MD } from '../createDeserializeMdPlugin';

/** Deserialize content from Markdown format to Slate format. `editor` needs */
export const deserializeMd = <V extends Value>(
  editor: PlateEditor<V>,
  data: string
) => {
  const { elementRules, indentList, textRules } = getPluginOptions<
    DeserializeMdPlugin,
    V
  >(editor, KEY_DESERIALIZE_MD);

  const tree: any = unified()
    .use(markdown)
    .use(remarkPlugin, {
      editor,
      elementRules,
      indentList,
      textRules,
    } as unknown as RemarkPluginOptions<V>)
    .processSync(data);

  return tree.result;
};
