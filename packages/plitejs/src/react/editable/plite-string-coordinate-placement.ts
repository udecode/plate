import {
  createDOMGeometryKernel,
  getPliteStringPlacementDOMPoint as resolvePliteStringPlacementDOMPoint,
  type PliteStringCoordinatePlacement,
} from '../../dom/internal';

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
