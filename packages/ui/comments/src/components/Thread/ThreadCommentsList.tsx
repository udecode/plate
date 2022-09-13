import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { User } from '../../utils';

export type ThreadCommentsListProps = {
  user: User;
} & HTMLPropsAs<'img'>;

export const useThreadCommentsList = (
  props: ThreadCommentsListProps
): HTMLPropsAs<'img'> => {
  const { user } = props;
  const src = user.avatarUrl;
  const alt = `Avatar of ${user.name}`;

  return { ...props, src, alt };
};

export const ThreadCommentsList = createComponentAs<ThreadCommentsListProps>(
  (props) => {
    const htmlProps = useThreadCommentsList(props);
    return createElementAs('img', htmlProps);
  }
);
