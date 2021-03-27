import {
  ClassName,
  RootStyleSet,
  StyledElementProps,
} from '@udecode/slate-plugins';
import { IStyle } from '@uifabric/styling';
import { TagNode } from '../types';

export interface TagElementStyleProps extends ClassName {
  selected?: boolean;
  focused?: boolean;
}

export interface TagElementStyleSet extends RootStyleSet {
  link?: IStyle;
}

export interface TagElementProps
  extends StyledElementProps<
    TagNode,
    TagElementStyleProps,
    TagElementStyleSet
  > {}
