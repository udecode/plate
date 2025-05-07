import type { LeafPosition, TText } from '@udecode/slate';

export type RenderLeafFn = (props: RenderLeafProps) => React.ReactElement<any>;

export interface RenderLeafProps<N extends TText = TText> {
  attributes: {
    'data-slate-leaf'?: true;
  } & React.HTMLAttributes<HTMLSpanElement>;
  children: any;
  leaf: N;
  text: N;
  /**
   * The position of the leaf within the Text node, only present when the text
   * node is split by decorations.
   */
  leafPosition?: LeafPosition;
}
