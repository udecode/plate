/**
 * Slate Bridge - Type definitions bridging Slate nodes to our adapters
 *
 * This module provides type re-exports and utility functions for working with
 * Slate/Plate node types within the docx-io export pipeline.
 *
 * @module slate-bridge
 */

// Re-export core Slate types from platejs
// Note: These are the recommended type aliases used throughout Plate
export type {
  TNode,
  TElement,
  TText,
  Descendant,
  Ancestor,
  NodeOf,
  ElementOf,
  TextOf,
  NodeProps,
} from '@platejs/slate';

// Import the API objects for runtime usage
import { NodeApi, ElementApi, TextApi } from '@platejs/slate';
import type { TNode, TElement, TText, Descendant } from '@platejs/slate';

// ============================================================================
// Type Aliases for DOCX Export
// ============================================================================

/**
 * SlateNode - A node in a Slate document tree
 * Can be an Editor, Element, or Text node
 */
export type SlateNode = TNode;

/**
 * SlateElement - An element node in a Slate document
 * Contains children and has a type property
 */
export type SlateElement = TElement;

/**
 * SlateText - A text (leaf) node in a Slate document
 * Contains the actual text content and formatting marks
 */
export type SlateText = TText;

/**
 * SlateDescendant - Either an Element or Text node
 * Used when traversing document content
 */
export type SlateDescendant = Descendant;

// ============================================================================
// Node Type Guards
// ============================================================================

/**
 * Checks if a value is a Slate Element node
 *
 * @param value - The value to check
 * @returns True if the value is an element node (has children and type)
 *
 * @example
 * ```typescript
 * if (isElement(node)) {
 *   // node is TElement, has .children and .type
 *   console.log(node.type);
 * }
 * ```
 */
export function isElement(value: unknown): value is TElement {
  return ElementApi.isElement(value);
}

/**
 * Checks if a value is a Slate Text node
 *
 * @param value - The value to check
 * @returns True if the value is a text node (has text property)
 *
 * @example
 * ```typescript
 * if (isText(node)) {
 *   // node is TText, has .text
 *   console.log(node.text);
 * }
 * ```
 */
export function isText(value: unknown): value is TText {
  return TextApi.isText(value);
}

/**
 * Checks if a value is a Slate Node (any type)
 *
 * @param value - The value to check
 * @returns True if the value is any type of node
 */
export function isNode(value: unknown): value is TNode {
  return NodeApi.isNode(value);
}

/**
 * Checks if a value is a Descendant node (Element or Text)
 *
 * @param value - The value to check
 * @returns True if the value is an element or text node
 */
export function isDescendant(value: unknown): value is Descendant {
  return NodeApi.isDescendant(value);
}

/**
 * Checks if an element has a specific type
 *
 * @param value - The value to check
 * @param type - The type to match against
 * @returns True if the value is an element with the specified type
 *
 * @example
 * ```typescript
 * if (isElementType(node, 'paragraph')) {
 *   // node is a paragraph element
 * }
 * ```
 */
export function isElementType<T extends TElement>(
  value: unknown,
  type: string
): value is T {
  return ElementApi.isElementType(value, type);
}

// ============================================================================
// Node Traversal Utilities
// ============================================================================

/**
 * Gets the children of a node
 *
 * @param node - The node to get children from
 * @returns Array of child nodes, or empty array if node has no children
 *
 * @example
 * ```typescript
 * const children = getChildren(paragraphElement);
 * for (const child of children) {
 *   if (isText(child)) {
 *     processText(child);
 *   }
 * }
 * ```
 */
export function getChildren(node: TNode): Descendant[] {
  if (isText(node)) {
    return [];
  }
  // Element or Editor nodes have children
  return (node as TElement).children || [];
}

/**
 * Gets the text content of a node (concatenated from all descendant text nodes)
 *
 * @param node - The node to get text from
 * @returns Concatenated text content
 *
 * @example
 * ```typescript
 * const text = getNodeText(paragraphElement);
 * // Returns all text content from the paragraph
 * ```
 */
export function getNodeText(node: TNode): string {
  return NodeApi.string(node);
}

/**
 * Gets the type of an element node
 *
 * @param element - The element to get the type from
 * @returns The element's type, or undefined if not an element
 */
export function getElementType(element: TElement): string {
  return element.type;
}

/**
 * Checks if a node has children
 *
 * @param node - The node to check
 * @returns True if the node has children
 */
export function hasChildren(node: TNode): boolean {
  return getChildren(node).length > 0;
}

/**
 * Gets all text nodes from a root node
 *
 * @param root - The root node to search
 * @returns Array of text nodes
 */
export function getTextNodes<N extends TNode>(root: N): TText[] {
  const result: TText[] = [];
  const generator = NodeApi.texts(root);
  let next = generator.next();
  while (!next.done) {
    result.push(next.value[0] as TText);
    next = generator.next();
  }
  return result;
}

/**
 * Gets all element nodes from a root node
 *
 * @param root - The root node to search
 * @returns Array of element nodes
 */
export function getElementNodes<N extends TNode>(root: N): TElement[] {
  const result: TElement[] = [];
  const generator = NodeApi.elements(root);
  let next = generator.next();
  while (!next.done) {
    result.push(next.value[0] as TElement);
    next = generator.next();
  }
  return result;
}

/**
 * Iterates through all descendant nodes
 *
 * @param root - The root node to traverse
 * @returns Array of descendant nodes
 */
export function getDescendants<N extends TNode>(root: N): Descendant[] {
  const result: Descendant[] = [];
  const generator = NodeApi.descendants(root);
  let next = generator.next();
  while (!next.done) {
    result.push(next.value[0] as Descendant);
    next = generator.next();
  }
  return result;
}

// ============================================================================
// Node Property Utilities
// ============================================================================

/**
 * Extracts custom properties from a node (excluding children/text)
 *
 * @param node - The node to extract props from
 * @returns Object with the node's custom properties
 */
export function extractNodeProps<N extends TNode>(
  node: N
): Record<string, unknown> {
  return NodeApi.extractProps(node) as Record<string, unknown>;
}

/**
 * Checks if a node matches a set of properties
 *
 * @param node - The node to check
 * @param props - The properties to match against
 * @returns True if the node matches all specified properties
 */
export function nodeMatches(
  node: Descendant,
  props: Partial<Descendant>
): boolean {
  return NodeApi.matches(node, props);
}

/**
 * Gets a mark value from a text node
 *
 * @param text - The text node
 * @param mark - The mark key to get
 * @returns The mark value or undefined
 */
export function getTextMark<T = unknown>(
  text: TText,
  mark: string
): T | undefined {
  return (text as Record<string, unknown>)[mark] as T | undefined;
}

/**
 * Checks if a text node has a specific mark
 *
 * @param text - The text node
 * @param mark - The mark key to check
 * @returns True if the mark exists and is truthy
 */
export function hasTextMark(text: TText, mark: string): boolean {
  const value = getTextMark(text, mark);
  return value !== undefined && value !== false && value !== null;
}
