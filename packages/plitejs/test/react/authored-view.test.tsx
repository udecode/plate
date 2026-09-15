import assert from 'node:assert/strict';

import { act, render } from '@testing-library/react';
import { createEditorView } from 'plitejs';
import { authored } from 'plitejs/authored';
import { history } from 'plitejs/history';
import {
  createEditor,
  Editable,
  EditorRoot,
  useEditorContext,
  useEditorSelector,
} from 'plitejs/react';
import React from 'react';
import { describe, it } from 'vitest';

import { setEditorReadOnly } from '../../src/core/public-state';
import { writeRuntimeSelection } from '../../src/react/editable/runtime-mutation-state';
import {
  readRuntimeSelection,
  readRuntimeSelectionRange,
} from '../../src/react/editable/runtime-selection-state';
import { createReactRuntimeViewEditor } from '../../src/react/hooks/use-plite-runtime';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const point = (offset: number) => ({ path: [0, 0], offset });
const proposal = { intent: 'propose', projection: 'proposed' } as const;

describe('authored React view identity', () => {
  it('imports read-only proposed selections into their exact view', () => {
    const source = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    source.update.selection.set(point(1));
    const view = createReactRuntimeViewEditor(
      createEditorView(source, { authored: proposal })
    );
    view.update.selection.set(point(4));
    view.update.text.insert(' draft');
    setEditorReadOnly(view, true);
    writeRuntimeSelection(view, point(8));
    assert.deepEqual(view.read.selection(), {
      anchor: point(8),
      focus: point(8),
    });
    assert.deepEqual(source.read.selection(), {
      anchor: point(1),
      focus: point(1),
    });
    assert.throws(() => view.update.text.insert('!'), /read-only/);
    assert.equal(view.read.text.string([]), 'Base draft');
  });

  it('reads the exact authored view selection for native input', () => {
    const source = createEditor({
      plugins: [authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    source.update.selection.set(point(1));
    const view = createReactRuntimeViewEditor(createEditorView(source));
    view.api.authored.setView(proposal);
    view.update.selection.set(point(4));
    view.update.text.insert(' draft');
    assert.deepEqual(readRuntimeSelection(view), {
      kind: 'text',
      ...view.read.selection(),
    });
    assert.deepEqual(readRuntimeSelectionRange(view), {
      kind: 'text',
      ...view.read.selection(),
    });
    assert.deepEqual(readRuntimeSelection(source), {
      kind: 'text',
      ...source.read.selection(),
    });
    view.update((tx) => {
      tx.selection.set(point(8));
      assert.deepEqual(readRuntimeSelection(view), {
        kind: 'text',
        anchor: point(8),
        focus: point(8),
      });
    });
    view.update.selection.set(null);
    assert.equal(readRuntimeSelection(view), null);
    assert.equal(readRuntimeSelectionRange(view), null);
    assert.deepEqual(source.read.selection(), {
      anchor: point(1),
      focus: point(1),
    });
  });

  it('publishes mode changes before any proposal exists', async () => {
    const authoring = authored({ authorId: 'alice' });
    const editor = createEditor({
      plugins: [authoring],
      initialValue: [paragraph('Base')],
    });
    let view!: ReturnType<typeof useEditorContext>;
    const Mode = () => {
      view = useEditorContext();
      return (
        <span>
          {useEditorSelector(
            (currentEditor) =>
              currentEditor.plugin(authoring).read.view().intent
          )}
        </span>
      );
    };
    const rendered = render(
      <EditorRoot editor={editor}>
        <Mode />
      </EditorRoot>
    );
    assert.equal(rendered.container.textContent, 'edit');
    await act(async () => view.plugin(authoring).api.setView(proposal));
    assert.equal(rendered.container.textContent, 'propose');
    await act(async () =>
      view
        .plugin(authoring)
        .api.setView({ intent: 'edit', projection: 'accepted' })
    );
    assert.equal(rendered.container.textContent, 'edit');
  });

  it('shares policy and durable selection between the native view and its React facade', () => {
    const source = createEditor({
      plugins: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    const native = createEditorView(source);
    const view = createReactRuntimeViewEditor(native);
    view.api.authored.setView(proposal);
    assert.deepEqual(native.read.authored.view(), proposal);
    assert.deepEqual(view.read.authored.view(), proposal);
    view.update.selection.set(point(4));
    view.update.text.insert(' draft');
    assert.deepEqual(source.read.children(), [paragraph('Base')]);
    assert.deepEqual(view.read.children(), [paragraph('Base draft')]);
    assert.deepEqual(view.read.selection(), {
      anchor: point(10),
      focus: point(10),
    });
    view.update.history.undo();
    assert.deepEqual(view.read.children(), [paragraph('Base')]);
    assert.deepEqual(view.read.selection(), {
      anchor: point(4),
      focus: point(4),
    });
    view.update.history.redo();
    assert.deepEqual(view.read.children(), [paragraph('Base draft')]);
    view.api.authored.setView({ intent: 'edit', projection: 'accepted' });
    assert.deepEqual(native.read.children(), [paragraph('Base')]);
  });

  it('mounts independent accepted and proposed views and changes only the configured policy', async () => {
    const editor = createEditor({
      plugins: [history(), authored({ authorId: 'alice' })],
      initialValue: [paragraph('Base')],
    });
    const views = new Map<string, ReturnType<typeof useEditorContext>>();
    const Surface = ({ name }: { name: string }) => {
      views.set(name, useEditorContext());
      return <Editable aria-label={name} />;
    };
    const content = (proposing: boolean) => (
      <>
        <EditorRoot editor={editor}>
          <Surface name="Accepted" />
        </EditorRoot>
        <EditorRoot
          authored={
            proposing ? proposal : { intent: 'edit', projection: 'accepted' }
          }
          editor={editor}
        >
          <Surface name="Review" />
        </EditorRoot>
      </>
    );
    const rendered = render(content(true));
    const review = views.get('Review')!;
    const accepted = views.get('Accepted')!;
    await act(async () => {
      review.update.selection.set(point(4));
      review.update.text.insert(' draft');
    });
    assert.equal(
      rendered.getByRole('textbox', { name: 'Accepted' }).textContent,
      'Base'
    );
    assert.equal(
      rendered.getByRole('textbox', { name: 'Review' }).textContent,
      'Base draft'
    );
    assert.deepEqual(editor.read.value().children, [paragraph('Base')]);
    await act(async () => rendered.rerender(content(false)));
    assert.equal(views.get('Review'), review);
    assert.equal(views.get('Accepted'), accepted);
    assert.equal(
      rendered.getByRole('textbox', { name: 'Review' }).textContent,
      'Base'
    );
    await act(async () => rendered.rerender(content(true)));
    assert.equal(
      rendered.getByRole('textbox', { name: 'Review' }).textContent,
      'Base draft'
    );
    await act(async () => review.update.text.insert('!'));
    assert.equal(
      rendered.getByRole('textbox', { name: 'Review' }).textContent,
      'Base draft!'
    );
    assert.equal(
      rendered.getByRole('textbox', { name: 'Accepted' }).textContent,
      'Base'
    );
    rendered.unmount();
    assert.throws(() => review.update.text.insert('stale'), /read-only/);
  });
});
