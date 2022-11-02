import { User } from '@udecode/plate-comments';

export const doesContactMatchString = (
  matchString: string,
  contact: User
): boolean => {
  return Boolean(
    contact.name.startsWith(matchString) ||
      contact.email.startsWith(matchString)
  );
};
