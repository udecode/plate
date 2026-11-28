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

export type SinkEmojiPick = {
  emoji: string;
  label: string;
};

export type SinkIconName =
  | 'baseline'
  | 'bold'
  | 'check'
  | 'chevronRight'
  | 'code'
  | 'copy'
  | 'heading1'
  | 'highlighter'
  | 'italic'
  | 'lightbulb'
  | 'list'
  | 'listPlus'
  | 'paintBucket'
  | 'penLine'
  | 'pilcrow'
  | 'quote'
  | 'radical'
  | 'sparkles'
  | 'strikethrough'
  | 'table'
  | 'underline'
  | 'wand'
  | 'wandSparkles'
  | 'x';

export type SinkSurface = {
  badge: string;
  badgeDefault: string;
  badgeOutline: string;
  badgeSecondary: string;
  card: string;
  menuContent: string;
  menuItem: string;
  menuLabel: string;
  menuSeparator: string;
  menuShortcut: string;
  menuSubContent: string;
  menuSubTrigger: string;
  popover: string;
};

export type SinkKit = {
  AIToolbarButton: React.ComponentType<{
    children?: React.ReactNode;
    tooltip?: React.ReactNode;
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
  boardPlugins: readonly PluginReference[];
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
  Icon: React.ComponentType<{
    className?: string;
    name: SinkIconName;
  }>;
  inkPlugins: readonly PluginReference[];
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
  InsertToolbarButton: React.ComponentType;
  LinkToolbarButton: React.ComponentType;
  lintPlugins: readonly PluginReference[];
  MarkToolbarButton: React.ComponentType<{
    children?: React.ReactNode;
    plugin: BooleanMarkPlugin;
    tooltip?: React.ReactNode;
  }>;
  ModeToolbarButton: React.ComponentType;
  RedoToolbarButton: React.ComponentType;
  Separator: React.ComponentType<{
    className?: string;
    orientation?: 'horizontal' | 'vertical';
  }>;
  suggestionPlugins: readonly PluginReference[];
  surface: SinkSurface;
  TableToolbarButton: React.ComponentType;
  TodoListToolbarButton: React.ComponentType;
  Toggle: React.ComponentType<{
    'aria-label'?: string;
    children?: React.ReactNode;
    className?: string;
    defaultPressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
    pressed?: boolean;
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
