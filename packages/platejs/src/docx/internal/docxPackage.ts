import {
  BlobReader,
  Uint8ArrayWriter,
  ZipReader,
  type Entry,
} from '@zip.js/zip.js';
import JSZip from 'jszip';
import { SaxesParser } from 'saxes';

import { throwIfDocxAborted } from './abort';
import type {
  DocxDiagnostic,
  DocxImportLimits,
  DocxSourceLocation,
} from './types';

export const DEFAULT_DOCX_IMPORT_LIMITS: DocxImportLimits = Object.freeze({
  maxComments: 5000,
  maxEntries: 1024,
  maxEntryBytes: 32 * 1024 * 1024,
  maxExpandedBytes: 128 * 1024 * 1024,
  maxInputBytes: 32 * 1024 * 1024,
  maxRelationships: 4096,
  maxRevisions: 2000,
  maxXmlDepth: 128,
  maxXmlNodes: 500_000,
});

export class DocxPackageError extends Error {
  readonly diagnostic: Extract<DocxDiagnostic, { severity: 'error' }>;

  constructor(diagnostic: Extract<DocxDiagnostic, { severity: 'error' }>) {
    super(diagnostic.message);
    this.name = 'DocxPackageError';
    this.diagnostic = diagnostic;
  }
}

export const resolveDocxImportLimits = (
  overrides: Partial<DocxImportLimits> | undefined
): DocxImportLimits => {
  for (const [name, value] of Object.entries(overrides ?? {})) {
    if (!Number.isSafeInteger(value) || Number(value) <= 0) {
      throw new TypeError(`${name} must be a positive safe integer.`);
    }
  }

  return Object.freeze({ ...DEFAULT_DOCX_IMPORT_LIMITS, ...overrides });
};

const limitError = (
  limit: keyof DocxImportLimits,
  maximum: number,
  actual: number
) =>
  new DocxPackageError({
    actual,
    code: 'limit-exceeded',
    limit,
    maximum,
    message: `DOCX exceeds ${limit}.`,
    severity: 'error',
  });

const invalidPackage = (message: string) =>
  new DocxPackageError({
    code: 'invalid-package',
    message,
    severity: 'error',
  });

const assertSafePartName = (entry: Entry) => {
  const filename = entry.directory
    ? entry.filename.slice(0, -1)
    : entry.filename;

  if (
    !filename ||
    filename.includes('\\') ||
    filename.includes('\0') ||
    filename.startsWith('/') ||
    /^[A-Za-z]:/.test(filename) ||
    filename
      .split('/')
      .some((part) => part === '' || part === '.' || part === '..')
  ) {
    throw invalidPackage('DOCX contains an unsafe package part name.');
  }
};

const isXmlPart = (name: string) =>
  name === '[Content_Types].xml' ||
  name.endsWith('.xml') ||
  name.endsWith('.rels');

type DocxXmlDisposition = Readonly<{
  action: 'dropped' | 'replaced' | 'unwrapped';
  feature: string;
  lossy: boolean;
}>;

export type DocxXmlInventoryEntry = DocxXmlDisposition &
  Readonly<{ location: DocxSourceLocation }>;

const WORD_NAMESPACE =
  'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const MAIN_DOCUMENT_DISPOSITIONS = new Map<string, DocxXmlDisposition>([
  [
    'altChunk',
    Object.freeze({ action: 'dropped', feature: 'alt-chunk', lossy: true }),
  ],
  [
    'customXml',
    Object.freeze({ action: 'unwrapped', feature: 'custom-xml', lossy: false }),
  ],
  [
    'fldSimple',
    Object.freeze({ action: 'replaced', feature: 'field', lossy: true }),
  ],
  [
    'instrText',
    Object.freeze({
      action: 'replaced',
      feature: 'field-instruction',
      lossy: true,
    }),
  ],
  [
    'object',
    Object.freeze({
      action: 'replaced',
      feature: 'embedded-object',
      lossy: true,
    }),
  ],
  [
    'sdt',
    Object.freeze({
      action: 'unwrapped',
      feature: 'structured-document-tag',
      lossy: false,
    }),
  ],
  [
    'smartTag',
    Object.freeze({ action: 'unwrapped', feature: 'smart-tag', lossy: false }),
  ],
  [
    'txbxContent',
    Object.freeze({ action: 'dropped', feature: 'text-box', lossy: true }),
  ],
]);

const inspectXml = (
  source: Uint8Array,
  name: string,
  limits: DocxImportLimits,
  counters: { relationships: number; xmlNodes: number },
  inventory: DocxXmlInventoryEntry[],
  roots: Map<string, DocxSourceLocation>
) => {
  let text: string;

  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(source);
  } catch {
    throw invalidPackage('DOCX contains XML that is not valid UTF-8.');
  }

  let depth = 0;
  let parseError: Error | undefined;
  const parser = new SaxesParser({ xmlns: true });
  const frames: Array<
    Readonly<{
      disposition?: DocxXmlDisposition;
      qName: string;
      root: boolean;
      startCodeUnit: number;
    }>
  > = [];

  parser.on('doctype', () => {
    parseError = invalidPackage(
      'DOCX XML must not contain a document type declaration.'
    );
  });
  parser.on('error', () => {
    parseError ??= invalidPackage(`DOCX contains malformed XML in ${name}.`);
  });
  parser.on('opentag', (tag) => {
    depth += 1;
    counters.xmlNodes += 1;
    const qName = tag.name;
    const startCodeUnit = Math.max(
      0,
      text.lastIndexOf('<', Math.max(0, parser.position - 1))
    );
    const disposition =
      name === 'word/document.xml' && tag.uri === WORD_NAMESPACE
        ? MAIN_DOCUMENT_DISPOSITIONS.get(tag.local)
        : undefined;

    frames.push(
      Object.freeze({
        ...(disposition ? { disposition } : {}),
        qName,
        root: depth === 1,
        startCodeUnit,
      })
    );

    if (depth > limits.maxXmlDepth) {
      parseError = limitError('maxXmlDepth', limits.maxXmlDepth, depth);
    }
    if (counters.xmlNodes > limits.maxXmlNodes) {
      parseError = limitError(
        'maxXmlNodes',
        limits.maxXmlNodes,
        counters.xmlNodes
      );
    }
    if (name.endsWith('.rels') && tag.local === 'Relationship') {
      counters.relationships += 1;

      if (counters.relationships > limits.maxRelationships) {
        parseError = limitError(
          'maxRelationships',
          limits.maxRelationships,
          counters.relationships
        );
      }
    }
  });
  parser.on('closetag', () => {
    const frame = frames.pop();

    if (frame) {
      const location = Object.freeze({
        endCodeUnit: parser.position,
        part: name,
        qName: frame.qName,
        startCodeUnit: frame.startCodeUnit,
      });

      if (frame.root) roots.set(name, location);
      if (frame.disposition) {
        inventory.push(Object.freeze({ ...frame.disposition, location }));
      }
    }
    depth -= 1;
  });

  try {
    parser.write(text).close();
  } catch {
    parseError ??= invalidPackage(`DOCX contains malformed XML in ${name}.`);
  }
  if (parseError) throw parseError;
};

export type BoundedDocxPackage = Readonly<{
  entries: ReadonlyMap<string, Uint8Array>;
  source: Blob;
  xmlInventory: readonly DocxXmlInventoryEntry[];
  xmlRoots: ReadonlyMap<string, DocxSourceLocation>;
  toArrayBuffer: (
    replacements?: ReadonlyMap<string, string | Uint8Array>
  ) => Promise<ArrayBuffer>;
}>;

export const readBoundedDocxPackage = async (
  source: ArrayBuffer | Blob,
  limits: DocxImportLimits,
  signal?: AbortSignal,
  abortError?: () => unknown
): Promise<BoundedDocxPackage> => {
  const blob = source instanceof Blob ? source : new Blob([source]);

  if (blob.size > limits.maxInputBytes) {
    throw limitError('maxInputBytes', limits.maxInputBytes, blob.size);
  }
  throwIfDocxAborted(signal, abortError);
  const reader = new ZipReader(new BlobReader(blob), {
    checkCrc32: true,
    checkLocalDirectory: true,
    checkLocalFilename: true,
    checkOverlappingEntry: true,
    filenameValidation: 'strict',
    signal,
    strictness: 'strict',
    useWebWorkers: false,
  });

  try {
    const sourceEntries = await reader.getEntries({
      filenameValidation: 'strict',
      strictness: 'strict',
    });

    throwIfDocxAborted(signal, abortError);

    if (sourceEntries.length > limits.maxEntries) {
      throw limitError('maxEntries', limits.maxEntries, sourceEntries.length);
    }
    let declaredExpandedBytes = 0;

    for (const entry of sourceEntries) {
      throwIfDocxAborted(signal, abortError);
      assertSafePartName(entry);
      if (entry.directory) continue;
      if (entry.encrypted || entry.symlink) {
        throw invalidPackage(
          'DOCX contains an encrypted or linked package part.'
        );
      }
      if (![0, 8].includes(entry.compressionMethod)) {
        throw invalidPackage(
          'DOCX uses an unsupported package compression method.'
        );
      }
      if (
        !Number.isSafeInteger(entry.compressedSize) ||
        entry.compressedSize < 0 ||
        !Number.isSafeInteger(entry.uncompressedSize) ||
        entry.uncompressedSize < 0
      ) {
        throw invalidPackage('DOCX contains an invalid package part size.');
      }
      if (
        entry.compressionMethod === 0 &&
        entry.compressedSize !== entry.uncompressedSize
      ) {
        throw invalidPackage('DOCX stored package part sizes do not match.');
      }
      if (entry.uncompressedSize > limits.maxEntryBytes) {
        throw limitError(
          'maxEntryBytes',
          limits.maxEntryBytes,
          entry.uncompressedSize
        );
      }
      declaredExpandedBytes += entry.uncompressedSize;
      if (declaredExpandedBytes > limits.maxExpandedBytes) {
        throw limitError(
          'maxExpandedBytes',
          limits.maxExpandedBytes,
          declaredExpandedBytes
        );
      }
    }

    const entries = new Map<string, Uint8Array>();
    const counters = { relationships: 0, xmlNodes: 0 };
    const inventory: DocxXmlInventoryEntry[] = [];
    const roots = new Map<string, DocxSourceLocation>();
    let actualExpandedBytes = 0;

    for (const entry of sourceEntries) {
      if (entry.directory) continue;
      throwIfDocxAborted(signal, abortError);
      const value = await entry.getData(new Uint8ArrayWriter(), {
        checkCrc32: true,
        checkLocalDirectory: true,
        checkLocalFilename: true,
        checkOverlappingEntry: true,
        onprogress(index) {
          if (index > limits.maxEntryBytes) {
            throw limitError('maxEntryBytes', limits.maxEntryBytes, index);
          }
          if (actualExpandedBytes + index > limits.maxExpandedBytes) {
            throw limitError(
              'maxExpandedBytes',
              limits.maxExpandedBytes,
              actualExpandedBytes + index
            );
          }
        },
        signal,
        strictness: 'strict',
        useWebWorkers: false,
      });

      throwIfDocxAborted(signal, abortError);

      if (value.byteLength !== entry.uncompressedSize) {
        throw invalidPackage('DOCX package part size does not match metadata.');
      }

      actualExpandedBytes += value.byteLength;
      if (actualExpandedBytes > limits.maxExpandedBytes) {
        throw limitError(
          'maxExpandedBytes',
          limits.maxExpandedBytes,
          actualExpandedBytes
        );
      }
      if (isXmlPart(entry.filename)) {
        inspectXml(value, entry.filename, limits, counters, inventory, roots);
      }
      entries.set(entry.filename, value);
    }

    return Object.freeze({
      entries,
      source: blob.slice(
        0,
        blob.size,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ),
      xmlInventory: Object.freeze(inventory),
      xmlRoots: roots,
      async toArrayBuffer(replacements = new Map()) {
        throwIfDocxAborted(signal, abortError);
        const zip = new JSZip();

        for (const [name, value] of entries) {
          zip.file(name, replacements.get(name) ?? value);
        }

        const result = await zip.generateAsync({
          compression: 'DEFLATE',
          compressionOptions: { level: 6 },
          type: 'arraybuffer',
        });

        throwIfDocxAborted(signal, abortError);

        return result;
      },
    });
  } catch (error) {
    if (signal?.aborted) throwIfDocxAborted(signal, abortError);
    if (error instanceof DocxPackageError) throw error;

    throw invalidPackage('DOCX package structure is invalid.');
  } finally {
    await reader.close().catch(() => undefined);
    throwIfDocxAborted(signal, abortError);
  }
};
