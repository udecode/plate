import { createEditor, type EditorDocumentValue } from '../../../../packages/platejs/src/core';
import { BaseEditorKit } from '../../../../apps/www/src/registry/components/editor/plugins-static';
import { BaseAIPlugin } from './LegacyBaseAIPlugin';
import { AIChatPlugin } from './LegacyAIChatPlugin';

/** Frozen AI owner on the shared current schema and codec graph. */
export const createTestEditor = (value?: EditorDocumentValue) => ({
  editor: createEditor({
    plugins: [...BaseEditorKit, BaseAIPlugin, AIChatPlugin],
    initialValue: value ?? { children: [{ type: 'paragraph', children: [{ text: '' }] }] },
    selection: value ? undefined : { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 0 } },
  }),
});
