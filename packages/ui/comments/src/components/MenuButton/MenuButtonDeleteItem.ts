import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type MenuButtonDeleteItemProps = {
  onDelete: () => void;
} & HTMLPropsAs<'div'>;

export const useMenuButtonDeleteItem = (
  props: MenuButtonDeleteItemProps
): HTMLPropsAs<'div'> => {
  const { onDelete } = props;
  return { ...props, onClick: onDelete };
};

export const MenuButtonDeleteItem = createComponentAs<MenuButtonDeleteItemProps>(
  (props) => {
    const htmlProps = useMenuButtonDeleteItem(props);
    return createElementAs('div', htmlProps);
  }
);
