import type { TText } from '@udecode/slate';

export type RenderLeafFn = (props: RenderLeafProps) => React.ReactElement<any>;

export interface RenderLeafProps<N extends TText = TText> {
  attributes: {
    'data-slate-leaf'?: true;
  };
  children: any;
  leaf: N;
  text: N;
}
