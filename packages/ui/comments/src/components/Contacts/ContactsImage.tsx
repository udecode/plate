import {
  createComponentAs,
  createElementAs,
  HTMLPropsAs,
} from '@udecode/plate-core';
import { User } from '../../types';

export type ContactsImageProps = {
  contact: User;
} & HTMLPropsAs<'img'>;

export const useContactsImage = (
  props: ContactsImageProps
): HTMLPropsAs<'img'> => {
  const { contact, ...rest } = props;
  return { ...rest, src: contact.avatarUrl, alt: 'Avatar' };
};

export const ContactsImage = createComponentAs<ContactsImageProps>((props) => {
  const htmlProps = useContactsImage(props);
  return createElementAs('img', htmlProps);
});
