import JSZip from 'jszip';

import {
  findDocxSourceViolations,
  type DocxSourceViolation,
} from '../../internal/sourceEligibility';
import {
  DEFAULT_DOCX_IMPORT_LIMITS,
  readBoundedDocxPackage,
} from './docxPackage';

const WORD = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const RELATIONSHIPS =
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const WORDML = 'application/vnd.openxmlformats-officedocument.wordprocessingml';
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0]);

type Relationship = Readonly<{
  external?: boolean;
  target: string;
  type: string;
}>;

type PackageSpec = Readonly<{
  bodyXml?: string;
  documentRelationships?: readonly Relationship[];
  overrides?: Readonly<Record<string, string>>;
  parts?: Readonly<Record<string, string | Uint8Array>>;
  rootRelationships?: readonly Relationship[];
}>;

const relationships = (items: readonly Relationship[]) =>
  `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${items
    .map(
      ({ external, target, type }, index) =>
        `<Relationship Id="rId${index + 1}" Type="${type}" Target="${target}"${
          external ? ' TargetMode="External"' : ''
        }/>`
    )
    .join('')}</Relationships>`;

const wordPart = (root: string, content: string) =>
  `<w:${root} xmlns:w="${WORD}" xmlns:r="${RELATIONSHIPS}" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">${content}</w:${root}>`;

// A minimal package in the shape the writer and Word produce.
const docx = async ({
  bodyXml = '<w:p><w:r><w:t>Body</w:t></w:r></w:p>',
  documentRelationships = [],
  overrides = {},
  parts = {},
  rootRelationships = [],
}: PackageSpec = {}) => {
  const zip = new JSZip();
  const contentTypes = {
    '/word/document.xml': `${WORDML}.document.main+xml`,
    '/word/styles.xml': `${WORDML}.styles+xml`,
    ...overrides,
  };

  zip.file(
    '[Content_Types].xml',
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/>${Object.entries(
      contentTypes
    )
      .map(
        ([part, type]) => `<Override PartName="${part}" ContentType="${type}"/>`
      )
      .join('')}</Types>`
  );
  zip.file(
    '_rels/.rels',
    relationships([
      { target: 'word/document.xml', type: `${RELATIONSHIPS}/officeDocument` },
      ...rootRelationships,
    ])
  );
  zip.file(
    'word/document.xml',
    wordPart('document', `<w:body>${bodyXml}</w:body>`)
  );
  zip.file(
    'word/_rels/document.xml.rels',
    relationships([
      { target: 'styles.xml', type: `${RELATIONSHIPS}/styles` },
      ...documentRelationships,
    ])
  );
  zip.file('word/styles.xml', wordPart('styles', ''));
  for (const [name, value] of Object.entries(parts)) zip.file(name, value);

  return zip.generateAsync({ type: 'arraybuffer' });
};

const violations = async (spec?: PackageSpec) =>
  findDocxSourceViolations(
    await readBoundedDocxPackage(await docx(spec), DEFAULT_DOCX_IMPORT_LIMITS)
  );

const complexField = (instruction: string) =>
  `<w:p><w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve">${instruction}</w:instrText></w:r><w:r><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:t>1</w:t></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>`;

describe('DOCX source eligibility', () => {
  it('admits writer and passive Word parts, safe hyperlinks and the writer page field', async () => {
    expect(
      await violations({
        bodyXml: `<w:p><w:r><w:t>Body</w:t></w:r><w:r><w:pict><v:shape style="width:10pt"><v:textbox><w:txbxContent><w:p/></w:txbxContent></v:textbox></v:shape></w:pict></w:r></w:p><w:sectPr><w:footerReference w:type="default" r:id="rId2"/></w:sectPr>`,
        documentRelationships: [
          { target: 'footer1.xml', type: `${RELATIONSHIPS}/footer` },
          { target: 'footnotes.xml', type: `${RELATIONSHIPS}/footnotes` },
          { target: 'media/image1.png', type: `${RELATIONSHIPS}/image` },
          {
            target: 'stylesWithEffects.xml',
            type: 'http://schemas.microsoft.com/office/2007/relationships/stylesWithEffects',
          },
          { target: 'comments.xml', type: `${RELATIONSHIPS}/comments` },
          {
            external: true,
            target: 'https://example.test/guide',
            type: `${RELATIONSHIPS}/hyperlink`,
          },
          {
            external: true,
            target: 'mailto:team@example.test',
            type: `${RELATIONSHIPS}/hyperlink`,
          },
          {
            target: 'commentsIds.xml',
            type: 'http://schemas.microsoft.com/office/2016/09/relationships/commentsIds',
          },
          {
            target: 'people.xml',
            type: 'http://schemas.microsoft.com/office/2011/relationships/people',
          },
        ],
        overrides: {
          '/docProps/custom.xml':
            'application/vnd.openxmlformats-officedocument.custom-properties+xml',
          '/word/comments.xml': `${WORDML}.comments+xml`,
          '/word/commentsIds.xml': `${WORDML}.commentsIds+xml`,
          '/word/footer1.xml': `${WORDML}.footer+xml`,
          '/word/footnotes.xml': `${WORDML}.footnotes+xml`,
          '/word/people.xml': `${WORDML}.people+xml`,
          '/word/stylesWithEffects.xml':
            'application/vnd.ms-word.stylesWithEffects+xml',
        },
        parts: {
          'docProps/custom.xml':
            '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/custom-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><property name="Client"><vt:lpwstr>Acme</vt:lpwstr></property></Properties>',
          'docProps/thumbnail.png': PNG,
          'word/comments.xml': wordPart('comments', ''),
          'word/commentsIds.xml':
            '<w16cid:commentsIds xmlns:w16cid="http://schemas.microsoft.com/office/word/2016/wordml/cid"/>',
          'word/footer1.xml': wordPart(
            'ftr',
            '<w:p><w:fldSimple w:instr="PAGE"><w:r/></w:fldSimple></w:p>'
          ),
          'word/footnotes.xml': wordPart('footnotes', complexField(' PAGE ')),
          'word/media/image1.png': PNG,
          'word/people.xml':
            '<w15:people xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml"/>',
          'word/stylesWithEffects.xml': wordPart('styles', ''),
        },
        rootRelationships: [
          {
            target: 'docProps/custom.xml',
            type: `${RELATIONSHIPS}/custom-properties`,
          },
          {
            target: 'docProps/thumbnail.png',
            type: 'http://schemas.openxmlformats.org/package/2006/relationships/metadata/thumbnail',
          },
        ],
      })
    ).toEqual([]);
  });

  it.each<[string, PackageSpec, Omit<DocxSourceViolation, 'detail'>]>([
    [
      'a macro project',
      {
        documentRelationships: [
          {
            target: 'vbaProject.bin',
            type: 'http://schemas.microsoft.com/office/2006/relationships/vbaProject',
          },
        ],
        parts: { 'word/vbaProject.bin': new Uint8Array([1]) },
      },
      { feature: 'relationship', part: 'word/_rels/document.xml.rels' },
    ],
    [
      'an external template',
      {
        documentRelationships: [
          { target: 'settings.xml', type: `${RELATIONSHIPS}/settings` },
        ],
        overrides: { '/word/settings.xml': `${WORDML}.settings+xml` },
        parts: {
          'word/_rels/settings.xml.rels': relationships([
            {
              external: true,
              target: 'https://example.test/remote.dotm',
              type: `${RELATIONSHIPS}/attachedTemplate`,
            },
          ]),
          'word/settings.xml': wordPart(
            'settings',
            '<w:attachedTemplate r:id="rId1"/>'
          ),
        },
      },
      {
        feature: 'external-relationship',
        part: 'word/_rels/settings.xml.rels',
      },
    ],
    [
      'an imported chunk',
      { bodyXml: '<w:altChunk r:id="rIdChunk"/>' },
      { feature: 'active-content', part: 'word/document.xml' },
    ],
    [
      'an OLE object',
      {
        bodyXml:
          '<w:p><w:r><w:object><o:OLEObject ProgID="Package"/></w:object></w:r></w:p>',
      },
      { feature: 'active-content', part: 'word/document.xml' },
    ],
    [
      'an ActiveX control',
      { bodyXml: '<w:p><w:r><w:control r:id="rIdControl"/></w:r></w:p>' },
      { feature: 'active-content', part: 'word/document.xml' },
    ],
    [
      'a script hyperlink',
      {
        bodyXml:
          '<w:p><w:hyperlink r:id="rId2"><w:r><w:t>Link</w:t></w:r></w:hyperlink></w:p>',
        documentRelationships: [
          {
            external: true,
            target: 'javascript:alert(1)',
            type: `${RELATIONSHIPS}/hyperlink`,
          },
        ],
      },
      {
        feature: 'external-relationship',
        part: 'word/_rels/document.xml.rels',
      },
    ],
    [
      'a relative hyperlink without a document base',
      {
        documentRelationships: [
          {
            external: true,
            target: 'notes/next.docx',
            type: `${RELATIONSHIPS}/hyperlink`,
          },
        ],
      },
      {
        feature: 'external-relationship',
        part: 'word/_rels/document.xml.rels',
      },
    ],
    [
      'a linked external image',
      {
        documentRelationships: [
          {
            external: true,
            target: 'https://example.test/pixel.png',
            type: `${RELATIONSHIPS}/image`,
          },
        ],
      },
      {
        feature: 'external-relationship',
        part: 'word/_rels/document.xml.rels',
      },
    ],
    [
      'a DDE field',
      {
        bodyXml:
          '<w:p><w:fldSimple w:instr=" DDEAUTO c:\\\\windows\\\\system32\\\\cmd.exe "/></w:p>',
      },
      { feature: 'field-instruction', part: 'word/document.xml' },
    ],
    [
      'an external picture field',
      {
        bodyXml: complexField(' INCLUDEPICTURE "https://example.test/a.png" '),
      },
      { feature: 'field-instruction', part: 'word/document.xml' },
    ],
    [
      'a page field with switches',
      { bodyXml: complexField(' PAGE \\* MERGEFORMAT ') },
      { feature: 'field-instruction', part: 'word/document.xml' },
    ],
    [
      'a conditional field around a page field',
      {
        bodyXml:
          '<w:p><w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText>IF </w:instrText></w:r><w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText>PAGE</w:instrText></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r><w:r><w:instrText> = 1 "a" "b"</w:instrText></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>',
      },
      { feature: 'field-instruction', part: 'word/document.xml' },
    ],
    [
      'an unterminated field',
      {
        bodyXml:
          '<w:p><w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText>PAGE</w:instrText></w:r></w:p>',
      },
      { feature: 'field-instruction', part: 'word/document.xml' },
    ],
    [
      'an XML processing instruction',
      {
        parts: {
          'word/styles.xml': `<?xml-stylesheet href="https://example.test/a.xsl" type="text/xsl"?>${wordPart('styles', '')}`,
        },
      },
      { feature: 'processing-instruction', part: 'word/styles.xml' },
    ],
    [
      'a VML destination attribute',
      {
        bodyXml:
          '<w:p><w:r><w:pict><v:shape href="https://example.test/"/></w:pict></w:r></w:p>',
      },
      { feature: 'resource-url', part: 'word/document.xml' },
    ],
    [
      'unrecognized markup',
      {
        bodyXml:
          '<w:p><x:widget xmlns:x="urn:example:widget"/><w:r><w:t>Body</w:t></w:r></w:p>',
      },
      { feature: 'markup', part: 'word/document.xml' },
    ],
    [
      'an SVG image',
      {
        documentRelationships: [
          { target: 'media/icon.svg', type: `${RELATIONSHIPS}/image` },
        ],
        overrides: { '/word/media/icon.svg': 'image/svg+xml' },
        parts: {
          'word/media/icon.svg': '<svg xmlns="http://www.w3.org/2000/svg"/>',
        },
      },
      { feature: 'part', part: 'word/media/icon.svg' },
    ],
    [
      'an image whose bytes are not its declared raster type',
      {
        documentRelationships: [
          { target: 'media/image1.png', type: `${RELATIONSHIPS}/image` },
        ],
        parts: { 'word/media/image1.png': '<html><script></script></html>' },
      },
      { feature: 'raster', part: 'word/media/image1.png' },
    ],
    [
      'an unreferenced part',
      { parts: { 'custom/orphan.png': PNG } },
      { feature: 'part', part: 'custom/orphan.png' },
    ],
    [
      'a Word part stored outside an XML part name',
      {
        documentRelationships: [
          { target: 'header1.bin', type: `${RELATIONSHIPS}/header` },
        ],
        overrides: { '/word/header1.bin': `${WORDML}.header+xml` },
        parts: { 'word/header1.bin': wordPart('hdr', '') },
      },
      { feature: 'part', part: 'word/header1.bin' },
    ],
    [
      'a custom XML data store',
      {
        documentRelationships: [
          {
            target: '../customXml/item1.xml',
            type: `${RELATIONSHIPS}/customXml`,
          },
        ],
        parts: { 'customXml/item1.xml': '<b:Sources xmlns:b="urn:example"/>' },
      },
      { feature: 'relationship', part: 'word/_rels/document.xml.rels' },
    ],
  ])('refuses %s', async (_name, spec, expected) => {
    expect(await violations(spec)).toContainEqual(
      expect.objectContaining(expected)
    );
  });

  it('requires word/document.xml as the only main document', async () => {
    // Import decodes word/document.xml, so Word must present that same part.
    expect(
      await violations({
        overrides: { '/word/document2.xml': `${WORDML}.document.main+xml` },
        parts: {
          'word/document2.xml': wordPart(
            'document',
            '<w:body><w:p><w:r><w:t>Other body</w:t></w:r></w:p></w:body>'
          ),
        },
        rootRelationships: [
          {
            target: 'word/document2.xml',
            type: `${RELATIONSHIPS}/officeDocument`,
          },
        ],
      })
    ).toEqual([
      {
        detail: 'word/document2.xml',
        feature: 'main-document',
        part: '_rels/.rels',
      },
      { feature: 'main-document', part: '_rels/.rels' },
    ]);
  });

  it('requires a content type index', async () => {
    const zip = await JSZip.loadAsync(await docx());

    zip.remove('[Content_Types].xml');
    const pkg = await readBoundedDocxPackage(
      await zip.generateAsync({ type: 'arraybuffer' }),
      DEFAULT_DOCX_IMPORT_LIMITS
    );

    expect(findDocxSourceViolations(pkg)).toEqual([
      { feature: 'part', part: '[Content_Types].xml' },
    ]);
  });
});
