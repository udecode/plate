import { createTestEditor } from '../__tests__/createTestEditor';
import { serializeMd } from './serializeMd';

describe('serializeMd', () => {
  it('serializes the editor value by default when no explicit value is passed', () => {
    const editor = createTestEditor();

    editor.update((tx) =>
      tx.value.replace({
        children: [
          {
            children: [{ text: 'editor value' }],
            type: 'p',
          },
        ],
      })
    );

    expect(serializeMd(editor)).toBe('editor value\n');
  });

  it('forwards remarkStringifyOptions to the markdown output', () => {
    const editor = createTestEditor();

    expect(
      serializeMd(editor, {
        remarkStringifyOptions: { bullet: '+' },
        value: {
          children: [
            {
              children: [{ text: 'Item' }],
              indent: 1,
              listStyleType: 'disc',
              type: 'p',
            },
          ],
        },
      })
    ).toBe('+ Item\n');
  });
});
