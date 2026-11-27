import { isRecord, type JsonRecord } from './change/json';
import {
  isElementNode,
  type JsonNode,
  type JsonTokenData,
  type PreparedTokenSlice,
  tokensEqual,
} from './change/tokens';
import type { PropertyModification } from './change/transform';

export const storedElementIdOf = (node: JsonNode): string | undefined => {
  const id = isElementNode(node) ? node.id : undefined;

  return typeof id === 'string' ? id : undefined;
};

const storedIds = (nodes: readonly JsonNode[], ids: string[] = []) => {
  for (const node of nodes) {
    const id = storedElementIdOf(node);

    if (id !== undefined) ids.push(id);
    if (isElementNode(node)) storedIds(node.children, ids);
  }

  return ids;
};

export const hasDuplicateStoredIds = (nodes: readonly JsonNode[]) => {
  const ids = storedIds(nodes);

  return new Set(ids).size < ids.length;
};

export const withoutStoredElementId = (
  props: Readonly<JsonRecord>
): Readonly<JsonRecord> => {
  if (typeof props.id !== 'string') return props;
  const { id: _id, ...rest } = props;

  return rest;
};

export const openTokenProps = (
  token: Readonly<{ nodeKind: string; props: Readonly<JsonRecord> }>
): Readonly<JsonRecord> =>
  token.nodeKind === 'element'
    ? withoutStoredElementId(token.props)
    : token.props;

const keysOf = (node: JsonRecord) =>
  Object.keys(node).filter(
    (key) => key !== 'id' || storedElementIdOf(node as JsonNode) === undefined
  );

const same = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((item, index) => same(item, right[index]))
    );
  }
  if (!isRecord(left) || !isRecord(right)) return false;

  const keys = keysOf(left);

  return (
    keys.length === keysOf(right).length &&
    keys.every(
      (key) => Object.hasOwn(right, key) && same(left[key], right[key])
    )
  );
};

const withoutPropertiesId = (value: unknown) =>
  isRecord(value) && !('text' in value) ? withoutStoredElementId(value) : value;

export const alike = (left: unknown, right: unknown) =>
  same(withoutPropertiesId(left), withoutPropertiesId(right));

export const tokenAlike = (
  left: JsonTokenData | undefined,
  right: JsonTokenData | undefined
) =>
  left !== undefined &&
  right !== undefined &&
  (left.kind === 'open' &&
  left.nodeKind === 'element' &&
  right.kind === 'open' &&
  right.nodeKind === 'element'
    ? alike(left.props, right.props)
    : tokensEqual(left, right));

export const tokensAlike = (
  left: readonly JsonTokenData[],
  right: readonly JsonTokenData[]
) =>
  left.length === right.length &&
  left.every((token, index) => tokenAlike(token, right[index]));

export const containsTokenRun = (
  haystack: readonly JsonTokenData[],
  needle: readonly JsonTokenData[]
) => {
  if (needle.length === 0) return true;
  if (needle.length > haystack.length) return false;

  for (let start = 0; start <= haystack.length - needle.length; start++) {
    if (
      needle.every((token, offset) =>
        tokenAlike(haystack[start + offset], token)
      )
    ) {
      return true;
    }
  }

  return false;
};

export const remapAlikeElementIds = (
  from: JsonNode,
  to: JsonNode,
  nodes: readonly JsonNode[]
): readonly JsonNode[] => {
  const map = new Map<string, string>();
  const pair = (left: JsonNode, right: JsonNode) => {
    const leftId = storedElementIdOf(left);
    const rightId = storedElementIdOf(right);

    if (leftId !== undefined && rightId !== undefined && leftId !== rightId) {
      map.set(leftId, rightId);
    }
    if (isElementNode(left) && isElementNode(right)) {
      left.children.forEach((child, index) => {
        const other = right.children[index];

        if (other) pair(child, other);
      });
    }
  };

  pair(from, to);
  if (map.size === 0) return nodes;

  const rewrite = (node: JsonNode): JsonNode => {
    if (!isElementNode(node)) return node;

    const id = storedElementIdOf(node);
    const nextId = id !== undefined ? map.get(id) : undefined;
    const children = node.children.map(rewrite);
    const childChanged = children.some(
      (child, index) => child !== node.children[index]
    );

    if (nextId === undefined && !childChanged) return node;

    return {
      ...node,
      ...(nextId !== undefined ? { id: nextId } : {}),
      children,
    };
  };

  return nodes.map(rewrite);
};

const isIdOnlyPropertyDelta = (
  data: PreparedTokenSlice | readonly PropertyModification[] | null | undefined
) =>
  Array.isArray(data) &&
  data.length === 1 &&
  data[0]?.key === 'id' &&
  data[0].type === 'set' &&
  typeof data[0].value === 'string';

export const changeEditedRanges = (
  change: Readonly<{
    data: ReadonlyArray<
      PreparedTokenSlice | readonly PropertyModification[] | null
    >;
    sections: readonly number[];
  }>,
  side: 'from' | 'to',
  ignoreIdOnly = false
): Array<readonly [number, number]> => {
  const ranges: Array<readonly [number, number]> = [];
  let position = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = change.sections[index];
    const inserted = change.sections[index + 1];
    const size = side === 'to' && inserted >= 0 ? inserted : length;

    if (
      inserted !== -1 &&
      !(
        ignoreIdOnly &&
        inserted === -2 &&
        isIdOnlyPropertyDelta(change.data[index >> 1])
      )
    ) {
      ranges.push([position, position + size]);
    }
    position += size;
  }

  return ranges;
};
