import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { User } from '../../types';

export type ThreadCommentResolveButtonProps = {
  user: User;
} & HTMLPropsAs<'img'>;

export const useThreadCommentResolveButton = (
  props: ThreadCommentResolveButtonProps
): HTMLPropsAs<'img'> => {
  const { user } = props;
  const src = user.avatarUrl;
  const alt = `Avatar of ${user.name}`;

  return { ...props, src, alt };
};

export const ThreadCommentResolveButton = createComponentAs<ThreadCommentResolveButtonProps>(
  (props) => {
    const htmlProps = useThreadCommentResolveButton(props);
    return createElementAs('img', htmlProps);
  }
);
