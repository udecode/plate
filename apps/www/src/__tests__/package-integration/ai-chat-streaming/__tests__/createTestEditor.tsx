/** @jsx jsxt */
import { jsxt, type TestEditorFixture } from '@platejs/test-utils';
import { createBaseEditor, type EditorDocumentValue } from 'platejs';

import { BaseEditorKit } from '@/registry/components/editor/plugins-static';

import { BaseAIPlugin } from '../../../../../../../packages/ai/src/lib/BaseAIPlugin';
import { AIChatPlugin } from '../../../../../../../packages/ai/src/react/AIChatPlugin';

// required to prevent removal by compiler.
jsxt;

export const defaultPlugins = [...BaseEditorKit, BaseAIPlugin, AIChatPlugin];

export const createTestEditor = (value?: EditorDocumentValue) => {
  const input = (
    <editor>
      <hp>
        <cursor />
      </hp>
    </editor>
  ) as TestEditorFixture;

  const editor = createBaseEditor({
    plugins: defaultPlugins,
    ...(value ? {} : { selection: input.selection }),
    initialValue: value ?? { children: input.children },
  });

  return { editor, input };
};
