import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type MenuButtonLinkItemProps = {
  onLinkToThisComment?: () => void;
} & HTMLPropsAs<'div'>;

export const useMenuButtonLinkItem = (
  props: MenuButtonLinkItemProps
): HTMLPropsAs<'div'> => {
  const { onLinkToThisComment } = props;
  return { ...props, onClick: onLinkToThisComment };
};

export const MenuButtonLinkItem = createComponentAs<MenuButtonLinkItemProps>(
  (props) => {
    const htmlProps = useMenuButtonLinkItem(props);
    return createElementAs('div', htmlProps);
  }
);
