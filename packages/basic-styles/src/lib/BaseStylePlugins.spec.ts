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
import { BaseParagraphPlugin, createBaseEditor } from '@platejs/core';
import { createPluginContext } from '@platejs/core/internal';
import { ContentSlice } from '@platejs/plite';
import { writeHostFragmentData } from '@platejs/plite-dom';
import { KEYS } from '@platejs/utils';

describe('BaseFontBackgroundColorPlugin', () => {
  it('parses html background-color styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontBackgroundColorPlugin],
    });
    const plugin = editor.plugin(BaseFontBackgroundColorPlugin).plugin;

    expect(plugin.inject.nodeProps).toEqual({
      nodeKey: 'backgroundColor',
      styleKey: 'backgroundColor',
    });
    expect(
      editor.plugin(BaseFontBackgroundColorPlugin).plugin.inject.nodeProps!
    ).toMatchObject({
      nodeKey: 'backgroundColor',
      styleKey: 'backgroundColor',
    });
    expect(
      editor.read.schema.property(BaseFontBackgroundColorPlugin)?.value.kind
    ).toBe('string');
    expect(
      editor.api.html.deserialize({
        element: '<span style="background-color: rgb(255, 255, 0)">text</span>',
      })
    ).toMatchObject([
      {
        children: [
          {
            [KEYS.backgroundColor]: 'rgb(255, 255, 0)',
            text: 'text',
          },
        ],
        type: KEYS.p,
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
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    editor.update.backgroundColor.set('yellow');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      [KEYS.backgroundColor]: 'yellow',
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
    const plugin = editor.plugin(BaseFontColorPlugin).plugin;

    expect(plugin.inject.nodeProps).toEqual({
      defaultNodeValue: 'black',
      nodeKey: 'color',
      styleKey: 'color',
    });
    expect(
      editor.plugin(BaseFontColorPlugin).plugin.inject.nodeProps!
    ).toMatchObject({
      defaultNodeValue: 'black',
      nodeKey: 'color',
      styleKey: 'color',
    });
    expect(editor.read.schema.property(BaseFontColorPlugin)?.value.kind).toBe(
      'string'
    );
    expect(
      editor.api.html.deserialize({
        element: '<span style="color: rgb(255, 0, 0)">text</span>',
      })
    ).toMatchObject([
      {
        children: [
          {
            [KEYS.color]: 'rgb(255, 0, 0)',
            text: 'text',
          },
        ],
        type: KEYS.p,
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
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    editor.update.color.set('red');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      [KEYS.color]: 'red',
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
    const plugin = editor.plugin(BaseFontFamilyPlugin).plugin;

    expect(plugin.inject.nodeProps).toEqual({
      nodeKey: 'fontFamily',
      styleKey: 'fontFamily',
    });
    expect(
      editor.plugin(BaseFontFamilyPlugin).plugin.inject.nodeProps!
    ).toMatchObject({
      nodeKey: 'fontFamily',
      styleKey: 'fontFamily',
    });
    expect(editor.read.schema.property(BaseFontFamilyPlugin)?.value.kind).toBe(
      'string'
    );
    expect(
      editor.api.html.deserialize({
        element: '<span style="font-family: Fira Code, monospace">text</span>',
      })
    ).toMatchObject([
      {
        children: [
          {
            [KEYS.fontFamily]: '"Fira Code", monospace',
            text: 'text',
          },
        ],
        type: KEYS.p,
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
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    editor.update.fontFamily.set('serif');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      [KEYS.fontFamily]: 'serif',
      text: 'text',
    });
  });
});

describe('BaseFontSizePlugin', () => {
  it('parses html font-size styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontSizePlugin],
    });
    const plugin = editor.plugin(BaseFontSizePlugin).plugin;

    expect(plugin.inject.nodeProps).toEqual({
      nodeKey: 'fontSize',
      styleKey: 'fontSize',
    });
    expect(
      editor.plugin(BaseFontSizePlugin).plugin.inject.nodeProps!
    ).toMatchObject({
      nodeKey: 'fontSize',
      styleKey: 'fontSize',
    });
    expect(editor.read.schema.property(BaseFontSizePlugin)?.value.kind).toBe(
      'string'
    );
    expect(
      editor.api.html.deserialize({
        element: '<span style="font-size: 18px">text</span>',
      })
    ).toMatchObject([
      {
        children: [
          {
            [KEYS.fontSize]: '18px',
            text: 'text',
          },
        ],
        type: KEYS.p,
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
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    editor.update.fontSize.set('24px');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      [KEYS.fontSize]: '24px',
      text: 'text',
    });
  });
});

describe('BaseFontWeightPlugin', () => {
  it('parses html font-weight styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontWeightPlugin],
    });
    const plugin = editor.plugin(BaseFontWeightPlugin).plugin;

    expect(plugin.inject.nodeProps).toEqual({
      nodeKey: 'fontWeight',
      styleKey: 'fontWeight',
    });
    expect(
      editor.plugin(BaseFontWeightPlugin).plugin.inject.nodeProps!
    ).toMatchObject({
      nodeKey: 'fontWeight',
      styleKey: 'fontWeight',
    });
    expect(editor.read.schema.property(BaseFontWeightPlugin)?.value.kind).toBe(
      'string'
    );
    expect(
      editor.api.html.deserialize({
        element: '<span style="font-weight: 700">text</span>',
      })
    ).toMatchObject([
      {
        children: [
          {
            [KEYS.fontWeight]: '700',
            text: 'text',
          },
        ],
        type: KEYS.p,
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
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    editor.update.fontWeight.set('bold');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      [KEYS.fontWeight]: 'bold',
      text: 'text',
    });
  });
});

describe('BaseLineHeightPlugin', () => {
  it('exposes the injected block contract and typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseLineHeightPlugin],
    });
    const plugin = editor.plugin(BaseLineHeightPlugin).plugin;

    expect(plugin.inject.isBlock).toBe(true);
    expect(plugin.targetPluginNames).toEqual([KEYS.p]);
    expect(
      editor.plugin(BaseLineHeightPlugin).plugin.inject.nodeProps!
    ).toMatchObject({
      defaultNodeValue: 1.5,
      nodeKey: 'lineHeight',
    });
    expect(editor.read.schema.property(BaseLineHeightPlugin)?.value.kind).toBe(
      'json'
    );
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
            type: KEYS.p,
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
        [editor.plugin(KEYS.lineHeight).type]: 2,
        children: [{ text: 'text' }],
        type: KEYS.p,
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
          type: 'p',
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
          type: 'p',
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
        type: KEYS.p,
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
  it('exposes the injected block contract and typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseTextAlignPlugin],
    });
    const plugin = editor.plugin(BaseTextAlignPlugin).plugin;

    expect(plugin.inject.isBlock).toBe(true);
    expect(plugin.targetPluginNames).toEqual([KEYS.p]);
    expect(plugin.inject.nodeProps).toMatchObject({
      defaultNodeValue: 'start',
      styleKey: 'textAlign',
      validNodeValues: ['start', 'left', 'center', 'right', 'end', 'justify'],
    });
    expect(editor.read.schema.property(BaseTextAlignPlugin)?.value.kind).toBe(
      'string'
    );
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
        [editor.plugin(KEYS.textAlign).type]: 'center',
        children: [{ text: 'text' }],
        type: KEYS.p,
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
          type: 'p',
        },
      ],
    });
    const nodeKey = editor.plugin(KEYS.textAlign).type;

    editor.update.textAlign.set('center');
    expect(editor.read.children()[0]).toMatchObject({ [nodeKey]: 'center' });

    editor.update.textAlign.set('start');
    expect(editor.read.children()[0]).not.toHaveProperty(nodeKey);
  });

  it('uses the plugin type instead of an injected node key', () => {
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
          type: 'p',
        },
      ],
    });

    expect(
      editor.api.html.deserialize({
        element: '<p style="text-align: center">text</p>',
      })
    ).toMatchObject([
      {
        align: 'center',
        children: [{ text: 'text' }],
        type: KEYS.p,
      },
    ]);

    editor.update.textAlign.set('center');

    expect(editor.read.children()[0]).toMatchObject({
      align: 'center',
    });
    expect(editor.read.children()[0]).not.toHaveProperty('legacyAlign');

    editor.update.textAlign.set('start');

    expect(editor.read.children()[0]).not.toHaveProperty('align');
  });
});

describe('BaseTextIndentPlugin', () => {
  it('exposes the default injected block contract', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseTextIndentPlugin],
    });
    const plugin = editor.plugin(BaseTextIndentPlugin).plugin;
    const nodeProps =
      editor.plugin(BaseTextIndentPlugin).plugin.inject.nodeProps!;
    const transformNodeValue = nodeProps.transformNodeValue!;

    expect(plugin.inject.isBlock).toBe(true);
    expect(plugin.targetPluginNames).toEqual([KEYS.p]);
    expect(nodeProps).toMatchObject({
      nodeKey: 'textIndent',
      styleKey: 'textIndent',
    });
    expect(
      transformNodeValue({
        ...createPluginContext(editor, plugin),
        nodeValue: 2,
      })
    ).toBe('48px');
    expect(editor.read.schema.property(BaseTextIndentPlugin)?.value.kind).toBe(
      'number'
    );
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
    const plugin = editor.plugin(TextIndentPlugin).plugin;
    const nodeProps = editor.plugin(TextIndentPlugin).plugin.inject.nodeProps!;

    expect(
      nodeProps.transformNodeValue!({
        ...createPluginContext(editor, plugin),
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
        type: KEYS.p,
      },
    ]);
  });

  it('applies and clears text indent through the typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseTextIndentPlugin],
      initialValue: [
        {
          children: [{ text: 'One' }],
          type: 'p',
        },
      ],
    });
    const nodeKey = editor.plugin(KEYS.textIndent).type;

    editor.update.textIndent.set(2, { at: [0] });
    expect(editor.read.children()[0]).toMatchObject({ [nodeKey]: 2 });

    editor.update.textIndent.unset({ at: [0] });
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
          type: 'p',
        },
      ],
    });

    editor.update.textIndent.set(2, { at: [0] });

    expect(editor.read.children()[0]).toMatchObject({ textIndent: 2 });
    expect(editor.read.children()[0]).not.toHaveProperty('legacyTextIndent');

    editor.update.textIndent.unset({ at: [0] });

    expect(editor.read.children()[0]).not.toHaveProperty('textIndent');
  });
});

describe('basic style HTML codecs', () => {
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
          align: 'center',
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
          type: KEYS.p,
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
