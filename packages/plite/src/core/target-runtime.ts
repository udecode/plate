import type {
  Editor,
  EditorTargetRuntime,
  Selection,
} from '../interfaces/editor';

const TARGET_RUNTIME = new WeakMap<Editor, EditorTargetRuntime>();
const TARGET_RUNTIME_ACTIVE = new WeakSet<Editor>();

export const resolveTargetRuntimeImplicitTarget = (
  editor: Editor,
  fallback: Selection,
  applyTarget: (target: Selection) => void
): Selection => {
  if (TARGET_RUNTIME_ACTIVE.has(editor)) {
    return fallback;
  }

  const runtime = TARGET_RUNTIME.get(editor);

  if (!runtime) {
    return fallback;
  }

  TARGET_RUNTIME_ACTIVE.add(editor);

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
    TARGET_RUNTIME_ACTIVE.delete(editor);
  }
};

export const setTargetRuntime = (
  editor: Editor,
  runtime: EditorTargetRuntime | null
) => {
  if (runtime) {
    TARGET_RUNTIME.set(editor, runtime);
  } else {
    TARGET_RUNTIME.delete(editor);
  }
};

export const getTargetRuntime = (editor: Editor) =>
  TARGET_RUNTIME.get(editor) ?? null;

export const withEditorTargetRuntime = <T>(
  editor: Editor,
  runtime: EditorTargetRuntime,
  fn: () => T
): T => {
  const previousRuntime = TARGET_RUNTIME.get(editor);
  const hadPreviousRuntime = TARGET_RUNTIME.has(editor);

  TARGET_RUNTIME.set(editor, runtime);

  try {
    return fn();
  } finally {
    if (hadPreviousRuntime) {
      TARGET_RUNTIME.set(editor, previousRuntime!);
    } else {
      TARGET_RUNTIME.delete(editor);
    }
  }
};
