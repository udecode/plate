import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type ThreadCommentEditingCancelButtonProps = {
  commentId: string;
  onCancel?: () => void;
} & HTMLPropsAs<'button'>;

export const useThreadCommentEditingCancelButton = ({
  commentId,
  onCancel,
  ...props
}: ThreadCommentEditingCancelButtonProps) => {
  return {
    ...props,
    onClick: () => {
      onCancel?.();
    },
  };
};

export const ThreadCommentEditingCancelButton = createComponentAs<ThreadCommentEditingCancelButtonProps>(
  (props) => {
    const htmlProps = useThreadCommentEditingCancelButton(props);
    return createElementAs('button', htmlProps);
  }
);
