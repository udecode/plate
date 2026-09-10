import { DOMIntegrityObserver } from '../../src/dom/internal';
import {
  readDOMTextFlowPaint,
  releaseDOMTextFlowIndex,
  setDOMTextFlowRecordIndex,
} from '../../src/dom/plugin/dom-text-flow-index';

type ScheduledTask = {
  callback: () => void;
  cancelled: boolean;
  timing: 'animation-frame' | 'microtask';
};

const waitForMutations = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, 0);
  });

const createHarness = ({
  isCanonicalTextMutation = () => false,
  isAndroidMutationOwned = () => false,
  isComposing = () => false,
  isOwnedMutation = () => false,
  maxRepairPassesPerFrame,
  onRepair = () => {},
}: {
  isCanonicalTextMutation?: (mutation: MutationRecord) => boolean;
  isAndroidMutationOwned?: () => boolean;
  isComposing?: () => boolean;
  isOwnedMutation?: (mutation: MutationRecord) => boolean;
  maxRepairPassesPerFrame?: number;
  onRepair?: ConstructorParameters<typeof DOMIntegrityObserver>[0]['onRepair'];
} = {}) => {
  const androidMutations = vi.fn();
  const root = document.createElement('div');
  const tasks: ScheduledTask[] = [];
  const observer = new DOMIntegrityObserver({
    consumeOwnedMutation: isOwnedMutation,
    getAndroidMutationHandler: () => androidMutations,
    isAndroidMutationOwned,
    isCanonicalTextMutation,
    isComposing,
    ...(maxRepairPassesPerFrame === undefined
      ? {}
      : { maxRepairPassesPerFrame }),
    onRepair,
    resolvePath: (mutation) =>
      (mutation.target.nodeType === Node.ELEMENT_NODE
        ? (mutation.target as Element)
        : mutation.target.parentElement
      )
        ?.closest('[data-plite-path]')
        ?.getAttribute('data-plite-path') ?? null,
    schedule: (callback, options) => {
      const task = { callback, cancelled: false, timing: options.timing };

      tasks.push(task);

      return () => {
        task.cancelled = true;
      };
    },
  });

  root.setAttribute('contenteditable', 'true');
  root.setAttribute('data-plite-editor', 'true');
  document.body.append(root);
  observer.connect(root);

  const run = (timing: ScheduledTask['timing']) => {
    const index = tasks.findIndex(
      (task) => !task.cancelled && task.timing === timing
    );

    if (index === -1) return false;

    const [task] = tasks.splice(index, 1);

    task.callback();
    return true;
  };

  return { androidMutations, observer, root, run, tasks };
};

const mountRetainedFlow = (harness: ReturnType<typeof createHarness>) => {
  const host = document.createElement('span');
  const segments = ['abc', 'def'].map((text, index) => {
    const rootNode = document.createElement('span');
    const stringElement = document.createElement('span');
    const textNode = document.createTextNode(text);

    stringElement.setAttribute('data-plite-string', 'true');
    stringElement.append(textNode);
    rootNode.append(stringElement);
    host.append(rootNode);
    return {
      bindingHost: null,
      bindingRecord: null,
      domLength: text.length,
      end: (index + 1) * 3,
      rootNode,
      start: index * 3,
      stringElement,
      text,
      textNode,
    };
  });
  const record = { nodeKey: 'text', path: [0, 0], segments, text: 'abcdef' };

  harness.observer.runUnobserved(() => harness.root.append(host));
  setDOMTextFlowRecordIndex(host, record);
  const paint = readDOMTextFlowPaint(host);

  paint.markClean(record);
  return { host, paint, record, segments };
};

afterEach(() => {
  document.body.replaceChildren();
});

test('drains queued paint mutations before trusting an unchanged retained run', () => {
  const harness = createHarness();
  const flow = mountRetainedFlow(harness);

  expect(flow.paint.isClean(flow.segments[0])).toBe(true);
  flow.segments[0].rootNode.className = 'external';
  const paint = readDOMTextFlowPaint(flow.host);

  expect(paint.getDirtyRange(flow.record)).toEqual({ start: 0, end: 3 });
  expect(paint.isClean(flow.segments[0])).toBe(false);
  expect(paint.isClean(flow.segments[1])).toBe(true);
  expect(harness.observer.diagnostics().externalMutations).toBe(0);
  harness.observer.destroy();
});

test.each(['canonical', 'composition', 'android'] as const)(
  'retains paint dirtiness when %s input owns the text mutation',
  (owner) => {
    const harness = createHarness({
      isAndroidMutationOwned: () => owner === 'android',
      isCanonicalTextMutation: () => owner === 'canonical',
      isComposing: () => owner === 'composition',
    });
    const flow = mountRetainedFlow(harness);

    flow.segments[0].textNode.nodeValue = 'abcd';
    const paint = readDOMTextFlowPaint(flow.host);

    expect(paint.getDirtyRange(flow.record)).toEqual({ start: 0, end: 3 });
    expect(paint.isClean(flow.segments[0])).toBe(false);
    expect(paint.isClean(flow.segments[1])).toBe(true);
    expect(harness.observer.diagnostics().externalMutations).toBe(0);
    harness.observer.destroy();
  }
);

test('retains composition dirtiness when records are explicitly discarded', () => {
  const harness = createHarness();
  const flow = mountRetainedFlow(harness);

  harness.observer.runOwned('composition', () => {
    flow.segments[1].stringElement.append(document.createTextNode('g'));
  });
  const paint = readDOMTextFlowPaint(flow.host);

  expect(paint.isClean(flow.segments[0])).toBe(true);
  expect(paint.isClean(flow.segments[1])).toBe(false);
  expect(paint.getDirtyRange(flow.record)).toEqual({ start: 3, end: 6 });
  harness.observer.destroy();
});

test('keeps certified runtime writes clean while invalidating unknown subtree writes', () => {
  let owned = false;
  const harness = createHarness({ isOwnedMutation: () => owned });
  const flow = mountRetainedFlow(harness);

  owned = true;
  harness.observer.runOwned('scheduler', () => {
    flow.segments[0].rootNode.className = 'runtime';
  });
  owned = false;
  expect(readDOMTextFlowPaint(flow.host).isClean(flow.segments[0])).toBe(true);

  flow.host.className = 'unknown';
  const paint = readDOMTextFlowPaint(flow.host);

  expect(paint.getDirtyRange(flow.record)).toBeNull();
  expect(paint.isClean(flow.segments[0])).toBe(false);
  expect(paint.isClean(flow.segments[1])).toBe(false);
  harness.observer.destroy();
});

test('invalidates paint across unobserved commits, detached roots and destruction', () => {
  const harness = createHarness();
  const flow = mountRetainedFlow(harness);

  harness.observer.pauseForHostCommit();
  expect(flow.paint.isClean(flow.segments[0])).toBe(false);
  flow.segments[0].rootNode.className = 'react';
  harness.observer.resumeAfterHostCommit();
  let paint = readDOMTextFlowPaint(flow.host);

  expect(paint.getDirtyRange(flow.record)).toBeNull();
  paint.markClean(flow.record);
  expect(paint.isClean(flow.segments[0])).toBe(true);
  harness.root.remove();
  expect(readDOMTextFlowPaint(flow.host).isClean(flow.segments[0])).toBe(false);
  document.body.append(harness.root);
  paint = readDOMTextFlowPaint(flow.host);
  expect(paint.getDirtyRange(flow.record)).toBeNull();
  paint.markClean(flow.record);
  harness.observer.destroy();
  expect(paint.isClean(flow.segments[0])).toBe(false);
  paint = readDOMTextFlowPaint(flow.host);
  paint.markClean(flow.record);
  expect(paint.isClean(flow.segments[0])).toBe(false);
  releaseDOMTextFlowIndex(flow.host);
  expect(paint.isClean(flow.segments[0])).toBe(false);
});

test('isolates paint observations for sibling and nested editor roots', () => {
  const outer = createHarness();
  const nested = createHarness();
  const sibling = createHarness();

  outer.observer.runUnobserved(() => outer.root.append(nested.root));
  const outerFlow = mountRetainedFlow(outer);
  const nestedFlow = mountRetainedFlow(nested);
  const siblingFlow = mountRetainedFlow(sibling);
  const outerPaint = readDOMTextFlowPaint(outerFlow.host);

  outerPaint.markClean(outerFlow.record);
  nestedFlow.segments[0].rootNode.className = 'nested';
  readDOMTextFlowPaint(outerFlow.host);
  expect(outerPaint.isClean(outerFlow.segments[0])).toBe(true);
  expect(siblingFlow.paint.isClean(siblingFlow.segments[0])).toBe(true);
  expect(
    readDOMTextFlowPaint(nestedFlow.host).isClean(nestedFlow.segments[0])
  ).toBe(false);
  outer.observer.destroy();
  nested.observer.destroy();
  sibling.observer.destroy();
});

test('ignores runtime-owned, composition, canonical, and React commit mutations', async () => {
  let composing = false;
  let canonical = false;
  let androidOwned = false;
  let taggedOwned = false;
  const harness = createHarness({
    isCanonicalTextMutation: () => canonical,
    isAndroidMutationOwned: () => androidOwned,
    isComposing: () => composing,
    isOwnedMutation: () => taggedOwned,
  });
  const text = document.createTextNode('model');
  const rootChrome = document.createElement('span');

  harness.observer.pauseForHostCommit();
  harness.root.append(text);
  harness.observer.resumeAfterHostCommit();

  harness.observer.runOwned('scheduler', () => {
    harness.root.setAttribute('data-plite-runtime-write', 'true');
  });

  taggedOwned = true;
  harness.root.setAttribute('data-plite-tagged-write', 'true');
  await waitForMutations();
  taggedOwned = false;

  rootChrome.setAttribute('contenteditable', 'false');
  rootChrome.setAttribute('data-plite-root-chrome-ignore', 'true');
  harness.root.append(rootChrome);
  await waitForMutations();

  androidOwned = true;
  text.nodeValue = 'android';
  await waitForMutations();

  androidOwned = false;
  composing = true;
  text.nodeValue = 'composition';
  await waitForMutations();

  composing = false;
  canonical = true;
  text.nodeValue = 'model';
  await waitForMutations();

  harness.observer.pauseForHostCommit();
  harness.root.setAttribute('data-plite-react-write', 'true');
  harness.observer.resumeAfterHostCommit();
  await waitForMutations();

  expect(harness.tasks.filter((task) => !task.cancelled)).toHaveLength(0);
  expect(harness.androidMutations).toHaveBeenCalled();
  expect(harness.observer.diagnostics()).toMatchObject({
    externalMutations: 0,
    ignoredAndroidMutations: 1,
    ignoredCanonicalMutations: 1,
    ignoredCompositionMutations: 1,
    ignoredOwnedMutations: 3,
    repairedMutations: 0,
  });
  expect(harness.root.getAttribute('data-plite-runtime-write')).toBe('true');
  expect(harness.root.getAttribute('data-plite-tagged-write')).toBe('true');
  expect(harness.root.getAttribute('data-plite-react-write')).toBe('true');
  expect(harness.root.contains(rootChrome)).toBe(true);

  harness.observer.destroy();
});

test('does not observe a synchronous renderer-owned DOM batch', async () => {
  const onRepair =
    vi.fn<
      NonNullable<
        ConstructorParameters<typeof DOMIntegrityObserver>[0]['onRepair']
      >
    >();
  const harness = createHarness({ onRepair });

  harness.observer.runUnobserved(() => {
    const token = document.createElement('span');

    token.setAttribute('data-token', 'keyword');
    harness.root.append(token);
  });
  await waitForMutations();

  expect(onRepair).not.toHaveBeenCalled();
  expect(harness.tasks.filter((task) => !task.cancelled)).toHaveLength(0);
  expect(harness.root.querySelector('[data-token]')).not.toBeNull();

  harness.observer.destroy();
});

test('repairs external text, attribute, and child corruption without changing the model', async () => {
  const onRepair =
    vi.fn<
      NonNullable<
        ConstructorParameters<typeof DOMIntegrityObserver>[0]['onRepair']
      >
    >();
  const harness = createHarness({ onRepair });
  const paragraph = document.createElement('p');
  const textHost = document.createElement('span');
  const text = document.createTextNode('model');
  const rogue = document.createElement('aside');

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  textHost.append(text);
  paragraph.append(textHost);
  harness.observer.pauseForHostCommit();
  harness.root.append(paragraph);
  harness.observer.resumeAfterHostCommit();
  onRepair.mockClear();

  text.nodeValue = 'corrupt';
  paragraph.setAttribute('data-plite-path', 'corrupt');
  paragraph.remove();
  harness.root.append(rogue);
  await waitForMutations();

  expect(harness.run('microtask')).toBe(true);
  expect(text.nodeValue).toBe('model');
  expect(paragraph.hasAttribute('data-plite-path')).toBe(false);
  expect(harness.root.firstChild).toBe(paragraph);
  expect(harness.root.contains(rogue)).toBe(false);
  expect(onRepair).toHaveBeenCalledTimes(1);
  expect(onRepair.mock.calls[0][0].mutations.map(({ type }) => type)).toEqual([
    'characterData',
    'attributes',
    'childList',
    'childList',
  ]);
  expect(harness.observer.diagnostics()).toMatchObject({
    externalMutations: 4,
    repairedMutations: 4,
    repairPasses: 1,
  });

  harness.observer.destroy();
});

test('filters presentation attributes per record without dropping critical mutations in the same batch', async () => {
  const harness = createHarness();
  const textHost = document.createElement('span');
  const rogue = document.createElement('aside');

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  harness.observer.pauseForHostCommit();
  harness.root.append(textHost);
  harness.observer.resumeAfterHostCommit();

  textHost.className = 'application-state';
  textHost.setAttribute('aria-label', 'application label');
  textHost.setAttribute('data-plite-path', 'corrupt');
  harness.root.append(rogue);
  await waitForMutations();

  expect(harness.run('microtask')).toBe(true);
  expect(textHost.className).toBe('application-state');
  expect(textHost.getAttribute('aria-label')).toBe('application label');
  expect(textHost.getAttribute('data-plite-path')).toBe('0,0');
  expect(rogue.isConnected).toBe(false);
  const diagnostics = harness.observer.diagnostics();

  expect(diagnostics.externalMutations).toBeGreaterThanOrEqual(2);
  expect(diagnostics.repairedMutations).toBe(diagnostics.externalMutations);

  harness.observer.destroy();
});

test('adopts a queued DOM mutation when the model commit claims it before repair', async () => {
  let owned = false;
  const harness = createHarness({ isOwnedMutation: () => owned });
  const text = document.createTextNode('model');

  harness.observer.pauseForHostCommit();
  harness.root.append(text);
  harness.observer.resumeAfterHostCommit();

  text.nodeValue = 'native';
  await waitForMutations();
  owned = true;

  expect(harness.run('microtask')).toBe(true);
  expect(text.nodeValue).toBe('native');
  expect(harness.observer.diagnostics()).toMatchObject({
    externalMutations: 1,
    ignoredOwnedMutations: 1,
    repairedMutations: 0,
  });

  harness.observer.destroy();
});

test('preserves the DOM selection and requests authoritative model selection export', async () => {
  const onRepair =
    vi.fn<
      NonNullable<
        ConstructorParameters<typeof DOMIntegrityObserver>[0]['onRepair']
      >
    >();
  const harness = createHarness({ onRepair });
  const textHost = document.createElement('span');
  const text = document.createTextNode('hello');
  const selection = document.getSelection()!;
  const range = document.createRange();

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  textHost.append(text);
  harness.observer.pauseForHostCommit();
  harness.root.append(textHost);
  harness.observer.resumeAfterHostCommit();
  onRepair.mockClear();

  range.setStart(text, 3);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  text.insertData(5, '!');
  await waitForMutations();
  harness.run('microtask');

  expect(text.nodeValue).toBe('hello');
  expect(selection.anchorNode).toBe(text);
  expect(selection.anchorOffset).toBe(3);
  expect(onRepair).toHaveBeenCalledTimes(1);

  harness.observer.destroy();
});

test('unwraps unauthorized external wrappers around model text', async () => {
  const harness = createHarness();
  const textHost = document.createElement('span');
  const text = document.createTextNode('model');
  const wrapper = document.createElement('span');

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  textHost.append(text);
  harness.observer.pauseForHostCommit();
  harness.root.append(textHost);
  harness.observer.resumeAfterHostCommit();

  text.replaceWith(wrapper);
  wrapper.append(text);
  await waitForMutations();
  harness.run('microtask');

  expect(textHost.childNodes).toHaveLength(1);
  expect(textHost.firstChild).toBe(text);
  expect(text.parentNode).toBe(textHost);
  expect(wrapper.isConnected).toBe(false);
  const diagnostics = harness.observer.diagnostics();

  expect(diagnostics.externalMutations).toBeGreaterThanOrEqual(2);
  expect(diagnostics.repairedMutations).toBe(diagnostics.externalMutations);

  harness.observer.destroy();
});

test('repairs mounted content in read-only partial-DOM roots', async () => {
  const harness = createHarness();
  const boundary = document.createElement('section');
  const text = document.createTextNode('mounted');

  harness.observer.pauseForHostCommit();
  harness.root.setAttribute('contenteditable', 'false');
  boundary.setAttribute('data-plite-dom-coverage-boundary', 'true');
  boundary.append(text);
  harness.root.append(boundary);
  harness.observer.resumeAfterHostCommit();

  text.nodeValue = 'corrupt';
  boundary.setAttribute('data-plite-path', 'external');
  await waitForMutations();
  harness.run('microtask');

  expect(text.nodeValue).toBe('mounted');
  expect(boundary.hasAttribute('data-plite-path')).toBe(false);
  expect(harness.observer.diagnostics().repairedMutations).toBe(2);

  harness.observer.destroy();
});

test('observes roots mounted in shadow DOM without crossing the host', async () => {
  const harness = createHarness();
  const host = document.createElement('div');
  const shadowRoot = host.attachShadow({ mode: 'open' });
  const text = document.createTextNode('shadow model');

  document.body.append(host);
  shadowRoot.append(harness.root);
  harness.observer.setRoot(harness.root);
  harness.observer.pauseForHostCommit();
  harness.root.append(text);
  harness.observer.resumeAfterHostCommit();

  host.setAttribute('data-host-external', 'untouched');
  text.nodeValue = 'shadow corrupt';
  await waitForMutations();
  harness.run('microtask');

  expect(text.nodeValue).toBe('shadow model');
  expect(host.getAttribute('data-host-external')).toBe('untouched');
  expect(harness.observer.diagnostics().externalMutations).toBe(1);

  harness.observer.destroy();
});

test('isolates nested and sibling editable roots', async () => {
  const harness = createHarness();
  const owned = document.createElement('p');
  const nestedRoot = document.createElement('div');
  const nestedText = document.createTextNode('nested');
  const siblingRoot = document.createElement('div');

  nestedRoot.setAttribute('data-plite-editor', 'true');
  nestedRoot.append(nestedText);
  harness.observer.pauseForHostCommit();
  harness.root.append(owned, nestedRoot);
  siblingRoot.setAttribute('data-plite-editor', 'true');
  document.body.append(siblingRoot);
  harness.observer.resumeAfterHostCommit();

  nestedText.nodeValue = 'nested-corrupt';
  siblingRoot.setAttribute('data-plite-path', 'sibling');
  owned.setAttribute('data-plite-path', 'owned');
  await waitForMutations();
  harness.run('microtask');

  expect(nestedText.nodeValue).toBe('nested-corrupt');
  expect(siblingRoot.getAttribute('data-plite-path')).toBe('sibling');
  expect(owned.hasAttribute('data-plite-path')).toBe(false);
  expect(harness.observer.diagnostics().externalMutations).toBe(1);

  harness.observer.destroy();
});

test('disconnects old roots, remounts cleanly, and stops after destroy', async () => {
  const harness = createHarness();
  const replacement = document.createElement('div');

  replacement.setAttribute('data-plite-editor', 'true');
  document.body.append(replacement);
  harness.root.setAttribute('data-plite-path', 'old-root');
  await waitForMutations();
  harness.observer.setRoot(replacement);

  expect(harness.tasks.every((task) => task.cancelled)).toBe(true);

  replacement.setAttribute('data-plite-path', 'new-root');
  await waitForMutations();
  harness.run('microtask');

  expect(harness.root.getAttribute('data-plite-path')).toBe('old-root');
  expect(replacement.hasAttribute('data-plite-path')).toBe(false);

  harness.observer.destroy();
  replacement.setAttribute('data-after-destroy', 'external');
  await waitForMutations();

  expect(replacement.getAttribute('data-after-destroy')).toBe('external');
  expect(harness.tasks.filter((task) => !task.cancelled)).toHaveLength(0);
});

test('bounds hostile repair loops and defers further work to the next frame', async () => {
  let keepCorrupting = true;
  let repairs = 0;
  const text = document.createTextNode('model');
  const harness = createHarness({
    maxRepairPassesPerFrame: 2,
    onRepair: () => {
      repairs += 1;
      queueMicrotask(() => {
        if (keepCorrupting) text.nodeValue = `corrupt-${repairs}`;
      });
    },
  });

  harness.observer.pauseForHostCommit();
  harness.root.append(text);
  harness.observer.resumeAfterHostCommit();
  text.nodeValue = 'corrupt-0';
  await waitForMutations();
  harness.run('microtask');
  await waitForMutations();
  harness.run('microtask');
  await waitForMutations();

  expect(
    harness.tasks.some(
      (task) => !task.cancelled && task.timing === 'animation-frame'
    )
  ).toBe(true);
  expect(harness.observer.diagnostics()).toMatchObject({
    loopLimitHits: 1,
    maxObservedRepairPasses: 2,
    repairPasses: 2,
  });

  keepCorrupting = false;
  while (harness.run('animation-frame')) {
    // The frame first resets the budget, then runs the deferred repair.
  }

  expect(harness.observer.diagnostics().repairPasses).toBe(3);
  expect(harness.observer.diagnostics().maxObservedRepairPasses).toBe(2);

  harness.observer.destroy();
});
