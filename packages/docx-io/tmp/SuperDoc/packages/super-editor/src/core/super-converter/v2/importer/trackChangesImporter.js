import { TrackDeleteMarkName, TrackInsertMarkName } from '@extensions/track-changes/constants.js';
import { parseProperties } from './importerHelpers.js';

/**
 * @type {import("docxImporter").NodeHandler}
 */
export const handleTrackChangeNode = (params) => {
  const { nodes, nodeListHandler } = params;
  if (nodes.length === 0 || !(nodes[0].name === 'w:del' || nodes[0].name === 'w:ins' || nodes[0].name === 'w:sdt')) {
    return { nodes: [], consumed: 0 };
  }

  const mainNode = nodes[0];
  let node;

  if (['w:ins', 'w:del'].includes(mainNode.name)) {
    node = mainNode;
  } else {
    const sdtContent = mainNode.elements.find((el) => el.name === 'w:sdtContent');
    const trackedChange = sdtContent?.elements.find((el) => ['w:ins', 'w:del'].includes(el.name));
    if (trackedChange) node = trackedChange;
  }

  if (!node) {
    return { nodes: [], consumed: 0 };
  }

  const { name } = node;
  const { attributes, elements } = parseProperties(node);

  const subs = nodeListHandler.handler({ ...params, insideTrackChange: true, nodes: elements });
  const changeType = name === 'w:del' ? TrackDeleteMarkName : TrackInsertMarkName;

  const mappedAttributes = {
    id: attributes['w:id'],
    date: attributes['w:date'],
    author: attributes['w:author'],
    authorEmail: attributes['w:authorEmail'],
  };

  subs.forEach((subElement) => {
    if (subElement.marks === undefined) subElement.marks = [];
    subElement.marks.push({ type: changeType, attrs: mappedAttributes });
  });

  return { nodes: subs, consumed: 1 };
};

/**
 * @type {import("docxImporter").NodeHandlerEntry}
 */
export const trackChangeNodeHandlerEntity = {
  handlerName: 'trackChangeNodeHandler',
  handler: handleTrackChangeNode,
};
