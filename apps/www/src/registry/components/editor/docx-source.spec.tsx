import { describe, expect, it, mock } from 'bun:test';

import { act, render } from '@testing-library/react';
import type { DocxSource } from 'platejs/docx/import';
import React from 'react';

import { DocxSourceProvider, useDocxSource } from './docx-source';

describe('DocxSourceProvider', () => {
  it('releases replaced, cleared, and unmounted sources once', () => {
    const firstDispose = mock();
    const secondDispose = mock();
    const thirdDispose = mock();
    const first = { dispose: firstDispose } as unknown as DocxSource;
    const second = { dispose: secondDispose } as unknown as DocxSource;
    const third = { dispose: thirdDispose } as unknown as DocxSource;
    let context: ReturnType<typeof useDocxSource> = null;
    const Consumer = () => {
      context = useDocxSource();

      return null;
    };
    const view = render(
      <DocxSourceProvider>
        <Consumer />
      </DocxSourceProvider>
    );

    act(() => context?.replaceSource(first));
    act(() => context?.replaceSource(second));
    expect(firstDispose).toHaveBeenCalledTimes(1);
    act(() => context?.replaceSource(null));
    expect(secondDispose).toHaveBeenCalledTimes(1);
    act(() => context?.replaceSource(third));
    view.unmount();
    expect(thirdDispose).toHaveBeenCalledTimes(1);
  });
});
