import { useCallback, useEffect, useState } from 'react';
import { createNullUser, User } from '@udecode/plate-comments';
import { RetrieveUser } from '@udecode/plate-ui-comments';

export const useLoggedInUser = (retrieveUser: RetrieveUser): User => {
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
