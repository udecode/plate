import { TNode } from '@udecode/plate-core';
import { Location, Path, Point, Range } from 'slate';
import { MatchOptions } from './Editor.types';

export interface WrapOptions<T = TNode> extends MatchOptions<T> {
  at?: Path | Point | Range;
  mode?: 'highest' | 'lowest' | 'all';
  split?: boolean;
  voids?: boolean;
}

export interface InsertNodesOptions<T = TNode> extends MatchOptions<T> {
  at?: Path | Point | Range;
  mode?: 'highest' | 'lowest';
  hanging?: boolean;
  select?: boolean;
  voids?: boolean;
}

export interface SetNodesOptions<T = TNode> extends MatchOptions<T> {
  at?: Location;
  mode?: 'all' | 'highest' | 'lowest';
  hanging?: boolean;
  split?: boolean;
  voids?: boolean;
}
