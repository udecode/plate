import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';

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
  const { sendBeacon } = navigator;
  const consoleError = console.error;
  const { addEventListener } = window;
  const leakedListeners: Array<[string, EventListenerOrEventListenerObject]> =
    [];

  beforeEach(() => {
    goTo('/docs/lint');
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
    console.error = consoleError;
    delete window.__driveReporter;
    Object.defineProperty(navigator, 'sendBeacon', {
      configurable: true,
      value: sendBeacon,
    });
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
