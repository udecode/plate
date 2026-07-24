import {
  createEditor,
  type Descendant,
  type DocumentChange,
  type EditorUpdatePolicy,
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

const remoteCollabPolicy = {
  tags: [
    'collaboration',
    'projected-root-lifecycle',
    'history-skip',
    'skip-dom-selection',
    'skip-selection-focus',
    'skip-scroll-into-view',
  ],
} satisfies EditorUpdatePolicy;

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
  editor.read((state) => state.value());

const applyRemote = (
  editor: ReturnType<typeof createProjectedEditor>,
  change: DocumentChange
) => {
  editor.update(remoteCollabPolicy, (tx) => {
    tx.changes.apply(change);
  });
};

const lastChange = (editor: ReturnType<typeof createProjectedEditor>) => {
  const commit = editorGetLastCommit(editor);

  expect(commit).not.toBe(null);
  return commit!.changes;
};

const collapsed = (root: string, path: number[], offset: number): Range => ({
  anchor: { path, offset, root },
  focus: { path, offset, root },
});

describe('projected root lifecycle collaboration substrate', () => {
  it('applies duplicate and unsync as root-keyed changes without serializing projection owners', () => {
    const source = createProjectedEditor();
    const remote = createProjectedEditor();

    source.update((tx) => {
      tx.nodes.insert(syncedBlock(SHARED_ROOT, 'duplicate'), { at: [2] });
    });
    applyRemote(remote, lastChange(source));

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

    const change = lastChange(source);
    const json = change.toJSON();

    expect([...change.createRoots]).toEqual([UNSYNCED_ROOT]);
    expect(json.primary).toBeDefined();
    expect(json.roots?.[UNSYNCED_ROOT]).toBeDefined();
    expect(JSON.stringify(json)).not.toContain('ownerPath');
    expect(JSON.stringify(json)).not.toContain('ownerRoot');

    applyRemote(remote, change);

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
    applyRemote(remote, lastChange(source));

    expect(readValue(remote).roots?.[SHARED_ROOT]).toEqual([
      paragraph('Shared mission statement'),
    ]);

    source.update((tx) => {
      tx.roots.delete(SHARED_ROOT);
    });
    applyRemote(remote, lastChange(source));

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
