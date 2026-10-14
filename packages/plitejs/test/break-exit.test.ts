import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  definePlugin,
  type Editor,
  type Element,
  property,
  schema,
  target,
} from 'plitejs';

const p = (text: string) =>
  ({ children: [{ text }], type: 'paragraph' }) satisfies Element;

const exitAt = (
  view: Editor,
  path: number[],
  offset: number,
  root?: string
) => {
  const point = { offset, path, ...(root ? { root } : {}) };
  let landed = false;

  view.update((tx) => {
    tx.selection.set({ anchor: point, focus: point });
    landed = tx.break.exit();
  });

  return landed;
};

describe('tx.break.exit', () => {
  it('exits a table from a header cell that is not the row default', () => {
    const Table = defineEditorSchema('break-exit-table', {
      elements: {
        paragraph: { content: schema.content.text() },
        table: { content: schema.content.type('tr', { min: 1 }) },
        td: { content: schema.content.type('paragraph', { min: 1 }) },
        th: { content: schema.content.type('paragraph', { min: 1 }) },
        tr: {
          content: schema.content.types(['td', 'th'], {
            default: { type: 'td' },
            min: 1,
          }),
        },
      },
      id: 'break-exit-table',
      root: schema.content.types(['paragraph', 'table'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      version: 1,
    });
    const table = {
      children: [
        { children: [{ children: [p('head')], type: 'th' }], type: 'tr' },
      ],
      type: 'table',
    };
    const editor = createEditor({
      initialValue: [table],
      plugins: [Table],
    });

    const landed = exitAt(editor, [0, 0, 0, 0, 0], 4);

    assert.deepEqual(
      { children: editor.read.children(), landed },
      { children: [table, p('')], landed: true }
    );
  });

  it('lands inside a box after its required leading section', () => {
    const Box = defineEditorSchema('break-exit-box', {
      elements: {
        box: {
          content: schema.content.prefix(
            [{ element: 'section' }],
            schema.content.type('paragraph', {
              default: { type: 'paragraph' },
            })
          ),
        },
        paragraph: { content: schema.content.text() },
        section: { content: schema.content.type('paragraph', { min: 1 }) },
      },
      id: 'break-exit-box',
      root: schema.content.types(['paragraph', 'box'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      version: 1,
    });
    const editor = createEditor({
      initialValue: [
        { children: [{ children: [p('x')], type: 'section' }], type: 'box' },
      ],
      plugins: [Box],
    });

    exitAt(editor, [0, 0, 0, 0], 1);

    assert.deepEqual(editor.read.children(), [
      {
        children: [{ children: [p('x')], type: 'section' }, p('')],
        type: 'box',
      },
    ]);
  });

  it('lands the named root default, not the main root default', () => {
    const Rooted = defineEditorSchema('break-exit-rooted', {
      elements: {
        paragraph: { content: schema.content.text() },
        title: { content: schema.content.text() },
      },
      id: 'break-exit-rooted',
      root: schema.content.types(['title', 'paragraph'], {
        default: { type: 'title' },
        min: 1,
      }),
      roots: {
        header: schema.content.type('paragraph', {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
      version: 1,
    });
    const editor = createEditor({
      initialValue: {
        children: [{ children: [{ text: 'T' }], type: 'title' }],
        roots: { header: [p('head')] },
      },
      plugins: [Rooted],
    });
    const header = createEditorView(editor, { root: 'header' });

    exitAt(header, [0, 0], 4, 'header');

    assert.deepEqual(header.read.children(), [p('head'), p('')]);
  });

  it('measures the exit level against the named root default', () => {
    const Rooted = defineEditorSchema('break-exit-rooted-level', {
      elements: {
        box: {
          content: schema.content.types(['paragraph', 'quote'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
        paragraph: { content: schema.content.text() },
        quote: { content: schema.content.type('paragraph', { min: 1 }) },
        title: { content: schema.content.text() },
      },
      id: 'break-exit-rooted-level',
      root: schema.content.types(['title', 'paragraph'], {
        default: { type: 'title' },
        min: 1,
      }),
      roots: {
        header: schema.content.types(['paragraph', 'box'], {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
      version: 1,
    });
    const quote = { children: [p('q')], type: 'quote' };
    const editor = createEditor({
      initialValue: {
        children: [{ children: [{ text: 'T' }], type: 'title' }],
        roots: { header: [{ children: [quote], type: 'box' }] },
      },
      plugins: [Rooted],
    });
    const header = createEditorView(editor, { root: 'header' });

    exitAt(header, [0, 0, 0, 0], 1, 'header');

    assert.deepEqual(header.read.children(), [
      { children: [quote, p('')], type: 'box' },
    ]);
  });

  it('exits a quote to its box default in a root whose default is a title', () => {
    const Titled = defineEditorSchema('break-exit-titled-box', {
      elements: {
        box: {
          content: schema.content.types(['paragraph', 'quote'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
        paragraph: { content: schema.content.text() },
        quote: { content: schema.content.type('paragraph', { min: 1 }) },
        title: { content: schema.content.text() },
      },
      id: 'break-exit-titled-box',
      root: schema.content.types(['title', 'paragraph', 'box'], {
        default: { type: 'title' },
        min: 1,
      }),
      version: 1,
    });
    const quote = { children: [p('q')], type: 'quote' };
    const editor = createEditor({
      initialValue: [{ children: [quote], type: 'box' }],
      plugins: [Titled],
    });

    exitAt(editor, [0, 0, 0, 0], 1);

    assert.deepEqual(editor.read.children(), [
      { children: [quote, p('')], type: 'box' },
    ]);
  });

  it('changes nothing over an expanded selection', () => {
    const Plain = defineEditorSchema('break-exit-expanded', {
      elements: { paragraph: { content: schema.content.text() } },
      id: 'break-exit-expanded',
      root: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      version: 1,
    });
    const editor = createEditor({
      initialValue: [p('ab')],
      plugins: [Plain],
    });
    let landed = true;

    editor.update((tx) => {
      tx.selection.set({
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 2, path: [0, 0] },
      });
      landed = tx.break.exit();
    });

    assert.deepEqual(
      { children: editor.read.children(), landed },
      { children: [p('ab')], landed: false }
    );
  });

  it('changes nothing in a full named root while the main root has room', () => {
    const Rooted = defineEditorSchema('break-exit-full-root', {
      elements: { paragraph: { content: schema.content.text() } },
      id: 'break-exit-full-root',
      root: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      roots: {
        header: schema.content.type('paragraph', {
          default: { type: 'paragraph' },
          max: 2,
          min: 1,
        }),
      },
      version: 1,
    });
    const editor = createEditor({
      initialValue: {
        children: [p('main')],
        roots: { header: [p('a'), p('b')] },
      },
      plugins: [Rooted],
    });
    const header = createEditorView(editor, { root: 'header' });

    const landed = exitAt(header, [1, 0], 1, 'header');

    assert.deepEqual(
      { children: header.read.children(), landed },
      { children: [p('a'), p('b')], landed: false }
    );
  });

  it('exits into a box when top-level paragraphs need an id', () => {
    const Ided = defineEditorSchema('break-exit-top-level-id', {
      elements: {
        box: {
          content: schema.content.types(['paragraph', 'quote'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
        paragraph: { content: schema.content.text() },
        quote: { content: schema.content.type('paragraph', { min: 1 }) },
      },
      id: 'break-exit-top-level-id',
      properties: [
        schema.elementProperty('id', property.string({ required: true }), {
          target: target.and(
            target.type('paragraph'),
            target.not(target.parent(target.type('box')))
          ),
        }),
      ],
      root: schema.content.types(['paragraph', 'box'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
      version: 1,
    });
    const quote = { children: [{ ...p('q'), id: 'q' }], type: 'quote' };
    const editor = createEditor({
      initialValue: [{ children: [quote], type: 'box' }],
      plugins: [Ided],
    });

    const landed = exitAt(editor, [0, 0, 0, 0], 1);

    assert.deepEqual(
      { children: editor.read.children(), landed },
      { children: [{ children: [quote, p('')], type: 'box' }], landed: true }
    );
  });

  it('exits one level from a box that a root prefix puts before a title', () => {
    const Prefixed = defineEditorSchema('break-exit-prefix-root', {
      elements: {
        box: {
          content: schema.content.types(['paragraph', 'quote'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
        paragraph: { content: schema.content.text() },
        quote: { content: schema.content.type('paragraph', { min: 1 }) },
        title: { content: schema.content.text() },
      },
      id: 'break-exit-prefix-root',
      root: schema.content.prefix(
        [{ element: 'box' }, { element: 'title' }],
        schema.content.types(['paragraph', 'title'], {
          default: { type: 'paragraph' },
        })
      ),
      version: 1,
    });
    const quote = { children: [p('q')], type: 'quote' };
    const title = { children: [{ text: 'T' }], type: 'title' };
    const editor = createEditor({
      initialValue: [{ children: [quote], type: 'box' }, title, p('x')],
      plugins: [Prefixed],
    });

    const landed = exitAt(editor, [0, 0, 0, 0], 1);

    assert.deepEqual(
      { children: editor.read.children(), landed },
      {
        children: [{ children: [quote, p('')], type: 'box' }, title, p('x')],
        landed: true,
      }
    );
  });

  it('changes nothing past a void in an undeclared quote when the root default needs a property', () => {
    const Ided = definePlugin('break-exit-undeclared-id', {
      schema: {
        elements: {
          image: { void: 'block' },
          paragraph: {
            content: schema.content.text(),
            properties: { id: property.string({ required: true }) },
          },
        },
      },
    });
    const value = [
      {
        children: [{ children: [{ text: '' }], type: 'image' }],
        type: 'quote',
      },
    ];
    const editor = createEditor({ initialValue: value, plugins: [Ided] });
    const point = { offset: 0, path: [0, 0, 0] };
    let landed = true;

    editor.update((tx) => {
      tx.selection.set({ anchor: point, focus: point });
      landed = tx.break.exit({ match: () => false });
    });

    assert.deepEqual(
      { children: editor.read.children(), landed },
      { children: value, landed: false }
    );
  });

  it('changes nothing in a quote nested in a quote without a schema', () => {
    const value = [
      { children: [{ children: [p('x')], type: 'quote' }], type: 'quote' },
    ];
    const editor = createEditor({ initialValue: value });

    const landed = exitAt(editor, [0, 0, 0, 0], 1);

    assert.deepEqual(
      { children: editor.read.children(), landed },
      { children: value, landed: false }
    );
  });
});
