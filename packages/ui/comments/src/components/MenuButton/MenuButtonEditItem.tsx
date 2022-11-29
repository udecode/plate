import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type MenuButtonEditItemProps = {} & HTMLPropsAs<'div'>;

export const useMenuButtonEditItem = (
  props: MenuButtonEditItemProps
): HTMLPropsAs<'div'> => {
  return { onClick: () => {}, ...props };
};

export const MenuButtonEditItem = createComponentAs<MenuButtonEditItemProps>(
  (props) => {
    const htmlProps = useMenuButtonEditItem(props);
    return createElementAs('div', htmlProps);
  }
);
