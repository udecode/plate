import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  mock,
  spyOn,
} from 'bun:test';

import * as cache from 'next/cache';
import * as React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';

import { DriveStamp } from '@/components/drive-stamp';

import { installDriveReporter } from './drive-reporter';

mock.module('next/cache', () => ({ ...cache, io: async () => {} }));

const { happyDOM } = window as unknown as {
  happyDOM: { setURL: (url: string) => void };
};
const goTo = (path: string) => happyDOM.setURL(`http://localhost${path}`);

const settle = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 400);
  });

const answer = (responseStatus: number) => {
  Object.defineProperty(performance, 'getEntriesByType', {
    configurable: true,
    value: (type: string) =>
      type === 'navigation'
        ? [{ name: 'http://localhost/docs/lint', responseStatus }]
        : [],
  });
};

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

const errorsOf = (body: string | undefined) =>
  JSON.parse(body!).errors as string[];

const runInlineScripts = (html: string) => {
  for (const [, source] of html.matchAll(/<script>(.*?)<\/script>/g)) {
    new Function(source)();
  }
};

describe('installDriveReporter', () => {
  const { sendBeacon } = navigator;
  const { getEntriesByType } = performance;
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
  });

  afterEach(() => {
    for (const [type, listener] of leakedListeners.splice(0)) {
      window.removeEventListener(type, listener);
    }
    console.error = consoleError;
    delete window.__driveReporter;
    delete window.__driveRendered;
    mock.restore();
    window.addEventListener = addEventListener;
    Object.defineProperty(performance, 'getEntriesByType', {
      configurable: true,
      value: getEntriesByType,
    });
    Object.defineProperty(navigator, 'sendBeacon', {
      configurable: true,
      value: sendBeacon,
    });
  });

  it('posts an error as the page throws it', () => {
    const posted = capturePosts();
    installDriveReporter();

    window.dispatchEvent(new ErrorEvent('error', { message: 'boom' }));

    expect(posted.map(errorsOf)).toContainEqual(['boom']);
  });

  it('carries a warning logged on another page of the same load into the visit after a client move back', () => {
    const posted = capturePosts();
    console.error = () => {};
    const reporter = installDriveReporter();
    goTo('/docs/other');
    console.error(new Error('warned on the other page'));
    goTo('/docs/lint');

    reporter.sendOnceParsed();

    expect(JSON.parse(posted.at(-1)!)).toMatchObject({
      errors: ['warned on the other page'],
      path: '/docs/lint',
    });
  });

  it('posts the time the page sent the visit', () => {
    const posted = capturePosts();
    const reporter = installDriveReporter();
    spyOn(Date, 'now').mockReturnValue(5000);

    reporter.sendOnceParsed();

    expect(JSON.parse(posted.at(-1)!).sent).toBe(5000);
  });

  it('formats a console.error the way the console prints it', () => {
    const posted = capturePosts();
    console.error = () => {};
    installDriveReporter();

    console.error('%cWarning%c: %s is %d', 'color: red', '', 'x', 5);

    expect(errorsOf(posted.at(-1))).toEqual(['Warning: x is 5']);
  });

  it('reports a rejection and a logged error', () => {
    const posted = capturePosts();
    console.error = () => {};
    installDriveReporter();

    window.dispatchEvent(
      Object.assign(new Event('unhandledrejection'), { reason: 'rejected' })
    );
    console.error(new Error('logged'));

    expect(errorsOf(posted.at(-1))).toEqual(['rejected', 'logged']);
  });

  it('reports a hydration mismatch React logs', async () => {
    const posted = capturePosts();
    console.error = () => {};
    installDriveReporter();
    const container = document.createElement('div');
    container.innerHTML = '<p data-side="server">probe</p>';
    document.body.append(container);

    const root = hydrateRoot(container, <p data-side="client">probe</p>);
    await settle();
    root.unmount();
    container.remove();

    expect(errorsOf(posted.at(-1))[0]).toStartWith(
      'A tree hydrated but some attributes'
    );
  });

  it('posts a page error that repeats once', () => {
    const posted = capturePosts();
    installDriveReporter();

    for (let i = 0; i < 1000; i++) {
      window.dispatchEvent(new ErrorEvent('error', { message: 'boom' }));
    }

    expect(
      posted.filter((body) => errorsOf(body).includes('boom'))
    ).toHaveLength(1);
  });

  it("keeps a visit with a very long page error under sendBeacon's 64 KiB limit", () => {
    const posted = capturePosts();
    installDriveReporter();

    window.dispatchEvent(
      new ErrorEvent('error', { message: 'x'.repeat(70_000) })
    );

    expect(new TextEncoder().encode(posted.at(-1)).length).toBeLessThan(65_536);
  });

  it("keeps a visit with many page errors under sendBeacon's 64 KiB limit", () => {
    const posted = capturePosts();
    const reporter = installDriveReporter();

    for (let i = 0; i < 1000; i++) {
      window.dispatchEvent(
        new ErrorEvent('error', { message: `${i} ${'x'.repeat(200)}` })
      );
    }
    reporter.sendOnceParsed();

    expect(new TextEncoder().encode(posted.at(-1)).length).toBeLessThan(65_536);
  });

  it('reports a document the server answered with an error status', () => {
    const posted = capturePosts();
    answer(500);

    installDriveReporter();

    expect(errorsOf(posted.at(-1))).toEqual(['the server answered 500']);
  });

  it("posts the render time the page's HTML set", async () => {
    const posted = capturePosts();
    const reporter = installDriveReporter();
    spyOn(Date, 'now').mockReturnValue(1000);
    runInlineScripts(renderToStaticMarkup(await DriveStamp()));
    mock.restore();

    reporter.sendOnceParsed();

    expect(posted.map((body) => JSON.parse(body).rendered)).toEqual([1000]);
  });
});
