import type { Descendant, Node, NodeEntry, Path } from '../../facade';
import type { Editor } from '../editor';

/** Read-only document data for a static rendering. It has no editor runtime. */
export type StaticDocument = {
  readonly root: string | undefined;
  readonly schema: Editor['read']['schema'];
  children(): readonly Descendant[];
  forRoot(root: string): StaticDocument;
  /** Render-local anchor shared by static headings and their table of contents. */
  anchorId(path: Path): string;
  readonly nodes: {
    get<T extends Node = Node>(
      path: Path,
      options?: { match?: (node: Node, path: Path) => node is T }
    ): NodeEntry<T> | undefined;
    parent(path: Path): NodeEntry | undefined;
    path(node: Descendant): Path | undefined;
    entries(): Generator<NodeEntry>;
  };
};
