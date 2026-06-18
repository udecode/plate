import type {
  Descendant,
  Path,
  RuntimeId,
  Text as SlateTextNode,
} from '@platejs/slate';

const isText = (value: Descendant): value is SlateTextNode =>
  typeof (value as SlateTextNode).text === 'string';

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

export const sameRuntimeIds = (
  left: readonly RuntimeId[],
  right: readonly RuntimeId[]
) =>
  left.length === right.length &&
  left.every((runtimeId, index) => runtimeId === right[index]);

const sameDirectTextChildNodes = (
  left: readonly (SlateTextNode | null)[],
  right: readonly (SlateTextNode | null)[]
) =>
  left.length === right.length &&
  left.every((node, index) => node === right[index]);

export const sameDescendantBinding = (
  left: {
    childRuntimeIds: readonly RuntimeId[];
    directTextChildNodes: readonly (SlateTextNode | null)[];
    node: Descendant | null;
    path: Path | null;
  } | null,
  right: {
    childRuntimeIds: readonly RuntimeId[];
    directTextChildNodes: readonly (SlateTextNode | null)[];
    node: Descendant | null;
    path: Path | null;
  }
) =>
  left != null &&
  samePath(left.path, right.path) &&
  sameDescendant(left.node, right.node) &&
  sameRuntimeIds(left.childRuntimeIds, right.childRuntimeIds) &&
  sameDirectTextChildNodes(
    left.directTextChildNodes,
    right.directTextChildNodes
  );
