import { TNode } from '@udecode/plate-core';
import { Location, Path, Point, Range } from 'slate';
import { MatchOptions } from './Editor.types';

export type TNodeMatch<T extends TNode = TNode> =
  | ((node: TNode, path: Path) => node is T)
  | ((node: TNode, path: Path) => boolean);

export interface WrapOptions<T extends TNode = TNode> extends MatchOptions<T> {
  at?: Path | Point | Range;
  mode?: 'highest' | 'lowest' | 'all';
  split?: boolean;
  voids?: boolean;
}

export interface InsertNodesOptions<T extends TNode = TNode>
  extends MatchOptions<T> {
  at?: Path | Point | Range;
  mode?: 'highest' | 'lowest';
  hanging?: boolean;
  select?: boolean;
  voids?: boolean;
}

export interface SetNodesOptions<T extends TNode = TNode> {
  at?: Location;
  match?: TNodeMatch<T>;
  mode?: 'all' | 'highest' | 'lowest';
  hanging?: boolean;
  split?: boolean;
  voids?: boolean;
}
