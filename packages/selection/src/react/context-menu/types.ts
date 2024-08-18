export type CommandItem = {
  shortcut?: string;
  title: string;
  value: string;
};

export interface Menu {
  heading: string;
  items: CommandItem[];
}

export const ACTION_DELETE = 'context_menu_delete';

export const ACTION_COPY = 'context_menu_copy';
