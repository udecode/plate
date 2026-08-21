import type { CompiledPlateShortcut } from '../../internal/plugin/compilePlateShortcuts';
import type { PlateEditor } from '../editor/PlateEditor';

const isScopeActive = (
  activeScopes: readonly string[],
  scopes: readonly string[] | string | undefined
) => {
  if (!scopes || activeScopes.length === 0) return true;
  const requiredScopes = typeof scopes === 'string' ? [scopes] : scopes;
  const activeScopeSet = new Set(activeScopes);

  return (
    activeScopeSet.has('*') ||
    requiredScopes.some((scope) => activeScopeSet.has(scope))
  );
};

const isFormTargetEnabled = (
  event: KeyboardEvent,
  enabled: boolean | readonly string[] | undefined
) => {
  const target = event.target;

  if (!target || typeof target !== 'object' || !('tagName' in target)) {
    return true;
  }

  const tagName = String(target.tagName).toUpperCase();

  if (!['INPUT', 'SELECT', 'TEXTAREA'].includes(tagName)) return true;
  if (Array.isArray(enabled)) {
    return enabled.some((tag) => tag.toUpperCase() === tagName);
  }

  return enabled === true;
};

const isContentEditableTarget = (event: KeyboardEvent) => {
  const target = event.target;

  return (
    !!target &&
    typeof target === 'object' &&
    'isContentEditable' in target &&
    target.isContentEditable === true
  );
};

const isTriggerEnabled = (
  trigger: CompiledPlateShortcut['shortcut']['enabled'],
  event: KeyboardEvent,
  eventDetails: NonNullable<ReturnType<CompiledPlateShortcut['match']>>
) =>
  typeof trigger === 'function'
    ? trigger(event, eventDetails)
    : trigger !== false;

export const dispatchPlateShortcut = (
  activeScopes: readonly string[],
  editor: PlateEditor,
  event: KeyboardEvent,
  phase: 'keydown' | 'keyup',
  shortcutTable: readonly CompiledPlateShortcut[]
) => {
  for (const compiled of shortcutTable) {
    if (!compiled[phase]) continue;
    const { shortcut } = compiled;

    if ((shortcut.ignoreEventWhenPrevented ?? true) && event.defaultPrevented) {
      continue;
    }
    if (!isScopeActive(activeScopes, shortcut.scopes)) continue;
    if (
      isContentEditableTarget(event) &&
      shortcut.enableOnContentEditable === false
    ) {
      continue;
    }
    if (
      !isFormTargetEnabled(
        event,
        shortcut.enableOnFormTags as boolean | readonly string[] | undefined
      )
    ) {
      continue;
    }
    if (shortcut.ignoreEventWhen?.(event)) continue;

    const eventDetails = compiled.match(event);

    if (
      !eventDetails ||
      !isTriggerEnabled(shortcut.enabled, event, eventDetails)
    ) {
      continue;
    }

    const handled =
      shortcut.handler?.({ editor, event, eventDetails }) !== false;

    if (!handled) continue;

    if (shortcut.preventDefault === undefined) {
      event.preventDefault();
      event.stopPropagation();
    } else if (
      typeof shortcut.preventDefault === 'function'
        ? shortcut.preventDefault(event, eventDetails)
        : shortcut.preventDefault
    ) {
      event.preventDefault();
    }

    return true;
  }

  return false;
};
