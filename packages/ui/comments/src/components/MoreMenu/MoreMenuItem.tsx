import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type MoreMenuItemProps = HTMLPropsAs<'div'>;

export const useMoreMenuItem = (props: MoreMenuItemProps) => {
  return { ...props };
};

export const MoreMenuItem = createComponentAs<MoreMenuItemProps>((props) => {
  const htmlProps = useMoreMenuItem(props);
  return createElementAs('div', htmlProps);
});
