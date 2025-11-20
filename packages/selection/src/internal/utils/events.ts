export type EventBindingArgs = [
  (EventTarget | undefined) | (EventTarget | undefined)[],
  string[] | string,
  AnyFunction,
  Record<string, unknown>?,
];

type AnyFunction = (...arg: any) => any;

type Method = 'addEventListener' | 'removeEventListener';

const eventListener =
  (method: Method) =>
  (
    items: (EventTarget | undefined) | (EventTarget | undefined)[],
    events: string[] | string,
    fn: AnyFunction,
    options = {}
  ): EventBindingArgs => {
    // Normalize array
    let normalizedItems: (EventTarget | undefined)[];
    if (items instanceof HTMLCollection || items instanceof NodeList) {
      normalizedItems = Array.from(items);
    } else if (Array.isArray(items)) {
      normalizedItems = items;
    } else {
      normalizedItems = [items];
    }
    let normalizedEvents: string[];
    if (Array.isArray(events)) {
      normalizedEvents = events;
    } else {
      normalizedEvents = [events];
    }

    for (const el of normalizedItems) {
      if (el) {
        for (const ev of normalizedEvents) {
          el[method](ev, fn as EventListener, { capture: false, ...options });
        }
      }
    }

    return [normalizedItems, normalizedEvents, fn, options];
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
