import { HTMLAttributes } from 'react';
import { MenuProps as MenuBaseProps } from '@szhsin/react-menu';
import { StyledProps } from '@udecode/plate-styled-components';

export interface MenuStyleProps extends MenuProps {}

export interface MenuStyles {}

export interface MenuProps extends StyledProps<MenuStyles>, MenuBaseProps {
  rootProps?: HTMLAttributes<HTMLDivElement>;
}
