import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import fc from 'fast-check';
import * as Y from 'yjs';

import {
  createEditor,
  defineEditorSchema,
  type Descendant,
  NodeApi,
  type Path,
  schema,
} from '../../src/index';
import { getYjsVisibleChildren } from '../../src/yjs/core/document';
import { textPieceOf } from '../../src/yjs/core/text-runs';
import {
  createYjsPeerWithEditor,
  getYjsRoot,
  type Peer,
  readPeerChildren,
  syncConnectedPeers,
} from './support/collaboration';

const Schema = defineEditorSchema('schema:yjs-shown-letters-law', {
  elements: {
    paragraph: { content: schema.content.text() },
    quote: { content: schema.content.types(['paragraph']) },
  },
  root: schema.content.not(schema.content.text()),
  unknown: 'reject',
});

type Op =
  | { kind: 'join'; at: number }
  | { kind: 'move'; at: number; to: number }
  | { kind: 'remove'; at: number }
  | { kind: 'split'; at: number; offset: number }
  | { kind: 'type'; at: number; offset: number }
  | { kind: 'unwrap'; at: number }
  | { kind: 'wrap'; at: number };

type Round = {
  readonly first: Op;
  readonly firstSyncs: boolean;
  readonly second: Op;
};

const op: fc.Arbitrary<Op> = fc.oneof(
  fc.record({ kind: fc.constant('join' as const), at: fc.nat(8) }),
  fc.record({
    kind: fc.constant('move' as const),
    at: fc.nat(8),
    to: fc.nat(8),
  }),
  fc.record({ kind: fc.constant('remove' as const), at: fc.nat(8) }),
  fc.record({
    kind: fc.constant('split' as const),
    at: fc.nat(8),
    offset: fc.nat(8),
  }),
  fc.record({
    kind: fc.constant('type' as const),
    at: fc.nat(8),
    offset: fc.nat(8),
  }),
  fc.record({ kind: fc.constant('unwrap' as const), at: fc.nat(8) }),
  fc.record({ kind: fc.constant('wrap' as const), at: fc.nat(8) })
);

const rounds = fc.array(
  fc.record({ first: op, firstSyncs: fc.boolean(), second: op }),
  { minLength: 1, maxLength: 6 }
);

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

const uniqueLetters = () => {
  let next = 0x4e_00;

  return () => String.fromCodePoint((next += 1));
};

const createPair = (writerId: number) => {
  const children = [paragraph('ab'), paragraph('cd'), paragraph('ef')];
  const create = (
    numericClientId: number,
    seedUpdate?: Uint8Array,
    initial = children
  ) =>
    createYjsPeerWithEditor(
      createEditor({ initialValue: initial, plugins: [Schema] }),
      {
        children: initial,
        clientId: String(numericClientId),
        numericClientId,
        seedUpdate,
      }
    );
  const writer = create(writerId);
  const peer = create(
    writerId === 1 ? 2 : 1,
    Y.encodeStateAsUpdate(writer.doc)
  );
  const join = (from: Peer) =>
    create(3, Y.encodeStateAsUpdate(from.doc), [paragraph('seed')]);

  return { join, writer, peer };
};

const textsOf = (value: readonly Descendant[]): string[] =>
  [...NodeApi.texts({ children: [...value] } as never)].map(
    ([text]) => (text as { text: string }).text
  );

type Letter = readonly [id: string, char: string];

const liveLettersOf = (text: Y.XmlText): Letter[] => {
  const letters: Letter[] = [];

  for (let item = text._start; item; item = item.right) {
    if (item.deleted || !item.countable) continue;
    for (let at = 0; at < item.length; at++) {
      letters.push([
        `${item.id.client}.${item.id.clock + at}`,
        item.content instanceof Y.ContentString ? item.content.str[at] : '',
      ]);
    }
  }

  return letters;
};

const storedLetters = (root: Y.XmlElement): Map<string, string> => {
  const stored = new Map<string, string>();
  const stack: unknown[] = [root];

  for (let node = stack.pop(); node; node = stack.pop()) {
    if (node instanceof Y.XmlElement) {
      stack.push(...node.toArray());
    } else if (node instanceof Y.XmlText) {
      for (const [id, char] of liveLettersOf(node)) {
        if (char !== '') stored.set(id, char);
      }
    }
  }

  return stored;
};

const shownLetters = (root: Y.XmlElement): Letter[] => {
  const shown: Letter[] = [];
  const visit = (node: Y.XmlElement) => {
    for (const child of getYjsVisibleChildren(root, node)) {
      if (child instanceof Y.XmlElement) {
        visit(child);
      } else {
        const { from, source, to } = textPieceOf(child);

        shown.push(...liveLettersOf(source).slice(from, to));
      }
    }
  };

  visit(root);

  return shown;
};

const hiddenLetters = (root: Y.XmlElement): Map<string, string> => {
  const hidden = storedLetters(root);

  for (const [id] of shownLetters(root)) hidden.delete(id);

  return hidden;
};

const isParagraph = (node: Descendant) =>
  'type' in node && node.type === 'paragraph';

const linesOf = (peer: Peer): Path[] =>
  readPeerChildren(peer).flatMap((node, index) =>
    'type' in node && node.type === 'quote'
      ? (node.children as Descendant[]).flatMap((child, at) =>
          isParagraph(child) ? [[index, at]] : []
        )
      : isParagraph(node)
        ? [[index]]
        : []
  );

const apply = (peer: Peer, edit: Op, letter: () => string): void => {
  const top = readPeerChildren(peer);
  const lines = linesOf(peer);

  if (lines.length === 0) return;

  const line = lines[edit.at % lines.length];
  const textOf = (path: Path) =>
    NodeApi.string(NodeApi.get({ children: [...top] } as never, path));

  switch (edit.kind) {
    case 'type': {
      const text = textOf(line);

      peer.editor.update.text.insert(letter(), {
        at: { path: [...line, 0], offset: edit.offset % (text.length + 1) },
      });
      return;
    }
    case 'split': {
      const offset = edit.offset % (textOf(line).length + 1);
      const at = { path: [...line, 0], offset };

      peer.editor.update((tx) => {
        tx.selection.set({ kind: 'text', anchor: at, focus: at });
        tx.break.insert();
        tx.selection.set(null);
      });
      return;
    }
    case 'join': {
      const index = lines.indexOf(line);
      const previous = lines[index - 1];

      if (
        previous &&
        previous.length === line.length &&
        previous[0] === line[0] - (line.length === 1 ? 1 : 0)
      ) {
        peer.editor.update.nodes.merge({ at: line });
      }
      return;
    }
    case 'move': {
      if (top.length < 2) return;
      const at = edit.at % top.length;
      const to = edit.to % top.length;

      if (at !== to) peer.editor.update.nodes.move({ at: [at], to: [to] });
      return;
    }
    case 'remove': {
      if (lines.length > 1) peer.editor.update.nodes.remove({ at: line });
      return;
    }
    case 'wrap': {
      if (line.length === 1) {
        peer.editor.update((tx) => {
          tx.selection.set(null);
          tx.nodes.wrap({ children: [], type: 'quote' }, { at: line });
        });
      }
      return;
    }
    case 'unwrap': {
      if (line.length === 2) peer.editor.update.nodes.unwrap({ at: [line[0]] });
    }
  }
};

type Named = ReadonlyArray<readonly [name: string, peer: Peer]>;

const assertShown = (step: string, peers: Named): void => {
  for (const [name, peer] of peers) {
    const shown = shownLetters(getYjsRoot(peer));
    const lines = textsOf(readPeerChildren(peer)).join('');
    const at = [...lines].findIndex(
      (char, index) => shown[index]?.[1] !== char
    );

    assert.ok(
      at === -1,
      `${step}: ${name} deletes ${lines[at]}, which a line shows, and shows ${shown[at]?.[0] ?? 'nothing'} there`
    );
    assert.equal(
      shown.length,
      lines.length,
      `${step}: ${name} shows ${shown[lines.length]?.[0]}, which no line shows`
    );
  }
};

const rootNameOf = (peer: Peer): string =>
  [...peer.doc.share].find(([, type]) => type === getYjsRoot(peer))?.[0] ?? '';

const syncUnderLaw = (
  step: string,
  order: Named,
  join: (from: Peer) => Peer
): void => {
  const received = new Map<Peer, Uint8Array>();
  const stops = order.map(([, peer]) => {
    const settle = (transaction: Y.Transaction) => {
      if (transaction.local && !received.has(peer)) {
        received.set(peer, Y.encodeStateAsUpdate(peer.doc));
      }
    };

    peer.doc.on('beforeTransaction', settle);

    return () => peer.doc.off('beforeTransaction', settle);
  });

  try {
    syncConnectedPeers(order.map(([, peer]) => peer));
  } finally {
    for (const stop of stops) stop();
  }

  for (const [name, peer] of order) {
    const update = received.get(peer);

    if (!update) continue;

    const merged = new Y.Doc();

    Y.applyUpdate(merged, update);

    const stored = storedLetters(getYjsRoot(peer));

    for (const [id, char] of shownLetters(
      merged.get(rootNameOf(peer), Y.XmlElement)
    )) {
      assert.ok(
        stored.has(id),
        `${step}: ${name}'s settle deletes ${char} (${id}), which a line shows`
      );
    }
  }
  assertShown(step, order);

  const [[firstName, first]] = order;
  const value = readPeerChildren(first);

  for (const [name, peer] of [
    ...order,
    ['a fresh peer', join(first)] as const,
  ]) {
    assert.deepEqual(
      readPeerChildren(peer),
      value,
      `${step}: ${name} reads ${textsOf(readPeerChildren(peer)).join(' / ')} where ${firstName} reads ${textsOf(value).join(' / ')}`
    );
  }
};

const writeUnderLaw = (
  step: string,
  [name, peer]: Named[number],
  edit: Op,
  letter: () => string
): void => {
  const root = getYjsRoot(peer);
  const shownBefore = shownLetters(root);
  const hiddenBefore = hiddenLetters(root);
  const label = `${step} ${edit.kind}`;

  apply(peer, edit, letter);
  assertShown(label, [[name, peer]]);

  const hidden = hiddenLetters(root);

  for (const [id, char] of shownBefore) {
    assert.ok(
      !hidden.has(id),
      `${label}: ${name} stores ${char} (${id}), which it stopped showing`
    );
  }
  for (const [id, char] of hidden) {
    assert.ok(
      hiddenBefore.has(id),
      `${label}: ${name} stores ${char} (${id}), which no line shows and no line hid before the write`
    );
  }
};

describe('plitejs/yjs shown letters law', () => {
  for (const writerId of [1, 2]) {
    it(`a write deletes exactly the letters it stops showing, writer id ${writerId}`, () => {
      fc.assert(
        fc.property(rounds, (plan: readonly Round[]) => {
          const { join, peer, writer } = createPair(writerId);
          const peers: Named = [
            ['writer', writer],
            ['peer', peer],
          ];
          const letter = uniqueLetters();

          for (const [round, { first, firstSyncs, second }] of plan.entries()) {
            writeUnderLaw(`round ${round} first`, peers[0], first, letter);
            writeUnderLaw(`round ${round} second`, peers[1], second, letter);
            syncUnderLaw(
              `round ${round} sync`,
              firstSyncs ? peers : [peers[1], peers[0]],
              join
            );
          }
        }),
        { numRuns: 40 }
      );
    });
  }
});
