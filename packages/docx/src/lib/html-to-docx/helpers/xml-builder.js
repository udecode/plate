/* biome-ignore-all lint/nursery/useMaxParams: legacy code */
/* biome-ignore-all lint/performance/useTopLevelRegex: legacy code */
/* biome-ignore-all lint/style/noParameterAssign: legacy code */
/* biome-ignore-all lint/style/useForOf: legacy code */
import colorNames from 'color-name';
import imageToBase64 from '../utils/image-to-base64';
import { getImageDimensions } from '../utils/image-dimensions';
import { cloneDeep } from 'lodash';
import mimeTypes from 'mime-types';
import isVNode from 'virtual-dom/vnode/is-vnode';
import isVText from 'virtual-dom/vnode/is-vtext';
import { fragment } from 'xmlbuilder2';
import {
  colorlessColors,
  defaultFont,
  hyperlinkType,
  imageType,
  internalRelationship,
  paragraphBordersObject,
  verticalAlignValues,
} from '../constants';
import namespaces from '../namespaces';
import {
  hex3Regex,
  hex3ToHex,
  hexRegex,
  hslRegex,
  hslToHex,
  rgbRegex,
  rgbToHex,
} from '../utils/color-conversion';
import {
  cmRegex,
  cmToTWIP,
  HIPToTWIP,
  inchRegex,
  inchToTWIP,
  percentageRegex,
  pixelRegex,
  pixelToEIP,
  pixelToEMU,
  pixelToHIP,
  pixelToTWIP,
  pointRegex,
  pointToEIP,
  pointToHIP,
  pointToTWIP,
  TWIPToEMU,
} from '../utils/unit-conversion';
import { isValidUrl } from '../utils/url';
import { vNodeHasChildren } from '../utils/vnode';
// FIXME: remove the cyclic dependency
// eslint-disable-next-line import/no-cycle
import { buildImage, buildList } from './render-document-file';

const fixupColorCode = (colorCodeString) => {
  if (Object.hasOwn(colorNames, colorCodeString.toLowerCase())) {
    const [red, green, blue] = colorNames[colorCodeString.toLowerCase()];

    return rgbToHex(red, green, blue);
  }
  if (rgbRegex.test(colorCodeString)) {
    const matchedParts = colorCodeString.match(rgbRegex);
    const red = matchedParts[1];
    const green = matchedParts[2];
    const blue = matchedParts[3];

    return rgbToHex(red, green, blue);
  }
  if (hslRegex.test(colorCodeString)) {
    const matchedParts = colorCodeString.match(hslRegex);
    const hue = matchedParts[1];
    const saturation = matchedParts[2];
    const luminosity = matchedParts[3];

    return hslToHex(hue, saturation, luminosity);
  }
  if (hexRegex.test(colorCodeString)) {
    const matchedParts = colorCodeString.match(hexRegex);

    return matchedParts[1];
  }
  if (hex3Regex.test(colorCodeString)) {
    const matchedParts = colorCodeString.match(hex3Regex);
    const red = matchedParts[1];
    const green = matchedParts[2];
    const blue = matchedParts[3];

    return hex3ToHex(red, green, blue);
  }
  return '000000';
};

const buildRunFontFragment = (fontName = defaultFont) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'rFonts')
    .att('@w', 'ascii', fontName)
    .att('@w', 'hAnsi', fontName)
    .up();

const buildRunStyleFragment = (type = 'Hyperlink') =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'rStyle')
    .att('@w', 'val', type)
    .up();

const buildTableRowHeight = (tableRowHeight) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'trHeight')
    .att('@w', 'val', tableRowHeight)
    .att('@w', 'hRule', 'atLeast')
    .up();

const buildVerticalAlignment = (verticalAlignment) => {
  if (verticalAlignment.toLowerCase() === 'middle') {
    verticalAlignment = 'center';
  }

  return fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'vAlign')
    .att('@w', 'val', verticalAlignment)
    .up();
};

const buildVerticalMerge = (verticalMerge = 'continue') =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'vMerge')
    .att('@w', 'val', verticalMerge)
    .up();

const buildColor = (colorCode) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'color')
    .att('@w', 'val', colorCode)
    .up();

const buildFontSize = (fontSize) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'sz')
    .att('@w', 'val', fontSize)
    .up();

const buildShading = (colorCode) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'shd')
    .att('@w', 'val', 'clear')
    .att('@w', 'fill', colorCode)
    .up();

const buildHighlight = (color = 'yellow') =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'highlight')
    .att('@w', 'val', color)
    .up();

const buildVertAlign = (type = 'baseline') =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'vertAlign')
    .att('@w', 'val', type)
    .up();

const buildStrike = () =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'strike')
    .att('@w', 'val', true)
    .up();

const buildBold = () =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'b')
    .up();

const buildItalics = () =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'i')
    .up();

const buildUnderline = (type = 'single') =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'u')
    .att('@w', 'val', type)
    .up();

const buildLineBreak = (type = 'textWrapping') =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'br')
    .att('@w', 'type', type)
    .up();

const buildBorder = (
  borderSide = 'top',
  borderSize = 0,
  borderSpacing = 0,
  borderColor = fixupColorCode('black'),
  borderStroke = 'single'
) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', borderSide)
    .att('@w', 'val', borderStroke)
    .att('@w', 'sz', borderSize)
    .att('@w', 'space', borderSpacing)
    .att('@w', 'color', borderColor)
    .up();

const buildTextElement = (text) =>
  fragment({
    namespaceAlias: {
      w: namespaces.w,
      xml: 'http://www.w3.org/XML/1998/namespace',
    },
  })
    .ele('@w', 't')
    .att('@xml', 'space', 'preserve')
    .txt(text)
    .up();

const fixupLineHeight = (lineHeight, fontSize) => {
  // FIXME: If line height is anything other than a number

  if (Number.isNaN(lineHeight)) {
    // 240 TWIP or 12 point is default line height
    return 240;
  }
  if (fontSize) {
    const actualLineHeight = +lineHeight * fontSize;

    return HIPToTWIP(actualLineHeight);
  }
  // 240 TWIP or 12 point is default line height
  return +lineHeight * 240;
};

const fixupFontSize = (fontSizeString) => {
  if (pointRegex.test(fontSizeString)) {
    const matchedParts = fontSizeString.match(pointRegex);
    // convert point to half point
    return pointToHIP(matchedParts[1]);
  }
  if (pixelRegex.test(fontSizeString)) {
    const matchedParts = fontSizeString.match(pixelRegex);
    // convert pixels to half point
    return pixelToHIP(matchedParts[1]);
  }
};

const fixupRowHeight = (rowHeightString) => {
  if (pointRegex.test(rowHeightString)) {
    const matchedParts = rowHeightString.match(pointRegex);
    // convert point to half point
    return pointToTWIP(matchedParts[1]);
  }
  if (pixelRegex.test(rowHeightString)) {
    const matchedParts = rowHeightString.match(pixelRegex);
    // convert pixels to half point
    return pixelToTWIP(matchedParts[1]);
  }
  if (cmRegex.test(rowHeightString)) {
    const matchedParts = rowHeightString.match(cmRegex);
    return cmToTWIP(matchedParts[1]);
  }
  if (inchRegex.test(rowHeightString)) {
    const matchedParts = rowHeightString.match(inchRegex);
    return inchToTWIP(matchedParts[1]);
  }
};

const fixupColumnWidth = (columnWidthString) => {
  if (!columnWidthString) return null;

  if (pointRegex.test(columnWidthString)) {
    const matchedParts = columnWidthString.match(pointRegex);
    return { value: pointToTWIP(matchedParts[1]), type: 'dxa' };
  }
  if (pixelRegex.test(columnWidthString)) {
    const matchedParts = columnWidthString.match(pixelRegex);
    return { value: pixelToTWIP(matchedParts[1]), type: 'dxa' };
  }
  if (cmRegex.test(columnWidthString)) {
    const matchedParts = columnWidthString.match(cmRegex);
    return { value: cmToTWIP(matchedParts[1]), type: 'dxa' };
  }
  if (inchRegex.test(columnWidthString)) {
    const matchedParts = columnWidthString.match(inchRegex);
    return { value: inchToTWIP(matchedParts[1]), type: 'dxa' };
  }
  if (percentageRegex.test(columnWidthString)) {
    const matchedParts = columnWidthString.match(percentageRegex);
    // Convert percentage to fiftieths of a percent (pct in OOXML)
    // 50% = 50 * 50 = 2500 (fiftieths of a percent)
    return { value: Number.parseFloat(matchedParts[1]) * 50, type: 'pct' };
  }
  return null;
};

const fixupMargin = (marginString) => {
  if (pointRegex.test(marginString)) {
    const matchedParts = marginString.match(pointRegex);
    // convert point to half point
    return pointToTWIP(matchedParts[1]);
  }
  if (pixelRegex.test(marginString)) {
    const matchedParts = marginString.match(pixelRegex);
    // convert pixels to half point
    return pixelToTWIP(matchedParts[1]);
  }
};

const modifiedStyleAttributesBuilder = (
  docxDocumentInstance,
  vNode,
  attributes,
  options
) => {
  const modifiedAttributes = { ...attributes };

  // styles
  if (isVNode(vNode) && vNode.properties && vNode.properties.style) {
    if (
      vNode.properties.style.color &&
      !colorlessColors.includes(vNode.properties.style.color)
    ) {
      modifiedAttributes.color = fixupColorCode(vNode.properties.style.color);
    }

    if (
      vNode.properties.style['background-color'] &&
      !colorlessColors.includes(vNode.properties.style['background-color'])
    ) {
      modifiedAttributes.backgroundColor = fixupColorCode(
        vNode.properties.style['background-color']
      );
    }

    if (
      vNode.properties.style['vertical-align'] &&
      verticalAlignValues.includes(vNode.properties.style['vertical-align'])
    ) {
      modifiedAttributes.verticalAlign =
        vNode.properties.style['vertical-align'];
    }

    if (
      vNode.properties.style['text-align'] &&
      ['left', 'right', 'center', 'justify'].includes(
        vNode.properties.style['text-align']
      )
    ) {
      modifiedAttributes.textAlign = vNode.properties.style['text-align'];
    }

    // FIXME: remove bold check when other font weights are handled.
    if (
      vNode.properties.style['font-weight'] &&
      vNode.properties.style['font-weight'] === 'bold'
    ) {
      modifiedAttributes.strong = vNode.properties.style['font-weight'];
    }
    if (vNode.properties.style['font-family']) {
      modifiedAttributes.font = docxDocumentInstance.createFont(
        vNode.properties.style['font-family']
      );
    }
    if (vNode.properties.style['font-size']) {
      modifiedAttributes.fontSize = fixupFontSize(
        vNode.properties.style['font-size']
      );
    }
    if (vNode.properties.style['line-height']) {
      modifiedAttributes.lineHeight = fixupLineHeight(
        vNode.properties.style['line-height'],
        vNode.properties.style['font-size']
          ? fixupFontSize(vNode.properties.style['font-size'])
          : null
      );
    }
    if (
      vNode.properties.style['margin-left'] ||
      vNode.properties.style['margin-right']
    ) {
      const leftMargin = fixupMargin(vNode.properties.style['margin-left']);
      const rightMargin = fixupMargin(vNode.properties.style['margin-right']);
      const indentation = {};
      if (leftMargin) {
        indentation.left = leftMargin;
      }
      if (rightMargin) {
        indentation.right = rightMargin;
      }
      if (leftMargin || rightMargin) {
        modifiedAttributes.indentation = indentation;
      }
    }
    if (vNode.properties.style.display) {
      modifiedAttributes.display = vNode.properties.style.display;
    }

    if (vNode.properties.style.width) {
      modifiedAttributes.width = vNode.properties.style.width;
    }
  }

  // paragraph only
  if (options?.isParagraph) {
    if (isVNode(vNode) && vNode.tagName === 'blockquote') {
      modifiedAttributes.indentation = { left: 284 };
      modifiedAttributes.textAlign = 'justify';
    } else if (isVNode(vNode) && vNode.tagName === 'code') {
      modifiedAttributes.highlightColor = 'lightGray';
    } else if (isVNode(vNode) && vNode.tagName === 'pre') {
      modifiedAttributes.font = 'Courier';
    }
  }

  return modifiedAttributes;
};

// html tag to formatting function
// options are passed to the formatting function if needed
const buildFormatting = (htmlTag, options) => {
  switch (htmlTag) {
    case 'strong':
    case 'b':
      return buildBold();
    case 'em':
    case 'i':
      return buildItalics();
    case 'ins':
    case 'u':
      return buildUnderline();
    case 'strike':
    case 'del':
    case 's':
      return buildStrike();
    case 'sub':
      return buildVertAlign('subscript');
    case 'sup':
      return buildVertAlign('superscript');
    case 'mark':
      return buildHighlight();
    case 'code':
    case 'kbd':
      return buildHighlight('lightGray');
    case 'highlightColor':
      return buildHighlight(options?.color ? options.color : 'lightGray');
    case 'font':
      return buildRunFontFragment(options.font);
    case 'pre':
      return buildRunFontFragment('Courier');
    case 'color':
      return buildColor(options?.color ? options.color : 'black');
    case 'backgroundColor':
      return buildShading(options?.color ? options.color : 'black');
    case 'fontSize':
      // does this need a unit of measure?
      return buildFontSize(options?.fontSize ? options.fontSize : 10);
    case 'hyperlink':
      return buildRunStyleFragment('Hyperlink');
  }

  return null;
};

const buildRunProperties = (attributes) => {
  const runPropertiesFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'rPr');
  if (attributes && attributes.constructor === Object) {
    Object.keys(attributes).forEach((key) => {
      const options = {};
      if (
        key === 'color' ||
        key === 'backgroundColor' ||
        key === 'highlightColor'
      ) {
        options.color = attributes[key];
      }

      if (key === 'fontSize' || key === 'font') {
        options[key] = attributes[key];
      }

      const formattingFragment = buildFormatting(key, options);
      if (formattingFragment) {
        runPropertiesFragment.import(formattingFragment);
      }
    });
  }
  runPropertiesFragment.up();

  return runPropertiesFragment;
};

const buildRun = async (vNode, attributes, docxDocumentInstance) => {
  const runFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele(
    '@w',
    'r'
  );
  const runPropertiesFragment = buildRunProperties(cloneDeep(attributes));

  // case where we have recursive spans representing font changes
  if (isVNode(vNode) && vNode.tagName === 'span') {
    return buildRunOrRuns(vNode, attributes, docxDocumentInstance);
  }

  if (
    isVNode(vNode) &&
    [
      'strong',
      'b',
      'em',
      'i',
      'u',
      'ins',
      'strike',
      'del',
      's',
      'sub',
      'sup',
      'mark',
      'blockquote',
      'code',
      'kbd',
      'pre',
    ].includes(vNode.tagName)
  ) {
    const runFragmentsArray = [];

    let vNodes = [vNode];
    // create temp run fragments to split the paragraph into different runs
    let tempAttributes = cloneDeep(attributes);
    let tempRunFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele(
      '@w',
      'r'
    );
    while (vNodes.length) {
      const tempVNode = vNodes.shift();
      if (isVText(tempVNode)) {
        const textFragment = buildTextElement(tempVNode.text);
        const tempRunPropertiesFragment = buildRunProperties({
          ...attributes,
          ...tempAttributes,
        });
        tempRunFragment.import(tempRunPropertiesFragment);
        tempRunFragment.import(textFragment);
        runFragmentsArray.push(tempRunFragment);

        // re initialize temp run fragments with new fragment
        tempAttributes = cloneDeep(attributes);
        tempRunFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele(
          '@w',
          'r'
        );
      } else if (isVNode(tempVNode)) {
        if (
          [
            'strong',
            'b',
            'em',
            'i',
            'u',
            'ins',
            'strike',
            'del',
            's',
            'sub',
            'sup',
            'mark',
            'code',
            'kbd',
            'pre',
          ].includes(tempVNode.tagName)
        ) {
          tempAttributes = {};
          switch (tempVNode.tagName) {
            case 'strong':
            case 'b':
              tempAttributes.strong = true;
              break;
            case 'em':
            case 'i':
              tempAttributes.i = true;
              break;
            case 'ins':
            case 'u':
              tempAttributes.u = true;
              break;
            case 'strike':
            case 'del':
            case 's':
              tempAttributes.strike = true;
              break;
            case 'sub':
              tempAttributes.sub = true;
              break;
            case 'sup':
              tempAttributes.sup = true;
              break;
            case 'mark':
              tempAttributes.mark = true;
              break;
            case 'code':
              tempAttributes.code = true;
              break;
            case 'kbd':
              tempAttributes.kbd = true;
              break;
          }
          const formattingFragment = buildFormatting(tempVNode.tagName);

          if (formattingFragment) {
            runPropertiesFragment.import(formattingFragment);
          }
          // go a layer deeper if there is a span somewhere in the children
        } else if (tempVNode.tagName === 'span') {
          const spanFragment = await buildRunOrRuns(
            tempVNode,
            { ...attributes, ...tempAttributes },
            docxDocumentInstance
          );

          // if spanFragment is an array, we need to add each fragment to the runFragmentsArray. If the fragment is an array, perform a depth first search on the array to add each fragment to the runFragmentsArray
          if (Array.isArray(spanFragment)) {
            spanFragment.flat(Number.POSITIVE_INFINITY);
            runFragmentsArray.push(...spanFragment);
          } else {
            runFragmentsArray.push(spanFragment);
          }

          // do not slice and concat children since this is already accounted for in the buildRunOrRuns function

          continue;
        }
      }

      if (tempVNode.children?.length) {
        if (tempVNode.children.length > 1) {
          attributes = { ...attributes, ...tempAttributes };
        }

        vNodes = tempVNode.children.slice().concat(vNodes);
      }
    }
    if (runFragmentsArray.length) {
      return runFragmentsArray;
    }
  }

  runFragment.import(runPropertiesFragment);
  if (isVText(vNode)) {
    const textFragment = buildTextElement(vNode.text);
    runFragment.import(textFragment);
  } else if (attributes && attributes.type === 'picture') {
    let response = null;

    const base64Uri = decodeURIComponent(vNode.properties.src);
    if (base64Uri) {
      response = docxDocumentInstance.createMediaFile(base64Uri);
    }

    if (response) {
      docxDocumentInstance.zip
        .folder('word')
        .folder('media')
        .file(
          response.fileNameWithExtension,
          Buffer.from(response.fileContent, 'base64'),
          {
            createFolders: false,
          }
        );

      const documentRelsId = docxDocumentInstance.createDocumentRelationships(
        docxDocumentInstance.relationshipFilename,
        imageType,
        `media/${response.fileNameWithExtension}`,
        internalRelationship
      );

      attributes.inlineOrAnchored = true;
      attributes.relationshipId = documentRelsId;
      attributes.id = response.id;
      attributes.fileContent = response.fileContent;
      attributes.fileNameWithExtension = response.fileNameWithExtension;
    }

    const { type, inlineOrAnchored, ...otherAttributes } = attributes;

    const imageFragment = buildDrawing(inlineOrAnchored, type, otherAttributes);
    runFragment.import(imageFragment);
  } else if (isVNode(vNode) && vNode.tagName === 'br') {
    const lineBreakFragment = buildLineBreak();
    runFragment.import(lineBreakFragment);
  }
  runFragment.up();

  return runFragment;
};

const buildRunOrRuns = async (vNode, attributes, docxDocumentInstance) => {
  // Check for OMML equation data attribute
  if (
    isVNode(vNode) &&
    vNode.properties &&
    vNode.properties.attributes &&
    vNode.properties.attributes['data-equation-omml']
  ) {
    const ommlString = vNode.properties.attributes['data-equation-omml'];
    try {
      // Parse the OMML string and create a fragment
      const ommlFragment = fragment().ele(ommlString);
      return ommlFragment;
    } catch {
      // If parsing fails, fall through to normal text handling
      console.warn('Failed to parse OMML, falling back to text');
    }
  }

  if (isVNode(vNode) && vNode.tagName === 'span') {
    let runFragments = [];

    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = vNode.children[index];
      const modifiedAttributes = modifiedStyleAttributesBuilder(
        docxDocumentInstance,
        vNode,
        attributes
      );
      const tempRunFragments = await buildRun(
        childVNode,
        modifiedAttributes,
        docxDocumentInstance
      );
      runFragments = runFragments.concat(
        Array.isArray(tempRunFragments) ? tempRunFragments : [tempRunFragments]
      );
    }

    return runFragments;
  }
  const tempRunFragments = await buildRun(
    vNode,
    attributes,
    docxDocumentInstance
  );
  return tempRunFragments;
};

const buildRunOrHyperLink = async (vNode, attributes, docxDocumentInstance) => {
  if (isVNode(vNode) && vNode.tagName === 'a') {
    const href = vNode.properties?.href ? vNode.properties.href : '';

    // Check if this is an internal link (starts with #)
    const isInternalLink = href.startsWith('#');

    let hyperlinkFragment;
    if (isInternalLink) {
      // For internal links, use w:anchor attribute instead of r:id
      const anchorName = href.substring(1); // Remove the # prefix
      hyperlinkFragment = fragment({
        namespaceAlias: { w: namespaces.w },
      })
        .ele('@w', 'hyperlink')
        .att('@w', 'anchor', anchorName);
    } else {
      // For external links, use relationship id
      const relationshipId = docxDocumentInstance.createDocumentRelationships(
        docxDocumentInstance.relationshipFilename,
        hyperlinkType,
        href
      );
      hyperlinkFragment = fragment({
        namespaceAlias: { w: namespaces.w, r: namespaces.r },
      })
        .ele('@w', 'hyperlink')
        .att('@r', 'id', `rId${relationshipId}`);
    }

    const modifiedAttributes = { ...attributes };
    modifiedAttributes.hyperlink = true;

    const runFragments = await buildRunOrRuns(
      vNode.children[0],
      modifiedAttributes,
      docxDocumentInstance
    );
    if (Array.isArray(runFragments)) {
      for (let index = 0; index < runFragments.length; index++) {
        const runFragment = runFragments[index];

        hyperlinkFragment.import(runFragment);
      }
    } else {
      hyperlinkFragment.import(runFragments);
    }
    hyperlinkFragment.up();

    return hyperlinkFragment;
  }

  const runFragments = await buildRunOrRuns(
    vNode,
    attributes,
    docxDocumentInstance
  );

  return runFragments;
};

const buildNumberingProperties = (levelId, numberingId) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'numPr')
    .ele('@w', 'ilvl')
    .att('@w', 'val', String(levelId))
    .up()
    .ele('@w', 'numId')
    .att('@w', 'val', String(numberingId))
    .up()
    .up();

const buildNumberingInstances = () =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'num')
    .ele('@w', 'abstractNumId')
    .up()
    .up();

const buildSpacing = (lineSpacing, beforeSpacing, afterSpacing) => {
  const spacingFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele(
    '@w',
    'spacing'
  );

  if (lineSpacing) {
    spacingFragment.att('@w', 'line', lineSpacing);
  }
  if (beforeSpacing) {
    spacingFragment.att('@w', 'before', beforeSpacing);
  }
  if (afterSpacing) {
    spacingFragment.att('@w', 'after', afterSpacing);
  }

  spacingFragment.att('@w', 'lineRule', 'auto').up();

  return spacingFragment;
};

const buildIndentation = ({ left, right }) => {
  const indentationFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'ind');

  if (left) {
    indentationFragment.att('@w', 'left', left);
  }
  if (right) {
    indentationFragment.att('@w', 'right', right);
  }

  indentationFragment.up();

  return indentationFragment;
};

const buildPStyle = (style = 'Normal') =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'pStyle')
    .att('@w', 'val', style)
    .up();

const buildHorizontalAlignment = (horizontalAlignment) => {
  if (horizontalAlignment === 'justify') {
    horizontalAlignment = 'both';
  }
  return fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'jc')
    .att('@w', 'val', horizontalAlignment)
    .up();
};

const buildParagraphBorder = () => {
  const paragraphBorderFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'pBdr');
  const bordersObject = cloneDeep(paragraphBordersObject);

  Object.keys(bordersObject).forEach((borderName) => {
    if (bordersObject[borderName]) {
      const { size, spacing, color } = bordersObject[borderName];

      const borderFragment = buildBorder(borderName, size, spacing, color);
      paragraphBorderFragment.import(borderFragment);
    }
  });

  paragraphBorderFragment.up();

  return paragraphBorderFragment;
};

const buildParagraphProperties = (attributes) => {
  const paragraphPropertiesFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'pPr');
  if (attributes && attributes.constructor === Object) {
    Object.keys(attributes).forEach((key) => {
      switch (key) {
        case 'numbering': {
          const { levelId, numberingId } = attributes[key];
          const numberingPropertiesFragment = buildNumberingProperties(
            levelId,
            numberingId
          );
          paragraphPropertiesFragment.import(numberingPropertiesFragment);

          attributes.numbering = undefined;
          break;
        }
        case 'textAlign': {
          const horizontalAlignmentFragment = buildHorizontalAlignment(
            attributes[key]
          );
          paragraphPropertiesFragment.import(horizontalAlignmentFragment);

          attributes.textAlign = undefined;
          break;
        }
        case 'backgroundColor':
          // Add shading to Paragraph Properties only if display is block
          // Essentially if background color needs to be across the row
          if (attributes.display === 'block') {
            const shadingFragment = buildShading(attributes[key]);
            paragraphPropertiesFragment.import(shadingFragment);
            // FIXME: Inner padding in case of shaded paragraphs.
            const paragraphBorderFragment = buildParagraphBorder();
            paragraphPropertiesFragment.import(paragraphBorderFragment);

            attributes.backgroundColor = undefined;
          }
          break;
        case 'paragraphStyle': {
          const pStyleFragment = buildPStyle(attributes.paragraphStyle);
          paragraphPropertiesFragment.import(pStyleFragment);
          attributes.paragraphStyle = undefined;
          break;
        }
        case 'indentation': {
          const indentationFragment = buildIndentation(attributes[key]);
          paragraphPropertiesFragment.import(indentationFragment);

          attributes.indentation = undefined;
          break;
        }
      }
    });

    const spacingFragment = buildSpacing(
      attributes.lineHeight,
      attributes.beforeSpacing,
      attributes.afterSpacing
    );

    attributes.lineHeight = undefined;

    attributes.beforeSpacing = undefined;

    attributes.afterSpacing = undefined;

    paragraphPropertiesFragment.import(spacingFragment);
  }
  paragraphPropertiesFragment.up();

  return paragraphPropertiesFragment;
};

const computeImageDimensions = (vNode, attributes) => {
  const { maximumWidth, originalWidth, originalHeight } = attributes;
  const aspectRatio = originalWidth / originalHeight;
  const maximumWidthInEMU = TWIPToEMU(maximumWidth);
  let originalWidthInEMU = pixelToEMU(originalWidth);
  let originalHeightInEMU = pixelToEMU(originalHeight);
  if (originalWidthInEMU > maximumWidthInEMU) {
    originalWidthInEMU = maximumWidthInEMU;
    originalHeightInEMU = Math.round(originalWidthInEMU / aspectRatio);
  }
  let modifiedHeight;
  let modifiedWidth;

  if (vNode.properties?.style) {
    if (vNode.properties.style.width) {
      if (vNode.properties.style.width !== 'auto') {
        if (pixelRegex.test(vNode.properties.style.width)) {
          modifiedWidth = pixelToEMU(
            vNode.properties.style.width.match(pixelRegex)[1]
          );
        } else if (percentageRegex.test(vNode.properties.style.width)) {
          const percentageValue =
            vNode.properties.style.width.match(percentageRegex)[1];

          modifiedWidth = Math.round(
            (percentageValue / 100) * originalWidthInEMU
          );
        }
      } else if (
        vNode.properties.style.height &&
        vNode.properties.style.height === 'auto'
      ) {
        modifiedWidth = originalWidthInEMU;
        modifiedHeight = originalHeightInEMU;
      }
    }
    if (vNode.properties.style.height) {
      if (vNode.properties.style.height !== 'auto') {
        if (pixelRegex.test(vNode.properties.style.height)) {
          modifiedHeight = pixelToEMU(
            vNode.properties.style.height.match(pixelRegex)[1]
          );
        } else if (percentageRegex.test(vNode.properties.style.height)) {
          const percentageValue =
            vNode.properties.style.width.match(percentageRegex)[1];

          modifiedHeight = Math.round(
            (percentageValue / 100) * originalHeightInEMU
          );
          if (!modifiedWidth) {
            modifiedWidth = Math.round(modifiedHeight * aspectRatio);
          }
        }
      } else if (modifiedWidth) {
        if (!modifiedHeight) {
          modifiedHeight = Math.round(modifiedWidth / aspectRatio);
        }
      } else {
        modifiedHeight = originalHeightInEMU;
        modifiedWidth = originalWidthInEMU;
      }
    }
    if (modifiedWidth && !modifiedHeight) {
      modifiedHeight = Math.round(modifiedWidth / aspectRatio);
    } else if (modifiedHeight && !modifiedWidth) {
      modifiedWidth = Math.round(modifiedHeight * aspectRatio);
    }
  } else {
    modifiedWidth = originalWidthInEMU;
    modifiedHeight = originalHeightInEMU;
  }

  attributes.width = modifiedWidth;

  attributes.height = modifiedHeight;
};

// Track bookmark IDs globally to ensure unique IDs across the document
let globalBookmarkIdCounter = 0;

const buildParagraph = async (vNode, attributes, docxDocumentInstance) => {
  const paragraphFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'p');
  const modifiedAttributes = modifiedStyleAttributesBuilder(
    docxDocumentInstance,
    vNode,
    attributes,
    {
      isParagraph: true,
    }
  );
  const paragraphPropertiesFragment =
    buildParagraphProperties(modifiedAttributes);
  paragraphFragment.import(paragraphPropertiesFragment);

  // Add bookmark start if bookmarkId is provided
  const bookmarkId = attributes?.bookmarkId;
  let bookmarkNumericId = null;
  if (bookmarkId) {
    bookmarkNumericId = globalBookmarkIdCounter++;
    const bookmarkStartFragment = fragment({
      namespaceAlias: { w: namespaces.w },
    })
      .ele('@w', 'bookmarkStart')
      .att('@w', 'id', String(bookmarkNumericId))
      .att('@w', 'name', bookmarkId)
      .up();
    paragraphFragment.import(bookmarkStartFragment);
  }
  if (isVNode(vNode) && vNodeHasChildren(vNode)) {
    if (
      [
        'span',
        'strong',
        'b',
        'em',
        'i',
        'u',
        'ins',
        'strike',
        'del',
        's',
        'sub',
        'sup',
        'mark',
        'a',
        'code',
        'pre',
      ].includes(vNode.tagName)
    ) {
      const runOrHyperlinkFragments = await buildRunOrHyperLink(
        vNode,
        modifiedAttributes,
        docxDocumentInstance
      );
      if (Array.isArray(runOrHyperlinkFragments)) {
        for (
          let iteratorIndex = 0;
          iteratorIndex < runOrHyperlinkFragments.length;
          iteratorIndex++
        ) {
          const runOrHyperlinkFragment = runOrHyperlinkFragments[iteratorIndex];

          paragraphFragment.import(runOrHyperlinkFragment);
        }
      } else {
        paragraphFragment.import(runOrHyperlinkFragments);
      }
    } else if (vNode.tagName === 'blockquote') {
      const runFragmentOrFragments = await buildRun(vNode, attributes);
      if (Array.isArray(runFragmentOrFragments)) {
        for (let index = 0; index < runFragmentOrFragments.length; index++) {
          paragraphFragment.import(runFragmentOrFragments[index]);
        }
      } else {
        paragraphFragment.import(runFragmentOrFragments);
      }
    } else {
      for (let index = 0; index < vNode.children.length; index++) {
        const childVNode = vNode.children[index];
        if (childVNode.tagName === 'img') {
          let base64String;
          const imageSource = childVNode.properties.src;

          // Skip WebP images - Word doesn't support WebP format
          if (
            imageSource &&
            (imageSource.includes('.webp') ||
              imageSource.includes('image/webp'))
          ) {
            continue;
          }

          if (isValidUrl(imageSource)) {
            base64String = await imageToBase64(imageSource).catch(() => {});

            if (base64String) {
              // Try to get MIME type from URL extension first
              let mimeType = mimeTypes.lookup(imageSource);

              // Skip WebP images even if detected from extension
              if (mimeType === 'image/webp') {
                continue;
              }

              // If no extension, detect MIME type from base64 data
              if (!mimeType) {
                const binaryStr = atob(base64String.substring(0, 16));
                const bytes = new Uint8Array(binaryStr.length);
                for (let i = 0; i < binaryStr.length; i++) {
                  bytes[i] = binaryStr.charCodeAt(i);
                }
                // Check magic bytes
                if (
                  bytes[0] === 0xff &&
                  bytes[1] === 0xd8 &&
                  bytes[2] === 0xff
                ) {
                  mimeType = 'image/jpeg';
                } else if (
                  bytes[0] === 0x89 &&
                  bytes[1] === 0x50 &&
                  bytes[2] === 0x4e &&
                  bytes[3] === 0x47
                ) {
                  mimeType = 'image/png';
                } else if (
                  bytes[0] === 0x47 &&
                  bytes[1] === 0x49 &&
                  bytes[2] === 0x46
                ) {
                  mimeType = 'image/gif';
                } else if (
                  bytes[0] === 0x52 &&
                  bytes[1] === 0x49 &&
                  bytes[2] === 0x46 &&
                  bytes[3] === 0x46
                ) {
                  // WebP detected - skip it as Word doesn't support WebP
                  continue;
                } else {
                  // Default to JPEG for unknown formats
                  mimeType = 'image/jpeg';
                }
              }

              childVNode.properties.src = `data:${mimeType};base64,${base64String}`;
            } else {
              break;
            }
          } else if (imageSource?.startsWith('data:')) {
            const match = imageSource.match(
              /^data:([A-Za-z-+/]+);base64,(.+)$/
            );
            if (match) {
              base64String = match[2];
            } else {
              break;
            }
          } else {
            break;
          }

          // Convert base64 to Uint8Array for browser compatibility
          const binaryString = atob(decodeURIComponent(base64String));
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const imageProperties = getImageDimensions(bytes);

          modifiedAttributes.maximumWidth =
            modifiedAttributes.maximumWidth ||
            docxDocumentInstance.availableDocumentSpace;
          modifiedAttributes.originalWidth = imageProperties.width;
          modifiedAttributes.originalHeight = imageProperties.height;

          computeImageDimensions(childVNode, modifiedAttributes);
        }
        const runOrHyperlinkFragments = await buildRunOrHyperLink(
          childVNode,
          isVNode(childVNode) && childVNode.tagName === 'img'
            ? {
                ...modifiedAttributes,
                type: 'picture',
                description: childVNode.properties.alt,
              }
            : modifiedAttributes,
          docxDocumentInstance
        );
        if (Array.isArray(runOrHyperlinkFragments)) {
          for (
            let iteratorIndex = 0;
            iteratorIndex < runOrHyperlinkFragments.length;
            iteratorIndex++
          ) {
            const runOrHyperlinkFragment =
              runOrHyperlinkFragments[iteratorIndex];

            paragraphFragment.import(runOrHyperlinkFragment);
          }
        } else {
          paragraphFragment.import(runOrHyperlinkFragments);
        }
      }
    }
  } else {
    // In case paragraphs has to be rendered where vText is present. Eg. table-cell
    // Or in case the vNode is something like img
    if (isVNode(vNode) && vNode.tagName === 'img') {
      const imageSource = vNode.properties.src;

      // Skip WebP images - Word doesn't support WebP format
      if (
        imageSource &&
        (imageSource.includes('.webp') || imageSource.includes('image/webp'))
      ) {
        paragraphFragment.up();
        return paragraphFragment;
      }

      let base64String = imageSource;
      if (isValidUrl(imageSource)) {
        base64String = await imageToBase64(imageSource).catch(() => {});

        if (base64String) {
          // Try to get MIME type from URL extension first
          let mimeType = mimeTypes.lookup(imageSource);

          // Skip WebP images even if detected from extension
          if (mimeType === 'image/webp') {
            paragraphFragment.up();
            return paragraphFragment;
          }

          // If no extension or couldn't determine MIME type, detect from magic bytes
          if (!mimeType) {
            const binaryStr = atob(base64String.substring(0, 16));
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
              bytes[i] = binaryStr.charCodeAt(i);
            }
            // Check magic bytes
            if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
              mimeType = 'image/jpeg';
            } else if (
              bytes[0] === 0x89 &&
              bytes[1] === 0x50 &&
              bytes[2] === 0x4e &&
              bytes[3] === 0x47
            ) {
              mimeType = 'image/png';
            } else if (
              bytes[0] === 0x47 &&
              bytes[1] === 0x49 &&
              bytes[2] === 0x46
            ) {
              mimeType = 'image/gif';
            } else if (
              bytes[0] === 0x52 &&
              bytes[1] === 0x49 &&
              bytes[2] === 0x46 &&
              bytes[3] === 0x46
            ) {
              // WebP detected - skip it
              paragraphFragment.up();
              return paragraphFragment;
            } else {
              // Default to JPEG for unknown formats
              mimeType = 'image/jpeg';
            }
          }

          vNode.properties.src = `data:${mimeType};base64,${base64String}`;
        } else {
          paragraphFragment.up();
          return paragraphFragment;
        }
      } else {
        base64String = base64String.match(
          /^data:([A-Za-z-+/]+);base64,(.+)$/
        )[2];
      }

      // Convert base64 to Uint8Array for browser compatibility
      const binaryString = atob(decodeURIComponent(base64String));
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const imageProperties = getImageDimensions(bytes);

      modifiedAttributes.maximumWidth =
        modifiedAttributes.maximumWidth ||
        docxDocumentInstance.availableDocumentSpace;
      modifiedAttributes.originalWidth = imageProperties.width;
      modifiedAttributes.originalHeight = imageProperties.height;

      computeImageDimensions(vNode, modifiedAttributes);
    }
    const runFragments = await buildRunOrRuns(
      vNode,
      modifiedAttributes,
      docxDocumentInstance
    );
    if (Array.isArray(runFragments)) {
      for (let index = 0; index < runFragments.length; index++) {
        const runFragment = runFragments[index];

        paragraphFragment.import(runFragment);
      }
    } else {
      paragraphFragment.import(runFragments);
    }
  }

  // Add bookmark end if bookmarkId was provided
  if (bookmarkId && bookmarkNumericId !== null) {
    const bookmarkEndFragment = fragment({
      namespaceAlias: { w: namespaces.w },
    })
      .ele('@w', 'bookmarkEnd')
      .att('@w', 'id', String(bookmarkNumericId))
      .up();
    paragraphFragment.import(bookmarkEndFragment);
  }

  paragraphFragment.up();

  return paragraphFragment;
};

const buildGridSpanFragment = (spanValue) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'gridSpan')
    .att('@w', 'val', spanValue)
    .up();

const buildTableCellSpacing = (cellSpacing = 0) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'tblCellSpacing')
    .att('@w', 'w', cellSpacing)
    .att('@w', 'type', 'dxa')
    .up();

const buildTableCellBorders = (tableCellBorder) => {
  const tableCellBordersFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tcBorders');

  const { color, stroke, ...borders } = tableCellBorder;
  Object.keys(borders).forEach((border) => {
    if (tableCellBorder[border]) {
      const borderFragment = buildBorder(
        border,
        tableCellBorder[border],
        0,
        color,
        stroke
      );
      tableCellBordersFragment.import(borderFragment);
    }
  });

  tableCellBordersFragment.up();

  return tableCellBordersFragment;
};

const buildTableCellWidth = (tableCellWidth) => {
  const widthInfo = fixupColumnWidth(tableCellWidth);
  if (!widthInfo) return null;

  return fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'tcW')
    .att('@w', 'w', String(widthInfo.value))
    .att('@w', 'type', widthInfo.type)
    .up();
};

const buildTableCellProperties = (attributes) => {
  const tableCellPropertiesFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tcPr');
  if (attributes && attributes.constructor === Object) {
    Object.keys(attributes).forEach((key) => {
      switch (key) {
        case 'backgroundColor': {
          const shadingFragment = buildShading(attributes[key]);
          tableCellPropertiesFragment.import(shadingFragment);

          attributes.backgroundColor = undefined;
          break;
        }
        case 'verticalAlign': {
          const verticalAlignmentFragment = buildVerticalAlignment(
            attributes[key]
          );
          tableCellPropertiesFragment.import(verticalAlignmentFragment);

          attributes.verticalAlign = undefined;
          break;
        }
        case 'colSpan': {
          const gridSpanFragment = buildGridSpanFragment(attributes[key]);
          tableCellPropertiesFragment.import(gridSpanFragment);

          attributes.colSpan = undefined;
          break;
        }
        case 'tableCellBorder': {
          const tableCellBorderFragment = buildTableCellBorders(
            attributes[key]
          );
          tableCellPropertiesFragment.import(tableCellBorderFragment);

          attributes.tableCellBorder = undefined;
          break;
        }
        case 'rowSpan': {
          const verticalMergeFragment = buildVerticalMerge(attributes[key]);
          tableCellPropertiesFragment.import(verticalMergeFragment);

          attributes.rowSpan = undefined;
          break;
        }
        case 'width': {
          const widthFragment = buildTableCellWidth(attributes[key]);
          if (widthFragment) {
            tableCellPropertiesFragment.import(widthFragment);
          }
          attributes.width = undefined;
          break;
        }
      }
    });
  }
  tableCellPropertiesFragment.up();

  return tableCellPropertiesFragment;
};

const fixupTableCellBorder = (vNode, attributes) => {
  if (Object.hasOwn(vNode.properties.style, 'border')) {
    if (
      vNode.properties.style.border === 'none' ||
      vNode.properties.style.border === 0
    ) {
      attributes.tableCellBorder = {};
    } else {
      const [borderSize, borderStroke, borderColor] = cssBorderParser(
        vNode.properties.style.border
      );

      attributes.tableCellBorder = {
        top: borderSize,
        left: borderSize,
        bottom: borderSize,
        right: borderSize,
        color: borderColor,
        stroke: borderStroke,
      };
    }
  }
  if (
    vNode.properties.style['border-top'] &&
    vNode.properties.style['border-top'] === '0'
  ) {
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      top: 0,
    };
  } else if (
    vNode.properties.style['border-top'] &&
    vNode.properties.style['border-top'] !== '0'
  ) {
    const [borderSize, borderStroke, borderColor] = cssBorderParser(
      vNode.properties.style['border-top']
    );
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      top: borderSize,
      color: borderColor,
      stroke: borderStroke,
    };
  }
  if (
    vNode.properties.style['border-left'] &&
    vNode.properties.style['border-left'] === '0'
  ) {
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      left: 0,
    };
  } else if (
    vNode.properties.style['border-left'] &&
    vNode.properties.style['border-left'] !== '0'
  ) {
    const [borderSize, borderStroke, borderColor] = cssBorderParser(
      vNode.properties.style['border-left']
    );
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      left: borderSize,
      color: borderColor,
      stroke: borderStroke,
    };
  }
  if (
    vNode.properties.style['border-bottom'] &&
    vNode.properties.style['border-bottom'] === '0'
  ) {
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      bottom: 0,
    };
  } else if (
    vNode.properties.style['border-bottom'] &&
    vNode.properties.style['border-bottom'] !== '0'
  ) {
    const [borderSize, borderStroke, borderColor] = cssBorderParser(
      vNode.properties.style['border-bottom']
    );
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      bottom: borderSize,
      color: borderColor,
      stroke: borderStroke,
    };
  }
  if (
    vNode.properties.style['border-right'] &&
    vNode.properties.style['border-right'] === '0'
  ) {
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      right: 0,
    };
  } else if (
    vNode.properties.style['border-right'] &&
    vNode.properties.style['border-right'] !== '0'
  ) {
    const [borderSize, borderStroke, borderColor] = cssBorderParser(
      vNode.properties.style['border-right']
    );
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      right: borderSize,
      color: borderColor,
      stroke: borderStroke,
    };
  }
};

const buildTableCell = async (
  vNode,
  attributes,
  rowSpanMap,
  columnIndex,
  docxDocumentInstance
) => {
  const tableCellFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tc');

  let modifiedAttributes = { ...attributes };
  if (isVNode(vNode) && vNode.properties) {
    if (vNode.properties.rowSpan) {
      rowSpanMap.set(columnIndex.index, {
        rowSpan: vNode.properties.rowSpan - 1,
        colSpan: 0,
      });
      modifiedAttributes.rowSpan = 'restart';
    } else {
      const previousSpanObject = rowSpanMap.get(columnIndex.index);
      rowSpanMap.set(
        columnIndex.index,

        {
          ...previousSpanObject,
          rowSpan: 0,
          colSpan: previousSpanObject?.colSpan || 0,
        }
      );
    }
    if (vNode.properties.colSpan || vNode.properties.style?.['column-span']) {
      modifiedAttributes.colSpan =
        vNode.properties.colSpan || vNode.properties.style?.['column-span'];
      const previousSpanObject = rowSpanMap.get(columnIndex.index);
      rowSpanMap.set(
        columnIndex.index,

        {
          ...previousSpanObject,
          colSpan: Number.parseInt(modifiedAttributes.colSpan, 10) || 0,
        }
      );
      columnIndex.index += Number.parseInt(modifiedAttributes.colSpan, 10) - 1;
    }
    if (vNode.properties.style) {
      modifiedAttributes = {
        ...modifiedAttributes,
        ...modifiedStyleAttributesBuilder(
          docxDocumentInstance,
          vNode,
          attributes
        ),
      };

      fixupTableCellBorder(vNode, modifiedAttributes);
    }
  }
  const tableCellPropertiesFragment =
    buildTableCellProperties(modifiedAttributes);
  tableCellFragment.import(tableCellPropertiesFragment);
  if (vNodeHasChildren(vNode)) {
    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = vNode.children[index];
      if (isVNode(childVNode) && childVNode.tagName === 'img') {
        const imageFragment = await buildImage(
          docxDocumentInstance,
          childVNode,
          modifiedAttributes.maximumWidth
        );
        if (imageFragment) {
          tableCellFragment.import(imageFragment);
        }
      } else if (isVNode(childVNode) && childVNode.tagName === 'figure') {
        if (vNodeHasChildren(childVNode)) {
          for (
            let iteratorIndex = 0;
            iteratorIndex < childVNode.children.length;
            iteratorIndex++
          ) {
            const grandChildVNode = childVNode.children[iteratorIndex];
            if (grandChildVNode.tagName === 'img') {
              const imageFragment = await buildImage(
                docxDocumentInstance,
                grandChildVNode,
                modifiedAttributes.maximumWidth
              );
              if (imageFragment) {
                tableCellFragment.import(imageFragment);
              }
            }
          }
        }
      } else if (
        isVNode(childVNode) &&
        ['ul', 'ol'].includes(childVNode.tagName)
      ) {
        // render list in table
        if (vNodeHasChildren(childVNode)) {
          await buildList(childVNode, docxDocumentInstance, tableCellFragment);
        }
      } else {
        const paragraphFragment = await buildParagraph(
          childVNode,
          modifiedAttributes,
          docxDocumentInstance
        );

        tableCellFragment.import(paragraphFragment);
      }
    }
  } else {
    // TODO: Figure out why building with buildParagraph() isn't working
    const paragraphFragment = fragment({ namespaceAlias: { w: namespaces.w } })
      .ele('@w', 'p')
      .up();
    tableCellFragment.import(paragraphFragment);
  }
  tableCellFragment.up();

  return tableCellFragment;
};

const buildRowSpanCell = (rowSpanMap, columnIndex, attributes) => {
  const rowSpanCellFragments = [];
  let spanObject = rowSpanMap.get(columnIndex.index);
  while (spanObject?.rowSpan) {
    const rowSpanCellFragment = fragment({
      namespaceAlias: { w: namespaces.w },
    }).ele('@w', 'tc');

    const tableCellPropertiesFragment = buildTableCellProperties({
      ...attributes,
      rowSpan: 'continue',
      colSpan: spanObject.colSpan ? spanObject.colSpan : 0,
    });
    rowSpanCellFragment.import(tableCellPropertiesFragment);

    const paragraphFragment = fragment({ namespaceAlias: { w: namespaces.w } })
      .ele('@w', 'p')
      .up();
    rowSpanCellFragment.import(paragraphFragment);
    rowSpanCellFragment.up();

    rowSpanCellFragments.push(rowSpanCellFragment);

    if (spanObject.rowSpan - 1 === 0) {
      rowSpanMap.delete(columnIndex.index);
    } else {
      rowSpanMap.set(columnIndex.index, {
        rowSpan: spanObject.rowSpan - 1,
        colSpan: spanObject.colSpan || 0,
      });
    }
    columnIndex.index += spanObject.colSpan || 1;
    spanObject = rowSpanMap.get(columnIndex.index);
  }

  return rowSpanCellFragments;
};

const buildTableRowProperties = (attributes) => {
  const tableRowPropertiesFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'trPr');
  if (attributes && attributes.constructor === Object) {
    Object.keys(attributes).forEach((key) => {
      switch (key) {
        case 'tableRowHeight': {
          const tableRowHeightFragment = buildTableRowHeight(attributes[key]);
          tableRowPropertiesFragment.import(tableRowHeightFragment);

          attributes.tableRowHeight = undefined;
          break;
        }
        case 'rowCantSplit':
          if (attributes.rowCantSplit) {
            const cantSplitFragment = fragment({
              namespaceAlias: { w: namespaces.w },
            })
              .ele('@w', 'cantSplit')
              .up();
            tableRowPropertiesFragment.import(cantSplitFragment);

            attributes.rowCantSplit = undefined;
          }
          break;
      }
    });
  }
  tableRowPropertiesFragment.up();
  return tableRowPropertiesFragment;
};

const buildTableRow = async (
  vNode,
  attributes,
  rowSpanMap,
  docxDocumentInstance
) => {
  const tableRowFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tr');
  const modifiedAttributes = { ...attributes };
  if (isVNode(vNode) && vNode.properties) {
    // FIXME: find a better way to get row height from cell style
    if (
      vNode.properties.style?.height ||
      (vNode.children[0] &&
        isVNode(vNode.children[0]) &&
        vNode.children[0].properties.style &&
        vNode.children[0].properties.style.height)
    ) {
      modifiedAttributes.tableRowHeight = fixupRowHeight(
        vNode.properties.style?.height ||
          (vNode.children[0] &&
          isVNode(vNode.children[0]) &&
          vNode.children[0].properties.style &&
          vNode.children[0].properties.style.height
            ? vNode.children[0].properties.style.height
            : undefined)
      );
    }
    if (vNode.properties.style) {
      fixupTableCellBorder(vNode, modifiedAttributes);
    }
  }

  const tableRowPropertiesFragment =
    buildTableRowProperties(modifiedAttributes);
  tableRowFragment.import(tableRowPropertiesFragment);

  const columnIndex = { index: 0 };

  if (vNodeHasChildren(vNode)) {
    const tableColumns = vNode.children.filter((childVNode) =>
      ['td', 'th'].includes(childVNode.tagName)
    );
    const maximumColumnWidth =
      docxDocumentInstance.availableDocumentSpace / tableColumns.length;

    for (const column of tableColumns) {
      const rowSpanCellFragments = buildRowSpanCell(
        rowSpanMap,
        columnIndex,
        modifiedAttributes
      );
      if (Array.isArray(rowSpanCellFragments)) {
        for (
          let iteratorIndex = 0;
          iteratorIndex < rowSpanCellFragments.length;
          iteratorIndex++
        ) {
          const rowSpanCellFragment = rowSpanCellFragments[iteratorIndex];

          tableRowFragment.import(rowSpanCellFragment);
        }
      }
      const tableCellFragment = await buildTableCell(
        column,
        { ...modifiedAttributes, maximumWidth: maximumColumnWidth },
        rowSpanMap,
        columnIndex,
        docxDocumentInstance
      );
      columnIndex.index++;

      tableRowFragment.import(tableCellFragment);
    }
  }

  if (columnIndex.index < rowSpanMap.size) {
    const rowSpanCellFragments = buildRowSpanCell(
      rowSpanMap,
      columnIndex,
      modifiedAttributes
    );
    if (Array.isArray(rowSpanCellFragments)) {
      for (
        let iteratorIndex = 0;
        iteratorIndex < rowSpanCellFragments.length;
        iteratorIndex++
      ) {
        const rowSpanCellFragment = rowSpanCellFragments[iteratorIndex];

        tableRowFragment.import(rowSpanCellFragment);
      }
    }
  }

  tableRowFragment.up();

  return tableRowFragment;
};

const buildTableGridCol = (gridWidth) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'gridCol')
    .att('@w', 'w', String(gridWidth));

const buildTableGrid = (vNode, attributes) => {
  const tableGridFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tblGrid');
  if (vNodeHasChildren(vNode)) {
    const gridColumns = vNode.children.filter(
      (childVNode) => childVNode.tagName === 'col'
    );
    const gridWidth = attributes.maximumWidth / gridColumns.length;

    for (let index = 0; index < gridColumns.length; index++) {
      const tableGridColFragment = buildTableGridCol(gridWidth);
      tableGridFragment.import(tableGridColFragment);
    }
  }
  tableGridFragment.up();

  return tableGridFragment;
};

const buildTableGridFromTableRow = (vNode, attributes) => {
  const tableGridFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tblGrid');
  if (vNodeHasChildren(vNode)) {
    const numberOfGridColumns = vNode.children.reduce(
      (accumulator, childVNode) => {
        const colSpan =
          childVNode.properties.colSpan ||
          childVNode.properties.style?.['column-span'];

        return accumulator + (colSpan ? Number.parseInt(colSpan, 10) : 1);
      },
      0
    );
    const gridWidth = attributes.maximumWidth / numberOfGridColumns;

    for (let index = 0; index < numberOfGridColumns; index++) {
      const tableGridColFragment = buildTableGridCol(gridWidth);
      tableGridFragment.import(tableGridColFragment);
    }
  }
  tableGridFragment.up();

  return tableGridFragment;
};

const buildTableBorders = (tableBorder) => {
  const tableBordersFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tblBorders');

  const { color, stroke, ...borders } = tableBorder;

  Object.keys(borders).forEach((border) => {
    if (borders[border]) {
      const borderFragment = buildBorder(
        border,
        borders[border],
        0,
        color,
        stroke
      );
      tableBordersFragment.import(borderFragment);
    }
  });

  tableBordersFragment.up();

  return tableBordersFragment;
};

const buildTableWidth = (tableWidth) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'tblW')
    .att('@w', 'type', 'dxa')
    .att('@w', 'w', String(tableWidth))
    .up();

const buildCellMargin = (side, margin) =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', side)
    .att('@w', 'type', 'dxa')
    .att('@w', 'w', String(margin))
    .up();

const buildTableCellMargins = (margin) => {
  const tableCellMarFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tblCellMar');

  ['top', 'bottom'].forEach((side) => {
    const marginFragment = buildCellMargin(side, margin / 2);
    tableCellMarFragment.import(marginFragment);
  });
  ['left', 'right'].forEach((side) => {
    const marginFragment = buildCellMargin(side, margin);
    tableCellMarFragment.import(marginFragment);
  });

  return tableCellMarFragment;
};

const buildTableProperties = (attributes) => {
  const tablePropertiesFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tblPr');

  if (attributes && attributes.constructor === Object) {
    Object.keys(attributes).forEach((key) => {
      switch (key) {
        case 'tableBorder': {
          const tableBordersFragment = buildTableBorders(attributes[key]);
          tablePropertiesFragment.import(tableBordersFragment);

          attributes.tableBorder = undefined;
          break;
        }
        case 'tableCellSpacing': {
          const tableCellSpacingFragment = buildTableCellSpacing(
            attributes[key]
          );
          tablePropertiesFragment.import(tableCellSpacingFragment);

          attributes.tableCellSpacing = undefined;
          break;
        }
        case 'width':
          if (attributes[key]) {
            const tableWidthFragment = buildTableWidth(attributes[key]);
            tablePropertiesFragment.import(tableWidthFragment);
          }

          attributes.width = undefined;
          break;
      }
    });
  }
  const tableCellMarginFragment = buildTableCellMargins(160);
  tablePropertiesFragment.import(tableCellMarginFragment);

  // by default, all tables are center aligned.
  const alignmentFragment = buildHorizontalAlignment('center');
  tablePropertiesFragment.import(alignmentFragment);

  tablePropertiesFragment.up();

  return tablePropertiesFragment;
};

const cssBorderParser = (borderString) => {
  // Handle 'none' border - return 0 size with valid defaults
  if (
    borderString === 'none' ||
    borderString === '0' ||
    borderString === '0px'
  ) {
    return [0, 'single', '000000'];
  }

  let [size, stroke, color] = borderString.split(' ');

  // Handle 'none' as first value (e.g., 'none solid black')
  if (size === 'none' || size === '0') {
    return [0, 'single', '000000'];
  }

  if (pointRegex.test(size)) {
    const matchedParts = size.match(pointRegex);
    // convert point to eighth of a point
    size = pointToEIP(matchedParts[1]);
  } else if (pixelRegex.test(size)) {
    const matchedParts = size.match(pixelRegex);
    // convert pixels to eighth of a point
    size = pixelToEIP(matchedParts[1]);
  }
  stroke =
    stroke && ['dashed', 'dotted', 'double'].includes(stroke)
      ? stroke
      : 'single';

  color = color && fixupColorCode(color).toUpperCase();

  return [size, stroke, color];
};

const buildTable = async (vNode, attributes, docxDocumentInstance) => {
  const tableFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele(
    '@w',
    'tbl'
  );
  const modifiedAttributes = { ...attributes };
  if (isVNode(vNode) && vNode.properties) {
    const tableAttributes = vNode.properties.attributes || {};
    const tableStyles = vNode.properties.style || {};
    const tableBorders = {};
    const tableCellBorders = {};
    let [borderSize, borderStrike, borderColor] = [2, 'single', '000000'];

    if (!Number.isNaN(tableAttributes.border)) {
      borderSize = Number.parseInt(tableAttributes.border, 10);
    }

    // css style overrides table border properties
    if (tableStyles.border) {
      const [cssSize, cssStroke, cssColor] = cssBorderParser(
        tableStyles.border
      );
      // Use nullish check to allow 0 as valid border size
      borderSize =
        cssSize !== undefined && cssSize !== null ? cssSize : borderSize;
      borderColor = cssColor || borderColor;
      borderStrike = cssStroke || borderStrike;
    }

    tableBorders.top = borderSize;
    tableBorders.bottom = borderSize;
    tableBorders.left = borderSize;
    tableBorders.right = borderSize;
    tableBorders.stroke = borderStrike;
    tableBorders.color = borderColor;

    if (tableStyles['border-collapse'] === 'collapse') {
      tableBorders.insideV = borderSize;
      tableBorders.insideH = borderSize;
    } else {
      tableBorders.insideV = 0;
      tableBorders.insideH = 0;
      tableCellBorders.top = 1;
      tableCellBorders.bottom = 1;
      tableCellBorders.left = 1;
      tableCellBorders.right = 1;
    }

    modifiedAttributes.tableBorder = tableBorders;
    modifiedAttributes.tableCellSpacing = 0;

    if (Object.keys(tableCellBorders).length) {
      modifiedAttributes.tableCellBorder = tableCellBorders;
    }

    let minimumWidth;
    let maximumWidth;
    let width;
    // Calculate minimum width of table
    if (pixelRegex.test(tableStyles['min-width'])) {
      minimumWidth = pixelToTWIP(tableStyles['min-width'].match(pixelRegex)[1]);
    } else if (percentageRegex.test(tableStyles['min-width'])) {
      const percentageValue =
        tableStyles['min-width'].match(percentageRegex)[1];
      minimumWidth = Math.round(
        (percentageValue / 100) * attributes.maximumWidth
      );
    }

    // Calculate maximum width of table
    if (pixelRegex.test(tableStyles['max-width'])) {
      pixelRegex.lastIndex = 0;
      maximumWidth = pixelToTWIP(tableStyles['max-width'].match(pixelRegex)[1]);
    } else if (percentageRegex.test(tableStyles['max-width'])) {
      percentageRegex.lastIndex = 0;
      const percentageValue =
        tableStyles['max-width'].match(percentageRegex)[1];
      maximumWidth = Math.round(
        (percentageValue / 100) * attributes.maximumWidth
      );
    }

    // Calculate specified width of table
    if (pixelRegex.test(tableStyles.width)) {
      pixelRegex.lastIndex = 0;
      width = pixelToTWIP(tableStyles.width.match(pixelRegex)[1]);
    } else if (percentageRegex.test(tableStyles.width)) {
      percentageRegex.lastIndex = 0;
      const percentageValue = tableStyles.width.match(percentageRegex)[1];
      width = Math.round((percentageValue / 100) * attributes.maximumWidth);
    }

    // If width isn't supplied, we should have min-width as the width.
    if (width) {
      modifiedAttributes.width = width;
      if (maximumWidth) {
        modifiedAttributes.width = Math.min(
          modifiedAttributes.width,
          maximumWidth
        );
      }
      if (minimumWidth) {
        modifiedAttributes.width = Math.max(
          modifiedAttributes.width,
          minimumWidth
        );
      }
    } else if (minimumWidth) {
      modifiedAttributes.width = minimumWidth;
    }
    if (modifiedAttributes.width) {
      modifiedAttributes.width = Math.min(
        modifiedAttributes.width,
        attributes.maximumWidth
      );
    }
  }
  const tablePropertiesFragment = buildTableProperties(modifiedAttributes);
  tableFragment.import(tablePropertiesFragment);

  const rowSpanMap = new Map();

  if (vNodeHasChildren(vNode)) {
    for (let index = 0; index < vNode.children.length; index++) {
      const childVNode = vNode.children[index];
      if (childVNode.tagName === 'colgroup') {
        const tableGridFragment = buildTableGrid(
          childVNode,
          modifiedAttributes
        );
        tableFragment.import(tableGridFragment);
      } else if (childVNode.tagName === 'thead') {
        for (
          let iteratorIndex = 0;
          iteratorIndex < childVNode.children.length;
          iteratorIndex++
        ) {
          const grandChildVNode = childVNode.children[iteratorIndex];
          if (grandChildVNode.tagName === 'tr') {
            if (iteratorIndex === 0) {
              const tableGridFragment = buildTableGridFromTableRow(
                grandChildVNode,
                modifiedAttributes
              );
              tableFragment.import(tableGridFragment);
            }
            const tableRowFragment = await buildTableRow(
              grandChildVNode,
              modifiedAttributes,
              rowSpanMap,
              docxDocumentInstance
            );
            tableFragment.import(tableRowFragment);
          }
        }
      } else if (childVNode.tagName === 'tbody') {
        for (
          let iteratorIndex = 0;
          iteratorIndex < childVNode.children.length;
          iteratorIndex++
        ) {
          const grandChildVNode = childVNode.children[iteratorIndex];
          if (grandChildVNode.tagName === 'tr') {
            if (iteratorIndex === 0) {
              const tableGridFragment = buildTableGridFromTableRow(
                grandChildVNode,
                modifiedAttributes
              );
              tableFragment.import(tableGridFragment);
            }
            const tableRowFragment = await buildTableRow(
              grandChildVNode,
              modifiedAttributes,
              rowSpanMap,
              docxDocumentInstance
            );
            tableFragment.import(tableRowFragment);
          }
        }
      } else if (childVNode.tagName === 'tr') {
        if (index === 0) {
          const tableGridFragment = buildTableGridFromTableRow(
            childVNode,
            modifiedAttributes
          );
          tableFragment.import(tableGridFragment);
        }
        const tableRowFragment = await buildTableRow(
          childVNode,
          modifiedAttributes,
          rowSpanMap,
          docxDocumentInstance
        );
        tableFragment.import(tableRowFragment);
      }
    }
  }
  tableFragment.up();

  return tableFragment;
};

// Common namespace aliases for all drawing-related elements
const drawingNamespaces = {
  w: namespaces.w,
  wp: namespaces.wp,
  a: namespaces.a,
  pic: namespaces.pic,
  r: namespaces.r,
};

const buildPresetGeometry = () =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.a, 'prstGeom')
    .att('prst', 'rect')
    .up();

const buildExtents = ({ width, height }) => {
  // Default to 100x100 pixels in EMU if dimensions are missing
  const defaultSize = 952_500;
  // Ensure valid numeric values (handle undefined, null, NaN, 0)
  const cx =
    typeof width === 'number' && width > 0 && !Number.isNaN(width)
      ? width
      : defaultSize;
  const cy =
    typeof height === 'number' && height > 0 && !Number.isNaN(height)
      ? height
      : defaultSize;
  return fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.a, 'ext')
    .att('cx', String(cx))
    .att('cy', String(cy))
    .up();
};

const buildOffset = () =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.a, 'off')
    .att('x', '0')
    .att('y', '0')
    .up();

const buildGraphicFrameTransform = (attributes) => {
  const graphicFrameTransformFragment = fragment({
    namespaceAlias: drawingNamespaces,
  }).ele(namespaces.a, 'xfrm');

  const offsetFragment = buildOffset();
  graphicFrameTransformFragment.import(offsetFragment);
  const extentsFragment = buildExtents(attributes);
  graphicFrameTransformFragment.import(extentsFragment);

  graphicFrameTransformFragment.up();

  return graphicFrameTransformFragment;
};

const buildShapeProperties = (attributes) => {
  const shapeProperties = fragment({
    namespaceAlias: drawingNamespaces,
  }).ele(namespaces.pic, 'spPr');

  const graphicFrameTransformFragment = buildGraphicFrameTransform(attributes);
  shapeProperties.import(graphicFrameTransformFragment);
  const presetGeometryFragment = buildPresetGeometry();
  shapeProperties.import(presetGeometryFragment);

  shapeProperties.up();

  return shapeProperties;
};

const buildFillRect = () =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.a, 'fillRect')
    .up();

const buildStretch = () => {
  const stretchFragment = fragment({ namespaceAlias: drawingNamespaces }).ele(
    namespaces.a,
    'stretch'
  );

  const fillRectFragment = buildFillRect();
  stretchFragment.import(fillRectFragment);

  stretchFragment.up();

  return stretchFragment;
};

const buildSrcRectFragment = () =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.a, 'srcRect')
    .att('b', '0')
    .att('l', '0')
    .att('r', '0')
    .att('t', '0')
    .up();

const buildBinaryLargeImageOrPicture = (relationshipId) =>
  fragment({
    namespaceAlias: drawingNamespaces,
  })
    .ele(namespaces.a, 'blip')
    .att(namespaces.r, 'embed', `rId${relationshipId}`)
    // FIXME: possible values 'email', 'none', 'print', 'hqprint', 'screen'
    .att('cstate', 'print')
    .up();

const buildBinaryLargeImageOrPictureFill = (relationshipId) => {
  const binaryLargeImageOrPictureFillFragment = fragment({
    namespaceAlias: drawingNamespaces,
  }).ele(namespaces.pic, 'blipFill');
  const binaryLargeImageOrPictureFragment =
    buildBinaryLargeImageOrPicture(relationshipId);
  binaryLargeImageOrPictureFillFragment.import(
    binaryLargeImageOrPictureFragment
  );
  const srcRectFragment = buildSrcRectFragment();
  binaryLargeImageOrPictureFillFragment.import(srcRectFragment);
  const stretchFragment = buildStretch();
  binaryLargeImageOrPictureFillFragment.import(stretchFragment);

  binaryLargeImageOrPictureFillFragment.up();

  return binaryLargeImageOrPictureFillFragment;
};

const buildNonVisualPictureDrawingProperties = () =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.pic, 'cNvPicPr')
    .up();

const buildNonVisualDrawingProperties = (
  pictureId,
  pictureNameWithExtension,
  pictureDescription = ''
) =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.pic, 'cNvPr')
    .att('id', pictureId)
    .att('name', pictureNameWithExtension)
    .att('descr', pictureDescription)
    .up();

const buildNonVisualPictureProperties = (
  pictureId,
  pictureNameWithExtension,
  pictureDescription
) => {
  const nonVisualPicturePropertiesFragment = fragment({
    namespaceAlias: drawingNamespaces,
  }).ele(namespaces.pic, 'nvPicPr');
  // TODO: Handle picture attributes
  const nonVisualDrawingPropertiesFragment = buildNonVisualDrawingProperties(
    pictureId,
    pictureNameWithExtension,
    pictureDescription
  );
  nonVisualPicturePropertiesFragment.import(nonVisualDrawingPropertiesFragment);
  const nonVisualPictureDrawingPropertiesFragment =
    buildNonVisualPictureDrawingProperties();
  nonVisualPicturePropertiesFragment.import(
    nonVisualPictureDrawingPropertiesFragment
  );
  nonVisualPicturePropertiesFragment.up();

  return nonVisualPicturePropertiesFragment;
};

const buildPicture = ({
  id,
  fileNameWithExtension,
  description,
  relationshipId,
  width,
  height,
}) => {
  const pictureFragment = fragment({
    namespaceAlias: drawingNamespaces,
  }).ele(namespaces.pic, 'pic');
  const nonVisualPicturePropertiesFragment = buildNonVisualPictureProperties(
    id,
    fileNameWithExtension,
    description
  );
  pictureFragment.import(nonVisualPicturePropertiesFragment);
  const binaryLargeImageOrPictureFill =
    buildBinaryLargeImageOrPictureFill(relationshipId);
  pictureFragment.import(binaryLargeImageOrPictureFill);
  const shapeProperties = buildShapeProperties({ width, height });
  pictureFragment.import(shapeProperties);
  pictureFragment.up();

  return pictureFragment;
};

const buildGraphicData = (graphicType, attributes) => {
  const graphicDataFragment = fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.a, 'graphicData')
    .att('uri', 'http://schemas.openxmlformats.org/drawingml/2006/picture');
  if (graphicType === 'picture') {
    const pictureFragment = buildPicture(attributes);
    graphicDataFragment.import(pictureFragment);
  }
  graphicDataFragment.up();

  return graphicDataFragment;
};

const buildGraphic = (graphicType, attributes) => {
  const graphicFragment = fragment({ namespaceAlias: drawingNamespaces }).ele(
    namespaces.a,
    'graphic'
  );
  // TODO: Handle drawing type
  const graphicDataFragment = buildGraphicData(graphicType, attributes);
  graphicFragment.import(graphicDataFragment);
  graphicFragment.up();

  return graphicFragment;
};

const buildDrawingObjectNonVisualProperties = (pictureId, pictureName) =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.wp, 'docPr')
    .att('id', pictureId)
    .att('name', pictureName)
    .up();

const buildWrapSquare = () =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.wp, 'wrapSquare')
    .att('wrapText', 'bothSides')
    .att('distB', '228600')
    .att('distT', '228600')
    .att('distL', '228600')
    .att('distR', '228600')
    .up();

const _buildWrapNone = () =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.wp, 'wrapNone')
    .up();

const buildEffectExtentFragment = () =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.wp, 'effectExtent')
    .att('b', '0')
    .att('l', '0')
    .att('r', '0')
    .att('t', '0')
    .up();

const buildExtent = ({ width, height }) => {
  // Default to 100x100 pixels in EMU (914400 EMU = 1 inch, 96 pixels = 1 inch)
  // So 100 pixels = 952500 EMU
  const defaultSize = 952_500;
  // Ensure valid numeric values (handle undefined, null, NaN, 0)
  const cx =
    typeof width === 'number' && width > 0 && !Number.isNaN(width)
      ? width
      : defaultSize;
  const cy =
    typeof height === 'number' && height > 0 && !Number.isNaN(height)
      ? height
      : defaultSize;
  return fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.wp, 'extent')
    .att('cx', String(cx))
    .att('cy', String(cy))
    .up();
};

const buildPositionV = () =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.wp, 'positionV')
    .att('relativeFrom', 'paragraph')
    .ele(namespaces.wp, 'posOffset')
    .txt('19050')
    .up()
    .up();

const buildPositionH = () =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.wp, 'positionH')
    .att('relativeFrom', 'column')
    .ele(namespaces.wp, 'posOffset')
    .txt('19050')
    .up()
    .up();

const buildSimplePos = () =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.wp, 'simplePos')
    .att('x', '0')
    .att('y', '0')
    .up();

const buildAnchoredDrawing = (graphicType, attributes) => {
  const anchoredDrawingFragment = fragment({
    namespaceAlias: drawingNamespaces,
  })
    .ele(namespaces.wp, 'anchor')
    .att('distB', '0')
    .att('distL', '0')
    .att('distR', '0')
    .att('distT', '0')
    .att('relativeHeight', '0')
    .att('behindDoc', 'false')
    .att('locked', 'true')
    .att('layoutInCell', 'true')
    .att('allowOverlap', 'false')
    .att('simplePos', 'false');
  // Even though simplePos isnt supported by Word 2007 simplePos is required.
  const simplePosFragment = buildSimplePos();
  anchoredDrawingFragment.import(simplePosFragment);
  const positionHFragment = buildPositionH();
  anchoredDrawingFragment.import(positionHFragment);
  const positionVFragment = buildPositionV();
  anchoredDrawingFragment.import(positionVFragment);
  const extentFragment = buildExtent({
    width: attributes.width,
    height: attributes.height,
  });
  anchoredDrawingFragment.import(extentFragment);
  const effectExtentFragment = buildEffectExtentFragment();
  anchoredDrawingFragment.import(effectExtentFragment);
  const wrapSquareFragment = buildWrapSquare();
  anchoredDrawingFragment.import(wrapSquareFragment);
  const drawingObjectNonVisualPropertiesFragment =
    buildDrawingObjectNonVisualProperties(
      attributes.id,
      attributes.fileNameWithExtension
    );
  anchoredDrawingFragment.import(drawingObjectNonVisualPropertiesFragment);
  const graphicFragment = buildGraphic(graphicType, attributes);
  anchoredDrawingFragment.import(graphicFragment);

  anchoredDrawingFragment.up();

  return anchoredDrawingFragment;
};

const buildInlineDrawing = (graphicType, attributes) => {
  const inlineDrawingFragment = fragment({
    namespaceAlias: drawingNamespaces,
  })
    .ele(namespaces.wp, 'inline')
    .att('distB', '0')
    .att('distL', '0')
    .att('distR', '0')
    .att('distT', '0');

  const extentFragment = buildExtent({
    width: attributes.width,
    height: attributes.height,
  });
  inlineDrawingFragment.import(extentFragment);
  const effectExtentFragment = buildEffectExtentFragment();
  inlineDrawingFragment.import(effectExtentFragment);
  const drawingObjectNonVisualPropertiesFragment =
    buildDrawingObjectNonVisualProperties(
      attributes.id,
      attributes.fileNameWithExtension
    );
  inlineDrawingFragment.import(drawingObjectNonVisualPropertiesFragment);
  const graphicFragment = buildGraphic(graphicType, attributes);
  inlineDrawingFragment.import(graphicFragment);

  inlineDrawingFragment.up();

  return inlineDrawingFragment;
};

const buildDrawing = (inlineOrAnchored, graphicType, attributes) => {
  // Declare all necessary namespaces for drawing elements
  const drawingFragment = fragment({
    namespaceAlias: drawingNamespaces,
  }).ele('@w', 'drawing');
  const inlineOrAnchoredDrawingFragment = inlineOrAnchored
    ? buildInlineDrawing(graphicType, attributes)
    : buildAnchoredDrawing(graphicType, attributes);
  drawingFragment.import(inlineOrAnchoredDrawingFragment);
  drawingFragment.up();

  return drawingFragment;
};

export {
  buildParagraph,
  buildTable,
  buildNumberingInstances,
  buildLineBreak,
  buildIndentation,
  buildTextElement,
  buildBold,
  buildItalics,
  buildUnderline,
  buildDrawing,
  fixupLineHeight,
};
