import type { TText } from '@udecode/slate';

export interface TRenderLeafProps<N extends TText = TText> {
  attributes: {
    'data-slate-leaf'?: true;
  };
  children: any;
  leaf: N;
  text: N;
}

export type RenderLeafFn = (props: TRenderLeafProps) => React.ReactElement;
