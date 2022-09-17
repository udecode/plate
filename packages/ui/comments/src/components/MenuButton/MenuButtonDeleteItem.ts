import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type MenuButtonDeleteItemProps = {
  onDelete: () => void;
} & HTMLPropsAs<'li'>;

export const useMenuButtonDeleteItem = (
  props: MenuButtonDeleteItemProps
): HTMLPropsAs<'li'> => {
  const { onDelete } = props;
  return { ...props, onClick: onDelete };
};

export const MenuButtonDeleteItem = createComponentAs<MenuButtonDeleteItemProps>(
  (props) => {
    const htmlProps = useMenuButtonDeleteItem(props);
    return createElementAs('li', htmlProps);
  }
);
