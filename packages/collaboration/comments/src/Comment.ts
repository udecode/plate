import { User } from './User';

export interface Comment {
  id: any;
  text: string;
  createdAt: number;
  createdBy: User;
}
