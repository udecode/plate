import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type MenuButtonMenuProps = {
  onLinkToThisComment: () => void;
} & HTMLPropsAs<'div'>;

export const useMenuButtonMenu = (
  props: MenuButtonMenuProps
): HTMLPropsAs<'div'> => {
  const { onLinkToThisComment } = props;

  return { ...props, onClick: onLinkToThisComment };
};

export const MenuButtonMenu = createComponentAs<MenuButtonMenuProps>(
  (props) => {
    const htmlProps = useMenuButtonMenu(props);
    return createElementAs('div', htmlProps);
  }
);
