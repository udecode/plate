import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { setYjsAttribute } from '../../src/yjs/core/attributes';
import { createYjsNode, getYjsNode } from '../../src/yjs/core/document';
import { YjsEventChangeBridge } from '../../src/yjs/core/event-change-bridge';

describe('Yjs event-change locality', () => {
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
      const target = getYjsNode(root, mode === 'text' ? [64, 0] : [64]);
      if (mode === 'text') {
        assert.ok(target instanceof Y.XmlText);
        target.insert(0, '!');
      } else {
        setYjsAttribute(target, 'rank', 2);
      }
      unrelatedReads = 0;
      const result = bridge.translate(
        {
          deletedTextTargets: [],
          events: [
            {
              target,
              childListChanged: false,
              delta: [],
              keys: mode === 'text' ? [] : ['rank'],
            },
          ],
        },
        { changedNodes: new Set(), removedNodes: new Set() }
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
      assert.deepEqual(
        rootName === 'main' ? applied.children : applied.roots?.notes,
        result.import.children
      );
      assert.deepEqual(result.import.children[64], {
        type: 'paragraph',
        rank: mode === 'property' ? 2 : 1,
        children: [{ text: mode === 'text' ? '!block-64' : 'block-64' }],
      });
      assert.equal(result.import.children[0], before[0]);
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
      result.import.accept(result.import.children);
      affected = 127;
      const followUp = getYjsNode(root, [127, 0]);
      assert.ok(followUp instanceof Y.XmlText);
      followUp.insert(0, '?');
      unrelatedReads = 0;
      const next = bridge.translate(
        {
          deletedTextTargets: [],
          events: [
            { target: followUp, childListChanged: false, delta: [], keys: [] },
          ],
        },
        { changedNodes: new Set(), removedNodes: new Set() }
      );
      assert.equal(unrelatedReads, 0);
      assert.equal(next.kind, 'change');
      if (next.kind !== 'change') throw new Error('Expected follow-up import');
      assert.equal(
        (next.import.children[127] as { children: readonly [{ text: string }] })
          .children[0].text,
        '?block-127'
      );
      assert.equal(before[127].children[0].text, 'block-127');
      doc.destroy();
    });
  }
});
