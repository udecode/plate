import { AuthoredPlugin } from '../../../authored';
import {
  BaseParagraphPlugin,
  createEditor,
  definePlugin,
  schema,
  NodeApi,
  PLUGINS,
  property,
  SelectionApi,
} from '../../../core';
import { createEditorView } from '../../../facade';
import { parseHtmlSliceContent } from '../../../internal/testing/parseHtmlSliceContent';
import {
  BaseBlockquotePlugin,
  BaseHorizontalRulePlugin,
  HorizontalRuleRules,
} from '../../basic-nodes/lib/BaseBlockPlugins';
import {
  BaseHeadingPlugin,
  HeadingRules,
} from '../../basic-nodes/lib/BaseHeadingPlugins';
import {
  BaseBoldPlugin,
  BaseCodePlugin,
} from '../../basic-nodes/lib/BaseMarkPlugins';
import { BaseCodeBlockPlugin } from '../../code-block/lib/BaseCodeBlockPlugin';
import { BaseLinkPlugin } from '../../link/lib/BaseLinkPlugin';
import {
  BaseDetailsPlugin,
  BaseDetailsSummaryPlugin,
} from './BaseDetailsPlugin';

const plugins = [BaseParagraphPlugin, BaseDetailsPlugin] as const;
const paragraph = (text: string) => ({
  children: [{ text }],
  type: 'paragraph',
});
const summary = (text: string) => ({ children: [{ text }], type: 'summary' });
const BaseInlinePlugin = definePlugin('testInline', {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
  },
});

describe('BaseDetailsPlugin', () => {
  it('sets a mixed Summary and paragraph selection without toggling an existing heading off', () => {
    const editor = createEditor({
      plugins: [...plugins, BaseHeadingPlugin],
      initialValue: [
        {
          type: 'details',
          children: [
            { type: 'summary', level: 2, children: [{ text: 'Title' }] },
            { type: 'paragraph', children: [{ text: 'Body' }] },
          ],
        },
      ],
    });
    editor.update.selection.set({
      anchor: { path: [0, 0, 0], offset: 0 },
      focus: { path: [0, 1, 0], offset: 4 },
    });
    editor.update.heading.setLevel(2);
    expect(editor.read.nodes.get([0, 0])?.[0]).toMatchObject({
      type: 'summary',
      level: 2,
    });
    expect(editor.read.nodes.get([0, 1])?.[0]).toMatchObject({
      type: 'heading',
      level: 2,
    });
    editor.update.blocks.reset({ unset: 'level' });
    expect(editor.read.nodes.get([0, 0])?.[0]).toEqual({
      type: 'summary',
      children: [{ text: 'Title' }],
    });
    expect(editor.read.nodes.get([0, 1])?.[0]).toEqual({
      type: 'paragraph',
      children: [{ text: 'Body' }],
    });
  });

  it('toggles a required heading and a leveled title off to their own defaults', () => {
    const editor = createEditor({
      plugins: [...plugins, BaseHeadingPlugin],
      schema: {
        root: schema.content.prefix(
          [{ element: BaseHeadingPlugin, properties: { level: 1 } }],
          schema.content.group('block', {
            default: { type: 'paragraph' },
            min: 1,
          })
        ),
      },
      initialValue: [
        { type: 'heading', level: 1, children: [{ text: 'Doc' }] },
        {
          type: 'details',
          children: [
            { type: 'summary', level: 1, children: [{ text: 'Title' }] },
            { type: 'paragraph', children: [{ text: 'Body' }] },
          ],
        },
      ],
    });
    editor.update.selection.set({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [1, 0, 0], offset: 5 },
    });

    editor.update.heading.toggle({ level: 1 });

    expect(editor.read.children()).toEqual([
      { type: 'heading', level: 1, children: [{ text: 'Doc' }] },
      {
        type: 'details',
        children: [
          { type: 'summary', children: [{ text: 'Title' }] },
          { type: 'paragraph', children: [{ text: 'Body' }] },
        ],
      },
    ]);
  });

  it.each([false, true])(
    'turns a body heading and a leveled title back into text (nested: %s)',
    (nested) => {
      const details = {
        type: 'details',
        children: [
          { type: 'summary', level: 2, children: [{ text: 'Title' }] },
          { type: 'heading', level: 2, children: [{ text: 'Sub' }] },
        ],
      };
      const editor = createEditor({
        plugins: [...plugins, BaseHeadingPlugin],
        initialValue: [
          nested
            ? {
                type: 'details',
                children: [
                  { type: 'summary', children: [{ text: 'Outer' }] },
                  details,
                ],
              }
            : details,
        ],
      });
      const at = nested ? [0, 1] : [0];
      editor.update.selection.set({
        anchor: { path: [...at, 0, 0], offset: 0 },
        focus: { path: [...at, 1, 0], offset: 3 },
      });

      editor.update.blocks.reset({ unset: 'level' });

      expect(editor.read.nodes.get(at)?.[0]).toEqual({
        type: 'details',
        children: [
          { type: 'summary', children: [{ text: 'Title' }] },
          { type: 'paragraph', children: [{ text: 'Sub' }] },
        ],
      });
    }
  );

  it('reads a title level from HTML only when the heading is the sole child', () => {
    const editor = createEditor({
      plugins: [...plugins, BaseHeadingPlugin],
    });

    expect(
      parseHtmlSliceContent(
        editor,
        '<details><summary> <h2>Title</h2> </summary><p>B</p></details>'
      )[0]
    ).toHaveProperty(['children', 0, 'level'], 2);
    expect(
      parseHtmlSliceContent(
        editor,
        '<details><summary><h2>Title</h2> more</summary><p>B</p></details>'
      )[0]
    ).not.toHaveProperty(['children', 0, 'level']);
  });

  it('preserves a heading through Details wrap and unwrap, and splits its title into plain body text', () => {
    const editor = createEditor({
      plugins: [...plugins, BaseHeadingPlugin],
      initialValue: [
        { type: 'heading', level: 2, children: [{ text: 'Title' }] },
      ],
    });
    editor.update.selection.set({ path: [0, 0], offset: 2 });
    editor.update.details.wrap();
    expect(editor.read.nodes.get([0, 0])?.[0]).toMatchObject({
      type: 'summary',
      level: 2,
    });
    editor.update.selection.set({ path: [0, 0, 0], offset: 2 });
    editor.update.break.insert();
    expect(editor.read.nodes.get([0, 0])?.[0]).toEqual({
      type: 'summary',
      level: 2,
      children: [{ text: 'Ti' }],
    });
    expect(editor.read.nodes.get([0, 1])?.[0]).toEqual({
      type: 'paragraph',
      children: [{ text: 'tle' }],
    });
    editor.update.details.unwrap({ at: [0] });
    expect(editor.read.nodes.get([0])?.[0]).toEqual({
      type: 'heading',
      level: 2,
      children: [{ text: 'Ti' }],
    });
  });

  it('gives a wrapped title no level from a plugin that only shares the heading name', () => {
    const editor = createEditor({
      plugins: [
        ...plugins,
        definePlugin(PLUGINS.heading, {
          schema: {
            element: {
              ...schema.element.textBlock(),
              properties: { level: property.number({ required: true }) },
            },
          },
        }),
      ],
      initialValue: [
        { type: 'heading', level: 2, children: [{ text: 'Title' }] },
      ],
    });
    editor.update.selection.set({ path: [0, 0], offset: 2 });
    editor.update.details.wrap();
    expect(editor.read.nodes.get([0, 0])?.[0]).toEqual({
      type: 'summary',
      children: [{ text: 'Title' }],
    });
  });

  it('round-trips a marked heading title as Summary content', () => {
    const editor = createEditor({
      plugins: [...plugins, BaseHeadingPlugin, BaseBoldPlugin, BaseLinkPlugin],
    });
    const html =
      '<details><summary><h2><strong>Title</strong> <a href="https://example.com">link</a></h2></summary><h3>Body heading</h3><details><summary><h1>Nested</h1></summary><p>Body</p></details></details>';
    const parsed = editor.api.html.parseSlice(html);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) throw new Error(parsed.diagnostics[0].message);
    expect(parsed.slice.content).toMatchObject([
      {
        type: 'details',
        children: [
          {
            type: 'summary',
            level: 2,
            children: [
              { text: 'Title', bold: true },
              { text: ' ' },
              {
                type: 'link',
                url: 'https://example.com',
                children: [{ text: 'link' }],
              },
            ],
          },
          { type: 'heading', level: 3, children: [{ text: 'Body heading' }] },
          {
            type: 'details',
            children: [
              { type: 'summary', level: 1, children: [{ text: 'Nested' }] },
              { type: 'paragraph', children: [{ text: 'Body' }] },
            ],
          },
        ],
      },
    ]);
    const encoded = editor.api.html.serialize({
      document: { children: parsed.slice.content },
    });
    expect(encoded.diagnostics).toEqual([]);
    expect(encoded.data).toContain('<summary><h2>');
    expect(parseHtmlSliceContent(editor, encoded.data)).toEqual(
      parsed.slice.content
    );
  });

  it('formats a Summary in place through heading shortcuts and input rules [EDIT-DETAILS-TITLE-LEVEL-001]', () => {
    const editor = createEditor({
      plugins: [
        ...plugins,
        BaseHeadingPlugin.configure({ inputRules: [HeadingRules.markdown()] }),
      ],
      initialValue: [
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'Title' }] },
            { type: 'paragraph', children: [{ text: 'Body' }] },
          ],
        },
      ],
    });
    editor.update.selection.set({ path: [0, 0, 0], offset: 5 });
    const key = editor.key([0]);
    const titleKey = editor.key([0, 0]);
    editor.update.heading.toggle({ level: 2 });
    expect(editor.read.children()).toEqual([
      {
        type: 'details',
        children: [
          { type: 'summary', level: 2, children: [{ text: 'Title' }] },
          { type: 'paragraph', children: [{ text: 'Body' }] },
        ],
      },
    ]);
    expect(editor.key([0])).toBe(key);
    expect(editor.key([0, 0])).toBe(titleKey);
    editor.update.heading.toggle({ level: 2 });
    expect(editor.read.nodes.get([0, 0])?.[0]).not.toHaveProperty('level');
    editor.update.selection.set({ path: [0, 0, 0], offset: 0 });
    editor.update.text.insert('##');
    editor.update.text.insert(' ');
    expect(editor.read.nodes.get([0, 0])?.[0]).toEqual({
      type: 'summary',
      level: 2,
      children: [{ text: 'Title' }],
    });
    editor.update.selection.set({ path: [0, 0, 0], offset: 0 });
    editor.update.text.insert('##');
    editor.update.text.insert(' ');
    expect(editor.read.nodes.get([0, 0])?.[0]).toEqual({
      type: 'summary',
      level: 2,
      children: [{ text: '## Title' }],
    });
  });

  it('closes Details in a read-only view and leaves the selection in its body', () => {
    const editor = createEditor({
      plugins,
      initialValue: [
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'Title' }] },
            { type: 'paragraph', children: [{ text: 'Body' }] },
          ],
        },
      ],
    });
    editor.update.selection.set({ path: [0, 1, 0], offset: 2 });
    const view = createEditorView(editor, { readOnly: true });
    const details = view.plugin(BaseDetailsPlugin);
    const key = view.key([0])!;

    details.api.setOpen(key, true);
    details.api.setOpen(key, false);

    expect([details.api.isOpen(key), editor.read.selection()]).toMatchObject([
      false,
      {
        anchor: { path: [0, 1, 0], offset: 2 },
        focus: { path: [0, 1, 0], offset: 2 },
      },
    ]);
  });

  it('restores a removed open Details as open on undo', () => {
    const editor = createEditor({
      plugins,
      initialValue: [
        { type: 'paragraph', children: [{ text: 'Before' }] },
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'Title' }] },
            { type: 'paragraph', children: [{ text: 'Body' }] },
          ],
        },
      ],
    });
    const details = editor.plugin(BaseDetailsPlugin);

    details.api.setOpen(editor.key([1])!, true);
    editor.update.nodes.remove({ at: [1] });
    editor.api.history.undo();

    expect(details.api.isOpen(editor.key([1])!)).toBe(true);
  });

  it.each([true, false])(
    'restores nested authored Details disclosure through unwrap undo and redo (open: %s)',
    (open) => {
      const editor = createEditor({
        plugins: [...plugins, AuthoredPlugin],
        initialValue: [
          {
            type: 'details',
            children: [
              { type: 'summary', children: [{ text: 'Outer' }] },
              {
                type: 'details',
                children: [
                  { type: 'summary', children: [{ text: 'Inner' }] },
                  { type: 'paragraph', children: [{ text: 'Body' }] },
                ],
              },
            ],
          },
        ],
      });
      const details = editor.plugin(BaseDetailsPlugin);
      const before = editor.read.children();
      details.api.setOpen(editor.key([0])!, true);
      const innerKey = editor.key([0, 1])!;
      details.api.setOpen(innerKey, open);
      editor.update.selection.set({ path: [0, 1, 0, 0], offset: 0 });
      editor.update.text.deleteBackward({ unit: 'character' });
      const unwrapped = editor.read.children();

      for (let cycle = 0; cycle < 2; cycle++) {
        editor.api.history.undo();
        expect(editor.read.children()).toEqual(before);
        expect(details.api.isOpen(editor.key([0])!)).toBe(true);
        expect(editor.key([0, 1])).toBe(innerKey);
        expect(details.api.isOpen(editor.key([0, 1])!)).toBe(open);
        editor.api.history.redo();
        expect(editor.read.children()).toEqual(unwrapped);
      }
    }
  );

  it('keeps loaded authored Details open through edits and closes in the calling view', () => {
    const authoredPlugins = [BaseDetailsPlugin, AuthoredPlugin];
    const initial = createEditor({
      plugins: authoredPlugins,
      userId: 'alice',
      initialValue: [
        { type: 'paragraph', children: [{ text: 'Review' }] },
        {
          type: 'details',
          children: [
            { type: 'summary', children: [{ text: 'Title' }] },
            { type: 'paragraph', children: [{ text: 'Body' }] },
          ],
        },
      ],
    });
    const proposing = createEditorView(initial, {
      authored: { intent: 'propose' },
    });
    proposing.update((tx) => {
      tx.text.delete({
        at: {
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [0, 0], offset: 1 },
        },
      });
      tx.text.insert('r', { at: { path: [0, 0], offset: 0 } });
    });
    const editor = createEditor({
      plugins: authoredPlugins,
      userId: 'alice',
      initialValue: initial.read.value(),
    });
    const view = createEditorView(editor, {
      authored: { intent: 'edit' },
    });
    const details = view.plugin(BaseDetailsPlugin);
    const key = view.key([1])!;
    const acceptedDetails = editor.plugin(BaseDetailsPlugin);
    const acceptedKey = editor.key([1])!;

    details.api.setOpen(key, true);
    acceptedDetails.api.setOpen(acceptedKey, true);
    view.update.selection.set({ path: [1, 1, 0], offset: 2 });
    view.update.break.insert();

    expect(details.api.isOpen(key)).toBe(true);
    expect(acceptedDetails.api.isOpen(acceptedKey)).toBe(true);
    expect(view.read.text.string([1, 2])).toBe('dy');
    view.update.text.insert('X');
    expect(view.read.text.string([1, 2])).toBe('Xdy');
    expect(details.api.isOpen(key)).toBe(true);
    details.api.setOpen(key, false);
    expect(view.read.selection()).toMatchObject({
      anchor: { path: [1, 0, 0], offset: 5 },
      focus: { path: [1, 0, 0], offset: 5 },
    });
  });

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
      selection: SelectionApi.nodes([[0]], { mode: 'block' }),
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
    const decoded = parseHtmlSliceContent(
      editor,
      '<details open name="shared"><summary>Title</summary><p>Body</p></details>'
    );

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

  it('keeps open state out of the document', () => {
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

    expect(details.api.isOpen(key)).toBe(false);

    details.api.setOpen(key, true);

    expect(details.api.isOpen(key)).toBe(true);
    expect(editor.read.children()[0]).not.toHaveProperty('open');
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
      selection: SelectionApi.nodes([[0, 1]], { mode: 'block' }),
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
      {
        children: [
          { children: [{ text: '' }], type: 'summary' },
          { children: [{ text: '' }], type: 'paragraph' },
        ],
        type: 'details',
      },
    ]);
    expect(editor.plugin(BaseDetailsPlugin).api.isOpen(editor.key([0])!)).toBe(
      true
    );
    expect(editor.read.selection()).toMatchObject({
      anchor: { path: [0, 0, 0] },
      focus: { path: [0, 0, 0] },
    });
  });

  it('wraps selected text blocks as Summary and direct body content', () => {
    const editor = createEditor({
      plugins,
      selection: SelectionApi.nodes([[0], [1]], { mode: 'block' }),
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
    expect(editor.plugin(BaseDetailsPlugin).api.isOpen(editor.key([0])!)).toBe(
      true
    );
  });

  it('wraps a text block with inline content as Summary', () => {
    const editor = createEditor({
      plugins: [...plugins, BaseInlinePlugin],
      selection: SelectionApi.nodes([[0]], { mode: 'block' }),
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
      selection: SelectionApi.nodes([[0]], { mode: 'block' }),
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
      selection: SelectionApi.nodes([[0]], { mode: 'block' }),
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

  it('refuses loading a title that is not the first child, or a second title', () => {
    for (const children of [
      [paragraph('Body'), summary('Title')],
      [summary('Title'), paragraph('Body'), summary('Extra')],
    ]) {
      expect(() =>
        createEditor({
          plugins,
          initialValue: [{ children, type: 'details' }],
        })
      ).toThrow('cannot contain');
    }
  });
});

describe('Details title slot', () => {
  const titled = () =>
    createEditor({
      plugins: [
        ...plugins,
        BaseBlockquotePlugin,
        BaseHorizontalRulePlugin.configure({
          inputRules: [HorizontalRuleRules.markdown()],
        }),
      ],
      initialValue: [
        { children: [summary('Title'), paragraph('Body')], type: 'details' },
        paragraph('After'),
      ],
      selection: {
        anchor: { offset: 5, path: [0, 0, 0] },
        focus: { offset: 5, path: [0, 0, 0] },
        kind: 'text',
      },
    });

  it('keeps a title in place when a block change cannot apply there', () => {
    for (const change of [
      (editor: ReturnType<typeof titled>) =>
        editor.plugin(BaseParagraphPlugin).update.toggle(),
      (editor: ReturnType<typeof titled>) =>
        editor.plugin(BaseBlockquotePlugin).update.toggle(),
      (editor: ReturnType<typeof titled>) =>
        editor.update.blocks.set({ type: 'paragraph' }),
    ]) {
      const editor = titled();
      const key = editor.key([0, 0]);

      change(editor);

      expect(editor.read.children()[0].children[0].type).toBe('summary');
      expect(editor.key([0, 0])).toBe(key);
      expect(editor.read.children()[0].children).toHaveLength(2);
    }
  });

  it('keeps three typed dashes as title text', () => {
    const editor = titled();

    editor.update.text.delete({
      at: {
        anchor: { offset: 0, path: [0, 0, 0] },
        focus: { offset: 5, path: [0, 0, 0] },
        kind: 'text',
      },
    });
    for (const dash of '---') editor.update.text.insert(dash);

    expect(editor.read.children()).toEqual([
      { children: [summary('---'), paragraph('Body')], type: 'details' },
      paragraph('After'),
    ]);
  });

  it('duplicates the title or body line holding the caret', () => {
    for (const [path, children] of [
      [
        [0, 0, 0],
        [summary('Title'), paragraph('Title'), paragraph('Body')],
      ],
      [
        [0, 1, 0],
        [summary('Title'), paragraph('Body'), paragraph('Body')],
      ],
    ] as const) {
      const editor = titled();

      editor.update((tx) => {
        tx.selection.set({
          anchor: { offset: 2, path: [...path] },
          focus: { offset: 2, path: [...path] },
          kind: 'text',
        });
        tx.blocks.duplicate();
      });

      expect(editor.read.children()).toEqual([
        { children: [...children], type: 'details' },
        paragraph('After'),
      ]);
    }
  });

  it('reads the first HTML summary as the title and later ones as body blocks', () => {
    const editor = createEditor({
      plugins: [
        ...plugins,
        BaseBoldPlugin,
        BaseCodePlugin,
        BaseCodeBlockPlugin,
        BaseHeadingPlugin,
      ],
    });

    expect(
      parseHtmlSliceContent(
        editor,
        '<details><p>B</p><summary>T</summary><summary style="font-family:Consolas"><b>X</b></summary><summary><h2>Y</h2></summary></details>'
      )
    ).toEqual([
      {
        children: [
          summary('T'),
          paragraph('B'),
          {
            children: [{ bold: true, code: true, text: 'X' }],
            type: 'paragraph',
          },
          { children: [{ text: 'Y' }], level: 2, type: 'heading' },
        ],
        type: 'details',
      },
    ]);
  });

  it('fills a picked title with the first block pasted over it', () => {
    const editor = titled();
    const data = new DataTransfer();

    editor.update.selection.set(
      SelectionApi.nodes([[0, 0]], { mode: 'block' })
    );
    data.setData('text/html', '<p>X</p><p>Y</p>');
    editor.api.dom.clipboard.insertData(data);

    expect(editor.read.children()).toEqual([
      {
        children: [summary('X'), paragraph('Y'), paragraph('Body')],
        type: 'details',
      },
      paragraph('After'),
    ]);
  });

  it('joins a copied title to the body line it is pasted at', () => {
    const editor = titled();
    const data = new DataTransfer();

    editor.update.selection.set(
      SelectionApi.nodes([[0, 0]], { mode: 'block' })
    );
    editor.api.dom.clipboard.writeSelection(data);
    editor.update.selection.set({
      anchor: { offset: 4, path: [0, 1, 0] },
      focus: { offset: 4, path: [0, 1, 0] },
      kind: 'text',
    });
    editor.api.dom.clipboard.insertData(data);

    expect(editor.read.children()[0]).toEqual({
      children: [summary('Title'), paragraph('BodyTitle')],
      type: 'details',
    });
  });
});

describe('details transfer landing', () => {
  const createDetails = () =>
    createEditor({
      plugins,
      initialValue: [
        {
          children: [
            { children: [{ text: 'sum' }], type: 'summary' },
            { children: [{ text: 'body' }], type: 'paragraph' },
          ],
          type: 'details',
        },
        { children: [{ text: 'loose' }], type: 'paragraph' },
      ],
    });
  const detailsTexts = (editor: ReturnType<typeof createDetails>) =>
    editor.read.children()[0].children.map((child) => NodeApi.string(child));

  it('lands a block in the body after the summary', () => {
    const editor = createDetails();

    expect(
      editor.api.transfer.move({
        nodes: [editor.key([1])!],
        to: { edge: 'after', key: editor.key([0, 0])! },
      }).status
    ).toBe('moved');
    expect(detailsTexts(editor)).toEqual(['sum', 'loose', 'body']);
  });

  it('refuses a block before the summary', () => {
    const editor = createDetails();

    expect(
      editor.api.transfer.move({
        nodes: [editor.key([1])!],
        to: { edge: 'before', key: editor.key([0, 0])! },
      }).status
    ).toBe('refused');
    expect(detailsTexts(editor)).toEqual(['sum', 'body']);
  });

  it('refuses dragging the summary before it edits anything', () => {
    const editor = createDetails();

    expect(
      editor.api.transfer.move({
        nodes: [editor.key([0, 0])!],
        to: { edge: 'after', key: editor.key([0, 1])! },
      })
    ).toEqual({ reason: 'schema', status: 'refused' });
    expect(detailsTexts(editor)).toEqual(['sum', 'body']);
  });
});
