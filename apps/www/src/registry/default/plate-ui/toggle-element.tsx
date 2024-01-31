import { withRef } from '@udecode/cn';
import { PlateElement, useElement } from '@udecode/plate-common';
import { useToggleButton, useToggleButtonState } from '@udecode/plate-toggle';

import { Icons } from '@/components/icons';

export const ToggleElement = withRef<typeof PlateElement>(
  ({ children, ...props }, ref) => {
    const element = useElement();
    const state = useToggleButtonState(element.id as string);
    const { open, buttonProps } = useToggleButton(state);

    return (
      <PlateElement ref={ref} asChild {...props}>
        <div className="relative pl-6">
          <span
            contentEditable={false}
            className={
              'absolute -left-0.5 -top-0.5 cursor-pointer select-none p-0.25 flex justify-center items-center rounded-sm hover:bg-slate-200 transition-colors'
            }
            {...buttonProps}
          >
            {open ? <Icons.chevronDown /> : <Icons.chevronRight />}
          </span>
          {children}
        </div>
      </PlateElement>
    );
  }
);
