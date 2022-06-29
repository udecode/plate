import { useEffect, useState } from 'react';
import { createNullUser, User } from '@xolvio/plate-comments';
import { RetrieveUser } from './useComments';

export function useLoggedInUser({
  retrieveUser,
}: {
  retrieveUser: RetrieveUser;
}): User {
  const [loggedInUser, setLoggedInUser] = useState<User>(createNullUser());

  useEffect(
    function retrieveLoggedInUser() {
      async function retrieveUserAsync(): Promise<void> {
        const loggedInUser2 = await retrieveUser();
        setLoggedInUser(loggedInUser2 ?? createNullUser());
      }

      retrieveUserAsync().catch(console.error);
    },
    [retrieveUser]
  );

  return loggedInUser;
}
