/**
 * Types.
 */

// Keep DOM type names explicit so Slate can talk about browser nodes and
// ranges without colliding with its own exported node/range names.
type DOMNode = globalThis.Node;
type DOMComment = globalThis.Comment;
type DOMElement = globalThis.Element;
type DOMText = globalThis.Text;
type DOMRange = globalThis.Range;
type DOMSelection = globalThis.Selection;
type DOMStaticRange = globalThis.StaticRange;

const DOMNode = globalThis.Node;
const DOMText = globalThis.Text;
const DOCUMENT_POSITION_PRECEDING = 2;
const DOCUMENT_POSITION_FOLLOWING = 4;

import { DOMEditor } from '../plugin/dom-editor';

export type {
  DOMComment,
  DOMElement,
  DOMNode,
  DOMRange,
  DOMSelection,
  DOMStaticRange,
};

export { DOMText };

declare global {
  interface Window {
    Selection: (typeof Selection)['constructor'];
    DataTransfer: (typeof DataTransfer)['constructor'];
    Node: (typeof Node)['constructor'];
  }
}

export type DOMPoint = [Node, number];

/**
 * Returns the host window of a DOM node
 */

export const getDefaultView = (value: unknown): Window | null => {
  if (value == null || typeof value !== 'object') {
    return null;
  }

  const { ownerDocument } = value as {
    ownerDocument?: { defaultView?: Window | null };
  };

  return ownerDocument?.defaultView ?? null;
};

/**
 * Check if a DOM node is a comment node.
 */

export const isDOMComment = (value: unknown): value is DOMComment =>
  isDOMNode(value) && value.nodeType === 8;

/**
 * Check if a DOM node is an element node.
 */

export const isDOMElement = (value: unknown): value is DOMElement =>
  isDOMNode(value) && value.nodeType === 1;

/**
 * Check if a value is a DOM node.
 */

export const isDOMNode = (value: unknown): value is DOMNode => {
  const window = getDefaultView(value);
  const Node = window?.Node;

  return typeof Node === 'function' && value instanceof Node;
};

/**
 * Check if a value is a DOM selection.
 */

export const isDOMSelection = (value: unknown): value is DOMSelection => {
  if (value == null || typeof value !== 'object') {
    return false;
  }

  const { anchorNode } = value as { anchorNode?: unknown };
  const window = anchorNode ? getDefaultView(anchorNode) : null;
  const Selection = window?.Selection;

  return typeof Selection === 'function' && value instanceof Selection;
};

/**
 * Check if a DOM node is an element node.
 */

export const isDOMText = (value: unknown): value is DOMText =>
  isDOMNode(value) && value.nodeType === 3;

/**
 * Checks whether a paste event is a plaintext-only event.
 */

export const isPlainTextOnlyPaste = (event: ClipboardEvent) =>
  event.clipboardData &&
  event.clipboardData.getData('text/plain') !== '' &&
  event.clipboardData.types.length === 1;

/**
 * Normalize a DOM point so that it always refers to a text node.
 */

export const normalizeDOMPoint = (domPoint: DOMPoint): DOMPoint => {
  let [node, offset] = domPoint;

  // If it's an element node, its offset refers to the index of its children
  // including comment nodes, so try to find the right text child node.
  if (isDOMElement(node) && node.childNodes.length) {
    let isLast = offset === node.childNodes.length;
    let index = isLast ? offset - 1 : offset;
    [node, index] = getEditableChildAndIndex(
      node,
      index,
      isLast ? 'backward' : 'forward'
    );
    // If the editable child found is in front of input offset, we instead seek to its end
    isLast = index < offset;

    // If the node has children, traverse until we have a leaf node. Leaf nodes
    // can be either text nodes, or other void DOM nodes.
    while (isDOMElement(node) && node.childNodes.length) {
      const i = isLast ? node.childNodes.length - 1 : 0;
      node = getEditableChild(node, i, isLast ? 'backward' : 'forward');
    }

    // Determine the new offset inside the text node.
    offset = isLast && node.textContent != null ? node.textContent.length : 0;
  }

  // Return the node and offset.
  return [node, offset];
};

/**
 * Determines whether the active element is nested within a shadowRoot
 */

export const hasShadowRoot = (node: Node | null) => {
  let parent = node?.parentNode;
  while (parent) {
    if (parent.toString() === '[object ShadowRoot]') {
      return true;
    }
    parent = parent.parentNode;
  }
  return false;
};

/**
 * Get the nearest editable child and index at `index` in a `parent`, preferring
 * `direction`.
 */

export const getEditableChildAndIndex = (
  parent: DOMElement,
  index: number,
  direction: 'forward' | 'backward'
): [DOMNode, number] => {
  if (typeof index !== 'number') {
    throw new Error('Expected index to be a number');
  }

  const { childNodes } = parent;
  let resolvedIndex = index;
  let resolvedDirection = direction;
  let child = childNodes[resolvedIndex];
  let i = resolvedIndex;
  let triedForward = false;
  let triedBackward = false;

  // While the child is a comment node, or an element node with no children,
  // keep iterating to find a sibling non-void, non-comment node.
  while (
    isDOMComment(child) ||
    (isDOMElement(child) && child.childNodes.length === 0) ||
    (isDOMElement(child) && child.getAttribute('contenteditable') === 'false')
  ) {
    if (triedForward && triedBackward) {
      break;
    }

    if (i >= childNodes.length) {
      triedForward = true;
      i = resolvedIndex - 1;
      resolvedDirection = 'backward';
      continue;
    }

    if (i < 0) {
      triedBackward = true;
      i = resolvedIndex + 1;
      resolvedDirection = 'forward';
      continue;
    }

    child = childNodes[i];
    resolvedIndex = i;
    i += resolvedDirection === 'forward' ? 1 : -1;
  }

  return [child, resolvedIndex];
};

/**
 * Get the nearest editable child at `index` in a `parent`, preferring
 * `direction`.
 */

export const getEditableChild = (
  parent: DOMElement,
  index: number,
  direction: 'forward' | 'backward'
): DOMNode => {
  const [child] = getEditableChildAndIndex(parent, index, direction);
  return child;
};

/**
 * Get a plaintext representation of the content of a node, accounting for block
 * elements which get a newline appended.
 *
 * The domNode must be attached to the DOM.
 */

export const getPlainText = (domNode: DOMNode) => {
  let text = '';

  if (isDOMText(domNode) && domNode.nodeValue) {
    return domNode.nodeValue;
  }

  if (isDOMElement(domNode)) {
    for (const childNode of Array.from(domNode.childNodes)) {
      text += getPlainText(childNode);
    }

    const display =
      getDefaultView(domNode)
        ?.getComputedStyle(domNode)
        .getPropertyValue('display') ?? '';

    if (display === 'block' || display === 'list' || domNode.tagName === 'BR') {
      text += '\n';
    }
  }

  return text;
};

const DEFAULT_CLIPBOARD_FORMAT_KEY = 'x-slate-fragment';
const catchSlateFragment = /data-slate-fragment="(.+?)"/m;
const catchSlateFragmentFormat = /data-slate-fragment-format="(.+?)"/m;

/**
 * Get x-slate-fragment attribute from data-slate-fragment
 */
export const getSlateFragmentAttribute = (
  dataTransfer: DataTransfer,
  clipboardFormatKey = DEFAULT_CLIPBOARD_FORMAT_KEY
): string | void => {
  const htmlData = dataTransfer.getData('text/html');
  const [, fragment] = htmlData.match(catchSlateFragment) || [];

  if (!fragment) {
    return;
  }

  const [, fragmentFormat] = htmlData.match(catchSlateFragmentFormat) || [];

  if (fragmentFormat) {
    return fragmentFormat === clipboardFormatKey ? fragment : undefined;
  }

  if (clipboardFormatKey === DEFAULT_CLIPBOARD_FORMAT_KEY) {
    return fragment;
  }

  return;
};

/**
 * Get the x-slate-fragment attribute that exist in text/html data
 * and append it to the DataTransfer object
 */
export const getClipboardData = (
  dataTransfer: DataTransfer,
  clipboardFormatKey = DEFAULT_CLIPBOARD_FORMAT_KEY
): DataTransfer => {
  if (!dataTransfer.getData(`application/${clipboardFormatKey}`)) {
    const fragment = getSlateFragmentAttribute(
      dataTransfer,
      clipboardFormatKey
    );
    if (fragment) {
      const clipboardData = new DataTransfer();
      dataTransfer.types.forEach((type) => {
        clipboardData.setData(type, dataTransfer.getData(type));
      });
      clipboardData.setData(`application/${clipboardFormatKey}`, fragment);
      return clipboardData;
    }
  }
  return dataTransfer;
};

/**
 * Get the dom selection from Shadow Root if possible, otherwise from the document
 */
export const getSelection = (root: Document | ShadowRoot): Selection | null => {
  const getRootSelection = (root as { getSelection?: () => Selection | null })
    .getSelection;

  if (getRootSelection) {
    return getRootSelection.call(root);
  }

  return document.getSelection();
};

/**
 * Check whether a mutation originates from a editable element inside the editor.
 */

export const isTrackedMutation = (
  editor: DOMEditor,
  mutation: MutationRecord,
  batch: MutationRecord[]
): boolean => {
  const { target } = mutation;
  if (isDOMElement(target) && target.matches('[contentEditable="false"]')) {
    return false;
  }

  const { document } = DOMEditor.getWindow(editor);
  if (containsShadowAware(document, target)) {
    return DOMEditor.hasDOMNode(editor, target, { editable: true });
  }

  const parentMutation = batch.find(({ addedNodes, removedNodes }) => {
    for (const node of addedNodes) {
      if (node === target || containsShadowAware(node, target)) {
        return true;
      }
    }

    for (const node of removedNodes) {
      if (node === target || containsShadowAware(node, target)) {
        return true;
      }
    }

    return false;
  });

  if (!parentMutation || parentMutation === mutation) {
    return false;
  }

  // Target add/remove is tracked. Track the mutation if we track the parent mutation.
  return isTrackedMutation(editor, parentMutation, batch);
};

/**
 * Retrieves the deepest active element in the DOM, considering nested shadow DOMs.
 */
export const getActiveElement = () => {
  let activeElement = document.activeElement;

  while (activeElement?.shadowRoot?.activeElement) {
    activeElement = activeElement?.shadowRoot?.activeElement;
  }

  return activeElement;
};

/**
 * @returns `true` if `otherNode` is before `node` in the document; otherwise, `false`.
 */
export const isBefore = (node: DOMNode, otherNode: DOMNode): boolean =>
  Boolean(node.compareDocumentPosition(otherNode) & getPositionPreceding(node));

/**
 * @returns `true` if `otherNode` is after `node` in the document; otherwise, `false`.
 */
export const isAfter = (node: DOMNode, otherNode: DOMNode): boolean =>
  Boolean(node.compareDocumentPosition(otherNode) & getPositionFollowing(node));

const getPositionPreceding = (node: DOMNode) =>
  getDefaultView(node)
    ? DOCUMENT_POSITION_PRECEDING
    : node.DOCUMENT_POSITION_PRECEDING;

const getPositionFollowing = (node: DOMNode) =>
  getDefaultView(node)
    ? DOCUMENT_POSITION_FOLLOWING
    : node.DOCUMENT_POSITION_FOLLOWING;

/**
 * Shadow DOM-aware version of Element.closest()
 * Traverses up the DOM tree, crossing shadow DOM boundaries
 */
export const closestShadowAware = (
  element: DOMElement | null | undefined,
  selector: string
): DOMElement | null => {
  if (!element) {
    return null;
  }

  let current: DOMElement | null = element;

  while (current) {
    if (current.matches?.(selector)) {
      return current;
    }

    if (current.parentElement) {
      current = current.parentElement;
    } else if (current.parentNode && 'host' in current.parentNode) {
      current = (current.parentNode as ShadowRoot).host as DOMElement;
    } else {
      return null;
    }
  }

  return null;
};

/**
 * Shadow DOM-aware version of Node.contains()
 * Checks if a node contains another node, crossing shadow DOM boundaries
 */
export const containsShadowAware = (
  parent: DOMNode | null | undefined,
  child: DOMNode | null | undefined
): boolean => {
  if (!parent || !child) {
    return false;
  }

  if (parent.contains(child)) {
    return true;
  }

  let current: DOMNode | null = child;

  while (current) {
    if (current === parent) {
      return true;
    }

    if (current.parentNode) {
      if ('host' in current.parentNode) {
        current = (current.parentNode as ShadowRoot).host;
      } else {
        current = current.parentNode;
      }
    } else {
      return false;
    }
  }

  return false;
};
