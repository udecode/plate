import { getPluginOptions, PlateEditor, Value } from '@udecode/plate-common';
import markdown from 'remark-parse';
import unified from 'unified';

import { remarkPlugin, RemarkPluginOptions } from '../../remark-slate/index';
import { KEY_DESERIALIZE_MD } from '../createDeserializeMdPlugin';
import { DeserializeMdPlugin } from '../types';

/**
 * Deserialize content from Markdown format to Slate format.
 * `editor` needs
 */
export const deserializeMd = <V extends Value>(
  editor: PlateEditor<V>,
  data: string
) => {
  const { elementRules, textRules } = getPluginOptions<DeserializeMdPlugin, V>(
    editor,
    KEY_DESERIALIZE_MD
  );

  const tree: any = unified()
    .use(markdown)
    .use(remarkPlugin, {
      editor,
      elementRules,
      textRules,
    } as unknown as RemarkPluginOptions<V>)
    .processSync(data);

  return tree.result;
};
