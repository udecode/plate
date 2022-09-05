import { AccountCircle } from '@styled-icons/material';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { StyledProps } from '@udecode/plate-styled-components';
import { CSSProp } from 'styled-components';
import { User } from '../utils';

export type AvatarStyles = {
  avatar: CSSProp;
};

export type AvatarProps = {
  user: User;
};

export type AvatarStyleProps = AvatarProps & StyledProps<AvatarStyles>;

export const useAvatar = (props: AvatarProps) => props;

export const AvatarRoot = createComponentAs<HTMLPropsAs<'div'>>((props) =>
  createElementAs('div', props)
);

export const AvatarImage = createComponentAs<AvatarProps & HTMLPropsAs<'img'>>(
  (props) => {
    const { user } = useAvatar(props);
    const src = user.avatarUrl;
    const alt = `Avatar of ${user.name}`;

    return createElementAs('img', { src, alt, ...props });
  }
);

export const AvatarAccountCircle = createComponentAs((props) =>
  createElementAs(AccountCircle, props)
);

export const Avatar = {
  Root: AvatarRoot,
  Image: AvatarImage,
  AccountCircle: AvatarAccountCircle,
};
