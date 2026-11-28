import type { AnyEditor, NodeKey, RootKey } from '../interfaces/editor';
import { ElementApi, type Element } from '../interfaces/element';
import type { Location } from '../interfaces/location';
import { type Descendant, NodeApi } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { PointApi } from '../interfaces/point';
import { RangeApi } from '../interfaces/range';
import { type NodeSelection, SelectionApi } from '../interfaces/selection';
import { rootNodesOf } from './change/document-index';
import { getEditorRuntimeOwner, getEditorSchema } from './editor-runtime';
import { definePluginPoint } from './plugin-point';
import { getPluginContributions } from './plugin-registry';
import { MAIN_ROOT_KEY } from './public-root';
import {
  getActiveEditorTransaction,
  getEditorDocumentRoots,
  getReadProjection,
  resolveLocationRoot,
} from './public-state';
import { readRootEntries } from './root-entries';

export type NonWritableContentPredicate = (
  element: Element,
  editor: AnyEditor
) => boolean;

export type NonWritableRootPredicate = (
  root: RootKey,
  editor: AnyEditor
) => boolean;

/**
 * Contribute a per-element predicate marking content non-writable for native
 * input, IME, Android, CodeMirror, combobox, and upload admission without
 * turning the element into a void-like `schema.isReadOnly` atom.
 *
 * @internal
 */
export const nonWritableContent =
  definePluginPoint<NonWritableContentPredicate>('content.non-writable');

/**
 * Optional O(1) predicate indicating whether an entire named root is currently
 * non-writable (for example via an incrementally maintained owner-lock index).
 *
 * @internal
 */
export const nonWritableRoot =
  definePluginPoint<NonWritableRootPredicate>('root.non-writable');

/** @internal */
export const hasNonWritableContributors = (editor: AnyEditor): boolean =>
  getPluginContributions(editor, nonWritableContent).length > 0 ||
  getPluginContributions(editor, nonWritableRoot).length > 0;

/** @internal */
export const isElementNonWritable = (
  editor: AnyEditor,
  element: Element,
  { includeReadOnly = true }: Readonly<{ includeReadOnly?: boolean }> = {}
): boolean => {
  if (includeReadOnly && getEditorSchema(editor).isReadOnly(element)) {
    return true;
  }

  const predicates = getPluginContributions(editor, nonWritableContent);

  if (predicates.length === 0) return false;

  return predicates.some((predicate) => predicate(element, editor));
};

type DocumentRoots = Readonly<Record<string, readonly Descendant[]>>;

const hasNonWritableElementInAncestors = (
  editor: AnyEditor,
  roots: DocumentRoots,
  path: Path,
  root: RootKey,
  includeReadOnly: boolean
): boolean => {
  if (path.length === 0) return false;

  let node: unknown = rootNodesOf(roots, root).at(path[0]);

  if (!ElementApi.isElement(node)) return false;
  if (isElementNonWritable(editor, node, { includeReadOnly })) return true;

  for (let index = 1; index < path.length; index += 1) {
    node = node.children[path[index]];
    if (!ElementApi.isElement(node)) return false;
    if (isElementNonWritable(editor, node, { includeReadOnly })) return true;
  }

  return false;
};

const hasNonWritableOwnerRoot = (
  editor: AnyEditor,
  roots: DocumentRoots,
  root: RootKey,
  includeReadOnly: boolean
): boolean => {
  if (root === MAIN_ROOT_KEY) return false;

  const rootPredicates = getPluginContributions(editor, nonWritableRoot);

  if (rootPredicates.length > 0) {
    return rootPredicates.some((predicate) => predicate(root, editor));
  }

  const entries = readRootEntries(editor);
  const byRoot = new Map(entries.map((entry) => [entry.root, entry]));
  const visited = new Set<RootKey>();
  const stack: RootKey[] = [root];

  while (stack.length > 0) {
    const current = stack.pop();

    if (current === undefined || visited.has(current)) continue;
    visited.add(current);

    const entry = byRoot.get(current);

    if (!entry) continue;

    for (const owner of entry.owners) {
      const ownerRoot = owner.root ?? MAIN_ROOT_KEY;

      if (
        hasNonWritableElementInAncestors(
          editor,
          roots,
          owner.path,
          ownerRoot,
          includeReadOnly
        )
      ) {
        return true;
      }
      if (ownerRoot !== MAIN_ROOT_KEY && !visited.has(ownerRoot)) {
        stack.push(ownerRoot);
      }
    }
  }

  return false;
};

/** @internal */
export const hasNonWritableDescendant = (
  editor: AnyEditor,
  node: Element,
  includeReadOnly: boolean
): boolean => {
  if (isElementNonWritable(editor, node, { includeReadOnly })) return true;

  for (const child of node.children) {
    if (
      ElementApi.isElement(child) &&
      hasNonWritableDescendant(editor, child, includeReadOnly)
    ) {
      return true;
    }
  }

  return false;
};

const getNodeInRoot = (
  roots: DocumentRoots,
  root: RootKey,
  path: Path
): Element | undefined => {
  if (path.length === 0) return undefined;

  let current: unknown = rootNodesOf(roots, root).at(path[0]);

  if (!ElementApi.isElement(current)) return undefined;

  for (let index = 1; index < path.length; index += 1) {
    current = current.children[path[index]];
    if (!ElementApi.isElement(current)) return undefined;
  }

  return current;
};

/**
 * Return `true` when `at` (a `Location`, `NodeSelection`, or `NodeKey`) lies
 * inside or spans any non-writable element or non-writable owned root.
 *
 * @internal
 */
export const hasNonWritableAt = (
  editor: AnyEditor,
  at: Location | NodeSelection | NodeKey | null | undefined,
  { includeReadOnly = true }: Readonly<{ includeReadOnly?: boolean }> = {}
): boolean => {
  if (at == null) return false;
  if (!includeReadOnly && !hasNonWritableContributors(editor)) return false;

  const owner = getEditorRuntimeOwner(editor);
  const state = getActiveEditorTransaction(editor) ?? editor.read;
  const roots = getReadProjection(editor)
    ? getEditorDocumentRoots(editor)
    : getEditorDocumentRoots(owner);
  const targetRoot = resolveLocationRoot(editor, at);

  if (hasNonWritableOwnerRoot(editor, roots, targetRoot, includeReadOnly)) {
    return true;
  }

  if (typeof at === 'string') {
    const entry = state.nodes.get(at);

    if (!entry) return false;

    return hasNonWritableElementInAncestors(
      editor,
      roots,
      entry[1],
      targetRoot,
      includeReadOnly
    );
  }

  if (SelectionApi.isNode(at)) {
    const checkContributors = hasNonWritableContributors(editor);

    for (const path of at.paths) {
      if (
        hasNonWritableElementInAncestors(
          editor,
          roots,
          path,
          targetRoot,
          includeReadOnly
        )
      ) {
        return true;
      }

      if (checkContributors) {
        const node = getNodeInRoot(roots, targetRoot, path);

        if (node && hasNonWritableDescendant(editor, node, false)) {
          return true;
        }
      }
    }

    return false;
  }

  if (PathApi.isPath(at)) {
    return hasNonWritableElementInAncestors(
      editor,
      roots,
      at,
      targetRoot,
      includeReadOnly
    );
  }

  if (PointApi.isPoint(at)) {
    return hasNonWritableElementInAncestors(
      editor,
      roots,
      at.path,
      targetRoot,
      includeReadOnly
    );
  }

  if (RangeApi.isRange(at)) {
    if (
      hasNonWritableElementInAncestors(
        editor,
        roots,
        at.anchor.path,
        targetRoot,
        includeReadOnly
      ) ||
      hasNonWritableElementInAncestors(
        editor,
        roots,
        at.focus.path,
        targetRoot,
        includeReadOnly
      )
    ) {
      return true;
    }

    if (RangeApi.isExpanded(at) && hasNonWritableContributors(editor)) {
      return state.nodes.some({
        at,
        match: (node) =>
          NodeApi.isElement(node) &&
          isElementNonWritable(editor, node, { includeReadOnly: false }),
        voids: true,
      });
    }

    return false;
  }

  return false;
};
