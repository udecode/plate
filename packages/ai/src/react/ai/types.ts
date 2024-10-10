export interface AIActions {
  CursorCommandsActions: Record<string, any>;
  CursorSuggestionActions: Record<string, any>;
  SelectionCommandsActions: Record<string, any>;
  SelectionSuggestionActions: Record<string, any>;
}

export interface AICommands {
  CursorCommands: React.FC;
  CursorSuggestions: React.FC;
  SelectionCommands: React.FC;
  SelectionSuggestions: React.FC;
}
