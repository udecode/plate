/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTestEditor } from './__tests__/createTestEditor';
import { streamDeserializeMd } from './streamDeserializeMd';
import { streamSerializeMd } from './streamSerializeMd';
const { editor } = createTestEditor() as any;

jsxt;

describe('streamSerializeMd', () => {
  it('should without tailing line break', async () => {
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

  it('should correctly handle line breaks in code block', async () => {
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
});
