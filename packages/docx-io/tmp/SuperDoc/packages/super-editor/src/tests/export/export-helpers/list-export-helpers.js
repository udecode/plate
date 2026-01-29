import { getTextFromNode } from './index';

/**
 * A type definition for the parameters of the testListNodes function.
 *
 * @typedef {Object} TestListNodesParams
 * @property {Object} node - The node object to be tested
 * @property {number} expectedLevel - The expected level of the node
 * @property {number} expectedNumPr - The expected numPr id of the node
 * @property {string} text - The expected text content of the node
 */

/**
 * Test a list node for its level, numPr and text
 *
 * @param {TestListNodesParams} params - The parameters for the test
 * @returns {void}
 */
export const testListNodes = ({ node, expectedLevel, expectedNumPr, text }) => {
  const numPr = getListAttrFromNumPr('w:ilvl', node);
  expect(numPr).toBe(expectedLevel);

  const ilvl = getListAttrFromNumPr('w:ilvl', node);
  expect(ilvl).toBe(expectedNumPr);

  if (text) {
    const nodeText = getTextFromNode(node);
    expect(nodeText).toBe(text);
  }
};

/**
 * Get the value of a specific attribute from a w:numPr node
 * ie: w:ilvl or w:numId
 *
 * @param {string} attrName The name of the attribute to get
 * @param {Object} node The node to search for the attribute
 * @returns {string} The value of the attribute
 */
export const getListAttrFromNumPr = (attrName, node) => {
  const pPr = node.elements.find((el) => el.name === 'w:pPr');
  const numPr = pPr.elements.find((el) => el.name === 'w:numPr');
  const givenNode = numPr?.elements?.find((el) => el.name === attrName);
  return givenNode?.attributes['w:val'];
};
