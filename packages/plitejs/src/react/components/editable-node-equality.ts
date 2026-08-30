import type { Descendant, Path, NodeKey, Text as PliteTextNode } from '../..';

const isText = (value: Descendant): value is PliteTextNode =>
  typeof (value as PliteTextNode).text === 'string';

const samePath = (left: Path | null, right: Path | null) => {
  if (left === right) return true;
  if (!left || !right || left.length !== right.length) return false;

  return left.every((segment, index) => segment === right[index]);
};

const sameDescendant = (
  left: Descendant | null,
  right: Descendant | null
): boolean => {
  if (left === right) return true;
  if (!left || !right) return left === right;

  if (isText(left) || isText(right)) {
    if (!isText(left) || !isText(right)) return false;

    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);

    return (
      leftKeys.length === rightKeys.length &&
      leftKeys.every((key) =>
        Object.is(
          (left as unknown as Record<string, unknown>)[key],
          (right as unknown as Record<string, unknown>)[key]
        )
      )
    );
  }

  const leftKeys = Object.keys(left).filter((key) => key !== 'children');
  const rightKeys = Object.keys(right).filter((key) => key !== 'children');

  return (
    leftKeys.length === rightKeys.length &&
    left.children.length === right.children.length &&
    leftKeys.every((key) =>
      Object.is(
        (left as unknown as Record<string, unknown>)[key],
        (right as unknown as Record<string, unknown>)[key]
      )
    )
  );
};

export const sameNodeKeys = (
  left: readonly NodeKey[],
  right: readonly NodeKey[]
) =>
  left.length === right.length &&
  left.every((nodeKey, index) => nodeKey === right[index]);

const sameDirectTextChildNodes = (
  left: ReadonlyArray<PliteTextNode | null>,
  right: ReadonlyArray<PliteTextNode | null>
) =>
  left.length === right.length &&
  left.every((node, index) => node === right[index]);

export const sameDescendantBinding = (
  left: {
    childNodeKeys: readonly NodeKey[];
    directTextChildNodes: ReadonlyArray<PliteTextNode | null>;
    emptyTextParentRenderKey: string | null;
    isInline: boolean;
    isVoid: boolean;
    node: Descendant | null;
    path: Path | null;
    renderRevision: number;
  } | null,
  right: {
    childNodeKeys: readonly NodeKey[];
    directTextChildNodes: ReadonlyArray<PliteTextNode | null>;
    emptyTextParentRenderKey: string | null;
    isInline: boolean;
    isVoid: boolean;
    node: Descendant | null;
    path: Path | null;
    renderRevision: number;
  }
) =>
  left != null &&
  left.renderRevision === right.renderRevision &&
  left.emptyTextParentRenderKey === right.emptyTextParentRenderKey &&
  left.isInline === right.isInline &&
  left.isVoid === right.isVoid &&
  samePath(left.path, right.path) &&
  sameDescendant(left.node, right.node) &&
  sameNodeKeys(left.childNodeKeys, right.childNodeKeys) &&
  sameDirectTextChildNodes(
    left.directTextChildNodes,
    right.directTextChildNodes
  );
