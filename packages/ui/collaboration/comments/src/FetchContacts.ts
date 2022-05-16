import { Contact } from '@xolvio/plate-comments';

export type FetchContacts = () => Promise<Contact[]> | Contact[];
