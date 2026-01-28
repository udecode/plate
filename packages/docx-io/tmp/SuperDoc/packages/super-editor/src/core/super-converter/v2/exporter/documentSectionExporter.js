import { translateChildNodes } from './helpers/translateChildNodes.js';

/**
 * Translate a structured content block node to its XML representation.
 * @param {Object} params - The parameters for translation.
 * @returns {Object} The XML representation of the structured content block.
 */
export const translateDocumentSection = (params) => {
  const { node } = params;
  const { attrs = {} } = node;

  const childContent = translateChildNodes({ ...params, nodes: node.content });

  // We build the sdt node elements here, and re-add passthrough sdtPr node
  const nodeElements = [
    {
      name: 'w:sdtContent',
      elements: childContent,
    },
  ];

  const exportedTag = JSON.stringify({
    type: 'documentSection',
    description: attrs.description,
  });

  const sdtPr = generateSdtPrTagForDocumentSection(attrs.id, attrs.title, exportedTag);

  // If the section is locked, we add the lock tag
  const { isLocked } = attrs;
  if (isLocked) {
    sdtPr.elements.push({
      name: 'w:lock',
      attributes: {
        'w:val': 'sdtContentLocked',
      },
    });
  }

  nodeElements.unshift(sdtPr);

  return {
    name: 'w:sdt',
    elements: nodeElements,
  };
};

/**
 * Generate the sdtPr tag for a document section.
 * @param {string} id - The unique identifier for the section.
 * @param {string} title - The title of the section.
 * @param {string} tag - The tag containing section metadata.
 * @returns {Object} The sdtPr tag object.
 */
const generateSdtPrTagForDocumentSection = (id, title, tag) => {
  return {
    name: 'w:sdtPr',
    elements: [
      {
        name: 'w:id',
        attributes: {
          'w:val': id,
        },
      },
      {
        name: 'w:alias',
        attributes: {
          'w:val': title,
        },
      },
      {
        name: 'w:tag',
        attributes: {
          'w:val': tag,
        },
      },
    ],
  };
};
