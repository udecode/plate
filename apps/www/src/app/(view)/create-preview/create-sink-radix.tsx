'use client';

import { CommentsPlugin } from 'platejs/comments/react';

import { AIToolbarButton } from '@/__registry__/create-preview/radix/editor-ai/components/editor/ai-toolbar-button';
import { AlignToolbarButton } from '@/__registry__/create-preview/radix/editor-ai/components/editor/align-toolbar-button';
import { BasicMarksKit } from '@/__registry__/create-preview/radix/editor-ai/components/editor/basic-marks';
import { CodeBlockKit } from '@/__registry__/create-preview/radix/editor-ai/components/editor/code-block';
import { CommentToolbarButton } from '@/__registry__/create-preview/radix/editor-ai/components/editor/comment-toolbar-button';
import { DiscussionKit } from '@/__registry__/create-preview/radix/editor-ai/components/editor/discussion';
import { Editor } from '@/__registry__/create-preview/radix/editor-ai/components/editor/editor';
import { FixedToolbar } from '@/__registry__/create-preview/radix/editor-ai/components/editor/fixed-toolbar';
import {
  DEFAULT_COLORS,
  FontColorToolbarButton,
} from '@/__registry__/create-preview/radix/editor-ai/components/editor/font-color-toolbar-button';
import { FontSizeToolbarButton } from '@/__registry__/create-preview/radix/editor-ai/components/editor/font-size-toolbar-button';
import {
  RedoToolbarButton,
  UndoToolbarButton,
} from '@/__registry__/create-preview/radix/editor-ai/components/editor/history-toolbar-button';
import { InsertToolbarButton } from '@/__registry__/create-preview/radix/editor-ai/components/editor/insert-toolbar-button';
import { LinkToolbarButton } from '@/__registry__/create-preview/radix/editor-ai/components/editor/link-toolbar-button';
import {
  BulletedListToolbarButton,
  TodoListToolbarButton,
} from '@/__registry__/create-preview/radix/editor-ai/components/editor/list-toolbar-button';
import { MarkToolbarButton } from '@/__registry__/create-preview/radix/editor-ai/components/editor/mark-toolbar-button';
import { ModeToolbarButton } from '@/__registry__/create-preview/radix/editor-ai/components/editor/mode-toolbar-button';
import { EditorKit } from '@/__registry__/create-preview/radix/editor-ai/components/editor/plugins';
import { SuggestionKit } from '@/__registry__/create-preview/radix/editor-ai/components/editor/suggestion';
import { TableKit } from '@/__registry__/create-preview/radix/editor-ai/components/editor/table';
import { TableToolbarButton } from '@/__registry__/create-preview/radix/editor-ai/components/editor/table-toolbar-button';
import {
  Toolbar,
  ToolbarGroup,
} from '@/__registry__/create-preview/radix/editor-ai/components/editor/toolbar';
import { TurnIntoToolbarButton } from '@/__registry__/create-preview/radix/editor-ai/components/editor/turn-into-toolbar-button';
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
} from '@/__registry__/create-preview/radix/editor-ai/components/ui/avatar';
import { Button } from '@/__registry__/create-preview/radix/editor-ai/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/__registry__/create-preview/radix/editor-ai/components/ui/command';
import { Input } from '@/__registry__/create-preview/radix/editor-ai/components/ui/input';
import { Separator } from '@/__registry__/create-preview/radix/editor-ai/components/ui/separator';
import { TooltipProvider } from '@/__registry__/create-preview/radix/editor-ai/components/ui/tooltip';

import { CreateSink, type CreateSinkKit } from './create-sink';

const RADIX_SINK_KIT: CreateSinkKit = {
  AIToolbarButton,
  AlignToolbarButton,
  Avatar,
  AvatarFallback,
  AvatarGroup,
  BulletedListToolbarButton,
  Button,
  codePlugins: [...CodeBlockKit],
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
  CommentToolbarButton,
  defaultColors: DEFAULT_COLORS,
  docPlugins: [
    ...EditorKit.filter(
      (plugin) =>
        plugin.name !== 'fixedToolbar' && plugin.name !== 'floatingToolbar'
    ),
    ...DiscussionKit,
    CommentsPlugin,
  ],
  Editor,
  FixedToolbar,
  FontColorToolbarButton,
  FontSizeToolbarButton,
  Input,
  InsertToolbarButton,
  LinkToolbarButton,
  MarkToolbarButton,
  ModeToolbarButton,
  RedoToolbarButton,
  Separator,
  suggestionPlugins: [...SuggestionKit],
  tablePlugins: [...BasicMarksKit, ...TableKit],
  TableToolbarButton,
  TodoListToolbarButton,
  Toolbar,
  ToolbarGroup,
  TooltipProvider,
  TurnIntoToolbarButton,
  UndoToolbarButton,
};

export default function CreateSinkRadix() {
  return <CreateSink kit={RADIX_SINK_KIT} />;
}
