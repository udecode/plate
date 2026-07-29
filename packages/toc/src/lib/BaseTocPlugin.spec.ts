import { createBaseEditor, createBasePlugin } from '@platejs/core';
import { schema } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

import { BaseTocPlugin } from './BaseTocPlugin';

const TestParagraphPlugin = createBasePlugin({
  key: 'paragraph',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
});

const TestHeadingPlugins = [
  createBasePlugin({
    key: 'h1',
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  }),
  createBasePlugin({
    key: 'h2',
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  }),
  createBasePlugin({
    key: 'h3',
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
  }),
];

describe('BaseTocPlugin', () => {
  it('configures toc as a void element with the shipped defaults', () => {
    const editor = createBaseEditor({
      plugins: [BaseTocPlugin],
    });
    const plugin = editor.getPlugin(BaseTocPlugin);

    expect(plugin.key).toBe(KEYS.toc);
    expect(editor.read.schema.element(BaseTocPlugin)?.behavior.void).toBe(true);
    expect(editor.read.schema.element(BaseTocPlugin)?.behavior.voidKind).toBe(
      'block'
    );
    expect(plugin.initialState).toMatchObject({
      isScroll: true,
      topOffset: 80,
    });
    expect(
      editor.read.schema.getElementBehavior({
        children: [{ text: '' }],
        type: KEYS.toc,
      })
    ).toMatchObject({ atom: true, inline: false, void: true });
    expect(editor.read.schema.element(BaseTocPlugin)?.groups).toContain(
      'block'
    );
    expect(editor.update.toc.insert).toBeDefined();
  });

  it('deleteForward removes the selected toc block', () => {
    const editor = createBaseEditor({
      plugins: [BaseTocPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: '' }],
          type: KEYS.toc,
        },
        {
          children: [{ text: 'after' }],
          type: KEYS.p,
        },
      ],
    });

    editor.update.text.deleteForward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'after' }],
        type: KEYS.p,
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('deleteBackward from the next block selects the toc instead of deleting through it', () => {
    const editor = createBaseEditor({
      plugins: [BaseTocPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        {
          children: [{ text: '' }],
          type: KEYS.toc,
        },
        {
          children: [{ text: 'after' }],
          type: KEYS.p,
        },
      ],
    });

    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.children()).toHaveLength(2);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('moveLine from the next block selects the toc instead of entering its empty child', () => {
    const editor = createBaseEditor({
      plugins: [BaseTocPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [1, 0] },
        focus: { offset: 0, path: [1, 0] },
      },
      initialValue: [
        {
          children: [{ text: '' }],
          type: KEYS.toc,
        },
        {
          children: [{ text: 'after' }],
          type: KEYS.p,
        },
      ],
    });

    editor.update.selection.move({ reverse: true, unit: 'line' });

    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('inserts a paragraph after the toc on Enter', () => {
    const editor = createBaseEditor({
      plugins: [BaseTocPlugin, TestParagraphPlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: '' }],
          type: KEYS.toc,
        },
        {
          children: [{ text: 'after' }],
          type: KEYS.p,
        },
      ],
    });

    editor.update.break.insert();

    expect(editor.read.children()).toEqual([
      {
        children: [{ text: '' }],
        type: KEYS.toc,
      },
      {
        children: [{ text: '' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'after' }],
        type: KEYS.p,
      },
    ]);
    expect(editor.read.selection()).toEqual({
      kind: 'text',
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
  });
});

describe('BaseTocPlugin.read.headings', () => {
  it('returns titled headings with depth, path, and id', () => {
    const editor = createBaseEditor({
      plugins: [BaseTocPlugin, ...TestHeadingPlugins],
      initialValue: [
        {
          children: [{ text: 'Title' }],
          id: 'a',
          type: 'h1',
        },
        {
          children: [{ text: '' }],
          id: 'skip-empty',
          type: 'h2',
        },
        {
          children: [{ text: 'Body' }],
          id: 'skip-paragraph',
          type: 'p',
        },
        {
          children: [{ text: 'Section' }],
          id: 'b',
          type: 'h3',
        },
      ],
    });

    expect(editor.plugin(BaseTocPlugin).read.headings()).toEqual([
      {
        depth: 1,
        id: 'a',
        path: [0],
        title: 'Title',
        type: 'h1',
      },
      {
        depth: 3,
        id: 'b',
        path: [3],
        title: 'Section',
        type: 'h3',
      },
    ]);
  });

  it('uses the configured queryHeading override when present', () => {
    const queryHeading = mock(() => [
      {
        depth: 9,
        id: 'custom',
        path: [42],
        title: 'Custom',
        type: 'custom-heading',
      },
    ]);
    const editor = createBaseEditor({
      plugins: [
        BaseTocPlugin.configure({ initialState: { queryHeading } }),
        ...TestHeadingPlugins,
      ],
      initialValue: [
        {
          children: [{ text: 'Ignored' }],
          id: 'a',
          type: 'h1',
        },
      ],
    });

    expect(editor.plugin(BaseTocPlugin).read.headings()).toEqual([
      {
        depth: 9,
        id: 'custom',
        path: [42],
        title: 'Custom',
        type: 'custom-heading',
      },
    ]);
    expect(queryHeading).toHaveBeenCalledWith(
      expect.objectContaining({ nodes: expect.any(Object) })
    );
  });
});

describe('BaseTocPlugin.update.insert', () => {
  it('inserts the default toc node shape', () => {
    const editor = createBaseEditor({
      plugins: [BaseTocPlugin],
      initialValue: [
        {
          children: [{ text: 'a' }],
          type: KEYS.p,
        },
      ],
    });

    editor.plugin(BaseTocPlugin).update.insert({ at: [1] });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'a' }],
        type: KEYS.p,
      },
      {
        children: [{ text: '' }],
        type: KEYS.toc,
      },
    ]);
  });

  it('respects the configured node type', () => {
    const editor = createBaseEditor({
      plugins: [BaseTocPlugin.configure({ type: 'custom-toc' })],
      initialValue: [
        {
          children: [{ text: 'a' }],
          type: KEYS.p,
        },
      ],
    });

    editor.plugin(BaseTocPlugin).update.insert({ at: [1] });

    expect(editor.read.children()[1]).toMatchObject({
      children: [{ text: '' }],
      type: 'custom-toc',
    });
  });
});
