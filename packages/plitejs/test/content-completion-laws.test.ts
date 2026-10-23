import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  defineEditorSchema,
  DocumentChange,
  property,
  schema,
  target,
} from 'plitejs';
import { history } from 'plitejs/history';

import { createAuthoredPlugin } from '../src/authored/authored';
import { getEditorSchema } from '../src/core/editor-runtime';
import {
  canonicalizeRootChildren,
  constructCanonicalDocumentChange,
} from '../src/core/representation';
import { EditorNoncanonicalChangeError } from '../src/core/schema-validation';
import { EditorSchemaCompileError } from '../src/internal';
import { getDefined } from '../src/internal/get-defined';
import {
  type Gesture,
  header,
  helpers,
  type Json,
  node,
  shapes,
  text,
  xb,
  xi,
} from './support/content-shapes';

const c = schema.content;

let schemas = 0;
const editorFor = (shape: (typeof shapes)[number], children: Json[]) =>
  createEditor({
    initialValue: [
      node('paragraph', [text('p')]),
      node('el', children),
    ] as never,
    plugins: [
      defineEditorSchema(`completion-law-${(schemas += 1)}`, {
        elements: {
          ...helpers,
          ...shape.elements,
          el: { content: shape.content },
        } as never,
        id: `completion-law-${schemas}`,
        properties: (shape.properties ?? []) as never,
        root: c.any([c.type('paragraph'), c.type('el')], {
          default: { type: 'paragraph' },
          min: 1,
        }),
        unknown: 'reject',
        version: 1,
      }),
    ],
  });

const lastTextPoint = (children: Json[]) => {
  const index = children.length - 1;
  const last = getDefined(children[index]);

  if (!last.children) {
    return { offset: String(last.text).length, path: [1, index] };
  }

  return {
    offset: String(getDefined(last.children.at(-1)).text).length,
    path: [1, index, last.children.length - 1],
  };
};

const gestures: Record<Gesture, (tx: any, children: Json[]) => void> = {
  'delete every character': (tx, children) => {
    tx.text.delete({
      at: {
        anchor: { offset: 0, path: [1, 0] },
        focus: lastTextPoint(children),
      },
    });
  },
  'remove every child': (tx, children) => {
    for (let index = children.length - 1; index >= 0; index -= 1) {
      tx.nodes.remove({ at: [1, index] });
    }
  },
  'remove the last block': (tx, children) => {
    tx.nodes.remove({ at: [1, children.length - 1] });
  },
  'remove the only text node': (tx) => {
    tx.nodes.remove({ at: [1, 0] });
  },
};

describe('content completion laws', () => {
  for (const shape of shapes) {
    describe(shape.name, () => {
      for (const gesture of shape.gestures) {
        it(`${gesture} leaves the canonical empty form`, () => {
          const editor = editorFor(shape, shape.start);
          const start = editor.read.value();

          assert.deepEqual(
            (start.children[1] as Json).children,
            shape.start,
            'the gestures take their paths from a start that loads unchanged'
          );
          editor.update((tx) => gestures[gesture](tx, shape.start));

          const committed = editor.read.value();
          const children = editor.read.children() as Json[];

          assert.deepEqual(children[1].children, shape.emptied);
          assert.deepEqual(
            getEditorSchema(editor).create('el', undefined, new Set(), {
              root: 'main',
            }).children,
            shape.emptied,
            'an emptied element equals schema.create at its site'
          );
          assert.equal(
            canonicalizeRootChildren(editor, committed.children, null),
            committed.children,
            'full canonicalization leaves the committed document unchanged'
          );

          const external = editorFor(shape, shape.start);

          external.update((tx) => {
            tx.changes.apply(DocumentChange.between(start, committed));
          });
          assert.deepEqual(
            external.read.children(),
            children,
            'the external canonical check applies the committed document'
          );
        });
      }
    });
  }

  describe('a required title', () => {
    const titled = () =>
      createEditor({
        initialValue: [
          node('h1', [text('Title')]),
          node('h1', [text('Body')]),
          node('paragraph', [text('p')]),
        ] as never,
        plugins: [
          defineEditorSchema('completion-law-titled', {
            elements: {
              h1: { content: c.text({ default: 'text', min: 1 }) },
              paragraph: { content: c.text({ default: 'text', min: 1 }) },
            },
            id: 'completion-law-titled',
            root: c.prefix(
              [{ element: 'h1' }],
              c.any([c.type('h1'), c.type('paragraph')], {
                default: { type: 'paragraph' },
                min: 1,
              })
            ),
            unknown: 'reject',
            version: 1,
          }),
          history(),
        ],
      });

    it('restores the start on undo of a heading inserted above it', () => {
      const editor = titled();
      const start = editor.read.children();

      editor.update((tx) => {
        tx.nodes.insert(node('h1', [text('X')]), { at: [0] });
      });
      editor.api.history.undo();

      assert.deepEqual(editor.read.children(), start);
    });

    it('restores the start on undo of a heading inserted above it after an unrecorded edit', () => {
      const editor = titled();

      editor.update((tx) => {
        tx.nodes.insert(node('h1', [text('X')]), { at: [0] });
      });
      editor.update((tx) => {
        tx.history.skip();
        tx.text.insert('!', { at: { offset: 1, path: [3, 0] } });
      });
      editor.api.history.undo();

      assert.deepEqual(editor.read.children(), [
        node('h1', [text('Title')]),
        node('h1', [text('Body')]),
        node('paragraph', [text('p!')]),
      ]);
    });

    it('builds a fresh title in Editing and keeps the next heading in place', () => {
      const editor = titled();

      editor.update((tx) => {
        tx.nodes.remove({ at: [0] });
      });

      assert.deepEqual(editor.read.children(), [
        node('h1', [text()]),
        node('h1', [text('Body')]),
        node('paragraph', [text('p')]),
      ]);
    });

    it('keeps the new first heading when Editing replaces the whole value', () => {
      const editor = titled();

      editor.update((tx) => {
        tx.value.replace({
          children: [node('h1', [text('New')]), node('paragraph', [text('q')])],
          selection: null,
        });
      });

      assert.deepEqual(editor.read.children(), [
        node('h1', [text('New')]),
        node('paragraph', [text('q')]),
      ]);
    });

    it('applies an external change that moves a body heading into the title', () => {
      const editor = titled();
      const start = editor.read.value();
      const promoted = {
        ...start,
        children: start.children.slice(1),
      };

      editor.update((tx) => {
        tx.changes.apply(DocumentChange.between(start, promoted));
      });

      assert.deepEqual(editor.read.children(), promoted.children);
    });
  });

  describe('the formatting of an emptied line', () => {
    const formatted = () =>
      createEditor({
        initialValue: [
          node('paragraph', [text('bold', { bold: true })]),
          node('paragraph', [text('other')]),
        ] as never,
        plugins: [
          defineEditorSchema('completion-law-bold', {
            elements: {
              paragraph: { content: c.text({ default: 'text', min: 1 }) },
            },
            id: 'completion-law-bold',
            properties: [schema.textProperty('bold', property.boolean())],
            root: c.type('paragraph', {
              default: { type: 'paragraph' },
              min: 1,
            }),
            unknown: 'reject',
            version: 1,
          }),
        ],
      });
    const firstLine = (editor: ReturnType<typeof formatted>) =>
      (editor.read.children() as Json[])[0].children;

    it('keeps the line plain and its bold at the caret after deleting every character', () => {
      const editor = formatted();

      editor.update((tx) => {
        tx.selection.set({ offset: 4, path: [0, 0] });
      });
      for (let index = 0; index < 4; index += 1) {
        editor.update((tx) => {
          tx.text.delete({ reverse: true, unit: 'character' });
        });
      }

      assert.deepEqual(firstLine(editor), [text()]);
      assert.deepEqual(editor.read.marks(), { bold: true });

      editor.update((tx) => {
        tx.text.insert('x');
      });

      assert.deepEqual(firstLine(editor), [text('x', { bold: true })]);
    });

    it('types bold after deleting a selected bold line', () => {
      const editor = formatted();

      editor.update((tx) => {
        tx.selection.set({
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
        });
      });
      editor.update((tx) => {
        tx.text.delete();
      });
      editor.update((tx) => {
        tx.text.insert('x');
      });

      assert.deepEqual(firstLine(editor), [text('x', { bold: true })]);
    });

    it('types plain text once the caret has left the emptied line and come back', () => {
      const editor = formatted();

      editor.update((tx) => {
        tx.selection.set({
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 4, path: [0, 0] },
        });
      });
      editor.update((tx) => {
        tx.text.delete();
      });
      editor.update((tx) => {
        tx.selection.set({ offset: 0, path: [1, 0] });
      });
      editor.update((tx) => {
        tx.selection.set({ offset: 0, path: [0, 0] });
      });
      editor.update((tx) => {
        tx.text.insert('x');
      });

      assert.deepEqual(firstLine(editor), [text('x')]);
    });

    it('types bold on the new line after a break at the end of a bold line', () => {
      const editor = formatted();

      editor.update((tx) => {
        tx.selection.set({ offset: 4, path: [0, 0] });
      });
      editor.update((tx) => {
        tx.break.insert();
      });

      assert.deepEqual((editor.read.children() as Json[])[1].children, [
        text(),
      ]);
      assert.deepEqual(editor.read.marks(), { bold: true });

      editor.update((tx) => {
        tx.text.insert('x');
      });

      assert.deepEqual((editor.read.children() as Json[])[1].children, [
        text('x', { bold: true }),
      ]);
    });

    it('types plain text in a plain line a command inserts from a bold caret', () => {
      const editor = formatted();

      editor.update((tx) => {
        tx.selection.set({ offset: 4, path: [0, 0] });
      });
      editor.update((tx) => {
        tx.nodes.insert(node('paragraph', [text()]), { at: [1] });
        tx.selection.set({ offset: 0, path: [1, 0] });
      });
      editor.update((tx) => {
        tx.text.insert('x');
      });

      assert.deepEqual((editor.read.children() as Json[])[1].children, [
        text('x'),
      ]);
    });

    it('merges a bold spacer inserted beside a spacer once it drops its bold', () => {
      const editor = createEditor({
        plugins: [
          defineEditorSchema('completion-law-spacers', {
            elements: {
              mention: {
                properties: { character: property.string() },
                void: 'markable-inline',
              },
              paragraph: {
                content: c.any([c.text(), c.type('mention')], {
                  default: 'text',
                  min: 1,
                }),
              },
            },
            id: 'completion-law-spacers',
            properties: [schema.textProperty('bold', property.boolean())],
            root: c.type('paragraph'),
            unknown: 'reject',
            version: 1,
          }),
        ],
      });
      const mention = node('mention', [text()], { character: ' ' });
      const spaced = [text(), mention, text(), mention, text()];
      const before = { children: [node('paragraph', spaced)] };
      const after = {
        children: [
          node('paragraph', [
            text(),
            mention,
            text(),
            text('', { bold: true }),
            mention,
            text(),
          ]),
        ],
      };
      const raw = DocumentChange.between(before, after);
      const construction = constructCanonicalDocumentChange(
        editor,
        after as never,
        raw
      );
      const candidate = construction.apply(after as never);

      assert.deepEqual(candidate.children, before.children);
      assert.equal(
        constructCanonicalDocumentChange(
          editor,
          candidate,
          raw.compose(construction, before as never)
        ).empty,
        true
      );
    });

    it('keeps the authored marks of an emptied text inside a struck element', () => {
      const inserted = [
        { at: 1, author: 'alice', change: 'alice:1', kind: 'insert' },
      ];
      const struck = [
        { at: 1, author: 'alice', change: 'alice:2', kind: 'delete' },
      ];
      const editor = createEditor({
        initialValue: [
          node('paragraph', [text('ab', { authored: inserted, bold: true })], {
            authored: struck,
          }),
        ] as never,
        plugins: [createAuthoredPlugin({ authorId: 'carol', intent: 'edit' })],
      });

      editor.update((tx) => {
        tx.text.delete({
          at: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 2, path: [0, 0] },
          },
        });
      });

      assert.deepEqual(editor.read.children(), [
        node('paragraph', [text('', { authored: inserted })], {
          authored: struck,
        }),
      ]);
    });
  });

  describe('loading a stored value', () => {
    const stored = (initialValue: unknown) =>
      createEditor({
        initialValue: initialValue as never,
        plugins: [
          defineEditorSchema('completion-law-stored', {
            elements: {
              mention: {
                properties: { character: property.string() },
                void: 'markable-inline',
              },
              paragraph: {
                content: c.any([c.text(), c.type('mention')], {
                  default: 'text',
                  min: 1,
                }),
              },
              t0: { content: c.text() },
            },
            id: 'completion-law-stored',
            properties: [schema.textProperty('bold', property.boolean())],
            root: c.types(['paragraph', 't0'], {
              default: { type: 'paragraph' },
              min: 1,
            }),
            roots: { side: c.types(['paragraph', 't0']) },
            unknown: 'reject',
            version: 1,
          }),
        ],
      });
    const mention = node('mention', [text()], { character: 'A' });
    const assertExternallyCanonical = (editor: ReturnType<typeof stored>) => {
      const loaded = editor.read.value();

      assert.ok(
        constructCanonicalDocumentChange(
          editor,
          loaded,
          DocumentChange.between({ children: [] }, loaded),
          { displacement: 'none' }
        ).empty,
        'the external canonical check accepts the loaded document unchanged'
      );
    };

    it('loads equal adjacent texts merged, an inline element spaced and an empty element anchored', () => {
      const editor = stored([
        node('paragraph', [text('a'), text('b')]),
        node('paragraph', [mention]),
        node('t0', []),
        node('paragraph', [text('', { bold: true })]),
      ]);

      assert.deepEqual(editor.read.children(), [
        node('paragraph', [text('ab')]),
        node('paragraph', [text(), mention, text()]),
        node('t0', [text()]),
        node('paragraph', [text()]),
      ]);
      assertExternallyCanonical(editor);
    });

    it('loads every named root canonical', () => {
      const editor = stored({
        children: [node('paragraph', [text('a')])],
        roots: { side: [node('t0', [])] },
      });

      assert.deepEqual(editor.read.root('side'), [node('t0', [text()])]);
      assertExternallyCanonical(editor);
    });

    it('publishes a canonical document when typing into another block', () => {
      const editor = stored([node('t0', []), node('paragraph', [text('x')])]);

      editor.update((tx) => {
        tx.text.insert('y', { at: { offset: 1, path: [1, 0] } });
      });

      assert.deepEqual(editor.read.children(), [
        node('t0', [text()]),
        node('paragraph', [text('xy')]),
      ]);
      assert.deepEqual(
        canonicalizeRootChildren(editor, editor.read.children(), null),
        editor.read.children()
      );
    });
  });

  it('refuses an external change that leaves an element without its empty text', () => {
    const editor = editorFor(getDefined(shapes[0]), [text('abc')]);
    const start = editor.read.value();
    const emptied = {
      ...start,
      children: [start.children[0], { ...start.children[1], children: [] }],
    };

    assert.throws(
      () =>
        editor.update((tx) => {
          tx.changes.apply(DocumentChange.between(start, emptied));
        }),
      (error: unknown) => error instanceof EditorNoncanonicalChangeError
    );
    assert.deepEqual(editor.read.value(), start);
  });

  it('refuses to compile a minimum no canonical content reaches', () => {
    for (const content of [
      c.text({ min: 2 }),
      c.text({ default: 'text', min: 3 }),
      c.any([c.text(), c.type('xi')], {
        default: { type: 'xi' },
        max: 4,
        min: 4,
      }),
    ]) {
      assert.throws(
        () =>
          editorFor(
            { content, emptied: [], gestures: [], name: 'refused', start: [] },
            [text('a')]
          ),
        (error: unknown) =>
          error instanceof EditorSchemaCompileError &&
          error.diagnostics.some(
            ({ code }) => code === 'unconstructible-content-minimum'
          )
      );
    }
  });

  it('keeps a block inserted after a text in mixed content', () => {
    const mixed = shapes.find(
      (shape) => shape.name === 'mixed content, block default at min 1'
    );
    const editor = editorFor(getDefined(mixed), [text('abc')]);

    editor.update((tx) => {
      tx.nodes.insert(xb('q'), { at: [1, 1] });
    });

    assert.deepEqual((editor.read.children() as Json[])[1].children, [
      text('abc'),
      xb('q'),
    ]);
  });

  describe('editing between the blocks of mixed content', () => {
    const edit = (
      content: unknown,
      start: Json[],
      update: (tx: any) => void,
      expected: Json[]
    ) => {
      const editor = editorFor(
        { content, emptied: [], gestures: [], name: 'mixed', start },
        start
      );

      assert.deepEqual((editor.read.children() as Json[])[1].children, start);
      editor.update(update);

      const children = editor.read.children();

      assert.deepEqual((children as Json[])[1].children, expected);
      assert.equal(
        canonicalizeRootChildren(editor, children, null),
        children,
        'full canonicalization leaves the committed document unchanged'
      );
    };

    it('keeps the run canonical after typing into an inline element far from its start', () => {
      const run = (y: string) => [
        xb('a'),
        text('t'),
        xi('x'),
        text('b'),
        xi(y),
        text('c'),
        xb('z'),
      ];

      edit(
        c.any([c.text(), c.type('xb'), c.type('xi')]),
        run('y'),
        (tx) => tx.text.insert('Q', { at: { offset: 1, path: [1, 4, 0] } }),
        run('yQ')
      );
    });

    it('drops an emptied run after a two-slot prefix and the blocks that follow it', () => {
      const prefixed = [
        header('h'),
        node('paragraph', [text('p')]),
        text('z'),
        xb('b1'),
        xb('b2'),
      ];

      edit(
        c.prefix(
          [{ element: 'header' }, { element: 'paragraph' }],
          c.any([c.text(), c.type('xb')])
        ),
        [...prefixed, text('a')],
        (tx) =>
          tx.text.delete({
            at: {
              anchor: { offset: 0, path: [1, 5] },
              focus: { offset: 1, path: [1, 5] },
            },
          }),
        prefixed
      );
    });
  });

  describe('a selected inline spacer', () => {
    it('undoes a link removal beside it after an unrecorded edit', () => {
      const editor = createEditor({
        initialValue: [
          node('paragraph', [text('old')]),
          node('paragraph', [text('q')]),
        ] as never,
        plugins: [
          defineEditorSchema('completion-law-selected-spacer', {
            elements: {
              link: {
                content: c.text({ default: 'text', min: 1 }),
                inline: true,
              },
              paragraph: {
                content: c.any([c.text(), c.type('link')], {
                  default: 'text',
                  min: 1,
                }),
              },
            },
            id: 'completion-law-selected-spacer',
            root: c.type('paragraph', {
              default: { type: 'paragraph' },
              min: 1,
            }),
            unknown: 'reject',
            version: 1,
          }),
          history(),
        ],
      });
      const view = createEditorView(editor);
      const link = node('link', [text('link')]);
      const selection = {
        anchor: { offset: 1, path: [0, 1, 0] },
        focus: { offset: 1, path: [0, 1, 0] },
        kind: 'text',
      } as const;

      editor.update.value.replace({
        children: [
          node('paragraph', [text('first'), link, text(''), text('last')]),
          node('paragraph', [text('q')]),
        ] as never,
        selection,
      });
      editor.update((tx) => {
        tx.history.newBatch();
        tx.text.insert('Z', { at: { offset: 1, path: [1, 0] } });
      });
      editor.update((tx) => {
        tx.history.newBatch();
        tx.nodes.remove({ at: [0, 1] });
      });
      editor.update((tx) => {
        tx.history.skip();
        tx.text.insert('!', { at: { offset: 2, path: [1, 0] } });
      });
      view.update((tx) => {
        tx.history.newBatch();
        tx.value.replace({
          children: [
            node('paragraph', [text('first'), link, text('last')]),
            node('paragraph', [text('qZ!Y')]),
          ] as never,
          selection,
        });
      });
      editor.api.history.undo();
      editor.api.history.undo();
      editor.api.history.undo();

      assert.deepEqual(editor.read.children(), [
        node('paragraph', [text('first'), link, text('last')]),
        node('paragraph', [text('q!')]),
      ]);
      assert.equal(editor.read.history().undos.length, 0);
    });
  });

  describe('sites, policies and reports', () => {
    const editorWith = (definition: Json, initialValue: unknown) =>
      createEditor({
        initialValue: initialValue as never,
        plugins: [
          defineEditorSchema(`completion-law-${(schemas += 1)}`, {
            id: `completion-law-${schemas}`,
            unknown: 'reject',
            version: 1,
            ...definition,
          } as never),
          history(),
        ],
      });
    const lines = (properties: unknown[]) => ({
      elements: { paragraph: { content: c.text() } },
      properties,
      root: c.type('paragraph', { default: { type: 'paragraph' }, min: 1 }),
    });
    const caretAt = (editor: ReturnType<typeof editorWith>, offset: number) => {
      editor.update((tx) => {
        tx.selection.set({ offset, path: [0, 0] });
      });
    };
    const breakAndType = (
      editor: ReturnType<typeof editorWith>,
      value: string
    ) => {
      editor.update((tx) => {
        tx.break.insert();
      });
      editor.update((tx) => {
        tx.text.insert(value);
      });
    };

    it('reports the repairs of a fit that completes, strips and splits runs', () => {
      const editor = editorWith(
        {
          elements: {
            el: { content: c.any([c.text(), c.type('xb')]) },
            p: { content: c.text() },
            xb: { content: c.text() },
          },
          properties: [schema.textProperty('bold', property.boolean())],
          root: c.types(['el', 'p'], { default: { type: 'p' }, min: 1 }),
        },
        [node('p', [text('x')])]
      );
      const fit = getEditorSchema(editor).fitDocumentWithReport;
      const report = fit({
        children: [
          node('p', []),
          node('p', [text('', { bold: true })]),
          node('el', [text('a'), xb('b'), text('c'), text('d')]),
        ],
      } as never);

      assert.deepEqual(report.document.children, [
        node('p', [text()]),
        node('p', [text()]),
        node('el', [text('a'), xb('b'), text('cd')]),
      ]);
      assert.deepEqual(fit(report.document).repairs, []);
      assert.deepEqual(
        report.repairs.map(({ code, inputs, outputs }) => ({
          code,
          inputs: inputs.map(({ path, property: key }) =>
            key ? [...path, key] : path
          ),
          outputs: outputs.map(({ path }) => path),
        })),
        [
          { code: 'insert-empty-text', inputs: [], outputs: [[0, 0]] },
          {
            code: 'omit-empty-text-property',
            inputs: [[1, 0, 'bold']],
            outputs: [[1, 0]],
          },
          {
            code: 'merge-text',
            inputs: [
              [2, 2],
              [2, 3],
            ],
            outputs: [[2, 2]],
          },
        ]
      );
    });

    it('carries the whole formatting of a break onto the caret beside a static text default', () => {
      const editor = editorWith(
        lines([
          schema.textProperty('bold', property.boolean()),
          schema.textProperty('lang', property.string({ default: 'en' })),
        ]),
        [node('paragraph', [text('abc', { bold: true, lang: 'en' })])]
      );

      caretAt(editor, 3);
      breakAndType(editor, 'x');

      assert.deepEqual(editor.read.children(), [
        node('paragraph', [text('abc', { bold: true, lang: 'en' })]),
        node('paragraph', [text('x', { bold: true, lang: 'en' })]),
      ]);
    });

    it('carries formatting through a break when the new line keeps the property at its default', () => {
      const editor = editorWith(
        lines([
          schema.textProperty('bold', property.boolean({ default: false })),
        ]),
        [node('paragraph', [text('a', { bold: true })])]
      );

      caretAt(editor, 1);
      breakAndType(editor, 'x');

      assert.deepEqual(
        editor.read.children()[1],
        node('paragraph', [text('x', { bold: true })])
      );
    });

    it('carries no property a break drops by its split policy', () => {
      const editor = editorWith(
        lines([
          schema.textProperty('transient', property.boolean(), {
            split: 'drop',
          }),
        ]),
        [node('paragraph', [text('a', { transient: true })])]
      );

      caretAt(editor, 1);
      breakAndType(editor, 'x');

      assert.deepEqual(
        editor.read.children()[1],
        node('paragraph', [text('x')])
      );
    });

    it('completes a named root at its own site', () => {
      const editor = editorWith(
        {
          elements: {
            box: {
              content: c.any([c.text(), c.type('row')], {
                default: { type: 'row' },
                min: 2,
              }),
            },
            paragraph: { content: c.text() },
            row: { content: c.text() },
          },
          properties: [
            schema.elementProperty(
              'role',
              property.string({ default: 'main' }),
              {
                target: target.and(target.type('row'), target.root()),
              }
            ),
          ],
          root: c.types(['paragraph', 'box'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          roots: { side: c.types(['paragraph', 'box']) },
        },
        {
          children: [node('paragraph', [text('p')])],
          roots: { side: [node('box', [text('a'), text('b')])] },
        }
      );

      assert.deepEqual(editor.read.root('side'), [
        node('box', [text('ab'), node('row', [text()])]),
      ]);
    });

    it('keeps a generated text property through delete, undo and redo of the line it empties', () => {
      let generated = 0;
      const editor = editorWith(
        lines([
          schema.textProperty(
            'id',
            property.string({ generate: () => `g${(generated += 1)}` })
          ),
        ]),
        [node('paragraph', [text('x', { id: 'original' })])]
      );

      editor.update((tx) => {
        tx.text.delete({
          at: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 1, path: [0, 0] },
          },
        });
      });
      const emptied = editor.read.children();

      editor.api.history.undo();
      editor.api.history.redo();

      assert.deepEqual(editor.read.children(), emptied);
      assert.deepEqual(emptied, [
        node('paragraph', [text('', { id: 'original' })]),
      ]);
    });

    it('keeps a required metadata text property when it drops the formatting of an empty line', () => {
      const editor = editorWith(
        lines([
          schema.textProperty('bold', property.boolean()),
          schema.textProperty('markId', property.string({ required: true }), {
            role: 'metadata',
          }),
        ]),
        [node('paragraph', [text('', { bold: true, markId: 'm1' })])]
      );

      assert.deepEqual(editor.read.children(), [
        node('paragraph', [text('', { markId: 'm1' })]),
      ]);
    });

    it('keeps a required text property on an emptied line', () => {
      const editor = editorWith(
        lines([
          schema.textProperty('lang', property.string({ required: true })),
        ]),
        [node('paragraph', [text('x', { lang: 'fr' })])]
      );

      editor.update((tx) => {
        tx.text.delete({
          at: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 1, path: [0, 0] },
          },
        });
      });

      assert.deepEqual(editor.read.children(), [
        node('paragraph', [text('', { lang: 'fr' })]),
      ]);
    });

    it('reads a text property as metadata only where that declaration applies', () => {
      const editor = editorWith(
        {
          elements: {
            code: { content: c.text() },
            paragraph: { content: c.text() },
          },
          properties: [
            schema.textProperty('bold', property.boolean(), {
              target: target.type('paragraph'),
            }),
            schema.textProperty('bold', property.boolean(), {
              role: 'metadata',
              target: target.type('code'),
            }),
          ],
          root: c.types(['paragraph', 'code'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
        [node('paragraph', [text('x', { bold: true })])]
      );

      editor.update((tx) => {
        tx.text.delete({
          at: {
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 1, path: [0, 0] },
          },
        });
      });

      assert.deepEqual(editor.read.children(), [node('paragraph', [text()])]);
    });

    it('builds an anchor with its site defaults after removing the only text past a prefix', () => {
      const editor = editorWith(
        {
          elements: {
            ...helpers,
            el: { content: c.prefix([{ element: 'header' }], c.text()) },
          },
          properties: [
            schema.textProperty('lang', property.string({ default: 'en' }), {
              target: target.type('el'),
            }),
          ],
          root: c.types(['paragraph', 'el'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
        [node('el', [header('h'), text('x', { lang: 'en' })])]
      );

      editor.update((tx) => {
        tx.nodes.remove({ at: [0, 1] });
      });

      assert.deepEqual(editor.read.children(), [
        node('el', [header('h'), text('', { lang: 'en' })]),
      ]);
    });

    it('loads canonical with an empty plugin list', () => {
      const editor = createEditor({
        initialValue: [node('paragraph', [text('a'), text('b')])] as never,
        plugins: [],
      });

      assert.deepEqual(editor.read.children(), [
        node('paragraph', [text('ab')]),
      ]);
    });

    it('builds no anchor in text content with no room for a child', () => {
      const editor = editorWith(
        {
          elements: {
            el: { content: c.text({ max: 0 }) },
            paragraph: { content: c.text() },
          },
          root: c.types(['paragraph', 'el'], {
            default: { type: 'paragraph' },
            min: 1,
          }),
        },
        [node('paragraph', [text('p')]), node('el', [])]
      );

      assert.deepEqual(editor.read.children()[1], node('el', []));
    });

    it('refuses to compile an inline element in a prefix slot', () => {
      assert.throws(
        () =>
          editorWith(
            {
              elements: {
                p: { content: c.prefix([{ element: 'xi' }], c.text()) },
                xi: helpers.xi,
              },
              root: c.type('p', { default: { type: 'p' }, min: 1 }),
            },
            [node('p', [text(), xi('x'), text()])]
          ),
        (error: unknown) =>
          error instanceof EditorSchemaCompileError &&
          error.diagnostics.some(
            ({ code }) => code === 'invalid-content-prefix'
          )
      );
    });

    it('refuses to compile an inline element in a root prefix slot', () => {
      assert.throws(
        () =>
          editorWith(
            {
              elements: { p: { content: c.text() }, xi: helpers.xi },
              root: c.prefix(
                [{ element: 'xi' }],
                c.types(['p'], { default: { type: 'p' }, min: 1 })
              ),
            },
            [node('p', [text('x')])]
          ),
        (error: unknown) =>
          error instanceof EditorSchemaCompileError &&
          error.diagnostics.some(
            ({ code }) => code === 'invalid-content-prefix'
          )
      );
    });

    it('keeps the new line default of a property a break drops by its split policy', () => {
      const editor = editorWith(
        lines([
          schema.textProperty('bold', property.boolean()),
          schema.textProperty('lang', property.string({ default: 'en' }), {
            split: 'drop',
          }),
        ]),
        [node('paragraph', [text('a', { bold: true, lang: 'fr' })])]
      );

      caretAt(editor, 1);
      breakAndType(editor, 'x');

      assert.deepEqual(editor.read.children(), [
        node('paragraph', [text('a', { bold: true, lang: 'fr' })]),
        node('paragraph', [text('x', { bold: true, lang: 'en' })]),
      ]);
    });

    it('breaks a line whose only property the break drops and the new line defaults', () => {
      const editor = editorWith(
        lines([
          schema.textProperty('lang', property.string({ default: 'en' }), {
            split: 'drop',
          }),
        ]),
        [node('paragraph', [text('a', { lang: 'en' })])]
      );

      caretAt(editor, 1);
      breakAndType(editor, 'x');

      assert.deepEqual(
        editor.read.children()[1],
        node('paragraph', [text('x', { lang: 'en' })])
      );
    });

    it('gives the new line its own generated value for a property a break drops', () => {
      const editor = editorWith(
        lines([
          schema.textProperty(
            'id',
            property.string({ generate: () => 'fresh' }),
            { split: 'drop' }
          ),
        ]),
        [node('paragraph', [text('a', { id: 'original' })])]
      );

      caretAt(editor, 1);
      breakAndType(editor, 'x');

      assert.deepEqual(editor.read.children(), [
        node('paragraph', [text('a', { id: 'original' })]),
        node('paragraph', [text('x', { id: 'fresh' })]),
      ]);
    });

    it('types with the metadata a break copies onto the new line', () => {
      const editor = editorWith(
        lines([
          schema.textProperty('tag', property.string(), {
            inclusive: false,
            role: 'metadata',
          }),
        ]),
        [node('paragraph', [text('a', { tag: 't1' })])]
      );

      caretAt(editor, 1);
      breakAndType(editor, 'x');

      assert.deepEqual(
        editor.read.children()[1],
        node('paragraph', [text('x', { tag: 't1' })])
      );
    });

    it("types the formatting toggled before a break over the new line's exclusive metadata", () => {
      const group = schema.property.exclusive('completion-law:tag');
      const editor = editorWith(
        lines([
          schema.textProperty('tagA', property.boolean(), {
            exclusive: [group],
            role: 'metadata',
          }),
          schema.textProperty('tagB', property.boolean(), {
            exclusive: [group],
            role: 'metadata',
          }),
        ]),
        [node('paragraph', [text('a', { tagA: true })])]
      );

      caretAt(editor, 1);
      editor.update.marks.toggle('tagB', true);
      breakAndType(editor, 'x');

      assert.deepEqual(
        editor.read.children()[1],
        node('paragraph', [text('x', { tagB: true })])
      );
    });

    it('keeps review metadata a copy drops on text typed after a break at the end of a bold line', () => {
      const authored = [
        { at: 1, author: 'ann', change: 'ann:1', kind: 'insert' },
      ];
      const editor = editorWith(
        lines([
          schema.textProperty('bold', property.boolean()),
          schema.textProperty('authored', property.set(property.json()), {
            copy: 'drop',
            inclusive: false,
            role: 'metadata',
          }),
        ]),
        [node('paragraph', [text('a', { authored, bold: true })])]
      );

      caretAt(editor, 1);
      breakAndType(editor, 'x');

      assert.deepEqual(
        editor.read.children()[1],
        node('paragraph', [text('x', { authored, bold: true })])
      );
    });

    describe('reporting a fit', () => {
      const reportOf = (definition: Json, children: Json[]) => {
        const editor = editorWith(definition, [node('p', [text('x')])]);
        const report = getEditorSchema(editor).fitDocumentWithReport({
          children,
        } as never);

        return {
          children: report.document.children,
          repairs: report.repairs.map(({ code, inputs, outputs }) => ({
            code,
            inputs: inputs.map(({ path, property: key }) =>
              key ? [...path, key] : path
            ),
            outputs: outputs.map(({ path }) => path),
          })),
        };
      };
      const runs = {
        elements: {
          el: { content: c.any([c.text(), c.type('xb')]) },
          p: { content: c.any([c.text(), c.type('xi')]) },
          xb: { content: c.text() },
          xi: helpers.xi,
        },
        properties: [schema.textProperty('bold', property.boolean())],
        root: c.types(['el', 'p'], { default: { type: 'p' }, min: 1 }),
      };

      it('reports the removal of a subtree a merge rebuilt', () => {
        assert.deepEqual(
          reportOf(
            {
              elements: {
                b: { content: c.text() },
                el: { content: c.open() },
                p: { content: c.text() },
                xi: { content: c.text(), inline: true },
              },
              properties: [schema.textProperty('bold', property.boolean())],
              root: c.types(['el', 'p'], { default: { type: 'p' }, min: 1 }),
              unknown: 'preserve',
            },
            [
              node('el', [
                node('u', [
                  node('b', [text('kept')]),
                  node('xi', [text('a'), text('b'), text('c', { bold: true })]),
                ]),
              ]),
            ]
          ),
          {
            children: [node('el', [node('u', [node('b', [text('kept')])])])],
            repairs: [
              {
                code: 'remove-noncanonical-child',
                inputs: [[0, 0, 1]],
                outputs: [],
              },
            ],
          }
        );
      });

      it('reports one merge for a text that merges again after a spacer drops its formatting', () => {
        assert.deepEqual(
          reportOf(runs, [
            node('p', [
              xi('x'),
              text('', { bold: true }),
              text('a'),
              text('b'),
            ]),
          ]).repairs,
          [
            { code: 'insert-inline-spacer', inputs: [], outputs: [[0, 0]] },
            {
              code: 'omit-empty-text-property',
              inputs: [[0, 1, 'bold']],
              outputs: [[0, 2]],
            },
            {
              code: 'merge-text',
              inputs: [
                [0, 1],
                [0, 2],
                [0, 3],
              ],
              outputs: [[0, 2]],
            },
          ]
        );
      });

      it('reports one merge for a merged run that absorbs the spacer after it', () => {
        assert.deepEqual(
          reportOf(runs, [
            node('p', [
              text('a'),
              text('b'),
              text('', { bold: true }),
              xi('x'),
              text(),
            ]),
          ]).repairs,
          [
            {
              code: 'omit-empty-text-property',
              inputs: [[0, 2, 'bold']],
              outputs: [[0, 0]],
            },
            {
              code: 'merge-text',
              inputs: [
                [0, 0],
                [0, 1],
                [0, 2],
              ],
              outputs: [[0, 0]],
            },
          ]
        );
      });

      it('reports each empty text a fit drops beside a block, and nothing it built', () => {
        assert.deepEqual(
          reportOf(runs, [node('el', [xb('b'), text(), text()])]).repairs,
          [
            { code: 'remove-empty-text', inputs: [[0, 1]], outputs: [] },
            { code: 'remove-empty-text', inputs: [[0, 2]], outputs: [] },
          ]
        );
      });

      it('reports no repair for an empty text a fit builds and then drops for a block', () => {
        assert.deepEqual(
          reportOf(
            {
              elements: {
                el: {
                  content: c.any([c.text(), c.type('xb')], {
                    default: { type: 'xb' },
                    min: 2,
                  }),
                },
                p: { content: c.text() },
                xb: { content: c.text() },
              },
              root: c.types(['el', 'p'], { default: { type: 'p' }, min: 1 }),
            },
            [node('el', [text(), text()])]
          ),
          {
            children: [node('el', [xb(), xb()])],
            repairs: [
              { code: 'remove-empty-text', inputs: [[0, 0]], outputs: [] },
              { code: 'remove-empty-text', inputs: [[0, 1]], outputs: [] },
              {
                code: 'insert-required-content',
                inputs: [],
                outputs: [[0, 0]],
              },
              {
                code: 'insert-required-content',
                inputs: [],
                outputs: [[0, 1]],
              },
            ],
          }
        );
      });

      it('reports a formatted empty text beside a block as removed, not stripped', () => {
        assert.deepEqual(
          reportOf(runs, [node('el', [xb('b'), text('', { bold: true })])])
            .repairs,
          [{ code: 'remove-empty-text', inputs: [[0, 1]], outputs: [] }]
        );
      });
    });
  });
});
