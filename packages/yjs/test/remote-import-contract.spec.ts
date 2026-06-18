import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  type Descendant,
  defineEditorExtension,
  type Operation,
  type Editor as SlateEditor,
} from '@platejs/slate';

import {
  clearYjsTrace,
  createSeededYjsPeers,
  getPeerTopLevelTexts,
  getYjsTrace,
  paragraph,
  syncConnectedPeers,
} from './support/collaboration';

type RecordedRemoteImportCommit = {
  readonly operationTypes: Operation['type'][];
  readonly tags: readonly string[];
};

const largeValue = (count = 32): Descendant[] =>
  Array.from({ length: count }, (_, index) =>
    paragraph(`block-${String(index).padStart(3, '0')}`)
  );

const recordRemoteImportCommits = (
  editor: SlateEditor
): RecordedRemoteImportCommit[] => {
  const commits: RecordedRemoteImportCommit[] = [];

  editor.extend(
    defineEditorExtension({
      name: 'remote-import-commit-recorder',
      setup() {
        return {
          onCommit({ commit }): void {
            if (!commit.tags.includes('remote-yjs-import')) {
              return;
            }

            commits.push({
              operationTypes: commit.operations.map(
                (operation) => operation.type
              ),
              tags: [...commit.tags],
            });
          },
        };
      },
    })
  );

  return commits;
};

describe('@platejs/yjs remote import contract', () => {
  it('imports remote Yjs updates through one full replace commit today', () => {
    const [source, target] = createSeededYjsPeers({
      children: largeValue(),
      clientIds: ['source', 'target'],
      numericClientIds: { source: 101, target: 202 },
    });

    assert(source);
    assert(target);

    const remoteImportCommits = recordRemoteImportCommits(target.editor);

    clearYjsTrace(target);
    source.editor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 'block-000'.length },
      });
    });
    syncConnectedPeers([source, target]);

    assert.equal(getPeerTopLevelTexts(target)[0], 'block-000!');
    assert.deepEqual(remoteImportCommits, [
      {
        operationTypes: [],
        tags: ['collaboration', 'remote-yjs-import'],
      },
    ]);
    assert.deepEqual(getYjsTrace(target), [
      {
        importedChildren: 32,
        importKind: 'full-read-replace',
        mode: 'remote-reconcile',
      },
    ]);
  });

  it('converges a large remote document after distributed text edits', () => {
    const blockCount = 256;
    const middleIndex = Math.floor(blockCount / 2);
    const [source, target] = createSeededYjsPeers({
      children: largeValue(blockCount),
      clientIds: ['source', 'target'],
      numericClientIds: { source: 101, target: 202 },
    });

    assert(source);
    assert(target);

    clearYjsTrace(target);
    source.editor.update((tx) => {
      tx.text.insert('!', {
        at: { path: [0, 0], offset: 'block-000'.length },
      });
      tx.text.insert('?', {
        at: {
          path: [middleIndex, 0],
          offset: `block-${String(middleIndex).padStart(3, '0')}`.length,
        },
      });
      tx.text.insert('.', {
        at: {
          path: [blockCount - 1, 0],
          offset: `block-${String(blockCount - 1).padStart(3, '0')}`.length,
        },
      });
    });
    syncConnectedPeers([source, target]);

    const targetTexts = getPeerTopLevelTexts(target);

    assert.equal(targetTexts.length, blockCount);
    assert.equal(targetTexts[0], 'block-000!');
    assert.equal(targetTexts[middleIndex], `block-${middleIndex}?`);
    assert.equal(targetTexts[blockCount - 1], `block-${blockCount - 1}.`);
    assert.deepEqual(getPeerTopLevelTexts(source), targetTexts);
    assert.deepEqual(getYjsTrace(target), [
      {
        importedChildren: blockCount,
        importKind: 'full-read-replace',
        mode: 'remote-reconcile',
      },
    ]);
  });
});
