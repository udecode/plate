import type {
  EditorUpdateTransaction,
  Element,
  Location,
  Node,
  NodeEntry,
  Path,
  Point,
} from '@platejs/slate';

export type ColumnEditor = {
  api: {
    block: <T extends Node = Element>(
      options?: unknown
    ) => NodeEntry<T> | undefined;
    node: <T extends Node = Node>(at?: unknown) => NodeEntry<T> | undefined;
    pathRef: (path: Path) => {
      current: Path | null;
      unref: () => Path | null;
    };
    start: (at: Location) => Point | undefined;
  };
  getType: (key: string) => string;
  update: (fn: (tx: EditorUpdateTransaction) => void) => void;
};

export const createColumnBlock = (editor: Pick<ColumnEditor, 'getType'>) => ({
  children: [{ text: '' }],
  type: editor.getType('p'),
});
