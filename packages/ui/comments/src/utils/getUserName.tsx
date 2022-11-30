import { CommentUser } from '@udecode/plate-comments';

export const getUserName = ({
  user,
  isMyUser,
}: {
  user: CommentUser | null;
  isMyUser: boolean;
}): string => {
  if (!user) return 'unknown';

  return isMyUser ? 'you' : user.name;
};
