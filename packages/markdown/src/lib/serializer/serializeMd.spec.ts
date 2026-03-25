import { createTestEditor } from '../__tests__/createTestEditor';
import { serializeMd } from './serializeMd';

describe('serializeMd', () => {
  it('serializes the editor value by default when no explicit value is passed', () => {
    const editor = createTestEditor();

    editor.children = [
      {
        children: [{ text: 'editor value' }],
        type: 'p',
      },
    ] as any;

    expect(serializeMd(editor)).toBe('editor value\n');
  });

  it('forwards remarkStringifyOptions to the markdown output', () => {
    const editor = createTestEditor();

    expect(
      serializeMd(editor, {
        remarkStringifyOptions: { bullet: '+' },
        value: [
          {
            children: [{ text: 'Item' }],
            indent: 1,
            listStyleType: 'disc',
            type: 'p',
          },
        ],
      } as any)
    ).toBe('+ Item\n');
  });
});
