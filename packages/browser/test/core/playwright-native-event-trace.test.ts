import { afterAll, beforeAll, describe, expect, test } from 'bun:test';

import { GlobalRegistrator } from '@happy-dom/global-registrator';

import {
  resetPliteBrowserNativeEventTrace,
  startPliteBrowserNativeEventTrace,
  stopPliteBrowserNativeEventTrace,
  takePliteBrowserNativeEventTrace,
} from '../../src/playwright';

const createRootLocator = (root: HTMLElement) =>
  ({
    evaluate: async <T, A>(
      callback: (root: HTMLElement, arg: A) => T,
      arg: A
    ) => callback(root, arg),
  }) as Parameters<typeof startPliteBrowserNativeEventTrace>[0];

const installEditorDOM = () => {
  document.body.innerHTML = `
    <div data-plite-editor="true">
      <span data-plite-node="text" data-plite-path="0,0">
        <span data-plite-string="true">hello</span>
      </span>
    </div>
  `;

  const root = document.querySelector<HTMLElement>('[data-plite-editor]')!;
  const text = document.querySelector('[data-plite-string]')!
    .firstChild as Text;

  return { root, text };
};

const selectTextOffset = (text: Text, offset: number) => {
  const selection = window.getSelection()!;
  const range = document.createRange();

  range.setStart(text, offset);
  range.setEnd(text, offset);
  selection.removeAllRanges();
  selection.addRange(range);
};

const dispatchInputEvent = (
  root: HTMLElement,
  type: 'beforeinput' | 'input',
  init: InputEventInit & { targetRanges?: StaticRange[] } = {}
) => {
  const event = new InputEvent(type, {
    bubbles: true,
    composed: true,
    data: init.data,
    inputType: init.inputType,
  });

  if (init.targetRanges) {
    Object.defineProperty(event, 'getTargetRanges', {
      value: () => init.targetRanges,
    });
  }

  root.dispatchEvent(event);
};

describe('playwright native event trace', () => {
  beforeAll(() => {
    if (!GlobalRegistrator.isRegistered) {
      GlobalRegistrator.register();
    }
  });

  afterAll(async () => {
    if (GlobalRegistrator.isRegistered) {
      await GlobalRegistrator.unregister();
    }
  });

  test('captures beforeinput/input events with DOM text-node deltas', async () => {
    const { root, text } = installEditorDOM();
    const locator = createRootLocator(root);

    await startPliteBrowserNativeEventTrace(locator, {
      events: ['beforeinput', 'input'],
    });

    selectTextOffset(text, 5);
    dispatchInputEvent(root, 'beforeinput', {
      data: '!',
      inputType: 'insertText',
      targetRanges: [
        {
          collapsed: true,
          endContainer: text,
          endOffset: 5,
          startContainer: text,
          startOffset: 5,
        },
      ],
    });

    text.data = 'hello!';
    selectTextOffset(text, 6);
    dispatchInputEvent(root, 'input', {
      data: '!',
      inputType: 'insertText',
    });

    const trace = await takePliteBrowserNativeEventTrace(locator);

    expect(trace.anomalies).toEqual([]);
    expect(trace.entries.map((entry) => entry.type)).toEqual([
      'beforeinput',
      'input',
    ]);
    expect(trace.entries[0].targetRanges[0]).toMatchObject({
      collapsed: true,
      startOffset: 5,
      endOffset: 5,
    });
    expect(trace.entries[1].domDelta?.textNodes).toEqual([
      {
        before: expect.objectContaining({ text: 'hello' }),
        after: expect.objectContaining({ text: 'hello!' }),
        type: 'modified',
      },
    ]);
  });

  test('detects input without a matching beforeinput', async () => {
    const { root, text } = installEditorDOM();
    const locator = createRootLocator(root);

    await startPliteBrowserNativeEventTrace(locator, {
      events: ['beforeinput', 'input'],
    });

    text.data = 'hello!';
    selectTextOffset(text, 6);
    dispatchInputEvent(root, 'input', {
      data: '!',
      inputType: 'insertText',
    });

    const trace = await takePliteBrowserNativeEventTrace(locator);

    expect(trace.entries.map((entry) => entry.type)).toEqual(['input']);
    expect(trace.anomalies).toEqual([
      {
        detail: 'inputType=insertText',
        type: 'missing-beforeinput',
      },
    ]);
  });

  test('resets and stops native event traces', async () => {
    const { root } = installEditorDOM();
    const locator = createRootLocator(root);

    await startPliteBrowserNativeEventTrace(locator, {
      events: ['beforeinput', 'input'],
    });
    dispatchInputEvent(root, 'beforeinput', {
      data: 'x',
      inputType: 'insertText',
    });

    const firstTrace = await takePliteBrowserNativeEventTrace(locator);

    expect(firstTrace.entries).toHaveLength(1);

    await resetPliteBrowserNativeEventTrace(locator);
    const resetTrace = await takePliteBrowserNativeEventTrace(locator);

    expect(resetTrace.entries).toEqual([]);

    await stopPliteBrowserNativeEventTrace(locator);
    dispatchInputEvent(root, 'beforeinput', {
      data: 'x',
      inputType: 'insertText',
    });

    const stoppedTrace = await takePliteBrowserNativeEventTrace(locator);

    expect(stoppedTrace.entries).toEqual([]);
  });

  test('requires a positive integer native trace entry limit', async () => {
    const { root } = installEditorDOM();
    const locator = createRootLocator(root);

    for (const maxEntries of [
      0,
      -1,
      0.5,
      Number.POSITIVE_INFINITY,
      Number.NaN,
    ]) {
      await expect(
        startPliteBrowserNativeEventTrace(locator, { maxEntries })
      ).rejects.toThrow();
    }
  });

  test('keeps exactly the requested positive number of trace entries', async () => {
    const { root } = installEditorDOM();
    const locator = createRootLocator(root);

    await startPliteBrowserNativeEventTrace(locator, {
      events: ['beforeinput', 'input'],
      maxEntries: 1,
    });
    dispatchInputEvent(root, 'beforeinput', {
      data: 'a',
      inputType: 'insertText',
    });
    dispatchInputEvent(root, 'input', {
      data: 'a',
      inputType: 'insertText',
    });

    const trace = await takePliteBrowserNativeEventTrace(locator);

    expect(trace.entries).toEqual([expect.objectContaining({ type: 'input' })]);
  });
});
