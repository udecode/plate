import { EText, PlateRenderLeafProps, Value } from '@udecode/plate-core';
import { StyledProps } from '../types/StyledProps';

export type StyledLeafProps<
  V extends Value,
  N extends EText<V> = EText<V>,
  TStyles = {}
> = PlateRenderLeafProps<V, N> & StyledProps<TStyles>;
