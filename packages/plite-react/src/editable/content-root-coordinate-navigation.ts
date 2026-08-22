import type { Point, Range } from '@platejs/plite';
import {
  createDOMGeometryKernel,
  hasUsableDOMRect,
} from '@platejs/plite-dom/internal';

import type { ReactRuntimeEditor } from '../plugin/react-editor';

export const hasUsableRect = (rect: DOMRect | null): rect is DOMRect =>
  !!rect && hasUsableDOMRect(rect);

const getGeometryRoot = (editor: ReactRuntimeEditor) =>
  editor.api.dom.root() ?? editor.api.dom.resolveDOMNode(editor);

export const resolveUsableRangeRect = (
  editor: ReactRuntimeEditor,
  range: Range
): DOMRect | null => {
  const root = getGeometryRoot(editor);

  if (!root) return null;

  const { affinity } = range as Range & { affinity?: 'backward' | 'forward' };

  return createDOMGeometryKernel({ root }).rangeRect(
    editor.api.dom.resolveDOMRange(range),
    {
      association: affinity === 'forward' ? 'forward' : 'backward',
      fallbackPoint: editor.api.dom.resolveDOMPoint(range.anchor),
    }
  );
};

export const getPointAtCoordinates = (
  editor: ReactRuntimeEditor,
  x: number,
  y: number,
  options: { root?: HTMLElement | null; target?: Element | null } = {}
): Point | null => {
  const root = options.root ?? getGeometryRoot(editor);

  if (!root) return null;

  const result = createDOMGeometryKernel({
    root,
    target: options.target,
  }).pointAtCoordinates({ x, y });

  return result
    ? editor.api.dom.resolvePlitePoint([...result.point], {
        exactMatch: false,
      })
    : null;
};
