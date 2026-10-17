import * as Y from 'yjs';

import { getEditorLiveSelection } from '#platejs-test-internal';

import {
  BaseParagraphPlugin,
  property,
  ContentSlice,
  ElementIdPlugin,
  NodeApi,
  SelectionApi,
  type Descendant,
  createEditor,
  createEditorView,
  definePlugin,
  DocumentChange,
  schema,
  type Selection,
  type Value,
} from '../../../core';
import { mergePlugins } from '../../../internal/utils/mergePlugins';
import { getStaticDocumentView } from '../../../static/internal/staticDocumentView';
import { TrailingBlockPlugin } from '../../../utils/plugins/TrailingBlockPlugin';
import { YjsPlugin } from '../../../yjs/react';
import { BaseBlockquotePlugin } from '../../basic-nodes/lib/BaseBlockPlugins';
import { BaseColumnPlugin } from '../../layout/lib/BaseColumnPlugin';
import { BaseListPlugin } from '../../list/lib/BaseListPlugin';
import { BaseTablePlugin } from '../../table/lib/BaseTablePlugin';
import {
  BaseFootnoteDefinitionPlugin,
  BaseFootnotePlugin,
} from './BaseFootnotePlugin';

describe('footnote paste end matter', () => {
  const paragraph = (text: string) => ({
    type: 'paragraph',
    children: [{ text }],
  });
  const note = (text: string, ref = '1') => ({
    type: 'footnoteDefinition',
    ref,
    children: [paragraph(text)],
  });
  const quote = (children: readonly Descendant[]) => ({
    type: 'blockquote',
    children,
  });
  const cell = (children: readonly Descendant[]) => ({
    type: 'tableCell',
    children,
  });
  const table = (cells: readonly Descendant[]) => ({
    type: 'table',
    children: [{ type: 'tableRow', children: cells }],
  });
  const range = (path: number[], offset = 0) => ({
    anchor: { path, offset },
    focus: { path, offset },
  });
  const pastePlugins = (tableFirst: boolean) =>
    tableFirst
      ? [BaseTablePlugin, BaseFootnotePlugin, BaseFootnoteDefinitionPlugin]
      : [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin, BaseTablePlugin];

  for (const tableFirst of [false, true]) {
    describe(`Table installed ${tableFirst ? 'before' : 'after'} Footnote`, () => {
      for (const site of ['cell', 'quote', 'list', 'paragraph'] as const) {
        it(`pastes at a ${site} with stable caret and history`, () => {
          const head =
            site === 'cell'
              ? table([cell([paragraph('abcd')])])
              : site === 'quote'
                ? quote([paragraph('abcd')])
                : site === 'list'
                  ? { ...paragraph('abcd'), listType: 'bulleted', indent: 1 }
                  : paragraph('abcd');
          const path =
            site === 'cell'
              ? [0, 0, 0, 0, 0]
              : site === 'quote'
                ? [0, 0, 0]
                : [0, 0];
          const editor = createEditor({
            plugins: [
              ...pastePlugins(tableFirst),
              BaseBlockquotePlugin,
              BaseListPlugin,
              TrailingBlockPlugin,
            ],
            initialValue: [head, paragraph('tail')],
            selection: SelectionApi.text(range(path, 2)),
          });
          const before = editor.read.value();
          const selection = editor.read.selection();
          expect(
            editor.update.fragment.replace([paragraph('X'), note('NOTE')])
          ).toBe(true);
          expect(editor.read.children().slice(1)).toEqual([
            paragraph('tail'),
            note('NOTE'),
            paragraph(''),
          ]);
          expect(editor.read.selection()).toEqual(range(path, 3));
          editor.api.history.undo();
          expect([editor.read.value(), editor.read.selection()]).toEqual([
            before,
            selection,
          ]);
          editor.api.history.redo();
          editor.api.history.undo();
          expect([editor.read.value(), editor.read.selection()]).toEqual([
            before,
            selection,
          ]);
        });
      }

      it('puts each selected cell copy at the root and leaves the caret where a plain paste does', () => {
        const editor = createEditor({
          plugins: pastePlugins(tableFirst),
          initialValue: [
            table([cell([paragraph('a')]), cell([paragraph('b')])]),
            paragraph('tail'),
          ],
        });
        editor.update.selection.setNodes([
          [0, 0, 0],
          [0, 0, 1],
        ]);
        editor.update.fragment.replace([paragraph('X'), note('NOTE')]);
        expect(editor.read.children()).toEqual([
          table([cell([paragraph('X')]), cell([paragraph('X')])]),
          paragraph('tail'),
          note('NOTE'),
          note('NOTE'),
        ]);
        expect(editor.read.selection()).toEqual(range([0, 0, 1, 0, 0], 1));
      });

      for (const expanding of [false, true]) {
        it(`takes prepared ${expanding ? 'expanding' : 'fitted'} table selection from filled cells`, () => {
          const editor = createEditor({
            plugins: pastePlugins(tableFirst),
            initialValue: [
              table([cell([paragraph('old')])]),
              paragraph('tail'),
            ],
            selection: SelectionApi.text(range([0, 0, 0, 0, 0])),
          });
          const cells = expanding
            ? [cell([paragraph('X'), note('FIRST')]), cell([note('LAST')])]
            : [cell([paragraph('X'), note('LAST')])];
          expect(editor.update.fragment.replace([table(cells)])).toBe(true);
          expect(editor.read.children().slice(1)).toEqual([
            paragraph('tail'),
            ...(expanding ? [note('FIRST')] : []),
            note('LAST'),
          ]);
          if (expanding) {
            expect(getEditorLiveSelection(editor)).toMatchObject({
              kind: 'node',
              paths: [
                [0, 0, 0],
                [0, 0, 1],
              ],
            });
          } else {
            expect(editor.read.selection()).toEqual({
              anchor: { path: [0, 0, 0, 0, 0], offset: 0 },
              focus: { path: [0, 0, 0, 0, 0], offset: 1 },
            });
          }
        });
      }

      it('keeps source note order and an unreplaced canonical definition', () => {
        for (const canonical of [false, true]) {
          const editor = createEditor({
            plugins: [...pastePlugins(tableFirst), BaseBlockquotePlugin],
            initialValue: [
              paragraph('body'),
              ...(canonical ? [note('EXISTING')] : []),
            ],
            selection: SelectionApi.text(range([0, 0], 2)),
          });
          editor.update.fragment.replace([
            quote([quote([note('FIRST')]), note('SECOND')]),
          ]);
          expect(
            editor.read.footnote
              .definitions({ ref: '1' })
              .map(([node]) => NodeApi.string(node))
          ).toEqual([...(canonical ? ['EXISTING'] : []), 'FIRST', 'SECOND']);
        }
      });

      it('pastes copied words into the body, one cell, two cells and the same note', () => {
        for (const target of ['body', 'cell', 'cells', 'note'] as const) {
          const editor = createEditor({
            plugins: pastePlugins(tableFirst),
            initialValue: [
              paragraph('body'),
              table([cell([paragraph('ab')]), cell([paragraph('cd')])]),
              note('definition'),
            ],
          });
          const slice = editor.read.slice.export({
            at: {
              anchor: { path: [2, 0, 0], offset: 1 },
              focus: { path: [2, 0, 0], offset: 5 },
            },
          });
          if (target === 'cells') {
            editor.update.selection.setNodes([
              [1, 0, 0],
              [1, 0, 1],
            ]);
          } else {
            editor.update.selection.set(
              SelectionApi.text(
                range(
                  target === 'body'
                    ? [0, 0]
                    : target === 'cell'
                      ? [1, 0, 0, 0, 0]
                      : [2, 0, 0],
                  1
                )
              )
            );
          }
          expect(editor.update.slice.replace(slice)).toBe(true);
          expect(editor.read.footnote.definitions({ ref: '1' })).toHaveLength(
            1
          );
          if (target === 'cells') {
            expect(editor.read.children()[1]).toEqual(
              table([cell([paragraph('efin')]), cell([paragraph('efin')])])
            );
          } else {
            expect(
              NodeApi.string(
                editor.read.children()[
                  target === 'body' ? 0 : target === 'cell' ? 1 : 2
                ]
              )
            ).toBe(
              target === 'body'
                ? 'befinody'
                : target === 'cell'
                  ? 'aefinbcd'
                  : 'definefinition'
            );
          }
        }
      });

      it('keeps cell trailing text when copying from the body through a whole note', () => {
        const editor = createEditor({
          plugins: pastePlugins(tableFirst),
          initialValue: [
            paragraph('body'),
            table([cell([paragraph('abcd')])]),
            note('NOTE'),
          ],
        });
        const source = createEditor({
          plugins: pastePlugins(tableFirst),
          initialValue: [paragraph('X'), note('NEW')],
        });
        const slice = source.read.slice.export({
          at: {
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [1, 0, 0], offset: 3 },
          },
        });
        editor.update.selection.set(
          SelectionApi.text(range([1, 0, 0, 0, 0], 2))
        );
        editor.update.slice.replace(slice);
        expect(editor.read.children()[1]).toEqual(
          table([cell([paragraph('abXcd')])])
        );
        expect(
          editor.read.footnote
            .definitions({ ref: '1' })
            .map(([node]) => NodeApi.string(node))
        ).toEqual(['NOTE', 'NEW']);
      });

      it('admits the same text under length limits in one cell and a two-cell fill', () => {
        const ordinaryDefinition = definePlugin('footnoteDefinition', {
          schema: ({ plugins }) => ({
            element: {
              content: plugins.blockContent({
                default: BaseParagraphPlugin,
                min: 1,
              }),
              properties: { ref: property.string({ required: true }) },
            },
          }),
        });
        for (const twoCells of [false, true]) {
          for (let maxLength = 8; maxLength <= 14; maxLength++) {
            const values: string[] = [];
            for (const definition of [
              ordinaryDefinition,
              BaseFootnoteDefinitionPlugin,
            ]) {
              const editor = createEditor({
                plugins: tableFirst
                  ? [BaseTablePlugin, BaseFootnotePlugin, definition]
                  : [BaseFootnotePlugin, definition, BaseTablePlugin],
                initialValue: [
                  table([cell([paragraph('abcd')]), cell([paragraph('ef')])]),
                ],
                maxLength,
              });
              if (twoCells) {
                editor.update.selection.setNodes([
                  [0, 0, 0],
                  [0, 0, 1],
                ]);
              } else {
                editor.update.selection.set(
                  SelectionApi.text(range([0, 0, 0, 0, 0], 2))
                );
              }
              const result = editor.update.fragment.replace([
                paragraph('XY'),
                note('123456'),
              ]);
              const notes: string[] = [];
              const flow = (nodes: readonly Descendant[]): string =>
                nodes
                  .map((node) => {
                    if (NodeApi.isText(node)) return node.text;
                    if (node.type === 'footnoteDefinition') {
                      notes.push(NodeApi.string(node));
                      return '';
                    }
                    return flow(node.children);
                  })
                  .join('');
              const text = flow(editor.read.children());
              values.push(JSON.stringify([result, text, notes]));
            }
            expect(values[1]).toEqual(values[0]);
          }
        }
      });

      it('pastes GitHub HTML through the clipboard into a cell', () => {
        const editor = createEditor({
          plugins: pastePlugins(tableFirst),
          initialValue: [table([cell([paragraph('ab')])]), paragraph('tail')],
          selection: SelectionApi.text(range([0, 0, 0, 0, 0], 1)),
        });
        const data = new DataTransfer();
        data.setData(
          'text/html',
          '<p>X<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref>1</a></sup></p><section data-footnotes><ol><li id="user-content-fn-1"><p>NOTE <a href="#user-content-fnref-1" data-footnote-backref>↩</a></p></li></ol></section>'
        );
        expect(editor.api.dom.clipboard.insertData(data)).toBe(true);
        expect(editor.read.children().slice(1)).toEqual([
          paragraph('tail'),
          note('NOTE '),
        ]);
        expect(
          editor.read.footnote.references({ ref: '1' })[0]?.[1].slice(0, 3)
        ).toEqual([0, 0, 0]);
      });

      it('keeps notes in place on block copy drops and whole-note text drops', () => {
        const editor = createEditor({
          plugins: pastePlugins(tableFirst),
          initialValue: [paragraph('A'), paragraph('B'), note('NOTE')],
        });
        expect(
          editor.api.transfer.copy({
            nodes: [editor.key([2])!],
            to: { edge: 'before', key: editor.key([1])! },
          }).status
        ).toBe('copied');
        expect(editor.read.children()).toEqual([
          paragraph('A'),
          note('NOTE'),
          paragraph('B'),
          note('NOTE'),
        ]);
        const source = createEditor({
          plugins: pastePlugins(tableFirst),
          initialValue: [paragraph('X'), note('TEXT')],
        });
        const target = createEditor({
          plugins: pastePlugins(tableFirst),
          initialValue: [paragraph('abcd'), paragraph('tail')],
        });
        expect(
          target.api.transfer.copy({
            from: source,
            range: {
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [1, 0, 0], offset: 4 },
            },
            to: { point: { path: [0, 0], offset: 4 } },
          })
        ).toMatchObject({ status: 'copied' });
        expect(target.read.children()).toEqual([
          paragraph('abcd'),
          paragraph('X'),
          note('TEXT'),
          paragraph('tail'),
        ]);
      });

      it('preserves note type and ref in a text move from body through a note', () => {
        const editor = createEditor({
          plugins: pastePlugins(tableFirst),
          initialValue: [
            paragraph('body'),
            note('NOTE'),
            paragraph('target'),
            paragraph('tail'),
          ],
        });
        expect(
          editor.api.transfer.move({
            range: {
              anchor: { path: [0, 0], offset: 2 },
              focus: { path: [1, 0, 0], offset: 4 },
            },
            to: { point: { path: [2, 0], offset: 6 } },
          })
        ).toMatchObject({ status: 'moved' });
        expect(
          editor.read.footnote
            .definitions({ ref: '1' })
            .map(([node]) => [node.type, node.ref, NodeApi.string(node)])
        ).toEqual([['footnoteDefinition', '1', 'NOTE']]);
      });

      it('moves words from a note into body text and within the same note', () => {
        for (const sameNote of [false, true]) {
          const editor = createEditor({
            plugins: pastePlugins(tableFirst),
            initialValue: [paragraph('body'), note('definition')],
          });
          const target = sameNote
            ? { path: [1, 0, 0], offset: 10 }
            : { path: [0, 0], offset: 2 };
          expect(
            editor.api.transfer.move({
              range: {
                anchor: { path: [1, 0, 0], offset: 1 },
                focus: { path: [1, 0, 0], offset: 5 },
              },
              to: { point: target },
            }).status
          ).toBe('moved');
          expect(editor.read.children()).toEqual(
            sameNote
              ? [paragraph('body'), note('ditionefin')]
              : [paragraph('boefindy'), note('dition')]
          );
        }
      });

      it('leaves saved nested notes in place through edits and history', () => {
        const editor = createEditor({
          plugins: [...pastePlugins(tableFirst), BaseBlockquotePlugin],
          initialValue: [quote([note('abcd')]), paragraph('tail')],
          selection: SelectionApi.text(range([0, 0, 0, 0], 2)),
        });
        const before = editor.read.value();
        expect(editor.read.footnote.definitions({ ref: '1' })[0]?.[1]).toEqual([
          0, 0,
        ]);
        editor.update.text.insert('X');
        editor.update.break.insert();
        editor.update.text.delete({ reverse: true, unit: 'character' });
        expect(editor.read.footnote.definitions({ ref: '1' })[0]?.[1]).toEqual([
          0, 0,
        ]);
        editor.api.history.undo();
        editor.api.history.redo();
        expect(editor.read.footnote.definitions({ ref: '1' })[0]?.[1]).toEqual([
          0, 0,
        ]);
        while (editor.read.history().undos.length) editor.api.history.undo();
        expect(editor.read.value()).toEqual(before);
      });

      it('cuts and pastes a whole document ending in a note without a trailing plugin', () => {
        const reference = {
          type: 'footnoteReference',
          ref: '1',
          children: [{ text: '' }],
        };
        const editor = createEditor({
          plugins: pastePlugins(tableFirst),
          initialValue: [
            {
              type: 'paragraph',
              children: [{ text: 'body' }, reference, { text: '' }],
            },
            note('NOTE'),
          ],
        });
        const before = editor.read.value();
        editor.update.selection.set({
          anchor: { path: [0, 0], offset: 0 },
          focus: { path: [1, 0, 0], offset: 4 },
        });
        const slice = editor.read.slice.export();
        expect(slice.openEnd).toBe(0);
        editor.update.fragment.delete();
        expect(editor.update.slice.replace(slice)).toBe(true);
        expect(editor.read.value()).toEqual(before);
      });

      it('sends a cell paste to a Yjs peer as ordinary operations', () => {
        const sourceDoc = new Y.Doc();
        const source = createEditor({
          plugins: [
            ElementIdPlugin,
            ...pastePlugins(tableFirst),
            YjsPlugin.create({
              doc: sourceDoc,
              initialReady: true,
              seed: true,
            }),
          ],
          initialValue: [table([cell([paragraph('ab')])]), paragraph('tail')],
          selection: SelectionApi.text(range([0, 0, 0, 0, 0], 1)),
        });
        const peerDoc = new Y.Doc();
        Y.applyUpdate(peerDoc, Y.encodeStateAsUpdate(sourceDoc));
        const peer = createEditor({
          plugins: [
            ElementIdPlugin,
            ...pastePlugins(tableFirst),
            YjsPlugin.create({ doc: peerDoc, initialReady: true }),
          ],
        });
        let updates = 0;
        sourceDoc.on('update', (update) => {
          updates += 1;
          Y.applyUpdate(peerDoc, update);
        });
        expect(
          source.update.fragment.replace([paragraph('X'), note('NOTE')])
        ).toBe(true);
        expect(updates).toBe(1);
        expect(peer.read.value()).toEqual(source.read.value());
        expect(peer.read.footnote.definitions({ ref: '1' })[0]?.[1]).toEqual([
          2,
        ]);
        sourceDoc.destroy();
        peerDoc.destroy();
      });
    });
  }
});

describe('footnote copy edges', () => {
  const paragraph = (text: string) => ({
    type: 'paragraph',
    children: [{ text }],
  });
  const definition = {
    type: 'footnoteDefinition',
    ref: '1',
    children: [paragraph('definition')],
  };

  it('exports words inside a note without its definition', () => {
    const editor = createEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin],
      initialValue: [definition],
    });
    expect(
      editor.read.slice.export({
        at: {
          anchor: { path: [0, 0, 0], offset: 1 },
          focus: { path: [0, 0, 0], offset: 5 },
        },
      })
    ).toEqual(
      ContentSlice.fromJSON({
        content: [paragraph('efin')],
        openStart: 1,
        openEnd: 1,
      })
    );
  });

  it('closes a whole note at the end of a body selection', () => {
    const editor = createEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin],
      initialValue: [paragraph('body'), definition],
    });
    expect(
      editor.read.slice.export({
        at: {
          anchor: { path: [0, 0], offset: 2 },
          focus: { path: [1, 0, 0], offset: 10 },
        },
      })
    ).toEqual(
      ContentSlice.fromJSON({
        content: [paragraph('dy'), definition],
        openStart: 1,
        openEnd: 0,
      })
    );
  });
});

describe('BaseFootnotePlugins', () => {
  it.each([
    ['1', '1'],
    ['a b', 'a%20b'],
    ['#x', '%23x'],
    ['1-2', '1-2'],
    ['1:2', '1%3A2'],
    ['ü', '%C3%BC'],
  ])('gives ref %j distinct fragment ids', (ref, encoded) => {
    const editor = createEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin],
      initialValue: [
        {
          type: 'paragraph',
          children: [
            { text: '' },
            { type: 'footnoteReference', ref, children: [{ text: '' }] },
            { text: '' },
          ],
        },
        {
          type: 'footnoteDefinition',
          ref,
          children: [{ type: 'paragraph', children: [{ text: 'note' }] }],
        },
      ],
    });
    expect([
      editor.read.footnote.anchor({ path: [0, 1] }),
      editor.read.footnote.anchor({ path: [1] }),
    ]).toEqual([
      { id: `fnref-${encoded}`, target: `fn-${encoded}` },
      { id: `fn-${encoded}`, target: `fnref-${encoded}` },
    ]);
  });

  it('keeps lone surrogates distinct from replacement characters in one document', () => {
    const editor = createEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin],
      initialValue: ['\uD800', '\uD801', '�'].map((ref) => ({
        type: 'footnoteDefinition',
        ref,
        children: [{ type: 'paragraph', children: [{ text: 'note' }] }],
      })),
    });
    expect(
      [0, 1, 2].map(
        (index) => editor.read.footnote.anchor({ path: [index] })?.id
      )
    ).toEqual(['fn-%ED%A0%80', 'fn-%ED%A0%81', 'fn-%EF%BF%BD']);
  });

  it('anchors repeated citations, duplicate notes and unresolved pairs by path', () => {
    const reference = {
      type: 'footnoteReference',
      ref: '1',
      children: [{ text: '' }],
    };
    const definition = {
      type: 'footnoteDefinition',
      ref: '1',
      children: [{ type: 'paragraph', children: [{ text: 'note' }] }],
    };
    const editor = createEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin],
      initialValue: [
        {
          type: 'paragraph',
          children: [
            { text: '' },
            reference,
            { text: '' },
            structuredClone(reference),
            { text: '' },
            structuredClone(reference),
            { text: '' },
            { ...structuredClone(reference), ref: 'missing' },
            { text: '' },
          ],
        },
        definition,
        structuredClone(definition),
        { ...structuredClone(definition), ref: 'uncited' },
      ],
    });
    expect(
      [[0, 1], [0, 3], [0, 5], [1], [2], [3], [0, 7], [0, 0], [99]].map(
        (path) => editor.read.footnote.anchor({ path })
      )
    ).toEqual([
      { id: 'fnref-1', target: 'fn-1' },
      { id: 'fnref-1:2', target: 'fn-1' },
      { id: 'fnref-1:3', target: 'fn-1' },
      { id: 'fn-1', target: 'fnref-1' },
      { id: 'fn-1:2' },
      { id: 'fn-uncited', target: 'fnref-uncited' },
      { id: 'fnref-missing', target: 'fn-missing' },
      undefined,
      undefined,
    ]);
  });

  it('keeps an index for each type pair over the same document children', () => {
    const citation = mergePlugins(BaseFootnotePlugin, {
      schema: {
        element: { ...BaseFootnotePlugin.schema.element, type: 'citation' },
      },
    });
    const otherCitation = definePlugin('otherCitation', {
      schema: {
        element: { ...BaseFootnotePlugin.schema.element, type: 'citation' },
      },
    });
    const originalCitation = definePlugin('originalCitation', {
      schema: { element: BaseFootnotePlugin.schema.element },
    });
    const editor = createEditor({
      plugins: [
        BaseFootnotePlugin,
        BaseFootnoteDefinitionPlugin,
        otherCitation,
      ],
    });
    const other = createEditor({
      plugins: [citation, BaseFootnoteDefinitionPlugin, originalCitation],
    });
    const children = [
      {
        type: 'paragraph',
        children: [
          { text: '' },
          { type: 'footnoteReference', ref: '1', children: [{ text: '' }] },
          { text: '' },
          { type: 'citation', ref: '2', children: [{ text: '' }] },
          { text: '' },
        ],
      },
    ];
    const first = getStaticDocumentView(editor, { children }).plugin(
      BaseFootnotePlugin
    ).read;
    const second = getStaticDocumentView(other, { children }).plugin(
      citation
    ).read;
    expect([
      first.anchor({ path: [0, 1] }),
      second.anchor({ path: [0, 3] }),
      first.anchor({ path: [0, 3] }),
      second.anchor({ path: [0, 1] }),
    ]).toEqual([
      { id: 'fnref-1', target: 'fn-1' },
      { id: 'fnref-2', target: 'fn-2' },
      undefined,
      undefined,
    ]);
  });

  it('appends and numbers a definition in the caret root', () => {
    const NoteHolder = definePlugin('footnoteNote', {
      schema: {
        element: {
          contentRoots: {
            body: {
              content: schema.content.types(
                ['paragraph', 'footnoteDefinition'],
                { default: { type: 'paragraph' }, min: 1 }
              ),
              ownership: 'exclusive',
            },
          },
          void: 'block',
        },
      },
    });
    const editor = createEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin, NoteHolder],
      initialValue: {
        children: [
          {
            type: 'footnoteDefinition',
            ref: '1',
            children: [
              { type: 'paragraph', children: [{ text: 'Main note' }] },
            ],
          },
          {
            type: 'footnoteNote',
            childRoots: { body: 'note' },
            children: [{ text: '' }],
          },
        ],
        roots: {
          note: ['A', 'B', 'C', 'D'].map((text) => ({
            type: 'paragraph',
            children: [{ text }],
          })),
        },
      },
    });
    const main = editor.read.children();
    editor.update.selection.set({ path: [0, 0], offset: 1, root: 'note' });

    editor.plugin(BaseFootnotePlugin).update.insert();

    const note = createEditorView(editor, { root: 'note' });
    expect({
      main: editor.read.children(),
      definition: note
        .plugin(BaseFootnotePlugin)
        .read.definition({ ref: '1' })?.[1],
    }).toEqual({ main, definition: [4] });
    expect(
      note.plugin(BaseFootnotePlugin).update.selectDefinition({ ref: '1' })
    ).toMatchObject({
      targetPath: [4],
      point: { path: [4, 0, 0], root: 'note' },
    });
  });

  it('requires non-empty refs on references and definitions', () => {
    const editor = createEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin],
    });

    expect(() =>
      editor.read.schema.assertFragment([
        { children: [{ text: '' }], ref: ' ', type: 'footnoteReference' },
      ])
    ).toThrow(/ref.*validation/i);
    expect(() =>
      editor.read.schema.assertDocument({
        children: [
          {
            children: [{ children: [{ text: '' }], type: 'paragraph' }],
            ref: '',
            type: 'footnoteDefinition',
          },
        ],
      })
    ).toThrow(/ref.*validation/i);
  });

  it('configures footnote reference as an inline void element', () => {
    const editor = createEditor({
      plugins: [BaseFootnotePlugin],
    });
    expect(
      editor.read.schema.element(BaseFootnotePlugin)?.behavior.inline
    ).toBe(true);
    expect(editor.read.schema.element(BaseFootnotePlugin)?.behavior.void).toBe(
      true
    );
    expect(
      editor.read.schema.element(BaseFootnotePlugin)?.behavior.voidKind
    ).toBe('inline');
    expect(
      editor.read.schema.getElementBehavior({
        children: [{ text: '' }],
        ref: '1',
        type: 'footnoteReference',
      })
    ).toMatchObject({ atom: true, inline: true, void: true });
    expect(() =>
      editor.read.schema.assertDocument({
        children: [
          {
            children: [{ text: '' }],
            ref: '1',
            type: 'footnoteReference',
          },
        ],
      })
    ).toThrow(/root.*cannot contain|cannot contain.*root/i);
  });

  it('configures footnote definition as a block element', () => {
    const editor = createEditor({
      plugins: [BaseFootnoteDefinitionPlugin],
    });
    expect(
      editor.read.schema.element(BaseFootnoteDefinitionPlugin)?.content
        ?.allowsText
    ).toBe(false);
    expect(
      editor.read.schema.element(BaseFootnoteDefinitionPlugin)?.content?.min
    ).toBe(1);
    expect(
      editor.read.schema.element(BaseFootnoteDefinitionPlugin)?.behavior.inline
    ).toBe(false);
    expect(
      editor.read.schema.create(BaseFootnoteDefinitionPlugin, { ref: '1' })
    ).toEqual({
      children: [{ children: [{ text: '' }], type: 'paragraph' }],
      ref: '1',
      type: 'footnoteDefinition',
    });
    expect(
      editor.read.schema.element(BaseFootnoteDefinitionPlugin)?.groups
    ).toContain('block');
    expect(() =>
      editor.read.schema.assertDocument({
        children: [
          {
            children: [{ children: [{ text: '' }], type: 'paragraph' }],
            ref: '1',
            type: 'footnoteDefinition',
          },
        ],
      })
    ).not.toThrow();
  });

  it('provides footnote api and insert / navigation transforms on the editor', () => {
    const editor = createEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
    });
    const api = editor.read.footnote;
    const { footnote } = editor.update;

    expect(api).toBeDefined();
    expect(typeof api.nextRef).toBe('function');
    expect(typeof api.definition).toBe('function');
    expect(typeof api.definitions).toBe('function');
    expect(typeof api.references).toBe('function');
    expect(typeof api.refs).toBe('function');
    expect(typeof api.isDuplicateDefinition).toBe('function');
    expect(typeof api.isResolved).toBe('function');

    expect(typeof editor.update.footnote.insert).toBe('function');
    expect(typeof footnote.createDefinition).toBe('function');
    expect(typeof footnote.selectDefinition).toBe('function');
    expect(typeof footnote.selectReference).toBe('function');
    expect(typeof footnote.normalizeDuplicateDefinition).toBe('function');
  });

  it('deleteBackward removes the adjacent footnote atom', () => {
    const editor = createEditor({
      plugins: [BaseFootnotePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 0, path: [0, 2] },
      },
      initialValue: [
        {
          children: [
            { text: 'hi ' },
            {
              children: [{ text: '' }],
              ref: '1',
              type: 'footnoteReference',
            },
            { text: ' after' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update.text.deleteBackward({ unit: 'character' });

    expect(editor.read.value().children).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: 'paragraph',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('deleteForward removes the next footnote atom', () => {
    const editor = createEditor({
      plugins: [BaseFootnotePlugin],
      selection: {
        kind: 'text',
        anchor: { offset: 3, path: [0, 0] },
        focus: { offset: 3, path: [0, 0] },
      },
      initialValue: [
        {
          children: [
            { text: 'hi ' },
            {
              children: [{ text: '' }],
              ref: '1',
              type: 'footnoteReference',
            },
            { text: ' after' },
          ],
          type: 'paragraph',
        },
      ],
    });

    editor.update.text.deleteForward({ unit: 'character' });

    expect(editor.read.value().children).toMatchObject([
      {
        children: [{ text: 'hi  after' }],
        type: 'paragraph',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 3, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    });
  });

  it('stays current across text edits and footnote insertion', () => {
    const editor = createEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      selection: {
        kind: 'text',
        anchor: { offset: 4, path: [1, 0, 0] },
        focus: { offset: 4, path: [1, 0, 0] },
      },
      initialValue: [
        {
          children: [
            { text: '' },
            {
              children: [{ text: '1' }],
              ref: '1',
              type: 'footnoteReference',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
        {
          children: [{ children: [{ text: 'body' }], type: 'paragraph' }],
          ref: '1',
          type: 'footnoteDefinition',
        },
      ],
    });
    const { footnote } = editor.read;

    expect(footnote.definition({ ref: '1' })).toBeDefined();
    expect(footnote.definitions({ ref: '1' })).toHaveLength(1);
    expect(footnote.isResolved({ ref: '1' })).toBe(true);
    expect(footnote.references({ ref: '1' })).toHaveLength(1);
    expect(footnote.definitionText({ ref: '1' })).toBe('body');
    expect(footnote.nextRef()).toBe('2');

    editor.update.text.insert('!');

    expect(footnote.definitionText({ ref: '1' })).toBe('body!');

    editor.update.selection.set({
      kind: 'text',
      anchor: { offset: 0, path: [0, 2] },
      focus: { offset: 0, path: [0, 2] },
    });
    editor.update.footnote.insert({
      focusDefinition: false,
      ref: '2',
    });

    expect(footnote.nextRef()).toBe('3');
  });

  it('detects duplicate definitions without scanning on every lookup', () => {
    const editor = createEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      initialValue: [
        {
          children: [{ children: [{ text: 'one' }], type: 'paragraph' }],
          ref: '1',
          type: 'footnoteDefinition',
        },
        {
          children: [{ children: [{ text: 'duplicate' }], type: 'paragraph' }],
          ref: '1',
          type: 'footnoteDefinition',
        },
      ],
    });
    const { footnote } = editor.read;

    expect(footnote.isResolved({ ref: '1' })).toBe(true);
    expect(footnote.definitions({ ref: '1' })).toHaveLength(2);
    expect(footnote.isDuplicateDefinition({ path: [0] })).toBe(false);
    expect(footnote.isDuplicateDefinition({ path: [1] })).toBe(true);
  });

  it('invalidates for footnotes nested in inserted and removed blocks', () => {
    const editor = createEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      initialValue: [{ children: [{ text: '' }], type: 'paragraph' }],
    });

    expect(editor.read.footnote.nextRef()).toBe('1');

    editor.update.nodes.insert(
      {
        children: [
          {
            children: [{ text: '' }],
            ref: '1',
            type: 'footnoteReference',
          },
        ],
        type: 'paragraph',
      },
      { at: [1] }
    );

    expect(editor.read.footnote.nextRef()).toBe('2');

    editor.update.nodes.remove({ at: [1] });

    expect(editor.read.footnote.nextRef()).toBe('1');
  });

  it('can renumber a later duplicate definition without touching the canonical first definition', () => {
    const editor = createEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      initialValue: [
        {
          children: [{ children: [{ text: 'one' }], type: 'paragraph' }],
          ref: '1',
          type: 'footnoteDefinition',
        },
        {
          children: [{ children: [{ text: 'duplicate' }], type: 'paragraph' }],
          ref: '1',
          type: 'footnoteDefinition',
        },
      ],
    });
    const { footnote } = editor.read;

    expect(
      editor.update.footnote.normalizeDuplicateDefinition({ path: [1] })
    ).toBe('2');
    expect(footnote.definitions({ ref: '1' })).toHaveLength(1);
    expect(footnote.definition({ ref: '1' })).toMatchObject([
      { ref: '1', type: 'footnoteDefinition' },
      [0],
    ]);
    expect(footnote.definition({ ref: '2' })).toMatchObject([
      { ref: '2', type: 'footnoteDefinition' },
      [1],
    ]);
    expect(footnote.isDuplicateDefinition({ path: [1] })).toBe(false);
  });

  it('invalidates for a classification-free ref change', () => {
    const value = [
      {
        children: [{ children: [{ text: 'one' }], type: 'paragraph' }],
        ref: '1',
        type: 'footnoteDefinition',
      },
    ] as const;
    const plugins = [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const;
    const source = createEditor({
      plugins,
      initialValue: value,
    });

    source.update.nodes.set({ ref: '2' }, { at: [0] });

    const change = DocumentChange.fromJSON(
      source.read.lastCommit()!.changes.toJSON()
    );
    const replay = createEditor({
      plugins,
      initialValue: value,
    });

    expect(replay.read.footnote.definition({ ref: '1' })).toBeDefined();
    expect(change.primaryClassification).toBeNull();
    replay.update((tx) => tx.changes.apply(change));

    expect(replay.read.footnote.definition({ ref: '1' })).toBeUndefined();
    expect(replay.read.footnote.definition({ ref: '2' })).toBeDefined();
  });
});

describe('BaseFootnotePlugin updates', () => {
  it('creates one definition and reuses it on later requests', () => {
    const editor = createEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      selection: {
        kind: 'text',
        anchor: { offset: 5, path: [0, 0] },
        focus: { offset: 5, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
    });

    expect(
      editor.update.footnote.createDefinition({
        focus: false,
        ref: '1',
      })
    ).toEqual([1]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
    });
    expect(editor.update.footnote.createDefinition({ ref: '1' })).toEqual([1]);
    expect(editor.read.value().children).toHaveLength(2);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [1, 0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });
  });

  it('preserves block fragments as definition children', () => {
    const TestFootnoteBlockPlugin = definePlugin('testFootnoteBlock', {
      schema: {
        element: {
          content: schema.content.text({ default: 'text', min: 1 }),
        },
      },
    });
    const editor = createEditor({
      plugins: [
        BaseFootnotePlugin,
        BaseFootnoteDefinitionPlugin,
        TestFootnoteBlockPlugin,
      ] as const,
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
    });

    editor.update.footnote.createDefinition({
      focus: false,
      fragment: [
        {
          children: [{ text: 'selected block' }],
          type: 'testFootnoteBlock',
        },
      ],
      ref: '3',
    });

    expect(editor.read.nodes.get([1])?.[0]).toMatchObject({
      children: [
        {
          children: [{ text: 'selected block' }],
          type: 'testFootnoteBlock',
        },
      ],
      ref: '3',
      type: 'footnoteDefinition',
    });
    expect(() =>
      editor.read.schema.assertDocument(editor.read.value())
    ).not.toThrow();
  });

  it('uses selected content as the initial definition body [EDIT-FOOTNOTE-INSERT-001]', () => {
    const editor = createEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      selection: {
        kind: 'text',
        anchor: { offset: 6, path: [0, 0] },
        focus: { offset: 11, path: [0, 0] },
      },
      initialValue: [
        {
          children: [{ text: 'hello world' }],
          type: 'paragraph',
        },
      ],
    });

    editor.update.footnote.insert();

    expect(editor.read.value().children).toMatchObject([
      {
        children: [
          { text: 'hello ' },
          {
            children: [{ text: '' }],
            ref: '1',
            type: 'footnoteReference',
          },
          { text: '' },
        ],
        type: 'paragraph',
      },
      {
        children: [{ children: [{ text: 'world' }], type: 'paragraph' }],
        ref: '1',
        type: 'footnoteDefinition',
      },
    ]);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [1, 0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });
  });

  it('inserts at an explicit target without an active selection', () => {
    const editor = createEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      initialValue: [{ children: [{ text: 'hello' }], type: 'paragraph' }],
    });

    editor.update.footnote.insert({ focusDefinition: false }, { at: [0, 0] });

    expect(editor.read.value().children).toMatchObject([
      {
        children: [
          { text: '' },
          {
            children: [{ text: '' }],
            ref: '1',
            type: 'footnoteReference',
          },
          { text: 'hello' },
        ],
        type: 'paragraph',
      },
      {
        children: [{ children: [{ text: '' }], type: 'paragraph' }],
        ref: '1',
        type: 'footnoteDefinition',
      },
    ]);
  });

  it('keeps the caret after a reference inserted at the start of text', () => {
    const editor = createEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      selection: {
        kind: 'text',
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 0, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: ' and more' }], type: 'paragraph' }],
    });

    editor.update.footnote.insert({ focusDefinition: false });

    expect(editor.read.nodes.get([0, 1])?.[0]).toMatchObject({
      type: 'footnoteReference',
    });
    expect(editor.read.selection()?.anchor).toEqual({
      offset: 0,
      path: [0, 2],
    });
  });

  it('skips used numeric refs when inserting', () => {
    const editor = createEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      initialValue: [
        { children: [{ text: 'x' }], type: 'paragraph' },
        {
          children: [{ children: [{ text: 'one' }], type: 'paragraph' }],
          ref: '1',
          type: 'footnoteDefinition',
        },
        {
          children: [{ children: [{ text: 'three' }], type: 'paragraph' }],
          ref: '3',
          type: 'footnoteDefinition',
        },
      ],
    });

    editor.update.footnote.insert({ focusDefinition: false });

    expect(editor.read.nodes.get([0, 1])?.[0]).toMatchObject({
      ref: '2',
      type: 'footnoteReference',
    });
    expect(editor.read.nodes.get([3])?.[0]).toMatchObject({
      ref: '2',
      type: 'footnoteDefinition',
    });
  });

  it('reuses an existing definition for an explicit ref', () => {
    const editor = createEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      initialValue: [
        { children: [{ text: 'x' }], type: 'paragraph' },
        {
          children: [{ children: [{ text: 'existing' }], type: 'paragraph' }],
          ref: '7',
          type: 'footnoteDefinition',
        },
      ],
    });

    editor.update.footnote.insert({ ref: '7' });

    expect(editor.read.value().children).toHaveLength(2);
    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [1, 0, 0] },
      focus: { offset: 0, path: [1, 0, 0] },
    });
  });

  it('rejects blank explicit refs before inserting footnote nodes', () => {
    const editor = createEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      selection: {
        kind: 'text',
        anchor: { offset: 1, path: [0, 0] },
        focus: { offset: 1, path: [0, 0] },
      },
      initialValue: [{ children: [{ text: 'x' }], type: 'paragraph' }],
    });

    expect(() => editor.update.footnote.insert({ ref: '   ' })).toThrow(
      /footnote ref must be a non-empty string/i
    );
    expect(() =>
      editor.update.footnote.createDefinition({ ref: '   ' })
    ).toThrow(/footnote ref must be a non-empty string/i);
    expect(editor.read.footnote.definition({ ref: '' })).toBeUndefined();
    expect(editor.read.footnote.isResolved({ ref: '' })).toBe(false);
    expect(editor.read.value().children).toEqual([
      { children: [{ text: 'x' }], type: 'paragraph' },
    ]);
  });
});

{
  const createFootnoteRuntimeEditor = ({
    selection,
    value,
  }: {
    selection?: Selection;
    value: Value;
  }) =>
    createEditor({
      plugins: [BaseFootnotePlugin, BaseFootnoteDefinitionPlugin] as const,
      selection,
      initialValue: value,
    });

  describe('BaseFootnotePlugin runtime', () => {
    it('exposes footnote registry api from the runtime document', () => {
      const editor = createFootnoteRuntimeEditor({
        value: [
          {
            children: [
              {
                children: [{ text: '' }],
                ref: '1',
                type: 'footnoteReference',
              },
            ],
            type: 'paragraph',
          },
          {
            children: [{ children: [{ text: 'body' }], type: 'paragraph' }],
            ref: '1',
            type: 'footnoteDefinition',
          },
          {
            children: [
              { children: [{ text: 'duplicate' }], type: 'paragraph' },
            ],
            ref: '1',
            type: 'footnoteDefinition',
          },
        ],
      });
      const { footnote } = editor.read;

      expect(footnote.definition({ ref: '1' })?.[1]).toEqual([1]);
      expect(footnote.definitions({ ref: '1' })).toHaveLength(2);
      expect(footnote.references({ ref: '1' })).toHaveLength(1);
      expect(footnote.definitionText({ ref: '1' })).toBe('body');
      expect(footnote.isResolved({ ref: '1' })).toBe(true);
      expect(footnote.refs()).toEqual(['1']);
      expect(footnote.nextRef()).toBe('2');
    });

    it('renumbers duplicate definitions through the runtime transaction group', () => {
      const editor = createFootnoteRuntimeEditor({
        value: [
          {
            children: [{ children: [{ text: 'one' }], type: 'paragraph' }],
            ref: '1',
            type: 'footnoteDefinition',
          },
          {
            children: [
              { children: [{ text: 'duplicate' }], type: 'paragraph' },
            ],
            ref: '1',
            type: 'footnoteDefinition',
          },
        ],
      });
      const normalizedRef = editor.update.footnote.normalizeDuplicateDefinition(
        { path: [1] }
      );

      expect(String(normalizedRef)).toBe('2');

      const { footnote } = editor.read;

      expect(footnote.definitions({ ref: '1' })).toHaveLength(1);
      expect(footnote.definition({ ref: '2' })?.[1]).toEqual([1]);
    });

    it('rejects the duplicate definition current ref as a target', () => {
      const editor = createFootnoteRuntimeEditor({
        value: [
          {
            children: [{ children: [{ text: 'one' }], type: 'paragraph' }],
            ref: '1',
            type: 'footnoteDefinition',
          },
          {
            children: [
              { children: [{ text: 'duplicate' }], type: 'paragraph' },
            ],
            ref: '1',
            type: 'footnoteDefinition',
          },
        ],
      });

      expect(
        editor.update.footnote.normalizeDuplicateDefinition({
          path: [1],
          ref: '1',
        })
      ).toBe(false);
      expect(editor.read.footnote.definitions({ ref: '1' })).toHaveLength(2);
    });

    it('rejects refs already occupied by unresolved references', () => {
      const editor = createFootnoteRuntimeEditor({
        value: [
          {
            children: [{ children: [{ text: 'one' }], type: 'paragraph' }],
            ref: '1',
            type: 'footnoteDefinition',
          },
          {
            children: [
              { children: [{ text: 'duplicate' }], type: 'paragraph' },
            ],
            ref: '1',
            type: 'footnoteDefinition',
          },
          {
            children: [{ text: '' }],
            ref: '2',
            type: 'footnoteReference',
          },
        ],
      });

      expect(
        editor.update.footnote.normalizeDuplicateDefinition({
          path: [1],
          ref: '2',
        })
      ).toBe(false);
      expect(editor.read.footnote.definitions({ ref: '1' })).toHaveLength(2);
    });

    it('renumbers a definition inserted earlier in the same transaction', () => {
      const editor = createFootnoteRuntimeEditor({
        value: [
          {
            children: [{ children: [{ text: 'one' }], type: 'paragraph' }],
            ref: '1',
            type: 'footnoteDefinition',
          },
        ],
      });

      editor.update((tx) => {
        tx.nodes.insert(
          {
            children: [
              { children: [{ text: 'duplicate' }], type: 'paragraph' },
            ],
            ref: '1',
            type: 'footnoteDefinition',
          },
          { at: [1] }
        );
        tx.footnote.normalizeDuplicateDefinition({ path: [1] });
      });

      expect(editor.read.nodes.get([1])?.[0]).toMatchObject({
        ref: '2',
      });
    });

    it('inserts a footnote reference and definition through the runtime transaction group', () => {
      const editor = createFootnoteRuntimeEditor({
        selection: {
          kind: 'text',
          anchor: { offset: 2, path: [0, 0] },
          focus: { offset: 2, path: [0, 0] },
        },
        value: [{ children: [{ text: 'hi' }], type: 'paragraph' }],
      });

      editor.update.footnote.insert({ focusDefinition: false });

      expect(editor.read.value().children).toEqual([
        {
          children: [
            { text: 'hi' },
            {
              children: [{ text: '' }],
              ref: '1',
              type: 'footnoteReference',
            },
            { text: '' },
          ],
          type: 'paragraph',
        },
        {
          children: [{ children: [{ text: '' }], type: 'paragraph' }],
          ref: '1',
          type: 'footnoteDefinition',
        },
      ]);
      expect(editor.read.selection()).toEqual({
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 0, path: [0, 2] },
      });
    });

    it('navigates between definitions and references through runtime transaction groups', () => {
      const editor = createFootnoteRuntimeEditor({
        value: [
          {
            children: [
              { text: 'a' },
              {
                children: [{ text: '' }],
                ref: '1',
                type: 'footnoteReference',
              },
              { text: 'b' },
            ],
            type: 'paragraph',
          },
          {
            children: [{ children: [{ text: 'body' }], type: 'paragraph' }],
            ref: '1',
            type: 'footnoteDefinition',
          },
        ],
      });
      const definition = editor.update.footnote.selectDefinition({
        ref: '1',
      });

      expect(definition).toEqual({
        point: { offset: 0, path: [1, 0, 0] },
        targetPath: [1],
      });
      expect(editor.read.selection()).toEqual({
        anchor: { offset: 0, path: [1, 0, 0] },
        focus: { offset: 0, path: [1, 0, 0] },
      });

      const reference = editor.update.footnote.selectReference({
        ref: '1',
      });

      expect(reference).toEqual({
        point: { offset: 0, path: [0, 2] },
        targetPath: [0, 1],
      });
      expect(editor.read.selection()).toEqual({
        anchor: { offset: 0, path: [0, 2] },
        focus: { offset: 0, path: [0, 2] },
      });
    });
  });
}

describe('footnote definition transfer landing', () => {
  const createWithTable = () =>
    createEditor({
      plugins: [
        BaseFootnotePlugin,
        BaseFootnoteDefinitionPlugin,
        BaseTablePlugin,
      ],
      initialValue: [
        {
          children: [
            {
              children: [
                {
                  children: [
                    { children: [{ text: 'cell' }], type: 'paragraph' },
                  ],
                  type: 'tableCell',
                },
              ],
              type: 'tableRow',
            },
          ],
          type: 'table',
        },
        {
          children: [{ children: [{ text: 'note' }], type: 'paragraph' }],
          ref: '1',
          type: 'footnoteDefinition',
        },
      ] as Value,
    });

  it('refuses a definition inside a table cell', () => {
    const editor = createWithTable();

    expect(
      editor.api.transfer.move({
        nodes: [editor.key([1])!],
        to: { edge: 'after', key: editor.key([0, 0, 0, 0])! },
      }).status
    ).toBe('refused');
  });

  const createWithColumns = () =>
    createEditor({
      plugins: [
        BaseFootnotePlugin,
        BaseFootnoteDefinitionPlugin,
        BaseColumnPlugin,
      ],
      initialValue: [
        { children: [{ text: 'text' }], type: 'paragraph' },
        {
          children: [{ children: [{ text: 'note' }], type: 'paragraph' }],
          ref: '1',
          type: 'footnoteDefinition',
        },
      ] as Value,
    });

  it('refuses a definition dropped beside a block, which would put it in a column', () => {
    const editor = createWithColumns();

    expect(
      editor.api.transfer.move({
        nodes: [editor.key([1])!],
        to: { key: editor.key([0])!, side: 'end' },
      })
    ).toEqual({ reason: 'policy', status: 'refused' });
  });

  it('refuses a block dropped beside a definition, which would move it into a column', () => {
    const editor = createWithColumns();

    expect(
      editor.api.transfer.move({
        nodes: [editor.key([0])!],
        to: { key: editor.key([1])!, side: 'start' },
      })
    ).toEqual({ reason: 'policy', status: 'refused' });
  });

  it('moves a definition among root blocks', () => {
    const editor = createWithTable();

    expect(
      editor.api.transfer.move({
        nodes: [editor.key([1])!],
        to: { edge: 'before', key: editor.key([0])! },
      }).status
    ).toBe('moved');
  });
});
