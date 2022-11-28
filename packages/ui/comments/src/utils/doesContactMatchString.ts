import { CommentUser } from '@udecode/plate-comments';

export const doesContactMatchString = (
  matchString: string,
  contact: CommentUser
): boolean => {
  return Boolean(contact.name.startsWith(matchString));
};
