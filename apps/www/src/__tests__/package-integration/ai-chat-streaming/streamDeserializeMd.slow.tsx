/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { AIChatPlugin } from '@platejs/ai/react';

import { createTestEditor } from './__tests__/createTestEditor';
const { editor } = createTestEditor() as any;

jsxt;

describe('AIChatPlugin api.deserializeChunk', () => {
  it('round-trips a paragraph chunk with a trailing blank line', async () => {
    const chunk = 'chunk1\n\n';

    const result = editor.plugin(AIChatPlugin).api.deserializeChunk(chunk);

    const output = (
      <fragment>
        <hp>chunk1</hp>
        <hp>
          <htext />
        </hp>
      </fragment>
    );

    expect(result).toEqual(output);

    expect(
      editor
        .plugin(AIChatPlugin)
        .read.serializeChunk({ value: { children: result } }, chunk)
    ).toEqual(chunk);
  });

  it('keeps trailing line breaks inside code blocks', async () => {
    const chunk = '```typescript\nconst a = 1\n\n';

    const result = editor.plugin(AIChatPlugin).api.deserializeChunk(chunk);

    const output = [
      {
        children: [
          { children: [{ text: 'const a = 1' }], type: 'code_line' },
          { children: [{ text: '' }], type: 'code_line' },
        ],
        lang: 'typescript',
        type: 'code_block',
      },
    ];

    expect(result).toEqual(output);
  });

  it('round-trips inline math without altering the chunk', async () => {
    const chunk = '$$a^2 ';

    const result = editor.plugin(AIChatPlugin).api.deserializeChunk(chunk);

    const serialized = editor
      .plugin(AIChatPlugin)
      .read.serializeChunk({ value: { children: result } }, chunk);

    expect(serialized).toEqual(chunk);
  });

  it('round-trips incomplete html without forcing markdown parsing', async () => {
    const chunk = '<!DOCTYPE ';

    const result = editor.plugin(AIChatPlugin).api.deserializeChunk(chunk);

    const serialized = editor
      .plugin(AIChatPlugin)
      .read.serializeChunk({ value: { children: result } }, chunk);

    expect(serialized).toEqual(chunk);
  });
});
