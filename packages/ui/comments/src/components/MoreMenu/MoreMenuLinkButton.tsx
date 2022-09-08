import { useCallback } from 'react';
import { createComponentAs, createElementAs } from '@udecode/plate-core';
import { MoreMenuItem, MoreMenuItemProps } from './MoreMenuItem';

export type MoreMenuLinkButtonProps = {
  onLink: () => void;
  showLinkButton?: boolean;
} & MoreMenuItemProps;

export const useMoreMenuLinkButton = (props: MoreMenuLinkButtonProps) => {
  const { onLink, ...rest } = props;

  const onClick = useCallback(() => {
    onLink();
  }, [onLink]);

  return { ...rest, onClick };
};

export const MoreMenuLinkButton = createComponentAs<MoreMenuLinkButtonProps>(
  (props) => {
    if (!props.showLinkButton) return null;
    const htmlProps = useMoreMenuLinkButton(props);
    return createElementAs(MoreMenuItem, htmlProps);
  }
);
