export const isTouchEvent = (
  event: MouseEvent | TouchEvent
): event is TouchEvent => 'touches' in event;
