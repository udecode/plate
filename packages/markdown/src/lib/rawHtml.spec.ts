import { createTestEditor } from './__tests__/createTestEditor';
import { deserializeMd } from './deserializer';
import { serializeMd } from './serializer';

const roundTrip = (input: string) => {
  const editor = createTestEditor();
  editor.tf.setValue(deserializeMd(editor, input));
  return serializeMd(editor);
};

describe('raw html', () => {
  it.each([
    'a <b>bold</b> c\n',
    'a <b>`code`</b> c\n',
    '<div>block</div>\n',
    '<!-- note -->\n\ntext\n',
    'a <!-- note --> b\n',
  ])('round-trips %j', (input) => {
    expect(roundTrip(input)).toBe(input);
  });

  it('keeps blank lines around markdown inside a block tag', () => {
    expect(
      roundTrip('<details>\n<summary>S</summary>\n\n- a\n- b\n\n</details>\n')
    ).toBe('<details>\n\n<summary>S</summary>\n\n* a\n* b\n\n</details>\n');
  });

  it('keeps html as html after a second round trip', () => {
    const once = roundTrip('a <b>bold</b> c\n');
    expect(roundTrip(once)).toBe('a <b>bold</b> c\n');
  });
});
