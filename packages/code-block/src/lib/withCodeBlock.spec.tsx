/** @jsx jsxt */

import type { SlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';
import { BaseParagraphPlugin, createSlateEditor } from 'platejs';

import { BaseCodeBlockPlugin } from './BaseCodeBlockPlugin';
import { CODE_LINE_TO_DECORATIONS } from './setCodeBlockToDecorations';

jsxt;

const createEditor = ({
  input,
  plugins = [BaseParagraphPlugin, BaseCodeBlockPlugin],
}: {
  input: SlateEditor;
  plugins?: any[];
}) =>
  createSlateEditor({
    plugins,
    selection: input.selection,
    value: input.children,
  });

describe('insert break', () => {
  describe('when cursor is inside code line', () => {
    it('insert a new code line with same indentation', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>
              {'    '}before
              <cursor />
              after
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>{'    '}before</hcodeline>
            <hcodeline>
              {'    '}
              <cursor />
              after
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as any as SlateEditor;

      const editor = createEditor({ input });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
    });

    it('replaces an expanded selection with a code-local line split', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>
              ab
              <anchor />
              cd
              <focus />
              ef
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>ab</hcodeline>
            <hcodeline>
              <cursor />
              ef
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as any as SlateEditor;

      const editor = createEditor({ input });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
      expect(editor.selection).toEqual(output.selection);
    });
  });
});

describe('resetBlock', () => {
  it('unwraps a code block into paragraphs', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            <cursor />
            aa
          </hcodeline>
          <hcodeline>bb</hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>
          <cursor />
          aa
        </hp>
        <hp>bb</hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createEditor({ input });

    editor.tf.resetBlock();

    expect(editor.children).toEqual(output.children);
  });
});

describe('deleteBackward', () => {
  it('keeps deleteBackward local at the start of a non-empty first code line', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            <cursor />
            aa
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const editor = createEditor({ input });

    editor.tf.deleteBackward();

    expect(editor.children).toEqual(input.children);
    expect(editor.selection).toEqual(input.selection);
  });

  it('merges an empty non-first code line into the previous line', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>aa</hcodeline>
          <hcodeline>
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>
            aa
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const editor = createEditor({ input });

    editor.tf.deleteBackward();

    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });

  it('unwraps an empty code block to a plain paragraph', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hp>
          <cursor />
        </hp>
      </editor>
    ) as any as SlateEditor;

    const editor = createEditor({ input });

    editor.tf.deleteBackward();

    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });
});

describe('selectAll', () => {
  it('expands the selection to the whole code block', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            be
            <anchor />
            fo
            <focus />
            re
          </hcodeline>
          <hcodeline>after</hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const editor = createEditor({ input });

    editor.tf.selectAll();

    expect(editor.selection).toEqual({
      anchor: { offset: 0, path: [0, 0, 0] },
      focus: { offset: 5, path: [0, 1, 0] },
    });
  });
});

describe('tab', () => {
  it('indents every selected code line', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            <anchor />
            aa
          </hcodeline>
          <hcodeline>
            bb
            <focus />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>
            {'  '}
            aa
          </hcodeline>
          <hcodeline>
            {'  '}
            bb
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const editor = createEditor({ input });

    expect(editor.tf.tab({ reverse: false })).toBe(true);
    expect(editor.children).toEqual(output.children);
  });

  it('outdents every selected code line when reversed', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            <anchor />
            {'  '}aa
          </hcodeline>
          <hcodeline>
            {'  '}bb
            <focus />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>aa</hcodeline>
          <hcodeline>bb</hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;

    const editor = createEditor({ input });

    expect(editor.tf.tab({ reverse: true })).toBe(true);
    expect(editor.children).toEqual(output.children);
  });
});

describe('apply', () => {
  it('clears cached decorations and redecorates when the code block language changes', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>aa</hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;
    const lowlight = {
      highlight: mock(() => ({ value: [] })),
      highlightAuto: mock(() => ({ value: [] })),
      listLanguages: mock(() => ['json']),
    };

    const editor = createEditor({
      input,
      plugins: [
        BaseParagraphPlugin,
        BaseCodeBlockPlugin.configure({
          options: {
            lowlight: lowlight as any,
          },
        }),
      ],
    });
    const codeLine = editor.children[0].children[0] as any;
    const redecorate = mock();

    editor.api.redecorate = redecorate;

    CODE_LINE_TO_DECORATIONS.set(codeLine, [
      {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 2, path: [0, 0, 0] },
      },
    ] as any);

    editor.tf.setNodes({ lang: 'json' }, { at: [0] });

    expect(CODE_LINE_TO_DECORATIONS.get(codeLine)).toEqual([]);
    expect(redecorate).toHaveBeenCalledTimes(1);
  });

  it('redecorates when language changes to plaintext', () => {
    const input = (
      <editor>
        <hcodeblock lang="javascript">
          <hcodeline>aa</hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;
    const lowlight = {
      highlight: mock(() => ({ value: [] })),
      highlightAuto: mock(() => ({ value: [] })),
      listLanguages: mock(() => ['javascript']),
    };

    const editor = createEditor({
      input,
      plugins: [
        BaseParagraphPlugin,
        BaseCodeBlockPlugin.configure({
          options: {
            lowlight: lowlight as any,
          },
        }),
      ],
    });
    const codeLine = editor.children[0].children[0] as any;
    const redecorate = mock();

    editor.api.redecorate = redecorate;
    CODE_LINE_TO_DECORATIONS.set(codeLine, [
      {
        anchor: { offset: 0, path: [0, 0, 0] },
        className: 'token keyword',
        focus: { offset: 2, path: [0, 0, 0] },
      },
    ] as any);

    editor.tf.setNodes({ lang: 'plaintext' }, { at: [0] });

    expect(CODE_LINE_TO_DECORATIONS.get(codeLine)).toEqual([]);
    expect(redecorate).toHaveBeenCalledTimes(1);
  });

  it('does not redecorate for unrelated code block set_node changes', () => {
    const input = (
      <editor>
        <hcodeblock lang="javascript">
          <hcodeline>aa</hcodeline>
        </hcodeblock>
      </editor>
    ) as any as SlateEditor;
    const lowlight = {
      highlight: mock(() => ({ value: [] })),
      highlightAuto: mock(() => ({ value: [] })),
      listLanguages: mock(() => ['javascript']),
    };

    const editor = createEditor({
      input,
      plugins: [
        BaseParagraphPlugin,
        BaseCodeBlockPlugin.configure({
          options: {
            lowlight: lowlight as any,
          },
        }),
      ],
    });
    const codeLine = editor.children[0].children[0] as any;
    const existingDecorations = [
      {
        anchor: { offset: 0, path: [0, 0, 0] },
        className: 'token keyword',
        focus: { offset: 2, path: [0, 0, 0] },
      },
    ] as any;
    const redecorate = mock();

    editor.api.redecorate = redecorate;
    CODE_LINE_TO_DECORATIONS.set(codeLine, existingDecorations);

    editor.tf.setNodes({ foo: 'bar' } as any, { at: [0] });

    expect(redecorate).not.toHaveBeenCalled();
  });
});
