import type { BasePlateEditor } from '../../../editor';
import type {
  NavigationFeedbackActiveTarget,
  NavigationFlashTargetOptions,
  NavigationFeedbackStoredTarget,
} from '../types';

import { NavigationFeedbackPluginKey } from '../types';

const NAVIGATION_FEEDBACK_TIMEOUT = new WeakMap<
  BasePlateEditor,
  ReturnType<typeof setTimeout>
>();
const NAVIGATION_FEEDBACK_PULSE = new WeakMap<BasePlateEditor, number>();
const NAVIGATION_FEEDBACK_ATTRIBUTES = [
  'data-nav-cycle',
  'data-nav-highlight',
  'data-nav-pulse',
  'data-nav-target',
] as const;

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

const getNavigationElement = (
  editor: BasePlateEditor,
  target: NavigationFeedbackActiveTarget | { path: number[] }
) => {
  const node = editor.api.node(target.path)?.[0];

  if (!node) return;

  try {
    const domApi = (
      editor.api as {
        dom?: {
          assertDOMNode?: (node: unknown) => HTMLElement;
          resolveDOMNode?: (node: unknown) => HTMLElement | null | undefined;
        };
        toDOMNode?: (node: unknown) => HTMLElement;
      }
    ).dom;

    return (
      domApi?.resolveDOMNode?.(node) ??
      domApi?.assertDOMNode?.(node) ??
      (
        editor.api as { toDOMNode?: (node: unknown) => HTMLElement }
      ).toDOMNode?.(node)
    );
  } catch {
    return;
  }
};

const clearNavigationElement = (
  editor: BasePlateEditor,
  target?: NavigationFeedbackActiveTarget | null
) => {
  if (!target) return;

  const element = getNavigationElement(editor, target);

  if (!element) return;

  for (const attribute of NAVIGATION_FEEDBACK_ATTRIBUTES) {
    element.removeAttribute(attribute);
  }

  element.style.removeProperty('--plate-nav-feedback-duration');
};

const setNavigationElement = (
  editor: BasePlateEditor,
  target: NavigationFeedbackActiveTarget
) => {
  const element = getNavigationElement(editor, target);

  if (!element) return;

  element.setAttribute('data-nav-cycle', String(target.cycle));
  element.setAttribute('data-nav-highlight', target.variant);
  element.setAttribute('data-nav-pulse', String(target.pulse));
  element.setAttribute('data-nav-target', 'true');
  element.style.setProperty(
    '--plate-nav-feedback-duration',
    `${target.duration}ms`
  );
};

const clearNavigationTimeout = (editor: BasePlateEditor) => {
  const timeoutId = NAVIGATION_FEEDBACK_TIMEOUT.get(editor);

  if (timeoutId) {
    clearTimeout(timeoutId);
    NAVIGATION_FEEDBACK_TIMEOUT.delete(editor);
  }
};

const nextPulse = (editor: BasePlateEditor) => {
  const pulse = (NAVIGATION_FEEDBACK_PULSE.get(editor) ?? 0) + 1;

  NAVIGATION_FEEDBACK_PULSE.set(editor, pulse);

  return pulse;
};

const redecorateNavigationFeedback = (editor: BasePlateEditor) => {
  const redecorate = (editor.api as { redecorate?: unknown }).redecorate;

  if (typeof redecorate === 'function') {
    redecorate();
  }
};

export const clearNavigationFeedbackTarget = (
  editor: BasePlateEditor,
  pulse?: number
) => {
  const storedTarget = editor.getOption(
    NavigationFeedbackPluginKey,
    'activeTarget'
  );
  const activeTarget = resolveNavigationFeedbackTarget(storedTarget);

  if (!storedTarget) return false;
  if (pulse !== undefined && storedTarget.pulse !== pulse) return false;

  clearNavigationTimeout(editor);
  clearNavigationElement(editor, activeTarget);
  clearNavigationPathRef(storedTarget);
  editor.setOption(NavigationFeedbackPluginKey, 'activeTarget', null);
  redecorateNavigationFeedback(editor);

  return true;
};

export const flashTarget = (
  editor: BasePlateEditor,
  { duration, target, variant = 'navigated' }: NavigationFlashTargetOptions
) => {
  if (!editor.api.node(target.path)) return false;

  const pulse = nextPulse(editor);
  const timeoutMs =
    duration ??
    editor.getOption(NavigationFeedbackPluginKey, 'duration') ??
    800;
  const previousTarget = editor.getOption(
    NavigationFeedbackPluginKey,
    'activeTarget'
  );

  clearNavigationTimeout(editor);
  clearNavigationElement(
    editor,
    resolveNavigationFeedbackTarget(previousTarget)
  );
  clearNavigationPathRef(previousTarget);

  const pathRef = editor.api.pathRef(target.path);

  const activeTarget = {
    cycle: (pulse % 2) as 0 | 1,
    duration: timeoutMs,
    pathRef,
    pulse,
    type: target.type,
    variant,
  };

  editor.setOption(NavigationFeedbackPluginKey, 'activeTarget', activeTarget);
  redecorateNavigationFeedback(editor);
  setNavigationElement(
    editor,
    resolveNavigationFeedbackTarget(activeTarget) ?? {
      cycle: activeTarget.cycle,
      duration: activeTarget.duration,
      path: target.path,
      pulse: activeTarget.pulse,
      type: activeTarget.type,
      variant: activeTarget.variant,
    }
  );

  const timeoutId = setTimeout(() => {
    clearNavigationFeedbackTarget(editor, pulse);
  }, timeoutMs);

  NAVIGATION_FEEDBACK_TIMEOUT.set(editor, timeoutId);

  return true;
};
