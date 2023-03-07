import { RenderLeafProps } from 'slate-react';
import { Modify } from '../../../utils/src/types/types';
import { Value } from '../interfaces/editor/TEditor';
import { EText, TText } from '../interfaces/text/TText';

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
