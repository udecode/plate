import type { DOMPhaseScheduler } from './dom-phase-scheduler';

type DOMSyncMutationToken = {
  key: string;
  target: Node;
};

const DOM_SYNC_MUTATION_OWNER_BY_ROOT = new WeakMap<
  HTMLElement,
  DOMSyncMutationOwnership
>();
const ELEMENT_NODE = 1;

const asElement = (node: Node): Element | null =>
  node.nodeType === ELEMENT_NODE ? (node as Element) : node.parentElement;

const findDOMSyncMutationOwner = (
  node: Node
): DOMSyncMutationOwnership | null => {
  let element = asElement(node);

  while (element) {
    const owner = DOM_SYNC_MUTATION_OWNER_BY_ROOT.get(element as HTMLElement);

    if (owner) return owner;

    const rootNode = element.getRootNode();

    element =
      element.parentElement ??
      ('host' in rootNode ? (rootNode.host as Element) : null);
  }

  return null;
};

const mutationKey = (
  type: MutationRecord['type'],
  attributeName: string | null = null
) => `${type}:${attributeName ?? ''}`;

export class DOMSyncMutationOwnership {
  private cancelExpiry: (() => void) | null = null;

  private connected = false;

  private readonly pendingTokens = new Set<DOMSyncMutationToken>();

  private root: HTMLElement | null = null;

  private tokensByTarget = new WeakMap<
    Node,
    Map<string, Set<DOMSyncMutationToken>>
  >();

  private readonly schedule: DOMPhaseScheduler['schedule'];

  constructor(schedule: DOMPhaseScheduler['schedule']) {
    this.schedule = schedule;
  }

  connect(root: HTMLElement | null) {
    this.connected = true;
    if (this.root !== root) {
      this.setRoot(root);
    } else if (root) {
      DOM_SYNC_MUTATION_OWNER_BY_ROOT.set(root, this);
    }
  }

  consume(mutation: MutationRecord) {
    const tokens = this.getTokens(mutation);
    const token = tokens?.values().next().value;

    if (!token) return false;

    this.deleteToken(token);
    return true;
  }

  destroy() {
    this.connected = false;
    this.unregisterRoot();
    this.clear();
  }

  has(mutation: MutationRecord) {
    return (this.getTokens(mutation)?.size ?? 0) > 0;
  }

  mark(
    target: Node,
    type: MutationRecord['type'],
    attributeName: string | null = null
  ) {
    if (!this.connected) return;

    const key = mutationKey(type, attributeName);
    const targetTokens =
      this.tokensByTarget.get(target) ??
      new Map<string, Set<DOMSyncMutationToken>>();
    const tokens = targetTokens.get(key) ?? new Set<DOMSyncMutationToken>();
    const token = { key, target };

    tokens.add(token);
    this.pendingTokens.add(token);
    targetTokens.set(key, tokens);
    this.tokensByTarget.set(target, targetTokens);
    if (this.cancelExpiry) return;

    this.cancelExpiry = this.schedule(
      'model',
      'expire-dom-sync-mutation-ownership',
      () => this.clear(),
      { timing: 'timeout' }
    );
  }

  setRoot(root: HTMLElement | null) {
    if (this.root === root) return;

    this.unregisterRoot();
    this.clear();
    this.root = root;
    if (this.connected && root) {
      DOM_SYNC_MUTATION_OWNER_BY_ROOT.set(root, this);
    }
  }

  private clear() {
    this.cancelExpiry?.();
    this.cancelExpiry = null;
    this.pendingTokens.clear();
    this.tokensByTarget = new WeakMap();
  }

  private deleteToken(token: DOMSyncMutationToken) {
    const targetTokens = this.tokensByTarget.get(token.target);
    const tokens = targetTokens?.get(token.key);

    tokens?.delete(token);
    this.pendingTokens.delete(token);
    if (tokens?.size === 0) targetTokens?.delete(token.key);
    if (targetTokens?.size === 0) {
      this.tokensByTarget.delete(token.target);
    }
    if (this.pendingTokens.size === 0) {
      this.cancelExpiry?.();
      this.cancelExpiry = null;
    }
  }

  private getTokens(mutation: MutationRecord) {
    return this.tokensByTarget
      .get(mutation.target)
      ?.get(mutationKey(mutation.type, mutation.attributeName));
  }

  private unregisterRoot() {
    if (this.root && DOM_SYNC_MUTATION_OWNER_BY_ROOT.get(this.root) === this) {
      DOM_SYNC_MUTATION_OWNER_BY_ROOT.delete(this.root);
    }
  }
}

export const markDOMSyncMutationTarget = (
  target: Node,
  type: MutationRecord['type'],
  attributeName: string | null = null
) => {
  findDOMSyncMutationOwner(target)?.mark(target, type, attributeName);
};

export const isDOMSyncMutation = (mutation: MutationRecord) =>
  findDOMSyncMutationOwner(mutation.target)?.has(mutation) ?? false;
