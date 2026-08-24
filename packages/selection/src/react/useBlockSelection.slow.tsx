import * as actualCoreReact from '@platejs/core/react';
import { render } from '@testing-library/react';
import React from 'react';

const useEditorPluginMock = mock();
const useEditorMock = mock();
const usePluginStoreMock = mock();
let lastSelectionArea: SelectionAreaMock | null = null;

const captureSelectionArea = (selectionArea: SelectionAreaMock) => {
  lastSelectionArea = selectionArea;
};

void mock.module('@platejs/core/react', () => ({
  ...actualCoreReact,
  useEditor: useEditorMock,
  useEditorPlugin: useEditorPluginMock,
  usePluginStore: usePluginStoreMock,
}));

class SelectionAreaMock {
  handlers = new Map<string, (...args: unknown[]) => unknown>();
  clearSelection = mock();
  destroy = mock();
  options: unknown = null;

  constructor() {
    captureSelectionArea(this);
  }

  on(event: string, handler: (...args: unknown[]) => unknown) {
    this.handlers.set(event, handler);
    return this;
  }
}

void mock.module('../SelectionArea', () => ({
  SelectionArea: class extends SelectionAreaMock {
    constructor(options: unknown) {
      super();
      this.options = options;
    }
  },
}));

const loadModule = async () =>
  import(
    `./BlockSelection.internal?test=${Math.random().toString(36).slice(2)}`
  );

describe('useSelectionArea', () => {
  afterEach(() => {
    mock.restore();
    useEditorMock.mockReset();
    useEditorPluginMock.mockReset();
    usePluginStoreMock.mockReset();
    lastSelectionArea = null;
  });

  it('transfers focus before atomically clearing editor selection', async () => {
    const order: string[] = [];
    const editable = document.createElement('div');
    const deselect = mock(() => order.push('clear'));
    const set = mock();
    const clear = mock();
    const focus = mock(() => order.push('focus'));
    const blurInput = mock();
    const shadowInputRef = {
      current: { blur: blurInput, focus } as unknown as HTMLInputElement,
    };

    useEditorMock.mockReturnValue({
      id: 'editor',
      api: {
        dom: { deselect, editable: () => editable, scroll: () => editable },
      },
      read: {
        selection: () => ({
          kind: 'text',
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 0, path: [0, 0] },
        }),
        view: { isFocused: () => true },
      },
    });
    usePluginStoreMock.mockReturnValue(false);
    useEditorPluginMock.mockReturnValue({
      api: {
        clear,
      },
      update: {},
      store: {
        get: mock(() => ({
          areaOptions: {},
          isSelectionAreaVisible: false,
          selectedKeys: new Set(['n0']),
          shadowInputRef,
        })),
        set,
      },
    });

    const { BlockSelectionAfterEditable } = await loadModule();
    render(<BlockSelectionAfterEditable />);

    expect(lastSelectionArea!.options).toMatchObject({
      selectionAreaClass: 'plite-selection-area',
    });

    lastSelectionArea!.handlers.get('beforestart')?.();
    lastSelectionArea!.handlers.get('start')?.({
      event: { shiftKey: false },
    });
    lastSelectionArea!.handlers.get('stop')?.();
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        resolve();
      });
    });
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        resolve();
      });
    });

    expect(deselect).toHaveBeenCalledTimes(3);
    expect(clear).toHaveBeenCalled();
    expect(focus).toHaveBeenCalledTimes(4);
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(blurInput).not.toHaveBeenCalled();
    expect(set).toHaveBeenCalledWith({ isSelecting: false });
    expect(set).toHaveBeenCalledWith({ isSelectionAreaVisible: true });
    expect(set).toHaveBeenCalledWith({ isSelectionAreaVisible: false });
    expect(order.indexOf('focus')).toBeLessThan(order.indexOf('clear'));
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

    useEditorMock.mockReturnValue({
      id: 'editor',
      api: { dom: { editable: () => null, scroll: () => null } },
    });
    usePluginStoreMock.mockReturnValue(false);
    useEditorPluginMock.mockReturnValue({
      api: { clear: mock() },
      update: {},
      store: {
        get: mock(() => ({ areaOptions })),
        set: mock(),
      },
    });

    const { BlockSelectionAfterEditable } = await loadModule();
    render(<BlockSelectionAfterEditable />);

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
    expect(options.behaviour.triggers[0].modifiers).not.toBe(modifiers);
  });

  it('binds defaults to an editable root without a DOM id', async () => {
    const root = document.createElement('div');
    const first = document.createElement('div');

    first.className = 'plite-selectable';
    root.append(first);
    useEditorMock.mockReturnValue({
      id: 'editor',
      api: { dom: { editable: () => root } },
    });
    usePluginStoreMock.mockReturnValue(false);
    useEditorPluginMock.mockReturnValue({
      api: { clear: mock() },
      update: {},
      store: {
        get: mock(() => ({ areaOptions: {} })),
        set: mock(),
      },
    });

    const { BlockSelectionAfterEditable } = await loadModule();
    render(<BlockSelectionAfterEditable />);

    const options = lastSelectionArea!.options as {
      boundaries: HTMLElement;
      container: HTMLElement;
      selectables: () => HTMLElement[];
      startAreas: HTMLElement;
    };

    expect(options.boundaries).toBe(root);
    expect(options.container).toBe(root);
    expect(options.startAreas).toBe(root);
    expect(options.selectables()).toEqual([first]);

    const second = document.createElement('div');

    second.className = 'plite-selectable';
    root.append(second);
    expect(options.selectables()).toEqual([first, second]);
  });

  it('applies the consumer class to the portaled selection area', async () => {
    useEditorMock.mockReturnValue({
      id: 'editor',
      api: { dom: { editable: () => null, scroll: () => null } },
    });
    usePluginStoreMock.mockImplementation((_plugin, selector) =>
      selector === 'selectionAreaClassName' ? 'consumer-marquee' : false
    );
    useEditorPluginMock.mockReturnValue({
      api: { clear: mock() },
      update: {},
      store: {
        get: mock(() => ({ areaOptions: {} })),
        set: mock(),
      },
    });

    const { BlockSelectionAfterEditable } = await loadModule();
    render(<BlockSelectionAfterEditable />);

    expect(
      document.querySelector('[data-slot="block-selection-area"]')?.className
    ).toBe('plite-selection-area consumer-marquee');
  });
});
