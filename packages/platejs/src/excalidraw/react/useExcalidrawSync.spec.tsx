import { expect, it, spyOn } from 'bun:test';

import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import { act, render } from '@testing-library/react';
import * as React from 'react';

import { createEditor, Plate, PlateContent } from '../../react/core';
import { ExcalidrawPlugin } from './ExcalidrawPlugin';
import { useExcalidrawSync } from './useExcalidrawSync';

const canvas = spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
  {}
);
const excalidraw = await import('@excalidraw/excalidraw');
canvas.mockRestore();

function setup({ loading = false, strict = false } = {}) {
  const scene = excalidraw.restore(
    {
      elements: [
        { id: 'one', type: 'rectangle', x: 10, y: 20, width: 100, height: 100 },
      ],
      appState: { viewBackgroundColor: '#ffffff' },
    } as never,
    null,
    null
  );
  let { elements } = scene;
  let state = {
    ...scene.appState,
    isLoading: loading,
    width: 600,
    height: 600,
    offsetLeft: 0,
    offsetTop: 0,
  };
  const { files } = scene;
  const callbacks = new Set<
    Parameters<ExcalidrawImperativeAPI['onChange']>[0]
  >();
  const disposed: Array<Parameters<ExcalidrawImperativeAPI['onChange']>[0]> =
    [];
  let cleared = 0;
  let updates = 0;
  let subscriptions = 0;
  const fire = () => callbacks.forEach((cb) => cb(elements, state, files));
  const api = {
    addFiles: (added) => {
      for (const file of added) files[file.id] = file;
    },
    getAppState: () => state,
    getFiles: () => files,
    getSceneElements: () => elements,
    history: {
      clear: () => {
        cleared += 1;
      },
    },
    onChange: (cb) => {
      subscriptions += 1;
      callbacks.add(cb);
      return () => {
        disposed.push(cb);
        callbacks.delete(cb);
      };
    },
    updateScene: (next) => {
      updates += 1;
      expect(next.captureUpdate).toBe('NEVER');
      elements = [...(next.elements ?? elements)];
      state = { ...state, ...next.appState };
      fire();
    },
  } as ExcalidrawImperativeAPI;
  const Renderer = () => {
    useExcalidrawSync({ api, excalidraw });
    return <div contentEditable={false}>Drawing</div>;
  };
  const editor = createEditor({
    plugins: [ExcalidrawPlugin.configure({ component: Renderer })],
    initialValue: [
      {
        type: 'excalidraw',
        data: {
          elements: JSON.parse(JSON.stringify(elements)),
          state: { viewBackgroundColor: '#ffffff' },
        },
        children: [{ text: '' }],
      },
    ],
  });
  const element = editor.read.nodes.get([0], { type: ExcalidrawPlugin })![0];
  const key = editor.key(element);
  let commits = 0;
  const release = editor.subscribeCommit(() => {
    commits += 1;
  });
  const content = (readOnly = false) => (
    <Plate editor={editor} readOnly={readOnly}>
      <PlateContent />
    </Plate>
  );
  const view = render(
    strict ? <React.StrictMode>{content()}</React.StrictMode> : content()
  );
  return {
    api,
    callbacks,
    disposed,
    editor,
    element,
    fire,
    files,
    key,
    view,
    get commits() {
      return commits;
    },
    get cleared() {
      return cleared;
    },
    get updates() {
      return updates;
    },
    get subscriptions() {
      return subscriptions;
    },
    data: () =>
      editor.read.nodes.get(key, { type: ExcalidrawPlugin })?.[0].data,
    ready: () => {
      state = { ...state, isLoading: false };
      fire();
    },
    pan: () => {
      state = {
        ...state,
        scrollX: state.scrollX + 20,
        selectedElementIds: { one: true },
      };
      fire();
    },
    edit: () => {
      elements = elements.map((e) => ({
        ...e,
        x: e.x + 5,
        version: e.version + 1,
      }));
      fire();
    },
    readOnly: (value = true) => view.rerender(content(value)),
    dispose: () => {
      view.unmount();
      release();
    },
  };
}

it('filters transient state, saves one edit and retains one subscription', () => {
  const target = setup();
  const original = JSON.stringify(target.element.data);
  act(() => {
    target.pan();
    target.pan();
  });
  expect(target.commits).toBe(0);
  act(() => target.edit());
  expect(target.commits).toBe(1);
  expect(target.data()?.state).toEqual({
    gridSize: 20,
    gridStep: 5,
    gridModeEnabled: false,
    viewBackgroundColor: '#ffffff',
  });
  expect(target.subscriptions).toBe(1);
  expect(target.updates).toBe(1);
  expect(JSON.stringify(target.element.data)).toBe(original);
  target.dispose();
});

it('projects external changes and document undo/redo without an echo', () => {
  const target = setup();
  act(() =>
    target.editor.update({ history: 'new-batch' }).nodes.set(
      {
        data: {
          ...target.data()!,
          state: { viewBackgroundColor: '#ff0000' },
        },
      },
      { at: target.key }
    )
  );
  expect(target.api.getAppState().viewBackgroundColor).toBe('#ff0000');
  act(() => target.editor.update.history.undo());
  expect(target.api.getAppState().viewBackgroundColor).toBe('#ffffff');
  act(() => target.editor.update.history.redo());
  expect(target.api.getAppState().viewBackgroundColor).toBe('#ff0000');
  expect(target.commits).toBe(3);
  expect(target.cleared).toBe(4);
  target.dispose();
});

it('uses the latest source after loading and rejects stale callbacks before effects', () => {
  const target = setup({ loading: true });
  expect(target.updates).toBe(0);
  act(() =>
    target.editor.update.nodes.set(
      { data: { elements: [], state: { viewBackgroundColor: '#000000' } } },
      { at: target.key }
    )
  );
  act(() => target.ready());
  expect(target.api.getSceneElements()).toHaveLength(0);
  expect(target.api.getAppState().viewBackgroundColor).toBe('#000000');
  expect(target.commits).toBe(1);
  act(() => {
    target.editor.update.nodes.set(
      { data: { elements: [], state: { viewBackgroundColor: '#00ff00' } } },
      { at: target.key }
    );
    target.edit();
  });
  expect(target.api.getAppState().viewBackgroundColor).toBe('#00ff00');
  expect(target.commits).toBe(2);
  target.dispose();
});

it('ignores readonly, removed-node and disposed callbacks', () => {
  const target = setup({ strict: true });
  expect(target.callbacks.size).toBe(1);
  target.readOnly();
  act(() => target.edit());
  expect(target.commits).toBe(0);
  target.readOnly(false);
  act(() => target.editor.update.nodes.remove({ at: target.key }));
  const { commits } = target;
  act(() => target.edit());
  target.view.unmount();
  act(() =>
    target.disposed.forEach((cb) =>
      cb(target.api.getSceneElements(), target.api.getAppState(), target.files)
    )
  );
  expect(target.commits).toBe(commits);
  expect(target.callbacks.size).toBe(0);
  target.dispose();
});

it('restores referenced image files without mutating the stored payload', () => {
  const target = setup();
  const data = {
    elements: [
      {
        id: 'image',
        type: 'image',
        fileId: 'asset',
        status: 'saved',
        x: 0,
        y: 0,
        width: 30,
        height: 30,
      },
    ],
    state: { viewBackgroundColor: '#ffffff' },
    files: {
      asset: {
        id: 'asset',
        dataURL: 'data:image/png;base64,AA==',
        mimeType: 'image/png',
        created: 1,
      },
    },
  };
  const original = JSON.stringify(data);
  act(() => target.editor.update.nodes.set({ data }, { at: target.key }));
  expect(target.api.getFiles().asset.dataURL).toBe(data.files.asset.dataURL);
  act(() => target.edit());
  expect(target.data()?.files).toEqual(data.files);
  expect(JSON.stringify(data)).toBe(original);
  act(() => target.editor.update.nodes.set({ data: null }, { at: target.key }));
  expect(target.api.getSceneElements()).toHaveLength(0);
  expect(target.api.getAppState().viewBackgroundColor).toBe('#ffffff');
  target.dispose();
});
