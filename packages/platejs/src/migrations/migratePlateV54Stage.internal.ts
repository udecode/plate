import {
  type Descendant,
  type EditorDocumentValue,
  ElementApi,
  MAIN_ROOT_KEY,
  type Path,
  PathApi,
  type Point,
  type Range,
  RangeApi,
  type Selection,
  SelectionApi,
  TextApi,
  type Value,
} from '../facade';

export type PointEdge = 'caret' | 'end' | 'start';

export type ReplacementPoint = Readonly<{ offset: number; path: Path }>;

export type PlateV54StageResult = Readonly<{
  document: EditorDocumentValue;
  mapRange?: (range: Range) => Range | null;
  mapSelection?: (selection: Selection) => Selection;
}>;

export const pathKey = (root: string, path: readonly number[]) =>
  `${root}:${path.join('.')}`;

export const edgeTextPoint = (
  children: readonly Descendant[],
  parentPath: Path,
  edge: 'first' | 'last'
): ReplacementPoint => {
  const path = [...parentPath];
  let current = children;

  while (current.length > 0) {
    const index = edge === 'first' ? 0 : current.length - 1;
    const node = current[index];

    path.push(index);
    if (TextApi.isText(node)) {
      return { offset: edge === 'first' ? 0 : node.text.length, path };
    }
    if (!ElementApi.isElement(node)) break;
    current = node.children;
  }

  return { offset: 0, path };
};

const findEdgeTextInNode = (
  node: Descendant | undefined,
  path: Path,
  edge: 'first' | 'last'
): ReplacementPoint | null => {
  if (!node) return null;
  if (TextApi.isText(node)) {
    return { offset: edge === 'first' ? 0 : node.text.length, path };
  }
  if (!ElementApi.isElement(node)) return null;

  const { children } = node;
  if (edge === 'first') {
    for (let index = 0; index < children.length; index += 1) {
      const found = findEdgeTextInNode(
        children[index],
        [...path, index],
        'first'
      );

      if (found) return found;
    }
  } else {
    for (let index = children.length - 1; index >= 0; index -= 1) {
      const found = findEdgeTextInNode(
        children[index],
        [...path, index],
        'last'
      );

      if (found) return found;
    }
  }

  return null;
};

const childrenAtPath = (
  rootChildren: readonly Descendant[],
  parentPath: readonly number[]
): readonly Descendant[] => {
  let current = rootChildren;

  for (const index of parentPath) {
    const node = current[index];

    if (!node || !ElementApi.isElement(node)) return [];
    current = node.children;
  }

  return current;
};

export const adjacentTextPoint = (
  rootChildren: readonly Descendant[],
  parentPath: readonly number[],
  index: number,
  direction: 'backward' | 'forward'
): ReplacementPoint | null => {
  let currentParent = parentPath;
  let currentIndex = index;

  for (;;) {
    const siblings = childrenAtPath(rootChildren, currentParent);

    if (direction === 'backward') {
      for (let sibling = currentIndex - 1; sibling >= 0; sibling -= 1) {
        const found = findEdgeTextInNode(
          siblings[sibling],
          [...currentParent, sibling],
          'last'
        );

        if (found) return found;
      }
    } else {
      for (
        let sibling = currentIndex;
        sibling < siblings.length;
        sibling += 1
      ) {
        const found = findEdgeTextInNode(
          siblings[sibling],
          [...currentParent, sibling],
          'first'
        );

        if (found) return found;
      }
    }

    const parentIndex = currentParent.at(-1);

    if (parentIndex === undefined) return null;

    currentParent = currentParent.slice(0, -1);
    currentIndex = direction === 'backward' ? parentIndex : parentIndex + 1;
  }
};

export const mapDocumentRoots = (
  document: EditorDocumentValue,
  migrateRoot: (children: Value, root: string) => Value
): EditorDocumentValue => {
  const children = migrateRoot(document.children, MAIN_ROOT_KEY);
  let { roots } = document;

  if (roots) {
    let changed = false;
    const next = Object.fromEntries(
      Object.entries(roots).map(([root, rootChildren]) => {
        const migrated = migrateRoot(rootChildren, root);

        if (migrated !== rootChildren) changed = true;

        return [root, migrated];
      })
    );

    if (changed) roots = next;
  }

  return children === document.children && roots === document.roots
    ? document
    : { ...document, children, ...(roots ? { roots } : {}) };
};

export const createRangeMapper =
  (mapPoint: (point: Point, edge: PointEdge) => Point | null) =>
  (range: Range): Range | null => {
    const backward = RangeApi.isBackward(range);
    const anchor = mapPoint(range.anchor, backward ? 'end' : 'start');
    const focus = mapPoint(range.focus, backward ? 'start' : 'end');

    return anchor && focus ? { anchor, focus } : null;
  };

export const mapNodeSelectionPaths = (
  selection: Extract<Selection, { kind: 'node' }>,
  resolvePath: (root: string, path: Path) => Path | null
): Selection => {
  const selectionRoot = SelectionApi.root(selection);
  const root = selectionRoot ?? MAIN_ROOT_KEY;
  const mappedEntries = selection.paths.map((source) => ({
    mapped: resolvePath(root, source),
    source,
  }));
  const paths = mappedEntries.flatMap(({ mapped }) =>
    mapped ? [[...mapped]] : []
  );
  const first = paths[0];

  if (!first) return null;

  const rootOptions =
    selectionRoot === undefined ? ({} as const) : { root: selectionRoot };
  const canonical = SelectionApi.nodes([first, ...paths.slice(1)], {
    mode: 'block',
    ...rootOptions,
  });
  const backward =
    PathApi.compare(selection.anchorPath, selection.focusPath) > 0;
  const firstPath = canonical.paths[0];
  const lastPath = canonical.paths.at(-1) ?? firstPath;
  const resolveEndpoint = (source: Path, fallback: Path) => {
    const mapped = mappedEntries.find(({ source: candidate }) =>
      PathApi.equals(candidate, source)
    )?.mapped;

    if (!mapped) return fallback;

    return (
      canonical.paths.find(
        (path) =>
          PathApi.equals(path, mapped) || PathApi.isAncestor(path, mapped)
      ) ?? fallback
    );
  };

  return SelectionApi.nodes(canonical.paths, {
    anchorPath: resolveEndpoint(
      selection.anchorPath,
      backward ? lastPath : firstPath
    ),
    focusPath: resolveEndpoint(
      selection.focusPath,
      backward ? firstPath : lastPath
    ),
    mode: selection.mode,
    ...rootOptions,
  });
};
