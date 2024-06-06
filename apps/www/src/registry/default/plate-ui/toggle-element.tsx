import { withRef } from '@udecode/cn';
import { PlateElement, useElement } from '@udecode/plate-common';
import { useToggleButton, useToggleButtonState } from '@udecode/plate-toggle';

import { Icons } from '@/components/icons';

export const ToggleElement = withRef<typeof PlateElement>(
  ({ children, ...props }, ref) => {
    const element = useElement();
    const state = useToggleButtonState(element.id as string);
    const { buttonProps, open } = useToggleButton(state);

    return (
      <PlateElement asChild ref={ref} {...props}>
        <div className="relative pl-6">
          <span
            className="absolute -left-0.5 -top-0.5 flex cursor-pointer select-none items-center justify-center rounded-sm p-px transition-colors hover:bg-slate-200"
            contentEditable={false}
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
