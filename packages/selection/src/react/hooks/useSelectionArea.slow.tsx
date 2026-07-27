import { renderHook } from '@testing-library/react';

const extractSelectableIdsMock = mock();
const useEditorPluginMock = mock();

class SelectionAreaMock {
  handlers = new Map<string, Function>();
  clearSelection = mock();
  destroy = mock();
  options: unknown = null;

  on(event: string, handler: Function) {
    this.handlers.set(event, handler);
    return this;
  }
}

let lastSelectionArea: SelectionAreaMock | null = null;

mock.module('../../internal', () => ({
  SelectionArea: class extends SelectionAreaMock {
    constructor(options: unknown) {
      super();
      this.options = options;
      lastSelectionArea = this;
    }
  },
}));

mock.module('../../lib', async () => ({
  extractSelectableIds: extractSelectableIdsMock,
}));

mock.module('@platejs/core/react', async () => ({
  useEditorPlugin: useEditorPluginMock,
}));

const loadModule = async () =>
  import(`./useSelectionArea?test=${Math.random().toString(36).slice(2)}`);

describe('useSelectionArea', () => {
  afterEach(() => {
    mock.restore();
    extractSelectableIdsMock.mockReset();
    useEditorPluginMock.mockReset();
    lastSelectionArea = null;
  });

  it('blurs, deselects, and shows the selection area on start', async () => {
    const blur = mock();
    const clearSelection = mock();
    const set = mock();
    const clear = mock();

    useEditorPluginMock.mockReturnValue({
      api: {
        clear,
      },
      editor: {
        id: 'editor',
        api: {
          dom: { blur },
        },
        read: {
          selection: () => ({
            kind: 'text',
            anchor: { offset: 0, path: [0, 0] },
            focus: { offset: 0, path: [0, 0] },
          }),
          view: { isFocused: () => true },
        },
        update: { selection: { clear: clearSelection } },
      },
      store: {
        get: mock(() => ({
          areaOptions: {},
          isSelectionAreaVisible: false,
          selectedIds: new Set(),
        })),
        set,
      },
    });

    const { useSelectionArea } = await loadModule();
    renderHook(() => useSelectionArea());

    expect(lastSelectionArea!.options).toMatchObject({
      selectionAreaClass: 'plite-selection-area',
    });

    lastSelectionArea!.handlers.get('beforestart')?.();
    lastSelectionArea!.handlers.get('start')?.({
      event: { shiftKey: false },
    });
    lastSelectionArea!.handlers.get('stop')?.();

    expect(blur).toHaveBeenCalled();
    expect(clearSelection).toHaveBeenCalled();
    expect(clear).toHaveBeenCalled();
    expect(set).toHaveBeenCalledWith({ isSelecting: false });
    expect(set).toHaveBeenCalledWith({ isSelectionAreaVisible: true });
    expect(set).toHaveBeenCalledWith({ isSelectionAreaVisible: false });
  });

  it('materializes immutable selector arrays at the SelectionArea boundary', async () => {
    const boundaries = Object.freeze(['#boundary']);
    const container = Object.freeze(['#container']);
    const modifiers = Object.freeze(['shift'] as const);
    const selectables = Object.freeze(['.selectable']);
    const startAreas = Object.freeze(['#start']);
    const triggers = Object.freeze([{ button: 0 as const, modifiers }]);
    const areaOptions = Object.freeze({
      behaviour: Object.freeze({ triggers }),
      boundaries,
      container,
      selectables,
      startAreas,
    });

    useEditorPluginMock.mockReturnValue({
      api: { clear: mock() },
      editor: { id: 'editor' },
      store: {
        get: mock(() => ({ areaOptions })),
        set: mock(),
      },
    });

    const { useSelectionArea } = await loadModule();
    renderHook(() => useSelectionArea());

    const options = lastSelectionArea!.options as {
      behaviour: { triggers: Array<{ modifiers: string[] }> };
      boundaries: string[];
      container: string[];
      selectables: string[];
      startAreas: string[];
    };

    expect(options.boundaries).toEqual(['#boundary']);
    expect(options.boundaries).not.toBe(boundaries);
    expect(options.container).not.toBe(container);
    expect(options.selectables).not.toBe(selectables);
    expect(options.startAreas).not.toBe(startAreas);
    expect(options.behaviour.triggers).not.toBe(triggers);
    expect(options.behaviour.triggers[0]!.modifiers).not.toBe(modifiers);
  });
});
