import { renderHook } from '@testing-library/react';

const extractSelectableIdsMock = mock();
const useEditorPluginMock = mock();

mock.module('../BlockSelectionPlugin', () => ({
  BlockSelectionPlugin: { key: 'blockSelection' },
}));

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

mock.module('platejs/react', async () => ({
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
    const deselect = mock();
    const setOption = mock();
    const clear = mock();

    useEditorPluginMock.mockReturnValue({
      api: {
        blockSelection: { clear },
      },
      editor: {
        api: {
          isFocused: () => true,
        },
        meta: { uid: 'editor' },
        selection: {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        },
        tf: { blur, deselect },
      },
      getOption: mock(() => new Set()),
      getOptions: mock(() => ({
        areaOptions: {},
        isSelectionAreaVisible: false,
        selectedIds: new Set(),
      })),
      setOption,
    });

    const { useSelectionArea } = await loadModule();
    renderHook(() => useSelectionArea());

    lastSelectionArea!.handlers.get('beforestart')?.();
    lastSelectionArea!.handlers.get('start')?.({
      event: { shiftKey: false },
    });
    lastSelectionArea!.handlers.get('stop')?.();

    expect(blur).toHaveBeenCalled();
    expect(deselect).toHaveBeenCalled();
    expect(clear).toHaveBeenCalled();
    expect(setOption).toHaveBeenCalledWith('isSelecting', false);
    expect(setOption).toHaveBeenCalledWith('isSelectionAreaVisible', true);
    expect(setOption).toHaveBeenCalledWith('isSelectionAreaVisible', false);
  });
});
