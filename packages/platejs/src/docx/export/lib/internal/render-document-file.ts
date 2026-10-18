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
  type BlockScope,
  buildImage,
  buildList,
  buildParagraph,
  buildTable,
  itemNumberingId,
  type RenderBlocks,
  withItemRestart,
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
  taskNumberingId: (checked: boolean) => number;
  getBookmark: (htmlId: string) => { id: number; name: string } | undefined;
  openList: (
    type: 'ol' | 'ul',
    properties: VNodeProperties,
    level: number
  ) => { readonly numberingId: number; next: number };
  registerBookmark: (htmlId: string) => void;
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

function getHeadingBookmark(vNode: VNodeType) {
  if (!/^h[1-6]$/.test(vNode.tagName ?? '')) return undefined;

  const firstChild: VNodeType | undefined = vNode.children?.[0];

  if (
    !firstChild ||
    !isVNode(firstChild) ||
    (firstChild.tagName !== 'a' && firstChild.tagName !== 'span') ||
    firstChild.properties?.href ||
    firstChild.properties?.attributes?.href
  ) {
    return undefined;
  }

  return firstChild.properties?.id || firstChild.properties?.attributes?.id;
}

// The registry's static list kit draws a listed block's list inside the block,
// as h2 > ol > li. A div holding one keeps the generic path into buildList.
const readPlateListItem = (block: VNodeType) => {
  if (block.tagName === 'div') return undefined;

  const children = (block.children ?? []).filter(
    (child) => isVNode(child) || (child as VTextType).text.trim() !== ''
  );
  const [list, ...rest] = getHeadingBookmark(block)
    ? children.slice(1)
    : children;

  if (
    rest.length > 0 ||
    !isVNode(list) ||
    !['ol', 'ul'].includes((list as VNodeType).tagName ?? '') ||
    (list as VNodeType).properties?.attributes?.['data-list-id'] === undefined
  ) {
    return undefined;
  }
  const items = ((list as VNodeType).children ?? []).filter((child) =>
    isVNode(child)
  ) as VNodeType[];

  return items.length === 1 && items[0].tagName === 'li'
    ? { item: items[0], list: list as VNodeType }
    : undefined;
};

type ContentGroup = {
  children?: Array<VNodeType | VTextType>;
  node?: VNodeType | VTextType;
  type: 'block' | 'inline';
};

const INDENT_CLASS_REGEX = /\beditor-indent-\d+\b/;

const isIndented = (vNode: VNodeType) =>
  !['ol', 'ul'].includes(vNode.tagName || '') &&
  Boolean(
    vNode.properties?.style?.['margin-left'] ||
    INDENT_CLASS_REGEX.test(vNode.properties?.attributes?.class ?? '')
  );

// A cell's blocks take no indented host from outside the table.
const renderCellBlocks =
  (docxDocumentInstance: DocxDocumentInstance): RenderBlocks =>
  (children, xmlFragment, scope) =>
    findXMLEquivalent(
      docxDocumentInstance,
      new VNode('div', {}, children),
      xmlFragment,
      undefined,
      scope
    );

async function findXMLEquivalent(
  docxDocumentInstance: DocxDocumentInstance,
  vNode: VNodeType,
  xmlFragment: XMLBuilderType,
  indentedAncestor: VNodeType | undefined,
  scope: BlockScope
): Promise<void> {
  const childIndentedAncestor = isIndented(vNode) ? vNode : indentedAncestor;
  // A block's own keys come first, so its w:pStyle leads w:pPr, and still win.
  const paragraph = (
    node: VNodeType | VTextType | null,
    own: BlockScope = {}
  ) => buildParagraph(node, { ...own, ...scope, ...own }, docxDocumentInstance);
  const maximumWidth = scope.maximumWidth ?? null;

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

  const listed = readPlateListItem(vNode);

  if (listed) {
    const { item, list } = listed;
    const attributes = item.properties?.attributes;
    const levelId = Math.max(0, Number(attributes?.['data-indent'] ?? 1) - 1);
    const instance = docxDocumentInstance.openList(
      list.tagName as 'ol' | 'ul',
      withItemRestart(list.properties ?? {}, item),
      levelId
    );
    const numberingId = itemNumberingId(
      docxDocumentInstance,
      item,
      instance.numberingId
    );
    // The list level owns the indent, as for a buildList item.
    const { 'margin-left': _margin, ...style } = vNode.properties?.style ?? {};

    await findXMLEquivalent(
      docxDocumentInstance,
      new VNode(vNode.tagName, { ...vNode.properties, style }, [
        ...(getHeadingBookmark(vNode)
          ? (vNode.children ?? []).slice(0, 1)
          : []),
        ...(item.children ?? []),
      ]),
      xmlFragment,
      indentedAncestor,
      { numbering: { levelId, numberingId }, ...scope }
    );
    instance.next += 1;
    return;
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
        const paragraphFragment = await paragraph(paragraphVNode);
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
          const paragraphFragment = await paragraph(paragraphVNode);
          xmlFragment.import(paragraphFragment);
        } else if (group.node) {
          await convertVTreeToXML(
            docxDocumentInstance,
            group.node,
            xmlFragment,
            childIndentedAncestor,
            scope
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
      const bookmarkId = getHeadingBookmark(vNode);
      const headingVNode = bookmarkId
        ? new VNode(vNode.tagName, vNode.properties, vNode.children?.slice(1))
        : vNode;

      const headingFragment = await paragraph(headingVNode, {
        paragraphStyle: `Heading${vNode.tagName[1]}`,
        bookmarkId,
      });
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
            const paragraphFragment = await paragraph(modifiedVNode);
            xmlFragment.import(paragraphFragment);
          }
          for (const listChild of listChildren) {
            await buildList(listChild, docxDocumentInstance, xmlFragment, {
              container: vNode,
              host: vNode,
              scope,
            });
          }
          return;
        }
      }
      const paragraphFragment = await paragraph(vNode);
      xmlFragment.import(paragraphFragment);
      return;
    }
    case 'a':
    case 'blockquote':
    case 'code':
    case 'pre': {
      const paragraphFragment = await paragraph(vNode);
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
            const imageFragment = await buildImage(
              docxDocumentInstance,
              vn,
              maximumWidth
            );
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
                maximumWidth:
                  maximumWidth ?? docxDocumentInstance.availableDocumentSpace,
                rowCantSplit: docxDocumentInstance.tableRowCantSplit,
              },
              docxDocumentInstance,
              renderCellBlocks(docxDocumentInstance)
            );
            xmlFragment.import(tableFragment);
            // Adding empty paragraph for space after table
            const emptyParagraphFragment = await buildParagraph(null, {});
            xmlFragment.import(emptyParagraphFragment);
          } else if (childVNode.tagName === 'img') {
            const imageFragment = await buildImage(
              docxDocumentInstance,
              childVNode,
              maximumWidth
            );
            if (imageFragment) {
              xmlFragment.import(imageFragment);
            }
          } else if (childVNode.tagName === 'figcaption') {
            // Handle image caption
            const captionFragment = await paragraph(childVNode);
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
                  const captionFragment = await paragraph(divChild);
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
          maximumWidth:
            maximumWidth ?? docxDocumentInstance.availableDocumentSpace,
          rowCantSplit: docxDocumentInstance.tableRowCantSplit,
        },
        docxDocumentInstance,
        renderCellBlocks(docxDocumentInstance)
      );
      xmlFragment.import(tableFragment);
      // Adding empty paragraph for space after table
      const emptyParagraphFragment = await buildParagraph(null, {});
      xmlFragment.import(emptyParagraphFragment);
      return;
    }
    case 'ol':
    case 'ul': {
      // A list drawn without its own margin takes its indented ancestor's indent.
      await buildList(vNode, docxDocumentInstance, xmlFragment, {
        host: indentedAncestor,
        scope,
      });
      return;
    }
    case 'img': {
      const imageFragment = await buildImage(
        docxDocumentInstance,
        vNode,
        maximumWidth
      );
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

      if (
        isVNode(childVNode) &&
        ['ul', 'ol'].includes((childVNode as VNodeType).tagName || '')
      ) {
        await buildList(childVNode, docxDocumentInstance, xmlFragment, {
          container: vNode,
          host: childIndentedAncestor ?? vNode,
          scope,
        });
      } else {
        await convertVTreeToXML(
          docxDocumentInstance,
          childVNode,
          xmlFragment,
          childIndentedAncestor,
          scope
        );
      }
    }
  }
}

export async function convertVTreeToXML(
  docxDocumentInstance: DocxDocumentInstance,
  vTree: VTree | null,
  xmlFragment: XMLBuilderType,
  indentedAncestor?: VNodeType,
  scope: BlockScope = {}
): Promise<XMLBuilderType | string> {
  if (!vTree) {
    return '';
  }
  if (Array.isArray(vTree) && vTree.length) {
    for (const vNode of vTree) {
      await convertVTreeToXML(
        docxDocumentInstance,
        vNode,
        xmlFragment,
        indentedAncestor,
        scope
      );
    }
  } else if (isVNode(vTree)) {
    await findXMLEquivalent(
      docxDocumentInstance,
      vTree as VNodeType,
      xmlFragment,
      indentedAncestor,
      scope
    );
  } else if (isVText(vTree)) {
    const paragraphFragment = await buildParagraph(
      vTree as VTextType,
      { ...scope },
      docxDocumentInstance
    );
    xmlFragment.import(paragraphFragment);
  }
  return xmlFragment;
}

async function renderDocumentFile(
  docxDocumentInstance: DocxDocumentInstance
): Promise<XMLBuilderType> {
  const vTree = convertHTML(docxDocumentInstance.htmlString);
  const registerBookmarks = (tree: VTree) => {
    if (Array.isArray(tree)) {
      for (const child of tree) registerBookmarks(child);
    } else if (isVNode(tree)) {
      const node = tree as VNodeType;
      const id = getHeadingBookmark(node);

      if (id) docxDocumentInstance.registerBookmark(id);
      for (const child of node.children ?? []) registerBookmarks(child);
    }
  };

  registerBookmarks(vTree);

  const xmlFragment = fragment({ namespaceAlias: { w: namespaces.w } });

  const populatedXmlFragment = await convertVTreeToXML(
    docxDocumentInstance,
    vTree,
    xmlFragment
  );

  return populatedXmlFragment as XMLBuilderType;
}

export default renderDocumentFile;
