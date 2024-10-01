import { cn } from '@udecode/cn';
import { PlateElement } from './plate-element';
import {
  useTocElement,
  useTocElementState,
} from '@udecode/plate-heading/react';
import { withRef } from '@udecode/react-utils';
import { cva } from 'class-variance-authority';

import { Button } from './button';

const headingItemVariants = cva(
  'block h-auto w-full cursor-pointer truncate rounded-none px-0.5 py-1.5 text-left font-medium text-muted-foreground underline decoration-[0.5px] underline-offset-4 hover:bg-accent hover:text-muted-foreground',
  {
    variants: {
      depth: {
        1: 'pl-0.5',
        2: 'pl-[26px]',
        3: 'pl-[50px]',
      },
    },
  }
);

export const TocElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const state = useTocElementState();

    const { props: btnProps } = useTocElement(state);

    const { headingList } = state;

    return (
      <PlateElement
        ref={ref}
        className={cn('relative mb-1 p-0', className)}
        {...props}
      >
        <nav contentEditable={false}>
          {headingList.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(headingItemVariants({ depth: item.depth as any }))}
              onClick={(e) => btnProps.onClick(e, item, 'smooth')}
              aria-current
            >
              {item.title}
            </Button>
          ))}
        </nav>
        {children}
      </PlateElement>
    );
  }
);
