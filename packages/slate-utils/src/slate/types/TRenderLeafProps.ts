import { RenderLeafProps } from 'slate-react';
import { Modify } from '../../types/misc/types';
import { Value } from '../editor/TEditor';
import { EText, TText } from '../text/TText';

export type TRenderLeafProps<
  V extends Value = Value,
  N extends TText = EText<V>
> = Modify<
  RenderLeafProps,
  {
    leaf: N;
    text: N;
  }
>;

export type RenderLeafFn<V extends Value = Value> = (
  props: TRenderLeafProps<V>
) => JSX.Element;
