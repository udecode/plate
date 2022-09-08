import { Contact } from './types';

export function doesContactMatchString(
  matchString: string,
  contact: Contact
): boolean {
  return (
    contact.name.startsWith(matchString) ||
    contact.email.startsWith(matchString)
  );
}
