import { createEditor, createEditorView } from '../../core';
import { retainViewPresentation, withMountedPresentation } from '../../facade';
import { definePlugin } from '../../lib/plugin';
import { clearPluginStores, getViewStoreCount } from './pluginStore';

const createOpenPlugin = (readsInUpdate: boolean[] = []) =>
  definePlugin('open', {
    initialViewState: () => ({ open: false }),
  }).extend(({ viewStoreOf }) => ({
    api: ({ viewStore }) => ({
      isOpen: () => viewStore.get('open'),
    }),
    read: ({ state }) => ({
      isOpen: () => viewStoreOf(state).get('open'),
    }),
    update: ({ tx }) => ({
      open: () => {
        const store = viewStoreOf(tx);

        store.set({ open: true });
        readsInUpdate.push(store.get('open'));
      },
    }),
  }));

const createOpenEditor = (readsInUpdate?: boolean[]) => {
  const OpenPlugin = createOpenPlugin(readsInUpdate);

  return { editor: createEditor({ plugins: [OpenPlugin] }), OpenPlugin };
};

describe('plugin view store', () => {
  it('keeps one value per view, apart from the base editor', () => {
    const { editor, OpenPlugin } = createOpenEditor();
    const first = createEditorView(editor);
    const second = createEditorView(editor);

    first.plugin(OpenPlugin).update.open();

    expect(
      [editor, first, second].map((view) =>
        view.plugin(OpenPlugin).viewStore.get('open')
      )
    ).toEqual([false, true, false]);
  });

  it("reads each view's own value through its API and read builders", () => {
    const { editor, OpenPlugin } = createOpenEditor();
    const first = createEditorView(editor);
    const second = createEditorView(editor);

    second.plugin(OpenPlugin).update.open();

    expect(
      [first, second].map((view) => ({
        api: view.plugin(OpenPlugin).api.isOpen(),
        read: view.plugin(OpenPlugin).read.isOpen(),
      }))
    ).toEqual([
      { api: false, read: false },
      { api: true, read: true },
    ]);
  });

  it('shares one value between views mounted under one presentation', () => {
    const { editor, OpenPlugin } = createOpenEditor();
    const view = createEditorView(editor);
    const mounted = withMountedPresentation(editor, view);

    mounted.plugin(OpenPlugin).update.open();

    expect(view.plugin(OpenPlugin).viewStore.get('open')).toBe(true);
  });

  it('shows a write to a later read in the same update', () => {
    const readsInUpdate: boolean[] = [];
    const { editor, OpenPlugin } = createOpenEditor(readsInUpdate);

    createEditorView(editor).plugin(OpenPlugin).update.open();

    expect(readsInUpdate).toEqual([true]);
  });

  it("notifies only the writing view's subscribers and adds no history entry", () => {
    const { editor, OpenPlugin } = createOpenEditor();
    const first = createEditorView(editor);
    const second = createEditorView(editor);
    const notified: string[] = [];
    const undos = editor.read.history().undos.length;

    first.plugin(OpenPlugin).viewStore.subscribe(() => notified.push('first'));
    second
      .plugin(OpenPlugin)
      .viewStore.subscribe(() => notified.push('second'));
    first.plugin(OpenPlugin).update.open();

    expect({
      notified,
      undos: editor.read.history().undos.length - undos,
    }).toEqual({ notified: ['first'], undos: 0 });
  });

  it('resets view stores when the plugin stores are cleared for reconfiguration', () => {
    const { editor, OpenPlugin } = createOpenEditor();
    const view = createEditorView(editor);

    view.plugin(OpenPlugin).update.open();
    clearPluginStores(editor);

    expect(view.plugin(OpenPlugin).viewStore.get('open')).toBe(false);
  });

  it('drops a view store when its presentation is released', () => {
    const { editor, OpenPlugin } = createOpenEditor();
    const start = getViewStoreCount(editor);
    const view = createEditorView(editor);
    const release = retainViewPresentation(view);

    view.plugin(OpenPlugin).update.open();
    const live = getViewStoreCount(editor);

    release();

    expect([live, getViewStoreCount(editor)]).toEqual([start + 1, start]);
  });
});
