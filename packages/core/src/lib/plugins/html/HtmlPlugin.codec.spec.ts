import { describe, expect, it, spyOn } from 'bun:test';

import {
  ContentSlice,
  createEditor,
  property,
  schema,
  target,
} from '@platejs/plite';
import { writeHostFragmentData } from '@platejs/plite-dom';
import fc from 'fast-check';

import { createBaseEditor } from '../../editor';
import { defineBasePlugin } from '../../plugin';
import { BaseParagraphPlugin } from '../paragraph';

describe('compilePlateHtmlCodec', () => {
  it('publishes HTML through the host codec boundary', () => {
    const editor = createBaseEditor();
    const output = new DataTransfer();
    const formats = writeHostFragmentData(
      editor,
      output,
      ContentSlice.closed(editor.read.children())
    );

    expect(formats.filter((format) => format === 'text/html')).toEqual([
      'text/html',
    ]);
    expect(output.getData('text/html')).toBe('<p></p>');
  });

  it('decodes and encodes one inferred element rule', () => {
    const ParagraphPlugin = defineBasePlugin('customParagraph', {
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            priority: 1,
            decode: ({ element }) => ({
              align: element.dataset.align || undefined,
            }),
            encode: ({ content, node }) => ({
              attributes: node.align ? { 'data-align': node.align } : undefined,
              children: content,
              tag: 'p',
            }),
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
    const editor = createBaseEditor({
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
      editor.api.html.deserialize({
        element: '<p data-align="right">Direct</p>',
      })
    ).toEqual([
      {
        align: 'right',
        children: [{ text: 'Direct' }],
        type: 'customParagraph',
      },
    ]);

    const output = new DataTransfer();
    const formats = writeHostFragmentData(
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
    const editor = createBaseEditor();

    expect(
      editor.api.html.deserialize({
        element:
          '<p>A <span>line</span><br>break <a href="#">right here</a></p>',
      })
    ).toEqual([
      {
        children: [{ text: 'A line\nbreak right here' }],
        type: 'paragraph',
      },
    ]);
  });

  it('drops host spacer artifacts instead of decoding their zero-width text', () => {
    const editor = createBaseEditor();

    expect(
      editor.api.html.deserialize({
        element:
          '<p>Before<span data-plite-spacer style="color: transparent">﻿</span>After</p>',
      })
    ).toEqual([
      {
        children: [{ text: 'BeforeAfter' }],
        type: 'paragraph',
      },
    ]);
  });

  it('fits inline content into structural containers without losing block boundaries', () => {
    const QuotePlugin = defineBasePlugin('quoteCodec', {
      schema: {
        element: {
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'blockquote' }),
            match: [{ tag: 'blockquote' }],
          },
        }),
    });
    const editor = createBaseEditor({ plugins: [QuotePlugin] });

    expect(
      editor.api.html.deserialize({
        element: '<blockquote>Direct quote</blockquote>',
      })
    ).toEqual([
      {
        children: [{ children: [{ text: 'Direct quote' }], type: 'paragraph' }],
        type: 'quoteCodec',
      },
    ]);
    expect(
      editor.api.html.deserialize({
        element:
          '<blockquote><div>First paragraph</div><div>Second paragraph</div></blockquote>',
      })
    ).toEqual([
      {
        children: [
          { children: [{ text: 'First paragraph' }], type: 'paragraph' },
          { children: [{ text: 'Second paragraph' }], type: 'paragraph' },
        ],
        type: 'quoteCodec',
      },
    ]);
  });

  it('wraps root inline HTML in the structural application root without document padding', () => {
    const SectionPlugin = defineBasePlugin('htmlApplicationSection', {
      schema: {
        element: {
          content: schema.content.element(BaseParagraphPlugin, { min: 1 }),
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [SectionPlugin],
      schema: {
        root: schema.content.element(SectionPlugin, { min: 2 }),
      },
    });

    expect(
      editor.api.html.deserialize({ element: '<span>Root text</span>' })
    ).toEqual([
      {
        children: [{ children: [{ text: 'Root text' }], type: 'paragraph' }],
        type: 'htmlApplicationSection',
      },
    ]);
  });

  it('materializes each unmatched root block with its applicable properties', () => {
    const AlignPlugin = defineBasePlugin('rootAlign', {
      schema: () => ({
        properties: {
          align: schema.elementProperty(property.string(), {
            target: target.element(BaseParagraphPlugin),
          }),
        },
      }),
      targetPlugins: [BaseParagraphPlugin],
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: ({ element }) => element.style.textAlign || undefined,
            encode: ({ value }) => ({ style: { textAlign: value } }),
            match: [{ style: { textAlign: '*' } }],
          },
        }),
    });
    const LineHeightPlugin = defineBasePlugin('rootLineHeight', {
      schema: () => ({
        properties: {
          lineHeight: schema.elementProperty(property.number(), {
            target: target.element(BaseParagraphPlugin),
          }),
        },
      }),
      targetPlugins: [BaseParagraphPlugin],
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: ({ element }) => Number(element.style.lineHeight),
            encode: ({ value }) => ({ style: { lineHeight: value } }),
            match: [{ style: { lineHeight: '*' } }],
          },
        }),
    });
    const IndentPlugin = defineBasePlugin('rootIndent', {
      schema: () => ({
        properties: {
          indent: schema.elementProperty(property.number(), {
            target: target.element(BaseParagraphPlugin),
          }),
        },
      }),
      targetPlugins: [BaseParagraphPlugin],
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: ({ element }) =>
              Number(element.style.marginLeft.replace('px', '')) / 24,
            encode: ({ value }) => ({
              style: { marginLeft: `${value * 24}px` },
            }),
            match: [{ style: { marginLeft: '*' } }],
          },
        }),
    });
    const editor = createBaseEditor({
      plugins: [AlignPlugin, IndentPlugin, LineHeightPlugin],
    });

    expect(
      editor.api.html.deserialize({
        element:
          '<div style="text-align: right; line-height: 2; margin-left: 48px">First</div><div style="text-align: center; line-height: 3; margin-left: 24px">Second</div>',
      })
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
    const CellPlugin = defineBasePlugin('tableCell', {
      schema: ({ plugins }) => ({
        element: {
          content: plugins.blockContent({
            default: BaseParagraphPlugin,
            min: 1,
          }),
        },
      }),
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'td' }),
            match: [{ tag: 'td' }],
          },
        }),
    });
    const RowPlugin = defineBasePlugin('tableRow', {
      schema: {
        element: {
          content: schema.content.element(CellPlugin, { min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'tr' }),
            match: [{ tag: 'tr' }],
          },
        }),
    });
    const TablePlugin = defineBasePlugin('table', {
      dependencies: [RowPlugin, CellPlugin],
      schema: {
        element: {
          content: schema.content.element(RowPlugin, { min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: () => ({}),
            encode: ({ content }) => ({
              children: [{ children: content, tag: 'tbody' }],
              tag: 'table',
            }),
            match: [{ tag: 'table' }],
          },
        }),
    });
    const editor = createBaseEditor({
      plugins: [TablePlugin],
    });

    expect(
      editor.api.html.deserialize({
        element:
          '<table><colgroup><col/><col/></colgroup><tbody><tr><td><p>A1</p></td><td><p>A2</p></td></tr><tr><td><p>B1</p></td><td><p>B2</p></td></tr></tbody></table>',
      })
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
    const InvalidPlugin = defineBasePlugin('invalidGenericHtml', {
      // @plate-schema-adoption-negative-codec
      codecs: () =>
        ({
          'text/html': {
            decode: () => null,
            scope: 'document',
          },
        }) as any,
    });

    expect(() => createBaseEditor({ plugins: [InvalidPlugin] })).toThrow(
      'codecs must be declared with the context-bound `defineCodecs(...)` helper'
    );
  });

  it('composes inferred mark wrappers and element-property patches', () => {
    const ParagraphPlugin = defineBasePlugin('paragraphCodec', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const BoldPlugin = defineBasePlugin('boldCodec', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: () => true,
            encode: ({ value }) => (value ? { tag: 'strong' } : null),
            match: [{ tag: ['strong', 'b'] }],
          },
        }),
    });
    const AlignPlugin = defineBasePlugin('alignCodec', {
      schema: {
        properties: {
          align: schema.elementProperty(property.string(), {
            target: target.type('paragraphCodec'),
          }),
        },
      },
      targetPlugins: [ParagraphPlugin],
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: ({ element }) => element.style.textAlign || undefined,
            encode: ({ value }) => ({ style: { textAlign: value } }),
            match: [{ style: { textAlign: '*' } }],
          },
        }),
    });
    const editor = createBaseEditor({
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
        children: [{ boldCodec: true, text: 'Hello' }],
        type: 'paragraphCodec',
      },
    ]);

    const output = new DataTransfer();

    expect(
      writeHostFragmentData(
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

  it('preserves case-sensitive CSS custom property names', () => {
    const ParagraphPlugin = defineBasePlugin('brandParagraph', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { brandColor: property.string() },
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            priority: 1,
            decode: ({ element }) => ({
              brandColor:
                element.style.getPropertyValue('--brandColor') || undefined,
            }),
            encode: ({ content, node }) => ({
              children: content,
              style: { '--brandColor': node.brandColor },
              tag: 'p',
            }),
            match: [{ style: { '--brandColor': '*' } }],
          },
        }),
    });
    const editor = createBaseEditor({ plugins: [ParagraphPlugin] });
    const fragment = editor.api.html.deserialize({
      element: '<p style="--brandColor: coral">Custom</p>',
    });
    const output = new DataTransfer();

    expect(fragment).toEqual([
      {
        brandColor: 'coral',
        children: [{ text: 'Custom' }],
        type: 'brandParagraph',
      },
    ]);
    expect(
      writeHostFragmentData(editor, output, ContentSlice.closed(fragment!))
    ).toContain('text/html');
    expect(output.getData('text/html')).toBe(
      '<p style="--brandColor: coral">Custom</p>'
    );
  });

  it('validates CSS declaration names and values before encoding', () => {
    const reports = spyOn(console, 'error').mockImplementation(() => {});
    const ParagraphPlugin = defineBasePlugin('cssParagraph', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: {
            cssName: property.string(),
            cssValue: property.string(),
          },
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            priority: 1,
            decode: () => ({}),
            encode: ({ content, node }) => ({
              children: content,
              style: { [String(node.cssName)]: node.cssValue },
              tag: 'p',
            }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const editor = createBaseEditor({ plugins: [ParagraphPlugin] });
    const serialize = (cssName: string, cssValue: string) => {
      const output = new DataTransfer();
      const formats = writeHostFragmentData(
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
      ['color', 'red; position: fixed'],
      ['color', 'red{position: fixed}'],
      ['color', 'red/* hidden */'],
      ['color', 'red\nposition: fixed'],
      ['backgroundImage', 'url("javascript:alert(1)")'],
    ].forEach(([cssName, cssValue]) => {
      const result = serialize(cssName, cssValue);

      expect(result.formats).not.toContain('text/html');
      expect(result.html).toBe('');
    });
    expect(reports).toHaveBeenCalledTimes(7);
    reports.mockRestore();
  });

  it('runs direct flat hooks exactly once around compiled traversal', () => {
    const calls: string[] = [];
    const ParagraphPlugin = defineBasePlugin('htmlParagraphCase1', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const HooksPlugin = defineBasePlugin('htmlHooks', {
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            query: () => {
              calls.push('query');

              return true;
            },
            transformData: ({ data }) => {
              calls.push('data');

              return data.replaceAll('article', 'p');
            },
            transformFragment: ({ fragment }) => {
              calls.push('fragment');

              return fragment;
            },
          },
        }),
    });
    const editor = createBaseEditor({
      plugins: [HooksPlugin, ParagraphPlugin],
    });
    const input = new DataTransfer();

    input.setData('text/html', '<article>Hello</article>');

    expect(editor.api.dom.clipboard.insertData(input)).toBe(true);
    expect(editor.read.children()).toEqual([
      { children: [{ text: 'Hello' }], type: 'htmlParagraphCase1' },
    ]);
    expect(calls).toEqual(['query', 'data', 'fragment']);
  });

  it('pipes flat hook results through plugins in order', () => {
    const calls: string[] = [];
    const createParagraph = (text: string) => ({
      children: [{ text }],
      type: 'htmlParagraphCase2' as const,
    });
    const ParagraphPlugin = defineBasePlugin('htmlParagraphCase2', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const FirstPlugin = defineBasePlugin('firstHtmlHook', {
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            transformData: ({ data }) => {
              calls.push(`first-data:${data}`);

              return data.replaceAll('article', 'section');
            },
            transformFragment: ({ fragment }) => {
              calls.push(`first-fragment:${fragment.length}`);

              return [...fragment, createParagraph('second')];
            },
          },
        }),
    });
    const SecondPlugin = defineBasePlugin('secondHtmlHook', {
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            transformData: ({ data }) => {
              calls.push(`second-data:${data}`);

              return data.replaceAll('section', 'p');
            },
            transformFragment: ({ fragment }) => {
              calls.push(`second-fragment:${fragment.length}`);

              return fragment.map((node, index) =>
                index === 0 ? createParagraph('first-updated') : node
              );
            },
          },
        }),
    });
    const editor = createBaseEditor({
      plugins: [FirstPlugin, SecondPlugin, ParagraphPlugin],
    });
    const input = new DataTransfer();

    input.setData('text/html', '<article>Hello</article>');

    expect(editor.api.dom.clipboard.insertData(input)).toBe(true);
    expect(editor.read.children()).toEqual([
      createParagraph('first-updated'),
      createParagraph('second'),
    ]);
    expect(calls).toEqual([
      'first-data:<article>Hello</article>',
      'second-data:<section>Hello</section>',
      'first-fragment:1',
      'second-fragment:2',
    ]);
  });

  it('stops before flat transforms and node callbacks when query rejects', () => {
    const calls: string[] = [];
    const ParagraphPlugin = defineBasePlugin('htmlParagraphCase3', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            priority: 1,
            decode: () => {
              calls.push('decode');

              return {};
            },
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const HooksPlugin = defineBasePlugin('rejectHtml', {
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            query: () => {
              calls.push('query');

              return false;
            },
            transformData: ({ data }) => {
              calls.push('data');

              return data;
            },
            transformFragment: ({ fragment }) => {
              calls.push('fragment');

              return fragment;
            },
          },
        }),
    });
    const editor = createBaseEditor({
      plugins: [HooksPlugin, ParagraphPlugin],
    });
    const input = new DataTransfer();

    input.setData('text/html', '<p>Rejected</p>');

    expect(editor.api.dom.clipboard.insertData(input)).toBe(false);
    expect(calls).toEqual(['query']);
  });

  it('derives a declared primary element and patches its nested target', () => {
    const ParagraphPlugin = defineBasePlugin('listParagraph', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
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
    const ListPlugin = defineBasePlugin('listCodec', {
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
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            createsElement: true,
            decode: ({ element }) => ({
              listStart:
                Number(element.parentElement?.getAttribute('start')) || 1,
              listStyle:
                element.parentElement?.tagName === 'OL' ? 'decimal' : 'disc',
            }),
            encode: ({ content, node }) => ({
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
            }),
            match: [{ tag: 'li' }],
            priority: 20,
          },
        }),
    });
    const IndentPlugin = defineBasePlugin('indentCodec', {
      schema: {
        properties: {
          indent: schema.elementProperty(property.number(), {
            target: target.type('listParagraph'),
          }),
        },
      },
      targetPlugins: [ParagraphPlugin],
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: ({ element }) =>
              Number.parseInt(element.style.marginLeft, 10) / 12 || undefined,
            encode: ({ value }) => ({
              style: { marginLeft: `${value * 12}px` },
            }),
            match: [{ style: { marginLeft: '*' } }],
          },
        }),
    });
    const editor = createBaseEditor({
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
      writeHostFragmentData(
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
    const ParagraphPlugin = defineBasePlugin('configuredPrimary', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const ListPlugin = defineBasePlugin('missingPrimaryList', {
      schema: {
        properties: {
          listStyle: schema.elementProperty(property.string(), {
            target: target.type('configuredPrimary'),
          }),
        },
      },
      targetPlugins: ['missing-primary', ParagraphPlugin],
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            createsElement: true,
            decode: () => ({ listStyle: 'disc' }),
            decodeOnly: true,
            match: [{ tag: 'li' }],
          },
        }),
    });

    expect(() =>
      createBaseEditor({ plugins: [ListPlugin, ParagraphPlugin] })
    ).toThrow('createsElement requires installed element targetPlugins[0]');
  });

  it('orders composable wrappers independently of plugin array order', () => {
    const ParagraphPlugin = defineBasePlugin('htmlParagraphCase4', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const AlphaPlugin = defineBasePlugin('alphaMark', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: () => true,
            encode: () => ({ tag: 'strong' }),
            match: [{ tag: 'strong' }],
          },
        }),
    });
    const ZuluPlugin = defineBasePlugin('zuluMark', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
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
      const editor = createBaseEditor({ plugins });
      const output = new DataTransfer();

      writeHostFragmentData(
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
    const ParagraphPlugin = defineBasePlugin('htmlParagraphCase5', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const mark = (name: string, tag: string) =>
      defineBasePlugin(name, {
        schema: {
          mark: property.boolean({ default: false, omitDefault: true }),
        },
        codecs: ({ defineCodecs }) =>
          defineCodecs({
            'text/html': {
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
      const editor = createBaseEditor({
        plugins: order.map((name) => byName.get(name)!),
      });
      const output = new DataTransfer();
      const text = {
        ...(marks[0] ? { alphaGeneratedMark: true } : {}),
        ...(marks[1] ? { betaGeneratedMark: true } : {}),
        ...(marks[2] ? { gammaGeneratedMark: true } : {}),
        text: 'generated',
      };

      writeHostFragmentData(
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
    const ParagraphPlugin = defineBasePlugin('labeledParagraph', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { label: property.string() },
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            priority: 1,
            decode: ({ element }) => ({
              label: element.getAttribute('data-label') || undefined,
            }),
            encode: ({ content, node }) => ({
              attributes: { 'data-label': node.label },
              children: content,
              tag: 'p',
            }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const editor = createBaseEditor({ plugins: [ParagraphPlugin] });
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
        const fragment = editor.api.html.deserialize({ element: source });

        expect(source.outerHTML).toBe(before);
        expect(fragment).toEqual([
          {
            children: [{ text }],
            label,
            type: 'labeledParagraph',
          },
        ]);

        const output = new DataTransfer();

        writeHostFragmentData(editor, output, ContentSlice.closed(fragment!));
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
    const ParagraphPlugin = defineBasePlugin('htmlParagraphCase6', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
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
      defineBasePlugin(`indexedUnrelated${index}`, {
        schema: {
          element: {
            content: schema.content.text({ default: 'text', min: 1 }),
          },
        },
        codecs: ({ defineCodecs }) =>
          defineCodecs({
            'text/html': {
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
    const editor = createBaseEditor({
      plugins: [ParagraphPlugin, ...unrelated],
    });
    const count = 400;
    const html = Array.from(
      { length: count },
      (_, index) => `<p>${index}</p>`
    ).join('');
    const started = performance.now();
    const fragment = editor.api.html.deserialize({
      element: `<div>${html}</div>`,
    });
    const duration = performance.now() - started;

    expect(fragment).toHaveLength(count);
    expect(paragraphCalls).toBe(count);
    expect(unrelatedCalls).toBe(0);
    expect(duration).toBeLessThan(2000);
  });

  it('rejects equal-priority overlapping element candidates', () => {
    const AlphaPlugin = defineBasePlugin('alphaElementCodec', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: () => ({}),
            decodeOnly: true,
            match: [{ className: 'notice', tag: 'section' }],
          },
        }),
    });
    const ZuluPlugin = defineBasePlugin('zuluElementCodec', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: () => ({}),
            decodeOnly: true,
            match: [{ className: 'callout', tag: 'section' }],
          },
        }),
    });

    expect(() =>
      createBaseEditor({ plugins: [ZuluPlugin, AlphaPlugin] })
    ).toThrow('equal priority and overlapping element candidates');
  });

  it('delegates an exclusive decode to the next lower-priority candidate', () => {
    const ParagraphPlugin = defineBasePlugin('htmlParagraphCase7', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const HigherPlugin = defineBasePlugin('higherElementCodec', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    }).extend(({ defineCodecs }) => ({
      codecs: defineCodecs({
        'text/html': {
          decode: () => {
            throw new Error('delegate this candidate');
          },
          decodeOnly: true,
          match: [{ tag: 'section' }],
          priority: 200,
        },
      }),
    }));
    const LowerPlugin = defineBasePlugin('lowerElementCodec', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    }).extend(({ defineCodecs }) => ({
      codecs: defineCodecs({
        'text/html': {
          decode: () => ({}),
          decodeOnly: true,
          match: [{ tag: 'section' }],
          priority: 100,
        },
      }),
    }));
    const editor = createBaseEditor({
      plugins: [LowerPlugin, HigherPlugin, ParagraphPlugin],
    });
    const report = spyOn(console, 'error').mockImplementation(() => {});
    const input = new DataTransfer();

    input.setData('text/html', '<section>Fallback</section>');

    expect(editor.api.dom.clipboard.insertData(input)).toBe(true);
    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'Fallback' }],
        type: 'lowerElementCodec',
      },
    ]);
    expect(report).toHaveBeenCalled();
    report.mockRestore();
  });

  it('skips lower property decoders after every applicable claim wins', () => {
    let lowerMarkCalls = 0;
    let lowerPropertyCalls = 0;
    const reports: unknown[] = [];
    const ParagraphPlugin = defineBasePlugin('htmlParagraphCase8', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const BoldPlugin = defineBasePlugin('winnerBold', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: () => true,
            decodeOnly: true,
            match: [{ tag: 'strong' }],
            priority: 20,
          },
        }),
    }).extend(({ defineCodecs }) => ({
      codecs: defineCodecs({
        'text/html': {
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
    const AlignPlugin = defineBasePlugin('winnerAlign', {
      schema: {
        properties: {
          align: schema.elementProperty(property.string(), {
            target: target.type('htmlParagraphCase8'),
          }),
        },
      },
      targetPlugins: [ParagraphPlugin],
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: () => 'center',
            decodeOnly: true,
            match: [{ attributes: { 'data-align': true } }],
            priority: 20,
          },
        }),
    }).extend(({ defineCodecs }) => ({
      codecs: defineCodecs({
        'text/html': {
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
    const editor = createBaseEditor({
      editor: createEditor({
        lifecycleErrorSink: (error) => reports.push(error),
      }),
      plugins: [AlignPlugin, BoldPlugin, ParagraphPlugin],
    });

    expect(
      editor.api.html.deserialize({
        element: '<p data-align="center"><strong>Winner</strong></p>',
      })
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
    const ParagraphPlugin = defineBasePlugin('htmlParagraphCase9', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const HigherPlugin = defineBasePlugin('invalidHigherElementCodec', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    }).extend(({ defineCodecs }) => ({
      codecs: defineCodecs({
        'text/html': {
          decode: () => ({ foreign: 'must-not-leak' }) as any,
          decodeOnly: true,
          match: [{ tag: 'section' }],
          priority: 200,
        },
      }),
    }));
    const LowerPlugin = defineBasePlugin('validLowerElementCodec', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    }).extend(({ defineCodecs }) => ({
      codecs: defineCodecs({
        'text/html': {
          decode: () => ({}),
          decodeOnly: true,
          match: [{ tag: 'section' }],
          priority: 100,
        },
      }),
    }));
    const editor = createBaseEditor({
      plugins: [LowerPlugin, HigherPlugin, ParagraphPlugin],
    });
    const report = spyOn(console, 'error').mockImplementation(() => {});
    const input = new DataTransfer();

    input.setData('text/html', '<section>Fallback</section>');

    expect(editor.api.dom.clipboard.insertData(input)).toBe(true);
    expect(editor.read.children()).toEqual([
      {
        children: [{ text: 'Fallback' }],
        type: 'validLowerElementCodec',
      },
    ]);
    expect(report).toHaveBeenCalled();
    report.mockRestore();
  });

  it('delegates schema-invalid explicit children to a lower element candidate', () => {
    const reports: unknown[] = [];
    const ParagraphPlugin = defineBasePlugin('htmlParagraphCase10', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const HigherPlugin = defineBasePlugin('invalidChildrenHigher', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    }).extend(({ defineCodecs }) => ({
      codecs: defineCodecs({
        'text/html': {
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
    const LowerPlugin = defineBasePlugin('validChildrenLower', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    }).extend(({ defineCodecs }) => ({
      codecs: defineCodecs({
        'text/html': {
          decode: () => ({}),
          decodeOnly: true,
          match: [{ tag: 'section' }],
          priority: 100,
        },
      }),
    }));
    const editor = createBaseEditor({
      editor: createEditor({
        lifecycleErrorSink: (error) => reports.push(error),
      }),
      plugins: [LowerPlugin, HigherPlugin, ParagraphPlugin],
    });
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

  it('returns null instead of falling back when direct compiled decode is invalid', () => {
    const reports: unknown[] = [];
    let validations = 0;
    const ParagraphPlugin = defineBasePlugin('validatedParagraph', {
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
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            priority: 1,
            decode: () => ({ unstable: 'value' }),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const editor = createBaseEditor({
      editor: createEditor({
        lifecycleErrorSink: (error) => reports.push(error),
      }),
      plugins: [ParagraphPlugin],
    });

    expect(
      editor.api.html.deserialize({ element: '<p>Invalid</p>' })
    ).toBeNull();
    expect(reports).toHaveLength(1);
    expect(reports[0]).toMatchObject({
      key: 'plate:html:decode',
      phase: 'parse',
    });
  });

  it('reports one contextual lifecycle error for an encode callback failure', () => {
    const reports: unknown[] = [];
    const ParagraphPlugin = defineBasePlugin('htmlParagraphCase11', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            priority: 1,
            decode: () => ({}),
            encode: () => {
              throw new Error('encoder failed');
            },
            match: [{ tag: 'p' }],
          },
        }),
    });
    const editor = createBaseEditor({
      editor: createEditor({
        lifecycleErrorSink: (error) => reports.push(error),
      }),
      plugins: [ParagraphPlugin],
    });
    const output = new DataTransfer();

    expect(
      writeHostFragmentData(
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
      phase: 'serialize',
    });
    expect((reports[0] as any).cause.message).toContain(
      'node "htmlParagraphCase11", claims "element:htmlParagraphCase11"'
    );
  });

  it('allows safe iframes and raster data images but rejects active content', () => {
    const reports: unknown[] = [];
    const ParagraphPlugin = defineBasePlugin('htmlParagraphCase12', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const FramePlugin = defineBasePlugin('safeFrame', {
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
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: ({ element }) => ({
              onload: element.getAttribute('onload') || undefined,
              src: element.getAttribute('src') || undefined,
              srcdoc: element.getAttribute('srcdoc') || undefined,
            }),
            encode: ({ node }) => ({
              attributes: {
                ...(node.onload ? { onload: node.onload } : {}),
                ...(node.src ? { src: node.src } : {}),
                ...(node.srcdoc ? { srcdoc: node.srcdoc } : {}),
              },
              tag: 'iframe',
            }),
            match: [{ tag: 'iframe' }],
          },
        }),
    });
    const ImagePlugin = defineBasePlugin('safeImage', {
      schema: {
        element: {
          properties: { src: property.string() },
          void: 'block',
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: ({ element }) => ({
              src: element.getAttribute('src') || undefined,
            }),
            encode: ({ node }) => ({
              attributes: { src: node.src },
              tag: 'img',
            }),
            match: [{ tag: 'img' }],
          },
        }),
    });
    const BaseUrlPlugin = defineBasePlugin('baseUrl', {
      schema: {
        element: {
          properties: { href: property.string() },
          void: 'block',
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: ({ element }) => ({
              href: element.getAttribute('href') || undefined,
            }),
            encode: ({ node }) => ({
              attributes: { href: node.href },
              tag: 'base',
            }),
            match: [{ tag: 'base' }],
          },
        }),
    });
    const editor = createBaseEditor({
      editor: createEditor({
        lifecycleErrorSink: (error) => reports.push(error),
      }),
      plugins: [BaseUrlPlugin, FramePlugin, ImagePlugin, ParagraphPlugin],
    });
    const serialize = (node: any) => {
      const output = new DataTransfer();
      const formats = writeHostFragmentData(
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
      editor.api.html.deserialize({
        element: '<iframe src="java&#10;script:alert(1)"></iframe>',
      })
    ).toEqual([]);
    expect(
      editor.api.html.deserialize({
        element: '<img src="data:image/png;base64,iVBORw0KGgo=">',
      })
    ).toEqual([
      {
        children: [{ text: '' }],
        src: 'data:image/png;base64,iVBORw0KGgo=',
        type: 'safeImage',
      },
    ]);
    expect(
      editor.api.html.deserialize({
        element: '<base href="https://attacker.example/">',
      })
    ).toEqual([]);
    expect(reports).toHaveLength(6);
  });

  it('aborts the whole encode on conflicting normalized patch writes', () => {
    const report = spyOn(console, 'error').mockImplementation(() => {});
    const ParagraphPlugin = defineBasePlugin('htmlParagraphCase13', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const ColorPlugin = defineBasePlugin('colorCodec', {
      schema: {
        properties: {
          color: schema.elementProperty(property.string(), {
            target: target.type('htmlParagraphCase13'),
          }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: () => 'red',
            encode: ({ value }) => ({ style: { color: value } }),
            match: [{ attributes: { 'data-color': true } }],
          },
        }),
    });
    const TonePlugin = defineBasePlugin('toneCodec', {
      schema: {
        properties: {
          tone: schema.elementProperty(property.string(), {
            target: target.type('htmlParagraphCase13'),
          }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: () => 'blue',
            encode: ({ value }) => ({ style: { color: value } }),
            match: [{ attributes: { 'data-tone': true } }],
          },
        }),
    });
    const editor = createBaseEditor({
      plugins: [TonePlugin, ParagraphPlugin, ColorPlugin],
    });
    const output = new DataTransfer();
    const formats = writeHostFragmentData(
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
    const ParagraphPlugin = defineBasePlugin('htmlParagraphCase14', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
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
    const TonePlugin = defineBasePlugin('toneStyleChannel', {
      schema: {
        properties: {
          tone: schema.elementProperty(property.string(), {
            target: target.type('htmlParagraphCase14'),
          }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: () => 'blue',
            encode: ({ value }) => ({ style: { color: value } }),
            match: [{ attributes: { 'data-tone': true } }],
          },
        }),
    });
    const editor = createBaseEditor({
      plugins: [TonePlugin, ParagraphPlugin],
    });
    const output = new DataTransfer();

    expect(
      writeHostFragmentData(
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
    const ParagraphPlugin = defineBasePlugin('htmlParagraphCase15', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
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
    const editor = createBaseEditor({ plugins: [ParagraphPlugin] });
    const output = new DataTransfer();
    const formats = writeHostFragmentData(
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
    const ParagraphPlugin = defineBasePlugin('htmlParagraphCase16', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
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
    const editor = createBaseEditor({ plugins: [ParagraphPlugin] });
    const output = new DataTransfer();
    const formats = writeHostFragmentData(
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
    const ParagraphPlugin = defineBasePlugin('htmlParagraphCase17', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const UnmappedPlugin = defineBasePlugin('unmappedProperty', {
      schema: {
        properties: {
          unmapped: schema.elementProperty(property.string(), {
            target: target.type('htmlParagraphCase17'),
          }),
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [UnmappedPlugin, ParagraphPlugin],
    });
    const metadataOutput = new DataTransfer();

    expect(
      writeHostFragmentData(
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

    const report = spyOn(console, 'error').mockImplementation(() => {});
    const unsupportedOutput = new DataTransfer();

    expect(
      writeHostFragmentData(
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
    expect(report).toHaveBeenCalled();
    report.mockRestore();
  });

  it('aborts encode when a decode-only property claim is present', () => {
    const ParagraphPlugin = defineBasePlugin('htmlParagraphCase18', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const DecodeOnlyPlugin = defineBasePlugin('decodeOnlyProperty', {
      schema: {
        properties: {
          tone: schema.elementProperty(property.string(), {
            target: target.type('htmlParagraphCase18'),
          }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: () => 'quiet',
            decodeOnly: true,
            match: [{ attributes: { 'data-tone': true } }],
          },
        }),
    });
    const editor = createBaseEditor({
      plugins: [DecodeOnlyPlugin, ParagraphPlugin],
    });
    const report = spyOn(console, 'error').mockImplementation(() => {});
    const output = new DataTransfer();

    expect(
      writeHostFragmentData(
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
    expect(report).toHaveBeenCalled();
    report.mockRestore();
  });

  it('keeps JSON null as an owned property value', () => {
    const ParagraphPlugin = defineBasePlugin('htmlParagraphCase19', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            priority: 1,
            decode: () => ({}),
            encode: ({ content }) => ({ children: content, tag: 'p' }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const NullablePlugin = defineBasePlugin('nullableCodec', {
      schema: {
        properties: {
          nullable: schema.elementProperty(property.json(), {
            target: target.type('htmlParagraphCase19'),
          }),
        },
      },
      codecs: ({ defineCodecs }) =>
        defineCodecs({
          'text/html': {
            decode: () => null,
            encode: ({ value }) =>
              value === null ? { attributes: { 'data-null': true } } : null,
            match: [{ attributes: { 'data-null': true } }],
          },
        }),
    });
    const editor = createBaseEditor({
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
      writeHostFragmentData(
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
    const AlignPlugin = defineBasePlugin('foreignAlignTarget', {
      schema: {
        properties: {
          align: schema.elementProperty(property.string(), {
            target: target.type('paragraph'),
          }),
        },
      },
    });
    const AlphaPlugin = defineBasePlugin('alphaForeignAlign', {
      codecs: ({ defineCodecs }) =>
        defineCodecs(AlignPlugin, {
          'text/html': {
            decode: () => 'left',
            encode: () => ({ attributes: { 'data-align': 'left' } }),
            match: [{ tag: 'p' }],
          },
        }),
    });
    const ZuluPlugin = defineBasePlugin('zuluForeignAlign', {
      codecs: ({ defineCodecs }) =>
        defineCodecs(AlignPlugin, {
          'text/html': {
            decode: () => 'right',
            encode: () => ({ attributes: { 'data-align': 'right' } }),
            match: [{ tag: 'div' }],
          },
        }),
    });

    expect(() =>
      createBaseEditor({
        plugins: [ZuluPlugin, AlignPlugin, AlphaPlugin],
      })
    ).toThrow('competing encode claim "property:');
  });

  it('rejects same-owner wrapper encoders with an unresolved ordering tie', () => {
    const AlphaMark = defineBasePlugin('alphaForeignMark', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
    });
    const BetaMark = defineBasePlugin('betaForeignMark', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
    });
    const OwnerPlugin = defineBasePlugin('tiedForeignMarkOwner', {
      codecs: ({ defineCodecs }) =>
        defineCodecs(AlphaMark, {
          'text/html': {
            decode: () => true,
            encode: () => ({ tag: 'strong' }),
            match: [{ tag: 'strong' }],
          },
        }),
    }).extend(({ defineCodecs }) => ({
      codecs: defineCodecs(BetaMark, {
        'text/html': {
          decode: () => true,
          encode: () => ({ tag: 'em' }),
          match: [{ tag: 'em' }],
        },
      }),
    }));

    expect(() =>
      createBaseEditor({ plugins: [OwnerPlugin, AlphaMark, BetaMark] })
    ).toThrow('unresolved wrapper ordering');
  });

  it('resolves a foreign target name to its installed declared type', () => {
    const TargetPlugin = defineBasePlugin('foreignParagraph', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { variant: property.string() },
        },
      },
    });
    const ForeignOwner = defineBasePlugin('foreignElementOwner', {
      codecs: ({ defineCodecs }) =>
        defineCodecs(TargetPlugin, {
          'text/html': {
            decode: ({ element }) => ({ variant: element.dataset.variant }),
            encode: ({ content, node }) => {
              const declaredType: string = node.type;

              void declaredType;

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
    const editor = createBaseEditor({
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
      writeHostFragmentData(
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
    const AuthoredTarget = defineBasePlugin('foreignFamilyTarget', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { variant: property.string() },
        },
      },
    });
    const InstalledTarget = defineBasePlugin(AuthoredTarget.name, {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
          properties: { count: property.number() },
        },
      },
    });
    const ForeignOwner = defineBasePlugin('foreignFamilyOwner', {
      codecs: ({ defineCodecs }) =>
        defineCodecs(AuthoredTarget, {
          'text/html': {
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
      createBaseEditor({ plugins: [ForeignOwner, InstalledTarget] })
    ).toThrow('belongs to a different schema family');
  });

  it('keeps foreign family metadata distinct when one callback is reused', () => {
    const AlphaMark = defineBasePlugin('reusedAlphaMark', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
    });
    const BetaMark = defineBasePlugin('reusedBetaMark', {
      schema: {
        mark: property.boolean({ default: false, omitDefault: true }),
      },
    });
    const sharedDecoder = () => ({
      decode: () => true,
      decodeOnly: true as const,
      match: [{ tag: 'strong' }] as const,
    });
    const Owner = defineBasePlugin('reusedForeignOwner', {
      codecs: ({ defineCodecs }) =>
        defineCodecs(AlphaMark, {
          'text/html': {
            ...sharedDecoder(),
          },
        }),
    }).extend(({ defineCodecs }) => ({
      codecs: defineCodecs(BetaMark, {
        'text/html': {
          ...sharedDecoder(),
        },
      }),
    }));

    expect(() =>
      createBaseEditor({ plugins: [Owner, AlphaMark, BetaMark] })
    ).not.toThrow();
  });
});
