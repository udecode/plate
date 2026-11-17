import { simulatedPressure } from '../../internal/penStroke.internal';

/**
 * The layer's `touch-action`: a finger still pans the page natively while the
 * Draw tool is on.
 */
export const INK_TOUCH_ACTION = 'pan-x pan-y';

export const inkDraws = (event: PointerEvent, drawing: boolean) =>
  !drawing && event.pointerType !== 'touch' && event.button === 0;

export const inkSamplesOf = (event: PointerEvent): readonly PointerEvent[] => {
  const coalesced = event.getCoalescedEvents?.() ?? [];

  return coalesced.length > 0 ? coalesced : [event];
};

const PRESS_PRESSURE = 0.5;

export const inkPressure = (
  event: PointerEvent,
  previous: Readonly<{ distance: number; pressure: number }> | undefined,
  size: number
) => {
  if (event.pointerType === 'pen') {
    return Math.min(1, Math.max(0, event.pressure));
  }

  return previous
    ? simulatedPressure(previous.pressure, previous.distance, size)
    : PRESS_PRESSURE;
};
