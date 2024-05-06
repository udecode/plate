import { getVShapes } from './getVShapes';

const normalizeSpid = (spid: string): string => {
  const id = spid.split('_')[2];

  return id;
};

export const getVShapeSpid = (
  document: Document,
  element: Element
): null | string => {
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
      element.parentElement?.parentElement?.innerHTML.includes('msEquation')
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
