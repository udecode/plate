'use client';

import React, { ReactNode } from 'react';
import { MenuItem } from 'react-pro-sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Item({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const path = usePathname();

  return (
    <MenuItem active={path === href}>
      <Link href={href}>{children}</Link>
    </MenuItem>
  );
}
