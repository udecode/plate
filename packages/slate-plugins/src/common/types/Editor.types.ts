import { Node, Path, Point, Range, Span } from 'slate';

export type NodeMatch<T extends Node = Node> = (node: T) => boolean;

export interface EditorNodesOptions {
  at?: Range | Path | Point | Span;
  match?: NodeMatch;
  mode?: 'highest' | 'lowest' | 'all';
  universal?: boolean;
  reverse?: boolean;
  voids?: boolean;
}

export interface EditorAboveOptions {
  at?: Range | Path | Point;
  match?: NodeMatch;
  mode?: 'highest' | 'lowest';
  voids?: boolean;
}

export interface EditorParentOptions {
  depth?: number | undefined;
  edge?: 'start' | 'end' | undefined;
}
