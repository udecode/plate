import type { Value } from 'platejs';
import { createBaseEditor } from 'platejs';

import { BaseEditorKit } from '@/registry/components/editor/editor-base-kit';

export const createStaticEditor = (
  value: Value,
  options?: Partial<Parameters<typeof createBaseEditor>[0]>
) =>
  createBaseEditor({
    ...options,
    plugins: BaseEditorKit,
    value,
  });
