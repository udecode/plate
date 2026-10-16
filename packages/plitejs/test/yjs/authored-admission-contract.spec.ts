import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { createAuthoredPlugin } from '../../src/authored/authored';
import {
  authoredRecords,
  contextRecordOf,
  verdictIdOf,
} from '../../src/authored/facts/records';
import { authoredMarksSchema } from '../../src/authored/tree/marks';
import { createEditor, definePlugin } from '../../src/index';
import { yjs } from '../../src/yjs/core/plugin';
import { authoredTestApi, reviewRecords } from '../support/authored';

const ann = { at: 1, author: 'ann', change: 'A', kind: 'insert' };
const bob = { at: 2, author: 'bob', change: 'B', kind: 'insert' };
const cat = { at: 3, author: 'cat', change: 'C', kind: 'insert' };
const inBob = contextRecordOf(null, bob);
const inCat = contextRecordOf(inBob.ctx, cat);
const stacked = { authored: [ann, bob], text: 'x' };
const compacted = {
  authored: [ann, { ctx: inBob.ctx, kind: 'in' }],
  text: 'x',
};
const paragraph = (...children: readonly unknown[]) => ({
  children,
  type: 'paragraph',
});

const WithoutContexts = definePlugin('authored', {
  schema: authoredMarksSchema,
});
const WithoutAdmission = definePlugin('authored', {
  dependencies: [authoredRecords],
  schema: authoredMarksSchema,
});

const peer = (doc: Y.Doc, plugin: unknown, seeded?: readonly unknown[]) => {
  const editor = createEditor({
    initialValue: (seeded ?? [paragraph({ text: '' })]) as never,
    plugins: [plugin as never],
  });
  const binding = yjs({
    doc,
    initialReady: true,
    ...(seeded ? { seed: true } : {}),
  });

  editor.install(binding);

  return {
    doc,
    editor,
    read: () => ({
      admission: editor.plugin(binding).api.admissionStatus(),
      value: editor.read.value(),
    }),
  };
};

const copyOf = (doc: Y.Doc) => {
  const copy = new Y.Doc();

  Y.applyUpdate(copy, Y.encodeStateAsUpdate(doc));

  return copy;
};

const send = (from: Y.Doc, to: Y.Doc) =>
  Y.applyUpdate(to, Y.encodeStateAsUpdate(from, Y.encodeStateVector(to)));

describe('plitejs/yjs authored admission', () => {
  it('upgrades a room an authored build without review contexts wrote, whichever upgrade arrives first', () => {
    for (const danaFirst of [true, false]) {
      const room = new Y.Doc();

      peer(room, WithoutContexts, [paragraph({ text: 'a' }, stacked)]);

      const dana = peer(
        copyOf(room),
        createAuthoredPlugin({ authorId: 'dana' })
      );
      const erin = peer(
        copyOf(room),
        createAuthoredPlugin({ authorId: 'erin' })
      );
      const [first, second] = danaFirst ? [dana, erin] : [erin, dana];

      send(first.doc, second.doc);
      send(second.doc, first.doc);

      const reader = peer(copyOf(dana.doc), WithoutAdmission);
      const upgraded = {
        admission: { state: 'ready' },
        value: {
          children: [paragraph({ text: 'a' }, compacted)],
          records: reviewRecords({ contexts: [inBob] }),
        },
      };

      assert.deepEqual(
        [dana.read(), erin.read(), reader.read()],
        [upgraded, upgraded, upgraded]
      );
    }
  });

  it('writes back the claims it compacts in an update from a peer without admission, and later changes to them', () => {
    const room = new Y.Doc();
    const writer = peer(room, WithoutAdmission, [paragraph({ text: 'a' })]);
    const dana = peer(
      copyOf(room),
      createAuthoredPlugin({
        authorId: 'dana',
        createIncarnationId: () => 'd:1',
        intent: 'edit',
      })
    );

    writer.editor.update((tx) => {
      tx.nodes.insert(stacked as never, { at: [0, 1] });
    });
    send(room, dana.doc);
    send(dana.doc, room);

    const admitted = {
      admission: { state: 'ready' },
      value: {
        children: [paragraph({ text: 'a' }, compacted)],
        records: reviewRecords({ contexts: [inBob] }),
      },
    };

    assert.deepEqual([dana.read(), writer.read()], [admitted, admitted]);

    authoredTestApi(dana.editor).decide({ action: 'accept', changes: ['B'] });
    send(dana.doc, room);

    const accepted = {
      admission: { state: 'ready' },
      value: {
        children: [paragraph({ text: 'a' }, { authored: [ann], text: 'x' })],
        records: reviewRecords({
          contexts: [inBob],
          verdicts: [
            {
              decision: 'd:1',
              member: { at: bob.at, change: bob.change },
              verdict: 'accept',
            },
          ],
        }),
      },
    };

    assert.deepEqual([dana.read(), writer.read()], [accepted, accepted]);
  });

  it('refuses a remote verdict whose id names other content', () => {
    const room = new Y.Doc();

    peer(room, WithoutAdmission, [paragraph({ text: 'a' })]);

    const erin = peer(copyOf(room), createAuthoredPlugin({ authorId: 'erin' }));
    const forger = copyOf(room);
    const id = verdictIdOf({
      decision: 'd:1',
      member: { at: 2, change: 'B' },
      verdict: 'accept',
    });

    forger.getMap('document:records:authored-verdicts').set(
      id,
      JSON.stringify({
        at: 2,
        change: 'B',
        decision: 'd:1',
        verdict: 'reject',
      })
    );
    send(forger, erin.doc);

    const { admission, value } = erin.read();

    assert.deepEqual(
      {
        cause: admission.state === 'error' && String(admission.cause),
        value,
      },
      {
        cause: `AuthoredMarkError: Review verdict ${id} is malformed.`,
        value: { children: [paragraph({ text: 'a' })] },
      }
    );
  });

  it('refuses a remote drop of a context text still rests on', () => {
    const room = new Y.Doc();

    peer(room, createAuthoredPlugin({ authorId: 'ann' }), [paragraph(stacked)]);

    const erin = peer(copyOf(room), createAuthoredPlugin({ authorId: 'erin' }));
    const forger = copyOf(room);

    forger.getMap('document:records:authored-contexts').delete(inBob.ctx);
    send(forger, erin.doc);

    const { admission, value } = erin.read();

    assert.deepEqual(
      {
        cause: admission.state === 'error' && String(admission.cause),
        value,
      },
      {
        cause: `AuthoredMarkError: Review context ${inBob.ctx} was dropped while text rests on it.`,
        value: {
          children: [paragraph(compacted)],
          records: reviewRecords({ contexts: [inBob] }),
        },
      }
    );
  });

  it('refuses a remote drop of a context another kept context rests on', () => {
    const room = new Y.Doc();

    peer(room, createAuthoredPlugin({ authorId: 'ann' }), [
      paragraph({ authored: [ann, bob, cat], text: 'x' }),
    ]);

    const erin = peer(copyOf(room), createAuthoredPlugin({ authorId: 'erin' }));
    const forger = copyOf(room);

    forger.getMap('document:records:authored-contexts').delete(inBob.ctx);
    send(forger, erin.doc);

    const { admission, value } = erin.read();

    assert.deepEqual(
      {
        cause: admission.state === 'error' && String(admission.cause),
        value,
      },
      {
        cause: `AuthoredMarkError: Review context ${inBob.ctx} was dropped while context ${inCat.ctx} rests on it.`,
        value: {
          children: [
            paragraph({
              authored: [ann, { ctx: inCat.ctx, kind: 'in' }],
              text: 'x',
            }),
          ],
          records: reviewRecords({ contexts: [inBob, inCat] }),
        },
      }
    );
  });

  it('keeps the claim of a remote Editing deletion that no pending join holds', () => {
    const room = new Y.Doc();

    peer(room, createAuthoredPlugin({ authorId: 'ann' }), [
      paragraph({ text: 'a' }),
    ]);

    const erin = peer(copyOf(room), createAuthoredPlugin({ authorId: 'erin' }));
    const forger = peer(copyOf(room), WithoutAdmission);

    forger.editor.update((tx) =>
      tx.nodes.insert(
        paragraph({
          authored: [
            { at: 1, author: 'bob', change: '~edit:bob', kind: 'delete' },
          ],
          text: 'x',
        }) as never,
        { at: [1] }
      )
    );
    send(forger.doc, erin.doc);

    const { admission, value } = erin.read();

    assert.deepEqual(
      { state: admission.state, value },
      {
        state: 'ready',
        value: {
          children: [
            paragraph({ text: 'a' }),
            paragraph({
              authored: [
                { at: 1, author: 'bob', change: '~edit:bob', kind: 'delete' },
              ],
              text: 'x',
            }),
          ],
        },
      }
    );
  });
});
