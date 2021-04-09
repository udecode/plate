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
  TStyleSet = RootStyleSet
> = SPRenderElementProps<TElement> & StyledProps<TStyleProps, TStyleSet>;
