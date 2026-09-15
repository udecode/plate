import { expect, test } from 'bun:test';

import { JSDOM } from 'jsdom';
import { createEditor } from 'plitejs';

import { DOMRootRuntime, findDOMRootRuntime } from '../../src/dom/internal';

const createHarness = () => {
  const dom = new JSDOM('<!doctype html><body></body>');
  const root = dom.window.document.createElement('div');

  root.dataset.editor = 'true';
  root.innerHTML =
    '<span>alpha</span><div contenteditable="false">external</div><div data-editor-root-chrome-ignore="true">chrome</div>';
  dom.window.document.body.append(root);
  let repairs = 0;
  const runtime = new DOMRootRuntime({
    adapter: {},
    editor: createEditor(),
    getAndroidMutationHandler: () => null,
    isAndroidMutationOwned: () => false,
    isCanonicalTextMutation: () => true,
    isComposing: () => false,
    onRepair: () => {
      repairs += 1;
    },
    resolvePath: () => null,
  });

  runtime.setRoot(root);
  runtime.connect();
  let notifications = 0;
  let reads = 0;
  let measured = '';
  const unsubscribe = runtime.subscribeLayout(() => {
    notifications += 1;
    runtime.domPhaseScheduler.schedule(
      'dom-read',
      'layout-test-read',
      () => {
        reads += 1;
        measured = runtime.rootRef.current?.textContent ?? '';
      },
      { key: 'layout-test-read', timing: 'animation-frame' }
    );
  });
  const flush = async () => {
    await Promise.resolve();
    await Promise.resolve();
    runtime.domPhaseScheduler.flush();
    await Promise.resolve();
    runtime.domPhaseScheduler.flush();
  };

  return {
    cleanup() {
      unsubscribe();
      runtime.destroy();
      dom.window.close();
    },
    dom,
    flush,
    get measured() {
      return measured;
    },
    get notifications() {
      return notifications;
    },
    get reads() {
      return reads;
    },
    get repairs() {
      return repairs;
    },
    root,
    runtime,
    unsubscribe,
  };
};

test('root subtree layout changes publish before integrity filtering and coalesce reads', async () => {
  const harness = createHarness();

  try {
    harness.root.firstElementChild!.setAttribute('style', 'font-size: 40px');
    harness.root.firstChild!.firstChild!.nodeValue = 'changed';
    await harness.flush();

    expect(harness.notifications).toBe(1);
    expect(harness.reads).toBe(1);
    expect(harness.measured).toContain('changed');
    expect(harness.repairs).toBe(0);
  } finally {
    harness.cleanup();
  }
});

test('noneditable renderer content invalidates parent geometry', async () => {
  const harness = createHarness();

  try {
    harness.root.children[1].textContent = 'different wrapping';
    await harness.flush();

    expect(harness.reads).toBe(1);
    expect(harness.measured).toContain('different wrapping');
    expect(harness.repairs).toBe(0);
  } finally {
    harness.cleanup();
  }
});

test('owned, claimed, host and unobserved writes remain layout-visible', async () => {
  const harness = createHarness();
  const text = harness.root.firstChild!.firstChild!;

  try {
    harness.runtime.runOwnedDOMMutation('scheduler', () => {
      text.nodeValue = 'owned';
    });
    await harness.flush();
    expect(harness.measured).toContain('owned');

    text.nodeValue = 'claimed';
    harness.runtime.claimHostCommit();
    await harness.flush();
    expect(harness.measured).toContain('claimed');

    harness.runtime.prepareHostCommit();
    text.nodeValue = 'host';
    harness.runtime.completeHostCommit();
    await harness.flush();
    expect(harness.measured).toContain('host');

    harness.runtime.runUnobservedDOMMutation(() => {
      text.nodeValue = 'unobserved';
    });
    await harness.flush();
    expect(harness.measured).toContain('unobserved');
    expect(harness.reads).toBe(4);
    expect(harness.repairs).toBe(0);
  } finally {
    harness.cleanup();
  }
});

test('root chrome changes do not feed geometry back into itself', async () => {
  const harness = createHarness();

  try {
    harness.root.children[2].setAttribute('style', 'left: 20px');
    harness.root.children[2].textContent = 'overlay moved';
    await harness.flush();

    expect(harness.notifications).toBe(0);
  } finally {
    harness.cleanup();
  }
});

test('integrity repair completes before the scheduled layout read', async () => {
  const harness = createHarness();

  try {
    const unauthorized = harness.dom.window.document.createElement('p');

    unauthorized.textContent = 'intruder';
    harness.root.append(unauthorized);
    await harness.flush();

    expect(harness.repairs).toBe(1);
    expect(harness.measured).not.toContain('intruder');
    expect(harness.runtime.domPhaseScheduler.pending()).toBe(0);
  } finally {
    harness.cleanup();
  }
});

test('root replacement retires old records and layout subscriptions', async () => {
  const harness = createHarness();
  const next = harness.dom.window.document.createElement('div');

  next.dataset.editor = 'true';
  next.textContent = 'new root';
  harness.dom.window.document.body.append(next);
  try {
    harness.root.firstElementChild!.setAttribute('style', 'font-size: 50px');
    harness.runtime.setRoot(next);
    expect(findDOMRootRuntime(harness.root)).toBeNull();
    expect(findDOMRootRuntime(next)).toBe(harness.runtime);
    await harness.flush();
    expect(harness.reads).toBe(0);

    next.setAttribute('style', 'font-size: 20px');
    await harness.flush();
    expect(harness.reads).toBe(1);
    expect(harness.measured).toBe('new root');

    harness.unsubscribe();
    next.setAttribute('style', 'font-size: 30px');
    await harness.flush();
    expect(harness.reads).toBe(1);
    harness.runtime.destroy();
    next.textContent = 'retired';
    await harness.flush();
    expect(harness.reads).toBe(1);
  } finally {
    harness.cleanup();
  }
});
