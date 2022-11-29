import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { SCOPE_ACTIVE_COMMENT } from '../ActiveCommentProvider';
import { useComment } from '../CommentProvider';
import {
  useAddComment,
  useCommentsSelectors,
  useEditingCommentText,
  useResetCommentEditingValue,
} from '../CommentsProvider';

export type NewCommentSubmitButtonProps = {} & HTMLPropsAs<'button'>;
export const useNewCommentSubmitButton = ({
  ...props
}: NewCommentSubmitButtonProps) => {
  const activeCommentId = useCommentsSelectors().activeCommentId()!;
  const comment = useComment(SCOPE_ACTIVE_COMMENT)!;
  const editingValue = useCommentsSelectors().editingValue();

  const editingCommentText = useEditingCommentText();
  const resetCommentEditingValue = useResetCommentEditingValue();
  const addComment = useAddComment();

  const isReplyComment = !!comment;

  const submitButtonText = isReplyComment ? 'Reply' : 'Comment';

  return {
    type: 'submit',
    disabled: !editingCommentText?.trim().length,
    children: submitButtonText,
    onClick: () => {
      if (isReplyComment) {
        addComment({
          threadId: comment.id,
          value: editingValue,
        });
      } else {
        addComment({
          id: activeCommentId,
          value: editingValue,
        });
      }
      resetCommentEditingValue();
    },
    ...props,
  };
};
export const NewCommentSubmitButton = createComponentAs<NewCommentSubmitButtonProps>(
  (props) => {
    const htmlProps = useNewCommentSubmitButton(props);
    return createElementAs('button', htmlProps);
  }
);
