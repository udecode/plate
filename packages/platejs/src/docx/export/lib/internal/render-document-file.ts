// @ts-expect-error - no types available
import HTMLToVDOM from 'html-to-vdom';
// @ts-expect-error - no types available
import isVNode from 'virtual-dom/vnode/is-vnode.js';
// @ts-expect-error - no types available
import isVText from 'virtual-dom/vnode/is-vtext.js';
// @ts-expect-error - no types available
import VNode from 'virtual-dom/vnode/vnode.js';
// @ts-expect-error - no types available
import VText from 'virtual-dom/vnode/vtext.js';
import { fragment } from 'xmlbuilder2';
import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces';

import namespaces from './namespaces';
import { vNodeHasChildren } from './vnode';
import {
  buildImage,
  buildList,
  buildParagraph,
  buildTable,
} from './xml-builder';

type XMLBuilderType = XMLBuilder;

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
  children?: Array<VNodeType | VTextType>;
  properties?: VNodeProperties;
  tagName?: string;
  [key: string]: unknown;
};

type VTextType = {
  text: string;
  [key: string]: unknown;
};

type VTree = VNodeType | VTextType | Array<VNodeType | VTextType>;

// Types for DocxDocumentInstance
type MediaFileResponse = {
  fileContent: string;
  fileNameWithExtension: string;
  id: number;
};

type DocxDocumentInstance = {
  allowRemoteImages?: boolean;
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

// Regex for parsing numeric values from margin-left
const MARGIN_NUMBER_REGEX = /(\d+)/;

// Inline elements that should be grouped into a single paragraph
const INLINE_ELEMENTS = new Set([
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
]);

// Check if a vNode is an inline element
const isInlineElement = (node: VNodeType | VTextType): boolean =>
  isVText(node) ||
  (isVNode(node) && INLINE_ELEMENTS.has((node as VNodeType).tagName || ''));

// Elements that need special handling and should not be wrapped in inline grouping
const SPECIAL_BLOCK_ELEMENTS = new Set([
  'img',
  'table',
  'figure',
  'ul',
  'ol',
  'blockquote',
  'pre',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'video',
  'audio',
  'iframe',
]);

// Recursively check if a vNode contains any special block elements
const containsSpecialElements = (node: VNodeType | VTextType): boolean => {
  if (!isVNode(node)) return false;
  const vNode = node as VNodeType;
  if (SPECIAL_BLOCK_ELEMENTS.has(vNode.tagName || '')) return true;
  if (vNodeHasChildren(vNode)) {
    return (vNode.children || []).some((child) =>
      containsSpecialElements(child)
    );
  }
  return false;
};

const convertHTML = HTMLToVDOM({
  VNode,
  VText,
});

type ContentGroup = {
  children?: Array<VNodeType | VTextType>;
  node?: VNodeType | VTextType;
  type: 'block' | 'inline';
};

async function findXMLEquivalent(
  docxDocumentInstance: DocxDocumentInstance,
  vNode: VNodeType,
  xmlFragment: XMLBuilderType
): Promise<void> {
  // Check if this element contains list children (for paragraphs that wrap lists)
  const hasListChildren =
    vNodeHasChildren(vNode) &&
    (vNode.children || []).some(
      (child) =>
        isVNode(child) &&
        ['ul', 'ol'].includes((child as VNodeType).tagName || '')
    );

  // Reset list tracking for non-list elements to break consecutive list sequences
  // But don't reset for container elements that might wrap lists
  // Also don't reset for paragraphs that contain lists (Plate's list rendering pattern)
  const containerElements = [
    'ol',
    'ul',
    'html',
    'body',
    'div',
    'section',
    'article',
    'main',
  ];
  if (!containerElements.includes(vNode.tagName || '') && !hasListChildren) {
    resetListTracking();
  }

  if (
    vNode.tagName === 'div' &&
    (vNode.properties?.attributes?.class === 'page-break' ||
      (vNode.properties?.style && vNode.properties.style['page-break-after']))
  ) {
    const paragraphFragment = fragment({ namespaceAlias: { w: namespaces.w } })
      .ele('@w', 'p')
      .ele('@w', 'r')
      .ele('@w', 'br')
      .att('@w', 'type', 'page')
      .up()
      .up()
      .up();

    xmlFragment.import(paragraphFragment);
    return;
  }

  // Handle block equation with OMML
  if (
    vNode.tagName === 'div' &&
    vNode.properties &&
    vNode.properties.attributes &&
    vNode.properties.attributes['data-equation-omml']
  ) {
    const ommlString = vNode.properties.attributes['data-equation-omml'];
    try {
      // Create a paragraph containing the OMML
      const paragraphFragment = fragment({
        namespaceAlias: { w: namespaces.w },
      })
        .ele('@w', 'p')
        .ele('@w', 'pPr')
        .ele('@w', 'jc')
        .att('@w', 'val', 'center')
        .up()
        .up();
      // Parse and import the OMML
      const ommlFragment = fragment().ele(ommlString);
      paragraphFragment.first().import(ommlFragment);
      paragraphFragment.first().up();

      xmlFragment.import(paragraphFragment);
      return;
    } catch {
      console.warn('Failed to parse OMML for block equation');
    }
  }

  // Handle div elements - check if they contain only inline children
  // Skip divs that contain special elements that need their own processing
  if (vNode.tagName === 'div' && vNodeHasChildren(vNode)) {
    // Check recursively if div contains any special elements that need dedicated handling
    const hasSpecialChildren = (vNode.children || []).some((child) =>
      containsSpecialElements(child)
    );

    // If div has special children, let default processing handle it
    if (hasSpecialChildren) {
      // Fall through to default processing at end of function
    } else {
      const allInline = (vNode.children || []).every((child) =>
        isInlineElement(child)
      );

      if (allInline && (vNode.children || []).length > 0) {
        // Wrap all inline children in a single paragraph
        const paragraphVNode = new VNode('p', vNode.properties, vNode.children);
        const paragraphFragment = await buildParagraph(
          paragraphVNode,
          {},
          docxDocumentInstance
        );
        xmlFragment.import(paragraphFragment);
        return;
      }

      // Handle mixed content: group consecutive inline elements into paragraphs
      const groups: ContentGroup[] = [];
      let currentInlineGroup: Array<VNodeType | VTextType> = [];

      for (const child of vNode.children || []) {
        if (isInlineElement(child)) {
          currentInlineGroup.push(child);
        } else {
          // Flush current inline group as a paragraph
          if (currentInlineGroup.length > 0) {
            groups.push({ type: 'inline', children: currentInlineGroup });
            currentInlineGroup = [];
          }
          // Add block element
          groups.push({ type: 'block', node: child });
        }
      }
      // Flush remaining inline group
      if (currentInlineGroup.length > 0) {
        groups.push({ type: 'inline', children: currentInlineGroup });
      }

      // Process groups
      for (const group of groups) {
        if (group.type === 'inline' && group.children) {
          const paragraphVNode = new VNode('p', null, group.children);
          const paragraphFragment = await buildParagraph(
            paragraphVNode,
            {},
            docxDocumentInstance
          );
          xmlFragment.import(paragraphFragment);
        } else if (group.node) {
          await convertVTreeToXML(
            docxDocumentInstance,
            group.node,
            xmlFragment
          );
        }
      }
      return;
    }
  }

  switch (vNode.tagName) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6': {
      // Check if the heading has a bookmark anchor (an <a> or <span> with id but no href)
      let bookmarkId: string | null = null;
      let headingVNode: VNodeType = vNode;
      if (vNodeHasChildren(vNode) && (vNode.children || []).length > 0) {
        const firstChild = (vNode.children || [])[0] as VNodeType;
        // Check both properties.id and properties.attributes.id for the bookmark anchor
        const anchorId =
          firstChild.properties?.id || firstChild.properties?.attributes?.id;
        const hasHref =
          firstChild.properties?.href ||
          firstChild.properties?.attributes?.href;

        if (
          isVNode(firstChild) &&
          (firstChild.tagName === 'a' || firstChild.tagName === 'span') &&
          anchorId &&
          !hasHref
        ) {
          bookmarkId = anchorId;
          // Create a modified vNode without the bookmark anchor
          headingVNode = new VNode(
            vNode.tagName,
            vNode.properties,
            (vNode.children || []).slice(1)
          );
        }
      }

      const headingFragment = await buildParagraph(
        headingVNode,
        {
          paragraphStyle: `Heading${vNode.tagName[1]}`,
          bookmarkId,
        },
        docxDocumentInstance
      );
      xmlFragment.import(headingFragment);
      return;
    }
    case 'hr': {
      // Create horizontal rule as a paragraph with bottom border
      const hrFragment = fragment({ namespaceAlias: { w: namespaces.w } })
        .ele('@w', 'p')
        .ele('@w', 'pPr')
        .ele('@w', 'pBdr')
        .ele('@w', 'bottom')
        .att('@w', 'val', 'single')
        .att('@w', 'sz', '6')
        .att('@w', 'space', '1')
        .att('@w', 'color', 'auto')
        .up()
        .up()
        .up()
        .up();
      xmlFragment.import(hrFragment);
      return;
    }
    case 'span':
    case 'strong':
    case 'b':
    case 'em':
    case 'i':
    case 'u':
    case 'ins':
    case 'strike':
    case 'del':
    case 's':
    case 'sub':
    case 'sup':
    case 'mark':
    case 'p': {
      // Check if paragraph contains list children (ul/ol)
      // If so, process them separately as lists
      if (vNodeHasChildren(vNode)) {
        const listChildren = (vNode.children || []).filter(
          (child) =>
            isVNode(child) &&
            ['ul', 'ol'].includes((child as VNodeType).tagName || '')
        );
        if (listChildren.length > 0) {
          // Process non-list children as paragraph content first
          const nonListChildren = (vNode.children || []).filter(
            (child) =>
              !isVNode(child) ||
              !['ul', 'ol'].includes((child as VNodeType).tagName || '')
          );
          if (nonListChildren.length > 0) {
            const modifiedVNode = new VNode(
              vNode.tagName,
              vNode.properties,
              nonListChildren
            );
            const paragraphFragment = await buildParagraph(
              modifiedVNode,
              {},
              docxDocumentInstance
            );
            xmlFragment.import(paragraphFragment);
          }
          // Process list children separately with tracking
          // Get indent level from parent paragraph
          const indentLevel = getIndentLevel(vNode);

          for (const listChild of listChildren) {
            const listNode = listChild as VNodeType;
            // Get existing numbering ID for this type+level, if any
            const { lastListNumberingId: existingId } = getListTracking(
              listNode.tagName || '',
              indentLevel
            );

            let numberingId: number;
            if (existingId !== null) {
              // Reuse existing numbering for this type+level
              numberingId = existingId;
            } else {
              // Create new numbering for this type+level
              numberingId = docxDocumentInstance.createNumbering(
                (listNode.tagName || 'ul') as 'ol' | 'ul',
                listNode.properties
              );
            }

            setListTracking(listNode.tagName || '', numberingId, indentLevel);
            await buildList(
              listNode,
              docxDocumentInstance,
              xmlFragment,
              numberingId,
              indentLevel
            );
          }
          return;
        }
      }
      const paragraphFragment = await buildParagraph(
        vNode,
        {},
        docxDocumentInstance
      );
      xmlFragment.import(paragraphFragment);
      return;
    }
    case 'a':
    case 'blockquote':
    case 'code':
    case 'pre': {
      const paragraphFragment = await buildParagraph(
        vNode,
        {},
        docxDocumentInstance
      );
      xmlFragment.import(paragraphFragment);
      return;
    }
    case 'figure': {
      if (vNodeHasChildren(vNode)) {
        // Helper to find and process img elements recursively
        const processImageInNode = async (
          node: VNodeType | VTextType
        ): Promise<void> => {
          if (!isVNode(node)) return;
          const vn = node as VNodeType;
          if (vn.tagName === 'img') {
            const imageFragment = await buildImage(docxDocumentInstance, vn);
            if (imageFragment) {
              xmlFragment.import(imageFragment);
            }
            return;
          }
          if (vNodeHasChildren(vn)) {
            for (const child of vn.children || []) {
              await processImageInNode(child);
            }
          }
        };

        for (let index = 0; index < (vNode.children || []).length; index++) {
          const childVNode = (vNode.children || [])[index] as VNodeType;
          if (childVNode.tagName === 'table') {
            const tableFragment = await buildTable(
              childVNode,
              {
                maximumWidth: docxDocumentInstance.availableDocumentSpace,
                rowCantSplit: docxDocumentInstance.tableRowCantSplit,
              },
              docxDocumentInstance
            );
            xmlFragment.import(tableFragment);
            // Adding empty paragraph for space after table
            const emptyParagraphFragment = await buildParagraph(null, {});
            xmlFragment.import(emptyParagraphFragment);
          } else if (childVNode.tagName === 'img') {
            const imageFragment = await buildImage(
              docxDocumentInstance,
              childVNode
            );
            if (imageFragment) {
              xmlFragment.import(imageFragment);
            }
          } else if (childVNode.tagName === 'figcaption') {
            // Handle image caption
            const captionFragment = await buildParagraph(
              childVNode,
              {},
              docxDocumentInstance
            );
            xmlFragment.import(captionFragment);
          } else if (childVNode.tagName === 'div') {
            // Look for img and figcaption inside div (static component pattern)
            await processImageInNode(childVNode);
            // Also check for figcaption in the div
            if (vNodeHasChildren(childVNode)) {
              for (const divChild of childVNode.children || []) {
                if (
                  isVNode(divChild) &&
                  (divChild as VNodeType).tagName === 'figcaption'
                ) {
                  const captionFragment = await buildParagraph(
                    divChild,
                    {},
                    docxDocumentInstance
                  );
                  xmlFragment.import(captionFragment);
                }
              }
            }
          }
        }
      }
      return;
    }
    case 'table': {
      const tableFragment = await buildTable(
        vNode,
        {
          maximumWidth: docxDocumentInstance.availableDocumentSpace,
          rowCantSplit: docxDocumentInstance.tableRowCantSplit,
        },
        docxDocumentInstance
      );
      xmlFragment.import(tableFragment);
      // Adding empty paragraph for space after table
      const emptyParagraphFragment = await buildParagraph(null, {});
      xmlFragment.import(emptyParagraphFragment);
      return;
    }
    case 'ol':
    case 'ul': {
      // Get indent level from the list element
      const indentLevel = getIndentLevel(vNode);

      // Get existing numbering ID for this type+level, if any
      const { lastListNumberingId: existingId } = getListTracking(
        vNode.tagName,
        indentLevel
      );

      let numberingId: number;
      if (existingId !== null) {
        // Reuse existing numbering for this type+level
        numberingId = existingId;
      } else {
        // Create a new numbering ID for a new list sequence
        numberingId = docxDocumentInstance.createNumbering(
          vNode.tagName,
          vNode.properties
        );
      }

      // Update tracking with indent level
      setListTracking(vNode.tagName, numberingId, indentLevel);

      await buildList(
        vNode,
        docxDocumentInstance,
        xmlFragment,
        numberingId,
        indentLevel
      );
      return;
    }
    case 'img': {
      const imageFragment = await buildImage(docxDocumentInstance, vNode);
      if (imageFragment) {
        xmlFragment.import(imageFragment);
      }
      return;
    }
    case 'br': {
      const linebreakFragment = await buildParagraph(null, {});
      xmlFragment.import(linebreakFragment);
      return;
    }
    case 'head': {
      return;
    }
    case undefined: {
      break;
    }
  }
  if (vNodeHasChildren(vNode)) {
    for (let index = 0; index < (vNode.children || []).length; index++) {
      const childVNode = (vNode.children || [])[index];

      await convertVTreeToXML(docxDocumentInstance, childVNode, xmlFragment);
    }
  }
}

// Track consecutive lists to share numbering IDs
// Use a map to track numbering per indent level: { 'ol_0': id, 'ol_1': id, ... }
const listNumberingByLevel = new Map<string, number>();
let _lastListType: string | null = null;
let _lastIndentLevel = 0;

// Helper to extract indent level from vNode or parent paragraph
function getIndentLevel(
  vNode: VNodeType | null,
  parentVNode: VNodeType | null = null
): number {
  // Check margin-left style which indicates indent level
  const marginLeft =
    vNode?.properties?.style?.['margin-left'] ||
    parentVNode?.properties?.style?.['margin-left'];

  if (marginLeft) {
    // Parse margin-left value (e.g., "24px", "48px")
    const match = marginLeft.match(MARGIN_NUMBER_REGEX);
    if (match) {
      const px = Number.parseInt(match[1], 10);
      // Assuming 24px per indent level in Plate
      // Subtract 1 because Plate uses indent=1 for first level, but Word uses level=0
      const plateIndent = Math.round(px / 24);
      return Math.max(0, plateIndent - 1);
    }
  }

  return 0;
}

export async function convertVTreeToXML(
  docxDocumentInstance: DocxDocumentInstance,
  vTree: VTree | null,
  xmlFragment: XMLBuilderType
): Promise<XMLBuilderType | string> {
  if (!vTree) {
    return '';
  }
  if (Array.isArray(vTree) && vTree.length) {
    for (const vNode of vTree) {
      await convertVTreeToXML(docxDocumentInstance, vNode, xmlFragment);
    }
  } else if (isVNode(vTree)) {
    await findXMLEquivalent(
      docxDocumentInstance,
      vTree as VNodeType,
      xmlFragment
    );
  } else if (isVText(vTree)) {
    const paragraphFragment = await buildParagraph(
      vTree as VTextType,
      {},
      docxDocumentInstance
    );
    xmlFragment.import(paragraphFragment);
  }
  return xmlFragment;
}

export function resetListTracking(): void {
  listNumberingByLevel.clear();
  _lastListType = null;
  _lastIndentLevel = 0;
}

export function getListTracking(
  listType: string,
  indentLevel = 0
): { lastListNumberingId: number | null } {
  const key = `${listType}_${indentLevel}`;
  return {
    lastListNumberingId: listNumberingByLevel.get(key) || null,
  };
}

export function setListTracking(
  type: string,
  numberingId: number,
  indentLevel = 0
): void {
  _lastListType = type;
  _lastIndentLevel = indentLevel;
  const key = `${type}_${indentLevel}`;
  listNumberingByLevel.set(key, numberingId);
}

async function renderDocumentFile(
  docxDocumentInstance: DocxDocumentInstance
): Promise<XMLBuilderType> {
  // Reset list tracking at the start of each document render
  resetListTracking();

  const vTree = convertHTML(docxDocumentInstance.htmlString);

  const xmlFragment = fragment({ namespaceAlias: { w: namespaces.w } });

  const populatedXmlFragment = await convertVTreeToXML(
    docxDocumentInstance,
    vTree,
    xmlFragment
  );

  return populatedXmlFragment as XMLBuilderType;
}

export default renderDocumentFile;
