import { useCallback } from 'react';
import { createComponentAs, createElementAs } from '@udecode/plate-core';
import { MoreMenuItem, MoreMenuItemProps } from './MoreMenuItem';

export type MoreMenuEditButtonProps = {
  onEdit: () => void;
} & MoreMenuItemProps;

export const useMoreMenuEditButton = (props: MoreMenuEditButtonProps) => {
  const { onEdit, ...rest } = props;

  const onClick = useCallback(() => {
    onEdit();
  }, [onEdit]);

  return { ...rest, onClick };
};

export const MoreMenuEditButton = createComponentAs<MoreMenuEditButtonProps>(
  (props) => {
    const htmlProps = useMoreMenuEditButton(props);
    return createElementAs(MoreMenuItem, htmlProps);
  }
);
