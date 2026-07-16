import type { PlateEditor } from '@platejs/core/react';

import { type DeserializeMdOptions, MarkdownPlugin } from '@platejs/markdown';

export const streamDeserializeInlineMd = (
  editor: PlateEditor,
  text: string,
  options?: DeserializeMdOptions
) => {
  const deserializeInline = editor.plugin(MarkdownPlugin).api.deserializeInline;

  try {
    return deserializeInline(text, options);
  } catch {
    return deserializeInline(text, { ...options, withoutMdx: true });
  }
};
