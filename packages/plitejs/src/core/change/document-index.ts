import { getDefined } from '../../internal/get-defined';
import { isImmutable, rememberImmutableArray } from '../clone';
import {
  createTreeIndex,
  createTreeIndexNode,
  ResolvedTokenCursor,
  type TreeIndexChildren,
  type TreeIndexNode,
} from '../resolved-token-cursor';
import { countCoreWork } from '../work';
import { cloneFrozen, cloneJson, type JsonRecord } from './json';
import { lazyRootOf, type Roots } from './lazy-root';
import {
  assertJsonNode,
  CLAIMED_PREPARED_SOURCES,
  PreparedTokenSlice,
  PreparedTokenSliceStructureError,
  encodeNodes,
  encodeTrustedNodes,
  isElementNode,
  isTextNode,
  type JsonNode,
  type JsonPoint,
  type NodeKind,
  nodeProps,
  openToken,
  pathKey,
  PREPARED_SOURCE_TOKEN,
  type PreparedNodeSlice,
  tokensEqual,
} from './tokens';
import { transformPathAfterRemove } from './transform';

export type IndexEntry = {
  contentFrom: number;
  contentTo: number;
  from: number;
  kind: NodeKind;
  path: readonly number[];
  to: number;
};

export type IndexedNodeRange = Readonly<{
  contentFrom: number;
  contentTo: number;
  from: number;
  kind: NodeKind;
  path: readonly number[];
  to: number;
}>;

export type DecodeFrame = {
  children: JsonNode[];
  from: number;
  kind: NodeKind;
  openIndex: number;
  props: JsonRecord;
  text: string[];
};

export type ChangedOutputRange = readonly [number, number];

export type SparseNodes<T = JsonNode> = Readonly<{
  forEach: (visit: (node: T, index: number) => void) => void;
}>;

export type NodeList<T = JsonNode> = Readonly<{
  at: (index: number) => T | undefined;
  forEach: (visit: (node: T, index: number) => void) => void;
  length: number;
  slice: (from?: number, to?: number) => T[];
}>;

export const decodeNodes = (
  slice: PreparedTokenSlice,
  changedRanges: readonly ChangedOutputRange[] = [],
  options: Readonly<{ reuseUnpreparedSources?: boolean }> = {}
) => {
  const result: JsonNode[] = [];
  const stack: DecodeFrame[] = [];
  const tokens = [...slice.tokens];
  let index = 0;
  let position = 0;
  const claimedSources = new WeakSet<object>();
  const claimSource = (node: JsonNode, prepared: boolean) => {
    const nodes: JsonNode[] = [];
    const local = new WeakSet<object>();
    const collect = (current: JsonNode): boolean => {
      if (
        local.has(current) ||
        claimedSources.has(current) ||
        (prepared && CLAIMED_PREPARED_SOURCES.has(current))
      ) {
        return false;
      }

      local.add(current);
      nodes.push(current);

      return !isElementNode(current) || current.children.every(collect);
    };

    if (!collect(node)) return false;
    nodes.forEach((current) => {
      claimedSources.add(current);
      if (prepared) CLAIMED_PREPARED_SOURCES.add(current);
    });

    return true;
  };

  const appendNode = (node: JsonNode) => {
    const parent = stack.at(-1);

    if (!parent) {
      result.push(node);
      return;
    }

    if (parent.kind !== 'element') {
      throw new PreparedTokenSliceStructureError(
        'A text node cannot contain another node.'
      );
    }

    parent.children.push(node);
  };

  while (index < tokens.length) {
    const token = tokens[index];

    if (token.kind === 'open') {
      if (stack.at(-1)?.kind === 'text') {
        throw new PreparedTokenSliceStructureError(
          'A text node cannot contain another node.'
        );
      }

      const sourceTo = position + (token.sourceLength ?? 0);
      const sourceIsChanged = changedRanges.some(([from, to]) =>
        from === to
          ? position < from && from < sourceTo
          : position < to && from < sourceTo
      );
      const source = token[PREPARED_SOURCE_TOKEN];
      const prepared = source !== undefined;
      const sourceTokensMatch = (() => {
        if (!token.sourceNode || token.sourceTokenCount === undefined) {
          return false;
        }
        if (source) {
          for (let offset = 0; offset < token.sourceTokenCount; offset++) {
            if (
              tokens[index + offset] !== source.tokens[source.index + offset]
            ) {
              return false;
            }
          }

          return true;
        }

        const sourceTokens = encodeTrustedNodes([token.sourceNode], false);

        return (
          token.sourceTokenCount === sourceTokens.length &&
          sourceTokens.every((sourceToken, offset) => {
            const candidate = tokens[index + offset];

            return !!candidate && tokensEqual(candidate, sourceToken);
          })
        );
      })();

      if (
        token.sourceNode &&
        token.sourceLength !== undefined &&
        token.sourceTokenCount !== undefined &&
        sourceTokensMatch &&
        (!sourceIsChanged || prepared) &&
        (prepared || options.reuseUnpreparedSources !== false) &&
        claimSource(token.sourceNode, prepared)
      ) {
        appendNode(token.sourceNode);
        position = sourceTo;
        index += token.sourceTokenCount;
        continue;
      }

      stack.push({
        children: [],
        from: position,
        kind: token.nodeKind,
        openIndex: index,
        props: cloneJson(token.props),
        text: [],
      });
      position += 1;
      index += 1;
      continue;
    }

    if (token.kind === 'text') {
      const frame = stack.at(-1);

      if (frame?.kind !== 'text') {
        throw new PreparedTokenSliceStructureError(
          'Text content must be inside a text node.'
        );
      }

      frame.text.push(token.text);
      position += token.text.length;
      index += 1;
      continue;
    }

    const frame = stack.pop();

    if (!frame || frame.kind !== token.nodeKind) {
      throw new PreparedTokenSliceStructureError(
        'Unbalanced JSON token slice.'
      );
    }

    position += 1;

    const decodedNode =
      frame.kind === 'text'
        ? { ...frame.props, text: frame.text.join('') }
        : { ...frame.props, children: frame.children };

    assertJsonNode(decodedNode);

    const node =
      frame.kind === 'element'
        ? (Object.freeze({
            ...cloneFrozen(frame.props),
            children: Object.freeze(frame.children),
          }) as JsonNode)
        : cloneFrozen(decodedNode);
    const sourceTokenCount = index - frame.openIndex + 1;

    tokens[frame.openIndex] = openToken(frame.kind, frame.props, {
      length: position - frame.from,
      node,
      tokenCount: sourceTokenCount,
    });
    appendNode(node);
    index += 1;
  }

  if (stack.length > 0) {
    throw new PreparedTokenSliceStructureError('Unbalanced JSON token slice.');
  }

  return {
    nodes: Object.freeze(result),
    tokens: PreparedTokenSlice.fromTokens(tokens),
  };
};

export const nodeAtPath = (
  nodes: readonly JsonNode[],
  path: readonly number[]
): JsonNode => {
  if (path.length === 0) throw new Error('The document root is not a node.');

  let children = nodes;
  let node: JsonNode | undefined;

  for (const index of path) {
    node = children[index];
    if (!node) throw new Error(`Cannot resolve node at [${path}].`);

    children = isElementNode(node) ? node.children : [];
  }

  return getDefined(node);
};

const freezeElementWithChildren = (
  node: JsonNode,
  children: readonly JsonNode[]
) => Object.freeze({ ...node, children: Object.freeze(children) }) as JsonNode;

const elementWithChildren = (
  element: JsonNode,
  children: TreeIndexChildren
): TreeIndexNode => ({
  children,
  kind: 'element',
  length: children.totalLength + 2,
  node: freezeElementWithChildren(
    element,
    children.map((child) => child.node)
  ),
});

const replaceIndexedChildren = (
  tree: TreeIndexChildren,
  parentPath: readonly number[],
  replace: (children: TreeIndexChildren) => TreeIndexChildren
): TreeIndexChildren => {
  if (parentPath.length === 0) return replace(tree);

  const childIndex = parentPath[0];
  const entry = tree.at(childIndex);

  if (!entry?.children || !isElementNode(entry.node)) {
    throw new Error(`Cannot resolve element at [${parentPath}].`);
  }

  return tree.set(
    childIndex,
    elementWithChildren(
      entry.node,
      replaceIndexedChildren(entry.children, parentPath.slice(1), replace)
    )
  );
};

const spliceIndexedChildren = (
  tree: TreeIndexChildren,
  parentPath: readonly number[],
  index: number,
  deleteCount: number,
  inserted: readonly JsonNode[],
  cloneInserted = true,
  insertedIndexes?: readonly TreeIndexNode[]
) =>
  replaceIndexedChildren(tree, parentPath, (children) =>
    children.splice(
      index,
      deleteCount,
      insertedIndexes ??
        (cloneInserted ? inserted.map(cloneFrozen) : inserted).map(
          createTreeIndexNode
        )
    )
  );

const updateIndexedNode = (
  tree: TreeIndexChildren,
  path: readonly number[],
  update: (node: JsonNode) => JsonNode
) => {
  const index = path.at(-1);

  if (index === undefined) throw new Error('Cannot update the document root.');

  return replaceIndexedChildren(tree, path.slice(0, -1), (children) => {
    const entry = children.at(index);

    if (!entry) throw new Error(`Cannot resolve node at [${path}].`);

    const updatedNode = update(entry.node);
    const nextNode = isElementNode(updatedNode)
      ? (Object.freeze({
          ...cloneFrozen(nodeProps(updatedNode)),
          children: updatedNode.children,
        }) as JsonNode)
      : cloneFrozen(updatedNode);

    return children.set(index, createTreeIndexNode(nextNode));
  });
};

type IndexedNodeUpdate = Readonly<{
  path: readonly number[];
  props?: JsonRecord;
  text?: string;
}>;

type IndexedNodeUpdateBranch = {
  children: Map<number, IndexedNodeUpdateBranch>;
  props?: JsonRecord;
  text?: string;
};

const updateIndexedNodes = (
  tree: TreeIndexChildren,
  branch: IndexedNodeUpdateBranch
): TreeIndexChildren => {
  const updated = new Map<number, TreeIndexNode>();

  for (const [index, update] of branch.children) {
    const entry = tree.at(index);

    if (!entry) {
      throw new Error(`Cannot resolve node at child index ${index}.`);
    }

    let next = entry;

    if (update.children.size > 0) {
      if (!next.children || !isElementNode(next.node)) {
        throw new Error(`Cannot descend through text at child index ${index}.`);
      }
      next = elementWithChildren(
        next.node,
        updateIndexedNodes(next.children, update)
      );
    }

    if (update.props) {
      const { node } = next;

      next = {
        ...next,
        node: isTextNode(node)
          ? cloneFrozen({ ...update.props, text: node.text })
          : Object.freeze({
              ...cloneFrozen(update.props),
              children: node.children,
            }),
      };
    }

    if (update.text !== undefined) {
      if (!isTextNode(next.node)) {
        throw new Error(`Cannot update element text at child index ${index}.`);
      }
      next = {
        kind: 'text',
        length: update.text.length + 2,
        node: Object.freeze({ ...next.node, text: update.text }),
      };
    }

    updated.set(index, next);
  }

  return tree.setAll(updated);
};

/** @internal */
export const rootIndexOf = <K extends string>(source: Roots<K>, key: K) =>
  lazyRootOf(source, key) ??
  DocumentIndex.fromValue((source[key] ?? []) as readonly JsonNode[]);

export const NO_NODES: NodeList<never> = Object.freeze([]);

export const childAtPathIndex = <T>(list: NodeList<T>, index: number) =>
  Number.isInteger(index) && index >= 0 ? list.at(index) : undefined;

/**
 * An array an index built reads as that index's node list, so a root keeps
 * one identity whether a value holds it lazily or as that array.
 *
 * @internal
 */
export const rootNodesOf = <T, K extends string>(
  source: Readonly<Partial<Record<K, readonly T[]>>>,
  key: K
) =>
  (lazyRootOf(source, key)?.nodes ??
    DocumentIndex.nodesOf(source[key] ?? NO_NODES)) as NodeList<T>;

export class DocumentIndex {
  private static readonly immutableCache = new WeakMap<object, DocumentIndex>();

  readonly length: number;

  private readonly tree: TreeIndexChildren;
  private resolvedTokenCursor?: ResolvedTokenCursor;
  private nodeList?: NodeList;
  private tokenCache?: PreparedTokenSlice;
  private valueCache?: readonly JsonNode[];

  private constructor(
    tree: TreeIndexChildren,
    tokens?: PreparedTokenSlice,
    value?: readonly JsonNode[]
  ) {
    if (value) countCoreWork('indexedNodes', value.length);
    this.length = tree.totalLength;
    this.tokenCache = tokens;
    this.tree = tree;
    this.valueCache = value;
  }

  get size() {
    return this.tree.size;
  }

  get tokenCount() {
    return this.tokens.tokens.length;
  }

  get tokens() {
    this.tokenCache ??= encodeNodes(this.value).slice;

    return this.tokenCache;
  }

  /**
   * The top-level nodes as one array, built on the first read, since a commit
   * that edits one block copies only the sequence path to it.
   */
  get value(): readonly JsonNode[] {
    if (!this.valueCache) {
      countCoreWork('wholeReadNodes', this.tree.size);
      this.valueCache = this.tree.map((entry) => entry.node);
      DocumentIndex.remember(this);
    }

    return this.valueCache;
  }

  /** @internal */
  get builtValue(): readonly JsonNode[] | undefined {
    return this.valueCache;
  }

  static fromTokens(tokens: PreparedTokenSlice) {
    const decoded = decodeNodes(tokens);

    return DocumentIndex.remember(
      new DocumentIndex(
        createTreeIndex(decoded.nodes),
        decoded.tokens,
        decoded.nodes
      )
    );
  }

  static fromValue(value: readonly JsonNode[]) {
    const cached = DocumentIndex.immutableCache.get(value);

    if (cached) return cached;

    const nodes = isImmutable(value) ? value : cloneFrozen(value);

    return DocumentIndex.remember(
      new DocumentIndex(createTreeIndex(nodes), encodeNodes(nodes).slice, nodes)
    );
  }

  /** @internal */
  static fromIndexedNodes(nodes: readonly JsonNode[]) {
    return (
      DocumentIndex.immutableCache.get(nodes) ??
      DocumentIndex.remember(
        new DocumentIndex(
          createTreeIndex(nodes),
          PreparedTokenSlice.fromIndexedNodes(nodes),
          nodes
        )
      )
    );
  }

  static fromTree(tree: TreeIndexChildren) {
    return new DocumentIndex(tree);
  }

  /** @internal */
  static nodesOf(value: NodeList<unknown>): NodeList<unknown> {
    return DocumentIndex.immutableCache.get(value)?.nodes ?? value;
  }

  static fromChangedTokens(
    tokens: PreparedTokenSlice,
    changedRanges: readonly ChangedOutputRange[]
  ) {
    const decoded = decodeNodes(tokens, changedRanges);

    return DocumentIndex.remember(
      new DocumentIndex(
        createTreeIndex(decoded.nodes),
        decoded.tokens,
        decoded.nodes
      )
    );
  }

  private static remember(document: DocumentIndex) {
    const value = getDefined(document.valueCache);

    DocumentIndex.immutableCache.set(value, document);
    rememberImmutableArray(value);

    return document;
  }

  private checkedTree() {
    if (this.valueCache && this.valueCache.length !== this.tree.size) {
      throw new Error('A document root array changed outside the editor.');
    }

    return this.tree;
  }

  childPosition(parentPath: readonly number[], index: number) {
    const count =
      parentPath.length === 0
        ? this.tree.size
        : (() => {
            const parent = this.node(parentPath);

            if (!isElementNode(parent)) {
              throw new Error(`Node at [${parentPath}] is not an element.`);
            }

            return parent.children.length;
          })();

    if (!Number.isInteger(index) || index < 0 || index > count) {
      throw new RangeError(`Invalid child index ${index} at [${parentPath}].`);
    }

    if (index < count) {
      return this.entry([...parentPath, index]).from;
    }

    return parentPath.length === 0
      ? this.length
      : this.entry(parentPath).contentTo;
  }

  childBoundaryAt(position: number) {
    return this.cursor().childBoundaryAt(position);
  }

  nodeRangesTouching(from: number, to = from): readonly IndexedNodeRange[] {
    return this.cursor().nodeRangesTouching(from, to);
  }

  /**
   * Return the outer-to-inner node stack at one token position.
   *
   * @internal
   */
  openContextAt(position: number): readonly IndexedNodeRange[] {
    return this.cursor().openContextAt(position);
  }

  child(index: number) {
    return this.tree.at(index)?.node;
  }

  /**
   * The children of the element at `index` as an index of their own, over
   * the sequence this index already holds, or null when it holds text.
   *
   * @internal
   */
  childrenAt(index: number) {
    const children = this.tree.at(index)?.children;

    return children ? DocumentIndex.fromTree(children) : null;
  }

  get nodes(): NodeList {
    const { tree } = this;

    this.nodeList ??= Object.freeze({
      at: (index: number) => this.child(index),
      forEach: (visit: (node: JsonNode, index: number) => void) => {
        tree.forEach(0, (entry, index) => {
          visit(entry.node, index);
        });
      },
      length: tree.size,
      slice: (from = 0, to = tree.size) => {
        if (from <= 0 && to >= tree.size && tree.size > 0) {
          countCoreWork('wholeReadNodes', tree.size);
        }

        return tree.slice(from, to).map((entry) => entry.node);
      },
    });

    return this.nodeList;
  }

  /** @internal */
  changedChildren(other: DocumentIndex) {
    return this.tree.changedRanges(
      other.tree,
      (left, right) => left.node === right.node
    );
  }

  node(path: readonly number[]) {
    const top = path.length === 0 ? undefined : this.child(path[0]);

    if (!top) throw new Error(`Cannot resolve node at [${path}].`);

    return path.length === 1
      ? top
      : nodeAtPath(isElementNode(top) ? top.children : [], path.slice(1));
  }

  nodeRange(path: readonly number[]) {
    const { from, to } = this.entry(path);

    return { from, to };
  }

  nodeStartingAt(position: number) {
    return this.cursor().nodeStartingAt(position);
  }

  nodeSlice(path: readonly number[]) {
    return PreparedTokenSlice.fromIndexedNodes([this.node(path)]);
  }

  pointAt(position: number, assoc: -1 | 1 = -1): JsonPoint | null {
    return this.cursor().pointAt(position, assoc);
  }

  positionAt(point: JsonPoint) {
    const entry = this.entry(point.path);

    if (entry.kind !== 'text') {
      throw new Error(`Point path [${point.path}] is not a text node.`);
    }

    const length = entry.contentTo - entry.contentFrom;

    if (
      !Number.isInteger(point.offset) ||
      point.offset < 0 ||
      point.offset > length
    ) {
      throw new RangeError(`Invalid text offset ${point.offset}.`);
    }

    return entry.contentFrom + point.offset;
  }

  textAt(position: number) {
    return this.cursor().textAt(position);
  }

  withInsertedNode(path: readonly number[], node: JsonNode) {
    const index = path.at(-1);

    if (index === undefined) {
      throw new Error('Cannot insert the document root.');
    }

    return DocumentIndex.fromTree(
      spliceIndexedChildren(this.checkedTree(), path.slice(0, -1), index, 0, [
        node,
      ])
    );
  }

  withSplicedNodes(
    parentPath: readonly number[],
    index: number,
    deleteCount: number,
    nodes: readonly JsonNode[]
  ) {
    return DocumentIndex.fromTree(
      spliceIndexedChildren(
        this.checkedTree(),
        parentPath,
        index,
        deleteCount,
        nodes
      )
    );
  }

  /**
   * Insert nodes already decoded, detached, and frozen by PreparedTokenSlice.
   *
   * @internal
   */
  withDecodedSplicedNodes(
    parentPath: readonly number[],
    index: number,
    deleteCount: number,
    nodes: readonly JsonNode[]
  ) {
    return DocumentIndex.fromTree(
      spliceIndexedChildren(
        this.checkedTree(),
        parentPath,
        index,
        deleteCount,
        nodes,
        false
      )
    );
  }

  /**
   * Splice a prepared node slice without decoding or reindexing it.
   *
   * @internal
   */
  withPreparedSplicedNodes(
    parentPath: readonly number[],
    index: number,
    deleteCount: number,
    prepared: PreparedNodeSlice
  ) {
    return DocumentIndex.fromTree(
      spliceIndexedChildren(
        this.checkedTree(),
        parentPath,
        index,
        deleteCount,
        prepared.nodes,
        false,
        prepared.index.toArray()
      )
    );
  }

  withExactNodeProperties(path: readonly number[], props: JsonRecord) {
    return DocumentIndex.fromTree(
      updateIndexedNode(this.checkedTree(), path, (node) =>
        isTextNode(node)
          ? { ...props, text: node.text }
          : { ...props, children: node.children }
      )
    );
  }

  withNodeUpdates(updates: readonly IndexedNodeUpdate[]) {
    const root: IndexedNodeUpdateBranch = { children: new Map() };

    for (const update of updates) {
      if (update.path.length === 0) {
        throw new Error('Cannot update the document root.');
      }
      let branch = root;

      for (const index of update.path) {
        const child = branch.children.get(index) ?? { children: new Map() };

        branch.children.set(index, child);
        branch = child;
      }
      branch.props = update.props;
      branch.text = update.text;
    }

    return DocumentIndex.fromTree(updateIndexedNodes(this.checkedTree(), root));
  }

  withMovedNode(path: readonly number[], newPath: readonly number[]) {
    const sourceIndex = path.at(-1);
    const targetIndex = newPath.at(-1);

    if (sourceIndex === undefined || targetIndex === undefined) {
      throw new Error('Cannot move the document root.');
    }

    const sourceParent = path.slice(0, -1);
    const targetParent = newPath.slice(0, -1);

    if (pathKey(sourceParent) === pathKey(targetParent)) {
      return DocumentIndex.fromTree(
        replaceIndexedChildren(this.checkedTree(), sourceParent, (children) => {
          const moved = children.at(sourceIndex);

          if (!moved) throw new Error(`Cannot resolve node at [${path}].`);

          return children
            .splice(sourceIndex, 1, [])
            .splice(targetIndex, 0, [moved]);
        })
      );
    }

    const node = this.node(path);
    const transformedTarget = transformPathAfterRemove(newPath, path);

    if (!transformedTarget) {
      throw new Error('Cannot move a node inside itself.');
    }

    const without = spliceIndexedChildren(
      this.checkedTree(),
      sourceParent,
      sourceIndex,
      1,
      []
    );

    // The moved node is already a frozen member, and anchors follow it by identity.
    return DocumentIndex.fromTree(
      spliceIndexedChildren(
        without,
        transformedTarget.slice(0, -1),
        getDefined(transformedTarget.at(-1)),
        0,
        [node],
        false
      )
    );
  }

  withNodeProperties(path: readonly number[], properties: JsonRecord) {
    return DocumentIndex.fromTree(
      updateIndexedNode(this.checkedTree(), path, (node) => {
        const next = { ...node } as JsonRecord;

        for (const [key, value] of Object.entries(properties)) {
          if (value === null) {
            delete next[key];
          } else {
            next[key] = value;
          }
        }

        return next as JsonNode;
      })
    );
  }

  withRemovedNode(path: readonly number[]) {
    const index = path.at(-1);

    if (index === undefined) {
      throw new Error('Cannot remove the document root.');
    }

    return DocumentIndex.fromTree(
      spliceIndexedChildren(this.checkedTree(), path.slice(0, -1), index, 1, [])
    );
  }

  withText(path: readonly number[], from: number, to: number, text: string) {
    return DocumentIndex.fromTree(
      updateIndexedNode(this.checkedTree(), path, (node) => {
        if (!isTextNode(node)) {
          throw new Error(`Node at [${path}] is not text.`);
        }

        return {
          ...node,
          text: node.text.slice(0, from) + text + node.text.slice(to),
        };
      })
    );
  }

  slice(from: number, to = this.length) {
    if (from < 0 || to < from || to > this.length) {
      throw new RangeError(`Invalid token slice range ${from}-${to}.`);
    }
    if (from === to) return PreparedTokenSlice.empty;
    const text = this.textAt(from);

    if (text && to <= text.contentTo) {
      const node = this.node(text.path);

      if (isTextNode(node)) {
        return PreparedTokenSlice.text(
          node.text.slice(from - text.contentFrom, to - text.contentFrom)
        );
      }
    }
    if (this.tokenCache) return this.tokenCache.slice(from, to);

    // Encoding is compositional, so the sibling run around the range yields
    // the same tokens as the whole document without O(document) work.
    const run = this.cursor().siblingRunCovering(from, to);
    const parent =
      run.parentPath.length === 0 ? null : this.node(run.parentPath);

    if (parent && !isElementNode(parent)) {
      throw new Error(`Node at [${run.parentPath}] is not an element.`);
    }

    const siblings = parent
      ? parent.children.slice(run.first, run.last + 1)
      : this.tree.slice(run.first, run.last + 1).map((entry) => entry.node);

    return PreparedTokenSlice.fromIndexedNodes(siblings).slice(
      from - run.from,
      to - run.from
    );
  }

  private cursor() {
    if (!this.resolvedTokenCursor) {
      this.resolvedTokenCursor = new ResolvedTokenCursor(this.tree);
    }

    return this.resolvedTokenCursor;
  }

  private entry(path: readonly number[]) {
    if (path.length === 0) {
      throw new Error('The document root does not have a node entry.');
    }

    let children = this.tree;
    let position = 0;
    let node: TreeIndexNode | undefined;

    for (let depth = 0; depth < path.length; depth++) {
      const index = path[depth];

      node = children.at(index);
      if (!node) throw new Error(`Cannot resolve token range at [${path}].`);

      position += children.startOf(index);

      if (depth < path.length - 1) {
        if (!node.children) {
          throw new Error(`Cannot descend through text at [${path}].`);
        }

        position += 1;
        ({ children } = node);
      }
    }

    const from = position;
    const contentFrom = from + 1;
    const contentTo = from + getDefined(node).length - 1;

    return {
      contentFrom,
      contentTo,
      from,
      kind: getDefined(node).kind,
      path,
      to: from + getDefined(node).length,
    } satisfies IndexEntry;
  }
}
