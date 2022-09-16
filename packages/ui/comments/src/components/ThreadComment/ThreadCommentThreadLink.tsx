import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { User } from '../../types';

export type ThreadCommentThreadLinkProps = {
  user: User;
} & HTMLPropsAs<'img'>;

export const useThreadCommentThreadLink = (
  props: ThreadCommentThreadLinkProps
) => {
  const { user } = props;
  const src = user.avatarUrl;
  const alt = `Avatar of ${user.name}`;

  return { ...props, src, alt };
};

export const ThreadCommentThreadLink = createComponentAs<ThreadCommentThreadLinkProps>(
  (props) => {
    const htmlProps = useThreadCommentThreadLink(props);
    return createElementAs('img', htmlProps);
  }
);
