import {
  BaseFontBackgroundColorPlugin,
  BaseFontColorPlugin,
  BaseFontFamilyPlugin,
  BaseFontSizePlugin,
  BaseFontWeightPlugin,
  BaseLineHeightPlugin,
  BaseTextAlignPlugin,
  BaseTextIndentPlugin,
  toUnitLess,
} from './BaseStylePlugins';
import {
  BaseParagraphPlugin,
  createBaseEditor,
  defineBasePlugin,
} from '@platejs/core';
import { createPluginContext } from '@platejs/core/internal';
import { ContentSlice, createEditor, schema, type Value } from '@platejs/plite';
import { writeHostFragmentData } from '@platejs/plite-dom';
import { PLUGINS } from '@platejs/utils';

describe('BaseFontBackgroundColorPlugin', () => {
  it('parses html background-color styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontBackgroundColorPlugin],
    });
    const plugin = editor.plugin(BaseFontBackgroundColorPlugin);

    expect(plugin.inject.nodeProps).toEqual({
      nodeKey: 'backgroundColor',
      styleKey: 'backgroundColor',
    });
    expect(
      editor.plugin(BaseFontBackgroundColorPlugin).inject.nodeProps!
    ).toMatchObject({
      nodeKey: 'backgroundColor',
      styleKey: 'backgroundColor',
    });
    expect(
      editor.read.schema.property({
        key: editor.plugin(BaseFontBackgroundColorPlugin).schema.key,
        placement: 'text',
      })?.value.kind
    ).toBe('string');
    expect(
      editor.api.html.deserialize({
        element: '<span style="background-color: rgb(255, 255, 0)">text</span>',
      })
    ).toMatchObject([
      {
        children: [
          {
            backgroundColor: 'rgb(255, 255, 0)',
            text: 'text',
          },
        ],
        type: 'paragraph',
      },
    ]);
  });

  it('sets background color through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontBackgroundColorPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
    });

    editor.update.backgroundColor.set('yellow');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      backgroundColor: 'yellow',
      text: 'text',
    });

    editor.update.backgroundColor.clear();

    expect(editor.read.children()[0]?.children[0]).toEqual({
      text: 'text',
    });
  });
});

describe('BaseFontColorPlugin', () => {
  it('parses html color styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontColorPlugin],
    });
    const plugin = editor.plugin(BaseFontColorPlugin);

    expect(plugin.inject.nodeProps).toEqual({
      defaultNodeValue: 'black',
      nodeKey: 'color',
      styleKey: 'color',
    });
    expect(editor.plugin(BaseFontColorPlugin).inject.nodeProps!).toMatchObject({
      defaultNodeValue: 'black',
      nodeKey: 'color',
      styleKey: 'color',
    });
    expect(
      editor.read.schema.property({
        key: editor.plugin(BaseFontColorPlugin).schema.key,
        placement: 'text',
      })?.value.kind
    ).toBe('string');
    expect(
      editor.api.html.deserialize({
        element: '<span style="color: rgb(255, 0, 0)">text</span>',
      })
    ).toMatchObject([
      {
        children: [
          {
            color: 'rgb(255, 0, 0)',
            text: 'text',
          },
        ],
        type: 'paragraph',
      },
    ]);
  });

  it('sets font color through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontColorPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
    });

    editor.update.color.set('red');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      color: 'red',
      text: 'text',
    });

    editor.update.color.clear();

    expect(editor.read.children()[0]?.children[0]).toEqual({
      text: 'text',
    });
  });
});

describe('BaseFontFamilyPlugin', () => {
  it('parses html font-family styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontFamilyPlugin],
    });
    const plugin = editor.plugin(BaseFontFamilyPlugin);

    expect(plugin.inject.nodeProps).toEqual({
      nodeKey: 'fontFamily',
      styleKey: 'fontFamily',
    });
    expect(editor.plugin(BaseFontFamilyPlugin).inject.nodeProps!).toMatchObject(
      {
        nodeKey: 'fontFamily',
        styleKey: 'fontFamily',
      }
    );
    expect(
      editor.read.schema.property({
        key: editor.plugin(BaseFontFamilyPlugin).schema.key,
        placement: 'text',
      })?.value.kind
    ).toBe('string');
    expect(
      editor.api.html.deserialize({
        element: '<span style="font-family: Fira Code, monospace">text</span>',
      })
    ).toMatchObject([
      {
        children: [
          {
            fontFamily: '"Fira Code", monospace',
            text: 'text',
          },
        ],
        type: 'paragraph',
      },
    ]);
  });

  it('sets font family through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontFamilyPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
    });

    editor.update.fontFamily.set('serif');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      fontFamily: 'serif',
      text: 'text',
    });
  });
});

describe('BaseFontSizePlugin', () => {
  it('parses html font-size styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontSizePlugin],
    });
    const plugin = editor.plugin(BaseFontSizePlugin);

    expect(plugin.inject.nodeProps).toEqual({
      nodeKey: 'fontSize',
      styleKey: 'fontSize',
    });
    expect(editor.plugin(BaseFontSizePlugin).inject.nodeProps!).toMatchObject({
      nodeKey: 'fontSize',
      styleKey: 'fontSize',
    });
    expect(
      editor.read.schema.property({
        key: editor.plugin(BaseFontSizePlugin).schema.key,
        placement: 'text',
      })?.value.kind
    ).toBe('string');
    expect(
      editor.api.html.deserialize({
        element: '<span style="font-size: 18px">text</span>',
      })
    ).toMatchObject([
      {
        children: [
          {
            fontSize: '18px',
            text: 'text',
          },
        ],
        type: 'paragraph',
      },
    ]);
  });

  it('sets font size through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontSizePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
    });

    editor.update.fontSize.set('24px');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      fontSize: '24px',
      text: 'text',
    });
  });
});

describe('BaseFontWeightPlugin', () => {
  it('parses html font-weight styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontWeightPlugin],
    });
    const plugin = editor.plugin(BaseFontWeightPlugin);

    expect(plugin.inject.nodeProps).toEqual({
      nodeKey: 'fontWeight',
      styleKey: 'fontWeight',
    });
    expect(editor.plugin(BaseFontWeightPlugin).inject.nodeProps!).toMatchObject(
      {
        nodeKey: 'fontWeight',
        styleKey: 'fontWeight',
      }
    );
    expect(
      editor.read.schema.property({
        key: editor.plugin(BaseFontWeightPlugin).schema.key,
        placement: 'text',
      })?.value.kind
    ).toBe('string');
    expect(
      editor.api.html.deserialize({
        element: '<span style="font-weight: 700">text</span>',
      })
    ).toMatchObject([
      {
        children: [
          {
            fontWeight: '700',
            text: 'text',
          },
        ],
        type: 'paragraph',
      },
    ]);
  });

  it('sets font weight through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontWeightPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: 'paragraph' }],
    });

    editor.update.fontWeight.set('bold');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      fontWeight: 'bold',
      text: 'text',
    });
  });
});

describe('BaseLineHeightPlugin', () => {
  it('exposes the injected block contract and typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseLineHeightPlugin],
    });
    const plugin = editor.plugin(BaseLineHeightPlugin);

    expect(plugin.inject.isBlock).toBe(true);
    expect(plugin.targetPlugins[0]?.name).toBe(
      editor.plugin(BaseParagraphPlugin).schema.type
    );
    expect(editor.plugin(BaseLineHeightPlugin).inject.nodeProps!).toMatchObject(
      {
        defaultNodeValue: 1.5,
        nodeKey: 'lineHeight',
      }
    );
    expect(
      editor.read.schema.property({
        key: 'lineHeight',
        placement: 'element',
      })?.value.kind
    ).toBe('json');
    expect(typeof editor.update.lineHeight.set).toBe('function');
  });

  it('rejects non-number and non-string line heights', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseLineHeightPlugin],
    });

    expect(() =>
      editor.read.schema.assertDocument({
        children: [
          {
            children: [{ text: 'One' }],
            lineHeight: true,
            type: 'paragraph',
          },
        ],
      })
    ).toThrow(/element property "lineHeight" fails custom property validation/);
  });

  it('parses line-height styles through the injected target plugin deserializer', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseLineHeightPlugin],
    });

    expect(
      editor.api.html.deserialize({
        element: '<p style="line-height: 2">text</p>',
      })
    ).toMatchObject([
      {
        lineHeight: 2,
        children: [{ text: 'text' }],
        type: 'paragraph',
      },
    ]);
  });

  it('applies and clears line height through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseLineHeightPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'One' }],
          type: 'paragraph',
        },
      ],
    });

    editor.update.lineHeight.set(2);
    expect(editor.read.children()[0]).toMatchObject({ lineHeight: 2 });

    editor.update.lineHeight.set(1.5);
    expect(editor.read.children()[0]).not.toHaveProperty('lineHeight');
  });

  it('uses the plugin type instead of an injected node key', () => {
    const LineHeightPlugin = BaseLineHeightPlugin.configure({
      inject: {
        nodeProps: {
          nodeKey: 'legacyLineHeight',
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, LineHeightPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'One' }],
          type: 'paragraph',
        },
      ],
    });

    expect(
      editor.api.html.deserialize({
        element: '<p style="line-height: 2">text</p>',
      })
    ).toMatchObject([
      {
        children: [{ text: 'text' }],
        lineHeight: 2,
        type: 'paragraph',
      },
    ]);

    editor.update.lineHeight.set(2);

    expect(editor.read.children()[0]).toMatchObject({ lineHeight: 2 });
    expect(editor.read.children()[0]).not.toHaveProperty('legacyLineHeight');

    editor.update.lineHeight.set(1.5);

    expect(editor.read.children()[0]).not.toHaveProperty('lineHeight');
  });
});

describe('BaseTextAlignPlugin', () => {
  it('admits the canonical property on configured element targets', () => {
    const ImagePlugin = defineBasePlugin(PLUGINS.image, {
      schema: { element: schema.element.textBlock() },
    });
    const TextAlignPlugin = BaseTextAlignPlugin.configure({
      targetPlugins: [ImagePlugin],
    });
    const editor = createBaseEditor({
      editor: createEditor<Value>(),
      initialValue: [
        {
          children: [{ text: '' }],
          textAlign: 'center',
          type: 'image',
        },
      ],
      plugins: [ImagePlugin, TextAlignPlugin] as const,
    });

    expect(editor.read.children()[0]).toMatchObject({
      textAlign: 'center',
      type: 'image',
    });
  });

  it('exposes the injected block contract and typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseTextAlignPlugin],
    });
    const plugin = editor.plugin(BaseTextAlignPlugin);

    expect(plugin.inject.isBlock).toBe(true);
    expect(plugin.targetPlugins[0]?.name).toBe(
      editor.plugin(BaseParagraphPlugin).schema.type
    );
    expect(plugin.inject.nodeProps).toMatchObject({
      defaultNodeValue: 'start',
      styleKey: 'textAlign',
      validNodeValues: ['center', 'end', 'justify', 'left', 'right', 'start'],
    });
    expect(
      editor.read.schema.property({
        key: 'textAlign',
        placement: 'element',
      })?.value.kind
    ).toBe('enum');
    expect(typeof editor.update.textAlign.set).toBe('function');
  });

  it('parses text-align styles through the injected target plugin deserializer', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseTextAlignPlugin],
    });

    expect(
      editor.api.html.deserialize({
        element: '<p style="text-align: center">text</p>',
      })
    ).toMatchObject([
      {
        textAlign: 'center',
        children: [{ text: 'text' }],
        type: 'paragraph',
      },
    ]);
  });

  it('applies and clears text alignment through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseTextAlignPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'One' }],
          type: 'paragraph',
        },
      ],
    });
    const nodeKey = 'textAlign';

    editor.update.textAlign.set('center');
    expect(editor.read.children()[0]).toMatchObject({ [nodeKey]: 'center' });

    editor.update.textAlign.set('start');
    expect(editor.read.children()[0]).not.toHaveProperty(nodeKey);
  });

  it('uses the schema key instead of an injected node-prop key', () => {
    const TextAlignPlugin = BaseTextAlignPlugin.configure({
      inject: {
        nodeProps: {
          nodeKey: 'legacyAlign',
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, TextAlignPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'One' }],
          type: 'paragraph',
        },
      ],
    });

    expect(
      editor.api.html.deserialize({
        element: '<p style="text-align: center">text</p>',
      })
    ).toMatchObject([
      {
        textAlign: 'center',
        children: [{ text: 'text' }],
        type: 'paragraph',
      },
    ]);

    editor.update.textAlign.set('center');

    expect(editor.read.children()[0]).toMatchObject({
      textAlign: 'center',
    });
    expect(editor.read.children()[0]).not.toHaveProperty('legacyAlign');

    editor.update.textAlign.set('start');

    expect(editor.read.children()[0]).not.toHaveProperty('textAlign');
  });
});

describe('BaseTextIndentPlugin', () => {
  it('exposes the default injected block contract', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseTextIndentPlugin],
    });
    const plugin = editor.plugin(BaseTextIndentPlugin);
    const nodeProps = editor.plugin(BaseTextIndentPlugin).inject.nodeProps!;
    const transformNodeValue = nodeProps.transformNodeValue!;

    expect(plugin.inject.isBlock).toBe(true);
    expect(plugin.targetPlugins[0]?.name).toBe(
      editor.plugin(BaseParagraphPlugin).schema.type
    );
    expect(nodeProps).toMatchObject({
      nodeKey: 'textIndent',
      styleKey: 'textIndent',
    });
    expect(
      transformNodeValue({
        ...createPluginContext(editor, BaseTextIndentPlugin),
        nodeValue: 2,
      })
    ).toBe('48px');
    expect(
      editor.read.schema.property({
        key: 'textIndent',
        placement: 'element',
      })?.value.kind
    ).toBe('number');
  });

  it('uses configured offset and unit when formatting node values', () => {
    const TextIndentPlugin = BaseTextIndentPlugin.configure({
      initialState: {
        offset: 10,
        unit: 'em',
      },
    });
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, TextIndentPlugin],
    });
    const nodeProps = editor.plugin(TextIndentPlugin).inject.nodeProps!;

    expect(
      nodeProps.transformNodeValue!({
        ...createPluginContext(editor, TextIndentPlugin),
        nodeValue: 3,
      })
    ).toBe('30em');
  });

  it('decodes CSS text indentation through configured units', () => {
    const TextIndentPlugin = BaseTextIndentPlugin.configure({
      initialState: {
        offset: 10,
        unit: 'em',
      },
    });
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, TextIndentPlugin],
    });

    expect(
      editor.api.html.deserialize({
        element: '<p style="text-indent: 20em">Indented</p>',
      })
    ).toEqual([
      {
        children: [{ text: 'Indented' }],
        textIndent: 2,
        type: 'paragraph',
      },
    ]);
  });

  it('applies and clears text indent through generic node updates', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseTextIndentPlugin],
      initialValue: [
        {
          children: [{ text: 'One' }],
          type: 'paragraph',
        },
      ],
    });
    const nodeKey = 'textIndent';

    editor.update.nodes.set({ textIndent: 2 }, { at: [0] });
    expect(editor.read.children()[0]).toMatchObject({ [nodeKey]: 2 });

    editor.update.nodes.unset('textIndent', { at: [0] });
    expect(editor.read.children()[0]).not.toHaveProperty(nodeKey);
  });

  it('uses the plugin type instead of an injected node key', () => {
    const TextIndentPlugin = BaseTextIndentPlugin.configure({
      inject: {
        nodeProps: {
          nodeKey: 'legacyTextIndent',
        },
      },
    });
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, TextIndentPlugin],
      initialValue: [
        {
          children: [{ text: 'One' }],
          type: 'paragraph',
        },
      ],
    });

    editor.update.nodes.set({ textIndent: 2 }, { at: [0] });

    expect(editor.read.children()[0]).toMatchObject({ textIndent: 2 });
    expect(editor.read.children()[0]).not.toHaveProperty('legacyTextIndent');

    editor.update.nodes.unset('textIndent', { at: [0] });

    expect(editor.read.children()[0]).not.toHaveProperty('textIndent');
  });
});

describe('basic style HTML codecs', () => {
  it('keeps nested mark values over inherited parent values', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseFontSizePlugin],
    });

    expect(
      editor.api.html.deserialize({
        element:
          '<p style="font-size: 12pt">before <span style="font-size: 18pt">inside</span> after</p>',
      })
    ).toEqual([
      {
        children: [
          { fontSize: '12pt', text: 'before ' },
          { fontSize: '18pt', text: 'inside' },
          { fontSize: '12pt', text: ' after' },
        ],
        type: 'paragraph',
      },
    ]);
  });

  it('round-trips mark wrappers and block property patches', () => {
    const editor = createBaseEditor({
      plugins: [
        BaseParagraphPlugin,
        BaseFontBackgroundColorPlugin,
        BaseFontColorPlugin,
        BaseFontFamilyPlugin,
        BaseFontSizePlugin,
        BaseFontWeightPlugin,
        BaseLineHeightPlugin,
        BaseTextAlignPlugin,
        BaseTextIndentPlugin,
      ],
      initialValue: [
        {
          textAlign: 'center',
          children: [
            {
              backgroundColor: 'yellow',
              color: 'red',
              fontFamily: 'serif',
              fontSize: '18px',
              fontWeight: '700',
              text: 'Styled',
            },
          ],
          lineHeight: 2,
          textIndent: 2,
          type: 'paragraph',
        },
      ],
    });
    const serialized = new Map<string, string>();

    writeHostFragmentData(
      editor,
      {
        setData: (format, value) => serialized.set(format, value),
      },
      ContentSlice.closed(editor.read.children())
    );
    const html = serialized.get('text/html');

    if (!html) throw new Error('Missing HTML codec serialization');

    const body = new DOMParser().parseFromString(html, 'text/html').body;
    const paragraph = body.querySelector('p') as HTMLElement;
    const styledElements = Array.from(
      body.querySelectorAll<HTMLElement>('[style]')
    );

    expect(paragraph.style.lineHeight).toBe('2');
    expect(paragraph.style.textAlign).toBe('center');
    expect(paragraph.style.textIndent).toBe('48px');
    expect(paragraph.dataset.textIndent).toBe('2');
    expect(
      styledElements.some(
        (element) => element.style.backgroundColor === 'yellow'
      )
    ).toBe(true);
    expect(
      styledElements.some((element) => element.style.color === 'red')
    ).toBe(true);
    expect(
      styledElements.some((element) => element.style.fontFamily === 'serif')
    ).toBe(true);
    expect(
      styledElements.some((element) => element.style.fontSize === '18px')
    ).toBe(true);
    expect(
      styledElements.some((element) => element.style.fontWeight === '700')
    ).toBe(true);
    expect(editor.api.html.deserialize({ element: html! })).toEqual([
      ...editor.read.children(),
    ]);
  });
});

describe('toUnitLess', () => {
  it('returns 0 for invalid values', () => {
    expect(toUnitLess('')).toBe('0');
    expect(toUnitLess('auto')).toBe('0');
  });

  it('keeps numeric values unitless', () => {
    expect(toUnitLess('24')).toBe('24');
    expect(toUnitLess('24px')).toBe('24');
  });

  it('converts rem values using a 16px base', () => {
    expect(toUnitLess('2rem')).toBe('32');
  });
});
