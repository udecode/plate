/** @jsx jsxt */

import {
  BaseParagraphPlugin,
  createBaseEditor,
  defineBasePlugin,
} from '@platejs/core';
import {
  createEditor as createRawEditor,
  editorCommands,
  schema,
  type Value,
} from '@platejs/plite';
import { jsxt, type TestEditor } from '@platejs/test-utils';
import { PLUGINS } from '@platejs/utils';

import {
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
  type BlockEquationElement,
  getEquationHtml,
  MathRules,
} from './BaseEquationPlugin';

jsxt;

const CodeLinePlugin = defineBasePlugin(PLUGINS.codeLine, {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
});

const CodeBlockPlugin = defineBasePlugin(PLUGINS.codeBlock, {
  dependencies: [CodeLinePlugin],
  schema: {
    element: {
      content: schema.content.element(CodeLinePlugin, { min: 1 }),
    },
  },
});

describe('BaseEquationPlugin', () => {
  it('configures equation as a void element and exposes its insert update', () => {
    const editor = createBaseEditor({
      plugins: [BaseEquationPlugin],
    });
    const element = { children: [{ text: '' }], type: 'equation' };

    expect(editor.read.schema.isBlock(element)).toBe(true);
    expect(editor.read.schema.isVoid(element)).toBe(true);
    expect(
      editor.read.schema.property({
        key: 'latex',
        placement: 'element',
      })?.value.kind
    ).toBe('string');
    expect(typeof editor.plugin(BaseEquationPlugin).update.insert).toBe(
      'function'
    );
  });

  it('deleteBackward from the next block selects the equation instead of deleting through it', () => {
    const editor = createBaseEditor({
      plugins: [BaseEquationPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        {
          children: [{ text: '' }],
          latex: 'x+1',
          type: 'equation',
        },
        {
          children: [{ text: 'after' }],
          type: 'paragraph',
        },
      ],
    });

    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.value().children).toHaveLength(2);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('inserts the default equation node shape at the cursor', () => {
    const editor = createBaseEditor({
      plugins: [BaseEquationPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'hi' }],
          type: 'paragraph',
        },
      ],
    });

    editor.plugin(BaseEquationPlugin).update.insert();

    expect(editor.read.value().children).toMatchObject([
      {
        children: [{ text: 'hi' }],
        type: 'paragraph',
      },
      {
        children: [{ text: '' }],
        latex: '',
        type: 'equation',
      },
    ]);
  });

  it('respects the explicit insertion target', () => {
    const EquationPlugin = BaseEquationPlugin;
    const editor = createBaseEditor({
      plugins: [EquationPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'a' }, { text: 'b' }],
          type: 'paragraph',
        },
      ],
    });

    editor.plugin(EquationPlugin).update.insert({}, { at: [1] });

    expect(editor.read.value().children).toMatchObject([
      {
        children: [{ text: 'ab' }],
        type: 'paragraph',
      },
      {
        children: [{ text: '' }],
        latex: '',
        type: 'equation',
      },
    ]);
  });

  it('renders KaTeX html and forwards options', () => {
    const element: BlockEquationElement = {
      children: [{ text: '' }],
      latex: 'x^2',
      type: 'equation',
    };

    expect(getEquationHtml({ element })).toContain('katex');
    expect(
      getEquationHtml({
        element,
        options: { displayMode: true },
      })
    ).toContain('katex-display');
  });
});

describe('BaseInlineEquationPlugin', () => {
  it('uses a camelCase plugin identity without changing serialized nodes', () => {
    const editor = createBaseEditor({
      plugins: [BaseInlineEquationPlugin],
    });
    const plugin = editor.plugin(BaseInlineEquationPlugin);
    const element = {
      children: [{ text: '' }],
      type: 'inlineEquation',
    };

    expect(plugin.name).toBe('inlineEquation');
    expect(plugin.name).toBe(PLUGINS.inlineEquation);
    expect(editor.read.schema.isInline(element)).toBe(true);
    expect(editor.read.schema.isVoid(element)).toBe(true);
    expect(
      editor.read.schema.property({
        key: 'latex',
        placement: 'element',
      })?.value.kind
    ).toBe('string');
    expect(editor.plugin(PLUGINS.inlineEquation).name).toBe(
      PLUGINS.inlineEquation
    );
    expect(typeof editor.plugin(BaseInlineEquationPlugin).update.insert).toBe(
      'function'
    );
  });

  it('moves into the inline equation from either text boundary', () => {
    const editor = createBaseEditor({
      plugins: [BaseInlineEquationPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [
        {
          children: [
            { text: 'hi ' },
            {
              children: [{ text: '' }],
              latex: 'x+1',
              type: 'inlineEquation',
            },
            { text: ' after' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update((tx) =>
      tx.selection.move({ distance: 1, unit: 'character' })
    );
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });

    editor.update.selection.set({ offset: 0, path: [0, 2] });
    editor.update((tx) =>
      tx.selection.move({ distance: 1, reverse: true, unit: 'character' })
    );
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });

  it('uses selected text as the default expression', () => {
    const editor = createBaseEditor({
      plugins: [BaseInlineEquationPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'abc' }],
          type: 'paragraph',
        },
      ],
    });

    editor.plugin(BaseInlineEquationPlugin).update.insert();

    expect(editor.read.value().children).toMatchObject([
      {
        children: [
          { text: '' },
          {
            children: [{ text: '' }],
            latex: 'abc',
            type: 'inlineEquation',
          },
          { text: '' },
        ],
        type: 'paragraph',
      },
    ]);
  });

  it('prefers the provided expression', () => {
    const InlineEquationPlugin = BaseInlineEquationPlugin;
    const editor = createBaseEditor({
      plugins: [InlineEquationPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'x' }, { text: 'y' }],
          type: 'paragraph',
        },
      ],
    });

    editor
      .plugin(InlineEquationPlugin)
      .update.insert({ latex: 'x^2' }, { at: { offset: 1, path: [0, 0] } });

    expect(editor.read.value().children).toMatchObject([
      {
        children: [
          { text: 'x' },
          {
            children: [{ text: '' }],
            latex: 'x^2',
            type: 'inlineEquation',
          },
          { text: 'y' },
        ],
        type: 'paragraph',
      },
    ]);
  });
});

describe('math input rules', () => {
  const createEditor = (
    value: TestEditor,
    {
      blockMathRule = MathRules.markdown({ on: 'break', variant: '$$' }),
      inlineMathRule = MathRules.markdown({ variant: '$' }),
      withCodeBlock = false,
    }: {
      blockMathRule?: ReturnType<typeof MathRules.markdown>;
      inlineMathRule?: ReturnType<typeof MathRules.markdown>;
      withCodeBlock?: boolean;
    } = {}
  ) =>
    createBaseEditor({
      editor: createRawEditor<Value>(),
      plugins: [
        BaseParagraphPlugin,
        BaseInlineEquationPlugin.configure({
          inputRules: [inlineMathRule],
        }),
        BaseEquationPlugin.configure({
          inputRules: [blockMathRule],
        }),
        ...(withCodeBlock ? [CodeBlockPlugin] : []),
      ] as const,
      selection: value.selection,
      initialValue: value.children,
    });

  it('converts a completed $...$ sequence into an inline equation on the closing delimiter', () => {
    const input = (
      <editor>
        <hp>
          Math: $x
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createEditor(input);

    editor.update.text.insert('$');

    expect(editor.read.value().children).toEqual([
      {
        children: [
          { text: 'Math: ' },
          {
            children: [{ text: '' }],
            latex: 'x',
            type: 'inlineEquation',
          },
          { text: '' },
        ],
        type: 'paragraph',
      },
    ]);
  });

  it('promotes a $$ paragraph into a block equation on Enter', () => {
    const input = (
      <editor>
        <hp>
          $$
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createEditor(input);
    const end = editor.read.points.end([0]);

    if (!end) throw new Error('Expected paragraph end');

    editor.update((tx) => {
      tx.selection.set(end);
      tx.command(editorCommands.insertBreak);
    });

    expect(editor.read.value().children).toMatchObject([
      {
        latex: '',
        type: 'equation',
      },
    ]);
  });

  it('promotes a $$ prefix into a block equation on the matching delimiter when configured with on: match', () => {
    const input = (
      <editor>
        <hp>
          $
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createEditor(input, {
      blockMathRule: MathRules.markdown({ on: 'match', variant: '$$' }),
    });

    editor.update((tx) => {
      tx.selection.set({
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      });
      tx.command(editorCommands.insertText, { text: '$' });
    });

    expect(editor.read.value().children).toMatchObject([
      {
        latex: '',
        type: 'equation',
      },
    ]);
  });

  it('keeps $...$ literal inside code blocks', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            $x
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

    const editor = createEditor(input, { withCodeBlock: true });

    editor.update.text.insert('$');

    expect(editor.read.value().children).toEqual(
      (
        <editor>
          <hcodeblock>
            <hcodeline>$x$</hcodeline>
          </hcodeblock>
        </editor>
      ).children
    );
  });

  it('converts inline math when an unrelated code block exists', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>const value = 1;</hcodeline>
        </hcodeblock>
        <hp>
          Math: $x
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createEditor(input, { withCodeBlock: true });

    editor.update.text.insert('$');

    expect(editor.read.value().children[1]).toEqual({
      children: [
        { text: 'Math: ' },
        {
          children: [{ text: '' }],
          latex: 'x',
          type: 'inlineEquation',
        },
        { text: '' },
      ],
      type: 'paragraph',
    });
  });

  it('respects app-level enabled overrides for inline math', () => {
    const input = (
      <editor>
        <hp>
          Math: $x
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createEditor(input, {
      inlineMathRule: MathRules.markdown({
        enabled: () => false,
        variant: '$',
      }),
    });

    editor.update.text.insert('$');

    expect(editor.read.value().children).toEqual(
      (
        <editor>
          <hp>Math: $x$</hp>
        </editor>
      ).children
    );
  });
});
