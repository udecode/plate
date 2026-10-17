import {
  createEditor,
  createEditorView,
  definePlugin,
  property,
  schema,
  PLUGINS,
} from '../../../core';
import { BaseHeadingPlugin } from '../../basic-nodes';
import { BaseDetailsPlugin, BaseDetailsSummaryPlugin } from '../../details';
import { BaseTocPlugin } from './BaseTocPlugin';

const TestParagraphPlugin = definePlugin(PLUGINS.paragraph, {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
});

const TestHeadingPlugins = [BaseHeadingPlugin];

describe('BaseTocPlugin', () => {
  it('configures toc as a block void element', () => {
    const editor = createEditor({
      plugins: [BaseTocPlugin],
    });
    const plugin = editor.plugin(BaseTocPlugin);

    expect(plugin.name).toBe(PLUGINS.toc);
    expect(plugin.store.get('queryHeading')).toBeNull();
    expect(editor.read.schema.element(BaseTocPlugin)?.behavior.void).toBe(true);
    expect(editor.read.schema.element(BaseTocPlugin)?.behavior.voidKind).toBe(
      'block'
    );
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
    const editor = createEditor({
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
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('deleteBackward from the next block selects the toc instead of deleting through it', () => {
    const editor = createEditor({
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
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('moveLine from the next block selects the toc instead of entering its empty child', () => {
    const editor = createEditor({
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
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    });
  });

  it('inserts a paragraph after the toc on Enter', () => {
    const editor = createEditor({
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
      anchor: { offset: 0, path: [1, 0] },
      focus: { offset: 0, path: [1, 0] },
    });
  });
});

describe('BaseTocPlugin.read.headings', () => {
  it('returns titled headings with depth and runtime key without persisted ids', () => {
    const editor = createEditor({
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

  it('reads a heading whose type the app renames', () => {
    const editor = createEditor({
      plugins: [BaseTocPlugin, BaseHeadingPlugin],
      schema: {
        overrides: [
          schema.override(BaseHeadingPlugin, { element: { type: 'h' } }),
        ],
      },
      initialValue: [{ children: [{ text: 'Title' }], level: 2, type: 'h' }],
    });

    expect(editor.plugin(BaseTocPlugin).read.headings()).toEqual([
      { depth: 2, key: editor.key([0])!, title: 'Title', type: 'h' },
    ]);
  });

  it('ignores a different plugin that only shares the heading name', () => {
    const editor = createEditor({
      plugins: [
        BaseTocPlugin,
        definePlugin(PLUGINS.heading, {
          schema: {
            element: {
              content: schema.content.text({ default: 'text', min: 1 }),
              properties: { level: property.number({ required: true }) },
            },
          },
        }),
      ],
      initialValue: [
        { children: [{ text: 'Title' }], level: 1, type: 'heading' },
      ],
    });

    expect(editor.plugin(BaseTocPlugin).read.headings()).toEqual([]);
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
    const editor = createEditor({
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

  it('lists leveled Details titles in document order', () => {
    const editor = createEditor({
      plugins: [
        BaseTocPlugin,
        BaseHeadingPlugin,
        BaseDetailsPlugin,
        BaseDetailsSummaryPlugin,
      ],
      initialValue: [
        { children: [{ text: 'Intro' }], level: 1, type: 'heading' },
        {
          children: [
            { children: [{ text: 'Plain title' }], type: 'summary' },
            { children: [{ text: 'Body' }], type: 'paragraph' },
          ],
          type: 'details',
        },
        {
          children: [
            { children: [{ text: 'Setup' }], level: 2, type: 'summary' },
            { children: [{ text: 'Inner' }], level: 3, type: 'heading' },
          ],
          type: 'details',
        },
      ],
    });

    expect(editor.plugin(BaseTocPlugin).read.headings()).toEqual([
      { depth: 1, key: editor.key([0])!, title: 'Intro', type: 'heading' },
      { depth: 2, key: editor.key([2, 0])!, title: 'Setup', type: 'summary' },
      { depth: 3, key: editor.key([2, 1])!, title: 'Inner', type: 'heading' },
    ]);
  });

  it('lists leveled Details titles from a document view', () => {
    const editor = createEditor({
      plugins: [
        BaseTocPlugin,
        BaseHeadingPlugin,
        BaseDetailsPlugin,
        BaseDetailsSummaryPlugin,
      ],
    });
    const view = createEditorView(editor, {
      document: {
        children: [
          {
            children: [
              { children: [{ text: 'Setup' }], level: 2, type: 'summary' },
              { children: [{ text: 'Body' }], type: 'paragraph' },
            ],
            type: 'details',
          },
        ],
      },
    });

    expect(view.plugin(BaseTocPlugin).read.headings()).toEqual([
      { depth: 2, key: view.key([0, 0])!, title: 'Setup', type: 'summary' },
    ]);
  });

  it('keeps heading identity stable when its path changes', () => {
    const editor = createEditor({
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
  it('inserts the default toc node shape [EDIT-TOC-INSERT-001]', () => {
    const editor = createEditor({
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
