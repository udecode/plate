import xmljs from 'xml-js';
import { v4 as uuidv4 } from 'uuid';

import { DocxExporter, exportSchemaToJson } from './exporter';
import { createDocumentJson, addDefaultStylesIfMissing } from './v2/importer/docxImporter.js';
import { deobfuscateFont, getArrayBufferFromUrl } from './helpers.js';
import { baseNumbering } from './v2/exporter/helpers/base-list.definitions.js';
import { DEFAULT_CUSTOM_XML, DEFAULT_DOCX_DEFS, SETTINGS_CUSTOM_XML } from './exporter-docx-defs.js';
import {
  getCommentDefinition,
  prepareCommentParaIds,
  prepareCommentsXmlFilesForExport,
} from './v2/exporter/commentsExporter.js';
import { FOOTER_RELATIONSHIP_TYPE, HEADER_RELATIONSHIP_TYPE, HYPERLINK_RELATIONSHIP_TYPE } from './constants.js';
import { DocxHelpers } from './docx-helpers/index.js';

class SuperConverter {
  static allowedElements = Object.freeze({
    'w:document': 'doc',
    'w:body': 'body',
    'w:p': 'paragraph',
    'w:r': 'run',
    'w:t': 'text',
    'w:delText': 'text',
    'w:br': 'lineBreak',
    'w:tbl': 'table',
    'w:tr': 'tableRow',
    'w:tc': 'tableCell',
    'w:drawing': 'drawing',
    'w:bookmarkStart': 'bookmarkStart',
    // 'w:tab': 'tab',

    // Formatting only
    'w:sectPr': 'sectionProperties',
    'w:rPr': 'runProperties',

    // Comments
    'w:commentRangeStart': 'commentRangeStart',
    'w:commentRangeEnd': 'commentRangeEnd',
    'w:commentReference': 'commentReference',
  });

  static markTypes = [
    { name: 'w:b', type: 'bold', property: 'value' },
    // { name: 'w:bCs', type: 'bold' },
    { name: 'w:i', type: 'italic' },
    // { name: 'w:iCs', type: 'italic' },
    { name: 'w:u', type: 'underline', mark: 'underline', property: 'underlineType' },
    { name: 'w:strike', type: 'strike', mark: 'strike' },
    { name: 'w:color', type: 'color', mark: 'textStyle', property: 'color' },
    { name: 'w:sz', type: 'fontSize', mark: 'textStyle', property: 'fontSize' },
    // { name: 'w:szCs', type: 'fontSize', mark: 'textStyle', property: 'fontSize' },
    { name: 'w:rFonts', type: 'fontFamily', mark: 'textStyle', property: 'fontFamily' },
    { name: 'w:rStyle', type: 'styleId', mark: 'textStyle', property: 'styleId' },
    { name: 'w:jc', type: 'textAlign', mark: 'textStyle', property: 'textAlign' },
    { name: 'w:ind', type: 'textIndent', mark: 'textStyle', property: 'textIndent' },
    { name: 'w:spacing', type: 'lineHeight', mark: 'textStyle', property: 'lineHeight' },
    { name: 'w:spacing', type: 'letterSpacing', mark: 'textStyle', property: 'letterSpacing' },
    { name: 'link', type: 'link', mark: 'link', property: 'href' },
    { name: 'w:highlight', type: 'highlight', mark: 'highlight', property: 'color' },
    { name: 'w:shd', type: 'highlight', mark: 'highlight', property: 'color' },
    { name: 'w:caps', type: 'textTransform', mark: 'textStyle', property: 'textTransform' },
  ];

  static propertyTypes = Object.freeze({
    'w:pPr': 'paragraphProperties',
    'w:rPr': 'runProperties',
    'w:sectPr': 'sectionProperties',
    'w:numPr': 'numberingProperties',
    'w:tcPr': 'tableCellProperties',
  });

  static elements = new Set(['w:document', 'w:body', 'w:p', 'w:r', 'w:t', 'w:delText']);

  constructor(params = null) {
    // Suppress logging when true
    this.debug = params?.debug || false;

    // Important docx pieces
    this.declaration = null;
    this.documentAttributes = null;

    // The docx as a list of files
    this.convertedXml = {};
    this.docx = params?.docx || [];
    this.media = params?.media || {};

    this.fonts = params?.fonts || {};

    this.addedMedia = {};
    this.comments = [];

    // Store custom highlight colors
    this.docHiglightColors = new Set([]);

    // XML inputs
    this.xml = params?.xml;
    this.declaration = null;

    // List defs
    this.numbering = {};

    // Processed additional content
    this.numbering = null;
    this.pageStyles = null;

    // The JSON converted XML before any processing. This is simply the result of xml2json
    this.initialJSON = null;

    // Headers and footers
    this.headers = {};
    this.headerIds = { default: null, even: null, odd: null, first: null };
    this.headerEditors = [];
    this.footers = {};
    this.footerIds = { default: null, even: null, odd: null, first: null };
    this.footerEditors = [];

    // Linked Styles
    this.linkedStyles = [];

    // This is the JSON schema that we will be working with
    this.json = params?.json;

    this.tagsNotInSchema = ['w:body'];
    this.savedTagsToRestore = [];

    // Initialize telemetry
    this.telemetry = params?.telemetry || null;
    this.documentInternalId = null;

    // Uploaded file
    this.fileSource = params?.fileSource || null;
    this.documentId = params?.documentId || null;

    // Parse the initial XML, if provided
    if (this.docx.length || this.xml) this.parseFromXml();
  }

  /**
   * Get the DocxHelpers object that contains utility functions for working with docx files.
   * @returns {import('./docx-helpers/docx-helpers.js').DocxHelpers} The DocxHelpers object.
   */
  get docxHelpers() {
    return DocxHelpers;
  }

  parseFromXml() {
    this.docx?.forEach((file) => {
      this.convertedXml[file.name] = this.parseXmlToJson(file.content);

      if (file.name === 'word/document.xml') {
        this.documentAttributes = this.convertedXml[file.name].elements[0]?.attributes;
      }

      if (file.name === 'word/styles.xml') {
        this.convertedXml[file.name] = addDefaultStylesIfMissing(this.convertedXml[file.name]);
      }
    });
    this.initialJSON = this.convertedXml['word/document.xml'];

    if (!this.initialJSON) this.initialJSON = this.parseXmlToJson(this.xml);
    this.declaration = this.initialJSON?.declaration;
  }

  parseXmlToJson(xml) {
    // We need to preserve nodes with xml:space="preserve" and only have empty spaces
    const newXml = xml.replace(/(<w:t xml:space="preserve">)(\s+)(<\/w:t>)/g, '$1[[sdspace]]$2[[sdspace]]$3');
    return JSON.parse(xmljs.xml2json(newXml, null, 2));
  }

  static getStoredSuperdocVersion(docx) {
    try {
      const customXml = docx.find((doc) => doc.name === 'docProps/custom.xml');
      if (!customXml) return;

      const converter = new SuperConverter();
      const content = customXml.content;
      const contentJson = converter.parseXmlToJson(content);
      const properties = contentJson.elements.find((el) => el.name === 'Properties');
      if (!properties.elements) return;

      const superdocVersion = properties.elements.find(
        (el) => el.name === 'property' && el.attributes.name === 'SuperdocVersion',
      );
      if (!superdocVersion) return;

      const version = superdocVersion.elements[0].elements[0].text;
      return version;
    } catch (e) {
      console.warn('Error getting Superdoc version', e);
      return;
    }
  }

  static updateDocumentVersion(docx = this.convertedXml, version = __APP_VERSION__) {
    const customLocation = 'docProps/custom.xml';
    if (!docx[customLocation]) {
      docx[customLocation] = generateCustomXml(__APP_VERSION__);
    }

    const customXml = docx['docProps/custom.xml'];
    if (!customXml) return;

    const properties = customXml.elements.find((el) => el.name === 'Properties');
    if (!properties.elements) properties.elements = [];

    const superdocVersion = properties.elements.find(
      (el) => el.name === 'property' && el.attributes.name === 'SuperdocVersion',
    );
    if (!superdocVersion) {
      const newCustomXml = generateSuperdocVersion();
      properties.elements.push(newCustomXml);
    } else {
      superdocVersion.elements[0].elements[0].elements[0].text = version;
    }

    return docx;
  }

  getDocumentDefaultStyles() {
    const styles = this.convertedXml['word/styles.xml'];
    if (!styles) return {};

    const defaults = styles.elements[0].elements.find((el) => el.name === 'w:docDefaults');

    // const pDefault = defaults.elements.find((el) => el.name === 'w:pPrDefault');

    // Get the run defaults for this document - this will include font, theme etc.
    const rDefault = defaults.elements.find((el) => el.name === 'w:rPrDefault');
    if (!rDefault.elements) return {};

    const rElements = rDefault.elements[0].elements;
    const rFonts = rElements?.find((el) => el.name === 'w:rFonts');
    if ('elements' in rDefault) {
      const fontThemeName = rElements.find((el) => el.name === 'w:rFonts')?.attributes['w:asciiTheme'];
      let typeface, panose, fontSizeNormal;
      if (fontThemeName) {
        const fontInfo = this.getThemeInfo(fontThemeName);
        typeface = fontInfo.typeface;
        panose = fontInfo.panose;
      } else if (rFonts) {
        typeface = rFonts?.attributes['w:ascii'];
      }

      const paragraphDefaults =
        styles.elements[0].elements.filter((el) => {
          return el.name === 'w:style' && el.attributes['w:styleId'] === 'Normal';
        }) || [];
      paragraphDefaults.forEach((el) => {
        const rPr = el.elements.find((el) => el.name === 'w:rPr');
        const fonts = rPr?.elements?.find((el) => el.name === 'w:rFonts');
        typeface = fonts?.attributes['w:ascii'];
        fontSizeNormal = Number(rPr?.elements?.find((el) => el.name === 'w:sz')?.attributes['w:val']) / 2;
      });

      const rPrDefaults = defaults?.elements?.find((el) => el.name === 'w:rPrDefault');
      if (rPrDefaults) {
        const rPr = rPrDefaults.elements?.find((el) => el.name === 'w:rPr');
        const fonts = rPr?.elements?.find((el) => el.name === 'w:rFonts');
        typeface = fonts?.attributes['w:ascii'];

        const fontSize = typeface ?? rPr?.elements?.find((el) => el.name === 'w:sz')?.attributes['w:val'];
        fontSizeNormal = !fontSizeNormal && fontSize ? Number(fontSize) / 2 : null;
      }

      const fontSizePt =
        fontSizeNormal || Number(rElements.find((el) => el.name === 'w:sz')?.attributes['w:val']) / 2 || 10;
      const kern = rElements.find((el) => el.name === 'w:kern')?.attributes['w:val'];
      return { fontSizePt, kern, typeface, panose };
    }
  }

  getDocumentFonts() {
    const fontTable = this.convertedXml['word/fontTable.xml'];
    if (!fontTable || !Object.keys(this.fonts).length) return;

    const fonts = fontTable.elements.find((el) => el.name === 'w:fonts');
    const embededFonts = fonts?.elements.filter((el) =>
      el.elements?.some((nested) => nested?.attributes && nested.attributes['r:id'] && nested.attributes['w:fontKey']),
    );
    const fontsToInclude = embededFonts?.reduce((acc, cur) => {
      const embedElements = cur.elements
        .filter((el) => el.name.startsWith('w:embed'))
        ?.map((el) => ({ ...el, fontFamily: cur.attributes['w:name'] }));
      return [...acc, ...embedElements];
    }, []);

    const rels = this.convertedXml['word/_rels/fontTable.xml.rels'];
    const relationships = rels?.elements.find((el) => el.name === 'Relationships') || {};
    const { elements } = relationships;

    let styleString = '';
    for (const font of fontsToInclude) {
      const filePath = elements.find((el) => el.attributes.Id === font.attributes['r:id'])?.attributes?.Target;
      if (!filePath) return;

      const fontUint8Array = this.fonts[`word/${filePath}`];
      const fontBuffer = fontUint8Array?.buffer;
      if (!fontBuffer) return;

      const ttfBuffer = deobfuscateFont(fontBuffer, font.attributes['w:fontKey']);
      if (!ttfBuffer) return;

      // Convert to a blob and inject @font-face
      const blob = new Blob([ttfBuffer], { type: 'font/ttf' });
      const fontUrl = URL.createObjectURL(blob);
      const isNormal = font.name.includes('Regular');
      const isBold = font.name.includes('Bold');
      const isItalic = font.name.includes('Italic');
      const isLight = font.name.includes('Light');
      const fontWeight = isNormal ? 'normal' : isBold ? 'bold' : isLight ? '200' : 'normal';

      styleString += `
        @font-face {
          font-style: ${isItalic ? 'italic' : 'normal'};
          font-weight: ${fontWeight};
          font-display: swap;
          font-family: ${font.fontFamily};
          src: url(${fontUrl}) format('truetype');
        }
      `;
    }

    return styleString;
  }

  getDocumentInternalId() {
    const settingsLocation = 'word/settings.xml';
    if (!this.convertedXml[settingsLocation]) {
      this.convertedXml[settingsLocation] = SETTINGS_CUSTOM_XML;
    }

    const settings = Object.assign({}, this.convertedXml[settingsLocation]);
    if (!settings.elements[0]?.elements?.length) {
      const idElement = this.createDocumentIdElement(settings);

      settings.elements[0].elements = [idElement];
      if (!settings.elements[0].attributes['xmlns:w15']) {
        settings.elements[0].attributes['xmlns:w15'] = 'http://schemas.microsoft.com/office/word/2012/wordml';
      }
      this.convertedXml[settingsLocation] = settings;
      return;
    }

    // New versions of Word will have w15:docId
    // It's possible to have w14:docId as well but Word(2013 and later) will convert it automatically when document opened
    const w15DocId = settings.elements[0].elements.find((el) => el.name === 'w15:docId');
    this.documentInternalId = w15DocId?.attributes['w15:val'];
  }

  createDocumentIdElement() {
    const docId = uuidv4().toUpperCase();
    this.documentInternalId = docId;

    return {
      type: 'element',
      name: 'w15:docId',
      attributes: {
        'w15:val': `{${docId}}`,
      },
    };
  }

  getThemeInfo(themeName) {
    themeName = themeName.toLowerCase();
    const theme1 = this.convertedXml['word/theme/theme1.xml'];
    if (!theme1) return {};
    const themeData = theme1.elements.find((el) => el.name === 'a:theme');
    const themeElements = themeData.elements.find((el) => el.name === 'a:themeElements');
    const fontScheme = themeElements.elements.find((el) => el.name === 'a:fontScheme');
    let fonts;

    if (themeName.startsWith('major')) {
      fonts = fontScheme.elements.find((el) => el.name === 'a:majorFont').elements[0];
    } else if (themeName.startsWith('minor')) {
      fonts = fontScheme.elements.find((el) => el.name === 'a:minorFont').elements[0];
    }

    const { typeface, panose } = fonts.attributes;
    return { typeface, panose };
  }

  getSchema(editor) {
    this.getDocumentInternalId();
    const result = createDocumentJson({ ...this.convertedXml, media: this.media }, this, editor);

    if (result) {
      this.savedTagsToRestore.push({ ...result.savedTagsToRestore });
      this.pageStyles = result.pageStyles;
      this.numbering = result.numbering;
      this.comments = result.comments;
      this.linkedStyles = result.linkedStyles;

      return result.pmDoc;
    } else {
      return null;
    }
  }

  schemaToXml(data, debug = false) {
    const exporter = new DocxExporter(this);
    return exporter.schemaToXml(data, debug);
  }

  async exportToDocx(
    jsonData,
    editorSchema,
    documentMedia,
    isFinalDoc = false,
    commentsExportType,
    comments = [],
    editor,
    exportJsonOnly = false,
    fieldsHighlightColor,
  ) {
    const commentsWithParaIds = comments.map((c) => prepareCommentParaIds(c));
    const commentDefinitions = commentsWithParaIds.map((c, index) =>
      getCommentDefinition(c, index, commentsWithParaIds, editor),
    );

    const { result, params } = this.exportToXmlJson({
      data: jsonData,
      editorSchema,
      comments,
      commentDefinitions,
      commentsExportType,
      isFinalDoc,
      editor,
      fieldsHighlightColor,
    });

    if (exportJsonOnly) return result;

    const exporter = new DocxExporter(this);
    const xml = exporter.schemaToXml(result);

    // Update media
    await this.#exportProcessMediaFiles(
      {
        ...documentMedia,
        ...params.media,
        ...this.media,
      },
      editor,
    );

    // Update content types and comments files as needed
    let updatedXml = { ...this.convertedXml };
    let commentsRels = [];
    if (comments.length) {
      const { documentXml, relationships } = this.#prepareCommentsXmlFilesForExport({
        defs: params.exportedCommentDefs,
        exportType: commentsExportType,
        commentsWithParaIds,
      });
      updatedXml = { ...documentXml };
      commentsRels = relationships;
    }

    this.convertedXml = { ...this.convertedXml, ...updatedXml };

    const headFootRels = this.#exportProcessHeadersFooters({ isFinalDoc });

    // Update the rels table
    this.#exportProcessNewRelationships([...params.relationships, ...commentsRels, ...headFootRels]);

    // Store the SuperDoc version
    storeSuperdocVersion(this.convertedXml);

    // Update the numbering.xml
    this.#exportNumberingFile(params);

    return xml;
  }

  exportToXmlJson({
    data,
    editorSchema,
    comments,
    commentDefinitions,
    commentsExportType = 'clean',
    isFinalDoc = false,
    editor,
    isHeaderFooter = false,
    fieldsHighlightColor = null,
  }) {
    const bodyNode = this.savedTagsToRestore.find((el) => el.name === 'w:body');

    const [result, params] = exportSchemaToJson({
      node: data,
      bodyNode,
      relationships: [],
      documentMedia: {},
      media: {},
      isFinalDoc,
      editorSchema,
      converter: this,
      pageStyles: this.pageStyles,
      comments,
      commentsExportType,
      exportedCommentDefs: commentDefinitions,
      editor,
      isHeaderFooter,
      fieldsHighlightColor,
    });

    return { result, params };
  }

  #exportNumberingFile() {
    const numberingPath = 'word/numbering.xml';
    let numberingXml = this.convertedXml[numberingPath];

    const newNumbering = this.numbering;

    if (!numberingXml) numberingXml = baseNumbering;
    const currentNumberingXml = numberingXml.elements[0];

    const newAbstracts = Object.values(newNumbering.abstracts).map((entry) => entry);
    const newNumDefs = Object.values(newNumbering.definitions).map((entry) => entry);
    currentNumberingXml.elements = [...newAbstracts, ...newNumDefs];

    // Update the numbering file
    this.convertedXml[numberingPath] = numberingXml;
  }

  /**
   * Update comments files and relationships depending on export type
   */
  #prepareCommentsXmlFilesForExport({ defs, exportType, commentsWithParaIds }) {
    const { documentXml, relationships } = prepareCommentsXmlFilesForExport({
      exportType,
      convertedXml: this.convertedXml,
      defs,
      commentsWithParaIds,
      converter: this,
    });

    return { documentXml, relationships };
  }

  #exportProcessHeadersFooters({ isFinalDoc = false }) {
    const relsData = this.convertedXml['word/_rels/document.xml.rels'];
    const relationships = relsData.elements.find((x) => x.name === 'Relationships');
    const newDocRels = [];

    Object.entries(this.headers).forEach(([id, header], index) => {
      const fileName =
        relationships.elements.find((el) => el.attributes.Id === id)?.attributes.Target || `header${index + 1}.xml`;
      const headerEditor = this.headerEditors.find((item) => item.id === id);

      if (!headerEditor) return;

      const { result, params } = this.exportToXmlJson({
        data: header,
        editor: headerEditor.editor,
        editorSchema: headerEditor.editor.schema,
        comments: [],
        commentDefinitions: [],
        isHeaderFooter: true,
        isFinalDoc,
      });

      const bodyContent = result.elements[0].elements;
      const file = this.convertedXml[`word/${fileName}`];

      if (!file) {
        this.convertedXml[`word/${fileName}`] = {
          declaration: this.initialJSON?.declaration,
          elements: [
            {
              attributes: DEFAULT_DOCX_DEFS,
              name: 'w:hdr',
              type: 'element',
              elements: [],
            },
          ],
        };
        newDocRels.push({
          type: 'element',
          name: 'Relationship',
          attributes: {
            Id: id,
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/header',
            Target: fileName,
          },
        });
      }

      this.convertedXml[`word/${fileName}`].elements[0].elements = bodyContent;

      if (params.relationships.length) {
        const relationships =
          this.convertedXml[`word/_rels/${fileName}.rels`]?.elements?.find((x) => x.name === 'Relationships')
            ?.elements || [];
        this.convertedXml[`word/_rels/${fileName}.rels`] = {
          declaration: this.initialJSON?.declaration,
          elements: [
            {
              name: 'Relationships',
              attributes: {
                xmlns: 'http://schemas.openxmlformats.org/package/2006/relationships',
              },
              elements: [...relationships, ...params.relationships],
            },
          ],
        };
      }
    });

    Object.entries(this.footers).forEach(([id, footer], index) => {
      const fileName =
        relationships.elements.find((el) => el.attributes.Id === id)?.attributes.Target || `footer${index + 1}.xml`;
      const footerEditor = this.footerEditors.find((item) => item.id === id);

      if (!footerEditor) return;

      const { result, params } = this.exportToXmlJson({
        data: footer,
        editor: footerEditor.editor,
        editorSchema: footerEditor.editor.schema,
        comments: [],
        commentDefinitions: [],
        isHeaderFooter: true,
        isFinalDoc,
      });

      const bodyContent = result.elements[0].elements;
      const file = this.convertedXml[`word/${fileName}`];

      if (!file) {
        this.convertedXml[`word/${fileName}`] = {
          declaration: this.initialJSON?.declaration,
          elements: [
            {
              attributes: DEFAULT_DOCX_DEFS,
              name: 'w:ftr',
              type: 'element',
              elements: [],
            },
          ],
        };
        newDocRels.push({
          type: 'element',
          name: 'Relationship',
          attributes: {
            Id: id,
            Type: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer',
            Target: fileName,
          },
        });
      }

      this.convertedXml[`word/${fileName}`].elements[0].elements = bodyContent;

      if (params.relationships.length) {
        const relationships =
          this.convertedXml[`word/_rels/${fileName}.rels`]?.elements?.find((x) => x.name === 'Relationships')
            ?.elements || [];
        this.convertedXml[`word/_rels/${fileName}.rels`] = {
          declaration: this.initialJSON?.declaration,
          elements: [
            {
              name: 'Relationships',
              attributes: {
                xmlns: 'http://schemas.openxmlformats.org/package/2006/relationships',
              },
              elements: [...relationships, ...params.relationships],
            },
          ],
        };
      }
    });

    return newDocRels;
  }

  #exportProcessNewRelationships(rels = []) {
    const relsData = this.convertedXml['word/_rels/document.xml.rels'];
    const relationships = relsData.elements.find((x) => x.name === 'Relationships');
    const newRels = [];

    const regex = /rId|mi/g;
    let largestId = Math.max(...relationships.elements.map((el) => Number(el.attributes.Id.replace(regex, ''))));

    rels.forEach((rel) => {
      const existingId = rel.attributes.Id;
      const existingTarget = relationships.elements.find((el) => el.attributes.Target === rel.attributes.Target);
      const isNewMedia = rel.attributes.Target?.startsWith('media/') && existingId.length > 6;
      const isNewHyperlink = rel.attributes.Type === HYPERLINK_RELATIONSHIP_TYPE && existingId.length > 6;
      const isNewHeadFoot =
        rel.attributes.Type === (HEADER_RELATIONSHIP_TYPE || rel.attributes.Type === FOOTER_RELATIONSHIP_TYPE) &&
        existingId.length > 6;

      if (existingTarget && !isNewMedia && !isNewHyperlink && !isNewHeadFoot) {
        return;
      }

      // Update the target to escape ampersands
      rel.attributes.Target = rel.attributes?.Target?.replace(/&/g, '&amp;');

      // Update the ID. If we've assigned a long ID (ie: images, links) we leave it alone
      rel.attributes.Id = existingId.length > 6 ? existingId : `rId${++largestId}`;

      newRels.push(rel);
    });

    relationships.elements = [...relationships.elements, ...newRels];
  }

  async #exportProcessMediaFiles(media, editor) {
    const processedData = {};
    for (const filePath in media) {
      if (typeof media[filePath] !== 'string') continue;
      const name = filePath.split('/').pop();
      processedData[name] = await getArrayBufferFromUrl(media[filePath], editor.options.isHeadless);
    }

    this.convertedXml.media = {
      ...this.convertedXml.media,
      ...processedData,
    };
    this.media = this.convertedXml.media;
    this.addedMedia = processedData;
  }
}

function storeSuperdocVersion(docx) {
  const customLocation = 'docProps/custom.xml';
  if (!docx[customLocation]) docx[customLocation] = generateCustomXml();

  const customXml = docx[customLocation];
  const properties = customXml.elements.find((el) => el.name === 'Properties');
  if (!properties.elements) properties.elements = [];
  const elements = properties.elements;

  const cleanProperties = elements
    .filter((prop) => typeof prop === 'object' && prop !== null)
    .filter((prop) => {
      const { attributes } = prop;
      return attributes.name !== 'SuperdocVersion';
    });

  let pid = 2;
  try {
    pid = cleanProperties.length ? Math.max(...elements.map((el) => el.attributes.pid)) + 1 : 2;
  } catch {}

  cleanProperties.push(generateSuperdocVersion(pid));
  properties.elements = cleanProperties;
  return docx;
}

function generateCustomXml() {
  return DEFAULT_CUSTOM_XML;
}

function generateSuperdocVersion(pid = 2, version = __APP_VERSION__) {
  return {
    type: 'element',
    name: 'property',
    attributes: {
      name: 'SuperdocVersion',
      fmtid: '{D5CDD505-2E9C-101B-9397-08002B2CF9AE}',
      pid,
    },
    elements: [
      {
        type: 'element',
        name: 'vt:lpwstr',
        elements: [
          {
            type: 'text',
            text: version,
          },
        ],
      },
    ],
  };
}

export { SuperConverter };
