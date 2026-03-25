import { cleanDocx } from './cleanDocx';

describe('cleanDocx', () => {
  it('returns the original html when there is no rtf and no docx markers', () => {
    const html = '<p>plain html</p>';

    expect(cleanDocx(html, '')).toBe(html);
  });

  it('cleans common docx artifacts into normal html', () => {
    const html = [
      '<p class="MsoQuote">Quote</p>',
      '<p><span class="MsoFootnoteReference">[4]</span></p>',
      '<p><span style="mso-spacerun: yes">  </span><span style="mso-tab-count:2"></span></p>',
      '<p><o:p>\u00A0</o:p></p>',
      '<p style="mso-list:l0 level1 lfo1"><span style="mso-list:ignore">1.</span> Item</p>',
      '<p><br /><!--[if !supportLineBreakNewLine]--><span>drop</span><!--[endif]--></p>',
    ].join('');

    const result = cleanDocx(html, '{\\rtf1}');
    const document = new DOMParser().parseFromString(result, 'text/html');

    expect(result).toContain('white-space: pre-wrap');
    expect(document.querySelector('blockquote')?.textContent).toBe('Quote');
    expect(document.querySelector('sup')?.textContent).toBe('4');
    expect(result).not.toContain('MsoFootnoteReference');
    expect(result).not.toContain('[if !supportLineBreakNewLine]');
    expect(result).toContain('mso-list:Ignore');
  });
});
