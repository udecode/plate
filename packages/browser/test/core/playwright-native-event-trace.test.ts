import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { GlobalRegistrator } from '@happy-dom/global-registrator';

import {
  resetSlateBrowserNativeEventTrace,
  startSlateBrowserNativeEventTrace,
  stopSlateBrowserNativeEventTrace,
  takeSlateBrowserNativeEventTrace,
} from '../../src/playwright';

const createRootLocator = (root: HTMLElement) =>
  ({
    evaluate: async <T, A>(
      callback: (root: HTMLElement, arg: A) => T,
      arg: A
    ) => callback(root, arg),
  }) as Parameters<typeof startSlateBrowserNativeEventTrace>[0];

const installEditorDOM = () => {
  document.body.innerHTML = `
    <div data-slate-editor="true">
      <span data-slate-node="text" data-slate-path="0,0">
        <span data-slate-string="true">hello</span>
      </span>
    </div>
  `;

  const root = document.querySelector<HTMLElement>('[data-slate-editor]')!;
  const text = document.querySelector('[data-slate-string]')!
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

    await startSlateBrowserNativeEventTrace(locator, {
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
        } as StaticRange,
      ],
    });

    text.data = 'hello!';
    selectTextOffset(text, 6);
    dispatchInputEvent(root, 'input', {
      data: '!',
      inputType: 'insertText',
    });

    const trace = await takeSlateBrowserNativeEventTrace(locator);

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

    await startSlateBrowserNativeEventTrace(locator, {
      events: ['beforeinput', 'input'],
    });

    text.data = 'hello!';
    selectTextOffset(text, 6);
    dispatchInputEvent(root, 'input', {
      data: '!',
      inputType: 'insertText',
    });

    const trace = await takeSlateBrowserNativeEventTrace(locator);

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

    await startSlateBrowserNativeEventTrace(locator, {
      events: ['beforeinput', 'input'],
    });
    dispatchInputEvent(root, 'beforeinput', {
      data: 'x',
      inputType: 'insertText',
    });

    expect(
      (await takeSlateBrowserNativeEventTrace(locator)).entries
    ).toHaveLength(1);

    await resetSlateBrowserNativeEventTrace(locator);
    expect((await takeSlateBrowserNativeEventTrace(locator)).entries).toEqual(
      []
    );

    await stopSlateBrowserNativeEventTrace(locator);
    dispatchInputEvent(root, 'beforeinput', {
      data: 'x',
      inputType: 'insertText',
    });

    expect((await takeSlateBrowserNativeEventTrace(locator)).entries).toEqual(
      []
    );
  });
});
