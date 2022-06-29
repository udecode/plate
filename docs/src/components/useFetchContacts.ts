import { useCallback } from 'react';
import { users } from './users';

export function useFetchContacts() {
  const fetchContacts = useCallback(function fetchContacts() {
    return users;
  }, []);

  return fetchContacts;
}
