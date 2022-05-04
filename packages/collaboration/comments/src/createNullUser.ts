import { User } from './User';

export function createNullUser(): User {
  return { id: '', name: '' };
}
