import type { TText } from '@udecode/slate';

export interface RenderLeafProps<N extends TText = TText> {
  attributes: {
    'data-slate-leaf'?: true;
  };
  children: any;
  leaf: N;
  text: N;
}

export type RenderLeafFn = (props: RenderLeafProps) => React.ReactElement;
