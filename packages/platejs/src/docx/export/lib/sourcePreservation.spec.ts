import JSZip from 'jszip';
import React from 'react';

import { createEditor } from '../../../core';
import { EditorStatic, type EditorStaticProps } from '../../../static';
import { importDocx } from '../../import/lib/importDocx';
import { exportToDocx } from './exportToDocx';

const WORD_NAMESPACE =
  'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const OFFICE_RELATIONSHIPS_NAMESPACE =
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const PACKAGE_RELATIONSHIPS_NAMESPACE =
  'http://schemas.openxmlformats.org/package/2006/relationships';

const bytes = async (blob: Blob) => new Uint8Array(await blob.arrayBuffer());

const createGeneratedSource = async () => {
  const editor = createEditor({
    initialValue: [
      { children: [{ text: 'Original body' }], type: 'paragraph' },
    ],
  });
  const result = await exportToDocx(editor, { projection: 'proposed' });

  if (!result.ok) throw new Error('Fixture DOCX generation failed.');

  return result.blob;
};

const addSourceParts = async (blob: Blob, multipleSections = false) => {
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  const documentXml = await zip.file('word/document.xml')!.async('string');
  const documentRelationships = await zip
    .file('word/_rels/document.xml.rels')!
    .async('string');
  const rootRelationships = await zip.file('_rels/.rels')!.async('string');
  const contentTypes = await zip.file('[Content_Types].xml')!.async('string');
  const headerReference =
    '<w:headerReference w:type="default" r:id="rIdRetainedHeader"/>';
  const section = multipleSections
    ? `<w:sectPr>${headerReference}</w:sectPr>`
    : '';

  zip.file(
    'word/document.xml',
    documentXml
      .replace('<w:sectPr>', `<w:sectPr>${headerReference}`)
      .replace('</w:body>', `<!-- SOURCE_BODY_SENTINEL -->${section}</w:body>`)
  );
  zip.file(
    'word/_rels/document.xml.rels',
    documentRelationships.replace(
      '</Relationships>',
      `<Relationship Id="rIdRetainedHeader" Type="${OFFICE_RELATIONSHIPS_NAMESPACE}/header" Target="header1.xml"/></Relationships>`
    )
  );
  zip.file(
    'word/header1.xml',
    `<w:hdr xmlns:w="${WORD_NAMESPACE}" xmlns:r="${OFFICE_RELATIONSHIPS_NAMESPACE}"><w:p><w:r><w:t>Retained header</w:t></w:r><w:drawing r:id="rIdHeaderImage"/></w:p></w:hdr>`
  );
  zip.file(
    'word/_rels/header1.xml.rels',
    `<Relationships xmlns="${PACKAGE_RELATIONSHIPS_NAMESPACE}"><Relationship Id="rIdHeaderImage" Type="${OFFICE_RELATIONSHIPS_NAMESPACE}/image" Target="media/header.png"/></Relationships>`
  );
  zip.file('word/media/header.png', new Uint8Array([1, 2, 3, 4]));
  zip.file('custom/retained.bin', new Uint8Array([5, 6, 7]));
  zip.file('custom/orphan.bin', new Uint8Array([8, 9]));
  zip.file('word/vbaProject.bin', new Uint8Array([10]));
  zip.file(
    '_xmlsignatures/sig1.xml',
    '<Signature xmlns="http://www.w3.org/2000/09/xmldsig#"/>'
  );
  zip.file(
    '_rels/.rels',
    rootRelationships.replace(
      '</Relationships>',
      [
        '<Relationship Id="rIdRetainedRoot" Type="urn:plate:test:retained" Target="custom/retained.bin"/>',
        `<Relationship Id="rIdActive" Type="${OFFICE_RELATIONSHIPS_NAMESPACE}/vbaProject" Target="word/vbaProject.bin"/>`,
        '<Relationship Id="rIdSignature" Type="http://schemas.openxmlformats.org/package/2006/relationships/digital-signature/signature" Target="_xmlsignatures/sig1.xml"/>',
        '<Relationship Id="rIdConflict" Type="urn:plate:test:conflict" Target="word/styles.xml"/>',
        '<Relationship Id="rIdExternal" Type="urn:plate:test:external" Target="https://example.com/data" TargetMode="External"/>',
        '</Relationships>',
      ].join('')
    )
  );
  zip.file(
    '[Content_Types].xml',
    contentTypes.replace(
      '</Types>',
      [
        '<Default Extension="bin" ContentType="application/octet-stream"/>',
        '<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>',
        '<Override PartName="/word/vbaProject.bin" ContentType="application/vnd.ms-office.vbaProject"/>',
        '<Override PartName="/_xmlsignatures/sig1.xml" ContentType="application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml"/>',
        '</Types>',
      ].join('')
    )
  );

  return zip.generateAsync({ type: 'blob' });
};

const importRetained = async (blob: Blob) => {
  const result = await importDocx(createEditor(), blob, { retainSource: true });

  if (!result.ok) throw new Error('Fixture DOCX import failed.');

  return result;
};

describe('retained DOCX source', () => {
  it('returns exact source bytes without invoking the renderer', async () => {
    const sourceBlob = await addSourceParts(await createGeneratedSource());
    const imported = await importRetained(sourceBlob);
    const editor = createEditor({ initialValue: imported.document });
    const BrokenStatic = () => {
      throw new Error('exact export rendered');
    };
    const result = await exportToDocx(editor, {
      editorStaticComponent: BrokenStatic,
      projection: 'review',
      source: imported.source,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(await bytes(result.blob)).toEqual(await bytes(sourceBlob));
    expect(result.diagnostics).toEqual([]);
  });

  it('rewrites the body and preserves only safe closed source graphs', async () => {
    const sourceBlob = await addSourceParts(await createGeneratedSource());
    const imported = await importRetained(sourceBlob);
    const editor = createEditor({ initialValue: imported.document });

    editor.update.text.insert(' edited', {
      at: { offset: 'Original body'.length, path: [0, 0] },
    });
    const result = await exportToDocx(editor, {
      projection: 'review',
      source: imported.source,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const documentXml = await zip.file('word/document.xml')!.async('string');
    const documentRelationships = await zip
      .file('word/_rels/document.xml.rels')!
      .async('string');
    const rootRelationships = await zip.file('_rels/.rels')!.async('string');

    expect(documentXml).toContain('Original body edited');
    expect(documentXml).toContain('headerReference');
    expect(documentXml).not.toContain('SOURCE_BODY_SENTINEL');
    expect(documentRelationships).toContain('header1.xml');
    expect(await zip.file('word/header1.xml')!.async('string')).toContain(
      'Retained header'
    );
    expect(
      await zip.file('word/media/header.png')!.async('uint8array')
    ).toEqual(new Uint8Array([1, 2, 3, 4]));
    expect(await zip.file('custom/retained.bin')!.async('uint8array')).toEqual(
      new Uint8Array([5, 6, 7])
    );
    expect(rootRelationships).toContain('custom/retained.bin');
    expect(rootRelationships).not.toContain('vbaProject');
    expect(rootRelationships).not.toContain('example.com');
    expect(zip.file('word/vbaProject.bin')).toBeNull();
    expect(zip.file('_xmlsignatures/sig1.xml')).toBeNull();
    expect(zip.file('custom/orphan.bin')).toBeNull();
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'source-rewritten',
        reason: 'document-changed',
      })
    );
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'source-part-omitted',
        reason: 'active-content',
      })
    );
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'source-part-omitted',
        reason: 'conflict',
      })
    );
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'source-part-omitted',
        reason: 'external-relationship',
      })
    );
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'source-part-omitted',
        part: 'custom/orphan.bin',
        reason: 'unreachable',
      })
    );
    const reopened = await importDocx(
      createEditor(),
      await result.blob.arrayBuffer()
    );

    expect(reopened.ok).toBe(true);
    if (reopened.ok) expect(reopened.document).toEqual(editor.read.value());
  });

  it('omits section-dependent parts for a multi-section source', async () => {
    const sourceBlob = await addSourceParts(
      await createGeneratedSource(),
      true
    );
    const imported = await importRetained(sourceBlob);
    const editor = createEditor({ initialValue: imported.document });

    editor.update.text.insert(' edited', {
      at: { offset: 'Original body'.length, path: [0, 0] },
    });
    const result = await exportToDocx(editor, {
      projection: 'review',
      source: imported.source,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());

    expect(zip.file('word/header1.xml')).toBeNull();
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'source-part-omitted',
        part: 'word/header1.xml',
        reason: 'multiple-sections',
      })
    );
  });

  it('keeps an in-flight lease and diagnoses later disposed reuse', async () => {
    const sourceBlob = await createGeneratedSource();
    const imported = await importRetained(sourceBlob);
    const editor = createEditor({ initialValue: imported.document });
    const DisposingStatic = (props: EditorStaticProps) => {
      imported.source.dispose();

      return React.createElement(EditorStatic, props);
    };
    const inFlight = await exportToDocx(editor, {
      editorStaticComponent: DisposingStatic,
      projection: 'proposed',
      source: imported.source,
    });

    expect(inFlight.ok).toBe(true);
    const later = await exportToDocx(editor, {
      projection: 'review',
      source: imported.source,
    });

    expect(later.ok).toBe(true);
    expect(later.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'source-unavailable',
        reason: 'disposed',
      })
    );
  });

  it('diagnoses schema, option, comment, projection, and forged-source fallbacks', async () => {
    const sourceBlob = await createGeneratedSource();
    const imported = await importRetained(sourceBlob);
    const editor = createEditor({ initialValue: imported.document });
    const withOption = await exportToDocx(editor, {
      projection: 'review',
      source: imported.source,
      title: 'Current title',
    });
    const withComments = await exportToDocx(editor, {
      comments: [
        {
          author: null,
          body: [{ children: [{ text: 'Current note' }], type: 'paragraph' }],
          createdAt: null,
          durableId: null,
          id: 'current-comment',
          parentId: null,
          resolved: null,
          target: null,
        },
      ],
      projection: 'review',
      source: imported.source,
    });
    const projected = await exportToDocx(editor, {
      projection: 'proposed',
      source: imported.source,
    });
    const anotherSchema = createEditor({
      initialValue: imported.document,
      schema: { id: 'another-document', version: 1 },
    });
    const mismatched = await exportToDocx(anotherSchema, {
      projection: 'review',
      source: imported.source,
    });
    const forged = await exportToDocx(editor, {
      projection: 'review',
      source: {} as typeof imported.source,
    });

    expect(withOption.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'source-rewritten',
        reason: 'output-options-changed',
      })
    );
    expect(withComments.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'source-rewritten',
        reason: 'comments-changed',
      })
    );
    expect(projected.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'source-rewritten',
        reason: 'projection-changed',
      })
    );
    expect(mismatched.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'source-unavailable',
        reason: 'schema-mismatch',
      })
    );
    expect(forged.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'source-unavailable',
        reason: 'invalid',
      })
    );
  });
});
