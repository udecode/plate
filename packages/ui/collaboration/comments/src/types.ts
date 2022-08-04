import { Comment, Contact, Thread, User } from '@xolvio/plate-comments';

export type FetchContacts = () => Promise<Contact[]> | Contact[];

export type OnReOpenThread = () => void;

export type OnResolveThread = () => void;

export interface SomethingWithAnId {
  id: any;
}

export interface ThreadPosition {
  left: number;
  top: number;
}

export type RetrieveUserReturnType = User;

export type RetrieveUser = () =>
  | RetrieveUserReturnType
  | Promise<RetrieveUserReturnType>;

export type OnAddThread = () => Promise<void>;

export type OnSaveComment = (comment: Comment) => Promise<Thread>;

export type OnSubmitComment = (
  commentText: string,
  assignedTo?: User
) => Promise<Thread>;

export type OnCancelCreateThread = () => void;
