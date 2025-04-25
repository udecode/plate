import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed';

import type { Editor } from '../../interfaces/editor';
import type { Point } from '../../interfaces/point';
import type { ScrollIntoViewOptions } from '../../interfaces/scroll';

// the options for scrollIntoViewIfNeeded

export function scrollIntoView(
  editor: Editor,
  target: Point,
  options?: ScrollIntoViewOptions
): void {
  requestAnimationFrame(() => {
    const { offset = 0, path } = target;

    const domRange = editor.api.toDOMRange({
      anchor: { offset, path },
      focus: { offset, path },
    })!;

    if (!domRange) return;

    const leafEl = domRange.startContainer.parentElement!;

    leafEl.getBoundingClientRect =
      domRange.getBoundingClientRect.bind(domRange);
    scrollIntoViewIfNeeded(leafEl, options);

    setTimeout(() => delete (leafEl as any).getBoundingClientRect, 0);
  });
}
