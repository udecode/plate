import * as Y from 'yjs';

import { AuthoredPlugin } from '../../../authored';
import { property, schema, target } from '../../../core';
import { YjsPlugin } from '../../../yjs/react';
import { createEditor } from '../../editor';
import { definePlugin } from '../../plugin';
import { ElementIdPlugin } from './ElementIdPlugin';

type Node = Readonly<{
  authored?: ReadonlyArray<Record<string, unknown>>;
  children?: readonly Node[];
  id?: string;
  text?: string;
  type?: string;
}>;
type Decision = Readonly<{ action: 'accept' | 'reject'; changes: string[] }>;

const QuotePlugin = definePlugin('quote', {
  schema: {
    element: { content: schema.content.type('paragraph', { min: 1 }) },
  },
});

const PairPlugin = definePlugin('pair', {
  schema: {
    element: { content: schema.content.type('paragraph', { min: 2 }) },
  },
});

/** One id source for every peer, as nanoid is, that counts its calls. */
const idSource = () => {
  let calls = 0;

  return {
    calls: () => calls,
    generateId: () => `g${(calls += 1)}`,
  };
};
type IdSource = ReturnType<typeof idSource>;

type Setup = Readonly<{ authored?: boolean }>;

const initialValueOf = (value: unknown) =>
  value === undefined ? {} : { initialValue: structuredClone(value) as never };

const editorOf = (
  ids: IdSource,
  options: Setup & Readonly<{ value?: unknown }> = {}
) =>
  createEditor({
    userId: 'zed',
    ...initialValueOf(options.value),
    plugins: [
      QuotePlugin,
      PairPlugin,
      ElementIdPlugin.configure({
        initialState: { generateId: ids.generateId },
      }),
      ...(options.authored === false ? [] : [AuthoredPlugin]),
    ],
  });
type Reader = ReturnType<typeof editorOf>;

const peerOf = (
  ids: IdSource,
  doc: Y.Doc,
  options: Setup & Readonly<{ seed?: boolean; value?: unknown }> = {}
) =>
  createEditor({
    userId: 'zed',
    ...initialValueOf(options.value),
    plugins: [
      QuotePlugin,
      PairPlugin,
      ElementIdPlugin.configure({
        initialState: { generateId: ids.generateId },
      }),
      ...(options.authored === false ? [] : [AuthoredPlugin]),
      YjsPlugin.create({
        doc,
        initialReady: true,
        ...(options.seed ? { seed: true } : {}),
      }),
    ],
  });
type Peer = ReturnType<typeof peerOf>;

const mark = (kind: string, change: string) => ({
  at: 1,
  author: change,
  change,
  kind,
});
const whole = (node: Node, kind: string, change: string): Node => ({
  ...node,
  authored: [...(node.authored ?? []), mark(kind, change)],
  ...(node.children
    ? { children: node.children.map((child) => whole(child, kind, change)) }
    : {}),
});
const p = (text: string, id = `p-${text}`) => ({
  children: [{ text }],
  id,
  type: 'paragraph',
});
const quote = (id: string, ...children: Node[]): Node => ({
  children,
  id,
  type: 'quote',
});
const pair = (id: string, ...children: Node[]): Node => ({
  children,
  id,
  type: 'pair',
});
const accept = (change: string): Decision => ({
  action: 'accept',
  changes: [change],
});
const reject = (change: string): Decision => ({
  action: 'reject',
  changes: [change],
});
const decide = (peer: Peer, decisions: Decision | readonly Decision[]) =>
  peer.update.authored.decide(
    [decisions].flat().map(({ action, changes }) => ({
      action,
      changes: changes.map((id) => {
        const change = peer.read.authored.change(id);

        if (!change) throw new Error(`${id} is not a change this peer holds`);

        return change;
      }),
    }))
  );

const idsIn = (value: ReturnType<Reader['read']['value']>) => {
  const found: Array<Readonly<{ id: unknown; path: number[]; root: string }>> =
    [];
  const visit = (nodes: readonly Node[], root: string, prefix: number[]) => {
    nodes.forEach((node, index) => {
      if (!node.children) return;
      found.push({ id: node.id, path: [...prefix, index], root });
      visit(node.children, root, [...prefix, index]);
    });
  };

  visit(value.children, 'main', []);
  for (const [root, children] of Object.entries(value.roots ?? {})) {
    visit(children, root, []);
  }

  return found;
};
const textOf = (node: Node): string =>
  node.children ? node.children.map(textOf).join('') : (node.text ?? '');
const blocksOf = (peer: Reader) =>
  peer.read.value().children as readonly Node[];

const yElementOf = (doc: Y.Doc, text: string) => {
  const visit = (element: Y.XmlElement): Y.XmlElement | undefined => {
    for (const child of element.toArray()) {
      if (!(child instanceof Y.XmlElement)) continue;
      if (
        child
          .toArray()
          .filter((part) => part instanceof Y.XmlText)
          .join('') === text
      ) {
        return child;
      }

      const found = visit(child);

      if (found) return found;
    }

    return undefined;
  };

  return visit(doc.get('document', Y.XmlElement));
};

const roomOf = (start: readonly Node[], setup: Setup = {}) => {
  const ids = idSource();
  const docs = [new Y.Doc(), new Y.Doc(), new Y.Doc()];

  // Fixed client ids keep the room's order of concurrent inserts the same on
  // every run.
  docs.forEach((doc, index) => {
    doc.clientID = index + 1;
  });

  const peers = [peerOf(ids, docs[0], { ...setup, seed: true, value: start })];
  const seed = Y.encodeStateAsUpdate(docs[0]);

  Y.applyUpdate(docs[1], seed);
  Y.applyUpdate(docs[2], seed);
  peers.push(peerOf(ids, docs[1], setup), peerOf(ids, docs[2], setup));
  for (const peer of peers) peer.plugin(ElementIdPlugin).read.entry('warm');

  const deliver = (from: number, to: number) =>
    Y.applyUpdate(
      docs[to],
      Y.encodeStateAsUpdate(docs[from], Y.encodeStateVector(docs[to]))
    );
  const settle = () => {
    for (let round = 0; round < 2; round++) {
      for (const from of [0, 1, 2]) {
        for (const to of [0, 1, 2]) if (from !== to) deliver(from, to);
      }
    }
  };

  return { deliver, docs, ids, peers, settle, setup };
};
type Room = ReturnType<typeof roomOf>;

const raced = (
  start: readonly Node[],
  decisions: readonly [Decision, Decision],
  order: 'one first' | 'two first',
  edit?: (peer: Peer) => void
) => {
  const room = roomOf(start);
  const [first, second] = order === 'one first' ? [0, 1] : [1, 0];

  for (const [index, decision] of decisions.entries()) {
    decide(room.peers[index], decision);
  }
  edit?.(room.peers[2]);
  if (edit) {
    room.deliver(2, first);
    room.deliver(2, second);
  }
  room.deliver(first, 2);
  room.deliver(second, 2);
  room.deliver(first, second);
  room.deliver(second, first);
  room.settle();

  return room;
};

const looksUp = (editor: Reader) =>
  idsIn(editor.read.value()).every(({ id, path, root }) => {
    const elementId = editor.plugin(ElementIdPlugin);
    const entry = elementId.read.entry(String(id));

    return (
      entry !== undefined &&
      entry.root === root &&
      `${entry.path}` === `${path}` &&
      elementId.read.id(entry.key) === id
    );
  });

const merged = (room: Room) => {
  const values = room.peers.map((peer) => peer.read.value());
  const [value] = values;
  const reloads = room.peers.map((peer) =>
    editorOf(room.ids, {
      ...room.setup,
      value: {
        document: peer.read.value(),
        schema: peer.read.schema.identity(),
      },
    })
  );

  return {
    editors: values,
    lookups: [...room.peers, ...reloads].map(looksUp),
    reloads: reloads.map((reload) => reload.read.value()),
    repeated: idsIn(value).filter(
      ({ id }, index, all) => all.findIndex((other) => other.id === id) < index
    ),
    rooms: room.docs.map((doc) => {
      const copy = new Y.Doc();

      Y.applyUpdate(copy, Y.encodeStateAsUpdate(doc));

      return peerOf(room.ids, copy, room.setup).read.value();
    }),
    states: room.peers.map((peer) => peer.api.yjs.admissionStatus().state),
  };
};
const expectMerged = (room: Room, label: string) => {
  const outcome = merged(room);
  const [value] = outcome.editors;

  expect({ label, ...outcome }).toEqual({
    editors: [value, value, value],
    label,
    lookups: [true, true, true, true, true, true],
    reloads: [value, value, value],
    repeated: [],
    rooms: [value, value, value],
    states: ['ready', 'ready', 'ready'],
  });

  return value;
};

const orders = ['one first', 'two first'] as const;
const quoteOnlyLine = [quote('q', whole(p('a'), 'delete', 'D'))];
/** Both accepts remove the quote and build the root's spare line, so the room gets two. */
const wholeQuote = [whole(quote('q', p('a')), 'delete', 'D')];

describe('ElementIdPlugin in a shared room', () => {
  for (const [name, start, decisions] of [
    [
      'both accept the deletion of a quote’s only line',
      quoteOnlyLine,
      [accept('D'), accept('D')],
    ],
    [
      'both accept the deletion of a quote’s two lines',
      [quote('q', whole(p('a'), 'delete', 'D'), whole(p('b'), 'delete', 'D'))],
      [accept('D'), accept('D')],
    ],
    [
      'one accepts and the other rejects the deletion of a quote’s only line',
      quoteOnlyLine,
      [accept('D'), reject('D')],
    ],
    [
      'both accept the deletion of a whole quote',
      wholeQuote,
      [accept('D'), accept('D')],
    ],
  ] as const) {
    it(`gives every editor and every room one document of unique ids when two peers decide at once and ${name}, in both delivery orders and with a third peer`, () => {
      for (const order of orders) {
        expectMerged(raced(start, decisions, order), order);
      }
    });
  }

  it('gives two blocks that two peers each set to one id offline distinct ids, written onto the elements the room holds, by event import and by whole-document import', () => {
    for (const imported of ['event', 'whole document'] as const) {
      const room = roomOf([p('a', 'a'), p('b', 'b'), p('c', 'c')]);
      const [first, second] = room.peers;

      first.update((tx) => tx.nodes.set({ id: 'x' }, { at: [0] }));
      if (imported === 'whole document') {
        first.update((tx) => {
          tx.history.newBatch();
          tx.nodes.move({ at: [2], to: [1] });
        });
      }
      second.update((tx) => tx.nodes.set({ id: 'x' }, { at: [1] }));

      const held = yElementOf(room.docs[1], 'b');

      room.deliver(0, 1);

      const renamed = blocksOf(second).find((node) => textOf(node) === 'b');

      expect({
        imported,
        renamed: renamed?.id === 'x',
        room: yElementOf(room.docs[1], 'b') === held,
        written: held?.getAttribute('id') === renamed?.id,
      }).toEqual({ imported, renamed: false, room: true, written: true });

      room.settle();
      expectMerged(room, imported);
    }
  });

  it('keeps ids unique through an undo and a redo on a peer whose own built line the import renamed', () => {
    const room = roomOf(wholeQuote);
    const [first, second] = room.peers;

    decide(first, accept('D'));
    decide(second, accept('D'));

    const own = blocksOf(second)[0];
    const held = yElementOf(room.docs[1], '');

    room.deliver(0, 1);

    expect(held?.getAttribute('id')).not.toBe(own.id);
    expect(held?.getAttribute('id')).toBe(
      second.plugin(ElementIdPlugin).read.id(second.key([1]) as never)
    );

    second.api.history.undo();
    room.settle();
    expectMerged(room, 'undo');

    second.api.history.redo();
    room.settle();
    expectMerged(room, 'redo');
  });

  it('keeps ids unique when a peer moves its built line out of its quote, deletes it, receives the other accept and undoes the deletion', () => {
    const room = roomOf([quote('q', whole(p('a'), 'delete', 'D')), p('u')]);
    const [first, second] = room.peers;

    decide(first, accept('D'));
    decide(second, accept('D'));
    first.update((tx) => tx.nodes.move({ at: [0, 0], to: [2] }));
    first.update((tx) => {
      tx.history.newBatch();
      tx.nodes.remove({ at: [2] });
    });
    room.deliver(1, 0);
    first.api.history.undo();
    room.settle();

    expect(blocksOf(first).map(textOf)).toEqual(['', 'u', '']);
    expectMerged(room, 'undo');
  });

  it('keeps a letter typed into the built line before the other accept arrives, with unique ids', () => {
    for (const start of [quoteOnlyLine, wholeQuote]) {
      for (const order of orders) {
        const room = roomOf(start);
        const [first, second] = room.peers;

        decide(first, accept('D'));
        decide(second, accept('D'));
        first.update((tx) =>
          tx.text.insert('x', {
            at: {
              offset: 0,
              path: start === wholeQuote ? [0, 0] : [0, 0, 0],
            },
          })
        );
        if (order === 'one first') room.deliver(0, 1);
        room.deliver(1, 0);
        room.settle();

        expect(blocksOf(first).map(textOf).join('')).toBe('x');
        expectMerged(room, order);
      }
    }
  });

  it('gives two blocks that two peers without the authored plugin insert with one id distinct ids', () => {
    const room = roomOf([p('a', 'a')], { authored: false });
    const [first, second] = room.peers;

    first.update((tx) => tx.nodes.insert(p('x', 'n'), { at: [1] }));
    second.update((tx) => tx.nodes.insert(p('y', 'n'), { at: [1] }));
    room.settle();

    expect(blocksOf(first).map(textOf)).toEqual(['a', 'x', 'y']);
    expectMerged(room, 'inserted');
  });

  it('writes the line every editor built into a container the room still holds a line of, when a peer types into it', () => {
    for (const order of orders) {
      const room = raced(
        [
          pair(
            'c',
            whole(p('a'), 'delete', 'D1'),
            whole(p('b'), 'delete', 'D2'),
            p('k')
          ),
        ],
        [accept('D1'), accept('D2')],
        order
      );
      const typist = room.peers[2];
      const built = blocksOf(typist)[0].children!.findIndex(
        (line) => textOf(line) === ''
      );

      const held = room.docs.map((doc) =>
        doc.get('document', Y.XmlElement).get(0)
      );

      typist.update((tx) =>
        tx.text.insert('x', { at: { offset: 0, path: [0, built, 0] } })
      );
      room.settle();

      const [container] = blocksOf(typist);

      expect({
        blocks: blocksOf(typist).length,
        held: room.docs.map(
          (doc, index) =>
            doc.get('document', Y.XmlElement).get(0) === held[index]
        ),
        lines: container.children!.map(textOf).sort(),
        order,
      }).toEqual({
        blocks: 1,
        held: [true, true, true],
        lines: ['k', 'x'],
        order,
      });
      expectMerged(room, order);
    }
  });

  it('leaves every room equal to the editors when the repair renames a quote whose line only the editors hold', () => {
    const emptied = quote(
      'q',
      whole(p('a'), 'delete', 'D1'),
      whole(p('b'), 'delete', 'D2')
    );

    for (const order of orders) {
      const room = raced(
        [p('r', 'r'), emptied],
        [accept('D1'), accept('D2')],
        order
      );
      const [first, second] = room.peers;

      first.update((tx) => tx.nodes.set({ id: 'z' }, { at: [0] }));
      second.update((tx) => tx.nodes.set({ id: 'z' }, { at: [1] }));
      room.settle();

      expect(blocksOf(first).map(({ id }) => id === 'z')).toEqual([
        true,
        false,
      ]);
      expectMerged(room, order);
    }
  });

  it('leaves every room equal to the editors when the repair renames a line only the editors hold', () => {
    const start = [
      p('r', 'r'),
      quote('q', whole(p('a'), 'delete', 'D1'), whole(p('b'), 'delete', 'D2')),
    ];
    const decisions = [accept('D1'), accept('D2')] as const;

    for (const order of orders) {
      const built = blocksOf(raced(start, decisions, order).peers[0])[1]
        .children![0].id!;
      const room = raced(start, decisions, order, (peer) =>
        peer.update((tx) => tx.nodes.insert(p('n', built), { at: [0] }))
      );
      const [, line] = idsIn(room.peers[0].read.value()).filter(
        ({ path }) => path.length === 2
      );

      expect({
        inserted: blocksOf(room.peers[0])[0].id,
        line: line?.id,
      }).not.toEqual({ inserted: built, line: built });
      expect(blocksOf(room.peers[0])[0].id).toBe(built);
      expectMerged(room, order);
    }
  });

  it('keeps an editor whose id is not unique out of a room whose id is', () => {
    const idPlugin = (unique: boolean) => (ids: IdSource) =>
      definePlugin('elementId', {
        schema: {
          properties: {
            id: schema.elementProperty(
              property.string({ generate: ids.generateId }),
              {
                role: 'metadata',
                target: target.group('element'),
                typeChange: 'preserve-if-allowed',
                ...(unique ? { unique: true } : {}),
              }
            ),
          },
        },
      });
    const joined = (unique: boolean) => {
      const ids = idSource();
      const doc = new Y.Doc();

      Y.applyUpdate(doc, Y.encodeStateAsUpdate(roomOf([p('a', 'a')]).docs[0]));

      try {
        return createEditor({
          userId: 'zed',
          plugins: [
            QuotePlugin,
            PairPlugin,
            idPlugin(unique)(ids),
            AuthoredPlugin,
            YjsPlugin.create({ doc, initialReady: true }),
          ],
        }).api.yjs.admissionStatus().state;
      } catch (error) {
        return (error as Error).message;
      }
    };

    expect({ unique: joined(true), without: joined(false) }).toEqual({
      unique: 'ready',
      without: expect.stringContaining('Yjs derived schema mismatch'),
    });
  });
});

describe('ElementIdPlugin deciding suggestions that change ids', () => {
  type Schedule = Readonly<{
    decisions: readonly Decision[];
    record: () => Room;
  }>;

  const propose = (
    peer: Peer,
    change: string,
    at: readonly number[],
    id: string,
    letter: string
  ) =>
    peer.update((tx) => {
      tx.authored.propose({ changeId: change });
      tx.nodes.set({ id }, { at: [...at] });
      tx.text.insert(letter, { at: { offset: 0, path: [...at, 0] } });
    });
  const renamedCopy = () => {
    const room = roomOf(wholeQuote);
    const [first, second] = room.peers;

    decide(first, accept('D'));
    decide(second, accept('D'));
    propose(second, 'F', [0], 'h', 'f');

    return room;
  };
  const schedules: Record<string, Schedule> = {
    'Astra’s round 2': {
      decisions: [reject('X'), reject('Y')],
      record: () => {
        const room = roomOf([p('a', 'a'), p('b', 'b')]);
        const [first] = room.peers;

        propose(first, 'X', [0], 'c', 'x');
        propose(first, 'Y', [1], 'a', 'y');
        room.settle();

        return room;
      },
    },
    'Opus’s round 2': {
      decisions: [reject('F'), accept('R')],
      record: () => {
        const room = renamedCopy();

        room.settle();

        const kept = blocksOf(room.peers[2]).findIndex(
          (node) => textOf(node) === ''
        );

        room.peers[2].update((tx) => {
          tx.authored.propose({ changeId: 'R' });
          tx.nodes.remove({ at: [kept] });
        });
        room.settle();

        return room;
      },
    },
    'Sol’s round 1': {
      decisions: [reject('F')],
      record: () => {
        const room = renamedCopy();

        room.settle();

        return room;
      },
    },
    'Sol’s round 2': {
      decisions: [reject('F'), accept('R')],
      record: () => {
        const room = renamedCopy();

        room.peers[0].update((tx) => {
          tx.authored.propose({ changeId: 'R' });
          tx.nodes.remove({ at: [0] });
        });
        room.settle();

        return room;
      },
    },
  };

  for (const [name, { decisions, record }] of Object.entries(schedules)) {
    it(`gives ${name} schedule the same document and unique ids when its changes are decided in one order, the other or together, and calls no generator in a decide commit`, () => {
      const decided = (steps: ReadonlyArray<readonly Decision[]>) => {
        const room = record();
        const reviewer = room.peers[0];
        const before = room.ids.calls();

        for (const step of steps) decide(reviewer, step);

        const generated = room.ids.calls() - before;

        room.settle();

        return {
          children: expectMerged(room, name).children,
          generated,
        };
      };
      const together = decided([decisions]);

      expect({
        inOrder: decided(decisions.map((decision) => [decision])),
        reversed: decided(decisions.map((decision) => [decision]).reverse()),
      }).toEqual({ inOrder: together, reversed: together });
      expect(together.generated).toBe(0);
    });
  }
});
