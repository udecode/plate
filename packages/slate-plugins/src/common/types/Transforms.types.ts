import { Node, Path, Point, Range } from 'slate';

export interface WrapOptions {
  at?: Path | Point | Range;
  match?: (node: Node) => boolean;
  mode?: 'highest' | 'lowest' | 'all';
  split?: boolean;
  voids?: boolean;
}

export interface InsertNodesOptions {
  at?: Path | Point | Range | undefined;
  match?: ((node: Node) => boolean) | undefined;
  mode?: 'highest' | 'lowest' | undefined;
  hanging?: boolean | undefined;
  select?: boolean | undefined;
  voids?: boolean | undefined;
}
