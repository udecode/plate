'use client';

import { ArrowRightIcon } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';

export function AnnouncementButton() {
  return (
    <Badge asChild variant="secondary" className="mb-2 bg-muted">
      <Link href="/docs/plugin-input-rules">
        Plugin Input Rules
        <ArrowRightIcon />
      </Link>
    </Badge>
  );
}
