import { TNode } from '@udecode/slate-plugins-core';
import { Path, Point, Range } from 'slate';
import { MatchOptions } from './Editor.types';

export interface WrapOptions<T = TNode> extends MatchOptions<T> {
  at?: Path | Point | Range;
  mode?: 'highest' | 'lowest' | 'all';
  split?: boolean;
  voids?: boolean;
}

export interface InsertNodesOptions<T = TNode> extends MatchOptions<T> {
  at?: Path | Point | Range | undefined;
  mode?: 'highest' | 'lowest' | undefined;
  hanging?: boolean | undefined;
  select?: boolean | undefined;
  voids?: boolean | undefined;
}
