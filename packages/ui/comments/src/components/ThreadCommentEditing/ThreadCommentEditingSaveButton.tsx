import { useCallback } from 'react';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type ThreadCommentEditingSaveButtonProps = {
  onSave: (text: string) => void;
  value: string;
  defaultText: string;
} & HTMLPropsAs<'button'>;

export const useThreadCommentEditingSaveButton = (
  props: ThreadCommentEditingSaveButtonProps
) => {
  const { onSave, value, defaultText } = props;

  const onClick = useCallback(() => {
    onSave(value);
  }, [onSave, value]);

  return {
    ...props,
    onClick,
    disabled: value.trim().length === 0 || value.trim() === defaultText.trim(),
  };
};

export const ThreadCommentEditingSaveButton = createComponentAs<ThreadCommentEditingSaveButtonProps>(
  (props) => {
    const htmlProps = useThreadCommentEditingSaveButton(props);
    return createElementAs('button', htmlProps);
  }
);
