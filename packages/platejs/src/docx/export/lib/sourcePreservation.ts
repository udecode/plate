import JSZip from 'jszip';

import {
  DocxPackageError,
  readBoundedDocxPackage,
} from '../../internal/docxPackage';
import type { DocxSourceLease } from '../../internal/source';
import type { DocxDiagnostic } from '../../internal/types';

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const PACKAGE_RELATIONSHIPS_NAMESPACE =
  'http://schemas.openxmlformats.org/package/2006/relationships';
const OFFICE_RELATIONSHIPS_NAMESPACE =
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const WORD_NAMESPACE =
  'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

type Relationship = Readonly<{
  element: Element;
  external: boolean;
  id: string;
  target: string;
  targetPart: string | null;
  type: string;
}>;

type Candidate =
  | Readonly<{
      contentTypes: ReadonlyMap<string, string>;
      ok: true;
      parts: ReadonlySet<string>;
    }>
  | Readonly<{
      ok: false;
      part: string;
      reason:
        | 'active-content'
        | 'conflict'
        | 'external-relationship'
        | 'unreachable';
    }>;

const throwIfAborted = (signal: AbortSignal | undefined) => {
  if (!signal?.aborted) return;

  throw signal.reason ?? new DOMException('Aborted', 'AbortError');
};

const parseXml = (source: string) => {
  const document = new DOMParser().parseFromString(source, 'application/xml');

  if (document.querySelector('parsererror')) {
    throw new Error('DOCX package contains malformed XML.');
  }

  return document;
};

const decodeXml = (source: Uint8Array) => new TextDecoder().decode(source);
const encodeXml = (source: string) => new TextEncoder().encode(source);
const elements = (document: Document | Element) =>
  Array.from(document.getElementsByTagName('*'));

const relationshipPartFor = (part: string) => {
  if (part === '') return '_rels/.rels';
  const separator = part.lastIndexOf('/');
  const directory = separator === -1 ? '' : part.slice(0, separator + 1);
  const filename = part.slice(separator + 1);

  return `${directory}_rels/${filename}.rels`;
};

const resolveTarget = (owner: string, target: string): string | null => {
  if (
    target.includes('\\') ||
    /%(?:00|2f|5c)/i.test(target) ||
    target.includes('?') ||
    target.includes('#')
  ) {
    return null;
  }
  let decoded: string;

  try {
    decoded = decodeURIComponent(target);
  } catch {
    return null;
  }
  const path = decoded.startsWith('/') ? [] : owner.split('/').slice(0, -1);

  for (const segment of decoded.replace(/^\/+/, '').split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..') {
      if (path.length === 0) return null;
      path.pop();
    } else {
      path.push(segment);
    }
  }

  return path.length > 0 ? path.join('/') : null;
};

const readRelationships = (
  entries: ReadonlyMap<string, Uint8Array>,
  owner: string
): readonly Relationship[] => {
  const source = entries.get(relationshipPartFor(owner));

  if (!source) return Object.freeze([]);
  const document = parseXml(decodeXml(source));

  return Object.freeze(
    elements(document)
      .filter((element) => element.localName === 'Relationship')
      .map((element) => {
        const target = element.getAttribute('Target') ?? '';
        const external =
          element.getAttribute('TargetMode')?.toLowerCase() === 'external';

        return Object.freeze({
          element,
          external,
          id: element.getAttribute('Id') ?? '',
          target,
          targetPart: external ? null : resolveTarget(owner, target),
          type: element.getAttribute('Type') ?? '',
        });
      })
  );
};

type ContentTypeIndex = Readonly<{
  defaults: ReadonlyMap<string, string>;
  document: Document;
  overrides: ReadonlyMap<string, string>;
}>;

const readContentTypes = (source: Uint8Array): ContentTypeIndex => {
  const document = parseXml(decodeXml(source));
  const defaults = new Map<string, string>();
  const overrides = new Map<string, string>();

  for (const element of elements(document)) {
    const contentType = element.getAttribute('ContentType');

    if (!contentType) continue;
    if (element.localName === 'Default') {
      const extension = element.getAttribute('Extension');

      if (extension) defaults.set(extension.toLowerCase(), contentType);
    } else if (element.localName === 'Override') {
      const part = element.getAttribute('PartName')?.replace(/^\//, '');

      if (part) overrides.set(part, contentType);
    }
  }

  return Object.freeze({ defaults, document, overrides });
};

const contentTypeFor = (index: ContentTypeIndex, part: string) => {
  const override = index.overrides.get(part);

  if (override) return override;
  const extension = part.includes('.') ? part.split('.').at(-1) : undefined;

  return extension ? index.defaults.get(extension.toLowerCase()) : undefined;
};

const activePart = (part: string) =>
  /(?:^|\/)(?:_xmlsignatures|activex|controls|embeddings)(?:\/|$)/i.test(
    part
  ) || /(?:vbaproject|oleobject|macros?)(?:\.|\/|$)/i.test(part);

const activeClaim = (value: string) =>
  /(?:digital-signature|vbaproject|macroenabled|activex|oleobject|\/control(?:s|\/|$))/i.test(
    value
  );

const collectCandidate = (
  start: string,
  sourceEntries: ReadonlyMap<string, Uint8Array>,
  generatedParts: ReadonlySet<string>,
  copiedParts: ReadonlySet<string>,
  sourceContentTypes: ContentTypeIndex,
  generatedContentTypes: ContentTypeIndex
): Candidate => {
  const queue = [start];
  const parts = new Set<string>();
  const contentTypes = new Map<string, string>();

  while (queue.length > 0) {
    const part = queue.shift();

    if (part === undefined) break;

    if (parts.has(part) || copiedParts.has(part)) continue;
    if (!sourceEntries.has(part)) {
      return { ok: false, part, reason: 'unreachable' };
    }
    if (activePart(part)) {
      return { ok: false, part, reason: 'active-content' };
    }
    if (generatedParts.has(part)) {
      return { ok: false, part, reason: 'conflict' };
    }
    const sourceContentType = contentTypeFor(sourceContentTypes, part);

    if (!sourceContentType) {
      return { ok: false, part, reason: 'conflict' };
    }
    if (activeClaim(sourceContentType)) {
      return { ok: false, part, reason: 'active-content' };
    }
    const generatedContentType = generatedContentTypes.overrides.get(part);

    if (
      generatedContentType !== undefined &&
      generatedContentType !== sourceContentType
    ) {
      return { ok: false, part, reason: 'conflict' };
    }

    parts.add(part);
    contentTypes.set(part, sourceContentType);
    const relationshipsPart = relationshipPartFor(part);
    const relationships = readRelationships(sourceEntries, part);

    if (sourceEntries.has(relationshipsPart)) {
      if (activePart(relationshipsPart)) {
        return {
          ok: false,
          part: relationshipsPart,
          reason: 'active-content',
        };
      }
      if (generatedParts.has(relationshipsPart)) {
        return { ok: false, part: relationshipsPart, reason: 'conflict' };
      }
      parts.add(relationshipsPart);
      const relationshipContentType = contentTypeFor(
        sourceContentTypes,
        relationshipsPart
      );

      if (!relationshipContentType) {
        return { ok: false, part: relationshipsPart, reason: 'conflict' };
      }
      contentTypes.set(relationshipsPart, relationshipContentType);
    }

    for (const relationship of relationships) {
      if (relationship.external) {
        return {
          ok: false,
          part,
          reason: 'external-relationship',
        };
      }
      if (activeClaim(relationship.type)) {
        return { ok: false, part, reason: 'active-content' };
      }
      if (!relationship.targetPart) {
        return { ok: false, part, reason: 'unreachable' };
      }
      queue.push(relationship.targetPart);
    }
  }

  return Object.freeze({
    contentTypes: Object.freeze(contentTypes),
    ok: true,
    parts: Object.freeze(parts),
  });
};

const relationshipRoot = (document: Document) => {
  const root = document.documentElement;

  if (root?.localName !== 'Relationships') {
    throw new Error('DOCX relationship part has an invalid root.');
  }

  return root;
};

const nextRelationshipId = (document: Document, prefix: string) => {
  const used = new Set(
    elements(document)
      .filter((element) => element.localName === 'Relationship')
      .map((element) => element.getAttribute('Id'))
      .filter((id): id is string => Boolean(id))
  );
  let index = 1;

  while (used.has(`${prefix}${index}`)) index += 1;

  return `${prefix}${index}`;
};

const appendRelationship = (
  document: Document,
  relationship: Relationship,
  id: string
) => {
  const element = document.createElementNS(
    PACKAGE_RELATIONSHIPS_NAMESPACE,
    'Relationship'
  );

  element.setAttribute('Id', id);
  element.setAttribute('Type', relationship.type);
  element.setAttribute('Target', relationship.target);
  relationshipRoot(document).append(element);
};

const omissionDiagnostic = (
  part: string,
  reason: Extract<DocxDiagnostic, { code: 'source-part-omitted' }>['reason']
): DocxDiagnostic => ({
  code: 'source-part-omitted',
  message: `Source part ${part} was omitted because ${
    {
      'active-content': 'it contains or reaches active content',
      conflict: 'the generated package owns the same part',
      'external-relationship': 'it reaches an external relationship',
      invalidated: 'the editor change invalidated it',
      'multiple-sections':
        'header and footer ownership is ambiguous across multiple sections',
      unreachable: 'it is not reachable from a preserved relationship',
    }[reason]
  }.`,
  part,
  reason,
  severity: 'warning',
});

const sourceUnavailableDiagnostic = (reason: 'invalid'): DocxDiagnostic => ({
  code: 'source-unavailable',
  message:
    'The retained DOCX source could not be safely overlaid; the document was generated from editor content.',
  reason,
  severity: 'warning',
});

const sourceOwnedPart = (part: string) =>
  part === '[Content_Types].xml' ||
  part === '_rels/.rels' ||
  part === 'word/document.xml' ||
  part === 'word/_rels/document.xml.rels' ||
  part === 'word/styles.xml' ||
  part === 'word/numbering.xml' ||
  part === 'word/settings.xml' ||
  part === 'word/fontTable.xml' ||
  part === 'word/webSettings.xml' ||
  part === 'docProps/core.xml' ||
  part === 'docProps/app.xml' ||
  part === 'editor/authored.json' ||
  part.startsWith('word/theme/') ||
  part.startsWith('word/comments');

const wordElements = (document: Document | Element, name: string) =>
  elements(document).filter(
    (element) =>
      element.localName === name &&
      (!element.namespaceURI || element.namespaceURI === WORD_NAMESPACE)
  );

const copyTitlePageFlag = (
  sourceSection: Element,
  generatedSection: Element
) => {
  const sourceFlag = Array.from(sourceSection.children).find(
    (element) => element.localName === 'titlePg'
  );

  if (
    !sourceFlag ||
    Array.from(generatedSection.children).some(
      (element) => element.localName === 'titlePg'
    )
  ) {
    return;
  }
  const clone = generatedSection.ownerDocument.importNode(sourceFlag, true);
  const following = Array.from(generatedSection.children).find((element) =>
    [
      'bidi',
      'docGrid',
      'printerSettings',
      'rtlGutter',
      'textDirection',
    ].includes(element.localName)
  );

  if (following) {
    following.before(clone);
  } else {
    generatedSection.append(clone);
  }
};

const copyEvenOddFlag = (
  sourceEntries: ReadonlyMap<string, Uint8Array>,
  generatedEntries: ReadonlyMap<string, Uint8Array>,
  replacements: Map<string, Uint8Array>
) => {
  const source = sourceEntries.get('word/settings.xml');
  const generated = generatedEntries.get('word/settings.xml');

  if (!(source && generated)) return;
  const sourceDocument = parseXml(decodeXml(source));

  if (wordElements(sourceDocument, 'evenAndOddHeaders').length === 0) return;
  const generatedDocument = parseXml(decodeXml(generated));

  if (wordElements(generatedDocument, 'evenAndOddHeaders').length > 0) return;
  generatedDocument.documentElement.append(
    generatedDocument.createElementNS(WORD_NAMESPACE, 'w:evenAndOddHeaders')
  );
  replacements.set(
    'word/settings.xml',
    encodeXml(new XMLSerializer().serializeToString(generatedDocument))
  );
};

export const preserveDocxSource = async (
  generated: Blob,
  source: DocxSourceLease,
  signal?: AbortSignal
): Promise<
  Readonly<{ blob: Blob; diagnostics: readonly DocxDiagnostic[] }>
> => {
  throwIfAborted(signal);
  const [sourcePackage, generatedBytes] = await Promise.all([
    readBoundedDocxPackage(source.blob, source.limits, signal),
    generated.arrayBuffer(),
  ]);
  const generatedZip = await JSZip.loadAsync(generatedBytes);
  const generatedEntries = new Map<string, Uint8Array>();

  for (const [name, entry] of Object.entries(generatedZip.files)) {
    if (!entry.dir) generatedEntries.set(name, await entry.async('uint8array'));
  }
  throwIfAborted(signal);
  const sourceContentTypesSource = sourcePackage.entries.get(
    '[Content_Types].xml'
  );
  const generatedContentTypesSource = generatedEntries.get(
    '[Content_Types].xml'
  );

  if (!(sourceContentTypesSource && generatedContentTypesSource)) {
    return Object.freeze({
      blob: generated,
      diagnostics: Object.freeze([sourceUnavailableDiagnostic('invalid')]),
    });
  }
  const sourceContentTypes = readContentTypes(sourceContentTypesSource);
  const generatedContentTypes = readContentTypes(generatedContentTypesSource);
  const generatedParts = new Set(generatedEntries.keys());
  const copiedParts = new Set<string>();
  const copiedContentTypes = new Map<string, string>();
  const replacements = new Map<string, Uint8Array>();
  const diagnostics: DocxDiagnostic[] = [];
  const diagnosed = new Set<string>();
  const diagnose = (
    part: string,
    reason: Extract<DocxDiagnostic, { code: 'source-part-omitted' }>['reason']
  ) => {
    const key = `${reason}:${part}`;

    if (diagnosed.has(key)) return;
    diagnosed.add(key);
    diagnostics.push(omissionDiagnostic(part, reason));
  };
  const acceptCandidate = (candidate: Extract<Candidate, { ok: true }>) => {
    for (const part of candidate.parts) {
      const value = sourcePackage.entries.get(part);

      if (!value) throw new Error(`Accepted DOCX part ${part} is missing.`);
      generatedZip.file(part, value);
      copiedParts.add(part);
    }
    for (const [part, contentType] of candidate.contentTypes) {
      copiedContentTypes.set(part, contentType);
    }
  };

  const generatedRootRelationshipsSource = generatedEntries.get('_rels/.rels');
  const sourceRootRelationshipsSource =
    sourcePackage.entries.get('_rels/.rels');
  const generatedRootRelationships = generatedRootRelationshipsSource
    ? parseXml(decodeXml(generatedRootRelationshipsSource))
    : null;

  if (sourceRootRelationshipsSource && generatedRootRelationships) {
    for (const relationship of readRelationships(sourcePackage.entries, '')) {
      if (
        /\/(?:officeDocument|metadata\/core-properties|extended-properties)$/i.test(
          relationship.type
        )
      ) {
        continue;
      }
      if (relationship.external) {
        diagnose(relationship.target || '_rels/.rels', 'external-relationship');
        continue;
      }
      if (activeClaim(relationship.type)) {
        diagnose(relationship.targetPart ?? '_rels/.rels', 'active-content');
        continue;
      }
      if (!relationship.targetPart) {
        diagnose(relationship.target || '_rels/.rels', 'unreachable');
        continue;
      }
      const candidate = collectCandidate(
        relationship.targetPart,
        sourcePackage.entries,
        generatedParts,
        copiedParts,
        sourceContentTypes,
        generatedContentTypes
      );

      if (!candidate.ok) {
        diagnose(candidate.part, candidate.reason);
        continue;
      }
      acceptCandidate(candidate);
      appendRelationship(
        generatedRootRelationships,
        relationship,
        nextRelationshipId(generatedRootRelationships, 'rIdSource')
      );
    }
  }

  const sourceDocumentSource = sourcePackage.entries.get('word/document.xml');
  const generatedDocumentSource = generatedEntries.get('word/document.xml');
  const sourceDocumentRelationshipsSource = sourcePackage.entries.get(
    'word/_rels/document.xml.rels'
  );
  const generatedDocumentRelationshipsSource = generatedEntries.get(
    'word/_rels/document.xml.rels'
  );
  const generatedDocumentRelationships = generatedDocumentRelationshipsSource
    ? parseXml(decodeXml(generatedDocumentRelationshipsSource))
    : null;

  if (
    sourceDocumentSource &&
    generatedDocumentSource &&
    sourceDocumentRelationshipsSource &&
    generatedDocumentRelationships
  ) {
    const sourceDocument = parseXml(decodeXml(sourceDocumentSource));
    const generatedDocument = parseXml(decodeXml(generatedDocumentSource));
    const sourceSections = wordElements(sourceDocument, 'sectPr');
    const generatedSections = wordElements(generatedDocument, 'sectPr');
    const headerFooterRelationships = readRelationships(
      sourcePackage.entries,
      'word/document.xml'
    ).filter((relationship) => /\/(?:header|footer)$/.test(relationship.type));

    if (sourceSections.length !== 1 || generatedSections.length !== 1) {
      for (const relationship of headerFooterRelationships) {
        diagnose(
          relationship.targetPart ?? relationship.target,
          'multiple-sections'
        );
      }
    } else {
      const relationshipById = new Map(
        headerFooterRelationships.map((relationship) => [
          relationship.id,
          relationship,
        ])
      );
      const acceptedReferences: Element[] = [];

      for (const reference of Array.from(sourceSections[0].children).filter(
        (element) =>
          element.localName === 'headerReference' ||
          element.localName === 'footerReference'
      )) {
        const sourceId =
          reference.getAttributeNS(OFFICE_RELATIONSHIPS_NAMESPACE, 'id') ??
          reference.getAttribute('r:id');
        const relationship = sourceId
          ? relationshipById.get(sourceId)
          : undefined;

        if (!relationship?.targetPart) {
          diagnose(
            relationship?.target ?? sourceId ?? 'word/document.xml',
            'unreachable'
          );
          continue;
        }
        const candidate = collectCandidate(
          relationship.targetPart,
          sourcePackage.entries,
          generatedParts,
          copiedParts,
          sourceContentTypes,
          generatedContentTypes
        );

        if (!candidate.ok) {
          diagnose(candidate.part, candidate.reason);
          continue;
        }
        acceptCandidate(candidate);
        const id = nextRelationshipId(
          generatedDocumentRelationships,
          'rIdSource'
        );

        appendRelationship(generatedDocumentRelationships, relationship, id);
        const clone = generatedDocument.createElementNS(
          WORD_NAMESPACE,
          `w:${reference.localName}`
        );
        const referenceType =
          reference.getAttributeNS(WORD_NAMESPACE, 'type') ??
          reference.getAttribute('w:type');

        if (referenceType) {
          clone.setAttributeNS(WORD_NAMESPACE, 'w:type', referenceType);
        }
        clone.setAttributeNS(OFFICE_RELATIONSHIPS_NAMESPACE, 'r:id', id);
        acceptedReferences.push(clone);
      }

      for (const reference of acceptedReferences.reverse()) {
        generatedSections[0].insertBefore(
          reference,
          generatedSections[0].firstChild
        );
      }
      if (acceptedReferences.length > 0) {
        copyTitlePageFlag(sourceSections[0], generatedSections[0]);
        copyEvenOddFlag(sourcePackage.entries, generatedEntries, replacements);
        replacements.set(
          'word/document.xml',
          encodeXml(new XMLSerializer().serializeToString(generatedDocument))
        );
      }
    }
  }

  for (const [part, contentType] of copiedContentTypes) {
    if (contentTypeFor(generatedContentTypes, part) === contentType) continue;
    const override = generatedContentTypes.document.createElementNS(
      generatedContentTypes.document.documentElement.namespaceURI,
      'Override'
    );

    override.setAttribute('PartName', `/${part}`);
    override.setAttribute('ContentType', contentType);
    generatedContentTypes.document.documentElement.append(override);
  }

  if (generatedRootRelationships) {
    replacements.set(
      '_rels/.rels',
      encodeXml(
        new XMLSerializer().serializeToString(generatedRootRelationships)
      )
    );
  }
  if (generatedDocumentRelationships) {
    replacements.set(
      'word/_rels/document.xml.rels',
      encodeXml(
        new XMLSerializer().serializeToString(generatedDocumentRelationships)
      )
    );
  }
  replacements.set(
    '[Content_Types].xml',
    encodeXml(
      new XMLSerializer().serializeToString(generatedContentTypes.document)
    )
  );
  for (const [part, value] of replacements) generatedZip.file(part, value);

  for (const part of sourcePackage.entries.keys()) {
    if (copiedParts.has(part) || sourceOwnedPart(part)) continue;
    diagnose(part, activePart(part) ? 'active-content' : 'unreachable');
  }

  throwIfAborted(signal);
  const blob = await generatedZip.generateAsync({
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
    mimeType: DOCX_MIME,
    type: 'blob',
  });

  try {
    await readBoundedDocxPackage(blob, source.limits, signal);
  } catch (error) {
    if (signal?.aborted) throwIfAborted(signal);
    if (!(error instanceof DocxPackageError)) throw error;

    return Object.freeze({
      blob: generated,
      diagnostics: Object.freeze([sourceUnavailableDiagnostic('invalid')]),
    });
  }

  return Object.freeze({
    blob,
    diagnostics: Object.freeze(diagnostics),
  });
};
