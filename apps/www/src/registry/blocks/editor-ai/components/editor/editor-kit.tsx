'use client';

import { type Value, TrailingBlockPlugin } from 'platejs';
import { type TPlateEditor, useEditorRef } from 'platejs/react';

import { AIKit } from '@/registry/components/editor/plugins/ai-kit';
import { AlignKit } from '@/registry/components/editor/plugins/align-kit';
import { AutoformatKit } from '@/registry/components/editor/plugins/autoformat-kit';
import { BasicBlocksKit } from '@/registry/components/editor/plugins/basic-blocks-kit';
import { BasicMarksKit } from '@/registry/components/editor/plugins/basic-marks-kit';
import { BlockMenuKit } from '@/registry/components/editor/plugins/block-menu-kit';
import { BlockPlaceholderKit } from '@/registry/components/editor/plugins/block-placeholder-kit';
import { CalloutKit } from '@/registry/components/editor/plugins/callout-kit';
import { CodeBlockKit } from '@/registry/components/editor/plugins/code-block-kit';
import { ColumnKit } from '@/registry/components/editor/plugins/column-kit';
import { CommentKit } from '@/registry/components/editor/plugins/comment-kit';
import { CopilotKit } from '@/registry/components/editor/plugins/copilot-kit';
import { CursorOverlayKit } from '@/registry/components/editor/plugins/cursor-overlay-kit';
import { DateKit } from '@/registry/components/editor/plugins/date-kit';
import { DiscussionKit } from '@/registry/components/editor/plugins/discussion-kit';
import { DndKit } from '@/registry/components/editor/plugins/dnd-kit';
import { DocxKit } from '@/registry/components/editor/plugins/docx-kit';
import { EmojiKit } from '@/registry/components/editor/plugins/emoji-kit';
import { ExitBreakKit } from '@/registry/components/editor/plugins/exit-break-kit';
import { FixedToolbarKit } from '@/registry/components/editor/plugins/fixed-toolbar-kit';
import { FloatingToolbarKit } from '@/registry/components/editor/plugins/floating-toolbar-kit';
import { FontKit } from '@/registry/components/editor/plugins/font-kit';
import { LineHeightKit } from '@/registry/components/editor/plugins/line-height-kit';
import { LinkKit } from '@/registry/components/editor/plugins/link-kit';
import { ListKit } from '@/registry/components/editor/plugins/list-kit';
import { MarkdownKit } from '@/registry/components/editor/plugins/markdown-kit';
import { MathKit } from '@/registry/components/editor/plugins/math-kit';
import { MediaKit } from '@/registry/components/editor/plugins/media-kit';
import { MentionKit } from '@/registry/components/editor/plugins/mention-kit';
import { SlashKit } from '@/registry/components/editor/plugins/slash-kit';
import { SuggestionKit } from '@/registry/components/editor/plugins/suggestion-kit';
import { TableKit } from '@/registry/components/editor/plugins/table-kit';
import { TocKit } from '@/registry/components/editor/plugins/toc-kit';
import { ToggleKit } from '@/registry/components/editor/plugins/toggle-kit';

export const EditorKit = [
  ...CopilotKit,
  ...AIKit,

  // Elements
  ...BasicBlocksKit,
  ...CodeBlockKit,
  ...TableKit,
  ...ToggleKit,
  ...TocKit,
  ...MediaKit,
  ...CalloutKit,
  ...ColumnKit,
  ...MathKit,
  ...DateKit,
  ...LinkKit,
  ...MentionKit,

  // Marks
  ...BasicMarksKit,
  ...FontKit,

  // Block Style
  ...ListKit,
  ...AlignKit,
  ...LineHeightKit,

  // Collaboration
  ...DiscussionKit,
  ...CommentKit,
  ...SuggestionKit,

  // Editing
  ...SlashKit,
  ...AutoformatKit,
  ...CursorOverlayKit,
  ...BlockMenuKit,
  ...DndKit,
  ...EmojiKit,
  ...ExitBreakKit,
  TrailingBlockPlugin,

  // Parsers
  ...DocxKit,
  ...MarkdownKit,

  // UI
  ...BlockPlaceholderKit,
  ...FixedToolbarKit,
  ...FloatingToolbarKit,
];

export type MyEditor = TPlateEditor<Value, (typeof EditorKit)[number]>;

export const useEditor = () => useEditorRef<MyEditor>();
