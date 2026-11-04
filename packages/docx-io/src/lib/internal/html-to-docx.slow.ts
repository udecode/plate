/**
 * Unit tests for HTML to DOCX converter.
 * Tests the core conversion functionality including:
 * - Basic DOCX file structure
 * - Unit conversions (pixels, points, cm, inches to TWIP)
 * - Color conversions (RGB, HSL, Hex to DOCX format)
 * - Table border handling (including no-border tables)
 * - List indentation
 */

import JSZip from 'jszip';

import { htmlToDocxBlob } from '../html-to-docx';

// Helper to load zip from Blob
async function loadZipFromBlob(blob: Blob): Promise<JSZip> {
  const arrayBuffer = await blob.arrayBuffer();
  return JSZip.loadAsync(arrayBuffer);
}

const RUN_PATTERN = /<w:r>[\s\S]*?<\/w:r>/g;
const RUN_TEXT_PATTERN = /<w:t[^>]*>([\s\S]*?)<\/w:t>/;
const RUN_PROPERTY_PATTERN = /<w:(\w+)[^>]*\/>/g;

function getTextRuns(docXml: string): [string, string[]][] {
  return (docXml.match(RUN_PATTERN) ?? []).map((run) => [
    run.match(RUN_TEXT_PATTERN)?.[1] ?? '',
    [...run.matchAll(RUN_PROPERTY_PATTERN)].map((match) => match[1]).sort(),
  ]);
}

describe('htmlToDocxBlob', () => {
  describe('basic functionality', () => {
    it('returns a Blob', async () => {
      const result = await htmlToDocxBlob('<p>Test</p>');
      expect(result).toBeInstanceOf(Blob);
    });

    it('returns blob with correct MIME type', async () => {
      const result = await htmlToDocxBlob('<p>Test</p>');
      expect(result.type).toBe(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
    });

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

    it('handle empty HTML', async () => {
      const result = await htmlToDocxBlob('');
      expect(result).toBeInstanceOf(Blob);
      expect(result.size).toBeGreaterThan(0);
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
      expect(docXml).toContain('Bold text');
      expect(docXml).toContain('<w:b');
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

    it.each<{ html: string; runs: [string, string[]][] }>([
      {
        html: '<p><em><b>bold italic</b></em></p>',
        runs: [['bold italic', ['b', 'i']]],
      },
      {
        html: '<p><b><em>bold italic</em></b></p>',
        runs: [['bold italic', ['b', 'i']]],
      },
      {
        html: '<p><u><em><b>all three</b></em></u></p>',
        runs: [['all three', ['b', 'i', 'u']]],
      },
      {
        html: '<p><span><u><em><b>x</b></em></u></span></p>',
        runs: [['x', ['b', 'i', 'u']]],
      },
      {
        html: '<p><em><span><b>bold italic</b></span></em></p>',
        runs: [['bold italic', ['b', 'i']]],
      },
      {
        html: '<p><del><ins>x</ins></del></p>',
        runs: [['x', ['strike', 'u']]],
      },
      {
        html: '<p><sup><b>x</b></sup></p>',
        runs: [['x', ['b', 'vertAlign']]],
      },
      {
        html: '<p><kbd><em>x</em></kbd></p>',
        runs: [['x', ['highlight', 'i']]],
      },
      {
        html: '<p><mark><code>x</code></mark></p>',
        runs: [['x', ['highlight']]],
      },
      {
        html: '<p><sub><sup>x</sup></sub></p>',
        runs: [['x', ['vertAlign']]],
      },
      {
        html: '<p><b>a <em>b</em></b></p>',
        runs: [
          ['a ', ['b']],
          ['b', ['b', 'i']],
        ],
      },
      {
        html: '<p><b><em>x</em> tail</b></p>',
        runs: [
          ['x', ['b', 'i']],
          [' tail', ['b']],
        ],
      },
      {
        html: '<p><em>a <b>x</b> c</em></p>',
        runs: [
          ['a ', ['i']],
          ['x', ['b', 'i']],
          [' c', ['i']],
        ],
      },
      {
        html: '<p><em>a</em><b>b</b></p>',
        runs: [
          ['a', ['i']],
          ['b', ['b']],
        ],
      },
      {
        html: '<p><b><em>p <s>q</s></em><u>r</u></b></p>',
        runs: [
          ['p ', ['b', 'i']],
          ['q', ['b', 'i', 'strike']],
          ['r', ['b', 'u']],
        ],
      },
    ])('applies every enclosing formatting tag to each text run of $html', async ({
      html,
      runs,
    }) => {
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(getTextRuns(docXml)).toEqual(runs);
    });

    it('keeps the innermost highlight when highlight tags nest', async () => {
      const result = await htmlToDocxBlob('<p><mark><code>x</code></mark></p>');
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('<w:highlight w:val="lightGray"/>');
      expect(docXml).not.toContain('<w:highlight w:val="yellow"/>');
    });
  });

  describe('line breaks', () => {
    it('writes a <br> as the plain line break Word writes for Shift+Enter', async () => {
      const html = '<p>first line<br>second line</p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('<w:br/>');
      expect(docXml).not.toContain('w:type="textWrapping"');
    });

    it('keeps a page break typed as a page break', async () => {
      const html = '<p>before</p><div class="page-break"></div><p>after</p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('<w:br w:type="page"/>');
    });

    it('declares doNotExpandShiftReturn in settings.xml, before decimalSymbol', async () => {
      const html = '<p>first line<br>second line</p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const settingsXml = await zip.file('word/settings.xml')!.async('string');
      expect(settingsXml).toMatch(
        /<w:compat>\s*<w:doNotExpandShiftReturn\/>\s*<\/w:compat>\s*<w:decimalSymbol/
      );
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

    it('handle list indentation via margin-left', async () => {
      const html = `
        <ul style="margin-left: 24px;">
          <li>Indented item</li>
        </ul>
      `;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Indented item');
    });
  });

  describe('figures and list paragraphs', () => {
    const image =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const figure = `<figure><div><a href="https://example.com"><img src="${image}" style="width: 300px; height: 120px;"></a></div><figcaption><strong><em>Caption</em></strong></figcaption></figure>`;

    it.each([
      ['body', `<div>${figure}</div>`],
      ['table', `<table><tr><td>${figure}</td></tr></table>`],
      [
        'wrapped table',
        `<table><tr><td><div><div>${figure}</div></div></td></tr></table>`,
      ],
      [
        'unordered list',
        `<ul><li><p>Before</p><div>${figure}</div><p>After</p></li></ul>`,
      ],
      [
        'ordered list',
        `<ol><li><p>Before</p><div>${figure}</div><p>After</p></li></ol>`,
      ],
    ])('keeps image bytes and rich captions in a %s', async (_, html) => {
      const zip = await loadZipFromBlob(await htmlToDocxBlob(html));
      const docXml = await zip.file('word/document.xml')!.async('string');
      const media = zip.file(/^word\/media\/.+\.png$/);

      expect(docXml.match(/<w:drawing>/g)).toHaveLength(1);
      expect(media.length).toBeGreaterThan(0);
      for (const file of media) {
        expect(await file.async('base64')).toBe(image.split(',')[1]);
      }
      expect(docXml).toContain('cx="2857500" cy="1143000"');
      expect(
        getTextRuns(docXml)
          .filter(([text]) => text)
          .map(([text, marks]) => [
            text,
            marks.filter((mark) => mark !== 'rPr'),
          ])
      ).toEqual(
        html.includes('Before')
          ? [
              ['Before', []],
              ['Caption', ['b', 'i']],
              ['After', []],
            ]
          : [['Caption', ['b', 'i']]]
      );
    });

    it.each([
      'display: block',
      'width: 800px; height: 800px',
    ])('fits a table-cell image with %s within its column', async (style) => {
      const image =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAMgAQMAAADhvpQrAAAABlBMVEXlMzP////nT4D1AAAAZUlEQVR4nO3BMQEAAADCoPVPbQZ/oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHgMO68AAUDTJYcAAAAASUVORK5CYII=';
      const html = `<table><tr><td><p>Before</p><p><img src="${image}" style="${style}"></p><p><strong>Caption</strong></p><p>After</p></td><td><p>Other cell</p></td></tr></table>`;
      const zip = await loadZipFromBlob(await htmlToDocxBlob(html));
      const docXml = await zip.file('word/document.xml')!.async('string');

      expect(docXml).toContain('cx="2540000" cy="2540000"');
    });

    it.each([
      'ul',
      'ol',
    ])('indents and fits an image under its %s item', async (tag) => {
      const html = `<${tag}><li>One</li><li><p>Two</p><div><figure><img src="${image}" style="width: 600px; height: 240px"><figcaption><strong>Caption</strong></figcaption></figure></div></li><li>Three</li></${tag}>`;
      const zip = await loadZipFromBlob(await htmlToDocxBlob(html));
      const docXml = await zip.file('word/document.xml')!.async('string');
      const paragraphs =
        docXml.match(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g) ?? [];
      const imageParagraph = paragraphs.find((paragraph) =>
        paragraph.includes('<w:drawing>')
      );

      expect(imageParagraph).toContain('<w:ind w:left="360"/>');
      expect(imageParagraph).toContain('cx="5257800" cy="2103120"');
    });

    it('fits a list image inside the table cell content area', async () => {
      const html = `<table><tr><td><ul><li><p>Item</p><figure><img src="${image}" style="width: 600px; height: 240px"><figcaption>Caption</figcaption></figure></li></ul></td><td>Other</td></tr></table>`;
      const zip = await loadZipFromBlob(await htmlToDocxBlob(html));
      const docXml = await zip.file('word/document.xml')!.async('string');

      expect(docXml).toContain('cx="2311400" cy="924560"');
    });

    it.each([
      'ul',
      'ol',
    ])('keeps continuation paragraphs and nesting in %s', async (tag) => {
      const html = `<${tag}><li><div>First <strong>bold</strong></div><p>Continuation</p><ul><li>Nested</li></ul><p>After nested</p></li><li>Second</li></${tag}>`;
      const zip = await loadZipFromBlob(await htmlToDocxBlob(html));
      const docXml = await zip.file('word/document.xml')!.async('string');
      const paragraphs =
        docXml.match(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g) ?? [];

      expect(
        paragraphs.map((paragraph) =>
          getTextRuns(paragraph).map(([text, marks]) => [
            text,
            marks.filter((mark) => mark !== 'rPr'),
          ])
        )
      ).toEqual([
        [
          ['First ', []],
          ['bold', ['b']],
        ],
        [['Continuation', []]],
        [['Nested', []]],
        [['After nested', []]],
        [['Second', []]],
      ]);
      expect(
        paragraphs.map((paragraph) => paragraph.includes('<w:numPr>'))
      ).toEqual([true, false, true, false, true]);
      expect(paragraphs[2]).toContain('<w:ilvl w:val="1"/>');
      expect(paragraphs[1]).toContain('<w:ind w:left="360"/>');
      expect(paragraphs[3]).toContain('<w:ind w:left="360"/>');
    });

    const getListRows = async (html: string) => {
      const zip = await loadZipFromBlob(await htmlToDocxBlob(html));
      const docXml = await zip.file('word/document.xml')!.async('string');

      return (docXml.match(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g) ?? []).map(
        (paragraph) => [
          paragraph.includes('<w:drawing>')
            ? 'image'
            : getTextRuns(paragraph)
                .map(([text]) => text)
                .join(''),
          paragraph.includes('<w:numPr>')
            ? 'marker'
            : paragraph.match(/<w:ind [^>]*\/>/)?.[0],
        ]
      );
    };

    it('keeps line breaks and inline elements in the list item paragraph', async () => {
      expect(
        await getListRows('<ul><li>Line one<br>Press <kbd>Ctrl</kbd></li></ul>')
      ).toEqual([['Line onePress Ctrl', 'marker']]);
    });

    it('starts a paragraph for each block after a list item paragraph', async () => {
      expect(
        await getListRows(
          '<ul><li><p>A</p><blockquote>B</blockquote><pre>C</pre></li></ul>'
        )
      ).toEqual([
        ['A', 'marker'],
        ['B', '<w:ind w:left="360"/>'],
        ['C', '<w:ind w:left="360"/>'],
      ]);
    });

    it('marks a list item that starts with a figure and indents the rest', async () => {
      expect(
        await getListRows(
          `<ul><li><div>${figure}</div><p>After</p></li><li><p>Before</p><div>${figure}</div></li></ul>`
        )
      ).toEqual([
        ['image', 'marker'],
        ['Caption', '<w:ind w:left="360"/>'],
        ['After', '<w:ind w:left="360"/>'],
        ['Before', 'marker'],
        ['image', '<w:ind w:left="360"/>'],
        ['Caption', '<w:ind w:left="360"/>'],
      ]);
    });

    it('keeps a Plate static image beside its void spacer in a list item', async () => {
      const plateImage = `<div data-slate-node="element" data-slate-void="true">${figure}<span data-slate-spacer="true"><span data-slate-zero-width="z">﻿<br></span></span></div>`;

      expect(await getListRows(`<ol><li>${plateImage}</li></ol>`)).toEqual([
        ['image', 'marker'],
        ['Caption', '<w:ind w:left="360"/>'],
      ]);
    });

    it.each([
      ['an image it cannot export', '<img src="https://example.com/a.png">'],
      [
        'a table',
        '<table><tr><td>Cell</td></tr></table><figcaption>Caption</figcaption>',
      ],
      ['no image, table or caption', '<p>Quote</p>'],
    ])('keeps the number of a list item whose figure starts with %s', async (_, part) => {
      const html = `<ol><li>One</li><li><figure>${part}</figure></li><li>Three</li></ol>`;
      const zip = await loadZipFromBlob(await htmlToDocxBlob(html));
      const docXml = await zip.file('word/document.xml')!.async('string');

      expect(docXml.match(/<w:numPr>/g)).toHaveLength(3);
    });

    it('fits an image that starts a list item to the item text width', async () => {
      const html = `<ul><li><figure><img src="${image}" style="width: 600px; height: 240px"></figure></li></ul>`;
      const zip = await loadZipFromBlob(await htmlToDocxBlob(html));
      const docXml = await zip.file('word/document.xml')!.async('string');

      expect(docXml).toContain('<w:numPr>');
      expect(docXml).toContain('cx="5257800" cy="2103120"');
    });

    it('keeps a table inside a figure in a list item', async () => {
      const html =
        '<ul><li><p>Before</p><figure><table><tr><td>Cell</td></tr></table><figcaption>Caption</figcaption></figure></li></ul>';
      const zip = await loadZipFromBlob(await htmlToDocxBlob(html));
      const docXml = await zip.file('word/document.xml')!.async('string');

      expect(docXml.match(/<w:tbl>[\s\S]*?<\/w:tbl>/g)).toEqual([
        expect.stringContaining('Cell'),
      ]);
      expect(docXml).toContain('Caption');
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

  describe('equations', () => {
    it('ignores non-equation XML in equation attributes', async () => {
      const foreignMarkup =
        '<w:r xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:t>foreign-equation-markup</w:t></w:r>';
      const html = `<div data-equation-omml='${foreignMarkup}'>block fallback</div><p><span data-equation-omml='${foreignMarkup}'>inline fallback</span></p>`;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).not.toContain('foreign-equation-markup');
      expect(docXml).toContain('block fallback');
      expect(docXml).toContain('inline fallback');
    });

    it('preserves block and inline OMML equations', async () => {
      const mathNamespace =
        'http://schemas.openxmlformats.org/officeDocument/2006/math';
      const blockEquation = `<m:oMathPara xmlns:m="${mathNamespace}"><m:oMath><m:r><m:t>block-equation</m:t></m:r></m:oMath></m:oMathPara>`;
      const inlineEquation = `<m:oMath xmlns:m="${mathNamespace}"><m:r><m:t>inline-equation</m:t></m:r></m:oMath>`;
      const html = `<div data-equation-omml='${blockEquation}'>block fallback</div><p><span data-equation-omml='${inlineEquation}'>inline fallback</span></p>`;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('<m:oMathPara');
      expect(docXml).toContain('block-equation');
      expect(docXml).toContain('inline-equation');
      expect(docXml).not.toContain('block fallback');
      expect(docXml).not.toContain('inline fallback');
    });

    it('preserves equation content without foreign XML descendants', async () => {
      const equation =
        '<m:oMath xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><m:r><m:t>safe-equation</m:t></m:r><w:r><w:t>foreign-descendant</w:t></w:r></m:oMath>';
      const html = `<p><span data-equation-omml='${equation}'>inline fallback</span></p>`;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('safe-equation');
      expect(docXml).not.toContain('foreign-descendant');
      expect(docXml).not.toContain('inline fallback');
    });

    it('preserves equation content without foreign XML attributes', async () => {
      const equation =
        '<m:oMath xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="foreign-relationship"><m:r><m:t>safe-attributes</m:t></m:r></m:oMath>';
      const html = `<p><span data-equation-omml='${equation}'>inline fallback</span></p>`;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('safe-attributes');
      expect(docXml).not.toContain('foreign-relationship');
      expect(docXml).not.toContain('inline fallback');
    });

    it('preserves math attributes used by OMML', async () => {
      const equation =
        '<m:oMath xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"><m:r><m:rPr><m:sty m:val="p"/></m:rPr><m:t xml:space="preserve"> spaced-equation </m:t></m:r></m:oMath>';
      const html = `<p><span data-equation-omml='${equation}'>inline fallback</span></p>`;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('m:val="p"');
      expect(docXml).toContain(' spaced-equation ');
    });

    it('ignores equation attributes with multiple roots', async () => {
      const mathNamespace =
        'http://schemas.openxmlformats.org/officeDocument/2006/math';
      const equations = `<m:oMath xmlns:m="${mathNamespace}"><m:r><m:t>first-root</m:t></m:r></m:oMath><m:oMath xmlns:m="${mathNamespace}"><m:r><m:t>second-root</m:t></m:r></m:oMath>`;
      const html = `<p><span data-equation-omml='${equations}'>inline fallback</span></p>`;
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).not.toContain('first-root');
      expect(docXml).not.toContain('second-root');
      expect(docXml).toContain('inline fallback');
    });
  });

  describe('special characters', () => {
    it('handle Unicode characters', async () => {
      const html = '<p>Hello World</p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Hello World');
    });

    it('handle CJK characters', async () => {
      const html = '<p>Hello World</p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Hello World');
    });

    it('handle emojis', async () => {
      const html = '<p>Hello World</p>';
      const result = await htmlToDocxBlob(html);
      const zip = await loadZipFromBlob(result);

      const docXml = await zip.file('word/document.xml')!.async('string');
      expect(docXml).toContain('Hello World');
    });
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

  describe('paragraph and heading spacing', () => {
    async function readSpacing(options?: Parameters<typeof htmlToDocxBlob>[1]) {
      const zip = await loadZipFromBlob(
        await htmlToDocxBlob('<p>Test</p>', options)
      );
      const styles = new DOMParser().parseFromString(
        await zip.file('word/styles.xml')!.async('string'),
        'application/xml'
      );
      const spacingOf = (element: Element | undefined) =>
        Object.fromEntries(
          Array.from(
            element?.getElementsByTagName('w:spacing')[0]?.attributes ?? []
          ).map((attribute) => [attribute.name.slice(2), attribute.value])
        );
      const styleElements = Array.from(styles.getElementsByTagName('w:style'));

      return {
        headings: [1, 2, 3, 4, 5, 6].map((level) =>
          spacingOf(
            styleElements.find(
              (style) => style.getAttribute('w:styleId') === `Heading${level}`
            )
          )
        ),
        paragraph: spacingOf(styles.getElementsByTagName('w:pPrDefault')[0]),
      };
    }

    it('keep the default spacing when no spacing option is set', async () => {
      expect(await readSpacing()).toEqual({
        headings: [
          { before: '480' },
          { after: '80', before: '360' },
          { after: '80', before: '280' },
          { after: '40', before: '240' },
          { after: '40', before: '220' },
          { after: '40', before: '200' },
        ],
        paragraph: { after: '120', line: '240', lineRule: 'atLeast' },
      });
    });

    it('set the default paragraph spacing, zero included', async () => {
      const defaults = await readSpacing();
      const spacing = await readSpacing({
        paragraphSpacing: { after: 0, before: 40 },
      });

      expect(spacing.paragraph).toEqual({
        after: '0',
        before: '40',
        line: '240',
        lineRule: 'atLeast',
      });
      expect(spacing.headings).toEqual(defaults.headings);
      expect(
        (await readSpacing({ paragraphSpacing: { after: 119.6 } })).paragraph
          .after
      ).toBe('120');
    });

    it('set the spacing of every heading style and keep the keys left out', async () => {
      const defaults = await readSpacing();
      const both = await readSpacing({
        headingSpacing: { after: 0, before: 20 },
      });
      const afterOnly = await readSpacing({ headingSpacing: { after: 0 } });

      expect(both.headings).toEqual(
        defaults.headings.map(() => ({ after: '0', before: '20' }))
      );
      expect(afterOnly.headings).toEqual(
        defaults.headings.map(({ before }) => ({ after: '0', before }))
      );
      expect(both.paragraph).toEqual(defaults.paragraph);
    });

    it('reject a spacing that is not a non-negative number', async () => {
      await expect(
        htmlToDocxBlob('<p>Test</p>', {
          paragraphSpacing: { after: Number.NaN },
        })
      ).rejects.toThrow(RangeError);
      await expect(
        htmlToDocxBlob('<p>Test</p>', { headingSpacing: { before: -1 } })
      ).rejects.toThrow(RangeError);
      await expect(
        htmlToDocxBlob('<p>Test</p>', { paragraphSpacing: { before: 1e21 } })
      ).rejects.toThrow(RangeError);
    });
  });

  describe('Plate static voids', () => {
    const plateImage = `<div data-slate-node="element" data-slate-void="true"><figure><div><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="></div><figcaption>Caption</figcaption></figure><span data-slate-spacer="true" style="color:transparent;height:0;outline:none;position:absolute"><span data-slate-node="text"><span data-slate-leaf="true"><span data-slate-zero-width="z" data-slate-length="0">\uFEFF<br></span></span></span></span></div>`;

    it.each([
      ['the body', `${plateImage}<p>After</p>`],
      [
        'a table cell',
        `<table><tr><td>${plateImage}</td><td>Other</td></tr></table>`,
      ],
    ])('writes no paragraph for the spacer of an image in %s', async (_, html) => {
      const zip = await loadZipFromBlob(await htmlToDocxBlob(html));
      const docXml = await zip.file('word/document.xml')!.async('string');
      const paragraphTexts = (
        docXml.match(/<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g) ?? []
      ).map((paragraph) =>
        [...paragraph.matchAll(/<w:t(?:\s[^>]*)?>([^<]*)<\/w:t>/g)]
          .map((match) => match[1])
          .join('')
      );

      expect(paragraphTexts).not.toContain('\uFEFF');
    });
  });
});
