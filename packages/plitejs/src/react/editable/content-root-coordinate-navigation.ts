import type { Point, Range } from '../..';
import { createDOMGeometryKernel, hasUsableDOMRect } from '../../dom/internal';
import {
  resolveDOMPointInRoot,
  resolveDOMRangeInRoot,
} from '../../dom/plugin/dom-editor';
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
    resolveDOMRangeInRoot(editor, range),
    {
      association: affinity === 'forward' ? 'forward' : 'backward',
      fallbackPoint: resolveDOMPointInRoot(editor, range.anchor),
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
    ? editor.api.dom.resolvePoint([...result.point], {
        exactMatch: false,
      })
    : null;
};
