import { createBaseEditor, defineBasePlugin } from '@platejs/core';
import { property, schema } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

import { BaseTocPlugin } from './BaseTocPlugin';

const TestParagraphPlugin = defineBasePlugin(PLUGINS.paragraph, {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
});

const TestHeadingPlugins = [
  defineBasePlugin(PLUGINS.heading, {
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
        properties: { level: property.number({ required: true }) },
      },
    },
  }),
];

describe('BaseTocPlugin', () => {
  it('configures toc as a void element with the shipped defaults', () => {
    const editor = createBaseEditor({
      plugins: [BaseTocPlugin],
    });
    const plugin = editor.plugin(BaseTocPlugin);

    expect(plugin.name).toBe(PLUGINS.toc);
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
        type: 'toc',
      })
    ).toMatchObject({ atom: true, inline: false, void: true });
    expect(editor.read.schema.element(BaseTocPlugin)?.groups).toContain(
      'block'
    );
    expect(editor.plugin(BaseTocPlugin).update.insert).toBeDefined();
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
          type: 'toc',
        },
        {
          children: [{ text: 'after' }],
          type: 'paragraph',
        },
      ],
    });

    editor.update.text.deleteForward({ unit: 'character' });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'after' }],
        type: 'paragraph',
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
          type: 'toc',
        },
        {
          children: [{ text: 'after' }],
          type: 'paragraph',
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
          type: 'toc',
        },
        {
          children: [{ text: 'after' }],
          type: 'paragraph',
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
          type: 'toc',
        },
        {
          children: [{ text: 'after' }],
          type: 'paragraph',
        },
      ],
    });

    editor.update.break.insert();

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: '' }],
        type: 'toc',
      },
      {
        children: [{ text: '' }],
        type: 'paragraph',
      },
      {
        children: [{ text: 'after' }],
        type: 'paragraph',
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
  it('returns titled headings with depth and runtime key without persisted ids', () => {
    const editor = createBaseEditor({
      plugins: [BaseTocPlugin, ...TestHeadingPlugins],
      initialValue: [
        {
          children: [{ text: 'Title' }],
          level: 1,
          type: 'heading',
        },
        {
          children: [{ text: '' }],
          level: 2,
          type: 'heading',
        },
        {
          children: [{ text: 'Body' }],
          type: 'paragraph',
        },
        {
          children: [{ text: 'Section' }],
          level: 3,
          type: 'heading',
        },
      ],
    });

    const headings = editor.plugin(BaseTocPlugin).read.headings();

    expect(headings).toEqual([
      {
        depth: 1,
        key: editor.key([0])!,
        title: 'Title',
        type: 'heading',
      },
      {
        depth: 3,
        key: editor.key([3])!,
        title: 'Section',
        type: 'heading',
      },
    ]);
  });

  it('uses the configured queryHeading override when present', () => {
    const queryHeading = mock((state) => {
      const key = state.key([0]);

      return key
        ? [
            {
              depth: 9,
              key,
              title: 'Custom',
              type: 'custom-heading',
            },
          ]
        : [];
    });
    const editor = createBaseEditor({
      plugins: [
        BaseTocPlugin.configure({ initialState: { queryHeading } }),
        ...TestHeadingPlugins,
      ],
      initialValue: [
        {
          children: [{ text: 'Ignored' }],
          level: 1,
          type: 'heading',
        },
      ],
    });

    expect(editor.plugin(BaseTocPlugin).read.headings()).toEqual([
      {
        depth: 9,
        key: editor.key([0])!,
        title: 'Custom',
        type: 'custom-heading',
      },
    ]);
    expect(queryHeading).toHaveBeenCalledWith(
      expect.objectContaining({ nodes: expect.any(Object) })
    );
  });

  it('keeps heading identity stable when its path changes', () => {
    const editor = createBaseEditor({
      plugins: [BaseTocPlugin, ...TestHeadingPlugins],
      initialValue: [
        {
          children: [{ text: 'Title' }],
          level: 1,
          type: 'heading',
        },
      ],
    });

    const key = editor.key([0])!;

    editor.update.nodes.insert(
      { children: [{ text: 'Before' }], type: 'paragraph' },
      { at: [0] }
    );

    expect(editor.plugin(BaseTocPlugin).read.headings()).toEqual([
      {
        depth: 1,
        key,
        title: 'Title',
        type: 'heading',
      },
    ]);
  });
});

describe('BaseTocPlugin.update.insert', () => {
  it('inserts the default toc node shape', () => {
    const editor = createBaseEditor({
      plugins: [BaseTocPlugin],
      initialValue: [
        {
          children: [{ text: 'a' }],
          type: 'paragraph',
        },
      ],
    });

    editor.plugin(BaseTocPlugin).update.insert({}, { at: [1] });

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'a' }],
        type: 'paragraph',
      },
      {
        children: [{ text: '' }],
        type: 'toc',
      },
    ]);
  });
});
