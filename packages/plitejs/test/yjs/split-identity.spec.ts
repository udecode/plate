import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { history } from '../../src/history';
import {
  createEditor,
  defineEditorSchema,
  type Descendant,
  NodeApi,
  type Point,
  property,
  schema,
  target,
} from '../../src/index';
import { getDefined } from '../../src/internal/get-defined';
import {
  assignFreshYjsNodeId,
  createYjsNode,
  removeYjsChild,
  withYjsWrite,
} from '../../src/yjs/core/document';
import {
  DEFAULT_YJS_ROOT_NAME,
  YJS_CUT_SOURCE_KEY,
  YJS_ELEMENT_NODE_NAME,
  YJS_HIDDEN_KEY,
  YJS_VIRTUAL_CHILD_ID_KEY,
  YJS_VIRTUAL_PLACEHOLDER_KEY,
} from '../../src/yjs/core/keys';
import {
  cutTextAt,
  hasYjsCut,
  yjsTextContent,
} from '../../src/yjs/core/text-runs';
import {
  connectYjsPeer,
  createSeededYjsHistoryPeers,
  createYjsPeerWithEditor,
  createYjsTestEditor,
  disconnectYjsPeer,
  FakeAwareness,
  getVisibleYjsNodeAt,
  getYjsRemoteCursors,
  getYjsRoot,
  getYjsTrace,
  type Peer,
  paragraph,
  readPeerChildren,
  readPeerSelection,
  runEditorYjsUpdate,
  syncConnectedPeers,
} from './support/collaboration';

const Schema = defineEditorSchema('schema:yjs-split-identity', {
  elements: {
    link: { content: schema.content.text(), inline: true },
    paragraph: { content: schema.content.open() },
    quote: { content: schema.content.types(['paragraph']) },
    span: {
      content: schema.content.any([
        schema.content.text(),
        schema.content.type('link'),
      ]),
      inline: true,
    },
  },
  properties: [
    schema.elementProperty('align', property.string(), {
      target: target.type('paragraph'),
    }),
    schema.textProperty('bold', property.boolean()),
    schema.textProperty('color', property.string()),
  ],
  root: schema.content.not(schema.content.text()),
  unknown: 'reject',
});

type Edit = (peer: Peer) => void;

const orders = ['writer-first', 'peer-first'] as const;

const watchImportDeletes = (doc: Y.Doc, errors: unknown[]) => {
  let importing = false;

  doc.on('afterTransaction', (transaction: Y.Transaction) => {
    if (!transaction.local) {
      importing = true;
      return;
    }
    if (!importing) return;
    Y.iterateDeletedStructs(transaction, transaction.deleteSet, (struct) => {
      if (
        struct instanceof Y.Item &&
        struct.content instanceof Y.ContentString
      ) {
        errors.push(`an import deleted ${struct.content.str}`);
      }
    });
  });
  doc.on('afterAllTransactions', () => {
    importing = false;
  });
};

/**
 * A writer and a peer joined from its Y.Doc. The writer's client id is the
 * lower one unless `writerId` says otherwise.
 */
const createPeers = (
  children: readonly Descendant[],
  { awareness = false, writerId = 1 } = {}
) => {
  const errors: unknown[] = [];
  const peerId = writerId === 1 ? 2 : 1;
  const awarenesses = new Map<number, FakeAwareness>();
  const create = (
    numericClientId: number,
    seedUpdate?: Uint8Array,
    initial = children
  ) => {
    if (awareness) {
      awarenesses.set(numericClientId, new FakeAwareness(numericClientId));
    }
    const created = createYjsPeerWithEditor(
      createEditor({
        initialValue: initial,
        lifecycleErrorSink: (error) => errors.push(error.cause),
        plugins: [Schema, history()],
      }),
      {
        awareness: awarenesses.get(numericClientId),
        children: initial,
        clientId: String(numericClientId),
        numericClientId,
        seedUpdate,
      }
    );

    watchImportDeletes(created.doc, errors);

    return created;
  };
  const writer = create(writerId);
  const peer = create(peerId, Y.encodeStateAsUpdate(writer.doc));
  const join = (from = writer) =>
    create(3, Y.encodeStateAsUpdate(from.doc), [paragraph('seed')]);

  return {
    addEditingPeer: (numericClientId: number) =>
      create(numericClientId, Y.encodeStateAsUpdate(writer.doc)),
    awarenessOf: (numericClientId: number) =>
      getDefined(awarenesses.get(numericClientId)),
    join,
    peer,
    peerId,
    peers: [writer, peer],
    /** Each editor's value, and what a peer joining from the writer's Y.Doc shows. */
    read: () => ({
      errors,
      fresh: readPeerChildren(join()),
      peer: readPeerChildren(peer),
      writer: readPeerChildren(writer),
    }),
    writer,
    writerId,
  };
};

const settled = (expected: readonly Descendant[]) => ({
  errors: [],
  fresh: expected,
  peer: expected,
  writer: expected,
});

const race = (
  children: readonly Descendant[],
  write: Edit,
  edit: Edit,
  order: (typeof orders)[number],
  options?: { setup?: Edit | readonly Edit[]; then?: Edit; writerId?: number }
) => {
  const peers = createPeers(children, options);
  for (const step of [options?.setup ?? []].flat()) {
    step(peers.writer);
    syncConnectedPeers(peers.peers);
  }
  write(peers.writer);
  edit(peers.peer);
  syncConnectedPeers(
    order === 'writer-first' ? peers.peers : [peers.peer, peers.writer]
  );
  if (options?.then) {
    options.then(peers.writer);
    syncConnectedPeers(peers.peers);
  }
  return peers.read();
};

/** Send `from`'s Yjs updates to `to` only, as one leg of a sync. */
const deliver = (from: Peer, to: Peer) => {
  Y.applyUpdate(
    to.doc,
    Y.encodeStateAsUpdate(from.doc, Y.encodeStateVector(to.doc)),
    from
  );
};

const caret = (point: Point) => ({
  anchor: point,
  focus: point,
  kind: 'text' as const,
});

const breakAt =
  (path: number[], offset: number): Edit =>
  (peer) => {
    peer.editor.update((tx) => {
      tx.selection.set(caret({ path, offset }));
      tx.break.insert();
    });
  };

const undo: Edit = (peer) => {
  peer.editor.api.history.undo();
};

const joinSecondLine: Edit = (peer) => {
  peer.editor.update.nodes.merge({ at: [1] });
};

const typeAt =
  (path: number[], offset: number, text = 'X'): Edit =>
  (peer) => {
    peer.editor.update.text.insert(text, { at: { path, offset } });
  };

const deleteAt =
  (path: number[], from: number, to: number): Edit =>
  (peer) => {
    peer.editor.update.text.delete({
      at: { anchor: { path, offset: from }, focus: { path, offset: to } },
    });
  };

const text = (value: string, marks: Record<string, unknown> = {}) => ({
  ...marks,
  text: value,
});

const block = (...children: Descendant[]): Descendant => ({
  children,
  type: 'paragraph',
});

const link = (value: string): Descendant => ({
  children: [{ text: value }],
  type: 'link',
});

const span = (...children: Descendant[]): Descendant => ({
  children,
  type: 'span',
});

const marked = (value: string, marks: Record<string, unknown>) =>
  block(text(value, marks));

const letters = (children: readonly Descendant[]) =>
  children.map((node) => NodeApi.string(node)).join('');

const word = () => [paragraph('word')];

const wordLinkTail = () => [block(text('word'), link('LINK'), text('tail'))];

describe('plitejs/yjs split identity', () => {
  for (const order of orders) {
    it(`C1: a letter typed after the cut lands on the second line, ${order}`, () => {
      assert.deepEqual(
        race(word(), breakAt([0, 0], 2), typeAt([0, 0], 3), order),
        settled([paragraph('wo'), paragraph('rXd')])
      );
    });

    it(`C2: deleting the letters after the cut empties the second line, ${order}`, () => {
      assert.deepEqual(
        race(word(), breakAt([0, 0], 2), deleteAt([0, 0], 2, 4), order),
        settled([paragraph('wo'), paragraph('')])
      );
    });

    it(`C3: coloring the letters after the cut colors the second line, ${order}`, () => {
      assert.deepEqual(
        race(
          word(),
          breakAt([0, 0], 2),
          (peer) => {
            peer.editor.update.nodes.set(
              { color: 'red' },
              {
                at: {
                  anchor: { path: [0, 0], offset: 2 },
                  focus: { path: [0, 0], offset: 4 },
                },
                match: (node) => NodeApi.isText(node),
                split: true,
              }
            );
          },
          order
        ),
        settled([paragraph('wo'), marked('rd', { color: 'red' })])
      );
    });

    it(`C4: a letter typed into a line split at its start and recolored keeps the color, ${order}`, () => {
      assert.deepEqual(
        race(
          word(),
          (peer) => {
            peer.editor.update((tx) => {
              tx.selection.set(caret({ path: [0, 0], offset: 0 }));
              tx.break.insert();
              tx.nodes.set({ color: 'green' }, { at: [1, 0] });
            });
          },
          typeAt([0, 0], 1),
          order
        ),
        settled([paragraph(''), marked('wXord', { color: 'green' })])
      );
    });

    it(`C5: a letter typed before an Enter at the end stays on the first line, ${order}`, () => {
      assert.deepEqual(
        race(word(), breakAt([0, 0], 4), typeAt([0, 0], 1), order),
        settled([paragraph('wXord'), paragraph('')])
      );
    });

    it(`C6: an Enter before two links moves both links and the tail once, ${order}`, () => {
      assert.deepEqual(
        race(
          [
            block(
              text('word'),
              link('LINK'),
              text(''),
              link('SECOND'),
              text('tail')
            ),
          ],
          breakAt([0, 0], 4),
          typeAt([0, 0], 1),
          order
        ),
        settled([
          paragraph('wXord'),
          block(text(''), link('LINK'), text(''), link('SECOND'), text('tail')),
        ])
      );
    });

    it(`C7: a letter typed after a link that moved to the next line stays, ${order}`, () => {
      assert.deepEqual(
        race(wordLinkTail(), breakAt([0, 0], 4), typeAt([0, 2], 2), order),
        settled([
          paragraph('word'),
          block(text(''), link('LINK'), text('taXil')),
        ])
      );
    });

    it(`C8: a letter typed in a link that moved to the next line stays, ${order}`, () => {
      assert.deepEqual(
        race(wordLinkTail(), breakAt([0, 0], 4), typeAt([0, 1, 0], 2), order),
        settled([
          paragraph('word'),
          block(text(''), link('LIXNK'), text('tail')),
        ])
      );
    });

    it(`C9: a letter typed in a recolored first line keeps the color, ${order}`, () => {
      assert.deepEqual(
        race(
          word(),
          (peer) => {
            peer.editor.update((tx) => {
              tx.selection.set(caret({ path: [0, 0], offset: 2 }));
              tx.break.insert();
              tx.nodes.set({ color: 'blue' }, { at: [0, 0] });
            });
          },
          typeAt([0, 0], 1),
          order
        ),
        settled([marked('wXo', { color: 'blue' }), paragraph('rd')])
      );
    });

    it(`C15: two Enters at the same point keep each letter once, ${order}`, () => {
      const result = race(
        word(),
        breakAt([0, 0], 2),
        breakAt([0, 0], 2),
        order
      );

      assert.deepEqual(result.errors, []);
      assert.deepEqual(result.peer, result.writer);
      assert.deepEqual(result.fresh, result.writer);
      assert.equal(letters(result.writer), 'word');
      assert.equal(result.writer.length, 3);
    });

    it(`C16: Enters at 2 and 3, the lower client id at 2, give three lines, ${order}`, () => {
      assert.deepEqual(
        race(word(), breakAt([0, 0], 2), breakAt([0, 0], 3), order),
        settled([paragraph('wo'), paragraph('r'), paragraph('d')])
      );
    });

    it(`C16: Enters at 2 and 3, the higher client id at 2, keep each letter once, ${order}`, () => {
      const result = race(
        word(),
        breakAt([0, 0], 2),
        breakAt([0, 0], 3),
        order,
        {
          writerId: 2,
        }
      );

      assert.deepEqual(result.errors, []);
      assert.deepEqual(result.peer, result.writer);
      assert.deepEqual(result.fresh, result.writer);
      assert.equal(result.writer.length, 3);
      assert.deepEqual([...letters(result.writer)].sort(), [...'word'].sort());
    });

    it(`C17: deleting a letter after the cut deletes it on the second line, ${order}`, () => {
      assert.deepEqual(
        race(word(), breakAt([0, 0], 2), deleteAt([0, 0], 3, 4), order),
        settled([paragraph('wo'), paragraph('r')])
      );
    });

    it(`C18: a letter typed after the cut of a split joined back lands once, ${order}`, () => {
      assert.deepEqual(
        race(
          word(),
          (peer) => {
            breakAt([0, 0], 2)(peer);
            joinSecondLine(peer);
          },
          typeAt([0, 0], 3),
          order
        ),
        settled([paragraph('worXd')])
      );
    });

    it(`C18: a split joined back leaves one Yjs text with no cut, ${order}`, () => {
      const peers = createPeers(word());

      breakAt([0, 0], 2)(peers.writer);
      joinSecondLine(peers.writer);
      typeAt([0, 0], 3)(peers.peer);
      syncConnectedPeers(
        order === 'writer-first' ? peers.peers : [peers.peer, peers.writer]
      );
      const shown = getVisibleYjsNodeAt(peers.join(peers.writer), [0, 0]);

      assert.deepEqual(
        shown instanceof Y.XmlText
          ? { cut: hasYjsCut(shown), letters: yjsTextContent(shown) }
          : null,
        { cut: false, letters: 'worXd' }
      );
    });

    it(`undoing a letter typed after the cut of a split a peer joined back removes it, ${order}`, () => {
      const peers = createPeers(word());

      breakAt([0, 0], 2)(peers.writer);
      syncConnectedPeers(peers.peers);
      joinSecondLine(peers.writer);
      typeAt([1, 0], 2)(peers.peer);
      syncConnectedPeers(
        order === 'writer-first' ? peers.peers : [peers.peer, peers.writer]
      );
      undo(peers.peer);
      syncConnectedPeers(peers.peers);

      assert.deepEqual(peers.read(), settled([paragraph('word')]));
    });

    it(`C21: undoing a split after a peer typed past the cut keeps the letter, ${order}`, () => {
      assert.deepEqual(
        race(word(), breakAt([0, 0], 2), typeAt([0, 0], 3), order, {
          then: undo,
        }),
        settled([paragraph('worXd')])
      );
    });

    it(`two peers joining the same synced split give one line, ${order}`, () => {
      assert.deepEqual(
        race(word(), joinSecondLine, joinSecondLine, order, {
          setup: breakAt([0, 0], 2),
        }),
        settled([paragraph('word')])
      );
    });

    it(`C20: removing the first line of a synced split keeps a letter typed in the second, ${order}`, () => {
      assert.deepEqual(
        race(
          word(),
          (peer) => peer.editor.update.nodes.remove({ at: [0] }),
          typeAt([1, 0], 0),
          order,
          { setup: breakAt([0, 0], 2) }
        ),
        settled([paragraph('Xrd')])
      );
    });

    it(`C19: a letter typed in the second line of a synced split goes with that line when it is removed, ${order}`, () => {
      assert.deepEqual(
        race(
          word(),
          (peer) => peer.editor.update.nodes.remove({ at: [1] }),
          typeAt([1, 0], 1),
          order,
          { setup: breakAt([0, 0], 2) }
        ),
        settled([paragraph('wo')])
      );
    });

    it(`C22: joining the first and third lines of a line split twice drops a letter typed in the removed middle line, ${order}`, () => {
      assert.deepEqual(
        race(
          word(),
          (peer) =>
            peer.editor.update.text.delete({
              at: {
                anchor: { path: [0, 0], offset: 2 },
                focus: { path: [2, 0], offset: 0 },
              },
            }),
          typeAt([1, 0], 1),
          order,
          {
            setup: (peer) => {
              breakAt([0, 0], 2)(peer);
              breakAt([1, 0], 1)(peer);
            },
          }
        ),
        settled([paragraph('wod')])
      );
    });

    it(`C23: a letter typed in the second line of a synced split stays in it when the line moves, ${order}`, () => {
      assert.deepEqual(
        race(
          word(),
          (peer) => peer.editor.update.nodes.move({ at: [1], to: [0] }),
          typeAt([1, 0], 1),
          order,
          { setup: breakAt([0, 0], 2) }
        ),
        settled([paragraph('rXd'), paragraph('wo')])
      );
    });

    it(`C23: a letter typed in the second line of a synced split stays in it when the line is wrapped, ${order}`, () => {
      assert.deepEqual(
        race(
          word(),
          (peer) =>
            peer.editor.update.nodes.wrap(
              { children: [], type: 'quote' },
              { at: [1] }
            ),
          typeAt([1, 0], 1),
          order,
          { setup: breakAt([0, 0], 2) }
        ),
        settled([
          paragraph('wo'),
          { children: [paragraph('rXd')], type: 'quote' },
        ])
      );
    });

    it(`C25: new lines that replace a line keep their letters when a peer deletes an old one, ${order}`, () => {
      assert.deepEqual(
        race(
          word(),
          (peer) => {
            peer.editor.update((tx) => {
              tx.nodes.insert([paragraph('wo'), paragraph('rd')], { at: [1] });
              tx.nodes.remove({ at: [0] });
            });
          },
          deleteAt([0, 0], 2, 3),
          order
        ),
        settled([paragraph('wo'), paragraph('rd')])
      );
    });

    it(`C25: new lines that replace a line keep their letters when a peer deletes the old "w" and "r", ${order}`, () => {
      assert.deepEqual(
        race(
          word(),
          (peer) => {
            peer.editor.update((tx) => {
              tx.nodes.insert([paragraph('wo'), paragraph('rd')], { at: [1] });
              tx.nodes.remove({ at: [0] });
            });
          },
          (peer) => {
            deleteAt([0, 0], 2, 3)(peer);
            deleteAt([0, 0], 0, 1)(peer);
          },
          order
        ),
        settled([paragraph('wo'), paragraph('rd')])
      );
    });

    it(`a new line that replaces a line with the same letters keeps them when a peer deletes an old one, ${order}`, () => {
      assert.deepEqual(
        race(
          word(),
          (peer) => {
            peer.editor.update((tx) => {
              tx.nodes.remove({ at: [0] });
              tx.nodes.insert(paragraph('word'), { at: [0] });
            });
          },
          deleteAt([0, 0], 0, 1),
          order
        ),
        settled([paragraph('word')])
      );
    });

    it(`moving a link to the end of its line keeps a peer's letter typed in the link, ${order}`, () => {
      assert.deepEqual(
        race(
          wordLinkTail(),
          (peer) => peer.editor.update.nodes.move({ at: [0, 1], to: [0, 3] }),
          typeAt([0, 1, 0], 4),
          order
        ),
        settled([block(text('wordtail'), link('LINKX'), text(''))])
      );
    });

    it(`F1: pasting two lines inside a word keeps a peer's delete after the paste, ${order}`, () => {
      assert.deepEqual(
        race(
          word(),
          (peer) => {
            peer.editor.update((tx) => {
              tx.selection.set(caret({ path: [0, 0], offset: 2 }));
              tx.fragment.replace([paragraph('A'), paragraph('B')]);
            });
          },
          deleteAt([0, 0], 3, 4),
          order
        ),
        settled([paragraph('woA'), paragraph('Br')])
      );
    });

    it(`F3: pasting three lines inside a word keeps a peer's delete after the paste, ${order}`, () => {
      assert.deepEqual(
        race(
          word(),
          (peer) => {
            peer.editor.update((tx) => {
              tx.selection.set(caret({ path: [0, 0], offset: 2 }));
              tx.fragment.replace([
                paragraph('A'),
                paragraph('B'),
                paragraph('C'),
              ]);
            });
          },
          deleteAt([0, 0], 3, 4),
          order
        ),
        settled([paragraph('woA'), paragraph('B'), paragraph('Cr')])
      );
    });

    it(`splitting a link and deleting the letter after the cut stays one split, ${order}`, () => {
      assert.deepEqual(
        race(
          [block(text('x'), link('am'), text('y'))],
          (peer) => {
            peer.editor.update((tx) => {
              tx.selection.set(caret({ path: [0, 1, 0], offset: 1 }));
              tx.break.insert();
              tx.text.delete({
                at: {
                  anchor: { path: [1, 1, 0], offset: 0 },
                  focus: { path: [1, 1, 0], offset: 1 },
                },
              });
            });
          },
          typeAt([0, 2], 1),
          order
        ),
        settled([
          block(text('x'), link('a'), text('')),
          block(text(''), link(''), text('yX')),
        ])
      );
    });

    it(`a peer's typing after the cut does not take the marks of the line before, ${order}`, () => {
      assert.deepEqual(
        race(
          [marked('word', { bold: true })],
          (peer) => {
            peer.editor.update((tx) => {
              tx.selection.set(caret({ path: [0, 0], offset: 2 }));
              tx.break.insert();
              tx.nodes.unset('bold', { at: [1, 0] });
            });
          },
          typeAt([0, 0], 2),
          order
        ),
        settled([marked('wo', { bold: true }), paragraph('Xrd')])
      );
    });
  }

  // Both Enters move the link and the tail. The line that comes last shows
  // them, and Yjs puts the line of the lower client id first.
  for (const writerId of [1, 2]) {
    for (const order of orders) {
      it(`Enters at 2 and 4 before a link show the link and the tail once, writer id ${writerId}, ${order}`, () => {
        assert.deepEqual(
          race(wordLinkTail(), breakAt([0, 0], 2), breakAt([0, 0], 4), order, {
            writerId,
          }),
          settled(
            writerId === 1
              ? [
                  paragraph('wo'),
                  paragraph('rd'),
                  block(text(''), link('LINK'), text('tail')),
                ]
              : [
                  paragraph('wo'),
                  paragraph(''),
                  block(text('rd'), link('LINK'), text('tail')),
                ]
          )
        );
      });

      it(`Enters at 1 and 2 of a line whose link moved show the link and the tail once, writer id ${writerId}, ${order}`, () => {
        assert.deepEqual(
          race(wordLinkTail(), breakAt([1, 0], 1), breakAt([1, 0], 2), order, {
            setup: breakAt([0, 0], 2),
            writerId,
          }),
          settled(
            writerId === 1
              ? [
                  paragraph('wo'),
                  paragraph('r'),
                  paragraph('d'),
                  block(text(''), link('LINK'), text('tail')),
                ]
              : [
                  paragraph('wo'),
                  paragraph('r'),
                  paragraph(''),
                  block(text('d'), link('LINK'), text('tail')),
                ]
          )
        );
      });

      // After the Enters at 2 and 4, the line at 2 shows the link and the
      // tail, and the line at 1 holds the other Enter's placeholders for them.
      const afterContest = (then: Edit) =>
        race(wordLinkTail(), breakAt([0, 0], 2), breakAt([0, 0], 4), order, {
          then,
          writerId,
        });
      const otherLine = writerId === 1 ? paragraph('rd') : paragraph('');

      it(`removing the line that shows a link two Enters moved removes the link and the tail, writer id ${writerId}, ${order}`, () => {
        assert.deepEqual(
          afterContest((writer) =>
            writer.editor.update.nodes.remove({ at: [2] })
          ),
          settled([paragraph('wo'), otherLine])
        );
      });

      it(`removing the line that shows a link two Enters moved, after an Enter took a later link out of it, removes the link and the tail, writer id ${writerId}, ${order}`, () => {
        assert.deepEqual(
          afterContest((writer) => {
            writer.editor.update.nodes.insert(link('NEW'), { at: [2, 3] });
            breakAt([2, 2], 4)(writer);
            writer.editor.update.nodes.remove({ at: [2] });
          }),
          settled([
            paragraph('wo'),
            otherLine,
            block(text(''), link('NEW'), text('')),
          ])
        );
      });

      it(`moving the other Enter's line after the line that shows a link two Enters moved keeps the link there, writer id ${writerId}, ${order}`, () => {
        assert.deepEqual(
          afterContest((writer) =>
            writer.editor.update.nodes.move({ at: [1], to: [2] })
          ),
          settled([
            paragraph('wo'),
            block(text(writerId === 1 ? '' : 'rd'), link('LINK'), text('tail')),
            otherLine,
          ])
        );
      });

      it(`moving a link two Enters moved into the first line shows it there once, writer id ${writerId}, ${order}`, () => {
        assert.deepEqual(
          afterContest((writer) =>
            writer.editor.update.nodes.move({ at: [2, 1], to: [0, 1] })
          ),
          settled([
            block(text('wo'), link('LINK'), text('')),
            otherLine,
            paragraph(writerId === 1 ? 'tail' : 'rdtail'),
          ])
        );
      });

      it(`inserting a link into the tail of the line that shows a link two Enters moved shows the moved link once, writer id ${writerId}, ${order}`, () => {
        assert.deepEqual(
          afterContest((writer) => {
            writer.editor.update((tx) => {
              tx.selection.set(caret({ path: [2, 2], offset: 2 }));
              tx.nodes.insert(link('NEW'));
            });
          }),
          settled([
            paragraph('wo'),
            otherLine,
            block(
              text(writerId === 1 ? '' : 'rd'),
              link('LINK'),
              text('ta'),
              link('NEW'),
              text('il')
            ),
          ])
        );
      });
    }
  }

  // The new line's empty text before the link has no Yjs text, so a letter
  // typed there needs one.
  for (const writerId of [1, 2]) {
    for (const order of orders) {
      it(`typing at the start of a line whose link and tail moved keeps a letter typed after the tail, writer id ${writerId}, ${order}`, () => {
        assert.deepEqual(
          race(
            wordLinkTail(),
            typeAt([1, 2], 4, 'Y'),
            typeAt([1, 0], 0),
            order,
            {
              setup: breakAt([0, 0], 4),
              writerId,
            }
          ),
          settled([
            paragraph('word'),
            block(text('X'), link('LINK'), text('tailY')),
          ])
        );
      });

      it(`typing at the start of a line whose link and tail moved keeps the removal of the line before it, writer id ${writerId}, ${order}`, () => {
        assert.deepEqual(
          race(
            [{ children: wordLinkTail(), type: 'quote' }],
            (peer) => peer.editor.update.nodes.remove({ at: [0, 0] }),
            typeAt([0, 1, 0], 0),
            order,
            { setup: breakAt([0, 0, 0], 4), writerId }
          ),
          settled([
            {
              children: [block(text('X'), link('LINK'), text('tail'))],
              type: 'quote',
            },
          ])
        );
      });
    }
  }

  it("a letter typed right after an Enter before a link stays when the peer's import of the Enter arrives after it", () => {
    const { peer, peers, read, writer } = createPeers(wordLinkTail());

    breakAt([0, 0], 4)(writer);
    deliver(writer, peer);
    typeAt([1, 0], 0)(writer);
    syncConnectedPeers(peers);

    assert.deepEqual(
      read(),
      settled([paragraph('word'), block(text('X'), link('LINK'), text('tail'))])
    );
  });

  it('a caret after the cut keeps its letter in Yjs and types before it', () => {
    const peers = createPeers(word(), { awareness: true });
    const { awarenessOf, peer, peerId, writer, writerId } = peers;

    runEditorYjsUpdate(peer.editor, (actions) =>
      actions.sendSelection(caret({ path: [0, 0], offset: 3 }))
    );
    const sent = awarenessOf(peerId).getLocalState()?.selection;
    breakAt([0, 0], 2)(writer);
    syncConnectedPeers(peers.peers);
    awarenessOf(writerId).setRemoteState(peerId, { selection: sent });

    const [cursor] = getYjsRemoteCursors(writer);
    const moved = { path: [1, 0], offset: 1 };

    assert.deepEqual(cursor?.selection, { anchor: moved, focus: moved });

    typeAt(moved.path, moved.offset)(peer);
    syncConnectedPeers(peers.peers);

    assert.deepEqual(
      peers.read(),
      settled([paragraph('wo'), paragraph('rXd')])
    );
  });

  it('a caret after the cut moves into the second line of the peer that receives the split', () => {
    const { peer, peers, writer } = createPeers(word());

    peer.editor.update.selection.set(caret({ path: [0, 0], offset: 3 }));
    breakAt([0, 0], 2)(writer);
    syncConnectedPeers(peers);

    assert.deepEqual(
      readPeerSelection(peer),
      caret({ path: [1, 0], offset: 1 })
    );
  });

  const quoted = (...children: Descendant[]): Descendant => ({
    children,
    type: 'quote',
  });

  for (const writerId of [1, 2]) {
    for (const order of orders) {
      it(`an Enter in a line moved out of a quote splits it on every peer, writer id ${writerId}, ${order}`, () => {
        const peers = createPeers(
          [quoted(paragraph('word'), paragraph('tail')), paragraph('z')],
          { writerId }
        );

        peers.writer.editor.update.nodes.move({ at: [0, 0], to: [1] });
        syncConnectedPeers(peers.peers);
        breakAt([1, 0], 2)(peers.writer);
        syncConnectedPeers(
          order === 'writer-first' ? peers.peers : [peers.peer, peers.writer]
        );

        assert.deepEqual(
          peers.read(),
          settled([
            quoted(paragraph('tail')),
            paragraph('wo'),
            paragraph('rd'),
            paragraph('z'),
          ])
        );

        typeAt([1, 0], 1)(peers.peer);
        syncConnectedPeers([peers.peer, peers.writer]);

        assert.deepEqual(
          peers.read(),
          settled([
            quoted(paragraph('tail')),
            paragraph('wXo'),
            paragraph('rd'),
            paragraph('z'),
          ])
        );
      });
    }
  }

  // The tail the first Enter moves shows through a placeholder in the
  // second line, so the second Enter cuts a text its own line does not hold.
  const splitMovedTail = (peers: ReturnType<typeof createPeers>) => {
    breakAt([1, 2], 2)(peers.writer);
    syncConnectedPeers(peers.peers);
  };
  const tailSplit = [
    paragraph('word'),
    block(text(''), link('LINK'), text('ta')),
    paragraph('il'),
  ];

  it("a peer's caret after the cut of a tail an Enter before a link moved moves into the new line", () => {
    const peers = createPeers(wordLinkTail());

    breakAt([0, 0], 4)(peers.writer);
    syncConnectedPeers(peers.peers);
    peers.peer.editor.update.selection.set(caret({ path: [1, 2], offset: 3 }));
    splitMovedTail(peers);

    assert.deepEqual(peers.read(), settled(tailSplit));
    assert.deepEqual(
      readPeerSelection(peers.peer),
      caret({ path: [2, 0], offset: 1 })
    );
  });

  it("a peer's undo of a letter typed after the cut of a tail an Enter before a link moved removes it", () => {
    const peers = createPeers(wordLinkTail());

    breakAt([0, 0], 4)(peers.writer);
    syncConnectedPeers(peers.peers);
    typeAt([1, 2], 3)(peers.peer);
    syncConnectedPeers(peers.peers);
    splitMovedTail(peers);

    assert.deepEqual(
      peers.read(),
      settled([
        paragraph('word'),
        block(text(''), link('LINK'), text('ta')),
        paragraph('iXl'),
      ])
    );

    undo(peers.peer);
    syncConnectedPeers(peers.peers);

    assert.deepEqual(peers.read(), settled(tailSplit));
  });

  for (const writerId of [1, 2]) {
    for (const order of orders) {
      it(`an Enter at a line's start keeps a peer's concurrent align on the line that holds the letters, writer id ${writerId}, ${order}`, () => {
        const ids = writerId === 1 ? { a: 1, b: 2 } : { a: 2, b: 1 };
        const [writer, peer] = createSeededYjsHistoryPeers({
          children: [paragraph('word')],
          clientIds: ['a', 'b'],
          numericClientIds: ids,
        });
        const read = () => ({
          fresh: readPeerChildren(
            createYjsPeerWithEditor(
              createYjsTestEditor({ children: [paragraph('seed')] }),
              {
                children: [paragraph('seed')],
                clientId: 'c',
                numericClientId: 3,
                seedUpdate: Y.encodeStateAsUpdate(writer.doc),
              }
            )
          ),
          peer: readPeerChildren(peer),
          writer: readPeerChildren(writer),
        });
        const same = (expected: readonly Descendant[]) => ({
          fresh: expected,
          peer: expected,
          writer: expected,
        });

        breakAt([0, 0], 0)(writer);
        peer.editor.update.nodes.set({ align: 'center' } as never, {
          at: [0],
        });
        syncConnectedPeers(
          order === 'writer-first' ? [writer, peer] : [peer, writer]
        );

        assert.deepEqual(
          read(),
          same([paragraph(''), paragraph('word', { align: 'center' })])
        );

        undo(peer);
        syncConnectedPeers([writer, peer]);

        assert.deepEqual(read(), same([paragraph(''), paragraph('word')]));
      });
    }
  }
});

describe('plitejs/yjs split identity at a line start', () => {
  for (const writerId of [1, 2]) {
    for (const order of orders) {
      it(`an Enter before a line's first link keeps a peer's concurrent align on the line that holds the link, writer id ${writerId}, ${order}`, () => {
        assert.deepEqual(
          race(
            [block(text(''), link('LINK'), text('tail'))],
            breakAt([0, 0], 0),
            (peer) =>
              peer.editor.update.nodes.set({ align: 'center' }, { at: [0] }),
            order,
            { writerId }
          ),
          settled([
            paragraph(''),
            { ...block(text(''), link('LINK'), text('tail')), align: 'center' },
          ])
        );
      });
    }
  }
});

describe('plitejs/yjs split identity under a peer undo of a bold', () => {
  /**
   * The peer bolds the line's last text while the writer presses `enter`,
   * delivered in `order`; then the peer undoes the bold.
   */
  const undoBoldAcrossEnter = (
    children: readonly Descendant[],
    enter: Edit,
    tail: number[],
    order: (typeof orders)[number],
    writerId: number
  ) => {
    const peers = createPeers(children, { writerId });
    enter(peers.writer);
    peers.peer.editor.update.nodes.set(
      { bold: true },
      {
        at: {
          anchor: { path: tail, offset: 0 },
          focus: { path: tail, offset: 4 },
        },
        match: (node) => NodeApi.isText(node),
        split: true,
      }
    );
    syncConnectedPeers(
      order === 'writer-first' ? peers.peers : [peers.peer, peers.writer]
    );
    undo(peers.peer);
    syncConnectedPeers(peers.peers);
    return peers.read();
  };

  for (const writerId of [1, 2]) {
    for (const order of orders) {
      const cases = `writer id ${writerId}, ${order}`;

      it(`undoing a bold of the text after a link an Enter split, past an empty text between links, leaves it plain, ${cases}`, () => {
        assert.deepEqual(
          undoBoldAcrossEnter(
            [
              block(
                text('word'),
                link('ONE'),
                text(''),
                link('TWO'),
                text('tail')
              ),
            ],
            breakAt([0, 3, 0], 1),
            [0, 4],
            order,
            writerId
          ),
          settled([
            block(text('word'), link('ONE'), text(''), link('T'), text('')),
            block(text(''), link('WO'), text('tail')),
          ])
        );
      });

      it(`undoing a bold of the text after a link an Enter at its end moved leaves it plain, ${cases}`, () => {
        assert.deepEqual(
          undoBoldAcrossEnter(
            wordLinkTail(),
            breakAt([0, 1, 0], 4),
            [0, 2],
            order,
            writerId
          ),
          settled([
            block(text('word'), link('LINK'), text('')),
            block(text(''), link(''), text('tail')),
          ])
        );
      });

      it(`M3-d: undoing a bold of the text after a link an Enter at its end moved, with a letter typed into the new link and the link retyped as a span in the same commit, leaves it plain, ${cases}`, () => {
        assert.deepEqual(
          undoBoldAcrossEnter(
            wordLinkTail(),
            (peer) => {
              peer.editor.update((tx) => {
                tx.selection.set(caret({ path: [0, 1, 0], offset: 4 }));
                tx.break.insert();
                tx.text.insert('X', { at: { path: [1, 1, 0], offset: 0 } });
                tx.nodes.set({ type: 'span' } as never, { at: [1, 1] });
              });
            },
            [0, 2],
            order,
            writerId
          ),
          settled([
            block(text('word'), link('LINK'), text('')),
            block(text(''), span(text('X')), text('tail')),
          ])
        );
      });

      it(`M3-e: undoing a bold of the text after a span an Enter at its end moved, with a link inserted into the new span in the same commit, leaves it plain, ${cases}`, () => {
        assert.deepEqual(
          undoBoldAcrossEnter(
            [block(text('word'), span(text('SPAN')), text('tail'))],
            (peer) => {
              peer.editor.update((tx) => {
                tx.selection.set(caret({ path: [0, 1, 0], offset: 4 }));
                tx.break.insert();
                tx.nodes.insert(link('X'), { at: [1, 1, 1] });
              });
            },
            [0, 2],
            order,
            writerId
          ),
          settled([
            block(text('word'), span(text('SPAN')), text('')),
            block(text(''), span(text(''), link('X'), text('')), text('tail')),
          ])
        );
      });

      it(`M3-h: undoing a bold of the text after a link an Enter at its end moved, with a letter typed at the new line's start in the same commit, leaves it plain, ${cases}`, () => {
        assert.deepEqual(
          undoBoldAcrossEnter(
            wordLinkTail(),
            (peer) => {
              peer.editor.update((tx) => {
                tx.selection.set(caret({ path: [0, 1, 0], offset: 4 }));
                tx.break.insert();
                tx.text.insert('X', { at: { path: [1, 0], offset: 0 } });
              });
            },
            [0, 2],
            order,
            writerId
          ),
          settled([
            block(text('word'), link('LINK'), text('')),
            block(text('X'), link(''), text('tail')),
          ])
        );
      });

      it(`M3-i: undoing a bold of a letter that a second Enter in the same link moved to its own line leaves it plain, ${cases}`, () => {
        const peers = createPeers(
          [block(text('head'), link('ab'), text('tail'))],
          { writerId }
        );
        breakAt([0, 1, 0], 2)(peers.writer);
        syncConnectedPeers(peers.peers);
        breakAt([0, 1, 0], 1)(peers.writer);
        peers.peer.editor.update.nodes.set(
          { bold: true },
          {
            at: {
              anchor: { path: [0, 1, 0], offset: 1 },
              focus: { path: [0, 1, 0], offset: 2 },
            },
            match: (node) => NodeApi.isText(node),
            split: true,
          }
        );
        syncConnectedPeers(
          order === 'writer-first' ? peers.peers : [peers.peer, peers.writer]
        );
        undo(peers.peer);
        syncConnectedPeers(peers.peers);

        assert.deepEqual(
          peers.read(),
          settled([
            block(text('head'), link('a'), text('')),
            block(text(''), link('b'), text('')),
            block(text(''), link(''), text('tail')),
          ])
        );
      });

      it(`undoing a bold of a letter an Enter inside a span's text moved, with a link inserted before the moved tail in the same commit, leaves it plain, ${cases}`, () => {
        const peers = createPeers(
          [
            block(
              text('word'),
              span(text('ab'), link('LINK'), text('tail')),
              text('end')
            ),
          ],
          { writerId }
        );
        peers.writer.editor.update((tx) => {
          tx.selection.set(caret({ path: [0, 1, 0], offset: 1 }));
          tx.break.insert();
          tx.nodes.insert(link('X'), { at: [1, 1, 2] });
        });
        peers.peer.editor.update.nodes.set(
          { bold: true },
          {
            at: {
              anchor: { path: [0, 1, 0], offset: 1 },
              focus: { path: [0, 1, 0], offset: 2 },
            },
            match: (node) => NodeApi.isText(node),
            split: true,
          }
        );
        syncConnectedPeers(
          order === 'writer-first' ? peers.peers : [peers.peer, peers.writer]
        );
        undo(peers.peer);
        syncConnectedPeers(peers.peers);

        assert.deepEqual(
          peers.read(),
          settled([
            block(text('word'), span(text('a')), text('')),
            block(
              text(''),
              span(text('b'), link('LINK'), text(''), link('X'), text('tail')),
              text('end')
            ),
          ])
        );
      });

      it(`undoing a bold of a text an Enter inside it split, with a link inserted before the moved tail in the same commit, leaves both halves plain, ${cases}`, () => {
        const peers = createPeers(
          [block(text('ABCD'), link('E'), text('tail'))],
          { writerId }
        );
        peers.peer.editor.update.nodes.set(
          { bold: true },
          { at: [0, 0], match: (node) => NodeApi.isText(node) }
        );
        syncConnectedPeers(peers.peers);
        peers.writer.editor.update((tx) => {
          tx.selection.set(caret({ path: [0, 0], offset: 2 }));
          tx.break.insert();
          tx.nodes.insert(link('X'), { at: [1, 2] });
        });
        syncConnectedPeers(
          order === 'writer-first' ? peers.peers : [peers.peer, peers.writer]
        );
        undo(peers.peer);
        syncConnectedPeers(peers.peers);

        assert.deepEqual(
          peers.read(),
          settled([
            block(text('AB')),
            block(text('CD'), link('E'), text(''), link('X'), text('tail')),
          ])
        );
      });
    }
  }
});

describe('plitejs/yjs split identity of a rewritten line', () => {
  for (const writerId of [1, 2]) {
    it(`an Enter at a span's end, a letter typed into the new span and a link around it in one commit reach the peer, writer id ${writerId}`, () => {
      const peers = createPeers(
        [block(text('word'), span(text('LINK')), text('tail'))],
        { writerId }
      );
      peers.writer.editor.update((tx) => {
        tx.selection.set(caret({ path: [0, 1, 0], offset: 4 }));
        tx.break.insert();
        tx.text.insert('X', { at: { path: [1, 1, 0], offset: 0 } });
        tx.nodes.wrap(
          { children: [], type: 'link' },
          {
            at: {
              anchor: { path: [1, 1, 0], offset: 0 },
              focus: { path: [1, 1, 0], offset: 1 },
            },
            split: true,
          }
        );
      });
      syncConnectedPeers(peers.peers);

      assert.deepEqual(
        peers.read(),
        settled([
          block(text('word'), span(text('LINK')), text('')),
          block(text(''), span(text(''), link('X'), text('')), text('tail')),
        ])
      );
    });
  }
});

describe('plitejs/yjs split identity removal', () => {
  const removeFirstLine = (
    title: string,
    children: () => Descendant[],
    setup: Edit,
    remove: Edit,
    type: Edit,
    expected: readonly Descendant[]
  ) => {
    for (const order of orders) {
      it(`removing the first line of a synced split ${title} keeps the second line and a letter typed there, ${order}`, () => {
        assert.deepEqual(
          race(children(), remove, type, order, { setup }),
          settled(expected)
        );
      });
    }
  };

  removeFirstLine(
    'as a root splice',
    word,
    breakAt([0, 0], 2),
    (peer) => peer.editor.update.nodes.remove({ at: [0] }),
    typeAt([1, 0], 0),
    [paragraph('Xrd')]
  );
  removeFirstLine(
    'by replacing it with a new line',
    word,
    breakAt([0, 0], 2),
    (peer) => {
      peer.editor.update((tx) => {
        tx.nodes.remove({ at: [0] });
        tx.nodes.insert(paragraph('new'), { at: [0] });
      });
    },
    typeAt([1, 0], 0),
    [paragraph('new'), paragraph('Xrd')]
  );
  removeFirstLine(
    'whose children moved to the second line, by replacing it',
    wordLinkTail,
    breakAt([0, 0], 4),
    (peer) => {
      peer.editor.update((tx) => {
        tx.nodes.remove({ at: [0] });
        tx.nodes.insert(paragraph('new'), { at: [0] });
      });
    },
    typeAt([1, 0], 0),
    [paragraph('new'), block(text('X'), link('LINK'), text('tail'))]
  );
  removeFirstLine(
    'whose children moved to the second line, as a root splice',
    wordLinkTail,
    breakAt([0, 0], 4),
    (peer) => peer.editor.update.nodes.remove({ at: [0] }),
    typeAt([1, 0], 0),
    [block(text('X'), link('LINK'), text('tail'))]
  );
  removeFirstLine(
    'whose children moved to the second line, by replacing it with a quote',
    wordLinkTail,
    breakAt([0, 0], 4),
    (peer) => {
      peer.editor.update((tx) => {
        tx.nodes.remove({ at: [0] });
        tx.nodes.insert(
          { children: [paragraph('new')], type: 'quote' },
          { at: [0] }
        );
      });
    },
    typeAt([1, 1, 0], 0),
    [
      { children: [paragraph('new')], type: 'quote' },
      block(text(''), link('XLINK'), text('tail')),
    ]
  );
  removeFirstLine(
    'whose children moved to the second line, with an edit of the second line',
    wordLinkTail,
    breakAt([0, 0], 4),
    (peer) => {
      peer.editor.update((tx) => {
        tx.nodes.remove({ at: [0] });
        tx.text.insert('Y', { at: { path: [0, 2], offset: 4 } });
      });
    },
    typeAt([1, 1, 0], 0),
    [block(text(''), link('XLINK'), text('tailY'))]
  );
  removeFirstLine(
    'whose children moved to the second line, inside a quote',
    () => [{ children: wordLinkTail(), type: 'quote' }],
    breakAt([0, 0, 0], 4),
    (peer) => peer.editor.update.nodes.remove({ at: [0, 0] }),
    typeAt([0, 1, 1, 0], 0),
    [
      {
        children: [block(text(''), link('XLINK'), text('tail'))],
        type: 'quote',
      },
    ]
  );
  removeFirstLine(
    'inside a quote',
    () => [{ children: [paragraph('word')], type: 'quote' }],
    breakAt([0, 0, 0], 2),
    (peer) => peer.editor.update.nodes.remove({ at: [0, 0] }),
    typeAt([0, 1, 0], 0),
    [{ children: [paragraph('Xrd')], type: 'quote' }]
  );
});

describe('plitejs/yjs split identity removal racing a join', () => {
  const removeSecondLine: Edit = (peer) =>
    peer.editor.update.nodes.remove({ at: [1] });
  const sorted = (value: string) => [...value].sort().join('');
  const withSortedWriterLetters = (result: ReturnType<typeof race>) => ({
    errors: result.errors,
    fresh: result.fresh,
    letters: sorted(letters(result.writer)),
    peer: result.peer,
  });

  for (const writerId of [1, 2]) {
    for (const order of orders) {
      const cases = `writer id ${writerId}, ${order}`;

      it(`removing the second line of a synced split while a peer joins it keeps its letters removed, ${cases}`, () => {
        assert.deepEqual(
          race(word(), removeSecondLine, joinSecondLine, order, {
            setup: breakAt([0, 0], 2),
            writerId,
          }),
          settled([paragraph('wo')])
        );
      });

      it(`deleting across a synced split's second line while a peer joins it keeps its letters removed, ${cases}`, () => {
        assert.deepEqual(
          race(
            [paragraph('word'), paragraph('end')],
            (peer) =>
              peer.editor.update.text.delete({
                at: {
                  anchor: { path: [0, 0], offset: 2 },
                  focus: { path: [2, 0], offset: 0 },
                },
              }),
            joinSecondLine,
            order,
            { setup: breakAt([0, 0], 2), writerId }
          ),
          settled([paragraph('woend')])
        );
      });

      it(`removing a split line that an Enter left above a link while a peer joins it keeps its letters removed, ${cases}`, () => {
        assert.deepEqual(
          race(
            [paragraph('word'), paragraph('end')],
            removeSecondLine,
            joinSecondLine,
            order,
            {
              setup: [
                breakAt([0, 0], 2),
                (peer) =>
                  peer.editor.update.nodes.insert(link('extra'), {
                    at: [1, 1],
                  }),
                breakAt([1, 0], 2),
              ],
              writerId,
            }
          ),
          settled([
            paragraph('wo'),
            block(text(''), link('extra'), text('')),
            paragraph('end'),
          ])
        );
      });

      it(`moving a synced split's second line and inserting a link into it while a peer joins it shows its letters once, ${cases}`, () => {
        const result = race(
          [paragraph('word'), paragraph('end')],
          (peer) => {
            peer.editor.update((tx) => {
              tx.nodes.move({ at: [1], to: [2] });
              tx.nodes.insert(link('L'), { at: [2, 1] });
            });
          },
          joinSecondLine,
          order,
          { setup: breakAt([0, 0], 2), writerId }
        );

        assert.deepEqual(withSortedWriterLetters(result), {
          errors: [],
          fresh: result.writer,
          letters: sorted('woendrdL'),
          peer: result.writer,
        });
      });

      it(`removing a synced split's second line and inserting a link into the line an Enter moved a link to while a peer joins it keeps its letters removed, ${cases}`, () => {
        const peers = createPeers(
          [paragraph('word'), block(text('x'), link('LINK'), text('tail'))],
          { writerId }
        );
        for (const step of [breakAt([0, 0], 2), breakAt([2, 0], 1)]) {
          step(peers.writer);
          syncConnectedPeers(peers.peers);
        }
        peers.writer.editor.update((tx) => {
          tx.nodes.remove({ at: [1] });
          tx.nodes.insert(link('Q'), { at: [2, 1] });
        });
        joinSecondLine(peers.peer);
        syncConnectedPeers(
          order === 'writer-first' ? peers.peers : [peers.peer, peers.writer]
        );

        assert.deepEqual(
          peers.read(),
          settled([
            paragraph('wo'),
            paragraph('x'),
            block(text(''), link('Q'), text(''), link('LINK'), text('tail')),
          ])
        );
      });

      it(`undoing the removal of a synced split's second line that a peer joined shows its letters once, ${cases}`, () => {
        const result = race(word(), removeSecondLine, joinSecondLine, order, {
          setup: breakAt([0, 0], 2),
          then: undo,
          writerId,
        });

        assert.deepEqual(withSortedWriterLetters(result), {
          errors: [],
          fresh: result.writer,
          letters: sorted('word'),
          peer: result.writer,
        });
      });

      // The join the peer makes after typing carries its letter into the
      // first line, so only the removed line's own letters go.
      it(`removing the second line of a synced split while a peer types in it and joins it keeps the line's letters removed, ${cases}`, () => {
        assert.deepEqual(
          race(
            word(),
            removeSecondLine,
            (peer) => {
              typeAt([1, 0], 1)(peer);
              joinSecondLine(peer);
            },
            order,
            { setup: breakAt([0, 0], 2), writerId }
          ),
          settled([paragraph('woX')])
        );
      });
    }
  }
});

describe('plitejs/yjs split identity removal racing an Enter', () => {
  const enters = [
    ['inside its text', paragraph('cd')],
    ['before a link', block(text('c'), link('L'), text('d'))],
  ] as const;

  for (const [where, line] of enters) {
    for (const writerId of [1, 2]) {
      for (const order of orders) {
        it(`removing a line while a peer presses Enter ${where} in it leaves the peer's new line empty on every peer, writer id ${writerId}, ${order}`, () => {
          const peers = createPeers([paragraph('ab'), line, paragraph('ef')], {
            writerId,
          });
          peers.writer.editor.update.nodes.remove({ at: [1] });
          breakAt([1, 0], 1)(peers.peer);
          syncConnectedPeers(
            order === 'writer-first' ? peers.peers : [peers.peer, peers.writer]
          );
          const expected = [paragraph('ab'), paragraph(''), paragraph('ef')];

          assert.deepEqual(
            {
              ...peers.read(),
              peerYjs: readPeerChildren(peers.join(peers.peer)),
            },
            { ...settled(expected), peerYjs: expected }
          );
        });
      }
    }
  }
});

describe('plitejs/yjs split identity removal racing a merge or a join', () => {
  for (const writerId of [1, 2]) {
    for (const order of orders) {
      const cases = `writer id ${writerId}, ${order}`;

      it(`removing the middle line of a line split twice while a peer merges the line after it into it removes both, ${cases}`, () => {
        assert.deepEqual(
          race(
            [paragraph('wordxy'), paragraph('end')],
            (peer) => peer.editor.update.nodes.remove({ at: [1] }),
            (peer) => peer.editor.update.nodes.merge({ at: [2] }),
            order,
            { setup: [breakAt([0, 0], 4), breakAt([0, 0], 2)], writerId }
          ),
          settled([paragraph('wo'), paragraph('end')])
        );
      });

      it(`removing a synced split's second line that an offline peer joined keeps its letters removed when the peer reconnects, ${cases}`, () => {
        const peers = createPeers(word(), { writerId });
        breakAt([0, 0], 2)(peers.writer);
        syncConnectedPeers(peers.peers);
        disconnectYjsPeer(peers.peer);
        joinSecondLine(peers.peer);
        peers.writer.editor.update.nodes.remove({ at: [1] });
        syncConnectedPeers(peers.peers);
        connectYjsPeer(peers.peer);
        syncConnectedPeers(
          order === 'writer-first' ? peers.peers : [peers.peer, peers.writer]
        );

        assert.deepEqual(peers.read(), settled([paragraph('wo')]));
      });

      it(`a receiver's fallback repair of a synced split's second line removal, while a third peer joins that line, converges with its letters removed, ${cases}`, () => {
        const peers = createPeers(word(), { writerId });
        const receiver = peers.addEditingPeer(4);
        const all = [peers.writer, peers.peer, receiver];
        breakAt([0, 0], 2)(peers.writer);
        syncConnectedPeers(all);
        peers.writer.editor.update.nodes.remove({ at: [1] });
        getYjsRoot(peers.writer).setAttribute('provider:metadata', 'opaque');
        joinSecondLine(peers.peer);
        const traced = getYjsTrace(receiver).length;
        deliver(peers.writer, receiver);
        const fallbacks = getYjsTrace(receiver)
          .slice(traced)
          .flatMap((entry) => (entry.fallback ? [entry.fallback] : []));
        syncConnectedPeers(
          order === 'writer-first' ? all : [peers.peer, receiver, peers.writer]
        );

        assert.deepEqual(
          { fallbacks, receiver: readPeerChildren(receiver), ...peers.read() },
          {
            fallbacks: ['remote-event-root-attributes'],
            receiver: [paragraph('wo')],
            ...settled([paragraph('wo')]),
          }
        );
      });
    }

    it(`a batch that inserts a block showing its own text twice keeps the text's letters on every receiver, writer id ${writerId}`, () => {
      const peers = createPeers([paragraph('word'), paragraph('end')], {
        writerId,
      });
      const other = new Y.Doc();
      other.clientID = 9;
      Y.applyUpdate(other, Y.encodeStateAsUpdate(peers.writer.doc));
      other.transact(() => {
        const shown = createYjsNode(block()) as Y.XmlElement;
        const own = createYjsNode(text('abc'));
        const placeholder = new Y.XmlElement(YJS_ELEMENT_NODE_NAME);

        placeholder.setAttribute(
          YJS_VIRTUAL_CHILD_ID_KEY,
          assignFreshYjsNodeId(own)
        );
        placeholder.setAttribute(YJS_VIRTUAL_PLACEHOLDER_KEY, true);
        shown.insert(0, [own, placeholder]);
        other.get(DEFAULT_YJS_ROOT_NAME, Y.XmlElement).insert(2, [shown]);
      });
      const batch = Y.encodeStateAsUpdate(
        other,
        Y.encodeStateVector(peers.writer.doc)
      );
      for (const receiver of peers.peers) Y.applyUpdate(receiver.doc, batch);
      syncConnectedPeers(peers.peers);

      assert.deepEqual(
        peers.read(),
        settled([paragraph('word'), paragraph('end'), paragraph('abc')])
      );
    });
  }
});

describe('plitejs/yjs split identity removal in a write that throws', () => {
  const planted = new Error('planted throw');
  const writeThenThrow = (
    peer: Peer,
    write: Parameters<typeof withYjsWrite>[1]
  ) => {
    assert.throws(
      () =>
        withYjsWrite(getYjsRoot(peer), (scope) => {
          write(scope);
          throw planted;
        }),
      (error) => error === planted
    );
  };

  for (const writerId of [1, 2]) {
    for (const order of orders) {
      const cases = `writer id ${writerId}, ${order}`;

      it(`removing a synced split's second line in a write that throws while a peer joins it keeps its letters removed, ${cases}`, () => {
        const peers = createPeers(word(), { writerId });
        breakAt([0, 0], 2)(peers.writer);
        syncConnectedPeers(peers.peers);
        writeThenThrow(peers.writer, (write) => {
          removeYjsChild(write, write.root, 1);
        });
        joinSecondLine(peers.peer);
        syncConnectedPeers(
          order === 'writer-first' ? peers.peers : [peers.peer, peers.writer]
        );

        assert.deepEqual(peers.read(), settled([paragraph('wo')]));
      });

      it(`a cut that a write makes before it throws keeps a peer's letter typed after it, ${cases}`, () => {
        const peers = createPeers(word(), { writerId });
        writeThenThrow(peers.writer, (write) => {
          const line = write.root.get(0) as Y.XmlElement;
          cutTextAt(write, [line.get(0) as Y.XmlText], 2);
        });
        typeAt([0, 0], 3)(peers.peer);
        syncConnectedPeers(
          order === 'writer-first' ? peers.peers : [peers.peer, peers.writer]
        );

        assert.deepEqual(peers.read(), settled([paragraph('worXd')]));
      });
    }
  }
});

describe('plitejs/yjs split identity of wrapped lines', () => {
  const quote = (...children: Descendant[]): Descendant => ({
    children,
    type: 'quote',
  });
  const wrapSecondLine: Edit = (peer) =>
    peer.editor.update.nodes.wrap({ children: [], type: 'quote' }, { at: [1] });

  for (const writerId of [1, 2]) {
    for (const order of orders) {
      // Each peer wraps its own Enter's line, so the link and the tail have a
      // placeholder in each quote and show in the one that comes last.
      const afterContest = (then: Edit) =>
        race(
          wordLinkTail(),
          (peer) => {
            breakAt([0, 0], 2)(peer);
            wrapSecondLine(peer);
          },
          (peer) => {
            breakAt([0, 0], 4)(peer);
            wrapSecondLine(peer);
          },
          order,
          { then, writerId }
        );
      const otherLine = quote(paragraph(writerId === 1 ? 'rd' : ''));
      const cases = `writer id ${writerId}, ${order}`;

      it(`removing the quote that shows a link two wrapped Enters moved removes the link and the tail, ${cases}`, () => {
        assert.deepEqual(
          afterContest((writer) =>
            writer.editor.update.nodes.remove({ at: [2] })
          ),
          settled([paragraph('wo'), otherLine])
        );
      });

      it(`moving the other quote after the quote that shows a link two wrapped Enters moved keeps the link there, ${cases}`, () => {
        assert.deepEqual(
          afterContest((writer) =>
            writer.editor.update.nodes.move({ at: [1], to: [2] })
          ),
          settled([
            paragraph('wo'),
            quote(
              block(
                text(writerId === 1 ? '' : 'rd'),
                link('LINK'),
                text('tail')
              )
            ),
            otherLine,
          ])
        );
      });
    }
  }
});

describe('plitejs/yjs split identity of moved split lines', () => {
  const quote = (...children: Descendant[]): Descendant => ({
    children,
    type: 'quote',
  });
  const wrapSecondLine: Edit = (peer) =>
    peer.editor.update.nodes.wrap({ children: [], type: 'quote' }, { at: [1] });
  const joinThirdLine: Edit = (peer) =>
    peer.editor.update.nodes.merge({ at: [2] });
  const steps = (peers: ReturnType<typeof createPeers>, edits: Edit[]) => {
    for (const edit of edits) {
      edit(peers.writer);
      syncConnectedPeers(peers.peers);
    }
  };

  for (const writerId of [1, 2]) {
    for (const order of orders) {
      const cases = `writer id ${writerId}, ${order}`;

      it(`a split line moved up and merged into the line above keeps its letters when Enter splits it again while a peer types there, ${cases}`, () => {
        assert.deepEqual(
          race(
            [paragraph('prefix'), paragraph('word'), paragraph('end')],
            breakAt([0, 0], 6),
            typeAt([0, 0], 7),
            order,
            {
              setup: [
                breakAt([1, 0], 2),
                (peer) => peer.editor.update.nodes.move({ at: [2], to: [1] }),
                (peer) => peer.editor.update.nodes.merge({ at: [1] }),
              ],
              writerId,
            }
          ),
          settled([
            paragraph('prefix'),
            paragraph('rXd'),
            paragraph('wo'),
            paragraph('end'),
          ])
        );
      });

      it(`a moved line that two peers join the same line into keeps the joined letters when it moves again, ${cases}`, () => {
        assert.deepEqual(
          race(
            [paragraph('ab'), paragraph('cd'), paragraph('ef')],
            joinThirdLine,
            joinThirdLine,
            order,
            {
              setup: (peer) =>
                peer.editor.update.nodes.move({ at: [0], to: [1] }),
              then: (peer) =>
                peer.editor.update.nodes.move({ at: [1], to: [0] }),
              writerId,
            }
          ),
          settled([paragraph('abef'), paragraph('cd')])
        );
      });
    }

    it(`an Enter in a line that a merge filled with a moved split line keeps that line's letters, writer id ${writerId}`, () => {
      const peers = createPeers(word(), { writerId });
      steps(peers, [
        breakAt([0, 0], 2),
        breakAt([0, 0], 2),
        typeAt([1, 0], 0, 'ab'),
        (peer) => peer.editor.update.nodes.merge({ at: [2] }),
        breakAt([1, 0], 2),
      ]);

      assert.deepEqual(
        peers.read(),
        settled([paragraph('wo'), paragraph('ab'), paragraph('rd')])
      );
    });
  }

  it('moving the line after a twice split line to the top and back keeps its letters', () => {
    const peers = createPeers(wordLinkTail());
    steps(peers, [
      breakAt([0, 0], 4),
      breakAt([1, 2], 2),
      (peer) => peer.editor.update.nodes.move({ at: [2], to: [0] }),
      (peer) => peer.editor.update.nodes.move({ at: [0], to: [2] }),
    ]);
    assert.deepEqual(
      peers.read(),
      settled([
        paragraph('word'),
        block(text(''), link('LINK'), text('ta')),
        paragraph('il'),
      ])
    );
  });

  it('unwrapping the quote around the second line of a split keeps its letters', () => {
    const peers = createPeers([paragraph('word'), paragraph('end')]);
    steps(peers, [
      breakAt([0, 0], 2),
      wrapSecondLine,
      (peer) => peer.editor.update.nodes.unwrap({ at: [1] }),
    ]);
    assert.deepEqual(
      peers.read(),
      settled([paragraph('wo'), paragraph('rd'), paragraph('end')])
    );
  });

  it('undoing the wrap of the second line of a split keeps its letters', () => {
    const peers = createPeers([paragraph('word'), paragraph('end')]);
    steps(peers, [breakAt([0, 0], 2), wrapSecondLine, undo]);
    assert.deepEqual(
      peers.read(),
      settled([paragraph('wo'), paragraph('rd'), paragraph('end')])
    );
  });

  it("an Enter between the halves of a split link keeps the second half's letters", () => {
    const peers = createPeers(wordLinkTail());
    steps(peers, [
      (peer) =>
        peer.editor.update.nodes.split({
          always: true,
          at: { offset: 2, path: [0, 1, 0] },
          match: (node) => NodeApi.isElement(node) && node.type === 'link',
        }),
      breakAt([0, 0], 4),
      breakAt([1, 2], 0),
    ]);
    assert.deepEqual(
      peers.read(),
      settled([
        paragraph('word'),
        block(text(''), link('LI'), text('')),
        block(text(''), link('NK'), text('tail')),
      ])
    );
  });

  it('splitting the quote before the second line of a split keeps its letters', () => {
    const peers = createPeers([paragraph('word'), paragraph('end')]);
    steps(peers, [
      breakAt([0, 0], 2),
      wrapSecondLine,
      (peer) =>
        peer.editor.update.nodes.insert(paragraph('new'), { at: [1, 0] }),
      (peer) => peer.editor.update.nodes.split({ at: [1], position: 1 }),
    ]);
    assert.deepEqual(
      peers.read(),
      settled([
        paragraph('wo'),
        quote(paragraph('new')),
        quote(paragraph('rd')),
        paragraph('end'),
      ])
    );
  });

  for (const order of orders) {
    it(`moving the second line of a split out of a quote keeps a peer's letter typed in it, ${order}`, () => {
      assert.deepEqual(
        race(
          [paragraph('word'), paragraph('tail')],
          (peer) => peer.editor.update.nodes.move({ at: [1, 0], to: [2] }),
          typeAt([1, 0, 0], 1),
          order,
          {
            setup: (peer) => {
              breakAt([0, 0], 2)(peer);
              syncConnectedPeers([peer]);
              wrapSecondLine(peer);
              peer.editor.update.nodes.insert(paragraph('stay'), {
                at: [1, 1],
              });
            },
          }
        ),
        settled([
          paragraph('wo'),
          quote(paragraph('stay')),
          paragraph('rXd'),
          paragraph('tail'),
        ])
      );
    });
  }
});

describe('plitejs/yjs split identity of an inline text cut', () => {
  it("wrapping letters after links whose empty texts a peer's Yjs omits keeps the text after them", () => {
    const peers = createPeers([
      block(
        text('x'),
        link('A'),
        text(''),
        link('B'),
        text(''),
        link('C'),
        text('yyyy'),
        link('D'),
        text('zzzz')
      ),
    ]);
    peers.peer.editor.update.nodes.wrap(
      { children: [], type: 'link' },
      {
        at: {
          anchor: { path: [0, 6], offset: 1 },
          focus: { path: [0, 6], offset: 3 },
        },
        split: true,
      }
    );
    syncConnectedPeers(peers.peers);
    assert.deepEqual(
      peers.read(),
      settled([
        block(
          text('x'),
          link('A'),
          text(''),
          link('B'),
          text(''),
          link('C'),
          text('y'),
          link('yy'),
          text('y'),
          link('D'),
          text('zzzz')
        ),
      ])
    );
  });
});

const wrapInLink =
  (path: number[], from: number, to: number): Edit =>
  (peer) => {
    peer.editor.update.nodes.wrap(
      { children: [], type: 'link' },
      {
        at: { anchor: { path, offset: from }, focus: { path, offset: to } },
        split: true,
      }
    );
  };

const twoLinks = (a: string, b: string) =>
  span(text(''), link(a), text(''), link(b), text(''));

const fillGapsTwice = (peers: ReturnType<typeof createPeers>) => {
  peers.writer.doc.transact(() => {
    const line = getYjsRoot(peers.writer).get(0) as Y.XmlElement;
    for (let index = line.length - 1; index >= 0; index--) {
      if (line.get(index) instanceof Y.XmlText) line.delete(index, 1);
    }
  });
  syncConnectedPeers(peers.peers);
  for (const each of peers.peers) {
    each.editor.update.nodes.set({ align: 'center' }, { at: [0] });
  }
  syncConnectedPeers(peers.peers);
};

const centered = (...children: Descendant[]): Descendant => ({
  align: 'center',
  children,
  type: 'paragraph',
});

describe('plitejs/yjs split identity of nested inline paths', () => {
  const twoSpans = (first: Descendant, second: Descendant) => [
    block(
      text('x'),
      link('A'),
      text(''),
      first,
      text(''),
      second,
      text('tail')
    ),
  ];

  for (const writerId of [1, 2]) {
    const cases = `writer id ${writerId}`;

    it(`M2-a: merging two links inside the first of two spans merges them there, ${cases}`, () => {
      const peers = createPeers(
        twoSpans(twoLinks('AB', 'CD'), twoLinks('EF', 'GH')),
        { writerId }
      );
      peers.peer.editor.update((tx) => {
        tx.nodes.remove({ at: [0, 3, 2] });
        tx.nodes.merge({ at: [0, 3, 2] });
      });
      syncConnectedPeers(peers.peers);
      assert.deepEqual(
        peers.read(),
        settled(
          twoSpans(span(text(''), link('ABCD'), text('')), twoLinks('EF', 'GH'))
        )
      );
    });

    it(`M2-b: wrapping letters inside the first of two spans wraps them there, ${cases}`, () => {
      const peers = createPeers(
        twoSpans(span(text('yyyy')), span(text('zzzz'))),
        { writerId }
      );
      wrapInLink([0, 3, 0], 1, 3)(peers.peer);
      syncConnectedPeers(peers.peers);
      assert.deepEqual(
        peers.read(),
        settled(
          twoSpans(span(text('y'), link('yy'), text('y')), span(text('zzzz')))
        )
      );
    });

    for (const order of orders) {
      for (const wrapper of ['peer', 'writer'] as const) {
        it(`M2-c: wrapping letters of the second of three spans in a link while a teammate types in the first wraps them there, the ${wrapper} wraps, ${cases}, ${order}`, () => {
          const wrap = wrapInLink([0, 3, 0], 1, 3);
          const type = typeAt([0, 1, 0], 1);
          const line = (first: string, second: Descendant[]) => [
            block(
              text('x'),
              span(text(first)),
              text(''),
              span(...second),
              text(''),
              span(text('zzzz')),
              text('tail')
            ),
          ];

          assert.deepEqual(
            race(
              line('aaaa', [text('yyyy')]),
              wrapper === 'writer' ? wrap : type,
              wrapper === 'writer' ? type : wrap,
              order,
              { writerId }
            ),
            settled(line('aXaaa', [text('y'), link('yy'), text('y')]))
          );
        });
      }
    }
  }
});

describe('plitejs/yjs split identity of paths past extra stored texts', () => {
  for (const writerId of [1, 2]) {
    for (const order of orders) {
      const cases = `writer id ${writerId}, ${order}`;
      const deliverRace = (peers: ReturnType<typeof createPeers>) =>
        syncConnectedPeers(
          order === 'writer-first' ? peers.peers : [peers.peer, peers.writer]
        );

      it(`M2-f: joining two links inside the second of two spans, after the two links before the spans were removed, while a peer types in the next line, joins them there, ${cases}`, () => {
        assert.deepEqual(
          race(
            [
              block(
                text(''),
                link('L'),
                text(''),
                link('M'),
                text(''),
                twoLinks('AB', 'CD'),
                text(''),
                twoLinks('EF', 'GH'),
                text('')
              ),
              paragraph('end'),
            ],
            (peer) => {
              peer.editor.update((tx) => {
                tx.nodes.remove({ at: [0, 3, 2] });
                tx.nodes.merge({ at: [0, 3, 2] });
              });
            },
            typeAt([1, 0], 3),
            order,
            {
              setup: (peer) => {
                peer.editor.update.nodes.remove({ at: [0, 1] });
                peer.editor.update.nodes.remove({ at: [0, 1] });
              },
              writerId,
            }
          ),
          settled([
            block(
              text(''),
              twoLinks('AB', 'CD'),
              text(''),
              span(text(''), link('EFGH'), text('')),
              text('')
            ),
            paragraph('endX'),
          ])
        );
      });

      it(`M2-g: wrapping letters of the third span in a link after two teammates filled the same gaps, while one types in the second span, wraps them there, ${cases}`, () => {
        const peers = createPeers(
          [
            block(
              text(''),
              span(text('aaaa')),
              text(''),
              span(text('yyyy')),
              text(''),
              span(text('zzzz')),
              text('')
            ),
          ],
          { writerId }
        );
        fillGapsTwice(peers);
        wrapInLink([0, 5, 0], 1, 3)(peers.writer);
        typeAt([0, 3, 0], 1)(peers.peer);
        deliverRace(peers);

        assert.deepEqual(
          peers.read(),
          settled([
            centered(
              text(''),
              span(text('aaaa')),
              text(''),
              span(text('yXyyy')),
              text(''),
              span(text('z'), link('zz'), text('z')),
              text('')
            ),
          ])
        );
      });

      it(`M2-h: wrapping letters of a span in a link while a teammate types at its end, in a room that stores a second empty text before each text, keeps the letter, ${cases}`, () => {
        const peers = createPeers(
          [block(text(''), span(text('yyyy')), text(''))],
          { writerId }
        );
        const root = getYjsRoot(peers.writer);
        peers.writer.doc.transact(() => {
          const double = (parent: Y.XmlElement) => {
            const children = parent.toArray();
            for (let index = children.length - 1; index >= 0; index--) {
              const child = children[index];
              if (child instanceof Y.XmlElement) double(child);
              else if (parent !== root) parent.insert(index, [new Y.XmlText()]);
            }
          };
          double(root);
        });
        syncConnectedPeers(peers.peers);
        wrapInLink([0, 1, 0], 1, 3)(peers.peer);
        typeAt([0, 1, 0], 4, 'Q')(peers.writer);
        deliverRace(peers);

        assert.deepEqual(
          peers.read(),
          settled([
            block(text(''), span(text('y'), link('yy'), text('yQ')), text('')),
          ])
        );
      });

      it(`moving a link out of a span in a line whose gaps two teammates filled keeps a letter a peer types in the link, ${cases}`, () => {
        const peers = createPeers(
          [
            block(
              text(''),
              twoLinks('AB', 'CD'),
              text(''),
              span(text('EF')),
              text('')
            ),
            paragraph('mid'),
            paragraph('end'),
          ],
          { writerId }
        );
        fillGapsTwice(peers);
        peers.writer.editor.update.nodes.move({ at: [0, 1, 1], to: [2, 1] });
        typeAt([0, 1, 1, 0], 1)(peers.peer);
        deliverRace(peers);

        assert.deepEqual(
          peers.read(),
          settled([
            centered(
              text(''),
              span(text(''), link('CD'), text('')),
              text(''),
              span(text('EF')),
              text('')
            ),
            paragraph('mid'),
            block(text('end'), link('AXB'), text('')),
          ])
        );
      });
    }
  }
});

describe('plitejs/yjs split identity of joined inline elements', () => {
  const boldAt =
    (path: number[], from: number, to: number): Edit =>
    (peer) => {
      peer.editor.update.nodes.set(
        { bold: true },
        {
          at: { anchor: { path, offset: from }, focus: { path, offset: to } },
          match: (node) => NodeApi.isText(node),
          split: true,
        }
      );
    };
  const joinLinks: Edit = (peer) => {
    peer.editor.update((tx) => {
      tx.nodes.remove({ at: [0, 2] });
      tx.nodes.merge({ at: [0, 2] });
    });
  };
  const undoBoldAcrossJoin = (peers: ReturnType<typeof createPeers>) => {
    boldAt([0, 3, 0], 0, 2)(peers.peer);
    syncConnectedPeers(peers.peers);
    joinLinks(peers.writer);
    const traced = getYjsTrace(peers.peer).length;
    syncConnectedPeers(peers.peers);
    const fallbacks = getYjsTrace(peers.peer)
      .slice(traced)
      .flatMap((entry) => (entry.fallback ? [entry.fallback] : []));
    undo(peers.peer);
    syncConnectedPeers(peers.peers);
    return { fallbacks, ...peers.read() };
  };

  for (const writerId of [1, 2]) {
    it(`M2-d: undoing a bold of a link a peer joined to the link before it, across their empty text, leaves the joined link plain, writer id ${writerId}`, () => {
      const peers = createPeers(
        [block(text('x'), link('AB'), text(''), link('CD'), text('y'))],
        { writerId }
      );

      assert.deepEqual(undoBoldAcrossJoin(peers), {
        fallbacks: [],
        ...settled([block(text('x'), link('ABCD'), text('y'))]),
      });
    });

    it(`M2-e: undoing a bold of the second half of a split link a peer joined back leaves the link plain, writer id ${writerId}`, () => {
      const peers = createPeers([block(text('x'), link('ABCD'), text('z'))], {
        writerId,
      });
      peers.writer.editor.update.nodes.split({
        always: true,
        at: { offset: 2, path: [0, 1, 0] },
        match: (node) => NodeApi.isElement(node) && node.type === 'link',
      });
      syncConnectedPeers(peers.peers);

      assert.deepEqual(undoBoldAcrossJoin(peers), {
        fallbacks: [],
        ...settled([block(text('x'), link('ABCD'), text('z'))]),
      });
    });
  }
});

describe('plitejs/yjs split identity of an Enter read back from what moved', () => {
  const fallbacksOf = (peer: Peer, from: number) =>
    getYjsTrace(peer)
      .slice(from)
      .flatMap((entry) => (entry.fallback ? [entry.fallback] : []));

  for (const writerId of [1, 2]) {
    for (const order of orders) {
      const cases = `writer id ${writerId}, ${order}`;

      it(`M3-c: a second Enter before a moved tail keeps a peer's caret and the writer's cursor in the tail's line, and the peer's undo of a letter typed before that Enter removes it, ${cases}`, () => {
        const peers = createPeers(wordLinkTail(), {
          awareness: true,
          writerId,
        });
        breakAt([0, 0], 2)(peers.writer);
        syncConnectedPeers(peers.peers);
        peers.peer.editor.update.selection.set(
          caret({ path: [1, 2], offset: 2 })
        );
        typeAt([1, 0], 1)(peers.peer);
        breakAt([1, 2], 0)(peers.writer);
        runEditorYjsUpdate(peers.writer.editor, (actions) =>
          actions.sendSelection(caret({ path: [2, 0], offset: 0 }))
        );
        const sent = peers.awarenessOf(writerId).getLocalState()?.selection;
        const traced = getYjsTrace(peers.peer).length;
        if (order === 'writer-first') {
          deliver(peers.writer, peers.peer);
          deliver(peers.peer, peers.writer);
        } else {
          deliver(peers.peer, peers.writer);
          deliver(peers.writer, peers.peer);
        }
        peers
          .awarenessOf(peers.peerId)
          .setRemoteState(writerId, { selection: sent });
        const moved = {
          caret: readPeerSelection(peers.peer),
          cursor: getYjsRemoteCursors(peers.peer)[0]?.selection,
          fallbacks: fallbacksOf(peers.peer, traced),
        };
        undo(peers.peer);
        syncConnectedPeers(peers.peers);

        assert.deepEqual(
          { ...moved, ...peers.read() },
          {
            caret: caret({ path: [2, 0], offset: 2 }),
            cursor: {
              anchor: { path: [2, 0], offset: 0 },
              focus: { path: [2, 0], offset: 0 },
            },
            fallbacks: [],
            ...settled([
              paragraph('wo'),
              block(text('rd'), link('LINK'), text('')),
              paragraph('tail'),
            ]),
          }
        );
      });
    }
  }
});

describe('plitejs/yjs split identity of an undone Enter inside a link', () => {
  const linkTail = () => [block(text(''), link('ab'), text('tail'))];
  const stored = (peer: Peer) => {
    const counts = { emptyTexts: 0, hiddenEmptyTexts: 0, placeholders: 0 };
    const walk = (node: Y.XmlElement) => {
      for (const child of node.toArray()) {
        if (child instanceof Y.XmlText) {
          if (
            child.length > 0 ||
            child.getAttribute(YJS_CUT_SOURCE_KEY) !== undefined
          ) {
            continue;
          }
          if (child.getAttribute(YJS_HIDDEN_KEY)) counts.hiddenEmptyTexts += 1;
          else counts.emptyTexts += 1;
        } else if (child instanceof Y.XmlElement) {
          if (child.getAttribute(YJS_VIRTUAL_PLACEHOLDER_KEY)) {
            counts.placeholders += 1;
          }
          walk(child);
        }
      }
    };
    walk(getYjsRoot(peer));
    return counts;
  };

  const boldTail: Edit = (peer) => {
    peer.editor.update.nodes.set(
      { bold: true },
      {
        at: {
          anchor: { path: [1, 2], offset: 0 },
          focus: { path: [1, 2], offset: 4 },
        },
        match: (node) => NodeApi.isText(node),
        split: true,
      }
    );
  };

  for (const writerId of [1, 2]) {
    it(`M5-b: ten Enters at a link's end inside it, each merged back and both undone, store no more empty texts, hidden empty texts or placeholders than next, writer id ${writerId}`, () => {
      const peers = createPeers(linkTail(), { writerId });
      for (let cycle = 0; cycle < 10; cycle += 1) {
        for (const edit of [
          breakAt([0, 1, 0], 2),
          joinSecondLine,
          undo,
          undo,
        ]) {
          edit(peers.writer);
          syncConnectedPeers(peers.peers);
        }
      }
      const { emptyTexts, hiddenEmptyTexts, placeholders } = stored(
        peers.writer
      );

      assert.deepEqual(
        {
          ...peers.read(),
          stored: {
            emptyTexts: emptyTexts <= 11,
            hiddenEmptyTexts: hiddenEmptyTexts <= 10,
            placeholders: placeholders <= 1,
          },
        },
        {
          ...settled(linkTail()),
          stored: {
            emptyTexts: true,
            hiddenEmptyTexts: true,
            placeholders: true,
          },
        }
      );
    });

    it(`M5-h: twelve Enters at a link's end inside a span an earlier Enter moved, each undone, store what the first cycle stored, writer id ${writerId}`, () => {
      const peers = createPeers(
        [
          block(
            text('head'),
            span(text(''), link('ab'), text('tail')),
            text('after')
          ),
        ],
        { writerId }
      );
      breakAt([0, 0], 4)(peers.writer);
      syncConnectedPeers(peers.peers);
      const cycle = () => {
        for (const edit of [breakAt([1, 1, 1, 0], 2), undo]) {
          edit(peers.writer);
          syncConnectedPeers(peers.peers);
        }
      };
      cycle();
      const first = stored(peers.writer);
      for (let count = 1; count < 12; count += 1) cycle();

      assert.deepEqual(
        { ...peers.read(), stored: stored(peers.writer) },
        {
          ...settled([
            paragraph('head'),
            block(
              text(''),
              span(text(''), link('ab'), text('tail')),
              text('after')
            ),
          ]),
          stored: first,
        }
      );
    });

    for (const order of orders) {
      const cases = `writer id ${writerId}, ${order}`;

      it(`M5-e: the teammate's undo of a bold on the tail after the writer undid an Enter at a link's end inside it leaves it plain, ${cases}`, () => {
        const peers = createPeers(linkTail(), { writerId });
        breakAt([0, 1, 0], 2)(peers.writer);
        syncConnectedPeers(peers.peers);
        boldTail(peers.peer);
        syncConnectedPeers(peers.peers);
        undo(peers.writer);
        syncConnectedPeers(
          order === 'writer-first' ? peers.peers : [peers.peer, peers.writer]
        );
        undo(peers.peer);
        syncConnectedPeers(peers.peers);

        assert.deepEqual(peers.read(), settled(linkTail()));
      });

      it(`M5-g: the teammate's undo of a bold before a span after the writer undid an Enter at a link's end inside the span leaves it plain, ${cases}`, () => {
        const start = () => [
          block(
            text('w'),
            span(text(''), link('ab'), text('cd')),
            text('tail')
          ),
        ];
        const peers = createPeers(start(), { writerId });
        breakAt([0, 1, 1, 0], 2)(peers.writer);
        syncConnectedPeers(peers.peers);
        peers.peer.editor.update.nodes.set(
          { bold: true },
          {
            at: {
              anchor: { path: [0, 0], offset: 0 },
              focus: { path: [0, 0], offset: 1 },
            },
            match: (node) => NodeApi.isText(node),
          }
        );
        syncConnectedPeers(peers.peers);
        undo(peers.writer);
        syncConnectedPeers(
          order === 'writer-first' ? peers.peers : [peers.peer, peers.writer]
        );
        undo(peers.peer);
        syncConnectedPeers(peers.peers);

        assert.deepEqual(peers.read(), settled(start()));
      });

      it(`the teammate's undo of a letter typed into the copied link, after the writer undid the Enter inside the link, removes it, ${cases}`, () => {
        const start = () => [block(text('w'), link('aa'), text('tail'))];
        const peers = createPeers(start(), { writerId });
        const delivery =
          order === 'writer-first' ? peers.peers : [peers.peer, peers.writer];
        breakAt([0, 1, 0], 2)(peers.writer);
        syncConnectedPeers(peers.peers);
        typeAt([1, 1, 0], 0)(peers.peer);
        syncConnectedPeers(peers.peers);
        undo(peers.writer);
        syncConnectedPeers(delivery);
        undo(peers.peer);
        syncConnectedPeers(delivery);

        assert.deepEqual(peers.read(), settled(start()));
      });

      it(`the teammate's undo of a letter typed into the copied link inside a copied span, after the writer undid the Enter inside the link, removes it, ${cases}`, () => {
        const start = () => [
          block(
            text('w'),
            span(text('s'), link('aa'), text('cd')),
            text('tail')
          ),
        ];
        const peers = createPeers(start(), { writerId });
        const delivery =
          order === 'writer-first' ? peers.peers : [peers.peer, peers.writer];
        breakAt([0, 1, 1, 0], 2)(peers.writer);
        syncConnectedPeers(delivery);
        typeAt([1, 1, 1, 0], 0)(peers.peer);
        syncConnectedPeers(delivery);
        undo(peers.writer);
        syncConnectedPeers(delivery);
        undo(peers.peer);
        syncConnectedPeers(delivery);

        assert.deepEqual(peers.read(), settled(start()));
      });

      it(`a letter the teammate types after a link both peers split at its end stays when the writer splits before the link, ${cases}`, () => {
        const peers = createPeers([block(text('a'), link('L'), text('b'))], {
          writerId,
        });
        const delivery =
          order === 'writer-first' ? peers.peers : [peers.peer, peers.writer];
        breakAt([0, 1, 0], 1)(peers.writer);
        breakAt([0, 1, 0], 1)(peers.peer);
        syncConnectedPeers(delivery);
        typeAt([0, 2], 0)(peers.peer);
        breakAt([0, 0], 1)(peers.writer);
        syncConnectedPeers(delivery);

        assert.deepEqual(
          peers.read(),
          settled([
            block(text('a')),
            block(text(''), link('L'), text('X')),
            block(text(''), link(''), text('')),
            block(text(''), link(''), text('b')),
          ])
        );
      });

      it(`a letter the teammate types after a link stays when the writer's Backspace joins the next line to it, ${cases}`, () => {
        const peers = createPeers(
          [block(text('a'), link('L'), text('')), block(text('b'))],
          { writerId }
        );
        const delivery =
          order === 'writer-first' ? peers.peers : [peers.peer, peers.writer];
        typeAt([0, 2], 0)(peers.peer);
        peers.writer.editor.update((tx) => {
          tx.selection.set(caret({ path: [1, 0], offset: 0 }));
          tx.text.deleteBackward({ unit: 'character' });
        });
        syncConnectedPeers(delivery);

        assert.deepEqual(
          peers.read(),
          settled([block(text('a'), link('L'), text('Xb'))])
        );
      });

      it(`a letter the teammate types before a link that starts the next line stays when the writer joins that line, ${cases}`, () => {
        const peers = createPeers(
          [block(text('a')), block(text(''), link('L'), text('b'))],
          { writerId }
        );
        const delivery =
          order === 'writer-first' ? peers.peers : [peers.peer, peers.writer];
        typeAt([1, 0], 0)(peers.peer);
        joinSecondLine(peers.writer);
        syncConnectedPeers(delivery);

        assert.deepEqual(
          peers.read(),
          settled([block(text('aX'), link('L'), text('b'))])
        );
      });

      it(`a letter the teammate types between two links stays when the writer joins the lines they end and start, ${cases}`, () => {
        const peers = createPeers(
          [
            block(text('a'), link('L'), text('')),
            block(text(''), link('M'), text('b')),
          ],
          { writerId }
        );
        const delivery =
          order === 'writer-first' ? peers.peers : [peers.peer, peers.writer];
        typeAt([0, 2], 0)(peers.peer);
        joinSecondLine(peers.writer);
        syncConnectedPeers(delivery);

        assert.deepEqual(
          peers.read(),
          settled([
            block(text('a'), link('L'), text('X'), link('M'), text('b')),
          ])
        );
      });

      it(`a letter the teammate types after a link the writer removed stays when the writer then presses Enter at the line's start, ${cases}`, () => {
        const peers = createPeers(
          [block(text(''), link('L'), text(''), link('M'), text('b'))],
          { writerId }
        );
        const delivery =
          order === 'writer-first' ? peers.peers : [peers.peer, peers.writer];
        peers.writer.editor.update((tx) => tx.nodes.remove({ at: [0, 1] }));
        breakAt([0, 0], 0)(peers.writer);
        typeAt([0, 2], 0)(peers.peer);
        syncConnectedPeers(delivery);

        assert.deepEqual(
          peers.read(),
          settled([block(text('')), block(text('X'), link('M'), text('b'))])
        );
      });
    }
  }
});
