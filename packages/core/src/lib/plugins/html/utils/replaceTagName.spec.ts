import { replaceTagName } from './replaceTagName';

describe('replaceTagName', () => {
  it('keeps parsed children in their source document', () => {
    const source = new DOMParser().parseFromString(
      '<p class="MsoQuote"><em>Quote</em></p>',
      'text/html'
    );
    const paragraph = source.querySelector('p')!;
    const child = paragraph.firstChild;

    const replacement = replaceTagName(paragraph, 'blockquote');

    expect(replacement.ownerDocument).toBe(source);
    expect(replacement.firstChild).toBe(child);
    expect(source.querySelector('blockquote')).toBe(replacement);
    expect(replacement.getAttribute('class')).toBe('MsoQuote');
  });
});
