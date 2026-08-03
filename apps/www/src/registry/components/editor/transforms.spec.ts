import { PLUGINS } from '@platejs/utils';
import { CodeBlockPlugin } from '@platejs/code-block/react';
import { LinkPlugin } from '@platejs/link/react';
import { BasePlaceholderPlugin } from '@platejs/media';
import { SuggestionPlugin } from '@platejs/suggestion/react';
import { type Selection, type Value, schema } from 'platejs';
import { createPlateEditor, definePlatePlugin } from 'platejs/react';

import { BaseBasicBlocksKit } from './plugins/basic-blocks-base-kit';
import { BaseListKit } from './plugins/list-base-kit';
import { BaseToggleKit } from './plugins/toggle-base-kit';
import {
  applyBlockAction,
  insertBlock,
  insertInlineElement,
} from './transforms';
import {
  applyBlockAction as applyClassicBlockAction,
  insertBlock as insertClassicBlock,
} from './transforms-classic';

const CustomBlockPlugin = definePlatePlugin('customOwner', {
  schema: {
    element: { ...schema.element.textBlock(), type: 'customBlock' },
  },
});

const createEditor = ({
  selection = {
    kind: 'text',
    anchor: { offset: 2, path: [1, 0] },
    focus: { offset: 2, path: [1, 0] },
  },
  initialValue = [
    { children: [{ text: 'one' }], type: 'paragraph' },
    { children: [{ text: 'two' }], type: 'paragraph' },
  ],
}: Partial<{
  initialValue: Value;
  selection: Selection;
}> = {}) =>
  createPlateEditor({
    plugins: [
      ...BaseBasicBlocksKit,
      ...BaseListKit,
      ...BaseToggleKit,
      CodeBlockPlugin,
      LinkPlugin,
      BasePlaceholderPlugin,
      SuggestionPlugin,
      CustomBlockPlugin,
    ],
    selection,
    initialValue,
  });

describe('editor block transforms', () => {
  it('opens the floating link owner without a stale trigger API', () => {
    const editor = createEditor();

    insertInlineElement(editor, PLUGINS.link);

    expect(editor.plugin(LinkPlugin).store.get()).toMatchObject({
      mode: 'insert',
      openEditorId: editor.id,
      text: '',
    });
  });

  it('keeps selection inside the wrapped paragraph when turning a block into a blockquote', () => {
    const editor = createEditor();

    applyBlockAction(editor, PLUGINS.blockquote);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'paragraph' },
      {
        children: [{ children: [{ text: 'two' }], type: 'paragraph' }],
        type: 'blockquote',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 2, path: [1, 0, 0] },
      focus: { offset: 2, path: [1, 0, 0] },
    });
  });

  it('keeps selection inside the wrapped paragraph when turning a path into a blockquote', () => {
    const editor = createEditor();

    applyBlockAction(editor, PLUGINS.blockquote, { at: [1] });

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'paragraph' },
      {
        children: [{ children: [{ text: 'two' }], type: 'paragraph' }],
        type: 'blockquote',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 2, path: [1, 0, 0] },
      focus: { offset: 2, path: [1, 0, 0] },
    });
  });

  it('does not nest a blockquote inside an active blockquote', () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 0, 0] },
        focus: { offset: 2, path: [0, 0, 0] },
      },
      initialValue: [
        {
          children: [{ children: [{ text: 'two' }], type: 'paragraph' }],
          type: 'blockquote',
        },
      ],
    });

    applyBlockAction(editor, PLUGINS.blockquote);

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ children: [{ text: 'two' }], type: 'paragraph' }],
        type: 'blockquote',
      },
    ]);
  });

  it('turns a paragraph into a list inside the owning update', () => {
    const editor = createEditor();

    applyBlockAction(editor, 'disc');

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'paragraph' },
      {
        children: [{ text: 'two' }],
        indent: 1,
        listStyleType: 'disc',
        type: 'paragraph',
      },
    ]);
  });

  it('selects the inserted blockquote paragraph instead of the previous block', () => {
    const editor = createEditor();

    insertBlock(editor, PLUGINS.blockquote);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'paragraph' },
      { children: [{ text: 'two' }], type: 'paragraph' },
      {
        children: [{ children: [{ text: '' }], type: 'paragraph' }],
        type: 'blockquote',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [2, 0, 0] },
      focus: { offset: 0, path: [2, 0, 0] },
    });
  });

  it('selects the inserted blockquote when replacing an empty current block', () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        { children: [{ text: 'one' }], type: 'paragraph' },
        { children: [{ text: '' }], type: 'paragraph' },
      ],
    });

    insertBlock(editor, PLUGINS.blockquote);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'paragraph' },
      {
        children: [{ children: [{ text: '' }], type: 'paragraph' }],
        type: 'blockquote',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [1, 0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });
  });

  it('inserts a block and removes the empty source in one commit', () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        { children: [{ text: 'one' }], type: 'paragraph' },
        { children: [{ text: '' }], type: 'paragraph' },
      ],
    });
    const version = editor.read.lastCommit()?.version ?? 0;

    insertBlock(editor, PLUGINS.h2);

    expect(editor.read.lastCommit()?.version).toBe(version + 1);
    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'paragraph' },
      { children: [{ text: '' }], type: 'h2' },
    ]);
  });

  it('keeps a code block converted in place from an empty paragraph', () => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        { children: [{ text: 'one' }], type: 'paragraph' },
        { children: [{ text: '' }], type: 'paragraph' },
      ],
    });

    insertBlock(editor, PLUGINS.codeBlock);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'paragraph' },
      {
        children: [{ children: [{ text: '' }], type: 'codeLine' }],
        type: 'codeBlock',
      },
    ]);
  });

  it.each([
    PLUGINS.audio,
    PLUGINS.file,
    PLUGINS.video,
  ])('inserts a %s placeholder through its plugin owner', (mediaType) => {
    const editor = createEditor({
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        { children: [{ text: 'one' }], type: 'paragraph' },
        { children: [{ text: '' }], type: 'paragraph' },
      ],
    });

    insertBlock(editor, mediaType);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'paragraph' },
      {
        children: [{ text: '' }],
        mediaType,
        type: 'placeholder',
      },
    ]);
  });
});

describe('classic editor block transforms', () => {
  it('resolves a block action through the owning plugin capability', () => {
    const editor = createEditor();

    applyClassicBlockAction(editor, CustomBlockPlugin.name);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'paragraph' },
      { children: [{ text: 'two' }], type: 'customBlock' },
    ]);
  });

  it('resolves an insert action through the owning plugin capability', () => {
    const editor = createEditor();

    insertClassicBlock(editor, CustomBlockPlugin.name);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'paragraph' },
      { children: [{ text: 'two' }], type: 'paragraph' },
      { children: [{ text: '' }], type: 'customBlock' },
    ]);
  });
});
