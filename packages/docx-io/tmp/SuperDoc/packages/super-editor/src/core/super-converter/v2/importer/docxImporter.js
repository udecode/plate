import { getInitialJSON } from '../docxHelper.js';
import { carbonCopy } from '../../../utilities/carbonCopy.js';
import { twipsToInches } from '../../helpers.js';
import { DEFAULT_LINKED_STYLES } from '../../exporter-docx-defs.js';
import { tableNodeHandlerEntity } from './tableImporter.js';
import { drawingNodeHandlerEntity } from './imageImporter.js';
import { trackChangeNodeHandlerEntity } from './trackChangesImporter.js';
import { hyperlinkNodeHandlerEntity } from './hyperlinkImporter.js';
import { runNodeHandlerEntity } from './runNodeImporter.js';
import { textNodeHandlerEntity } from './textNodeImporter.js';
import { paragraphNodeHandlerEntity } from './paragraphNodeImporter.js';
import { annotationNodeHandlerEntity } from './annotationImporter.js';
import { sdtNodeHandlerEntity } from './structuredDocumentNodeImporter.js';
import { standardNodeHandlerEntity } from './standardNodeImporter.js';
import { lineBreakNodeHandlerEntity } from './lineBreakImporter.js';
import { bookmarkNodeHandlerEntity } from './bookmarkNodeImporter.js';
import { alternateChoiceHandler } from './alternateChoiceImporter.js';
import { autoPageHandlerEntity, autoTotalPageCountEntity } from './autoPageNumberImporter.js';
import { tabNodeEntityHandler } from './tabImporter.js';
import { listHandlerEntity } from './listImporter.js';
import { pictNodeHandlerEntity } from './pictNodeImporter.js';
import { importCommentData } from './documentCommentsImporter.js';
import { getDefaultStyleDefinition } from './paragraphNodeImporter.js';
import { baseNumbering } from '../exporter/helpers/base-list.definitions.js';

/**
 * @typedef {import()} XmlNode
 * @typedef {{type: string, content: *, attrs: {}}} PmNodeJson
 * @typedef {{type: string, attrs: {}}} PmMarkJson
 *
 * @typedef {(nodes: XmlNode[], docx: ParsedDocx, insideTrackCahange: boolean) => PmNodeJson[]} NodeListHandlerFn
 * @typedef {{handler: NodeListHandlerFn, handlerEntities: NodeHandlerEntry[]}} NodeListHandler
 *
 * @typedef {(nodes: XmlNode[], docx: ParsedDocx, nodeListHandler: NodeListHandler, insideTrackCahange: boolean) => {nodes: PmNodeJson[], consumed: number}} NodeHandler
 * @typedef {{handlerName: string, handler: NodeHandler}} NodeHandlerEntry
 */

/**
 *
 * @param {ParsedDocx} docx
 * @param {SuperConverter} converter instance.
 * @param {Editor} editor instance.
 * @returns {{pmDoc: PmNodeJson, savedTagsToRestore: XmlNode, pageStyles: *}|null}
 */
export const createDocumentJson = (docx, converter, editor) => {
  const json = carbonCopy(getInitialJSON(docx));
  if (!json) return null;

  // Track initial document structure
  if (converter?.telemetry) {
    const files = Object.keys(docx).map((filePath) => {
      const parts = filePath.split('/');
      return {
        filePath,
        fileDepth: parts.length,
        fileType: filePath.split('.').pop(),
      };
    });

    converter.telemetry.trackFileStructure(
      {
        totalFiles: files.length,
        maxDepth: Math.max(...files.map((f) => f.fileDepth)),
        totalNodes: 0,
        files,
      },
      converter.fileSource,
      converter.documentId,
      converter.documentInternalId,
    );
  }

  const nodeListHandler = defaultNodeListHandler();
  const bodyNode = json.elements[0].elements.find((el) => el.name === 'w:body');

  if (bodyNode) {
    const node = bodyNode;
    const ignoreNodes = ['w:sectPr'];
    const content = node.elements?.filter((n) => !ignoreNodes.includes(n.name)) ?? [];
    const comments = importCommentData({ docx, nodeListHandler, converter, editor });

    // Track imported lists
    const lists = {};
    const parsedContent = nodeListHandler.handler({
      nodes: content,
      nodeListHandler,
      docx,
      converter,
      editor,
      lists,
    });

    const result = {
      type: 'doc',
      content: parsedContent,
      attrs: {
        attributes: json.elements[0].attributes,
      },
    };

    // Not empty document
    if (result.content.length > 1) {
      converter?.telemetry?.trackUsage('document_import', {
        documentType: 'docx',
        timestamp: new Date().toISOString(),
      });
    }

    return {
      pmDoc: result,
      savedTagsToRestore: node,
      pageStyles: getDocumentStyles(node, docx, converter, editor),
      comments,
      linkedStyles: getStyleDefinitions(docx, converter, editor),
      numbering: getNumberingDefinitions(docx),
    };
  }
  return null;
};

export const defaultNodeListHandler = () => {
  const entities = [
    alternateChoiceHandler,
    runNodeHandlerEntity,
    pictNodeHandlerEntity,
    listHandlerEntity,
    paragraphNodeHandlerEntity,
    textNodeHandlerEntity,
    lineBreakNodeHandlerEntity,
    annotationNodeHandlerEntity,
    sdtNodeHandlerEntity,
    bookmarkNodeHandlerEntity,
    hyperlinkNodeHandlerEntity,
    drawingNodeHandlerEntity,
    trackChangeNodeHandlerEntity,
    tableNodeHandlerEntity,
    tabNodeEntityHandler,
    autoPageHandlerEntity,
    autoTotalPageCountEntity,
    standardNodeHandlerEntity, // This is the last one as it can handle everything
  ];

  const handler = createNodeListHandler(entities);
  return {
    handler,
    handlerEntities: entities,
  };
};

/**
 *
 * @param {NodeHandlerEntry[]} nodeHandlers
 */
const createNodeListHandler = (nodeHandlers) => {
  /**
   * Gets safe element context even if index is out of bounds
   * @param {Array} elements Array of elements
   * @param {number} index Index to check
   * @param {Object} processedNode result node
   * @param {String} path Occurrence filename
   * @returns {Object} Safe context object
   */
  const getSafeElementContext = (elements, index, processedNode, path) => {
    if (!elements || index < 0 || index >= elements.length) {
      return {
        elementIndex: index,
        error: 'index_out_of_bounds',
        arrayLength: elements?.length,
      };
    }

    const element = elements[index];
    return {
      elementName: element?.name,
      attributes: processedNode?.attrs,
      marks: processedNode?.marks,
      elementPath: path,
      type: processedNode?.type,
      content: processedNode?.content,
    };
  };

  const nodeListHandlerFn = ({
    nodes: elements,
    docx,
    insideTrackChange,
    converter,
    editor,
    filename,
    parentStyleId,
    lists,
  }) => {
    if (!elements || !elements.length) return [];

    const processedElements = [];

    try {
      for (let index = 0; index < elements.length; index++) {
        try {
          const nodesToHandle = elements.slice(index);
          if (!nodesToHandle || nodesToHandle.length === 0) {
            continue;
          }

          const { nodes, consumed, unhandled } = nodeHandlers.reduce(
            (res, handler) => {
              if (res.consumed > 0) return res;

              return handler.handler({
                nodes: nodesToHandle,
                docx,
                nodeListHandler: { handler: nodeListHandlerFn, handlerEntities: nodeHandlers },
                insideTrackChange,
                converter,
                editor,
                filename,
                parentStyleId,
                lists,
              });
            },
            { nodes: [], consumed: 0 },
          );

          // Only track unhandled nodes that should have been handled
          const context = getSafeElementContext(elements, index, nodes[0], `/word/${filename || 'document.xml'}`);
          if (unhandled) {
            if (!context.elementName) continue;

            converter?.telemetry?.trackStatistic('unknown', context);
            continue;
          } else {
            converter?.telemetry?.trackStatistic('node', context);

            // Use Telemetry to track list item attributes
            if (context.type === 'orderedList' || context.type === 'bulletList') {
              context.content.forEach((item) => {
                const innerItemContext = getSafeElementContext([item], 0, item, `/word/${filename || 'document.xml'}`);
                converter?.telemetry?.trackStatistic('attributes', innerItemContext);
              });
            }

            const hasHighlightMark = nodes[0]?.marks?.find((mark) => mark.type === 'highlight');
            if (hasHighlightMark) {
              converter?.docHiglightColors.add(hasHighlightMark.attrs.color.toUpperCase());
            }
          }

          if (consumed > 0) {
            index += consumed - 1;
          }

          // Process and store nodes (no tracking needed for success)
          if (nodes) {
            nodes.forEach((node) => {
              if (node?.type && !['runProperties'].includes(node.type)) {
                if (node.type === 'text' && Array.isArray(node.content) && !node.content.length) {
                  return;
                }
                processedElements.push(node);
              }
            });
          }
        } catch (error) {
          console.debug('Import error', error);
          editor?.emit('exception', { error });

          converter?.telemetry?.trackStatistic('error', {
            type: 'processing_error',
            message: error.message,
            name: error.name,
            stack: error.stack,
            fileName: `/word/${filename || 'document.xml'}`,
          });
        }
      }

      return processedElements;
    } catch (error) {
      console.debug('Error during import', error);
      editor?.emit('exception', { error });

      // Track only catastrophic handler failures
      converter?.telemetry?.trackStatistic('error', {
        type: 'fatal_error',
        message: error.message,
        name: error.name,
        stack: error.stack,
        fileName: `/word/${filename || 'document.xml'}`,
      });

      throw error;
    }
  };
  return nodeListHandlerFn;
};

/**
 *
 * @param {XmlNode} node
 * @param {ParsedDocx} docx
 * @param {SuperConverter} converter instance.
 * @param {Editor} editor instance.
 * @returns {Object} The document styles object
 */
function getDocumentStyles(node, docx, converter, editor) {
  const sectPr = node.elements?.find((n) => n.name === 'w:sectPr');
  const styles = {};

  sectPr?.elements?.forEach((el) => {
    const { name, attributes } = el;
    switch (name) {
      case 'w:pgSz':
        styles['pageSize'] = {
          width: twipsToInches(attributes['w:w']),
          height: twipsToInches(attributes['w:h']),
        };
        break;
      case 'w:pgMar':
        styles['pageMargins'] = {
          top: twipsToInches(attributes['w:top']),
          right: twipsToInches(attributes['w:right']),
          bottom: twipsToInches(attributes['w:bottom']),
          left: twipsToInches(attributes['w:left']),
          header: twipsToInches(attributes['w:header']),
          footer: twipsToInches(attributes['w:footer']),
          gutter: twipsToInches(attributes['w:gutter']),
        };
        break;
      case 'w:cols':
        styles['columns'] = {
          space: twipsToInches(attributes['w:space']),
          num: attributes['w:num'],
          equalWidth: attributes['w:equalWidth'],
        };
        break;
      case 'w:docGrid':
        styles['docGrid'] = {
          linePitch: twipsToInches(attributes['w:linePitch']),
          type: attributes['w:type'],
        };
        break;
      case 'w:titlePg':
        converter.headerIds.titlePg = true;
    }
  });

  // Import headers and footers. Stores them in converter.headers and converter.footers
  importHeadersFooters(docx, converter, editor);
  styles.alternateHeaders = isAlternatingHeadersOddEven(docx);
  return styles;
}

/**
 * Import style definitions from the document
 *
 * @param {Object} docx The parsed docx object
 * @returns {Object[]} The style definitions
 */
function getStyleDefinitions(docx) {
  const styles = docx['word/styles.xml'];
  if (!styles) return [];

  const { elements } = styles.elements[0];
  const styleDefinitions = elements.filter((el) => el.name === 'w:style');

  // Track latent style exceptions
  const latentStyles = elements.find((el) => el.name === 'w:latentStyles');
  const matchedLatentStyles = [];
  latentStyles?.elements.forEach((el) => {
    const { attributes } = el;
    const match = styleDefinitions.find((style) => style.attributes['w:styleId'] === attributes['w:name']);
    if (match) matchedLatentStyles.push(el);
  });

  // Parse all styles
  const allParsedStyles = [];
  styleDefinitions.forEach((style) => {
    const id = style.attributes['w:styleId'];
    const parsedStyle = getDefaultStyleDefinition(id, docx);

    const importedStyle = {
      id: style.attributes['w:styleId'],
      type: style.attributes['w:type'],
      definition: parsedStyle,
      attributes: {},
    };

    allParsedStyles.push(importedStyle);
  });

  return allParsedStyles;
}

/**
 * Add default styles if missing. Default styles are:
 *
 * Normal, Title, Subtitle, Heading1, Heading2, Heading3
 *
 * Does not mutate the original docx object
 * @param {Object} styles The parsed docx styles [word/styles.xml]
 * @returns {Object | null} The updated styles object with default styles
 */
export function addDefaultStylesIfMissing(styles) {
  // Do not mutate the original docx object
  if (!styles) return null;
  const updatedStyles = carbonCopy(styles);
  const { elements } = updatedStyles.elements[0];

  Object.keys(DEFAULT_LINKED_STYLES).forEach((styleId) => {
    const existsOnDoc = elements.some((el) => el.attributes?.['w:styleId'] === styleId);
    if (!existsOnDoc) {
      const missingStyle = DEFAULT_LINKED_STYLES[styleId];
      updatedStyles.elements[0].elements.push(missingStyle);
    }
  });

  return updatedStyles;
}

/**
 * Import all header and footer definitions
 *
 * @param {Object} docx The parsed docx object
 * @param {Object} converter The converter instance
 * @param {Editor} mainEditor The editor instance
 */
const importHeadersFooters = (docx, converter, mainEditor) => {
  const rels = docx['word/_rels/document.xml.rels'];
  const relationships = rels.elements.find((el) => el.name === 'Relationships');
  const { elements } = relationships;

  const headerType = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/header';
  const footerType = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer';
  const headers = elements.filter((el) => el.attributes['Type'] === headerType);
  const footers = elements.filter((el) => el.attributes['Type'] === footerType);

  const sectPr = findSectPr(docx['word/document.xml']) || [];
  const allSectPrElements = sectPr.flatMap((el) => el.elements);
  if (!mainEditor) return;

  // Copy class instance(private fields and inherited methods won't work)
  const editor = { ...mainEditor };
  editor.options.annotations = true;

  headers.forEach((header) => {
    const { rId, referenceFile, currentFileName } = getHeaderFooterSectionData(header, docx);

    const sectPrHeader = allSectPrElements.find(
      (el) => el.name === 'w:headerReference' && el.attributes['r:id'] === rId,
    );
    let sectionType = sectPrHeader?.attributes['w:type'];
    if (converter.headerIds[sectionType]) sectionType = null;
    const nodeListHandler = defaultNodeListHandler();
    const schema = nodeListHandler.handler({
      nodes: referenceFile.elements[0].elements,
      nodeListHandler,
      docx,
      converter,
      editor,
      filename: currentFileName,
    });

    if (!converter.headerIds.ids) converter.headerIds.ids = [];
    converter.headerIds.ids.push(rId);
    converter.headers[rId] = { type: 'doc', content: [...schema] };
    sectionType && (converter.headerIds[sectionType] = rId);
  });

  const titlePg = allSectPrElements?.find((el) => el.name === 'w:titlePg');
  if (titlePg) converter.headerIds.titlePg = true;

  footers.forEach((footer) => {
    const { rId, referenceFile, currentFileName } = getHeaderFooterSectionData(footer, docx);
    const sectPrFooter = allSectPrElements.find(
      (el) => el.name === 'w:footerReference' && el.attributes['r:id'] === rId,
    );
    const sectionType = sectPrFooter?.attributes['w:type'];

    const nodeListHandler = defaultNodeListHandler();
    const schema = nodeListHandler.handler({
      nodes: referenceFile.elements[0].elements,
      nodeListHandler,
      docx,
      converter,
      editor,
      filename: currentFileName,
    });

    if (!converter.footerIds.ids) converter.footerIds.ids = [];
    converter.footerIds.ids.push(rId);
    converter.footers[rId] = { type: 'doc', content: [...schema] };
    converter.footerIds[sectionType] = rId;
  });
};

const findSectPr = (obj, result = []) => {
  for (const key in obj) {
    if (obj[key] === 'w:sectPr') {
      result.push(obj);
    } else if (typeof obj[key] === 'object') {
      findSectPr(obj[key], result);
    }
  }
  return result;
};

/**
 * Get section data from the header or footer
 *
 * @param {Object} sectionData The section data (header or footer)
 * @param {Object} docx The parsed docx object
 * @returns {Object} The section data
 */
const getHeaderFooterSectionData = (sectionData, docx) => {
  const rId = sectionData.attributes.Id;
  const target = sectionData.attributes.Target;
  const referenceFile = docx[`word/${target}`];
  const currentFileName = target;
  return {
    rId,
    referenceFile,
    currentFileName,
  };
};

/**
 * Import this document's numbering.xml definitions
 * They will be stored into converter.numbering
 *
 * @param {Object} docx The parsed docx
 * @returns {Object} The numbering definitions
 */
function getNumberingDefinitions(docx) {
  let numbering = docx['word/numbering.xml'];
  if (!numbering || !numbering.elements?.length || !numbering.elements[0].elements?.length) numbering = baseNumbering;

  const elements = numbering.elements[0].elements;
  const abstractDefs = elements.filter((el) => el.name === 'w:abstractNum');
  const definitions = elements.filter((el) => el.name === 'w:num');

  const abstractDefinitions = {};
  abstractDefs.forEach((el) => {
    const abstractId = Number(el.attributes['w:abstractNumId']);
    abstractDefinitions[abstractId] = el;
  });

  let importListDefs = {};
  definitions.forEach((el) => {
    const numId = Number(el.attributes['w:numId']);
    importListDefs[numId] = el;
  });

  const listDefsEntries = Object.entries(importListDefs);
  const foundByDurableId = listDefsEntries.filter(([, def]) => def.attributes?.['w16cid:durableId'] === '485517411');
  // To fix corrupted numbering.xml file.
  if (foundByDurableId.length > 1) {
    importListDefs = Object.fromEntries(
      listDefsEntries.filter(([, def]) => def.attributes?.['w16cid:durableId'] !== '485517411'),
    );
  }

  return {
    abstracts: abstractDefinitions,
    definitions: importListDefs,
  };
}

/**
 * Check if the document has alternating headers and footers.
 *
 * @param {Object} docx The parsed docx object
 * @returns {Boolean} True if the document has alternating headers and footers, false otherwise
 */
const isAlternatingHeadersOddEven = (docx) => {
  const settings = docx['word/settings.xml'];
  if (!settings || !settings.elements?.length) return false;

  const { elements = [] } = settings.elements[0];
  const evenOdd = elements.find((el) => el.name === 'w:evenAndOddHeaders');
  return !!evenOdd;
};
