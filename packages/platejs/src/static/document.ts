import {
  NodeApi,
  type EditorDocumentValue,
  type Node,
  type NodeEntry,
  type Path,
} from '../facade';
import type { StaticDocument } from '../lib/types/StaticDocument';

export type { StaticDocument } from '../lib/types/StaticDocument';

/** Bind pure node queries to an immutable value and the installed schema. */
export function createStaticDocument(
  value: EditorDocumentValue,
  schema: StaticDocument['schema'],
  scope: { id?: string; root?: string } = {}
): StaticDocument {
  const { id = 'plate', root } = scope;
  const children = root === undefined ? value.children : value.roots?.[root];
  if (!children) throw new Error(`Static document root "${root}" is missing.`);
  const parent = { children, type: 'static-root' };
  let paths: WeakMap<Node, Path> | undefined;
  const scopes = new Map<string, StaticDocument>();
  const nodes: StaticDocument['nodes'] = Object.freeze({
    get<T extends Node = Node>(
      path: Path,
      options?: { match?: (node: Node, path: Path) => node is T }
    ): NodeEntry<T> | undefined {
      const node = NodeApi.getIf(parent, path);
      return node && (!options?.match || options.match(node, path))
        ? [node as T, path]
        : undefined;
    },
    parent(path: Path) {
      return path.length ? nodes.get(path.slice(0, -1)) : undefined;
    },
    path(node: Node) {
      if (!paths) {
        paths = new WeakMap();
        for (const [entry, path] of nodes.entries()) paths.set(entry, path);
      }
      return paths.get(node);
    },
    *entries() {
      for (const entry of NodeApi.nodes(parent)) {
        if (entry[1].length) yield entry;
      }
    },
  });
  const document: StaticDocument = Object.freeze({
    root,
    schema,
    children: () => children,
    nodes,
    forRoot(innerRoot: string) {
      if (innerRoot === root) return document;
      let innerDocument = scopes.get(innerRoot);
      if (!innerDocument) {
        innerDocument = createStaticDocument(value, schema, {
          id,
          root: innerRoot,
        });
        scopes.set(innerRoot, innerDocument);
      }
      return innerDocument;
    },
    anchorId: (path: Path) =>
      `${id}_${root === undefined ? 'main' : 'root'}_${Array.from(root ?? '', (character) => character.codePointAt(0)?.toString(16)).join('_')}_${path.join('_')}`,
  });
  return document;
}
