import type { CompiledPlateShortcut } from '../../internal/plugin/compilePlateShortcuts';
import type { Editor } from '../../lib/editor';

export const isImeConfirmKeyEvent = (event: KeyboardEvent) =>
  event.isComposing ||
  // oxlint-disable-next-line typescript/no-deprecated -- WebKit sends the IME confirmation Enter after compositionend with only this code.
  event.keyCode === 229;

export const dispatchPlateShortcut = (
  editor: Editor,
  event: KeyboardEvent,
  shortcutTable: readonly CompiledPlateShortcut[]
) => {
  if (isImeConfirmKeyEvent(event)) return false;

  for (const { handler, match } of shortcutTable) {
    if (event.defaultPrevented) return false;
    if (!match(event)) continue;
    if (handler({ editor, event }) === false) continue;

    event.preventDefault();
    event.stopPropagation();

    return true;
  }

  return false;
};
