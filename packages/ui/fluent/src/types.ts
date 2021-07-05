import { classNamesFunction } from '@uifabric/utilities';
import { ClassName, RootStyleSet } from './StyledNode/StyledNode.types';

export const getRootClassNames = <
  TStyleProps = ClassName,
  TStyles = RootStyleSet
>() => classNamesFunction<TStyleProps, TStyles>();
