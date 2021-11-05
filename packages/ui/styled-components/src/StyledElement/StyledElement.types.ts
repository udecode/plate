import { HTMLAttributes } from 'react';
import { PlateRenderElementProps } from '@udecode/plate-core';
import { Element } from 'slate';
import { StyledProps } from '../types/StyledProps';

export type StyledElementProps<
  TElement = Element,
  TStyles = {}
> = PlateRenderElementProps<TElement> &
  StyledProps<TStyles> &
  HTMLAttributes<HTMLElement>;
