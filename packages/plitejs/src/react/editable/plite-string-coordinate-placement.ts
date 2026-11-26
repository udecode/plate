import { type Range, TextApi } from '../..';
import {
  createDOMGeometryKernel,
  getPliteStringDocumentOffset,
  getPliteStringEdgeOffset,
  getPliteStringPlacementDOMPoint as resolvePliteStringPlacementDOMPoint,
  type PliteStringCoordinatePlacement,
} from '../../dom/internal';
import { isDOMHTMLElement } from '../../dom/utils/dom';
import { getPliteNodePathFromDOMElement } from '../hooks/use-plite-node-ref';
import type { ReactRuntimeEditor } from '../plugin/react-editor';

export {
  getPliteStringCoordinatePlacement,
  getPliteStringDocumentOffset,
  getPliteStringEdgeOffset,
  type PliteStringCoordinatePlacement,
} from '../../dom/internal';

export type PliteStringPlacementDOMPoint = {
  node: globalThis.Node;
  offset: number;
};

export const getPliteStringPlacementDOMPoint = (
  placement: NonNullable<PliteStringCoordinatePlacement>
): PliteStringPlacementDOMPoint | null => {
  const point = resolvePliteStringPlacementDOMPoint(placement);

  return point ? { node: point[0], offset: point[1] } : null;
};

export const getEditableRootPliteStringCoordinatePlacement = ({
  editableRoot,
  event,
  includeInsideString = false,
  target,
}: {
  editableRoot: HTMLElement;
  event: Pick<MouseEvent, 'clientX' | 'clientY'>;
  includeInsideString?: boolean;
  target?: Element | null;
}): PliteStringCoordinatePlacement =>
  createDOMGeometryKernel({ root: editableRoot, target }).coordinatePlacement({
    includeInsideString,
    x: event.clientX,
    y: event.clientY,
  });

export const resolvePliteStringPlacementRange = ({
  editor,
  placement,
}: {
  editor: ReactRuntimeEditor;
  placement: NonNullable<PliteStringCoordinatePlacement>;
}): Range | null => {
  const textHost = placement.string.closest('[data-editor-node="text"]');
  const htmlTextHost = isDOMHTMLElement(textHost) ? textHost : null;
  const path = htmlTextHost
    ? getPliteNodePathFromDOMElement(htmlTextHost)
    : null;
  const offset = htmlTextHost
    ? placement.offset == null
      ? getPliteStringEdgeOffset({
          edge: placement.edge,
          rect: placement.rect,
          string: placement.string,
          textHost: htmlTextHost,
        })
      : getPliteStringDocumentOffset({
          offset: placement.offset,
          string: placement.string,
          textHost: htmlTextHost,
        })
    : null;

  if (!path || offset == null) {
    return null;
  }

  const node = editor.read((state) => state.nodes.get(path)?.[0]) ?? null;

  if (!node) {
    return null;
  }

  const safeOffset = TextApi.isText(node)
    ? Math.max(0, Math.min(offset, node.text.length))
    : offset;
  const point = { path, offset: safeOffset };

  return {
    anchor: point,
    focus: point,
  };
};
