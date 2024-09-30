import type { Action } from '@udecode/plate-menu';

export interface AIActions {
  CursorCommandsActions: Record<string, Action>;
  CursorSuggestionActions: Record<string, Action>;
  SelectionCommandsActions: Record<string, Action>;
  SelectionSuggestionActions: Record<string, Action>;
}

export interface AICommands {
  CursorCommands: React.FC;
  CursorSuggestions: React.FC;
  SelectionCommands: React.FC;
  SelectionSuggestions: React.FC;
}
