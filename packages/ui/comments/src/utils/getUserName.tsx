import { CommentUser } from '@udecode/plate-comments';

export const getUserName = ({
  user,
  isCurrentUser,
}: {
  user: CommentUser | null;
  isCurrentUser: boolean;
}): string => {
  if (!user) return 'unknown';

  return isCurrentUser ? 'you' : user.name;
};
