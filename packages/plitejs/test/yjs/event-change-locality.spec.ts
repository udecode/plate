import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import {
  valueRootIndex,
  valueRootNodes,
} from '../../src/core/change/document-change';
import { ElementApi, NodeApi, type Point, TextApi } from '../../src/index';
import { setYjsAttribute } from '../../src/yjs/core/attributes';
import {
  createYjsNode,
  readPliteValueFromYjs,
  withYjsWrite,
} from '../../src/yjs/core/document';
import {
  type CapturedYjsEventBatch,
  captureYjsEventBatch,
  YjsEventChangeBridge,
} from '../../src/yjs/core/event-change-bridge';
import { DEFAULT_YJS_ROOT_NAME } from '../../src/yjs/core/keys';
import {
  createYjsPeer,
  getVisibleYjsNode,
  paragraph,
} from './support/collaboration';

const PIECES = 100;
const PIECE_LETTERS = 10;
const FAMILY = 100;
const MIDDLE = FAMILY + PIECES / 2;
const pieceLetters = (piece: number) =>
  `${String(piece).padStart(2, '0')}abcdefgh`;

let family: Uint8Array | null = null;

/** A 300-line document whose line 100 Enter split into 100 lines. */
const familyUpdate = (): Uint8Array => {
  if (family) return family;

  const children = Array.from({ length: 300 }, (_, index) =>
    paragraph(
      index === FAMILY
        ? Array.from({ length: PIECES }, (_unused, piece) =>
            pieceLetters(piece)
          ).join('')
        : `block-${index}`
    )
  );
  const writer = createYjsPeer({
    children,
    clientId: 'writer',
    numericClientId: 1,
  });

  for (let piece = PIECES - 1; piece > 0; piece--) {
    const point = { path: [FAMILY, 0], offset: piece * PIECE_LETTERS };

    writer.editor.update((tx) => {
      tx.selection.set({ anchor: point, focus: point, kind: 'text' });
      tx.break.insert();
    });
  }

  family = Y.encodeStateAsUpdate(writer.doc);
  writer.cleanup();

  return family;
};

/**
 * Type into one line of the split family on a writer, and import that
 * keystroke into a bridge whose mirror notes which lines the import reads.
 */
const importFamilyKeystroke = (at: Point) => {
  const doc = new Y.Doc();

  Y.applyUpdate(doc, familyUpdate());

  const root = doc.get(DEFAULT_YJS_ROOT_NAME, Y.XmlElement);
  const value = readPliteValueFromYjs(root);
  const writer = createYjsPeer({
    children: value,
    clientId: 'writer',
    numericClientId: 2,
    seedUpdate: familyUpdate(),
  });
  const read = new Set<number>();
  const before = Object.freeze(
    value.map(
      (node, index) =>
        new Proxy(Object.freeze(node), {
          get(target, property, receiver) {
            if (property === 'type') read.add(index);
            return Reflect.get(target, property, receiver);
          },
        })
    )
  );
  const bridge = new YjsEventChangeBridge(root, 'main', before);
  let batch: CapturedYjsEventBatch | null = null;

  root.observeDeep((events, transaction) => {
    batch = captureYjsEventBatch(events, transaction);
  });

  const known = Y.encodeStateVector(doc);

  writer.editor.update.text.insert('X', { at });
  Y.applyUpdate(doc, Y.encodeStateAsUpdate(writer.doc, known));
  read.clear();

  const result = withYjsWrite(root, (write) =>
    bridge.prepareRemote(write, batch ?? assert.fail('expected a Yjs batch'))
  );
  const imported = [...read];

  assert.equal(result.kind, 'change');
  if (result.kind !== 'change') throw new Error('Expected a change import');

  const after = valueRootNodes(
    result.import.change.apply({ children: before }),
    'main'
  );

  writer.cleanup();
  doc.destroy();

  return { after, read: imported };
};

describe('Yjs event-change locality', () => {
  it('reads only the line typed into when that line is one of 100 lines split from one', () => {
    const { after, read } = importFamilyKeystroke({
      path: [MIDDLE, 0],
      offset: 3,
    });

    assert.deepEqual(
      { read, typed: after.at(MIDDLE) },
      { read: [MIDDLE], typed: paragraph('50aXbcdefgh') }
    );
  });

  for (const [edge, offset, typed] of [
    ['first', 0, 'X50abcdefgh'],
    ['last', PIECE_LETTERS, '50abcdefghX'],
  ] as const) {
    it(`a letter typed at the ${edge} offset of a split line changes that line only`, () => {
      const { after, read } = importFamilyKeystroke({
        path: [MIDDLE, 0],
        offset,
      });

      assert.deepEqual(
        {
          read,
          lines: [MIDDLE - 1, MIDDLE, MIDDLE + 1].map((index) =>
            NodeApi.string(after.at(index) ?? assert.fail('expected a line'))
          ),
        },
        {
          read: [MIDDLE],
          lines: [
            pieceLetters(PIECES / 2 - 1),
            typed,
            pieceLetters(PIECES / 2 + 1),
          ],
        }
      );
    });
  }

  for (const mode of ['text', 'property'] as const) {
    it(`keeps ${mode} import property contexts local`, () => {
      let unrelatedReads = 0;
      let affected = 64;
      const rootName = mode === 'property' ? 'notes' : 'main';
      const before = Object.freeze(
        Array.from(
          { length: 128 },
          (_, index) =>
            new Proxy(
              Object.freeze({
                type: 'paragraph',
                rank: 1,
                children: Object.freeze([
                  Object.freeze({ text: `block-${index}` }),
                ]),
              }),
              {
                get(node, property, receiver) {
                  if (property === 'type' && index !== affected) {
                    unrelatedReads += 1;
                  }
                  return Reflect.get(node, property, receiver);
                },
              }
            )
        )
      );
      const doc = new Y.Doc();
      const root = doc.getXmlElement('content');
      root.insert(
        0,
        before.map((node) => createYjsNode(node))
      );
      const contexts: unknown[] = [];
      const bridge = new YjsEventChangeBridge(
        root,
        rootName,
        before,
        (_node, _key, context) => {
          contexts.push(context);
          return false;
        }
      );
      const target = getVisibleYjsNode(root, mode === 'text' ? [64, 0] : [64]);
      if (mode === 'text') {
        assert.ok(target instanceof Y.XmlText);
        target.insert(0, '!');
      } else {
        setYjsAttribute(target, 'rank', 2);
      }
      unrelatedReads = 0;
      const result = withYjsWrite(root, (write) =>
        bridge.prepareRemote(write, {
          deletedCuts: [],
          deletedIds: [],
          deletedTextTargets: [],
          events: [
            {
              target: target as unknown as Y.AbstractType<unknown>,
              childListChanged: false,
              delta: [],
              deleted: [],
              keys: mode === 'text' ? [] : ['rank'],
            },
          ],
          deletedChildren: new Map(),
          visibilityBefore: new Map(),
        })
      );
      const observed = unrelatedReads;
      assert.equal(result.kind, 'change');
      if (result.kind !== 'change') {
        throw new Error('Expected event-native import');
      }
      assert.equal(observed, 0);
      const initialValue =
        rootName === 'main'
          ? { children: before }
          : { children: [], roots: { notes: before } };
      const applied = result.import.change.apply(initialValue);
      const children = valueRootNodes(applied, rootName);
      assert.deepEqual(children.at(64), {
        type: 'paragraph',
        rank: mode === 'property' ? 2 : 1,
        children: [{ text: mode === 'text' ? '!block-64' : 'block-64' }],
      });
      assert.equal(children.at(0), before[0]);
      if (mode === 'property') {
        assert.ok(
          contexts.some(
            (context) =>
              JSON.stringify(context) ===
              JSON.stringify({
                ancestors: [],
                parent: null,
                path: [64],
                placement: 'element',
                root: 'notes',
                type: 'paragraph',
              })
          )
        );
      }
      result.import.accept(valueRootIndex(applied, rootName));
      affected = 127;
      const followUp = getVisibleYjsNode(root, [127, 0]);
      assert.ok(followUp instanceof Y.XmlText);
      followUp.insert(0, '?');
      unrelatedReads = 0;
      const next = withYjsWrite(root, (write) =>
        bridge.prepareRemote(write, {
          deletedCuts: [],
          deletedIds: [],
          deletedTextTargets: [],
          events: [
            {
              target: followUp as unknown as Y.AbstractType<unknown>,
              childListChanged: false,
              delta: [],
              deleted: [],
              keys: [],
            },
          ],
          deletedChildren: new Map(),
          visibilityBefore: new Map(),
        })
      );
      assert.equal(unrelatedReads, 0);
      assert.equal(next.kind, 'change');
      if (next.kind !== 'change') throw new Error('Expected follow-up import');
      const nextBlock = valueRootNodes(
        next.import.change.apply(applied),
        rootName
      ).at(127);
      assert.ok(ElementApi.isElement(nextBlock));
      const nextText = nextBlock.children[0];
      assert.ok(TextApi.isText(nextText));
      assert.equal(nextText.text, '?block-127');
      assert.equal(before[127].children[0].text, 'block-127');
      doc.destroy();
    });
  }
});
