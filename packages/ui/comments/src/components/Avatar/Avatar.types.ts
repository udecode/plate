import { User } from '@udecode/plate-comments';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';

export interface AvatarStyles {
  avatar: CSSProp;
}

export interface AvatarProps {
  user: User;
}

export interface AvatarStyleProps
  extends AvatarProps,
    StyledProps<AvatarStyles> {}
