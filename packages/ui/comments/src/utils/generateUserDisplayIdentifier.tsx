import { User } from '@udecode/plate-comments';

export function generateUserDisplayIdentifier({
  user,
  isLoggedInUser,
}: {
  user: User;
  isLoggedInUser: boolean;
}): string {
  return isLoggedInUser ? 'you' : user.name || user.email;
}
