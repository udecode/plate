import type { PartialSelectionOptions } from './types';

import { SelectionArea } from './SelectionArea';

const createMouseEvent = ({
  button = 0,
  clientX,
  clientY,
  path,
  shiftKey = false,
  target,
}: {
  button?: number;
  clientX: number;
  clientY: number;
  path: EventTarget[];
  shiftKey?: boolean;
  target: HTMLElement;
}) => {
  const event = new MouseEvent('mousedown', {
    button,
    clientX,
    clientY,
    shiftKey,
  });

  Object.defineProperty(event, 'target', {
    configurable: true,
    value: target,
  });
  (event as any).composedPath = () => path;

  return event;
};

const createSelectionHarness = (options: PartialSelectionOptions = {}) => {
  const container = document.createElement('div');
  const selectable = document.createElement('div');

  container.dataset.slateEditor = 'true';
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
});
