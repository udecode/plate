import * as React from 'react';

import { fireEvent, render, waitFor } from '@testing-library/react';
import { afterAll, beforeEach, describe, expect, it, mock } from 'bun:test';

const fetchMock = mock();

Object.assign(globalThis, { fetch: fetchMock, React });

mock.module('@platejs/link/react', () => ({
  LinkPlugin: { name: 'link' },
}));

mock.module('platejs/react', () => ({
  PlateElement: ({
    attributes,
    children,
    className,
  }: React.PropsWithChildren<{
    attributes: React.ComponentProps<'a'>;
    className?: string;
  }>) => (
    <a {...attributes} className={className} data-testid="link">
      {children}
    </a>
  ),
}));

mock.module('@/components/ui/hover-card', () => ({
  HoverCard: ({
    children,
    onOpenChange,
    open,
  }: React.PropsWithChildren<{
    onOpenChange: (open: boolean) => void;
    open: boolean;
  }>) => (
    <div>
      <button data-testid="toggle" onClick={() => onOpenChange(!open)} />
      {children}
    </div>
  ),
  HoverCardContent: ({ children }: React.PropsWithChildren) => (
    <div data-testid="preview">{children}</div>
  ),
  HoverCardTrigger: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

mock.module('@/lib/utils', () => ({
  cn: (...values: Array<string | false | null | undefined>) =>
    values.filter(Boolean).join(' '),
}));

mock.module('@/registry/lib/suggestion', () => ({
  inlineSuggestionVariants: () => '',
}));

const editor = {
  id: 'editor-a',
  plugin: () => ({
    api: {
      getAttributes: (element: { url: string }) => ({ href: element.url }),
    },
  }),
};

const props = (url: string) =>
  ({
    attributes: {},
    children: 'Docs',
    editor,
    element: { children: [{ text: 'Docs' }], type: 'link', url },
  }) as any;

describe('LinkElement async preview', () => {
  beforeEach(() => {
    fetchMock.mockReset();
  });

  afterAll(() => {
    mock.restore();
  });

  it('aborts stale A to B to A requests and publishes only the newest result', async () => {
    const pending: Array<{
      resolve: (response: Response) => void;
      signal: AbortSignal;
    }> = [];

    fetchMock.mockImplementation(
      (_input: string, options: { signal: AbortSignal }) =>
        new Promise<Response>((resolve) => {
          pending.push({ resolve, signal: options.signal });
        })
    );

    const { LinkElement } = await import(
      `./link-node?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<LinkElement {...props('https://a.example')} />);

    fireEvent.click(view.getByTestId('toggle'));
    await waitFor(() => expect(pending).toHaveLength(1));

    view.rerender(<LinkElement {...props('https://b.example')} />);
    await waitFor(() => expect(pending).toHaveLength(2));
    expect(pending[0].signal.aborted).toBe(true);

    view.rerender(<LinkElement {...props('https://a.example')} />);
    await waitFor(() => expect(pending).toHaveLength(3));
    expect(pending[1].signal.aborted).toBe(true);

    pending[1].resolve(
      Response.json({
        description: null,
        site: 'b.example',
        title: 'Stale B',
        url: 'https://b.example',
      })
    );
    pending[2].resolve(
      Response.json({
        description: 'Current description',
        site: 'a.example',
        title: 'Current A',
        url: 'https://a.example',
      })
    );

    await waitFor(() =>
      expect(view.getByTestId('preview').textContent).toContain('Current A')
    );
    expect(view.getByTestId('preview').textContent).not.toContain('Stale B');
  });

  it('aborts on close and renders request errors without leaking rejection', async () => {
    let firstSignal: AbortSignal | undefined;

    fetchMock
      .mockImplementationOnce(
        (_input: string, options: { signal: AbortSignal }) => {
          firstSignal = options.signal;

          return new Promise<Response>(() => {});
        }
      )
      .mockResolvedValueOnce(
        Response.json({ error: 'Preview unavailable.' }, { status: 422 })
      );

    const { LinkElement } = await import(
      `./link-node?test=${Math.random().toString(36).slice(2)}`
    );
    const view = render(<LinkElement {...props('https://a.example')} />);

    fireEvent.click(view.getByTestId('toggle'));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    fireEvent.click(view.getByTestId('toggle'));
    expect(firstSignal?.aborted).toBe(true);

    fireEvent.click(view.getByTestId('toggle'));
    await waitFor(() =>
      expect(view.getByTestId('preview').textContent).toContain(
        'Preview unavailable.'
      )
    );
  });
});
