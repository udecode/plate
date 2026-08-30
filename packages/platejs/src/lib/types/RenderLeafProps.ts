import type { LeafPosition, Path, Text } from '../../facade';

export type RenderLeafFn = (props: RenderLeafProps) => any;

export type RenderLeafProps<N extends Text = Text, L extends Text = N> = {
  attributes: {
    [key: string]: unknown;
    className?: string;
    'data-plite-leaf'?: true;
    style?: any;
  };
  children: any;
  leaf: Omit<L, 'text'>;
  /** Stable path for the live text node. */
  path?: Path;
  text: Omit<N, 'text'>;
  /**
   * The position of the leaf within the Text node, only present when the text
   * node is split by decorations.
   */
  leafPosition?: LeafPosition;
};

export type StaticRenderLeafProps<N extends Text = Text, L extends Text = N> = {
  attributes: {
    [key: string]: unknown;
    className?: string;
    'data-plite-leaf'?: true;
    style?: any;
  };
  children: any;
  leaf: L;
  /** Pre-computed path for static rendering. */
  path?: Path;
  text: N;
  leafPosition?: LeafPosition;
};
