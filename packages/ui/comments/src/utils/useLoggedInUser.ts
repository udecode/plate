import { useEffect, useState } from 'react';
import { User } from '@udecode/plate-comments';

export const useLoggedInUser = (retrieveUser: () => User) => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>();

  useEffect(() => {
    setLoggedInUser(retrieveUser());
  }, [retrieveUser]);

  return loggedInUser;
};
