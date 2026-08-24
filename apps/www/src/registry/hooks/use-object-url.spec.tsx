import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  mock,
} from 'bun:test';

import { render, waitFor } from '@testing-library/react';
import * as React from 'react';

import { useObjectUrl } from './use-object-url';

describe('useObjectUrl', () => {
  const createObjectURL = mock(() => '');
  const revokeObjectURL = mock();
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;
  let urlIndex = 0;

  beforeAll(() => {
    URL.createObjectURL = createObjectURL;
    URL.revokeObjectURL = revokeObjectURL;
  });

  beforeEach(() => {
    urlIndex = 0;
    createObjectURL.mockReset();
    createObjectURL.mockImplementation(() => `blob:test-${(urlIndex += 1)}`);
    revokeObjectURL.mockReset();
  });

  afterAll(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  it('replaces and releases the URL with its exact source lifetime', async () => {
    const Test = ({ source }: { source: Blob }) => {
      const url = useObjectUrl(source);

      return <output>{url}</output>;
    };
    const first = new Blob(['first']);
    const second = new Blob(['second']);
    const view = render(<Test source={first} />);

    await waitFor(() => expect(view.getByText('blob:test-1')).toBeTruthy());

    view.rerender(<Test source={second} />);
    await waitFor(() => expect(view.getByText('blob:test-2')).toBeTruthy());
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test-1');

    view.unmount();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test-2');
  });
});
