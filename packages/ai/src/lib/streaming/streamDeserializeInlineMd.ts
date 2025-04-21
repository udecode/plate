import type { PlateEditor } from '@udecode/plate/react';

import {
  type DeserializeMdOptions,
  MarkdownPlugin,
} from '@udecode/plate-markdown';

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
        withoutMdx: true,
        ...options,
      });

    return blocks;
  }
};
