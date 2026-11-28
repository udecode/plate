import { getDefined } from '../../internal/get-defined';
import * as storedIds from '../stored-element-id';
import type { DocumentIndex } from './document-index';
import type { RootChange } from './root-change';
import {
  isElementNode,
  isTextNode,
  type JsonNode,
  type JsonToken,
  type PreparedTokenSlice,
  PreparedTokenSliceStructureError,
} from './tokens';

export type CanContain = (parent: JsonNode, child: JsonNode) => boolean;

const depthChange = (token: JsonToken) =>
  token.kind === 'open' ? 1 : token.kind === 'close' ? -1 : 0;

const validTextContainmentNode = (
  node: JsonNode,
  canContain: CanContain
): boolean => {
  if (!isElementNode(node)) return true;

  for (const child of node.children) {
    if (isTextNode(child)) {
      if (!canContain(node, child)) return false;
      continue;
    }
    if (!validTextContainmentNode(child, canContain)) {
      return false;
    }
  }

  return true;
};

export const hasValidTextContainment = (
  merged: DocumentIndex,
  base: DocumentIndex,
  canContain: CanContain
): boolean => {
  for (const [from, to] of merged.changedChildren(base)) {
    for (let index = from; index < to; index += 1) {
      if (
        !validTextContainmentNode(getDefined(merged.child(index)), canContain)
      ) {
        return false;
      }
    }
  }

  return true;
};

export const checkRelocatedContainment = (
  afterStructural: DocumentIndex,
  targetPath: readonly number[],
  edited: readonly JsonNode[],
  candidateNode: JsonNode,
  equal: (left: unknown, right: unknown) => boolean,
  canContain: CanContain
): 'allow' | 'noop' | 'skip' => {
  if (targetPath.length <= 1) return 'allow';

  const targetParent = afterStructural.node(targetPath.slice(0, -1));

  if (
    !isElementNode(targetParent) ||
    !edited.some((node) => !canContain(targetParent, node))
  ) {
    return 'allow';
  }

  const [soleEdited] = edited;

  if (
    edited.length === 1 &&
    isElementNode(soleEdited) &&
    soleEdited.type === targetParent.type &&
    soleEdited.children.length === 1 &&
    equal(soleEdited.children[0], candidateNode)
  ) {
    return 'noop';
  }

  return 'skip';
};

export const canPlaceWrapperAtBoundary = (
  afterEdit: DocumentIndex,
  target: number,
  wrapperNode: JsonNode,
  canContain: CanContain
): boolean => {
  const targetBoundary = afterEdit.childBoundaryAt(target);

  if (!targetBoundary || targetBoundary.parentPath.length === 0) return true;

  return canContain(afterEdit.node(targetBoundary.parentPath), wrapperNode);
};

export const keepsTokenBalance = (
  document: DocumentIndex,
  replacements: ReadonlyArray<
    Readonly<{ from: number; insert: PreparedTokenSlice; to: number }>
  >
): boolean =>
  replacements.every(({ from, insert, to }) => {
    let delta = 0;

    for (const token of document.slice(from, to).tokens) {
      delta += depthChange(token);
    }
    for (const token of insert.tokens) {
      delta -= depthChange(token);
    }

    return delta === 0;
  });

export const spliceRelocated = (
  afterStructural: DocumentIndex,
  targetPath: readonly number[],
  targetIndex: number,
  edited: readonly JsonNode[],
  candidateNode: JsonNode,
  targetNode: JsonNode,
  equal: (left: unknown, right: unknown) => boolean,
  canContain?: CanContain
): DocumentIndex | null => {
  if (canContain) {
    const placement = checkRelocatedContainment(
      afterStructural,
      targetPath,
      edited,
      candidateNode,
      equal,
      canContain
    );

    if (placement === 'skip') return null;
    if (placement === 'noop') return afterStructural;
  }

  return afterStructural.withSplicedNodes(
    targetPath.slice(0, -1),
    targetIndex,
    1,
    equal === storedIds.alike
      ? storedIds.remapAlikeElementIds(candidateNode, targetNode, edited)
      : edited
  );
};

export const tryApply = (
  change: RootChange,
  document: DocumentIndex
): DocumentIndex | null => {
  try {
    return change.apply(document);
  } catch {
    return null;
  }
};

export const applyIfBalanced = (
  change: RootChange,
  document: DocumentIndex
): DocumentIndex | null => {
  try {
    return change.apply(document);
  } catch (error) {
    if (error instanceof PreparedTokenSliceStructureError) return null;
    throw error;
  }
};
