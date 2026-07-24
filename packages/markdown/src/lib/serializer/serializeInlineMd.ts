import type { BaseEditor } from '@platejs/core';
import type { Text } from '@platejs/plite';

import type { SerializeMdOptions } from './serializeMd';

import { serializeInlineMdWithRuntime } from '../internal/markdownSerializer';
import { withMarkdownRuntime } from '../internal/markdownRuntime';

export const serializeInlineMd = (
  editor: BaseEditor,
  options?: Omit<SerializeMdOptions, 'value'> & { value?: readonly Text[] }
) =>
  withMarkdownRuntime(editor, (runtime) =>
    serializeInlineMdWithRuntime(runtime, options)
  );
