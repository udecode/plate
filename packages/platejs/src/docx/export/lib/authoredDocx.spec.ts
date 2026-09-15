import JSZip from 'jszip';
import React from 'react';

import { authored } from '../../../authored';
import {
  createEditor,
  createEditorView,
  definePlugin,
  property,
  schema,
} from '../../../core';
import {
  BaseBoldPlugin,
  BaseHeadingPlugin,
} from '../../../features/basic-nodes';
import { BaseParagraphPlugin } from '../../../lib';
import { EditorStatic, type EditorStaticProps } from '../../../static';
import { importDocx } from '../../import/lib/importDocx';
import { exportToDocx } from './exportToDocx';

describe('authored DOCX', () => {
  it('writes Word revisions and reloads the exact native envelope', async () => {
    let authorId = 'alice';
    const HeadingPlugin = BaseHeadingPlugin.configure({
      component: ({ attributes, children, element }) =>
        React.createElement(`h${element.level}`, attributes, children),
    });
    const editor = createEditor({
      plugins: [
        BaseParagraphPlugin,
        HeadingPlugin,
        BaseBoldPlugin,
        authored({ authorId: () => authorId }),
      ],
      initialValue: [{ children: [{ text: 'ABCDE' }], type: 'paragraph' }],
    });
    const view = createEditorView(editor, {
      authored: { intent: 'propose', projection: 'markup' },
    });

    view.update.text.insert('XY', {
      at: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
    });
    authorId = 'bob';
    view.update.nodes.set({ bold: true }, { at: [0, 0] });
    authorId = 'carol';
    view.update.nodes.set({ level: 1, type: 'heading' }, { at: [0] });

    const result = await exportToDocx(editor, {
      editorPlugins: [BaseParagraphPlugin, HeadingPlugin, BaseBoldPlugin],
      projection: 'review',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const documentXml = await zip.file('word/document.xml')!.async('string');
    const envelope = await zip.file('editor/authored.json')!.async('string');
    const contentTypes = await zip.file('[Content_Types].xml')!.async('string');
    expect(documentXml).toContain('<w:ins');
    expect(documentXml).toContain('<w:del');
    expect(documentXml).toContain('<w:delText');
    expect(documentXml).toContain('<w:rPrChange');
    expect(documentXml).toContain('<w:pPrChange');
    expect(documentXml).toContain('w:author="alice"');
    expect(JSON.parse(envelope).document).toEqual(editor.read.value());
    expect(JSON.parse(envelope).version).toBe(1);
    expect(JSON.parse(envelope).parts.length).toBeGreaterThan(1);
    expect(contentTypes).toContain(
      'PartName="/editor/authored.json" ContentType="application/vnd.editor.authored+json"'
    );
    expect(result.diagnostics).toEqual([]);

    const imported = await importDocx(editor, await result.blob.arrayBuffer());

    expect(imported.ok).toBe(true);
    if (!imported.ok) return;
    expect(imported.document).toEqual(editor.read.value());
    expect(
      imported.diagnostics.some(
        (diagnostic) => diagnostic.code === 'native-data-ignored'
      )
    ).toBe(false);

    const editedZip = await JSZip.loadAsync(await result.blob.arrayBuffer());

    editedZip.file('word/document.xml', documentXml.replace('>XY<', '>ZZ<'));
    const edited = await importDocx(
      editor,
      await editedZip.generateAsync({ type: 'arraybuffer' })
    );

    expect(edited.ok).toBe(true);
    if (!edited.ok) return;
    expect(edited.document).not.toEqual(editor.read.value());
    expect(edited.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'native-data-ignored',
        reason: 'digest-mismatch',
      })
    );

    zip.file('editor/authored.json', 'invalid');
    const invalid = await importDocx(
      editor,
      await zip.generateAsync({ type: 'arraybuffer' })
    );

    expect(invalid.ok).toBe(true);
    if (!invalid.ok) return;
    expect(invalid.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'native-data-ignored',
        reason: 'invalid',
      })
    );
    zip.remove('editor/authored.json');
    const externalBuffer = await zip.generateAsync({ type: 'arraybuffer' });
    const external = await importDocx(editor, externalBuffer);

    expect(external.ok).toBe(true);
    if (!external.ok) return;
    const restored = createEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseHeadingPlugin,
        BaseBoldPlugin,
        authored({ authorId: 'reader' }),
      ],
      initialValue: external.document,
    });
    const restoredChanges = restored.read.authored.changes().items;

    expect(restored.read.children()).toEqual([
      { children: [{ text: 'ABCDE' }], type: 'paragraph' },
    ]);
    expect(
      restoredChanges.map(({ authorId: changeAuthorId, id }) => ({
        authorId: changeAuthorId,
        id,
      }))
    ).toEqual([
      { authorId: 'alice', id: '1' },
      { authorId: 'bob', id: '2' },
      { authorId: 'carol', id: '3' },
    ]);
    expect(
      createEditorView(restored, {
        authored: { intent: 'propose', projection: 'proposed' },
      }).read.children()
    ).toEqual([
      { children: [{ bold: true, text: 'AXYDE' }], level: 1, type: 'heading' },
    ]);
    expect(external.diagnostics).toEqual([]);

    const unsupportedXml = documentXml.replace(
      '</w:body>',
      '<w:customChange w:id="99"/></w:body>'
    );

    zip.file('word/document.xml', unsupportedXml);
    const unsupported = await importDocx(
      editor,
      await zip.generateAsync({ type: 'arraybuffer' })
    );

    expect(unsupported.ok).toBe(true);
    if (!unsupported.ok) return;
    expect(unsupported.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'unsupported-content',
        feature: 'tracked-revision',
      })
    );
  });

  it('uses the pre-await snapshot for Word XML and the native envelope', async () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, authored({ authorId: 'alice' })],
      initialValue: [{ children: [{ text: 'Base' }], type: 'paragraph' }],
    });
    const view = createEditorView(editor, {
      authored: { intent: 'propose', projection: 'proposed' },
    });

    view.update.text.insert(' draft', { at: { offset: 4, path: [0, 0] } });
    const captured = structuredClone(editor.read.value());
    let mutated = false;
    const MutatingStatic = (props: EditorStaticProps) => {
      if (!mutated) {
        mutated = true;
        view.update.text.insert(' late', {
          at: { offset: 10, path: [0, 0] },
        });
      }

      return React.createElement(EditorStatic, props);
    };
    const result = await exportToDocx(editor, {
      editorStaticComponent: MutatingStatic,
      projection: 'review',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const documentXml = await zip.file('word/document.xml')!.async('string');
    const envelope = JSON.parse(
      await zip.file('editor/authored.json')!.async('string')
    );

    expect(documentXml).toContain(' draft');
    expect(documentXml).not.toContain(' late');
    expect(envelope.document).toEqual(captured);
    expect(editor.read.value()).not.toEqual(captured);
  });

  it('warns when an explicit projection drops pending review data', async () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, authored({ authorId: 'alice' })],
      initialValue: [{ children: [{ text: 'Base' }], type: 'paragraph' }],
    });
    const view = createEditorView(editor, {
      authored: { intent: 'propose', projection: 'proposed' },
    });

    view.update.text.insert(' draft', {
      at: { offset: 4, path: [0, 0] },
    });
    const result = await exportToDocx(editor, {
      projection: 'accepted',
    });

    expect(result.ok).toBe(true);
    expect(result.diagnostics[0]?.code).toBe('lossy-content');
  });

  it('projects proposed comment ranges into accepted and review output', async () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, authored({ authorId: 'alice' })],
      initialValue: [{ children: [{ text: 'ABCDE' }], type: 'paragraph' }],
    });
    const view = createEditorView(editor, {
      authored: { intent: 'propose', projection: 'proposed' },
    });

    view.update.text.insert('XYZ', {
      at: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
    });
    const comment = (id: string, anchor: number, focus: number) => ({
      author: { name: 'Alice' },
      body: [{ children: [{ text: id }], type: 'paragraph' }],
      createdAt: null,
      durableId: null,
      id,
      parentId: null,
      resolved: null,
      target: {
        range: {
          anchor: { offset: anchor, path: [0, 0] },
          focus: { offset: focus, path: [0, 0] },
        },
      },
    });
    const review = await exportToDocx(editor, {
      comments: [comment('inserted', 1, 4)],
      editorPlugins: [BaseParagraphPlugin],
      projection: 'review',
    });

    expect(review.ok).toBe(true);
    if (!review.ok) return;
    const reviewImport = await importDocx(
      editor,
      await review.blob.arrayBuffer()
    );

    expect(reviewImport.ok).toBe(true);
    if (!reviewImport.ok) return;
    expect(reviewImport.comments[0]?.target).toEqual({
      range: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
    });

    const accepted = await exportToDocx(editor, {
      comments: [comment('unchanged', 4, 6)],
      editorPlugins: [BaseParagraphPlugin],
      projection: 'accepted',
    });

    expect(accepted.ok).toBe(true);
    if (!accepted.ok) return;
    const acceptedImport = await importDocx(
      editor,
      await accepted.blob.arrayBuffer()
    );

    expect(acceptedImport.ok).toBe(true);
    if (!acceptedImport.ok) return;
    expect(acceptedImport.comments[0]?.target).toEqual({
      range: {
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
    });
  });

  it('uses configured serializers for custom review content', async () => {
    const CustomPlugin = definePlugin('custom', {
      schema: {
        element: schema.element.textBlock(),
      },
    });
    const CustomMarkPlugin = definePlugin('customMark', {
      schema: {
        mark: {
          key: 'customMark',
          property: property.string(),
        },
      },
    });
    const editor = createEditor({
      plugins: [
        CustomPlugin,
        CustomMarkPlugin,
        authored({ authorId: 'alice' }),
      ],
      initialValue: [
        {
          children: [{ customMark: 'domain', text: 'Base' }],
          type: 'custom',
        },
      ],
    });
    const view = createEditorView(editor, {
      authored: { intent: 'propose', projection: 'proposed' },
    });

    view.update.text.insert(' draft', {
      at: { offset: 4, path: [0, 0] },
    });
    const result = await exportToDocx(editor, {
      editorPlugins: [CustomPlugin, CustomMarkPlugin],
      projection: 'review',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());

    const documentXml = await zip.file('word/document.xml')!.async('string');

    expect(documentXml).toContain('Base');
    expect(documentXml).toContain(' draft');
    expect(
      JSON.parse(await zip.file('editor/authored.json')!.async('string'))
        .document
    ).toEqual(editor.read.value());
  });
});
