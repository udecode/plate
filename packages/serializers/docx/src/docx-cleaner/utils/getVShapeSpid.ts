import { getVShapes } from './getVShapes';

const normalizeSpid = (spid: string): string => {
  const [, , id] = spid.split('_');
  return id;
};

export const getVShapeSpid = (
  document: Document,
  element: Element
): string | null => {
  if (element.tagName === 'IMG') {
    const vShapeId = element.getAttribute('v:shapes');
    const vShapes = getVShapes(document);

    if (!vShapeId) {
      return null;
    }

    const vShapeSpid = vShapes[vShapeId];

    if (vShapeSpid) {
      return normalizeSpid(vShapeSpid);
    }

    if (
      element.parentElement &&
      element.parentElement.parentElement &&
      element.parentElement.parentElement.innerHTML.indexOf('msEquation') >= 0
    ) {
      return null;
    }

    return normalizeSpid(vShapeId);
  }

  if (!element.parentElement) {
    return null;
  }

  const spid = element.parentElement.getAttribute('o:spid');

  if (spid) {
    return normalizeSpid(spid);
  }

  return spid;
};
