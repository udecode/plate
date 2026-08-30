import { act, render } from '@testing-library/react';
import { SelectionApi } from 'plitejs';
import React from 'react';

import { hasPath as editorHasPath } from '../../src/internal';
import {
  createEditor,
  Editable,
  type Editor,
  Plite,
  useElementSelected,
} from '../../src/react';
import {
  createExplicitPathRenderElement,
  createSelectionRenderElement,
  createSelfRemovingElement,
} from './render-probes/element-selected-render-probes';

let editor: Editor;
let latestSelectedById: Record<string, boolean | undefined>;
let latestCollapsedSelectedById: Record<string, boolean | undefined>;
let latestNodeSelectedById: Record<string, boolean | undefined>;

const initialValue = () => [
  {
    id: '0',
    children: [
      { id: '0.0', children: [{ text: '' }], type: 'paragraph' },
      { id: '0.1', children: [{ text: '' }], type: 'paragraph' },
      { id: '0.2', children: [{ text: '' }], type: 'paragraph' },
    ],
    type: 'section',
  },
  { id: '1', children: [{ text: '' }], type: 'paragraph' },
  { id: '2', children: [{ text: '' }], type: 'paragraph' },
];

describe('useElementSelected', () => {
  const withEditor = () => {
    beforeEach(() => {
      editor = createEditor({ initialValue: initialValue() });

      latestSelectedById = {};
      latestCollapsedSelectedById = {};
      latestNodeSelectedById = {};

      const RenderElement = createSelectionRenderElement({
        collapsed: latestCollapsedSelectedById,
        intersection: latestSelectedById,
        node: latestNodeSelectedById,
      });

      render(
        <Plite editor={editor}>
          <Editable renderElement={RenderElement} />
        </Plite>
      );
    });

    it('returns false initially', () => {
      expect(latestSelectedById).toEqual({
        '0': false,
        '0.0': false,
        '0.1': false,
        '0.2': false,
        '1': false,
        '2': false,
      });
      expect(latestCollapsedSelectedById).toEqual({
        '0': false,
        '0.0': false,
        '0.1': false,
        '0.2': false,
        '1': false,
        '2': false,
      });
      expect(latestNodeSelectedById).toEqual({
        '0': false,
        '0.0': false,
        '0.1': false,
        '0.2': false,
        '1': false,
        '2': false,
      });
    });

    it('re-renders elements when it becomes true or false', async () => {
      await act(async () => {
        editor.update((tx) => {
          tx.selection.set([0, 0]);
        });
      });

      expect(latestSelectedById['0']).toBe(true);
      expect(latestSelectedById['0.0']).toBe(true);
      expect(latestSelectedById['1']).toBe(false);
      expect(latestSelectedById['2']).toBe(false);

      await act(async () => {
        editor.update((tx) => {
          tx.selection.set([2]);
        });
      });

      expect(latestSelectedById['0']).toBe(false);
      expect(latestSelectedById['0.0']).toBe(false);
      expect(latestSelectedById['1']).toBe(false);
      expect(latestSelectedById['2']).toBe(true);
    });

    it('returns true for elements in the middle of the selection', async () => {
      await act(async () => {
        editor.update((tx) => {
          tx.selection.set({
            kind: 'text',
            anchor: { path: [2, 0], offset: 0 },
            focus: { path: [0, 1, 0], offset: 0 },
          });
        });
      });

      expect(latestSelectedById['0']).toBe(true);
      expect(latestSelectedById['0.1']).toBe(true);
      expect(latestSelectedById['0.2']).toBe(true);
      expect(latestSelectedById['1']).toBe(true);
      expect(latestSelectedById['2']).toBe(true);
    });

    it('remains true when the path changes', async () => {
      await act(async () => {
        editor.update((tx) => {
          tx.selection.set({ path: [2, 0], offset: 0 });
        });
      });

      expect(latestSelectedById['2']).toBe(true);

      await act(async () => {
        editor.update((tx) => {
          tx.nodes.insert(
            { id: 'new', children: [{ text: '' }], type: 'paragraph' } as any,
            { at: [2] }
          );
        });
      });

      expect(latestSelectedById.new).toBe(false);
      expect(latestSelectedById['2']).toBe(true);
    });

    it('does not rerender an unselected element when only its path changes', async () => {
      const renderCounts = new Map<string, number>();
      const localEditor = createEditor({ initialValue: initialValue() });

      render(
        <Plite editor={localEditor}>
          <Editable
            renderElement={({ attributes, children, element }) => {
              const id = String((element as { id?: unknown }).id);

              useElementSelected();
              renderCounts.set(id, (renderCounts.get(id) ?? 0) + 1);

              return <div {...attributes}>{children}</div>;
            }}
          />
        </Plite>
      );

      await act(async () => {
        localEditor.update((tx) => {
          tx.selection.set({ path: [0, 0, 0], offset: 0 });
        });
      });
      const countBeforeInsert = renderCounts.get('2');

      await act(async () => {
        localEditor.update((tx) => {
          tx.nodes.insert(
            { id: 'new', children: [{ text: '' }], type: 'paragraph' } as any,
            { at: [0] }
          );
        });
      });

      expect(renderCounts.get('2')).toBe(countBeforeInsert);
      expect(renderCounts.get('new')).toBe(1);
    });

    it('supports collapsed-only mode without changing intersection mode', async () => {
      await act(async () => {
        editor.update((tx) => {
          tx.selection.set({
            kind: 'text',
            anchor: { path: [2, 0], offset: 0 },
            focus: { path: [0, 1, 0], offset: 0 },
          });
        });
      });

      expect(latestSelectedById['1']).toBe(true);
      expect(latestCollapsedSelectedById['1']).toBe(false);
      expect(latestSelectedById['2']).toBe(true);
      expect(latestCollapsedSelectedById['2']).toBe(false);

      await act(async () => {
        editor.update((tx) => {
          tx.selection.set({ path: [2, 0], offset: 0 });
        });
      });

      expect(latestSelectedById['2']).toBe(true);
      expect(latestCollapsedSelectedById['2']).toBe(true);
    });

    it('matches only the exact NodeSelection path in node mode', async () => {
      await act(async () => {
        editor.update((tx) => {
          tx.selection.set({ path: [2, 0], offset: 0 });
        });
      });

      expect(latestSelectedById['2']).toBe(true);
      expect(latestNodeSelectedById['2']).toBe(false);

      await act(async () => {
        editor.update((tx) => {
          const start = tx.points.start([0, 1]);

          expect(start).toBeTruthy();
          tx.selection.set(SelectionApi.nodes([[0, 1]]));
        });
      });

      expect(latestNodeSelectedById['0']).toBe(false);
      expect(latestNodeSelectedById['0.1']).toBe(true);
      expect(latestNodeSelectedById['0.2']).toBe(false);
    });
  };

  describe('standard render tree', () => {
    withEditor();
  });

  it('unmounts cleanly when the selected rendered element removes itself', async () => {
    editor = createEditor({ initialValue: initialValue() });

    const removedIds = new Set<string>();
    const unmountedIds = new Set<string>();
    const selectedById: Record<string, boolean | undefined> = {};

    const SelfRemovingElement = createSelfRemovingElement({
      editor,
      removedIds,
      selectedById,
      unmountedIds,
    });

    render(
      <Plite editor={editor}>
        <Editable
          renderElement={(props) => <SelfRemovingElement {...props} />}
        />
      </Plite>
    );

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({ path: [2, 0], offset: 0 });
      });
    });
    await act(async () => {});

    expect(selectedById['2']).toBe(true);
    expect(removedIds.has('2')).toBe(true);
    expect(unmountedIds.has('2')).toBe(true);
    expect(editorHasPath(editor, [2])).toBe(false);
  });

  it('returns false when an explicit watched path is removed', async () => {
    editor = createEditor({ initialValue: initialValue() });

    const watchedPath = [2];
    const selectedValues: boolean[] = [];
    const ExplicitPathProbe = () => {
      selectedValues.push(useElementSelected({ at: watchedPath }));

      return null;
    };

    render(
      <Plite editor={editor}>
        <ExplicitPathProbe />
        <Editable
          renderElement={({ attributes, children }) => (
            <div {...attributes}>{children}</div>
          )}
        />
      </Plite>
    );

    selectedValues.splice(0);

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({ path: [2, 0], offset: 0 });
      });
    });

    expect(selectedValues.at(-1)).toBe(true);

    selectedValues.splice(0);

    await act(async () => {
      editor.update((tx) => {
        tx.nodes.remove({ at: [2] });
      });
    });

    expect(editorHasPath(editor, watchedPath)).toBe(false);
    expect(selectedValues.at(-1)).toBe(false);
  });

  it('updates an explicit watched path from inside another rendered element', async () => {
    editor = createEditor({ initialValue: initialValue() });

    const watchedPath = [2];
    const selectedByHostId: Record<string, boolean | undefined> = {};
    const RenderElement = createExplicitPathRenderElement({
      selectedByHostId,
      watchedPath,
    });

    render(
      <Plite editor={editor}>
        <Editable renderElement={RenderElement} />
      </Plite>
    );

    expect(selectedByHostId['0']).toBe(false);

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({ path: [2, 0], offset: 0 });
      });
    });

    expect(selectedByHostId['0']).toBe(true);
  });

  it('tracks exact node selection by explicit node key', async () => {
    editor = createEditor({ initialValue: initialValue() });

    const watchedKey = editor.key([2]);
    const selectedValues: boolean[] = [];
    const ExplicitNodeKeyProbe = () => {
      selectedValues.push(useElementSelected({ at: watchedKey, mode: 'node' }));

      return null;
    };

    render(
      <Plite editor={editor}>
        <ExplicitNodeKeyProbe />
        <Editable
          renderElement={({ attributes, children }) => (
            <div {...attributes}>{children}</div>
          )}
        />
      </Plite>
    );

    expect(selectedValues.at(-1)).toBe(false);

    await act(async () => {
      editor.update.selection.setNodes([[2]]);
    });

    expect(selectedValues.at(-1)).toBe(true);

    await act(async () => {
      editor.update.selection.setNodes([[1]]);
    });

    expect(selectedValues.at(-1)).toBe(false);
  });

  it('supports collapsed-only mode with an explicit watched path', async () => {
    editor = createEditor({ initialValue: initialValue() });

    const watchedPath = [2];
    const selectedValues: boolean[] = [];
    const ExplicitPathProbe = () => {
      selectedValues.push(
        useElementSelected({ at: watchedPath, mode: 'collapsed' })
      );

      return null;
    };

    render(
      <Plite editor={editor}>
        <ExplicitPathProbe />
        <Editable
          renderElement={({ attributes, children }) => (
            <div {...attributes}>{children}</div>
          )}
        />
      </Plite>
    );

    expect(selectedValues.at(-1)).toBe(false);

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({
          kind: 'text',
          anchor: { path: [2, 0], offset: 0 },
          focus: { path: [0, 1, 0], offset: 0 },
        });
      });
    });

    expect(selectedValues.at(-1)).toBe(false);

    selectedValues.splice(0);

    await act(async () => {
      editor.update((tx) => {
        tx.selection.set({ path: [2, 0], offset: 0 });
      });
    });

    expect(selectedValues.at(-1)).toBe(true);
  });
});
