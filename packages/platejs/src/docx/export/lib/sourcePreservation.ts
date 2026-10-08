import JSZip from 'jszip';

import { throwIfDocxAborted } from '../../internal/abort';
import {
  DocxPackageError,
  readBoundedDocxPackage,
} from '../../internal/docxPackage';
import {
  contentTypeFor,
  decodeXml,
  elements,
  parseXml,
  readContentTypes,
  readRelationships,
  relationshipPartFor,
  type DocxContentTypeIndex,
  type DocxRelationship,
} from '../../internal/packageParts';
import type { DocxSourceLease } from '../../internal/source';
import {
  docxRootPartOnEdit,
  isDocxHyperlinkTarget,
} from '../../internal/sourceEligibility';
import type { DocxDiagnostic } from '../../internal/types';

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const PACKAGE_RELATIONSHIPS_NAMESPACE =
  'http://schemas.openxmlformats.org/package/2006/relationships';
const OFFICE_RELATIONSHIPS_NAMESPACE =
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const HYPERLINK_RELATIONSHIP = `${OFFICE_RELATIONSHIPS_NAMESPACE}/hyperlink`;
const WORD_NAMESPACE =
  'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

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

const encodeXml = (source: string) => new TextEncoder().encode(source);

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
  sourceContentTypes: DocxContentTypeIndex,
  generatedContentTypes: DocxContentTypeIndex
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
        if (
          relationship.type === HYPERLINK_RELATIONSHIP &&
          isDocxHyperlinkTarget(relationship.target)
        ) {
          continue;
        }

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
  relationship: DocxRelationship,
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
      invalidated: 'export regenerated the document without it',
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
  part === 'word/_rels/document.xml.rels' ||
  part === 'word/styles.xml' ||
  part === 'word/numbering.xml' ||
  part === 'word/settings.xml' ||
  part === 'word/fontTable.xml' ||
  part === 'word/webSettings.xml' ||
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
  throwIfDocxAborted(signal);
  const [sourcePackage, generatedBytes] = await Promise.all([
    readBoundedDocxPackage(source.blob, source.limits, signal),
    generated.arrayBuffer(),
  ]);
  throwIfDocxAborted(signal);
  const generatedZip = await JSZip.loadAsync(generatedBytes);
  throwIfDocxAborted(signal);
  const generatedEntries = new Map<string, Uint8Array>();

  for (const [name, entry] of Object.entries(generatedZip.files)) {
    if (!entry.dir) {
      generatedEntries.set(name, await entry.async('uint8array'));
      throwIfDocxAborted(signal);
    }
  }
  throwIfDocxAborted(signal);
  const sourceContentTypesSource = sourcePackage.entries.get(
    '[Content_Types].xml'
  );
  const generatedContentTypesSource = generatedEntries.get(
    '[Content_Types].xml'
  );
  const generatedRootRelationshipsSource = generatedEntries.get('_rels/.rels');

  if (
    !(
      sourceContentTypesSource &&
      generatedContentTypesSource &&
      generatedRootRelationshipsSource
    )
  ) {
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

  const generatedRootRelationships = parseXml(
    decodeXml(generatedRootRelationshipsSource)
  );
  const regeneratedRootParts = new Set<string>();
  const droppedRootParts = new Set<string>();

  for (const relationship of readRelationships(sourcePackage.entries, '')) {
    const part = relationship.targetPart;
    const onEdit = docxRootPartOnEdit(relationship.type);

    if (!(part && onEdit)) {
      throw new Error(
        `Retained DOCX root relationship ${relationship.id} was not admitted.`
      );
    }
    switch (onEdit) {
      case 'carry': {
        const candidate = collectCandidate(
          part,
          sourcePackage.entries,
          generatedParts,
          copiedParts,
          sourceContentTypes,
          generatedContentTypes
        );

        if (!candidate.ok) {
          diagnose(candidate.part, candidate.reason);
          break;
        }
        acceptCandidate(candidate);
        appendRelationship(
          generatedRootRelationships,
          relationship,
          nextRelationshipId(generatedRootRelationships, 'rIdSource')
        );
        break;
      }
      case 'drop': {
        droppedRootParts.add(part);
        break;
      }
      case 'regenerate': {
        regeneratedRootParts.add(part);
        break;
      }
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

  replacements.set(
    '_rels/.rels',
    encodeXml(new XMLSerializer().serializeToString(generatedRootRelationships))
  );
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
    if (
      copiedParts.has(part) ||
      regeneratedRootParts.has(part) ||
      sourceOwnedPart(part)
    ) {
      continue;
    }
    diagnose(
      part,
      droppedRootParts.has(part)
        ? 'invalidated'
        : activePart(part)
          ? 'active-content'
          : 'unreachable'
    );
  }

  throwIfDocxAborted(signal);
  const blob = await generatedZip.generateAsync({
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
    mimeType: DOCX_MIME,
    type: 'blob',
  });
  throwIfDocxAborted(signal);

  try {
    await readBoundedDocxPackage(blob, source.limits, signal);
    throwIfDocxAborted(signal);
  } catch (error) {
    if (signal?.aborted) throwIfDocxAborted(signal);
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
