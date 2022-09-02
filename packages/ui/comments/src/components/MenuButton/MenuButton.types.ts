import { StyledProps } from '@udecode/plate-styled-components';

export interface MenuButtonStyleProps extends MenuButtonProps {}

export interface MenuButtonStyles {}

export interface MenuButtonProps extends StyledProps<MenuButtonStyles> {
  onDelete: () => void;
  onEdit: () => void;
  onLinkToThisComment: () => void;
  showLinkToThisComment: boolean;
}
