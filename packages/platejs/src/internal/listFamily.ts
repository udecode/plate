import {
  ElementApi,
  PathApi,
  type EditorCoreStateView,
  type Element,
  type NodeEntry,
  type Path,
  type NamedRootKey,
} from '../core';

export const LIST_TYPES = ['bulleted', 'numbered', 'task'] as const;

export const isListType = (
  value: unknown
): value is (typeof LIST_TYPES)[number] =>
  LIST_TYPES.some((type) => type === value);

export const isListItem = (node: Element) => isListType(node.listType);

export const getListIndent = (node: Element) =>
  typeof node.indent === 'number' ? node.indent : 1;

export const LIST_FIELDS = [
  'checked',
  'listId',
  'listLevels',
  'listRestart',
  'listStart',
  'listStyle',
  'listType',
] as const;

export const getListFamilies = (
  state: Pick<EditorCoreStateView, 'nodes'>,
  entries: ReadonlyArray<NodeEntry<Element>>,
  root?: NamedRootKey
) => {
  const families: Array<Array<NodeEntry<Element>>> = [];
  const processedPaths = new Set<string>();
  const inRoot = (path: Path) =>
    root === undefined ? path : { path, offset: 0, root };

  [...entries]
    .sort(([, left], [, right]) => PathApi.compare(left, right))
    .forEach(([, path]) => {
      const liveEntry = state.nodes.get(inRoot(path), {
        match: ElementApi.isElement,
      });

      if (!liveEntry) return;
      const [node] = liveEntry;
      const key = path.join('.');

      if (processedPaths.has(key)) return;
      const family = [liveEntry];
      families.push(family);
      processedPaths.add(key);
      const parentIndent = getListIndent(node);

      if (!isListItem(node)) return;
      let currentPath = path;

      while (true) {
        const nextPath = PathApi.next(currentPath);
        const nextNode = state.nodes.get(inRoot(nextPath), {
          match: ElementApi.isElement,
        })?.[0];

        if (!nextNode) break;
        const nextIndent = getListIndent(nextNode);

        if (nextIndent <= parentIndent) {
          break;
        }
        const childKey = nextPath.join('.');

        if (!processedPaths.has(childKey)) {
          family.push([nextNode, nextPath]);
          processedPaths.add(childKey);
        }
        currentPath = nextPath;
      }
    });

  return families;
};
