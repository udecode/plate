import { render } from '@testing-library/react';
import * as React from 'react';

import { FloatingPopover, FloatingPopoverAnchor } from './floating-popover';

it('runs caller ref cleanup when its anchor unmounts', () => {
  let activeBindings = 0;
  const view = render(
    <FloatingPopover>
      <FloatingPopoverAnchor
        element={
          <button
            type="button"
            ref={(node) => {
              if (!node) return undefined;
              activeBindings += 1;
              return () => {
                activeBindings -= 1;
              };
            }}
          >
            Anchor
          </button>
        }
      />
    </FloatingPopover>
  );

  expect(activeBindings).toBeGreaterThan(0);
  view.unmount();

  expect(activeBindings).toBe(0);
});
