import {
  type Descendant,
  NodeApi,
  type Path,
  type Point,
  type Range,
  type RootKey,
  type Node as PliteNode,
} from '../..';
import { createDOMGeometryKernel } from '../../dom/internal';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import { rootPlitePoint } from '../view-boundary-graph';
import {
  getPointAtCoordinates,
  hasUsableRect,
  resolveUsableRangeRect,
} from './content-root-coordinate-navigation';
import type { ContentRootNavigationDirection } from './content-root-navigation-actions';
import {
  type EditableDOMRuntime,
  getMountedEditableDOMRuntime,
} from './editable-dom-runtime';

const VISUAL_LINE_TOLERANCE = 2;

const rootedRange = (point: Point, root: RootKey): Range => {
  const rooted = rootPlitePoint(point, root);

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
  const node = editor.read(
    (state) => state.nodes.get(path)?.[0] as Descendant | undefined
  );

  return node ? editor.api.dom.resolveDOMNode(node as PliteNode) : null;
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

  const geometryRoot =
    editor.api.dom.root() ?? editor.api.dom.resolveDOMNode(editor);
  const lineRects = geometryRoot
    ? createDOMGeometryKernel({
        root: geometryRoot,
        target: container,
      }).visualLines(container)
    : [];

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
  direction,
  askExternalViews = true,
  fallbackPoint,
  preferredX,
  source,
  targetEditor,
  targetRoot,
  targetRuntime = getMountedEditableDOMRuntime(targetEditor),
}: {
  askExternalViews?: boolean;
  direction: ContentRootNavigationDirection;
  fallbackPoint: Point;
  targetEditor: ReactRuntimeEditor;
  targetRuntime?: EditableDOMRuntime | null;
  targetRoot: RootKey;
} & (
  | {
      preferredX?: number;
      source: { editor: ReactRuntimeEditor; point: Point; root: RootKey };
    }
  | { preferredX: number; source?: undefined }
)): Point | null => {
  const sourceRect = source
    ? resolveUsableRangeRect(
        source.editor,
        rootedRange(source.point, source.root)
      )
    : null;
  const goalX = hasUsableRect(sourceRect)
    ? (preferredX ?? sourceRect.left)
    : source
      ? undefined
      : preferredX;

  if (goalX === undefined) return null;

  const externalText = targetRuntime?.externalText;
  const rootedFallback = rootPlitePoint(fallbackPoint, targetRoot);
  const external = askExternalViews
    ? externalText?.verticalEntryPoint(
        rootedFallback,
        direction === 'forward' ? 'start' : 'end',
        goalX
      )
    : externalText?.externalEntryPoint(rootedFallback);

  if (external) return external;

  const fallbackRect = resolveUsableRangeRect(
    targetEditor,
    rootedRange(fallbackPoint, targetRoot)
  );
  const targetElement = targetEditor.api.dom.resolveDOMNode(targetEditor);

  if (!targetElement) return null;
  if (!source && !hasUsableRect(fallbackRect)) return fallbackPoint;

  const targetRect = targetElement.getBoundingClientRect();
  const x = clamp(goalX, targetRect.left + 1, targetRect.right - 1);
  const yRect = hasUsableRect(fallbackRect) ? fallbackRect : targetRect;
  const y =
    direction === 'forward'
      ? yRect.top + Math.min(Math.max(yRect.height / 2, 1), 4)
      : yRect.bottom - Math.min(Math.max(yRect.height / 2, 1), 4);
  const targetPoint = getPointAtCoordinates(targetEditor, x, y, {
    root: targetElement,
  });

  if (!targetPoint) {
    const emptyFallback = targetEditor.read((state) => {
      const node = state.nodes.get(fallbackPoint.path)?.[0];

      return !!node && NodeApi.isText(node) && node.text.length === 0;
    });

    return emptyFallback ? fallbackPoint : null;
  }

  if ((targetPoint.root ?? targetRoot) !== targetRoot) {
    return null;
  }

  return targetPoint;
};
