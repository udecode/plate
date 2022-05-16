import { EText, PlateRenderLeafProps, TText, Value } from '@udecode/plate-core';
import { StyledProps } from '../types/StyledProps';

export type StyledLeafProps<
  V extends Value = Value,
  N extends TText = EText<V>,
  TStyles = {}
> = PlateRenderLeafProps<V, N> & StyledProps<TStyles>;
