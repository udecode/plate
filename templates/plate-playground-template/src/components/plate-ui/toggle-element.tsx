import { cn, withRef } from '@udecode/cn';
import { useElement } from '@udecode/plate-common/react';
import {
  useToggleButton,
  useToggleButtonState,
} from '@udecode/plate-toggle/react';

import { Icons } from '@/components/icons';

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
        <span
          className="absolute -left-0.5 -top-0.5 flex cursor-pointer select-none items-center justify-center rounded-sm p-px transition-colors hover:bg-slate-200"
          contentEditable={false}
          {...buttonProps}
        >
          {open ? <Icons.chevronDown /> : <Icons.chevronRight />}
        </span>
        {children}
      </PlateElement>
    );
  }
);
