import { afterEach, describe, expect, it } from 'bun:test';

import { cleanup, render } from '@testing-library/react';
import * as React from 'react';

afterEach(cleanup);

describe('FixedToolbar', () => {
  it('renders without an editor and forwards its ref', async () => {
    const { FixedToolbar } = await import('./fixed-toolbar');
    const ref = React.createRef<HTMLDivElement>();
    const view = render(<FixedToolbar ref={ref} data-testid="fixed-toolbar" />);
    const toolbar = view.getByTestId('fixed-toolbar') as HTMLDivElement;

    expect(ref.current).toBe(toolbar);
  });
});
