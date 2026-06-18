import { Hotkeys } from '@platejs/slate-dom';

export type HistoryDirection = 'redo' | 'undo';

export const getHistoryDirectionFromNativeEvent = (
  event: KeyboardEvent
): HistoryDirection | null => {
  if (Hotkeys.isRedo(event)) {
    return 'redo';
  }
  if (Hotkeys.isUndo(event)) {
    return 'undo';
  }

  return null;
};
