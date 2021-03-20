import { classNamesFunction } from '@uifabric/utilities';
import {
  NodeStyleProps,
  NodeStyleSet,
} from './components/StyledNode/StyledNode.types';

export const getRootClassNames = <
  TStyleProps = NodeStyleProps,
  TStyleSet = NodeStyleSet
>() => classNamesFunction<TStyleProps, TStyleSet>();
