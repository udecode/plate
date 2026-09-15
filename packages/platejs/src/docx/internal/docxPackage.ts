import {
  BlobReader,
  Uint8ArrayWriter,
  ZipReader,
  type Entry,
} from '@zip.js/zip.js';
import JSZip from 'jszip';
import { SaxesParser } from 'saxes';

import type { DocxDiagnostic, DocxImportLimits } from './types';

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

const throwIfAborted = (signal: AbortSignal | undefined) => {
  if (!signal?.aborted) return;
  if (signal.reason !== undefined) throw signal.reason;

  throw new DOMException('The operation was aborted.', 'AbortError');
};

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

const inspectXml = (
  source: Uint8Array,
  name: string,
  limits: DocxImportLimits,
  counters: { relationships: number; xmlNodes: number }
) => {
  let depth = 0;
  let parseError: Error | undefined;
  const parser = new SaxesParser({ xmlns: true });

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
    depth -= 1;
  });

  let text: string;

  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(source);
  } catch {
    throw invalidPackage('DOCX contains XML that is not valid UTF-8.');
  }

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
  toArrayBuffer: (
    replacements?: ReadonlyMap<string, string | Uint8Array>
  ) => Promise<ArrayBuffer>;
}>;

export const readBoundedDocxPackage = async (
  source: ArrayBuffer | Blob,
  limits: DocxImportLimits,
  signal?: AbortSignal
): Promise<BoundedDocxPackage> => {
  const blob = source instanceof Blob ? source : new Blob([source]);

  if (blob.size > limits.maxInputBytes) {
    throw limitError('maxInputBytes', limits.maxInputBytes, blob.size);
  }
  throwIfAborted(signal);
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

    if (sourceEntries.length > limits.maxEntries) {
      throw limitError('maxEntries', limits.maxEntries, sourceEntries.length);
    }
    let declaredExpandedBytes = 0;

    for (const entry of sourceEntries) {
      throwIfAborted(signal);
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
    let actualExpandedBytes = 0;

    for (const entry of sourceEntries) {
      if (entry.directory) continue;
      throwIfAborted(signal);
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
        inspectXml(value, entry.filename, limits, counters);
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
      async toArrayBuffer(replacements = new Map()) {
        throwIfAborted(signal);
        const zip = new JSZip();

        for (const [name, value] of entries) {
          zip.file(name, replacements.get(name) ?? value);
        }

        return zip.generateAsync({
          compression: 'DEFLATE',
          compressionOptions: { level: 6 },
          type: 'arraybuffer',
        });
      },
    });
  } catch (error) {
    if (signal?.aborted) throwIfAborted(signal);
    if (error instanceof DocxPackageError) throw error;

    throw invalidPackage('DOCX package structure is invalid.');
  } finally {
    await reader.close().catch(() => undefined);
  }
};
