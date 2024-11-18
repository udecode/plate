import React from 'react';

import { NavItemsGrid } from '@/app/(app)/docs/[[...slug]]/nav-items-grid';

export default function ApiPage() {
  return <NavItemsGrid category="api" showFilter={false} />;
}
