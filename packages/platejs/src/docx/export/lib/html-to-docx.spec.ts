import JSZip from 'jszip';

import { htmlToDocxBlob } from './html-to-docx.internal';

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

  it('converts lists the same whether or not two conversions overlap', async () => {
    const documents = [
      '<div><ol start="1"><li>a</li></ol></div><p>gap</p><div><ol start="2"><li>b</li></ol></div>',
      '<div><ol start="5"><li>c</li></ol></div><p>gap</p><div><ol start="6"><li>d</li></ol></div>',
    ];
    const convert = async (html: string) => {
      const blob = await htmlToDocxBlob(html);
      const zip = await JSZip.loadAsync(await blob.arrayBuffer());

      return Promise.all(
        ['word/document.xml', 'word/numbering.xml'].map((path) =>
          zip.file(path)!.async('string')
        )
      );
    };
    const alone = [];

    for (const html of documents) alone.push(await convert(html));

    expect(await Promise.all(documents.map(convert))).toEqual(alone);
  });

  it('numbers nested lists of one Plate list in its own Word definition', async () => {
    const levels = '{&quot;2&quot;:{&quot;restartAfter&quot;:0}}';
    const list = (start: number, text: string) =>
      `<ol data-list-id="a" data-list-levels="${levels}" start="${start}"><li>${text}</li></ol>`;
    const blob = await htmlToDocxBlob(
      `<ol data-list-id="a" data-list-levels="${levels}"><li>One${list(1, 'One.1')}</li></ol>` +
        `<ol data-list-id="a" data-list-levels="${levels}" start="2"><li>Two${list(2, 'Two.1')}</li></ol>`
    );
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const numbering = await zip.file('word/numbering.xml')!.async('string');

    expect(numbering.match(/<w:abstractNum /g)).toHaveLength(1);
    expect(numbering.match(/<w:num /g)).toHaveLength(1);
    expect(numbering).toContain('<w:lvlRestart w:val="0"/>');
  });

  it('restarts a nested Plate list under each item of one list element', async () => {
    const blob = await htmlToDocxBlob(
      '<ol data-list-id="a"><li>P1<ol data-list-id="a"><li>C1</li></ol></li>' +
        '<li>P2<ol data-list-id="a" start="2"><li>C2</li></ol></li></ol>'
    );
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const numbering = new DOMParser().parseFromString(
      await zip.file('word/numbering.xml')!.async('string'),
      'application/xml'
    );
    const overrides = [...numbering.getElementsByTagName('w:lvlOverride')].map(
      (override) => [
        override.getAttribute('w:ilvl'),
        override
          .getElementsByTagName('w:startOverride')[0]
          ?.getAttribute('w:val'),
      ]
    );

    expect(overrides).toEqual([['1', '2']]);
  });

  it('restarts a second nested Plate list under the same item', async () => {
    const blob = await htmlToDocxBlob(
      '<ol data-list-id="a"><li>P1<ol data-list-id="a"><li>C1</li></ol>' +
        '<ol data-list-id="a"><li>D1</li></ol></li></ol>'
    );
    const zip = await JSZip.loadAsync(await blob.arrayBuffer());
    const numbering = new DOMParser().parseFromString(
      await zip.file('word/numbering.xml')!.async('string'),
      'application/xml'
    );

    expect(
      [...numbering.getElementsByTagName('w:lvlOverride')].map((override) => [
        override.getAttribute('w:ilvl'),
        override
          .getElementsByTagName('w:startOverride')[0]
          ?.getAttribute('w:val'),
      ])
    ).toEqual([['1', '1']]);
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
