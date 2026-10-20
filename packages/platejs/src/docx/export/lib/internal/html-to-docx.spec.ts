import JSZip from 'jszip';

import { htmlToDocxBlob } from '../html-to-docx.internal';

async function loadZipFromBlob(blob: Blob): Promise<JSZip> {
  const arrayBuffer = await blob.arrayBuffer();
  return JSZip.loadAsync(arrayBuffer);
}

describe('htmlToDocxBlob', () => {
  describe('basic functionality', () => {
    it('create a valid DOCX (ZIP) file structure', async () => {
      const result = await htmlToDocxBlob('<p>Test</p>');
      const zip = await loadZipFromBlob(result);

      // DOCX must contain these required files
      expect(zip.file('[Content_Types].xml')).not.toBeNull();
      expect(zip.file('_rels/.rels')).not.toBeNull();
      expect(zip.file('word/document.xml')).not.toBeNull();
      expect(zip.file('word/styles.xml')).not.toBeNull();
    });

    it('include content in document.xml', async () => {
      const htmlContent = '<p>Hello World</p>';
      const result = await htmlToDocxBlob(htmlContent);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Hello World');
    });
  });

  describe('document orientation', () => {
    it('default to portrait orientation', async () => {
      const result = await htmlToDocxBlob('<p>Test</p>');
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('<w:sectPr');
      expect(docXml).toContain('<w:pgSz');
      expect(docXml).toContain('w:orient="portrait"');
    });

    it('support landscape orientation', async () => {
      const result = await htmlToDocxBlob('<p>Test</p>', {
        orientation: 'landscape',
      });
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('w:orient="landscape"');
    });
  });

  describe('text formatting', () => {
    it('handle bold text', async () => {
      const html = '<p><strong>Bold text</strong></p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      const document = new DOMParser().parseFromString(
        docXml,
        'application/xml'
      );
      const w = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
      // The test DOM's getElementsByTagNameNS finds nothing and its attributes
      // carry no namespace, so elements match on namespaceURI and val shares
      // its element's prefix.
      const named = (root: Document | Element, localName: string) =>
        [...root.getElementsByTagName('*')].filter(
          (element) =>
            element.namespaceURI === w && element.localName === localName
        );
      // WordprocessingML turns bold off with val 0, false or off.
      const isBold = (run: Element) =>
        named(run, 'b').some((bold) => {
          const prefix = bold.tagName.slice(0, bold.tagName.indexOf(':') + 1);

          return !['0', 'false', 'off'].includes(
            bold.getAttribute(`${prefix}val`) ?? 'true'
          );
        });
      const boldText = named(document, 'r')
        .filter(isBold)
        .flatMap((run) => named(run, 't').map((text) => text.textContent))
        .join('');

      expect(boldText).toBe('Bold text');
    });

    it('handle italic text', async () => {
      const html = '<p><em>Italic text</em></p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Italic text');
      expect(docXml).toContain('<w:i');
    });

    it('handle underlined text', async () => {
      const html = '<p><u>Underlined text</u></p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Underlined text');
      expect(docXml).toContain('<w:u');
    });

    it('handle strikethrough text', async () => {
      const html = '<p><s>Strikethrough text</s></p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Strikethrough text');
      expect(docXml).toContain('<w:strike');
    });
  });

  describe('headings', () => {
    it('handle h1-h6 headings', async () => {
      const html = `
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <h4>Heading 4</h4>
        <h5>Heading 5</h5>
        <h6>Heading 6</h6>
      `;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Heading 1');
      expect(docXml).toContain('Heading 6');
      expect(docXml).toContain('Heading1');
      expect(docXml).toContain('Heading2');
    });
  });

  describe('tables', () => {
    it('handle basic tables', async () => {
      const html = `
        <table>
          <tr><th>Header 1</th><th>Header 2</th></tr>
          <tr><td>Cell 1</td><td>Cell 2</td></tr>
        </table>
      `;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Header 1');
      expect(docXml).toContain('Cell 1');
      expect(docXml).toContain('<w:tbl');
    });

    it('handle tables with border-collapse', async () => {
      const html = `
        <table style="border-collapse: collapse; border: 1px solid black;">
          <tr><td>Cell 1</td><td>Cell 2</td></tr>
        </table>
      `;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('<w:tbl');
      expect(docXml).toContain('<w:tblBorders');
    });

    it('does not add borders for tables with border: none', async () => {
      const html = `
        <table style="border: none; border-collapse: collapse;">
          <tr>
            <td style="border: none;">Cell 1</td>
            <td style="border: none;">Cell 2</td>
          </tr>
        </table>
      `;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('<w:tbl');
      // Should NOT have tblBorders element when border is none
      expect(docXml).not.toContain('<w:tblBorders');
    });

    it('does not add borders for tables with border: 0', async () => {
      const html = `
        <table style="border: 0; border-collapse: collapse;">
          <tr>
            <td style="border: 0;">Cell 1</td>
          </tr>
        </table>
      `;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('<w:tbl');
      // Should NOT have tblBorders element when border is 0
      expect(docXml).not.toContain('<w:tblBorders');
    });
  });

  describe('lists', () => {
    it('handle unordered lists', async () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Item 1');
      expect(docXml).toContain('Item 2');
    });

    it('handle ordered lists', async () => {
      const html = '<ol><li>First</li><li>Second</li></ol>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('First');
      expect(docXml).toContain('Second');
    });

    it('handle nested lists', async () => {
      const html = `
        <ul>
          <li>Item 1
            <ul>
              <li>Nested Item 1</li>
            </ul>
          </li>
        </ul>
      `;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Item 1');
      expect(docXml).toContain('Nested Item 1');
    });
  });

  describe('links', () => {
    it('handle hyperlinks', async () => {
      const html = '<p><a href="https://example.com">Click here</a></p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Click here');
      expect(docXml).toContain('<w:hyperlink');
    });
  });

  describe('special characters', () => {
    it.each(['Café naïve résumé', '你好世界 日本語 한국어', 'Hello 👋🌍🧑‍💻'])(
      'preserves %s in document text',
      async (text) => {
        const result = await htmlToDocxBlob(`<p>${text}</p>`);
        const zip = await loadZipFromBlob(result);
        const docXml = await zip.file('word/document.xml')!.async('string');
        const document = new DOMParser().parseFromString(
          docXml,
          'application/xml'
        );

        expect(
          Array.from(
            document.getElementsByTagName('w:t'),
            (node) => node.textContent
          ).join('')
        ).toBe(text);
      }
    );
  });

  describe('code blocks', () => {
    it('handle inline code', async () => {
      const html = '<p><code>inline code</code></p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('inline code');
    });

    it('handle code blocks', async () => {
      const html = '<pre><code>const x = 1;</code></pre>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('const x = 1;');
    });
  });

  describe('blockquote', () => {
    it('handle blockquotes', async () => {
      const html = '<blockquote>This is a quote</blockquote>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('This is a quote');
    });
  });
});
