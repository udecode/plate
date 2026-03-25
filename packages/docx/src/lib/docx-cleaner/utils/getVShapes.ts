import { getHtmlComments } from 'platejs';

const V_SHAPE_OPEN_TAG = /<v:shape\b[^>]*>/gi;
const V_SHAPE_ID = /\bid="([^"]+)"/i;
const V_SHAPE_SPID = /\bo:spid="([^"]+)"/i;

export const getVShapes = (document: Document): Record<string, string> => {
  const comments = getHtmlComments(document);

  return comments.reduce<Record<string, string>>((vShapesMap, comment) => {
    for (const shapeTag of comment.match(V_SHAPE_OPEN_TAG) ?? []) {
      const id = V_SHAPE_ID.exec(shapeTag)?.[1];
      const spid = V_SHAPE_SPID.exec(shapeTag)?.[1];

      if (id && spid) {
        vShapesMap[id] = spid;
      }
    }

    return vShapesMap;
  }, {});
};
