import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { capitalize } from 'lodash';
import { getUserName } from '../../utils';
import { useCommentUser } from '../CommentProvider';
import { useCommentsSelectors } from '../CommentsProvider';

export type CommentUserNameProps = {} & HTMLPropsAs<'div'>;

export const useCommentUserName = (
  props: CommentUserNameProps
): HTMLPropsAs<'div'> => {
  const myUserId = useCommentsSelectors().myUserId();
  const user = useCommentUser();
  const isMyUser = myUserId === user?.id;

  const text = capitalize(
    getUserName({
      user,
      isMyUser,
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
