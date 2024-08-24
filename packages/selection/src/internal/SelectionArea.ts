/* eslint-disable @typescript-eslint/unbound-method */
'use client';

import type {
  AreaLocation,
  Coordinates,
  PartialSelectionOptions,
  ScrollEvent,
  SelectionEvents,
  SelectionOptions,
  SelectionStore,
} from './types';

import { EventTarget } from './EventEmitter';
import {
  type Frames,
  type SelectAllSelectors,
  css,
  frames,
  intersects,
  intersectsScroll,
  isSafariBrowser,
  isTouchDevice,
  off,
  on,
  selectAll,
  shouldTrigger,
  simplifyEvent,
} from './utils';

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

  private _container?: Element;
  private _containerRect?: DOMRect;
  private _frame: Frames;
  private _initScrollDelta: Coordinates = { x: 0, y: 0 };
  private _latestElement?: Element;
  // Options
  private readonly _options: SelectionOptions;

  // Is getting set on movement.
  private _scrollAvailable = true;

  private _scrollDelta: Coordinates = { x: 0, y: 0 };
  private _scrollSpeed: Coordinates = { x: 0, y: 0 };

  // If a single click is being performed.
  private _scrollingActive = false;
  private _selectables: Element[] = [];

  // Selection store
  private _selection: SelectionStore = {
    changed: {
      added: [], // Added elements since last selection
      removed: [], // Removed elements since last selection
    },
    selected: [],
    stored: [],
    touched: [],
  };

  // It's a single-click until the user dragged the mouse.
  private _singleClick = true;
  // Target container (element) and boundary (cached)
  private _targetElement?: Element;
  private _targetRect?: DOMRect;
  private wheelTimer: NodeJS.Timeout | null = null;

  disable = this._bindStartEvents.bind(this, false);

  enable = this._bindStartEvents;

  constructor(opt: PartialSelectionOptions) {
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
        intersect: 'touch',
        overlap: 'invert',
        triggers: [0],
        ...opt.behaviour,
        scrolling: {
          manualSpeed: 750,
          speedDivider: 10,
          ...opt.behaviour?.scrolling,
          startScrollMargins: {
            x: 0,
            y: 0,
            ...opt.behaviour?.scrolling?.startScrollMargins,
          },
        },
        startThreshold: opt.behaviour?.startThreshold
          ? typeof opt.behaviour.startThreshold === 'number'
            ? opt.behaviour.startThreshold
            : { x: 10, y: 10, ...opt.behaviour.startThreshold }
          : { x: 10, y: 10 },
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
      if (typeof (this as any)[key] === 'function') {
        (this as any)[key] = (this as any)[key].bind(this);
      }
    }

    const { document, selectionAreaClass } = this._options;
    this._area = document.createElement('div');
    // this._clippingElement = document.createElement('div');
    // this._clippingElement.appendChild(this._area);

    this._area.classList.add(selectionAreaClass);
    // selectionContainerClass && this._clippingElement.classList.add(selectionContainerClass);

    css(this._area, {
      left: 0,
      position: 'absolute',
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

    this._frame = frames((evt: MouseEvent | TouchEvent) => {
      this._recalculateSelectionAreaRect();
      this._updateElementSelection();
      this._emitEvent('move', evt);
      this._redrawSelectionArea();
    });

    this.enable();
  }

  _bindStartEvents(activate = true): void {
    const { document, features } = this._options;
    const fn = activate ? on : off;

    fn(document, 'mousedown', this._onTapStart);

    features.touch &&
      fn(document, 'touchstart', this._onTapStart, {
        passive: false,
      });
  }

  _delayedTapMove(evt: MouseEvent | TouchEvent): void {
    const {
      behaviour: { startThreshold },
      document,
    } = this._options;
    const { x1, y1 } = this._areaLocation; // Coordinates of first "tap"
    const { x1: clientX, y1: clientY } = this._areaClientLocation;
    const { x, y } = simplifyEvent(evt);

    // Check pixel threshold
    if (
      // Single number for both coordinates
      (typeof startThreshold === 'number' &&
        abs(x + y - (clientX + clientY)) >= startThreshold) ||
      // Different x and y threshold
      (typeof startThreshold === 'object' &&
        abs(x - x1) >= (startThreshold as Coordinates).x) ||
      abs(y - y1) >= (startThreshold as Coordinates).y
    ) {
      off(document, ['mousemove', 'touchmove'], this._delayedTapMove, {
        passive: false,
      });

      if (this._emitEvent('beforedrag', evt) === false) {
        off(document, ['mouseup', 'touchcancel', 'touchend'], this._onTapStop);

        return;
      }

      on(document, ['mousemove', 'touchmove'], this._onTapMove, {
        passive: false,
      });

      // Make area element visible
      css(this._area, 'display', 'block');

      // Append selection-area to the dom
      this._container!.append(this._area);

      this.resolveSelectables();

      // An action is recognized as single-select until the user performed a multi-selection
      this._singleClick = false;

      // Just saving the boundaries of this container for later
      // this._targetRect = this._targetElement!.getBoundingClientRect();

      // // Find container and check if it's scrollable
      // this._scrollAvailable =
      //     this._targetElement!.scrollHeight !== this._targetElement!.clientHeight ||
      //     this._targetElement!.scrollWidth !== this._targetElement!.clientWidth;

      // if (this._scrollAvailable) {

      //     // Detect mouse scrolling
      on(this._container, 'wheel', this._manualScroll, { passive: true });
      //     /**
      //      * The selection-area will also cover other element which are
      //      * out of the current scrollable parent. So find all elements
      //      * which are in the current scrollable element. Later these are
      //      * the only selectables instead of all.
      //      */
      //     this._selectables = this._selectables.filter(s => this._targetElement!.contains(s));
      // }

      // Re-setup selection area and fire event
      this._setupSelectionArea();
      this._emitEvent('start', evt);
      this._onTapMove(evt);
    }

    this._handleMoveEvent(evt);
  }

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
      evt.preventDefault(); // Prevent swipe-down refresh
    }
  }

  _keepSelection(): void {
    const { _options, _selection } = this;
    const { changed, selected, stored, touched } = _selection;
    const addedElements = selected.filter((el) => !stored.includes(el));

    switch (_options.behaviour.overlap) {
      case 'drop': {
        _selection.stored = [
          ...addedElements,
          ...stored.filter((el) => !touched.includes(el)), // Elements not touched
        ];

        break;
      }
      case 'invert': {
        _selection.stored = [
          ...addedElements,
          ...stored.filter((el) => !changed.removed.includes(el)), // Elements not removed from selection
        ];

        break;
      }
      case 'keep': {
        _selection.stored = [
          ...stored,
          ...selected.filter((el) => !stored.includes(el)), // Newly added
        ];

        break;
      }
    }
  }

  _manualScroll(evt: ScrollEvent): void {
    this.wheelTimer && clearTimeout(this.wheelTimer);

    const { x, y } = simplifyEvent(evt);

    this.wheelTimer = setTimeout(() => {
      const Ry = y - this._containerRect!.top;
      const Rx = x - this._containerRect!.left;
      this._areaLocation.x2 = Rx + this._container!.scrollLeft;
      this._areaLocation.y2 = Ry + this._container!.scrollTop;
      this._frame.next(null);
    }, 100);
  }

  _onScroll(evt: ScrollEvent): void {
    const { document } = this._options;

    this.wheelTimer && clearTimeout(this.wheelTimer);

    const { x, y } = simplifyEvent(evt);

    this.wheelTimer = setTimeout(() => {
      const deltaY =
        y -
        this._containerRect!.top +
        this._container!.scrollTop +
        document.scrollingElement!.scrollTop -
        this._initScrollDelta.y;

      const deltaX =
        x -
        this._containerRect!.left +
        this._container!.scrollLeft +
        document.scrollingElement!.scrollLeft;

      this._scrollDelta.y =
        document.scrollingElement!.scrollTop - this._initScrollDelta.y;

      this._scrollDelta.x =
        document.scrollingElement!.scrollLeft - this._initScrollDelta.x;

      this._areaLocation.y2 = deltaY;
      this._areaLocation.x2 = deltaX;
      this._frame.next(null);
    }, 100);
  }

  _onSingleTap(evt: MouseEvent | TouchEvent): void {
    const {
      range,
      singleTap: { intersect },
    } = this._options.features;
    const e = simplifyEvent(evt);
    let target;

    if (intersect === 'native') {
      target = e.target;
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

    // Traverse dom upwards to check if target is selectable
    while (!this._selectables.includes(target)) {
      if (!target.parentElement) {
        return;
      }

      target = target.parentElement;
    }

    // Grab current store first in case it gets set back
    const { stored } = this._selection;
    this._emitEvent('start', evt);

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
      this._latestElement = reference; // latestElement is by default cleared in .select()
    } else if (
      stored.includes(target) &&
      (stored.length === 1 ||
        evt.ctrlKey ||
        stored.every((v) => this._selection.stored.includes(v)))
    ) {
      this.deselect(target);
    } else {
      this.select(target);
      this._latestElement = target;
    }
  }

  _onTapMove(evt: MouseEvent | TouchEvent): void {
    const { x, y } = simplifyEvent(evt);

    const {
      _areaClientLocation,
      _areaLocation,
      _frame,
      _options,
      _scrollSpeed,
    } = this;
    const { speedDivider } = _options.behaviour.scrolling;
    const Ry = y - this._containerRect!.top;
    const Rx = x - this._containerRect!.left;

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
          this._container!.scrollTop += ceil(_scrollSpeed.y / speedDivider);
          _areaLocation.y2 = Ry;
        }
        if (_scrollSpeed.x) {
          this._container!.scrollLeft += ceil(_scrollSpeed.x / speedDivider);
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
      _areaLocation.x2 = Rx + this._container!.scrollLeft + this._scrollDelta.x;
      _areaLocation.y2 = Ry + this._container!.scrollTop + this._scrollDelta.y;

      _areaClientLocation.x2 = x;
      _areaClientLocation.y2 = y;

      /**
       * Perform redraw only if scrolling is not active. If scrolling is active
       * this area is getting re-dragged by the anonymize scroll function.
       */
      _frame.next(evt);
    }

    this._handleMoveEvent(evt);
  }

  _onTapStart(evt: MouseEvent | TouchEvent, silent = false): void {
    const { container, document } = this._options;
    const { target, x, y } = simplifyEvent(evt);

    this._container = selectAll(container, document)[0];

    if (
      this._container.contains(target) &&
      target.dataset.plateSelectable !== 'true'
    )
      return;

    this._containerRect = this._container.getBoundingClientRect();

    const Rx = x - this._containerRect.left + this._container.scrollLeft;
    const Ry = y - this._containerRect.top + this._container.scrollTop;

    const { _options } = this;
    const targetBoundingClientRect = target.getBoundingClientRect();

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

    // Check in which container the user currently acts
    this._targetElement = resolvedBoundaries.find((el) => {
      return intersects(
        el.getBoundingClientRect(),
        targetBoundingClientRect,
        _options.behaviour.intersect
      );
    });

    this._targetElement = this._container;

    // Check if area starts in one of the start areas / boundaries
    const evtPath = evt.composedPath();

    if (
      !this._targetElement ||
      // eslint-disable-next-line unicorn/prefer-array-some
      !startAreas.find((el) => evtPath.includes(el)) ||
      // eslint-disable-next-line unicorn/prefer-array-some
      !resolvedBoundaries.find((el) => evtPath.includes(el))
    ) {
      return;
    }
    if (!silent && this._emitEvent('beforestart', evt) === false) {
      return;
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
  }

  _onTapStop(evt: MouseEvent | TouchEvent | null, silent: boolean): void {
    const { document, features } = this._options;
    const { _singleClick } = this;

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
    this._area.remove();

    // Cancel current frame
    this._frame?.cancel();

    // Hide selection area
    css(this._area, 'display', 'none');
  }

  _recalculateSelectionAreaRect(): void {
    const {
      _areaClientLocation,
      _areaLocation,
      _areaRect,
      _container,
      _containerRect,
      _scrollSpeed,
    } = this;
    const {
      clientHeight,
      clientWidth,
      scrollHeight,
      scrollLeft,
      scrollTop,
      scrollWidth,
    } = _container as Element;

    const { x1, y1 } = _areaLocation;
    let { x2, y2 } = _areaLocation;

    if (_areaClientLocation.x2 + this._scrollDelta.x < _containerRect!.left) {
      _scrollSpeed.x = scrollLeft
        ? -abs(
            _containerRect!.left - _areaClientLocation.x2 - this._scrollDelta.x
          )
        : 0;
      x2 = max(x2, this._container!.scrollLeft);
    } else if (
      _areaClientLocation.x2 + this._scrollDelta.x >
      _containerRect!.right
    ) {
      _scrollSpeed.x =
        scrollWidth - scrollLeft - clientWidth
          ? abs(
              _containerRect!.left +
                this._container!.clientWidth -
                _areaClientLocation.x2 -
                this._scrollDelta.x
            )
          : 0;
      x2 = clientWidth + scrollLeft;
    } else {
      _scrollSpeed.x = 0;
    }
    if (_areaClientLocation.y2 + this._scrollDelta.y < _containerRect!.top) {
      _scrollSpeed.y = scrollTop
        ? -abs(
            _containerRect!.top - _areaClientLocation.y2 - this._scrollDelta.y
          )
        : 0;
      y2 = max(y2, this._container!.scrollTop);
    } else if (
      _areaClientLocation.y2 + this._scrollDelta.y >
      _containerRect!.bottom
    ) {
      _scrollSpeed.y =
        scrollHeight - scrollTop - clientHeight
          ? abs(
              _containerRect!.top +
                this._container!.clientHeight -
                _areaClientLocation.y2 -
                this._scrollDelta.y
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

    // Using transform will make the area's borders look blurry
    style.left = `${x}px`;
    style.top = `${y}px`;
    style.width = `${width}px`;
    style.height = `${height}px`;
  }

  _setupSelectionArea(): void {
    const { _area, _targetElement } = this;

    const tr = (this._targetRect = _targetElement!.getBoundingClientRect());

    if (this._scrollAvailable) {
      /**
       * To clip the area, the selection area has a parent which has exact the
       * same dimensions as the scrollable element. Now if the area exceeds
       * these boundaries it will be cropped.
       */
      // css(_clippingElement, {
      //     top: tr.top,
      //     left: tr.left,
      //     width: tr.width,
      //     height: tr.height
      // });
      /**
       * The area element is relative to the clipping element, but when this is
       * moved or transformed we need to correct the positions via a negative
       * margin.
       */
      // css(_area, {
      //   marginTop: 0,
      //   marginLeft: 0
      // });
    } else {
      // "Reset" styles

      css(_area, {
        marginLeft: 0,
        marginTop: 0,
      });
    }
  }

  _updateElementSelection(): void {
    const { _areaRect, _options, _selectables, _selection } = this;
    const { selected, stored, touched } = _selection;
    const { intersect, overlap } = _options.behaviour;

    const invert = overlap === 'invert';
    const newlyTouched: Element[] = [];
    const added: Element[] = [];
    const removed: Element[] = [];

    // Find newly selected elements
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < _selectables.length; i++) {
      const node = _selectables[i];

      // Check if area intersects element
      if (
        intersectsScroll(
          _areaRect,
          node.getBoundingClientRect(),
          intersect,
          this._container as HTMLElement
        )
      ) {
        // Check if the element wasn't present in the last selection.
        if (!selected.includes(node)) {
          // Check if user wants to invert the selection for already selected elements
          if (invert && stored.includes(node)) {
            removed.push(node);

            continue;
          } else {
            added.push(node);
          }
        } else if (stored.includes(node) && !touched.includes(node)) {
          touched.push(node);
        }

        newlyTouched.push(node);
      }
    }

    // Re-select elements which were previously stored
    if (invert) {
      added.push(...stored.filter((v) => !selected.includes(v)));
    }

    // Check which elements where removed since last selection
    const keep = overlap === 'keep';

    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < selected.length; i++) {
      const node = selected[i];

      if (
        !newlyTouched.includes(node) &&
        !(
          // Check if user wants to keep previously selected elements, e.g.
          // not make them part of the current selection as soon as they're touched.
          (keep && stored.includes(node))
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

    const elements = selectAll(query, this._options.document).filter(
      (el) => selected.includes(el) || stored.includes(el)
    );

    if (elements.length === 0) {
      return;
    }

    this._selection.stored = stored.filter((el) => !elements.includes(el));
    this._selection.selected = selected.filter((el) => !elements.includes(el));
    this._selection.changed.added = [];
    this._selection.changed.removed.push(
      ...elements.filter((el) => !changed.removed.includes(el))
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
    this._selectables = selectAll(
      this._options.selectables,
      this._options.document
    );
  }

  /**
   * Adds elements to the selection
   *
   * @param query - CSS Query, can be an array of queries
   * @param quiet - If this should not trigger the move event
   */
  select(query: SelectAllSelectors, quiet = false): Element[] {
    const { changed, selected, stored } = this._selection;
    const elements = selectAll(query, this._options.document).filter(
      (el) => !selected.includes(el) && !stored.includes(el)
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
