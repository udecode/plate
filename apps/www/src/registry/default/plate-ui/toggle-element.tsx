import { cn, withRef } from '@udecode/cn';
import { useElement } from '@udecode/plate-common/react';
import {
  useToggleButton,
  useToggleButtonState,
} from '@udecode/plate-toggle/react';
import { ChevronDown, ChevronRight } from 'lucide-react';

import { Button } from './button';
import { PlateElement } from './plate-element';

export const ToggleElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const element = useElement();
    const state = useToggleButtonState(element.id as string);
    const { buttonProps, open } = useToggleButton(state);

    return (
      <PlateElement
        ref={ref}
        className={cn('relative pl-6', className)}
        {...props}
      >
        <Button
          size="icon"
          variant="ghost"
          className="absolute -left-0.5 top-0 size-6 cursor-pointer select-none items-center justify-center rounded-md p-px text-muted-foreground transition-colors hover:bg-accent [&_svg]:size-4"
          contentEditable={false}
          {...buttonProps}
        >
          {open ? <ChevronDown /> : <ChevronRight />}
        </Button>
        {children}
      </PlateElement>
    );
  }
);
