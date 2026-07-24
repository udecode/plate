export type DOMIntegrityMutationOwner = 'composition' | 'host' | 'scheduler';

export type DOMIntegrityMutationEvidence = Readonly<{
  path: string | null;
  type: MutationRecord['type'];
}>;

export type DOMIntegrityRepairEvidence = Readonly<{
  mutations: readonly DOMIntegrityMutationEvidence[];
  root: HTMLElement;
}>;

export type DOMIntegrityDiagnostics = Readonly<{
  externalMutations: number;
  ignoredAndroidMutations: number;
  ignoredCanonicalMutations: number;
  ignoredCompositionMutations: number;
  ignoredOwnedMutations: number;
  lastRepair: readonly DOMIntegrityMutationEvidence[];
  loopLimitHits: number;
  maxObservedRepairPasses: number;
  repairPasses: number;
  repairedMutations: number;
}>;

type ScheduleDOMIntegrityTask = (
  callback: () => void,
  options: {
    key: string;
    timing: 'animation-frame' | 'microtask';
  }
) => () => void;

export type DOMIntegrityObserverOptions = {
  consumeOwnedMutation: (mutation: MutationRecord) => boolean;
  getAndroidMutationHandler: () =>
    | ((mutations: MutationRecord[]) => void)
    | null;
  isAndroidMutationOwned: () => boolean;
  isCanonicalTextMutation: (mutation: MutationRecord) => boolean;
  isComposing: () => boolean;
  maxRepairPassesPerFrame?: number;
  onRepair: (evidence: DOMIntegrityRepairEvidence) => void;
  resolvePath: (mutation: MutationRecord) => string | null;
  schedule: ScheduleDOMIntegrityTask;
};

type MutableDiagnostics = {
  -readonly [K in keyof DOMIntegrityDiagnostics]: K extends 'lastRepair'
    ? DOMIntegrityMutationEvidence[]
    : DOMIntegrityDiagnostics[K];
};

const OBSERVER_OPTIONS: MutationObserverInit = {
  attributeOldValue: true,
  attributes: true,
  characterData: true,
  characterDataOldValue: true,
  childList: true,
  subtree: true,
};

const REPAIR_TASK_KEY = 'dom-integrity-repair';
const REPAIR_PASS_RESET_TASK_KEY = 'dom-integrity-repair-pass-reset';
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;

const isElement = (node: Node): node is Element =>
  node.nodeType === ELEMENT_NODE;

const closestElement = (node: Node) =>
  isElement(node) ? node : node.parentElement;

const isInsideOwnedRoot = (
  root: HTMLElement,
  mutation: MutationRecord,
  batch: MutationRecord[],
  seen = new Set<MutationRecord>()
): boolean => {
  if (seen.has(mutation)) return false;
  seen.add(mutation);
  const targetElement = closestElement(mutation.target);
  const nonEditableOwner = targetElement?.closest('[contenteditable="false"]');

  if (nonEditableOwner && nonEditableOwner !== root) return false;

  const nestedRoot = targetElement?.closest<HTMLElement>('[data-plite-editor]');

  if (nestedRoot && nestedRoot !== root) return false;

  if (mutation.target === root || root.contains(mutation.target)) return true;

  const parentMutation = batch.find((candidate) => {
    if (candidate === mutation || candidate.type !== 'childList') return false;

    return [...candidate.addedNodes, ...candidate.removedNodes].some(
      (node) => node === mutation.target || node.contains(mutation.target)
    );
  });

  return parentMutation
    ? isInsideOwnedRoot(root, parentMutation, batch, seen)
    : false;
};

const isRootChromeNode = (node: Node) =>
  !!closestElement(node)?.closest('[data-plite-root-chrome-ignore="true"]');

const isRootChromeMutation = (mutation: MutationRecord) => {
  if (isRootChromeNode(mutation.target)) return true;
  if (mutation.type !== 'childList') return false;

  const changedNodes = [...mutation.addedNodes, ...mutation.removedNodes];

  return changedNodes.length > 0 && changedNodes.every(isRootChromeNode);
};

const captureSelection = (root: HTMLElement) => {
  const selection = root.ownerDocument.getSelection();
  const anchorNode = selection?.anchorNode ?? null;
  const focusNode = selection?.focusNode ?? null;

  if (
    !selection ||
    !anchorNode ||
    !focusNode ||
    !root.contains(anchorNode) ||
    !root.contains(focusNode)
  ) {
    return null;
  }

  return {
    anchorNode,
    anchorOffset: selection.anchorOffset,
    focusNode,
    focusOffset: selection.focusOffset,
  };
};

const maxOffset = (node: Node) =>
  node.nodeType === TEXT_NODE
    ? (node.nodeValue?.length ?? 0)
    : node.childNodes.length;

const restoreSelection = (
  root: HTMLElement,
  snapshot: ReturnType<typeof captureSelection>
) => {
  if (
    !snapshot ||
    !root.contains(snapshot.anchorNode) ||
    !root.contains(snapshot.focusNode)
  ) {
    return;
  }

  try {
    root.ownerDocument
      .getSelection()
      ?.setBaseAndExtent(
        snapshot.anchorNode,
        Math.min(snapshot.anchorOffset, maxOffset(snapshot.anchorNode)),
        snapshot.focusNode,
        Math.min(snapshot.focusOffset, maxOffset(snapshot.focusNode))
      );
  } catch {
    // The model selection export below remains authoritative when a browser
    // invalidates a DOM endpoint while repairing a removed subtree.
  }
};

const restoreMutation = (mutation: MutationRecord) => {
  if (mutation.type === 'characterData') {
    mutation.target.nodeValue = mutation.oldValue;
    return;
  }

  if (mutation.type === 'attributes') {
    if (!isElement(mutation.target) || !mutation.attributeName) return;

    if (mutation.oldValue === null) {
      mutation.target.removeAttributeNS(
        mutation.attributeNamespace,
        mutation.attributeName
      );
    } else if (mutation.attributeNamespace) {
      mutation.target.setAttributeNS(
        mutation.attributeNamespace,
        mutation.attributeName,
        mutation.oldValue
      );
    } else {
      mutation.target.setAttribute(mutation.attributeName, mutation.oldValue);
    }
    return;
  }

  for (const node of mutation.removedNodes) {
    if (node.parentNode === mutation.target) continue;

    mutation.target.insertBefore(
      node,
      mutation.nextSibling?.parentNode === mutation.target
        ? mutation.nextSibling
        : null
    );
  }

  for (const node of mutation.addedNodes) {
    if (node.parentNode === mutation.target) {
      mutation.target.removeChild(node);
    }
  }
};

export class DOMIntegrityObserver {
  private cancelRepairPassReset: (() => void) | null = null;

  private cancelScheduledRepair: (() => void) | null = null;

  private connected = false;

  private readonly diagnosticsValue: MutableDiagnostics = {
    externalMutations: 0,
    ignoredAndroidMutations: 0,
    ignoredCanonicalMutations: 0,
    ignoredCompositionMutations: 0,
    ignoredOwnedMutations: 0,
    lastRepair: [],
    loopLimitHits: 0,
    maxObservedRepairPasses: 0,
    repairPasses: 0,
    repairedMutations: 0,
  };

  private deferredHostCommitEvidence: DOMIntegrityMutationEvidence[] = [];

  private observer: MutationObserver | null = null;

  private readonly options: Required<
    Pick<DOMIntegrityObserverOptions, 'maxRepairPassesPerFrame'>
  > &
    Omit<DOMIntegrityObserverOptions, 'maxRepairPassesPerFrame'>;

  private pendingMutations: MutationRecord[] = [];

  private hostCommitPaused = false;

  private repairPassesInFrame = 0;

  private repairPassResetScheduled = false;

  private repairScheduled = false;

  private root: HTMLElement | null = null;

  constructor(options: DOMIntegrityObserverOptions) {
    this.options = {
      ...options,
      maxRepairPassesPerFrame: options.maxRepairPassesPerFrame ?? 3,
    };

    if (this.options.maxRepairPassesPerFrame < 1) {
      throw new RangeError(
        'DOM integrity maxRepairPassesPerFrame must be at least 1.'
      );
    }
  }

  connect(root: HTMLElement | null) {
    this.connected = true;
    this.setRoot(root);
  }

  destroy() {
    this.connected = false;
    this.observer?.disconnect();
    this.observer = null;
    this.root = null;
    this.pendingMutations = [];
    this.deferredHostCommitEvidence = [];
    this.cancelRepairPassReset?.();
    this.cancelRepairPassReset = null;
    this.cancelScheduledRepair?.();
    this.cancelScheduledRepair = null;
    this.repairScheduled = false;
    this.repairPassesInFrame = 0;
    this.repairPassResetScheduled = false;
    this.hostCommitPaused = false;
  }

  diagnostics(): DOMIntegrityDiagnostics {
    return Object.freeze({
      ...this.diagnosticsValue,
      lastRepair: Object.freeze([...this.diagnosticsValue.lastRepair]),
    });
  }

  discardPending(owner: DOMIntegrityMutationOwner) {
    const records = this.observer?.takeRecords() ?? [];

    if (records.length === 0) return;

    for (const mutation of records) {
      this.options.consumeOwnedMutation(mutation);
    }

    if (owner === 'composition') {
      this.options.getAndroidMutationHandler()?.(records);
      this.diagnosticsValue.ignoredCompositionMutations += records.length;
      return;
    }

    this.diagnosticsValue.ignoredOwnedMutations += records.length;
  }

  pauseForHostCommit() {
    this.flushRecords();
    this.repairNow(false);
    this.observer?.disconnect();
    this.hostCommitPaused = true;
  }

  resumeAfterHostCommit() {
    const wasPaused = this.hostCommitPaused;

    this.hostCommitPaused = false;
    if (!this.connected || !this.root) return;

    if (wasPaused || !this.observer) this.observe();
    if (this.deferredHostCommitEvidence.length > 0) {
      const mutations = this.deferredHostCommitEvidence.splice(0);

      this.options.onRepair({ mutations, root: this.root });
    }
  }

  runOwned<T>(owner: DOMIntegrityMutationOwner, callback: () => T): T {
    if (owner === 'composition') {
      this.discardPending(owner);
    } else {
      this.flushRecords();
      this.repairNow();
    }

    try {
      return callback();
    } finally {
      this.discardPending(owner);
    }
  }

  setRoot(root: HTMLElement | null) {
    if (this.root === root && this.observer) return;

    this.observer?.disconnect();
    this.observer = null;
    this.pendingMutations = [];
    this.deferredHostCommitEvidence = [];
    this.cancelRepairPassReset?.();
    this.cancelRepairPassReset = null;
    this.cancelScheduledRepair?.();
    this.cancelScheduledRepair = null;
    this.repairScheduled = false;
    this.repairPassesInFrame = 0;
    this.repairPassResetScheduled = false;
    this.root = root;

    if (this.connected && root && !this.hostCommitPaused) this.observe();
  }

  private flushRecords() {
    const records = this.observer?.takeRecords() ?? [];

    if (records.length > 0) this.handleMutations(records);
  }

  private readonly handleMutations = (records: MutationRecord[]) => {
    const root = this.root;

    if (!root || records.length === 0) return;

    const androidMutationHandler = this.options.getAndroidMutationHandler();
    const androidOwnsMutations = this.options.isAndroidMutationOwned();

    androidMutationHandler?.(records);

    const tracked = records.filter((mutation) =>
      isInsideOwnedRoot(root, mutation, records)
    );

    if (tracked.length === 0) return;

    const unauthorized = tracked.filter((mutation) => {
      if (
        isRootChromeMutation(mutation) ||
        this.options.consumeOwnedMutation(mutation)
      ) {
        this.diagnosticsValue.ignoredOwnedMutations += 1;
        return false;
      }

      return true;
    });

    if (unauthorized.length === 0) return;

    if (this.options.isComposing()) {
      this.diagnosticsValue.ignoredCompositionMutations += unauthorized.length;
      return;
    }

    if (androidOwnsMutations) {
      this.diagnosticsValue.ignoredAndroidMutations += unauthorized.length;
      return;
    }

    const external = unauthorized.filter((mutation) => {
      if (
        mutation.type === 'characterData' &&
        this.options.isCanonicalTextMutation(mutation)
      ) {
        this.diagnosticsValue.ignoredCanonicalMutations += 1;
        return false;
      }

      return true;
    });

    if (external.length === 0) return;

    this.diagnosticsValue.externalMutations += external.length;
    this.pendingMutations.push(...external);
    this.scheduleRepair();
  };

  private observe() {
    const root = this.root;
    const MutationObserverConstructor =
      root?.ownerDocument.defaultView?.MutationObserver;

    if (!root || !MutationObserverConstructor) return;

    this.observer ??= new MutationObserverConstructor(this.handleMutations);
    this.observer.observe(root, OBSERVER_OPTIONS);
  }

  private repairNow(notify = true) {
    const root = this.root;

    if (!root || this.pendingMutations.length === 0) return;

    this.cancelScheduledRepair?.();
    this.cancelScheduledRepair = null;
    this.repairScheduled = false;
    const mutations = this.pendingMutations.splice(0).filter((mutation) => {
      if (this.options.consumeOwnedMutation(mutation)) {
        this.diagnosticsValue.ignoredOwnedMutations += 1;
        return false;
      }

      if (
        mutation.type === 'characterData' &&
        this.options.isCanonicalTextMutation(mutation)
      ) {
        this.diagnosticsValue.ignoredCanonicalMutations += 1;
        return false;
      }

      return true;
    });

    if (mutations.length === 0) return;

    const evidence = mutations.map((mutation) => ({
      path: this.options.resolvePath(mutation),
      type: mutation.type,
    }));
    const selection = captureSelection(root);

    for (const mutation of mutations.reverse()) restoreMutation(mutation);

    restoreSelection(root, selection);
    this.repairPassesInFrame += 1;
    this.scheduleRepairPassReset();
    this.diagnosticsValue.repairPasses += 1;
    this.diagnosticsValue.repairedMutations += mutations.length;
    this.diagnosticsValue.maxObservedRepairPasses = Math.max(
      this.diagnosticsValue.maxObservedRepairPasses,
      this.repairPassesInFrame
    );
    this.diagnosticsValue.lastRepair = evidence;
    if (notify) {
      this.options.onRepair({ mutations: evidence, root });
    } else {
      this.deferredHostCommitEvidence.push(...evidence);
    }
  }

  private scheduleRepair() {
    if (this.repairScheduled) return;

    this.repairScheduled = true;
    const atLimit =
      this.repairPassesInFrame >= this.options.maxRepairPassesPerFrame;

    if (atLimit) this.diagnosticsValue.loopLimitHits += 1;

    this.cancelScheduledRepair = this.options.schedule(
      () => {
        this.cancelScheduledRepair = null;
        this.repairScheduled = false;
        if (atLimit) this.repairPassesInFrame = 0;
        this.flushRecords();
        this.repairNow();
        this.discardPending('scheduler');
      },
      {
        key: REPAIR_TASK_KEY,
        timing: atLimit ? 'animation-frame' : 'microtask',
      }
    );
  }

  private scheduleRepairPassReset() {
    if (this.repairPassResetScheduled) return;

    this.repairPassResetScheduled = true;
    this.cancelRepairPassReset = this.options.schedule(
      () => {
        this.cancelRepairPassReset = null;
        this.repairPassResetScheduled = false;
        this.repairPassesInFrame = 0;
      },
      {
        key: REPAIR_PASS_RESET_TASK_KEY,
        timing: 'animation-frame',
      }
    );
  }
}
