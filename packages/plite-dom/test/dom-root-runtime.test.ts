import { expect, mock, test } from 'bun:test';
import { JSDOM } from 'jsdom';
import { createEditor } from '@platejs/plite';

import {
  DOMRootRuntime,
  findEditorDOMRootRuntime,
  findDOMRootRuntime,
  isDOMSyncMutation,
  markDOMSyncMutationTarget,
} from '../src/internal';

const createHarness = () => {
  const dom = new JSDOM('<!doctype html><body></body>');
  const adapter = {};
  const editor = createEditor();
  const beforeRootTeardown = mock();
  const afterRootMount = mock();
  const onDestroy = mock();
  const onRepair = mock();
  const runtime = new DOMRootRuntime<HTMLDivElement>({
    adapter,
    afterRootMount,
    beforeRootTeardown,
    editor,
    getAndroidMutationHandler: () => null,
    isAndroidMutationOwned: () => false,
    isCanonicalTextMutation: () => false,
    isComposing: () => false,
    onDestroy,
    onRepair,
    resolvePath: () => null,
  });
  const createRoot = () => {
    const root = dom.window.document.createElement('div');

    root.setAttribute('data-plite-editor', 'true');
    dom.window.document.body.append(root);

    return root;
  };

  return {
    adapter,
    afterRootMount,
    beforeRootTeardown,
    createRoot,
    dom,
    editor,
    onDestroy,
    onRepair,
    runtime,
  };
};

test('DOM root runtime replaces frozen host facts with the root realm', () => {
  const firstRealm = new JSDOM('<!doctype html><body></body>');
  const secondRealm = new JSDOM('<!doctype html><body></body>');
  const editor = createEditor();
  const runtime = new DOMRootRuntime<HTMLDivElement>({
    adapter: {},
    editor,
    getAndroidMutationHandler: () => null,
    isAndroidMutationOwned: () => false,
    isCanonicalTextMutation: () => false,
    isComposing: () => false,
    onRepair: () => {},
    resolvePath: () => null,
  });
  const firstRoot = firstRealm.window.document.createElement('div');
  const secondRoot = secondRealm.window.document.createElement('div');

  Object.defineProperties(firstRealm.window.navigator, {
    language: { configurable: true, value: 'fr-BE' },
    platform: { configurable: true, value: 'MacIntel' },
    userAgent: {
      configurable: true,
      value:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15 Safari/605.1.15',
    },
  });
  Object.defineProperties(secondRealm.window.navigator, {
    language: { configurable: true, value: 'ko-KR' },
    platform: { configurable: true, value: 'Linux armv8l' },
    userAgent: {
      configurable: true,
      value:
        'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36',
    },
  });
  firstRoot.tabIndex = 0;
  secondRoot.tabIndex = 0;
  firstRealm.window.document.body.append(firstRoot);
  secondRealm.window.document.body.append(secondRoot);

  runtime.setRoot(firstRoot);
  runtime.connect();
  firstRoot.focus();

  expect(runtime.isAppleHost).toBe(true);
  expect(runtime.isWebKitHost).toBe(true);
  expect(runtime.hostLanguage).toBe('fr-BE');
  expect(findEditorDOMRootRuntime(editor)).toBe(runtime);

  runtime.setRoot(secondRoot);
  secondRoot.focus();

  expect(runtime.isAndroidHost).toBe(true);
  expect(runtime.isBlinkHost).toBe(true);
  expect(runtime.hostLanguage).toBe('ko-KR');
  expect(findEditorDOMRootRuntime(editor)).toBe(runtime);

  runtime.destroy();
  expect(findEditorDOMRootRuntime(editor)).toBeNull();
});

test('DOM root runtime accepts private frozen test facts', () => {
  const dom = new JSDOM('<!doctype html><body></body>');
  const runtime = new DOMRootRuntime<HTMLDivElement>({
    adapter: {},
    editor: createEditor(),
    getAndroidMutationHandler: () => null,
    isAndroidMutationOwned: () => false,
    isCanonicalTextMutation: () => false,
    isComposing: () => false,
    onRepair: () => {},
    resolvePath: () => null,
    testRootFacts: {
      beforeInput: true,
      engine: 'gecko',
      language: 'ja-JP',
      platform: 'apple',
    },
  });
  const root = dom.window.document.createElement('div');

  dom.window.document.body.append(root);
  runtime.setRoot(root);

  expect(runtime.isAppleHost).toBe(true);
  expect(runtime.isGeckoHost).toBe(true);
  expect(runtime.hostLanguage).toBe('ja-JP');
  expect(runtime.supportsBeforeInput).toBe(true);
});

test('DOM input runtime cancels frames, composition, and native repair on root replacement', () => {
  const harness = createHarness();
  const firstRoot = harness.createRoot();
  const secondRoot = harness.createRoot();

  firstRoot.setAttribute('data-plite-root', 'first');
  secondRoot.setAttribute('data-plite-root', 'second');
  harness.runtime.setRoot(firstRoot);
  harness.runtime.connect();

  const frame = harness.runtime.domInputRuntime.beginFrame({
    eventFamily: 'compositionstart',
    inputIntent: 'composition',
    modelSelectionBefore: null,
    selectionSource: 'composition-owned',
    targetOwner: 'editor',
  });

  harness.runtime.domInputRuntime.beginComposition();
  harness.runtime.domInputRuntime.recordCompositionText('あ');
  harness.runtime.domInputRuntime.setPendingCompositionEnd({
    phase: 'pending',
  });
  harness.runtime.domInputRuntime.nativeInputState.pendingInput = {
    data: 'あ',
    handled: false,
    inputType: 'insertCompositionText',
    target: null,
  };

  expect(frame.root).toBe('first');
  expect(harness.runtime.domInputRuntime.compositionSession).toEqual({
    modelCommitted: false,
    text: 'あ',
  });

  harness.runtime.setRoot(secondRoot);

  expect(harness.runtime.domInputRuntime.currentFrame()).toBeNull();
  expect(harness.runtime.domInputRuntime.compositionEpoch).toBeNull();
  expect(harness.runtime.domInputRuntime.getPendingCompositionEnd()).toBeNull();
  expect(
    harness.runtime.domInputRuntime.nativeInputState.pendingInput
  ).toBeNull();

  harness.runtime.destroy();
  harness.dom.window.close();
});

test('DOM input runtime keeps frame and epoch state isolated per mounted root', () => {
  const dom = new JSDOM('<!doctype html><body></body>');
  const editor = createEditor();
  const createRuntime = () =>
    new DOMRootRuntime<HTMLDivElement>({
      adapter: {},
      editor,
      getAndroidMutationHandler: () => null,
      isAndroidMutationOwned: () => false,
      isCanonicalTextMutation: () => false,
      isComposing: () => false,
      onRepair: () => {},
      resolvePath: () => null,
    });
  const first = createRuntime();
  const second = createRuntime();
  const firstRoot = dom.window.document.createElement('div');
  const secondRoot = dom.window.document.createElement('div');

  firstRoot.tabIndex = 0;
  secondRoot.tabIndex = 0;
  dom.window.document.body.append(firstRoot, secondRoot);
  first.setRoot(firstRoot);
  second.setRoot(secondRoot);
  first.connect();
  second.connect();
  first.domInputRuntime.beginComposition();
  first.domInputRuntime.beginFrame({
    eventFamily: 'compositionstart',
    modelSelectionBefore: null,
  });

  expect(second.domInputRuntime.compositionEpoch).toBeNull();
  expect(second.domInputRuntime.currentFrame()).toBeNull();

  firstRoot.focus();
  expect(DOMRootRuntime.resolveInputRuntime(editor)).toBe(
    first.domInputRuntime
  );
  secondRoot.focus();
  expect(DOMRootRuntime.resolveInputRuntime(editor)).toBe(
    second.domInputRuntime
  );

  first.destroy();
  second.destroy();
  dom.window.close();
});

test('DOM input runtime owns renderer-neutral event decisions', () => {
  expect(
    DOMRootRuntime.classifyBeforeInputIntent({
      inputType: 'insertFromComposition',
      internalTarget: false,
    })
  ).toBe('composition');
  expect(
    DOMRootRuntime.resolveInputSelectionPolicy({
      eventFamily: 'selectionchange',
      ownership: 'native-allowed',
      selectionSource: 'dom-current',
      targetOwner: 'editor',
    })
  ).toEqual({ kind: 'import-dom', reason: 'native-selection' });
  expect(
    DOMRootRuntime.resolveInputRepairPolicy('repair-caret-after-text-insert')
  ).toEqual({
    kind: 'repair-caret',
    reason: 'repair-caret-after-text-insert',
  });

  const inputRuntime = DOMRootRuntime.createDetachedInputRuntime();
  const keyDown = inputRuntime.prepareKeyDownDecision({
    authoritativeModelSelection: false,
    command: { kind: 'insert-break' },
    hasModelOnlySelection: false,
    hasProjectedViewSelection: false,
    intent: 'insert-break',
    internalTarget: false,
    selectionBefore: null,
    selectionSource: 'unknown',
    targetOwner: 'editor',
  });
  const beforeInput = inputRuntime.prepareBeforeInputDecision({
    authoritativeModelSelection: false,
    command: null,
    formatInput: true,
    hasProjectedViewSelection: false,
    intent: null,
    internalTarget: false,
    selectionBefore: null,
    selectionSource: 'unknown',
    targetOwner: 'editor',
  });
  const clipboard = inputRuntime.prepareClipboardDecision({
    intent: 'clipboard',
    internalTarget: false,
    selectionBefore: null,
    selectionSource: 'dom-current',
    targetOwner: 'editor',
  });
  const composition = inputRuntime.prepareCompositionDecision({
    intent: 'composition',
    internalTarget: false,
    selectionBefore: null,
    selectionSource: 'composition-owned',
    targetOwner: 'editor',
  });
  const focus = inputRuntime.prepareFocusMouseDecision({
    internalTarget: false,
    selectionBefore: null,
    selectionSource: 'dom-current',
    targetOwner: 'editor',
  });
  const input = inputRuntime.prepareInputDecision({
    intent: 'text-insert',
    internalTarget: false,
    selectionBefore: null,
    selectionSource: 'model-owned',
    targetOwner: 'editor',
  });

  expect([
    [keyDown.ownership, keyDown.selectionPolicy.kind, keyDown.stateBefore],
    [
      beforeInput.ownership,
      beforeInput.selectionPolicy.kind,
      beforeInput.stateBefore,
    ],
    [clipboard.ownership, null, clipboard.stateBefore],
    [
      composition.ownership,
      composition.selectionPolicy.kind,
      composition.stateBefore,
    ],
    [focus.ownership, null, focus.stateBefore],
    [input.ownership, null, input.stateBefore],
  ]).toEqual([
    ['model-owned', 'import-dom', 'idle'],
    ['app-owned', 'none', 'idle'],
    ['model-owned', null, 'dom-selection'],
    ['native-allowed', 'none', 'composition'],
    ['native-allowed', null, 'dom-selection'],
    ['model-owned', null, 'model-owned'],
  ]);
});

test('DOM input runtime owns one exact-once editing epoch per root', () => {
  const harness = createHarness();
  const root = harness.createRoot();
  const inputRuntime = harness.runtime.domInputRuntime;
  const command = { direction: 'backward', kind: 'delete' };

  harness.runtime.setRoot(root);
  harness.runtime.connect();
  const epoch = inputRuntime.beginCommandEditingEpoch({
    command,
    modelSelectionBefore: null,
    ownership: 'model-owned',
    rootEventFamily: 'keydown',
    rootIntent: 'delete',
    selectionSource: 'model-owned',
    targetOwner: 'editor',
  });
  const joined = inputRuntime.beginOrJoinCommandEditingEpoch({
    command,
    modelSelectionBefore: null,
    ownership: 'model-owned',
    rootEventFamily: 'beforeinput',
    rootIntent: 'delete',
    selectionSource: 'model-owned',
    targetOwner: 'editor',
  });

  expect(joined.id).toBe(epoch.id);
  inputRuntime.markCommandEditingEpochHandled(command);
  expect(inputRuntime.shouldSkipCommandEditingEpoch(command)).toBe(true);
  expect(inputRuntime.completeDuplicateCommandEditingEpoch(command)).toBe(true);
  expect(inputRuntime.currentEditingEpoch()?.active).toBe(false);

  harness.runtime.destroy();
  harness.dom.window.close();
});

test('DOM input runtime advances one composition epoch through final input', () => {
  const harness = createHarness();
  const root = harness.createRoot();
  const inputRuntime = harness.runtime.domInputRuntime;

  harness.runtime.setRoot(root);
  harness.runtime.connect();
  const started = inputRuntime.beginComposition();

  expect(started.phase).toBe('native-composing');
  inputRuntime.recordCompositionText('文');
  inputRuntime.markCompositionModelCommitted();
  expect(inputRuntime.compositionEpoch).toMatchObject({
    id: started.id,
    modelCommitted: true,
    owner: 'model',
    phase: 'model-composing',
    text: '文',
  });

  inputRuntime.settleComposition('insertFromComposition', 'model');
  expect(inputRuntime.compositionEpoch).toMatchObject({
    id: started.id,
    phase: 'final-input-ready',
    settledInputType: 'insertFromComposition',
  });
  inputRuntime.setCompositionPhase('committing');
  expect(inputRuntime.compositionEpoch?.phase).toBe('committing');

  harness.runtime.destroy();
  expect(inputRuntime.compositionEpoch).toBeNull();
  harness.dom.window.close();
});

test('DOM root runtime replaces one root atomically and invalidates old work', () => {
  const harness = createHarness();
  const firstRoot = harness.createRoot();
  const secondRoot = harness.createRoot();
  const firstChild = harness.dom.window.document.createElement('span');
  const secondChild = harness.dom.window.document.createElement('span');
  const staleWork = mock();
  const activeWork = mock();

  firstRoot.append(firstChild);
  secondRoot.append(secondChild);
  harness.runtime.setRoot(firstRoot);
  harness.runtime.connect();
  const firstGeneration = harness.runtime.generation;

  expect(findDOMRootRuntime(firstChild)).toBe(harness.runtime);
  harness.runtime.domPhaseScheduler.schedule(
    'dom-write',
    'old-root-work',
    staleWork,
    { delay: 10_000, timing: 'timeout' }
  );
  expect(harness.runtime.domPhaseScheduler.pending()).toBe(1);

  harness.runtime.setRoot(secondRoot);

  expect(harness.runtime.generation).toBe(firstGeneration + 1);
  expect(harness.runtime.domPhaseScheduler.pending()).toBe(0);
  expect(findDOMRootRuntime(firstChild)).toBeNull();
  expect(findDOMRootRuntime(secondChild)).toBe(harness.runtime);
  expect(staleWork).not.toHaveBeenCalled();

  harness.runtime.domPhaseScheduler.schedule(
    'dom-write',
    'active-root-work',
    activeWork,
    { timing: 'immediate' }
  );
  expect(activeWork).toHaveBeenCalledTimes(1);

  harness.runtime.destroy();
  expect(findDOMRootRuntime(secondChild)).toBeNull();
  harness.dom.window.close();
});

test('DOM root runtime cleanup is idempotent and reconnects its stable facade', () => {
  const harness = createHarness();
  const root = harness.createRoot();
  const dispose = mock();
  const scheduled = mock();
  const scheduler = harness.runtime.domPhaseScheduler;

  harness.runtime.setRoot(root);
  harness.runtime.connect();
  harness.runtime.installDisposable('root-listener', dispose);
  harness.runtime.destroy();
  const destroyedGeneration = harness.runtime.generation;
  const teardownCalls = harness.beforeRootTeardown.mock.calls.length;

  harness.runtime.destroy();

  expect(harness.runtime.generation).toBe(destroyedGeneration);
  expect(harness.beforeRootTeardown).toHaveBeenCalledTimes(teardownCalls);
  expect(dispose).toHaveBeenCalledTimes(1);
  expect(harness.onDestroy).toHaveBeenCalledTimes(1);
  expect(scheduler.pending()).toBe(0);

  harness.runtime.connect();
  expect(harness.runtime.domPhaseScheduler).toBe(scheduler);
  scheduler.schedule('model', 'reconnected-root', scheduled, {
    timing: 'immediate',
  });
  expect(scheduled).toHaveBeenCalledTimes(1);
  expect(findDOMRootRuntime(root)).toBe(harness.runtime);

  harness.runtime.destroy();
  expect(harness.onDestroy).toHaveBeenCalledTimes(2);
  harness.dom.window.close();
});

test('DOM root runtime rolls back a failed root activation', () => {
  const dom = new JSDOM('<!doctype html><body></body>');
  const editor = createEditor();
  const firstRoot = dom.window.document.createElement('div');
  const secondRoot = dom.window.document.createElement('div');
  const failure = new Error('root activation failed');
  const afterRootMount = mock((root: HTMLDivElement | null) => {
    if (root === secondRoot) throw failure;
  });
  const runtime = new DOMRootRuntime<HTMLDivElement>({
    adapter: {},
    afterRootMount,
    editor,
    getAndroidMutationHandler: () => null,
    isAndroidMutationOwned: () => false,
    isCanonicalTextMutation: () => false,
    isComposing: () => false,
    onRepair: () => {},
    resolvePath: () => null,
  });
  const scheduled = mock();

  firstRoot.setAttribute('data-plite-editor', 'true');
  secondRoot.setAttribute('data-plite-editor', 'true');
  dom.window.document.body.append(firstRoot, secondRoot);
  runtime.setRoot(firstRoot);
  runtime.connect();

  expect(() => runtime.setRoot(secondRoot)).toThrow(failure);
  expect(runtime.rootRef.current).toBe(firstRoot);
  expect(findDOMRootRuntime(firstRoot)).toBe(runtime);
  expect(findDOMRootRuntime(secondRoot)).toBeNull();

  runtime.domPhaseScheduler.schedule('model', 'rolled-back-root', scheduled, {
    timing: 'immediate',
  });
  expect(scheduled).toHaveBeenCalledTimes(1);

  runtime.destroy();
  dom.window.close();
});

test('DOM root runtime rejects a second active owner without displacing the first', () => {
  const first = createHarness();
  const root = first.createRoot();
  const second = new DOMRootRuntime<HTMLDivElement>({
    adapter: {},
    editor: createEditor(),
    getAndroidMutationHandler: () => null,
    isAndroidMutationOwned: () => false,
    isCanonicalTextMutation: () => false,
    isComposing: () => false,
    onRepair: () => {},
    resolvePath: () => null,
  });

  first.runtime.setRoot(root);
  first.runtime.connect();
  second.setRoot(root);

  expect(() => second.connect()).toThrow(
    'A DOM root cannot have more than one active runtime.'
  );
  expect(findDOMRootRuntime(root)).toBe(first.runtime);
  markDOMSyncMutationTarget(root, 'attributes', 'data-owner-proof');
  expect(
    isDOMSyncMutation({
      attributeName: 'data-owner-proof',
      target: root,
      type: 'attributes',
    } as MutationRecord)
  ).toBe(true);

  second.destroy();
  first.runtime.destroy();
  first.dom.window.close();
});

test('generated root lifecycle sequences never retain stale work or ownership', () => {
  const harness = createHarness();
  const roots = Array.from({ length: 4 }, () => harness.createRoot());

  for (let index = 0; index < 32; index++) {
    const currentRoot = roots[index % roots.length]!;
    const nextRoot = roots[(index + 1) % roots.length]!;
    const staleWork = mock();
    const beforeCurrentRoot = harness.runtime.rootRef.current;
    const beforeCurrentGeneration = harness.runtime.generation;

    harness.runtime.setRoot(currentRoot);
    expect(harness.runtime.generation).toBe(
      beforeCurrentGeneration + (beforeCurrentRoot === currentRoot ? 0 : 1)
    );
    harness.runtime.connect();
    harness.runtime.prepareHostCommit();
    currentRoot.setAttribute('data-host-commit', String(index));
    harness.runtime.completeHostCommit();
    harness.runtime.domPhaseScheduler.schedule(
      'selection-repair',
      `stale-root-${index}`,
      staleWork,
      { delay: 10_000, timing: 'timeout' }
    );

    const beforeNextGeneration = harness.runtime.generation;
    harness.runtime.setRoot(nextRoot);

    expect(harness.runtime.generation).toBe(beforeNextGeneration + 1);
    expect(staleWork).not.toHaveBeenCalled();
    expect(findDOMRootRuntime(currentRoot)).toBeNull();
    expect(findDOMRootRuntime(nextRoot)).toBe(harness.runtime);

    if (index % 4 === 0) {
      const beforeDestroyGeneration = harness.runtime.generation;

      harness.runtime.destroy();
      expect(harness.runtime.generation).toBe(beforeDestroyGeneration + 1);
      expect(findDOMRootRuntime(nextRoot)).toBeNull();
      harness.runtime.destroy();
      expect(harness.runtime.generation).toBe(beforeDestroyGeneration + 1);
    }
  }

  harness.runtime.destroy();
  harness.dom.window.close();
});
