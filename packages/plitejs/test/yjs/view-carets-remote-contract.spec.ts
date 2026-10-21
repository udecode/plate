import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import { createEditorView, type Point } from 'plitejs';
import {
  getCaretOwner,
  getViewPresentation,
  retainViewPresentation,
} from 'plitejs/internal';

import { getPlacementGeneration } from '../../src/core/view-carets';
import type { AnyEditor } from '../../src/interfaces/editor';
import {
  createSeededYjsHistoryPeers,
  paragraph,
  syncConnectedPeers,
} from './support/collaboration';

const point = (offset: number, path = [0, 0]): Point => ({ offset, path });

const releases: Array<() => void> = [];
const names = new Map<unknown, string>();

afterEach(() => {
  for (const release of releases.splice(0)) release();
  names.clear();
});

const retained = <TView extends AnyEditor>(name: string, view: TView) => {
  names.set(getViewPresentation(view), name);
  releases.push(retainViewPresentation(view));

  return view;
};

const owner = (editor: AnyEditor) => {
  const current = getCaretOwner(editor);

  return (
    current && `${names.get(current.presentation)}:${current.root ?? 'main'}`
  );
};

const place = (view: AnyEditor, at: Point) =>
  view.update((tx) => {
    tx.selection.set(at);
  });

describe('view carets through remote edits and history (R11)', () => {
  it('keeps the owner through a remote edit and moves it on undo through a view', () => {
    const [local, remote] = createSeededYjsHistoryPeers({
      children: [paragraph('abcdefghij')],
      clientIds: ['local', 'remote'],
    });
    const { editor } = local;
    const a = retained('A', createEditorView(editor));
    const b = retained('B', createEditorView(editor));
    const observed: Array<string | null> = [];

    place(b, point(8));
    b.update((tx) => tx.text.insert('!'));
    place(a, point(1));
    remote.editor.update((tx) => tx.text.insert('R', { at: point(0) }));
    syncConnectedPeers([local, remote]);
    observed.push(owner(editor));
    b.api.history.undo();
    observed.push(owner(editor));

    assert.deepEqual(observed, ['A:main', 'B:main']);
  });

  it('leaves no owner when a remote change arrives while no view holds the caret', () => {
    const [local, remote] = createSeededYjsHistoryPeers({
      children: [paragraph('abcdefghij')],
      clientIds: ['local', 'remote'],
    });
    const { editor } = local;

    retained('A', createEditorView(editor));
    retained('B', createEditorView(editor));
    place(editor, point(4));
    const generation = getPlacementGeneration(editor);
    remote.editor.update((tx) => tx.text.insert('R', { at: point(0) }));
    syncConnectedPeers([local, remote]);

    assert.deepEqual(
      [owner(editor), getPlacementGeneration(editor)],
      [null, generation]
    );
  });
});
