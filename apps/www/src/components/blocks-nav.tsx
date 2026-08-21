'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// Not yet used
const registryCategories = [
  { hidden: false, name: 'Editors', slug: 'editors' },
];

export function BlocksNav() {
  const pathname = usePathname();
  return (
    <div className="relative overflow-hidden">
      <ScrollArea className="max-w-none">
        <div className="flex items-center">
          <BlocksNavLink
            category={{ hidden: false, name: 'Featured', slug: '' }}
            isActive={pathname === '/blocks'}
          />
          {registryCategories.map((category) => (
            <BlocksNavLink
              key={category.slug}
              category={category}
              isActive={pathname === `/blocks/${category.slug}`}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
}
function BlocksNavLink({
  category,
  isActive,
}: {
  category: (typeof registryCategories)[number];
  isActive: boolean;
}) {
  if (category.hidden) {
    return null;
  }
  return (
    <Link
      key={category.slug}
      className="flex h-7 shrink-0 items-center justify-center rounded-full px-4 text-center text-sm font-medium whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground data-[active=true]:bg-muted data-[active=true]:text-foreground"
      data-active={isActive}
      href={`/blocks/${category.slug}`}
    >
      {category.name}
    </Link>
  );
}
