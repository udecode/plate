import { tableOfContentsHandler } from './docPartGalleryImporter.js';

export const handleDocPartObj = (params) => {
  const { nodes } = params;
  if (nodes.length === 0 || nodes[0].name !== 'w:sdt') {
    return { nodes: [], consumed: 0 };
  }

  const node = nodes[0];
  const sdtPr = node.elements.find((el) => el.name === 'w:sdtPr');
  const docPartObj = sdtPr?.elements.find((el) => el.name === 'w:docPartObj');
  const docPartGallery = docPartObj?.elements.find((el) => el.name === 'w:docPartGallery');
  const docPartGalleryType = docPartGallery?.attributes['w:val'];

  if (!docPartGalleryType) {
    return { nodes: [], consumed: 0 };
  }

  if (!validGalleryTypeMap[docPartGalleryType]) {
    // TODO: Handle catching unkown gallery types
    return { nodes: [], consumed: 0 };
  }

  const content = node?.elements.find((el) => el.name === 'w:sdtContent');
  const handler = validGalleryTypeMap[docPartGalleryType];
  const result = handler({ ...params, nodes: [content] });

  return {
    nodes: result,
    consumed: 1,
  };
};

const validGalleryTypeMap = {
  'Table of Contents': tableOfContentsHandler,
};
