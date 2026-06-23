import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createEditor, type Descendant, defineStateField } from '../src';
import { Editor } from '../src/interfaces/editor';

const paragraph = (text: string) =>
  ({
    type: 'paragraph',
    children: [{ text }],
  }) satisfies Descendant;

describe('document state patch contract', () => {
  it('writes state fields as operation-free commits with dirty state keys', () => {
    const documentTitle = defineStateField({
      key: 'document.title',
      collab: 'shared',
      history: 'push',
      initial: () => 'Untitled',
      persist: true,
    });
    const editor = createEditor({
      extensions: [documentTitle],
      initialValue: {
        children: [paragraph('body')],
        state: { [documentTitle.key]: 'Q2 Plan' },
      },
    });
    const stateCommits: NonNullable<ReturnType<typeof Editor.getLastCommit>>[] =
      [];

    const unsubscribe = Editor.subscribeSource(
      editor,
      'state',
      (_snapshot, commit) => {
        if (commit) {
          stateCommits.push(commit);
        }
      }
    );

    editor.update((tx) => {
      tx.setField(documentTitle, 'Q3 Plan');
    });

    unsubscribe();

    const commit = Editor.getLastCommit(editor);
    assert(commit);
    assert.deepEqual(
      editor.read((state) => state.getField(documentTitle)),
      'Q3 Plan'
    );
    assert.deepEqual(commit.operations, []);
    assert.deepEqual(commit.statePatches, [
      {
        key: documentTitle.key,
        previousValue: 'Q2 Plan',
        value: 'Q3 Plan',
      },
    ]);
    assert.deepEqual(commit.dirtyStateKeys, [documentTitle.key]);
    assert.equal(commit.childrenChanged, false);
    assert.equal(commit.snapshotChanged, true);
    assert.equal(stateCommits.length, 1);
    assert.equal(stateCommits[0], commit);
    assert.deepEqual(
      editor.read((state) => state.value.get()),
      {
        children: [paragraph('body')],
        state: { [documentTitle.key]: 'Q3 Plan' },
      }
    );
  });

  it('rejects large shared history fields without patch hooks', () => {
    const largeSharedState = defineStateField({
      key: 'document.large-shared-state',
      collab: 'shared',
      history: 'push',
      initial: () => ({ body: 'initial' }),
      persist: true,
    });
    const editor = createEditor({
      extensions: [largeSharedState],
      initialValue: [paragraph('body')],
    });

    assert.throws(() => {
      editor.update((tx) => {
        tx.setField(largeSharedState, { body: 'x'.repeat(40_000) });
      });
    }, /without patch hooks/);
    assert.deepEqual(
      editor.read((state) => state.getField(largeSharedState)),
      {
        body: 'initial',
      }
    );
  });

  it('rejects large default-history fields without patch hooks', () => {
    const largeDefaultHistoryState = defineStateField({
      key: 'document.large-default-history-state',
      initial: () => ({ body: 'initial' }),
      persist: true,
    });
    const editor = createEditor({
      extensions: [largeDefaultHistoryState],
      initialValue: [paragraph('body')],
    });

    assert.throws(() => {
      editor.update((tx) => {
        tx.setField(largeDefaultHistoryState, { body: 'x'.repeat(40_000) });
      });
    }, /without patch hooks/);
    assert.deepEqual(
      editor.read((state) => state.getField(largeDefaultHistoryState)),
      {
        body: 'initial',
      }
    );
  });

  it('rejects large previous values for default-history fields without patch hooks', () => {
    const largePreviousState = defineStateField({
      key: 'document.large-previous-state',
      initial: () => ({ body: 'initial' }),
      persist: true,
    });
    const editor = createEditor({
      extensions: [largePreviousState],
      initialValue: {
        children: [paragraph('body')],
        state: {
          [largePreviousState.key]: { body: 'x'.repeat(40_000) },
        },
      },
    });

    assert.throws(() => {
      editor.update((tx) => {
        tx.setField(largePreviousState, { body: 'small' });
      });
    }, /without patch hooks/);
    assert.deepEqual(
      editor.read((state) => state.getField(largePreviousState)),
      {
        body: 'x'.repeat(40_000),
      }
    );
  });

  it('stores patch-hook state field commits as compact patches', () => {
    type LargeCounter = {
      body: string;
      count: number;
    };

    const largeCounter = defineStateField<LargeCounter>({
      key: 'document.large-counter',
      applyPatch: (value, patch) => ({
        ...value,
        count: value.count + (patch as number),
      }),
      collab: 'shared',
      diff: (previous, value) => value.count - previous.count,
      history: 'push',
      initial: () => ({ body: 'x'.repeat(40_000), count: 0 }),
      invertPatch: (patch) => -(patch as number),
      persist: true,
    });
    const source = createEditor({
      extensions: [largeCounter],
      initialValue: [paragraph('body')],
    });
    const remote = createEditor({
      extensions: [largeCounter],
      initialValue: [paragraph('body')],
    });

    source.update((tx) => {
      tx.setField(largeCounter, (value) => ({
        ...value,
        count: value.count + 2,
      }));
    });

    const commit = Editor.getLastCommit(source);

    assert(commit);
    assert.deepEqual(commit.statePatches, [
      {
        inversePatch: -2,
        key: largeCounter.key,
        patch: 2,
      },
    ]);
    assert.equal(JSON.stringify(commit.statePatches).includes('xxxxx'), false);

    remote.update((tx) => {
      tx.statePatches.replay(commit.statePatches);
    });

    assert.deepEqual(
      remote.read((state) => state.getField(largeCounter)),
      {
        body: 'x'.repeat(40_000),
        count: 2,
      }
    );
  });

  it('drops state patches that return to the transaction baseline', () => {
    const documentTitle = defineStateField({
      key: 'document.title',
      history: 'push',
      initial: () => 'Untitled',
      persist: true,
    });
    const editor = createEditor({
      extensions: [documentTitle],
      initialValue: {
        children: [paragraph('body')],
        state: { [documentTitle.key]: 'Q2 Plan' },
      },
    });
    let commits = 0;
    const unsubscribe = editor.subscribe((_snapshot, commit) => {
      if (commit) {
        commits++;
      }
    });

    editor.update((tx) => {
      tx.setField(documentTitle, 'Q3 Plan');
      tx.setField(documentTitle, 'Q2 Plan');
    });

    unsubscribe();

    assert.equal(
      editor.read((state) => state.getField(documentTitle)),
      'Q2 Plan'
    );
    assert.deepEqual(Editor.getLastCommit(editor)?.statePatches ?? [], []);
    assert.equal(commits, 0);
  });
});
