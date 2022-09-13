import { useCallback } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type ThreadCommentEditingSaveButtonProps = {
  onSave?: (value: string) => void;
  value: string;
  initialValue: string;
} & HTMLPropsAs<'button'>;

export const useThreadCommentEditingSaveButton = (
  props: ThreadCommentEditingSaveButtonProps
) => {
  const { initialValue, onSave, value, ...rest } = props;

  const onSaveComment = useCallback(() => {
    onSave?.(value);
  }, [onSave, value]);

  const disabled =
    value.trim().length === 0 || value.trim() === initialValue.trim();

  return { ...rest, onClick: onSaveComment, disabled };
};

export const ThreadCommentEditingSaveButton = createComponentAs<ThreadCommentEditingSaveButtonProps>(
  (props) => {
    const htmlProps = useThreadCommentEditingSaveButton(props);
    return createElementAs('button', htmlProps);
  }
);
