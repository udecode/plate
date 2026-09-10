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

  it('releases every Strict Mode allocation when the source clears', async () => {
    const Test = ({ source }: { source: Blob | null }) => {
      const url = useObjectUrl(source);

      return <output data-testid="url">{url}</output>;
    };
    const view = render(
      <React.StrictMode>
        <Test source={new Blob(['preview'])} />
      </React.StrictMode>
    );

    await waitFor(() =>
      expect(view.getByTestId('url').textContent).toBeTruthy()
    );

    view.rerender(
      <React.StrictMode>
        <Test source={null} />
      </React.StrictMode>
    );

    expect(view.getByTestId('url').textContent).toBe('');
    view.unmount();

    const allocated = createObjectURL.mock.results.map(
      (result) => result.value
    );
    const revoked = revokeObjectURL.mock.calls.map(([url]) => url);

    expect(allocated.length).toBeGreaterThan(0);
    expect(revoked).toHaveLength(allocated.length);
    expect(new Set(revoked)).toEqual(new Set(allocated));
  });

  it('does not expose a revoked URL when the same Blob returns after clearing', () => {
    const revokedAtCommit: string[] = [];
    const Test = ({ source }: { source: Blob | null }) => {
      const url = useObjectUrl(source);

      React.useLayoutEffect(() => {
        if (
          url &&
          revokeObjectURL.mock.calls.some(([revoked]) => revoked === url)
        ) {
          revokedAtCommit.push(url);
        }
      }, [url]);

      return <output>{url}</output>;
    };
    const source = new Blob(['preview']);
    const view = render(<Test source={source} />);

    view.rerender(<Test source={null} />);
    view.rerender(<Test source={source} />);

    expect(revokedAtCommit).toEqual([]);
    view.unmount();
  });
});
