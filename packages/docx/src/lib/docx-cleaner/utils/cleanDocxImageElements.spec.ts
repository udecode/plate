import { cleanDocxImageElements } from './cleanDocxImageElements';

const parseHtml = (html: string) =>
  new DOMParser().parseFromString(html, 'text/html');

describe('cleanDocxImageElements', () => {
  it('keeps external alt urls instead of trying to recover the local file', () => {
    const document = parseHtml(
      '<img alt="https://cdn.example.com/image.png" src="file:///C:/image.png" />'
    );
    const image = document.querySelector('img')!;

    cleanDocxImageElements(
      document,
      String.raw`\shppict shplid1025 pngblip bliptag 68656c6c6f}`,
      document.body
    );

    expect(image.getAttribute('src')).toBe('https://cdn.example.com/image.png');
  });

  it('replaces local image src values with recovered rtf data uris', () => {
    const document = parseHtml(
      '<img src="file:///C:/image.png" v:shapes="_x0000_i1025" />'
    );
    const image = document.querySelector('img')!;

    cleanDocxImageElements(
      document,
      String.raw`\shppict shplid1025 pngblip bliptag 68656c6c6f}`,
      document.body
    );

    expect(image.getAttribute('src')).toBe('data:image/png;base64,aGVsbG8=');
  });

  it('removes unresolved local images instead of leaving broken file references', () => {
    const document = parseHtml(
      '<div><img src="file:///C:/missing.png" v:shapes="_x0000_i9999" /></div>'
    );

    cleanDocxImageElements(
      document,
      String.raw`\shppict shplid1025 pngblip bliptag 68656c6c6f}`,
      document.body
    );

    expect(document.querySelector('img')).toBeNull();
  });

  it('replaces vml image wrappers with img elements when rtf recovery succeeds', () => {
    const document = parseHtml(
      '<div><v:shape o:spid="_x0000_s2049"><v:imagedata src="file:///C:/shape.png"></v:imagedata></v:shape></div>'
    );

    cleanDocxImageElements(
      document,
      String.raw`\shp shplid2049 jpegblip bliptag ffd8ff}`,
      document.body
    );

    expect(document.body.firstElementChild?.tagName).toBe('DIV');
    expect(document.body.firstElementChild?.firstElementChild?.tagName).toBe(
      'IMG'
    );
    expect(
      document.body.firstElementChild?.firstElementChild?.getAttribute('src')
    ).toBe('data:image/jpeg;base64,/9j/');
  });
});
