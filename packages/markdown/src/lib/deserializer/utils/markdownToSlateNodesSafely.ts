import type { BaseEditor } from '@platejs/core';

import type { DeserializeMdOptions } from '../deserializeMd';

import { markdownToSlateNodesSafelyWithRuntime } from '../../internal/markdownDeserializer';
import { withMarkdownRuntime } from '../../internal/markdownRuntime';

export const markdownToSlateNodesSafely = (
  editor: BaseEditor,
  data: string,
  options?: DeserializeMdOptions
) =>
  withMarkdownRuntime(editor, (runtime) =>
    markdownToSlateNodesSafelyWithRuntime(runtime, data, options)
  );
