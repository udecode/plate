'use client';

import { ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';

export function AnnouncementButton({
  label = 'Create your Plate editor',
}: {
  label?: string;
}) {
  return (
    <Badge asChild variant="secondary" className="mb-2 bg-muted">
      <Link href="/create">
        {label}
        <ArrowRightIcon />
      </Link>
    </Badge>
  );
}
