import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type MenuButtonRootProps = HTMLPropsAs<'button'>;

export const MenuButtonRoot = createComponentAs<MenuButtonRootProps>(
  (props) => {
    return createElementAs('button', props);
  }
);
