import JSZip from 'jszip';
import React from 'react';

import { authored } from '../../../authored';
import {
  createEditor,
  createEditorView,
  definePlugin,
  type EditorCommit,
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
import { exportDocx } from './exportDocx';

describe('authored DOCX', () => {
  it('writes one tracked insertion for contiguous native typing', async () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, authored({ authorId: 'alice' })],
      initialValue: [{ children: [{ text: 'Base' }], type: 'paragraph' }],
    });
    const view = createEditorView(editor, {
      authored: { intent: 'propose', projection: 'markup' },
    });

    view.update.selection.set({ offset: 4, path: [0, 0] });
    for (const character of ' draft') {
      view.update({ tags: 'native-text-input' }, (tx) =>
        tx.text.insert(character)
      );
    }

    const result = await exportDocx(editor, {
      projection: 'review',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const documentXml = await zip.file('word/document.xml')!.async('string');

    expect(documentXml.match(/<w:ins\b/g)).toHaveLength(1);
    expect(documentXml).toContain(' draft');
    expect(zip.file('editor/authored.json')).toBeNull();
  });

  it('writes Word revisions and reloads the exact native envelope', async () => {
    let authorId = 'alice';
    const HeadingPlugin = BaseHeadingPlugin.configure({
      component: ({ attributes, children, element }) =>
        React.createElement(`h${element.level}`, attributes, children),
    });
    const plugins = [
      BaseParagraphPlugin,
      HeadingPlugin,
      BaseBoldPlugin,
      authored({ authorId: () => authorId }),
    ] as const;
    const editor = createEditor({
      plugins,
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

    const result = await exportDocx(editor, {
      nativeState: 'attach',
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

    const imported = await importDocx(await result.blob.arrayBuffer(), {
      authoredTrust: { kind: 'same-application' },
      plugins,
    });

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
      await editedZip.generateAsync({ type: 'arraybuffer' }),
      { authoredTrust: { kind: 'same-application' }, plugins }
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
      await zip.generateAsync({ type: 'arraybuffer' }),
      { authoredTrust: { kind: 'same-application' }, plugins }
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
    const external = await importDocx(externalBuffer, { plugins });

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
      await zip.generateAsync({ type: 'arraybuffer' }),
      { lossPolicy: 'allow', plugins }
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
    const result = await exportDocx(editor, {
      component: MutatingStatic,
      nativeState: 'attach',
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
    const result = await exportDocx(editor, {
      projection: 'accepted',
    });

    expect(result.ok).toBe(true);
    expect(result.diagnostics[0]?.code).toBe('authored-lossy-projection');
  });

  it('refuses review output when authored conflicts cannot become Word revisions', async () => {
    const plugin = authored({ authorId: 'alice' });
    const plugins = [BaseParagraphPlugin, plugin];
    const original = createEditor({
      plugins,
      initialValue: [{ children: [{ text: 'First' }], type: 'paragraph' }],
    });
    let id = '';

    original.update((tx) => {
      id = tx.authored.propose();
      tx.text.insert('!', { at: { offset: 5, path: [0, 0] } });
    });
    const saved = structuredClone(original.read.value());
    const author = createEditor({ plugins, initialValue: saved });
    const reviewer = createEditor({ plugins, initialValue: saved });
    const effects: Array<EditorCommit['effects'][number]> = [];

    for (const peer of [author, reviewer]) {
      peer.subscribeCommit((commit) => {
        effects.push(
          ...commit.effects.filter(
            ({ type }) => type.key === 'authored.operation'
          )
        );
      });
    }
    author.update((tx) => {
      tx.authored.propose({ changeId: id });
      tx.text.insert('x', { at: { offset: 6, path: [0, 0] } });
    });
    reviewer.update.authored.decide({
      action: 'accept',
      selection: reviewer.read.authored.select({ ids: [id] }),
    });
    const merged = createEditor({ plugins, initialValue: saved });

    merged.update((tx) => {
      for (const effect of effects) tx.effects.emit(effect.type, effect.value);
    });

    const review = await exportDocx(merged, { projection: 'review' });
    const accepted = await exportDocx(merged, { projection: 'accepted' });

    expect(review).toEqual({
      diagnostics: [
        expect.objectContaining({
          code: 'authored-conflict',
          count: 1,
          severity: 'error',
        }),
      ],
      ok: false,
    });
    expect(accepted.ok).toBe(true);
    expect(accepted.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'authored-conflict',
        severity: 'warning',
      })
    );
  });

  it('projects proposed comment ranges into accepted and review output', async () => {
    const plugins = [
      BaseParagraphPlugin,
      authored({ authorId: 'alice' }),
    ] as const;
    const editor = createEditor({
      plugins,
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
    const review = await exportDocx(editor, {
      comments: [comment('inserted', 1, 4)],
      projection: 'review',
    });

    expect(review.ok).toBe(true);
    if (!review.ok) return;
    const reviewImport = await importDocx(await review.blob.arrayBuffer(), {
      lossPolicy: 'allow',
      plugins,
    });

    expect(reviewImport.ok).toBe(true);
    if (!reviewImport.ok) return;
    expect(reviewImport.comments[0]?.target).toEqual({
      range: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
    });

    const accepted = await exportDocx(editor, {
      comments: [comment('unchanged', 4, 6)],
      projection: 'accepted',
    });

    expect(accepted.ok).toBe(true);
    if (!accepted.ok) return;
    const acceptedImport = await importDocx(await accepted.blob.arrayBuffer(), {
      lossPolicy: 'allow',
      plugins,
    });

    expect(acceptedImport.ok).toBe(true);
    if (!acceptedImport.ok) return;
    expect(acceptedImport.comments[0]?.target).toEqual({
      range: {
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
    });
  });

  it('drops a comment on excluded pending content without rejecting the export', async () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, authored({ authorId: 'alice' })],
      initialValue: [{ children: [{ text: 'ABCDE' }], type: 'paragraph' }],
    });
    const view = createEditorView(editor, {
      authored: { intent: 'propose', projection: 'proposed' },
    });

    view.update.text.insert('XYZ', { at: { offset: 1, path: [0, 0] } });
    const result = await exportDocx(editor, {
      comments: [
        {
          author: { name: 'Alice' },
          body: [
            { children: [{ text: 'On the suggestion' }], type: 'paragraph' },
          ],
          createdAt: null,
          durableId: null,
          id: 'suggestion-note',
          parentId: null,
          resolved: null,
          target: {
            range: {
              anchor: { offset: 1, path: [0, 0] },
              focus: { offset: 4, path: [0, 0] },
            },
          },
        },
      ],
      projection: 'accepted',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.diagnostics).toContainEqual(
      expect.objectContaining({
        code: 'authored-lossy-projection',
        message: expect.stringContaining('suggestion-note'),
        severity: 'warning',
      })
    );
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());

    expect(zip.file('word/comments.xml')).toBeNull();
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
    const result = await exportDocx(editor, {
      nativeState: 'attach',
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
