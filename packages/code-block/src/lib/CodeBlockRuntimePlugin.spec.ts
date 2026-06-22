import type { Value } from 'platejs';
import { BaseLinkPlugin } from '@platejs/link';
import { defineEditorExtension } from '@platejs/slate';
import { createDataTransfer } from '@platejs/test-utils';
import { createLowlight } from 'lowlight';
import { BaseParagraphPlugin } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { BaseCodeBlockPlugin } from './BaseCodeBlockPlugin';

type CodeBlockRuntimePlugin =
  | typeof BaseCodeBlockPlugin
  | typeof BaseLinkPlugin
  | typeof BaseParagraphPlugin;

const createRuntimeDataTransfer = (data: Record<string, string>) =>
  createDataTransfer(new Map(Object.entries(data)));

const createLowlightCodeBlockPlugin = () =>
  BaseCodeBlockPlugin.configure({
    options: { lowlight: createLowlight() },
  }) as typeof BaseCodeBlockPlugin;

const installRedecorateProbe = (editor: unknown, redecorate: () => void) => {
  const runtimeEditor = editor as {
    extend: (extension: ReturnType<typeof defineEditorExtension>) => () => void;
  };

  runtimeEditor.extend(
    defineEditorExtension({
      api: { redecorate },
      name: 'test:redecorate',
    })
  );
};

describe('BaseCodeBlockPlugin Slate v2 runtime', () => {
  it('splits an indented code line on insertBreak', () => {
    const editor = createPlateEditor<Value, CodeBlockRuntimePlugin>({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 10, path: [0, 0, 0] },
        focus: { offset: 10, path: [0, 0, 0] },
      },
      value: [
        {
          children: [
            { children: [{ text: '    beforeafter' }], type: 'code_line' },
          ],
          type: 'code_block',
        },
      ],
    });

    expect(editor.tf.insertBreak()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          { children: [{ text: '    before' }], type: 'code_line' },
          { children: [{ text: '    after' }], type: 'code_line' },
        ],
        type: 'code_block',
      },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 4, path: [0, 1, 0] },
      focus: { offset: 4, path: [0, 1, 0] },
    });
  });

  it('replaces a code-line selection with a split line', () => {
    const editor = createPlateEditor<Value, CodeBlockRuntimePlugin>({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 2, path: [0, 0, 0] },
        focus: { offset: 4, path: [0, 0, 0] },
      },
      value: [
        {
          children: [{ children: [{ text: 'abcdef' }], type: 'code_line' }],
          type: 'code_block',
        },
      ],
    });

    expect(editor.tf.insertBreak()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          { children: [{ text: 'ab' }], type: 'code_line' },
          { children: [{ text: 'ef' }], type: 'code_line' },
        ],
        type: 'code_block',
      },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [0, 1, 0] },
      focus: { offset: 0, path: [0, 1, 0] },
    });
  });

  it('keeps deleteBackward local at the start of a non-empty first code line', () => {
    const editor = createPlateEditor<Value, CodeBlockRuntimePlugin>({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0] },
      },
      value: [
        {
          children: [{ children: [{ text: 'aa' }], type: 'code_line' }],
          type: 'code_block',
        },
      ],
    });

    expect(editor.tf.deleteBackward()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [{ children: [{ text: 'aa' }], type: 'code_line' }],
        type: 'code_block',
      },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [0, 0, 0] },
      focus: { offset: 0, path: [0, 0, 0] },
    });
  });

  it('merges an empty non-first code line into the previous line on deleteBackward', () => {
    const editor = createPlateEditor<Value, CodeBlockRuntimePlugin>({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 0, path: [0, 1, 0] },
        focus: { offset: 0, path: [0, 1, 0] },
      },
      value: [
        {
          children: [
            { children: [{ text: 'aa' }], type: 'code_line' },
            { children: [{ text: '' }], type: 'code_line' },
          ],
          type: 'code_block',
        },
      ],
    });

    expect(editor.tf.deleteBackward()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [{ children: [{ text: 'aa' }], type: 'code_line' }],
        type: 'code_block',
      },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 2, path: [0, 0, 0] },
      focus: { offset: 2, path: [0, 0, 0] },
    });
  });

  it('unwraps an empty code block to a paragraph on deleteBackward', () => {
    const editor = createPlateEditor<Value, CodeBlockRuntimePlugin>({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0] },
      },
      value: [
        {
          children: [{ children: [{ text: '' }], type: 'code_line' }],
          type: 'code_block',
        },
      ],
    });

    expect(editor.tf.deleteBackward()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: '' }], type: 'p' },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('unwraps code lines into paragraphs on resetBlock', () => {
    const editor = createPlateEditor<Value, CodeBlockRuntimePlugin>({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 1, path: [0, 0, 0] },
        focus: { offset: 1, path: [0, 0, 0] },
      },
      value: [
        {
          children: [
            { children: [{ text: 'aa' }], type: 'code_line' },
            { children: [{ text: 'bb' }], type: 'code_line' },
          ],
          type: 'code_block',
        },
      ],
    });

    expect(editor.tf.resetBlock()).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'aa' }], type: 'p' },
      { children: [{ text: 'bb' }], type: 'p' },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 1, path: [0, 0] },
      focus: { offset: 1, path: [0, 0] },
    });
  });

  it('normalizes non-code-line children into code lines', () => {
    const editor = createPlateEditor<Value, CodeBlockRuntimePlugin>({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      runtime: 'slate-v2',
      value: [
        {
          children: [
            { children: [{ text: 'line 1' }], type: 'p' },
            { children: [{ text: 'line 2' }], type: 'code_line' },
          ],
          type: 'code_block',
        },
      ],
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          { children: [{ text: 'line 1' }], type: 'code_line' },
          { children: [{ text: 'line 2' }], type: 'code_line' },
        ],
        type: 'code_block',
      },
    ]);
  });

  it('inserts code-block fragments as code lines inside a code block', () => {
    const editor = createPlateEditor<Value, CodeBlockRuntimePlugin>({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 5, path: [0, 1, 0] },
        focus: { offset: 5, path: [0, 1, 0] },
      },
      value: [
        {
          children: [
            { children: [{ text: '' }], type: 'code_line' },
            { children: [{ text: 'hello' }], type: 'code_line' },
          ],
          type: 'code_block',
        },
      ],
    });

    expect(
      editor.tf.insertFragment([
        {
          children: [
            { children: [{ text: 'world' }], type: 'code_line' },
            { children: [{ text: '!' }], type: 'code_line' },
          ],
          type: 'code_block',
        },
      ])
    ).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          { children: [{ text: '' }], type: 'code_line' },
          { children: [{ text: 'helloworld' }], type: 'code_line' },
          { children: [{ text: '!' }], type: 'code_line' },
        ],
        type: 'code_block',
      },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 1, path: [0, 2, 0] },
      focus: { offset: 1, path: [0, 2, 0] },
    });
  });

  it('converts non-code-block fragments to code lines inside a code block', () => {
    const editor = createPlateEditor<Value, CodeBlockRuntimePlugin>({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 5, path: [0, 1, 0] },
        focus: { offset: 5, path: [0, 1, 0] },
      },
      value: [
        {
          children: [
            { children: [{ text: '' }], type: 'code_line' },
            { children: [{ text: 'hello' }], type: 'code_line' },
          ],
          type: 'code_block',
        },
      ],
    });

    expect(
      editor.tf.insertFragment([
        { children: [{ text: 'world' }], type: 'p' },
        { children: [{ text: '!' }], type: 'p' },
      ])
    ).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          { children: [{ text: '' }], type: 'code_line' },
          { children: [{ text: 'helloworld' }], type: 'code_line' },
          { children: [{ text: '!' }], type: 'code_line' },
        ],
        type: 'code_block',
      },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 1, path: [0, 2, 0] },
      focus: { offset: 1, path: [0, 2, 0] },
    });
  });

  it('inserts plain text data lines into the current code block', () => {
    const editor = createPlateEditor<Value, CodeBlockRuntimePlugin>({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 5, path: [0, 1, 0] },
        focus: { offset: 5, path: [0, 1, 0] },
      },
      value: [
        {
          children: [
            { children: [{ text: '' }], type: 'code_line' },
            { children: [{ text: 'hello' }], type: 'code_line' },
          ],
          type: 'code_block',
        },
      ],
    });

    expect(
      editor.tf.insertData(
        createRuntimeDataTransfer({
          'text/plain': 'world\n!',
        })
      )
    ).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          { children: [{ text: '' }], type: 'code_line' },
          { children: [{ text: 'helloworld' }], type: 'code_line' },
          { children: [{ text: '!' }], type: 'code_line' },
        ],
        type: 'code_block',
      },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 1, path: [0, 2, 0] },
      focus: { offset: 1, path: [0, 2, 0] },
    });
  });

  it('creates a code block from VSCode data outside code blocks', () => {
    const editor = createPlateEditor<Value, CodeBlockRuntimePlugin>({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      value: [{ children: [{ text: '' }], type: 'p' }],
    });

    expect(
      editor.tf.insertData(
        createRuntimeDataTransfer({
          'text/plain': 'const a = "b";\nconst c = "d";',
          'vscode-editor-data': JSON.stringify({ mode: 'typescript' }),
        })
      )
    ).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: '' }], type: 'p' },
      {
        children: [
          { children: [{ text: 'const a = "b";' }], type: 'code_line' },
          { children: [{ text: 'const c = "d";' }], type: 'code_line' },
        ],
        lang: 'typescript',
        type: 'code_block',
      },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 14, path: [1, 1, 0] },
      focus: { offset: 14, path: [1, 1, 0] },
    });
  });

  it('inserts VSCode data lines into the current code block', () => {
    const editor = createPlateEditor<Value, CodeBlockRuntimePlugin>({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0] },
      },
      value: [
        {
          children: [{ children: [{ text: '' }], type: 'code_line' }],
          type: 'code_block',
        },
      ],
    });

    expect(
      editor.tf.insertData(
        createRuntimeDataTransfer({
          'text/plain': 'const a = "b";\nconst c = "d";',
          'vscode-editor-data': JSON.stringify({ mode: 'typescript' }),
        })
      )
    ).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          { children: [{ text: 'const a = "b";' }], type: 'code_line' },
          { children: [{ text: 'const c = "d";' }], type: 'code_line' },
        ],
        type: 'code_block',
      },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 14, path: [0, 1, 0] },
      focus: { offset: 14, path: [0, 1, 0] },
    });
  });

  it('keeps pasted comment text as code when link plugin is present', () => {
    const editor = createPlateEditor<Value, CodeBlockRuntimePlugin>({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin, BaseLinkPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 0, path: [0, 0, 0] },
      },
      value: [
        {
          children: [{ children: [{ text: '' }], type: 'code_line' }],
          type: 'code_block',
        },
      ],
    });

    expect(
      editor.tf.insertData(
        createRuntimeDataTransfer({
          'text/plain': '// comment\nconsole.log("hello");',
        })
      )
    ).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          { children: [{ text: '// comment' }], type: 'code_line' },
          { children: [{ text: 'console.log("hello");' }], type: 'code_line' },
        ],
        type: 'code_block',
      },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 21, path: [0, 1, 0] },
      focus: { offset: 21, path: [0, 1, 0] },
    });
  });

  it('redecorates when the code block language changes', () => {
    let redecorateCalls = 0;
    const editor = createPlateEditor<Value, CodeBlockRuntimePlugin>({
      plugins: [BaseParagraphPlugin, createLowlightCodeBlockPlugin()],
      runtime: 'slate-v2',
      value: [
        {
          children: [
            { children: [{ text: 'const a = 1;' }], type: 'code_line' },
          ],
          type: 'code_block',
        },
      ],
    });

    installRedecorateProbe(editor, () => {
      redecorateCalls++;
    });

    editor.update((tx) => {
      tx.nodes.set({ lang: 'typescript' }, { at: [0] });
    });

    expect(redecorateCalls).toBe(1);
  });

  it('does not redecorate for unrelated code block property changes', () => {
    let redecorateCalls = 0;
    const editor = createPlateEditor<Value, CodeBlockRuntimePlugin>({
      plugins: [BaseParagraphPlugin, createLowlightCodeBlockPlugin()],
      runtime: 'slate-v2',
      value: [
        {
          children: [
            { children: [{ text: 'const a = 1;' }], type: 'code_line' },
          ],
          type: 'code_block',
        },
      ],
    });

    installRedecorateProbe(editor, () => {
      redecorateCalls++;
    });

    editor.update((tx) => {
      tx.nodes.set({ id: 'code-1' }, { at: [0] });
    });

    expect(redecorateCalls).toBe(0);
  });

  it('selects the whole code block from an inner code line selection', () => {
    const editor = createPlateEditor<Value, CodeBlockRuntimePlugin>({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 2, path: [0, 0, 0] },
        focus: { offset: 4, path: [0, 0, 0] },
      },
      value: [
        {
          children: [
            { children: [{ text: 'before' }], type: 'code_line' },
            { children: [{ text: 'after' }], type: 'code_line' },
          ],
          type: 'code_block',
        },
      ],
    });

    expect(editor.tf.selectAll()).toBe(true);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 0, path: [0, 0, 0] },
      focus: { offset: 5, path: [0, 1, 0] },
    });
  });

  it('indents and outdents selected code lines on tab', () => {
    const editor = createPlateEditor<Value, CodeBlockRuntimePlugin>({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 2, path: [0, 1, 0] },
      },
      value: [
        {
          children: [
            { children: [{ text: 'aa' }], type: 'code_line' },
            { children: [{ text: 'bb' }], type: 'code_line' },
          ],
          type: 'code_block',
        },
      ],
    });

    expect(editor.tf.tab({ reverse: false })).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          { children: [{ text: '  aa' }], type: 'code_line' },
          { children: [{ text: '  bb' }], type: 'code_line' },
        ],
        type: 'code_block',
      },
    ]);

    expect(editor.tf.tab({ reverse: true })).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [
          { children: [{ text: 'aa' }], type: 'code_line' },
          { children: [{ text: 'bb' }], type: 'code_line' },
        ],
        type: 'code_block',
      },
    ]);
  });

  it('inserts spaces at the collapsed cursor when text exists before it', () => {
    const editor = createPlateEditor<Value, CodeBlockRuntimePlugin>({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      runtime: 'slate-v2',
      selection: {
        anchor: { offset: 2, path: [0, 0, 0] },
        focus: { offset: 2, path: [0, 0, 0] },
      },
      value: [
        {
          children: [{ children: [{ text: 'aabb' }], type: 'code_line' }],
          type: 'code_block',
        },
      ],
    });

    expect(editor.tf.tab({ reverse: false })).toBe(true);
    expect(editor.read((state) => state.value.root())).toEqual([
      {
        children: [{ children: [{ text: 'aa  bb' }], type: 'code_line' }],
        type: 'code_block',
      },
    ]);
    expect(editor.read((state) => state.selection.get())).toEqual({
      anchor: { offset: 4, path: [0, 0, 0] },
      focus: { offset: 4, path: [0, 0, 0] },
    });
  });
});
