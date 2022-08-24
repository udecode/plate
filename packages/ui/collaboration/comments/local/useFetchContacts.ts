import { useCallback } from 'react';

export const users = [
  {
    id: '1',
    name: 'Jon Doe',
    email: 'jon.doe@example.com',
    avatarUrl: '/img/avatar.svg',
  },
  {
    id: '2',
    name: 'Jon Doe2',
    email: 'jon.doe2@example.com',
    avatarUrl: '/img/avatar.svg',
  },
  {
    id: '3',
    name: 'Jon Doe3',
    email: 'jon.doe3@example.com',
    avatarUrl: '/img/avatar.svg',
  },
];

export const useFetchContacts = () => {
  const fetchContacts = useCallback(() => users, []);

  return fetchContacts;
};
