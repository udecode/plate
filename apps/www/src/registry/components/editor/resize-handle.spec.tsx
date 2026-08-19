import * as React from 'react';

import { fireEvent, render, waitFor } from '@testing-library/react';
import { describe, expect, it, mock } from 'bun:test';

import { Resizable, ResizeHandle } from './resize-handle';

describe('ResizeHandle', () => {
  it('resizes media from the keyboard', async () => {
    const onResizeEnd = mock();
    const view = render(
      <Resizable onResizeEnd={onResizeEnd} width="55%">
        <ResizeHandle direction="right" />
      </Resizable>
    );
    const slider = view.getByRole('slider', { name: 'Resize media' });
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
