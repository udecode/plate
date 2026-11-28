import type { AnyEditor, NodeKey, RootKey } from '../interfaces/editor';
import { ElementApi, type Element } from '../interfaces/element';
import type { Location } from '../interfaces/location';
import { NodeApi } from '../interfaces/node';
import { type Path, PathApi } from '../interfaces/path';
import { PointApi } from '../interfaces/point';
import { RangeApi } from '../interfaces/range';
import { type NodeSelection, SelectionApi } from '../interfaces/selection';
import { getEditorSchema } from './editor-runtime';
import { definePluginPoint } from './plugin-point';
import { getPluginContributions } from './plugin-registry';
import { MAIN_ROOT_KEY } from './public-root';
import { resolveLocationRoot } from './public-state';
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

const hasNonWritableElementInAncestors = (
  editor: AnyEditor,
  path: Path,
  root: RootKey,
  includeReadOnly: boolean
): boolean => {
  const children =
    root === MAIN_ROOT_KEY
      ? editor.read.value().children
      : (editor.read.value().roots?.[root] ?? []);
  let current = children;

  for (const index of path) {
    const node = current[index];

    if (!ElementApi.isElement(node)) return false;
    if (isElementNonWritable(editor, node, { includeReadOnly })) return true;
    current = node.children;
  }

  return false;
};

const hasNonWritableOwnerRoot = (
  editor: AnyEditor,
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
  editor: AnyEditor,
  root: RootKey,
  path: Path
): Element | undefined => {
  let siblings =
    root === MAIN_ROOT_KEY
      ? editor.read.value().children
      : (editor.read.value().roots?.[root] ?? []);
  let current: unknown;

  for (const index of path) {
    current = siblings[index];
    if (!ElementApi.isElement(current)) return undefined;
    siblings = current.children;
  }

  return ElementApi.isElement(current) ? current : undefined;
};

const checkPathAndAncestors = (
  editor: AnyEditor,
  path: Path,
  root: RootKey,
  includeReadOnly: boolean
): boolean =>
  hasNonWritableOwnerRoot(editor, root, includeReadOnly) ||
  hasNonWritableElementInAncestors(editor, path, root, includeReadOnly);

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

  const targetRoot = resolveLocationRoot(editor, at);

  if (hasNonWritableOwnerRoot(editor, targetRoot, includeReadOnly)) return true;

  if (typeof at === 'string') {
    const entry = editor.read.nodes.get(at);

    if (!entry) return false;

    return checkPathAndAncestors(editor, entry[1], targetRoot, includeReadOnly);
  }

  if (SelectionApi.isNode(at)) {
    const checkContributors = hasNonWritableContributors(editor);

    for (const path of at.paths) {
      if (checkPathAndAncestors(editor, path, targetRoot, includeReadOnly)) {
        return true;
      }

      if (checkContributors) {
        const node = getNodeInRoot(editor, targetRoot, path);

        if (node && hasNonWritableDescendant(editor, node, false)) {
          return true;
        }
      }
    }

    return false;
  }

  if (PathApi.isPath(at)) {
    return checkPathAndAncestors(editor, at, targetRoot, includeReadOnly);
  }

  if (PointApi.isPoint(at)) {
    return checkPathAndAncestors(editor, at.path, targetRoot, includeReadOnly);
  }

  if (RangeApi.isRange(at)) {
    if (
      checkPathAndAncestors(
        editor,
        at.anchor.path,
        targetRoot,
        includeReadOnly
      ) ||
      checkPathAndAncestors(editor, at.focus.path, targetRoot, includeReadOnly)
    ) {
      return true;
    }

    if (RangeApi.isExpanded(at) && hasNonWritableContributors(editor)) {
      return editor.read.nodes.some({
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
