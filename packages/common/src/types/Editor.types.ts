import { TAncestor, TNode } from '@udecode/plate-core';
import { Location, Path, Point, Range } from 'slate';
import { Predicate } from '../queries/match';

export type NodeMatch<T = TNode> = Predicate<T>;

export interface MatchOptions<T = TNode> {
  match?: NodeMatch<T>;
  block?: boolean;
}

export interface EditorNodesOptions<T = TNode> extends MatchOptions<T> {
  at?: Location;
  mode?: 'highest' | 'lowest' | 'all';
  universal?: boolean;
  reverse?: boolean;
  voids?: boolean;
}

export interface EditorAboveOptions<T = TAncestor> extends MatchOptions<T> {
  at?: Range | Path | Point;
  mode?: 'highest' | 'lowest';
  voids?: boolean;
}

export interface EditorParentOptions {
  depth?: number | undefined;
  edge?: 'start' | 'end' | undefined;
}
