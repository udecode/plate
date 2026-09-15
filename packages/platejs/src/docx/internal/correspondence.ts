import type { EditorDocumentValue } from '../../core';

export const AUTHORED_DOCX_PART = 'editor/authored.json';
export const AUTHORED_DOCX_CONTENT_TYPE =
  'application/vnd.editor.authored+json';
export const AUTHORED_DOCX_RELATIONSHIP =
  'https://platejs.org/relationships/authored';

export type AuthoredDocxEnvelopeV1 = Readonly<{
  document: EditorDocumentValue;
  parts: ReadonlyArray<Readonly<{ name: string; sha256: string }>>;
  projections: Readonly<{
    accepted: string;
    proposed: string;
  }>;
  version: 1;
}>;

const WORD_NAMESPACE =
  'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const SHA256_PATTERN = /^[\da-f]{64}$/;
const encoder = new TextEncoder();

const toBytes = (value: string | Uint8Array) =>
  typeof value === 'string' ? encoder.encode(value) : value;

export const sha256 = async (value: string | Uint8Array) => {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    Uint8Array.from(toBytes(value))
  );

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const parseDocumentXml = (source: Uint8Array) => {
  const xml = new TextDecoder().decode(source);
  const document = new DOMParser().parseFromString(xml, 'application/xml');

  if (document.querySelector('parsererror')) {
    throw new Error('DOCX main document XML is invalid.');
  }

  return document;
};

const elements = (document: Document) =>
  Array.from(document.getElementsByTagName('*'));

const unwrap = (element: Element) => {
  while (element.firstChild) element.before(element.firstChild);
  element.remove();
};

const projectDocumentXml = (
  source: Uint8Array,
  projection: 'accepted' | 'proposed'
) => {
  const document = parseDocumentXml(source);

  for (const change of elements(document)
    .filter((element) => ['pPrChange', 'rPrChange'].includes(element.localName))
    .reverse()) {
    if (projection === 'proposed') {
      change.remove();
      continue;
    }
    const parent = change.parentElement;
    const expected = change.localName === 'pPrChange' ? 'pPr' : 'rPr';
    const previous = Array.from(change.children).find(
      (child) => child.localName === expected
    );

    if (parent?.localName === expected && previous) {
      parent.replaceWith(previous.cloneNode(true));
    } else {
      change.remove();
    }
  }

  for (const revision of elements(document)
    .filter((element) =>
      ['del', 'ins', 'moveFrom', 'moveTo'].includes(element.localName)
    )
    .reverse()) {
    const inserted =
      revision.localName === 'ins' || revision.localName === 'moveTo';
    const visible = projection === 'proposed' ? inserted : !inserted;

    if (visible) unwrap(revision);
    else revision.remove();
  }

  for (const deletedText of elements(document).filter(
    (element) => element.localName === 'delText'
  )) {
    const replacement = document.createElementNS(WORD_NAMESPACE, 'w:t');

    for (const attribute of Array.from(deletedText.attributes)) {
      if (attribute.namespaceURI) {
        replacement.setAttributeNS(
          attribute.namespaceURI,
          attribute.name,
          attribute.value
        );
      } else {
        replacement.setAttribute(attribute.name, attribute.value);
      }
    }
    while (deletedText.firstChild) replacement.append(deletedText.firstChild);
    deletedText.replaceWith(replacement);
  }

  return new XMLSerializer().serializeToString(document);
};

export const getDocxProjectionDigests = async (
  entries: ReadonlyMap<string, Uint8Array>
) => {
  const documentXml = entries.get('word/document.xml');

  if (!documentXml) throw new Error('DOCX is missing its main document part.');
  const [accepted, proposed] = await Promise.all([
    sha256(projectDocumentXml(documentXml, 'accepted')),
    sha256(projectDocumentXml(documentXml, 'proposed')),
  ]);

  return Object.freeze({ accepted, proposed });
};

export const getDocxPartManifest = async (
  entries: ReadonlyMap<string, Uint8Array>
) =>
  Object.freeze(
    await Promise.all(
      [...entries]
        .filter(([name]) => name !== AUTHORED_DOCX_PART)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(async ([name, value]) =>
          Object.freeze({ name, sha256: await sha256(value) })
        )
    )
  );

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const parseAuthoredDocxEnvelope = (
  source: Uint8Array
): AuthoredDocxEnvelopeV1 => {
  const value: unknown = JSON.parse(new TextDecoder().decode(source));

  if (!isRecord(value) || value.version !== 1) {
    throw new RangeError('Unsupported authored DOCX envelope version.');
  }
  if (
    !isRecord(value.document) ||
    !Array.isArray(value.parts) ||
    !value.parts.every(
      (part) =>
        isRecord(part) &&
        typeof part.name === 'string' &&
        part.name.length > 0 &&
        typeof part.sha256 === 'string' &&
        SHA256_PATTERN.test(part.sha256)
    ) ||
    !isRecord(value.projections) ||
    typeof value.projections.accepted !== 'string' ||
    !SHA256_PATTERN.test(value.projections.accepted) ||
    typeof value.projections.proposed !== 'string' ||
    !SHA256_PATTERN.test(value.projections.proposed)
  ) {
    throw new TypeError('Invalid authored DOCX envelope.');
  }

  return value as AuthoredDocxEnvelopeV1;
};

export const docxPartManifestMatches = (
  expected: AuthoredDocxEnvelopeV1['parts'],
  actual: AuthoredDocxEnvelopeV1['parts']
) =>
  expected.length === actual.length &&
  expected.every(
    (part, index) =>
      part.name === actual[index]?.name && part.sha256 === actual[index]?.sha256
  );

export const docxProjectionDigestsMatch = (
  expected: AuthoredDocxEnvelopeV1['projections'],
  actual: AuthoredDocxEnvelopeV1['projections']
) =>
  expected.accepted === actual.accepted &&
  expected.proposed === actual.proposed;
