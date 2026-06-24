import {
  createEditor,
  type Descendant,
  type EditorUpdateOptions,
  type Operation,
  type Range,
} from '@platejs/plite';
import { getLastCommit as editorGetLastCommit } from '@platejs/plite/internal';
import { history } from '@platejs/plite-history';
import { describe, expect, it } from 'vitest';

import {
  getProjectedRemoteSelectionPaintTargets,
  getRootKeyedCollabTargets,
} from '../src/editable/projected-collab-substrate';
import type { PliteProjectionOwner } from '../src/projection-graph';

const SHARED_ROOT = 'synced-block:shared:body';
const UNSYNCED_ROOT = 'synced-block:unsynced:body';

const paragraph = (text: string): Descendant => ({
  type: 'paragraph',
  children: [{ text }],
});

const syncedBlock = (bodyRoot: string, copyId: string): Descendant => ({
  type: 'synced-block',
  childRoots: { body: bodyRoot },
  copyId,
  children: [{ text: '' }],
});

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const remoteCollabOptions = {
  metadata: {
    collab: { origin: 'remote', saveToHistory: false },
    history: { mode: 'skip' },
    selection: { dom: 'preserve', focus: false, scroll: false },
  },
  tag: ['collaboration', 'projected-root-lifecycle'],
} satisfies EditorUpdateOptions;

const initialValue = {
  children: [
    paragraph('p1'),
    syncedBlock(SHARED_ROOT, 'original'),
    syncedBlock(SHARED_ROOT, 'copy'),
    paragraph('p2'),
  ],
  roots: { [SHARED_ROOT]: [paragraph('Shared mission statement')] },
};

const createProjectedEditor = () =>
  createEditor({
    extensions: [history()],
    initialValue: clone(initialValue),
  });

const readValue = (editor: ReturnType<typeof createProjectedEditor>) =>
  editor.read((state) => state.value.get());

const replayRemote = (
  editor: ReturnType<typeof createProjectedEditor>,
  operations: readonly Operation[]
) => {
  editor.update((tx) => {
    tx.operations.replay(clone(operations));
  }, remoteCollabOptions);
};

const lastOperations = (editor: ReturnType<typeof createProjectedEditor>) => {
  const commit = editorGetLastCommit(editor);

  expect(commit).not.toBe(null);
  return commit!.operations;
};

const collapsed = (root: string, path: number[], offset: number): Range => ({
  anchor: { path, offset, root },
  focus: { path, offset, root },
});

describe('projected root lifecycle collaboration substrate', () => {
  it('replays duplicate and unsync as root-keyed operations without serializing projection owners', () => {
    const source = createProjectedEditor();
    const remote = createProjectedEditor();

    source.update((tx) => {
      tx.nodes.insert(syncedBlock(SHARED_ROOT, 'duplicate'), { at: [2] });
    });
    replayRemote(remote, lastOperations(source));

    expect(readValue(remote)).toEqual(readValue(source));
    expect(getRootKeyedCollabTargets(readValue(remote))).toEqual([
      { root: 'main' },
      { root: SHARED_ROOT },
    ]);

    source.update((tx) => {
      tx.roots.create(
        UNSYNCED_ROOT,
        clone(readValue(source).roots?.[SHARED_ROOT] ?? [])
      );
      tx.nodes.set(
        {
          childRoots: { body: UNSYNCED_ROOT },
          copyId: 'unsynced',
        },
        { at: [1] }
      );
    });

    const operations = lastOperations(source);

    expect(operations.map((operation) => operation.type)).toEqual([
      'replace_children',
      'set_node',
    ]);
    expect(JSON.stringify(operations)).not.toContain('ownerPath');
    expect(JSON.stringify(operations)).not.toContain('ownerRoot');

    replayRemote(remote, operations);

    expect(readValue(remote)).toEqual(readValue(source));
    expect(readValue(remote).roots?.[SHARED_ROOT]).toEqual([
      paragraph('Shared mission statement'),
    ]);
    expect(readValue(remote).roots?.[UNSYNCED_ROOT]).toEqual([
      paragraph('Shared mission statement'),
    ]);
    expect(remote.read((state) => state.history.undos().length)).toBe(0);
  });

  it('keeps root deletion explicit instead of cascading from owner deletion', () => {
    const source = createProjectedEditor();
    const remote = createProjectedEditor();

    source.update((tx) => {
      tx.nodes.remove({ at: [1] });
    });
    replayRemote(remote, lastOperations(source));

    expect(readValue(remote).roots?.[SHARED_ROOT]).toEqual([
      paragraph('Shared mission statement'),
    ]);

    source.update((tx) => {
      tx.roots.delete(SHARED_ROOT);
    });
    replayRemote(remote, lastOperations(source));

    expect(readValue(remote)).toEqual(readValue(source));
    expect(Object.hasOwn(readValue(remote).roots ?? {}, SHARED_ROOT)).toBe(
      false
    );
  });

  it('keeps remote selections root-qualified while projection paint stays local policy', () => {
    const firstOwner = {
      childRoot: SHARED_ROOT,
      ownerPath: [1],
      ownerRoot: 'main',
    } satisfies PliteProjectionOwner;
    const secondOwner = {
      childRoot: SHARED_ROOT,
      ownerPath: [2],
      ownerRoot: 'main',
    } satisfies PliteProjectionOwner;
    const selection = {
      range: collapsed(SHARED_ROOT, [0, 0], 3),
      root: SHARED_ROOT,
    };

    expect(
      getProjectedRemoteSelectionPaintTargets({
        owners: [firstOwner, secondOwner],
        policy: 'all-projections',
        selection,
      }).map((target) => target.owner?.ownerPath)
    ).toEqual([[1], [2]]);
    expect(
      getProjectedRemoteSelectionPaintTargets({
        activeOwner: secondOwner,
        owners: [firstOwner, secondOwner],
        policy: 'active-projection',
        selection,
      }).map((target) => target.owner?.ownerPath)
    ).toEqual([[2]]);
    expect(
      getProjectedRemoteSelectionPaintTargets({
        owners: [firstOwner, secondOwner],
        policy: 'none',
        selection,
      })
    ).toEqual([]);
  });
});
