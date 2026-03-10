import type { Value } from 'platejs';
import { createSlateEditor } from 'platejs';

import { BaseEditorKit } from '@/registry/components/editor/editor-base-kit';

export const createStaticEditor = (
  value: Value,
  options?: Partial<Parameters<typeof createSlateEditor>[0]>
) =>
  createSlateEditor({
    ...options,
    plugins: BaseEditorKit,
    value,
  });
