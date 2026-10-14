import { render } from '@testing-library/react';
import * as navigation from 'next/navigation';
import * as React from 'react';

import { installDriveReporter } from '@/lib/drive-reporter';

import { DriveBeacon } from './drive-beacon';

let pathname = '/docs/lint';

mock.module('next/navigation', () => ({
  ...navigation,
  usePathname: () => pathname,
}));

const { happyDOM } = window as unknown as {
  happyDOM: { setURL: (url: string) => void };
};
const goTo = (path: string) => {
  pathname = path;
  happyDOM.setURL(`http://localhost${path}`);
};

const resizeCallbacks = new Map<Element, () => void>();

class ResizeObserverStub {
  readonly callback: () => void;

  constructor(callback: () => void) {
    this.callback = callback;
  }

  disconnect() {}

  observe(element: Element) {
    resizeCallbacks.set(element, () => this.callback());
  }
}

const settle = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 400);
  });

function capturePosts() {
  const posted: string[] = [];
  Object.defineProperty(navigator, 'sendBeacon', {
    configurable: true,
    value: (_url: string, body: string) => {
      posted.push(body);
      return true;
    },
  });
  return posted;
}

describe('DriveBeacon', () => {
  const resizeObserver = window.ResizeObserver;
  const { sendBeacon } = navigator;
  const consoleError = console.error;
  const { addEventListener } = window;
  const leakedListeners: Array<[string, EventListenerOrEventListenerObject]> =
    [];

  beforeEach(() => {
    goTo('/docs/lint');
    Object.defineProperty(window, 'ResizeObserver', {
      configurable: true,
      value: ResizeObserverStub,
    });
    window.addEventListener = ((
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: AddEventListenerOptions | boolean
    ) => {
      leakedListeners.push([type, listener]);
      addEventListener.call(window, type, listener, options);
    }) as typeof window.addEventListener;
    installDriveReporter();
  });

  afterEach(() => {
    for (const [type, listener] of leakedListeners.splice(0)) {
      window.removeEventListener(type, listener);
    }
    window.addEventListener = addEventListener;
    resizeCallbacks.clear();
    console.error = consoleError;
    delete window.__driveReporter;
    Object.defineProperty(window, 'ResizeObserver', {
      configurable: true,
      value: resizeObserver,
    });
    Object.defineProperty(navigator, 'sendBeacon', {
      configurable: true,
      value: sendBeacon,
    });
  });

  it('posts a preview resize that fires no window event, as a drag released off its handle does', async () => {
    const posted = capturePosts();
    let width = 1280;
    const { container, unmount } = render(
      <div>
        <div data-preview-panel="lint-demo" />
        <DriveBeacon />
      </div>
    );
    const panel = container.querySelector('[data-preview-panel]')!;
    panel.getBoundingClientRect = () => ({ width }) as DOMRect;
    await settle();

    width = 375;
    resizeCallbacks.get(panel)?.();
    await settle();
    unmount();

    expect(JSON.parse(posted.at(-1)!).previews[0].width).toBe(375);
  });

  it('posts a visit after a client move', async () => {
    const posted = capturePosts();
    const { rerender, unmount } = render(<DriveBeacon />);
    await settle();

    goTo('/docs/other');
    rerender(<DriveBeacon />);
    await settle();
    unmount();

    expect(JSON.parse(posted.at(-1)!).path).toBe('/docs/other');
  });
});
