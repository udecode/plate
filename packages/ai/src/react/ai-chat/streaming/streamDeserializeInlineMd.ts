import type { DeserializeMdOptions } from '@platejs/markdown';

import type { AIChatPlateEditor } from '../internal/editorTypes';

export const streamDeserializeInlineMd = (
  editor: AIChatPlateEditor,
  text: string,
  options?: DeserializeMdOptions
) => editor.api.markdown.deserializeInline(text, options);
