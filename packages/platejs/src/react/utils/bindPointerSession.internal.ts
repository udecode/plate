export const bindPointerSession = ({
  ownerWindow,
  pointerId,
  isCurrent,
  onMove,
  onEnd,
}: {
  ownerWindow: Window;
  pointerId: number;
  isCurrent: () => boolean;
  onMove: (event: PointerEvent) => void;
  onEnd: (event?: PointerEvent) => void;
}) => {
  let active = true;
  const finish = (event?: PointerEvent) => {
    if (!active) return;
    active = false;
    ownerWindow.removeEventListener('pointermove', move);
    ownerWindow.removeEventListener('pointerup', end);
    ownerWindow.removeEventListener('pointercancel', cancel);
    ownerWindow.removeEventListener('blur', blur);
    onEnd(event && isCurrent() ? event : undefined);
  };
  const move = (event: PointerEvent) => {
    if (event.pointerId !== pointerId) return;
    if (!isCurrent()) {
      finish();
      return;
    }
    onMove(event);
  };
  const end = (event: PointerEvent) => {
    if (event.pointerId === pointerId) finish(event);
  };
  const cancel = (event: PointerEvent) => {
    if (event.pointerId === pointerId) finish();
  };
  const blur = () => finish();

  ownerWindow.addEventListener('pointermove', move);
  ownerWindow.addEventListener('pointerup', end);
  ownerWindow.addEventListener('pointercancel', cancel);
  ownerWindow.addEventListener('blur', blur);
  return blur;
};
