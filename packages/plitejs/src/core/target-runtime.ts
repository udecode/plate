import type {
  AnyEditor as Editor,
  EditorTargetRuntime,
  Selection,
} from '../interfaces/editor';
import { getDefined } from '../internal/get-defined';
import { getEditorRuntime, type InternalEditorRuntime } from './editor-runtime';

// A React-capable editor and its core view facade share one command runtime.
// Keep the implicit target bridge on that runtime so either facade can execute
// a command without making DOM ownership global to the canonical editor.
const TARGET_RUNTIME = new WeakMap<
  InternalEditorRuntime,
  EditorTargetRuntime
>();
const TARGET_RUNTIME_ACTIVE = new WeakSet<InternalEditorRuntime>();

const targetRuntimeKey = (editor: Editor) => getEditorRuntime(editor);

export const resolveTargetRuntimeImplicitTarget = (
  editor: Editor,
  fallback: Selection,
  applyTarget: (target: Selection) => void
): Selection => {
  const key = targetRuntimeKey(editor);

  if (TARGET_RUNTIME_ACTIVE.has(key)) {
    return fallback;
  }

  const runtime = TARGET_RUNTIME.get(key);

  if (!runtime) {
    return fallback;
  }

  TARGET_RUNTIME_ACTIVE.add(key);

  try {
    const target = runtime.resolveImplicitTarget(editor, {
      fallback,
      reason: 'implicit-target',
    });
    if (JSON.stringify(target ?? null) !== JSON.stringify(fallback ?? null)) {
      applyTarget(target);
    }

    return target;
  } finally {
    TARGET_RUNTIME_ACTIVE.delete(key);
  }
};

export const setTargetRuntime = (
  editor: Editor,
  runtime: EditorTargetRuntime | null
) => {
  const key = targetRuntimeKey(editor);

  if (runtime) {
    TARGET_RUNTIME.set(key, runtime);
  } else {
    TARGET_RUNTIME.delete(key);
  }
};

export const getTargetRuntime = (editor: Editor) =>
  TARGET_RUNTIME.get(targetRuntimeKey(editor)) ?? null;

export const withEditorTargetRuntime = <T>(
  editor: Editor,
  runtime: EditorTargetRuntime,
  fn: () => T
): T => {
  const key = targetRuntimeKey(editor);
  const previousRuntime = TARGET_RUNTIME.get(key);
  const hadPreviousRuntime = TARGET_RUNTIME.has(key);

  TARGET_RUNTIME.set(key, runtime);

  try {
    return fn();
  } finally {
    if (hadPreviousRuntime) {
      TARGET_RUNTIME.set(key, getDefined(previousRuntime));
    } else {
      TARGET_RUNTIME.delete(key);
    }
  }
};
