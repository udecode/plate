import { useCommentsSelectors } from '@udecode/plate-comments';
import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { capitalize } from 'lodash';
import { getUserName } from '../../utils';

export type CommentUserNameProps = {
  userId: string | null;
} & HTMLPropsAs<'div'>;

export const useCommentUserName = (
  props: CommentUserNameProps
): HTMLPropsAs<'div'> => {
  const { userId } = props;

  const currentUserId = useCommentsSelectors().currentUserId();
  const user = useCommentsSelectors().user(userId);
  const isCurrentUser = currentUserId === userId;

  const text = capitalize(
    getUserName({
      user,
      isCurrentUser,
    })
  );
  return { ...props, children: text };
};

export const CommentUserName = createComponentAs<CommentUserNameProps>(
  (props) => {
    const htmlProps = useCommentUserName(props);
    return createElementAs('div', htmlProps);
  }
);
