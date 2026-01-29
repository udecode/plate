import { describe, it, expect, vi } from 'vitest';
import { createDocFromMarkdown, convertMarkdownToHTML } from './importMarkdown.js';
import { createDocFromHTML } from './importHtml.js';

vi.mock('../../core/helpers/importHtml.js', () => ({
  createDocFromHTML: vi.fn(),
}));

describe('markdown import', () => {
  it('converts markdown to HTML with proper spacing', () => {
    const markdown = `# Heading

Paragraph text

- List item`;

    const html = convertMarkdownToHTML(markdown);

    expect(html).toContain('<h1>Heading</h1>');
    expect(html).toContain('<p>Paragraph text</p>');
    expect(html).toContain('</p>\n<p>&nbsp;</p>\n<ul>'); // Spacing before list
  });

  it('creates ProseMirror doc from markdown', () => {
    const mockSchema = { nodes: {} };
    const mockDoc = { type: 'doc' };
    createDocFromHTML.mockReturnValue(mockDoc);

    const result = createDocFromMarkdown('# Test', mockSchema);

    expect(createDocFromHTML).toHaveBeenCalledWith(expect.stringContaining('<h1>Test</h1>'), mockSchema);
    expect(result).toBe(mockDoc);
  });
});
