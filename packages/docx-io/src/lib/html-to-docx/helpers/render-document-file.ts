/* biome-ignore-all lint/complexity/useOptionalChain: legacy code */
/* biome-ignore-all lint/style/useForOf: legacy code */
/* biome-ignore-all lint/nursery/useMaxParams: legacy code */
// @ts-expect-error - no types available
import { default as HTMLToVDOM } from 'html-to-vdom';
// @ts-expect-error - no types available
import isVNode from 'virtual-dom/vnode/is-vnode.js';
// @ts-expect-error - no types available
import isVText from 'virtual-dom/vnode/is-vtext.js';
// @ts-expect-error - no types available
import VNode from 'virtual-dom/vnode/vnode.js';
// @ts-expect-error - no types available
import VText from 'virtual-dom/vnode/vtext.js';
import type { XMLBuilder } from 'xmlbuilder2/lib/interfaces';
import { fragment } from 'xmlbuilder2';

type XMLBuilderType = XMLBuilder;

// @ts-expect-error - no types available
import mimeTypes from 'mime-types';

import { imageType, internalRelationship } from '../constants';
import namespaces from '../namespaces';
import { getImageDimensions } from '../utils/image-dimensions';
import imageToBase64 from '../utils/image-to-base64';
import { isValidUrl } from '../utils/url';
import { vNodeHasChildren } from '../utils/vnode';
// FIXME: remove the cyclic dependency
import * as xmlBuilder from './xml-builder';

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

type VTree = VNodeType | VTextType | (VNodeType | VTextType)[];

// Types for DocxDocumentInstance
type MediaFileResponse = {
  fileContent: string;
  fileNameWithExtension: string;
  id: number;
};

type DocxDocumentInstance = {
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
const INLINE_ELEMENTS = [
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
];

// Check if a vNode is an inline element
const isInlineElement = (node: VNodeType | VTextType): boolean =>
  isVText(node) ||
  (isVNode(node) &&
    INLINE_ELEMENTS.includes((node as VNodeType).tagName || ''));

// Elements that need special handling and should not be wrapped in inline grouping
const SPECIAL_BLOCK_ELEMENTS = [
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
];

// Recursively check if a vNode contains any special block elements
const containsSpecialElements = (node: VNodeType | VTextType): boolean => {
  if (!isVNode(node)) return false;
  const vNode = node as VNodeType;
  if (SPECIAL_BLOCK_ELEMENTS.includes(vNode.tagName || '')) return true;
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

export const buildImage = async (
  docxDocumentInstance: DocxDocumentInstance,
  vNode: VNodeType,
  maximumWidth: number | null = null
): Promise<XMLBuilderType | null> => {
  let response: MediaFileResponse | null = null;
  let base64Uri: string | null = null;
  try {
    const imageSource = vNode.properties?.src;

    // Skip WebP images - Word doesn't support WebP format
    if (
      imageSource &&
      (imageSource.includes('.webp') || imageSource.includes('image/webp'))
    ) {
      return null;
    }

    if (imageSource && isValidUrl(imageSource)) {
      const base64String = (await imageToBase64(imageSource).catch(() => {})) as
        | string
        | undefined;

      if (base64String) {
        // Try to get MIME type from URL extension first
        let mimeType: string | false = mimeTypes.lookup(imageSource);

        // Skip WebP images even if detected from extension
        if (mimeType === 'image/webp') {
          return null;
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
            // WebP detected - skip it as Word doesn't support WebP
            return null;
          } else {
            // Default to JPEG for unknown formats
            mimeType = 'image/jpeg';
          }
        }

        base64Uri = `data:${mimeType};base64,${base64String}`;
      }
    } else if (imageSource) {
      base64Uri = decodeURIComponent(imageSource);
    }
    if (base64Uri) {
      response = docxDocumentInstance.createMediaFile(base64Uri);
    }
  } catch (_error) {
    // NOOP
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

    const imageBuffer = Buffer.from(response.fileContent, 'base64');
    const imageProperties = getImageDimensions(imageBuffer);

    const imageFragment = await xmlBuilder.buildParagraph(
      vNode,
      {
        type: 'picture',
        inlineOrAnchored: true,
        relationshipId: documentRelsId,
        ...response,
        description: vNode.properties?.alt,
        maximumWidth:
          maximumWidth || docxDocumentInstance.availableDocumentSpace,
        originalWidth: imageProperties.width,
        originalHeight: imageProperties.height,
      },
      docxDocumentInstance
    );

    return imageFragment;
  }
  return null;
};

type VNodeObject = {
  level: number;
  node: VNodeType | VTextType;
  numberingId: number;
  type: string;
};

export const buildList = async (
  vNode: VNodeType,
  docxDocumentInstance: DocxDocumentInstance,
  xmlFragment: XMLBuilderType,
  existingNumberingId: number | null = null,
  baseIndentLevel = 0
): Promise<void[]> => {
  const listElements: void[] = [];

  let vNodeObjects: VNodeObject[] = [
    {
      node: vNode,
      level: baseIndentLevel,
      type: vNode.tagName || '',
      numberingId:
        existingNumberingId ||
        docxDocumentInstance.createNumbering(
          (vNode.tagName || 'ul') as 'ol' | 'ul',
          vNode.properties
        ),
    },
  ];
  while (vNodeObjects.length) {
    const tempVNodeObject = vNodeObjects.shift()!;

    if (
      isVText(tempVNodeObject.node) ||
      (isVNode(tempVNodeObject.node) &&
        !['ul', 'ol', 'li'].includes(
          (tempVNodeObject.node as VNodeType).tagName || ''
        ))
    ) {
      const paragraphFragment = await xmlBuilder.buildParagraph(
        tempVNodeObject.node,
        {
          numbering: {
            levelId: tempVNodeObject.level,
            numberingId: tempVNodeObject.numberingId,
          },
        },
        docxDocumentInstance
      );

      xmlFragment.import(paragraphFragment);
    }

    const tempNode = tempVNodeObject.node as VNodeType;
    if (
      tempNode.children &&
      tempNode.children.length &&
      ['ul', 'ol', 'li'].includes(tempNode.tagName || '')
    ) {
      const tempVNodeObjects = tempNode.children.reduce<VNodeObject[]>(
        (accumulator, childVNode) => {
          const childNode = childVNode as VNodeType;
          if (['ul', 'ol'].includes(childNode.tagName || '')) {
            accumulator.push({
              node: childVNode,
              level: tempVNodeObject.level + 1,
              type: childNode.tagName || '',
              numberingId: docxDocumentInstance.createNumbering(
                (childNode.tagName || 'ul') as 'ol' | 'ul',
                childNode.properties
              ),
            });
          } else if (
            accumulator.length > 0 &&
            isVNode(accumulator.at(-1)!.node) &&
            (
              (accumulator.at(-1)!.node as VNodeType).tagName || ''
            ).toLowerCase() === 'p' &&
            // Don't append <li> elements to paragraphs - they need separate processing
            (childNode.tagName || '').toLowerCase() !== 'li'
          ) {
            const lastNode = accumulator.at(-1)!.node as VNodeType;
            if (lastNode.children) {
              lastNode.children.push(childVNode);
            }
          } else {
            const paragraphVNode = new VNode(
              'p',
              null,
              isVText(childVNode)
                ? [childVNode]
                : isVNode(childVNode)
                  ? (childNode.tagName || '').toLowerCase() === 'li'
                    ? [...(childNode.children || [])]
                    : [childVNode]
                  : []
            );
            accumulator.push({
              node: isVNode(childVNode)
                ? (childNode.tagName || '').toLowerCase() === 'li'
                  ? childVNode
                  : (childNode.tagName || '').toLowerCase() !== 'p'
                    ? paragraphVNode
                    : childVNode
                : paragraphVNode,
              level: tempVNodeObject.level,
              type: tempVNodeObject.type,
              numberingId: tempVNodeObject.numberingId,
            });
          }

          return accumulator;
        },
        []
      );
      vNodeObjects = tempVNodeObjects.concat(vNodeObjects);
    }
  }

  return listElements;
};

type ContentGroup = {
  children?: (VNodeType | VTextType)[];
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
        const paragraphFragment = await xmlBuilder.buildParagraph(
          paragraphVNode,
          {},
          docxDocumentInstance
        );
        xmlFragment.import(paragraphFragment);
        return;
      }

      // Handle mixed content: group consecutive inline elements into paragraphs
      const groups: ContentGroup[] = [];
      let currentInlineGroup: (VNodeType | VTextType)[] = [];

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
          const paragraphFragment = await xmlBuilder.buildParagraph(
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

      const headingFragment = await xmlBuilder.buildParagraph(
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
            const paragraphFragment = await xmlBuilder.buildParagraph(
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
      const paragraphFragment = await xmlBuilder.buildParagraph(
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
      const paragraphFragment = await xmlBuilder.buildParagraph(
        vNode,
        {},
        docxDocumentInstance
      );
      xmlFragment.import(paragraphFragment);
      return;
    }
    case 'figure':
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
            const tableFragment = await xmlBuilder.buildTable(
              childVNode,
              {
                maximumWidth: docxDocumentInstance.availableDocumentSpace,
                rowCantSplit: docxDocumentInstance.tableRowCantSplit,
              },
              docxDocumentInstance
            );
            xmlFragment.import(tableFragment);
            // Adding empty paragraph for space after table
            const emptyParagraphFragment = await xmlBuilder.buildParagraph(
              null,
              {}
            );
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
            const captionFragment = await xmlBuilder.buildParagraph(
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
                  const captionFragment = await xmlBuilder.buildParagraph(
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
    case 'table': {
      const tableFragment = await xmlBuilder.buildTable(
        vNode,
        {
          maximumWidth: docxDocumentInstance.availableDocumentSpace,
          rowCantSplit: docxDocumentInstance.tableRowCantSplit,
        },
        docxDocumentInstance
      );
      xmlFragment.import(tableFragment);
      // Adding empty paragraph for space after table
      const emptyParagraphFragment = await xmlBuilder.buildParagraph(null, {});
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
          vNode.tagName as 'ol' | 'ul',
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
      const linebreakFragment = await xmlBuilder.buildParagraph(null, {});
      xmlFragment.import(linebreakFragment);
      return;
    }
    case 'head':
      return;
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
    for (let index = 0; index < vTree.length; index++) {
      const vNode = vTree[index];
      await convertVTreeToXML(docxDocumentInstance, vNode, xmlFragment);
    }
  } else if (isVNode(vTree)) {
    await findXMLEquivalent(
      docxDocumentInstance,
      vTree as VNodeType,
      xmlFragment
    );
  } else if (isVText(vTree)) {
    const text = (vTree as VTextType).text;
    if (!text || !text.trim()) {
      return xmlFragment;
    }
    const paragraphFragment = await xmlBuilder.buildParagraph(
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
