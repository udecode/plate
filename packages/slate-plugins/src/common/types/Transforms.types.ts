import { Path, Point, Range } from 'slate';
import { NodeMatch } from './Editor.types';

export interface WrapOptions {
  at?: Path | Point | Range;
  match?: NodeMatch;
  mode?: 'highest' | 'lowest' | 'all';
  split?: boolean;
  voids?: boolean;
}

export interface InsertNodesOptions {
  at?: Path | Point | Range | undefined;
  match?: NodeMatch | undefined;
  mode?: 'highest' | 'lowest' | undefined;
  hanging?: boolean | undefined;
  select?: boolean | undefined;
  voids?: boolean | undefined;
}
