import { SVGProps } from 'react';
import { MenuButtonProps as MenuButtonBaseProps } from '@szhsin/react-menu';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export interface MenuButtonStyleProps extends MenuButtonProps {}

export interface MenuButtonStyles {
  chevron: CSSProp;
}

export interface MenuButtonProps
  extends Omit<MenuButtonBaseProps, 'styles'>,
    StyledProps<MenuButtonStyles> {
  menuButtonStyles?: MenuButtonBaseProps['styles'];
  chevronProps?: SVGProps<SVGSVGElement>;
}
