import type { TText } from '@udecode/slate';
import type { Modify } from '@udecode/utils';
import type { RenderLeafProps } from 'slate-react';

export type TRenderLeafProps<N extends TText = TText> = Modify<
  RenderLeafProps,
  {
    leaf: N;
    text: N;
  }
>;

export type RenderLeafFn = (props: TRenderLeafProps) => React.ReactElement;
