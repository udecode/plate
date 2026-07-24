import { createTestEditor } from './__tests__/createTestEditor';
import { deserializeMd } from './deserializer';
import { serializeMd } from './serializer';

describe('math package surfaces', () => {
  it('round-trips inline math through the markdown package surfaces', () => {
    const editor = createTestEditor();
    const input = 'Inline $x+1$ math';
    const expected = 'Inline $x+1$ math\n';

    const value = deserializeMd(editor, input);

    expect(value.children).toMatchObject([
      {
        children: [
          { text: 'Inline ' },
          {
            children: [{ text: '' }],
            texExpression: 'x+1',
            type: 'inline_equation',
          },
          { text: ' math' },
        ],
        type: 'p',
      },
    ]);

    const markdown = serializeMd(editor, { value });

    expect(markdown).toBe(expected);
    expect(deserializeMd(editor, markdown)).toMatchObject(value);
  });

  it('round-trips block math through the markdown package surfaces', () => {
    const editor = createTestEditor();
    const input = '$$\nx+1\n$$';
    const expected = '$$\nx+1\n$$\n';

    const value = deserializeMd(editor, input);

    expect(value.children).toMatchObject([
      {
        children: [{ text: '' }],
        texExpression: 'x+1',
        type: 'equation',
      },
    ]);

    const markdown = serializeMd(editor, { value });

    expect(markdown).toBe(expected);
    expect(deserializeMd(editor, markdown)).toMatchObject(value);
  });
});
