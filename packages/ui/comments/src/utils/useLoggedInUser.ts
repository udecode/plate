import { useCallback, useEffect, useState } from 'react';
import { createNullUser } from './createNullUser';
import { User } from './types';

export const useLoggedInUser = (retrieveUser: () => User): User => {
  const [loggedInUser, setLoggedInUser] = useState<User>(createNullUser());

  const fetchUser = useCallback(async () => {
    try {
      const user = await retrieveUser();
      setLoggedInUser(user);
    } catch (e) {
      console.error(e);
    }
  }, [retrieveUser]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return loggedInUser;
};
