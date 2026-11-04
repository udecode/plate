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

import { REVIEW_TOKEN } from '../reviewProjection';
import type { ListItemPlacement } from './docx-document';
import {
  type DocxListItem,
  isListedBlock,
  listTextIndent,
  readListItem,
} from './list-item';
import namespaces from './namespaces';
import { vNodeHasChildren } from './vnode';
import type { WordStyles } from './word-styles';
import {
  type BlockScope,
  type BlockSink,
  buildImage,
  buildList,
  buildParagraph,
  buildTable,
  defineNamedStyles,
  inheritParagraphStyle,
  narrowedWidth,
  quoteScope,
  type RenderBlocks,
} from './xml-builder';

type XMLBuilderType = BlockSink;

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
  getBookmark: (htmlId: string) => { id: number; name: string } | undefined;
  openItem: (item: DocxListItem) => ListItemPlacement;
  openList: (
    type: 'ol' | 'ul',
    properties: VNodeProperties,
    level: number
  ) => { readonly numberingId: number; next: number };
  registerBookmark: (htmlId: string) => void;
  htmlString: string;
  namedStyleHtml: string;
  relationshipFilename: string;
  tableRowCantSplit: boolean;
  wordStyles: WordStyles;
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

const isInlineElement = (node: VNodeType | VTextType): boolean =>
  isVText(node) ||
  (isVNode(node) &&
    INLINE_ELEMENTS.has((node as VNodeType).tagName || '') &&
    !isListedBlock((node as VNodeType).properties?.attributes));

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

const XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace';
const REVIEW_START = new RegExp(`^${REVIEW_TOKEN}[^\uE001]*_start\uE001`);
const EMPTY_SPACER_TEXT = /^\uFEFF*$/;

const wordChild = (node: Node | undefined, name: string) =>
  Array.from(node?.childNodes ?? []).find(
    (child): child is Element =>
      child.nodeType === 1 &&
      (child as Element).namespaceURI === namespaces.w &&
      (child as Element).localName === name
  );

const isUnnumberedParagraph = (node: Node): node is Element =>
  node.nodeType === 1 &&
  (node as Element).namespaceURI === namespaces.w &&
  (node as Element).localName === 'p' &&
  !wordChild(wordChild(node, 'pPr'), 'numPr');

class PlacingSink implements BlockSink {
  private readonly target: BlockSink;
  private readonly placement: ListItemPlacement;
  private readonly reviewStart: string | undefined;

  constructor(
    target: BlockSink,
    placement: ListItemPlacement,
    reviewStart: string | undefined
  ) {
    this.target = target;
    this.placement = placement;
    this.reviewStart = reviewStart;
  }

  import(node: XMLBuilder) {
    const root = node.node as unknown as Node;
    const tops = root.nodeType === 11 ? Array.from(root.childNodes) : [root];

    for (const top of tops) {
      if (isUnnumberedParagraph(top)) this.place(top);
      else if (top.nodeType === 1) this.flushPendingMarker();
    }

    return this.target.import(node);
  }

  flushPendingMarker(): BlockSink {
    if (!this.placement.placed) {
      const paragraph = fragment({ namespaceAlias: { w: namespaces.w } }).ele(
        '@w',
        'p'
      );

      this.place(paragraph.node as unknown as Element);
      this.target.import(paragraph);
    }

    return this.target;
  }

  private place(paragraph: Element) {
    const first = !this.placement.placed;

    this.placement.place(paragraph);
    if (!first || !this.reviewStart) return;
    const document = paragraph.ownerDocument;
    const run = document.createElementNS(namespaces.w, 'w:r');
    const text = document.createElementNS(namespaces.w, 'w:t');

    text.setAttributeNS(XML_NAMESPACE, 'xml:space', 'preserve');
    text.textContent = this.reviewStart;
    run.append(text);
    wordChild(paragraph, 'pPr')?.after(run);
  }
}

const firstText = (
  node: VNodeType
): Readonly<{ parent: VNodeType; text: VTextType }> | undefined => {
  for (const child of node.children ?? []) {
    if (isVText(child)) {
      if ((child as VTextType).text) {
        return { parent: node, text: child as VTextType };
      }
      continue;
    }
    const found = firstText(child);

    if (found) return found;
  }

  return undefined;
};

const textOf = (node: VNodeType | VTextType): string =>
  isVText(node)
    ? (node as VTextType).text
    : ((node as VNodeType).children ?? []).map(textOf).join('');

const isPlaceholderSpacer = (node: VNodeType | VTextType) =>
  isVNode(node) &&
  (node as VNodeType).properties?.attributes?.['data-editor-spacer'] !==
    undefined &&
  EMPTY_SPACER_TEXT.test(textOf(node));

const detachReviewStart = (vNode: VNodeType) => {
  const found = firstText(vNode);
  const start = found?.text.text.match(REVIEW_START)?.[0];

  if (!found || !start) return undefined;
  found.text.text = found.text.text.slice(start.length);
  if (!found.text.text) {
    found.parent.children = found.parent.children?.filter(
      (child) => child !== found.text
    );
  }

  return start;
};

async function renderListItem(
  docxDocumentInstance: DocxDocumentInstance,
  vNode: VNodeType,
  item: DocxListItem,
  xmlFragment: XMLBuilderType,
  indentedAncestor: VNodeType | undefined,
  scope: BlockScope
) {
  const outsideListWidth =
    scope.outsideListWidth ??
    scope.maximumWidth ??
    docxDocumentInstance.availableDocumentSpace;
  const target =
    xmlFragment instanceof PlacingSink
      ? xmlFragment.flushPendingMarker()
      : xmlFragment;
  const placing = new PlacingSink(
    target,
    docxDocumentInstance.openItem(item),
    detachReviewStart(vNode)
  );

  await renderBlock(docxDocumentInstance, vNode, placing, indentedAncestor, {
    ...inheritParagraphStyle(docxDocumentInstance, vNode, scope),
    maximumWidth: narrowedWidth(outsideListWidth, listTextIndent(item.level)),
    outsideListWidth,
  });
  placing.flushPendingMarker();
}

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
  const item = readListItem(vNode.properties?.attributes);

  await (item
    ? renderListItem(
        docxDocumentInstance,
        vNode,
        item,
        xmlFragment,
        indentedAncestor,
        scope
      )
    : renderBlock(
        docxDocumentInstance,
        vNode,
        xmlFragment,
        indentedAncestor,
        scope
      ));
}

async function renderBlock(
  docxDocumentInstance: DocxDocumentInstance,
  vNode: VNodeType,
  xmlFragment: XMLBuilderType,
  indentedAncestor: VNodeType | undefined,
  scope: BlockScope
): Promise<void> {
  if (isPlaceholderSpacer(vNode)) return;
  const childIndentedAncestor = isIndented(vNode) ? vNode : indentedAncestor;
  const paragraph = (
    node: VNodeType | VTextType | null,
    own: BlockScope = {}
  ) => buildParagraph(node, { ...scope, ...own }, docxDocumentInstance);
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
        if (isPlaceholderSpacer(child)) continue;
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
    case 'blockquote': {
      await renderQuote(
        docxDocumentInstance,
        vNode,
        xmlFragment,
        childIndentedAncestor,
        scope
      );
      return;
    }
    case 'a':
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

const isBlank = (nodes: ReadonlyArray<VNodeType | VTextType>) =>
  nodes.every((node) => isVText(node) && !(node as VTextType).text.trim());

async function renderQuote(
  docxDocumentInstance: DocxDocumentInstance,
  vNode: VNodeType,
  xmlFragment: XMLBuilderType,
  indentedAncestor: VNodeType | undefined,
  scope: BlockScope
) {
  const quote = quoteScope(docxDocumentInstance, vNode, scope);
  let inline: Array<VNodeType | VTextType> = [];
  const emit = async (node: VNodeType) => {
    xmlFragment.import(await buildParagraph(node, quote, docxDocumentInstance));
  };
  const flush = async () => {
    if (!isBlank(inline)) await emit(new VNode('p', null, inline));
    inline = [];
  };

  for (const child of vNode.children ?? []) {
    if (isInlineElement(child)) {
      inline.push(child);
      continue;
    }
    await flush();

    const block = child as VNodeType;

    if (readListItem(block.properties?.attributes)) {
      await convertVTreeToXML(
        docxDocumentInstance,
        block,
        xmlFragment,
        indentedAncestor,
        scope
      );
    } else if (
      ['div', 'p'].includes(block.tagName ?? '') &&
      (block.children ?? []).every(
        (grandchild) =>
          isInlineElement(grandchild) && !containsSpecialElements(grandchild)
      )
    ) {
      await emit(new VNode('p', block.properties, block.children));
    } else {
      await convertVTreeToXML(
        docxDocumentInstance,
        block,
        xmlFragment,
        indentedAncestor,
        scope
      );
    }
  }
  await flush();
}

export async function convertVTreeToXML<Sink extends BlockSink>(
  docxDocumentInstance: DocxDocumentInstance,
  vTree: VTree | null,
  xmlFragment: Sink,
  indentedAncestor?: VNodeType,
  scope: BlockScope = {}
): Promise<Sink | string> {
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
): Promise<XMLBuilder> {
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

  const named: Partial<Record<'blockquote' | 'code' | 'kbd', VNodeType>> = {};
  const findNamed = (tree: VTree) => {
    if (Array.isArray(tree)) {
      for (const child of tree) findNamed(child);
    } else if (isVNode(tree)) {
      const node = tree as VNodeType;

      if (
        node.tagName === 'blockquote' ||
        node.tagName === 'code' ||
        node.tagName === 'kbd'
      ) {
        named[node.tagName] ??= node;
      }
      for (const child of node.children ?? []) findNamed(child);
    }
  };

  if (docxDocumentInstance.namedStyleHtml) {
    findNamed(convertHTML(docxDocumentInstance.namedStyleHtml));
  }
  defineNamedStyles(docxDocumentInstance, docxDocumentInstance.wordStyles, {
    blockquote: named.blockquote,
    code: named.code,
    kbd: named.kbd,
  });

  const xmlFragment = fragment({ namespaceAlias: { w: namespaces.w } });

  const populatedXmlFragment = await convertVTreeToXML(
    docxDocumentInstance,
    vTree,
    xmlFragment
  );

  return populatedXmlFragment as XMLBuilder;
}

export default renderDocumentFile;
