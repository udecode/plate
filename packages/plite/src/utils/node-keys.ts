import type { Descendant, NodeKey } from '../interfaces';
import type { AnyEditor as Editor } from '../interfaces/editor';

const NODE_OWNERS = new WeakMap<object, Editor>();
const NODE_KEYS = new WeakMap<object, WeakMap<Editor, NodeKey>>();
const NODE_KEY_SCOPES = new WeakMap<Editor, string>();
const NEXT_NODE_KEY = new WeakMap<Editor, number>();
let nextNodeKeyScope = 0;
let nextPreparedNodeKeyOrdinal = 0;

export type PreparedNodeKeyRange = Readonly<{
  from: number;
  to: number;
}>;

const getNodeKeyScope = (editor: Editor) => {
  const existing = NODE_KEY_SCOPES.get(editor);

  if (existing) return existing;
  const scope = `r${(nextNodeKeyScope++).toString(36)}`;

  NODE_KEY_SCOPES.set(editor, scope);
  return scope;
};

const getLiveNodeKeyPrefix = (editor: Editor) => `${getNodeKeyScope(editor)}:n`;

const allocateNodeKey = (editor: Editor): NodeKey => {
  const next = NEXT_NODE_KEY.get(editor) ?? 0;
  NEXT_NODE_KEY.set(editor, next + 1);
  return `${getLiveNodeKeyPrefix(editor)}${next}` as NodeKey;
};

/**
 * Return the deterministic editor-local token rendered during SSR.
 *
 * @internal
 */
export const getNodeKeyDOMValue = (nodeKey: NodeKey): string => {
  if (!nodeKey.startsWith('r')) return nodeKey;
  const separator = nodeKey.indexOf(':n', 1);

  return separator > 1 ? nodeKey.slice(separator + 1) : nodeKey;
};

const getNodeKeys = (node: object) => {
  let nodeKeys = NODE_KEYS.get(node);

  if (!nodeKeys) {
    nodeKeys = new WeakMap();
    NODE_KEYS.set(node, nodeKeys);
  }

  return nodeKeys;
};

export const getNodeKeyForNode = (
  node: object,
  editor: Editor
): NodeKey | null => {
  const existing = NODE_KEYS.get(node)?.get(editor);

  if (existing) return existing;
  return null;
};

/**
 * Reserve query-order-independent identities for one prepared forest.
 *
 * @internal
 */
export const reservePreparedNodeKeyRange = (
  span: number
): PreparedNodeKeyRange => {
  if (!Number.isSafeInteger(span) || span < 0) {
    throw new RangeError(`Invalid prepared node-key range span ${span}.`);
  }

  const from = nextPreparedNodeKeyOrdinal;
  const to = from + span;

  if (!Number.isSafeInteger(to)) {
    throw new RangeError('Prepared node-key range exceeds safe integer space.');
  }
  nextPreparedNodeKeyOrdinal = to;

  return Object.freeze({ from, to });
};

/**
 * Resolve the opaque identity reserved for one node-open offset.
 *
 * @internal
 */
export const preparedNodeKeyAt = (
  range: PreparedNodeKeyRange,
  offset: number
): NodeKey | null =>
  Number.isSafeInteger(offset) && offset >= 0 && range.from + offset < range.to
    ? (`p${range.from + offset}` as NodeKey)
    : null;

/**
 * Resolve a prepared identity back to its node-open offset.
 *
 * @internal
 */
export const preparedNodeKeyOffset = (
  range: PreparedNodeKeyRange,
  nodeKey: NodeKey
) => {
  if (!nodeKey.startsWith('p')) return null;
  const ordinal = Number.parseInt(nodeKey.slice(1), 10);

  return Number.isSafeInteger(ordinal) &&
    nodeKey === `p${ordinal}` &&
    ordinal >= range.from &&
    ordinal < range.to
    ? ordinal - range.from
    : null;
};

const advanceNextNodeKey = (editor: Editor, nodeKey: NodeKey) => {
  const prefix = getLiveNodeKeyPrefix(editor);

  if (!nodeKey.startsWith(prefix)) return;
  const numericPart = Number.parseInt(nodeKey.slice(prefix.length), 10);
  const next = NEXT_NODE_KEY.get(editor) ?? 0;

  if (Number.isFinite(numericPart) && numericPart >= next) {
    NEXT_NODE_KEY.set(editor, numericPart + 1);
  }
};

export const getOrCreateNodeKey = (node: object, owner?: Editor): NodeKey => {
  const editor = owner ?? NODE_OWNERS.get(node);

  if (!editor) {
    throw new Error('Missing node-key owner for node');
  }

  const nodeKeys = getNodeKeys(node);
  const existing = nodeKeys.get(editor);

  if (existing) {
    NODE_OWNERS.set(node, editor);
    return existing;
  }

  const nodeKey = allocateNodeKey(editor);
  NODE_OWNERS.set(node, editor);
  nodeKeys.set(editor, nodeKey);
  return nodeKey;
};

export const setNodeKey = (node: object, editor: Editor, nodeKey: NodeKey) => {
  if (
    nodeKey.startsWith('r') &&
    !nodeKey.startsWith(getLiveNodeKeyPrefix(editor))
  ) {
    throw new Error(
      'Cannot assign a node key owned by another editor runtime.'
    );
  }
  NODE_OWNERS.set(node, editor);
  getNodeKeys(node).set(editor, nodeKey);
  advanceNextNodeKey(editor, nodeKey);
};

export const assignFreshNodeKey = (node: object, editor: Editor): NodeKey => {
  const nodeKey = allocateNodeKey(editor);

  NODE_OWNERS.set(node, editor);
  getNodeKeys(node).set(editor, nodeKey);

  return nodeKey;
};

export const inheritNodeKey = (
  nextNode: object,
  previousNode: object,
  owner?: Editor
) => {
  const editor = owner ?? NODE_OWNERS.get(previousNode);
  const nodeKey = editor ? NODE_KEYS.get(previousNode)?.get(editor) : null;

  if (!nodeKey || !editor) {
    return;
  }

  setNodeKey(nextNode, editor, nodeKey);
};

export const inheritNodeKeys = (
  nextNode: Descendant,
  previousNode: Descendant,
  editor: Editor
) => {
  inheritNodeKey(nextNode, previousNode, editor);

  if (
    !('children' in nextNode) ||
    !('children' in previousNode) ||
    !Array.isArray(nextNode.children) ||
    !Array.isArray(previousNode.children)
  ) {
    return;
  }

  for (let index = 0; index < previousNode.children.length; index += 1) {
    const nextChild = nextNode.children[index];
    const previousChild = previousNode.children[index];

    if (nextChild && previousChild) {
      inheritNodeKeys(nextChild, previousChild, editor);
    }
  }
};

export const seedNodeKeys = (
  children: readonly Descendant[],
  editor: Editor
) => {
  for (const child of children) {
    getOrCreateNodeKey(child, editor);

    if ('children' in child && Array.isArray(child.children)) {
      seedNodeKeys(child.children, editor);
    }
  }
};
