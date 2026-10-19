import type { Properties as CSSProperties } from 'csstype';

import type { Editor, NodeKey } from './editor';
import type { NodeEntry } from './node';
import type { Range } from './range';

type DecorationAttributeValue = boolean | number | string | undefined;

export type DecorationAttributes = Readonly<
  {
    className?: string;
    style?: Readonly<CSSProperties<string | number>>;
  } & {
    [name: `aria-${string}`]: DecorationAttributeValue;
    [name: `data-${string}`]: DecorationAttributeValue;
  }
>;

export type Decoration = Readonly<{
  attributes: DecorationAttributes;
  key: string;
  range: Range;
}>;

export type DecorationRefresh = Readonly<{
  nodeKeys: 'all' | readonly NodeKey[];
}>;

export type DecorationSource<E = Editor> = Readonly<{
  id: string;
  /** Attach external ownership before the source's first mounted read. */
  observe?: (context: {
    editor: E;
    refresh: (input: DecorationRefresh) => void;
  }) => () => void;
  read: (context: { editor: E; entry: NodeEntry }) => readonly Decoration[];
}>;
