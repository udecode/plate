import type { PlateEditor } from '@udecode/plate/react';

import {
  type DeserializeMdOptions,
  MarkdownPlugin,
} from '@udecode/plate-markdown';

import { getRemarkPluginsWithoutMdx } from './utils/getRemarkPlugin';

export const streamDeserializeInlineMd = (
  editor: PlateEditor,
  text: string,
  options?: DeserializeMdOptions
) => {
  try {
    const blocks = editor
      .getApi(MarkdownPlugin)
      .markdown.deserializeInline(text, options);

    return blocks;
  } catch (error) {
    const blocks = editor
      .getApi(MarkdownPlugin)
      .markdown.deserializeInline(text, {
        remarkPlugins: getRemarkPluginsWithoutMdx(editor),
        ...options,
      });

    return blocks;
  }
};
