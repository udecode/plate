import type {
  AnyEditor,
  EditorRootEntry,
  NodeKey,
  RootKey,
} from '../interfaces/editor';
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
import {
  getCompiledEditorSchema,
  getPluginContributions,
} from './plugin-registry';
import { MAIN_ROOT_KEY } from './public-root';
import {
  getActiveEditorTransaction,
  getEditorDocumentRoots,
  getEditorReadDepth,
  getEditorStateView,
  getReadProjection,
  resolveLocationRoot,
  withEditorRootChildren,
  withEditorViewRead,
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

const SCHEMA_HAS_READ_ONLY_ELEMENT = new WeakMap<object, boolean>();
const ROOT_ENTRIES_BY_ROOT = new WeakMap<
  readonly EditorRootEntry[],
  ReadonlyMap<RootKey, EditorRootEntry>
>();

const schemaHasReadOnlyElement = (editor: AnyEditor): boolean => {
  const schema = getCompiledEditorSchema(getEditorRuntimeOwner(editor));

  if (!schema) return false;

  const cached = SCHEMA_HAS_READ_ONLY_ELEMENT.get(schema);

  if (cached !== undefined) return cached;

  let found = false;

  for (const element of schema.elements.byType.values()) {
    if (element.behavior.readOnly) {
      found = true;
      break;
    }
  }

  SCHEMA_HAS_READ_ONLY_ELEMENT.set(schema, found);

  return found;
};

const getRootEntriesByRoot = (
  entries: readonly EditorRootEntry[]
): ReadonlyMap<RootKey, EditorRootEntry> => {
  const cached = ROOT_ENTRIES_BY_ROOT.get(entries);

  if (cached) return cached;

  const byRoot = new Map(entries.map((entry) => [entry.root, entry]));

  ROOT_ENTRIES_BY_ROOT.set(entries, byRoot);

  return byRoot;
};

/** @internal */
export const hasNonWritableContributors = (editor: AnyEditor): boolean =>
  getPluginContributions(editor, nonWritableContent).length > 0 ||
  getPluginContributions(editor, nonWritableRoot).length > 0;

/** @internal */
export const isElementNonWritable = (
  editor: AnyEditor,
  element: Element,
  {
    includeContributors = true,
    includeReadOnly = true,
  }: Readonly<{
    includeContributors?: boolean;
    includeReadOnly?: boolean;
  }> = {}
): boolean => {
  if (includeReadOnly && getEditorSchema(editor).isReadOnly(element)) {
    return true;
  }

  if (!includeContributors) return false;

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
  includeReadOnly: boolean,
  includeContributors = true
): boolean => {
  if (path.length === 0) return false;

  let node: unknown = rootNodesOf(roots, root).at(path[0]);

  if (!ElementApi.isElement(node)) return false;
  if (
    isElementNonWritable(editor, node, { includeContributors, includeReadOnly })
  ) {
    return true;
  }

  for (let index = 1; index < path.length; index += 1) {
    node = node.children[path[index]];
    if (!ElementApi.isElement(node)) return false;
    if (
      isElementNonWritable(editor, node, {
        includeContributors,
        includeReadOnly,
      })
    ) {
      return true;
    }
  }

  return false;
};

const hasNonWritableOwnerRoot = (
  editor: AnyEditor,
  roots: DocumentRoots,
  root: RootKey,
  includeReadOnly: boolean,
  includeContributors = true
): boolean => {
  if (root === MAIN_ROOT_KEY) return false;

  const rootPredicates = includeContributors
    ? getPluginContributions(editor, nonWritableRoot)
    : [];
  const contentPredicates = includeContributors
    ? getPluginContributions(editor, nonWritableContent)
    : [];
  const inTransactionOrProjection =
    getActiveEditorTransaction(editor) != null ||
    getReadProjection(editor) != null;

  if (
    rootPredicates.length > 0 &&
    !inTransactionOrProjection &&
    rootPredicates.some((predicate) => predicate(root, editor))
  ) {
    return true;
  }

  const checkReadOnlyInWalk =
    includeReadOnly && schemaHasReadOnlyElement(editor);
  const checkContributorsInWalk =
    includeContributors &&
    contentPredicates.length > 0 &&
    (inTransactionOrProjection ||
      rootPredicates.length === 0 ||
      contentPredicates.length > rootPredicates.length);

  if (!checkReadOnlyInWalk && !checkContributorsInWalk) {
    return false;
  }

  const byRoot = getRootEntriesByRoot(readRootEntries(editor));
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
          checkReadOnlyInWalk,
          checkContributorsInWalk
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
export const hasReadOnlyOwnerRoot = (
  editor: AnyEditor,
  root: RootKey
): boolean => {
  if (root === MAIN_ROOT_KEY || !schemaHasReadOnlyElement(editor)) {
    return false;
  }

  return hasNonWritableOwnerRoot(
    editor,
    getEditorDocumentRoots(editor),
    root,
    true,
    false
  );
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
  {
    includeReadOnly = true,
    root,
  }: Readonly<{ includeReadOnly?: boolean; root?: RootKey }> = {}
): boolean => {
  if (at == null) return false;
  if (!includeReadOnly && !hasNonWritableContributors(editor)) return false;

  const evaluate = (state: Pick<AnyEditor['read'], 'nodes'>): boolean => {
    const roots = getEditorDocumentRoots(editor);
    const defaultRoot = root ?? resolveLocationRoot(editor, at);

    if (RangeApi.isRange(at)) {
      const anchorRoot = at.anchor.root ?? defaultRoot;
      const focusRoot = at.focus.root ?? defaultRoot;

      if (
        hasNonWritableOwnerRoot(editor, roots, anchorRoot, includeReadOnly) ||
        (focusRoot !== anchorRoot &&
          hasNonWritableOwnerRoot(editor, roots, focusRoot, includeReadOnly)) ||
        hasNonWritableElementInAncestors(
          editor,
          roots,
          at.anchor.path,
          anchorRoot,
          includeReadOnly
        ) ||
        hasNonWritableElementInAncestors(
          editor,
          roots,
          at.focus.path,
          focusRoot,
          includeReadOnly
        )
      ) {
        return true;
      }

      if (
        anchorRoot === focusRoot &&
        RangeApi.isExpanded(at) &&
        hasNonWritableContributors(editor)
      ) {
        const scan = () =>
          state.nodes.some({
            at,
            match: (node) =>
              NodeApi.isElement(node) &&
              isElementNonWritable(editor, node, { includeReadOnly: false }),
            voids: true,
          });

        return withEditorRootChildren(editor, anchorRoot, scan);
      }

      return false;
    }

    if (hasNonWritableOwnerRoot(editor, roots, defaultRoot, includeReadOnly)) {
      return true;
    }

    if (typeof at === 'string') {
      const entry = state.nodes.get(at);

      if (!entry) return false;

      return hasNonWritableElementInAncestors(
        editor,
        roots,
        entry[1],
        defaultRoot,
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
            defaultRoot,
            includeReadOnly
          )
        ) {
          return true;
        }

        if (checkContributors) {
          const node = getNodeInRoot(roots, defaultRoot, path);

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
        defaultRoot,
        includeReadOnly
      );
    }

    if (PointApi.isPoint(at)) {
      return hasNonWritableElementInAncestors(
        editor,
        roots,
        at.path,
        defaultRoot,
        includeReadOnly
      );
    }

    return false;
  };

  const activeTransaction = getActiveEditorTransaction(editor);

  if (activeTransaction) {
    return evaluate(activeTransaction);
  }

  const owner = getEditorRuntimeOwner(editor);

  if (getReadProjection(owner) || getEditorReadDepth(owner) > 0) {
    return withEditorViewRead(editor, () =>
      evaluate(getEditorStateView(editor))
    );
  }

  return editor.read((state) =>
    withEditorViewRead(editor, () => evaluate(state))
  );
};
