import * as React from 'react';

import { fireEvent, render, waitFor } from '@testing-library/react';

import { Resizable, ResizeHandle } from './Resizable';

describe('Resizable', () => {
  it('publishes the node width to the rendered wrapper', async () => {
    const view = render(<Resizable width="55%">media</Resizable>);

    await waitFor(() => {
      expect(view.getByText('media').style.width).toBe('55%');
    });
  });

  it('publishes resize callbacks to handle consumers', async () => {
    const onResizeEnd = vi.fn();
    const view = render(
      <Resizable onResizeEnd={onResizeEnd} width="55%">
        <ResizeHandle direction="right" />
      </Resizable>
    );
    const slider = view.getByRole('slider', { name: 'Resize' });
    const media = slider.parentElement!;
    const wrapper = media.parentElement!;

    Object.defineProperty(wrapper, 'offsetWidth', {
      configurable: true,
      value: 700,
    });
    fireEvent.keyDown(slider, { key: 'ArrowRight' });

    await waitFor(() => {
      expect(media.style.width).toBe(`${(395 / 700) * 100}%`);
      expect(onResizeEnd).toHaveBeenCalledWith(`${(395 / 700) * 100}%`);
    });
  });
});
