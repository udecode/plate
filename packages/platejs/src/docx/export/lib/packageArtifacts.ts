import JSZip from 'jszip';

import type { EditorDocumentValue } from '../../../core';
import {
  AUTHORED_DOCX_CONTENT_TYPE,
  AUTHORED_DOCX_PART,
  AUTHORED_DOCX_RELATIONSHIP,
  getDocxPartManifest,
  getDocxProjectionDigests,
  type AuthoredDocxEnvelopeV1,
} from '../../internal/correspondence';

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const requireFile = (zip: JSZip, name: string) => {
  const file = zip.file(name);

  if (!file) throw new Error(`DOCX package is missing ${name}.`);

  return file;
};

const addXmlDeclaration = (
  source: string,
  closingTag: string,
  declaration: string
) => {
  if (!source.includes(closingTag)) {
    throw new Error('DOCX package metadata is malformed.');
  }

  return source.replace(closingTag, `${declaration}${closingTag}`);
};

const nextRelationshipId = (source: string, base: string) => {
  let suffix = 0;
  let id = base;

  while (source.includes(`Id="${id}"`)) {
    suffix += 1;
    id = `${base}${suffix}`;
  }

  return id;
};

const packageEntries = async (zip: JSZip) => {
  const entries = new Map<string, Uint8Array>();

  await Promise.all(
    Object.values(zip.files).map(async (file) => {
      if (file.dir || file.name === AUTHORED_DOCX_PART) return;
      entries.set(file.name, await file.async('uint8array'));
    })
  );

  return entries;
};

/** Attach one correspondence-bound native review envelope to trusted output. */
export const addAuthoredDocxEnvelope = async (
  blob: Blob,
  document: EditorDocumentValue,
  signal?: AbortSignal
) => {
  if (signal?.aborted) {
    throw signal.reason ?? new DOMException('Aborted', 'AbortError');
  }
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  const contentTypesFile = requireFile(zip, '[Content_Types].xml');
  const relationshipsFile = requireFile(zip, '_rels/.rels');
  const [contentTypes, relationships] = await Promise.all([
    contentTypesFile.async('string'),
    relationshipsFile.async('string'),
  ]);

  zip.file(
    '[Content_Types].xml',
    addXmlDeclaration(
      contentTypes,
      '</Types>',
      `<Override PartName="/${AUTHORED_DOCX_PART}" ContentType="${AUTHORED_DOCX_CONTENT_TYPE}"/>`
    )
  );
  zip.file(
    '_rels/.rels',
    addXmlDeclaration(
      relationships,
      '</Relationships>',
      `<Relationship Id="${nextRelationshipId(relationships, 'rIdPlateAuthored')}" Type="${AUTHORED_DOCX_RELATIONSHIP}" Target="/${AUTHORED_DOCX_PART}"/>`
    )
  );
  const entries = await packageEntries(zip);
  const [parts, projections] = await Promise.all([
    getDocxPartManifest(entries),
    getDocxProjectionDigests(entries),
  ]);
  const envelope: AuthoredDocxEnvelopeV1 = {
    document,
    parts,
    projections,
    version: 1,
  };

  zip.file(AUTHORED_DOCX_PART, JSON.stringify(envelope));
  const bytes = await zip.generateAsync({ type: 'arraybuffer' });

  return new Blob([bytes], { type: DOCX_MIME });
};
