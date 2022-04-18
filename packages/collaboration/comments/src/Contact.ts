export interface Contact {
  name: string;
  email: string;
  avatarUrl: string;
}

export function doesContactMatchString(
  matchString: string,
  contact: Contact
): boolean {
  return (
    contact.name.startsWith(matchString) ||
    contact.email.startsWith(matchString)
  );
}
