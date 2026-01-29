/**
 * HTML Parser Adapter
 *
 * Provides server-side HTML parsing utilities using linkedom for fast,
 * standards-compliant DOM parsing. Falls back to @xmldom/xmldom if linkedom
 * is not available.
 *
 * @module adapters/html-parser
 *
 * Note: For optimal performance, install linkedom:
 *   npm install linkedom
 *   -or-
 *   yarn add linkedom
 */

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * DOM Document interface (compatible with linkedom and browser DOM)
 */
export interface ParsedDocument {
  /** Document body element */
  body: HTMLElement;
  /** Document element (html) */
  documentElement: HTMLElement;
  /** Query selector method */
  querySelector: (selector: string) => HTMLElement | null;
  /** Query selector all method */
  querySelectorAll: (selector: string) => NodeListOf<HTMLElement>;
  /** Create element method */
  createElement: (tagName: string) => HTMLElement;
  /** Create text node method */
  createTextNode: (text: string) => Text;
}

/**
 * Minimal HTMLElement interface for compatibility
 */
export interface HTMLElement extends Node {
  tagName: string;
  className: string;
  id: string;
  innerHTML: string;
  textContent: string | null;
  getAttribute: (name: string) => string | null;
  setAttribute: (name: string, value: string) => void;
  hasAttribute: (name: string) => boolean;
  removeAttribute: (name: string) => void;
  querySelector: (selector: string) => HTMLElement | null;
  querySelectorAll: (selector: string) => NodeListOf<HTMLElement>;
  getElementsByTagName: (tagName: string) => HTMLCollectionOf<HTMLElement>;
  style: CSSStyleDeclaration;
  children: HTMLCollection;
  parentElement: HTMLElement | null;
}

/**
 * Node interface
 */
export interface Node {
  nodeType: number;
  nodeName: string;
  nodeValue: string | null;
  textContent: string | null;
  parentNode: Node | null;
  childNodes: NodeListOf<Node>;
  firstChild: Node | null;
  lastChild: Node | null;
  nextSibling: Node | null;
  previousSibling: Node | null;
  ownerDocument: ParsedDocument | null;
}

/**
 * Text node interface
 */
export interface Text extends Node {
  data: string;
  length: number;
  wholeText: string;
}

/**
 * NodeList interface
 */
export interface NodeListOf<T extends Node> extends Iterable<T> {
  length: number;
  item: (index: number) => T | null;
  forEach: (
    callback: (node: T, index: number, list: NodeListOf<T>) => void
  ) => void;
  [index: number]: T;
}

/**
 * HTMLCollection interface
 */
export interface HTMLCollection extends Iterable<HTMLElement> {
  length: number;
  item: (index: number) => HTMLElement | null;
  [index: number]: HTMLElement;
}

/**
 * HTMLCollectionOf interface
 */
export interface HTMLCollectionOf<T extends HTMLElement> extends Iterable<T> {
  length: number;
  item: (index: number) => T | null;
  [index: number]: T;
}

/**
 * CSSStyleDeclaration minimal interface
 *
 * Note: We intentionally avoid using an index signature here because
 * TypeScript's index signatures require all properties to be assignable
 * to the index type, which conflicts with our method signatures.
 * Instead, access CSS properties via getPropertyValue() or cast to Record<string, string>.
 */
export interface CSSStyleDeclaration {
  /** Get a CSS property value */
  getPropertyValue: (property: string) => string;
  /** Set a CSS property value */
  setProperty: (property: string, value: string) => void;
  /** Remove a CSS property */
  removeProperty?: (property: string) => string;
  /** Get property priority */
  getPropertyPriority?: (property: string) => string;
  /** CSS text representation */
  cssText?: string;
  /** Number of properties */
  length?: number;
}

/**
 * Node type constants
 */
export const NODE_TYPES = {
  ELEMENT_NODE: 1,
  ATTRIBUTE_NODE: 2,
  TEXT_NODE: 3,
  CDATA_SECTION_NODE: 4,
  COMMENT_NODE: 8,
  DOCUMENT_NODE: 9,
  DOCUMENT_TYPE_NODE: 10,
  DOCUMENT_FRAGMENT_NODE: 11,
} as const;

/**
 * Callback function for DOM walking
 */
export type WalkCallback = (
  node: Node,
  parent: Node | null,
  depth: number
) => void | boolean;

/**
 * Options for HTML parsing
 */
export interface ParseHtmlOptions {
  /** Base URL for resolving relative URLs */
  baseUrl?: string;
  /** Whether to sanitize HTML before parsing */
  sanitize?: boolean;
  /** Custom parser to use ('linkedom' | 'xmldom' | 'auto') */
  parser?: 'linkedom' | 'xmldom' | 'auto';
}

/**
 * Result of HTML parsing
 */
export interface ParseHtmlResult {
  /** Parsed document */
  document: ParsedDocument;
  /** Parser used */
  parser: 'linkedom' | 'xmldom' | 'fallback';
  /** Any warnings during parsing */
  warnings: string[];
}

// ============================================================================
// Parser Detection and Loading
// ============================================================================

// @ts-expect-error - linkedom is an optional dependency
let linkedomModule: typeof import('linkedom') | null = null;
let xmldomModule: typeof import('@xmldom/xmldom') | null = null;
const parserLoaded = false;

/**
 * Attempt to load linkedom module
 */
async function tryLoadLinkedom(): Promise<boolean> {
  if (linkedomModule) return true;

  try {
    // @ts-expect-error - linkedom is an optional dependency
    linkedomModule = await import('linkedom');
    return true;
  } catch {
    return false;
  }
}

/**
 * Attempt to load xmldom module
 */
async function tryLoadXmldom(): Promise<boolean> {
  if (xmldomModule) return true;

  try {
    xmldomModule = await import('@xmldom/xmldom');
    return true;
  } catch {
    return false;
  }
}

/**
 * Load xmldom module synchronously (for sync parsing)
 */
function tryLoadXmldomSync(): boolean {
  if (xmldomModule) return true;

  try {
    // Use require for synchronous loading
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    xmldomModule = require('@xmldom/xmldom');
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// HTML Parsing Functions
// ============================================================================

/**
 * Parse HTML string to DOM Document
 *
 * Uses linkedom for fast, standards-compliant parsing. Falls back to
 * @xmldom/xmldom if linkedom is not available.
 *
 * @param html - HTML string to parse
 * @param options - Parsing options
 * @returns Parsed document result
 *
 * @example
 * ```typescript
 * const result = await parseHtml('<div><p>Hello</p></div>');
 * const paragraphs = result.document.querySelectorAll('p');
 * ```
 */
export async function parseHtml(
  html: string,
  options: ParseHtmlOptions = {}
): Promise<ParseHtmlResult> {
  const warnings: string[] = [];
  const { parser = 'auto', sanitize = false } = options;

  // Sanitize HTML if requested
  let processedHtml = sanitize ? sanitizeHtml(html) : html;

  // Wrap in HTML document structure if needed
  processedHtml = wrapHtmlIfNeeded(processedHtml);

  // Try linkedom first (preferred)
  if (parser === 'linkedom' || parser === 'auto') {
    if (await tryLoadLinkedom()) {
      try {
        const { parseHTML } = linkedomModule!;
        const { document } = parseHTML(processedHtml);
        return {
          document: document as unknown as ParsedDocument,
          parser: 'linkedom',
          warnings,
        };
      } catch (error) {
        warnings.push(`linkedom parsing failed: ${String(error)}`);
        if (parser === 'linkedom') {
          throw new Error(
            `Failed to parse HTML with linkedom: ${String(error)}`
          );
        }
      }
    } else if (parser === 'linkedom') {
      throw new Error(
        'linkedom is not installed. Install with: npm install linkedom'
      );
    }
  }

  // Try xmldom as fallback
  if (parser === 'xmldom' || parser === 'auto') {
    if (await tryLoadXmldom()) {
      try {
        const { DOMParser } = xmldomModule!;
        const domParser = new DOMParser();
        const document = domParser.parseFromString(processedHtml, 'text/html');
        return {
          document: document as unknown as ParsedDocument,
          parser: 'xmldom',
          warnings,
        };
      } catch (error) {
        warnings.push(`xmldom parsing failed: ${String(error)}`);
        if (parser === 'xmldom') {
          throw new Error(`Failed to parse HTML with xmldom: ${String(error)}`);
        }
      }
    } else if (parser === 'xmldom') {
      throw new Error(
        '@xmldom/xmldom is not installed. Install with: npm install @xmldom/xmldom'
      );
    }
  }

  // Final fallback: simple HTML structure
  warnings.push('No DOM parser available, using minimal fallback parser');
  return {
    document: createMinimalDocument(processedHtml),
    parser: 'fallback',
    warnings,
  };
}

/**
 * Synchronous HTML parsing
 *
 * Only available with @xmldom/xmldom which supports synchronous loading.
 * For async parsing with linkedom, use parseHtml instead.
 *
 * @param html - HTML string to parse
 * @returns Parsed document
 */
export function parseHtmlSync(html: string): ParsedDocument {
  const processedHtml = wrapHtmlIfNeeded(html);

  if (tryLoadXmldomSync() && xmldomModule) {
    const { DOMParser } = xmldomModule;
    const domParser = new DOMParser();
    const document = domParser.parseFromString(processedHtml, 'text/html');
    return document as unknown as ParsedDocument;
  }

  // Fallback to minimal parser
  return createMinimalDocument(processedHtml);
}

// ============================================================================
// DOM Walking Utilities
// ============================================================================

/**
 * Walk the DOM tree, calling callback for each node
 *
 * Traverses the DOM in depth-first order, calling the callback for each
 * node encountered. If callback returns false, children of that node
 * are skipped.
 *
 * @param node - Starting node for traversal
 * @param callback - Function called for each node
 *
 * @example
 * ```typescript
 * walkDom(document.body, (node, parent, depth) => {
 *   if (node.nodeType === NODE_TYPES.ELEMENT_NODE) {
 *     console.log('Element:', (node as HTMLElement).tagName);
 *   }
 * });
 * ```
 */
export function walkDom(node: Node, callback: WalkCallback): void {
  walkDomRecursive(node, null, 0, callback);
}

/**
 * Internal recursive DOM walker
 */
function walkDomRecursive(
  node: Node,
  parent: Node | null,
  depth: number,
  callback: WalkCallback
): void {
  const result = callback(node, parent, depth);

  // If callback returns false, skip children
  if (result === false) {
    return;
  }

  // Walk children
  const children = node.childNodes;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const child = children.item(i);
      if (child) {
        walkDomRecursive(child, node, depth + 1, callback);
      }
    }
  }
}

/**
 * Walk the DOM tree asynchronously
 *
 * Similar to walkDom but allows async callbacks for operations
 * like image loading.
 *
 * @param node - Starting node for traversal
 * @param callback - Async function called for each node
 */
export async function walkDomAsync(
  node: Node,
  callback: (
    node: Node,
    parent: Node | null,
    depth: number
  ) => Promise<void | boolean>
): Promise<void> {
  await walkDomAsyncRecursive(node, null, 0, callback);
}

/**
 * Internal async recursive DOM walker
 */
async function walkDomAsyncRecursive(
  node: Node,
  parent: Node | null,
  depth: number,
  callback: (
    node: Node,
    parent: Node | null,
    depth: number
  ) => Promise<void | boolean>
): Promise<void> {
  const result = await callback(node, parent, depth);

  // If callback returns false, skip children
  if (result === false) {
    return;
  }

  // Walk children
  const children = node.childNodes;
  if (children) {
    for (let i = 0; i < children.length; i++) {
      const child = children.item(i);
      if (child) {
        await walkDomAsyncRecursive(child, node, depth + 1, callback);
      }
    }
  }
}

/**
 * Get all elements matching a predicate
 *
 * @param root - Root node to search from
 * @param predicate - Function to test each element
 * @returns Array of matching elements
 */
export function findElements(
  root: Node,
  predicate: (element: HTMLElement) => boolean
): HTMLElement[] {
  const results: HTMLElement[] = [];

  walkDom(root, (node) => {
    if (node.nodeType === NODE_TYPES.ELEMENT_NODE) {
      const element = node as unknown as HTMLElement;
      if (predicate(element)) {
        results.push(element);
      }
    }
  });

  return results;
}

/**
 * Get all text content from a node and its descendants
 *
 * @param node - Node to extract text from
 * @returns Combined text content
 */
export function extractText(node: Node): string {
  const parts: string[] = [];

  walkDom(node, (n) => {
    if (n.nodeType === NODE_TYPES.TEXT_NODE && n.nodeValue) {
      parts.push(n.nodeValue);
    }
  });

  return parts.join('');
}

// ============================================================================
// HTML Sanitization
// ============================================================================

/**
 * Basic HTML sanitization to handle malformed HTML
 *
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  let result = html;

  // Remove script tags and content
  result = result.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );

  // Remove on* event handlers
  result = result.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, '');

  // Normalize whitespace in attributes
  result = result.replace(/\s+>/g, '>');

  // Fix unclosed self-closing tags
  const selfClosingTags = [
    'br',
    'hr',
    'img',
    'input',
    'meta',
    'link',
    'area',
    'base',
    'col',
    'embed',
    'source',
    'track',
    'wbr',
  ];
  for (const tag of selfClosingTags) {
    const regex = new RegExp(`<${tag}([^>]*?)(?<!/)>`, 'gi');
    result = result.replace(regex, `<${tag}$1 />`);
  }

  return result;
}

/**
 * Wrap HTML fragment in proper document structure if needed
 */
function wrapHtmlIfNeeded(html: string): string {
  const trimmed = html.trim();

  // Check if already has html/body structure
  if (
    trimmed.toLowerCase().includes('<html') ||
    trimmed.toLowerCase().includes('<body')
  ) {
    return trimmed;
  }

  // Wrap in minimal structure
  return `<!DOCTYPE html><html><body>${trimmed}</body></html>`;
}

// ============================================================================
// Fallback Parser
// ============================================================================

/**
 * Create a minimal document object for when no parser is available
 * This is a last-resort fallback that provides basic DOM-like interface
 */
function createMinimalDocument(html: string): ParsedDocument {
  // Extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1] : html;

  const createEmptyNode = (): Node => ({
    nodeType: NODE_TYPES.ELEMENT_NODE,
    nodeName: 'DIV',
    nodeValue: null,
    textContent: '',
    parentNode: null,
    childNodes: createEmptyNodeList(),
    firstChild: null,
    lastChild: null,
    nextSibling: null,
    previousSibling: null,
    ownerDocument: null,
  });

  const createEmptyNodeList = (): NodeListOf<Node> => {
    const list: Node[] = [];
    return {
      length: 0,
      item: (index: number) => list[index] ?? null,
      forEach: (cb) =>
        list.forEach((n, i) => cb(n, i, list as unknown as NodeListOf<Node>)),
      [Symbol.iterator]: () => list[Symbol.iterator](),
    } as unknown as NodeListOf<Node>;
  };

  const createEmptyElement = (tagName: string): HTMLElement => {
    const baseNode = createEmptyNode();
    return {
      ...baseNode,
      tagName: tagName.toUpperCase(),
      nodeName: tagName.toUpperCase(),
      className: '',
      id: '',
      innerHTML: '',
      textContent: '',
      getAttribute: () => null,
      setAttribute: () => {},
      hasAttribute: () => false,
      removeAttribute: () => {},
      querySelector: () => null,
      querySelectorAll: () =>
        ({
          length: 0,
          item: () => null,
          forEach: () => {},
          [Symbol.iterator]: () => [][Symbol.iterator](),
        }) as unknown as NodeListOf<HTMLElement>,
      getElementsByTagName: () =>
        ({
          length: 0,
          item: () => null,
          [Symbol.iterator]: () => [][Symbol.iterator](),
        }) as unknown as HTMLCollectionOf<HTMLElement>,
      style: {
        getPropertyValue: () => '',
        setProperty: () => {},
      } as unknown as CSSStyleDeclaration,
      children: {
        length: 0,
        item: () => null,
        [Symbol.iterator]: () => [][Symbol.iterator](),
      } as unknown as HTMLCollection,
      parentElement: null,
    } as unknown as HTMLElement;
  };

  const body = createEmptyElement('BODY');
  (body as unknown as { innerHTML: string }).innerHTML = bodyContent;
  (body as unknown as { textContent: string }).textContent =
    bodyContent.replace(/<[^>]*>/g, '');

  const documentElement = createEmptyElement('HTML');

  return {
    body,
    documentElement,
    querySelector: () => null,
    querySelectorAll: () =>
      ({
        length: 0,
        item: () => null,
        forEach: () => {},
        [Symbol.iterator]: () => [][Symbol.iterator](),
      }) as unknown as NodeListOf<HTMLElement>,
    createElement: createEmptyElement,
    createTextNode: (text: string) =>
      ({
        ...createEmptyNode(),
        nodeType: NODE_TYPES.TEXT_NODE,
        nodeName: '#text',
        nodeValue: text,
        textContent: text,
        data: text,
        length: text.length,
        wholeText: text,
      }) as unknown as Text,
  };
}

/**
 * Check if node is an element node
 */
export function isElementNode(node: Node): node is HTMLElement {
  return node.nodeType === NODE_TYPES.ELEMENT_NODE;
}

/**
 * Check if node is a text node
 */
export function isTextNode(node: Node): node is Text {
  return node.nodeType === NODE_TYPES.TEXT_NODE;
}

/**
 * Get element's tag name in lowercase
 */
export function getTagName(element: HTMLElement): string {
  return element.tagName?.toLowerCase() ?? '';
}
