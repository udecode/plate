import { useEffect, useState } from 'react';
import { User } from '../types';

export const useLoggedInUser = (retrieveUser: () => User) => {
  const [loggedInUser, setLoggedInUser] = useState<User | null>();

  useEffect(() => {
    setLoggedInUser(retrieveUser());
  }, [retrieveUser]);

  return loggedInUser;
};
