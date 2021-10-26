import { ButtonHTMLAttributes } from 'react';
import { StyledProps } from '@udecode/plate-styled-components';

export interface ButtonStyleProps extends ButtonProps {}

export interface ButtonStyles {}

export interface ButtonProps extends ButtonHTMLAttributes<any>, StyledProps {
  size?: number | string;
  px?: number | string;
  py?: number | string;
}
