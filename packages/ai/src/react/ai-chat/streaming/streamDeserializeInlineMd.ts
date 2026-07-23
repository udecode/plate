import type { PlateEditor } from '@platejs/core/react';

import type { DeserializeMdOptions, MarkdownEditor } from '@platejs/markdown';

export const streamDeserializeInlineMd = (
  editor: MarkdownEditor<PlateEditor>,
  text: string,
  options?: DeserializeMdOptions
) => {
  const { deserializeInline } = editor.api.markdown;

  try {
    return deserializeInline(text, options);
  } catch {
    return deserializeInline(text, { ...options, withoutMdx: true });
  }
};
