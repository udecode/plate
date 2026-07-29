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
  getEditorPlugin,
} from '@platejs/core';
import { getRenderNodeStaticProps } from '@platejs/core/static/internal';
import { ContentSlice } from '@platejs/plite';
import { writeHostFragmentData } from '@platejs/plite-dom';
import { KEYS } from '@platejs/utils';

describe('BaseFontBackgroundColorPlugin', () => {
  it('parses html background-color styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontBackgroundColorPlugin],
    });
    const plugin = editor.getPlugin(BaseFontBackgroundColorPlugin);

    expect(plugin.inject.nodeProps).toEqual({
      styleKey: 'backgroundColor',
    });
    expect(editor.getInjectProps(BaseFontBackgroundColorPlugin)).toMatchObject({
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

  it('uses the resolved plugin type as its sole storage and render key', () => {
    const BackgroundColorPlugin = BaseFontBackgroundColorPlugin.configure({
      type: 'highlight',
    });
    const editor = createBaseEditor({
      plugins: [BackgroundColorPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    expect(editor.getInjectProps(BackgroundColorPlugin)).toMatchObject({
      nodeKey: 'highlight',
      styleKey: 'backgroundColor',
    });
    expect(
      getRenderNodeStaticProps({
        editor,
        props: {
          attributes: {},
          children: null,
          text: { backgroundColor: 'red', text: 'text' },
        },
      }).attributes.style
    ).toBeUndefined();
    expect(
      getRenderNodeStaticProps({
        editor,
        props: {
          attributes: {},
          children: null,
          text: { highlight: 'yellow', text: 'text' },
        },
      }).attributes.style
    ).toEqual({ backgroundColor: 'yellow' });

    const parsed = editor.api.html.deserialize({
      element: '<span style="background-color: red">text</span>',
    });

    expect(parsed).toEqual([
      {
        children: [{ highlight: 'red', text: 'text' }],
        type: KEYS.p,
      },
    ]);

    editor.update.backgroundColor.set('yellow');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      highlight: 'yellow',
      text: 'text',
    });
    expect(editor.read.children()[0]?.children[0]).not.toHaveProperty(
      'backgroundColor'
    );

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
    const plugin = editor.getPlugin(BaseFontColorPlugin);

    expect(plugin.inject.nodeProps).toEqual({
      defaultNodeValue: 'black',
      styleKey: 'color',
    });
    expect(editor.getInjectProps(BaseFontColorPlugin)).toMatchObject({
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

  it('uses the resolved plugin type as its sole storage and render key', () => {
    const FontColorPlugin = BaseFontColorPlugin.configure({
      type: 'ink',
    });
    const editor = createBaseEditor({
      plugins: [FontColorPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    expect(editor.getInjectProps(FontColorPlugin)).toMatchObject({
      nodeKey: 'ink',
      styleKey: 'color',
    });
    expect(
      getRenderNodeStaticProps({
        editor,
        props: {
          attributes: {},
          children: null,
          text: { color: 'red', text: 'text' },
        },
      }).attributes.style
    ).toBeUndefined();
    expect(
      getRenderNodeStaticProps({
        editor,
        props: {
          attributes: {},
          children: null,
          text: { ink: 'blue', text: 'text' },
        },
      }).attributes.style
    ).toEqual({ color: 'blue' });

    const parsed = editor.api.html.deserialize({
      element: '<span style="color: red">text</span>',
    });

    expect(parsed).toEqual([
      {
        children: [{ ink: 'red', text: 'text' }],
        type: KEYS.p,
      },
    ]);

    editor.update.color.set('blue');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      ink: 'blue',
      text: 'text',
    });
    expect(editor.read.children()[0]?.children[0]).not.toHaveProperty('color');

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
    const plugin = editor.getPlugin(BaseFontFamilyPlugin);

    expect(plugin.inject.nodeProps).toEqual({
      styleKey: 'fontFamily',
    });
    expect(editor.getInjectProps(BaseFontFamilyPlugin)).toMatchObject({
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

  it('uses the resolved plugin type as its sole storage and render key', () => {
    const FontFamilyPlugin = BaseFontFamilyPlugin.configure({
      type: 'typeface',
    });
    const editor = createBaseEditor({
      plugins: [FontFamilyPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    expect(editor.getInjectProps(FontFamilyPlugin)).toMatchObject({
      nodeKey: 'typeface',
      styleKey: 'fontFamily',
    });
    expect(
      getRenderNodeStaticProps({
        editor,
        props: {
          attributes: {},
          children: null,
          text: { fontFamily: 'serif', text: 'text' },
        },
      }).attributes.style
    ).toBeUndefined();
    expect(
      getRenderNodeStaticProps({
        editor,
        props: {
          attributes: {},
          children: null,
          text: { text: 'text', typeface: 'monospace' },
        },
      }).attributes.style
    ).toEqual({ fontFamily: 'monospace' });

    const parsed = editor.api.html.deserialize({
      element: '<span style="font-family: serif">text</span>',
    });

    expect(parsed).toEqual([
      {
        children: [{ text: 'text', typeface: 'serif' }],
        type: KEYS.p,
      },
    ]);

    editor.update.fontFamily.set('monospace');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      text: 'text',
      typeface: 'monospace',
    });
    expect(editor.read.children()[0]?.children[0]).not.toHaveProperty(
      'fontFamily'
    );
  });
});

describe('BaseFontSizePlugin', () => {
  it('parses html font-size styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontSizePlugin],
    });
    const plugin = editor.getPlugin(BaseFontSizePlugin);

    expect(plugin.inject.nodeProps).toEqual({
      styleKey: 'fontSize',
    });
    expect(editor.getInjectProps(BaseFontSizePlugin)).toMatchObject({
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

  it('uses the resolved plugin type as its sole storage and render key', () => {
    const FontSizePlugin = BaseFontSizePlugin.configure({
      type: 'fontScale',
    });
    const editor = createBaseEditor({
      plugins: [FontSizePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    expect(editor.getInjectProps(FontSizePlugin)).toMatchObject({
      nodeKey: 'fontScale',
      styleKey: 'fontSize',
    });
    expect(
      getRenderNodeStaticProps({
        editor,
        props: {
          attributes: {},
          children: null,
          text: { fontSize: '16px', text: 'text' },
        },
      }).attributes.style
    ).toBeUndefined();
    expect(
      getRenderNodeStaticProps({
        editor,
        props: {
          attributes: {},
          children: null,
          text: { fontScale: '20px', text: 'text' },
        },
      }).attributes.style
    ).toEqual({ fontSize: '20px' });

    const parsed = editor.api.html.deserialize({
      element: '<span style="font-size: 18px">text</span>',
    });

    expect(parsed).toEqual([
      {
        children: [{ fontScale: '18px', text: 'text' }],
        type: KEYS.p,
      },
    ]);

    editor.update.fontSize.set('20px');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      fontScale: '20px',
      text: 'text',
    });
    expect(editor.read.children()[0]?.children[0]).not.toHaveProperty(
      'fontSize'
    );
  });
});

describe('BaseFontWeightPlugin', () => {
  it('parses html font-weight styles into leaf marks', () => {
    const editor = createBaseEditor({
      plugins: [BaseFontWeightPlugin],
    });
    const plugin = editor.getPlugin(BaseFontWeightPlugin);

    expect(plugin.inject.nodeProps).toEqual({
      styleKey: 'fontWeight',
    });
    expect(editor.getInjectProps(BaseFontWeightPlugin)).toMatchObject({
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

  it('uses the resolved plugin type as its sole storage and render key', () => {
    const FontWeightPlugin = BaseFontWeightPlugin.configure({
      type: 'emphasisWeight',
    });
    const editor = createBaseEditor({
      plugins: [FontWeightPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 4, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'text' }], type: KEYS.p }],
    });

    expect(editor.getInjectProps(FontWeightPlugin)).toMatchObject({
      nodeKey: 'emphasisWeight',
      styleKey: 'fontWeight',
    });
    expect(
      getRenderNodeStaticProps({
        editor,
        props: {
          attributes: {},
          children: null,
          text: { fontWeight: '400', text: 'text' },
        },
      }).attributes.style
    ).toBeUndefined();
    expect(
      getRenderNodeStaticProps({
        editor,
        props: {
          attributes: {},
          children: null,
          text: { emphasisWeight: '700', text: 'text' },
        },
      }).attributes.style
    ).toEqual({ fontWeight: '700' });

    const parsed = editor.api.html.deserialize({
      element: '<span style="font-weight: 700">text</span>',
    });

    expect(parsed).toEqual([
      {
        children: [{ emphasisWeight: '700', text: 'text' }],
        type: KEYS.p,
      },
    ]);

    editor.update.fontWeight.set('700');

    expect(editor.read.children()[0]?.children[0]).toMatchObject({
      emphasisWeight: '700',
      text: 'text',
    });
    expect(editor.read.children()[0]?.children[0]).not.toHaveProperty(
      'fontWeight'
    );
  });
});

describe('BaseLineHeightPlugin', () => {
  it('exposes the injected block contract and typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseLineHeightPlugin],
    });
    const plugin = editor.getPlugin(BaseLineHeightPlugin);

    expect(plugin.inject.isBlock).toBe(true);
    expect(plugin.targetPluginKeys).toEqual([KEYS.p]);
    expect(editor.getInjectProps(BaseLineHeightPlugin)).toMatchObject({
      defaultNodeValue: 1.5,
      nodeKey: 'lineHeight',
    });
    expect(editor.read.schema.property(BaseLineHeightPlugin)?.value.kind).toBe(
      'json'
    );
    expect(typeof editor.update.lineHeight.set).toBe('function');
  });

  it('derives schema and injection targets from configured plugin keys', () => {
    const ParagraphPlugin = BaseParagraphPlugin.configure({
      type: 'custom-paragraph',
    });
    const LineHeightPlugin = BaseLineHeightPlugin.configure({
      targetPluginKeys: [KEYS.p],
    });
    const editor = createBaseEditor({
      plugins: [ParagraphPlugin, LineHeightPlugin],
    });
    const plugin = editor.getPlugin(LineHeightPlugin);

    expect(plugin.targetPluginKeys).toEqual([KEYS.p]);
    expect(
      editor.read.schema.property({
        key: KEYS.lineHeight,
        placement: 'element',
        type: 'custom-paragraph',
      })?.value.kind
    ).toBe('json');
    expect(
      editor.read.schema.property({
        key: KEYS.lineHeight,
        placement: 'element',
        type: KEYS.p,
      })
    ).toBeNull();
  });

  it('rejects non-number and non-string line heights', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseLineHeightPlugin],
    });

    expect(() =>
      editor.read.schema.validateDocument({
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
        [editor.getType(KEYS.lineHeight)]: 2,
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

  it('uses the resolved plugin type as its sole storage key', () => {
    const LineHeightPlugin = BaseLineHeightPlugin.configure({
      inject: {
        nodeProps: {
          nodeKey: 'legacyLineHeight',
        },
      },
      type: 'leading',
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
        leading: 2,
        type: KEYS.p,
      },
    ]);

    editor.update.lineHeight.set(2);

    expect(editor.read.children()[0]).toMatchObject({ leading: 2 });
    expect(editor.read.children()[0]).not.toHaveProperty('legacyLineHeight');

    editor.update.lineHeight.set(1.5);

    expect(editor.read.children()[0]).not.toHaveProperty('leading');
  });
});

describe('BaseTextAlignPlugin', () => {
  it('exposes the injected block contract and typed tx group', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseTextAlignPlugin],
    });
    const plugin = editor.getPlugin(BaseTextAlignPlugin);

    expect(plugin.inject.isBlock).toBe(true);
    expect(plugin.targetPluginKeys).toEqual([KEYS.p]);
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

  it('derives schema and injection targets from configured plugin keys', () => {
    const ParagraphPlugin = BaseParagraphPlugin.configure({
      type: 'custom-paragraph',
    });
    const TextAlignPlugin = BaseTextAlignPlugin.configure({
      targetPluginKeys: [KEYS.p],
    });
    const editor = createBaseEditor({
      plugins: [ParagraphPlugin, TextAlignPlugin],
    });
    const plugin = editor.getPlugin(TextAlignPlugin);

    expect(plugin.targetPluginKeys).toEqual([KEYS.p]);
    expect(
      editor.read.schema.property({
        key: 'align',
        placement: 'element',
        type: 'custom-paragraph',
      })?.value.kind
    ).toBe('string');
    expect(
      editor.read.schema.property({
        key: 'align',
        placement: 'element',
        type: KEYS.p,
      })
    ).toBeNull();
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
        [editor.getType(KEYS.textAlign)]: 'center',
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
    const nodeKey = editor.getType(KEYS.textAlign);

    editor.update.textAlign.set('center');
    expect(editor.read.children()[0]).toMatchObject({ [nodeKey]: 'center' });

    editor.update.textAlign.set('start');
    expect(editor.read.children()[0]).not.toHaveProperty(nodeKey);
  });

  it('uses the resolved plugin type as its sole storage key', () => {
    const TextAlignPlugin = BaseTextAlignPlugin.configure({
      inject: {
        nodeProps: {
          nodeKey: 'legacyAlign',
        },
      },
      type: 'textAlignment',
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
        children: [{ text: 'text' }],
        textAlignment: 'center',
        type: KEYS.p,
      },
    ]);

    editor.update.textAlign.set('center');

    expect(editor.read.children()[0]).toMatchObject({
      textAlignment: 'center',
    });
    expect(editor.read.children()[0]).not.toHaveProperty('legacyAlign');

    editor.update.textAlign.set('start');

    expect(editor.read.children()[0]).not.toHaveProperty('textAlignment');
  });
});

describe('BaseTextIndentPlugin', () => {
  it('exposes the default injected block contract', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseTextIndentPlugin],
    });
    const plugin = editor.getPlugin(BaseTextIndentPlugin);
    const nodeProps = editor.getInjectProps(BaseTextIndentPlugin);
    const transformNodeValue = nodeProps.transformNodeValue!;

    expect(plugin.inject.isBlock).toBe(true);
    expect(plugin.targetPluginKeys).toEqual([KEYS.p]);
    expect(nodeProps).toMatchObject({
      nodeKey: 'textIndent',
      styleKey: 'textIndent',
    });
    expect(
      transformNodeValue({
        ...getEditorPlugin(editor, plugin),
        nodeValue: 2,
      })
    ).toBe('48px');
    expect(editor.read.schema.property(BaseTextIndentPlugin)?.value.kind).toBe(
      'number'
    );
  });

  it('derives schema and injection targets from configured plugin keys', () => {
    const ParagraphPlugin = BaseParagraphPlugin.configure({
      type: 'custom-paragraph',
    });
    const TextIndentPlugin = BaseTextIndentPlugin.configure({
      targetPluginKeys: [KEYS.p],
    });
    const editor = createBaseEditor({
      plugins: [ParagraphPlugin, TextIndentPlugin],
    });
    const plugin = editor.getPlugin(TextIndentPlugin);

    expect(plugin.targetPluginKeys).toEqual([KEYS.p]);
    expect(
      editor.read.schema.property({
        key: KEYS.textIndent,
        placement: 'element',
        type: 'custom-paragraph',
      })?.value.kind
    ).toBe('number');
    expect(
      editor.read.schema.property({
        key: KEYS.textIndent,
        placement: 'element',
        type: KEYS.p,
      })
    ).toBeNull();
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
    const plugin = editor.getPlugin(TextIndentPlugin);
    const nodeProps = editor.getInjectProps(TextIndentPlugin);

    expect(
      nodeProps.transformNodeValue!({
        ...getEditorPlugin(editor, plugin),
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
    const nodeKey = editor.getType(KEYS.textIndent);

    editor.update.textIndent.set(2, { at: [0] });
    expect(editor.read.children()[0]).toMatchObject({ [nodeKey]: 2 });

    editor.update.textIndent.unset({ at: [0] });
    expect(editor.read.children()[0]).not.toHaveProperty(nodeKey);
  });

  it('uses the resolved plugin type as its sole storage key', () => {
    const TextIndentPlugin = BaseTextIndentPlugin.configure({
      inject: {
        nodeProps: {
          nodeKey: 'legacyTextIndent',
        },
      },
      type: 'firstLineIndent',
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

    expect(editor.read.children()[0]).toMatchObject({ firstLineIndent: 2 });
    expect(editor.read.children()[0]).not.toHaveProperty('legacyTextIndent');

    editor.update.textIndent.unset({ at: [0] });

    expect(editor.read.children()[0]).not.toHaveProperty('firstLineIndent');
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
