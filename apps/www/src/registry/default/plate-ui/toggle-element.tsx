import { withRef } from '@udecode/cn';
import { PlateElement, useElement } from '@udecode/plate-common';
import { useToggleButton, useToggleButtonState } from '@udecode/plate-toggle';

import { Icons } from '@/components/icons';

export const ToggleElement = withRef<typeof PlateElement>(
  ({ children, ...props }, ref) => {
    const element = useElement();
    const state = useToggleButtonState(element.id);
    const { buttonProps } = useToggleButton(state);

    // TODO use tailwind instead of inline styles
    return (
      <PlateElement ref={ref} asChild {...props}>
        <div style={{ position: 'relative', paddingLeft: '24px' }}>
          <span
            contentEditable={false}
            style={{
              position: 'absolute',
              left: '-4px',
              top: '-4px',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '2px',
              transition: 'background-color 0.3s ease',
              '&:hover': {
                backgroundColor: '#D4DBF1',
              },
            }}
            {...buttonProps}
          >
            {state.open ? <Icons.chevronDown /> : <Icons.chevronRight />}
          </span>
          {children}
        </div>
      </PlateElement>
    );
  }
);
