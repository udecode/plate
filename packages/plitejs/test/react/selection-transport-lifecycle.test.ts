import { act, render } from '@testing-library/react';
import { createElement, startTransition, Suspense } from 'react';

import { EditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';
import { useEditableRootRef } from '../../src/react/editable/input-router';
import { createEditor } from '../../src/react/plugin/with-react';

const mountRuntime = (parent: HTMLElement | ShadowRoot = document.body) => {
  const root = parent.ownerDocument.createElement('div');
  const runtime = new EditableDOMRuntime({ editor: createEditor() });
  const schedule = Object.assign(vi.fn(), { cancel: vi.fn() });

  root.tabIndex = 0;
  root.textContent = 'native selection';
  parent.append(root);
  runtime.updateSelectionChangeHandlers({
    onDOMSelectionChange: Object.assign(vi.fn(), { cancel: vi.fn() }),
    scheduleOnDOMSelectionChange: schedule,
  });
  const disconnect = runtime.connect();
  runtime.setRoot(root);

  return {
    disconnect,
    root,
    runtime,
    schedule,
    destroy() {
      runtime.destroy();
      root.remove();
    },
  };
};

const selectRoot = (root: HTMLElement) => {
  root.focus();
  const text = root.firstChild!;
  const document = root.ownerDocument;

  document.getSelection()!.setBaseAndExtent(text, 1, text, 3);
  document.dispatchEvent(new document.defaultView!.Event('selectionchange'));
};

afterEach(() => vi.restoreAllMocks());

test.each([1, 10, 100])(
  'one Document transport schedules only the selected root among %s mounted roots',
  (count) => {
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');
    const roots = Array.from({ length: count }, () => mountRuntime());
    const selected = Math.floor(count / 2);

    try {
      expect(
        add.mock.calls.filter(([type]) => type === 'selectionchange')
      ).toHaveLength(1);

      selectRoot(roots[selected].root);

      roots.forEach(({ runtime, schedule }, index) => {
        expect(schedule).toHaveBeenCalledTimes(index === selected ? 1 : 0);
        expect(runtime.state.pendingDOMSelectionImport).toBe(
          index === selected
        );
      });
    } finally {
      roots.forEach((root) => root.destroy());
    }

    expect(
      remove.mock.calls.filter(([type]) => type === 'selectionchange')
    ).toHaveLength(1);
    document.dispatchEvent(new Event('selectionchange'));
    roots.forEach(({ schedule }, index) => {
      expect(schedule).toHaveBeenCalledTimes(index === selected ? 1 : 0);
    });
  }
);

test('focus transitions notify the prior root once and retire it after removal', () => {
  const roots = Array.from({ length: 3 }, () => mountRuntime());
  const outside = document.createElement('button');

  document.body.append(outside);

  try {
    selectRoot(roots[0].root);
    selectRoot(roots[1].root);
    expect(roots[0].schedule).toHaveBeenCalledTimes(2);
    expect(roots[1].schedule).toHaveBeenCalledTimes(1);
    expect(roots[2].schedule).not.toHaveBeenCalled();

    outside.focus();
    document.getSelection()!.removeAllRanges();
    document.dispatchEvent(new Event('selectionchange'));
    expect(roots[1].schedule).toHaveBeenCalledTimes(2);
    document.dispatchEvent(new Event('selectionchange'));
    expect(roots[1].schedule).toHaveBeenCalledTimes(2);

    selectRoot(roots[1].root);
    roots[1].destroy();
    selectRoot(roots[2].root);
    expect(roots[1].schedule).toHaveBeenCalledTimes(3);
    expect(roots[2].schedule).toHaveBeenCalledTimes(1);
  } finally {
    roots.forEach((root) => root.destroy());
    outside.remove();
  }
});

test('nested editors route selection to the deepest native owner', () => {
  const outer = mountRuntime();
  const inner = mountRuntime(outer.root);
  const sibling = mountRuntime();

  try {
    selectRoot(inner.root);
    expect(inner.schedule).toHaveBeenCalledTimes(1);
    expect(outer.schedule).not.toHaveBeenCalled();
    expect(sibling.schedule).not.toHaveBeenCalled();
  } finally {
    inner.destroy();
    outer.destroy();
    sibling.destroy();
  }
});

test.each(['open', 'closed'] as const)(
  'retargeted selection resolves a nested %s shadow root without broadcasting',
  (mode) => {
    const outerHost = document.createElement('div');

    document.body.append(outerHost);
    const outerShadow = outerHost.attachShadow({ mode });
    const innerHost = document.createElement('div');

    outerShadow.append(innerHost);
    const innerShadow = innerHost.attachShadow({ mode });
    const selected = mountRuntime(innerShadow);
    const sameShadow = mountRuntime(innerShadow);
    const outside = mountRuntime();

    // JSDOM does not expose a native Selection inside shadow trees.
    const retargetedSelection = document.getSelection()!;
    vi.spyOn(retargetedSelection, 'anchorNode', 'get').mockReturnValue(
      outerHost
    );
    vi.spyOn(retargetedSelection, 'focusNode', 'get').mockReturnValue(
      outerHost
    );
    vi.spyOn(document, 'getSelection').mockReturnValue(retargetedSelection);
    Object.defineProperty(outerShadow, 'getSelection', {
      value: () => ({ anchorNode: innerHost, focusNode: innerHost }),
    });
    Object.defineProperty(innerShadow, 'getSelection', {
      value: () => ({
        anchorNode: selected.root.firstChild,
        focusNode: selected.root.firstChild,
      }),
    });

    try {
      document.dispatchEvent(new Event('selectionchange'));
      expect(selected.schedule).toHaveBeenCalledTimes(1);
      expect(sameShadow.schedule).not.toHaveBeenCalled();
      expect(outside.schedule).not.toHaveBeenCalled();
    } finally {
      selected.destroy();
      sameShadow.destroy();
      outside.destroy();
      outerHost.remove();
    }
  }
);

test('root replacement transfers the transport to the new Document and uses the latest handler', () => {
  const main = mountRuntime();
  const frame = document.createElement('iframe');

  document.body.append(frame);
  const frameDocument = frame.contentDocument!;
  const addFrame = vi.spyOn(frameDocument, 'addEventListener');
  const removeMain = vi.spyOn(document, 'removeEventListener');
  const replacement = frameDocument.createElement('div');
  const latest = Object.assign(vi.fn(), { cancel: vi.fn() });

  replacement.tabIndex = 0;
  replacement.textContent = 'replacement root';
  frameDocument.body.append(replacement);

  try {
    main.runtime.setRoot(replacement);
    main.runtime.updateSelectionChangeHandlers({
      onDOMSelectionChange: Object.assign(vi.fn(), { cancel: vi.fn() }),
      scheduleOnDOMSelectionChange: latest,
    });
    expect(
      removeMain.mock.calls.filter(([type]) => type === 'selectionchange')
    ).toHaveLength(1);
    expect(
      addFrame.mock.calls.filter(([type]) => type === 'selectionchange')
    ).toHaveLength(1);

    document.dispatchEvent(new Event('selectionchange'));
    expect(main.schedule).not.toHaveBeenCalled();
    expect(latest).not.toHaveBeenCalled();

    selectRoot(replacement);
    expect(main.schedule).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledTimes(1);

    main.disconnect();
    frameDocument.dispatchEvent(
      new frameDocument.defaultView!.Event('selectionchange')
    );
    expect(latest).toHaveBeenCalledTimes(1);
    main.runtime.connect();
    selectRoot(replacement);
    expect(latest).toHaveBeenCalledTimes(2);
  } finally {
    main.destroy();
    frame.remove();
  }
});

test('an abandoned render cannot replace the committed selection handler', async () => {
  const mounted = mountRuntime();
  const committed = Object.assign(vi.fn(), { cancel: vi.fn() });
  const abandoned = Object.assign(vi.fn(), { cancel: vi.fn() });
  const latest = Object.assign(vi.fn(), { cancel: vi.fn() });
  const suspended = new Promise(() => {});

  function Handler({
    schedule,
    suspend = false,
  }: {
    schedule: typeof committed;
    suspend?: boolean;
  }) {
    useEditableRootRef({
      onDOMBeforeInput: vi.fn(),
      onDOMInput: vi.fn(),
      onDOMSelectionChange: committed,
      runtime: mounted.runtime,
      scheduleOnDOMSelectionChange: schedule,
    });
    if (suspend) throw suspended;

    return createElement('span', null, 'committed handler');
  }

  const tree = (schedule: typeof committed, suspend = false) =>
    createElement(
      Suspense,
      { fallback: 'loading' },
      createElement(Handler, { schedule, suspend })
    );
  const view = render(tree(committed));

  try {
    selectRoot(mounted.root);
    expect(committed).toHaveBeenCalledTimes(1);
    await act(async () => {
      startTransition(() => view.rerender(tree(abandoned, true)));
    });
    selectRoot(mounted.root);
    expect(committed).toHaveBeenCalledTimes(2);
    expect(abandoned).not.toHaveBeenCalled();

    view.rerender(tree(latest));
    selectRoot(mounted.root);
    expect(latest).toHaveBeenCalledTimes(1);
    expect(abandoned).not.toHaveBeenCalled();
  } finally {
    view.unmount();
    mounted.destroy();
  }
});
