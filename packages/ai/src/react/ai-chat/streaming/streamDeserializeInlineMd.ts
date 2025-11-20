import type { PlateEditor } from 'platejs/react';

import { type DeserializeMdOptions, MarkdownPlugin } from '@platejs/markdown';

export const streamDeserializeInlineMd = (
  editor: PlateEditor,
  text: string,
  options?: DeserializeMdOptions
) => editor.getApi(MarkdownPlugin).markdown.deserializeInline(text, options);
