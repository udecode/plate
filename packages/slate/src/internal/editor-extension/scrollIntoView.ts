import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed';

import type { Editor } from '../../interfaces/editor';
import type { ScrollIntoViewOptions } from '../../interfaces/scroll';
import type { DOMRange } from '../../slate-dom';

import { type Point, PointApi } from '../../interfaces/point';

const defaultOptions: ScrollIntoViewOptions = {
  scrollMode: 'if-needed',
};

// TODO: move to slate
export function scrollIntoView(
  editor: Editor,
  target: DOMRange | Point,
  options: ScrollIntoViewOptions = defaultOptions
): void {
  requestAnimationFrame(() => {
    let domRange: DOMRange | undefined;

    if (PointApi.isPoint(target)) {
      const { offset = 0, path } = target;

      domRange = editor.api.toDOMRange({
        anchor: { offset, path },
        focus: { offset, path },
      });
    } else {
      domRange = target;
    }

    if (!domRange) return;

    const leafEl = domRange.startContainer.parentElement!;

    leafEl.getBoundingClientRect =
      domRange.getBoundingClientRect.bind(domRange);
    scrollIntoViewIfNeeded(leafEl, options);

    setTimeout(() => delete (leafEl as any).getBoundingClientRect, 0);
  });
}
