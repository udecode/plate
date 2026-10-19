import { render, waitFor } from '@testing-library/react';
import * as React from 'react';

import {
  FloatingPopover,
  FloatingPopoverAnchor,
  FloatingPopoverContent,
} from './floating-popover';

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

it('reports when an open anchored popover is positioned', async () => {
  let placements = 0;
  const view = render(
    <FloatingPopover open>
      <FloatingPopoverAnchor element={<button type="button">Anchor</button>} />
      <FloatingPopoverContent onPlaced={() => (placements += 1)}>
        Content
      </FloatingPopoverContent>
    </FloatingPopover>
  );

  await waitFor(() => expect(placements).toBe(1));
  view.rerender(
    <FloatingPopover open>
      <FloatingPopoverAnchor element={<button type="button">Anchor</button>} />
      <FloatingPopoverContent onPlaced={() => (placements += 1)}>
        Content
      </FloatingPopoverContent>
    </FloatingPopover>
  );
  expect(placements).toBe(1);
  view.unmount();
});
