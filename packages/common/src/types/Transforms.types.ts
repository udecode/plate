import { Node, Path, Point, Range } from 'slate';

export interface WrapOptions {
  at?: Path | Point | Range;
  match?: (node: Node) => boolean;
  mode?: 'highest' | 'lowest' | 'all';
  split?: boolean;
  voids?: boolean;
}
