'use client';

import { failInvariant } from '@platejs/plite/internal';

export type Intersection = 'center' | 'cover' | 'touch';

export type SelectionAreaBehaviour = {
  intersect: Intersection;
  overlap: SelectionAreaOverlapMode;
  scrolling: SelectionAreaScrolling;
  startThreshold: SelectionAreaCoordinates | number;
  triggers: SelectionAreaTrigger[];
};

export type SelectionAreaCoordinates = {
  x: number;
  y: number;
};

export type SelectionAreaFeatures = {
  range: boolean;
  singleTap: SelectionAreaSingleTap;
  touch: boolean;
};

export type SelectionAreaModifier = 'alt' | 'ctrl' | 'shift';

export type SelectionAreaMouseButton = 0 | 1 | 2 | 3 | 4;

export type SelectionAreaMouseButtonWithModifiers = {
  button: SelectionAreaMouseButton;
  modifiers: SelectionAreaModifier[];
};

export type SelectionAreaOverlapMode = 'drop' | 'invert' | 'keep';

export type SelectionAreaOptions = {
  behaviour: SelectionAreaBehaviour;
  boundaries: SelectionAreaTarget | SelectionAreaTarget[];
  container: SelectionAreaTarget | SelectionAreaTarget[];
  document: Document;
  features: SelectionAreaFeatures;
  selectables: SelectionAreaSelectables;
  selectionAreaClass: string;
  selectionAreaElement?: HTMLElement;
  startAreas: SelectionAreaTarget | SelectionAreaTarget[];
};

export type PartialSelectionAreaOptions = {
  document?: Document;
} & SelectionAreaDeepPartial<Omit<SelectionAreaOptions, 'document'>>;

export type SelectionAreaScrolling = {
  manualSpeed: number;
  speedDivider: number;
  startScrollMargins: { x: number; y: number };
};

export type SelectionAreaSingleTap = {
  allow: boolean;
  intersect: SelectionAreaTapMode;
};

export type SelectionAreaSelectables =
  | (() => HTMLElement[])
  | string
  | readonly string[];

export type SelectionAreaTapMode = 'native' | 'touch';

export type SelectionAreaTarget = HTMLElement | string;

export type SelectionAreaTrigger =
  | SelectionAreaMouseButton
  | SelectionAreaMouseButtonWithModifiers;

type SelectionAreaDeepPartial<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly unknown[]
    ? T
    : T extends HTMLElement
      ? T
      : { [P in keyof T]?: SelectionAreaDeepPartial<T[P]> };

type EventCallback = (...args: never[]) => unknown;
type EventMap<Events> = {
  [K in keyof Events]: EventCallback;
};

class EventTarget<Events extends EventMap<Events>> {
  private readonly listeners = new Map<keyof Events, Set<EventCallback>>();

  addEventListener = <K extends keyof Events>(
    event: K,
    callback: Events[K]
  ) => {
    const listeners = this.listeners.get(event) ?? new Set();

    this.listeners.set(event, listeners);
    listeners.add(callback);

    return this;
  };

  dispatchEvent = <K extends keyof Events>(
    event: K,
    ...data: Parameters<Events[K]>
  ) => {
    let accepted = true;

    for (const callback of this.listeners.get(event) ?? []) {
      accepted = Reflect.apply(callback, this, data) !== false && accepted;
    }

    return accepted;
  };

  removeEventListener = <K extends keyof Events>(
    event: K,
    callback: Events[K]
  ) => {
    this.listeners.get(event)?.delete(callback);

    return this;
  };

  emit = this.dispatchEvent;
  off = this.removeEventListener;
  on = this.addEventListener;

  unbindAllListeners() {
    this.listeners.clear();
  }
}

type AreaLocation = {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

type Coordinates = {
  x: number;
  y: number;
};

interface ScrollEvent extends MouseEvent {
  deltaX: number;
  deltaY: number;
}

type SelectionStore = {
  changed: {
    added: Element[];
    removed: Element[];
  };
  selected: Element[];
  stored: Element[];
  touched: Element[];
};

type SelectionEvent = {
  event: MouseEvent | TouchEvent | null;
  selection: SelectionArea;
  store: SelectionStore;
};

type SelectionEvents = {
  beforedrag: (event: SelectionEvent) => boolean | void;
  beforestart: (event: SelectionEvent) => boolean | void;
  move: (event: SelectionEvent) => void;
  start: (event: SelectionEvent) => void;
  stop: (event: SelectionEvent) => void;
};

type FrameCallback = (event: MouseEvent | TouchEvent | null) => void;

type Frames = {
  cancel: () => void;
  next: (event: MouseEvent | TouchEvent | null) => void;
};

const frames = (callback: FrameCallback): Frames => {
  let previousEvent: MouseEvent | TouchEvent | null = null;
  let frameId = -1;
  let locked = false;

  return {
    cancel() {
      cancelAnimationFrame(frameId);
      locked = false;
    },
    next(event) {
      previousEvent = event;

      if (locked) return;

      locked = true;
      frameId = requestAnimationFrame(() => {
        callback(previousEvent);
        locked = false;
      });
    },
  };
};

type EventBindingArgs = [
  (
    | (globalThis.EventTarget | undefined)
    | Array<globalThis.EventTarget | undefined>
    | HTMLCollection
    | NodeList
  ),
  string[] | string,
  EventCallback,
  Record<string, unknown>?,
];

const eventListener =
  (method: 'addEventListener' | 'removeEventListener') =>
  (
    items:
      | (globalThis.EventTarget | undefined)
      | Array<globalThis.EventTarget | undefined>
      | HTMLCollection
      | NodeList,
    events: string[] | string,
    callback: EventCallback,
    options = {}
  ): EventBindingArgs => {
    const normalizedItems =
      items instanceof HTMLCollection || items instanceof NodeList
        ? Array.from(items)
        : Array.isArray(items)
          ? items
          : [items];
    const normalizedEvents = Array.isArray(events) ? events : [events];

    normalizedItems.forEach((item) => {
      normalizedEvents.forEach((event) => {
        item?.[method](event, callback as EventListener, {
          capture: false,
          ...options,
        });
      });
    });

    return [normalizedItems, normalizedEvents, callback, options];
  };

const on = eventListener('addEventListener');
const off = eventListener('removeEventListener');

const simplifyEvent = (event: MouseEvent | TouchEvent) => {
  const source = 'touches' in event ? event.touches.item(0) : event;

  return {
    target: source?.target instanceof Element ? source.target : null,
    x: source?.clientX ?? 0,
    y: source?.clientY ?? 0,
  };
};

const unitify = (value: number | string, unit = 'px') =>
  typeof value === 'number' ? value + unit : value;

function css(
  { style }: HTMLElement,
  attribute:
    | Partial<Record<keyof CSSStyleDeclaration, number | string>>
    | string,
  value?: number | string
) {
  if (typeof attribute === 'object') {
    Object.entries(attribute).forEach(([key, entry]) => {
      if (entry !== undefined) {
        Reflect.set(style, key, unitify(entry));
      }
    });
  } else if (value !== undefined) {
    Reflect.set(style, attribute, unitify(value));
  }
}

type SelectAllSelectors = Element | ReadonlyArray<Element | string> | string;

const selectAll = (
  selector: SelectAllSelectors,
  document: Document = window.document
) => {
  const selectors = Array.isArray(selector) ? selector : [selector];
  let elements: Element[] = [];

  selectors.forEach((entry) => {
    if (typeof entry === 'string') {
      elements = elements.concat([...document.querySelectorAll(entry)]);
    } else if (entry instanceof Element) {
      elements.push(entry);
    }
  });

  return elements;
};

const intersectsScroll = (
  area: DOMRect,
  element: DOMRect,
  _intersection: Intersection,
  container: HTMLElement
) => {
  const containerRect = container.getBoundingClientRect();

  return (
    area.right >= element.left - containerRect.left &&
    area.left + containerRect.left <= element.right + container.scrollLeft &&
    area.bottom - container.scrollTop >= element.top - containerRect.top &&
    area.top <= element.bottom - containerRect.top + container.scrollTop
  );
};

const shouldTrigger = (event: MouseEvent, triggers: SelectionAreaTrigger[]) =>
  triggers.some((trigger) => {
    if (typeof trigger === 'number') return event.button === trigger;
    if (trigger.button !== event.button) return false;

    return trigger.modifiers.every((modifier) => {
      if (modifier === 'alt') return event.altKey;
      if (modifier === 'ctrl') return event.ctrlKey || event.metaKey;
      if (modifier === 'shift') return event.shiftKey;

      return false;
    });
  });

const isTouchDevice = () =>
  matchMedia('(hover: none), (pointer: coarse)').matches;
const isSafariBrowser = () => 'safari' in window;

// Some var shorting for better compression and readability
const { abs, ceil, max, min } = Math;

export class SelectionArea extends EventTarget<SelectionEvents> {
  // Area element and clipping element
  private readonly _area: HTMLElement;
  private _areaClientLocation: AreaLocation = { x1: 0, x2: 0, y1: 0, y2: 0 };

  // Dynamically constructed area rect
  private _areaLocation: AreaLocation = { x1: 0, x2: 0, y1: 0, y2: 0 };

  // Caches the position of the selection-area
  private readonly _areaRect = new DOMRect();

  private _container?: HTMLElement;
  private _containerRect?: DOMRect;
  private readonly _frame: Frames;
  private readonly _ownsArea: boolean;
  private _initScrollDelta: Coordinates = { x: 0, y: 0 };
  private _latestElement?: Element;
  private _nativeSelectionGuard?: Array<{
    element: HTMLElement;
    userSelect: string;
  }>;
  private _nativeSelectionReleaseFrame?: number;
  // Options
  private readonly _options: SelectionAreaOptions;

  // Is getting set on movement.
  private readonly _scrollAvailable = true;

  // The scroll distance of scrollElement (body or html) relative to the initial scroll position
  private readonly _scrollDelta: Coordinates = { x: 0, y: 0 };
  // If a single click is being performed.
  private _scrollingActive = false;

  private readonly _scrollSpeed: Coordinates = { x: 0, y: 0 };
  private _selectables: Element[] = [];

  // Selection store
  private _selection: SelectionStore = {
    changed: {
      // Added elements since last selection
      added: [],
      // Removed elements since last selection
      removed: [],
    },
    selected: [],
    stored: [],
    touched: [],
  };

  // It's a single-click until the user dragged the mouse.
  private _singleClick = true;
  private wheelTimer: ReturnType<typeof setTimeout> | null = null;

  disable = () => this._bindStartEvents(false);

  enable = () => this._bindStartEvents();

  constructor(opt: PartialSelectionAreaOptions) {
    super();

    this._options = {
      boundaries: ['html'],
      container: 'body',
      document: window.document,
      selectables: [],
      selectionAreaClass: 'selection-area',
      startAreas: ['html'],
      ...opt,

      behaviour: {
        // TODO: not implemented
        intersect: 'touch',
        overlap: 'invert',
        triggers: [0],
        ...opt.behaviour,
        scrolling: {
          manualSpeed: 750,
          speedDivider: 0.7,
          ...opt.behaviour?.scrolling,
          startScrollMargins: {
            x: 20,
            y: 40,
            ...opt.behaviour?.scrolling?.startScrollMargins,
          },
        },
        startThreshold: opt.behaviour?.startThreshold
          ? typeof opt.behaviour.startThreshold === 'number'
            ? opt.behaviour.startThreshold
            : { x: 4, y: 4, ...opt.behaviour.startThreshold }
          : { x: 4, y: 4 },
      },

      features: {
        range: true,
        touch: true,
        ...opt.features,
        singleTap: {
          allow: true,
          intersect: 'native',
          ...opt.features?.singleTap,
        },
      },
    };

    // Bind locale functions to instance

    for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
      const method = Reflect.get(this, key);

      if (typeof method === 'function') {
        Reflect.set(this, key, method.bind(this));
      }
    }

    const { document, selectionAreaClass } = this._options;
    this._ownsArea = !opt.selectionAreaElement;
    this._area = opt.selectionAreaElement ?? document.createElement('div');
    // this._clippingElement = document.createElement('div');
    // this._clippingElement.appendChild(this._area);

    this._area.classList.add(selectionAreaClass);
    // selectionContainerClass && this._clippingElement.classList.add(selectionContainerClass);

    css(this._area, {
      left: 0,
      position: this._ownsArea ? 'absolute' : 'fixed',
      top: 0,
      willChange: 'top, left, bottom, right, width, height',
    });

    // css(this._clippingElement, {
    //     overflow: 'hidden',
    //     height:"100%",
    //     position: 'absolute',
    //     transform: 'translate3d(0, 0, 0)', // https://stackoverflow.com/a/38268846
    //     pointerEvents: 'none',
    //     zIndex: '1'
    // });

    this._frame = frames((evt: MouseEvent | TouchEvent | null) => {
      this._recalculateSelectionAreaRect();
      this._updateElementSelection();
      this._emitEvent('move', evt);
      this._redrawSelectionArea();
    });

    this.enable();
  }

  _bindStartEvents = (activate = true): void => {
    const { document, features } = this._options;
    const fn = activate ? on : off;

    fn(document, 'mousedown', this._onTapStart, { capture: true });

    if (features.touch) {
      fn(document, 'touchstart', this._onTapStart, {
        capture: true,
        passive: false,
      });
    }
  };

  _delayedTapMove = (evt: MouseEvent | TouchEvent): void => {
    const {
      behaviour: { startThreshold },
      document,
    } = this._options;
    // Coordinates of first "tap"
    const { x1, y1 } = this._areaLocation;
    const { x1: clientX, y1: clientY } = this._areaClientLocation;
    const { x, y } = simplifyEvent(evt);

    // Check pixel threshold
    const exceededThreshold =
      typeof startThreshold === 'number'
        ? abs(x + y - (clientX + clientY)) >= startThreshold
        : abs(x - x1) >= startThreshold.x || abs(y - y1) >= startThreshold.y;

    if (exceededThreshold) {
      off(document, ['mousemove', 'touchmove'], this._delayedTapMove, {
        passive: false,
      });

      if (this._emitEvent('beforedrag', evt) === false) {
        off(document, ['mouseup', 'touchcancel', 'touchend'], this._onTapStop);

        return;
      }

      evt.preventDefault();
      this._startNativeSelectionGuard();

      on(document, ['mousemove', 'touchmove'], this._onTapMove, {
        passive: false,
      });

      // Make area element visible
      css(this._area, 'display', 'block');

      if (this._ownsArea) {
        (
          this._container ?? failInvariant('Expected value to be defined')
        ).append(this._area);
      }

      this.resolveSelectables();

      // An action is recognized as single-select until the user performed a multi-selection
      this._singleClick = false;

      on(this._container, 'wheel', this._manualScroll, { passive: true });

      // Re-setup selection area and fire event
      this._setupSelectionArea();
      this._emitEvent('start', evt);
      this._onTapMove(evt);
    }

    this._handleMoveEvent(evt);
  };

  _emitEvent(
    name: keyof SelectionEvents,
    evt: MouseEvent | TouchEvent | null
  ): unknown {
    return this.emit(name, {
      event: evt,
      selection: this,
      store: this._selection,
    });
  }

  _handleMoveEvent(evt: MouseEvent | TouchEvent) {
    const { features } = this._options;

    /**
     * - Prevent auto-refresh for when pulling down on touch devices.
     * - Prevent auto-scroll by the browser when on safari and scrolling is
     *   handled by viselect.
     */
    if (
      (features.touch && isTouchDevice()) ||
      (this._scrollAvailable && isSafariBrowser())
    ) {
      // Prevent swipe-down refresh
      evt.preventDefault();
    }
  }

  _keepSelection(): void {
    const { _options, _selection } = this;
    const { changed, selected, stored, touched } = _selection;
    const removedSet = new Set(changed.removed);
    const storedSet = new Set(stored);
    const touchedSet = new Set(touched);
    const addedElements = selected.filter((el) => !storedSet.has(el));

    switch (_options.behaviour.overlap) {
      case 'drop': {
        _selection.stored = [
          ...addedElements,
          // Elements not touched
          ...stored.filter((el) => !touchedSet.has(el)),
        ];

        break;
      }
      case 'invert': {
        _selection.stored = [
          ...addedElements,
          // Elements not removed from selection
          ...stored.filter((el) => !removedSet.has(el)),
        ];

        break;
      }
      case 'keep': {
        _selection.stored = [
          ...stored,
          // Newly added
          ...selected.filter((el) => !storedSet.has(el)),
        ];

        break;
      }
    }
  }

  _manualScroll = (evt: ScrollEvent): void => {
    if (this.wheelTimer) {
      clearTimeout(this.wheelTimer);
    }

    const { x, y } = simplifyEvent(evt);

    this.wheelTimer = setTimeout(() => {
      this._areaClientLocation.x2 = x;
      this._areaClientLocation.y2 = y;

      const Ry =
        y -
        (this._containerRect ?? failInvariant('Expected value to be defined'))
          .top;
      const Rx =
        x -
        (this._containerRect ?? failInvariant('Expected value to be defined'))
          .left;
      this._areaLocation.x2 =
        Rx +
        (this._container ?? failInvariant('Expected value to be defined'))
          .scrollLeft;
      this._areaLocation.y2 =
        Ry +
        (this._container ?? failInvariant('Expected value to be defined'))
          .scrollTop;
      this._frame.next(null);
    }, 100);
  };

  _onScroll = (evt: ScrollEvent): void => {
    const { document } = this._options;

    if (this.wheelTimer) {
      clearTimeout(this.wheelTimer);
    }

    const { x, y } = simplifyEvent(evt);

    this.wheelTimer = setTimeout(() => {
      this._areaClientLocation.x2 = x;
      this._areaClientLocation.y2 = y;

      const deltaY =
        y -
        (this._containerRect ?? failInvariant('Expected value to be defined'))
          .top +
        (this._container ?? failInvariant('Expected value to be defined'))
          .scrollTop +
        (
          document.scrollingElement ??
          failInvariant('Expected value to be defined')
        ).scrollTop -
        this._initScrollDelta.y;

      const deltaX =
        x -
        (this._containerRect ?? failInvariant('Expected value to be defined'))
          .left +
        (this._container ?? failInvariant('Expected value to be defined'))
          .scrollLeft +
        (
          document.scrollingElement ??
          failInvariant('Expected value to be defined')
        ).scrollLeft;

      this._scrollDelta.y =
        (
          document.scrollingElement ??
          failInvariant('Expected value to be defined')
        ).scrollTop - this._initScrollDelta.y;

      this._scrollDelta.x =
        (
          document.scrollingElement ??
          failInvariant('Expected value to be defined')
        ).scrollLeft - this._initScrollDelta.x;

      this._areaLocation.y2 = deltaY;
      this._areaLocation.x2 = deltaX;
      this._frame.next(null);
    }, 100);
  };

  _onSingleTap(evt: MouseEvent | TouchEvent): void {
    const {
      range,
      singleTap: { intersect },
    } = this._options.features;
    const e = simplifyEvent(evt);
    let target: Element | undefined;

    if (intersect === 'native') {
      target = e.target ?? undefined;
    } else if (intersect === 'touch') {
      this.resolveSelectables();

      const { x, y } = e;
      target = this._selectables.find((v) => {
        const { bottom, left, right, top } = v.getBoundingClientRect();

        return x < right && x > left && y < bottom && y > top;
      });
    }
    if (!target) {
      return;
    }

    /**
     * Resolve selectables again. If the user started in a scrollable area they
     * will be reduced to the current area. Prevent the exclusion of these if a
     * range-selection gets performed.
     */
    this.resolveSelectables();
    const selectableSet = new Set(this._selectables);

    // Traverse dom upwards to check if target is selectable
    while (!selectableSet.has(target)) {
      if (!target.parentElement) {
        return;
      }

      target = target.parentElement;
    }

    // Grab current store first in case it gets set back
    const { stored } = this._selection;
    this._emitEvent('start', evt);
    const currentStoredSet = new Set(this._selection.stored);
    const storedSet = new Set(stored);

    if (evt.shiftKey && range && this._latestElement) {
      const reference = this._latestElement;

      // Resolve correct range
      const [preceding, following] =
        reference.compareDocumentPosition(target) & 4
          ? [target, reference]
          : [reference, target];

      const rangeItems = [
        ...this._selectables.filter(
          (el) =>
            el.compareDocumentPosition(preceding) & 4 &&
            el.compareDocumentPosition(following) & 2
        ),
        preceding,
        following,
      ];

      this.select(rangeItems);
      // latestElement is by default cleared in .select()
      this._latestElement = reference;
    } else if (
      storedSet.has(target) &&
      (stored.length === 1 ||
        evt.ctrlKey ||
        stored.every((value) => currentStoredSet.has(value)))
    ) {
      this.deselect(target);
    } else {
      this.select(target);
      this._latestElement = target;
    }
  }

  _onTapMove = (evt: MouseEvent | TouchEvent): void => {
    evt.preventDefault();

    const { x, y } = simplifyEvent(evt);

    const {
      _areaClientLocation,
      _areaLocation,
      _frame,
      _options,
      _scrollSpeed,
    } = this;
    const { speedDivider } = _options.behaviour.scrolling;
    const Ry =
      y -
      (this._containerRect ?? failInvariant('Expected value to be defined'))
        .top;
    const Rx =
      x -
      (this._containerRect ?? failInvariant('Expected value to be defined'))
        .left;

    if (
      this._scrollAvailable &&
      !this._scrollingActive &&
      (_scrollSpeed.y || _scrollSpeed.x)
    ) {
      // Continuous scrolling
      this._scrollingActive = true;

      const scroll = () => {
        if (!_scrollSpeed.x && !_scrollSpeed.y) {
          this._scrollingActive = false;

          return;
        }
        // Reduce velocity, use ceil in both directions to scroll at least 1px per frame
        if (_scrollSpeed.y) {
          (
            this._container ?? failInvariant('Expected value to be defined')
          ).scrollTop += ceil(_scrollSpeed.y / speedDivider);
          _areaLocation.y2 = Ry;
        }
        if (_scrollSpeed.x) {
          (
            this._container ?? failInvariant('Expected value to be defined')
          ).scrollLeft += ceil(_scrollSpeed.x / speedDivider);
          _areaLocation.x2 = Rx;
        }

        /**
         * We changed the start coordinates -> redraw the selection-area We
         * changed the dimensions of the area element -> re-calc selected
         * elements The selected elements array has been changed -> fire event
         */
        _frame.next(evt);

        // Keep scrolling even if the user stops to move his pointer
        requestAnimationFrame(scroll);
      };

      requestAnimationFrame(scroll);
    } else {
      _areaLocation.x2 =
        Rx +
        (this._container ?? failInvariant('Expected value to be defined'))
          .scrollLeft +
        this._scrollDelta.x;
      _areaLocation.y2 =
        Ry +
        (this._container ?? failInvariant('Expected value to be defined'))
          .scrollTop +
        this._scrollDelta.y;

      _areaClientLocation.x2 = x;
      _areaClientLocation.y2 = y;

      /**
       * Perform redraw only if scrolling is not active. If scrolling is active
       * this area is getting re-dragged by the anonymize scroll function.
       */
      _frame.next(evt);
    }

    this._handleMoveEvent(evt);
  };

  _onNativeSelectionChange = (): void => {
    const selection = this._options.document.getSelection();

    if (selection?.rangeCount) selection.removeAllRanges();
  };

  _releaseNativeSelectionGuard(): void {
    const { document } = this._options;
    const view = document.defaultView;

    if (this._nativeSelectionReleaseFrame !== undefined) {
      view?.cancelAnimationFrame(this._nativeSelectionReleaseFrame);
      this._nativeSelectionReleaseFrame = undefined;
    }

    document.getSelection()?.removeAllRanges();
    off(document, 'selectionchange', this._onNativeSelectionChange);

    if (this._nativeSelectionGuard) {
      this._nativeSelectionGuard.forEach(({ element, userSelect }) => {
        element.style.userSelect = userSelect;
      });
      this._nativeSelectionGuard = undefined;
    }
  }

  _startNativeSelectionGuard(): void {
    const { document } = this._options;
    const view = document.defaultView;

    if (this._nativeSelectionReleaseFrame !== undefined) {
      view?.cancelAnimationFrame(this._nativeSelectionReleaseFrame);
      this._nativeSelectionReleaseFrame = undefined;
    }

    if (!this._nativeSelectionGuard) {
      const boundaries = selectAll(this._options.boundaries, document).filter(
        (element): element is HTMLElement => element instanceof HTMLElement
      );
      const targets = new Set(boundaries);

      if (this._container) targets.add(this._container);

      this._nativeSelectionGuard = [...targets].map((element) => ({
        element,
        userSelect: element.style.userSelect,
      }));
      this._nativeSelectionGuard.forEach(({ element }) => {
        element.style.userSelect = 'none';
      });
    }

    document.getSelection()?.removeAllRanges();
    on(document, 'selectionchange', this._onNativeSelectionChange);
  }

  _onTapStart = (evt: MouseEvent | TouchEvent, silent = false): void => {
    const { container, document } = this._options;
    const { target, x, y } = simplifyEvent(evt);

    const containerElement = selectAll(container, document)[0];
    if (!(containerElement instanceof HTMLElement)) return;

    this._container = containerElement;
    if (!(target instanceof HTMLElement)) return;
    if (
      this._container.contains(target) &&
      target.dataset.pliteEditor !== 'true' &&
      target.dataset.plateSelectable !== 'true'
    ) {
      return;
    }

    this._containerRect = this._container.getBoundingClientRect();

    const Rx = x - this._containerRect.left + this._container.scrollLeft;
    const Ry = y - this._containerRect.top + this._container.scrollTop;

    const { _options } = this;

    if (
      evt instanceof MouseEvent &&
      !shouldTrigger(evt, _options.behaviour.triggers)
    ) {
      return;
    }

    // Find start-areas and boundaries
    const startAreas = selectAll(_options.startAreas, _options.document);
    const resolvedBoundaries = selectAll(
      _options.boundaries,
      _options.document
    );

    // Check if area starts in one of the start areas / boundaries
    const evtPathSet = new Set(evt.composedPath());

    if (
      !this._container ||
      !startAreas.some((el) => evtPathSet.has(el)) ||
      !resolvedBoundaries.some((el) => evtPathSet.has(el))
    ) {
      return;
    }
    const ownsNativePointerSelection =
      evt instanceof MouseEvent && target.dataset.plateSelectable === 'true';

    if (!silent && this._emitEvent('beforestart', evt) === false) {
      return;
    }
    if (ownsNativePointerSelection) {
      evt.preventDefault();
      evt.stopPropagation();
      this._startNativeSelectionGuard();
    }

    this._areaLocation = { x1: Rx, x2: 0, y1: Ry, y2: 0 };
    this._areaClientLocation = { x1: x, x2: 0, y1: y, y2: 0 };

    // Lock scrolling in target container
    const scrollElement = document.scrollingElement ?? document.body;
    this._initScrollDelta = {
      x: scrollElement.scrollLeft,
      y: scrollElement.scrollTop,
    };

    // To detect single-click
    this._singleClick = true;
    this.clearSelection(false, true);

    on(document, ['touchmove', 'mousemove'], this._delayedTapMove, {
      passive: false,
    });
    on(document, ['mouseup', 'touchcancel', 'touchend'], this._onTapStop);
    on(document, 'wheel', this._onScroll, { passive: false });
  };

  _onTapStop = (evt: MouseEvent | TouchEvent | null, silent: boolean): void => {
    const { document, features } = this._options;
    const { _singleClick } = this;

    if (!_singleClick) {
      evt?.preventDefault();
      document.getSelection()?.removeAllRanges();

      const view = document.defaultView;

      if (evt && view && typeof view.requestAnimationFrame === 'function') {
        this._nativeSelectionReleaseFrame = view.requestAnimationFrame(() => {
          this._nativeSelectionReleaseFrame = undefined;
          this._releaseNativeSelectionGuard();
        });
      } else {
        this._releaseNativeSelectionGuard();
      }
    } else {
      this._releaseNativeSelectionGuard();
    }

    // Remove event handlers
    off(document, ['mousemove', 'touchmove'], this._delayedTapMove);
    off(document, ['touchmove', 'mousemove'], this._onTapMove);
    off(document, ['mouseup', 'touchcancel', 'touchend'], this._onTapStop);
    off(document, 'wheel', this._onScroll);

    // Keep selection until the next time
    this._keepSelection();

    if (evt && _singleClick && features.singleTap.allow) {
      this._onSingleTap(evt);
    } else if (!_singleClick && !silent) {
      this._updateElementSelection();
      this._emitEvent('stop', evt);
    }

    this._scrollSpeed.x = 0;
    this._scrollSpeed.y = 0;
    this._scrollDelta.x = 0;
    this._scrollDelta.y = 0;

    // Unbind mouse scrolling listener
    off(this._container, 'wheel', this._manualScroll, { passive: true });

    // Remove selection-area from dom
    if (this._ownsArea) this._area.remove();

    // Cancel current frame
    this._frame?.cancel();

    // Hide selection area
    css(this._area, 'display', 'none');
  };

  _recalculateSelectionAreaRect(): void {
    const {
      _areaClientLocation,
      _areaLocation,
      _areaRect,
      _container,
      _containerRect,
      _scrollSpeed,
    } = this;
    if (!_container || !_containerRect) return;

    const {
      clientHeight,
      clientWidth,
      scrollHeight,
      scrollLeft,
      scrollTop,
      scrollWidth,
    } = _container;

    const { x1, y1 } = _areaLocation;
    let { x2, y2 } = _areaLocation;

    const {
      behaviour: {
        scrolling: { startScrollMargins },
      },
    } = this._options;

    if (
      _areaClientLocation.x2 + this._scrollDelta.x <
      _containerRect.left + startScrollMargins.x
    ) {
      _scrollSpeed.x = scrollLeft
        ? -abs(
            _containerRect.left - _areaClientLocation.x2 - this._scrollDelta.x
          )
        : 0;
      x2 = max(
        x2,
        (this._container ?? failInvariant('Expected value to be defined'))
          .scrollLeft
      );
    } else if (
      _areaClientLocation.x2 + this._scrollDelta.x >
      _containerRect.right - startScrollMargins.x
    ) {
      _scrollSpeed.x =
        scrollWidth - scrollLeft - clientWidth
          ? abs(
              _containerRect.left +
                (
                  this._container ??
                  failInvariant('Expected value to be defined')
                ).clientWidth -
                _areaClientLocation.x2 -
                this._scrollDelta.x
            )
          : 0;
      x2 = clientWidth + scrollLeft;
    } else {
      _scrollSpeed.x = 0;
    }
    if (
      _areaClientLocation.y2 + this._scrollDelta.y <
      _containerRect.top + startScrollMargins.y
    ) {
      _scrollSpeed.y = scrollTop
        ? -abs(
            _containerRect.top -
              _areaClientLocation.y2 -
              this._scrollDelta.y +
              startScrollMargins.y
          )
        : 0;
      y2 = max(
        y2,
        (this._container ?? failInvariant('Expected value to be defined'))
          .scrollTop
      );
    } else if (
      _areaClientLocation.y2 + this._scrollDelta.y >
      _containerRect.bottom - startScrollMargins.y
    ) {
      _scrollSpeed.y =
        scrollHeight - scrollTop - clientHeight
          ? abs(
              _areaClientLocation.y2 +
                this._scrollDelta.y -
                (_containerRect.top +
                  (
                    this._container ??
                    failInvariant('Expected value to be defined')
                  ).clientHeight -
                  startScrollMargins.y)
            )
          : 0;
      y2 = clientHeight + scrollTop;
    } else {
      _scrollSpeed.y = 0;
    }

    // Calculate the final selection area rectangle
    const x3 = min(x1, x2);
    const y3 = min(y1, y2);
    const x4 = max(x1, x2);
    const y4 = max(y1, y2);

    // Update the _areaRect with the new values
    _areaRect.x = x3;
    _areaRect.y = y3;
    _areaRect.width = x4 - x3;
    _areaRect.height = y4 - y3;
  }

  _redrawSelectionArea(): void {
    const { height, width, x, y } = this._areaRect;
    const { style } = this._area;
    const left =
      !this._ownsArea && this._container && this._containerRect
        ? x + this._containerRect.left - this._container.scrollLeft
        : x;
    const top =
      !this._ownsArea && this._container && this._containerRect
        ? y + this._containerRect.top - this._container.scrollTop
        : y;

    // Using transform will make the area's borders look blurry
    style.left = `${left}px`;
    style.top = `${top}px`;
    style.width = `${width}px`;
    style.height = `${height}px`;
  }

  _setupSelectionArea(): void {}

  _updateElementSelection(): void {
    const { _areaRect, _options, _selectables, _selection } = this;
    if (!this._container) return;

    const { selected, stored, touched } = _selection;
    const { intersect, overlap } = _options.behaviour;

    const invert = overlap === 'invert';
    const newlyTouched: Element[] = [];
    const newlyTouchedSet = new Set<Element>();
    const added: Element[] = [];
    const removed: Element[] = [];
    const selectedSet = new Set(selected);
    const storedSet = new Set(stored);
    const touchedSet = new Set(touched);

    // Find newly selected elements
    for (const node of _selectables) {
      // Check if area intersects element
      if (
        intersectsScroll(
          _areaRect,
          node.getBoundingClientRect(),
          intersect,
          this._container
        )
      ) {
        // Check if the element wasn't present in the last selection.
        if (!selectedSet.has(node)) {
          // Check if user wants to invert the selection for already selected elements
          if (invert && storedSet.has(node)) {
            removed.push(node);

            continue;
          }
          added.push(node);
        } else if (storedSet.has(node) && !touchedSet.has(node)) {
          touched.push(node);
          touchedSet.add(node);
        }

        newlyTouched.push(node);
        newlyTouchedSet.add(node);
      }
    }

    // Re-select elements which were previously stored
    if (invert) {
      added.push(...stored.filter((value) => !selectedSet.has(value)));
    }

    // Check which elements where removed since last selection
    const keep = overlap === 'keep';

    for (const node of selected) {
      if (
        !newlyTouchedSet.has(node) &&
        !(
          // Check if user wants to keep previously selected elements, e.g.
          // not make them part of the current selection as soon as they're touched.
          keep && storedSet.has(node)
        )
      ) {
        removed.push(node);
      }
    }

    _selection.selected = newlyTouched;
    _selection.changed = { added, removed };

    // Prevent range selection when selection an area.
    this._latestElement = undefined;
  }

  /**
   * Cancel the current selection process.
   *
   * @param keepEvent {boolean} true to fire a stop event after cancel.
   */
  cancel(keepEvent = false): void {
    this._onTapStop(null, !keepEvent);
  }

  /**
   * Same as deselect, but for all elements currently selected.
   *
   * @param includeStored If the store should also get cleared
   * @param quiet If move / stop events should be fired
   */
  clearSelection(includeStored = true, quiet = false): void {
    const { changed, selected, stored } = this._selection;

    changed.added = [];
    changed.removed.push(...selected, ...(includeStored ? stored : []));

    // Fire event
    if (!quiet) {
      this._emitEvent('move', null);
      this._emitEvent('stop', null);
    }

    // Reset state
    this._selection = {
      changed: { added: [], removed: [] },
      selected: [],
      stored: includeStored ? [] : stored,
      touched: [],
    };
  }

  /**
   * Removes a particular element from the selection.
   *
   * @param query - CSS Query, can be an array of queries
   * @param quiet - If this should not trigger the move event
   */
  deselect(query: SelectAllSelectors, quiet = false) {
    const { changed, selected, stored } = this._selection;
    const selectedSet = new Set(selected);
    const storedSet = new Set(stored);

    const elements = selectAll(query, this._options.document).filter(
      (el) => selectedSet.has(el) || storedSet.has(el)
    );

    if (elements.length === 0) {
      return;
    }

    const elementSet = new Set(elements);
    const removedSet = new Set(changed.removed);
    this._selection.stored = stored.filter((el) => !elementSet.has(el));
    this._selection.selected = selected.filter((el) => !elementSet.has(el));
    this._selection.changed.added = [];
    this._selection.changed.removed.push(
      ...elements.filter((el) => !removedSet.has(el))
    );

    // We don't know which element was "selected" first so clear it
    this._latestElement = undefined;

    // Fire event
    if (!quiet) {
      this._emitEvent('move', null);
      this._emitEvent('stop', null);
    }
  }

  /** Unbinds all events and removes the area-element. */
  destroy(): void {
    this.cancel();
    this.disable();
    super.unbindAllListeners();
  }

  /** @returns {Array} Selected elements */
  getSelection(): Element[] {
    return this._selection.stored;
  }

  /** @returns {HTMLElement} The selection area element */
  getSelectionArea(): HTMLElement {
    return this._area;
  }
  /**
   * Can be used if during a selection elements have been added. Will update
   * everything which can be selected.
   */
  resolveSelectables(): void {
    this._selectables =
      typeof this._options.selectables === 'function'
        ? this._options.selectables()
        : selectAll(this._options.selectables, this._options.document);
  }

  /**
   * Adds elements to the selection
   *
   * @param query - CSS Query, can be an array of queries
   * @param quiet - If this should not trigger the move event
   */
  select(query: SelectAllSelectors, quiet = false): Element[] {
    const { changed, selected, stored } = this._selection;
    const selectedSet = new Set(selected);
    const storedSet = new Set(stored);
    const elements = selectAll(query, this._options.document).filter(
      (el) => !selectedSet.has(el) && !storedSet.has(el)
    );

    // Update element lists
    stored.push(...elements);
    selected.push(...elements);
    changed.added.push(...elements);
    changed.removed = [];

    // We don't know which element was "selected" first so clear it
    this._latestElement = undefined;

    // Fire event
    if (!quiet) {
      this._emitEvent('move', null);
      this._emitEvent('stop', null);
    }

    return elements;
  }

  /**
   * Manually triggers the start of a selection
   *
   * @param evt A MouseEvent / TouchEvent -like object
   * @param silent If beforestart should be fired,
   */
  trigger(evt: MouseEvent | TouchEvent, silent = true): void {
    this._onTapStart(evt, silent);
  }
}
