import { User } from './types';

export function createNullUser(): User {
  return { id: '', name: '', email: '' };
}
