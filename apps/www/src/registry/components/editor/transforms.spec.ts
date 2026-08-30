import {
  PLUGINS,
  type Selection,
  SelectionApi,
  type Value,
  schema,
} from 'platejs';
import { BaseDetailsPlugin } from 'platejs/details';
import { BaseColumnPlugin } from 'platejs/layout';
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BasePlaceholderPlugin,
  BaseVideoPlugin,
} from 'platejs/media';
import {
  CodeBlockPlugin,
  createEditor,
  definePlatePlugin,
} from 'platejs/react';
import { SuggestionPlugin } from 'platejs/suggestion/react';
import { BaseTocPlugin } from 'platejs/toc';

import { linkPlugin } from '@/registry/components/editor/link';

import { BaseBasicBlocksKit } from './basic-blocks-static';
import { BaseDetailsKit } from './details-static';
import { BaseListKit } from './list-static';
import {
  applyBlockAction,
  insertBlock,
  insertInlineElement,
} from './transforms';

const CustomBlockPlugin = definePlatePlugin('customOwner', {
  schema: {
    element: { ...schema.element.textBlock(), type: 'customBlock' },
  },
});

const createTestEditor = ({
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
  createEditor({
    plugins: [
      ...BaseBasicBlocksKit,
      ...BaseListKit,
      ...BaseDetailsKit,
      CodeBlockPlugin,
      linkPlugin,
      BaseAudioPlugin,
      BaseFilePlugin,
      BasePlaceholderPlugin,
      BaseVideoPlugin,
      BaseColumnPlugin,
      BaseTocPlugin,
      SuggestionPlugin,
      CustomBlockPlugin,
    ],
    selection,
    initialValue,
  });

describe('editor block transforms', () => {
  it('opens the floating link owner without a stale trigger API', () => {
    const editor = createTestEditor();

    insertInlineElement(editor, PLUGINS.link);

    expect(editor.plugin(linkPlugin).store.get()).toMatchObject({
      mode: 'insert',
      openEditorId: editor.id,
      text: '',
    });
  });

  it('keeps selection inside the wrapped paragraph when turning a block into a blockquote', () => {
    const editor = createTestEditor();

    applyBlockAction(editor, PLUGINS.blockquote);

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'paragraph' },
      {
        children: [{ children: [{ text: 'two' }], type: 'paragraph' }],
        type: 'blockquote',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 2, path: [1, 0, 0] },
      focus: { offset: 2, path: [1, 0, 0] },
    });
  });

  it('keeps selection inside the wrapped paragraph when turning a path into a blockquote', () => {
    const editor = createTestEditor();

    applyBlockAction(editor, PLUGINS.blockquote, { at: [1] });

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'paragraph' },
      {
        children: [{ children: [{ text: 'two' }], type: 'paragraph' }],
        type: 'blockquote',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 2, path: [1, 0, 0] },
      focus: { offset: 2, path: [1, 0, 0] },
    });
  });

  it('does not nest a blockquote inside an active blockquote', () => {
    const editor = createTestEditor({
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
    const editor = createTestEditor();

    applyBlockAction(editor, 'disc');

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'paragraph' },
      {
        children: [{ text: 'two' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
    ]);
  });

  it('turns the block under an expanded selection into a heading', () => {
    const selection = {
      kind: 'text' as const,
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 3, path: [1, 0] },
    };
    const editor = createTestEditor({ selection });

    applyBlockAction(editor, 'heading-1');

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'paragraph' },
      { children: [{ text: 'two' }], level: 1, type: 'heading' },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: selection.anchor,
      focus: selection.focus,
    });
  });

  it('upserts a list action by its list identity', () => {
    const editor = createTestEditor({
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

    insertBlock(editor, 'disc', { upsert: true });

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'paragraph' },
      {
        children: [{ text: '' }],
        indent: 1,
        listType: 'bulleted',
        type: 'paragraph',
      },
    ]);
  });

  it('keeps TOC placement options out of the element properties', () => {
    const editor = createTestEditor();

    insertBlock(editor, PLUGINS.toc);

    expect(editor.read.children()[2]).toEqual({
      children: [{ text: '' }],
      type: 'toc',
    });
  });

  it('inserts valid Details through the feature owner', () => {
    const editor = createTestEditor();

    insertBlock(editor, PLUGINS.details);

    expect(editor.read.children()[2]).toMatchObject({
      children: [
        { children: [{ text: '' }], type: 'summary' },
        { children: [{ text: '' }], type: 'paragraph' },
      ],
      type: 'details',
    });
    expect(
      editor.plugin(BaseDetailsPlugin).store.get('isOpen', editor.key([2])!)
    ).toBe(true);
  });

  it('wraps selected blocks when turning them into Details', () => {
    const editor = createTestEditor({
      selection: SelectionApi.nodes([[0], [1]]),
    });

    applyBlockAction(editor, PLUGINS.details);

    expect(editor.read.children()).toMatchObject([
      {
        children: [
          { children: [{ text: 'one' }], type: 'summary' },
          { children: [{ text: 'two' }], type: 'paragraph' },
        ],
        type: 'details',
      },
    ]);
  });

  it('resolves the three-column action through the column plugin', () => {
    const editor = createTestEditor();

    insertBlock(editor, 'action_three_columns');

    expect(editor.read.children()[2]).toMatchObject({
      children: [{ type: 'column' }, { type: 'column' }, { type: 'column' }],
      type: 'columnGroup',
    });
  });

  it('selects the inserted blockquote paragraph instead of the previous block', () => {
    const editor = createTestEditor();

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
      anchor: { offset: 0, path: [2, 0, 0] },
      focus: { offset: 0, path: [2, 0, 0] },
    });
  });

  it('selects the inserted blockquote when replacing an empty current block', () => {
    const editor = createTestEditor({
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
      anchor: { offset: 0, path: [1, 0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });
  });

  it('inserts a block and removes the empty source in one commit', () => {
    const editor = createTestEditor({
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

    insertBlock(editor, 'heading-2');

    expect(editor.read.lastCommit()?.version).toBe(version + 1);
    expect(editor.read.children()).toMatchObject([
      { children: [{ text: 'one' }], type: 'paragraph' },
      { children: [{ text: '' }], level: 2, type: 'heading' },
    ]);
  });

  it('keeps a code block converted in place from an empty paragraph', () => {
    const editor = createTestEditor({
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

  it.each([PLUGINS.audio, PLUGINS.file, PLUGINS.video])(
    'inserts a %s placeholder through its plugin owner',
    (mediaType) => {
      const editor = createTestEditor({
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
    }
  );
});
