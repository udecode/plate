import { SPRenderLeafProps } from '@udecode/slate-plugins-core';
import { Text } from 'slate';
import {
  ClassName,
  RootStyleSet,
  StyledProps,
} from '../StyledNode/StyledNode.types';

export type StyledLeafProps<
  TText = Text,
  TStyleProps = ClassName,
  TStyles = RootStyleSet
> = SPRenderLeafProps<TText> & StyledProps<TStyleProps, TStyles>;
