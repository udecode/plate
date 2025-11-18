import type { LeafPosition, TText } from '@platejs/slate';

export type RenderLeafFn = (props: RenderLeafProps) => React.ReactElement<any>;

export type RenderLeafProps<N extends TText = TText> = {
  attributes: {
    className?: string;
    'data-slate-leaf'?: true;
    style?: React.CSSProperties;
  };
  children: any;
  leaf: N;
  text: N;
  /**
   * The position of the leaf within the Text node, only present when the text
   * node is split by decorations.
   */
  leafPosition?: LeafPosition;
};
