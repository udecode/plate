import type { Properties as CSSProperties } from 'csstype';

import type { Editor, NodeKey } from './editor';
import type { NodeEntry } from './node';
import type { Range } from './range';

type PliteDecorationAttributeValue = boolean | number | string | undefined;

export type PliteDecorationAttributes = Readonly<
  {
    className?: string;
    style?: Readonly<CSSProperties<string | number>>;
  } & {
    [name: `aria-${string}`]: PliteDecorationAttributeValue;
    [name: `data-${string}`]: PliteDecorationAttributeValue;
  }
>;

export type PliteDecoration = Readonly<{
  attributes: PliteDecorationAttributes;
  key: string;
  range: Range;
}>;

export type PliteDecorationRefresh = Readonly<{
  nodeKeys: 'all' | readonly NodeKey[];
}>;

export type PliteDecorationSource<E = Editor> = Readonly<{
  id: string;
  /** Attach external ownership before the source's first mounted read. */
  observe?: (context: {
    editor: E;
    refresh: (input: PliteDecorationRefresh) => void;
  }) => () => void;
  read: (context: {
    editor: E;
    entry: NodeEntry;
  }) => readonly PliteDecoration[];
}>;
