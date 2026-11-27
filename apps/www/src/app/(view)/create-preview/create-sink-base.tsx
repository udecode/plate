'use client';

import { CommentsPlugin } from 'platejs/comments/react';
import { InkContent, InkPlugin } from 'platejs/ink/react';

import { AIToolbarButton } from '@/__registry__/create-preview/base/editor-ai/components/editor/ai-toolbar-button';
import { AlignToolbarButton } from '@/__registry__/create-preview/base/editor-ai/components/editor/align-toolbar-button';
import { BasicBlocksKit } from '@/__registry__/create-preview/base/editor-ai/components/editor/basic-blocks';
import { BasicMarksKit } from '@/__registry__/create-preview/base/editor-ai/components/editor/basic-marks';
import { CalloutKit } from '@/__registry__/create-preview/base/editor-ai/components/editor/callout';
import { CodeBlockKit } from '@/__registry__/create-preview/base/editor-ai/components/editor/code-block';
import { ColumnKit } from '@/__registry__/create-preview/base/editor-ai/components/editor/column';
import { CommentToolbarButton } from '@/__registry__/create-preview/base/editor-ai/components/editor/comment-toolbar-button';
import { DetailsKit } from '@/__registry__/create-preview/base/editor-ai/components/editor/details';
import { DiscussionKit } from '@/__registry__/create-preview/base/editor-ai/components/editor/discussion';
import { Editor } from '@/__registry__/create-preview/base/editor-ai/components/editor/editor';
import { FixedToolbar } from '@/__registry__/create-preview/base/editor-ai/components/editor/fixed-toolbar';
import {
  DEFAULT_COLORS,
  FontColorToolbarButton,
} from '@/__registry__/create-preview/base/editor-ai/components/editor/font-color-toolbar-button';
import { FontSizeToolbarButton } from '@/__registry__/create-preview/base/editor-ai/components/editor/font-size-toolbar-button';
import { FootnoteKit } from '@/__registry__/create-preview/base/editor-ai/components/editor/footnote';
import {
  RedoToolbarButton,
  UndoToolbarButton,
} from '@/__registry__/create-preview/base/editor-ai/components/editor/history-toolbar-button';
import { InsertToolbarButton } from '@/__registry__/create-preview/base/editor-ai/components/editor/insert-toolbar-button';
import { LinkToolbarButton } from '@/__registry__/create-preview/base/editor-ai/components/editor/link-toolbar-button';
import {
  BulletedListToolbarButton,
  TodoListToolbarButton,
} from '@/__registry__/create-preview/base/editor-ai/components/editor/list-toolbar-button';
import { MarkToolbarButton } from '@/__registry__/create-preview/base/editor-ai/components/editor/mark-toolbar-button';
import { MathKit } from '@/__registry__/create-preview/base/editor-ai/components/editor/math';
import { MediaKit } from '@/__registry__/create-preview/base/editor-ai/components/editor/media';
import { ModeToolbarButton } from '@/__registry__/create-preview/base/editor-ai/components/editor/mode-toolbar-button';
import { EditorKit } from '@/__registry__/create-preview/base/editor-ai/components/editor/plugins';
import { SuggestionKit } from '@/__registry__/create-preview/base/editor-ai/components/editor/suggestion';
import { TableKit } from '@/__registry__/create-preview/base/editor-ai/components/editor/table';
import { TableToolbarButton } from '@/__registry__/create-preview/base/editor-ai/components/editor/table-toolbar-button';
import { TocKit } from '@/__registry__/create-preview/base/editor-ai/components/editor/toc';
import {
  Toolbar,
  ToolbarGroup,
} from '@/__registry__/create-preview/base/editor-ai/components/editor/toolbar';
import { TurnIntoToolbarButton } from '@/__registry__/create-preview/base/editor-ai/components/editor/turn-into-toolbar-button';
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
} from '@/__registry__/create-preview/base/editor-ai/components/ui/avatar';
import { Button } from '@/__registry__/create-preview/base/editor-ai/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/__registry__/create-preview/base/editor-ai/components/ui/command';
import { Input } from '@/__registry__/create-preview/base/editor-ai/components/ui/input';
import { Separator } from '@/__registry__/create-preview/base/editor-ai/components/ui/separator';
import { Toggle } from '@/__registry__/create-preview/base/editor-ai/components/ui/toggle';
import { TooltipProvider } from '@/__registry__/create-preview/base/editor-ai/components/ui/tooltip';
import {
  resolveEmojiData,
  useEmojiSearch,
} from '@/__registry__/create-preview/base/editor-ai/lib/emoji-data';
import { SelectEditor } from '@/__registry__/create-preview/base/editor-select/components/editor/select-editor';
import { BoardKit } from '@/registry/components/editor/board';
import { LintKit } from '@/registry/components/editor/lint';

import { CreateSink, type CreateSinkKit } from './create-sink';

const BASE_SINK_KIT: CreateSinkKit = {
  AIToolbarButton,
  AlignToolbarButton,
  Avatar,
  AvatarFallback,
  AvatarGroup,
  boardPlugins: [...BasicBlocksKit, ...BasicMarksKit, ...BoardKit],
  BulletedListToolbarButton,
  Button,
  calloutDetailsPlugins: [...BasicMarksKit, ...CalloutKit, ...DetailsKit],
  codePlugins: [...CodeBlockKit],
  columnTocPlugins: [
    ...BasicBlocksKit,
    ...BasicMarksKit,
    ...ColumnKit,
    ...TocKit,
  ],
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
  footnotePlugins: [...BasicMarksKit, ...FootnoteKit],
  inkPlugins: [
    ...BasicMarksKit,
    InkPlugin.configure({ slots: { wrapContent: InkContent } }),
  ],
  Input,
  InsertToolbarButton,
  lintPlugins: [...BasicMarksKit, ...LintKit],
  LinkToolbarButton,
  MarkToolbarButton,
  mathPlugins: [...BasicMarksKit, ...MathKit],
  mediaPlugins: [...BasicMarksKit, ...MediaKit],
  ModeToolbarButton,
  RedoToolbarButton,
  resolveEmojiData,
  SelectEditor,
  Separator,
  suggestionPlugins: [...SuggestionKit],
  tablePlugins: [...BasicMarksKit, ...TableKit],
  TableToolbarButton,
  TodoListToolbarButton,
  Toggle,
  Toolbar,
  ToolbarGroup,
  TooltipProvider,
  TurnIntoToolbarButton,
  UndoToolbarButton,
  useEmojiSearch,
};

export default function CreateSinkBase() {
  return <CreateSink kit={BASE_SINK_KIT} />;
}
