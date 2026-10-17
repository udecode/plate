import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import * as Y from 'yjs';

import { createAuthoredPlugin } from '../../src/authored/authored';
import {
  createEditor,
  defineEffect,
  definePlugin,
  valueCodecs,
} from '../../src/index';
import { yjs } from '../../src/yjs/core/plugin';
import { paragraph } from './support/collaboration';

const ROOT_NAME = 'authored-legacy-room';

describe('plitejs/yjs rooms an earlier authored build wrote', () => {
  it('refuses to load a room holding the old authored operation log', () => {
    // The effect the authored plugin shared before review marks moved into
    // the document.
    const legacyOperations = defineEffect<string>({
      collab: 'shared',
      collabReplay: 'live',
      key: 'authored.operation',
      persist: { ...valueCodecs.string, version: 1 },
    });
    const writer = createEditor({
      initialValue: [paragraph('body')],
      plugins: [
        definePlugin('legacy-authored', { effectTypes: [legacyOperations] }),
      ],
    });
    const doc = new Y.Doc();
    const stop = writer.install(
      yjs({ doc, initialReady: true, rootName: ROOT_NAME, seed: true })
    );

    writer.update((tx) => {
      tx.effects.emit(legacyOperations, 'pending suggestion');
    });
    stop();

    const reader = createEditor({
      initialValue: [paragraph('body')],
      plugins: [createAuthoredPlugin({ authorId: 'bob' })],
    });
    const room = new Y.Doc();

    Y.applyUpdate(room, Y.encodeStateAsUpdate(doc));
    assert.throws(
      () =>
        reader.install(
          yjs({ doc: room, initialReady: true, rootName: ROOT_NAME })
        ),
      // The review marks property changes the schema the room was written
      // with, so the room refuses before its effect log replays.
      /Yjs derived schema mismatch/
    );
  });
});
