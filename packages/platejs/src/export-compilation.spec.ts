import { describe, expect, it } from 'bun:test';

import { AuthoredPlugin } from './authored';
import { createEditor, createEditorView, type Editor } from './core';
import { HtmlPlugin, serializeHtml } from './html';
import { definePlugin } from './lib/plugin';
import { BaseParagraphPlugin } from './lib/plugins/paragraph';
import { MarkdownPlugin, serializeMarkdown } from './markdown';
import { serializePlainText } from './plain-text';
import { renderStaticHtml } from './static';

const document = {
  children: [{ children: [{ text: 'Detached' }], type: 'paragraph' }],
} as const;

describe('standalone format compilation', () => {
  it('serializes formats without activating plugins', () => {
    let activations = 0;
    const LifecycleProbe = definePlugin('exportLifecycleProbe', {}).extend({
      activate: () => {
        activations += 1;
      },
    });
    const plugins = [
      BaseParagraphPlugin,
      HtmlPlugin,
      MarkdownPlugin,
      LifecycleProbe,
    ] as const;

    expect(serializePlainText(document, { plugins }).data).toBe('Detached');
    const markdown = serializeMarkdown(document, { plugins });

    expect(markdown.ok).toBe(true);
    if (!markdown.ok) throw new Error('Expected Markdown serialization.');
    expect(markdown.data.trim()).toBe('Detached');
    expect(serializeHtml(document, { plugins })).toEqual({
      data: '<p>Detached</p>',
      diagnostics: [],
      ok: true,
    });
    expect(activations).toBe(0);
  });
});

describe('authored projection', () => {
  const plugins = [
    BaseParagraphPlugin,
    HtmlPlugin,
    MarkdownPlugin,
    AuthoredPlugin,
  ] as const;

  const createProposingEditor = () => {
    const editor = createEditor({
      plugins,
      initialValue: [{ children: [{ text: 'Base' }], type: 'paragraph' }],
      userId: 'alice',
    });

    createEditorView(editor, {
      authored: { intent: 'propose' },
    }).update.text.insert(' draft', { at: { offset: 4, path: [0, 0] } });

    return editor;
  };

  type ExportPath = readonly [
    string,
    (
      editor: Editor,
      projection?: 'accepted'
    ) => Promise<
      Readonly<{ data?: string; diagnostics?: ReadonlyArray<{ code: string }> }>
    >,
  ];

  const detachedHtml: ExportPath = [
    'detached HTML',
    async (editor, projection) =>
      serializeHtml(editor.read.value(), { plugins, projection }),
  ];
  const editorHtml: ExportPath = [
    'editor HTML',
    async (editor, projection) =>
      editor.plugin(HtmlPlugin).api.serialize({ projection }),
  ];
  const detachedMarkdown: ExportPath = [
    'detached Markdown',
    async (editor, projection) =>
      serializeMarkdown(editor.read.value(), { plugins, projection }),
  ];
  const editorMarkdown: ExportPath = [
    'editor Markdown',
    async (editor, projection) =>
      editor.plugin(MarkdownPlugin).api.serialize({ projection }),
  ];
  const detachedPlainText: ExportPath = [
    'detached plain text',
    async (editor, projection) =>
      serializePlainText(editor.read.value(), { plugins, projection }),
  ];
  const editorPlainText: ExportPath = [
    'editor plain text',
    async (editor, projection) => serializePlainText(editor, { projection }),
  ];
  const staticHtml: ExportPath = [
    'static HTML',
    async (editor, projection) => renderStaticHtml(editor, { projection }),
  ];
  const projectionRequired =
    'Exporting a document with suggestions requires projection "accepted" or "proposed".';

  it.each([
    detachedHtml,
    editorHtml,
    detachedMarkdown,
    editorMarkdown,
    detachedPlainText,
    editorPlainText,
    staticHtml,
  ])(
    'refuses %s of a document with pending suggestions until the caller picks a version',
    async (_name, exportDocument) => {
      await expect(exportDocument(createProposingEditor())).rejects.toThrow(
        projectionRequired
      );
    }
  );

  it('exports a document from an authored editor that holds no suggestions without a projection', () => {
    const editor = createEditor({
      plugins,
      initialValue: [{ children: [{ text: 'Base' }], type: 'paragraph' }],
      userId: 'alice',
    });

    expect(serializeHtml(editor.read.value(), { plugins })).toEqual({
      data: '<p>Base</p>',
      diagnostics: [],
      ok: true,
    });
  });

  it.each([
    ['a null', '{"projection":null}'],
    ['a misspelled', '{"projection":"accepted "}'],
  ])('refuses %s projection read from a JSON request body', (_name, body) => {
    const options: { projection?: 'accepted' | 'proposed' } = JSON.parse(body);

    expect(() =>
      serializeHtml(createProposingEditor().read.value(), {
        plugins,
        ...options,
      })
    ).toThrow(projectionRequired);
  });

  it.each([
    detachedHtml,
    editorHtml,
    detachedMarkdown,
    detachedPlainText,
    editorPlainText,
  ])(
    'exports %s without the pending suggestions when the caller picks accepted',
    async (_name, exportDocument) => {
      const { data, diagnostics } = await exportDocument(
        createProposingEditor(),
        'accepted'
      );

      expect({
        codes: diagnostics?.map(({ code }) => code),
        text: data?.replaceAll(/<[^>]*>/g, '').trim(),
      }).toEqual({ codes: ['authored-lossy-projection'], text: 'Base' });
    }
  );
});
