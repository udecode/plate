/* biome-ignore-all lint/nursery/useMaxParams: legacy code */
/** biome-ignore-all lint/style/useAtIndex: legacy code */
/* biome-ignore-all lint/performance/useTopLevelRegex: legacy code */
/* biome-ignore-all lint/style/noParameterAssign: legacy code */
/* biome-ignore-all lint/style/useForOf: legacy code */
import { cloneDeep } from 'lodash';
// @ts-expect-error - no types available
import mimeTypes from 'mime-types';
// @ts-expect-error - no types available
import isVNode from 'virtual-dom/vnode/is-vnode';
// @ts-expect-error - no types available
import isVText from 'virtual-dom/vnode/is-vtext';
import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
import { fragment } from 'xmlbuilder2';

type XMLBuilderType = XMLBuilder;

// @ts-expect-error - no types available
import colorNames from 'color-name';

import {
  colorlessColors,
  defaultFont,
  hyperlinkType,
  imageType,
  internalRelationship,
  paragraphBordersObject,
  verticalAlignValues,
} from '../constants';
import {
  buildCommentRangeEnd,
  buildCommentRangeStart,
  buildCommentReferenceRun,
  buildDeletedTextElement,
  ensureTrackingState,
  hasTrackingTokens,
  splitDocxTrackingTokens,
  wrapRunWithSuggestion,
  type ActiveSuggestion,
  type TrackingDocumentInstance,
} from '../tracking';
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
import { getImageDimensions } from '../utils/image-dimensions';
import imageToBase64 from '../utils/image-to-base64';
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

// Types for Virtual DOM
type VNodeProperties = {
  alt?: string;
  attributes?: Record<string, string>;
  colSpan?: number;
  href?: string;
  id?: string;
  rowSpan?: number;
  src?: string;
  style?: Record<string, string>;
};

type VNodeType = {
  children?: (VNodeType | VTextType)[];
  properties?: VNodeProperties;
  tagName?: string;
  [key: string]: unknown;
};

type VTextType = {
  text: string;
  [key: string]: unknown;
};

// Types for DocxDocumentInstance
type MediaFileResponse = {
  fileContent: string;
  fileNameWithExtension: string;
  id: number;
};

type DocxDocumentInstance = Partial<TrackingDocumentInstance> & {
  availableDocumentSpace: number;
  createDocumentRelationships: (
    filename: string,
    type: string,
    target: string,
    targetMode?: string
  ) => number;
  createFont: (fontFamily: string) => string;
  createMediaFile: (base64Uri: string) => MediaFileResponse;
  createNumbering: (type: 'ol' | 'ul', properties?: VNodeProperties) => number;
  htmlString: string;
  relationshipFilename: string;
  tableRowCantSplit: boolean;
  zip: {
    folder: (name: string) => {
      file: (
        name: string,
        content: Buffer,
        options?: { createFolders: boolean }
      ) => void;
      folder: (name: string) => {
        file: (
          name: string,
          content: Buffer,
          options?: { createFolders: boolean }
        ) => void;
      };
    };
  };
};

// Types for attributes and options
type Indentation = {
  left?: number;
  right?: number;
};

type NumberingInfo = {
  levelId: number;
  numberingId: number;
};

type TableCellBorder = {
  bottom?: number;
  color?: string;
  left?: number;
  right?: number;
  stroke?: string;
  top?: number;
};

interface TableBorder extends TableCellBorder {
  insideH?: number;
  insideV?: number;
}

type RunAttributes = {
  backgroundColor?: string;
  code?: boolean;
  color?: string;
  display?: string;
  font?: string;
  fontSize?: number;
  highlightColor?: string;
  hyperlink?: boolean;
  i?: boolean;
  kbd?: boolean;
  lineHeight?: number;
  mark?: boolean;
  strike?: boolean;
  strong?: boolean | string;
  sub?: boolean;
  sup?: boolean;
  u?: boolean;
  verticalAlign?: string;
  width?: number | string;
};

interface ParagraphAttributes extends RunAttributes {
  afterSpacing?: number;
  beforeSpacing?: number;
  blockquoteBorder?: boolean;
  bookmarkId?: string | null;
  colSpan?: number;
  description?: string;
  fileContent?: string;
  fileNameWithExtension?: string;
  height?: number;
  id?: number;
  indentation?: Indentation;
  inlineOrAnchored?: boolean;
  maximumWidth?: number;
  numbering?: NumberingInfo;
  originalHeight?: number;
  originalWidth?: number;
  paragraphStyle?: string;
  relationshipId?: number;
  rowSpan?: string;
  tableCellBorder?: TableCellBorder;
  textAlign?: string;
  type?: string;
  verticalAlign?: string;
  width?: number | string;
}

type TableAttributes = {
  maximumWidth?: number;
  rowCantSplit?: boolean;
  tableBorder?: TableBorder;
  tableCellBorder?: TableCellBorder;
  tableCellSpacing?: number;
  tableRowHeight?: number;
  width?: number;
};

type ColumnWidthInfo = {
  type: string;
  value: number;
};

type FormattingOptions = {
  color?: string;
  font?: string;
  fontSize?: number;
};

const fixupColorCode = (colorCodeString: string): string => {
  if (Object.hasOwn(colorNames, colorCodeString.toLowerCase())) {
    const [red, green, blue] =
      colorNames[colorCodeString.toLowerCase() as keyof typeof colorNames];

    return rgbToHex(red, green, blue);
  }
  if (rgbRegex.test(colorCodeString)) {
    const matchedParts = colorCodeString.match(rgbRegex);
    if (matchedParts) {
      const red = matchedParts[1];
      const green = matchedParts[2];
      const blue = matchedParts[3];

      return rgbToHex(
        Number.parseInt(red, 10),
        Number.parseInt(green, 10),
        Number.parseInt(blue, 10)
      );
    }
  }
  if (hslRegex.test(colorCodeString)) {
    const matchedParts = colorCodeString.match(hslRegex);
    if (matchedParts) {
      const hue = matchedParts[1];
      const saturation = matchedParts[2];
      const luminosity = matchedParts[3];

      return hslToHex(
        Number.parseInt(hue, 10),
        Number.parseInt(saturation, 10),
        Number.parseInt(luminosity, 10)
      );
    }
  }
  if (hexRegex.test(colorCodeString)) {
    const matchedParts = colorCodeString.match(hexRegex);
    if (matchedParts) {
      return matchedParts[1];
    }
  }
  if (hex3Regex.test(colorCodeString)) {
    const matchedParts = colorCodeString.match(hex3Regex);
    if (matchedParts) {
      const red = matchedParts[1];
      const green = matchedParts[2];
      const blue = matchedParts[3];

      return hex3ToHex(red, green, blue);
    }
  }
  return '000000';
};

const buildRunFontFragment = (fontName: string = defaultFont): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'rFonts')
    .att('@w', 'ascii', fontName)
    .att('@w', 'hAnsi', fontName)
    .up();

const buildRunStyleFragment = (type = 'Hyperlink'): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'rStyle')
    .att('@w', 'val', type)
    .up();

const buildTableRowHeight = (tableRowHeight: number): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'trHeight')
    .att('@w', 'val', String(tableRowHeight))
    .att('@w', 'hRule', 'atLeast')
    .up();

const buildVerticalAlignment = (verticalAlignment: string): XMLBuilderType => {
  if (verticalAlignment.toLowerCase() === 'middle') {
    verticalAlignment = 'center';
  }

  return fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'vAlign')
    .att('@w', 'val', verticalAlignment)
    .up();
};

const buildVerticalMerge = (verticalMerge = 'continue'): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'vMerge')
    .att('@w', 'val', verticalMerge)
    .up();

const buildColor = (colorCode: string): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'color')
    .att('@w', 'val', colorCode)
    .up();

const buildFontSize = (fontSize: number): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'sz')
    .att('@w', 'val', String(fontSize))
    .up();

const buildShading = (colorCode: string): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'shd')
    .att('@w', 'val', 'clear')
    .att('@w', 'fill', colorCode)
    .up();

const buildHighlight = (color = 'yellow'): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'highlight')
    .att('@w', 'val', color)
    .up();

const buildVertAlign = (type = 'baseline'): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'vertAlign')
    .att('@w', 'val', type)
    .up();

const buildStrike = (): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'strike')
    .att('@w', 'val', 'true')
    .up();

const buildBold = (): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'b')
    .up();

const buildItalics = (): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'i')
    .up();

const buildUnderline = (type = 'single'): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'u')
    .att('@w', 'val', type)
    .up();

const buildLineBreak = (type = 'textWrapping'): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'br')
    .att('@w', 'type', type)
    .up();

const buildBorder = (
  borderSide = 'top',
  borderSize = 0,
  borderSpacing = 0,
  borderColor: string = fixupColorCode('black'),
  borderStroke = 'single'
): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', borderSide)
    .att('@w', 'val', borderStroke)
    .att('@w', 'sz', String(borderSize))
    .att('@w', 'space', String(borderSpacing))
    .att('@w', 'color', borderColor)
    .up();

const buildTextElement = (text: string): XMLBuilderType =>
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

/**
 * Build a text run fragment with run properties.
 * Used for building runs within tracked changes.
 */
const buildTextRunFragment = (
  text: string,
  attributes: RunAttributes,
  options?: { deleted?: boolean }
): XMLBuilderType => {
  const runFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele(
    '@w',
    'r'
  );
  const runPropertiesFragment = buildRunProperties(cloneDeep(attributes));

  runFragment.import(runPropertiesFragment);
  runFragment.import(
    options?.deleted ? buildDeletedTextElement(text) : buildTextElement(text)
  );
  runFragment.up();

  return runFragment;
};

/**
 * Build runs from text that may contain DOCX tracking tokens.
 * Handles insertions, deletions, and comments by parsing tokens
 * and generating appropriate XML structures.
 *
 * Returns null if text has no tracking tokens (use normal processing).
 */
const buildRunsFromTextWithTokens = (
  text: string,
  attributes: RunAttributes,
  docxDocumentInstance: DocxDocumentInstance
): XMLBuilderType[] | null => {
  // Check if document instance has tracking support
  if (
    !docxDocumentInstance.ensureComment ||
    !docxDocumentInstance.getCommentId ||
    !docxDocumentInstance.getRevisionId
  ) {
    return null;
  }

  const parts = splitDocxTrackingTokens(text);

  // If just a single text part, return null to use normal processing
  if (parts.length === 1 && parts[0].type === 'text') {
    return null;
  }

  const fragments: XMLBuilderType[] = [];
  const trackingState = ensureTrackingState(
    docxDocumentInstance as Required<
      Pick<
        DocxDocumentInstance,
        | '_trackingState'
        | 'comments'
        | 'commentIdMap'
        | 'lastCommentId'
        | 'revisionIdMap'
        | 'lastRevisionId'
        | 'ensureComment'
        | 'getCommentId'
        | 'getRevisionId'
      >
    >
  );

  for (const part of parts) {
    if (part.type === 'text') {
      if (!part.value) continue;

      const activeSuggestion: ActiveSuggestion | undefined =
        trackingState.suggestionStack[trackingState.suggestionStack.length - 1];
      const runFragment = buildTextRunFragment(part.value, attributes, {
        deleted: activeSuggestion?.type === 'remove',
      });

      fragments.push(
        activeSuggestion
          ? wrapRunWithSuggestion(runFragment, activeSuggestion)
          : runFragment
      );
      continue;
    }

    if (part.type === 'commentStart') {
      const data = part.data;
      // Register parent comment
      const parentCommentId = docxDocumentInstance.ensureComment({
        id: data.id,
        authorName: data.authorName,
        authorInitials: data.authorInitials,
        date: data.date,
        text: data.text,
      });
      fragments.push(buildCommentRangeStart(parentCommentId));

      // Register and anchor reply comments
      if (
        data.replies &&
        data.replies.length > 0 &&
        docxDocumentInstance.comments &&
        docxDocumentInstance.ensureComment
      ) {
        // Find parent's paraId for threading
        const parentComment = docxDocumentInstance.comments.find(
          (c) => c.id === parentCommentId
        );
        const parentParaId = parentComment?.paraId;

        data.replies.forEach((reply, idx) => {
          const replyId = `${data.id}-reply-${idx}`;
          const replyCommentId = docxDocumentInstance.ensureComment!(
            {
              id: replyId,
              authorName: reply.authorName,
              authorInitials: reply.authorInitials,
              date: reply.date,
              text: reply.text,
            },
            parentParaId
          );
          // Reply commentRangeStart anchored after parent's
          fragments.push(buildCommentRangeStart(replyCommentId));
        });
      }
      continue;
    }

    if (part.type === 'commentEnd') {
      const commentId = docxDocumentInstance.getCommentId(part.id);
      fragments.push(buildCommentRangeEnd(commentId));
      fragments.push(buildCommentReferenceRun(commentId));

      // Emit range end + reference for reply comments
      const replyIds: number[] = [];
      if (docxDocumentInstance.commentIdMap) {
        for (const [
          key,
          numId,
        ] of docxDocumentInstance.commentIdMap.entries()) {
          if (key.startsWith(`${part.id}-reply-`)) {
            replyIds.push(numId);
          }
        }
      }
      // Sort to preserve insertion order
      replyIds.sort((a, b) => a - b);
      for (const replyNumId of replyIds) {
        fragments.push(buildCommentRangeEnd(replyNumId));
        fragments.push(buildCommentReferenceRun(replyNumId));
      }
      continue;
    }

    if (part.type === 'insStart' || part.type === 'delStart') {
      const data = part.data;
      const revisionId = docxDocumentInstance.getRevisionId(data.id);
      const suggestionId = data.id || `suggestion-${revisionId}`;
      const suggestion: ActiveSuggestion = {
        id: suggestionId,
        type: part.type === 'delStart' ? 'remove' : 'insert',
        author: data.author,
        date: data.date,
        revisionId,
      };

      // Remove any existing suggestion with same ID before pushing
      trackingState.suggestionStack = trackingState.suggestionStack.filter(
        (item) => item.id !== suggestionId
      );
      trackingState.suggestionStack.push(suggestion);
      continue;
    }

    if (part.type === 'insEnd' || part.type === 'delEnd') {
      trackingState.suggestionStack = trackingState.suggestionStack.filter(
        (item) => item.id !== part.id
      );
    }
  }

  return fragments;
};

const fixupLineHeight = (
  lineHeight: number,
  fontSize: number | null
): number => {
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

const fixupFontSize = (fontSizeString: string): number | undefined => {
  if (pointRegex.test(fontSizeString)) {
    const matchedParts = fontSizeString.match(pointRegex);
    if (matchedParts) {
      // convert point to half point
      return pointToHIP(Number.parseFloat(matchedParts[1]));
    }
  }
  if (pixelRegex.test(fontSizeString)) {
    const matchedParts = fontSizeString.match(pixelRegex);
    if (matchedParts) {
      // convert pixels to half point
      return pixelToHIP(Number.parseFloat(matchedParts[1]));
    }
  }
  return;
};

const fixupRowHeight = (rowHeightString: string): number | undefined => {
  if (pointRegex.test(rowHeightString)) {
    const matchedParts = rowHeightString.match(pointRegex);
    if (matchedParts) {
      // convert point to half point
      return pointToTWIP(Number.parseFloat(matchedParts[1]));
    }
  }
  if (pixelRegex.test(rowHeightString)) {
    const matchedParts = rowHeightString.match(pixelRegex);
    if (matchedParts) {
      // convert pixels to half point
      return pixelToTWIP(Number.parseFloat(matchedParts[1]));
    }
  }
  if (cmRegex.test(rowHeightString)) {
    const matchedParts = rowHeightString.match(cmRegex);
    if (matchedParts) {
      return cmToTWIP(Number.parseFloat(matchedParts[1]));
    }
  }
  if (inchRegex.test(rowHeightString)) {
    const matchedParts = rowHeightString.match(inchRegex);
    if (matchedParts) {
      return inchToTWIP(Number.parseFloat(matchedParts[1]));
    }
  }
  return;
};

const fixupColumnWidth = (
  columnWidthString: string | undefined
): ColumnWidthInfo | null => {
  if (!columnWidthString) return null;

  if (pointRegex.test(columnWidthString)) {
    const matchedParts = columnWidthString.match(pointRegex);
    if (matchedParts) {
      return {
        value: pointToTWIP(Number.parseFloat(matchedParts[1])),
        type: 'dxa',
      };
    }
  }
  if (pixelRegex.test(columnWidthString)) {
    const matchedParts = columnWidthString.match(pixelRegex);
    if (matchedParts) {
      return {
        value: pixelToTWIP(Number.parseFloat(matchedParts[1])),
        type: 'dxa',
      };
    }
  }
  if (cmRegex.test(columnWidthString)) {
    const matchedParts = columnWidthString.match(cmRegex);
    if (matchedParts) {
      return {
        value: cmToTWIP(Number.parseFloat(matchedParts[1])),
        type: 'dxa',
      };
    }
  }
  if (inchRegex.test(columnWidthString)) {
    const matchedParts = columnWidthString.match(inchRegex);
    if (matchedParts) {
      return {
        value: inchToTWIP(Number.parseFloat(matchedParts[1])),
        type: 'dxa',
      };
    }
  }
  if (percentageRegex.test(columnWidthString)) {
    const matchedParts = columnWidthString.match(percentageRegex);
    if (matchedParts) {
      // Convert percentage to fiftieths of a percent (pct in OOXML)
      // 50% = 50 * 50 = 2500 (fiftieths of a percent)
      return { value: Number.parseFloat(matchedParts[1]) * 50, type: 'pct' };
    }
  }
  return null;
};

const fixupMargin = (marginString: string): number | undefined => {
  if (pointRegex.test(marginString)) {
    const matchedParts = marginString.match(pointRegex);
    if (matchedParts) {
      // convert point to half point
      return pointToTWIP(Number.parseFloat(matchedParts[1]));
    }
  }
  if (pixelRegex.test(marginString)) {
    const matchedParts = marginString.match(pixelRegex);
    if (matchedParts) {
      // convert pixels to half point
      return pixelToTWIP(Number.parseFloat(matchedParts[1]));
    }
  }
  return;
};

type ModifiedAttributesBuilderOptions = {
  isParagraph?: boolean;
};

const modifiedStyleAttributesBuilder = (
  docxDocumentInstance: DocxDocumentInstance | undefined,
  vNode: VNodeType | VTextType | null,
  attributes: ParagraphAttributes,
  options?: ModifiedAttributesBuilderOptions
): ParagraphAttributes => {
  const modifiedAttributes: ParagraphAttributes = { ...attributes };

  // styles
  if (
    isVNode(vNode) &&
    (vNode as VNodeType).properties &&
    (vNode as VNodeType).properties!.style
  ) {
    const vn = vNode as VNodeType;
    const style = vn.properties!.style!;

    if (style.color && !colorlessColors.includes(style.color)) {
      modifiedAttributes.color = fixupColorCode(style.color);
    }

    const backgroundColor =
      style['background-color'] ??
      (style as Record<string, string>).backgroundColor;
    if (backgroundColor && !colorlessColors.includes(backgroundColor)) {
      modifiedAttributes.backgroundColor = fixupColorCode(backgroundColor);
    }

    if (
      style['vertical-align'] &&
      verticalAlignValues.includes(
        style['vertical-align'] as 'top' | 'middle' | 'bottom'
      )
    ) {
      modifiedAttributes.verticalAlign = style['vertical-align'];
    }

    if (
      style['text-align'] &&
      ['left', 'right', 'center', 'justify'].includes(style['text-align'])
    ) {
      modifiedAttributes.textAlign = style['text-align'];
    }

    // FIXME: remove bold check when other font weights are handled.
    if (style['font-weight'] && style['font-weight'] === 'bold') {
      modifiedAttributes.strong = style['font-weight'];
    }
    if (style['font-family'] && docxDocumentInstance) {
      modifiedAttributes.font = docxDocumentInstance.createFont(
        style['font-family']
      );
    }
    if (style['font-size']) {
      modifiedAttributes.fontSize = fixupFontSize(style['font-size']);
    }
    if (style['line-height']) {
      modifiedAttributes.lineHeight = fixupLineHeight(
        Number.parseFloat(style['line-height']),
        style['font-size'] ? fixupFontSize(style['font-size']) || null : null
      );
    }
    if (style['margin-left'] || style['margin-right']) {
      const leftMargin = style['margin-left']
        ? fixupMargin(style['margin-left'])
        : undefined;
      const rightMargin = style['margin-right']
        ? fixupMargin(style['margin-right'])
        : undefined;
      const indentation: Indentation = {};
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
    if (style.display) {
      modifiedAttributes.display = style.display;
    }

    if (style.width) {
      modifiedAttributes.width = style.width;
    }
  }

  // paragraph only
  if (options?.isParagraph) {
    if (isVNode(vNode) && (vNode as VNodeType).tagName === 'blockquote') {
      modifiedAttributes.indentation = { left: 284 };
      modifiedAttributes.blockquoteBorder = true;
    } else if (isVNode(vNode) && (vNode as VNodeType).tagName === 'code') {
      modifiedAttributes.highlightColor = 'lightGray';
    } else if (isVNode(vNode) && (vNode as VNodeType).tagName === 'pre') {
      modifiedAttributes.font = 'Courier';
    }
  }

  return modifiedAttributes;
};

// html tag to formatting function
// options are passed to the formatting function if needed
const buildFormatting = (
  htmlTag: string,
  options?: FormattingOptions
): XMLBuilderType | null => {
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
      return buildRunFontFragment(options?.font);
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

const buildRunProperties = (
  attributes: RunAttributes | undefined
): XMLBuilderType => {
  const runPropertiesFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'rPr');
  if (attributes && attributes.constructor === Object) {
    Object.keys(attributes).forEach((key) => {
      const value = (attributes as Record<string, unknown>)[key];

      // Skip undefined values to prevent default 'black' being applied
      if (value === undefined) return;

      const options: FormattingOptions = {};
      if (
        key === 'color' ||
        key === 'backgroundColor' ||
        key === 'highlightColor'
      ) {
        options.color = value as string;
      }

      if (key === 'fontSize' || key === 'font') {
        (options as Record<string, string | number>)[key] = value as
          | string
          | number;
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

const buildRun = async (
  vNode: VNodeType | VTextType | null,
  attributes: ParagraphAttributes,
  docxDocumentInstance?: DocxDocumentInstance
): Promise<XMLBuilderType | XMLBuilderType[]> => {
  const runFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele(
    '@w',
    'r'
  );
  const runPropertiesFragment = buildRunProperties(cloneDeep(attributes));

  // case where we have recursive spans representing font changes
  if (isVNode(vNode) && (vNode as VNodeType).tagName === 'span') {
    return buildRunOrRuns(vNode as VNodeType, attributes, docxDocumentInstance);
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
    ].includes((vNode as VNodeType).tagName || '')
  ) {
    const runFragmentsArray: XMLBuilderType[] = [];

    let vNodes: (VNodeType | VTextType)[] = [vNode as VNodeType];
    // create temp run fragments to split the paragraph into different runs
    let tempAttributes: RunAttributes = cloneDeep(attributes);
    let tempRunFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele(
      '@w',
      'r'
    );
    while (vNodes.length) {
      const tempVNode = vNodes.shift()!;
      if (isVText(tempVNode)) {
        const textContent = (tempVNode as VTextType).text;
        const mergedAttributes = { ...attributes, ...tempAttributes };

        // Check for tracking tokens in text
        if (docxDocumentInstance && hasTrackingTokens(textContent)) {
          const trackingFragments = buildRunsFromTextWithTokens(
            textContent,
            mergedAttributes,
            docxDocumentInstance
          );
          if (trackingFragments) {
            runFragmentsArray.push(...trackingFragments);
            // re initialize temp run fragments with new fragment
            tempAttributes = cloneDeep(attributes);
            tempRunFragment = fragment({
              namespaceAlias: { w: namespaces.w },
            }).ele('@w', 'r');
            continue;
          }
        }

        // Normal text processing
        const textFragment = buildTextElement(textContent);
        const tempRunPropertiesFragment = buildRunProperties(mergedAttributes);
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
        const tempVn = tempVNode as VNodeType;
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
          ].includes(tempVn.tagName || '')
        ) {
          tempAttributes = {};
          switch (tempVn.tagName) {
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
          const formattingFragment = buildFormatting(tempVn.tagName || '');

          if (formattingFragment) {
            runPropertiesFragment.import(formattingFragment);
          }
          // go a layer deeper if there is a span somewhere in the children
        } else if (tempVn.tagName === 'span') {
          const spanFragment = await buildRunOrRuns(
            tempVn,
            { ...attributes, ...tempAttributes },
            docxDocumentInstance
          );

          // if spanFragment is an array, we need to add each fragment to the runFragmentsArray. If the fragment is an array, perform a depth first search on the array to add each fragment to the runFragmentsArray
          if (Array.isArray(spanFragment)) {
            (spanFragment as XMLBuilderType[]).flat(Number.POSITIVE_INFINITY);
            runFragmentsArray.push(...(spanFragment as XMLBuilderType[]));
          } else {
            runFragmentsArray.push(spanFragment);
          }

          // do not slice and concat children since this is already accounted for in the buildRunOrRuns function

          continue;
        }
      }

      const tempVn = tempVNode as VNodeType;
      if (tempVn.children?.length) {
        if (tempVn.children.length > 1) {
          attributes = { ...attributes, ...tempAttributes };
        }

        vNodes = tempVn.children.slice().concat(vNodes);
      }
    }
    if (runFragmentsArray.length) {
      return runFragmentsArray;
    }
  }

  runFragment.import(runPropertiesFragment);
  if (isVText(vNode)) {
    const textContent = (vNode as VTextType).text;

    // Check for tracking tokens in text
    if (docxDocumentInstance && hasTrackingTokens(textContent)) {
      const trackingFragments = buildRunsFromTextWithTokens(
        textContent,
        attributes,
        docxDocumentInstance
      );
      if (trackingFragments) {
        return trackingFragments;
      }
    }

    // Normal text processing
    const textFragment = buildTextElement(textContent);
    runFragment.import(textFragment);
  } else if (attributes && attributes.type === 'picture') {
    let response: MediaFileResponse | null = null;

    const vn = vNode as VNodeType;
    const base64Uri = decodeURIComponent(vn.properties?.src || '');
    if (base64Uri && docxDocumentInstance) {
      response = docxDocumentInstance.createMediaFile(base64Uri);
    }

    if (response && docxDocumentInstance) {
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

    const imageFragment = buildDrawing(
      inlineOrAnchored || false,
      type || 'picture',
      otherAttributes as DrawingAttributes
    );
    runFragment.import(imageFragment);
  } else if (isVNode(vNode) && (vNode as VNodeType).tagName === 'br') {
    const lineBreakFragment = buildLineBreak();
    runFragment.import(lineBreakFragment);
  }
  runFragment.up();

  return runFragment;
};

const buildRunOrRuns = async (
  vNode: VNodeType | VTextType | null,
  attributes: ParagraphAttributes,
  docxDocumentInstance?: DocxDocumentInstance
): Promise<XMLBuilderType | XMLBuilderType[]> => {
  // Check for OMML equation data attribute
  if (
    isVNode(vNode) &&
    (vNode as VNodeType).properties &&
    (vNode as VNodeType).properties!.attributes &&
    (vNode as VNodeType).properties!.attributes!['data-equation-omml']
  ) {
    const ommlString = (vNode as VNodeType).properties!.attributes![
      'data-equation-omml'
    ];
    try {
      // Parse the OMML string and create a fragment
      const ommlFragment = fragment().ele(ommlString);
      return ommlFragment;
    } catch {
      // If parsing fails, fall through to normal text handling
      console.warn('Failed to parse OMML, falling back to text');
    }
  }

  if (isVNode(vNode) && (vNode as VNodeType).tagName === 'span') {
    let runFragments: XMLBuilderType[] = [];
    const vn = vNode as VNodeType;

    for (let index = 0; index < (vn.children || []).length; index++) {
      const childVNode = (vn.children || [])[index];
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

const buildRunOrHyperLink = async (
  vNode: VNodeType | VTextType | null,
  attributes: ParagraphAttributes,
  docxDocumentInstance?: DocxDocumentInstance
): Promise<XMLBuilderType | XMLBuilderType[]> => {
  if (isVNode(vNode) && (vNode as VNodeType).tagName === 'a') {
    const vn = vNode as VNodeType;
    const href = vn.properties?.href ? vn.properties.href : '';

    // Check if this is an internal link (starts with #)
    const isInternalLink = href.startsWith('#');

    let hyperlinkFragment: XMLBuilderType;
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
      const relationshipId = docxDocumentInstance
        ? docxDocumentInstance.createDocumentRelationships(
            docxDocumentInstance.relationshipFilename,
            hyperlinkType,
            href
          )
        : 0;
      hyperlinkFragment = fragment({
        namespaceAlias: { w: namespaces.w, r: namespaces.r },
      })
        .ele('@w', 'hyperlink')
        .att('@r', 'id', `rId${relationshipId}`);
    }

    const modifiedAttributes = { ...attributes };
    modifiedAttributes.hyperlink = true;

    const runFragments = await buildRunOrRuns(
      (vn.children || [])[0],
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

const buildNumberingProperties = (
  levelId: number,
  numberingId: number
): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'numPr')
    .ele('@w', 'ilvl')
    .att('@w', 'val', String(levelId))
    .up()
    .ele('@w', 'numId')
    .att('@w', 'val', String(numberingId))
    .up()
    .up();

const buildNumberingInstances = (): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'num')
    .ele('@w', 'abstractNumId')
    .up()
    .up();

const buildSpacing = (
  lineSpacing?: number,
  beforeSpacing?: number,
  afterSpacing?: number
): XMLBuilderType => {
  const spacingFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele(
    '@w',
    'spacing'
  );

  if (lineSpacing) {
    spacingFragment.att('@w', 'line', String(lineSpacing));
  }
  if (beforeSpacing) {
    spacingFragment.att('@w', 'before', String(beforeSpacing));
  }
  if (afterSpacing) {
    spacingFragment.att('@w', 'after', String(afterSpacing));
  }

  spacingFragment.att('@w', 'lineRule', 'auto').up();

  return spacingFragment;
};

const buildIndentation = ({ left, right }: Indentation): XMLBuilderType => {
  const indentationFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'ind');

  if (left) {
    indentationFragment.att('@w', 'left', String(left));
  }
  if (right) {
    indentationFragment.att('@w', 'right', String(right));
  }

  indentationFragment.up();

  return indentationFragment;
};

const buildPStyle = (style = 'Normal'): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'pStyle')
    .att('@w', 'val', style)
    .up();

const buildHorizontalAlignment = (
  horizontalAlignment: string
): XMLBuilderType => {
  if (horizontalAlignment === 'justify') {
    horizontalAlignment = 'both';
  }
  return fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'jc')
    .att('@w', 'val', horizontalAlignment)
    .up();
};

const buildParagraphBorder = (): XMLBuilderType => {
  const paragraphBorderFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'pBdr');
  const bordersObject = cloneDeep(paragraphBordersObject);

  Object.keys(bordersObject).forEach((borderName) => {
    const border = bordersObject[borderName as keyof typeof bordersObject];
    if (border) {
      const { size, spacing, color } = border;

      const borderFragment = buildBorder(borderName, size, spacing, color);
      paragraphBorderFragment.import(borderFragment);
    }
  });

  paragraphBorderFragment.up();

  return paragraphBorderFragment;
};

const buildParagraphProperties = (
  attributes: ParagraphAttributes | undefined
): XMLBuilderType => {
  const paragraphPropertiesFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'pPr');
  if (attributes && attributes.constructor === Object) {
    Object.keys(attributes).forEach((key) => {
      switch (key) {
        case 'numbering': {
          const { levelId, numberingId } = attributes[key]!;
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
            attributes[key]!
          );
          paragraphPropertiesFragment.import(horizontalAlignmentFragment);

          attributes.textAlign = undefined;
          break;
        }
        case 'backgroundColor':
          // Add shading to Paragraph Properties only if display is block
          // Essentially if background color needs to be across the row
          if (attributes.display === 'block') {
            const shadingFragment = buildShading(attributes[key]!);
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
          const indentationFragment = buildIndentation(attributes[key]!);
          paragraphPropertiesFragment.import(indentationFragment);

          attributes.indentation = undefined;
          break;
        }
        case 'blockquoteBorder': {
          // Add left border for blockquote styling
          const borderFragment = fragment({
            namespaceAlias: { w: namespaces.w },
          })
            .ele('@w', 'pBdr')
            .ele('@w', 'left')
            .att('@w', 'val', 'single')
            .att('@w', 'sz', '18') // 2.25pt border width
            .att('@w', 'space', '4')
            .att('@w', 'color', 'CCCCCC')
            .up()
            .up();
          paragraphPropertiesFragment.import(borderFragment);

          attributes.blockquoteBorder = undefined;
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

type ImageDimensionAttributes = {
  height?: number;
  maximumWidth?: number;
  originalHeight?: number;
  originalWidth?: number;
  width?: number | string;
};

const computeImageDimensions = (
  vNode: VNodeType,
  attributes: ImageDimensionAttributes
): void => {
  const { maximumWidth, originalWidth, originalHeight } = attributes;
  if (!originalWidth || !originalHeight || !maximumWidth) return;

  const aspectRatio = originalWidth / originalHeight;
  const maximumWidthInEMU = TWIPToEMU(maximumWidth);
  let originalWidthInEMU = pixelToEMU(originalWidth);
  let originalHeightInEMU = pixelToEMU(originalHeight);
  if (originalWidthInEMU > maximumWidthInEMU) {
    originalWidthInEMU = maximumWidthInEMU;
    originalHeightInEMU = Math.round(originalWidthInEMU / aspectRatio);
  }
  let modifiedHeight: number | undefined;
  let modifiedWidth: number | undefined;

  if (vNode.properties?.style) {
    const style = vNode.properties.style;
    if (style.width) {
      if (style.width !== 'auto') {
        if (pixelRegex.test(style.width)) {
          const match = style.width.match(pixelRegex);
          if (match) {
            modifiedWidth = pixelToEMU(Number.parseFloat(match[1]));
          }
        } else if (percentageRegex.test(style.width)) {
          const match = style.width.match(percentageRegex);
          if (match) {
            const percentageValue = Number.parseFloat(match[1]);
            modifiedWidth = Math.round(
              (percentageValue / 100) * originalWidthInEMU
            );
          }
        }
      } else if (style.height && style.height === 'auto') {
        modifiedWidth = originalWidthInEMU;
        modifiedHeight = originalHeightInEMU;
      }
    }
    if (style.height) {
      if (style.height !== 'auto') {
        if (pixelRegex.test(style.height)) {
          const match = style.height.match(pixelRegex);
          if (match) {
            modifiedHeight = pixelToEMU(Number.parseFloat(match[1]));
          }
        } else if (percentageRegex.test(style.height)) {
          const match = style.width?.match(percentageRegex);
          if (match) {
            const percentageValue = Number.parseFloat(match[1]);
            modifiedHeight = Math.round(
              (percentageValue / 100) * originalHeightInEMU
            );
            if (!modifiedWidth) {
              modifiedWidth = Math.round(modifiedHeight * aspectRatio);
            }
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

const buildParagraph = async (
  vNode: VNodeType | VTextType | null,
  attributes: ParagraphAttributes,
  docxDocumentInstance?: DocxDocumentInstance
): Promise<XMLBuilder> => {
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
  let bookmarkNumericId: number | null = null;
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
  if (isVNode(vNode) && vNodeHasChildren(vNode as VNodeType)) {
    const vn = vNode as VNodeType;
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
      ].includes(vn.tagName || '')
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
    } else if (vn.tagName === 'blockquote') {
      const runFragmentOrFragments = await buildRun(vNode, attributes);
      if (Array.isArray(runFragmentOrFragments)) {
        for (let index = 0; index < runFragmentOrFragments.length; index++) {
          paragraphFragment.import(runFragmentOrFragments[index]);
        }
      } else {
        paragraphFragment.import(runFragmentOrFragments);
      }
    } else {
      for (let index = 0; index < (vn.children || []).length; index++) {
        const childVNode = (vn.children || [])[index] as VNodeType;
        if (childVNode.tagName === 'img') {
          let base64String: string | undefined;
          const imageSource = childVNode.properties?.src;

          // Skip WebP images - Word doesn't support WebP format
          if (
            imageSource &&
            (imageSource.includes('.webp') ||
              imageSource.includes('image/webp'))
          ) {
            continue;
          }

          if (imageSource && isValidUrl(imageSource)) {
            base64String = (await imageToBase64(imageSource).catch(() => {})) as
              | string
              | undefined;

            if (base64String) {
              // Try to get MIME type from URL extension first
              let mimeType: string | false = mimeTypes.lookup(imageSource);

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

              if (childVNode.properties) {
                childVNode.properties.src = `data:${mimeType};base64,${base64String}`;
              }
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
          const binaryString = atob(decodeURIComponent(base64String!));
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const imageProperties = getImageDimensions(bytes);

          modifiedAttributes.maximumWidth =
            modifiedAttributes.maximumWidth ||
            docxDocumentInstance?.availableDocumentSpace;
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
                description: childVNode.properties?.alt,
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
    if (isVNode(vNode) && (vNode as VNodeType).tagName === 'img') {
      const vn = vNode as VNodeType;
      const imageSource = vn.properties?.src;

      // Skip WebP images - Word doesn't support WebP format
      if (
        imageSource &&
        (imageSource.includes('.webp') || imageSource.includes('image/webp'))
      ) {
        paragraphFragment.up();
        return paragraphFragment;
      }

      let base64String: string | undefined = imageSource;
      if (imageSource && isValidUrl(imageSource)) {
        base64String = (await imageToBase64(imageSource).catch(() => {})) as
          | string
          | undefined;

        if (base64String) {
          // Try to get MIME type from URL extension first
          let mimeType: string | false = mimeTypes.lookup(imageSource);

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

          if (vn.properties) {
            vn.properties.src = `data:${mimeType};base64,${base64String}`;
          }
        } else {
          paragraphFragment.up();
          return paragraphFragment;
        }
      } else if (base64String) {
        const match = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
        if (match) {
          base64String = match[2];
        }
      }

      if (base64String) {
        // Convert base64 to Uint8Array for browser compatibility
        const binaryString = atob(decodeURIComponent(base64String));
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const imageProperties = getImageDimensions(bytes);

        modifiedAttributes.maximumWidth =
          modifiedAttributes.maximumWidth ||
          docxDocumentInstance?.availableDocumentSpace;
        modifiedAttributes.originalWidth = imageProperties.width;
        modifiedAttributes.originalHeight = imageProperties.height;

        computeImageDimensions(vn, modifiedAttributes);
      }
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

const buildGridSpanFragment = (spanValue: number): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'gridSpan')
    .att('@w', 'val', String(spanValue))
    .up();

const buildTableCellSpacing = (cellSpacing = 0): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'tblCellSpacing')
    .att('@w', 'w', String(cellSpacing))
    .att('@w', 'type', 'dxa')
    .up();

const buildTableCellBorders = (
  tableCellBorder: TableCellBorder
): XMLBuilderType => {
  const tableCellBordersFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tcBorders');

  const { color, stroke, ...borders } = tableCellBorder;
  Object.keys(borders).forEach((border) => {
    const borderValue = (borders as Record<string, number | undefined>)[border];
    // Skip borders with value 0 or undefined - they should not be rendered
    if (borderValue !== undefined && borderValue > 0) {
      const borderFragment = buildBorder(border, borderValue, 0, color, stroke);
      tableCellBordersFragment.import(borderFragment);
    }
  });

  tableCellBordersFragment.up();

  return tableCellBordersFragment;
};

const buildTableCellWidth = (
  tableCellWidth: string | undefined
): XMLBuilderType | null => {
  const widthInfo = fixupColumnWidth(tableCellWidth);
  if (!widthInfo) return null;

  return fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'tcW')
    .att('@w', 'w', String(widthInfo.value))
    .att('@w', 'type', widthInfo.type)
    .up();
};

interface TableCellAttributes extends ParagraphAttributes {
  colSpan?: number;
  maximumWidth?: number;
  rowSpan?: string;
  tableCellBorder?: TableCellBorder;
  verticalAlign?: string;
}

const buildTableCellProperties = (
  attributes: TableCellAttributes | undefined
): XMLBuilderType => {
  const tableCellPropertiesFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tcPr');
  if (attributes && attributes.constructor === Object) {
    Object.keys(attributes).forEach((key) => {
      switch (key) {
        case 'backgroundColor': {
          const shadingFragment = buildShading(attributes[key]!);
          tableCellPropertiesFragment.import(shadingFragment);

          attributes.backgroundColor = undefined;
          break;
        }
        case 'verticalAlign': {
          const verticalAlignmentFragment = buildVerticalAlignment(
            attributes[key]!
          );
          tableCellPropertiesFragment.import(verticalAlignmentFragment);

          attributes.verticalAlign = undefined;
          break;
        }
        case 'colSpan': {
          const gridSpanFragment = buildGridSpanFragment(attributes[key]!);
          tableCellPropertiesFragment.import(gridSpanFragment);

          attributes.colSpan = undefined;
          break;
        }
        case 'tableCellBorder': {
          const border = attributes[key]!;
          // Only add cell borders if at least one border has a non-zero size
          const hasVisibleBorder = Object.entries(border).some(
            ([k, v]) =>
              k !== 'color' && k !== 'stroke' && typeof v === 'number' && v > 0
          );
          if (hasVisibleBorder) {
            const tableCellBorderFragment = buildTableCellBorders(border);
            tableCellPropertiesFragment.import(tableCellBorderFragment);
          }

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
          const widthFragment = buildTableCellWidth(
            attributes[key] as string | undefined
          );
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

const fixupTableCellBorder = (
  vNode: VNodeType,
  attributes: TableCellAttributes
): void => {
  const style = vNode.properties?.style;
  if (!style) return;

  if (Object.hasOwn(style, 'border')) {
    if (style.border === 'none' || style.border === '0') {
      attributes.tableCellBorder = {};
    } else {
      const [borderSize, borderStroke, borderColor] = cssBorderParser(
        style.border
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
  if (style['border-top'] && style['border-top'] === '0') {
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      top: 0,
    };
  } else if (style['border-top'] && style['border-top'] !== '0') {
    const [borderSize, borderStroke, borderColor] = cssBorderParser(
      style['border-top']
    );
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      top: borderSize,
      color: borderColor,
      stroke: borderStroke,
    };
  }
  if (style['border-left'] && style['border-left'] === '0') {
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      left: 0,
    };
  } else if (style['border-left'] && style['border-left'] !== '0') {
    const [borderSize, borderStroke, borderColor] = cssBorderParser(
      style['border-left']
    );
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      left: borderSize,
      color: borderColor,
      stroke: borderStroke,
    };
  }
  if (style['border-bottom'] && style['border-bottom'] === '0') {
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      bottom: 0,
    };
  } else if (style['border-bottom'] && style['border-bottom'] !== '0') {
    const [borderSize, borderStroke, borderColor] = cssBorderParser(
      style['border-bottom']
    );
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      bottom: borderSize,
      color: borderColor,
      stroke: borderStroke,
    };
  }
  if (style['border-right'] && style['border-right'] === '0') {
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      right: 0,
    };
  } else if (style['border-right'] && style['border-right'] !== '0') {
    const [borderSize, borderStroke, borderColor] = cssBorderParser(
      style['border-right']
    );
    attributes.tableCellBorder = {
      ...attributes.tableCellBorder,
      right: borderSize,
      color: borderColor,
      stroke: borderStroke,
    };
  }
};

type RowSpanInfo = {
  colSpan: number;
  rowSpan: number;
};

type ColumnIndex = {
  index: number;
};

const buildTableCell = async (
  vNode: VNodeType | VTextType,
  attributes: TableCellAttributes,
  rowSpanMap: Map<number, RowSpanInfo>,
  columnIndex: ColumnIndex,
  docxDocumentInstance: DocxDocumentInstance
): Promise<XMLBuilder> => {
  const tableCellFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tc');

  let modifiedAttributes: TableCellAttributes = { ...attributes };
  if (isVNode(vNode) && (vNode as VNodeType).properties) {
    const vn = vNode as VNodeType;
    if (vn.properties?.rowSpan) {
      rowSpanMap.set(columnIndex.index, {
        rowSpan: vn.properties.rowSpan - 1,
        colSpan: 0,
      });
      modifiedAttributes.rowSpan = 'restart';
    } else {
      const previousSpanObject = rowSpanMap.get(columnIndex.index);
      rowSpanMap.set(columnIndex.index, {
        ...previousSpanObject,
        rowSpan: 0,
        colSpan: previousSpanObject?.colSpan || 0,
      });
    }
    if (vn.properties?.colSpan || vn.properties?.style?.['column-span']) {
      modifiedAttributes.colSpan =
        vn.properties?.colSpan ||
        Number.parseInt(vn.properties?.style?.['column-span'] || '0', 10);
      const previousSpanObject = rowSpanMap.get(columnIndex.index);
      rowSpanMap.set(columnIndex.index, {
        ...previousSpanObject,
        colSpan: Number.parseInt(String(modifiedAttributes.colSpan), 10) || 0,
        rowSpan: previousSpanObject?.rowSpan || 0,
      });
      columnIndex.index +=
        Number.parseInt(String(modifiedAttributes.colSpan), 10) - 1;
    }
    if (vn.properties?.style) {
      modifiedAttributes = {
        ...modifiedAttributes,
        ...modifiedStyleAttributesBuilder(
          docxDocumentInstance,
          vNode,
          attributes
        ),
      };

      fixupTableCellBorder(vn, modifiedAttributes);
    }
  }
  const tableCellPropertiesFragment =
    buildTableCellProperties(modifiedAttributes);
  tableCellFragment.import(tableCellPropertiesFragment);

  // Don't pass cell-level backgroundColor to paragraph content
  // It should only apply to the cell itself (tcPr), not text runs
  const paragraphAttributes = { ...modifiedAttributes };
  paragraphAttributes.backgroundColor = undefined;

  if (vNodeHasChildren(vNode as VNodeType)) {
    const vn = vNode as VNodeType;
    for (let index = 0; index < (vn.children || []).length; index++) {
      const childVNode = (vn.children || [])[index];
      if (isVNode(childVNode) && (childVNode as VNodeType).tagName === 'img') {
        const imageFragment = await buildImage(
          docxDocumentInstance,
          childVNode as VNodeType,
          modifiedAttributes.maximumWidth || null
        );
        if (imageFragment) {
          tableCellFragment.import(imageFragment);
        }
      } else if (
        isVNode(childVNode) &&
        (childVNode as VNodeType).tagName === 'figure'
      ) {
        const figureVn = childVNode as VNodeType;
        if (vNodeHasChildren(figureVn)) {
          for (
            let iteratorIndex = 0;
            iteratorIndex < (figureVn.children || []).length;
            iteratorIndex++
          ) {
            const grandChildVNode = (figureVn.children || [])[
              iteratorIndex
            ] as VNodeType;
            if (grandChildVNode.tagName === 'img') {
              const imageFragment = await buildImage(
                docxDocumentInstance,
                grandChildVNode,
                modifiedAttributes.maximumWidth || null
              );
              if (imageFragment) {
                tableCellFragment.import(imageFragment);
              }
            }
          }
        }
      } else if (
        isVNode(childVNode) &&
        ['ul', 'ol'].includes((childVNode as VNodeType).tagName || '')
      ) {
        // render list in table
        const listVn = childVNode as VNodeType;
        if (vNodeHasChildren(listVn)) {
          await buildList(listVn, docxDocumentInstance, tableCellFragment);
        }
      } else if (
        isVNode(childVNode) &&
        (childVNode as VNodeType).tagName === 'div'
      ) {
        // Handle div wrapper - process its children instead
        const divVn = childVNode as VNodeType;
        if (vNodeHasChildren(divVn)) {
          for (
            let divIndex = 0;
            divIndex < (divVn.children || []).length;
            divIndex++
          ) {
            const divChild = (divVn.children || [])[divIndex];
            if (
              isVNode(divChild) &&
              (divChild as VNodeType).tagName === 'img'
            ) {
              const imageFragment = await buildImage(
                docxDocumentInstance,
                divChild as VNodeType,
                modifiedAttributes.maximumWidth || null
              );
              if (imageFragment) {
                tableCellFragment.import(imageFragment);
              }
            } else if (
              isVNode(divChild) &&
              ['ul', 'ol'].includes((divChild as VNodeType).tagName || '')
            ) {
              const listVn = divChild as VNodeType;
              if (vNodeHasChildren(listVn)) {
                await buildList(
                  listVn,
                  docxDocumentInstance,
                  tableCellFragment
                );
              }
            } else {
              const paragraphFragment = await buildParagraph(
                divChild,
                paragraphAttributes,
                docxDocumentInstance
              );
              tableCellFragment.import(paragraphFragment);
            }
          }
        }
      } else {
        const paragraphFragment = await buildParagraph(
          childVNode,
          paragraphAttributes,
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

interface TableRowAttributes extends TableAttributes {
  tableRowHeight?: number;
}

const buildRowSpanCell = (
  rowSpanMap: Map<number, RowSpanInfo>,
  columnIndex: ColumnIndex,
  attributes: TableRowAttributes
): XMLBuilderType[] => {
  const rowSpanCellFragments: XMLBuilderType[] = [];
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

const buildTableRowProperties = (
  attributes: TableRowAttributes | undefined
): XMLBuilderType => {
  const tableRowPropertiesFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'trPr');
  if (attributes && attributes.constructor === Object) {
    Object.keys(attributes).forEach((key) => {
      switch (key) {
        case 'tableRowHeight': {
          const tableRowHeightFragment = buildTableRowHeight(attributes[key]!);
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
  vNode: VNodeType,
  attributes: TableRowAttributes,
  rowSpanMap: Map<number, RowSpanInfo>,
  docxDocumentInstance: DocxDocumentInstance
): Promise<XMLBuilder> => {
  const tableRowFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tr');
  const modifiedAttributes: TableRowAttributes = { ...attributes };
  if (isVNode(vNode) && vNode.properties) {
    // FIXME: find a better way to get row height from cell style
    const firstChild = (vNode.children || [])[0] as VNodeType | undefined;
    if (
      vNode.properties.style?.height ||
      (firstChild &&
        isVNode(firstChild) &&
        firstChild.properties?.style &&
        firstChild.properties.style.height)
    ) {
      const heightValue =
        vNode.properties.style?.height ||
        (firstChild &&
        isVNode(firstChild) &&
        firstChild.properties?.style &&
        firstChild.properties.style.height
          ? firstChild.properties.style.height
          : undefined);
      if (heightValue) {
        modifiedAttributes.tableRowHeight = fixupRowHeight(heightValue);
      }
    }
    if (vNode.properties.style) {
      fixupTableCellBorder(vNode, modifiedAttributes as TableCellAttributes);
    }
  }

  const tableRowPropertiesFragment =
    buildTableRowProperties(modifiedAttributes);
  tableRowFragment.import(tableRowPropertiesFragment);

  const columnIndex: ColumnIndex = { index: 0 };

  if (vNodeHasChildren(vNode)) {
    const tableColumns = (vNode.children || []).filter((childVNode) =>
      ['td', 'th'].includes((childVNode as VNodeType).tagName || '')
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

const buildTableGridCol = (gridWidth: number): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'gridCol')
    .att('@w', 'w', String(gridWidth));

const buildTableGrid = (
  vNode: VNodeType,
  attributes: TableAttributes
): XMLBuilderType => {
  const tableGridFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tblGrid');
  if (vNodeHasChildren(vNode)) {
    const gridColumns = (vNode.children || []).filter(
      (childVNode) => (childVNode as VNodeType).tagName === 'col'
    );
    const gridWidth = (attributes.maximumWidth || 0) / gridColumns.length;

    for (let index = 0; index < gridColumns.length; index++) {
      const tableGridColFragment = buildTableGridCol(gridWidth);
      tableGridFragment.import(tableGridColFragment);
    }
  }
  tableGridFragment.up();

  return tableGridFragment;
};

const buildTableGridFromTableRow = (
  vNode: VNodeType,
  attributes: TableAttributes
): XMLBuilderType => {
  const tableGridFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tblGrid');
  if (vNodeHasChildren(vNode)) {
    const numberOfGridColumns = (vNode.children || []).reduce(
      (accumulator, childVNode) => {
        const child = childVNode as VNodeType;
        const colSpan =
          child.properties?.colSpan || child.properties?.style?.['column-span'];

        return (
          accumulator + (colSpan ? Number.parseInt(String(colSpan), 10) : 1)
        );
      },
      0
    );
    const gridWidth = (attributes.maximumWidth || 0) / numberOfGridColumns;

    for (let index = 0; index < numberOfGridColumns; index++) {
      const tableGridColFragment = buildTableGridCol(gridWidth);
      tableGridFragment.import(tableGridColFragment);
    }
  }
  tableGridFragment.up();

  return tableGridFragment;
};

const buildTableBorders = (tableBorder: TableBorder): XMLBuilderType => {
  const tableBordersFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tblBorders');

  const { color, stroke, ...borders } = tableBorder;

  Object.keys(borders).forEach((border) => {
    const borderValue = (borders as Record<string, number | undefined>)[border];
    // Skip borders with value 0 or undefined - they should not be rendered
    if (borderValue !== undefined && borderValue > 0) {
      const borderFragment = buildBorder(border, borderValue, 0, color, stroke);
      tableBordersFragment.import(borderFragment);
    }
  });

  tableBordersFragment.up();

  return tableBordersFragment;
};

const buildTableWidth = (tableWidth: number): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', 'tblW')
    .att('@w', 'type', 'dxa')
    .att('@w', 'w', String(tableWidth))
    .up();

const buildCellMargin = (side: string, margin: number): XMLBuilderType =>
  fragment({ namespaceAlias: { w: namespaces.w } })
    .ele('@w', side)
    .att('@w', 'type', 'dxa')
    .att('@w', 'w', String(margin))
    .up();

const buildTableCellMargins = (margin: number): XMLBuilderType => {
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

const buildTableProperties = (
  attributes: TableAttributes | undefined
): XMLBuilderType => {
  const tablePropertiesFragment = fragment({
    namespaceAlias: { w: namespaces.w },
  }).ele('@w', 'tblPr');

  if (attributes && attributes.constructor === Object) {
    Object.keys(attributes).forEach((key) => {
      switch (key) {
        case 'tableBorder': {
          const border = attributes[key]!;
          // Only add table borders if at least one border has a non-zero size
          const hasVisibleBorder = Object.entries(border).some(
            ([k, v]) => k !== 'color' && k !== 'stroke' && v && v > 0
          );
          if (hasVisibleBorder) {
            const tableBordersFragment = buildTableBorders(border);
            tablePropertiesFragment.import(tableBordersFragment);
          }

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
            const tableWidthFragment = buildTableWidth(attributes[key]!);
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

const cssBorderParser = (borderString: string): [number, string, string] => {
  // Handle 'none' border - return 0 size with valid defaults
  if (
    borderString === 'none' ||
    borderString === '0' ||
    borderString === '0px'
  ) {
    return [0, 'single', '000000'];
  }

  const [size, stroke, color] = borderString.split(' ');

  // Handle 'none' as first value (e.g., 'none solid black')
  if (size === 'none' || size === '0') {
    return [0, 'single', '000000'];
  }

  let sizeNum: number;
  if (pointRegex.test(size)) {
    const matchedParts = size.match(pointRegex);
    // convert point to eighth of a point
    sizeNum = matchedParts ? pointToEIP(Number.parseFloat(matchedParts[1])) : 0;
  } else if (pixelRegex.test(size)) {
    const matchedParts = size.match(pixelRegex);
    // convert pixels to eighth of a point
    sizeNum = matchedParts ? pixelToEIP(Number.parseFloat(matchedParts[1])) : 0;
  } else {
    sizeNum = 0;
  }
  const strokeResult =
    stroke && ['dashed', 'dotted', 'double'].includes(stroke)
      ? stroke
      : 'single';

  const colorResult = color ? fixupColorCode(color).toUpperCase() : '000000';

  return [sizeNum, strokeResult, colorResult];
};

const buildTable = async (
  vNode: VNodeType,
  attributes: TableAttributes,
  docxDocumentInstance: DocxDocumentInstance
): Promise<XMLBuilder> => {
  const tableFragment = fragment({ namespaceAlias: { w: namespaces.w } }).ele(
    '@w',
    'tbl'
  );
  const modifiedAttributes: TableAttributes = { ...attributes };
  if (isVNode(vNode) && vNode.properties) {
    const tableAttributes = vNode.properties.attributes || {};
    const tableStyles = vNode.properties.style || {};
    const tableBorders: TableBorder = {};
    const tableCellBorders: TableCellBorder = {};
    let [borderSize, borderStrike, borderColor]: [number, string, string] = [
      2,
      'single',
      '000000',
    ];

    const borderAttr = tableAttributes.border;
    if (borderAttr && !Number.isNaN(Number.parseInt(borderAttr, 10))) {
      borderSize = Number.parseInt(borderAttr, 10);
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
      // Only apply default cell borders if the table actually has borders
      if (borderSize > 0) {
        tableCellBorders.top = 1;
        tableCellBorders.bottom = 1;
        tableCellBorders.left = 1;
        tableCellBorders.right = 1;
      }
    }

    modifiedAttributes.tableBorder = tableBorders;
    modifiedAttributes.tableCellSpacing = 0;

    if (Object.keys(tableCellBorders).length) {
      modifiedAttributes.tableCellBorder = tableCellBorders;
    }

    let minimumWidth: number | undefined;
    let maximumWidth: number | undefined;
    let width: number | undefined;
    // Calculate minimum width of table
    if (tableStyles['min-width'] && pixelRegex.test(tableStyles['min-width'])) {
      const match = tableStyles['min-width'].match(pixelRegex);
      if (match) {
        minimumWidth = pixelToTWIP(Number.parseFloat(match[1]));
      }
    } else if (
      tableStyles['min-width'] &&
      percentageRegex.test(tableStyles['min-width'])
    ) {
      const match = tableStyles['min-width'].match(percentageRegex);
      if (match) {
        const percentageValue = Number.parseFloat(match[1]);
        minimumWidth = Math.round(
          (percentageValue / 100) * (attributes.maximumWidth || 0)
        );
      }
    }

    // Calculate maximum width of table
    if (tableStyles['max-width'] && pixelRegex.test(tableStyles['max-width'])) {
      pixelRegex.lastIndex = 0;
      const match = tableStyles['max-width'].match(pixelRegex);
      if (match) {
        maximumWidth = pixelToTWIP(Number.parseFloat(match[1]));
      }
    } else if (
      tableStyles['max-width'] &&
      percentageRegex.test(tableStyles['max-width'])
    ) {
      percentageRegex.lastIndex = 0;
      const match = tableStyles['max-width'].match(percentageRegex);
      if (match) {
        const percentageValue = Number.parseFloat(match[1]);
        maximumWidth = Math.round(
          (percentageValue / 100) * (attributes.maximumWidth || 0)
        );
      }
    }

    // Calculate specified width of table
    if (tableStyles.width && pixelRegex.test(tableStyles.width)) {
      pixelRegex.lastIndex = 0;
      const match = tableStyles.width.match(pixelRegex);
      if (match) {
        width = pixelToTWIP(Number.parseFloat(match[1]));
      }
    } else if (tableStyles.width && percentageRegex.test(tableStyles.width)) {
      percentageRegex.lastIndex = 0;
      const match = tableStyles.width.match(percentageRegex);
      if (match) {
        const percentageValue = Number.parseFloat(match[1]);
        width = Math.round(
          (percentageValue / 100) * (attributes.maximumWidth || 0)
        );
      }
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
        attributes.maximumWidth || 0
      );
    }
  }
  const tablePropertiesFragment = buildTableProperties(modifiedAttributes);
  tableFragment.import(tablePropertiesFragment);

  const rowSpanMap = new Map<number, RowSpanInfo>();

  if (vNodeHasChildren(vNode)) {
    for (let index = 0; index < (vNode.children || []).length; index++) {
      const childVNode = (vNode.children || [])[index] as VNodeType;
      if (childVNode.tagName === 'colgroup') {
        const tableGridFragment = buildTableGrid(
          childVNode,
          modifiedAttributes
        );
        tableFragment.import(tableGridFragment);
      } else if (childVNode.tagName === 'thead') {
        for (
          let iteratorIndex = 0;
          iteratorIndex < (childVNode.children || []).length;
          iteratorIndex++
        ) {
          const grandChildVNode = (childVNode.children || [])[
            iteratorIndex
          ] as VNodeType;
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
          iteratorIndex < (childVNode.children || []).length;
          iteratorIndex++
        ) {
          const grandChildVNode = (childVNode.children || [])[
            iteratorIndex
          ] as VNodeType;
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

const buildPresetGeometry = (): XMLBuilderType =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.a, 'prstGeom')
    .att('prst', 'rect')
    .up();

type ExtentsAttributes = {
  height?: number;
  width?: number;
};

const buildExtents = ({ width, height }: ExtentsAttributes): XMLBuilderType => {
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

const buildOffset = (): XMLBuilderType =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.a, 'off')
    .att('x', '0')
    .att('y', '0')
    .up();

const buildGraphicFrameTransform = (
  attributes: ExtentsAttributes
): XMLBuilderType => {
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

const buildShapeProperties = (
  attributes: ExtentsAttributes
): XMLBuilderType => {
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

const buildFillRect = (): XMLBuilderType =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.a, 'fillRect')
    .up();

const buildStretch = (): XMLBuilderType => {
  const stretchFragment = fragment({ namespaceAlias: drawingNamespaces }).ele(
    namespaces.a,
    'stretch'
  );

  const fillRectFragment = buildFillRect();
  stretchFragment.import(fillRectFragment);

  stretchFragment.up();

  return stretchFragment;
};

const buildSrcRectFragment = (): XMLBuilderType =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.a, 'srcRect')
    .att('b', '0')
    .att('l', '0')
    .att('r', '0')
    .att('t', '0')
    .up();

const buildBinaryLargeImageOrPicture = (
  relationshipId: number
): XMLBuilderType =>
  fragment({
    namespaceAlias: drawingNamespaces,
  })
    .ele(namespaces.a, 'blip')
    .att(namespaces.r, 'embed', `rId${relationshipId}`)
    // FIXME: possible values 'email', 'none', 'print', 'hqprint', 'screen'
    .att('cstate', 'print')
    .up();

const buildBinaryLargeImageOrPictureFill = (
  relationshipId: number
): XMLBuilderType => {
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

const buildNonVisualPictureDrawingProperties = (): XMLBuilderType =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.pic, 'cNvPicPr')
    .up();

const buildNonVisualDrawingProperties = (
  pictureId: number,
  pictureNameWithExtension: string,
  pictureDescription = ''
): XMLBuilderType =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.pic, 'cNvPr')
    .att('id', String(pictureId))
    .att('name', pictureNameWithExtension)
    .att('descr', pictureDescription)
    .up();

const buildNonVisualPictureProperties = (
  pictureId: number,
  pictureNameWithExtension: string,
  pictureDescription?: string
): XMLBuilderType => {
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

type PictureAttributes = {
  description?: string;
  fileNameWithExtension?: string;
  height?: number;
  id?: number;
  relationshipId?: number;
  width?: number;
};

const buildPicture = ({
  id,
  fileNameWithExtension,
  description,
  relationshipId,
  width,
  height,
}: PictureAttributes): XMLBuilderType => {
  const pictureFragment = fragment({
    namespaceAlias: drawingNamespaces,
  }).ele(namespaces.pic, 'pic');
  const nonVisualPicturePropertiesFragment = buildNonVisualPictureProperties(
    id || 0,
    fileNameWithExtension || '',
    description
  );
  pictureFragment.import(nonVisualPicturePropertiesFragment);
  const binaryLargeImageOrPictureFill = buildBinaryLargeImageOrPictureFill(
    relationshipId || 0
  );
  pictureFragment.import(binaryLargeImageOrPictureFill);
  const shapeProperties = buildShapeProperties({ width, height });
  pictureFragment.import(shapeProperties);
  pictureFragment.up();

  return pictureFragment;
};

const buildGraphicData = (
  graphicType: string,
  attributes: PictureAttributes
): XMLBuilderType => {
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

const buildGraphic = (
  graphicType: string,
  attributes: PictureAttributes
): XMLBuilderType => {
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

const buildDrawingObjectNonVisualProperties = (
  pictureId: number,
  pictureName: string
): XMLBuilderType =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.wp, 'docPr')
    .att('id', String(pictureId))
    .att('name', pictureName)
    .up();

const buildWrapSquare = (): XMLBuilderType =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.wp, 'wrapSquare')
    .att('wrapText', 'bothSides')
    .att('distB', '228600')
    .att('distT', '228600')
    .att('distL', '228600')
    .att('distR', '228600')
    .up();

const _buildWrapNone = (): XMLBuilderType =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.wp, 'wrapNone')
    .up();

const buildEffectExtentFragment = (): XMLBuilderType =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.wp, 'effectExtent')
    .att('b', '0')
    .att('l', '0')
    .att('r', '0')
    .att('t', '0')
    .up();

const buildExtent = ({ width, height }: ExtentsAttributes): XMLBuilderType => {
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

const buildPositionV = (): XMLBuilderType =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.wp, 'positionV')
    .att('relativeFrom', 'paragraph')
    .ele(namespaces.wp, 'posOffset')
    .txt('19050')
    .up()
    .up();

const buildPositionH = (): XMLBuilderType =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.wp, 'positionH')
    .att('relativeFrom', 'column')
    .ele(namespaces.wp, 'posOffset')
    .txt('19050')
    .up()
    .up();

const buildSimplePos = (): XMLBuilderType =>
  fragment({ namespaceAlias: drawingNamespaces })
    .ele(namespaces.wp, 'simplePos')
    .att('x', '0')
    .att('y', '0')
    .up();

interface DrawingAttributes extends PictureAttributes {
  height?: number;
  width?: number;
}

const buildAnchoredDrawing = (
  graphicType: string,
  attributes: DrawingAttributes
): XMLBuilderType => {
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
      attributes.id || 0,
      attributes.fileNameWithExtension || ''
    );
  anchoredDrawingFragment.import(drawingObjectNonVisualPropertiesFragment);
  const graphicFragment = buildGraphic(graphicType, attributes);
  anchoredDrawingFragment.import(graphicFragment);

  anchoredDrawingFragment.up();

  return anchoredDrawingFragment;
};

const buildInlineDrawing = (
  graphicType: string,
  attributes: DrawingAttributes
): XMLBuilderType => {
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
      attributes.id || 0,
      attributes.fileNameWithExtension || ''
    );
  inlineDrawingFragment.import(drawingObjectNonVisualPropertiesFragment);
  const graphicFragment = buildGraphic(graphicType, attributes);
  inlineDrawingFragment.import(graphicFragment);

  inlineDrawingFragment.up();

  return inlineDrawingFragment;
};

const buildDrawing = (
  inlineOrAnchored: boolean,
  graphicType: string,
  attributes: DrawingAttributes
): XMLBuilderType => {
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
  // Tracking support exports
  buildRunsFromTextWithTokens,
  buildTextRunFragment,
};
