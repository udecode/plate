import * as React from 'react';

import { fireEvent, render, waitFor } from '@testing-library/react';
import { withHOC } from '@platejs/core/react';

import { Resizable } from './Resizable';
import { ResizableProvider, useResizeHandleValue } from './useResizable';

const ResizeNudge = () => {
  const nudgeWidth = useResizeHandleValue('nudgeWidth');

  return <button onClick={() => nudgeWidth(10)}>Nudge</button>;
};

describe('Resizable', () => {
  it('publishes the node width to the rendered wrapper', async () => {
    const view = render(
      <ResizableProvider>
        <Resizable options={{ width: '55%' }}>media</Resizable>
      </ResizableProvider>
    );

    await waitFor(() => {
      expect(view.getByText('media').style.width).toBe('55%');
    });
  });

  it('publishes width through the registry HOC composition', async () => {
    const Media = withHOC(ResizableProvider, () => (
      <Resizable options={{ width: '55%' }}>media</Resizable>
    ));
    const view = render(<Media />);

    await waitFor(() => {
      expect(view.getByText('media').style.width).toBe('55%');
    });
  });

  it('publishes resize callbacks to handle consumers', async () => {
    const onResizeEnd = vi.fn();
    const view = render(
      <ResizableProvider width="55%">
        <Resizable options={{ onResizeEnd, width: '55%' }}>
          <ResizeNudge />
        </Resizable>
      </ResizableProvider>
    );
    const media = view.getByText('Nudge').parentElement!;
    const wrapper = media.parentElement!;

    Object.defineProperty(wrapper, 'offsetWidth', {
      configurable: true,
      value: 700,
    });
    fireEvent.click(view.getByText('Nudge'));

    await waitFor(() => {
      expect(media.style.width).toBe(`${(395 / 700) * 100}%`);
      expect(onResizeEnd).toHaveBeenCalledWith(`${(395 / 700) * 100}%`);
    });
  });
});
