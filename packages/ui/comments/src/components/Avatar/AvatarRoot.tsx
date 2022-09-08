import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type AvatarRootProps = HTMLPropsAs<'div'>;

export const AvatarRoot = createComponentAs<AvatarRootProps>((props) =>
  createElementAs('div', props)
);
