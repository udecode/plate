import { expect, it } from 'bun:test';

import { act, fireEvent, render, waitFor } from '@testing-library/react';
import * as React from 'react';

import {
  adapter,
  Assembly,
  controlledFetch,
  makeEditor,
} from './ai.lifecycle-test-support';

it('keeps idle Escape native and stops a request from its editor shortcut', async () => {
  const http = controlledFetch();
  const editor = makeEditor();
  const view = render(<Assembly editor={editor} />);
  let pending: Promise<void> | undefined;
  try {
    const editable = view.getByTestId('view-0');
    act(() => editor.api.dom.focus());
    expect(
      fireEvent.keyDown(editable, {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        which: 27,
      })
    ).toBe(true);
    await act(async () => {
      pending = adapter(editor).sendMessage('Draft');
    });
    await waitFor(() => expect(http.requests.length).toBe(1));
    expect(http.requests[0].signal?.aborted).toBe(false);
    expect(
      fireEvent.keyDown(editable, {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        which: 27,
      })
    ).toBe(false);
    await waitFor(() => expect(http.requests[0].signal?.aborted).toBe(true));
  } finally {
    await act(async () => {
      view.unmount();
      http.requests.forEach((request) => request.close());
      await pending;
    });
    http.restore();
  }
});
