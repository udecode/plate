import {
  type PartialSelectionAreaOptions,
  SelectionArea,
} from './SelectionArea';

const createMouseEvent = ({
  button = 0,
  clientX,
  clientY,
  metaKey = false,
  path,
  shiftKey = false,
  target,
}: {
  button?: number;
  clientX: number;
  clientY: number;
  metaKey?: boolean;
  path: EventTarget[];
  shiftKey?: boolean;
  target: HTMLElement;
}) => {
  const event = new MouseEvent('mousedown', {
    button,
    clientX,
    clientY,
    metaKey,
    shiftKey,
  });

  Object.defineProperty(event, 'target', {
    configurable: true,
    value: target,
  });
  (event as any).composedPath = () => path;

  return event;
};

const createSelectionHarness = (options: PartialSelectionAreaOptions = {}) => {
  const container = document.createElement('div');
  const selectable = document.createElement('div');

  container.dataset.pliteEditor = 'true';
  container.scrollLeft = 25;
  container.scrollTop = 15;
  container.getBoundingClientRect = () => new DOMRect(10, 20, 200, 200);
  selectable.className = 'plate-item';
  selectable.dataset.plateSelectable = 'true';
  selectable.getBoundingClientRect = () => new DOMRect(20, 30, 20, 20);
  container.append(selectable);
  document.body.append(container);

  const selection = new SelectionArea({
    boundaries: [container],
    container,
    document,
    selectables: '.plate-item',
    startAreas: [container],
    ...options,
  });

  return { container, selectable, selection };
};

describe('SelectionArea', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('starts drag selection once movement passes the configured threshold', () => {
    const { container, selection } = createSelectionHarness({
      behaviour: { startThreshold: 4 },
    });
    const emitEvent = mock(() => true);
    const onTapMove = mock();
    const setupSelectionArea = mock();

    (selection as any)._emitEvent = emitEvent;
    (selection as any)._onTapMove = onTapMove;
    (selection as any)._setupSelectionArea = setupSelectionArea;

    const startEvent = createMouseEvent({
      clientX: 30,
      clientY: 40,
      path: [container, document.body, document.documentElement],
      target: container,
    });
    const moveEvent = createMouseEvent({
      clientX: 40,
      clientY: 52,
      path: [container, document.body, document.documentElement],
      target: container,
    });

    (selection as any)._onTapStart(startEvent);
    (selection as any)._delayedTapMove(moveEvent);

    expect(emitEvent).toHaveBeenCalledWith('beforestart', startEvent);
    expect(emitEvent).toHaveBeenCalledWith('beforedrag', moveEvent);
    expect(emitEvent).toHaveBeenCalledWith('start', moveEvent);
    expect(setupSelectionArea).toHaveBeenCalledTimes(1);
    expect(onTapMove).toHaveBeenCalledWith(moveEvent);
    expect(selection.getSelectionArea().parentElement).toBe(container);
    expect(selection.getSelectionArea().style.display).toBe('block');
    expect((selection as any)._singleClick).toBe(false);

    selection.destroy();
  });

  it('keeps the interaction as a single click when movement stays below the threshold', () => {
    const { container, selection } = createSelectionHarness({
      behaviour: { startThreshold: 6 },
    });
    const emitEvent = mock(() => true);
    const onTapMove = mock();

    (selection as any)._emitEvent = emitEvent;
    (selection as any)._onTapMove = onTapMove;

    const startEvent = createMouseEvent({
      clientX: 30,
      clientY: 40,
      path: [container, document.body, document.documentElement],
      target: container,
    });
    const moveEvent = createMouseEvent({
      clientX: 32,
      clientY: 43,
      path: [container, document.body, document.documentElement],
      target: container,
    });

    (selection as any)._onTapStart(startEvent);
    (selection as any)._delayedTapMove(moveEvent);

    expect(emitEvent).toHaveBeenCalledWith('beforestart', startEvent);
    expect(emitEvent).not.toHaveBeenCalledWith('start', moveEvent);
    expect(onTapMove).not.toHaveBeenCalled();
    expect(selection.getSelectionArea().parentElement).toBeNull();
    expect((selection as any)._singleClick).toBe(true);

    selection.destroy();
  });

  it('updates area coordinates and schedules a frame during manual scroll', () => {
    const { container, selection } = createSelectionHarness();
    const frameNext = mock();
    const originalSetTimeout = globalThis.setTimeout;

    (selection as any)._container = container;
    (selection as any)._containerRect = container.getBoundingClientRect();
    (selection as any)._frame = {
      cancel: mock(),
      next: frameNext,
    };
    globalThis.setTimeout = ((fn: TimerHandler) => {
      if (typeof fn === 'function') {
        fn();
      }

      return 1 as any;
    }) as typeof setTimeout;

    try {
      (selection as any)._manualScroll({
        clientX: 70,
        clientY: 90,
        deltaX: 0,
        deltaY: 0,
        target: container,
      });

      expect((selection as any)._areaClientLocation.x2).toBe(70);
      expect((selection as any)._areaClientLocation.y2).toBe(90);
      expect((selection as any)._areaLocation.x2).toBe(85);
      expect((selection as any)._areaLocation.y2).toBe(85);
      expect(frameNext).toHaveBeenCalledWith(null);
    } finally {
      globalThis.setTimeout = originalSetTimeout;
      selection.destroy();
    }
  });

  it('dispatches all listeners and preserves cancellation', () => {
    const { selection } = createSelectionHarness();
    const calls: number[] = [];
    const first = () => {
      calls.push(1);
    };

    selection.on('move', first);
    selection.on('move', () => {
      calls.push(2);
      return false as never;
    });

    expect(
      selection.emit('move', {
        event: null,
        selection,
        store: {
          changed: { added: [], removed: [] },
          selected: [],
          stored: [],
          touched: [],
        },
      })
    ).toBe(false);
    expect(calls).toEqual([1, 2]);

    selection.off('move', first);
    selection.emit('move', {
      event: null,
      selection,
      store: {
        changed: { added: [], removed: [] },
        selected: [],
        stored: [],
        touched: [],
      },
    });
    expect(calls).toEqual([1, 2, 2]);

    selection.unbindAllListeners();
    selection.emit('move', {
      event: null,
      selection,
      store: {
        changed: { added: [], removed: [] },
        selected: [],
        stored: [],
        touched: [],
      },
    });
    expect(calls).toEqual([1, 2, 2]);

    selection.destroy();
  });

  it('coalesces selection frames and allows rescheduling after cancellation', () => {
    const { container, selection } = createSelectionHarness();
    const originalCancelAnimationFrame = globalThis.cancelAnimationFrame;
    const originalRequestAnimationFrame = globalThis.requestAnimationFrame;
    const emitEvent = mock(() => true);
    const canceledHandles: number[] = [];
    let frameId = 0;
    let scheduledFrame: FrameRequestCallback | undefined;

    globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      scheduledFrame = callback;

      return ++frameId;
    }) as typeof requestAnimationFrame;
    globalThis.cancelAnimationFrame = ((handle: number) => {
      canceledHandles.push(handle);
    }) as typeof cancelAnimationFrame;
    (selection as any)._emitEvent = emitEvent;

    const first = createMouseEvent({
      clientX: 30,
      clientY: 40,
      path: [container],
      target: container,
    });
    const second = createMouseEvent({
      clientX: 40,
      clientY: 50,
      path: [container],
      target: container,
    });

    try {
      (selection as any)._frame.next(first);
      (selection as any)._frame.next(second);
      scheduledFrame?.(0);

      expect(emitEvent).toHaveBeenCalledTimes(1);
      expect(emitEvent).toHaveBeenLastCalledWith('move', second);

      (selection as any)._frame.next(first);
      (selection as any)._frame.cancel();
      (selection as any)._frame.next(second);
      scheduledFrame?.(0);

      expect(canceledHandles).toEqual([2]);
      expect(emitEvent).toHaveBeenCalledTimes(2);
      expect(emitEvent).toHaveBeenLastCalledWith('move', second);
    } finally {
      globalThis.requestAnimationFrame = originalRequestAnimationFrame;
      globalThis.cancelAnimationFrame = originalCancelAnimationFrame;
      selection.destroy();
    }
  });

  it('selects intersecting elements and rejects elements outside the area', () => {
    const { container, selectable, selection } = createSelectionHarness();
    const outside = document.createElement('div');

    outside.getBoundingClientRect = () => new DOMRect(500, 500, 20, 20);
    container.append(outside);
    (selection as any)._areaRect = new DOMRect(0, 0, 60, 60);
    (selection as any)._container = container;
    (selection as any)._selectables = [selectable, outside];
    (selection as any)._updateElementSelection();

    expect((selection as any)._selection.changed.added).toEqual([selectable]);
    expect((selection as any)._selection.changed.removed).toEqual([]);
    expect((selection as any)._selection.selected).toEqual([selectable]);

    selection.destroy();
  });

  it('preserves explicit-element and selector ordering', () => {
    const { container, selectable, selection } = createSelectionHarness();
    const other = document.createElement('div');

    other.className = 'other';
    container.append(other);

    expect(selection.select([selectable, '.other'], true)).toEqual([
      selectable,
      other,
    ]);

    selection.destroy();
  });

  it('matches a later modifier trigger', () => {
    const { container, selection } = createSelectionHarness({
      behaviour: {
        triggers: [2, { button: 0, modifiers: ['shift'] }],
      },
    });
    const emitEvent = mock(() => true);

    (selection as any)._emitEvent = emitEvent;
    (selection as any)._onTapStart(
      createMouseEvent({
        clientX: 30,
        clientY: 40,
        path: [container],
        shiftKey: true,
        target: container,
      })
    );

    expect(emitEvent).toHaveBeenCalledWith(
      'beforestart',
      expect.any(MouseEvent)
    );

    selection.destroy();
  });

  it('treats meta as ctrl for trigger matching', () => {
    const { container, selection } = createSelectionHarness({
      behaviour: {
        triggers: [{ button: 0, modifiers: ['ctrl'] }],
      },
    });
    const emitEvent = mock(() => true);

    (selection as any)._emitEvent = emitEvent;
    (selection as any)._onTapStart(
      createMouseEvent({
        clientX: 30,
        clientY: 40,
        metaKey: true,
        path: [container],
        target: container,
      })
    );

    expect(emitEvent).toHaveBeenCalledWith(
      'beforestart',
      expect.any(MouseEvent)
    );

    selection.destroy();
  });

  it('does not start when no trigger matches', () => {
    const { container, selection } = createSelectionHarness({
      behaviour: {
        triggers: [0, { button: 2, modifiers: ['alt'] }],
      },
    });
    const emitEvent = mock(() => true);

    (selection as any)._emitEvent = emitEvent;
    (selection as any)._onTapStart(
      createMouseEvent({
        button: 1,
        clientX: 30,
        clientY: 40,
        path: [container],
        target: container,
      })
    );

    expect(emitEvent).not.toHaveBeenCalled();

    selection.destroy();
  });
});
