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
import { BaseTocPlugin, readTocHeadings } from './BaseTocPlugin';

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
  it('returns titled headings with level and runtime key without persisted ids', () => {
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
      { key: editor.key([0])!, level: 1, title: 'Title' },
      { key: editor.key([3])!, level: 3, title: 'Section' },
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
      { key: editor.key([0])!, level: 2, title: 'Title' },
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
      { key: editor.key([0])!, level: 1, title: 'Intro' },
      { key: editor.key([2, 0])!, level: 2, title: 'Setup' },
      { key: editor.key([2, 1])!, level: 3, title: 'Inner' },
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
      { key: view.key([0, 0])!, level: 2, title: 'Setup' },
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
      { key, level: 1, title: 'Title' },
    ]);
  });

  it('reports each heading level from one to six', () => {
    const editor = createEditor({
      plugins: [BaseTocPlugin, BaseHeadingPlugin],
      initialValue: [
        { children: [{ text: 'One' }], level: 1, type: 'heading' },
        { children: [{ text: 'Two' }], level: 2, type: 'heading' },
        { children: [{ text: 'Three' }], level: 3, type: 'heading' },
        { children: [{ text: 'Four' }], level: 4, type: 'heading' },
        { children: [{ text: 'Five' }], level: 5, type: 'heading' },
        { children: [{ text: 'Six' }], level: 6, type: 'heading' },
      ],
    });

    expect(editor.plugin(BaseTocPlugin).read.headings()).toEqual([
      { key: editor.key([0])!, level: 1, title: 'One' },
      { key: editor.key([1])!, level: 2, title: 'Two' },
      { key: editor.key([2])!, level: 3, title: 'Three' },
      { key: editor.key([3])!, level: 4, title: 'Four' },
      { key: editor.key([4])!, level: 5, title: 'Five' },
      { key: editor.key([5])!, level: 6, title: 'Six' },
    ]);
  });

  it('lets an app read override filter the heading finder', () => {
    const AppTocPlugin = BaseTocPlugin.extend({
      read: ({ editor, state }) => ({
        headings: () =>
          readTocHeadings({ editor, state }).filter(
            (heading) => heading.level <= 3
          ),
      }),
    });
    const editor = createEditor({
      plugins: [AppTocPlugin, BaseHeadingPlugin],
      initialValue: [
        { children: [{ text: 'One' }], level: 1, type: 'heading' },
        { children: [{ text: 'Two' }], level: 2, type: 'heading' },
        { children: [{ text: 'Three' }], level: 3, type: 'heading' },
        { children: [{ text: 'Four' }], level: 4, type: 'heading' },
        { children: [{ text: 'Five' }], level: 5, type: 'heading' },
        { children: [{ text: 'Six' }], level: 6, type: 'heading' },
      ],
    });

    expect(editor.plugin(BaseTocPlugin).read.headings()).toEqual([
      { key: editor.key([0])!, level: 1, title: 'One' },
      { key: editor.key([1])!, level: 2, title: 'Two' },
      { key: editor.key([2])!, level: 3, title: 'Three' },
    ]);
  });
});

describe('readTocHeadings', () => {
  it('walks the supplied state instead of the live document', () => {
    const editor = createEditor({
      plugins: [BaseTocPlugin, BaseHeadingPlugin],
      initialValue: [
        { children: [{ text: 'Live' }], level: 1, type: 'heading' },
      ],
    });
    const view = createEditorView(editor, {
      document: {
        children: [
          { children: [{ text: 'Viewed' }], level: 2, type: 'heading' },
        ],
      },
    });

    const state = view.read((viewState) => viewState);

    expect(readTocHeadings({ editor, state })).toEqual([
      { key: view.key([0])!, level: 2, title: 'Viewed' },
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
