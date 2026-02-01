/* biome-ignore-all lint: legacy code */
import type JSZip from 'jszip';

import { nanoid } from 'nanoid';
import { create, fragment } from 'xmlbuilder2';
import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces';

import type { CommentPayload, StoredComment, TrackingState } from './tracking';
import {
  COMMENTS_EXTENDED_TEMPLATE,
  COMMENTS_EXTENSIBLE_TEMPLATE,
  COMMENTS_IDS_TEMPLATE,
  COMMENTS_TEMPLATE,
  PEOPLE_TEMPLATE,
} from './comment-templates';
import { generateHexId } from './tracking';

import {
  applicationName,
  commentsExtendedContentType,
  commentsExtendedRelationshipType,
  commentsExtendedType,
  commentsExtensibleContentType,
  commentsExtensibleRelationshipType,
  commentsExtensibleType,
  commentsIdsContentType,
  commentsIdsRelationshipType,
  commentsIdsType,
  commentsType,
  defaultDocumentOptions,
  defaultFont,
  defaultFontSize,
  defaultLang,
  defaultOrientation,
  documentFileName,
  footerType as footerFileType,
  headerType as headerFileType,
  hyperlinkType,
  imageType,
  landscapeHeight,
  landscapeMargins,
  landscapeWidth,
  peopleContentType,
  peopleRelationshipType,
  peopleType,
  portraitMargins,
  themeType as themeFileType,
} from './constants';
import { convertVTreeToXML } from './helpers';
import namespaces from './namespaces';
import {
  contentTypesXML as contentTypesXMLString,
  documentRelsXML as documentRelsXMLString,
  fontTableXML as fontTableXMLString,
  generateCoreXML,
  generateDocumentTemplate,
  generateNumberingXMLTemplate,
  generateStylesXML,
  generateThemeXML,
  genericRelsXML as genericRelsXMLString,
  settingsXML as settingsXMLString,
  webSettingsXML as webSettingsXMLString,
} from './schemas';
import type { DocumentMargins } from './schemas/document.template';
import { fontFamilyToTableObject } from './utils/font-family-conversion';
import ListStyleBuilder, {
  type ListStyleDefaults,
  type ListStyleType,
} from './utils/list';

/**
 * Get bullet character for unordered list based on level.
 * Uses Symbol font characters for consistent rendering in Word.
 */
const getBulletChar = (level: number): string => {
  // Symbol font bullet characters for different levels
  const bullets = [
    '\uF0B7', // Level 0: Bullet (•)
    'o', // Level 1: Circle (will render as ○ with Symbol font)
    '\uF0A7', // Level 2: Square bullet (■)
  ];
  return bullets[level % bullets.length];
};

/** Virtual DOM tree node */
export interface VTree {
  children?: VTree[];
  properties?: Record<string, unknown>;
  tagName?: string;
  text?: string;
}

/** Margins configuration (optional fields for input) */
export interface Margins {
  bottom?: number;
  footer?: number;
  gutter?: number;
  header?: number;
  left?: number;
  right?: number;
  top?: number;
}

/** Required margins for internal use */
export type { DocumentMargins };

/** Page size configuration */
export interface PageSize {
  height?: number;
  width?: number;
}

/** Line number options */
export interface LineNumberOptions {
  countBy?: number;
  restart?: string;
  start?: number;
}

/** Numbering options - use ListStyleDefaults for constructor */
export type NumberingOptions = ListStyleDefaults;

/** Table options */
export interface TableOptions {
  row?: {
    cantSplit?: boolean;
  };
}

/** Header object stored in the document */
export interface HeaderObject {
  headerId: number;
  relationshipId: number;
  type: string;
}

/** Footer object stored in the document */
export interface FooterObject {
  footerId: number;
  relationshipId: number;
  type: string;
}

/** Relationship object */
export interface RelationshipObject {
  relationshipId: number;
  target: string;
  targetMode: string;
  type: string;
}

/** File relationship entry */
export interface FileRelationship {
  fileName: string;
  lastRelsId: number;
  rels: RelationshipObject[];
}

/** Relationship XML output */
export interface RelationshipXMLOutput {
  fileName: string;
  xmlString: string;
}

/** Numbering object */
export interface NumberingObject {
  numberingId: number;
  properties: NumberingProperties;
  type: 'ol' | 'ul';
}

/** Numbering properties */
export interface NumberingProperties {
  attributes?: Record<string, string | undefined>;
  style?: {
    'list-style-type'?: ListStyleType;
    [key: string]: string | undefined;
  };
}

/** Font table object */
export interface FontTableObject {
  fontName: string;
  genericFontName: string;
}

/** Media file info */
export interface MediaFileInfo {
  fileContent: string;
  fileNameWithExtension: string;
  id: number;
}

/** Style object */
export interface StyleObject {
  [key: string]: unknown;
}

/** Section header result */
export interface HeaderResult {
  headerId: number;
  headerXML: XMLBuilder;
}

/** Section footer result */
export interface FooterResult {
  footerId: number;
  footerXML: XMLBuilder;
}

/** DocxDocument constructor properties */
export interface DocxDocumentProperties {
  complexScriptFontSize?: number | null;
  createdAt?: Date;
  creator?: string;
  description?: string;
  font?: string;
  fontSize?: number | null;
  footer?: boolean;
  footerType?: string;
  header?: boolean;
  headerType?: string;
  htmlString: string | null;
  keywords?: string[];
  lang?: string;
  lastModifiedBy?: string;
  lineNumber?: boolean;
  lineNumberOptions?: LineNumberOptions;
  margins?: Margins | null;
  modifiedAt?: Date;
  numbering?: ListStyleDefaults;
  orientation?: string;
  pageNumber?: boolean;
  pageSize?: PageSize | null;
  revision?: number;
  skipFirstHeaderFooter?: boolean;
  subject?: string;
  table?: TableOptions;
  title?: string;
  zip: JSZip;
}

function generateContentTypesFragments(
  contentTypesXML: XMLBuilder,
  type: 'footer' | 'header',
  objects: FooterObject[] | HeaderObject[]
): void {
  if (objects && Array.isArray(objects)) {
    objects.forEach((object) => {
      const id =
        type === 'header'
          ? (object as HeaderObject).headerId
          : (object as FooterObject).footerId;
      const contentTypesFragment = fragment({
        defaultNamespace: { ele: namespaces.contentTypes },
      })
        .ele('Override')
        .att('PartName', `/word/${type}${id}.xml`)
        .att(
          'ContentType',
          `application/vnd.openxmlformats-officedocument.wordprocessingml.${type}+xml`
        )
        .up();

      contentTypesXML.root().import(contentTypesFragment);
    });
  }
}

function generateSectionReferenceXML(
  documentXML: XMLBuilder,
  documentSectionType: string,
  objects: FooterObject[] | HeaderObject[],
  isEnabled: boolean
): void {
  if (isEnabled && objects && Array.isArray(objects) && objects.length > 0) {
    const xmlFragment = fragment();
    objects.forEach(({ relationshipId, type }) => {
      const objectFragment = fragment({
        namespaceAlias: { w: namespaces.w, r: namespaces.r },
      })
        .ele('@w', `${documentSectionType}Reference`)
        .att('@r', 'id', `rId${relationshipId}`)
        .att('@w', 'type', type)
        .up();
      xmlFragment.import(objectFragment);
    });

    documentXML.root().first().first().import(xmlFragment);
  }
}

function generateXMLString(xmlString: string): string {
  const xmlDocumentString = create(
    { encoding: 'UTF-8', standalone: true },
    xmlString
  );

  return xmlDocumentString.toString({ prettyPrint: true });
}

async function generateSectionXML(
  this: DocxDocument,
  vTree: VTree,
  type: 'footer' | 'header' = 'header'
): Promise<FooterResult | HeaderResult> {
  const sectionXML = create({
    encoding: 'UTF-8',
    standalone: true,
    namespaceAlias: {
      w: namespaces.w,
      ve: namespaces.ve,
      o: namespaces.o,
      r: namespaces.r,
      v: namespaces.v,
      wp: namespaces.wp,
      w10: namespaces.w10,
    },
  }).ele('@w', type === 'header' ? 'hdr' : 'ftr');

  const XMLFragment = fragment();
  // @ts-expect-error - DocxDocument implements DocxDocumentInstance with slight variations
  await convertVTreeToXML(this, vTree, XMLFragment);

  if (
    type === 'footer' &&
    // @ts-expect-error - Node is actually an Element here
    (XMLFragment.first().node as Element).tagName === 'p' &&
    this.pageNumber
  ) {
    XMLFragment.first().import(
      fragment({ namespaceAlias: { w: namespaces.w } })
        .ele('@w', 'fldSimple')
        .att('@w', 'instr', 'PAGE')
        .ele('@w', 'r')
        .up()
        .up()
    );
  }
  sectionXML.root().import(XMLFragment);

  const referenceName = type === 'header' ? 'Header' : 'Footer';
  const lastIdKey = `last${referenceName}Id` as 'lastFooterId' | 'lastHeaderId';
  this[lastIdKey] += 1;

  if (type === 'header') {
    return {
      headerId: this.lastHeaderId,
      headerXML: sectionXML,
    } as HeaderResult;
  }

  return {
    footerId: this.lastFooterId,
    footerXML: sectionXML,
  } as FooterResult;
}

class DocxDocument {
  availableDocumentSpace: number;
  complexScriptFontSize: number;
  createdAt: Date;
  creator: string;
  description: string;
  documentXML: XMLBuilder | null;
  font: string;
  fontSize: number;
  footer: boolean;
  footerObjects: FooterObject[];
  footerType: string;
  header: boolean;
  headerObjects: HeaderObject[];
  headerType: string;
  height: number;
  htmlString: string | null;
  keywords: string[];
  lang: string;
  lastFooterId: number;
  lastHeaderId: number;
  lastMediaId: number;
  lastModifiedBy: string;
  lastNumberingId: number;
  lineNumber: LineNumberOptions | null;
  ListStyleBuilder: ListStyleBuilder;
  margins: DocumentMargins;
  mediaFiles: MediaFileInfo[];
  modifiedAt: Date;
  numberingObjects: NumberingObject[];
  fontTableObjects: FontTableObject[];
  orientation: string;
  pageNumber: boolean;
  pageSize: PageSize;
  relationshipFilename: string;
  relationships: FileRelationship[];
  revision: number;
  skipFirstHeaderFooter: boolean;
  stylesObjects: StyleObject[];
  subject: string;
  tableRowCantSplit: boolean;
  title: string;
  width: number;
  zip: JSZip;

  // Tracking support for comments and suggestions
  _trackingState?: TrackingState;
  comments: StoredComment[];
  commentIdMap: Map<string, number>;
  lastCommentId: number;
  revisionIdMap: Map<string, number>;
  lastRevisionId: number;

  constructor(properties: DocxDocumentProperties) {
    this.zip = properties.zip;
    this.htmlString = properties.htmlString;
    this.orientation = properties.orientation || defaultOrientation;
    this.pageSize = properties.pageSize || defaultDocumentOptions.pageSize;

    const isPortraitOrientation = this.orientation === defaultOrientation;
    const height = this.pageSize.height
      ? this.pageSize.height
      : landscapeHeight;
    const width = this.pageSize.width ? this.pageSize.width : landscapeWidth;

    this.width = isPortraitOrientation ? width : height;
    this.height = isPortraitOrientation ? height : width;

    const marginsObject = properties.margins;
    const defaultMargins = isPortraitOrientation
      ? portraitMargins
      : landscapeMargins;
    this.margins =
      marginsObject && Object.keys(marginsObject).length > 0
        ? {
            ...defaultMargins,
            ...marginsObject,
          }
        : defaultMargins;

    this.availableDocumentSpace =
      this.width - this.margins.left - this.margins.right;
    this.title = properties.title || '';
    this.subject = properties.subject || '';
    this.creator = properties.creator || applicationName;
    this.keywords = properties.keywords || [applicationName];
    this.description = properties.description || '';
    this.lastModifiedBy = properties.lastModifiedBy || applicationName;
    this.revision = properties.revision || 1;
    this.createdAt = properties.createdAt || new Date();
    this.modifiedAt = properties.modifiedAt || new Date();
    this.headerType = properties.headerType || 'default';
    this.header = properties.header || false;
    this.footerType = properties.footerType || 'default';
    this.footer = properties.footer || false;
    this.font = properties.font || defaultFont;
    this.fontSize = properties.fontSize ?? defaultFontSize;
    this.complexScriptFontSize =
      properties.complexScriptFontSize ?? defaultFontSize;
    this.lang = properties.lang || defaultLang;
    this.tableRowCantSplit = properties.table?.row?.cantSplit || false;
    this.pageNumber = properties.pageNumber || false;
    this.skipFirstHeaderFooter = properties.skipFirstHeaderFooter || false;
    this.lineNumber = properties.lineNumber
      ? properties.lineNumberOptions || null
      : null;

    this.lastNumberingId = 0;
    this.lastMediaId = 0;
    this.lastHeaderId = 0;
    this.lastFooterId = 0;
    this.stylesObjects = [];
    this.numberingObjects = [];
    this.fontTableObjects = [];
    this.relationshipFilename = documentFileName;
    this.relationships = [
      { fileName: documentFileName, lastRelsId: 5, rels: [] },
    ];
    this.mediaFiles = [];
    this.headerObjects = [];
    this.footerObjects = [];
    this.documentXML = null;

    // Initialize tracking support
    this.comments = [];
    this.commentIdMap = new Map();
    this.lastCommentId = 0;
    this.revisionIdMap = new Map();
    this.lastRevisionId = 0;

    this.generateContentTypesXML = this.generateContentTypesXML.bind(this);
    this.generateDocumentXML = this.generateDocumentXML.bind(this);
    this.generateCoreXML = this.generateCoreXML.bind(this);
    this.generateSettingsXML = this.generateSettingsXML.bind(this);
    this.generateWebSettingsXML = this.generateWebSettingsXML.bind(this);
    this.generateStylesXML = this.generateStylesXML.bind(this);
    this.generateFontTableXML = this.generateFontTableXML.bind(this);
    this.generateThemeXML = this.generateThemeXML.bind(this);
    this.generateNumberingXML = this.generateNumberingXML.bind(this);
    this.generateRelsXML = this.generateRelsXML.bind(this);
    this.createMediaFile = this.createMediaFile.bind(this);
    this.createDocumentRelationships =
      this.createDocumentRelationships.bind(this);
    this.generateHeaderXML = this.generateHeaderXML.bind(this);
    this.generateFooterXML = this.generateFooterXML.bind(this);
    this.generateSectionXML = generateSectionXML.bind(this);
    this.generateCommentsXML = this.generateCommentsXML.bind(this);
    this.ensureComment = this.ensureComment.bind(this);
    this.getCommentId = this.getCommentId.bind(this);
    this.getRevisionId = this.getRevisionId.bind(this);

    this.ListStyleBuilder = new ListStyleBuilder(properties.numbering);
  }

  generateSectionXML: (
    vTree: VTree,
    type?: 'footer' | 'header'
  ) => Promise<FooterResult | HeaderResult>;

  generateContentTypesXML(): string {
    const contentTypesXML = create(
      { encoding: 'UTF-8', standalone: true },
      contentTypesXMLString
    );

    generateContentTypesFragments(
      contentTypesXML,
      'header',
      this.headerObjects
    );
    generateContentTypesFragments(
      contentTypesXML,
      'footer',
      this.footerObjects
    );

    // Add comment-related content types if there are comments
    if (this.comments.length > 0) {
      const overrides: Array<{ contentType: string; partName: string }> = [
        {
          contentType:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml',
          partName: '/word/comments.xml',
        },
        {
          contentType: commentsExtendedContentType,
          partName: '/word/commentsExtended.xml',
        },
        {
          contentType: commentsIdsContentType,
          partName: '/word/commentsIds.xml',
        },
        {
          contentType: commentsExtensibleContentType,
          partName: '/word/commentsExtensible.xml',
        },
        {
          contentType: peopleContentType,
          partName: '/word/people.xml',
        },
      ];

      overrides.forEach(({ contentType, partName }) => {
        const frag = fragment({
          defaultNamespace: { ele: namespaces.contentTypes },
        })
          .ele('Override')
          .att('PartName', partName)
          .att('ContentType', contentType)
          .up();
        contentTypesXML.root().import(frag);
      });
    }

    return contentTypesXML.toString({ prettyPrint: true });
  }

  generateDocumentXML(): string {
    const documentXML = create(
      { encoding: 'UTF-8', standalone: true },
      generateDocumentTemplate(
        this.width,
        this.height,
        this.orientation,
        this.margins
      )
    );
    documentXML.root().first().import(this.documentXML!);

    generateSectionReferenceXML(
      documentXML,
      'header',
      this.headerObjects,
      this.header
    );
    generateSectionReferenceXML(
      documentXML,
      'footer',
      this.footerObjects,
      this.footer
    );

    if ((this.header || this.footer) && this.skipFirstHeaderFooter) {
      documentXML
        .root()
        .first()
        .first()
        .import(
          fragment({ namespaceAlias: { w: namespaces.w } }).ele('@w', 'titlePg')
        );
    }
    if (this.lineNumber) {
      const { countBy, start, restart } = this.lineNumber;
      documentXML
        .root()
        .first()
        .first()
        .import(
          fragment({ namespaceAlias: { w: namespaces.w } })
            .ele('@w', 'lnNumType')
            .att('@w', 'countBy', String(countBy))
            .att('@w', 'start', String(start))
            .att('@w', 'restart', restart as string)
        );
    }

    let xmlString = documentXML.toString({ prettyPrint: true });

    // Fix namespace prefixes for drawing elements
    // xmlbuilder2 doesn't correctly preserve namespace prefixes when importing fragments
    // so we need to post-process the XML string to fix them

    // wp: (wordprocessingDrawing) elements
    const wpElements = [
      'inline',
      'anchor',
      'simplePos',
      'positionH',
      'positionV',
      'posOffset',
      'extent',
      'effectExtent',
      'wrapNone',
      'wrapSquare',
      'wrapTight',
      'wrapThrough',
      'docPr',
    ];
    wpElements.forEach((el) => {
      xmlString = xmlString.replace(
        new RegExp(`<w:${el}([ />])`, 'g'),
        `<wp:${el}$1`
      );
      xmlString = xmlString.replace(
        new RegExp(`</w:${el}>`, 'g'),
        `</wp:${el}>`
      );
    });

    // a: (drawingML main) elements
    const aElements = [
      'graphic',
      'graphicData',
      'blip',
      'srcRect',
      'stretch',
      'fillRect',
      'xfrm',
      'off',
      'ext',
      'prstGeom',
    ];
    aElements.forEach((el) => {
      xmlString = xmlString.replace(
        new RegExp(`<w:${el}([ />])`, 'g'),
        `<a:${el}$1`
      );
      xmlString = xmlString.replace(
        new RegExp(`</w:${el}>`, 'g'),
        `</a:${el}>`
      );
    });

    // pic: (picture) elements
    const picElements = [
      'pic',
      'nvPicPr',
      'cNvPr',
      'cNvPicPr',
      'blipFill',
      'spPr',
    ];
    picElements.forEach((el) => {
      xmlString = xmlString.replace(
        new RegExp(`<w:${el}([ />])`, 'g'),
        `<pic:${el}$1`
      );
      xmlString = xmlString.replace(
        new RegExp(`</w:${el}>`, 'g'),
        `</pic:${el}>`
      );
    });

    return xmlString;
  }

  generateCoreXML(): string {
    return generateXMLString(
      generateCoreXML(
        this.title,
        this.subject,
        this.creator,
        this.keywords,
        this.description,
        this.lastModifiedBy,
        this.revision,
        this.createdAt,
        this.modifiedAt
      )
    );
  }

  // eslint-disable-next-line class-methods-use-this
  generateSettingsXML(): string {
    return generateXMLString(settingsXMLString);
  }

  // eslint-disable-next-line class-methods-use-this
  generateWebSettingsXML(): string {
    return generateXMLString(webSettingsXMLString);
  }

  generateStylesXML(): string {
    return generateXMLString(
      generateStylesXML(
        this.font,
        this.fontSize,
        this.complexScriptFontSize,
        this.lang
      )
    );
  }

  generateFontTableXML(): string {
    const fontTableXML = create(
      { encoding: 'UTF-8', standalone: true },
      fontTableXMLString
    );
    const fontNames = [
      'Arial',
      'Calibri',
      'Calibri Light',
      'Courier New',
      'Symbol',
      'Times New Roman',
    ];
    this.fontTableObjects.forEach(({ fontName, genericFontName }) => {
      if (!fontNames.includes(fontName)) {
        fontNames.push(fontName);
        const fontFragment = fragment({
          namespaceAlias: { w: namespaces.w },
        })
          .ele('@w', 'font')
          .att('@w', 'name', fontName);

        switch (genericFontName) {
          case 'serif':
            fontFragment
              .ele('@w', 'altName')
              .att('@w', 'val', 'Times New Roman');
            fontFragment.ele('@w', 'family').att('@w', 'val', 'roman');
            fontFragment.ele('@w', 'pitch').att('@w', 'val', 'variable');
            break;
          case 'sans-serif':
            fontFragment.ele('@w', 'altName').att('@w', 'val', 'Arial');
            fontFragment.ele('@w', 'family').att('@w', 'val', 'swiss');
            fontFragment.ele('@w', 'pitch').att('@w', 'val', 'variable');
            break;
          case 'monospace':
            fontFragment.ele('@w', 'altName').att('@w', 'val', 'Courier New');
            fontFragment.ele('@w', 'family').att('@w', 'val', 'modern');
            fontFragment.ele('@w', 'pitch').att('@w', 'val', 'fixed');
            break;
          default:
            break;
        }

        fontTableXML.root().import(fontFragment);
      }
    });

    return fontTableXML.toString({ prettyPrint: true });
  }

  generateThemeXML(): string {
    return generateXMLString(generateThemeXML(this.font));
  }

  generateNumberingXML(): string {
    const numberingXML = create(
      { encoding: 'UTF-8', standalone: true },
      generateNumberingXMLTemplate()
    );

    const abstractNumberingFragments = fragment();
    const numberingFragments = fragment();

    this.numberingObjects.forEach(({ numberingId, type, properties }) => {
      const abstractNumberingFragment = fragment({
        namespaceAlias: { w: namespaces.w },
      })
        .ele('@w', 'abstractNum')
        .att('@w', 'abstractNumId', String(numberingId));

      Array.from({ length: 8 }, (_, level) => level).forEach((level) => {
        const levelFragment = fragment({ namespaceAlias: { w: namespaces.w } })
          .ele('@w', 'lvl')
          .att('@w', 'ilvl', String(level))
          .ele('@w', 'start')
          .att(
            '@w',
            'val',
            type === 'ol' ? properties.attributes?.['data-start'] || '1' : '1'
          )
          .up()
          .ele('@w', 'numFmt')
          .att(
            '@w',
            'val',
            type === 'ol'
              ? this.ListStyleBuilder.getListStyleType(
                  properties.style?.['list-style-type']
                )
              : 'bullet'
          )
          .up()
          .ele('@w', 'lvlText')
          .att(
            '@w',
            'val',
            type === 'ol'
              ? this.ListStyleBuilder.getListPrefixSuffix(
                  properties.style,
                  level
                )
              : getBulletChar(level)
          )
          .up()
          .ele('@w', 'lvlJc')
          .att('@w', 'val', 'left')
          .up()
          .ele('@w', 'pPr')
          .ele('@w', 'tabs')
          .ele('@w', 'tab')
          .att('@w', 'val', 'num')
          .att('@w', 'pos', String(level * 360 + 360))
          .up()
          .up()
          .ele('@w', 'ind')
          .att('@w', 'left', String(level * 360 + 360))
          .att('@w', 'hanging', '360')
          .up()
          .up()
          .up();

        if (type === 'ul') {
          levelFragment.last().import(
            fragment({ namespaceAlias: { w: namespaces.w } })
              .ele('@w', 'rPr')
              .ele('@w', 'rFonts')
              .att('@w', 'ascii', 'Symbol')
              .att('@w', 'hAnsi', 'Symbol')
              .att('@w', 'hint', 'default')
              .up()
              .up()
          );
        }
        abstractNumberingFragment.import(levelFragment);
      });
      abstractNumberingFragment.up();
      abstractNumberingFragments.import(abstractNumberingFragment);

      numberingFragments.import(
        fragment({ namespaceAlias: { w: namespaces.w } })
          .ele('@w', 'num')
          .att('@w', 'numId', String(numberingId))
          .ele('@w', 'abstractNumId')
          .att('@w', 'val', String(numberingId))
          .up()
          .up()
      );
    });

    numberingXML.root().import(abstractNumberingFragments);
    numberingXML.root().import(numberingFragments);

    return numberingXML.toString({ prettyPrint: true });
  }

  // eslint-disable-next-line class-methods-use-this
  appendRelationships(
    xmlFragment: XMLBuilder,
    relationships: RelationshipObject[]
  ): void {
    relationships.forEach(({ relationshipId, type, target, targetMode }) => {
      xmlFragment.import(
        fragment({ defaultNamespace: { ele: namespaces.relationship } })
          .ele('Relationship')
          .att('Id', `rId${relationshipId}`)
          .att('Type', type)
          .att('Target', target)
          .att('TargetMode', targetMode)
          .up()
      );
    });
  }

  generateRelsXML(): RelationshipXMLOutput[] {
    const relationshipXMLStrings = this.relationships.map(
      ({ fileName, rels }) => {
        const xmlFragment = create(
          { encoding: 'UTF-8', standalone: true },
          fileName === documentFileName
            ? documentRelsXMLString
            : genericRelsXMLString
        );
        this.appendRelationships(xmlFragment.root(), rels);

        return {
          fileName,
          xmlString: xmlFragment.toString({ prettyPrint: true }),
        };
      }
    );

    return relationshipXMLStrings;
  }

  createNumbering(type: 'ol' | 'ul', properties: NumberingProperties): number {
    this.lastNumberingId += 1;
    this.numberingObjects.push({
      numberingId: this.lastNumberingId,
      type,
      properties,
    });

    return this.lastNumberingId;
  }

  createFont(fontFamily: string): string {
    const fontTableObject = fontFamilyToTableObject(fontFamily, this.font);
    this.fontTableObjects.push(fontTableObject);

    return fontTableObject.fontName;
  }

  createMediaFile(base64String: string): MediaFileInfo {
    // eslint-disable-next-line no-useless-escape
    const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);

    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 string');
    }

    const base64FileContent = matches[2];
    // matches array contains file type in base64 format - image/jpeg and base64 stringified data
    const extensionMatch = matches[1].match(/\/(.*?)$/);
    const fileExtension =
      extensionMatch && extensionMatch[1] === 'octet-stream'
        ? 'png'
        : extensionMatch
          ? extensionMatch[1]
          : 'png';

    const fileNameWithExtension = `image-${nanoid()}.${fileExtension}`;

    this.lastMediaId += 1;

    return {
      id: this.lastMediaId,
      fileContent: base64FileContent,
      fileNameWithExtension,
    };
  }

  createDocumentRelationships(
    fileName: string,
    type: string,
    target: string,
    targetMode: string = 'External'
  ): number {
    let relationshipObject = this.relationships.find(
      (relationship) => relationship.fileName === fileName
    );
    let lastRelsId = 1;

    if (relationshipObject) {
      lastRelsId = relationshipObject.lastRelsId + 1;
      relationshipObject.lastRelsId = lastRelsId;
    } else {
      relationshipObject = { fileName, lastRelsId, rels: [] };
      this.relationships.push(relationshipObject);
    }

    let relationshipType: string | undefined;

    switch (type) {
      case hyperlinkType:
        relationshipType = namespaces.hyperlinks;
        break;
      case imageType:
        relationshipType = namespaces.images;
        break;
      case commentsType:
        relationshipType = namespaces.comments;
        break;
      case commentsExtendedType:
        relationshipType = commentsExtendedRelationshipType;
        break;
      case commentsIdsType:
        relationshipType = commentsIdsRelationshipType;
        break;
      case commentsExtensibleType:
        relationshipType = commentsExtensibleRelationshipType;
        break;
      case peopleType:
        relationshipType = peopleRelationshipType;
        break;
      case headerFileType:
        relationshipType = namespaces.headers;
        break;
      case footerFileType:
        relationshipType = namespaces.footers;
        break;
      case themeFileType:
        relationshipType = namespaces.themes;
        break;
    }

    relationshipObject.rels.push({
      relationshipId: lastRelsId,
      type: relationshipType!,
      target,
      targetMode,
    });

    return lastRelsId;
  }

  generateHeaderXML(vTree: VTree): Promise<HeaderResult> {
    return this.generateSectionXML(vTree, 'header') as Promise<HeaderResult>;
  }

  generateFooterXML(vTree: VTree): Promise<FooterResult> {
    return this.generateSectionXML(vTree, 'footer') as Promise<FooterResult>;
  }

  // ============================================================================
  // Tracking Support Methods (Comments and Suggestions)
  // ============================================================================

  /**
   * Get a revision ID for a suggestion. Creates a new one if needed.
   * Ensures consistent IDs for the same suggestion across multiple occurrences.
   */
  getRevisionId(id?: string): number {
    if (!id) {
      this.lastRevisionId += 1;
      return this.lastRevisionId;
    }

    const existing = this.revisionIdMap.get(id);
    if (existing !== undefined) {
      return existing;
    }

    this.lastRevisionId += 1;
    this.revisionIdMap.set(id, this.lastRevisionId);
    return this.lastRevisionId;
  }

  /**
   * Ensure a comment exists in the document and return its numeric ID.
   * Updates metadata if the comment already exists but had missing fields.
   */
  ensureComment(data: Partial<CommentPayload>, parentParaId?: string): number {
    const { id, authorName, authorInitials, date, text } = data;
    const commentId = id || `comment-${this.lastCommentId + 1}`;
    let numericId = this.commentIdMap.get(commentId);

    if (numericId === undefined) {
      this.lastCommentId += 1;
      numericId = this.lastCommentId;
      this.commentIdMap.set(commentId, numericId);
    }

    const existing = this.comments.find((item) => item.id === numericId);
    if (existing) {
      // Update missing fields
      if (!existing.authorName && authorName) {
        existing.authorName = authorName;
      }
      if (!existing.authorInitials && authorInitials) {
        existing.authorInitials = authorInitials;
      }
      if (!existing.date && date) {
        existing.date = date;
      }
      if (!existing.text && text) {
        existing.text = text;
      }
      return numericId;
    }

    this.comments.push({
      id: numericId,
      authorName: authorName || 'unknown',
      authorInitials: authorInitials || '',
      date,
      durableId: generateHexId(),
      paraId: generateHexId(),
      parentParaId,
      text: text || 'Imported comment',
    });

    return numericId;
  }

  /**
   * Get the numeric ID for a comment, creating it if necessary.
   */
  getCommentId(id: string): number {
    if (!id) {
      return this.ensureComment({ id: undefined });
    }
    return this.ensureComment({ id });
  }

  /**
   * Generate the comments.xml file content.
   * Matches reference library structure: w14:paraId on paragraphs,
   * CommentReference style on first run, text runs with formatting.
   */
  generateCommentsXML(): string {
    const w = namespaces.w;
    const commentsXML = create(COMMENTS_TEMPLATE);
    const root = commentsXML.root();

    this.comments.forEach((comment) => {
      const commentElement = root
        .ele(w, 'comment')
        .att(w, 'id', String(comment.id))
        .att(w, 'author', comment.authorName || 'unknown');

      if (comment.authorInitials) {
        commentElement.att(w, 'initials', comment.authorInitials);
      }
      if (comment.date) {
        commentElement.att(w, 'date', comment.date);
      }

      // Split multi-line comment text into paragraphs
      const paragraphs = String(comment.text || '')
        .split(/\r?\n/)
        .filter((line, index, arr) => line.length > 0 || arr.length === 1);

      paragraphs.forEach((line, pIdx) => {
        const pElement = commentElement.ele(w, 'p');

        // Add w14:paraId and w14:textId per OOXML spec
        pElement.att(namespaces.w14, 'paraId', comment.paraId);
        pElement.att(namespaces.w14, 'textId', '77777777');

        // Paragraph properties
        pElement
          .ele(w, 'pPr')
          .ele(w, 'pStyle')
          .att(w, 'val', 'CommentText')
          .up()
          .up();

        // First paragraph gets CommentReference run
        if (pIdx === 0) {
          const refRun = pElement.ele(w, 'r');
          refRun
            .ele(w, 'rPr')
            .ele(w, 'rStyle')
            .att(w, 'val', 'CommentReference')
            .up()
            .up();
          refRun.ele(w, 'annotationRef').up();
          refRun.up();
        }

        // Text run
        const textRun = pElement.ele(w, 'r');
        textRun
          .ele(w, 'rPr')
          .ele(w, 'color')
          .att(w, 'val', '000000')
          .up()
          .ele(w, 'sz')
          .att(w, 'val', '20')
          .up()
          .ele(w, 'szCs')
          .att(w, 'val', '20')
          .up()
          .up();
        textRun
          .ele(w, 't')
          .att('http://www.w3.org/XML/1998/namespace', 'space', 'preserve')
          .txt(line)
          .up();
        textRun.up();

        pElement.up();
      });

      commentElement.up();
    });

    return commentsXML.end({ prettyPrint: true });
  }

  /**
   * Generate word/commentsExtended.xml.
   * Links comments via paraId and establishes parent-child threading via paraIdParent.
   */
  generateCommentsExtendedXML(): string {
    const doc = create(COMMENTS_EXTENDED_TEMPLATE);
    const root = doc.root();

    this.comments.forEach((comment) => {
      const el = root.ele(namespaces.w15, 'commentEx');
      el.att(namespaces.w15, 'paraId', comment.paraId);
      el.att(namespaces.w15, 'done', '0');
      if (comment.parentParaId) {
        el.att(namespaces.w15, 'paraIdParent', comment.parentParaId);
      }
      el.up();
    });

    return doc.end({ prettyPrint: true });
  }

  /**
   * Generate word/commentsIds.xml.
   * Maps paraId to durableId for each comment.
   */
  generateCommentsIdsXML(): string {
    const doc = create(COMMENTS_IDS_TEMPLATE);
    const root = doc.root();

    this.comments.forEach((comment) => {
      const el = root.ele(namespaces.w16cid, 'commentId');
      el.att(namespaces.w16cid, 'paraId', comment.paraId);
      el.att(namespaces.w16cid, 'durableId', comment.durableId);
      el.up();
    });

    return doc.end({ prettyPrint: true });
  }

  /**
   * Generate word/commentsExtensible.xml.
   * Links durableId to dateUtc for each comment.
   */
  generateCommentsExtensibleXML(): string {
    const doc = create(COMMENTS_EXTENSIBLE_TEMPLATE);
    const root = doc.root();

    this.comments.forEach((comment) => {
      const el = root.ele(namespaces.w16cex, 'commentExtensible');
      el.att(namespaces.w16cex, 'durableId', comment.durableId);
      if (comment.date) {
        el.att(namespaces.w16cex, 'dateUtc', comment.date);
      }
      el.up();
    });

    return doc.end({ prettyPrint: true });
  }

  /**
   * Generate word/people.xml.
   * Contains unique author entries with presence info.
   */
  generatePeopleXML(): string {
    const doc = create(PEOPLE_TEMPLATE);
    const root = doc.root();

    // Collect unique authors
    const uniqueAuthors = new Set<string>();
    this.comments.forEach((comment) => {
      if (comment.authorName) {
        uniqueAuthors.add(comment.authorName);
      }
    });

    uniqueAuthors.forEach((author) => {
      const personEl = root.ele(namespaces.w15, 'person');
      personEl.att(namespaces.w15, 'author', author);
      personEl
        .ele(namespaces.w15, 'presenceInfo')
        .att(namespaces.w15, 'providerId', 'None')
        .att(namespaces.w15, 'userId', author)
        .up();
      personEl.up();
    });

    return doc.end({ prettyPrint: true });
  }
}

export default DocxDocument;
