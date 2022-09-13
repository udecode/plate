import { useCallback } from 'react';
import { createComponentAs, createElementAs } from '@udecode/plate-core';
import { MoreMenuItem, MoreMenuItemProps } from './MoreMenuItem';

export type MoreMenuDeleteButtonProps = {
  onDelete?: () => void;
} & MoreMenuItemProps;

export const useMoreMenuDeleteButton = (props: MoreMenuDeleteButtonProps) => {
  const { onDelete, ...rest } = props;

  const onClick = useCallback(() => {
    onDelete?.();
  }, [onDelete]);

  return { ...rest, onClick };
};

export const MoreMenuDeleteButton = createComponentAs<MoreMenuDeleteButtonProps>(
  (props) => {
    const htmlProps = useMoreMenuDeleteButton(props);
    return createElementAs(MoreMenuItem, htmlProps);
  }
);
