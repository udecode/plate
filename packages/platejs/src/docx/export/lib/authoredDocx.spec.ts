import JSZip from 'jszip';
import React from 'react';

import { AuthoredPlugin, projectAuthoredDocument } from '../../../authored';
import {
  createEditor,
  createEditorView,
  definePlugin,
  type Editor,
  type EditorDocumentValue,
  ElementIdPlugin,
  property,
  schema,
} from '../../../core';
import {
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseHeadingPlugin,
} from '../../../features/basic-nodes';
import { BaseFontColorPlugin } from '../../../features/basic-styles';
import { BaseIndentPlugin } from '../../../features/indent';
import { BaseListPlugin } from '../../../features/list';
import { BaseParagraphPlugin } from '../../../lib';
import { EditorStatic, type EditorStaticProps } from '../../../static';
import { importDocx } from '../../import/lib/importDocx';
import { exportDocx } from './exportDocx';

// Each editor mints its own token per decision, so two editors that decide
// alike store verdicts that differ only in it.
const withoutDecisionTokens = ({ records, ...value }: EditorDocumentValue) => {
  const verdicts = records?.['authored-verdicts'];

  return verdicts
    ? {
        ...value,
        records: {
          ...records,
          'authored-verdicts': Object.values(verdicts)
            .map(({ decision: _decision, ...verdict }) =>
              JSON.stringify(verdict)
            )
            .sort(),
        },
      }
    : { ...value, ...(records ? { records } : {}) };
};

describe('authored DOCX', () => {
  it('writes no revision for a block a rejected replacement gives back', async () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, AuthoredPlugin],
      initialValue: [
        { children: [{ text: 'Old' }], type: 'paragraph' },
        { children: [{ text: 'Kept' }], type: 'paragraph' },
      ],
      userId: 'alice',
    });

    createEditorView(editor, { authored: { intent: 'propose' } }).update(
      (tx) => {
        tx.nodes.remove({ at: [0] });
        tx.nodes.insert(
          { children: [{ text: 'New' }], type: 'paragraph' },
          { at: [0] }
        );
      }
    );
    editor.update.authored.decide({
      action: 'reject',
      changes: editor.read.authored.changes().items,
    });
    expect(JSON.stringify(editor.read.children())).toContain('"kind":"held"');

    const result = await exportDocx(editor, { projection: 'review' });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const documentXml = await zip.file('word/document.xml')!.async('string');

    expect(documentXml).not.toMatch(/<w:(ins|del|pPrChange|rPrChange)\b/);
    expect(documentXml).toContain('Old');
  });

  it('writes one tracked insertion for contiguous native typing', async () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, AuthoredPlugin],
      initialValue: [{ children: [{ text: 'Base' }], type: 'paragraph' }],
      userId: 'alice',
    });
    const view = createEditorView(editor, {
      authored: { intent: 'propose' },
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

  it('exports the accepted and the proposed text of one mixed suggestion', async () => {
    const editor = createEditor({
      plugins: [BaseParagraphPlugin, AuthoredPlugin],
      initialValue: [{ children: [{ text: 'Base old' }], type: 'paragraph' }],
      userId: 'alice',
    });

    createEditorView(editor, { authored: { intent: 'propose' } }).update(
      (tx) => {
        tx.text.delete({
          at: {
            anchor: { offset: 4, path: [0, 0] },
            focus: { offset: 8, path: [0, 0] },
          },
        });
        tx.text.insert(' draft', { at: { offset: 4, path: [0, 0] } });
      }
    );
    const exported = async (projection: 'accepted' | 'proposed') => {
      const result = await exportDocx(editor, { projection });
      if (!result.ok) throw new Error(`DOCX ${projection} export failed`);
      const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
      const xml = await zip.file('word/document.xml')!.async('string');

      return {
        revisions: /<w:(ins|del)\b/.test(xml),
        text: [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)]
          .map(([, text]) => text)
          .join(''),
      };
    };

    expect(await exported('accepted')).toEqual({
      revisions: false,
      text: 'Base old',
    });
    expect(await exported('proposed')).toEqual({
      revisions: false,
      text: 'Base draft',
    });
  });

  it('exports a pending insertion under a generated block id', async () => {
    const inserted = [
      { at: 1, author: 'ann', change: 'ann:1', kind: 'insert' },
    ];
    const editor = createEditor({
      plugins: [ElementIdPlugin, BaseParagraphPlugin, AuthoredPlugin],
      initialValue: [
        {
          children: [{ text: 'Base' }, { authored: inserted, text: ' draft' }],
          id: 'p1',
          type: 'paragraph',
        },
      ],
      userId: 'zed',
    });
    const result = await exportDocx(editor, { projection: 'proposed' });
    if (!result.ok) throw new Error('DOCX proposed export failed');
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const xml = await zip.file('word/document.xml')!.async('string');

    expect(
      [...xml.matchAll(/<w:t(?: [^>]*)?>([^<]*)<\/w:t>/g)]
        .map(([, text]) => text)
        .join('')
    ).toBe('Base draft');
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
      authored: { intent: 'propose' },
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
      authored: { intent: 'propose' },
    }).update.nodes.set({ bold: true }, { at: [0, 0] });
    const editor = createEditor({
      plugins,
      initialValue: bob.read.value(),
      userId: 'carol',
    });

    createEditorView(editor, {
      authored: { intent: 'propose' },
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
    const restoredAs = (projection: 'accepted' | 'proposed') =>
      projectAuthoredDocument(restored.read.value(), { projection }).document
        .children;

    expect(restoredAs('accepted')).toEqual([
      { children: [{ text: 'ABCDE' }], type: 'paragraph' },
    ]);
    expect(restoredChanges.map(({ authorId }) => authorId)).toEqual([
      'carol',
      'bob',
      'alice',
    ]);
    expect(restoredAs('proposed')).toEqual([
      {
        children: [{ bold: true, text: 'A' }, { text: 'XYDE' }],
        level: 1,
        type: 'heading',
      },
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
      authored: { intent: 'propose' },
    });

    view.update.text.insert(' draft', { at: { offset: 4, path: [0, 0] } });
    const captured = structuredClone(editor.read.value());
    let mutated = false;
    const MutatingStatic = (props: EditorStaticProps) => {
      if (!mutated) {
        mutated = true;
        view.update.text.insert(' late', {
          at: { offset: 6, path: [0, 1] },
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
      authored: { intent: 'propose' },
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

  it('projects proposed comment ranges into accepted and review output', async () => {
    const plugins = [BaseParagraphPlugin, AuthoredPlugin] as const;
    const editor = createEditor({
      plugins,
      initialValue: [{ children: [{ text: 'ABCDE' }], type: 'paragraph' }],
      userId: 'alice',
    });
    const view = createEditorView(editor, {
      authored: { intent: 'propose' },
    });

    view.update.text.insert('XYZ', {
      at: {
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
    });
    const comment = (
      id: string,
      path: number[],
      anchor: number,
      focus: number
    ) => ({
      author: { name: 'Alice' },
      body: [{ children: [{ text: id }], type: 'paragraph' }],
      createdAt: null,
      durableId: null,
      id,
      parentId: null,
      resolved: null,
      target: {
        range: {
          anchor: { offset: anchor, path },
          focus: { offset: focus, path },
        },
      },
    });
    const review = await exportDocx(editor, {
      comments: [comment('inserted', [0, 2], 0, 3)],
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
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 3, path: [0, 2] },
      },
    });

    const accepted = await exportDocx(editor, {
      comments: [comment('unchanged', [0, 3], 0, 2)],
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
      authored: { intent: 'propose' },
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
              anchor: { offset: 0, path: [0, 1] },
              focus: { offset: 3, path: [0, 1] },
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
      authored: { intent: 'propose' },
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

describe('review DOCX round trip', () => {
  const LinkPlugin = definePlugin('link', {
    component: 'a',
    render: { attributes: ({ element }) => ({ href: element.url as string }) },
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
        inline: true,
        properties: { url: property.string() },
      },
    },
    formats: ({ defineFormats }) =>
      defineFormats({
        html: {
          decode: ({ element }) => {
            const url = element.getAttribute('href');

            return url ? { url } : undefined;
          },
          decodeOnly: true,
          match: [{ tag: 'a' }],
        },
      }),
  });
  const plugins = [
    BaseParagraphPlugin,
    BaseBlockquotePlugin,
    BaseBoldPlugin,
    BaseFontColorPlugin,
    BaseIndentPlugin.configure({ targetPlugins: ['paragraph'] }),
    BaseListPlugin.configure({
      slots: {
        wrapNodeChildren: ({ element }) =>
          element.listType
            ? ({ children }) =>
                React.createElement(
                  'ol',
                  null,
                  React.createElement('li', null, children)
                )
            : undefined,
      },
      targetPlugins: ['paragraph'],
    }),
    LinkPlugin,
    AuthoredPlugin,
  ] as const;
  const reimport = async (
    editor: Editor,
    rewrite: (documentXml: string) => string = (documentXml) => documentXml,
    lossPolicy: 'allow' | 'reject' = 'reject',
    rewriteParts: Readonly<Record<string, (xml: string) => string>> = {}
  ) => {
    const result = await exportDocx(editor, { projection: 'review' });

    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());

    for (const [name, rewritePart] of Object.entries({
      ...rewriteParts,
      'word/document.xml': rewrite,
    })) {
      zip.file(name, rewritePart(await zip.file(name)!.async('string')));
    }

    return importDocx(await zip.generateAsync({ type: 'arraybuffer' }), {
      lossPolicy,
      plugins,
    });
  };
  const splitFirstRun = (documentXml: string) =>
    documentXml.replace(
      /<w:r>(\s*<w:rPr>(?:(?!<\/w:r>)[\s\S])*?<\/w:rPr>\s*)<w:t xml:space="preserve">([^<])([^<]+)<\/w:t>\s*<\/w:r>/,
      '<w:r>$1<w:t xml:space="preserve">$2</w:t></w:r><w:r>$1<w:t xml:space="preserve">$3</w:t></w:r>'
    );
  const renumberIds = (documentXml: string) => {
    const bookmarks = new Map<string, number>();
    let next = 40;
    const take = () => {
      next += 1;

      return next - 1;
    };

    return documentXml.replaceAll(
      /<w:(\w+) ([^>]*?)w:id="(\d+)"/g,
      (_, tag: string, rest: string, id: string) => {
        if (tag.startsWith('bookmark') && !bookmarks.has(id)) {
          bookmarks.set(id, take());
        }

        return `<w:${tag} ${rest}w:id="${tag.startsWith('bookmark') ? bookmarks.get(id) : take()}"`;
      }
    );
  };
  const dropDateMilliseconds = (documentXml: string) =>
    documentXml.replaceAll(/(w:date="[^"]+?)\.\d{3}Z"/g, '$1Z"');
  const addRsids = (documentXml: string) =>
    documentXml.replaceAll(/<w:(p|r)>/g, '<w:$1 w:rsidR="00A1B2C3">');
  const addGoBackAndProofing = (documentXml: string) =>
    documentXml.replace(
      /(<w:p\b[^>]*>\s*<w:pPr>(?:(?!<\/w:pPr>)[\s\S])*<\/w:pPr>)/,
      '$1<w:bookmarkStart w:id="0" w:name="_GoBack"/><w:bookmarkEnd w:id="0"/><w:proofErr w:type="spellStart"/>'
    );
  const asWordSaves = (documentXml: string) =>
    [
      splitFirstRun,
      renumberIds,
      dropDateMilliseconds,
      addRsids,
      addGoBackAndProofing,
    ].reduce((xml, step) => step(xml), documentXml);

  it.each([
    {
      build: () => {
        const editor = createEditor({
          plugins,
          initialValue: [
            { children: [{ bold: true, text: 'Base' }], type: 'paragraph' },
          ],
          userId: 'bob',
        });

        createEditorView(editor, {
          authored: { intent: 'propose' },
        }).update.nodes.unset('bold', { at: [0, 0] });

        return editor;
      },
      decisions: [],
      title: 'a suggested bold removal',
    },
    {
      build: () => {
        const alice = createEditor({
          plugins,
          initialValue: [{ children: [{ text: 'Base' }], type: 'paragraph' }],
          userId: 'alice',
        });

        createEditorView(alice, {
          authored: { intent: 'propose' },
        }).update.text.insert(' draft', { at: { offset: 4, path: [0, 0] } });
        const bob = createEditor({
          plugins,
          initialValue: alice.read.value(),
          userId: 'bob',
        });

        createEditorView(bob, {
          authored: { intent: 'propose' },
        }).update.text.delete({
          at: {
            anchor: { offset: 2, path: [0, 1] },
            focus: { offset: 5, path: [0, 1] },
          },
        });

        return bob;
      },
      decisions: [],
      title: 'an insertion with a deletion inside',
    },
    {
      build: () => {
        const bob = createEditor({
          plugins,
          initialValue: [
            { children: [{ text: 'Base word' }], type: 'paragraph' },
          ],
          userId: 'bob',
        });

        createEditorView(bob, {
          authored: { intent: 'propose' },
        }).update.text.delete({
          at: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 6, path: [0, 0] },
          },
        });
        const carol = createEditor({
          plugins,
          initialValue: bob.read.value(),
          userId: 'carol',
        });

        createEditorView(carol, {
          authored: { intent: 'propose' },
        }).update.text.delete({
          at: {
            anchor: { offset: 3, path: [0, 0] },
            focus: { offset: 2, path: [0, 1] },
          },
        });

        return carol;
      },
      decisions: [['reject', 'bob'] as const],
      title: 'two deletions decided independently',
    },
    {
      build: () => {
        const alice = createEditor({
          plugins,
          initialValue: [{ children: [{ text: 'Base' }], type: 'paragraph' }],
          userId: 'alice',
        });

        createEditorView(alice, {
          authored: { intent: 'propose' },
        }).update.text.insert(' hers', { at: { offset: 4, path: [0, 0] } });
        const bob = createEditor({
          plugins,
          initialValue: alice.read.value(),
          userId: 'bob',
        });

        createEditorView(bob, {
          authored: { intent: 'propose' },
        }).update.text.insert('X', { at: { offset: 3, path: [0, 1] } });
        const carol = createEditor({
          plugins,
          initialValue: bob.read.value(),
          userId: 'carol',
        });

        createEditorView(carol, {
          authored: { intent: 'propose' },
        }).update.text.delete({
          at: {
            anchor: { offset: 1, path: [0, 0] },
            focus: { offset: 3, path: [0, 0] },
          },
        });

        return carol;
      },
      decisions: [['accept', 'alice'] as const, ['reject', 'bob'] as const],
      title: 'nested suggestions decided differently',
    },
    {
      build: () => {
        const alice = createEditor({
          plugins,
          initialValue: [{ children: [{ text: 'a' }], type: 'paragraph' }],
          userId: 'alice',
        });
        const view = createEditorView(alice, {
          authored: { intent: 'propose' },
        });

        view.update.nodes.insert(
          {
            children: [{ children: [{ text: 'xy' }], type: 'paragraph' }],
            type: 'blockquote',
          },
          { at: [1] }
        );
        view.update.nodes.remove({ at: [1, 0] });
        const bob = createEditor({
          plugins,
          initialValue: alice.read.value(),
          userId: 'bob',
        });

        createEditorView(bob, {
          authored: { intent: 'propose' },
        }).update.text.insert('Z', { at: { offset: 0, path: [1, 0, 0] } });

        return bob;
      },
      decisions: [],
      title: 'a fill with text typed into it',
    },
    {
      build: () => {
        const alice = createEditor({
          plugins,
          initialValue: [
            { children: [{ text: 'a' }], type: 'paragraph' },
            { children: [{ text: 'b' }], type: 'paragraph' },
          ],
          userId: 'alice',
        });

        createEditorView(alice, {
          authored: { intent: 'propose' },
        }).update.nodes.insert(
          { children: [{ text: 'new' }], type: 'paragraph' },
          { at: [2] }
        );
        const bob = createEditor({
          plugins,
          initialValue: alice.read.value(),
          userId: 'bob',
        });

        bob.update.nodes.move({ at: [2], to: [0] });

        return bob;
      },
      decisions: [],
      title: 'an accepted move whose insertion is pending',
    },
  ])('keeps $title through a review DOCX', async ({ build, decisions }) => {
    const original = build();
    const imported = await reimport(original);
    const restored = createEditor({
      plugins,
      initialValue: imported.ok ? imported.document : original.read.value(),
      userId: 'reader',
    });

    for (const [action, author] of decisions) {
      for (const editor of [original, restored]) {
        editor.update.authored.decide({
          action,
          changes: editor.read.authored
            .changes()
            .items.filter(({ authorId }) => authorId === author),
        });
      }
    }

    expect(imported.ok && withoutDecisionTokens(restored.read.value())).toEqual(
      withoutDecisionTokens(original.read.value())
    );
  });

  it('writes the Word revisions of each run: insertions outer to inner, one deletion inside, and the formatting a suggestion replaced', async () => {
    const alice = createEditor({
      plugins,
      initialValue: [
        { children: [{ bold: true, text: 'Base' }], type: 'paragraph' },
      ],
      userId: 'alice',
    });

    createEditorView(alice, {
      authored: { intent: 'propose' },
    }).update.text.insert(' hers', { at: { offset: 4, path: [0, 0] } });
    const bob = createEditor({
      plugins,
      initialValue: alice.read.value(),
      userId: 'bob',
    });
    const view = createEditorView(bob, { authored: { intent: 'propose' } });

    view.update.text.insert('X', { at: { offset: 3, path: [0, 1] } });
    view.update.nodes.unset('bold', { at: [0, 0] });
    const carol = createEditor({
      plugins,
      initialValue: bob.read.value(),
      userId: 'carol',
    });

    createEditorView(carol, {
      authored: { intent: 'propose' },
    }).update.text.delete({
      at: {
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 1, path: [0, 2] },
      },
    });
    const result = await exportDocx(carol, { projection: 'review' });

    if (!result.ok) throw new Error(JSON.stringify(result.diagnostics));
    const zip = await JSZip.loadAsync(await result.blob.arrayBuffer());
    const rawXml = await zip.file('word/document.xml')!.async('string');
    const documentXml = rawXml
      .replaceAll(/>\s+</g, '><')
      .replaceAll(/ (w:date|w:id|xml:space)="[^"]*"/g, '');

    expect([
      documentXml.includes(
        '<w:ins w:author="alice"><w:ins w:author="bob"><w:del w:author="carol"><w:r><w:rPr><w:b/></w:rPr><w:delText>X</w:delText>'
      ),
      documentXml.includes(
        '<w:rPrChange w:author="bob"><w:rPr><w:b/></w:rPr></w:rPrChange>'
      ),
    ]).toEqual([true, true]);
  });

  it('binds the stored blocks after Word renumbers ids, drops date milliseconds and splits runs', async () => {
    const alice = createEditor({
      plugins,
      initialValue: [
        { children: [{ bold: true, text: 'Base' }], type: 'paragraph' },
        { children: [{ text: 'plain' }], type: 'paragraph' },
      ],
      userId: 'alice',
    });

    createEditorView(alice, {
      authored: { intent: 'propose' },
    }).update.text.insert(' hers', { at: { offset: 4, path: [0, 0] } });
    const bob = createEditor({
      plugins,
      initialValue: alice.read.value(),
      userId: 'bob',
    });
    const view = createEditorView(bob, { authored: { intent: 'propose' } });

    view.update.text.insert('X', { at: { offset: 3, path: [0, 1] } });
    view.update.nodes.unset('bold', { at: [0, 0] });
    const imported = await reimport(bob, asWordSaves);

    expect(
      imported.ok &&
        createEditor({
          plugins,
          initialValue: imported.document,
          userId: 'reader',
        }).read.value()
    ).toEqual(bob.read.value());
  });

  it('refuses a reviewed block Word changed, and keeps the Word revisions when loss is allowed', async () => {
    const alice = createEditor({
      plugins,
      initialValue: [{ children: [{ text: 'Base' }], type: 'paragraph' }],
      userId: 'alice',
    });

    createEditorView(alice, {
      authored: { intent: 'propose' },
    }).update.text.insert(' draft', { at: { offset: 4, path: [0, 0] } });
    const edited = (documentXml: string) =>
      documentXml.replace('>Base<', '>Bass<');
    const [rejected, allowed] = await Promise.all([
      reimport(alice, edited),
      reimport(alice, edited, 'allow'),
    ]);

    expect({
      allowed: allowed.ok
        ? projectAuthoredDocument(allowed.document, { projection: 'proposed' })
            .document.children
        : allowed.diagnostics,
      rejected: rejected.ok ? rejected.document : rejected.diagnostics[0],
    }).toEqual({
      allowed: [{ children: [{ text: 'Bass draft' }], type: 'paragraph' }],
      rejected: expect.objectContaining({
        code: 'lossy-content',
        feature: 'authored-review',
        severity: 'error',
      }),
    });
  });

  it.each([
    {
      allowed: [{ children: [{ text: 'NEW Base draft' }], type: 'paragraph' }],
      edit: (documentXml: string) =>
        documentXml.replace(
          /<w:bookmarkStart w:id="\d+" w:name="_ReviewBlock1"\/>/,
          '<w:r><w:t xml:space="preserve">NEW </w:t></w:r>$&'
        ),
      title: 'text before its bookmark',
    },
    {
      allowed: [
        {
          children: [{ bold: true, text: 'Base' }, { text: ' draft' }],
          type: 'paragraph',
        },
      ],
      edit: (documentXml: string) =>
        documentXml.replace(
          /<w:rPr\/>(\s*<w:t xml:space="preserve">Base<\/w:t>)/,
          '<w:rPr><w:b/></w:rPr>$1'
        ),
      title: 'bold on its plain text',
    },
  ])('refuses a reviewed block Word gave $title', async ({ allowed, edit }) => {
    const alice = createEditor({
      plugins,
      initialValue: [{ children: [{ text: 'Base' }], type: 'paragraph' }],
      userId: 'alice',
    });

    createEditorView(alice, {
      authored: { intent: 'propose' },
    }).update.text.insert(' draft', { at: { offset: 4, path: [0, 0] } });
    const [rejected, loose] = await Promise.all([
      reimport(alice, edit),
      reimport(alice, edit, 'allow'),
    ]);

    expect({
      allowed: loose.ok
        ? projectAuthoredDocument(loose.document, { projection: 'proposed' })
            .document.children
        : loose.diagnostics,
      rejected: rejected.ok ? rejected.document : rejected.diagnostics[0],
    }).toEqual({
      allowed,
      rejected: expect.objectContaining({
        code: 'lossy-content',
        feature: 'authored-review',
        severity: 'error',
      }),
    });
  });

  it('refuses a reviewed numbered paragraph whose level Word changed, and keeps that level when loss is allowed', async () => {
    const alice = createEditor({
      plugins,
      initialValue: [
        {
          children: [
            {
              authored: [
                { at: 1, author: 'alice', change: 'c1', kind: 'insert' },
              ],
              text: '!',
            },
            { text: 'one' },
          ],
          indent: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
      ] as never,
      userId: 'alice',
    });
    const edit = (documentXml: string) =>
      documentXml.replace('<w:ilvl w:val="0"/>', '<w:ilvl w:val="1"/>');
    const [rejected, loose] = await Promise.all([
      reimport(alice, edit),
      reimport(alice, edit, 'allow'),
    ]);

    expect({
      allowed: loose.ok
        ? projectAuthoredDocument(loose.document, {
            projection: 'proposed',
          }).document.children.map(({ indent, listType }) => ({
            indent,
            listType,
          }))
        : loose.diagnostics,
      rejected: rejected.ok ? rejected.document : rejected.diagnostics[0],
    }).toEqual({
      allowed: [{ indent: 2, listType: 'numbered' }],
      rejected: expect.objectContaining({
        code: 'lossy-content',
        feature: 'authored-review',
        severity: 'error',
      }),
    });
  });

  it('refuses a reviewed numbered paragraph whose list format Word changed in its numbering part, and keeps that format when loss is allowed', async () => {
    const alice = createEditor({
      plugins,
      initialValue: [
        {
          children: [
            {
              authored: [
                { at: 1, author: 'alice', change: 'c1', kind: 'insert' },
              ],
              text: '!',
            },
            { text: 'one' },
          ],
          indent: 1,
          listType: 'numbered',
          type: 'paragraph',
        },
      ] as never,
      userId: 'alice',
    });
    const numbering = {
      'word/numbering.xml': (numberingXml: string) =>
        numberingXml.replace(
          '<w:numFmt w:val="decimal"/>',
          '<w:numFmt w:val="upperRoman"/>'
        ),
    };
    const [rejected, loose] = await Promise.all([
      reimport(alice, undefined, 'reject', numbering),
      reimport(alice, undefined, 'allow', numbering),
    ]);

    expect({
      allowed: loose.ok
        ? projectAuthoredDocument(loose.document, {
            projection: 'proposed',
          }).document.children.map(({ listStyle }) => listStyle)
        : loose.diagnostics,
      rejected: rejected.ok ? rejected.document : rejected.diagnostics[0],
    }).toEqual({
      allowed: ['upper-roman'],
      rejected: expect.objectContaining({
        code: 'lossy-content',
        feature: 'authored-review',
        severity: 'error',
      }),
    });
  });

  const linked = (
    leading: Record<string, unknown> = {},
    url = 'https://a.example/'
  ) => {
    const editor = createEditor({
      plugins,
      initialValue: [
        {
          children: [
            { ...leading, text: 'see ' },
            {
              children: [{ text: 'site' }],
              type: 'link',
              url,
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
      ] as never,
      userId: 'alice',
    });

    createEditorView(editor, {
      authored: { intent: 'propose' },
    }).update.text.insert('!', { at: { offset: 0, path: [0, 0] } });

    return editor;
  };

  it('refuses a reviewed link whose target Word changed, and keeps that target when loss is allowed', async () => {
    const alice = linked();
    const retarget = {
      'word/_rels/document.xml.rels': (relationshipsXml: string) =>
        relationshipsXml.replace('https://a.example/', 'https://b.example/'),
    };
    const [rejected, loose] = await Promise.all([
      reimport(alice, undefined, 'reject', retarget),
      reimport(alice, undefined, 'allow', retarget),
    ]);

    expect({
      allowed: loose.ok
        ? projectAuthoredDocument(loose.document, {
            projection: 'proposed',
          }).document.children.flatMap(({ children }) =>
            children.filter((child) => 'type' in child)
          )
        : loose.diagnostics,
      rejected: rejected.ok ? rejected.document : rejected.diagnostics[0],
    }).toEqual({
      allowed: [
        {
          children: [{ text: 'site' }],
          type: 'link',
          url: 'https://b.example/',
        },
      ],
      rejected: expect.objectContaining({
        code: 'lossy-content',
        feature: 'authored-review',
        severity: 'error',
      }),
    });
  });

  it('keeps a reviewed block through a Word save that renumbers relationships and upper-cases colors', async () => {
    const alice = linked({ color: '#ff0000' });
    const renumber = (xml: string) =>
      xml.replaceAll(/rId(\d+)/g, (_, id: string) => `rId${Number(id) + 50}`);
    const imported = await reimport(
      alice,
      (documentXml) => renumber(documentXml).replaceAll('ff0000', 'FF0000'),
      'reject',
      { 'word/_rels/document.xml.rels': renumber }
    );

    expect(
      imported.ok &&
        createEditor({
          plugins,
          initialValue: imported.document,
          userId: 'reader',
        }).read.value()
    ).toEqual(alice.read.value());
  });

  it('exports and reimports a reviewed link whose address holds a stray percent sign', async () => {
    const alice = linked({}, 'https://example.com/100%');
    const imported = await reimport(alice);

    expect(
      imported.ok &&
        createEditor({
          plugins,
          initialValue: imported.document,
          userId: 'reader',
        }).read.value()
    ).toEqual(alice.read.value());
  });

  it('keeps the verdicts of a document whose every change is decided', async () => {
    const alice = createEditor({
      plugins,
      initialValue: [{ children: [{ text: 'Base' }], type: 'paragraph' }],
      userId: 'alice',
    });

    createEditorView(alice, {
      authored: { intent: 'propose' },
    }).update.text.insert(' draft', { at: { offset: 4, path: [0, 0] } });
    alice.update.authored.decide({
      action: 'accept',
      changes: alice.read.authored.changes().items,
    });
    const imported = await reimport(alice);

    expect(
      imported.ok &&
        createEditor({
          plugins,
          initialValue: imported.document,
          userId: 'reader',
        }).read.value()
    ).toEqual(alice.read.value());
  });

  it('replaces the review part of a retained source without reporting it omitted', async () => {
    const alice = createEditor({
      plugins,
      initialValue: [{ children: [{ text: 'Base' }], type: 'paragraph' }],
      userId: 'alice',
    });

    createEditorView(alice, {
      authored: { intent: 'propose' },
    }).update.text.insert(' draft', { at: { offset: 4, path: [0, 0] } });
    const first = await exportDocx(alice, { projection: 'review' });

    if (!first.ok) throw new Error(JSON.stringify(first.diagnostics));
    const imported = await importDocx(await first.blob.arrayBuffer(), {
      plugins,
      retainSource: true,
    });

    if (!imported.ok) throw new Error(JSON.stringify(imported.diagnostics));
    const bob = createEditor({
      plugins,
      initialValue: imported.document,
      userId: 'bob',
    });

    createEditorView(bob, {
      authored: { intent: 'propose' },
    }).update.text.insert('!', { at: { offset: 0, path: [0, 0] } });
    const again = await exportDocx(bob, {
      projection: 'review',
      source: imported.source,
    });

    if (!again.ok) throw new Error(JSON.stringify(again.diagnostics));
    const reimported = await importDocx(await again.blob.arrayBuffer(), {
      plugins,
    });

    expect({
      omitted: again.diagnostics.flatMap((diagnostic) =>
        diagnostic.code === 'source-part-omitted' &&
        diagnostic.part.startsWith('customXml/')
          ? [diagnostic.part]
          : []
      ),
      value:
        reimported.ok &&
        createEditor({
          plugins,
          initialValue: reimported.document,
          userId: 'reader',
        }).read.value(),
    }).toEqual({ omitted: [], value: bob.read.value() });
  });
});
