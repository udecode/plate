import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';

export type ContactsTextProps = HTMLPropsAs<'p'>;

export const ContactsText = createComponentAs<ContactsTextProps>((props) =>
  createElementAs('p', props)
);
