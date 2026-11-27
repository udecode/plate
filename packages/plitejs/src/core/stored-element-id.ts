import { isRecord, jsonEqual, type JsonRecord } from './change/json';
import {
  isElementNode,
  type JsonNode,
  type JsonTokenData,
} from './change/tokens';

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

export const misreadsIds = (
  merged: readonly JsonNode[],
  paired: readonly JsonNode[],
  known: readonly JsonNode[]
) => {
  const ids = storedIds(merged);
  const knownIds = new Set(storedIds(known));

  return (
    new Set(ids).size < ids.length ||
    storedIds(paired).some((id) => !knownIds.has(id))
  );
};

export const withoutStoredElementId = (
  props: Readonly<JsonRecord>
): Readonly<JsonRecord> => {
  if (typeof props.id !== 'string') return props;
  const { id: _id, ...rest } = props;

  return rest;
};

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

export const tokensAlike = (
  left: readonly JsonTokenData[],
  right: readonly JsonTokenData[]
) =>
  left.length === right.length &&
  left.every((token, index) => {
    const other = right[index];

    return token.kind === 'open' &&
      token.nodeKind === 'element' &&
      other?.kind === 'open' &&
      other.nodeKind === 'element'
      ? alike(token.props, other.props)
      : jsonEqual(token, other);
  });
