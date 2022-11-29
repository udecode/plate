import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type MenuButtonDeleteItemProps = {} & HTMLPropsAs<'div'>;

export const useMenuButtonDeleteItem = (
  props: MenuButtonDeleteItemProps
): HTMLPropsAs<'div'> => {
  return { onClick: () => {}, ...props };
};

export const MenuButtonDeleteItem = createComponentAs<MenuButtonDeleteItemProps>(
  (props) => {
    const htmlProps = useMenuButtonDeleteItem(props);
    return createElementAs('div', htmlProps);
  }
);
