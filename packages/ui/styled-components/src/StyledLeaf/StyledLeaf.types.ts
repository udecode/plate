import { SPRenderLeafProps } from '@udecode/slate-plugins-core';
import { Text } from 'slate';
import { StyledProps } from '../types/StyledProps';

export type StyledLeafProps<
  TText = Text,
  TStyles = {}
> = SPRenderLeafProps<TText> & StyledProps<TStyles>;
