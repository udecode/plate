import type { LeafPosition, Path, Text } from '@platejs/plite';

export type RenderLeafFn = (props: RenderLeafProps) => React.ReactElement<any>;

export type RenderLeafProps<N extends Text = Text> = {
  attributes: {
    className?: string;
    'data-plite-leaf'?: true;
    style?: React.CSSProperties;
  };
  children: any;
  leaf: N;
  /** Pre-computed path for static rendering. */
  path?: Path;
  text: N;
  /**
   * The position of the leaf within the Text node, only present when the text
   * node is split by decorations.
   */
  leafPosition?: LeafPosition;
};
