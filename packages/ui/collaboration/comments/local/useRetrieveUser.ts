import { useCallback } from 'react';

export const user = {
  id: '1',
  name: 'Jon Doe',
  email: 'jon.doe@example.com',
  avatarUrl: '/img/avatar.svg',
};

export const useRetrieveUser = () => {
  const retrieveUser = useCallback(() => ({ ...user }), []);

  return retrieveUser;
};
