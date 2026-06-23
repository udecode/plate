import type { Value } from 'platejs';
import { createBasePlateEditor } from 'platejs';

import { BaseEditorKit } from '@/registry/components/editor/editor-base-kit';

export const createStaticEditor = (
  value: Value,
  options?: Partial<Parameters<typeof createBasePlateEditor>[0]>
) =>
  createBasePlateEditor({
    ...options,
    plugins: BaseEditorKit,
    value,
  });
