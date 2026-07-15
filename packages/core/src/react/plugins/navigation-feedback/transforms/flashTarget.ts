import type { BaseEditor } from '../../../../lib/editor';
import type { EditorUpdateTransaction } from '@platejs/plite';
import type {
  NavigationFeedbackActiveTarget,
  NavigationFlashTargetOptions,
  NavigationFeedbackStoredTarget,
} from '../types';

import { NavigationFeedbackPluginKey } from '../internal/navigationFeedbackPluginKey';

const NAVIGATION_FEEDBACK_TIMEOUT = new WeakMap<
  BaseEditor,
  ReturnType<typeof setTimeout>
>();
const NAVIGATION_FEEDBACK_PULSE = new WeakMap<BaseEditor, number>();

const clearNavigationPathRef = (
  target?: NavigationFeedbackStoredTarget | null
) => {
  target?.pathRef.unref();
};

export const resolveNavigationFeedbackTarget = (
  target?: NavigationFeedbackStoredTarget | null
): NavigationFeedbackActiveTarget | null => {
  const path = target?.pathRef.current;

  if (!target || !path) return null;

  const { pathRef: _pathRef, ...rest } = target;

  return {
    ...rest,
    path,
  };
};

const clearNavigationTimeout = (editor: BaseEditor) => {
  const timeoutId = NAVIGATION_FEEDBACK_TIMEOUT.get(editor);

  if (timeoutId) {
    clearTimeout(timeoutId);
    NAVIGATION_FEEDBACK_TIMEOUT.delete(editor);
  }
};

const nextPulse = (editor: BaseEditor) => {
  const pulse = (NAVIGATION_FEEDBACK_PULSE.get(editor) ?? 0) + 1;

  NAVIGATION_FEEDBACK_PULSE.set(editor, pulse);

  return pulse;
};

export const clearNavigationFeedbackTarget = (
  editor: BaseEditor,
  refreshDecorations: () => void,
  pulse?: number
) => {
  const storedTarget = editor
    .plugin(NavigationFeedbackPluginKey)
    .getOption('activeTarget');

  if (!storedTarget) return false;
  if (pulse !== undefined && storedTarget.pulse !== pulse) return false;

  clearNavigationTimeout(editor);
  clearNavigationPathRef(storedTarget);
  editor.plugin(NavigationFeedbackPluginKey).setOption('activeTarget', null);
  refreshDecorations();

  return true;
};

export const flashTarget = (
  editor: BaseEditor,
  { duration, target, variant = 'navigated' }: NavigationFlashTargetOptions,
  refreshDecorations: () => void,
  tx?: Pick<EditorUpdateTransaction, 'refs'>
) => {
  if (!editor.read.nodes.get(target.path)) return false;

  const pulse = nextPulse(editor);
  const timeoutMs =
    duration ??
    editor.plugin(NavigationFeedbackPluginKey).getOption('duration') ??
    800;
  const previousTarget = editor
    .plugin(NavigationFeedbackPluginKey)
    .getOption('activeTarget');

  clearNavigationTimeout(editor);
  clearNavigationPathRef(previousTarget);

  const activeTarget = {
    cycle: (pulse % 2) as 0 | 1,
    duration: timeoutMs,
    pathRef: tx
      ? tx.refs.path(target.path)
      : editor.update.refs.path(target.path),
    pulse,
    type: target.type,
    variant,
  };

  editor
    .plugin(NavigationFeedbackPluginKey)
    .setOption('activeTarget', activeTarget);
  refreshDecorations();

  const timeoutId = setTimeout(() => {
    clearNavigationFeedbackTarget(editor, refreshDecorations, pulse);
  }, timeoutMs);

  NAVIGATION_FEEDBACK_TIMEOUT.set(editor, timeoutId);

  return true;
};
