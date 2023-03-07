import { HTMLAttributes } from 'react';
import {
  EElement,
  PlateRenderElementProps,
  TElement,
  Value,
} from '@udecode/plate-common';
import { StyledProps } from '../types/StyledProps';

export type StyledElementProps<
  V extends Value = Value,
  N extends TElement = EElement<V>,
  TStyles = {}
> = PlateRenderElementProps<V, N> &
  StyledProps<TStyles> &
  HTMLAttributes<HTMLElement>;
