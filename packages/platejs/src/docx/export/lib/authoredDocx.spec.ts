import JSZip from 'jszip';
import React from 'react';

import { AuthoredPlugin } from '../../../authored';
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
      plugins: [BaseParagraphPlugin, AuthoredPlugin],
      initialValue: [{ children: [{ text: 'Base' }], type: 'paragraph' }],
      userId: 'alice',
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
  });

  it('writes Word revisions that reimport with their authors', async () => {
    const HeadingPlugin = BaseHeadingPlugin.configure({
      component: ({ attributes, children, element }) =>
        React.createElement(`h${element.level}`, attributes, children),
    });
    const plugins = [
      BaseParagraphPlugin,
      HeadingPlugin,
      BaseBoldPlugin,
      AuthoredPlugin,
    ] as const;
    const alice = createEditor({
      plugins,
      initialValue: [{ children: [{ text: 'ABCDE' }], type: 'paragraph' }],
      userId: 'alice',
    });

    createEditorView(alice, {
      authored: { intent: 'propose', projection: 'markup' },
    }).update.text.insert('XY', {
      at: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
    });
    const bob = createEditor({
      plugins,
      initialValue: alice.read.value(),
      userId: 'bob',
    });

    createEditorView(bob, {
      authored: { intent: 'propose', projection: 'markup' },
    }).update.nodes.set({ bold: true }, { at: [0, 0] });
    const editor = createEditor({
      plugins,
      initialValue: bob.read.value(),
      userId: 'carol',
    });

    createEditorView(editor, {
      authored: { intent: 'propose', projection: 'markup' },
    }).update.nodes.set({ level: 1, type: 'heading' }, { at: [0] });

    const result = await exportDocx(editor, {
      projection: 'review',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const documentXml = await zip.file('word/document.xml')!.async('string');
    expect(documentXml).toContain('<w:ins');
    expect(documentXml).toContain('<w:del');
    expect(documentXml).toContain('<w:delText');
    expect(documentXml).toContain('<w:rPrChange');
    expect(documentXml).toContain('<w:pPrChange');
    expect(documentXml).toContain('w:author="alice"');
    expect(result.diagnostics).toEqual([]);

    const reimported = await importDocx(await result.blob.arrayBuffer(), {
      plugins,
    });

    expect(reimported.ok).toBe(true);
    if (!reimported.ok) return;
    const restored = createEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseHeadingPlugin,
        BaseBoldPlugin,
        AuthoredPlugin,
      ],
      initialValue: reimported.document,
      userId: 'reader',
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
    expect(reimported.diagnostics).toEqual([]);

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

  it('uses the pre-await snapshot for Word XML', async () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, AuthoredPlugin],
      initialValue: [{ children: [{ text: 'Base' }], type: 'paragraph' }],
      userId: 'alice',
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
      projection: 'review',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const documentXml = await zip.file('word/document.xml')!.async('string');

    expect(documentXml).toContain(' draft');
    expect(documentXml).not.toContain(' late');
    expect(editor.read.value()).not.toEqual(captured);
  });

  it('warns when an explicit projection drops pending review data', async () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, AuthoredPlugin],
      initialValue: [{ children: [{ text: 'Base' }], type: 'paragraph' }],
      userId: 'alice',
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
    const plugins = [BaseParagraphPlugin, AuthoredPlugin];
    const original = createEditor({
      plugins,
      initialValue: [{ children: [{ text: 'First' }], type: 'paragraph' }],
      userId: 'alice',
    });
    let id = '';

    original.update((tx) => {
      id = tx.authored.propose();
      tx.text.insert('!', { at: { offset: 5, path: [0, 0] } });
    });
    const saved = structuredClone(original.read.value());
    const author = createEditor({
      plugins,
      initialValue: saved,
      userId: 'alice',
    });
    const reviewer = createEditor({
      plugins,
      initialValue: saved,
      userId: 'alice',
    });
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
    const merged = createEditor({
      plugins,
      initialValue: saved,
      userId: 'alice',
    });

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
    const plugins = [BaseParagraphPlugin, AuthoredPlugin] as const;
    const editor = createEditor({
      plugins,
      initialValue: [{ children: [{ text: 'ABCDE' }], type: 'paragraph' }],
      userId: 'alice',
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
      plugins: [BaseParagraphPlugin, AuthoredPlugin],
      initialValue: [{ children: [{ text: 'ABCDE' }], type: 'paragraph' }],
      userId: 'alice',
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

  it('writes tracked insertions inside custom schema content', async () => {
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
      plugins: [CustomPlugin, CustomMarkPlugin, AuthoredPlugin],
      userId: 'alice',
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
      projection: 'review',
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());

    const documentXml = await zip.file('word/document.xml')!.async('string');

    expect(documentXml).toContain('Base');
    expect(documentXml).toMatch(
      /<w:ins\b[^>]*w:author="alice"[^>]*>(?:(?!<\/w:ins>)[\s\S])* draft/
    );
  });
});
