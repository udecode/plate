import {
  assertNode,
  CLAIMED_PREPARED_SOURCES,
  cloneFrozen,
  cloneJson,
  PreparedTokenSlice,
  PreparedTokenSliceStructureError,
  encodeNodes,
  isElementNode,
  isTextNode,
  type JsonNode,
  type JsonPoint,
  type JsonRecord,
  type JsonToken,
  type NodeKind,
  nodeProps,
  openToken,
  pathKey,
  PREPARED_SOURCE_TOKEN,
  PREPARED_TOKEN_NEXT,
  type PreparedNodeSlice,
  tokensEqual,
} from './tokens';
import { transformPathAfterRemove } from './transform';
import {
  createTreeIndex,
  createTreeIndexChildren,
  createTreeIndexNode,
  ResolvedTokenCursor,
  type TreeIndexChildren,
  type TreeIndexNode,
} from '../resolved-token-cursor';

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
    const token = tokens[index]!;

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
      const prepared = token[PREPARED_SOURCE_TOKEN] === true;
      const sourceTokensMatch = (() => {
        if (!token.sourceNode || token.sourceTokenCount === undefined) {
          return false;
        }
        if (prepared) {
          let expected: JsonToken | null = token;

          for (let offset = 0; offset < token.sourceTokenCount; offset++) {
            if (!expected || tokens[index + offset] !== expected) return false;
            expected = PREPARED_TOKEN_NEXT.get(expected) ?? null;
          }

          return true;
        }

        const sourceTokens = encodeNodes([token.sourceNode]).slice.tokens;

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

    assertNode(decodedNode);

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

  return node!;
};

export type IndexedValue = {
  index: TreeIndexChildren;
  value: readonly JsonNode[];
};

export const replaceIndexedChildren = (
  indexed: IndexedValue,
  parentPath: readonly number[],
  replace: (
    value: readonly JsonNode[],
    index: TreeIndexChildren
  ) => IndexedValue
): IndexedValue => {
  if (parentPath.length === 0) return replace(indexed.value, indexed.index);

  const childIndex = parentPath[0]!;
  const node = indexed.value[childIndex];
  const nodeIndex = indexed.index.children[childIndex];

  if (!node || !nodeIndex || !isElementNode(node) || !nodeIndex.children) {
    throw new Error(`Cannot resolve element at [${parentPath}].`);
  }

  const nested = replaceIndexedChildren(
    { index: nodeIndex.children, value: node.children },
    parentPath.slice(1),
    replace
  );
  const nextNode = Object.freeze({
    ...node,
    children: nested.value,
  }) as JsonNode;
  const nextValue = [...indexed.value];
  const nextIndexes = [...indexed.index.children];

  nextValue[childIndex] = nextNode;
  nextIndexes[childIndex] = {
    children: nested.index,
    kind: 'element',
    length: nested.index.length + 2,
  };

  return {
    index: createTreeIndexChildren(nextIndexes),
    value: Object.freeze(nextValue),
  };
};

export const spliceIndexedChildren = (
  indexed: IndexedValue,
  parentPath: readonly number[],
  index: number,
  deleteCount: number,
  inserted: readonly JsonNode[],
  cloneInserted = true,
  insertedIndexes?: readonly TreeIndexNode[]
) =>
  replaceIndexedChildren(indexed, parentPath, (value, tree) => {
    const nextValue = [...value];
    const nextIndexes = [...tree.children];
    const frozenInserted = cloneInserted ? inserted.map(cloneFrozen) : inserted;

    nextValue.splice(index, deleteCount, ...frozenInserted);
    nextIndexes.splice(
      index,
      deleteCount,
      ...(insertedIndexes ?? frozenInserted.map(createTreeIndexNode))
    );

    return {
      index: createTreeIndexChildren(nextIndexes),
      value: Object.freeze(nextValue),
    };
  });

export const updateIndexedNode = (
  indexed: IndexedValue,
  path: readonly number[],
  update: (node: JsonNode) => JsonNode
) => {
  const index = path.at(-1);

  if (index === undefined) throw new Error('Cannot update the document root.');

  return replaceIndexedChildren(indexed, path.slice(0, -1), (value, tree) => {
    const node = value[index];

    if (!node) throw new Error(`Cannot resolve node at [${path}].`);

    const updatedNode = update(node);
    const nextNode = isElementNode(updatedNode)
      ? (Object.freeze({
          ...cloneFrozen(nodeProps(updatedNode)),
          children: updatedNode.children,
        }) as JsonNode)
      : cloneFrozen(updatedNode);
    const nextValue = [...value];
    const nextIndexes = [...tree.children];

    nextValue[index] = nextNode;
    nextIndexes[index] = createTreeIndexNode(nextNode);

    return {
      index: createTreeIndexChildren(nextIndexes),
      value: Object.freeze(nextValue),
    };
  });
};

export class DocumentIndex {
  private static readonly immutableCache = new WeakMap<object, DocumentIndex>();

  readonly length: number;
  readonly value: readonly JsonNode[];

  private readonly tree: TreeIndexChildren;
  private resolvedTokenCursor?: ResolvedTokenCursor;
  private tokenCache?: PreparedTokenSlice;

  private constructor(
    nodes: readonly JsonNode[],
    tokens?: PreparedTokenSlice,
    tree?: TreeIndexChildren
  ) {
    if (tree && !tokens) {
      this.length = tree.length;
      this.tree = tree;
      this.value = nodes;
      return;
    }

    if (tokens) {
      this.length = tokens.length;
      this.tokenCache = tokens;
      this.tree = tree ?? createTreeIndex(nodes);
      this.value = nodes;
      return;
    }

    const value = Object.isFrozen(nodes) ? nodes : cloneFrozen(nodes);
    const encoded = encodeNodes(value);

    this.length = encoded.slice.length;
    this.tokenCache = encoded.slice;
    this.tree = tree ?? createTreeIndex(value);
    this.value = value;
  }

  get tokenCount() {
    return this.tokens.tokens.length;
  }

  get tokens() {
    this.tokenCache ??= encodeNodes(this.value).slice;

    return this.tokenCache;
  }

  static fromTokens(tokens: PreparedTokenSlice) {
    const decoded = decodeNodes(tokens);

    return DocumentIndex.remember(
      new DocumentIndex(decoded.nodes, decoded.tokens)
    );
  }

  static fromValue(value: readonly JsonNode[]) {
    if (!Object.isFrozen(value)) {
      return DocumentIndex.remember(new DocumentIndex(value));
    }

    const cached = DocumentIndex.immutableCache.get(value);

    if (cached) return cached;

    return DocumentIndex.remember(new DocumentIndex(value));
  }

  static fromIndexedValue(indexed: IndexedValue) {
    return DocumentIndex.remember(
      new DocumentIndex(indexed.value, undefined, indexed.index)
    );
  }

  static fromChangedTokens(
    tokens: PreparedTokenSlice,
    changedRanges: readonly ChangedOutputRange[]
  ) {
    const decoded = decodeNodes(tokens, changedRanges);

    return DocumentIndex.remember(
      new DocumentIndex(decoded.nodes, decoded.tokens)
    );
  }

  private static remember(document: DocumentIndex) {
    if (Object.isFrozen(document.value)) {
      DocumentIndex.immutableCache.set(document.value, document);
    }

    return document;
  }

  childPosition(parentPath: readonly number[], index: number) {
    const children =
      parentPath.length === 0
        ? this.value
        : (() => {
            const parent = this.node(parentPath);

            if (!isElementNode(parent)) {
              throw new Error(`Node at [${parentPath}] is not an element.`);
            }

            return parent.children;
          })();

    if (!Number.isInteger(index) || index < 0 || index > children.length) {
      throw new RangeError(`Invalid child index ${index} at [${parentPath}].`);
    }

    if (index < children.length) {
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

  /** @internal Return the outer-to-inner node stack at one token position. */
  openContextAt(position: number): readonly IndexedNodeRange[] {
    return this.cursor().openContextAt(position);
  }

  node(path: readonly number[]) {
    return nodeAtPath(this.value, path);
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

    if (index === undefined)
      throw new Error('Cannot insert the document root.');

    return DocumentIndex.fromIndexedValue(
      spliceIndexedChildren(
        { index: this.tree, value: this.value },
        path.slice(0, -1),
        index,
        0,
        [node]
      )
    );
  }

  withSplicedNodes(
    parentPath: readonly number[],
    index: number,
    deleteCount: number,
    nodes: readonly JsonNode[]
  ) {
    return DocumentIndex.fromIndexedValue(
      spliceIndexedChildren(
        { index: this.tree, value: this.value },
        parentPath,
        index,
        deleteCount,
        nodes
      )
    );
  }

  /** @internal Insert nodes already decoded, detached, and frozen by PreparedTokenSlice. */
  withDecodedSplicedNodes(
    parentPath: readonly number[],
    index: number,
    deleteCount: number,
    nodes: readonly JsonNode[]
  ) {
    return DocumentIndex.fromIndexedValue(
      spliceIndexedChildren(
        { index: this.tree, value: this.value },
        parentPath,
        index,
        deleteCount,
        nodes,
        false
      )
    );
  }

  /** @internal Splice a prepared node slice without decoding or reindexing it. */
  withPreparedSplicedNodes(
    parentPath: readonly number[],
    index: number,
    deleteCount: number,
    prepared: PreparedNodeSlice
  ) {
    return DocumentIndex.fromIndexedValue(
      spliceIndexedChildren(
        { index: this.tree, value: this.value },
        parentPath,
        index,
        deleteCount,
        prepared.nodes,
        false,
        prepared.index.children
      )
    );
  }

  withExactNodeProperties(path: readonly number[], props: JsonRecord) {
    return DocumentIndex.fromIndexedValue(
      updateIndexedNode(
        { index: this.tree, value: this.value },
        path,
        (node) =>
          isTextNode(node)
            ? ({ ...props, text: node.text } as JsonNode)
            : ({ ...props, children: node.children } as JsonNode)
      )
    );
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
      return DocumentIndex.fromIndexedValue(
        replaceIndexedChildren(
          { index: this.tree, value: this.value },
          sourceParent,
          (value, tree) => {
            const nextValue = [...value];
            const nextIndexes = [...tree.children];
            const [node] = nextValue.splice(sourceIndex, 1);
            const [nodeIndex] = nextIndexes.splice(sourceIndex, 1);

            if (!node || !nodeIndex) {
              throw new Error(`Cannot resolve node at [${path}].`);
            }

            nextValue.splice(targetIndex, 0, node);
            nextIndexes.splice(targetIndex, 0, nodeIndex);

            return {
              index: createTreeIndexChildren(nextIndexes),
              value: Object.freeze(nextValue),
            };
          }
        )
      );
    }

    const node = this.node(path);
    const transformedTarget = transformPathAfterRemove(newPath, path);

    if (!transformedTarget) {
      throw new Error('Cannot move a node inside itself.');
    }

    const without = spliceIndexedChildren(
      { index: this.tree, value: this.value },
      sourceParent,
      sourceIndex,
      1,
      []
    );

    return DocumentIndex.fromIndexedValue(
      spliceIndexedChildren(
        without,
        transformedTarget.slice(0, -1),
        transformedTarget.at(-1)!,
        0,
        [node]
      )
    );
  }

  withNodeProperties(path: readonly number[], properties: JsonRecord) {
    return DocumentIndex.fromIndexedValue(
      updateIndexedNode(
        { index: this.tree, value: this.value },
        path,
        (node) => {
          const next = { ...node } as JsonRecord;

          for (const [key, value] of Object.entries(properties)) {
            if (value === null) {
              delete next[key];
            } else {
              next[key] = value;
            }
          }

          return next as JsonNode;
        }
      )
    );
  }

  withRemovedNode(path: readonly number[]) {
    const index = path.at(-1);

    if (index === undefined)
      throw new Error('Cannot remove the document root.');

    return DocumentIndex.fromIndexedValue(
      spliceIndexedChildren(
        { index: this.tree, value: this.value },
        path.slice(0, -1),
        index,
        1,
        []
      )
    );
  }

  withText(path: readonly number[], from: number, to: number, text: string) {
    return DocumentIndex.fromIndexedValue(
      updateIndexedNode(
        { index: this.tree, value: this.value },
        path,
        (node) => {
          if (!isTextNode(node)) {
            throw new Error(`Node at [${path}] is not text.`);
          }

          return {
            ...node,
            text: node.text.slice(0, from) + text + node.text.slice(to),
          };
        }
      )
    );
  }

  slice(from: number, to = this.length) {
    return this.tokens.slice(from, to);
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
      const index = path[depth]!;

      node = children.children[index];
      if (!node) throw new Error(`Cannot resolve token range at [${path}].`);

      position += children.offsets[index]!;

      if (depth < path.length - 1) {
        if (!node.children) {
          throw new Error(`Cannot descend through text at [${path}].`);
        }

        position += 1;
        children = node.children;
      }
    }

    const from = position;
    const contentFrom = from + 1;
    const contentTo = from + node!.length - 1;

    return {
      contentFrom,
      contentTo,
      from,
      kind: node!.kind,
      path,
      to: from + node!.length,
    } satisfies IndexEntry;
  }
}
