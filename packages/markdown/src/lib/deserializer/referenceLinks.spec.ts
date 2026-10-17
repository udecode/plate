import { createTestEditor } from '../__tests__/createTestEditor';
import { serializeMd } from '../serializer';
import { deserializeMd } from './deserializeMd';

const roundTrip = (input: string) => {
  const editor = createTestEditor();
  editor.tf.setValue(deserializeMd(editor, input));
  return { editor, output: serializeMd(editor) };
};

describe('reference links', () => {
  it('resolves a shortcut reference to a link', () => {
    const { editor, output } = roundTrip('a [ref] b\n\n[ref]: https://x.y\n');
    expect(editor.children[0]).toEqual({
      children: [
        { text: 'a ' },
        { children: [{ text: 'ref' }], type: 'a', url: 'https://x.y' },
        { text: ' b' },
      ],
      type: 'p',
    });
    expect(output).toBe('a [ref](https://x.y) b\n');
  });

  it('resolves full and collapsed references, ignoring label case', () => {
    const { output } = roundTrip(
      'a [text][Id] b [id][] c\n\n[id]: https://x.y\n'
    );
    expect(output).toBe('a [text](https://x.y) b [id](https://x.y) c\n');
  });

  it('resolves an image reference', () => {
    const { editor } = roundTrip('![alt][img]\n\n[img]: https://x.y/i.png\n');
    expect(editor.children[0]).toMatchObject({
      type: 'img',
      url: 'https://x.y/i.png',
    });
  });

  it('keeps an unresolved reference as text', () => {
    const { editor } = roundTrip('a [nope] b [x][y] c\n');
    expect(editor.api.string([])).toBe('a [nope] b [x][y] c');
  });
});
