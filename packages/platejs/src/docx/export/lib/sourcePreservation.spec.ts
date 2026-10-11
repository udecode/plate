import JSZip from 'jszip';
import React from 'react';

import { createEditor } from '../../../core';
import { EditorStatic, type EditorStaticProps } from '../../../static';
import { importDocx } from '../../import/lib/importDocx';
import { exportDocx } from './exportDocx';

const WORD_NAMESPACE =
  'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const OFFICE_RELATIONSHIPS_NAMESPACE =
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const PACKAGE_RELATIONSHIPS_NAMESPACE =
  'http://schemas.openxmlformats.org/package/2006/relationships';
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1]);

const bytes = async (blob: Blob) => new Uint8Array(await blob.arrayBuffer());

const createGeneratedSource = async () => {
  const editor = createEditor({
    initialValue: [
      { children: [{ text: 'Original body' }], type: 'paragraph' },
    ],
  });
  const result = await exportDocx(editor, { projection: 'proposed' });

  if (!result.ok) throw new Error('Fixture DOCX generation failed.');

  return result.blob;
};

const readText = (zip: JSZip, name: string) => zip.file(name)!.async('string');

const editText = async (
  zip: JSZip,
  name: string,
  edit: (source: string) => string
) => {
  const source = await readText(zip, name);

  zip.file(name, edit(source));
};

// A single-section header with its own raster image, as Word writes one.
const addPassiveHeader = async (blob: Blob, multipleSections = false) => {
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  const headerReference =
    '<w:headerReference w:type="default" r:id="rIdRetainedHeader"/>';
  const section = multipleSections
    ? `<w:sectPr>${headerReference}</w:sectPr>`
    : '';

  await editText(zip, 'word/document.xml', (source) =>
    source
      .replace('<w:sectPr>', `<w:sectPr>${headerReference}`)
      .replace('</w:body>', `<!-- SOURCE_BODY_SENTINEL -->${section}</w:body>`)
  );
  await editText(zip, 'word/_rels/document.xml.rels', (source) =>
    source.replace(
      '</Relationships>',
      `<Relationship Id="rIdRetainedHeader" Type="${OFFICE_RELATIONSHIPS_NAMESPACE}/header" Target="header1.xml"/></Relationships>`
    )
  );
  zip.file(
    'word/header1.xml',
    `<w:hdr xmlns:w="${WORD_NAMESPACE}" xmlns:r="${OFFICE_RELATIONSHIPS_NAMESPACE}"><w:p><w:r><w:t>Retained header</w:t></w:r><w:fldSimple w:instr="PAGE"><w:r/></w:fldSimple></w:p></w:hdr>`
  );
  zip.file(
    'word/_rels/header1.xml.rels',
    `<Relationships xmlns="${PACKAGE_RELATIONSHIPS_NAMESPACE}"><Relationship Id="rIdHeaderImage" Type="${OFFICE_RELATIONSHIPS_NAMESPACE}/image" Target="media/header.png"/></Relationships>`
  );
  zip.file('word/media/header.png', PNG);
  await editText(zip, '[Content_Types].xml', (source) =>
    source.replace(
      '</Types>',
      '<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/></Types>'
    )
  );

  return zip.generateAsync({ type: 'blob' });
};

type HostileVariant = Readonly<{
  part: string;
  apply: (zip: JSZip) => Promise<void>;
}>;

const addRootRelationship = (zip: JSZip, relationship: string) =>
  editText(zip, '_rels/.rels', (source) =>
    source.replace('</Relationships>', `${relationship}</Relationships>`)
  );

const HOSTILE_VARIANTS: Readonly<Record<string, HostileVariant>> = {
  'a macro project': {
    apply: async (zip) => {
      zip.file('word/vbaProject.bin', new Uint8Array([10]));
      await addRootRelationship(
        zip,
        `<Relationship Id="rIdActive" Type="${OFFICE_RELATIONSHIPS_NAMESPACE}/vbaProject" Target="word/vbaProject.bin"/>`
      );
    },
    part: '_rels/.rels',
  },
  'a digital signature': {
    apply: async (zip) => {
      zip.file(
        '_xmlsignatures/sig1.xml',
        '<Signature xmlns="http://www.w3.org/2000/09/xmldsig#"/>'
      );
      await addRootRelationship(
        zip,
        '<Relationship Id="rIdSignature" Type="http://schemas.openxmlformats.org/package/2006/relationships/digital-signature/signature" Target="_xmlsignatures/sig1.xml"/>'
      );
    },
    part: '_rels/.rels',
  },
  'an external relationship': {
    apply: (zip) =>
      addRootRelationship(
        zip,
        '<Relationship Id="rIdExternal" Type="urn:plate:test:external" Target="https://example.com/data" TargetMode="External"/>'
      ),
    part: '_rels/.rels',
  },
  'a script hyperlink': {
    apply: async (zip) => {
      await editText(zip, 'word/document.xml', (source) =>
        source.replace(
          '</w:body>',
          '<w:p><w:hyperlink r:id="rIdScript"><w:r><w:t>LABEL</w:t></w:r></w:hyperlink></w:p></w:body>'
        )
      );
      await editText(zip, 'word/_rels/document.xml.rels', (source) =>
        source.replace(
          '</Relationships>',
          `<Relationship Id="rIdScript" Type="${OFFICE_RELATIONSHIPS_NAMESPACE}/hyperlink" Target="javascript:alert(1)" TargetMode="External"/></Relationships>`
        )
      );
    },
    part: 'word/_rels/document.xml.rels',
  },
  'an unreferenced part': {
    apply: async (zip) => {
      zip.file('custom/orphan.bin', new Uint8Array([8, 9]));
    },
    part: 'custom/orphan.bin',
  },
  'an external picture field': {
    apply: async (zip) => {
      await editText(zip, 'word/document.xml', (source) =>
        source.replace(
          '</w:body>',
          '<w:p><w:fldSimple w:instr=" INCLUDEPICTURE &quot;https://example.com/a.png&quot; "/></w:p></w:body>'
        )
      );
    },
    part: 'word/document.xml',
  },
};

const withHostileVariant = async (blob: Blob, variant: HostileVariant) => {
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());

  await variant.apply(zip);

  return zip.generateAsync({ type: 'blob' });
};

const importRetained = async (blob: Blob) => {
  const result = await importDocx(blob, {
    lossPolicy: 'allow',
    plugins: [],
    retainSource: true,
  });

  if (!result.ok) throw new Error('Fixture DOCX import failed.');

  return result;
};

const importEligible = async (blob: Blob) => {
  const result = await importRetained(blob);

  if (!result.source) throw new Error('Fixture DOCX source is ineligible.');

  return { ...result, source: result.source };
};

describe('retained DOCX source', () => {
  it('returns exact source bytes without invoking the renderer', async () => {
    const sourceBlob = await addPassiveHeader(await createGeneratedSource());
    const imported = await importEligible(sourceBlob);
    const editor = createEditor({ initialValue: imported.document });
    const BrokenStatic = () => {
      throw new Error('exact export rendered');
    };
    const result = await exportDocx(editor, {
      component: BrokenStatic,
      projection: 'review',
      source: imported.source,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(await bytes(result.blob)).toEqual(await bytes(sourceBlob));
    expect(result.diagnostics).toEqual([]);
  });

  it('rebuilds an unchanged source when the caller passes a stylesheet', async () => {
    const sourceBlob = await addPassiveHeader(await createGeneratedSource());
    const imported = await importEligible(sourceBlob);
    const editor = createEditor({ initialValue: imported.document });
    const result = await exportDocx(editor, {
      projection: 'review',
      source: imported.source,
      stylesheet: 'span { color: #123456; }',
    });

    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());

    expect(await readText(zip, 'word/document.xml')).toMatch(
      /<w:color w:val="123456"\/>/i
    );
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'source-rewritten',
        reason: 'output-options-changed',
      })
    );
  });

  it('rebuilds an unchanged source when the caller passes a font family', async () => {
    const sourceBlob = await addPassiveHeader(await createGeneratedSource());
    const imported = await importEligible(sourceBlob);
    const editor = createEditor({ initialValue: imported.document });
    const result = await exportDocx(editor, {
      fontFamily: 'Arial',
      projection: 'review',
      source: imported.source,
    });

    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
    expect(await bytes(result.blob)).not.toEqual(await bytes(sourceBlob));
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'source-rewritten',
        reason: 'output-options-changed',
      })
    );
  });

  it('keeps safe hyperlinks through exact reuse and the header overlay', async () => {
    const passive = await addPassiveHeader(await createGeneratedSource());
    const zip = await JSZip.loadAsync(await passive.arrayBuffer());

    await editText(zip, 'word/document.xml', (source) =>
      source.replace(
        '</w:body>',
        '<w:p><w:hyperlink r:id="rIdBodyLink"><w:r><w:t>Body link</w:t></w:r></w:hyperlink></w:p></w:body>'
      )
    );
    await editText(zip, 'word/_rels/document.xml.rels', (source) =>
      source.replace(
        '</Relationships>',
        `<Relationship Id="rIdBodyLink" Type="${OFFICE_RELATIONSHIPS_NAMESPACE}/hyperlink" Target="https://example.com/body" TargetMode="External"/></Relationships>`
      )
    );
    await editText(zip, 'word/_rels/header1.xml.rels', (source) =>
      source.replace(
        '</Relationships>',
        `<Relationship Id="rIdHeaderLink" Type="${OFFICE_RELATIONSHIPS_NAMESPACE}/hyperlink" Target="mailto:team@example.com" TargetMode="External"/></Relationships>`
      )
    );
    const sourceBlob = await zip.generateAsync({ type: 'blob' });
    const imported = await importEligible(sourceBlob);
    const editor = createEditor({ initialValue: imported.document });
    const exact = await exportDocx(editor, {
      projection: 'review',
      source: imported.source,
    });

    expect(exact.ok).toBe(true);
    if (!exact.ok) return;
    expect(await bytes(exact.blob)).toEqual(await bytes(sourceBlob));
    editor.update.text.insert(' edited', {
      at: { offset: 'Original body'.length, path: [0, 0] },
    });
    const rewritten = await exportDocx(editor, {
      projection: 'review',
      source: imported.source,
    });

    expect(rewritten.ok).toBe(true);
    if (!rewritten.ok) return;
    const output = await JSZip.loadAsync(await rewritten.blob.arrayBuffer());

    expect(await readText(output, 'word/_rels/header1.xml.rels')).toContain(
      'mailto:team@example.com'
    );
  });

  it('rewrites the body and keeps the passive source header', async () => {
    const sourceBlob = await addPassiveHeader(await createGeneratedSource());
    const imported = await importEligible(sourceBlob);
    const editor = createEditor({ initialValue: imported.document });

    editor.update.text.insert(' edited', {
      at: { offset: 'Original body'.length, path: [0, 0] },
    });
    const result = await exportDocx(editor, {
      projection: 'review',
      source: imported.source,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const documentXml = await readText(zip, 'word/document.xml');

    expect(documentXml).toContain('Original body edited');
    expect(documentXml).toContain('headerReference');
    expect(documentXml).not.toContain('SOURCE_BODY_SENTINEL');
    expect(await readText(zip, 'word/_rels/document.xml.rels')).toContain(
      'header1.xml'
    );
    expect(await readText(zip, 'word/header1.xml')).toContain(
      'Retained header'
    );
    expect(
      await zip.file('word/media/header.png')!.async('uint8array')
    ).toEqual(PNG);
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'source-rewritten',
        reason: 'document-changed',
      })
    );
    const reopened = await importDocx(await result.blob.arrayBuffer(), {
      lossPolicy: 'allow',
      plugins: [],
    });

    expect(reopened.ok).toBe(true);
    if (reopened.ok) expect(reopened.document).toEqual(editor.read.value());
  });

  it('reports the dropped document properties and thumbnail and keeps custom properties when the body changes', async () => {
    const generated = await createGeneratedSource();
    const zip = await JSZip.loadAsync(await generated.arrayBuffer());

    zip.file('docProps/thumbnail.png', PNG);
    zip.file(
      'docProps/app.xml',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Words>2</Words></Properties>'
    );
    zip.file(
      'docProps/app-metadata.xml',
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/custom-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><property fmtid="{D5CDD505-2E9C-101B-9397-08002B2CF9AE}" pid="2" name="Client"><vt:lpwstr>Contoso</vt:lpwstr></property></Properties>'
    );
    await editText(zip, '[Content_Types].xml', (source) =>
      source.replace(
        '</Types>',
        '<Override PartName="/docProps/thumbnail.png" ContentType="image/png"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/><Override PartName="/docProps/app-metadata.xml" ContentType="application/vnd.openxmlformats-officedocument.custom-properties+xml"/></Types>'
      )
    );
    await addRootRelationship(
      zip,
      `<Relationship Id="rIdThumbnail" Type="${PACKAGE_RELATIONSHIPS_NAMESPACE}/metadata/thumbnail" Target="docProps/thumbnail.png"/><Relationship Id="rIdApp" Type="${OFFICE_RELATIONSHIPS_NAMESPACE}/extended-properties" Target="docProps/app.xml"/><Relationship Id="rIdCustom" Type="${OFFICE_RELATIONSHIPS_NAMESPACE}/custom-properties" Target="docProps/app-metadata.xml"/>`
    );
    const imported = await importEligible(
      new Blob([await zip.generateAsync({ type: 'arraybuffer' })])
    );
    const edited = await exportDocx(
      createEditor({
        initialValue: {
          ...imported.document,
          children: [
            { children: [{ text: 'Edited body' }], type: 'paragraph' },
          ],
        },
      }),
      { projection: 'review', source: imported.source }
    );

    expect(edited.ok).toBe(true);
    if (!edited.ok) return;
    const output = await JSZip.loadAsync(await edited.blob.arrayBuffer());

    expect(output.file('docProps/thumbnail.png')).toBeNull();
    expect(output.file('docProps/app.xml')).toBeNull();
    expect(await readText(output, 'docProps/app-metadata.xml')).toContain(
      'Contoso'
    );
    expect(
      edited.diagnostics.filter(({ code }) => code === 'source-part-omitted')
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          part: 'docProps/core.xml',
          reason: 'invalidated',
        }),
        expect.objectContaining({
          part: 'docProps/thumbnail.png',
          reason: 'invalidated',
        }),
        expect.objectContaining({
          part: 'docProps/app.xml',
          reason: 'invalidated',
        }),
      ])
    );
  });

  it('does not report a dropped part that a kept header still carries', async () => {
    const passive = await addPassiveHeader(await createGeneratedSource());
    const zip = await JSZip.loadAsync(await passive.arrayBuffer());

    zip.file('docProps/thumbnail.png', PNG);
    await editText(zip, '[Content_Types].xml', (source) =>
      source.replace(
        '</Types>',
        '<Override PartName="/docProps/thumbnail.png" ContentType="image/png"/></Types>'
      )
    );
    await addRootRelationship(
      zip,
      `<Relationship Id="rIdThumbnail" Type="${PACKAGE_RELATIONSHIPS_NAMESPACE}/metadata/thumbnail" Target="docProps/thumbnail.png"/>`
    );
    await editText(zip, 'word/_rels/header1.xml.rels', (source) =>
      source.replace(
        '</Relationships>',
        `<Relationship Id="rIdHeaderThumbnail" Type="${OFFICE_RELATIONSHIPS_NAMESPACE}/image" Target="../docProps/thumbnail.png"/></Relationships>`
      )
    );
    const imported = await importEligible(
      new Blob([await zip.generateAsync({ type: 'arraybuffer' })])
    );
    const editor = createEditor({ initialValue: imported.document });

    editor.update.text.insert(' edited', {
      at: { offset: 'Original body'.length, path: [0, 0] },
    });
    const edited = await exportDocx(editor, {
      projection: 'review',
      source: imported.source,
    });

    expect(edited.ok).toBe(true);
    if (!edited.ok) return;
    const output = await JSZip.loadAsync(await edited.blob.arrayBuffer());
    const omitted = edited.diagnostics.flatMap((diagnostic) =>
      diagnostic.code === 'source-part-omitted' ? [diagnostic.part] : []
    );

    expect(
      await output.file('docProps/thumbnail.png')?.async('uint8array')
    ).toEqual(PNG);
    expect(omitted).not.toContain('docProps/thumbnail.png');
  });

  it('warns that Plate metadata is omitted from an unchanged export', async () => {
    const sourceBlob = await createGeneratedSource();
    const imported = await importEligible(sourceBlob);
    const editor = createEditor({
      initialValue: { ...imported.document, meta: { reviewer: 'Ada' } },
    });
    const result = await exportDocx(editor, {
      projection: 'review',
      source: imported.source,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(await bytes(result.blob)).toEqual(await bytes(sourceBlob));
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'lossy-content',
        feature: 'document-metadata',
      })
    );
  });

  it('reports the source comments an edited export without comments omits', async () => {
    const commented = await exportDocx(
      createEditor({
        initialValue: [
          { children: [{ text: 'Original body' }], type: 'paragraph' },
        ],
      }),
      {
        comments: [
          {
            author: null,
            body: [{ children: [{ text: 'Source note' }], type: 'paragraph' }],
            createdAt: null,
            durableId: null,
            id: 'source-comment',
            parentId: null,
            resolved: null,
            target: {
              range: {
                anchor: { offset: 0, path: [0, 0] },
                focus: { offset: 8, path: [0, 0] },
              },
            },
          },
        ],
        projection: 'review',
      }
    );

    if (!commented.ok) throw new Error('Fixture DOCX generation failed.');
    const imported = await importEligible(commented.blob);
    const editor = createEditor({ initialValue: imported.document });

    editor.update.text.insert(' edited', {
      at: { offset: 'Original body'.length, path: [0, 0] },
    });
    const edited = await exportDocx(editor, {
      projection: 'review',
      source: imported.source,
    });

    expect(edited.ok).toBe(true);
    if (!edited.ok) return;
    const output = await JSZip.loadAsync(await edited.blob.arrayBuffer());

    expect(output.file('word/comments.xml')).toBeNull();
    expect(
      edited.diagnostics.filter(
        (diagnostic) =>
          diagnostic.code === 'source-part-omitted' &&
          diagnostic.part === 'word/comments.xml'
      )
    ).toEqual([expect.objectContaining({ reason: 'invalidated' })]);
  });

  it.each(Object.entries(HOSTILE_VARIANTS))(
    'retains no source for %s and regenerates the export',
    async (_name, variant) => {
      const sourceBlob = await withHostileVariant(
        await addPassiveHeader(await createGeneratedSource()),
        variant
      );
      const imported = await importRetained(sourceBlob);

      expect(imported.source).toBeNull();
      expect(imported.diagnostics).toContainEqual(
        expect.objectContaining({
          code: 'source-unavailable',
          part: variant.part,
          reason: 'ineligible',
          severity: 'warning',
        })
      );
      const editor = createEditor({ initialValue: imported.document });
      const result = await exportDocx(editor, {
        projection: 'review',
        source: imported.source,
      });

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());

      expect(await bytes(result.blob)).not.toEqual(await bytes(sourceBlob));
      expect(Object.keys(zip.files)).not.toContain('word/vbaProject.bin');
      expect(Object.keys(zip.files)).not.toContain('_xmlsignatures/sig1.xml');
      expect(Object.keys(zip.files)).not.toContain('custom/orphan.bin');
      expect(Object.keys(zip.files)).not.toContain('word/header1.xml');
      expect(await readText(zip, '_rels/.rels')).not.toContain('example.com');
      expect(await readText(zip, 'word/document.xml')).not.toContain(
        'INCLUDEPICTURE'
      );
      expect(await readText(zip, 'word/_rels/document.xml.rels')).not.toContain(
        'javascript:'
      );
      expect(result.diagnostics).toEqual([]);
    }
  );

  it('omits section-dependent parts for a multi-section source', async () => {
    const sourceBlob = await addPassiveHeader(
      await createGeneratedSource(),
      true
    );
    const imported = await importEligible(sourceBlob);
    const editor = createEditor({ initialValue: imported.document });

    editor.update.text.insert(' edited', {
      at: { offset: 'Original body'.length, path: [0, 0] },
    });
    const result = await exportDocx(editor, {
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
    const imported = await importEligible(sourceBlob);
    const editor = createEditor({ initialValue: imported.document });
    const DisposingStatic = (props: EditorStaticProps) => {
      imported.source.dispose();

      return React.createElement(EditorStatic, props);
    };
    const inFlight = await exportDocx(editor, {
      component: DisposingStatic,
      projection: 'proposed',
      source: imported.source,
    });

    expect(inFlight.ok).toBe(true);
    const later = await exportDocx(editor, {
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
    const imported = await importEligible(sourceBlob);
    const editor = createEditor({ initialValue: imported.document });
    const withOption = await exportDocx(editor, {
      projection: 'review',
      source: imported.source,
      title: 'Current title',
    });
    const withComments = await exportDocx(editor, {
      comments: [
        {
          author: null,
          body: [{ children: [{ text: 'Current note' }], type: 'paragraph' }],
          createdAt: null,
          durableId: null,
          id: 'current-comment',
          parentId: null,
          resolved: null,
          target: {
            range: {
              anchor: { offset: 0, path: [0, 0] },
              focus: { offset: 8, path: [0, 0] },
            },
          },
        },
      ],
      projection: 'review',
      source: imported.source,
    });
    const projected = await exportDocx(editor, {
      projection: 'proposed',
      source: imported.source,
    });
    const anotherSchema = createEditor({
      initialValue: imported.document,
      schema: { id: 'another-document', version: 1 },
    });
    const mismatched = await exportDocx(anotherSchema, {
      projection: 'review',
      source: imported.source,
    });
    const forged = await exportDocx(editor, {
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
