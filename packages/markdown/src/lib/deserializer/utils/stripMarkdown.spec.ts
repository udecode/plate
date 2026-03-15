import {
  stripMarkdown,
  stripMarkdownBlocks,
  stripMarkdownInline,
} from './stripMarkdown';

describe('stripMarkdownBlocks', () => {
  it('removes block markdown syntax and preserves text content', () => {
    const input = [
      '# Heading',
      '> Quote',
      '- bullet',
      '1. ordered',
      '```ts',
      'const x = 1;',
      '```',
      'tail<br>line',
    ].join('\n');

    expect(stripMarkdownBlocks(input)).toBe(
      ['Heading', 'Quote', 'bullet', 'ordered', '', 'tail', 'line'].join('\n')
    );
  });
});

describe('stripMarkdownInline', () => {
  it('removes inline markdown syntax and decodes entities', () => {
    const input =
      '**bold** _italic_ [link](https://example.com) `code` &lt;&gt;&amp;&nbsp;';

    expect(stripMarkdownInline(input)).toBe('bold italic link code <>& ');
  });
});

describe('stripMarkdown', () => {
  it('combines block and inline stripping', () => {
    const input = '# Heading\n- **bold** [link](https://example.com)<br>`code`';

    expect(stripMarkdown(input)).toBe('Heading\nbold link\ncode');
  });
});
