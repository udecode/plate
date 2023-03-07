import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-common';
import { useCommentUser } from '../stores/comment/CommentProvider';

export type CommentUserNameProps = {} & HTMLPropsAs<'div'>;

export const useCommentUserName = (
  props: CommentUserNameProps
): HTMLPropsAs<'div'> => {
  const user = useCommentUser();

  return { ...props, children: user?.name ?? 'Anonymous' };
};

export const CommentUserName = createComponentAs<CommentUserNameProps>(
  (props) => {
    const htmlProps = useCommentUserName(props);
    return createElementAs('div', htmlProps);
  }
);
