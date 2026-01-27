/** OOXML namespace URIs used in DOCX documents */
export type OoxmlNamespaces = {
  /** DrawingML main namespace */
  a: string;
  /** Bibliography namespace */
  b: string;
  /** Chart Drawing namespace */
  cdr: string;
  /** Content types namespace */
  contentTypes: string;
  /** Core properties namespace */
  coreProperties: string;
  /** Core properties relationship namespace */
  corePropertiesRelation: string;
  /** Dublin Core elements namespace */
  dc: string;
  /** Dublin Core DCMI types namespace */
  dcmitype: string;
  /** Dublin Core terms namespace */
  dcterms: string;
  /** Comments relationship namespace */
  comments: string;
  /** Comments extended relationship namespace */
  commentsExtended: string;
  /** Comments IDs relationship namespace */
  commentsIds: string;
  /** Comments extensible relationship namespace */
  commentsExtensible: string;
  /** People relationship namespace */
  people: string;
  /** Font table relationship namespace */
  fontTable: string;
  /** Footer relationship namespace */
  footers: string;
  /** Header relationship namespace */
  headers: string;
  /** Hyperlink relationship namespace */
  hyperlinks: string;
  /** Image relationship namespace */
  images: string;
  /** Math namespace */
  m: string;
  /** Markup compatibility namespace */
  mc: string;
  /** Numbering relationship namespace */
  numbering: string;
  /** Office namespace */
  o: string;
  /** Office document relationship namespace */
  officeDocumentRelation: string;
  /** Picture namespace */
  pic: string;
  /** Relationships namespace */
  r: string;
  /** Package relationships namespace */
  relationship: string;
  /** Settings relationship namespace */
  settingsRelation: string;
  /** Schema library namespace */
  sl: string;
  /** Styles relationship namespace */
  styles: string;
  /** Theme relationship namespace */
  themes: string;
  /** VML namespace */
  v: string;
  /** Markup compatibility namespace */
  ve: string;
  /** Document properties variant types namespace */
  vt: string;
  /** WordprocessingML main namespace */
  w: string;
  /** Word 2010 namespace */
  w10: string;
  /** Word 2010 WordML namespace */
  w14: string;
  /** Word 2012 WordML namespace */
  w15: string;
  /** Word 2016 comment ID namespace */
  w16cid: string;
  /** Word 2018 comment extensible namespace */
  w16cex: string;
  /** Web settings relationship namespace */
  webSettingsRelation: string;
  /** Word 2006 WordML namespace */
  wne: string;
  /** WordprocessingDrawing namespace */
  wp: string;
  /** XML Schema namespace */
  xsd: string;
  /** XML Schema instance namespace */
  xsi: string;
};

const namespaces: OoxmlNamespaces = {
  a: 'http://schemas.openxmlformats.org/drawingml/2006/main',
  b: 'http://schemas.openxmlformats.org/officeDocument/2006/bibliography',
  cdr: 'http://schemas.openxmlformats.org/drawingml/2006/chartDrawing',
  contentTypes: 'http://schemas.openxmlformats.org/package/2006/content-types',
  coreProperties:
    'http://schemas.openxmlformats.org/package/2006/metadata/core-properties',
  corePropertiesRelation:
    'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',
  dc: 'http://purl.org/dc/elements/1.1/',
  dcmitype: 'http://purl.org/dc/dcmitype/',
  dcterms: 'http://purl.org/dc/terms/',
  comments:
    'http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments',
  commentsExtended:
    'http://schemas.microsoft.com/office/2011/relationships/commentsExtended',
  commentsIds:
    'http://schemas.microsoft.com/office/2016/09/relationships/commentsIds',
  commentsExtensible:
    'http://schemas.microsoft.com/office/2018/08/relationships/commentsExtensible',
  people: 'http://schemas.microsoft.com/office/2011/relationships/people',
  fontTable:
    'http://schemas.openxmlformats.org/officeDocument/2006/relationships/fontTable',
  footers:
    'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer',
  headers:
    'http://schemas.openxmlformats.org/officeDocument/2006/relationships/header',
  hyperlinks:
    'http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink',
  images:
    'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image',
  m: 'http://schemas.openxmlformats.org/officeDocument/2006/math',
  mc: 'http://schemas.openxmlformats.org/markup-compatibility/2006',
  numbering:
    'http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering',
  o: 'urn:schemas-microsoft-com:office:office',
  officeDocumentRelation:
    'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument',
  pic: 'http://schemas.openxmlformats.org/drawingml/2006/picture',
  r: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
  relationship: 'http://schemas.openxmlformats.org/package/2006/relationships',
  settingsRelation:
    'http://schemas.openxmlformats.org/officeDocument/2006/relationships/settings',
  sl: 'http://schemas.openxmlformats.org/schemaLibrary/2006/main',
  styles:
    'http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles',
  themes:
    'http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme',
  v: 'urn:schemas-microsoft-com:vml',
  ve: 'http://schemas.openxmlformats.org/markup-compatibility/2006',
  vt: 'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes',
  w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
  w10: 'urn:schemas-microsoft-com:office:word',
  w14: 'http://schemas.microsoft.com/office/word/2010/wordml',
  w15: 'http://schemas.microsoft.com/office/word/2012/wordml',
  w16cid: 'http://schemas.microsoft.com/office/word/2016/wordml/cid',
  w16cex: 'http://schemas.microsoft.com/office/word/2018/wordml/cex',
  webSettingsRelation:
    'http://schemas.openxmlformats.org/officeDocument/2006/relationships/webSettings',
  wne: 'http://schemas.microsoft.com/office/word/2006/wordml',
  wp: 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
  xsd: 'http://www.w3.org/2001/XMLSchema',
  xsi: 'http://www.w3.org/2001/XMLSchema-instance',
};

export default namespaces;
