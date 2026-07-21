import { DOMIntegrityObserver } from '../src/editable/dom-integrity-observer';

type ScheduledTask = {
  callback: () => void;
  cancelled: boolean;
  timing: 'animation-frame' | 'microtask';
};

const waitForMutations = () =>
  new Promise<void>((resolve) => {
    setTimeout(resolve);
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

    if (index < 0) return false;

    const [task] = tasks.splice(index, 1);

    task!.callback();
    return true;
  };

  return { androidMutations, observer, root, run, tasks };
};

afterEach(() => {
  document.body.replaceChildren();
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

  harness.observer.pauseForReactCommit();
  harness.root.append(text);
  harness.observer.resumeAfterReactCommit();

  harness.observer.runOwned('scheduler', () => {
    harness.root.setAttribute('data-runtime-write', 'true');
  });

  taggedOwned = true;
  harness.root.setAttribute('data-tagged-write', 'true');
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

  harness.observer.pauseForReactCommit();
  harness.root.setAttribute('data-react-write', 'true');
  harness.observer.resumeAfterReactCommit();
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
  expect(harness.root.getAttribute('data-runtime-write')).toBe('true');
  expect(harness.root.getAttribute('data-tagged-write')).toBe('true');
  expect(harness.root.getAttribute('data-react-write')).toBe('true');
  expect(harness.root.contains(rootChrome)).toBe(true);

  harness.observer.destroy();
});

test('repairs external text, attribute, and child corruption without changing the model', async () => {
  const onRepair = vi.fn();
  const harness = createHarness({ onRepair });
  const paragraph = document.createElement('p');
  const textHost = document.createElement('span');
  const text = document.createTextNode('model');
  const rogue = document.createElement('aside');

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  textHost.append(text);
  paragraph.append(textHost);
  harness.observer.pauseForReactCommit();
  harness.root.append(paragraph);
  harness.observer.resumeAfterReactCommit();
  onRepair.mockClear();

  text.nodeValue = 'corrupt';
  paragraph.setAttribute('data-corrupt', 'true');
  paragraph.remove();
  harness.root.append(rogue);
  await waitForMutations();

  expect(harness.run('microtask')).toBe(true);
  expect(text.nodeValue).toBe('model');
  expect(paragraph.hasAttribute('data-corrupt')).toBe(false);
  expect(harness.root.firstChild).toBe(paragraph);
  expect(harness.root.contains(rogue)).toBe(false);
  expect(onRepair).toHaveBeenCalledTimes(1);
  expect(onRepair.mock.calls[0]![0].mutations.map(({ type }) => type)).toEqual([
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

test('adopts a queued DOM mutation when the model commit claims it before repair', async () => {
  let owned = false;
  const harness = createHarness({ isOwnedMutation: () => owned });
  const text = document.createTextNode('model');

  harness.observer.pauseForReactCommit();
  harness.root.append(text);
  harness.observer.resumeAfterReactCommit();

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
  const onRepair = vi.fn();
  const harness = createHarness({ onRepair });
  const textHost = document.createElement('span');
  const text = document.createTextNode('hello');
  const selection = document.getSelection()!;
  const range = document.createRange();

  textHost.setAttribute('data-plite-node', 'text');
  textHost.setAttribute('data-plite-path', '0,0');
  textHost.append(text);
  harness.observer.pauseForReactCommit();
  harness.root.append(textHost);
  harness.observer.resumeAfterReactCommit();
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
  harness.observer.pauseForReactCommit();
  harness.root.append(textHost);
  harness.observer.resumeAfterReactCommit();

  text.replaceWith(wrapper);
  wrapper.append(text);
  await waitForMutations();
  harness.run('microtask');

  expect(textHost.childNodes).toHaveLength(1);
  expect(textHost.firstChild).toBe(text);
  expect(text.parentNode).toBe(textHost);
  expect(wrapper.isConnected).toBe(false);
  expect(harness.observer.diagnostics()).toMatchObject({
    externalMutations: 2,
    repairedMutations: 2,
  });

  harness.observer.destroy();
});

test('repairs mounted content in read-only partial-DOM roots', async () => {
  const harness = createHarness();
  const boundary = document.createElement('section');
  const text = document.createTextNode('mounted');

  harness.observer.pauseForReactCommit();
  harness.root.setAttribute('contenteditable', 'false');
  boundary.setAttribute('data-plite-dom-coverage-boundary', 'true');
  boundary.append(text);
  harness.root.append(boundary);
  harness.observer.resumeAfterReactCommit();

  text.nodeValue = 'corrupt';
  boundary.setAttribute('data-external', 'true');
  await waitForMutations();
  harness.run('microtask');

  expect(text.nodeValue).toBe('mounted');
  expect(boundary.hasAttribute('data-external')).toBe(false);
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
  harness.observer.pauseForReactCommit();
  harness.root.append(text);
  harness.observer.resumeAfterReactCommit();

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
  harness.observer.pauseForReactCommit();
  harness.root.append(owned, nestedRoot);
  siblingRoot.setAttribute('data-plite-editor', 'true');
  document.body.append(siblingRoot);
  harness.observer.resumeAfterReactCommit();

  nestedText.nodeValue = 'nested-corrupt';
  siblingRoot.setAttribute('data-external', 'sibling');
  owned.setAttribute('data-external', 'owned');
  await waitForMutations();
  harness.run('microtask');

  expect(nestedText.nodeValue).toBe('nested-corrupt');
  expect(siblingRoot.getAttribute('data-external')).toBe('sibling');
  expect(owned.hasAttribute('data-external')).toBe(false);
  expect(harness.observer.diagnostics().externalMutations).toBe(1);

  harness.observer.destroy();
});

test('disconnects old roots, remounts cleanly, and stops after destroy', async () => {
  const harness = createHarness();
  const replacement = document.createElement('div');

  replacement.setAttribute('data-plite-editor', 'true');
  document.body.append(replacement);
  harness.root.setAttribute('data-old-root', 'external');
  await waitForMutations();
  harness.observer.setRoot(replacement);

  expect(harness.tasks.every((task) => task.cancelled)).toBe(true);

  replacement.setAttribute('data-new-root', 'external');
  await waitForMutations();
  harness.run('microtask');

  expect(harness.root.getAttribute('data-old-root')).toBe('external');
  expect(replacement.hasAttribute('data-new-root')).toBe(false);

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

  harness.observer.pauseForReactCommit();
  harness.root.append(text);
  harness.observer.resumeAfterReactCommit();
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
