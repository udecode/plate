import { act, render } from '@testing-library/react';
import React from 'react';
import { expect, test } from 'vitest';

import { authored } from '../../src/authored';
import { setEditorReadOnly } from '../../src/core/public-state';
import { createEditorView } from '../../src/editor-runtime-view';
import { Editable } from '../../src/react/components/editable-text-blocks';
import { EditorRoot } from '../../src/react/components/plite';
import { getEditorRuntime } from '../../src/react/editable/runtime-editor-api';
import { useEditorContext } from '../../src/react/hooks/use-editor-context';
import { createEditor } from '../../src/react/plugin/with-react';

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});
const accepted = { intent: 'edit', projection: 'accepted' } as const;
const proposal = { intent: 'propose', projection: 'proposed' } as const;

class DataTransferStub {
  data = new Map<string, string>();
  files = [] as unknown as FileList;

  get types() {
    return [...this.data.keys()];
  }

  getData(format: string) {
    return this.data.get(format) ?? '';
  }

  setData(format: string, value: string) {
    this.data.set(format, value);
  }
}

test('pastes plain text at the caret in a mounted authored view', async () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice', retainHistory: true })],
    initialValue: [paragraph('A separate document.')],
  });
  let view!: ReturnType<typeof useEditorContext>;
  const Capture = () => {
    view = useEditorContext();

    return <Editable aria-label="mounted authored paste" />;
  };
  const mounted = render(
    <EditorRoot editor={source}>
      <Capture />
    </EditorRoot>
  );
  const data = new DataTransferStub();

  await act(async () => {
    view.update((tx) => {
      tx.selection.set({
        anchor: { offset: 19, path: [0, 0] },
        focus: { offset: 19, path: [0, 0] },
        kind: 'text',
      });
    });
  });
  data.setData('text/plain', 'better ');
  await act(async () => {
    view.api.dom.clipboard.insertData(data as unknown as DataTransfer);
  });

  expect(view.read.text.string([])).toBe('A separate documentbetter .');
  mounted.unmount();
});

test('reconciles authored policy values without resetting commands on unrelated renders', async () => {
  const authoring = authored({ authorId: 'alice' });
  const source = createEditor({
    plugins: [authoring],
    initialValue: [paragraph('Body')],
  });
  let view!: ReturnType<typeof useEditorContext>;
  const Capture = () => {
    view = useEditorContext();
    return <Editable aria-label="policy" />;
  };
  const tree = (projection: 'markup' | 'proposed') => (
    <EditorRoot editor={source} authored={{ intent: 'propose', projection }}>
      <Capture />
    </EditorRoot>
  );
  const mounted = render(tree('markup'));
  const first = view;

  expect(view.plugin(authoring).read.view()).toEqual({
    intent: 'propose',
    projection: 'markup',
  });
  await act(async () => view.plugin(authoring).api.setView(accepted));
  mounted.rerender(tree('markup'));
  expect(view).toBe(first);
  expect(view.plugin(authoring).read.view()).toEqual(accepted);

  mounted.rerender(tree('proposed'));
  expect(view).toBe(first);
  expect(view.plugin(authoring).read.view()).toEqual(proposal);
  expect(source.plugin(authoring).read.view()).toEqual(accepted);
  mounted.unmount();
});

test('captures source defaults once and keeps mounted policy independent', async () => {
  const source = createEditor({
    plugins: [authored({ authorId: 'alice' })],
    initialValue: {
      children: [paragraph('Body')],
      roots: { header: [paragraph('Head')] },
    },
  });
  const configured = createEditorView(source, {
    authored: proposal,
    readOnly: false,
    root: 'header',
  });
  let mountedEditor!: typeof configured;
  const Capture = () => {
    mountedEditor = useEditorContext() as unknown as typeof configured;

    return <Editable aria-label="configured" />;
  };
  const tree = (tick: number, readOnly?: boolean) => (
    <EditorRoot editor={configured} readOnly={readOnly}>
      <span data-tick={tick} />
      <Capture />
    </EditorRoot>
  );
  const mounted = render(tree(0));
  const first = mountedEditor;
  const staleInsert = first.update.text.insert;

  expect(first.read.view.root()).toBe('header');
  expect(first.read.authored.view()).toEqual(proposal);
  expect(getEditorRuntime(first)).not.toBe(getEditorRuntime(configured));

  await act(async () => first.api.authored.setView(accepted));
  mounted.rerender(tree(1));
  expect(mountedEditor).toBe(first);
  expect(first.read.authored.view()).toEqual(accepted);

  await act(async () =>
    configured.api.authored.setView({
      intent: 'propose',
      projection: 'markup',
    })
  );
  act(() => setEditorReadOnly(configured, true));
  mounted.rerender(tree(2));
  expect(mountedEditor).toBe(first);
  expect(first.read.authored.view()).toEqual(accepted);
  expect(first.read.view.isReadOnly()).toBe(false);

  mounted.rerender(tree(3, true));
  expect(mountedEditor).toBe(first);
  expect(first.read.view.isReadOnly()).toBe(true);
  mounted.unmount();
  expect(() => staleInsert('x')).toThrow(/read-only/);

  const remounted = render(tree(4));
  expect(mountedEditor).not.toBe(first);
  expect(mountedEditor.read.authored.view()).toEqual({
    intent: 'propose',
    projection: 'markup',
  });
  expect(mountedEditor.read.view.isReadOnly()).toBe(true);
  expect(() => staleInsert('x')).toThrow(/read-only/);
  remounted.unmount();
});

test('gives simultaneous mounts independent view and retirement state', async () => {
  const source = createEditor({ initialValue: [paragraph('Base')] });
  const configured = createEditorView(source);
  const views = new Map<string, ReturnType<typeof useEditorContext>>();
  const Capture = ({ name }: { name: string }) => {
    views.set(name, useEditorContext());

    return <Editable aria-label={name} />;
  };
  const tree = (second: boolean) => (
    <EditorRoot editor={source}>
      <EditorRoot editor={configured} readOnly={false}>
        <Capture name="first" />
      </EditorRoot>
      {second ? (
        <EditorRoot editor={configured} readOnly>
          <Capture name="second" />
        </EditorRoot>
      ) : null}
    </EditorRoot>
  );
  const mounted = render(tree(true));
  const first = views.get('first')!;
  const second = views.get('second')!;

  expect(getEditorRuntime(first)).not.toBe(getEditorRuntime(second));
  expect(first.read.view.isReadOnly()).toBe(false);
  expect(second.read.view.isReadOnly()).toBe(true);
  mounted.rerender(tree(false));
  expect(first.read.view.isReadOnly()).toBe(false);
  await act(async () =>
    first.update.text.insert('!', { at: { path: [0, 0], offset: 4 } })
  );
  expect(mounted.getByRole('textbox', { name: 'first' })).toHaveTextContent(
    'Base!'
  );
  expect(() => second.update.text.insert('x')).toThrow(/read-only/);
  mounted.unmount();
  expect(() => first.update.text.insert('x')).toThrow(/read-only/);
});
