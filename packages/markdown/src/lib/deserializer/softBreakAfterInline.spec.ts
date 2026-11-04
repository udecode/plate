import { createTestEditor } from '../__tests__/createTestEditor';
import { deserializeMd } from './deserializeMd';

const getText = (node: any): string =>
  node.children ? node.children.map(getText).join('') : node.text;

describe('soft break after an inline node', () => {
  const editor = createTestEditor();

  it.each([
    ['link', 'a [link](https://x.dev)\nb\n', 'a link\nb'],
    ['emphasis', 'a *em*\nb\n', 'a em\nb'],
    ['inline code', 'a `code`\nb\n', 'a code\nb'],
  ])('keeps the line ending after %s', (_name, input, expected) => {
    const [paragraph] = deserializeMd(editor, input);

    expect(getText(paragraph)).toBe(expected);
  });

  it.each([
    [
      'a blockquote',
      '> Blockquote line1<br>\n> Blockquote line2',
      'Blockquote line1\nBlockquote line2',
    ],
    ['bold', '**a<br>\nb**\n', 'a\nb'],
    ['bold that ends with it', '**a<br>**\nb\n', 'a\nb'],
    ['a link that ends with it', '[a<br>](https://x.dev)\nb\n', 'a\nb'],
  ])('reads a <br> and the newline after it as one break in %s', (_name, input, expected) => {
    const [block] = deserializeMd(editor, input);

    expect(getText(block)).toBe(expected);
  });

  it('drops the newline after a raw <br> with attributes kept as text', () => {
    const [block] = deserializeMd(editor, 'a<br class="x">\nb\n', {
      withoutMdx: true,
    });

    expect(getText(block)).toBe('a<br class="x">b');
  });
});
