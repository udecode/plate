export type JsonRecord = Record<string, unknown>;

export type JsonNode = JsonRecord &
  (
    | { children: readonly JsonNode[]; text?: never }
    | { children?: never; text: string }
  );

export type JsonEditorValue = JsonRecord & {
  children: readonly JsonNode[];
  roots?: Readonly<Record<string, readonly JsonNode[]>>;
};

export type JsonPoint = {
  offset: number;
  path: readonly number[];
};

export type JsonElementNode = JsonRecord & {
  children: readonly JsonNode[];
};

export type JsonTextNode = JsonRecord & {
  text: string;
};

export type NodeKind = 'element' | 'text';

export const PREPARED_SOURCE_TOKEN = Symbol('plite.prepared-source-token');
export const CLAIMED_PREPARED_SOURCES = new WeakSet<object>();
export const PREPARED_TOKEN_NEXT = new WeakMap<JsonToken, JsonToken | null>();

export const claimPreparedNodeSlice = (nodes: readonly JsonNode[]) => {
  const claimed: object[] = [];
  const local = new WeakSet<object>();
  const collect = (node: JsonNode): boolean => {
    if (local.has(node) || CLAIMED_PREPARED_SOURCES.has(node)) return false;

    local.add(node);
    claimed.push(node);

    return !isElementNode(node) || node.children.every(collect);
  };

  if (!nodes.every(collect)) return false;
  claimed.forEach((node) => {
    CLAIMED_PREPARED_SOURCES.add(node);
  });

  return true;
};

export type OpenToken = {
  [PREPARED_SOURCE_TOKEN]?: true;
  kind: 'open';
  nodeKind: NodeKind;
  props: Readonly<JsonRecord>;
  sourceLength?: number;
  sourceNode?: JsonNode;
  sourceTokenCount?: number;
};

export type TextToken = {
  kind: 'text';
  text: string;
};

export type CloseToken = {
  kind: 'close';
  nodeKind: NodeKind;
};

export type JsonToken = CloseToken | OpenToken | TextToken;

export type JsonTokenData =
  | {
      kind: 'close';
      nodeKind: NodeKind;
    }
  | {
      kind: 'open';
      nodeKind: NodeKind;
      props: JsonRecord;
    }
  | {
      kind: 'text';
      text: string;
    };

/** @internal A token slice cannot form a balanced JSON node tree here. */
export class PreparedTokenSliceStructureError extends Error {}

export const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isElementNode = (node: JsonNode): node is JsonElementNode =>
  Array.isArray(node.children);

export const isTextNode = (node: JsonNode): node is JsonTextNode =>
  typeof node.text === 'string';

export const jsonEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;

  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => jsonEqual(value, right[index]))
    );
  }

  if (!isRecord(left) || !isRecord(right)) return false;

  const keys = Object.keys(left);

  return (
    keys.length === Object.keys(right).length &&
    keys.every(
      (key) => Object.hasOwn(right, key) && jsonEqual(left[key], right[key])
    )
  );
};

export const cloneJson = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((item) => cloneJson(item)) as T;
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, cloneJson(item)])
    ) as T;
  }

  return value;
};

export const deepFreeze = <T>(value: T): T => {
  if (Array.isArray(value)) {
    for (const item of value) deepFreeze(item);

    return Object.freeze(value);
  }

  if (isRecord(value)) {
    for (const item of Object.values(value)) deepFreeze(item);

    return Object.freeze(value) as T;
  }

  return value;
};

export const cloneFrozen = <T>(value: T): T => deepFreeze(cloneJson(value));

export const pathKey = (path: readonly number[]) => JSON.stringify(path);

export const tokenLength = (token: JsonToken) =>
  token.kind === 'text' ? token.text.length : 1;

export const tokensEqual = (left: JsonToken, right: JsonToken) => {
  if (left.kind !== right.kind) return false;

  if (left.kind === 'text' && right.kind === 'text') {
    return left.text === right.text;
  }

  if (left.kind === 'open' && right.kind === 'open') {
    return (
      left.nodeKind === right.nodeKind && jsonEqual(left.props, right.props)
    );
  }

  return (
    left.kind === 'close' &&
    right.kind === 'close' &&
    left.nodeKind === right.nodeKind
  );
};

export const commonPrefixLength = (
  left: readonly JsonToken[],
  right: readonly JsonToken[]
) => {
  let length = 0;

  for (let index = 0; index < left.length && index < right.length; index += 1) {
    const leftToken = left[index]!;
    const rightToken = right[index]!;

    if (tokensEqual(leftToken, rightToken)) {
      length += tokenLength(leftToken);
      continue;
    }

    if (leftToken.kind === 'text' && rightToken.kind === 'text') {
      const limit = Math.min(leftToken.text.length, rightToken.text.length);

      for (let offset = 0; offset < limit; offset += 1) {
        if (leftToken.text[offset] !== rightToken.text[offset]) return length;

        length += 1;
      }
    }

    return length;
  }

  return length;
};

export const commonSuffixLength = (
  left: readonly JsonToken[],
  right: readonly JsonToken[],
  limit: number
) => {
  let length = 0;
  let leftIndex = left.length - 1;
  let rightIndex = right.length - 1;

  while (leftIndex >= 0 && rightIndex >= 0 && length < limit) {
    const leftToken = left[leftIndex]!;
    const rightToken = right[rightIndex]!;
    const remaining = limit - length;

    if (tokensEqual(leftToken, rightToken)) {
      const size = Math.min(tokenLength(leftToken), remaining);
      length += size;

      if (size < tokenLength(leftToken)) return length;

      leftIndex -= 1;
      rightIndex -= 1;
      continue;
    }

    if (leftToken.kind === 'text' && rightToken.kind === 'text') {
      const textLimit = Math.min(
        leftToken.text.length,
        rightToken.text.length,
        remaining
      );

      for (let offset = 1; offset <= textLimit; offset += 1) {
        if (leftToken.text.at(-offset) !== rightToken.text.at(-offset)) {
          return length;
        }

        length += 1;
      }
    }

    return length;
  }

  return length;
};

export const openToken = (
  nodeKind: NodeKind,
  props: JsonRecord,
  source?: {
    length: number;
    node: JsonNode;
    tokenCount: number;
  }
): OpenToken => {
  assertEditorJsonValue(props, 'Document node properties');

  if (Object.hasOwn(props, 'children') || Object.hasOwn(props, 'text')) {
    throw new Error('Token props cannot contain structural node fields.');
  }

  return Object.freeze({
    kind: 'open',
    nodeKind,
    props: cloneFrozen(props),
    ...(source
      ? {
          sourceLength: source.length,
          sourceNode: source.node,
          sourceTokenCount: source.tokenCount,
        }
      : {}),
  });
};

export const closeToken = (nodeKind: NodeKind): CloseToken =>
  Object.freeze({
    kind: 'close',
    nodeKind,
  });

export const textToken = (text: string): TextToken =>
  Object.freeze({ kind: 'text', text });

export const normalizeTokens = (tokens: readonly JsonToken[]) => {
  const normalized: JsonToken[] = [];

  for (const token of tokens) {
    if (token.kind === 'text') {
      if (token.text.length === 0) continue;

      const previous = normalized.at(-1);

      if (previous?.kind === 'text') {
        normalized[normalized.length - 1] = textToken(
          previous.text + token.text
        );
      } else {
        normalized.push(textToken(token.text));
      }
    } else if (token.kind === 'open') {
      normalized.push(token);
    } else {
      normalized.push(token);
    }
  }

  return Object.freeze(normalized);
};

export type PreparedNodeSlice = Readonly<{
  index: TreeIndexChildren;
  nodes: readonly JsonNode[];
  nodeKeys: PreparedNodeKeyRange;
}>;

export const DOCUMENT_SLICE_TOKENS = new WeakMap<
  PreparedTokenSlice,
  readonly JsonToken[]
>();
export const DOCUMENT_SLICE_OFFSETS = new WeakMap<
  PreparedTokenSlice,
  readonly number[]
>();
export const DOCUMENT_SLICE_PREPARED_NODES = new WeakMap<
  PreparedTokenSlice,
  PreparedNodeSlice
>();
export const DOCUMENT_SLICE_DEFERRED_VIEWS = new WeakMap<
  PreparedTokenSlice,
  Readonly<{
    from: number;
    source: PreparedTokenSlice;
    to: number;
  }>
>();
const DOCUMENT_SLICE_RUNTIME_NODE_KEYS = new WeakMap<
  PreparedTokenSlice,
  ReadonlyMap<number, NodeKey>
>();

/** @internal Runtime-only identities carried by inserted token content. */
export const getDocumentSliceNodeKeys = (slice: PreparedTokenSlice) =>
  DOCUMENT_SLICE_RUNTIME_NODE_KEYS.get(slice) ?? new Map<number, NodeKey>();

/** @internal Read the immutable node/index run behind a prepared slice. */
export const getPreparedDocumentSlice = (slice: PreparedTokenSlice) =>
  DOCUMENT_SLICE_PREPARED_NODES.get(slice);

/** @internal Resolve one prepared node path without materializing slice tokens. */
export const getPreparedDocumentNodeKey = (
  slice: PreparedTokenSlice,
  path: readonly number[]
) => {
  const prepared = DOCUMENT_SLICE_PREPARED_NODES.get(slice);

  if (!prepared || path.length === 0) return null;
  let children = prepared.index;
  let position = 0;

  for (let depth = 0; depth < path.length; depth++) {
    const index = path[depth]!;
    const node = children.children[index];
    const offset = children.offsets[index];

    if (!node || offset === undefined) return null;
    position += offset;

    if (depth === path.length - 1) {
      return (
        DOCUMENT_SLICE_RUNTIME_NODE_KEYS.get(slice)?.get(position) ??
        preparedNodeKeyAt(prepared.nodeKeys, position)
      );
    }
    if (!node.children) return null;
    position += 1;
    children = node.children;
  }

  return null;
};

/** @internal Resolve one prepared identity without materializing slice tokens. */
export const getPreparedDocumentRuntimePath = (
  slice: PreparedTokenSlice,
  nodeKey: NodeKey
) => {
  const prepared = DOCUMENT_SLICE_PREPARED_NODES.get(slice);

  if (!prepared) return null;
  const runtimeNodeKeys = DOCUMENT_SLICE_RUNTIME_NODE_KEYS.get(slice);
  const runtimePosition = runtimeNodeKeys
    ? [...runtimeNodeKeys].find(([, key]) => key === nodeKey)?.[0]
    : undefined;
  const position =
    runtimePosition ?? preparedNodeKeyOffset(prepared.nodeKeys, nodeKey);

  if (position === null) return null;

  return (
    new ResolvedTokenCursor(prepared.index).nodeStartingAt(position)?.path ??
    null
  );
};

/** @internal Report whether a slice has paid the token-materialization cost. */
export const hasMaterializedDocumentSliceTokens = (slice: PreparedTokenSlice) =>
  DOCUMENT_SLICE_TOKENS.has(slice);

/** @internal Whether a slice is a lazy view over prepared document content. */
export const isDeferredPreparedDocumentSlice = (slice: PreparedTokenSlice) =>
  DOCUMENT_SLICE_DEFERRED_VIEWS.has(slice);

export class PreparedTokenSlice {
  static readonly empty = new PreparedTokenSlice([], true);

  readonly length: number;

  private constructor(
    tokens: readonly JsonToken[],
    normalized = false,
    preparedNodes?: PreparedNodeSlice,
    deferredView?: Readonly<{
      from: number;
      source: PreparedTokenSlice;
      to: number;
    }>,
    runtimeNodeKeys?: ReadonlyMap<number, NodeKey>
  ) {
    const source = normalized ? Object.freeze(tokens) : normalizeTokens(tokens);
    const offsets: number[] = [];
    let length = 0;

    if (preparedNodes) {
      length = preparedNodes.index.length;
      DOCUMENT_SLICE_PREPARED_NODES.set(this, preparedNodes);
    } else if (deferredView) {
      length = deferredView.to - deferredView.from;
      DOCUMENT_SLICE_DEFERRED_VIEWS.set(this, deferredView);
    } else {
      for (const token of source) {
        offsets.push(length);
        length += tokenLength(token);
      }
      DOCUMENT_SLICE_TOKENS.set(this, source);
      DOCUMENT_SLICE_OFFSETS.set(this, Object.freeze(offsets));
    }

    if (runtimeNodeKeys && runtimeNodeKeys.size > 0) {
      DOCUMENT_SLICE_RUNTIME_NODE_KEYS.set(this, new Map(runtimeNodeKeys));
    }

    this.length = length;
    Object.freeze(this);
  }

  get offsets(): readonly number[] {
    this.materializeTokens();

    return DOCUMENT_SLICE_OFFSETS.get(this)!;
  }

  get tokens(): readonly JsonToken[] {
    return this.materializeTokens();
  }

  private materializeTokens() {
    const cached = DOCUMENT_SLICE_TOKENS.get(this);

    if (cached) return cached;
    const deferred = DOCUMENT_SLICE_DEFERRED_VIEWS.get(this);

    if (deferred) {
      const tokens = deferred.source.sliceMaterialized(
        deferred.from,
        deferred.to
      ).tokens;
      const offsets: number[] = [];
      let length = 0;

      for (const token of tokens) {
        offsets.push(length);
        length += tokenLength(token);
      }
      DOCUMENT_SLICE_TOKENS.set(this, tokens);
      DOCUMENT_SLICE_OFFSETS.set(this, Object.freeze(offsets));

      return tokens;
    }
    const prepared = DOCUMENT_SLICE_PREPARED_NODES.get(this);

    if (!prepared) return Object.freeze([]) as readonly JsonToken[];
    const tokens = Object.freeze(encodeTrustedNodes(prepared.nodes, true));
    const offsets: number[] = [];
    let length = 0;

    for (const token of tokens) {
      offsets.push(length);
      length += tokenLength(token);
    }
    DOCUMENT_SLICE_TOKENS.set(this, tokens);
    DOCUMENT_SLICE_OFFSETS.set(this, Object.freeze(offsets));

    return tokens;
  }

  static fromJSON(json: readonly JsonTokenData[]) {
    assertEditorJsonValue(json, 'Token slice JSON');

    if (!Array.isArray(json)) {
      throw new Error('Invalid token slice JSON.');
    }

    const tokens = json.map((token): JsonToken => {
      if (!isRecord(token)) throw new Error('Invalid token slice JSON.');

      if (token.kind === 'text' && typeof token.text === 'string') {
        return textToken(token.text);
      }

      if (
        token.kind === 'close' &&
        (token.nodeKind === 'element' || token.nodeKind === 'text')
      ) {
        return closeToken(token.nodeKind);
      }

      if (
        token.kind === 'open' &&
        (token.nodeKind === 'element' || token.nodeKind === 'text') &&
        isRecord(token.props)
      ) {
        return openToken(token.nodeKind, token.props);
      }

      throw new Error('Invalid token slice JSON.');
    });

    return new PreparedTokenSlice(tokens);
  }

  static fromNodes(nodes: readonly JsonNode[]) {
    return encodeNodes(nodes).slice;
  }

  /** @internal Encode already detached, frozen, and shape-validated nodes. */
  static fromPreparedNodes(
    nodes: readonly JsonNode[],
    nodeKeyAt?: (path: readonly number[]) => NodeKey | null
  ) {
    const index = createTreeIndex(nodes);
    const runtimeNodeKeys = new Map<number, NodeKey>();
    const collectNodeKeys = (
      children: TreeIndexChildren,
      path: readonly number[] = [],
      position = 0
    ) => {
      children.children.forEach((child, childIndex) => {
        const childPath = [...path, childIndex];
        const childPosition = position + children.offsets[childIndex]!;
        const nodeKey = nodeKeyAt?.(childPath);

        if (nodeKey) runtimeNodeKeys.set(childPosition, nodeKey);
        if (child.children) {
          collectNodeKeys(child.children, childPath, childPosition + 1);
        }
      });
    };

    if (nodeKeyAt) collectNodeKeys(index);
    const prepared = Object.freeze({
      index,
      nodes,
      nodeKeys: reservePreparedNodeKeyRange(index.length),
    });

    return new PreparedTokenSlice(
      [],
      true,
      prepared,
      undefined,
      runtimeNodeKeys
    );
  }

  /** @internal Encode immutable nodes already owned by an indexed document. */
  static fromIndexedNodes(nodes: readonly JsonNode[]) {
    return new PreparedTokenSlice(encodeTrustedNodes(nodes, false), true);
  }

  static fromTokens(tokens: readonly JsonToken[]) {
    return new PreparedTokenSlice(tokens);
  }

  static text(text: string) {
    return text.length === 0
      ? PreparedTokenSlice.empty
      : new PreparedTokenSlice([textToken(text)], true);
  }

  /** @internal Concatenate normalized slices with one token/offset pass. */
  static concat(slices: readonly PreparedTokenSlice[]) {
    const tokens: JsonToken[] = [];
    const runtimeNodeKeys = new Map<number, NodeKey>();
    let position = 0;

    for (const slice of slices) {
      for (const [offset, nodeKey] of getDocumentSliceNodeKeys(slice)) {
        runtimeNodeKeys.set(position + offset, nodeKey);
      }
      for (const token of slice.tokens) {
        const previous = tokens.at(-1);

        if (previous?.kind === 'text' && token.kind === 'text') {
          tokens[tokens.length - 1] = textToken(previous.text + token.text);
        } else {
          tokens.push(token);
        }
      }
      position += slice.length;
    }

    return tokens.length === 0
      ? PreparedTokenSlice.empty
      : new PreparedTokenSlice(
          tokens,
          true,
          undefined,
          undefined,
          runtimeNodeKeys
        );
  }

  concat(other: PreparedTokenSlice) {
    if (this.length === 0) return other;
    if (other.length === 0) return this;

    return PreparedTokenSlice.concat([this, other]);
  }

  slice(from: number, to = this.length) {
    if (from < 0 || to < from || to > this.length) {
      throw new RangeError(`Invalid token slice range ${from}-${to}.`);
    }

    if (from === to) return PreparedTokenSlice.empty;
    if (from === 0 && to === this.length) return this;
    const runtimeNodeKeys = new Map<number, NodeKey>();

    for (const [offset, nodeKey] of getDocumentSliceNodeKeys(this)) {
      if (offset >= from && offset < to) {
        runtimeNodeKeys.set(offset - from, nodeKey);
      }
    }

    const deferred = DOCUMENT_SLICE_DEFERRED_VIEWS.get(this);

    if (deferred) {
      return new PreparedTokenSlice(
        [],
        true,
        undefined,
        {
          from: deferred.from + from,
          source: deferred.source,
          to: deferred.from + to,
        },
        runtimeNodeKeys
      );
    }
    if (DOCUMENT_SLICE_PREPARED_NODES.has(this)) {
      return new PreparedTokenSlice(
        [],
        true,
        undefined,
        {
          from,
          source: this,
          to,
        },
        runtimeNodeKeys
      );
    }

    return this.sliceMaterialized(from, to, runtimeNodeKeys);
  }

  private sliceMaterialized(
    from: number,
    to: number,
    runtimeNodeKeys = new Map<number, NodeKey>()
  ) {
    if (from < 0 || to < from || to > this.length) {
      throw new RangeError(`Invalid token slice range ${from}-${to}.`);
    }

    const result: JsonToken[] = [];
    let low = 0;
    let high = this.tokens.length;

    while (low < high) {
      const middle = (low + high) >> 1;
      const tokenEnd =
        this.offsets[middle]! + tokenLength(this.tokens[middle]!);

      if (tokenEnd <= from) {
        low = middle + 1;
      } else {
        high = middle;
      }
    }

    for (let index = low; index < this.tokens.length; index++) {
      const token = this.tokens[index]!;
      const position = this.offsets[index]!;
      const length = tokenLength(token);
      const end = position + length;
      const overlapFrom = Math.max(from, position);
      const overlapTo = Math.min(to, end);

      if (overlapFrom < overlapTo) {
        if (token.kind === 'text') {
          result.push(
            textToken(
              token.text.slice(overlapFrom - position, overlapTo - position)
            )
          );
        } else {
          if (overlapFrom !== position || overlapTo !== end) {
            throw new Error('A structural token cannot be split.');
          }

          result.push(token);
        }
      }

      if (end >= to) break;
    }

    return new PreparedTokenSlice(
      result,
      false,
      undefined,
      undefined,
      runtimeNodeKeys
    );
  }

  toJSON(): readonly JsonTokenData[] {
    return this.tokens.map((token) =>
      token.kind === 'open'
        ? {
            kind: token.kind,
            nodeKind: token.nodeKind,
            props: cloneJson(token.props),
          }
        : { ...token }
    );
  }
}

export const nodeProps = (node: JsonNode) => {
  const { children: _children, text: _text, ...props } = node;

  return props;
};

export const encodeTrustedNodes = (
  nodes: readonly JsonNode[],
  prepared: boolean
) => {
  const tokens: JsonToken[] = [];
  let position = 0;

  const encode = (node: JsonNode) => {
    const from = position;
    const kind: NodeKind = isTextNode(node) ? 'text' : 'element';
    const openIndex = tokens.length;
    const open: OpenToken = {
      ...(prepared ? { [PREPARED_SOURCE_TOKEN]: true as const } : {}),
      kind: 'open',
      nodeKind: kind,
      props: Object.freeze(nodeProps(node)),
    };

    tokens.push(open);
    position += 1;

    if (isTextNode(node)) {
      if (node.text.length > 0) {
        tokens.push(textToken(node.text));
        position += node.text.length;
      }
    } else {
      node.children.forEach(encode);
    }

    tokens.push(closeToken(kind));
    position += 1;
    open.sourceLength = position - from;
    open.sourceNode = node;
    open.sourceTokenCount = tokens.length - openIndex;
    Object.freeze(open);
  };

  nodes.forEach(encode);

  tokens.forEach((token, index) => {
    PREPARED_TOKEN_NEXT.set(token, tokens[index + 1] ?? null);
  });

  return tokens;
};

export function assertNode(node: unknown): asserts node is JsonNode {
  if (!isRecord(node)) throw new Error('A JSON node must be an object.');

  const hasText = Object.hasOwn(node, 'text');
  const hasChildren = Object.hasOwn(node, 'children');

  if (hasText === hasChildren) {
    throw new Error('A JSON node must contain either text or children.');
  }

  if (hasText && typeof node.text !== 'string') {
    throw new Error('A JSON text node must contain string text.');
  }

  if (hasChildren) {
    if (!Array.isArray(node.children)) {
      throw new Error('A JSON element node must contain child nodes.');
    }

    node.children.forEach(assertNode);
  }
}

export const encodeNodes = (nodes: readonly JsonNode[]) => {
  assertEditorJsonValue(nodes, 'Document nodes');

  const tokens: JsonToken[] = [];
  let position = 0;

  const encode = (node: JsonNode) => {
    assertNode(node);

    const from = position;
    const kind: NodeKind = isTextNode(node) ? 'text' : 'element';
    const openIndex = tokens.length;

    tokens.push(openToken(kind, nodeProps(node)));
    position += 1;

    if (isTextNode(node)) {
      if (node.text.length > 0) {
        tokens.push(textToken(node.text));
        position += node.text.length;
      }
    } else if (isElementNode(node)) {
      node.children.forEach(encode);
    } else {
      throw new Error('A JSON node must contain either text or children.');
    }

    tokens.push(closeToken(kind));
    position += 1;

    tokens[openIndex] = openToken(kind, nodeProps(node), {
      length: position - from,
      node,
      tokenCount: tokens.length - openIndex,
    });
  };

  nodes.forEach(encode);

  return {
    slice: PreparedTokenSlice.fromTokens(tokens),
  };
};
import {
  createTreeIndex,
  ResolvedTokenCursor,
  type TreeIndexChildren,
} from '../resolved-token-cursor';
import type { NodeKey } from '../../interfaces/editor';
import { assertEditorJsonValue } from '../value-codec';
import {
  preparedNodeKeyAt,
  preparedNodeKeyOffset,
  type PreparedNodeKeyRange,
  reservePreparedNodeKeyRange,
} from '../../utils/node-keys';
