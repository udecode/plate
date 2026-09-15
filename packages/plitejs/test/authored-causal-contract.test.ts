import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor } from 'plitejs';
import { authored } from 'plitejs/authored';

import { readRecord, records } from '../src/authored/record-tree';
import {
  authoredState,
  matchingAuthoredChanges,
  reduceAuthoredOperation,
  type AuthoredOperation,
  type AuthoredState,
} from '../src/authored/state';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const point = (offset: number, block = 0) => ({ path: [block, 0], offset });
const latest = (state: AuthoredState): AuthoredOperation => {
  const operation = [...records(state.operations)]
    .map(([, value]) => value)
    .find((value) => value.clock === state.clock);
  assert.ok(operation);
  return operation;
};
const logicalChanges = (state: AuthoredState) =>
  [...records(state.changes)].map(([id, value]) => [
    id,
    {
      ...value,
      operations: [...records(value.operations)],
      reviews: [...records(value.reviews)],
    },
  ]);

describe('authored causal amendments', () => {
  it('rejects reuse of a contribution identity without observing its creation', () => {
    const peers = [0, 1].map(() => {
      const editor = createEditor({
        plugins: [authored({ authorId: 'alice' })],
        initialValue: [paragraph('Base')],
      });
      editor.update((tx) => {
        tx.authored.propose();
        tx.text.insert('q', { at: point(4) });
      });
      return editor.read.getField(authoredState);
    });
    const first = latest(peers[0]);
    const second = latest(peers[1]);
    assert.ok(first.kind === 'edit' && second.kind === 'edit');
    assert.throws(
      () =>
        reduceAuthoredOperation(peers[0], {
          ...second,
          changeId: first.changeId,
        }),
      /contribution prerequisite/
    );
  });

  for (const action of ['accept', 'reject'] as const) {
    for (const atomic of [false, true]) {
      it(`merges an amendment concurrent with ${atomic ? 'an atomic ' : ''}${action} in either order`, () => {
        const original = createEditor({
          plugins: [authored({ authorId: 'alice' })],
          initialValue: [paragraph('A'), paragraph('B')],
        });
        const ids = [0, 1].map((block) => {
          let id = '';
          original.update((tx) => {
            id = tx.authored.propose();
            tx.text.insert('q', { at: point(1, block) });
          });
          return id;
        });
        const saved = JSON.parse(JSON.stringify(original.read.value()));
        const author = createEditor({
          plugins: [authored({ authorId: 'alice' })],
          initialValue: saved,
        });
        const reviewer = createEditor({
          plugins: [authored({ authorId: 'bob' })],
          initialValue: saved,
        });
        author.update((tx) => {
          tx.authored.propose({ changeId: ids[0] });
          tx.text.insert('x', { at: point(2) });
        });
        assert.equal(
          reviewer.update.authored.decide({
            action,
            selection: reviewer.read.authored.select({
              ids: atomic ? ids : [ids[0]],
            }),
          }).status,
          'applied'
        );
        const authorState = author.read.getField(authoredState);
        const reviewerState = reviewer.read.getField(authoredState);
        const first = reduceAuthoredOperation(
          authorState,
          latest(reviewerState)
        );
        const second = reduceAuthoredOperation(
          reviewerState,
          latest(authorState)
        );
        assert.deepEqual(logicalChanges(first), logicalChanges(second));
        assert.equal(readRecord(first.changes, ids[0])?.status, 'conflicted');
        assert.equal(
          readRecord(first.changes, ids[1])?.status,
          atomic ? 'conflicted' : 'pending'
        );
        assert.deepEqual(first.frontier, second.frontier);
        for (const state of [first, second]) {
          assert.deepEqual(
            [
              ...matchingAuthoredChanges(state, {
                authorId: 'alice',
                status: 'conflicted',
              }),
            ]
              .map((item) => item.change.id)
              .sort(),
            (atomic ? ids : [ids[0]]).slice().sort()
          );
        }
      });
    }
  }

  it('retains concurrent amendments from two replicas of the same author', () => {
    const original = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    let id = '';
    original.update((tx) => {
      id = tx.authored.propose();
      tx.text.insert('q', { at: point(4) });
    });
    const saved = JSON.parse(JSON.stringify(original.read.value()));
    const peers = ['x', 'z'].map((text) => {
      const peer = createEditor({
        plugins: [authored({ authorId: 'alice' })],
        initialValue: saved,
      });
      peer.update((tx) => {
        tx.authored.propose({ changeId: id });
        tx.text.insert(text, { at: point(5) });
      });
      return peer.read.getField(authoredState);
    });
    const first = reduceAuthoredOperation(peers[0], latest(peers[1]));
    const second = reduceAuthoredOperation(peers[1], latest(peers[0]));
    assert.deepEqual(logicalChanges(first), logicalChanges(second));
    assert.equal(readRecord(first.changes, id)?.status, 'pending');
    assert.deepEqual(
      readRecord(first.changes, id)?.heads,
      peers.map((state) => latest(state).id).sort()
    );
    assert.equal(readRecord(first.changes, id)?.revision, 3);
  });

  for (const action of ['accept', 'reject'] as const) {
    it(`rejects an amendment that has already observed ${action}`, () => {
      const editor = createEditor({
        plugins: [authored({ authorId: 'alice' })],
        initialValue: [paragraph('Base')],
      });
      let id = '';
      editor.update((tx) => {
        id = tx.authored.propose();
        tx.text.insert('q', { at: point(4) });
      });
      assert.equal(
        editor.update.authored.decide({
          action,
          selection: editor.read.authored.select({ ids: [id] }),
        }).status,
        'applied'
      );
      const reviewed = editor.read.getField(authoredState);
      editor.update.text.insert('x', { at: point(0) });
      const operation = latest(editor.read.getField(authoredState));
      assert.ok(operation.kind === 'edit');
      assert.throws(
        () =>
          reduceAuthoredOperation(reviewed, {
            ...operation,
            kind: 'edit',
            changeId: id,
            dependencies: [],
            proposal: true,
          }),
        /amend a pending change/
      );
    });
  }
});
