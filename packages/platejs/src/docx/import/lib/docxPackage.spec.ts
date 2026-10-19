import { BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';
import JSZip from 'jszip';

import {
  DEFAULT_DOCX_IMPORT_LIMITS,
  DocxPackageError,
  readBoundedDocxPackage,
} from './docxPackage';

const encodeZip = async (
  entries: Readonly<Record<string, string>>,
  compression: 'DEFLATE' | 'STORE' = 'DEFLATE'
) => {
  const zip = new JSZip();

  for (const [name, value] of Object.entries(entries)) zip.file(name, value);

  return zip.generateAsync({ compression, type: 'arraybuffer' });
};

const read = (
  source: ArrayBuffer,
  limits: Partial<typeof DEFAULT_DOCX_IMPORT_LIMITS> = {},
  signal?: AbortSignal
) =>
  readBoundedDocxPackage(
    source,
    { ...DEFAULT_DOCX_IMPORT_LIMITS, ...limits },
    signal
  );

const replaceAscii = (source: ArrayBuffer, from: string, to: string) => {
  if (from.length !== to.length) {
    throw new Error('Replacement length mismatch.');
  }
  const bytes = new Uint8Array(source.slice(0));
  const before = new TextEncoder().encode(from);
  const after = new TextEncoder().encode(to);
  let replacements = 0;

  for (let index = 0; index <= bytes.length - before.length; index++) {
    if (!before.every((value, offset) => bytes[index + offset] === value)) {
      continue;
    }
    bytes.set(after, index);
    replacements += 1;
    index += before.length - 1;
  }
  if (replacements === 0) throw new Error('ZIP fixture token was not found.');

  return bytes.buffer;
};

const signatureOffsets = (source: ArrayBuffer, signature: number) => {
  const bytes = new Uint8Array(source);
  const offsets: number[] = [];

  for (let index = 0; index <= bytes.length - 4; index++) {
    if (
      bytes[index] === (signature & 0xff) &&
      bytes[index + 1] === ((signature >>> 8) & 0xff) &&
      bytes[index + 2] === ((signature >>> 16) & 0xff) &&
      bytes[index + 3] === ((signature >>> 24) & 0xff)
    ) {
      offsets.push(index);
    }
  }

  return offsets;
};

const expectDiagnostic = async (
  operation: Promise<unknown>,
  expected: Partial<DocxPackageError['diagnostic']>
) => {
  try {
    await operation;
    throw new Error('Expected a DOCX package failure.');
  } catch (error) {
    expect(error).toBeInstanceOf(DocxPackageError);
    expect((error as DocxPackageError).diagnostic).toEqual(
      expect.objectContaining(expected)
    );
  }
};

describe('bounded DOCX package reader', () => {
  it.each([
    ['maxEntries', { maxEntries: 1 }],
    ['maxEntryBytes', { maxEntryBytes: 8 }],
    ['maxExpandedBytes', { maxExpandedBytes: 12 }],
  ] as const)('enforces %s before conversion', async (limit, limits) => {
    const source = await encodeZip({
      'word/document.xml': '<document>content</document>',
      'word/styles.xml': '<styles/>',
    });

    await expectDiagnostic(read(source, limits), {
      code: 'limit-exceeded',
      limit,
    });
  });

  it('rejects DTDs and bounds XML depth and nodes', async () => {
    const dtd = await encodeZip({
      'word/document.xml': '<!DOCTYPE x><x/>',
    });
    const nested = await encodeZip({
      'word/document.xml': '<a><b><c/></b></a>',
    });

    await expectDiagnostic(read(dtd), { code: 'invalid-package' });
    await expectDiagnostic(read(nested, { maxXmlDepth: 2 }), {
      code: 'limit-exceeded',
      limit: 'maxXmlDepth',
    });
    await expectDiagnostic(read(nested, { maxXmlNodes: 2 }), {
      code: 'limit-exceeded',
      limit: 'maxXmlNodes',
    });
  });

  it('bounds relationship elements across relationship parts', async () => {
    const source = await encodeZip({
      '_rels/.rels': [
        '<Relationships>',
        '<Relationship Id="one"/>',
        '<Relationship Id="two"/>',
        '</Relationships>',
      ].join(''),
    });

    await expectDiagnostic(read(source, { maxRelationships: 1 }), {
      code: 'limit-exceeded',
      limit: 'maxRelationships',
    });
  });

  it('rejects unsafe and duplicate package part names', async () => {
    const unsafe = replaceAscii(
      await encodeZip({ 'aa/xx': 'unsafe' }, 'STORE'),
      'aa/xx',
      '../xx'
    );
    const duplicate = replaceAscii(
      await encodeZip({ 'word/a.xml': '<a/>', 'word/b.xml': '<b/>' }, 'STORE'),
      'word/b.xml',
      'word/a.xml'
    );

    await expectDiagnostic(read(unsafe), { code: 'invalid-package' });
    await expectDiagnostic(read(duplicate), { code: 'invalid-package' });
  });

  it('reads ZIP64 metadata and rejects overlapping local entries', async () => {
    const blobWriter = new BlobWriter('application/zip');
    const zip64Writer = new ZipWriter(blobWriter, {
      useWebWorkers: false,
      zip64: true,
    });

    await zip64Writer.add('word/document.xml', new TextReader('<document/>'));
    await zip64Writer.close(undefined, { zip64: true });
    const zip64Blob = await blobWriter.getData();
    const zip64 = await zip64Blob.arrayBuffer();
    const zip64Package = await read(zip64);

    expect(zip64Package.entries.has('word/document.xml')).toBe(true);

    const regular = await encodeZip(
      { 'a.xml': '<a/>', 'b.xml': '<b/>' },
      'STORE'
    );
    const localHeaders = signatureOffsets(regular, 0x04_03_4b_50);
    const centralHeaders = signatureOffsets(regular, 0x02_01_4b_50);

    expect(localHeaders).toHaveLength(2);
    expect(centralHeaders).toHaveLength(2);
    const overlapping = new Uint8Array(regular.slice(0));
    const view = new DataView(overlapping.buffer);

    view.setUint32(centralHeaders[1] + 42, localHeaders[0] + 1, true);

    await expectDiagnostic(read(overlapping.buffer), {
      code: 'invalid-package',
    });
  });

  it('rejects central sizes that disagree with local metadata', async () => {
    const source = await encodeZip(
      { 'word/document.xml': '<document>Hello</document>' },
      'STORE'
    );
    const centralHeader = signatureOffsets(source, 0x02_01_4b_50).at(-1)!;
    const localHeader = signatureOffsets(source, 0x04_03_4b_50).at(-1)!;
    const lying = new Uint8Array(source.slice(0));

    new DataView(lying.buffer).setUint32(centralHeader + 24, 1, true);
    new DataView(lying.buffer).setUint32(localHeader + 22, 1, true);

    await expectDiagnostic(read(lying.buffer), { code: 'invalid-package' });
  });

  it('rejects CRC corruption and encrypted entry flags', async () => {
    const stored = await encodeZip(
      { 'word/document.xml': '<document>Hello</document>' },
      'STORE'
    );
    const corrupt = replaceAscii(stored, 'Hello', 'Jello');
    const encrypted = new Uint8Array(stored.slice(0));

    for (let index = 0; index < encrypted.length - 10; index++) {
      const signature =
        encrypted[index] |
        (encrypted[index + 1] << 8) |
        (encrypted[index + 2] << 16) |
        (encrypted[index + 3] << 24);

      if (signature === 0x04_03_4b_50) encrypted[index + 6] |= 1;
      if (signature === 0x02_01_4b_50) encrypted[index + 8] |= 1;
    }

    await expectDiagnostic(read(corrupt), { code: 'invalid-package' });
    await expectDiagnostic(read(encrypted.buffer), {
      code: 'invalid-package',
    });
  });

  it('rejects immediately when already aborted', async () => {
    const source = await encodeZip({ 'word/document.xml': '<document/>' });
    const controller = new AbortController();
    const reason = new DOMException('Stopped', 'AbortError');

    controller.abort(reason);

    await expect(read(source, {}, controller.signal)).rejects.toBe(reason);
  });
});
