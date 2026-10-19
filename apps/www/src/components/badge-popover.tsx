import React, { type ReactNode } from 'react';

import { Badge } from './ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';

export function BadgeList({ children }: { children: ReactNode }) {
  return <div className="flex gap-2">{children}</div>;
}

export function BadgePopover({
  children,
  name,
}: {
  children: ReactNode;
  name: string;
}) {
  return (
    <HoverCard>
      <HoverCardTrigger className="flex items-center gap-2">
        <Badge variant="secondary" className="cursor-pointer font-mono">
          {name}
        </Badge>
      </HoverCardTrigger>

      <HoverCardContent className="w-[700px]">{children}</HoverCardContent>
    </HoverCard>
  );
}
