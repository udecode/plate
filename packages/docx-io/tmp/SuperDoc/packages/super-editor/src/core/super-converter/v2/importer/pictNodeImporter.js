import { handleParagraphNode } from './paragraphNodeImporter.js';
import { defaultNodeListHandler } from './docxImporter.js';
import { twipsToPixels, twipsToLines } from '../../helpers.js';

export const handlePictNode = (params) => {
  const { nodes } = params;

  if (!nodes.length || nodes[0].name !== 'w:p') {
    return { nodes: [], consumed: 0 };
  }

  const [pNode] = nodes;
  const run = pNode.elements?.find((el) => el.name === 'w:r');
  const pict = run?.elements?.find((el) => el.name === 'w:pict');

  // if there is no pict, then process as a paragraph or list.
  if (!pict) {
    return { nodes: [], consumed: 0 };
  }

  const node = pict;
  const shape = node.elements?.find((el) => el.name === 'v:shape');
  const group = node.elements?.find((el) => el.name === 'v:group');
  const rect = node.elements?.find((el) => el.name === 'v:rect');

  // Handle v:rect elements (like horizontal rules)
  if (rect) {
    const result = handleVRectImport({
      pict,
      pNode,
      rect,
      params,
    });
    return { nodes: result ? [result] : [], consumed: 1 };
  }

  // such a case probably shouldn't exist.
  if (!shape && !group) {
    return { nodes: [], consumed: 0 };
  }

  let result = null;

  const isGroup = group && !shape;

  if (isGroup) {
    // there should be a group of shapes being processed here (skip for now).
    result = null;
  } else {
    const textbox = shape.elements?.find((el) => el.name === 'v:textbox');

    // process shapes with textbox.
    if (textbox) {
      result = handleShapTextboxImport({
        pict,
        pNode,
        shape,
        params,
      });
    }
  }

  return { nodes: result ? [result] : [], consumed: 1 };
};

// Handler for v:rect elements
export function handleVRectImport({ rect, pNode }) {
  const schemaAttrs = {};
  const rectAttrs = rect.attributes || {};

  // Store all the attributes you specified
  schemaAttrs.attributes = rectAttrs;

  // Parse style attribute
  if (rectAttrs.style) {
    const parsedStyle = parseInlineStyles(rectAttrs.style);
    const rectStyle = buildVRectStyles(parsedStyle);

    if (rectStyle) {
      schemaAttrs.style = rectStyle;
    }

    // Extract dimensions for the size attribute
    const size = {};
    if (parsedStyle.width !== undefined) {
      const inlineWidth = parsePointsToPixels(parsedStyle.width);
      size.width = inlineWidth;

      // Check for full page width identifier and adjust width to be 100%
      if (rectAttrs['o:hr'] === 't' && !inlineWidth) {
        size.width = '100%';
      }
    }
    if (parsedStyle.height !== undefined) {
      size.height = parsePointsToPixels(parsedStyle.height);
    }
    if (Object.keys(size).length > 0) {
      schemaAttrs.size = size;
    }
  }

  // Handle fillcolor
  if (rectAttrs.fillcolor) {
    schemaAttrs.background = rectAttrs.fillcolor;
  }

  // Store VML-specific attributes
  const vmlAttrs = {};
  if (rectAttrs['o:hralign']) vmlAttrs.hralign = rectAttrs['o:hralign'];
  if (rectAttrs['o:hrstd']) vmlAttrs.hrstd = rectAttrs['o:hrstd'];
  if (rectAttrs['o:hr']) vmlAttrs.hr = rectAttrs['o:hr'];
  if (rectAttrs.stroked) vmlAttrs.stroked = rectAttrs.stroked;

  if (Object.keys(vmlAttrs).length > 0) {
    schemaAttrs.vmlAttributes = vmlAttrs;
  }

  // Determine if this is a horizontal rule
  const isHorizontalRule = rectAttrs['o:hr'] === 't' || rectAttrs['o:hrstd'] === 't';
  if (isHorizontalRule) {
    schemaAttrs.horizontalRule = true;
  }

  const pPr = pNode.elements?.find((el) => el.name === 'w:pPr');
  const spacingElement = pPr?.elements?.find((el) => el.name === 'w:spacing');
  const spacingAttrs = spacingElement?.attributes || {};
  const inLineIndentTag = pPr?.elements?.find((el) => el.name === 'w:ind');
  const inLineIndent = inLineIndentTag?.attributes || {};

  // Parse spacing using the same logic as paragraphNodeImporter
  const spacing = {};
  if (spacingAttrs['w:after']) spacing.lineSpaceAfter = twipsToPixels(spacingAttrs['w:after']);
  if (spacingAttrs['w:before']) spacing.lineSpaceBefore = twipsToPixels(spacingAttrs['w:before']);
  if (spacingAttrs['w:line']) spacing.line = twipsToLines(spacingAttrs['w:line']);
  if (spacingAttrs['w:lineRule']) spacing.lineRule = spacingAttrs['w:lineRule'];

  const indent = {
    left: 0,
    right: 0,
    firstLine: 0,
    hanging: 0,
  };
  const leftIndent = inLineIndent?.['w:left'];
  const rightIndent = inLineIndent?.['w:right'];

  if (leftIndent) {
    indent.left = twipsToPixels(leftIndent);
  }
  if (rightIndent) {
    indent.right = twipsToPixels(rightIndent);
  }

  return {
    type: 'paragraph',
    content: [
      {
        type: 'contentBlock',
        attrs: schemaAttrs,
      },
    ],
    attrs: {
      spacing: Object.keys(spacing).length > 0 ? spacing : undefined,
      rsidRDefault: pNode.attributes?.['w:rsidRDefault'],
      indent,
    },
  };
}

export function handleShapTextboxImport({ shape, params }) {
  const schemaAttrs = {};
  const schemaTextboxAttrs = {};

  const shapeAttrs = shape.attributes || {};

  schemaAttrs.attributes = shapeAttrs;

  if (shapeAttrs.fillcolor) {
    schemaAttrs.fillcolor = shapeAttrs.fillcolor;
  }

  const parsedStyle = parseInlineStyles(shapeAttrs.style);
  const shapeStyle = buildStyles(parsedStyle);

  if (shapeStyle) {
    schemaAttrs.style = shapeStyle;
  }

  const textbox = shape.elements?.find((el) => el.name === 'v:textbox');
  const wrap = shape.elements?.find((el) => el.name === 'w10:wrap');

  if (wrap?.attributes) {
    schemaAttrs.wrapAttributes = wrap.attributes;
  }

  if (textbox?.attributes) {
    schemaTextboxAttrs.attributes = textbox.attributes;
  }

  const textboxContent = textbox?.elements?.find((el) => el.name === 'w:txbxContent');
  const textboxContentElems = textboxContent?.elements || [];

  const content = textboxContentElems.map((elem) =>
    handleParagraphNode({
      nodes: [elem],
      docx: params.docx,
      nodeListHandler: defaultNodeListHandler(),
    }),
  );
  const contentNodes = content.reduce((acc, current) => [...acc, ...current.nodes], []);

  const shapeTextbox = {
    type: 'shapeTextbox',
    attrs: schemaTextboxAttrs,
    content: contentNodes,
  };

  const shapeContainer = {
    type: 'shapeContainer',
    attrs: schemaAttrs,
    content: [shapeTextbox],
  };

  return shapeContainer;
}

function parseInlineStyles(styleString) {
  if (!styleString) return {};
  return styleString
    .split(';')
    .filter((style) => !!style.trim())
    .reduce((acc, style) => {
      const [prop, value] = style.split(':').map((str) => str.trim());
      if (prop && value) acc[prop] = value;
      return acc;
    }, {});
}

function buildStyles(styleObject) {
  const allowed = [
    'width',
    'height',

    // these styles should probably work relative to the page,
    // since in the doc it is positioned absolutely.
    // 'margin-left',
    // 'margin-right',

    // causes pagination issues.
    // 'margin-top',
    // 'margin-bottom',

    // styleObject - also contains other word styles (mso-).
  ];

  let style = '';
  for (const [prop, value] of Object.entries(styleObject)) {
    if (allowed.includes(prop)) {
      style += `${prop}: ${value};`;
    }
  }

  return style;
}

function buildVRectStyles(styleObject) {
  let style = '';
  for (const [prop, value] of Object.entries(styleObject)) {
    style += `${prop}: ${value};`;
  }

  return style;
}

export function parsePointsToPixels(value) {
  if (typeof value !== 'string') return value;

  // Convert points to pixels (1pt ≈ 1.33px)
  if (value.endsWith('pt')) {
    const val = value.replace('pt', '');
    if (isNaN(val)) {
      return 0;
    }
    const points = parseFloat(val);
    return Math.ceil(points * 1.33);
  }

  // Handle pixel values
  if (value.endsWith('px')) {
    const val = value.replace('px', '');
    if (isNaN(val)) {
      return 0;
    }
    return parseInt(val);
  }

  // Handle numeric values (assume pixels)
  const numValue = parseFloat(value);
  return isNaN(numValue) ? 0 : numValue;
}

export const pictNodeHandlerEntity = {
  handlerName: 'handlePictNode',
  handler: handlePictNode,
};
