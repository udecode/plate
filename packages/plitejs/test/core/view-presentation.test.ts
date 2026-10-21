import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  createEditor,
  createEditorView,
  definePlugin,
  type Element,
} from 'plitejs';
import {
  getStateViewPresentation,
  getViewPresentation,
  onPresentationRelease,
  retainViewPresentation,
  withMountedPresentation,
} from 'plitejs/internal';

import { createAuthoredPlugin } from '../../src/authored/authored';
import { isViewPresentationRetained } from '../../src/core/view-presentation';

const paragraph = (text: string): Element => ({
  type: 'paragraph',
  children: [{ text }],
});

const createNotesEditor = ({ readOnly = false } = {}) =>
  createEditor({
    initialValue: {
      children: [paragraph('main')],
      roots: { note: [paragraph('note')] },
    },
    plugins: [createAuthoredPlugin({ authorId: 'ann' })],
    readOnly,
  });

describe('view presentations', () => {
  it('gives each view of a base editor its own presentation', () => {
    const editor = createNotesEditor();
    const presentations = [
      editor,
      createEditorView(editor),
      createEditorView(editor),
    ].map(getViewPresentation);

    assert.equal(new Set(presentations).size, 3);
  });

  it('keeps the source presentation in views of a view', () => {
    const view = createEditorView(createNotesEditor());
    const note = createEditorView(view, { root: 'note' });
    const presentations = [view, note, createEditorView(note)].map(
      getViewPresentation
    );

    assert.equal(new Set(presentations).size, 1);
  });
});

describe('withMountedPresentation', () => {
  it("mounts a base editor under another view's presentation", () => {
    const editor = createNotesEditor({ readOnly: true });
    const view = createEditorView(editor, { root: 'note' });

    editor.api.authored.setView({ preview: 'accepted' });
    const mounted = withMountedPresentation(editor, view);

    assert.deepEqual(
      [
        getViewPresentation(mounted) === getViewPresentation(view),
        mounted.read.view.root(),
        mounted.read.view.isReadOnly(),
        mounted.read.authored.view(),
      ],
      [true, undefined, true, { preview: 'accepted' }]
    );
  });

  it("mounts a root-scoped view under another view's presentation", () => {
    const editor = createNotesEditor();
    const source = createEditorView(editor, {
      authored: { preview: 'proposed' },
      readOnly: true,
      root: 'note',
    });
    const view = createEditorView(editor);
    const mounted = withMountedPresentation(source, view);

    assert.deepEqual(
      [
        getViewPresentation(mounted) === getViewPresentation(view),
        mounted.read.view.root(),
        mounted.read.view.isReadOnly(),
        mounted.read.authored.view(),
      ],
      [true, 'note', true, { preview: 'proposed' }]
    );
  });

  it('refuses a view of another editor', () => {
    const editor = createNotesEditor();
    const foreign = createEditorView(createNotesEditor());

    assert.throws(() => withMountedPresentation(editor, foreign), TypeError);
  });
});

describe('getStateViewPresentation', () => {
  it("leads a view's read state and transactions to its presentation", () => {
    const view = createEditorView(createNotesEditor(), { root: 'note' });
    const presentations: unknown[] = [];

    view.read((state) => {
      presentations.push(getStateViewPresentation(state));
      state.transaction((tx) => {
        presentations.push(getStateViewPresentation(tx));
      });
    });
    view.update((tx) => {
      presentations.push(getStateViewPresentation(tx));
    });

    assert.deepEqual(
      presentations.map(
        (presentation) => presentation === getViewPresentation(view)
      ),
      [true, true, true]
    );
  });

  it("leads the state a plugin read builder receives to its view's presentation", () => {
    const Probe = definePlugin('presentationProbe', {
      read: ({ state }) => ({
        presentation: () => getStateViewPresentation(state),
      }),
    });
    const editor = createEditor({ plugins: [Probe] });
    const view = createEditorView(editor);
    const presentations = [view.read.presentationProbe.presentation()];

    view.update((tx) => {
      presentations.push(tx.presentationProbe.presentation());
    });

    assert.deepEqual(
      presentations.map(
        (presentation) => presentation === getViewPresentation(view)
      ),
      [true, true]
    );
  });
});

describe('view presentation retention', () => {
  it('counts each retainer once, however often its release runs', () => {
    const view = createEditorView(createEditor());
    const release = retainViewPresentation(view);

    retainViewPresentation(view);
    release();
    release();

    assert.equal(isViewPresentationRetained(getViewPresentation(view)), true);
  });

  it('runs each subscribed listener once when the last retainer releases', () => {
    const view = createEditorView(createEditor());
    const runs: string[] = [];
    const releaseFirst = retainViewPresentation(view);
    const releaseLast = retainViewPresentation(createEditorView(view));

    onPresentationRelease(getViewPresentation(view), () => runs.push('kept'));
    onPresentationRelease(getViewPresentation(createEditorView(view)), () =>
      runs.push('dropped')
    )();
    releaseFirst();
    runs.push('first released');
    releaseLast();
    releaseLast();

    assert.deepEqual(runs, ['first released', 'kept']);
  });

  it('starts fresh when retained again after its release', () => {
    const view = createEditorView(createEditor());
    const runs: string[] = [];

    onPresentationRelease(getViewPresentation(view), () =>
      runs.push('first life')
    );
    retainViewPresentation(view)();
    const release = retainViewPresentation(view);
    onPresentationRelease(getViewPresentation(view), () =>
      runs.push('second life')
    );
    const retained = isViewPresentationRetained(getViewPresentation(view));
    release();

    assert.deepEqual([retained, runs], [true, ['first life', 'second life']]);
  });
});
