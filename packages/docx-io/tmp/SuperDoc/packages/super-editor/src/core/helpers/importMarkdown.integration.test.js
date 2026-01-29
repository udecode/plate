import { describe, it, expect } from 'vitest';
import { convertMarkdownToHTML } from './importMarkdown.js';

describe('markdown to DOCX integration', () => {
  it('converts complete markdown document with headings and lists', () => {
    const markdown = `# Main Title

Text before list.

- Bullet item
- Another item

## Section 2

More text here.

1. Numbered item
2. Second item`;

    const html = convertMarkdownToHTML(markdown);

    // Verify all elements are converted
    expect(html).toContain('<h1>Main Title</h1>');
    expect(html).toContain('<h2>Section 2</h2>');
    expect(html).toContain('<ul>');
    expect(html).toContain('<ol>');

    // Verify spacing is added between paragraphs and lists
    expect(html).toContain('</p>\n<p>&nbsp;</p>\n<ul>');
    expect(html).toContain('</p>\n<p>&nbsp;</p>\n<ol>');
  });
});
