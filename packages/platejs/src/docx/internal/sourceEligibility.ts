import type { SaxesTagNS } from 'saxes';

import { decideUrl } from '../../internal/utils/urlPolicy';
import {
  AUTHORED_DOCX_CONTENT_TYPE,
  AUTHORED_DOCX_RELATIONSHIP,
} from './correspondence';
import type { BoundedDocxPackage } from './docxPackage';
import {
  contentTypeFor,
  readContentTypes,
  readRelationships,
  relationshipPartFor,
} from './packageParts';

/** One reason a package cannot back exact source reuse. */
export type DocxSourceViolation = Readonly<{
  detail?: string;
  feature:
    | 'active-content'
    | 'external-relationship'
    | 'field-instruction'
    | 'main-document'
    | 'markup'
    | 'part'
    | 'processing-instruction'
    | 'raster'
    | 'relationship'
    | 'resource-url';
  part: string;
}>;

const VIOLATION_PHRASES: Readonly<
  Record<DocxSourceViolation['feature'], string>
> = {
  'active-content': 'contains active content',
  'external-relationship': 'references an external resource',
  'field-instruction': 'contains an unrecognized field',
  'main-document':
    'does not declare word/document.xml as its only main document',
  markup: 'contains unrecognized markup',
  part: 'is not a recognized passive part',
  'processing-instruction': 'contains an XML processing instruction',
  raster: 'does not match its declared image type',
  relationship: 'declares an unrecognized relationship',
  'resource-url': 'names a resource by URL',
};

/** Describe a violation as "<part> <reason> (<detail>)" for diagnostics. */
export const describeDocxSourceViolation = ({
  detail,
  feature,
  part,
}: DocxSourceViolation) =>
  `${part} ${VIOLATION_PHRASES[feature]}${detail ? ` (${detail})` : ''}`;

const WORD = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const OFFICE = 'urn:schemas-microsoft-com:office:office';
const VML = 'urn:schemas-microsoft-com:vml';
const VML_WORD = 'urn:schemas-microsoft-com:office:word';
const XMLNS = 'http://www.w3.org/2000/xmlns/';

// Element namespaces of the writer, its comment parts as Word writes them, the
// source-preservation fixtures and the licensed Word corpus. Markup in any other
// namespace is unverified.
const PASSIVE_NAMESPACES: ReadonlySet<string> = new Set([
  'http://purl.org/dc/dcmitype/',
  'http://purl.org/dc/elements/1.1/',
  'http://purl.org/dc/terms/',
  'http://schemas.microsoft.com/office/thememl/2012/main',
  'http://schemas.microsoft.com/office/word/2010/wordml',
  'http://schemas.microsoft.com/office/word/2010/wordprocessingShape',
  'http://schemas.microsoft.com/office/word/2012/wordml',
  'http://schemas.microsoft.com/office/word/2016/wordml/cid',
  'http://schemas.microsoft.com/office/word/2018/wordml/cex',
  'http://schemas.openxmlformats.org/drawingml/2006/main',
  'http://schemas.openxmlformats.org/drawingml/2006/picture',
  'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
  'http://schemas.openxmlformats.org/markup-compatibility/2006',
  'http://schemas.openxmlformats.org/officeDocument/2006/custom-properties',
  'http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes',
  'http://schemas.openxmlformats.org/officeDocument/2006/extended-properties',
  'http://schemas.openxmlformats.org/officeDocument/2006/math',
  'http://schemas.openxmlformats.org/package/2006/content-types',
  'http://schemas.openxmlformats.org/package/2006/metadata/core-properties',
  'http://schemas.openxmlformats.org/package/2006/relationships',
  OFFICE,
  VML,
  VML_WORD,
  WORD,
]);

// Elements that embed, fetch or run content even when their relationship is
// also refused: OLE and ActiveX objects, imported chunks, external templates and
// schemas, subdocuments, frames, mail-merge data and XSLT. Macro projects are
// parts, so the relationship vocabulary refuses them.
const ACTIVE_ELEMENTS: ReadonlyMap<string, ReadonlySet<string>> = new Map([
  [OFFICE, new Set(['OLEObject'])],
  [
    WORD,
    new Set([
      'altChunk',
      'attachedSchema',
      'attachedTemplate',
      'control',
      'frameset',
      'mailMerge',
      'object',
      'saveThroughXslt',
      'subDoc',
    ]),
  ],
]);

// Legacy VML can name a destination directly instead of by relationship.
const VML_NAMESPACES: ReadonlySet<string> = new Set([OFFICE, VML, VML_WORD]);
const VML_URL_ATTRIBUTES: ReadonlySet<string> = new Set([
  'althref',
  'href',
  'src',
]);

// The writer's page-number field is the only recognized instruction.
const RECOGNIZED_FIELDS: ReadonlySet<string> = new Set(['PAGE']);

const ascii = (value: string) =>
  Array.from(value, (character) => character.charCodeAt(0));

const hasBytes = (
  bytes: Uint8Array,
  offset: number,
  expected: readonly number[]
) => expected.every((value, index) => bytes[offset + index] === value);

const RASTER_SIGNATURES: ReadonlyMap<string, (bytes: Uint8Array) => boolean> =
  new Map([
    [
      'image/avif',
      (bytes) =>
        hasBytes(bytes, 4, ascii('ftyp')) &&
        (hasBytes(bytes, 8, ascii('avif')) ||
          hasBytes(bytes, 8, ascii('avis'))),
    ],
    ['image/bmp', (bytes) => hasBytes(bytes, 0, ascii('BM'))],
    [
      'image/gif',
      (bytes) =>
        hasBytes(bytes, 0, ascii('GIF87a')) ||
        hasBytes(bytes, 0, ascii('GIF89a')),
    ],
    ['image/jpeg', (bytes) => hasBytes(bytes, 0, [0xff, 0xd8, 0xff])],
    [
      'image/png',
      (bytes) =>
        hasBytes(bytes, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    ],
    [
      'image/webp',
      (bytes) =>
        hasBytes(bytes, 0, ascii('RIFF')) && hasBytes(bytes, 8, ascii('WEBP')),
    ],
  ]);

const RASTER_TYPES = [...RASTER_SIGNATURES.keys()];

/** The raster type whose signature `bytes` carry, or null. */
export const detectRasterType = (bytes: Uint8Array) =>
  RASTER_TYPES.find((type) => RASTER_SIGNATURES.get(type)?.(bytes)) ?? null;

/**
 * Word opens a hyperlink target without a document base, so the target must be
 * absolute and meet the shared navigation floor.
 */
export const isDocxHyperlinkTarget = (target: string) => {
  const decision = decideUrl('navigation', target);

  return decision.ok && /^[a-z][a-z\d+.-]*:/iu.test(decision.url);
};

const OFFICE_RELATIONSHIPS =
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const HYPERLINK = `${OFFICE_RELATIONSHIPS}/hyperlink`;
const PACKAGE_RELATIONSHIPS =
  'http://schemas.openxmlformats.org/package/2006/relationships';
const WORDML = 'application/vnd.openxmlformats-officedocument.wordprocessingml';
const MAIN_DOCUMENT = `${WORDML}.document.main+xml`;
const OFFICE_DOCUMENT = `${OFFICE_RELATIONSHIPS}/officeDocument`;
const RELATIONSHIPS_CONTENT_TYPE =
  'application/vnd.openxmlformats-package.relationships+xml';

/**
 * Content types each relationship type may target from one owner. External
 * targets are only hyperlinks, checked by `isDocxHyperlinkTarget`.
 */
type RelationshipVocabulary = ReadonlyMap<string, readonly string[]>;

const PACKAGE_VOCABULARY: RelationshipVocabulary = new Map([
  [
    `${OFFICE_RELATIONSHIPS}/custom-properties`,
    ['application/vnd.openxmlformats-officedocument.custom-properties+xml'],
  ],
  [
    `${OFFICE_RELATIONSHIPS}/extended-properties`,
    ['application/vnd.openxmlformats-officedocument.extended-properties+xml'],
  ],
  [OFFICE_DOCUMENT, [MAIN_DOCUMENT]],
  [
    `${PACKAGE_RELATIONSHIPS}/metadata/core-properties`,
    ['application/vnd.openxmlformats-package.core-properties+xml'],
  ],
  [`${PACKAGE_RELATIONSHIPS}/metadata/thumbnail`, RASTER_TYPES],
  [AUTHORED_DOCX_RELATIONSHIP, [AUTHORED_DOCX_CONTENT_TYPE]],
]);

const CONTENT_VOCABULARY: RelationshipVocabulary = new Map([
  [HYPERLINK, []],
  [`${OFFICE_RELATIONSHIPS}/image`, RASTER_TYPES],
]);

const MAIN_DOCUMENT_VOCABULARY: RelationshipVocabulary = new Map([
  ...CONTENT_VOCABULARY,
  [`${OFFICE_RELATIONSHIPS}/comments`, [`${WORDML}.comments+xml`]],
  [`${OFFICE_RELATIONSHIPS}/endnotes`, [`${WORDML}.endnotes+xml`]],
  [`${OFFICE_RELATIONSHIPS}/fontTable`, [`${WORDML}.fontTable+xml`]],
  [`${OFFICE_RELATIONSHIPS}/footer`, [`${WORDML}.footer+xml`]],
  [`${OFFICE_RELATIONSHIPS}/footnotes`, [`${WORDML}.footnotes+xml`]],
  [`${OFFICE_RELATIONSHIPS}/header`, [`${WORDML}.header+xml`]],
  [`${OFFICE_RELATIONSHIPS}/numbering`, [`${WORDML}.numbering+xml`]],
  [`${OFFICE_RELATIONSHIPS}/settings`, [`${WORDML}.settings+xml`]],
  [`${OFFICE_RELATIONSHIPS}/styles`, [`${WORDML}.styles+xml`]],
  [
    `${OFFICE_RELATIONSHIPS}/theme`,
    ['application/vnd.openxmlformats-officedocument.theme+xml'],
  ],
  [`${OFFICE_RELATIONSHIPS}/webSettings`, [`${WORDML}.webSettings+xml`]],
  [
    'http://schemas.microsoft.com/office/2007/relationships/stylesWithEffects',
    ['application/vnd.ms-word.stylesWithEffects+xml'],
  ],
  // The comment family in both the writer's and Word's spellings.
  [
    'http://schemas.microsoft.com/office/2011/relationships/commentsExtended',
    [
      `${WORDML}.commentsExtended+xml`,
      'application/vnd.ms-word.commentsExtended+xml',
    ],
  ],
  [
    'http://schemas.microsoft.com/office/2011/relationships/people',
    [`${WORDML}.people+xml`],
  ],
  [
    'http://schemas.microsoft.com/office/2016/09/relationships/commentsIds',
    [`${WORDML}.commentsIds+xml`, 'application/vnd.ms-word.commentsIds+xml'],
  ],
  [
    'http://schemas.microsoft.com/office/2016/relationships/commentsIds',
    [`${WORDML}.commentsIds+xml`, 'application/vnd.ms-word.commentsIds+xml'],
  ],
  [
    'http://schemas.microsoft.com/office/2018/08/relationships/commentsExtensible',
    [`${WORDML}.commentsExtensible+xml`],
  ],
]);

const RELATIONSHIPS_BY_OWNER: ReadonlyMap<string, RelationshipVocabulary> =
  new Map([
    [MAIN_DOCUMENT, MAIN_DOCUMENT_VOCABULARY],
    [`${WORDML}.comments+xml`, CONTENT_VOCABULARY],
    [`${WORDML}.endnotes+xml`, CONTENT_VOCABULARY],
    [`${WORDML}.footer+xml`, CONTENT_VOCABULARY],
    [`${WORDML}.footnotes+xml`, CONTENT_VOCABULARY],
    [`${WORDML}.header+xml`, CONTENT_VOCABULARY],
  ]);

const NO_RELATIONSHIPS: RelationshipVocabulary = new Map();

type SourceViolationInit = Omit<DocxSourceViolation, 'part'>;

const violation = (
  part: string,
  { detail, feature }: SourceViolationInit
): DocxSourceViolation =>
  Object.freeze({ ...(detail ? { detail } : {}), feature, part });

const relationshipName = (type: string) => type.split('/').at(-1) ?? type;

// XML the bounded reader admitted can still fail DOM parsing; that part is
// unverified rather than an import failure.
const parseOrNull = <T>(parse: () => T): T | null => {
  try {
    return parse();
  } catch {
    return null;
  }
};

const wordAttribute = (tag: SaxesTagNS, local: string) =>
  Object.values(tag.attributes).find(
    (attribute) => attribute.uri === WORD && attribute.local === local
  )?.value;

/** Collects the first non-passive markup of one XML part during its SAX pass. */
export const createDocxMarkupInspector = (part: string) => {
  let first: DocxSourceViolation | null = null;
  // Complex fields nest; each frame collects its own instruction text.
  const fields: Array<{ instruction: string; open: boolean }> = [];
  let instructionDepth = 0;
  const fail = (init: SourceViolationInit) => {
    first ??= violation(part, init);
  };
  const checkInstruction = (instruction: string) => {
    const normalized = instruction.trim();

    if (!RECOGNIZED_FIELDS.has(normalized)) {
      fail({
        detail: normalized.split(/\s+/, 1)[0] || 'empty',
        feature: 'field-instruction',
      });
    }
  };
  const openField = (tag: SaxesTagNS) => {
    const type = wordAttribute(tag, 'fldCharType');
    const field = fields.at(-1);

    if (type === 'begin') {
      fields.push({ instruction: '', open: true });
    } else if (type === 'separate' && field?.open) {
      field.open = false;
      checkInstruction(field.instruction);
    } else if (type === 'end' && field) {
      fields.pop();
      if (field.open) checkInstruction(field.instruction);
    } else {
      fail({ feature: 'field-instruction' });
    }
  };

  return {
    close(tag: SaxesTagNS) {
      if (
        instructionDepth > 0 &&
        tag.uri === WORD &&
        (tag.local === 'instrText' || tag.local === 'delInstrText')
      ) {
        instructionDepth -= 1;
      }
    },
    finish() {
      if (fields.length > 0) fail({ feature: 'field-instruction' });

      return first;
    },
    open(tag: SaxesTagNS) {
      if (first) return;
      if (!PASSIVE_NAMESPACES.has(tag.uri)) {
        fail({ detail: tag.uri || tag.name, feature: 'markup' });

        return;
      }
      if (ACTIVE_ELEMENTS.get(tag.uri)?.has(tag.local)) {
        fail({ detail: tag.local, feature: 'active-content' });

        return;
      }
      if (
        VML_NAMESPACES.has(tag.uri) &&
        Object.values(tag.attributes).some(
          (attribute) =>
            attribute.uri !== XMLNS && VML_URL_ATTRIBUTES.has(attribute.local)
        )
      ) {
        fail({ detail: tag.local, feature: 'resource-url' });

        return;
      }
      if (tag.uri !== WORD) return;
      if (tag.local === 'fldSimple') {
        checkInstruction(wordAttribute(tag, 'instr') ?? '');
      } else if (tag.local === 'fldChar') {
        openField(tag);
      } else if (tag.local === 'instrText' || tag.local === 'delInstrText') {
        if (fields.at(-1)?.open) instructionDepth += 1;
        else fail({ feature: 'field-instruction' });
      }
    },
    processingInstruction() {
      fail({ feature: 'processing-instruction' });
    },
    text(text: string) {
      const field = fields.at(-1);

      if (instructionDepth > 0 && field?.open) field.instruction += text;
    },
  };
};

/**
 * Check that every package part, content type, relationship and inspected
 * markup belongs to the closed passive vocabulary exact reuse admits.
 */
export const findDocxSourceViolations = (
  pkg: BoundedDocxPackage
): readonly DocxSourceViolation[] => {
  const violations: DocxSourceViolation[] = [];
  const contentTypesSource = pkg.entries.get('[Content_Types].xml');
  const contentTypes =
    contentTypesSource &&
    parseOrNull(() => readContentTypes(contentTypesSource));

  if (!contentTypes) {
    return Object.freeze([
      violation('[Content_Types].xml', { feature: 'part' }),
    ]);
  }
  const reached = new Set(['[Content_Types].xml']);
  const owners: Array<
    Readonly<{ part: string; vocabulary: RelationshipVocabulary }>
  > = [{ part: '', vocabulary: PACKAGE_VOCABULARY }];
  let mainDocuments = 0;

  for (const owner of owners) {
    const relationshipsPart = relationshipPartFor(owner.part);

    if (!pkg.entries.has(relationshipsPart)) continue;
    reached.add(relationshipsPart);
    if (
      contentTypeFor(contentTypes, relationshipsPart) !==
      RELATIONSHIPS_CONTENT_TYPE
    ) {
      violations.push(violation(relationshipsPart, { feature: 'part' }));
    }
    const relationships = parseOrNull(() =>
      readRelationships(pkg.entries, owner.part)
    );

    if (!relationships) {
      violations.push(violation(relationshipsPart, { feature: 'part' }));
      continue;
    }
    for (const relationship of relationships) {
      const detail = relationshipName(relationship.type);
      const targetTypes = owner.vocabulary.get(relationship.type);

      if (relationship.external) {
        if (
          !targetTypes ||
          relationship.type !== HYPERLINK ||
          !isDocxHyperlinkTarget(relationship.target)
        ) {
          violations.push(
            violation(relationshipsPart, {
              detail,
              feature: 'external-relationship',
            })
          );
        }
        continue;
      }
      const target = relationship.targetPart;

      if (!targetTypes || !target || !pkg.entries.has(target)) {
        violations.push(
          violation(relationshipsPart, { detail, feature: 'relationship' })
        );
        continue;
      }
      const contentType = contentTypeFor(contentTypes, target);

      if (!contentType || !targetTypes.includes(contentType)) {
        violations.push(
          violation(target, { detail: contentType, feature: 'part' })
        );
        continue;
      }
      // Import reads word/document.xml, so exact bytes must present the same part.
      if (relationship.type === OFFICE_DOCUMENT) {
        mainDocuments += 1;
        if (target !== 'word/document.xml') {
          violations.push(
            violation(relationshipsPart, {
              detail: target,
              feature: 'main-document',
            })
          );
        }
      }
      const raster = RASTER_SIGNATURES.get(contentType);

      if (raster && !raster(pkg.entries.get(target) ?? new Uint8Array())) {
        violations.push(violation(target, { feature: 'raster' }));
      }
      if (reached.has(target)) continue;
      reached.add(target);
      owners.push({
        part: target,
        vocabulary: RELATIONSHIPS_BY_OWNER.get(contentType) ?? NO_RELATIONSHIPS,
      });
    }
  }
  if (mainDocuments !== 1) {
    violations.push(violation('_rels/.rels', { feature: 'main-document' }));
  }

  for (const part of pkg.entries.keys()) {
    const contentType = contentTypeFor(contentTypes, part);
    const markup = pkg.xmlVocabulary.get(part);

    if (!reached.has(part)) {
      violations.push(
        violation(part, { detail: contentType, feature: 'part' })
      );
    } else if (markup) {
      violations.push(markup);
    } else if (
      markup === undefined &&
      !RASTER_SIGNATURES.has(contentType ?? '') &&
      contentType !== AUTHORED_DOCX_CONTENT_TYPE
    ) {
      // An XML content type on a part the reader did not inspect as XML.
      violations.push(
        violation(part, { detail: contentType, feature: 'part' })
      );
    }
  }

  return Object.freeze(violations);
};
