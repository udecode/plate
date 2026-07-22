import type { BaseEditor } from '@platejs/core';

import type { DeserializeMdOptions } from '../deserializeMd';

import { deserializeInlineMdWithRuntime } from '../../internal/markdownDeserializer';
import { withMarkdownRuntime } from '../../internal/markdownRuntime';

export const deserializeInlineMd = (
  editor: BaseEditor,
  text: string,
  options?: DeserializeMdOptions
) =>
  withMarkdownRuntime(editor, (runtime) =>
    deserializeInlineMdWithRuntime(runtime, text, options)
  );
