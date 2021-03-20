import { StyledElementProps } from '@udecode/slate-plugins-components';
import { IStyle } from '@uifabric/styling';
import { TagNode } from '../types';

export interface TagElementStyleProps {
  /**
   * Accept custom classNames
   */
  className?: string;

  selected?: boolean;
  focused?: boolean;
}

export interface TagElementStyleSet {
  /**
   * Style for the root element.
   */
  root?: IStyle;

  link?: IStyle;
}

export interface TagElementProps
  extends StyledElementProps<
    TagNode,
    TagElementStyleProps,
    TagElementStyleSet
  > {}
