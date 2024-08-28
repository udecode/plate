/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
type Method = 'addEventListener' | 'removeEventListener';
type AnyFunction = (...arg: any) => any;

export type EventBindingArgs = [
  (EventTarget | undefined)[] | (EventTarget | undefined),
  string | string[],
  AnyFunction,
  Record<string, unknown>?,
];

/* eslint-disable prefer-rest-params */
const eventListener =
  (method: Method) =>
  (
    items: (EventTarget | undefined)[] | (EventTarget | undefined),
    events: string | string[],
    fn: AnyFunction,
    options = {}
  ): EventBindingArgs => {
    // Normalize array
    if (items instanceof HTMLCollection || items instanceof NodeList) {
      items = Array.from(items);
    } else if (!Array.isArray(items)) {
      items = [items];
    }
    if (!Array.isArray(events)) {
      events = [events];
    }

    for (const el of items) {
      if (el) {
        for (const ev of events) {
          el[method](ev, fn as EventListener, { capture: false, ...options });
        }
      }
    }

    return [items, events, fn, options];
  };

/**
 * Add event(s) to element(s).
 *
 * @param elements DOM-Elements
 * @param events Event names
 * @param fn Callback
 * @param options Optional options
 * @returns Array passed arguments
 */
export const on = eventListener('addEventListener');

/**
 * Remove event(s) from element(s).
 *
 * @param elements DOM-Elements
 * @param events Event names
 * @param fn Callback
 * @param options Optional options
 * @returns Array passed arguments
 */
export const off = eventListener('removeEventListener');

/**
 * Simplifies a touch / mouse-event
 *
 * @param evt
 */
export const simplifyEvent = (
  evt: any
): {
  target: HTMLElement;
  x: number;
  y: number;
} => {
  const { clientX, clientY, target } = evt.touches?.[0] ?? evt;

  return { target, x: clientX, y: clientY };
};
