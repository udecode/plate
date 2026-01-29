import { parseProperties } from './importerHelpers.js';
import { createImportMarks } from './markImporter.js';

/**
 * @type {import("docxImporter").NodeHandler}
 */
export const handleRunNode = (params) => {
  const { nodes, nodeListHandler, parentStyleId, docx } = params;
  if (nodes.length === 0 || nodes[0].name !== 'w:r') {
    return { nodes: [], consumed: 0 };
  }
  const node = nodes[0];

  const childParams = { ...params, nodes: node.elements };
  let processedRun = nodeListHandler.handler(childParams)?.filter((n) => n) || [];
  const hasRunProperties = node.elements?.some((el) => el.name === 'w:rPr');
  const defaultNodeStyles = getMarksFromStyles(docx, parentStyleId);

  if (hasRunProperties) {
    const { marks = [] } = parseProperties(node);

    /* Store run style attributes in an array, then store the defaultNodeStyles (parent styles) in a second array
    Then combine the two arrays and create a new array of marks, where the 
    run style attributes override the defaultNodeStyles

    */
    // Collect run style attributes
    let runStyleAttributes = [];
    const runStyleElement = node.elements
      ?.find((el) => el.name === 'w:rPr')
      ?.elements?.find((el) => el.name === 'w:rStyle');
    let runStyleId;
    if (runStyleElement && runStyleElement.attributes?.['w:val'] && docx) {
      runStyleId = runStyleElement.attributes['w:val'];
      const runStyleDefinition = getMarksFromStyles(docx, runStyleId);
      if (runStyleDefinition.marks && runStyleDefinition.marks.length > 0) {
        runStyleAttributes = runStyleDefinition.marks;
      }
    }

    // Collect paragraph style attributes
    let paragraphStyleAttributes = [];
    if (defaultNodeStyles.marks) {
      // Filter out bold if it's disabled
      paragraphStyleAttributes = defaultNodeStyles.marks.filter((mark) => {
        if (['bold'].includes(mark.type) && marks.find((m) => m.type === 'bold')?.attrs?.value === '0') {
          return false;
        }
        return true;
      });
    }

    // Combine with correct precedence: paragraph styles first, then run styles (which override)
    const combinedMarks = [...paragraphStyleAttributes];

    // Add run style attributes if they don't already exist
    runStyleAttributes.forEach((runStyle) => {
      const exists = combinedMarks.some(
        (mark) =>
          mark.type === runStyle.type && JSON.stringify(mark.attrs || {}) === JSON.stringify(runStyle.attrs || {}),
      );
      if (!exists) {
        combinedMarks.push(runStyle);
      }
    });

    // Add direct marks if they don't already exist
    marks.forEach((mark) => {
      const exists = combinedMarks.some(
        (existing) =>
          existing.type === mark.type && JSON.stringify(existing.attrs || {}) === JSON.stringify(mark.attrs || {}),
      );
      if (!exists) {
        combinedMarks.push(mark);
      }
    });
    // Attach the originating run style id so the span gets styleid like paragraph nodes
    if (runStyleId) combinedMarks.push({ type: 'textStyle', attrs: { styleId: runStyleId } });

    if (node.marks) combinedMarks.push(...node.marks);
    const newMarks = createImportMarks(combinedMarks);
    processedRun = processedRun.map((n) => {
      const existingMarks = n.marks || [];
      return {
        ...n,
        marks: [...newMarks, ...existingMarks],
      };
    });
  }
  return { nodes: processedRun, consumed: 1 };
};

const getMarksFromStyles = (docx, styleId) => {
  const styles = docx?.['word/styles.xml'];
  if (!styles) {
    return {};
  }

  const styleTags = styles.elements[0].elements.filter((style) => style.name === 'w:style');
  const style = styleTags.find((tag) => tag.attributes['w:styleId'] === styleId) || {};

  if (!style) return {};

  return parseProperties(style);
};

/**
 * @type {import("docxImporter").NodeHandlerEntry}
 */
export const runNodeHandlerEntity = {
  handlerName: 'runNodeHandler',
  handler: handleRunNode,
};
