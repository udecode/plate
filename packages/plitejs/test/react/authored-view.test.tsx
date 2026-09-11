import assert from 'node:assert/strict';

import { act, render, renderHook } from '@testing-library/react';
import { createEditorView } from 'plitejs';
import { authored } from 'plitejs/authored';
import { history } from 'plitejs/history';
import {
  createEditor,
  Editable,
  Plite,
  PliteRuntime,
  useEditorContext,
  useEditorSelector,
  usePliteRuntime,
} from 'plitejs/react';
import React from 'react';
import { describe, it } from 'vitest';

import { createReactRuntimeViewEditor } from '../../src/react/hooks/use-plite-runtime';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const point = (offset: number) => ({ path: [0, 0], offset });
const proposal = { intent: 'propose', projection: 'proposed' } as const;

describe('authored React view identity', () => {
  it('publishes mode changes before any proposal exists', async () => {
    const authoring = authored({ authorId: 'alice' });
    const runtime = renderHook(() =>
      usePliteRuntime({
        extensions: [authoring],
        initialValue: [paragraph('Base')],
      })
    ).result.current;
    let view!: ReturnType<typeof useEditorContext>;
    const Mode = () => {
      view = useEditorContext();
      return (
        <span>
          {useEditorSelector(
            (editor) => editor.extension(authoring).read.view().intent
          )}
        </span>
      );
    };
    const rendered = render(
      <PliteRuntime runtime={runtime}>
        <Plite>
          <Mode />
        </Plite>
      </PliteRuntime>
    );
    assert.equal(rendered.container.textContent, 'edit');
    await act(async () => view.extension(authoring).api.setView(proposal));
    assert.equal(rendered.container.textContent, 'propose');
    await act(async () =>
      view
        .extension(authoring)
        .api.setView({ intent: 'edit', projection: 'accepted' })
    );
    assert.equal(rendered.container.textContent, 'edit');
  });

  it('shares policy and durable selection between the native view and its React facade', () => {
    const source = createEditor({
      extensions: [history(), authored({ authorId: 'alice' })],
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
    const runtime = renderHook(() =>
      usePliteRuntime({
        extensions: [history(), authored({ authorId: 'alice' })],
        initialValue: [paragraph('Base')],
      })
    ).result.current;
    const views = new Map<string, ReturnType<typeof useEditorContext>>();
    const Surface = ({ name }: { name: string }) => {
      views.set(name, useEditorContext());
      return <Editable aria-label={name} />;
    };
    const content = (proposing: boolean) => (
      <PliteRuntime runtime={runtime}>
        <Plite>
          <Surface name="Accepted" />
        </Plite>
        <Plite
          authored={
            proposing ? proposal : { intent: 'edit', projection: 'accepted' }
          }
        >
          <Surface name="Review" />
        </Plite>
      </PliteRuntime>
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
    assert.deepEqual(runtime.read.value().children, [paragraph('Base')]);
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
