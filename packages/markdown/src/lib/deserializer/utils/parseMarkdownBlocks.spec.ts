import { parseMarkdownBlocks } from './parseMarkdownBlocks';

describe('parseMarkdownBlocks', () => {
  it('should parse markdown content into tokens', () => {
    const input = '# Heading\n \nParagraph';

    const tokens = parseMarkdownBlocks(input);

    expect(tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          depth: 1,
          raw: '# Heading',
          text: 'Heading',
          type: 'heading',
        }),
        expect.objectContaining({
          raw: 'Paragraph',
          text: 'Paragraph',
          type: 'paragraph',
        }),
      ])
    );
  });

  it('should not filter tokens when exclude is empty', () => {
    const input = `# Heading\n \nParagraph`;

    const tokensWithSpace = parseMarkdownBlocks(input, { exclude: [] });
    const tokensWithoutSpace = parseMarkdownBlocks(input);

    expect(tokensWithSpace.length).toBeGreaterThan(tokensWithoutSpace.length);
    expect(tokensWithSpace).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: 'space' })])
    );
  });

  it('should filter multiple token types', () => {
    const input = '# Heading\n\n---\n\nParagraph';
    const tokens = parseMarkdownBlocks(input, {
      exclude: ['space', 'hr'],
    });

    expect(tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'heading' }),
        expect.objectContaining({ type: 'paragraph' }),
      ])
    );

    expect(tokens).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'space' }),
        expect.objectContaining({ type: 'hr' }),
      ])
    );
  });

  it('should not trim content when trim is false', () => {
    const input = '# Heading \n \n';

    const tokens = parseMarkdownBlocks(input, { exclude: [], trim: false });

    expect(tokens[1]).toEqual(
      expect.objectContaining({
        raw: ' \n',
        type: 'space',
      })
    );
  });

  it('should trim content by default', () => {
    const input = '# Heading \n';

    const tokens = parseMarkdownBlocks(input);

    expect(tokens).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          raw: '# Heading',
          text: 'Heading',
          type: 'heading',
        }),
      ])
    );
  });
});
