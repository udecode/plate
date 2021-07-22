import { StyledElementProps } from '@udecode/plate';
import { CSSProp } from 'styled-components';
import { TagNode } from '../types';

export interface TagElementStyleProps extends TagElementProps {
  selected?: boolean;
  focused?: boolean;
}

export interface TagElementStyles {
  link: CSSProp;
}

export interface TagElementProps
  extends StyledElementProps<TagNode, TagElementStyles> {}
