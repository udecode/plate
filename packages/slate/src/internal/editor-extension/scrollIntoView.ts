import scrollIntoViewIfNeeded from 'scroll-into-view-if-needed';

import type { Editor } from '../../interfaces/editor';
import { type Point, PointApi } from '../../interfaces/point';
import type { ScrollIntoViewOptions } from '../../interfaces/scroll';
import type { DOMRange } from '../../slate-dom';

const defaultOptions: ScrollIntoViewOptions = {
  scrollMode: 'if-needed',
};

const getScrollBoundary = (editor: Editor) => {
  const store = (editor as any).store;

  if (!store?.get) return;

  return store.get('scrollRef')?.current ?? store.get('containerRef')?.current;
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
    const boundary = getScrollBoundary(editor);
    const resolvedOptions =
      typeof options === 'object' && options
        ? {
            ...options,
            boundary: options.boundary ?? boundary,
          }
        : options;

    leafEl.getBoundingClientRect =
      domRange.getBoundingClientRect.bind(domRange);
    scrollIntoViewIfNeeded(leafEl, resolvedOptions);

    setTimeout(() => {
      (leafEl as any).getBoundingClientRect = undefined;
    }, 0);
  });
}
