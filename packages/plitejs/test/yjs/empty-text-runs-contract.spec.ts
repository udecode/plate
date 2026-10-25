import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isDeepStrictEqual } from 'node:util';

import * as Y from 'yjs';

import { createAuthoredPlugin } from '../../src/authored/authored';
import { readCoreWork, resetCoreWork } from '../../src/core/work';
import { history } from '../../src/history';
import {
  createEditor,
  type Descendant,
  defineEditorSchema,
  property,
  schema,
  target,
} from '../../src/index';
import { yjs } from '../../src/yjs/core/plugin';
import { FakeAwareness } from './support/collaboration';

const inlineContent = schema.content.any(
  [schema.content.text(), schema.content.type('link')],
  { default: 'text', min: 1 }
);
const link = {
  content: schema.content.text({ default: 'text', min: 1 }),
  inline: true,
};
const ref = schema.elementProperty('ref', property.string(), {
  split: 'drop',
  target: target.type('link'),
});
const Paragraphs = defineEditorSchema('empty-text-runs:paragraphs', {
  elements: { link, paragraph: { content: inlineContent } },
  properties: [ref],
  root: schema.content.types(['paragraph'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'preserve',
});
const Sections = defineEditorSchema('empty-text-runs:sections', {
  elements: {
    link,
    paragraph: { content: inlineContent },
    section: {
      content: schema.content.types(['paragraph'], {
        default: { type: 'paragraph' },
        min: 1,
      }),
    },
  },
  properties: [ref],
  root: schema.content.types(['paragraph', 'section'], {
    default: { type: 'section' },
    min: 1,
  }),
  unknown: 'preserve',
});
const Captions = defineEditorSchema('empty-text-runs:captions', {
  elements: {
    link,
    media: {
      content: schema.content.text({ default: 'text', min: 1 }),
      contentRoots: {
        caption: {
          content: schema.content.type('paragraph', {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
    },
    paragraph: { content: inlineContent },
  },
  properties: [ref],
  root: schema.content.types(['paragraph', 'media'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'preserve',
});
type RoomSchema = typeof Paragraphs | typeof Sections | typeof Captions;

const paragraph = (...children: Descendant[]) => ({
  children,
  type: 'paragraph',
});
const linked = (before: string, after: string) =>
  paragraph(
    { text: before },
    { children: [{ text: 'ab' }], ref: 'r1', type: 'link' },
    { text: after }
  );
const section = (...children: Descendant[]) => ({
  children,
  type: 'section',
});

let changeIds = 0;
const peerOf = (
  roomSchema: RoomSchema,
  clientId: number,
  children: readonly Descendant[],
  update?: Uint8Array
) => {
  const doc = new Y.Doc();
  const author = `peer-${clientId}`;
  const awareness = new FakeAwareness(clientId);

  awareness.attachDocument(doc);
  if (update) Y.applyUpdate(doc, update);

  const editor = createEditor({
    initialValue: { children: [...children] },
    plugins: [
      roomSchema,
      history(),
      createAuthoredPlugin({
        authorId: author,
        createChangeId: () => {
          changeIds += 1;

          return `${author}:${changeIds}`;
        },
        now: () => 1,
      }),
      yjs({
        awareness,
        doc,
        initialReady: true,
        ...(update ? {} : { seed: true }),
      }),
    ],
  });

  return { awareness, doc, editor };
};

type Room = ReturnType<typeof openRoom>;

/** Ed loads Alice's room, and his load's own writes reach Alice only on `sync`. */
const openRoom = (
  children: readonly Descendant[],
  roomSchema: RoomSchema = Paragraphs
) => {
  const alice = peerOf(roomSchema, 1, children);
  const ed = peerOf(roomSchema, 2, children, Y.encodeStateAsUpdate(alice.doc));

  return { alice, ed, roomSchema };
};
const sync = ({ alice, ed }: Room) => {
  Y.applyUpdate(
    ed.doc,
    Y.encodeStateAsUpdate(alice.doc, Y.encodeStateVector(ed.doc))
  );
  Y.applyUpdate(
    alice.doc,
    Y.encodeStateAsUpdate(ed.doc, Y.encodeStateVector(alice.doc))
  );
};
const joinedRoom = (
  children: readonly Descendant[],
  roomSchema: RoomSchema = Paragraphs
) => {
  const room = openRoom(children, roomSchema);

  sync(room);

  return room;
};

/** Asserts that Alice, Ed and a peer that loads the room afresh read one of `accepted`. */
const assertRoomReads = (
  { alice, ed, roomSchema }: Room,
  ...accepted: ReadonlyArray<readonly Descendant[]>
) => {
  const reload = peerOf(
    roomSchema,
    3,
    alice.editor.read.value().children,
    Y.encodeStateAsUpdate(alice.doc)
  );
  const reads = [alice, ed, reload].map(
    (peer) => peer.editor.read.value().children
  );

  assert.ok(
    accepted.some((want) =>
      reads.every((read) => isDeepStrictEqual(read, want))
    ),
    `Alice, Ed and a reload read ${JSON.stringify(reads)}`
  );
};

const assertRefProposalAccepts = (
  room: Room,
  ...after: readonly Descendant[]
) => {
  const { alice, ed } = room;

  assert.deepEqual(
    [alice, ed].map(({ editor }) =>
      editor.read.authored.changes().items.map(({ authorId, id }) => ({
        authorId,
        parts: editor.read.authored.details(id)?.parts,
      }))
    ),
    Array.from({ length: 2 }, () => [
      {
        authorId: 'peer-1',
        parts: [
          {
            after: { ref: 'r3' },
            before: { ref: 'r1' },
            kind: 'properties',
            nodeKind: 'element',
            path: [0, 1],
          },
        ],
      },
    ])
  );

  ed.editor.update.authored.decide({
    action: 'accept',
    changes: ed.editor.read.authored.changes().items,
  });
  sync(room);

  assertRoomReads(room, [
    paragraph(
      { text: '' },
      { children: [{ text: 'ab' }], ref: 'r3', type: 'link' },
      { text: '' }
    ),
    ...after,
  ]);
};

const olderClientDropsEmptyTexts = ({ alice, ed }: Room) => {
  const older = new Y.Doc();

  older.clientID = 4;
  Y.applyUpdate(older, Y.encodeStateAsUpdate(alice.doc));
  const seen = Y.encodeStateVector(older);

  for (const stored of older.get('document', Y.XmlElement).toArray()) {
    if (
      !(stored instanceof Y.XmlElement) ||
      stored.getAttribute('type') !== 'paragraph'
    ) {
      continue;
    }
    for (let index = stored.length - 1; index >= 0; index -= 1) {
      const child = stored.get(index);

      if (child instanceof Y.XmlText && child.length === 0) {
        stored.delete(index, 1);
      }
    }
  }
  const trim = Y.encodeStateAsUpdate(older, seen);

  Y.applyUpdate(alice.doc, trim);
  Y.applyUpdate(ed.doc, trim);
};

const storedEmptyTexts = (node: Y.XmlElement): number =>
  node
    .toArray()
    .reduce(
      (count, child) =>
        count +
        (child instanceof Y.XmlText
          ? Number(child.length === 0)
          : child instanceof Y.XmlElement
            ? storedEmptyTexts(child)
            : 0),
      0
    );

describe('plitejs/yjs empty texts beside an inline element', () => {
  it('keeps one paragraph and the proposal when peers race a proposed and a direct ref write on a link', () => {
    const room = joinedRoom([linked('', '')]);

    room.alice.editor.api.authored.setView({ intent: 'propose' });
    room.alice.editor.update((tx) =>
      tx.nodes.set({ ref: 'r3' }, { at: [0, 1] })
    );
    room.ed.editor.update((tx) => tx.nodes.unset('ref', { at: [0, 1] }));
    sync(room);

    assert.deepEqual(
      [room.alice, room.ed].map(
        (peer) => peer.editor.read.value().children.length
      ),
      [1, 1]
    );
    assertRefProposalAccepts(room);
  });

  it('keeps a letter typed after a link in a nested paragraph while a peer joins', () => {
    const room = openRoom([section(linked('', ''))], Sections);

    room.alice.editor.update((tx) =>
      tx.text.insert('X', { at: { offset: 0, path: [0, 0, 2] } })
    );
    sync(room);

    assertRoomReads(room, [section(linked('', 'X'))]);
  });

  it('keeps a letter typed after a link inserted after both joined while a peer unsets its ref', () => {
    const room = joinedRoom([paragraph({ text: 'head' })]);

    room.alice.editor.update((tx) =>
      tx.nodes.insert(
        { children: [{ text: 'ab' }], ref: 'r1', type: 'link' },
        { at: [0, 1] }
      )
    );
    sync(room);
    room.alice.editor.update((tx) =>
      tx.text.insert('X', { at: { offset: 0, path: [0, 2] } })
    );
    room.ed.editor.update((tx) => tx.nodes.unset('ref', { at: [0, 1] }));
    sync(room);

    assertRoomReads(room, [
      paragraph(
        { text: 'head' },
        { children: [{ text: 'ab' }], type: 'link' },
        { text: 'X' }
      ),
    ]);
  });

  it('reads the two lines of an Enter after a link alike on every peer while a peer types at the start of the text after it', () => {
    const room = joinedRoom([linked('', 'tail')]);

    room.alice.editor.update((tx) => tx.nodes.split({ at: [0], position: 2 }));
    room.ed.editor.update((tx) =>
      tx.text.insert('P', { at: { offset: 0, path: [0, 2] } })
    );
    sync(room);

    const lostToSplitCopy = [linked('', ''), paragraph({ text: 'tail' })];

    assertRoomReads(
      room,
      [linked('', 'P'), paragraph({ text: 'tail' })],
      [linked('', ''), paragraph({ text: 'Ptail' })],
      lostToSplitCopy
    );
  });

  it('keeps the two lines of an Enter after a link while a peer types at the start of the text after it, after both peers set its ref at once', () => {
    const room = joinedRoom([paragraph({ text: 'head' })]);
    const { alice, ed } = room;

    alice.editor.update((tx) =>
      tx.nodes.insert(
        { children: [{ text: 'ab' }], ref: 'r1', type: 'link' },
        { at: [0, 1] }
      )
    );
    sync(room);
    alice.editor.update((tx) => tx.nodes.set({ ref: 'r3' }, { at: [0, 1] }));
    ed.editor.update((tx) => tx.nodes.set({ ref: 'r3' }, { at: [0, 1] }));
    sync(room);
    alice.editor.update((tx) =>
      tx.text.insert('tail', { at: { offset: 0, path: [0, 2] } })
    );
    sync(room);
    alice.editor.update((tx) => tx.nodes.split({ at: [0], position: 2 }));
    ed.editor.update((tx) =>
      tx.text.insert('P', { at: { offset: 0, path: [0, 2] } })
    );
    sync(room);

    const line = (after: string) =>
      paragraph(
        { text: 'head' },
        { children: [{ text: 'ab' }], ref: 'r3', type: 'link' },
        { text: after }
      );

    const lostToSplitCopy = [line(''), paragraph({ text: 'tail' })];

    assertRoomReads(
      room,
      [line('P'), paragraph({ text: 'tail' })],
      [line(''), paragraph({ text: 'Ptail' })],
      lostToSplitCopy
    );
  });

  it('keeps at most two stored empty texts after repeated Enter, merge and undo after a link', () => {
    const room = joinedRoom([linked('', 'tail')]);
    const { alice } = room;

    for (let cycle = 0; cycle < 10; cycle += 1) {
      alice.editor.update((tx) => tx.nodes.split({ at: [0], position: 2 }));
      sync(room);
      alice.editor.update((tx) => tx.nodes.merge({ at: [1] }));
      sync(room);
      alice.editor.api.history.undo();
      sync(room);
      alice.editor.api.history.undo();
      sync(room);
    }

    const stored = storedEmptyTexts(alice.doc.get('document', Y.XmlElement));

    assert.ok(stored <= 2, `the room stores ${stored} empty texts`);
  });

  it('reads canonical leaves on every peer after undo and redo of Enter and merge beside a link', () => {
    const room = joinedRoom([linked('', 'tail')]);
    const { alice } = room;

    alice.editor.update((tx) => tx.nodes.split({ at: [0], position: 2 }));
    sync(room);
    alice.editor.update((tx) => tx.nodes.merge({ at: [1] }));
    sync(room);
    alice.editor.api.history.undo();
    alice.editor.api.history.undo();
    sync(room);
    alice.editor.api.history.redo();
    alice.editor.api.history.redo();
    sync(room);

    assertRoomReads(room, [linked('', 'tail')]);
  });

  it('keeps letters typed on both sides of a link after an older client drops the empty texts beside it', () => {
    const room = joinedRoom([linked('', '')]);

    room.alice.editor.update((tx) =>
      tx.text.insert('X', { at: { offset: 0, path: [0, 2] } })
    );
    sync(room);
    olderClientDropsEmptyTexts(room);
    room.alice.editor.update((tx) =>
      tx.text.insert('P', { at: { offset: 0, path: [0, 0] } })
    );
    room.ed.editor.update((tx) =>
      tx.text.insert('Q', { at: { offset: 1, path: [0, 2] } })
    );
    sync(room);

    assertRoomReads(room, [
      paragraph(
        { text: 'P' },
        { children: [{ text: 'ab' }], ref: 'r1', type: 'link' },
        { text: 'XQ' }
      ),
    ]);
  });

  it('publishes a caret placed after a link a peer just inserted, on both peers', () => {
    const room = joinedRoom([paragraph({ text: 'head' })]);
    const caret = { offset: 0, path: [0, 2] };

    room.alice.editor.update((tx) =>
      tx.nodes.insert(
        { children: [{ text: 'ab' }], ref: 'r1', type: 'link' },
        { at: [0, 1] }
      )
    );
    sync(room);
    for (const peer of [room.alice, room.ed]) {
      peer.editor.update.selection.set({ anchor: caret, focus: caret });
    }

    assert.deepEqual(
      [room.alice, room.ed].map(
        (peer) => peer.awareness.getLocalState()?.selection != null
      ),
      [true, true]
    );
  });

  it('keeps one section when peers race a proposed and a direct ref write after an older client drops the empty texts of a paragraph moved into it', () => {
    const room = joinedRoom(
      [section(paragraph({ text: 'q' })), linked('', '')],
      Sections
    );
    const { alice, ed } = room;

    alice.editor.update((tx) => tx.nodes.move({ at: [1], to: [0, 1] }));
    sync(room);
    alice.editor.update((tx) => tx.nodes.set({ ref: 'a' }, { at: [0, 1, 1] }));
    ed.editor.update((tx) => tx.nodes.set({ ref: 'b' }, { at: [0, 1, 1] }));
    olderClientDropsEmptyTexts(room);
    alice.editor.api.authored.setView({ intent: 'propose' });
    alice.editor.update((tx) => tx.nodes.set({ ref: 'r3' }, { at: [0, 1, 1] }));
    ed.editor.update((tx) => tx.nodes.unset('ref', { at: [0, 1, 1] }));
    sync(room);

    const reload = peerOf(
      Sections,
      3,
      alice.editor.read.value().children,
      Y.encodeStateAsUpdate(alice.doc)
    );

    assert.deepEqual(
      [alice, ed, reload].map(
        (peer) => peer.editor.read.value().children.length
      ),
      [1, 1, 1]
    );
  });

  it('reads the two lines of an Enter before two stored texts after a link on every peer while a peer types into the second', () => {
    const room = joinedRoom([linked('', '')]);

    olderClientDropsEmptyTexts(room);
    room.alice.editor.update((tx) =>
      tx.text.insert('ta', { at: { offset: 0, path: [0, 2] } })
    );
    room.ed.editor.update((tx) =>
      tx.text.insert('il', { at: { offset: 0, path: [0, 2] } })
    );
    sync(room);
    room.alice.editor.update((tx) => tx.nodes.split({ at: [0], position: 2 }));
    room.ed.editor.update((tx) =>
      tx.text.insert('P', { at: { offset: 3, path: [0, 2] } })
    );
    sync(room);

    const lostToSplitCopy = [linked('', ''), paragraph({ text: 'tail' })];

    assertRoomReads(
      room,
      [linked('', 'P'), paragraph({ text: 'tail' })],
      [linked('', ''), paragraph({ text: 'taiPl' })],
      lostToSplitCopy
    );
  });

  it('keeps a letter a peer deletes from a merged text while Enter splits before it', () => {
    const room = joinedRoom([
      paragraph({ text: 'aa' }),
      paragraph({ text: 'b' }),
    ]);
    const { alice, ed } = room;

    alice.editor.update((tx) => tx.nodes.merge({ at: [1] }));
    sync(room);
    alice.editor.update((tx) =>
      tx.nodes.insert(
        { children: [{ text: 'L' }], type: 'link' },
        { at: [0, 1] }
      )
    );
    sync(room);
    alice.editor.update((tx) =>
      tx.text.insert('c', { at: { offset: 0, path: [0, 2] } })
    );
    sync(room);
    alice.editor.update((tx) => tx.nodes.remove({ at: [0, 1] }));
    sync(room);
    alice.editor.update((tx) =>
      tx.nodes.split({ at: { offset: 2, path: [0, 0] } })
    );
    ed.editor.update((tx) =>
      tx.text.delete({
        at: {
          anchor: { offset: 2, path: [0, 0] },
          focus: { offset: 3, path: [0, 0] },
        },
      })
    );
    sync(room);

    assertRoomReads(room, [
      paragraph({ text: 'aa' }),
      paragraph({ text: 'c' }),
    ]);
  });

  it('keeps the line of an Enter at the start of a merged text while a peer types after it', () => {
    const room = joinedRoom([linked('', ''), paragraph({ text: 'tail' })]);
    const { alice, ed } = room;

    alice.editor.update((tx) => tx.nodes.merge({ at: [1] }));
    sync(room);
    alice.editor.update((tx) =>
      tx.nodes.insert(
        { children: [{ text: 'cd' }], type: 'link' },
        { at: [0, 3] }
      )
    );
    sync(room);
    alice.editor.update((tx) =>
      tx.text.insert('il', { at: { offset: 0, path: [0, 4] } })
    );
    sync(room);
    alice.editor.update((tx) => tx.nodes.remove({ at: [0, 3] }));
    sync(room);
    alice.editor.update((tx) => tx.nodes.split({ at: [0], position: 2 }));
    ed.editor.update((tx) =>
      tx.text.insert('P', { at: { offset: 5, path: [0, 2] } })
    );
    sync(room);

    const lostToSplitCopy = [linked('', ''), paragraph({ text: 'tailil' })];

    assertRoomReads(
      room,
      [linked('', 'P'), paragraph({ text: 'tailil' })],
      [linked('', ''), paragraph({ text: 'tailiPl' })],
      lostToSplitCopy
    );
  });

  it('keeps each paragraph once and the proposal when peers race a proposed and a direct ref write after an older client drops the empty texts of every paragraph, in a schema with content roots', () => {
    const room = joinedRoom([linked('', ''), linked('', '')], Captions);
    const { alice, ed } = room;

    olderClientDropsEmptyTexts(room);
    alice.editor.api.authored.setView({ intent: 'propose' });
    alice.editor.update((tx) => tx.nodes.set({ ref: 'r3' }, { at: [0, 1] }));
    ed.editor.update((tx) => tx.nodes.unset('ref', { at: [0, 1] }));
    sync(room);

    assertRefProposalAccepts(room, linked('', ''));
  });

  it("reads a bounded number of stored children for each letter typed into a merged paragraph after a peer's ref write elsewhere, at 50 and 500 blocks", () => {
    const childrenRead = (blocks: number) => {
      const room = joinedRoom(
        Array.from({ length: blocks }, (_, index) =>
          index === 0 ? linked('x', 'y') : linked('z', 'w')
        )
      );
      const { alice, ed } = room;
      let read = 0;

      alice.editor.update((tx) => tx.nodes.merge({ at: [1] }));
      sync(room);
      for (let letter = 0; letter < 3; letter += 1) {
        ed.editor.update((tx) =>
          tx.nodes.set({ ref: `t${letter}` }, { at: [blocks - 2, 1] })
        );
        sync(room);
        resetCoreWork();
        alice.editor.update((tx) =>
          tx.text.insert('a', { at: { offset: 0, path: [0, 2] } })
        );
        read += readCoreWork().yjsChildrenRead;
      }
      sync(room);
      assert.deepEqual(ed.editor.read.value().children[0], {
        children: [
          { text: 'x' },
          { children: [{ text: 'ab' }], ref: 'r1', type: 'link' },
          { text: 'aaayz' },
          { children: [{ text: 'ab' }], ref: 'r1', type: 'link' },
          { text: 'w' },
        ],
        type: 'paragraph',
      });

      return read;
    };
    const short = childrenRead(50);
    const long = childrenRead(500);

    assert.ok(
      long <= 2 * short,
      `${long} stored children read at 500 blocks, ${short} at 50`
    );
  });

  it('stores no more empty texts after repeatedly adding and removing a link after an empty text than after doing it once', () => {
    const room = joinedRoom([linked('', '')]);
    const { alice } = room;
    const cycle = () => {
      alice.editor.update((tx) =>
        tx.nodes.insert(
          { children: [{ text: 'cd' }], ref: 'r2', type: 'link' },
          { at: [0, 3] }
        )
      );
      sync(room);
      alice.editor.update((tx) => tx.nodes.remove({ at: [0, 3] }));
      sync(room);

      return storedEmptyTexts(alice.doc.get('document', Y.XmlElement));
    };
    const once = cycle();

    for (let count = 1; count < 20; count += 1) cycle();

    assert.equal(cycle(), once);
  });

  it('reads stored children in proportion to the paragraph for Enter in a paragraph merged from 25 and 100 lines', () => {
    const childrenRead = (lines: number) => {
      const room = joinedRoom(
        Array.from({ length: lines }, () => paragraph({ text: 'aa' }))
      );
      const { alice, ed } = room;

      for (let line = 1; line < lines; line += 1) {
        alice.editor.update((tx) => tx.nodes.merge({ at: [1] }));
        sync(room);
      }
      resetCoreWork();
      alice.editor.update((tx) =>
        tx.nodes.split({ at: { offset: 1, path: [0, 0] } })
      );
      const read = readCoreWork().yjsChildrenRead;

      sync(room);
      assert.deepEqual(ed.editor.read.value().children, [
        paragraph({ text: 'a' }),
        paragraph({ text: `a${'aa'.repeat(lines - 1)}` }),
      ]);

      return read;
    };
    const short = childrenRead(25);
    const long = childrenRead(100);

    assert.ok(
      long <= 6 * short,
      `${long} stored children read for 100 lines, ${short} for 25`
    );
  });
});
