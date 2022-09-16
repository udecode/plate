import { useCallback } from 'react';
import { createComponentAs, createElementAs } from '@udecode/plate-core';
import { threadCommentStoreActions } from '../ThreadComment';
import { MoreMenuItem, MoreMenuItemProps } from './MoreMenuItem';

export type MoreMenuEditButtonProps = {
  onEdit?: () => void;
} & MoreMenuItemProps;

export const useMoreMenuEditButton = (props: MoreMenuEditButtonProps) => {
  const { onEdit, ...rest } = props;

  const onClick = useCallback(() => {
    onEdit?.();
    threadCommentStoreActions.isEditing(true);
  }, [onEdit]);

  return { ...rest, onClick };
};

export const MoreMenuEditButton = createComponentAs<MoreMenuEditButtonProps>(
  (props) => {
    const htmlProps = useMoreMenuEditButton(props);
    return createElementAs(MoreMenuItem, htmlProps);
  }
);
