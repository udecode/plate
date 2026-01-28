import { handleStyleChangeMarks, parseMarks } from './markImporter.js';
import { SuperConverter } from '../../SuperConverter.js';

/**
 *
 * @param {XmlNode} node
 * @returns {{elements: *, attributes: {}, marks: *}}
 *
 */
export function parseProperties(node) {
  /**
   * What does it mean for a node to have a properties element?
   * It would have a child element that is: w:pPr, w:rPr, w:sectPr
   */
  const marks = [];
  const unknownMarks = [];
  const { attributes = {}, elements = [] } = node;
  const { nodes, paragraphProperties = {}, runProperties = {} } = splitElementsAndProperties(elements);
  const hasRun = elements.find((element) => element.name === 'w:r');

  if (hasRun) paragraphProperties.elements = paragraphProperties?.elements?.filter((el) => el.name !== 'w:rPr');

  // Get the marks from the run properties
  if (runProperties && runProperties?.elements?.length) {
    marks.push(...parseMarks(runProperties, unknownMarks));
  }

  if (paragraphProperties && paragraphProperties.elements?.length) {
    marks.push(...parseMarks(paragraphProperties, unknownMarks));
  }
  //add style change marks
  marks.push(...handleStyleChangeMarks(runProperties, marks));

  // Maintain any extra properties
  if (paragraphProperties && paragraphProperties.elements?.length) {
    attributes['paragraphProperties'] = paragraphProperties;
  }

  // If this is a paragraph, don't apply marks but apply attributes directly
  if (marks && node.name === 'w:p') {
    marks.forEach((mark) => {
      const attrValue = Object.keys(mark.attrs ?? {})[0];
      if (attrValue) {
        const value = mark.attrs[attrValue];
        attributes[attrValue] = value;
      }
    });
  }

  return { elements: nodes, attributes, marks, unknownMarks };
}

/**
 *
 * @param {XmlNode[]} elements
 * @returns {{nodes: *, runProperties: *, sectionProperties: *, paragraphProperties: *}}
 */
function splitElementsAndProperties(elements) {
  const pPr = elements.find((el) => el.name === 'w:pPr');
  const rPr = elements.find((el) => el.name === 'w:rPr');
  const sectPr = elements.find((el) => el.name === 'w:sectPr');
  const els = elements.filter((el) => el.name !== 'w:pPr' && el.name !== 'w:rPr' && el.name !== 'w:sectPr');

  return {
    nodes: els,
    paragraphProperties: pPr,
    runProperties: rPr,
    sectionProperties: sectPr,
  };
}

/**
 *
 * @param {XmlNode} element
 * @returns {*}
 */
export function getElementName(element) {
  return SuperConverter.allowedElements[element.name || element.type];
}

export const isPropertiesElement = (element) => {
  return !!SuperConverter.propertyTypes[element.name || element.type];
};

/**
 *
 * @param {XmlNode[]} elements
 * @returns {*}
 */
export function hasTextNode(elements) {
  const runs = elements.filter((el) => el.name === 'w:r');
  const runsHaveText = runs.some((run) => run.elements.some((el) => el.name === 'w:t'));
  return runsHaveText;
}
