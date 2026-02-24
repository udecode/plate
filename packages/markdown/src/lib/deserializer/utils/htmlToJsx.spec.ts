import { htmlToJsx } from './htmlToJsx';

describe('htmlToJsx', () => {
  it('should convert br tags', () => {
    const input = 'Line 1<br>Line 2';
    const output = 'Line 1<br />Line 2';
    expect(htmlToJsx(input)).toBe(output);
  });

  it('should convert img tags', () => {
    const input = '<img src="test.png">';
    const output = '<img src="test.png" />';
    expect(htmlToJsx(input)).toBe(output);
  });

  it('should convert hr tags', () => {
    const input = '<hr>';
    const output = '<hr />';
    expect(htmlToJsx(input)).toBe(output);
  });

  it('should handle already self-closing tags', () => {
    const input = '<img src="test.png" />';
    const output = '<img src="test.png" />';
    expect(htmlToJsx(input)).toBe(output);
  });

  it('should convert HTML comments', () => {
    const input = `<!-- Figure comment -->
<figure>
  <img src="test.png">
  <figcaption>Caption</figcaption>
</figure>`;

    const result = htmlToJsx(input);
    expect(result).toContain('{/*');
    expect(result).toContain('Figure comment');
    expect(result).toContain('*/}');
  });

  it('should convert class to className', () => {
    const input =
      '<figure class="hero"><img src="test.png"><figcaption>Title</figcaption></figure>';
    const result = htmlToJsx(input);
    expect(result).toContain('className="hero"');
    expect(result).toContain('<img src="test.png" />');
  });

  it('should handle unquoted attributes', () => {
    const input = '<img src=images/fig1.png width=650 alt="test">';
    const result = htmlToJsx(input);
    expect(result).toContain('src="images/fig1.png"');
    expect(result).toContain('width="650"');
    expect(result).toContain('alt="test"');
  });

  it('should handle boolean attributes', () => {
    const input = '<input type="checkbox" checked disabled>';
    const result = htmlToJsx(input);
    expect(result).toContain('checked="true"');
    expect(result).toContain('disabled="true"');
  });

  it('should handle complex figure structure', () => {
    const input = `<figure class="figure">  
    <!-- This is a figure -->  
    <img src=images/fig1.png width=650 alt="Code Compilation" align=center checked>  
    <figcaption><em>Fig. 1: Compiled vs. Interpreted</em></figcaption>  
    <br>  
    <hr>  
    <input type="text" disabled>  
</figure>`;

    const result = htmlToJsx(input);

    expect(result).toContain('className="figure"');
    expect(result).toContain('{/* This is a figure */}');
    expect(result).toContain(
      '<img src="images/fig1.png" width="650" alt="Code Compilation" align="center" checked="true" />'
    );
    expect(result).toContain('<br />');
    expect(result).toContain('<hr />');
    expect(result).toContain('<input type="text" disabled="true" />');
    expect(result).not.toContain('<!--');
    expect(result).not.toMatch(/\sclass=/);
  });

  it('should convert for attribute in label but not in other words', () => {
    const input = '<label for="email">Email</label>';
    const result = htmlToJsx(input);
    expect(result).toContain('htmlFor="email"');
    expect(result).not.toContain('htmlFor="email" for=');
  });

  it('should not convert for in transform attribute', () => {
    const input = '<div transform="rotate" for="partial">Test</div>';
    const result = htmlToJsx(input);
    expect(result).toContain('htmlFor="partial"');
    expect(result).toContain('transform="rotate"');
    expect(result).not.toContain('transform-htmlFor');
  });

  it('should not convert for in class in quoted values', () => {
    const input =
      '<input placeholder="Email for account registration." title="tools for developers">';
    const result = htmlToJsx(input);
    expect(result).toContain('placeholder="Email for account registration."');
    expect(result).toContain('title="tools for developers"');
    expect(result).not.toContain('htmlFor=');
  });

  it('should not convert class in x-class or other prefixed attributes', () => {
    const input = '<div x-class="active">Content</div>';
    const result = htmlToJsx(input);
    expect(result).not.toContain('className=');
    expect(result).toContain('x-class="active"');
  });

  it('should convert class after other attributes', () => {
    const input = '<div id="main" class="container">Content</div>';
    const result = htmlToJsx(input);
    expect(result).toContain('className="container"');
    expect(result).toContain('id="main"');
  });
});
