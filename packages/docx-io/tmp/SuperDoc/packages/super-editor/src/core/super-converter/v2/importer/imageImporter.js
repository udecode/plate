import { emuToPixels } from '../../helpers.js';

/**
 * @type {import("docxImporter").NodeHandler}
 */
export const handleDrawingNode = (params) => {
  const { nodes, filename } = params;

  const validNodes = ['w:drawing', 'w:p'];
  if (nodes.length === 0 || !validNodes.includes(nodes[0].name)) {
    return { nodes: [], consumed: 0 };
  }

  const mainNode = nodes[0];
  let node;

  if (mainNode.name === 'w:drawing') node = mainNode;
  else node = mainNode.elements.find((el) => el.name === 'w:drawing');

  if (!node) return { nodes: [], consumed: 0 };

  let result;
  const { elements } = node;

  const currentFileName = filename || null;

  // Some images are identified by wp:anchor
  const isAnchor = elements.find((el) => el.name === 'wp:anchor');
  if (isAnchor) {
    result = handleImageImport(elements[0], currentFileName, params);
    if (result && result.attrs) result.attrs.isAnchor = isAnchor;
  }

  // Others, wp:inline
  const inlineImage = elements.find((el) => el.name === 'wp:inline');
  if (inlineImage) result = handleImageImport(inlineImage, currentFileName, params);

  return { nodes: result ? [result] : [], consumed: 1 };
};

export function handleImageImport(node, currentFileName, params) {
  const { docx } = params;
  const { attributes } = node;
  const padding = {
    top: emuToPixels(attributes['distT']),
    bottom: emuToPixels(attributes['distB']),
    left: emuToPixels(attributes['distL']),
    right: emuToPixels(attributes['distR']),
  };

  const extent = node.elements.find((el) => el.name === 'wp:extent');
  const size = {
    width: emuToPixels(extent.attributes?.cx),
    height: emuToPixels(extent.attributes?.cy),
  };

  const graphic = node.elements.find((el) => el.name === 'a:graphic');
  const graphicData = graphic.elements.find((el) => el.name === 'a:graphicData');
  const { uri } = graphicData?.attributes || {};
  const shapeURI = 'http://schemas.microsoft.com/office/word/2010/wordprocessingShape';
  if (!!uri && uri === shapeURI) {
    return handleShapeDrawing(params, node, graphicData);
  }

  const picture = graphicData.elements.find((el) => el.name === 'pic:pic');
  if (!picture || !picture.elements) return null;

  const blipFill = picture.elements.find((el) => el.name === 'pic:blipFill');
  const blip = blipFill.elements.find((el) => el.name === 'a:blip');

  const positionHTag = node.elements.find((el) => el.name === 'wp:positionH');
  const positionH = positionHTag?.elements.find((el) => el.name === 'wp:posOffset');
  const positionHValue = emuToPixels(positionH?.elements[0]?.text);
  const hRelativeFrom = positionHTag?.attributes.relativeFrom;
  const alignH = positionHTag?.elements.find((el) => el.name === 'wp:align')?.elements[0]?.text;

  const positionVTag = node.elements.find((el) => el.name === 'wp:positionV');
  const positionV = positionVTag?.elements?.find((el) => el.name === 'wp:posOffset');
  const positionVValue = emuToPixels(positionV?.elements[0]?.text);
  const vRelativeFrom = positionVTag?.attributes.relativeFrom;
  const alignV = positionVTag?.elements?.find((el) => el.name === 'wp:align')?.elements[0]?.text;

  const simplePos = node.elements.find((el) => el.name === 'wp:simplePos');
  const wrapSquare = node.elements.find((el) => el.name === 'wp:wrapSquare');
  const wrapTopAndBottom = node.elements.find((el) => el.name === 'wp:wrapTopAndBottom');

  const docPr = node.elements.find((el) => el.name === 'wp:docPr');

  let anchorData = null;
  if (hRelativeFrom || alignH || vRelativeFrom || alignV) {
    anchorData = {
      hRelativeFrom,
      vRelativeFrom,
      alignH,
      alignV,
    };
  }

  const marginOffset = {
    left: positionHValue,
    top: positionVValue,
  };

  const { attributes: blipAttributes = {} } = blip;
  const rEmbed = blipAttributes['r:embed'];
  if (!rEmbed) return null;

  const currentFile = currentFileName || 'document.xml';
  let rels = docx[`word/_rels/${currentFile}.rels`];
  if (!rels) rels = docx[`word/_rels/document.xml.rels`];

  const relationships = rels.elements.find((el) => el.name === 'Relationships');
  const { elements } = relationships;

  const rel = elements.find((el) => el.attributes['Id'] === rEmbed);
  if (!rel) return null;

  const { attributes: relAttributes } = rel;

  const path = `word/${relAttributes['Target']}`;

  return {
    type: 'image',
    attrs: {
      src: path,
      alt: docPr?.attributes.name || 'Image',
      id: docPr?.attributes.id || '',
      title: docPr?.attributes.descr || 'Image',
      inline: true,
      padding,
      marginOffset,
      size,
      anchorData,
      ...(simplePos && {
        simplePos: {
          x: simplePos.attributes.x,
          y: simplePos.attributes.y,
        },
      }),
      ...(wrapSquare && {
        wrapText: wrapSquare.attributes.wrapText,
      }),
      wrapTopAndBottom: !!wrapTopAndBottom,
      originalPadding: {
        distT: attributes['distT'],
        distB: attributes['distB'],
        distL: attributes['distL'],
        distR: attributes['distR'],
      },
      originalAttributes: node.attributes,
      rId: relAttributes['Id'],
    },
  };
}

const handleShapeDrawing = (params, node, graphicData) => {
  const wsp = graphicData.elements.find((el) => el.name === 'wps:wsp');
  const textBox = wsp.elements.find((el) => el.name === 'wps:txbx');
  const textBoxContent = textBox?.elements?.find((el) => el.name === 'w:txbxContent');

  // eslint-disable-next-line no-unused-vars
  const isGraphicContainer = node.elements.find((el) => el.name === 'wp:docPr');

  const spPr = wsp.elements.find((el) => el.name === 'wps:spPr');
  const prstGeom = spPr?.elements.find((el) => el.name === 'a:prstGeom');

  if (!!prstGeom && prstGeom.attributes['prst'] === 'rect') {
    return getRectangleShape(params, spPr);
  }

  if (!textBoxContent) {
    return null;
  }

  const { nodeListHandler } = params;
  const translatedElement = nodeListHandler.handler({
    ...params,
    node: textBoxContent.elements[0],
    nodes: textBoxContent.elements,
  });

  return translatedElement[0];
};

const getRectangleShape = (params, node) => {
  const schemaAttrs = {};

  const [drawingNode] = params.nodes;

  if (drawingNode?.name === 'w:drawing') {
    schemaAttrs.drawingContent = drawingNode;
  }

  const xfrm = node.elements.find((el) => el.name === 'a:xfrm');
  const start = xfrm.elements.find((el) => el.name === 'a:off');
  const size = xfrm.elements.find((el) => el.name === 'a:ext');
  const solidFill = node.elements.find((el) => el.name === 'a:solidFill');

  // TODO: We should handle this
  // eslint-disable-next-line no-unused-vars
  const outline = node.elements.find((el) => el.name === 'a:ln');

  const rectangleSize = {
    top: emuToPixels(start.attributes['y']),
    left: emuToPixels(start.attributes['x']),
    width: emuToPixels(size.attributes['cx']),
    height: emuToPixels(size.attributes['cy']),
  };
  schemaAttrs.size = rectangleSize;

  const background = solidFill?.elements[0]?.attributes['val'];

  if (background) {
    schemaAttrs.background = '#' + background;
  }

  return {
    type: 'contentBlock',
    attrs: schemaAttrs,
  };
};

/**
 * @type {import("docxImporter").NodeHandlerEntry}
 */
export const drawingNodeHandlerEntity = {
  handlerName: 'drawingNodeHandler',
  handler: handleDrawingNode,
};
