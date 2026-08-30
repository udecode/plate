import {
  BaseParagraphPlugin,
  createEditor,
  defineBasePlugin,
  schema,
  SelectionApi,
} from '../../../core';
import {
  BaseDetailsPlugin,
  BaseDetailsSummaryPlugin,
} from './BaseDetailsPlugin';

const plugins = [BaseParagraphPlugin, BaseDetailsPlugin] as const;
const BaseInlinePlugin = defineBasePlugin('testInline', {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
  },
});

describe('BaseDetailsPlugin', () => {
  it('publishes semantic Details and Summary schema identities', () => {
    const editor = createEditor({
      plugins,
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    expect(editor.plugin(BaseDetailsPlugin).schema.type).toBe('details');
    expect(editor.plugin(BaseDetailsSummaryPlugin).schema.type).toBe('summary');
    expect(editor.read.schema.create(BaseDetailsSummaryPlugin)).toEqual({
      children: [{ text: '' }],
      type: 'summary',
    });
    expect(editor.read.schema.element(BaseDetailsPlugin)?.groups).toContain(
      'block'
    );
  });

  it('round-trips fixed Details and Summary HTML without persisted UI state', () => {
    const editor = createEditor({
      plugins,
      selection: SelectionApi.nodes([[0]]),
      initialValue: [
        {
          children: [
            { children: [{ text: 'Title' }], type: 'summary' },
            { children: [{ text: 'Body' }], type: 'paragraph' },
          ],
          type: 'details',
        },
      ],
    });
    const decoded = editor.api.html.deserialize({
      element:
        '<details open name="shared"><summary>Title</summary><p>Body</p></details>',
    });

    expect(decoded).toMatchObject([
      {
        children: [
          { children: [{ text: 'Title' }], type: 'summary' },
          { children: [{ text: 'Body' }], type: 'paragraph' },
        ],
        type: 'details',
      },
    ]);
    expect(decoded[0]).not.toHaveProperty('open');
    expect(decoded[0]).not.toHaveProperty('name');

    const data = new DataTransfer();

    editor.api.dom.clipboard.writeSelection(data);

    const html = data.getData('text/html');

    const { body } = new DOMParser().parseFromString(html, 'text/html');
    const details = body.querySelector('details');

    expect(details?.querySelector('summary')?.textContent).toBe('Title');
    expect(details?.hasAttribute('open')).toBe(false);
    expect(details?.hasAttribute('name')).toBe(false);
  });

  it('keeps open state transient and prunes removed keys', () => {
    const editor = createEditor({
      plugins,
      initialValue: [
        {
          children: [
            { children: [{ text: 'Title' }], type: 'summary' },
            { children: [{ text: 'Body' }], type: 'paragraph' },
          ],
          type: 'details',
        },
      ],
    });
    const key = editor.key([0])!;
    const details = editor.plugin(BaseDetailsPlugin);

    expect(details.store.get('isOpen', key)).toBe(false);

    details.api.setOpen(key, true);

    expect(details.store.get('isOpen', key)).toBe(true);
    expect(editor.read.children()[0]).not.toHaveProperty('open');

    editor.update.nodes.remove({ at: [0] });

    expect(details.store.get().openKeys).toEqual(new Set());
  });

  it('moves a body selection to Summary before closing', () => {
    const editor = createEditor({
      plugins,
      selection: {
        kind: 'text',
        anchor: { offset: 2, path: [0, 1, 0] },
        focus: { offset: 2, path: [0, 1, 0] },
      },
      initialValue: [
        {
          children: [
            { children: [{ text: 'Title' }], type: 'summary' },
            { children: [{ text: 'Body' }], type: 'paragraph' },
          ],
          type: 'details',
        },
      ],
    });

    editor.plugin(BaseDetailsPlugin).api.setOpen(editor.key([0])!, false);

    expect(editor.read.selection()).toMatchObject({
      anchor: { offset: 5, path: [0, 0, 0] },
      focus: { offset: 5, path: [0, 0, 0] },
    });
  });

  it('moves a body node selection to Summary before closing', () => {
    const editor = createEditor({
      plugins,
      selection: SelectionApi.nodes([[0, 1]]),
      initialValue: [
        {
          children: [
            { children: [{ text: 'Title' }], type: 'summary' },
            { children: [{ text: 'Body' }], type: 'paragraph' },
          ],
          type: 'details',
        },
      ],
    });

    editor.plugin(BaseDetailsPlugin).api.setOpen(editor.key([0])!, false);

    expect(editor.read.selection()).toMatchObject({
      anchor: { offset: 5, path: [0, 0, 0] },
      focus: { offset: 5, path: [0, 0, 0] },
    });
  });

  it('inserts valid editable Details and selects Summary', () => {
    const editor = createEditor({
      plugins,
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    editor.plugin(BaseDetailsPlugin).update.insert({}, { select: true });

    expect(editor.read.children()).toMatchObject([
      { children: [{ text: '' }], type: 'paragraph' },
      {
        children: [
          { children: [{ text: '' }], type: 'summary' },
          { children: [{ text: '' }], type: 'paragraph' },
        ],
        type: 'details',
      },
    ]);
    expect(
      editor.plugin(BaseDetailsPlugin).store.get('isOpen', editor.key([1])!)
    ).toBe(true);
    expect(editor.read.selection()).toMatchObject({
      anchor: { path: [1, 0, 0] },
      focus: { path: [1, 0, 0] },
    });
  });

  it('wraps selected text blocks as Summary and direct body content', () => {
    const editor = createEditor({
      plugins,
      selection: SelectionApi.nodes([[0], [1]]),
      initialValue: [
        { children: [{ text: 'Title' }], type: 'paragraph' },
        { children: [{ text: 'Body' }], type: 'paragraph' },
      ],
    });

    editor.plugin(BaseDetailsPlugin).update.wrap();

    expect(editor.read.children()).toMatchObject([
      {
        children: [
          { children: [{ text: 'Title' }], type: 'summary' },
          { children: [{ text: 'Body' }], type: 'paragraph' },
        ],
        type: 'details',
      },
    ]);
  });

  it('wraps a text block with inline content as Summary', () => {
    const editor = createEditor({
      plugins: [...plugins, BaseInlinePlugin],
      selection: SelectionApi.nodes([[0]]),
      initialValue: [
        {
          children: [
            {
              children: [{ text: 'Title' }],
              type: 'testInline',
            },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.plugin(BaseDetailsPlugin).update.wrap();

    expect(editor.read.children()).toMatchObject([
      {
        children: [
          {
            children: [
              { text: '' },
              {
                children: [{ text: 'Title' }],
                type: 'testInline',
              },
              { text: '' },
            ],
            type: 'summary',
          },
          { children: [{ text: '' }], type: 'paragraph' },
        ],
        type: 'details',
      },
    ]);
  });

  it('adds an empty Summary when the first wrapped block is structural', () => {
    const editor = createEditor({
      plugins,
      selection: SelectionApi.nodes([[0]]),
      initialValue: [
        {
          children: [
            { children: [{ text: 'Nested' }], type: 'summary' },
            { children: [{ text: 'Body' }], type: 'paragraph' },
          ],
          type: 'details',
        },
      ],
    });

    editor.plugin(BaseDetailsPlugin).update.wrap();

    expect(editor.read.children()).toMatchObject([
      {
        children: [
          { children: [{ text: '' }], type: 'summary' },
          {
            children: [
              { children: [{ text: 'Nested' }], type: 'summary' },
              { children: [{ text: 'Body' }], type: 'paragraph' },
            ],
            type: 'details',
          },
        ],
        type: 'details',
      },
    ]);
  });

  it('unwraps Summary as a default text block before direct body blocks', () => {
    const editor = createEditor({
      plugins,
      selection: SelectionApi.nodes([[0]]),
      initialValue: [
        {
          children: [
            { children: [{ text: 'Title' }], type: 'summary' },
            { children: [{ text: 'Body' }], type: 'paragraph' },
          ],
          type: 'details',
        },
      ],
    });

    editor.plugin(BaseDetailsPlugin).update.unwrap();

    expect(editor.read.children()).toMatchObject([
      {
        children: [{ text: 'Title' }],
        type: 'paragraph',
      },
      { children: [{ text: 'Body' }], type: 'paragraph' },
    ]);
  });

  it('repairs Summary ordering and uniqueness without dropping inline content', () => {
    const editor = createEditor({
      plugins,
      initialValue: [
        {
          children: [
            { children: [{ text: 'Body' }], type: 'paragraph' },
            { children: [{ text: 'Title' }], type: 'summary' },
            { children: [{ text: 'Extra' }], type: 'summary' },
          ],
          type: 'details',
        },
      ],
    });

    editor.update.value.repair();

    expect(editor.read.children()[0]).toMatchObject({
      children: [
        { children: [{ text: 'Title' }], type: 'summary' },
        { children: [{ text: 'Body' }], type: 'paragraph' },
        {
          children: [{ text: 'Extra' }],
          type: 'paragraph',
        },
      ],
      type: 'details',
    });
  });
});
