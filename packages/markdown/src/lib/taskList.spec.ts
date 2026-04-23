import { createTestEditor } from './__tests__/createTestEditor';
import { deserializeMd } from './deserializer';
import { serializeMd } from './serializer';

describe('markdown task lists', () => {
  it('round-trips checked state through the markdown package surfaces', () => {
    const editor = createTestEditor();
    const input = '- [ ] open\n- [x] done\n';
    const expected = '* [ ] open\n* [x] done\n';

    const value = deserializeMd(editor, input);

    expect(value).toMatchObject([
      {
        checked: false,
        children: [{ text: 'open' }],
        indent: 1,
        listStyleType: 'todo',
        type: 'p',
      },
      {
        checked: true,
        children: [{ text: 'done' }],
        indent: 1,
        listStyleType: 'todo',
        type: 'p',
      },
    ]);

    const markdown = serializeMd(editor, { value: value as any });

    expect(markdown).toBe(expected);
    expect(deserializeMd(editor, markdown)).toMatchObject(value);
  });
});
