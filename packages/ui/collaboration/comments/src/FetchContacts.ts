import { Contact } from '@udecode/plate-comments';

export type FetchContacts = () => Promise<Contact[]> | Contact[];
