import type { NodeKey, Path } from '../..';
import {
  type AnyEditor,
  getChildren as editorGetChildren,
  getNodeKey as editorGetNodeKey,
} from '../../interfaces/editor';
import { type Descendant, NodeApi } from '../../interfaces/node';
import { PathApi } from '../../interfaces/path';
import type { Text } from '../../interfaces/text';
import { type DOMRootRuntime, findDOMRootRuntime } from './dom-root-runtime';
import {
  captureDOMTextFlowShape,
  type DOMTextFlowShape,
  isDOMTextFlowShapeCurrent,
} from './dom-text-flow-index';
import {
  createTextRootWalker,
  createTextWalker,
  drawsTextBetween,
  getHiddenOnPurpose,
  getIdPath,
  getKeyElementMap,
  getKeyHosts,
  getMappedKeyElements,
  getMappedKeyHosts,
  getTextHost,
  getTextHostId,
  getTextRoot,
  isDOMRangeCurrent,
  isDOMTextCurrent,
  isEditableTextIn,
  isFlowHost,
  readHostTexts,
  TEXT_HOST,
  textKeyId,
} from './dom-text-freshness';

const RECORDS_BEFORE_RESET = 2000;

type HostProof = {
  readonly flow: DOMTextFlowShape | null;
  readonly ids: readonly string[];
  readonly indexOf: ReadonlyMap<string, number>;
  previousHost: { epoch: number; host: HTMLElement | null } | null;
  readonly texts: readonly string[];
};

type TextProof = {
  readonly flows: ReadonlyArray<DOMTextFlowShape | null>;
  readonly host: HTMLElement;
  readonly hosts: readonly HTMLElement[];
  readonly id: string;
  readonly mapped: ReadonlySet<HTMLElement> | undefined;
  readonly members: readonly HTMLElement[];
  readonly nodeKey: NodeKey;
  readonly revisions: readonly number[];
  readonly watched: readonly HTMLElement[];
};

type WalkPosition = { host: HTMLElement; index: number; proof: HostProof };

const isUnwatchedPathId = (id: string) => id.startsWith('path:');

const isTextHost = (node: Element) =>
  node.getAttribute('data-editor-node') === 'text';

class DOMTextProofs {
  private hostProofs = new WeakMap<Element, HostProof>();
  private readonly revisions = new WeakMap<Element, number>();
  private textProofs = new WeakMap<Text, TextProof>();
  private readonly observer: MutationObserver;
  private structureEpoch = 0;
  private freshReads = 0;
  private walker: TreeWalker | null = null;
  private textWalker: TreeWalker | null = null;
  readonly root: HTMLElement;

  constructor(root: HTMLElement) {
    this.root = root;
    this.observer = new MutationObserver((records) => this.apply(records));
    this.observer.observe(root, {
      attributeFilter: [
        'contenteditable',
        'data-editor',
        'data-editor-length',
        'data-editor-node',
        'data-editor-node-key',
        'data-editor-placeholder',
        'data-editor-string',
        'data-editor-text-flow-host',
        'data-editor-zero-width',
      ],
      characterData: true,
      childList: true,
      subtree: true,
    });
  }

  dispose() {
    this.observer.disconnect();
  }

  keepsText(
    editor: AnyEditor,
    host: HTMLElement,
    nodeKey: NodeKey,
    node: Text
  ) {
    this.sync();
    const proof = this.textProofs.get(node);

    if (
      proof?.host === host &&
      proof.nodeKey === nodeKey &&
      this.holds(proof, getMappedKeyElements(editor, nodeKey)) &&
      this.flowsHold(proof)
    ) {
      hits += 1;
      return true;
    }
    return false;
  }

  isTextCurrent(
    editor: AnyEditor,
    host: HTMLElement,
    nodeKey: NodeKey,
    node: Text
  ) {
    return (
      this.keepsText(editor, host, nodeKey, node) ||
      this.proveText(editor, host, nodeKey, node) !== null
    );
  }

  isRangeCurrent(
    editor: AnyEditor,
    start: readonly [HTMLElement, NodeKey],
    end: readonly [HTMLElement, NodeKey],
    hidesOnPurpose: (path: Path) => boolean
  ) {
    this.sync();
    const reads = this.freshReads;

    if (this.walkRange(editor, start, end, hidesOnPurpose)) {
      if (this.freshReads === reads) hits += 1;
      return true;
    }
    return isDOMRangeCurrent(editor, this.root, start, end);
  }

  private sync() {
    const records = this.observer.takeRecords();

    if (records.length > 0) this.apply(records);
  }

  private apply(records: readonly MutationRecord[]) {
    if (records.length > RECORDS_BEFORE_RESET) {
      this.clear();
      return;
    }
    const added: globalThis.Node[] = [];
    const strays: globalThis.Node[] = [];

    for (const record of records) {
      const { target } = record;
      const element =
        target.nodeType === Node.ELEMENT_NODE
          ? (target as Element)
          : target.parentElement;

      if (!element) continue;
      if (record.attributeName === 'data-editor') {
        this.clear();
        return;
      }
      if (
        record.attributeName === 'data-editor-node' ||
        record.attributeName === 'data-editor-text-flow-host'
      ) {
        this.revoke(element);
        if (isTextHost(element) && getTextRoot(element) === this.root) {
          added.push(element);
        } else {
          this.structureEpoch += 1;
        }
      }
      this.revokeEnclosingHosts(element);
      if (record.type === 'characterData' && !getTextHost(element)) {
        strays.push(target);
      }
      if (record.type !== 'childList') continue;
      for (const node of record.removedNodes) {
        if (
          node.nodeType === Node.ELEMENT_NODE
            ? this.revokeHostsIn(node as Element)
            : node.nodeType === Node.TEXT_NODE && !getTextHost(element)
        ) {
          this.structureEpoch += 1;
        }
      }
      if (this.root.contains(element) && getTextRoot(element) !== this.root) {
        continue;
      }
      for (const node of record.addedNodes) {
        if (
          node.nodeType === Node.ELEMENT_NODE &&
          this.revokeHostsIn(node as Element)
        ) {
          added.push(node);
        } else if (
          node.nodeType === Node.TEXT_NODE &&
          isEditableTextIn(this.root, node) &&
          !getTextHost(element)
        ) {
          strays.push(node);
        }
      }
    }
    for (const node of [...added, ...strays]) {
      const next = this.root.contains(node) ? this.nextHostAfter(node) : null;
      const proof = next && this.hostProofs.get(next);

      if (proof) proof.previousHost = null;
    }
  }

  private clear() {
    this.hostProofs = new WeakMap();
    this.textProofs = new WeakMap();
    this.structureEpoch += 1;
  }

  private revokeEnclosingHosts(element: Element) {
    for (
      let node: Element | null = element;
      node && node !== this.root;
      node = node.parentElement
    ) {
      if (isTextHost(node)) this.revoke(node);
    }
  }

  private revoke(host: Element) {
    this.revisions.set(host, (this.revisions.get(host) ?? 0) + 1);
    this.hostProofs.delete(host);
  }

  private revokeHostsIn(node: Element) {
    const hosts = node.querySelectorAll(TEXT_HOST);

    if (isTextHost(node)) this.revoke(node);
    for (const host of hosts) this.revoke(host);
    return isTextHost(node) || hosts.length > 0;
  }

  private getWalker() {
    this.walker ??= createTextRootWalker(this.root);
    return this.walker;
  }

  private nextHostAfter(node: globalThis.Node): HTMLElement | null {
    const walker = this.getWalker();
    let next: globalThis.Node | null = null;

    for (
      let current: globalThis.Node | null = node;
      current && current !== this.root && !next;
      current = current.parentNode
    ) {
      walker.currentNode = current;
      next = walker.nextSibling();
    }
    for (
      walker.currentNode = next ?? this.root;
      next;
      next = walker.nextNode()
    ) {
      if (isTextHost(next as Element)) return next as HTMLElement;
    }
    return null;
  }

  private previousHost(host: HTMLElement, proof: HostProof) {
    if (proof.previousHost?.epoch === this.structureEpoch) {
      return proof.previousHost.host;
    }
    const walker = this.getWalker();
    let previous: HTMLElement | null = null;

    walker.currentNode = host;
    for (let node = walker.previousNode(); node; node = walker.previousNode()) {
      if (isTextHost(node as Element)) {
        previous = node as HTMLElement;
        break;
      }
    }
    this.textWalker ??= createTextWalker(this.root);
    const linked =
      previous && !drawsTextBetween(this.textWalker, previous, host)
        ? previous
        : null;

    proof.previousHost = { epoch: this.structureEpoch, host: linked };
    return linked;
  }

  private followingHost(
    position: WalkPosition | null,
    first: HTMLElement,
    nodeKey: NodeKey,
    proveHost: (host: HTMLElement) => HostProof | null
  ) {
    const host = !position
      ? first
      : position.index < position.proof.ids.length - 1
        ? position.host
        : this.nextHostAfter(position.host);

    return host && proveHost(host)?.indexOf.has(textKeyId(nodeKey))
      ? host
      : undefined;
  }

  private holds(
    proof: TextProof,
    mapped: ReadonlySet<HTMLElement> | undefined
  ) {
    if (
      mapped !== proof.mapped ||
      (mapped?.size ?? 0) !== proof.members.length ||
      proof.members.some((member) => !mapped?.has(member))
    ) {
      return false;
    }
    for (let index = 0; index < proof.watched.length; index++) {
      if (
        (this.revisions.get(proof.watched[index]) ?? 0) !==
        proof.revisions[index]
      ) {
        return false;
      }
    }
    return true;
  }

  private flowsHold(proof: TextProof) {
    for (let index = 0; index < proof.hosts.length; index++) {
      const flow = proof.flows[index];

      if (flow && !isDOMTextFlowShapeCurrent(proof.hosts[index], flow)) {
        return false;
      }
    }
    return true;
  }

  private proveText(
    editor: AnyEditor,
    host: HTMLElement,
    nodeKey: NodeKey,
    node: Text,
    hostProof?: HostProof
  ) {
    this.freshReads += 1;
    const hosts = getKeyHosts(editor, this.root, nodeKey, host);
    const id = getTextHostId(host) ?? textKeyId(nodeKey);
    const pageText =
      hosts.length === 1
        ? hostProof?.texts[hostProof.indexOf.get(id) ?? -1]
        : undefined;

    if (
      pageText === undefined
        ? !isDOMTextCurrent(editor, host, nodeKey, node.text)
        : pageText !== node.text
    ) {
      return null;
    }
    const mapped = getMappedKeyElements(editor, nodeKey);
    const members = mapped ? [...mapped] : [];
    const watched = [...new Set([...hosts, ...members])];
    const proof: TextProof = {
      flows: hosts.map((keyHost) =>
        isFlowHost(keyHost) ? captureDOMTextFlowShape(keyHost, nodeKey) : null
      ),
      host,
      hosts,
      id,
      mapped,
      members,
      nodeKey,
      revisions: watched.map((element) => this.revisions.get(element) ?? 0),
      watched,
    };

    if (!isUnwatchedPathId(proof.id)) {
      this.textProofs.set(node, proof);
      HOST_LEDGERS.set(host, this);
    }
    return proof;
  }

  private proveHost(host: HTMLElement) {
    const kept = this.hostProofs.get(host);

    if (kept && (!kept.flow || isDOMTextFlowShapeCurrent(host, kept.flow))) {
      return kept;
    }
    this.freshReads += 1;
    this.revoke(host);
    const texts = readHostTexts(host);

    if (!texts) return null;
    const ids: string[] = [];
    const pageTexts: string[] = [];

    for (const { id, text } of texts) {
      if (text === null) return null;
      if (ids.at(-1) === id) {
        pageTexts[pageTexts.length - 1] += text;
      } else {
        ids.push(id);
        pageTexts.push(text);
      }
    }
    const proof: HostProof = {
      flow: isFlowHost(host) ? captureDOMTextFlowShape(host) : null,
      ids,
      indexOf: new Map(ids.map((id, index) => [id, index])),
      previousHost: null,
      texts: pageTexts,
    };

    if (proof.indexOf.size !== ids.length) return null;
    if (!ids.some(isUnwatchedPathId)) this.hostProofs.set(host, proof);
    return proof;
  }

  private walkRange(
    editor: AnyEditor,
    [startHost, startKey]: readonly [HTMLElement, NodeKey],
    [endHost, endKey]: readonly [HTMLElement, NodeKey],
    hidesOnPurpose: (path: Path) => boolean
  ) {
    const first = getKeyHosts(editor, this.root, startKey, startHost)[0];
    const last = getKeyHosts(editor, this.root, endKey, endHost).at(-1);

    if (!last || !isTextHost(first) || !isTextHost(last)) return false;
    const checked = new Map<HTMLElement, HostProof | null>();
    const proveHost = (host: HTMLElement) => {
      let proof = checked.get(host);

      if (proof === undefined) {
        proof = this.proveHost(host);
        checked.set(host, proof);
      }
      return proof;
    };
    const fromId = proveHost(first)?.ids[0];
    const toId = proveHost(last)?.ids.at(-1);
    const from = fromId && getIdPath(editor, fromId);
    const to = toId && getIdPath(editor, toId);

    if (!from || !to) return false;
    let position: WalkPosition | null = null;

    const elements = getKeyElementMap(editor);
    const visit = (node: Text, getPath: () => Path) => {
      let proof = this.textProofs.get(node);

      if (
        !proof?.hosts.every((host) => proveHost(host)) ||
        !this.holds(proof, elements?.get(proof.nodeKey))
      ) {
        const path = getPath();
        const nodeKey = editorGetNodeKey(editor, path);
        const host = nodeKey
          ? (getMappedKeyHosts(editor, this.root, nodeKey)[0] ??
            this.followingHost(position, first, nodeKey, proveHost))
          : undefined;

        if (!nodeKey || !host) return hidesOnPurpose(path);
        const hostProof = proveHost(host);

        if (!hostProof) return false;
        proof =
          this.proveText(editor, host, nodeKey, node, hostProof) ?? undefined;
        if (!proof) return false;
      }
      for (const host of proof.hosts) {
        const hostProof = proveHost(host);
        const index = hostProof?.indexOf.get(proof.id);

        if (!hostProof || index === undefined) return false;
        if (position === null) {
          if (host !== first || index !== 0) return false;
        } else if (position.proof === hostProof) {
          if (index !== position.index + 1) return false;
        } else if (
          position.index !== position.proof.ids.length - 1 ||
          index !== 0 ||
          this.previousHost(host, hostProof) !== position.host
        ) {
          return false;
        }
        position = { host, index, proof: hostProof };
      }
      return true;
    };

    if (!walkTextsWithLazyPaths(editorGetChildren(editor), from, to, visit)) {
      return false;
    }
    const end = position as WalkPosition | null;

    return end?.host === last && end.index === end.proof.ids.length - 1;
  }
}

const walkTextsWithLazyPaths = (
  roots: readonly Descendant[],
  from: Path,
  to: Path,
  visit: (node: Text, getPath: () => Path) => boolean
) => {
  const parents: Array<{ children: readonly Descendant[]; index: number }> = [];
  const path: number[] = [];
  let children = roots;
  let index = from[0] ?? 0;
  let started = false;

  for (;;) {
    if (index >= children.length) {
      const parent = parents.pop();

      if (!parent) return false;
      ({ children } = parent);
      index = parent.index + 1;
      continue;
    }
    const node = children[index];

    path.length = parents.length;
    path.push(index);
    if (NodeApi.isText(node)) {
      started ||= PathApi.compare(path, from) >= 0;
      if (started) {
        if (!visit(node, () => [...path])) return false;
        if (PathApi.compare(path, to) >= 0) return true;
      }
      index += 1;
      continue;
    }
    parents.push({ children, index });
    ({ children } = node as { children: readonly Descendant[] });
    index = started ? 0 : (from[parents.length] ?? 0);
  }
};

const LEDGERS = new WeakMap<DOMRootRuntime, DOMTextProofs>();
const HOST_LEDGERS = new WeakMap<HTMLElement, DOMTextProofs>();
let hits = 0;
let audit: { point: number; range: number } | null = null;

export const auditDOMTextProofs = () => {
  audit ??= { point: 0, range: 0 };
  return audit;
};

const isLive = (ledger: DOMTextProofs) => {
  const runtime = findDOMRootRuntime(ledger.root);

  return (
    runtime?.rootRef.current === ledger.root && LEDGERS.get(runtime) === ledger
  );
};

const getLedger = (root: HTMLElement) => {
  const runtime = findDOMRootRuntime(root);

  if (!runtime || runtime.rootRef.current !== root) return null;
  const kept = LEDGERS.get(runtime);

  if (kept?.root === root) return kept;
  const ledger = new DOMTextProofs(root);

  runtime.installDisposable('dom-text-proofs', () => {
    ledger.dispose();
    if (LEDGERS.get(runtime) === ledger) LEDGERS.delete(runtime);
  });
  LEDGERS.set(runtime, ledger);
  return ledger;
};

const checkAgainstFreshRead = (
  lookup: 'point' | 'range',
  keep: () => boolean,
  read: () => boolean
) => {
  if (!audit) return keep();
  const before = hits;
  const kept = keep();
  const fresh = read();

  if (hits > before) audit[lookup] += 1;
  if (kept !== fresh) {
    throw new Error(
      `A kept ${lookup} proof answered ${kept} where a fresh page read answers ${fresh}`
    );
  }
  return kept;
};

export const isDOMTextPainted = (
  editor: AnyEditor,
  host: HTMLElement,
  nodeKey: NodeKey,
  node: Text
) => {
  const read = () => isDOMTextCurrent(editor, host, nodeKey, node.text);

  return checkAgainstFreshRead(
    'point',
    () => {
      const kept = HOST_LEDGERS.get(host);

      if (kept && isLive(kept) && kept.keepsText(editor, host, nodeKey, node)) {
        return true;
      }
      const root = getTextRoot(host);
      const ledger = root && getLedger(root);

      return ledger
        ? ledger.isTextCurrent(editor, host, nodeKey, node)
        : read();
    },
    read
  );
};

export const isDOMRangePainted = (
  editor: AnyEditor,
  root: HTMLElement,
  start: readonly [HTMLElement, NodeKey],
  end: readonly [HTMLElement, NodeKey]
) => {
  const ledger = getLedger(root);
  const read = () => isDOMRangeCurrent(editor, root, start, end);

  if (!ledger) return read();
  return checkAgainstFreshRead(
    'range',
    () => ledger.isRangeCurrent(editor, start, end, getHiddenOnPurpose(root)),
    read
  );
};
