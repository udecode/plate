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

  it('keeps html as html after a second round trip', () => {
    const once = roundTrip('a <b>bold</b> c\n');
    expect(roundTrip(once)).toBe('a <b>bold</b> c\n');
  });
});
