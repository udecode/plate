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
    ['plain text', 'a\nb\n', 'a\nb'],
  ])('keeps the line ending after %s', (_name, input, expected) => {
    const [paragraph] = deserializeMd(editor, input);

    expect(getText(paragraph)).toBe(expected);
  });

  it('keeps a single newline after a <br> in a blockquote', () => {
    const [blockquote] = deserializeMd(
      editor,
      '> Blockquote line1<br>\n> Blockquote line2'
    );

    expect(getText(blockquote)).toBe('Blockquote line1\nBlockquote line2');
  });
});
