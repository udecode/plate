export type Intersection = 'center' | 'cover' | 'touch';

export function intersectsScroll(
  a: DOMRect,
  b: DOMRect,
  // TODO
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  mode: Intersection = 'touch',
  container: HTMLElement
): boolean {
  const containerRect = container.getBoundingClientRect();
  const scrollLeft = container.scrollLeft;
  const scrollTop = container.scrollTop;

  // 198 is container to left
  return (
    a.right >= b.left - containerRect.left &&
    a.left + containerRect.left <= b.right + scrollLeft &&
    // 94 is container to top
    a.bottom - scrollTop >= b.top - containerRect.top &&
    a.top <= b.bottom - containerRect.top + scrollTop
  );
}
