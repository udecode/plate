import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type MenuButtonLinkItemProps = {
  onLinkToThisComment: () => void;
} & HTMLPropsAs<'li'>;

export const useMenuButtonLinkItem = (
  props: MenuButtonLinkItemProps
): HTMLPropsAs<'li'> => {
  const { onLinkToThisComment } = props;
  return { ...props, onClick: onLinkToThisComment };
};

export const MenuButtonLinkItem = createComponentAs<MenuButtonLinkItemProps>(
  (props) => {
    const htmlProps = useMenuButtonLinkItem(props);
    return createElementAs('li', htmlProps);
  }
);
