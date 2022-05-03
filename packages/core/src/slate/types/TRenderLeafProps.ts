import { RenderLeafProps } from 'slate-react';
import { Value } from './TEditor';
import { EText } from './TText';

export type TRenderLeafProps<V extends Value> = Omit<
  RenderLeafProps,
  'leaf' | 'text'
> & {
  leaf: EText<V>;
  text: EText<V>;
};

export type RenderLeafFn<V extends Value> = (
  props: TRenderLeafProps<V>
) => JSX.Element;
