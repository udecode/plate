import { handleDocPartObj } from './docPartObjImporter';
import { parseMarks } from './markImporter.js';
import { generateDocxRandomId } from '../../../helpers/index.js';

/**
 * @type {import("docxImporter").NodeHandler}
 */
export const handleAnnotationNode = (params) => {
  const { nodes, docx, nodeListHandler, insideTrackChange } = params;
  if (nodes.length === 0 || nodes[0].name !== 'w:sdt') {
    return { nodes: [], consumed: 0 };
  }

  const node = nodes[0];
  const sdtPr = node.elements.find((el) => el.name === 'w:sdtPr');
  const sdtContent = node.elements.find((el) => el.name === 'w:sdtContent');
  const docPartObj = sdtPr?.elements.find((el) => el.name === 'w:docPartObj');

  if (docPartObj) {
    return handleDocPartObj({ nodes, docx, nodeListHandler, insideTrackChange });
  }

  const alias = sdtPr?.elements.find((el) => el.name === 'w:alias');
  const tag = sdtPr?.elements.find((el) => el.name === 'w:tag');
  const tagValue = tag?.attributes['w:val'];
  const processAsJSON = tagValue?.startsWith('{') && tagValue?.endsWith('}');

  let attrs = {};

  if (processAsJSON) {
    const parsedAttrs = parseTagAttrsJSON(tagValue);
    const attrsFromJSON = {
      type: parsedAttrs.fieldTypeShort,
      fieldId: parsedAttrs.fieldId,
      displayLabel: parsedAttrs.displayLabel,
      defaultDisplayLabel: parsedAttrs.defaultDisplayLabel,
      fieldType: parsedAttrs.fieldType,
      fieldColor: parsedAttrs.fieldColor,
      multipleImage: parsedAttrs.fieldMultipleImage,
      fontFamily: parsedAttrs.fieldFontFamily,
      fontSize: parsedAttrs.fieldFontSize,
      textColor: parsedAttrs.fieldTextColor,
      textHighlight: parsedAttrs.fieldTextHighlight,
      hash: parsedAttrs.hash,
    };
    attrs = attrsFromJSON;
  } else {
    // IMPORTANT: FOR BACKWARD COMPATIBILITY.
    const attrsFromElements = getAttrsFromElements({ sdtPr, tag, alias });
    attrs = attrsFromElements;
  }

  const { attrs: marksAsAttrs, marks } = parseAnnotationMarks(sdtContent);
  const allAttrs = { ...attrs, ...marksAsAttrs };
  if (!allAttrs.hash) allAttrs.hash = generateDocxRandomId(4);

  // Some w:sdt nodes have attrs.fieldId (coming from GoogleDocs) so we need a secondary check
  // Expecting `type` if its a field annotation
  if (!attrs.fieldId || !attrs.type) {
    return { nodes: [], consumed: 0 };
  }

  let result = {
    type: 'text',
    text: `{{${attrs.displayLabel}}}`,
    attrs: allAttrs,
    marks,
  };

  if (params.editor.options.annotations) {
    result = {
      type: 'fieldAnnotation',
      attrs: allAttrs,
    };
  }

  return {
    nodes: [result],
    consumed: 1,
  };
};

/**
 * Marks for annotations need to be converted to attributes
 * @param {Object} content The sdtContent node
 * @returns {Object} The attributes object
 */
export const parseAnnotationMarks = (content = {}) => {
  let mainContent = content;

  /// if (type === 'html') {
  /// Note: html annotation has a different structure and can include
  /// several paragraphs with different styles. We could find the first paragraph
  /// and take the marks from there, but we take fontFamily and fontSize from the annotation attributes.

  /// Example:
  /// const firstPar = content.elements?.find((el) => el.name === 'w:p');
  /// if (firstPar) mainContent = firstPar;
  // }

  const run = mainContent.elements?.find((el) => el.name === 'w:r');
  const rPr = run?.elements?.find((el) => el.name === 'w:rPr');
  if (!rPr) return {};

  // TODO: Telemetry
  const unknownMarks = [];
  const marks = parseMarks(rPr, unknownMarks) || [];

  const marksWithFlatFontStyles = [];
  marks.forEach((mark) => {
    const { type } = mark;
    if (type === 'textStyle') {
      const { attrs } = mark;
      Object.keys(attrs).forEach((key) => {
        marksWithFlatFontStyles.push({ type: key, attrs: attrs[key] });
      });
    } else {
      marksWithFlatFontStyles.push(mark);
    }
  });

  const attrs = {};
  marksWithFlatFontStyles?.forEach((mark) => {
    const { type } = mark;
    attrs[type] = mark.attrs || true;
  });
  return {
    attrs,
    marks,
  };
};

function getAttrsFromElements({ sdtPr, tag, alias }) {
  const type = sdtPr?.elements.find((el) => el.name === 'w:fieldTypeShort')?.attributes['w:val'];
  const fieldType = sdtPr?.elements.find((el) => el.name === 'w:fieldType')?.attributes['w:val'];
  const fieldColor = sdtPr?.elements.find((el) => el.name === 'w:fieldColor')?.attributes['w:val'];
  const isMultipleImage = sdtPr?.elements.find((el) => el.name === 'w:fieldMultipleImage')?.attributes['w:val'];
  const fontFamily = sdtPr?.elements.find((el) => el.name === 'w:fieldFontFamily')?.attributes['w:val'];
  const fontSize = sdtPr?.elements.find((el) => el.name === 'w:fieldFontSize')?.attributes['w:val'];
  const textColor = sdtPr?.elements.find((el) => el.name === 'w:fieldTextColor')?.attributes['w:val'];
  const textHighlight = sdtPr?.elements.find((el) => el.name === 'w:fieldTextHighlight')?.attributes['w:val'];
  const attrs = {
    type,
    fieldId: tag?.attributes['w:val'],
    displayLabel: alias?.attributes['w:val'],
    fieldType,
    fieldColor,
    multipleImage: isMultipleImage === 'true',
    fontFamily: fontFamily !== 'null' ? fontFamily : null,
    fontSize: fontSize !== 'null' ? fontSize : null,
    textColor: textColor !== 'null' ? textColor : null,
    textHighlight: textHighlight !== 'null' ? textHighlight : null,
  };
  return attrs;
}

function parseTagAttrsJSON(json) {
  try {
    const attrs = JSON.parse(json);
    return attrs;
  } catch (err) {
    console.error(err);
    return {};
  }
}

/**
 * @type {import("docxImporter").NodeHandlerEntry}
 */
export const annotationNodeHandlerEntity = {
  handlerName: 'annotationNodeHandler',
  handler: handleAnnotationNode,
};
