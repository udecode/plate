/** @jsx jsxt */

import {
  BaseParagraphPlugin,
  createBaseEditor,
  createBasePlugin,
} from '@platejs/core';
import { editorCommands, schema } from '@platejs/plite';
import { jsxt, type TestEditor } from '@platejs/test-utils';
import { KEYS, NODES } from '@platejs/utils';

import {
  BaseEquationPlugin,
  BaseInlineEquationPlugin,
  getEquationHtml,
  MathRules,
} from './BaseEquationPlugin';

jsxt;

const CodeLinePlugin = createBasePlugin({
  key: KEYS.codeLine,
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
  type: NODES.codeLine,
});

const CodeBlockPlugin = createBasePlugin({
  key: KEYS.codeBlock,
  dependencies: [CodeLinePlugin],
  schema: ({ plugins }) => {
    const codeLineType = plugins.elementType(CodeLinePlugin);

    return {
      element: {
        content: schema.content.type(codeLineType, {
          default: { type: codeLineType },
          min: 1,
        }),
      },
    };
  },
  type: NODES.codeBlock,
});

describe('BaseEquationPlugin', () => {
  it('configures equation as a void element and exposes its insert update', () => {
    const editor = createBaseEditor({
      plugins: [BaseEquationPlugin],
    });
    const element = { children: [{ text: '' }], type: KEYS.equation };

    expect(editor.read.schema.isBlock(element)).toBe(true);
    expect(editor.read.schema.isVoid(element)).toBe(true);
    expect(editor.read.schema.property(BaseEquationPlugin)?.value.kind).toBe(
      'string'
    );
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
          texExpression: 'x+1',
          type: KEYS.equation,
        },
        {
          children: [{ text: 'after' }],
          type: KEYS.p,
        },
      ],
    });

    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.value().children).toHaveLength(2);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
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
          type: KEYS.p,
        },
      ],
    });

    editor.plugin(BaseEquationPlugin).update.insert();

    expect(editor.read.value().children).toMatchObject([
      {
        children: [{ text: 'hi' }],
        type: KEYS.p,
      },
      {
        children: [{ text: '' }],
        texExpression: '',
        type: KEYS.equation,
      },
    ]);
  });

  it('respects the configured node type and explicit insertion target', () => {
    const EquationPlugin = BaseEquationPlugin.configure({
      type: 'custom-equation',
    });
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
          type: KEYS.p,
        },
      ],
    });

    editor.plugin(EquationPlugin).update.insert({ at: [1] });

    expect(editor.read.value().children).toMatchObject([
      {
        children: [{ text: 'ab' }],
        type: KEYS.p,
      },
      {
        children: [{ text: '' }],
        texExpression: '',
        type: 'custom-equation',
      },
    ]);
  });

  it('renders KaTeX html and forwards options', () => {
    const element = {
      children: [{ text: '' }],
      texExpression: 'x^2',
      type: KEYS.equation,
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
    const plugin = editor.getPlugin(BaseInlineEquationPlugin);
    const element = {
      children: [{ text: '' }],
      type: NODES.inlineEquation,
    };

    expect(plugin.key).toBe('inlineEquation');
    expect(plugin.type).toBe(NODES.inlineEquation);
    expect(editor.read.schema.isInline(element)).toBe(true);
    expect(editor.read.schema.isVoid(element)).toBe(true);
    expect(
      editor.read.schema.property(BaseInlineEquationPlugin)?.value.kind
    ).toBe('string');
    expect(editor.getType(KEYS.inlineEquation)).toBe(NODES.inlineEquation);
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
              texExpression: 'x+1',
              type: NODES.inlineEquation,
            },
            { text: ' after' },
          ],
          type: KEYS.p,
        },
      ],
    });

    editor.update((tx) =>
      tx.selection.move({ distance: 1, unit: 'character' })
    );
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });

    editor.update.selection.set({ offset: 0, path: [0, 2] });
    editor.update((tx) =>
      tx.selection.move({ distance: 1, reverse: true, unit: 'character' })
    );
    expect(editor.read.selection()).toEqual({
      kind: 'text',
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
          type: KEYS.p,
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
            texExpression: 'abc',
            type: NODES.inlineEquation,
          },
          { text: '' },
        ],
        type: KEYS.p,
      },
    ]);
  });

  it('prefers the provided expression and configured node type', () => {
    const InlineEquationPlugin = BaseInlineEquationPlugin.configure({
      type: 'custom-inline-equation',
    });
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
          type: KEYS.p,
        },
      ],
    });

    editor.plugin(InlineEquationPlugin).update.insert({
      at: { offset: 1, path: [0, 0] },
      texExpression: 'x^2',
    });

    expect(editor.read.value().children).toMatchObject([
      {
        children: [
          { text: 'x' },
          {
            children: [{ text: '' }],
            texExpression: 'x^2',
            type: 'custom-inline-equation',
          },
          { text: 'y' },
        ],
        type: KEYS.p,
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
      plugins: [
        BaseParagraphPlugin,
        BaseInlineEquationPlugin.configure({
          inputRules: [inlineMathRule],
        }),
        BaseEquationPlugin.configure({
          inputRules: [blockMathRule],
        }),
        ...(withCodeBlock ? [CodeBlockPlugin] : []),
      ],
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
            texExpression: 'x',
            type: NODES.inlineEquation,
          },
          { text: '' },
        ],
        type: KEYS.p,
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
        texExpression: '',
        type: KEYS.equation,
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
        texExpression: '',
        type: KEYS.equation,
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
          texExpression: 'x',
          type: NODES.inlineEquation,
        },
        { text: '' },
      ],
      type: KEYS.p,
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
