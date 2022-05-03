import { PlateRenderLeafProps, Value } from '@udecode/plate-core';
import { StyledProps } from '../types/StyledProps';

export type StyledLeafProps<
  V extends Value,
  TStyles = {}
> = PlateRenderLeafProps<V> & StyledProps<TStyles>;
