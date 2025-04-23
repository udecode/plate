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
  return editor
    .getApi(MarkdownPlugin)
    .markdown.deserializeInline(text, options);
};
