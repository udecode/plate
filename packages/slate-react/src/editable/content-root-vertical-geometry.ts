import {
  type Descendant,
  NodeApi,
  type Path,
  type Point,
  type Range,
  type RootKey,
  type Node as SlateNode,
} from '@platejs/slate';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { rootSlatePoint } from '../view-boundary-graph';
import {
  getPointAtCoordinates,
  hasUsableRect,
  resolveUsableRangeRect,
} from './content-root-coordinate-navigation';
import type { ContentRootNavigationDirection } from './content-root-navigation-actions';

const VISUAL_LINE_TOLERANCE = 2;

const rootedRange = (point: Point, root: RootKey): Range => {
  const rooted = rootSlatePoint(point, root);

  return {
    anchor: rooted,
    focus: rooted,
  };
};

export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const getPathElement = (
  editor: ReactRuntimeEditor,
  path: Path
): HTMLElement | null => {
  const node = editor.read((state) => {
    try {
      return state.nodes.get(path)[0] as Descendant;
    } catch {
      return null;
    }
  });

  return node ? editor.api.dom.resolveDOMNode(node as SlateNode) : null;
};

const getSlateLineRects = (element: HTMLElement): DOMRect[] => {
  const rects: DOMRect[] = [];
  const strings = Array.from(
    element.querySelectorAll('[data-slate-string], [data-slate-zero-width]')
  );

  for (const string of strings) {
    const clientRects = Array.from(string.getClientRects()).filter(
      hasUsableRect
    );

    if (clientRects.length > 0) {
      rects.push(...clientRects);
      continue;
    }

    const rect = string.getBoundingClientRect();

    if (hasUsableRect(rect)) {
      rects.push(rect);
    }
  }

  return rects;
};

export const isPointOnVisualBoundaryLine = ({
  container,
  direction,
  editor,
  point,
  root,
}: {
  container: HTMLElement;
  direction: ContentRootNavigationDirection;
  editor: ReactRuntimeEditor;
  point: Point;
  root: RootKey;
}): boolean => {
  const sourceRect = resolveUsableRangeRect(editor, rootedRange(point, root));

  if (!hasUsableRect(sourceRect)) {
    return false;
  }

  const lineRects = getSlateLineRects(container);

  if (lineRects.length === 0) {
    return false;
  }

  if (direction === 'forward') {
    const lastLineTop = Math.max(...lineRects.map((rect) => rect.top));

    return sourceRect.top >= lastLineTop - VISUAL_LINE_TOLERANCE;
  }

  const firstLineBottom = Math.min(...lineRects.map((rect) => rect.bottom));

  return sourceRect.bottom <= firstLineBottom + VISUAL_LINE_TOLERANCE;
};

export const resolveVerticalNavigationPoint = ({
  currentRoot,
  direction,
  fallbackPoint,
  point,
  sourceEditor,
  targetEditor,
  targetRoot,
}: {
  currentRoot: RootKey;
  direction: ContentRootNavigationDirection;
  fallbackPoint: Point;
  point: Point;
  sourceEditor: ReactRuntimeEditor;
  targetEditor: ReactRuntimeEditor;
  targetRoot: RootKey;
}): Point | null => {
  const sourceRect = resolveUsableRangeRect(
    sourceEditor,
    rootedRange(point, currentRoot)
  );
  const fallbackRect = resolveUsableRangeRect(
    targetEditor,
    rootedRange(fallbackPoint, targetRoot)
  );
  const targetElement = targetEditor.api.dom.resolveDOMNode(targetEditor);

  if (!hasUsableRect(sourceRect) || !targetElement) {
    return null;
  }

  const targetRect = targetElement.getBoundingClientRect();
  const x = clamp(sourceRect.left, targetRect.left + 1, targetRect.right - 1);
  const yRect = hasUsableRect(fallbackRect) ? fallbackRect : targetRect;
  const y =
    direction === 'forward'
      ? yRect.top + Math.min(Math.max(yRect.height / 2, 1), 4)
      : yRect.bottom - Math.min(Math.max(yRect.height / 2, 1), 4);
  const targetPoint = getPointAtCoordinates(targetEditor, x, y);

  if (!targetPoint) {
    const emptyFallback = targetEditor.read((state) => {
      const [node] = state.nodes.get(fallbackPoint.path);

      return NodeApi.isText(node) && node.text.length === 0;
    });

    return emptyFallback ? fallbackPoint : null;
  }

  if ((targetPoint.root ?? targetRoot) !== targetRoot) {
    return null;
  }

  return targetPoint;
};
