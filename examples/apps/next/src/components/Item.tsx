import React, { ReactNode } from 'react';
import { MenuItem } from 'react-pro-sidebar';
import Link from 'next/link';
import { useRouter } from 'next/router';

export function Item({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const { route } = useRouter();

  return (
    <MenuItem active={route === href}>
      <Link href={href}>{children}</Link>
    </MenuItem>
  );
}
