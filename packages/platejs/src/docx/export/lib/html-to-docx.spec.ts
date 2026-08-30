import JSZip from 'jszip';

import { htmlToDocxBlob } from './html-to-docx';

describe('htmlToDocxBlob', () => {
  afterEach(() => {
    mock.restore();
  });

  it('normalizes empty html into a valid DOCX blob', async () => {
    const blob = await htmlToDocxBlob('   ', {
      orientation: 'landscape',
    });

    expect(blob.size).toBeGreaterThan(0);
    expect(blob.type).toBe(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
  });

  it('fetches remote images only when explicitly enabled', async () => {
    const png = Uint8Array.from(
      atob(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='
      ),
      (character) => character.codePointAt(0) ?? 0
    );
    const fetchSpy = spyOn(globalThis, 'fetch').mockImplementation(
      async () => new Response(png)
    );
    const html = '<img src="https://example.com/image.png" />';

    await expect(htmlToDocxBlob(html)).resolves.toBeInstanceOf(Blob);
    expect(fetchSpy).not.toHaveBeenCalled();

    await expect(
      htmlToDocxBlob(html, { allowRemoteImages: true })
    ).resolves.toBeInstanceOf(Blob);
    expect(fetchSpy).toHaveBeenCalledWith('https://example.com/image.png');
  });

  it('preserves paragraph content after a disabled remote image', async () => {
    const blob = await htmlToDocxBlob(
      '<p>before <img src="https://example.com/image.png" /> after</p>'
    );
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const documentXml = await zip.file('word/document.xml')!.async('string');

    expect(documentXml).toContain('before ');
    expect(documentXml).toContain(' after');
  });

  it('embeds trusted data URI images without remote fetches', async () => {
    const fetchSpy = spyOn(globalThis, 'fetch').mockImplementation(async () => {
      throw new Error('unexpected fetch');
    });

    await expect(
      htmlToDocxBlob(
        '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=" />'
      )
    ).resolves.toBeInstanceOf(Blob);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
