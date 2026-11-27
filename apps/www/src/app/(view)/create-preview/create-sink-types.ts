import type { PluginReference } from 'platejs';
import type {
  BoldPlugin,
  CodePlugin,
  FontBackgroundColorPlugin,
  FontColorPlugin,
  HighlightPlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from 'platejs/react';
import type * as React from 'react';

export type BooleanMarkPlugin =
  | typeof BoldPlugin
  | typeof CodePlugin
  | typeof HighlightPlugin
  | typeof ItalicPlugin
  | typeof StrikethroughPlugin
  | typeof UnderlinePlugin;

export type SinkColorOption = {
  isBrightColor: boolean;
  name: string;
  value: string;
};

export type SinkSelectItem = {
  url?: string;
  value: string;
};

export type CreateSinkKit = {
  AIToolbarButton: React.ComponentType<{
    children?: React.ReactNode;
    tooltip?: React.ReactNode;
  }>;
  AlertDialog: React.ComponentType<{
    children?: React.ReactNode;
    onOpenChange?: (open: boolean) => void;
    open?: boolean;
  }>;
  AlertDialogAction: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }>;
  AlertDialogCancel: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }>;
  AlertDialogContent: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
    size?: 'default' | 'sm';
  }>;
  AlertDialogDescription: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  AlertDialogFooter: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  AlertDialogHeader: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  AlertDialogTitle: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  AlignToolbarButton: React.ComponentType;
  Avatar: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
    size?: 'default' | 'lg' | 'sm';
  }>;
  AvatarFallback: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  AvatarGroup: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  BulletedListToolbarButton: React.ComponentType;
  Button: React.ComponentType<{
    'aria-label'?: string;
    children?: React.ReactNode;
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
    size?:
      | 'default'
      | 'icon'
      | 'icon-lg'
      | 'icon-sm'
      | 'icon-xs'
      | 'lg'
      | 'sm'
      | 'xs';
    type?: 'button' | 'reset' | 'submit';
    variant?:
      | 'default'
      | 'destructive'
      | 'ghost'
      | 'link'
      | 'outline'
      | 'secondary';
  }>;
  calloutDetailsPlugins: readonly PluginReference[];
  Checkbox: React.ComponentType<{
    className?: string;
    defaultChecked?: boolean;
    id?: string;
  }>;
  codePlugins: readonly PluginReference[];
  columnTocPlugins: readonly PluginReference[];
  Command: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  CommandEmpty: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  CommandGroup: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
    heading?: React.ReactNode;
  }>;
  CommandInput: React.ComponentType<{
    className?: string;
    placeholder?: string;
  }>;
  CommandItem: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
    onSelect?: (value: string) => void;
    value?: string;
  }>;
  CommandList: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  CommandShortcut: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  CommentToolbarButton: React.ComponentType;
  defaultColors: readonly SinkColorOption[];
  Dialog: React.ComponentType<{
    children?: React.ReactNode;
    onOpenChange?: (open: boolean) => void;
    open?: boolean;
  }>;
  DialogContent: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  DialogDescription: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  DialogFooter: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  DialogHeader: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  DialogTitle: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  docPlugins: readonly PluginReference[];
  Editor: React.ComponentType<{
    className?: string;
    variant?: 'default' | 'demo' | 'fullWidth' | 'none' | 'select';
  }>;
  FixedToolbar: React.ComponentType<
    React.PropsWithChildren<{ className?: string }>
  >;
  FontColorToolbarButton: React.ComponentType<{
    children: React.ReactNode;
    colors: readonly SinkColorOption[];
    plugin: typeof FontBackgroundColorPlugin | typeof FontColorPlugin;
    tooltip?: string;
  }>;
  FontSizeToolbarButton: React.ComponentType;
  footnotePlugins: readonly PluginReference[];
  Input: React.ComponentType<{
    'aria-label'?: string;
    className?: string;
    id?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
    placeholder?: string;
    type?: string;
    value?: string;
  }>;
  InputGroup: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  InputGroupAddon: React.ComponentType<{
    align?: 'block-end' | 'block-start' | 'inline-end' | 'inline-start';
    children?: React.ReactNode;
    className?: string;
  }>;
  InputGroupInput: React.ComponentType<{
    'aria-label'?: string;
    className?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    placeholder?: string;
    value?: string;
  }>;
  InputGroupText: React.ComponentType<{
    children?: React.ReactNode;
    className?: string;
  }>;
  InsertToolbarButton: React.ComponentType;
  LinkToolbarButton: React.ComponentType;
  MarkToolbarButton: React.ComponentType<{
    children?: React.ReactNode;
    plugin: BooleanMarkPlugin;
    tooltip?: React.ReactNode;
  }>;
  mathPlugins: readonly PluginReference[];
  mediaPlugins: readonly PluginReference[];
  ModeToolbarButton: React.ComponentType;
  RedoToolbarButton: React.ComponentType;
  SelectEditor: React.ComponentType<{
    className?: string;
    defaultValue?: readonly SinkSelectItem[];
    items?: readonly SinkSelectItem[];
    placeholder?: string;
  }>;
  Separator: React.ComponentType<{
    className?: string;
    orientation?: 'horizontal' | 'vertical';
  }>;
  suggestionPlugins: readonly PluginReference[];
  tablePlugins: readonly PluginReference[];
  TableToolbarButton: React.ComponentType;
  Textarea: React.ComponentType<{
    'aria-label'?: string;
    className?: string;
    id?: string;
    onChange?: React.ChangeEventHandler<HTMLTextAreaElement>;
    placeholder?: string;
    value?: string;
  }>;
  TodoListToolbarButton: React.ComponentType;
  Toggle: React.ComponentType<{
    'aria-label'?: string;
    children?: React.ReactNode;
    className?: string;
    defaultPressed?: boolean;
    size?: 'default' | 'lg' | 'sm';
    variant?: 'default' | 'outline';
  }>;
  Toolbar: React.ComponentType<React.PropsWithChildren<{ className?: string }>>;
  ToolbarGroup: React.ComponentType<
    React.PropsWithChildren<{ className?: string }>
  >;
  TooltipProvider: React.ComponentType<{ children: React.ReactNode }>;
  TurnIntoToolbarButton: React.ComponentType;
  UndoToolbarButton: React.ComponentType;
};
