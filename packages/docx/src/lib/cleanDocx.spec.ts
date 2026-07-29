import { cleanDocx } from './cleanDocx';

describe('cleanDocx behavior', () => {
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

  it('owns font and link cleanup', () => {
    const result = cleanDocx(
      [
        '<font color="red">Hello</font><font></font>',
        '<a href="#footnote"><span>Jump</span></a>',
        '<a href="https://platejs.org"><span></span><img src="/x.png" /><span>caption</span></a>',
      ].join(''),
      '{\\rtf1}'
    );
    const document = new DOMParser().parseFromString(result, 'text/html');

    expect(document.querySelector('font')).toBeNull();
    expect(document.querySelector('span')?.textContent).toBe('Hello');
    expect(document.querySelector('a[href="#footnote"]')).toBeNull();
    expect(document.body.textContent).toContain('Jump');
    expect(
      document.querySelectorAll('a[href="https://platejs.org"] span')
    ).toHaveLength(1);
  });

  it('owns text-node and break cleanup', () => {
    const result = cleanDocx(
      '<p>A</p>\n   <p>B</p><p>\u00A0</p><p><br />\nhello\rworld</p>',
      '{\\rtf1}'
    );
    const document = new DOMParser().parseFromString(result, 'text/html');

    expect(document.body.textContent).toContain('AB');
    expect(document.body.textContent).toContain('\nhello world');
    expect(document.querySelector('br')).toBeNull();
  });

  it('copies block mark styles to a span child', () => {
    const result = cleanDocx(
      '<p style="font-style: italic; font-weight: 700; text-decoration: underline;">Hello</p>',
      '{\\rtf1}'
    );
    const document = new DOMParser().parseFromString(result, 'text/html');
    const span = document.querySelector('p > span') as HTMLSpanElement | null;

    expect(span?.textContent).toBe('Hello');
    expect(span?.style.fontStyle).toBe('italic');
    expect(span?.style.fontWeight).toBe('700');
    expect(span?.style.textDecoration).toContain('underline');
  });

  it('normalizes line endings and ignores content outside the outer html element', () => {
    const result = cleanDocx(
      'discard\r\n<html><body><p>a\r\nb\rc</p></body></html>discard',
      '{\\rtf1}'
    );

    expect(result).not.toContain('discard');
    expect(result).not.toContain('\r');
    expect(result).toContain('a b c');
  });

  it('recovers local images from RTF while preserving external alt URLs', () => {
    const result = cleanDocx(
      [
        '<img alt="https://cdn.example.com/image.png" src="file:///C:/external.png" />',
        '<img src="file:///C:/inline.png" v:shapes="_x0000_i1025" />',
        '<img src="file:///C:/missing.png" v:shapes="_x0000_i9999" />',
      ].join(''),
      String.raw`\shppict shplid1025 pngblip bliptag 68656c6c6f}`
    );
    const images = Array.from(
      new DOMParser()
        .parseFromString(result, 'text/html')
        .querySelectorAll('img')
    );

    expect(images).toHaveLength(2);
    expect(images[0].src).toBe('https://cdn.example.com/image.png');
    expect(images[1].src).toBe('data:image/png;base64,aGVsbG8=');
  });

  it('recovers VML images without matching shp inside shppict', () => {
    const result = cleanDocx(
      [
        '<v:shape o:spid="_x0000_s2049"><v:imagedata src="file:///C:/shape.png"></v:imagedata></v:shape>',
        '<v:shape o:spid="_x0000_s1025"><v:imagedata src="file:///C:/wrong.png"></v:imagedata></v:shape>',
      ].join(''),
      [
        String.raw`\shppict shplid1025 pngblip bliptag 68656c6c6f}`,
        String.raw`\shp shplid2049 jpegblip bliptag ffd8ff}`,
      ].join(' ')
    );
    const images = Array.from(
      new DOMParser()
        .parseFromString(result, 'text/html')
        .querySelectorAll('img')
    );

    expect(images).toHaveLength(1);
    expect(images[0].src).toBe('data:image/jpeg;base64,/9j/');
  });

  it('resolves image shape IDs declared in Word HTML comments', () => {
    const result = cleanDocx(
      [
        '<!-- <v:shape id="Picture_x0020_2" o:spid="_x0000_i1026"></v:shape> -->',
        '<img src="file:///C:/image.png" v:shapes="Picture_x0020_2" />',
      ].join(''),
      String.raw`\shppict shplid1026 pngblip bliptag 616263}`
    );
    const image = new DOMParser()
      .parseFromString(result, 'text/html')
      .querySelector('img');

    expect(image?.getAttribute('src')).toBe('data:image/png;base64,YWJj');
  });
});
