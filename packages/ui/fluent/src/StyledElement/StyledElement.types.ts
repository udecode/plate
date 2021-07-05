import { SPRenderElementProps } from '@udecode/slate-plugins-core';
import { Element } from 'slate';
import {
  ClassName,
  RootStyleSet,
  StyledProps,
} from '../StyledNode/StyledNode.types';

export type StyledElementProps<
  TElement = Element,
  TStyleProps = ClassName,
  TStyles = RootStyleSet
> = SPRenderElementProps<TElement> & StyledProps<TStyleProps, TStyles>;
