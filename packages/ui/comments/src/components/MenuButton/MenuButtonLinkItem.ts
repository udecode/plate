import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type MenuButtonLinkItemProps = {} & HTMLPropsAs<'div'>;

export const useMenuButtonLinkItem = (
  props: MenuButtonLinkItemProps
): HTMLPropsAs<'div'> => {
  return { onClick: () => {}, ...props };
};

export const MenuButtonLinkItem = createComponentAs<MenuButtonLinkItemProps>(
  (props) => {
    const htmlProps = useMenuButtonLinkItem(props);
    return createElementAs('div', htmlProps);
  }
);
