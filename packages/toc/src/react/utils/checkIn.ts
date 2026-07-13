export function checkIn(
  e: React.MouseEvent<HTMLElement, globalThis.MouseEvent>
) {
  const x = e.clientX;
  const y = e.clientY;

  const element = e.currentTarget;
  const rect = element.getBoundingClientRect();
  const right = rect.left + element.clientWidth;
  const bottom = rect.top + element.clientHeight;

  return x > rect.left && x < right && y > rect.top && y < bottom;
}
