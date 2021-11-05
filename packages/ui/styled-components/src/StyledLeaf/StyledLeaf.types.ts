import { PlateRenderLeafProps } from '@udecode/plate-core';
import { Text } from 'slate';
import { StyledProps } from '../types/StyledProps';

export type StyledLeafProps<
  TText = Text,
  TStyles = {}
> = PlateRenderLeafProps<TText> & StyledProps<TStyles>;
