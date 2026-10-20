import type {
  AnyEditor as Editor,
  EditorCommandPlace,
  EditorUpdateTransaction,
} from '../interfaces/editor';
import { NodeApi } from '../interfaces/node';
import { PointApi } from '../interfaces/point';
import { RangeApi } from '../interfaces/range';
import { SelectionApi } from '../interfaces/selection';
import {
  COMMAND_FRAMES,
  runInEditorCommandFrame,
  runSelectionOnlyInEditorUpdate,
} from './command-frame';
import { getEditorRuntimeOwner } from './editor-runtime';
import { MAIN_ROOT_KEY } from './public-root';
import {
  assertRootPlaced,
  getCurrentSelection,
  getCurrentSelectionRoot,
  getNodeTargetRoot,
  getTransactionSnapshot,
  getTransactionSpecContext,
  getUpdateView,
  withEditorUpdateRootScope,
} from './public-state';
import { EditorRefusalError } from './refusal';
import { getTxMethodLocate, isTxOnlyMethod } from './tx-only';
import { countCoreWork } from './work';

let buildRootTransaction:
  | ((editor: Editor, root: string) => EditorUpdateTransaction)
  | undefined;

export const registerPluginRootTransactionBuilder = (
  build: NonNullable<typeof buildRootTransaction>
) => {
  buildRootTransaction = build;
};

const rootTransaction = (editor: Editor, root: string) => {
  const context = getTransactionSpecContext(editor);
  if (!context || !buildRootTransaction) {
    throw new Error('A plugin root transaction requires an active draft.');
  }
  context.pluginRootTransactions ??= new Map();
  const cache = context.pluginRootTransactions;
  const cached = cache.get(root);
  if (cached) return cached;
  const tx = buildRootTransaction(editor, root);
  cache.set(root, tx);
  return tx;
};

const callMember = (
  tx: object,
  group: string,
  path: readonly PropertyKey[],
  args: unknown[]
) => {
  const { owner, value: member } = resolvePluginMethod(tx, [group, ...path]);
  if (typeof member !== 'function') {
    throw new Error('Missing plugin update method.');
  }
  const authored = Reflect.get(member, PLUGIN_UPDATE_METHOD);
  return Reflect.apply(
    typeof authored === 'function' ? authored : member,
    owner,
    args
  );
};

export const dispatchPluginUpdate = (
  caller: Editor,
  transaction: object & { view: { root: () => string | undefined } },
  group: string,
  path: readonly PropertyKey[],
  method: (...args: unknown[]) => unknown,
  thisArg: unknown,
  args: unknown[],
  transactionOnly = false
): unknown => {
  countCoreWork('pluginDispatches');
  const editor = getEditorRuntimeOwner(caller);
  const context = getTransactionSpecContext(editor);
  if (!context) throw new Error('A plugin update requires an active draft.');
  const name = [group, ...path.map(String)].join('.');
  const locate = getTxMethodLocate(method);
  const ownRoot = transaction.view.root() ?? MAIN_ROOT_KEY;
  const isView = caller !== editor;
  const run = () => Reflect.apply(method, thisArg, args);
  if (transactionOnly || isTxOnlyMethod(method) || locate === 'stored') {
    return run();
  }
  if (locate === 'selection') {
    return runSelectionOnlyInEditorUpdate(
      editor,
      `Plugin method "${name}" declares txSelection`,
      run
    );
  }
  const callback = args.some((arg) => typeof arg === 'function');
  if (locate === undefined && args.some((arg) => arg !== undefined)) {
    throw new Error(
      `Plugin method "${name}" takes arguments, so it must declare txLocate.`
    );
  }

  let decidedRoot = ownRoot;
  let located: readonly unknown[] | null = args;
  const inheritedRoot = context.pluginRoot;
  const locateCall = (framePlace?: EditorCommandPlace) => {
    const calledInFrame = !framePlace && COMMAND_FRAMES.has(editor);
    let targetRoot: string | undefined;
    if (
      typeof locate === 'function' &&
      (!callback || framePlace || calledInFrame)
    ) {
      located = locate(args, {
        location(at) {
          const keyRoot = getNodeTargetRoot(editor, at);
          const hiddenFromFrame =
            calledInFrame &&
            keyRoot === undefined &&
            (typeof at === 'string' || NodeApi.isDescendant(at));
          if (hiddenFromFrame) return null;
          const root =
            keyRoot ??
            (SelectionApi.isNode(at) || RangeApi.isRange(at)
              ? SelectionApi.root(at)
              : PointApi.isPoint(at)
                ? at.root
                : undefined) ??
            ownRoot;
          if (!callback) {
            if (targetRoot !== undefined && targetRoot !== root) {
              throw new Error(`Plugin method "${name}" targets two roots.`);
            }
            targetRoot = root;
          }
          return framePlace
            ? withEditorUpdateRootScope(editor, root, () =>
                framePlace.location(at)
              )
            : at;
        },
      });
    }
    decidedRoot = callback
      ? ownRoot
      : (targetRoot ??
        inheritedRoot ??
        (isView
          ? ownRoot
          : getCurrentSelection(editor) ||
              getTransactionSnapshot(editor)?.selectionInDroppedRoot
            ? getCurrentSelectionRoot(editor)
            : MAIN_ROOT_KEY));
  };
  const invoke = (framed: boolean) => {
    if (located === null) return undefined;
    const active = getTransactionSpecContext(editor);
    if (!active) throw new Error('A plugin update requires an active draft.');
    const previous = active.pluginRoot;
    active.pluginRoot = callback ? inheritedRoot : decidedRoot;
    try {
      if (callback) {
        return framed
          ? callMember(getUpdateView(editor), group, path, [...located])
          : run();
      }
      const base =
        !isView &&
        decidedRoot === MAIN_ROOT_KEY &&
        (!getCurrentSelection(editor) ||
          getCurrentSelectionRoot(editor) === MAIN_ROOT_KEY);
      if (!framed && (isView ? decidedRoot === ownRoot : base)) {
        return Reflect.apply(method, thisArg, located);
      }
      return callMember(rootTransaction(editor, decidedRoot), group, path, [
        ...located,
      ]);
    } catch (error) {
      const snapshot = getTransactionSnapshot(editor);

      if (snapshot && !callback && !(error instanceof EditorRefusalError)) {
        assertRootPlaced(editor, snapshot, decidedRoot);
      }
      throw error;
    } finally {
      active.pluginRoot = previous;
    }
  };
  if (!isView && !COMMAND_FRAMES.has(editor)) {
    let result: unknown;
    const framed = withEditorUpdateRootScope(editor, ownRoot, () =>
      runInEditorCommandFrame(
        editor,
        (place) => {
          locateCall(place);
          return () => {
            result = invoke(true);
            return located !== null;
          };
        },
        { targetRoot: () => decidedRoot }
      )
    );
    if (framed !== null) return result;
  }
  locateCall();
  return invoke(false);
};

/**
 * The transaction guard answers this with whether a plugin member came from
 * the plugin's update group. Members the guard never built, such as core
 * update groups, answer nothing.
 *
 * @internal
 */
export const PLUGIN_UPDATE_ORIGIN = Symbol('plugin update origin');

export type PluginMethodPath = Readonly<{
  /** The last value reached before a `call` or `apply` adapter. */
  authoredMethod: unknown;
  owner: unknown;
  txOnly: boolean;
  value: unknown;
}>;

const MISSING: PluginMethodPath = Object.freeze({
  authoredMethod: undefined,
  owner: undefined,
  txOnly: false,
  value: undefined,
});

/**
 * `call` and `apply` on a function become adapters that keep the method's
 * receiver.
 *
 * @internal
 */
export const resolvePluginMethod = (
  source: unknown,
  path: readonly PropertyKey[]
): PluginMethodPath => {
  let owner: unknown = source;
  let value: unknown = source;
  let authoredMethod: unknown = source;
  let adapted = false;
  let txOnly = isTxOnlyMethod(source);

  for (const key of path) {
    const receiver = owner;

    owner = value;
    if (
      (typeof value !== 'object' || value === null) &&
      typeof value !== 'function'
    ) {
      return MISSING;
    }

    const descriptor = Object.getOwnPropertyDescriptor(value, key);

    if (!descriptor || !('value' in descriptor)) {
      if (typeof value === 'function' && (key === 'call' || key === 'apply')) {
        const target = value;

        owner = (...args: unknown[]) => Reflect.apply(target, receiver, args);
        value = Function.prototype[key];
        adapted = true;
        continue;
      }

      return MISSING;
    }

    ({ value } = descriptor);
    if (!adapted) authoredMethod = value;
    if (isTxOnlyMethod(value)) txOnly = true;
  }

  return { authoredMethod, owner, txOnly, value };
};

/** @internal */
export const callPluginUpdateMethod = (
  label: string,
  method: PluginMethodPath,
  args: readonly unknown[]
): unknown => {
  const { authoredMethod, owner, txOnly, value } = method;

  if (typeof value !== 'function') {
    throw new TypeError(`${label} is not callable.`);
  }
  if (txOnly) {
    throw new Error(`${label} is transaction-only.`);
  }
  if (
    typeof authoredMethod === 'function' &&
    Reflect.get(authoredMethod, PLUGIN_UPDATE_ORIGIN) === false
  ) {
    throw new Error(`${label} is read-only.`);
  }

  return Reflect.apply(value, owner, args);
};

export const PLUGIN_UPDATE_METHOD = Symbol('plugin update method');
