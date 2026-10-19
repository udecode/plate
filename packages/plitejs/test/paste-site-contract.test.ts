import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  ContentSlice,
  createEditor,
  createEditorView,
  defineEditorSchema,
  definePlugin,
  editorCommands,
  editorReads,
  schema,
  SelectionApi,
  type SliceLandingInput,
} from 'plitejs';

import { createAuthoredPlugin } from '../src/authored/authored';
import {
  dispatchCommand,
  evaluateCommandWithState,
} from '../src/core/command-registry';
import { registerEditorContent } from '../src/core/content';
import {
  getEditorStateView,
  withEditorUpdateRootScope,
} from '../src/core/public-state';
import { setTargetRuntime } from '../src/core/target-runtime';
import { dom, domCommands } from '../src/dom';
import { createDataTransfer } from '../src/testing/createDataTransfer';
import {
  paragraph,
  heading,
  LandingSchema,
  NotesSchema,
  HeaderNotesSchema,
  SingleNoteSchema,
  caret,
  landing,
  proposeOnEmpty,
} from './support/slice-landing';

describe('paste site', () => {
  it('resolves the target in the root that holds the caret', () => {
    const notesCaret = SelectionApi.text({
      anchor: { offset: 0, path: [0, 0], root: 'notes' },
      focus: { offset: 0, path: [0, 0], root: 'notes' },
    });
    const layouts = [
      { main: 'Body', notes: '' },
      { main: '', notes: 'note' },
    ];
    const targets = layouts.map(({ main, notes }) => {
      let seen: SliceLandingInput['target'] | undefined;
      const editor = createEditor({
        initialValue: {
          children: [paragraph(main)],
          roots: { notes: [paragraph(notes)] },
        },
        plugins: [
          NotesSchema,
          landing('record-target', (input, next) => {
            seen = input.target;

            return next();
          }),
        ],
      });

      editor.update.selection.set(notesCaret);
      editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')]));

      return seen;
    });

    assert.deepEqual(targets, [
      { block: [paragraph(''), [0]], kind: 'empty', root: 'notes' },
      { block: [paragraph('note'), [0]], kind: 'context', root: 'notes' },
    ]);
  });

  it('resolves the target in the root an explicit target names, not the view root', () => {
    let seen: SliceLandingInput['target'] | undefined;
    const editor = createEditor({
      initialValue: {
        children: [paragraph('Main')],
        roots: { header: [paragraph('Head')], notes: [paragraph('')] },
      },
      plugins: [
        HeaderNotesSchema,
        landing('record-target', (input, next) => {
          seen = input.target;

          return next();
        }),
      ],
    });

    createEditorView(editor, { root: 'header' }).update.slice.replace(
      ContentSlice.closed([paragraph('Plain')]),
      { at: { offset: 0, path: [0, 0], root: 'notes' } }
    );

    assert.deepEqual(seen, {
      block: [paragraph(''), [0]],
      kind: 'empty',
      root: 'notes',
    });
  });

  it('keeps the properties of the empty block an explicit target names through a view', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('', { align: 'right' })],
        roots: { notes: [paragraph('', { align: 'left' })] },
      },
      plugins: [NotesSchema, proposeOnEmpty([paragraph('Head')])],
    });

    createEditorView(editor).update.slice.replace(
      ContentSlice.closed([paragraph('Plain')]),
      { at: { offset: 0, path: [0, 0], root: 'notes' } }
    );

    assert.deepEqual(editor.read.root('notes'), [
      paragraph('Head', { align: 'left' }),
    ]);
  });

  it('lands a paste dispatched through a named-root view in the view root', () => {
    const results = ['', 'KEEP'].map((header) => {
      const editor = createEditor({
        initialValue: {
          children: [paragraph('', { align: 'right' })],
          roots: {
            header: [paragraph(header, { align: 'left' })],
            notes: [paragraph('')],
          },
        },
        plugins: [HeaderNotesSchema, proposeOnEmpty([paragraph('Head')])],
      });

      dispatchCommand(
        createEditorView(editor, { root: 'header' }),
        editorCommands.replaceSlice,
        {
          options: { at: { offset: 0, path: [0, 0] } },
          slice: ContentSlice.closed([paragraph('Plain')]),
        }
      );

      return [editor.read.root('header'), editor.read.children()];
    });

    assert.deepEqual(results, [
      [
        [paragraph('Head', { align: 'left' })],
        [paragraph('', { align: 'right' })],
      ],
      [
        [paragraph('PlainKEEP', { align: 'left' })],
        [paragraph('', { align: 'right' })],
      ],
    ]);
  });

  it('replaces no empty block that content rules removed from the landing', () => {
    const results = [
      {
        children: [paragraph('Before'), paragraph('', { align: 'gone' })],
        path: [1, 0],
      },
      {
        children: [paragraph('', { align: 'gone' }), paragraph('After')],
        path: [0, 0],
      },
    ].map(({ children, path }) => {
      const editor = createEditor({
        initialSelection: caret(path),
        initialValue: children,
        plugins: [LandingSchema, proposeOnEmpty([paragraph('Head')])],
      });

      registerEditorContent(editor, (_reader, node) => node?.align !== 'gone');
      editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')]));

      return editor.read.children();
    });

    assert.deepEqual(results, [
      [paragraph('BeforePlain'), paragraph('', { align: 'gone' })],
      [paragraph('', { align: 'gone' }), paragraph('PlainAfter')],
    ]);
  });

  it('keeps the properties of the empty block in the caret root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('', { align: 'right' })],
        roots: { notes: [paragraph('', { align: 'left' })] },
      },
      plugins: [NotesSchema, proposeOnEmpty([paragraph('Head')])],
    });

    editor.update.selection.set(
      SelectionApi.text({
        anchor: { offset: 0, path: [0, 0], root: 'notes' },
        focus: { offset: 0, path: [0, 0], root: 'notes' },
      })
    );

    assert.equal(
      editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')])),
      true
    );
    assert.deepEqual(editor.read.root('notes'), [
      paragraph('Head', { align: 'left' }),
    ]);
    assert.deepEqual(editor.read.children(), [
      paragraph('', { align: 'right' }),
    ]);
  });

  it('admits a proposal against the children of the caret root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('A'), paragraph('B')],
        roots: { notes: [paragraph('')] },
      },
      plugins: [SingleNoteSchema, proposeOnEmpty([heading('Head')])],
    });

    editor.update.selection.set(
      SelectionApi.text({
        anchor: { offset: 0, path: [0, 0], root: 'notes' },
        focus: { offset: 0, path: [0, 0], root: 'notes' },
      })
    );

    assert.equal(
      editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')])),
      true
    );
    assert.deepEqual(editor.read.root('notes'), [heading('Head')]);
  });

  it('admits a nested proposal against its parent in the caret root', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('Main')],
        roots: { notes: [{ type: 'quote', children: [paragraph('')] }] },
      },
      plugins: [NotesSchema, proposeOnEmpty([paragraph('Head')])],
    });

    editor.update.selection.set(
      SelectionApi.text({
        anchor: { offset: 0, path: [0, 0, 0], root: 'notes' },
        focus: { offset: 0, path: [0, 0, 0], root: 'notes' },
      })
    );

    assert.equal(
      editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')])),
      true
    );
    assert.deepEqual(editor.read.root('notes'), [
      { type: 'quote', children: [paragraph('Head')] },
    ]);
  });

  it('reads the target root through the landing state from any editor', () => {
    const notesPoint = { offset: 0, path: [0, 0], root: 'notes' };
    const read = (
      dispatch: (editor: ReturnType<typeof createEditor>) => void
    ) => {
      let seen: unknown;
      const editor = createEditor({
        initialValue: {
          children: [paragraph('Main'), paragraph('More')],
          roots: { header: [paragraph('Head')], notes: [paragraph('Note')] },
        },
        plugins: [
          HeaderNotesSchema,
          definePlugin('record-state', {
            readMiddleware: ({ around }) => [
              around(editorReads.slice.landing, ({ input, next, state }) => {
                const path = input.target.block?.[1];

                seen = [
                  state.view.root(),
                  path && state.nodes.get(path)?.[0],
                  state.children().length,
                ];

                return next();
              }),
            ],
          }),
        ],
      });

      dispatch(editor);

      return seen;
    };
    const plain = ContentSlice.closed([paragraph('Plain')]);

    assert.deepEqual(
      [
        read((editor) => {
          editor.update.slice.replace(plain, { at: notesPoint });
        }),
        read((editor) => {
          createEditorView(editor, { root: 'header' }).update.slice.replace(
            plain,
            { at: notesPoint }
          );
        }),
        read((editor) => {
          createEditorView(createEditorView(editor, { root: 'header' }), {
            root: 'header',
          }).update.slice.replace(plain, { at: notesPoint });
        }),
        read((editor) => {
          editor.update.selection.set(
            SelectionApi.nodes([[0]], { mode: 'block', root: 'notes' })
          );
          editor.update.slice.replace(plain);
        }),
        read((editor) => {
          createEditorView(editor, { root: 'header' }).update.slice.replace(
            plain,
            { at: editor.key(editor.read.children()[0]) }
          );
        }),
      ],
      [
        ['notes', paragraph('Note'), 1],
        ['notes', paragraph('Note'), 1],
        ['notes', paragraph('Note'), 1],
        ['notes', paragraph('Note'), 1],
        [undefined, paragraph('Main'), 2],
      ]
    );
  });

  it('builds a state for another root only for a landing handler', () => {
    const readFactoryCalls = (withHandler: boolean) => {
      let calls = 0;
      const editor = createEditor({
        initialValue: {
          children: [paragraph('Main')],
          roots: { header: [paragraph('Head')], notes: [paragraph('Note')] },
        },
        plugins: [
          HeaderNotesSchema,
          definePlugin('count-reads', {
            read: () => {
              calls += 1;
              return {};
            },
          }),
          ...(withHandler
            ? [
                definePlugin('pass-landing', {
                  readMiddleware: ({ around }) => [
                    around(editorReads.slice.landing, ({ next }) => next()),
                  ],
                }),
              ]
            : []),
        ],
      });
      const paste = () =>
        editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')]), {
          at: { offset: 0, path: [0, 0], root: 'notes' },
        });

      paste();
      const before = calls;
      paste();

      return calls - before;
    };

    assert.deepEqual([readFactoryCalls(false), readFactoryCalls(true)], [0, 1]);
  });

  it('proposes on the empty block a content rule leaves the paste in', () => {
    const editor = createEditor({
      initialSelection: caret([0, 0]),
      initialValue: [
        paragraph('', { align: 'gone' }),
        paragraph('', { align: 'live' }),
      ],
      plugins: [LandingSchema, proposeOnEmpty([paragraph('Head')])],
    });

    registerEditorContent(editor, (_reader, node) => node?.align !== 'gone');
    editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')]));

    assert.deepEqual(editor.read.children(), [
      paragraph('', { align: 'gone' }),
      paragraph('Head', { align: 'live' }),
    ]);
  });

  it('gives an empty target where a hanging range or a node key lands', () => {
    const results = (['range', 'key'] as const).map((at) => {
      const editor = createEditor({
        initialValue: [paragraph(''), paragraph('After')],
        plugins: [LandingSchema, proposeOnEmpty([paragraph('Head')])],
      });
      const plain = ContentSlice.closed([paragraph('Plain')]);

      if (at === 'range') {
        editor.update.selection.set(
          SelectionApi.text({
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 0, path: [1, 0] },
          })
        );
        editor.update.slice.replace(plain);
      } else {
        editor.update.slice.replace(plain, {
          at: editor.key(editor.read.children()[0]),
        });
      }

      return editor.read.children();
    });

    assert.deepEqual(results, [
      [paragraph('Head'), paragraph('After')],
      [paragraph('Head'), paragraph('After')],
    ]);
  });

  it('joins open paste edges in an undeclared named root', () => {
    const results = ([2, 1, 0, 'key'] as const).map((at) => {
      const editor = createEditor({
        initialValue: {
          children: [paragraph('Body')],
          roots: { header: [paragraph('ab')] },
        },
      });

      editor.update.slice.replace(
        ContentSlice.fromJSON({
          content: [paragraph('12')],
          openEnd: 1,
          openStart: 1,
        }),
        {
          at:
            at === 'key'
              ? editor.key(editor.read.root('header')[0])
              : { offset: at, path: [0, 0], root: 'header' },
        }
      );

      return [editor.read.root('header'), editor.read.children()];
    });

    assert.deepEqual(
      results,
      [
        paragraph('ab12'),
        paragraph('a12b'),
        paragraph('12ab'),
        paragraph('12ab'),
      ].map((header) => [[header], [paragraph('Body')]])
    );
  });

  it('joins open edges in an undeclared named root through the raw slice APIs', () => {
    const editor = createEditor({
      initialValue: {
        children: [paragraph('Body')],
        roots: { notes: [paragraph('ab')] },
      },
    });
    const slice = ContentSlice.fromJSON({
      content: [paragraph('12')],
      openEnd: 1,
      openStart: 1,
    });
    const at = { offset: 1, path: [0, 0], root: 'notes' };
    const before = editor.read.value();
    const fitted = editor.read((state) => state.slice.fit(slice, { at }));

    editor.update((tx) => {
      tx.slice.replace(slice, { at });
    });

    assert.deepEqual(
      [
        fitted && fitted.changes.apply(before).roots?.notes,
        editor.read.root('notes'),
      ],
      [[paragraph('a12b')], [paragraph('a12b')]]
    );
  });

  it('reads earlier draft changes in the target root through the landing state', () => {
    const results = (['update', 'extend', 'projected'] as const).map(
      (draft) => {
        let seen: unknown;
        const editor = createEditor({
          initialValue: {
            children: [paragraph('Main')],
            roots: { notes: [paragraph('Note')] },
          },
          plugins: [
            NotesSchema,
            dom(),
            definePlugin('record-draft', {
              readMiddleware: ({ around }) => [
                around(editorReads.slice.landing, ({ input, next, state }) => {
                  const path = input.target.block?.[1];

                  seen = path && state.nodes.get(path)?.[0];

                  return next();
                }),
              ],
            }),
          ],
        });
        const at = { offset: 0, path: [0, 0], root: 'notes' };
        const input = {
          options: { at },
          slice: ContentSlice.closed([paragraph('Plain')]),
        };

        if (draft === 'update') {
          editor.update((tx) => {
            tx.text.insert('ZZ', { at });
            tx.command(editorCommands.replaceSlice, input);
          });
        } else if (draft === 'extend') {
          editor.read((state) => {
            const typed = state.transaction((tx) => {
              tx.text.insert('ZZ', { at });
            });

            state.transaction.extend(typed, () => {
              evaluateCommandWithState(
                editor,
                editorCommands.replaceSlice,
                getEditorStateView(editor),
                input
              );
            });
          });
        } else {
          editor.read((state) => {
            const typed = state.transaction((tx) => {
              tx.text.insert('ZZ', { at });
              tx.selection.set({ anchor: at, focus: at });
            });

            state.transaction.extend(typed, () => {
              withEditorUpdateRootScope(editor, 'notes', () => {
                evaluateCommandWithState(
                  editor,
                  domCommands.insertData,
                  getEditorStateView(editor),
                  createDataTransfer(new Map([['text/plain', 'Plain']]))
                );
              });
            });
          });
        }

        return seen;
      }
    );

    assert.deepEqual(results, [
      paragraph('ZZNote'),
      paragraph('ZZNote'),
      paragraph('ZZNote'),
    ]);
  });

  const pasteAtReportedCaret = (
    editor: ReturnType<typeof createEditor>,
    reported: ReturnType<typeof caret>,
    value: string
  ) => {
    setTargetRuntime(editor, { resolveImplicitTarget: () => reported });
    editor.update.slice.replace(
      ContentSlice.fromJSON({
        content: [paragraph(value)],
        openEnd: 1,
        openStart: 1,
      })
    );
  };

  it('lands an implicit paste at the caret the target runtime reports', () => {
    const editor = createEditor({
      initialValue: [paragraph('aa'), paragraph('bb')],
      plugins: [LandingSchema],
    });

    pasteAtReportedCaret(editor, caret([0, 0], 1), 'X');

    assert.deepEqual(editor.read.children(), [
      paragraph('aXa'),
      paragraph('bb'),
    ]);
  });

  it('lands an implicit paste at the caret the target runtime reports in a command frame', () => {
    const struck = {
      authored: [{ at: 1, author: 'carol', change: 'carol:1', kind: 'delete' }],
      text: 'xyz',
    };
    const editor = createEditor({
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: 'ab' }, struck, { text: 'cd' }],
        },
      ],
      plugins: [
        LandingSchema,
        createAuthoredPlugin({ authorId: 'bob', intent: 'edit' }),
      ],
    });

    pasteAtReportedCaret(editor, caret([0, 2], 1), 'Q');

    assert.deepEqual(editor.read.children(), [
      {
        type: 'paragraph',
        children: [{ text: 'ab' }, struck, { text: 'cQd' }],
      },
    ]);
  });

  it('lands an implicit paste in the root of the caret the target runtime reports, within that root', () => {
    const seen: unknown[] = [];
    const editor = createEditor({
      initialValue: {
        children: [paragraph('a')],
        roots: { header: [paragraph('h')], notes: [paragraph('abcd')] },
      },
      maxLength: 5,
      plugins: [
        HeaderNotesSchema,
        definePlugin('record-roots', {
          readMiddleware: ({ around }) => [
            around(editorReads.slice.landing, ({ input, next, state }) => {
              seen.push([input.target.root, state.view.root()]);

              return next();
            }),
          ],
        }),
      ],
    });

    pasteAtReportedCaret(
      editor,
      SelectionApi.text({
        anchor: { offset: 1, path: [0, 0], root: 'notes' },
        focus: { offset: 1, path: [0, 0], root: 'notes' },
      }),
      '1234'
    );

    assert.deepEqual(
      [editor.read.root('notes'), seen],
      [[paragraph('a1bcd')], [['notes', 'notes']]]
    );
  });

  it('keeps the paste options over a selected inline node', () => {
    const MentionSchema = defineEditorSchema('schema:slice-landing-mention', {
      elements: {
        mention: { void: 'inline' },
        paragraph: {
          content: schema.content.any(
            [schema.content.text(), schema.content.type('mention')],
            { default: 'text', min: 1 }
          ),
        },
      },
      root: schema.content.type('paragraph', {
        default: { type: 'paragraph' },
        min: 1,
      }),
      unknown: 'reject',
    });
    const editor = createEditor({
      initialSelection: SelectionApi.nodes([[0, 1]], { mode: 'block' }),
      initialValue: [
        {
          type: 'paragraph',
          children: [
            { text: 'a' },
            { type: 'mention', children: [{ text: '' }] },
            { text: 'b' },
          ],
        },
      ],
      plugins: [MentionSchema],
    });

    editor.update.slice.replace(
      ContentSlice.fromJSON({
        content: [paragraph('X')],
        openEnd: 1,
        openStart: 1,
      }),
      { voids: true }
    );

    assert.deepEqual(editor.read.children(), [
      {
        type: 'paragraph',
        children: [
          { text: 'a' },
          { type: 'mention', children: [{ text: 'X' }] },
          { text: 'b' },
        ],
      },
    ]);
  });

  it('reads the target root when a root view evaluates a paste with the owner state', () => {
    const seen: unknown[] = [];
    const editor = createEditor({
      initialValue: {
        children: [paragraph('Main')],
        roots: { header: [paragraph('Head')], notes: [paragraph('Note')] },
      },
      plugins: [
        HeaderNotesSchema,
        definePlugin('record-roots', {
          readMiddleware: ({ around }) => [
            around(editorReads.slice.landing, ({ input, next, state }) => {
              seen.push([input.target.root, state.view.root()]);

              return next();
            }),
          ],
        }),
      ],
    });

    editor.read(() => {
      evaluateCommandWithState(
        createEditorView(editor, { root: 'header' }),
        editorCommands.replaceSlice,
        getEditorStateView(editor),
        {
          options: { at: { offset: 0, path: [0, 0] } },
          slice: ContentSlice.closed([paragraph('Plain')]),
        }
      );
    });

    assert.deepEqual(seen, [[undefined, undefined]]);
  });

  it('inserts at a block boundary beside an empty block without replacing it', () => {
    const seen: unknown[] = [];
    const editor = createEditor({
      initialValue: [paragraph('')],
      plugins: [
        LandingSchema,
        landing('record-target', (input, next) => {
          seen.push(input.target);

          return next();
        }),
        proposeOnEmpty([paragraph('Head')]),
      ],
    });

    editor.update.slice.replace(ContentSlice.closed([paragraph('Plain')]), {
      at: [1],
    });

    assert.deepEqual(seen, [{ block: null, kind: 'context' }]);
    assert.deepEqual(editor.read.children(), [
      paragraph(''),
      paragraph('Plain'),
    ]);
  });
});
