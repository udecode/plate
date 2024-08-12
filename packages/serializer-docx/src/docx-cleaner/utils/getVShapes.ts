import { getHtmlComments } from '@udecode/plate-common';

export const getVShapes = (document: Document): Record<string, string> => {
  const comments = getHtmlComments(document);

  return comments.reduce<Record<string, string>>((vShapesMap, comment) => {
    try {
      const xmlDocument = new DOMParser().parseFromString(comment, 'text/html');
      const vShapes = Array.from(xmlDocument.querySelectorAll('V:SHAPE'));

      vShapes.forEach((vShape) => {
        const { id } = vShape;
        const spid = vShape.getAttribute('o:spid');

        if (typeof id === 'string' && typeof spid === 'string') {
          vShapesMap[id] = spid;
        }
      });
    } catch (error) {
      // Cannot parse as XML, we're not interested in this comment
    }

    return vShapesMap;
  }, {});
};
