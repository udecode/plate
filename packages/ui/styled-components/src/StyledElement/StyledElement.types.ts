import { HTMLAttributes } from 'react';
import {
  EElement,
  PlateRenderElementProps,
  TElement,
  Value,
} from '@udecode/plate-core';
import { StyledProps } from '../types/StyledProps';

export type StyledElementProps<
  V extends Value,
  N extends TElement = EElement<V>,
  TStyles = {}
> = PlateRenderElementProps<V, N> &
  StyledProps<TStyles> &
  HTMLAttributes<HTMLElement>;
