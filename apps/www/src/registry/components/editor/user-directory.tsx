'use client';

import * as React from 'react';

export type UserProfile = Readonly<{
  id: string;
  name: string;
  avatarUrl?: string;
}>;

export type UserDirectory = Readonly<{
  getUser: (id: string | null | undefined) => UserProfile | undefined;
  getUsers: () => Readonly<Record<string, UserProfile>>;
  mergeUsers: (next: Readonly<Record<string, UserProfile>>) => void;
  writable: boolean;
}>;

const EMPTY_USERS: Readonly<Record<string, UserProfile>> = Object.freeze({});

const FALLBACK_DIRECTORY: UserDirectory = Object.freeze({
  getUser: () => undefined,
  getUsers: () => EMPTY_USERS,
  mergeUsers: () => {},
  writable: false,
});

const UserDirectoryContext =
  React.createContext<UserDirectory>(FALLBACK_DIRECTORY);

export function UserDirectoryProvider({
  children,
  initialUsers,
}: {
  children: React.ReactNode;
  initialUsers?: Readonly<Record<string, UserProfile>>;
}) {
  const [users, setUsers] = React.useState<
    Readonly<Record<string, UserProfile>>
  >(() => (initialUsers ? Object.freeze({ ...initialUsers }) : EMPTY_USERS));

  const mergeUsers = React.useCallback(
    (next: Readonly<Record<string, UserProfile>>) => {
      if (Object.keys(next).length === 0) return;

      setUsers((previous) => Object.freeze({ ...previous, ...next }));
    },
    []
  );

  const directory = React.useMemo<UserDirectory>(
    () =>
      Object.freeze({
        getUser: (id) => (id ? users[id] : undefined),
        getUsers: () => users,
        mergeUsers,
        writable: true,
      }),
    [mergeUsers, users]
  );

  return (
    <UserDirectoryContext value={directory}>{children}</UserDirectoryContext>
  );
}

export const useUserDirectory = (): UserDirectory =>
  React.useContext(UserDirectoryContext);

export const useUser = (
  id: string | null | undefined
): UserProfile | undefined => useUserDirectory().getUser(id);
