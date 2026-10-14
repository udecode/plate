import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { createAuthoredPlugin } from '../../src/authored/authored';
import {
  authoredRecords,
  CONTEXTS_ROOT,
  contextElementOf,
  contextRecordOf,
  VERDICTS_ROOT,
  verdictElementOf,
} from '../../src/authored/facts/records';
import { authoredMarksSchema } from '../../src/authored/tree/marks';
import { createEditor, definePlugin } from '../../src/index';
import { yjs } from '../../src/yjs/core/plugin';
import { authoredTestApi } from '../support/authored';

const ann = { at: 1, author: 'ann', change: 'A', kind: 'insert' };
const bob = { at: 2, author: 'bob', change: 'B', kind: 'insert' };
const inBob = contextRecordOf(null, bob);
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
      const bobContextMintedByEachPeer = [
        contextElementOf(inBob),
        contextElementOf(inBob),
      ];
      const upgraded = {
        admission: { state: 'ready' },
        value: {
          children: [paragraph({ text: 'a' }, compacted)],
          roots: {
            [CONTEXTS_ROOT]: bobContextMintedByEachPeer,
          },
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
      createAuthoredPlugin({ authorId: 'dana', intent: 'edit' })
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
        roots: { [CONTEXTS_ROOT]: [contextElementOf(inBob)] },
      },
    };

    assert.deepEqual([dana.read(), writer.read()], [admitted, admitted]);

    authoredTestApi(dana.editor).decide({ action: 'accept', changes: ['B'] });
    send(dana.doc, room);

    const accepted = {
      admission: { state: 'ready' },
      value: {
        children: [paragraph({ text: 'a' }, { authored: [ann], text: 'x' })],
        roots: {
          [CONTEXTS_ROOT]: [contextElementOf(inBob)],
          [VERDICTS_ROOT]: [
            verdictElementOf({ member: bob, verdict: 'accept' }),
          ],
        },
      },
    };

    assert.deepEqual([dana.read(), writer.read()], [accepted, accepted]);
  });

  it('refuses a verdict that a peer without the record roots writes into the content', () => {
    const room = new Y.Doc();
    const writer = peer(room, WithoutContexts, [paragraph({ text: 'a' })]);
    const erin = peer(copyOf(room), createAuthoredPlugin({ authorId: 'erin' }));

    writer.editor.update((tx) => {
      tx.nodes.insert(
        verdictElementOf({ member: bob, verdict: 'accept' }) as never,
        { at: [1] }
      );
    });
    send(room, erin.doc);

    const { admission, value } = erin.read();

    assert.deepEqual(
      {
        cause: admission.state === 'error' && String(admission.cause),
        value,
      },
      {
        cause:
          'EditorSchemaValidationError: Editor primary root cannot contain "authored-verdict".',
        value: { children: [paragraph({ text: 'a' })] },
      }
    );
  });
});
