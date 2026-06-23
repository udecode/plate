import { act, render } from '@testing-library/react';
import { useEffect } from 'react';
import { Editor } from '@platejs/plite/internal';
import {
  createReactEditor,
  Editable,
  type ReactEditor,
  RenderElementProps,
  Plite,
  useElementSelected,
} from '../src';

let editor: ReactEditor;
let latestSelectedById: Record<string, boolean | undefined>;
let latestCollapsedSelectedById: Record<string, boolean | undefined>;

const initialValue = () => [
  {
    id: '0',
    children: [
      { id: '0.0', children: [{ text: '' }] },
      { id: '0.1', children: [{ text: '' }] },
      { id: '0.2', children: [{ text: '' }] },
    ],
  },
  { id: '1', children: [{ text: '' }] },
  { id: '2', children: [{ text: '' }] },
];

describe('useElementSelected', () => {
  const withEditor = () => {
    beforeEach(() => {
      editor = createReactEditor({ initialValue: initialValue() });

      latestSelectedById = {};
      latestCollapsedSelectedById = {};

      const renderElement = ({
        element,
        attributes,
        children,
      }: RenderElementProps) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const selected = useElementSelected();
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const collapsedSelected = useElementSelected({ mode: 'collapsed' });
        const { id } = element as any;

        latestSelectedById[id] = selected;
        latestCollapsedSelectedById[id] = collapsedSelected;

        return <div {...attributes}>{children}</div>;
      };

      render(
        <Plite editor={editor}>
          <Editable renderElement={renderElement} />
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
          tx.nodes.insert({ id: 'new', children: [{ text: '' }] } as any, {
            at: [2],
          });
        });
      });

      expect(latestSelectedById.new).toBe(false);
      expect(latestSelectedById['2']).toBe(true);
    });

    it('supports collapsed-only mode without changing intersection mode', async () => {
      await act(async () => {
        editor.update((tx) => {
          tx.selection.set({
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
  };

  describe('standard render tree', () => {
    withEditor();
  });

  it('unmounts cleanly when the selected rendered element removes itself', async () => {
    editor = createReactEditor({ initialValue: initialValue() });

    const removedIds = new Set<string>();
    const unmountedIds = new Set<string>();
    const selectedById: Record<string, boolean | undefined> = {};

    const SelfRemovingElement = ({
      element,
      attributes,
      children,
    }: RenderElementProps) => {
      const selected = useElementSelected();
      const { id } = element as { id: string };

      selectedById[id] = selected;

      useEffect(
        () => () => {
          unmountedIds.add(id);
        },
        [id]
      );

      useEffect(() => {
        if (id !== '2' || !selected || removedIds.has(id)) {
          return;
        }

        removedIds.add(id);
        editor.update((tx) => {
          const path = editor.api.dom.assertPath(element);

          tx.nodes.remove({ at: path });
        });
      }, [element, id, selected]);

      return <div {...attributes}>{children}</div>;
    };

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
    expect(Editor.hasPath(editor, [2])).toBe(false);
  });

  it('returns false when an explicit watched path is removed', async () => {
    editor = createReactEditor({ initialValue: initialValue() });

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

    expect(Editor.hasPath(editor, watchedPath)).toBe(false);
    expect(selectedValues.at(-1)).toBe(false);
  });

  it('updates an explicit watched path from inside another rendered element', async () => {
    editor = createReactEditor({ initialValue: initialValue() });

    const watchedPath = [2];
    const selectedByHostId: Record<string, boolean | undefined> = {};
    const renderElement = ({
      element,
      attributes,
      children,
    }: RenderElementProps) => {
      const selected = useElementSelected({ at: watchedPath });
      const { id } = element as any;

      if (id === '0') {
        selectedByHostId[id] = selected;
      }

      return <div {...attributes}>{children}</div>;
    };

    render(
      <Plite editor={editor}>
        <Editable renderElement={renderElement} />
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

  it('supports collapsed-only mode with an explicit watched path', async () => {
    editor = createReactEditor({ initialValue: initialValue() });

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
