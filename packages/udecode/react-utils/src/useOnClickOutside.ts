import React from 'react';

import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

const canUsePassiveEvents = (): boolean => {
  if (
    typeof window === 'undefined' ||
    typeof window.addEventListener !== 'function'
  )
    return false;

  let passive = false;
  const options = Object.defineProperty({}, 'passive', {
    get() {
      passive = true;
    },
  });
  const noop = () => null;

  window.addEventListener('test', noop, options);
  window.removeEventListener('test', noop, options);

  return passive;
};

export const DEFAULT_IGNORE_CLASS = 'ignore-onclickoutside';

export type UseOnClickOutsideCallback<T extends Event = Event> = (
  event: T
) => void;

export type UseOnClickOutsideOptions = {
  detectIFrame?: boolean;
  disabled?: boolean;
  eventTypes?: readonly string[];
  excludeScrollbar?: boolean;
  ignoreClass?: string[] | string;
  refs?: Refs;
};

export type UseOnClickOutsideReturn = React.RefCallback<El>;

type El = HTMLElement;

type Refs = readonly React.RefObject<El | null>[];

const checkClass = (el: Element, cl: string): boolean =>
  el.classList?.contains(cl);

const hasIgnoreClass = (
  target: EventTarget | null,
  ignoreClass: readonly string[]
): boolean => {
  let el = target instanceof Element ? target : null;

  while (el) {
    for (const className of ignoreClass) {
      if (checkClass(el, className)) return true;
    }

    el = el.parentElement;
  }

  return false;
};

const clickedOnScrollbar = (e: MouseEvent): boolean =>
  document.documentElement.clientWidth <= e.clientX ||
  document.documentElement.clientHeight <= e.clientY;

const getEventOptions = (type: string): AddEventListenerOptions | boolean =>
  type.includes('touch') && canUsePassiveEvents() ? { passive: true } : false;

export const useOnClickOutside = (
  callback: UseOnClickOutsideCallback,
  {
    detectIFrame = true,
    disabled,
    eventTypes = ['mousedown', 'touchstart'],
    excludeScrollbar,
    ignoreClass = DEFAULT_IGNORE_CLASS,
    refs: refsOpt,
  }: UseOnClickOutsideOptions = {}
): UseOnClickOutsideReturn => {
  const [element, setElement] = React.useState<El | null>(null);
  const callbackRef = React.useRef(callback);

  useIsomorphicLayoutEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const ref = React.useCallback(
    (nextElement: El | null) => setElement(nextElement),
    []
  );
  const eventTypesKey = eventTypes.join('\u0000');

  React.useEffect(() => {
    if (!refsOpt?.length && !element) return;

    const getEls = () => {
      if (!refsOpt) return element ? [element] : [];

      const elements: El[] = [];
      for (const { current } of refsOpt) {
        if (current) {
          elements.push(current);
        }
      }

      return elements;
    };
    const ignoreClasses = Array.isArray(ignoreClass)
      ? ignoreClass
      : [ignoreClass];

    const handler = (event: Event) => {
      const target = event.target;

      if (!(target instanceof Node)) return;

      if (
        !hasIgnoreClass(target, ignoreClasses) &&
        !(
          excludeScrollbar &&
          event instanceof MouseEvent &&
          clickedOnScrollbar(event)
        ) &&
        getEls().every((current) => !current.contains(target))
      ) {
        callbackRef.current(event);
      }
    };

    const blurHandler = (event: FocusEvent) =>
      // Firefox updates document.activeElement in the next event loop.
      setTimeout(() => {
        const { activeElement } = document;

        if (
          activeElement instanceof HTMLIFrameElement &&
          !hasIgnoreClass(activeElement, ignoreClasses) &&
          !getEls().includes(activeElement)
        ) {
          callbackRef.current(event);
        }
      }, 0);

    if (disabled) return;

    const activeEventTypes = eventTypesKey.split('\u0000');
    for (const type of activeEventTypes) {
      document.addEventListener(type, handler, getEventOptions(type));
    }

    if (detectIFrame) window.addEventListener('blur', blurHandler);

    return () => {
      for (const type of activeEventTypes) {
        document.removeEventListener(type, handler, false);
      }

      if (detectIFrame) window.removeEventListener('blur', blurHandler);
    };
  }, [
    detectIFrame,
    disabled,
    element,
    eventTypesKey,
    excludeScrollbar,
    ignoreClass,
    refsOpt,
  ]);

  return ref;
};
