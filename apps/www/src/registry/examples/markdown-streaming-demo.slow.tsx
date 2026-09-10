import { afterEach, describe, expect, it, jest, spyOn } from 'bun:test';

import { act, cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';

import { TooltipProvider } from '@/components/ui/tooltip';

(
  window as unknown as Window & { happyDOM: { setURL(url: string): void } }
).happyDOM.setURL('http://localhost:3000');
const { default: MarkdownStreamingDemo } =
  await import('./markdown-streaming-demo');

describe('Markdown playback lifetime', () => {
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  for (const mode of ['Plate', 'PlateStatic']) {
    it(`${mode} does not resume its pending chunk after unmount`, async () => {
      jest.useFakeTimers();
      const view = render(
        <TooltipProvider>
          <MarkdownStreamingDemo />
        </TooltipProvider>
      );
      if (mode === 'PlateStatic') {
        fireEvent.click(
          view.getByRole('button', {
            name: 'Switch to PlateStatic',
          })
        );
      }
      fireEvent.change(view.getByRole('combobox', { name: 'Playback speed' }), {
        target: { value: '200' },
      });
      const timers = spyOn(globalThis, 'setTimeout');
      fireEvent.click(view.getByRole('button', { name: 'Play' }));
      expect(
        view.getByRole('heading', {
          name: 'Transformed Chunks (1/33)',
        })
      ).toBeTruthy();
      const scheduled = () =>
        timers.mock.calls.filter(([, delay]) => delay === 200).length;
      expect(scheduled()).toBe(1);
      view.unmount();
      await act(async () => {
        jest.advanceTimersByTime(500);
      });
      expect(scheduled()).toBe(1);
    });
  }
});
