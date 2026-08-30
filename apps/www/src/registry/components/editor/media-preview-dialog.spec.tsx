import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

import { fireEvent, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';

let extensionFactory: ((context: any) => any) | undefined;
const imagePlugin = {
  extend: (extension: unknown) => {
    if (typeof extension === 'function') extensionFactory = extension as any;

    return imagePlugin;
  },
  name: 'image',
};
const previewApi = {
  close: mock(),
  next: mock(),
  previous: mock(),
  setEditingScale: mock(),
  setScale: mock(),
  setTranslate: mock(),
  zoomIn: mock(),
  zoomOut: mock(),
};
const store = { get: mock(), set: mock() };
const focusMock = mock();
let isOpen = true;
let preview = {
  boundingClientRect: {
    bottom: 800,
    left: 100,
    right: 900,
    top: 100,
  } as DOMRect,
  currentPreview: { key: 'image-1', url: '/image.png' },
  isEditingScale: false,
  openEditorId: 'editor-1',
  previewList: [{ key: 'image-1', url: '/image.png' }],
  scale: 1.5,
  translate: { x: 0, y: 0 },
};

mock.module('platejs/media/react', () => ({
  ImagePlugin: imagePlugin,
}));

mock.module('platejs/react', () => ({
  useComposedRef: (...refs: unknown[]) => refs.find(Boolean),
  useEditorPlugin: () => ({ api: { preview: previewApi }, store }),
  usePluginStore: (_plugin: unknown, key: string) =>
    key === 'preview' ? preview : isOpen,
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

describe('MediaPreviewDialog', () => {
  beforeEach(() => {
    isOpen = true;
    preview = {
      boundingClientRect: {
        bottom: 800,
        left: 100,
        right: 900,
        top: 100,
      } as DOMRect,
      currentPreview: { key: 'image-1', url: '/image.png' },
      isEditingScale: false,
      openEditorId: 'editor-1',
      previewList: [{ key: 'image-1', url: '/image.png' }],
      scale: 1.5,
      translate: { x: 0, y: 0 },
    };
    Object.values(previewApi).forEach((fn) => {
      fn.mockClear();
    });
    store.get.mockClear();
    store.set.mockClear();
    focusMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('consumes wheel events while panning a zoomed preview', async () => {
    const { MediaPreviewDialog } = await import(
      `./media-preview-dialog?test=${Math.random().toString(36).slice(2)}`
    );

    const view = render(<MediaPreviewDialog />);

    const event = new WheelEvent('wheel', {
      cancelable: true,
      deltaX: 4,
      deltaY: 8,
    });

    fireEvent(document, event);

    expect(event.defaultPrevented).toBe(true);
    expect(previewApi.setTranslate).toHaveBeenCalledWith({ x: -1, y: -2 });
    expect(view.getByRole('presentation').style.transform).toBe(
      'translate(0px, 0px) scale(1.5)'
    );
  });

  it('keeps the preview open while using toolbar controls', async () => {
    const { MediaPreviewDialog } = await import(
      `./media-preview-dialog?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<MediaPreviewDialog />);

    fireEvent.click(view.getByRole('button', { name: 'Zoom in' }));

    expect(previewApi.zoomIn).toHaveBeenCalledTimes(1);
    expect(previewApi.close).not.toHaveBeenCalled();
  });

  it('ignores a non-numeric custom zoom value', async () => {
    preview.isEditingScale = true;
    const { MediaPreviewDialog } = await import(
      `./media-preview-dialog?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<MediaPreviewDialog />);
    const input = view.getByDisplayValue('150');
    const user = userEvent.setup();

    await user.clear(input);
    await user.type(input, 'not-a-number');
    expect(
      fireEvent.keyDown(input, {
        code: 'Enter',
        key: 'Enter',
        keyCode: 13,
        which: 13,
      })
    ).toBe(false);
    expect(previewApi.setScale).not.toHaveBeenCalled();
    expect(previewApi.setEditingScale).not.toHaveBeenCalled();
  });

  it('recenters a custom zoom level at or below 100%', async () => {
    await import(
      `./media-preview-dialog?test=${Math.random().toString(36).slice(2)}`
    );
    const state = {
      ...preview,
      boundingClientRect: preview.boundingClientRect,
      scale: 2,
      translate: { x: 20, y: -10 },
    };
    const stateStore = {
      get: () => state,
      set: ({ preview: nextPreview }: { preview: typeof state }) =>
        Object.assign(state, nextPreview),
    };
    const api = extensionFactory!({ editor: {}, store: stateStore }).api()
      .preview;

    api.setScale(1);

    expect(state.boundingClientRect).toBeNull();
    expect(state.scale).toBe(1);
    expect(state.translate).toEqual({ x: 0, y: 0 });
  });

  it('recenters when zooming out below 100%', async () => {
    await import(
      `./media-preview-dialog?test=${Math.random().toString(36).slice(2)}`
    );
    const state = {
      ...preview,
      boundingClientRect: preview.boundingClientRect,
      scale: 1,
      translate: { x: 20, y: -10 },
    };
    const stateStore = {
      get: () => state,
      set: ({ preview: nextPreview }: { preview: typeof state }) =>
        Object.assign(state, nextPreview),
    };
    const api = extensionFactory!({ editor: {}, store: stateStore }).api()
      .preview;

    api.zoomOut();

    expect(state.boundingClientRect).toBeNull();
    expect(state.scale).toBe(0.5);
    expect(state.translate).toEqual({ x: 0, y: 0 });
  });

  it('returns focus to the editor when closing', async () => {
    await import(
      `./media-preview-dialog?test=${Math.random().toString(36).slice(2)}`
    );
    const state = { ...preview };
    const stateStore = {
      get: () => state,
      set: ({ preview: nextPreview }: { preview: typeof state }) =>
        Object.assign(state, nextPreview),
    };
    const api = extensionFactory!({
      editor: { api: { dom: { focus: focusMock } } },
      store: stateStore,
    }).api().preview;

    api.close();

    expect(state.openEditorId).toBeNull();
    expect(focusMock).toHaveBeenCalledTimes(1);
  });

  it('resets preview geometry when navigating to another image', async () => {
    await import(
      `./media-preview-dialog?test=${Math.random().toString(36).slice(2)}`
    );
    const state = {
      ...preview,
      currentPreview: { key: 'image-1', url: '/one.png' },
      isEditingScale: true,
      previewList: [
        { key: 'image-1', url: '/one.png' },
        { key: 'image-2', url: '/two.png' },
      ],
      scale: 2,
      translate: { x: 20, y: -10 },
    };
    const stateStore = {
      get: () => state,
      set: ({ preview: nextPreview }: { preview: typeof state }) =>
        Object.assign(state, nextPreview),
    };
    const api = extensionFactory!({ editor: {}, store: stateStore }).api()
      .preview;

    api.next();

    expect(state).toMatchObject({
      boundingClientRect: null,
      currentPreview: { key: 'image-2', url: '/two.png' },
      isEditingScale: false,
      scale: 1,
      translate: { x: 0, y: 0 },
    });
  });
});
