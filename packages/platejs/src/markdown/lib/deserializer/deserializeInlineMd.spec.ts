import {
  createTestEditor,
  parseTestMarkdownInline,
} from '../__tests__/createTestEditor';

describe('deserializeInlineMd', () => {
  it('keeps leading and trailing spaces around parsed inline markdown', () => {
    const editor = createTestEditor();

    expect(parseTestMarkdownInline(editor, '  **bold**  ')).toEqual([
      { text: '  ' },
      { bold: true, text: 'bold' },
      { text: '  ' },
    ]);
  });

  it('returns only surrounding spaces when inline markdown produces no node', () => {
    const editor = createTestEditor();

    expect(parseTestMarkdownInline(editor, '   ')).toEqual([{ text: '   ' }]);
  });
});
