import { type Value } from 'platejs';

import { BaseEditorKit } from 'www/src/registry/components/editor/editor-base-kit';
import { createStaticEditor as createSlateEditor, CreateStaticEditorOptions as CreateSlateEditorOptions } from '../editor/withStatic';

export const createStaticEditor = (
  value: Value,
  options?: Partial<CreateSlateEditorOptions>
) => {
  return createSlateEditor({
    ...options,
    plugins: BaseEditorKit,
    value,
  });
};
