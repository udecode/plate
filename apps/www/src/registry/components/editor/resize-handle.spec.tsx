import { describe, expect, it, mock } from 'bun:test';

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { Resizable, ResizeHandle } from './resize-handle';

describe('ResizeHandle', () => {
  it('uses the copied alignment for pointer resize geometry', () => {
    const onResizeEnd = mock();
    const view = render(
      <Resizable align="left" onResizeEnd={onResizeEnd} width={300}>
        <ResizeHandle direction="right" />
      </Resizable>
    );
    const slider = view.getByRole('slider', { name: 'Resize media' });
    Object.defineProperty(slider.parentElement, 'offsetWidth', { value: 300 });
    Object.defineProperty(slider.parentElement!.parentElement, 'offsetWidth', {
      value: 700,
    });
    for (const [target, type, clientX] of [
      [slider, 'pointerdown', 100],
      [window, 'pointerup', 140],
    ] as const) {
      const event = new MouseEvent(type, {
        bubbles: true,
        cancelable: true,
        button: 0,
        clientX,
      });
      Object.defineProperties(event, {
        pointerId: { value: 1 },
        isPrimary: { value: true },
      });
      act(() => {
        target.dispatchEvent(event);
      });
    }
    expect(onResizeEnd.mock.calls).toEqual([[340]]);
  });

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
