import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type MenuButtonEditItemProps = {
  onEdit: () => void;
} & HTMLPropsAs<'div'>;

export const useMenuButtonEditItem = (
  props: MenuButtonEditItemProps
): HTMLPropsAs<'div'> => {
  const { onEdit } = props;
  return { ...props, onClick: onEdit };
};

export const MenuButtonEditItem = createComponentAs<MenuButtonEditItemProps>(
  (props) => {
    const htmlProps = useMenuButtonEditItem(props);
    return createElementAs('div', htmlProps);
  }
);
