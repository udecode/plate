export enum MarkCommand {
  ADD_MARK = 'add_mark',
  REMOVE_MARK = 'remove_mark',
  TOGGLE_MARK = 'toggle_mark',
}

export interface OnKeyDownMarkOptions {
  mark: string;
  hotkey: string;
}
