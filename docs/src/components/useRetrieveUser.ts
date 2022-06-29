import { useCallback } from 'react';
import { user } from '../user';

export function useRetrieveUser() {
  const retrieveUser = useCallback(function retrieveUser() {
    return { ...user };
  }, []);

  return retrieveUser;
}
