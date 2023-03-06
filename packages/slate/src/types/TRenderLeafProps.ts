import { RenderLeafProps } from 'slate-react';
import { Value } from '../interfaces/editor/TEditor';
import { EText, TText } from '../interfaces/text/TText';
import { Modify } from './misc/types';

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
