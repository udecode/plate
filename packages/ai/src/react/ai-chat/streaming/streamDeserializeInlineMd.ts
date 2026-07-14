import type { PlateEditor } from '@platejs/core/react';

import { type DeserializeMdOptions, MarkdownPlugin } from '@platejs/markdown';

export const streamDeserializeInlineMd = (
  editor: PlateEditor,
  text: string,
  options?: DeserializeMdOptions
) => editor.plugin(MarkdownPlugin).api.deserializeInline(text, options);
