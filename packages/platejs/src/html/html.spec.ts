import { describe, expect, it } from 'vitest';

import { parseHtml, parseHtmlSlice, serializeHtml } from '.';
import {
  BaseParagraphPlugin,
  createEditor,
  definePlugin,
  property,
  schema,
} from '../core';

const plugins = [BaseParagraphPlugin] as const;

describe('platejs/html', () => {
  it('selects the body or one explicit editor root', () => {
    const body = parseHtml(
      '<!doctype html><html><body><p>Body</p></body></html>',
      { plugins }
    );
    const marked = parseHtml(
      '<p>Outside</p><main data-editor="true"><p>Inside</p></main>',
      { plugins }
    );

    expect(body).toMatchObject({
      document: {
        children: [{ children: [{ text: 'Body' }], type: 'paragraph' }],
      },
      ok: true,
    });
    expect(marked).toMatchObject({
      document: {
        children: [{ children: [{ text: 'Inside' }], type: 'paragraph' }],
      },
      ok: true,
    });
  });

  it('rejects multiple editor roots', () => {
    const result = parseHtml(
      '<div data-editor="true"><p>One</p></div><div data-editor="true"><p>Two</p></div>',
      { plugins }
    );

    expect(result).toEqual({
      diagnostics: [
        {
          code: 'html-multiple-editor-roots',
          count: 2,
          message: 'HTML contains 2 elements marked data-editor="true".',
          severity: 'error',
        },
      ],
      ok: false,
    });
  });

  it('treats a slice as rootless content', () => {
    const result = parseHtmlSlice(
      '<span data-editor="true">Inline</span><p>Block</p>',
      { plugins }
    );

    expect(result).toMatchObject({
      ok: true,
      slice: {
        content: [
          { text: 'Inline' },
          { children: [{ text: 'Block' }], type: 'paragraph' },
        ],
        openEnd: 0,
        openStart: 0,
      },
    });
  });

  it('removes unsafe source before mappings run', () => {
    const result = parseHtml(
      '<script>globalThis.__plateHtmlExecuted = true</script><p onclick="bad()">Safe</p>',
      { plugins }
    );

    expect(result).toMatchObject({
      document: {
        children: [{ children: [{ text: 'Safe' }], type: 'paragraph' }],
      },
      ok: true,
    });
    expect(result.diagnostics.map(({ code }) => code)).toEqual([
      'html-unsafe-content',
      'html-unsafe-content',
    ]);
    expect(Reflect.get(globalThis, '__plateHtmlExecuted')).toBeUndefined();
  });

  it('enforces byte and tree limits', () => {
    expect(
      parseHtml('<p>large</p>', { limits: { maxBytes: 2 }, plugins })
    ).toMatchObject({
      diagnostics: [{ code: 'html-limit-exceeded', limit: 'maxBytes' }],
      ok: false,
    });
    expect(
      parseHtml('<div><div><p>deep</p></div></div>', {
        limits: { maxDepth: 2 },
        plugins,
      })
    ).toMatchObject({
      diagnostics: [{ code: 'html-limit-exceeded', limit: 'maxDepth' }],
      ok: false,
    });
  });

  it('serializes a detached document with an explicit result', () => {
    expect(
      serializeHtml(
        {
          children: [{ children: [{ text: 'Detached' }], type: 'paragraph' }],
        },
        { plugins }
      )
    ).toEqual({ data: '<p>Detached</p>', diagnostics: [], ok: true });
  });

  it('uses the compiled custom schema for detached conversion', () => {
    const CustomParagraphPlugin = definePlugin('customHtmlParagraph', {
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: ({ element }) => ({
              align: element.dataset.align || undefined,
            }),
            encode: ({ content, node }) => ({
              attributes: node.align ? { 'data-align': node.align } : undefined,
              children: content,
              tag: 'p',
            }),
            match: [{ tag: 'p' }],
            priority: 1,
          },
        }),
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { align: property.string() },
        },
      },
    });
    const options = {
      plugins: [CustomParagraphPlugin],
      schema: {
        root: schema.content.element(CustomParagraphPlugin, { min: 1 }),
      },
    } as const;
    const document = {
      children: [
        {
          align: 'center',
          children: [{ text: 'Mapped' }],
          type: 'customHtmlParagraph',
        },
      ],
    } as const;

    expect(
      parseHtml('<p data-align="center">Mapped</p>', options)
    ).toMatchObject({ document, ok: true });
    expect(serializeHtml(document, options)).toEqual({
      data: '<p data-align="center">Mapped</p>',
      diagnostics: [],
      ok: true,
    });
  });

  it('maps document repairs and enforces reported parse loss', () => {
    const RepairAtomPlugin = definePlugin('htmlRepairAtom', {
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: ({ report }) => {
              report({
                action: 'replaced',
                kind: 'element',
                message: 'The source atom requires canonical child wrapping.',
              });

              return {};
            },
            decodeOnly: true,
            match: [{ attributes: { 'data-repair-atom': true }, tag: 'div' }],
          },
        }),
      schema: {
        element: {
          content: schema.content.not(schema.content.text()),
        },
      },
    });
    const editor = createEditor({
      plugins: [RepairAtomPlugin],
      schema: {
        root: schema.content.element(RepairAtomPlugin, { min: 1 }),
      },
    });
    const source = '<div data-repair-atom>Stray text</div>';
    const rejected = editor.api.html.parse(source);
    const allowed = editor.api.html.parse(source, {
      lossPolicy: 'allow',
    });

    expect(rejected).toMatchObject({
      diagnostics: [
        {
          code: 'html-unsupported-content',
          severity: 'error',
        },
        {
          code: 'html-schema-repair',
          impact: 'lossless',
          repair: 'wrap-content',
          severity: 'warning',
        },
      ],
      ok: false,
    });
    expect(allowed).toMatchObject({
      diagnostics: [
        {
          code: 'html-unsupported-content',
          severity: 'warning',
        },
        {
          code: 'html-schema-repair',
          impact: 'lossless',
          repair: 'wrap-content',
          severity: 'warning',
        },
      ],
      document: {
        children: [
          {
            children: [
              {
                children: [{ text: 'Stray text' }],
                type: 'paragraph',
              },
            ],
            type: 'htmlRepairAtom',
          },
        ],
      },
      ok: true,
    });
  });

  it('admits detached slices without fitting them to document root grammar', () => {
    const result = parseHtmlSlice('<p>First</p><p>Second</p>', {
      plugins,
      schema: {
        root: schema.content.element(BaseParagraphPlugin, { max: 1, min: 1 }),
      },
    });

    expect(result).toMatchObject({
      ok: true,
      slice: {
        content: [
          { children: [{ text: 'First' }], type: 'paragraph' },
          { children: [{ text: 'Second' }], type: 'paragraph' },
        ],
      },
    });
  });

  it('returns expected serialize loss and allows an explicit lossy projection', () => {
    const UnsupportedPlugin = definePlugin('unsupportedHtml', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    });
    const document = {
      children: [
        {
          children: [{ text: 'Visible' }],
          type: 'unsupportedHtml',
        },
      ],
    } as const;
    const rejected = serializeHtml(document, {
      plugins: [UnsupportedPlugin],
    });
    const allowed = serializeHtml(document, {
      lossPolicy: 'allow',
      plugins: [UnsupportedPlugin],
    });

    expect(rejected).toMatchObject({
      diagnostics: [
        {
          action: 'unwrapped',
          code: 'html-unsupported-content',
          severity: 'error',
        },
      ],
      ok: false,
    });
    expect(allowed).toEqual({
      data: 'Visible',
      diagnostics: [
        {
          action: 'unwrapped',
          code: 'html-unsupported-content',
          kind: 'element',
          message:
            'Plate HTML encode has no encoder for element "unsupportedHtml".',
          model: { path: [0], root: 'main' },
          owner: 'plate:html',
          phase: 'serialize',
          severity: 'warning',
        },
      ],
      ok: true,
    });
  });

  it('throws mapping bugs instead of reporting them as source loss', () => {
    const BrokenPlugin = definePlugin('brokenHtml', {
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => {
              throw new Error('broken HTML mapping');
            },
            encode: () => {
              throw new Error('broken HTML mapping');
            },
            match: [{ tag: 'broken' }],
          },
        }),
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    });

    expect(() =>
      parseHtml('<broken>Input</broken>', { plugins: [BrokenPlugin] })
    ).toThrow('broken HTML mapping');
    expect(() =>
      serializeHtml(
        {
          children: [{ children: [{ text: 'Output' }], type: 'brokenHtml' }],
        },
        { plugins: [BrokenPlugin] }
      )
    ).toThrow('broken HTML mapping');
  });

  it('exposes only parse, parseSlice, and serialize on the editor API', () => {
    const editor = createEditor();

    expect(Object.keys(editor.api.html).sort()).toEqual([
      'parse',
      'parseSlice',
      'serialize',
    ]);
    expect(editor.api.html.parse('<p>Editor</p>')).toMatchObject({
      document: {
        children: [{ children: [{ text: 'Editor' }], type: 'paragraph' }],
      },
      ok: true,
    });
  });
});
