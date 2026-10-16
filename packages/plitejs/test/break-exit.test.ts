import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  definePlugin,
  type Editor,
  type Element,
  EditorSchemaValidationError,
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

  it('leaves only the quote inside a box in a named root beside a title-default main root [EDIT-GLOBAL-002]', () => {
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

  it('lands the root default after a top-level code block when that default is a code block', () => {
    const CodeRoot = defineEditorSchema('break-exit-code-root', {
      elements: {
        code: schema.element.textBlock({ ownsExit: true }),
        paragraph: { content: schema.content.text() },
      },
      id: 'break-exit-code-root',
      root: schema.content.types(['paragraph', 'code'], {
        default: { type: 'code' },
        min: 1,
      }),
      version: 1,
    });
    const code = (text: string) => ({ children: [{ text }], type: 'code' });
    const editor = createEditor({
      initialValue: [code('x')],
      plugins: [CodeRoot],
    });

    const landed = exitAt(editor, [0, 0], 1);

    assert.deepEqual(
      { children: editor.read.children(), landed },
      { children: [code('x'), code('')], landed: true }
    );
  });
});

describe('exit level', () => {
  const flow = ['paragraph', 'heading', 'code', 'image', 'quote'];
  const Levels = defineEditorSchema('break-exit-levels', {
    elements: {
      bin: { content: schema.content.group('block') },
      code: schema.element.textBlock({ ownsExit: true }),
      codeGroup: {
        content: schema.content.types(['code'], {
          default: { type: 'code' },
          min: 1,
        }),
      },
      codeLanding: {
        content: schema.content.type('code', {
          default: { type: 'code' },
          max: 1,
          min: 1,
        }),
      },
      codeWrap: {
        content: schema.content.types(['code', 'codeLanding'], {
          default: { type: 'codeLanding' },
          min: 1,
        }),
      },
      column: {
        content: schema.content.types(flow, {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
      empty: { content: schema.content.type('paragraph', { min: 0 }) },
      emptyQuoteBox: {
        content: schema.content.types(['paragraph', 'quote', 'empty'], {
          default: { type: 'empty' },
          min: 1,
        }),
      },
      emptyWrap: {
        content: schema.content.types(['code', 'empty'], {
          default: { type: 'empty' },
          min: 1,
        }),
      },
      frame: {
        content: schema.content.types(['code', 'paragraph'], {
          default: { type: 'paragraph' },
          max: 1,
          min: 1,
        }),
      },
      group: { content: schema.content.type('column', { min: 1 }) },
      headedGroup: {
        content: schema.content.prefix(
          [{ element: 'heading' }],
          schema.content.types(['column', 'sidebar'], {
            default: { type: 'sidebar' },
          })
        ),
      },
      heading: { content: schema.content.text() },
      idParagraph: {
        content: schema.content.text(),
        properties: { id: property.string({ required: true }) },
      },
      image: { void: 'block' },
      imageLanding: {
        content: schema.content.type('image', {
          default: { type: 'image' },
          max: 1,
          min: 1,
        }),
      },
      imageWrap: {
        content: schema.content.types(['image', 'imageLanding'], {
          default: { type: 'imageLanding' },
          min: 1,
        }),
      },
      isoTable: { content: schema.content.type('isoTr', { min: 1 }) },
      isoTd: { content: schema.content.text() },
      isoTh: { content: schema.content.text(), isolating: true },
      isoTr: {
        content: schema.content.types(['isoTd', 'isoTh'], {
          default: { type: 'isoTd' },
          min: 1,
        }),
      },
      mixed: {
        content: schema.content.types(['code', 'quote'], {
          default: { type: 'quote' },
          min: 1,
        }),
      },
      paragraph: { content: schema.content.text() },
      quote: {
        content: schema.content.types(flow, {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
      quoteBox: {
        content: schema.content.types(['paragraph', 'quote'], {
          default: { type: 'quote' },
          min: 1,
        }),
      },
      reqBox: {
        content: schema.content.types(['idParagraph', 'quote', 'code'], {
          default: { type: 'idParagraph' },
          min: 1,
        }),
      },
      sideGroup: {
        content: schema.content.types(['column', 'sidebar'], {
          default: { type: 'sidebar' },
          min: 1,
        }),
      },
      sidebar: {
        content: schema.content.types(flow, {
          default: { type: 'paragraph' },
          min: 1,
        }),
      },
    },
    id: 'break-exit-levels',
    root: schema.content.types(
      [
        ...flow,
        'bin',
        'codeGroup',
        'codeWrap',
        'emptyQuoteBox',
        'emptyWrap',
        'frame',
        'group',
        'headedGroup',
        'imageWrap',
        'isoTable',
        'mixed',
        'quoteBox',
        'reqBox',
        'sideGroup',
      ],
      { default: { type: 'paragraph' }, min: 1 }
    ),
    version: 1,
  });
  const el = (type: string, ...children: Element[]) =>
    ({ children, type }) satisfies Element;
  const text = (type: string, value = '') =>
    ({ children: [{ text: value }], type }) satisfies Element;
  const cases: ReadonlyArray<{
    at: number[];
    expected: Element[] | 'unchanged';
    match?: (node: Element) => boolean;
    name: string;
    offset?: number;
    presses?: number;
    value: Element[];
  }> = [
    {
      name: 'leaves a code block in a quote and stays in the quote',
      value: [el('quote', text('code', 'x'))],
      at: [0, 0, 0],
      expected: [el('quote', text('code', 'x'), p(''))],
    },
    {
      name: 'leaves the quote from a heading inside it',
      value: [el('quote', text('heading', 'x'))],
      at: [0, 0, 0],
      expected: [el('quote', text('heading', 'x')), p('')],
    },
    {
      name: 'leaves the table from an isolating header cell',
      value: [el('isoTable', el('isoTr', text('isoTh', 'x')))],
      at: [0, 0, 0, 0],
      expected: [el('isoTable', el('isoTr', text('isoTh', 'x'))), p('')],
    },
    {
      name: 'lands beside an image and stays in its column',
      value: [el('group', el('column', text('image')))],
      at: [0, 0, 0, 0],
      offset: 0,
      expected: [el('group', el('column', text('image'), p('')))],
    },
    {
      name: 'leaves a container with no default from a code block',
      value: [el('bin', text('code', 'x'))],
      at: [0, 0, 0],
      expected: [el('bin', text('code', 'x')), p('')],
    },
    {
      name: 'leaves a full container from a code block',
      value: [el('frame', text('code', 'x'))],
      at: [0, 0, 0],
      expected: [el('frame', text('code', 'x')), p('')],
    },
    {
      name: 'leaves a code-only container from a code block',
      value: [el('codeGroup', text('code', 'x'))],
      at: [0, 0, 0],
      expected: [el('codeGroup', text('code', 'x')), p('')],
    },
    {
      name: 'leaves a container whose default needs an id from a code block',
      value: [el('reqBox', text('code', 'x'))],
      at: [0, 0, 0],
      expected: [el('reqBox', text('code', 'x')), p('')],
    },
    {
      name: 'leaves a container whose default wraps a code block',
      value: [el('codeWrap', text('code', 'x'))],
      at: [0, 0, 0],
      expected: [el('codeWrap', text('code', 'x')), p('')],
    },
    {
      name: 'leaves a container whose default wraps an image',
      value: [el('imageWrap', text('image'))],
      at: [0, 0, 0],
      offset: 0,
      expected: [el('imageWrap', text('image')), p('')],
    },
    {
      name: 'leaves a container from inside its default wrapper on the first press',
      value: [el('codeWrap', el('codeLanding', text('code', 'x')))],
      at: [0, 0, 0, 0],
      presses: 2,
      expected: [
        el('codeWrap', el('codeLanding', text('code', 'x'))),
        p(''),
        p(''),
      ],
    },
    {
      name: 'leaves a code-and-quote container on the second press from a code block',
      value: [el('mixed', text('code', 'x'))],
      at: [0, 0, 0],
      presses: 2,
      expected: [el('mixed', text('code', 'x'), el('quote', p(''))), p('')],
    },
    {
      name: 'leaves a group that holds no text block from a paragraph in its column',
      value: [el('sideGroup', el('column', p('x')))],
      at: [0, 0, 0, 0],
      expected: [el('sideGroup', el('column', p('x'))), p('')],
    },
    {
      name: 'leaves a group whose text block is only its leading heading from a paragraph in its column',
      value: [el('headedGroup', text('heading', 'h'), el('column', p('x')))],
      at: [0, 1, 0, 0],
      expected: [
        el('headedGroup', text('heading', 'h'), el('column', p('x'))),
        p(''),
      ],
    },
    {
      name: 'leaves a box whose default is the quote it leaves',
      value: [el('quoteBox', el('quote', p('x')))],
      at: [0, 0, 0, 0],
      expected: [el('quoteBox', el('quote', p('x'))), p('')],
    },
    {
      name: 'leaves a container whose default holds no text from a code block',
      value: [el('emptyWrap', text('code', 'x'))],
      at: [0, 0, 0],
      expected: [el('emptyWrap', text('code', 'x')), p('')],
    },
    {
      name: 'changes nothing in a quote whose box default holds no text',
      value: [el('emptyQuoteBox', el('quote', p('x')))],
      at: [0, 0, 0, 0],
      expected: 'unchanged',
    },
    {
      name: 'changes nothing in a quote whose box default needs an id',
      value: [el('reqBox', el('quote', p('x')))],
      at: [0, 0, 0, 0],
      expected: 'unchanged',
    },
    {
      name: 'leaves the level a match names from a code block',
      value: [el('group', el('column', text('code', 'x')))],
      at: [0, 0, 0, 0],
      match: (node) => node.type === 'group',
      expected: [el('group', el('column', text('code', 'x'))), p('')],
    },
    {
      name: 'lands beside an image when match takes no level',
      value: [el('quote', text('image'))],
      at: [0, 0, 0],
      offset: 0,
      match: () => false,
      expected: [el('quote', text('image'), p(''))],
    },
  ];

  for (const {
    at,
    expected,
    match,
    name,
    offset = 1,
    presses = 1,
    value,
  } of cases) {
    it(name, () => {
      const editor = createEditor({ initialValue: value, plugins: [Levels] });
      const point = { offset, path: at };
      let landed = true;

      for (let press = 0; press < presses; press++) {
        editor.update((tx) => {
          if (press === 0) tx.selection.set({ anchor: point, focus: point });
          landed = tx.break.exit(match ? { match } : {});
        });
      }

      assert.deepEqual(
        { children: editor.read.children(), landed },
        expected === 'unchanged'
          ? { children: value, landed: false }
          : { children: expected, landed: true }
      );
    });
  }
});

describe('default landing', () => {
  let relayEditor: Editor | undefined;
  const silentError = new EditorSchemaValidationError({
    code: 'missing-property',
    message: 'The token source is missing.',
    path: [],
    root: null,
  });
  const Landings = definePlugin('break-landings', {
    schema: {
      elements: {
        relayGallery: {
          content: schema.content.types(['photo', 'relayToken'], {
            default: { type: 'relayToken' },
            min: 1,
          }),
        },
        relayToken: {
          content: schema.content.text(),
          properties: {
            token: property.string({
              generate: () =>
                relayEditor?.read.schema.create('idParagraph').type ?? '',
            }),
          },
        },
        silentGallery: {
          content: schema.content.types(['photo', 'silentToken'], {
            default: { type: 'silentToken' },
            min: 1,
          }),
        },
        silentToken: {
          content: schema.content.text(),
          properties: {
            token: property.string({
              generate: () => {
                throw silentError;
              },
            }),
          },
        },
        badToken: {
          content: schema.content.text(),
          properties: {
            token: property.string({
              generate: () => 1 as unknown as string,
            }),
          },
        },
        empty: { content: schema.content.type('paragraph', { min: 0 }) },
        emptyGallery: {
          content: schema.content.types(['photo', 'empty'], {
            default: { type: 'empty' },
            min: 1,
          }),
        },
        gallery: {
          content: schema.content.types(['photo', 'idParagraph'], {
            default: { type: 'idParagraph' },
            min: 1,
          }),
        },
        idParagraph: {
          content: schema.content.text(),
          properties: { id: property.string({ required: true }) },
        },
        paragraph: { content: schema.content.text() },
        photo: { void: 'block' },
        tokenGallery: {
          content: schema.content.types(['photo', 'badToken'], {
            default: { type: 'badToken' },
            min: 1,
          }),
        },
      },
    },
  });
  const photoIn = (type: string) => [
    { children: [{ children: [{ text: '' }], type: 'photo' }], type },
  ];
  const enterOnPhoto = (editor: Editor) =>
    editor.update((tx) => {
      const point = { offset: 0, path: [0, 0, 0] };

      tx.selection.set({ anchor: point, focus: point });
      tx.break.insert();
    });

  it('changes nothing on Enter in an image when the default beside it needs a property', () => {
    const value = photoIn('gallery');
    const editor = createEditor({ initialValue: value, plugins: [Landings] });

    enterOnPhoto(editor);

    assert.deepEqual(editor.read.children(), value);
  });

  it('changes nothing on Enter in an image when the default beside it holds no text', () => {
    const value = photoIn('emptyGallery');
    const editor = createEditor({ initialValue: value, plugins: [Landings] });

    enterOnPhoto(editor);

    assert.deepEqual(editor.read.children(), value);
  });

  it('throws on Enter in an image when the default beside it generates a bad value', () => {
    const editor = createEditor({
      initialValue: photoIn('tokenGallery'),
      plugins: [Landings],
    });

    assert.throws(() => enterOnPhoto(editor), /must be string/);
  });

  it('throws on Enter in an image when the default beside it generates its own missing-property error', () => {
    const editor = createEditor({
      initialValue: photoIn('silentGallery'),
      plugins: [Landings],
    });

    assert.throws(
      () => enterOnPhoto(editor),
      (error: unknown) => error === silentError
    );
  });

  it('throws on Enter in an image when the default beside it generates through a schema build that misses a property', () => {
    const editor = createEditor({
      initialValue: photoIn('relayGallery'),
      plugins: [Landings],
    });

    relayEditor = editor;

    assert.throws(() => enterOnPhoto(editor), /requires property "id"/);
  });

  it('changes nothing on Enter in an image when the default beside it needs a text property', () => {
    const value = [
      {
        type: 'gallery',
        children: [{ type: 'photo', children: [{ text: '', lang: 'fr' }] }],
      },
    ];
    const editor = createEditor({
      initialValue: value,
      plugins: [
        defineEditorSchema('schema:landing-required-text', {
          elements: {
            gallery: {
              content: schema.content.types(['photo', 'para'], {
                default: { type: 'para' },
                min: 1,
              }),
            },
            para: { content: schema.content.text() },
            photo: { void: 'block' },
          },
          properties: [
            schema.textProperty('lang', property.string({ required: true })),
          ],
          root: schema.content.types(['gallery'], { min: 1 }),
        }),
      ],
    });

    enterOnPhoto(editor);

    assert.deepEqual(editor.read.children(), value);
  });

  it('reports a missing required property of a built default as missing-property', () => {
    const editor = createEditor({
      initialValue: photoIn('gallery'),
      plugins: [Landings],
    });

    assert.throws(
      () => editor.read.schema.createDefaultChild({ at: [0, 1] }),
      (error: unknown) =>
        error instanceof EditorSchemaValidationError &&
        error.diagnostics[0]?.code === 'missing-property' &&
        error.diagnostics[0]?.nodeType === 'idParagraph'
    );
  });
});
