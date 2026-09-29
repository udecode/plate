import { describe, expect, it, spyOn } from 'bun:test';

import fc from 'fast-check';

import { writeDataTransferFragment } from '../../../dom';
import {
  ContentSlice,
  createEditor as createPliteEditor,
  property,
  schema,
  target,
} from '../../../facade';
import { parseHtmlSliceContent } from '../../../internal/testing/parseHtmlSliceContent';
import { createEditor } from '../../editor';
import { createEditorWithEditor } from '../../editor/withPlite';
import { definePlugin } from '../../plugin';
import { BaseParagraphPlugin } from '../paragraph';

describe('compilePlateHtmlFormat', () => {
  it('publishes HTML through the host mapping boundary', () => {
    const editor = createEditor();
    const output = new DataTransfer();
    const formats = writeDataTransferFragment(
      editor,
      output,
      ContentSlice.closed(editor.read.children())
    );

    expect(formats.filter((format) => format === 'text/html')).toEqual([
      'text/html',
    ]);
    expect(output.getData('text/html')).toBe('<p></p>');
  });

  it('omits an element whose structural encoder returns null', () => {
    const OmittedPlugin = definePlugin('omittedHtmlElement', {
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => ({}),
            encode: () => null,
            match: [{ tag: 'template' }],
          },
        }),
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    });
    const editor = createEditor({ plugins: [OmittedPlugin] });
    const output = new DataTransfer();
    const formats = writeDataTransferFragment(
      editor,
      output,
      ContentSlice.closed([
        { children: [{ text: 'Before' }], type: 'paragraph' },
        { children: [{ text: 'Draft' }], type: 'omittedHtmlElement' },
        { children: [{ text: 'After' }], type: 'paragraph' },
      ])
    );

    expect(formats).toContain('text/html');
    expect(output.getData('text/html')).toBe('<p>Before</p><p>After</p>');
  });

  it('decodes and encodes one inferred element rule', () => {
    const ParagraphPlugin = definePlugin('customParagraph', {
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: ({ element }) => ({
              align: element.dataset.align || undefined,
            }),
            encode: ({ content, node, preserve }) => {
              preserve('align');

              return {
                attributes: node.align
                  ? { 'data-align': node.align }
                  : undefined,
                children: content,
                tag: 'p',
              };
            },
            match: [{ tag: 'p' }],
          },
        }),
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { align: property.string() },
        },
      },
    });
    const editor = createEditor({
      plugins: [ParagraphPlugin],
    });
    const input = new DataTransfer();

    input.setData('text/html', '<p data-align="center">Hello</p>');

    expect(editor.api.dom.clipboard.insertData(input)).toBe(true);
    expect(editor.read.children()).toEqual([
      {
        align: 'center',
        children: [{ text: 'Hello' }],
        type: 'customParagraph',
      },
    ]);
    expect(
      parseHtmlSliceContent(editor, '<p data-align="right">Direct</p>')
    ).toEqual([
      {
        align: 'right',
        children: [{ text: 'Direct' }],
        type: 'customParagraph',
      },
    ]);

    const output = new DataTransfer();
    const formats = writeDataTransferFragment(
      editor,
      output,
      ContentSlice.closed(editor.read.children())
    );

    expect(formats).toContain('text/html');
    expect(output.getData('text/html')).toBe(
      '<p data-align="center">Hello</p>'
    );
  });

  it('coalesces adjacent equivalent text leaves after DOM wrappers and breaks', () => {
    const editor = createEditor();

    expect(
      parseHtmlSliceContent(
        editor,
        '<p>A <span>line</span><br>break <a href="#">right here</a></p>'
      )
    ).toEqual([
      {
        children: [{ text: 'A line\nbreak right here' }],
        type: 'paragraph',
      },
    ]);
  });

  it('drops host spacer artifacts instead of decoding their zero-width text', () => {
    const editor = createEditor();

    expect(
      parseHtmlSliceContent(
        editor,
        '<p>Before<span data-editor-spacer style="color: transparent">﻿</span>After</p>'
      )
    ).toEqual([
      {
        children: [{ text: 'BeforeAfter' }],
        type: 'paragraph',
      },
    ]);
  });

  it('keeps direct slice structure rootless without fitting structural children', () => {
    const QuotePlugin = definePlugin('quoteMapping', {
      schema: {
        element: {
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'blockquote' }),
            match: [{ tag: 'blockquote' }],
          },
        }),
    });
    const editor = createEditor({ plugins: [QuotePlugin] });

    expect(
      parseHtmlSliceContent(editor, '<blockquote>Direct quote</blockquote>')
    ).toEqual([
      {
        children: [{ text: 'Direct quote' }],
        type: 'quoteMapping',
      },
    ]);
    expect(
      parseHtmlSliceContent(
        editor,
        '<blockquote><div>First paragraph</div><div>Second paragraph</div></blockquote>'
      )
    ).toEqual([
      {
        children: [{ text: 'First paragraphSecond paragraph' }],
        type: 'quoteMapping',
      },
    ]);
  });

  it('keeps root inline HTML rootless for direct slice parsing', () => {
    const SectionPlugin = definePlugin('htmlApplicationSection', {
      schema: {
        element: {
          content: schema.content.element(BaseParagraphPlugin, { min: 1 }),
        },
      },
    });
    const editor = createEditor({
      plugins: [SectionPlugin],
      schema: {
        root: schema.content.element(SectionPlugin, { min: 2 }),
      },
    });

    expect(parseHtmlSliceContent(editor, '<span>Root text</span>')).toEqual([
      { text: 'Root text' },
    ]);
  });

  it('materializes each unmatched root block with its applicable properties', () => {
    const AlignPlugin = definePlugin('rootAlign', {
      schema: () => ({
        properties: {
          align: schema.elementProperty(property.string(), {
            target: target.element(BaseParagraphPlugin),
          }),
        },
      }),
      targetPlugins: [BaseParagraphPlugin],
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: ({ element }) => element.style.textAlign || undefined,
            encode: ({ value }) => ({ style: { textAlign: value } }),
            match: [{ style: { textAlign: '*' } }],
          },
        }),
    });
    const LineHeightPlugin = definePlugin('rootLineHeight', {
      schema: () => ({
        properties: {
          lineHeight: schema.elementProperty(property.number(), {
            target: target.element(BaseParagraphPlugin),
          }),
        },
      }),
      targetPlugins: [BaseParagraphPlugin],
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: ({ element }) => Number(element.style.lineHeight),
            encode: ({ value }) => ({ style: { lineHeight: value } }),
            match: [{ style: { lineHeight: '*' } }],
          },
        }),
    });
    const IndentPlugin = definePlugin('rootIndent', {
      schema: () => ({
        properties: {
          indent: schema.elementProperty(property.number(), {
            target: target.element(BaseParagraphPlugin),
          }),
        },
      }),
      targetPlugins: [BaseParagraphPlugin],
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: ({ element }) =>
              Number(element.style.marginLeft.replace('px', '')) / 24,
            encode: ({ value }) => ({
              style: { marginLeft: `${value * 24}px` },
            }),
            match: [{ style: { marginLeft: '*' } }],
          },
        }),
    });
    const editor = createEditor({
      plugins: [AlignPlugin, IndentPlugin, LineHeightPlugin],
    });

    expect(
      parseHtmlSliceContent(
        editor,
        '<div style="text-align: right; line-height: 2; margin-left: 48px">First</div><div style="text-align: center; line-height: 3; margin-left: 24px">Second</div>'
      )
    ).toEqual([
      {
        align: 'right',
        children: [{ text: 'First' }],
        indent: 2,
        lineHeight: 2,
        type: 'paragraph',
      },
      {
        align: 'center',
        children: [{ text: 'Second' }],
        indent: 1,
        lineHeight: 3,
        type: 'paragraph',
      },
    ]);
  });

  it('keeps unmatched table metadata wrappers transparent', () => {
    const CellPlugin = definePlugin('tableCell', {
      schema: ({ plugins }) => ({
        element: {
          content: plugins.blockContent({
            default: BaseParagraphPlugin,
            min: 1,
          }),
        },
      }),
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'td' }),
            match: [{ tag: 'td' }],
          },
        }),
    });
    const RowPlugin = definePlugin('tableRow', {
      schema: {
        element: {
          content: schema.content.element(CellPlugin, { min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'tr' }),
            match: [{ tag: 'tr' }],
          },
        }),
    });
    const TablePlugin = definePlugin('table', {
      dependencies: [RowPlugin, CellPlugin],
      schema: {
        element: {
          content: schema.content.element(RowPlugin, { min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => ({}),
            encode: ({ content }) => ({
              children: [{ children: content, tag: 'tbody' }],
              tag: 'table',
            }),
            match: [{ tag: 'table' }],
          },
        }),
    });
    const editor = createEditor({
      plugins: [TablePlugin],
    });

    expect(
      parseHtmlSliceContent(
        editor,
        '<table><colgroup><col/><col/></colgroup><tbody><tr><td><p>A1</p></td><td><p>A2</p></td></tr><tr><td><p>B1</p></td><td><p>B2</p></td></tr></tbody></table>'
      )
    ).toEqual([
      {
        children: [
          {
            children: [
              {
                children: [{ children: [{ text: 'A1' }], type: 'paragraph' }],
                type: 'tableCell',
              },
              {
                children: [{ children: [{ text: 'A2' }], type: 'paragraph' }],
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
          {
            children: [
              {
                children: [{ children: [{ text: 'B1' }], type: 'paragraph' }],
                type: 'tableCell',
              },
              {
                children: [{ children: [{ text: 'B2' }], type: 'paragraph' }],
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
        ],
        type: 'table',
      },
    ]);
  });

  it('reserves text/html for the inferred HTML compiler', () => {
    const InvalidPlugin = definePlugin('invalidGenericHtml', {
      // @plate-schema-adoption-negative-format
      formats: () =>
        ({
          html: {
            decode: () => null,
            scope: 'document',
          },
        }) as any,
    });

    expect(() => createEditor({ plugins: [InvalidPlugin] })).toThrow(
      'formats must be declared with the context-bound `defineFormats(...)` helper'
    );
  });

  it('composes inferred mark wrappers and element-property patches', () => {
    const ParagraphPlugin = definePlugin('paragraphMapping', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const BoldPlugin = definePlugin('boldMapping', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => true,
            encode: ({ value }) => (value ? { tag: 'strong' } : null),
            match: [{ tag: ['strong', 'b'] }],
          },
        }),
    });
    const AlignPlugin = definePlugin('alignMapping', {
      schema: {
        properties: {
          align: schema.elementProperty(property.string(), {
            target: target.type('paragraphMapping'),
          }),
        },
      },
      targetPlugins: [ParagraphPlugin],
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: ({ element }) => element.style.textAlign || undefined,
            encode: ({ value }) => ({ style: { textAlign: value } }),
            match: [{ style: { textAlign: '*' } }],
          },
        }),
    });
    const editor = createEditor({
      plugins: [AlignPlugin, BoldPlugin, ParagraphPlugin],
    });
    const input = new DataTransfer();

    input.setData(
      'text/html',
      '<p style="text-align: center"><strong>Hello</strong></p>'
    );

    expect(editor.api.dom.clipboard.insertData(input)).toBe(true);
    expect(editor.read.children()).toEqual([
      {
        align: 'center',
        children: [{ boldMapping: true, text: 'Hello' }],
        type: 'paragraphMapping',
      },
    ]);

    const output = new DataTransfer();

    expect(
      writeDataTransferFragment(
        editor,
        output,
        ContentSlice.closed(editor.read.children())
      )
    ).toContain('text/html');

    const { body } = new DOMParser().parseFromString(
      output.getData('text/html'),
      'text/html'
    );

    expect(body.querySelector('p')?.style.textAlign).toBe('center');
    expect(body.querySelector('p > strong')?.textContent).toBe('Hello');
  });

  it('delegates plain-equivalent HTML so plain text keeps active marks', () => {
    const BoldPlugin = definePlugin('boldPlainTextFallback', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => true,
            encode: ({ value }) => (value ? { tag: 'strong' } : null),
            match: [{ tag: ['strong', 'b'] }],
          },
        }),
    });
    const editor = createEditor({
      plugins: [BoldPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
        marks: { boldPlainTextFallback: true },
      },
    });

    const input = new DataTransfer();

    input.setData(
      'text/html',
      '<html><head></head><body>Prediction</body></html>'
    );
    input.setData('text/plain', 'Prediction');

    expect(editor.api.dom.clipboard.insertData(input)).toBe(true);
    expect(editor.read.children()).toEqual([
      {
        children: [{ boldPlainTextFallback: true, text: 'Prediction' }],
        type: 'paragraph',
      },
    ]);
  });

  it('keeps meaningful HTML in the Plate mapping when plain text also exists', () => {
    const BoldPlugin = definePlugin('boldMeaningfulHtml', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => true,
            encode: ({ value }) => (value ? { tag: 'strong' } : null),
            match: [{ tag: ['strong', 'b'] }],
          },
        }),
    });
    const editor = createEditor({ plugins: [BoldPlugin] });
    const input = new DataTransfer();

    input.setData('text/html', '<strong>Prediction</strong>');
    input.setData('text/plain', 'Prediction');

    expect(editor.api.dom.clipboard.insertData(input)).toBe(true);
    expect(editor.read.children()).toEqual([
      {
        children: [{ boldMeaningfulHtml: true, text: 'Prediction' }],
        type: 'paragraph',
      },
    ]);
  });

  it('preserves case-sensitive CSS custom property names', () => {
    const ParagraphPlugin = definePlugin('brandParagraph', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { brandColor: property.string() },
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: ({ element }) => ({
              brandColor:
                element.style.getPropertyValue('--brandColor') || undefined,
            }),
            encode: ({ content, node, preserve }) => {
              preserve('brandColor');

              return {
                children: content,
                style: { '--brandColor': node.brandColor },
                tag: 'p',
              };
            },
            match: [{ style: { '--brandColor': '*' } }],
          },
        }),
    });
    const editor = createEditor({ plugins: [ParagraphPlugin] });
    const fragment = parseHtmlSliceContent(
      editor,
      '<p style="--brandColor: coral">Custom</p>'
    );
    const output = new DataTransfer();

    expect(fragment).toEqual([
      {
        brandColor: 'coral',
        children: [{ text: 'Custom' }],
        type: 'brandParagraph',
      },
    ]);
    expect(
      writeDataTransferFragment(editor, output, ContentSlice.closed(fragment!))
    ).toContain('text/html');
    expect(output.getData('text/html')).toBe(
      '<p style="--brandColor: coral">Custom</p>'
    );
  });

  it('validates CSS declaration names and values before encoding', () => {
    const reports = spyOn(console, 'error').mockImplementation(() => {});
    const ParagraphPlugin = definePlugin('cssParagraph', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: {
            cssName: property.string(),
            cssValue: property.string(),
          },
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: () => ({}),
            encode: ({ content, node, preserve }) => {
              preserve('cssName', 'cssValue');

              return {
                children: content,
                style: { [String(node.cssName)]: node.cssValue },
                tag: 'p',
              };
            },
            match: [{ tag: 'p' }],
          },
        }),
    });
    const editor = createEditor({ plugins: [ParagraphPlugin] });
    const serialize = (cssName: string, cssValue: string) => {
      const output = new DataTransfer();
      const formats = writeDataTransferFragment(
        editor,
        output,
        ContentSlice.closed([
          {
            children: [{ text: 'CSS' }],
            cssName,
            cssValue,
            type: 'cssParagraph',
          },
        ])
      );

      return { formats, html: output.getData('text/html') };
    };

    expect(serialize('width', 'calc(100% - var(--gap))')).toEqual({
      formats: expect.arrayContaining(['text/html']),
      html: '<p style="width: calc(100% - var(--gap))">CSS</p>',
    });
    expect(
      serialize('--brandColor', 'color-mix(in srgb, red 50%, blue)')
    ).toEqual({
      formats: expect.arrayContaining(['text/html']),
      html: '<p style="--brandColor: color-mix(in srgb, red 50%, blue)">CSS</p>',
    });
    expect(
      serialize('backgroundImage', 'url("https://example.com/image.png")')
    ).toEqual({
      formats: expect.arrayContaining(['text/html']),
      html: '<p style="background-image: url(&quot;https://example.com/image.png&quot;)">CSS</p>',
    });
    expect(reports).not.toHaveBeenCalled();

    [
      ['color;position', 'fixed'],
      ['color:background', 'red'],
    ].forEach(([cssName, cssValue]) => {
      const result = serialize(cssName, cssValue);

      expect(result.formats).not.toContain('text/html');
      expect(result.html).toBe('');
    });
    expect(reports).toHaveBeenCalledTimes(2);

    [
      'red; position: fixed',
      'red{position: fixed}',
      'red/* hidden */',
      'red\nposition: fixed',
      String.raw`u\72 l(https://example.com/pixel.png)`,
      'image-set("https://example.com/pixel.png" 1x)',
      'url("javascript:alert(1)")',
    ].forEach((cssValue) => {
      const result = serialize('backgroundImage', cssValue);

      expect(result.formats).not.toContain('text/html');
      expect(result.html).toBe('');
      expect(
        editor.api.html.serialize({
          document: {
            children: [
              {
                children: [{ text: 'CSS' }],
                cssName: 'backgroundImage',
                cssValue,
                type: 'cssParagraph',
              },
            ],
          },
          lossPolicy: 'allow',
        })
      ).toEqual({
        data: '<p>CSS</p>',
        diagnostics: [
          {
            action: 'removed',
            code: 'html-unsafe-content',
            impact: 'lossy',
            kind: 'style',
            message:
              'Removed unsafe CSS value for "background-image" from <p>.',
            model: { path: [0], root: 'main' },
            severity: 'warning',
          },
        ],
        ok: true,
      });
    });
    expect(reports).toHaveBeenCalledTimes(2);
    reports.mockRestore();
  });

  it('derives a declared primary element and patches its nested target', () => {
    const ParagraphPlugin = definePlugin('listParagraph', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: () => ({}),
            encode: ({ content, node }) => {
              const declaredType: string = node.type;

              void declaredType;

              return { children: content, tag: 'p' };
            },
            match: [{ tag: 'p' }],
          },
        }),
    });
    const ListPlugin = definePlugin('listMapping', {
      schema: {
        properties: {
          listStart: schema.elementProperty(property.number(), {
            target: target.type('listParagraph'),
          }),
          listStyle: schema.elementProperty(property.string(), {
            target: target.type('listParagraph'),
          }),
        },
      },
      targetPlugins: [ParagraphPlugin],
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            createsElement: true,
            decode: ({ element }) => ({
              listStart:
                Number(element.parentElement?.getAttribute('start')) || 1,
              listStyle:
                element.parentElement?.tagName === 'OL' ? 'decimal' : 'disc',
            }),
            encode: ({ content, node, preserve }) => {
              preserve('listStart', 'listStyle');

              return {
                attributes:
                  node.listStart && node.listStart !== 1
                    ? { start: node.listStart }
                    : undefined,
                children: [
                  {
                    children: content,
                    patchTarget: true,
                    tag: 'li',
                  },
                ],
                tag: node.listStyle === 'decimal' ? 'ol' : 'ul',
              };
            },
            match: [{ tag: 'li' }],
            priority: 20,
          },
        }),
    });
    const IndentPlugin = definePlugin('indentMapping', {
      schema: {
        properties: {
          indent: schema.elementProperty(property.number(), {
            target: target.type('listParagraph'),
          }),
        },
      },
      targetPlugins: [ParagraphPlugin],
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: ({ element }) =>
              Number.parseInt(element.style.marginLeft, 10) / 12 || undefined,
            encode: ({ value }) => ({
              style: { marginLeft: `${value * 12}px` },
            }),
            match: [{ style: { marginLeft: '*' } }],
          },
        }),
    });
    const editor = createEditor({
      plugins: [IndentPlugin, ListPlugin, ParagraphPlugin],
    });
    const input = new DataTransfer();

    input.setData(
      'text/html',
      '<ol start="3"><li style="margin-left: 24px">Item</li></ol>'
    );

    expect(editor.api.dom.clipboard.insertData(input)).toBe(true);
    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'Item' }],
        indent: 2,
        listStart: 3,
        listStyle: 'decimal',
        type: 'listParagraph',
      },
    ]);

    const output = new DataTransfer();

    expect(
      writeDataTransferFragment(
        editor,
        output,
        ContentSlice.closed(editor.read.children())
      )
    ).toContain('text/html');

    const { body } = new DOMParser().parseFromString(
      output.getData('text/html'),
      'text/html'
    );
    const list = body.querySelector('ol');
    const item = body.querySelector('ol > li') as HTMLElement | null;

    expect(list?.getAttribute('start')).toBe('3');
    expect(item?.style.marginLeft).toBe('24px');
    expect(item?.textContent).toBe('Item');
  });

  it('does not skip a missing configured primary element target', () => {
    const ParagraphPlugin = definePlugin('configuredPrimary', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const ListPlugin = definePlugin('missingPrimaryList', {
      schema: {
        properties: {
          listStyle: schema.elementProperty(property.string(), {
            target: target.type('configuredPrimary'),
          }),
        },
      },
      targetPlugins: ['missing-primary', ParagraphPlugin],
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            createsElement: true,
            decode: () => ({ listStyle: 'disc' }),
            decodeOnly: true,
            match: [{ tag: 'li' }],
          },
        }),
    });

    expect(() =>
      createEditor({ plugins: [ListPlugin, ParagraphPlugin] })
    ).toThrow('createsElement requires an installed element target');
  });

  it('orders composable wrappers independently of plugin array order', () => {
    const ParagraphPlugin = definePlugin('htmlParagraphCase4', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const AlphaPlugin = definePlugin('alphaMark', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => true,
            encode: () => ({ tag: 'strong' }),
            match: [{ tag: 'strong' }],
          },
        }),
    });
    const ZuluPlugin = definePlugin('zuluMark', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => true,
            encode: () => ({ tag: 'em' }),
            match: [{ tag: 'em' }],
          },
        }),
    });
    const outputs = [
      [AlphaPlugin, ZuluPlugin, ParagraphPlugin],
      [ZuluPlugin, ParagraphPlugin, AlphaPlugin],
    ].map((plugins) => {
      const editor = createEditor({ plugins });
      const output = new DataTransfer();

      writeDataTransferFragment(
        editor,
        output,
        ContentSlice.closed([
          {
            children: [{ alphaMark: true, text: 'ordered', zuluMark: true }],
            type: 'htmlParagraphCase4',
          },
        ])
      );

      return output.getData('text/html');
    });

    expect(outputs).toEqual([
      '<p><strong><em>ordered</em></strong></p>',
      '<p><strong><em>ordered</em></strong></p>',
    ]);
  });

  it('keeps generated plugin permutations and mark sets deterministic', () => {
    const ParagraphPlugin = definePlugin('htmlParagraphCase5', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const mark = (name: string, tag: string) =>
      definePlugin(name, {
        schema: {
          mark: property.boolean({ default: false, omitDefault: true }),
        },
        formats: ({ defineFormats }) =>
          defineFormats({
            html: {
              decode: () => true,
              encode: ({ value }) => (value ? { tag } : null),
              match: [{ tag }],
            },
          }),
      });
    const AlphaPlugin = mark('alphaGeneratedMark', 'strong');
    const BetaPlugin = mark('betaGeneratedMark', 'em');
    const GammaPlugin = mark('gammaGeneratedMark', 'u');
    const byName = new Map(
      [ParagraphPlugin, AlphaPlugin, BetaPlugin, GammaPlugin].map((plugin) => [
        plugin.name,
        plugin,
      ])
    );
    const names = [...byName.keys()];
    const encode = (order: readonly string[], marks: readonly boolean[]) => {
      const editor = createEditor({
        plugins: order.map((name) => byName.get(name)!),
      });
      const output = new DataTransfer();
      const text = {
        ...(marks[0] ? { alphaGeneratedMark: true } : {}),
        ...(marks[1] ? { betaGeneratedMark: true } : {}),
        ...(marks[2] ? { gammaGeneratedMark: true } : {}),
        text: 'generated',
      };

      writeDataTransferFragment(
        editor,
        output,
        ContentSlice.closed([{ children: [text], type: 'htmlParagraphCase5' }])
      );

      return output.getData('text/html');
    };

    fc.assert(
      fc.property(
        fc.shuffledSubarray(names, {
          maxLength: names.length,
          minLength: names.length,
        }),
        fc.tuple(fc.boolean(), fc.boolean(), fc.boolean()),
        (order, marks) => {
          const wrappers = [
            marks[0] ? 'strong' : null,
            marks[1] ? 'em' : null,
            marks[2] ? 'u' : null,
          ].filter((tag): tag is string => !!tag);
          let expected = 'generated';

          wrappers.reverse().forEach((tag) => {
            expected = `<${tag}>${expected}</${tag}>`;
          });

          expect(encode(order, marks)).toBe(`<p>${expected}</p>`);
        }
      ),
      { numRuns: 16, seed: 0xc_05 }
    );
  });

  it('fuzzes escaped DOM values without mutation using replayable seed 0xc05', () => {
    const ParagraphPlugin = definePlugin('labeledParagraph', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { label: property.string() },
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: ({ element }) => ({
              label: element.getAttribute('data-label') || undefined,
            }),
            encode: ({ content, node, preserve }) => {
              preserve('label');

              return {
                attributes: { 'data-label': node.label },
                children: content,
                tag: 'p',
              };
            },
            match: [{ tag: 'p' }],
          },
        }),
    });
    const editor = createEditor({ plugins: [ParagraphPlugin] });
    const safeString = fc.string({
      maxLength: 20,
      minLength: 1,
      unit: fc.constantFrom('a', 'b', '&', '<', '>', '"', "'"),
    });

    fc.assert(
      fc.property(safeString, safeString, (label, text) => {
        const source = document.createElement('p');

        source.setAttribute('data-label', label);
        source.textContent = text;
        const before = source.outerHTML;
        const fragment = parseHtmlSliceContent(editor, source);

        expect(source.outerHTML).toBe(before);
        expect(fragment).toEqual([
          {
            children: [{ text }],
            label,
            type: 'labeledParagraph',
          },
        ]);

        const output = new DataTransfer();

        writeDataTransferFragment(
          editor,
          output,
          ContentSlice.closed(fragment!)
        );
        const reparsed = new DOMParser().parseFromString(
          output.getData('text/html'),
          'text/html'
        ).body.firstElementChild;

        expect(reparsed?.getAttribute('data-label')).toBe(label);
        expect(reparsed?.textContent).toBe(text);
      }),
      { numRuns: 32, seed: 0xc_05 }
    );
  });

  it('keeps indexed large-payload callback growth linear', () => {
    let paragraphCalls = 0;
    let unrelatedCalls = 0;
    const ParagraphPlugin = definePlugin('htmlParagraphCase6', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: () => {
              paragraphCalls += 1;

              return {};
            },
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const unrelated = Array.from({ length: 48 }, (_, index) =>
      definePlugin(`indexedUnrelated${index}`, {
        schema: {
          element: {
            content: schema.content.text({ default: 'text', min: 1 }),
          },
        },
        formats: ({ defineFormats }) =>
          defineFormats({
            html: {
              decode: () => {
                unrelatedCalls += 1;

                return {};
              },
              decodeOnly: true,
              match: [{ tag: `x-index-${index}` }],
            },
          }),
      })
    );
    const editor = createEditor({
      plugins: [ParagraphPlugin, ...unrelated],
    });
    const count = 400;
    const html = Array.from(
      { length: count },
      (_, index) => `<p>${index}</p>`
    ).join('');
    const started = performance.now();
    const fragment = parseHtmlSliceContent(editor, `<div>${html}</div>`);
    const duration = performance.now() - started;

    expect(fragment).toHaveLength(count);
    expect(paragraphCalls).toBe(count);
    expect(unrelatedCalls).toBe(0);
    expect(duration).toBeLessThan(2000);
  });

  it('rejects equal-priority overlapping element candidates', () => {
    const AlphaPlugin = definePlugin('alphaElementMapping', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => ({}),
            decodeOnly: true,
            match: [{ className: 'notice', tag: 'section' }],
          },
        }),
    });
    const ZuluPlugin = definePlugin('zuluElementMapping', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => ({}),
            decodeOnly: true,
            match: [{ className: 'callout', tag: 'section' }],
          },
        }),
    });

    expect(() => createEditor({ plugins: [ZuluPlugin, AlphaPlugin] })).toThrow(
      'equal priority and overlapping element candidates'
    );
  });

  it('delegates an exclusive decode to the next lower-priority candidate', () => {
    const ParagraphPlugin = definePlugin('htmlParagraphCase7', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const HigherPlugin = definePlugin('higherElementMapping', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    }).extend(({ defineFormats }) => ({
      formats: defineFormats({
        html: {
          decode: () => {
            throw new Error('delegate this candidate');
          },
          decodeOnly: true,
          match: [{ tag: 'section' }],
          priority: 200,
        },
      }),
    }));
    const LowerPlugin = definePlugin('lowerElementMapping', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    }).extend(({ defineFormats }) => ({
      formats: defineFormats({
        html: {
          decode: () => ({}),
          decodeOnly: true,
          match: [{ tag: 'section' }],
          priority: 100,
        },
      }),
    }));
    const editor = createEditor({
      plugins: [LowerPlugin, HigherPlugin, ParagraphPlugin],
    });
    const report = spyOn(console, 'error').mockImplementation(() => {});
    const input = new DataTransfer();

    input.setData('text/html', '<section>Fallback</section>');

    expect(editor.api.dom.clipboard.insertData(input)).toBe(true);
    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'Fallback' }],
        type: 'lowerElementMapping',
      },
    ]);
    expect(report).toHaveBeenCalled();
    report.mockRestore();
  });

  it('skips lower property decoders after every applicable claim wins', () => {
    let lowerMarkCalls = 0;
    let lowerPropertyCalls = 0;
    const reports: unknown[] = [];
    const ParagraphPlugin = definePlugin('htmlParagraphCase8', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const BoldPlugin = definePlugin('winnerBold', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => true,
            decodeOnly: true,
            match: [{ tag: 'strong' }],
            priority: 20,
          },
        }),
    }).extend(({ defineFormats }) => ({
      formats: defineFormats({
        html: {
          decode: () => {
            lowerMarkCalls += 1;
            throw new Error('resolved mark decoder must not run');
          },
          decodeOnly: true,
          match: [{ tag: 'strong' }],
          priority: 10,
        },
      }),
    }));
    const AlignPlugin = definePlugin('winnerAlign', {
      schema: {
        properties: {
          align: schema.elementProperty(property.string(), {
            target: target.type('htmlParagraphCase8'),
          }),
        },
      },
      targetPlugins: [ParagraphPlugin],
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => 'center',
            decodeOnly: true,
            match: [{ attributes: { 'data-align': true } }],
            priority: 20,
          },
        }),
    }).extend(({ defineFormats }) => ({
      formats: defineFormats({
        html: {
          decode: () => {
            lowerPropertyCalls += 1;
            throw new Error('resolved element-property decoder must not run');
          },
          decodeOnly: true,
          match: [{ attributes: { 'data-align': true } }],
          priority: 10,
        },
      }),
    }));
    const editor = createEditorWithEditor(
      createPliteEditor({
        lifecycleErrorSink: (error) => reports.push(error),
      }),
      {
        plugins: [AlignPlugin, BoldPlugin, ParagraphPlugin],
      }
    );

    expect(
      parseHtmlSliceContent(
        editor,
        '<p data-align="center"><strong>Winner</strong></p>'
      )
    ).toEqual([
      {
        align: 'center',
        children: [{ text: 'Winner', winnerBold: true }],
        type: 'htmlParagraphCase8',
      },
    ]);
    expect(lowerMarkCalls).toBe(0);
    expect(lowerPropertyCalls).toBe(0);
    expect(reports).toEqual([]);
  });

  it('delegates an invalid exclusive decode result without leaking fields', () => {
    const ParagraphPlugin = definePlugin('htmlParagraphCase9', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const HigherPlugin = definePlugin('invalidHigherElementMapping', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    }).extend(({ defineFormats }) => ({
      formats: defineFormats({
        html: {
          decode: () => ({ foreign: 'must-not-leak' }) as any,
          decodeOnly: true,
          match: [{ tag: 'section' }],
          priority: 200,
        },
      }),
    }));
    const LowerPlugin = definePlugin('validLowerElementMapping', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    }).extend(({ defineFormats }) => ({
      formats: defineFormats({
        html: {
          decode: () => ({}),
          decodeOnly: true,
          match: [{ tag: 'section' }],
          priority: 100,
        },
      }),
    }));
    const editor = createEditor({
      plugins: [LowerPlugin, HigherPlugin, ParagraphPlugin],
    });
    const report = spyOn(console, 'error').mockImplementation(() => {});
    const input = new DataTransfer();

    input.setData('text/html', '<section>Fallback</section>');

    expect(editor.api.dom.clipboard.insertData(input)).toBe(true);
    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'Fallback' }],
        type: 'validLowerElementMapping',
      },
    ]);
    expect(report).toHaveBeenCalled();
    report.mockRestore();
  });

  it('delegates schema-invalid explicit children to a lower element candidate', () => {
    const reports: unknown[] = [];
    const ParagraphPlugin = definePlugin('htmlParagraphCase10', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const HigherPlugin = definePlugin('invalidChildrenHigher', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    }).extend(({ defineFormats }) => ({
      formats: defineFormats({
        html: {
          decode: () => ({
            children: [
              {
                children: [{ text: 'invalid' }],
                type: 'undeclared-child',
              },
            ],
          }),
          decodeOnly: true,
          match: [{ tag: 'section' }],
          priority: 200,
        },
      }),
    }));
    const LowerPlugin = definePlugin('validChildrenLower', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    }).extend(({ defineFormats }) => ({
      formats: defineFormats({
        html: {
          decode: () => ({}),
          decodeOnly: true,
          match: [{ tag: 'section' }],
          priority: 100,
        },
      }),
    }));
    const editor = createEditorWithEditor(
      createPliteEditor({
        lifecycleErrorSink: (error) => reports.push(error),
      }),
      {
        plugins: [LowerPlugin, HigherPlugin, ParagraphPlugin],
      }
    );
    const input = new DataTransfer();

    input.setData('text/html', '<section>Fallback</section>');

    expect(editor.api.dom.clipboard.insertData(input)).toBe(true);
    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'Fallback' }],
        type: 'validChildrenLower',
      },
    ]);
    expect(reports).toHaveLength(1);
    expect((reports[0] as any).cause.message).toContain(
      '<section>Fallback</section>'
    );
  });

  it('throws when direct compiled decode violates its schema contract', () => {
    const reports: unknown[] = [];
    let validations = 0;
    const ParagraphPlugin = definePlugin('validatedParagraph', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: {
            unstable: property.string({
              validate: (value): value is string => {
                validations += 1;

                return typeof value === 'string' && validations === 1;
              },
              validationVersion: 1,
            }),
          },
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: () => ({ unstable: 'value' }),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const editor = createEditorWithEditor(
      createPliteEditor({
        lifecycleErrorSink: (error) => reports.push(error),
      }),
      {
        plugins: [ParagraphPlugin],
      }
    );

    expect(() => parseHtmlSliceContent(editor, '<p>Invalid</p>')).toThrow();
    expect(reports).toHaveLength(0);
  });

  it('reports one contextual lifecycle error for an encode callback failure', () => {
    const reports: unknown[] = [];
    const ParagraphPlugin = definePlugin('htmlParagraphCase11', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: () => ({}),
            encode: () => {
              throw new Error('encoder failed');
            },
            match: [{ tag: 'p' }],
          },
        }),
    });
    const editor = createEditorWithEditor(
      createPliteEditor({
        lifecycleErrorSink: (error) => reports.push(error),
      }),
      {
        plugins: [ParagraphPlugin],
      }
    );
    const output = new DataTransfer();

    expect(
      writeDataTransferFragment(
        editor,
        output,
        ContentSlice.closed([
          { children: [{ text: 'context' }], type: 'htmlParagraphCase11' },
        ])
      )
    ).not.toContain('text/html');
    expect(reports).toHaveLength(1);
    expect(reports[0]).toMatchObject({
      key: 'plate:htmlParagraphCase11:html:encode',
      phase: 'encode',
    });
    expect((reports[0] as any).cause.message).toContain(
      'node "htmlParagraphCase11", claims "element:htmlParagraphCase11"'
    );
  });

  it('allows safe iframes and raster data images but rejects active content', () => {
    const reports: unknown[] = [];
    const ParagraphPlugin = definePlugin('htmlParagraphCase12', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const FramePlugin = definePlugin('safeFrame', {
      schema: {
        element: {
          properties: {
            onload: property.string(),
            src: property.string(),
            srcdoc: property.string(),
          },
          void: 'block',
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: ({ element }) =>
              Object.fromEntries(
                ['onload', 'src', 'srcdoc'].flatMap((name) => {
                  const value = element.getAttribute(name);

                  return value ? [[name, value]] : [];
                })
              ),
            encode: ({ node, preserve }) => {
              preserve('onload', 'src', 'srcdoc');

              return {
                attributes: {
                  ...(node.onload ? { onload: node.onload } : {}),
                  ...(node.src ? { src: node.src } : {}),
                  ...(node.srcdoc ? { srcdoc: node.srcdoc } : {}),
                },
                tag: 'iframe',
              };
            },
            match: [{ tag: 'iframe' }],
          },
        }),
    });
    const ImagePlugin = definePlugin('safeImage', {
      schema: {
        element: {
          properties: { src: property.string() },
          void: 'block',
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: ({ element }) => ({
              src: element.getAttribute('src') || undefined,
            }),
            encode: ({ node, preserve }) => {
              preserve('src');

              return { attributes: { src: node.src }, tag: 'img' };
            },
            match: [{ tag: 'img' }],
          },
        }),
    });
    const BaseUrlPlugin = definePlugin('baseUrl', {
      schema: {
        element: {
          properties: { href: property.string() },
          void: 'block',
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: ({ element }) => ({
              href: element.getAttribute('href') || undefined,
            }),
            encode: ({ node, preserve }) => {
              preserve('href');

              return { attributes: { href: node.href }, tag: 'base' };
            },
            match: [{ tag: 'base' }],
          },
        }),
    });
    const editor = createEditorWithEditor(
      createPliteEditor({
        lifecycleErrorSink: (error) => reports.push(error),
      }),
      {
        plugins: [BaseUrlPlugin, FramePlugin, ImagePlugin, ParagraphPlugin],
      }
    );
    const serialize = (node: any) => {
      const output = new DataTransfer();
      const formats = writeDataTransferFragment(
        editor,
        output,
        ContentSlice.closed([node])
      );

      return { formats, html: output.getData('text/html') };
    };
    const safeFrame = serialize({
      children: [{ text: '' }],
      src: 'https://example.com/embed',
      type: 'safeFrame',
    });
    const safeImage = serialize({
      children: [{ text: '' }],
      src: 'data:image/png;base64,iVBORw0KGgo=',
      type: 'safeImage',
    });

    expect(reports).toEqual([]);
    expect(safeFrame.formats).toContain('text/html');
    expect(safeFrame.html).toBe(
      '<iframe src="https://example.com/embed"></iframe>'
    );
    expect(safeImage.formats).toContain('text/html');
    expect(safeImage.html).toBe(
      '<img src="data:image/png;base64,iVBORw0KGgo=">'
    );
    [
      {
        children: [{ text: '' }],
        src: 'java\nscript:alert(1)',
        type: 'safeFrame',
      },
      {
        children: [{ text: '' }],
        src: 'javascript:alert(1)',
        type: 'safeFrame',
      },
      {
        children: [{ text: '' }],
        srcdoc: '<script>alert(1)</script>',
        type: 'safeFrame',
      },
      {
        children: [{ text: '' }],
        onload: 'alert(1)',
        type: 'safeFrame',
      },
      {
        children: [{ text: '' }],
        src: 'data:image/svg+xml;base64,PHN2Zz4=',
        type: 'safeImage',
      },
      {
        children: [{ text: '' }],
        href: 'https://attacker.example/',
        type: 'baseUrl',
      },
    ].forEach((node) => {
      const result = serialize(node);

      expect(result.formats).not.toContain('text/html');
      expect(result.html).toBe('');
    });
    expect(
      editor.api.html.parseSlice(
        '<iframe src="java&#10;script:alert(1)"></iframe>'
      )
    ).toMatchObject({
      diagnostics: [
        {
          code: 'html-unsafe-content',
          impact: 'lossless',
          kind: 'url',
          message: 'Removed unsafe HTML attribute "src" from <iframe>.',
          severity: 'warning',
        },
      ],
      ok: true,
      slice: { content: [{ children: [{ text: '' }], type: 'safeFrame' }] },
    });
    expect(
      parseHtmlSliceContent(
        editor,
        '<img src="data:image/png;base64,iVBORw0KGgo=">'
      )
    ).toEqual([
      {
        children: [{ text: '' }],
        src: 'data:image/png;base64,iVBORw0KGgo=',
        type: 'safeImage',
      },
    ]);
    expect(
      parseHtmlSliceContent(editor, '<base href="https://attacker.example/">')
    ).toEqual([]);
    // Unsafe names are mapping bugs; unsafe values are removed without one.
    expect(reports).toHaveLength(3);
  });

  it('aborts the whole encode on conflicting normalized patch writes', () => {
    const report = spyOn(console, 'error').mockImplementation(() => {});
    const ParagraphPlugin = definePlugin('htmlParagraphCase13', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const ColorPlugin = definePlugin('colorMapping', {
      schema: {
        properties: {
          color: schema.elementProperty(property.string(), {
            target: target.type('htmlParagraphCase13'),
          }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => 'red',
            encode: ({ value }) => ({ style: { color: value } }),
            match: [{ attributes: { 'data-color': true } }],
          },
        }),
    });
    const TonePlugin = definePlugin('toneMapping', {
      schema: {
        properties: {
          tone: schema.elementProperty(property.string(), {
            target: target.type('htmlParagraphCase13'),
          }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => 'blue',
            encode: ({ value }) => ({ style: { color: value } }),
            match: [{ attributes: { 'data-tone': true } }],
          },
        }),
    });
    const editor = createEditor({
      plugins: [TonePlugin, ParagraphPlugin, ColorPlugin],
    });
    const output = new DataTransfer();
    const formats = writeDataTransferFragment(
      editor,
      output,
      ContentSlice.closed([
        {
          children: [{ text: 'conflict' }],
          color: 'red',
          tone: 'blue',
          type: 'htmlParagraphCase13',
        },
      ])
    );

    expect(formats).not.toContain('text/html');
    expect(output.getData('text/html')).toBe('');
    expect(report).toHaveBeenCalled();
    report.mockRestore();
  });

  it('aborts encode when structural and patch specs use both style channels', () => {
    const report = spyOn(console, 'error').mockImplementation(() => {});
    const ParagraphPlugin = definePlugin('htmlParagraphCase14', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({
              attributes: { style: 'color: red' },
              children: content,
              tag: 'p',
            }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const TonePlugin = definePlugin('toneStyleChannel', {
      schema: {
        properties: {
          tone: schema.elementProperty(property.string(), {
            target: target.type('htmlParagraphCase14'),
          }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => 'blue',
            encode: ({ value }) => ({ style: { color: value } }),
            match: [{ attributes: { 'data-tone': true } }],
          },
        }),
    });
    const editor = createEditor({
      plugins: [TonePlugin, ParagraphPlugin],
    });
    const output = new DataTransfer();

    expect(
      writeDataTransferFragment(
        editor,
        output,
        ContentSlice.closed([
          {
            children: [{ text: 'conflict' }],
            tone: 'blue',
            type: 'htmlParagraphCase14',
          },
        ])
      )
    ).not.toContain('text/html');
    expect(output.getData('text/html')).toBe('');
    expect(report).toHaveBeenCalled();
    report.mockRestore();
  });

  it('rejects cyclic specs without writing partial HTML', () => {
    const report = spyOn(console, 'error').mockImplementation(() => {});
    const ParagraphPlugin = definePlugin('htmlParagraphCase15', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: () => ({}),
            encode: () => {
              const spec: any = { tag: 'p' };

              spec.children = [spec];

              return spec;
            },
            match: [{ tag: 'p' }],
          },
        }),
    });
    const editor = createEditor({ plugins: [ParagraphPlugin] });
    const output = new DataTransfer();
    const formats = writeDataTransferFragment(
      editor,
      output,
      ContentSlice.closed([
        { children: [{ text: 'cycle' }], type: 'htmlParagraphCase15' },
      ])
    );

    expect(formats).not.toContain('text/html');
    expect(output.getData('text/html')).toBe('');
    expect(report).toHaveBeenCalled();
    report.mockRestore();
  });

  it('rejects duplicate patch targets without writing partial HTML', () => {
    const report = spyOn(console, 'error').mockImplementation(() => {});
    const ParagraphPlugin = definePlugin('htmlParagraphCase16', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({
              children: [
                { children: content, patchTarget: true, tag: 'span' },
                {
                  children: [{ text: 'duplicate' }],
                  patchTarget: true,
                  tag: 'span',
                },
              ],
              tag: 'div',
            }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const editor = createEditor({ plugins: [ParagraphPlugin] });
    const output = new DataTransfer();
    const formats = writeDataTransferFragment(
      editor,
      output,
      ContentSlice.closed([
        { children: [{ text: 'targets' }], type: 'htmlParagraphCase16' },
      ])
    );

    expect(formats).not.toContain('text/html');
    expect(output.getData('text/html')).toBe('');
    expect(report).toHaveBeenCalled();
    report.mockRestore();
  });

  it('omits metadata and aborts unmapped content properties', () => {
    const ParagraphPlugin = definePlugin('htmlParagraphCase17', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const UnmappedPlugin = definePlugin('unmappedProperty', {
      schema: {
        properties: {
          unmapped: schema.elementProperty(property.string(), {
            target: target.type('htmlParagraphCase17'),
          }),
        },
      },
    });
    const editor = createEditor({
      plugins: [UnmappedPlugin, ParagraphPlugin],
    });
    const metadataOutput = new DataTransfer();

    expect(
      writeDataTransferFragment(
        editor,
        metadataOutput,
        ContentSlice.closed([
          {
            children: [{ text: 'metadata' }],
            id: 'local-only',
            type: 'htmlParagraphCase17',
          },
        ])
      )
    ).toContain('text/html');
    expect(metadataOutput.getData('text/html')).toBe('<p>metadata</p>');

    const unsupportedOutput = new DataTransfer();

    expect(
      writeDataTransferFragment(
        editor,
        unsupportedOutput,
        ContentSlice.closed([
          {
            children: [{ text: 'unmapped' }],
            unmapped: 'must-not-drop',
            type: 'htmlParagraphCase17',
          },
        ])
      )
    ).not.toContain('text/html');
    expect(unsupportedOutput.getData('text/html')).toBe('');
  });

  it('claims only the properties an encoder represents in retained output', () => {
    const NotePlugin = definePlugin('htmlClaimNote', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: {
            label: property.string(),
            tone: property.string(),
          },
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => ({}),
            encode: ({ content, node, preserve }) => {
              // Reading `tone` does not claim it.
              void node.tone;
              preserve('label');

              return {
                attributes: { 'data-label': node.label },
                children: content,
                tag: 'aside',
              };
            },
            match: [{ tag: 'aside' }],
          },
        }),
    });
    const ColorPlugin = definePlugin('htmlClaimColor', {
      schema: {
        properties: {
          color: schema.elementProperty(property.string(), {
            target: target.type('htmlClaimNote'),
          }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => undefined,
            // A patch that writes nothing represents nothing.
            encode: ({ value }) => ({
              style: { color: value === 'none' ? undefined : value },
            }),
            match: [{ style: { color: '*' } }],
          },
        }),
    });
    const SpacingPlugin = definePlugin('htmlClaimSpacing', {
      schema: {
        properties: {
          gap: schema.elementProperty(property.number(), {
            target: target.type('htmlClaimNote'),
          }),
          pad: schema.elementProperty(property.number(), {
            target: target.type('htmlClaimNote'),
          }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => ({}),
            encode: ({ preserve, values }) => {
              preserve('gap', 'pad');

              return values.gap === 0
                ? null
                : { attributes: { 'data-gap': values.gap } };
            },
            match: [{ attributes: { 'data-gap': true } }],
          },
        }),
    });
    const editor = createEditor({
      plugins: [ColorPlugin, NotePlugin, SpacingPlugin],
    });
    const serialize = (note: Record<string, unknown>) =>
      editor.api.html.serialize({
        document: {
          children: [
            { children: [{ text: 'x' }], type: 'htmlClaimNote', ...note },
          ],
        },
        lossPolicy: 'allow',
      });
    const omitted = (result: ReturnType<typeof serialize>) =>
      result.diagnostics.map((diagnostic) =>
        diagnostic.code === 'html-unsupported-content'
          ? `${diagnostic.severity}:${diagnostic.model?.property}`
          : diagnostic.code
      );

    expect(serialize({ label: 'a', tone: 'loud' })).toMatchObject({
      data: '<aside data-label="a">x</aside>',
      diagnostics: [
        {
          action: 'dropped',
          code: 'html-unsupported-content',
          kind: 'attribute',
          message:
            'No HTML mapping represents content property "tone" on "htmlClaimNote"; it was omitted.',
          model: { path: [0], property: 'tone', root: 'main' },
          phase: 'serialize',
          severity: 'warning',
        },
      ],
      ok: true,
    });
    // Each lost property reports on its own, under every loss policy.
    expect(
      omitted(
        editor.api.html.serialize({
          document: {
            children: [
              {
                children: [{ text: 'x' }],
                color: 'none',
                gap: 0,
                pad: 1,
                tone: 'loud',
                type: 'htmlClaimNote',
              },
            ],
          },
        })
      )
    ).toEqual(['warning:color', 'warning:gap', 'warning:pad', 'warning:tone']);
    expect(omitted(serialize({ color: 'red', gap: 2, pad: 1 }))).toEqual([]);
  });

  it('rejects a claim on a property its mapping does not own', () => {
    const reports = spyOn(console, 'error').mockImplementation(() => {});
    const NotePlugin = definePlugin('htmlClaimForeign', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { label: property.string() },
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => ({}),
            encode: ({ content, preserve }) => {
              // @ts-expect-error A mapping claims only its target's properties.
              preserve('indent');

              return { children: content, tag: 'aside' };
            },
            match: [{ tag: 'aside' }],
          },
        }),
    });
    const editor = createEditor({ plugins: [NotePlugin] });

    expect(() =>
      editor.api.html.serialize({
        document: {
          children: [{ children: [{ text: 'x' }], type: 'htmlClaimForeign' }],
        },
      })
    ).toThrow(
      'Plate HTML mapping "htmlClaimForeign" cannot preserve "indent": it is not a property of its target.'
    );
    reports.mockRestore();
  });

  it('aborts encode when a decode-only property claim is present', () => {
    const ParagraphPlugin = definePlugin('htmlParagraphCase18', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const DecodeOnlyPlugin = definePlugin('decodeOnlyProperty', {
      schema: {
        properties: {
          tone: schema.elementProperty(property.string(), {
            target: target.type('htmlParagraphCase18'),
          }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => 'quiet',
            decodeOnly: true,
            match: [{ attributes: { 'data-tone': true } }],
          },
        }),
    });
    const editor = createEditor({
      plugins: [DecodeOnlyPlugin, ParagraphPlugin],
    });
    const output = new DataTransfer();

    expect(
      writeDataTransferFragment(
        editor,
        output,
        ContentSlice.closed([
          {
            children: [{ text: 'claimed' }],
            tone: 'quiet',
            type: 'htmlParagraphCase18',
          },
        ])
      )
    ).not.toContain('text/html');
    expect(output.getData('text/html')).toBe('');
  });

  it('keeps JSON null as an owned property value', () => {
    const ParagraphPlugin = definePlugin('htmlParagraphCase19', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const NullablePlugin = definePlugin('nullableMapping', {
      schema: {
        properties: {
          nullable: schema.elementProperty(property.json(), {
            target: target.type('htmlParagraphCase19'),
          }),
        },
      },
      formats: ({ defineFormats }) =>
        defineFormats({
          html: {
            decode: () => null,
            encode: ({ value }) =>
              value === null ? { attributes: { 'data-null': true } } : null,
            match: [{ attributes: { 'data-null': true } }],
          },
        }),
    });
    const editor = createEditor({
      plugins: [NullablePlugin, ParagraphPlugin],
    });
    const input = new DataTransfer();

    input.setData('text/html', '<p data-null>Null</p>');

    expect(editor.api.dom.clipboard.insertData(input)).toBe(true);
    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'Null' }],
        nullable: null,
        type: 'htmlParagraphCase19',
      },
    ]);

    const output = new DataTransfer();

    expect(
      writeDataTransferFragment(
        editor,
        output,
        ContentSlice.closed(editor.read.children())
      )
    ).toContain('text/html');
    expect(
      new DOMParser()
        .parseFromString(output.getData('text/html'), 'text/html')
        .body.querySelector('p')
        ?.hasAttribute('data-null')
    ).toBe(true);
  });

  it('rejects equal-priority foreign encoders for one property claim', () => {
    const AlignPlugin = definePlugin('foreignAlignTarget', {
      schema: {
        properties: {
          align: schema.elementProperty(property.string(), {
            target: target.type('paragraph'),
          }),
        },
      },
    });
    const AlphaPlugin = definePlugin('alphaForeignAlign', {
      formats: ({ defineFormats }) =>
        defineFormats(AlignPlugin, {
          html: {
            decode: () => 'left',
            encode: () => ({ attributes: { 'data-align': 'left' } }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const ZuluPlugin = definePlugin('zuluForeignAlign', {
      formats: ({ defineFormats }) =>
        defineFormats(AlignPlugin, {
          html: {
            decode: () => 'right',
            encode: () => ({ attributes: { 'data-align': 'right' } }),
            match: [{ tag: 'div' }],
          },
        }),
    });

    expect(() =>
      createEditor({
        plugins: [ZuluPlugin, AlignPlugin, AlphaPlugin],
      })
    ).toThrow('competing encode claim "property:');
  });

  it('rejects same-owner wrapper encoders with an unresolved ordering tie', () => {
    const AlphaMark = definePlugin('alphaForeignMark', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
    });
    const BetaMark = definePlugin('betaForeignMark', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
    });
    const OwnerPlugin = definePlugin('tiedForeignMarkOwner', {
      formats: ({ defineFormats }) =>
        defineFormats(AlphaMark, {
          html: {
            decode: () => true,
            encode: () => ({ tag: 'strong' }),
            match: [{ tag: 'strong' }],
          },
        }),
    }).extend(({ defineFormats }) => ({
      formats: defineFormats(BetaMark, {
        html: {
          decode: () => true,
          encode: () => ({ tag: 'em' }),
          match: [{ tag: 'em' }],
        },
      }),
    }));

    expect(() =>
      createEditor({ plugins: [OwnerPlugin, AlphaMark, BetaMark] })
    ).toThrow('unresolved wrapper ordering');
  });

  it('resolves a foreign target name to its installed declared type', () => {
    const TargetPlugin = definePlugin('foreignParagraph', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { variant: property.string() },
        },
      },
    });
    const ForeignOwner = definePlugin('foreignElementOwner', {
      formats: ({ defineFormats }) =>
        defineFormats(TargetPlugin, {
          html: {
            decode: ({ element }) => ({ variant: element.dataset.variant }),
            encode: ({ content, node, preserve }) => {
              const declaredType: string = node.type;

              void declaredType;
              preserve('variant');

              return {
                attributes: { 'data-variant': node.variant },
                children: content,
                tag: 'aside',
              };
            },
            match: [{ tag: 'aside' }],
          },
        }),
    });
    const editor = createEditor({
      plugins: [ForeignOwner, TargetPlugin],
    });
    const input = new DataTransfer();

    input.setData('text/html', '<aside data-variant="note">Foreign</aside>');

    expect(editor.api.dom.clipboard.insertData(input)).toBe(true);
    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'Foreign' }],
        type: 'foreignParagraph',
        variant: 'note',
      },
    ]);

    const output = new DataTransfer();

    expect(
      writeDataTransferFragment(
        editor,
        output,
        ContentSlice.closed(editor.read.children())
      )
    ).toContain('text/html');
    expect(output.getData('text/html')).toBe(
      '<aside data-variant="note">Foreign</aside>'
    );
  });

  it('rejects an unrelated same-name foreign schema family', () => {
    const AuthoredTarget = definePlugin('foreignFamilyTarget', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { variant: property.string() },
        },
      },
    });
    const InstalledTarget = definePlugin(AuthoredTarget.name, {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { count: property.number() },
        },
      },
    });
    const ForeignOwner = definePlugin('foreignFamilyOwner', {
      formats: ({ defineFormats }) =>
        defineFormats(AuthoredTarget, {
          html: {
            decode: ({ element }) => ({ variant: element.dataset.variant }),
            encode: ({ content, node }) => ({
              attributes: { 'data-variant': node.variant },
              children: content,
              tag: 'aside',
            }),
            match: [{ tag: 'aside' }],
          },
        }),
    });

    expect(() =>
      createEditor({ plugins: [ForeignOwner, InstalledTarget] })
    ).toThrow('belongs to a different schema family');
  });

  it('keeps foreign family metadata distinct when one callback is reused', () => {
    const AlphaMark = definePlugin('reusedAlphaMark', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
    });
    const BetaMark = definePlugin('reusedBetaMark', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
    });
    const sharedDecoder = () => ({
      decode: () => true,
      decodeOnly: true as const,
      match: [{ tag: 'strong' }] as const,
    });
    const Owner = definePlugin('reusedForeignOwner', {
      formats: ({ defineFormats }) =>
        defineFormats(AlphaMark, {
          html: {
            ...sharedDecoder(),
          },
        }),
    }).extend(({ defineFormats }) => ({
      formats: defineFormats(BetaMark, {
        html: {
          ...sharedDecoder(),
        },
      }),
    }));

    expect(() =>
      createEditor({ plugins: [Owner, AlphaMark, BetaMark] })
    ).not.toThrow();
  });
});
