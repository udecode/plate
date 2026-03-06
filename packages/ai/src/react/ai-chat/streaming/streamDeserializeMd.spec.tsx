/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createTestEditor } from './__tests__/createTestEditor';
import { streamDeserializeMd } from './streamDeserializeMd';
import { streamSerializeMd } from './streamSerializeMd';
const { editor } = createTestEditor() as any;

jsxt;

describe('streamDeserializeMd', () => {
  it('round-trips a paragraph chunk with a trailing blank line', async () => {
    const chunk = 'chunk1\n\n';

    const result = streamDeserializeMd(editor, chunk);

    const output = (
      <fragment>
        <hp>chunk1</hp>
        <hp>
          <htext />
        </hp>
      </fragment>
    );

    expect(result).toEqual(output);

    expect(streamSerializeMd(editor, { value: result }, chunk)).toEqual(chunk);
  });

  it('keeps trailing line breaks inside code blocks', async () => {
    const chunk = '```typescript\nconst a = 1\n\n';

    const result = streamDeserializeMd(editor, chunk);

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

    const result = streamDeserializeMd(editor, chunk);

    const serialized = streamSerializeMd(editor, { value: result }, chunk);

    expect(serialized).toEqual(chunk);
  });

  it('round-trips incomplete html without forcing markdown parsing', async () => {
    const chunk = '<!DOCTYPE ';

    const result = streamDeserializeMd(editor, chunk);

    const serialized = streamSerializeMd(editor, { value: result }, chunk);

    expect(serialized).toEqual(chunk);
  });
});
