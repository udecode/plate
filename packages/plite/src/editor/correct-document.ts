import {
  matchesEditorCorrection,
  runEditorCorrection,
} from '../core/correction';
import {
  type DocumentChange,
  getInternalDocumentChangeClassification,
  getInternalDocumentRootChange,
} from '../core/change/document-change';
import { getExtensionRegistry } from '../core/extension-registry';
import { toPublicRoot } from '../core/public-root';
import {
  getActiveTransactionDocumentChange,
  getEditorUpdateRoot,
  getPathByRuntimeId,
  getRuntimeId,
  isInTransaction,
  runEditorTransaction,
  withTransactionDocumentChangeObserver,
  withEditorUpdateRoot,
  withEditorUpdateRootChildren,
} from '../core/public-state';
import type {
  AnyEditor as Editor,
  EditorCorrection,
  EditorCorrectionEvent,
  EditorTransactionChangeHandler,
  EditorTransactionChanged,
  RuntimeId,
} from '../interfaces/editor';
import { getChildren as getEditorChildren } from '../interfaces/editor';
import { NodeApi, type NodeEntry } from '../interfaces/node';
import { PathApi, type Path } from '../interfaces/path';
import { node } from './node';

const CORRECTION_EVENTS: readonly EditorCorrectionEvent[] = [
  'properties',
  'children',
  'content',
];

const MAX_CORRECTION_MUTATIONS = 100_000;
const ROOT_RUNTIME_KEY = '@root';

type IndexedCorrection = Readonly<{
  correction: EditorCorrection;
  id: string;
}>;

type CorrectionTarget = Readonly<{
  correction: EditorCorrection;
  correctionId: string;
  event: EditorCorrectionEvent;
  key: string;
  path: Path;
  runtimeId: RuntimeId | null;
}>;

const comparePaths = (left: Path, right: Path) =>
  left.length - right.length || PathApi.compare(left, right);

const targetKey = (
  root: string,
  runtimeId: RuntimeId | null,
  event: EditorCorrectionEvent,
  correctionId: string
) =>
  `${root}\u0000${runtimeId ?? ROOT_RUNTIME_KEY}\u0000${event}\u0000${correctionId}`;

const fingerprintValue = (value: unknown) => {
  let left = 0x81_1c_9d_c5;
  let right = 0x9e_37_79_b9;

  const write = (text: string) => {
    for (let index = 0; index < text.length; index += 1) {
      const code = text.charCodeAt(index);

      left = Math.imul(left ^ code, 0x01_00_01_93) >>> 0;
      right = Math.imul(right ^ (code + index), 0x85_eb_ca_6b) >>> 0;
    }
  };
  const visit = (current: unknown): void => {
    if (current === null) {
      write('null;');
      return;
    }

    switch (typeof current) {
      case 'boolean':
      case 'number':
      case 'string': {
        write(`${typeof current}:${String(current)};`);
        return;
      }
      case 'undefined': {
        write('undefined;');
        return;
      }
      case 'object': {
        if (Array.isArray(current)) {
          write(`array:${current.length}[`);
          current.forEach(visit);
          write(']');
          return;
        }

        const record = current as Record<string, unknown>;
        const keys = Object.keys(record).sort();

        write(`object:${keys.length}{`);
        for (const key of keys) {
          write(`${key}:`);
          visit(record[key]);
        }
        write('}');
        return;
      }
      default: {
        throw new Error('Correction fingerprints require serializable data.');
      }
    }
  };

  visit(value);

  return `${left.toString(16).padStart(8, '0')}${right
    .toString(16)
    .padStart(8, '0')}`;
};

const targetStateFingerprint = (
  editor: Editor,
  root: string,
  entry: NodeEntry
) => {
  const [targetNode, path] = entry;

  if (path.length === 0) {
    return fingerprintValue({
      childCount: getEditorChildren(editor).length,
      root,
    });
  }

  const properties = Object.fromEntries(
    Object.entries(targetNode).filter(
      ([key]) => key !== 'children' && key !== 'text'
    )
  );

  return fingerprintValue({
    childCount:
      'children' in targetNode && Array.isArray(targetNode.children)
        ? targetNode.children.length
        : undefined,
    properties,
    text: 'text' in targetNode ? targetNode.text : undefined,
  });
};

const indexCorrections = (editor: Editor) => {
  const byEvent = new Map<EditorCorrectionEvent, IndexedCorrection[]>(
    CORRECTION_EVENTS.map((event) => [event, []])
  );

  for (const [id, correction] of getExtensionRegistry(editor).corrections) {
    byEvent.get(correction.event)!.push({ correction, id });
  }

  return byEvent;
};

export const correctDocument = (
  editor: Editor,
  options: { force?: boolean; root?: string } = {}
) => {
  if (getExtensionRegistry(editor).corrections.size === 0) return;

  const { force = true, root = getEditorUpdateRoot(editor) } = options;

  const runCorrectionWorklist = () => {
    const corrections = indexCorrections(editor);
    const registry = getExtensionRegistry(editor);
    const pending = new Map<string, CorrectionTarget>();
    const order: string[] = [];
    const seenTransitions = new Map<string, number>();
    let orderIndex = 0;
    let mutationStep = 0;
    let capturedChanges: DocumentChange[] | null = null;

    const enqueueEntry = (
      entry: NodeEntry,
      events: readonly EditorCorrectionEvent[]
    ) => {
      const [, path] = entry;
      const runtimeId = getRuntimeId(editor, path);

      for (const event of events) {
        for (const indexed of corrections.get(event)!) {
          if (!matchesEditorCorrection(entry, indexed.correction)) continue;

          const key = targetKey(root, runtimeId, event, indexed.id);
          const target: CorrectionTarget = {
            correction: indexed.correction,
            correctionId: indexed.id,
            event,
            key,
            path: [...path],
            runtimeId,
          };

          if (!pending.has(key)) order.push(key);
          pending.set(key, target);
        }
      }
    };
    const enqueuePaths = (
      paths: Iterable<Path>,
      events: readonly EditorCorrectionEvent[]
    ) => {
      for (const path of [...paths].sort(comparePaths)) {
        if (!NodeApi.has(editor, path)) continue;
        enqueueEntry(node(editor, path) as NodeEntry, events);
      }
    };
    const enqueueChangedDocument = (
      change: DocumentChange,
      changed?: EditorTransactionChanged
    ) => {
      const rootChange = getInternalDocumentRootChange(change, root);
      const classification = getInternalDocumentChangeClassification(
        change,
        root
      );
      const publicRoot = toPublicRoot(root);
      const paths = new Map<string, Path>();

      if (rootChange || change.createRoots.has(root)) paths.set('', []);

      if (rootChange && !classification && !changed) {
        throw new Error(
          `Correction work requires a classified document change for root "${root}".`
        );
      }

      for (const path of changed?.paths(publicRoot) ??
        classification?.paths ??
        []) {
        for (let depth = 0; depth <= path.length; depth++) {
          const ancestor = path.slice(0, depth) as Path;

          paths.set(ancestor.join(','), ancestor);
        }
      }

      const events: EditorCorrectionEvent[] = [];

      const propertiesChanged =
        changed?.has('properties', publicRoot) ?? classification?.properties;
      const structureChanged =
        changed?.has('structure', publicRoot) ?? classification?.structure;
      const textChanged =
        changed?.has('text', publicRoot) ?? classification?.text;

      if (propertiesChanged) events.push('properties');
      if (structureChanged || change.createRoots.has(root)) {
        events.push('children');
      }
      if (
        propertiesChanged ||
        structureChanged ||
        textChanged ||
        change.createRoots.has(root)
      ) {
        events.push('content');
      }

      if (events.length > 0) enqueuePaths(paths.values(), events);
    };
    const remapPendingTargets = () => {
      for (const [key, target] of pending) {
        if (target.runtimeId === null) continue;

        const retainedPath = getPathByRuntimeId(editor, target.runtimeId);

        if (!retainedPath) {
          pending.delete(key);
          continue;
        }

        pending.set(key, { ...target, path: retainedPath });
      }
    };
    const handleTransactionChange: EditorTransactionChangeHandler = ({
      change,
      changed,
    }) => {
      capturedChanges?.push(change);

      if (
        !getInternalDocumentRootChange(change, root) &&
        !change.createRoots.has(root)
      ) {
        return;
      }

      remapPendingTargets();
      enqueueChangedDocument(change, changed);
    };
    const takeTarget = () => {
      while (orderIndex < order.length) {
        const key = order[orderIndex++]!;
        const target = pending.get(key);

        if (!target) continue;

        pending.delete(key);
        return target;
      }
    };
    const resolveTarget = (target: CorrectionTarget): NodeEntry | null => {
      const runtimePath = target.runtimeId
        ? getPathByRuntimeId(editor, target.runtimeId)
        : null;
      const path = runtimePath ?? target.path;

      if (!path || !NodeApi.has(editor, path)) return null;

      const entry = node(editor, path) as NodeEntry;

      if (
        runtimePath &&
        target.runtimeId !== null &&
        getRuntimeId(editor, entry[1]) !== target.runtimeId
      ) {
        return null;
      }

      if (
        registry.corrections.get(target.correctionId) !== target.correction ||
        !matchesEditorCorrection(entry, target.correction)
      ) {
        return null;
      }

      return entry;
    };
    const recordMutation = (
      key: string,
      description: string,
      beforeFingerprint: string,
      changes: readonly DocumentChange[]
    ) => {
      mutationStep += 1;

      if (mutationStep > MAX_CORRECTION_MUTATIONS) {
        throw new Error(
          `Structural correction exhausted ${MAX_CORRECTION_MUTATIONS} mutations at ${description}.`
        );
      }

      if (changes.length === 0) return;

      const transitionFingerprint = `${key}\u0000${beforeFingerprint}\u0000${fingerprintValue(
        changes.map((change) => change.toJSON())
      )}`;
      const previousStep = seenTransitions.get(transitionFingerprint);

      if (previousStep !== undefined) {
        throw new Error(
          `Structural correction cycle at ${description}: transition ${transitionFingerprint.slice(
            -16
          )} from step ${previousStep} repeated at step ${mutationStep}.`
        );
      }

      seenTransitions.set(transitionFingerprint, mutationStep);
    };

    const activeChange = getActiveTransactionDocumentChange(editor);

    if (force) {
      enqueuePaths(
        [
          [],
          ...Array.from(NodeApi.nodes(editor), ([, path]) => [...path] as Path),
        ],
        CORRECTION_EVENTS
      );
    } else {
      enqueueChangedDocument(activeChange);
    }

    try {
      withTransactionDocumentChangeObserver(
        editor,
        handleTransactionChange,
        () => {
          while (true) {
            const target = takeTarget();

            if (!target) return;

            const entry = resolveTarget(target);

            if (!entry) continue;

            const beforeFingerprint = targetStateFingerprint(
              editor,
              root,
              entry
            );
            const changes: DocumentChange[] = [];

            capturedChanges = changes;
            const changed = runEditorCorrection(
              editor,
              entry,
              target.correction
            );
            capturedChanges = null;

            if (changed) {
              recordMutation(
                target.key,
                `${target.event} correction "${target.correctionId}" for ${
                  target.runtimeId ?? ROOT_RUNTIME_KEY
                } at [${target.path.join(',')}] in root "${root}"`,
                beforeFingerprint,
                changes
              );
            }
          }
        }
      );
    } finally {
      capturedChanges = null;
    }
  };
  const runInRoot = () =>
    withEditorUpdateRoot(editor, root, () =>
      withEditorUpdateRootChildren(editor, root, runCorrectionWorklist)
    );

  if (!isInTransaction(editor)) {
    runEditorTransaction(editor, runInRoot, { skipCorrections: true });
    return;
  }

  runInRoot();
};
